---
id: crumb-review-loop
status: doing
track: ai
depends: []
touches:
  - content/notes/ten-times-zero.md
  - content/tours/
  - docs/crumb/
  - e2e/
  - standards/LOOP.md
  - standards/SESSION-LOOP.md
  - ../grain/packages/crumb/
  - ../grain/packages/proof/
owner: ai
---
# The review loop — CRUMB dev tours as the check-changes surface

> Owner idea (2026-08-08): whenever changes land in a GRAIN project, the AI should reach for CRUMB
> at the check-changes moment, and that reach should be part of the workflow rather than something
> the owner re-asks for each time. PROOF rides along on the gate side.

The check-changes moment today is a diff pasted into chat. The reviewer reads code to find out what
a person would have seen. CRUMB already has the shape that fixes this and it has never been pointed
at a real change.

## What already exists (do not rebuild)

CRUMB's tour model carries a review vocabulary that was designed for exactly this. Every step can
take `review` (what changed here), `verify` (how a human confirms it), and a status from
`new | changed | needs-verification | verified | known-issue`. `parseTour` validates it, `crumb check`
lints it, `crumb-live.js` drives the lamp and the popover, and the top bar already has a Review mode
toggle that flips a tour into showing those fields.

The one tour on this site, `content/tours/portfolio.md`, is `mode: demo` and already fills in `review`
and `status` on four of its five steps. So the review fields are exercised and rendered. What has
never existed anywhere in the estate is a tour written to review a change: no file carries `mode: dev`,
and no tour has ever been authored at the end of a piece of work.

## What is not the answer

`crumb/from-timeline.ts` is the package's flagship generator and it is the wrong input for this.
It projects grain's runtime audit trail, `LogEntry[]`, which records the AI acting through the app's
visible door. A coding session editing source files produces no `LogEntry` at all. The two are
different events that happen to share the word "the AI did something".

So the first review tours get hand authored. The agent knows which surfaces its edit affected, the
schema is six fields, and `crumb check` catches a malformed one. A `crumb from-diff` generator stays
deferred until hand authoring proves noisy enough to be worth a file-to-surface map.

## The blocker C1 surfaced, and its fix

A tour step is addressed by a `data-surface` value, because that is what the lamp lights. The change
picked for the first tour is the six live figures in the flagship post, and **none of them carries a
`data-surface`**. Surfaces on this site are stamped by grain view templates through
`data-bind-data-surface`; content rendered by MILL gets none, and stamping surfaces on rendered
content is listed in `docs/mill/ARCHITECTURE.md` as a planned piece that was never built.

The cheap fix, and the reason C1 is still small: each figure is raw HTML hand written inside the
markdown and already carries a stable per-figure identifier, `data-live-figure="multiplier"` and its
five siblings. Adding `data-surface="figure:multiplier"` next to it is one attribute per figure in one
file. No MILL change, no template change. Grain's lamp already targets any `[data-surface]`, and
`tools/audit.ts` counts surfaces as an AEO signal, so six new ones move a number that is already
tracked.

## C1 — prove dev mode against a real change

The first tour reviews the live-figures work, commits `8255f2e` and `213a34e`: six static SVG figures
in the post upgraded to the interactive ones from the talk, then a spacing fix after the ratio figure
collided with the paragraph above it.

Retro rather than at the genuine check moment, and that is a known limit of this step. C1 tests
whether dev mode reads well against real surfaces. Whether the workflow feels right is what L1 to L3
test, and they only start after this one lands.

- [x] Add `data-surface="figure:<name>"` to the six live figures in `content/notes/ten-times-zero.md`.
- [x] Confirm the lamp lights a figure and the popover lands somewhere readable next to it.
- [x] Author the review tour, `mode: dev`, one step per figure that changed.
- [x] Pin it with an e2e spec, `e2e/crumb-review-tour.e2e.ts`, three tests, green.
- [ ] Owner call: dev tours ship to the live public site. Keep them public or hide them.
- [x] Owner call answered: review tours stay public. Already the behaviour, no change needed.
- [x] The linkable tour. `?crumb=<id>&crumb-mode=dev&crumb-frame` on any host URL, built in CRUMB.
- [ ] Publish `@tjakoen/crumb` and bump the portfolio, or the link only works against a staged copy.
- [ ] Tighten `crumb check` so a `mode: dev` step missing `review` or `status` is an error, not a shrug.

### What C1 taught

**The surface fix worked and was as small as hoped.** Six attributes in one file. MILL passes raw
HTML in a markdown body straight through, so a `data-surface` written next to the existing
`data-live-figure` arrives in the rendered page untouched. No MILL change, no template change. The
surface sits on the same element as the widget hook, so a tour and the figure script cannot disagree
about which figure they mean.

**Dev mode reads well against a real change.** The rail lists the six figures with their status
chips, the review note explains what moved, and the verify hint tells a human what to actually do.
It is better than a diff for this kind of change, which was the thing C1 existed to find out.

