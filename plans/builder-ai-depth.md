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
site, lets a person rearrange and resize blocks, and exports JSON, HTML, or tag source. The local
model chooses registered component names and their order. Code builds visible copy from phrases in
the visitor's brief, and the visitor can edit that copy in the review step. Existing block copy
cannot yet be revised. The Builder does not use model-written prose because the live trials added
unsupported claims. The source-built path has repeated live-model evidence, while actual-phone
performance and broad natural-language coverage remain open.

The recorded live-model audit on 2026-08-14 asked the 0.5B model to edit existing blocks eighteen
times. None of the answers produced a valid edit. The safety boundary held in every case, so the
canvas stayed unchanged, but the model often claimed it had acted. The builder has two separate
gaps to close: useful page copy grounded in the visitor's brief, and reliable revisions to the page
after it has been composed.

## What the visitor should be able to do

- Start from an ordinary description and get a composed page from real GRAIN components, with
  visible copy drawn from the brief or supplied by the visitor.
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

On October 10, I expanded the local-model check to eight draft, edit, and refusal cases on a machine
with WebGPU. The current 0.5B model scored 2/8. It removed `b4` when given that exact ID and refused
to rewrite copy on an existing block. It timed out when asked to remove the second card, removed the
intro instead of widening the callout, and returned unsupported actions for both move requests. Its
draft missed every supplied fact and left the sample copy in place. The captured report is
`.cache/desk-audit/report-builder-local-audit-2026-10-10.json`. The expanded run confirms that the
current model is not a dependable page writer or natural-language editor. The local-only decision
still stands; this evidence does not select a replacement model or establish cold-start performance.

On October 11, the empty workbench gained a first-screen link to the four-block code-composed example.
Once that page is open, the rail offers one prompt for the exact-ID removal that landed in the
October 10 live check and one prompt for an honest refusal to edit existing copy. Both buttons only
fill the composer; the visitor still sends the prompt and approves any proposed change. A phone-width
browser check confirms the starter link is in view, and the Builder suite covers the refusal leaving
the canvas unchanged. These prompts make the measured path easier to inspect; they do not change the
2/8 result or promise that the model will land the edit again.

On October 11, I reran the eight live-model scenarios in WebGPU Chromium against the current 0.5B
profile. It scored 2/8: exact-ID removal and refusal to rewrite existing copy passed. The model
removed the first card when asked for the second, timed out on both width requests, returned the
unregistered action `move` for both move requests, and produced a draft that omitted the supplied
business name, location, and copy. The browser kept the draft inside the registered composition
shape, but the resulting page used its sample text rather than the visitor's facts. The capture is
`.cache/desk-audit/report-builder-current-2026-10-11.json`.

I added a narrow portfolio-side normalization for the exact `move` shorthand. It is accepted only
when the live manifest contains `block.move`, the answer names a real block, and the direction is
`up` or `down`; GRAIN still validates the resulting command before the proposal or door. The focused
live recheck accepted the explicit request `move b3 up`. It also confirmed the remaining reference
failure: `move the callout up` selected b4, the second card, and the approval preview exposed that
choice before the test applied it. An eight-case run after the fix again scored 2/8. The passing cases shifted: exact-ID removal timed
out on its repeat, while an explicit-ID move passed; a width request also triggered a move. The score
hides substantial run-to-run variation. This result is in
`.cache/desk-audit/report-builder-after-move-alias-2026-10-11.json`. Natural-language target selection,
width requests, and grounded drafting remain open.

## Builder-only larger profile, October 11

I restored the tested Qwen2.5-1.5B profile for the Builder route only. The shared desk and devices that
do not pass the conservative memory/GPU capability check continue to use Qwen2.5-0.5B. Browser
capability signals are proxies, not a guarantee that the GPU can load the model; a failed load still
leaves the Builder offline on that page.

In a separate WebGPU Chromium run using the 1.5B profile, six of eight scenarios passed. Both width
requests, both explicit-ID move requests, the copy-edit refusal, and the fact-retention check passed.
Both card-removal requests failed: the relative request removed the first card, and the exact-ID
request returned an invalid action. The draft retained supplied facts but added unsupported
flourishes. The first scenario took 40.5 seconds from a fresh browser cache, including model loading
and generation. The browser profile occupied 1.6 GB on disk after the run; that includes browser
overhead and is not a measurement of network bytes. The later cold-network measurement recorded
875,219,838 encoded bytes for model assets and 1,661,197 bytes for the WebLLM JavaScript runtime.
This was one desktop run, not a success-rate estimate, and no phone hardware has been measured.

The Builder now selects 1.5B only on its route when browser-reported memory or GPU capability passes
the conservative gate. The shared desk remains on 0.5B. Both models run in the browser through WebGPU;
prompts and generated page content do not go to a hosted model. The public example now offers the
explicit-ID move prompt, which passed in both profile checks. The larger model still misses deletion,
and generated copy still needs human review.

After those runs, the edit boundary gained a narrow target-mismatch guard. When the visitor names one
block unambiguously by ID, ordinal plus type, or a unique component name, the portfolio compares that
reference with the model's validated target. A conflict is refused before a proposal appears or an
intent reaches GRAIN; the page names both blocks and asks the visitor to try again. The guard never
rewrites the model's choice, and ambiguous references still use the existing review path. A follow-up
found that a clear reference to a missing component, such as a callout on a page without one, had
been treated as ambiguous and could leave a different model-selected block eligible for review. The
guard now refuses clear absent IDs, component names, and out-of-range ordinals as well. Unit coverage
and a scripted browser case confirm that a model-proposed removal leaves the canvas unchanged. This
contains more wrong-target classes; it does not establish that either local model chooses targets
reliably. The October 12 live WebGPU run confirms the guard refused a wrong first-card target without
changing the canvas.

On October 12, an eight-case run of the 1.5B profile scored 6/8. Width changes, both move
requests, explicit-ID removal, and the copy-edit refusal passed. The relative request to remove the
second card reached the 45-second completion limit, and the draft omitted Utrecht. A two-case warm
repeat still sent the relative deletion at the first card, so the target guard refused it without
changing the canvas. Its draft retained Utrecht but added unrequested marketing phrases. A stricter
extractive-copy prompt did not fix those issues and was reverted. The first full run took 48.2 seconds
to report the timed-out edit; the completion limit is now 60 seconds to cover the observed duration.
The single-case repeat against the previously running server returned an invalid span operation for
the deletion request. The page refused it without changing the canvas. The fresh-server eight-case
rerun with the 60-second limit scored 5/8. The model took 50 seconds on the first request, then chose
b2 instead of the second card b4; the target guard refused it. The explicit-ID removal returned
`action: null`. Width, move,
and copy-edit refusal cases passed, while the draft omitted Utrecht and added unrequested marketing
phrases. The new timeout avoids the earlier timeout on this run, but the model's deletion and writing
quality remain unreliable. These results show that the larger profile's passing cases vary between
runs. They do not establish dependable natural-language editing or grounded copy.

On October 12, I tested a clearer edit prompt that listed blocks one per line and said to count
ordinal references within their own block type. Its eight-case run scored 6/8, but the model still
proposed moving the first card when asked to remove the second card, and its draft omitted Utrecht.
A warm repeat of those two cases scored 0/2: it again proposed moving the first card, and again
omitted Utrecht while adding unsupported marketing copy. The score difference from the preceding
five-of-eight run does not establish a prompt improvement, and the repeated failures show that this
clarification did not fix either gap. I reverted the prompt experiment.

