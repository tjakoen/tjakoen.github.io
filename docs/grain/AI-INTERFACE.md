# AI ↔ UI Interface — the GRAIN action vocabulary contract

> This is the detailed contract for **GRAIN**, the AI-interaction layer (overview:
> [GRAIN.md](./GRAIN.md)). GRAIN is built on BATCH and headed for its own repo.

**Status:** Design + reference scaffold (running in the monorepo).
**Depends on:** [MVP.md](../../project/docs/MVP.md) §"One interface, one path" and §"The Interaction Flow";
[PROJECT-PLAN.md](../../project/PROJECT-PLAN.md) §9 (control plane / single-writer);
[DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) §3 (grade as signal).

This doc cashes out the MVP's hardest principle — *the AI acts through the same
vocabulary of frontend actions a human has, through one door, with no privileged
back channel* — into a concrete contract: the addressable surfaces, the verbs, the
envelopes that flow, and the channel that carries AI-initiated change to the screen
without a refresh.

---

## 0. The principle that decides everything

The naive design — give the AI a privileged channel that reaches into the DOM and
mutates elements — is **forbidden**. It is the back door the single-writer rule
(PROJECT-PLAN §9, MVP §"Core Architecture") exists to prevent, and it is
unmaintainable: the AI would be guessing at selectors against markup it can't see.

Instead:

> **A human interaction and an AI decision resolve to the *same named action*,
> through the *same door*.** The frontend exposes a closed vocabulary of verbs; that
> vocabulary is simultaneously what a human can trigger and what the AI is allowed to
> invoke. "See if it's possible with the interfaces given" (MVP step 5) becomes a
> literal lookup: *is this `(surface, action)` pair in the registry?*

Everything below is the machinery for that one sentence.

### The AI's interface is a *modality*, not a chat channel

That closed vocabulary is best understood as a **modality** — a finite set of real action
primitives (like keys on a piano: structured at the primitive level, expressive in combination),
not a chat channel the AI narrates through. Two things ground it, kept distinct:

- **The index** — the space of what's *possible*: the manifest's `actions` + `targets` (§4).
- **The snapshot** — what's *true right now*: each target's state-narrowed `accepts` + `inView` (§4).

The AI reads the index for its move set and the snapshot for where it's standing. Today the door
**validates pessimistically**: an action the surface doesn't afford is *rejected* with a `flash`
(§3), so the AI is expected to pre-check the manifest, not probe blindly. (A more forgiving *"the
surface has physics"* model — an unafforded action no-ops and reports what *is* available — is a
noted direction, **not** current behavior.) The *why* behind the modality lives in
[`PHILOSOPHY.md`](../../tjakoen.github.io/PHILOSOPHY.md).

---

## 1. The two registries — "an API for every element/screen"

"An API for every element" is two small, closed registries.

### 1a. Surfaces — the element map (addresses, not selectors)

Every mutable region of every screen has a **stable semantic address**, never a CSS
selector. The address is `kind:id` for instances and a bare slug for singletons:

```
task:42            an individual task        (kind = task)
task-list          the list region          (singleton region)
overcommit-banner  an AI-owned banner        (push-only; user can't act on it)
chat-log           the conversation region
```

The address is what render ops target and what the manifest enumerates. Because it's
semantic, the markup underneath can change freely — the address is the contract, the
DOM is an implementation detail. In the DOM this is a `data-surface="task:42"`
attribute; nothing addresses elements by tag or class.

### 1b. Actions — the verbs (closed, typed, depth-tagged)

A small vocabulary that grows reluctantly (PROJECT-PLAN principle 8). Each verb
declares the surface **kinds** it applies to, a typed **payload**, and a routing
**depth** (light = optimistic; heavy = decide-then-animate — MVP §"Gate triages").

**Current scaffold — built and running in `grain/ai/contract.ts`:**

| Verb | Payload | Accepts | Depth |
|------|---------|---------|-------|
| `item.archive` | `{}` | `item` | light (stands in for `task.complete`) |
| `say.set` | `{ text }` | `reflection` | light |
| `say.stream` | `{}` | `say-stream` | light |
| `demo.run` | `{}` | `screen` | heavy |
| `desk.stop` | `{}` | `screen` | light |
| `chat.send` | `{ text }` | `chat-log` | light |

**Full product vocabulary — designed, not yet registered in `contract.ts`:**

These verbs are designed but not yet wired. When a verb lands, it moves to the built table above.

