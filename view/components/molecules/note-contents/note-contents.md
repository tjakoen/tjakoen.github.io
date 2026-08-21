# note-contents

The summary and section list under a long note's masthead, plus the reading-progress rule that
sticks to the top of the reading pane.

Emitted by `src/content.ts` (`renderNoteContents`) for any `/notes` entry with eight or more
level-2 sections, spliced into the rendered body after the note head. Not authored in Markdown:
a note gets one by being long, not by remembering to ask.

## Why the two elements are siblings

`position: sticky` is bounded by the parent's box. Nested inside the short `.note-contents` aside,
the progress rule would unstick about a screen later and read as broken. As a sibling its parent is
the full-height board, so it holds for the whole article.

## What it degrades to

With no JavaScript the `--read` custom property never resolves, the fill has zero width, and what
is left is a hairline under the masthead. The `<details>` still opens, because that is the element
doing the work rather than a script. Print and the static export get the summary and the full list.

## Status is weight, not hue

The current section is marked with `aria-current="true"` and reads darker with a small label. No
colour carries meaning here, same rule as the figures.