On October 13, I ran the same eight scenarios on the current machine with the local 1.5B Builder
profile and cached WebGPU model. It scored 5/8. Both span changes and both move requests passed, as
did the refusal to edit existing copy. The relative deletion request proposed removing the first
card instead of the second, so the target guard left the canvas unchanged; the explicit `drop b4`
request returned an invalid action and also left the canvas unchanged. The draft omitted Utrecht
and added unsupported claims about fresh bread. The first deletion took 55 seconds, while the
remaining edit responses arrived in 3–11 seconds. This run confirms that the review and target
guards contain bad suggestions, but it does not establish dependable deletion or grounded writing.
The capture is `.cache/desk-audit/report-builder-local-2026-10-13.json` and is local audit output,
not a committed portfolio asset.

A later audit found the live-model harness still graded a page draft from the canvas before it passed
through the new review panel. The harness now records proposed text and block count first, then
accepts the proposal through the same control a visitor uses. A warm WebGPU check of the relative
deletion, explicit-ID deletion, and grounded-draft cases scored 0/3 before structured edit output was
added: relative deletion selected b2 instead of b4, the explicit-ID result was invalid, and the
draft omitted Utrecht. The Builder now supplies a schema derived from the live manifest to constrain
edit actions, target IDs, and payload vocabulary before GRAIN validates the answer. Its next focused
check scored 1/3: `drop b4` landed, relative deletion still proposed b2, and the draft still omitted
Utrecht while adding unsupported wording. This single check does not establish a repeatable gain.

The October 13 follow-up keeps the model's operation choice, but safely reconciles a wrong target when
the visitor's wording identifies exactly one live block. The proposal names the model's chosen block
and the requested block, then waits for approval before using the corrected address. References to
absent blocks are refused; ambiguous references keep the model's proposal for review. The audit
records the raw answer, the correction shown, and the resulting canvas separately. Its next focused
check passed both deletion cases: the model named b2
for the second card, and the proposal transparently corrected it to b4; the explicit `drop b4` request
also landed. The draft still omitted Utrecht, so the end-to-end check scored 2/3. This demonstrates
safe target reconciliation, not reliable model reference resolution or grounded copy.

A full eight-case recheck after that change scored 6/8. The span, move, copy-edit refusal, and draft
cases passed. Both deletions failed: the relative request reached the 60-second timeout, and the
explicit-ID request returned `action: null`. The draft included Hearth Bakery, Utrecht, the requested
bakery wording, and the product title, but it also added unsupported claims about handcrafted bread,
a staple product, and a daily special. The completion limit is now 75 seconds to give first requests
more room; this run happened before that adjustment.

The next eight-case 1.5B run scored 6/8. The relative second-card deletion passed after the proposal
corrected the model's wrong span operation and first-card target; the explicit-ID request returned
`action: null`, and the draft again omitted Utrecht. The edit path now offers a second, disclosed
recovery when the model declines a request with one explicit supported operation and live target.
The recovery remains a proposal and uses the same approval and canvas revalidation as model proposals.
A later eight-case run scored 7/8: both deletion cases, both width cases, both move cases, and the
copy-edit refusal passed. The model proposed the relative deletion for the wrong target, which the
review panel corrected; the explicit-ID deletion came back from the model and applied as proposed.
The draft still omitted Utrecht and included unsupported marketing language. The remaining model
quality gap is now grounded copy, not whether the reviewer can apply a clear removal request.

A fresh 1.5B draft-only repeat again scored 0/1 on the copy brief. The model retained Hearth Bakery
and neighborhood bakery, omitted Utrecht, and added a daily-baking statement plus “perfect for a warm
start” without support from the prompt. The draft review now displays the original brief beside the
editable generated fields and asks visitors to compare names, locations, and claims before adding the
draft. This gives visitors the evidence needed to review an omission or unsupported claim; it does not
improve the model's grounding. A phone-width browser check confirms the source brief stays readable
without horizontal page overflow.

After the October 13 Builder commit, I reran all eight live 1.5B scenarios against the current local
source using the cached WebGPU model. The run scored 7/8. Both deletion requests, both width changes,
both moves, and the copy-edit refusal passed. For “drop the second card,” the model proposed a span
change to b2; the review path reconciled the explicit request to drop b4 and applied it after
approval. The exact-ID removal was proposed and applied directly. The draft retained Hearth Bakery,
the requested category, the Sourdough title, and the baking phrase, but again omitted Utrecht and
added “hand-crafted” and “every morning.” Its raw answer and result are in the ignored local report
`.cache/desk-audit/report-builder-continue.json`. This confirms the reviewed edit path can complete
these requests; repeated grounded writing remains unproven. The review panel still makes the source
brief available beside the generated copy, and the one-door contract still prevents edits to existing
block text until GRAIN defines that operation.

The October 13 Builder update adds a review-first path for model-composed pages. Proposed blocks and
their text appear in the workbench before they enter the composition. Visitors can edit proposed
text fields in that panel; acceptance runs those values through the existing block-copy sanitizer
before appending the draft through the composition functions. Discarding it preserves the current
blocks and URL. Generated markup remains text in the review panel. The Builder browser suite covers
review, text edits, acceptance, discard, escaped text, offline builds, and the existing edit path,
including the disclosed recovery when a model declines a clear command. This makes model output
inspectable and correctable before it changes the page. A fresh 1.5B draft-only repeat again omitted
Utrecht and added unsupported claims. The review panel places the original brief beside the editable
draft, flags detected names, quoted phrases, and numbers that are missing, and requires explicit
confirmation before acceptance. Edits clear the confirmation, and none of these lexical checks
proves the draft is true or complete. Repeated model runs are still needed before generated copy can
be called grounded.

A further fresh WebGPU recheck on October 13 scored 6/8. The two deletion answers were unusable: the
relative request returned a span action with a null payload, and the explicit-ID request returned a
null action. Before this change, parser and validator refusals stopped before the existing recovery
could offer a proposal. Clear requests can now use that same disclosed request-based proposal when
the model declines or returns an unusable answer. Approval reconstructs the proposal from the human's
request, checks the current manifest again, and still sends the edit through GRAIN's door. A browser
test covers the malformed response and approval path; the full 71-case Builder browser suite passed.
The real-model score remains 6/8 because the audit measures the model's answer and direct application,
not a visitor's approval of a recovered proposal. The draft again kept Hearth Bakery, Utrecht, the
requested product and phrase, but added unsupported claims about handcrafted bread, a bakery staple,
and the local scene. The recovery makes clear deletion requests usable despite malformed answers; it
does not improve model reliability or grounded writing.

After this recovery shipped locally, the same eight-case WebGPU workflow scored 7/8. Both deletion
requests reached the intended canvas after the ordinary approval step. For the relative request, the
model again proposed a span change on b2; the review step showed the correction to drop b4 and applied
it only after approval. The explicit-ID answer proposed removal of b4 and applied as proposed. Both
width requests, both move requests, and the copy-edit refusal also passed. The draft was the one
failing case: it omitted Utrecht and added unsupported claims about daily baking and a warm start to
the day. The ignored local report is at
.cache/desk-audit/report-builder-current-recovery-2026-10-13.json. This measures the reviewed
workflow, not reliable model choices or grounded writing.

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
   Builder now holds model output in a review panel, shows the proposed block names and text, and
   leaves the current canvas unchanged until the visitor accepts it. Discarding the proposal leaves
   both the composition and share address unchanged. This gives the visitor a review point, but it
   cannot detect unsupported claims by itself.
4. Measure composition and revision against named scenarios. The current small model has not earned
   a claim of dependable natural-language editing; keep its quality result visible beside the demo.

There is a model-capability decision before this becomes a Puck-like writing tool. The shared desk
uses a local Qwen2.5-0.5B profile through WebLLM; the Builder can select a local 1.5B profile on
capable devices. There is no hosted-provider adapter in
the app. The Builder is local-only by product decision: prompts and page content stay on the visitor's
device, and this project will not add a hosted model or remote prompt path. The corrected 0.5B and 1.5B edit
comparison is recorded above; the 1.5B model performed better in one eight-case run, but failed both
removal cases and added unsupported details to its draft. WebLLM documents custom model registration
and client-side generation, so the larger local model runs without introducing a server. Exact
desktop network bytes are recorded below; behavior on representative phone hardware remains
unmeasured. Do not treat one run
as evidence that the larger model is dependable.

