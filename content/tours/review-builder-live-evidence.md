---
id: review-builder-live-evidence
mode: dev
title: "Review: the Builder's live prompt evidence"
route: /grain/builder
---
Five fresh WebGPU runs checked the Builder's reviewable output across a pottery studio, a bakery, and a bike shop. The source phrases stayed in their requested fields, explicit exclusions stayed out, and extra blocks were removed. The raw model still added unsupported promotional wording in one case, so the distinction between the model's answer and the visitor's reviewed draft is the risky part of this pass.

## builder-draft-review
- at: /grain/builder
- status: needs-verification
- review: The five new live runs passed on the reviewed draft. One raw answer added unsupported promotional claims before the Builder filtered them; this evidence covers these prompts and this profile, not all briefs.
- verify: At desktop and 390-pixel width, generate a two-block brief and expand the draft review. The requested phrases should remain in their named fields, exclusions should be absent, and no extra block should remain before approval.

## builder-canvas
- at: /grain/builder
- status: needs-verification
- review: The phone-width canvas is the visitor-visible result after the review step. The narrow browser check shows the prompt, workbench, and canvas fit without horizontal overflow.
- verify: Open the Builder at 390 pixels, compose the two-block example, and scroll through the canvas. The document should remain within the viewport and the preview should show both requested blocks.
