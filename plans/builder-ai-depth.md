---
id: builder-ai-depth
status: doing
track: demo
depends: [form-from-data-demo, site-builder, builder-design]
touches:
  - src/ai/block-composer.ts
  - src/ai/block-reasoner.ts
  - src/ai/builder-canvas.ts
  - src/ai/builder-page.ts
  - src/ai/block-command.ts
  - src/ai/block-command.test.ts
  - src/ai/block-reasoner.test.ts
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

## Current evidence (2026-10-02)

The first five-scenario audit could not be scored: its setup added a second card through the model-
driven build path, so the starting canvas varied and some cases timed out before their edit ran. The
audit now opens a fixed four-block composition through the builder's own import control. That keeps
the setup outside the score while exercising the same path a visitor uses to reopen a page.

On that stable fixture, the original edit prompt scored 0/5. It chose an unrelated block-removal
operation for a request to change copy. The prompt was then narrowed to the live block actions and
targets, stripped of the unrelated status text, and given the visible block types and order beside
their IDs. The revised prompt scored 1/5, correctly removing b4 when asked to drop b4. The current
pass scores 2/5: that same exact-ID edit works, and a copy-edit request is now refused before it can
reach the model. The model still removes the first card when asked for the second, and it misses the
callout-width and move requests. The 2/5 result is evidence of a safer refusal and one reliable
operation, not evidence that natural-language editing is ready.

I reran the five scenarios on 2026-10-02. The explicit-ID removal and the copy-edit refusal passed.
The model removed the first card instead of the second, removed the intro instead of widening the
callout, and declined to move the callout after returning the shortened action name `move`. The
report is a snapshot from this model and prompt, not a general success rate. On a machine with
WebGPU and the cached model, the run can be repeated with
`PORT=3132 bun tools/desk-audit.ts builder-current-2026-10-02 --only=builder-drop,builder-bare-id,builder-span,builder-move,builder-no-verb`.
A prompt candidate that spelled out the action-to-request mapping also scored 2/5 in a separate run,
with a different set of misses. I reverted it because the measured result did not improve.

The portfolio-side boundary is also clear. GRAIN registers block removal, span, and move operations.
Its field operation fills registered form controls; it does not write text into page-content blocks.
The builder's templates expose text as escaped `data-field` values, but writing those values from
the builder would bypass GRAIN's one-door contract. A later GRAIN design review must define an
addressed, bounded text operation before the builder can revise existing copy. This plan does not
change GRAIN or write around that boundary.

The builder now refuses clear copy-edit requests before calling the model. This closes the specific
failure where a request to change a card's wording removed the intro instead. The page explains that
copy editing is not available yet, and the refusal leaves the composition unchanged. A separate
browser check verifies that the model was not called for that request.

## Work

- [ ] Re-run the live-model scenarios on the current code and record a baseline for composition,
      block edits, refusals, and unsupported browser hardware. The builder edit baseline and refusal
      path are recorded above; composition and an unavailable-WebGPU live run remain to be measured.
- [x] Trace how generated copy could travel through the existing composition and GRAIN contracts.
      Keep component names, addresses, and allowed fields code-owned. The current GRAIN boundary and
      the later design-review requirement are recorded above; no DOM bypass was added.
- [x] Trace each edit from the visitor's words through the model answer, validation, GRAIN's door,
      the dispatcher, and the final canvas. The scripted browser path still exercises the full chain.
- [ ] Improve the model's edit choices using the live manifest and the block IDs already visible on
      the page. The prompt now contains only live block actions and identifies each block's type and
      order, but the current 2/5 result leaves three supported scenarios unreliable. Do not add a
      deterministic fallback that makes the interface claim the AI acted.
- [ ] Make the narration a projection of validated operations and observed canvas changes. A failed
      operation must leave the canvas alone and tell the visitor what stopped it.
- [ ] Give the builder a small set of examples that demonstrates composing and then revising a real
      GRAIN page, including one honest refusal.
- [x] Cover the supported path with browser tests on the exported static site, and keep the real
      model audit as a separate measured check because headless CI does not provide WebGPU. The
      builder browser suite passes all 58 scenarios, including the static-host, one-door, and copy-
      edit refusal paths. The real-model audit remains a separate score because headless CI has no
      WebGPU.
- [ ] Review the published workbench at desktop and narrow widths, then show the rendered result
      before calling the plan done.

## Done means

The current browser model can build a useful first draft from a visitor's brief and complete the
agreed edit scenarios against the live page. Every unsupported case refuses without changing the
canvas or claiming success. The static export still composes and previews without a server. A
visitor can inspect the outcome, revise it, and export it without leaving the portfolio. The
live-model results and their limits are recorded beside the tests, so the page's claims stay tied to
evidence.