| Verb | Payload | Accepts | Depth |
|------|---------|---------|-------|
| `task.capture` | `{ text }` | `task-list` | heavy (AI places it) |
| `task.complete` | `{}` | `task` | light (optimistic; `item.archive` stands in today) |
| `task.reschedule` | `{ when }` | `task` | heavy (conflict surfacing) |
| `task.reprioritize` | `{ priority }` | `task` | heavy |
| `view.navigate` | `{ screen }` | — | trivial (client-only) |

The built table **is** the live contract. It is defined once in TypeScript and everything else
— validation, the manifest, the UI affordances — derives from it.

> **Single source of truth: [`grain/ai/contract.ts`](../ai/contract.ts).**
> The closed sets are **union types + a `const` registry**, not a TS `enum` (`enum`
> is banned by `erasableSyntaxOnly`) — that union *is* the erasable enum:
> - `ActionName` — the verbs · `ACTIONS` — the registry (depth + accepted kinds).
> - `SurfaceKind` — the closed set of surface kinds a verb can accept (`item`,
>   `reflection`, `say-stream`, `screen`, `chat-log`). Push-only display surfaces the
>   AI only *writes* to (e.g. `console`, `timeline`) are intentionally **not** kinds — see the note in `contract.ts`.
> - `surface(kind, id)` — the builder; always construct addresses with it, never by
>   hand-concatenating strings, so a typo is a compile error.
>
> These flow into markup by **data-binding from typed view models** (e.g.
> `toLoopCardView` returns `action.name: ActionName`), so the union governs them at
> the source. The literal strings that remain in static page markup are caught at the
> seams: the **door** rejects unknown verbs (`isAction`), and the **harvest
> drift-guard** warns if a component declares a verb not in `ACTIONS` (§4). HTML can't
> be type-checked, so the safety is *types at the source + validation at the boundary*,
> not types in the markup.

---

## 2. The three envelopes that flow

### 2a. Intent — every interaction becomes this (human OR AI)

```ts
interface Intent {
  source: "user" | "ai";          // provenance, stamped at the entrance — HTTP /intent always
                                  // stamps "user"; only in-process actors raise "ai" (never client-set)
  session: string;                // which conversation/stream this belongs to
  screen: string;                 // where the user is (MVP step 2: "check what's in view")
  surface: Surface;               // what was touched/referred to (step 3)
  action: ActionName;             // the verb (must exist in the registry)
  payload: Record<string, unknown>;
}
```

A click, a drag, a checkbox, and a sentence the AI decides to act on all produce the
*same* envelope. It is posted to one endpoint: `POST /intent`. That is "the one
door." The chat sidebar is its first client; the dashboard its second (MVP §"One
interface, one path").

