// portfolio/tools/analytics-pull.ts — pull the view counts Cloudflare Web Analytics has collected
// into .cache/analytics.json, for src/analytics.ts to bake into the status bar at export time.
//
//   bun run analytics:pull          # write .cache/analytics.json (needs the two env vars below)
//   bun run analytics:pull --probe  # print the LIVE GraphQL schema for the RUM dataset and exit
//
// Env (both supplied by CI, neither committed):
//   CF_ACCOUNT_ID       the Cloudflare account tag
//   CF_ANALYTICS_TOKEN  an API token with Account → Account Analytics → Read. A REAL SECRET, unlike
//                       the public beacon token in src/seo.ts: anyone holding it can read the
//                       account's analytics, so it lives in GitHub Secrets and never in the repo.
//
// A FAILED PULL KEEPS THE LAST NUMBERS RATHER THAN BLANKING THE BAR. The Cloudflare GraphQL call is
// a slow third party, and on 2026-11-08 the daily deploy timed out at the old 20s cap and shipped a
// site whose status bar had no counts at all. Two changes answer that: the attempt now gets 60s and
// one retry, and a pull that still fails falls back to the snapshot the previous deploy published at
// /analytics.json. The bar already dates what it shows ("as of 11 Aug"), so a kept snapshot is
// honest; a blank bar is the one outcome that loses information the site already had.
//
// Missing env is NOT an error: the script exits 0 having written nothing, so `bun run export` on a
// laptop or a fork still succeeds and simply renders no numbers. The counts are a nicety; they must
// never be able to cost a deploy. Every failure path below follows the same rule.
//
// --probe exists because the RUM dataset's exact field names are not in Cloudflare's published
// docs. Run it once with a real token and it prints what the schema actually offers, so the query
// below can be corrected against reality instead of guessed at.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseAnalytics, type AnalyticsData } from "../src/analytics.ts";
import { canonicalPath, SITE } from "../src/seo.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", ".cache", "analytics.json");
const ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";

const ACCOUNT = Bun.env.CF_ACCOUNT_ID?.trim();
const TOKEN = Bun.env.CF_ANALYTICS_TOKEN?.trim();

// How far back to count. The site's analytics began 2026-08-11 (the deploy that added the beacon);
// asking for more than Cloudflare retains simply returns what it has.
const SINCE = Bun.env.CF_ANALYTICS_SINCE?.trim() || "2026-08-11T00:00:00Z";

// Give up rather than hang a deploy on a slow third party. 60s, because the query that groups every
// path over three months is the slow one and 20s was measured cutting it off mid-response; the
// deploy can afford a minute far more easily than it can afford a bar with no numbers.
const TIMEOUT_MS = 60_000;

// One retry, not a loop: a single bad window at Cloudflare is the common case, and a deploy that
// waits two minutes to render nothing anyway is worse than one that falls back.
const ATTEMPTS = 2;
const RETRY_DELAY_MS = 2_000;

// The fallback read is a plain file over the CDN, not a query. It gets a shorter rope than the
// GraphQL call, so a site that is itself down cannot add another minute to the deploy.
const SNAPSHOT_TIMEOUT_MS = 15_000;

async function graphql(query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const body = await res.json() as { data?: unknown; errors?: { message: string }[] };
  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join("; "));
  return body.data;
}

