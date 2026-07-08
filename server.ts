// portfolio/server.ts — the composition root: the ONLY place BATCH + GRAIN + MILL + portfolio meet.
import { join, normalize, resolve, sep } from "path";
import { config } from "./config.ts";
// --- BATCH (substrate) ---
import { bunRuntime } from "../batch/platform/bun-runtime.ts";
import { watchComponents } from "../batch/platform/watch.ts";
import { makeStatic } from "../batch/http/static.ts";
import { makePageServer } from "../batch/http/pages.ts";
import { createSitemap } from "../batch/http/sitemap.ts";
import { renderLlms } from "../batch/http/llms.ts";
import { createStyleBundle } from "../batch/assets/style-bundle.ts";
import { createStream } from "../batch/http/stream.ts";
import { makeModuleServer } from "../batch/http/modules.ts";
// --- GRAIN (AI design system) ---
import { createCatalog } from "../grain/catalog/catalog.ts";   // grain's self-documenting catalog (grade toggle = grain vocabulary)
import { createAccepts } from "../grain/ai/accepts.ts";
import { makeStubReasoner } from "../grain/ai/reasoner.ts";
import { createInteractionLayer } from "../grain/ai/interaction-layer.ts";
import { createStreamLogSink } from "../grain/ai/timeline-log.ts";
import { surfaceId, ACTIONS, type Surface } from "../grain/ai/contract.ts";
import { buildVocabReference } from "../grain/ai/vocab-reference.ts";
// --- portfolio (THE app) + its /loop demo domain ---
import { InMemoryTaskRepository } from "./demo/data/in-memory-task-repository.ts";
import { TaskService } from "./demo/services/task-service.ts";
import { renderPage, refresh } from "./render.ts";
import { buildAiRoutes } from "./routes/ai-routes.ts";
import { LoopCard } from "./demo/view/components.ts";
import { toLoopCardView } from "./demo/services/task-views.ts";
import type { Task } from "./demo/domain/task.ts";
// --- MILL mount (portfolio content: /notes + layer docs) — see mill/serve.ts "HOW TO MOUNT" ---
import { createPortfolioContentRoutes, listPortfolioContentRoutes, listRecentNotes, listNoteRoutesByDate } from "./content.ts";
import { portfolioLlmsDoc } from "./llms.ts";   // /llms.txt content (the llmstxt.org AI-facing index)

// --- seed a couple of tasks so the /loop demo has something to show ---
const seed: Task[] = [
  { id: "ITM-seed-1", name: "Read the architecture", description: "BATCH reference",
    status: "active", createdAt: new Date("2026-06-25"), updatedAt: new Date("2026-06-25") },
  { id: "ITM-seed-2", name: "Ship the POC", description: "in-memory, no build step",
    status: "archived", createdAt: new Date("2026-06-26"), updatedAt: new Date("2026-06-26") },
  // A dedicated fixture for the /loop "Watch the desk work" demo: the AI archives THIS task
  // for real through the service (not a cosmetic badge flip). Excluded from the user task list
  // (ai-routes /ui/loop) so its surface address stays unique to the demo card.
  // NB: the ITM- id prefix + the grain "item:" surface kind are the contract vocabulary — left
  // as-is (a generic list item); only the demo's own domain type is renamed Task.
  { id: "ITM-demo-1", name: "Review architecture doc", description: "demo fixture",
    status: "active", createdAt: new Date("2026-06-27"), updatedAt: new Date("2026-06-27") },
];

// --- wire the graph here, and ONLY here ---
const repo = new InMemoryTaskRepository(seed);      // placeholder storage
const service = new TaskService(repo);

