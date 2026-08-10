---
id: crumb-prefilled-demo
status: doing
track: ai
depends: []
touches:
  - docs/CRUMB-PREFILL-FEASIBILITY-2026-08-09.md
  - content/tours/
  - docs/crumb/WRITE-A-TOUR.md
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
submits" rather than carving out an exception. Settled, and settled before P2 needed it: the amended
law is the one design law in `docs/crumb/WRITE-A-TOUR.md`.

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
- [x] **P2. Prefill one registered field through the door.** Done 2026-08-10, the portfolio half. The
      law question was not a blocker in the end: it was settled before this phase started, and the
      amended law already stands in `docs/crumb/WRITE-A-TOUR.md`, so `TOUR-STANDARD.md` only gained
      the authoring rule that falls out of it (a step that stages state says so in its own prose,
      because a staged screen otherwise reads as one the app reached by itself). The pilot tour is
      `content/tours/say-hello.md`, three steps, ending on `field:contact-message` with a staged
      draft. Getting there needed a fix nobody had planned: the compose panel starts collapsed and
      CRUMB has no flow verbs, so `/mail#compose` had to actually open the panel on a cold load before
      a tour could reach the field at all. That is now one reveal function with two callers, and it
      fixes a real defect for people too, since the panel's own href had only ever worked after a
      click. `prefill` is documented in `docs/crumb/WRITE-A-TOUR.md`. The walk itself is unverified and
      stays that way: the pinned `@tjakoen/crumb` predates the key and reads the line as prose, so the
      e2e sits behind the same publish as P1b.
- [x] **P3. Preset a page's own state via URL state.** Done 2026-08-10, on the calendar's feed. The
      page picked itself: its three filter tabs were the only real page state on the site that a
      person could reach and a link could not, and unlike the mail folders (the other candidate) the
      feed is a pure filter over a server-rendered list, so the same address gives everyone the same
      view. The tab now lives in the URL as `?feed=notes|all`, read on boot and written back on every
      click with the same replaceState the notes feed already uses for `?tag=`. The default drops the
      parameter, an unknown value lands on the default rather than an empty page, and every parameter
      the island does not own is carried through, because a tour arrives with its own. That last
      detail is what makes the preset honest: a person clicking a tab produces the address, so
      `at: /calendar?feed=notes` asks for nothing a visitor could not have asked for. The tour is
      `content/tours/review-calendar-feed-state.md`, walked in a browser: one navigation, the URL
      settles, the Notes tab is selected on arrival, twelve note cards visible and nine hidden. Four
      e2e cases in `e2e/calendar.e2e.ts`, and a fifth spec that had been red since the tabs landed in
      `c359d35` is green again, fixed by the very thing this phase built. Cost: two hours, no new
      CRUMB vocabulary, no new verb. Unlike P1 and P2 this needed nothing unpublished, so its e2e is
      committed green rather than parked behind the pin.
- [ ] **Deferred: flow verbs.** No `drawer.open` or `tab.select` until a real change needs one.

## Verification

Each phase owes a dev tour, per LOOP section 4a, and P1 is the first phase whose own output is a tour
feature, so its tour doubles as the demonstration.
