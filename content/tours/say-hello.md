---
id: say-hello
mode: demo
title: "Say hello, with the draft already started"
route: /
---
The desk is mostly things to read. One control on it actually reaches me, and it is the compose
window in the mail app. This short walk goes there and leaves a draft in the box, so you can watch the
tour write into the same field you would type in, through the same door the assistant uses. It writes
the draft. Sending it stays yours.

## screen
- verify: The lamp should sit on the app shell, and the card should say 1 of 3.
This is the desk. The rail, the tabs, and the panel on the right are all live surfaces with their own
addresses, which is what lets a tour, or an assistant, point at any one of them.

## chat-input
- verify: Type an intent and watch the lamp travel to whatever the assistant touches; the tour keeps its place.
This is the door. Everything the assistant does to this page goes through it, one verb at a time, on
a surface the page registered. The last step of this tour goes through the same door, because a tour
has no private channel of its own.

## field:contact-message
- at: /mail#compose
- status: needs-verification
- review: The first step that stages state. A `prefill` line on a step whose surface is a `field:` address hands its text to grain's `field.set`, the same verb the assistant writes with, and it refuses a field you have already touched. It is also why the compose panel now answers to `#compose` on a cold load: the panel starts collapsed, CRUMB has no flow verbs on purpose, so without a working deep link there was nothing a tour could do to reach this field at all. Nobody has walked this yet, and it cannot run on the live site until the crumb pin bumps past the version that has never heard of `prefill`.
- verify: Arrive here from the previous step: the compose panel should already be open, the message box should hold a short draft with a line on the card saying the tour staged it, and Send should be untouched. Open /mail#compose in a fresh tab, with no tour running: the panel should be open on arrival, no click. Then type over the draft, walk Back and Forward: your own words must survive.
- prefill: Hi Tjakoen,\n\nI came in through the notes and ended up taking the tour. I would like to hear how this holds up on a real project, and what it cost you to get there.\n\nNo rush.
Here is the compose window, and the draft in it is the tour's, not yours. It typed that message into
the same box you would type in, using the same verb the assistant uses, and it stopped there. Nothing
has been sent, and nothing will be: Send is a control the tour cannot reach. Type over the draft
whenever you like, it will not write on top of your words.
