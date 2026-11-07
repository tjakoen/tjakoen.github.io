---
title: A close command that answers whether this session can be archived, and a stop hook that asks it unasked
date: 2026-11-08
status: complete
lane: gated
branch: feat/nest-polish
scope: [tools/dsh-loop, docs/HARNESS-DSH.md, artifacts/runs, agent-config/shared/tools/dsh]
touched:
  - tools/dsh-loop/close.ts
  - tools/dsh-loop/close.test.ts
  - tools/dsh-loop/cli.mjs
  - tools/dsh-loop/README.md
  - docs/HARNESS-DSH.md
  - artifacts/runs/2026-11-08-close-gate.md
  - agent-config shared/tools/dsh/stop.mjs
  - agent-config shared/tools/dsh/stop.test.ts
  - agent-config shared/tools/dsh/plugin.mjs
  - agent-config shared/tools/dsh/plugin.test.ts
  - agent-config shared/tools/dsh/README.md
diffstat: a 561 line close module and a 245 line test in the site repo, 18 lines in its CLI, 24 in the harness doc, and on the agent-config side a 75 line stop module, a 113 line test, 85 lines of plugin wiring and 62 of wiring test
unpushed: 17 | feat/nest-polish is local and has no upstream
verifiedBy: 19 tests in the site repo including one against a temporary repository, 49 tests in the agent-config dsh package, a typecheck, a lint pass over the three site files, four hand runs of close including the gate path, and one simulated turn-stopping run that queued exactly one report in 186ms
doctor: 23 checks, 0 failing, 3 due | Claude Code context budget, merged graph freshness and two stale skill mounts
---

The owner kept asking whether a session could be archived, and where the work stood when he came
back to it. The close skill already answered the first question with the right contract and four
right words, but it answers in prose a session has to remember to ask for. This run turns the same
checks into a command that prints the evidence and the word, and then arms a stop hook so the
session says where the work stands at the end of a part instead of waiting to be asked.

## What changed

**A new close module.** `tools/dsh-loop/close.ts` gathers the facts and decides. It reports the
branch, whether the work is on the default branch, the pull request state from `gh`, what is pushed,
which dirty paths belong to this session, the worktree inventory with a dry prune, the newest run
report for the branch, and optionally the repository's own gate. It returns one of the four words
the close skill defines, CLOSE, CLOSE WITH NOTES, HAND OFF or DO NOT CLOSE, with a single next move
and an exit code a script can read.

**Attribution is the load-bearing part.** Eleven paths from other sessions sat in this checkout the
day the command was written, so a dirty tree cannot be the verdict. The command reads the event log
the DSH plugin appends to, keeps only the paths this session's own edits touched, and counts
everything else as a note. That is what turns a gate that would be red on every repo every day into
one that names a real blocker and nothing else.

**Merged means merged, three ways.** Ancestry is not enough: a squash merge leaves the branch
commits outside the default branch, so the command also reads the pull request state and `git
cherry`. A branch whose commits are already on main by patch counts as landed.

**A stop hook, at last.** DSH has no Stop hook of its own, but its agent loop runs a serial
`agent/turn-stopping` event when a turn has no steps left, and a listener there can queue a message
that opens one more turn. The plugin now listens there. After a turn that changed files, it runs
the repository's own close command offline, writes the block into the worktree's git dir, and asks
the session to reply with that block and start nothing new. The report becomes a turn, so the gate
refuses to fire twice on the same count of edits and refuses while one is already in flight. The
site repo's start command prints the saved block, which closes the other half: a cold session opens
already knowing where the work stands.

**It never changes anything.** Worktree pruning runs with `--dry-run`, and the commands that remove
a worktree or delete a branch are printed for a person to run. A close gate that deletes on its own
would cost more than it saves the first time it was wrong.

## What was not done

The stop hook has not fired in a live session yet. The plugin is loaded when the app starts, so the
running process still has the listener set it started with; the next restart arms it. Until then it
is verified by its tests and by one simulated turn-stopping run against this repository, which
queued exactly one report and wrote the checkpoint file, not by an observed report turn.

The session checklist did not inject in this session, and its failure was silent, which is the same
defect the loop keeps finding one level up. The likely cause is a GUI launch with a minimal PATH, so
the plugin now hands the script the user bin directories and says plainly when the script prints
nothing.

The event log records edits and not files created by a shell command, so a file that arrived that
way is attributed to another session. The command says so in its note and takes `--mine` for the
case, but it cannot see what it was never told. Codex sessions do not write to that log at all.

The pull request check needs `gh` and a network, and the stop hook turns it off to stay fast, so a
report turn can call a pushed branch unlanded until a real close runs.

The gate is opt-in with `--gate`, and the lint gate was left out of it because it is advisory in
this repo. The close gate reads the typecheck only.

## What needs human eyes

Restart the app, then finish a turn that edited a file and watch for the report turn. The restart
also decides the checklist fix: if the block now appears at the top of the first reply, the PATH was
the cause and the loop is fully armed; if the fallback line appears instead, the script itself needs
a look.

The eleven paths this run touched are uncommitted: six in the site repo and five in agent-config.
The site branch is `feat/nest-polish`, which another session is working on and which has no
upstream, so committing needs a decision about which session owns the commit.

The two lint regressions the gate reports are in `scripts/site.js` and `scripts/tmp-meters.mjs`,
both untouched here, so the baseline is stale against someone else's work and was deliberately not
rewritten.
