# Learn map: performance and phone audit, 2026-11-27

This audit covers the learn map at /learn, its quest book, and the new guild card, on a 375 by 812 phone viewport and on desktop. It was run in the desktop app's browser pane with phone emulation, so the numbers are real measurements of the code but not of a real phone. The fixes below are committed with the e2e tests that guard them.

## What I measured

| Measure | Result | Reading |
|---|---|---|
| Map page transfer on a fresh load | 163 KB | Small. The largest items are the base art (71 KB) and the art manifest (44 KB). |
| DOM nodes in the map | 502, of which 15 are pins | Small. |
| JavaScript heap | 6 MB | Small. |
| One map repaint | about 0.2 ms at every zoom level | Not a bottleneck. |
| One ambient animation frame (water, torches, flags) | about 0.06 ms | Not a bottleneck. |
| The guild card's check, run twice a second or so | under 0.01 ms | Not a bottleneck. |

## What I found and fixed

1. **The shell's bottom bar covered the bottom of the map.** The map frame ran 60 px under the fixed bar, so the next and previous buttons sat behind it. The map now stops above the bar.
2. **The guide panel took 44 percent of a phone screen and left the map a strip.** On a phone the map now takes the whole screen. The guide is a modal sheet, opened by a pin, the Open button, or search, and closed with the cross or a tap outside it.
3. **Moving between regions and quests needed the panel.** The map now carries its own previous and next bar with the current place named, so stepping never opens the modal.
4. **There was no pinch.** Two fingers now scale the map live, and on release it settles on the nearest zoom level, because the pixel art is only crisp at whole levels. Dragging with one finger already worked.
5. **A phone could not zoom out far enough.** At the World level a phone shows only half the island. Small screens now get an extra Overview level that fits all of it, and the first view is the whole island. Wide screens do not get this level, because the island would sit small in a large empty sea.
6. **The ambient animation repainted about six times a second even under a modal.** It now rests while the guide or the book covers the map, and starts again when they close. The guild card's check also stops while the tab is hidden.
7. **Pins were 22 px when zoomed out, below a comfortable finger target.** On a phone they are now 32 px, and 38 px at the landmark level.
8. **The six landmark scene images loaded at start although they only show from the Regions zoom in.** They now load the first time the reader zooms to Regions. The saving is real but small, because the six images together are about 25 KB, so the bigger load cost is still the shell.
9. **The phone book wasted about 70 px at the bottom, and its controls were small.** The extra padding is gone and its buttons are at least 36 px tall.

## What I did not fix, and what I could not measure

- **The shell dominates the load.** Opening /learn also loads the whole desk shell, about 25 scripts, before the map's own 163 KB. Trimming the shell on a phone is a separate piece of work in the portfolio frame.
- **A real phone.** I could not measure real frame rate, battery draw, touch latency or a Lighthouse run. The preview pane throttled animation frames, so its frame rate is not a reading of the code. A pass on a real mid-range phone is the missing evidence.
- **Several failed resource loads in the console.** They read ERR_INCOMPLETE_CHUNKED_ENCODING and look like the dev server's event stream, not the map. I did not trace them.
- **Landscape and the top safe area** were not checked.
- **The pinch was tested with synthetic touch events,** which exercise the code path but not a real finger's jitter.

## Where I might be wrong

The thresholds that choose a zoom level after a pinch are a nearest-level rule I did not tune by hand on a device. If a pinch feels sticky or too eager on a real phone, that rule in the map's finishPinch function is the place to look.

## User experience pass, same day

A second pass, driven by a review of the first minute, the phone controls and how close the map zooms. The plan is plans/learn-ux-pass.md, and every change below has an e2e test in e2e/learn.e2e.ts or e2e/notes-feed.e2e.ts.

### What changed

1. **The first minute.** Start now opens lesson one. Continue shows only once a stop is finished. The Harbor page no longer leads with a button that leaves the site, and the ferry says what it skips. The quest sheet's main button reads Begin quest, then Next: stop N, then Read it again.
2. **Vocabulary.** The Codex tab is Runes, because the old name sat too close to a well known product. Rest at campfire is Save and close. Class is For. Log, Runes and Pack each say what they hold.
3. **Phone controls.** Every control on the map, the guide and the book measures at least 44 px each way, which a test checks. The numbered pins are left out on purpose, since 44 px pins would cover each other. The lesson header is two rows, about 110 px, and the Note and Guide switch shows which side is open.
4. **Zoom.** Zooming by hand stops at Landmark. Stops is reached by choosing a stop. Close in, a small card names the region, no pin is drawn under a control, and on a phone the chips fold away and the search shrinks to its icon until tapped.
5. **The side panel overlaps the map.** Folding it no longer slides the map sideways.
6. **Badges** show the runes collected, and the ones still to find.
7. **The notes page** has an AI roadmap tab: the same stages in the same order as the map, a jump bar by stage, and a button into the map.

### What I did not measure

- A real phone. All of this is headless Chromium with phone emulation, so touch feel, real frame rate and the pinch gesture are unchecked.
- The quest-complete and level-up screens, keyboard-only use, a screen reader, dark themes and landscape.
- Whether 44 px chips and buttons feel too heavy on a small phone. They look chunky in screenshots, and that is a judgment call for a person with a device.
- At Landmark on desktop the guide panel still covers about a third of the map. It can be folded, and folding no longer moves the map, but I did not change its width.

### Where I might be wrong

The region card picks the region whose centre is nearest the middle of the view, which can name a neighbour when the view sits on a border. The rule that hides pins under controls tests the pin's centre against each control's box, so a pin whose edge pokes out from under a button can still show.