// --probe: ask the API what the RUM dataset actually looks like. Prints the dimension + metric
// field names so the query below can be matched to the real schema in one step.
async function probe() {
  const data = await graphql(`
    query Probe {
      __type(name: "AccountRumPageloadEventsAdaptiveGroups") {
        fields { name description
          type { name kind ofType { name kind } }
        }
      }
      dims: __type(name: "AccountRumPageloadEventsAdaptiveGroupsDimensions") {
        fields { name description }
      }
    }
  `) as any;
  console.log(JSON.stringify(data, null, 2));

  // What scoping values actually exist on this account. Printed because guessing a filter value is
  // how the siteTag attempt silently returned zero rows: a filter that matches nothing looks
  // exactly like a site with no traffic.
  try {
    const scopes = await graphql(`
      query Scopes($account: String!, $since: Time!) {
        viewer {
          accounts(filter: { accountTag: $account }) {
            rumPageloadEventsAdaptiveGroups(filter: { datetime_geq: $since }, limit: 50) {
              count
              dimensions { siteTag requestHost }
            }
          }
        }
      }
    `, { account: ACCOUNT, since: SINCE });
    console.log("\n[probe] scoping values present on this account:");
    console.log(JSON.stringify(scopes, null, 2));
  } catch (err) {
    console.log(`[probe] scope listing failed: ${(err as Error).message}`);
  }

  if (!data?.__type && !data?.dims) {
    console.log(
      "\n[probe] Neither type name resolved. The dataset is named differently on this account;\n" +
      "        run an introspection of `viewer.accounts` fields to find it.",
    );
  }
}

// The counts query. Grouped by requestPath, so ONE request returns every page's views plus the
// site total — no per-page fan-out.
// requestHost scopes this to THIS site. Without a scope the query returns the whole ACCOUNT's RUM
// data, so the day a second site is added to Web Analytics its traffic would silently merge into
// the portfolio's numbers.
//
// It filters on the HOST, not on siteTag: siteTag is NOT the public beacon token (filtering by that
// was measured returning 0 rows), and the host is a value this repo already knows for certain —
// SITE.origin in seo.ts, so there is one source of truth and no second env var to keep in sync.
const COUNTS = `
  query Counts($account: String!, $since: Time!, $hosts: [String!]!) {
    viewer {
      accounts(filter: { accountTag: $account }) {
        total: rumPageloadEventsAdaptiveGroups(
          filter: { datetime_geq: $since, requestHost_in: $hosts }
          limit: 1
        ) {
          sum { visits }
          count
        }
        pages: rumPageloadEventsAdaptiveGroups(
          filter: { datetime_geq: $since, requestHost_in: $hosts }
          limit: 5000
          orderBy: [count_DESC]
        ) {
          count
          dimensions { requestPath }
        }
      }
    }
  }
`;

// Every host the site has ever answered at. The site moved from tjakoen.github.io to
// portfolio.tjakoen.com on 2026-11-07, and Cloudflare records each page load under the host it was
// served from, so filtering on the current origin alone silently dropped every visit made before the
// move and the status bar read 0. Older hosts stay in this list for good: their history is real.
export const PAST_HOSTS = ["tjakoen.github.io"];
export function siteHosts(): string[] {
  return [...new Set([new URL(SITE.origin).hostname, ...PAST_HOSTS])];
}

type CountsResponse = {
  viewer?: {
    accounts?: {
      total?: { sum?: { visits?: number }; count?: number }[];
      pages?: { count: number; dimensions: { requestPath: string } }[];
    }[];
  };
};

// Fold the grouped rows into canonical-path → views. Cloudflare reports the path as requested, so
// /notes/x and /notes/x/ can BOTH appear; canonicalPath collapses them the same way seo.ts does,
// and the counts are summed rather than one silently winning.
export function foldPaths(rows: { count: number; dimensions: { requestPath: string } }[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) {
    const path = row.dimensions?.requestPath;
    if (typeof path !== "string" || !path.startsWith("/")) continue;
    const key = canonicalPath(path.split("?")[0]);
    out[key] = (out[key] ?? 0) + row.count;
  }
  return out;
}

function write(data: AnalyticsData) {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2));
}

