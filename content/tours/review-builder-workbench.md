---
id: review-builder-workbench
mode: dev
title: "Review: /builder stops looking like a page about a builder"
route: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%2C%20a%20stat%2C%20and%20a%20form%20with%20a%20name%2C%20an%20email%2C%20a%20topic%20and%20a%20box%20to%20agree%20to%20the%20terms
---
The page worked and read like an essay that happened to contain a builder, because structurally it
was one: the shared reading column, a masthead, a lede and five muted paragraphs. It is a workbench
now, built out of the pane vocabulary /mail already ships rather than a second visual language.
The change that matters most is not the chrome. You can delete a block. composition.ts has had
removeBlock, moveBlock and setSpan since the day it was written and nothing but a unit test had ever
called one, so the canvas was append-only and every mistake was permanent until you started over.
Two steps here are stamped needs-verification and both are judgment calls rather than bugs.

## builder-rail
- at: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%2C%20a%20stat%2C%20and%20a%20form%20with%20a%20name%2C%20an%20email%2C%20a%20topic%20and%20a%20box%20to%20agree%20to%20the%20terms
- status: new
- review: The whole reason the page felt like a result rather than a tool. Each row is one block: the id, the kind, its span as three chips you press, and a remove. The ids are the risky part, and they are deliberately not renumbered when you delete: b3 stays b3 so a later op still names the block it means.
- verify: Remove b2 and check the canvas keeps b1 and b3 with their names unchanged. Press full on b3 and watch only that block widen. Press the up arrow on the first row: nothing should happen rather than wrapping to the bottom. Then type "a stat" and build: the new block should be b6, not b5, because the ids come from what has been issued rather than from how many are left.

## field:builder-ask
- at: /builder
- status: changed
- review: The prompt moved to the top of the workbench, and that was a mockup's finding rather than a preference: a command line under the canvas lands exactly where the terminal dock already is, and two things wanting the same edge of the screen is not something styling fixes. It is still a plain GET form back to the same route, so the address still carries the prompt and it still works with no JavaScript.
- verify: Type a prompt on this empty page and press Build it. The canvas should fill with no page reload and the rail should grow a row per block. Now turn JavaScript off and reload with a prompt in the address: the server should render the same canvas and the rail should still list what is on it, as a readable list with buttons that do nothing.

## builder-canvas
- at: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20a%20callout%2C%20a%20stat%2C%20and%20a%20form%20with%20a%20name%2C%20an%20email%2C%20a%20topic%20and%20a%20box%20to%20agree%20to%20the%20terms
- status: needs-verification
- review: The canvas is a pane with its own scroll and a head naming what you are building, and its grid now keys off the PANE rather than the window. That is the fix for half stopping meaning half the moment anything else appeared beside it, and it is the step worth checking because a container query is easy to write and easy to have written against the wrong element.
- verify: Press the assistant-panel toggle in the title bar to open the chat beside this. The canvas should get narrower and every block should go full width, without the window changing size at all. Press it again and the two-up layout should come back. Then drag the window narrow: the rail should drop below the canvas rather than squeezing it.

## builder-refusals
- at: /builder?ask=A%20card%2C%20a%20gallery%20of%20screenshots%2C%20and%20a%20side%20rail
- status: changed
- review: The refusals moved into the rail, under their own head, because they are about the same prompt as the rows above them and a third box would have been a third thing to look at. The two kinds still have to stay distinguishable: page furniture refused on principle, everything else a gap with a date on it.
- verify: Read both entries in the rail. One should say a side rail is the frame a page sits in rather than content it can hold; the other should say a picture needs a real image to point at. Check they sit under the block row for the card rather than in a pane of their own.

## builder-spec
- at: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20and%20a%20callout
- status: needs-verification
- review: The spec and the honest-limits prose moved into drawers under the tool, closed. This is the judgment call: the prose is good writing about who wrote what and what this will not do, and burying it is exactly how a demo stops being honest. The argument for is that a work surface should not open with five paragraphs of argument; the argument against is that nobody opens a closed drawer.
- verify: Open the two drawers under the workbench and read them. Decide whether the honest-limits one should be open by default, or moved to a page of its own, or left as it is. The answer is a question in the prompt below rather than something this walk can settle.

## prompt
Three calls the walk cannot make.
- ask: prose-home | The honest-limits prose sits in a closed drawer under the tool. Leave it closed, open it by default, or move it to a page of its own and link it?
- ask: aside-default | This screen gives up the assistant column by default and the title-bar toggle brings it back for the session. Next visit hides it again, so the screen's default wins over a preference. Keep that, or let a press stick?
- ask: next | D3 is the desk operating the builder, which is what the 2GB model ask needs: addresses on the blocks and verbs that reach them. D4 is rewriting the prose for a tool. Which one, and does the block set widen past five first?
- template: Continue the builder design work in the portfolio (tour {tour}).\nProse home: {prose-home}\nAside default: {aside-default}\nNext: {next}\nThe plan is plans/builder-design.md, D1 and D2 are done. No block: surface ships until a verb exists, which is the tick box's lesson and D3's whole ordering. Grain 0.1.22 is held unpublished on purpose and the portfolio resolves it through a local symlink.
- handoff: https://claude.ai/new?q={payload}
