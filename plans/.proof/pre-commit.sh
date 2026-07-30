#!/bin/sh
# plans/.proof/pre-commit.sh — warns (never blocks) when a "doing" plan wasn't touched.
# Non-blocking by design: this is a nudge, not a gate. Always exits 0.

set -e

dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

has_doing=0
for f in "$dir"/*.md; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  [ "$base" = "README.md" ] && continue
  if grep -q '^status:[[:space:]]*doing' "$f" 2>/dev/null; then
    has_doing=1
    break
  fi
done

if [ "$has_doing" -eq 1 ]; then
  staged=$(git diff --cached --name-only 2>/dev/null | grep '^plans/' || true)
  if [ -z "$staged" ]; then
    echo "warning: a plan is marked 'doing' but no file under plans/ is staged in this commit" >&2
    echo "         (update the plan's status, or note why not, before it goes stale)" >&2
  fi
fi

exit 0
