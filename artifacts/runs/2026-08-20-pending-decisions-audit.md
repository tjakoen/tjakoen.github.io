---
title: "The pending-decisions memory, read end to end for the first time"
date: 2026-08-20
status: complete
lane: gated
branch: main
skills:
  - loop-standard
  - voice
scope:
  - ~/Local/claude-config/machines/tjakoens-macbook-air/projects/-Users-tjakoenstolk-Local-Development-bread-repos-tjakoen-github-io/memory/
  - artifacts/runs/
touched:
  - ~/Local/claude-config/machines/tjakoens-macbook-air/projects/-Users-tjakoenstolk-Local-Development-bread-repos-tjakoen-github-io/memory/pending-owner-decisions.md
  - ~/Local/claude-config/machines/tjakoens-macbook-air/projects/-Users-tjakoenstolk-Local-Development-bread-repos-tjakoen-github-io/memory/MEMORY.md
  - artifacts/runs/2026-08-20-pending-decisions-audit.md
diffstat: 2 files changed in claude-config, 172 insertions, 86 deletions; 1 file added here
unpushed: 1 | not this run's, and this run committed nothing. The portfolio was already 1 ahead from another session tonight; the memory edits sit uncommitted because the envelope authorized no push
verifiedBy: an adversarial subagent that did not write the edit, 2026-08-20, told to refute every closure by re-running its check. It confirmed 20 and REFUTED 1, and both its findings are fixed in the file
doctor: 21 checks, 0 failing. cold-start context FIXED by this run, 19,391 chars inside the 20,000 budget. 2 due and carried by name, graphify freshness and one thin run report from an earlier session tonight
---

# Run report: the pending-decisions memory, read end to end for the first time

Date: 2026-08-20
Session: pending decisions memory audit
Parent session: 75b4360c-fac3-4cba-88d0-237e771b22df

The `pending-owner-decisions` memory is the file every session in this project reads before it acts.
It had never been checked end to end. Two entries were caught stale by accident earlier tonight, and
each would have sent a session to rebuild work that had already shipped. This run read all of it
against the tree.

**Twenty-three bullets were wrong. Eighteen of them named work that was finished, in some cases nine
days earlier.** Nothing was closed because a session formed an opinion about the question underneath
it. Every strikethrough carries the command that closed it.

## The method, and it is the point of the run

An entry claiming something is unbuilt was checked by looking for it. An entry claiming a test is red
was checked by running the test. An entry claiming work is unpushed was checked with
`git rev-list --count @{u}..HEAD`. An entry no command can settle was left exactly as it was, and
several were.

The verification fanned out across four read-only subagents so that nothing was checked by the
session that wanted it closed, and a fifth adversarial pass re-ran every check afterwards.

## What closed, and the evidence that closed it

