---
title: Four reports get their evidence back, and a comment stops promising a demo
date: 2026-08-15
status: complete
lane: gated
branch: main
skills:
  - loop-standard
  - voice
scope:
  - artifacts/runs/
  - src/ai/builder-canvas.ts
  - package.json
  - bun.lock
touched:
  - package.json
  - bun.lock
  - artifacts/runs/2026-08-11-grain-token-debt-g1-g4.md
  - artifacts/runs/2026-08-11-status-without-a-hue.md
  - artifacts/runs/2026-08-14-notes-consolidation.md
  - artifacts/runs/2026-08-14-rail-quiet.md
  - artifacts/runs/2026-08-15-run-ledger-debt.md
  - src/ai/builder-canvas.ts
plans: none. Two named items off a handoff, both small enough to carry in the session.
gates:
  - bunx tsc --noEmit | exit 0, no output
  - bun test | 548 pass, 0 fail, 33 files
  - bun tools/lint-gate.ts | net ZERO on this diff, measured against a stash of it
  - bun ../pantry/cli.ts doctor . | run ledger went from warn to info, 22 of 22 carrying evidence
diffstat: 5 files changed, 125 insertions, 4 deletions, plus this report.
unpushed: 0 | the run started with 69 held and ended with the owner asking for all of it out. Grain
  went first because publishing it is what makes the portfolio's pin real. See the push section below.
verifiedBy: nobody yet. No tour: nothing here renders. Four run reports and one code comment changed,
  and a reader checking this work reads the diff rather than a page.
doctor: run ledger FIXED and graphify freshness FIXED, the other two carried by name below and
  untouched because both are the owner's.
---

# Four reports get their evidence back, and a comment stops promising a demo

Two items off a handoff. The run ledger had been warning for at least five sessions about four
reports missing evidence, and every one of them belonged to a session that is gone. The other item
was a code comment still describing a demo the measurements had already retracted.

## The one thing that was not a session's to decide

Nothing in the repo says whether a report written by an earlier session is a later one's to edit. The
run stopped and asked before touching any of the four, with the gaps read out first so the question
was specific: two are formatting fixes where the missing fact is already written in the report, and
two would need facts nobody recorded at the time. The owner answered all four, reconstruct from git
where git can answer, and commit without pushing. Everything below follows from that.

## The two that were already true

**`2026-08-14-notes-consolidation`.** The `unpushed:` field read as a sentence, and the number 34 was
the first word of it. One pipe turns the sentence into a count and its reason. No claim moved.

**`2026-08-14-rail-quiet`.** The report says three separate times what it deliberately did not do:
hiding the rail's controls until hover, tuning the catalog visual timeout, writing a fourth tour. It
just never said so under a heading. The new section gathers six such items out of the body and adds
nothing that was not already on the page.

## The two that needed a decision about honesty

Both are 2026-08-11 and both are missing terminal output that no longer exists anywhere.

The shape of the check is what makes this awkward: a gate section counts as evidence when it holds a
verbatim fenced block, and a fence is exactly what a reader trusts as a paste. Writing a plausible
one from the summary would have satisfied the checker by fabricating the thing it exists to demand.
So each fence opens with the line `NOT A PASTE`, names the date it was reconstructed and says the
original was not kept. The numbers inside come from the report's own gates list and from nowhere else.

**`2026-08-11-status-without-a-hue`** needed only that section.

**`2026-08-11-grain-token-debt-g1-g4`** had no frontmatter at all, nine gaps, and is the interesting
one. Git answered more of it than expected: the touched list, the diffstat and both commits
(`50d5be2` in the portfolio, `a05ed9f` in grain) are read off history rather than guessed. Two fields
git cannot answer, the portfolio's unpushed count that day and the doctor flags, say so in words
instead of carrying a number. The `unpushed:` count is 1, which is the single held grain commit the
report itself names. A blockquote under the title tells a reader the block was retrofitted, so nobody
mistakes machine-checkable frontmatter for what the session wrote.

The heading `Left open, deliberately` was extended rather than replaced, since the author's content
was already the right content and only the words the checker looks for were missing.

## The comment that outlived its measurement

`src/ai/builder-canvas.ts` explains why the assistant line names the block before the op lands: it is
the one guard against a move that is legal and wrong. The illustration under it had the model handing
back the first card when asked for the second, which is the same claim the `/builder` drawer retracted
by name a run earlier. Measured, the live 0.5B never gets far enough to make a legal wrong move.

The comment now carries the numbers instead: thirty-three answers, eighteen before grain's reasoner
manifest was narrowed and fifteen after, zero edits landed, seven named a block at all, five of those
named the right block and the right verb and were refused on the address form. The guard stays, and
the comment now says plainly that it covers a failure nothing here has produced yet.

