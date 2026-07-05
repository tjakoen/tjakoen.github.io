# MILL mermaid→SVG + theme-tokened figures

## Context

MILL renders ```` ```mermaid ```` blocks as escaped `<pre>` text — ~22 diagrams across 9 files (notes + batch/docs) show raw mermaid source on the live site. FIGURES.md calls mermaid→SVG "MILL's critical path"; mill/PLAN.md lists it as a deferred capability. Second problem: the hand-authored SVG figure scaffold bakes a fixed e-ink palette, so figures ignore dark mode and theme flavors.

**Goal:** (1) MILL converts mermaid blocks to inline SVG server-side, styled with grain semantic tokens so diagrams follow both theme axes (`data-color-scheme` light|dark × `data-theme` sourdough|baguette|brioche) live. (2) The hand-authored SVG scaffold + existing note figures move to token refs with e-ink fallbacks.

**Settled decisions (user-approved):**
- Live serve route renders on cache miss via Playwright (already a devDep), SVG cache **committed** to the repo keyed by content hash → CI/deploy/export never needs chromium.
- MILL core stays zero-dep + synchronous. Renderer = injected **port**; playwright dynamic-imported only inside the renderer module; `mermaid` added as root **devDependency** (npm, not vendored).
- FIGURES.md scaffold updated to `var(--color-*, fallback)` pattern **and** existing note figures migrated.
- Build happens in a separate worktree (Opus session).

## Architecture

Parsing needs zero change — fences already produce `{type:"code", lang:"mermaid", value}` ([mill/core/markdown.ts:40-49](mill/core/markdown.ts#L40-L49)). MILL block handlers are synchronous, mermaid is async — so an **async pre-pass** resolves diagrams before the sync render, and a `blockOverrides.code` handler injects them:

```
request → source.read(slug)
        → prepareDiagrams(raw, renderer)        // async: parse, find mermaid nodes, await SVGs (cache-first)
        → renderGrainDocument(raw, adapter+override)  // sync: code handler looks up source→svg map
        → chrome → compose → Response
```

Double-parse (pre-pass + render) accepted: parser is a tiny hand-rolled subset, files are small.

### New files (mill)

**`mill/diagrams/prepare.ts`** — zero-dep, the port + pre-pass:
```ts
/** Render diagram source to SVG markup, or null = can't/failed → caller falls back to <pre>. NEVER throws. */
export type DiagramRenderer = (lang: string, source: string) => Promise<string | null>;

/** Parse raw md, collect code nodes whose lang the renderer handles (mermaid), await renders. */
export async function prepareDiagrams(raw: string, render: DiagramRenderer): Promise<Map<string, string>>; // source→svg

/** Compose a code blockOverride: mermaid + svg present → <figure class="figure" data-variant="diagram">svg</figure>;
    otherwise delegate to the existing/default code handler (incl. any consumer override). */
export function withDiagrams(adapter: GrainAdapterOptions | undefined, svgs: Map<string, string> | undefined): GrainAdapterOptions | undefined;
```

**`mill/diagrams/cache.ts`** — zero-dep disk cache decorator:
```ts
/** Wrap a renderer with a committed disk cache. Key = sha1(lang + "\0" + source + "\0" + VERSION_TAG),
    file `<dir>/<key>.svg`. Hit → read file, never call inner. Miss → inner; on non-null result write file.
    Inner unavailable/failed → null (fallback, never throw). */
export function cachedRenderer(dir: string, inner: DiagramRenderer): DiagramRenderer;
```
`VERSION_TAG` = mermaid package version + a token-map revision constant — bump the constant when the sentinel→token mapping changes to invalidate committed SVGs.

**`mill/diagrams/mermaid-playwright.ts`** — the heavy renderer (isolated; only file touching playwright/mermaid):
```ts
export function createMermaidRenderer(): DiagramRenderer & { close(): Promise<void> };
```
- Lazy singleton: first call `await import("playwright")` → `chromium.launch()` → blank page → `addScriptTag({ path: Bun.resolveSync("mermaid/dist/mermaid.min.js", process.cwd()) })` (UMD → `window.mermaid`). Browser lives for the process (dev server long-lived); `close()` for tests/tools.
- If the dynamic import or launch fails (no chromium, CI): log once, return `null` forever after — page still serves with `<pre>` fallback.
- Per diagram: `page.evaluate` → `mermaid.render(id, source)` with **deterministic id** `mill-d-<hash8>` (content hash — cache-stable output). Invalid mermaid source → catch → `null`.

### Theme styling: sentinel→token substitution

Initialize mermaid with `theme: "base"` + explicit `themeVariables` set to unique sentinel hexes; post-process the SVG string replacing each sentinel (hex, case-insensitive, plus its `rgb(r,g,b)` form) with a `var()` ref. Inline SVG inherits CSS custom properties from `<html>`, so one cached SVG re-colors across all six theme combos with no re-render.

| mermaid themeVariable | sentinel | replacement |
|---|---|---|
| `background` | `#000001` | `transparent` |
| `primaryColor` (node fill) | `#000002` | `var(--color-surface)` |
| `primaryTextColor` | `#000003` | `var(--color-fg)` |
| `primaryBorderColor` | `#000004` | `var(--color-line)` |
| `lineColor` (edges/arrows) | `#000005` | `var(--color-muted)` |
| `secondaryColor` | `#000006` | `var(--color-accent-soft)` |
| `tertiaryColor` | `#000007` | `var(--color-bg)` |
| `edgeLabelBackground` | `#000008` | `var(--color-bg)` |
| `clusterBkg` | `#000009` | `var(--color-bg)` |
| `clusterBorder` | `#00000a` | `var(--color-line)` |
| `fontFamily` | `"MILLFONT"` | `var(--font-smooth)` |
| `textColor` | `#00000b` | `var(--color-fg)` |
| `mainBkg` | `#000002` (same as primary) | — |

