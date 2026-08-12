# Capture: Review: the builder page, and who actually wrote what

Tour review-builder-demo, dev mode. Captured 2026-08-12T22:22:28.554Z.

The app under review was http://localhost:3011, loaded through PANTRY at http://localhost:61981, so these are
the bytes the review serves, injection included, rather than the ones the app serves directly.
The box is not the review's: this is a plain 1280 by 800 window, while the live
embed sits in a frame beside the rail and is narrower than that. A layout that turns on a
breakpoint can differ between the two.
CSS transitions and animations are off, so a shot is a settled state rather than a frame of one.
Motion driven by script, video or an animated image is not something this can stop.

All 3 steps resolved.

## Steps

### 1. builder-form

- verdict: ok
- status: new
- url: http://localhost:61981/builder?ask=A%20contact%20form%20with%20a%20name%2C%20an%20email%2C%20a%20big%20message%20box%2C%20and%20a%20file%20upload
- page shot: 01-builder-form.png
- element shot: 01-builder-form-element.png
- verify: Ask the desk in the chat panel to build you a form with a name, an email and a big message box. It should travel here on a fresh address, and the fields should fill in one at a time, each carrying the grain treatment that marks AI ink, the message box included. The choice, if the prompt produced one, should not move and should not get that treatment.

### 2. builder-refusals

- verdict: ok
- status: needs-verification
- url: http://localhost:61981/builder?ask=A%20contact%20form%20with%20a%20name%2C%20an%20email%2C%20a%20big%20message%20box%2C%20and%20a%20file%20upload (no navigation; the page the step before it left)
- page shot: 02-builder-refusals.png
- element shot: 02-builder-refusals-element.png
- verify: Edit the address to drop the words file upload and reload. This block should disappear entirely rather than render empty, and the form above should still hold the name, the email and the message box.

### 3. builder-spec

- verdict: ok
- status: needs-verification
- url: http://localhost:61981/builder?ask=A%20contact%20form%20with%20a%20name%2C%20an%20email%2C%20a%20big%20message%20box%2C%20and%20a%20file%20upload (no navigation; the page the step before it left)
- page shot: 03-builder-spec.png
- element shot: 03-builder-spec-element.png
- verify: Change the description in the address to ask for a name, a phone number and a timeline, then reload. The JSON should list the fields in the closed set's own order rather than the order you typed, the messages array should be empty because you did not ask for one, and the form above should match it item for item.

Machine-readable: capture.json.
