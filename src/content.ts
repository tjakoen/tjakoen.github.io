// portfolio/content.ts — piece 4: the portfolio's MILL wiring (consumer-owned).
//
// Collections flow through MILL's live content route (mill/serve.ts):
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
import {
  externalLinkAttrs, type GrainAdapterOptions,
} from "@tjakoen/mill/adapters/grain/grain-adapter.ts";
import { servedDiagramRenderer } from "./diagrams.ts";
import { highlightedCodeBlock } from "./content-code.ts";
import { join, basename } from "node:path";
import { readdir, lstat } from "node:fs/promises";
import { readFileSync, readdirSync } from "node:fs";
import { buildKnowledge, type KnowledgeSource } from "./ai/knowledge.ts";
import { createKnowledgeCache } from "./ai/knowledge-cache.ts";
import { SITE } from "./seo.ts";
import { FACTS_ROUTE, type Knowledge } from "./ai/retrieval.ts";

const CONTENT_READ_BATCH = 8;

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

/**
 * A note's `status` frontmatter, read as a publish decision. NOTE-STANDARD has told authors for
 * months to mark an unfinished note `status: DRAFT`, and until 2026-08-20 nothing here ever
 * compared that field to anything: every draft was served, listed, sitemapped and exported exactly
 * like a finished note. This is the comparison that was missing.
 *
 * It hides on an explicit DRAFT and on nothing else, which is deliberately the loose reading. A
 * gate that hid every value it did not recognise would take a live page down over a typo in a
 * status line or a vocabulary word invented later, and a page vanishing by accident is a worse
 * failure than a draft staying up one more day. A missing `status` publishes for the same reason.
 */
export function isPublishedStatus(status: unknown): boolean {
  return !(typeof status === "string" && status.trim().toUpperCase() === "DRAFT");
}

/**
 * A ContentSource that serves only the entries whose frontmatter says they are publishable. It
 * wraps the source rather than filtering at each caller because everything downstream, the feed,
 * the per-note route, the raw `.md` twin, the sitemap, the static export, the search tree, the
 * calendar and the desk's grounding corpus, reaches its entries through `source.list()` and
 * `source.read()`. Hiding a slug here hides it from all of them at once, and a consumer added
 * tomorrow inherits the gate without knowing it exists.
 *
 * `read()` returns null for a draft, which is the same answer MILL already gives for a slug that
 * is not there, so `/notes/<draft>` and `/notes/<draft>.md` both answer 404 rather than rendering.
 */
function publishedSource(base: ContentSource): ContentSource {
  const publishable = async (slug: string): Promise<boolean> => {
    const raw = await base.read(slug);
    return raw !== null && isPublishedStatus(parseFrontmatter(raw).data.status);
  };
  return {
    list: async () => {
      const slugs = await base.list();
      const keep: boolean[] = [];
      for (let offset = 0; offset < slugs.length; offset += CONTENT_READ_BATCH) {
        keep.push(...await Promise.all(slugs.slice(offset, offset + CONTENT_READ_BATCH).map(publishable)));
      }
      return slugs.filter((_, i) => keep[i] === true);
    },
    read: async (slug) => {
      const raw = await base.read(slug);
      return raw !== null && isPublishedStatus(parseFrontmatter(raw).data.status) ? raw : null;
    },
  };
}

/**
 * The other half of the same gate: a ContentSource that serves ONLY the explicit drafts. It feeds
 * the unlisted /drafts section below, which exists so an unfinished note can be pushed, deployed
 * and read on the real site without reaching any surface a visitor or a crawler enumerates.
 */
function draftsSource(base: ContentSource): ContentSource {
  const draft = async (slug: string): Promise<boolean> => {
    const raw = await base.read(slug);
    return raw !== null && !isPublishedStatus(parseFrontmatter(raw).data.status);
  };
  return {
    list: async () => {
      const slugs = await base.list();
      const keep = await Promise.all(slugs.map(draft));
      return slugs.filter((_, i) => keep[i] === true);
    },
    read: async (slug) => ((await draft(slug)) ? base.read(slug) : null),
  };
}

/** True for the two collections that render a note: the published feed and the unlisted drafts. */
const isNoteCollection = (prefix: string): boolean => prefix === "/notes" || prefix === DRAFTS_PREFIX;
const DRAFTS_PREFIX = "/drafts";

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

// A link to a note that is still a DRAFT goes to its unlisted /drafts/<slug> twin, which the export
// ships. A published note can then point at a follow-up before that one is ready, and neither the
// reader nor the export check meets a dead /notes/ address. The set is reread at most every two
// seconds, so flipping a status in the dev server takes effect without a restart.
let draftSlugsCache: { at: number; slugs: Set<string> } | null = null;
export function draftNoteSlugs(dir = join(import.meta.dir, "..", "content", "notes")): Set<string> {
  const now = Date.now();
  if (draftSlugsCache && now - draftSlugsCache.at < 2000) return draftSlugsCache.slugs;
  const slugs = new Set<string>();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md")) continue;
    const head = readFileSync(join(dir, file), "utf8").slice(0, 2000).match(/^---\n[\s\S]*?\n---/);
    const status = head?.[0].match(/^status:\s*"?([A-Za-z]+)"?\s*$/m)?.[1];
    if (!isPublishedStatus(status)) slugs.add(mdSlug(file));
  }
  draftSlugsCache = { at: now, slugs };
  return slugs;
}
const noteHref = (slug: string, frag = "") => `${draftNoteSlugs().has(slug) ? "/drafts" : "/notes"}/${slug}${frag}`;

