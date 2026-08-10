#!/usr/bin/env bash
# tools/review-gate.sh — the Stop hook behind LOOP section 2's third mechanical trigger, turn end.
#
# Five nudges:
#   0. tsc, but only when a TypeScript file changed this turn. The one check here that catches an
#      outright defect rather than a preference, and the one with a cost worth gating on.
#   1. proof verify over the working diff, when this repo runs a plans board.
#   2. a reminder that a change which RENDERS owes a CRUMB dev tour (LOOP section 4a).
#   3. a lint baseline-and-regress report (oxlint + voice-lint), unlike the others this one is NOT
#      silent when clean — see its own section below for why.
#   4. a reminder that a session which CLOSED something owes a handoff (SESSION-LOOP section 5).
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

# ---- (0) the types still check, when a type could have moved ----------------
# This runs first because it is the only check here that catches an outright defect rather than a
# preference or a missing follow-up. A type error is broken code; `prefer-array-find` is an opinion,
# and for a while this gate carried the opinion and not the defect.
#
# It is gated on a TypeScript file having actually changed this turn, and that gate is the whole
# reason it can be here at all: tsc costs about three seconds against roughly one for everything
# else in this script combined. Paying that at the end of a turn that only touched prose is how a
# gate starts feeling slow, and a gate that feels slow gets deleted rather than tuned (LOOP section
# 7). Gated this way it is free on a docs turn and present on every turn that could break the build.
#
# Silent when it passes, like (1) and unlike (3): a check whose normal state is "fine" earns nothing
# by saying so every time, while a count that always exists (lint) earns the confirmation.
if printf '%s\n' "$changed" | grep -qE '\.tsx?$' \
   && command -v bun >/dev/null 2>&1 && [ -f package.json ] \
   && grep -q '"check"' package.json; then
  if ! types=$(bun run check 2>&1); then
    printf 'tsc FAILED, and a TypeScript file changed this turn:\n%s\n\n' "$types"
  fi
fi

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

# ---- (4) a closed session owes a handoff ------------------------------------
# The one gap the 2026-08-10 loop simulation found: every other step of the loop has something that
# asks for it, and the handoff has nothing. It is the step whose absence costs the most, because the
# price is not paid by the session that skipped it.
#
# The trigger is the same shape as (2)'s and narrow for the same reason. "Have you handed over yet"
# asked at the end of every turn is the definition of a muted gate, so this asks only when the turn
# did something a SESSION closes rather than something a turn closes: wrote a run report, or ticked a
# phase box on the plans board. Both are once-per-session events, and the plan trigger is what makes
# this fire for work whose code lives in another repo, since the plans board for the whole estate is
# here.
#
# A run report counts only when its bytes differ from HEAD's, which is a stricter test than "the path
# changed" and the difference is not academic. This repo carries a staged deletion under
# artifacts/runs/ whose file is still sitting on disk unmodified, so git reports the path as both
# deleted and untracked while nothing about it was written. Existing on disk does not distinguish
# that from a fresh report; differing from HEAD does.
#
# It nudges ONCE per closed thing, not once per turn. There is no artifact to check for — a handoff
# is a prompt, not a file — so "already done" cannot be read off the tree the way (2) reads a tour.
# The marker therefore lives in .git/, which is per worktree, never staged, and never in status.
#
# Which makes every remembered item's TEXT load-bearing, and the first draft of this got it wrong in
# the way that is invisible until months later: the plan trigger recorded the fixed sentence "a phase
# closed on the plans board", so the first phase ever ticked wrote that line and every phase after it
# matched a line already there. One nudge, ever, from a gate whose comment claimed one per phase. An
# item now carries the plan path and the phase text, because a dedupe key that does not name the
# thing it deduplicates is a mute button on a delay.
#
# The run-report item stays path-only on purpose, and that asymmetry is the trade rather than an
# oversight: keying it on content would re-nudge on every save while a report is still being drafted,
# which is a whole session's worth of noise to catch the case of a date-stamped filename being reused
# for different work.
#
# THE WORKING DIFF IS NOT ENOUGH, and the first version of this shipped believing it was. It was
# watched on a real spawned session that ticked a real phase box, and it never fired: the session
# edited the plan and committed it inside the same turn, so by the time the Stop hook ran there was
# no working diff left to read. The gate was nudging the session that leaves a mess at a turn
# boundary and staying silent for the one that commits promptly, which is exactly backwards. So a
# close is looked for in unpushed COMMITS as well, and the commit item is keyed by its sha, which is
# the one identifier a close already carries and cannot collide.
#
# The commit scan is bounded, path-filtered and baselined, and each of the three has a stated cost.
#
# BOUNDED to 30 commits with an upstream and 5 without. The push here is owner-gated so the unpushed
# range grows for weeks, and a close that scrolls past the bound is never nudged at all rather than
# nudged late. That is a real hole and the honest mitigation is pushing, not a bigger number. Five
# without an upstream because "unpushed" has nothing to mean there, so the window is the recent past
# rather than all of history: a repo whose upstream ref is pruned mid-life falls into that case, and
# five stale items is a nuisance where thirty is a wall of text.
#
# PATH-FILTERED in the log call rather than in the loop. Unfiltered this ran up to two `git show`
# calls against every one of thirty commits at every turn end, which is the cost profile the comment
# on (0) says gets a gate deleted rather than tuned. Most commits touch neither path, so the loop is
# usually empty. `-m --first-parent` because `git show --name-only` prints nothing at all for a merge
# by default, and a close that arrives through a merge is exactly as closed as any other.
#
# BASELINED because a gate whose first run prints every close since the last push is a gate
# uninstalled on day one: if the marker is absent, the current items are written to it silently. Say
# what that actually costs rather than the softer version: it is not "the first close", it is the
# whole current backlog, up to the bound, plus anything uncommitted at that moment. Same bargain
# tools/lint-baseline.json already makes in this repo, and it is paid again by anyone who deletes
# the marker or clones fresh.
closed=""
if [ -n "$changed" ]; then
  closed=$(printf '%s\n' "$changed" | grep -E '^artifacts/runs/[^/]+\.md$' 2>/dev/null \
    | while read -r f; do
        [ -f "$f" ] || continue
        now=$(git hash-object "$f" 2>/dev/null)
        was=$(git rev-parse "HEAD:$f" 2>/dev/null || true)
        [ -n "$now" ] && [ "$now" != "$was" ] && printf 'a run report: %s\n' "$f"
      done)
  # Anchored to a list item at the start of an added line, not `- [x]` anywhere in one, so a sentence
  # that quotes the syntax (this repo's plans and standards discuss checkboxes in prose) is not a
  # phase closing. Every matching line becomes its own item, so two phases ticked in one turn are two
  # things to hand over rather than one.
  plans_closed=$(git diff --name-only HEAD -- plans 2>/dev/null \
    | while read -r p; do
        git diff HEAD -- "$p" 2>/dev/null \
          | grep -E '^\+[[:space:]]*- \[x\]' \
          | sed 's/^\+[[:space:]]*- \[x\][[:space:]]*//' \
          | cut -c1-60 \
          | while read -r line; do printf 'a phase closed: %s — %s\n' "$p" "$line"; done
      done)
  closed=$(printf '%s\n%s\n' "$closed" "$plans_closed")
