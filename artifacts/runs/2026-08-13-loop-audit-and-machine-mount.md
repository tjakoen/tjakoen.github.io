---
title: The loop audit, and the seven-step order it produced, run to the end
date: 2026-08-13
status: complete
lane: gated
branch: main
scope:
  - docs/
  - artifacts/runs/
  - .claude/settings.json
  - package.json
  - .github/workflows/ci.yml
  - ../pantry/hooks.ts
  - ../pantry/hooks.test.ts
  - ../pantry/doctor.ts
  - ../pantry/package.json
  - ../pantry/.github/workflows/ci.yml
  - ~/.claude/tools/
  - ~/.claude/settings.json
touched:
  - docs/AUDIT-AI-LOOP-2026-08-13.md
  - artifacts/runs/2026-08-13-loop-audit-and-machine-mount.md
  - .claude/settings.json
  - package.json
  - .github/workflows/ci.yml
  - ../pantry/hooks.ts
  - ../pantry/hooks.test.ts
  - ../pantry/doctor.ts
  - ../pantry/package.json
  - ../pantry/.github/workflows/ci.yml
  - ~/.claude/tools/loop-manifest.ts
  - ~/.claude/tools/loop-manifest.test.ts
  - ~/.claude/tools/loop-mounts.json
  - ~/.claude/tools/loop-manifest.json
  - ~/.claude/tools/review-gate.sh
  - ~/.claude/tools/session-doctor.sh
  - ~/.claude/tools/human-lane.sh
  - ~/.claude/settings.json
gates:
  - bun test (claude-config, loop-manifest) | 9 pass, 0 fail
  - bun test (pantry, doctor + hooks) | 98 pass, 0 fail, 245 expect() calls
  - bun test --coverage (pantry) | 636 pass, 0 fail; 96.29 percent funcs, 92.37 percent lines
  - bun test --coverage (portfolio) | 426 pass, 0 fail; 82.64 percent funcs, 86.70 percent lines
  - bun run check (pantry) | clean
  - bun run check (portfolio) | FAILS, and it failed before this session; see human eyes
  - pantry doctor, portfolio, before and after unwiring | hook-drift warns then goes quiet
  - session-doctor.sh across 7 repos | correct report in each, silent in a non-kit directory
  - review-gate.sh across 7 repos | portfolio unchanged, other six exit 0 silently
  - human-lane.sh, 20 path cases plus a live probe | every case as intended, block confirmed in the harness
diffstat: 17 files changed across 3 repos; 8 new files, 1 file moved to the machine level, 51 insertions in pantry/doctor.ts, 10 deletions in .claude/settings.json
dirty:
unpushed: 8 | portfolio 5 (all five predate this session and belong to another session in the same tree), claude-config 2, pantry 1; pushes were not taken because the owner's rule is that a push always needs consent
verifiedBy: not yet by a second session, and the gap is named rather than glossed - what was done instead is that every mechanism was proved by watching it act on a real repo rather than only in its own tests, including the human-lane block firing inside the harness against a real write
doctor: 0 failing, 4 due in the portfolio; the new hook-drift row reads clean here and in bread, and the run ledger carries 3 of 6 missing evidence, all three predating this session
---

# Run report: the AI loop audit, and the seven-step order it produced

Repos touched: tjakoen.github.io, pantry, and claude-config, the git repo at `~/.claude`.

## What was asked

Read Addy Osmani's Agentic Code Quality against these standards, then audit the AI loop end to end:
the hooks, the gates, the handoffs, the decision workflow, the audits and lints. Report whether the
docs and standards are actually being seen and used, and whether the whole thing is ready to extend
to the other repos. Then, on a second instruction, run the resulting build order to the end rather
than stopping at each step.

## What was done

**The audit**, at `docs/AUDIT-AI-LOOP-2026-08-13.md`. Thirteen findings. The headline is that this
estate does not have a standards problem, it has a wiring problem: the mechanical checker fired in
zero hooks, the turn-end gate ran in one repo of seven, and the human lane in LOOP section 4b was
guarded by nothing at all.

**Three owner decisions**, recorded in section 6 of that document: teeth on the human-lane paths
only, machine-wide rollout gated on a drift flag existing first, and coverage as the only quality
signal taken on for now.

