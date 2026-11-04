---
id: ai-agency-navigation
status: doing
track: ai
depends: []
touches: [src/ai/, src/routes/ai-routes.ts, view/pages/mail.html, content/tours/, e2e/]
owner: ai
---

# AI agency — navigate and operate the portfolio like a human

> Goal (owner, 2026-07-20): I should be able to ask the desk to do things the way a person would.
> "Navigate here." "What's this about?" "Contact them" — and it asks back what it needs (what should
> the message say? what's your email?), navigates to Mail, fills the form, shows a confirmation
> (a card / hints / buttons in the chat box), and sends it. The AI should make these decisions
> **intuitively, from its exposure to what it can see and what it can do** — not from a hardcoded
> script. And the toggle that shows "what can the AI see" needs to be much better.

This is an **audit + implementation** plan. The original audit and proposed phases below are
historical. The November 1 reconciliation and current tasks state what remains; the old Send
proposal is not the current behavior or permission to add a submission verb.

## Reconciled state, November 1, 2026

The page-derived capability catalog, field.set, visible field filling, cross-page contact drafts,
and behavior tests are implemented. Contact drafting opens Mail and fills the message, while the
visitor reviews, edits and sends with the existing compose controls. Sending remains human-only;
there is no form.submit action in the current vocabulary.

Navigation handover is implemented through task-specific persisted state for contact, tours and
other actions. It is not the generic planner originally proposed in P3. When contact persistence
fails, the assistant now stays on the source page and returns the draft for copying. Browser
regressions cover denied writes and denied access to session storage.

The remaining product questions are collecting missing information, subject drafting, a chat review
card, a richer x-ray surface and genuinely model-selected task initiation. A generic planner and
AI submission are possible new scope, not missing prerequisites for the existing useful flow.

---

## Audit — what exists today

### The one door (this part is solid, build on it)
Every human or AI action becomes one `Intent`, crosses one door, and comes back as `RenderOp`s
addressed to semantic surfaces (`@tjakoen/grain/ai/contract.ts`). The portfolio wires a **real local
model** (`Qwen2.5-0.5B` via WebLLM) behind GRAIN's `Reasoner` contract in `src/ai/desk-reasoner.ts`; it
handles `chat.send`, and delegates every other verb to the stub. Navigation already works two ways:
a deterministic alias router (`src/ai/actions.ts`) and the model's own `NAVIGATE:<route>` choice, scoped
to the live nav targets on the page. The traveling lamp + terminal narration make the AI's steps
visible. **The plumbing for "the AI acts like a human" is here.** The gaps are in *what it can see*,
*what verbs exist*, and *whether it can chain steps*.

### What the AI can SEE today
- `pageManifest()` / `pageManifestText()` — GRAIN's live-DOM manifest, honestly derived from the
  action registry. But the registry only knows five surface KINDS (`item | reflection | say-stream |
  screen | chat-log` in `contract.ts`), and most are demo-era. So the manifest a page reports is
  thin: on a content page it is essentially "a screen and a chat-log."
- `nav:<route>` lines distilled from the manifest — the sidebar/dock links. This is the richest
  real signal today, and it is why navigation is the one agentic thing that works well.
- `pageText()` — the readable content, for "summarize this page."
- The grounding corpus (`src/ai/knowledge.ts`, `src/ai/retrieval.ts`, `src/ai/facts.md`) — notes + facts, RAG.

**Gap:** the AI can see *where it can go* and *what the page says*, but not *what it can operate*. A
form, a field, a button, a note card — none are addressable, so none show up as "things the AI can
act on."

### What the AI can DO today
`src/ai/desk-reasoner.ts` routes a request to: grounded chat, navigate, open-latest-note, summarize,
capabilities ("what can I do here"), and clarify/choices (the AI asks, the human picks — via grain's
first-class `choices` op). That last one is the seed of the interaction you want. **But every path is
single-turn:** route once, act or answer, done. There is no multi-step task the AI carries across
several actions (and across a full page load — this is an MPA).

### The "see what the AI sees" toggle today
`scripts/xray.js` (grain). It outlines every `[data-surface]` and labels it with its kind + allowed
verbs, from the same manifest projection. Entry points: `window.grain.xray`, `?xray` in the URL, any
`[data-xray-toggle]` control, and Ctrl+Shift+X. **Limits:** because so little is an operable surface,
x-ray shows almost nothing on real pages; it is outlines-only (no panel, no legend, no capability
list, no "here is what the AI would do"), and it is barely discoverable (no obvious affordance).

### The contact flow today
`view/pages/mail.html` has a **real** `<form class="compose" data-compose>` with subject/body inputs that
builds a `mailto:` and hands off to the visitor's mail app. `src/ai/actions.ts` even maps "contact" →
navigate to `/about`. **But the compose fields carry no `data-surface`, and there is no verb to set a
field or submit a form.** So today the desk can get you *near* contact, but cannot fill it or send it.
This is the exact flagship gap.

### The gaps, named
1. **Thin capability vocabulary.** Real affordances (fields, forms, links, note cards) are not
   operable surface kinds, so they are invisible to both the manifest and x-ray.
2. **No write-to-form verbs.** No `field.set` / `form.submit` (or equivalent), so the AI can read a
   page but not operate its controls.
3. **No multi-step orchestration.** The reasoner is single-turn; nothing carries a task across
   navigate → fill → confirm → send, especially across the MPA page load.
4. **Capability exposure is scattered.** What the AI can do lives in three places (the alias table,
   the manifest nav lines, the hardcoded capabilities sentence). There is no single self-describing
   catalog the model reads to *reason* about its options.
5. **x-ray under-delivers** on the one job the owner cares about: showing, richly and legibly, what
   the AI can see and do here.

---

## Implementation

### P1 — A self-describing capability manifest (the AI's "exposure")
Unify what-the-AI-can-see-and-do into one page-derived catalog the model reads. Extend the manifest
so it reports, per page: navigable routes (already there), operable controls (new), readable regions,
and the verbs each accepts — all derived from the DOM + registry, never hardcoded. Fold the scattered
capability phrasing (`actions.ts` aliases, the capabilities sentence) into this one source so "what
can I do here?" and the model's own reasoning read the *same* catalog.

### P2 — Make controls addressable + add the write verbs
- Give the real controls a `data-surface` (start with the mail compose: `field:compose-subject`,
  `field:compose-body`, `form:compose`).
- Add the minimal verb set to `grain/ai/contract.ts`: a surface kind for `field` / `form` and verbs
  `field.set` (write a value, grain-graded so it reads as AI-authored) and `form.submit`. Keep the
  vocabulary small — it "grows reluctantly" per grain's rule. These must be conformance-tested.
- The dispatcher applies them like any other op (no privileged back channel); `field.set` writes
  through the visible control with the pending → committed lifecycle, so you *see* the AI typing.

### P3 — Multi-step task orchestration that survives navigation
A small task-runner: the reasoner can emit a **plan of steps** and advance through it, persisting
state in `sessionStorage` so it resumes after the MPA page load (the same resume pattern CRUMB's
`crumb-live.js` already uses — reuse it, do not reinvent). Each step is one existing op (navigate,
`field.set`, `choices`, `form.submit`). The AI asks for missing inputs with the `choices` op / a
free-text prompt, and confirms before any irreversible step (send).

### P4 — The flagship: the contact flow end to end
"Contact them" →
1. The desk recognizes intent and asks (chat card + buttons) what the message should say and for the
   sender's email if needed.
2. Navigates to Mail for real (lamp travels, page loads, task resumes).
3. Fills subject + body via `field.set` (you watch it type, grain-graded).
4. Shows a **confirmation card in the chat** (prompt + Send / Edit / Cancel buttons — the `choices`
   op) summarizing the message.
5. On Send, `form.submit` fires the existing mailto handoff.
Every step is legible and interruptible; nothing sends without the explicit confirm.

### P5 — x-ray v2 (the improved "what can the AI see" toggle)
Rebuild the reveal as a real, legible surface (still a grain dev-island, still driven by the same
manifest so it can't drift from reality):
- A **panel/legend** (not just outlines): a list of what is operable on this page, grouped as
  See / Navigate / Operate, each with the verbs and a plain-language "the AI can: …".
- Show the new control surfaces (fields, forms) and nav targets, so on a real page it finally shows
  something worth seeing.
- A **discoverable affordance** — a labeled status-bar toggle (not only a keyboard chord), and keep
  the `?xray` shareable link.
- Optional: a "dry-run" hint — hover a surface to see the op the AI would emit.

### P6 — Conformance + a note
Conformance e2e for the new verbs and the contact task (assert the *behavior*: field written, confirm
required, submit only after confirm — grain lesson 9). Add a CRUMB tour stop demonstrating the flow.
A published note on "an AI that uses the site like you do" once it ships.

---

## Tasks

- [x] P1: extend the manifest into one page-derived capability catalog (see / navigate / operate)
- [x] P1: fold `actions.ts` aliases + the capabilities sentence into that one catalog
- [x] P2: make the contact-message field addressable and fill it through field.set.
- [x] P2: display AI provenance until the visitor edits the field.
- [x] P3: persist contact drafting across navigation with a checked failure path.
- [x] P4: recognize a message-bearing request, navigate, open Compose, and fill the body; the visitor sends.
- [x] P6: exercise on-page drafting, cross-page drafting, missing-message refusal and denied storage in browser tests.
- [x] Decide whether missing-detail collection, subject drafting or a chat review card earns the next bounded slice.
  The owner chose subject drafting on November 5, 2026. draftSubject (contact-draft.ts) takes the
  topic after "about", or the phrase without its filler opener, from the visitor's own words; the
  compose subject is registered as field:contact-subject and filled before the body, best-effort, on
  both the same-page and cross-page paths.
- [ ] Decide whether a generic planner is needed beyond the existing task-specific handovers.
- [x] P5: x-ray v2 — panel/legend + See/Navigate/Operate grouping + status-bar affordance (src/ai/xray-panel.ts, the status-bar "AI view" button, e2e/xray-panel.e2e.ts; the hover dry-run hint stays optional and unbuilt)
- [x] P6: add a dedicated contact-flow tour (content/tours/review-contact-flow-and-xray.md, which also walks the x-ray panel). A note waits on the owner's review of that walk.
- [x] Prove the model can *choose* this flow from the catalog (not just a hardcoded "contact" alias).
  November 5, 2026: the owner chose to try it. The model now has a CONTACT: token that hands the
  visitor's words to the same deterministic draft path. Measured on the real 0.5B over two runs with
  identical results: it starts the flow for 2 of 4 phrasings the fixed pattern misses ("get in touch
  with TJ about a teaching job", "how do I contact TJ"), misses 2 ("let him know…", "pass a note to
  TJ…", where it invents a page or steps, as it did before the token existed), and starts it for 0 of
  2 controls. "Who is TJ?" and "What is the BREAD stack?" still pass. The fixed pattern stays the
  first route, so nothing it caught before is now left to the model.

## Open questions / decisions

- **Model reach vs. determinism.** The 0.5B is small. How much of the flow is the model's own choice
  vs. a deterministic scaffold it triggers? Lean: model *decides to start the flow* and fills prose;
  the step machine is deterministic (reliable + offline-tolerant), matching today's Tier ~1.5 split.
- **Where "operate" verbs are allowed to live.** `field.set` / `form.submit` are general grain
  primitives (any GRAIN app would want them) vs. portfolio-specific. Likely grain, kept minimal.
- **Confirm-before-send is non-negotiable** for anything that leaves the site (mailto). Which other
  actions need a confirm gate?
- **x-ray scope:** RESOLVED November 4, 2026 by building it: the AI view button sits in the public
  status bar, so the panel is a visitor affordance, not only a dev island.
- **Privacy:** the sender's email is entered locally and handed to the visitor's own mail app; keep
  it client-only, never posted to the door.
