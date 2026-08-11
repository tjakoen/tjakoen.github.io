// portfolio/analytics.ts — the view counts that ride in the status bar.
//
// The site is a STATIC export on GitHub Pages: there is no server to ask at page load, so the
// numbers cannot be live. They are pulled ONCE at build time (tools/analytics-pull.ts queries
// Cloudflare's GraphQL API) into .cache/analytics.json, and baked into every page here.
//
// ONE idempotent transform — injectViews(html, pathname) — fills the empty [data-views] span the
// frame ships (portfolio-frame.html), exactly parallel to seo.ts enrichHead: one lever in
// finalizePage covers static pages, MILL notes, docs, plans and the catalog, so a new page carries
// its count with nothing extra to author.
//
// Missing data is a NO-OP, never a zero: a local run has no .cache/analytics.json, and a page that
// has not been visited yet has no entry. Both leave the span empty, and an empty span collapses.
// That is deliberate — "0 views" on a note published an hour ago is worse than no number at all.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalPath } from "./seo.ts";

const HERE = join(fileURLToPath(import.meta.url), "..");

// What tools/analytics-pull.ts writes. `paths` is keyed by CANONICAL path (trailing slash), which
// is the same key seo.ts derives, so the two agree on what "a page" is.
export type AnalyticsData = {
  visits: number;                      // site-wide, Cloudflare's "visits" (entries from elsewhere)
  paths: Record<string, number>;       // canonical path → page views
  pulledAt: string;                    // ISO date the pull ran, for the docs/debugging
};

export const ANALYTICS_CACHE = join(HERE, "..", ".cache", "analytics.json");

// Read the pulled counts, or null when there are none. Read ONCE at module load: the export crawls
// hundreds of pages off one booted server, and re-reading the file per page would be pure waste.
// A malformed or partial file is treated as absent rather than crashing the build — the numbers are
// a nicety, and losing them must never cost a deploy.
export function load(path = ANALYTICS_CACHE): AnalyticsData | null {
  try {
    // sync on purpose: this is a module-load constant, not a per-request read
    const data = JSON.parse(readFileSync(path, "utf8")) as AnalyticsData;
    if (typeof data?.visits !== "number" || typeof data?.paths !== "object" || !data.paths) return null;
    return data;
  } catch {
    return null;
  }
}

export const analytics: AnalyticsData | null = load();

// 1204 → "1,204". Thousands separators only; no "1.2k" rounding, because a rounded count reads as
// a claim about precision the beacon cannot support at that scale anyway.
export function formatCount(n: number): string {
  return n.toLocaleString("en-US");
}

// The status-bar text for one page: the site total, then this page's own views when it has any.
// Returns "" when there is no data at all, so the caller can leave the span empty.
// "1 visit" not "1 visits" — a count of one is common on a young page, so the singular is the
// normal case here rather than an edge case worth skipping.
const plural = (n: number, one: string, many: string) => `${formatCount(n)} ${n === 1 ? one : many}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-08-11" → "11 Aug". Parsed by hand rather than through Date, so the rendered day cannot
// shift under the build machine's timezone: `new Date("2026-08-11")` is UTC midnight, which is the
// 10th anywhere west of Greenwich. Anything unparseable yields "" and the suffix is simply dropped.
export function shortDate(iso: string | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return "";
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${Number(m[3])} ${month}` : "";
}

// The counts are a SNAPSHOT taken when the site was last built, so the bar says "as of <date>".
// Not "since last deploy": these are cumulative since the beacon went live and do not reset on a
// deploy, so that phrasing would claim something false. The date is the honest version of the same
// reassurance — it tells a reader who just visited why their own view is not in the number yet.
export function viewsLabel(pathname: string, data: AnalyticsData | null = analytics): string {
  if (!data) return "";
  const here = data.paths[canonicalPath(pathname)];
  const site = plural(data.visits, "visit", "visits");
  const counts = here === undefined ? site : `${site} · ${plural(here, "view", "views")} here`;
  const asOf = shortDate(data.pulledAt);
  return asOf ? `${counts} · as of ${asOf}` : counts;
}

// Fill the frame's empty [data-views] span. Idempotent (a filled span is left alone) and a no-op on
// any document that does not carry the span — fragments, the raw-Markdown responses, anything that
// is not a framed page.
export function injectViews(
  html: string,
  pathname: string,
  data: AnalyticsData | null = analytics,
): string {
  const label = viewsLabel(pathname, data);
  if (!label) return html;
  return html.replace(
    /<span class="status-bar__views" data-views><\/span>/,
    `<span class="status-bar__views" data-views>${label}</span>`,
  );
}