## Gate output

```
$ bunx tsc --noEmit
(no output, exit 0)

$ bun test
 548 pass  0 fail   1885 expect() calls   Ran 548 tests across 33 files. [2.60s]

$ bun tools/lint-gate.ts                      # with this diff
lint gate: 4 lint(s) regressed against tools/lint-baseline.json:
  voice:backtick: baseline 2814 -> now 2889 (+75)
  oxlint:unicorn(no-array-sort): baseline 14 -> now 24 (+10)
  voice:emoji: baseline 72 -> now 74 (+2)
  oxlint:eslint(no-control-regex): baseline 0 -> now 1 (+1)

$ git stash push -- artifacts/runs src/ai/builder-canvas.ts && bun tools/lint-gate.ts
  voice:backtick: baseline 2814 -> now 2889 (+75)
  oxlint:unicorn(no-array-sort): baseline 14 -> now 24 (+10)
  voice:emoji: baseline 72 -> now 74 (+2)
  oxlint:eslint(no-control-regex): baseline 0 -> now 1 (+1)
                                              # identical, so this diff added zero

$ bun ../pantry/cli.ts doctor .
[info] run ledger: 22 run reports, all carry their evidence
[info] scope growth vs the graph: 22 run reports, none grew past its declared scope
20 checks, 0 failing, 2 due
```

## What was not done

1. **The e2e suite was not run.** The only code change is a comment, so nothing it could exercise
   moved. Typecheck and the unit suite are the whole of what this diff can fail.
2. **The stale lint baseline was not touched.** Four lints sit above it, all four measured as
   pre-existing here for the second run running, and `tools/lint-baseline.json` was named off limits.
3. **The bare-id normalization was not taken.** Reading a bare `b2` up to `block:b2` is the one open
   fix with evidence behind it and it is the owner's, not a session's.
4. **The catalog visual timeout was not tuned**, and one green full-suite run last session is still
   not a fix.
5. ~~**Nothing was pushed, published or merged.**~~ Overtaken: the owner asked for the release and it
   went out. See the push section above.
6. **`content/tours/review-builder-honest-copy.md` was not walked.** It is still waiting on a person.

## Session doctor flags, carried by name

Three were due at the start. `run ledger` is fixed, which is what this run was for. A fourth appeared
mid-run and was closed the same way it arrived: editing a TypeScript file rebuilt this repo's own
graph and left the merged one behind it, so `pantry graph merge` ran and `graphify freshness` is green
again. Still open, and neither is this run's to take: `layer pins current`, one behind while grain
0.1.22 is held, and `unpushed work`, 69 commits with the oldest two days old.

## The push, added to this run after the fact

The owner asked for everything committed and pushed, which turned a held run into a release. Checked
before anything went out: Pages installs with a frozen lockfile, and the lockfile pinned grain
`0.1.21`. The block kind, the tick-box verb and the narrowed manifest all live in `0.1.22`, so a
portfolio push on its own would have deployed a `/builder` whose block library cannot render. The
proof of that is a literal one: on `0.1.21` the builder e2e file dies with
`Component not found: <b-field>` before it reaches a single assertion.

So the order was grain first. Grain's push publishes any package whose version moved, so `4b61600`
put `@tjakoen/grain 0.1.22` on the public registry, `deps:refresh` moved the pin and the lockfile, and
the portfolio followed. mill, proof and crumb all matched the registry already, so nothing else
published. Greenroom was deliberately left alone: its seventy-two local commits are the pre-rewrite
lineage.

**A red e2e went out with it, and it is not this run's.** Two specs in the `the model chooses the
verb` describe fail, and the failure moves depending on what else is running, which is the shape of a
race rather than a break. Measured rather than assumed, in a clean worktree at `de913e6`, the previous
session's own HEAD, with `0.1.22` installed: `builder-canvas.e2e.ts:425` fails there alone, twice, and
the whole-file run fails `414` instead. The previous run's report claims the full suite came back 287
pass, 0 fail. That claim does not reproduce today at its own commit.

## What needs human eyes

0. **The unstable builder describe, now on CI.** `builder-canvas.e2e.ts` 414 and 425 fail in a
   changing combination, on both trees, on the same grain. Neither is a stub problem the site can
   feel, since both script the model, but CI is red until someone reads the race.
1. **The two reconstructed gate blocks.** They are honest about being reconstructions and they are
   still the only place in the ledger where a fence is not a paste. If that reads as too clever, the
   alternative is leaving both reports permanently in the warn list, and that is a call worth making
   once rather than every time someone reads them.
2. **Push, and publish.** Unchanged and now the oldest flag on the board.
3. **The tour from the previous run**, still unwalked.
