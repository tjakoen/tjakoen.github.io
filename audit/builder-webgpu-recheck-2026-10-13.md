# Builder WebGPU recheck, October 13, 2026

I ran the Builder's eight local-model scenarios twice in Playwright Chromium with a WebGPU adapter
available and the model already cached. Each run passed all eight scenarios: two deletions, two width
changes, two moves, a refusal to edit existing copy, and a page draft. I also ran the page-draft case
twice on its own. All four drafts retained the requested bakery name, city, subject, product title,
and baking phrase in the composition shown for review.

## What passed, and what did the work

The audit grades the reviewed page and its canvas, not whether the model's raw answer was correct.
In the first full run, the model proposed a width change to b2 for “drop the second card.” In the
second, it proposed removing b2. The Builder identified the mismatch, disclosed the requested b4
target, and changed the page only after approval. Both requests therefore passed the reviewed
workflow, while the model itself still selected the wrong operation or target.

The raw page drafts also proposed unsupported wording and, in one run, an extra callout. The
portfolio's source-reconciliation step removed the extra block and kept copy drawn from the brief's
own phrases. The resulting reviewable copy retained Hearth Bakery, Utrecht, neighborhood bakery,
Sourdough, and baked fresh each morning. This made the output safer and preserved the requested
details, but it reads as source phrases rather than polished copy. A person still has to review it,
and the comparison cannot establish that a claim is true.

The copy-edit request was refused without changing the existing page. Editing existing block copy
remains unavailable until GRAIN defines a bounded text-write operation.

## Limits

These were warm desktop WebGPU runs against one brief. They do not measure a first visit, a cold
download, physical phone memory or generation speed, or reliability across different briefs and
devices. The generated JSON records the inputs, raw model answers, observed canvas, draft-review
evidence, and timings:

- [Standalone draft repeat 1](builder-draft-reconciliation-repeat-1-2026-10-13.json)
- [Standalone draft repeat 2](builder-draft-reconciliation-repeat-2-2026-10-13.json)
- [Full Builder run 1](builder-full-recheck-1-2026-10-13.json)
- [Full Builder run 2](builder-full-recheck-2-2026-10-13.json)
