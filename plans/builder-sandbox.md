---
id: builder-sandbox
status: todo
track: demo
depends: []
touches:
  - view/pages/builder.html
  - view/components/pages/builder/
  - src/ai/builder-page.ts
  - src/ai/field-matcher.ts
  - src/server.ts
  - src/ai/desk-reasoner.ts
  - content/data/contact-form.json
  - ../grain/packages/grain/components/atoms/b-checkbox/
  - ../grain/packages/grain/components/atoms/b-radio/
  - ../grain/packages/grain/components/atoms/b-check/
  - ../grain/packages/grain/components/atoms/b-input/b-input.css
  - ../grain/packages/grain/components/molecules/form-grid/
owner: ai
---

# The builder becomes a sandbox, not a form page

The owner answered the builder tour's wording question on 2026-08-13 by redirecting it, and the
answer is worth quoting rather than paraphrasing: the builder page should be about general GRAIN
rather than forms alone, and it should feel like a sandbox rather than a markdown form. A prompt area
with a real text area to type into. The AI saying what it is thinking. A preview. A button that opens
the thing in its own tab, and in that tab a switcher between the code and the actual rendered thing.
The catalog sidebar open by default whenever a builder preview tab is what you are looking at.

That is a different page from the one that shipped. What shipped generates a form spec, prints it and
renders it, and its whole argument is that a closed set beats a model picking slugs. The argument
survives. The subject does not: a form is one composition out of a vocabulary of many, and the page
should be about the vocabulary.

## What carries over, and what does not

**Carries over.** The closed-set discipline, unchanged and non-negotiable: code selects from a real
list of components, the model never invents a name. The deterministic matcher pattern generalizes
from field kinds to component kinds, which is the same problem with a bigger table. The GET round
trip is worth keeping for a shareable, reproducible state. The refusal list stays, because the honest
half of the demo is the part that says what it will not fake.

**Does not carry over.** The page's framing as a form builder, the form-only spec shape, and the
prose that argues about fields specifically. The examples list becomes a set of sandbox starting
points rather than four form descriptions.

## The five pieces, smallest first

1. **The prompt area becomes a real composer.** A text area rather than a link list, using grain's
   new textarea atom, with the current query-string round trip behind it so a typed prompt still
   produces a shareable address. This is the smallest piece and it is the one that changes how the
   page feels most.
2. **The spec generalizes past forms.** The matcher's closed set grows a component dimension: what
   the description asks for is a composition of GRAIN components, of which a form is one. This is
   the real work, and it is the piece most likely to be got wrong by widening the table too fast.
   Start with the components the catalog already documents and refuse everything else out loud.
3. **The AI says what it is thinking.** The desk already narrates to the terminal rather than the
   chat, which is the existing doctrine and the right home for this. What is new is that a build run
   should narrate its selection: what it matched, what it refused and why. Deterministic text, not a
   model tail, unless the wording seam is wired first.
4. **The preview opens in its own tab, with a code switcher.** A route that renders only the
   composition, plus a toggle between the rendered thing and its markup. The tab strip is a
   client-side projection of where you have been, so a preview tab is a real route rather than a
   panel.
5. **The catalog sidebar opens by default on a preview tab.** The sidebar is already sitewide and
   already has a catalog mode. This is a default, not a mechanism.

## Open questions, and they are the owner's

- **What "feedback of its thoughts" should actually contain.** A narration of the deterministic
  selection is honest and cheap. A model commenting on its own output is a different feature with a
  different failure mode, and on a 0.5B it is the exact thing that invents things.
- **How wide the component set goes in v1.** Every catalogued component is the ambitious answer; the
  handful that compose cleanly without layout decisions is the safe one.
- **Whether the preview tab is a route on this site or a framed sandbox.** A real route is honest and
  exportable. A frame is closer to a playground and further from how the rest of the site works.
- **Whether the form path stays reachable** at its current address once the page generalizes, since
  the review tour and the run report both point at it.

## The sibling answer, and why it is listed here

The same round of answers said to cover all the controls, which is the grain plan's section 5: the
checkbox and radio in the field frame, the hint and error slots, the required marker, and a form
grid. Those are grain work rather than sandbox work, and they are worth doing first or in parallel,
because a sandbox that can only compose three controls is a thin sandbox. The textarea, the first of
the five, shipped on 2026-08-13.

**All four shipped later the same day**, so the vocabulary a sandbox has to compose from is complete
for forms. See grain plan section 5b and artifacts/runs/2026-08-13-controls-complete.md. One thing
came back out of that build and belongs on this page's list of open calls rather than in the grain
plan alone: a tick box is the one control the AI cannot operate, because the only field verb writes
the value and a checkbox's value is what it submits rather than whether it is ticked. Closing it
needs a new verb. Until it is closed, a sandbox that offers to compose a checkbox is offering a
control the AI half of the demo cannot touch, which is worth knowing before piece 2 widens the
matcher's table.

**The owner answered on 2026-08-13: add the verb. BUILT 2026-08-14** as `check.set`, with its own
surface kind `check` and its own render op `tick`; the spec and the full account are in grain's
[`plans/check-set-op.md`](../../grain/packages/grain/plans/check-set-op.md). The hole piece 2 would
otherwise have opened is closed: the moment the matcher can generate a checkbox, the demo's closing
move of the AI filling in what it just generated reaches that control like any other. The ordering
held, and it was the point of the unit: contract, dispatcher, kit and door first, the verb proved
ticking a real control in a real browser, and only then `b-check`'s own address.

The first control it operates is on this site rather than in the demo: the contact form on `/about`
gained a **Copy me in** tick box, rendered from `contact-form.json` through `b-check` and addressed
`check:contact-copy`, which puts the visitor's own address in the mail draft's cc. It is a real
feature rather than a fixture, and it is the surface the e2e drives, so the verb is covered by
something a person also uses. Worth an owner's minute as a product call, since it is a new control on
a published page: cheap to drop, one entry in one JSON file plus its tag.

- [ ] 1. The prompt area becomes a real composer
- [ ] 2. The spec generalizes past forms
- [ ] 3. The AI narrates its selection
- [ ] 4. The preview tab, with the code switcher
- [ ] 5. The catalog sidebar default
- [x] The remaining control gaps, grain plan section 5 (2026-08-13,
      artifacts/runs/2026-08-13-controls-complete.md)
- [x] The tick-box verb, `check.set` (2026-08-14, artifacts/runs/2026-08-14-tick-box-verb.md)