Revising text in an already composed page also crosses a GRAIN boundary: the portfolio has no
registered operation for changing a block's content. The separate GRAIN design review remains
deferred as requested. Until that review happens, this Builder milestone can explore grounded initial
drafts and their review flow, but it must not write around GRAIN's one-door contract to make later
copy edits appear to work.

## Work

- [x] Re-run the live-model scenarios on the current code and record a baseline for composition,
      block edits, and refusals. The October 11 WebGPU run scored 2/8 on the 0.5B profile; the
      focused move-alias recheck is recorded above. The no-WebGPU behavior remains covered by the
      scripted browser checks, which keep headless CI separate from live-model scoring.
- [x] Trace how generated copy could travel through the existing composition and GRAIN contracts.
      Keep component names, addresses, and allowed fields code-owned. Generated text is bounded to
      registered fields on new blocks; the later GRAIN design-review requirement remains for edits
      to existing block copy. No DOM bypass was added.
- [x] Trace each edit from the visitor's words through the model answer, validation, GRAIN's door,
      the dispatcher, and the final canvas. The scripted browser path still exercises the full chain.
- [x] Complete the supported edit and refusal workflow using the live manifest and block IDs visible on
      the page. The prompt contains only live block actions and identifies each block's type and
      order. A portfolio-side parser accepts the measured `move` alias only for a live block and
      valid direction. The local completion receives a schema derived from live block IDs, edit
      verbs, and payload values. When a model's proposed action, value, or target conflicts with one
      edit uniquely stated by the request, the review proposal discloses both choices and uses the
      requested edit only after approval; missing targets are refused, while ambiguous references
      stay with the model proposal for human review. Two consecutive eight-case WebGPU rechecks on
      October 13 each scored 8/8 across relative and explicit deletion, width, movement, copy-edit
      refusal, and page drafting. In the second run, the model chose b2 for the relative request to
      remove the second card; the proposal disclosed the mismatch and the visitor approved the
      corrected b4 target. This verifies the reviewed workflow on this cached desktop model, not
      unassisted model accuracy or performance on other devices. The [October 13 WebGPU recheck](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-webgpu-recheck-2026-10-13.md)
      keeps the method and four JSON captures with this plan.

On October 13, a fresh focused WebGPU run scored 7/8 across the six edit requests, one copy-edit
refusal, and one grounded draft. The relative deletion passed after review corrected the model's
proposed span change on the wrong block; the model proposed the exact-ID deletion correctly. The draft
kept the bakery name and product but omitted Utrecht and added unsupported bread claims. Two warm
repeats of the same prompt scored 0/1 and 1/1. One omitted Utrecht again. The other included Utrecht
but added an unsupported claim and an unrequested callout. All three drafts contained unsupported
embellishment, and only one preserved the supplied city. The scenario score checks fact retention,
not whether generated claims are true, so these runs do not establish reliable writing. The captures
are `.cache/desk-audit/report-portfolio-builder-focused-2026-10-13.json`,
`.cache/desk-audit/report-portfolio-builder-draft-repeat-1-2026-10-13.json`, and
`.cache/desk-audit/report-portfolio-builder-draft-repeat-2-2026-10-13.json`. The Builder's first-screen
note and detail drawer now show these measured results before visitors try the model, including the
difference between the 7/8 reviewed workflow and the one-of-three location-retention result.
On October 13, a follow-up live check confirmed the review cues against two cached WebGPU drafts.
One draft retained Hearth Bakery and Utrecht, but added unsupported claims about artisanal bread
and a bakery staple. The other omitted Utrecht; the review called out the missing location and
separately listed phrases such as “perfect” and “warm start” that were not in the brief. The check
correctly kept the location warning when the draft omitted it, but the comparison remains lexical:
it cannot detect every unsupported claim or determine whether a sentence is true. The audit harness
now saves both review cues with the unedited output before approval. Repeated grounded-draft quality
remains open.

Later on October 13, the model boundary gained a source reconciliation step. When the visitor names
block types or counts that the code matcher recognizes, surplus model blocks are removed and omitted
requested blocks are restored. Each proposed text field is reduced to its longest supported source
phrase or left at component sample copy; detected names, quoted phrases, and numbers missing from
the result are carried into the first available body field. Nearby negation prevents a phrase from
being extracted as a positive claim from negative source text. The review summary reports removed
blocks and changed wording, and the success message names the reconciled composition rather than the
raw model answer. The cached-WebGPU run
.cache/desk-audit/report-builder-reconciled-grounded.json passed its single draft scenario in
24 seconds: the model proposed an extra callout and embellished both requested blocks, while the
reviewable composition contained only the requested intro and card, retained Hearth Bakery and
Utrecht, and kept “neighborhood bakery” and “baked fresh each morning” from the brief. This measures
one code-guarded scenario, not model-authored copy quality, repeated reliability, or claim truth.
Run repeated briefs before describing the Builder as a dependable page writer. Physical-phone cold
start remains unmeasured.
- [x] Make the narration a projection of validated operations and observed canvas changes. The page
      waits for approval, revalidates the choice, and reports an edit as applied only after the
      observed canvas matches it. The focused browser suite covers the unchanged, canceled, stale,
      and applied states.
- [x] Give the builder a small set of examples that demonstrates composing and then revising a real
      GRAIN page, including one honest refusal. The first-screen link opens a four-block page; the
      rail then offers a prompt for the measured `move b3 up` edit and a copy-edit refusal. The buttons
      prefill only, and the 71-case Builder browser suite verifies the flow and unchanged canvas on
      refusal.
- [x] Let a page brief draft text into registered fields on newly composed blocks. Unit and browser
      tests cover validation, composition data, visible output, and literal rendering of markup-like
      input. The portfolio now requests schema-constrained JSON for its local build path and tests
      that contract through the desk bridge; the existing validator still applies. Measure real-model
      writing quality before presenting this as reliable copywriting.
- [x] Hold a model-composed page in a review panel until the visitor accepts it. The panel lists the
      proposed blocks and editable text fields, and its accept and discard controls keep the canvas
      and composition unchanged until approval. Accepting sanitizes the edited values and appends
      through the existing composition functions; discarding leaves the page and share URL untouched.
      The visitor must attest that they checked the draft against the brief before adding it. Any
      edit after confirmation clears the check and disables acceptance until the visitor confirms
      again. The 71-case Builder suite covers this flow, including markup-like copy rendered as text
      and reconfirmation after edits. A human still has to check accuracy because the local model
      can omit facts and invent claims; this confirmation gate does not make generated copy reliable.
- [x] Make the draft review show which fields use component sample text and which contain model
      copy. For generated text, list meaningful words absent from the brief and update that list as
      the visitor edits the field. The review also surfaces capitalized name phrases, quoted
      phrases, and numeric values from the brief that are not found verbatim anywhere in the draft;
      its check updates as the visitor edits. This lexical comparison is a review aid, not a check
      that the resulting claims are true or that every brief detail has been detected. Unit and
      browser checks cover extra wording, omitted and restored named details, sample copy, and edits.
- [x] Ground initial page drafts in the visitor's source brief. The portfolio removes surplus
      blocks when the visitor explicitly names types or counts, restores requested blocks the model
      omitted, keeps generated fields within supported source phrases, and carries detected missing
      names, quoted phrases, or numbers into the first usable body field. For explicit intro
      descriptions and welcome requests, it joins supplied details into a short sentence rather than
      leaving a phrase list. Two standalone warm repeats
      and both full eight-case runs retained Hearth Bakery, Utrecht, neighborhood bakery, Sourdough,
      and baked fresh each morning. These checks cover one repeated brief and one cached desktop
      model; source-phrase retention does not prove factual truth or reliably express the brief in
      polished prose. The review and confirmation step remains visible. The two standalone captures
      are linked from the October 13 WebGPU recheck.