> **Auditable by design (an affordance GRAIN provides, not a feature it ships).**
> Because *every* interaction — human or AI — is one `source`-tagged `Intent` passing
> through one server-side function (`handleIntent`, `ai/interaction-layer.ts`), a complete
> human+AI **interaction log** is a server-side drop-in: log the `Intent` on the way in and
> the `Decision`/`RenderOp`s on the way out. The `source` field is stamped at the entrance
> and never taken from the client, so provenance in the log can't be forged. GRAIN
> deliberately does **not** ship the log — the sink (where entries persist, retention,
> redaction) is app policy, so **the consuming app owns it** (see PROJECT-PLAN §10, "one
> trace, four uses"). Reads/navigation go through plain htmx GETs, not this door — so this
> covers *operations* (who did what to the app), not page views.

### 2b. RenderOp — what the single writer emits

The interaction layer never returns "data for the client to render." It returns
**rendered HTML fragments addressed to surfaces** — the server owns rendering (BATCH:
server-rendered hypermedia), so the client stays dumb and can't drift from the truth.

```ts
type RenderOpKind = "replace" | "append" | "remove" | "flash" | "type" | "spotlight" | "log";
interface RenderOp {
  target: Surface;                // a semantic address from §1a
  op: RenderOpKind;
  html?: string;                  // server-rendered fragment (replace/append/flash/log)
  text?: string;                  // a streamed token (type)
  back?: number;                  // delete the last N chars (type) — the AI REVISING / overwriting
  done?: boolean;                 // last token of a stream → settle (type)
  active?: boolean; click?: boolean;   // spotlight on/off; click = pulse (the "AI acts" treatment, §5c)
  message?: string;               // human-facing note (flash) — e.g. the rollback copy on a failed write
  provenance: "user" | "ai" | "system";
  commit: "pending" | "committed";   // grade = commit state — see §5
}
```

> `log` appends one provenance-tagged entry to the interaction **timeline** (§5g) — the
> unified human-and-AI history. The client caps the DOM and pins to newest; the entry's
> colour/grade comes from `provenance`.

> A surface is **overwritten** by streaming `back` ops (delete a char) then `text` ops
> (type the new) — the AI visibly backspacing and retyping. The `/loop` demo uses this
> to revise one bullet of a plan it just wrote.

### 2c. The manifest — the AI's instruction manual (generated, §4)

A per-screen, machine-readable description of what's addressable and what's
invokable, plus the in-view state the reasoner needs for steps 2–4. The AI reads
this; it is never hand-maintained (§4).

---

## 3. The channel — AI-initiated change without a refresh

The AI acts on **its own timeline**: the heavy path takes seconds, and background
workers (PROJECT-PLAN §2) fire unprompted. So the server must be able to *push* a
change to the screen. htmx's request→swap model is client-initiated and can't do
this. The addition — the **one accepted JS island** (consistent with BATCH's "add a
small island of JS when a feature wants it") — is:

- **One SSE stream per session** — `GET /stream?session=…`. The interaction layer
  pushes `RenderOp`s down it whenever the AI or a worker produces a change.
- **A tiny vanilla dispatcher** (~40 lines) that applies ops by surface address
  (`replace` / `append` / `remove` / `flash`) and intercepts `[data-action]` clicks,
  turning them into `POST /intent`.

**The reply channel must be LIVE before an intent is raised** — SSE has no replay, so an
`Intent` posted before its `/stream` subscriber is registered *server-side* silently loses its
first `RenderOp`s (often the `spotlight`-on — the page then never reads as "acting" and can't be
interrupted). The native `open` event is not enough (it fires on headers, before the server's
`start()` registers the subscriber), so the stream emits a **`ready` handshake from inside
`start()`** and the dispatcher gates every submit on it. See grain/CLAUDE.md lesson 6.

**Why SSE, not WebSocket:** push is one-directional (server→client); intent goes up
over a plain `POST`. SSE auto-reconnects and needs no duplex socket. **Why a custom
dispatcher, not htmx's `sse-swap`:** the render-op model (op kind + provenance +
commit stamping) is richer than a single-element swap, and we want that control.

**The client transport (static hosts, opt-in — ARCHITECTURE §19.3):** a page marked
`<body data-ai-transport="client">` runs the SAME door in-browser (`grain/ai/client-door.ts`):
`POST /intent` becomes a direct `handleIntent` call and the SSE channel becomes a loopback that
hands ops straight to the dispatcher's `applyOp` — live by construction, so the `ready` gate is
satisfied immediately. Same vocabulary, same validation, same single writer; only the wire
differs. Its capabilities are inert (stub reasoner, no storage), so only service-free scenarios
are honest there — the client-safe boundary (§19.2) applies to everything it imports. The static
export freezes the door's module graph and stamps the marker; the live server keeps the server door.

htmx still handles the **client-initiated** half normally (initial loads,
navigation). SSE + the dispatcher are purely additive and live **entirely in the app
layer** — `framework/` stays app-agnostic, so the stack remains extractable.

**The door as a public seam (`window.grain.door`).** The dispatcher exposes its one wire out as a
browser seam: `door.submit(action, target, payload?, trigger?)` raises a real `Intent` through the
SAME `submit()` a human click uses — inheriting the pending-trigger lifecycle (§5) and the `ready`
gate for free — plus `door.screen` and the honest `door.online()` (outcome-stamped, never assumed).
This is how an island becomes a **third client of the one door** (the interactive terminal's
`ask`/`stop` are the first users) without a parallel wire or a privileged path. Same idiom as
`window.grain.theme` / `window.grain.terminal` / `window.grain.tabs` / `window.grain.xray`.

### The full loop (MVP §"The Interaction Flow", mechanised)

```
user clicks "complete" on task:42
  │  ① dispatcher: apply OPTIMISTIC op locally — task:42 → commit="pending" (grain)   [light path only]
  │  ② POST /intent { source:"user", surface:"task:42", action:"task.complete", … }
  ▼
interaction layer (the single writer)
  │  ③ validate (action ∈ registry? surface kind accepted?)        ← MVP step 5
  │  ④ reasoner.decide(intent, tools)                              ← MVP step 4 (the judgment)
  │     · heavy path: push a "thinking" flash first, decide, THEN emit the result
  │     · light path: act optimistically; the client already showed grain
  │  ⑤ reasoner uses scoped tools to WRITE (DB) and RENDER fragments  ← MVP steps 6–7
  │  ⑥ emit RenderOp(s)  →  stream.push(session, op)               ← MVP step 8
  ▼
SSE → dispatcher
     ⑦ apply op: replace task:42 with committed (clean) HTML  ·  or remove  ·  or flash+rollback
```

`POST /intent` returns immediately (`202`); the **confirmation arrives over SSE**.
That is the proof the push channel is real — an AI/worker change that no click
triggered lands the same way.

**Rollback (MVP §"Rollback"):** if the write fails or the reasoner refuses, it emits
a `flash` op; the dispatcher clears the optimistic `pending` state and surfaces the
error. The optimistic view was only ever a *prediction* — see §5.

---

## 4. The manifest generates itself — one source, no drift

Do **not** hand-maintain the manifest; it would drift the moment the UI changed,
violating PROJECT-PLAN principle 9 (*the representation must be the thing*). BATCH
already harvests the component tree to produce `/catalog`, `/components.css`, and
`/sitemap.xml`. **Extend that same harvest to emit the action/target manifest:** each
component declares the actions it accepts via a `data-accepts="task.complete
task.reschedule"` attribute, harvested the way bindings already are.

> **One source (the component tree), four uses:** the catalog, the sitemap, the
> rendered UI, **and the AI's manifest.**

Because the manifest is a projection of the real components, the AI's view of "what's
addressable here" *cannot* be out of sync with what's on screen. That is the honesty
guarantee, for free. **(Implemented:** `framework/render/accepts.ts` harvests
`data-kind`/`data-accepts`; item targets read their accepts from the component, region
targets are inverted from the registry, and a startup drift-guard warns on mismatch —
no hand-typed accept lists remain. The guard also scans every **wired** `data-action`
verb (e.g. `chat.send` on the assistant composer), so a stray/misspelled verb in any
component template surfaces at startup, not just a bad `data-accepts` declaration.)

`GET /ai/manifest?screen=tasks` returns:

```jsonc
{
  "screen": "tasks",
  "actions": [ { "name": "task.complete", "depth": "light", "accepts": ["task"] }, … ],
  "targets": [ { "id": "task:42", "kind": "task", "accepts": ["task.complete", "task.reschedule"] }, … ],
  "inView": { /* the state the reasoner needs for steps 2–4 */ }
}
```

**The same projection, read off the live DOM (`ai/manifest-dom.ts`).** The server builds the
manifest from component state at rest; the browser can build the *identical* shape by walking every
`[data-surface]` on the rendered page and deriving each one's kind (explicit `data-kind`, else the
address prefix) and accepts (its `data-accepts` ∩ the registry, else the registry inversion for a
known kind). Same honesty guarantee, now for a **static host with no `/ai/manifest` route** — and it
is the exact answer to "what can the AI do on *this* page, right now". This client projection powers
two dev-mode surfaces: a terminal `context` command (prints the JSON) and **x-ray** mode
(`scripts/xray.js` — outlines and labels each surface with its kind + verbs). The module is
client-safe (it imports only the pure contract + manifest builder and reaches the DOM through a
minimal structural interface, not the global DOM lib).

