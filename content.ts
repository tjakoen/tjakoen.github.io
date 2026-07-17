// portfolio/content.ts — piece 4: the portfolio's MILL wiring (consumer-owned).
//
// Three collections flow through MILL's live content route (mill/serve.ts):
//   /notes       + /notes/:slug   ← portfolio/notes/*.md   (the portfolio's own content)
//   /grain/docs  + /grain/docs/:slug ← this repo's own docs/grain/  (option b, 2026-07-09)
//   /batch/docs  + /batch/docs/:slug ← this repo's own docs/batch/  (option b, 2026-07-09)
//
// Layer docs are now canonically homed HERE (docs/<layer>/) and resolved with dirSource
// (owner decision, plans/d4-docs-home-option-b.md): the portfolio is the physical home of
// the stack's explanatory docs; the layer repos keep a thin README pointer. Other consumers
// (pantry) resolve them out of THIS repo's package (./docs/* export), never each layer's.
//
// The chrome wraps every content page in the BREAD workspace shell (portfolio-frame);
// the injected renderPage composes that tag — and any escape-hatch <b-…> tags an author
// wrote in the Markdown — at request time.
import {
  createMillRoutes, dirSource, listMillRoutes, listMillRawRoutes,
  type ContentSource, type MillCollection, type MillRequestHandler, type PageChrome,
} from "@tjakoen/mill/serve.ts";
import { escapeHtml } from "@tjakoen/mill/core/engine.ts";
import { parseFrontmatter } from "@tjakoen/mill/core/frontmatter.ts";
import { join, basename } from "node:path";
import { readdir, lstat } from "node:fs/promises";
import { buildKnowledge, type KnowledgeSource } from "./ai/knowledge.ts";
import { FACTS_ROUTE, type Knowledge } from "./ai/retrieval.ts";

