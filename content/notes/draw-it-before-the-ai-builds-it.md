---
title: "Have the AI Draw It Before It Builds It"
audience: [learn]
level: intro
subtitle: "You don't have to draw it yourself. The AI is good at it. What you need is one drawing, written down, that you and the AI have both read and agreed on, before it builds."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~7 min"
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
what you meant.

Here's the good news, and it's the main point of this note. You don't have to draw it. The AI is very
good at drawing these. Describe what you want in plain words and it will produce the diagram in
seconds. What matters is not who held the pen. It's that you and the AI end up with the same picture of
the plan, written down where both of you can read it. A shared, documented understanding is the goal.
The drawing is just the cheapest way to get one.

I'm not going to teach these properly here. People have written excellent explanations of every one of
them, and I'll link to some. What I can give you is what each one is for, so you can tell which one to
ask for. They're the basics of software engineering, and you may have met a few in class. You don't
need to be good at drawing them. You need to know they exist, so you can ask for the right one and
tell whether what comes back is right.

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
and the last. Reach for the one that answers the question you can't currently answer, and ask your AI to
draw it.

## Let the AI hold the pen

Start from the brief you wrote in the last note. Paste it in and ask for the drawing you want: "Draw a
use case diagram for this." Ask it to write the diagram as Mermaid, a plain-text way of describing
diagrams that GitHub and a lot of other tools turn into a picture. The AI is good at that format, and a
text file is something you can save, compare and change.

For a wireframe, ask for a plain HTML page made of gray boxes that you can open in a browser. For an
ERD, ask for the tables and how they connect. If you do prefer to sketch on paper, go ahead, and send a
photo. It can read it. Either way, the AI draws and you decide.

Then read it, and correct it. That's the job. "No, a teacher isn't a type of student. Make them
separate." "There's no admin, remove it." The corrections are cheap because nothing has been built yet,
and every one of them is a gap between what you meant and what it assumed. If you can't tell whether a
box is right, ask it to explain that box. A plausible-looking drawing can still be wrong, so read it.

When you both agree, save it in the project, in a file next to your brief. That's the step that
matters. The AI forgets everything between sessions, as you saw last time, so a drawing in the chat
disappears. A drawing in the project is a plan every future session reads, and you read, and anyone
who joins reads. A common, written-down understanding is what stops "that's not what I meant."

One honest limit. A drawing is only worth keeping while it matches the code. A diagram made once and
never touched is wrong by the third change, and a wrong diagram is worse than none, because people
trust it. Keep them small. Ask the AI to update them when the plan changes, or throw them away.

## Make the teammate ask questions

This is where the last note comes back. Your AI never asks questions on its own, but you can make it.
Once you have a drawing, ask: "Here's the diagram. What's missing? What would a user need that I haven't
shown? Ask me five questions before you build anything."

That turns a teammate who guesses into one who checks. You're not teaching it. You're borrowing its
patience for the dull questions you'd skip.

## Try this

Take the small thing from your brief in the last note. Give the brief to your AI and ask for a use case
diagram as Mermaid. It should have one or two people and a few things they can do. Read it, fix one
thing you disagree with, and then ask it what's missing. Save the result in your project next to the
brief.

If your answer to "what's missing" is something you hadn't thought of, that's the exercise working. Tell
me what it found.

The AI will build whatever you describe. The drawing is how the two of you find out what you were
describing.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
