---
title: "Build Your Own, Don't Copy Mine"
audience: [learn]
level: intro
subtitle: "You've now seen most of how I work. The last note in the Harbor is the one I care about most: take what's useful, change the rest, and show me what you made."
author: "Tjakoen Stolk"
status: DRAFT
type: note
series: harbor
seriesOrder: 13
date: 2026-11-28
readingTime: "~4 min"
tags: [ai, workflow, teaching]
summary: >
  The Harbor ends where it started: with your own version. This note lists what you should be holding by
  now, says why copying my setup is the wrong move, and explains how the rest of the path splits. The first
  half is written for students and builders, the second half for people who lead teams or work at senior level,
  and you can cross over whenever you like.
social: |
  I'm not the one writing the standards. I'm one of the people reading what others do and working out what fits.

  So the last Harbor note isn't another technique. It's a checklist of what you should have by now, and a
  push to change all of it until it sounds like you.
socialImage: "/media/notes/build-your-own-do-not-copy-mine-social.png"
socialImageAlt: "A card from the Harbor path of Learn AI with me, titled Build Your Own, Don't Copy Mine, with the line: I'm not the one writing the standards. I'm one of the people reading what others do and working out what fits."
---

In the first note I told you this wasn't a tutorial, and I meant it. I'm closing the Harbor on the same line,
because it's the one I'd most like you to keep: what I do works for me, and I'm not promising it works for
you.

I'm not the person who writes the standards. I read what other people do, work out what fits me, and
share what I landed on. You can do the same, and you'll land somewhere different, and that's the idea.

## Why copying mine goes wrong

If you copy my files into your project, you'll get a setup that sounds like me and fits my work. It'll have
rules for problems you don't have and nothing for the ones you do. And you won't be able to explain why any
of it is there, which is the test from the plan note failing in advance: could I explain this, and fix it,
if the AI weren't here tomorrow?

When I showed my team what I was doing, I didn't give them a template. Most of the juniors now have their own
Claude-built dashboard for managing their work, and no two look alike. It's a bit messy and none of them is
standard. [Show Them the Board](show-them-the-board.md) tells that story. They each built something that
fit how they think, which is the thing I couldn't have handed them.

## What you should have by now

If you've done the turns, you're holding more than you think. Read this as a list of things you made, not
things you were told.

- **A portfolio** with a roadmap page, one entry per lesson, in your words.
- **A brief** with a goal, a done line and a leave-alone list.
- **A drawing or two** saved beside it, in the shape of the five levels if you sorted it that way.
- **A plan** with steps you tick off, and a stack you chose and can explain.
- **A check**: a test per done line, a manual audit, and the habit of reading the diff.
- **A skill** you earned by typing it three times.
- **A front-door file and an inbox**, and a loop you run one step at a time.

```mermaid label="What you hold at the end of the Harbor: a brief, drawings, a plan, checks, a skill, a front-door file and an inbox, all feeding one loop that builds your portfolio."
flowchart LR
  brief["Brief"] --> loop
  drawings["Drawings"] --> loop
  plan["Plan"] --> loop
  checks["Checks"] --> loop
  skill["Skill"] --> loop
  front["Front door and inbox"] --> loop
  loop(("Your loop")) --> portfolio["Your portfolio"]
```

If you're missing one, go back for it. If you've got all of them, you've built the whole kit once, which
teaches more than reading about it does.

## Now change it

Here's what I'd do before leaving the island. Take one thing from this path and break it on purpose. Rename
the files. Cut a rule you never use. Add a rule for something that annoyed you this week. Swap the plan format for
one you like better, or turn the roadmap into a game. Whatever you pick, change it until it
can't be mistaken for mine, and write one line in your roadmap about why.

Then share it. I mean that plainly. Email me, message me, or use the contact page on my [portfolio](/mail).
Send a link to what you made, even if it's half finished. The best things I've learned about this came from
someone showing me a version I wouldn't have thought of.

## The road splits here

The Harbor is the on-ramp, and past it the path is built in two halves. The first half is for students and
builders. Loop Forest and Model Mines are the practice: the long note that makes the whole argument,
the one-prompt loop setup, and the notes on how the models and their layers actually work. Read these next, in
order, and use your portfolio to try each idea.

The second half is written for people who lead teams or work at senior level. Guild Hall, GRAIN Keep and the
Summit are about getting a team to do this, keeping it honest when many people are involved, and the deeper
engineering underneath. You can read them early if you're curious, and I'd encourage it. They're simply
written for a reader with a team, so some of it won't apply to you yet. When it does, you'll know where to
look.

Either way, you don't need my permission to skip ahead. The map is a suggestion, and you're the one walking it.

## Your turn

Do the change-it step. Pick one thing from the list above and rebuild it your own way. Add a line to your
roadmap saying what you changed and why, then send me the link. Or don't send it, and keep it for yourself.
Just don't leave it as a copy of mine.

**Where I might be wrong.** I may be wrong about my own advice, since I've worked this way for about six
months. Some of what I call fundamentals will look quaint in a year, and some of what I warned you about
may turn out not to matter. If you find that out before I do, I'd like to hear it. And "build your own"
can become a way of avoiding learning from people who know more. Copy first, if that's what gets you moving,
and then change it.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
