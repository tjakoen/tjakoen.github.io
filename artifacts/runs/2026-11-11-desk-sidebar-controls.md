---
title: Close and reopen the Desk from the tab bars
date: 2026-11-11
status: review
lane: gated
branch: main
scope: [scripts/site.js, view/components/organisms/portfolio-frame, e2e/editor-shell.e2e.ts, e2e/mobile.e2e.ts, content/tours/review-desk-browse.md, artifacts/runs]
diffstat: "6 tracked files changed, 122 insertions(+), 15 deletions(-), plus this report"
touched:
  - artifacts/runs/2026-11-11-desk-sidebar-controls.md
  - content/tours/review-desk-browse.md
  - e2e/editor-shell.e2e.ts
  - e2e/mobile.e2e.ts
  - scripts/site.js
  - view/components/organisms/portfolio-frame/portfolio-frame.css
  - view/components/organisms/portfolio-frame/portfolio-frame.html
unpushed: 2
unpushedReason: "400ad673 was already ahead of origin/main at session start. The Desk controls commit stays local at the owner’s request."
verifiedBy: Independent browser review at 908 pixels, in the desktop mobile preview, and on an emulated iPhone.
doctor: "Carried forward merged graph freshness, 11 older ledger entries missing evidence, and existing dirty work."
---

The Desk has an X after its mode tabs. The sidebar icon moved from the window bar to the editor tab bar, beside Close all tabs. Closing the Desk moves keyboard focus to that icon and keeps the current mode selected. Closing the mobile sheet leaves the saved desktop preference alone.

The independent review found that all four tabs could push the X onto a second row, and that the closed desktop panel could still receive focus. It also caught a mismatch between the desktop mobile preview and the phone layout. The reviewer retested all three fixes.

## Gates

```text
$ tsc --noEmit

 979 pass
 0 fail
 4264 expect() calls
Ran 979 tests across 53 files. [32.30s]

lint gate: level. 4375 flag(s) total (oxlint + voice-lint), matching or under the 4528 in tools/lint-baseline.json (generated 2026-11-09).

23 checks, 0 failing, 3 due
OK
```

The full Chromium run passed both sidebar tests and finished with these totals.

```text
  29 failed
  576 passed (36.6m)
```

Six failures in the calendar and Desk navigation tests also reproduced with the old shell. Five canonical route checks stopped at navigation or evaluation timeouts or a suspended network request. The 18 axe failures flagged the window bar search button's accessible name.

The macOS visual run had five passes and five failures. Welcome, GRAIN, Résumé, and Notes exceeded the same image tolerance in a copy with the three shell files restored to their pre-change state. The Catalog capture timed out after reporting that the image was taller than its baseline. The snapshot files were left as they were.

## Review

Walk the Desk tabs step with a keyboard at about 900 pixels, then repeat it in the phone layout. The seven paths in this report are committed to local main.

## Responsive follow-up

The desktop controls now disappear in the mobile layout, where the handle and mode tabs open the Desk drawer. The shell and its controls measure the same width, so the drawer can open as soon as it appears. The title bar label follows the current layout. Resizing the browser releases any manual preview, and the area around a manual preview uses the current theme.

The focused Chromium run passed the resize, desktop Desk, and phone drawer cases. TypeScript, the lint gate, and the independent browser review passed. The earlier broad suite results above predate this follow-up.

[Open the local review tour](http://localhost:3139/grain?crumb=review-desk-browse&crumb-mode=dev&crumb-frame)
