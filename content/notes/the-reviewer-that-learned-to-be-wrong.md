---
title: "Seven Hundred Commits to Teach a Reviewer It Was Wrong"
subtitle: "In August I wrote one Claude skill to review pull requests in my voice. Three months later it runs on a schedule, borrows Codex when Claude runs dry, checks other managers' reviews, and most of its commits are the reviewer being corrected."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-09
deck: "Every time it was wrong | Talk | /talks/every-time-it-was-wrong | 18 slides · runs in the browser, no download"
readingTime: "~10 min"
tags: [ai, claude, code-review, leadership, codex]
summary: >
  The story of my PR review kit at Career Team, told from its git history: one hand-run Claude skill
  in August, a talk that introduced it to the team in September, then an outcome log that scores
  every finding, misses replayed at the commit they slipped through, routines that answer their own
  threads, a kit other managers install, Codex as a backup, risk intake and an epic check. It got
  good by being measured against its misses, not by being prompted harder, and approval never left
  my hands.
---

My PR review kit is a set of Claude skills that reviews my team's pull requests at [Career Team](https://careerteam.com) the
way I would, in the tone I would, and posts under my account. It reads the ticket before the diff,
it never approves anything, and it keeps a log of every time it was wrong. That last part is most of
the story.

On August 14 I committed one file, a skill called check-pr-voice. The next day I made eleven more
commits to it, and one of them was titled *review the ticket, not just the diff*. That should have
told me how this was going to go. As a snapshot, on November 9 the repository has 737 commits and
sits at release 2.6. The number sounds like a flex and it is closer to a confession: most of those
commits are the reviewer being told it was wrong, and me building the machinery to tell it.

This note is about how the kit works and how it changed, not about anything it found. What it found
belongs to the team and the codebase, and neither is mine to publish.

## The turns, on one line

<svg viewBox="0 0 600 250" width="100%" role="img"
     aria-label="Timeline of the PR review kit from August to November 2026: one hand-run skill on August 14, scoring its own outcomes from August 18, the team talk and routines that answer their own threads on September 17, a kit anyone can install on September 28, Codex as a backup on October 8, the board and 1.0 release on October 15, second looks across teammates' kits on October 19, and risk intake with the epic check on November 3."
     style="display:block;width:100%;max-width:580px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13px">
  <line x1="30" y1="125" x2="570" y2="125" style="stroke:var(--color-line);stroke-width:2"/>
  <g style="fill:var(--color-fg)">
    <circle cx="40" cy="125" r="6"/>
    <circle cx="66" cy="125" r="6"/>
    <circle cx="207" cy="125" r="6"/>
    <circle cx="279" cy="125" r="6"/>
    <circle cx="327" cy="125" r="6"/>
    <circle cx="368" cy="125" r="6"/>
    <circle cx="392" cy="125" r="6"/>
    <circle cx="560" cy="125" r="6"/>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1">
    <line x1="40" y1="119" x2="40" y2="62"/>
    <line x1="66" y1="131" x2="66" y2="180"/>
    <line x1="207" y1="119" x2="207" y2="62"/>
    <line x1="279" y1="131" x2="279" y2="180"/>
    <line x1="327" y1="119" x2="327" y2="62"/>
    <line x1="368" y1="131" x2="368" y2="210"/>
    <line x1="392" y1="119" x2="392" y2="90"/>
    <line x1="560" y1="131" x2="560" y2="180"/>
  </g>
  <g style="fill:var(--color-fg)">
    <text x="34" y="36">Aug 14</text>
    <text x="34" y="52" style="fill:var(--color-muted);font-size:12px">one skill, by hand</text>
    <text x="60" y="196">Aug 18</text>
    <text x="60" y="212" style="fill:var(--color-muted);font-size:12px">scores its outcomes</text>
    <text x="207" y="36" text-anchor="middle">Sep 17</text>
    <text x="207" y="52" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">the talk, routines</text>
    <text x="279" y="196" text-anchor="middle">Sep 28</text>
    <text x="279" y="212" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">anyone can install</text>
    <text x="327" y="36" text-anchor="middle">Oct 8</text>
    <text x="327" y="52" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Codex</text>
    <text x="368" y="226" text-anchor="middle">Oct 15</text>
    <text x="368" y="242" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">the board, 1.0</text>
    <text x="430" y="72">Oct 19</text>
    <text x="430" y="88" style="fill:var(--color-muted);font-size:12px">second looks</text>
    <text x="566" y="196" text-anchor="end">Nov 3</text>
    <text x="566" y="212" text-anchor="end" style="fill:var(--color-muted);font-size:12px">risk intake, epic check</text>
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

Every finding the reviewer posts gets a row in an outcome log, scored later by what happened to it:
fixed, answered, closed without a change, or ignored. Anything a human reviewer caught that mine did
not goes into a separate miss log. By September 9 there was a standing skill, calibrate-pr-voice,
whose only job is to read those logs and fold the lessons back into the lenses.

I would love to say this went smoothly. On October 1 there is a commit that locks the outcome log,
*because eleven scores in twelve were being lost*. Two routines had been writing to the same file and
quietly overwriting each other, so for a stretch the reviewer was being graded on a sample of almost
nothing and I had not noticed. A measuring tool that loses its measurements is a very confident way
to learn nothing.

> A reviewer does not get better by being prompted harder. It gets better by being shown, row by
> row, where it was wrong.

## The talk was the old version

On September 17 I introduced the kit to the team in a talk, [Every Time It Was
Wrong](/talks/every-time-it-was-wrong). The deck is still up, and it is an honest snapshot of what the
kit was that week: a reviewer I ran myself, a growing outcome log, and a first pass at calibration.
Everything below that date in this note is what changed after people started seeing it.

