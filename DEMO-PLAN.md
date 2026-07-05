# DEMO-PLAN.md — the desk demos: using this portfolio to demonstrate GRAIN

**Handoff document.** Self-contained plan for the next wave of AI-facing features on the
portfolio — written to be picked up by another agent (or human) cold. This is the **canonical
plan for the demo track**; `PLAN.md` §THE EDITOR keeps the one-line backlog and points here.
Owner approved the shape 2026-07-05.

## Before you touch anything (non-negotiable)

1. Read `../CLAUDE.md` (the operating rules + the "change X → update Y" alignment table),
   `../grain/CLAUDE.md` **lessons 1–9** (each has bitten us at least once), and
   `../batch/docs/CONVENTIONS.md`. Pre-flight: `../ROADMAP.md`.
2. **Layering:** anything reusable goes UP into `grain/` (persona-neutral — "the AI", never
   "the desk"); the desk persona + site-specific work stays in `portfolio/`. MILL sits above
   both. Nothing imports upward.
3. **One door.** Every write — human or AI — is an `Intent` through the door
   (`grain/ai/interaction-layer.ts`); render back as `RenderOp`s. New capabilities = new verbs
   in `grain/ai/contract.ts`, then the FULL alignment row: reasoner branch → unit test →
   integration test → `AI-INTERFACE.md` vocab → manifest.
4. **Honesty doctrine:** AI text stays grain; simulated ≠ hidden (label scripted runs);
   status/counters show real numbers or nothing; a run must narrate (console) and must RELEASE.
5. Definition of done: code + right test tiers + docs synced + `tsc`/`bun test` green + memory.

## Where the site is today (2026-07-05)

THE EDITOR shipped: the whole site is one editor window (`grain` `app-window` + `status-bar`
primitives; `portfolio-frame` composes them). Tabs = site nav; Catalog⇄Chat sidebar sitewide;
`/` = Welcome (Recent live from MILL); status bar presence is honest (`<body data-ai-online>`
stamped by outcome; offline → composer disabled). Static export runs `/grain`'s demo through
the **client-side door** (`grain/ai/client-door.ts`, ARCHITECTURE §19.3) and bakes real
git/tsc/test numbers into the status bar. All routes export (21 pages). The scripted reasoner
(`grain/ai/reasoner.ts`) is the current "brain"; the real model lands later behind the same
`Reasoner` seam (ROADMAP M★).

## The enablement layer (build alongside piece 1 — everything else stands on it)

The owner's bar: *an AI should be able to work out, from the page alone, what it can do here*
("page has an email input and a send button → I can send mail from this page").

- **What it can do** = the **manifest** (`/ai/manifest?screen=…`) — already built, harvested
  from `data-kind`/`data-accepts`, drift-proof.
- **What the page says** = MILL **piece 4b** (`mill/PLAN.md`): per-page meta/JSON-LD,
  `llms.txt`, `knowledge.json` (RAG chunks), `data-surface` on content. Not built. This is the
  content half of every demo below — schedule it early.
- The combination is the "index of the possible" the reasoner (and later the live model) reads
  before choosing an action. GRAIN retrieval port design: memory `ai-content-retrieval-layer`
  (a `KnowledgeSource`/`retrieve` port in grain; corpus from MILL; model injected by consumer).

## The demos (build order)

### 1. The whole-interface /grain demo — "See what TJ has been up to"

Replace the demo-box island as the headline: the demo IS the site. Default prompt (a chip in
the composer): **"See what TJ has been up to."** The AI then, through the door, visibly:
travels the real pages (the lamp glides — reuse the spotlight/`RenderOp`s, lesson 1: never a
parallel mechanism), opens the latest notes (reads via the content layer), narrates its
*thinking* to the **terminal** (console surface), and finishes by **writing a summary into its
notepad** (piece 2). v1 = scripted scenario through the client door (`data-ai-door` seam) so it
runs on the static host; label it scripted. When the live model lands: the run must be
**idempotent** — if the notepad already covers the latest note, it says so and adds nothing.

**Offline fallback:** `body[data-ai-online="false"]` → /grain shows a **backup "Demo" tab**
running the old demo-box scripted walkthrough; chat stays disabled ("The desk is offline");
terminal stays hidden.

### 2. The AI's notepad (rail pane)

