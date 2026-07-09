# CLAUDE.md — standards

Operating rules for any AI (or human) editing **`standards/`** — the canon itself: how Tjakoen
builds with an AI, how anything under his byline reads, and how a repo is set up. Read this first.
Keep it accurate: if a standard changes, this file and the index change in the same commit.

## What this is

The single source of truth for the cross-repo standards, published at
<https://tjakoen.github.io/standards> (rendered by the portfolio from this repo's
`@tjakoen/standards` package) and consumed the same way by PANTRY. **Every other repo references
this set — none forks it.** [`README.md`](README.md) is the index: one line per standard, so a
reader loads one file, not six.

## Start here (reading order)

1. [`README.md`](README.md) — the index and the one rule this folder lives by.
2. The standard the task in front of you needs — and only that one.

## Non-negotiables

- **SSOT, ruthlessly.** Each fact has exactly one home here; every other mention (in these files
  or any repo) is a pointer. The same thing stated twice is a bug — fix it to a link.
- **These files are written IN the voice they define.** Any edit follows `VOICE.md` (no backticks
  in prose, no em-dashes in prose, honest limits over hype). The standards must pass themselves.
- **The published URL is load-bearing.** Renames/removals of a standard break every repo's
  CLAUDE.md links and the rendered `/standards/<slug>` pages (slugs are the lowercased filename).
  If a file must move, keep the index accurate and fix the known inbound refs in the same change.
- **This is a docs package, not an app.** No runtime code, no build. `package.json` exists only so
  consumers can install the files (`files: *.md`); keep it that way.
- **The starter is the on-ramp.** Changes to how a new repo is wired (badges, symlinks, the
  reference-don't-fork rule) land in `CLAUDE.starter.md` — that's the file every future repo copies.

## Definition of done

The edit + the index (`README.md`) still true + inbound links still resolve + published rendering
checked (or noted for the next portfolio deploy) + a memory if a decision was made.
