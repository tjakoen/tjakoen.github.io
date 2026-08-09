#!/usr/bin/env bash
# tools/review-gate.sh — the Stop hook behind LOOP section 2's third mechanical trigger, turn end.
#
# Three nudges:
#   1. proof verify over the working diff, when this repo runs a plans board.
#   2. a reminder that a change which RENDERS owes a CRUMB dev tour (LOOP section 4a).
#   3. a lint baseline-and-regress report (oxlint + voice-lint), unlike (1) and (2) this one is NOT
#      silent when clean — see its own section below for why.
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

# (1) and (2) are both diff-shaped questions ("did THIS turn do something that needs a follow-up"),
# so both stay gated on there being a diff at all, same as before. (3) is not diff-shaped — lint debt
# is a property of the whole tree, not of one turn's edits — so it runs unconditionally below, past
# this point. Each of (1)/(2) is now an `if` rather than a mid-script `exit 0` for exactly that reason:
# a script that bails out on a quiet turn would bail out before (3) ever got to speak.

# ---- (1) the scope cap, read ------------------------------------------------
if [ -n "$changed" ] && [ -d plans ] && command -v bunx >/dev/null 2>&1; then
  verdict=$(bunx --bun proof verify plans 2>/dev/null | tail -n 2)
  case "$verdict" in
    *FAIL*) printf 'proof verify FAILED on the working diff:\n%s\n\n' "$verdict" ;;
  esac
fi

# ---- (2) a rendered change owes a tour --------------------------------------
# What counts as rendered here: view templates and their styles, the client scripts that drive them,
# and note bodies (which carry raw HTML that MILL passes straight through, so a figure in a post is
# a real surface). Everything else — src/, tools/, docs/, plans/, standards/, e2e/ — is not.
if [ -n "$changed" ]; then
  rendered=$(printf '%s\n' "$changed" | grep -E '^(view/|content/notes/|scripts/).*\.(html|css|js|md)$' || true)
  # already toured this turn? then the run has done what section 4a asks, and nothing is printed.
  if [ -n "$rendered" ] && ! printf '%s\n' "$changed" | grep -q '^content/tours/'; then
    count=$(printf '%s\n' "$rendered" | wc -l | tr -d ' ')
    cat <<EOF
$count rendered file(s) changed and no tour was written this turn.

LOOP section 4a: a change a person can look at closes with a CRUMB dev tour, not only a run report.
Write content/tours/review-<slug>.md (mode: dev), then hand over the link:
  <url>?crumb=review-<slug>&crumb-mode=dev&crumb-frame

How to write one worth walking: standards/TOUR-STANDARD.md.
If this change owes no tour, say so in the run report rather than skipping it silently.
EOF
  fi
fi

# ---- (3) lint baseline-and-regress ------------------------------------------
# This one runs every turn, diff or no diff, and it is the one gate here that talks when there is
# nothing wrong. Both choices are deliberate and both trace to LOOP section 7's rationalization table:
# "doctor is noisy, I'll deal with it later" is how a flag becomes furniture, and a check nobody sees
# passing is a check nobody trusts enough to act on when it fails. It is safe to leave on unconditionally
# because it does not grade against zero — this repo shipped with real oxlint warnings, and voice-lint
# picked up ~500 more the day its default scope grew to cover standards/ (see tools/voice-lint.ts) —
# it grades against tools/lint-baseline.json, and only speaks up about a count that went UP from there.
# tools/lint-gate.ts owns the counting, the JSON diff, and the message shape; this just runs it and
# prints whatever it says. `bun run lint:baseline` is the one command that updates the baseline, and it
# is a deliberate act, not something this gate ever does on its own.
if command -v bun >/dev/null 2>&1 && [ -f tools/lint-gate.ts ]; then
  printf '\n'
  bun tools/lint-gate.ts 2>/dev/null
fi

exit 0