A notepad pane in the left rail: **markdown ⇄ rendered** toggle. No native browser markdown —
but MILL's core is framework-agnostic and BATCH serves client-safe TS to the browser
(`/modules`, ARCHITECTURE §19), so **run MILL's render engine client-side** for the preview
(respect the client-safe boundary: no secrets, no server needs). Content persists to
`localStorage`. It is a real `data-surface` with verbs (e.g. `note.append`, `note.replace`) so
the human AND the AI write through the same door — the AI's additions render grain, the
human's clean. This is the strongest symmetry demo on the site: *the AI's memory is a visible,
editable surface.*

### 3. Notes-aware chat: summarize + "add to my notes"

On `/notes/*`: composer placeholder becomes **"Summarize this page"**. A summarize run
spotlights the whole page (lamp), **scrolls as it reads**, replies in chat. Every AI chat
reply carries an **"add to my notes"** action → the AI writes a condensed version into its
notepad (piece 2's verb). Needs new contract verbs (`page.summarize`, `note.append`) — full
alignment row, conformance tests for release + narration (lessons 6–7).

### 4. Generate GRAIN from a prompt (the generator)

**Owner feature:** "generate GRAIN components or pages from a prompt." Two honest tiers:

- **Tier 1 (no model, ships now): composition generator.** GRAIN's components are a closed,
  machine-readable vocabulary (the catalog + manifest). A prompt like "a contact card with
  mail + GitHub" maps to a **selection problem** — pick components, fill slots, emit the
  `<b-…>` composition + copyable source. Structure carries the load (memory
  `lightweight-model-demo-strategy`: selection > generation; the harness holds the loop).
  Scripted/rule-based v1 is honest if labeled; render the result live in a sandbox pane
  (compose server-side via the real renderer, or client-side through the module server).
- **Tier 2 (with the model, after M★):** free-prompt → the model chooses from the same closed
  vocabulary; invalid choices are no-ops + reported (surface physics, memory
  `ai-modality-model`). The generator UI = split view: the prompt, the rendered result, and
  **"what the AI saw"** (the catalog/manifest slice it chose from) — dogfooding IS the pitch.

Place the mechanism in grain (persona-neutral "compose from vocabulary" engine) only if
another GRAIN product would want it (it would); the showcase page stays portfolio.

### 5. Theme builder (sliders + AI)

A `/grain` Themes-tab upgrade: sliders/pickers bound to the token slots (`--color-accent`,
paper/ink, radius…), live on the whole site, **export as a `[data-theme]` CSS block**. Every
slider is just a token override — and an AI driving a slider through the door is the same demo
as driving a checkbox (one vocabulary). Pairs with the theming axes (DESIGN-SYSTEM §2).

### 6. Manifest inspect overlay (cheap, do early)

A toggle (⌘K entry / status-bar control) that overlays **what the AI sees** on the current
page: outlines every `data-surface`, chips the verbs each accepts, links to `/ai/manifest`.
One CSS layer + one island; sells "drift-proof machine map" instantly.

### 7. Interaction log (terminal tab)

The unified human+AI intent log (memory `unified-interaction-log-idea`): every `Intent` is
already source-tagged at the one door — add a log sink app-side and a terminal tab that shows
the stream. Auditability made visible.

### 8. Status-bar leftovers

- **👁 page views:** needs a mechanism a static host can serve (GoatCounter-style endpoint or
  similar). Unresolved — **never fake the number**; hide until real.
- ★ repo stars: done (client fetch, hidden on failure).
- **Scroll-away content footer** on content pages: hairline + Contact / Résumé / license line.
  Terms/privacy links only once those pages exist (the export dead-link guard stays green).

## Doctrine reminders that apply to every piece

- **Thinking vs talking:** reasoning narrates to the TERMINAL (console surface); CHAT is for
  addressing the person; the chat's mini thinking-box is the bridge (already built).
- Every run: legible (narrates) + releasing (veil drops on natural completion — test THAT path).
- The lamp is the only "AI is here" visual; never restyle the target (lesson 8).
- Client-door pages are static-safe by contract — no secrets, no server-required behavior.
- Simulated runs are fine and honest **when labeled**; swap the brain behind the `Reasoner`
  seam, never fork the UI.

## Verification bar (per piece)

`bun run check` + `bun test` + e2e for any UI behavior (the only tier that covers the
dispatcher) + `bun run shots` (eyeball) + `bun run export` and **drive the static build**
(the /grain demo must still run through the client door). Sync the docs row you tripped
(CLAUDE.md table) and write a memory for decisions.
