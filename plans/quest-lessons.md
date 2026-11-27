---
id: quest-lessons
status: todo
track: learning
depends: [quest-map]
touches: [content/lessons, tools/quests.ts, content/notes, docs/mockups/quest-map]
owner: human
---

# Quest lessons: how the notes are cut, and what gets recorded

The quest map needs a lesson for each quest. A lesson is a recording of me explaining part of a note in
my own words, played inside the quest book while the note itself stays open and untouched. This plan
decides where a note is cut, how big a stop is, and which lessons exist.

## Where a note is cut (decided)

1. **The unit is the H2 section.** MILL already stamps a slug id on every H2 and H3, using one shared
   algorithm. The desk's retrieval and the spotlight both resolve through those same ids, so a lesson
   boundary is one more consumer of an address that already exists, not a new back channel. H3 headings
   are never boundaries. The text before the first H2 is addressable as intro.
2. **A segment is a note, a from id and a to id.** The range is inclusive and contiguous in reading
   order, with an optional skip list for sections inside it. A cut that is not contiguous is two segments.
3. **One segment is one stop.** One stop is one recording chapter, one trial, its runes and its XP.
   There is no second unit between a segment and a stop.
4. **Size.** A stop covers about 600 to 1,500 words of the note. A section is never split across stops. A
   section over 1,500 words stands alone as a reference stop, marked so the book can say "this is the
   reference part, skim it". Five exist today: the light chain in how-the-model-layer-works (2,212), the
   related work section of the whitepaper (2,777), what a Model Intelligence Layer does (1,899), the part
   that makes it professional in ten-times-zero (1,641) and the shape of the floor in build-the-floor (1,675).
   A reference stop is always a single section. A tail under 500 words folds into the stop before it, unless
   the fold would push that stop past 1,500 words, in which case the tail stands alone. A note of 1,200 words
   or more always gets at least two stops, and that rule wins over the tail rule.
5. **Lessons hold three to six stops.** A note that yields more is cut into lessons of near equal size, at
   a section boundary. A note that yields fewer joins the next note in its region as one lesson, as long as
   the lesson stays at six stops or fewer. If no neighbour can take it, a two-stop lesson is allowed, and this
   plan names it. A lesson is about 15 to 30 minutes of recording.
6. **Sources never become stops.** Sections named Sources, The sources, References or What I read to get
   here are skipped, and the links inside them feed the Pack tab.
7. **A concept highlight names a section id and a short quote.** The quote finds the passage inside that
   section. If the quote is gone the book falls back to highlighting the section heading, which is still
   spotlightable, and a test warns.
8. **Boundaries are held by tests.** The build fails when a lesson names an id that no longer exists in
   its note. Renaming a heading warns, and the same commit has to update the lesson file. A heading rename
   is a content change with a cost, and now it shows.

## The proposer does the first cut

A new note should not need a hand cut. The same tool that checks quest fit (tools/quests.ts check) walks the
note's H2 sections by these rules and writes a draft lesson file with the stops, the ids and the word
counts. I then write the stop titles, the digests and the trials. A human can move any boundary. The
tables below are what the rules produce today, with two corrections: watch-its-hands came out as a single
stop and was split in two by the 1,200 word rule, and show-them-the-board gets a fourth stop because folding
its 457 word tail would break the 1,500 word cap.

## The lesson file

Lessons live in content/lessons, one file each, a MILL collection like the badges. A stop carries only
what a note cannot: the stop's title in my words, its cut, its runes, its trial and its digest.

```yaml
id: loop-setup
quest: loop-setup
title: Set up your own loop
summary: In five short stops I walk you through setting up the loop on a repo of your own, from the first prompt to the first check.
audio: /media/lessons/loop-setup.m4a
stops:
  - title: Start with the prompt, then the idea
    note: loop-setup
    from: intro
    to: what-the-loop-is
    runes:
      - id: the-prompt-is-short
        section: start-with-the-prompt
        quote: The prompt is short
    trial: Write the one prompt you would give a new repo.
    digest: [one line each, three at most]
```

Cues (start time, text, optional rune id) sit beside it as a captions file. The transcript is the caption
track, so there is one source for the book and for the accessible fallback.

## The lesson card on a note

A note with a lesson links to it with a card, so the note and the lesson find each other from both sides.

- **Where.** Under the byline, above the contents block. It appears only when the note is published and
  a lesson cuts it.
- **What it says.** A small pixel picture of the region, the label Lesson, the region and quest, and the
  lesson's own summary: two or three sentences in my words about what the lesson adds. It explains the
  lesson. It does not repeat the note's summary. The summary is a required field in the lesson file.
