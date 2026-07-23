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
  return ({ kind, title, description, body, collection, slug, frontmatter }) => {
    const screen = collection.prefix.split("/")[1] ?? "notes";   // /notes → notes, /grain/docs → grain
    // /calendar EVENT pages (Apps-v2 Pass C) get the standard post template: a photo grid on top,
    // the MILL-rendered body below. The photos come off the entry's own frontmatter (flat "src | WxH
    // | alt" strings); the same .feed-photos markup the feed cards use, so an event page and its feed
    // card read identically.
    const photoGrid = kind === "entry" && collection.prefix === "/calendar" && frontmatter
      ? renderPhotoGrid(parsePhotos(frontmatter.photos)) : "";
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
    // NOTE: the /notes index's "See what's new" AI trigger (data-ai-run demo.run) used to render
    // here, above the body. It now lives INSIDE renderNotesFeedPage's toolbar (grouped with New/Top
    // + search), so shellChrome no longer emits it — the notes feed owns its own top bar.
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
      <div class="board">${sourceToggle}${photoGrid}${body}</div>
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
    source: dirSource(join(import.meta.dir, "..", "content", "notes")),
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
    source: dirSource(join(import.meta.dir, "..", "docs/grain")),
    adapter: { resolveLink: docsLink("/grain/docs") },
  },
  {
    prefix: "/batch/docs",
    title: "BATCH docs",
    description: "The BATCH substrate's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(join(import.meta.dir, "..", "docs/batch")),
    adapter: { resolveLink: docsLink("/batch/docs") },
  },
  {
    prefix: "/mill/docs",
    title: "MILL docs",
    description: "MILL's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(join(import.meta.dir, "..", "docs/mill")),
    adapter: { resolveLink: docsLink("/mill/docs") },
  },
  {
    prefix: "/proof/docs",
    title: "PROOF docs",
    description: "PROOF's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(join(import.meta.dir, "..", "docs/proof")),
    adapter: { resolveLink: docsLink("/proof/docs") },
  },
  {
    prefix: "/crumb/docs",
    title: "CRUMB docs",
    description: "CRUMB's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(join(import.meta.dir, "..", "docs/crumb")),
    adapter: { resolveLink: docsLink("/crumb/docs") },
  },
  {
    prefix: "/pantry/docs",
    title: "PANTRY docs",
    description: "PANTRY's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(join(import.meta.dir, "..", "docs/pantry")),
    adapter: { resolveLink: docsLink("/pantry/docs") },
  },
  {
    // The canonical home of the cross-repo standards. Since 2026-07-09 the standards source lives
    // HERE (standards/), the same option-b move used for the layer docs: every repo's CLAUDE.md
    // points at https://tjakoen.github.io/standards, and THIS collection is what makes that URL real.
    // PANTRY resolves the same files out of this repo's package (./standards/* export).
    prefix: "/standards",
    title: "Standards",
    description: "The cross-repo standards — how I build with an AI, how anything under my byline reads, and how a repo is set up. Canonically homed here and rendered through MILL.",
    source: realFilesSource(join(import.meta.dir, "..", "standards")),
    adapter: { resolveLink: docsLink("/standards") },
  },
  {
    // The /calendar social feed's EVENTS (Apps-v2 Pass C): hackathons coached, talks given, student
    // highlights — full posts authored as events/*.md. Like /notes, the portfolio OWNS the /calendar
    // index (pages/calendar.html, the feed), so this collection opts OUT of MILL's own index serving
    // (index: false); MILL still renders each entry at /calendar/<slug>, and shellChrome gives those
    // entry pages the photo-grid-on-top post template from their frontmatter.
    prefix: "/calendar",
    title: "Feed",
    description: "The desk's feed: hackathons coached, talks given, and student projects worth showing, alongside what shipped.",
    source: dirSource(join(import.meta.dir, "..", "content", "events")),
    adapter: { resolveLink: eventsLink },
    index: false,
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
    if (col.prefix === "/calendar") continue;            // feed events are short social posts (currently placeholders) — not grounding
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
  // Reduce the chip pile: show a handful up front, tuck the rest behind a "+N more" toggle (all
  // checkboxes stay in the DOM either way, so a ?tag= deep link can still check an overflow tag and
  // the island reveals the rest when it does).
  const CHIP_HEAD = 6;
  const chipHtml = (t: string) => {
    const tag = escapeHtml(t);
    return `<label class="chip"><input type="checkbox" value="${tag}"> ${tag}</label>`;
  };
  const headChips = allTags.slice(0, CHIP_HEAD).map(chipHtml).join("");
  const restTags = allTags.slice(CHIP_HEAD);
  const restChips = restTags.length
    ? `<span class="notes-tags__rest" data-tags-rest hidden>${restTags.map(chipHtml).join("")}</span>` +
      `<button type="button" class="notes-tags__more" data-tags-more aria-expanded="false">+${restTags.length} more</button>`
    : "";

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
      var search = form.querySelector("[data-notes-search]");
      var rest = form.querySelector("[data-tags-rest]");
      var moreBtn = form.querySelector("[data-tags-more]");
      var empty = list.parentNode.querySelector("[data-feed-empty]");

      // the flagship stays pinned to the top in BOTH New and Top — float any data-pinned card to
      // the front after whatever sort ran, so "Top" (by score) can't bury it.
      function floatPinned(arr) {
        var pinned = arr.filter(function (c) { return c.hasAttribute("data-pinned"); });
        var rst = arr.filter(function (c) { return !c.hasAttribute("data-pinned"); });
        return pinned.concat(rst);
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

      // one filter pass over BOTH controls: the checked tag chips (a card must carry one) AND the
      // free-text search (matched against the card's own text). Either empty means "don't constrain".
      function applyFilters() {
        var boxes = Array.prototype.slice.call(form.querySelectorAll('input[type="checkbox"]:checked'));
        var wanted = boxes.map(function (b) { return b.value; });
        var q = (search && search.value || "").trim().toLowerCase();
        cards.forEach(function (card) {
          var tags = (card.getAttribute("data-tags") || "").split(" ");
          var tagOk = wanted.length === 0 || wanted.some(function (t) { return tags.indexOf(t) !== -1; });
          var textOk = q === "" || (card.textContent || "").toLowerCase().indexOf(q) !== -1;
          card.hidden = !(tagOk && textOk);
        });
        if (empty && !(wanted.length === 0 && q === "")) empty.hidden = true;
      }

      // Mirror the current tag filter into the URL so a filtered view is shareable (replaceState,
      // not push — filtering isn't navigation). Search text stays out of the URL. Empty tag set
      // drops the query entirely.
      function syncUrl() {
        var boxes = Array.prototype.slice.call(form.querySelectorAll('input[type="checkbox"]:checked'));
        var wanted = boxes.map(function (b) { return b.value; });
        var url = location.pathname + (wanted.length ? "?tag=" + wanted.join(",") : "") + location.hash;
        try { history.replaceState(null, "", url); } catch (e) { /* file:// — leave the URL be */ }
      }

      function revealRest(open) {
        if (!rest || !moreBtn) return;
        rest.hidden = !open;
        moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
        moreBtn.textContent = open ? "fewer" : "+" + rest.querySelectorAll(".chip").length + " more";
      }
      if (moreBtn) moreBtn.addEventListener("click", function () { revealRest(rest.hidden); });

      // Honor a ?tag= deep link on boot: check every chip that matches (comma list ok) and filter.
      // A requested tag with no chip has no notes yet — surface the empty state, naming the tag(s),
      // and leave the full list visible (an unknown tag filters nothing). A matched tag in the
      // collapsed overflow reveals it, so the checked chip is visible.
      function applyQueryTags() {
        var q = new URLSearchParams(location.search).get("tag");
        if (!q) return;
        var requested = q.split(",").map(function (t) { return t.trim(); }).filter(Boolean);
        var unknown = [], hitRest = false;
        requested.forEach(function (t) {
          var box = form.querySelector('input[type="checkbox"][value="' + (window.CSS && CSS.escape ? CSS.escape(t) : t) + '"]');
          if (box) { box.checked = true; if (rest && rest.contains(box)) hitRest = true; }
          else if (unknown.indexOf(t) === -1) unknown.push(t);
        });
        if (hitRest) revealRest(true);
        applyFilters();
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
        else if (target.type === "checkbox") { applyFilters(); syncUrl(); }
      });
      if (search) search.addEventListener("input", function () { applyFilters(); });

      applyQueryTags();
      form.hidden = false;   // reveal the controls only once the island is live
    })();
  </script>`;

  const deskTrigger = `<button class="btn notes-toolbar__ai" data-variant="soft" data-ai-run data-action="demo.run" data-target="screen" type="button">▷ See what's new</button>`;
  const body = `<form class="notes-toolbar" data-feed-controls hidden>
      <div class="notes-toolbar__bar">
        <input class="notes-search" type="search" placeholder="Search notes" aria-label="Search notes"
               autocomplete="off" data-notes-search>
        <div class="notes-toolbar__actions">
          <div class="chips notes-sort" role="radiogroup" aria-label="Sort">
            <label class="chip"><input type="radio" name="sort" value="new" checked> New</label>
            <label class="chip"><input type="radio" name="sort" value="top"> Top</label>
          </div>
          ${deskTrigger}
        </div>
      </div>
      <div class="chips notes-tags" aria-label="Filter by tag">${headChips}${restChips}</div>
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

/** One post in the /calendar social feed (Apps-v2 Pass C): a real dated thing, never an invented
 *  event. `server.ts` (buildCalendarEvents) merges three sources into one `calendarEvents` array —
 *  note publish dates (here), the hand-authored `data/desk-feed.json` "shipped" posts, and the
 *  MILL-authored events collection (`events/*.md`, listEventCalendarEvents) — passed through
 *  `renderAppPage`. `domId` is the precomputed `#evt-<id>` anchor the feed-card molecule binds to
 *  `id` and the calendar island scroll-highlights on a chip click; `dateLabel`/`tagsLabel`/
 *  `kindLabel`/`locationLabel` are precomputed display strings, and `photos`/`links` are the only
 *  nested arrays the feed card binds via nested `each=`. */
