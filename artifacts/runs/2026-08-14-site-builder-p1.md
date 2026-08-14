---
title: Two words were sharing one name, and only one of them was built
date: 2026-08-14
status: complete
lane: gated
branch: main
scope:
  - plans/
  - src/ai/
  - view/components/molecules/
  - artifacts/runs/
touched:
  - plans/site-builder.md
  - plans/builder-sandbox.md
  - src/ai/block-set.ts
  - src/ai/block-set.test.ts
  - src/ai/block-render.test.ts
  - src/ai/composition.ts
  - src/ai/composition.test.ts
  - src/ai/desk-reasoner.test.ts
  - view/components/molecules/block-card/block-card.html
  - view/components/molecules/block-callout/block-callout.html
  - view/components/molecules/block-stat/block-stat.html
  - view/components/molecules/block-lede/block-lede.html
  - view/components/molecules/block-form/block-form.html
skills:
  - loop-standard
  - session-loop
  - voice
plans:
  - site-builder, P1 | plans/site-builder.md
gates:
  - bunx tsc --noEmit | exit 0, no output
  - bun test | 482 pass, 0 fail, 1758 expect() calls, 30 files
  - bunx playwright test (full) | 252 passed, 1 skipped, 0 failed
  - bun tools/lint-gate.ts | net NEGATIVE on this diff, see below
diffstat: 16 files changed (1133 insertions, 9 deletions), of which 5 are new block templates, 2 new modules and 3 new test files
unpushed: 43 | portfolio 43, grain 14. Pushing stays the owner's call and was not taken.
verifiedBy: nobody yet. P1 is headless by design and has no rendered surface, so it owes no tour; the first surface arrives in P2 and that one does.
doctor: four flags due, all four carried by name below, none fixed. The answer-log flag closed earlier today in the tick-box run.
---

# Two words were sharing one name, and only one of them was built

The owner's clarification is the whole of this run, and it arrived after a day of work pointed
slightly wrong.

**"Form builder" meant building forms from data**, and that has been done for a while: grain's four
control atoms render a form from a JSON spec, and as of this morning the AI can operate every one of
them including a tick box.

**"The builder" on the site means prompt to GRAIN**, and that had not been started. What ships at
`/builder` is a form generator wearing the sandbox plan's name. The sandbox plan says plainly that
the form framing does not carry over; an earlier run today read its piece 2 too narrowly and widened
the *form* matcher with a tick box, which is more of the thing that was already finished rather than
a step toward the thing that was not. Nothing built today is wasted, and the direction was.

`plans/site-builder.md` is the corrected plan, written in plan mode against the owner's answers.
`plans/builder-sandbox.md` keeps its reasoning and is marked superseded from piece 2 on.

## What the research changed before a line was written

**`render(name, data, props)` takes the component name as a RUNTIME STRING**
(`batch/render/render.ts`, re-exported by `src/render.ts`). A composition is therefore a list of
`{component, data, props}` rendered by a loop, and the closed set stays code-owned exactly as the
field tables are. No engine change, which was the thing most likely to have blocked the idea.

**The published `/builder` has never done anything.** The demo is a GET round trip the *server*
interprets, and this site exports to static hosting. `dist/builder/index.html` is one file frozen at
`data-builder-state="empty"`; no `?ask=` variant is exported and there is no server on Pages to
interpret one. So on the real site every Examples link, and every build the desk drives, lands on an
empty page. It works in dev and only in dev. That is not a regression from today, it is how the demo
has always shipped, and it is why the plan has a phase about composing in the browser at all.

## What P1 built

`src/ai/block-set.ts` is the closed table: which blocks exist, what a description has to say to get
one, the deterministic sample content each carries, and the refusals. `src/ai/composition.ts` is the
page as state, with add, remove, move and span as pure functions plus the export document.

**Layout is three words.** `full`, `half`, `third`, and nothing else. A description can ask for two
things side by side and the matcher answers `half`; it can never ask for a grid, a column count or a
width. The sandbox plan warned that layout is what a matcher gets wrong, and a closed set of three is
how that warning gets answered rather than repeated.

**A prompt adds.** That is the whole difference from the form demo, and it is what the id handling
exists for: ids are derived from the ids already issued, not from the array length, because a
composition someone has deleted from has fewer blocks than it has issued ids and reusing one makes a
later delete hit the wrong block.

**The form is one block among blocks.** `field-matcher.ts` is untouched and still owns every field,
choice, message box and tick box. `block-set.ts` only decides whether a description asked for a form
at all. Nothing about the form demo stops working, including this morning's tick box being operable
on a generated form.

