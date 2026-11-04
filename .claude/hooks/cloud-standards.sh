#!/usr/bin/env bash
# Committed by `pantry init --kit`. Gives a cloud session the standards that a local session gets
# from the owner's machine. Silent when the standards are already mounted as skills.
set -uo pipefail
root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
# On the owner's machine the machine-level checklist already reports; stay silent there.
[ "${CLAUDE_CODE_REMOTE:-}" != true ] && [ -f "$HOME/.claude/tools/session-checklist.sh" ] && exit 0
base="https://tjakoen.github.io/standards"
reach="reachable"; st="ok  "
curl -fs -m 5 -o /dev/null "$base/voice.md" 2>/dev/null || { reach="NOT reachable"; st="fail"; }
msg="Agentic loop check, $(basename "$root") (cloud or unsynced checkout)
 ok   Repository instructions: CLAUDE.md
 skip Machine hooks, memory and PANTRY: not available off the owner's machine
 $st Standards: published at $base ($reach)
$([ "$reach" = reachable ] && echo "Agentic Loop Loaded (cloud: standards only)" || echo "Agentic Loop NOT loaded (failed: standards)")

The owner's standards are not on this machine as skills. Fetch each one before the work it governs:
- $base/voice.md before writing any prose: docs, READMEs, commit messages, PR bodies, comments.
- $base/loop.md before calling work done, committing, or opening a pull request.
- $base/session-loop.md before writing a handoff or a plan.
- $base/ai-development.md before starting a feature, refactor or migration.
Show the block above verbatim at the top of your first reply."
if command -v jq >/dev/null 2>&1; then
  jq -n --arg c "$msg" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$c}}'
else
  printf '%s\n' "$msg"
fi
