---
title: Name the critical-thinking half, and check what a gate did not cover
date: 2026-11-08
status: complete
lane: gated
branch: main
scope:
  - standards/LOOP.md
  - standards/SESSION-LOOP.md
  - artifacts/reviews/
  - .claude/skills/
touched:
  - standards/LOOP.md
  - standards/SESSION-LOOP.md
  - artifacts/reviews/2026-11-08-review-critical-thinking/01-loop-research-base.png
  - artifacts/reviews/2026-11-08-review-critical-thinking/02-loop-verification-list.png
  - artifacts/reviews/2026-11-08-review-critical-thinking/03-session-loop-prediction.png
  - .claude/skills/loop-standard/SKILL.md | gitignored, regenerated
  - .claude/skills/session-loop/SKILL.md | gitignored, regenerated
skills:
  - loop-standard
  - session-loop
  - intake
gates:
  - bun run check | clean, no output
  - bun test | 875 pass, 0 fail, 3772 expect() calls, 48 files
  - bun run lint:links | 60 rendered files, no dead relative links
  - bun tools/voice-lint.ts on both changed files | 55 flags before, 55 after
  - bun tools/lint-gate.ts | 5 regressions, all from another session's dirty files
  - bun cli.ts skills sync (pantry) | 19 skills mounted, 2 written, 0 pruned
  - GET /standards/loop and /standards/session-loop | 200, new text present in the HTML
diffstat: 5 files changed, 27 insertions(+), 4 deletions(-), plus three screenshots
dirty:
  - CLAUDE.md | another session's uncommitted work, left alone
  - docs/CONTENT-BACKLOG.md | another session's uncommitted work, left alone
  - docs/HARNESS-DSH.md | another session's uncommitted work, left alone
  - content/notes/one-loop-three-harnesses.md | another session's untracked draft, left alone
unpushed: 1 | push is owner-gated
verifiedBy: not yet by a second session, and that is the gap this change leaves open
doctor: 23 checks, 0 failing, 1 due at session start; the due item is the Claude Code context budget
---

# Run report: the critical-thinking half of the loop

## What was asked

Read Addy Osmani's post on critical thinking when agents do the work, map it against the loop, the
standards and the notes, and then add the three edits the mapping argued for, with the source
credited.

## What was done

Three edits, each into the file that already owned the fact rather than into a new doc.

**The research base, LOOP section 5.** A paragraph naming the third Osmani frame: offloading,
deferral, surrender, the four questions asked before a prompt, and the intent-debt point. It credits
the post with a link and says plainly that two of the four questions cannot be asked by a check.

**The session loop, SESSION-LOOP section 2.** A new second step: write the prediction before the
ask. One line, so a stale guess is visible against the result. The list was renumbered from five
items to six.

**The run ledger, LOOP section 9.** A new checklist item: what the gate did not cover, named in the
same section as its output. This is the coverage line the coverage half of the post argues for, and
it is also the item this run cannot mechanically satisfy, which the last section says out loud.

The standards were then regenerated into the skills mount, because an edit to a standard that never
reaches the mount is an edit no session will meet.

## Gate output, verbatim

```
$ bun run check
$ tsc --noEmit
```

```
$ bun test
 875 pass
 0 fail
 3772 expect() calls
Ran 875 tests across 48 files. [5.92s]
```

```
$ bun run lint:links
link-lint: 60 rendered file(s), no dead relative links.
```

```
$ bun tools/voice-lint.ts standards/LOOP.md standards/SESSION-LOOP.md   # before and after
backtick flags: 55 before, 55 after
```

```
$ bun tools/lint-gate.ts
lint gate: 5 lint(s) regressed against tools/lint-baseline.json:
  oxlint:eslint(no-unused-expressions): baseline 0 -> now 4 (+4)
  oxlint:eslint(no-shadow): baseline 0 -> now 4 (+4)
  oxlint:unicorn(prefer-add-event-listener): baseline 1 -> now 3 (+2)
  oxlint:unicorn(no-array-reverse): baseline 1 -> now 2 (+1)
  voice:backtick: baseline 3116 -> now 3117 (+1)
```

```
$ bun cli.ts skills sync ../tjakoen.github.io   # from the pantry repo
  sync  loop-standard (LOOP.md)
  sync  session-loop (SESSION-LOOP.md)
19 skills mounted, 2 written, 0 pruned
```

```
$ GET /standards/loop            -> 200, "What the gate did not cover" and "critical-thinking half is named"
$ GET /standards/session-loop    -> 200, "Write the prediction before you ask"
```

## What the gates did not cover

The new section 9 item asks every run to say this, so this run says it first.

The gates prove that the files compile, that the suite passes, that no relative link died, and that
the two pages serve the new text. They do not prove that either new step fires. A prediction is a
sentence a session has to choose to write, and nothing in the harness checks for one. The coverage
line is checked by nothing at all: pantry's run-ledger parser in `runs.ts` reads six frontmatter keys
and three headings, and a seventh bullet in LOOP section 9 is prose until that parser learns a key.
The screenshots prove the pages render, not that a reader finds the new paragraph useful.

## What was not done

- The enforcement half of the coverage line. It belongs in the run-ledger schema in
  `../pantry/runs.ts`, which is outside this session's workspace and outside the scope declared here.
  The design question it raises is real: a required key would show every existing report as one gap
  worse, and the estate already carries old reports with named gaps, so that may be the intended
  behaviour rather than a cost. It needs a decision, not a patch.
- No second pass by a session that did not write the change. The verify rule in LOOP section 2 is
  unmet, and the report says so rather than implying a review happened.
- No note was written. The analysis lives in chat and in this report; whether it becomes a note is
  the owner's call, and a draft by another session already covers the three-harness ground.
- The unpushed commit. Push stays with the owner.

## What needs human eyes

- Whether the prediction line belongs in SESSION-LOOP section 2 or in the run report instead. It is
  placed where a session turns, not where a report is written, and that is a judgment worth checking.
- Whether the coverage line is worth a schema key, given the retroactive gap count above.
- The three screenshots in `artifacts/reviews/2026-11-08-review-critical-thinking/`, which are the
  rendered proof for a reader.
- The other session's dirty files. They are not this run's and were not touched.
