---
id: review-proof-honest-claims
mode: dev
title: "Review: /proof stops claiming a board it does not run"
route: /proof
---
The 2026-08-09 audit found this page telling visitors that the plan board updates live over SSE with
no refresh needed. It does not. The server comment two layers down says the live refresh is a
follow-up, and `watchPlans` appears nowhere in the app. That made it the worst kind of wrong claim:
falsifiable in one click, on the one page whose entire subject is plans you can verify. Two edits
here, one removing the overclaim and one closing a contradiction the page had with itself.

## screen:proof-lede
- at: /proof
- status: changed
- review: The opening description used to end by saying the board updates live over SSE. It now says the package ships a live SSE board that this site does not mount yet. The capability is real and stays attributed to PROOF, which does ship `live.ts`. What changed is that the site no longer takes credit for wiring it.
- verify: Read the opening paragraph. It should say the live board is not mounted here, and it should not contain the phrase "no refresh needed".
The distinction matters and is worth keeping straight: the package can do this, the site has not
turned it on. Collapsing those two into one sentence is how the original claim got written.

## screen:proof-status-flag
- at: /proof
- status: changed
- review: The status line listed the live SSE board among the things that are shipped. It now lists the parser, the board, and the check and init tooling, and stops there.
- verify: Find the status flag near the top. Count what it claims is shipped, then open /plans in another tab and edit a plan file. The board should not move until you refresh, which is now what the page says will happen.
This is the check the old page could not survive. It should survive it now.

## screen:proof-frontmatter
- at: /proof
- status: changed
- review: The lede described plan frontmatter as four fields while the card beside it said "six fields, no more". Both were on screen at once. The real schema has six, so the lede now lists all six: id, status, track, depends, touches, owner.
- verify: Read the lede and the card together. They should agree on six, and the two missing names were id and touches.
Nobody wrote this contradiction on purpose. `touches` was added when the review gate started reading
a plan's declared blast radius, and the lede was never revisited.

## screen:proof-board
- at: /plans
- status: needs-verification
- review: Nothing changed here, and that is the point of including it. This is the board the page makes claims about, so it is the surface a reviewer should check the claims against.
- verify: Load /plans and confirm it renders the board. Then decide whether the honest fix was the right call, or whether mounting PROOF's live.ts is worth doing so the original sentence could be true instead.
The owner chose to drop the claim rather than build the feature, which is the cheaper and more honest
of the two. The other option is still open and the package half of it already exists.