// Notes link to each other as bare siblings (why-i-teach.md) or note:slug (MILL's default).
function notesLink(href: string): string {
  if (href.startsWith("note:")) return noteHref(href.slice(5));
  const [path, frag = ""] = href.split(/(#.*)$/, 2);
  const local = path.match(/^(?:\.\/)?([A-Za-z0-9._-]+)\.md$/);
  if (local) return noteHref(mdSlug(local[1]), frag);
  return href;
}

// ---- heading ids for deep-link answers (A1) -----------------------------------
// MILL's default grain-adapter now stamps the slug id on every level-2/3 heading it renders
// (upstreamed 2026-07-25, mill 0.2.0 / grain#2 — this used to be a portfolio-side block
// override). slugifyHeading (@tjakoen/mill/core/slug.ts) is THE one slug algorithm — the
// build-time corpus (ai/knowledge.ts) imports the same export, so a rendered page's real
// heading id and a retrieved chunk's recorded `anchor` can never drift apart. What stays
// portfolio-owned is the opt-in headingSurfaces flag: it adds data-surface="anchor:{slug}",
// and grain's spotlight resolves any travel target via [data-surface="…"]
// (dist/scripts/ai-dispatch.js), so a stamped heading becomes spotlightable with zero
// grain-side change — the desk answers "what does X say about Y" by traveling straight to
// the section, not just the page.
// Every collection wants that flag; only resolveLink differs per collection — written once
// here so a new collection can't forget to wire it in (see the `collections` array below).
// The same choke point carries the OFF-SITE LINK POLICY (MILL 0.2.2 `linkAttrs`): a link that
// leaves tjakoen.github.io opens in a new tab, so the reader keeps the page they were reading and
// the shell's own open-tabs strip stays meaningful. `externalLinkAttrs` decides what counts as
// external (absolute http(s), different host) so the answer is the layer's and not ten copies of a
// regex here; mailto: and in-page anchors are deliberately untouched.
function withHeadingAnchors(adapter: GrainAdapterOptions): GrainAdapterOptions {
  return {
    ...adapter,
    blockOverrides: { ...adapter.blockOverrides, code: highlightedCodeBlock },
    headingSurfaces: true,
    linkAttrs: externalLinkAttrs(SITE.origin),
  };
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
    // …the deck, if the entry hangs off one (`deck:`): a quiet attachment row directly under the
    // hero, because for a talk the deck is often the thing a reader came for.
    const deck = kind === "entry" && frontmatter
      ? renderDeckAttachment(frontmatter.deck) : "";
    // …the video, if there is one (`video:`), a poster still linking out to the platform it lives
    // on. It sits DOWN with the gallery, not under the hero: a full-width poster at the top reads
    // as the subject of the page and shouts over the prose the page is actually made of.
    const videoCard = kind === "entry" && collection.prefix === "/calendar" && frontmatter
      ? renderVideoCard(frontmatter.video) : "";
    // …and the rest of the day's photos (`gallery:`), a quieter grid below the body, so the strip on
    // top stays the four that carry the post.
    const gallery = kind === "entry" && collection.prefix === "/calendar" && frontmatter
      ? renderGallery(parsePhotos(frontmatter.gallery)) : "";
    // …and, below the body, the ready-to-post share block (opt-in via the entry's `social:` key). Notes
    // carry it too, because a note that started life as a social post keeps that post beside it.
    const shareBlock = kind === "entry" && (collection.prefix === "/calendar" || isNoteCollection(collection.prefix)) && frontmatter && slug
      ? renderShareBlock(frontmatter.social, `${SITE.origin}${collection.prefix}/${slug}`, frontmatter.socialImage, frontmatter.socialImageAlt) : "";
    // A published note carries a Share button beside Rendered and Source. It opens a dialog holding
    // the note's canonical address and a copy button, and reuses the copy script the share block has.
    // A draft gets none: its own banner asks the reader not to pass it on.
    const shareDialog = kind === "entry" && collection.prefix === "/notes" && slug
      ? renderShareDialog(title, `${SITE.origin}/notes/${slug}`) : "";
    const copyScript = shareBlock || shareDialog || body.includes(" data-copy-template") ? CONTENT_COPY_SCRIPT : "";
    // /badges entry pages: a badge-CLASS page (roster of recipients) or a per-recipient CERT page.
    // The template (art + issuer + verification + roster/share) sits above the MILL-rendered body.
    const badgeCard = kind === "entry" && collection.prefix === "/badges" && frontmatter && slug
      ? renderBadgeEntry(frontmatter, slug) : "";
    // Badge pages carry their OWN share card (enrichHead reads x-og-image), so a shared credential
    // unfurls with its badge on LinkedIn rather than the site card. The class slug names the image:
    // a cert points at its badgeClass, a class page at its own slug.
    const ogClass = collection.prefix === "/badges" && frontmatter
      ? (frontmatter.type === "cert" ? String(frontmatter.badgeClass || "") : frontmatter.type === "badge-class" ? slug : frontmatter.type === "badge-design" ? String(frontmatter.ogClass || "") : "")
      : "";
    const badgeHead = ogClass ? `<meta name="x-og-image" content="/media/badges/og-${escapeHtml(ogClass)}.png">` : "";
    // A note may name its own share card with an image key (a /media path), plus imageAlt for its
    // description, so a shared post unfurls with its own picture instead of the site card.
    const noteImg = isNoteCollection(collection.prefix) && frontmatter && typeof frontmatter.image === "string" && frontmatter.image.startsWith("/media/") ? frontmatter.image : "";
    const noteHead = noteImg ? `<meta name="x-og-image" content="${escapeHtml(noteImg)}">${frontmatter?.imageAlt ? `<meta name="x-og-image-alt" content="${escapeHtml(String(frontmatter.imageAlt))}">` : ""}` : "";
    // THE EDITOR section (rail active + tab group): notes → its own; layer docs live under BREAD.
    const sectionName = isNoteCollection(collection.prefix) ? "notes" : "bread";
    const section = ` data-section="${sectionName}"`;
    // the honest-source toggle: an entry page links straight to its own raw .md (MILL's
    // honest-source route) — "the site is its own source tree" made clickable.
    const isCalendarEntry = kind === "entry" && collection.prefix === "/calendar";
    const sourceToggle = kind === "entry" && slug
      ? `<nav class="content-source" aria-label="${isCalendarEntry ? "Event page navigation" : "View"}">
      <a class="tab" aria-current="page" href="${escapeHtml(`${collection.prefix}/${slug}`)}">Rendered</a>
      <a class="tab" href="${escapeHtml(`${collection.prefix}/${slug}.md`)}">Source</a>${collection.prefix === "/notes" ? '\n      <button class="tab content-source__bionic" type="button" data-bionic-toggle aria-pressed="false" title="Bold the start of each word" hidden>Bionic</button>' : ""}${shareDialog ? '\n      <button class="tab content-source__share" type="button" data-note-share hidden>Share</button>' : ""}${isCalendarEntry ? '\n      <a class="tab" href="/calendar">Calendar feed</a>' : ""}
      </nav>`
      : "";
    // NOTE: the /notes index's "See what's new" AI trigger (data-ai-run demo.run) used to render
    // here, above the body. It now lives INSIDE renderNotesFeedPage's toolbar (grouped with New/Top
    // + search), so shellChrome no longer emits it — the notes feed owns its own top bar.
    // …the summary + contents block, for a note with enough sections to be worth navigating. It is
    // spliced INTO the body after the note head rather than emitted before it, because it belongs
    // under the masthead and above the first section, not above the title.
    const contents = kind === "entry" && isNoteCollection(collection.prefix) && frontmatter
      ? renderNoteContents(body, frontmatter) : "";
    // A note may open with its own start button. That call to action belongs directly under the
    // subtitle, above the generated contents block, not below it.
    const leadingStart = body.match(/<p class="nest-start"(?: hidden)?>[\s\S]*?<\/p>/)?.[0] ?? "";
    // …and the people and sources the note names (`people:` and `sources:`), at the very end, each
    // linking to its entry on /people or its card on /reading rather than straight off the site.
    const credits = kind === "entry" && isNoteCollection(collection.prefix) && frontmatter
      ? renderNoteCredits(frontmatter) : "";
    // …and a way onward. A note used to end at its footer with nothing but the dock to leave by.
    const whereNext = kind === "entry" && collection.prefix === "/notes" && slug ? renderNoteNext(slug) : "";
    // A draft says so at the top of its own page, and its index says what the section is, because a
    // link to either can be forwarded to someone who has no idea the note is unfinished.
    const draftFlag = collection.prefix !== DRAFTS_PREFIX ? ""
      : kind === "entry"
        ? `<p class="draft-flag" role="note"><strong>Draft.</strong> This note is unfinished and unlisted. It can change or disappear, so please do not share it yet. <a href="${DRAFTS_PREFIX}">All drafts</a></p>`
        : `<p class="draft-flag" role="note"><strong>Drafts.</strong> Unfinished notes, deployed so they can be read on the real site. Nothing here is listed in the feed, the search, the sitemap or the desk's answers. The repository is public, so unlisted is not the same as private.</p>`;
    // …and, for a note that changed in a way a returning reader should know about, the day it was
    // edited under the masthead and the list of what changed at the foot (`updated:`, `changelog:`).
    const noteEntry = kind === "entry" && isNoteCollection(collection.prefix) && frontmatter;
    const edited = noteEntry ? renderNoteEdited(frontmatter) : "";
    const changelog = noteEntry ? renderNoteChangelog(frontmatter) : "";
    let readable = body;
    if (contents) {
      if (leadingStart) readable = readable.replace(leadingStart, "");
      readable = readable.replace("</header>", `</header>${edited}${leadingStart}${contents}`);
    } else if (edited) {
      readable = readable.replace("</header>", `</header>${edited}`);
    }
    // A badge page's own template already states the title, the skill and the recipient, so MILL's
    // entry header underneath it would be the same words a second time at h1 size. Drop that header
    // (the rest of the body still renders) — badge pages only.
    if (kind === "entry" && collection.prefix === "/badges")
      readable = readable.replace(/<header[\s\S]*?<\/header>/, "");
    // Standards already carry their reader-facing title as the first Markdown h1. Keep that as
    // the page's one h1 instead of repeating it beneath MILL's generated filename masthead.
    if (kind === "entry" && collection.prefix === "/standards")
      readable = readable.replace(/<header[\s\S]*?<\/header>/, "");
    return shellPage({
      title, description, screen, section, inject, injectHead: `${injectHead}${badgeHead}${noteHead}`,
      board: `${draftFlag}${sourceToggle}${badgeCard}${photoGrid}${deck}${readable}${changelog}${credits}${whereNext}${videoCard}${gallery}${shareBlock}${shareDialog}${copyScript}`,
    });
  };
}

/** The app-shell skeleton every content page is: head, portfolio-frame, one `.board`. Extracted so
 *  a page that is NOT a MILL entry can be the same page (the deck viewer below is the first), and
 *  so there is exactly one copy of this markup to keep in step with `pages/mill/index.html`. */
export function shellPage(input: {
  title: string; description?: string; screen: string; section: string;
  board: string; inject: string; injectHead: string;
}): string {
  const { title, description, screen, section, board, inject, injectHead } = input;
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
    <main class="app-shell__main" id="main-content">
      <div class="board">${board}</div>
    </main>
  </div>
${inject}</body>
</html>`;
}

/**
 * Where every served collection's Markdown lives on disk, keyed by its route prefix. The
 * collection definitions below take their directories from here, so a folder cannot be served
 * without appearing in this map.
 *
 * It is exported because tools have to walk exactly the content MILL serves, and no more.
 * tools/diagram-cache-gate.ts is the first: it fails the build on a mermaid fence that has no
 * committed SVG, and a fence in a file outside every one of these folders is not a risk. Restating
 * the list inside the tool would let the two drift, and the direction of that drift is a new
 * collection served without a gate over it.
 */
export const COLLECTION_DIRS = {
  "/notes": join(import.meta.dir, "..", "content", "notes"),
  "/grain/docs": join(import.meta.dir, "..", "docs/grain"),
  "/batch/docs": join(import.meta.dir, "..", "docs/batch"),
  "/mill/docs": join(import.meta.dir, "..", "docs/mill"),
  "/proof/docs": join(import.meta.dir, "..", "docs/proof"),
  "/crumb/docs": join(import.meta.dir, "..", "docs/crumb"),
  "/pantry/docs": join(import.meta.dir, "..", "docs/pantry"),
  "/standards": join(import.meta.dir, "..", "standards"),
  "/calendar": join(import.meta.dir, "..", "content", "events"),
  "/badges": join(import.meta.dir, "..", "content", "badges"),
} as const;

// The collections — module-level so the routes AND the route list derive from
// one definition (a new note or doc automatically reaches the sitemap and the export).
const collections: MillCollection[] = [
  {
    prefix: "/notes",
    title: "Notes",
    description: "Long-form notes — how this stack got built, how I teach, and what broke along the way.",
    // The only collection with a publish gate over it, because notes are the only content that
    // carries a `status` field (the layer docs, the standards and the calendar posts do not).
    source: publishedSource(dirSource(COLLECTION_DIRS["/notes"])),
    adapter: withHeadingAnchors({ resolveLink: notesLink }),
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
    source: dirSource(COLLECTION_DIRS["/grain/docs"]),
    adapter: withHeadingAnchors({ resolveLink: docsLink("/grain/docs") }),
  },
  {
    prefix: "/batch/docs",
    title: "BATCH docs",
    description: "The BATCH substrate's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(COLLECTION_DIRS["/batch/docs"]),
    adapter: withHeadingAnchors({ resolveLink: docsLink("/batch/docs") }),
  },
  {
    prefix: "/mill/docs",
    title: "MILL docs",
    description: "MILL's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(COLLECTION_DIRS["/mill/docs"]),
    adapter: withHeadingAnchors({ resolveLink: docsLink("/mill/docs") }),
  },
  {
    prefix: "/proof/docs",
    title: "PROOF docs",
    description: "PROOF's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(COLLECTION_DIRS["/proof/docs"]),
    adapter: withHeadingAnchors({ resolveLink: docsLink("/proof/docs") }),
  },
  {
    prefix: "/crumb/docs",
    title: "CRUMB docs",
    description: "CRUMB's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(COLLECTION_DIRS["/crumb/docs"]),
    adapter: withHeadingAnchors({ resolveLink: docsLink("/crumb/docs") }),
  },
  {
    prefix: "/pantry/docs",
    title: "PANTRY docs",
    description: "PANTRY's own docs, canonically homed here (option b) and rendered through MILL.",
    source: dirSource(COLLECTION_DIRS["/pantry/docs"]),
    adapter: withHeadingAnchors({ resolveLink: docsLink("/pantry/docs") }),
  },
  {
    // The canonical home of the cross-repo standards. Since 2026-07-09 the standards source lives
    // HERE (standards/), the same option-b move used for the layer docs: every repo's CLAUDE.md
    // points at https://tjakoen.github.io/standards, and THIS collection is what makes that URL real.
    // PANTRY resolves the same files out of this repo's package (./standards/* export).
    prefix: "/standards",
    title: "Standards",
    description: "The cross-repo standards — how I build with an AI, how anything under my byline reads, and how a repo is set up. Canonically homed here and rendered through MILL.",
    source: realFilesSource(COLLECTION_DIRS["/standards"]),
    adapter: withHeadingAnchors({ resolveLink: docsLink("/standards") }),
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
    source: dirSource(COLLECTION_DIRS["/calendar"]),
    adapter: withHeadingAnchors({ resolveLink: eventsLink }),
    index: false,
  },
  {
    // The course BADGES: two per course section (prelim and midterm), earned from the activities a
    // student completed in the HAU course platform. Like /calendar this opts OUT of MILL's own index
    // (the /badges hub is a hand page); MILL renders each entry. Two entry shapes, both driven off
    // frontmatter in shellChrome: a badge-CLASS page (type: badge-class) lists every recipient, and a
    // per-recipient CERT page (type: cert) is the verifiable URL a student shares. The individual cert
    // routes are kept OUT of the sitemap and /search.json at the server (link-only discovery), so this
    // collection is the issuer surface, not something a crawler enumerates a roster of names from.
    prefix: "/badges",
    title: "Badges",
    description: "Course badges issued by Tjakoen Stolk, instructor at Holy Angel University: what each one attests, and a verifiable credential for each recipient.",
    source: dirSource(COLLECTION_DIRS["/badges"]),
    adapter: withHeadingAnchors({ resolveLink: badgesLink }),
    index: false,
  },
];

/**
 * The unlisted drafts section. Deliberately NOT a member of `collections`: everything that
 * enumerates content (the sitemap, /search.json, the feed, the calendar merge, the desk's grounding
 * corpus, llms.txt) walks that array, so a draft stays out of all of them by never being in it.
 * The pages are served, exported and marked noindex, and the only door in is a typed address or
 * the terminal's unlisted `drafts` command.
 */
const draftCollections: MillCollection[] = [
  {
    prefix: DRAFTS_PREFIX,
    title: "Drafts",
    description: "Unfinished notes, unlisted. They can change or disappear.",
    source: draftsSource(dirSource(COLLECTION_DIRS["/notes"])),
    adapter: withHeadingAnchors({ resolveLink: notesLink }),
    indexVariant: "log",
    itemSurfacePrefix: "draft",
  },
];

export function createPortfolioDraftRoutes(
  compose?: (html: string) => Promise<string>,
  inject = "",
  injectHead = "",
): MillRequestHandler {
  return createMillRoutes({
    compose,
    chrome: shellChrome(inject, `${injectHead}<meta name="robots" content="noindex, nofollow">`),
    collections: draftCollections,
    diagrams: servedDiagramRenderer(),
  });
}

/** The draft pages and their index, for the static export only. Never hand this to the sitemap. */
export async function listPortfolioDraftRoutes(): Promise<string[]> {
  const routes = await listMillRoutes(draftCollections);
  if (!routes.includes(DRAFTS_PREFIX)) routes.push(DRAFTS_PREFIX);
  return routes;
}
/**
 * A draft's address outlives the draft. Once a note is published its /drafts/<slug> URL stops
 * resolving as a draft, but that URL may already be out in the world as a shared link with an Open
 * Graph card behind it. So every published note keeps a /drafts/<slug> route that serves a stub
 * carrying the published note's own card and sending the reader on to it (server.ts). Listed here
 * so the static export freezes those stubs too.
 */
export async function listPublishedDraftRedirectRoutes(): Promise<string[]> {
  const routes = await listMillRoutes(collections);
  return routes
    .filter((r) => /^\/notes\/[^/]+$/.test(r))
    .map((r) => DRAFTS_PREFIX + r.slice("/notes".length));
}
/** Each draft's raw `.md` twin, so the Source tab on a draft works on the deployed site too. */
export function listPortfolioDraftRawRoutes(): Promise<string[]> {
  return listMillRawRoutes(draftCollections);
}

/**
 * Every served collection paired with the folder it reads. Tools that must walk exactly what MILL
 * serves take the REAL ContentSource from here rather than rebuilding one, which matters for
 * /standards: realFilesSource drops the symlinked AGENTS.md alias, and a tool that rebuilt the
 * source with plain dirSource would walk that alias as a second document.
 */
export function collectionSources(): { prefix: string; dir: string; source: ContentSource }[] {
  return collections.map((c) => ({
    prefix: c.prefix,
    dir: COLLECTION_DIRS[c.prefix as keyof typeof COLLECTION_DIRS],
    source: c.source,
  }));
}

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
  // The diagram renderer is shared by every collection and reads only the committed cache — see
  // src/diagrams.ts for why nothing here launches a browser, and tools/diagram-cache-gate.ts for
  // what stops an uncached fence reaching the site as raw source.
  return createMillRoutes({
    compose,
    chrome: shellChrome(inject, injectHead),
    collections,
    diagrams: servedDiagramRenderer(),
  });
}

// ---- the deck viewer: a PDF that stays inside the site ------------------------------------
// A link straight to a .pdf hands the tab to the browser's viewer, and the shell is gone: no rail,
// no open tabs, no way back except the back button. `/decks/<file>` renders the same document
// inside the app shell (GRAIN's doc-frame molecule), so it is an ordinary page, which makes it an
// ordinary open tab, which is the whole ask. Same origin only: the file is one this site serves.
const DECKS_DIR = join(import.meta.dir, "..", "content", "media", "decks");

/** Deck slug → the page title shown in the tab and the frame's caption. Kept beside the files
 *  rather than parsed out of the PDF: a title is editorial, and pdf metadata is usually wrong. */
const DECK_TITLES: Record<string, string> = {
  "engineering-ai-for-social-impact": "Engineering AI for Social Impact",
  "from-code-to-career": "From Code to Career",
  "gdg-hau-ai-hack-ideation": "Beyond Limits: the ideation workshop",
  "reality-check-ai-ethics": "Re: AI-lity Check",
};

const deckTitle = (slug: string): string =>
  DECK_TITLES[slug] ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/** Every deck route and its index, so the sitemap and static export carry the viewer pages too. A
 *  page that only exists on the dev server is a 404 on Pages, which is exactly the bug this shape invites. */
export async function listPortfolioDeckRoutes(): Promise<string[]> {
  try {
    const files = await readdir(DECKS_DIR);
    return ["/decks", ...files.filter((f) => f.endsWith(".pdf")).map((f) => `/decks/${basename(f, ".pdf")}`)];
  } catch { return []; }                                   // no decks dir ⇒ no routes, not a crash
}

/** The deck index and viewer route handler, mounted beside the content routes at the composition root. */
export function createPortfolioDeckRoutes(
  compose?: (html: string) => Promise<string>,
  inject = "",
  injectHead = "",
): MillRequestHandler {
  return async (pathname: string): Promise<Response | null> => {
    if (pathname === "/decks") {
      const files = await readdir(DECKS_DIR).catch(() => []);
      const items = await Promise.all(files.filter((f) => f.endsWith(".pdf")).map(async (file) => {
        const slug = basename(file, ".pdf");
        const href = `/decks/${slug}`;
        const title = deckTitle(slug);
        const size = Bun.file(join(DECKS_DIR, file)).size / 1_000_000;
        return `<li><a href="${escapeHtml(href)}">${escapeHtml(title)}</a><span>${size.toFixed(1)} MB · PDF</span></li>`;
      }));
      const board = `<h1>Talks and decks</h1><p>Presentation decks from selected talks and workshops.</p><ul class="deck-index__list">${items.join("\n")}</ul>`;
      const html = shellPage({
        title: "Talks and decks",
        description: "Presentation decks from selected talks and workshops.",
        screen: "calendar", section: ` data-section="bread"`, board, inject, injectHead,
      });
      const composed = compose ? await compose(html) : html;
      return new Response(composed, { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    const match = /^\/decks\/([a-z0-9-]+)$/i.exec(pathname);
    if (!match) return null;
    const slug = match[1]!;
    const file = Bun.file(join(DECKS_DIR, `${slug}.pdf`));
    if (!(await file.exists())) return null;               // unknown deck ⇒ the 404 page, not a shell
    const src = `/media/decks/${slug}.pdf`;
    const title = deckTitle(slug);
    const size = `${(file.size / 1_000_000).toFixed(1)} MB`;
    // The escape link is NOT redundant with the <object> fallback: iOS Safari neither renders a
    // multi-page PDF inline nor triggers that fallback, so the direct link stays visible for
    // everyone (doc-frame.md says the same thing, in the component that owns the markup).
    const board = `<h1 class="deck-page__title">${escapeHtml(title)}</h1>
<figure class="doc-frame">
  <object class="doc-frame__object" data="${escapeHtml(src)}" type="application/pdf"
          aria-label="${escapeHtml(`${title}, rendered in the page`)}">
    <p class="doc-frame__fallback">This browser cannot display the deck inline. <a href="${escapeHtml(src)}">Open the PDF directly.</a></p>
  </object>
  <figcaption class="doc-frame__escape">
    <a href="${escapeHtml(src)}">Open the PDF directly</a>
    <span>${escapeHtml(size)}</span>
  </figcaption>
</figure>`;
    const html = shellPage({
      title: `${title} · the deck`,
      description: `${title}, the deck, readable here on the site.`,
      screen: "calendar", section: ` data-section="bread"`, board, inject, injectHead,
    });
    const composed = compose ? await compose(html) : html;
    return new Response(composed, { headers: { "content-type": "text/html; charset=utf-8" } });
  };
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

// ---- folded notes ------------------------------------------------------------
// When one note is consolidated into another the file goes away, but the URL does not: it is
// live, indexed, and linked from wherever it was shared. So a folded note keeps its route as a
// stub that names where the writing went. Deliberately a rendered PAGE with a canonical + a
// meta refresh, NOT a 301: the static export freezes response BODIES, so a redirect the crawler
// followed would write the destination's full text at both URLs and hand search engines two
// copies of the same note. Add a line here when a note is folded; the export allowlist reads
// this map, so the stub travels to Pages automatically.
export const FOLDED_NOTES: Record<string, { to: string; title: string }> = {
  "/notes/where-were-we": {
    to: "/notes/one-loop-every-repo",
    title: "I Was Shipping Faster Than I Could Understand It",
  },
  "/notes/native-partial-updates": {
    to: "/notes/the-browser-grew-up",
    title: "The Browser Grew Up While I Was Busy With Frameworks",
  },
};

/**
 * The stub served at a published note's old draft address. It is built from the published note's
 * own finished page: the title, description, canonical and every Open Graph and Twitter tag are
 * lifted from that head, so a link preview of the draft URL shows the published note's card and
 * og:url names the published address. The body is one line, and a zero-second refresh moves a
 * real reader on. A page rather than a 301 for the reason FOLDED_NOTES gives: the export freezes
 * bodies, and only a served page carries tags a link-preview crawler can read.
 */
export function publishedDraftStub(noteHtml: string, notePath: string): string {
  const head = noteHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  const keep = [
    ...(head.match(/<title>[\s\S]*?<\/title>/i) ?? []),
    ...(head.match(/<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[^>]*>/gi) ?? []),
    ...(head.match(/<link\s+rel="canonical"[^>]*>/i) ?? []),
  ];
  const dest = `${notePath}/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  ${keep.join("\n  ")}
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url=${dest}">
</head>
<body><p>This draft has been published. <a href="${dest}">Read the published note</a>.</p></body>
</html>`;
}

/** The stub page served at a folded note's old URL. Plain, short, and honest about what happened:
 *  a reader who followed an old link should understand it in one sentence and land in one click. */
export function renderFoldedNotePage(from: string, inject = "", injectHead = ""): string {
  const moved = FOLDED_NOTES[from]!;
  // Trailing slash on the canonical and the refresh target, matching the sitemap's own convention
  // (see server.ts /sitemap.xml): GitHub Pages serves dist/<route>/index.html at the directory URL
  // and 301-redirects the extensionless form to it. Pointing a stub at the extensionless form would
  // spend a second redirect hop on a page whose entire job is one hop. enrichHead leaves an existing
  // canonical alone, which is what this page needs — it points at the DESTINATION, not at itself.
  const dest = `${moved.to}/`;
  return `<!DOCTYPE html>
<html lang="en" data-themes="sourdough baguette brioche">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>This note moved · portfolio.tjakoen.com</title>
  <meta name="description" content="This note was folded into a longer one. It now lives at ${dest}.">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="${dest}">
  <meta http-equiv="refresh" content="3; url=${dest}">
${injectHead}</head>
<body data-screen="note-moved" class="app-window-backdrop">
  <div class="app-shell app-window" data-section="notes" data-rail-collapsed="false" data-surface="screen">
    <portfolio-frame />
    <main class="app-shell__main" id="main-content">
      <div class="board">
        <p class="eyebrow"><span class="name">Notes</span> · this one moved</p>
        <h1 class="masthead">This note was folded into a longer one.</h1>
        <hr class="rule">
        <p class="lede">It said one part of a bigger argument, so it now lives inside that argument
          instead of beside it. Nothing was thrown away. You are on your way to
          <a href="${dest}">${moved.title}</a>, or you can
          <a href="${dest}">go there now</a>.</p>
        <p><a href="/notes">All notes</a></p>
      </div>
    </main>
  </div>
${inject}</body>
</html>`;
}

// ---- the desk's build-time knowledge corpus (ai/knowledge.ts) -----------------
// The local browser model is grounded on the SITE'S OWN CONTENT: every note + the layer docs, plus
// a hand-authored facts block. /standards is skipped (internal), and the PLAN/FEATURES/CONTENT docs
// are simply not collections here, so they never enter the corpus. Served frozen as /knowledge.json
// (§18 data route) so the export freezes it and the model fetches it, never the repo.
export async function listKnowledgeSources(): Promise<KnowledgeSource[]> {
  const out: KnowledgeSource[] = [];
  // Grounding is an explicit allowlist. Adding another public collection must not silently
  // place its records in chat context; badges, events and internal standards are not sources.
  for (const col of collections.filter((c) => c.prefix === "/notes" || c.prefix.endsWith("/docs"))) {
    const slugs = await col.source.list();
    for (let offset = 0; offset < slugs.length; offset += CONTENT_READ_BATCH) {
      const batch = await Promise.all(slugs.slice(offset, offset + CONTENT_READ_BATCH).map(async (slug) => {
        const raw = await col.source.read(slug);
        if (raw === null) return null;
        const { data, body } = parseFrontmatter(raw);
        return {
          route: `${col.prefix}/${slug}`,
          title: typeof data.title === "string" ? data.title : slug,
          markdown: body,
          anchored: true,
        } satisfies KnowledgeSource;
      }));
      for (const source of batch) if (source) out.push(source);
    }
  }
  // the hand-authored grounding (bio, "What is BREAD?", how the site is built) — covers the chips.
  // Not `anchored`: facts.md has no rendered page, so there is no DOM id for a chunk to point at.
  const factsRaw = await Bun.file(join(import.meta.dir, "ai", "facts.md")).text();
  const facts = parseFrontmatter(factsRaw);
  out.push({
    route: FACTS_ROUTE,
    title: typeof facts.data.title === "string" ? facts.data.title : "About",
    markdown: facts.body,
  });
  return out;
}

const portfolioKnowledge = createKnowledgeCache(async () => buildKnowledge(await listKnowledgeSources()));

/** Share corpus construction across cold requests and reuse it until authored content changes. */
export const buildPortfolioKnowledge = (): Promise<Knowledge> => portfolioKnowledge.load();

/** Development watchers call this after note, layer-doc or facts edits; exports build once. */
export const invalidatePortfolioKnowledge = (): void => portfolioKnowledge.invalidate();

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
  audience: string[];
  level: string;
  sections: number;
}
// Memoized. The note corpus is read and parsed from disk in here, and one page render asks for it
// two or three times over (the Recent feed, the calendar merge, the sitemap allowlist). The files do
// not change under a running server — the static export freezes them, and dev `--hot` reloads this
// whole module on edit, which resets the cache — so the first call's promise is the answer for the
// rest of the process. Every caller treats the result as read-only (filter/map/spread, never an
// in-place sort), which is what makes one shared array safe to hand out; keep it that way.
let sortedNoteEntriesP: Promise<NoteFeedEntry[]> | null = null;
function sortedNoteEntries(): Promise<NoteFeedEntry[]> {
  return (sortedNoteEntriesP ??= computeSortedNoteEntries());
}
async function computeSortedNoteEntries(): Promise<NoteFeedEntry[]> {
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
      // One reader group or several, written like tags: \`audience: [learn, build]\`.
      audience: Array.isArray(fm.audience) ? fm.audience.map(String)
        : typeof fm.audience === "string" ? [fm.audience] : [],
      level: fm.level === "deep" ? "deep" : fm.level === "intro" ? "intro" : "",
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

/** The three reader groups a note is written for, set by each note's \`audience\` frontmatter.
 *  They render as the tabs at the top of /notes, with All first and checked by default. */
export const NOTE_AUDIENCES: ReadonlyArray<{ id: string; label: string }> = [
  { id: "build", label: "How I build" },
  { id: "lead", label: "How I lead" },
  { id: "learn", label: "Learning to build" },
];

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
  const CHIP_HEAD = 12;
  // Published notes per tag, shown on the chip so a reader sees how deep a topic goes.
  const tagCount = (t: string) => entries.filter((e) => e.tags.includes(t)).length;
  const chipHtml = (t: string) => {
    const tag = escapeHtml(t);
    return `<label class="chip notes-tag"><input type="checkbox" value="${tag}"><span>#${tag}</span><span class="notes-tag__n">(${tagCount(t)})</span></label>`;
  };
  const headChips = allTags.slice(0, CHIP_HEAD).map(chipHtml).join("");
  const restTags = allTags.slice(CHIP_HEAD);
  const restChips = restTags.length
    ? `<span class="notes-tags__rest" data-tags-rest hidden>${restTags.map(chipHtml).join("")}</span>` +
      `<button type="button" class="notes-tags__more" data-tags-more aria-expanded="false">+${restTags.length} more</button>`
    : "";

  const cardRows = entries.map((e) => {
    const slug = escapeHtml(e.slug);
    const date = escapeHtml(e.date);
    const time = e.date ? `<time datetime="${date}">${date}</time>` : "";
    const byline = `Tjakoen Stolk · the desk${time ? ` · ${time}` : ""}`;
    const summary = escapeHtml(e.summary || e.subtitle);
    const tags = e.tags.map((t) => `<span class="note-card__tag">#${escapeHtml(t)}</span>`).join("");
    const dataTags = escapeHtml(e.tags.join(" "));
    const pinned = e.slug === FLAGSHIP_NOTE_SLUG;
    const levelTag = e.level === "intro" ? `<span class="note-card__level" data-level="intro">Start here</span> · `
      : e.level === "deep" ? `<span class="note-card__level" data-level="deep">Deep dive</span> · ` : "";
    const pinTag = pinned ? `<span class="note-card__pin">📌 Pinned</span> · ` : "";
    return `<li class="note-card${pinned ? " note-card--pinned" : ""}" data-surface="note:${slug}"${pinned ? " data-pinned" : ""} data-date="${date}" data-score="${e.score}" data-tags="${dataTags}" data-audience="${escapeHtml(e.audience.join(" "))}" data-level="${e.level}">
        <div class="note-card__vote" title="${e.score} minute read"><span class="note-card__score">${e.score}</span><span class="note-card__unit">min</span><span class="visually-hidden"> minute read</span></div>
        <div class="note-card__main">
          <p class="note-card__byline">${pinTag}${levelTag}${byline}</p>
          <h2 class="note-card__title"><a href="/notes/${slug}">${escapeHtml(e.title)}</a></h2>
          <p class="note-card__summary">${summary}</p>
          <p class="note-card__foot"><span class="note__tags">${tags}</span>
            <a class="note-card__sections" href="/notes/${slug}">${e.sections} sections</a></p>
        </div>
      </li>`;
  });
  const paths = `<li class="notes-paths">
      <nav aria-label="Explore the work behind the notes">
        <span class="notes-paths__label">Explore the work</span>
        <a href="/bread">The stack</a>
        <a href="/teaching">Teaching</a>
        <a href="/talks">Talks</a>
      </nav>
    </li>`;
  // Keep the flagship note first. The three paths sit after it, where they can lead into the
  // projects and teaching without pushing the first piece of writing below another toolbar.
  const cards = [cardRows[0], paths, ...cardRows.slice(1)].filter(Boolean).join("\n");

  // The inline island: pure DOM reorder/hide over the cards already in the page (no fetch, no
  // new data route). Guarded so a missing form/list (or no JS at all) leaves the newest-first
  // list visible and the controls hidden, per the brief's no-JS requirement.
  const island = `<script>
    (function () {
      var form = document.querySelector("[data-feed-controls]");
      var list = document.querySelector(".note-feed");
      if (!form || !list) return;
      var cards = Array.prototype.slice.call(list.querySelectorAll(".note-card"));
      var paths = list.querySelector(".notes-paths");
      var newest = cards.slice();   // New = the original newest-first DOM order (pinned already first)
      var search = form.querySelector("[data-notes-search]");
      var tagFilters = form.querySelector("[data-tag-filters]");
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
        var arranged = floatPinned(ordered);
        arranged.forEach(function (card) { list.appendChild(card); });
        // Sorting moves note cards as a group. Keep the work links after the pinned flagship,
        // rather than letting them become the first row after a visitor changes the sort.
        var pinned = arranged.find(function (card) { return card.hasAttribute("data-pinned"); });
        if (paths && pinned) pinned.after(paths);
      }

      // one filter pass over BOTH controls: the checked tag chips (a card must carry one) AND the
      // free-text search (matched against the card's own text). Either empty means "don't constrain".
      function applyFilters() {
        var aud = form.querySelector('input[name="audience"]:checked');
        var audience = aud ? aud.value : "";
        var lvl = form.querySelector('input[name="level"]:checked');
        var level = lvl ? lvl.value : "";
        var boxes = Array.prototype.slice.call(form.querySelectorAll('input[type="checkbox"]:checked:not([name="level"])'));
        var wanted = boxes.map(function (b) { return b.value; });
        var q = (search && search.value || "").trim().toLowerCase();
        cards.forEach(function (card) {
          var tags = (card.getAttribute("data-tags") || "").split(" ");
          var tagOk = wanted.length === 0 || wanted.some(function (t) { return tags.indexOf(t) !== -1; });
          var textOk = q === "" || (card.textContent || "").toLowerCase().indexOf(q) !== -1;
          var audOk = audience === "" || (card.getAttribute("data-audience") || "").split(" ").indexOf(audience) !== -1;
          var levelOk = level === "" || card.getAttribute("data-level") === level;
          card.hidden = !(tagOk && textOk && audOk && levelOk);
        });
        if (empty && !(wanted.length === 0 && q === "" && audience === "" && level === "")) empty.hidden = true;
        recountTags(audience);
        var clearBtn = form.querySelector("[data-tags-clear]");
        if (clearBtn) clearBtn.hidden = form.querySelectorAll('input[type="checkbox"]:checked').length === 0;
      }

      // The tag row follows the open tab: each count is the notes in that tab carrying the tag,
      // and a tag with none there is hidden (unless it is checked, so a reader can still uncheck it).
      function recountTags(audience) {
        var inTab = cards.filter(function (card) {
          return audience === "" || (card.getAttribute("data-audience") || "").split(" ").indexOf(audience) !== -1;
        });
        Array.prototype.forEach.call(form.querySelectorAll(".notes-tag"), function (chip) {
          var box = chip.querySelector("input");
          var n = inTab.filter(function (card) {
            return box.name === "level" ? card.getAttribute("data-level") === box.value
              : (card.getAttribute("data-tags") || "").split(" ").indexOf(box.value) !== -1;
          }).length;
          var out = chip.querySelector(".notes-tag__n");
          if (out) out.textContent = "(" + n + ")";
          chip.hidden = n === 0 && !box.checked;
        });
      }

      // Mirror the current tag filter into the URL so a filtered view is shareable (replaceState,
      // not push — filtering isn't navigation). Search text stays out of the URL. Empty tag set
      // drops the query entirely.
      function syncUrl() {
        var boxes = Array.prototype.slice.call(form.querySelectorAll('input[type="checkbox"]:checked:not([name="level"])'));
        var wanted = boxes.map(function (b) { return b.value; });
        var aud = form.querySelector('input[name="audience"]:checked');
        var params = [];
        if (aud && aud.value) params.push("for=" + aud.value);
        var lvl = form.querySelector('input[name="level"]:checked');
        if (lvl && lvl.value) params.push("level=" + lvl.value);
        if (wanted.length) params.push("tag=" + wanted.join(","));
        var url = location.pathname + (params.length ? "?" + params.join("&") : "") + location.hash;
        try { history.replaceState(null, "", url); } catch { /* file:// — leave the URL be */ }
      }

      function revealRest(open) {
        if (!rest || !moreBtn) return;
        rest.hidden = !open;
        moreBtn.setAttribute("aria-expanded", open ? "true" : "false");
        moreBtn.textContent = open ? "fewer" : "+" + rest.querySelectorAll(".chip").length + " more";
      }
      var clearTags = form.querySelector("[data-tags-clear]");
      if (clearTags) clearTags.addEventListener("click", function () {
        Array.prototype.forEach.call(form.querySelectorAll('input[type="checkbox"]:checked'), function (b) { b.checked = false; });
        applyFilters(); syncUrl();
      });
      if (moreBtn) moreBtn.addEventListener("click", function () { revealRest(rest.hidden); });

      // Honor a ?tag= deep link on boot: check every chip that matches (comma list ok) and filter.
      // A requested tag with no chip has no notes yet — surface the empty state, naming the tag(s),
      // and leave the full list visible (an unknown tag filters nothing). A matched tag in the
      // collapsed overflow reveals it, so the checked chip is visible.
      function applyQueryTags() {
        var forParam = new URLSearchParams(location.search).get("for");
        var audBox = forParam && form.querySelector('input[name="audience"][value="' + forParam.replace(/[^a-z]/g, "") + '"]');
        if (audBox) { audBox.checked = true; applyFilters(); }
        var levelParam = new URLSearchParams(location.search).get("level");
        var levelBox = levelParam && form.querySelector('input[name="level"][value="' + levelParam.replace(/[^a-z]/g, "") + '"]');
        if (levelBox) { levelBox.checked = true; applyFilters(); }
        var q = new URLSearchParams(location.search).get("tag");
        if (!q) return;
        if (tagFilters) tagFilters.open = true;
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
        else if (target.type === "checkbox" || target.name === "audience" || target.name === "level") { applyFilters(); syncUrl(); }
      });
      if (search) search.addEventListener("input", function () { applyFilters(); });

      applyQueryTags();
      // Keep the familiar chip row on desktop. On phones, the disclosure stays closed until a
      // reader asks for it, so the first essay is not buried under the filter controls.
      if (tagFilters && window.matchMedia && window.matchMedia("(min-width: 40.001rem)").matches) tagFilters.open = true;
      recountTags((form.querySelector('input[name="audience"]:checked') || {}).value || "");
      form.hidden = false;   // reveal the controls only once the island is live
    })();
  </script>`;

  const deskTrigger = `<button class="btn notes-toolbar__ai" data-variant="soft" data-ai-run data-action="demo.run" data-target="screen" type="button">▷ See what's new</button>`;
  const body = `<h1 class="masthead">Notes</h1>
    <form class="notes-toolbar" data-feed-controls hidden>
      <div class="notes-audience" role="radiogroup" aria-label="Show notes for">
        <label class="notes-audience__tab"><input type="radio" name="audience" value="" checked><span>All</span><span class="notes-audience__n">${entries.length}</span></label>
        ${NOTE_AUDIENCES.map((a) => `<label class="notes-audience__tab"><input type="radio" name="audience" value="${a.id}"><span>${a.label}</span><span class="notes-audience__n">${entries.filter((e) => e.audience.includes(a.id)).length}</span></label>`).join("\n        ")}
      </div>
      <div class="notes-toolbar__bar">
        <input class="notes-search" type="search" placeholder="Search notes" aria-label="Search notes"
               autocomplete="off" data-notes-search>
        <div class="notes-toolbar__actions">
          <div class="chips notes-sort" role="radiogroup" aria-label="Sort">
            <label class="chip"><input type="radio" name="sort" value="new" checked> New</label>
            <label class="chip"><input type="radio" name="sort" value="top"> Longest</label>
          </div>
          ${deskTrigger}
        </div>
      </div>
      <details class="notes-tag-filters" data-tag-filters>
        <summary>Filter by tag</summary>
        <div class="chips notes-tags" aria-label="Filter by tag"><label class="chip notes-tag notes-tag--level"><input type="checkbox" name="level" value="intro"><span>Start here</span><span class="notes-tag__n">(${entries.filter((e) => e.level === "intro").length})</span></label>${headChips}${restChips}<button type="button" class="notes-tags__clear" data-tags-clear hidden>× clear</button></div>
      </details>
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

/** The welcome page's "Recent" feed: the newest dated things, notes AND calendar events, newest
 *  first — server-composed live data (the export freezes it, §18). It says "Recent", so a talk
 *  given last week belongs in it as much as a note published last week; /calendar is the full
 *  version of the same merge. Shape matches the <welcome-recent> component's bindings. */
export interface RecentNote { title: string; href: string; path: string; kindLabel: string; }
export function invalidateRecentContent(): void {
  sortedNoteEntriesP = null;
  eventCalendarEventsP = null;
}
export async function listRecentNotes(limit = 4): Promise<RecentNote[]> {
  const notes = (await sortedNoteEntries()).filter((e) => e.date).map((e) => ({
    date: e.date, title: e.title, href: `/notes/${e.slug}`, path: `notes/${e.slug}.md`, kindLabel: "Note",
  }));
  const events = (await listEventCalendarEvents()).map((e) => ({
    date: e.date, title: e.title, href: e.link, path: `calendar/${e.id.replace(/^event-/, "")}.md`, kindLabel: kindLabel(e.kind),
  }));
  return [...notes, ...events]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map(({ title, href, path, kindLabel }) => ({ title, href, path, kindLabel }));
}

/** The welcome page's feed walkthrough: the single newest calendar event, as a one-item array so
 *  the card binds with the same each= every other data-bound card uses. One item, because the card
 *  is a door to /calendar rather than a second feed; no events means no card, which is the right
 *  empty state. */
export interface LatestEvent { title: string; href: string; kindLabel: string; dateLabel: string; }
export async function listLatestEvents(limit = 1): Promise<LatestEvent[]> {
  // listEventCalendarEvents returns the collection in the source's own order, so sort here rather
  // than trusting it: "latest" is the whole point of this card.
  const events = [...await listEventCalendarEvents()].sort((a, b) => b.date.localeCompare(a.date));
  return events.slice(0, limit).map((e) => ({
    title: e.title,
    href: `/calendar#${e.domId}`,     // the feed, scrolled to this post — not the post's own page
    kindLabel: e.kindLabel,
    dateLabel: e.dateLabel,
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
// The event page's share block (molecules/share-block): the ready-to-post copy for LinkedIn and the
// canonical link back, straight off the entry's own `social:` frontmatter — one source of truth, so
// the page and the post it becomes cannot drift. Opt-in per event: no `social:` key, no block. A
// <details> so it stays folded away from the reader (it is a tool, not part of the post), and so it
// still works with no JS: open it, the text is selectable and the link is a real anchor.
function renderShareBlock(social: unknown, url: string, image?: unknown, imageAlt?: unknown): string {
  if (typeof social !== "string" || !social.trim()) return "";
  // Unwrap the authoring line breaks: the source file is hard-wrapped at 110 columns like every
  // other file here, but a paste into LinkedIn must break only where a paragraph does. Blank lines
  // stay, single newlines inside a paragraph become spaces.
  const unwrapped = social.trim().split(/\n{2,}/)
    .map((para) => para.split("\n").map((l) => l.trim()).join(" ").trim())
    .filter(Boolean).join("\n\n");
  const text = escapeHtml(unwrapped);
  const href = escapeHtml(url);
  // One image, or a dash list of them for a multi-image post. Alts pair with images by position; a
  // missing alt falls back to a numbered label rather than an empty one.
  const list = (v: unknown) => (Array.isArray(v) ? v : [v]).filter((x): x is string => typeof x === "string" && !!x.trim()).map((x) => x.trim());
  const images = list(image);
  const alts = list(imageAlt);
  const many = images.length > 1;
  const imageBlock = images.map((src, i) => {
    const imageHref = escapeHtml(src);
    const alt = escapeHtml(alts[i] ?? (many ? `Social card ${i + 1} of ${images.length}` : "Social card"));
    const label = many ? `Download image ${i + 1} of ${images.length}` : "Download image";
    return `<figure class="share-block__figure">
    <img class="share-block__image" src="${imageHref}" alt="${alt}" width="1200" height="1200" loading="lazy">
    <figcaption class="share-block__caption"><a class="share-block__download" href="${imageHref}" download>${label}</a></figcaption>
  </figure>`;
  }).join("\n  ");
  const gallery = many ? `<div class="share-block__gallery">${imageBlock}</div>` : imageBlock;
  return `<details class="share-block" data-share>
  <summary class="share-block__head">Social post copy</summary>
  <pre class="share-block__text" data-share-text>${text}</pre>
  ${gallery}
  <p class="share-block__row">
    <button class="share-block__copy" type="button" data-share-copy aria-live="polite">Copy</button>
    <a class="share-block__link" href="${href}">${href}</a>
  </p>
</details>`;
}

const CONTENT_COPY_SCRIPT = `<script>
  (function () {
    function legacyCopy(value) {
      var field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      var copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
      field.remove();
      return copied;
    }
    function wire(block) {
      var button = block.querySelector('[data-share-copy], [data-copy-template-button]');
      var text = block.querySelector('[data-share-text], pre code');
      if (!button || !text) return;
      var label = button.textContent;
      var reset;
      button.hidden = false;
      button.addEventListener('click', async function () {
        clearTimeout(reset);
        button.removeAttribute('data-copied');
        var value = text.textContent || '';
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            try { await navigator.clipboard.writeText(value); }
            catch (_) { if (!legacyCopy(value)) throw new Error('Clipboard write failed'); }
          } else if (!legacyCopy(value)) {
            throw new Error('Clipboard is unavailable');
          }
          button.textContent = 'Copied';
          button.setAttribute('data-copied', '');
          reset = setTimeout(function () {
            button.textContent = label;
            button.removeAttribute('data-copied');
          }, 1600);
        } catch (_) {
          button.textContent = 'Copy failed, select it instead';
        }
      });
    }
    document.querySelectorAll('[data-share], [data-copy-template]').forEach(wire);
    window.addEventListener('note-share:open', function (e) { wire(e.detail); });
  })();
</script>`;

function renderPhotoGrid(photos: EventPhoto[]): string {
  if (!photos.length) return "";
  const items = photos.map((p) => {
    const src = escapeHtml(p.src);
    const dims = p.width && p.height ? ` width="${escapeHtml(p.width)}" height="${escapeHtml(p.height)}"` : "";
    return `<a class="feed-photo" data-lightbox href="${src}"><img src="${src}"${dims} alt="${escapeHtml(p.alt)}" loading="lazy" decoding="async"></a>`;
  }).join("");
  return `<div class="feed-photos" data-event-photos data-lightbox-group>${items}</div>`;
}

// The event page's SECONDARY photo grid (`gallery:`), rendered below the body. The hero strip on top
// is the four photos that carry the post; everything else from the day lands here, evenly tiled and
// captioned by its own alt text, in a SEPARATE data-lightbox-group so walking the gallery does not
// walk back into the hero. Same flat "src | WxH | alt" frontmatter encoding as `photos:`, same
// parser, same no-JS fallback (each tile is a real link to the full image).
// The grid itself is GRAIN's `gallery` molecule (design work belongs up in grain, not here): this
// emits grain's class names and owns only the section around them, the heading and the frontmatter.
// ---- course badges -----------------------------------------------------------
// The badge medallion, drawn from GRAIN tokens (no hardcoded hex — the audit catches those). The
// course sets the monogram; the term sets the ring (prelim = soft, midterm = solid) and the label.
// Wrap a short title into <= maxLines lines of about `perLine` chars, on word boundaries. SVG has no
// auto-wrap, so the badge title is split here and emitted as stacked <tspan>s.
function wrapTitle(s: string, perLine = 16, maxLines = 3): string[] {
  const words = s.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > perLine) { lines.push(cur); cur = w; }
    else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

// Full course name per course key, for the medallion's top line. The badge is issued for a named
// course, not a course code, so the card carries the name a reader recognises.
export const BADGE_COURSE_NAMES: Record<string, string> = {
  apsi: "Application and System Integration",
  adet: "Application Development and Emerging Technologies",
  introweb: "Basic Programming in Web Development",
};

// What each badge attests, and the technologies it exercises, keyed by course and term. One source
// for both surfaces: the criteria (class) page and every recipient's cert page render the same words,
// so a student's badge states its own criteria inline rather than only linking out to them.
export const BADGE_CRITERIA: Record<string, Record<string, {
  attests: string; skills: string[]; covers: string[]; technologies: string;
}>> = {
  apsi: {
    prelim: {
      attests: "Holders built and deployed a working front end, writing the JavaScript behind it and composing it as React components with their own state.",
      skills: [
        "Write modern JavaScript: values, functions, arrays and objects, and asynchronous code",
        "Compose a user interface from reusable React components",
        "Manage component state and side effects, and pass data through props",
        "Build a front end and deploy it to a cloud host",
      ],
      covers: ["Modules 1 to 3 of Application and System Integration", "Course outcomes CO1 to CO3"],
      technologies: "JavaScript, React, component state and effects, a frontend build and a cloud deploy.",
    },
    midterm: {
      attests: "Holders built and deployed a working backend service: an HTTP API over a relational database they designed themselves.",
      skills: [
        "Model relational data and write SQL against PostgreSQL",
        "Build a REST API with Node and Express, with routes, and handlers",
        "Connect an API to a database and return real query results",
        "Deploy a backend service to a cloud host",
      ],
      covers: ["Modules 4 to 5 of Application and System Integration", "Course outcomes CO1 to CO3"],
      technologies: "Node, Express, REST APIs, PostgreSQL data modelling and a cloud deploy.",
    },
  },
  adet: {
    prelim: {
      attests: "Holders built an interactive mobile interface in Flutter, writing the Dart behind it with object-oriented structure.",
      skills: [
        "Write Dart: types, collections, classes and object-oriented structure",
        "Compose a mobile interface from Flutter widgets",
        "Lay out screens with rows, columns and constraints that adapt to the device",
        "Hold and update state so the interface responds to input",
      ],
      covers: ["Modules 1 to 3 of Application Development and Emerging Technologies"],
      technologies: "Dart, object-oriented programming, Flutter widgets, layout and state.",
    },
    midterm: {
      attests: "Holders built a multi-screen Flutter application: navigation between screens, forms that take input, and lists that open into detail views.",
      skills: [
        "Navigate between screens and pass data along the route",
        "Build forms that capture and validate user input",
        "Render scrolling lists from data and open each item into a detail screen",
        "Structure an application across several screens and shared state",
      ],
      covers: ["Modules 4 to 5 of Application Development and Emerging Technologies"],
      technologies: "Flutter navigation, forms, lists and detail screens, and multi-screen app structure.",
    },
  },
  introweb: {
    prelim: {
      attests: "Holders built responsive web pages from scratch: semantic HTML structure styled with modern CSS layout that adapts to any screen.",
      skills: [
        "Structure a page with semantic HTML that follows web standards",
        "Style a page with CSS: the box model, typography and colour",
        "Lay out a page with CSS grid and flexbox",
        "Make a layout responsive, with a clear visual hierarchy on any screen size",
      ],
      covers: ["Modules 1 to 5 of Basic Programming in Web Development", "Course outcomes CO1 and CO2"],
      technologies: "HTML semantics, CSS grid and flexbox, and responsive layout.",
    },
    midterm: {
      attests: "Holders made their pages interactive with client-side JavaScript, and deployed them to the live web.",
      skills: [
        "Write client-side JavaScript to drive page behaviour",
        "Read and change the DOM in response to program logic",
        "Handle browser events from user interaction",
        "Deploy an interactive page to the live web",
      ],
      covers: ["Modules 6 to 8 of Basic Programming in Web Development"],
      technologies: "JavaScript, DOM manipulation, browser events and deploying interactive pages.",
    },
  },
};

// The subject mark at the badge's crest, drawn per course rather than a generic star, so the badge
// says something about the craft before a word is read. Centred on (150, 46), about 30px tall.
//   apsi     — a browser window joined to a database cylinder: an app wired front to back
//   adet     — a phone handset with a play-arrow: a mobile app
//   introweb — an angle bracket pair around a slash: markup and the web
function badgeCourseIcon(course: string | undefined, hue: string): string {
  const s = `style="stroke:${hue}" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
  if (course === "adet") {
    return `<g ${s}>
      <rect x="138" y="30" width="24" height="34" rx="4"/>
      <line x1="145" y1="36" x2="155" y2="36"/>
      <path d="M146 50 l9 -5 -9 -5 z" style="fill:${hue};stroke:${hue}"/>
    </g>`;
  }
  if (course === "introweb") {
    return `<g ${s}>
      <path d="M140 36 l-9 10 9 10"/>
      <path d="M160 36 l9 10 -9 10"/>
      <line x1="154" y1="32" x2="146" y2="60"/>
    </g>`;
  }
  // apsi (and the fallback): a window over a database
  return `<g ${s}>
    <rect x="131" y="28" width="26" height="20" rx="3"/>
    <line x1="131" y1="34" x2="157" y2="34"/>
    <ellipse cx="160" cy="49" rx="9" ry="3.4"/>
    <path d="M151 49 v9 a9 3.4 0 0 0 18 0 v-9"/>
  </g>`;
}

// The badge, as a self-describing certification card (like Credly / Lumify): the course it belongs to
// on top, the curriculum skill it certifies in the centre, and the issuer at the foot — an instructor
// awarding it, with the school named as affiliation, NOT as the issuing body. Shared so the image tool
// rasters the EXACT same art headless. All colours come in as CSS values and are emitted via style= (a
// var() resolves in a style declaration but NOT in a bare SVG presentation attribute), so the page
// passes custom-property refs (--badge-hue etc.) and the image tool passes hex literals.
export function badgeMedallionSvg(opts: {
  courseName: string; subtitle: string; year: string; issuerName?: string; recipient?: string;
  course?: string;   // course key (apsi/adet/introweb) — picks the subject icon
  hue: string; ink?: string; muted?: string; paper?: string; font?: string; size?: number;
}): string {
  const ink = opts.ink ?? "var(--ink)", muted = opts.muted ?? "var(--ink-muted)";
  const paper = opts.paper ?? "var(--paper)", font = opts.font ?? "var(--font-accent)";
  const serif = "Georgia, 'Times New Roman', serif", size = opts.size ?? 300;
  const issuerName = escapeHtml(opts.issuerName ?? "Tjakoen Stolk");
  // Course name across the top, up to two lines, settled around y84.
  const courseLines = wrapTitle(opts.courseName, 26, 2).map(escapeHtml);
  const courseY = 84 - (courseLines.length - 1) * 7;
  const course = courseLines.map((l, i) =>
    `<tspan x="150" y="${courseY + i * 14}">${l}</tspan>`).join("");
  // The certified skill as the headline, up to three lines, settled around y165. A title that will
  // not fit three lines of 16 rewraps at 19, because the three-line cap drops the overflow silently:
  // "Builds Full-Stack JavaScript and AI" lost its last word that way. Titles that already fit keep
  // their old breaks.
  const titleLines = (wrapTitle(opts.subtitle, 16, 4).length > 3
    ? wrapTitle(opts.subtitle, 19, 3) : wrapTitle(opts.subtitle, 16, 3)).map(escapeHtml);
  const titleY = 165 - (titleLines.length - 1) * 14;
  const title = titleLines.map((l, i) =>
    `<tspan x="150" y="${titleY + i * 28}">${l}</tspan>`).join("");
  return `<svg viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeHtml(opts.courseName)} badge: ${escapeHtml(opts.subtitle)}, issued by ${issuerName}, ${escapeHtml(opts.year)}" width="${size}" height="${Math.round(size * 340 / 300)}">
    <rect x="8" y="8" width="284" height="324" rx="26" style="fill:${paper};stroke:${opts.hue}" stroke-width="6"/>
    <rect x="19" y="19" width="262" height="302" rx="17" fill="none" style="stroke:${opts.hue}" stroke-width="1" opacity="0.35"/>
    ${badgeCourseIcon(opts.course, opts.hue)}
    <text text-anchor="middle" font-family="${serif}" font-size="10.5" letter-spacing="1.5" style="fill:${muted}">${course}</text>
    <text text-anchor="middle" font-family="${serif}" font-size="22" style="fill:${ink}">${title}</text>
    ${opts.recipient ? `<text x="150" y="212" text-anchor="middle" font-family="${serif}" font-size="9" letter-spacing="3" style="fill:${muted}">AWARDED TO</text>
    <text x="150" y="234" text-anchor="middle" font-family="${serif}" font-size="17" style="fill:${ink}">${escapeHtml(opts.recipient)}</text>` : ""}
    <line x1="70" y1="248" x2="230" y2="248" style="stroke:${muted}" stroke-width="1" opacity="0.3"/>
    <text x="150" y="273" text-anchor="middle" font-family="${font}" font-size="15" font-weight="700" style="fill:${opts.hue}">${issuerName}</text>
    <text x="150" y="291" text-anchor="middle" font-family="${serif}" font-size="8.5" letter-spacing="1.2" style="fill:${muted}">INSTRUCTOR &#183; HOLY ANGEL UNIVERSITY</text>
    <text x="150" y="306" text-anchor="middle" font-family="${serif}" font-size="8" letter-spacing="1.2" style="fill:${muted}">SCHOOL OF COMPUTING &#183; ${escapeHtml(opts.year)}</text>
  </svg>`;
}

function renderBadgeArt(courseKey: unknown, term: unknown, subtitle: unknown, year: string, issuerName: string, recipient?: unknown): string {
  const key = String(courseKey || "course");
  const courseName = BADGE_COURSE_NAMES[key] || String(courseKey || "");
  // On the page the hue is --badge-hue (set per course by BADGE_STYLE via data-course); every colour is
  // already emitted through style=, so the custom property resolves without post-processing.
  const svg = badgeMedallionSvg({
    courseName, subtitle: String(subtitle || ""), year, issuerName, course: key,
    recipient: recipient ? String(recipient) : undefined,
    hue: "var(--badge-hue)", ink: "var(--ink)", muted: "var(--ink-muted)", paper: "var(--paper)", font: "var(--font-accent)", size: 220,
  });
  return `<figure class="badge-art" data-course="${escapeHtml(key)}" data-term="${escapeHtml(String(term || ""))}">
  ${svg}
</figure>`;
}

function renderIssuer(frontmatter: Record<string, unknown>): string {
  const issuer = escapeHtml(String(frontmatter.issuer || "Tjakoen Stolk"));
  const role = escapeHtml(String(frontmatter.issuerRole || ""));
  return `<p class="badge-issuer"><span class="badge-issuer__name">${issuer}</span>${role ? `<span class="badge-issuer__role">${role}</span>` : ""}<a class="badge-issuer__link" href="/teaching">About the issuer</a></p>`;
}

// What the badge attests plus its technologies, inline on the page. Drawn from BADGE_CRITERIA by
// course and term so every recipient's cert states its own criteria without a click-through. Renders
// nothing for a course/term the map does not cover.
// What the recipient built, as GRAIN's gallery molecule wired to the lightbox. Screenshots use the
// same flat "src | WxH | alt" encoding as event photos. showcaseOptOut: true hides them without
// deleting the files, so a student's removal request is one frontmatter line.
function renderBadgeShowcase(frontmatter: Record<string, unknown>): string {
  if (frontmatter.type !== "cert" || String(frontmatter.showcaseOptOut) === "true") return "";
  const shots = parsePhotos(frontmatter.showcase);
  if (!shots.length) return "";
  const items = shots.map((p) => {
    const src = escapeHtml(p.src);
    const dims = p.width && p.height ? ` width="${escapeHtml(p.width)}" height="${escapeHtml(p.height)}"` : "";
    const alt = escapeHtml(p.alt);
    return `<figure class="gallery__item">
      <a class="gallery__link" data-lightbox href="${src}"><img src="${src}"${dims} alt="${alt}" loading="lazy" decoding="async"></a>
      <figcaption class="gallery__caption">${alt}</figcaption>
    </figure>`;
  }).join("");
  // Phone captures are tall, desktop ones wide: crop the whole grid to the first shot's orientation.
  const first = shots[0];
  const tall = Number(first.height) > Number(first.width);
  const style = tall ? "--gallery-ratio: 9 / 16; --gallery-min: 11rem;" : "--gallery-ratio: 16 / 10;";
  return `<section class="badge-criteria badge-showcase" data-surface="badge:showcase"><h3 class="badge-criteria__heading">What they built</h3><div class="gallery" data-lightbox-group style="${style}">${items}</div></section>`;
}

function renderBadgeActivities(frontmatter: Record<string, unknown>): string {
  let activities: unknown;
  try { activities = JSON.parse(String(frontmatter.activitiesJson || "[]")); } catch { return ""; }
  if (!Array.isArray(activities) || !activities.length) return "";
  const rows = activities.flatMap(activity => {
    if (!activity || typeof activity.id !== "string" || typeof activity.title !== "string" || typeof activity.description !== "string") return [];
    const links = frontmatter.type === "cert" && Array.isArray(activity.publicEvidence) ? activity.publicEvidence.flatMap((e: {url?:unknown;commit?:unknown}) => {
      try {
        const url = new URL(String(e.url)), parts = decodeURIComponent(url.pathname).split("/").filter(Boolean);
        if (url.protocol !== "https:" || url.hostname !== "github.com" || url.username || url.password || url.search || url.hash || parts.length < 2 || /^hau-/i.test(parts[0]!) || /^student-/i.test(parts[1]!)) return [];
        return [`<a href="${escapeHtml(url.href)}" target="_blank" rel="noopener noreferrer">View public work${typeof e.commit === "string" && /^[a-f0-9]{40}$/i.test(e.commit) ? ` at ${escapeHtml(e.commit.slice(0,7))}` : ""}</a>`];
      } catch { return []; }
    }).join(" · ") : "";
    return [`<li><strong>${escapeHtml(activity.title)}</strong> <span>(${escapeHtml(activity.id)})</span><p>${escapeHtml(activity.description)}</p>${links ? `<p>${links}</p>` : ""}</li>`];
  }).join("");
  const threshold = Number(frontmatter.thresholdPercent);
  return `<section class="badge-criteria" data-surface="badge:activities"><h3 class="badge-criteria__heading">${frontmatter.type === "cert" ? "Activities completed" : "Activities recognized"}</h3>${threshold === 75 ? `<p class="badge-criteria__lede">Award threshold: 75%, after instructor review.</p>` : ""}<ul class="badge-criteria__list">${rows}</ul></section>`;
}

function renderBadgeCriteria(frontmatter: Record<string, unknown>): string {
  if (!frontmatter.awardKey && !frontmatter.criteriaText) return `<section class="badge-criteria" data-surface="badge:criteria"><h3 class="badge-criteria__heading">Historical award</h3><p>This historical award used the earlier participation rule and is awaiting eligibility reconciliation. It does not certify the new activity-based threshold.</p></section>`;
  if (typeof frontmatter.criteriaText === "string") return `<section class="badge-criteria" data-surface="badge:criteria"><h3 class="badge-criteria__heading">Award criteria</h3><p class="badge-criteria__lede">${escapeHtml(frontmatter.criteriaText)}</p></section>`;
  const c = BADGE_CRITERIA[String(frontmatter.course || "")]?.[String(frontmatter.term || "")];
  if (!c) return "";
  const skills = c.skills.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  const covers = c.covers.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
  return `<section class="badge-criteria">
    <h3 class="badge-criteria__heading">What this badge attests</h3>
    <p class="badge-criteria__lede">${escapeHtml(c.attests)}</p>
    <h3 class="badge-criteria__heading">What the holder can do</h3>
    <ul class="badge-criteria__list">${skills}</ul>
    <h3 class="badge-criteria__heading">What it covers</h3>
    <ul class="badge-criteria__list">${covers}</ul>
    <h3 class="badge-criteria__heading">Technologies</h3>
    <p class="badge-criteria__tech">${escapeHtml(c.technologies)}</p>
  </section>`;
}

// Bespoke styling for the badge templates. Site surface, not a reusable GRAIN component, so it rides
// with the markup like renderShareBlock's script does. Tokens only — no hardcoded colour (the audit
// catches hex), so it re-skins with the rest of the site.
const BADGE_STYLE = `<style>
/* Per-course hue. The one place colour enters this monochrome site, scoped to the medallion so it
   cannot leak into the rest of the page. A course sets --badge-hue on the figure; the SVG inherits
   it. Unknown course falls back to the site accent (staying monochrome). */
.badge-art { --badge-hue: var(--color-accent); }
.badge-art[data-course="apsi"] { --badge-hue: #d07f4a; }
.badge-art[data-course="adet"] { --badge-hue: #3fa89e; }
.badge-art[data-course="introweb"] { --badge-hue: #8877d6; }
.badge-cert, .badge-class { margin: var(--space-l, 1.5rem) 0; }
.badge-criteria { margin: var(--space-l, 1.5rem) 0; }
.badge-criteria__heading { font-size: var(--text-md); margin: var(--space-m, 1rem) 0 0.35em; }
.badge-cert__head, .badge-class__head { display: flex; gap: var(--space-l, 1.5rem); align-items: center; flex-wrap: wrap; }
.badge-art svg { display: block; }
.badge-cert__awarded { color: var(--ink-muted); margin: 0; }
.badge-cert__name, .badge-class__name { margin: 0.15em 0; font-size: var(--text-xl); }
.badge-issuer { display: flex; flex-direction: column; margin: 0.5em 0; }
.badge-issuer__name { font-weight: 700; }
.badge-issuer__role { color: var(--ink-muted); font-size: var(--text-sm); }
.badge-verify { display: grid; grid-template-columns: max-content 1fr; gap: 0.35em 1em; margin: var(--space-l, 1.5rem) 0; }
.badge-verify dt { color: var(--ink-muted); }
.badge-verify dd { margin: 0; }
.badge-roster { width: 100%; border-collapse: collapse; margin: var(--space-m, 1rem) 0; }
.badge-roster th, .badge-roster td { text-align: left; padding: 0.5em 0.75em; border-bottom: 1px solid var(--border); }
.badge-roster th { color: var(--ink-muted); font-size: var(--text-sm); }
.badge-subtitle { font-size: var(--text-lg); margin: 0.15em 0; }
.badge-actions { display: flex; gap: 0.6em; flex-wrap: wrap; margin: var(--space-m, 1rem) 0; }
.badge-btn { display: inline-block; padding: 0.5em 1em; border: 1px solid var(--border); border-radius: 6px; background: var(--color-surface); color: var(--ink); font: inherit; cursor: pointer; text-decoration: none; }
.badge-btn:hover { border-color: var(--badge-hue, var(--color-accent)); }
.badge-copy-fallback { display: grid; gap: 0.35em; max-width: 100%; margin: var(--space-s, 0.5rem) 0; color: var(--ink-muted); font-size: var(--text-sm); }
.badge-copy-fallback[hidden] { display: none; }
.badge-copy-fallback input { box-sizing: border-box; width: min(100%, 32rem); min-width: 0; }
/* The criteria block: what the badge attests, as scannable bullets rather than a wall of prose. */
.badge-criteria { margin: var(--space-l, 1.5rem) 0; padding-top: var(--space-m, 1rem); border-top: 1px solid var(--border); }
.badge-criteria__heading { font-size: var(--text-sm); letter-spacing: 0.12em; text-transform: uppercase; color: var(--ink-muted); margin: 1.4em 0 0.5em; }
.badge-criteria__heading:first-child { margin-top: 0; }
.badge-criteria__lede { font-size: var(--text-lg); margin: 0; }
.badge-criteria__list { margin: 0; padding-left: 1.2em; }
.badge-criteria__list li { margin: 0.3em 0; }
.badge-criteria__tech { color: var(--ink-muted); margin: 0; }
.badge-design-sections__list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--color-line); }
.badge-design-sections__row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.25em 1em; padding: 0.6em 0; border-bottom: 1px solid var(--color-line); }
.badge-design-sections__count { color: var(--color-muted); font-family: var(--font-mono); font-size: var(--text-sm); }
.badge-design-sections__criteria { flex-basis: 100%; margin: 0; color: var(--color-muted); font-size: var(--text-sm); }
</style>`;

// The /badges entry template: a CERT page (one recipient's verifiable award) or a badge-CLASS page
// (the roster). Both open with the medallion and the issuer; they diverge below.
export function renderBadgeEntry(frontmatter: Record<string, unknown>, slug: string): string {
  const type = String(frontmatter.type || "");
  const legacy = !frontmatter.awardKey && !frontmatter.criteriaText;
  const issuerName = String(frontmatter.issuer || "Tjakoen Stolk");
  const year = (String(frontmatter.year || frontmatter.issuedOn || "").slice(0, 4)) || String(new Date().getFullYear());
  const art = renderBadgeArt(frontmatter.course, frontmatter.term, frontmatter.subtitle, year, issuerName);
  const issuer = renderIssuer(frontmatter);
  const badgeName = escapeHtml(String(frontmatter.badgeName || frontmatter.title || ""));

  // The badge name now IS the skill, so a subtitle line identical to it would just repeat; show it
  // only when it says something the name does not.
  const subtitle = frontmatter.subtitle && String(frontmatter.subtitle) !== String(frontmatter.badgeName || "")
    ? `<p class="badge-subtitle">${escapeHtml(String(frontmatter.subtitle))}</p>` : "";

  if (type === "cert") {
    const name = escapeHtml(String(frontmatter.recipientName || ""));
    const handle = String(frontmatter.recipientHandle || "");
    // The cert badge bakes the recipient's name into the medallion itself (the criteria/class page's
    // art stays generic, no name); recomputed here so only the cert carries PII in the image.
    const certArt = renderBadgeArt(frontmatter.course, frontmatter.term, frontmatter.subtitle, year, issuerName, frontmatter.recipientName);
    const issuedOn = escapeHtml(String(frontmatter.issuedOn || ""));
    const certId = escapeHtml(String(frontmatter.certId || ""));
    const criteria = escapeHtml(String(frontmatter.criteriaUrl || "/badges"));
    const fullUrl = `${SITE.origin}/badges/${slug}`;
    // The share URL is the short alias when the generator minted one, else the full cert URL.
    const shareUrl = frontmatter.shortUrl ? `${SITE.origin}${String(frontmatter.shortUrl)}` : fullUrl;
    const pngHref = `/media/badges/${escapeHtml(slug)}.png`;
    const share = renderShareBlock(frontmatter.social, shareUrl);
    return `${BADGE_STYLE}<section class="badge-cert" data-surface="badge:certificate">
  <header class="badge-cert__head">${certArt}
    <div class="badge-cert__meta">
      <p class="badge-cert__awarded">This certifies that</p>
      <h1 class="badge-cert__name">${name}</h1>
      <p class="badge-cert__earned">earned the <strong>${badgeName}</strong> badge${handle ? ` · <a href="https://github.com/${escapeHtml(handle)}">@${escapeHtml(handle)}</a>` : ""}</p>
      ${subtitle}
      ${issuer}
    </div>
  </header>
  <p class="badge-actions">
    <a class="badge-btn" href="${pngHref}" download>${legacy ? "Download historical badge (PNG)" : "Download badge (PNG)"}</a>
    <button class="badge-btn" type="button" data-copy-url="${escapeHtml(shareUrl)}" aria-live="polite">Copy share link</button>
    <a class="badge-btn" href="/badges">All badge criteria</a>
  </p>
  <label class="badge-copy-fallback" data-copy-fallback hidden>
    <span>Clipboard access failed. Copy this link manually.</span>
    <input type="text" readonly value="${escapeHtml(shareUrl)}">
  </label>
  <dl class="badge-verify">
    <dt>Issued</dt><dd>${issuedOn}</dd>
    <dt>Credential id</dt><dd>${certId}</dd>
    <dt>Criteria</dt><dd><a href="${criteria}">Criteria page</a></dd>
    <dt>Verification</dt><dd><a href="/badges/${escapeHtml(slug)}.json">${legacy ? "Legacy award metadata" : "Open Badges assertion"}</a></dd>
  </dl>
  ${renderBadgeCriteria(frontmatter)}
  ${renderBadgeActivities(frontmatter)}
  ${renderBadgeShowcase(frontmatter)}
  ${share}
  ${BADGE_COPY_SCRIPT}
</section>`;
  }

  // badge-design: the badge itself, across every class section that awarded it. One design is shared
  // by all sections of a course, so this is the page the hub links to; each section row leads on to
  // that section's criteria page. Like badge-class it shows counts only, never a name.
  if (type === "badge-design") {
    let sections: { section: string; slug: string; count: number; criteria: string }[] = [];
    try { sections = JSON.parse(String(frontmatter.sectionsJson || "[]")); } catch { sections = []; }
    const total = Number(frontmatter.recipientCount) || sections.reduce((n, s) => n + Number(s.count || 0), 0);
    const shared = typeof frontmatter.criteriaText === "string";
    const rows = sections.map((s) => `<li class="badge-design-sections__row"><a href="/badges/${escapeHtml(s.slug)}">Section ${escapeHtml(s.section)}</a><span class="badge-design-sections__count">${Number(s.count)} recipient${Number(s.count) === 1 ? "" : "s"}</span>${shared ? "" : `<p class="badge-design-sections__criteria">${escapeHtml(s.criteria)}</p>`}</li>`).join("");
    return `${BADGE_STYLE}<section class="badge-class badge-design-page" data-surface="badge:design">
  <header class="badge-class__head">${art}
    <div class="badge-class__meta">
      <h1 class="badge-class__name">${badgeName}</h1>
      ${subtitle}
      ${issuer}
      <p class="badge-class__count">Awarded to ${total} recipient${total === 1 ? "" : "s"} across ${sections.length} class section${sections.length === 1 ? "" : "s"}.</p>
    </div>
  </header>
  <p class="badge-actions"><a class="badge-btn" href="/badges">All badges</a></p>
  ${shared ? renderBadgeCriteria(frontmatter) : `<section class="badge-criteria" data-surface="badge:criteria"><h3 class="badge-criteria__heading">Award criteria</h3><p class="badge-criteria__lede">Awarded after instructor review at 75% or better on each required activity. The required activity differed between sections, so each section below states its own.</p></section>`}
  <section class="badge-criteria badge-design-sections" data-surface="badge:sections">
    <h3 class="badge-criteria__heading">Sections</h3>
    <ul class="badge-design-sections__list">${rows}</ul>
  </section>
  ${shared && frontmatter.activitiesJson ? renderBadgeActivities(frontmatter) : ""}
</section>`;
  }

  // badge-class: the CRITERIA page. It is the issuer surface a cert links to for "what this badge
  // attests" — deliberately NOT a roster. Recipient names are PII and live only on each recipient's
  // own direct-link cert page, never aggregated into a listing a crawler could enumerate. The count is
  // the only recipient fact shown here, and it names no one.
  // The design page this section's badge belongs to, when the course and term name one.
  const designHref = frontmatter.course && ["prelim", "midterm", "finals"].includes(String(frontmatter.term))
    ? `/badges/${escapeHtml(String(frontmatter.course))}-${escapeHtml(String(frontmatter.term))}` : "";
  const count = frontmatter.recipientCount !== undefined && Number.isInteger(Number(frontmatter.recipientCount)) ? Number(frontmatter.recipientCount) : Array.isArray(frontmatter.recipients) ? frontmatter.recipients.length : 0;
  return `${BADGE_STYLE}<section class="badge-class" data-surface="badge:class">
  <header class="badge-class__head">${art}
    <div class="badge-class__meta">
      <h1 class="badge-class__name">${badgeName}</h1>
      ${subtitle}
      ${issuer}
      <p class="badge-class__count">Awarded to ${count} recipient${count === 1 ? "" : "s"}.</p>
    </div>
  </header>
  <p class="badge-actions">${designHref ? `<a class="badge-btn" href="${designHref}">See this badge across all sections</a>` : ""}<a class="badge-btn" href="/badges">All badge criteria</a></p>
  ${legacy ? renderBadgeCriteria(frontmatter) : ""}
  ${legacy ? "" : renderBadgeActivities(frontmatter)}
</section>`;
}

// Copy-link behaviour for the cert action button. One handler, delegated, so every cert page's button
// works without per-page script. Mirrors the share-block copy affordance.
const BADGE_COPY_SCRIPT = `<script>
  (function () {
    var btn = document.querySelector('[data-copy-url]');
    if (!btn) return;
    var fallback = document.querySelector('[data-copy-fallback]');
    var fallbackField = fallback && fallback.querySelector('input');
    var label = btn.textContent || 'Copy share link';
    var resetTimer;
    function legacyCopy(value) {
      var field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      var copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
      field.remove();
      return copied;
    }
    function showResult(text, state) {
      btn.textContent = text;
      btn.dataset.copyState = state;
      if (fallback) fallback.hidden = state !== 'failed';
      clearTimeout(resetTimer);
      if (state === 'copied') resetTimer = setTimeout(function () {
        btn.textContent = label;
        delete btn.dataset.copyState;
      }, 1600);
    }
    btn.addEventListener('click', async function () {
      var value = btn.getAttribute('data-copy-url') || '';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try { await navigator.clipboard.writeText(value); }
          catch (_) { if (!legacyCopy(value)) throw new Error('Clipboard write failed'); }
        } else if (!legacyCopy(value)) {
          throw new Error('Clipboard is unavailable');
        }
        showResult('Copied', 'copied');
      } catch (_) {
        showResult('Copy failed', 'failed');
        if (fallbackField) {
          fallbackField.focus();
          fallbackField.select();
        }
      }
    });
  })();
