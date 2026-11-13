---
title: "Two Thousand Commits, and the To-Do App Still Doesn't Exist"
audience: [build]
level: intro
subtitle: "In July I wrote that I built a whole stack because no to-do app would have me, and promised the desk would take it from here. Four months and about two thousand commits later, here is what I actually built, told from the git log, and whether the desk ever took the wheel."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
layout: timeline
date: 2026-11-13
readingTime: "~8 min"
tags: [stack, ai, web-platform]
summary: >
  The follow-up to my origin story, told from the git history of six repositories. In July I promised
  to ship this portfolio, publish the repos, and then build the assistant that manages me. The first
  two happened. The third turned sideways: instead of an AI that manages me, I built a loop that
  manages the AI, and the writing it let me do started opening conversations about work. The to-do app still
  does not exist.
---

On `Jul 2` I published a note that ended with a promise. I would ship this portfolio, publish the
repos so the claims were checkable, and then go back and build the assistant I needed in the first
place. The last line handed the job over: *"It will be the desk's."*

As a snapshot, on `Nov 13` the six repositories behind this site hold a little over two thousand
commits. This one alone has 1,294. I went back through all of them to find out which of those three
promises I kept. Two, mostly. The third one I kept in a shape I did not plan, and the to-do app,
the actual reason any of this exists, still does not exist. I would like it noted that I am
consistent.

### The months, on one chart

<svg viewBox="0 0 600 260" width="100%" role="img"
     aria-label="Bar chart of commits per month across the six repositories behind this site, June to November 2026, a snapshot taken November 13: 24 in June, 710 in July, 462 in August, 47 in September, 202 in October, and 613 in November so far. Under each month, the notes published that month: 8 in July, 4 in August, none in September or October, and 11 in November so far."
     style="display:block;width:100%;height:auto;margin:0 0 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13px">
  <line x1="30" y1="200" x2="570" y2="200" style="stroke:var(--color-line);stroke-width:2"/>
  <g style="fill:var(--color-fg)">
    <rect x="50"  y="195" width="56" height="5"/>
    <rect x="140" y="40"  width="56" height="160"/>
    <rect x="230" y="96"  width="56" height="104"/>
    <rect x="320" y="189" width="56" height="11"/>
    <rect x="410" y="154" width="56" height="46"/>
    <rect x="500" y="62"  width="56" height="138" style="fill:var(--color-muted)"/>
  </g>
  <g style="fill:var(--color-fg)" text-anchor="middle">
    <text x="78"  y="188">24</text>
    <text x="168" y="33">710</text>
    <text x="258" y="89">462</text>
    <text x="348" y="182">47</text>
    <text x="438" y="147">202</text>
    <text x="528" y="55">613</text>
    <text x="78"  y="220">Jun</text>
    <text x="168" y="220">Jul</text>
    <text x="258" y="220">Aug</text>
    <text x="348" y="220">Sep</text>
    <text x="438" y="220">Oct</text>
    <text x="528" y="220">Nov</text>
  </g>
  <g style="fill:var(--color-muted);font-size:12px" text-anchor="middle">
    <text x="78"  y="240">no notes</text>
    <text x="168" y="240">8 notes</text>
    <text x="258" y="240">4 notes</text>
    <text x="348" y="240">none</text>
    <text x="438" y="240">none</text>
    <text x="528" y="240">11, so far</text>
  </g>
</svg>

Commits per month across grain, batch, bread, pantry, greenroom and this site, with the notes
published under each bar. November is only thirteen days old, which is the grey bar's excuse.

## Jul 5 · Then the portfolio ate the stack

The first commit in this repository is `consolidation: rename portfolio/ → tjakoen.github.io/`, and
the two after it move the component catalog out of BATCH and into GRAIN. That is the whole of July
in three lines. I said the portfolio was the modest, finishable thing, and then it turned into the
place where every layer had to prove it could stand up with someone else's weight on it.

It mostly could. By `Jul 9` the plans board was mounted at /plans. By `Jul 20` CRUMB was running a
guided tour of the site. By `Jul 31` there was a page called *Watch me work*, where the desk
pilots the real site in front of you. Seven hundred and ten commits in one month, across six repos,
and eight notes. Including the origin story, which I wrote before most of this existed and which
was, in hindsight, a very confident table of contents.

