# Feasibility: CRUMB prefilled demos (2026-08-09)

Audit of the owner's ask, run before any build, per the request. Method: a code read of
`grain/packages/crumb`, `grain/packages/grain/ai` + `scripts/ai-dispatch.js`, and the portfolio's
`src/ai/`, `view/pages/`, `tools/export.ts`. No tests were run and no browser was driven, so every
run-time claim below is a reading with a file:line, and the one behavioural claim that matters most
(the reload loop, section 5) is flagged as wanting an e2e before it is treated as proven.

Not published: `docs/` root is unmapped in `src/content.ts`, only `docs/grain`, `docs/batch`,
`docs/mill`, `docs/proof`, `docs/crumb`, `docs/pantry` render as pages. This file is internal, same
as `docs/AUDIT-2026-08-09.md`.

## 1. The ask

Two capabilities that do not exist, so that a review link opens the deployed site with CRUMB already
pointing at what changed and the owner decides while looking:

1. **Preset steps and prefilled data.** The tour arrives with the form already filled and the flow
   already at the right step.
2. **A form or set of questions in the tour that generates a prompt the owner can copy-paste back
   into a session**, so the review loop closes without the owner writing the prompt.

## 2. Verdict

**Capability 2 is feasible now.** It is additive, needs no new grain primitive, needs no change to
CRUMB's design law, and the one piece that would otherwise be net-new (composing a prompt and
carrying it into a session) already ships in grain as `scripts/handoff.js` with zero consumers in the
portfolio.

**Capability 1 splits into three tiers of very different cost:**

| Tier | What it means | Feasible today |
|---|---|---|
| 1 | Prefill a registered **text field** | Yes, the whole mechanism already ships. Needs a doctrine amendment (section 4) and a new step field in CRUMB. |
| 2 | Preset a page's own state via **URL state** the host reads | Blocked by a defect in `crumb-live.js` (section 5). Small fix, no new vocabulary. |
| 3 | Preset arbitrary **flow position** (a drawer open, a tab chosen, a wizard on step 3) | No. There is no verb for it, and adding three would grow a ten-verb vocabulary by a third. Recommend deferring. |

So "the form already filled" is reachable. "The flow already at the right step" is reachable only as
far as the host is willing to express its own state in the URL.

## 3. What already exists (the reuse table, measured)

| Need | What ships | Where |
|---|---|---|
| Highlight a step's surface, route between steps, resume across a real page load | `crumb-live.js`, one lamp in passthrough mode, `sessionStorage` key `crumb:active` | `crumb/crumb-live.js:16,18,220-239` |
| Start a tour from a link, in demo or review mode, framed or popover | `?crumb=<id>` plus `crumb-mode`, `crumb-frame`, params consumed before the tour starts | `crumb/crumb-live.js:318-337` |
| Prefill a text field, as an approved first-class op | verb `field.set`, render op `fill`, cap `FIELD_VALUE_CAP` 2000, text-like inputs only, grain grade that settles on the first trusted input | `grain/ai/contract.ts:176`, `grain/scripts/ai-dispatch.js:318-326`, spec `grain/plans/field-set-op.md` (APPROVED 2026-07-25) |
| One field actually registered as a surface | `data-surface="field:contact-message"` on the compose body | `view/pages/mail.html:63`, named in code at `src/ai/contact-draft.ts:10` |
| A working precedent for "navigate, then prefill on arrival" | the desk's arrival stash, then `grainKit.fillOp` through the door's op path, never a direct `.value` write | `src/ai/desk-door.ts:581,609`, e2e `e2e/desk-contact-prefill.e2e.ts` |
| A code-enumerated preset walk that survives navigation | `TOUR_STOPS`, `TOUR_KEY`, the arrival stash replay | `src/ai/tour.ts` |
| Compose a prompt and carry it into a session in one click | `compose(template, payload)` plus the `data-handoff` / `data-handoff-url` / `data-handoff-source` contract, https only, opens with noopener | `grain/scripts/handoff.js`. **No consumer in the portfolio**, verified by grep. |
| The door is live on the frozen site, so an op path exists on Pages | `data-ai-transport="client"` plus the portfolio's own `desk-door.js`, loopback instead of SSE | `tools/export.ts:138`, `grain/scripts/ai-dispatch.js:392-412`, `grain/ai/client-door.ts` |
| New tour fields reach the static site for free | the export enumerates the same `content/tours` folder the server mounts and freezes each tour's JSON | `tools/export.ts:72-75` |

The honest reading of that table: capability 1 tier 1 is not a build, it is a wiring. Every hard part
was already paid for by the `field.set` work in July and the desk's arrival prefill.

## 4. The doctrinal question, and the recommended answer

CRUMB's one design law says the tour never mutates app state (`crumb/PLAN.md:43-51`). A prefill
mutates a field's value. That is a real conflict, not a technicality, and it should be settled in the
plan before code.

The law's load-bearing content is two guarantees: **no privileged back channel** and **no submit**. A
prefill raised as a `field.set` Intent keeps both. It crosses the same door as everything else, so it
inherits the accepts check, the refusal on an unregistered surface, the spotlight bracket, the
timeline entry, and the grade that settles when the human types. There is no submit verb in the
vocabulary at all, so a tour cannot send the form even by mistake. A prefill written by `crumb-live.js`
assigning `el.value` keeps neither guarantee, and is the thing the law exists to forbid.

**Recommendation:** amend the law's wording to "the tour writes only through the door, and never
submits", state the direct-DOM-write ban explicitly in the same breath, and carry the amendment into
`standards/TOUR-STANDARD.md`. The cost of taking the door route is a good cost: when the door is
offline the submit is ignored (`ai-dispatch.js:480-483`), so a prefilled tour degrades to an
unprefilled tour instead of half-filling one.