**Step 1, the loop manifest.** `~/.claude/tools/loop-manifest.ts` generates `loop-manifest.json` from
the live settings file plus a hand-authored `loop-mounts.json`. A declared mount that is not actually
live is a fatal error rather than a warning, because the generated file is what authorizes a deletion
in another repo. `--check` regenerates and compares, so the manifest cannot silently fall behind.

**Step 2, the drift check.** `pantry/hooks.ts` plus a `hook-drift` row in the doctor. Manifest based
rather than diff based, so bread's own session-start plan board stays silent. A missing manifest
reports as not run rather than clean.

**Step 3, the move.** `review-gate.sh` now lives at `~/.claude/tools/` and is wired as a second Stop
hook next to `session-guard.sh`. The portfolio's own Stop hook is gone. The tour nudge's rendered-path
regex was portfolio shaped, so it now reads an optional per-repo `.claude/rendered-paths` and falls
back to the built-in default.

**Step 4, the doctor at session start.** `~/.claude/tools/session-doctor.sh`, a SessionStart hook in
every repo on the device. It resolves PANTRY in the order that gets the newest checks, prints only the
warnings, the errors, the not-run rows and the summary count, and stays silent in any directory that
is not a kit repo. This is finding F1 closed: LOOP section 2's session-start trigger had nothing
behind it anywhere.

**Step 5, the human lane.** `~/.claude/tools/human-lane.sh`, a PreToolUse hook on the write tools and
the only gate in this estate that blocks rather than prints. It denies the LOOP section 4b path list,
plus the settings files, plus itself and its own approval file, so a session cannot remove its own
guard. The escape is one extended-regex line the owner writes in `~/.claude/human-lane-approved`.

**Step 6, CI.** A new `ci.yml` in the portfolio running typecheck, unit tests, the lint count in
report mode, and the forty-four e2e specs that previously ran on nobody's machine but a laptop. A new
`ci.yml` in pantry, which had no CI at all despite being the repo that decides whether the other repos
are honest. Both are separate from the existing deploy workflow so a browser test can never be the
reason the site fails to redeploy.

**Step 7, coverage.** `bun run coverage` in both repos, measured and not gated.

## Gate output, verbatim

Coverage, the number that did not exist this morning and turned out to already be good:

```
tjakoen.github.io   426 pass, 0 fail, 27 test files   All files  82.64% funcs  86.70% lines
pantry              636 pass, 0 fail, 23 test files   All files  96.29% funcs  92.37% lines
```

The drift check, firing on the real manifest before the portfolio hook was unwired:

```
[warn] local hooks vs the machine mount: 1 local hook superseded by a machine-level mount, so it
fires twice: .claude/settings.json [Stop] "$CLAUDE_PROJECT_DIR"/tools/review-gate.sh — review-gate
moved 2026-08-13
```

and after:

```
[info] local hooks vs the machine mount: 1 local hook(s), none superseded by a machine-level mount
20 checks, 0 failing, 4 due
```

The session-start doctor, in grain, after a filter bug was found and fixed:

```
[FAIL] plans/ present: missing at .../grain/plans — run pantry init
[warn] pantry.config present: none — run pantry init (defaults still apply)
[warn] e2e suite present: no e2e suite — the mechanical gate can't run end-to-end
20 checks, 1 failing, 2 due
```

The human-lane guard, probed live inside the harness rather than only from a shell:

```
PreToolUse:Write hook error: BLOCKED by the human lane (LOOP section 4b).
  path:   /tmp/human-lane-probe/Dockerfile
  rule:   (^|/)Dockerfile$
  guards: deploy and infrastructure surface
```

Tests:

```
bun test v1.3.14   claude-config loop-manifest   9 pass, 0 fail, 16 expect() calls
bun test v1.3.14   pantry doctor + hooks        98 pass, 0 fail, 245 expect() calls
$ tsc --noEmit     pantry                        clean
```

The moved gate against all seven repos, portfolio unchanged and the rest silent:

```
===== tjakoen.github.io =====
lint gate: 4 lint(s) regressed against tools/lint-baseline.json:
  voice:backtick: baseline 2814 -> now 2861 (+47)
  oxlint:unicorn(no-array-sort): baseline 14 -> now 23 (+9)
  oxlint:eslint(no-control-regex): baseline 0 -> now 1 (+1)
  voice:emoji: baseline 72 -> now 73 (+1)
[exit 0]
===== bread ===== [exit 0]      ===== grain ===== [exit 0]
===== pantry ===== [exit 0]     ===== batch ===== [exit 0]
===== project ===== [exit 0]    ===== greenroom ===== [exit 0]
```

