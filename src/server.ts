// portfolio/server.ts — the composition root: the ONLY place BATCH + GRAIN + MILL + portfolio meet.
import { join, normalize, resolve, sep } from "path";
import { config } from "./config.ts";
// --- BATCH (substrate) ---
import { bunRuntime } from "@tjakoen/batch/platform/bun-runtime.ts";
import { watchComponents } from "@tjakoen/batch/platform/watch.ts";
import { makeStatic } from "@tjakoen/batch/http/static.ts";
import { makePageServer } from "@tjakoen/batch/http/pages.ts";
import { createSitemap } from "@tjakoen/batch/http/sitemap.ts";
import { renderLlms } from "@tjakoen/batch/http/llms.ts";
import { createStyleBundle } from "@tjakoen/batch/assets/style-bundle.ts";
import { createStream } from "@tjakoen/batch/http/stream.ts";
import { makeModuleServer } from "@tjakoen/batch/http/modules.ts";
// --- GRAIN (AI design system) ---
import { createCatalog } from "@tjakoen/grain/catalog/catalog.ts";   // grain's self-documenting catalog (grade toggle = grain vocabulary)
import { createAccepts } from "@tjakoen/grain/ai/accepts.ts";
import { makeStubReasoner } from "@tjakoen/grain/ai/reasoner.ts";
import { createInteractionLayer } from "@tjakoen/grain/ai/interaction-layer.ts";
import { createStreamLogSink } from "@tjakoen/grain/ai/timeline-log.ts";
import { surfaceId, ACTIONS, type Surface } from "@tjakoen/grain/ai/contract.ts";
import { buildVocabReference } from "@tjakoen/grain/ai/vocab-reference.ts";
// --- portfolio (THE app) + its /loop demo domain ---
import { InMemoryTaskRepository } from "./demo/data/in-memory-task-repository.ts";
import { TaskService } from "./demo/services/task-service.ts";
import { renderPage, refresh } from "./render.ts";
import { buildAiRoutes, renderLoopListFragment } from "./routes/ai-routes.ts";
import { LoopCard } from "./demo/view/components.ts";
import { toLoopCardView } from "./demo/services/task-views.ts";
import type { Task } from "./demo/domain/task.ts";
// --- MILL mount (portfolio content: /notes + layer docs) — see mill/serve.ts "HOW TO MOUNT" ---
import { createPortfolioContentRoutes, listPortfolioContentRoutes, listRecentNotes, listNoteRoutesByDate, renderNotesFeedPage, buildPortfolioKnowledge, listPortfolioNotes, listNoteCalendarEvents, listEventCalendarEvents, kindLabel, parsePhotos, type CalendarEvent } from "./content.ts";
import { portfolioLlmsDoc } from "./llms.ts";   // /llms.txt content (the llmstxt.org AI-facing index)
import { enrichHead } from "./seo.ts";          // per-page canonical + Open Graph + Twitter + JSON-LD
// --- PROOF mount: portfolio serves its OWN plans/ as a rendered board at /plans (proof = a layer) ---
import { createProofRoutes } from "@tjakoen/proof/routes.ts";
import { PLANS_DIR, PLANS_PREFIX, listPlanRoutes } from "./plans.ts";
import { fileURLToPath } from "node:url";
// --- CRUMB mount: the guided-tour layer. Serves tour DATA (tours/*.md → JSON) under /crumb; the
// client crumb-live.js drives grain's passthrough lamp + a <dialog> popover + real navigation. ---
import { createCrumbRoutes } from "@tjakoen/crumb/routes.ts";

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
const PAGE_HEAD = `<script src="/scripts/theme-boot.js"></script><link rel="stylesheet" href="/styles/variables.css"><link rel="stylesheet" href="/styles/global.css"><link rel="stylesheet" href="/styles/grain.css"><link rel="stylesheet" href="/components.css"><script src="/site/site.js"></script><link rel="stylesheet" href="/crumb.css">`;
const PAGE_ASSETS = `${CATALOG_ASSETS}<link rel="stylesheet" href="/styles/lightbox.css"><script src="/scripts/lightbox.js" defer></script><script src="/scripts/shell.js" defer></script><script src="/scripts/catalog-peek.js" defer></script><script type="module" src="/scripts/ai-dispatch.js"></script><script type="module" src="/scripts/tabs.js"></script><script type="module" src="/scripts/terminal.js"></script><script type="module" src="/scripts/xray.js"></script><script type="module" src="/scripts/notepad.js"></script><script type="module" src="/site/desk-commands.js"></script><script type="module" src="/crumb-live.js"></script>`;
// ONE page server now — the portfolio IS the app (composition root folded in). Every page
// composes with LIVE data (the welcome page's Recent = the newest notes from MILL frontmatter);
// the static export freezes what this renders (§18 — projection, not re-render). The /loop +
// /about demo pages ignore the injected recentNotes; injecting it everywhere costs nothing.
// Dev seam for the DESK's client door: the export stamps data-ai-transport="client" on the frozen
// site (tools/export.ts); in dev the server door (SSE) is used, so the real WebLLM path is untested.
// Set AI_DOOR=1 (`AI_DOOR=1 bun run dev`) to stamp the same client-transport + desk-door markers on
// live pages, so the local-model path can be exercised in a WebGPU browser without exporting first.
const stampDevDoor = (html: string): string =>
  Bun.env.AI_DOOR
    ? html.replace(/<body\b/, '<body data-ai-transport="client" data-ai-door="/modules/portfolio/ai/desk-door.js"')
    : html;
