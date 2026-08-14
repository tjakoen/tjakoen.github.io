---
title: The AI learns to edit a page, not just describe one
date: 2026-08-14
status: complete
lane: gated
branch: main
scope:
  - plans
  - src/ai
  - e2e
  - content/tours
  - artifacts/runs
  - ../grain/packages/grain/ai
  - ../grain/packages/grain/scripts
touched:
  - plans/site-builder.md
  - plans/builder-design.md
  - src/ai/canvas-dom.ts
  - src/ai/canvas.ts
  - src/ai/builder-canvas.ts
  - e2e/builder-canvas.e2e.ts
  - content/tours/review-block-verbs.md
skills:
  - tour-standard
  - loop-standard
  - voice
plans:
  - builder-design, D3 (the vocabulary half) | plans/builder-design.md
gates:
  - bunx tsc --noEmit (portfolio + grain) | exit 0, no output, both
  - bun test (portfolio) | 504 pass, 0 fail, 31 files
  - bun test (grain) | 362 pass, 0 fail, 38 files
  - bunx playwright test (full) | 275 passed, 1 skipped, 0 failed
  - bunx crumb check content/tours | 18 tours, all pass
diffstat: 13 files changed across two repos, three commits: grain d1a5993 (8 files), portfolio 2b3f08f (5 files) and faf6bb0 (2 plan files)
unpushed: 52 | portfolio 52, grain 15. Both held; pushing stays the owner's call and was not taken.
verifiedBy: nobody yet. content/tours/review-block-verbs.md is written, its three surfaces resolve, two steps are needs-verification and none is verified.
doctor: four flags due, carried by name below, none fixed.
---

# The AI learns to edit a page, not just describe one

The owner's framing set this one up: the builder is a proof of concept for GRAIN composed by an AI,
one page on purpose, and **the bar is a small model rather than a good one**. Both of those were
true and written down nowhere, so they went into the plans first (`faf6bb0`).

Then the concrete gap. **D2 created an asymmetry.** A human could remove, reorder and resize a
block, and the model could not: its only lever is writing a description, and no description means
"drop the second card" because the matcher only ever adds. A composed page was something the AI
could describe into existence and never touch again.

## The journey, and it is the tick box's

Prove no existing verb covers it. Add a KIND, because a kind is a promise about which verbs work.
Keep every verb a SET so a replay is safe. Add the render op. Let the address land LAST.

`field.set` writes text into a control and `navigate` changes screen, so neither drops a block, and
stretching one would have put a block on an address advertising a write that lands, reports success
and changes nothing. That is the exact failure `check.set` exists to record.

## Three verbs, shaped for a small model

Every payload is a closed word list, and the payload's own description NAMES the legal words,
because that is the difference between a 0.5B picking one and a 0.5B guessing.

| Verb | Payload | The decision in it |
| --- | --- | --- |
| `block.remove` | none | Emits the EXISTING `remove` op rather than a fourth kind. Deleting the element is the effect, and a new kind doing the same thing is vocabulary for its own sake. |
| `block.span` | one of full, half, third | Idempotent by construction. A cycle would land somewhere different on a replay and the hint would be a lie. |
| `block.move` | up or down | **Not an index.** An index is a number to compute against a list length, which is where a small model drifts. Up and down are already written on the buttons a human presses, so the verb looks like the affordance rather than the array under it. |

**No verb ADDS a block**, deliberately. Adding goes through `field.set` on the page's own prompt plus
a build, so the model never names a component, which is the rule the whole demo rests on.

## The handshake, which was the real work

The AI does not call the page's code. It raises an Intent, grain's reasoner answers with a render
op, and grain's dispatcher applies that op to the addressed cell, because a reasoner reaching into a
module's variables would be the privileged AI-to-DOM back channel the architecture refuses.

So after an op the DOM is right and the page's composition is stale, and stale is not cosmetic: the
next prompt appends to a page that still holds the block the AI removed and paints it back. A delete
that lands, reports success and undoes itself is the same silent lie one control over.

`readComposition` derives membership, order and span from the canvas and keeps each block's data
from what it already knew, because rendered markup cannot be read back into a block's data without
guessing, and guessing is how a form block loses its spec.

**Three findings inside that.**

**A MutationObserver, not the `change` event.** The span and move ops fire one; `block.remove` rides
the generic `remove` op, which deletes the element and announces nothing. One watcher that sees all
three beats two mechanisms and a gap.

**`subtree: true` is load-bearing, not caution.** A span op sets the attribute on a CELL, and an
`attributeFilter` without a subtree only watches the canvas element's own attributes. Without it,
remove and move were noticed and span silently was not, which is worse than none of them working
because two out of three looks like it works.

**Reconciling repaints the chrome, never the canvas.** The dispatcher already changed the canvas,
and rebuilding it would throw away the AI ink grain put on the cell it touched.

## Gate output

```
$ bunx tsc --noEmit          # portfolio, then grain
(no output, exit 0, both)

$ bun test                   # portfolio
 504 pass  0 fail            Ran 504 tests across 31 files.

$ bun test                   # grain
 362 pass  0 fail            Ran 362 tests across 38 files.

$ bunx playwright test
  1 skipped
  275 passed (1.4m)

$ bunx crumb check content/tours
  ✓ review-block-verbs — 3 step(s), dev      (18 tours, all pass)
```

## Mutation proof

| Mutation | What went red |
| --- | --- |
| The page stops watching the canvas for AI ops | 4 e2e fail, led by the one that matters: after an AI remove, the next prompt paints the block straight back |
| The dispatcher's span op stops firing its `change` | 1 grain test fails: the op mutates the element and tells nobody |
| A new render op kind, unlisted in the vocab reference | caught before either of the above: grain's own drift guard failed the moment `span` and `move` existed in the contract and not in the reference |

The third one was not a deliberate mutation. It fired on the first run, which is the guard working.

## What was NOT done, and it is the interesting half

**Nothing chooses these verbs yet.** The desk cannot turn "drop the second card" into
`block.remove` on `b2`. The vocabulary exists, the ops apply, the page reconciles, and the reasoner
that maps a sentence onto a block is the next piece. That is precisely where the small model earns
its place, and it is the honest state: this run made the page OPERABLE by an AI rather than operated
by one.

Also not done: the block set is still five, D4's copy rewrite, and nothing pushed or published in
either repo.

## Session doctor flags, carried by name

Four due, none fixed, same four as the last four runs. `graphify freshness`. `layer pins current`,
one behind on purpose while grain 0.1.22 is held. `run ledger`, older reports from sessions that are
gone. `unpushed work`, now 52 in the portfolio and 15 in grain, both held on purpose: grain resolves
through a symlink to the working tree, so the portfolio is already consuming this change and a
publish would be a separate decision.

## The review

<https://tjakoen.github.io/builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%20and%20a%20stat&crumb=review-block-verbs&crumb-mode=dev&crumb-frame>

Three steps: the rail the verbs were shaped against, the canvas where the addresses landed, and the
spec pane that proves an AI edit reached the artifact rather than only the picture. The middle step
asks the reviewer to run one line in the console, because that is what the dispatcher does and there
is no reasoner yet to ask.

## What needs human eyes

1. **The kind's name and level.** `block` with three verbs, in grain's contract, so every GRAIN app
   inherits them. Right level, or should it be wider, a `region` that any rearrangeable list uses?
2. **Whether the reasoner is next**, or whether the block set widens past five first.
3. **Push, and publish.** Two repos now hold held work: 52 portfolio commits and 15 grain, and grain
   0.1.22 is still unpublished by choice.