- **What it shows.** Stop count, minutes of audio, level and XP, the runes the reader will collect, and a
  progress bar read from the reader's saved state in their browser.
- **What it does.** One button that reads Start lesson, Continue at stop 3 or Review, and one that opens
  the quest on the map.
- **Each section that belongs to a stop** gets a small pip beside its heading that opens the lesson at that
  stop. It shows done and next states.
- **Variants.** A lesson that spans notes says which stops are in this note and links to the others. A note
  in several lessons shows one row per lesson, each with its own button and progress.
- **Without the art.** It is plain text and links, so it works with the picture off and for a screen reader.
  Notes without a lesson show nothing, and the note's own text is never changed.

## Runes and badges

They are different things, and the plan keeps them apart.

- A **rune** is one concept taught in one stop. It lives in the Codex, is tied to a section id and a quote,
  and is cosmetic and self-reported.
- A **badge** is earned by finishing a region: every stop and its trial. It has criteria, a page, and a
  medallion. It is its own kind of badge, not one of the HAU course badges: its own collection, its own
  medallion and its own page.
- The two meet in one place: a badge page lists the runes collected on the way as its skills, the way a
  certification lists skills. Collecting every rune in a region without doing the trials earns nothing
  but the Codex entries.
- Cosmetic achievements, such as every Mines rune, may exist later. They are never badges.

## Mockups this plan relies on

The lesson book, the lesson card, runes versus badges, the notes and lessons model and the phone screens
are in docs/mockups/quest-map/index.html, sections 4 and 6 to 9. The map the lessons hang from is
fullscreen.html. The file list and what each backs is in the quest-map plan.

## What the mockups quote

The mockups use the real note, I Ran Out With Hours Left: its text, its level (intro), its reading time
(about 10 minutes), its audience, its four stops and its runes. The Guide's lines are placeholders written
from the note until the pilot is recorded. Rune names are tied to real sections, for example A worse model
is a hobby from The night I went looking for a way out, and The plan lives in a file from the Loop Forest
note's section on where the plan lives.

## The lessons

| Region | Quest (note) | Lessons | Stops | Words covered |
|---|---|---|---|---|
| Loop Forest | one-loop-every-repo | 1 | 4 | 2,645 |
| Loop Forest | one-loop-three-harnesses | 1 | 4 | 3,440 |
| Loop Forest | loop-setup | 1 (shared with the-check-that-never-ran) | 3 | 3,203 |
| Loop Forest | the-check-that-never-ran | joins the loop-setup lesson | 2 | 1,859 |
| Model Mines | necessity-and-the-model-layer | 1 | 4 | 4,710 |
| Model Mines | plan-big-type-small | 1 | 4 | 3,284 |
| Model Mines | how-the-model-layer-works | 2 | 9 | 9,619 |
| Guild Hall | show-them-the-board | 1 | 4 | 3,815 |
| Guild Hall | move-bugs-left | 1 | 3 | 2,248 |
| Guild Hall | the-reviewer-that-learned-to-be-wrong | 2 | 8 | 5,886 |
| GRAIN Keep | watch-its-hands | 1 | 2 | 1,679 |
| GRAIN Keep | whitepaper-one-vocabulary | 1 | 5 | 6,765 |
| Summit | ten-times-zero | 2 | 8 | 7,307 |
| Summit | build-the-floor | 2 | 9 | 9,479 |



Counts come from the rules above and move whenever a note is edited. Totals by the hand count: 14 notes, 69 stops,
17 lessons. The tool's count is lower, see The cuts today. That is the honest cost, and why the order below matters.

**Loop Forest · one-loop-every-repo**

Lesson
- Stop 1: intro to So I stopped building features and read (668 words)
- Stop 2: The first thing I fixed was where the plan lives (709 words)
- Stop 3: One heartbeat, and it fires while I'm already working to The contract that keeps an unattended run honest (723 words)
- Stop 4: What I am honest about to Where that leaves me (545 words)

**Loop Forest · one-loop-three-harnesses**

Lesson
- Stop 1: intro to The loop was the thing I had not written down (779 words)
- Stop 2: What the loop actually is to Three harnesses, one standard (918 words)
- Stop 3: The model is a routing decision (679 words)
- Stop 4: A week with one to five projects to The part I keep (1,064 words)

**Loop Forest · loop-setup and the-check-that-never-ran, one lesson of five stops**

