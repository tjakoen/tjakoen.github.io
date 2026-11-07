---
status: proposed
owner: human
---

# Nest: an optional ant colony that lives in the site

The site is a desk, and things that sit on a desk long enough get ants. Nest is a fourth tab in the
right panel, beside Chat, Catalog and Notepad. It shows a side view of a colony in the soil. Open
it and the colony wakes up. Ants climb out of a crack in whatever page you are reading, carry
letters out of the copy back to the queen, and every few letters she lays another worker. Your job
is to stop them before the page stops making sense.

It exists to show that I can build a small game and interactive work on the same stack the rest of
the site runs on, without a framework or a canvas library.

## The loop

1. **Forage.** Workers come out of a crack placed near the page's text. Each one walks to a letter
   in the visible copy, lifts it, and leaves a blank behind.
2. **Haul.** The ant carries the letter back to the crack, where it reappears in the larder chamber
   in the sidebar. Every word stolen this way is legible in the larder, which makes the theft feel
   personal.
3. **Breed.** The queen turns letters into eggs. A progress bar under the nest shows how many letters
   are left before the next ant hatches. Vowels are worth more, because they hurt the page more.
4. **Exterminate.** Click an ant to squash it. One carrying a letter drops it, and the letter walks
   back into its slot. Plugging the crack takes a long press and slows the next wave. A colony that
   drops to zero workers and has no eggs left is beaten.

Page integrity, the share of letters still in place, is the score that matters. At zero the copy is
unreadable and the colony has won that page.

## Rules that keep it a portfolio rather than a nuisance

- Off by default, and nothing runs until the Nest tab is opened. The choice persists the way the
  sidebar mode already persists across pages.
- Works on any page, because it only reads text nodes inside the main content and never touches
  the DOM structure. Restore page puts every letter back in one click, and a reload always does.
- Respects reduced motion: ants step rather than crawl, and the colony pauses when the tab is hidden.
- Accessible: ants are buttons with a name, so a keyboard player can tab to them and squash them
  with Enter. The page text a screen reader hears is restored before it is read.
- No canvas. Ants are small inline SVGs on one fixed layer, moved with transforms, so the whole thing
  stays inside GRAIN's tokens and dark theme.

## What the mockup now does

- **Hidden by default.** Nothing loads until the game is unlocked, by typing the word nest anywhere
  outside a text field or by visiting with `?nest`. The unlock is remembered on that browser.
- **The colony.** Two scouts and four workers to start. A trail opens when its scout carries the
  first letter home, workers take open trails in turn, six to a line, and a trail dies with its
  last ant. Soldiers hatch once the colony passes eight and take two hits.
- **Mini hills.** Every other letter goes to two storerooms instead of the queen, and a stores bar
  shows how full they are. A full store sends a builder out to raise a mini hill in open ground;
  squash it and the stores are lost. A mini hill sends guards, which walk to an existing trail and
  patrol it, and flyers, which roam and steal letters anywhere. A badge counts its living guards,
  and once none are left five clicks break it. Its flyers outlive it but no more are made.
- **The player's tools.** Pick a tool: squash holds the page's links so a missed ant never
  navigates, wipe trail is the only tool that erases scent, and read page gives the links back.
  Squash ants, drag across a scent trail to wipe it, drop bait to pull
  nearby ants off course, and seal the anthills from the panel or by holding one. Bait and seals
  have cooldowns. Sound is muted until switched on.
- **No announced ending.** Wipe the colony after the queen has spent her two reserve scouts and the
  queen dies: the nest goes still and the page keeps its gaps. Let one in seven characters go,
  capped at 120, and it is too late: the ants can no longer be squashed and eat on until the page is
  empty. Leaving the tab still restores everything.
- **It follows you.** A colony left running is saved when the page unloads and resumes on the next
  page.

## Open questions for the owner

- Should the colony carry across pages, so ants left alive on the home page are waiting on /notes?
- Does a beaten colony end the game, or does a new queen move in after a while?
- Is a small leaderboard worth having, or does the larder of stolen words say enough?

## Mockup

`scripts/nest-mockup.js` fakes the panel and one wave of ants on the live site so the idea can be
played before the real build. Add `?nest` to any page's address to load it, for example `/?nest`. It is a playable sketch: ants steal real letters, the queen breeds every three, a click squashes, and every colour is a theme token.
