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
// Missing env is NOT an error: the script exits 0 having written nothing, so `bun run export` on a
// laptop or a fork still succeeds and simply renders no numbers. The counts are a nicety; they must
// never be able to cost a deploy. Every failure path below follows the same rule.
//
// --probe exists because the RUM dataset's exact field names are not in Cloudflare's published
// docs. Run it once with a real token and it prints what the schema actually offers, so the query
// below can be corrected against reality instead of guessed at.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AnalyticsData } from "../src/analytics.ts";
import { canonicalPath, SITE } from "../src/seo.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", ".cache", "analytics.json");
const ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";

const ACCOUNT = Bun.env.CF_ACCOUNT_ID?.trim();
const TOKEN = Bun.env.CF_ANALYTICS_TOKEN?.trim();

// How far back to count. The site's analytics began 2026-08-11 (the deploy that added the beacon);
// asking for more than Cloudflare retains simply returns what it has.
const SINCE = Bun.env.CF_ANALYTICS_SINCE?.trim() || "2026-08-11T00:00:00Z";

// Give up rather than hang a deploy on a slow third party.
const TIMEOUT_MS = 20_000;

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
  query Counts($account: String!, $since: Time!, $host: String!) {
    viewer {
      accounts(filter: { accountTag: $account }) {
        total: rumPageloadEventsAdaptiveGroups(
          filter: { datetime_geq: $since, requestHost: $host }
          limit: 1
        ) {
          sum { visits }
          count
        }
        pages: rumPageloadEventsAdaptiveGroups(
          filter: { datetime_geq: $since, requestHost: $host }
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

async function pull() {
  const host = new URL(SITE.origin).hostname;
  const data = await graphql(COUNTS, { account: ACCOUNT, since: SINCE, host }) as CountsResponse;
  const account = data?.viewer?.accounts?.[0];
  if (!account) throw new Error("no account in the response — check CF_ACCOUNT_ID and the token's scope");

  const visits = account.total?.[0]?.sum?.visits ?? account.total?.[0]?.count ?? 0;
  const paths = foldPaths(account.pages ?? []);
  const out: AnalyticsData = { visits, paths, pulledAt: new Date().toISOString().slice(0, 10) };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`[analytics] ${visits} visits, ${Object.keys(paths).length} paths → ${OUT}`);
}

// Only when RUN, never when imported: analytics-pull.test.ts imports foldPaths, and a test run must
// not be able to reach the network — with a token in the environment, a bare top-level call here
// would have `bun test` querying the live API.
if (import.meta.main) {
  const wantsProbe = process.argv.includes("--probe");
  if (!TOKEN || !ACCOUNT) {
    console.log("[analytics] CF_ACCOUNT_ID / CF_ANALYTICS_TOKEN not set — skipping (no numbers will render)");
  } else {
    try {
      await (wantsProbe ? probe() : pull());
    } catch (err) {
      // Deliberately exit 0: a Cloudflare outage, an expired token or a schema drift must degrade to
      // "no numbers", never to a failed deploy.
      console.log(`[analytics] pull failed, rendering without numbers: ${(err as Error).message}`);
    }
  }
}
