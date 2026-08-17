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
  - artifacts/runs/
  - pantry/context.ts
  - pantry/doctor.ts
  - pantry/config.ts
  - pantry/app.ts
  - pantry/doctor.test.ts
  - pantry/app.test.ts
  - pantry/capture.test.ts
  - pantry/crumb-mount.test.ts
  - pantry/drift.test.ts
  - pantry/init.test.ts
  - pantry/preview.test.ts
  - pantry/retrieval.test.ts
  - pantry/skills.test.ts
  - claude-config/shared/tools/bash-output-bound.sh
  - claude-config memory for this project
touched:
  - standards/SESSION-LOOP.md
  - artifacts/runs/2026-08-17-session-economics.md
  - pantry/context.ts
  - pantry/doctor.ts
  - pantry/config.ts
  - pantry/app.ts
  - pantry/doctor.test.ts
  - pantry/app.test.ts
  - pantry/capture.test.ts
  - pantry/crumb-mount.test.ts
  - pantry/drift.test.ts
  - pantry/init.test.ts
  - pantry/preview.test.ts
  - pantry/retrieval.test.ts
  - pantry/skills.test.ts
  - claude-config/shared/tools/bash-output-bound.sh
  - claude-config memory for this project
plans: none. One question from the owner, answered with a build order they picked from.
gates:
  - bunx tsc --noEmit (pantry) | exit 0, no output
  - bun test (pantry) | 642 pass, 0 fail, 23 files
  - bun tools/lint-gate.ts | net ZERO on this diff, measured against a stash of it
  - bun ../pantry/cli.ts doctor . | 21 checks, 0 failing, 1 due (graphify freshness, pre-existing)
  - bun ../pantry/cli.ts doctor . | cold-start context 19,497 chars over 4 files, inside the budget
diffstat: three repos. Portfolio 1 file plus this report, pantry 13 files, claude-config 4 files.
unpushed: 7 | portfolio 3, pantry 1, claude-config 3. Push is the owner's and has not been asked for.
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

## Gate output

```
$ bunx tsc --noEmit                           # pantry
(no output, exit 0)

$ bun test                                    # pantry
 642 pass
 0 fail
 1656 expect() calls
Ran 642 tests across 23 files. [4.82s]

$ bun tools/lint-gate.ts                      # portfolio, WITH this diff
lint gate: 4 lint(s) regressed against tools/lint-baseline.json:
  voice:backtick: baseline 2814 -> now 2976 (+162)
  oxlint:unicorn(no-array-sort): baseline 14 -> now 24 (+10)
  voice:emoji: baseline 72 -> now 74 (+2)
  oxlint:eslint(no-control-regex): baseline 0 -> now 1 (+1)

$ git stash && bun tools/lint-gate.ts         # the same gate at HEAD, this diff stashed
lint gate: 4 lint(s) regressed against tools/lint-baseline.json:
  voice:backtick: baseline 2814 -> now 2976 (+162)
  oxlint:unicorn(no-array-sort): baseline 14 -> now 24 (+10)
  voice:emoji: baseline 72 -> now 74 (+2)
  oxlint:eslint(no-control-regex): baseline 0 -> now 1 (+1)

$ bun ../pantry/cli.ts doctor .
[ok  ] cold-start context: 19,693 chars over 4 files, inside the 20,000 budget — MEMORY.md is 10,671 of it
[warn] graphify freshness: merged-graph.json predates this repo's own extraction — run pantry graph merge
21 checks, 0 failing, 2 due
OK
```

The two lint runs are the load-bearing pair. Identical counts with the diff and without it is what
"net zero" means here, and it is why the 162 backtick flags below are named as someone else's rather
than absorbed. The one earlier reading that differed (2977) was this run's own two backticks, since
removed, because VOICE bans them in prose anyway.

## What was not done

**The hook is not wired.** The line belongs in settings.json, the human lane guards exactly that
file, and it blocked the write. That is the lane working rather than failing, and routing around it
with a shell command is the rationalization the lane's own message names. It is the owner's to add.

**The lint baseline was not regenerated.** The gate reports 162 backtick flags and ten oxlint flags
over its committed baseline, and the stash above proves every one was already there at HEAD.
Regenerating would have absorbed another session's debt silently under this run's name, which is the
exact failure the ratchet was built in August to prevent.

**The sixth recommendation was declined.** Tagging files instead of typing their paths saves a read
call. It is true, it is small, and no check can see whether it happened. A habit rule with no
enforcement, inside a standard that is already long, is the decay case this estate keeps
rediscovering, so it was left out rather than written down and quietly ignored.

**Nothing was pushed.** Seven commits across three repos are held.

**The graphify freshness flag was not cleared.** It was due before this run started and is carried
by name rather than fixed, because merging the estate graph is not what this run was about.

## What needs human eyes

1. **Wire the hook, or decide not to.** One entry in the PostToolUse block of settings.json pointing
   at bash-output-bound.sh, with the Bash matcher. Until it is added, the script is inert. The six
   payload cases it was exercised against are in the session transcript, not in a test file, which is
   itself worth a decision: a shell hook here has no suite, and neither do its siblings.
2. **Confirm or move the 20,000 budget.** It is a first guess and the report says so in two places.
   If it should be an agreed number like the hygiene thresholds, it wants a decision file rather than
   a comment.
3. **The lint baseline belongs to whoever raised it.** 162 backtick flags and ten oxlint flags landed
   in committed work without the accept flag being run. Someone should either lower them or take them
   on deliberately.
4. **Push, across three repos.** Seven commits, none of them asked for out yet.
