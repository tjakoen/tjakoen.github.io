---
title: The desk asks before it downloads the model
date: 2026-11-22
status: complete
lane: direct
branch: main
scope:
  - src/ai/desk-browse.ts
  - src/ai/desk-door.ts
  - src/ai/desk-reasoner.ts
  - scripts/site.js
  - e2e/
touched:
  - plans/desk-download-consent.md
  - src/ai/desk-browse.ts
  - src/ai/desk-door.ts
  - src/ai/desk-reasoner.ts
  - src/ai/desk-reasoner.test.ts
  - scripts/site.js
  - e2e/desk-download-consent.e2e.ts
  - e2e/builder-canvas.e2e.ts
  - e2e/desk-citation.e2e.ts
  - e2e/desk-deep-link.e2e.ts
  - e2e/desk-door.e2e.ts
  - e2e/desk-memory.e2e.ts
  - e2e/desk-model-chain.e2e.ts
  - e2e/desk-notes-filter.e2e.ts
  - artifacts/runs/2026-11-22-desk-download-consent.md
plans:
  - desk-download-consent
consulted:
  - CLAUDE.md
gates:
  - bun run check
  - bun test
  - bunx playwright test on the desk and builder files
diffstat: about 90 lines of new behavior across four source files, 5 unit tests, a 4-test e2e file, and one added line in each of seven existing e2e files.
unpushed: 1
verifiedBy: Open the portfolio at desktop width with no saved model, send a question the desk answers with the model, and read the Desk bubble. It states the size and offers Download 350 MB and Not now. Click Not now and check the network panel shows no request to huggingface.co and no webllm cache is created.
doctor: not run. The PANTRY doctor was not part of this task.
---

# The desk asks before it downloads the model

The desk used to start the model download when a visitor sent a first message that needed the model.
A 350 MB download is too large to start for someone who was not told, so the desk now says what it
needs and waits for an answer. A yes starts the load with the progress bar from the earlier run. A
not now downloads nothing, says so, and leaves the desk online with Browse still available. A visitor
who already has a saved copy is never asked, because nothing downloads.

The question sits in the Desk's own bubble, with the size taken from the model profile, so the
Builder's larger model reads 875 MB where the shared desk reads 350 MB. A yes is remembered for the
tab. The buttons are stripped from the saved chat history, so a reload never shows buttons that no
longer do anything.

Seven existing e2e files script the model and skip the question by answering it in their init
script. That is a test setup choice and not a behavior change, and the new e2e file covers the
question itself.

## Gate output

```
$ tsc --noEmit

bun test src/ai:             727 pass, 0 fail across 33 files
bun test (whole repo):       1034 pass, 13 fail across 61 files
  the 13 failures are the same Windows host failures as before this change

playwright, CI-style server on port 3131:
  desk and builder files (13 files):   135 passed
  desk-download-consent (new, 4):      4 passed

playwright, real-desk server on port 3100, after the button label change:
  consent, model-chain, door, arrival: 22 passed, 1 failed
  the one failure is desk-arrival "the desk-warm flag is set on the first chat.send"
  it fails identically with this change stashed
```

## What was not done

The yes path was not run against the real model in a browser this time, because it would download
350 MB again. The earlier run already watched a real download finish, and the yes path is covered
here by the scripted e2e test that counts loader calls. The no path was run in a real browser and
showed zero requests to the model host.

The arrival test above passes on the CI-style server and fails on a server started with the real desk
enabled, with or without this change, so I did not touch it. The lint gate crashed inside oxlint on
this Windows host and the voice lint reports thousands of flags that predate this change, so neither
gave a signal. The visual-regression suite was skipped, since its baselines are macOS-specific.

## What needs human eyes

Read the question in the Desk bubble as a first-time visitor would. The wording is "To answer on your
device I need to download about 350 MB, one time. The model runs here, so your questions stay on this
device." The buttons read Download 350 MB and Not now. Nothing is committed to the portfolio, so this
work is in the tree and not on any branch.
