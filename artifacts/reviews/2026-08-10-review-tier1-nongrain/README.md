# Capture: Review: a tour on a project that never heard of us

Tour review-tier1-nongrain, dev mode. Captured 2026-08-10T06:48:13.257Z.

The app under review was http://localhost:5210, loaded through PANTRY at http://localhost:57969, so these are
the bytes the review serves, injection included, rather than the ones the app serves directly.
The box is not the review's: this is a plain 1280 by 800 window, while the live
embed sits in a frame beside the rail and is narrower than that. A layout that turns on a
breakpoint can differ between the two.
CSS transitions and animations are off, so a shot is a settled state rather than a frame of one.
Motion driven by script, video or an animated image is not something this can stop.

All 3 steps resolved.

## Steps

### 1. page:tickets

- verdict: ok
- status: needs-verification
- url: http://localhost:57969/
- page shot: 01-page-tickets.png
- element shot: 01-page-tickets-element.png
- verify: The lamp is on the Tickets heading, not floating over the page corner. Nothing about the app's own layout moved to make room for it.

### 2. ticket:refund-state

- verdict: ok
- status: needs-verification
- url: http://localhost:57969/tickets/t-1042
- page shot: 02-ticket-refund-state.png
- element shot: 02-ticket-refund-state-element.png
- verify: The page is the T-1042 detail, and the lit element is the refund badge reading "refunded" — not the heading above it.

### 3. ticket:total

- verdict: ok
- status: known-issue
- url: http://localhost:57969/tickets/t-1042 (no navigation; the page the step before it left)
- page shot: 03-ticket-total.png
- element shot: 03-ticket-total-element.png
- verify: The lamp moves down to the total line without a page reload. The text says the total is hidden, which is the known issue rather than a bug in the lamp.

Machine-readable: capture.json.
