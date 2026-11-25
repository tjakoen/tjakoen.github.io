---
title: "A Catalog You Can Turn the Knobs On"
audience: [build]
level: intro
subtitle: "GRAIN's catalog showed every component and let you copy its code, but you could not change anything and watch it respond. I borrowed the part of Storybook that matters and kept the catalog a single page with no dependencies."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-17
readingTime: "~3 min"
tags: [grain, design, accessibility]
summary: >
  The GRAIN catalog is generated from each component's markdown doc, and it was a good reference and
  a poor place to explore. I read Storybook's and Ladle's controls docs and took the one idea that
  fits a page with no build step: a small fixed set of control kinds declared next to the example.
  A doc can now carry a controls block, and the catalog turns its first example into a playground
  with a width switch and source that follows the preview. Accessibility notes got their own block,
  search got a shortcut and a spoken count, and the tracked capitals went.
---

The catalog was always the most honest page on the site. It is built from the same markdown that
documents each component, so it cannot drift from what ships. But it was a page you read, not one
you used. To see a panel in its stale state you had to find the example someone had written for it,
and if nobody had, you could not see it at all.

Storybook solved this years ago with
[Controls](https://storybook.js.org/docs/essentials/controls): a panel of inputs beside the preview,
one per argument, so you change a prop and watch the component answer. Storybook infers those
controls from component types. GRAIN components are markup and CSS, so there is nothing to infer
from. [Ladle's controls](https://ladle.dev/docs/controls/) showed the way round that: a short, fixed
list of control kinds that the author declares next to the story.

## Three kinds of control

A component doc may now end a section with a controls block. Each line is one control: a select of
attribute values, a toggle that adds or removes an attribute, or a text box that edits one element's
text. The catalog renders the doc's first example as a live preview beside that form.

<svg viewBox="0 0 300 170" width="100%" role="img"
     aria-label="The playground. A live preview with a phone, tablet and full width switch sits beside a column of controls, and the source below it is regenerated from the preview after every change."
     style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:12.5px">
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="16" width="260" height="138" rx="6"/>
    <line x1="190" y1="16" x2="190" y2="110"/>
    <rect x="34" y="50" width="142" height="48" rx="4" style="stroke-dasharray:3 3"/>
  </g>
  <rect x="20" y="110" width="260" height="44" style="fill:var(--color-fg)"/>
  <g style="fill:var(--color-fg)">
    <text x="34" y="38">Full · Tablet · Phone</text>
    <text x="200" y="38">Controls</text>
    <text x="70" y="79">Signups</text>
  </g>
  <g style="fill:var(--color-muted);font-size:11px">
    <text x="200" y="60">state: stale</text>
    <text x="200" y="78">pending</text>
    <text x="200" y="96">title: Signups</text>
  </g>
  <text x="34" y="136" style="fill:var(--color-bg);font-family:ui-monospace,monospace;font-size:10.5px">&lt;section class="dash-panel" data-state="stale"&gt;</text>
</svg>

The source under the preview is read back from the live markup after every change, so the code you
copy is the component you are looking at, not the example as it was first written.

## Accessible first, then attractive

A section titled Accessibility now renders as its own block above the examples rather than as one
more heading, so the note on how a component behaves for a keyboard or a screen reader is the first
thing after the description. Search matches the opening prose as well as the name, opens with the
slash key, clears with Escape, and announces how many components match. A skip link leads past the
sidebar, the arrow keys move through it, and the sidebar marks the entry in view.

The tracked capitals on every label are gone. grain-lint now flags them as a tell of machine-made
design, and the catalog was the worst offender in the system. Sentence case and weight do the same
job and read better.

The new surfaces pass axe at WCAG 2.2 AA. The older components in the catalog still carry three
findings of their own, which are next.

## What stayed the same

The catalog is still one URL and every component still lives at its own anchor, so no link into it
broke. It is still one page with no dependencies, and a doc without a controls block renders exactly
as before. Only the five new dashboard components carry controls so far; the rest will get them one
layer at a time.

## Sources

- Storybook, [Controls](https://storybook.js.org/docs/essentials/controls), for changing a component's inputs beside a live preview.
- Ladle, [Controls](https://ladle.dev/docs/controls/), for the small fixed set of control kinds declared next to the example.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
