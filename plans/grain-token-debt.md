---
id: grain-token-debt
status: done
track: design
depends: [pantry-review-layer]
touches:
  - ../grain/packages/grain/components/atoms/b-button/b-button.css
  - ../grain/packages/grain/styles/variables.css
  - ../grain/packages/crumb/crumb.css
  - content/tours/review-grain-status.md
  - view/pages/review/grain-status.html
  - tools/export.ts
  - grain-token-debt.md
owner: unassigned
---

# The design system's own status colour, and the hue it does not have

Opened 2026-08-11, from the 2026-08-09 audit's one deliberately untouched finding: grain's CSS token
debt, called the worst code in the estate and left alone because it is rendering-visible in a
published package and wants a reviewed pass rather than a background agent. Now that PANTRY hosts
reviews and a wait ends when the reviewer's card does, this is the first real customer for that layer
rather than a fixture for it.

## What was re-measured, and what changed since the audit

The audit named four classes. Re-measuring them today moved two, killed one, and sharpened the
fourth into something better than a defect list.

- **The dead `--btn-accent` chain: confirmed, and it is not a wiring bug.** `b-button.css` declares
  four accent tokens and repoints all four under `[data-status="success"]` and `[data-status="danger"]`.
  Nothing anywhere consumes them: zero occurrences of `var(--btn-accent` in the whole package. So a
  status button renders identical to a default one, which the audit said. What the audit did not say
  is that **wiring the chain up would change nothing either**: `--color-success` and `--color-danger`
  both resolve to `var(--ink)` in `variables.css`, and their `-hover`, `-contrast` and `-soft` partners
  resolve to the same `--ink`, `--paper` and `--paper-2` as every other button. Eight lines of ceremony
  that could not produce a visible difference if they were connected. The bug is not the missing
  `var()`; the bug is that nobody has decided what status looks like here.
- **Five undefined tokens in `crumb.css`: confirmed, and two of them are the only hues in the
  system.** `--accent`, `--font-ui`, `--ink-soft`, `--ok` and `--warn` are referenced and defined
  nowhere, in grain or in crumb. Three degrade quietly. The other two do not: `var(--ok, green)` and
  `var(--warn, orange)` back the verified and known-issue chips on the tour rail and the popover, so
  the one place a literal green and a literal orange reach the screen is a fallback nobody chose,
  inside a palette that collapses every status to ink on purpose.
- **The four invalid `font`/`border` shorthands: NOT reproduced.** `--border` is defined as
  `1px solid var(--hairline)`, a complete shorthand, so `border: var(--border)` is correct wherever it
  appears, and no `font: var(--…)` rule fed a family-only token was found. Either it was fixed between
  the audit and today or it was mis-stated. It goes no further until someone can point at a line.
- **The 100 primitive leaks: real, and the count needs a definition before it means anything.** 292
  raw `px`/`rem` occurrences across 46 component stylesheets, but a 1px hairline, a 999px pill and a
  breakpoint in a media query are not leaks, and no colour primitive (hex or rgb) appears in component
  CSS at all. Sorting the true leaks from the legitimate literals is a judgment pass, not a grep,
  which is why it is last here rather than first.

## The one question under the first two

Both live defects are the same story told twice: **status wants to be visible and the palette has no
hue to give it.** Monochrome is not an accident here, it is the design, and both defects are what
happens when a component asks for a status colour anyway. So the fix is a decision before it is a
diff, and it is the owner's: does `data-status` on a control get a non-hue treatment (fill, border
weight, a mark), or does it stop being a visual distinction at all and become semantics only?

That question is what the review tour asks, with both answers rendered rather than described.

## Slices