- [x] Keep model-written prose out of visible drafts. Repeated 1.5B and 3B trials still produced
      unsupported claims, misplaced wording, or extra blocks. The Builder now uses the model only
      for registered structure and order. Code builds visible copy from source phrases in the brief,
      leaves unsupported fields blank, and lets the visitor edit before approval. The repeated
      visitor-facing checks passed, while the raw model answers remain in the
      [grounded-sentence follow-up](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-grounded-sentence-followup-2026-10-14.md)
      and the [3B comparison](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-qwen25-3b-parser-full-2026-10-14.json).
      This closes the unsafe raw-copy path, not the model's ability to write polished prose.
- [x] Verify responsive layout and visitor flow at a 390px browser viewport. The reviewed 390px
      capture, 320px overflow check, and phone-width end-to-end cases cover the portfolio's
      responsive acceptance. They do not measure model startup, memory use, download size, or
      generation speed on a physical phone. That device-performance check is a separate follow-up
      only if the portfolio sets a phone-specific performance target.
- [ ] Demonstrate reliable natural-language page writing through repeated measured cases before
      describing the Builder as a dependable page writer. Keep copy review visible in the meantime.

#### Earlier model performance trials

The 0.5B scored 2/8 in each of two October 11 runs. The 1.5B scored 6/8 in one separate run, but
failed both removal cases and added unsupported flourishes to its draft. It scored 6/8 and 5/8 in
two October 12 runs, with different passing cases. A warm draft repeated the supplied city but added
unsupported phrases; another omitted the city. A stricter prompt was tested and reverted after it
also missed the city. One October 12 edit reached the 45-second completion limit, so the portfolio
allowed 60 seconds; a later full run still timed out on its first deletion, so the limit now allows
75 seconds. The fresh-server run avoided that timeout but took 50 seconds and refused the wrong
target. The October 13 1.5B run passed width and move edits but failed both deletion cases and again
omitted Utrecht while adding unsupported draft claims. A later warm WebGPU check scored 1/3 after
adding schema-constrained edit output: explicit “drop b4” passed, relative deletion still targeted
b2, and the draft still omitted Utrecht. Its corrected audit harness scores proposed copy before
acceptance. This isolated result does not establish a quality improvement. The transparent target
correction then let both deletion cases apply through review, while the draft still omitted the city.
This focused 2/3 result demonstrates target reconciliation, not a model-quality improvement. A full
eight-case run then scored 6/8: both deletions failed, one after 60 seconds and one with a null action;
the draft included the supplied facts but added unsupported claims. The timeout then increased to 75
seconds. A later full run scored 6/8, after which the declined exact-ID case gained a disclosed,
approval-gated recovery. Before the source-reconciliation step, the latest full run scored 7/8 and
the draft omitted Utrecht. After source reconciliation, two consecutive full runs scored 8/8, with
all five requested details present in the reviewable draft. The audit records each correction beside
the raw answer. The October 11 first scenario took 40.5 seconds from a fresh browser cache, including
model load and generation; the 1.6 GB browser-profile footprint is not a network-size measurement.
Exact first-visit network bytes are recorded in the October 12 cold-download measurement below.
These runs do not measure physical-phone startup or generation performance, and they do not establish
reliable natural-language writing. Keep copy review visible.

- [x] Cover the supported path with browser tests on the exported static site, and keep the real
      model audit as a separate measured check because headless CI does not provide WebGPU. The
      builder browser suite passes all 71 scenarios, including the example flow, schema delivery,
      static-host, one-door, proposal, copy review, and copy-edit refusal paths. The real-model
      audit remains separate because headless CI has no WebGPU.
- [x] Review the published workbench at desktop and narrow widths. The workbench renders at 1440px
      and 390px with one page heading, no horizontal overflow, and no browser page errors. The phone
      view keeps the example link visible and the toolbar wraps without clipping. The live page shows
      the current model-size disclosure and measured `move b3 up` example.

## Cold download measurement, October 12

The October 12 cold-download measurement used a new persistent Chromium profile, with network capture
attached before opening the Builder. All 30 weight shards in the pinned model index were received
without cached responses. Their declared body sizes total 868,547,584 bytes. Chromium reported
875,219,838 encoded transfer bytes across weights, tokenizer, configuration, index, and WebGPU library,
plus 1,661,197 bytes for the WebLLM JavaScript runtime. The public larger-model download notice now
uses about 875 MB. Exact desktop transfer measurement is complete; actual phone hardware is still
unmeasured. The model's draft appeared within the 60.1-second observation window and included the
supplied bakery name, city, and requested product wording, but invented artisanal-bread and staple
claims. The sampled timing has ten-second resolution and is not an exact generation duration.
See audit/builder-cold-2026-10-12.md for the capture method and visible output.

The October 13 device check ran on the available MacBook Air. Its USB inventory contained no iPhone
or Android device, and `adb devices -l` listed no Android device. This host does not have the `simctl`
utility for an iOS simulator. Emulated phone widths remain useful for layout checks but cannot
measure model compatibility, memory pressure, download, or generation on a phone. The current Builder
page discloses local inference, first-use model downloads of about 875 MB
or 350 MB, and the need to review generated copy. Two additional October 13 desktop WebGPU audits
each passed eight reviewed scenarios with the model cached; both reused the same brief, so they do
not measure cold start or broad writing reliability. See
[the WebGPU recheck](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-webgpu-recheck-2026-10-13.md). Resume the phone test when a
physical handset is available and record model selection, uncached transfer, load duration,
generation duration, memory pressure, and whether the page remains usable.

## Phrase placement and model availability, October 13

Two additional live briefs exposed a gap the repeated bakery prompt had not: a bike-shop draft
shortened “ready for the next ride” in the requested card, while a pottery draft retained its phrase.
An earlier page-wide audit later reported 2/2 even though the bike phrase appeared only in the intro
and the card still showed GRAIN's sample copy. The scorer now requires the phrase in `card.body`.
When the model misses wording explicitly assigned to an intro, card, or callout, reconciliation puts
the source phrase in that block's body and replaces nonmatching generated text in that field.

The unit suite covers both phrase placement and the audit's former false positive. The Builder's 73
browser cases cover the reviewed card draft and a missing model response. The latter now says that the
desk did not return a draft and that the visible page was composed from the visitor's words. The
latest varied WebGPU attempt could not load model weights: Chromium's Cache API reported a network
failure fetching shards from the Hugging Face CDN, so neither brief produced a model answer. The
audit records these as “not run,” not as failed model answers, and exits nonzero because the live
quality check is still incomplete. The source fix is verified in unit and browser tests, but its
behavior against the live model is not yet verified. The full test suite passed 722 tests locally
and the portfolio typecheck passed. A second post-fix retry hit the same CDN failure for both briefs;
its saved report records zero model answers and two not-run scenarios. See
[the retry report](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-phrase-placement-notrun-recheck-2026-10-13.json).

A later repeat reused the stable `localhost:3131` origin where Chromium had the model cached. Two
varied briefs, for a bike shop and pottery studio, each passed three times after source reconciliation.
The saved draft fields show the shop description in `lede.body` and “ready for the next ride” in
`card.body`; both pottery captures also passed the phrase requirement in its named card. The raw
model answer still misplaced or shortened some wording, so these passes measure the code-guarded
reviewable composition, not unassisted model accuracy or polished copy. The three reports are
[first run](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-phrase-scoped-description-live-1-2026-10-13.json),
[second](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-phrase-scoped-description-live-2-2026-10-13.json), and
[third](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-phrase-scoped-description-live-3-2026-10-13.json). The earlier CDN
failures remain no-run results from new local origins, not failures of the later cached runs. A cold
start on an actual phone and broader writing reliability remain open.

