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
import { listPortfolioContentRoutes, listPortfolioRawContentRoutes } from "../content.ts";
import { config } from "../config.ts";

const PORT = Number(Bun.env.EXPORT_PORT ?? 3330);
const BASE = `http://localhost:${PORT}`;
const DIST = Bun.env.EXPORT_DIST ?? "dist";

// Operable surfaces — behind the one door (/intent + SSE). A static copy has no backend, so they are
// excluded from the crawl (§18). `/dashboard` + `/home` are retired; never crawl them.
const OPERABLE = new Set(["/loop"]);

// Pages flipped to the CLIENT-SIDE door on the static copy (§19.3): the demo's service-free
// scenarios run fully in-browser — same vocabulary, same door, loopback ops. The live server keeps
// the server door; only the frozen copy carries the marker.
const CLIENT_DOOR_PAGES = new Set(["/grain"]);
const MODULE_ENTRIES = ["/modules/grain/ai/client-door.js"];

// Generated routes that a href/src crawler won't discover: the ⌘K palette's index + the SEO infra.
const DATA_ROUTES = ["/components.css", "/search.json", "/sitemap.xml", "/robots.txt", "/llms.txt"];

// Every content entry's raw `.md` twin (MILL's honest-source route) — a data route (literal
// bytes, no chrome), never a page: freezing it here (not `pages`) keeps the export honest and
// lets the entry chrome's Rendered/Source toggle resolve under the export's dead-link check.
async function dataRoutes(): Promise<string[]> {
  return [...DATA_ROUTES, ...await listPortfolioRawContentRoutes()];
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
// /batch/docs — content pages MUST export, §18) + /catalog + /reference, minus the operable
// surfaces. Derived from the same route lists the server's sitemap uses, so new pages/notes
// export automatically.
async function pageRoutes(): Promise<string[]> {
  const pages = createSitemap(config.pagesDir).routes();
  const content = await listPortfolioContentRoutes();                    // MILL collections, enumerated
  const all = new Set([...pages, ...content, "/catalog", "/reference"]);
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
    transformPage: (route, html) =>
      CLIENT_DOOR_PAGES.has(route) ? html.replace(/<body\b/, '<body data-ai-transport="client"') : html,
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
