# NOTES-PAGE-PLAN.md — the /notes page

Plan for turning `/notes` into the editor's most honest screen. Owner-picked ideas 1, 2, 6 from the
`/notes`-vibe brainstorm (2026-07-07). Canonical for this work; tick items here and sync the rows in
[`../../CLAUDE.md`](../../CLAUDE.md) "when you change X, update Y" as each lands. Related: THE EDITOR
(`PLAN.md` §THE EDITOR), `DEMO-PLAN.md` item 1 (this page is that run's home).

**Status (2026-07-07): all three BUILT** — `tsc` + unit + integration + e2e green. Idea 6's write
target was redirected mid-build from an on-page card to the sidebar chat (owner feedback, appended
below); see its section for what shipped.

## The through-line

Three ideas, one spine: **the notes page is where "the site is its own source tree" stops being a
claim and becomes visible.** Real `.md` files in, the real source viewable, the real AI reading them.
All three lean on machinery that already exists — MILL's content route, the traveling lamp, the
`demo.run` reasoner branch — so this is mostly composition, not new architecture.

## What exists today (the anchors)

- `/notes` renders through MILL: the index + each `/notes/:slug` (`content.ts` `collections[0]`,
  `mill/serve.ts` `createMillRoutes`). Entry pages are grade-smooth (human ink); the grade guardrail
  forbids grain in MILL output — only the AI grains, and it does so through the door, never MILL.
- Index markup = `content-index__item` (meta · title · summary · tags), built from frontmatter only
  (`mill/serve.ts` `indexArticle`). The page body carries `data-screen="notes"`.
- The explorer tree already maps `notes/*.md` to the real files (THE EDITOR).
- The reasoner's `demo.run` already branches on `intent.screen` (`grain/ai/reasoner.ts`) — a `notes`
  branch slots in with no new verb.

---

## Idea 1 — Source ⇄ Rendered — BUILT

**What.** Each `/notes/:slug` gets a segmented control **Rendered | Source**. Source shows the literal
`.md`. This cashes the editor pitch ("notes are literally their `.md` files") into something you can
click. No other portfolio shows you its own source next to the rendered page.

**Build — MILL (generic; serves every collection, not just notes):**
1. `createMillRoutes`: when `path === ${prefix}/${slug}` and it ends `.md`, return `source.read(slug)`
   as `text/plain; charset=utf-8`. ~6 lines in `mill/serve.ts` alongside the entry branch.
2. `listMillRoutes` emits the `.md` twin per entry so the sitemap and the export freeze it. A raw file
   is trivially exportable (§18: no `/intent`+SSE, so no exportable-boundary conflict).
3. Grade: raw source is human content — no grain, no `data-commit`. No guardrail conflict.
4. MILL unit test: `/notes/:slug.md` returns the bytes; a non-slug 404s (reuse the `SLUG` guard).

**UI — two tiers:**
- **v1 (zero-JS, ship first).** The entry chrome renders a `Rendered | Source` pair; Source is a plain
  `<a href="/notes/${slug}.md">`. Honest, exportable, done. Progressive-enhancement clean.
- **v2 (optional).** In-place toggle — fetch the `.md`, render into a `.surface-term` `<pre>` pane, no
  navigation. Client module. Defer until v1 is proven.

**Done when.** Raw route + list twin + unit test green; the `Rendered | Source` control ships on entry
pages; sitemap/export pick up the `.md` twins.

---

## Idea 2 — Index as git-log — BUILT

**What.** The newest-first index reads like `git log`: mono date gutter, title as the commit message,
tags as branch chips, hairline between entries. Fits the editor + terminal aesthetic without inventing
anything — the whole page already says "this is source."

**Build — portfolio CSS only (MILL untouched):**
- Style `[data-screen="notes"] .content-index` into a log layout: date = mono left column, title = the
  message row, `.note__tags` badges restyled as branch-tag chips, a rule between items. Every element
  needed is already emitted by `indexArticle`.
- **Short-hash (optional polish).** A 7-char ref per row would complete the illusion, but the hash
  needs a value in the markup — either a small MILL touch (derive from slug at index time) or compute
  it client-side from the slug. Defer; the git-log reads fine without it.

**Cost.** One CSS block. Cheapest of the three, zero risk, do it first.

**Done when.** The index reads as a log in all three themes (Sourdough / Baguette / Brioche); no MILL
change; screenshots refreshed.

---

## Idea 6 — "What have you been up to" (the payoff) — BUILT (2026-07-07)

**What.** A default prompt on `/notes` drives the real interface: the lamp travels the newest note
items on the index, narrates each read to the terminal, then writes a digest. This is `DEMO-PLAN.md`
item 1's scenario, staged on `/notes` (where the notes actually live).

**As built:**
1. **Addressable note items.** `data-surface="note:${slug}"` on each `content-index__item`, opt-in per
   collection via `MillCollection.itemSurfacePrefix` (`mill/serve.ts`) — notes sets it to `"note"`. The
   stub reasoner walks 3 hardcoded slugs (same stub-quality bar as the /grain scenario); the live model
   at M★ reads them from the manifest instead.
2. **Write target — the SIDEBAR CHAT, not a card.** Originally built as an on-page grain "desk note"
   card; **redirected same day by owner feedback** (appended to this file, see below) to stream into
   the global `chat-log` instead — a fresh AI bubble, exactly like `chat.send`'s reply. Only the
   trigger button stays on the page (`data-ai-run data-action="demo.run" data-target="screen"`, no
   card chrome) until chat messages can carry their own action affordances (tracked, not built —
   see the owner-feedback section below).
3. **Reasoner branch** (`grain/ai/reasoner.ts`, `demo.run`'s `notes` screen): `clearConsole` → for each
   of the newest 3 notes, `moveTo("note:slug")` + narrate → `moveTo("chat-log")`, append a fresh grain
   AI bubble (`data-surface="desk-note"` on its body), stream the digest into it → `spot("screen",
   false)` to release.
4. **Not yet idempotent** — matches the /grain scenario's existing bar (it re-runs the same fixture
   every click too); idempotency is called out for the live model at M★, not this stub.

**No new ActionName** (reuses `demo.run` + the screen switch); `note:slug`/`desk-note`/`chat-log` are
push-only display targets (contract.ts's existing carve-out for surfaces no verb accepts) — no
`contract.ts` or manifest change was needed.

**Tests:** MILL unit (`itemSurfacePrefix`) + reasoner unit (targets travelled, digest streams, releases
on both natural completion and stop) + integration (the real door: intent → ops over SSE) + e2e
(`notes-demo.e2e.ts` — asserts the natural-completion release, grain `CLAUDE.md` lesson 7, not just
that the run starts). All green.

---

## Build order — all landed 2026-07-07

1. **Idea 2** — CSS git-log. Done.
2. **Idea 1 v1** — MILL `.md` raw route + `listMillRoutes` twin + unit test + the `Rendered | Source`
   link. Done.
3. **Idea 6** — `data-surface` on index items → the reasoner `notes` branch → chat write target →
   integration + e2e. Done (redirected mid-build, see owner feedback below).
4. **Later, still owed** — Idea 1 v2 (in-place toggle pane); idea 6's persistent rail notepad
   (`DEMO-PLAN.md` piece 2); actionable chat dialogs (owner feedback #2 below); idempotency + the
   client-door static seam for idea 6, both called out for the live model at M★.

## Sync-when-done — done

- **MILL raw route** → `mill/serve.ts` + `listMillRoutes` + `listMillRawRoutes` + `tools/export.ts`
  `dataRoutes` + MILL unit tests. ✓
- **`note:slug` / `desk-note` / `chat-log` surfaces** → push-only display targets, no `contract.ts` or
  manifest change needed (see idea 6). ✓
- **Reasoner `notes` branch** → reasoner unit + integration (door path) + e2e (natural-completion
  release). ✓
- **The `/notes` demo** → noted in `DEMO-PLAN.md` item 1 that a first slice is built here. ✓
- **Screenshots** — owed before commit (`bun run shots`).

## Open questions

- **Short-hash in the git-log:** worth a small MILL frontmatter/slug touch, or skip it as decoration?
  Still open — shipped without it.
- **Actionable chat dialogs** (owner feedback #2 below): needs its own design pass before idea 6's
  trigger can move fully into the chat surface.

---

## OWNER FEEDBACK — 2026-07-07 (redirects Idea 6, decision #2)

Appended by a second session (the one that also fixed the terminal-expand dead-knob) — NOT the
session building this plan. Append-only per the multi-agent protocol so the build session picks it
up without a merge clash. Owner said, reviewing the in-flight notes-page work:

1. **The "What the desk noticed" prompt belongs in the right-sidebar CHAT, not an on-page card.**
   This overturns decision #2 (the on-page grain "desk-note" card at the top of the index). The
   digest the `notes` `demo.run` branch writes should stream into the **`sidebar-panel` chat**
   (the assistant column, `data-mode="chat"`), like any other thing the desk says to the person —
   not a card wedged into the reading column. The `content.ts` `deskNote` card + its
   `data-surface="desk-note"` target should move to the chat surface. Grade doctrine unchanged
   (AI-authored digest stays grain). The `note:slug` addressable items + lamp choreography are
   unaffected — only the WRITE TARGET changes (card → chat), which is exactly the "same op, new
   target" upgrade path decision #2 already anticipated.

2. **Add support for ACTIONABLE CHAT DIALOGS (new GRAIN capability).** Chat messages/replies should
   be able to carry action affordances (buttons that emit an `Intent` through the one door), so a
   desk reply like the notes digest can offer "add to my notes" / "see what's new" inline in the
   chat instead of a separate on-page button. This is a `chat-log`/`chat-message` (grain) extension
   — a message can render `data-ai-run`/`data-action` controls that go through the same dispatcher.
   Needs its own design pass (contract: does a chat action reuse existing `ActionName`s or need a
   registry? — see [[actions-workflow-registry-idea]]) + the full alignment row. Bigger than #1;
   likely the enabler that makes #1 read well (the chat digest's "see what's new" / "add to notes"
   become actionable dialog buttons).

**Coordination note:** the terminal-expand fix (committed adede03) was unrelated and is done. These
two items were left for THIS session to fold into the notes-page build rather than have two sessions
edit `content.ts`/`reasoner.ts`/the surfaces at once. Owner to confirm ownership.

**Resolution (same session, 2026-07-07):** item 1 folded in — the digest now streams into the global
`chat-log` (a fresh grain AI bubble), not a card; `content.ts`'s trigger button has no card chrome
left. Item 2 (actionable chat dialogs) is NOT built — it needs its own design pass (a `chat-message`
extension + a contract decision on verb reuse vs. a registry) and is out of scope for this pass; the
notes trigger stays a plain on-page button until it lands.

**Item 2 BUILT (other session, 2026-07-07, commit 57e8c76):** actionable chat dialogs shipped as a
GRAIN capability — a `chat-message` can carry a `chat-message__actions` row of `b-button`s
(`data-action`/`data-target`, presence-gated with `data-ai-run`) that fire through the one door; the
dispatcher (`ai-dispatch.js`) now fires action controls inside the chat aside (only *plain* chat
clicks stay non-interrupts; mid-run page clicks still interrupt). Grade doctrine handled (offer text
grain, buttons clean+operable online, gated offline). Docs: AI-INTERFACE §5e + chat-message.md. NO
new `ActionName` — verbs reuse the existing vocabulary and walk the normal alignment row. **So the
notes digest's follow-ups can now be real buttons:** put a `chat-message__actions` row on the digest
bubble with e.g. "add to my notes" / "see what's new" instead of the plain on-page trigger — each
needs its verb in `contract.ts` + a reasoner branch (that part is still the notes session's to build).
