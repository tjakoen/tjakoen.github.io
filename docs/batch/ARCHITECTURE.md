---
title: "BATCH — Reference Architecture (Single Source of Truth)"
---

**BATCH** = **B**un · **A**ddressable · **T**ypeScript · **C**SS · **H**tmx — a no-build,
server-rendered hypermedia stack. Reusable design-system component tags use the
`b-` prefix (`<b-button>`); your app's own components keep semantic names
(`item-card`, `app-header`).

**Status:** Living document · **Runtime:** Bun 1.3.14. Backend certified 2026-06-26
(§14.1); the frontend layer — pages, sitemap, the `b-` component
set, self-closing/prop-text — added and audited 2026-06-27 (§14.4). (The component
catalog since moved UP to GRAIN — its Human/AI grade toggle is grain's vocabulary — so
it's no longer BATCH's; see `grain/catalog`.) The **AI
interaction layer** (server-push over SSE, the one `/intent` door, render ops,
grade-as-signal) and the **Sourdough** design-system retheme were added and
audited 2026-06-30 (§17, §14.5), then the repo was **reorganized into a monorepo** the
same day (§3). The code in `batch/ grain/ project/` is the source of truth.

> **The concerns in this repo (monorepo).** `batch/` is the **stack** this document
> describes (the reusable no-build hypermedia substrate). `grain/` is **GRAIN**, the
> AI-interaction design system built on BATCH (`docs/GRAIN.md`). `project/` is the
> product (a personal AI assistant) + its skin; `tjakoen.github.io/server.ts` is the one place
> those three meet. No Bun workspaces — plain relative imports, one `package.json` +
> `tsconfig`. Each is headed for its own repo once proven; the boundary is kept clean
> (`batch/` imports nothing from `grain/`/`project/`, verified). Two further resident
> concerns build on the stack: **`tjakoen.github.io/`** (a personal site — temporary resident,
> moving to its own repo) and, planned, **`MILL/`** — a reusable markdown→GRAIN CMS that
> sits **above `grain`** (depends on `grain` + `batch`, never the reverse; an *extension
> of neither*). MILL's core is framework-agnostic (a Markdown→components engine driven by a
> render adapter); its default adapter emits GRAIN + serves on BATCH. The portfolio *uses*
> MILL to manage its markdown content — its notes/blog **and** the rendered BATCH/GRAIN docs —
> but is otherwise a custom BATCH + GRAIN app. See `mill/PLAN.md` (canonical) + `tjakoen.github.io/docs/architecture/PLAN.md`
> (consumer view). Product docs are under `project/docs/`; the doc map is `DOCS.md` at the repo root.

Every code block here has been run on Bun 1.3.14. For the final revision the
entire backend was assembled exactly as specified and **certified**: `tsc`
typechecks green under `erasableSyntaxOnly` + `verbatimModuleSyntax` (TS 6.0), the
full test suite passes, and the server serves `/ui` (HTML) and `/api` (JSON)
correctly. See §14.1 for the audit log.

---

## What BATCH gives you (capabilities)

The capabilities, **tiered** — headliners first, then the useful-but-quieter ones. Nothing here is
buried. **This list is the single source** (the README and the `/batch` landing page teaser it); add
or drop a capability → update this list (`../../CLAUDE.md` alignment table → `AUDIT.md` check 11).

**Hero — the reasons BATCH exists:**

- **No build step.** Bun runs the TypeScript directly and the composition engine renders components
  server-side — no bundler, no transpile step, no client framework, no template dialect between
  source and server. It can even **serve `.ts` to the browser transpiled on request** (§19,
  client-safe modules), so even client code has no build. Near-zero framework JS ships.
- **Static export = a projection of the running server.** `bun run export` (§18) crawls the live
  server and freezes it to static files — never a second renderer, so the export can't drift from the
  app. It also **freezes a client-module graph** (`moduleEntries` — each entry's relative import
  graph, transpiled at export). Content pages export; operable `/intent`+SSE surfaces are inert by
  design *unless* a page opts into the client-side door (§19.3), which runs the same vocabulary
  fully in-browser on the static copy.

**Also — useful features, deliberately listed:**

- **The composition engine** — a small binding vocabulary (`data-field`/`each`/`slot-tag`/props) that
  turns component tags into HTML, zero third-party runtime deps (§2, §9).
- **A generic SSE push hub** (`http/stream.ts`) — opaque-payload server push; satisfies GRAIN's
  `OpChannel` port structurally without BATCH knowing anything about `RenderOp`s (§17).
