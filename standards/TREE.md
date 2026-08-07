---
title: TREE.md — keep the root an index, not a junk drawer
summary: The layout standard - the repo root is the first screen an agent or a newcomer reads, so only load-bearing files earn a place there and everything else folds one level down into a named home. A lean root is cheaper to orient in and harder to get lost in.
when: >
  Read this BEFORE adding a file to a repo root, creating a new top-level directory, moving something
  up out of a folder, or answering "where should this live". Covers what earns a root slot, the
  placement map for everything else, the fold threshold, and where the rule honestly stops applying.
  Don't skip because it is one small file - one small file at a time is exactly how a root becomes a
  junk drawer, and nobody ever notices the turn.
---

# Keep the root an index, not a junk drawer

The standard for *where a file lives*: the repo root is a table of contents, not a shelf you drop things
on. A first-time reader, human or AI, sees the root listing before anything else and builds their whole
map of the repo from it. Every entry at that top level spends a slice of that first read, so the rule is
narrow and strict: a file earns a place at the root only if the toolchain forces it there or a newcomer
genuinely needs it to orient. Everything else folds one level down into a named home. The point is
orientation discipline: a root you can read top to bottom and know what the repo is and where to go.

> Split of responsibility: **[`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md) owns *which* contract files a
> repo commits** (the `CLAUDE.md`, the audit runbook, the doc map) and why each one exists. This file owns
> the orthogonal question: *where does everything sit, and what is allowed to crowd the root.* When they
> touch, AI-REPO-STANDARD decides whether a file should exist; TREE decides where it lives once it does.

**The layout in one line:** the root is a whitelist of things that must be there, every other file lives
in a directory named for its kind, and a category that grows past a couple of loose files gets its own
folder before it clutters anything.

---

## 1. The rule (the root is a read, and you pay for it)

The root listing is the single most-read view in the repo. An agent orienting to a fresh repo lists the
root first and forms its model of "what is this and where do I go" from that one screen. A bloated root
does not just look messy, it costs: the load-bearing files (the entry doc, the source dir) get buried
among one-off scripts, stray configs, and abandoned notes, and the reader acts on the three files it
happened to open instead of the three that mattered.

So the test for any file at the root is a single question: **would a newcomer, opening this repo cold,
need this in the first screen, or does the toolchain refuse to run without it here?** If neither, it does
not belong at the root. A file whose purpose you have to open it to learn is a file that belongs one level
down.

---

## 2. What earns a place at the root (the whitelist)

Only four kinds of thing:

| Kind | Examples | Why it earns root |
|---|---|---|
| **Front-door docs** | `README.md`, `CLAUDE.md`, `DOCS.md`, `LICENSE` | The first thing a human or AI reads. Their whole job is to be found first. |
| **Toolchain-mandated files** | `package.json`, the lockfile, `tsconfig.json`, `.gitignore`, the CI dir | The tool refuses to resolve them anywhere else. No choice, so no debate. |
| **The dirs that *are* the repo** | `src/`, `docs/`, `standards/`, `content/` | The top-level shape of the work. A handful of named directories, not files. |
| **One canonical plan** | `ROADMAP.md` or `PLAN.md` (pick one) | Read before substantive work, so it stays visible. One, not five planning files. |

Everything outside those four kinds is a candidate for folding down. The healthy signal: the root is
mostly directories plus a short stack of docs, and a person can read the `ls` and narrate the repo.

---

## 3. Where everything else goes (the placement map)

Give every other kind of file a directory named for its *category*, not its implementation. A reader
should guess where a thing lives from what it does.

| This kind of file | Folds into | Not at root because |
|---|---|---|
| Build / dev / release scripts | `scripts/` | They are run, not read first. One script is fine at root; the second one starts the folder. |
| One-off or internal tooling | `tools/` | Dev aids, not the product. Keep them out of the front door. |
| Planning docs, design notes, drafts | `plans/` or `docs/` | Work-in-flight, not orientation. The one canonical plan (§2) is the only exception. |
| Generated / derived output | a git-ignored dir | Never committed to root, never committed at all. It is a photograph of a moving thing. |
| Test fixtures, sample data | `fixtures/` or `test/` | Support for tests, meaningless on their own. |
| Images, static assets | `assets/` or `public/` | Bulk that buries the docs it sits between. |
| Deep architecture / concept docs | `docs/` | The root doc *points* at these; it does not host them. |

The naming rule underneath the table: a directory name states the kind of thing inside (`scripts`,
`tools`, `fixtures`), so a reader and an agent both resolve "where would X be" without opening anything.

---

## 4. When to fold (the threshold)

Do not pre-build empty scaffolding, and do not let loose files pile up either. The threshold that works:

- **The second file of a kind starts its folder.** One `build.sh` at root is fine. The moment a second
  script appears, make `scripts/` and move both. The same for a stray plan, a stray fixture, a stray tool.
- **A file you have to open to classify is already mis-placed.** If its name does not tell a newcomer what
  it is and why it is at the top, it has failed the §1 test, regardless of count.
- **Fold at the moment of adding, not in a later cleanup.** The cheapest time to place a file correctly is
  when you create it. A "tidy the root" task later is a tax you chose to pay.

Keep the tree shallow while you are at it: a directory that only ever holds one file is usually noise, and
a path five levels deep is usually a category that wanted a flatter name. Fold to *name* things, not to
bury them.

---

## 5. When not to reach for it (honest limits)

- **A genuinely small repo.** A dozen files read fine flat. The root-as-index discipline pays off once the
  root would otherwise run past roughly a screen; below that, a folder per category is ceremony.
- **Files the ecosystem expects by convention at root.** Some communities put more at the top than the
  strict whitelist would (a `Makefile`, a `.env.example`, a framework's config). Convention that a
  newcomer already expects is itself a form of legibility, so honor it over the letter of §2.
- **Moving a file the toolchain resolves by path.** Folding a config into a subdir can break the tool that
  looks for it at root. Confirm the tool supports the new location before you move it, and prefer leaving
  a mandated file where the tool wants it (that is exactly what §2's second row protects).

The spirit over the letter: a lean root serves *orientation*. If a move makes the repo harder to orient in
or breaks a tool, it fails its own purpose. Optimize the first read, not the file count.

---

## 6. Make it checkable (the hardening ladder)

Promote the rule off the honor system, the same ladder as [`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md) §7.
A committed doc is the floor; a grep with a pass bar in the audit runbook is where it starts to hold:

