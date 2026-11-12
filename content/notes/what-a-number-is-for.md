---
title: "I Trust the Number. I Do Not Trust What I Say About It."
audience: [lead, build]
level: deep
subtitle: "I manage a team and I measure a lot of things. The counting has never been what went wrong. Every time I got hurt, it was by the sentence I attached to the count."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-12
readingTime: "~4 min"
tags: [measurement, leadership, workflow]
summary: >
  What metrics mean to me, from measuring my team, my AI workflow and myself. A number
  tells me what happened and never why, so I treat it as the place to start asking. Individual numbers
  never reach a performance review, the definition matters more than the dashboard, and a report that
  only ever improves is one I have stopped believing.
---

One of my checks ran once in 165 sessions. That number was correct, and I still managed to be wrong
about it for most of a day.

I had built a check that fires when I sit down to work, rolled it out across my repositories, and
written a note saying it ran everywhere. Three weeks later I finally counted. In my biggest project it
had run one time. I looked at that and wrote myself a thoughtful theory about discipline and habit.
Then I ran the check by hand from the wrong folder and watched it fail to find its own program. It
had never been able to start. The long version is in
[The Check Ran Once in 165 Sessions](the-check-that-never-ran.md).

The count was fine. The story I hung on it was invented, and it survived because it was plausible
and nobody ran the one command that would have killed it. That is most of what I believe about
metrics now.

> A measurement tells me what happened. It has never once told me why.

## A number is where I start asking

Before I had data on my team I had opinions about how the team was doing, and I was fairly
comfortable with them, which should have been the warning. Then I set up
[Apache DevLake](https://devlake.apache.org/) and had a lake of real figures for cycle time and
review time. The dashboards were the part I expected to keep. What I kept was the set of queries
that said exactly what each number counted. When I later built my own team view, those definitions
became its spec, and I checked its figures against DevLake's before I trusted either. That story is
in [I Showed My Team a Dashboard](show-them-the-board.md).

So the first thing I ask of a metric is what it counts, precisely enough that two people would get
the same answer. A number without a definition is an opinion wearing a lab coat.

The second thing I ask is what it cannot see. A pull request merged as written and a pull request
merged after somebody rewrote half of it look the same in every standard figure. They are different
outcomes. If the number I am looking at cannot tell those two apart, I go and read the pull requests.

> *Figure: one count, two stories. The same bar (one run in 165 sessions) with the reason I wrote
> down on the left and the reason that was true on the right. To be drawn to the FIGURES scaffold
> before this leaves DRAFT.*

## The rule about people

Individual numbers never feed a performance review. They roll up to the team. That is the rule I
gave other organizations in [Build the Floor](build-the-floor.md), and the reason is plain: the
moment people suspect otherwise, I am measuring how well they game the count and I have lost the
thing I wanted to know.

[Only you can write this part: whether the rule is written down for your own team, what it has cost
you, and a time a number about a person tempted you.]

## A report that only improves

My pull request reviewer scores every finding it posts by what happened next. That log is the reason
I trust it, and it is also the reason I can say what I have not shown. I know which comments people
acted on. I do not know that the codebase got better, because that is a longer study than three
months and I have not run it. Both sentences come out of the same log, and I think a metric has done
its job when it gives me the second one as readily as the first.
[The Reviewer That Learned to Be Wrong](the-reviewer-that-learned-to-be-wrong.md) has the receipts.

I have started to distrust any report of mine that only goes up. Either I picked a number that
cannot go down, or I stopped looking on the bad weeks. When I wrote up how an organization should
measure its AI adoption, the line I cared most about was the plain one: report the numbers that went
the wrong way, because a report that only ever improves stops being read.

## What I have not earned

I am better at measuring my tools than at measuring myself. I can tell you how often a check ran and
how many review comments landed. I cannot tell you with a number whether I am a better manager than
I was a year ago, and I am suspicious of anyone who can.

[Optional: one number you do keep on yourself, if there is one, and whether you believe it.]

So here is what metrics mean to me. I trust the count. I hold the sentence after it loosely, I write
down what the count cannot see, and before I act on any of it I go and run the command.

Once in 165 sessions was true the whole time. I was the part that needed checking.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