- [x] **G0. The tour, and the states rendered. Done 2026-08-11, and it is waiting on the owner.**
      `content/tours/review-grain-status.md` walks `/review/grain-status`: the row as it ships today
      (three intents, one rendering) and four candidates beside it, then a card that asks which one.
      Four rather than the two this bullet first imagined, because "a proposed treatment" turned out
      to be three genuinely different answers plus the honest fifth option of no answer at all.
      **Where the proposal surface lives, and the two homes that did not work.** It is a page in the
      portfolio's own tree, excluded from the static export in `tools/export.ts`, so it is served
      locally and ships nowhere. PANTRY's `/artifacts/raw` was the obvious home and is not one:
      probed rather than assumed, it serves review files with `Content-Security-Policy: sandbox` and
      no client injection, so no card would ever open on one. A grain-side home was rejected for the
      opposite reason: putting candidate CSS in the package to look at candidate CSS is the debt this
      plan exists to pay down. The candidate rules are scoped to the page and define no token, so
      nothing here can leak into the design system by being left behind.
      **What the walk itself found**, which is the argument for walking rather than reading: CRUMB's
      card renders markdown inline code as literal backticks, so the first draft's prose showed them
      to the reviewer. The other tours have none, which is now visibly a convention rather than a
      coincidence.
- [x] **G1. The answer, in `b-button.css`. Done 2026-08-11.** The owner walked the tour and answered
      **B, rule weight, with a fill on hover for the destructive one**. So `data-status="danger"` takes
      `border-width: 2px` at rest and a solid ink fill with a paper label on hover, and the four
      `--btn-accent*` tokens are DELETED rather than wired, because connecting them could not have
      rendered a difference. `data-status="success"` gets no visual rule at all: the answered candidate
      showed Default and Save identical, so success stays semantic and visual ranking stays
      `data-variant`'s job. Only the action you cannot undo is marked.
- [x] **G2. The five undefined tokens in `crumb.css`. Done 2026-08-11.** `--accent` to `--color-accent`,
      `--ink-soft` to `--ink-muted`, `--font-ui` to `--font-smooth` (NOT `--type-font`: that is the grade
      switch and would flip the review chrome to the grain face under a `data-grade` ancestor). The
      owner answered **same answer** for the chips, so `--ok` and `--warn` are gone: verified goes denser
      in the ink ramp, known-issue takes the doubled rule the danger button now carries. One vocabulary,
      used twice. The three `--ink-soft` fallbacks had drifted to 55%, 60% and 62% of ink while all
      meaning "secondary text"; collapsing them onto one token removes the drift as well as the phantom.
- [x] **G3. The check. Done 2026-08-11** — `packages/grain/styles/vars-defined.test.ts`, across the whole
      package set rather than one package, because the vocabulary is shared and a per-package check would
      have called crumb's references external and passed. A fallback is NOT an excuse: `var(--nope)` is
      noticed within the hour and `var(--nope, green)` ships, which is exactly how the five survived.
      **It found three more of the same class on its first run**, all hidden by fallbacks: `--editor-header-h`
      (three organisms agreeing on a magic 2.9rem none of them defined), `--z-presentation` (a z-index
      absent from the ladder it belongs to), and `--color-grain` (one reference in the whole estate, and
      no hue to point it at — the grade vocabulary is carried by the font). All three now resolve, at the
      values that already rendered, so the fix changes nothing visually and makes the agreement real.
      Seven more references are allowlisted with a receipt each: three written at runtime by
      `cmdk.js`, four documented per-instance knobs a caller supplies inline.
      **The check's own first run was wrong and that is worth keeping:** it read `--ok` and `--warn` out
      of a comment explaining they had just been removed. It now blanks comments before scanning.
- [x] **G4. The primitive leaks, with the definition first. Done 2026-08-11.** Defining "leak" was the
      whole job. A leak is a raw px/rem literal that RESTATES a token on the spacing, radius or type
      scale. Not a leak: rule thicknesses (no token expresses 1px), media breakpoints, layout dimensions,
      em/ch values, calc offsets, and one-offs matching no token — a considered one-off is not a
      restatement, and counting it as one is where "100" and "292" both came from.
      **Measured against that: 7 leaks in 2 files**, all now fixed (`app-window.css`, `presentation.css`).
      Of the 291 raw occurrences, 28 were inside comments and never code at all; the rest are borders (89),
      layout dimensions (71), calc offsets (12), breakpoints (2), and 28 considered one-offs. The audit's
      "100 primitive leaks" was not a measurement, and neither was the re-count.

## What this must not turn into

A restyle. The palette is not under review, the monochrome rule is not under review, and no slice here
gets to introduce a hue because a status looked clearer with one. The question is what status looks
like WITHOUT a hue, and the honest answer may be that it looks like nothing and the attribute is
semantic. That is a legitimate outcome and G1 is written to allow it.
