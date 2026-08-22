---
id: review-block-verbs
mode: dev
title: "Review: the AI learns to edit a page, not just describe one"
route: /grain/builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%20and%20a%20stat
---
D2 gave a human three controls per block and left the model with one lever: write a description and
build. There is no phrase that means "drop the second card", because the matcher only ever adds, so
a composed page was something the AI could describe into existence and then never touch again.
Three verbs close that, and they took the route the tick box took: prove no existing verb covers it,
add a KIND, keep every verb a set so a replay is safe, add the render op, and let the address land
last. Grain is committed and held unpublished, so this only works against a local grain.

## builder-rail
- at: /grain/builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%20and%20a%20stat
- status: changed
- review: The controls a human presses, unchanged, and they are the reference for what the verbs had to be able to do. The one that matters is the arrows: block.move takes up or down rather than a target index, because an index is a number to compute against a list length and that is where a small model drifts. The verb was shaped to match this button rather than the array underneath it.
- verify: Press the arrows and the span chips and check nothing about them moved. Then read the row: id, kind, three chips, two arrows, a remove. That set is exactly the vocabulary the AI now has, and if the rail can do something the verbs cannot, the two have already drifted.

## builder-canvas
- at: /grain/builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%20and%20a%20stat
- status: needs-verification
- review: Every block now carries a block: address, and this is the step to be nervous about because the address arriving at all is the thing the tick box taught us to do last. It is here only because the verbs exist in grain's contract first. The other half is the handshake: the AI never calls this page's code, so the dispatcher changes the DOM and the page has to notice, or the edit is undone by the next prompt.
- verify: Open the console and run this, which is exactly what grain's dispatcher does with a block.remove op. `document.querySelector('[data-surface="block:b2"]').remove()` Then type "a stat" and press Build it. The removed card must NOT come back, and the rail must show one fewer row before you ever type. If it comes back, the page is composing against a block that is no longer there.

## builder-spec
- at: /grain/builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%20and%20a%20stat
- status: needs-verification
- review: The spec pane is the artifact an export writes and an import reads, and it is now also the thing that proves an AI edit landed rather than merely showed. If a block op reached the canvas and not this document, the page would hand you a file describing a page you are not looking at.
- verify: Remove a block the same way as the step above, then open this drawer. The document must already be missing that block, with every other id unchanged. Ids are never renumbered, so a b3 that became b2 is a bug rather than tidiness.

## prompt
Two calls, and the first one is the reason this went into grain rather than into the portfolio.
- ask: kind-name | The kind is `block` and the verbs are block.remove, block.span, block.move, in grain's contract, so every GRAIN app gets them. Right name and right level, or should it be something wider like `region` with resize and reorder?
- ask: reasoner-next | The verbs work and nothing chooses them yet: the desk cannot turn "drop the second card" into block.remove on b2. That is the next piece and it is where the small model actually earns its place. Build it next, or widen the block set past five first?
- template: Continue the block-verbs work in the portfolio (tour {tour}).\nKind name and level: {kind-name}\nNext: {reasoner-next}\nThe plan is plans/builder-design.md D3, and the vocabulary is in grain/packages/grain/ai/contract.ts. Grain is committed and held unpublished on purpose; the portfolio resolves it through a local symlink.
- handoff: https://claude.ai/new?q={payload}