**`tours/review/` is not possible.** `crumb/loader.ts` reads a tours folder with a flat `readdir`
and no recursion. A subfolder is invisible to it. The tour is therefore
`content/tours/review-live-figures.md`, a filename prefix rather than a folder. Either that becomes
the convention, or the loader learns to recurse. Filename prefix is cheaper and this plan assumes it.

**Dev tours are published.** `content/tours/` is the folder the server mounts and `tools/export.ts`
enumerates it, so every tour exports to the static Pages build automatically. A review tour is not
internal scratch. It goes on the live site unless something changes, which is an owner call, not a
detail.

**There was no way to hand someone a tour, and now there is.** `crumb-live.js` could only start from
a `data-crumb-start` control already on the page or from `window.crumb.start(id)`, and it read no URL
parameter. A review tour is written for one change and handed to one person, so the handoff is a
link. Built in CRUMB the same day: any host URL takes `?crumb=<id>`, plus optional `crumb-mode` and
`crumb-frame`. The params are stripped before the tour starts, because a tour navigates for real and
a leftover param would reset it to its intro card at every hop.

It is verified against a copy staged into `node_modules`, not against a release. **`@tjakoen/crumb`
has to be published and the portfolio bumped before the link works anywhere but this machine.**
Nothing about that is done, and the plan should not read as though it is.

## C2 — `proof verify` (built 2026-08-08)

`proof check` lints plan files and never looks at a diff. `proof verify` adds the diff pass and turns
two LOOP checklist items mechanical.

- [x] Changed files not in a `doing` plan's `touches`, reported as scope growth.
- [x] A tick the diff itself added, with no change under that plan, reported as an unbacked claim.
- [x] A plan moved to `done` by the diff with nothing under its `touches`, reported as unsupported.
- [x] Nonzero exit, so CI can run it the way it runs `proof check`. `--base` verifies a whole branch.
- [x] 24 tests, pure core plus an injected `GitReader`, so the suite never shells out to git.

`touches` is already a declared envelope in every plan on this board and nothing has ever enforced it.
LOOP section 4b asks for the scope cap to be enforced mechanically where the tooling allows. This is
that, and the tooling allows it.

**Only the unbacked tick fails the gate.** Scope growth and an untouched done are warnings, because
both have honest explanations: work legitimately grows, and code often lands in an earlier commit
than the one being verified. A gate that cries wolf gets muted, and a muted gate is worse than none.

**What it refuses to do quietly.** A `doing` plan with no `touches`, or one whose `touches` all point
outside the repo, cannot be judged at all. Both are reported rather than passed, because a checker
that stays silent about what it skipped reads as "all clear".

**One check was redesigned on contact.** The original bullet said "a ticked checklist item with no
matching change in the diff". A checklist item is prose; nothing mechanically maps it to a hunk. What
IS mechanical is the tick the diff itself adds: if this change ticks a box in plan X, this change had
better touch something in X's `touches`. Narrower than the bullet promised, and actually true.

**First real run found two things, in this plan.** Pointed at the C1 commit it flagged
`e2e/crumb-review-tour.e2e.ts` as outside every plan's `touches`, which was a genuine gap in this
file's own frontmatter, now fixed. It also flagged `docs/crumb/GETTING-STARTED.md` as belonging to a
plan that is already `done`. That one is fair and left standing.

## L1 to L3 — the wiring (only after C1 lands)

- [ ] L1. LOOP and SESSION-LOOP carry the rule: a change to a rendered surface owes a dev tour before
      it counts as done. Add it to the SESSION-LOOP chores table, which already has the right shape.
- [ ] L1b. LOOP section 2's heartbeat table has two mechanical triggers, push and session start. The
      hook adds a third, turn end. Grow the table and say so rather than letting it drift.
- [ ] L1c. LOOP section 1's primitives table maps PROOF to persistent state and omits CRUMB entirely.
      If dev tours become run evidence, CRUMB earns a row.
- [ ] L2. A `review-changes` skill in the standards set: how to pick the surfaces, how to write a
      `verify` line a human can actually execute, which status to stamp.
- [ ] L3. A Stop hook that fires only when the diff touches a file that renders a `[data-surface]`.
      Advisory, never blocking.

## The failure mode this is designed against

LOOP section 7 is the table of rationalizations that talk a run out of the contract. The way this one
dies is not rejection, it is noise: the hook asking for a tour after a docs edit, a parser change, a
CLI flag. Three false asks and it gets muted, and a muted gate is worse than no gate. L3's trigger
condition stays narrow from the first day it exists.

## The honest limit

The tour is written by the agent that wrote the change. That does not satisfy LOOP section 2's verify
rule, which asks for a pass by someone who did not write it. It is still one pass. What the tour does
is make the second pass cheap: the reviewing session walks surfaces instead of cold reading a diff,
and the human walks the real page instead of trusting a screenshot. The gate and the review are
different jobs. `proof verify` is the gate. The tour is the review surface. Neither is the other.
