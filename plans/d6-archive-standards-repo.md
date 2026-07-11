---
id: d6-archive-standards-repo
status: todo
track: D
depends: [d5-standards-home]
touches: []
owner: human
---

# Archive the vestigial tjakoen/standards repo

Split out from `d5-standards-home` so that done-plan didn't carry a permanently-open box. The
`d5` fold-in (2026-07-09) moved the standards source into this repo's `standards/` dir; the
`tjakoen/standards` repo has consumed nothing back into it since and is now vestigial — nothing
resolves from it (the portfolio serves `/standards` from its own `dirSource`, and PANTRY resolves
`STANDARDS_DIR` from the portfolio package, not the old package).

This is a GitHub-side action (archive the repo, or add a top-of-README pointer to the new home),
not code, which is why it's `owner`-owned rather than `ai`-owned.

## Tasks

- [ ] Archive (or clearly redirect) `github.com/tjakoen/standards` — point its README at
      `https://tjakoen.github.io/standards` as the new canonical home
