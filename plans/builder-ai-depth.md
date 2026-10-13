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
blocks and URL. Generated markup remains text in the review panel. The 69-case Builder browser suite
covers review, text edits, acceptance, discard, escaped text, offline builds, and the existing edit
path, including the disclosed recovery when a model declines a clear command. This makes model output
inspectable and correctable before it changes the page. A fresh 1.5B draft-only repeat again omitted
Utrecht and added unsupported claims. The review panel now places the original brief beside the
editable draft, but repeated model runs are still needed before generated copy can be called grounded.

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
- [ ] Improve the model's edit choices using the live manifest and the block IDs already visible on
      the page. The prompt contains only live block actions and identifies each block's type and
      order. A portfolio-side parser accepts the measured `move` alias only for a live block and
      valid direction. The local completion receives a schema derived from live block IDs, edit
      verbs, and payload values. When a model's proposed action, value, or target conflicts with one
      edit uniquely stated by the request, the review proposal discloses both choices and uses the
      requested edit only after approval; missing targets are refused, while ambiguous references
      stay with the model proposal for human review. The October 13 focused check applied both
      deletion requests through this path, but the model still chose the first card for a request to
      remove the second. This was a safe application-level correction, not evidence of reliable model
      targeting. The 0.5B full run scored 2/8, and the 1.5B runs varied. A full eight-case recheck
      after the target correction scored 6/8: both deletions failed, one at the 60-second timeout and
      one with `action: null`. The timeout then increased to 75 seconds. The next full run also scored
      6/8 after the relative deletion's wrong span operation and target were corrected in review; the
      explicit-ID deletion returned `action: null`, and the draft again omitted Utrecht. The Builder
      then gained a disclosed, command-based recovery when the model declines a request that names
      one supported operation and live target. Recovery still waits for the same approval and canvas
      revalidation as a model proposal. The latest eight-case 1.5B run scored 7/8: both deletion
      requests applied, with the relative request corrected in the proposal and the explicit-ID
      request proposed by the model. Width, move, and copy-edit refusal cases passed. The draft again
      omitted Utrecht and included unsupported marketing claims. This improves the reviewed workflow,
      but does not establish grounded writing. Repeated runs remain necessary.

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
- [x] Make the narration a projection of validated operations and observed canvas changes. The page
      waits for approval, revalidates the choice, and reports an edit as applied only after the
      observed canvas matches it. The focused browser suite covers the unchanged, canceled, stale,
      and applied states.
- [x] Give the builder a small set of examples that demonstrates composing and then revising a real
      GRAIN page, including one honest refusal. The first-screen link opens a four-block page; the
      rail then offers a prompt for the measured `move b3 up` edit and a copy-edit refusal. The buttons
      prefill only, and the 69-case Builder browser suite verifies the flow and unchanged canvas on
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
      The 69-case Builder suite covers this flow, including markup-like copy rendered as text. A
      human still has to check accuracy because the local model can omit facts and invent claims.
- [x] Make the draft review show which fields use component sample text and which contain model
      copy. For generated text, list meaningful words absent from the brief and update that list as
      the visitor edits the field. This is a lexical comparison, not a check that the resulting
      claims are true. Unit and browser checks cover generated copy, sample copy, and edited copy.
- [ ] Finish the model comparison by measuring cold start on phone
      hardware, then improve the grounded draft. The 0.5B scored 2/8 in each of two October 11 runs;
      the 1.5B scored 6/8 in one separate run, but failed both removal cases and added unsupported
      flourishes to its draft. It scored 6/8 and 5/8 in two October 12 runs, with different passing
      cases. A warm draft repeated the supplied city but added unsupported phrases; another omitted
      the city. A stricter prompt was tested and reverted after it also missed the city. One October
      12 edit reached the 45-second completion limit, so the portfolio allowed 60 seconds; a later
      full run still timed out on its first deletion, so the limit now allows 75 seconds; the
      fresh-server run avoided that timeout but took 50 seconds and refused the wrong target. The
      October 13 1.5B run passed width and move edits but failed both deletion cases and again
      omitted Utrecht while adding unsupported draft claims. A later warm WebGPU check scored 1/3
      after adding schema-constrained edit output: explicit `drop b4` passed, relative deletion still
      targeted b2, and the draft still omitted Utrecht. Its corrected audit harness scores proposed
      copy before acceptance. This isolated result does not establish a quality improvement. The
      transparent target correction then let both deletion cases apply through review, while the
      draft still omitted the city. This focused 2/3 result demonstrates target reconciliation, not a
      model-quality improvement. A full eight-case run then scored 6/8: both deletions failed, one
      after 60 seconds and one with `action: null`; the draft included the supplied facts but added
      unsupported claims. The timeout then increased to 75 seconds. A later full run scored 6/8,
      after which the declined exact-ID case gained a disclosed, approval-gated recovery. The latest
      full run scored 7/8: the relative deletion's wrong verb and target were corrected in the
      proposal, the explicit-ID deletion applied as proposed, and the draft again omitted Utrecht.
      The audit records each correction beside the raw answer. Repeated grounded-draft measurements
      remain open.
      The October 11 first scenario took
      40.5 seconds from a fresh browser cache, including model load and generation; the 1.6 GB
      browser-profile footprint is not a network-size measurement. Exact first-visit network bytes
      are now recorded in the October 12 cold-download measurement below. Phone hardware remains
      unmeasured. Keep copy review visible and do not promise reliable
      natural-language page writing until it passes repeated measured cases.
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

## Done means

The current browser model can build a useful first draft from a visitor's brief and complete the
agreed edit scenarios against the live page. Every unsupported case refuses without changing the
canvas or claiming success. The static export still composes and previews without a server. A
visitor can inspect the outcome, revise it, and export it without leaving the portfolio. The
live-model results and their limits are recorded beside the tests, so the page's claims stay tied to
evidence.