export interface EventPhoto { src: string; width: string; height: string; alt: string; }
export interface CalendarEventLink { href: string; label: string; }
export interface CalendarEvent {
  id: string;
  domId: string;
  date: string;
  dateLabel: string;
  kind: string;               // "note" | "shipped" | "hackathon" | "talk" | "student-highlight" | …
  kindLabel: string;          // display label for the kind ("Note", "Hackathon", …)
  title: string;
  body: string;
  tags: string[];
  tagsLabel: string;          // ", "-joined display string
  tagsAttr: string;           // space-joined, for a data-tags attribute
  locationLabel: string;      // "" when the event has no place
  photos: EventPhoto[];       // images-first feed card; [] renders no strip (:empty hides it)
  links: CalendarEventLink[]; // related links row; [] renders nothing
  link: string;               // the card's own title target
  icon: string;
}

// The kind → display-label map. An unknown kind falls back to a title-cased version of its own id,
// so a new event kind renders sanely without a code change (the label is just prettier when listed).
const KIND_LABELS: Record<string, string> = {
  note: "Note", shipped: "Shipped", hackathon: "Hackathon", talk: "Talk",
  "student-highlight": "Student highlight",
};
export const kindLabel = (kind: string): string =>
  KIND_LABELS[kind] ?? kind.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// MILL's yamlish frontmatter parser is flat (scalars + string lists only), so a photo is encoded as
