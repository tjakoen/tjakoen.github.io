---
title: "MILL: architecture"
---

MILL turns a folder of Markdown into rendered GRAIN pages. It does not invent its own renderer, it
walks a Markdown AST and calls an adapter that emits component tags, then hands the result to the
host's own composer. Two mappings, one seam, one escape hatch: that's the whole engine.

## Where it sits

```
batch → grain → MILL → (consumed by a project)
```

MILL depends on **GRAIN** (components) and **BATCH** (substrate), never the reverse, so it's an
extension of neither, a new layer over both. The core (`core/`) imports nothing from grain or
batch at all: the coupling to the default adapter is a name/CSS-class contract (strings), the
cleanest seam available. MILL **renders live** at request time; a static export just freezes
whatever the server returned, never a second render pass.

## The two mappings

1. **Document → layout, from frontmatter.** A `type` field in the frontmatter selects a **layout**
   (a function of `{type, title, frontmatter, body, ctx}` → HTML). The default adapter ships one
   sensible layout (an editorial masthead: eyebrow, heading, lede, tag badges); a consumer supplies
   its own `type → layout` registry via `GrainAdapterOptions.layouts`, with `defaultLayout` as the
   fallback for any `type` not in the registry. Frontmatter itself is a small hand-rolled YAML-ish
   subset (`core/frontmatter.ts`): scalars, `[inline, lists]`, dash lists, and folded/literal block
   scalars (`key: >` / `key: |`, the shape a note's `summary:` uses).

2. **Block → component, a node → tag map.** Every Markdown construct MILL understands (heading,
   paragraph, list, code, blockquote, image, thematic break, table, plus a raw `html` passthrough
   node) has exactly one handler in the adapter's `BlockHandlers` map, and every inline construct
   (text, strong, em, code span, link, image) has one in `InlineHandlers`. Both maps are **total**:
   `{ [T in Node["type"]]: Handler<T> }`, so adding a node type is a compile error in every adapter
   until it's handled, the drift protection that keeps a second adapter honest. Handlers receive a
   `RenderContext` (`renderInline`, `renderBlocks`, `escape`, `resolveLink`) to recurse without
   knowing the core's internals.

## The render-adapter port

The core never hardcodes GRAIN. It calls a `RenderAdapter`:

```ts
export interface RenderAdapter {
  block: BlockHandlers;
  inline: InlineHandlers;
  layout: LayoutFn;
  escape?: (text: string) => string;
  resolveLink?: (href: string) => string;
}
```

`@tjakoen/mill/adapters/grain/grain-adapter.ts` ships the reference implementation,
`createGrainAdapter(options?: GrainAdapterOptions)`. It emits **final semantic HTML carrying GRAIN
CSS classes** (`.list`, `.badge`, `.code-block`, `.figure`, `.callout`), not data-bound `<b-…>`
tags. That's deliberate: BATCH's `createRenderer` *replaces* a registered component tag's children
with its own template, so `<b-text>literal prose</b-text>` would discard the prose it was supposed
to hold. Bare `<p>`/`<h*>`/`<a>`/`<li>` are already styled by grain's own stylesheets, so the
adapter can just emit them. `renderGrainDocument(raw, options?)` is the convenience entry, rendering
with the GRAIN adapter and enforcing the grade guardrail in one call; prefer it over calling
`renderDocument` directly.

`GrainAdapterOptions` is the seam a consumer tunes:

```ts
export interface GrainAdapterOptions {
  layouts?: Record<string, LayoutFn>;
  defaultLayout?: LayoutFn;
  resolveLink?: (href: string) => string;         // default: note:slug → /notes/slug
  blockOverrides?: Partial<BlockHandlers>;
  inlineOverrides?: Partial<InlineHandlers>;
}
```

## The content-source port

Where the `.md` files come from is its own small port, so a collection's source is never a hardcoded
path baked into the engine:

```ts
export interface ContentSource {
  list(): Promise<string[]>;                 // available slugs
  read(slug: string): Promise<string | null>; // raw Markdown, or null
}
```

Two implementations ship:

- **`dirSource(dir)`**: a folder of `.md` files. Slug = filename minus `.md`, lowercased
  (`GRAIN.md` → `grain`); a case-colliding pair is last-one-wins. This is what a consumer's own
  content (notes, docs authored in-repo) uses.
- **`packageDocsSource(anchor)`**: resolves a docs folder out of an *installed package* via
  `import.meta.resolve` on an anchor file (e.g. `"@tjakoen/grain/docs/GRAIN.md"`). Bun verifies the
  anchor exists, so a missing or renamed package fails loudly at wiring time instead of serving an
  empty page. This exists so layer docs can travel inside the dependency itself rather than being
  copied or reached via a `../sibling` relative path.

## Chrome: the page shell is the host's

MILL renders a body; it does not decide what wraps it. A collection (or the whole `MillServeDeps`)
supplies a `PageChrome`:

```ts
export type PageChrome = (input: PageInput) => string;
// PageInput: { kind: "index" | "entry", title, description, body, collection, frontmatter?, slug? }
```

falling back to a minimal built-in default (a bare `<html>` with the grain stylesheets linked) when
none is given. The portfolio's own chrome wraps every MILL page in its BREAD workspace shell
(`<portfolio-frame />`) so a rendered note or doc page *is* a portfolio page, not a fork of one.

## The escape hatch

A raw block starting with a tag (`<b-…>`) passes through the `html` node untouched, uncomposed, all
the way to the final string. `createMillRoutes`'s injected `compose` (BATCH's `renderPage`) is what
actually expands it, at request time, alongside the chrome's own component tags, the same
composition path `.html` pages use. Markdown for prose, real components for power, with no MDX
build step in between.

