#!/usr/bin/env bash
# tools/review-gate.sh — the Stop hook behind LOOP section 2's third mechanical trigger, turn end.
#
# Two nudges, both cheap, both silent when there is nothing to say:
#   1. proof verify over the working diff, when this repo runs a plans board.
#   2. a reminder that a change which RENDERS owes a CRUMB dev tour (LOOP section 4a).
#
# The trigger for (2) is deliberately narrow and stays that way. LOOP section 7 is a table of the
# sentences that talk a run out of the contract, and the way this particular gate dies is not
# rejection, it is noise: ask for a tour after a parser change, a CLI flag or a doc edit and it gets
# muted within a week. A muted gate is worse than no gate, so this fires only on paths that actually
# put pixels on a page, and never when a tour was already written this turn.
#
# Advisory by design: it prints, it does not block. Exit is always 0.
set -uo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# The context reading and the durable-state precondition used to live here, at the top. They moved to
# ~/.claude/tools/session-guard.sh, which the user-level Stop hook runs for every repo on the machine.
# Neither check was ever about this repo: one reads a transcript, the other reads git. Keeping a copy
# here would have made the portfolio the only repo that got them, and made three copies of the same
# file the day pantry and bread wanted them too. What stays below is what genuinely is portfolio
# business, and the two hooks are additive, so both still fire on the same turn.

command -v git >/dev/null 2>&1 || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

changed=$( { git diff --name-only HEAD; git ls-files --others --exclude-standard; } 2>/dev/null | sort -u )
[ -n "$changed" ] || exit 0

# ---- (1) the scope cap, read ------------------------------------------------
if [ -d plans ] && command -v bunx >/dev/null 2>&1; then
  verdict=$(bunx --bun proof verify plans 2>/dev/null | tail -n 2)
  case "$verdict" in
    *FAIL*) printf 'proof verify FAILED on the working diff:\n%s\n\n' "$verdict" ;;
  esac
fi

# ---- (2) a rendered change owes a tour --------------------------------------
# What counts as rendered here: view templates and their styles, the client scripts that drive them,
# and note bodies (which carry raw HTML that MILL passes straight through, so a figure in a post is
# a real surface). Everything else — src/, tools/, docs/, plans/, standards/, e2e/ — is not.
rendered=$(printf '%s\n' "$changed" | grep -E '^(view/|content/notes/|scripts/).*\.(html|css|js|md)$' || true)
[ -n "$rendered" ] || exit 0

# already toured this turn? then the run has done what section 4a asks.
printf '%s\n' "$changed" | grep -q '^content/tours/' && exit 0

count=$(printf '%s\n' "$rendered" | wc -l | tr -d ' ')
cat <<EOF
$count rendered file(s) changed and no tour was written this turn.

LOOP section 4a: a change a person can look at closes with a CRUMB dev tour, not only a run report.
Write content/tours/review-<slug>.md (mode: dev), then hand over the link:
  <url>?crumb=review-<slug>&crumb-mode=dev&crumb-frame

How to write one worth walking: standards/TOUR-STANDARD.md.
If this change owes no tour, say so in the run report rather than skipping it silently.
EOF
exit 0
