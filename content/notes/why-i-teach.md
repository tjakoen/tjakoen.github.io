---
title: "I Nearly Quit Teaching. So I Automated the Part That Was Killing Me."
subtitle: "I teach 100 to 150 students a semester, part-time, for a fraction of what my day job pays, and last term it almost broke me. Here's why I do it anyway, how I actually run a classroom, and the GitHub-native platform I built so I could stop drowning and start teaching again."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-07-03
readingTime: "~8 min"
tags: [teaching, education, automation, github-actions, portfolio, ai]
summary: >
  Why I teach when the math says I shouldn't, how I run a classroom (treat adults like adults, lean
  into self-study, skip the fluff, go straight at the hard parts), and how, after a semester that
  nearly made me quit, I automated grading and coursework onto a GitHub-native platform so the
  mechanical grind stopped stealing the time I actually wanted to spend on students.
---

## The semester that almost ended it

Last term, I almost quit teaching. Not dramatically: no storming out, no speech. Just the quiet
math you do at 1am with a stack of ungraded submissions in front of you and a full workday starting
in seven hours.

Because here's my situation, and I'll be honest about it: I teach part-time. My day job pays well;
teaching doesn't. By the cold hourly math I should be giving this a sliver of my attention. And last semester the grading crept up on me, I procrastinated the way I always warn my
students not to, and I ended up doing frantic last-minute marking while a demanding full-time job
carried on not caring about my little scheduling crisis. It was too much. Every rational spreadsheet
said stop.

I didn't stop. I couldn't quite make myself walk away, so instead I went after the actual problem.

<svg viewBox="-1 0 263 502" width="100%" role="img"
     aria-label="The old loop: teach all week, grading piles up, procrastinate exactly as I warn students not to, 1am marking before a full workday, and quit back to the start. What I did instead: automate the grind, grading runs as a GitHub Action, and my hours go back to the students."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-whyite0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="68" y="16" width="125" height="36" rx="6"/>
    <rect x="66" y="78" width="130" height="36" rx="6"/>
    <rect x="20" y="140" width="222" height="52" rx="6"/>
    <rect x="58" y="202" width="146" height="52" rx="6"/>
    <polygon points="131,264 185,293 131,322 77,293"/>
    <rect x="58" y="326" width="146" height="36" rx="6"/>
    <rect x="19" y="388" width="224" height="36" rx="6"/>
  </g>
  <rect x="16" y="450" width="230" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="131" y1="52" x2="131" y2="78" marker-end="url(#fl-whyite0)"/>
    <line x1="131" y1="114" x2="131" y2="140" marker-end="url(#fl-whyite0)"/>
    <line x1="131" y1="192" x2="131" y2="202" marker-end="url(#fl-whyite0)"/>
    <line x1="131" y1="254" x2="131" y2="264" marker-end="url(#fl-whyite0)"/>
    <path d="M77,293 C38,293 38,34 68,34" marker-end="url(#fl-whyite0)"/>
    <line x1="131" y1="322" x2="131" y2="326" marker-end="url(#fl-whyite0)"/>
    <line x1="131" y1="362" x2="131" y2="388" marker-end="url(#fl-whyite0)"/>
    <line x1="131" y1="424" x2="131" y2="450" marker-end="url(#fl-whyite0)"/>
  </g>
  <g text-anchor="middle">
    <text x="131" y="38.3" style="fill:var(--color-fg)">Teach all week</text>
    <text x="131" y="100.3" style="fill:var(--color-fg)">Grading piles up</text>
    <text x="131" y="162.3" style="fill:var(--color-fg)">Procrastinate</text>
    <text x="131" y="178.8" style="fill:var(--color-muted);font-size:12px">exactly what I warn students not to</text>
    <text x="131" y="224.3" style="fill:var(--color-fg)">1am marking</text>
    <text x="131" y="240.8" style="fill:var(--color-muted);font-size:12px">before a full workday</text>
    <text x="131" y="297.3" style="fill:var(--color-fg)">Quit?</text>
    <text x="131" y="348.3" style="fill:var(--color-fg)">Automate the grind</text>
    <text x="131" y="410.3" style="fill:var(--color-fg)">Grading runs as a GitHub Action</text>
    <text x="131" y="472.3" style="fill:var(--color-bg)">My hours go back to the students</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="131" y="319">what I did instead</text>
    <text x="29" y="163" transform="rotate(-90 29 163)">the old loop</text>
  </g>
</svg>