## Link adapters

Internal links (`note:slug`, sibling `.md` files, cross-collection `.md` references) are resolved
per collection via `GrainAdapterOptions.resolveLink`. The default resolves only `note:`, anything
else passes through untouched, so a consumer with cross-linking docs supplies its own resolver
(the portfolio's `docsLink`/`notesLink` in `content.ts` are the worked examples; see
[`ADD-A-COLLECTION.md`](ADD-A-COLLECTION.md)).

## Raw `.md` twins

Every rendered entry also answers at `${prefix}/${slug}.md` with the literal source bytes, no
chrome, `text/plain`. "The site is its own source tree" made clickable: a reader can always see the
exact Markdown that produced the page they're looking at. This is a data route, not a page, so a
caller feeds it to an export's `dataRoutes`, never `pages` (which would wrap the raw text as HTML).

## Route enumeration

`listMillRoutes(collections)` returns every route a set of collections will actually serve (each
index, unless `index: false`, plus one `${prefix}/${slug}` per entry), the single source a
consumer feeds its sitemap and its static-export allowlist from, so a new file reaches both without
a second list to keep in sync. `listMillRawRoutes(collections)` does the same for the `.md` twins.

## Grade guardrail

MILL's output is human-authored content, so it must read as clean, never as AI-generated.
`renderGrainDocument` stamps `data-grade="smooth"` on the article root as a positive assertion and
runs `assertHumanGrade` on the resulting HTML before returning it, a positive check, not just the
absence of a grain marker. Only the AI's own actions grain; content rendered through MILL never
does, even when an AI drafted the words.

## What isn't built yet

Per [`mill/PLAN.md`](https://github.com/tjakoen/grain/blob/main/packages/mill/PLAN.md), the
AI-facing outputs (schema.org JSON-LD, `llms.txt`, `knowledge.json` RAG chunks, and
`data-surface` addresses stamped on rendered content) are a planned piece ("4b"), not part of
`serve.ts` itself today. The portfolio currently builds its own `knowledge.json` and JSON-LD
separately, on top of MILL's collections, rather than MILL emitting them. Mermaid-to-SVG diagram
conversion is also planned and explicitly deferred; a mermaid code fence renders today as an
escaped `<pre>` block, plain text, not a diagram.