// one "src | 1200x675 | alt text" string; split it back into {src,width,height,alt}. desk-feed.json
// (JSON, so it COULD nest) uses the same flat-string shape for symmetry — one parser for both.
// A grain proposal (Pass E) tracks first-class nested-object frontmatter to retire this encoding.
export function parsePhotos(raw: unknown): EventPhoto[] {
  if (!Array.isArray(raw)) return [];
  const out: EventPhoto[] = [];
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const [src = "", dim = "", alt = ""] = entry.split("|").map((x) => x.trim());
    if (!src) continue;
    const [width = "", height = ""] = dim.split(/x/i).map((x) => x.trim());
    out.push({ src, width, height, alt });
  }
  return out;
}

// The event-page photo grid (composed in shellChrome for /calendar entries). Hand-rendered rather
// than via the feed-photo molecule because the chrome has no per-request binding context to pass the
// photos array through; it emits the SAME .feed-photos / .feed-photo markup the molecule does, so one
// stylesheet dresses both. data-lightbox + the group wrapper wire it to GRAIN's image viewer
// (scripts/lightbox.js), same as the molecule; each photo's href stays the full image (the
// no-JS-safe fallback).
function renderPhotoGrid(photos: EventPhoto[]): string {
  if (!photos.length) return "";
  const items = photos.map((p) => {
    const src = escapeHtml(p.src);
    const dims = p.width && p.height ? ` width="${escapeHtml(p.width)}" height="${escapeHtml(p.height)}"` : "";
    return `<a class="feed-photo" data-lightbox href="${src}"><img src="${src}"${dims} alt="${escapeHtml(p.alt)}" loading="lazy" decoding="async"></a>`;
  }).join("");
  return `<div class="feed-photos" data-event-photos data-lightbox-group>${items}</div>`;
}

