---
id: review-builder-live-evidence
mode: dev
title: "Review: the Builder's live prompt evidence"
route: /grain/builder
---
The latest live pass used a closed JSON schema for block selection. Across six varied briefs repeated twice, every raw response matched the schema and every visitor-facing draft passed review. The model still selected an extra card for two exclusion-heavy briefs; the Builder removed it before review, even after a prompt clarification and four more runs. This evidence supports the reviewed visitor flow for these prompts and this model profile. Raw structural reliability and broad language coverage remain open.

## builder-draft-review
- at: /grain/builder
- status: needs-verification
- review: Twelve schema-conforming raw responses across six varied briefs produced passing visitor-facing drafts. Exclusion-heavy briefs still need reconciliation to remove an extra raw card, so this does not establish raw structural reliability for all briefs.
- verify: At desktop and 390-pixel width, generate a two-block brief and expand the draft review. The requested phrases should remain in their named fields, exclusions should be absent, and no extra block should remain before approval.

## builder-canvas
- at: /grain/builder
- status: needs-verification
- review: The responsive browser check shows the prompt, workbench, and canvas fit without horizontal overflow. Physical-phone cold-start performance is outside the current acceptance target.
- verify: Open the Builder at 390 pixels, compose the two-block example, and scroll through the canvas. The document should remain within the viewport and the preview should show both requested blocks.
