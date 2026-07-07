// portfolio/content.ts — piece 4: the portfolio's MILL wiring (consumer-owned).
//
// Three collections flow through MILL's live content route (mill/serve.ts):
//   /notes       + /notes/:slug   ← portfolio/notes/*.md   (the portfolio's own content)
//   /grain/docs  + /grain/docs/:slug ← the INSTALLED @tjakoen/grain package's docs/
//   /batch/docs  + /batch/docs/:slug ← the INSTALLED @tjakoen/batch package's docs/
//
// Layer docs are package-resolved on purpose (packageDocsSource → import.meta.resolve):
// in the monorepo that lands on the sibling grain/docs/, post-split on the git-dep —
// same code both eras, zero copied files. NEVER a `../grain/docs` relative path
// (../SPLIT-PLAN.md § "Layer docs travel inside the package").
//
// The chrome wraps every content page in the BREAD workspace shell (portfolio-frame);
// the injected renderPage composes that tag — and any escape-hatch <b-…> tags an author
// wrote in the Markdown — at request time.
import {
  createMillRoutes, dirSource, listMillRoutes, listMillRawRoutes, packageDocsSource,
  type MillCollection, type MillRequestHandler, type PageChrome,
} from "../mill/serve.ts";
import { escapeHtml } from "../mill/core/engine.ts";
import { parseFrontmatter } from "../mill/core/frontmatter.ts";

// ---- link resolution --------------------------------------------------------
// Docs cross-link each other as relative .md paths (./AI-INTERFACE.md,
// ../../batch/docs/ARCHITECTURE.md). Rewrite the ones we render; the rest
// (README/PHILOSOPHY/plan files) have no rendered page and ship as-authored —
// KNOWN GAP: the export's dead-link warning only sees root-absolute hrefs
// (batch/export/rewrite.ts extractRefs), so these relative leftovers are NOT
// caught by it; they 404 on the site until those docs get rendered pages.
const mdSlug = (file: string) => file.replace(/\.md$/, "").toLowerCase();

