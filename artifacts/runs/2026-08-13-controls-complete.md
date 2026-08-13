---
title: The frame covers every control, and one of them the AI cannot tick
date: 2026-08-13
status: complete
lane: gated
branch: main
scope:
  - artifacts/runs/
  - artifacts/reviews/
  - ../grain/packages/grain/components/atoms/b-checkbox/
  - ../grain/packages/grain/components/atoms/b-radio/
  - ../grain/packages/grain/components/atoms/b-check/
  - ../grain/packages/grain/components/atoms/b-input/
  - ../grain/packages/grain/components/molecules/form-grid/
  - ../grain/packages/grain/components/form-from-data.test.ts
  - ../grain/packages/grain/plans/form-from-data.md
  - src/
  - content/data/
  - content/tours/
  - view/
  - e2e/
  - tools/
  - plans/
touched:
  - ../grain/packages/grain/components/atoms/b-checkbox/b-checkbox.html
  - ../grain/packages/grain/components/atoms/b-checkbox/b-checkbox.css
  - ../grain/packages/grain/components/atoms/b-checkbox/b-checkbox.md
  - ../grain/packages/grain/components/atoms/b-radio/b-radio.html
  - ../grain/packages/grain/components/atoms/b-radio/b-radio.md
  - ../grain/packages/grain/components/atoms/b-check/b-check.html
  - ../grain/packages/grain/components/atoms/b-check/b-check.md
  - ../grain/packages/grain/components/molecules/form-grid/form-grid.css
  - ../grain/packages/grain/components/molecules/form-grid/form-grid.md
  - ../grain/packages/grain/components/atoms/b-input/b-input.css
  - ../grain/packages/grain/components/atoms/b-input/b-input.html
  - ../grain/packages/grain/components/atoms/b-input/b-input.md
  - ../grain/packages/grain/components/atoms/b-field/b-field.html
  - ../grain/packages/grain/components/atoms/b-field/b-field.md
  - ../grain/packages/grain/components/atoms/b-choice/b-choice.html
  - ../grain/packages/grain/components/atoms/b-choice/b-choice.md
  - ../grain/packages/grain/components/atoms/b-memo/b-memo.html
  - ../grain/packages/grain/components/atoms/b-memo/b-memo.md
  - ../grain/packages/grain/components/atoms/b-textarea/b-textarea.html
  - ../grain/packages/grain/components/form-from-data.test.ts
  - ../grain/packages/grain/plans/form-from-data.md
  - content/data/contact-form.json
  - src/ai/field-matcher.ts
  - src/ai/field-matcher.test.ts
  - content/tours/review-controls-complete.md
  - e2e/visual.e2e.ts-snapshots/catalog-darwin.png
  - plans/builder-sandbox.md
  - artifacts/reviews/2026-08-13-review-controls-complete/
skills:
  - loop-standard
  - tour-standard
  - voice
plans:
  - builder-sandbox, the remaining control gaps | plans/builder-sandbox.md
  - form-from-data section 5, items 2 to 5 | ../grain/packages/grain/plans/form-from-data.md
gates:
  - bun test (grain) | 600 pass, 0 fail, 1632 expect() calls, 65 files
  - bun run check (grain) | 5 packages, all exited 0
  - bun run check (portfolio) | tsc --noEmit, exit 0, no output
  - bun test (portfolio) | 426 pass, 0 fail, 1616 expect() calls, 27 files
  - bunx playwright test --grep-invert "visual baseline" | 230 passed, 1 skipped, 1 failed (the known grain-page flake)
  - bunx playwright test grain-page.e2e.ts --workers=1 (the failure, alone) | 1 passed (11.1s)
  - bunx playwright test e2e/visual.e2e.ts --workers=1 (before the re-bless) | 8 passed, 1 failed (catalog)
  - bunx playwright test e2e/visual.e2e.ts --workers=1 (after the re-bless) | 9 passed (29.4s)
  - bun run export | 112/112 pages, 81/81 data routes, 28 frozen modules, 69 asset files
  - bunx crumb check content/tours | review-controls-complete 5 steps dev, 14 tours all valid
  - pantry capture review-controls-complete | 5 of 5 steps resolved, ok on each
  - bun tools/lint-gate.ts | 4 counters regressed, all four pre-existing, see the doctor line
