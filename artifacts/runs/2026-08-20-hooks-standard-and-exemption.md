---
title: "The three hooks get a standard, and one of them stops lying about itself"
date: 2026-08-20
status: complete
lane: gated
branch: main
skills:
  - voice
  - loop-standard
scope:
  - standards/HOOKS.md
  - standards/README.md
  - shared/tools/spawn-envelope.sh in claude-config
  - artifacts/runs/
touched:
  - artifacts/runs/2026-08-20-hooks-standard-and-exemption.md
  - standards/HOOKS.md
  - standards/README.md
diffstat: 2 files changed, 309 insertions(+)
unpushed: 0
verifiedBy: the parent session, which did not write the standard, 2026-08-20
doctor: 0 failing, 0 due
---

# The three hooks get a standard

Two pieces of work, both the owner's calls, taken after they asked why a short follow-up to a running
child was being denied and whether the loop's machinery was written down anywhere.

## The short-follow-up exemption

The envelope hook matched the follow-up tool as well as the spawn tool, because the 2026-08-13 design
named both and never separated the two jobs that tool does. It hands a child new work, which is a
handoff and owes an envelope, and it nudges a child already running, which is a sentence and owes
nothing. Nothing in the payload separates them, so "yes, go ahead with option B" was judged as a task
brief.

Length is the only signal available. A prompt under 400 characters is now let through on the
follow-up tool only, overridable through `SPAWN_ENVELOPE_MIN_CHARS`. A spawn is never exempt at any
length. The cost is pinned as a test rather than left to be rediscovered: a genuine task short enough
to fit is handed over unjudged.

The one-shot escape hatch built alongside this by an earlier session was NOT included. The owner did
not choose it, and that session had attributed it to them without a message to point at.

## The standard

`standards/HOOKS.md`, 302 lines, written by a spawned session that was killed by a monthly spend limit
after writing it and before committing or reporting. The parent finished the landing.

It covers the three hooks that gate work rather than report on it, and gives each one what it fires
on, what it does, what it deliberately cannot do, and how to switch it off. The off switch is not
decoration: a gate nobody can find the off switch for gets worked around instead of disabled, and a
worked-around gate still reads as coverage.

## The defect the standard found

Writing it caught the script lying about itself. `spawn-envelope.sh` still opened with a NOT WIRED
banner written before the decision that wired it, so the file's own header contradicted the settings
file for a day. Fixed in claude-config `67a7781`, and the mistake is kept in the replacement comment
rather than erased, because a comment written at build time and a wire added later is the ordinary way
a file starts lying, and that is more useful to the next reader than a clean banner with no history.

## Gate output

```
$ bun tools/voice-lint.ts standards/HOOKS.md
voice-lint: 0 flag(s) across 1 file(s) (0 tell, 0 warn).

$ bun test shared/tools/spawn-envelope.test.ts   # in claude-config
 36 pass
 0 fail
 48 expect() calls

$ bun ../pantry/cli.ts skills sync .
18 skills mounted, 0 written, 0 pruned

$ bun ../pantry/cli.ts doctor .
21 checks, 0 failing, 0 due
```

Live behaviour verified through the installed path at `$HOME/.claude/tools`, four cases: a short
follow-up allowed, a long follow-up with no envelope denied, a short spawn denied, an enveloped spawn
allowed.

## What was not done by this run

The standard was not read against a rendered page. It ships as a skill and as a standards page, and
only the mechanical half of VOICE was checked; the judgment half is a human read by definition and is
still owed.

No hook behaviour was changed by the documentation half. Limits the standard names, the write guard
not seeing the shell and the ask-stops-the-run rule not being hookable, were named and left alone as
the brief required.

`tjakoens-macbook-pro` carries its own settings copy and is still not wired for the envelope check,
because it cannot be tested from here.

## What needs human eyes

The judgment half of VOICE on `standards/HOOKS.md`, which no linter can run.

`content/notes/build-the-floor.md` carries an uncommitted 124-line new section from a session that is
not this workstream and did not report it. It was left untouched. Only the owner knows whether it is
finished.

The 400-character threshold is a guess with a margin, not a measurement. If a real short task ever
gets handed over unjudged, the threshold was wrong rather than the test that pins the cost.

---

*Written with Claude, finishing a session that a spend limit ended mid-run.*