async function pull(): Promise<AnalyticsData> {
  const data = await graphql(COUNTS, { account: ACCOUNT, since: SINCE, hosts: siteHosts() }) as CountsResponse;
  const account = data?.viewer?.accounts?.[0];
  if (!account) throw new Error("no account in the response — check CF_ACCOUNT_ID and the token's scope");

  const visits = account.total?.[0]?.sum?.visits ?? account.total?.[0]?.count ?? 0;
  const paths = foldPaths(account.pages ?? []);

  // An empty per-page result next to a site total is the shape Cloudflare returned on 2026-11-08
  // ("1,000 visits, 0 paths"), and it is not something a visitor can see or a reader can debug. Log
  // what actually came back, once, so the next run explains itself instead of looking like a site
  // nobody visits.
  if (visits > 0 && Object.keys(paths).length === 0) {
    const rows = account.pages?.length ?? 0;
    console.log(`[analytics] ${visits} visits but ${rows} page rows; first row: ${JSON.stringify(account.pages?.[0] ?? null).slice(0, 300)}`);
  }

  return {
    visits,
    paths,
    pulledAt: new Date().toISOString().slice(0, 10),
  };
}

async function pullWithRetry(): Promise<AnalyticsData> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      return await pull();
    } catch (error) {
      lastError = error;
      if (attempt < ATTEMPTS) {
        console.log(`[analytics] attempt ${attempt} failed (${(error as Error).message}); retrying in ${RETRY_DELAY_MS / 1000}s`);
        await Bun.sleep(RETRY_DELAY_MS);
      }
    }
  }
  throw lastError;
}

// The two places a previous snapshot can come from. The file on disk is the one a laptop keeps
// between runs; the published URL is what a fresh CI checkout has, because that checkout starts with
// no .cache at all and the last deploy put its numbers in dist/analytics.json.
export function localSnapshot(path = OUT): AnalyticsData | null {
  try {
    return parseAnalytics(JSON.parse(readFileSync(path, "utf8")));
  } catch {
    return null;
  }
}

export const SNAPSHOT_URL = new URL("/analytics.json", SITE.origin);

export async function publishedSnapshot(url: URL = SNAPSHOT_URL): Promise<AnalyticsData | null> {
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(SNAPSHOT_TIMEOUT_MS) });
    if (!res.ok) return null;
    return parseAnalytics(await res.json());
  } catch {
    return null;
  }
}

// Do not blank the bar when the numbers are already known. The page dates what it shows, so a kept
// snapshot is honest; the warning is loud because a site that ships the same numbers for a week is
// a deploy that has quietly stopped measuring.
async function keepPrevious(reason: string) {
  const local = localSnapshot();
  if (local) {
    console.log(`[analytics] ${reason}; keeping the snapshot of ${local.pulledAt} already on disk`);
    return;
  }

  const published = await publishedSnapshot();
  if (published) {
    write(published);
    console.log(`[analytics] ${reason}; showing the snapshot published on ${published.pulledAt}`);
    return;
  }

  const message = `${reason}; no previous snapshot exists, so the status bar renders without numbers`;
  // The annotation is for the Actions run, where nobody reads the step log unless it is highlighted.
  // A laptop gets a plain warning rather than a marker GitHub happens to understand.
  console.log(process.env.GITHUB_ACTIONS === "true" ? `::warning::[analytics] ${message}` : `[analytics] WARNING ${message}`);
}

// Only when RUN, never when imported: analytics-pull.test.ts imports foldPaths, and a test run must
// not be able to reach the network — with a token in the environment, a bare top-level call here
// would have `bun test` querying the live API.
if (import.meta.main) {
  const wantsProbe = process.argv.includes("--probe");
  if (!TOKEN || !ACCOUNT) {
    console.log("[analytics] CF_ACCOUNT_ID / CF_ANALYTICS_TOKEN not set — skipping (no numbers will render)");
  } else if (wantsProbe) {
    try {
      await probe();
    } catch (err) {
      console.log(`[analytics] probe failed: ${(err as Error).message}`);
    }
  } else {
    try {
      const data = await pullWithRetry();
      write(data);
      console.log(`[analytics] ${data.visits} visits, ${Object.keys(data.paths).length} paths → ${OUT}`);
    } catch (err) {
      // Deliberately exit 0: a Cloudflare outage, an expired token or a schema drift must degrade to
      // the previous numbers (or to none, never to a failed deploy).
      await keepPrevious(`the pull failed (${(err as Error).message})`);
    }
  }
}