// The invariant page shell, injected here at the ONE composition root so no page (hand-authored or
// MILL-rendered) hand-lists it — single source, zero drift. A page's own <head> carries only its
// title/meta; everything global comes from these constants.
//
// The CATALOG is a self-contained GRAIN page (it lists its OWN design-system styles and needs no
// shell/door), so it gets a LIGHTER set — just the FOUC guard (head) + ⌘K/theming islands (body).
const CATALOG_HEAD = `<script src="/scripts/theme-boot.js"></script>`;
const CATALOG_ASSETS = `<link rel="stylesheet" href="/styles/cmdk.css"><script src="/scripts/cmdk.js" defer></script><script src="/scripts/theme.js" defer></script>`;
// The full page shell for every rendered page (portfolio + MILL content). HEAD (render-
// blocking): theme-boot FOUC guard → design-system styles (tokens → base → grade → per-component
// bundle) → site.js (the portfolio startup redirect, must run before first paint). BODY-END: the
// ⌘K/theming islands + shell.js (rail/console/mode toggles, the terminal mirror) + ai-dispatch
// (the one door's client) + the OPT-IN islands — tabs.js (open-pages strip: mounts only on a
// [data-open-tabs] strip), terminal.js (interactive console: only [data-terminal="interactive"]),
// xray.js (dev x-ray: dormant until toggled), desk-commands (registers only if the terminal seam
// exists) — all deferred/no-op where their hook is absent, so one list serves every page.
const PAGE_HEAD = `<script src="/scripts/theme-boot.js"></script><link rel="stylesheet" href="/styles/variables.css"><link rel="stylesheet" href="/styles/global.css"><link rel="stylesheet" href="/styles/grain.css"><link rel="stylesheet" href="/components.css"><script src="/site/site.js"></script>`;
const PAGE_ASSETS = `${CATALOG_ASSETS}<script src="/scripts/shell.js" defer></script><script type="module" src="/scripts/ai-dispatch.js"></script><script type="module" src="/scripts/tabs.js"></script><script type="module" src="/scripts/terminal.js"></script><script type="module" src="/scripts/xray.js"></script><script type="module" src="/site/desk-commands.js"></script>`;
// ONE page server now — the portfolio IS the app (composition root folded in). Every page
// composes with LIVE data (the welcome page's Recent = the newest notes from MILL frontmatter);
// the static export freezes what this renders (§18 — projection, not re-render). The /loop +
// /about demo pages ignore the injected recentNotes; injecting it everywhere costs nothing.
const renderAppPage = async (html: string) =>
  renderPage(html, { recentNotes: await listRecentNotes() });
const servePage = makePageServer(bunRuntime, config.pagesDir, renderAppPage, PAGE_ASSETS, PAGE_HEAD);
const serveContent = createPortfolioContentRoutes(renderPage, PAGE_ASSETS, PAGE_HEAD);   // MILL mount (same global assets + head)
const styles = createStyleBundle(bunRuntime, config.styleRoots);        // per-component CSS + GRAIN's AI module → /components.css
// The sitemap covers EVERYTHING this server actually serves: the portfolio pages tree + MILL's
// content routes (SEO is first-class — content pages must be discoverable, and the export derives
// its allowlist from the same lists). Content routes are computed at boot; authoring a note = a
// restart/redeploy anyway (the export freezes per deploy).
const contentRoutes = await listPortfolioContentRoutes();
const sitemap = createSitemap(config.pagesDir, () => [...contentRoutes, "/reference"]);   // pages tree + MILL content + the generated reference
// the catalog builds its own shell, so it receives the SAME global assets — otherwise it's the
// one page that ignores the saved theme (the bug this seam fixed)
const catalog = createCatalog(config.componentRoots, () => sitemap.routes(),
  { headEnd: CATALOG_HEAD, bodyEnd: CATALOG_ASSETS });  // .md docs across grain+portfolio → /catalog
const accepts = createAccepts(config.componentRoots);           // harvest data-kind/data-accepts → AI manifest

// drift guard: every verb a component references — whether DECLARED (data-accepts, the
// manifest surface) or WIRED (data-action, the actual trigger, e.g. chat.send on app-frame) —
// must be a real, allowed verb in the registry (CONVENTIONS §3: HTML literals are the one
// exception, validated server-side here so a stray/misspelled verb surfaces at startup).
for (const [kind, names] of Object.entries(accepts.byKind()))
  for (const n of names)
    if (!Object.hasOwn(ACTIONS, n))
      console.warn(`[accepts] component kind "${kind}" declares unknown action "${n}" (not in ACTIONS)`);
for (const n of accepts.actions())
  if (!Object.hasOwn(ACTIONS, n))
    console.warn(`[accepts] a component wires data-action="${n}" — not a verb in ACTIONS`);