- **The component catalog** now lives in GRAIN (`grain/catalog`), not BATCH — its Human/AI grade
  toggle is grain's grade-as-signal vocabulary. It reads the filesystem directly and imports nothing
  from batch; the composition root passes it the page-nav routes. (§13a is retained for the
  Storybook-style generation technique it still uses; ownership is grain's.)
- **Sitemap + SEO/AEO from one source** — one page list feeds `/catalog`, `/sitemap.xml`, `/robots.txt`,
  and an `/llms.txt` AI-facing index (the AEO counterpart to the sitemap; §11.4).
- **A framework-generic audit engine** — perf + SEO/AEO baselines via Playwright, vocabulary-agnostic
  so it can bench any app/framework, not just this one (`batch/audit`).

---

## 0. Principles

- **One file, three roles.** A component's `.html` is the designer's mockup, the
  production template, and the documentation of its own bindings.
- **No build step. No client framework. No template dialect.**
- **Standards first, native second, library last.** Prefer web standards; then
  runtime-native APIs; add a controlled library only when neither suffices.
- **Dependency inversion at every seam.** Services depend on interfaces; the
  database, the runtime, and the data source are all injected adapters.
- **Clean code, SOC, DRY.** Each module has one reason to change. Mapping logic
  lives in one place. Layers point inward (transport → application → domain).

---

## 0.5 Rationale & trade-offs (the whys, honestly)

This records *why* the choices were made and what they cost — so future decisions
are made with eyes open, not by inertia.

> The *values* behind these choices — the beliefs, stated crisply — live in
> [`PHILOSOPHY.md`](../../PHILOSOPHY.md). This section is the engineering rationale and the costs.

**Why a hypermedia / server-rendered-fragment stack.** Avoids a client framework,
a build step, and client/server state-sync bugs; yields a standards-based stack
that should age slowly. *Cost:* rich client interactions (drag-and-drop,
optimistic UI, offline) are genuinely harder with htmx than with a client
framework. When a feature wants those, expect to fight the grain or add a small
island of JS. Accepted because the target (a personal dashboard / second-brain
surfaces) is mostly request→render→swap.

**Why a custom composition engine instead of a templating library — and is it a
maintenance trap?** Measured, not assumed: the entire engine is **~180 non-blank
lines** with **zero runtime dependencies** (only Node-builtin `fs`/`path` plus
native globals: `HTMLRewriter`, `Response`, `Bun.file`). Crucially, the one part
that is genuinely dangerous to own — **HTML escaping** — is *delegated to the
native parser* (`setInnerContent`), not hand-rolled; verified that a
`<img onerror>` payload in data renders inert. So the "native-first to minimize
maintenance" thesis **holds**: you are not maintaining a real templating engine,
you are maintaining ~180 lines whose scariest job is done by the platform.
*Caveat the platform does NOT cover:* HTML escaping neutralizes markup but **not
URL schemes** — a data-driven `javascript:`/`data:` value in an `href`/`src`
survives escaping. So URL-valued bound attributes go through an explicit
scheme allowlist (`safeAttr`, §9), the one XSS class the native parser won't
catch for you.
*The honest residual burden:*
- The **regex-based polymorphic-tag swap / prop substitution** in `applyProps`
  (~12 lines) is the only hand-rolled string manipulation of HTML. It operates
  **only on author-controlled templates, never on user data** (verified data
  cannot inject through it), and prop values are quote-escaped — so the risk is
  *authoring mistakes*, not injection. Still, it's the one spot to keep simple.
- **Single-vendor coupling to Bun's `HTMLRewriter`.** Mitigated: it's the
  Cloudflare Workers API (multiple implementations exist) and isolated to one
  file. If Bun changes it, you adapt one module.

**Why this much structure (domain/data/services/view/routes, ports everywhere)
for a solo project.** This is enterprise-grade layering, and that is a real
tension with "build for yourself / don't over-engineer." The trade is taken
deliberately: the stated goal is longevity and clean swapping (storage, runtime),
and the ports have already been *exercised* (in-memory → SQL → REST behind one
interface). *Cost:* more indirection than a quick solo build needs. **Mitigation
rule:** if the structure ever feels heavy while moving fast, collapse a port
(inline the adapter, keep the interface) — the ports are the first thing to give.

**Why a single polymorphic `b-text` / `b-button` instead of many named
atoms.** A preference, not a law: it trades discoverability (lots of named atoms)
for DRY (one configurable atom). Stated as a choice, not the only correct answer.

**Known assumptions not yet stress-tested.** The engine is verified at small
scale; recursion depth, very large lists, and concurrent renders are unproven at
the scale "scale to any size" implies. Progressive enhancement is partial: with
JS disabled, `/ui` endpoints return fragments, not full pages. Neither blocks the
plan; both are named so they aren't discovered as surprises.

**Why pages aren't openable as bare `file://` files — and why that's fine.**
This came up and was decided deliberately. You can have any *two* of: (1) author
pages with custom component tags (`<b-button>`), (2) open them as bare files with
no server, (3) no build step. Never all three — it's a web-platform limit, not a
design weakness. Rendering a custom tag needs its template *at render time*, and
there are only three places that can live: **the server expands it** (needs a
server, so not a bare file), **the client fetches the `.html`** (blocked on
`file://` — browsers forbid file-origin fetch), or **the client has it inlined in
JS** (something inlined it → a build). No fourth option exists.

The resolution: **the server *is* the no-build step.** Bun runs `.ts` directly,
the engine composes on every request, hot-reload watches files — edit and refresh,
no compile, no toolchain. A build and a server are two ways to do the same job
(source → rendered HTML); we put it in the server. So pages are previewed on
**localhost** (instant, no build), and individual component `.html` files still
open as standalone mockups (default content, CSS applies) for design work. We
keep **no-build + custom tags** and give up only "open the composed page as a
literal file" — which, since htmx data can't load from `file://` anyway, would
never have been a *working* page, only a static mockup. A static export/prerender
remains available later as an opt-in if shareable static files are ever needed; it
does not affect the no-build dev loop.

---


## 1. Runtime & Language decision

### 1.1 The choice

Three things were tangled together — build step, language, runtime. They have
different answers.

**Build step** is solved on both Bun and Node 24+/25+: native TypeScript *type
stripping* runs `.ts` directly, no transpile. So "no build" does not require Bun.

**The deciding factor is native server-side HTML parsing**, which the composition
engine needs every request:

| Runtime | TS, no build | Native HTML parse/rewrite | Native SQLite |
|---|---|---|---|
| **Bun** | yes | **yes — `HTMLRewriter` (lol-html)** | yes (`bun:sqlite`) |
| Node 24+ | yes (type-strip) | **no** — needs a library | yes (recent) |
| Deno | yes | **no** — needs `deno-dom` | yes |

Node and Deno would force an HTML-parsing dependency (cheerio/parse5/linkedom/
deno-dom) — a larger violation of "library last" than using Bun's built-in. So:

> **Decision:** Bun runtime + erasable-only TypeScript + a thin platform port.
> The port isolates every Bun-specific call so the runtime is a swappable seam,
> not a lock-in. `HTMLRewriter` itself is the Cloudflare Workers API (multiple
> implementations exist), the lowest-risk of the Bun APIs.

### 1.2 Erasable-only TypeScript rules

Native type stripping only removes syntax; it never emits runtime code. Stay
inside the erasable subset:

- **No `enum`, no `namespace`, no parameter properties.** Use `as const` objects
  or union types (we use `"active" | "archived"`, already erasable). Constructors
  declare fields explicitly (`private x: T; constructor(x: T) { this.x = x; }`),
  never the `constructor(private x: T)` shorthand — that shorthand is *not*
  erasable and breaks both the CI gate below and Node's strip-only loader.
- **`import type { X }`** for type-only imports (otherwise stripping breaks them).
- **Relative imports include the extension**: `import { x } from "./x.ts"`.
- **`tsconfig.json` is for checking only.** Bun runs the files; `tsc --noEmit`
  in CI is the type-check. Recommended flags: `erasableSyntaxOnly`,
  `verbatimModuleSyntax`, `module: nodenext`, `target: esnext`,
  **`allowImportingTsExtensions`** (required — the `.ts`-extension imports below
  make `tsc` error TS5097 without it; harmless under `noEmit`).

**Required project setup** (both verified necessary):
- **`package.json` must contain `"type": "module"`.** Without it the `.ts` files
  resolve as CommonJS and every ESM `import` / `import.meta` is rejected by `tsc`.
- **TypeScript ≥ 5.8** — `erasableSyntaxOnly` was introduced in 5.8 (earlier
  versions error "Unknown compiler option").

### 1.3 The platform port (the runtime seam)

Only these files name Bun: `server.ts` (calls `Bun.serve`),
`framework/platform/bun-runtime.ts`, `framework/platform/watch.ts`, and
`framework/render/render.ts` (which uses `HTMLRewriter`). Everything else is
runtime-blind. Serving uses Bun's native router directly (§11); the port covers
file access, which the static handler needs.

```typescript
// /framework/platform/runtime.ts  — the port (interface)
export interface Runtime {
  readFile(path: string): Promise<string>;
  fileExists(path: string): Promise<boolean>;
}
```

```typescript
// /framework/platform/bun-runtime.ts  — the only Bun adapter for file access
import type { Runtime } from "./runtime.ts";

export const bunRuntime: Runtime = {
  readFile(path) { return Bun.file(path).text(); },
  fileExists(path) { return Bun.file(path).exists(); },
};
```

To move off Bun later you write one `node-runtime.ts`, swap `Bun.serve` for the
new runtime's server in `server.ts`, and swap `HTMLRewriter` in `render.ts` for a
vendored parser. A handful of files — not a rewrite.

---

## 2. The binding vocabulary (the entire language)

The whole templating language is a handful of attributes, in two groups:
**data binding** (move data into elements) and **component config** (configure a
component where it's used — polymorphic element, variants). Data binding lives
inside atoms; composition and config live where you compose. There is nothing
else to learn.

### Data binding

| Marker | Where | Meaning | Example |
|---|---|---|---|
| `data-field="path"` | inside atoms | Set the element's **text** to `path` (escaped) | `<span data-field="label">x</span>` |
| `data-bind-<attr>="path"` | inside atoms | Set HTML **attribute** `<attr>` to `path` | `<img data-bind-src="avatarUrl">` |
| `<component>` | where you compose | Compose a child component (hyphenated tag) | `<b-avatar data="assignee">` |
| `each="path"` | on a component tag | Render **once per array element** of `path` | `<item-card each="items">` |
| `data="path"` | on a component tag | Render **once** with the `path` slice (default: whole current scope) | `<b-avatar data="assignee">` |

### Component config (props)

Any **literal attribute** on a component tag (other than `data`/`each`) is a
**prop** handed to that component. The component opts in to a prop with one of:

| Marker | In the component | Meaning | Example use |
|---|---|---|---|
| `<slot-tag prop-as="fallback">` | the polymorphic root | Render as the element named by the `as` prop (else `fallback`) | `<b-text as="h2">` |
| `prop-attr-<x>="propName"` | any element | Set attribute `<x>` from the literal prop `propName` | `<b-button variant="solid">` |
| `prop-text="propName"` | any element | Set the element's **text** from the literal prop `propName` (escaped) | `<b-button label="Add">` |

**Guardrail (important):** config only ever places a **tag name or a static
attribute value**. It never branches on data and never contains logic. Anything
conditional belongs in the service, which decides *which* component/props to use
and hands the template finished data. This keeps templates logic-free even as
components gain flexibility (polymorphism, variants, states).

**Resolution rules**
- `path` is a dot path resolved against the **current component's data scope**
  (`assignee.avatarUrl`). Each component renders in its own scope, so the same
  short path means different things at different layers — no collisions.
- **`path="."` (or empty) means the scope value itself** — an atom handed a
  primitive renders it directly (`<b-text data="title">` + `data-field="."`).
- A path that doesn't exist is a dev signal (`warn`/`throw`); an explicit `null`
  renders empty and is **not** flagged (intentional blank).
- `each` and `data` are mutually exclusive on a tag; `each` wins if both appear.
- Config and data binding **coexist on one element** — e.g. a button can take a
  literal `variant` (config → class) and a `data-bind-hx-post` (data → attribute).

**Layering — why it stays clean**
The verbose binding (`data-bind-*`, `data-field`) is written **once, inside each
atom**. Pages and organisms only use component tags with `data`/`each` and the
occasional config prop. So composition reads as semantic HTML:

```html
<!-- organism: clean — component tags + data/each + config props -->
<section class="item-list">
  <b-text as="h2" class="heading-2" data="title"></b-text>
  <item-card each="items"></item-card>
</section>
```

**Conventions**
- **Component tags may self-close.** `<b-input name="x" label="X" />` works even
  though HTML forbids self-closing custom elements — the engine normalizes
  `<comp …/>` to `<comp …></comp>` before parsing (§9). Use it for childless
  components; keep explicit close tags only where you pass example children.
- **Boolean props are bare.** A valueless attribute (`<b-input required />`)
  passes an empty-string prop, and `prop-attr-required` emits a **bare** `required`
  (not `required=""`). Absent prop → attribute dropped entirely.
- **Folder = component; filename = tag name**, hyphenated, globally unique
  (`atoms/item-card/item-card.html` → `<item-card>`). Each component folder holds
  its `.html` (template/mockup/docs) **and its `.css` next to it** — one place per
  component, fully self-contained. The renderer discovers templates by recursing
  the tree, so nesting depth is free; only the hyphenated filename matters.
- **Keep example children inside a component tag** so the raw file is still a
  mockup; the server discards them and substitutes the real render.
- `data-bind-class` *replaces* `class` — put base classes in the bound value, or
  pair a static class with a bound modifier.
- **Styling is two layers, both CSS, no engine involvement.** (1) The
  **design system** lives in `/frontend/styles`: `variables.css` (`:root` tokens)
  and `global.css` (reset + page layout). (2) **Component CSS is co-located** in
  each component's folder and references the tokens. The framework concatenates
  all component CSS into one cached `/components.css` bundle (`createStyleBundle`,
  §3) — co-location for authoring, a single request for the browser, still no
  build step. An atom stays dumb (`<span data-field="text">`); a design-token
  class does the visual work. Headings still emit the correct `h1`–`h6` element
  for accessibility.
- **One class per element; variants are attributes, not stacked classes.** This is
  vanilla CSS, not a utility framework — the co-located CSS file *is* where a
  component's styling lives, so an element wears a single class (`.btn`) and its
  variations are **attributes** the CSS targets (`.btn[data-variant="soft"]`,
  `.btn[data-size="lg"]`, `.btn[data-status="danger"]`). No `btn btn--solid
  btn--lg` soup. Component config props (§2 props) map straight to these
  attributes, so a polymorphic atom stays one class with a few knobs.
- **Tokens are two-layered: primitives → semantic.** `variables.css` defines raw
  palette/scale **primitives** (`--indigo-600`, `--text-lg`, `--space-4`) and
  **semantic aliases** that point at them (`--color-primary: var(--indigo-600)`).
  Components reference **only** semantic tokens, so retheming is a one-line
  primitive edit that cascades everywhere downstream (§13a verifies this).
- **Each component carries its own catalog doc.** A co-located `<name>.md`
  documents every state/variant as `html` fences; the framework renders them into
  a live `/catalog` (§13a). To make pseudo-states (`:hover`/`:focus-visible`/
  `:active`) viewable without interaction, the CSS pairs each with a parallel
  forced selector on the same single class (`.btn:hover, .btn[data-force~="hover"]`).

### Example component files

```html
<!-- atoms/b-text/b-text.html  — ONE polymorphic typography atom -->
<!-- `as` chooses the element (accessibility); `class` is a CSS token; text via self-path -->
<slot-tag prop-as="span" prop-attr-class="class" data-field=".">Example text</slot-tag>
```

```css
/* atoms/b-text/b-text.css  — co-located styles, reference design tokens */
.heading-2 { font-size: 1.1rem; color: var(--color-muted); margin: var(--space-6) 0 var(--space-3); }
```

```html
<!-- atoms/b-button/b-button.html  — variant via config prop, action via data binding -->
<button prop-attr-class="variant" data-bind-hx-post="action" data-field="label">Button</button>
```

```html
<!-- atoms/b-avatar/b-avatar.html -->
<img class="avatar" data-bind-src="avatarUrl" data-bind-alt="name"
     src="/example-avatar.png" alt="Jane Doe">
```

```html
<!-- atoms/b-badge/b-badge.html -->
<span class="badge" data-status="active" data-bind-data-status="tone" data-field="label">active</span>
```

```html
<!-- molecules/item-card/item-card.html -->
<article class="item-card" data-bind-id="id">
  <b-text as="h3" class="card-title" data="name"></b-text>
  <b-badge data="status"><span class="badge">active</span></b-badge>
  <!-- data-driven action button: raw markup is fine INSIDE a component (it owns its
       markup); variant/size are static, label/action come from the item's data -->
  <button class="btn" data-size="sm" data-variant="outline"
          data-bind-hx-post="archive.action" data-field="archive.label">Archive</button>
</article>
```

```html
<!-- organisms/item-list/item-list.html -->
<section class="item-list">
  <b-text as="h2" class="heading-2" data="title"></b-text>
  <item-card each="items">
    <article class="item-card">example card for the mockup</article>
  </item-card>
</section>
```

A single `b-text` atom now serves every heading, paragraph, and inline label:
`as="h2"`/`as="p"`/`as="a"` picks the semantic element, a token `class` styles it,
`data` feeds the content. Buttons are one `b-button` with `variant` choosing the
class — primary, secondary, danger — while real behaviour (`hx-post`) is a data
binding. Full atomic flexibility, zero template logic.

### Verified output

Rendering `item-list` (two items) produced this real output — polymorphic `h2`
and `h3` emitted, the button's variant attribute and data-bound `hx-post`
coexisting, every component tag and config marker resolved away:

```html
<section class="item-list">
  <h2 class="heading-2" data-field=".">My Tasks</h2>
  <article class="item-card" data-bind-id="id" id="ITM-1">
    <h3 class="card-title" data-field=".">Fix auth</h3>
    <span class="badge" data-status="active" data-bind-data-status="tone" data-field="label">Active</span>
    <button class="btn" data-size="sm" data-variant="outline"
            data-bind-hx-post="archive.action" hx-target="closest .item-card" hx-swap="outerHTML"
            data-field="archive.label" hx-post="/ui/items/ITM-1/archive">Archive</button>
  </article>
  <!-- second card identical shape with ITM-2 data -->
</section>
```

---

## 3. Directory structure — framework vs app

> **On-disk layout (2026-06-30): a monorepo.** The single `poc/framework | app |
> frontend` tree below was reorganized into three top-level concerns:
> **`batch/`** (everything `/framework` describes — the substrate), **`grain/`** (the
> AI design system — `ai/*`, the `b-*` atoms, `scripts/*`, `styles/grain.css`), and
> **`project/`** (domain/data/services/routes/view, the product's components + pages +
> skin, and `server.ts` the composition root). **Update (2026-07-05): the composition root
> folded into `tjakoen.github.io/`** — the app now wires the layers and holds `server.ts`;
> `project/` is a paused docs-only archive. The framework's component scanners take
> **multiple component roots** (`grain/components` + `tjakoen.github.io/components`). The tree
> below still describes BATCH's internals + the conceptual framework/app/frontend
> split; see `docs/GRAIN.md` for the concern mapping.

Split by **stability and ownership**, not by layer. `/framework` is the reusable
engine ("BATCH") — you touch it rarely and it knows nothing about any
particular app. `/app` is what you build daily. `/frontend` is your components.
The test the split passes (verified): **delete `/app` and `/framework` still
compiles and is reusable for a different project** — the framework has zero
imports from the app.

```
/project
├── /framework                    # the reusable engine — touch rarely, no app knowledge
│   ├── /render
│   │   └── render.ts             #   createRenderer() — the generic composition engine
│   ├── /platform                 #   runtime seam
│   │   ├── runtime.ts            #     Runtime PORT (file access)
│   │   ├── bun-runtime.ts        #     Bun file adapter
│   │   └── watch.ts              #     dev hot-reload watcher
│   ├── /http                     #   generic transport helpers
│   │   ├── validate.ts           #     requireString / HttpError
│   │   ├── errors.ts             #     jsonError
│   │   ├── static.ts             #     makeStatic(rt, root) — root injected; binary types (woff2…)
│   │   ├── pages.ts              #     makePageServer — flat-file pages; head+body inject seams (§17)
│   │   ├── stream.ts             #     createStream() — generic per-session SSE push hub (§17)
│   │   └── sitemap.ts            #     createSitemap — pages/ tree → routes / xml
│   ├── /render
│   │   ├── render.ts             #   (above) the composition engine
│   │   └── accepts.ts            #   harvest data-kind/data-accepts → AI manifest source (§17)
│   ├── /assets    style-bundle.ts          #   co-located component .css → /components.css
│   └── /catalog   catalog.ts               #   .md + .ai.md two-view docs + grouped nav + search (§13a)
│
├── /app                          # what you build — touch daily
│   ├── /domain        item.ts                 # models — ZERO dependencies
│   ├── /data                                  # storage behind a port (no DB hardwired)
│   │   ├── item-repository.ts                 #   ItemRepository PORT
│   │   ├── in-memory-item-repository.ts       #   placeholder impl (wired by default)
│   │   ├── sql-item-repository.ts             #   optional: any SQL DB via SqlClient
│   │   ├── rest-item-repository.ts            #   optional: consume another API
│   │   ├── sql-client.ts                      #   SqlClient PORT
│   │   ├── /dto       item-row.ts  item-api-dto.ts
│   │   └── /mappers   item-mapper.ts
│   ├── /services      item-service.ts  item-views.ts
│   ├── /ai                                    # the AI interaction layer (§17, docs/AI-INTERFACE.md)
│   │   ├── contract.ts                        #   SSOT: ActionName/SurfaceKind unions + ACTIONS registry
│   │   ├── reasoner.ts                        #   Reasoner boundary (Model seam) + stub
│   │   ├── interaction-layer.ts               #   the ONE door: validate → decide → push render ops
│   │   └── manifest.ts                        #   the AI's per-screen instruction manual
│   ├── /view                                  # this app's view wiring
│   │   ├── renderer.ts                        #   createRenderer() configured w/ app config
│   │   └── components.ts                      #   named components (ItemCard, LoopCard…)
│   ├── /routes      routes.ts  ai-routes.ts   # buildRoutes(): /ui + /api · buildAiRoutes(): /intent /stream /ai/manifest
│   └── config.ts                              # env-driven dev/prod switches
│
├── /frontend                     # standards-only, no build (your components)
│   ├── /components                           # one FOLDER per component: .html + .css (+ .md catalog doc)
│   │   ├── /atoms                            # b- = reusable design-system primitives
│   │   │   ├── /b-text    b-text.html    b-text.css
│   │   │   ├── /b-button  b-button.html  b-button.css  b-button.md  # .md → /catalog (§13a)
│   │   │   ├── /b-input   b-input.html   b-input.css   b-input.md   # forms compose these
│   │   │   └── /b-badge   b-badge.html   b-badge.css
│   │   ├── /molecules/item-card   item-card.html   item-card.css
│   │   └── /organisms
│   │       ├── /item-list    item-list.html   item-list.css
│   │       └── /app-header   app-header.html  app-header.css    # shared nav, composed by pages
│   ├── /styles                               # the DESIGN SYSTEM (global, not per-component)
│   │   ├── variables.css                      #   tokens + Redaction @font-face + grade atom (§2, §17)
│   │   └── global.css                         #   reset + paper grain layer + masthead + caret
│   ├── /fonts        redaction-{400,35,50,70}-400.woff2   # self-hosted grade families (DESIGN-SYSTEM §3)
│   ├── /scripts                              # the only client JS — small islands
│   │   ├── ai-dispatch.js                     #   dispatcher: clicks → /intent, applies SSE render ops (§17)
│   │   └── cmdk.js                            #   global ⌘K command palette (search)
│   ├── /pages                                # flat files; folders only to group subpages
│   │   ├── index.html  home.html  about.html  #   "/" · "/home" · "/about"
│   │   └── loop.html                          #   "/loop" — the AI interaction-loop demo
│   └── /vendor       htmx.min.js              # vendored, not a CDN
│
├── server.ts                     # composition root — the ONLY place framework + app meet
└── dev.sh
```

The framework also has `/framework/assets/style-bundle.ts` —
`createStyleBundle(componentsDir)` walks the component folders, concatenates every
co-located `.css` into one cached bundle, and exposes `refresh()` for hot reload.
The composition root serves it at `/components.css`. So a page links GRAIN's three
page-level sheets then the component bundle: `styles/variables.css` (tokens) →
`styles/global.css` (base/skin) → `styles/grain.css` (grade mechanism) → `/components.css`
(per-component styles + the AI module). No build step — the bundle is read once and
cached, dropped on any `.css`/`.html` change (§12a).

Dependency direction: `app/routes → app/services → app/domain`, with `app/data`
and `framework/platform` implementing ports at the edges, and `app/view` calling
`framework/render`. **`/framework` never imports `/app`** (verified). The domain
imports nothing. `server.ts` is the sole wiring point and belongs to neither side.
**No database is wired in** — the in-memory repository is the default (§6).

---

## 4. Architecture diagrams

<svg viewBox="-13 -15 1000 472" width="100%" role="img"
     aria-label="The BATCH request/response architecture. The browser (a page shell, vendored htmx, and other consumers like a CLI, app or AI layer) calls server.ts, the Bun.serve composition root. It routes /ui/* to HTML fragments and /api/* to JSON, both through services (use cases and view models) onto the domain (Item) and a data ItemRepository port. That port is implemented by a swappable in-memory, SQL, or REST repository. Rendering uses an HTMLRewriter that reads the frontend components and returns an HTML fragment to the page."
     style="display:block;width:100%;max-width:680px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-archit0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
    <rect x="300" y="-12" width="540" height="93" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:2 3"/>
    <text x="310" y="1" style="fill:var(--color-muted);font-size:11px;letter-spacing:.04em">BROWSER</text>
    <rect x="3" y="132" width="289" height="165" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:2 3"/>
    <text x="13" y="145" style="fill:var(--color-muted);font-size:11px;letter-spacing:.04em">RENDER + FRONTEND</text>
    <rect x="309" y="60" width="532" height="309" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:2 3"/>
    <text x="319" y="73" style="fill:var(--color-muted);font-size:11px;letter-spacing:.04em">BACKEND</text>
    <rect x="344" y="348" width="627" height="93" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:2 3"/>
    <text x="354" y="361" style="fill:var(--color-muted);font-size:11px;letter-spacing:.04em">REPOSITORY IMPLS — SWAPPABLE</text>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="313" y="16" width="141" height="36" rx="6"/>
    <rect x="508" y="16" width="129" height="36" rx="6"/>
    <rect x="692" y="16" width="134" height="52" rx="6"/>
    <rect x="322" y="160" width="123" height="52" rx="6"/>
    <rect x="704" y="160" width="110" height="52" rx="6"/>
    <rect x="91" y="160" width="113" height="52" rx="6"/>
    <rect x="16" y="232" width="263" height="52" rx="6"/>
    <rect x="488" y="232" width="168" height="52" rx="6"/>
    <rect x="325" y="304" width="117" height="36" rx="6"/>
    <rect x="690" y="304" width="138" height="52" rx="6"/>
    <rect x="357" y="376" width="185" height="52" rx="6"/>
    <rect x="603" y="376" width="145" height="52" rx="6"/>
    <rect x="806" y="376" width="152" height="52" rx="6"/>
  </g>
  <rect x="490" y="88" width="165" height="52" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="426" y1="52" x2="511" y2="88" marker-end="url(#fl-archit0)"/>
    <line x1="692" y1="68" x2="640" y2="88" marker-end="url(#fl-archit0)"/>
    <line x1="508" y1="34" x2="454" y2="34" marker-end="url(#fl-archit0)"/> stroke-dasharray="5 4"
    <line x1="504" y1="140" x2="445" y2="162" marker-end="url(#fl-archit0)"/>
    <line x1="640" y1="140" x2="704" y2="165" marker-end="url(#fl-archit0)"/>
    <line x1="445" y1="210" x2="504" y2="232" marker-end="url(#fl-archit0)"/>
    <line x1="704" y1="207" x2="640" y2="232" marker-end="url(#fl-archit0)"/>
    <line x1="495" y1="284" x2="436" y2="304" marker-end="url(#fl-archit0)"/>
    <line x1="640" y1="284" x2="692" y2="304" marker-end="url(#fl-archit0)"/>
    <line x1="690" y1="346" x2="542" y2="380" marker-end="url(#fl-archit0)"/> stroke-dasharray="5 4"
    <line x1="729" y1="356" x2="706" y2="376" marker-end="url(#fl-archit0)"/> stroke-dasharray="5 4"
    <line x1="804" y1="356" x2="838" y2="376" marker-end="url(#fl-archit0)"/> stroke-dasharray="5 4"
    <line x1="322" y1="186" x2="204" y2="186" marker-end="url(#fl-archit0)"/>
    <line x1="148" y1="212" x2="148" y2="232" marker-end="url(#fl-archit0)"/>
    <line x1="188" y1="160" x2="356" y2="52" marker-end="url(#fl-archit0)"/>
  </g>
  <g text-anchor="middle">
    <text x="384" y="38.3" style="fill:var(--color-fg)">Page shell (.html)</text>
    <text x="572" y="38.3" style="fill:var(--color-fg)">htmx (vendored)</text>
    <text x="759" y="38.3" style="fill:var(--color-fg)">other consumers</text>
    <text x="759" y="54.8" style="fill:var(--color-muted);font-size:12px">CLI · app · AI layer</text>
    <text x="572" y="110.3" style="fill:var(--color-bg)">server.ts — Bun.serve</text>
    <text x="572" y="126.8" style="fill:var(--color-muted);font-size:12px">the composition root</text>
    <text x="384" y="182.3" style="fill:var(--color-fg)">/ui/*</text>
    <text x="384" y="198.8" style="fill:var(--color-muted);font-size:12px">HTML fragments</text>
    <text x="759" y="182.3" style="fill:var(--color-fg)">/api/*</text>
    <text x="759" y="198.8" style="fill:var(--color-muted);font-size:12px">Response.json</text>
    <text x="148" y="182.3" style="fill:var(--color-fg)">render</text>
    <text x="148" y="198.8" style="fill:var(--color-muted);font-size:12px">HTMLRewriter</text>
    <text x="148" y="254.3" style="fill:var(--color-fg)">frontend components</text>
    <text x="148" y="270.8" style="fill:var(--color-muted);font-size:12px">atoms · molecules · organisms · templates</text>
    <text x="572" y="254.3" style="fill:var(--color-fg)">services</text>
    <text x="572" y="270.8" style="fill:var(--color-muted);font-size:12px">use cases + view models</text>
    <text x="384" y="326.3" style="fill:var(--color-fg)">domain (Item)</text>
    <text x="759" y="326.3" style="fill:var(--color-fg)">data</text>
    <text x="759" y="342.8" style="fill:var(--color-muted);font-size:12px">ItemRepository port</text>
    <text x="450" y="398.3" style="fill:var(--color-fg)">InMemoryItemRepository</text>
    <text x="450" y="414.8" style="fill:var(--color-muted);font-size:12px">default</text>
    <text x="675" y="398.3" style="fill:var(--color-fg)">SqlItemRepository</text>
    <text x="675" y="414.8" style="fill:var(--color-muted);font-size:12px">→ your DB</text>
    <text x="882" y="398.3" style="fill:var(--color-fg)">RestItemRepository</text>
    <text x="882" y="414.8" style="fill:var(--color-muted);font-size:12px">→ another API</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="468" y="65">hx-get /ui/…</text>
    <text x="666" y="73">GET /api/…</text>
    <text x="481" y="29">enhances</text>
    <text x="616" y="358">implemented by</text>
    <text x="148" y="217">reads</text>
    <text x="272" y="101">HTML fragment</text>
  </g>
</svg>

<svg viewBox="0 0 468 626" width="100%" role="img"
     aria-label="How render walks the template tree. Read the cached template; PASS 0 applies config props (as, prop-attr); PASS 1 binds data-field and data-bind-* in this scope. If there is no component tag, return the HTML. Otherwise take a slice via data= or each=; if it is an each/array, render a child per element and join, else render the child once (recurse); splice the child HTML into the slot marker, and return the HTML."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-archit1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="145" y="16" width="186" height="36" rx="6"/>
    <rect x="158" y="78" width="161" height="36" rx="6"/>
    <rect x="140" y="140" width="197" height="52" rx="6"/>
    <rect x="110" y="202" width="256" height="52" rx="6"/>
    <polygon points="239,264 336,293 239,322 141,293"/>
    <rect x="138" y="326" width="200" height="36" rx="6"/>
    <polygon points="239,388 317,417 239,446 161,417"/>
    <rect x="16" y="450" width="210" height="36" rx="6"/>
    <rect x="260" y="450" width="192" height="36" rx="6"/>
    <rect x="116" y="512" width="245" height="36" rx="6"/>
  </g>
  <rect x="184" y="574" width="109" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="239" y1="52" x2="239" y2="78" marker-end="url(#fl-archit1)"/>
    <line x1="239" y1="114" x2="239" y2="140" marker-end="url(#fl-archit1)"/>
    <line x1="239" y1="192" x2="239" y2="202" marker-end="url(#fl-archit1)"/>
    <line x1="239" y1="254" x2="239" y2="264" marker-end="url(#fl-archit1)"/>
    <line x1="239" y1="322" x2="239" y2="326" marker-end="url(#fl-archit1)"/>
    <path d="M336,293 L362,293 L362,592 L293,592" marker-end="url(#fl-archit1)"/>
    <line x1="239" y1="362" x2="239" y2="388" marker-end="url(#fl-archit1)"/>
    <line x1="203" y1="432" x2="162" y2="450" marker-end="url(#fl-archit1)"/>
    <line x1="274" y1="432" x2="315" y2="450" marker-end="url(#fl-archit1)"/>
    <line x1="155" y1="486" x2="205" y2="512" marker-end="url(#fl-archit1)"/>
    <line x1="322" y1="486" x2="272" y2="512" marker-end="url(#fl-archit1)"/>
    <line x1="239" y1="548" x2="239" y2="574" marker-end="url(#fl-archit1)"/>
  </g>
  <g text-anchor="middle">
    <text x="239" y="38.3" style="fill:var(--color-fg)">render(name, data, props)</text>
    <text x="239" y="100.3" style="fill:var(--color-fg)">read cached template</text>
    <text x="239" y="162.3" style="fill:var(--color-fg)">PASS 0: apply config props</text>
    <text x="239" y="178.8" style="fill:var(--color-muted);font-size:12px">as / prop-attr</text>
    <text x="239" y="224.3" style="fill:var(--color-fg)">PASS 1: bind data-field + data-bind-*</text>
    <text x="239" y="240.8" style="fill:var(--color-muted);font-size:12px">in this scope</text>
    <text x="239" y="297.3" style="fill:var(--color-fg)">any component tag?</text>
    <text x="239" y="348.3" style="fill:var(--color-fg)">take slice via data= / each=</text>
    <text x="239" y="421.3" style="fill:var(--color-fg)">each / array?</text>
    <text x="121" y="472.3" style="fill:var(--color-fg)">render child per element, join</text>
    <text x="356" y="472.3" style="fill:var(--color-fg)">render child once (recurse)</text>
    <text x="239" y="534.3" style="fill:var(--color-fg)">splice child HTML into slot marker</text>
    <text x="239" y="596.3" style="fill:var(--color-bg)">return HTML</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="239" y="319">yes</text>
    <text x="182" y="436">yes</text>
    <text x="295" y="436">no</text>
    <text x="371" y="442" transform="rotate(-90 371 442)">no</text>
  </g>
</svg>

---

## 5. Domain (zero dependencies)

```typescript
// /app/domain/item.ts
export interface Item {
  id: string;
  name: string;
  description: string;
  status: "active" | "archived";   // union, not enum (erasable)
  createdAt: Date;
  updatedAt: Date;
}

// Input for creation — the fields a caller supplies.
export type NewItem = Omit<Item, "id" | "createdAt" | "updatedAt">;
```

---

## 6. Data layer — ports, placeholder, and pluggable storage

Storage is **deliberately abstract**. The service depends on the `ItemRepository`
**port**, never on a database. The app runs today on an in-memory placeholder
with zero dependencies; a real database is a later swap of one adapter at the
composition root. "Any database" is not a slogan here — the repository genuinely
never names an engine.

### 6.1 The port (what the service depends on)

```typescript
// /app/data/item-repository.ts
import type { Item, NewItem } from "../domain/item.ts";

export interface ItemRepository {
  list(): Promise<Item[]>;
  findById(id: string): Promise<Item | null>;
  create(input: NewItem): Promise<Item>;
  update(id: string, patch: Partial<NewItem>): Promise<Item>;
  remove(id: string): Promise<void>;
}
```

### 6.2 In-memory repository (the wired-in placeholder) — VERIFIED

Zero dependencies, no schema, no migrations. This is what the app uses now so the
architecture can be built and exercised before any database exists.

```typescript
// /app/data/in-memory-item-repository.ts
import type { Item, NewItem } from "../domain/item.ts";
import type { ItemRepository } from "./item-repository.ts";

export class InMemoryItemRepository implements ItemRepository {
  private rows = new Map<string, Item>();
  private seq = 0;
  constructor(seed: Item[] = []) { for (const r of seed) this.rows.set(r.id, r); }

  async list() { return [...this.rows.values()].sort((a, b) => +b.createdAt - +a.createdAt); }
  async findById(id: string) { return this.rows.get(id) ?? null; }
  async create(input: NewItem) {
    const now = new Date();
    const item: Item = { ...input, id: `ITM-${++this.seq}`, createdAt: now, updatedAt: now };
    this.rows.set(item.id, item);
    return item;
  }
  async update(id: string, patch: Partial<NewItem>) {
    const cur = this.rows.get(id);
    if (!cur) throw new Error("Item not found");
    const next = { ...cur, ...patch, updatedAt: new Date() };
    this.rows.set(id, next);
    return next;
  }
  async remove(id: string) { this.rows.delete(id); }
}
```

Verified end-to-end through the running server: list ordered, create returns a
typed `Item`, partial update preserves untouched fields, find/remove work.

### 6.3 Swapping in a real database (any engine)

When you want persistence, implement `ItemRepository` for your store — nothing
else in the codebase changes. Two reference shapes:

**SQL (any Postgres-dialect driver), via a thin `SqlClient` port.** The repo
speaks standard SQL (`$1` placeholders, `(sql, params)`, `{ rows }`), so the same
queries run on PGlite (embedded, for local dev) or node-postgres (a real server)
— you implement `SqlClient` once for whichever you pick.

```typescript
// /app/data/sql-client.ts  — implement this for your DB (PGlite, pg, …)
export interface SqlResult<T> { rows: T[]; }
export interface SqlClient {
  query<T>(sql: string, params?: unknown[]): Promise<SqlResult<T>>;
  exec(sql: string): Promise<void>;
}
```

```typescript
// /app/data/sql-item-repository.ts  — the same port, backed by SQL
import type { Item, NewItem } from "../domain/item.ts";
import type { ItemRepository } from "./item-repository.ts";
import type { SqlClient } from "./sql-client.ts";
import type { ItemRow } from "./dto/item-row.ts";
import { rowToItem } from "./mappers/item-mapper.ts";

export class SqlItemRepository implements ItemRepository {
  private sql: SqlClient;
  constructor(sql: SqlClient) { this.sql = sql; }   // explicit field (erasable)
  async list() {
    const { rows } = await this.sql.query<ItemRow>(`SELECT * FROM items ORDER BY created_at DESC`);
    return rows.map(rowToItem);
  }
  async findById(id: string) {
    const { rows } = await this.sql.query<ItemRow>(`SELECT * FROM items WHERE id = $1`, [id]);
    return rows[0] ? rowToItem(rows[0]) : null;
  }
  async create(input: NewItem) {
    const { rows } = await this.sql.query<ItemRow>(
      `INSERT INTO items (id, name, description, status, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, now(), now()) RETURNING *`,
      [input.name, input.description, input.status]);
    return rowToItem(rows[0]);
  }
  async update(id: string, patch: Partial<NewItem>) {
    const { rows } = await this.sql.query<ItemRow>(
      `UPDATE items SET name = COALESCE($2,name), description = COALESCE($3,description),
         status = COALESCE($4,status), updated_at = now() WHERE id = $1 RETURNING *`,
      [id, patch.name ?? null, patch.description ?? null, patch.status ?? null]);
    if (!rows[0]) throw new Error("Item not found");
    return rowToItem(rows[0]);
  }
  async remove(id: string) { await this.sql.query(`DELETE FROM items WHERE id = $1`, [id]); }
}
```

**REST (consume another service's API).** Same port, different source.

```typescript
// /app/data/rest-item-repository.ts
import type { Item, NewItem } from "../domain/item.ts";
import type { ItemRepository } from "./item-repository.ts";
import type { ItemApiDto } from "./dto/item-api-dto.ts";
import { apiDtoToItem } from "./mappers/item-mapper.ts";

export class RestItemRepository implements ItemRepository {
  private baseUrl: string;
  constructor(baseUrl: string) { this.baseUrl = baseUrl; }   // explicit field (erasable)
  async list() {
    const body = await (await fetch(`${this.baseUrl}/items`)).json() as { items: ItemApiDto[] };
    return body.items.map(apiDtoToItem);
  }
  async findById(id: string) {
    const res = await fetch(`${this.baseUrl}/items/${id}`);
    return res.ok ? apiDtoToItem(await res.json() as ItemApiDto) : null;
  }
  async create(input: NewItem) {
    return apiDtoToItem(await (await fetch(`${this.baseUrl}/items`,
      { method: "POST", body: JSON.stringify(input) })).json() as ItemApiDto);
  }
  async update(id: string, patch: Partial<NewItem>) {
    return apiDtoToItem(await (await fetch(`${this.baseUrl}/items/${id}`,
      { method: "PATCH", body: JSON.stringify(patch) })).json() as ItemApiDto);
  }
  async remove(id: string) { await fetch(`${this.baseUrl}/items/${id}`, { method: "DELETE" }); }
}
```

### 6.4 DTOs and mappers (per source, one place each)

Each source has its **own** DTO — a SQL row is snake_case with raw strings; a REST
payload is camelCase ISO strings; neither equals the domain `Item`. They are not
made to inherit `Item` on purpose: the differences (Date vs string, union vs raw
string) are real, and the **mapper is the single source of truth** for how each
source relates to the domain. DRY lives in the mapper, not in a shared base type.
(The in-memory repo needs no DTO — it already holds `Item`.)

```typescript
// /app/data/dto/item-row.ts        (SQL row shape)
export interface ItemRow {
  id: string; name: string; description: string;
  status: string; created_at: string | Date; updated_at: string | Date;
}
// /app/data/dto/item-api-dto.ts    (REST payload shape)
export interface ItemApiDto {
  id: string; name: string; description: string;
  status: string; createdAt: string; updatedAt: string;
}
```

```typescript
// /app/data/mappers/item-mapper.ts — pure functions, the only place shapes meet
import type { Item } from "../../domain/item.ts";
import type { ItemRow } from "../dto/item-row.ts";
import type { ItemApiDto } from "../dto/item-api-dto.ts";

export const rowToItem = (r: ItemRow): Item => ({
  id: r.id, name: r.name, description: r.description,
  status: r.status as Item["status"],
  createdAt: new Date(r.created_at), updatedAt: new Date(r.updated_at),
});
export const apiDtoToItem = (d: ItemApiDto): Item => ({
  id: d.id, name: d.name, description: d.description,
  status: d.status as Item["status"],
  createdAt: new Date(d.createdAt), updatedAt: new Date(d.updatedAt),
});
```

---

## 7. Platform adapters (runtime seam)

Platform holds only **runtime** adapters now — there is no database here by
design (storage is a `ItemRepository` you choose, §6.3). The Bun-specific calls
live in one file.

```typescript
// /framework/platform/runtime.ts  — the port
export interface Runtime {
  readFile(path: string): Promise<string>;
  fileExists(path: string): Promise<boolean>;
}
// /framework/platform/bun-runtime.ts  — the only Bun file/serve adapter
import type { Runtime } from "./runtime.ts";
export const bunRuntime: Runtime = {
  readFile: (p) => Bun.file(p).text(),
  fileExists: (p) => Bun.file(p).exists(),
};
```

(Serving moves to Bun's native router in §11/§12; the hot-reload watcher in §12a
also lives here.)

---

## 8. Services + view models (application layer)

The service owns the verbs. Its methods return **domain objects** so a route can
render them to HTML (for `/ui`) or serialize them to JSON (for `/api`) without the
service being coupled to either. It also offers card-view helpers as a
convenience for the `/ui` read paths. (Earlier this returned view models from
mutations too, which made `POST /api/items` emit a different shape than
`GET /api/items` — a representation leak now removed.)

```typescript
// /app/services/item-views.ts   — view models live with the app layer
import type { Item } from "../domain/item.ts";

export interface ItemCardView {
  id: string;
  name: string;
  detailUrl: string;
  status: { label: string; tone: "active" | "archived" };   // tone → b-badge attribute
  archive: { label: string; action: string };               // button label + hx-post target
}

export const toItemCardView = (item: Item): ItemCardView => ({
  id: item.id,
  name: item.name,
  detailUrl: `/items/${item.id}`,
  status: item.status === "active"
    ? { label: "Active",   tone: "active" }
    : { label: "Archived", tone: "archived" },
  archive: item.status === "active"
    ? { label: "Archive",  action: `/ui/items/${item.id}/archive` }
    : { label: "Archived", action: "" },          // empty action → engine omits hx-post (inert)
});
```

```typescript
// /app/services/item-service.ts
import type { Item } from "../domain/item.ts";
import type { ItemRepository } from "../data/item-repository.ts";
import { type ItemCardView, toItemCardView } from "./item-views.ts";

export class ItemService {
  private items: ItemRepository;
  constructor(items: ItemRepository) { this.items = items; }   // explicit field (erasable)

  // domain-returning — the basis for BOTH representations
  listItems(): Promise<Item[]> { return this.items.list(); }
  getItem(id: string): Promise<Item | null> { return this.items.findById(id); }
  createItem(name: string, description: string): Promise<Item> {
    return this.items.create({ name, description, status: "active" });
  }
  archiveItem(id: string): Promise<Item> { return this.items.update(id, { status: "archived" }); }
  deleteItem(id: string): Promise<void> { return this.items.remove(id); }

  // view-returning convenience for /ui reads
  async listCardViews(): Promise<ItemCardView[]> {
    return (await this.items.list()).map(toItemCardView);
  }
  async getCardView(id: string): Promise<ItemCardView> {
    const item = await this.items.findById(id);
    if (!item) throw new Error("Item not found");
    return toItemCardView(item);
  }
}
```

---

## 9. Composition engine (VERIFIED)

`HTMLRewriter` is native to Bun. Templates are cached. Two passes: bind this
scope's leaves, then expand children — so a parent never re-binds a child.
This is the exact code that produced §2's output, plus two improvements:

- **`refresh()`** rebuilds the registry and drops the cache — the hook the dev
  watcher calls on file change (hot reload, §14).
- **`missing` mode** turns silent binding mistakes into a dev signal. A path that
  *does not exist* is reported (`warn` or `throw`); an *explicit `null`* is left
  alone as an intentional empty. Prod runs `ignore`. (Verified: a typo'd
  `data-field` or `data-bind-*` throws in `throw` mode; `label: null` does not.)
- **Per-attribute binding** — each template's `data-bind-<attr>` names are
  discovered once (cached) and matched with a presence selector
  (`[data-bind-src]`). No attribute mini-DSL to parse.
- **URL-scheme guard (`safeAttr`)** — text escaping does not neutralize a
  data-driven `javascript:`/`data:` value in `href`/`src`/`action`/…; those
  attrs go through a scheme allowlist (http/https/mailto/tel/relative/anchor),
  anything else dropped. The one XSS class the native parser can't catch.
- **Empty bound attributes are omitted.** A `data-bind-*` that resolves to `""`
  (or absent) emits **no** attribute — so a view model can make a control inert by
  supplying an empty value (e.g. an archived card's button gets no `hx-post`,
  rather than an `hx-post=""` that htmx would fire against the current URL).
- **Deterministic dates** — `format()` emits `toISOString()`, not host-locale
  `toLocaleDateString()`, so HTML output is stable across environments.
- **`renderPage(html, data?)`** runs the same two-pass `transform` on an arbitrary
  HTML document (not a registered template), expanding any component tags it
  contains. This is what lets **pages compose components** (§11.2). The factory
  returns `{ render, renderPage, refresh }`; `transform` is the shared core so a
  page and a component bind/expand identically.
- **Self-closing normalization.** `transform` first rewrites `<comp …/>` →
  `<comp …></comp>` for every registered component name, so authors can self-close
  childless component tags despite HTML's custom-element rule. `prop-attr` emits
  bare boolean attributes for empty-string props (`required`, not `required=""`).

The renderer is a **factory** so configuration is injected, not global:

```typescript
// /framework/render/render.ts
import { readdirSync } from "fs";
import { join } from "path";

export type MissingMode = "ignore" | "warn" | "throw";
export interface RenderConfig { componentsDir: string | string[]; missing: MissingMode; }

interface Resolved { found: boolean; value: unknown; }
function resolvePath(obj: any, path: string): Resolved {
  if (path === "" || path === ".") return { found: true, value: obj };  // self: the scope itself
  let cur = obj;
  for (const key of path.split(".")) {
    if (cur == null || !Object.hasOwn(Object(cur), key)) return { found: false, value: undefined };
    cur = cur[key];                            // own-prop only: no __proto__/constructor reach
  }
  return { found: true, value: cur };          // found:true even when value is null
}
function format(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();   // deterministic across host locale/tz
  return String(v);
}

// Attributes whose VALUE is a URL — a data-driven `javascript:` / `data:` scheme
// is an XSS vector that HTML-quote-escaping does NOT neutralize. Block it.
const URL_ATTRS = new Set(["href", "src", "action", "formaction", "xlink:href", "poster", "background", "ping"]);
const SAFE_URL = /^(?:https?:|mailto:|tel:|\/|\.\/|\.\.\/|#|\?)/i;
function safeAttr(attr: string, value: string): string {
  if (!URL_ATTRS.has(attr.toLowerCase())) return value;
  const trimmed = value.trim();
  if (trimmed === "" || SAFE_URL.test(trimmed)) return value;
  return "";   // unknown/unsafe scheme (javascript:, data:, vbscript:, …) → drop
}

export function createRenderer(config: RenderConfig) {
  const registry = new Map<string, string>();
  const cache = new Map<string, { html: string; bindAttrs: string[] }>();
  let names: string[] = [];

  function discover(dir: string) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) discover(full);
      else if (e.name.endsWith(".html")) {
        const n = e.name.slice(0, -5);
        if (n.includes("-")) registry.set(n, full);   // hyphenated = component
      }
    }
  }
  function refresh() { registry.clear(); cache.clear(); discover(config.componentsDir); names = [...registry.keys()]; }

  function onMissing(component: string, path: string) {
    if (config.missing === "ignore") return;
    const msg = `[render] unknown binding "${path}" in <${component}>`;
    if (config.missing === "throw") throw new Error(msg);
    console.warn(msg);
  }
  async function template(name: string): Promise<{ html: string; bindAttrs: string[] }> {
    const hit = cache.get(name);
    if (hit) return hit;
    const path = registry.get(name);
    if (!path) throw new Error(`Component not found: <${name}>`);
    const html = await Bun.file(path).text();          // platform seam (see §1.3)
    // discover which data-bind-<attr> this template uses (cached with the template)
    const bindAttrs = [...new Set([...html.matchAll(/data-bind-([\w-]+)=/g)].map(m => m[1]))];
    const tpl = { html, bindAttrs };
    cache.set(name, tpl);
    return tpl;
  }

  // PASS 0 — resolve config (the literal props a component was used with).
  //   <slot-tag prop-as="span">  → swap the polymorphic root's TAG NAME to props.as
  //   prop-attr-<x>="propName"    → set attribute <x> from the literal prop value
  // Guardrail: config only places a tag name or a static attribute value. Never logic.
  function applyProps(html: string, props: Record<string, string>): string {
    const slot = html.match(/<slot-tag\b[^>]*?\bprop-as="([^"]*)"/);
    if (slot) {
      const tag = (props["as"] ?? slot[1] ?? "span").replace(/[^a-zA-Z0-9-]/g, "");
      html = html.replace(/<slot-tag\b/g, `<${tag}`)
                 .replace(/<\/slot-tag>/g, `</${tag}>`)
                 .replace(/\sprop-as="[^"]*"/g, "");
    }
    return html.replace(/\sprop-attr-([\w-]+)="([^"]*)"/g, (_m, attr, propName) => {
      const v = props[propName];
      return v == null ? "" : ` ${attr}="${v.replace(/"/g, "&quot;")}"`;
    });
  }

  async function render(name: string, data: any, props: Record<string, string> = {}): Promise<string> {
    const { html: rawTpl, bindAttrs } = await template(name);
    const tpl = applyProps(rawTpl, props);             // PASS 0 — config
    const r = (p: string) => resolvePath(data, p);

    // PASS 1 — text via data-field, attributes via one handler per data-bind-<attr>.
    let rw = new HTMLRewriter().on("[data-field]", {
      element(el) {
        const path = el.getAttribute("data-field")!;
        const res = r(path);
        if (!res.found) onMissing(name, path);
        el.setInnerContent(format(res.value));
      },
    });
    for (const attr of bindAttrs) {
      rw = rw.on(`[data-bind-${attr}]`, {
        element(el) {
          const path = el.getAttribute(`data-bind-${attr}`)!;
          const res = r(path);
          if (!res.found) onMissing(name, path);
          el.setAttribute(attr, safeAttr(attr, format(res.value)));   // scheme guard for URL attrs
        },
      });
    }
    let html = await rw.transform(new Response(tpl)).text();

    // PASS 2 — expand every known component tag. Collect sync, resolve async, splice.
    //   each="path"  → render once per array element
    //   data="path"  → render once with that slice  (default: whole data object)
    //   any other literal attribute → a config prop handed to the child (PASS 0)
    const jobs: Array<Promise<string>> = [];
    let rw2 = new HTMLRewriter();
    for (const comp of names) {
      rw2 = rw2.on(comp, {
        element(el) {
          const eachPath = el.getAttribute("each");
          const dataPath = el.getAttribute("data");
          const props: Record<string, string> = {};
          for (const [n, v] of el.attributes) if (n !== "each" && n !== "data") props[n] = v;
          const idx = jobs.length;
          if (eachPath != null) {
            const eachRes = r(eachPath);
            if (!eachRes.found) onMissing(name, eachPath);     // typo'd each= is a dev signal, not silent ""
            const arr = eachRes.value;
            jobs.push(Array.isArray(arr)
              ? Promise.all(arr.map(d => render(comp, d, props))).then(a => a.join(""))
              : Promise.resolve(""));                          // found-but-null/empty → intentional blank
          } else {
            const slice = dataPath != null ? r(dataPath).value : data;
            jobs.push(render(comp, slice, props));
          }
          el.replace(`<!--slot:${idx}-->`, { html: true });
        },
      });
    }
    html = await rw2.transform(new Response(html)).text();
    const parts = await Promise.all(jobs);
    // function replacement: child HTML may contain $& / $` / $' / $$ — a string
    // replacement would treat those as patterns and corrupt the output.
    parts.forEach((p, i) => { html = html.replace(`<!--slot:${i}-->`, () => p); });
    return html;
  }

  refresh();
  return { render, refresh };
}
```

```typescript
// /app/view/renderer.ts — the app's renderer, framework factory + app config
import { createRenderer } from "../../framework/render/render.ts";
import { config } from "../config.ts";
export const { render, refresh } = createRenderer({
  componentsDir: config.componentsDir,
  missing: config.missingBindings,           // "warn" in dev, "ignore" in prod
});
```

---

## 10. Components (thin wrappers)

```typescript
// /app/view/components.ts
import { render } from "./renderer.ts";
import type { ItemCardView } from "../services/item-views.ts";
export const ItemCard   = (view: ItemCardView) => render("item-card", view);
export const ItemList   = (data: { title: string; items: ItemCardView[] }) =>
  render("item-list", data);
export const EmptyState = () => render("empty-state", {});
```

---

## 11. HTTP layer — native Bun router, two representations

There is no hand-rolled matcher. `Bun.serve` ships a `routes` object with
path-param extraction and per-method dispatch (verified), so the runtime does the
routing. A **route is a thin presentation adapter over the service**:

- `/ui/*` → **HTML fragments** for htmx, via `render()`
- `/api/*` → **JSON** for programmatic consumers, via `Response.json()`

Both call the same `ItemService`; logic is never duplicated. `Response.json()`
serializes `Date` → ISO strings automatically, so domain objects go out as clean
JSON with no mapping code (verified).

```typescript
// /framework/http/validate.ts — tiny input guard (kept; real value)
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export function requireString(v: unknown, field: string): string {
  if (typeof v !== "string" || v.trim() === "") throw new HttpError(400, `Missing field: ${field}`);
  return v;
}
```

```typescript
// /framework/http/errors.ts — never leak internals
import { HttpError } from "./validate.ts";
export function jsonError(err: unknown): Response {
  if (err instanceof HttpError) return Response.json({ error: err.message }, { status: err.status });
  console.error(err);                                   // detail stays server-side
  return Response.json({ error: "Internal Server Error" }, { status: 500 });
}
```

```typescript
// /app/routes/routes.ts — build the native routes object from the service
import type { ItemService } from "../services/item-service.ts";
import { ItemCard, ItemList, EmptyState } from "../view/components.ts";
import { requireString, HttpError } from "../../framework/http/validate.ts";
import { toItemCardView } from "../services/item-views.ts";
import { jsonError } from "../../framework/http/errors.ts";

const htmlFragment = (s: string, status = 200) =>
  new Response(s, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });

// htmx posts application/x-www-form-urlencoded (or multipart) by DEFAULT — never JSON.
// Reading req.json() on a htmx form throws. /ui reads the body as form fields.
const formFields = async (req: Request): Promise<Record<string, unknown>> => {
  const fd = await req.formData();
  return Object.fromEntries(fd.entries());
};

export function buildRoutes(service: ItemService) {
  return {
    // ---- /ui : HTML fragments (htmx targets these; bodies are form-encoded) ----
    "/ui/items": {
      GET: async () => {
        const views = await service.listCardViews();
        return htmlFragment(views.length ? await ItemList({ title: "Items", items: views }) : await EmptyState());
      },
      POST: async (req: Request) => {
        try {
          const b = await formFields(req);
          const item = await service.createItem(requireString(b.name, "name"), requireString(b.description, "description"));
          return htmlFragment(await ItemCard(toItemCardView(item)));   // map domain → view
        } catch (e) {
          // htmx swaps 2xx by default; 4xx needs hx-swap config, so keep 200 with an error fragment.
          if (e instanceof HttpError) return htmlFragment(`<p class="error">${e.message}</p>`);
          console.error(e); return htmlFragment(`<p class="error">Something went wrong.</p>`);
        }
      },
    },
    "/ui/items/:id": {
      GET: async (req: Request & { params: { id: string } }) =>
        htmlFragment(await ItemCard(await service.getCardView(req.params.id))),
    },

    // ---- /api : JSON (other consumers; same service, one consistent shape) ----
    "/api/items": {
      GET: async () => Response.json(await service.listItems()),
      POST: async (req: Request) => {
        try {
          const b = await req.json() as Record<string, unknown>;
          if (b == null || typeof b !== "object") throw new HttpError(400, "Body must be a JSON object");
          const item = await service.createItem(requireString(b.name, "name"), requireString(b.description, "description"));
          return Response.json(item, { status: 201 });          // domain shape — same as GET
        } catch (e) { return jsonError(e); }
      },
    },
    "/api/items/:id": {
      GET: async (req: Request & { params: { id: string } }) => {
        const item = await service.getItem(req.params.id);
        return item ? Response.json(item) : Response.json({ error: "not found" }, { status: 404 });
      },
      DELETE: async (req: Request & { params: { id: string } }) => {
        await service.deleteItem(req.params.id);
        return new Response(null, { status: 204 });
      },
    },
  };
}
```

Adding a JSON mirror of any `/ui` route (or vice-versa) is a few lines — the
service already returns the data; only the presentation differs.

```typescript
// /framework/http/static.ts — generic static serving; root is INJECTED (no app path baked in)
import type { Runtime } from "../platform/runtime.ts";
import { join, normalize, resolve, sep } from "path";

export function makeStatic(rt: Runtime, root: string) {
  const ROOT = resolve(root);                            // absolute → traversal guard is reliable
  return async (pathname: string): Promise<Response> => {
    const rel = pathname === "/" ? "/index.html" : pathname;
    const path = resolve(normalize(join(ROOT, rel)));
    // separator-aware containment: "/p/frontend-secret" must NOT pass for ROOT "/p/frontend"
    if (path !== ROOT && !path.startsWith(ROOT + sep)) return new Response("Forbidden", { status: 403 });
    if (!(await rt.fileExists(path))) return new Response("Not found", { status: 404 });
    const type = path.endsWith(".css") ? "text/css" : path.endsWith(".js") ? "text/javascript" : "text/html";
    return new Response(await rt.readFile(path), { headers: { "Content-Type": type } });
  };
}
```

> Note: `makeStatic` takes `root` as a parameter rather than hardcoding the
> frontend path. That keeps it generic framework code — the app supplies its own
> `frontendDir` at the composition root. (An earlier version hardcoded the path
> via `import.meta.dir`, which coupled framework to app layout and broke the
> traversal guard once moved; fixed and verified.) The containment check is
> **separator-aware** (`startsWith(ROOT + sep)`) — a bare `startsWith(ROOT)`
> leaks sibling dirs sharing the prefix (`/p/frontend-secret` vs `/p/frontend`).
> `makeStatic` stays generic — it just maps `/` → `/index.html` and serves under
> `root`. The **folder-per-page** convention (clean URL → `pages/<path>/index.html`)
> lives in a thin wrapper, §11.2, so the page layout never leaks into the framework.

### 11.1 Component CSS bundle (co-located styles, one request)

Component styles live next to their templates (§2/§3). The framework gathers them
into a single cached bundle so authoring stays co-located while the browser makes
one request — no build step.

```typescript
// /framework/assets/style-bundle.ts
import { readdirSync } from "fs";
import { join } from "path";

export function createStyleBundle(rt: Runtime, componentsDir: string | string[]) {
  let cache: string | null = null;

  function collect(dir: string, out: string[]) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) collect(full, out);
      else if (e.name.endsWith(".css")) out.push(full);
    }
  }
  async function css(): Promise<string> {
    if (cache != null) return cache;
    const files: string[] = [];
    collect(componentsDir, files);
    files.sort();                                    // deterministic order across hosts
    const parts = await Promise.all(files.map(f =>
      Bun.file(f).text().then(s => `/* ${f} */\n${s}`)));
    cache = parts.join("\n");
    return cache;
  }
  function refresh() { cache = null; }               // hook the dev watcher calls

  return { css, refresh };
}
```

GRAIN's three page-level sheets (`styles/variables.css`, `styles/global.css`,
`styles/grain.css`) are plain static files served by `makeStatic` from `grain/styles`;
only the per-component CSS (+ the AI module) is bundled.

### 11.2 Pages — flat files, folders only to group subpages

A page is a **flat file**; folders appear only when a page has subpages, where
`index.html` is that folder's main page. Don't nest a folder for a page that has no
children. The URL mirrors the tree:

| URL | serves |
|---|---|
| `/` | `pages/index.html` — the **entrance** |
| `/home` | `pages/home.html` — a flat page |
| `/about` | `pages/about.html` |
| `/profile` | `pages/profile/index.html` — a page **with** subpages → folder |
| `/profile/settings` | `pages/profile/settings.html` |

```typescript
// /framework/http/pages.ts — page routing over makeStatic
import { extname, join } from "path";
import type { Runtime } from "../platform/runtime.ts";
import { makeStatic } from "./static.ts";

type RenderPage = (html: string) => Promise<string>;

export function makePageServer(rt: Runtime, pagesRoot: string, renderPage?: RenderPage) {
  const serve = makeStatic(rt, pagesRoot);    // traversal guard applies under pagesRoot
  return async (pathname: string): Promise<Response> => {
    const isPage = !extname(pathname);
    let rel = pathname;
    if (isPage) {
      if (pathname === "/") rel = "/index.html";
      else {
        const clean = pathname.replace(/\/$/, "");
        const flat = `${clean}.html`;                                  // /home → /home.html
        rel = (await rt.fileExists(join(pagesRoot, flat))) ? flat : `${clean}/index.html`;
      }
    }
    const res = await serve(rel);
    if (isPage && renderPage && res.status === 200) {
      return new Response(await renderPage(await res.text()), { headers: res.headers });
    }
    return res;
  };
}
```

The rule: a path **with an extension** is a file (served as-is); a path **without**
one is a page — `<path>.html` if it exists, else `<path>/index.html`. Global assets
(`/styles`, `/vendor`) are served from the frontend root by `makeStatic`; the
composition root routes between the two (§12).

**Pages are rendered through the composition engine** (`renderPage`, §9), so a page
**composes atomic component tags** rather than repeating raw, class-laden markup —
this is the whole point of having a component layer. A page stays clean and
semantic; the styling/markup detail lives inside each component. (Raw HTML *inside*
a component's own `.html` is fine — the component owns its markup; the rule is that
**pages** compose components.)

Composition extends to forms: a native `<form>` (semantic structure, allowed on a
page) is built from atomic field components, so it's reusable, not a one-off. And
because the stack leans on htmx + CSS for behaviour, the little JS that remains can
be a small `<script>` **after the UI** — that's fine; what we avoid is `hx-on`
handlers scattered through the markup, not a single script block.

```html
<!-- pages/home.html — composes components; a real <form> from atoms; minimal JS after the UI -->
<body>
  <main class="container">
    <app-header active="items"></app-header>
    <h1>Items</h1>
    <form class="add-form" hx-post="/ui/items" hx-swap="none">
      <b-input name="name" label="Name" required />
      <b-input name="description" label="Description" required />
      <b-button label="Add" type="submit" />
    </form>
    <div id="list" hx-get="/ui/items" hx-trigger="load, refresh">Loading…</div>
  </main>
  <script>
    document.addEventListener("htmx:afterRequest", (e) => {
      const form = e.target;
      if (!form.matches?.(".add-form") || !e.detail.successful) return;
      form.reset();
      htmx.trigger("#list", "refresh");
    });
  </script>
</body>
```

### 11.4 Sitemap & SEO (one source, three uses)

The page routes are derived once from the `pages/` tree (`createSitemap`) and reused:
the catalog's **Pages** nav (§13a), **`/sitemap.xml`** (search engines), and
**`/robots.txt`** (which points at the sitemap). Add a page → it shows up in all
three with no extra wiring.

```typescript
// /framework/http/sitemap.ts (shape) — pages/ tree → clean routes (+ any extras)
//   index.html → "/"   home.html → "/home"   profile/settings.html → "/profile/settings"
export function createSitemap(pagesRoot: string, extraRoutes: () => string[] = () => []) {
  // routes(): string[]   xml(origin): string   refresh(): void
  return { routes, xml, refresh };
}
```

`extraRoutes` lets the composition root add routes that don't come from the pages tree — e.g. a
content engine's collections (MILL's `/notes/:slug` pages) — so the sitemap stays the single list
of everything the server actually serves. Batch stays ignorant of who provides them.

