---
id: review-builder-demo
mode: dev
title: "Review: the builder page, and who actually wrote what"
route: /builder?ask=A%20contact%20form%20with%20a%20name%2C%20an%20email%2C%20a%20big%20message%20box%2C%20and%20a%20file%20upload
---
A new page, so it is worth walking rather than reading. Type a description into the address, and code
picks the fields from a closed list, the server renders them through the same three tags every time,
and the desk can then fill the ones it just generated. The prompt in this tour's own address asks for
a message box, which used to be refused and now builds, and for a file upload, which is still refused
and shows what an honest limit looks like. Nothing on the page was written by the model, and the page
says so; that sentence is the one I would most like checked, because it is the difference between a
demo and a claim.

## builder-form
- at: /builder?ask=A%20contact%20form%20with%20a%20name%2C%20an%20email%2C%20a%20big%20message%20box%2C%20and%20a%20file%20upload
- status: new
- review: The tags above the form never change between runs, which is the thing worth seeing. There are three of them now: a message box is a different component from a text field, because a component cannot choose which component it is, so the spec carries a separate array and the page composes a separate tag. The message box below is a real textarea from grain's new atom, not a text input wearing the label.
- verify: Ask the desk in the chat panel to build you a form with a name, an email and a big message box. It should travel here on a fresh address, and the fields should fill in one at a time, each carrying the grain treatment that marks AI ink, the message box included. The choice, if the prompt produced one, should not move and should not get that treatment.
The live form, rendered from the description in the address bar.

## builder-refusals
- at: /builder?ask=A%20contact%20form%20with%20a%20name%2C%20an%20email%2C%20a%20big%20message%20box%2C%20and%20a%20file%20upload
- status: needs-verification
- review: The file upload is refused rather than faked: no file-input atom exists and there is nowhere on a static site to put an uploaded file. The message box used to sit in this list for the same shape of reason, and it came out the day the atom landed rather than being softened where it stood. A refusal that outlives its cause reads as a considered limit, which is worse than no refusal at all.
- verify: Edit the address to drop the words file upload and reload. This block should disappear entirely rather than render empty, and the form above should still hold the name, the email and the message box.
The refusal list, which is the honest half of the demo.

## builder-spec
- at: /builder?ask=A%20contact%20form%20with%20a%20name%2C%20an%20email%2C%20a%20big%20message%20box%2C%20and%20a%20file%20upload
- status: needs-verification
- review: The form, the refusal and this JSON all come from one call, so the page cannot show you a spec that disagrees with the controls above it. Read the messages array: it carries no type key, because a textarea has none, and no rows either, because height is presentation and rides on the tag for the whole form rather than per item.
- verify: Change the description in the address to ask for a name, a phone number and a timeline, then reload. The JSON should list the fields in the closed set's own order rather than the order you typed, the messages array should be empty because you did not ask for one, and the form above should match it item for item.
The spec the page was rendered from, printed as it came back.

## prompt
Two calls the walk cannot make, both about how far this goes rather than whether it works.
- ask: model-wording | Nothing here is model-written today. Wire the wording seam next so the labels really are composed, or ship the demo as selection only and say so?
- ask: next-gap | The textarea was the first of five gaps the grain plan lists. Checkbox and radio in the field frame is the next one down. Take it next, or stop adding controls and ship what is here?
- ask: demo-home | Does this stay at /builder, and does the About form stay as it is now that a second form exists on the site?
- template: Continue the form builder work in the portfolio (tour {tour}).\nModel wording call: {model-wording}\nHome call: {demo-home}\nNext gap call: {next-gap}\nThe plan is grain/packages/grain/plans/form-from-data.md section 8. Grain is committed and held unpushed on purpose, and the portfolio resolves it through a local symlink.
- handoff: https://claude.ai/new?q={payload}
