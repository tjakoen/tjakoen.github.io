---
id: grain-0-1-18-bump
status: blocked
track: ""
depends: []
touches: [package.json, e2e/visual.e2e.ts-snapshots/catalog-darwin.png]
owner: human
---

# Publish grain 0.1.18 and bump the pin

Two e2e failures on this repo are one bug, and the fix is already written and committed in grain
(`ffabd85`, unpushed): the presentation deck's catalog example carries `data-present`, which puts it
`position: fixed; inset: 0; z-index: 8000`, so rendered live inside a catalog panel it covered the
whole `/catalog` page. Grain now honors a `html flat` fence tag, which is what `presentation.md`
already claimed the catalog did, and gives each component entry a `data-surface="catalog:<slug>"`
address.

Verified locally by copying the two changed files into `node_modules/@tjakoen/grain` and re-running:
the Back-control test passed and `/catalog` rendered its sidebar and first card again. The patch was
then removed, so this repo is back on a clean 0.1.17 and both failures are still live.

**Blocked on npm auth.** `npm publish` from `grain/packages/grain` returns `E404 PUT
/@tjakoen%2fgrain` twice, and `npm view @tjakoen/grain versions` still tops out at 0.1.17, so it is a
real failure rather than the false negative the release notes warn about. The token in `~/.npmrc`
needs replacing by a human. `publish-npmjs.sh` will not help: it checks whether the package exists,
not the version, so it skips a bump.

## Tasks

- [ ] Replace the npm token, then `npm publish` from `grain/packages/grain` (verify with
      `npm view @tjakoen/grain versions --json`, not the command's exit code)
- [ ] Push grain before the portfolio pin moves, per the release flow
- [ ] Bump `@tjakoen/grain` to `^0.1.18` here and `bun install`
- [ ] Re-bless the catalog visual baseline, and only then
- [ ] Walk `content/tours/review-catalog-flat-panel.md` and stamp its two steps