function docsLink(currentPrefix: string) {
  return (href: string): string => {
    const [path, frag = ""] = href.split(/(#.*)$/, 2);
    const cross = path.match(/(?:^|\/)(grain|batch)\/docs\/([A-Za-z0-9._-]+)\.md$/);
    if (cross) return `/${cross[1]}/docs/${mdSlug(cross[2])}${frag}`;
    const local = path.match(/^(?:\.\/)?([A-Za-z0-9._-]+)\.md$/);
    if (local) return `${currentPrefix}/${mdSlug(local[1])}${frag}`;
    return href;
  };
}

// Notes link to each other as bare siblings (why-i-teach.md) or note:slug (MILL's default).
function notesLink(href: string): string {
  if (href.startsWith("note:")) return "/notes/" + href.slice(5);
  const [path, frag = ""] = href.split(/(#.*)$/, 2);
  const local = path.match(/^(?:\.\/)?([A-Za-z0-9._-]+)\.md$/);
  if (local) return `/notes/${mdSlug(local[1])}${frag}`;
  return href;
}

// ---- the BREAD-shell chrome ---------------------------------------------------
// Mirrors the hand-written portfolio pages (pages/mill/index.html): same head, same
// app-shell + portfolio-frame skeleton, so content pages ARE portfolio pages.
function shellChrome(inject: string, injectHead = ""): PageChrome {
  return ({ kind, title, description, body, collection, slug }) => {
    const screen = collection.prefix.split("/")[1] ?? "notes";   // /notes → notes, /grain/docs → grain
    // THE EDITOR section (rail active + tab group): notes → its own; layer docs live under BREAD.
    const sectionName = collection.prefix === "/notes" ? "notes" : "bread";
    const section = ` data-section="${sectionName}"`;
    // the honest-source toggle: an entry page links straight to its own raw .md (MILL's
    // honest-source route) — "the site is its own source tree" made clickable.
    const sourceToggle = kind === "entry" && slug
      ? `<nav class="content-source" aria-label="View">
      <a class="tab" aria-current="page" href="${escapeHtml(`${collection.prefix}/${slug}`)}">Rendered</a>
      <a class="tab" href="${escapeHtml(`${collection.prefix}/${slug}.md`)}">Source</a>
    </nav>`
      : "";
    // the notes index's own "watch the AI act" entry point (DEMO-PLAN.md item 1, staged here).
    // Same door, same demo.run verb as /grain's trigger. The reasoner's "notes" screen branch
    // reads the newest entries (data-surface="note:<slug>", above) and writes its digest into
    // the SIDEBAR CHAT (owner feedback, NOTES-PAGE-PLAN.md 2026-07-07) — like anything else the
    // desk says to you — not a card in the reading column; only the trigger stays on the page
    // until chat messages can carry their own action affordances (tracked, not yet built).
    const deskNoteTrigger = kind === "index" && collection.prefix === "/notes"
      ? `<button class="btn" data-variant="soft" data-ai-run data-action="demo.run" data-target="screen" type="button">▷ See what's new</button>`
      : "";
    return `<!DOCTYPE html>
<html lang="en" data-themes="sourdough baguette brioche">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  ${description ? `<meta name="description" content="${escapeHtml(description)}">` : ""}
  ${injectHead}
</head>
<body data-screen="${escapeHtml(screen)}" class="app-window-backdrop">
  <div class="app-shell app-window"${section} data-rail-collapsed="false" data-surface="screen">
    <portfolio-frame />
    <main class="app-shell__main">
      <div class="board">${sourceToggle}${deskNoteTrigger}${body}</div>
    </main>
  </div>
${inject}</body>
</html>`;
  };
}

// The three collections — module-level so the routes AND the route list derive from
// one definition (a new note or doc automatically reaches the sitemap and the export).
const collections: MillCollection[] = [
  {
    prefix: "/notes",
    title: "Notes",
    description: "Long-form notes — how this stack got built, how I teach, and what broke along the way.",
    source: dirSource("tjakoen.github.io/notes"),
    adapter: { resolveLink: notesLink },
    indexVariant: "log",
    itemSurfacePrefix: "note",
  },
  {
    prefix: "/grain/docs",
    title: "GRAIN docs",
    description: "The GRAIN design system's own docs, rendered from the installed package — never copied.",
    source: packageDocsSource("@tjakoen/grain/docs/GRAIN.md"),
    adapter: { resolveLink: docsLink("/grain/docs") },
  },
  {
    prefix: "/batch/docs",
    title: "BATCH docs",
    description: "The BATCH substrate's own docs, rendered from the installed package — never copied.",
    source: packageDocsSource("@tjakoen/batch/docs/ARCHITECTURE.md"),
    adapter: { resolveLink: docsLink("/batch/docs") },
  },
];

/**
 * The portfolio's content routes, ready to mount at the composition root:
 *   const serveContent = createPortfolioContentRoutes(renderPage, GLOBAL_ASSETS);
 *   …in fetch(): const hit = await serveContent(pathname); if (hit) return hit;
 */
export function createPortfolioContentRoutes(
  compose?: (html: string) => Promise<string>,
  inject = "",
  injectHead = "",
): MillRequestHandler {
  return createMillRoutes({ compose, chrome: shellChrome(inject, injectHead), collections });
}

/** Every content route (index + entries per collection) — content pages are exportable
 *  by definition (§18), so the sitemap and the export allowlist both feed from this. */
export function listPortfolioContentRoutes(): Promise<string[]> {
  return listMillRoutes(collections);
}

/** Every entry's raw `.md` twin — a DATA route (literal bytes, no chrome), so a caller feeds
 *  this into an export's `dataRoutes`, never `pages` (§18: content pages must export). */
export function listPortfolioRawContentRoutes(): Promise<string[]> {
  return listMillRawRoutes(collections);
}

// Every note's frontmatter, newest-first (undated last, then by slug) — the SAME order MILL's
// own /notes index uses (mill/serve.ts's byDateDesc). Shared so every OTHER consumer that lists
// notes (the Welcome "Recent" feed, the explorer tree via /search.json) matches it, rather than
// each re-deriving its own order or falling back to alphabetical route order.
async function sortedNoteEntries(): Promise<Array<{ slug: string; title: string; date: string }>> {
  const notes = collections[0]!;                     // the "/notes" collection above
  const entries: Array<{ slug: string; title: string; date: string }> = [];
  for (const slug of await notes.source.list()) {
    const raw = await notes.source.read(slug);
    if (raw === null) continue;
    const fm = parseFrontmatter(raw).data;
    entries.push({
      slug,
      title: typeof fm.title === "string" ? fm.title : slug,
      date: typeof fm.date === "string" ? fm.date : "",
    });
  }
  entries.sort((a, b) => a.date === b.date ? a.slug.localeCompare(b.slug)
    : a.date === "" ? 1 : b.date === "" ? -1 : b.date.localeCompare(a.date));
  return entries;
}

/** The welcome page's "Recent" feed: the newest notes, straight from MILL frontmatter —
 *  server-composed live data (the export freezes it, §18). Shape matches the
 *  <welcome-recent> component's bindings. */
export interface RecentNote { title: string; href: string; path: string; }
export async function listRecentNotes(limit = 4): Promise<RecentNote[]> {
  const entries = await sortedNoteEntries();
  return entries.slice(0, limit).map((e) => ({
    title: e.title, href: `/notes/${e.slug}`, path: `notes/${e.slug}.md`,
  }));
}

/** Every note's route in newest-first order — for any consumer that lists ALL notes and must
 *  match the /notes index's order (currently: /search.json, feeding the explorer tree's
 *  notes/ entries so the sidebar menu reflects the same date order as the page itself). */
export async function listNoteRoutesByDate(): Promise<string[]> {
  return (await sortedNoteEntries()).map((e) => `/notes/${e.slug}`);
}