The same days in the history are the densest of the early stretch. A second skill, respond-pr-voice,
started answering replies waiting on us, checking a claimed fix at the new commit, resolving its own
threads and updating the verdict label. A push from the author started queueing a re-review, an
incremental pass over the new commits, instead of a whole new review. Every unattended routine got
one report format, so I could read a night's work in a table instead of a transcript. This is where
the kit stopped being a tool I used and became something that ran on a schedule.

## Then other people wanted it

On September 24 the repository was restructured so someone who was not me could clone it, and on
September 28 the installer learned to set the kit up from a profile per person. Everything personal,
the outcome log, the watcher state, the boards a person cares about, moved under that person's own
directory.

The board followed on October 14 and 15: one page per person with Board, History, Calibration and
Stats tabs, cards that move between columns depending on who owes the next move, a Run now button,
settings that live on the board, and setup from one paste. The 1.0 release notes put it plainly:
the first release a teammate can set up, use and repair alone. I am no longer the only manager whose
reviews run through it.

<figure class="shot">
  <img class="shot__img" src="/media/review-kit/board-in-claude.jpg" width="2880" height="1000" loading="lazy" data-lightbox
       alt="The review board open as a Claude dashboard, showing five columns: queued, in flight, waiting on author, waiting on you, and done, holding demo pull requests.">
  <figcaption class="shot__cap">The board as it looks today, running on invented pull requests. No card here is a real one.</figcaption>
</figure>

Once there were two kits, they started reviewing the same pull requests. On October 19 the kit
learned the second look: when a teammate's kit has already reviewed the head commit, mine runs only
what theirs left unchecked, posts an addendum, and posts nothing at all when it finds nothing new.
Since November 4 every second look carries its own label, so a silent one still shows on the pull
request.

## Then it needed a second engine

There is a practical problem with running a reviewer on a schedule, which is that my Claude usage is
finite and pull requests are not. On October 8 the reviewer was installed and adapted for Codex, and
by October 11 the calibration loop found reviews from both hosts through their attribution labels,
so a review Codex wrote is scored in the same log as one Claude wrote. On October 20 and 21 that
became a policy rather than a manual switch: Codex takes over the reviews once my weekly Claude use
passes a threshold I choose, and the Reviews slots step down from four to one as use passes 70, 80
and 90 percent.

Codex is the backup, not a peer I benchmark against in this note. The comparison work exists in the
plans folder and it is not finished. What is finished is that a quiet week on one engine no longer
means a quiet week on reviews.

## Then it had to prove its repairs held

A replay ledger arrived on October 14, and by late October it did the part I trust most: when a lens
gets repaired after a miss, the repair is replayed on the pull request the miss came from, at the
commit the original review ran on. On November 3 a batch of thirty-three replays came back and nine
lens rules were fixed because the replays found them wanting. A repair that has not been replayed is
a hope. A replayed one is a receipt.

## Then it had to decide what deserved a look

The newest turns are the reviewer getting choosier about its inputs. On October 26 it started
reading the epic's decided rules and the decisions made in Jira comments, and on November 3 it folded
in the epic check my tech lead built as his own plugin, so a deviation the team already agreed to
stops being flagged as a defect. The same day risk intake arrived: a pull request from outside my
boards gets queued only when it touches a high-risk area and reaches code my team owns, capped at a
ranked three a day so the queue does not drown.

Release 2.6, on November 4, made every lens prove it read its rules before its findings count. A
lens that skips them twice gets named in the evidence block, and the review cannot post PASS. That
is the reviewer being held to the same rule I hold my students to. Show your work, or it does not
count.

## How it works now

A pull request lands on my board from my team's code review column, from risk intake, or because I
pasted it in. Scheduled routines take it from there, and only between 17:00 and 06:59, so nothing
posts during the working day.

A Reviews routine reads the ticket and its epic, checks the change against the epic's decided rules
and the decisions in the ticket's comments, runs the epic check where the epic has one, notes any
other open pull request editing the same lines, sends six specialist lenses over the diff, tries to
refute every finding, and posts line-anchored comments with a PASS, REQUEST CHANGES or BLOCKING
verdict. The thread poll answers replies it can settle from the team's recorded decisions, verifies
a claimed fix at the new commit, and resolves its own threads. A push gets a re-review. A head a
teammate's kit already reviewed gets a second look. Up to four reviews run at once, fewer as my
usage climbs, and Codex picks up the rest past the weekly threshold.

Then the learning half runs. Every comment is scored by what happened next, a theme that keeps being
closed without a fix gets its lens tightened, every miss is recorded with the lens that should have
caught it, and every repair is replayed where the miss happened. The Calibration tab shows each
change to the reviewer and why it was made.

It never approves, never merges and never pushes code. Guards make a push impossible rather than
merely unintended. A PASS from the kit means it has nothing left to say, and the approve button stays
mine.

## What I have not shown

I have not shown that the kit makes the codebase better. I have shown that its findings get scored,
that its misses get replayed, and that the share of its comments people act on is something I can
look at instead of guess at. Whether that adds up to fewer bugs reaching production is a longer
study than three months, and I have not run it.

I have also not shown that it saves time in the way the first commit hoped. It moved my time. Less of
it goes to first-pass review, and a real amount goes to reading calibration and ruling on lens rules
the codebase disagreed with. On a good week that is a better use of a manager. On a bad week it is a
second job.

Back to that commit on day two, *review the ticket, not just the diff*. Seven hundred commits later
the kit still does that first, and almost everything after it is the same idea, applied to the
reviewer itself: read what it was supposed to do, then check what it actually did.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