</script>`;

function renderGallery(photos: EventPhoto[]): string {
  if (!photos.length) return "";
  const items = photos.map((p) => {
    const src = escapeHtml(p.src);
    const dims = p.width && p.height ? ` width="${escapeHtml(p.width)}" height="${escapeHtml(p.height)}"` : "";
    const alt = escapeHtml(p.alt);
    return `<figure class="gallery__item">
      <a class="gallery__link" data-lightbox href="${src}"><img src="${src}"${dims} alt="${alt}" loading="lazy" decoding="async"></a>
      <figcaption class="gallery__caption">${alt}</figcaption>
    </figure>`;
  }).join("");
  return `<section class="event-gallery" aria-labelledby="event-gallery-heading">
  <h2 class="event-gallery__heading" id="event-gallery-heading">The rest of the roll</h2>
  <div class="gallery" data-lightbox-group>${items}</div>
</section>`;
}

// The event page's featured video (`video:`), a flat "href | poster | WxH | label | alt" string in
// the same spirit as a photo. The site embeds nothing: an embed would mean a third-party iframe and
// its scripts on a page that has never carried one, and the video lives on someone else's platform
// anyway. So this is a poster still with a play badge over it, and the whole tile is one link out.
// The component is GRAIN's `media-card`, in its `data-layout="overlay"` shape: this file composes
// it from the frontmatter string rather than owning the markup.
function renderVideoCard(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const [href = "", poster = "", dim = "", label = "", alt = ""] = raw.split("|").map((x) => x.trim());
  if (!href || !poster) return "";
  const [width = "", height = ""] = dim.split(/x/i).map((x) => x.trim());
  const dims = width && height ? ` width="${escapeHtml(width)}" height="${escapeHtml(height)}"` : "";
  // The video lives on someone else's platform, so the click leaves the site: new tab, same policy
  // the prose links follow (MILL's externalLinkAttrs). Hand-rendered, so the attributes are written
  // here rather than inherited.
  return `<section class="event-video" aria-labelledby="event-video-heading">
  <h2 class="event-video__heading" id="event-video-heading">On video</h2>
  <a class="media-card" data-layout="overlay" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">
  <span class="media-card__media">
    <img class="media-card__image" src="${escapeHtml(poster)}"${dims} alt="${escapeHtml(alt)}" loading="lazy" decoding="async">
    <span class="media-card__play" aria-hidden="true">▶</span>
  </span>
  <span class="media-card__body">
    <span class="media-card__title">${escapeHtml(label)}</span>
  </span>
