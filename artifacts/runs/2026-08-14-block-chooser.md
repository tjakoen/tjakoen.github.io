---
title: A sentence picks the verb, and a second spec goes over the same edge
date: 2026-08-14
status: complete
lane: gated
branch: main
scope:
  - src/ai
  - view/pages/builder.html
  - view/components/pages/builder
  - e2e
  - plans
  - content/tours
  - artifacts/runs
touched:
  - src/ai/block-command.ts
  - src/ai/block-command.test.ts
  - src/ai/builder-canvas.ts
  - view/pages/builder.html
  - view/components/pages/builder/builder.css
  - e2e/builder-canvas.e2e.ts
  - content/tours/review-block-chooser.md
  - plans/builder-design.md
skills:
  - loop-standard
  - voice
  - tour-standard
plans:
  - builder-design, D3b and D4 | plans/builder-design.md
gates:
  - bunx tsc --noEmit | exit 0, no output
  - bun test | 531 pass, 0 fail, 32 files
  - bunx playwright test (full) | 284 passed, 1 skipped, 2 FAILED. See the gate section, one of them is mine.
  - bun tools/lint-gate.ts | net ZERO on this diff, measured against a stash. The gate is already red at HEAD by exactly the same four counts.
diffstat: 8 files changed, 6 modified and 2 added
unpushed: 55 | portfolio 55, grain 15. Both held. Pushing was not taken and stays the owner's call.
verifiedBy: nobody yet. Tour written: content/tours/review-block-chooser.md, four steps. Three surfaces shown inline in the session at http://localhost:3141/builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
doctor: four flags due, carried by name below, none fixed.
---

# A sentence picks the verb, and a second spec goes over the same edge

D3 shipped its vocabulary half a day early: three verbs, a `block` kind in grain's contract, an
address on every cell. The half that was missing was the one that chooses. A block could be dropped,
resized and moved, and the only thing that had ever raised one of those Intents was a test. That is
closed. Two owner calls were settled first, and one answer that should have been on disk was not.

## The answers were gone, and I checked properly this time

The owner said they had pressed Finish on three review tours and that not recording it was my fault.
It was worth checking rather than repeating the memory's claim, so: `plans/decisions/answers.jsonl`
holds 21 answers with a newest entry of 2026-08-13, the three tour refs `review-block-verbs`,
`review-builder-workbench` and `review-page-builder-canvas` appear zero times in it,
`pantry answers list` reports "Nothing unread", and there is no second log anywhere. Not in `/tmp`,
not in pantry, grain, crumb or bread, and the config's `answersLog` resolves to the file that is
missing them. Four rounds have now been swallowed.

What made it recoverable is that the questions live in the tour files rather than in the log, so the
round was re-asked in chat from the prompt cards verbatim rather than by making the owner walk three
tours again. Chasing the write path is filed as the next piece of work, at the owner's yes, and it
sits outside this run's scope cap.

## The kind question, settled

`block` stays. The argument that decided it was not generality but this estate's own precedent:
`check` was made its own kind rather than folded into `field` exactly so the advertisement stayed
honest per control, every kind grain has is concrete rather than an umbrella, and `region.resize`
taking full, half or third reads wrong because those are grid words rather than bounds. Renaming
later costs one contract edit and one attribute, and by then a second rearrangeable surface would be
shaping the name instead of a guess.

## What chooses

`src/ai/block-command.ts`, deterministic, which was also the owner's call. Three verbs, three width
words, two directions, and a target that is a kind, a position or an id the rail is already
printing. Nothing in that sentence is left for a small model to invent, which is the law
block-set.ts and field-matcher.ts already state about component names.

It goes out through `window.grain.door` and never through the page's own `applyOp`. That is the
whole claim rather than a purity preference: calling the local op function would be quicker, would
look identical on screen, and would be a demo of the rail wearing a prompt bar. Sending a verb and
an address down the same wire a rail button uses is what proves a block can be operated by something
that knows only those two things. The chain is five links and only the first is new, so a passing
e2e means all five ran: the chooser resolved a target, the door validated the Intent, grain's
reasoner answered with a render op, the dispatcher applied it to the addressed cell, and the page
derived its composition back off the DOM.

Two guards are load-bearing and neither was obvious until it was written:

- **An empty page never yields a command.** "Drop in a card" is an ordinary way to ask for a card,
  and on a page with nothing to drop it can only mean the add it sounds like. The guard is what lets
  `drop` stay in the remove list, and `drop` is the verb in the sentence this phase is named after.
- **The width word is read as the last of the three to appear.** `third` is both a width and a
  position. "Make the second one a third" and "make the third card half" both read correctly under
  that rule and both read wrong under first-match. The target search then stays to the left of the
  width, and the trailing space on that slice is load-bearing too: every token test here is padded
  on both sides, so a slice ending exactly where the width begins cuts the last word's right-hand
  space off and the page stops seeing a card at all. Three tests failed on that before it was found.

