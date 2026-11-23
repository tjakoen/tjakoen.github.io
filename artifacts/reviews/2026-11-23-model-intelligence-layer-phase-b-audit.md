---
session: 7fac800c-7f2d-4f05-b9c3-09596a8141a6 (auditor subagent; builders were sessions ccff3ce7, 8b18b1fb, a095b313, 6d179089)
plan: model-intelligence-layer-phase-b
audited: claude-config main, 2cf4f31..cbb216b
verdict: FAIL
---

# Audit: Model Intelligence Layer, Phase B

**Verdict: FAIL.** Two findings block, nine are important, and nine are nits. The full findings are in
this session's transcript. This file records each finding and the fix it needs.

## Blocking

- **B1.** `route-check pick opencode strong`, once both plans are marked out, returns the metered
  DeepSeek Flash with exit 0 and no approval (`route-check.ts:183-187`). `route-check paid allow`
  is dead code that suggests a gate which no longer exists.
- **B2.** The supervisor counts against the whole session.
  - Four spawns per session is a lifetime cap, and read-only spawns count toward it too.
  - Nothing ever calls `release`, so the concurrency limit stays held for 30 minutes after a spawn
    ends.
  - It has no off switch.
  - A broken state directory fails closed, while a corrupt state file fails open.

## Important

- **I1.** Nothing guards `approvals.jsonl`, so an agent can append an approval itself. Approvals
  never expire, and `capUsd` is never enforced.
- **I2.** Two editing spawns from one parent can claim the same worktree.
- **I3.** `scout.readonly` hashes a copy of the registry that `recommend` never touches, so the check
  proves nothing.
- **I4.** The goldfish gate accepts a review ending "NO GO" as a GO.
- **I5.** `checkpoint write` produces files its own validator rejects, and when git fails it records
  the tree as clean.
- **I6.** One refresh throttle is shared by every session, so a session holding no claims can use up
  the slot another session's claims depend on.
- **I7.** `session-event.sh` has no fallback when `python3` is missing, so the claim refresh can stop
  running without any sign.
- **I8.** The finish gate looks for the plan and its audit in the code repository instead of the plan's
  repository. Its diff base is empty once the work is committed on main.
- **I9.** The hook never passes `--depth` or `--retry`, so those two limits never fire. The
  supervisor's state file is written without a lock.

## Nits

- **N1.** The gate can be bypassed by phrasing a status change differently.
- **N2.** The gate has false positives:
  - "FAIL" anywhere in a review blocks it;
  - "settings" anywhere in a path makes a plan qualify.
- **N3.** `Worktree:` is only checked for presence.
- **N4.** Breaking a stale lock has a race, and the claim store is never pruned.
- **N5.** An empty `WORKTREE_CLAIMS_DIR` adds an empty entry to Python's import path.
- **N6.** The budget claims "measured" when it was given no touched files, and the 70 and 85 percent
  defaults are computed two ways.
- **N7.** Tests leave state in the real home directory, the registry was committed with CRLF line
  endings, and one comment block is duplicated.
- **N8.** The run report reads the ledger by UTC date while the ledger writes by local date.
- **N9.** The DSH rows hide a failing `registry.valid` behind "on hold".

## What passed

- `human-lane.sh` is unchanged, and no new code writes `~/.claude/settings.json` or `~/.codex/*`.
- Paid Flash is out of `lightChain`.
- No new verifier row passes from configuration alone.
- Model Scout itself never writes the registry.
- The test suite shows no failures beyond the known baseline files (host bun, non-Docker: 785 pass,
  28 fail).