**`/llms.txt` — the AEO counterpart.** Where `/sitemap.xml` + `/robots.txt` target search engines,
`/llms.txt` (the [llmstxt.org](https://llmstxt.org) convention) targets AI crawlers: a Markdown index
of *what this stack is* and *where the canonical docs live*. `batch/http/llms.ts` owns only the format
— it renders a generic `{title, summary, sections}` structure and knows nothing of the content, exactly
like `createSitemap` knows nothing of who supplies `extraRoutes`. The composition root supplies the
curated links (`tjakoen.github.io/llms.ts`, a *projection* of `DOCS.md`, never a fork). Relative link
paths are absolutized against the request origin — the same idiom `sitemap.xml`/`robots.txt` use — so
the static export's origin-rewrite bakes in the deploy URL. This is *AI-operable ≈ AI-answerable* made
literal: the stack that lets an AI *operate* the UI also hands an AI crawler the map to *answer* about it.

### 11.3 Page transitions (native, cross-document)

Because navigation between pages is a **real full-page load** (plain `<a href>`,
not a client router), the native **CSS cross-document View Transitions API** gives
animated navigation for free — one declaration in the shared design-system CSS, no
JS, no library. It degrades gracefully: browsers without support just do an instant
navigation.

```css
/* styles/global.css — applies to every page (loaded everywhere) */
@view-transition { navigation: auto; }                 /* animate same-origin nav */

@media (prefers-reduced-motion: reduce) {
  @view-transition { navigation: none; }               /* honour the user setting */
}

::view-transition-old(root),
::view-transition-new(root) { animation-duration: 0.25s; }

/* A shared element keeps its identity across the navigation (morphs, not fades). */
.app-header { view-transition-name: app-header; }
```

This is why the page convention (§11.2) matters: keeping navigation as standard
document loads — rather than swapping `innerHTML` with a router — is what lets the
platform animate transitions natively. htmx still drives *intra-page* updates
(`/ui/*` fragment swaps); the browser drives *inter-page* transitions.

Page transitions are one instance of a broader stance (CONVENTIONS §1): **prefer the
platform's own primitive over a JS reimplementation.** Elsewhere in the stack that's
`<dialog>` (modals, the ⌘K palette, the interrupt confirm — free focus-trap, `::backdrop`,
top-layer), `<details>` (disclosures), native form constraint validation, plain `<a>` + CSS
for tabs/nav, and CSS `:has()` / `:focus-within` / `color-mix()` / `@starting-style` for
behavior and theming — so "near-zero framework JS" holds by construction. GRAIN's full running
inventory is in `grain/docs/GRAIN.md` ("What GRAIN gives you").

---

## 12. Server — composition root (the only wiring)

```typescript
// /server.ts — the ONLY place /framework and /app meet
import { config } from "./app/config.ts";
import { bunRuntime } from "./framework/platform/bun-runtime.ts";
import { watchComponents } from "./framework/platform/watch.ts";
import { makeStatic } from "./framework/http/static.ts";
import { makePageServer } from "./framework/http/pages.ts";
import { createStyleBundle } from "./framework/assets/style-bundle.ts";
import { InMemoryItemRepository } from "./app/data/in-memory-item-repository.ts";
// swap the line above for a real ItemRepository when you have a DB, e.g.:
// import { SqlItemRepository } from "./app/data/sql-item-repository.ts";
import { ItemService } from "./app/services/item-service.ts";
import { renderPage, refresh } from "./app/view/renderer.ts";
import { buildRoutes } from "./app/routes/routes.ts";

// --- wire the graph here, and ONLY here ---
const repo = new InMemoryItemRepository();          // placeholder storage (§6.2)
const service = new ItemService(repo);
const serveAsset = makeStatic(bunRuntime, config.frontendDir);    // global assets: /styles, /vendor
const servePage = makePageServer(bunRuntime, config.pagesDir, renderPage);   // pages, rendered through the engine (§11.2)
const styles = createStyleBundle(config.componentsDir);          // co-located component CSS → one bundle (§11.1)

// hot reload drops BOTH caches — templates and the CSS bundle
if (config.hotReload) watchComponents(config.componentsDir, () => { refresh(); styles.refresh(); });   // §12a

Bun.serve({
  port: config.port,
  routes: {
    ...buildRoutes(service),                         // native router (path params, methods)
    "/components.css": async () =>
      new Response(await styles.css(), { headers: { "Content-Type": "text/css" } }),
  },
  fetch(req) {
    const p = new URL(req.url).pathname;
    // global assets live at the frontend root; everything else is a page (or its co-located asset)
    if (p.startsWith("/styles/") || p.startsWith("/vendor/")) return serveAsset(p);
    return servePage(p);
  },
});

console.log(`Running on http://localhost:${config.port} (${config.isDev ? "dev" : "prod"})`);
```

The database is a single swap: replace `InMemoryItemRepository` with a real
`ItemRepository` (SQL/REST). Nothing else in the codebase changes.

---

## 12a. Developer experience — config & hot reload (VERIFIED)

One config module keys every dev/prod difference off the environment, so no
feature is toggled by scattering `if (dev)` through the code.

```typescript
// /app/config.ts
const isDev = (Bun.env.NODE_ENV ?? "development") !== "production";
export const config = {
  isDev,
  port: Number(Bun.env.PORT ?? 3000),
  componentsDir: "./frontend/components",
  frontendDir: "./frontend",                 // root for global assets: /styles, /vendor (§11)
  pagesDir: "./frontend/pages",              // root for the folder-per-page tree (§11.2)
  missingBindings: (isDev ? "warn" : "ignore") as "ignore" | "warn" | "throw",
  hotReload: isDev,
};
```

Hot reload is a recursive `fs.watch` (verified to fire on nested `.html` edits in
Bun on Linux) that drops the renderer's template cache **and** the CSS bundle
cache via `refresh()`. Component-template and co-located `.css` edits appear on
the next request with no restart; the design-system sheets in `styles/` are read
per request, so they show on plain browser reload already.

```typescript
// /framework/platform/watch.ts
import { watch } from "fs";

// Fires on .html (templates) and .css (co-located component styles) edits.
export function watchComponents(dir: string, onChange: () => void): void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  watch(dir, { recursive: true }, (_event, file) => {
    const name = file ? String(file) : "";
    if (!name.endsWith(".html") && !name.endsWith(".css")) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { onChange(); console.log(`↻ reloaded components (${name})`); }, 50);
  });
}
```

Run dev with `bun --hot backend/server.ts` (reloads server code) — the watcher
above covers the frontend `.html` that Bun's `--hot` does not track.

---

## 13. Testing

```typescript
// /app/data/in-memory-item-repository.test.ts — the placeholder, real CRUD (no DB)
import { expect, test } from "bun:test";
import { InMemoryItemRepository } from "./in-memory-item-repository.ts";

