---
title: "The AI Says It's Done. Make It Prove It."
audience: [learn]
level: intro
subtitle: "Done is a claim, not a result. Early on, you check by hand: ask for evidence, run it yourself, then hand it to a fresh pair of eyes."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~6 min"
tags: [ai, workflow, teaching]
summary: >
  When an AI says it's finished, that's a claim and not a result. Check it by hand against the brief, the
  drawing and the plan you wrote: ask for evidence for each done line, run it yourself, and have a fresh
  session review the work, because the session that built it tends to agree with itself. Better still,
  have the AI write unit and end-to-end tests as it builds, so its own definition of done is checked every
  time. Write down what it keeps missing. My loop does this automatically, but doing it by hand first is how you learn what's
  worth automating.
social: |
  "Done! All tests passing."

  Said every AI, every day. It's a claim, not a result.

  Before you have a loop that checks for you, you check by hand. Three habits, in order:
---

"Done! Everything is working and all the tests pass."

It feels wonderful for about ninety seconds. Then you open the thing and the button does nothing. The AI
wasn't lying. It told you what it believed, the way a teammate says "yeah, I looked at it" without opening
the file.

I'm not saying don't trust it. It's often right, and often more careful than I am. But I once trusted a
check of my own for three weeks before counting and finding it had run once in a hundred and sixty-five
sessions, which I wrote up in [The Check Ran Once in 165 Sessions](the-check-that-never-ran.md). So "done"
is the start of a conversation, and so is "the check passed."

## Done is a claim, not a result

The AI reports what it believes happened. It might have fixed one place and missed another, run the tests
but not the one that mattered, or solved a slightly different problem than the one you set.

That's why you wrote the brief, the drawing and the plan. They're what you check against. Without them, "is
it done?" has no answer. With them, it has three.

## Make it show you the evidence

Don't ask "is it done?" Ask: "Go through the plan, step by step. For each done line, show me the evidence
that it's true."

Evidence is something you can see: command output, a screenshot, a test that failed before and passes now.
If it says "the form works," ask what it ran to know that. A claim without evidence goes back in the pile.

## Let tests do the checking

Testing often gets skipped in school, so if this is new to you, you're in good company. You already test
your work: you open the page, click the button and see if it works. A test is that same check written down
as a little program, so a machine can run it in a second, as often as you like, without forgetting a step.

Here's one. It's JavaScript, and yours will look different in another language, but the shape is the same.

```js
test("newest roadmap entry shows first", () => {
  const entries = [
    { title: "Briefs", date: "2026-12-01" },
    { title: "Plans", date: "2026-12-08" },
  ];
  expect(sortNewestFirst(entries)[0].title).toBe("Plans");
});
```

Make two entries, sort them, check the newest comes first. Run the tests and the machine says pass or
fail, and a fail comes with a message like "expected true, received false" to tell you where to look.

Two kinds are worth knowing by name. That one is a **unit test**: it checks one small piece on its own, and
it runs in a blink, so you can have hundreds. An **end-to-end test**, or e2e test, drives the whole app the
way a user would: open your portfolio, find the roadmap, click an evidence link, check it opens. It's
slower and there are fewer of them, but it's the closest thing to asking "does this really work?"
Martin Fowler's [Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
explains how the two fit together, [freeCodeCamp](https://www.freecodecamp.org/news/end-to-end-testing-tutorial/)
has an e2e tutorial, and [Playwright](https://playwright.dev) is one popular e2e tool for websites. Every
language and framework has a standard way to test, so I won't teach the tools here. Ask your agent: "What's
the usual way to test a project built with this stack, and how do I run the tests?"

Here's the habit I'd wire in from the start, and put right in your brief: **the AI writes the tests as it
builds.** Each done line in your plan gets a test, and a step isn't finished until its tests pass. That
keeps the AI accountable to its own definition of done, because it can't say "done" while a test is
failing. It also helps whoever comes next. The next session, another forgetful AI, can change the code and
run the tests to see whether it broke something. The tests are a memory that runs.

You don't need to read every test line by line yet. Read the names, and ask what each one proves. And ask
to see a new test fail before it passes, because a test that has never failed might not be checking
anything. Tests can still be wrong or too weak, and they're only as good as your done lines.

## Run it yourself

Then do the part nobody can do for you. Open the thing and use it the way a user would: open your portfolio,
scroll to the roadmap, click an evidence link, refresh. And ask for the list of files it touched and skim it against your
leave-alone list. Reading a diff gets easier fast, and it's the skill I'd most encourage you to build
while you're learning.

## Then ask a fresh pair of eyes

Open a brand new session. Give it the brief, the plan and the changes, and ask: "Review this work. Find
what's wrong or missing."

In my experience, the session that built something is the worst judge of it. It remembers its own
reasoning and tends to agree with itself, while a fresh one reads like a stranger would. That's my
experience, not a measurement, so test it on something small. The same idea sits behind the AI code
reviewer I built for my team, told in [Seven Hundred Commits to Teach a Reviewer It Was
Wrong](the-reviewer-that-learned-to-be-wrong.md). For now, a new chat is all you need.

## Write down what it keeps missing

Sooner or later you'll catch the same miss twice: an empty list it never handles, a debugging line it
leaves in. Don't just fix it. Write it down in the file where your brief lives, as a line the next session
will read.

That list becomes your checklist, and it's the start of making this your own. My loop runs checks like
these automatically, and [Set Up the Loop With One Prompt](loop-setup.md) covers that. [PANTRY](/pantry)
even has a doctor command that checks the loop is wired up. But do it by hand first, because that's how you
find out which checks are worth automating.

## Checking is not proof

None of this makes mistakes impossible. A fresh reviewer can miss things or invent problems. You're still
the person accountable for what ships, so you still have to understand it. If you can't say why it works,
go back and ask.

## Try this

Take the last step your AI called finished on your portfolio. Ask for evidence for each done line and a
test for one of them, then run it yourself. Open a new session, hand over the brief, the plan and the
changes, and ask for a review. Write down anything the review found that the first session didn't.

Then add your first roadmap entry, in your own words: what did you learn about briefing and checking? Write
it yourself. The AI can fix your typos, but the words are yours.

If it found something, you've seen why this matters. If it found nothing, you've earned a little more trust
in that piece of work.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
