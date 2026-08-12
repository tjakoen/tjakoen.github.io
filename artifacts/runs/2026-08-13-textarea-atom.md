---
title: The design system draws a textarea, and a refusal comes out of the demo
date: 2026-08-13
status: complete
lane: gated
branch: main
scope:
  - ../grain/packages/grain/components/atoms/b-textarea/
  - ../grain/packages/grain/components/atoms/b-memo/
  - ../grain/packages/grain/components/form-from-data.test.ts
  - ../grain/packages/grain/plans/form-from-data.md
  - src/
  - content/data/
  - content/tours/
  - view/
  - e2e/
touched:
  - ../grain/packages/grain/components/atoms/b-textarea/b-textarea.html
  - ../grain/packages/grain/components/atoms/b-textarea/b-textarea.css
  - ../grain/packages/grain/components/atoms/b-textarea/b-textarea.md
  - ../grain/packages/grain/components/atoms/b-memo/b-memo.html
  - ../grain/packages/grain/components/atoms/b-memo/b-memo.md
  - ../grain/packages/grain/components/form-from-data.test.ts
  - ../grain/packages/grain/plans/form-from-data.md
  - src/ai/field-matcher.ts
  - src/ai/field-matcher.test.ts
  - src/ai/builder-page.ts
  - src/ai/builder-page.test.ts
  - src/ai/form-draft.ts
  - src/ai/desk-reasoner.ts
  - src/ai/desk-reasoner.test.ts
  - src/contact-form.test.ts
  - src/server.ts
  - content/data/contact-form.json
  - content/tours/review-form-from-data.md
  - content/tours/review-builder-demo.md
  - view/pages/about.html
  - view/pages/builder.html
  - e2e/about.e2e.ts
  - e2e/desk-form-build.e2e.ts
  - e2e/visual.e2e.ts-snapshots/catalog-darwin.png
  - artifacts/reviews/2026-08-13-review-form-from-data/
  - artifacts/reviews/2026-08-13-review-builder-demo/
skills:
  - loop-standard
  - tour-standard
  - voice
plans:
  - form-from-data section 5 item 1, the textarea atom | ../grain/packages/grain/plans/form-from-data.md
gates:
  - bun test (grain) | 592 pass, 0 fail, 1609 expect() calls, 65 files
  - bunx tsc --noEmit (grain) | exit 0, no output
  - bun run check (portfolio) | tsc --noEmit, exit 0, no output
  - bun test (portfolio) | 426 pass, 0 fail, 1616 expect() calls, 27 files
  - bunx playwright test e2e/about.e2e.ts | 18 passed (4.4s)
  - bunx playwright test e2e/desk-form-build.e2e.ts | 4 passed (9.5s)
  - bunx playwright test (full suite, before the re-bless) | 1 failed (catalog baseline), 1 skipped, 239 passed
  - bunx playwright test (full suite, after the re-bless) | 1 skipped, 240 passed (1.3m)
  - bun run export | 110/110 pages, 81/81 data routes, 28 frozen modules, 69 asset files
  - bun run verify:export | sitemap every loc resolves, dead-link walk clean, OK
  - bunx crumb check content/tours | review-builder-demo 3 steps dev, review-form-from-data 4 steps dev
  - pantry capture review-form-from-data | all 4 steps resolved, verdict ok on each
  - pantry capture review-builder-demo | all 3 steps resolved, verdict ok on each
diffstat: 17 files changed in the portfolio (375 insertions, 107 deletions) plus 2 new capture folders, and 2 files changed in grain (115 insertions, 20 deletions) plus 5 new component files
dirty: everything below was uncommitted while this was written; the commits are this session's, the push is not
unpushed: 5 in the portfolio before this run and 2 in grain, and this run adds its own; pushing stays the owner's call
verifiedBy: nobody yet. Both tours are written by the author of the change, so the new steps are stamped new or needs-verification and none is stamped verified.
doctor: not run this session
---

The design system had a hole exactly the shape of an operation it already supported. field.set has
always been able to type into a textarea, because the dispatcher handles INPUT and TEXTAREA in
one branch, and .field had no rule for a textarea at all. So a page that wanted a message box had
to hand-author one with no frame, no sizes and no AI treatment, which is what the mail panel's
compose still does, and the form builder demo answered an ask for one with a refusal.

Both halves are closed. Grain has the control, and the portfolio's closed set has a message field
where the refusal used to be.

## One atom or two, and why it is two

b-textarea is the authoring-time atom and it owns the stylesheet. b-memo is the data-first
sibling and ships no CSS at all. That split is not symmetry for its own sake, it is forced twice
over.

Somebody has to declare .field__textarea, and the data-first atoms cannot: they ship no stylesheet
on purpose, so their sizes, their inline variant and their AI treatment cannot drift from the
component they mirror, and a conformance test fails the moment one of them grows a .css. That is
the division b-select already makes when it adds .field__select to a frame b-input owns. And
one atom could not have served both callers anyway: a config prop resolves from a literal attribute
on the tag, so it is identical for every item of an each, which is exactly what a per-field label
must not be. That collision is the whole reason this family is siblings rather than one clever
component.

The authoring-time need is real rather than theoretical. The compose panel on the mail page is a bare
textarea with a hand-written class today, and it is the control this atom is for.

## What the probe settled, measured rather than reasoned

Five results, produced by rendering through createRenderer and reading the output.

1. **A textarea's value is its content.** It has no value attribute, so the item's value binds
   through data-field, never data-bind-value. Bound as an attribute the browser renders a value
   it ignores, the box comes up empty, and nothing warns. Same shape of silent failure as the label
   addressing that this family already shipped once, so it is a conformance test rather than a
   comment.