test("create + partial update preserves untouched fields", async () => {
  const repo = new InMemoryItemRepository();
  const a = await repo.create({ name: "First", description: "alpha", status: "active" });
  const updated = await repo.update(a.id, { status: "archived" });
  expect(updated.status).toBe("archived");
  expect(updated.name).toBe("First");          // untouched fields kept
  expect(await repo.findById("nope")).toBeNull();
});
```

```typescript
// /framework/render/render.test.ts — nesting, each, scope isolation, XSS (all passed)
import { expect, test } from "bun:test";
import { createRenderer } from "./render.ts";
const r = createRenderer({ componentsDir: "./frontend/components", missing: "ignore" });

const view = (over: Record<string, unknown> = {}) => ({
  id: "X1", name: "Plain", detailUrl: "/x1",
  status: { label: "Active", tone: "active" },
  archive: { label: "Archive", action: "/ui/items/X1/archive" },
  ...over,
});

test("escapes hostile text", async () => {
  const out = await r.render("item-list",
    { title: "T", items: [view({ name: "<script>alert(1)</script>" })] });
  expect(out).toContain("&lt;script&gt;");
  expect(out).not.toContain("<script>alert");
});

test("drops javascript: scheme in a data-bound URL attribute", async () => {
  // item-card's archive button binds hx-post from data — the scheme guard applies there
  const bad = await r.render("item-card", {
    id: "X", name: "n", status: { tone: "active", label: "A" },
    archive: { action: "javascript:alert(1)", label: "go" },
  });
  expect(bad).not.toContain("javascript:");        // unsafe scheme stripped to empty
});

