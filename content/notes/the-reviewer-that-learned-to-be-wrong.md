---
title: "Six Hundred Commits to Teach a Reviewer It Was Wrong"
subtitle: "In August I wrote one Claude skill to review pull requests in my voice. Two months later it has a board, a schedule, a backup model and a second person using it, and most of those commits are the reviewer being corrected."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-10-20
readingTime: "~8 min"
tags: [ai, claude, code-review, leadership, codex]
summary: >
  The story of my PR review kit at Career Team, told from its git history: one hand-run Claude skill
  in August, then an outcome log that scored every finding, routines that answer their own threads,
  a kit other people could install, Codex as a backup, and second looks that decide how much a new
  push deserves. The lesson is that the reviewer got good by being measured against
  its misses, not by being prompted harder, and that approval never left my hands.
---

On August 14 I committed one file. It was a Claude skill called check-pr-voice, and its whole job was
to review a pull request the way I would, in the tone I would, so I could stop being the bottleneck
on my own team's merges. The next day I made eleven more commits to it, and one of them was titled
*review the ticket, not just the diff*. That should have told me how this was going to go.

As a snapshot, on October 20 the repository has 608 commits and released 2.0 yesterday. I want to be
precise about what those commits are, because the number sounds like a flex and it is closer to a
confession. Most of them are the reviewer being told it was wrong, and me building the machinery to
tell it.

This note is about how the kit works and how it changed, not about anything
it found, because what it found belongs to the team and the codebase, and neither is mine to publish.

## The turns, on one line

<svg viewBox="0 0 600 250" width="100%" role="img"
     aria-label="Timeline of the PR review kit from August to October 2026: one hand-run skill on August 14, scoring its own outcomes from August 18, routines that answer their own threads on September 17, a kit anyone can install on September 28 and a board and 1.0 release on October 15, Codex as a backup on October 8, and second looks with the 2.0 release on October 19."
     style="display:block;width:100%;max-width:580px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13px">
  <line x1="30" y1="125" x2="570" y2="125" style="stroke:var(--color-line);stroke-width:2"/>
  <g style="fill:var(--color-fg)">
    <circle cx="40" cy="125" r="6"/>
    <circle cx="70" cy="125" r="6"/>
    <circle cx="222" cy="125" r="6"/>
    <circle cx="316" cy="125" r="6"/>
    <circle cx="366" cy="125" r="6"/>
    <circle cx="410" cy="125" r="6"/>
    <circle cx="560" cy="125" r="6"/>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1">
    <line x1="40" y1="119" x2="40" y2="62"/>
    <line x1="70" y1="131" x2="70" y2="180"/>
    <line x1="222" y1="119" x2="222" y2="62"/>
    <line x1="316" y1="131" x2="316" y2="180"/>
    <line x1="366" y1="119" x2="366" y2="62"/>
    <line x1="410" y1="131" x2="410" y2="210"/>
    <line x1="560" y1="119" x2="560" y2="62"/>
  </g>
  <g style="fill:var(--color-fg)">
    <text x="34" y="36">Aug 14</text>
    <text x="34" y="52" style="fill:var(--color-muted);font-size:12px">one skill, by hand</text>
    <text x="64" y="196">Aug 18</text>
    <text x="64" y="212" style="fill:var(--color-muted);font-size:12px">scores its outcomes</text>
    <text x="222" y="36" text-anchor="middle">Sep 17</text>
    <text x="222" y="52" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">answers its own threads</text>
    <text x="316" y="196" text-anchor="middle">Sep 28</text>
    <text x="316" y="212" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">anyone can install it</text>
    <text x="366" y="36" text-anchor="middle">Oct 8</text>
    <text x="366" y="52" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Codex as backup</text>
    <text x="410" y="226" text-anchor="middle">Oct 15</text>
    <text x="410" y="242" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">the board, 1.0</text>
    <text x="566" y="36" text-anchor="end">Oct 19</text>
    <text x="566" y="52" text-anchor="end" style="fill:var(--color-muted);font-size:12px">second looks, 2.0</text>
  </g>
</svg>

## It started as a reviewer I had to babysit

The first version was a skill I typed a pull request number into and watched. It read the diff, read
the linked ticket and its epic, sent a handful of parallel lenses over the change (security,
accessibility, tests, migrations, a staff-engineer read), checked every finding a second time before
keeping it, and posted one review with comments anchored to lines. Then it waited for me to run it
again.

The first two days of history are mostly the skill learning manners. *Post one review, and stop
calling everything Minor.* *Ask whether we already built this.* *Scale the review to the diff, but
never by size alone.* Each of those is a review I watched go out and winced at. It was useful from
day one and annoying from day one, which I suspect is true of most first hires.

## Then it had to keep score

