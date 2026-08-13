---
title: A form comes from a data file, a description builds one, and the AI half turned out not to be free
date: 2026-08-13
status: complete
lane: gated
branch: main
scope:
  - content/data/
  - content/tours/
  - artifacts/runs/
  - artifacts/reviews/
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
  - bun test (after the preflight landed) | 420 pass, 0 fail, 1585 expect() calls, 27 files
  - bun run export (published grain swapped in, proving the guard) | 4 unresolved refs, FAILED before starting the server, nothing written
  - bun test (grain, at 0.1.22) | 317 pass, 0 fail, 973 expect() calls, 38 files
  - bunx tsc --noEmit (grain) | exit 0
  - bun test (grain, after the atom fix) | form-from-data conformance 6 pass, 0 fail
  - bun test (portfolio, after the atom fix) | 420 pass, 0 fail, 27 files
  - bunx playwright test (full suite, after the atom fix) | 1 skipped, 238 passed (1.3m)
  - bun run export + verify:export (after the atom fix) | preflight resolved, wrote dist, verifier OK
  - pantry capture, both tours re-run after the fix | 3 of 3 steps resolved on each, verdict ok
diffstat: 24 files changed across the portfolio (10 tracked modified, 14 new), plus 1 file in grain (the plan only, never a component)
dirty: everything below is uncommitted at the time of writing; the commit is this session's, the push is not
unpushed: 14 | portfolio 7, grain 7; pushing stays the owner's call and the publish is held so the atoms and the demo ship as one bundle
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

## Gate output

```
$ bun run check
$ tsc --noEmit

$ bun test
 420 pass
 0 fail
 1585 expect() calls
Ran 420 tests across 27 files. [2.60s]

$ bunx playwright test
  1 skipped
  238 passed (1.3m)

$ bun run export
[export] preflight: every component the templates reference resolves
[export] wrote /Users/tjakoenstolk/Local/Development/bread-repos/tjakoen.github.io/dist

$ bun run verify:export
[verify-export] sitemap.xml: every <loc> resolves to a real file, all trailing-slash canonical
[verify-export] dead-link walk: every internal href/src across the exported HTML resolves
[verify-export] OK

$ bunx crumb check content/tours
✓ review-builder-demo — 3 step(s), dev
✓ review-form-from-data — 3 step(s), dev

$ bun ../pantry/cli.ts capture review-form-from-data --preview http://localhost:3000
All 3 steps resolved.

$ bun ../pantry/cli.ts capture review-builder-demo --preview http://localhost:3000
All 3 steps resolved.

# the guard, proved by making it fail: published grain swapped in for the symlink
$ bun run export
[preflight] 4 unresolved component reference(s):
  ✗ <b-field> is used by view/pages/builder.html and no component root has it
  ✗ <b-choice> is used by view/pages/builder.html and no component root has it
  ✗ <b-field> is used by view/pages/about.html and no component root has it
  ✗ <b-choice> is used by view/pages/about.html and no component root has it
[export] FAILED before starting the server — nothing was written to dist/

# grain, at 0.1.22 with the addressing fix
$ bun test
 317 pass
 0 fail
 973 expect() calls
Ran 317 tests across 38 files. [716.00ms]

$ bunx tsc --noEmit
```

## What was not done

- **The live model audit was not run.** The desk audit harness gained a form-build-det scenario, and
  it has never been executed, because it needs a real GPU run the owner drives. The scenario is
  written and untested. Do not read it as a passing scenario.
- **The wording seam is not wired.** The wording function exists, is unit-tested, and no page calls it.
- **Nothing was pushed or published.** Grain is bumped to 0.1.22 and committed, and both the push and
  the publish are left for the owner, because an outward-facing action is a hard stop rather than a
  lane. The runbook above is the whole of what is left.
- **The five open questions in the plan's section 9 stay open**, including whether the textarea atom
  jumps the queue, which is the one this work kept running into.