// Events cross-link like notes (note:slug → /notes/slug); everything else (absolute site links)
// passes through untouched.
function eventsLink(href: string): string {
  return href.startsWith("note:") ? "/notes/" + href.slice(5) : href;
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
    kind: "note",
    kindLabel: KIND_LABELS.note!,
    title: e.title,
    body: e.summary || e.subtitle,
    tags: e.tags,
    tagsLabel: e.tags.join(", "),
    tagsAttr: e.tags.join(" "),
    locationLabel: "",
    photos: [],
    links: [],
    link: `/notes/${e.slug}`,
    icon: "📝",
  }));
}

/** The /calendar social-feed EVENTS collection (Apps-v2 Pass C): MILL-authored posts under
 *  events/*.md, surfaced on the feed as calendar events (kind from frontmatter, link → the event's
 *  own MILL page /calendar/<slug>). Reads frontmatter only (title/date/kind/location/tags/summary +
 *  the flat photo strings), same idiom as sortedNoteEntries. Newest-first; undated events are
 *  dropped (nothing to place on a calendar). */
export async function listEventCalendarEvents(): Promise<CalendarEvent[]> {
  const events = collections.find((c) => c.prefix === "/calendar");
  if (!events) return [];
  const out: CalendarEvent[] = [];
  for (const slug of await events.source.list()) {
    const raw = await events.source.read(slug);
    if (raw === null) continue;
    const { data: fm } = parseFrontmatter(raw);
    const date = typeof fm.date === "string" ? fm.date : "";
    if (!date) continue;
    const kind = typeof fm.kind === "string" ? fm.kind : "post";
    const tags = Array.isArray(fm.tags) ? fm.tags.filter((t): t is string => typeof t === "string") : [];
    out.push({
      id: `event-${slug}`,
      domId: `evt-event-${slug}`,
      date,
      dateLabel: date,
      kind,
      kindLabel: kindLabel(kind),
      title: typeof fm.title === "string" ? fm.title : slug,
      body: typeof fm.summary === "string" ? fm.summary : "",
      tags,
      tagsLabel: tags.join(", "),
      tagsAttr: tags.join(" "),
      locationLabel: typeof fm.location === "string" ? fm.location : "",
      photos: parsePhotos(fm.photos),
      links: [],
      link: `/calendar/${slug}`,
      icon: "🗓️",
    });
  }
  return out;
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
