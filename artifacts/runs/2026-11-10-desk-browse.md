---
title: The Desk can browse the portfolio without a model
date: 2026-11-10
status: review
lane: gated
branch: codex/portfolio-desk-browse
scope: [scripts, src/ai, src/server.ts, src/content.ts, tools/export.ts, view/components/molecules/welcome-recent, view/components/organisms/portfolio-frame, view/pages/index.html, view/pages/grain, view/components/pages/grain, e2e/desk-door.e2e.ts, e2e/desk-consent.e2e.ts, e2e/visual.e2e.ts, content/tours, artifacts/runs]
diffstat: "19 files changed, 414 insertions(+), 187 deletions(-) in tracked files, plus 3 new files"
touched:
  - artifacts/runs/2026-11-10-desk-browse.md
  - content/tours/review-desk-browse.md
  - e2e/desk-consent.e2e.ts
  - e2e/desk-door.e2e.ts
  - e2e/visual.e2e.ts
  - scripts/desk-consent.js
  - scripts/site.js
  - src/ai/builder-canvas.ts
  - src/ai/desk-browse.ts
  - src/ai/desk-door.ts
  - src/ai/desk-reasoner.ts
  - src/content.ts
  - src/server.ts
  - tools/export.ts
  - view/components/molecules/welcome-recent/welcome-recent.css
  - view/components/molecules/welcome-recent/welcome-recent.html
  - view/components/organisms/portfolio-frame/portfolio-frame.css
  - view/components/organisms/portfolio-frame/portfolio-frame.html
  - view/components/pages/grain/grain.css
  - view/pages/grain/builder.html
  - view/pages/grain/index.html
  - view/pages/index.html
unpushed: 0
verifiedBy: Independent Browse, spacing and tabs consent review passes, with browser checks for the reported findings
doctor: Worktree registration, unsynced skills, missing graph and older ledger gaps were carried forward.
---

## What changed

Phones open the Desk in Browse. It shows five shortcuts and the four newest notes or calendar
posts. A desktop visitor can select Browse and keep that choice for the tab, or use the local
model after seeing its download size.

The client gate covers chat, warm arrivals, the live walkthrough, and Builder model completion.
The Builder still composes a draft from the words in a brief in Browse. The home page changes the
Desk link label and hides the walkthrough that needs the model when Browse is active.

An independent review traced the model entry points. It found that search links needed the export's
base path and that the live walkthrough card still invited an action that Browse could not start.
Both findings were addressed.

## Gate output

```text
$ tsc --noEmit

 950 pass
 0 fail
 3996 expect() calls
Ran 950 tests across 50 files. [107.49s]

lint gate: level. 4527 flag(s) total (oxlint + voice-lint), matching or under the 4528 in tools/lint-baseline.json (generated 2026-11-09).

✓ review-desk-browse — 10 step(s), dev
```

All nine Desk browser cases passed when run with one worker. The parallel 98-case Desk and Builder
run recorded nine failures, including four Desk readiness waits that passed with one worker.
The macOS visual run ended with six passes and four failures on Welcome, GRAIN, Catalog and Notes.

The unit suite covers the existing retrieval and model contracts. The phone browser check used
Chromium with iPhone 13 emulation. It opened the expected result for Ten Times Zero and followed the
Notes shortcut. The index was 911,962 bytes uncompressed. The screenshot shows the mobile
disclosure, shortcuts and results. This run did not measure a physical phone or generate live
desktop model replies.

The all-browser run stopped before completion after it exposed that the first implementation
classified narrow desktop windows as phones. The next pass used phone signals and retained the
desktop model at narrow widths. The browser runs still recorded timeout and snapshot failures, so
this is not a clean release gate.

The two static export attempts timed out waiting for the production server to answer on ports 3330
and 3188. A directly started production server answered on port 3189. The export was verified in the full-height follow-up below.

## Spacing follow-up

At a 908-pixel desktop viewport with both side panels open, Chromium measured zero horizontal
padding on the GRAIN hero and a second row for New chat. Both styles predated the Browse change.
The GRAIN section used an undefined spacing token in a shorthand. The showcase now sets its
horizontal gutter separately. The Desk uses a compact plus button with the accessible name New
chat. In the same viewport, Chromium measured 20.6 pixels on both sides of the hero and the same
vertical center for the tabs and the button. At 390 pixels with iPhone emulation, the hero had
20 pixels on both sides and the Browse tabs fit without overflow. Catalog, Chat and New chat were
exercised in the desktop preview. All three mobile layout tests passed. The independent spacing
review found no blocking issues and caught a three-pixel offset between the Desk and editor
headers. The final adjustment aligns the two rows.

## Tabs and consent follow-up

Browse now has its own tab and uses the entire panel. The download note and New chat control
sit by the Chat composer. The browser check confirmed that the tabs fit on one row at 908 and
390 pixels. The consent prompt appears after a chat exchange. Chat and terminal history stay
in the tab unless the visitor chooses to remember them on the device. The independent review
caught a cross-tab race, and a browser test now confirms that accepting in a second tab does
not promote the first tab's declined conversation to device storage.

```text
15 passed (7.7s)
```

## Recent updates follow-up

Browse now reuses the home page's recent feed. The four links render with the page and work
from notes, calendar posts and the rest of the shell. Visitors can use All updates to open the
calendar. A compact title bar icon opens the existing site search on phones. Chromium showed four
updates before and after opening the first link from Notes, at both desktop and phone width,
without requesting the model's knowledge index. An independent pass confirmed the shared feed
on eight routes and caught the missing mobile search trigger. The focused browser suite passed.

```text
23 passed (7.3s)
```

## Full height and live updates follow-up

On phones, an open Browse sheet uses the visible viewport with a small inset for the sheet handle.
Cards show the source kind, such as Note, Talk, or Hackathon. The list is rendered with the page
and requests the current feed when opened and once a minute while visible. The feed is generated
from published content during export. In development, editing a note or calendar post invalidates
the server's feed inputs. Refresh keeps the existing entries if the request fails.

A browser test changes the served feed while Browse is open and checks that a new Talk appears
with its label. The independent pass found the missing invalidation and a static export path
that the verifier read as a module. Both were corrected. The static export included the recent
feed and passed verification with the public origin.

```text
13 passed (6.1s)
13 pass
0 fail
[verify-export] OK
```

## What was not done

No provider was wired in and no change was deployed. Browse shows published updates and shortcuts. A hosted model would be a separate product decision.

The startup doctor flagged four older run reports with missing evidence, including the analytics
fallback and budget scope reports. That cleanup remains outside this change. The files named in
this report are the deliberate working diff on the review branch.

## What needs human eyes

Check whether the five shortcuts cover the main reasons someone comes to the portfolio. On a
physical phone, open the Desk from the home page, follow the first recent update, and try the Notes shortcut.

[Open the local review tour](http://localhost:3205/grain?crumb=review-desk-browse&crumb-mode=dev&crumb-frame)
