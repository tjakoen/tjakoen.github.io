---
title: Portfolio reliability, Builder recovery, and framework closeout
date: 2026-11-01
status: complete
lane: gated
branch: codex/portfolio-reliability
scope: [src/ai, src/content.ts, src/content.test.ts, src/server.ts, e2e, view/pages/grain/builder.html, docs, CLAUDE.md, content/tours/review-portfolio-reliability.md, plans/portfolio-framework-quality.md, plans/ai-agency-navigation.md, audit/portfolio-framework-quality-2026-10-31.md, artifacts/runs]
touched:
  - CLAUDE.md
  - artifacts/runs/2026-10-31-portfolio-framework-quality.md
  - artifacts/runs/2026-11-01-portfolio-reliability.md
  - audit/portfolio-framework-quality-2026-10-31.md
  - content/tours/review-portfolio-reliability.md
  - docs/HACKING.md
  - docs/batch/ARCHITECTURE.md
  - docs/grain/AI-INTERFACE.md
  - docs/grain/MAKE-A-SURFACE-OPERABLE.md
  - docs/pantry/GETTING-STARTED.md
  - docs/proof/HOW-IT-WORKS.md
  - e2e/builder-canvas.e2e.ts
  - e2e/desk-contact-prefill.e2e.ts
  - e2e/desk-grounding-recovery.e2e.ts
  - e2e/plan-details.e2e.ts
  - plans/ai-agency-navigation.md
  - plans/portfolio-framework-quality.md
  - src/ai/block-set.ts
  - src/ai/builder-canvas.ts
  - src/ai/composition.test.ts
  - src/ai/composition.ts
  - src/ai/desk-door.ts
  - src/ai/desk-reasoner.test.ts
  - src/ai/desk-reasoner.ts
  - src/ai/knowledge-cache.test.ts
  - src/ai/knowledge-cache.ts
  - src/ai/prompt.test.ts
  - src/ai/prompt.ts
  - src/content.test.ts
  - src/content.ts
  - src/server.ts
  - view/pages/grain/builder.html
skills: [ai-development, incremental-implementation, loop-standard, graph, tour-standard, voice]
plans: [portfolio-framework-quality]
gates:
  - bun test | 867 pass, 0 fail
  - bun run check | exit 0
  - browser suite excluding the replaced aggregate plan test | 445 passed
  - split plan browser suite | 31 passed
  - live DESK tasks | 5 of 5 passed
  - live Builder tasks | 4 of 4 passed
diffstat: 24 tracked files changed, 410 insertions and 92 deletions; plus 8 new source, test, tour, plan and evidence files
dirty: all touched files | deliberately local, no commit or release requested
unpushed: 0 | no new commits; branch has no upstream
verifiedBy: independent portfolio and framework agents | reviewed source, regressions, docs and 390px starter
doctor: 0 failing, 2 due | carried Claude memory budget and historical run evidence
---

# Portfolio reliability and framework closeout

## Envelope

The owner requested an active goal and authorized the audit priority proposal. Local fixes were
made in portfolio, GRAIN, PANTRY and BATCH source branches. No push, merge, package publication,
deployment, badge implementation change, course-platform edit or message to another chat occurred.
The private walkthrough used repository files read-only and remains in the ignored briefs folder.

## Result

The dated audit contains the finding-by-finding disposition. Local grounding no longer enumerates
badge records, requests share one retryable compiled corpus, authored edits invalidate it, and a
browser fetch failure can recover without reload. Imported Builder addresses remain unique through
later additions, prompt estimates honor the selected ceiling, and failed contact persistence retains
the draft without navigation. Builder Open is undoable and its editable example is more prominent.

Framework verification fails closed, watcher shutdown drains work, and generic model actions are
truthfully projected and validated. PANTRY includes its runtime closure, validates persisted answers,
reports unknown inbox states, honors the selected Claude account, and labels its context measurement
honestly. BATCH exposes asset-copy errors in its export report. Sibling source changes require a
later owner-controlled package release before the portfolio consumes them through its public pins.

## Gate output

The following are retained terminal summaries, not reconstructed historical results.

```text

bun install v1.3.14 (0d9b296a)

Checked 134 installs across 151 packages (no changes) [69.00ms]

 867 pass
 0 fail
 3653 expect() calls
Ran 867 tests across 47 files. [12.28s]

$ tsc --noEmit

 17 pass
 0 fail
 936 expect() calls
Ran 17 tests across 2 files. [409.00ms]

 118 pass
 0 fail
 379 expect() calls
Ran 118 tests across 2 files. [2.97s]

 1 pass
 0 fail
 358 expect() calls
Ran 1 test across 1 file. [269.00ms]


  1 failed
    e2e/plan-details.e2e.ts:3:1 › every public plan detail returns to the board and fits a phone ───
  445 passed (3.2m)

  31 passed (1.0m)

lint gate: level. 4473 flag(s) total (oxlint + voice-lint), matching or under the 4479 in tools/lint-baseline.json (generated 2026-10-14).

link-lint: 57 rendered file(s), no dead relative links.

== 5/5 passed, 0 failed, 0 not run — .cache/desk-audit/report-reliability-2026-11-01.json ==
  ✓ bread-stack
  ✓ who-is-tj
  ✓ grain-built
  ✓ nav-fuzzy-mill
  ✓ cap-det

== 4/4 passed, 0 failed, 0 not run — .cache/desk-audit/report-builder-reliability-2026-11-01.json ==
  ✓ builder-drop
  ✓ builder-draft-single-card
  ✓ builder-draft-prohibited-card
  ✓ builder-draft-two-cards
```

