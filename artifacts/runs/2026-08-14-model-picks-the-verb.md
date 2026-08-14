---
title: The model picks the verb, and the page stops pretending when it cannot
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
  - src/ai/block-reasoner.ts
  - src/ai/block-reasoner.test.ts
  - src/ai/block-command.ts
  - src/ai/block-command.test.ts
  - src/ai/builder-canvas.ts
  - src/ai/desk-reasoner.ts
  - src/ai/desk-door.ts
  - view/pages/builder.html
  - view/components/pages/builder/builder.css
  - e2e/builder-canvas.e2e.ts
  - content/tours/review-block-chooser.md
  - plans/builder-design.md
skills:
  - loop-standard
  - voice
plans:
  - builder-design, D5 | plans/builder-design.md
gates:
  - bunx tsc --noEmit | exit 0, no output
  - bun test | 544 pass, 0 fail, 33 files
  - bunx playwright test e2e/builder-canvas.e2e.ts | 35 passed
  - live sweep | 20 form-shaped prompts, rail and canvas in sync, no false refusals
diffstat: 11 files changed across two commits
unpushed: 58 | portfolio 58, grain 15. Both held. Pushing was not taken and stays the owner's call.
verifiedBy: nobody yet, and one claim is UNPROVEN by design — see "What the gates cannot reach".
doctor: four flags due, carried by name in the sibling report for this day, none fixed.
---

# The model picks the verb, and the page stops pretending when it cannot

Two things came back from the owner within the hour of shipping D3b. One was a defect. The other was
that the whole feature was pointed the wrong way.

## The defect, and why the fix is a grammar rule

"I prompted a form and nothing shows." Reproduced by sweeping twenty form-shaped prompts against the
running page: `a form to sign up` contains " up ", so the word-list chooser read it as a move, went
looking for a form on the page to move, found none, and refused to build the form it was being asked
for. The rail and the canvas were never out of sync; the block was simply never added.

The instinct is to delete `up` from the direction list. That buys one prompt and leaves the shape of
the bug in place, because every verb word is also an ordinary English word: `drop`, `above`, `below`,
`full`, `size`. A word list can only ever grow another hole.

So the rule became grammar. You edit "the card" and you ask for "a card". A command has to point at
something that already exists, and a bare direction word stops meaning a move at all, because it
says which way and never that. Committed as `0e1a167` with six descriptions pinned as tests, each
one carrying a live verb word.

That rule then had to tighten once more, and the second version is the one that is right. "A card
above the fold" carries both "the" and "card" and points at nothing, because the card comes first
and what follows the article is a fold. The marker has to be followed by a block noun. Both mistakes
here cost something real: a false no sends an edit to the matcher, which adds rather than edits, and
a false yes sends a description to the model, which answers that no verb applies, and the
description never gets built at all.

## The reversal, and it is the right one

"This NEEDS to use the AI when prompting, we just guide it right?"

Worth saying plainly, because it is true of more than the new part: nothing on `/builder` called a
model. The composer picks components by word list and has since it was written, and D3b picked verbs
the same way. Two hours earlier in the same session the owner had chosen "deterministic word list,
no model" for the chooser, so the call was put back to them as a reversal rather than assumed, with
the counter-evidence attached: this estate's own desk audit found that deterministic widening beats
prompt tuning on the 0.5B, and that letting it enumerate route names made it invent slugs.

The framing in the question is what makes it work. The model does the understanding, code does the
enumerating. Settled: the verbs first, no fallback when the model cannot run, start now.

## What it actually does, and whose code does it

grain already owned every piece except the narrowing, which is the answer to "consume the stack,
never fork it" rather than a happy accident:

    the router (portfolio)   is this a description or an edit? no model, no word list, grammar
    domManifest (grain)      what blocks are here and which verbs each one accepts, off the live DOM
    buildReasonerPrompt      the one-door preamble plus that manifest plus the human's message
    desk complete (new seam) one JSON move from the 0.5B the desk already has loaded
    parseModelMove (grain)   pull a move out of whatever prose the model wrapped it in
    validateMove (grain)     legal verb, real target, target accepts it, payload schema
    block-reasoner (new)     the three block verbs only, and their closed WORD lists
    window.grain.door        the Intent, out the same wire a rail button uses

The new seam is `DeskReasoner.complete`, one structured completion sharing the desk's engine. It is
there rather than in the builder's own island for a reason that shows up on a laptop: a second
island calling `loadEngine` would put a second 0.5B on the GPU.

## Three things worth carrying

**grain's validation is not the whole fence, measured.** `validateMove` checks the payload's SCHEMA,
so `span: "wide"` is a string where a string was required and passes. A test asserted a refusal and
got a command. The dispatcher would refuse it a beat later into the console, which a visitor reads
as nothing happening after the page announced a change. The closed word lists are checked here now,
before the page says anything.

**A legal move that is not an edit had to be refused too.** `field.set` on this page's own prompt box
is a perfectly legal move on this manifest, and letting it through would have the model type into
the box you just asked a question in.

**A top-level await broke an unrelated test, and the reason is worth knowing.** Importing grain's
model modules at the top of `builder-canvas.ts` defers the whole module's evaluation, which defers
`boot()`, which is what installs the MutationObserver that notices an AI edit. A span test that had
been green all day went red. The imports are lazy now: nothing needs grain until an edit is being
read, and by then a model call costs far more than an import.

## What the gates cannot reach

The real 0.5B choosing a real verb. Headless CI has no WebGPU, so the e2e drives a scripted engine
through the same seam, which proves the chain and not the model. `bun run audit:desk` is the harness
that drives a live model, and it scores desk chat scenarios rather than builder edits. So the honest
claim is: everything around the model is proved, and the model's own hit rate on "the second card"
is unmeasured. It needs an audit scenario, and that is the next piece of work.

The limit under that is not a gap and will not close. Validation catches a verb that does not exist,
a target that is not here, a payload of the wrong shape. It cannot catch a move that is legal and
WRONG: asked for the second card a small model may hand back the first, and b2 is as real an address
as b4. The page names the block it is about to touch before it touches it. The honest demo is the
one where you can watch it pick the wrong block.

## Gate output

```
$ bunx tsc --noEmit
(exit 0, no output)

$ bun test
 544 pass
 0 fail
 1871 expect() calls
Ran 544 tests across 33 files. [2.81s]

$ bunx playwright test e2e/builder-canvas.e2e.ts
  35 passed (14.4s)

$ (live sweep, 20 form-shaped prompts against the running page)
OK: all 20 prompts composed, rail and canvas in sync, no refusals
```

The full suite was not re-run after the rewrite. The two known reds stand from the earlier run this
day and are unchanged in cause: the catalog visual spec, and `grain-page.e2e.ts:182` tipping over the
same parallel-load edge. This work did not add e2e cases on balance, so that pressure is where it was.

## What was not done

- **The real model was never driven end to end.** No WebGPU headless, no audit scenario yet. Named
  above rather than implied by a green suite.
- **The answer-channel bug was not chased.** Still filed, still outside the scope cap.
- **Nothing else was left describing the old design.** The review tour was rewritten with the change
  rather than after it, because a tour that documents a chooser which no longer exists is worse than
  no tour: it reads as evidence. `crumb check` passes on four steps.
- **Nothing was pushed, and grain 0.1.22 was not published.**
- **The block set was not widened past five**, per the hard stops.

## What needs human eyes

Open `/builder` on a machine with WebGPU, build a page with two cards, and type "drop the second
card". Watch which one goes. That is the one thing no test in this repo can tell you.
