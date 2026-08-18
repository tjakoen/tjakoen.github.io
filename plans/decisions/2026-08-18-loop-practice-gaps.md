# Decision — the three calls under loop-practice-gaps

- **Date:** 2026-08-18
- **Gates:** `plans/loop-practice-gaps.md` from todo to buildable
- **Verdict:** **All three settled as recommended.** A test failure reaches the model rather than
  only the transcript, `opusplan` becomes the machine default on a week's trial, and the worktree
  unit is the session.

## What this is, and what it is not

The three decision documents already in this folder are research verdicts: a question, a method,
evidence, then an answer the evidence forced. This one is not that. These are three owner choices
about how much teeth the loop gets, and no amount of measurement decides them, because each one
trades a real cost against a real benefit and the exchange rate is a preference. Recorded here
anyway, in the same folder, because the next session needs to know they were made deliberately
rather than defaulted into. The evidence below is about what the options actually cost, not about
which one is correct.

## 1. The test gate reaches the model, and never blocks

**The question.** `review-gate.sh` runs `bun run check` and `tools/lint-gate.ts` and nothing runs
`bun test`. When that changes, does a failing test stop the turn?

**Why the obvious binary was the wrong frame.** The file's own header argues for advisory
throughout: a gate that fails a turn over a soft signal is a gate that gets removed within the week.
That reasoning is sound and it does not apply here, because a failing test is not a soft signal. It
is the same class of finding as a type error, which the file already treats as the one check worth
its cost. So the header's argument does not settle it.

What settles it is a measurement from 2026-08-10, written up at the top of `context-trigger.sh`: a
Stop hook that exits zero prints to the transcript, as an attachment on the session's last line,
and the model never sees it in the next turn's context. The only other exit is 2, which blocks the
stop and can trap an unattended run mid-task. So the binary on offer was between a failure nobody
acts on and a failure that can strand a run, and neither is the thing wanted.

**The answer.** Route it through PostToolUse `additionalContext`, the one path that reaches the
model, and never block. Advisory in the sense that no turn is failed; not advisory in the sense
that matters, because the session receives it and has to answer for it. The teeth are that the
failure arrives where work still happens rather than where reading happens.

## 2. `opusplan` becomes the machine default, on a week's trial

**The question.** SESSION-LOOP section 6 recommends the plan-then-execute split and names
`/model opusplan` as the way to get it with no babysitting. `settings.json` sets `opus[1m]` flat.
Default or per session?

**The cost that nearly argued against it.** Section 6 is unusually careful about one thing most
versions of this advice omit: a conversation is served from a prompt cache keyed on the model, so a
switch made late in a long thread re-pays for everything behind it. That is a real argument against
switching, and it does not reach this case. `opusplan` switches at the plan-to-execute boundary,
which is early by construction, when there is little behind it to re-pay for. The genuine cost here
is smaller and duller: token accounting spread across two tiers is harder to read than accounting on
one, and this estate does read it.

**The answer.** Machine default, measured for a week against the flat baseline, reverted if the
numbers disappoint. A standard that has never run cannot be defended on the grounds that running it
might complicate a report.

## 3. The worktree unit is the session

**The question.** LOOP names one branch, one worktree, one run. `git worktree list` in the portfolio
returns one entry. When that changes, is the worktree per session or per task?

**The answer.** Per session. Nimbalyst already attributes uncommitted work per session, and
CLAUDE.md leans on that attribution as a working rule: a dirty tree is not automatically yours.
Matching the worktree to a boundary the harness already tracks means the isolation costs no new
bookkeeping. Per task is finer isolation and invents a boundary nothing currently records, which
would have to be defined before it could be used, and gap 4 in the plan is that definition and is
not done. If gap 4 lands and the task boundary turns out to be cheap to see, this is worth revisiting.

## What this changes

`plans/loop-practice-gaps.md` moves from four gaps with three open calls to four gaps that are
buildable. The build order is unchanged. Nothing here decides gap 4, which had no open call, only
work.
