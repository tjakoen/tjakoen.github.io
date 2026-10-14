---
id: review-builder-live-evidence
mode: dev
title: "Review: the Builder's live prompt evidence"
route: /grain/builder
---
The latest live pass used a closed JSON schema for block selection. Across six varied briefs repeated twice, every raw response matched the schema and every visitor-facing draft passed review. Two exclusion-heavy briefs first produced an extra card because the instructions included a lede-plus-card example. After removing that conflicting example, four live repeats returned only the requested intro, without reconciliation. The [tracked recheck](../audit/builder-composition-example-recheck-2026-10-14.json) records the raw model outputs. This evidence covers these prompts and this profile; broader language coverage remains open.

## builder-draft-review
- at: /grain/builder
- status: needs-verification
- review: Twelve schema-conforming raw responses across six varied briefs produced passing visitor-facing drafts. Four follow-up runs for the previously failing exclusion-heavy briefs returned only the requested intro after removing the conflicting card example. Broader prompt coverage remains open.
- verify: At desktop and 390-pixel width, generate a two-block brief and expand the draft review. The requested phrases should remain in their named fields, exclusions should be absent, and no extra block should remain before approval.

## builder-canvas
- at: /grain/builder
- status: needs-verification
- review: The responsive browser check shows the prompt, workbench, and canvas fit without horizontal overflow. Physical-phone cold-start performance is outside the current acceptance target.
- verify: Open the Builder at 390 pixels, compose the two-block example, and scroll through the canvas. The document should remain within the viewport and the preview should show both requested blocks.