The broad browser failure was its old aggregate plan test exceeding sixty seconds while walking
all cards. It was replaced by a source/index/board parity assertion and one independent phone and
local-link test per plan; all 31 passed. The other 445 broad-run cases passed. No assertion was
weakened to hide the failure. The earlier run also exposed an obsolete copy assertion and hardcoded
plan count, both corrected before the later run. This report does not claim a single combined green
browser command after the split.

Fresh model reports are local at .cache/desk-audit/report-reliability-2026-11-01.json and
.cache/desk-audit/report-builder-reliability-2026-11-01.json. Raw Builder output still over-selected
blocks in some cases; reconciliation removed them before visitor review. Passing final drafts do
not certify raw model copy or general language understanding.

Sibling reports preserve their own full output: GRAIN 706 tests and all package typechecks/lint,
followed by PROOF 85 tests and all package typechecks after the final nested-directory regression;
PANTRY 740 tests, typecheck/lint and packed-runtime smoke; BATCH 58 tests and typecheck/lint.
Their source branches are codex/framework-reliability, codex/pantry-reliability and
codex/batch-export-reliability. The absent sibling Compose setup was not declared passing; runnable
host instructions now name the actual environment and Windows symlink prerequisite.

The final source-verifier pass also uncovered inconsistent Git paths when launched from a nested
plans folder. Evidence commands now run from the resolved repository root and comparison paths
canonicalize filesystem aliases. A real-Git fixture covers root-level untracked files, new nested
plans and added task lines. Root reviewed this follow-up independently. After closing the plans, the scope checker exits 0 with advisory warnings about done plans holding local diffs and the excluded badges plan lacking touches. These are recorded rather than suppressed. The contact/navigation
plan's stale path declarations were reconciled with the implemented source paths as well.

## Maintenance and product evaluation

Nineteen skills are current. The code graph and merged estate graph were regenerated. Historical
run reports still lack retained raw evidence and the private Claude memory remains above its budget.
These are named debt, not silently baselined away. This run's metadata and the audit-phase record
carry their own touched paths, independent review and gate evidence.

The private PANTRY walkthrough compared the actual host files with the plan, knowledge, answer and
run projections. Counts matched; a nonstandard host status required a schema diagnostic, and legacy
report-schema warnings needed interpretation. Native Codex sessions were not discovered. The
conclusion is to keep useful file checks and optional rendered review, rather than require the
cockpit or invent an emitter integration without demonstrating a missing task. The local brief is
artifacts/briefs/2026-11-01-pantry-workflow-evaluation.md. No private course content is published.

## Independent review

An agent that did not author the root changes reviewed cache races, grounding boundaries, bounded
reads, storage failure behavior, imported-ID exhaustion, per-plan checks, docs and the review tour.
At 390px it independently measured the starter button at 44px high with no page overflow. Root
reviewed framework, PANTRY and BATCH diffs; PANTRY's new error states were inspected at desktop and
390px. No blocking findings remain in that reviewed scope.

## What was not done

No commits, pushes, package releases, deployment, physical-phone inference, exhaustive screen-reader
or contrast study, broad controller decomposition, arbitrary natural-language copy editing, generic
planner, AI mail submission, private-memory rewrite or reconstruction of missing historical stdout.
A fresh internet install on a clean machine was not performed. The frozen install used existing
local dependencies; PANTRY's packed smoke uses installed dependencies too. Production recursive
filesystem-watch startup was not fully certified across platforms. Source fixes are not proof that
the public deployment already includes them.

## What needs human eyes

The editable-example entry and wording deserve owner review; the tour retains needs-verification
status. Future copy editing, richer contact conversation and PANTRY integration remain product
choices. Releasing the sibling packages and landing the local branches remain owner-controlled.
All touched paths are deliberately uncommitted, and no upstream was established by pushing.

## Review link

http://localhost:3347/grain/builder?crumb=review-portfolio-reliability&crumb-mode=dev&crumb-frame

Local captures are in screenshots/reliability-2026-11-01/. PANTRY's sanitized error-state captures
remain in its local review-evidence folder. The screenshots are ignored and no new visual baseline
was accepted automatically.

## Local landing, November 1

The owner subsequently requested clean main branches. The verified changes and their evidence are
being recorded in a local commit and brought onto main by fast-forward. Earlier statements about
uncommitted work describe the implementation phase. No push, package release, or deployment is part
of this landing.