Lesson
- Stop 1: intro to What the loop is (1,148 words)
- Stop 2: Your standards are the contract you write to Step three: the checklist (848 words)
- Stop 3: Step four: the guards, when they earn it to The turn (1,207 words)
- Stop 4 (the-check-that-never-ran): One run in a hundred and sixty-five sessions to The story I told myself, and it was a good one (738 words)
- Stop 5 (the-check-that-never-ran): Then I ran it myself, from the wrong folder to What it says now (1,121 words)

**Model Mines · necessity-and-the-model-layer**

Lesson
- Stop 1: intro to The night I went looking for a way out (1,014 words)
- Stop 2: The old setup and the new one (611 words)
- Stop 3: What a Model Intelligence Layer does (1,899 words) (reference stop)
- Stop 4: What is built, and what is still ahead to The turn (1,186 words)

**Model Mines · plan-big-type-small**

Lesson
- Stop 1: The question that made me write this to Thinking and typing are different jobs (823 words)
- Stop 2: The biggest model is not the default to Try low effort before you assume high (1,072 words)
- Stop 3: Where the split is actually wired to The same pattern in Codex (625 words)
- Stop 4: The lesson to Where this goes next (764 words)

**Model Mines · how-the-model-layer-works**

Lesson 1
- Stop 1: intro to The registry, and tiers instead of models (894 words)
- Stop 2: The guard that restarts a session on the wrong model (864 words)
- Stop 3: Hard work is delegated, never switched to to Repository clearance and the privacy flag (1,097 words)
- Stop 4: The light chain, in order (2,212 words) (reference stop)
- Stop 5: The paid route needs my typed approval to Spawning, context, recovery and the goldfish gate (1,271 words)
Lesson 2
- Stop 6: Work is a different lane, enforced three ways (917 words)
- Stop 7: What gets recorded, and why free and paid sit apart to Five levels, and what a pass is allowed to claim (770 words)
- Stop 8: Build your own to What is public, and what is private (955 words)
- Stop 9: What is proven, and what is still being proven to The turn (639 words)

**Guild Hall · show-them-the-board**

Lesson
- Stop 1: I was building the wrong thing, carefully to The review kit, now with a window (973 words)
- Stop 2: Crew Watch, attempt number four (1,176 words)
- Stop 3: My whole AI policy is a demo (1,209 words)
- Stop 4: The rule that comes with the token to What I have not earned yet (457 words)

**Guild Hall · move-bugs-left**

Lesson
- Stop 1: intro to Who built it (604 words)
- Stop 2: How the epic checker works (620 words)
- Stop 3: What came back to me to What I have not earned yet (1,024 words)

**Guild Hall · the-reviewer-that-learned-to-be-wrong**

Lesson 1
- Stop 1: intro to Early Aug · Why not? (967 words)
- Stop 2: Aug 14 · It started as a reviewer I had to babysit to Aug 18 · Then it had to keep score (872 words)
- Stop 3: Sep 17 · The talk was the old version to Sep 28 · Then other people wanted it (751 words)
- Stop 4: Oct 8 · Then it needed a second engine to Oct 13 · Then it had to earn its keep (718 words)
Lesson 2
- Stop 5: Oct 14 · Then it had to prove its repairs held to Oct 18 · Then it got a map of the code (652 words)
- Stop 6: Oct 26 · Then it had to decide what deserved a look to Oct 30 · Then it let one through (683 words)
- Stop 7: Nov 9 · How it works now (689 words)
- Stop 8: What the team felt, and what I got back to What I have not shown (554 words)

**GRAIN Keep · watch-its-hands**

Lesson
- Stop 1: intro to So I built the boring version (1,213 words)
- Stop 2: What I have not earned to Watch its hands (466 words) (a two-stop lesson, allowed because the region has no other note that fits)

**GRAIN Keep · whitepaper-one-vocabulary**

Lesson
- Stop 1: intro to 1. Introduction (1,256 words)
- Stop 2: 2. The approach (in brief) (796 words)
- Stop 3: 3. Related work and positioning (2,777 words) (reference stop)
- Stop 4: 4. Contribution to 5. Evaluation (1,088 words)
- Stop 5: 6. Limitations and threats to 8. Open questions / next research pass (848 words)

**Summit · ten-times-zero**

Lesson 1
- Stop 1: intro to AI is a multiplier, not an addend (631 words)
- Stop 2: I was the zero, for years to So we're clear who's talking (737 words)
- Stop 3: A decade of rehearsal, billed as management (624 words)
- Stop 4: The receipts to The one number that matters (908 words)
Lesson 2
- Stop 5: Now the "vibe" part, because I do go fast (796 words)
- Stop 6: The part that actually makes it professional (1,641 words) (reference stop)
- Stop 7: The best trick of all: the AI's mistakes are a measurement (783 words)
- Stop 8: The tell is the ratio to The point (1,187 words)

