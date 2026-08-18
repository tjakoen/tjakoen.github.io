---
id: loop-practice-gaps
status: todo
track: ai
depends:
  - ai-workflow-loop
touches:
  - plans/
  - standards/LOOP.md
  - standards/SESSION-LOOP.md
  - ../../../.claude/tools/review-gate.sh
  - ../../../.claude/tools/context-trigger.sh
  - ../../../.claude/settings.json
  - content/notes/
owner: ai
---
# The four gaps between what the loop says and what the loop runs

> Prompted by a video, [I Have Spent 1000+ Hours With Claude Code](https://www.youtube.com/watch?v=YAsxyoTWFDA),
> watched on 2026-08-18. The owner picked four of its points to close. The useful result was not any
> single technique in it. It was that every one of the four is already written into this estate's
> standards, and three of the four have never actually run. That is the same finding as the
> 2026-08-13 loop audit and the 2026-08-12 enforcement audit, arriving from outside instead of from
> a self-review, which is worth something on its own.

## What the video actually argued

It is a tier list of Claude Code features by a solo developer on the entry plan. Its top tier is
verification, meaning tests written before the implementation plus a typechecker, a linter and a
browser or screenshot pass for anything visual. Below that: plan mode for large tasks only, skills
kept few and matched to one coding style, one worktree per chat for parallel work, subagents for
their separate context windows, and a scheduled loop for unattended chores. Its cost argument is
that a strong model should plan and a cheaper model should implement, and its context argument is
that a new session should start at every task boundary rather than when the window fills, because
the second task in a session is already degraded.

Most of that is below this estate's existing bar. The hand written CLAUDE.md beats a generated one,
eighteen canon skills beat a community grab bag, and the run ledger in LOOP section 4 is a stronger
claim than the word verification. The four items below are where the video is ahead of the practice,
though not ahead of the writing.

## Gap 1. Worktree isolation is canon and has never been used

LOOP.md names worktrees in the primitives table at line 45 and again at lines 110 to 111: one branch,
one worktree, one run, no two agents editing the same tree. Measured on 2026-08-18, `git worktree list`
in this repo returns exactly one entry, the main checkout. Every Nimbalyst session in this repo has
shared one dirty tree for the whole life of the standard.

Two agent memories exist only as scar tissue from that: the catalog baseline turning red because
another session edited a component doc, and the rule to use `git commit <path>` rather than staging
in a shared tree. Both are workarounds for a collision the written standard already forbids.

To build:
- Decide whether the worktree is per session or per task, and write the answer into SESSION-LOOP.
- Wire the session start path so a session that will edit code opens in its own worktree. The
  harness offers `EnterWorktree`, so this may be an instruction rather than a script.
- Add a doctor check that names how many worktrees exist against how many sessions are live, so the
  gap is visible the next time it opens.

Verified by: two sessions editing the same repo at once without either one seeing the other's diff
in `git status`.

## Gap 2. The turn end gate checks types and lint, and never runs a test

Read from `~/.claude/tools/review-gate.sh` on 2026-08-18. It runs `bun run check` when a TypeScript
file changed that turn, and `tools/lint-gate.ts` on every turn against a baseline. It also nudges for
a dev tour on a rendered change and runs `proof verify` on a plans board. It never runs `bun test`,
and no other hook does either, though `package.json` carries test, test:e2e, test:all and coverage.

AI-DEVELOPMENT.md line 81 already asks for typecheck and tests passing before anything is called
done. LOOP section 9 asks for gate output verbatim without naming which gates. So the doctrine is
there and the machine covers two thirds of it.

The video's sharper point is ordering: a test written after the implementation is a test shaped to
pass that implementation. Nothing in the estate says test first.

To build:
- Add a test run to the turn end gate, gated the way tsc is gated, so a turn that touched no code
  pays nothing.
- Decide whether the failure is advisory like everything else in that file or blocking like the
  human lane deny.
- Add the test first ordering to AI-DEVELOPMENT as an explicit line rather than an implication.

Design constraint that governs this and gap 4 both: a Stop hook that exits zero prints to the
transcript, for a person, and the model never sees it. That was measured from both ends on
2026-08-10 and the reasoning sits at the top of `context-trigger.sh`. So a nudge meant to change what
the session does next has to travel through the PostToolUse path, not through the Stop path. A test
failure that only a human reads is a report, not a gate.

Verified by: a deliberately broken test, then a turn end where the session reacts to it rather than
a transcript line nobody acts on.

## Gap 3. The model economy is written in detail and configured flat

SESSION-LOOP section 6 is a full treatment: the tier table, the advice to pin subagents to the small
tier, the recommendation to prefer a harness mode that switches automatically, and the cache cost of
a late switch that most versions of this advice omit. It names `/model opusplan` as the way to get
the plan and execute split with no babysitting.

The machine level `settings.json` sets `model` to `opus[1m]`, flat, for every task in every repo.
Nothing in the estate has ever run the split the standard recommends.

To build:
- Decide whether `opusplan` becomes the machine default or stays a per session choice, weighing that
  a flat Opus default is also what makes the caveman token accounting legible.
- Where subagents are defined, pin the read only ones to the small tier, which section 6 already
  calls free savings.
- Have the session name the switch when a task crosses from thinking into grinding, which section 6
  asks for and which nothing currently prompts.

Verified by: a measured comparison of one representative task run flat against the same task run
split, reported as tokens rather than as an impression.

## Gap 4. The session boundary is a size, not a task

`context-usage.ts` warns at 200k and stops at 900k, and `context-trigger.sh` re-reads only after the
transcript has grown by 250k bytes. Both thresholds are defensible and the warn line is set roughly
where the video puts the quality dip. But the trigger is purely a size. A session that finishes a
task at 60k carries that whole task into the next one, and the video's claim is that the second task
is already the degraded one.

The existing warn text is well judged and should not be lost: it tells a session to finish the piece
in flight, hand off, and open the sibling rather than start something new. The agent memory
`handoff-bound-is-the-task` says the same thing. What is missing is the cheaper trigger that fires
before any of that pressure exists.

To build:
- Define what counts as a task boundary in a way a hook can see. A closed plan item and a commit are
  the two candidates that already leave a trace.
- Route the nudge through the PostToolUse path so the session receives it.
- Keep it quiet: this fires far more often than the warn line, and LOOP section 7 says the way a
  gate dies is noise rather than rejection.

Verified by: a session that closes a plan item at low context and is offered the boundary, then a
session that closes two in a row and is offered it once.

## Item 5. The note

The owner asked for a note. The angle is not the video and not a tips list. It is the finding above:
a standard that is written, published, linked from every repo and never once executed looks exactly
like a standard that works, and the thing that finally exposed it was an outside voice describing a
practice the estate had already documented. Three audits in this repo found the same shape from the
inside and it stayed open anyway.

That connects directly to `content/notes/ten-times-zero.md`, which is about honest accounting of AI
work. This is the same argument turned on the process instead of the output. Drafted after the four
gaps close, so the note reports what happened rather than what was intended.

## Open for the owner

1. Blocking or advisory for the test gate in gap 2. Everything in `review-gate.sh` is advisory today
   and the file argues for that in its own header.
2. Machine default or per session for `opusplan` in gap 3.
3. Whether the worktree in gap 1 is per session or per task.

## Tasks

- [ ] Gap 1: worktree isolation actually running, plus the doctor check that keeps it honest
- [ ] Gap 2: test gate wired through the path that reaches the model, test first written into AI-DEVELOPMENT
- [ ] Gap 3: model split configured and measured rather than only described
- [ ] Gap 4: task boundary trigger defined and routed through PostToolUse
- [ ] Item 5: the note, drafted once the four above have real outcomes to report
