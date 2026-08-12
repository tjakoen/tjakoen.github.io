---
title: A form comes from a data file, a description builds one, and the AI half turned out not to be free
date: 2026-08-13
status: complete
lane: gated
branch: main
scope:
  - content/data/
  - content/tours/
  - src/
  - view/
  - e2e/
  - tools/desk-audit.ts
  - ../grain/packages/grain/plans/form-from-data.md
touched:
  - content/data/contact-form.json
  - content/tours/review-form-from-data.md
  - content/tours/review-builder-demo.md
  - src/ai/field-matcher.ts
  - src/ai/builder-page.ts
  - src/ai/form-draft.ts
  - src/ai/actions.ts
  - src/ai/desk-reasoner.ts
  - src/ai/desk-door.ts
  - src/server.ts
  - view/pages/builder.html
  - view/pages/about.html
  - view/components/pages/builder/builder.css
  - view/components/pages/about/about.css
  - view/components/molecules/builder-refusal/builder-refusal.html
  - view/components/organisms/portfolio-frame/portfolio-frame.html
  - e2e/desk-form-build.e2e.ts
  - e2e/about.e2e.ts
  - e2e/visual.e2e.ts-snapshots/catalog-darwin.png
  - tools/desk-audit.ts
  - artifacts/reviews/2026-08-12-review-form-from-data/
  - artifacts/reviews/2026-08-12-review-builder-demo/
  - ../grain/packages/grain/plans/form-from-data.md
skills:
  - loop-standard
  - tour-standard
  - voice
plans:
  - form-from-data section 8, the builder demo | grain/packages/grain/plans/form-from-data.md
gates:
  - bun run check | tsc --noEmit, exit 0, no output
  - bun test | 412 pass, 0 fail, 1574 expect() calls, 26 files
  - bunx playwright test e2e/desk-form-build.e2e.ts | 3 passed (8.8s)
  - bunx playwright test (full suite, first run) | 3 failed, 1 skipped, 235 passed (1.4m)
  - bunx playwright test (full suite, after the three were fixed) | 1 skipped, 238 passed (1.2m)
  - bun run export | wrote dist, /builder in the sitemap, both tours exported to dist/crumb/tours/
  - bun run verify:export | sitemap every loc resolves, dead-link walk clean, OK
  - bunx crumb check content/tours | review-builder-demo 3 steps dev, review-form-from-data 3 steps dev
  - pantry capture review-form-from-data | all 3 steps resolved, verdict ok on each
  - pantry capture review-builder-demo | all 3 steps resolved, verdict ok on each
diffstat: 24 files changed across the portfolio (10 tracked modified, 14 new), plus 1 file in grain (the plan only, never a component)
dirty: everything below is uncommitted at the time of writing; the commit is this session's, the push is not
unpushed: 1 before this run, and this run adds its own commits; pushing stays the owner's call
verifiedBy: nobody yet. The tours are written by the author of the change, so every step is stamped new or needs-verification and none is stamped verified.
doctor: not run this session
---

Three things shipped, in the order the plan asked for: a real form on a real page built from a
committed JSON spec, a deterministic matcher that turns a description into that spec, and the
the builder page, where the desk builds a form and then fills the one it just generated. The atoms
came from grain commit 36a8299, which is committed and deliberately unpushed, so the portfolio
resolves grain through a local symlink for the whole of this work.

**The headline finding is that the plan's central claim was wrong, and building it is what found
it.** Section 1 result 3 says a generated field carries its own address, so the AI half comes free.
The binding does exactly what the probe said. The conclusion does not follow. Both atoms put
the surface binding on the wrapping label, so a generated field's address resolves to a label,
and grain's dispatcher gates a fill on a check that the target has a value at all. A label has no value. Measured in the live
page: all three addresses on the About page resolve to a label element, and the guard is false for every one, so
the desk cannot fill a single generated field. This is recorded in the grain plan under "What
building it contradicted" and it is the first thing that needs a human decision.

**The second finding is worse in kind, and it is why the workaround is narrow.** The same guard
passes on a select, and assigning a select any string that is not one of its option values sets
its value to the empty string. The control goes blank and nothing warns. So the builder page relocates a
field's address down onto its own control for text inputs only, and leaves a choice's address on its
label, where a stray write resolves to something unwritable and no-ops instead. Inert beats silently
destructive. That is now asserted in the e2e rather than described in a comment: no select on the
page carries an address, and the choice's label still does.

**What I changed in review, after the build.** The page claimed the model composes the wording. It
does not, anywhere on this page: the labels are the closed set's own and the demo values the desk
fills in are drafted by code, because an action the desk performs never gets a model tail. The claim
was rewritten to say what actually happens, and the wording seam is named as an open seam rather than
a shipped feature. The build trigger also fired on questions, so "how did you build this form" would
have navigated away from someone who asked to be told something; it now excludes leading
interrogatives while keeping the polite openers, because "can you build me a form" is a request and
the catalog's navigation verbs settled that argument once already.

**The full suite went red, and it went red for an honest reason.** Two About page tests asserted that
no form exists on that page, because Mail used to own the one send path. That design decision changed
by the owner's call this session, so the tests were updated to assert the invariant that survived:
exactly one form, rendered from the spec, with no action and no method, handing off to a mail client
rather than posting. The third failure was the catalog visual baseline, which grew because grain
gained three components. It was re-blessed deliberately, and the diff was read first: the top of the
page is unchanged and everything below the insertion point is shifted, which is the signature of
added content rather than a layout break.

## What was not done

- **The live model audit was not run.** The desk audit harness gained a form-build-det scenario, and
  it has never been executed, because it needs a real GPU run the owner drives. The scenario is
  written and untested. Do not read it as a passing scenario.
- **The wording seam is not wired.** The wording function exists, is unit-tested, and no page calls it.
- **Nothing was pushed or published.** Grain stays unpushed with its atoms, per the owner's hold, and
  the portfolio cannot consume them from npm until that changes.
- **The five open questions in the plan's section 9 stay open**, including whether the textarea atom
  jumps the queue, which is the one this work kept running into.
- **No grain component source was touched.** The label addressing is recorded in the plan and left
  for the owner to decide.
- **The b-list defect recorded in the plan is still there**, untouched and out of scope.

## What needs human eyes

1. **The label addressing.** Three ways to close it: move the binding onto the control in each atom,
   guard the dispatcher against an unwritable target, or leave every consuming page carrying the
   workaround. The tour asks this as its own question.
2. **Whether the model should compose the labels at all**, or whether the demo ships as selection
   only and says so, which is what it does today.
3. **The two forms on the site now.** About has one and the builder generates them. Whether both
   stay is a content decision, not a code one.
4. **The re-blessed catalog baseline.** A re-bless is a claim that the change was intentional, and it
   deserves the second pair of eyes that a re-bless always deserves.

## The walk

Both tours are written by the author of the change, so nothing in them is stamped verified. Walk them
against a local server on port 3000:

```
http://localhost:3000/about?crumb=review-form-from-data&crumb-mode=dev&crumb-frame#contact
http://localhost:3000/builder?crumb=review-builder-demo&crumb-mode=dev&crumb-frame
```

Each ends with a question card that composes the answers into a prompt, so the calls above can be
made in the walk rather than in chat.
