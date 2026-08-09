---
id: crumb-prefilled-demo
status: doing
track: ai
depends: []
touches:
  - docs/CRUMB-PREFILL-FEASIBILITY-2026-08-09.md
  - content/tours/
  - standards/TOUR-STANDARD.md
  - view/pages/
  - e2e/
owner: ai
---

# CRUMB prefilled demos: preset steps, prefilled data, and a tour that writes the next prompt

The feasibility audit is the substance and lives at
[`docs/CRUMB-PREFILL-FEASIBILITY-2026-08-09.md`](../docs/CRUMB-PREFILL-FEASIBILITY-2026-08-09.md).
This plan is the build order, and it does not restate the audit.

**Where the work lands.** Most of it is in `grain/packages/crumb` (the parser grammar, the client, the
lint), which is a different repo, so this plan tracks the portfolio half: the tours, the standard, the
one registered field surface, and the e2e that holds it. CRUMB is a published package, so nothing here
reaches the live site until the npm token clears (`grain-0-1-18-bump`).

**The one thing to settle before code.** Prefill is a write, and CRUMB's design law says the tour
never writes. The audit recommends amending the law to "writes only through the door, and never
submits" rather than carving out an exception. That is an owner call, and P2 is blocked on it.

## Phases

- [ ] **P0. Fix the route comparison in `crumb-live.js`.** A step whose `at` carries a query string or
      fragment reloads forever. E2e first, so the loop is observed rather than argued. Independent of
      this feature and worth landing alone.
- [ ] **P1. The tour that writes the next prompt.** A trailing `## prompt` section (`- ask:` lines plus
      a `- template:`), rendered as the card after the last step, composed client side, handed off with
      grain's existing `data-handoff` contract, plus a textarea for anyone who does not want a new tab.
      Two new `check.ts` failures. Additive, no doctrine change.
- [ ] **P2. Prefill one registered field through the door.** Blocked on the law amendment. Pilot on
      `field:contact-message`, refuse to fill a field the human has already touched, and say in the
      step's prose that the state was staged.
- [ ] **P3. Preset a page's own state via URL state.** One page, after P0.
- [ ] **Deferred: flow verbs.** No `drawer.open` or `tab.select` until a real change needs one.

## Verification

Each phase owes a dev tour, per LOOP section 4a, and P1 is the first phase whose own output is a tour
feature, so its tour doubles as the demonstration.
