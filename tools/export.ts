// portfolio/tools/export.ts — freeze THIS app to a static dist/ for GitHub Pages / any static host.
import { join } from "node:path";
//
// A thin consumer of the framework-generic exporter (batch/export), exactly parallel to
// portfolio/tools/audit.ts: this file owns everything app-specific — booting portfolio/server.ts,
// choosing which routes are exportable (§18's boundary: operable /intent+SSE surfaces excluded), naming the
// generated data routes the ⌘K palette + SEO infra need, and listing the asset mounts. The crawl +
// write + base-path rewrite engine lives in batch and knows none of it.
//
//   bun run export                              # → dist/, absolute paths (root host / custom domain)
//   PUBLIC_BASE_PATH=/repo bun run export       # → dist/ for user.github.io/<repo>/ (subpath host)
//   PUBLIC_ORIGIN=https://you.com bun run export # bake the real origin into sitemap.xml/robots.txt
//
// Serve it with any static file server, e.g.  `bunx serve dist`  or push dist/ to Pages.
// It is a PROJECTION of the running server (fetch, don't re-render — ARCHITECTURE §18), so the AI
// loop (/intent, /stream) is intentionally absent: a static copy has no backend. The /grain showcase
// still WORKS though: its page is flipped to the CLIENT-side door (§19.3) and the door's module
// graph is frozen into dist/modules — the demo runs the same vocabulary fully in-browser.
import { createSitemap } from "@tjakoen/batch/http/sitemap.ts";
import { exportSite, type AssetMount } from "@tjakoen/batch/export/export.ts";
import { rewriteOrigin } from "@tjakoen/batch/export/rewrite.ts";
import { listPortfolioContentRoutes, listPortfolioRawContentRoutes } from "../content.ts";
import { listPlanRoutes } from "../plans.ts";
import { loadTours } from "@tjakoen/crumb/loader.ts";
import { fileURLToPath } from "node:url";
import { config } from "../config.ts";

const PORT = Number(Bun.env.EXPORT_PORT ?? 3330);
const BASE = `http://localhost:${PORT}`;
const DIST = Bun.env.EXPORT_DIST ?? "dist";

// Operable surfaces — behind the one door (/intent + SSE) — excluded from the crawl because a
// static copy has no backend to answer them (§18). `/dashboard` + `/home` are retired; never
// crawl them. `/loop` is NOT here (Phase 2, was `new Set(["/loop"])`): it's now exported as a
// FROZEN SNAPSHOT — server.ts server-renders its initial task list into the page (so the crawl
// captures a real board, not an empty shell) and this file's transformPage (below) strips the
// live htmx auto-refresh, so the static copy never calls the (absent) `/ui/loop` backend.
const OPERABLE = new Set<string>();

// EVERY exported page is flipped to the CLIENT-SIDE door on the static copy (§19.3): the static
// host has no backend, so ai-dispatch (loaded on every page via PAGE_ASSETS) must NOT open a
// server `/stream` — on GitHub Pages that request 404s, and each page logs a stream error + goes
// "offline". The loopback client door runs the same vocabulary in-browser, so the desk stays online
// and quiet everywhere. The live dev server keeps the server door (no marker); only the frozen copy
// carries it. Safe to stamp unconditionally, `/loop` included: the client door would actually run
// the demo fine in-browser, but /loop's OWN task list is real per-deploy data with no live backend
// behind it — so pages/loop.html's own script reads this same marker to show an honest "static
// snapshot" banner and disable the free-text composer.
// The desk door (ai/desk-door.js) is the portfolio's OWN client door — data-ai-door selects it over
// grain's default. Freezing it as an entry crawls its static graph (desk-reasoner, webllm-loader,
// prompt, retrieval); the WebLLM CDN import inside grain's webllm.js is a runtime string (not
// followed, so esm.run never enters the export).
// The desk door URL-imports several grain modules via `import(new URL(...))` — a dynamic, computed
// specifier the static crawler CANNOT follow, so each must be frozen as its OWN entry or it 404s on
// the deployed site (the door's dynamic import then throws and the desk never comes online). These
// are: client-door + manifest-dom + the model transport (webllm.js probe/loader, model-chat.js
// streaming). Their static graphs (e.g. model.js) come along via the crawl of these entries. Keep
// this list in sync with the `import(new URL("../../grain/ai/*.js"))` calls in ai/desk-door.ts.
const MODULE_ENTRIES = [
  "/modules/grain/ai/client-door.js",
  "/modules/grain/ai/manifest-dom.js",
  "/modules/grain/ai/webllm.js",
  "/modules/grain/ai/model-chat.js",
  "/modules/portfolio/ai/desk-door.js",
];

// Generated routes that a href/src crawler won't discover: the ⌘K palette's index, the desk's
// grounding corpus (knowledge/notes), the SEO infra, and PROOF's stylesheet (/proof.css — every
// /plans page links it, so now that /plans exports (Phase 2) it must travel too, or the frozen
// board ships unstyled).
const DATA_ROUTES = ["/components.css", "/proof.css", "/crumb.css", "/crumb-live.js", "/search.json", "/knowledge.json", "/notes.json", "/sitemap.xml", "/robots.txt", "/llms.txt"];