```bash
# root non-dir files should stay small: count them, expect a low number (tune the bar per repo)
find . -maxdepth 1 -type f | wc -l
# no loose scripts at root once scripts/ exists → expect zero hits
ls *.sh 2>/dev/null
```

The finding, when the count creeps up, is not "delete files" but "which category grew a second loose
member and now wants its folder." Fix the cause: fold the pile into a named home, do not just shave the
number.

---

## 7. Adoption checklist

Mirrors the shape in [`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md): one small pass per repo.

Day one (a few minutes):

- [ ] List the root. For every non-dir file, apply the §1 test: front-door, or toolchain-mandated?
- [ ] Move everything that fails into its §3 home (`scripts/`, `tools/`, `plans/`, `fixtures/`, `assets/`).
- [ ] Fix any inbound references the moves broke (a `CLAUDE.md` link, a script path in `package.json`).

Steady state:

- [ ] New files land in their named home at creation time, not at root "for now" (§4).
- [ ] The second file of any kind triggers its folder.
- [ ] The root stays readable top to bottom: mostly directories plus a short stack of docs.
- [ ] Optional: add the §6 root-file count to the audit runbook so the creep is caught, not felt.

The proof that this landed: someone opens the repo cold, reads the root listing once, and can say what the
repo is and where to go, without opening a single file to find out.

---

*Living document. When the layout conventions change, update this file. The folders are a means, not the
point: the goal is a root that reads like a table of contents, and any structure that delivers that read
satisfies the standard.*
