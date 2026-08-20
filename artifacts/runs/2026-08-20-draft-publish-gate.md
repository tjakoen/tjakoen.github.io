---
title: "status: DRAFT finally decides whether a note is served"
date: 2026-08-20
status: complete
lane: gated
branch: main
skills:
  - loop-standard
  - note-standard
  - voice
scope:
  - src/
  - src/content.test.ts
  - content/notes/
  - artifacts/runs/
touched:
  - src/content.ts
  - src/content.test.ts
  - content/notes/the-check-that-never-ran.md
  - content/notes/the-console-i-built-to-stop-drowning.md
  - content/notes/watch-its-hands.md
  - artifacts/runs/2026-08-20-draft-publish-gate.md
diffstat: 5 files changed, 138 insertions, 13 deletions, committed as 152737a; this report adds a sixth
unpushed: 0 | and that is itself a finding. This run's envelope said no push. A parallel session in the same working tree committed this diff and pushed it three seconds later, so the gate is already live on the public site. See "The tree was shared, and it showed"
verifiedBy: an adversarial reviewer subagent that did not write the change, 2026-08-20, told to hunt for surfaces a draft could still leak through and for tests that pass vacuously. Its findings are recorded below. The behavioural evidence in this report was gathered by hand after the commit landed, on the committed code
doctor: 21 checks, 0 failing, 1 due. graphify freshness carried by name, unchanged by this run. The run-ledger flag that was due at session start is gone: all 36 reports now carry their evidence
---

# Run report: `status: DRAFT` finally decides whether a note is served

Date: 2026-08-20
Session: draft note publish gate
Parent session: 75b4360c-fac3-4cba-88d0-237e771b22df

NOTE-STANDARD has told authors for months to mark an unfinished note `status: DRAFT`. Line 64 of the
standard says it plainly: DRAFT by default, and only the owner flips it to PUBLISHED. Every
unfinished note carried the field. Nothing in `src/` or `tools/` ever compared it to anything, so a
draft was served at its own route, listed in the feed, carried into the sitemap, frozen into the
static export, fed to the desk's grounding corpus and dropped onto the calendar exactly like a
finished note. The convention was documentation that lied, and it lied for months to the only people
who trusted it.

How it surfaced is the part worth keeping. A session finished a draft note, the parent held it back
from a push on the grounds that DRAFT meant unpublished, then checked and found that it did not. The
belief was reasonable, the standard supported it, and the renderer had never heard of it.

## The gate

`src/content.ts` gained two things.

`isPublishedStatus()` reads the field as a publish decision. It hides on an explicit DRAFT, trimmed
and case-insensitive, and on nothing else. That is deliberately the loose reading. A gate that hid
every value it did not recognise would take a live page down over a typo in a status line or a
vocabulary word invented later, and a page vanishing by accident is a worse failure than a draft
staying up one more day. A missing `status` publishes for the same reason.

`publishedSource()` wraps the `/notes` collection's ContentSource rather than filtering at each
caller. Eight surfaces enumerate notes and every one of them reaches its entries through
`source.list()` and `source.read()`: the feed, the per-note route, the raw markdown twin, the
sitemap, the static export list, the search tree behind the explorer, the calendar and the desk's
knowledge corpus. Hiding a slug at the source hides it from all eight at once, and a ninth consumer
written next month inherits the gate without knowing it exists. `read()` answers null for a draft,
which is the same answer MILL already gives for a slug that is not on disk, so both `/notes/<draft>`
and `/notes/<draft>.md` return 404 rather than rendering.

It is the same shape as `realFilesSource()` directly above it, which already drops symlinked files
from the standards collection. The pattern was in the file; only the comparison was missing.

## The ask that fired first, and what it prevented

Three notes carried `status: DRAFT` and all three were live and reachable:

| Note | Date | What linked to it |
| --- | --- | --- |
| `the-check-that-never-ran` | 2026-08-20 | published hours earlier, on the owner's explicit call |
| `the-console-i-built-to-stop-drowning` | 2026-07-31 | four inbound links from finished notes, plus a hard-coded navigation target in `tools/desk-audit.ts:128` |
| `watch-its-hands` | 2026-08-06 | one inbound link from `whitepaper-one-vocabulary.md:21` |

The envelope's ask-trigger was one live note disappearing. Two would have, beyond the one already
ruled on, so the run stopped before building and put the question to the owner rather than deciding
which pages mattered. **The answer was to publish all three.** That is what had been true in practice
since 2026-07-31 and 2026-08-06 rather than a new decision, and marking them PUBLISHED admits the
label was wrong instead of pretending it was right. No override machinery was built, so the gate has
no exceptions to explain.

Had the gate shipped without asking, five inbound links from finished notes would have gone dead and
one desk-audit scenario would have navigated to a 404.

## What the gate does, watched rather than asserted

