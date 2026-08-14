---
id: review-block-chooser
mode: dev
title: "Review: a sentence picks the verb"
route: /builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
---
The verbs shipped a day before anything could choose one. A block could be dropped, resized and
moved, every cell carried an address, and the only thing that ever raised one of those Intents was a
test. This is the half that chooses: "drop the second card" is resolved against the blocks actually
on the canvas, turned into `block.remove` on a real id, and sent out the same door a rail button
uses. Nothing here is a model. The verbs are three, the widths are three, the directions are two, and
a target is something already on the page with its id printed in the rail, so there is nothing left
in the sentence for a small model to invent. Grain is committed and held unpublished, so this only
works against a local grain.

## builder-said
- at: /builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
- status: needs-verification
- review: A prompt is read twice now, and this line says which reading won. A description composes and this line stays away. An edit says what it is about to do before the door does it. A refusal says what it counted and changes nothing. The line is written straight to the element rather than bound through the view, because the view repaints every time an op lands and a bound line would blank itself at the moment it came true.
- verify: Type "another card" and press Build it, and this line must stay hidden, because that is a description and descriptions add. Then type "drop the second card" and it must read "Dropping b4." and the canvas must lose one block. Then type "remove the card" on a page holding two and it must say it counted 2 cards and the canvas must not move at all.

## builder-canvas
- at: /builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
- status: needs-verification
- review: The chain this step is really checking has five links and only the first one is new. The chooser resolves a target, the door validates the Intent, grain's reasoner answers with a render op, the dispatcher applies it to the addressed cell, and this page derives its composition back off the DOM. If a block edit shows and then comes back on the next prompt, the last link is the one that broke.
- verify: Add a second card, then type "drop the second card". Watch which one goes: it must be the second CARD, which is b4, and not the second block, which is b2. Then type "a stat" and press Build it. The dropped card must not reappear, and the new stat must be b5 rather than reusing a freed id.
- note: The honest failure mode to try on purpose is the door being down. Nothing applies an op locally when it is, because a page that quietly did the edit itself would be the rail wearing a prompt bar and would prove nothing.

## builder-rail
- at: /builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
- status: changed
- review: The rail is the reference the vocabulary was shaped against, and it is also how a person names a target. Ids are printed here in mono precisely so a sentence can use one, which is the third way in besides kind and position.
- verify: Type "make b2 full width" and watch the chip move on that row and no other. Then type "make the callout wider" and read the refusal: a width is a set of three words and never a nudge, for the same reason check.set is a set rather than a toggle, so a replay lands where it says.

## wb-drawer
- at: /builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
- status: changed
- review: D4, the copy. This was five paragraphs of argument written for someone reading a case, on a page whose job is now to be operated. It is shorter, it leads with what you can type, the vocabulary is a list rather than a paragraph, and the sentence about editing is in it at all, which it was not before. It stays closed by default, which was the owner's call on 2026-08-14.
- verify: Open it and read only the list. Someone who reads those four lines and nothing else should be able to operate this page. Then check the drawer was shut when you arrived.

## prompt
Two calls, and the second one is the one that decides how far this goes.
- ask: chooser-reach | The chooser is a word list: three verbs, three widths, two directions, and a target that is a kind, a position or an id. It refuses what it cannot resolve rather than guessing. Leave it deterministic, or let the 0.5B take the sentences the word list misses?
- ask: block-set-width | The block set is still five: lede, card, callout, stat, form. A wider set gives the verbs more to operate on and gives the matcher more to get wrong. Widen it next, or leave it at five and take the wording seam instead?
- template: Continue the builder work in the portfolio (tour {tour}).\nChooser reach: {chooser-reach}\nBlock set: {block-set-width}\nThe plan is plans/builder-design.md, D3b and D4 are done. The chooser is src/ai/block-command.ts and it goes out through window.grain.door, never through the page's own applyOp. Grain is committed and held unpublished on purpose; the portfolio resolves it through a local symlink.
- handoff: https://claude.ai/new?q={payload}