test("child HTML with $ sequences splices verbatim (no $&/$$ corruption)", async () => {
  const out = await r.render("item-list",
    { title: "Pay $5 & up", items: [view({ name: "$& $$ $1" })] });
  expect(out).toContain("$&amp; $$ $1");           // literal, not pattern-substituted
});

// Contract test: strict mode turns a template/data mismatch into a failing test.
test("strict mode catches a binding the data does not provide", async () => {
  const strict = createRenderer({ componentsDir: "./frontend/components", missing: "throw" });
  await expect(strict.render("b-badge", { lbel: "typo", cssClass: "b" }))
    .rejects.toThrow(/unknown binding "label"/);
});
```

```typescript
// /app/routes/routes.test.ts — native Bun router, /ui (HTML) + /api (JSON). VERIFIED
import { expect, test, beforeAll, afterAll } from "bun:test";
import { InMemoryItemRepository } from "../data/in-memory-item-repository.ts";
import { ItemService } from "../services/item-service.ts";
import { buildRoutes } from "./routes.ts";

let server: ReturnType<typeof Bun.serve>; let base: string;
beforeAll(() => {
  const service = new ItemService(new InMemoryItemRepository());
  server = Bun.serve({ port: 0, routes: buildRoutes(service), fetch: () => new Response("404", { status: 404 }) });
  base = `http://localhost:${server.port}`;
});
afterAll(() => server.stop());

