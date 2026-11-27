---
title: "Plan It, Then Build From the Plan"
audience: [learn]
level: intro
subtitle: "Two hours in, the AI has touched eleven files and you can't say which of your five asks are done. A plan the AI works through, one step at a time, fixes that."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~6 min"
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

You're two hours into a session. The AI has changed eleven files, you asked for five things, and you
couldn't say which of them are done, which are half done, and which it quietly skipped. The chat scrolls
on for miles.

That's not a problem with the AI. It's a problem with having nothing to point at. A plan is the thing
to point at.

## A plan is a list you can tick off

A short file with three parts: the goal, from your brief. A list of small steps, in order. And under each
step, what done looks like.

```text
Goal: a one-page portfolio with an AI roadmap that shows what I've learned.
Stack: plain HTML, CSS and JavaScript on GitHub Pages, because I know them and it's free.

1. A home page with my name and one sentence, in my words.
   Done: it loads at my GitHub Pages address.
2. A roadmap section with one entry.
   Done: the entry shows a date, a title, what I learned, and a link that opens.
3. A badges section.
   Done: it shows one badge I earned, with a link to where I earned it.
```

Nothing in it is code. It's your brief cut into pieces small enough to check with your own eyes. If you've
ever been handed a ticket with acceptance criteria, it's the same thing. The
brief gives you the goal, and the drawing tells you what the steps should cover.

## Talk about the stack first

Before the plan has steps, ask your AI what you'll build this with, meaning the language, the framework and
the tools. Say what you want to make and ask: "What are the usual ways to build this? What would you pick,
and why?"

Many ways work. A mobile app might be Flutter or React Native. A website might be plain HTML, CSS and
JavaScript, which is what I use, or a framework, or even PHP. Start from the popular ones. More has been
written about them, and in my experience the AI is steadier on them too. For your portfolio, my suggestion
is plain HTML, CSS and JavaScript on GitHub Pages: free, and nothing to build. If you already know
something else, use that.

My advice hasn't changed: stick with what you're familiar with. Avoid agentic coding in a language or
framework you have no experience with at all. The AI makes anything feel easy, but if you can't read what
it wrote, you risk not knowing what you're building.

You can learn a new stack on a project, with the AI as your teacher, if you make it a learning project on
purpose. Ask it to explain each file. Make it say why this way and not another. Break something and fix it
together. Don't start the next step until you can explain this one in your own words. Keep it small and
throwaway, and build the real thing once you can follow along.

Then put the stack at the top of the plan, with the reason. If it's new to you, add a step to learn the
basics first. The plan should be honest about what you know.

## Orchestrate it, don't just vibe it

The common pitfall is that you can ship something you don't understand and can't easily fix. It works on
Tuesday, breaks on Friday, and you're staring at code that's nobody's.

Two people can use the same tools. One vibe codes blind: prompt, accept, ship, hope. The other
orchestrates. They decide what gets built, cut it into steps, check each one, and understand enough to fix
it. [Ten Times Zero Is Still Zero](ten-times-zero.md) is where I argue this at length. I call myself a vibe
coder there too, with one word in front: professional. It isn't speed. It's being able to explain your work.

Here's a test for anything the AI builds. Could I explain this, and could I fix it if the AI weren't here
tomorrow? If not, you adopted it and you didn't build it. Slow down until you can.

## Let the AI draft it, then you edit it

Don't write the plan from scratch. Give your AI the brief, the drawing and your stack and ask:
"Don't write any code yet. Break this into small steps, each with what done looks like." Many tools have a
planning mode for exactly this, so ask your agent whether yours does.

Then read it like a teammate's proposal. Is a step too big, the order wrong, something missing, something
there you didn't ask for? The AI is guessing at your intentions, so the edit is where your judgment goes
in. A good step is small enough to explain in a sentence. "Build the backend" is a project, so ask for it
to be split.

## Use what your harness already has

Your harness probably has tools for this already. Claude Code and Codex both have a planning mode, where
the agent looks around and proposes a plan before it touches a file. Both also have a goal feature: you
state the condition that means done, and the agent keeps working across turns until it's met. As I
understand it, planning mode is for when the finish line is fuzzy, and a goal is for after, when you know
it. Your done lines are exactly what a goal wants. The names and switches differ, so ask your agent how
yours works, and check the docs, such as Codex's page on
[following goals](https://developers.openai.com/codex/use-cases/follow-goals).

Use what your harness gives you before you build your own. If you work with more than one harness, make
your standards aware of what each can do, so each session reaches for its own tools. More on that later.

## One step at a time

Now build, with the habit that makes the plan work: "Do step 1 only. Stop and show me when it's done."

Left alone, the AI will run through every step and a few you didn't ask for. When it stops after one, you
check one thing against one line of done. If it's right, tick it off and say "now step 2." If it's wrong,
you catch it while the mistake is small.

## Keep it where it survives

Put the plan in a file in the project, next to your brief and your drawing, and have the AI tick steps off
as it goes. Remember the forgetful teammate. If the plan lives only in a chat, it dies when the session
does. In a file, tomorrow's session picks up at step 3, because it can see steps 1 and 2 are done.

I keep mine as markdown files in a plans folder, each with a status at the top. A tool I built,
[PROOF](/proof), turns that folder into a board, and [PANTRY](/pantry) keeps the board open beside my
sessions. I built them for myself and they work for me. You don't need either. You need one file you can
read in ten seconds, and if you want a board later, build a small one of your own. The juniors on my team
each did, and [Show Them the Board](show-them-the-board.md) is that story.

## A plan is a guess

It'll be wrong somewhere. Step 2 needs something you didn't see coming, or you change your mind after step
1. That's fine. Tell the AI and update the file. The point isn't that the plan is right. The point is that
you and the AI always have the same one.

## Try this

Take the brief and drawings for your portfolio. Talk through the stack with your AI and pick one you know.
Ask for a plan with small steps and a done line for each, no code yet. Split one step, cut one, fix the
order, and save it in your project. Then tell it, "Do step 1 only, and stop," and check the result against
the done line before you let it go on.

Next time: what to do when the AI says it's finished.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