2. **The address lands on the textarea.** The rule the addressing fix established holds for the new
   atom: the surface binds to the control, never to the label around it. Verified in the live page
   and asserted in both repos.
3. **Height is form-wide config.** rows rides on the tag alongside size and variant, so the
   spec carries no height at all. Without one the box comes up four lines tall, from a stylesheet
   rule composed out of the type tokens rather than a fixed number.
4. **The null contract is unchanged.** An explicit null renders an empty box quietly, a missing key
   logs an unknown-binding warning, newlines and escaping survive the content binding.
5. **A message box has no select hazard.** Any string is a legal textarea value, so unlike a choice
   there is nothing a caller can send that empties it. The warning b-choice carries does not need a
   twin here, and the demo's own draft code now fills the message box for exactly that reason.

## The refusal came out rather than being softened

field-matcher.ts refused a message box with a reason that named this missing atom by name. That
reason stopped being true, so the entry moved into the closed set as its own array rather than being
reworded where it stood. A refusal that outlives its cause is worse than no refusal, because it reads
as a considered limit rather than a stale line.

It is a separate array, not a field with a kind, for the reason the plan's section 4 already settled:
each renders one component per item and a component cannot choose which component it is. A message
goes through b-memo, a text field through b-field, so the page composes two tags.

The file upload is still refused, and the builder page now carries an example prompt that shows that
refusal, since the old one no longer produces it.

## What renders differently

- **The Contact tab has a message box**, addressed field:about-message, and Send carries what you
  wrote into the mail draft. It used to open a draft with a From line and nothing else.
- **The builder generates one**, through a third tag that never changes between runs, and the desk
  fills it the same way it fills a name. That is the part worth watching: a generated textarea is an
  AI-operable control with nothing registered by hand.
- **The catalog gained two entries**, and the baseline was re-blessed after reading the diff rather
  than before.

## The address is deliberately not the obvious one

field:contact-message belongs to the compose textarea on the mail page, and the desk resolves that
name in code and asks the live page whether a draft target is present. A second control answering to
it on the About page would make that question true on a page the draft flow never drafts on. So the
About message box is field:about-message, which is also the convention the builder's own surfaces
follow. An existing test guarded that collision, and it still does.

## The re-bless, and what was read before blessing it

The catalog grew by 2807 pixels. Read before accepting: the first 9949 rows are pixel-identical, the
memo section is new and 1268 pixels tall exactly where the atoms sort alphabetically, the textarea
section accounts for the rest, and the last 4000 rows of the page are pixel-identical to the old
baseline. Between the two insertions, some text lines differ by a single pixel of vertical rounding,
which is what an inserted section does to the reflow below it and not a layout break. That is the
whole claim the re-bless makes.

## What was NOT done

- **Nothing was pushed or published.** Both repos are committed and held. Grain stays at 0.1.22
  rather than bumping, because 0.1.22 was never published: burning a version number for an
  unpublished one would leave a gap for no reader.
- **The wording seam is still not wired.** applyWording handles the message box now and no page
  calls it, exactly as before.
- **The live model audit was not run.** The desk audit's form-build scenario is unchanged and still
  never executed.
- **The remaining four .field gaps are untouched:** checkbox and radio, hint and error, a required
  marker, a form grid.
- **The b-list defect the earlier pass recorded is still there.**
- **A catalog nit was found and left:** the catalog renders a component doc's intro as one paragraph
  and does not linkify a relative markdown link, so [Textarea](../b-textarea/b-textarea.md) shows
  its own syntax on the page. Both new docs match their siblings rather than working around it. A
  related one: a ## section with prose and no html fence renders as an empty heading, which
  b-choice.md does today. The new docs avoid it; fixing b-choice was out of scope.

## What needs human eyes

1. **The name b-memo.** It is the role name the family uses, and b-message would have sat beside
   chat-message and read as its sibling. Cheap to change while nothing is published, and the About
   tour asks it as its own question.
2. **Two atoms rather than one.** The argument is above; the cost is a second component documenting
   the same control, which is the same cost b-input and b-field already carry.
3. **The re-blessed catalog baseline**, which always deserves a second pair of eyes.
4. **Whether the About form is now the better draft target than the mail panel.** The desk still
   navigates to the mail page to draft a message, and there is now a message box on the About page it
   walks the visitor away from. Nothing is broken; it is a routing decision that reads oddly.

## The walk

Both tours are written by the author of the change, so nothing in them is stamped verified. Walk them
against a local server on port 3000:

```
http://localhost:3000/about?crumb=review-form-from-data&crumb-mode=dev&crumb-frame#contact
http://localhost:3000/builder?crumb=review-builder-demo&crumb-mode=dev&crumb-frame
```

The captures are in artifacts/reviews/2026-08-13-review-form-from-data/ and
artifacts/reviews/2026-08-13-review-builder-demo/, 4 of 4 and 3 of 3 steps resolved.

## Publishing, unchanged from the previous run

The bundle still ships as one thing, and it now carries three atoms plus the message field rather
than two atoms plus a refusal. The order is the release flow's own:

```
cd ../grain && git push && cd packages/grain && npm publish
cd ../../../tjakoen.github.io
rm node_modules/@tjakoen/grain && bun update @tjakoen/grain     # drops the symlink for the real thing
bun test && bun run export && bun run verify:export             # the preflight proves the atoms arrived
git push
```

The symlink is still the thing to remember: node_modules/@tjakoen/grain points at the grain working
tree, with the installed 0.1.21 parked beside it as .grain-0.1.21-npm. Until that is a real install,
a green gate here says nothing about the published package. The component preflight would now name
b-memo as well, which is the check working rather than a new problem.