**Summit · build-the-floor**

Lesson 1
- Stop 1: intro to The floor is the variable, and it is measurable (856 words)
- Stop 2: The roadmap (1,028 words)
- Stop 3: The floor has a shape, and it is worth naming (1,675 words) (reference stop)
- Stop 4: Stage zero: instrument, and make one repository legible (703 words)
- Stop 5: Stage one: extract the skills (933 words)
Lesson 2
- Stop 6: Stage two: get them used, and score what happens to Stage three: the same skills, fired by triggers (1,334 words)
- Stop 7: Stage four: the loop (849 words)
- Stop 8: Six ways these systems fail without telling you (756 words)
- Stop 9: Your scaffolding has an expiry date to What I would want to build (1,345 words)


## Order of recording

The path is the order, so the recordings follow it. A learner hears them in this order, and the recording order is the same.

1. **The opening talk, the Harbor.** It is introductory and inspiring: why getting good at AI matters, that this is not really taught where I teach, my view that builders matter more than coders, and the Claude Academy address for the basics. It hands over to Ten Times Zero. It has no note behind it, so it is the one lesson written from my own words.
2. **Stage 2, intro:** ten-times-zero, loop-setup, plan-big-type-small. Ten Times Zero is the first stop of the path.
3. **Stage 3, intro:** necessity-and-the-model-layer, then build-the-floor in two lessons.
4. **Stage 4, intro:** show-them-the-board, which carries move-bugs-left as its last stop.
5. **Stage 5, deep:** one-loop-every-repo, which carries watch-its-hands, then whitepaper-one-vocabulary.
6. **Stage 6, deep, last:** one-loop-three-harnesses, which carries the-check-that-never-ran, then how-the-model-layer-works in two lessons, then the-reviewer-that-learned-to-be-wrong.

**The pilot** stays small. If the path's first lessons are too long to prove the book on, record necessity-and-the-model-layer first (three stops, intro level) to prove the cues, the runes and the trial end to end, then record in path order.

Harbor has one stop that points out to Claude Academy at academy.claude.com. The opening talk is where that pointer is spoken.

### The cuts today

bun tools/lessons.ts cuts prints what the rules give for the notes on the path: 13 lessons and 58 stops, plus the opening talk. That is less than the 69 stops counted by hand above, because a stop now closes as soon as it reaches 600 words and a note that is mostly short sections packs into fewer stops. At four minutes a stop it is a little under four hours of recording, plus the opening. A lesson joins the next note of its stage when it has fewer than three stops, else the one before it, and a note over six stops is cut into lessons of near equal size. The hand count above stays as the first guess, and the tool is the one that tests hold.

Draft lesson files are in content/lessons, one per lesson, and each has a draft script beside it for me to read aloud and edit. The scripts are drafts written from the notes. They are not mine until I have read them, changed what is wrong and recorded them.

## What each stop owes

- [ ] A stop title in my words, not the section heading.
- [ ] A recording of three to six minutes, and its caption file.
- [ ] A digest of three lines at most, in plain words.
- [ ] One to three runes, each tied to a section id and a quote.
- [ ] One trial a reader can do in five minutes.

## Build tasks

- [ ] Lesson card molecule and the hook in the note page, with the section pips, tested for the draft, no-lesson, spanning and several-lessons cases.
- [ ] Badge page lists runes as skills, and region badges are awarded from trials only.
- [ ] Section walker and proposer in tools/quests.ts, with tests over the real notes.
- [ ] Lesson collection, schema and generated index. The index is never hand kept.
- [ ] Test that every lesson id, section id and quote resolves in its note, and that no draft note is cut.
- [ ] Rename warning when a heading changes under a lesson that cuts at it.
- [ ] Pilot lesson recorded and shown in the quest book in all six flavor and scheme pairs.

## Honest limits

- The cut is by structure, not by meaning. A good lesson sometimes wants a different cut, and the lesson
  file lets me make one, at the cost of a boundary the proposer would not have chosen.
- Notes that are edited after a lesson is recorded can drift from what I said. The rename test catches a
  moved heading. It does not catch a changed paragraph, so a stop records the note's date and the book
  says when the note changed after the recording.
- Four and a half hours of voice is a lot. The pilot decides whether to record all of it or only the
  spine of the path.