</a>
</section>`;
}

// The deck an event or a note hangs off itself (`deck:`), rendered as GRAIN's `attachment` row just
// under the hero and above the prose — near the top, because for a talk the deck is often what a
// reader came for, and buried in the last paragraph is where it used to be.
// Flat frontmatter, one string, the same encoding idiom as a photo:
//   "Title | KIND | href | meta line"
// `href` is an IN-SITE route by design: a PDF points at /decks/<file>, which renders the document
// inside the shell (renderDeckPage) instead of handing the tab to the browser's viewer. A talk that
// already lives here points straight at its own route.
// ---- the contents block for a long note --------------------------------------
// A note with a dozen sections is a document, not a page, and a reader arriving on a link has no
// way to see its shape without scrolling the whole thing first. So an entry past the threshold gets
// two things above the opening line: its frontmatter `summary` rendered ON the page (it exists on
// every note and until now was only ever seen on the /notes index card, which is a waste of the
// best-written paragraph most notes have) and a collapsed list of its own sections.
//
// EVERY note gets one. This shipped on 2026-08-21 behind an eight-section threshold, on the
// argument that a short note's contents would list most of what was already on screen. The owner
// overrode that the same day and the override is right for a reason the threshold missed: the
// summary is the valuable half and it has nothing to do with length. It exists on all twelve notes,
// it is usually the best-written paragraph in the file, and until this block it was visible only on
// the /notes index card. Withholding it from the short notes was withholding the good part.
//
// What survives of the threshold is a floor of two sections, because a contents list of one item is
// not a list. The two decisions are independent now: a note with a summary gets the summary, and a
// note with something to jump between gets the jump links.
//
// Collapsed on purpose. build-the-floor opens on a confession, and thirteen links between the
// subtitle and that first line would kill the entrance. The summary is what a reader needs in order
// to decide whether to commit; the section list is what they need only once they have.
//
// The progress rule is a SIBLING of the aside rather than a child of it, because sticky is bounded
// by its parent's box: nested inside the short aside it would unstick a screen later and read as
// broken. Both are injected after `</header>`, so both are children of the full-height board.
//
// The rule also carries the current section's name, and that is not decoration. Marking the current
// item inside the contents list was the obvious design and it is unobservable here: reading the
// list means scrolling back to the top, which makes the first section current again. The sticky
// rule is the only part of this still on screen once somebody is actually reading, so it is the
// only place a "you are here" can be seen.
const CONTENTS_MIN_SECTIONS = 2;

const stripTags = (html: string) => html.replace(/<[^>]*>/g, "");

function renderNoteContents(body: string, frontmatter: Record<string, unknown> | undefined): string {
  const heads = [...body.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)]
    .map((m) => ({ id: m[1] ?? "", label: stripTags(m[2] ?? "").trim() }))
    .filter((h) => h.id && h.label);

  const summary = typeof frontmatter?.summary === "string" ? frontmatter.summary.trim() : "";
  const reading = typeof frontmatter?.readingTime === "string" ? frontmatter.readingTime.trim() : "";
  // Nothing to say and nowhere to go: emit no block at all rather than an empty frame.
  if (!summary && heads.length < CONTENTS_MIN_SECTIONS) return "";

  const meta = [`${heads.length} sections`, reading].filter(Boolean).join(" \u00b7 ");
  const lede = summary ? `<p class="note-contents__summary">${escapeHtml(summary)}</p>` : "";
  const items = heads
    .map((h) => `<li><a href="#${escapeHtml(h.id)}">${escapeHtml(h.label)}</a></li>`)
    .join("");

  return `<div class="note-progress" data-note-progress><span class="note-progress__fill" aria-hidden="true"></span><span class="note-progress__where" data-note-where hidden></span></div>
