---
title: "Your AI Is the Teammate Who Never Asks Questions"
audience: [learn]
level: intro
subtitle: "Every group project has one: the teammate who says got it to everything and hands in something confident and wrong. You now work with that teammate every day. Here's how to brief them."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~7 min"
tags: [ai, workflow, teaching]
summary: >
  An AI agent works like the group project teammate who never asks questions: it says yes, guesses at
  what you meant, and hands back something confident. I'm lazy on purpose, which is why I brief it first. It can't think for you, so you set the direction.
  The fix is a short brief with three parts (the goal, what done looks like, what not to touch), and a
  habit of checking what comes back. This is the first idea the rest of the path hangs on.
social: |
  Every group project has the teammate who says "got it" to everything and never asks a question.

  Then they hand in something confident and wrong.

  Your AI is that teammate. It can't think for you, so the brief is your job. Three lines, written
  before you start:
---

You know the teammate. In every group project there's one. You explain the task, they nod, they say
"got it", and they ask nothing. Three days later they hand in something polished, confident and slightly
about a different assignment.

That teammate isn't lazy. They just didn't want to look lost, so they guessed. I work with that teammate
every day now, and it's the AI. It's very fast, very capable, and it will almost never tell you it doesn't
understand. Once I saw it that way, my early frustration made sense. I'd been treating it like a search
box. It behaves a lot more like a teammate.

## I'm terrible at multitasking, and I'm lazy on purpose

I'm terrible at multitasking, and I strive to be lazy. There's an old saying that a lazy programmer is an
effective one, because they put their energy into making their own life easier. That's me. I'm
disorganized in a way that has outlasted every app built to fix it, and every one of them wanted me to
adapt to its system. I couldn't, so I built a stack that adapts to me, which is the story in [I Built a
Whole Stack Because No To-Do App Would Have Me](origin-story.md). Then I built an AI workflow around it,
because I want to do the most while doing the least and spend what's left on the part I enjoy, which is
building. I've kept working on that loop for six months.

Lazy doesn't mean skipping the careful part. It means doing it once, up front, so you're not redoing it at
two in the morning. I built the rails before I opened the throttle. That's the shape of this whole path: a
little effort early, so the machine can do the rest.

## It says yes to everything

Ask a chat assistant for something vague and it doesn't push back. It picks an interpretation and
runs. Say you ask for "a portfolio site." You get a hero banner, a color scheme, a bio in the voice of a
stranger, and a list of projects you never built, all delivered with total confidence. Each of those was
a choice, and none of them was yours.

A coding agent does the same thing with more reach: it can edit files, add packages and reorganize
things you didn't mention. It isn't being sneaky. It filled every gap with a guess, because nobody told it
where the gaps were.

> *Figure: two paths from the same request. Left: a vague request, the agent guesses, a confident
> wrong result, found late. Right: a short brief, the agent works inside it, a result you can check
> against what you wrote. To be drawn to the figures standard.*

## It can't think for you

Working with an AI is a lot like mentoring. I run a team and I teach students, and I found I already knew
how to do this. An AI agent is like a capable junior developer, or a student rushing through an activity
just to finish: fast, willing, and in need of direction. They don't know what you're building or why, what
you'd consider finished, or which parts of the project are fragile. They know what you told them. I wrote
the longer version in [Ten Times Zero](ten-times-zero.md#a-decade-of-rehearsal-billed-as-management).

When the AI does the typing, the scarce thing stops being code and becomes intent. It can't know what you
meant, what the rules are or what done looks like unless you wrote it down. So I do, and in my own repos
the documentation is the work and the code is the cheap part. The thing you can't hand over is the
thinking about what to build. If you don't control that narrative, the AI writes one, and it's usually a
generic one. It works, and it could belong to anyone.

That's not bad news. The typing goes to the AI, and you keep the fun part, deciding what the thing should
be.

## Say what done looks like

Before I ask for anything, I write a brief with three parts. It's short enough to write on a phone.

**The goal.** What this is and why it exists, in a sentence or two. Not a spec.

**What done looks like.** What I'll see when it works: a page that loads, a command that prints a number,
a test that passes. If I can't say it, the task isn't ready, and that's useful to find out before I've
spent an hour.

**What not to touch.** The files, packages or behavior that must stay exactly as they are. This one feels
optional until the first time an agent helpfully rewrites something that worked.

Here's an example, not a template. For a portfolio: a one-page site with a section that lists what I've
learned about working with AI. Done is the page loads at my own address, the bio is in my words, and the
roadmap shows one entry with a link to evidence. Don't write my bio, don't invent projects or skills, and
don't add trackers or packages I didn't ask for.

Nothing in a brief is code. It's the thinking, written down, and it's the part you can do at any level.
A first-year with a clear brief will often get a better result than an expert with a vague one.

## Orchestrate it, don't just vibe it

There was a week I looked at what had shipped across my repositories and couldn't explain half of it. It
all worked and the tests were green, but I could feel a gap opening between the code that existed and the
code I understood. Output going up while understanding stays flat is debt with a nice green dashboard on
top. I wrote that story in [I Was Shipping Faster Than I Could Understand It](one-loop-every-repo.md).

That's the pitfall: you can ship something you don't understand and can't easily fix. Two people can use
the same tools. One vibe codes blind: prompt, accept, ship, hope. The other orchestrates. They decide what
gets built, cut it into steps, check each one, and understand enough to fix it. [Ten Times Zero Is Still
Zero](ten-times-zero.md) is where I claim the word vibe coder anyway, with one word in front: professional.
It isn't speed. It's being able to explain your work.

The test I use on anything the AI builds: could I explain this, and could I fix it if the AI weren't here
tomorrow? If not, I adopted it and didn't build it, and I slow down until I can.

## It forgets everything

One more thing about this teammate, and it's where the metaphor breaks. A human teammate remembers
yesterday. The AI doesn't. Close the session and the next one starts blank. So the brief can't live in
your head or in a chat you'll never scroll back to. It has to live in a file the agent can read every
time. I'll show you how later. For now, hold the idea that writing things down isn't paperwork. It's how
you give a forgetful teammate a memory.

## Your turn

This is the first step of the project that runs through the Harbor, your portfolio. Pick whichever fits:

- Write the three-part brief for your portfolio, or for adding an AI roadmap section to one you have.
- Or ask your AI for "a portfolio site" with no brief at all, list every choice it made that you didn't,
  then write the brief and compare.
- Or brief something else small. A script, a page, a fix.

Give the brief to your AI and compare what you get with what you wrote. The gap shows you exactly what you
hadn't decided yet. Or do something different and tell me how it went.

**Where I might be wrong.** I may be overselling the brief. Some days a short back-and-forth beats
writing it down, especially for something tiny. Try both and see which fits you.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