The wording parser previously missed the direct instruction “an intro for a family-run bike repair
shop.” It now recognizes “intro for” and “intro about” as explicit lede targets. A regression test
puts the description in the model's card answer and verifies that reconciliation moves it to the
intro. A warm live run passed 1/1 for the “intro for” variant, with the description in `lede.body` and
the separate requested phrase in `card.body`; this demonstrates guarded placement, not an accurate
or polished raw model answer. See the
[live report](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-intro-for-live-2026-10-13.json).

On October 14, I tested a shorter prompt with explicit field destinations against four warm WebGPU
briefs. The guarded result passed all four, but the raw answers still misplaced bike-shop wording,
omitted a supplied city, and added unsupported claims. The candidate did not improve raw field
placement or grounding, so I restored the previous prompt. The [experiment record](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-field-map-prompt-experiment-2026-10-14.md)
contains the raw capture and explains why the candidate was not shipped.

The audit previously wrote “unspecified” as the model for live WebGPU runs. The selected profile is
now exposed in non-visible page metadata and captured per scenario. A warm run identified
Qwen2.5-1.5B-Instruct-q4f16_1-MLC and passed one bike-shop workflow after source reconciliation.
Its raw answer still invented more than twenty years of service, reliable and affordable work, and
an adventure claim. The guard removed those additions and restored the requested field wording.
This proves the guarded result on one prompt, not reliable raw writing. Older captures remain
unassigned and cannot be retroactively attributed to a profile. See the
[profile check](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-live-model-profile-2026-10-14.md).

On October 14, a negative-instruction regression showed that the source-anchor guard could promote
forbidden quoted text and dates into required draft content. The guard now skips anchors in nearby
negative clauses, including “do not,” “avoid,” “exclude,” and “leave out,” while retaining a positive
phrase requested later in the same brief. Unit regressions cover those forms. Two live WebGPU checks
on the Builder's 1.5B profile passed their visible-copy requirements: each kept the provided bakery
and location, omitted the forbidden bakery claim and opening year, and reduced the intro to
source-supported words. Raw responses still proposed unsupported details and blocks; the audit
checks the guarded result, not reliable raw model writing. See the
[negative-anchor audit](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-negative-anchor-guard-2026-10-14.md), the
[“do not” live report](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-negative-anchor-live-2026-10-14.json), and the
[“avoid / leave out” live report](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-negative-anchor-check-2026-10-14.json). Broader
raw-writing quality, natural-language editing, and a real phone cold-start remain open.

After deployment, headless production checks selected the 0.5B profile at 1280px and 390px. Both
viewports showed the current disclosure with no overflow or browser errors. This verifies the
published selector metadata and responsive page, not model behavior on an actual phone.

Commit `1b8b5a1` released the initial negative-anchor guard. Follow-up commit `76e0c9d` added common
“avoid,” “exclude,” and “leave out” instructions and a later positive phrase to the regression and
live audit. Documentation commit `e780d66` records that release; its hosted CI passed all 432 browser
cases and 727 unit tests, typecheck, and the lint baseline, and its Pages build and deploy passed.
The published Builder route and bundled script were checked after deployment. Three live WebGPU
negative-instruction checks passed their visible-copy requirements. The third also confirmed that a
requested positive phrase remained in `lede.body` beside three prohibited details that were omitted.
These results verify the targeted phrase-and-year cases, not reliable raw model writing or general
negation understanding. Broader writing quality and a cold-start measurement on actual phone
hardware remain open.

Commit `ee8c36d` extends the sentence-initial filter to “exclude,” “leave out,” and “without,” so
those capitalized instructions cannot become positive anchors. Hosted CI passed all 432 browser
cases, 728 unit tests, typecheck, and the lint baseline. The Pages build and deployment passed, and
the published `block-composer.js` contains the expanded filter. A third live WebGPU case passed with
three forbidden details and a required positive phrase retained in `lede.body`. Its report is
[here](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-mixed-prohibitions-live-2026-10-14.json). This remains a targeted guard check,
not evidence of reliable raw writing. The broader writing and physical-phone cold-start items remain
open.

A further regression showed that anchor filtering alone did not stop the copy-grounding step from
reusing a prohibited source word. The same clause check now runs as each candidate span is built and
stops a phrase from crossing into a later prohibited instruction. A direct regression retains the
positive “Hearth Bakery” phrase but rejects a source span that continues across a sentence boundary
into “Do not use the phrase ‘award-winning bakery.’” Unit coverage also verifies that a forbidden
“certified organic” phrase cannot be grounded, while a later requested “neighborhood bakery” phrase
still can.
Two warm live rechecks passed with the model's raw answers proposing “organic bread” and “organic
ingredients”; neither suggestion appeared in the reviewed result. The live grader now checks those
prohibited terms separately. After the span-boundary fix, a third live recheck passed and retained
the required intro phrase. See the
[cross-sentence unit regression and audit record](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-negative-anchor-guard-2026-10-14.md)
and [latest live report](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-negative-span-recheck-2026-10-14.json). This protects the
visible composition for these tested forms; broad semantic claim detection and raw-writing quality
remain open. The code and captures are being prepared for release in the next increment.

The current local verification passed 724 unit tests, the typecheck, the lint-baseline gate, link
lint, and 80 focused browser cases across the Builder and project layouts. The browser run covers the
updated first-screen disclosure, draft confirmation and phrase review, badge accordions, and phone-
width page fit. It does not close the phone cold-start item above.

Commit `dbf161d` is deployed. Hosted CI passed typecheck, all 724 unit tests, the lint baseline, and
the full end-to-end job. A production browser check confirmed the new “intro for…” evidence at
desktop and 390px, with no horizontal overflow or page errors. This verifies the published layout,
not real-phone model performance.

Commit `8fcdbc5` is deployed. Hosted CI passed all 432 browser cases, typecheck, 724 unit tests, and
the lint baseline. The Pages build and deployment both succeeded. A browser check against the
published Builder and Badges pages confirmed the disclosure text, visible subject descriptions,
four section cards under the expanded first subject, and no horizontal overflow at 390px. This checks
the published visitor path at desktop and emulated phone width; it does not measure a physical
phone's model download, memory use, or generation time.

## Source-backed intro sentences, October 14

The six-case WebGPU follow-up passed its visible-copy requirements after reconciliation, but one
reviewed intro still read as a phrase list. I added a narrow sentence builder for an explicitly
described intro, an exact phrase assigned to the intro, and a welcome request. It combines only the
brief's supplied subject, location, description, and audience. The anchor fallback also removes an
overlapping partial phrase before restoring a missing full name or location. Unit regressions cover
the sentence forms, the prohibited-phrase case, and the name overlap.

The six warm checks covered bakery, bike-repair, negative-instruction, and pottery briefs. The
reviewed output passed each scenario, including the complete welcome sentence. A separate live check
of the exact phrase after the sentence-builder change passed 1/1 and excluded all tested prohibited
terms. The raw model answers still invented locations, an owner, opening hours, and other unsupported
claims, or put requested words in the wrong field. These results improve the visible guarded draft;
they do not close the raw-writing item above. See the
[five-case baseline](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-reliability-varied-2026-10-14.json),
[six-case follow-up](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-reliability-postfix-2026-10-14.json), and
[exact-phrase recheck](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-exact-intro-phrase-2026-10-14.json). Local verification
passed 736 unit tests, 74 Builder browser cases, typecheck, link lint, and the lint baseline. The
review now distinguishes verbatim wording from sentences composed from brief details and still says
that its checks cannot verify claims. Commit `af142b7` released the code and captures. Hosted CI on
commit `f170865` passed 432 browser cases, typecheck, unit tests, and lint; its Pages deployment
passed. The physical-phone cold start remains open.

## Source-quote prompt check, October 14

