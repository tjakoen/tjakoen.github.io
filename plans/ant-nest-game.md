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
  the DOM structure. Restore page puts every letter back in one click and re-sites the mounds; a
  reload always does.
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
  spread-out remaining spot. A scout carries its first light letter home before the trail opens;
  a scout killed on the way leaves nothing. A heavy letter gets the trail at the pickup and a call
  for the workers; the next worker out of the nest joins that trail first, and keeps joining it
  until the crew is full. A big letter is worth its crew size in portions, split between the queen and the stores. Other workers take open trails in turn, five to
  a line when the colony is small; the line widens with the colony, and the patch radius widens too so a long busy trail keeps finding letters. A trail fades when its patch empties or after ninety seconds. Each retired
  trail sends its own successor scout, so several spent patches do not leave one line. Successors
  look near the mound first; the trail target is one per two ants, and several scouts can work at
  once, so the number keeps climbing. Most eggs are workers; a few soldiers hatch once the colony
  passes ten, capped at three, and take two
  hits.
- **Mini hills.** Every other portion goes to two storerooms instead of the queen, and a stores bar
  shows how full they are. A full store sends a builder to an open spot on the page, sometimes
  below the fold. The first two favor a spot near the main hill; later ones spread out with a little jitter, not on a grid. If no clear ground is near, the search expands outward before it gives up. Builders
  favor gaps left by stolen letters. Squash the builder and the stores are lost. A mini hill sends
  guards to the nearest trail; when that trail disappears they take the nearest new one, or circle
  the mound while none is ready. Each mound keeps up to three guards and three flyers. It sends
  flyers to steal letters. Its mound thins
  with each hit, and a fallen mound lowers the stores cap. A hurt mound heals one hit at a time. Knocking it calls the guards home and flashes the mound and every guard; clearing them splits the mound open and no new guards spawn. Five clicks break it. Its flyers outlive it.
- **The player's tools.** The colony tools are Squash, Wipe, Bait and Seal, with names on the
  tiles; Links, mute, speed, pause and restore are the utility row below. Squash holds every page link so
  a missed ant never navigates, wipe is the only tool that breaks scent, and links gives the page
  back with a leave confirmation. A blocked link shows a toast with a one-click switch to Links. The panel gives
  each tool a name, an icon and a key. Squash ants (a pile goes together), drag across a scent trail to break it, drop bait
  to pull nearby ants off course, and seal the anthills from the panel or by holding one. Bait and
  seals have cooldowns. Restore page asks first: it puts the letters back, re-sites the home and mini mounds, keeps the ants, and scrolls to a new home that lands off screen.
  Sound is muted until switched on; the unmute button gets a brief attention pulse that stops on hover, focus, click or after eight seconds.
- **The colony worships.** Every time the colony has taken twenty, then fifty, then a rising
  number of letters, it stops: the queen crawls out of the hill and walks to a clear patch near
  it, every ant on the page moves toward her and the far ones turn back to their trails when it
  ends, the sidepanel pulses, the stolen glyphs orbit, and a next worship bar tracks the next
  one. The target is fixed until that dance finishes, then the next one is set. The queen climbs
  out of the panel nest and back down, and the trails hide while she is out. The page is the whole environment, so the ants may work below the fold while
  the player reads.
- **No announced ending.** There is no win, no reserve and no game over. If the last ant is gone
  the queen sends one scout back out and the colony continues. The page can run out, and the
  colony still continues: another scout goes out and the ants take what is left. Leaving the tab
  still restores everything.
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
