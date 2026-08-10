# Capture: Temporary: capture's three failure verdicts

Tour tmp-capture-failure-proof, dev mode. Captured 2026-08-10T06:48:43.445Z.

The app under review was http://localhost:5210, loaded through PANTRY at http://localhost:57994, so these are
the bytes the review serves, injection included, rather than the ones the app serves directly.
The box is not the review's: this is a plain 1280 by 800 window, while the live
embed sits in a frame beside the rail and is narrower than that. A layout that turns on a
breakpoint can differ between the two.
CSS transitions and animations are off, so a shot is a settled state rather than a frame of one.
Motion driven by script, video or an animated image is not something this can stop.

## 3 of 3 steps failed

A failure here is the harness doing its job. An address that cannot be resolved at capture
time is one that would have lit the wrong element at review time, silently.

- Step 1, page:nowhere: missing. No element carries data-surface="page:nowhere" on http://localhost:57994/. Either the attribute was never added, or the markup that carried it moved.
- Step 2, note:tier: ambiguous. 2 elements carry data-surface="note:tier" on http://localhost:57994/. An address that resolves to more than one element resolves to whichever copy the query reaches first, which is the drift this layer exists to avoid. Give the one under review its own address.
- Step 3, note:hidden: not-visible. data-surface="note:hidden" resolved to one element on http://localhost:57994/ and that element has no box: it is hidden, collapsed, or not yet rendered when the page settled.

## Steps

### 1. page:nowhere

- verdict: missing (0 matches)
- status: needs-verification
- url: http://localhost:57994/
- page shot: 01-page-nowhere.png
- verify: The capture dir says missing, and names the address and the URL.
- problem: No element carries data-surface="page:nowhere" on http://localhost:57994/. Either the attribute was never added, or the markup that carried it moved.

### 2. note:tier

- verdict: ambiguous (2 matches)
- status: needs-verification
- url: http://localhost:57994/ (no navigation; the page the step before it left)
- page shot: 02-note-tier.png
- verify: The capture dir says ambiguous and says how many matched.
- problem: 2 elements carry data-surface="note:tier" on http://localhost:57994/. An address that resolves to more than one element resolves to whichever copy the query reaches first, which is the drift this layer exists to avoid. Give the one under review its own address.

### 3. note:hidden

- verdict: not-visible
- status: needs-verification
- url: http://localhost:57994/ (no navigation; the page the step before it left)
- page shot: 03-note-hidden.png
- verify: The capture dir says not-visible rather than passing with an empty image.
- problem: data-surface="note:hidden" resolved to one element on http://localhost:57994/ and that element has no box: it is hidden, collapsed, or not yet rendered when the page settled.

Machine-readable: capture.json.