- **No grain component source was touched.** The label addressing is recorded in the plan and left
  for the owner to decide.
- **The b-list defect recorded in the plan is still there**, untouched and out of scope.

## Measured after the report was written: what main now depends on

The commit above is on main and it needs a grain that is not published. I swapped the symlink back to
the installed 0.1.21, started the server, and read what happens. It does not fail. That is the
problem.

Both pages answer 200. Nothing is logged, no warning, no thrown component. The unknown tags pass
straight through to the browser, so the Contact tab renders its heading, its copy telling a visitor to
fill the fields in, a Send button, and zero fields. The builder page renders its whole argument, the
spec as JSON, and an empty form under it. The count of rendered field addresses on About goes from
three to zero without a single line of output anywhere.

The export gate does not catch it either: the dead-link walk and the sitemap check both pass on an
empty form. The one thing that does catch it is the About end-to-end test rewritten in this run, which
asserts the three addresses exist, and only if someone runs the suite against the published package.

So the state to be aware of before anything gets pushed: main is committed against a dependency that
exists only as a local symlink, and the failure mode is silent rather than loud.

## The answer, and what it cost: options 1 and 3

The owner chose both the loud guard and the publish, so the guard is built and the release is staged
to the line where an outward-facing action starts.

**Option 1 is in.** src/component-refs.ts walks every page and component template, collects the
hyphenated tags they use, and resolves each against the component roots. No hand-maintained list of
important components: a template declares its own dependency by using one, and comments, code
examples and script blocks are stripped first so the builder page can print the very tag it renders
without that reading as a use. It runs in two places, a unit test so every gate run catches it, and a
preflight in the export before the server starts, so a hollow build cannot be written at all.

It was proved by making it fail. With the published grain swapped in it names all four references
across both pages, says an unknown tag does not throw and the page ships hollow, and tells the reader
to check what the grain package resolves to. The export then stops before writing anything.

**Option 3 is staged, not done.** Grain is committed at 0.1.22 with its own gates green: 317 pass, 0
fail, and tsc clean. Publishing and pushing are outward-facing, so they stay the owner's, and the
portfolio's dependency range already accepts 0.1.22, so nothing there needs editing first.

The order matters and it is the one the release flow already records. Push grain, publish grain, then
refresh the portfolio's copy and re-run its gates against the real package rather than the symlink,
then push the portfolio.

```
cd ../grain && git push && cd packages/grain && npm publish
cd ../../../tjakoen.github.io
rm node_modules/@tjakoen/grain && bun update @tjakoen/grain     # drops the symlink for the real thing
bun test && bun run export && bun run verify:export             # the preflight now proves the atoms arrived
git push
```

The symlink is the thing to remember: node_modules/@tjakoen/grain currently points at the grain
working tree, with the installed 0.1.21 parked beside it as .grain-0.1.21-npm. Until that is replaced
by a real install, a green gate here says nothing about the published package.

## The addressing defect is closed, and the demo lost its workaround

The owner chose the atom fix. The surface binding moved onto the input in b-field and onto the select
in b-choice, grain's conformance test now asserts where the address lands rather than only that the
binding exists, and both atom docs say what the fix taught. b-choice's carries the warning that
outlives it: a select accepts a write a text field would, and anything that is not one of its option
values empties it silently, so a caller sends values rather than labels.

The portfolio deleted the script it had been carrying to move each address down by hand, and the page
copy that explained the workaround is gone with it. Measured on the live page afterwards: all three
About addresses now resolve to a fillable control, no label carries an address, and the desk writes
into a generated field with nothing registered by hand. The plan's original payoff is true for the
first time, and it took building the thing to get there.

Both tours were corrected and re-captured, because the evidence had to stop describing a workaround
that no longer exists. The catalog baseline was re-blessed a second time, since the catalog renders
the two atom docs and the docs changed.

The owner is holding the publish until this fix is in, so 0.1.22 now carries it. The runbook above is
unchanged.

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
