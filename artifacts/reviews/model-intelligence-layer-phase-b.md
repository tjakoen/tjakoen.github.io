---
plan: model-intelligence-layer-phase-b
date: 2026-11-23
---

# Goldfish review: Model Intelligence Layer, Phase B

Six fresh-context passes, each started as a new agent with only the plan and its linked files.

## Comprehension

PASS on every pass. The reviewers restated the goal: every LATER row in `mil-verify.ts` becomes a
live check, the build has two finish lines, and an integrator owns the verifier.

## Critic

- **Pass 1, FAIL (14 findings).** The finish line could be met by deleting the LATER list. The brief
  was not linked. The gate trigger, the side-effect store, the schema, the exit codes, the baseline,
  the way back and the meaning of done per machine were all missing. All of them now have answers
  in the plan's Contracts section.
- **Pass 2, FAIL (5 findings).** The worktree claim store, the definition of a small fix, the
  OpenCode branch in the verifier, the files missing from `touches`, and the shared formats. All are
  answered.
- **Pass 3, FAIL (9 findings).** Several builders could collide on the verifier, which is now held by
  a single integrator. Approval had two sources, and now has one. The gate's trigger sat on the
  wrong path. Claim liveness had no writer. Done was unreachable without the owner, which is now
  split into two finish lines. The rest were counting, window and harness rules. All are answered.
- **Pass 4, PASS,** with five readiness gaps, which pass 5 checked.

## Readiness

- **Pass 5, FAIL.** The Docker command, the audit file name, two stale lines, the lock files and the
  Mac payload location were missing. All are answered.
- **Pass 6, PASS.** Its three wording notes are settled by the plan's own rules: the integrator lands
  the mil-verify rows and step 16, and step 9's live row waits on the owner's apply.

## Verdict

GO.
