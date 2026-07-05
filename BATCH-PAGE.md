# BATCH showcase — plan (the portfolio's `/batch` section)

> Status: **planned, not built.** The BATCH section of the portfolio — the pitch for the
> *substrate* (Bun · Addressable · TypeScript · CSS · htmx; **no build step**, renders live at request
> time). Like `/grain`, it's a portfolio section served at **`/batch`** from
> `portfolio/pages/batch/index.html`, built *with* the stack it describes. Ships in the same static
> `dist/` export as the rest of the portfolio (ARCHITECTURE §18 — a crawler over the running
> server, not a second renderer), root-hosted on GitHub Pages (`tjakoen.github.io`). See `PLAN.md`
> and — for the identical docs approach — `GRAIN-PAGE.md`.
>
> Where `/grain` sells the *look + AI-interaction design system*, `/batch` sells the *engine under
> it*: why "no build" is possible, what request-time rendering buys you, and the one-vocabulary /
> one-door architecture that makes a human click and an AI decision the same `Intent`.

## Decisions (2026-07-01)

- **`/batch` is a portfolio section, not batch's own site** — same call as `/grain`. The framework
  repo stays just the framework; the narrative site lives in the portfolio that consumes it.
- **No catalog for batch — it has no components, it has concepts.** The `/catalog` specimen layer is
  grain's; batch's reference layer is **rendered docs** (below). The showcase is the pitch; the docs
  are the depth.
- **Docs = the `docs/*.md` we already maintain, rendered — not new prose** *(shared with
  `GRAIN-PAGE.md`)*. batch's two doc modes: **pitch** (this showcase — the idea, the "no build"
  claim, why it holds) and **concepts / how-to-build** (`docs/ARCHITECTURE.md` = the substrate's
  reasoning / single source of truth; `docs/CONVENTIONS.md` = the build standard — layering, components,
  tokens, the 3-tier testing bar). Publish those through the portfolio's markdown content collection
  (`PLAN.md` piece 3) at **`/batch/docs`**. The showcase sections stay *teasers* that deep-link into
  the rendered docs — never a fork of them. **One source, three consumers:** the same mds render the
  human docs page, feed the AI demo's `knowledge.json` (the desk can explain the architecture), and
  remain the repo docs kept synced by CLAUDE.md's alignment table.
- **Same hosting + static-export story as the whole portfolio.** No backend at runtime; the AI demo
  (if surfaced here) runs client-side. Absolute asset paths resolve because the portfolio is the
  root site. See `PLAN.md` "Hosting & static export."
- **Build after `/grain`.** grain is the visible flex and is already v1; batch is the "how it's
  built" companion. Stand it up once the export pipeline (`PLAN.md` piece 1) exists so it ships the
  same way.

## Persistent chrome (every section)

Reuses the portfolio's shared chrome (matches `/grain`): minimal top bar with the **BATCH** wordmark
+ tagline, a `demo` marker, `⌘K` (the global palette island), an **Inspect** toggle. No catalog-peek
sidebar here (nothing to peek — batch isn't a component library); instead, inline code + concept
callouts deep-link to `/batch/docs`.

## Sections (single scrolling page)

1. **Hero — the pitch.** "No build step. The server renders every page live at request time." The
   one-line claim that the whole section then earns.
2. **No build, and why that's not "no dist."** The core constraint: BATCH renders live
   (`Bun.serve` per-request render, runtime-built `/components.css`, SSE) — "no build" ≠ "static."
   The honest twist: to host *this* on Pages we *added* the export step BATCH deliberately omits
   (`batch/export`), and export is a **projection** of the running server, not a second renderer.
   (Nice irony to show, straight from `PLAN.md`.)
3. **One vocabulary → one door.** `grain/ai/contract.ts` (`SurfaceKind`/`ActionName`/`RenderOp`) →
   `POST /intent` → `RenderOp`s over SSE. A human click and an AI decision are the **same `Intent`**
   through **one door**; no privileged AI→DOM back channel. A small diagram.
4. **The four concerns, one direction of dependency.** Each layer builds only on those below:
   `batch` (substrate) → `grain` (design system) → `mill` (the CMS) → the consuming apps (`project`,
   `portfolio`); the composition root is the only place they're wired (`project/server.ts`). Import
   purity as a feature. Deep-links to `docs/CONVENTIONS.md` §1/§10.
5. **Atomic + tokens, live.** Server-side Atomic templating, `var(--token)` theming, htmx for
   reads/loads/nav. A compact "here's a route rendered live" example.
6. **The testing bar.** The 3-tier standard (unit / integration / e2e) as part of the build, not an
   afterthought — teaser into `docs/CONVENTIONS.md` §6.
7. **Footer.** Built on BATCH (self-referential); links (`/batch/docs` = rendered concept docs,
   `/grain` = the design system on top, repo); "this section is itself served by BATCH."

## Docs surface (`/batch/docs`)

Rendered from `docs/ARCHITECTURE.md` + `docs/CONVENTIONS.md` (and any future `docs/*.md`) through the
markdown content collection (`PLAN.md` piece 3) — the same pipeline that renders the feed and
`/grain/docs`. No bespoke markdown build; the live app renders the mds, the export freezes them.
Keep the showcase sections as summaries that link *into* these — the docs are the single source, the
page is the trailhead.

## Hosting & static export (GitHub Pages)

Identical to `/grain` (see `GRAIN-PAGE.md` "Hosting & static export" and `PLAN.md`): ships in the
one `dist/` via `batch/export`. The exporter must walk the portfolio pages (`/`, `/grain`,
`/batch`) explicitly — they're served from `config.portfolioPagesDir`, so `createSitemap` misses
them — alongside `/batch/docs` pages and the shared allowlist (`/components.css`, `/search.json`,
`/sitemap.xml`, `/robots.txt`).

## Build order

- **v1:** the pitch page — hero + no-build + one-vocabulary/one-door + three-layers + atomic/tokens
  + testing + footer, at `portfolio/pages/batch/index.html`; e2e in `project/e2e/`; a `batch` shot.
- **docs:** `/batch/docs` once the markdown content collection (`PLAN.md` piece 3) lands.
- **export:** rides `batch/export` (`PLAN.md` piece 1) with the rest of the portfolio.

## Keep it connected (so this doesn't rot)

This plan describes surfaces whose *content* lives elsewhere. When those move, this page and its
docs surface must follow — enforced by CLAUDE.md's alignment table:

- The concept docs it renders are `docs/ARCHITECTURE.md` + `docs/CONVENTIONS.md`. Editing the substrate's
  reasoning or the build standard → those docs update → `/batch/docs` re-renders them for free
  (it's a projection), but re-check that the showcase *teaser* sections still summarize them truly.
- Touching the contract / door / `RenderOp` vocabulary follows the existing contract rows in the
  alignment table; the "one vocabulary → one door" section here is downstream of those.
- Anything about hosting/export tracks `PLAN.md` + ARCHITECTURE §18.