## 5. Defect found while auditing, and it blocks tier 2

`crumb/crumb-live.js:28` and `:233-237`. `routeOf` only strips trailing slashes, and the result is
compared against `location.pathname`. A step whose `at` carries a query string or a fragment can
therefore never equal the current route: `resume()` calls `location.assign`, the page loads,
`resume()` re-fires, the comparison fails again, and it assigns again. That is an infinite reload, not
a cosmetic mismatch.

Consequence for this work: `at: /mail?subject=grain`, which is the cheapest law-abiding way to preset
a page's own state, cannot be used today. The fix is small (compare pathname against pathname, assign
the full target) and belongs to phase P0 of the build with an e2e, because this is exactly the class
of thing that was read rather than run.

## 6. What does not exist (the actual work)

1. **CRUMB has no step field for prefill data**, and `check.ts` has no lint for one. The parser
   grammar is line based and closed to four meta keys (`at`, `review`, `status`, `verify`) at
   `crumb/core/schema.ts:25-27`, so a new key is a one-line vocabulary addition plus a lint.
2. **No verb for flow position.** Ten verbs exist (`item.archive`, `say.set`, `say.stream`,
   `demo.run`, `desk.stop`, `chat.send`, `note.append`, `note.replace`, `navigate`, `field.set`) over
   seven surface kinds (`grain/ai/contract.ts:24,40-42`). Nothing opens a drawer, picks a tab, or sets
   a step. The contract says the vocabulary grows reluctantly, and three new verbs is not reluctant.
3. **No third card state in the client.** `crumb-live.js` renders an intro card (step -1) and step
   cards. An "answer these and take the prompt" outro is a new state in both presentations.
4. **No clipboard anywhere in the estate**, confirmed by grep across grain and the portfolio.
   `handoff.js` is the intended answer and wants a consumer, so capability 2 should not introduce a
   clipboard as its primary path.
5. **Only one field surface is registered**, so a prefill demo has exactly one form to show until
   another page opts in. Registering one is a `view/pages/*.html` edit, which is the batch layer's
   template, not a code change.
6. **No tour on disk combines demo mode with prefill.** `content/tours/` holds one demo tour
   (`portfolio.md`) and three review tours, all of which are a look rather than a do.

## 7. Design sketch for capability 2 (the piece to build first)

Keep the grammar boring, the way `schema.ts` already is:

- One trailing `## prompt` section in the tour body, holding `- ask: <id> | <label>` lines and a
  `- template:` value that interpolates `{id}` per answer plus the tour's own `{title}` and `{id}`.
- The client renders that section as the card after the last step: the questions as fields, a live
  preview of the composed text, one `data-handoff` button whose `data-handoff-url` opens a session
  with the prompt in place, and the composed text itself in a plain textarea for anyone who does not
  want a new tab.
- Nothing is submitted to the app. The compose is client-side text and the destination is external,
  so the design law is untouched by this half of the work.
- `check.ts` gains two failures: a template that references an unknown ask id, and asks with no
  template. Both are the same shape as the existing dev-step lint at `check.ts:14-19`.

## 8. Risks and honest limits

- **The publish chain gates everything.** CRUMB is a published package and the portfolio consumes a
  real published copy, not a symlink, so any change here needs a publish plus a portfolio bump. The
  npm token is currently returning E404 (`plans/grain-0-1-18-bump.md`), so none of this reaches the
  live site until the owner clears that.
- **A prefill is declared destructive** (`field-set-op.md`, `hints.destructive: true`). On `/mail`
  that means a tour can overwrite a message a visitor was part way through writing. The tour should
  refuse to fill a field the human has already touched, which is a decision the spec did not have to
  make because the desk only ever filled on arrival at an empty field.
- **Prefill makes a review tour show a state the app did not reach on its own**, and the verification
  vocabulary has no word for that (`new`, `changed`, `needs-verification`, `verified`,
  `known-issue`). Either add a staged marker or require the step's prose to say so. Leaving it
  unsaid would make a staged screen read as a real one, which is the opposite of what the review loop
  is for.
- **Scope of the field op is text-like inputs only.** Selects, checkboxes and radios were ruled out
  deliberately in v1, so a form change involving them cannot be preset at all.
- **Two stashes will coexist.** CRUMB's `crumb:active` and the desk's arrival stash both survive
  navigation and both drive behaviour on load. A prefilled tour puts them in the same page at the
  same time for the first time, so the interaction wants a test rather than an assumption.

## 9. Recommended sequence

Owner's sequencing holds: perfect it on the portfolio and the batch stack first, then take it
outward.

- **P0.** Fix the route comparison in `crumb-live.js`, with an e2e that fails before the fix. It
  unblocks tier 2 and it is a live bug independent of this feature.
- **P1.** Capability 2: the `## prompt` outro, the handoff button, the two lints. Additive, no
  doctrine change, and it closes the loop on the three review tours already on disk.
- **P2.** Tier 1 prefill through the door, piloted on the one registered field, with the design law
  amended in `crumb/PLAN.md` and `standards/TOUR-STANDARD.md` first and the already-touched refusal
  included.
- **P3.** Tier 2 URL state on one page, once P0 has landed.
- **Deferred.** Tier 3 flow verbs, until a real change needs one and the vocabulary cost is worth
  paying.

## 10. What this audit did not check

- Nothing was run. No `bun test`, no playwright, no browser.
- The reload loop in section 5 is a code read. It is stated as a defect because the control flow is
  unambiguous, but it has not been observed, and the fix should carry the test that observes it.
- Dead-surface linting is still absent from `check.ts` by design, so a prefill pointing at a field
  surface that does not exist would be caught at tour time by the door's refusal, not by the lint.
  That is acceptable but it is worth knowing before writing the first prefilled tour.