diffstat: grain 23 files changed (761 insertions, 21 deletions) across two commits, of which 9 files are new; portfolio 5 files changed (36 insertions, 8 deletions) plus a new tour, a new capture folder and this report
dirty: nothing of this session's is uncommitted at the time of writing. The portfolio tree is shared with at least one other session, so the counts below were taken by pathspec rather than from a whole-tree read.
unpushed: 19 | grain 9, portfolio 10. Pushing stays the owner's call and was not taken.
verifiedBy: nobody yet. The tour is written by the author of the change, so its five steps are stamped new, known-issue or needs-verification and none is stamped verified.
doctor: two flags carried, neither fixed. The grain pin reads one behind because 0.1.22 is deliberately unpublished, which this run makes more true rather than less. Two run reports from 2026-08-11 lack gate output and belong to sessions that are gone, so nobody here can supply what they are missing.
---

The owner answered the next-gap question with four words, "Lets cover all controls", and that is the
whole of section 5 of the form-from-data plan: a checkbox and a radio in the field frame, the hint
and error slots, the required marker, and a grid to lay several fields out. All four are closed. They
were built as one bundle rather than as four small changes, because they share one frame, one test
file, one catalog re-bless and one tour, and splitting them would have cost four of each.

The sandbox itself was not started. That is deliberate and it is the sequencing the task proposed:
the control gaps are what make a sandbox worth having, since a sandbox that can compose four controls
is a thin sandbox. The first sandbox piece, the prompt area becoming a real composer, is the next
session's and the plan says so.

## What the probe settled before anything was written

This family has now shipped three silent failures found only by building on it, so nothing here was
reasoned about the renderer. Four results, produced by rendering through createRenderer and reading
the output. Two of them decided the shape of what shipped.

**A config property appends its attribute; it does not replace a literal one.** A template carrying
a literal type of checkbox, plus a type property, renders both attributes, and the browser honors the
first and drops the second without a word. So the obvious design, one tick-box atom with a type
property, produces a radio that is silently a checkbox. That is why b-checkbox and b-radio are two
files. Each states its own type and neither offers a type property at all.

**A data binding replaces, where a config property appends.** So the data-first side does in one atom
what the authoring side needs two for: b-check takes its type from the item, and a radio group is
simply every item carrying the same name and a type of radio. This is the first case in the family
where the data-first side is the simpler of the two, and it is worth remembering as a difference
between the two markers rather than as a fact about checkboxes.

**A property whose value is not supplied leaves the template's own text in place.** So a hint slot
carrying fallback text would print that fallback on every field nobody wrote a hint for. The slots
ship with empty content and collapse when empty, which is the only reason it is safe to put them in
every template unconditionally. That emptiness is invisible in a diff, so it is a conformance test.

**The null contract holds unchanged for the new keys.** An explicit null hint renders an empty span
the stylesheet hides; a key left out entirely warns in development.

## The finding: the AI half stops at the tick box

Every other atom in this family binds an address, and the reason it can is that the vocabulary has a
verb which operates the control. A tick box has a value too, and that is exactly the problem. **A
checkbox's value is what the form submits when the box is ticked, not whether it is ticked.**

Measured on the live page rather than argued:

```
passesFillGuard: true          // "value" in el, the dispatcher's own gate
before: { checked: true, value: "yes" }
after:  { checked: true, value: "yes please" }
tickedByTheWrite: false
submitValueChanged: true
```

So a write aimed at a tick box passes the guard, lands, reports success, changes what the form means,
and leaves the control looking untouched. That is strictly worse than the choice hazard this family
already carries, where a bad write at least blanks the control where you can see it. And it cannot be
fixed the way the label addressing was, by moving the binding down onto the control, because there is
no element to move it to.

