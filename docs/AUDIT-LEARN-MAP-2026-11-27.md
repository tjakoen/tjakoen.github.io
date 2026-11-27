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
