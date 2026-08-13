---
id: form-from-data-demo
status: done
track: demo
depends: []
touches:
  - content/data/contact-form.json
  - view/pages/about.html
  - view/pages/builder.html
  - src/ai/field-matcher.ts
  - src/ai/form-draft.ts
  - src/ai/builder-page.ts
  - src/component-refs.ts
  - ../grain/packages/grain/components/atoms/b-field/
  - ../grain/packages/grain/components/atoms/b-choice/
  - ../grain/packages/grain/components/atoms/b-option/
  - ../grain/packages/grain/components/atoms/b-textarea/
  - ../grain/packages/grain/components/atoms/b-memo/
owner: ai
---

# A form comes from data, and a description builds one

The consolidated entry for work that ran across four sessions on 2026-08-12 and 2026-08-13. Each
session left its own evidence; this is the one place that says what the whole thing amounts to and
where each piece of that evidence lives, so the next reader does not have to reconstruct the arc from
two run reports and four capture folders.

## What shipped

**The atoms, in grain.** b-field, b-choice and b-option render a form from JSON with no
renderer change, and b-textarea and b-memo draw the message box the field frame never had. Grain
sits at 0.1.22, committed, deliberately unpublished so the atoms and the demo travel as one bundle.

**A real form, on a real page.** The About Contact tab renders its controls from
content/data/contact-form.json. It was built before any generator touched the atoms, which is what
made the next line possible.

**The matcher.** field-matcher.ts turns a plain description into that spec over a closed set, and
refuses what it cannot build rather than faking it. Deterministic code selects; the model does not
pick a slug, because picking slugs is the thing a small model gets wrong.

**The demo.** /builder takes a description in its address, renders the spec, the live form and the
refusals from one call, and the desk fills the text fields it just generated.

**A guard the work earned.** component-refs.ts fails loudly when a template references a component
that does not exist, because an unknown tag does not throw: it ships a hollow page, and both the
export and its dead-link verifier passed on one.

## What the build disproved, which is the part worth keeping

The plan's payoff claim was that a generated field is AI-operable the moment it renders. It was not.
Both atoms addressed the wrapping label, a label has nothing to write into, and every fill was
dropped in silence. Building the demo is what found it; the atoms were fixed the same day and the
claim is true now. The full account is in the grain plan under "What building it contradicted".

The sibling hazard survives as a caller rule, written into b-choice.md: a select accepts a write a
text field would, and anything that is not one of its option values empties it without a word.

## Where the evidence is

- Run reports: artifacts/runs/2026-08-13-form-builder-demo.md (the atoms, the matcher, the demo,
  the addressing fix and the guard) and artifacts/runs/2026-08-13-textarea-atom.md (the textarea
  atoms and the refusal that came out of the demo).
- Tours: content/tours/review-form-from-data.md and content/tours/review-builder-demo.md. Both
  are written by the sessions that made the changes, so no step is stamped verified.
- Captures: the 2026-08-13 pair under artifacts/reviews/ is current. The 2026-08-12 pair is the
  same two tours captured before the addressing fix and the textarea, kept rather than removed
  because they are the evidence that the workaround existed and what it looked like.
- Spec: ../grain/packages/grain/plans/form-from-data.md, including its own correction.

## What stays open, and who owns it

- **The push and the publish are the owner's**, and both are deliberately not taken. The runbook is
  in the form-builder run report. Until it runs, the portfolio resolves grain through a symlink and a
  green gate here says nothing about the published package.
- **The remaining control gaps are closed**, grain plan section 5b, built 2026-08-13. What came out of
  that build and is still open is a verb: a tick box is the one control the AI cannot operate, because
  the only field verb writes the value and a checkbox's value is what it submits rather than whether
  it is ticked, so the atom ships unaddressable on purpose. Adding a verb grows the vocabulary and is
  the owner's call.
- **The builder becomes a sandbox**: see plans/builder-sandbox.md, which is the live plan.
- **The audit scenario has never run.** form-build-det is written and needs a GPU pass.
- **Two specs flake under parallel load** and pass alone, now including the catalog visual baseline,
  which is new. Recorded rather than re-blessed.

- [x] The three form atoms, in grain
- [x] A real form on About, from a committed spec
- [x] The matcher, with its refusals
- [x] The builder demo, with the desk filling what it generated
- [x] The addressing defect, found and fixed
- [x] The hollow-page guard
- [x] The textarea atoms, and the refusal they retired
- [ ] Publish and push, owner
- [x] The rest of the control gaps (2026-08-13, artifacts/runs/2026-08-13-controls-complete.md)
- [ ] The sandbox, see plans/builder-sandbox.md