| Entry | Evidence |
| --- | --- |
| pantry's 3 red tests need a committed fixture | `bun test` returns 663 pass, 0 fail across 23 files. Fix landed in `c3df802`, and it answered the decision rather than deferring it |
| The npm token in `~/.npmrc` no longer publishes | `npm view` returns grain 0.1.23, crumb 0.1.10, mill 0.4.0, all far past the versions the bullet named |
| A `PreToolUse` hook that denies an envelope-less spawn, designed and not built | Built, proved and switched on tonight. `d1496ba`, `109071e`, `6abaca4`, and `~/.claude/settings.json` now carries it |
| No session-start doctor hook | It is a `SessionStart` hook, machine-wide in `~/.claude/settings.json` calling `session-doctor.sh`. Its output is the first thing this session read |
| The lint baseline is stale by four regressions | `lint gate: level. 4455 flag(s) total, matching or under the 4455 in tools/lint-baseline.json (generated 2026-08-19)`. All four named rules sit exactly at baseline |
| The portfolio is 42 commits past its newest run report | The doctor reads `0 commits since the newest run report (2026-08-20)`. The question it raised is kept open, because no tree answers it |
| The pinned crumb parser reads `- prefill:` as prose | The portfolio pins `^0.1.10`, resolves to 0.1.10, and that parser names `prefill` in both its meta pattern and its step-meta key set |
| A staged deletion nobody has explained | The file is on disk at 3,481 bytes, tracked and clean. Nothing is staged as deleted anywhere in the portfolio |
| The estate rollout is unpushed in eight repos | All eight are on `main`, ahead 0, zero uncommitted paths |
| pantry is 3 ahead, and separately 2 ahead | pantry is ahead 0 at `f6f846c` and clean |
| `~/.claude` is ahead 1 with ~28 uncommitted memory files | claude-config is ahead 0 at `6abaca4`, and nothing under the memory directory is uncommitted |
| grain's CSS token debt needs a reviewed pass with a tour | `plans/grain-token-debt.md` carries `status: done`, all five slices dated 2026-08-11, and `artifacts/runs/2026-08-11-grain-token-debt-g1-g4.md` records the tour walked in both presentations |
| Walk `review-grain-status` and finish the card | Answered 2026-08-11: candidate B, a doubled rule, chips following the same answer. Status is weight, never hue |
| Press Record once on the answer-channel tour | Closed by deleting the button. Pantry `36a058e`, and the tour's own verify line now says there is nothing to press |
| ph-live is checked out on `security/env-to-secrets` | It is on `main` with a clean tree. The branch still exists locally at `30dd3d8` and is still unpushed |
| steward has no CLAUDE.md and no kit at all | `git ls-files` returns both `CLAUDE.md` and `pantry.config.json`, newest commit `d81c32d` |
| Whether greenroom is meant to be remoteless | It has `origin https://github.com/tjakoen/greenroom.git`, 89 commits, clean at `539d7d1` |
| Two run reports flagged for missing evidence | The doctor flags one of 35, and it is a report written tonight. Neither named report appears |

Three more were narrowed rather than closed, because the count was wrong and the decision was not.
Five bread repos with no `pantry.config.json` is now two, mill and proof, both folded into
`grain/packages/`. Five varying README footers is four, and it stays open because it is a taste call.
HAU's `CLAUDE.md` measures 48,956 bytes over 719 lines today rather than the 159,899 chars the bullet
claimed, because the split the bullet warns against had already happened: commit `7df85bc` on
2026-08-08 moved 44 dated entries into a sibling `HISTORY.md`, which measures 159,279 bytes over 2,180
lines today. The log was relocated, not destroyed. The decision about what to do with it is untouched,
because size was never the whole reason.

## What was deliberately left open

Every one of these was checked and every one survived. `content/notes/watch-its-hands.md` still
carries `status: DRAFT`. `@tjakoen/pantry` is genuinely unpublished, `npm view` returning E404, and
whether to publish it is still a call. `pantry/config.ts:235` still reads
`raw.projectName ?? basename(cwd) ?? "project"`, unchanged, dead fallback intact. None of the ten
`data-surface` attributes are applied in ph-live, which greps to zero matches. Both ph-live deploy
workflows still read `vars.` rather than `secrets.` at line 36, on the working tree and on `main`
alike, so that exposure is confirmed open rather than closed.

The human reads owed cannot be closed by any command and were not touched: the 159 lines of canon
prose under the byline, walking `review-builder-honest-copy` whose own run report says
`verifiedBy: nobody yet`, the conformance prompt's eight checks, the bare-id normalization call, and
the open questions inside `plans/skills-runtime.md`.

**One entry was ambiguous and is listed rather than guessed at, per the run's own ask-trigger.**
`content/tours/review-tier1-nongrain.md` has a capture at
`artifacts/reviews/2026-08-10-review-tier1-nongrain/README.md` saying all three steps resolved, but
the bullet asks two specific questions, whether lighting an element by name beats a screenshot and
whether `data-surface` in a real app's markup is worth the price, and no answer to either is recorded
anywhere. A resolved step is not an answered question, so the entry stands.

## The budget half

Closing entries does not shrink `MEMORY.md`, because a closed decision still owns exactly one index
line. So the budget came from consolidation, and nothing was deleted: every memory file in the
directory is still linked exactly once, checked mechanically after the edit.

