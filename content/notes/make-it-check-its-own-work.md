---
title: "The AI Says It's Done. Make It Prove It."
audience: [learn]
level: intro
subtitle: "Done is a claim, not a result. Early on, you check by hand: ask for evidence, run it yourself, then hand it to a fresh pair of eyes."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~4 min"
tags: [ai, workflow, teaching]
summary: >
  When an AI says it's finished, that's a claim and not a result. Check it by hand against the brief, the
  drawing and the plan you wrote: ask for evidence for each done line, run it yourself, and have a fresh
  session review the work, because the session that built it tends to agree with itself. Write down what
  it keeps missing, and let tests take over the checking once you know what to check. My loop does it automatically, but doing it
  by hand first is how you learn what's worth automating.
social: |
  "Done! All tests passing."

  Said every AI, every day. It's a claim, not a result.

  Before you have a loop that checks for you, you check by hand. Three habits, in order:
socialImage: "/media/notes/make-it-check-its-own-work-social.png"
socialImageAlt: "A card from the Harbor path of Learn AI with me, titled The AI Says It's Done. Make It Prove It., with the line: \"Done! All tests passing.\""
---

"Done! Everything is working and all the tests pass."

It feels wonderful for about ninety seconds. Then you open the thing and the button does nothing. The AI
wasn't lying. It told you what it believed, the way a teammate says "yeah, I looked at it" without opening
the file.

Most of my prompting isn't "build this." It's "check this." A model is fluent enough to sound right exactly
when it's wrong, so it earns more scrutiny than a junior's pull request, not less. And I've been fooled by
my own checks too. I once trusted one for three weeks before counting and finding it had run once in a
hundred and sixty-five sessions, which I wrote up in [The Check Ran Once in 165
Sessions](the-check-that-never-ran.md). So "done" is the start of a conversation, and so is "the check
passed."

## Done is a claim, not a result

The AI reports what it believes happened. It might have fixed one place and missed another, run the tests
but not the one that mattered, or solved a slightly different problem than the one you set.

That's why you wrote the brief, the drawing and the plan. They're what you check against. Without them, "is
it done?" has no answer. With them, it has three.

## Make it show you the evidence

I don't ask "is it done?" I ask: "Go through the plan, step by step. For each done line, show me the
evidence that it's true."

Evidence is something you can see: command output, a screenshot, a test that failed before and passes now.
If it says "the form works," ask what it ran to know that. A claim without evidence goes back in the pile.

## Run it yourself

Then do the part nobody can do for you. Open the thing and use it the way a user would: open your
portfolio, scroll to the roadmap, click an evidence link, refresh. And ask for the list of files it touched
and skim it against your leave-alone list. Reading a diff gets easier fast, and it's the skill I'd most
encourage you to build while you're learning.

## Then ask a fresh pair of eyes

I open a brand new session and give it the brief, the plan and the changes, and ask: "Review this work.
Find what's wrong or missing."

The second pass has to come from something that didn't write the code. A session that just wrote
something already believes it and will defend it convincingly, and a cold one won't. It's the same reason
you don't mark your own exam. In my experience that holds up, though it's my experience and not a
measurement, so test it on something small. The same idea sits behind the AI code reviewer I built for my
team, told in [Seven Hundred Commits to Teach a Reviewer It Was
Wrong](the-reviewer-that-learned-to-be-wrong.md). For now, a new chat is all you need.

## Write down what it keeps missing

Sooner or later you catch the same miss twice: an empty list it never handles, a debugging line it leaves
in. I don't just fix it. I write it down in the file where the brief lives, as a line the next session will
read.

That list becomes your checklist, and it's the start of making this your own. My loop runs checks like
these automatically, and [Set Up the Loop With One Prompt](loop-setup.md) covers that. [PANTRY](/pantry)
even has a doctor command that checks the loop is wired up. But I did it by hand first, because that's how
I found out which checks were worth automating. Next, the best check of all is one that runs itself, which is [A Test Is a Check That Runs Itself](a-test-is-a-check-that-runs-itself.md).

## Your turn

Take the last step your AI called finished on your portfolio. Ask for evidence for each done line and run it
yourself. Then open a new session, hand over the brief, the plan and the changes, and ask for a review.
Write down anything the review found that the first session didn't. Or check something else you've built,
and tell me what turned up.

Then add your first roadmap entry, in your own words: what did you learn about briefing and checking? The AI
can fix your typos, but the words are yours.

**Where I might be wrong.** None of this makes mistakes impossible. A fresh reviewer can miss things or
invent problems that aren't there. You're still the person accountable for what ships, so you still have to
understand it. If you can't say why it works, go back and ask.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
