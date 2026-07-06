# Portfolio site — plan

> The **cross-layer what-next** (including the convergence-first framing for `/grain` and `/batch`,
> Track D) lives in [`../ROADMAP.md`](../ROADMAP.md); this file stays canonical for the portfolio.

> Status: **planned, not built.** A personal portfolio — a **custom BATCH + GRAIN** site that
> **uses MILL** (my markdown CMS) to manage its markdown content: the notes/blog *and* the rendered
> BATCH/GRAIN docs — deployed **free and zero-ops** to GitHub Pages via GitHub Actions.
> The site doubles as the strongest possible proof the stack works: it's AI-first design served
> as plain static files, with a lightweight AI demo that runs entirely in the visitor's browser.

## The core constraint (why this plan exists)

BATCH has **no build step** because it renders **live at request time** (`Bun.serve` per-request
page render, runtime-built `/components.css`, SSE). "No build" is *not* the same as "static" —
there's no `dist/` sitting around to host. GitHub Pages serves only static files, and GitHub
Actions is a CI runner (ephemeral jobs, killed when the workflow ends) — neither can host a
persistent process.

**So: to ship on Pages for free, we must *add* the export step BATCH deliberately omits** — a
prerender crawl that boots the app, walks its routes, and writes static files.

## Decisions (2026-07-01)

- **Host: GitHub Pages, own repo, free + zero-ops.** No container, no always-on server.
- **Add a prerender/export step** → produces a static `dist/` from the live app. Everything a
  portfolio shows (pages, `/components.css`, `/catalog`, `/search.json`, `/sitemap.xml`, fonts,
  assets) is a plain GET and prerenders cleanly. The live-only surfaces (`POST /intent`, `/stream`
  SSE) do **not** come along — see the AI demo decision for how we sidestep that.
- **Build the export as a reusable BATCH capability** (`batch/export`), not a one-off script.
  Rationale: it's a pure-substrate concern (crawl sitemap → write files), it fits BATCH's
  extraction philosophy, and any BATCH site — this portfolio (with its `/grain` showcase and
  future `/batch` section), and others later — gets free Pages hosting from the same tool. The
  portfolio repo only needs the workflow YAML.
- **Content is markdown; MILL renders it into GRAIN pages; export freezes them.** Two *different*
  markdown sources, resolved differently (this is the split-safe model):
  - **Portfolio-owned content** — the Notes stream + long-form posts (see [FEATURES.md](FEATURES.md)) —
    lives as **`.md` files (+ images) in the portfolio's own repo**, so the site is maintained by
    *editing content, not HTML*.
  - **Layer docs** — grain's `docs/GRAIN.md` + `AI-INTERFACE.md` (→ `/grain/docs`) and batch's
    `docs/ARCHITECTURE.md` + `CONVENTIONS.md` (→ `/batch/docs`) — are **NOT copied into the portfolio
    repo.** They ride along inside the installed grain/batch packages and MILL resolves them straight
    from there (`import.meta.resolve('@tjakoen/grain/docs/…')` — today that resolves to the sibling
    `grain/docs/` folder in the monorepo; post-split it resolves into the git-dep). So the docs are
    **always synced to `#main`** via `bun update`, with zero drift and no duplicated files. The one
    enabling task lives in each layer's `package.json` `exports` map (`./docs/*`), staged now. See
    [`../SPLIT-PLAN.md`](../SPLIT-PLAN.md) § "Layer docs travel inside the package". The renderer is **MILL**, promoted from "a content
  route inside the BATCH app" to its **own top-level project** (memory: portfolio-cms-separate-project).
  - **Definition — MILL = "Markdown In, Living Layouts"** *(canonical plan: [`mill/PLAN.md`](../mill/PLAN.md); this is the consumer view)*: a **standalone, reusable, open-source CMS**.
    Feed it `.md` + images and it renders **GRAIN** pages on the theme. It is the **fourth top-level
    project** alongside `batch/`, `grain/`, `project/`, `tjakoen.github.io/`, and it **depends on GRAIN (its
    components) and BATCH (the substrate), never the reverse** — a new layer *above* both
    (`batch → grain → MILL`), an **extension of neither** (the ARCHITECTURE + CLAUDE.md layering
    diagrams were updated to note this concern this pass). **The portfolio is MILL's first consumer** —
    a custom BATCH + GRAIN site that **uses MILL only for its *content*** (the Notes/blog + the
    rendered BATCH/GRAIN docs); the portfolio's own surfaces (hero desk, calendar, etc.) are bespoke
    BATCH + GRAIN work, not MILL's. MILL *enhances* the portfolio; it doesn't build it.
  - **How it runs here (this is the reconciliation):** MILL renders **live on the BATCH app at request
    time** — a content route parses frontmatter and renders the `/notes` index + each `/notes/:slug`
    permalink (and the `docs/*.md` pages) through GRAIN. The `batch/export` crawl then **projects**
    those to static like any other page. So MILL is the *renderer*, mounted in the live app — **not** a
    separate build-time re-render. This keeps the static-export principle intact: *export is a
    projection of the running server, not a second renderer that could drift* (memory:
    static-export-decision). "When we build the static page, GRAIN renders the mds into pages" = the
    export freezing what MILL already serves live.
  - **Consequence — one content source, many consumers:** the same mds render the human Notes pages,
    are chunked into `knowledge.json` for the AI's RAG ("the desk is aware of my posts", free), and
    (for `docs/*.md`) publish the doc pages. Authoring = commit: edit a `.md` → the Action reboots the
    app, crawls, deploys. Backlog + content model live in `tjakoen.github.io/CONTENT-BACKLOG.md`.
- **AI demo: Path B — runs entirely in the browser, no backend, no secret.** Purpose: answer
  questions about me from my fixed portfolio content. It's a portfolio *showcase*, so the "the
  assistant is running in *your* browser, nothing server-side" narrative is worth real weight.
- **No API key ever ships.** GitHub/Actions secrets are **build-time only**; a static site has no
  server at request time to hold a key. Baking a key into client JS = publishing the key. The
  runtime touches no model API — inference happens locally in the visitor's browser.
- **Target: a tiny local generative model (WebLLM), grounded on my content (RAG).** A small
  instruct model (e.g. SmolLM2-360M / Qwen2.5-0.5B / Llama-3.2-1B, ~250MB–800MB quantized, cached
  after first load) runs client-side via WebGPU and generates the answers. Accepted tradeoffs
  *because this is just a portfolio demo*: a big first-load download and a WebGPU-capable-browser
  requirement.
- **It must be grounded, not freewheeling.** A sub-1B model knows nothing about me and will
  hallucinate, so we retrieve the relevant portfolio chunks and put them in the prompt (RAG). The
  model only *phrases* facts we hand it — retrieval does the real work, the model makes it
  conversational.
