---
title: A box to type a prompt into, and a box the demo can tick
date: 2026-08-14
status: complete
lane: gated
branch: main
scope:
  - src/ai/
  - view/pages/
  - view/components/pages/builder/
  - e2e/
  - plans/
  - content/tours/
  - artifacts/runs/
touched:
  - src/ai/field-matcher.ts
  - src/ai/field-matcher.test.ts
  - src/ai/builder-page.ts
  - src/ai/builder-page.test.ts
  - src/ai/form-draft.ts
  - src/ai/desk-door.ts
  - src/ai/desk-reasoner.ts
  - src/ai/desk-reasoner.test.ts
  - view/pages/builder.html
  - view/components/pages/builder/builder.css
  - e2e/desk-form-build.e2e.ts
  - plans/builder-sandbox.md
  - content/tours/review-tick-box-verb.md
  - content/tours/review-controls-complete.md
skills:
  - loop-standard
  - voice
plans:
  - builder-sandbox, pieces 1 and the safe half of 2 | plans/builder-sandbox.md
gates:
  - bunx tsc --noEmit | exit 0, no output
  - bun test | 434 pass, 0 fail, 1641 expect() calls, 27 files
  - bunx playwright test (full) | 252 passed, 1 skipped, 0 failed
  - bun tools/lint-gate.ts | unchanged from the pre-existing four, this diff adds none
diffstat: portfolio 17 files changed across two commits (459 insertions, 32 deletions), plus this report
unpushed: 40 | portfolio 40, grain 14. Both predate this run in part. Pushing stays the owner's call and was not taken.
verifiedBy: nobody yet. Both pieces were driven in a real browser and shown in the session, and there is a review tour (content/tours/review-tick-box-verb.md, link at the end) covering this run and the verb's. Every step is new, changed or needs-verification: none is stamped verified, because the author wrote it.
doctor: no new flags. The four carried in the tick-box verb's own report this morning are unchanged and still carried by name there.
---

# A box to type a prompt into, and a box the demo can tick

Two pieces of the sandbox plan, taken in the order the plan gives them, on top of the tick-box verb
that shipped earlier the same day.

## Piece 1: the prompt area becomes a composer

The page asked you to describe a form and then gave you nowhere to describe one. The only ways in
were an example link and the desk. There is a real box now, and it holds the prompt that produced the
page, so a visitor edits what they asked for rather than retyping it.

**The round trip behind it is a plain GET form back to the same route**, and that is the part worth
keeping rather than a detail of how it was wired. Submitting builds `/builder?ask=…` exactly as the
example links do, so every state on the page stays a shareable, reproducible address. And it works
with JavaScript off, because none of it is JavaScript. There is an e2e that loads the page in a
context with scripting disabled, types a prompt, submits, and asserts the form came back.

It renders through `b-memo` rather than `b-textarea`, and the reason is the one `b-memo`'s own header
records: a textarea has no value attribute, so the current ask has to arrive as content, which is
what the data-first atom already does. The box carries `field:builder-ask`, so the desk can draft a
prompt into it through the one door rather than the page growing a second way in, and a test asserts
that address never collides with a generated message box's.

## Piece 2, the safe half: the closed set grows a tick box

The plan warns that this piece is the one most likely to be got wrong by widening the table too fast,
and names two answers: every catalogued component, or the handful that compose cleanly. This run took
neither. It took the smallest widening that exists, **a fourth control inside forms**: a consent box,
a newsletter opt-in, and a copy-me-in box. The component dimension past forms entirely is untouched
and is still what is left of the piece.

**It could not have shipped a day earlier, and that is the whole argument for the ordering.** Until
`check.set` existed this morning, the only verb for a form control wrote the control's value, and a
tick box's value is what the form submits rather than whether it is ticked. Generating one would have
put a control on the demo page that the demo's own closing move, the desk filling in what it just
built, could not touch. That is the page overselling itself quietly, which is the failure this whole
demo is an argument against.

So the generated address is `check:builder-<name>` and never `field:builder-<name>`; the demo fill
became two maps rather than one, because the two kinds of control take two different verbs; and the
stash carries them apart so the filler never has to guess which verb a surface wants. That guess is
exactly what the two surface kinds exist to remove, and putting it back one layer down would have
undone the morning's work.

**Nothing generated comes up pre-ticked.** A form nobody has filled in must not claim they agreed to
anything. The box renders clear, the desk ticks it afterwards through `check.set`, visibly and
grain-graded, and the first click of the visitor's own settles the ink to theirs.

## Shown, not described

Both pieces were driven in a real browser and shown inline in the session rather than reported as
working: the composer holding a typed prompt with the built form below it, and a generated consent
box carrying the required marker and wearing the tick the desk put there, beside an untouched
newsletter box.

**The screenshots were the weaker half and they were nearly the whole of it.** They were captured and
read by the author rather than displayed, which is the author looking at their own work twice, and it
took the owner asking to catch. The review tour below is what the loop actually asks for here, and it
was written after that prompt rather than before it. Worth recording, because a run that shows its
work only when asked has not learned the rule.

## The review tour

`content/tours/review-tick-box-verb.md`, four steps and a hand-back, covering both this run and the
verb's own. Every step's surface was checked to resolve on the page it names, `crumb check` passes on
the folder, and the walk was stepped through in a browser rather than assumed to load. Nothing is
stamped `verified`, because the author wrote it.

**Hand it over:**

```
http://localhost:3000/about?crumb=review-tick-box-verb&crumb-mode=dev&crumb-frame#contact
```

One older tour was corrected rather than left to mislead: `review-controls-complete`'s
`catalog:check-from-data` step told a reviewer that finding an address on that atom meant someone had
tidied away a limit. That is now exactly what correct looks like. The step keeps its history and says
the limit closed, because a tour is a receipt for the day it was written and rewriting it to look
right afterwards is the one thing a receipt must not do.

## Gate output

```
$ bunx tsc --noEmit
(no output, exit 0)

$ bun test
 434 pass
 0 fail
 1641 expect() calls
Ran 434 tests across 27 files. [2.52s]

$ bunx playwright test
  1 skipped
  252 passed (1.4m)
```

## What was NOT done

- **The component dimension**, which is the ambitious half of piece 2 and the real work in it.
- **Pieces 3, 4 and 5**: the AI narrating its selection, the preview tab with a code switcher, and
  the catalog sidebar default. Untouched.
- **Nothing was pushed or published.**

## What needs human eyes

1. **The three new entries in the closed set** and their labels: "I agree to the terms", "Send me
   occasional updates", "Copy me in". They are page copy as much as data, and the consent one is the
   only control in the whole set marked required.
2. **Whether the desk should tick a consent box at all** in the demo. The argument for is that a box
   the desk leaves alone demonstrates nothing, this form submits nowhere, and the state is AI ink any
   click settles. The argument against is that consent is the one thing an AI ticking on someone's
   behalf reads badly, even in a demo. It is one line in `form-draft.ts` to change.
3. **The composer's copy**, "Build it" and the note under it.
