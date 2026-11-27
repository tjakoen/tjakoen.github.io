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
  it keeps missing. My loop does this automatically, but doing it by hand first is how you learn what's
  worth automating.
social: |
  "Done! All tests passing."

  Said every AI, every day. It's a claim, not a result.

  Before you have a loop that checks for you, you check by hand. Three habits, in order:
---

"Done! Everything is working and all the tests pass."

You've heard some version of that, and it feels wonderful for about ninety seconds. Then you open the
thing and the button does nothing. The AI wasn't lying. It told you what it believed, the way a
teammate says "yeah, I looked at it" without opening the file.

I don't want to overstate this. The AI is often right, and it's often more careful than I am. But I've
also trusted a check of my own for three weeks before counting and finding it had run once in a hundred
and sixty-five sessions. Nothing had told me. I wrote that one up in
[The Check Ran Once in 165 Sessions](the-check-that-never-ran.md). So now, "done" gets treated as the
start of a conversation, and so does "the check passed."

## Done is a claim, not a result

The AI reports what it believes happened. It doesn't always know what it never looked at. It might have
changed the right file and missed a second place that needs the same change. It might have run the tests
but not the one that mattered. It might have solved a slightly different problem than the one you set.

Which is why the three things you wrote in the last notes matter: the brief, the drawing and the plan.
They're what you check against. Without them, "is it done?" has no answer. With them, it has three.

## Make it show you the evidence

Don't ask "is it done?" Ask this: "Go through the plan, step by step. For each done line, show me the
evidence that it's true."

Evidence is something you can see. The output of a command. A screenshot. A test that failed before and
passes now. If it says "the form works," ask what it ran to know that. A claim without evidence goes
back in the pile.

This one habit catches a surprising amount, partly because the AI sometimes notices, halfway through
writing the evidence, that it doesn't have any.

## Run it yourself

Then do the part nobody can do for you. Open the thing and use it the way a user would. Add a task, tick
it off, refresh, and see if it's still there. It takes a minute or two.

And look at what changed. Ask for the list of files it touched and skim it against your leave-alone list
from the brief. If it edited something you said not to touch, you want to know now. Reading a diff gets
easier fast, and it's the single skill I'd most encourage you to build while you're learning.

## Then ask a fresh pair of eyes

Here's the trick that earns its keep. Open a brand new session. Don't tell it what you were hoping for.
Give it the brief, the plan, and the changes, and ask: "Review this work. Find what's wrong or missing."

Why a new session? In my experience, the session that built something is the worst judge of it. It
remembers its own reasoning, and it tends to agree with itself. A fresh session has only what's on the
page, so it reads like a stranger would. That's my experience, not a measurement, and I'd encourage you
to test it yourself on something small.

The same idea sits behind the AI code reviewer I built for my team. [Seven Hundred Commits to Teach a
Reviewer It Was Wrong](the-reviewer-that-learned-to-be-wrong.md) is the long version, if you're curious.
For now, a new chat is all you need.

## Write down what it keeps missing

Sooner or later you'll catch the same miss twice. It forgets to handle an empty list. It leaves a
debugging line in. It never checks what happens on a refresh. Don't just fix it. Write it down, in the
file where your brief lives, as a line the next session will read.

That list becomes your checklist, and it's the beginning of how you make this your own. It's also what my
loop is built from. The loop I use runs these checks automatically, and I'll get to that in
[Set Up the Loop With One Prompt](loop-setup.md). I'd still do it by hand first. Doing it by hand is how
you find out which checks are worth automating. [PANTRY](/pantry), the app I keep beside my sessions,
has a doctor command that checks the loop is actually wired up. That's the same idea, done by a machine
once you know what to check.

## Checking is not proof

One honest limit. All of this makes mistakes less likely, and it doesn't make them impossible. A fresh
reviewer can miss things, or invent problems that aren't there. You're still the person accountable for
what ships, so you still have to understand it. If you can't say why it works, go back and ask.

## Try this

Take the last thing your AI told you was finished. Ask it to go through the plan and show evidence for
each done line. Run it yourself. Then open a new session, hand over the brief, the plan and the changes,
and ask for a review. Write down anything the review found that the first session didn't.

If it found something, you've just seen why this matters. If it found nothing, you've got a little more
trust in that piece of work, and you earned it.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
