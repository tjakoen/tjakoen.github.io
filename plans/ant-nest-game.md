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

## Open questions for the owner

- Should the colony carry across pages, so ants left alive on the home page are waiting on /notes?
- Does a beaten colony end the game, or does a new queen move in after a while?
- Is a small leaderboard worth having, or does the larder of stolen words say enough?

## Mockup

`plans/ant-nest-mockup.js` fakes the panel and one wave of ants on the live site so the idea can be
looked at before any of it is built. It has no game logic.
