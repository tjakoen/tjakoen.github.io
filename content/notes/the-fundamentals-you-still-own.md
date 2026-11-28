---
title: "The Fundamentals You Still Own"
audience: [learn]
level: intro
subtitle: "The AI types faster than you now. That moves your job from writing code to reading it, which is the part of the fundamentals school least often drills."
author: "Tjakoen Stolk"
status: DRAFT
type: note
series: harbor
seriesOrder: 8
date: 2026-11-28
readingTime: "~6 min"
tags: [ai, workflow, teaching]
summary: >
  When an AI writes the code, you spend your day reviewing it, so four fundamentals matter more, not less:
  reading a diff, using git so any step can be undone, writing code a stranger can follow, and knowing what a
  test proves. I don't teach them here. I say why each one pays more now, give you one small thing to
  practice, and point you to someone who teaches it well.
social: |
  A strange thing happens when an AI writes your code: your job quietly turns into reviewing it.

  That makes four fundamentals worth more, not less. Reading a diff. Git. Code a stranger can follow. Tests.

  I'm not teaching them here. I'm telling you why they pay more now, and where to learn them properly:
socialImage: "/media/notes/the-fundamentals-you-still-own-social.png"
socialImageAlt: "A card from the Harbor path of Learn AI with me, titled The Fundamentals You Still Own, with the line: A strange thing happens when an AI writes your code: your job quietly turns into reviewing it."
---

Here's a thing I didn't see coming. When the AI took over most of the typing, I expected to write less and
think about the same amount. What actually happened is that I read more than I ever have. Every step the agent
takes comes back to me as a pile of changes, and my job is to say yes, no, or not like that.

That's a different skill from writing, and school mostly teaches the other one. You can get through a degree
writing a lot of code and reading very little that isn't yours. So this note is about the fundamentals that
decide whether you can supervise the teammate who never asks questions, which is how the first note in this
path describes your AI. I'm not going to teach them. Each one has a good teacher already, and I'll send you there.

## Reading a diff

A diff is the list of changes between two versions of your project: these lines removed, these lines added.
It's what an agent hands back, and it's the thing you're approving. If you can't read one, you're approving
on trust, which is the blind vibe coder from the Start Here note.

Reading a diff is a skill with a few habits. Read the files that changed before the lines that changed. Ask
what each change is for, and notice when one has nothing to do with your plan. Look hardest at what was
deleted, because that's where quiet damage hides. Google's engineering practices include a plain list of
what a reviewer looks for, and
[what to look for in a code review](https://google.github.io/eng-practices/review/reviewer/looking-for.html)
is short enough to read in one sitting. It's written for humans reviewing humans. It works just as well on an
agent, and that's the version that matters now.

**Practice:** after your next small change, ask your AI to explain the diff to you line by line, then find one
line it glossed over and ask about that one.

## Git, so every step can be undone

Git is how you give yourself an undo button that goes back days instead of seconds. It matters more with an
agent than it did before, because an agent changes many files in one go and can be confidently wrong about all
of them. If your last commit is clean, a bad session costs you nothing. If it isn't, a bad session costs you
an afternoon.

The habit that does the most work is small commits, one per step of your plan, each with a message that says
what it did. That's also what lets you read the history later and see where something broke. The free
[Pro Git book](https://git-scm.com/book/en/v2) is the standard way in, and you don't need the whole book. The
first chapters on recording changes and undoing things are enough to start.

**Practice:** commit before you start each step of your plan. When one goes wrong, throw it away and ask again
with a better brief, rather than patching it.

## Code a stranger can follow

The next reader of your code is a stranger: a teammate, the AI in a fresh session with no memory, or you in
three months. A new session never remembers why you did a thing, so the code itself has to say. Clear names,
small functions that do one thing, and no clever tricks. That's most of what people mean by clean code.

An AI can write code that works and is hard to follow, so this is now something you ask for and check, not
something you hope for. Refactoring Guru has a friendly catalog of
[code smells](https://refactoring.guru/refactoring/smells), the signs that something is hard to read or
change. Skim it once and you'll start to notice them in the diffs you review.

**Practice:** ask your AI, "What would confuse a stranger about this file?" Fix the one thing you agree with.

## Tests, so done means something

You met this one in the last note, so I'll only say where it sits. Reading a diff tells you what changed. A
test tells you whether the thing still works. They cover each other's gaps, which is why I want both. A diff
can look perfect and break something three files away, and a test can pass and still be testing the wrong
thing. Neither is enough alone.

**Practice:** nothing new. Keep asking for a test per done line, and keep asking to see it fail first.

```mermaid label="The review loop: the AI makes a change, you read the diff, the tests run, you commit if it passes, and you throw the change away and ask again if it does not."
flowchart LR
  ai["AI makes a change"] --> diff["You read the diff"]
  diff --> tests["Tests run"]
  tests -->|pass| commit["Commit"]
  tests -->|fail| again["Throw it away, ask again"]
  diff -->|looks wrong| again
  again --> ai
```

## What I'm not saying

I'm not saying you must master all four before you begin. You learn them by using them, and an AI is a patient
tutor for each: ask it to explain a diff, to walk you through undoing a commit, to say why a function is hard
to read. What I'm saying is that skipping them doesn't make you faster. It makes you someone who can start
things and can't finish or fix them, and that's the person an AI makes most dangerous to themselves.

The test I keep coming back to is the one from the plan note. Could I explain this, and fix it, if the AI
weren't here tomorrow? The four fundamentals are how you keep saying yes.

## Your turn

Ask your AI to make one small change to your portfolio, then do the whole routine by hand. Commit first. Read
the diff yourself before you read the AI's explanation. Run the tests. Then write one line in your roadmap about
the first thing you caught that you'd have missed a month ago. Or pick the fundamental you feel weakest at
and spend an evening on its outside link instead, and tell me how it went.

**Where I might be wrong.** I'm giving you four, and a different person would give you five or six. Plenty
of people ship good work with a thinner version of this, and for a one-evening experiment I'd skip most of it.
It also isn't a ladder. You can be strong at git and weak at tests and be fine for a while. Pick the one that
would hurt most to be missing.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