// /calendar's Agenda (Pass 2 — Calendar): data/desk-feed.json is hand-authored dressing — the
// desk's own shipped-things posts, read server-side ONLY (never a client fetch, so it carries no
// export dataRoute, unlike /notes.json etc.) — merged with real note publish dates
// (content.ts's listNoteCalendarEvents) into one calendarEvents array. Read once at boot, same
// idiom as PROOF_CSS above; a new post means a restart, same as a new note or plan.
interface DeskFeedPost {
  id: string; date: string; title: string; body: string; tags: string[]; link: string; icon: string;
  kind?: string; location?: string; photos?: string[]; links?: Array<{ href: string; label: string }>;
}
const deskFeedPosts: DeskFeedPost[] =
  await Bun.file(join(import.meta.dir, "..", "data", "desk-feed.json")).json();
async function buildCalendarEvents(): Promise<CalendarEvent[]> {
  // Three sources merged into ONE feed (Apps-v2 Pass C): note publish dates + the hand-authored
  // desk-feed "shipped" posts + the MILL-authored events collection (hackathons/talks/highlights).
  const [noteEvents, eventEvents] = await Promise.all([listNoteCalendarEvents(), listEventCalendarEvents()]);
  const postEvents: CalendarEvent[] = deskFeedPosts.map((p) => {
    const kind = p.kind ?? "shipped";
    return {
      id: `post-${p.id}`,
      domId: `evt-post-${p.id}`,
      date: p.date,
      dateLabel: p.date,
      kind,
      kindLabel: kindLabel(kind),
      title: p.title,
      body: p.body,
      tags: p.tags,
      tagsLabel: p.tags.join(", "),
      tagsAttr: p.tags.join(" "),
      locationLabel: p.location ?? "",
      photos: parsePhotos(p.photos),
      links: p.links ?? [],
      link: p.link,
      icon: p.icon,
    };
  });
  // newest-first, same convention as the old hardcoded feed (a stable id breaks date ties).
  return [...noteEvents, ...postEvents, ...eventEvents]
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
// /mail (Apps-v2 Pass B): data/mailbox.json is hand-authored dressing too — every "message" is page
// copy written ahead of time (never a real received mail), read server-side ONLY (no client fetch,
// so no export dataRoute), same boot-read idiom as deskFeedPosts. The view models below are what the
// mail-folder/mail-row/mail-reader molecules bind to; folder counts are computed from the messages
// so they can never drift, and the list/reader dates are server-formatted absolute (export-safe,
// never rots — the island rewrites the list's [data-relativize] spans to "N days ago" client-side).
interface MailLink { href: string; label: string; }
interface MailMessageRaw {
  id: string; folder: string; from: string; subject: string; snippet: string;
  date: string; whenLabel?: string; body: string; links: MailLink[];
}
interface MailboxData { folders: Array<{ id: string; label: string }>; messages: MailMessageRaw[]; }
const mailbox: MailboxData = await Bun.file(join(import.meta.dir, "..", "data", "mailbox.json")).json();
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Parse the ISO date's own digits (no Date(), so a machine timezone can't shift "Jul 14" to the 13th).
const fmtDate = (iso: string, withYear: boolean): string => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "";
  return `${MONTHS[m - 1]} ${d}${withYear ? `, ${y}` : ""}`;
};
const mailFolders = mailbox.folders.map((f) => ({
  ...f, count: mailbox.messages.filter((m) => m.folder === f.id).length,
}));
const mailMessages = mailbox.messages.map((m) => {
  const whenFull = m.date ? fmtDate(m.date, true) : (m.whenLabel ?? "");
  return {
    id: m.id, folder: m.folder, from: m.from, subject: m.subject, snippet: m.snippet,
    body: m.body, links: m.links,
    domId: `msg-${m.id}`, href: `#msg-${m.id}`,
    whenText: m.date ? fmtDate(m.date, false) : (m.whenLabel ?? ""),   // list column: short "Jul 14" or the literal label
    whenDate: m.date,                                                   // "" for undated → binding omits data-date (no relativize)
    whenTitle: m.date ? whenFull : "",                                  // absolute stays in title when the list span relativizes
    metaLabel: `The Desk → You · ${whenFull}`,                          // reader meta line (always absolute)
  };
});

