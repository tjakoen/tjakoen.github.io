---
id: builder-ai-depth
status: todo
track: demo
depends: [form-from-data-demo, site-builder, builder-design]
touches:
  - src/ai/block-composer.ts
  - src/ai/block-reasoner.ts
  - src/ai/builder-canvas.ts
  - src/ai/builder-page.ts
  - src/ai/desk-reasoner.ts
  - view/pages/grain/builder.html
  - e2e/builder-canvas.e2e.ts
  - tools/desk-audit.ts
owner: human
---

# Make the builder's AI earn its place

## The gap this closes

The page builder already composes a one-page GRAIN layout from a closed set, works on the static
site, lets a person rearrange and resize blocks, and exports JSON, HTML, or tag source. The model
chooses the component names and order, while the code supplies each block's sample copy. The visitor
can build a structure with AI, but cannot yet ask it to write or revise the page's content.

The recorded live-model audit on 2026-08-14 asked the 0.5B model to edit existing blocks eighteen
times. None of the answers produced a valid edit. The safety boundary held in every case, so the
canvas stayed unchanged, but the model often claimed it had acted. The builder has two separate
gaps to close: useful page copy grounded in the visitor's brief, and reliable revisions to the page
after it has been composed.

## What the visitor should be able to do

- Start from an ordinary description and get a composed page from real GRAIN components.
- Ask for a change to the page already on screen, such as removing a named block, moving it, or
  changing its span.
- See what the system understood, what it changed, and what it could not do. The account must come
  from the validated operation and the resulting canvas, never from a model's unverified claim.
- Continue in the workbench, open the preview, and take the page away in a format a developer can
  use.

The existing one-door contract stays in place. The model may choose among supported operations and
closed vocabulary; it may not invent components, addresses, or arbitrary markup. The public page
must say when the browser cannot run the model.

## Work

- [ ] Re-run the live-model scenarios on the current code and record a baseline for composition,
      block edits, refusals, and unsupported browser hardware.
- [ ] Trace how generated copy could travel through the existing composition and GRAIN contracts.
      Keep component names, addresses, and allowed fields code-owned. If a safe text-edit operation
      requires a GRAIN change, write that boundary down for its later design review instead of
      changing the DOM around the one-door contract.
- [ ] Trace each edit from the visitor's words through the model answer, validation, GRAIN's door,
      the dispatcher, and the final canvas. Keep a refusal's reason attached to that full path.
- [ ] Improve the model's edit choices using the live manifest and the block IDs already visible on
      the page. Do not add a deterministic fallback that makes the interface claim the AI acted.
- [ ] Make the narration a projection of validated operations and observed canvas changes. A failed
      operation must leave the canvas alone and tell the visitor what stopped it.
- [ ] Give the builder a small set of examples that demonstrates composing and then revising a real
      GRAIN page, including one honest refusal.
- [ ] Cover the supported path with browser tests on the exported static site, and keep the real
      model audit as a separate measured check because headless CI does not provide WebGPU.
- [ ] Review the published workbench at desktop and narrow widths, then show the rendered result
      before calling the plan done.

## Done means

The current browser model can build a useful first draft from a visitor's brief and complete the
agreed edit scenarios against the live page. Every unsupported case refuses without changing the
canvas or claiming success. The static export still composes and previews without a server. A
visitor can inspect the outcome, revise it, and export it without leaving the portfolio. The
live-model results and their limits are recorded beside the tests, so the page's claims stay tied to
evidence.
