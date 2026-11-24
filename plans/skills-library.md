---
id: skills-library
status: done
track: standards
depends: []
touches: [standards/, tools/skills-library.ts, view/pages/skills/, ../skills]
owner: ai
---

# Publish the skill library, and make the canon reachable

The owner asked whether the standards should be shared as a skill library, and said yes to the whole
plan: publish it as a generated tree, add the way in, wire the drift check, and settle the notes.

- [x] Wire the repo's freshness checker into session start, so a stale skill cannot read green. Evidence: `agent-config` commit 75675285, row `Freshness: skills ok, 29 match their source`.
- [x] Add `--out` to `pantry skills sync`, so the same renderer can publish a library without a second copy. Evidence: `pantry` commit 99d847b, 28 tests green.
- [x] Add the three entry points the library was missing: `MAIN-FLOW`, `WHICH-SKILL`, `GLOSSARY`. Evidence: `standards/`, indexed as 31 standards.
- [x] Generate the `/skills` index from the standards, with a card per skill and the install line. Evidence: `tools/skills-library.ts`, `view/pages/skills/index.html`, e2e `skills-page.e2e.ts` green.
- [x] Publish `tjakoen/skills`: 29 skills, `skills.json`, README, CHANGELOG, licence. Evidence: repo commit 377ff15, then e793066.
- [x] Give the flagship note its share block and a bespoke card. Evidence: `content/notes/ten-times-zero.md`, `ten-times-zero-social.png`.
- [x] Draw the share-block line at 2026-09-01 in NOTE-STANDARD instead of rewriting twelve old notes. Evidence: NOTE-STANDARD, the share-block section.

## What we learned

- Topic: standards
- Changed: The standards are now an installable library, generated twice from one canon, with a page, a manifest and two checks that prove the copies agree.
- Why: The library is only worth publishing if it cannot drift. A hand-kept second copy would have drifted inside a month, which is the failure PANTRY's sync exists to prevent.
- Dropped: A Claude Code plugin marketplace entry. `npx skills add` covers the install, and a managed read-only copy is the shape that drifts first.
- Remember: `bun tools/skills-library.ts --publish ../skills` is the only writer of the public repo; `--page --check` and the sibling `git status` are the two gates.
