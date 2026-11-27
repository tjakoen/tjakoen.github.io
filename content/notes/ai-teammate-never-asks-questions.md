---
title: "Your AI Is the Teammate Who Never Asks Questions"
audience: [learn]
level: intro
subtitle: "Every group project has one: the teammate who says got it to everything and hands in something confident and wrong. You now work with that teammate every day. Here's how to brief them."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~5 min"
tags: [ai, workflow, teaching]
summary: >
  An AI agent works like the group project teammate who never asks questions: it says yes, guesses at
  what you meant, and hands back something confident. It can't think for you, so you set the direction.
  The fix is a short brief with three parts (the goal, what done looks like, what not to touch), and a
  habit of checking what comes back. This is the first idea the rest of the path hangs on.
social: |
  Every group project has the teammate who says "got it" to everything and never asks a question.

  Then they hand in something confident and wrong.

  Your AI is that teammate. It can't think for you, so the brief is your job. Three lines, written
  before you start:
---

You know the teammate. In every group project there's one. You explain the task, they nod, they say
"got it", and they ask nothing. Three days later they hand in something that's polished, confident and
slightly about a different assignment.

That teammate isn't lazy. They just didn't want to look lost, so they guessed. And you didn't find out
until it was too late to guess again.

I work with that teammate every day now, and it's the AI. It's very fast, it's very capable, and it
will almost never tell you it doesn't understand. Once I saw it that way, most of my early frustration
made sense. I'd been treating it like a search box. It behaves a lot more like a teammate, and a
particular kind.

## It says yes to everything

Ask a chat assistant for something vague and it doesn't push back. It picks an interpretation and
runs. Say you ask for "a portfolio site." You get a hero banner, a color scheme, a bio in the voice of a
stranger, and a list of projects you never built, all delivered with total confidence. Each of those was
a choice, and none of them was yours.

A coding agent does the same thing, with more reach. Instead of one answer in a chat window, it can
edit files, add packages and reorganize things you didn't mention. It isn't being sneaky. It filled
every gap with a guess, because nobody told it where the gaps were.

> *Figure: two paths from the same request. Left: a vague request, the agent guesses, a confident
> wrong result, found late. Right: a short brief, the agent works inside it, a result you can check
> against what you wrote. To be drawn to the figures standard.*

## It can't think for you

I've told my own team for a while that an AI agent is like a capable junior developer. Fast, willing,
and in need of direction. A junior doesn't know what you're building or why, what you'd consider
finished, or which parts of the project are fragile. They know what you told them.

So the thing you can't hand over is the thinking about what to build. That's the part I'd call the
narrative: what this is, what it's for, and what the end looks like. If you don't control the
narrative, the AI writes one, and it's usually a generic one. You'll recognize it from the shape of
the result. It works, and it could belong to anyone.

I wouldn't say this is bad news. It's the part I like. The typing goes to the AI, and you keep the part
that was always the fun bit, deciding what the thing should be.

## Say what done looks like

Here's the habit. Before you ask for anything, write a brief with three parts. It's short enough to
write on a phone.

**The goal.** What this is and why it exists, in a sentence or two. Not a spec.

**What done looks like.** What you'll see when it works. A page that loads, a command that prints a
number, a test that passes. If you can't say it, the task isn't ready. That's useful to find out
before you've spent an hour.

**What not to touch.** The files, the packages or the behavior that must stay exactly as they are.
This one feels optional until the first time an agent helpfully rewrites something that worked.

Take the portfolio again. A brief might say: a one-page portfolio with a section that lists what I've
learned about working with AI. Done is the page loads at my own address, the bio is in my words, and the
roadmap shows one entry with a link to evidence. Don't write my bio, don't invent projects or skills, and
don't add trackers or packages I didn't ask for.

You'll notice nothing in the brief is code. It's the thinking, written down, and it's the part you can
do at any level. A first-year with a clear brief will often get a better result than an expert with a
vague one.

## It forgets everything

One more thing about this teammate, and it's the one that makes the metaphor break down. A human
teammate remembers yesterday. The AI doesn't. Close the session and the next one starts blank. It
doesn't know the project, your preferences, or what you decided last Tuesday.

So the brief can't live in your head, or in a chat you'll never scroll back to. It has to live
somewhere the agent can read it every time: a file in the project. I'll show you how that works in a
later note. For now, just hold the idea that writing things down isn't paperwork. It's how you give a
forgetful teammate a memory.

## Check it like a teammate's work

Reading the result is part of the job. With a teammate you'd ask to see it running, and glance at what
they changed. Same here. Does it do what "done" said it would do? Did it touch anything on the list of things to leave alone? Can you explain why it works?

That last one matters more than it sounds. If you can't explain it, you didn't build it, you adopted
it. [Ten Times Zero Is Still Zero](ten-times-zero.md) is the long version of why that matters to me.
For now, the short version: the AI multiplies what you already bring.

## Try this

This is the first step of the project that runs through the Harbor, your portfolio. If you have one, brief
the AI on adding an AI roadmap section to it. If not, brief it on a small starter page. Before you open any
tool, write the three-part brief in a notes app: the goal, what done looks like, and what not to touch.
Then give it to your AI and compare what you get with what you wrote.

Don't worry about getting it right the first time. The brief is a draft, and when the result surprises
you, the gap between what you wrote and what you got shows you exactly what you hadn't decided yet. That
gap is the lesson.

Next time you're handed a group project, you'll know what the quiet teammate needed. A clearer brief,
and someone willing to check the work.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