<aside class="note-contents" data-note-contents aria-label="Summary and contents">
  ${lede}
  ${heads.length < CONTENTS_MIN_SECTIONS ? "" : `<details class="note-contents__more">
    <summary class="note-contents__toggle">Contents <span class="note-contents__meta">${escapeHtml(meta)}</span></summary>
    <ol class="note-contents__list">${items}</ol>
  </details>`}
</aside>`;
}

function renderDeckAttachment(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const [title = "", kind = "", href = "", meta = ""] = raw.split("|").map((x) => x.trim());
  if (!title || !href) return "";
  const metaLine = meta ? `<span class="attachment__meta">${escapeHtml(meta)}</span>` : "";
  return `<a class="attachment event-deck" href="${escapeHtml(href)}">
  <span class="attachment__kind">${escapeHtml(kind || "Deck")}</span>
  <span class="attachment__body">
    <span class="attachment__title">${escapeHtml(title)}</span>
    ${metaLine}
  </span>
  <span class="attachment__action">Open →</span>
</a>`;
}

// Events cross-link like notes (note:slug → /notes/slug); everything else (absolute site links)
// passes through untouched.
function eventsLink(href: string): string {
  return href.startsWith("note:") ? "/notes/" + href.slice(5) : href;
}

function badgesLink(href: string): string {
  const local = href.match(/^(?:\.\/)?([A-Za-z0-9._-]+)\.md$/);
  if (local) return `/badges/${mdSlug(local[1])}`;
  return href;
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
let eventCalendarEventsP: Promise<CalendarEvent[]> | null = null;
export function listEventCalendarEvents(): Promise<CalendarEvent[]> {
  return (eventCalendarEventsP ??= computeEventCalendarEvents());
}
async function computeEventCalendarEvents(): Promise<CalendarEvent[]> {
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

/** Newest-first notes ({slug,title,route,tags}) for the desk's "open the latest note" action AND
 *  (B2, 2026-07-24) notes filtering — served frozen as /notes.json (a §18 data route) so the browser
 *  model can pick the newest with a real title, never the sitemap's slug-cased fallback, and match a
 *  visitor's topic against the REAL tag set instead of guessing one (notes-tags.ts, law #2). */
export async function listPortfolioNotes(): Promise<Array<{ slug: string; title: string; route: string; tags: string[] }>> {
  return (await sortedNoteEntries()).map((e) => ({ slug: e.slug, title: e.title, route: `/notes/${e.slug}`, tags: e.tags }));
}

// ---- people and sources at the end of a note -------------------------------------------------
// /people and /reading are hand-written pages, and they stay the one home of each name and title.
// A note lists slugs in its frontmatter; the name, the role and the title are read off those pages,
// so a person renamed on /people is renamed under every note at once. content.test.ts fails a note
// that lists a slug neither page carries.
const PAGES_DIR = join(import.meta.dir, "..", "view", "pages");

export type CreditEntry = { id: string; label: string; detail: string };

export function peopleEntries(): Map<string, CreditEntry> {
  const out = new Map<string, CreditEntry>();
  const html = readFileSync(join(PAGES_DIR, "people.html"), "utf8");
  const re = /<li class="post" id="([a-z0-9-]+)">[\s\S]*?class="post__name"[^>]*>([^<]+)<\/a><span class="post__handle">([^<]*)<\/span>/g;
  for (const m of html.matchAll(re)) out.set(m[1], { id: m[1], label: m[2], detail: m[3] });
  return out;
}

export function readingEntries(): Map<string, CreditEntry> {
  const out = new Map<string, CreditEntry>();
  const html = readFileSync(join(PAGES_DIR, "reading.html"), "utf8");
  const re = /<article class="book-card" id="([a-z0-9-]+)"[^>]*>\s*<p class="book-card__meta">([\s\S]*?)<\/p>\s*<h3 class="book-card__title">([^<]+)<\/h3>/g;
  for (const m of html.matchAll(re)) out.set(m[1], { id: m[1], label: m[3], detail: m[2].replace(/<[^>]+>/g, "") });
  return out;
}

function slugList(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === "string" && v.trim() !== "").map((v) => v.trim()) : [];
}

/** The "Where to next" block that closes a note: the next older published note (the oldest wraps
 *  to the newest, so no note is a dead end), the full list, and contact. Same markup as the block
 *  on the static pages in view/pages, so one stylesheet and one test cover both. Read
 *  synchronously because shellChrome is synchronous, and cached because the corpus does not change
 *  under a running server (dev --hot reloads this module, which resets it). */
const NOTES_DIR = join(import.meta.dir, "..", "content", "notes");
let datedNotesCache: { slug: string; title: string; date: string }[] | null = null;
function datedNotes(): { slug: string; title: string; date: string }[] {
  if (datedNotesCache) return datedNotesCache;
  const out: { slug: string; title: string; date: string }[] = [];
  for (const file of readdirSync(NOTES_DIR)) {
    if (!file.endsWith(".md")) continue;
    const { data } = parseFrontmatter(readFileSync(join(NOTES_DIR, file), "utf8"));
    if (!isPublishedStatus(data.status) || typeof data.date !== "string" || !data.date) continue;
    const slug = file.slice(0, -3);
    out.push({ slug, title: typeof data.title === "string" ? data.title : slug, date: data.date });
  }
  out.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  return (datedNotesCache = out);
}
export function renderNoteNext(slug: string): string {
  const notes = datedNotes();
  const at = notes.findIndex((n) => n.slug === slug);
  const next = notes.length > 1 ? notes[(at + 1) % notes.length] : undefined;
  const card = (href: string, title: string, body: string) =>
    `<a class="card" data-pad="sm" href="${escapeHtml(href)}"><h3 class="card__title">${escapeHtml(title)} →</h3><p class="card__body">${escapeHtml(body)}</p></a>`;
  const nextCard = next && next.slug !== slug
    ? card(`/notes/${next.slug}`, next.title, at >= 0 && at === notes.length - 1 ? "The newest note, since this was the oldest one." : "The note I wrote before this one.")
    : "";
  return `<nav class="where-next" aria-label="Where to next"><hr class="rule" style="margin:3rem 0 1.5rem"><h2 class="section-head"><span>Where to next</span></h2><div class="card-grid">${nextCard}${card("/notes", "All notes", "Every note on the desk, newest first, with a tag filter.")}${card("/about#contact", "Contact", "A question, a correction, or a talk. I read everything.")}</div></nav>`;
}

// ---- edited date, changelog and the share dialog -------------------------------------------
// `date` stays the day a note was first published, so the feed order and a reader's memory of when
// they read it both hold. A note that later changes in substance says so with two more keys:
//
//   updated: 2026-11-12
//   changelog:
//     - "2026-11-12 | What changed, in a sentence a returning reader can act on."
//
// Both are for major changes only: a claim revised, a section added or cut, a number corrected. A
// typo or a grammar fix gets neither, because a changelog that logs commas stops being read.
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
export function parseChangelog(raw: unknown): { date: string; text: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { date: string; text: string }[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const cut = item.indexOf("|");
    if (cut < 0) continue;
    const date = item.slice(0, cut).trim();
    const text = item.slice(cut + 1).trim();
    if (ISO_DAY.test(date) && text) out.push({ date, text });
  }
  return out.toSorted((a, b) => b.date.localeCompare(a.date));
}
export function renderNoteEdited(frontmatter: Record<string, unknown>): string {
  const updated = typeof frontmatter.updated === "string" ? frontmatter.updated.trim() : "";
  if (!ISO_DAY.test(updated) || updated === frontmatter.date) return "";
  const link = parseChangelog(frontmatter.changelog).length ? ` <a href="#changelog">What changed</a>` : "";
  return `<p class="note-edited">Edited <time datetime="${updated}">${updated}</time>.${link}</p>`;
}
export function renderNoteChangelog(frontmatter: Record<string, unknown>): string {
  const entries = parseChangelog(frontmatter.changelog);
  if (!entries.length) return "";
  const items = entries.map((e) => `<li><time datetime="${e.date}">${e.date}</time><span>${escapeHtml(e.text)}</span></li>`).join("");
  return `<section class="note-changelog" id="changelog" aria-labelledby="changelog-head"><h2 class="note-changelog__head" id="changelog-head">Changelog</h2><ul class="note-changelog__list">${items}</ul></section>`;
}
/** The Share dialog: the note's address and a copy button, in the same card markup as the clear
 *  dialog in site.js. Opened by the Share tab, which stays hidden until this script runs, so a
 *  reader without JavaScript never sees a button that does nothing. */
function renderShareDialog(title: string, href: string): string {
  // Held in a <template> and only made a live dialog on click, the way site.js builds its clear
  // dialog: a .crumb-pop sitting in every note page would be a second match for CRUMB's own card.
  return `<template data-note-share-template><dialog class="crumb-pop clear-dialog note-share" data-share data-note-share-dialog aria-labelledby="note-share-title">
  <form method="dialog" class="clear-dialog__form">
  <div class="crumb-pop__head"><span id="note-share-title" class="crumb-pop__title">Share this note</span>
  <button class="crumb-pop__x" value="" aria-label="Close">&times;</button></div>
  <div class="crumb-pop__body"><p class="crumb-pop__say">${escapeHtml(title)}</p>
  <p class="note-share__link" data-share-text>${escapeHtml(href)}</p></div>
  <div class="crumb-pop__foot"><button class="btn" type="button" data-share-copy aria-live="polite" autofocus>Copy link</button>
  <button class="btn" data-variant="soft" value="">Done</button></div></form></dialog></template>