- **AI is an enhancement, never a requirement (grain philosophy).** The portfolio is a **fully
  usable plain-hypermedia site** with no AI at all — real nav, real content pages, real links
  (progressive-enhancement HARD RULE, see FEATURES.md). So the ladder degrades to *the real site*,
  never to a fake-AI imitation: load the generative model *iff* WebGPU is present; optionally a light
  **embeddings** retrieval tier (real semantic match via transformers.js ~20–30MB) where it genuinely
  helps; otherwise **gracefully drop the AI** and let the visitor browse/search the content as
  hypermedia. **Dropped: lexical/keyword "pseudo-AI" retrieval** — it imitates AI badly and isn't
  worth shipping. When the AI *is* present it queries the content and drives the **same UI
  interactions a human would** (one door / RenderOps), not a side chat.
- **The demo showcases GRAIN, not raw model horsepower.** The win is *presentation*: the question
  is answered by "the desk" — spotlight, grain text streaming in, settling to clean
  (grade-as-signal). A retrieval bot that *looks* like the desk thinking sells the design system
  better than a heavyweight LLM in a plain box.
- **Organizing concept: the site is a populated productivity app — Notes · Calendar · Contacts —
  with the desk as the assistant that operates them.** (See FEATURES.md "Organizing concept" for the
  full framing + the desk's "lamp on paper" visual.) It's chosen because a surface-dense suite is
  the strongest proof of the north star (every surface addressable + AI-operable), and it's the
  payload for the workspace archetype already in the tree. Consequences that shape *this* plan:
  (a) naming resolves to **`/notes`** (the content collection below renders `/notes` + `/notes/:slug`);
  (b) a **Calendar** view (talks + roles as a timeline) and a **Contacts** card (mailto + socials +
  vCard) join the route set — both static-safe (read-only render / static file); (c) the desk must
  be able to *operate* those views, which needs the **surface-vocabulary extension** in Pieces to
  build. Hard constraint from FEATURES anti-features: **structural + GRAIN-austere, never
  skeuomorphic app chrome** (the "lamp/paper/desk" is tokens + CSS on existing spotlight hooks, not
  imagery). Feasibility verified against the tree 2026-07-01 — the desk behaviour (travel, stream,
  settle, revise, offline-graceful interrupt) already exists in `grain/scripts/ai-dispatch.js`; only
  the two pieces below are genuinely new.
- **Docs = the `docs/*.md` we already maintain, rendered — not new prose (portfolio-wide).** Each
  showcase section splits into three doc modes, each on its own surface: **pitch** (the narrative
  showcase page), **component reference** (`/catalog` — grain only, auto-generated specimens), and
  **concepts / how-to-build** (rendered `docs/*.md`). grain publishes `docs/GRAIN.md` +
  `docs/AI-INTERFACE.md` at `/grain/docs`; batch publishes `docs/ARCHITECTURE.md` + `docs/CONVENTIONS.md` at
  `/batch/docs`. **These docs are the layer's own files, resolved from the installed grain/batch
  package (never copied into this repo)** — see the "Layer docs" bullet above. The vehicle is the
  **markdown content collection (piece 3)** — no new pipeline, no new prose. The showcase's concept
  sections are *teasers* that deep-link into these. Consequence, free: each source `.md` is at once
  the human docs page, the AI demo's `knowledge.json` (RAG), and the layer's own repo doc (content
  kept aligned with code by CLAUDE.md's alignment table) — one source, three consumers. See
  `GRAIN-PAGE.md` and `BATCH-PAGE.md`.

## Architecture at a glance

```
Build time (GitHub Actions — no secret needed; the model runs at runtime, not here)
  portfolio content (.md + images) ──▶ chunk (+ optional embeddings) ──▶ knowledge.json (RAG corpus)
  live BATCH app  (MILL renders .md ──▶ GRAIN pages) ──▶ batch/export crawl ──▶ dist/ (static HTML + CSS + assets)
                                                                                └─ + knowledge.json + chat island JS

Runtime (visitor's browser — pure static, no key, no backend)
  WebGPU present?
    yes ──▶ load tiny LLM (WebLLM) ─┐
                                     ├─▶ retrieve relevant chunks (RAG) ──▶ generate grounded answer
    no  ──▶ embeddings / lexical ───┘        └─────────────────────────▶ or surface the passage directly
                                                          │
                                                          ▼
                                            render through GRAIN
                                        (spotlight → grain text → clean)
```

The honest limits of the AI demo: on the generative path, first load is a few hundred MB (cached
after) and it needs WebGPU; answers are only as good as a sub-1B model grounded on my content.
On the fallback path it surfaces the most relevant passage rather than freshly-worded prose. All
paths are fully static, keyless, and controllable — fine for a showcase.

## Does the architecture already support this? (verified 2026-07-01)

Checked the whole tree against this plan. **No architectural blocker; two findings make it
better than assumed:**

- **Export is clean — rendering is deterministic.** `renderPage` (`batch/render/render.ts`) and
  `makePageServer` (`batch/http/pages.ts`) take only a pathname and produce byte-stable HTML — no
  per-request headers/cookies/query/time/random. So crawl-and-write Just Works. Gaps to handle in
  the exporter (not blockers):
  - `createSitemap` (`batch/http/sitemap.ts`) walks only `config.pagesDir` `.html` files — it
    **misses the portfolio pages `/` and `/grain`** (served from `config.portfolioPagesDir`) and
    every non-HTML GET. The exporter needs an **explicit allowlist**: `/components.css`,
    `/catalog`, `/search.json`, `/sitemap.xml`, `/robots.txt`, `/ai/manifest?screen=…`, plus the
    portfolio pages (`/`, `/grain`).
  - Static assets are plain directory copies via `config.assetDirs` (`/styles`, `/vendor`,
    `/scripts`, `/assets`) + `config.fontsDir` (binary woff2) — copy them into `dist/` verbatim.
  - The boot-and-fetch seam already exists: `tjakoen.github.io/tools/screenshots.ts` spawns the server and
    waits for the port. The exporter reuses that pattern.
  - Data-driven fragments (`/ui/loop`, `/api/items`) freeze at build time to whatever the seed
    data is — fine for a portfolio; just be aware they're snapshots, not live.
- **The AI demo reuses the REAL vocabulary — the dispatcher isn't coupled to SSE.** `applyOp()` in
  `grain/scripts/ai-dispatch.js` is a pure `(RenderOp) → DOM` function; SSE is just one caller.
  And `chat.send` + a `chat-log` surface **already exist** in `grain/ai/contract.ts`. So the local
  model emits the same `RenderOp`s (`append` the user bubble → `type` grain tokens → `type {done}`
  to settle → optional `spotlight`) into the same dispatcher. We get grade-as-signal, streaming,
  and the spotlight for free — the demo is the genuine protocol with the **reasoner** swapped
  (server stub → in-browser WebLLM) and the **transport** swapped (SSE → local emit loop).
  - **Small enabling refactor:** today `applyOp` lives inside `ai-dispatch.js` alongside the
    `EventSource` wiring. Extract `applyOp` (+ the timing constants `TYPE_MS`/`SETTLE_MS`/`HOLD_MS`
    from `grain/ai/reasoner.ts`) into a shared module both the SSE path and the local chat island
    import. Per CLAUDE.md's alignment table, touching the dispatcher means updating the **e2e**
    tier — budget for that.
  - **Layering stays clean:** the chat island lives in `grain/scripts/` (reusable, AI-first, like
    `cmdk.js`); the portfolio supplies the app-specific `inference()` (the WebLLM instance) and the
    RAG lookup. Nothing portfolio-specific leaks into the framework, so extraction stays clean.

## Pieces to build

1. **`batch/export`** (in the batch-stack repo) — boot the app (reuse the `screenshots.ts` spawn +
   wait-for-port seam), enumerate routes = sitemap `.html` pages **+ the portfolio pages (`/`,
   `/grain`) + an explicit allowlist** (`/components.css`, `/catalog`, `/search.json`, `/sitemap.xml`, `/robots.txt`,
   `/ai/manifest?screen=…`), fetch each, and copy `config.assetDirs` + `config.fontsDir` verbatim
   into `dist/`. Ship with a test (per CONVENTIONS §6).
2. **Extract a shared `applyOp` module** (GRAIN) — pull `applyOp` + the timing constants out of
   `grain/scripts/ai-dispatch.js` into a module both the SSE path and the chat island import.
   Enables the demo to reuse the real presentation machinery. Touches the dispatcher → update the
   **e2e** tier (CLAUDE.md alignment table).
3. **MILL — the standalone Markdown→GRAIN CMS** (its own top-level project, **not** a `batch`
   capability; memory: portfolio-cms-separate-project). Reads `.md` files + images with frontmatter
   (`title`/`date`/`type`/`photos`) from a content dir and renders GRAIN pages: mounts a content
   route on the live BATCH app for the **`/notes`** index (newest-first, category-filterable) + each
   **`/notes/:slug`** permalink (and the `docs/*.md` pages). Export (piece 1) freezes these like any
   page; RAG prep (piece 4) reads the same mds. MILL stays framework-generic (no portfolio-specific
   fields) and depends only on GRAIN + BATCH — the portfolio is its first consumer. Includes:
   scaffold the `mill/` project folder, move the md→pages rendering there, and update the
   ARCHITECTURE + CLAUDE.md layering diagram (3→4 layers).
4. **Build-time RAG corpus prep** — a script that reads portfolio content (incl. the feed mds) and
   produces a static `knowledge.json` (content chunked for retrieval, optionally with precomputed
   embeddings). No secret needed — the model runs at runtime, not here. Output is static.
5. **The chat island** (`grain/scripts/`) — WebGPU capability probe + WebLLM loader (with a
   download-progress UI) + RAG retrieval over `knowledge.json` + the fallback ladder. It **emits
   real `RenderOp`s** (`append` user bubble → `type` grain tokens → `type {done}` settle →
   optional `spotlight`) into the shared `applyOp` — reusing `chat.send`/`chat-log` and
   grade-as-signal rather than a bespoke UI. The portfolio supplies the `inference()` fn; nothing
   app-specific lives in the island. No runtime API calls; weights load from a CDN or `dist/`.
6. **The portfolio content + pages** — composed from GRAIN components on the default theme (or a
   re-skin via token override). The actual "about me / projects / contact" material; also the
   source the RAG corpus is built from. Drops in the island via a `<script defer>` + a
   `<div data-surface="chat-log">`.
7. **GitHub Actions workflow** — install Bun → build `knowledge.json` → run `batch/export` →
   publish `dist/` with `actions/deploy-pages`. (Add a `CNAME` if a custom domain comes later.)
8. **Surface-vocabulary extension for the productivity apps** (GRAIN) — so the desk can *operate*
   Notes/Calendar/Contacts, not just chat. Add `notes` · `calendar` · `contacts` to `SurfaceKind`
   in `grain/ai/contract.ts` (+ any new verbs in `ACTIONS`/`accepts`), a reasoner branch per verb,
   and the tests (**unit** on the reasoner + **integration** on the door path), then sync
   `docs/AI-INTERFACE.md` — the full CLAUDE.md alignment-table row. The dispatcher already targets
   any `[data-surface]` and the spotlight already travels, so no `ai-dispatch.js` change is needed
   beyond piece 2's extraction. *This is one of only two genuinely-new pieces the concept adds.*
9. **The productivity views + the desk "lamp on paper" skin** — the `/calendar` view (talks + roles
   as a timeline rendered from the same content mds) and the `/contact` Contacts card (mailto +
   socials + a downloadable `.vcf`), both static-safe; plus the desk's rest→wake→write→settle look
   as **CSS on existing hooks** (`.ai-backdrop` / `.ai-spotlit` / `.is-click` / grain tokens / serif
   grain face — no new machinery). Keep it structural + GRAIN-austere per the anti-feature guardrail.
10. **The site-wide companion + Navigate by AI** (FEATURES: "Navigate by AI") — the hero desk *docks*
    into a corner **grain companion** on the rest of the site (same entity minimized; ⌘K
    summons/expands it), and it carries the menu. "Navigate by AI" = the client companion maps a NL
    request → the matching nav link and drives **`spotlight{click}`** to pulse it like a real click
    (`ai-dispatch.js:73`, `contract.ts:79`) before the page loads — **no new `/intent` verb** (nav
    stays plain hypermedia per memory: interaction-door-pattern). Hard rule: a real, always-visible
    `<nav>` of plain links is the source of truth and the companion is a **disclosure wrapping that
    same `<nav>`** — so it degrades to normal navigation when the model/WebGPU/JS is absent. Only new
    code: the client-side NL→link mapping (lives in the RAG island) + the docking CSS. Guardrail: not
    a support-widget bubble (anti-features).

## Portfolio shell — the unified app-shell frame (decision 2026-07-04)

**Decision: the whole portfolio adopts ONE persistent app-shell** (the `/loop` layout) as its
frame — not editorial pages beside a workspace, but *one workspace everywhere*. This commits fully
to the workspace archetype (memory: `workspace-archetype-decision`, `portfolio-productivity-app-concept`)
and absorbs pieces 8–10 below.

- **Layout (loop's two nav surfaces):** left **`side-rail` = primary nav** (sections), top
  **`tab-bar` = the current section's leaf pages**, right sidebar = **chat (assistant)**, bottom =
  **terminal (console)**. Chat + terminal **persist across every page** (view-transition
  persistence) — the home for the site-wide AI to be plugged in later. Any "Watch the AI act"
  narrates into that *one* shared chat + terminal (no per-page terminal).
- **Nav map:** `TJ's Desk` (home) · `Notes` (blog) · `Calendar` (social feed) · `Mail` (contact) ·
  `BREAD Stack` → { `BATCH` [docs · architecture] · `GRAIN` [catalog · whitepaper · **loop** ·
  **themes**] · `MILL` }. Rail carries a **grouped/expandable** variant for the BREAD nesting; the
  leaf pages are the tabs. `/loop` stays a **full-page functional demo**, mounted as the GRAIN loop
  tab. Nav is **plain hypermedia** (real `<a>`, always-there `<nav>` fallback — static-safe, SEO).
- **Right sidebar = one `sidebar-panel` primitive** (header / body / footer, optional mode-tabs),
  unifying today's `app-shell__aside` (assistant) and `.catalog-peek`. Default mode = **Chat**; on
  GRAIN it gains **Catalog ⇄ Chat** tabs, and in Catalog mode the footer (where the chat input sits)
  shows "Hover an element to see its entry / View full catalog". Toggle lives in the **topbar** next
  to "Desk Online", consistent on every page. **BUILT 2026-07-04:** grain grew the generic
  mode-tabs/panes mechanic (`sidebar-panel.md`, `shell.js` `data-shell-mode`); the frame's aside
  carries the Chat + Catalog panes (tabs GRAIN-section only); `.catalog-peek` (the fixed overlay)
  is retired — Catalog mode widens the aside grid column, so content shifts, never overlaid.
- **Theming (tokens only, `grain/styles`) — BUILT 2026-07-04:** `base → [data-theme] → [data-color-scheme]`
  (orthogonal axes; the axis refactor + `theme.js` + the accent wiring landed this pass). Three themes
  ship: **Sourdough** (default, hueless), **Baguette** (clean, soft-blue accent), **Brioche** (warm,
  honey-gold accent) — plus the **one-signature-hue accent** (`--color-accent`, full reach: links /
  focus / `::selection` / primary button; success+danger stay monochrome; DESIGN-SYSTEM §2). Two topbar controls sit
  side by side, site-wide: a **light/dark toggle** (`data-color-scheme`, defaults to
  `prefers-color-scheme`) and a **theme-cycle toggle** that rotates the flavor through the available
  themes (Sourdough → Baguette → Brioche → …). In addition, a **Themes tab** under GRAIN is the
  *showcase* — each theme listed with a description + live preview + a "Use this theme" button. Both
  persist (localStorage); `theme.js` reads the flavor list from `<html data-themes="…">` so the cycle
  is consumer-configurable. Pure token flips — **the live
  proof of "re-skin by token override, never edit components"**; `grade-as-signal` survives every
  theme+dark (conformance tests). Client-side view preferences (static-safe), not the door.
  - **Deferred (planned, memory `grain-drivable-demos` + `grain-demo-page-structure`):** the catalog /
    design-system section also **shows the colors as swatches** and offers a **token playground with
    live sliders** (+ CSS export) — the human moves the same sliders the AI does (a shared surface,
    no special API). Built later, on top of the theming tokens above.
- **Accent color — full support, ONE signature hue** *(decided 2026-07-04; being wired in a parallel
  thread — do not edit grain CSS/components/DESIGN-SYSTEM here until it lands):* GRAIN gains a single
  optional accent slot (`--color-accent` + derived `-contrast`/`-hover`/`-soft`) with **full reach**
  — links, focus rings, `::selection`, and the **primary button fill** (the one brand knob a product
  sets). The palette otherwise stays **closed**: only *one* accent, and success/danger remain
  monochrome (weight/treatment, never their own hues). **Sourdough (default/main) keeps
  `--color-accent = var(--ink)` → hueless**; accented themes (Baguette blue, Brioche honey) opt in.
  It needs a **one-time wiring** (points those spots at the token, fixing a hardcoded-`--ink`
  focus-ring smell); after that every accented theme is a pure token override. The **"one signature
  hue" doctrine** gets documented in `DESIGN-SYSTEM.md` + the `variables.css` token comment so no one
  adds a second hue or colors error states. **3 default themes planned:** Sourdough (default, warm
  e-ink, hueless), a clean/Notion theme (suggested **Baguette**), and a third (suggested **Brioche**;
  alts Pumpernickel/Rye). Names for #2/#3 still open.
- **Separation of concerns:** shell **primitives** (rail incl. grouped variant, `tab-bar`,
  `sidebar-panel`, `console`, `topbar`) live in **GRAIN**, persona-neutral ("the AI", never "the
  desk"); the **portfolio frame** (composition with the BREAD nav + "TJ's Desk" branding) and any
  **custom theme/components** live in **`tjakoen.github.io/`** — new `tjakoen.github.io/components/` (register in
  `componentRoots`/`styleRoots`) + `tjakoen.github.io/styles/` (a token-override sheet, new `assetDirs`
  prefix). Consumer path documented in [grain README §6](../grain/README.md).
- **AI is UI-now, model-later:** build the shell + chat/terminal UI now; on the static deploy the
  chat rests gracefully (site fully usable as hypermedia). The in-browser LLM (Path B, pieces 4–5
  above) drops into this same chat surface later — nothing built now is thrown away.
- **Supersedes / reframes:** piece 10's *corner-companion* → the persistent right-sidebar chat
  (no docking); Calendar = *social feed* (was talks/roles timeline); the `/grain` `.surface-term`
  + `.catalog-peek` retire into the shared `console` + `sidebar-panel`.

**Build order:** (0) capture — this section + `GRAIN-PAGE.md` + ROADMAP Track D; (1) GRAIN theming
tokens + `theme.js` + grade conformance; (2) GRAIN shell primitives (`sidebar-panel`, `console`,
grouped `side-rail`, `topbar`) with conformance tests; (3) portfolio frame + BREAD nav; (4) migrate
pages (`/`, `/grain` w/ tabs incl. Themes, `/batch`, `/notes`, `/loop`-tab), retire the standalone
peek/terminal, re-point e2e; (5) wire chat to the door (dev/live), browser LLM as its own follow-on.

## THE EDITOR — the whole site as one editor window (owner, 2026-07-04 — CURRENT; supersedes the
## desk-scene and cards drafts below, kept for the record)

**The concept:** the portfolio IS an editor. The owner is a developer; the workspace archetype is
already built; lean all the way in. The **entire site lives inside one app window** — a consistent
frame on every page — and the main page is the editor's **Welcome page** (the VS Code start screen,
re-spoken in GRAIN). PoC approved by the owner (screenshots:
`screenshots/welcome-poc-dark.png` / `-light.png`; live at `/welcome-poc`).

**The frame (site-wide, one design language):**
- **The window**: the app boxed in a bordered, radiused frame on a darker backdrop — title bar up
  top (a three-dot cluster drawn austere: one filled + two hollow ink circles, never colored
  traffic lights; a centered mono title "TJ's Desk — <page>"), print-style solid offset shadow.
- **Tabs = page navigation** (the topbar tab-bar we restyled): the site's sections as open
  editor tabs, consistent on every page.
- **Rail** = the explorer (icon gutter already built) · **aside** = the assistant (already built)
  · **console** = the terminal (already built).
- **STATUS BAR** (new bottom row): the meta-controls move DOWN into it — they are status, not
  content. Left: `✶ desk online` (presence — real: client door loaded), `0 ⊘ · 0 ⚠` (make it
  HONEST: bake real tsc/test counts at export time), `main` (bake the built-from commit).
  Right: theme cycle (shows current flavor name), scheme toggle, ⌘K hint.
- Still GRAIN: tokens only, hairlines, mono status text, grade-as-signal untouched, the lamp
  travels these surfaces like any others, one door unchanged. Re-themes across
  Sourdough/Baguette/Brioche for free.

**The Welcome page (`/`)** — the PoC layout, promoted: grain-face title + "I direct, Claude
types" one-liner; **Start** (Ask the desk · Read the notes · See the BREAD stack · Open the
workspace · Get in touch); **Recent** = the notes feed, LIVE from MILL frontmatter (titles, mono
paths); **Walkthroughs** = showcase cards with badges + meters (give meters honest semantics);
pill CTA + a FUNCTIONAL "Show welcome page on startup" checkbox (unchecked → `/` lands on the
workspace next visit, localStorage).

**Implementation order:**
1. **Grain shell primitives** (generic, persona-neutral): `app-window` (frame + title-bar) +
   `status-bar` as CSS-only components with `.md` docs; the app-shell grid grows the two rows.
   ⚠ TOUCHES HOT FILES (`app-shell.css`, then `portfolio-frame.html`) — do this AFTER the current
   sessions' uncommitted work lands; single-thread the shell overhaul, don't worktree it.
2. **Portfolio-frame overhaul**: compose window bar + status bar; relocate topbar-ctl; tabs
   become site navigation (decide: fixed section tabs vs "open pages" metaphor — start fixed).
3. **Welcome page**: promote `/welcome-poc` to `/` with components in `tjakoen.github.io/components/**`,
   live Recent (MILL), wired Ask-the-desk (focus the assistant composer; scripted desk answers
   via the `data-ai-door` seam), functional startup checkbox.
4. **Honest status**: export bakes commit sha + tsc/test counts into the status bar (they're
   real at freeze time — "the site practises what it preaches").
5. **Cleanup**: delete `/desk-poc` + `/welcome-poc` after promotion; update FEATURES.md desk
   section; product pages (`/dashboard`, `/loop`) adopt the same window frame via app-frame.
6. Mobile: the window frame collapses (no backdrop padding, no title bar or a slim one); the
   existing drawer behavior stays.

**Still in force from the earlier drafts:** scripted client-door brain behind `data-ai-door`
(v1), WebLLM/RAG later behind the same `Reasoner` seam; aside = the assistant everywhere;
progressive enhancement hard rule (everything is real links, zero-JS navigable); the lamp +
`[data-lamp-origin]` seam (the welcome page can still declare the presence glyph as the light's
origin). The desk-SCENE below is superseded — its PoC receipts (VT morph pair, lamp origin) stay
valid mechanisms available to this design (e.g. tab-content morphs).

### THE EDITOR — owner revisions (2026-07-05) + build state

**Shipped (2026-07-05):** grain `app-window` + `status-bar` primitives (app-shell grew the
`window`/`status` rows); portfolio-frame carries the full window on every page (content pages
too, via the MILL chrome); tabs = SITE nav (Welcome · Notes · GRAIN · BATCH · MILL · Workspace,
subpage-aware `aria-current`); `/` = the Welcome page (Recent fed LIVE from MILL frontmatter via
`<welcome-recent each>`; "Ask the desk" focuses the composer via `data-shell="focus-chat"`;
startup checkbox functional — unchecked, `/` reopens the last-open page, workspace fallback);
honest status baked at export (real `git` ref + tsc/test counts into `[data-build-info]` /
`[data-build-ref]`); PoC pages deleted. Owner revisions folded in, superseding the section above
where they differ:

- **Title bar owns the controls** (VS Code): left = functional window dots (**red × close ·
  ochre ⌫ clear-cache · moss ‹ back**, hover-revealed, tooltips — the one sanctioned traffic-light
  exception, DESIGN-SYSTEM §2) + theme cycle (with flavor name) + scheme toggle + aside/terminal
  view toggles; **center = the ⌘K search field** whose placeholder is the open page's breadcrumb
  (`site.js`). The status bar does NOT carry the theme controls (revised from the plan above).
- **Status bar** = honest presence (`✶ desk waking…/online/offline`, driven by the dispatcher's
  outcome-stamped `<body data-ai-online>`) + build info + repo ref, then right: the made-with-AI
  byline + Contact. **Offline degradation:** door fails → `desk offline`, the composer disables
  with "The desk is offline" (site.js); repo ★ count fetched client-side, hidden if unreachable.
- **Catalog⇄Chat sidebar modes are SITEWIDE** (the /grain-only gating removed).

**Backlog (owner ideas 2026-07-05 — captured, not built). CANONICAL expansion + build order:
[`DEMO-PLAN.md`](DEMO-PLAN.md) (handoff doc — includes the prompt→GRAIN generator and the
theme builder; this list stays the one-line index):**
1. **/grain demo = the whole interface** (not a demo-box island): default prompt "See what TJ has
   been up to" → the AI travels the real pages (lamp), reads the latest notes, then **writes a
   summary into its notepad**. Simulated through the client door first; the live model slots
   behind the same `Reasoner` seam and must SKIP writing what's already there (idempotent runs).
   When the desk is offline, /grain shows a **backup Demo tab** with the scripted demo-box run.
2. **The AI's NOTEPAD in the rail**: a markdown⇄rendered toggle pane (client-side render — reuse
   MILL's framework-agnostic core through the client-module server; no native browser md), content
   persisted to localStorage. Doubles as the "add to my notes" target.
3. **Notes-aware chat**: on `/notes/*` the composer placeholder becomes "Summarize this page"; a
   summarize run spotlights the whole page, scrolls as it reads, replies in chat; every AI reply
   offers **"add to my notes"** → the AI writes a condensed version into its notepad. Needs new
   verbs in `contract.ts` (e.g. `page.summarize`, `note.append`) — walk the full alignment row.
4. **Thinking vs talking split** (doctrine, already mostly true): reasoning narrates to the
   TERMINAL (console surface); the CHAT is only for talking to the person (the mini thinking box
   stays as the bridge).
5. **Page-view counter** in the status bar (👁): needs a mechanism a static host can serve
   (GoatCounter-style or GitHub-Pages-compatible endpoint) — unresolved, don't fake it.
6. **Scroll-away content footer** on every content page: hairline + Contact / Résumé / license
   line ("Made by Tjakoen Stolk · Apache-2.0"); terms/privacy links only once those pages exist
   (the export's dead-link guard stays green).
7. Walkthrough meters were dropped (a meter that measures nothing is decoration); they return
   only with real semantics.

### THE EDITOR v2 — EXPLORER + open tabs (owner, 2026-07-05 — BUILT same day, branch portfolio-terminal)

**The concept:** complete the editor metaphor. One **global tab strip** of *open pages* (VS Code
open-editors model) replaces the per-section tab groups; the left sidebar gains an **EXPLORER
file tree**; the rail becomes the activity bar. Navigation stays pure hypermedia — tabs are a
client-side *projection* of where you've been, never an SPA.

**The tree shows REAL files (the honesty play).** No invented filenames: every tree item maps to
the actual source that produces the page — notes are literally their `.md` files, landing pages
their real page sources. "The site is its own source tree" — the strongest version of the pitch,
and on doctrine with the honest status bar. Sketch:

```
tjakoen.github.io/
  welcome.html            ← /            (pinned tab)
  notes/
    ten-times-zero.md     ← /notes/ten-times-zero
grain/
  README.md               ← /grain
  docs/ …                 ← /grain/docs/*
batch/
  README.md               ← /batch
```

- **Tree = a grain organism** (`file-tree`, persona-neutral); portfolio composes it with its
  manifest. Folders are `<details>/<summary>` — native, zero-JS collapse; **directories ship
  COLLAPSED by default** so a deep notes/ archive stays scannable.
- **Bottom of the panel — the APP links** (fixed, not files; the things that aren't documents):
  **Calendar · Mail · Catalog · Profile** (Profile = the renamed About; where the actual
  tjakoen.github.io/résumé lives — final name owner's call, "Profile" fits the editor metaphor).
  They open as **app-style tabs** (icon + name, no extension — VS Code's Settings-tab idiom).
  The aside's Inspector/Catalog *mode* stays (hover-inspect); the bottom Catalog link is the
  full page.

**Open tabs (progressive enhancement, hard rule):**
- Every tree item and tab is a real `<a href>`; navigation = full page load. On load, shell JS
  reads the localStorage tab list, appends the current path if new, renders the strip. Extends
  the existing last-open-page mechanism (startup checkbox) — one system.
- **First tab = Welcome, pinned, no ×.** Other tabs get **×** (the close affordance): remove
  from the list; closing the ACTIVE tab navigates to the previous tab, Welcome fallback.
  Tab close is a **shell concern** (like the view toggles), not an `Intent` — no new verbs v1;
  a `tab.open` verb (so the lamp can open pages) is a later alignment-row job.
- Zero-JS fallback: server-rendered strip shows the fixed section tabs (today's markup); tree
  still navigates. **Overflow:** the strip scrolls horizontally; no preview-tabs /
  close-others / middle-click v1. **Mobile:** tree = the existing drawer; strip scrolls.
- **Dirty dot** (later, with the notepad): a page with unsaved notepad content shows ● in
  place of × — the VS Code dirty indicator, honest.

**Breadcrumbs become links:** every crumb segment (status bar + the ⌘K field's placeholder
context) is a real `<a>` — folder segments go to their section landing. Same paths as the tree:
one vocabulary. **⌘K doubles as Quick Open:** fuzzy-match over the tree's file paths.

**Build order (Opus session):** ① grain `file-tree` organism (+ `.md`, tokens, collapsed
`<details>` folders) → ② tab-strip shell logic (localStorage list, pinned Welcome, ×
semantics, overflow) → ③ portfolio-frame rewire (explorer panel + bottom app links + global
strip replaces `data-tabs-for` groups; app-shell grid grows the explorer column) → ④ linked
breadcrumbs + ⌘K Quick Open → ⑤ e2e (open/close/persist/zero-JS fallback). ⚠ Steps ②–③ touch
`portfolio-frame.html` / `shell.js` / `site.js` — HOT files shared with the interactive-terminal
thread; land those after it merges (tree component itself is worktree-safe).

**Build receipt (2026-07-05):** all five steps landed (grain `file-tree` + `scripts/tabs.js` w/
drift guards; frame rewired; linked crumbs + ⌘K URL-matching; e2e `editor-tabs.e2e.ts` +
`terminal.e2e.ts`, stale suites re-aimed). Deviations from the spec above: the zero-JS strip
shows only the pinned Welcome tab (the explorer does the navigating — simpler than freezing the
old section groups); the startup redirect became SESSION-scoped (else the pinned Welcome tab
bounced); docs entries are static in the tree (real-case filenames beat slug-derived lowercase),
notes/ fills live from the corpus. Bonus root-cause fix: the mobile drawer's `position: fixed`
was silently lost to side-rail's later `position: relative` (bundle order) — the rail had been
falling into grid flow on mobile; app-shell now wins by specificity, with a comment.

### THE EDITOR v3 — activity bar, nav polish, presence-gated AI (owner-approved, BUILT 2026-07-06)

v2 dropped the VS Code icon column when the explorer replaced the old nav rail (a regression). v3
brings back an **activity bar**, restructures the tree, polishes labels/icons, and closes three
resilience gaps. Built after the portfolio consolidation landed (same hot files).

- **Activity bar** — a new grain organism (`activity-bar`, CSS-only, persona-neutral): a slim icon
  column mounted as the first child of `.app-shell__rail`, sibling of a now-nested `.side-rail`.
  Explorer toggle at top (reuses the existing `rail-toggle` binding — zero new JS), app links
  (Calendar · Mail · Catalog · Profile) at the bottom, icon-only. **Not a 4th grid column** — it
  rides the rail's existing track + mobile drawer; opted in with one `:has()` rule in app-shell.css
  (a shell without one is byte-identical). Rejected-alternative recorded in `activity-bar.md`.
- **Tree restructure** — grain/batch/mill nest under a `bread/` group; `index.html` entries dimmed
  (`data-variant="index"`, the directory carries the meaning) and labeled by section
  (`data-tab-label` → the open-tabs strip shows "GRAIN", never "index.html"). Pinned Welcome tab
  gains a **pin icon** (`.tab__pin`, always visible = "doesn't close").
- **Accent reach** — the rail brand mark + the presence star (`.presence__star`, its own element)
  join the accent (hueless under Sourdough, a hue under Baguette/Brioche).
- **Persistence** — x-ray (`grain.xray.on`) and the terminal open-state (`grain.shell.console-open`)
  now survive MPA navigation (per-island localStorage, try/catch). Prefs-helper verdict: stay inline
  until keys pass ~6 (ROADMAP B.6e(3)).
- **Graceful AI failure + presence gating** (the architecture piece — the contract the real model
  inherits at M★): **presence = transport health; offline = controls visibly disabled + honest copy;
  every pending trigger has a bounded lifetime.** Fetch timeout (AbortController on `POST /intent`),
  `es.onerror` release + re-arming `ready`, an independent pending-trigger **watchdog** (refreshed on
  each op, so a healthy multi-second run never trips it), and declarative gating
  (`body[data-ai-online="false"]` disables `[data-ai-run]`/`[data-ai-gate]`; the dispatcher no-ops
  `submit()` too). Documented in AI-INTERFACE §5f.

**Deviation receipt:** the approved tree preview showed `project/ → loop.html` top-level, but the
consolidation removed `project/` entirely — so `loop.html` sits under `tjakoen.github.io/`, no
`project/` node, no `/dashboard` entry (honesty rule: the tree mirrors real files). e2e retargeted
accordingly (`editor-tabs`, `portfolio-shell`, `mobile`, `grain-page`) + new suites
(`persistence.e2e.ts`, `ai-degradation.e2e.ts`). Gate: 165 unit + 71 e2e green.

#### THE EDITOR v3.1 — owner UI polish pass (BUILT 2026-07-06, uncommitted)

Owner feedback on the v3 chrome, two rounds:

- **TJ's Desk brand** relocated to a new grain-level opt-in mechanism: `.rail-head` (full-width row,
  same height as the tab rail) + `.rail-body` (wraps activity-bar + side-rail) — `app-shell.css`/`.md`
  + `activity-bar.md` updated. Brand sits at the SAME row as the tab strip, the sidebar (icon column
  + tree) starts on its own line below it. (First pass wrongly hoisted it into the window title bar
  — corrected per owner: "same line as the Tab rail not in the taskbar.")
- **Bottom app links** (Calendar/Mail/Catalog/Profile) moved out of the icon-only activity bar back
  into the side-rail's footer as labeled `nav-item`s (icon column + link column, restoring the pre-v3
  look) — `shell.js`'s current-section selector repointed at `.app-shell__rail` accordingly.
- **File-tree flattened to mirror the repo root 1:1**: `portfolio/` (renamed from `tjakoen.github.io/`
  — tree LABEL only, the real folder on disk is untouched), `batch/`, `grain/`, `mill/` as top-level
  siblings — dropped the fake `bread/` wrapper folder. `bread.html` now sits inside `portfolio/`
  alongside `index.html`/`notes/`/`loop.html`.
- **MILL/portfolio content padding regression fixed**: `.board` (the app-shell `__main` content
  wrapper, replaced `.container` during the v2/v3 refactor) had never gotten the padding rule —
  added to `grain/styles/global.css`, mirroring `.container`.
- **Terminal narration lines boxed** like chat bubbles (`.console__line` in `console.css`: border +
  radius + padding) instead of flowing as bare text.
- Status-bar byline/contact given an explicit `font-family: var(--font-mono)` (defensive — no actual
  override was found, but it closes the gap if one ever lands ahead of it in the bundle).

6 e2e files re-aimed for the new selectors/tree (`portfolio-shell`, `grain-page`, `mobile`,
`editor-tabs`). Gate: 165 unit + 71 e2e green, `tsc` clean. **Not committed** — working tree has 12
modified files, awaiting the owner's own commit.

#### THE EDITOR v3.2 — owner UI feedback (backlog, not built, 2026-07-06)

Owner round after v3.1. Note: item 1 **reverts** v3.1's boxed console lines (just shipped, owner
now says it hurt readability) — don't stack fixes, redo that spot.

1. **Terminal line display redo** — v3.1's per-line boxing (`.console__line` border+radius) made
   lines harder to read, not easier. Need a different narration format (not boxed-per-line).
2. **Chat-embedded terminal feels crowded** — box-per-**output** (one AI action/run = one box),
   not box-per-line; current per-line density reads too tight.
3. **Terminal full-height expand toggle** — a control to expand the console upward to fill the
   window, not just its current fixed band.
4. **`notes.html`** — its own page, look matching the site vibe. Ordering/categorization already
   exists in the data — owner says it should **reflect in the menu** (explorer tree / nav), not
   just on the notes page itself.
5. **"Close all tabs" action** — bulk-close the open-tabs strip; owner also wants tabs closable
   **from the sidebar/explorer menu**, not only from the tab strip itself.
6. **Search redo** — current ⌘K search needs rework, both functionally and to better match the
   VS Code vibe.
7. ✅ **BUILT (2026-07-06):** root cause was `app-window.md`'s own doc example — a live-previewed
   panel injecting a literal `<body class="app-window-backdrop">` into the catalog's DOM. HTML
   merges a second `<body>` tag's attributes onto the real document body, so visiting `/catalog`
   leaked that class (and its padding) onto the whole page — nothing to do with THE EDITOR shell
   at all. Fixed at the renderer (`catalog.ts`): `body`/`html`/`head` tags are swapped to `<div>`
   for the live-render only (the copy/paste `<pre><code>` stays byte-accurate). Also added an
   "Auto-generated by GRAIN…" line under the Catalog heading.
8. ✅ **BUILT (2026-07-06):** root cause was `portfolio-frame.css`'s `.rail-head > b-icon` selector
   — `b-icon` renders to `<svg class="icon">` (tag swapped at render time), so the selector never
   matched and `justify-self: center` never applied. Added the `.icon` fallback (the same dual
   selector `side-rail.css`/`nav-item.css` already carry for the same reason).
9. ✅ **BUILT (2026-07-06):** "Show welcome page on startup" checkbox renamed to "**on refresh**",
   defaulted to **unchecked**, and the logic now keys off an actual **refresh** (F5/reload) of
   `/` via Navigation Timing (`performance.getEntriesByType("navigation")[0].type === "reload"`),
   not the old once-per-session `sessionStorage` "booted" guard. A plain **navigate** to `/`
   (pinned Welcome tab, tab-close fallback, the logo) is left alone regardless of the checkbox —
   only a refresh honors it — because the naive "every load, checkbox or not" version broke the
   tab-close fallback (closing the active tab lands on `/`, which then immediately bounced right
   back to the last page, so the close looked like a no-op). Caught by e2e
   (`editor-tabs.e2e.ts` "active close falls back to a neighbor"), fixed in `site.js`.

The main page (`/`) is a **literal desk, drawn flat, viewed top-down** — the owner's vision,
reconciled with the anti-skeuomorphism guardrail: the guardrail forbids *photorealism/wooden-desk
PNGs*, not literalness. The scene is **token-drawn** (a "technical drawing / stationery flat-lay"):
uniform 1px ink hairlines (one stroke weight everywhere), the token palette only, typography as the
texture, print-style **solid offset shadows** (1–2px, zero blur), objects on a grid with one or two
deliberate rotations. If it starts reading as clip-art or MS Paint, stop and re-draw.

**The objects (each = a real `<a>` underneath + a `data-surface` the lamp can visit;
progressive-enhancement hard rule — the scene is fully navigable with zero JS/AI):**

- **The PAPER** — the ask line: ruled sheet, prompt + caret, suggested-question chips. The desk's
  own surface; the lamp pools here at rest.
- **The TABLET** (top-down, so a tablet — not a monitor/laptop) — lies flat, its screen shows a
  scaled mini-workspace **drawn with the real shell classes**; tapping it **morphs the screen into
  the actual workspace** via a cross-document View Transition (`view-transition-name: workspace` on
  the tablet screen ↔ `/dashboard`'s `.app-shell__main`). Non-supporting browsers fall back to
  plain navigation. This is the site's flagship native-first moment.
- **The PHYSICAL LAMP** — the assistant's body. Dark at rest; ask something and it clicks on: the
  iris opens **from the drawn lamp's head** (`[data-lamp-origin]` — grain's spotlight primitive
  reads it) and the light pool (the `.ai-lamp`) travels to the object that holds the answer. On
  other pages the lamp docks as the corner companion; ⌘K summons it — three faces of one thing.
- **The STICKY NOTE** (→ `/notes`) — carries the REAL latest note title, server-rendered.
- **The DESK CALENDAR** (→ `/calendar` later; card-only v1) — real month, real talk/role entries,
  server-rendered.
- **The ENVELOPE** (contacts) — mail · GitHub · LinkedIn · vCard.
- **The BREAD CARD** (the work) — BATCH · GRAIN · MILL; "this site is the proof".

**Decisions folded in (owner, same day):** the assistant panel starts docked/collapsed on `/` (the
desk IS the assistant there); **v1 brain = scripted scenarios through the client-side door** (chips
make scripted honest; the WebLLM/RAG tier slots behind the same `Reasoner` seam later);
calendar/contacts are on-page objects v1, full routes later. **Server-rendered real content on the
objects is fine** — pages compose server-side and the export freezes them (projection); authoring =
commit → Action re-exports.

**Narrow screens:** the scene reflows to stacked object-cards (same surfaces, same links — the
earlier cards wireframe IS the mobile layout). Wireframes: `screenshots/desk-scene-wireframe.png`
(the scene) + `screenshots/desk-wireframe.png` (the narrow/cards reflow).

**PoC — proven in-tree (2026-07-04), keep until the real page replaces it:**
`tjakoen.github.io/pages/desk-poc/` + receipts: (a) cross-document VT names verified on both sides
(tablet screen ↔ dashboard main pane, `startViewTransition` present); (b) the lamp iris wakes AT
`[data-lamp-origin]` (transition-suppressed initial placement — never glides in from center);
(c) the flat object language (hairline + offset-shadow `.desk-object`). Screenshot:
`screenshots/desk-poc.png`.

**Implementation order (for the next session; respect the seams, don't rebuild them):**
1. **The desk reasoner** — `tjakoen.github.io/ai/desk-door.ts` (client-safe: relative imports only, no
   secrets): exports `createClientDoor(applyOp)` wrapping grain's with a scripted desk scenario
   (4–6 chip questions; answers travel to the right object, stream grain, settle, RELEASE — grain
   lessons 6/7/9 apply). Page selects it via
   `<body data-ai-transport="client" data-ai-door="/modules/tjakoen.github.io/ai/desk-door.js">` —
   the module server already serves `tjakoen.github.io/**`; grain stays persona-neutral. Colocated test.
2. **The scene** — rebuild `tjakoen.github.io/pages/index.html` as the desk; object styling as
   portfolio components (`tjakoen.github.io/components/**` — site-specific, NOT grain). Server-render the
   sticky note + calendar content from data. Keep the desk-poc page until parity, then delete it.
3. **The morph** — `view-transition-name: workspace` pair (PoC already stamped `/dashboard`'s
   main pane); consider `::view-transition-old/new(workspace)` timing polish.
4. **Docking** — assistant panel collapsed on `/` (page-scoped for v1; proper frame/app-shell
   docking is a follow-up with the companion work).
5. **Export** — add `"/modules/tjakoen.github.io/ai/desk-door.js"` to `MODULE_ENTRIES` in
   `tjakoen.github.io/tools/export.ts`; verify the desk works on the frozen static build (chips + morph
   fall back gracefully).
6. Screenshots + `bun test` + `tsc` + the lamp-travel e2e still green; sync FEATURES.md's desk
   section to say "scene" (it currently says "restyle of live machinery" — still true).

## Open questions / next steps

- **Content first or scaffold first?** Decide whether to draft the portfolio content (sections,
  copy, projects) or stand up the export pipeline + empty shell first.
- **Which WebLLM model** — SmolLM2-360M (lightest) vs Qwen2.5-0.5B vs Llama-3.2-1B (best quality
  for the size). Balance download size against answer quality on grounded, short answers.
- **Where model weights load from** — a CDN (HuggingFace/MLC prebuilt) vs vendored into `dist/`
  (self-contained but hits GitHub's 100MB/file + repo/bandwidth limits). Probably CDN.
- **Fallback retrieval: embeddings vs lexical** — transformers.js embeddings (~25MB, semantic) vs
  plain keyword match (few KB). The generative path may reuse whichever for its RAG retrieval too.
- **Where the chat island lives** — grain vs. a portfolio-local component — and how the build-time
  `knowledge.json` step hooks into `batch/export`.

## Notes

- **This folder (`tjakoen.github.io/`) is a temporary home.** The portfolio moves to its own repo later,
  once the framework is solid enough to depend on. Develop it here against live BATCH + GRAIN;
  extract when stable. This is exactly why the export tooling lives in **`batch/export`** and not
  in the portfolio — it must travel with the framework so the portfolio (and any other BATCH
  site) can consume it after the split. Keep the portfolio importing only through BATCH/GRAIN's
  public seams so the extraction stays clean (nothing portfolio-specific leaks into the framework).
- **The GRAIN showcase now lives here, at `/grain`** (`tjakoen.github.io/pages/grain/index.html`) — moved
  out of `grain/` so the framework repo is just the framework. grain keeps `/catalog` as its own
  self-documentation; the narrative showcase is a portfolio section. See `GRAIN-PAGE.md`.
- **The BATCH showcase is the companion section, at `/batch`** — the pitch for the substrate
  (no-build, request-time render, one-vocabulary/one-door). No catalog (batch has no components);
  its reference layer is rendered docs at `/batch/docs`. Planned, built after `/grain` +
  the export pipeline. See `BATCH-PAGE.md`.
- **Course-platform landing page at `/course-platform`** (`tjakoen.github.io/pages/course-platform/`) — a
  single **showcase-only** page for an *external* project, the GitHub-native course platform
  (github.com/tjakoen/github-native-course-platform). Unlike `/grain` and `/batch`, it is **NOT a
  stack section and ships NO docs** — the full write-up lives in that repo's own README; this page is
  just a visual trailhead (screenshots + gifs) that links out. It's the same *pattern* as the other
  pages (a custom BATCH + GRAIN page composed from GRAIN components, export-frozen), but for a
  separate personal project rather than a layer of this stack. Distinct from the résumé's *technical
  projects* / *educator* notes, which describe it in prose — this is its own picture-led landing.
  Planned, not built.
