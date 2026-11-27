#!/usr/bin/env bash
# Committed by `pantry init --kit`. Gives a cloud session the standards that a local session gets
# from the owner's machine. Silent when the standards are already mounted as skills.
set -uo pipefail
# The repository this script lives in, not the session's cwd: a multi-repo cloud session starts in a
# parent folder that is not a repository, and the user-level hook calls this script from there.
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." 2>/dev/null && pwd)" || root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
# On the owner's machine the machine-level checklist already reports; stay silent there.
[ "${CLAUDE_CODE_REMOTE:-}" != true ] && [ -f "$HOME/.claude/tools/session-checklist.sh" ] && exit 0
# The full checklist lives in agent-config. When a cloud session has it checked out beside this
# repository (or at AGENT_CONFIG_DIR), run it: it prints the same block a local session gets, with
# the verdict the script produced. Without it, fall through to the standards-only block below.
checklist="${AGENT_CONFIG_DIR:-$root/../agent-config}/shared/tools/session-checklist.sh"
if [ -r "$checklist" ] && command -v jq >/dev/null 2>&1; then
  # The checklist reads cwd from the hook's stdin JSON before it reads CLAUDE_PROJECT_DIR, and a multi-repo
  # session reports its parent folder there. Hand it this repository as the cwd instead.
  out="$(jq -cn --arg c "$root" '{cwd:$c}' | CLAUDE_PROJECT_DIR="$root" bash "$checklist" 2>/dev/null)"
  if printf '%s' "$out" | jq -e '.hookSpecificOutput.additionalContext' >/dev/null 2>&1; then
    printf '%s\n' "$out"
    exit 0
  fi
fi
base="https://portfolio.tjakoen.com/standards"
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
