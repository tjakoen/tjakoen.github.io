---
id: review-block-chooser
mode: dev
title: "Review: the model picks the verb, and the fence holds"
route: /grain/builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
---
The verbs shipped a day before anything could choose one, and the first thing that could was a word
list. That worked and it was pointed the wrong way: a page whose whole argument is building with AI
should not be reaching its decisions without one. So the 0.5B running in your browser now reads
what is on the page and answers with one move. Nothing it says is trusted. grain parses it, grain
validates it against the same manifest the model was shown, and the portfolio narrows what survives
to the three verbs that edit a page and their closed word lists. When the model cannot run at all,
the page says so rather than falling back to something that is not the model. Grain is committed and
held unpublished, so this only works against a local grain, and the model only runs where WebGPU
does.

## builder-said
- at: /grain/builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
- status: needs-verification
- review: A prompt is routed before it is read, and this line says what happened to it. A description composes and this line stays away. An edit says what the model chose, naming the block, before the op lands. A refusal says why nothing moved. The routing itself is grammar rather than a word list, and that rule was bought with a real defect: "a form to sign up" contains " up ", so the old chooser read it as a move and refused to build the form it was asked for.
- verify: Type "another card" and press Build it, and this line must stay hidden, because that is a description. Then type "a card above the fold", which carries both "the" and "card": it must also compose, because the article is pointing at a fold. Then type "drop the second card" and watch the line name a block before anything moves.

## builder-canvas
- at: /grain/builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
- status: needs-verification
- review: This is the step to be sceptical at, and it is the one thing no test in the repo can tell you. Headless CI has no WebGPU, so the e2e drives a scripted engine: it proves the chain and not the model. What is unproven is whether the 0.5B, asked for "the second card", hands back the second card. Validation cannot help there. A wrong block is a real block, and b2 is as legal an address as b4.
- verify: Add a second card so the page holds b1 lede, b2 card, b3 callout, b4 card. Type "drop the second card" and watch WHICH one goes. It should be b4. If it is b2, the fence did its job and the model still got it wrong, which is worth knowing and worth saying on the page.
- note: If the said line reports that the desk cannot run, you are on a machine or a browser without WebGPU. That is the honest offline state and it was the owner's call over a word-list fallback.

## builder-rail
- at: /grain/builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
- status: changed
- review: The rail prints ids in mono so a sentence can use one, and the prompt the model is handed names those same ids literally. A 0.5B copies far better than it counts, so "pick one of b1, b2, b3, b4" is a copy where "the second card" is a filter and a count.
- verify: Type "make b2 full width" and watch the chip move on that row and no other. Naming the id directly is the sentence with the least left for the model to get wrong, so if this one misses, the seam is broken rather than the model being weak.

## wb-drawer
- at: /grain/builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
- status: changed
- review: D4, the copy, rewritten twice in one day: once for someone operating a tool rather than reading an argument, and again once the model took over the choosing, because the first version described a page that no longer existed. It now says which half the model does, which half code fences, and what happens when the model cannot run.
- verify: Read the paragraph about the fence and check it against what you just watched. If the page claims a check it does not make, that is the failure this whole demo argues against.

## prompt
Two calls, and the first one is what the reversal left open.
- ask: audit-scenario | Nothing measures whether the real 0.5B picks the right block. `bun run audit:desk` drives a live model through WebGPU and scores desk chat scenarios, not builder edits. Add a builder scenario to it next, or ship this unmeasured and watch it in the demo?
- ask: block-set-width | The block set is still five: lede, card, callout, stat, form. A wider set gives the model more to operate on and more to get wrong. Widen it next, or leave it at five?
- template: Continue the builder work in the portfolio (tour {tour}).\nAudit scenario: {audit-scenario}\nBlock set: {block-set-width}\nThe plan is plans/builder-design.md, D5 is done. The model picks the verb through desk-reasoner's `complete` seam; grain validates; src/ai/block-reasoner.ts narrows. There is deliberately no fallback when the model cannot run. Grain is committed and held unpublished on purpose; the portfolio resolves it through a local symlink.
- handoff: https://claude.ai/new?q={payload}
