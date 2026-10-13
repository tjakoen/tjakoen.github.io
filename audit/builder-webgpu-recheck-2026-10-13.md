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

## Different briefs and phrase placement, October 13

I added two different page briefs to the live audit: a bike repair shop in Malmö and a pottery studio
in Toronto. In the first run, the pottery draft kept its requested phrase in the card. The bike shop
draft shortened “ready for the next ride” to “ready for the next” in the card, so that run scored
1/2. A later run scored 2/2 because the same phrase appeared in the intro while the card still had
GRAIN's sample text. That result exposed a flaw in the audit: it checked whether the words appeared
anywhere, even when the brief assigned them to a specific card.

The Builder now restores an explicitly requested phrase to the block body named in the brief. If the
model writes different copy, the review shows the requested phrase in that field rather than joining
it to unsupported model wording. The live audit grades those requirements against `card.body`, and
unit tests cover both the false-positive layout and the correctly placed phrase. All 73 Builder
browser cases pass, including the reviewable-draft path and the missing-response fallback. The
portfolio typecheck and 722 unit tests also pass locally.
The Builder page now labels the cached result as one case and surfaces the newer unresolved phrase
placement check in its first-screen disclosure; the expanded audit detail records the repeat no-run.

The post-fix WebGPU recheck could not measure either draft. Both scenarios stopped during model
initialization when Chromium's Cache API failed to fetch model weight shards from the Hugging Face
CDN. The audit now records these as “not run,” separate from model answers that ran and failed the
grader, and still exits unsuccessfully because the required evidence is missing. The Builder tells
the visitor that it did not return a draft and that the displayed page came from the words in the
request. This network failure is not evidence about the fixed model output. The post-fix live phrase
placement therefore remains unverified.

A second post-fix retry on October 13 hit the same CDN failure for both briefs. It again recorded zero
model answers, zero grader failures, and two not-run scenarios. The [saved report](builder-phrase-placement-notrun-recheck-2026-10-13.json)
includes each prompt, the honest fallback, the observed canvas, and failed shard paths. It confirms
that the retry reached the model-loading step, but it still provides no evidence about live draft
quality or the phrase-placement fix.

## Warm-origin phrase-placement repeats, October 13

I reran both briefs on the stable `localhost:3131` origin, where the persistent Chromium profile had
the model cached. Each of three runs passed 2/2 after source reconciliation. The captured bike-shop fields put
“a family-run bike repair shop” in `lede.body` and “ready for the next ride” in `card.body`; the
pottery fields also passed the requested phrase check in the named card. The raw model answers still
shortened or misplaced some wording, and the source reconciliation produced the guarded fields that
were reviewed. This verifies the code-guarded composition for these two warm desktop briefs. It does
not measure a cold load, prove factual truth, establish polished model-authored copy, or predict
performance on another device. See the [first report](builder-phrase-scoped-description-live-1-2026-10-13.json),
[second](builder-phrase-scoped-description-live-2-2026-10-13.json), and
[third](builder-phrase-scoped-description-live-3-2026-10-13.json).

## Limits

These were warm desktop WebGPU runs against two briefs. They do not measure a first visit, a cold
download, physical phone memory or generation speed, or reliability across different briefs and
devices. The generated JSON records the inputs, raw model answers, observed canvas, draft-review
evidence, and timings:

- [Standalone draft repeat 1](builder-draft-reconciliation-repeat-1-2026-10-13.json)
- [Standalone draft repeat 2](builder-draft-reconciliation-repeat-2-2026-10-13.json)
- [Full Builder run 1](builder-full-recheck-1-2026-10-13.json)
- [Full Builder run 2](builder-full-recheck-2-2026-10-13.json)