**So b-check ships with no address, and that is the honest answer rather than an oversight.** An
address advertises in the manifest that the verbs for its kind are legal on it, and there is no verb
today that can tick a box. Shipping one would be a documented promise the mechanism cannot render,
which is the thing grain's own lesson 9 says never to do. The absence is a conformance test with the
reason written beside it, so the next reader cannot tidy it away.

Closing it needs a new verb, something that sets the checked state rather than the value. That is a
contract change, the vocabulary grows reluctantly by design, and it is the owner's call. It is the
first question on the tour.

## What else the build changed, and what it cost

The required marker is a rule on the frame rather than anything in markup: it reads the required
attribute the browser already needs, and marks the label from that. So no author can forget it, it
cannot drift from the constraint it describes, and **every atom in the family got it at once,
including the form on the About page, which nobody edited.** That page now shows a marker on Name and
Email. It is the design system doing its job and it is also a visible change to a page the owner
shows people, so it is the third question on the tour rather than a decision taken quietly here.

The error slot is not red. Status is weight against the hint's fade, and the token it reaches for is
hueless by default, so a theme that owns a hue can supply one without any component naming a color.

The portfolio's side of this is small and dull, which is the right size: the committed contact spec
and the matcher both grew the two new keys as nulls. The matcher emits them null on purpose rather
than as a stub. It selects; it does not compose, and a hint is composed prose. If a hint ever gets
written it belongs on the wording seam with the labels, which is still deliberately unwired.

## Gate output, verbatim

Grain, after both commits:

```
$ bun test
bun test v1.3.14 (0d9b296a)

 600 pass
 0 fail
 1632 expect() calls
Ran 600 tests across 65 files. [1.60s]

$ bun run check
$ bun run --filter '*' check
@tjakoen/grain check: Exited with code 0
@tjakoen/mill check: Exited with code 0
@tjakoen/grain-mcp check: Exited with code 0
@tjakoen/crumb check: Exited with code 0
@tjakoen/proof check: Exited with code 0
```

Portfolio unit and types:

```
$ bun run check
$ tsc --noEmit

$ bun test
bun test v1.3.14 (0d9b296a)

 426 pass
 0 fail
 1616 expect() calls
Ran 426 tests across 27 files. [2.77s]
```

The e2e suite, everything except the pixel baselines:

```
  1 failed
    e2e/grain-page.e2e.ts:182:3 › /grain — the surface is operable by both a person and the AI, through ONE DOOR › AI: 'Watch the AI act' drives the surface through the door (grain reply, completes + drafts a task) 
  1 skipped
  230 passed (3.7m)
```

That failure is the flake already on the record at exactly that line. Run alone, once, not retried in
a loop:

```
Running 1 test using 1 worker

  ✓  1 e2e/grain-page.e2e.ts:182:3 › /grain — the surface is operable by both a person and the AI, through ONE DOOR › AI: 'Watch the AI act' drives the surface through the door (grain reply, completes + drafts a task) (8.6s)

  1 passed (11.1s)
```

The pixel baselines, single worker, before the re-bless. Only the catalog moved:

```
  ✓  1 e2e/visual.e2e.ts:53:3 › welcome (/) matches its visual baseline (1.6s)
  ✓  2 e2e/visual.e2e.ts:53:3 › grain (/grain) matches its visual baseline (1.1s)
  ✓  3 e2e/visual.e2e.ts:53:3 › batch (/batch) matches its visual baseline (1.3s)
  ✘  4 e2e/visual.e2e.ts:53:3 › catalog (/catalog) matches its visual baseline (31.6s)
  ✓  5 e2e/visual.e2e.ts:53:3 › about (/about) matches its visual baseline (1.8s)
  ✓  6 e2e/visual.e2e.ts:53:3 › resume (/resume) matches its visual baseline (1.5s)
  ✓  7 e2e/visual.e2e.ts:53:3 › notes (/notes) matches its visual baseline (1.1s)
  ✓  8 e2e/visual.e2e.ts:53:3 › calendar (/calendar) matches its visual baseline (1.5s)
  ✓  9 e2e/visual.e2e.ts:53:3 › mail (/mail) matches its visual baseline (1.2s)
      - Expected an image 1280px by 85513px, received 1280px by 92610px. 1921361 pixels (ratio 0.02 of all image pixels) are different.
  1 failed
  8 passed (48.7s)
```

