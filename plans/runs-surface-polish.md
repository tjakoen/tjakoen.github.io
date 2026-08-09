---
id: runs-surface-polish
status: doing
track: ai
depends: []
touches:
  - ../pantry/app.ts
  - ../pantry/pantry.css
  - ../pantry/app.test.ts
owner: unassigned
---

# The run ledger, read at two altitudes

`/runs` and `/runs/<id>` shipped 2026-08-09 (pantry `6f6cced`). Both work and both are a first cut.
Two asks from the owner the same day, and they are the two altitudes the surface is currently missing.

## The index wants a shape, not a list

Right now it is a card grid ordered by date, which answers "what happened last" and nothing else. The
questions it should answer are about the series: is adherence improving, when did the gaps cluster,
which run is the one that grew past its scope. A timeline or flow reading of the same data is the
natural form, and the repo already has the pieces:

- **`/timeline` already exists** and is git-derived plan bars with dependency arrows. Runs are dated,
  scoped and evidenced, so they are the same kind of series. The first question is whether this is a
  new view or a **layer on the timeline that already ships**, and the second answer is cheaper and
  probably better.
- **FIGURES owns the form.** Any diagram here follows the flow scaffold and the palette, and mermaid
  does not reach a published page. A timeline of runs is a data-viz figure, not a decoration.
- **The honest limit:** four or five reports is not a series. This is worth building when the ledger
  has enough entries that a shape exists to see, and building it against five will produce a chart
  that looks like a chart and says nothing.

## The detail page is one long scroll

It renders, in order: missing evidence, scope growth, the meta, the gates, the plans, the dirty
files, the scope, the touched, the skills, then the whole report body. That order is deliberate (what
is missing first, the run's own prose last, because the body is where a run is most able to sound
finished) and it should survive whatever the reorganisation is.

What it needs on top of that:

- **A summary at the top**, before anything else: status, date, diffstat, evidence score, whether
  scope grew. The one-line answer to "do I need to read this".
- **Grouping, so the middle is skimmable.** Tabs, a sidebar, or accordions. Accordions are the
  cheapest and need no client script, which matters because every other PANTRY surface except
  `/decisions` and `/map` is static server-rendered and adding a script here would be the first
  exception with no reason behind it.
- **Gate output has to stay expanded, or expanded by default.** Collapsing the verbatim output behind
  a click is the one move this page must not make: LOOP §4a's whole point is that the evidence is
  present rather than summarized, and a thing behind a click is a thing nobody opens.

## Known rough edges, already seen live

- A long diffstat runs three lines on a card and squashes its neighbour. Truncating it was rejected
  (this page does not shorten evidence), so the fix is layout. **Fixed:** its own line on the card.
- The meta definition list wraps into ragged columns at some widths. **Fixed:** each fact is capped
  at 60ch and the row aligns to the top, so a long verified-by line stops stranding its neighbours.

## Tasks

- [x] Decide: a runs layer on `/timeline`, or a separate view. **A layer on `/timeline`, and not yet.**
      The two arguments settle it together: the timeline already draws dated, dependency-linked bars
      from real git commits, and a run is the same kind of dated thing, so a second view would be a
      fork of a drawing that exists. And the ledger holds five reports. Building either shape against
      five produces a chart that looks like a chart and says nothing, which is this plan's own
      warning. The decision is made; the drawing waits for the data.
- [x] The detail summary block first. Five facts — outcome, closed, diffstat, evidence carried, scope
      held or grown — as a strip above everything else. Label over value, the same way round as the
      meta list below it.
- [x] Grouping for the middle sections, accordions unless there is a reason to take a script.
      `<details>` on Plans claimed, Declared scope, Touched and Skills, each carrying its count in the
      summary line so a shut section still informs. No script: this stays the static surface it was.
- [x] Keep gate output out of any collapse, and add a test that asserts it. Nothing folds above the
      body: the gap list, the scope growth, the gates and their results and the report's own prose all
      stay open. The test asserts the gate output sits after the last `</details>` and that no fold is
      open across any of the four sections above it.
- [x] The card layout fix for long diffstats. The diffstat gets its own line rather than trailing the
      date run; truncating it stays rejected.
- [ ] Revisit the timeline once the ledger has enough entries to have a shape.

## What is still rough

The strip's diffstat repeats the one in the meta list a screen below. That is the summary doing its
job (it is the fact most likely to decide whether to read on) rather than a duplication to remove,
but if the meta list is ever reworked, this is the pair to look at.