A temporary prompt rule asked the local model to quote one exact, contiguous phrase from the brief for
each copy field. A six-scenario warm run still produced unsupported raw details in the bakery,
bike-shop, and pottery cases. All six reviewed drafts passed after source reconciliation, which does
not establish that the prompt improved raw writing. The rule was removed. The comparison and its
limitations are recorded in the [source-quote prompt check](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-source-quote-prompt-2026-10-14.md).
The raw-writing requirement remains open.

## Zero-temperature check, October 14

I also compared one six-brief run at structured-completion temperature 0.0 with the previous 0.2
setting. Both runs passed after source reconciliation, but the zero-temperature raw answers still
invented details, proposed surplus blocks, and repeated a prohibited “organic” claim. The original
setting was restored. The [zero-temperature audit](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-zero-temperature-experiment-2026-10-14.md)
records the raw outputs and the limits of this single-run comparison. Raw-writing reliability remains
open.

The evidence update is published in commit `69f5bf3`. Hosted CI passed typecheck, 736 unit tests, the
lint baseline, and 432 browser cases. The Pages build and deployment succeeded. The public Builder
and finish-line plan routes both return HTTP 200. These release checks confirm the recorded
experiments are published; they do not establish reliable raw writing or a cold start on phone
hardware.

## Scripted model test readiness, October 14

The hosted run on `0f5b7e4` recorded one flaky first attempt in the Builder's refusal cases. The test
submitted a model-backed edit before its scripted desk finished initializing, so the page correctly
reported that the desk was unavailable. The shared test helper now waits for the scripted model
before sending those prompts; the offline-path tests still run without that wait. The specific
refusal passed three consecutive local repetitions, and all 73 Builder-canvas cases passed locally.
Hosted CI on `8d39c1a` passed all 432 browser cases with no retry, 736 unit tests, typecheck, and the
lint baseline. The Pages deployment succeeded. This fixes the test race, not a model-quality defect:
raw-writing reliability and a physical-phone cold start remain open.

## Full Builder WebGPU recheck, October 14

A fresh run of the complete 36-scenario desk audit on the cached local Qwen2.5-1.5B profile passed
32 scenarios. All 13 Builder cases passed: seven edit or refusal cases and six page drafts. The
four failures belonged to other desk behaviors (`who-is-tj`, `cap-freeform`, `cap-det`, and
`memory-read`), so this result does not count as a full portfolio pass. The Builder drafts retained
the requested names, locations, descriptions, and phrases after source reconciliation. The raw
answers still added unsupported claims or extra blocks in five of the six drafts; the code removed
those additions before the visitor reviewed the draft. The 13/13 result therefore measures the
guarded visitor-facing result in one run, not raw model accuracy or a repeatable success rate.

The full-run record is [here](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-full-webgpu-2026-10-14.json). I strengthened the mixed-
prohibition grader to require the complete intro sentence in `lede.body`; a phrase list that merely
contained the requested words now fails. Its unit test rejects the earlier list-shaped result and
accepts the sentence. Three warm WebGPU runs each passed 1/1 and produced “Hearth Bakery is a
neighborhood bakery in Utrecht.” while omitting all four prohibited terms. The raw model still
suggested unsupported phrases such as “fresh, organic bread” and “with a twist”; the source-backed
sentence composer replaced those suggestions in the reviewed draft. See the
[three-run live report](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-mixed-complete-sentence-repeats-2026-10-14.json). This makes the
specific visitor-facing form repeatable in these checks; broad semantic writing quality remains
open. A physical-phone cold-start measurement is still required.

I repeated all six draft scenarios on the cached Qwen2.5-1.5B WebGPU profile. The guarded drafts
passed 6/6 and preserved the requested names, locations, descriptions, and exact phrases. The raw
model output still failed the writing bar in all six cases: it added claims such as a service history,
team credentials, or product promises, and it sometimes proposed three extra blocks for a single-
intro request. The code removed or replaced those suggestions before review. This confirms that the
visitor-facing guard works across these six briefs; it also confirms that raw writing is still not
reliable. The [repeat report](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-recheck-2026-10-14.json) preserves each raw
answer beside the reviewed draft. The remaining writing acceptance bar is zero unsupported claims or unrequested blocks across the
same six briefs in two consecutive warm runs, with requested wording in its named fields. The raw
answers must be reviewed directly; passing the guarded grader alone does not meet this bar. See the [published source capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-recheck-2026-10-14.json).

I reran those six briefs twice on the same cached 1.5B profile. All 12 reviewed drafts passed the
existing field-aware visitor grader, and every output retained its required names and phrases in
the requested fields. The raw responses still failed the stricter writing bar: they invented
details such as a Malmö service history, experienced technicians, locally sourced ingredients,
opening claims, and extra blocks. One bike-shop card also moved requested wording into its title;
the reviewed draft restored it to the requested body field. The [12-case report](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-six-repeat-validation-2026-10-14.json)
records raw and reviewed copy for both runs. The visitor-facing path is repeatable on this warm
desktop profile; raw-model writing reliability remains unresolved, and this run does not measure a
physical-phone cold start.

A 320px narrow-screen review also found that the `Build it` button wrapped onto two lines. The
composer now keeps the label on one line while the textarea gives up the small amount of space
needed. The same review found the run history pushed the workbench below most of the first screen.
The concise local-model and download note stays visible, while the reliability details now sit in a
collapsed disclosure with a link to this audit. A focused Playwright regression passed, and a fresh
320px screenshot confirms the workbench and its example appear sooner with no horizontal overflow.
This verifies responsive composer behavior, not the actual-phone model cold start.

## Local 3B comparison, October 14

I downloaded the MLC Qwen2.5-3B profile into the local WebLLM browser cache and compared it with the
same six briefs. The first run passed 4/6 guarded drafts. One cold first request exceeded the
Builder's 75-second completion limit, and the mixed-prohibition brief returned a malformed block
name, `ledespanfull`, that the closed-set reader correctly rejected. A warm repeat passed the simple
bakery draft but failed the same mixed brief again with the same malformed name. The raw answers also
added unsupported claims and extra blocks. The [first run](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-qwen25-3b-2026-10-14.json)
and [warm repeats](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-qwen25-3b-warm-repeats-2026-10-14.json) preserve those
results.

The captured corruption has an unambiguous repair: a known component name was concatenated with the
literal `span` and a valid span value. The reader now strips only that exact suffix, recovers the
known name, and discards the attached span instead of trusting it. Other unknown names still fail
closed. The focused unit suite passed all 55 tests. A live mixed-prohibition recheck then passed 1/1,
and the complete six-brief 3B set passed 6/6 through the same visitor review. The [focused
recheck](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-qwen25-3b-parser-recheck-2026-10-14.json) and [full
run](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-draft-qwen25-3b-parser-full-2026-10-14.json) show the model output beside the
guarded result. The 3B model still added unsupported copy or malformed block names, and warm
responses took 17 to 76 seconds in this run. It does not meet the raw-writing bar or justify replacing
the shipped 1.5B profile. The local 3B comparison also does not substitute for a cold start on a
physical phone.

This closes the 3B model comparison for the current portfolio pass. The shipped 1.5B model remains
in place. Further prompt or model-size trials should wait for a different evidence-backed approach;
the remaining acceptance work is to meet the repeated raw-writing bar and measure a cold start on a
physical phone.

Checking the published plan pages also exposed a broken evidence path: relative `../audit/` links
passed repository link lint, but the static export does not publish the `audit/` directory. The
Builder plan and portfolio finish-line plan now link their audit records to public GitHub source
files. Earlier targets returned HTTP 200; the four new 3B reports will be checked after this update
is published.

## Structure selection with source-built copy, October 14