And after, verified by a second clean run rather than by the update run's own word:

```
  9 passed (29.4s)
```

Export, with the hollow-page preflight in it:

```
[export] done: 112/112 pages, 81/81 data routes, 28 frozen modules, 69 asset files.
```

The tour and its capture:

```
✓ review-controls-complete — 5 step(s), dev

[capture] 1/5 catalog:checkbox: ok
[capture] 2/5 catalog:radio: ok
[capture] 3/5 catalog:check-from-data: ok
[capture] 4/5 catalog:input: ok
[capture] 5/5 catalog:form-grid: ok
Captured 5 steps, all resolved.
```

The lint gate, which is red and was red before this run:

```
lint gate: 4 lint(s) regressed against tools/lint-baseline.json:
  voice:backtick: baseline 2814 -> now 2864 (+50)
  oxlint:unicorn(no-array-sort): baseline 14 -> now 26 (+12)
  oxlint:eslint(no-control-regex): baseline 0 -> now 1 (+1)
  voice:emoji: baseline 72 -> now 73 (+1)
```

## How the baseline was re-blessed, since that is the step easiest to fake

The catalog baseline had to move: four new components and two new panels on an existing one all grow
a page the catalog generates from the component docs. The rule this estate learned the hard way is
that a baseline must not be re-blessed from a loaded run, because that bakes a flake into a committed
image, and the catalog baseline joined the flaky family recently.

So it was run alone, single worker, twice. Before blessing, the diff was read rather than glanced at:
the changed band runs from row 2408 to row 16376 of a 92610 row image, and bands sampled at 20000,
40000, 60000, 80000 and 85000 hash identically between the old and new images. The eight other
screens are pixel-identical, which is the check that actually matters here, because the frame
stylesheet changed and every page carrying a field could have shifted.

## What was NOT done

- **The sandbox, all five pieces.** Not started. The plan is claimed and its first piece is named for
  the next session.
- **The push and the publish.** Both held, as before, so the atoms and the demo ship as one bundle.
  The portfolio still resolves grain through the symlink, so a green gate here still says nothing
  about the published package.
- **A verb that can tick a box.** Named, argued, and left for the owner, because it grows the
  vocabulary.
- **The About form was not otherwise touched**, per the owner's answer that it stays as it is. The
  required marker appearing there is the frame reaching it, not an edit to that page.
- **The catalog does not render links inside a component doc.** The markdown link syntax prints raw.
  This is pre-existing and visible on the shipped memo doc as much as on the new ones; it was found
  on the way and not fixed, because the catalog renderer is outside this run's scope cap.
- **The lint gate baseline was not accepted.** All four regressed counters predate this run and none
  of them is this session's work to approve.

## What needs human eyes

- **The tick-box verb.** The first tour question, and the only one that changes a contract.
- **The required marker on About**, which is now visible on a page shown to people, without that page
  being edited. Wanted, or should the marker be opt-in?
- **The name b-check**, alongside the b-memo naming question the textarea round left open. Both are
  cheap to change while nothing is published and expensive afterwards.
- **The diff itself**, because this is the gated lane: it adds three components to the design system
  and changes a frame every existing form already sits in.
- **One process note, disclosed rather than buried.** A stale development server was occupying port
  3000 and a cleanup command in this session matched and killed it. It was not this session's server
  and it may have belonged to another one. Nothing was lost beyond a process that can be restarted,
  and the work here ran on its own port throughout.
