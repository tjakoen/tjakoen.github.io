---
id: review-form-from-data
mode: dev
title: "Review: the contact form comes from a data file"
route: /about#contact
---
The Contact tab now carries a real form, and none of its markup was typed by hand. A JSON file lists
the fields, and two tags render them through grain's new b-field and b-choice atoms. This is the
first page in the estate whose controls come from data rather than from a template, so the walk is
worth doing on the page instead of in the patch. The atoms themselves are committed in grain and
still unpublished, which is why this only works against a local grain.

## field:contact-name
- at: /about#contact
- status: new
- review: Two controls came out of one tag here, and the size attribute on that tag reached both of them while the labels and types came from the data. The part I am nervous about is the quiet failure next door: a key missing from the spec warns in development and then drops the attribute in silence in production.
- verify: Tab from Name into Email, then press Send with both empty. The browser should stop you on Name first, then on Email, and the email field should reject a value with no at sign. If either one submits, the required flag did not survive the render.
The two text fields, rendered from the first array in the spec.

## field:contact-topic
- at: /about#contact
- status: known-issue
- review: The select renders from a nested array, one option per entry, and the preselected one is Something else because presuming why you are writing felt worse than asking. What is worth knowing is what this control taught us. The atoms first addressed the wrapping label, so every field here resolved to a label, a label has nothing to write into, and the desk could not fill any of them. That is fixed in grain 0.1.22 and the address now sits on the control itself. The remaining sharp edge is this control specifically: a select accepts a write that a text field would, and anything that is not one of its option values empties it rather than failing.
- verify: Choose Hiring, fill the two fields above, and press Send. The draft your mail app opens should carry the subject "Contact from the site: Hiring". Change the choice and send again; the subject should follow it. If the subject keeps the old topic, the select and the handoff have come apart.
The choice, rendered by the sibling atom that owns the select.

## contact-form
- at: /about#contact
- status: needs-verification
- review: There is nowhere to submit to on a static site, so Send builds a mail draft and hands it to your own mail application. The draft carries your name and the email you typed, and nothing else, because there is no message box: the textarea atom is not built and grain has no rule for one yet. That gap is the thing I would most like a second opinion on.
- verify: Fill both fields, press Send, and watch what opens. It should be a draft in your own mail client, addressed to me, with the subject set from the choice and the body starting with From. Nothing should leave the browser before you press send there yourself. Then reload the page: the fields should be empty again, because nothing was stored.
The form as a whole, and the one honest limit it has to state out loud.

## prompt
Three questions the walk cannot answer, because they are calls rather than checks.
- ask: textarea-shape | The textarea atom is now next in the queue. When it lands, does this form grow a message field and stop handing the body to a mail client, or does the handoff stay as it is?
- ask: choice-write | The addressing is fixed, so a choice is now reachable and a bad write empties it silently. Guard the dispatcher against that, leave it to every caller to send option values, or keep choices out of reach some other way?
- ask: placement | Is the Contact tab the permanent home for this form, or is it standing in until the builder demo has a page of its own?
- template: Continue the form builder work in the portfolio (tour {tour}).\nTextarea shape: {textarea-shape}\nChoice write call: {choice-write}\nPlacement call: {placement}\nThe plan is grain/packages/grain/plans/form-from-data.md section 8. Grain is committed and held unpushed on purpose, and the portfolio resolves it through a local symlink.
- handoff: https://claude.ai/new?q={payload}
