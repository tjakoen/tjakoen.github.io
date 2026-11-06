---
title: "The guarded Builder edits accept more ordinary wording"
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
  - plans/portfolio-finish-line.md
  - artifacts/runs/
touched:
  - src/ai/block-reasoner.ts
  - src/ai/block-reasoner.test.ts
  - e2e/builder-canvas.e2e.ts
  - plans/portfolio-finish-line.md
  - artifacts/runs/2026-10-14-builder-edit-phrasing.md
diffstat: 5 files changed, 133 insertions, 6 deletions
unpushed: 0
verifiedBy: the same session, 2026-10-14
doctor: not run on 2026-10-14; this line was added on 2026-11-07 when the evidence sections were backfilled
---

# The guarded Builder edits accept more ordinary wording

The Builder's edit recovery understood “drop,” “erase,” and “take out,” but missed ordinary
alternatives such as “eliminate” and “clear out.” Width and move requests had similar gaps. A declined
model answer could therefore leave a clear, supported request without the review proposal the page
knows how to make.

The recovery grammar now recognizes “eliminate,” “clear out,” and “take away” for removal; “expand”
and “narrow” for explicit supported widths; and “push” and “slide” for up or down moves. It still
requires one live target and one supported action. It does not recover negative requests, ambiguous
targets, unspecified widths, or requests that ask for an unsupported operation. Each recovered edit
remains a proposal and changes nothing until the visitor approves it.

The focused reasoner suite passed 48 tests. The complete Builder browser suite passed all 80 cases,
including the new phone-width flow that checks the proposal, unchanged canvas, and approved result.
TypeScript checking passed. The first browser attempt caught a test setup that asked for full width
when the block already had full width; the test now starts from half width and verifies a real change.

These checks exercise recovery with the model's refusal stub. They show that the guarded page handles
these exact phrasings. I also attempted a live “push the callout down one step” run in the local
preview, but it stayed at “Reading the page…” and returned no model result. I do not count that as a
live-model run. The browser checks do not show that the local model understands these phrases
reliably. Broader language coverage and a cold-start measurement on physical phone hardware remain
open.

## Gate output

NOT A PASTE. The original command output was not kept. These figures are restated on 2026-11-07
from the report's own text above, written by the session that ran them.

```text
bun test src/ai/block-reasoner.test.ts   48 pass
playwright builder-canvas               80 pass
bun run check (tsc)                      pass
```

## What was not done

No live-model run counts as evidence: the one attempt stayed at "Reading the page" and returned nothing. Broader phrasing coverage and a cold-start measurement on a physical phone were not done.

## What needs human eyes

Whether the local model itself understands these phrasings. The browser checks use the refusal stub, so only a live run on real hardware can show it.