## Aug 5 · Then the rules had to actually fire

August is where the shape of the work changed. The commit that marks it is
`plan: make standards fire as skills, give pantry a feedback loop`. Up to then my standards were
documents. A model could read them, agree with them, and then write an em-dash anyway.

So the month went into making them enforceable. The voice standard got a linter. The standards
became skills a session loads before it writes. Hooks started refusing work that skipped a step. And
the commit titles from that stretch read like a man discovering how much of his own advice was
decorative: `docs(standards): the delegation rule was written, correct, and never once used`, and
`docs(plans): a video from outside finds four standards that were written and never run`. Some of that became
[Ten Times Zero Is Still Zero](ten-times-zero.md) and
[The Check Ran Once in 165 Sessions](the-check-that-never-ran.md).

## Sep 1 · Then it went quiet

Forty-seven commits in September. I would love to say I was resting. I was not. The work moved to
my day job, where a Claude skill I wrote to review pull requests was turning into the thing I later
wrote up as [Seven Hundred Commits to Teach a Reviewer It Was Wrong](the-reviewer-that-learned-to-be-wrong.md),
and to a talk about it, whose slides got a commit called
`feat(talks): the limits slide is now a wall, because the rule became one`. The loop I had built for this site
was quietly getting its hardest test somewhere else. The chart just could not see it.

## Oct 2 · Then the builder had to stop bluffing

October came back with `feat(builder): review AI edits before applying`. The builder is the small,
in-browser model that edits pages on this site, and the month was mostly teaching it to say no.
`fix(builder): refuse missing explicit block targets`. `fix(builder): explain measured local draft limits`. It is a tiny model
and it was making confident edits to things it had not understood. The fix was not a bigger model.
The fix was making it show its work and ask before touching anything. That is the same lesson as
the reviewer, at a much smaller scale, and I seem to need to learn it once per project.

## Nov 3 · Then I finally wrote it down

Eleven notes in eleven days. Some of it was overdue, a backlog of things I had built and never
explained. Most of it was possible because of August: the voice standard, the loop and the review
gate are what let me write at that pace without the result reading like a chatbot wrote it in my
name.

I started posting them on LinkedIn, and they got more traction than I expected from a man who
writes about commit hooks. The site's traffic went up with them. And then people I had never met
started reaching out because of something they had read, and a few of those conversations turned
into real ones about work.

I did not plan that. In July the portfolio was a proof that the stack works. It turns out the part
that worked hardest was the writing, which is the part I was least sure about.

## Nov 13 · So did the desk take the wheel?

Here is the honest scorecard against the July promises.

| Promised on `Jul 2` | Where it stands on `Nov 13` |
|---|---|
| Ship this portfolio | Shipped, at portfolio.tjakoen.com, and rebuilt more times than I would like to count |
| Publish the repos | Public, with the AI use flown on every README |
| Build the assistant that manages me | Not built. Something else got built instead |

The something else is the interesting part. I set out to build an AI that manages me. What I built
is a loop that manages the AI. PANTRY hands a session a plan, makes it claim the plan before it
starts, and expects a heartbeat while it works. Hooks refuse a commit that skips the checks. A
session that forgets its standard gets told. Somewhere in there it started managing me too, a
little: it is PANTRY, not me, that knows which plans are open, and it is the checklist at the top of
every session that reminds me what I left uncommitted.

That is not the desk. It is closer to a very strict office manager who works for the machines and
occasionally cc's me. But it is the floor the desk would have to stand on, and in July I did not
know I needed one.

## What I have not shown

The commit counts are a snapshot, and commits are a poor measure of work. A month of forty-seven
careful commits can matter more than a month of seven hundred small ones, and September is the
proof. The traction and those conversations are real, but I am not putting numbers on them here, and a
handful of good conversations is not a trend. And the main claim of the origin story, that a person
working with an AI on a shared surface gets more capable, is exactly as unproven as it was in July.
I have more receipts now. I do not have a study.

## The to-do app

In July I wrote that no to-do app would have me, so I built software shaped like the person I
already am. Two thousand commits later, that person has a design system, a content engine, a plans
board, a review loop, a linter for his own voice, and a site that starts conversations about work.

He still does not have a to-do list. It is on the board, though. PANTRY has it.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
