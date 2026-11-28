---
title: "Small Parts, Big Screens: Atomic Design in Plain Words"
audience: [learn]
level: intro
subtitle: "Every screen is built from smaller screens, and every one of those from buttons. Brad Frost gave that idea five names. They are the cheapest way I know to keep an AI from rebuilding your button forty times."
author: "Tjakoen Stolk"
status: DRAFT
type: note
series: harbor
seriesOrder: 4
date: 2026-11-28
readingTime: "~6 min"
tags: [ai, design, teaching]
summary: >
  Atomic design is Brad Frost's way of describing an interface as five levels: atoms, molecules, organisms,
  templates and pages. His own example is a search form built from a label, an input and a button. I use the
  same five words to tell an AI what to reuse and where to fix a thing once, and GRAIN, my design system, is
  sorted into them as folders. You don't need a design system yet. You need the habit of asking what the
  parts are.
social: |
  Ask an AI to add a button and it will happily invent a new one. Ask it ten times and you own ten buttons.

  Brad Frost's atomic design is five words that fix that: atoms, molecules, organisms, templates, pages.

  Here's the search form from his own book, and the same idea in the design system I built:
socialImage: "/media/notes/small-parts-big-screens-social.png"
socialImageAlt: "A card from the Harbor path of Learn AI with me, titled Small Parts, Big Screens: Atomic Design in Plain Words, with the line: Ask an AI to add a button and it will happily invent a new one. Ask it ten times and you own ten buttons."
---

Ask an AI to add a button to your page and it will write you a button. Ask it again a week later, in a new
session, and it will write you another one, slightly different, because it has no memory of the first.
By the fortieth you have forty buttons, three shades of the same blue, and a bug that has to be fixed in
every one of them.

None of that is the AI being careless. It's doing what a forgetful teammate does when nobody told it
where the parts live. The fix is old and it comes from a chemistry class.

## The chemistry class

Brad Frost wrote a book called [Atomic Design](https://atomicdesign.bradfrost.com), free to read online.
In the second chapter he tells how he went looking for a way to build interfaces in a more deliberate order,
and ended up remembering his high school chemistry teacher. Atoms combine into molecules, molecules combine
into organisms, and everything in the universe is built from a short list of atoms. His claim is that
interfaces work the same way, because every website is made from the same short list of HTML elements.

So he named five levels. They're a mental model, not a procedure, and he says plainly that you don't walk
through them in order.

| Level | What it is | Example |
|---|---|---|
| **Atom** | A basic element that can't be broken down and still work | A label, an input, a button |
| **Molecule** | A small group of atoms working as one unit | A label, an input and a button become a search form |
| **Organism** | A distinct section made of molecules and atoms | A site header: a logo, a navigation and that search form |
| **Template** | A page layout that places those sections and shows the content structure | A homepage layout with the header organism at the top |
| **Page** | A template filled with real content | The homepage, with this week's real headline |

The search form is the example I'd remember. On its own, a label does nothing, an input does nothing, and a
button does nothing. Put them together and you get something that searches. That's what he means by a molecule
taking on its own properties.

```mermaid label="Atomic design in five levels: atoms combine into molecules, molecules into organisms, organisms into templates, and templates with real content become pages."
flowchart LR
  atom["Atoms<br/>label, input, button"] --> molecule["Molecules<br/>search form"]
  molecule --> organism["Organisms<br/>site header"]
  organism --> template["Templates<br/>page layout, gray boxes"]
  template --> page["Pages<br/>layout plus real content"]
```

## Why this helps when an AI does the typing

When you can say "that's a molecule" you can give an instruction that has a place in it. "Use the existing
button atom" is a much better sentence than "add a button", because the first one names where the part
already lives. "Make the search form a molecule I can reuse in the header and on the results page" tells the
AI to build the thing once.

Two more habits fall out of it. When something looks wrong everywhere, you fix the atom and every molecule
and organism built from it is fixed too. And when you ask for a change, you can say which level it lives on:
a new color is an atom, a new field in a form is a molecule, a new section is an organism. A request that
names the level is hard to misread.

## What it looks like in my own system

GRAIN is the design system I built for this site, and it's built in the shape of Frost's words. The
[origin story](origin-story.md) tells how I got there. The sorting is real: its components live in folders
called atoms, molecules and organisms, and each one lives in exactly one of them.

The atoms are things like a button, an input, a checkbox, a switch and a badge. The molecules are things like
a stat tile, a card, a tab, a callout and a data table. The organisms are things like a topbar, a timeline, a
file tree, a chat log and the whole app shell. A stat tile uses atoms, a dashboard organism uses stat tiles,
and a page uses the dashboard.

There's one rule in there that shows why the levels matter. The atom that sets the text face knows nothing
about who wrote the text. A molecule, like a message bubble, is the one that marks itself as written by the
AI, and everything inside it follows. The atoms stay simple, the molecules carry the meaning, and the
organisms just arrange them. If you ever want to see it on a page, [the catalog](/catalog) shows the parts, and [the design system doc](/grain/docs/design-system) says how they connect.

## You don't need a design system yet

I'm not telling you to build one. For your portfolio it would be a lot of ceremony around a single page. What
I'm telling you to do is borrow the question. When you sketch the roadmap page, ask what the atoms are (a date,
a title, a link), what the molecule is (one roadmap entry), and what the organism is (the list of entries). Then
tell your AI that, and tell it to make the entry once and use it for every row.

If you want to go further later, there's a free way in. Frost's book is short, and his chapter on the five
levels is the one to read first. When you make a design system of your own, make it yours: your names, your
folders, your rules. I'd rather you borrowed the idea than my files.

## Your turn

Take the wireframe from the drawing note and ask your AI to label it in Frost's five levels: which parts are
atoms, which are molecules, which is the organism. Read what it says and fix one thing you disagree with. Then
ask it to build one roadmap entry as a single reusable piece, and to say where it saved it. Or sort a page you
already like into the five levels, and tell me what you found hiding in the middle.

**Where I might be wrong.** The five levels are a way of talking, and a blurry one. People argue about whether
a given thing is a molecule or an organism, and for a small project the argument costs more than it saves.
Frost himself says it isn't a linear process. Use the words as long as they make your instructions clearer,
and drop them the day they don't.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