The 1.5B model kept inventing claims after prompt, temperature, and model-size comparisons. I changed
the job instead of continuing to ask it for prose it could not keep grounded. The local model now
chooses registered block names and their order. The application ignores every model copy field and
builds visible text only from phrases in the visitor's brief. It leaves unsupported fields blank,
removes sample claims from AI-composed blocks, and lets the visitor fill or edit each field before
approval. JSON mode remains on, but the Builder does not use schema-guided decoding: the pinned
WebLLM runtime rejected a sampled token during a constrained-schema trial, and that failure would
have forced a fallback instead of a reviewed draft.

I corrected the live audit wrapper after finding that it had dropped the optional schema argument,
which meant earlier constrained-schema measurements did not reach the model. The follow-up
structure-only run used the real JSON-mode path. All twelve reviewed drafts passed across two warm
runs of the same six briefs. The review preserved requested names, descriptions, titles, exact
phrases, and prohibitions. The raw response usually contained only block names; both pottery
responses still included unsupported text fields with generated claims. The Builder ignored those
fields, and they did not appear in the review or canvas. This is evidence for the visitor-facing
source-built path. It does not establish reliable model-written copy, which the Builder no longer
uses. The [raw and reviewed captures](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-structure-only-2026-10-14.json)
preserve the distinction.

The review now shows blank text fields when a brief does not supply copy, and visitors can fill them
before approval. Browser tests cover the structure-only prompt, source-built copy, blank fields,
visitor edits, and a raw model response containing markup. The model's markup is discarded; visitor-
entered markup remains literal text. The Builder now has repeatable evidence for the parts it uses:
block selection and order come from the local model, while visible copy comes from the brief or the
visitor. A physical-phone cold-start measurement remains open.

The structure-only change shipped to `main` as `875d80e`. The full serial browser suite passed all
433 cases, including the 148-route desktop and phone viewport crawl; all 738 unit tests, typecheck,
link lint, lint baseline, and the hosted CI jobs passed. The Pages deployment completed, and the live
Builder route returned HTTP 200 with the updated structure-only explanation. The 35-screen visual
gallery was refreshed, and the Builder desktop capture was inspected. This release does not close
the handset check: the available browser surfaces are desktop, and this machine has no connected
phone or iOS simulator. When a handset is available, start with an uncached browser profile and
record the selected model, transferred bytes, model-load time, first generation time, memory
pressure, and whether the page remains usable during loading.

## Repeated live edit check, October 14

I repeated the seven edit and refusal scenarios three times against the live Qwen2.5-1.5B WebGPU
profile. All 21 reviewed outcomes passed: relative and explicit-ID deletion, a named-block width
change, an ID-based width change, a named-block move, an ID-based move, and refusal of a copy edit.
The raw model returned an unusable null action for several explicit requests, including both
deletions in all three runs. In those cases the Builder derived a request-based proposal from the
visitor's unambiguous words, identified its source in the review panel, and applied it only after
approval. The result supports this bounded, review-first edit set. It does not show that the model
reliably interprets those instructions by itself or that it handles broader paraphrases. The
[three-run capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-repeats-2026-10-14.json)
keeps each raw answer beside its reviewed outcome. The 1.5B profile was already cached, so these runs
do not measure a cold start or phone performance.

## Two edit paraphrases, October 14

I expanded the request-based recovery grammar for two explicit alternatives: “get rid of the final
card” and “let the callout span the whole row.” Recovery still requires exactly one supported
operation and one unambiguous live target, rejects missing or ambiguous targets, and refuses negative
phrasing such as “avoid getting rid of the final card.” A recovery is only a proposal; it does not
change the page until the visitor approves it.

Three separate warm WebGPU runs on Qwen2.5-1.5B passed both scenarios, for 6/6 reviewed outcomes.
The model returned `action: null` in every case. The Builder recovered the requested operation from
the visitor's sentence, disclosed that the model had not supplied a usable edit, and waited for
approval. This is evidence for these two guarded phrasings, not for model understanding or broad
paraphrase reliability. The [combined capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-paraphrase-repeats-2026-10-14.json)
preserves the raw answers and resulting canvases. The focused reasoner suite passed 38 tests, the
390px mobile end-to-end check passed, and all 75 Builder browser scenarios passed. The full project
suite passed 740 unit tests; typecheck, link lint, and the lint ratchet passed at the existing
baseline. The broader paraphrase question and cold start on an actual phone remain open. A fresh
check found no attached Android handset, no phone or tablet in the USB inventory, and no available
`simctl` for an iOS simulator.

## Three additional edit phrasings, October 14

I added guarded recovery for “take out the callout,” “let the callout fill the whole row,” and “shift
the callout up.” Each request still needs one supported action and one unambiguous live target, and
the proposal remains subject to approval. Ambiguous blocks and negative requests do not recover to
an edit.

Three separate warm WebGPU runs passed all nine reviewed outcomes. The model returned no usable
action for each removal and width request. For “shift the callout up,” it returned no usable action
in the first run and the correct move in the next two. This records the application’s guarded
visitor flow, not a claim of reliable model interpretation. The [combined capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-extended-paraphrase-repeats-2026-10-14.json)
keeps each raw answer beside the canvas. The reasoner suite passed 40 tests, all 742 project unit
tests passed, all 75 Builder browser scenarios passed, typecheck passed, link lint found no dead
relative links, and the lint ratchet stayed at its existing baseline. These examples broaden the
measured set; natural-language coverage and the actual-phone cold start remain open.

## Two more edit phrasings, October 14

I added “discard the final card” and “nudge the callout down one step” as held-out requests. The
1.5B model returned no usable action on all six repeated runs for these two requests; guarded
recovery proposed the correct target and operation each time, and all six edits passed after explicit
approval. The same run showed that the model handled “stretch the callout to full width” directly.
Negative and ambiguous variants stayed refused, and the canvas did not change before approval. The
[live capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-holdout-recovery-2026-10-14.json)
records each raw answer and reviewed result. The reasoner suite passed 42 tests and the Builder
browser suite passed all 76 cases. Typecheck passed, link lint found no dead relative links, and the
lint ratchet remained at its existing baseline. This adds three measured phrasings; broader
natural-language coverage and the physical-phone cold start remain open.

## Ordinal and span wording, October 14

Two more held-out requests checked “delete the intro” and “shrink the callout to a third width.”
The 1.5B model declined deletion in all three warm runs, and the reviewed recovery removed the
intro each time. It handled the third-width request directly in all three runs. The first attempt
exposed a guard bug: “third” in the width value was read as a block ordinal, so the valid span
proposal was rejected. The [baseline capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-secondary-holdout-baseline-2026-10-14.json)
preserves the failure; the [six-run recheck](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-secondary-holdout-repeats-2026-10-14.json)
keeps each raw answer beside the resulting canvas. Ordinals now count as targets only when they
qualify a block name, and “shrink” and “reduce” are recognized when the requested width is explicit.
A browser regression verifies the proposal, unchanged
canvas before approval, and the applied deletion and third-width span at 390px. The reasoner suite
passed 43 tests, the full unit suite passed 745, and all 77 Builder browser cases passed. This extends
the measured language set; broader coverage and the actual-phone cold start remain open.

## Erase and reposition wording, October 14

The next holdout tested “erase the final card” and “reposition the callout down one step.” The
1.5B model returned no usable action in all six warm runs. Guarded recovery proposed the intended
remove or one-step move each time, and the visitor-facing canvas changed only after approval. The
[baseline capture](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-third-holdout-baseline-2026-10-14.json)
preserves the two declines, and the [six-run recheck](https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/builder-edit-fourth-holdout-repeats-2026-10-14.json)
records each recovery and resulting canvas. Unit tests reject negative or ambiguous versions, and a
390px browser test covers the two edits in review order. The reasoner suite passed 45 tests, the full
unit suite passed 747, and all 78 Builder browser cases passed. Typecheck, link lint, the lint gate,
and Oxlint completed successfully. These two phrasings extend the measured set; language coverage
outside it and an actual-phone cold start remain open.

