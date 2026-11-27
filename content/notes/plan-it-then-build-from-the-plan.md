---
title: "Plan It, Then Build From the Plan"
audience: [learn]
level: intro
subtitle: "Two hours in, the AI has touched eleven files and you can't say which of your five asks are done. A plan the AI works through, one step at a time, fixes that."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~4 min"
tags: [ai, workflow, teaching]
summary: >
  A plan is a short checklist in a file, with a goal, small steps and what done looks like for each. Have
  the AI draft it from your brief and your drawing, edit it yourself, then build one step at a time and
  tick each off. It survives a closed session, it keeps the AI from wandering, and it tells you where you
  are. It's also the habit my own loop automates, so it's worth doing by hand first.
social: |
  Two hours into an AI session, it has touched eleven files and you can't say which of your five asks
  are done.

  The fix is boring and it works: a plan in a file, small steps, one at a time, tick each off.

  Do it by hand first. Here's how:
---

You're two hours into a session. The AI has changed eleven files. You asked for five things, and you
could not tell me right now which of them are done, which are half done, and which it quietly skipped.
The chat scrolls on for miles. You close it to get lunch, and when you come back, you're not sure what
you were doing.

That's not a problem with the AI. It's a problem with having nothing to point at. A plan is the thing
to point at.

## A plan is a list you can tick off

I mean something very plain. A short file with three parts. The goal, a sentence or two, the same one
from your brief. A list of small steps, in order. And under each step, what done looks like, so you
can tell when it's finished.

```text
Goal: a study planner where a student can add tasks and mark them done.

1. Show a list of tasks on the home page.
   Done: I can see three sample tasks when I open it.
2. Add a form to create a task.
   Done: a new task appears in the list.
3. Add a checkbox to mark a task done.
   Done: ticking it crosses the task out, and it stays crossed out after a refresh.
```

That's the whole thing. Nothing in it is code. It's your brief, cut into pieces small enough that you
can check each one with your own eyes. If you've done the last two notes, you already have most of the
parts: the brief gives you the goal, and the drawing tells you what the steps should cover.

## Let the AI draft it, then you edit it

You don't need to write this from scratch. Give your AI the brief and the drawing and ask for a plan:
"Don't write any code yet. Break this into small steps, each with what done looks like." Many tools have
a planning mode that does exactly this. Ask your agent whether yours does.

Then read it like you'd read a teammate's proposal. Is a step too big? Is the order wrong? Is something
missing that the drawing says should be there? Is there a step you didn't ask for? Cut it, split it, and
reorder it. The AI is guessing at your intentions, so the edit is where your judgment goes in.

A good step is small enough that you could explain what changed in a sentence. If a step reads "build
the backend", it isn't a step, it's a project. Ask for it to be split.

## One step at a time

Now build, and here's the habit that makes the plan work: "Do step 1 only. Stop and show me when it's
done."

That last sentence is the point. Left alone, the AI will happily run through all three steps and a few
you didn't ask for. When it stops after one, you can check one thing against one line of done. If it's
right, tick it off and say "now step 2." If it's wrong, you catch it while the mistake is small, which is
a lot cheaper than finding it under ten more steps.

Ticking things off is a small pleasure, and I won't pretend otherwise. It's also real information. At
any moment you can see how far along you are, and what's next.

## Keep it where it survives

Put the plan in a file in the project, next to your brief and your drawing, and have the AI update it as
it goes: ticking steps off, adding anything new it discovers. Remember the forgetful teammate. If the
plan lives only in a chat, it dies when the session does. In a file, tomorrow's session reads it and
picks up at step 3, because it can see steps 1 and 2 are done.

I keep mine as plain markdown files in a plans folder, each with a status at the top. A tool I built,
[PROOF](/proof), turns that folder into a board, and [PANTRY](/pantry) is the app that keeps the board
open beside my AI sessions, so the plan and I stay agreed on what's next. I built them for myself
because I kept losing track, and they work for me. You don't need either one. You need one file you can
open and read in ten seconds. If you want a board later, build a small one of your own. The juniors on
my team each did, and [Show Them the Board](show-them-the-board.md) is that story.

## A plan is a guess

One honest note. A plan is your best guess at the start, and it'll be wrong somewhere. Step 2 turns out
to need something you didn't see coming, or you change your mind after seeing step 1. That's fine. Tell
the AI the plan has changed and update the file. The point isn't that the plan is right. The point is
that you and the AI always have the same one.

## Try this

Take the brief and the drawing you made. Ask your AI for a plan with small steps and a done line for
each, with no code yet. Edit it: split one step, cut one, and fix the order. Save it in your project.
Then tell it, "Do step 1 only, and stop," and check the result against the done line before you let it
go on.

Next time, we'll look at what to do when the AI says it's finished and you want to know whether it
really is.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
