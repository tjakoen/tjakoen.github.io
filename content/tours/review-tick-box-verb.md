---
id: review-tick-box-verb
mode: dev
title: "Review: the AI learns to tick a box"
route: /about
---
The last control the AI could not operate. The only verb the vocabulary had for a form control writes
the control's value, and a tick box's value is what the form submits rather than whether it is ticked,
so the write landed, reported success and moved nothing. There is a verb for it now, on a surface kind
of its own, and the ordering it was built in is the thing to be nervous about: the atom got its address
last, after the verb was proved on a real control, because an address that lands before a working verb
is the same false promise the missing address was protecting against. Three of these four steps are
pages people can reach. Grain is committed and still unpublished, so this only works against a local
grain.

## check:contact-copy
- at: /about#contact
- status: needs-verification
- review: A new control on a page you show people, and the one step here that is a product call rather than a technical one. It exists because the verb needed a real control to operate rather than a fixture, and it does something real: it puts your own address in the mail draft's cc, which is the only way a site with no server can give you a copy of what you sent. The address on it reads check: and not field:, and that prefix is the whole review. A field: address would advertise the verb that writes the value the form submits, which is not the state you can see.
- verify: Leave the email field empty, tick this, and press Send. The draft should open with no cc on it rather than one addressed to nobody. Then fill the email in, tick it again and Send: your own address should be in cc. If a cc appears in the first case, the empty-field guard is gone.
The tick box on a real form, and the address that decides which verb can reach it.

## field:builder-ask
- at: /builder
- status: new
- review: The builder asked you to describe a form and then gave you nowhere to describe one: the only ways in were an example link or the desk. This is a plain GET form back to the same route, which is the part worth checking rather than the box itself. The prompt becomes the address, so every state here stays a link you can send, and none of it is JavaScript.
- verify: Type a prompt and press Build it. The address bar should carry it as ?ask=, and the box below should come back holding what you typed rather than empty. Then turn JavaScript off and reload that address: the box should still be there, still hold the prompt, and Build it should still work. If it does not, this became a script and stopped being hypermedia.
The composer, and the round trip behind it.

## check:builder-consent
- at: /builder?ask=a%20name%2C%20an%20email%20and%20a%20box%20to%20agree%20to%20the%20terms
- status: needs-verification
- review: The demo generates a tick box now, and this is the step that only makes sense in the order the work was done: generating one before the verb existed would have put a control on this page that the demo's closing move could not touch, which is the page overselling itself. Nothing generated comes up pre-ticked, because a form nobody has filled in must not claim they agreed to anything. Ask the desk to build this same form and it ticks the box afterwards, visibly, in AI ink. Whether it should be ticking a consent box at all is a real question and it is in the prompt below.
- verify: On this address the box should be clear and carry the required marker. Now ask the desk in the chat to build me a form with a name, an email and a box to agree to the terms. Watch it land: the box should tick itself after the fields fill, and stay ticked. Then click it yourself twice: the AI grade should drop off on the first click and never come back. If it comes up already ticked before the desk acts, a generated form is claiming consent nobody gave.
The generated tick box, and the closing move that reaches it.

## catalog:check-from-data
- at: /catalog
- status: changed
- review: This entry shipped with a deliberate hole in it and the hole is closed. It used to carry no address at all, and the doc said why: there was no verb that could tick a box, so an address would have advertised an operation nothing could perform. There is an address now and it reads check:, which is the same reasoning arriving at the opposite answer rather than the limit being tidied away. The conformance test was replaced rather than deleted, because what needs guarding now is where the binding sits: on the control, never on the label around it.
- verify: Open the markup panel under this entry and find the data-surface. It should be on the input and read check:, not field:, and the label wrapping it should carry none. Compare against the Field entry above, whose control carries a field: address. If both read field:, the two kinds have been merged and the write that lands silently wrong is back on the menu.
The atom's address, arriving last on purpose.

## prompt
Two calls the walk cannot make, and one thing only a second reader can settle.
- ask: copy-box | Copy me in is a new control on the published About form. It exists because the verb needed a real control rather than a fixture, and it does something real. Keep it, or drop it (one entry in one JSON file plus its tag)?
- ask: consent-tick | The desk ticks the generated consent box in the demo. A box it leaves alone demonstrates nothing, the form submits nowhere, and the state is AI ink any click settles. But an AI ticking consent on someone's behalf reads badly even in a demo. Keep it ticking consent, or tick only the newsletter and copy boxes?
- ask: names | The kind is check, the verb check.set, the render op tick, and the three new labels are I agree to the terms, Send me occasional updates and Copy me in. Cheap to change while nothing is published. Settle them, or keep them?
- template: Continue the builder sandbox work in the portfolio (tour {tour}).\nCopy me in box: {copy-box}\nConsent tick: {consent-tick}\nNames: {names}\nThe verb is check.set and its spec is grain/packages/grain/plans/check-set-op.md. Sandbox pieces 3, 4 and 5 are next in plans/builder-sandbox.md: the AI narrating its selection, the preview tab with a code switcher, and the catalog sidebar default. Grain 0.1.22 is held unpublished on purpose and the portfolio resolves it through a local symlink.
- handoff: https://claude.ai/new?q={payload}
