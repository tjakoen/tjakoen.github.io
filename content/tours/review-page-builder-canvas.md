---
id: review-page-builder-canvas
mode: dev
title: "Review: /builder becomes a page builder, and starts working where it lives"
route: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20and%20a%20callout
---
Two changes, and the second is the one to be nervous about. The page now composes a PAGE from a
closed set of GRAIN blocks rather than a form from a closed set of fields, and a form is one block
among them. Underneath that, the published /builder has never done anything: this site exports to a
static host, which serves one frozen file whatever the address says, so every example link here has
landed on an empty page for the page's whole life. The browser composes now, by cloning blocks the
real renderer pre-rendered into a hidden library. Nothing about the form path moved address, and the
step that proves that is the second one.

## builder-canvas
- at: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20and%20a%20callout
- status: new
- review: The whole feature, and it is one loop calling the one renderer, because render takes the component name as a runtime string. Layout is three words, so a description can ask for two things beside each other and never for a grid. The risk is in what is NOT here: a block template's design commentary used to ship with it, and the canvas strips HTML comments at the edge rather than the templates going quiet.
- verify: Count three blocks side by side, each one real GRAIN markup rather than a picture of it. Now narrow the window under about 40rem: every block should go full width rather than staying a third of a phone. Then View Source on this page and search for a comment marker inside a canvas cell. There should be none, and the data-field attributes should still be there.
The canvas: a composition, rendered by the same engine as every other page here.

## builder-form
- at: /builder?ask=An%20intro%2C%20a%20card%2C%20and%20a%20form%20with%20a%20name%2C%20an%20email%20and%20a%20box%20to%20agree%20to%20the%20terms
- status: changed
- review: The form stopped being the subject of this page and became one block on it, and this address is the claim that costs nothing: field-matcher.ts is untouched, every control keeps the address it had, and the tick box still carries a check: address rather than a field: one. The surface moved from the page template onto the block template so a tour and two e2e specs would keep resolving, which is the part most likely to have quietly broken.
- verify: Find the form at the bottom of the canvas. This screen gives up the assistant column by default, so press the panel toggle in the title bar to bring the chat back, then ask the desk to build me a form with a name, an email and a box to agree to the terms, and watch it fill the fields and tick the box. If the desk fills nothing, the addresses moved with the markup and the door lost them.
A form is one block now, at the same address, operable the same way.

## field:builder-ask
- at: /builder
- status: needs-verification
- review: The composer stopped being a round trip and started adding. A prompt appends to what is already on the canvas, which is the whole difference from the form demo, and it is now handled in the browser rather than by the server. That has an honest cost worth checking rather than trusting: the address carries only the latest prompt, so a reload rebuilds from that prompt alone rather than from everything you added.
- verify: On this empty page type an intro and press Build it. One block should appear with no page reload. Type a stat and a callout and press it again: three blocks, the first one still there. Now reload: you should be back to one stat and one callout, and the page says so under the button. Turn JavaScript off and reload this address with a prompt in it: the server should render the same canvas, which is the fallback that keeps this hypermedia.
The composer, and the page you build up rather than re-roll.

## builder-refusals
- at: /builder?ask=A%20card%2C%20a%20gallery%20of%20screenshots%2C%20and%20a%20side%20rail
- status: changed
- review: Two tables can refuse one description and they refuse different kinds of thing, so both now land in one list rather than one of them being dropped. The honest half of the demo is that the two reasons stay distinguishable: page furniture is refused on principle, everything else is a gap with a date on it. A field-level refusal now survives an ask that produced no form at all, which it did not before.
- verify: Read the two entries. One should say a side rail is the frame a page sits in rather than content it can hold; the other should say a picture needs a real image to point at. Then ask for a card and a file upload for their portfolio: the upload should still be refused even though nothing here is a form.
Refusals from two tables, in one list, still saying which kind they are.

## builder-spec
- at: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20and%20a%20callout
- status: needs-verification
- review: This pane used to print a field spec and now prints the composition document, which is the artifact an export writes and an import reads back. It is also load-bearing rather than decorative: the browser reads its own state back out of this pane on load, so a page can tell a fresh visit from one the server already composed. That double duty is the reason to look at it carefully rather than skim it.
- verify: Read the JSON: a version, then one block per cell with an id, a component, a span, and its data. A form block's data should be exactly what matchSpec returns, one level in. Now open this same address with the network throttled or the server stopped after load, add a prompt, and check the pane grows a block rather than starting over.
The composition, as the thing you take away and as the page's own memory.

## prompt
Two calls are the owner's and neither is answered by walking this.
- ask: static-fix | P3 shipped the static-host fix: a hidden library of pre-rendered blocks, a client that clones and fills them, one extra module frozen into the export. It works, and `bun run export` then serving dist/ builds a page with no server running. Was the complexity worth it, or should /builder have said honestly that it needs the live app? Keep it, or tear it back out?
- ask: block-words | Every word on a composed page is deterministic sample content from the block table, so a card always says "No build step". Keep it code-owned, or wire the model's wording seam so a description can name what a card says, knowing a 0.5B invents there?
- ask: next | P4 is the three exports and P5 is the preview tab and the catalog sidebar. Which one next, and does the block set widen past five first?
- template: Continue the site-builder work in the portfolio (tour {tour}).\nStatic-host fix: {static-fix}\nBlock wording: {block-words}\nNext phase: {next}\nThe plan is plans/site-builder.md, P2 and P3 are done. The comment strip decision landed in ai/canvas.ts and P4's export inherits it. One line outside the scope cap: tools/export.ts MODULE_ENTRIES gained the builder island, without which the frozen page 404s on its own script. Grain 0.1.22 is held unpublished on purpose and the portfolio resolves it through a local symlink.
- handoff: https://claude.ai/new?q={payload}