---

## 5. Grade = commit state — where this doc meets the design system

DESIGN-SYSTEM §3 gives type a *grade* (clean vs. grain) that encodes state. Grain
means two compatible things: **AI-authored** *and/or* **not-yet-committed**.

| Grade | When | Meaning |
|---|---|---|
| clean (Redaction) | human-authored **and** committed | settled ground truth — yours |
| grain (Redaction 50) | AI-authored, **or** any in-transit/optimistic state | machine-made, or the writer hasn't committed it yet |

So the rule the code follows: **grain if `provenance = ai` OR `commit = pending`;
clean only when human-authored AND committed.** Two consequences that matter on the
running app:

- **AI speech persists grain.** When the AI types a reply (`say.set` / `say.stream`),
  it *stays* grain after it finishes — grain = AI, so provenance doesn't evaporate
  into looking human. (An earlier "resolve to clean on completion" flourish was
  dropped because it erased provenance.)
- **A user's optimistic action settles to clean.** Archiving a card shows grain while
  in-transit, then the committed re-render is clean — that's *your* data settling, not
  AI speech.

This does three jobs with one visual language: AI-vs-human provenance,
optimistic-vs-confirmed, and draft-vs-saved.

**Implementation:** the interaction layer stamps `provenance` + `commit` on every
`RenderOp`; the dispatcher sets `data-grade` / `data-commit` on the target. The atom
only reads `--type-font` (DESIGN-SYSTEM §3 "As an atom") — **no per-component wiring**,
CSS inheritance distributes it. Non-text atoms express the same state their own way (a
button grows a dashed "terminal" edge + block caret while grain). Grade is the heavier
**Redaction 50** for visibility — one step past the design doc's 35 readability floor,
fine for short AI lines.

