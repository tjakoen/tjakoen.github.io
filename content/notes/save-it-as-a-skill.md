---
title: "The Third Time You Type It, Save It"
audience: [learn]
level: intro
subtitle: "You've now typed the same plan prompt and the same audit prompt more than once. That repetition is the reason to make a skill, and it's why you won't need to guess what one should do."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~4 min"
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

You've now typed some version of the same two prompts a few times. "Break this into small steps, each with
what done looks like." And "go through the plan and show me the evidence for each done line." You know
them by heart, and you're a little tired of them.

That tiredness is useful. It's telling you what to save.

## A skill is a prompt you've earned

A skill is a saved set of instructions your agent can run on request, like a recipe it can pull off the
shelf. The Claude Academy lessons cover the mechanics, and your agent can explain how yours works if
you ask. What I want to give you is the rule for when.

**Don't write a skill until you've typed the thing three times by hand.** Before that, you're guessing
what it should say. After that, you know, because you've seen what you kept correcting. The first two
are probably already in front of you: the plan prompt from the planning note and the check prompt from the
audit note. Every correction you give twice is a line waiting to go into the skill.

## Let your agent write it, then you edit it

Don't start from a blank page. Right after a session where the prompt worked, say: "Turn what we just did
into a skill." Then read what it wrote the way you'd read a plan. Does it say when to use it? Are the
steps what you'd do? Is something in there you never asked for?

Here's the shape, in plain words. Your harness will format it differently.

```text
Name: check-the-work
Use when: the AI says a step is done.
Steps: read the plan, and for each done line show evidence you can see,
run the tests, list the files changed against the leave-alone list,
and say anything you could not verify.
```

Keep a skill to one job. Save it in the project, next to your brief and plan, so every session finds it.
And as you catch new misses, add a line. That's how it gets better, and how it starts to sound like how
you work.

## Let the loop notice for you

By hand, you do the noticing. In my own loop I've set the agent to do it. While we work, it writes down
when I ask for the same kind of thing again. At the end of a session it looks over those notes, and when
the same request has turned up in three sessions, it asks whether I want to make a skill of it. I say yes,
edit it, or no. That "three" is the same rule as above, written into the loop. It's still being built, and
I haven't shown how well it works, which [I Kept Telling My AI the Same Thing](the-loop-that-learned-how-i-work.md)
is honest about. Start by noticing yourself. The loop comes later.

## Keep judgment manual

Not every skill should run by itself. I run my audits by hand. My loop tells me when one is due and I
decide to go. That's a preference, not a rule, but there's a reason: an audit is a judgment, and I want
to be in the room for it.

## When a skill earns a routine

A routine, sometimes called a scheduled loop, runs a skill on a timer or when something happens, with you
nowhere in sight. Your agent can show you how yours does it. The test for whether one is worth building is
the same as for a skill, with one more clause. It has to be repeated, boring, and **checkable**, so you can
tell it worked without reading its mind.

Mine are things like these. One checks whether my classes have been graded. One moves tickets that are due
for code review into the code reviewer's queue. One updates my team's metrics calculations. Nobody is
making a judgment call in any of them, and a wrong result is easy to spot.

Look at what's missing from that list. No audits. Nothing that edits code and ships it unreviewed. A
routine that does something you'd have to think about doesn't save time, it files a mess for you to sort
out later.

And check that a routine actually ran. I once trusted a check for three weeks before I counted and found
it had run once in a hundred and sixty-five sessions, which is the story in
[The Check Ran Once in 165 Sessions](the-check-that-never-ran.md). Anything that runs while you're not
looking needs something that tells you when it didn't.

## Try this

Pick the prompt you've typed most. Ask your agent to turn it into a skill, then edit it and save it in your
project. Run it on something small. Then write down one chore you do over and over that's boring and
checkable. Don't build the routine yet. Just notice that it's there.

Your skills will look nothing like mine, and that's the point. Mine came from my repetition, and yours will
come from yours. [Set Up the Loop With One Prompt](loop-setup.md) shows how I tie mine together once there
are enough of them.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
