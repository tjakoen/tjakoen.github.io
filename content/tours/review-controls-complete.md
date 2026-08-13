---
id: review-controls-complete
mode: dev
title: "Review: the field frame covers every control"
route: /catalog
---
The field family had four gaps left after the textarea landed, and the owner asked for all of them in
one answer. They are closed: a tick box and a radio in the frame, a data-first sibling that renders
either from a spec, the two message slots, the required marker, and a grid to lay several fields out.
The walk is on the catalog because that is where every one of them renders from its own doc, and
because one of them ships with a deliberate hole in it that is easier to show than to describe. The
atoms are committed in grain and still unpublished, so this only works against a local grain.

## catalog:checkbox
- at: /catalog
- status: new
- review: A tick box in the field frame, not the switch that already existed. The switch is a state you flip and this is a box you tick and then submit, which is a different thing to reach for. Two decisions are visible here. The row layout keys off the control being present rather than off a modifier class, so there is no variant to remember and none to forget. And the label reads at full ink rather than muted, because in a column the label captions a control that shows its own value, while in a check row the label is the value, the sentence being agreed to. The native control is kept as the platform draws it: drawing a replacement would need a hardcoded color to fill, which the tokens-only rule does not allow.
- verify: Look at the Required panel and the Default panel side by side. In both, the label should sit beside the box and wrap inside itself rather than falling to the line underneath. Then click anywhere on the label text, not on the box: it should tick. If only the box itself responds, the tap target has shrunk to the box and the phone case is broken.
The tick box, and the row rule that arrives with it.

## catalog:radio
- at: /catalog
- status: new
- review: A separate file from the checkbox, and the reason is measured rather than aesthetic. The obvious design is one atom with a type property, and it does not work: the renderer appends a property's attribute beside the literal one already in the template instead of replacing it, so a tag asking for a radio arrives at the browser declaring both types and the browser honors the first. A checkbox that was asked to be a radio, saying nothing about it. Two templates that each state their own type are the only shape that cannot get this wrong. It carries no stylesheet, so the row, the sizes, the ring and the AI treatment all come from the checkbox and cannot drift.
- verify: In the group panel, click each of the three in turn. Exactly one should stay filled, because they share a name. Then tab into the group and use the arrow keys: they should move the selection, which is the native behaviour a drawn replacement would have cost. Check the dots are round and the tick boxes above are square, so the two controls are still telling you apart.
The radio, and the trap that made it its own file.

## catalog:check-from-data
- at: /catalog
- status: known-issue
- review: The data-first sibling, and the one place the family's AI half stops. Every other atom here binds an address, because field.set can operate its control: it resolves the address and writes the value. A tick box has a value too, and that is the problem. A checkbox's value is what the form submits when it is ticked, not whether it is ticked. So a write would pass the dispatcher's guard, land, report success, change what the form means, and leave the control looking untouched. Measured on a live page rather than reasoned. That is worse than the choice hazard, where a bad write at least visibly empties the control, and it cannot be fixed by moving the binding because there is no element to move it to. So this atom ships with no address at all, and the absence is a test with the reason written next to it.
- verify: Read the section headed why this one carries no address, then open the markup panel underneath and look for a data-surface. There should not be one. Compare it against the Field or Memo entries, which both carry one on their control. If a surface has appeared here, someone tidied away a limit rather than closing it.
The tick box from data, and the verb the vocabulary does not have.

## catalog:input
- at: /catalog
- status: new
- review: The frame grew three things and they belong to it rather than to any one control, so every atom in the family got them at once. Two message slots, a quiet hint and an error, both of which collapse when empty, which is the only reason it is safe to put them in every template unconditionally. An error is not a red one: status here is weight against the hint's fade, and the token it reaches for is hueless by default so a theme that owns a hue can supply one without the component naming a color. Third is the required marker, and nothing carries it in markup. The frame reads the required attribute the browser already needs, so the marker cannot drift from the constraint it describes and no author can forget it.
- verify: Compare the Required panel with the Default one: the required label should carry a marker and the default should not, with no difference in the markup underneath except the attribute. Then go to the About page, open the Contact tab, and check the same marker has appeared on Name and Email without that page being edited. If it has not, the frame is not reaching a form rendered from data.
The frame's three additions, seen on the control that owns it.

## catalog:form-grid
- at: /catalog
- status: needs-verification
- review: The layout the family never had. A field was told to grow inside a column, which says nothing about how several sit together, so every form so far laid itself out by hand. Columns are found rather than declared by default, with a width floor rather than a count, and the floor is wrapped so it cannot push a phone sideways. Two rules exist to make one mistake unmakeable: a message box takes the full width without being asked, because a paragraph in a half-width column is the error this is for, and fields align to the top so one field carrying a hint cannot drag its neighbours' borders down. The honest limit is written in the doc: a fixed column count keys off the viewport rather than the container, so a narrow panel keeps its columns.
- verify: Narrow the window slowly and watch the default example. Columns should drop one at a time and nothing should ever scroll sideways, at any width down to a phone. The message box should stay full width the whole way. Then look at the two-column example inside its panel and see the limit above for yourself: it keeps both columns even though the panel is narrow, which is the case the doc tells you to avoid.
The grid, and the limit it states rather than hides.

## prompt
Three calls the walk cannot make, because they are the owner's rather than the reviewer's.
- ask: tick-verb | A tick box is the one control the AI cannot operate: field.set writes the submit value and never the checked state, so the atom ships unaddressable. Add a verb that sets checked, which is a contract change and grows the vocabulary, or leave the tick box out of the AI's reach and say so?
- ask: check-name | The data-first atom is called b-check, beside b-field, b-choice and b-memo. The b-memo naming question from the textarea round is still open too. Settle both names now while nothing is published, or keep them?
- ask: about-marker | The required marker now shows on the About contact form without that page being touched, because the frame reads the attribute. Is that wanted on a page you show people, or should the marker be opt-in?
- template: Continue the builder sandbox work in the portfolio (tour {tour}).\nTick verb call: {tick-verb}\nName call: {check-name}\nAbout marker call: {about-marker}\nThe live plan is plans/builder-sandbox.md, and its first piece is the prompt area becoming a real composer. Grain is committed and held unpushed on purpose, and the portfolio resolves it through a local symlink.
- handoff: https://claude.ai/new?q={payload}