// CRUMB's tour DATA: the guided-tour client (crumb-live.js, injected on every page) fetches
// /crumb/tours/<id>.json at run time, so a static export must freeze those JSON blobs or the dock's
// Tour launcher 404s on Pages. Enumerated from the same tours/ folder the server mounts, so a new
// tour exports automatically (parallel to listPlanRoutes for PROOF). The manifest (/crumb/tours.json)
// travels too — a future launcher lists from it.
const CRUMB_TOURS_DIR = fileURLToPath(new URL("../tours", import.meta.url));
async function crumbTourRoutes(): Promise<string[]> {
  const { tours } = await loadTours(CRUMB_TOURS_DIR);
  return ["/crumb/tours.json", ...tours.map(({ tour }) => `/crumb/tours/${tour.id}.json`)];
}

// Every content entry's raw `.md` twin (MILL's honest-source route) — a data route (literal
// bytes, no chrome), never a page: freezing it here (not `pages`) keeps the export honest and
// lets the entry chrome's Rendered/Source toggle resolve under the export's dead-link check.
async function dataRoutes(): Promise<string[]> {
  return [...DATA_ROUTES, ...await listPortfolioRawContentRoutes(), ...await crumbTourRoutes()];
}

async function waitForServer(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try { if ((await fetch(`${BASE}/`)).ok) return; } catch { /* not up yet */ }
    await Bun.sleep(200);
  }
  throw new Error(`server didn't come up on ${BASE}`);
}

// The exportable allowlist: every page route the app serves (the portfolio's one pages tree —
// "/", "/grain", "/batch", "/mill", /loop, /about) + MILL's content routes (/notes, /grain/docs,
// /batch/docs — content pages MUST export, §18) + PROOF's plan routes (/plans, /plans/plan/:id)
// + /catalog + /reference, minus the operable surfaces. Derived from the same route lists the
// server's sitemap uses, so new pages/notes/plans export automatically.
async function pageRoutes(): Promise<string[]> {
  const pages = createSitemap(config.pagesDir).routes();
  const content = await listPortfolioContentRoutes();                    // MILL collections, enumerated
  const plans = await listPlanRoutes();                                  // PROOF's board, enumerated
  // "/cv" is not a page file — it's the auto-print résumé twin the server synthesizes from /resume
  // (server.ts fetch), so add it explicitly or the dead-link walk flags the About/résumé download link.
  const all = new Set([...pages, ...content, ...plans, "/catalog", "/reference", "/cv"]);
  return [...all].filter((r) => !OPERABLE.has(r)).sort();
}

// Asset mounts copied verbatim: everything the config serves statically + the fonts dir.
function assetMounts(): AssetMount[] {
  return [
    ...Object.entries(config.assetDirs).map(([prefix, dir]) => ({ prefix, dir })),
    { prefix: "/fonts", dir: config.fontsDir },
  ];
}

console.log(`[export] starting server on ${PORT}…`);
const server = Bun.spawn(["bun", join(import.meta.dir, "..", "server.ts")], {
  env: { ...process.env, PORT: String(PORT), NODE_ENV: "production" },
  stdout: "ignore", stderr: "ignore",
});
try {
  await waitForServer();
  const pages = await pageRoutes();
  console.log(`[export] pages: ${pages.join(", ")}`);

  const report = await exportSite({
    baseURL: BASE,
    distDir: DIST,
    pages,
    dataRoutes: await dataRoutes(),
    assets: assetMounts(),
    moduleEntries: MODULE_ENTRIES,
    transformPage: (route, html) => {
      // client transport + the portfolio's OWN door (desk-door selects the WebLLM path over grain's default)
      let out = html.replace(/<body\b/, '<body data-ai-transport="client" data-ai-door="/modules/portfolio/ai/desk-door.js"');
      // /loop's frozen snapshot (server.ts freezeLoopList) already carries the real list; strip
      // the live htmx auto-refresh so the static copy never requests the backend-only /ui/loop
      // (a 404 on GitHub Pages) — pages/loop.html documents the pairing.
      if (route === "/loop")
        out = out.replace(/\s+hx-get="\/ui\/loop"\s+hx-trigger="load"/, "");
      // The SEO head (seo.ts) emits ABSOLUTE canonical/OG/JSON-LD URLs at the crawl origin; swap it
      // for the deploy origin, the same rewrite sitemap.xml/robots.txt/llms.txt take (batch/export
      // only origin-rewrites .xml/.txt data routes, not pages — so pages do it here). No-op without
      // PUBLIC_ORIGIN, exactly like those endpoints.
      out = rewriteOrigin(out, BASE, Bun.env.PUBLIC_ORIGIN);
      return out;
    },
    basePath: Bun.env.PUBLIC_BASE_PATH,
    publicOrigin: Bun.env.PUBLIC_ORIGIN,
    log: (m) => console.log(m),
  });

  const failed = report.pages.filter((p) => !p.ok);
  console.log(`\n[export] wrote ${report.distDir}`);
  console.log(`[export] serve it with e.g.  bunx serve ${DIST}   (or push to GitHub Pages)`);
  console.log(`[export] note: opening dist/index.html via file:// renders UNSTYLED — the asset paths are root-absolute (/styles/…), so it needs a server.`);
  if (!report.basePath && !Bun.env.PUBLIC_ORIGIN)
    console.log(`[export] note: absolute paths assume a ROOT host. For user.github.io/<repo>/ set PUBLIC_BASE_PATH=/<repo>.`);
  if (failed.length) {
    console.error(`[export] ${failed.length} route(s) failed: ${failed.map((p) => `${p.route} (${p.error})`).join(", ")}`);
    process.exitCode = 1;
  }
} finally {
  server.kill();
}
