---
title: The builder page stops promising a demo it does not give
date: 2026-08-15
status: complete
lane: gated
branch: main
scope:
  - view/pages/builder.html
  - src/ai/block-reasoner.ts
  - src/ai/block-reasoner.test.ts
  - e2e/builder-canvas.e2e.ts
  - content/tours
  - plans
  - artifacts/runs
touched:
  - view/pages/builder.html
  - src/ai/block-reasoner.ts
  - src/ai/block-reasoner.test.ts
  - e2e/builder-canvas.e2e.ts
  - content/tours/review-builder-honest-copy.md
  - plans/builder-design.md
  - artifacts/runs/2026-08-15-builder-honest-copy.md
skills:
  - voice
  - tour-standard
plans:
  - builder-design, Open 3 and Open 4 | plans/builder-design.md
gates:
  - bun run check (tsc --noEmit) | exit 0, no output
  - bun test | 548 pass, 0 fail, 33 files, 1885 assertions. Four of those tests are new here (block-reasoner.test.ts went 16 to 20)
  - bunx playwright test | 287 pass, 1 skipped, 0 fail, 1.5 minutes. The FULL suite, not the one spec
  - bunx playwright test e2e/builder-canvas.e2e.ts | 35 pass, 0 fail, 7.3s, run alone before the full suite
  - bunx crumb check content/tours | 20 tours, all ok, the new one 2 steps dev
  - bun run lint (oxlint) | zero findings in either file this run touched. The seven warnings it prints are all in files this diff does not open
  - bun run lint:voice | zero flags on view/pages/builder.html and zero on the new tour
  - bun tools/lint-gate.ts | net ZERO on this diff, measured by stashing it and rerunning. Identical four regressions before and after, so they are the stale baseline and not this work
  - bun ../pantry/cli.ts graph merge | 5719 nodes, 8845 edges, written. The doctor flag it was raised for is cleared
diffstat: 5 files changed, 190 insertions, 20 deletions, plus one new 34-line tour.
unpushed: 69 | portfolio, of which 4 are this session's. Grain untouched and its 19 stay where they were. Nothing pushed, and pushing stays the owner's call.
verifiedBy: nobody yet. Two surfaces render and both are stamped needs-verification in the tour, because the author of a change is one pass and not two.
doctor: four flags due at session start. One fixed (graphify freshness), three carried by name below.
---

# The builder page stops promising a demo it does not give

Yesterday's measurement ended with a sentence that had become false. The drawer on `/builder` told
every visitor that the honest demo is the one where you watch the model pick the wrong block. It was
a good line and it was written before anyone had asked the live model to edit anything. Thirty-three
answers later, across two shipped configurations, the model has never picked a wrong block, because
it has never got as far as picking a block and having the move land. The page was advertising a
failure mode more sophisticated than the one it actually has.

The second half of the problem was smaller to describe and worse to look at. About half the model's
post-narrowing answers now name the right block and write its address short, and grain refuses those
with `no surface "b2" on this screen`. That sentence was reaching the page verbatim. It is exactly
right in a console and it is a developer talking to a developer on a page a visitor is reading.

Nothing about how the page behaves changed in this run. The whole diff is what the page says about
itself, plus the tests that hold those words in place.

## What the drawer says now

Three paragraphs after the four-line vocabulary list, and the order is deliberate. First the counts,
because a retraction with no numbers under it is just a mood: thirty-three answers, eighteen before
the manifest was narrowed and fifteen after, seven that named a block, five that named the right
block and the right verb and were refused on the address form, no correct edit in either set. Then
the retraction by name, so a reader who saw the old sentence knows it was withdrawn rather than
quietly deleted. Then the split, which is the part worth landing: describing a page works and works
without a model at all, editing one is the model's job and this model cannot do it yet.

The claim that survived is the one the same runs actually prove, and it is the stronger of the two.
The canvas came back byte-identical in every run. Every wrong answer was caught, nothing moved, and
the page said which refusal it was. So the demo people watch is the fence holding, which is a duller
sentence and a truer one.

The numbers are labelled a snapshot of this build in the copy itself, not a standing fact about small
models, because they are one model on one page at one size.

The same sentence lived in one other place, the closing line of the header comment in
`block-reasoner.ts`, and it was replaced there with the measurement rather than left to contradict
the page it describes.

## Two audiences, two sentences

`refusalSaid` derives the visitor's line from the move and the live manifest. grain's reason still
goes to the console through `because`, word for word, so nothing was lost in making the page
readable.

Derived rather than pattern-matched against grain's prose, and that was the one design call in this
run worth arguing. Matching on the words would have been fewer lines. But grain owns those strings
and is free to reword them, and page copy that silently degrades to a generic sentence the day an
upstream string moves is worse than copy that never depended on it. So the branches ask the manifest
the same questions grain asked, and answer them in English.

