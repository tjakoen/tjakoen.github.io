---
title: The Harbor gets its remaining notes, and the feed learns what a series is
date: 2026-11-28
status: partial
lane: direct
branch: claude/learn-next-steps-48yrn4
scope:
  - content/notes
  - content/lessons
  - content/quests
  - content/media/notes
  - view/learn-map
  - src/content.ts
  - view/components/molecules/note-card/note-card.css
  - plans
  - docs/CONTENT-BACKLOG.md
  - standards/NOTE-STANDARD.md
touched:
  - content/notes (six new drafts, series keys on the thirteen Harbor notes, one link swap, one new paragraph in start-here)
  - content/lessons (six new lessons and scripts)
  - content/quests/regions.json
  - content/quests/index.json
  - content/media/notes (six new cards, seven renumbered)
  - view/learn-map/map.html
  - view/learn-map/lessons (six new generated files)
  - src/content.ts
  - src/series.test.ts
  - view/components/molecules/note-card/note-card.css
  - e2e/learn.e2e.ts
  - e2e/notes-feed.e2e.ts
  - standards/NOTE-STANDARD.md
  - standards/INDEX.json
  - plans/harbor-curriculum.md
  - plans/quest-map.md
  - plans/decisions/2026-11-27-harbor-gets-notes.md
  - docs/CONTENT-BACKLOG.md
  - artifacts/runs/2026-11-28-harbor-notes-and-series.md
  - artifacts/runs/img
plans:
  - harbor-curriculum
  - quest-map
consulted:
  - VOICE.md#core-principles
  - NOTE-STANDARD.md#frontmatter-template
  - GLOSSARY.md#the-loop
  - skill:voice
diffstat: Six new Harbor notes with lessons and cards, a series field with a collapsed feed card and previous and next links, one new test file, and the plan, backlog and standard synced.
unpushed: 0
verifiedBy: Open the three screenshots in artifacts/runs/img. The nav at the foot of a draft note, the feed with the thirteen Harbor notes collapsed to one card, and the learn map showing quest 4 of 27. Then read the six new drafts aloud.
doctor: not run; the doctor is a machine-side tool and a cloud session cannot reach it.
---

## What ran

A cloud session started on the owner's question about what is next for /learn. The owner answered the
open questions in plans/harbor-curriculum.md in one reply: write notes 6 to 9, make atomic design its own
note with a conventional example from Brad Frost, write the fundamentals note, split testing if
appropriate, and make the path two halves (students first, leads and seniors second). Then they asked for
everything else that could be done to be done, merged and clean on main.

Git identity was set to Tjakoen Stolk before any commit, per the repo rule. No attribution trailers are
added to commits, because CLAUDE.md says that rule wins over the harness's default.

## Gate output

tsc, bun test, link lint, lint gate, lesson verify and reading-time check, in one run:

```
$ tsc --noEmit
 1146 pass
 2 skip
 0 fail
 8131 expect() calls
Ran 1148 tests across 74 files. [9.58s]
link-lint: 106 rendered file(s), no dead relative links.
lint gate: level. 4592 flag(s) total (oxlint + voice-lint), matching or under the 4592 in tools/lint-baseline.json (generated 2026-11-27).
25 lessons are current and every beat finds its quote
51 notes, 0 outside 20% of 220 wpm
```

Baseline before the change was 1134 pass, 2 skip, 0 fail. The 12 new passes are src/series.test.ts.

Voice lint on the six new notes only (the repo-wide count is advisory and sits in the lint gate above):

```
voice-lint: 0 flag(s) across 6 file(s) (0 tell, 0 warn).
```

Playwright, the three suites that touch this work (learn, notes feed, desk notes filter), after the fix
named below:

```
e2e/learn.e2e.ts: 33 passed
e2e/notes-feed.e2e.ts and e2e/desk-notes-filter.e2e.ts: 17 passed
```

The full Playwright suite, run after the last code change:

```
  1 failed
    e2e/terminal.e2e.ts:529:3 › the interactive terminal (third client of the one door) › restore puts the mounds somewhere else
  751 passed (20.5m)
```

The one failure is the ant nest test that expects the mounds to land somewhere new, which depends on random
placement. This change touches nothing in the nest or the terminal. Run alone it passed twice in a row, so I
read it as flaky and did not change it.

## What changed

**Six drafts.** Small Parts, Big Screens (atomic design, with Brad Frost's search form and header from
his own chapter, then GRAIN's atoms, molecules and organisms folders), The Fundamentals You Still Own,
The Words You Will Hear, From a Chat Window to Your First Loop, Catch the Idea Then Loop It, and Build
Your Own, Don't Copy Mine. Each has a three-stop lesson and a spoken script, and every beat's quote was
checked against its note by bun tools/lesson-data.ts verify. The Harbor now runs thirteen notes.

**The two halves.** Build Your Own ends by saying where the road splits, and Start Here carries one
paragraph about it. regions.json and plans/quest-map.md record it as one map with two readers.

**A series field.** series and seriesOrder in frontmatter, declared in NOTE_SERIES in src/content.ts, not
derived from the quest map. The feed's All tab shows a series with two or more published notes as one card
that opens an ordered list, the Learning to build tab and any search or tag filter show each note, and
every note in a series ends with previous and next links. src/series.test.ts holds the contract and keeps
the Harbor's series order equal to the quest map's order.

**Link check.** The outside links in the Harbor notes were opened. Eleven of twelve work. The TU Delft use
case tutorial could not be reached from the cloud session (the proxy returned 502), so draw-it now links
Visual Paradigm's instead. Lucidchart and the Codex goals page return 403 to curl and open in a browser.

**Fixed along the way.** Four reading times were two minutes too long (the reading-time test). The learn
e2e test hard-coded the path as 21 quests and now says 27.

## What was not done

- None of the six new notes was read aloud, so none is ready to be flipped from DRAFT. They are
  drafts for the author to edit.
- No recordings, cues or timestamps exist for the six new lessons.
- The series card has not been seen on the live feed, because the notes are drafts and drafts stay out of
  the feed. It was checked by temporarily publishing the thirteen notes in a local copy, taking the
  screenshots, and flipping all thirteen back to DRAFT. The flip back was checked by grep.
- Build the Floor sits in Model Mines but is written for leads. Moving it to the Guild Hall is open and
  was not done, because it would leave Model Mines with one note.
- The Harbor island's pins were not checked for crowding with thirteen quests on it. The map rendered and
  the e2e suite passes, but nobody has looked at it zoomed in.
- Visual baselines were not compared: CI skips them, and they are macOS-specific.
- The doctor and the map-freshness check were not run.

## Needs human eyes

- The six new drafts. They are written in the author's voice from the older notes and the repo, so the
  first-person lines ("I use Claude, Codex and DeepSeek", about six months of daily use, the juniors who
  built their own dashboards) all come from published notes, and nothing new is claimed about how the
  author works. The catch-the-idea and fundamentals notes are advice in the first person and may want to
  become real stories. Read each aloud.
- The mermaid figures in the six notes. They render, but nobody has judged whether they say the right thing.
- The three screenshots in artifacts/runs/img.
- Whether the series card should say 66 min for the Harbor, which is the sum of the readingTime values.
