---
id: review-builder-live-evidence
mode: dev
title: "Review: the Builder's live prompt evidence"
route: /grain/builder
---
The latest live pass used a closed JSON schema for block selection. Across six varied briefs repeated twice, every raw response matched the schema and every visitor-facing draft passed review. Two exclusion-heavy briefs first produced an extra card because the instructions included a lede-plus-card example. After removing that conflicting example, four live repeats returned only the requested intro, without reconciliation. A further 10-run matrix tested exclusions, one-card, callout-only, and two-card briefs. Every reviewed draft passed; reconciliation removed extra raw structures in six runs, and copy landed in the requested callout and separate card fields. The [prompt-example recheck](../audit/builder-composition-example-recheck-2026-10-14.json) and [expanded visitor-flow matrix](../audit/builder-composition-visitor-flow-matrix-2026-10-14.json) retain the raw responses and reviewed drafts. The small model still adds default blocks in some raw plans, so this evidence supports the guarded visitor experience for these cases rather than independent raw-model reliability. Broader language coverage remains open.

## builder-draft-review
- at: /grain/builder
- status: needs-verification
- review: Twelve schema-conforming responses across six varied briefs and ten expanded live runs produced passing visitor-facing drafts. Reconciliation removed extra raw blocks from several single-block briefs; both bodies in the two-card brief and the requested callout phrase appeared in the right fields. The small model still over-selects defaults in some raw plans. Broader prompt coverage remains open.
- verify: At desktop and 390-pixel width, generate a two-block brief and expand the draft review. The requested phrases should remain in their named fields, exclusions should be absent, and no extra block should remain before approval.

## builder-canvas
- at: /grain/builder
- status: needs-verification
- review: The responsive browser check shows the prompt, workbench, and canvas fit without horizontal overflow. Physical-phone cold-start performance is outside the current acceptance target.
- verify: Open the Builder at 390 pixels, compose the two-block example, and scroll through the canvas. The document should remain within the viewport and the preview should show both requested blocks.
