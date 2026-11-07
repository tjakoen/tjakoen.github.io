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

- **Always on the desk.** The ant sits in the status bar on every page. Click it to open the
  colony; the `nest` terminal command opens it too. There is no query-string shortcut.
- **The colony.** Three scouts and three workers to start. A block with a trail or a scout is taken,
  so the first three scouts and later ones stay off each other's source. The first three stay in view:
  the first takes the closest, the second the opposite side of the mound, and the third the most
  spread-out remaining spot. A scout draws a faint route as it walks,
  the route firms up when the scout carries the first letter home, workers take open trails in turn,
  five to a line, and a trail fades when its patch empties or after ninety seconds. A successor
  scout goes out as the old trail fades. Soldiers hatch once the colony passes eight and take two
  hits.
- **Mini hills.** Every other letter goes to two storerooms instead of the queen, and a stores bar
  shows how full they are. A full store sends a builder to an open spot on the page, sometimes
  below the fold. Builders favor gaps left by stolen letters and spread out from existing hills. Squash the builder and the stores
  are lost. A mini hill sends guards to patrol trails and flyers to steal letters. Its mound thins
  with each hit. Knocking it calls the guards home; clearing them splits the mound open inside an
  accent outline and no new guards spawn. Five clicks break it. Its flyers outlive it.
- **The player's tools.** Pick a tool: squash holds every page link so a missed ant never
  navigates, wipe is the only tool that breaks scent, and links gives the page back with a leave
  confirmation. A blocked link shows a toast with a one-click switch to Links. The panel gives
  each tool a name, an icon and a key. Squash ants, drag across a scent trail to break it, drop bait
  to pull nearby ants off course, and seal the anthills from the panel or by holding one. Bait and
  seals have cooldowns. Sound is muted until switched on.
- **The colony dances.** Every time the colony has taken twenty, then fifty, then a rising number
  of letters, it stops: the queen comes out of the hill, the workers circle her, the stolen glyphs
  orbit, and then the colony goes back to work. The page is the whole environment, so the ants may
  work below the fold while the player reads.
- **No announced ending.** Wipe the colony after the queen has spent her two reserve scouts and the
  queen dies: the nest goes still and the page keeps its gaps. Let one in seven characters go,
  capped at 120, and it is too late: the ants can no longer be squashed and eat on until the page is
  empty. Leaving the tab still restores everything.
- **It lives on the page.** A refresh or a move to another page closes the panel and clears the
  colony; a page link asks first. The launcher stays in the status bar. The stray click is
  remembered for the tab.
- **The stray.** When the game is closed, a single ant sometimes crosses the reading pane, off any
  trail. It uses the same animated ant art as the colony. If nobody clicks it, it leaves the screen
  after fourteen to nineteen seconds. Click it and it runs down the page, along the status bar, and
  into the launcher; the launcher pulses. A click marks the tab, so the random ant does not return
  until a new tab. Type `stray` in
  the terminal to send one on demand.

## Open questions for the owner

- Does a beaten colony end the game, or does a new queen move in after a while?
- Is a small leaderboard worth having, or does the larder of stolen words say enough?

## Mockup

`scripts/nest-mockup.js` fakes the panel and one wave of ants on the live site so the idea can be
played before the real build. Click the ant in the status bar, or type `nest` in the terminal;
`?nest-debug` only exposes the local test hooks. It is a playable sketch: ants steal real letters, the queen breeds
every three, a click squashes, and every colour is a theme token.
