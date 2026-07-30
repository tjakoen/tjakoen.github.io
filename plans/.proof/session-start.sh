#!/bin/sh
# plans/.proof/session-start.sh — prints a compact plan index for a SessionStart hook.
# Cheap session-start context per PLAN.md: id + status + title, no bodies. POSIX sh, no
# bashisms, so it runs on any host regardless of shell.

set -e

dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

echo "PROOF plan board ($dir):"

found=0
for f in "$dir"/*.md; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  [ "$base" = "README.md" ] && continue
  found=1
  status=$(grep -m1 '^status:' "$f" | sed 's/^status:[[:space:]]*//')
  title=$(grep -m1 '^#[[:space:]]' "$f" | sed 's/^#[[:space:]]*//')
  [ -z "$status" ] && status="(none)"
  [ -z "$title" ] && title="$base"
  echo "  [$status] $title ($base)"
done

if [ "$found" -eq 0 ]; then
  echo "  (no plans yet — see plans/README.md)"
fi
