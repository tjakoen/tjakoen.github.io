#!/usr/bin/env bash
# SessionStart: say when a mounted skill or the code graph has fallen behind its source.
# Silent when everything is current, when nothing is mounted, or when bun is not on PATH, so a line
# from this hook always means something. The check itself is tools/map-freshness.ts.
set -uo pipefail
root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
command -v bun >/dev/null 2>&1 || exit 0
[ -f "$root/tools/map-freshness.ts" ] || exit 0
cd "$root" && bun tools/map-freshness.ts --hook 2>/dev/null
exit 0