## What it refuses, which is the half worth trusting

An edit that names two blocks, or none, changes nothing and says what it counted. The refusals are
not politeness; each one records a rule. A nudge is refused with the three words, because
`block.span` is a set for the reason `check.set` is: a verb that changes whatever is there lands
somewhere else on a replay and cannot honestly carry `idempotent: true`. A move further than one
place is refused because "to the top" is a loop rather than a verb. Two changes in one sentence are
refused because the door takes one Intent and doing half of what was asked is worse than doing none.

The e2e case that matters most is the ambiguous one, and it is worth saying why: a refusal that
quietly fell through to the matcher would ADD a card on being asked to remove one, because "remove
the card" contains the word card. It changes nothing, and the test asserts nothing changed.

## D4, the copy

Five paragraphs of argument on a page whose job is to be operated. Rewritten shorter, leading with
what you can type, with the vocabulary as a four-line list rather than prose and the editing
sentence in it at all, which it was not before. The two kinds of refusal stayed, because that is the
honest half rather than the decorative one. Closed by default, the owner's call the same day.

## Gate output, and the one that is mine

```
$ bunx tsc --noEmit
(exit 0, no output)

$ bun test
 531 pass
 0 fail
 1857 expect() calls
Ran 531 tests across 32 files. [2.82s]

$ bun tools/lint-gate.ts --write
lint gate: refusing to raise the baseline. These counts would go UP:
  voice:backtick: baseline 2814 -> now 2887 (+73)
  oxlint:unicorn(no-array-sort): baseline 14 -> now 24 (+10)
  voice:emoji: baseline 72 -> now 74 (+2)
  oxlint:eslint(no-control-regex): baseline 0 -> now 1 (+1)
(identical with this diff stashed — already red at HEAD, not this work)

$ bunx playwright test
  2 failed
    e2e/grain-page.e2e.ts:182:3 › AI: 'Watch the AI act' drives the surface through the door
    e2e/visual.e2e.ts:53:3 › catalog (/catalog) matches its visual baseline
  1 skipped
  284 passed (3.6m)

$ git stash -u && bunx playwright test   # the same suite at HEAD
  1 failed
    e2e/visual.e2e.ts:53:3 › catalog (/catalog) matches its visual baseline
  1 skipped
  278 passed (3.8m)
```

Two failures, and the second one is the finding:

1. `visual.e2e.ts` catalog, `Timeout 5000ms exceeded`, no pixel diff. The one already filed, still
   the owner's call, untouched.
2. `grain-page.e2e.ts:182`, the /grain door test. It passes alone in 11.3s. It passed in a FULL
   suite at HEAD, measured by stashing this diff and running the whole thing: 278 passed, 1 failed.
   With this diff: 284 passed, 2 failed. So this is not someone else's and not a hypothesis. The
   seven e2e cases D3b adds pushed a second spec over the same parallel-load edge the catalog spec
   is already sitting on.

I am not tuning it, and I am not deleting coverage to protect an unrelated spec either. The real
knob is the suite's worker count on this machine, and turning it is the same class of decision as
raising the catalog timeout, which the owner already refused once. Both are now the same open item
rather than two, and it is filed rather than retried: this is the second instance of one cause.

## Session doctor flags, carried by name

- **graphify freshness**, merged-graph.json predates this repo's own extraction. Untouched.
- **layer pins current**, grain 0.1.21 < 0.1.22. Deliberate: 0.1.22 is held unpublished and the
  portfolio resolves grain through a local symlink, which is what makes the block verbs work at all.
- **run ledger**, 4 of 17 reports missing evidence. Untouched, and this report is written to the
  shape that check wants.
- **unpushed work**, 55 commits. Named in the frontmatter as a number. Not pushed.

## What was not done

- **The answer channel was not fixed.** Diagnosed as far as "the answers are genuinely not on disk
  anywhere", which is as far as this run's scope cap reaches. The owner said yes to a session
  chasing it; that session has not been opened.
- **The block set was not widened past five**, per the hard stops.
- **No verb that adds a block**, per the hard stops, and the plan now says why in the copy as well.
- **Nothing was pushed and grain 0.1.22 was not published.**
- **The five remaining tour questions were not asked.** Three of the eight gated today's work and
  were answered; aside default, static-host fix, block wording and the two "what next" calls are
  still recoverable from the tour files whenever someone wants them.

## What needs human eyes

Walk `review-block-chooser`. Four steps, and the one to be sceptical about is the canvas step: watch
WHICH card goes when you say "drop the second card", because the second card and the second block
are different blocks and only one of them is right.
