# Storyboard — "Watch me work" (demo.run showcase)

**Status:** REWORK — the canned version was rejected as dishonest (it ran a hardcoded animation
before the model even loaded; the AI did nothing). Owner call: make it **fully agentic** — the 0.5B
CHOOSES each action, the harness validates + applies. "Give the AI a script (a goal), not a
choreography."

## Agentic design (the honest version)

Non-negotiable: **load the model first, gate the button on it.** No movement before the AI exists.

The AI drives via a tight TOOL protocol — one call per turn, valid targets enumerated each turn so it
chooses from a list (never invents a route). The harness validates every call before applying it
(law #2: the AI proposes, code guards). MPA-safe: the agent's state (goal + what it's done) rides
sessionStorage across each navigation and the loop re-hydrates on arrival.

**Tools (one per turn, one line):**
- `GO <route>` — navigate. Valid routes enumerated from the live catalog; rejected otherwise.
- `HIGHLIGHT <id>` — spotlight a section on THIS page. Valid ids = this page's rendered headings.
- `NOTE <text>` — append an AI-authored line to the notepad (only where a notepad exists).
- `DRAFT <text>` — prefill the contact message, AI-authored (only on `/mail`; never sends).
- `SAY <text>` — one short sentence to the visitor.
- `DONE` — the demo is complete.

**Loop (per page, in the reasoner — it has the engine):** build the turn prompt (goal + current page
+ allowed routes/anchors + what's been done) → stream one line → parse → validate → on reject, feed the
reason back and let it retry (bounded); on accept, apply the real op + record it → `GO`/`DONE` end the
page (stash state + navigate, or finish); other tools loop on-page. A per-page + total step cap and the
"type anything to stop" cancel bound it.

**Guardrails:** routes/anchors validated against live data (never invented); NOTE/DRAFT are
AI-authored text (the B1/note-write precedent — the model may compose, code targets + never submits);
step caps; graceful stop.

**Risk (owner accepts):** the 0.5B is weak; this needs prompt iteration against the real model. Unit
tests pin the loop/validation on a mocked engine; a live e2e drives the actual 0.5B to tune wording.

## Tuning log (live 0.5B, via a WebGPU probe)

- **v1** — parroted the user-turn question ("What is your next action?") back as `SAY` chatter, looped,
  never advanced. Root cause: an echoable question turn + `SAY` escape hatch.
- **v2** — dropped `SAY`, made the user turn a non-question cue, numbered the anchors, added a computed
  next-step hint. Result: drove `GO`→`HIGHLIGHT`, but re-`GO`'d the current page and malformed the next hop.
- **v3** — reject `GO`-to-current-page; the one-shot example = the actual suggested command; reject
  placeholder text. Result: `GO`→`HIGHLIGHT`→**authored its own NOTE**, then fumbled the mechanical `GO /mail`.
- **v4 (current)** — two-pass turn: the model chooses freely first; if that's invalid, a hardened pass
  forces the mechanical command. Result: **full run completes** — `GO`→`HIGHLIGHT`→authored NOTE→(forced
  `GO /mail`)→authored DRAFT→`DONE`. The model genuinely authors the note/message; the mechanical hops
  have a forced floor so a fumble can't wedge the demo.

**Honest framing:** the AI is loaded first and does the real generative work (authoring the takeaway +
the message from the page it reads), emitting validated tool calls. The mechanical hops (which page,
which section) are guided/floored because a 0.5B fumbles them — but they were always mechanical, and the
harness only ever applies what validates (law #2). The valuable, visible AI contribution — the writing —
is the model's own.

---
_Superseded below: the original canned Option-A storyboard, kept for reference only._

**Status (superseded):** SHIPPED — Option A (desk pilots the real site, homepage-staged), full sweep
(read → note → highlight → save → `/mail` draft → choose). Built on the A2 tour relay.

## What shipped

- `src/ai/showcase.ts` — the 3-step drive as plain data + cursor codec (mirrors `tour.ts`).
- `actions.ts` — `showcase-start` action; "watch me work" / "watch the AI act" / "run the demo" route
  to it; "stop the demo/showcase" folds into `tour-stop` (shared cancel).
- `desk-reasoner.ts` — `showcase-start` handler (drives leg 0, stashes the cursor, navigates);
  "type anything to stop" cancel via `showcaseClear`.
- `desk-door.ts` — `runShowcaseLeg` in the arrival chain (after `runContactTask`): performs each
  stop's `note.append` + closing `choicesOp`, then advances. Reuses the existing `ARRIVE_KEY`
  (announce + anchor highlight) and `CONTACT_TASK_KEY` (compose prefill) relays.
- `scripts/site.js` — "Watch me work" is the lead chip on the hero "try this" rail.
- Tests: `showcase.test.ts` + reasoner/actions unit tests + `e2e/desk-showcase.e2e.ts` (full drive,
  stop affordance, stale-cursor abandon). Full suite green; e2e green against a live browser.

Follow-up (not done): the "Watch the AI act" welcome walk card still links to `/grain` — could be
rewired to trigger the homepage pilot instead of navigating away.
**Goal:** make GRAIN's one thesis *visible* — one AI, one op vocabulary, every surface — in a single
tap. Today a visitor only sees chat text + a link; the interface-driving magic never shows.

## What already exists (reuse, don't rebuild)

- `demo.run` verb → grain stub reasoner drives scripted RenderOps over the door
  (`../grain/packages/grain/ai/reasoner.ts:219`). Zero model, re-runnable, mutates no storage.
- A `/grain` scenario already runs 6 beats: read rail → type in Ask → reply in thread → complete a
  task → draft a follow-up → hand back.
- Trigger points today: the buried "See what's new" button; the `/grain` chip "Watch the AI act" is
  **just Q&A** (routes to grounded chat — it *explains* instead of *doing*).

## The gap

1. The chip that says "Watch the AI act" doesn't run the act.
2. The existing scenario stops short of the **full** vocabulary — it never touches the notepad
   (`note.append`), a form field (`field.set`), or an interactive choice (`choicesOp`). Those three
   are the most "an AI is operating *my* UI" moments.

## Where it stages — the homepage is the stage, not `/grain`

First-time visitors land on `/`, so the demo earns its keep there. But `/` is a **launcher** (welcome
cards + the desk + the "try this" rail) — it has **no** grain sandbox surfaces (`grain-rail`,
`grain-ask`, `grain-task`, notepad). Those live only on `/grain`. So "on the homepage" means one of:

- **Option A — homepage pilots the REAL site (recommended).** The desk drives the actual portfolio:
  spotlight a walk card → travel to the flagship note → highlight a passage → hop to `/mail` → prefill
  a message to TJ → offer a choice. Strongest first impression: the AI operates *production* surfaces
  the visitor is really looking at, not a toy board. Reuses the **A2 tour's arrival-stash relay** (each
  leg carries the next scripted step across the page load) — NOT the `/grain` `demo.run` sandbox.
  Cost: multi-leg, more moving parts.
- **Option B — homepage triggers, `/grain` stages.** The "Watch the AI act" card already links to
  `/grain`; make it auto-start `demo.run` on arrival. One tap on `/` → lands on `/grain` and plays the
  sandbox run below. Cheapest, reuses everything — but the show happens on `/grain`, not `/`.

### Option A beats — the desk pilots the real site (homepage-staged)

| # | Beat | Op(s) | Terminal line | Surface (real) |
|---|------|-------|---------------|----------------|
| 1 | Point at the flagship card | `spotlight walk:ten-times-zero` | reads · starting with the flagship | homepage walk card |
| 2 | Travel to the note | `travelAndNavigate /notes/ten-times-zero` | clicks · opening the note | real `/notes` page |
| 3 | Highlight a passage | `spotlight anchor:<heading>` + scroll | finds · the passage that matters | real MILL heading anchor |
| 4 | Save a line to the notepad | `note.append` (from=ai) → reveal | notes · saving a takeaway | site-wide notepad |
| 5 | Travel to contact | `travelAndNavigate /mail` → `openCompose` | clicks · opening a message to TJ | real `/mail` compose |
| 6 | Prefill the message | `field.set field:contact-message` | drafts · a note to TJ, ready to send | real compose field (never submits) |
| 7 | Offer the next move | `choicesOp` — "Read on, or reach out?" | asks · your call | desk choices |
| 8 | Hand back | `spotlight screen false` | done · handed back to you | — |

**Closing reply:** "That was one AI on one op vocabulary — it opened a note, highlighted a passage,
saved a takeaway, and drafted a message to TJ. Every step drove the real site, through the same door
you use."

Implementation note: Option A extends the **tour relay** (`tourSet`/`arrive`), teaching the arrival
stash to carry *an action to perform on arrival* (spotlight-anchor / prefill), not just an announce.
That machinery already exists for A2 (it carries announce + anchor today).

## Alternative — `/grain` sandbox run (Option B's stage)

Extend the existing 6-beat scenario to 9 beats so it exercises every op type. Backdrop stays up across
the run; the spotlight follows what it touches; the terminal narrates every beat so it never reads as
stuck. Timing per the existing `HOLD_MS`/`SETTLE_MS` cadence.

| # | Beat | Op(s) | Terminal line | Why it lands |
| --- | --- | --- | --- | --- |
| 1 | Read the surface | `spotlight nav:grain-rail` | reads · checking today's tasks | Establishes "it looked before it acted" |
| 2 | Compose in the Ask field | `moveTo grain-ask` → `stream` → `type done` | types · composing "Plan Thursday…" | AI uses the *human* input, then submits |
| 3 | Reply in-thread | `append chat-log:grain` → `stream grain-reply` | writes · replying in the thread | A real bubble, same door as chat.send |
| 4 | Complete a task | `spotlight grain-task` → `replace grain-task-badge` | commits · completing "Draft the Q3 plan" | A visible state change it *committed* |
| 5 | Draft a follow-up task | `append grain-tasks` (grade=grain) → `stream grain-draft` | types · drafting a follow-up | AI-authored content stays visibly "grain" |
| 6 | **Jot it to the notepad** *(new)* | `note.append` (from=ai) → `spotlight notepad` → reveal | notes · saving the plan to the notepad | The AI's memory as an editable artifact |
| 7 | **Prefill a message to TJ** *(new)* | `field.set field:contact-message` | drafts · a note to TJ, ready to send | It fills — and pointedly **does not submit** |
| 8 | **Offer the next move** *(new)* | `choicesOp` — "Want the full plan, or just the 2pm review?" | asks · your call | Ends on the visitor's agency, not a wall |
| 9 | Hand back | `spotlight screen false` | done · handed back to you | Clean release, re-runnable |

**Closing reply:** "That was one AI, one op vocabulary — it read, replied, completed a task, drafted
one, saved a note, prefilled a message, and asked what's next. Every step went through the same door
you use."

### Honesty guardrails (kept from the existing design)

- Never submits anything (beat 7 fills, Send stays the visitor's — no submit verb exists).
- Graceful stop: any message mid-run hands back cleanly (`stopped()` check between beats).
- Mutates no storage: notepad/field writes are demo surfaces, re-runnable.

## Wiring change

- **Homepage entry point (Option A):** the "Watch the AI act" walk card on `/` (currently a plain
  link to `/grain`) becomes the trigger — tap it and the desk starts piloting the real site in place.
  Also expose it on the "try this" rail as "▷ Watch me work".
- The `/grain` chip "Watch the AI act" → route to `demo.run` (make the chip *act*, not answer) —
  keeps the sandbox run reachable on its own page regardless of which stage we pick.
- Keep "See what's new" as-is (it's the `/notes` variant).

## Open questions for you

1. **Stage (the one that matters):** Option A — homepage pilots the real site (recommended, multi-leg
   relay) — or Option B — homepage tap launches the `/grain` sandbox run. A is the stronger landing
   moment; B is a fraction of the work.
2. **Length:** Option A is ~8 beats across 2 hops (≈20s). Trim (skip the `/mail` leg, end on the note
   + a choice) or keep the full read→note→message→choose sweep?
3. **Interruptible:** confirm any keystroke hands back cleanly mid-run (the `stopped()` guard) — same
   as the tour's "type anything to stop".