*The loop I was stuck in, and the exit I built instead of taking the other one.*

## First, why I teach at all

Let me get the money question out of the way, since I brought it up. I don't teach for the money.
The numbers make that almost funny. I teach because I've always loved mentoring, watching something
click for someone is a genuinely great feeling, and because standing in front of a room is the best
practice there is for confidence and public speaking, which pays off everywhere else in my career.
And yes, I'll own the less noble part too: it looks good professionally, on a resume, in a portfolio.
All three of those are real. None of them are money. That's the honest answer.

Which is exactly why this has to land. If I'm going to spend the scarce hours I have on this, the
teaching has to be *good*, not a box I tick.

## How I actually run a classroom

My students are adults, so I treat them like adults. That single decision drives most of how I teach.

- **I lean hard into self-study, because that's the job.** In the dev world, teaching yourself is not
  a fallback; it's the core skill. So I don't pretend otherwise. I hand my students every resource
  they could need, and then the learning is on them. That's not me being lazy; it's me refusing to
  lie about what the profession actually requires.
- **I spend my time on the hard parts and the code.** I'm not going to burn a session on a slide
  that asks "what is an application?" Adults can read a definition. My time (and theirs) is worth
  more than that. I go straight at the stuff that's genuinely difficult, the stuff you can't just
  look up and absorb in a minute.
- **I don't care how you get there, as long as you actually get there.** Different people learn
  differently and I'm not precious about the path. I *am* precious about the destination: you have to
  actually understand it. **If you can't explain it, you didn't build it.** That's the one line I
  come back to more than any other. (How it plays out with AI specifically is its own post:
  [How I Teach With AI, and Where I Lock It Out](how-i-use-ai-in-teaching.md).)

That's the philosophy. The problem is that a philosophy like this still buries you in grading, and
grading, done properly, is where the hours go.

## So I automated the grind, not the teaching

Here's the move I'm proud of. I could have quit, or I could have cut corners on grading and let the
quality slip. Instead I built a platform that runs an entire course on GitHub, and grades most of it
for me.

It's called the [GitHub-native course platform](https://github.com/tjakoen/github-native-course-platform),
and the whole idea is: GitHub is the LMS. Coursework is a repo. Submitting is a push. Grading is a
GitHub Action. Feedback is a Markdown file that lands in the student's own repo. The only outside
system that ever shows up is Canvas, right at the end, to receive the final grades. No hosted app, no
servers to babysit. I've run it in production across several live courses (front-end JavaScript and
React, Dart and Flutter, HTML/CSS/JS) covering hundreds of student repositories a term.

A few pieces I care about:

- **Automation only ever touches the instructor's zone.** Each student repo is both a managed course
  *and* their personal workspace, and the parts that are theirs (their notes, their journal, their
  project) are never written to. Publishing new material can't clobber a student's own work. That
  boundary was non-negotiable.
- **Grading happens off the student's repo, against canonical tests, at a snapshot commit.** Nothing
  official is read back from a place a student could tamper with. It's incremental and idempotent, so
  I can run it as often as I like and it only re-grades what changed.
- **The AI drafts feedback, but I approve every word of it.** More on that in the AI post, but the
  short version: the machine does the first pass, I make the call. Nothing reaches a student
  automatically, either. Delivering grades and feedback is its own deliberate step, separate from
  grading, and it dry-runs by default, so I get to read the plan before a single word lands in
  anyone's repo. It even flags submissions that look vibe-coded so I know where to look harder.
- **I'm honest about integrity instead of pretending.** You can't proctor take-home work. So the
  design deters the honest majority (per-student quiz variants, deadline snapshots from commit
  timestamps, viva spot-checks) and anything genuinely high-stakes happens in person. I say that out
  loud rather than selling a lie about lockdown.

## What teaching feels like now

The automation didn't make me care less. It did the opposite: it gave me back the time to care
about the right thing. Grading no longer eats my nights, so during class I mostly let students get on
with their work, and I spend my attention where it's actually useful: stepping in when something
needs real context, guiding people through the parts that are genuinely hard, having the conversation
that makes it click. The mechanical grind went to the machine. The human part came back to me.

This is my third semester now, and each term it's somewhere between a hundred and a hundred and fifty students.
A year ago that number would have buried me. Now it's fine. Not because I care less than the version
of me staring at that 1am pile, because I finally built the thing that let me care *sustainably.*

I almost quit. Instead I automated the part that was killing me, and kept the part I love. Turns out
that's a decision I get to make in code.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