## Two defects this session found in its own work

Both are worth recording because both were invisible to the tests that existed and were caught by
running the thing against reality.

**The session-start filter dropped the most severe rows.** The doctor writes an error-severity check
as `[FAIL]` in capitals and the filter pattern was lowercase, so grain's failing `plans/` check was
omitted under a heading claiming to show warnings and errors. Visible only because the summary line
said "1 failing" and no failing row appeared above it, which is an argument for printing the count
alongside the list.

**The package.json field check matched nothing.** A field name inside a JSON payload arrives escaped,
so a pattern anchored on real quotes never fired and a version bump passed the guard while the test
for it was written expecting a block. Fixed by decoding the payload before matching.

## What was not done

- **The portfolio's `tools/review-gate.sh` was not deleted.** It is orphaned: no hook calls it.
  Deleting anything is a hard stop under LOOP section 4b, so it is named here for the owner.
- **No `.claude/rendered-paths` was written for any repo.** The override exists and nothing uses it,
  so the tour nudge still fires only in the portfolio. Guessing what grain or batch call their
  surfaces would be a hook inventing a repo's vocabulary.
- **bread and project got no CI.** The audit filed them alongside pantry under F5 and that was the
  wrong grouping. Neither has any tests, and bread's scripts route through `bunx pantry`, which does
  not resolve. A workflow that runs nothing is theatre. Their real finding is no runnable gate, which
  is a different piece of work.
- **No deny list was added to `~/.claude/settings.json`.** F7 stands. The hook enforces the same paths
  more precisely than a permission rule would, and shipping a permission entry whose syntax could not
  be verified from here would have been a rule that looks like coverage. A concrete suggestion is in
  the human-eyes list.
- **The doctor is not in CI.** `@tjakoen/pantry` is not on the public registry and the portfolio does
  not vendor it, so there is nothing for a runner to resolve. The workflow says so rather than adding
  a step that silently skips.
- **Mutation testing, a complexity ceiling, and a dependency scan** were deferred by the owner's call,
  not forgotten.
- **Nothing was pushed.**

## What needs human eyes

1. **The portfolio typecheck is failing on committed work, and it is not this session's.**
   `bun run check` exits 2 on `src/ai/builder-page.test.ts` and `src/ai/field-matcher.test.ts`, both
   missing a `messages` property that `BuilderView` and `FieldSpec` now require. Another session is
   actively editing those files. This blocks `pages.yml`, so a push today would fail the deploy. Left
   untouched on purpose: it is inside another session's live work and outside this run's scope.
2. **Both new CI workflows will be red on their first run** for that same reason. That is the CI doing
   its job rather than a bad workflow, but it is worth knowing before the first push.
3. **Four lint regressions, two owners.** `no-array-sort` up nine, `no-control-regex` up one and
   `voice:emoji` up one predate this session. `voice:backtick` up forty-seven is this session's audit
   document. `bun run lint:baseline --accept` would absorb all four at once, which the baseline's own
   comment says not to do. They need separating by hand.
4. **A deny list for `~/.claude/settings.json`.** 737 allow entries and an empty deny is the drift LOOP
   section 4b names. Worth adding entries mirroring the human-lane paths once the rule syntax is
   confirmed against the harness documentation.
5. **`main` is not branch-protected and there is no CODEOWNERS.**
   `gh api repos/:owner/:repo/branches/main/protection` answers `Branch not protected`. Both are
   changes on the GitHub side rather than in the tree, and both are outward facing, so they were left
   for the owner.
6. **CONFORMANCE's Phase 0 tells a reader to run `bunx pantry doctor`, which fails** with
   `could not determine executable to run for package pantry`. The standard's own first command is
   broken. The session-start hook works around it with a three-step resolver and the workaround is
   documented in the hook rather than hidden.
7. **Eight unpushed commits across three repos**, five of them predating this session.

## This change owes no dev tour

Nothing here renders. The diff is hooks, a generator, a doctor check, two workflows and a document.
