---
id: grain-token-debt
status: doing
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
- [ ] **G1. Whatever the answer says, in `b-button.css`.** Either the accent chain is consumed and
      given a treatment that survives a monochrome palette, or it is deleted and `data-status` keeps
      its meaning without claiming a colour. One of the two, not a compromise that leaves the tokens
      declared and unused, which is the state that produced this plan.
- [ ] **G2. The five undefined tokens in `crumb.css`.** `--ok` and `--warn` follow G1's answer, since
      a chip and a button are the same question wearing different clothes. `--accent`, `--font-ui` and
      `--ink-soft` are resolved to real tokens or removed. A missing token with a plausible fallback is
      worse than a missing token with none, because the fallback is what hides it.
- [ ] **G3. A check, so this cannot come back quietly.** Every `var(--…)` reference in a published
      stylesheet resolves to a token defined somewhere in the package set, or the build says so. This
      whole plan exists because five undefined references shipped and rendered, and no gate noticed.
- [ ] **G4. The primitive leaks, with a definition first.** What counts as a leak, then the pass. Not
      started until G1 to G3 land, because it is the only slice here that is not rendering-visible.

## What this must not turn into

A restyle. The palette is not under review, the monochrome rule is not under review, and no slice here
gets to introduce a hue because a status looked clearer with one. The question is what status looks
like WITHOUT a hue, and the honest answer may be that it looks like nothing and the attribute is
semantic. That is a legitimate outcome and G1 is written to allow it.
