---
id: review-builder-demo
mode: dev
title: "Review: the builder page, and who actually wrote what"
route: /builder?ask=A%20contact%20form%20with%20a%20name%2C%20an%20email%2C%20and%20a%20big%20message%20box%20for%20details
---
A new page, so it is worth walking rather than reading. Type a description into the address, and code
picks the fields from a closed list, the server renders them through the same two tags every time,
and the desk can then fill the text fields it just generated. The prompt in this tour's own address
asks for a message box on purpose, so the refusal is visible on the first step. Nothing on the page
was written by the model, and the page now says so; that sentence is the one I would most like
checked, because it is the difference between a demo and a claim.

## builder-form
- at: /builder?ask=A%20contact%20form%20with%20a%20name%2C%20an%20email%2C%20and%20a%20big%20message%20box%20for%20details
- status: new
- review: The tag above the form never changes between runs, which is the thing worth seeing. Underneath it is the thing this page found: the atoms addressed the label around each control, so nothing generated could be filled, and the page carried a script to move every address down by hand. Grain 0.1.22 fixed the atoms and that script is gone, so what you are looking at now is the plain claim with nothing propping it up.
- verify: Ask the desk in the chat panel to build you a form with a name, an email and a phone number. It should travel here on a fresh address, and the text fields should fill in one at a time, each carrying the grain treatment that marks AI ink. The choice, if the prompt produced one, should not move and should not get that treatment.
The live form, rendered from the description in the address bar.

## builder-refusals
- at: /builder?ask=A%20contact%20form%20with%20a%20name%2C%20an%20email%2C%20and%20a%20big%20message%20box%20for%20details
- status: needs-verification
- review: The message box is refused rather than faked, because the textarea atom is not built and the field frame has no rule for one. A single-line input pretending to be a message box would have been the easy lie here.
- verify: Edit the address to drop the words message box and reload. This block should disappear entirely rather than render empty, and the form above should still hold the name and the email.
The refusal list, which is the honest half of the demo.

## builder-spec
- at: /builder?ask=A%20contact%20form%20with%20a%20name%2C%20an%20email%2C%20and%20a%20big%20message%20box%20for%20details
- status: needs-verification
- review: The form, the refusal and this JSON all come from one call, so the page cannot show you a spec that disagrees with the controls above it. Read the choice entry and note that its address stays on the label, which is what keeps the desk from reaching a select and emptying it.
- verify: Change the description in the address to ask for a name, a phone number and a timeline, then reload. The JSON should list the fields in the closed set's own order rather than the order you typed, and the form above should match it item for item.
The spec the page was rendered from, printed as it came back.

## prompt
Two calls the walk cannot make, both about how far this goes rather than whether it works.
- ask: model-wording | Nothing here is model-written today. Wire the wording seam next so the labels really are composed, or ship the demo as selection only and say so?
- ask: demo-home | Does this stay at /builder, and does the About form stay as it is now that a second form exists on the site?
- template: Continue the form builder work in the portfolio (tour {tour}).\nModel wording call: {model-wording}\nHome call: {demo-home}\nThe plan is grain/packages/grain/plans/form-from-data.md section 8. Grain is committed and held unpushed on purpose, and the portfolio resolves it through a local symlink.
- handoff: https://claude.ai/new?q={payload}
