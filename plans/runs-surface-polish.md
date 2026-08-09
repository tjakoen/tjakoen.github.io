---
id: runs-surface-polish
status: todo
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
  (this page does not shorten evidence), so the fix is layout.
- The meta definition list wraps into ragged columns at some widths.

## Tasks

- [ ] Decide: a runs layer on `/timeline`, or a separate view. Answer this before drawing anything.
- [ ] The detail summary block first. It is the smallest change and the one that pays every visit.
- [ ] Grouping for the middle sections, accordions unless there is a reason to take a script.
- [ ] Keep gate output out of any collapse, and add a test that asserts it.
- [ ] The card layout fix for long diffstats.
- [ ] Revisit the timeline once the ledger has enough entries to have a shape.
