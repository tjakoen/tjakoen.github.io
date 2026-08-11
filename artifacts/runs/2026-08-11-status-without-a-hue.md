---
title: What status looks like without a hue, put in front of someone
date: 2026-08-11
status: complete
lane: gated
branch: main
scope:
  - plans/grain-token-debt.md
  - content/tours/review-grain-status.md
  - view/pages/review/grain-status.html
  - tools/export.ts
touched:
  - plans/grain-token-debt.md
  - content/tours/review-grain-status.md
  - view/pages/review/grain-status.html
  - tools/export.ts
skills:
plans:
  - grain-token-debt G0 | /docs/plans/grain-token-debt
gates:
  - bun test (portfolio) | 360 pass, 0 fail
  - bunx proof verify plans (portfolio) | OK, 2 warnings, neither this run's
  - the export exclusion, measured | the sitemap emits /review/grain-status exactly, so the filter matches
  - the tour, walked in a browser | rail, card, lamp and step 1 verified by screenshot
diffstat: 4 files changed, 1 new page, 1 new tour, 1 new plan
dirty:
unpushed: 0
verifiedBy: not yet by a human, and that is the point of the artifact: the tour is the ask
doctor: not run this slice; no code path changed
---

The 2026-08-09 audit left one finding untouched on purpose: grain's CSS token debt, rendering-visible
in a published package, wanting a reviewed pass rather than a background agent. This is that pass
starting, and the first thing it produced was a correction to the finding.

**The dead accent chain is not a wiring bug.** `b-button.css` repoints four accent tokens under
`[data-status]` and nothing consumes them, so a Save and a Delete render as an ordinary button. That
much the audit had. What re-measuring added: `--color-success` and `--color-danger` both resolve to
`var(--ink)`, and their hover, contrast and soft partners resolve to the same values every other
button already uses. **Connecting the chain would render identically.** The defect is not a missing
`var()`. It is that nobody has ever decided what a status looks like in a palette with no hue to
spend, and eight lines of CSS have been standing in for that decision.

**Two other classes moved.** The four invalid `font`/`border` shorthands did not reproduce: `--border`
is `1px solid var(--hairline)`, a complete shorthand, so `border: var(--border)` is correct wherever
it appears. And the 100 primitive leaks are real but uncounted: 292 raw px/rem occurrences across 46
stylesheets, of which a 1px hairline, a 999px pill and a breakpoint are not leaks, and no colour
primitive appears in component CSS at all. Both are written down as what they are rather than carried
forward as numbers nobody can reproduce.

**The crumb half is the same question wearing different clothes.** Five tokens referenced in
`crumb.css` are defined nowhere, and two of them, `--ok` and `--warn`, back the verified and
known-issue chips through `var(--ok, green)`. So the only literal hues in the system arrive by a
fallback nobody chose, inside a palette that collapses status to ink on purpose.

## What G0 built

A page of candidates and a tour that walks them, because the decision underneath is a design call and
a design call made from a description is what this whole review layer exists to stop. Four candidates,
rendered against grain's real tokens and grain's real `.btn`: a fill, a doubled rule, a mark, and
semantics only, which is the honest outcome if a hueless status has nothing to say visually and the
only one that makes the code smaller.

**Where the proposal lives, and the two homes that did not work.** PANTRY's `/artifacts/raw` was the
obvious home and is not one: probed rather than assumed, it serves review files with
`Content-Security-Policy: sandbox` and no client injection, so no card would ever open on one. Putting
the candidates in grain was rejected for the opposite reason, since adding candidate CSS to the
package is the debt this plan exists to pay down. So it is a page in the portfolio's own tree,
excluded from the static export, with every candidate rule scoped to the page and defining no token.
The exclusion was measured rather than trusted: the sitemap emits `/review/grain-status` exactly, so
the filter string matches and nothing ships.

## What the walk found that reading would not have

The card renders markdown inline code as literal backticks, so the first draft showed a reviewer
`data-status` with the backticks in it. Every other tour in the repo has none, which turns out to be a
convention nobody had written down. Fixed, and the walk was re-run to confirm.

The walk itself is proven end to end: the rail lists five steps, the intro card opens from
`?tour=review-grain-status`, and step one spotlights the as-it-ships row with the rest of the page
dimmed. Screenshots taken at each stage rather than described.

## What was not done

Nothing in grain was touched, deliberately. All four candidates resolve the same question and the
answer decides which one lands, so building any of them first would be guessing with a published
package as the stake. G1 through G4 wait on the card.

The card was not finished either, and that is not an oversight: finishing it writes an answer, and the
answer is not a session's to give.

## What needs human eyes

The whole artifact. Walk `review-grain-status` in PANTRY, pick a treatment, answer whether crumb's
chips follow the same rule or whether a review chip is allowed the hue a button is not, and finish the
card. A session waiting on `pantry answers wait review-grain-status` unblocks on it; one that is
asleep reads it on wake.
