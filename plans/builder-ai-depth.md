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
chooses the component names and order and can now draft bounded copy for supported fields on newly
added blocks. Existing block copy cannot yet be revised. Scripted browser coverage proves that the
copy moves through the composition and renders as text; live-model quality has not yet been measured.

The recorded live-model audit on 2026-08-14 asked the 0.5B model to edit existing blocks eighteen
times. None of the answers produced a valid edit. The safety boundary held in every case, so the
canvas stayed unchanged, but the model often claimed it had acted. The builder has two separate
gaps to close: useful page copy grounded in the visitor's brief, and reliable revisions to the page
after it has been composed.

## What the visitor should be able to do

- Start from an ordinary description and get a composed page from real GRAIN components.
- Ask for a change to the page already on screen, such as removing a named block, moving it, or
  changing its span.
- Review the model's proposed block and operation before the page changes; approval sends the
  validated edit through GRAIN's door.
- See what the system understood, what it changed, and what it could not do. The account must come
  from the validated operation and the resulting canvas, never from a model's unverified claim.
- Continue in the workbench, open the preview, and take the page away in a format a developer can
  use.

The existing one-door contract stays in place. The model may choose among supported operations and
closed vocabulary; it may not invent components, addresses, or arbitrary markup. The public page
must say when the browser cannot run the model.

## Current evidence (2026-10-03)

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
callout, and declined to move the callout after returning the shortened action name move. The
report is a snapshot from this model and prompt, not a general success rate. On a machine with
WebGPU and the cached model, the run can be repeated with
PORT=3132 bun tools/desk-audit.ts builder-current-2026-10-02 --only=builder-drop,builder-bare-id,builder-span,builder-move,builder-no-verb.
A prompt candidate that spelled out the action-to-request mapping also scored 2/5 in a separate run,
with a different set of misses. I reverted it because the measured result did not improve.

Two more checks narrowed the failure. Setting the edit temperature to zero kept the score at 2/5:
the exact-ID removal and the copy-edit refusal still passed, while the natural-language drop, width,
and move cases remained wrong. I added exact-ID width and move scenarios to the live audit. Both
failed: the model chose block.move for each request, and the move request returned the shortened
action move. A temporary 1.5B trial was inconclusive: the first request timed out and the next
returned invalid JSON before the audit browser closed. It did not establish a usable improvement, so
the shipped 0.5B profile remains in place.

The live audit now approves a proposal through the same button as the visitor, then grades the
canvas after dispatch. On the seven edit and refusal cases, the 2026-10-02 run scored 1/7. The only
pass was the copy-edit refusal. The model dropped b2 for a request to drop the second card, timed out
on the exact-ID b4 request, and chose removal for both width requests. Its two move answers used the
unregistered action name move. The review step prevents these suggestions from mutating the page
until someone approves them, but it does not turn them into successful AI edits.

The edit path is now review-first. A validated proposal names the block and operation, and the
canvas stays unchanged until the visitor approves it. Approval checks that the same composition is
still on screen and revalidates the original model answer against a fresh GRAIN manifest before
sending it through the door. A canvas change cancels a waiting proposal. After approval, the UI says
the edit landed only when the observed canvas matches the predicted result; a no-op or a failed
dispatch is reported without claiming success. The 61-case Builder browser suite covers approval,
cancellation, stale proposals, and the existing static-host paths. This contains a wrong suggestion;
it does not make the model's choices reliable.

The portfolio-side boundary is also clear. GRAIN registers block removal, span, and move operations.
Its field operation fills registered form controls; it does not write text into page-content blocks.
The builder's templates expose text as escaped data-field values, but writing those values from
the builder would bypass GRAIN's one-door contract. A later GRAIN design review must define an
addressed, bounded text operation before the builder can revise existing copy. This plan does not
change GRAIN or write around that boundary.

The builder refuses clear copy-edit requests before calling the model. This closes the specific
failure where a request to change a card's wording removed the intro instead. Newly composed blocks
can now receive bounded copy in explicitly registered text fields. Unknown fields are ignored,
controls and excess length are removed, and ordinary rendering escapes the resulting text. Scripted
browser checks cover brief-specific copy, its presence in the composition, and markup-like text
rendering literally. This verifies the application boundary, not whether the local model writes
useful or accurate copy. Existing blocks still cannot be edited for text because GRAIN has no
registered operation for that change.

