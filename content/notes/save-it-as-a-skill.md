---
title: "The Third Time You Type It, Save It"
audience: [learn]
level: intro
subtitle: "You've now typed the same plan prompt and the same audit prompt more than once. That repetition is the reason to make a skill, and it's why you won't need to guess what one should do."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~5 min"
tags: [ai, workflow, teaching]
summary: >
  A skill is a prompt you've earned by typing it by hand a few times. Wait until you've repeated one, ask
  your agent to write it from what you just did, edit it, and save it in the project. Keep judgment work
  like audits manual. Once a skill is boring, repeated and checkable, a routine can run it on a schedule.
  Mine move review tickets and update team metrics. The repetition is the justification.
social: |
  The third time you type the same prompt, stop and save it.

  That's what a skill is for. You don't need to guess what to automate, because your own repetition tells
  you.

  And once a skill is boring and checkable, a routine can run it for you. Here's how I decide:
---

I noticed some time this autumn that I had a catchphrase, and I was saying it to a machine. "Are we clean
on main? If yes, remove the worktrees and branches, local and remote." I typed it at the end of a lot of
sessions. A few days later it was "I'm out of storage again, clean something up." None of that was the
model's fault. It did exactly what I asked every time. I was just the only part of the system that
remembered, and I'm supposed to be doing something else.

That tiredness is useful. It tells me what to save.

## A skill is a prompt you've earned

A skill is a saved set of instructions your agent can run on request, like a recipe it can pull off the
shelf. The Claude Academy lessons cover the mechanics, and your agent can explain how yours works if you
ask. What I can give you is my rule for when.

**I don't write a skill until I've typed the thing three times by hand.** Before that I'm guessing what it
should say. After that I know, because I've seen what I kept correcting. The first candidates for you are
probably already in front of you: the plan prompt, the check prompt, and adding a roadmap entry to your
portfolio. Every correction I give twice is a line waiting to go into the skill.

## Let your agent write it, then you edit it

I don't start from a blank page. Right after a session where the prompt worked, I say: "Turn what we just
did into a skill." Then I read what it wrote the way I'd read a plan. Does it say when to use it? Are the
steps what I'd do? Is something in there I never asked for?

Here's the shape, in plain words. Your harness will format it differently.

```text
Name: check-the-work
Use when: the AI says a step is done.
Steps: read the plan, and for each done line show evidence you can see,
run the tests, list the files changed against the leave-alone list,
and say anything you could not verify.
```

A good one for your portfolio is adding a roadmap entry. The skill asks you what you learned, in your own
words, adds the entry with a date and an evidence link, and checks the link opens. It doesn't write your
words for you.

I keep a skill to one job, save it in the project next to the brief and plan so every session finds it,
and add a line each time I catch a new miss. That's how it gets better, and how it starts to sound like how
I work.

Later in this path you'll meet the loop, my whole setup for working with AI. One thing it does is notice
when I repeat a request and ask whether I want a skill from it. For now, you're the one noticing. The note
is [I Kept Telling My AI the Same Thing](the-loop-that-learned-how-i-work.md), if you're curious.

## Keep judgment manual

Not every skill should run by itself. I run my audits by hand. My loop tells me when one is due and I
decide to go. That's a preference, not a rule, and the reason is that an audit is a judgment, and I want to
be in the room for it.

## When a skill earns a routine

A routine runs a skill on a timer or when something happens, with you nowhere in sight. Skills are called
skills everywhere, but routines go by different names: a scheduled task in some harnesses, a cron job you
set up yourself in others. It's the same idea, so ask your agent how yours does it. The test for whether
one is worth building is the same as for a skill, with one more clause. It has to be repeated, boring, and
**checkable**, so you can tell it worked without reading its mind.

Mine are things like these. One checks whether my classes have been graded. One moves tickets that are due
for code review into the code reviewer's queue. One updates my team's metrics calculations. Nobody is
making a judgment call in any of them, and a wrong result is easy to spot.

Look at what's missing from that list. No audits. Nothing that edits code and ships it unreviewed. A
routine that does something you'd have to think about doesn't save time, it files a mess for you to sort
out later.

And check that a routine actually ran. Anything that runs while you're not looking needs something that
tells you when it didn't, which is the whole lesson of [The Check Ran Once in 165
Sessions](the-check-that-never-ran.md).

## Your turn

Pick the prompt you've typed most, or the roadmap entry one. Ask your agent to turn it into a skill, edit it,
save it in your project, and use it to add your next entry. Then write down one chore that's boring and
checkable, such as checking that the links on your roadmap still open. Don't build the routine yet. Just
notice that it's there. Or turn something entirely different into a skill, and tell me what.

**Where I might be wrong.** Three is my number, not a law. Some prompts earn a skill on the second use and
some never do. And a skill is one more thing to maintain, so a pile of them can cost more than it saves.
Your skills will look nothing like mine, and that's the point.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
