---
title: "How to: add a collection"
---

The full reasoning is [`ARCHITECTURE.md`](ARCHITECTURE.md); this is the short, task-oriented
version, using the portfolio's own `content.ts` (the real consumer wiring) as the worked example.

## The `MillCollection` shape

```ts
export interface MillCollection {
  prefix: string;              // route prefix, no trailing slash: "/notes"
  title: string;                // index page heading
  description?: string;         // index lede + fallback meta description
  source: ContentSource;        // where the .md files come from
  adapter?: GrainAdapterOptions; // block/layout/link overrides for this collection only
  indexVariant?: string;         // a content-index display variant, e.g. "log"
  itemSurfacePrefix?: string;    // opt in: index items get data-surface="<prefix>:<slug>"
  chrome?: PageChrome;           // per-collection chrome (falls back to the deps-level one)
  index?: boolean;               // serve the index listing at `prefix` (default true)
}
```

## Add one

Pick a source (usually `dirSource` over a folder your repo owns) and push a collection onto the
array `createMillRoutes` receives. The portfolio's own docs collections are the plainest example:

```ts
{
  prefix: "/grain/docs",
  title: "GRAIN docs",
  description: "The GRAIN design system's own docs, rendered through MILL.",
  source: dirSource(join(import.meta.dir, "..", "docs/grain")),
  adapter: { resolveLink: docsLink("/grain/docs") },
},
```

Registering is nothing more than that push. There is no separate registry: `createMillRoutes({
collections })` (or, in the portfolio, `createPortfolioContentRoutes`, a thin wrapper around it)
reads the same array the sitemap/export route lists (`listMillRoutes`) and the AI grounding corpus
(`listKnowledgeSources`) read, so one collection definition reaches all three.

## What routes appear

For a collection at `prefix`:

- **`prefix`**: the index, built from every entry's frontmatter (no body render), sorted
  newest-first by `date` (undated last, then by slug). Skipped when `index: false`, set this when
  the host wants to own the listing itself (the portfolio's `/notes` index is a hand-built feed with
  sort/filter controls; MILL still renders each individual entry, only the listing opts out).
- **`prefix/:slug`**: one entry, the file's body rendered through the adapter and wrapped in the
  chrome. `slug` is the filename minus `.md`, lowercased.
- **`prefix/:slug.md`**: the raw source, `text/plain`, no chrome. The honest-source twin every
  entry gets for free.

## Link resolution, worked

A collection whose docs cross-link each other as relative `.md` paths needs its own `resolveLink`.
The portfolio's `docsLink(currentPrefix)` handles both a same-collection sibling link
(`./OTHER.md` → `${currentPrefix}/other`) and a cross-layer one
(`../../grain/docs/GRAIN.md` → `/grain/docs/grain`):

```ts
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
```

A collection with its own internal slug scheme (`note:slug`, the notes collection's own convention)
supplies a simpler resolver instead, see `notesLink` in the same file. The adapter's default
(`note:slug` → `/notes/slug`) is only a fallback; any collection that doesn't need it can ignore it
entirely by supplying its own `resolveLink`.

## A dropped alias

If a folder mixes real content with a symlinked alias (the portfolio's `standards/AGENTS.md` →
`CLAUDE.md`, kept for tooling that looks for `AGENTS.md` on disk), wrap `dirSource` so the alias
doesn't render as a duplicate page under a second slug: `realFilesSource` in `content.ts` filters
symlinked `.md` files out of both `list()` and `read()` before handing the result to MILL.

## Verify it landed

```sh
bun run dev
# then visit the new prefix, the index (unless index:false) and at least one entry
bun run check && bun test
```

If the collection should be discoverable, confirm it shows up wherever
`listPortfolioContentRoutes` (or your own `listMillRoutes` call) feeds the sitemap and the static
export's crawl allowlist, nothing else to wire, the same array does it.
