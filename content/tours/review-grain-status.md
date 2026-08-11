---
id: review-grain-status
mode: dev
title: "Review: what status looks like without a hue"
route: /review/grain-status
---
GRAIN's buttons carry a data-status attribute, four accent tokens are repointed for it, and nothing
consumes them, so a Save and a Delete render as an ordinary button. The audit called that a dead
chain. Re-measuring it found something worse and simpler: connecting the chain would change nothing
either, because --color-success and --color-danger both resolve to --ink. There is no hue to
spend, on purpose, and nobody has ever decided what a status should look like without one.

So this walk shows the defect and four ways out, rendered rather than described, and the last card
asks you to pick one. Nothing in grain changes until you do, because all four resolve the same
question and guessing costs a published package.

## status:asis
- at: /review/grain-status
- status: needs-verification
- review: Three different intents, one rendering. This is the live defect and the reason the plan exists.
- verify: Look at the three buttons. Default, Save and Delete should be indistinguishable. If any one of them differs, this whole plan is starting from a wrong measurement and the walk should stop here.
The row as it ships today.

## status:fill
- at: /review/grain-status
- status: needs-verification
- review: Candidate A. Destructive takes the solid ink fill and a paper label; the rest keep the hairline.
- verify: Hover the Delete. The fill should darken slightly rather than invert, and the label must stay readable against it. Then ask yourself the real question: should the button you cannot undo be the loudest thing on the page, or the quietest?
The loudest control becomes the irreversible one.

## status:weight
- at: /review/grain-status
- status: needs-verification
- review: Candidate B. Same ink, same fill, a doubled border on the destructive one.
- verify: Step back from the screen, or squint. Decide whether you can still tell which one is Delete. If it only reads once someone has told you the rule, that is the finding, not a failure of the walk.
Quieter, and a ratio rather than a value, so a theme swap cannot break it.

## status:mark
- at: /review/grain-status
- status: needs-verification
- review: Candidate C. A small filled block before the destructive label, in the current colour.
- verify: Check it against candidate A above by scrolling between them. The mark should read at a glance and should NOT look like the dashed border, which already means the AI is driving a control.
The only candidate that survives greyscale, print and a reader who cannot compare rule weights.

## status:semantic
- at: /review/grain-status
- status: needs-verification
- review: Candidate D. Identical rendering, on purpose: the attribute keeps its meaning and stops claiming a look.
- verify: Confirm this row looks exactly like the first one. That is the point, and it is the only candidate that makes the code smaller rather than larger.
The honest outcome if a hueless status simply has nothing to say visually.

## prompt
Pick one. Whatever you pick becomes slice G1, and the same answer settles crumb's verified and
known-issue chips, which are the same question wearing different clothes: they reach for --ok and
--warn, which are defined nowhere, so they fall back to a literal green and orange inside a palette
that has no hues at all. Finishing this card is what records the answer.
- ask: treatment | Which treatment should data-status get on a control? | A fill, B rule weight, C a mark, D semantics only
- ask: chips | Should crumb's verified and known-issue chips follow the same answer, or is a review chip allowed the hue a button is not? | same answer, chips may keep a hue
- template: Continue plans/grain-token-debt.md (tour {tour}).\nTreatment for data-status: {treatment}\nCrumb's status chips: {chips}\nG0 is done; G1 puts the chosen treatment into b-button.css and G2 resolves the five undefined tokens in crumb.css.
- handoff: https://claude.ai/new?q={payload}
