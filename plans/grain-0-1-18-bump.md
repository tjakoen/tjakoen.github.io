---
id: grain-0-1-18-bump
status: done
track: ""
depends: []
touches:
  - package.json
  - bun.lock
  - e2e/visual.e2e.ts-snapshots/catalog-darwin.png
  - content/tours/review-catalog-flat-panel.md
owner: human
---

# Publish grain 0.1.18 and bump the pin

Two e2e failures on this repo were one bug, and the fix was already written and committed in grain
(`ffabd85`): the presentation deck's catalog example carries `data-present`, which puts it
`position: fixed; inset: 0; z-index: 8000`, so rendered live inside a catalog panel it covered the
whole `/catalog` page. Grain now honors a `html flat` fence tag, which is what `presentation.md`
already claimed the catalog did, and gives each component entry a `data-surface="catalog:<slug>"`
address.

**Landed 2026-08-08.** 0.1.18 is on the registry, the pin here is `^0.1.18`, the catalog baseline is
re-blessed against the fixed page, and the review tour is walked and stamped. The gate is green: 328
unit tests, 220 e2e, and `bun run export && bun run verify:export` both pass.

The publish itself was done by hand outside this repo, so the npm token question is closed for this
plan. `npm whoami` still returns `401 Unauthorized` locally, which matters for the next publish but
not for this one.

## The trap worth keeping

`bun add @tjakoen/grain@^0.1.18` printed a successful install and left 0.1.17 on disk, twice, and
`bun install --force` plus `bun pm cache rm` did not shift it either. Only an exact
`bun add @tjakoen/grain@0.1.18` after `rm -rf node_modules/@tjakoen/grain` installed the real package.
A suite run against that half-updated tree reads as a regression in two unrelated `/grain` tests, so
verify the tree before trusting a result: `node_modules/@tjakoen/grain/package.json` must say 0.1.18,
and line 15 of the presentation doc must read ```` ```html flat ````.

## Tasks

- [x] Replace the npm token, then `npm publish` from `grain/packages/grain` (verify with
      `npm view @tjakoen/grain versions --json`, not the command's exit code)
- [x] Push grain before the portfolio pin moves, per the release flow
- [x] Bump `@tjakoen/grain` to `^0.1.18` here and `bun install`
- [x] Re-bless the catalog visual baseline, and only then
- [x] Walk `content/tours/review-catalog-flat-panel.md` and stamp its two steps

## What it left open, for other plans

- **The `action-badge` doc renders nothing in its catalog panel.** The component ships as a template,
  `<span class="action-badge" prop-text="verb">`, while its own doc example is written as
  `<action-badge verb="clicks">`, and nothing on `/catalog` expands that form. The panel is a
  correctly sized empty box. That is a grain doc gap, it predates the flat tag, and it is why the
  tour's second step is stamped `known-issue` instead of verified.
- **`grain-page.e2e.ts` "Watch the AI act" is load-sensitive.** It passes four out of four alone and
  fails roughly two runs in three when the whole spec runs `fullyParallel`. It behaves the same on
  0.1.17, so the bump did not cause it. The reply bubble never lands inside the assertion's 5s
  window; the door answers `202` and the ops arrive late. It did pass in the final full-suite run
  here, so the board is green, but the flake is real and unowned.