// /resume + /about's CV tab (About pages pass): data/cv.json is the single source for the résumé —
// the full chronological timeline plus education/skills/languages/certs — read server-side only at
// boot (no client fetch, no export dataRoute), same idiom as deskFeedPosts/mailbox. Rendered by the
// cv-entry/cv-bullet/cv-link/cv-skill molecules on BOTH /resume (the page) and /about's CV tab, so the
// content lives in exactly one place. /cv serves the same sheet and auto-prints (see fetch below).
interface CvRoleRaw {
  title: string; company: string; location: string; start: string; end: string;
  current?: boolean; roleTag?: string; summary: string; bullets: string[];
  links?: Array<{ href: string; label: string }>;
  photo?: string; photoAlt?: string;   // optional experience photo (0..1); empty today, fill in cv.json later
}
interface CvData {
  summary: string; roles: CvRoleRaw[];
  education: Array<{ school: string; credential: string; start: string; end: string; notes: string[] }>;
  stats: Array<{ value: string; label: string; sub?: string }>;
  primarySkills: Array<{ text: string; href?: string }>;
  skills: Array<{ group: string; items: string[] }>;
  languages: string[];
  certs: Array<{ name: string; issuer: string; date: string }>;
}
const cv: CvData = await Bun.file(join(import.meta.dir, "..", "data", "cv.json")).json();
// Experience + education share the cv-entry molecule (same shape). Bullets/notes become {text}
// objects so the nested each="bullets" binds a field (the renderer binds fields, not bare strings).
const toCvEntry = (e: {
  domId: string; roleTag?: string; title: string; company: string; dateRange: string;
  location?: string; summary?: string; bullets: string[]; links?: Array<{ href: string; label: string }>;
  photos?: Array<{ src: string; alt: string }>;
}) => ({
  domId: e.domId, roleTag: e.roleTag ?? "", title: e.title, company: e.company, dateRange: e.dateRange,
  locationLabel: e.location ?? "", summary: e.summary ?? "",
  bullets: e.bullets.map((text) => ({ text })), links: e.links ?? [], photos: e.photos ?? [],
});
const cvRoles = cv.roles.map((r, i) => toCvEntry({
  domId: `xp-${i}`, roleTag: r.roleTag, title: r.title, company: r.company,
  dateRange: `${r.start} to ${r.end}`, location: r.location, summary: r.summary,
  bullets: r.bullets, links: r.links,
  // optional experience photo: a role with a "photo" path in cv.json renders one, none renders nothing
  // (same 0..n gate as links[]). Every role is photoless today; drop a path in later with no code change.
  photos: r.photo ? [{ src: r.photo, alt: r.photoAlt ?? `${r.title}, ${r.company}` }] : [],
}));
const cvEducation = cv.education.map((e, i) => toCvEntry({
  domId: `edu-${i}`, title: e.credential, company: e.school,
  dateRange: `${e.start} to ${e.end}`, bullets: e.notes ?? [],
}));
const cvSkills = cv.skills.map((s) => ({ group: s.group, itemsLabel: s.items.join(" · ") }));
const cvCerts = cv.certs.map((c) => ({ text: `${c.name} (${c.issuer}), ${c.date}` }));
const cvStats = cv.stats.map((s) => ({ value: s.value, label: s.label, sub: s.sub ?? "" }));
const cvPrimary = cv.primarySkills.map((s) => ({ text: s.text, href: s.href ?? "" }));
const cvLanguages = cv.languages.join(" · ");
const cvSummary = cv.summary;

