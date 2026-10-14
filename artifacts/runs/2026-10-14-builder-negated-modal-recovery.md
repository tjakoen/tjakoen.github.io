---
title: "Negated and advice-seeking Builder edits remain requests to do nothing"
date: 2026-10-14
status: complete
lane: gated
branch: main
skills:
  - voice
  - sites
scope:
  - src/ai/block-reasoner.ts
  - src/ai/block-reasoner.test.ts
  - e2e/builder-canvas.e2e.ts
  - plans/builder-ai-depth.md
  - plans/portfolio-finish-line.md
touched:
  - src/ai/block-reasoner.ts
  - src/ai/block-reasoner.test.ts
  - e2e/builder-canvas.e2e.ts
  - plans/builder-ai-depth.md
  - plans/portfolio-finish-line.md
  - artifacts/runs/2026-10-14-builder-negated-modal-recovery.md
verifiedBy: the same session, 2026-10-14
---

# Negated and advice-seeking Builder edits remain requests to do nothing

The Builder's request recovery rejected "don't remove the callout" but treated "I can't remove the
callout" and "I shouldn't remove the callout" as instructions to delete it. A second probe found that
"Should I remove the callout?" also became a deletion proposal. Follow-up probes found that "Would
it be better to remove the callout?" and "Is it better to move the callout up?" could also become
proposals. The grammar removes punctuation before checking intent, so modal contractions reached
recovery as split tokens and advice questions looked like direct commands.

The guard now refuses recovery for the common negative modal contractions, including can't,
couldn't, shouldn't, wouldn't, won't, mustn't, mightn't, and needn't. It also leaves advice questions
such as "Should I remove the callout?" and "Would it be better to remove the callout?" with the
model's reply path, while retaining polite commands such as "Could you remove the callout?" The unit
tests check that recovery and model-proposal correction refuse both categories. The phone-width
browser test submits three negated requests and four advice questions against a scripted model
refusal, then verifies that no proposal appears and all four blocks remain on the canvas.

The focused reasoner suite passed 50 tests, the full unit suite passed 829 tests across 45 files, and
the full Builder browser suite passed all 80 cases. TypeScript checking, link lint, and the focused
source lint completed successfully. The browser suite includes the phone-width regression at 390 by
844. These scripted checks cover the named contractions and existing guarded flow; they do not
establish how a live model interprets them, broad natural-language reliability, or cold-start behavior
on physical phone hardware.