<script>(function(){var b=document.querySelector('[data-note-share]'),t=document.querySelector('[data-note-share-template]');if(!b||!t||typeof HTMLDialogElement!=='function')return;b.hidden=false;b.addEventListener('click',function(){var d=t.content.firstElementChild.cloneNode(true);document.body.appendChild(d);d.addEventListener('close',function(){d.remove();});window.dispatchEvent(new CustomEvent('note-share:open',{detail:d}));d.showModal();});})();</script>`;
}

function renderNoteCredits(frontmatter: Record<string, unknown>): string {
  const people = slugList(frontmatter.people);
  const sources = slugList(frontmatter.sources);
  if (!people.length && !sources.length) return "";
  const list = (ids: string[], entries: Map<string, CreditEntry>, base: string) => ids
    .map((id) => entries.get(id))
    .filter((e): e is CreditEntry => Boolean(e))
    .map((e) => `<li><a href="${base}#${escapeHtml(e.id)}">${escapeHtml(e.label)}</a>${e.detail ? `<span class="note-credits__detail">${escapeHtml(e.detail)}</span>` : ""}</li>`)
    .join("");
  const peopleHtml = people.length ? `<h2 class="note-credits__head">People in this note</h2><ul class="note-credits__list">${list(people, peopleEntries(), "/people")}</ul>` : "";
  const sourcesHtml = sources.length ? `<h2 class="note-credits__head">Sources</h2><ul class="note-credits__list">${list(sources, readingEntries(), "/reading")}</ul>` : "";
  return `<aside class="note-credits" aria-label="People and sources in this note">${peopleHtml}${sourcesHtml}<p class="note-credits__more">Everyone the notes name is on <a href="/people">People</a>, and the works are on <a href="/reading">Reading</a>.</p></aside>`;
}