const renderAppPage = async (html: string) =>
  stampDevDoor(await renderPage(html, {
    recentNotes: await listRecentNotes(), calendarEvents: await buildCalendarEvents(),
    mailFolders, mailMessages,
    cvRoles, cvEducation, cvSkills, cvCerts, cvStats, cvPrimary, cvLanguages, cvSummary,
  }));
const servePage = makePageServer(bunRuntime, config.pagesDir, renderAppPage, PAGE_ASSETS, PAGE_HEAD);
// Give every page's main content region a catalog hover-root so grain's usage→specimen bridge
// (grain/scripts/catalog-peek.js) works SITE-WIDE, not only on /grain: with the Catalog pane open,
// hovering any catalogued GRAIN component (a button, field, list, badge, tab…) reveals its entry in
// the pane. Pages that already declare their OWN [data-peek-root] (only /grain, scoped to its
// showcase) are left alone, so their tuned scope is preserved. `<main class="app-shell__main">` is
// the one content wrapper every page (static + MILL + the reference/plans chrome) shares.
function withPeekRoot(html: string): string {
  if (html.includes("data-peek-root")) return html;
  return html.replace('<main class="app-shell__main"', '<main data-peek-root class="app-shell__main"');
}

// Finalize every full-document HTML response: (1) enrich the head (seo.ts) with canonical + Open
// Graph + Twitter + schema.org JSON-LD derived from the page's own title/description + path; (2) mark
// the content region as a catalog hover-root. No-op on non-HTML and on fragments (enrichHead needs a
// </head>), so it is safe to wrap broadly; the static export inherits both (it crawls this server)
// and rewrites the origin to the deploy URL.
async function finalizePage(req: Request, res: Response | Promise<Response>): Promise<Response> {
  const r = await res;
  if (!r.headers.get("content-type")?.includes("text/html")) return r;
  let html = enrichHead(await r.text(), new URL(req.url).pathname, new URL(req.url).origin);
  html = withPeekRoot(html);
  return new Response(html, { status: r.status, headers: r.headers });
}
const serveContent = createPortfolioContentRoutes(
  async (html: string) => stampDevDoor(await renderPage(html)),
  PAGE_ASSETS, PAGE_HEAD,
);   // MILL mount (same global assets + head) — desk-door marker stamped so the WebLLM path can arm
// /loop, frozen (Phase 2, §18): splice the live task list into the placeholder the composed page
// already carries (pages/loop.html's `#loop-list` div). A static crawl has no backend to htmx-fetch
// /ui/loop from, so without this the exported page would show the page's resting "Loading…" shell
// forever — this makes the FIRST paint (dev server AND export alike) the real board. The live dev
// server's own hx-get on load still re-fetches once more after this (same data, so no visible
// change); the export strips that hx- pair (tools/export.ts transformPage) since it has nowhere to
// fetch it from.
async function freezeLoopList(res: Response): Promise<Response> {
  const html = await res.text();
  const list = await renderLoopListFragment(service);
  const out = html.replace(
    /(<div id="loop-list"[^>]*>)[\s\S]*?(<\/div>)/,
    (_m, open: string, close: string) => `${open}${list}${close}`,
  );
  return new Response(out, { headers: res.headers });
}
// PROOF mount: the portfolio consumes @tjakoen/proof directly and renders its OWN plans/ folder as a
// board at /plans, wrapped in the portfolio's page shell (proof owns the body, the host owns <head>).
// Server-rendered only for now — the live SSE auto-refresh (watchPlans + board-live.js) is a follow-up
// so it gets its own stream and never crosses the /loop demo's interaction stream (line ~144).
const PROOF_CSS = fileURLToPath(import.meta.resolve("@tjakoen/proof/board.css"));
// Host-owned layer on top of the vendored board.css (never edit the package — this repo just
// serves it, same "proof owns the body, the host owns <head>" split as the mount above). Fixes a
// /plans layout bug: the assistant aside sat empty on the plans screen yet still claimed its full
// column, so the DONE column clipped off-screen with no visible way to reach it. Concatenated
// AFTER the base rules below (see the /proof.css route) so it always wins the cascade.
const PROOF_CSS_OVERRIDES = `
/* portfolio override: the plans screen has no assistant conversation to show, so give the board
   the width back instead of leaving it dead-blank (mirrors app-shell.css's own
   [data-aside-hidden="true"] behavior, keyed off the screen instead of a JS toggle). */
body[data-screen="plans"] .app-shell { --shell-aside: 0rem; }
body[data-screen="plans"] .app-shell__aside { border-left: 0; overflow: hidden; }

/* the plans screen IS the board, not prose — the shared .board wrapper caps content at the
   readable ~768px text measure, which squeezed the four columns into a narrow scrolling strip
   instead of letting them spread. Drop the cap here so the board uses the full main width. */
body[data-screen="plans"] .board { max-width: none; }

/* a visible scroll cue (a plain native scrollbar, not just an implicit overflow) + a smaller
   column floor so more of the board fits before anything needs to scroll at all. */
.proof-board {
  grid-auto-columns: minmax(13rem, 1fr);
  scrollbar-width: thin;
  scrollbar-color: var(--ink-faint, #999) transparent;
}
.proof-board::-webkit-scrollbar { height: 0.6rem; }
.proof-board::-webkit-scrollbar-thumb { background: var(--ink-faint, #999); border-radius: var(--radius-sm, 3px); }
.proof-board::-webkit-scrollbar-track { background: transparent; }

/* mobile: stack the columns instead of a sideways scroll — a thumb doesn't have the horizontal
   room a mouse-driven overflow assumes. */
@media (max-width: 640px) {
  .proof-board { grid-auto-flow: row; grid-auto-columns: unset; overflow-x: visible; }
}
`;
const proofRoutes = createProofRoutes({
  plansDir: PLANS_DIR,
  prefix: PLANS_PREFIX,
  chrome: (title, body) => renderAppPage(`<!DOCTYPE html>
<html lang="en" data-themes="sourdough baguette brioche">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} · Plans</title>
  ${PAGE_HEAD}<link rel="stylesheet" href="/proof.css">
</head>
<body data-screen="plans" class="app-window-backdrop">
  <div class="app-shell app-window" data-section="docs" data-rail-collapsed="false" data-surface="screen">
    <portfolio-frame />
    <main class="app-shell__main"><div class="board">${body}</div></main>
  </div>
${PAGE_ASSETS}</body>
</html>`),
});
// --- CRUMB: the guided-tour layer. tours/*.md → parsed JSON under /crumb (createCrumbRoutes); the
// client crumb-live.js + crumb.css are static assets this host serves from the package. The tour
// never writes — it reuses grain's traveling lamp (passthrough mode, B0) to light surfaces. ---
const CRUMB_TOURS = fileURLToPath(new URL("./tours", import.meta.url));
const CRUMB_LIVE = fileURLToPath(import.meta.resolve("@tjakoen/crumb/crumb-live.js"));
const CRUMB_CSS = fileURLToPath(import.meta.resolve("@tjakoen/crumb/crumb.css"));
const crumbRoutes = createCrumbRoutes({ toursDir: CRUMB_TOURS });   // prefix defaults to /crumb

