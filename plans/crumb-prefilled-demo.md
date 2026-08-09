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

- [x] **P0. Fix the route comparison in `crumb-live.js`.** Done 2026-08-09, crumb `core/nav.ts` plus a
      drift-guarded mirror in the client. A step's `at` may now carry query state and reaches it in one
      navigation. Verified in a browser against the local package: one navigation for the query-state
      step, and the URL settles.
- [x] **P1. The tour that writes the next prompt.** Done 2026-08-09. The reserved `## prompt` section,
      rendered as the card after the last step in both presentations, composed live, offered as a
      readonly field that selects on focus plus a handoff button when the host loaded grain's
      `handoff.js`. `check.ts` fails an ask the template never uses. Walked in a browser, both
      presentations, and the tour for it is `content/tours/review-prompt-card.md`.
- [ ] **P1b. The portfolio e2e, and the publish it waits on.** The portfolio consumes a real published
      `@tjakoen/crumb`, so an e2e for P0 and P1 can only be committed green after crumb `0.1.8` is
      published and the pin bumped. The npm token returns E401 as of 2026-08-09, so this is owner-gated.
      Until then the review link works locally and shows the old parse on the live site.
- [ ] **P2. Prefill one registered field through the door.** Blocked on the law amendment. Pilot on
      `field:contact-message`, refuse to fill a field the human has already touched, and say in the
      step's prose that the state was staged.
- [ ] **P3. Preset a page's own state via URL state.** One page, after P0.
- [ ] **Deferred: flow verbs.** No `drawer.open` or `tab.select` until a real change needs one.

## Verification

Each phase owes a dev tour, per LOOP section 4a, and P1 is the first phase whose own output is a tour
feature, so its tour doubles as the demonstration.
