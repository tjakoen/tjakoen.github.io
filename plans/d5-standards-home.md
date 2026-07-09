---
id: d5-standards-home
status: doing
track: D
depends: [d4-docs-home-option-b]
touches: [standards/, content.ts, package.json, ../pantry/app.ts]
owner: ai
---

# Fold the standards into this repo (the option-b move, for standards)

Owner decision (2026-07-09): the `tjakoen/standards` repo folds into the portfolio, the same way the
layer docs did in d4. The standards source now lives here at `standards/`; `/standards` renders it
through MILL with `dirSource`, and PANTRY resolves the same files out of this repo's package
(`./standards/*` export). Only the portfolio and PANTRY ever consumed `@tjakoen/standards` — the layer
repos only ever linked the published URL, which is unchanged.

## Tasks

- [x] Copy the standards `.md` (+ LICENSE/NOTICE) into `standards/` here
- [x] content.ts `/standards` collection → `dirSource(standards/)`; drop `packageDocsSource`
- [x] package.json: add `./standards/*` export; drop the `@tjakoen/standards` dep + `deps:refresh` entry
- [x] portfolio CLAUDE.md: standards are homed here now (not the retired package)
- [x] PANTRY: `STANDARDS_DIR` resolves from `tjakoen.github.io/standards/README.md`; drop the
      `@tjakoen/standards` dep + `deps:refresh` entry (keeps the auto-disable-when-absent behavior)
- [ ] Re-pin cascade (PANTRY portfolio pin → the standards-bearing sha), export + deploy, verify
      /standards on the live site + PANTRY's /standards from the git-dep
- [ ] Follow-up (Phase 3 / owner): the `tjakoen/standards` repo is now vestigial — archive it; and the
      "@tjakoen/standards package, referenced never forked" language in every repo's CLAUDE.md header
      is stale (the published URL still works). Fold into the Phase-3 CLAUDE sweep.