// HOST-side workaround, same idiom as PROOF_CSS_OVERRIDES above (never edit the vendored
// package): @tjakoen/proof's board.ts emits a plan card's link as the root-absolute "/plan/<id>"
// regardless of the mount prefix it's actually given — a package bug (confirmed live: it 404s
// under this app's "/plans" mount). Rewrite it to the route PROOF itself answers
// (`${PLANS_PREFIX}/plan/<id>`, see routes.ts's `rel.startsWith("/plan/")` check) so a real click
// doesn't 404 and the export's dead-link check (tools/verify-export.ts) doesn't flag it.
async function fixProofCardLinks(res: Response): Promise<Response> {
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) return res;   // /plans.json etc. carry no such href
  const html = await res.text();
  const fixed = html.replaceAll('href="/plan/', `href="${PLANS_PREFIX}/plan/`);
  return new Response(fixed, { headers: res.headers });
}
const styles = createStyleBundle(bunRuntime, config.styleRoots);        // per-component CSS + GRAIN's AI module → /components.css
// The sitemap covers EVERYTHING this server actually serves: the portfolio pages tree + MILL's
// content routes + PROOF's plan routes (SEO is first-class — content pages must be discoverable,
// and the export derives its allowlist from the same lists). Routes are computed at boot;
// authoring a note/plan = a restart/redeploy anyway (the export freezes per deploy).
const contentRoutes = await listPortfolioContentRoutes();
const planRoutes = await listPlanRoutes();
const sitemap = createSitemap(config.pagesDir, () => [...contentRoutes, ...planRoutes, "/reference"]);   // pages tree + MILL content + PROOF's plans + the generated reference
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
    // flavors are DEFINED in variables.css :root + the themes/ reference files (@imported there).
    // Read from GRAIN's package dir (config.grainDir), not a cwd path, so this survives the split.
    const stylesDir = join(config.grainDir, "styles");
    let css = await Bun.file(join(stylesDir, "variables.css")).text();
    for await (const rel of new Bun.Glob("*.css").scan(join(stylesDir, "themes")))
      css += "\n" + await Bun.file(join(stylesDir, "themes", rel)).text();
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
// Roots are cwd-independent (config.ts's rule): grain = the installed package dir, portfolio =
// this repo dir — the old "./grain" / "./tjakoen.github.io" cwd paths were monorepo-era and 404'd
// every /modules/* request in the standalone repo, freezing ZERO modules into the export.
const modules = makeModuleServer(bunRuntime, { roots: { grain: config.grainDir, portfolio: import.meta.dir } });

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
  watchComponents(join(config.grainDir, "ai"), () => { styles.refresh(); modules.refresh(); });   // ai.css (bundled) + client modules

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

