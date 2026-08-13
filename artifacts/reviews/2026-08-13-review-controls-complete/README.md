# Capture: Review: the field frame covers every control

Tour review-controls-complete, dev mode. Captured 2026-08-13T04:03:59.527Z.

The app under review was http://localhost:3111, loaded through PANTRY at http://localhost:55837, so these are
the bytes the review serves, injection included, rather than the ones the app serves directly.
The box is not the review's: this is a plain 1280 by 800 window, while the live
embed sits in a frame beside the rail and is narrower than that. A layout that turns on a
breakpoint can differ between the two.
CSS transitions and animations are off, so a shot is a settled state rather than a frame of one.
Motion driven by script, video or an animated image is not something this can stop.

All 5 steps resolved.

## Steps

### 1. catalog:checkbox

- verdict: ok
- status: new
- url: http://localhost:55837/catalog
- page shot: 01-catalog-checkbox.png
- element shot: 01-catalog-checkbox-element.png
- verify: Look at the Required panel and the Default panel side by side. In both, the label should sit beside the box and wrap inside itself rather than falling to the line underneath. Then click anywhere on the label text, not on the box: it should tick. If only the box itself responds, the tap target has shrunk to the box and the phone case is broken.

### 2. catalog:radio

- verdict: ok
- status: new
- url: http://localhost:55837/catalog (no navigation; the page the step before it left)
- page shot: 02-catalog-radio.png
- element shot: 02-catalog-radio-element.png
- verify: In the group panel, click each of the three in turn. Exactly one should stay filled, because they share a name. Then tab into the group and use the arrow keys: they should move the selection, which is the native behaviour a drawn replacement would have cost. Check the dots are round and the tick boxes above are square, so the two controls are still telling you apart.

### 3. catalog:check-from-data

- verdict: ok
- status: known-issue
- url: http://localhost:55837/catalog (no navigation; the page the step before it left)
- page shot: 03-catalog-check-from-data.png
- element shot: 03-catalog-check-from-data-element.png
- verify: Read the section headed why this one carries no address, then open the markup panel underneath and look for a data-surface. There should not be one. Compare it against the Field or Memo entries, which both carry one on their control. If a surface has appeared here, someone tidied away a limit rather than closing it.

### 4. catalog:input

- verdict: ok
- status: new
- url: http://localhost:55837/catalog (no navigation; the page the step before it left)
- page shot: 04-catalog-input.png
- element shot: 04-catalog-input-element.png
- verify: Compare the Required panel with the Default one: the required label should carry a marker and the default should not, with no difference in the markup underneath except the attribute. Then go to the About page, open the Contact tab, and check the same marker has appeared on Name and Email without that page being edited. If it has not, the frame is not reaching a form rendered from data.

### 5. catalog:form-grid

- verdict: ok
- status: needs-verification
- url: http://localhost:55837/catalog (no navigation; the page the step before it left)
- page shot: 05-catalog-form-grid.png
- element shot: 05-catalog-form-grid-element.png
- verify: Narrow the window slowly and watch the default example. Columns should drop one at a time and nothing should ever scroll sideways, at any width down to a phone. The message box should stay full width the whole way. Then look at the two-column example inside its panel and see the limit above for yourself: it keeps both columns even though the panel is narrow, which is the case the doc tells you to avoid.

Machine-readable: capture.json.