On August 18 the history gets a commit called *the first scored outcomes, and the one lesson in
them*. That is the turn the rest of the story hangs on.

Every finding the reviewer posts gets a row in an outcome log. Later, something goes back and
checks what happened to it: did the author fix it, argue with it, or ignore it, and was the
reviewer right. Anything a human reviewer caught that mine did not goes into a separate miss log.
By September 9 there was a standing skill, calibrate-pr-voice, whose only job is to read those logs
and fold the lessons back into the lenses.

I would love to say this went smoothly. On October 1 there is a commit that locks the outcome log,
*because eleven scores in twelve were being lost*. Two routines had been writing to the same file and
quietly overwriting each other, so for a stretch the reviewer was being graded on a sample of almost
nothing and I had not noticed. A measuring tool that loses its measurements is a very confident way
to learn nothing.

> A reviewer does not get better by being prompted harder. It gets better by being shown, row by
> row, where it was wrong.

By October 14 there was a replay ledger that takes every recorded miss and checks it against the
current lenses, so a fix to the reviewer can be shown to catch the thing it used to miss rather than
assumed to.

## Then it had to follow up without me

A review is not one comment. It is a conversation, and in September I was still the one carrying
every reply back to the reviewer by hand. September 16 and 17 is the densest stretch of the early
history: a second skill, respond-pr-voice, that answers a reply waiting on us, checks a claimed fix
at the new commit, resolves its own thread and updates the verdict label. A push from the author
queues a small incremental review instead of a whole new one. The same days gave every unattended
routine one report format, so I could read a night's work in a table instead of a transcript.

This is where the kit stopped being a tool I used and became something that ran on a schedule. It
never approves and never merges. A PASS from it means it has nothing left to say, and the approve
button stays mine.

## Then other people wanted it

On September 24 the repository was restructured so someone who was not me could clone it, and on
September 28 the installer learned to set the kit up from a profile per person. Everything personal,
the outcome log, the watcher state, the boards a person cares about, moved under that person's own
directory.

The board followed on October 14 and 15: one page per person with Board, History, Calibration and
Stats tabs, cards that move between columns depending on who owes the next move, a Run now button,
settings that live on the board, and setup from one paste. The 1.0 release notes put it plainly:
the first release a teammate can set up, use and repair alone. As a snapshot, two people have
profiles in the kit today, and the second one joined yesterday. I am no longer the only person whose
reviews run through it.

<figure class="shot">
  <img class="shot__img" src="/media/review-kit/board-in-claude.jpg" width="2880" height="1000" loading="lazy" data-lightbox
       alt="The review board open as a Claude dashboard, showing five columns: queued, in flight, waiting on author, waiting on you, and done, holding demo pull requests.">
  <figcaption class="shot__cap">The board as it looks today, running on invented pull requests. No card here is a real one.</figcaption>
</figure>

## Then it needed a second engine

There is a practical problem with running a reviewer on a schedule, which is that my Claude usage is
finite and pull requests are not. On October 8 there is a plan to brief a Codex session, and the
same day the reviewer was installed and adapted for Codex. By October 11 the calibration loop
discovered reviews from both hosts through their attribution labels, so a review Codex wrote is
scored in the same log as one Claude wrote.

I want to be honest about what that is. Codex is the backup, not a peer I benchmark against in this
note. The comparison work exists in the plans folder and it is not finished. What is finished is that
a quiet week on one engine no longer means a quiet week on reviews.

## Then it had to decide how much a push deserves

The newest turn is the reviewer getting choosier. Second looks landed on October 19, in the 2.0
release: when a pull request it already passed gets new commits, it posts a one-line note if nothing
is new instead of a whole fresh review, and it runs the tests lens again regardless, because a PASS
that nobody re-tested after a push is a PASS on code that no longer exists. Today it learned to add
an architecture focus to a second look, and to post that note only where the change has
architecture surface.

That last rule is my favorite kind of commit in the whole history: the reviewer being told to say
less. Show your work when there is work to show, and otherwise get out of the way.

## What I have not shown

I have not shown that the kit makes the codebase better. I have shown that its findings get scored,
that its misses get replayed, and that the share of its comments people act on is something I can
look at instead of guess at. Whether that adds up to fewer bugs reaching production is a longer
study than two months, and I have not run it.

I have also not shown that it saves time in the way the first commit hoped. It moved my time. Less of
it goes to first-pass review, and a real amount goes to reading calibration and ruling on lens rules
the codebase disagreed with. On a good week that is a better use of a manager. On a bad week it is a
second job.

Back to that commit on day two, *review the ticket, not just the diff*. Six hundred commits later
the kit still does that first, and almost everything after it is the same idea, applied to the
reviewer itself: read what it was supposed to do, then check what it actually did.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
