---
title: "Have the AI Draw It Before It Builds It"
audience: [learn]
level: intro
subtitle: "You don't have to draw it yourself. The AI is good at it. What you need is one drawing, written down, that you and the AI have both read and agreed on, before it builds."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~6 min"
tags: [ai, workflow, teaching, design]
summary: >
  Before the AI builds anything, get a drawing you both agree on. You don't have to draw it: the AI is
  very good at it, so describe the idea and let it draw. This note is a map of six drawings (use case,
  data flow, ERD, wireframe, mockup, design system), each answering one question, with links to learn
  them properly. The key is a common, documented understanding of the plan, saved in the project.
social: |
  The most expensive sentence in building with AI: "that's not what I meant."

  Usually said after four hundred lines.

  You don't have to draw the plan yourself. The AI is good at it. What you need is one drawing you
  both agree on, saved in the project, before anything gets built:
---

When the AI does the typing, the scarce thing is intent, and a sentence is a thin way to carry it. So you
get the line everybody eventually says: "That's not what I meant." Usually after four hundred lines, built
fast and confident, exactly to the description you gave. The trouble is that the description only covered
the part of the idea you'd thought through.

A drawing finds the missing part before the building starts. It costs a few minutes and nothing has to
be undone.

## Why drawing matters more now

When you type the code yourself, you pick up the shape of the thing as you go. You know where the data
lives and which screen leads to which, because your fingers were there. When the AI types it, you get the
result without the walk. A drawing is the walk you skipped. It's a map you hold, so you can tell whether
what came back matches what you meant. You know the system less than you think you do.

And here's the main point of this note. You don't have to draw it. The AI is very good at drawing these.
Describe what you want in plain words and it'll produce the diagram in seconds. What matters isn't who
held the pen. It's that you and the AI end up with the same picture of the plan, written down where both of
you can read it. A shared, documented understanding is the goal, and a drawing is the cheapest way to
get one.

On my own projects I keep these in a design folder, and the AI generates whatever the code can produce,
like the ERD from the database schema. [My design standard](/standards/design-standard) says which drawing
is owed when. That's a heavier setup than you need. The point is only that these are old, useful
drawings, and you need to know they exist so you can ask for the right one and tell whether what comes
back is right. They're the basics of software engineering, and you may have met a few in class.

> *Figure: the six drawings in a line, each with the one question it answers. Use case: who does what.
> Data flow: where does information go. ERD: what does it remember. Wireframe: what is on each screen.
> Mockup: how does it look. Design system: what are the reusable parts. To be drawn to the figures
> standard.*

## Six drawings, one question each

**Use case diagram: who uses it, and what can they do?** Stick figures on the left, ovals on the right,
lines between them. The figures are people (or other systems) and the ovals are things they can do. For your
portfolio: a visitor, maybe a recruiter, reads your roadmap and opens the evidence links. You, the owner,
add entries. Now you know there are two kinds of user, and that "owner adds entries" is a feature of its
own. [Lucidchart](https://www.lucidchart.com/pages/tutorial/uml-use-case-diagram) and
[TU Delft](https://cese.ewi.tudelft.nl/software-systems/part-2/tutorials/uml/use-case.html) have clear
walkthroughs.

**Data flow diagram: where does information go?** Boxes for the outside world, circles for what your
system does, open boxes for where data rests, and arrows for data in motion. It asks who sends what to
whom, and AI-built systems can quietly send data somewhere you didn't plan. A static portfolio can skip
this one. [IBM's guide](https://www.ibm.com/think/topics/data-flow-diagram) is a good place to start.

**ERD, the entity relationship diagram: what does it remember?** The boxes are the things your system
keeps, like roadmap entries and badges, and the lines say how they relate. An entry has a date, a title,
what you learned and an evidence link. A badge has a name, an issuer and a link. Change your mind about
this halfway through and you're rewriting, not editing.
[Atlassian](https://www.atlassian.com/work-management/project-management/entity-relationship-diagram)
covers the idea, and [freeCodeCamp](https://www.freecodecamp.org/news/crows-foot-notation-relationship-symbols-and-how-to-read-diagrams/)
explains the crow's foot lines.

**Wireframe: what is on each screen, and where?** Gray boxes. No colors, no fonts, no polish. A box
labeled "roadmap list", a box labeled "badges". It makes you decide what each screen is for without
anyone arguing about the shade of blue.

**Mockup: how does it look?** A wireframe with real colors, type and spacing. It's the one you can show
someone and watch their face. A prototype is a mockup you can click through.
[Aha](https://www.aha.io/roadmapping/guide/product-management/wireframe-mockup-prototype) and
[ProductPlan](https://www.productplan.com/learn/wireframes-vs-mockups-vs-prototypes) explain how the three
differ, and admit people use the words loosely.

**Design system: what are the reusable parts, and what are the rules?** The buttons, inputs and colors,
named once and used everywhere, so the thousandth screen looks like the first. I built one, GRAIN, which
gets its own note. The idea underneath it is Brad Frost's
[atomic design](https://atomicdesign.bradfrost.com): small parts that combine into bigger ones.

You won't need all six. For your portfolio, a use case diagram and a wireframe are plenty, and an ERD is
nice once the roadmap grows. Reach for the one that answers the question you can't currently answer, and
ask your AI to draw it.

## Let the AI hold the pen

Paste in the brief from the last note and ask for the drawing you want: "Draw a use case diagram for
this." Ask for it as Mermaid, a plain-text way of describing diagrams that GitHub and many other tools turn
into a picture. A text file is something you can save, compare and change. For a wireframe, ask for a plain
HTML page of gray boxes you can open in a browser. For an ERD, ask for the tables and how they connect. If
you'd rather sketch on paper, go ahead and send a photo, since it can read it. Either way, the AI draws and
you decide.

Then read it, and correct it. That's the job. "No, a visitor can't add entries, only I can." "There's no
admin, remove it." Corrections are cheap because nothing's been built yet, and each one is a gap between
what you meant and what it assumed. If you can't tell whether a box is right, ask it to explain that box.
A plausible drawing can still be wrong.

When you both agree, save it in the project, in a file next to your brief. That's the step that matters.
The AI forgets everything between sessions, so a drawing in the chat disappears. A drawing in the project
is a plan every future session reads, and you read, and anyone who joins reads. A common, written-down
understanding is what stops "that's not what I meant."

## Make the teammate ask questions

Your AI never asks questions on its own, but you can make it. Once you have a drawing, ask: "Here's the
diagram. What's missing? What would a user need that I haven't shown? Ask me five questions before you
build anything." That turns a teammate who guesses into one who checks. You're borrowing its patience for
the dull questions you'd skip.

## Your turn

Take the brief for your portfolio. Ask your AI for a use case diagram as Mermaid, with one visitor, you as
the owner, and a few things each can do. Read it, fix one thing you disagree with, then ask it what's
missing. Then ask for a wireframe of the roadmap page as a plain HTML page of gray boxes. Save both next to
the brief. If you'd rather, draw it by hand, or draw something stranger, a timeline or a map. If the answer
to "what's missing" is something you hadn't thought of, the exercise worked. Tell me what it found.

**Where I might be wrong.** A drawing is only worth keeping while it matches the code. One made once and
never touched is wrong by the third change, and a wrong diagram is worse than none because people trust it.
For something tiny, you may skip all of this and I won't argue. Keep them small, and ask the AI to update
them when the plan changes.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
