---
id: review-live-figures
mode: dev
title: "Review: the figures went live"
route: /notes/ten-times-zero
---
Six figures in this post used to be pictures. They are now the working versions from the talk, lifted
verbatim rather than rewritten, so a widget cannot argue one thing on a slide and another in a
paragraph. This tour walks each one and says what changed under it. Static SVG is still what ships:
the export carries all six flat, because nothing runs to swap them there.

## figure:multiplier
- at: /notes/ten-times-zero
- status: changed
- review: Was a static SVG of the multiplier. Now the live one from the talk, dragging and all. Its markup is the deck's, not a rewrite.
- verify: Drag the slider. Every row should keep the AI at 10 and change only what you brought.
The figure the whole post rests on. Ten times whatever you are is still ten times whatever you are,
and ten times zero is zero.

## figure:matrix
- at: /notes/ten-times-zero
- status: changed
- review: The four-titles matrix became clickable. Picking a column lights it. Same upgrade path as the others, no new drawing.
- verify: Click each of the four column headers. The column you pick should light and the others should drop back.
Four job titles, one axis. The point survives the click, which is the test of whether the interaction
earned its place.

## figure:ratio
- at: /notes/ten-times-zero
- status: needs-verification
- review: Two changes stacked here. The figure went live, so you guess the ratio by dragging and then reveal it, and prose has no slide steps to reveal on so it got a button. Then it collided with the paragraph above it, because every live figure shipped with zero top margin and this one draws a guess marker above its bar. The spacing fix is the newest thing in this tour and the least looked at.
- verify: Scroll slowly into this figure from the paragraph above. Nothing should overlap, at desktop width and at phone width. Then drag to guess, then reveal.
Guess before you look. The gap between what people guess and what the number is doing most of the
work in this section.

## figure:sprint
- at: /notes/ten-times-zero
- status: changed
- review: The overnight sprint plays now instead of sitting still. The deck plays it off a slide step, so in the post it got a button, the same trigger prose gap the ratio had.
- verify: Press play. Fifty commits should land in order and the counter should finish where the prose says it does.
One night, watched at the speed it actually happened rather than summarized after the fact.

## figure:loop
- at: /notes/ten-times-zero
- status: changed
- review: The playbook ring opens node by node. Its CSS moved out of the talk page styles and into the shared molecule, so one copy now drives both the slide and the post.
- verify: Open two nodes in a row. The first should close as the second opens, and the ring should stay drawn.
The loop the rest of the stack is built around, readable one node at a time.

## figure:trap
- at: /notes/ten-times-zero
- status: changed
- review: The silent-failure demo is live, and it is the one whose payoff is that nothing happens. Clicking twice is the whole figure.
- verify: Click the trap twice. Nothing should happen either time, and that is the correct result, not a broken widget.
The failure that does not announce itself. If this one looks broken, read the paragraph under it
again, because looking broken is the argument.
