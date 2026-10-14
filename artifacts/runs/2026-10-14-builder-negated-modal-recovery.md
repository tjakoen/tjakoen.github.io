---
title: "Negated Builder edits remain requests to do nothing"
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

# Negated Builder edits remain requests to do nothing

The Builder's request recovery rejected "don't remove the callout" but treated "I can't remove the
callout" and "I shouldn't remove the callout" as instructions to delete it. The grammar removes
apostrophes before checking negation, so those contractions reached recovery as split tokens that
the guard did not recognize.

The guard now refuses recovery for the common negative modal contractions, including can't,
couldn't, shouldn't, wouldn't, won't, mustn't, mightn't, and needn't. The unit test checks that
recovery and model-proposal correction both refuse these phrases. The phone-width browser test
submits can't, shouldn't, and won't variants against a scripted model refusal, and verifies that no proposal
appears and all four blocks remain on the canvas.

The focused reasoner suite passed 49 tests, the full unit suite passed 828 tests across 45 files, and
the full Builder browser suite passed all 80 cases. TypeScript checking, link lint, and the focused
source lint completed successfully. The browser suite includes the phone-width regression at 390 by
844. These scripted checks cover the named contractions and existing guarded flow; they do not
establish how a live model interprets them, broad natural-language reliability, or cold-start behavior
on physical phone hardware.
