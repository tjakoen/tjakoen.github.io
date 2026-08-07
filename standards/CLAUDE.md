---
title: CLAUDE.md — standards
summary: Operating rules for editing standards/ itself - keep each fact in exactly one home, and keep it accurate.
---

# CLAUDE.md — standards

Operating rules for any AI (or human) editing **`standards/`** — the canon itself: how Tjakoen
builds with an AI, how anything under his byline reads, and how a repo is set up. Read this first.
Keep it accurate: if a standard changes, this file and the index change in the same commit.

## What this is

The single source of truth for the cross-repo standards, published at
<https://tjakoen.github.io/standards> (rendered by the portfolio from its own `standards/` dir,
where these files are canonically homed since the 2026-07-09 fold-in) and resolved the same way by
PANTRY, out of the portfolio package. **Every other repo references this set — none forks it.**
[`README.md`](README.md) is the index: one line per standard, so a reader loads one file, not six.

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
- **This is a docs set, not an app.** No runtime code, no build — just `.md`. It lives as the
  portfolio's `standards/` dir and is resolved by consumers through the portfolio package's
  `./standards/*` export; keep it that way (no code creeps in here).
- **The starter is the on-ramp.** Changes to how a new repo is wired (badges, symlinks, the
  reference-don't-fork rule) land in `CLAUDE.starter.md` — that's the file every future repo copies.

## The frontmatter contract

Every standard opens with `title`, `summary`, and `when`. The first two feed the rendered page and
the index. The third is the one that does work at runtime: it becomes the `description` of the
mounted skill, and it is the only thing an agent reads when deciding whether to open the file at
all. A standard with a weak `when` is a standard that never fires, so it is written as a command,
not a description, in three parts:

1. **Pre-emptive placement.** "Read this BEFORE writing the first line of prose", never "use when
   writing prose". It has to fire at intent, before the work it governs, not after.
2. **Literal trigger tokens.** The surface words a real prompt will contain, spelled out: note,
   post, README, commit message, diagram, root, handoff.
3. **One anti-rationalization line**, lifted from that standard's own Rationalizations table.
   "Don't skip because it is internal." The excuse gets refuted where it will actually be read.

Three files carry no `when` on purpose: `README.md` is the index, this file is the directory's own
operating rules and already auto-loads, and `AGENTS.md` is a symlink to it.

A fourth key, `skill`, is optional and overrides the slug the standard mounts under. It exists for one
reason: the agent harness ships built-in skills of its own, and a mount whose name collides is
silently shadowed. It lands on disk, never appears in the listing, and so never fires. `LOOP.md` hit
exactly that against the built-in `loop`, which is why it carries `skill: loop-standard`. Add the key
only when a name actually collides, and check the listing after mounting a new standard rather than
assuming the file being written means the skill is live.

The heavier standards also carry **Rationalizations**, **Red flags**, and **Verification** sections.
Verification is the load-bearing one: keep those lists short, mechanical, and evidence-shaped (gate
output verbatim, never "tests pass"), because they are what a checker is meant to read.

## Definition of done

The edit + the index (`README.md`) still true + inbound links still resolve + published rendering
checked (or noted for the next portfolio deploy) + a memory if a decision was made.
