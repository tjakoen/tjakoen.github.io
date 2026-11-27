---
title: "A Test Is a Check That Runs Itself"
audience: [learn]
level: intro
subtitle: "Testing often gets skipped in school. It's the least glamorous rule I follow and the one that does the most work: the seatbelt that lets me go fast."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~3 min"
tags: [ai, workflow, teaching]
summary: >
  A test is the check you already do by hand, written down so a machine runs it. This note introduces unit
  tests and end-to-end tests from scratch, links to good explanations, and gives one habit: tell the AI to
  write the tests as it builds, one for each done line, so it stays accountable to its own definition of
  done and the next session has something to run.
social: |
  Testing often gets skipped in school.

  It's also the least glamorous rule I follow, and the one that does the most work: the seatbelt that lets me
  go fast.

  A test is a check that runs itself. Here's the idea from scratch, and the one habit I'd wire in from day
  one:
---

Tests are the least glamorous rule I follow, and they do the most work. They're the seatbelt that lets me
drive fast. In my own repos the type-checker and the test suite have to come back green before I call
anything done, and tests are part of the work, not a phase after it.

Testing often gets skipped in school, though, so if this is new to you, you're in good company. Here's the
idea from scratch.

## It's the check you already do

You already test your work. You open the page, click the button and see if it works. A test is that same
check written down as a little program, so a machine can run it in a second, as often as you like, without
forgetting a step.

Here's what one looks like. It's JavaScript, and yours will look different in another language, but the
shape is the same.

```js
test("newest roadmap entry shows first", () => {
  const entries = [
    { title: "Briefs", date: "2026-12-01" },
    { title: "Plans", date: "2026-12-08" },
  ];
  expect(sortNewestFirst(entries)[0].title).toBe("Plans");
});
```

Make two entries, sort them, check the newest comes first. Run the tests and the machine says pass or fail,
and a fail comes with a message like "expected Plans, received Briefs" to tell you where to look.

## Two kinds worth knowing by name

That one is a **unit test**: it checks one small piece on its own, and it runs in a blink, so you can have
hundreds. An **end-to-end test**, or e2e test, drives the whole app the way a user would: open your
portfolio, find the roadmap, click an evidence link, check it opens. It's slower and there are fewer of
them, but it's the closest thing to asking "does this really work?"

Martin Fowler's [Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
explains how the two fit together, [freeCodeCamp](https://www.freecodecamp.org/news/end-to-end-testing-tutorial/)
has an e2e tutorial, and [Playwright](https://playwright.dev) is one popular e2e tool for websites. Every
language and framework has a standard way to test, so I won't teach the tools here. Ask your agent: "What's
the usual way to test a project built with this stack, and how do I run the tests?"

## Make the AI write them as it builds

Here's the habit I'd wire in from the start, and put right in your brief: **the AI writes the tests as it
builds.** Each done line in your plan gets a test, and a step isn't finished until its tests pass. That
keeps the AI accountable to its own definition of done, because it can't say "done" while a test is
failing. It also helps whoever comes next. The next session, another forgetful AI, can change the code and
run the tests to see whether it broke something. The tests are a memory that runs.

You don't need to read every test line by line yet. Read the names, and ask what each one proves. And ask
to see a new test fail before it passes, because a test that has never failed might not be checking
anything.

## Your turn

Ask your AI to add a test for one done line in your portfolio plan, to show it failing first and then
passing, and to explain what it proves. If your portfolio is a single static page, a unit test on its small
JavaScript and one e2e test that opens the roadmap are plenty. Or pick a different project, and tell me
what the test caught.

**Where I might be wrong.** Tests can be wrong, or so weak they can't fail, and they're only as good as your
done lines. They also cost time to keep. For a one-evening experiment I'd skip them, and I'd add them the
moment something matters to me.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
