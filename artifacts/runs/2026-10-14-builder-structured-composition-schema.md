---
title: "A structured response contract for Builder composition"
date: 2026-10-14
status: committed
lane: gated
branch: main
scope:
  - src/ai/block-composer.ts
  - src/ai/block-composer.test.ts
  - src/ai/builder-canvas.ts
  - e2e/builder-canvas.e2e.ts
  - plans/builder-ai-depth.md
  - plans/portfolio-finish-line.md
- content/tours/review-builder-live-evidence.md
---

# A structured response contract for Builder composition

## Finding

The Builder's build path instructed the local model to return registered block names without copy, but it did not pass a response schema to the local completion API. The edit path already used a schema. Live WebGPU runs showed the build model returning free-form `text` fields with unsupported promotional claims, even though code removed those values before the visitor could review the draft.

## Change

The build path now submits a JSON schema with the completion request. The schema requires a `blocks` array, limits block names to the registered vocabulary, rejects extra top-level and block properties, and permits only the three supported span values. The prompt also says that a block name in an exclusion or explanation is not a request to add that block. The existing source-grounding and reconciliation layers still assemble visitor-facing copy and remove unrequested blocks.

## Evidence

The cached Qwen2.5-1.5B-Instruct-q4f16_1-MLC profile completed the six composition scenarios twice. All 12 reviewed drafts passed the Builder's visitor-facing grader. An independent check parsed every raw response and found no properties outside the schema; no response contained generated prose. The raw model proposed an extra card in both runs of the intro-only negative-anchor and mixed-prohibition cases. The reconciler removed that card before review. Inspection found the prompt's own example included a lede and card, contradicting an intro-only request. After removing that example, a four-run follow-up across both prompts returned only a lede in every raw response; the reconciler removed nothing. This closes the observed extra-card failure for these cases. Broader language coverage and composition reliability across other phrasings remain open. See the [prompt-example recheck](../../audit/builder-composition-example-recheck-2026-10-14.json).

The focused composition suite passed 57 tests after the prompt change. The full unit suite passed 832 tests across 45 files, and all 81 Builder browser cases passed. TypeScript checking passed, link lint found no dead relative links in 56 rendered files, `git diff --check` passed, and the CRUMB checker accepted all 22 tours. The browser test inspects the captured WebLLM request schema, including the closed block enum and refusal of extra properties. The live captures are [the six-case repeated matrix](../../audit/builder-structured-composition-schema-live-2026-10-14.json), [the initial exclusion follow-up](../../audit/builder-structured-composition-exclusion-recheck-2026-10-14.json), and [the prompt-example recheck](../../audit/builder-composition-example-recheck-2026-10-14.json). Commit f5d4092 passed hosted CI and Pages deployment. Hosted CI and Pages deployment for this prompt correction are pending.