A throwaway note, `zz-gate-demo.md`, was written into `content/notes/`, looked at in both states with
nothing changed between them except the one word, and deleted. The working tree is clean and twelve
notes remain on disk.

As DRAFT it reached nothing:

```
pages (sitemap + export): false
raw .md data routes:      false
notes.json:               false
search tree (byDate):     false
welcome Recent:           false
calendar:                 false
desk knowledge corpus:    false
```

and over HTTP, `index hit=0 route=404 raw=404`. Flipping the single word to PUBLISHED turned that
into `index hit=3 route=200 raw=200`, and the feed went from twelve cards to thirteen with the new
one landing in its date position between 2026-08-20 and 2026-08-18.

Three screenshots were taken in the session and shown, not described: the index with the draft absent
(the 2026-08-20 note followed directly by the 2026-08-18 one), the same index slot with the same note
published and visible, and `/notes/the-check-that-never-ran` rendering, which is the page the
constraint protected. The draft's own URL was photographed too, and it is the one ugly result: see
below.

## Gate output, verbatim

```
603 pass
0 fail
2101 expect() calls
Ran 603 tests across 37 files. [3.21s]
```

```
lint gate: level. 4455 flag(s) total (oxlint + voice-lint), matching or under the 4455 in tools/lint-baseline.json (generated 2026-08-19).
```

```
link-lint: 55 rendered file(s), no dead relative links.
```

```
10 passed (6.2s)
```

That last one is `e2e/notes-feed.e2e.ts`, the feed's own browser suite, run because the feed is the
surface the gate reshapes. `tsc --noEmit` is silent. The doctor reads 21 checks, 0 failing, 1 due,
and the one due is graphify freshness, which belongs to whoever runs `pantry graph merge`.

Nine tests were added or rewritten. Two of them mattered more than the rest: the existing tests that
walked `content/notes/` and asserted every file on disk was listed and served would have turned red
the moment anyone wrote a legitimate draft, which is the exact behaviour the gate exists to allow.
They now split the folder by status and assert both halves, so a draft is expected to be missing and
expected to 404.

## The tree was shared, and it showed

**A parallel session was working the same task in the same working tree.** At 05:10 this session
flipped one note to DRAFT for a screenshot. At 05:12:09 the other session committed this session's
diff as `152737a`, reverting that temporary flip in the same commit, and pushed it at 05:12:12.

The outcome is correct. The commit contains this session's code and comments verbatim, the three
notes are PUBLISHED, and the live site lost nothing. The process was not. **This run's envelope said
no push, and the work is on the public site.** The evidence in this report was gathered afterwards,
by hand, against the committed code, which is why it is worth having: the commit message asserts
verification this session did not watch happen, and everything above was watched.

Two smaller costs are worth naming. Two sessions each flipped note statuses for their own screenshots
inside the same two minutes, which is why an early probe in this session returned a note count that
matched neither state. And nobody can now tell from the history which session verified what, because
one authored the change and the other signed it.

## What was not done

No note's prose was touched, only three status lines. No standard was edited. No override or
allowlist was built, because the owner's answer made one unnecessary. Nothing under `~/.claude/tools/`
or any settings file was read or written. No `edge` repo was touched. The static export was not run,
because with no draft on disk the exported route list is byte-identical to what it was this morning.

## What needs human eyes

**A draft is now invisible to its own author.** This is the real cost of the gate and it was not in
the ask. NOTE-STANDARD tells an author to write with `status: DRAFT`, and LOOP section 4a says a
rendered change is shown before it is called done. Those two rules now contradict each other for
notes: a drafted note cannot be looked at rendered, locally or anywhere, because the gate does not
know the difference between the dev server and the published site. The cheapest honest fix is an
environment switch the dev server sets and the export never does, roughly three lines next to
`publishedSource()`. It is a design decision about what the local server means, so it is left for
the owner rather than taken.

**A drafted note's URL answers a bare, unstyled "Not found" in `text/plain`.** The site has its own
404 page and MILL's 404 short-circuits before it. This is pre-existing behaviour for any nonexistent
MILL slug rather than something the gate introduced, but the gate is what makes it reachable by
following an ordinary link, so it stopped being theoretical today.

**Nothing warns when a published note links to a note that has just gone DRAFT.** Tested rather than
assumed: with `watch-its-hands` flipped to DRAFT, `whitepaper-one-vocabulary.md` still links to it
and `bun run lint:links` reported no dead relative links. The link checker reads files on disk, so
the gate is invisible to it. Un-publishing a note therefore breaks inbound links silently, which is
the same class of failure as the bug this run fixed.

**NOTE-STANDARD needs no edit and is now more true than it was.** Its line 64, DRAFT by default and
only the owner flips it to PUBLISHED, describes what the code does for the first time. The one thing
a future pass may want to add is the sentence a reader would now want: what DRAFT costs you, namely
that you cannot see the note rendered while it holds.
