---
title: The cold start gets measured, and three unpriced costs get named
date: 2026-08-17
status: complete
lane: gated
branch: main
skills:
  - loop-standard
  - session-loop
  - voice
scope:
  - standards/SESSION-LOOP.md
  - ../pantry/context.ts
  - ../pantry/doctor.ts
  - ../pantry/config.ts
  - ~/.claude/tools/bash-output-bound.sh
  - the agent memory index
touched:
  - standards/SESSION-LOOP.md
  - artifacts/runs/2026-08-17-session-economics.md
  - pantry/context.ts (new)
  - pantry/doctor.ts
  - pantry/config.ts
  - pantry/app.ts
  - pantry/doctor.test.ts and seven other test fixtures
  - claude-config/shared/tools/bash-output-bound.sh (new)
  - the agent memory index for this project
plans: none. One question from the owner, answered with a build order they picked from.
gates:
  - bunx tsc --noEmit (pantry) | exit 0, no output
  - bun test (pantry) | 642 pass, 0 fail, 23 files
  - bun tools/lint-gate.ts | net ZERO on this diff, measured against a stash of it
  - bun ../pantry/cli.ts doctor . | 21 checks, 0 failing, 1 due (graphify freshness, pre-existing)
  - bun ../pantry/cli.ts doctor . | cold-start context 19,497 chars over 4 files, inside the budget
diffstat: three repos. Portfolio 1 file plus this report, pantry 13 files, claude-config 4 files.
unpushed: 3 repos hold this work. Push is the owner's and has not been asked for.
verifiedBy: nobody yet. No tour: nothing here renders. A doctor row, a hook script, and three
  paragraphs of standard, all of which a reader checks by running the gate output quoted above.
doctor: graphify freshness was due before this run and is still due, untouched and carried by name.
---

# The cold start gets measured, and three unpriced costs get named

The owner brought a post about session economics and asked whether the estate does any of it. Six
recommendations, checked one at a time against what is actually wired. One was solid, one was half
done, one was reached by a different mechanism, and three were absent. This run built the machinery
for the ones that earn it.

## What the check found first, before anything was built

The estate had already measured its own cold start by hand on 2026-08-05, found 14,163 characters,
trimmed the memory index down to true one-line hooks, and written down that it would grow back
unless the one-line rule was actually held. Twelve days later it was 24,243 characters and the index
was 15,221 of that, larger than before the trim. Nothing had gone wrong; nobody had done anything
wrong. There was simply no check, so the only thing standing between the rule and the drift was
whether a session happened to remember it.

That is the whole argument for this run, and it is the argument the enforcement audit already made
in August about standards in general.

## Four things landed

**The index went back to one line per memory.** Rebuilt from the description frontmatter of every
file it points at, so nothing is lost here that the memory itself does not already carry. It went
from 15,221 characters to 10,475, and it gained an entry on the way: one memory existed on disk and
had never been listed, reachable only through a wiki link inside another one.

**The doctor learned to measure the cold start.** A new module in pantry counts what a session loads
before it does any work, across three sources: the repo's front door and whatever it imports, the
agent memory index, and the machine-wide front door every repo on the box pays. The split is what
makes it actionable, because one of the three is not the repo's fault and should not be fixed there.
It reports at warn and never at error, since a heavy front door is due work rather than a broken
kit, and its detail always names the largest single file. Characters rather than tokens, because a
tokenizer is a dependency and a version and a per-model answer for a number that is only ever
compared against itself.

**A loud command now says so, once.** A hook that speaks when a command returns more than the bound,
naming the command and the size, once per binary per session. Its message states its own limit
plainly: it cannot save the call it fires on, only the next one.

**Three paragraphs went into the session standard**, each into a section that already existed and
already had the right shape for it. The task boundary in section 2, the cache cost of a mid-session
model switch in section 6, and the compaction timing in section 5.

## The budget number is an opinion, and it is labelled as one

Twenty thousand characters, roughly five thousand tokens. It is not measured. It sits between the
two readings this repo actually took, and it is deliberately set where the repo it was written in
passes rather than fails, because a check that is red on the day it ships gets muted inside a week.
The hygiene thresholds beside it were an explicit owner decision with a decision file behind them;
this one is a first guess in the same posture as the audit activity numbers, and it wants retuning
once a second repo has been measured. Hosts can move it, or mute it and get a row saying so.

## The one place the design was overruled by evidence

The owner chose exit 2 for the loud-command hook, so that it reaches the session rather than only
the transcript. The premise is right and the mechanism was wrong: a PostToolUse hook already reaches
the model at exit 0 through additionalContext, probed and measured on 2026-08-10, and the rule that
an exit-0 hook cannot reach the model belongs to Stop hooks. Exit 2 would have blocked the tool
result as well as spoken, trading a warning for a run that can trap itself, and there is nothing
left to block: the output has already been produced and paid for. Built the intent, not the letter.

## Two things this run did not do, on purpose

The hook is not wired. The line belongs in settings.json, the human lane guards exactly that file,
and it blocked the write, which is the lane working rather than failing. It is the owner's to add.

The lint baseline was not regenerated. The gate reports 162 backtick flags and ten oxlint flags over
its committed baseline, and a stash of this diff proved every one of them was already there at HEAD.
Running the regenerate command would have absorbed another session's debt silently under this run's
name, which is the exact failure the ratchet was built in August to prevent.

## The sixth recommendation was declined

Tagging files instead of typing their paths saves a read call. It is true and it is small, and no
check can see whether it happened. A habit rule with no enforcement inside a standard that is
already long is the decay case this estate keeps rediscovering, so it was left out rather than
written down and quietly ignored.