fi

# Unpushed when there is an upstream, the last few commits when there is not, since without one
# nothing on this branch is durable off the machine and "unpushed" has no meaning to measure against.
if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
  range="@{u}..HEAD"
  depth=30
else
  range="HEAD"
  depth=5
fi
committed=$(git log --format='%h %s' -n "$depth" "$range" -- artifacts/runs plans 2>/dev/null \
  | while read -r sha subject; do
      hit=""
      if git show --format='' --name-only -m --first-parent "$sha" 2>/dev/null \
         | grep -qE '^artifacts/runs/[^/]+\.md$'; then hit=yes; fi
      if [ -z "$hit" ] && git show --format='' -m --first-parent "$sha" -- plans 2>/dev/null \
         | grep -qE '^\+[[:space:]]*- \[x\]'; then hit=yes; fi
      [ -n "$hit" ] && printf 'a commit that closed something: %s %s\n' "$sha" "$subject"
    done)

closed=$(printf '%s\n%s\n' "$closed" "$committed" | grep -v '^[[:space:]]*$' || true)
if [ -n "$closed" ]; then
  gitdir=$(git rev-parse --git-dir 2>/dev/null || true)
  [ -n "$gitdir" ] || gitdir=.git
  marker="$gitdir/handoff-nudged"
  if [ ! -f "$marker" ]; then
    printf '%s\n' "$closed" >"$marker" 2>/dev/null || true
    closed=""
  fi
  # Remembered per item rather than per turn's set, which is the difference between the sentence
  # above being true and being nearly true: a turn that writes a report AND ticks a box is one set,
  # and the moment the report is committed the set shrinks to the box alone and would read as new.
  fresh=$(printf '%s\n' "$closed" | grep -v '^[[:space:]]*$' | while read -r item; do
    grep -qxF "$item" "$marker" 2>/dev/null || printf '%s\n' "$item"
  done)
  if [ -n "$fresh" ]; then
    printf '%s\n' "$fresh" >>"$marker" 2>/dev/null || true
    cat <<EOF

This turn closed something and no handoff has been written for it:
$fresh

SESSION-LOOP section 5: the next session either starts oriented or re-derives what this one already
knows. Run /handoff.

Whether the state is durable enough to hand over is a different question, and
~/.claude/tools/session-guard.sh answers it. This only says one is owed.
Still mid-session? Ignore it. It fires once per closed thing, not once per turn.
EOF
  fi
fi

exit 0