**Control lifecycle (the rule, not just a mechanism).** A control the AI operates enters
`data-commit="pending"` the instant it's used and **holds it until that action's *output*
commits**, then releases — the working state spans the whole action, never a flash. The
dispatcher does this by holding the trigger in **`pendingTriggers`** and releasing it in
`clearTrigger(target)` when the committed op (or a `flash`/rollback) for that surface arrives
(see the light path, §above). Nested work nests: a run's trigger stays pending for the whole run
while each sub-control holds for its own action. **This lifecycle is the contract, not an
ai-dispatch implementation detail** — any alternate driver must reproduce it. (The `/grain`
showcase demo doesn't need to: it runs through the real dispatcher and door like every other
surface — there is no showcase-only client-side op emitter.)

---

## 5b. Two write paths — the door vs. direct (ownership decides)

Not every write goes through the AI. The **mechanism is chosen by the data's ownership
category** (MVP §"Three ownership categories", set at creation, never inferred):

| Category | Example | Mechanism | Editability | Grade |
|---|---|---|---|---|
| 1 — user ground-truth | the **knowledge base**, notes, preferences | **direct write** (plain htmx → `/kb/*`), bypasses the AI | directly editable | clean (yours) |
| 2 — AI behavioral state | rules, config | **the door** (`/intent`) — propose, AI writes | accept/reject as intent | grain |
| 3 — AI reasoning artifacts | ledger, traces | **the door**, contest-only | no edit affordance | grain |

The frontend author picks the path with **one attribute family**: `hx-*` to a `/kb/*`
route = direct; `data-action` = the door. **Atoms are path-agnostic** — the *same*
`b-input` is a KB field (`hx-put="/kb/notes/42"`) or an intent trigger
(`data-action="task.capture"`); the wiring at composition time decides, not the
component. Two guardrails keep this from re-opening the back door:

1. **No generic direct-write endpoint** — `/kb/*` exists only for category-1 surfaces;
   you can't direct-write a rule or a ledger entry because no route accepts it.
2. **Per datum, exactly one path** — never wire both `hx-*` and `data-action` on the
   same control (ambiguous, and it would double-fire).

Direct writes still **notify** the AI (a "knowledge changed" event over the same SSE
hub) so it can re-derive — notify ≠ gate. (Scaffold status: the door + SSE path runs;
the `/kb/*` direct surface is a documented seam, not yet built.)

---

## 5c. Showing the AI as actor (spotlight + mediated interrupt)

A human click and an AI action both go through the door, but only the **AI as actor**
gets a spotlight — that's how the user *sees* the AI working (vs. their own clicks,
which are silent).

