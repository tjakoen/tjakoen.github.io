// portfolio/tools/verify-export.ts — verify a BUILT dist/ (Phase 2, §18: the export must stay a
// faithful, link-complete projection of the running server, forever, not just on the day it was
// written). Two checks, both against dist/ ON DISK (no server, no network):
//
//   (a) every <loc> in dist/sitemap.xml maps to a real file in dist/ (a trailing-slash canonical
//       URL, e.g. "https://…/grain/", must resolve to dist/grain/index.html — task 3 makes the
//       sitemap emit exactly that form, so this also catches a regression back to the redirecting
//       extensionless form).
//   (b) a dead-link walk of every dist/**/*.html: every internal href/src must resolve to a real
//       file in dist/ (a page → its <route>/index.html, an asset/data route → its literal path).
//
// REUSE, not reinvention: batch's own exportSite() already extracts refs the same way (see
// batch/export/export.ts step 4, extractRefs from rewrite.ts) but only WARNS — it can't fail the
// build on a dead link because it doesn't know which refs are intentionally-excluded operable
// surfaces (§18) at that layer. This tool runs AFTER the crawl, against the real filesystem, where
// "does this file exist" is unambiguous — so it can be a hard, CI-blocking gate (wired into
// pages.yml between export and the Pages upload).
//
//   bun run verify:export        # after `bun run export` (reads ./dist by default)
//   EXPORT_DIST=dist bun run verify-export.ts
import { join, relative } from "node:path";
import { readdir } from "node:fs/promises";
import { extractRefs } from "@tjakoen/batch/export/rewrite.ts";

const DIST = Bun.env.EXPORT_DIST ?? "dist";

// Live-only backend endpoints (§18: the operable /intent+SSE door) that legitimately appear as a
// literal <a href> in the rendered HTML but are NEVER export candidates — there is no page to
// freeze, only a running server to ask. `/ai/manifest` is linked from /loop's and /grain's own
// "manifest" action (a debugging convenience for a human reading the page); batch's own
// exportSite() already warns about it every run ("expected for operable surfaces excluded per
// §18") — this is the same exclusion, just promoted from a warning to a documented pass here so a
// REAL dead link doesn't hide next to an expected one. Keep this list short and named; anything
// else missing from dist/ is a bug, not an exclusion.
const OPERABLE_ONLY_REFS = new Set(["/ai/manifest"]);

/** Does a root-absolute ref (already fragment/query-stripped) resolve under dist/? Tries BOTH
 *  shapes a route can take — a literal file (data routes, assets, the honest-source .md twins)
 *  and a "pretty" directory route's index.html — rather than guessing from the ref's spelling
 *  (a slug can legitimately contain a dot, e.g. "/standards/claude.starter", which looks
 *  file-shaped but is a directory route; sniffing extname() on it gives a false positive). */
async function resolves(ref: string): Promise<{ ok: boolean; triedFile: string; triedDir: string }> {
  const clean = ref.replace(/^\/+/, "").replace(/\/+$/, "");
  const triedFile = clean === "" ? "index.html" : clean;
  const triedDir = join(clean, "index.html");
  if (await Bun.file(join(DIST, triedFile)).exists()) return { ok: true, triedFile, triedDir };
  if (clean !== "" && await Bun.file(join(DIST, triedDir)).exists()) return { ok: true, triedFile, triedDir };
  return { ok: false, triedFile, triedDir };
}

async function findHtmlFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(d: string): Promise<void> {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const full = join(d, e.name);
      if (e.isDirectory()) await walk(full);
      else if (e.name.endsWith(".html")) out.push(full);
    }
  }
  await walk(dir);
  return out;
}

// ---- (a) sitemap.xml → real files -------------------------------------------------------------
async function checkSitemap(): Promise<string[]> {
  const failures: string[] = [];
  const sitemapPath = join(DIST, "sitemap.xml");
  if (!(await Bun.file(sitemapPath).exists())) {
    return [`dist/sitemap.xml is missing — did the export run?`];
  }
  const xml = await Bun.file(sitemapPath).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  if (locs.length === 0) failures.push(`dist/sitemap.xml has no <loc> entries`);

  for (const loc of locs) {
    let pathname: string;
    try { pathname = new URL(loc).pathname; }
    catch { failures.push(`sitemap: "${loc}" is not a valid URL`); continue; }
    // task 3: every non-root sitemap URL is canonical trailing-slash — flag a regression here too.
    if (pathname !== "/" && !pathname.endsWith("/"))
      failures.push(`sitemap: "${pathname}" is not trailing-slash canonical (301s on GitHub Pages)`);
    const r = await resolves(pathname);
    if (!r.ok)
      failures.push(`sitemap: "${pathname}" → dist/${r.triedFile} (or dist/${r.triedDir}) does not exist`);
  }
  return failures;
}

// ---- (b) dead-link walk of every rendered page --------------------------------------------------
async function checkDeadLinks(): Promise<string[]> {
  const failures: string[] = [];
  const htmlFiles = await findHtmlFiles(DIST);
  for (const file of htmlFiles) {
    const html = await Bun.file(file).text();
    const page = "/" + relative(DIST, file).split("/").join("/");
    for (const ref of extractRefs(html)) {
      if (OPERABLE_ONLY_REFS.has(ref)) continue;
      const r = await resolves(ref);
      if (!r.ok)
        failures.push(`${page}: href/src="${ref}" → dist/${r.triedFile} (or dist/${r.triedDir}) does not exist`);
    }
  }
  return failures;
}

const [sitemapFailures, deadLinkFailures] = await Promise.all([checkSitemap(), checkDeadLinks()]);
const failures = [...sitemapFailures, ...deadLinkFailures];

if (failures.length) {
  console.error(`[verify-export] ${failures.length} problem(s) in ${DIST}/:\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(`\n[verify-export] FAILED`);
  process.exit(1);
}

console.log(`[verify-export] sitemap.xml: every <loc> resolves to a real file, all trailing-slash canonical`);
console.log(`[verify-export] dead-link walk: every internal href/src across the exported HTML resolves`);
console.log(`[verify-export] OK`);