I corrected the live Builder audit fixture on 2026-10-03 after finding that its callout-width case
started with the callout already full width. The callout now starts at half width, so both model
profiles have a real span change to perform. On the corrected seven-case audit, the current 0.5B
profile scored 2/7. It removed the explicitly named b4 and correctly refused a request to change
copy; it could not remove the second card, chose removal for both width requests, and returned the
unsupported shortened action move for both move requests. One first-use case also timed out at the
builder's 45-second completion limit before the model produced an answer. The captured result is in
.cache/desk-audit/report-builder-qwen-0.5b-fixed-2026-10-03.json.

I then exported the 1.5B profile and ran the same audit against that frozen static site in WebGPU
Chromium. It scored 6/7: both width changes, both move requests, the explicit b4 removal, and the
copy-edit refusal passed. It still removed b2, the first card, when asked to drop the second card.
The first request on the cold profile did not run; after the model loaded, a separate repeat of that
same request again removed b2. Warm responses in this run took 13 to 23 seconds. The static-site
result is in .cache/desk-audit/report-builder-qwen-1.5b-static-2026-10-03.json; the repeated target
case is in .cache/desk-audit/report-builder-qwen-1.5b-drop-repeat-2026-10-03.json. WebLLM lists
about 1.63 GB of required GPU memory for this model, compared with about 0.94 GB for the current
0.5B model ([WebLLM model configuration](https://github.com/mlc-ai/web-llm/blob/main/src/config.ts)).
The model's exact first-visit download size has not yet been measured. This is a promising editing
result, not proof of reliable page writing: the wrong-card choice remains, and the cold-load
experience needs review before selecting a model for visitors.

On October 3, 2026, I added a real-model composition scenario that grades the visible blocks and
checks whether the draft retains the visitor's supplied names and facts. The current 0.5B model
returned JSON with component names as top-level keys instead of the required blocks list. It also
added unsupported details, including a claim about fresh bread and omitted the supplied location.
The code rejected that shape and kept its example copy. A temporary 1.5B profile timed out at the
Builder's 45-second completion limit before returning a draft. The live writing scenario therefore
scored 0/1 for both profiles. The report files are
.cache/desk-audit/report-builder-draft-0.5b-2026-10-03.json and
.cache/desk-audit/report-builder-draft-1.5b-2026-10-03.json. These results mean that bounded copy
is a tested application path, not a useful writing capability of either tested local profile.

I tried shorter output instructions for the 0.5B draft scenario on October 3. The model kept its
block names inside the requested array, but returned a copy string instead of registered fields,
added an unrequested callout, and invented claims about the bakery. The validator kept the existing
sample copy, so the canvas remained safe, but the scenario still scored 0/1. I reverted the prompt
change because the live result did not improve. The capture is
.cache/desk-audit/report-builder-local-only-prompt-2026-10-03.json.

I reran the current prompt against the same live local 0.5B profile on October 3. It again returned
component names as top-level keys instead of the required `blocks` list, omitted all five supplied
facts, and added unsupported bakery claims. The validator rejected the response and the page used
the clearly labeled word-list path, leaving its sample copy in place. The repeat scored 0/1 in 8.6
seconds; it confirms that the current path is safe and local, but the model still does not produce a
useful grounded draft. The capture is
.cache/desk-audit/report-builder-local-check-2026-10-03.json.

## What to take from Puck AI

Puck's current pattern combines constrained assembly from application-owned components, business
context that grounds each prompt, and an editor where people review and adjust generated pages. Its
separate design mode can invent new component types. The portfolio should start with assembly: its
point is to show GRAIN as a design system, so the Builder should demonstrate what GRAIN's existing
blocks can do before it tries to invent new ones. Puck also offers configuration and tools that keep
generation tied to the host application. The portfolio already has a closed block set, but still
needs explicit portfolio context, stronger grounded copy, and a clear way to inspect and refine a
draft. Puck's documentation describes these parts in its [AI overview](https://puckeditor.com/docs/ai/overview),
[business context guide](https://puckeditor.com/docs/ai/business-context), and
[AI configuration guide](https://puckeditor.com/docs/ai/ai-configuration).

The Builder already has several pieces of that shape: a closed component set, a live canvas, a block
rail, preview and export, and a JSON composition. It now passes model-proposed copy for registered
fields through the same page composition, while leaving components, fields, and rendering
code-owned. The scripted path is covered, but the live local model has not been measured for writing
quality, and the measured edit path remains unreliable. The next Builder milestone should turn this
initial draft path into a grounded, inspectable workflow:

1. Give the model a short, explicit context pack: what the visitor is making, who the page is for,
   the requested tone, the approved facts, and the components and fields it may use.
2. Ask for a structured page draft using only registered GRAIN-backed blocks and bounded content
   fields. Reject unknown components, fields, props, and oversized values before they reach the
   canvas.
3. Keep the generated structure and copy visible in the live preview and JSON composition, identify
   that wording as a draft, and make checking or replacing it straightforward before export. The
   current path applies a draft directly; a review/accept step is a possible next interaction to
   evaluate, rather than a capability the current Builder already has.
4. Measure composition and revision against named scenarios. The current small model has not earned
   a claim of dependable natural-language editing; keep its quality result visible beside the demo.

There is a model-capability decision before this becomes a Puck-like writing tool. The portfolio
currently wires one local Qwen2.5-0.5B profile through WebLLM. There is no hosted-provider adapter in
the app. The Builder is local-only by product decision: prompts and page content stay on the visitor's
device, and this project will not add a hosted model or remote prompt path. The corrected 0.5B and 1.5B edit
comparison is recorded above; the 1.5B model performs the registered edits more often, but it still
misses the natural-language second-card target and carries a larger cold-start cost. WebLLM
documents custom model registration and client-side generation, so the larger local model can run
without introducing a server. The remaining local-model comparison work is to measure its exact first-visit
download size and cold-start behavior on representative desktop and phone hardware, then test a
grounded initial page draft with visitor-supplied copy. Do not treat a larger model as a win based on
one good screenshot.

Revising text in an already composed page also crosses a GRAIN boundary: the portfolio has no
registered operation for changing a block's content. The separate GRAIN design review remains
deferred as requested. Until that review happens, this Builder milestone can explore grounded initial
drafts and their review flow, but it must not write around GRAIN's one-door contract to make later
copy edits appear to work.

## Work

- [ ] Re-run the live-model scenarios on the current code and record a baseline for composition,
      block edits, refusals, and unsupported browser hardware. The composition scenario is now
      measured at 0/1 on the current 0.5B profile, including a shorter-prompt trial. The builder edit
      baseline and refusal path are recorded above; an unavailable-WebGPU live run remains to be
      measured.
- [x] Trace how generated copy could travel through the existing composition and GRAIN contracts.
      Keep component names, addresses, and allowed fields code-owned. Generated text is bounded to
      registered fields on new blocks; the later GRAIN design-review requirement remains for edits
      to existing block copy. No DOM bypass was added.
- [x] Trace each edit from the visitor's words through the model answer, validation, GRAIN's door,
      the dispatcher, and the final canvas. The scripted browser path still exercises the full chain.
- [ ] Improve the model's edit choices using the live manifest and the block IDs already visible on
      the page. The prompt now contains only live block actions and identifies each block's type and
      order, but the 2026-10-03 result still leaves five of seven scenarios unreliable. Do not add a
      deterministic fallback that makes the interface claim the AI acted.
- [x] Make the narration a projection of validated operations and observed canvas changes. The page
      waits for approval, revalidates the choice, and reports an edit as applied only after the
      observed canvas matches it. The focused browser suite covers the unchanged, canceled, stale,
      and applied states.
- [ ] Give the builder a small set of examples that demonstrates composing and then revising a real
      GRAIN page, including one honest refusal.
- [x] Let a page brief draft text into registered fields on newly composed blocks. Unit and browser
      tests cover validation, composition data, visible output, and literal rendering of markup-like
      input. Measure real-model writing quality before presenting this as reliable copywriting.
- [ ] Finish the model comparison by measuring the larger profile's first-visit download and cold
      start on desktop and phone hardware, then compare a grounded draft from the visitor's brief.
      The corrected edit comparison records 0.5B at 2/7 and 1.5B at 6/7 in WebGPU Chromium on the
      static export; 1.5B still targets the wrong card when asked to remove the second card. Use the
      remaining results to choose the scope of a Puck-informed draft flow; do not promise natural-
      language page writing until it passes measured cases.
- [x] Cover the supported path with browser tests on the exported static site, and keep the real
      model audit as a separate measured check because headless CI does not provide WebGPU. The
      builder browser suite passes all 61 scenarios, including the static-host, one-door, proposal,
      and copy-edit refusal paths. The real-model audit remains a separate score because headless CI
      has no WebGPU.
- [ ] Review the published workbench at desktop and narrow widths, then show the rendered result
      before calling the plan done. The local workbench was reviewed at both widths; its mobile file
      toolbar now wraps onto a second row instead of clipping. A published review remains open.

## Done means

The current browser model can build a useful first draft from a visitor's brief and complete the
agreed edit scenarios against the live page. Every unsupported case refuses without changing the
canvas or claiming success. The static export still composes and previews without a server. A
visitor can inspect the outcome, revise it, and export it without leaving the portfolio. The
live-model results and their limits are recorded beside the tests, so the page's claims stay tied to
evidence.
