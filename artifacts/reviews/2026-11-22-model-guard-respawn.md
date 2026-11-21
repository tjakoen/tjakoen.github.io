# Goldfish review: model-guard-respawn

Three fresh goldfish read `plans/model-guard-respawn.md` on 2026-11-22, each with only the plan and
its linked files. None was a fork.

## Comprehension: UNDERSTANDABLE

Sixteen assumptions, the load-bearing ones factual: whether the SessionStart payload names the model
and in what form, how the hook tells the desktop app from other harnesses, and whether a blocked
prompt is shown to the owner. A documentation lookup settled them, and the plan's "Facts" section
records the answers and where they came from.

## Readiness: NO-GO

Eight gaps, all resolved in the rewrite: the alias versus full id passed to `start_session` (the
registry gains an `id`); the match rule failing `sonnet[1m]` (strip the suffix first); literal hook
entries per machine; denial by exit 2; the untestable built-in agent list (moved out of scope); shell
quoting (the prompt is never put in a command); acceptance split into build and owner-applied parts;
and a first prompt with no state file (nothing happens).

## Critic

Fourteen findings. Resolved: hooks run in parallel, so "listed first" was dropped and the fast path
reads `session_id` with `sed`; the match rule and the id; `/clear`, `/compact` and resume keep their
state and never respawn; any entrypoint other than the desktop app takes the exit-2 path, including
Nimbalyst; a stalled respawn leaves every tool denied and the owner lifts it with `keep this model`;
attachments are named as not carrying over; quoting; literal wiring and the bun-missing case; the
read-only agent list moved out; the verifier uses a temporary state directory and a fixture session
id; seven-day state cleanup and a manual path; the desktop facts labeled as unverified until live
acceptance; and acceptance now includes a `/compact`.

Open: the critic's strongest finding, that a session another session starts on Opus on purpose would
be respawned. The plan respawns it, following D1, and puts the exemption to the owner as D4. The
handoff command now starts successors on the registry's main id, so ordinary handoffs never hit it.
