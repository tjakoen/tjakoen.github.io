---
id: review-portfolio-reliability
mode: dev
title: "Review: Builder entry and recovery"
route: /grain/builder
---
The editable example is a more prominent first step. It works without a model download. Opening
a saved page now records the canvas it replaces, so Undo returns to that page. Import validation
also rejects duplicate addresses instead of letting one control affect several blocks.

## builder-canvas
- at: /grain/builder
- status: needs-verification
- review: The empty canvas offers the existing four-block example as a button and explains the first edits. The longer guidance must remain readable on a narrow screen.
- verify: At desktop and 390px, open the four-block example. Move or resize a block with its controls, then press Undo. The prior layout should return without a model download or horizontal overflow.

## builder-export
- at: /grain/builder
- status: needs-verification
- review: Open replaces the canvas but now remembers what it replaced. The imported file still loses unsupported blocks by name rather than silently applying them.
- verify: Save a composition as JSON. Make a visible change, open the saved file, and press Undo. The composition immediately before Open should return, including its text and widths. Open a file with duplicate block addresses and inspect the named refusal before trying a delete.

## builder-draft-review
- at: /grain/builder
- status: needs-verification
- review: The explanation now distinguishes the model's structure proposal from the text that code derives from the brief. A successful review is not evidence that claims are true.
- verify: Build a brief with supplied names and wording, expand the review, and compare its fields with the brief. Edit one field after checking confirmation; adding the draft should require confirmation again.
