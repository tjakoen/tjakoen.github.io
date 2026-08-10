---
id: review-tier1-nongrain
mode: dev
title: "Review: a tour on a project that never heard of us"
route: /
---
Every review before this one walked a GRAIN host. This one walks a plain Next app that has no CRUMB,
no GRAIN, no PANTRY and no idea it is being reviewed. The only thing it carries is `data-surface`
attributes in its markup, which is the entire Tier 1 contract: name the things a review will talk
about, and nothing else.

The tour file you are reading lives in the REVIEWING repo, not in the app. That is not a workaround.
It is what lets a review be written for a project nobody wants to add a dependency to, and it is why
the review still reads after the app has stopped running.

This walk only means anything pointed at the Tier 1 fixture. Against this site it will find no
surfaces, because this site is not the thing under review.

## page:tickets
- at: /
- status: needs-verification
- review: PANTRY injected CRUMB into a page that ships none of it. If the lamp lights this heading, the tour layer arrived through the proxy and resolved an address in someone else's markup.
- verify: The lamp is on the Tickets heading, not floating over the page corner. Nothing about the app's own layout moved to make room for it.
The list heading, and the first proof that an address in a foreign app resolves.

## ticket:refund-state
- at: /tickets/t-1042
- status: needs-verification
- review: A step that navigates. The address is on a route the previous step was not on, so getting here at all exercises the navigation half rather than only the lighting half.
- verify: The page is the T-1042 detail, and the lit element is the refund badge reading "refunded" — not the heading above it.
The refund badge: the one element a refund review is actually about.

## ticket:total
- at: /tickets/t-1042
- status: known-issue
- review: Same page, second address, and deliberately a weak one. The fixture's total is a placeholder, so this step is what a review looks like when the thing it points at is not finished.
- verify: The lamp moves down to the total line without a page reload. The text says the total is hidden, which is the known issue rather than a bug in the lamp.
The total line, standing in for the field a real review would care about.

## prompt
This is the phase that had to prove the whole layer is not portfolio-shaped, so the question worth
asking is not whether it worked here but whether it is worth pointing at something real.
- ask: address-quality | Did lighting an element by name read as more useful than a screenshot would have? | more useful, about the same, a screenshot would do
- ask: attributes-worth-it | Is sprinkling data-surface into a real app's markup a price worth paying for this? | yes, only on reviewed surfaces, no
- template: Continue the PANTRY review layer (tour {tour}).\nOn addressability versus screenshots: {address-quality}\nOn putting data-surface into a real app: {attributes-worth-it}\nPlan: plans/pantry-review-layer.md. P4a-c are done; P4d (capture at run time) and the ph-live attribute diff are what these answers steer.
- handoff: https://claude.ai/new?q={payload}