// Binary media (the og-card.png social image): same reason as fonts — makeStatic reads as text and
// has no .png type, so it would mistype + corrupt the image. Bun.file preserves bytes and infers the
// type. The static EXPORT copies config.assetDirs verbatim (images byte-for-byte), so /media needs no
// export change; only the LIVE server needs this binary short-circuit (before the static loop).
const MEDIA_ROOT = resolve(join(fileURLToPath(import.meta.url), "..", "..", "media"));
async function serveMedia(rel: string): Promise<Response> {
  const fp = resolve(normalize(join(MEDIA_ROOT, rel)));
  if (fp !== MEDIA_ROOT && !fp.startsWith(MEDIA_ROOT + sep)) return new Response("Forbidden", { status: 403 });
  const file = Bun.file(fp);
  if (!(await file.exists())) return new Response("Not found", { status: 404 });
  return new Response(file, { headers: { "Cache-Control": "public, max-age=31536000, immutable" } });
}

Bun.serve({
  port: config.port,
  routes: {
    ...buildAiRoutes(service, stream, aiLayer, accepts),   // /intent, /stream, /ai/manifest, /ui/loop
    "/components.css": async () =>
      new Response(await styles.css(), { headers: { "Content-Type": "text/css" } }),
    "/proof.css": async () =>
      new Response((await Bun.file(PROOF_CSS).text()) + PROOF_CSS_OVERRIDES, { headers: { "Content-Type": "text/css" } }),
    // CRUMB's client + popover CSS, served straight from the package (never vendored) — the same
    // "host serves the layer's static asset" split as /proof.css. Injected into every app page
    // (PAGE_HEAD/PAGE_ASSETS) so the dock's Tour launcher works and tours resume across navigation.
    "/crumb-live.js": async () =>
      new Response(await Bun.file(CRUMB_LIVE).text(), { headers: { "Content-Type": "text/javascript; charset=utf-8" } }),
    "/crumb.css": async () =>
      new Response(await Bun.file(CRUMB_CSS).text(), { headers: { "Content-Type": "text/css" } }),
    "/catalog": async (req: Request) =>
      finalizePage(req, new Response(await catalog.html(), { headers: { "Content-Type": "text/html; charset=utf-8" } })),
    // /reference — the GENERATED developer-docs reference (DEV-DOCS.md step 5): the AI vocabulary
    // + token slots read from the real registries (grain/ai/vocab-reference.ts), never hand-copied.
    "/reference": async (req: Request) => {
      const body = await buildVocabReference(join(config.grainDir, "styles", "variables.css"));
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
      return finalizePage(req, new Response(await renderAppPage(page), { headers: { "Content-Type": "text/html; charset=utf-8" } }));
    },
    // /notes — the portfolio-owned feed (content.ts renderNotesFeedPage): the /notes collection
    // opts OUT of MILL's own index serving (index: false, content.ts), so this route wins over
    // the MILL mount below (registered `routes` beat the `fetch` chain in Bun.serve). Individual
    // entries (/notes/:slug) still go through MILL untouched.
    "/notes": async (req: Request) =>
      finalizePage(req, new Response(await renderAppPage(await renderNotesFeedPage(PAGE_ASSETS, PAGE_HEAD)),
        { headers: { "Content-Type": "text/html; charset=utf-8" } })),
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
    // the desk's grounding corpus: every note + layer doc + the facts block, compiled to chunks
    // with a df table (content.ts/ai). The browser model fetches this, never the repo. A data route
    // (§18) so the export freezes it alongside /search.json.
    "/knowledge.json": async () => Response.json(await buildPortfolioKnowledge()),
    // newest-first notes ({slug,title,route}) for the desk's "open the latest note" action.
    "/notes.json": async () => Response.json(await listPortfolioNotes()),
    // Trailing-slash CANONICAL urls, not batch's sitemap.xml() as-is: this app is hosted on
    // GitHub Pages (dist/<route>/index.html), which serves a directory at its OWN url (e.g.
    // "/grain/") and 301-redirects the extensionless form ("/grain") to it. Listing the
    // redirecting form in the sitemap means every crawl/audit takes an avoidable extra hop —
    // so this route reuses sitemap.routes() (still the one source of truth) but formats each
    // non-root route with a trailing slash before writing the XML.
    "/sitemap.xml": (req: Request) => {
      const origin = new URL(req.url).origin;
      const escXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
      const canonical = (p: string) => p === "/" ? "/" : `${p}/`;
      const urls = sitemap.routes().map((p) => `  <url><loc>${escXml(origin + canonical(p))}</loc></url>`).join("\n");
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
      return new Response(xml, { headers: { "Content-Type": "application/xml" } });
    },
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
    if (p.startsWith("/media/")) return serveMedia(p.slice("/media".length));  // binary: the og-card.png
    if (p.startsWith("/modules/")) return modules.serve(p);                    // client-safe TS → browser JS
    for (const [prefix, serve] of staticServers)
      if (p.startsWith(prefix + "/")) return serve(p.slice(prefix.length));    // strip prefix → mapped dir
    // --- PROOF mount: the plan board (/plans, /plans/plan/:id) — try before MILL/pages ---
    const fromProof = await proofRoutes(p);
    if (fromProof) return finalizePage(req, fixProofCardLinks(fromProof));
    // --- CRUMB mount: the guided-tour DATA (/crumb/tours.json, /crumb/tours/:id.json). Pure JSON
    // the client fetches to run a tour — NOT a page, so it skips finalizePage's HTML shell. ---
    const fromCrumb = await crumbRoutes(p);
    if (fromCrumb) return fromCrumb;
    // --- MILL mount: live content routes (/notes, /grain/docs, /batch/docs) ---
    const fromContent = await serveContent(p);
    if (fromContent) return finalizePage(req, fromContent);
    // /cv — the "straight to download" twin of /resume: serve the exact same rendered résumé sheet
    // (single source, no markup fork) plus a tiny script that fires the browser print/save-as-PDF
    // dialog on load. The résumé's own @media print rules produce the clean white ATS sheet. Exported
    // via the pageRoutes allowlist in tools/export.ts, so the static /cv works the same on GitHub Pages.
    if (p === "/cv" || p === "/cv/") {
      const sheet = await servePage("/resume");
      if (sheet.status === 200) {
        const html = (await sheet.text()).replace(
          "</body>",
          `<script>addEventListener("load",function(){setTimeout(function(){try{window.print();}catch(e){}},350);});</script></body>`,
        );
        return finalizePage(req, new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }));
      }
    }
    // the portfolio's own pages tree: "/" (home), "/grain"·"/batch" showcases, /loop + /about
    const page = await servePage(p);
    // /loop, frozen (Phase 2, §18): server-render the initial task list into the page HTML here
    // so a crawl with no backend (the static export) captures a real board — see
    // routes/ai-routes.ts renderLoopListFragment (the same fragment /ui/loop answers with) and
    // pages/loop.html (the placeholder div + the banner/composer gate).
    if ((p === "/loop" || p === "/loop/") && page.status === 200) return finalizePage(req, freezeLoopList(page));
    return finalizePage(req, page);
  },
});

console.log(`Running on http://localhost:${config.port} (${config.isDev ? "dev" : "prod"})`);