**The mechanism is a traveling LAMP** (`grain/scripts/ai-spotlight.js` + `ai.css`): ONE
fixed-position frame whose rect *glides* between surfaces (`--ai-focus-move` duration,
`--ai-focus-ease` easing), carrying the dim as its own cutout shadow — hole and veil move
together, and the lamp follows its surface through scrolls/resizes. The lit element is
**never restyled** (a rect is a rect — cards, rows, and inputs all get the same treatment
by construction; a form control's frame is its whole labeled `.field`). `.ai-spotlit` is
purely the semantic marker for the surface under the lamp.

**The established "AI acts on a surface" protocol — one rule, used everywhere:**

1. **`spotlight active:true target:S`** — the lamp glides onto S (the rest of the screen
   recedes into its shadow), S is gently scrolled into view and pulsed like a click; **and
   S itself enters AI mode** (the dispatcher sets `data-commit="pending"` on S, so a button
   reads terminal, an input/text reads grain). The surface the AI touches *looks* AI-driven.
2. **the AI acts on S** — types into it. Text streams into a region; for a real **input**
   it drives `.value` and a final `done` clears it, exactly like a human pressing Enter.
3. **move on** — `spotlight active:true` on the next surface (the lamp glides there,
   the previous one is released); or **`spotlight active:false`** to hand back (the lamp
   fades in place, undim, release).

Authored text keeps its grain *after* release (the `type` op's `data-grade` persists =
AI provenance); the spotlight's `data-commit` is only the *transient* "acting now" state.
The same `spot()` drives `say.stream`, `say.set`, the multi-step demo, and the layer's
auto-bracket of any `source:"ai"` intent — so every AI interaction looks identical. A
"✶ the AI is acting…" label names it (effect + word, not effect alone).

**Interrupt is mediated, never a force-kill.** While the AI acts, any user
interaction (click / Esc / backdrop) raises a confirm — *"Ask it to stop?"* — without
freezing the stream (the AI keeps working behind the modal, so nothing can wedge):
**Let it finish** just dismisses it; **Ask it to stop** posts a `desk.stop` intent. The
layer flips a per-session stop flag
that the reasoner **polls between steps** (`tools.cancelled()`) and halts at a clean
boundary — settling the partial line, then emitting its own `spotlight active:false`
to hand back. The client never aborts the AI's write; the **single writer stops
itself** (PROJECT-PLAN §9: the user is the final say, but state changes stay mediated
and traceable). The only client-side force-release is a 20s safety timeout.

---

## 5d. Reconnect & durability (decided; built with the heavy path)

**The UI is a window onto the process, not its controller.** Closing the tab must NOT
stop the AI — that would make the browser a kill-switch (and a flaky network would
destroy committed-to work). The AI keeps working; a reconnecting client just
*reflects* whatever is true.

Today (fire-and-forget `/intent`): the server finishes the turn regardless of the tab.
**Committed data persists** and is re-fetched on reload (e.g. an archive shows
Archived); **in-flight visuals are ephemeral** — the optimistic grain, the spotlight,
the half-typed text are pushed and forgotten, so a reload doesn't restore them. That's
the correct hypermedia model (the representation is *derived* from committed state,
PROJECT-PLAN §9) — but it means a long turn that's still running when you refresh shows
no sign of itself.

**Decision — what a refresh during a running turn should do:** show the generic
"✶ the AI is working…" state (with the **ask-it-to-stop** affordance), *without* the
fine-grained in-flight visuals (the new page can't know the exact mid-state — and that's
fine). When the turn finishes it resolves to the committed result; if it finished during
the gap, the reload simply shows that result. The user can still mediate (stop) — never
the browser-close.

**What that requires (the seam — all additive, no redesign):**
- **Track turns by ACTOR, not by the per-tab session.** Today `session` is a per-tab
  UUID, so a reload is a new session the server can't correlate. Split identity: an
  **actor** (stable across tabs/reloads — a cookie/`localStorage` id, later the account)
  *owns* the turn; the SSE **session** is just the current, disposable pipe. (Matches the
  MVP's "one continuous conversation, per user, not per tab.")
- The interaction layer keeps a per-actor **turn-status** (it already owns the stop
  flag — same place). On `/stream` connect, if a turn is running for that actor, push a
  generic "turn active" op → the client shows the working overlay; on completion push
  "turn done" → release. `desk.stop` re-keys to the actor.
- The `OpChannel` gains a **durable sibling** (a turn-status/op store) — a clean addition
  beside the push port; the door, the render-op vocabulary, and **GRAIN's component
  conventions don't change**. So GRAIN-as-a-design-system already supports this; it's a
  composition-root + layer concern, not a markup one.

**Deferred to build-order step 3 (the real reasoner / heavy path):** on today's instant
stub a turn finishes in milliseconds, so "still running on refresh" isn't testable, and
the actor-id seam is the same one the real assistant needs. Recorded here so it isn't
re-litigated.

---

## 5e. The takeover console — narrating the run

The spotlight (§5c) shows *where* the AI acts; the **console** shows *what* it's doing, in
words. It's the bottom region of the workspace shell (GRAIN §"Two layout archetypes"), and it
is the assistant's **collapsed form**: idle, a quiet bar; when the AI takes over, the chat
aside retracts and the console rises to narrate.

- **One display surface, push-only.** The reasoner emits ordinary render ops to a `console`
  surface — `clearConsole()` (`replace` a fresh feed at the start of a run) then a `narrate()`
  per step (`append` one line). `console` is **not** a `SurfaceKind`: nothing *acts* on it, the
  AI only writes to it (see the note in `contract.ts`). No new op kinds — the dispatcher's
  existing `append` handler auto-scrolls it because it's a scrolling container.
- **Each line is an `action-badge` — the verb vocabulary made visible.** A step reads as its
  verb (`reads` · `types` · `revises` · `clicks` · `commits`) plus a short description. The
  badge always wears the non-text grain (it's the AI acting), and the label is drawn from the
  same closed vocabulary the door speaks (`ActionName`), so the narration can't describe an
  action the system can't actually take.
- **The takeover is a shell state, not door machinery.** The client sets `data-acting` on
  `.app-shell` when a spotlight raises, and *plain* clicks inside the assistant/console are **not**
  treated as interrupts (chatting or preparing your next message while the AI works is
  allowed) — only clicking the *working page* asks it to stop (§5c). This is expressed entirely
  in `ai-dispatch.js` + `shell.js`; the reasoner just emits ops.

The console makes the AI's process legible without a privileged channel: it's the same
single-writer → render-op → surface path as everything else, addressed to one more surface.

### Actionable chat dialogs — the chat is a door client too

The chat is exempt from the "click = interrupt" rule, **not** from the action vocabulary. A
`chat-message` may carry an `actions` row of controls (`data-action` + `data-target`, presence-gated
with `data-ai-run`) — the AI offering the person a next move ("add to my notes", "see what's new").
The dispatcher fires those triggers even though they live in the aside, through the **same** `POST
/intent` door as any page control; only *plain* clicks in the chat stay non-interrupts. So a reply
and its follow-up actions travel one path — no chat-only back channel. Grade doctrine holds: the
offer *text* stays grain (the AI is speaking), but the buttons render clean and operable, because
clicking them is the **human's** move (the message's grain grade would otherwise dash + disable them
per b-button's control rule — the chat-message actions row undoes that while online, so the presence
gate still wins offline). A dialog's verbs are ordinary `ActionName`s and walk the full alignment
row like any other. (The composer's own Send button is the same mechanism — an action control in the
aside.)

---

## 5f. Degradation — honest offline, bounded runs

The AI's presence is a *signal* (grade = AI); the same honesty applies when the AI **can't act**.
The rule: **presence = transport health; offline = controls visibly disabled + honest copy; every
pending trigger has a bounded lifetime.** Nothing may pretend the AI is available when the door's
reply channel is down, and no interaction may hang forever waiting on it. (This is the contract the
real cloud model inherits at M★ — today the stub can't hang, but the seam must be honest now.)

**Presence, by outcome (never assumed).** The dispatcher stamps `<body data-ai-online="true|false">`
only when it *knows*: `true` on the server `ready` handshake (or the client door loading), `false`
on an SSE `error`, a fetch failure/timeout, or a watchdog trip. A consumer's presence indicator
reads off this — three states: waking (nothing reported yet), online, offline (`ai.css`). The
presence **star** (`.presence__star`) tracks it in color (muted → accent → faint), separate from the
wording so the signal survives a re-worded label.

**Gating — offline disables, visibly.** `body[data-ai-online="false"]` disables AI controls
declaratively: mark a trigger `[data-ai-run]` (it drives the AI) or a region `[data-ai-gate]` (a
composer gated on the AI); `ai.css` sets `pointer-events: none; opacity` on them when offline. The
dispatcher's `submit()` also no-ops while offline (belt-and-braces for the public
`window.grain.door` seam). The consumer supplies the *why* copy (persona-worded), shown only when
offline — the mechanism is grain's, the words are the app's.

**Three hang paths, three backstops** (all in `ai-dispatch.js`):
1. **Fetch timeout.** `POST /intent` is bounded by an `AbortController` (~10s); an abort rejects the
   fetch → `submit()`'s `.catch` releases the trigger and marks offline.
2. **SSE error.** EventSource **auto-reconnects**, so a transient blip (or a navigation teardown) is
   *not* "the door is down" — flipping offline instantly would spuriously gate a click made during
   the blip. So `es.onerror` **debounces**: it goes offline (and releases a live run) only if the
   channel is still down after the reconnect grace (~4s); a re-fired `ready` (the listener is
   **re-arming**, not `{ once: true }`) cancels it and flips presence back online. Presence stays
   "true" through a blip. (The 3s ready-fallback below still covers a channel that never comes up.)
3. **Pending-trigger watchdog.** A trigger enters `data-commit="pending"` in `submit()`/`spotlightOn`
   — but the 20s spotlight safety only arms once `spotlightOn` runs, so a **dropped `spotlight` op**
   (SSE has no replay, §3) would strand the trigger. An independent watchdog (~15s) covers it: it
   (re)arms while any trigger is pending and is **refreshed on every received op** (ops flowing =
   channel alive), so it never trips during a healthy multi-second run — only on genuine silence. On
   fire it releases every pending trigger, surfaces the failure on it (the existing `flash`
   affordance — `data-state="error"` + `title`, no new toast system), and goes offline.

**Static export.** `/grain` on a static host uses the client loopback door
(`data-ai-transport="client"`): `markOnline(true)` on import, `false` on failure — so gating
correctly disables the controls on a *broken* export instead of throwing silently per click.

---

## 5g. The interaction timeline — the unified human-and-AI log

The spotlight (§5c) shows *where* the AI acts; the console (§5e) shows *what* it's doing this turn.
The **timeline** is the durable, uniform record of **every crossing of the one door** — a human click
*and* an AI decision — kept in one place, one format, source-tagged. It's the log the whole
architecture implies: because both operators enter through the same `handleIntent`, recording *there*
(the single writer, the natural choke point) is cheap and records them **identically** — the same
uniform auditability a pixel-click imitation can't give (whitepaper §2, "legible action log").

- **A port, wired at the composition root.** The door depends on a `LogSink` (`contract.ts`), never a
  concrete store — exactly like `OpChannel`. `handleIntent` calls `logSink.record(entry)` for each
  crossing: once for the incoming **request** (`kind:"intent"`, provenance = who raised it) and once
  for the outgoing **response** (`kind:"response"`, provenance = who authored the render — `ai` on
  success, `system` on a rejection/rollback). It is **optional**: observability, not core correctness.
  Any impl satisfies it — a console logger, an audit journal, or the visible timeline.
- **The visible timeline is one `LogSink` impl** (`grain/ai/timeline-log.ts` `createStreamLogSink`):
  it pushes a `log` render op (§2b) to the `timeline` **push surface** for each entry, so the log
  renders live over the same channel as any other op. **Push-only, never a `SurfaceKind`** — nothing
  *acts* on it (like `console`); it's addressed by its bare slug. The client (`ai-dispatch.js`
  `case "log"`) appends the entry, caps the DOM (~80 rows), and pins to newest.
- **Provenance shows by GRADE, not a hue** (the palette is hueless): the `timeline` component renders
  an **AI** crossing in the grain font behind a dashed terminal edge (grain = AI), a **human**
  crossing in the smooth font behind a solid edge, a **system** rejection faint, and a failed
  crossing struck-through. So the log *itself* demonstrates grade-as-signal.

The timeline is a read-only surface: the AI only ever writes to it, and it survives both transports
(server SSE and the client loopback door). Live on `/grain` — it fills as you ask or watch it act.

---

## 6. Simulating the AI (and the build order)

Per MVP §"Build Order" step 2, the stub is **plumbing, never faked judgment.** It
sits behind the *exact* boundary the real reasoner will use — the `Model` boundary of
PROJECT-PLAN §10c:

```ts
interface Reasoner { decide(intent: Intent, tools: ReasonTools): Promise<Decision>; }
```

The stub (`makeStubReasoner`) returns canned decisions, adds an artificial heavy-path
delay so the "thinking" acknowledgment is exercised, and can be told to fail so
rollback is exercised. Swapping in the real cloud model later (build-order step 3) is
an implementation swap behind this interface — not a rewrite. The reasoner writes and
renders through **scoped tools** (`ReasonTools`) — its action vocabulary — exactly as
the real one will reach storage through scoped, least-privilege capabilities
(PROJECT-PLAN §2). **Sequencing rule (unchanged):** never build a panel before the
engine capability it surfaces exists; the stub is the door's plumbing, not a panel.

---

## 7. Reference scaffold

The monorepo runs the whole loop end-to-end on the existing item domain — `item.archive`
stands in for `task.complete` (optimistic light path) so the *mechanism* is proven
without dragging in the full task domain yet.

| Piece | Where | Concern |
|-------|-------|---------|
| Generic SSE hub | `batch/http/stream.ts` | batch (substrate) |
| Action vocabulary + envelopes | `grain/ai/contract.ts` | grain |
| Reasoner boundary + stub | `grain/ai/reasoner.ts` | grain |
| The one door (single writer) | `grain/ai/interaction-layer.ts` | grain |
| Manifest (harvested, can't drift) | `grain/ai/manifest.ts` + `grain/ai/accepts.ts` | grain |
| Routes (`/intent`, `/stream`, `/ai/manifest`, `/ui/loop`) | `tjakoen.github.io/routes/ai-routes.ts` | app (wiring) |
| Dispatcher island | `grain/scripts/ai-dispatch.js` | grain |
| Demo page + card | `tjakoen.github.io/pages/loop.html`, `tjakoen.github.io/components/molecules/loop-card/` | app |

The manifest is now **harvested** (§4 realised): item targets read `data-accepts` /
`data-kind` straight off `loop-card`; region targets are inverted from the action
registry; a startup drift-guard warns if a component declares a verb the backend
doesn't allow. Grade = commit state extends to **non-text atoms** too — an in-transit
button renders a dashed "terminal" edge + block caret (the same inherited grain state,
expressed for a button).

Run it: `cd poc && bun run dev`, then open `/loop`. Click **Archive** — the card goes
grain (optimistic `pending`), the stub "reasons" (brief delay), then the confirmed
clean card arrives **over SSE**. Set `AI_FAIL_RATE=1` to watch the rollback path.
`GET /ai/manifest?screen=loop` returns the live manifest. `/catalog` has a **Human/AI**
toggle per component that flips it between clean and grain.

**What it deliberately does *not* do yet:** real judgment (the reasoner is a stub),
the full task domain, the chat client, and heavy-path "thinking" UI. Those are later
build-order steps — surfaced here so the scaffold isn't mistaken for more than it is.
