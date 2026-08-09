---
id: session-handoff-automation
status: todo
track: ai
depends: []
touches:
  - .claude/settings.json
  - tools/
  - standards/SESSION-LOOP.md
owner: unassigned
---

# Hand off without being asked

Asked 2026-08-09. Today a handoff happens because someone notices the thread is long and says so.
The ask is that it fires on its own: when the context gets close to full, or when the task and its
subtasks are done, the session makes the state durable, writes the brief, and opens the next tab in
the same workstream.

SESSION-LOOP §5 already says *when* a handoff is worth emitting and *what* it contains. Nothing here
changes that contract. This is the trigger and the wiring under it, which is the half that has always
been human.

## The mechanism exists, in three pieces

**The spawn.** Nimbalyst's `spawn_session` takes a self-contained prompt, runs as a sibling in the
same workstream (shared files-edited and tabs), and inherits the caller's working directory including
a worktree. `inheritModel` keeps the next tab on the same model. This is the "new chat tab related to
the same session" half, and it is already built.

**The brief.** The `/handoff` skill already generates it to SESSION-LOOP §5's shape. The automation
composes the two: generate, then spawn with it. No new prose format.

**The token trigger, and this is the part worth pinning.** A session cannot read its own remaining
context, but the harness writes it to disk. Every assistant turn in
`~/.claude/projects/<slug>/<session-id>.jsonl` carries a `usage` block, and
`input_tokens + cache_creation_input_tokens + cache_read_input_tokens` on the newest one is the
context actually being carried. Measured on the session that wrote this plan: about 90k. So the
trigger is a hook that tails one file and compares one number. No model, no guessing, the same
posture as every other mechanical check here.

## The design questions

- **The threshold, and which side of it.** "Close to 200k" is two different rules: warn at 160k so
  there is room to close cleanly, or hard-stop at 190k. The first is useful, the second is a
  guarantee. Probably both, at different volumes.
- **Auto-spawn or auto-offer.** Spawning a tab unasked is a real action taken without a human in the
  loop, which is exactly what LOOP §4b calls outward-facing. The honest first version warns and
  offers; the version that spawns on its own should wait for the classification work in
  `plans/agent-autonomy-tiers.md` to say which lane it sits in.
- **Task completion is a judgement, not a number.** "Done and all subtasks done" has no file to read.
  It is a rule in the standard and a habit, and the hook can only remind.
- **A handoff whose state is not durable is a trap** (SESSION-LOOP §5). The trigger must run the gate
  and the commit check first, or it will cheerfully hand the next session an uncommitted tree.
- **Where the rule lives.** A hook in `.claude/settings.json` is per-repo. A `.nimbalyst`-level rule
  would be per-project across every session. Both, probably, but the estate's answer is usually the
  committed file rather than the tool config.

## Tasks

- [x] Write the reader: `tools/context-usage.ts`, with `tools/context-usage.test.ts` (10). Verified
      against a real 1083-turn session, cross-checked against an independent count: 834,960 both ways.
- [x] Decide the two thresholds and which one is loud. **The 200k premise was wrong** and the
      measurement is the finding: twelve recent sessions here reach 835k, 458k, 267k, 264k. The
      window is 1M on claude-opus-5, so the defaults are warn 700k, stop 900k, both overridable.
- [x] Wire it as a hook and confirm it fires. It runs inside `tools/review-gate.sh` ahead of the git
      guards, because a clean tree can still be one turn from the end of the window, and `--quiet`
      keeps it silent until it crosses the line. Verified end to end through the hook with a real
      payload on stdin.
- [ ] Carry the reader to the other repos, or move it somewhere all of them mount.
- [ ] Add the durable-state precondition, so the trigger runs the gate before it suggests anything.
- [ ] Amend SESSION-LOOP §5 with the trigger, keeping the shape of the brief where it already is.
- [ ] Only then, and only if the autonomy plan puts it in a lane that allows it, let the trigger call
      `spawn_session` itself rather than offering.