(Implementing agent: verify exact variable names against installed mermaid version's `theme-base`; set every variable we care about *explicitly* — unset ones get lighten/darken-derived colors that won't match sentinels. Any residual baked hex after replacement → log a warning listing the leftover hexes so the map can grow.)

- **Keep mermaid's scoped `<style>` inside the generated SVG.** FIGURES.md's "no `<style>`" rule exists for hand-authored SVG passing GitHub's sanitizer; MILL-generated SVG is injected into our own HTML post-render, never sanitized. Document this distinction in FIGURES.md.
- Grade guardrail ([mill/core/grade.ts](mill/core/grade.ts)) checks `data-commit`/`data-grade="grain"`/`is-ai` — mermaid output can't trip it; guardrail keeps running on the full document including SVGs.

### Wiring

**`mill/serve.ts`** — add `diagrams?: DiagramRenderer` to `MillServeDeps` (shared by all collections). Entry branch ([serve.ts:215-230](mill/serve.ts#L215-L230)):
```ts
const svgs = deps.diagrams ? await prepareDiagrams(raw, deps.diagrams) : undefined;
const doc = renderGrainDocument(raw, withDiagrams(c.adapter, svgs));
```
Index route unchanged (frontmatter only).

**`tjakoen.github.io/content.ts`** — compose the renderer once, pass into `createMillRoutes`:
```ts
const diagrams = cachedRenderer("tjakoen.github.io/diagram-cache", createMermaidRenderer());
```
Cache dir: **`tjakoen.github.io/diagram-cache/`** (committed `.svg` files + a short README.md explaining key scheme + regeneration). All three collections benefit — the key is content-hash so batch/docs diagrams cache in the same consumer-owned dir.

**Warm tool** — `tjakoen.github.io/tools/warm-diagrams.ts`: iterate the three collections' sources, run `prepareDiagrams` on every entry with the cached renderer, print rendered/cached/failed counts, `close()` the browser. Root script `"diagrams": "bun tjakoen.github.io/tools/warm-diagrams.ts"`. Run it once during the build to populate + commit the cache (22 diagrams). Export needs nothing new: it freezes live output, and the live output now contains SVGs (cache hit, no chromium).

**Deps** — root `package.json`: add `"mermaid"` to devDependencies. `mill/package.json` stays dep-free; mill/README documents that the mermaid renderer module requires the consumer to install `playwright` + `mermaid` (post-split note).

### Figure presentation

`figure.css` ([grain/components/molecules/figure/figure.css](grain/components/molecules/figure/figure.css)): add `data-variant="diagram"` styles — `max-width:100%`, inner `svg { max-width:100%; height:auto }`, `overflow-x:auto` so wide flowcharts scroll, tokens only. Update `figure.md` doc per CONVENTIONS §4. No figcaption (mermaid has no caption source; the italic prose caption stays the convention).

## FIGURES.md scaffold rewrite + figure migration

Scaffold root palette becomes token refs with e-ink fallbacks (theme-following on site, identical old look on GitHub/preview where grain tokens don't exist):

```
--paper:var(--color-surface,#faf7f1);--edge:var(--color-line,#e6ddd0);--ink:var(--color-fg,#2b2b2b);
--muted:var(--color-muted,#6b6259);--bar:var(--color-line,#cbc1b3);--accent:var(--color-accent,#d97757)
```
Also drop the hardcoded `font-family:Georgia…` to `font-family:var(--font-smooth,Georgia,'Times New Roman',serif)`. (Implementing agent: eyeball `--bar` mapping in dark mode — if `--color-line` reads too faint as a bar fill, use `var(--color-muted)` at reduced opacity or pick a better Layer-2 token; verify against [grain/styles/variables.css:92-108](grain/styles/variables.css#L92-L108).)

FIGURES.md edits:
1. Scaffold snippet + token table gain the fallback-carrying form; add a line explaining the dual-render contract (site = theme, GitHub = e-ink fallback).
2. Rendering-reality table: mermaid row "MILL / published site" → **yes — MILL renders mermaid→SVG server-side, theme-tokened**; delete the "MILL dependency (open…)" paragraph, replace with a short "how it renders" note (committed cache, `bun run diagrams` to warm).
3. Document the `<style>`-inside-generated-SVG distinction (hand-authored rule unchanged).

Migrate existing hand-authored inline SVGs in `tjakoen.github.io/notes/*.md` (grep `<svg` — the three reference figures in `ten-times-zero.md` and any others): mechanical replacement of each SVG root's palette declaration + font-family with the new form. Verify each page in light + dark after.

## Tests (3 tiers per CONVENTIONS §6)

- **Unit** (`mill/diagrams/*.test.ts`): `prepareDiagrams` finds multiple mermaid blocks and only mermaid; `withDiagrams` falls back to default `<pre>` for non-mermaid langs, missing map entries, and composes over an existing consumer `code` override; `cachedRenderer` — hit skips inner, key changes with source and VERSION_TAG, inner-null not cached; sentinel replacement as a pure function (feed fake SVG containing sentinel hex + rgb forms → all replaced, leftover-hex warning path).
- **Integration** (`mill/serve.test.ts` additions): route with a fake `DiagramRenderer` returning `<svg data-fake>` → response contains `data-variant="diagram"` figure with the SVG and no `<pre data-lang="mermaid">`; fake returning null → `<pre class="code-block" data-lang="mermaid">` fallback, page 200; grade guardrail still green.
- **E2E** (`tjakoen.github.io/e2e/`): one check — a note with a diagram (e.g. `/notes/why-i-teach`) serves an inline `<svg>` inside `.figure`, in both `data-color-scheme` values (cache committed, so no live chromium render during the test run beyond Playwright itself).

## Docs sync (root CLAUDE.md table)

- `mill/PLAN.md`: un-defer mermaid→SVG (lines ~69, ~159-161, ~255) — tick it in "What MILL gives you" with the port/cache design one-liner.
- `mill/README.md` + `mill/CLAUDE.md` (built-so-far list): diagrams module + consumer requirements.
- `tjakoen.github.io/standards/FIGURES.md`: as above.
- `ROADMAP.md` Track C: tick the mermaid item.
- `tjakoen.github.io/CONTENT-BACKLOG.md`: close the tracked "MILL dependency" item.
- Root `package.json`: `mermaid` devDep + `diagrams` script.
- Memory: write one recording the port design, sentinel technique, committed-cache decision.

## Build order

1. `mill/diagrams/prepare.ts` + unit tests (pure, no deps).
2. `mill/diagrams/cache.ts` + unit tests.
3. `mill/serve.ts` deps + entry branch; integration tests with fake renderer.
4. `mermaid` devDep; `mill/diagrams/mermaid-playwright.ts` (sentinel init + post-process + leftover-hex warning); pure-function tests for the substitution.
5. `grain` figure diagram variant CSS + `figure.md`.
6. `tjakoen.github.io/content.ts` wiring + `tjakoen.github.io/tools/warm-diagrams.ts` + root script; run warm → commit `tjakoen.github.io/diagram-cache/`.
7. FIGURES.md rewrite + migrate note SVGs.
8. E2E test; docs sync; memory.

## Verification

- `bun run check` + `bun test` green.
- `bun run diagrams` → 22/22 rendered (or explicit failures listed), cache files appear.
- `bun run dev` → visit `/notes/why-i-teach`, `/notes/origin-story`, `/batch/docs/architecture`: diagrams render as SVG; toggle dark scheme + all three themes — diagrams AND migrated hand-authored figures re-color; no leftover baked-hex warnings in server log.
- Delete one cache file, reload page → re-renders via chromium, file reappears (miss path). Rename chromium away / simulate import failure → page still serves with `<pre>` fallback (degradation path).
- `bun run export` → exported note HTML contains inline SVGs (projection holds).
- `bun run shots` if visual confirmation for the user is wanted.

## Risks

- **Mermaid derived colors**: unset themeVariables get computed shades that dodge sentinels → some baked hex survives. Mitigated by explicit variable coverage + the leftover-hex warning; grow the map iteratively against the 22 real diagrams.
- **mermaid UMD path** (`dist/mermaid.min.js`) differs across major versions — verify against the installed version; ESM fallback: `addScriptTag` with `type: "module"` + import shim.
- **`--bar`/`--color-line` visual mapping** needs a human eye in dark mode.

