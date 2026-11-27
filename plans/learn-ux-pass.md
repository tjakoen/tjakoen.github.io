---
id: learn-ux-pass
status: doing
track: learning
depends: [quest-map]
touches: [view/learn-map/map.html, view/learn-map/book.js, view/learn-map/guild.js, view/unlisted/learn.html, e2e/learn.e2e.ts, scripts/learn-command.js, docs/AUDIT-LEARN-MAP-2026-11-27.md]
owner: human
---

# Learn map: a user experience pass

A review of /learn on a 1440 by 900 desktop and a 375 by 812 phone found a map that looks good and a
first minute that confuses. This plan fixes the journey first, then the phone details, then the
vocabulary, then how close the map zooms. The review itself was done in a headless browser with phone
emulation, so nothing here is measured on a real phone.

## Decisions already made

- **Notes stay marked DRAFT for now.** The badge is left alone. It is the honest label until the notes
  are finished, and this plan does not touch it.
- **The Codex tab is renamed.** It is too close to OpenAI's Codex product. The tab holds runes, so it
  becomes Runes, and the rune card says "added to your runes". The stored data key stays as it is, so
  nobody loses progress. Mentions of the real Codex product inside notes (running out of Codex usage)
  are correct and stay.

## 1. The first minute

The goal: a newcomer presses one obvious button and is reading lesson one.

- [x] Make Start at the Harbor open quest 1 at stop 1 in the book, not the Harbor region page.
- [x] On the Harbor region page, make Open Claude Academy a plain text link below the route, so the
  primary button on that page is the first quest, not an exit from the site.
- [x] Show Continue only when there is saved progress. At zero progress, Start is the only button.
- [x] Say what the Ferry button does. Read what it does in the code first, then label it for that
  ("Skip ahead to the Guild Hall" if that is what it is).
- [x] After closing the book, show a Next stop button on the quest sheet so finishing a stop leads
  somewhere.
- [x] Say "0 of 21 done" on the progress card next to the level, so progress reads as progress.

Done on 2026-11-27, with three notes on how the plan was read. The "0 of 21 done" line is in the
home panel's header, not the small HUD card, which is too narrow to carry it. The Next stop button is
the quest sheet's main button, which now reads "Next: stop N" once a quest is under way, then "Read it
again" when it is finished. Class is relabelled For ("For: Learner, Builder") rather than explained.

## 2. Phone: finger targets and the lesson header

The goal: every control on a phone is at least 44 by 44, and the lesson text starts high on the screen.

- [ ] Raise to 44 px: the first, previous, next and last quest buttons (now 34 by 30), the stop
  numbers (33 by 33), Close the book (31 by 23), the guide panel's back and close row, and the
  playback row in the book (play, skip, speed).
- [ ] Give the source links inside a lesson vertical padding so they are at least 44 px tall to tap
  (they are 16 px now), without changing how they read.
- [ ] Merge the lesson header. Show the stop name and a "1 of 6" counter on one line instead of
  "LOOP FOREST, QUEST 8, STOP 1 OF 6, I WAS THE ZERO", and fold the Note and Guide switch into the
  tab row. The reading area should start above 120 px, not about 180.
- [ ] Let the filter chips scroll sideways on a phone with a fade at the edge, so "Not started" is
  not cut off.

## 3. Vocabulary

The goal: nothing on the screen needs a game manual.

- [x] Rename the Codex tab to Runes in book.js, including its heading and the rune card wording.
  Check the e2e tests and the mockups for the old word, and leave the product mentions alone.
- [x] Put a one-line hint under each of Log, Runes and Pack that says what it holds. If one is empty,
  say so instead of showing a blank panel.
- [x] Rename Rest at campfire to say what it does ("Save and close"). Keep the campfire as the icon.
- [x] Explain Class and Level once, in a tooltip or a line on the quest sheet, or drop Class where it
  adds nothing.

## 4. How close the map zooms

