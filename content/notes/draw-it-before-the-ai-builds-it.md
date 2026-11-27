---
title: "Draw It Before the AI Builds It"
audience: [learn]
level: intro
subtitle: "The most expensive sentence in building with AI is 'that's not what I meant', said after four hundred lines. Six old drawings find that gap while it's still cheap."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~6 min"
tags: [ai, workflow, teaching, design]
summary: >
  Drawing before you build matters more with AI, because you didn't type the code and so you know it less.
  This note is a map of six drawings, each answering one question: use case diagram (who does what),
  data flow diagram (where information goes), ERD (what it remembers), wireframe (what is on each
  screen), mockup (how it looks) and design system (the reusable parts). Draw badly, on paper, then
  make your AI ask you questions about it. Each one links out to a good explanation.
social: |
  The most expensive sentence in building with AI: "that's not what I meant."

  Usually said after four hundred lines.

  Six old drawings find that gap while it's still cheap. A map of what each one is for, and where to
  learn it properly:
---

Here's a sentence I've said more times than I like to admit. "That's not what I meant." I say it to an
AI, after it has built something fast, confidently, and four hundred lines long. It built what I
described. The trouble was that what I described was only the part of the idea I'd gotten around to
thinking about.

A drawing finds the missing part before the building starts. It costs a few minutes and a piece of
paper, and nothing has to be undone.

## Why drawing matters more now

When you type the code yourself, you pick up the shape of the thing as you go. You know where the data
lives and which screen leads to which, because your fingers were there. When the AI types it, you get
the result without the walk. You know the system less than you think you do.

A drawing is the walk you skipped. It's a map you hold, so you can tell whether what came back matches
what you meant. And it's something you can hand to the AI, which is far better than another paragraph
of description.

I'm not going to teach these properly here. People have written excellent explanations of every one of
them, and I'll link to some. What I can give you is what each one is for, so you can tell which one to
reach for. They're the basics of software engineering, and you may have met a few in class. The AI
part is just that they pay off more now.

> *Figure: the six drawings in a line, each with the one question it answers. Use case: who does what.
> Data flow: where does information go. ERD: what does it remember. Wireframe: what is on each screen.
> Mockup: how does it look. Design system: what are the reusable parts. To be drawn to the figures
> standard.*

## Six drawings, one question each

**Use case diagram: who uses it, and what can they do?** Stick figures on the left, ovals on the right,
lines between them. The figures are people (or other systems), and the ovals are things they can do. It
sounds childish, and that's the charm. Say you're building a study planner. A student can add a task,
mark it done and see the week. A teacher can view a class. Now you've found out you have two kinds of
user, and that "teacher" might be a whole second app. Better to learn that on paper.
[Lucidchart](https://www.lucidchart.com/pages/tutorial/uml-use-case-diagram) and
[TU Delft](https://cese.ewi.tudelft.nl/software-systems/part-2/tutorials/uml/use-case.html) both have
clear walkthroughs.

**Data flow diagram: where does information go?** Boxes for the outside world, circles for the things
your system does, open boxes for where data rests, and arrows for the data in motion. The top level
shows your whole system as one circle with its arrows in and out. It's useful because it asks who sends
what to whom, and AI-built systems can quietly send data somewhere you didn't plan.
[IBM's guide](https://www.ibm.com/think/topics/data-flow-diagram) is a good place to start.

**ERD, the entity relationship diagram: what does it remember?** The boxes are the things your system
keeps: students, tasks, classes. The lines say how they relate. One student has many tasks. A task
belongs to one student. It's the drawing I'd say a database lives or dies by. If you change your mind
about it halfway through, you're rewriting, not editing.
[Atlassian](https://www.atlassian.com/work-management/project-management/entity-relationship-diagram)
covers the idea, and [freeCodeCamp](https://www.freecodecamp.org/news/crows-foot-notation-relationship-symbols-and-how-to-read-diagrams/)
explains the crow's foot lines.

**Wireframe: what is on each screen, and where?** Gray boxes. No colors, no fonts, no polish. A box
labeled "task list", a box labeled "add button". It forces you to decide what each screen is for
without anyone arguing about the shade of blue.

**Mockup: how does it look?** A wireframe with the real colors, type and spacing. This is the one you
can show someone and watch their face. A prototype is the next step, a mockup you can click through.
[Aha](https://www.aha.io/roadmapping/guide/product-management/wireframe-mockup-prototype) and
[ProductPlan](https://www.productplan.com/learn/wireframes-vs-mockups-vs-prototypes) both lay out how
the three differ, and they're honest that people use the words loosely.

**Design system: what are the reusable parts, and what are the rules?** The buttons, the inputs and the
colors, named once and used everywhere, so the thousandth screen looks like the first. I'm a
design-systems person to my core, and I built one, GRAIN, which I'll come back to in its own note. The
idea underneath it is Brad Frost's [atomic design](https://atomicdesign.bradfrost.com): small parts that
combine into bigger ones.

You won't need all six for everything. A one-page script needs none. A small app might need the first
and the last. Reach for the one that answers the question you can't currently answer.

## Draw badly, on purpose

Use paper. Use a whiteboard. Use a napkin. A good-looking diagram is a trap, because it's a reason not
to change it. You want one you're happy to cross out.

Then give it to the AI. Take a photo and attach it, or describe it in words and ask the AI to draw it
back to you as a diagram. Either way, you'll catch things. The version it draws back is its
understanding of your idea, and the gaps show up as boxes you didn't expect.

One honest limit, and it's a real one. A drawing is only worth keeping while it matches the code. A
diagram drawn once and never touched is wrong by the third change, and a wrong diagram is worse than
none, because people trust it. Keep them small. Update them, or throw them away.

## Make the teammate ask questions

This is where the last note comes back. Your AI never asks questions on its own, but you can make it.
Once you have a drawing, ask: "Here's my diagram. What's missing? What would a user need that I haven't
shown? Ask me five questions before you build anything."

That turns a teammate who guesses into one who checks. You're not teaching it. You're borrowing its
patience for the dull questions you'd skip.

## Try this

Take the small thing from your brief in the last note. On paper, draw a use case diagram with one
figure and three ovals: one person, three things they can do. It should take about five minutes. Photo
it, give it to your AI, and ask what's missing.

If your answer to "what's missing" is something you hadn't thought of, that's the whole point of the
exercise. Tell me what it found.

The AI will build whatever you describe. The drawing is how you find out what you were describing.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