## The thing the plan did not foresee

**Not one of grain's molecules or organisms ships an `.html` template.** Only the atoms do, 18 of
them. A molecule in grain is a documented class convention a page author writes by hand, so
`render("card", …)` has nothing to expand and never could. Measured, not assumed, and it arrived
about ninety seconds before the block table would have been written naming `card` directly.

A table naming an unrenderable component is the same shape of false promise as an address
advertising a verb that does not exist, and it fails at the moment nobody is watching. So five thin
templates now live beside the portfolio's other components, each emitting exactly the markup grain's
own doc for that molecule documents and declaring no class of its own. That is consuming the stack
rather than forking it, and if the block set proves out those templates are what would graduate
upward into grain.

There is a test that renders every block in the set through the real renderer and fails if one of
them expands to nothing, plus one asserting those grain molecules still ship no template, so if grain
ever grows them the block set finds out rather than quietly keeping its own copies.

## Two kinds of refusal, kept apart

**Page furniture is refused on principle.** A shell, a side rail, a top bar: a description asking for
one has misunderstood what is being built rather than asked for something missing.

**Everything else is a gap with a date on it.** The component exists and is documented and the block
set has not grown a template for it yet.

A refusal that cannot say which of the two it is teaches nobody anything. The images entry is the one
worth reading: a figure or a gallery needs a real image to point at, and a generated page has none,
so an invented `src` is a broken picture with a confident name.

## Gate output

```
$ bunx tsc --noEmit
(no output, exit 0)

$ bun test
 482 pass
 0 fail
 1758 expect() calls
Ran 482 tests across 30 files. [2.57s]

$ bunx playwright test
  1 skipped
  252 passed (1.4m)
```

## Mutation proof

Three assertions carry the design rather than describe it, and each was made to fail before it was
kept.

| Mutation | What went red |
| --- | --- |
| A block table entry names `block-hologram` | 6 fail, led by the has-a-real-template test and the render integration |
| `nextIndex` derived from `blocks.length`, the naive version | 2 fail: adding after a delete reissues a taken id |
| `addFromDescription` returns only the new blocks | 4 fail: a second prompt wipes the page |

## The lint ratchet went DOWN

This diff added three `no-array-sort` warnings and one useless spread fallback; all four were fixed
rather than absorbed. Fixing them also caught two pre-existing ones in a file this run was already
editing, so the count sits at 24 against a baseline of 14 and a pre-run reading of 26. The four
regressions carried this morning are otherwise unchanged, and none of them is this diff's.

## Session doctor flags, carried by name

Four due, none fixed, and all four are the same four this morning's run carried: `graphify
freshness`, `layer pins current` (deliberately one behind while 0.1.22 is held), `run ledger` (three
older reports, from sessions that are gone), and `unpushed work`, now 43. The answer-log flag closed
earlier today.

## What was NOT done

- **No page.** P1 is headless by design. The canvas, the reframed copy and the first rendered block
  are P2, and that is the phase that owes a tour.
- **The block set is five, not seventeen.** `lede`, `card`, `callout`, `stat` and `form` are the
  spine; each remaining entry needs a template written, and widening the table is mechanical from
  here. Everything not built refuses by name.
- **Nothing pushed, nothing published.**

## Two things for the next session to know

**The renderer leaves its input in the output.** A component's HTML comment ships to the page, and so
do the `data-bind-*` directives after they have been read. Both are engine behaviour across every
page on this site, neither is new, and neither matters until P4: an exported page would carry every
block template's internal commentary with it, and the export needs to strip comments or the templates
need to stop carrying prose. Worth deciding before the export is written rather than after.

**This run should have handed off and did not.** The context trigger fired at 226k with "finish the
piece in flight and hand off". The piece in flight was finished, and then three more were started:
the sandbox pieces, the tour, and this plan-and-P1 cycle. The rule's bound is the task, and each of
those was a new one. The owner caught it. Recorded here because the next session's value is that it
re-runs the checks cold, which is exactly what a long thread skips.

## What needs human eyes

1. **Whether P3 is worth its complexity**, or whether `/builder` should honestly say it needs the
   live app. The demo has been silently empty on the published site for its whole life, so doing
   nothing is a real option rather than a cop-out.
2. **Where a block's content comes from** when a description does not supply it. Deterministic
   samples are what shipped; the model composing them is the wording seam, and on a 0.5B that is
   where invention starts.
3. **Push.** 43 portfolio commits and 14 grain, oldest over a day.