## Content-field requests stay out of block edits, October 14

Negative-case review found that “remove the price from the card” and “move the price down in the
card” could be routed as structural block edits. Follow-up probes found the same issue with a
subtitle, CTA, image, pricing line, copy length, and tone. The copy-edit guard recognizes those
fields across possessives, block-first phrases, terse commands, insertions, and moves. It leaves
layout requests such as “move the card down in the price section” available. Unit tests cover these
distinctions, and the browser test confirms that content requests stop before a model call and leave
the canvas unchanged. The full unit suite passed 763 tests, the Builder browser suite passed all 78
cases, and typecheck passed. This does not add an operation for editing existing block copy.

## Copy and target routing recheck, October 14

A broader prompt matrix found two more routing defects. Possessive or block-first requests such as
“remove the card's price,” “set card title to Cafe,” and “move the image to the top card” could reach
the block model or fall through to page creation. Page briefs such as “Build a product page with the
title, a short description, and two cards” could be mistaken for edits because the router found a
later block noun after “the title.” The router now checks for a copy field tied to a block, handles
explicit copy-edit commands with or without a block noun, and requires the definite article or
ordinal to qualify the block itself. It also recognizes terse block commands and ordinal references
such as “the ninth card,” so an absent target is refused instead of treated as a new page. Paired
tests keep “remove a card,” actual layout requests, and new-page briefs on their intended paths.
The full unit suite passed 818 tests, all 79 Builder browser cases passed, typecheck and lint passed,
and link lint found no dead relative links in 56 rendered files. The hosted release checks are
recorded below. These examples do not establish broad language coverage or a cold start on physical
phone hardware.

## Done means

The current browser model can choose a useful page structure from a visitor's brief and complete the
agreed edit scenarios against the live page. Code builds visible copy only from the visitor's source
phrases, and the visitor can review or change it before approval. Every unsupported operation refuses
without changing the canvas or claiming success. The static export still composes and previews
without a server. A visitor can inspect the outcome, revise it, and export it without leaving the
portfolio. The live-model results and their limits are recorded beside the tests, so the page's
claims stay tied to evidence.

## Qwen3 local comparison, October 14

The locally run Qwen3-1.7B profile completed five guarded Builder scenarios. The final visitor-facing
outcome passed each case, but “drop the second card” first produced the wrong raw target, b2; the
Builder's correction and review path changed the proposed removal to b4. The other removal,
whole-row span, repositioning, and unsupported-copy refusal cases passed. Action responses took
about 19 to 54 seconds. This small comparison does not establish a speed or quality improvement over
the shipped Qwen2.5-1.5B profile, so the profile remains unchanged. The local capture lives in the
ignored .cache/desk-audit/report-builder-qwen3-1.7b-local.json file and is not a published audit
artifact.

## Current release and phone-width review, October 14

The latest functional Builder changes are on main at 47d1f55. Hosted CI passed typecheck, all
818 unit tests, the lint count, and all 438 browser cases. The Pages build and deployment succeeded.
The Builder and Plans routes return HTTP 200 after redirects. Locally, all 79 Builder browser cases
passed, and link lint found no dead relative links in 56 rendered files. The content-edit guard now
covers field edits, insertions, moves, possessives, terse commands, and copy-only targets while paired
tests confirm that new-page briefs still compose. The visual gallery has a
390 by 844 pixel Builder capture; all 36 portfolio captures were refreshed and the phone-width view
was inspected. The prompt, download disclosure, example, and preview are visible in that capture.
The existing 320-pixel browser case checks for horizontal overflow. A production browser smoke at
390 by 844 loaded the Builder with HTTP 200, showed the page heading, composer, and canvas, measured
a 390-pixel document width, and logged no page errors. This browser review satisfies responsive
layout acceptance. Phone-specific model startup and generation performance remain unmeasured and
are a separate follow-up only if the portfolio sets a device-specific performance target.

## Copy-field routing follow-up, October 14

Commit 86bc4d9 closes another set of prompt-routing gaps found during the Qwen comparison review.
The Builder now recognizes direct copy-field requests such as removing a title, moving an image to
the top, resizing a title, or writing a title as edits against the current page, so unsupported
copy edits are refused before a model call. New-page briefs that mention a title, menu, or callout
remain page compositions. The full suite passed 824 unit tests, all 79 Builder browser cases passed,
typecheck and lint passed, and link lint found no dead relative links across 56 rendered files.
Hosted CI passed all 438 browser cases, the unit suite, typecheck, and the lint baseline; the Pages
build and deploy succeeded. The Builder and Plans routes both returned HTTP 200 after deployment.
The locally run Qwen3-1.7B profile remains a comparison only; the shipped profile is unchanged.

## Negated edit contractions, October 14

A targeted safety probe found that “I can't remove the callout” and “I shouldn't remove the callout”
could be recovered as deletion requests, even though the guard already refused “don't remove the
callout.” A second probe found that “Should I remove the callout?” also became a deletion proposal.
Follow-up probes found the same issue in “Would it be better to remove the callout?” and “Is it
better to move the callout up?” Punctuation normalization split modal contractions, and the advice
questions looked like commands. Later probes found that “What happens if I remove the callout?” and
“How would it look if I make the callout full width?” also became edit proposals, along with
questions asking for instructions, permission, or advice, such as “Can I remove the callout?” and
“Would it help to move the callout up?”
The recovery guard now refuses common negative modal contractions and advice, information, permission,
and hypothetical questions while still accepting direct polite commands. Unit tests check nine contraction
forms and the question examples across both recovery and correction. The 390 by 844 browser test
submits three negated requests and sixteen questions after a scripted model refusal, then confirms that
no proposal appears and the canvas remains unchanged. A second browser case returns valid remove,
width, and move commands for six question-shaped prompts; the Builder refuses every command and
preserves the canvas. The focused reasoner suite passed 51 tests, the full unit suite passed 830 tests across
45 files, and all 81 Builder browser cases passed. TypeScript checking passed. These scripted checks do not establish how the live model interprets the phrases. Broad natural-language reliability remains open. The 390px browser review satisfies
responsive layout and visitor-flow acceptance. Phone-specific model startup and generation
performance remain unmeasured and are separate evidence only if the portfolio sets a device-specific
performance target. See the
[run report](https://github.com/tjakoen/tjakoen.github.io/blob/main/artifacts/runs/2026-10-14-builder-negated-modal-recovery.md).

## Passive and recommendation question forms, October 14

A follow-up probe found five gaps in the question guard: “Should the callout be removed?”, “Can the
callout be removed?”, “How can the callout be removed?”, “Would you recommend removing the callout?”,
and “Would the callout look better at full width?” The guard now catches these passive and
recommendation forms at the proposal boundary. The reasoner suite passed all 51 cases, and the
390 by 844 browser regression confirmed these questions produce no proposal even when the scripted
model returns valid commands. This closes the identified question-form gaps. Broad natural-language
reliability remains open because a scripted model cannot establish how the live model handles other
wordings.

## Structured build responses, October 14

The build path now submits a closed response schema that permits only registered block names and
supported span values, with no generated copy fields. The six-scenario live matrix completed twice:
all 12 raw responses matched the schema, and all 12 reviewed drafts passed. The model still chose an
extra card for the intro-only negative-anchor and mixed-prohibition briefs. The Builder removed that
block before review, including in a four-run follow-up after clarifying the prompt. This closes the
raw-copy-field failure seen in the earlier run, but it does not close the raw structural-reliability
acceptance criterion. Keep draft review visible while broader composition reliability remains open.
The [matrix](../audit/builder-structured-composition-schema-live-2026-10-14.json),
[exclusion recheck](../audit/builder-structured-composition-exclusion-recheck-2026-10-14.json), and
[run report](../artifacts/runs/2026-10-14-builder-structured-composition-schema.md) record the
evidence and limits.
