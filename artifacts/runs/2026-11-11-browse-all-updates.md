---
title: All updates opens the full calendar feed
date: 2026-11-11
status: review
lane: direct
branch: main
scope:
  - view/components/organisms/portfolio-frame/portfolio-frame.html
  - content/tours/review-desk-browse.md
  - artifacts/runs/2026-11-11-browse-all-updates.md
diffstat: Two tracked files changed with three insertions and three deletions, plus this report.
unpushed: 1
verifiedBy: An independent agent checked the live destination, local routing, static export, and calendar query handling.
---

## What changed

The Browse sidebar’s All updates link now opens the calendar with the All tab selected. The existing Browse review tour includes that click. The changes stayed within the three paths above and are recorded on local main in “Open the full calendar feed from Browse.” Tjakoen will push the commit with his other changes.

## Gate output

```text
bun install v1.3.14 (0d9b296a)
Checked 139 installs across 156 packages (no changes) [108.00ms]
$ tsc --noEmit
 979 pass
 0 fail
 4286 expect() calls
Ran 979 tests across 53 files. [137.80s]
lint gate: level. 4375 flag(s) total (oxlint + voice-lint), matching or under the 4528 in tools/lint-baseline.json (generated 2026-11-09).
✓ review-desk-browse — 10 step(s), dev
  4 passed (1.1m)
PASS Browse → All updates → /calendar/?feed=all, with All selected
```

The four Playwright cases cover Browse shortcuts and recent updates, plus reading and writing the calendar feed in the URL. A separate Chromium check clicked All updates in the mobile sidebar and asserted the exact path and selected tab. The static export check was a source review of the link rewrite. The public destination returned HTTP 200.

The tokensave query for the Browse sidebar link pointed to the earlier Browse report and the calendar event type. A literal search found the link in the shared template, which was the source used for the change.

## What was not done

The full Playwright run was stopped after the focused checks passed. One interrupted case printed a calendar photo-lightbox assertion. Visual baseline comparisons and deployment were outside this run. The PANTRY browser pane returned an empty response, while PANTRY orientation succeeded through MCP.

```text
  3 interrupted
  473 did not run
  129 passed (5.1m)
```

## What needs human eyes

Follow All updates from the Browse step of the [review tour](http://localhost:4403/grain?crumb=review-desk-browse&crumb-mode=dev&crumb-frame) and check that the calendar opens with All selected.