// A dirSource that ignores symlinked .md files. `standards/AGENTS.md` is a symlink to CLAUDE.md
// (the AGENTS.md tooling convention — an agent that opens the folder finds it), but dirSource
// harvests any *.md by filename, so the alias would render the SAME doc under two slugs
// (/standards/agents duplicating /standards/claude). This drops symlinked entries from the
// collection: the alias stays on disk for tools, the rendered index lists each doc once.
function realFilesSource(dir: string): ContentSource {
  const base = dirSource(dir);
  const aliasSlugs = async (): Promise<Set<string>> => {
    const out = new Set<string>();
    for (const f of await readdir(dir)) {
      if (!f.endsWith(".md")) continue;
      if ((await lstat(join(dir, f))).isSymbolicLink()) out.add(basename(f, ".md").toLowerCase());
    }
    return out;
  };
  return {
    list: async () => {
      const drop = await aliasSlugs();
      return (await base.list()).filter((slug) => !drop.has(slug));
    },
    read: async (slug) => ((await aliasSlugs()).has(slug.toLowerCase()) ? null : base.read(slug)),
  };
}

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
    source: dirSource(join(import.meta.dir, "notes")),
    adapter: { resolveLink: notesLink },
    indexVariant: "log",
    itemSurfacePrefix: "note",
    // The portfolio owns the /notes INDEX as a Reddit-style feed (renderNotesFeedPage, below) —
    // a route override MILL has no hook for (the one gap: a proposed grain follow-up is an
    // `indexRenderer` hook on MillCollection). MILL still renders each entry (/notes/:slug)
    // untouched; only the listing itself is opted out here.
    index: false,
  },
  {
    prefix: "/grain/docs",
    title: "GRAIN docs",
    description: "The GRAIN design system's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(join(import.meta.dir, "docs/grain")),
    adapter: { resolveLink: docsLink("/grain/docs") },
  },
  {
    prefix: "/batch/docs",
    title: "BATCH docs",
    description: "The BATCH substrate's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(join(import.meta.dir, "docs/batch")),
    adapter: { resolveLink: docsLink("/batch/docs") },
  },
  {
    // The canonical home of the cross-repo standards. Since 2026-07-09 the standards source lives
    // HERE (standards/), the same option-b move used for the layer docs: every repo's CLAUDE.md
    // points at https://tjakoen.github.io/standards, and THIS collection is what makes that URL real.
    // PANTRY resolves the same files out of this repo's package (./standards/* export).
    prefix: "/standards",
    title: "Standards",
    description: "The cross-repo standards — how I build with an AI, how anything under my byline reads, and how a repo is set up. Canonically homed here and rendered through MILL.",
    source: realFilesSource(join(import.meta.dir, "standards")),
    adapter: { resolveLink: docsLink("/standards") },
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
export async function listPortfolioContentRoutes(): Promise<string[]> {
  const routes = await listMillRoutes(collections);
  // /notes is opted OUT of MILL's own index serving (index: false, above) — the portfolio
  // serves that route itself (renderNotesFeedPage, mounted at server.ts). Re-append it so the
  // sitemap, /search.json's page list, and the export allowlist still carry the route.
  if (!routes.includes("/notes")) routes.push("/notes");
  return routes;
}

/** Every entry's raw `.md` twin — a DATA route (literal bytes, no chrome), so a caller feeds
 *  this into an export's `dataRoutes`, never `pages` (§18: content pages must export). */
export function listPortfolioRawContentRoutes(): Promise<string[]> {
  return listMillRawRoutes(collections);
}

// ---- the desk's build-time knowledge corpus (ai/knowledge.ts) -----------------
// The local browser model is grounded on the SITE'S OWN CONTENT: every note + the layer docs, plus
// a hand-authored facts block. /standards is skipped (internal), and the PLAN/FEATURES/CONTENT docs
// are simply not collections here, so they never enter the corpus. Served frozen as /knowledge.json
// (§18 data route) so the export freezes it and the model fetches it, never the repo.
export async function listKnowledgeSources(): Promise<KnowledgeSource[]> {
  const out: KnowledgeSource[] = [];
  for (const col of collections) {
    if (col.prefix === "/standards") continue;           // internal standards — not desk grounding
    for (const slug of await col.source.list()) {
      const raw = await col.source.read(slug);
      if (raw === null) continue;
      const { data, body } = parseFrontmatter(raw);
      out.push({
        route: `${col.prefix}/${slug}`,
        title: typeof data.title === "string" ? data.title : slug,
        markdown: body,
      });
    }
  }
  // the hand-authored grounding (bio, "What is BREAD?", how the site is built) — covers the chips.
  const factsRaw = await Bun.file(join(import.meta.dir, "ai", "facts.md")).text();
  const facts = parseFrontmatter(factsRaw);
  out.push({
    route: FACTS_ROUTE,
    title: typeof facts.data.title === "string" ? facts.data.title : "About",
    markdown: facts.body,
  });
  return out;
}

/** The compiled corpus the desk retrieves against — served at /knowledge.json (and frozen by the
 *  export). Built from the live content each call; the corpus is small, so no cache is needed. */
export async function buildPortfolioKnowledge(): Promise<Knowledge> {
  return buildKnowledge(await listKnowledgeSources());
}

// Every note's frontmatter, newest-first (undated last, then by slug) — the SAME order MILL's
// own /notes index uses (mill/serve.ts's byDateDesc). Shared so every OTHER consumer that lists
// notes (the Welcome "Recent" feed, the explorer tree via /search.json, and the /notes feed
// itself) matches it, rather than each re-deriving its own order or falling back to alphabetical
// route order.
//
// Widened (Pass 1 — Notes feed) to carry the full frontmatter the feed cards need: `score` is
// the real reading-minutes number parsed from `readingTime` (the "vote" glyph — a tooltip on the
// card says so, it is never a popularity count), and `sections` is a real count of `## ` headings
// in the note's own body (the feed's "N sections" link, standing in for a comment count).
export interface NoteFeedEntry {
  slug: string;
  title: string;
  date: string;
  subtitle: string;
  summary: string;
  readingTime: string;
  score: number;
  tags: string[];
  sections: number;
}
async function sortedNoteEntries(): Promise<NoteFeedEntry[]> {
  const notes = collections[0]!;                     // the "/notes" collection above
  const entries: NoteFeedEntry[] = [];
  for (const slug of await notes.source.list()) {
    const raw = await notes.source.read(slug);
    if (raw === null) continue;
    const { data: fm, body } = parseFrontmatter(raw);
    const readingTime = typeof fm.readingTime === "string" ? fm.readingTime : "";
    const scoreMatch = readingTime.match(/\d+/);
    entries.push({
      slug,
      title: typeof fm.title === "string" ? fm.title : slug,
      date: typeof fm.date === "string" ? fm.date : "",
      subtitle: typeof fm.subtitle === "string" ? fm.subtitle : "",
      summary: typeof fm.summary === "string" ? fm.summary : "",
      readingTime,
      score: scoreMatch ? Number(scoreMatch[0]) : 0,
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      sections: (body.match(/^## /gm) ?? []).length,
    });
  }
  entries.sort((a, b) => a.date === b.date ? a.slug.localeCompare(b.slug)
    : a.date === "" ? 1 : b.date === "" ? -1 : b.date.localeCompare(a.date));
  return entries;
}

/** The /notes index, server-composed as a Reddit-style feed (Pass 1 — Notes: a route override,
 *  not a MILL fork — the /notes collection opts out of MILL's own index serving above). Cards
 *  carry `data-surface="note:<slug>"` (the reasoner's travel target, notes-demo.e2e.ts) and are
 *  wrapped with the SAME `shellChrome` every MILL content page uses (`kind: "index"`), so
 *  `data-screen/data-section="notes"` and the "See what's new" AI trigger come for free. The
 *  New/Top sort + tag filter are a small inline island that only reorders/hides the `<li>` nodes
 *  already in the page (no fetch, no new data route); with no JS the list stays newest-first and
 *  the controls stay hidden. "Top" sorts by `score` — real reading minutes parsed from each
 *  note's own `readingTime` frontmatter, never a vote count (the vote glyph says so via its
 *  `title`). "N sections" is a real count of `## ` headings in the note's body, standing in for
 *  a comment count and linking straight into the entry. */
/** The flagship note, PINNED to the top of the /notes feed (owner ask 2026-07-17). Pinned in the
 *  FEED only: sortedNoteEntries stays date-ordered so the Welcome "Recent" list and the sidebar
 *  tree keep showing genuinely-recent notes first. */
export const FLAGSHIP_NOTE_SLUG = "ten-times-zero";

export async function renderNotesFeedPage(inject = "", injectHead = ""): Promise<string> {
  const notes = collections[0]!;                     // the "/notes" collection above
  const dated = await sortedNoteEntries();
  // float the flagship to the front (date order preserved for everything after it)
  const entries = [
    ...dated.filter((e) => e.slug === FLAGSHIP_NOTE_SLUG),
    ...dated.filter((e) => e.slug !== FLAGSHIP_NOTE_SLUG),
  ];

  // the union of every note's tags, in first-seen (newest-first) order — from the DATE-ordered list
  // so the tag chips keep their newest-first order regardless of the pin. Stable across renders.
  const allTags: string[] = [];
  for (const e of dated) for (const t of e.tags) if (!allTags.includes(t)) allTags.push(t);
  const tagChips = allTags.map((t) => {
    const tag = escapeHtml(t);
    return `<label class="chip"><input type="checkbox" value="${tag}"> ${tag}</label>`;
  }).join("");

  const cards = entries.map((e) => {
    const slug = escapeHtml(e.slug);
    const date = escapeHtml(e.date);
    const time = e.date ? `<time datetime="${date}">${date}</time>` : "";
    const byline = `Tjakoen Stolk · the desk${time ? ` · ${time}` : ""}`;
    const summary = escapeHtml(e.summary || e.subtitle);
    const tags = e.tags.map((t) => `<span class="badge" data-status="active">${escapeHtml(t)}</span>`).join("");
    const dataTags = escapeHtml(e.tags.join(" "));
    const pinned = e.slug === FLAGSHIP_NOTE_SLUG;
    const pinTag = pinned ? `<span class="note-card__pin">📌 Pinned</span> · ` : "";
    return `<li class="note-card${pinned ? " note-card--pinned" : ""}" data-surface="note:${slug}"${pinned ? " data-pinned" : ""} data-date="${date}" data-score="${e.score}" data-tags="${dataTags}">
        <div class="note-card__vote" aria-hidden="true" title="Reading minutes, from the note's own frontmatter. Not votes.">&#9650;<span class="note-card__score">${e.score}</span></div>
        <div class="note-card__main">
          <p class="note-card__byline">${pinTag}${byline}</p>
          <h2 class="note-card__title"><a href="/notes/${slug}">${escapeHtml(e.title)}</a></h2>
          <p class="note-card__summary">${summary}</p>
          <p class="note-card__foot"><span class="note__tags">${tags}</span>
            <a class="note-card__sections" href="/notes/${slug}">${e.sections} sections</a></p>
        </div>
      </li>`;
  }).join("\n");

  // The inline island: pure DOM reorder/hide over the cards already in the page (no fetch, no
  // new data route). Guarded so a missing form/list (or no JS at all) leaves the newest-first
  // list visible and the controls hidden, per the brief's no-JS requirement.
  const island = `<script>
    (function () {
      var form = document.querySelector("[data-feed-controls]");
      var list = document.querySelector(".note-feed");
      if (!form || !list) return;
      var cards = Array.prototype.slice.call(list.querySelectorAll(".note-card"));
      var newest = cards.slice();   // New = the original newest-first DOM order (pinned already first)

      // the flagship stays pinned to the top in BOTH New and Top — float any data-pinned card to
      // the front after whatever sort ran, so "Top" (by score) can't bury it.
      function floatPinned(arr) {
        var pinned = arr.filter(function (c) { return c.hasAttribute("data-pinned"); });
        var rest = arr.filter(function (c) { return !c.hasAttribute("data-pinned"); });
        return pinned.concat(rest);
      }

      function sortCards() {
        var checked = form.querySelector('input[name="sort"]:checked');
        var mode = checked ? checked.value : "new";
        var ordered = mode === "top"
          ? newest.slice().sort(function (a, b) {
              return Number(b.getAttribute("data-score")) - Number(a.getAttribute("data-score"));
            })
          : newest;
        floatPinned(ordered).forEach(function (card) { list.appendChild(card); });
      }

      function filterCards() {
        var boxes = Array.prototype.slice.call(form.querySelectorAll('input[type="checkbox"]:checked'));
        var wanted = boxes.map(function (b) { return b.value; });
        cards.forEach(function (card) {
          if (wanted.length === 0) { card.hidden = false; return; }
          var tags = (card.getAttribute("data-tags") || "").split(" ");
          card.hidden = wanted.every(function (t) { return tags.indexOf(t) === -1; });
        });
      }

      // Mirror the current tag filter into the URL so a filtered view is shareable (replaceState,
      // not push — filtering isn't navigation). Empty selection drops the query entirely.
      var empty = list.parentNode.querySelector("[data-feed-empty]");
      function syncUrl() {
        var boxes = Array.prototype.slice.call(form.querySelectorAll('input[type="checkbox"]:checked'));
        var wanted = boxes.map(function (b) { return b.value; });
        var url = location.pathname + (wanted.length ? "?tag=" + wanted.join(",") : "") + location.hash;
        try { history.replaceState(null, "", url); } catch (e) { /* file:// — leave the URL be */ }
      }

      // Honor a ?tag= deep link on boot: check every chip that matches (comma list ok) and filter.
      // A requested tag with no chip has no notes yet — surface the empty state, naming the tag(s),
      // and leave the full list visible (an unknown tag filters nothing).
      function applyQueryTags() {
        var q = new URLSearchParams(location.search).get("tag");
        if (!q) return;
        var requested = q.split(",").map(function (t) { return t.trim(); }).filter(Boolean);
        var unknown = [];
        requested.forEach(function (t) {
          var box = form.querySelector('input[type="checkbox"][value="' + (window.CSS && CSS.escape ? CSS.escape(t) : t) + '"]');
          if (box) box.checked = true;
          else if (unknown.indexOf(t) === -1) unknown.push(t);
        });
        filterCards();
        if (empty && unknown.length) {
          var label = unknown.map(function (t) { return '"' + t + '"'; }).join(", ");
          empty.textContent = "No notes tagged " + label + " yet. They are being written.";
          empty.hidden = false;
        }
      }

      form.addEventListener("change", function (ev) {
        var target = ev.target;
        if (!target) return;
        if (target.name === "sort") sortCards();
        else if (target.type === "checkbox") { filterCards(); syncUrl(); if (empty) empty.hidden = true; }
      });

      applyQueryTags();
      form.hidden = false;   // reveal the controls only once the island is live
    })();
  </script>`;

  const body = `<form class="feed-controls" data-feed-controls hidden>
      <div class="chips" role="radiogroup" aria-label="Sort">
        <label class="chip"><input type="radio" name="sort" value="new" checked> New</label>
        <label class="chip"><input type="radio" name="sort" value="top"> Top</label>
      </div>
      <div class="chips" aria-label="Filter by tag">${tagChips}</div>
    </form>
    <p class="feed-empty" data-feed-empty hidden></p>
    <ul class="note-feed">
${cards}
    </ul>
    ${island}`;

  return shellChrome(inject, injectHead)({
    kind: "index",
    title: notes.title,
    description: notes.description ?? "",
    body,
    collection: notes,
    slug: undefined,
  });
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

/** One row of the /calendar Agenda (Pass 2 — Calendar): a real thing with a real date, never an
 *  invented event. `server.ts` merges this shape's note-derived rows with `data/desk-feed.json`'s
 *  hand-authored posts (read there, not here — desk-feed.json is portfolio dressing, not MILL
 *  content) into one `calendarEvents` array, passed through `renderAppPage` alongside
 *  `recentNotes`. `domId` is the precomputed `#evt-<id>` anchor the agenda-item molecule binds
 *  to `id` and the calendar island scroll-highlights on a chip click; `dateLabel`/`tagsLabel` are
 *  precomputed display strings so the batch template only ever binds flat fields (no nested
 *  each= inside each=). */
export interface CalendarEvent {
  id: string;
  domId: string;
  date: string;
  dateLabel: string;
  kind: "note" | "post";
  title: string;
  body: string;
  tags: string[];
  tagsLabel: string;
  link: string;
  icon: string;
}
/** Note publish dates as calendar events — every note WITH a real date (undated notes have
 *  nothing to place on a calendar, so they're excluded here; they still appear in /notes). */
export async function listNoteCalendarEvents(): Promise<CalendarEvent[]> {
  const entries = await sortedNoteEntries();
  return entries.filter((e) => e.date).map((e) => ({
    id: `note-${e.slug}`,
    domId: `evt-note-${e.slug}`,
    date: e.date,
    dateLabel: e.date,
    kind: "note" as const,
    title: e.title,
    body: e.summary || e.subtitle,
    tags: e.tags,
    tagsLabel: e.tags.join(", "),
    link: `/notes/${e.slug}`,
    icon: "📝",
  }));
}

/** Every note's route in newest-first order — for any consumer that lists ALL notes and must
 *  match the /notes index's order (currently: /search.json, feeding the explorer tree's
 *  notes/ entries so the sidebar menu reflects the same date order as the page itself). */
export async function listNoteRoutesByDate(): Promise<string[]> {
  return (await sortedNoteEntries()).map((e) => `/notes/${e.slug}`);
}

/** Newest-first notes ({slug,title,route}) for the desk's "open the latest note" action — served
 *  frozen as /notes.json (a §18 data route) so the browser model can pick the newest with a real
 *  title, never the sitemap's slug-cased fallback. */
export async function listPortfolioNotes(): Promise<Array<{ slug: string; title: string; route: string }>> {
  return (await sortedNoteEntries()).map((e) => ({ slug: e.slug, title: e.title, route: `/notes/${e.slug}` }));
}