// THEMING drift guard (CONVENTIONS §3 — no magic strings; validate the cross-layer theming
// vocabulary at boot, same idea as the action guard above). The flavors DEFINED in the theme CSS
// are the source of truth; warn if any page/component/control REFERENCES a flavor
// (data-theme / data-set-theme / data-themes) that has no `[data-theme="…"]` block — a typo, or a
// declared-but-unstyled theme, which would silently no-op. The FIRST entry of a data-themes list is
// the default (rendered by the bare :root, so it has no block, and is exempt).
async function checkThemingDrift(): Promise<void> {
  try {
    // flavors are DEFINED in variables.css :root + the themes/ reference files (@imported there)
    let css = await Bun.file("grain/styles/variables.css").text();
    for await (const rel of new Bun.Glob("*.css").scan("grain/styles/themes"))
      css += "\n" + await Bun.file(join("grain/styles/themes", rel)).text();
    const defined = new Set([...css.matchAll(/\[data-theme="([^"]+)"\]/g)].map((m) => m[1]));
    const referenced = new Set<string>(), defaults = new Set<string>();
    for (const root of [config.pagesDir, ...config.componentRoots]) {
      for await (const rel of new Bun.Glob("**/*.html").scan(root)) {
        const txt = await Bun.file(join(root, rel)).text();
        for (const m of txt.matchAll(/data-(?:set-)?theme="([^"]+)"/g)) referenced.add(m[1]);
        for (const m of txt.matchAll(/data-themes="([^"]+)"/g)) {
          const parts = m[1].split(/\s+/).filter(Boolean);
          if (parts[0]) defaults.add(parts[0]);              // list[0] = the :root default (no block)
          for (const f of parts) referenced.add(f);
        }
      }
    }
    for (const f of referenced)
      if (!defined.has(f) && !defaults.has(f))
        console.warn(`[theming] flavor "${f}" is referenced but has no [data-theme="${f}"] block in grain/styles/variables.css`);
  } catch (e) { console.warn("[theming] drift guard skipped:", (e as Error).message); }
}
void checkThemingDrift();

// no-build CLIENT modules (ARCHITECTURE §19): the browser imports the real grain/ai vocabulary,
// transpiled on request, guarded client-safe. Substrate under the OPT-IN client-side door — the
// static export freezes this graph so /grain's demo runs with no backend (§19.3).
const modules = makeModuleServer(bunRuntime, { roots: { grain: "./grain", portfolio: "./tjakoen.github.io" } });

// --- GRAIN interaction layer: the single door (docs/AI-INTERFACE.md) ---
const stream = createStream();
const reasoner = makeStubReasoner({ failRate: Number(Bun.env.AI_FAIL_RATE ?? 0) });   // AI_FAIL_RATE=1 → rollback
const renderSurface = async (surface: Surface): Promise<string> => {
  const task = await service.getTask(surfaceId(surface));       // committed (clean) fragment for a surface
  return task ? LoopCard(toLoopCardView(task)) : "";
};
const aiLayer = createInteractionLayer({
  reasoner, stream,
  archiveItem: (id) => service.archiveTask(id).then(() => undefined),
  renderSurface,
  logSink: createStreamLogSink(stream),   // record every door crossing to the interaction timeline (§5g)
});

// hot reload: watch every component root + the GRAIN mechanism stylesheet; pages refresh sitemap+catalog
if (config.hotReload) {
  for (const root of config.componentRoots)
    watchComponents(root, () => { refresh(); styles.refresh(); catalog.refresh(); accepts.refresh(); });
  watchComponents("./grain/ai", () => { styles.refresh(); modules.refresh(); });   // ai.css (bundled) + client modules

  watchComponents(config.pagesDir, () => { sitemap.refresh(); catalog.refresh(); });
}

// per-prefix static (each concern owns its assets); strip the prefix, serve from the mapped dir.
const staticServers = Object.entries(config.assetDirs).map(([prefix, dir]) =>
  [prefix, makeStatic(bunRuntime, dir)] as const);

// Binary static (fonts): Bun.file preserves bytes; makeStatic's text read would corrupt woff2.
const FONTS_ROOT = resolve(config.fontsDir);
async function serveFont(rel: string): Promise<Response> {
  const fp = resolve(normalize(join(FONTS_ROOT, rel)));
  if (fp !== FONTS_ROOT && !fp.startsWith(FONTS_ROOT + sep)) return new Response("Forbidden", { status: 403 });
  const file = Bun.file(fp);
  if (!(await file.exists())) return new Response("Not found", { status: 404 });
  return new Response(file, { headers: { "Content-Type": "font/woff2", "Cache-Control": "public, max-age=31536000, immutable" } });
}

Bun.serve({
  port: config.port,
  routes: {
    ...buildAiRoutes(service, stream, aiLayer, accepts),   // /intent, /stream, /ai/manifest, /ui/loop
    "/components.css": async () =>
      new Response(await styles.css(), { headers: { "Content-Type": "text/css" } }),
    "/catalog": async () =>
      new Response(await catalog.html(), { headers: { "Content-Type": "text/html; charset=utf-8" } }),
    // /reference — the GENERATED developer-docs reference (DEV-DOCS.md step 5): the AI vocabulary
    // + token slots read from the real registries (grain/ai/vocab-reference.ts), never hand-copied.
    "/reference": async () => {
      const body = await buildVocabReference("grain/styles/variables.css");
      const page = `<!DOCTYPE html>
<html lang="en" data-themes="sourdough baguette brioche">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reference · Developer docs</title>
  <meta name="description" content="Generated reference: the AI vocabulary (actions, surface kinds, render ops), the one door's endpoints, and GRAIN's token slots — read from the real source, never hand-copied.">
  ${PAGE_HEAD}
</head>
<body data-screen="reference" class="app-window-backdrop">
  <div class="app-shell app-window" data-section="docs" data-rail-collapsed="false" data-surface="screen">
    <portfolio-frame />
    <main class="app-shell__main">
      <div class="board">
        <p class="eyebrow">📚 <span class="name">Reference</span></p>
        <h1 class="masthead">Generated, not hand-copied.</h1>
        <hr class="rule">
        <p class="lede">Everything below is read from the real source at request time — the
          <a href="/grain/docs/ai-interface">AI vocabulary</a> contract and GRAIN's token slots.
          Change the source, this page changes with it.</p>
        ${body}
      </div>
    </main>
  </div>
${PAGE_ASSETS}</body>
</html>`;
      return new Response(await renderAppPage(page), { headers: { "Content-Type": "text/html; charset=utf-8" } });
    },
    "/search.json": async () => {
      const titleOf = (p: string) => { const s = p === "/" ? "home" : p.replace(/^\//, ""); return s.charAt(0).toUpperCase() + s.slice(1); };
      // the sitemap lists routes alphabetically; substitute the notes/ block for the SAME
      // newest-first order the /notes index uses, so the explorer tree (which fills its
      // notes/ folder from this list, in this order) matches the page instead of the ABCs.
      const noteOrder = await listNoteRoutesByDate();
      let noteIdx = 0;
      const noteSet = new Set(noteOrder);
      const routes = sitemap.routes().map((r) => noteSet.has(r) ? noteOrder[noteIdx++]! : r);
      const pages = routes.map((p) => ({ title: titleOf(p), url: p }));
      const components = (await catalog.entries()).map((c) => ({ title: c.name, subtitle: c.layer, url: `/catalog#${c.slug}` }));
      return Response.json({ pages, components });
    },
    "/sitemap.xml": (req: Request) =>
      new Response(sitemap.xml(new URL(req.url).origin), { headers: { "Content-Type": "application/xml" } }),
    "/robots.txt": (req: Request) =>
      new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(req.url).origin}/sitemap.xml\n`,
        { headers: { "Content-Type": "text/plain" } }),
    // /llms.txt — the AI-facing index (llmstxt.org): what this stack is + where the canonical docs
    // live. Same origin-from-request idiom as sitemap.xml so the export can rewrite the deploy URL in.
    "/llms.txt": (req: Request) =>
      new Response(renderLlms(portfolioLlmsDoc, new URL(req.url).origin),
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }),
  },
  async fetch(req) {
    const p = new URL(req.url).pathname;
    if (p.startsWith("/fonts/")) return serveFont(p.slice("/fonts".length));   // binary: bytes preserved
    if (p.startsWith("/modules/")) return modules.serve(p);                    // client-safe TS → browser JS
    for (const [prefix, serve] of staticServers)
      if (p.startsWith(prefix + "/")) return serve(p.slice(prefix.length));    // strip prefix → mapped dir
    // --- MILL mount: live content routes (/notes, /grain/docs, /batch/docs) ---
    const fromContent = await serveContent(p);
    if (fromContent) return fromContent;
    // the portfolio's own pages tree: "/" (home), "/grain"·"/batch" showcases, /loop + /about
    return servePage(p);
  },
});

console.log(`Running on http://localhost:${config.port} (${config.isDev ? "dev" : "prod"})`);