The goal: the map is browsable at every level, and the closest levels are only reached on purpose.

What I saw: World and Regions are well balanced on desktop. Landmark and Stops are too close for
browsing. At Stops one map pixel is about ten screen pixels, so a single town fills the screen with
four or five pins. On a phone at Landmark the search bar, chips, zoom buttons, progress card and the
bottom bar cover about a third of the screen, the dimmed pins from other regions sit half hidden
behind the previous and next buttons, and no place labels are drawn, so you cannot tell where you are.

- [ ] Choose the level a link flies to. A region goes to Regions, a quest goes to Landmark framed so
  all of its stops are in view, and only a single stop goes to Stops.
- [ ] Stop the plus button stepping straight into Stops. Reach Stops by selecting a stop, and let
  the plus button end at Landmark.
- [ ] On a phone at Landmark and closer, collapse the search bar and chips into one small button so
  the map gets the room back.
- [ ] Hide pins that fall under the controls (previous and next, zoom stack) instead of drawing them
  half covered, and make the dimmed pins from other regions clearly dimmed or hidden.
- [ ] Draw the region name at Landmark so there is always one label on screen.
- [ ] At Regions on desktop, keep the Unmapped note and the right-hand edge clear of the zoom stack.

## 5. Check it

- [ ] Update e2e/learn.e2e.ts and scripts/learn-command.test.js for the new Start, Continue and Runes
  behavior, and add tests for the 44 px floor on the phone controls.
- [ ] Screenshot desktop and phone at each zoom level, before and after, and look at them. The site
  rule is that a rendered change is shown before it is called done.
- [ ] Run the gates from the repository root: bun run check, bun test, and the Playwright suite with
  image comparisons skipped (the visual baselines are macOS only).
- [ ] Add a dated note to docs/AUDIT-LEARN-MAP-2026-11-27.md, or a new audit, saying what changed and
  what is still unmeasured: a real phone, the quest-complete and level-up states, keyboard and
  screen reader use, dark themes and landscape.

## Order

Do section 1 and section 3 first, since they fix confusion and cost little. Section 2 next, as one
pass through the phone styles. Section 4 last, because it changes how the map feels and needs the
most looking at on a real device. Each section can ship on its own.

## 6. Added on 2026-11-27: three more asks

- [x] The side panel overlaps the map. Folding and unfolding it must not move the map, because the
  panel is a card lying over it. Today the view's centre is offset by half the panel's width, so each
  fold slides the whole map sideways.
- [x] A badge shows the runes collected under it, as the pixel rune with its name, and the runes of
  that region not yet collected, greyed, with an "n of m" count.
- [x] A Learn tab on /notes for readers who do not want the quest map. It groups and orders the notes
  the way the map's path does: stage by stage, in walking order, with the same quest numbers. It lists
  published notes only, since drafts are not public. The tab beside it already named "Learning to
  build" filters by audience and does not order anything, so the two names sit close together.

Done on 2026-11-27. Notes on how it was read: the Learn tab sits second, right after All, because on a
phone the tab strip scrolls sideways and a tab at the end is out of sight. It lists 14 published notes
in stages 2 to 6; the Harbor stage holds only drafts, so it does not appear, and the numbers still say
"Quest 8 of 21" as the map does. The page does not link to /learn, which is deliberately unadvertised.
The badge lists the collected runes by name with their line and shows the rest as small faint tiles,
because the Harbor alone teaches 28 and a full list of them made the badge a long scroll.

## 7. Added on 2026-11-27: the notes tab becomes the AI roadmap

- [x] The tab is named AI roadmap.
- [x] A jump bar lists each stage with its level (Intro, Deep dive) and note count, and scrolls to it, so a reader goes straight to where they are.
- [x] A Learn AI with me button, in the map's look (square corners, heavy outline, hard shadow, monospace, a pixel sword), opens the quest map. The notes page now links to /learn. The page itself stays noindex and out of the sitemap and search, which the existing test checks.