test("/ui/items returns an HTML fragment", async () => {
  const res = await fetch(`${base}/ui/items`);
  expect(res.headers.get("content-type")).toContain("text/html");
});
test("/api/items returns JSON", async () => {
  const res = await fetch(`${base}/api/items`);
  expect(res.headers.get("content-type")).toContain("application/json");
  expect(Array.isArray(await res.json())).toBe(true);
});
test("/api POST validates (400) then creates (201)", async () => {
  expect((await fetch(`${base}/api/items`, { method:"POST", body:"{}" })).status).toBe(400);
  const ok = await fetch(`${base}/api/items`, { method:"POST", body: JSON.stringify({ name:"X", description:"d" }) });
  expect(ok.status).toBe(201);
});
test("/ui POST accepts htmx form encoding (not JSON)", async () => {
  const res = await fetch(`${base}/ui/items`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ name: "X", description: "d" }),
  });
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("text/html");
});
test("native :id param + 404", async () => {
  expect((await fetch(`${base}/api/items/nope`)).status).toBe(404);
});
```

Verified by running the assembled server (in-memory repo → service → native
routes): `/ui` HTML and `/api` JSON off one service, POST validation → 400,
create → 201, native `:id` params, fallback 404.

---

## 13a. Component catalog (no-build design-system reference)

A Storybook-style reference at `/catalog`, generated server-side from each
component's **co-located `<name>.md`** — no React, no Storybook, no build, zero
runtime dependencies (a ~40-line line parser, not a markdown library). Every
documented state renders **live** above its **copyable source**. The left side-nav
has two sections: **Pages** (the site map from `createSitemap`, §11.4 — doubling as
in-app navigation) and **Components** (anchors to each documented component).

> **Extended 2026-06-30 (§17.4):** components now pair `<name>.md` (Human) with an
> optional `<name>.ai.md` (AI) toggled per component; the Components nav is grouped
> by atomic layer as collapsible dropdowns with a search filter; and prose renders
> inline markdown. The base mechanism below is unchanged.

**Authoring stays trivial — three steps, all inside the component's own folder:**
1. Add the component's CSS to its `.css` (one class; variants as attributes; a
   parallel `data-force` selector for each pseudo-state).
2. Add `<name>.md`: `# Name`, `## Group`, `### Panel`, then one ` ```html ` fence
   per state/variant. The `###` heading labels the panel.
3. Save, refresh `/catalog` — it appears with a side-nav entry.

```typescript
// /framework/catalog/catalog.ts (shape)
export function createCatalog(rt: Runtime, componentsDir: string | string[], sitemap?: Sitemap) {
  // findDocs(): recurse for *.md   parseDoc(): #→name, ##→group, ###→label, ```html→panel
  // html(): live = inject fence verbatim (author-controlled, not user data);
  //         source = HTML-escaped in <pre><code> + a clipboard Copy button.
  // refresh(): drop cache (dev watcher also fires on .md, §12a).
  return { html, refresh };
}
```

The catalog links the real `variables.css` + `global.css` + `/components.css`, so
panels render with production styles. Two properties fall out of the design:
- **Forced pseudo-states.** Because each pseudo-state has a parallel
  `data-force~="…"` selector, `:hover`/`:focus-visible`/`:active` are viewable
  statically (the `.md` writes `data-force="hover"`) — no interaction needed.
- **Token cascade is provable.** Components use only semantic tokens, which point
  at primitives (§2). Change one primitive in `variables.css` and every catalog
  panel restyles — the catalog *is* the regression check for the token graph.

Because it is **served** (a `/catalog` route, not a static file), the `file://`
failure mode of static-file catalogs simply doesn't exist here.

---

## 14. Audit history & certification

### 14.1 Final audit (this revision) — assembled & run

The whole backend was assembled exactly as this document specifies, typechecked,
served, and tested. Findings and their fixes:

| # | Sev | Finding | Fix |
|---|---|---|---|
| F1 | High | Four classes used `constructor(private x: T)` **parameter properties** — banned by §1.2 and rejected by `erasableSyntaxOnly` and Node's strip-only loader (Bun tolerated them, hiding the issue). | Explicit fields in `SqlItemRepository`, `RestItemRepository`, `ItemService`, `HttpError`. |
| F2 | High | The erasable/ESM model fails to typecheck without **`"type": "module"`** in `package.json`; this was unstated. | Documented as required setup (§1.2). |
| F3 | Med | `erasableSyntaxOnly` requires **TypeScript ≥ 5.8**; unstated. | Documented minimum version (§1.2). |
| F4 | High | `GET /api/items` returned the **domain** shape but `POST /api/items` returned a **view model** — the JSON API was internally inconsistent. | Service mutations now return domain `Item`; `/ui` maps to a view, `/api` serializes domain. GET/POST verified identical keys. |
| F5 | Low | `static.ts` used Bun-only `import.meta.dir`, a runtime-coupling leak outside the platform seam. | Switched to `import.meta.dirname`, then to an injected `root` param (F6). |
| F6 | Structural | Framework engine and example app lived in one tree, confusing "is this framework or my app?". Restructure to `/framework` + `/app` introduced a static-path regression (relative root broke the traversal guard → 403). | Split into `/framework` (zero app imports, verified) + `/app` + top-level `server.ts`; `makeStatic(rt, root)` resolves root to absolute. Re-typechecked and re-run green. |
| F7 | High | Traversal guard used `path.startsWith(ROOT)` — a sibling dir sharing the prefix (`/p/frontend-secret` vs `/p/frontend`) passed, reachable via `../`. The prior "guard is reliable" claim was false. | Separator-aware check: `path === ROOT \|\| path.startsWith(ROOT + sep)` (§11). |
| F8 | High | Slot splice `html.replace("<!--slot:i-->", p)` used a string replacement, so child HTML containing `$&`/`` $` ``/`$$` was pattern-substituted and corrupted. | Function replacement `() => p` skips substitution (§9). |
| F9 | High | `/ui` POST routes called `req.json()`, but htmx posts `application/x-www-form-urlencoded` by default → every form POST threw into the catch. The htmx write path never worked. | `/ui` reads `req.formData()` via `formFields()`; `/api` stays JSON (§11). |
| F10 | Med | `data-bind-<attr>` set URL attrs (`href`/`src`/…) straight from data; HTML escaping does not stop `javascript:`/`data:` schemes — an XSS vector once external data (REST repo) flows in. | `safeAttr` scheme allowlist on URL-valued attrs (§9). |
| F11 | Med | A typo'd `each="..."` rendered empty silently, contradicting the "no silent binding failures" guarantee. | `each` now calls `onMissing` when the path is not found (§9). |
| F12 | Low | `resolvePath` used `key in Object(cur)`, reaching prototype keys (`__proto__`, `constructor`); `format()` used host-locale `toLocaleDateString()` (non-deterministic). | `Object.hasOwn` (own-prop only) + `toISOString()` (§9). |

**Certification (verified by running, post-restructure):** `/framework` imports
**nothing** from `/app` (the reusability test passes); `tsc -p` is **green** under
`erasableSyntaxOnly` + `verbatimModuleSyntax` (TS 6.0); the full test suite
passes; the split server serves
`ui=200 api=200 static=200 post=201 badpost=400 traversal=403 404=404`; and
`GET`/`POST /api/items` return identical domain keys.

> **Scope of the prior certification (honest note).** The earlier "certified"
> pass exercised typecheck, framework/app isolation, and a JSON-fetch test
> harness — it did **not** exercise real htmx form POSTs or probe the traversal
> guard with sibling-prefix paths, the two paths most likely to break in
> production. Both were broken (F7–F9) and are now fixed and covered by tests
> (§13). Treat "certified" as "passes the listed checks", not "audited exhaustively".

### 14.2 Prior audit (closed)

| Item | Fixed in |
|---|---|
| C1 `DOMParser` absent in Bun | §9 — native `HTMLRewriter` (verified) |
| C2 template read per render | §9 — `cache` Map |
| C3 `!` on a Promise / null leak | §6 — `RETURNING *` / explicit not-found throw |
| C4 module-singleton DB | §12 — repository injected at composition root |
| H1 `.map(this.method)` this-loss | §6.4 — mappers are free functions |
| H2 tangled renderer recursion | §9 — clean two-pass (verified) |
| H3 dates render as garbage | §9 `format()`; §8 view model formats status |
| H4 service/HTTP verb drift | §8/§11 — service owns verbs; routes call them |
| H5 brittle string routing | §11 — Bun native router (verified) |
| H6 no input validation | §11 — `requireString()` guard |
| H7 error message leak | §11 — generic client message, detail logged |
| M1 not actually atomic | §2/§9 — hyphenated-tag composition (verified) |
| M2 mockup ≠ runtime (1 vs N) | §2 — `each` + example fallback children |
| M3 `any` at data ingress | §6.4 — typed DTOs, narrowed in mappers |
| M4 htmx from CDN | §3 — `/frontend/vendor/htmx.min.js` |
| M5 doc tests regex source | §13 — tests drive real routes/render |
| M6 server.ts god-function | §11/§12 — split `/http/*`, thin root |

### 14.3 Known open items (deferred by design, not defects)

- **Auth / CSRF** — required before exposing write endpoints publicly (§16).
- **Persistence** — in-memory placeholder by design; swap a real `ItemRepository`.
- **Observability** — APM/OTel auto-instrumentation is weak under Bun; add manual
  spans if/when needed.

### 14.4 Frontend-layer audit (2026-06-27) — fixed

The frontend layer (pages, catalog, sitemap, the `b-` components, self-closing /
prop-text) was audited after the backend certification. Findings and fixes:

| # | Sev | Finding | Fix |
|---|---|---|---|
| A1 | Med | Archived card's button rendered `hx-post=""` (empty `action`) and stayed clickable — htmx would POST to the current page URL. | Engine **omits** a bound attribute whose value is empty/absent (§9); archived button now has no `hx-post`. |
| A2 | Med | `b-badge` rendered two classes (`badge badge-active`) — the utility-soup the one-class rule forbids. | Single `.badge` + `data-status` attribute; view model supplies `tone`. |
| A3 | Low | `GET /ui/items/:id` and `POST /ui/items/:id/archive` threw on a missing id → HTTP 500. | Explicit existence check → 404 fragment. |
| A4 | Low | `POST /api/items` with malformed JSON → 500. | `jsonBody()` wraps parse → `HttpError(400)`. |
| A5 | Low | Page server probed `fileExists` with a `..` path (existence info-leak; content still 403'd). | Skip the flat-file probe when the path contains `..`. |
| A6 | Low | `/ui` error fragment interpolated `HttpError.message` unescaped. | `escHtml()` on the message. |
| A7 | Nit | Token drift (literal `1.1rem`, `600`, `0.55rem`); `expandSelfClosing` rebuilt its RegExp per call; `sitemap.xml` unescaped; stale `.is-*` comment. | Tokenized; regex cached on `refresh()`; XML-escaped `<loc>`; comment fixed. |

**Re-verified:** `tsc` green (erasable, `allowImportingTsExtensions`), full suite
passes, server serves entrance/`/home`/`/about`/`/catalog`/`/sitemap.xml`/`/robots.txt`,
pages expand `b-*` tags, archived button is inert, badge is single-class.

### 14.5 AI interaction layer + design-system audit (2026-06-30) — verified

Added the AI interaction layer (§17), the Sourdough retheme, the catalog
upgrades, and the global ⌘K palette. Full audit findings:

| Area | Result |
|---|---|
| Framework purity | `framework/` imports **nothing** from `app/` — `stream.ts` + `accepts.ts` are generic (verified by grep). |
| Erasable TS | No `enum`, no parameter-properties; the AI vocabulary uses `ActionName`/`SurfaceKind` **unions + a `const` registry** (the erasable "enum"). `tsc` green. |
| SSOT | `app/ai/contract.ts` is the single source for verbs + surface kinds; view models are typed against it (`action.name: ActionName`), surfaces built via `surface()`. Manifest accepts are **derived** (harvest + registry inversion), never hand-typed; startup drift-guard clean. |
| Binary assets | `makeStatic` now types woff2/woff/svg; fonts served byte-exact (magic `wOF2`, exact length) from the composition root. |
| Routes | 14/14 smoke-tested 200 + correct content-type; `/intent` → 202 valid / 400 unknown verb; SSE confirm + rollback land over `/stream`. |
| Design system | Monochrome paper/ink applied app-wide via the semantic-token remap (no per-component edits); grade-as-signal real (Redaction 35/50/70 self-hosted); no stale `--gray-*` refs. |
| Tests | 15 pass / 0 fail (interaction-layer validation, single-writer, rollback, streaming). |

**Open items (deferred by design, not defects):** the reasoner is a **stub** behind
the real `Model` seam; the **Gate** (triage → light/heavy routing) and **heavy-path**
"thinking" UI are not yet wired (build-order step 3); the ⌘K palette indexes pages + components (tasks/
knowledge and intent-emitting commands are seams); SSE has no auth (single-user;
multi-device deferred with conflict-resolution, `docs/MVP.md`).

---

## 15. Build order

<svg viewBox="0 0 285 384" width="100%" role="img"
     aria-label="The build order: one, render() plus tests; two, the data port and an in-memory repo; three, services and view models; four, native /ui and /api routes and the server; five, the first page end-to-end; six, swap in a real ItemRepository when persistence is needed."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-archit2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="71" y="16" width="142" height="36" rx="6"/>
    <rect x="34" y="76" width="217" height="36" rx="6"/>
    <rect x="45" y="136" width="195" height="36" rx="6"/>
    <rect x="16" y="196" width="253" height="36" rx="6"/>
    <rect x="26" y="316" width="233" height="52" rx="6"/>
  </g>
  <rect x="55" y="256" width="175" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="143" y1="52" x2="143" y2="76" marker-end="url(#fl-archit2)"/>
    <line x1="143" y1="112" x2="143" y2="136" marker-end="url(#fl-archit2)"/>
    <line x1="143" y1="172" x2="143" y2="196" marker-end="url(#fl-archit2)"/>
    <line x1="143" y1="232" x2="143" y2="256" marker-end="url(#fl-archit2)"/>
    <line x1="143" y1="292" x2="143" y2="316" marker-end="url(#fl-archit2)"/>
  </g>
  <g text-anchor="middle">
    <text x="143" y="38.3" style="fill:var(--color-fg)">1 · render() + tests</text>
    <text x="143" y="98.3" style="fill:var(--color-fg)">2 · data: port + in-memory repo</text>
    <text x="143" y="158.3" style="fill:var(--color-fg)">3 · services + view models</text>
    <text x="143" y="218.3" style="fill:var(--color-fg)">4 · native routes (/ui + /api) + server</text>
    <text x="143" y="278.3" style="fill:var(--color-bg)">5 · first page end-to-end</text>
    <text x="143" y="338.3" style="fill:var(--color-fg)">6 · swap in a real ItemRepository</text>
    <text x="143" y="354.8" style="fill:var(--color-muted);font-size:12px">when persistence is needed</text>
  </g>
</svg>

Steps 1–4 are verified. The database is deferred on purpose — build the
architecture on the in-memory placeholder, swap one adapter later.

---

## 16. Decisions locked

- **Bun + erasable-only TypeScript + platform port.** Native HTML parsing is the
  reason; the port makes the runtime a one-file seam.
- **Framework / app separation.** The reusable engine lives in `/framework` (zero
  app imports, verified), the project in `/app`, and `server.ts` at the top wires
  them. You can delete `/app` and reuse `/framework` elsewhere.
- **Storage is the `ItemRepository` port — no database wired in.** The in-memory
  repository is the default; a real DB (SQL via `SqlClient`, or REST) is one swap
  at the composition root. Architecture first; pick the engine later.
- **DTOs and mappers are separate, per source.** No inheriting `Item`; the mapper
  is the single source of truth for how each source relates to the domain.
- **Components are hyphenated tags**, filename = tag name, expanded server-side.
- **One folder per component; CSS co-located with its template.** The design
  system (tokens + base) lives in `/frontend/styles`; per-component CSS sits beside
  the `.html` and is concatenated into one cached `/components.css` bundle
  (`createStyleBundle`, §11.1) — co-location to author, one request to serve, no
  build step.
- **Vanilla CSS, one class per element; variants are attributes.** Not a utility
  framework — the co-located `.css` owns the styling, so an element wears a single
  class and variations are attributes the CSS targets (`.btn[data-variant="soft"]`).
  Tokens are two-layered (primitives → semantic, §2); components use only semantic.
- **Each component documents itself; the catalog is generated.** A co-located
  `<name>.md` (states/variants as `html` fences) feeds a server-generated
  `/catalog` — Storybook-style, no build, no deps, live render + copyable source
  (`createCatalog`, §13a). Pseudo-states shown statically via `data-force`.
- **One folder per page; behaviour co-located, URL mirrors the tree.** `pages/`
  is the page tree: `pages/index.html` is the entrance, every other page is a
  folder with `index.html` + `index.js` beside it, nested pages are subfolders
  (`makePageServer`, §11.2). Markup stays declarative (htmx attributes only); no
  inline event handlers — imperative glue goes in the page's `index.js`.
- **Pages compose components; they are rendered through the engine.** A page is
  run through `renderPage` (§9), so it uses atomic component tags
  (`<app-header>`, a `<form>` of `<b-input>` + `<b-button>`) — never raw,
  class-laden markup. Raw HTML belongs *inside* a component's own `.html` (it owns
  its markup); the page layer stays clean and semantic.
- **Pages are flat files; folders only group subpages.** `pages/home.html` → `/home`;
  a page with children becomes a folder (`profile/index.html` + `profile/settings.html`).
  Minimal JS may live in a `<script>` after the UI — `hx-on` scattered in markup is
  what's avoided, not a single script block.
- **One sitemap, three uses.** `createSitemap` derives routes from the `pages/` tree
  for the catalog's Pages nav, `/sitemap.xml`, and `/robots.txt` (§11.4) — add a page,
  it appears in all three.
- **Navigation is real document loads + native View Transitions.** No client
  router; inter-page nav animates via CSS cross-document view transitions
  (`@view-transition { navigation: auto }`, §11.3). htmx drives intra-page fragment
  swaps; the platform drives inter-page transitions. Reduced-motion honoured.
- **Keep `data-field`/`data-bind-*` markers in output.** Field names are not a
  secrecy boundary — keep non-public data out of the view model.
- **`HTMLRewriter`, not a parser library.** Native, zero-dependency, verified.
- **Components take config props** (any literal attribute beyond `data`/`each`):
  `<slot-tag prop-as>` swaps the element (polymorphism), `prop-attr-<x>` sets an
  attribute from a prop (variants). **Guardrail:** config places only a tag name
  or static value — never data logic. One `b-text` and one `b-button` cover
  all headings/text/links and all button variants.
- **Native Bun router; a route is a thin presentation adapter.** `/ui/*` returns
  HTML fragments (htmx); `/api/*` returns JSON (`Response.json`); both call the
  same service. No hand-rolled matcher, no duplicated logic.
- **Logic in the service, not the template.**

### Built-for-myself trims (deliberately deferred)

These were cut to keep the architecture focused; re-add when a real need appears.

- **No database / migrations** — in-memory placeholder; swap a real repository in.
- **No API-doc generator** — add when the JSON API has external consumers.
- **No auth / CSRF** — required before exposing write endpoints publicly; out of
  scope while building for yourself locally.

### Verified capabilities

- **Hot reload** — recursive `fs.watch` → `renderer.refresh()`; template edits
  appear on the next request, no restart (§12a).
- **No silent binding failures** — strict/warn modes report a missing path while
  leaving explicit `null` alone; `throw` makes a template/data mismatch a failing
  test (§9, §13).
- **Native routing + dual representation** — `/ui` HTML and `/api` JSON off one
  service, POST validation (400) and create (201), `:id` params (§11, §13).
- **Env-driven config** — one module keys dev/prod differences (§12a).

---

## 17. AI interaction layer (GRAIN) & design-system signal (2026-06-30)

The AI-interaction layer has its own name — **GRAIN** — and its own doc
(`docs/GRAIN.md`): a design system + framework an AI can operate. BATCH is its
**reference substrate** (no-build hypermedia), but GRAIN is **substrate-agnostic** —
`grain/` imports **nothing** from `batch/` (verified). It depends only on a small port
(`OpChannel` — `push(session, event, data)`), which BATCH's SSE hub satisfies
structurally; the implementation is injected by the composition root. Both are headed
for **separate repos** once the product ships. This section records the BATCH-side
additions that *can* back GRAIN (a substrate must provide an `OpChannel`, a renderer
that understands the binding vocabulary, and a filesystem — see `docs/GRAIN.md`).

This section records the **stack-level** additions made while building the product.
The product's own contracts are the SSOTs: **how the AI drives the UI** lives in
`docs/AI-INTERFACE.md`; the **visual identity** in `docs/DESIGN-SYSTEM.md`. Here we
document only the reusable mechanism and where it sits in the stack.

### 17.1 The one door + server push

The product inverts CRUD: the AI is the single writer, and a human click and an AI
decision resolve to the **same named action through one endpoint** (`POST /intent`),
never a privileged DOM back-channel. Because the AI acts on its own timeline (a
reasoner takes seconds; background workers fire unprompted), the server must **push**
to the page. Two pieces are reusable stack, the rest is app:

- **`framework/http/stream.ts` — `createStream()`**: a generic per-session SSE hub
  (`subscribe(id) → Response`, `push(id, event, data)`, `broadcast`). Zero app
  knowledge; carries opaque JSON. This is the one structural addition to BATCH —
  htmx stays for client-initiated reads, SSE adds server-initiated push.
- **`framework/render/accepts.ts` — `createAccepts()`**: harvests `data-kind` /
  `data-accepts` off component `.html` so the AI's manifest is a *projection of the
  real components* and can't drift (the "one source, four uses" property — catalog,
  CSS, sitemap, **and** AI manifest). A startup drift-guard warns if a component
  declares a verb the backend doesn't allow.

The app layer (`app/ai/*`, `docs/AI-INTERFACE.md`) holds the closed vocabulary
(`contract.ts` — `ActionName`/`SurfaceKind` unions + the `ACTIONS` registry, the
single source of truth for verbs and surface kinds), the single-writer interaction
layer, the reasoner boundary (a stub today, behind the real `Model` seam), and the
`/intent` `/stream` `/ai/manifest` routes. The one client-JS island,
`frontend/scripts/ai-dispatch.js`, turns clicks into intents and applies render ops
by semantic surface address (`data-surface`) — never by tag or CSS class.

> **The dual write paths (ownership decides the mechanism).** Mutations of
> AI-owned state go through the door; the **one sanctioned direct-to-storage
> exception** is category-1 *user ground-truth* (the knowledge base), which writes
> straight to a repository via plain htmx. There is no generic direct-write
> endpoint — the mechanism must match the data's ownership category, set at creation
> (see `docs/MVP.md`).

### 17.2 Two reusable seams added to the stack

- **`makePageServer(…, injectBeforeBodyEnd, injectBeforeHeadEnd)`** — appends a global
  asset before `</body>` (deferred islands: the ⌘K palette, the theming controls) and,
  via the head seam, before `</head>` (render-BLOCKING bootstraps that must run before
  first paint — the theme pre-set that stops the default-theme flash) on every rendered
  page. The platform-wide-asset seams. A page shell built outside the page server (the
  catalog) accepts the same pair via `createCatalog(…, { headEnd, bodyEnd })` — one
  source of global assets, no page drifts.
- **`makeStatic` binary content-types** — woff2/woff/svg are now typed correctly;
  fonts are served byte-exact from the composition root (a text read would corrupt
  them), so self-hosted fonts need no CDN.

### 17.3 Grade as signal (design system ↔ interaction)

Provenance/commit-state is a **cross-cutting concern carried by one inherited custom
property**, not per-component code (this is why atoms have almost no AI-specific
markup). An ancestor sets `data-grade` / `data-commit`; the type atom reads
`--type-font`; CSS inheritance distributes it. Self-hosted **Redaction** grades make
the texture real: clean = human, **grain (Redaction 50) = AI / in-transit**. AI
*speech* stays grain (provenance persists); a user's optimistic action settles to
clean on commit. Non-text atoms express the same state their own way (a button grows
a dashed "terminal" edge + block caret). See `docs/DESIGN-SYSTEM.md` §3 and
`docs/AI-INTERFACE.md` §5.

### 17.4 Catalog upgrades (still no-build)

`/catalog` now: pairs `<name>.md` (Human) with optional `<name>.ai.md` (AI) and a
per-component toggle swaps the *view*; groups the side-nav by atomic layer
(atoms/molecules/organisms) as collapsible dropdowns with a search filter; and
renders inline markdown (`code`, **bold**, links) in prose. The AI toggle re-grades
only the live previews, never the catalog's own chrome.

### 17.5 Status

`tsc` green (erasable, `verbatimModuleSyntax`); full suite passes; `/framework`
still imports **nothing** from `/app` (the new `stream.ts`/`accepts.ts` are generic);
all routes serve (`/`, `/about`, `/loop`, `/catalog`, `/components.css`,
`/ai/manifest`, `/search.json`, `/sitemap.xml`, `/robots.txt`, `/ui/loop`,
`/fonts/*`, `/scripts/*`); the `/intent` door returns 202 on a valid intent and 400
on an unknown verb; SSE confirms/rolls-back land over `/stream`. See §14.5.

---

## 18. Static export / prerender (opt-in — foreshadowed in §0.5)

An optional `dist/` export, layered **on top of** the running server — never a second
renderer. The server already produces final, component-expanded HTML; the exporter is a
**projection of it**: boot the app, enumerate routes, fetch each, write the bytes. If it
ever re-implements composition, it has become a build step and violated the stack's
premise ("the server is the no-build step", §0.5). It stays a crawler + writer.

The moving parts already exist: `createSitemap().routes()` (§11.4) enumerates every page;
`renderPage` (§9) emits plain HTML with all `b-*` tags expanded; `/components.css`,
`styles/*`, `/fonts/*` and `/scripts/*` are static. Headless drive is proven (`bun run shots`).

### The boundary (what is and isn't exportable)

The stack is request→render→swap, so an export freezes only the **initial document**.
Draw the line explicitly or the export silently ships broken pages:

- **Exportable — content pages.** Pages whose HTML is complete server-side: the entrance,
  editorial pages, and especially `/catalog` and `/grain` (the GRAIN showcase — fully-static output —
  live previews + copyable source, zero runtime data). These are the primary use case: a
  shareable, hostable design-system + component reference.
- **NOT exportable — operable surfaces.** Anything behind the one door: `/intent`,
  `/stream` (SSE), render ops (§17). These are dynamic by definition; a static copy has no
  backend to talk to. The AI loop cannot be a static file.
- **In between — pages with htmx reads.** A page with `hx-get="/ui/…" hx-trigger="load"`
  exports as a *shell* (`Loading…`) that XHRs a backend that isn't there. Handle via the
  two tiers below.

### Two tiers

1. **Shell export (trivial).** Walk `sitemap.routes()` + `/catalog` + the portfolio pages
   (`/`, `/grain`, served from `config.portfolioPagesDir`, not in the sitemap), fetch each,
   write `dist/<route>/index.html`; copy the referenced assets **plus the data routes islands
   fetch** — `/search.json` (⌘K palette), `/sitemap.xml`, `/robots.txt` — which are not linked
   assets a crawler of `href`/`src` would find. Correct for pages with no dynamic reads.
   **Absolute paths need a root-served host.** Every ref is absolute (`/styles`, `/scripts`,
   `/assets/sprite.svg`); they resolve fine on a **root** host (custom domain, a `user.github.io`
   repo, most CDNs) but **404 on a *project* GitHub Pages site** served under
   `user.github.io/<repo>/` — a subpath. To ship under a subpath the exporter must rewrite
   absolute→relative (or inject `<base>` / honor a `PUBLIC_BASE_PATH`). Never `file://` either
   (browsers forbid file-origin fetch, so htmx/asset loads fail — the web-platform limit §0.5
   documents).
2. **True prerender (phase 2, optional).** For each `hx-trigger="load"` target, also fetch
   its `/ui/*` fragment, inline it where the target sits, and strip the trigger — the page
   is then complete with no backend. This is the only tier that makes a data-backed page
   genuinely static.

### The export disposition of a route (the four buckets)

The stack is dual-mode by design: the **live server is primary** (§12), and the export is a
projection layered *on top of* it, never a replacement. So "can this app be static?" is not one
answer — it's a per-route question, and every route falls into exactly one of four buckets. This is
the rule an app with an API or a database needs before it exports.

The governing principle, stated once: **a route can be frozen only if its bytes are identical for
every visitor at build time.** Everything below is a corollary of that.

| Bucket | What it is | Export behavior |
|---|---|---|
| **Content** | HTML complete server-side, same for everyone (editorial pages, `/catalog`, `/grain`) | Freezes verbatim. The primary case. |
| **Operable** | behind the one door — `/intent` + SSE (§17) | Excluded (a static copy has no backend) — *unless* its scenarios are service-free, in which case the page opts into the **client-side door** (§19.3) and runs the same vocabulary in-browser. That is how `/grain`'s demo survives the freeze. |
| **Snapshot** | a data-backed read (`hx-trigger="load"` → `/ui/*`) whose data is the **same at build time** | Freezable via **Tier 2 prerender**: bake the fragment in once. A DB-backed page can be static *as a build-time snapshot* — explicitly not live data. (Tier 2 is designed, not yet built.) |
| **Dynamic** | per-request or per-user data, real writes, auth | **Cannot** be static. That route stays on a running server. |

So an app built with an API/DB is not "static or not" — it's a mix. Its content and snapshot routes
export to a CDN; its genuinely-dynamic routes keep the Bun server. The honest end-state is a **hybrid
deploy** from one codebase: frozen files where the bytes are invariant, a live server where they
aren't. Two consequences worth making first-class (tracked in ROADMAP Track B.9): Tier 2 needs
building before snapshot pages export complete instead of as `Loading…` shells, and a route should
eventually **declare its own bucket** rather than the export caller hand-maintaining the operable /
client-door sets (today they live in `tjakoen.github.io/tools/export.ts`).

### Placement

A reusable **`batch/export`** capability (not a project-local script), exposed as
`bun run export`. It boots a composition root, reads `sitemap.routes()` + a caller-supplied
allowlist, fetches over `localhost`, copies `config.assetDirs` + `config.fontsDir` verbatim,
and writes `dist/`. It lives in **`batch/`** on purpose: crawl-sitemap→write-files is a pure
substrate concern, so it must travel with the framework — then *any* BATCH site (the portfolio
and its `/grain` showcase, and others later) gets Pages hosting from the one tool, per BATCH's
extraction philosophy. No change to `batch/`/`grain/`/`project` runtime code — the export is an
outside observer, so it can't regress the live path. (See `tjakoen.github.io/docs/architecture/PLAN.md` piece 1, which drives
the first real use.)

### Status — Tier 1 shipped (2026-07-04)

Built exactly as the audit is (§ generic-engine-in-batch): the framework-generic crawler+writer is
**`batch/export/export.ts`** (`exportSite(config)` → `ExportReport`; imports only `node:fs`/`node:path`
+ global `fetch`, knows no vocabulary), and the app-specific **caller** is **`tjakoen.github.io/tools/export.ts`**
(`bun run export`) — it spawns `tjakoen.github.io/server.ts`, derives the page allowlist from
`createSitemap()` over **both** `config.pagesDir` and `config.portfolioPagesDir` (so `/grain`,
`/batch`, `/mill` come along) plus `/catalog`, drops the operable set (`/loop` and the
retired `/home`), and passes `config.assetDirs` + `config.fontsDir` as asset mounts. The pure
path/rewrite logic (the only branching) lives in `batch/export/rewrite.ts` with a colocated test.

What Tier 1 does:

- **Pages** → `dist/<route>/index.html` (pretty dirs); **generated data routes** (`/components.css`,
  `/search.json`, `/sitemap.xml`, `/robots.txt`) → written at their literal path; **assets** copied
  verbatim (binaries byte-for-byte; `*.test.*` skipped).
- **The absolute-path/subpath problem** is solved by rewriting every root-absolute ref
  (`href`/`src`/`action`, CSS `url()`, JS `import`/`fetch` specifiers, JSON `"url"` fields) to a
  caller-supplied **`PUBLIC_BASE_PATH`** — the "rewrite absolute→relative" option above (kept
  absolute-under-a-prefix, which is what a subpath host needs; `<base>` can't help because absolute
  URLs ignore it). `PUBLIC_ORIGIN` swaps the crawl origin (`localhost`) into `sitemap.xml`/`robots.txt`;
  if unset, the export warns rather than baking in `localhost` silently. Default (no base path) targets
  a **root** host.
- **The exportable boundary is enforced, not just documented.** After writing, the engine scans every
  exported page for internal links that resolve to nothing it wrote and **warns, listing them** — so
  operable surfaces excluded by the caller (`/loop`, `/intent`, `/ai/manifest`) surface as a
  confirmable list instead of shipping as silent dead links. (It also caught a pre-existing broken
  doc-example image in `figure.md` — since fixed to point at a served grain asset.)

Known Tier-1 limitations (honest): the export needs a *server* — opening `dist/index.html` via
`file://` renders unstyled because every asset ref is root-absolute (that's what hosts need; the
export log says so); `sitemap.xml` still lists the operable `/loop` route
the static site doesn't include — it's the server's sitemap frozen as-is (projection, not re-render);
and runtime-constructed URLs in JS (string concat) aren't base-path rewritten. **Tier 2** (true
prerender of `hx-trigger="load"` targets) remains deferred — build only when a data-backed page must
be genuinely static.

---

## 19. No-build client modules & the client-side runtime (opt-in — foreshadowed in §0.5)

### 19.1 The primitive — "the server is the build step", now for the browser too

Bun already runs the stack's TypeScript **on the server** with no build step — transpile-on-*execute*.
§0.5's premise ("the server is the no-build step") had one asymmetry: the browser still got
hand-written `.js` islands, because a browser can't run `.ts`. **`batch/http/modules.ts`
(`makeModuleServer`) closes that gap: it serves any `.ts` module to the browser transpiled on
*request*.** `GET /modules/grain/ai/contract.ts` → browser-ready JS. Relative imports inside a module
resolve by URL and are transpiled the same way, recursively — no import rewriting, because source
uses explicit `.ts` extensions under `verbatimModuleSyntax`. It is ephemeral (no bundler, no artifact,
no dependency graph on disk), which is why it is *not* a build step in the sense §0.5 forbids — it is
the same transpile-on-demand philosophy, now symmetric across server and client.

This is feasible **only because the stack is zero-runtime-dep** (§ non-negotiables): there is no
`node_modules` graph to resolve, so `Bun.Transpiler` (a builtin) is the entire toolchain.

The immediate, non-speculative win: today the islands can't import the real vocabulary, so they
**re-declare verbs as string literals** kept honest only by the boot-time drift-guard warning
(`server.ts`). With client modules, an island imports the real `contract.ts` — **one source of truth
reaches the browser, the drift-guard workaround retires.** (Proven end-to-end: a browser imports the
live `contract.ts` and reads `ACTIONS` with no build.)

### 19.2 THE CLIENT-SAFE BOUNDARY (communicate this — it is the whole safety story)

Serving code to the browser means the browser *runs* it and anyone can *read* it. A module is safe to
ship through `/modules` **only if all three hold.** This boundary is load-bearing and must be stated
wherever client-side mode is offered (docs, page UI, the tool that flags a module):

1. **No server-only imports** — no `node:*`, `bun`, `fs`, `path`, no third-party. **Enforced
   mechanically:** `makeModuleServer` scans imports (`findServerOnlyImports`) and, on any bare
   (non-relative) specifier, refuses the module — replacing it with a throwing stub whose message
   names the offending import, so the failure is **loud in the browser console, never silent**.
2. **No secrets** — API tokens, keys, credentials. **Not auto-detectable**; the developer's
   responsibility. Keep secrets in server-only modules + env, never in anything reachable from a
   `/modules` root. Treat every client module's full source as public.
3. **No server-required behavior** — real persistence, multi-user authority, live external APIs. If
   the logic needs a server, its client-side form is a **demo/replay, not the real thing.**

**In one line: `/modules` and the client-side runtime are for static-style pages and self-contained
logic. Anything that needs a server or holds sensitive data stays server-side.** This is exactly the
same boundary §18 draws for the static export — client modules just move the line for *logic* the way
export moves it for *pages*.

### 19.3 The client-side runtime (the door, in the browser) — opt-in, built

The door is already port-shaped: `createInteractionLayer({ reasoner, stream, service… })` pushes
`RenderOp`s to an **`OpChannel`** port (batch's SSE hub satisfies it structurally, §17). So running
the door **in the browser** is a *wiring* change, not a rewrite:

- Replace the SSE `OpChannel` with an **in-process (loopback) channel** that hands ops straight to the
  dispatcher's `applyOp`.
- Replace `POST /intent` with a **direct call** to the in-browser door.
- Run the reasoner (the stub, or an in-browser small model — see the lightweight-model track) and the
  service (ephemeral / `localStorage`) client-side.

The result, for a static host like the portfolio: **a human and an AI operate the same closed
vocabulary through the same door, applied by the same dispatcher, with no backend** — the thesis, made
hostable. It stays **opt-in** because it ships framework JS (the door + reasoner + registry), which
trades against the native-first byte budget (§0.5) — right for a showcase surface, wrong for content
pages. Selecting server-door vs client-door is a **composition-root** choice (`tjakoen.github.io/server.ts`);
`batch` only provides the mechanism (the module server + a generic loopback channel), knowing nothing
of the door or the vocabulary.

**Layering:** the module server + loopback channel are `batch` (substrate, vocabulary-agnostic); the
client-door wiring is `grain/ai/*` (it knows the door); the mode switch + which reasoner/state/surfaces
is `project`/`portfolio`. Static export (§18) freezes the transpiled modules into `dist/` (transpile-
at-export), so an operable-static showcase ships as plain files.

**Status:** §19.1–19.3 **built + tested (2026-07-04)**. The module server serves an all-`.js`
browser-facing graph (a `.js` URL falls back to its `.ts` source; relative specifiers rewritten
`.ts`→`.js`) — required because static hosts serve `.ts` files with a non-JS MIME type that browsers
refuse for ES modules; dev and the frozen export use the same URLs. The client door itself is
`grain/ai/client-door.ts` (the loopback `OpChannel` → the dispatcher's `applyOp`); the dispatcher's
transport seam is `<body data-ai-transport="client">`; the export freezes the door's module graph via
`exportSite({ moduleEntries })` and the caller stamps the marker via `transformPage`
(`tjakoen.github.io/tools/export.ts`). The live server path is unchanged — pages without the marker keep the
server door (verified both ways).