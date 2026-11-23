# Re-audit: Model Intelligence Layer Phase B fixes

This review covers branch `mil-b-fixes` in claude-config: commit `b765236` and the two run-report commits after it. The auditor was read-only and pointed every state directory at scratch space. Tests ran on host bun, outside Docker. The fix-related batch passed 348 tests with none failing. The full-suite run timed out, and the 17 failures that printed before it stopped all come from baseline files.

## Verdict: FAIL

Ten findings are fixed: B1, I3, I4, I5, I6, I7, I8, N1, N2 and N7. B2, I1 and I2 still fail their original scenario or open a new hole.

## Blocking

- **R1. The I2 fix locks out a respawn.** `worktree_claims.refresh()` refreshes every unreleased claim the session holds, and no SubagentStop releases one. A second spawn into the same worktree is denied for the rest of the parent session's life, not for 30 minutes. Fix: release a spawn's claim when its subagent stops, or refresh only claims whose spawn is still live.
- **R2. B2's lifetime lockout remains for editing spawns.** `supervisor.ts` frees the `live` slot on release but never lowers `spawns`, so a session's fifth editing spawn is denied for good. The owner has to decide whether O4's "4 per task" means four ever or four at a time.
- **R3. The I1 approval guard can be bypassed.** An agent can write a forged approval into any directory and point `ESCALATION_STATE_DIR` at it. Changing the case or the path form of the file name also gets past the guard, and so do globs and variables. A forged approval was honored end to end. Fix: guard the consumer, not the file name. Either ignore the override without an owner-only flag, or sign approvals.

## Important

- **R4.** When `--est-usd` is omitted, `capUsd: 0` still admits a metered destination. The run report claims otherwise.
- **R5.** `spawn_session` and `collaborationspawn_agent` spawns record no type, so SubagentStop never frees them.
- **R6.** The goldfish FAIL check reads only a line that starts with `Verdict`. A "Result: FAIL" anywhere else is now missed.

## Nits

- **R7:** a few "no-go" phrasings with words in between still read as GO.
- **R8:** the stale-lock race in `withLock`, and a wrongly typed state file that is accepted.
- **R9:** when `tool_use_id` is missing, the agent id falls back to the first word of the description, so spawns can collide.
- **R10:** the auditor-warning diff base counts other authors' commits.
- **R11:** a spacing slip in `checkpoint.ts`.
- **R12:** two verifier rows stay red until the owner runs `link-machine.sh --apply-settings`.

## Not verified

- The real Claude Code payload fields: `tool_use_id`, plus SubagentStop's `agent_type` and `agent_id`.
- The live `settings.json`.
- Codex wiring for the approval guard and for release.
