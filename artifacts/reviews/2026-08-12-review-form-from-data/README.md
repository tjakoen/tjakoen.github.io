# Capture: Review: the contact form comes from a data file

Tour review-form-from-data, dev mode. Captured 2026-08-12T20:04:34.704Z.

The app under review was http://localhost:3000, loaded through PANTRY at http://localhost:57232, so these are
the bytes the review serves, injection included, rather than the ones the app serves directly.
The box is not the review's: this is a plain 1280 by 800 window, while the live
embed sits in a frame beside the rail and is narrower than that. A layout that turns on a
breakpoint can differ between the two.
CSS transitions and animations are off, so a shot is a settled state rather than a frame of one.
Motion driven by script, video or an animated image is not something this can stop.

All 3 steps resolved.

## Steps

### 1. field:contact-name

- verdict: ok
- status: new
- url: http://localhost:57232/about#contact
- page shot: 01-field-contact-name.png
- element shot: 01-field-contact-name-element.png
- verify: Tab from Name into Email, then press Send with both empty. The browser should stop you on Name first, then on Email, and the email field should reject a value with no at sign. If either one submits, the required flag did not survive the render.

### 2. field:contact-topic

- verdict: ok
- status: known-issue
- url: http://localhost:57232/about#contact (no navigation; the page the step before it left)
- page shot: 02-field-contact-topic.png
- element shot: 02-field-contact-topic-element.png
- verify: Choose Hiring, fill the two fields above, and press Send. The draft your mail app opens should carry the subject "Contact from the site: Hiring". Change the choice and send again; the subject should follow it. If the subject keeps the old topic, the select and the handoff have come apart.

### 3. contact-form

- verdict: ok
- status: needs-verification
- url: http://localhost:57232/about#contact (no navigation; the page the step before it left)
- page shot: 03-contact-form.png
- element shot: 03-contact-form-element.png
- verify: Fill both fields, press Send, and watch what opens. It should be a draft in your own mail client, addressed to me, with the subject set from the choice and the body starting with From. Nothing should leave the browser before you press send there yourself. Then reload the page: the fields should be empty again, because nothing was stored.

Machine-readable: capture.json.
