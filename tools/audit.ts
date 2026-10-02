// portfolio/tools/audit.ts — audit THIS product against its native-first / SEO / AEO baseline.
import { join } from "node:path";
import { parsePort, waitForServer } from "./_server.ts";
//
// A thin consumer of the framework-generic auditor (batch/audit). This file owns everything
// product-specific: booting portfolio/server.ts, the page list, the grain affordance selectors, and
// the MILL/GRAIN-framed narrative in the report. The measurement engine lives in batch and knows
// none of that (parallel to batch/export — generic capability in batch, invoked against the app here).
// Writes audit/report.json + audit/report.md (tabular, so it renders in your editor and diffs in git)
// and prints a summary. Not a test (no assertions) — it measures the CURRENT build as a baseline, so
// re-run it as MILL + GRAIN evolve.
//
//   bun run audit
//
// Note: this measures the live dev render. `batch/export` freezes the same bytes, so the numbers are a
// fair proxy for the static site (export is a projection, not a second renderer — ARCHITECTURE §18).
import { mkdir, writeFile } from "node:fs/promises";
import { audit, renderTables, kb, type AuditReport } from "@tjakoen/batch/audit/audit.ts";

const PORT = parsePort(Bun.env.AUDIT_PORT, 3320, "AUDIT_PORT");
const BASE = `http://localhost:${PORT}`;
const OUT = "audit";

// Site-level machine-readability endpoints (AEO/SEO infrastructure).
const ENDPOINTS = ["/sitemap.xml", "/robots.txt", "/llms.txt"];
// Grain's machine-operable affordances — the vocabulary batch stays ignorant of. [data-surface]
// doubles as an AEO signal (an addressable, agent-operable region). "Surfaces" = [data-surface].
const SELECTORS = { Surfaces: "[data-surface]", Kinds: "[data-kind]", Accepts: "[data-accepts]" };


const endpointLine = (e: string, status: number) => `\`${e}\` ${status === 200 ? "✓" : `✗ (${status})`}`;

// The MILL/GRAIN-framed narrative wrapping the generic tables — the part that's about THIS product.
function narrate(report: AuditReport): string {
  const okp = report.pages.filter((p) => p.ok);
  const jsVals = okp.map((p) => p.perf!.jsBytes);
  const jsMin = jsVals.length ? Math.min(...jsVals) : 0;
  const jsMax = jsVals.length ? Math.max(...jsVals) : 0;
  const loadMax = okp.length ? Math.max(...okp.map((p) => p.perf!.loadMs)) : 0;
  const jsVerdict = jsMax <= 50 * 1024 ? "**excellent — native-first** (a typical React/Next page ships several× this)"
    : jsMax <= 150 * 1024 ? "moderate" : "heavy — investigate";
  const skipped = report.pages.filter((p) => !p.ok).map((p) => `\`${p.path}\` (${p.error})`).join(", ") || "none";
  const finding = (passes: (dom: NonNullable<(typeof report.pages)[number]["dom"]>) => boolean) =>
    report.pages.filter((p) => p.ok && !passes(p.dom!)).map((p) => p.path);
  const findings = [
    ["Exactly one page heading", finding((d) => d.h1Count === 1)],
    ["Meta description", finding((d) => !!d.metaDescription)],
    ["Canonical URL", finding((d) => !!d.canonical)],
    ["Open Graph metadata", finding((d) => d.og.length > 0)],
    ["Structured data", finding((d) => d.jsonLd.length > 0)],
  ] as const;
  const pagesWithDocumentFindings = new Set(findings.flatMap(([, paths]) => paths));
  const findingLines = findings.map(([label, paths]) =>
    `- **${label}:** ${paths.length ? `${paths.length} page(s): ${paths.map((p) => `\`${p}\``).join(", ")}` : "all pages pass"}`,
  ).join("\n");
  const epLines = ENDPOINTS.map((e) => `- ${endpointLine(e, report.endpoints[e])}`).join("\n");
  return `# Portfolio-wide performance & SEO/AEO audit\n\n` +
    `_Measured headless against the current build. Regenerate with \`bun run audit\`. ` +
    `This report covers every canonical URL in the sitemap and checks document metadata and delivery. ` +
    `It complements the visual and editorial review of each page._\n\n` +
    `## Coverage\n\n` +
    `- Canonical pages: ${report.pages.length}\n` +
    `- Pages that returned successfully: ${okp.length}\n` +
    `- HTTP failures: ${report.pages.length - okp.length}\n` +
    `- Pages with one or more document findings: ${pagesWithDocumentFindings.size}\n\n` +
    `## Document checks\n\n${findingLines}\n\n` +
    `## What the numbers mean\n\n` +
    `- **JavaScript shipped: ${kb(jsMin)}–${kb(jsMax)} per page** — the headline, and the "native-first" proof: ${jsVerdict}.\n` +
    `- **Bytes, JS and request counts are network-independent** — the robust, honest numbers to publish.\n` +
    `- **TTFB / Load are LOCAL best-case** (no network hop; max load here ${loadMax}ms) — use them for catching regressions, not as absolute proof. Real-world latency adds to every stack equally.\n` +
    `- **The persuasive frame is comparative** — the same metrics vs Astro / Next / htmx tell the story (memory \`framework-comparison-methodology\`).\n\n` +
    `## Pages\n\n` +
    `${renderTables(report, Object.keys(SELECTORS))}\n\n` +
    `## Endpoints\n\n${epLines}\n\n` +
    `## Notes\n\n` +
    `- Skipped pages: ${skipped}\n` +
    `- **Surfaces** = count of \`[data-surface]\` — machine-operable affordances; doubles as an AEO signal.\n` +
    `- **Desc / Canon / OG / JSON-LD** should now be ✓ on every page: \`seo.ts\` enriches every full-document\n` +
    `  response with a canonical URL, Open Graph + Twitter Card, and schema.org JSON-LD (Person + WebSite on\n` +
    `  home, BlogPosting on notes, WebPage + BreadcrumbList elsewhere), derived from each page's own\n` +
    `  title/description + path. A ✗ here is a regression. See memory \`seo-aeo-first-class\`.\n`;
}

console.log(`[audit] starting server on ${PORT}…`);
const server = Bun.spawn(["bun", join(import.meta.dir, "..", "src", "server.ts")], {
  env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
  stdout: "ignore", stderr: "ignore",
});
try {
  await waitForServer(BASE);
  await mkdir(OUT, { recursive: true });

  const sitemapResponse = await fetch(`${BASE}/sitemap.xml`);
  if (!sitemapResponse.ok) throw new Error(`Could not load sitemap.xml (${sitemapResponse.status})`);
  const sitemap = await sitemapResponse.text();
  const pages = Array.from(sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g), (match) => new URL(match[1], BASE))
    .filter((url) => url.origin === BASE)
    .map((url) => url.pathname);
  if (pages.length === 0) throw new Error("sitemap.xml did not contain any canonical page URLs");
  const report = await audit({ baseURL: BASE, pages, endpoints: ENDPOINTS, selectors: SELECTORS });

  await writeFile(`${OUT}/report.json`, JSON.stringify({ note: "baseline of the current build; re-run with `bun run audit`", ...report }, null, 2));
  await writeFile(`${OUT}/report.md`, narrate(report));

  console.log(`\n[audit] wrote ${OUT}/report.json + ${OUT}/report.md`);
  console.log(`[audit] endpoints: ${ENDPOINTS.map((e) => endpointLine(e, report.endpoints[e])).join(" · ")}`);
} finally {
  server.kill();
}