Eight groups of related lines were merged into one line each, keeping every link and every hook's own
wording: the three dated loop audits, the three answer-channel entries, the three 2026-07-29 and
2026-07-30 content passes, the four builder measurements, the three older audits, the two graphify
entries, the three token-cost entries, and the three desk entries.

`MEMORY.md` went from 10,658 chars to 10,108, and the cold-start reading from 20,136 to 19,586 against
a 20,000 budget.

The first consolidation went further, to 9,913, and it went too far. See the second pass below.

## Gate output, verbatim

Before:

```
[warn] cold-start context: 20,136 chars over 4 files, over the 20,000 budget — MEMORY.md is 10,658 of it
21 checks, 0 failing, 3 due
```

After:

```
[ok  ] cold-start context: 19,586 chars over 4 files, inside the 20,000 budget — MEMORY.md is 10,108 of it
21 checks, 0 failing, 2 due
```

The two still due are carried by name: graphify freshness, which wants
`pantry graph merge` and belongs to whoever runs it; and one run report from an earlier session
tonight, `2026-08-20-note-the-check-that-never-ran`, missing its evidence block. Neither is this run's
to fix.

## The second pass, and it caught a real one

An adversarial subagent that did not write the edit was told to refute every closure by re-running its
check and to default to "not proved" where it could not reproduce the evidence. It confirmed twenty
and **refuted one, correctly.**

**The HAU size bullet was closed on reasoning rather than on a command, and the reasoning was wrong.**
The first pass measured `CLAUDE.md`, found 48,956 bytes where the memory claimed 159,899, searched the
history for an explanation, found none, and wrote that the old figure should be treated as a bad
measurement. One `git log` on the file refutes that: `7df85bc`, 2026-08-08, whose subject is
`:fire: Split the dated history out of CLAUDE.md`, and today's `HISTORY.md` holds 159,279 bytes over
2,180 lines, which is the missing content almost exactly. The bullet now records the split. This is
the exact failure the run was commissioned to prevent, committed by the run itself, and it is written
here rather than quietly corrected.

It also found a completeness regression in the index consolidation. Six merged lines had dropped a
fact the original hook carried, and `MEMORY.md`'s stated job is to carry enough to decide whether to
open a file. All six are restored: that PANTRY hosts the review, that caveman outranks VOICE and
voice-lint saw a third of the prose, the three owner calls that gave the 2026-08-13 audit teeth, the
thirteen defects in the answer channel's P2 and P3, that the builder's refusals are now
visitor-readable, and that noopener drops sessionStorage. That last one is a separate bug fact rather
than colour, and losing it would have cost something real.

One wrinkle worth keeping: the bullet saying nothing under the memory directory is uncommitted expires
the instant anyone saves a memory file, this run included. The bullet now says so and points at the
command instead.

## What was not done

No memory file was deleted, and no entry was resolved, answered or pre-empted. Nothing was pushed.
Nothing outside the memory directory was written except this report. `~/.claude/tools/` and every
settings file were read and never modified.

Three things this audit surfaced were deliberately left alone, because the bound was the audit:

- `content/tours/say-hello.md` still tells the reader the tour cannot run on the live site until the
  crumb pin bumps past the version that has never heard of `prefill`. The pin bumped. That is prose
  that outlived its defect, and fixing it is a separate piece of work.
- HAU's `CLAUDE.md` is a third of its recorded size with nothing in the history explaining it. Worth
  someone's curiosity, and it is a private teaching repo with live grades in it.
- claude-config carries two uncommitted paths, `shared/tools/spawn-envelope.sh` and its test, from
  another session tonight. Not this run's to commit.

## What needs human eyes

The whole point of the file is that its remaining entries are the owner's, so the list above under
"What was deliberately left open" is the human-eyes list, unchanged and now trustworthy.

Two things earn attention beyond that. **The file went nine days carrying finished work as open**, and
the closest thing to a cause is that nothing writes to it except the session that adds a bullet.
Adding is cheap and closing is nobody's job, which is the same shape as the stale lint baseline this
run also closed. **And the ph-live credential exposure is the one confirmed-open item with a real
deadline**, still riding an Actions variable on `main`, with an unpushed fix branch nobody can
complete but the owner.