Five branches. A reply with nothing in it. A verb no action on the page can make, which only convicts
when the manifest carries an actions list to convict against, because a manifest without one is not
evidence. A verb with no target. A target that is not on the page, which splits: if the address is
one prefix short of a real block it says so by name, and otherwise it names the blocks that are
actually here. A target that is here and does not take the change. Then the payload fallthrough.

**Nothing was softened into a success.** That was the hard stop on this run and it is worth stating
where the temptation was: the near-miss branch. It knows the model meant the right block, it says so
in the sentence, and it still refuses, because normalizing a bare id up to `block:<id>` is an open
decision about how forgiving the fence should be and it is the owner's, not a session's. A test
asserts that no refusal wording contains a word that would read as something having happened.

## Gate output

```
bun run check                          exit 0, no output
bun test                               548 pass, 0 fail, 33 files, 1885 assertions
bunx playwright test                   287 pass, 1 skipped, 0 fail, 1.5m
bunx playwright test builder-canvas    35 pass, 0 fail, 7.3s
bunx crumb check content/tours         20 tours ok
bun run lint                           0 findings in the two touched files
bun run lint:voice                     0 flags on builder.html, 0 on the new tour
bun tools/lint-gate.ts                 net zero on this diff, proved by stash
```

**The two red gate timeouts did not reproduce.** The handoff listed them as blocked and they were
not touched, tuned, or retried until green. The full suite was run once, cold, and it came back
clean: `catalog (/catalog) matches its visual baseline` passed in 7.7s against a 5000ms expect
timeout, which it can do because the timeout is per assertion and not per test. That is consistent
with the load reading already in the plan and it is not a fix. One green run does not close a
flake, and nothing in this diff addresses it.

Three e2e expectations changed and no e2e test was added. The three refusal cases in
`builder-canvas.e2e.ts` asserted the old prefix, and two of them would have kept passing on a
sentence a visitor cannot read, which is what made them worth rewriting rather than deleting. The
count stayed at 35 on purpose: adding cases to this suite is the thing the load-edge item is
sensitive to, so the new near-miss branch is covered by unit tests instead.

## What was not done

- **The bare-id normalization was not taken.** It is the one open fix with evidence behind it, five
  of fifteen answers are one prefix from a pass, and it is a decision about the fence rather than a
  cleanup. Blocked on the owner and left blocked. The refusal copy names the gap without closing it,
  and the tour asks about it directly.
- **Nothing was pushed.** 65 portfolio commits were already ahead at session start and this run takes
  it to 69. Grain was not opened at all, so its 19 are untouched.
- **Grain 0.1.22 was not published**, and the layer pin stays one behind.
- **The lint baseline was not refreshed.** It regresses by four lints and none of them are this
  diff's, proved by stashing.
- **The prompt-side `block:` prefix was not retried.** Measured worse twice, reverted, and the
  comment on `blockMessage` carries the numbers.
- **No word-list fallback was added to the edit path.**
- **`builder-canvas.ts` still carries the old wrong-block sentence** in a comment at line 350. It is
  outside this run's scope cap by one file. It is a comment rather than page copy, so nothing a
  visitor reads is affected, and it is flagged here rather than fixed quietly.
- **No live WebGPU run of the edit path.** See below.

## What the owner answered, and what it changed

Asked in chat, because the decision inbox has dropped four rounds: has the 0.5B ever run on this
machine outside the bundled headless Chromium? **Yes, in a real browser.**

That narrows the open question rather than closing it, and the plan now says so. WebGPU here is real
and the model loads outside the harness, so the audit numbers are not an artifact of a headless-only
graphics stack. What has still never happened is `/builder`'s EDIT path being driven by hand. The
tour's second step is written so a walk on this machine settles it.

## Doctor flags, carried

- **graphify freshness: fixed.** `pantry graph merge`, 5719 nodes and 8845 edges.
- **layer pins current: carried.** grain 0.1.21 against 0.1.22, and the publish is blocked on the
  owner.
- **run ledger: carried.** Four of twenty-one reports missing evidence. This report is not one of
  them, and fixing the other four is somebody's session and was not this one's scope.
- **unpushed work: carried, and now the oldest flag here.** 65 commits, oldest two days. Push is the
  owner's call.

## What needs human eyes

The whole run, which is why the lane is gated. Both changed surfaces are copy, a passing test cannot
read, and the author of a change is one pass.

Walk it:

```
/builder?crumb=review-builder-honest-copy&crumb-mode=dev&crumb-frame
```

Two steps, both stamped needs-verification, and the tour ends with the two questions the walk cannot
answer itself: whether anything in the new copy overclaims or underclaims, and whether a bare id
should be normalized up now that you have seen a refusal for yourself.
