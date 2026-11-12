#!/usr/bin/env bash
# tools/e2e-local.sh — run the end-to-end suite locally on exactly what CI would test, and tell CI.
#
# CI tests a pull request as the branch merged into main, not the branch alone. This script builds
# that same merge in a throwaway worktree, runs the whole Playwright suite on it with CI's settings,
# and only when every test passes records a commit status named e2e/local on the branch head. The
# status carries the tree hash of the merged code it tested. The CI e2e job reads it and skips its
# browsers only when that hash matches the code it is about to test, so a newer push, a main that has
# moved, or a run that never finished all fall back to the full CI suite.
#
# Usage: bun run e2e:local            (from a branch that is pushed and has an open pull request)
#
# Honest limits. This runs on this machine's browser and OS, not CI's Linux runner, so a failure that
# only Linux shows will not be caught here. A status can be posted by anyone with push access, which
# for this repository is the owner; it is a convenience between the owner's machine and CI, not a
# security boundary. Visual snapshots are ignored, as they are in CI.
set -euo pipefail

CONTEXT="e2e/local"
repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

head=$(git rev-parse HEAD)
branch=$(git rev-parse --abbrev-ref HEAD)
[ "$branch" != "HEAD" ] || { echo "e2e-local: check out a branch first; a detached HEAD has no pull request." >&2; exit 2; }
[ "$branch" != "main" ] || { echo "e2e-local: run this on a feature branch; main is tested by CI on push." >&2; exit 2; }
git diff --quiet && git diff --cached --quiet || { echo "e2e-local: commit or set aside your changes first; the run must match a pushed commit." >&2; exit 2; }

git fetch --quiet origin main "$branch"
remote_head=$(git rev-parse "origin/$branch" 2>/dev/null || true)
[ "$remote_head" = "$head" ] || { echo "e2e-local: push $branch first; origin has ${remote_head:-nothing}, you have $head." >&2; exit 2; }

# The worktree lives outside this checkout on purpose. Playwright resolves its own modules by walking
# up the directory tree, so a worktree nested inside the repository picks up the parent's copy and
# finds no tests at all.
work=$(mktemp -d "${TMPDIR:-/tmp}/e2e-local.XXXXXX")
cleanup() { git -C "$repo_root" worktree remove --force "$work" >/dev/null 2>&1 || true; rm -rf "$work"; }
trap cleanup EXIT

git worktree add --quiet --detach "$work" "$head"
cd "$work"
if ! git -c user.name="e2e-local" -c user.email="e2e-local@localhost" merge --quiet --no-edit origin/main >/dev/null; then
  echo "e2e-local: $branch does not merge cleanly into main. Resolve that first; CI cannot test it either." >&2
  exit 1
fi
tree=$(git rev-parse 'HEAD^{tree}')
base=$(git rev-parse --short origin/main)
echo "e2e-local: testing $branch (${head:0:8}) merged into main ($base), tree ${tree:0:12}"

bun install --frozen-lockfile >/dev/null
# CI=1 gives the same retries and worker settings playwright.config.ts gives CI.
if ! CI=1 node node_modules/playwright/cli.js test --ignore-snapshots; then
  echo "e2e-local: the suite failed, so no status was posted and CI will run the full suite." >&2
  exit 1
fi

slug=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
gh api --silent -X POST "repos/$slug/statuses/$head" \
  -f state=success -f context="$CONTEXT" \
  -f description="tree $tree" >/dev/null
echo "e2e-local: passed. Posted $CONTEXT on ${head:0:8} for tree ${tree:0:12}; CI will skip its e2e run for this exact code."
