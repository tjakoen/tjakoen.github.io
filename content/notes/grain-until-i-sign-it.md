---
title: "Every Grade the AI Proposes Shows Up Grainy Until I Sign It"
subtitle: "I let an AI draft grades and feedback for hundreds of students a term. The part that lets me sleep is one review screen: it reads my gradebooks live in the browser, shows every proposed grade in grain type until I approve it, and can't write a thing back until I turn my decisions into a prompt I've actually read."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-07-30
readingTime: "~7 min"
tags: [teaching, ai, grain, provenance, github, assessment]
summary: >
  The review desk I built for AI-assisted grading. It reads my teacher repos' gradebooks straight
  from the GitHub API in my own browser, holds every AI-proposed grade in grain type until I approve
  or edit it (which flips it to clean), and never writes a grade itself: it emits a prompt holding
  my decisions that I read before an AI applies it in the repo. Data-free by design, one write door,
  human signs everything.
---

## I let a machine grade real students

I let an AI draft grades for hundreds of students a term. Written down like that, it should scare me,
and for a while it did. Not because the drafts are bad. Because somewhere in that pile is a real
person whose semester I can quietly get wrong at scale, faster than I could ever get it wrong by hand.

The [platform I run my courses on](how-i-turned-github-into-a-classroom.md) grades take-home and
in-lab work automatically, and an AI reads each submission and drafts the feedback. I have written
[at length](how-i-use-ai-in-teaching.md) about the rule that governs all of it: the machine drafts,
the teacher signs. That is easy to say in a blog post. The honest question is what "signs" actually
looks like when there are three hundred of them and one of me.

For a long time the answer was ugly. The grades and feedback lived in gradebook files across a dozen
teacher repos, and reviewing them meant opening tabs, reading raw Markdown, and editing by hand in a
text field that had no idea it was holding somebody's grade. The review was real, but the *tools* for
it were held together with tape. So I built the screen the whole promise depends on.

## The desk where grades wait

It is called [grader-ui](https://github.com/tjakoen/grader-ui), and it does exactly one job: it is
the room where AI grades wait for me. I open it, it reads my gradebooks, and it shows me one dashboard
of everything the machine has proposed but nothing has committed to. I approve, I override the score,
I flag one for a closer look, I rewrite the feedback in my own words. Then, and only then, does
anything move.

The first thing I care about is where the data *isn't*. The page I deploy is an empty shell. No
student ever lives in it, and nothing sits on a server, because there is no server. When I open it,
it fetches my gradebooks straight from the GitHub API into my own browser, using a read-only token I
paste into settings that never leaves this machine. The page is allowed to talk to exactly one host
on the whole internet, and a check at build time fails the deploy if a single line of gradebook data
tries to sneak into the shipped files. The safest place to put student data is nowhere, so that is
where it goes.

## Grain until I sign it

Here is the part I like most, and it is the reason this note carries the word *grain* in its title.

The whole design system I build with, [GRAIN](/grain), exists to make one idea real: you should be
able to *look* at software and see whose hand did what. Text a machine wrote renders with a grain to
it. Text a human has settled renders clean. It is provenance you can see instead of provenance you
have to trust.

On the review desk, that stops being a metaphor. Every grade and every line of feedback the AI
proposes shows up in grain type. It looks unfinished on purpose, because it is: it is a draft nobody
has stood behind yet. The moment I approve it or edit it, the grain lifts and the text goes clean,
because now a human wrote it. The screen wears its own honesty. I cannot mistake a thing the machine
guessed for a thing I decided, because the two do not look the same.

<svg viewBox="0 0 360 492" width="100%" role="img"
     aria-label="How a grade moves: I read my gradebooks live in my browser; the review desk shows AI grades in grain type; I approve or edit, which flips grain to clean; the desk then writes an intent, not a grade, holding every decision in one file; a Claude Code session runs the intent in the repo while I watch and keep the last say; only then does it reach the student's repo and Canvas."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-grade0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="55" y="16" width="250" height="36" rx="6"/>
    <rect x="65" y="88" width="230" height="52" rx="6"/>
    <rect x="55" y="264" width="250" height="52" rx="6"/>
    <rect x="45" y="352" width="270" height="52" rx="6"/>
    <rect x="40" y="440" width="280" height="36" rx="6"/>
  </g>
  <rect x="75" y="176" width="210" height="52" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="180" y1="52" x2="180" y2="88" marker-end="url(#fl-grade0)"/>
    <line x1="180" y1="140" x2="180" y2="176" marker-end="url(#fl-grade0)"/>
    <line x1="180" y1="228" x2="180" y2="264" marker-end="url(#fl-grade0)"/>
    <line x1="180" y1="316" x2="180" y2="352" marker-end="url(#fl-grade0)"/>
    <line x1="180" y1="404" x2="180" y2="440" marker-end="url(#fl-grade0)"/>
  </g>
  <g text-anchor="middle">
    <text x="180" y="38.3" style="fill:var(--color-fg)">Gradebooks, read live in my browser</text>
    <text x="180" y="110.3" style="fill:var(--color-fg)">The review desk</text>
    <text x="180" y="126.8" style="fill:var(--color-muted);font-size:12px">AI grades show up in grain type</text>
    <text x="180" y="198.3" style="fill:var(--color-bg)">I approve or edit</text>
    <text x="180" y="214.8" style="fill:var(--color-bg);font-size:12px">grain flips to clean</text>
    <text x="180" y="286.3" style="fill:var(--color-fg)">It writes an intent, not a grade</text>
    <text x="180" y="302.8" style="fill:var(--color-muted);font-size:12px">every decision, in one file</text>
    <text x="180" y="374.3" style="fill:var(--color-fg)">Claude Code runs it in the repo</text>
    <text x="180" y="390.8" style="fill:var(--color-muted);font-size:12px">I watch, and keep the last say</text>
    <text x="180" y="462.3" style="fill:var(--color-fg)">Only then: the student's repo and Canvas</text>
  </g>
</svg>

*A grade is grainy until I sign it, and the desk cannot write one on its own.*

## One door, and I am standing in it

The other rule is that the desk does not grade. It never reaches into a repo and writes a score. That
sounds like a limitation until you see what it buys.

When I finish reviewing, the screen does not push my decisions anywhere. It writes them down. It
gathers every call I made into a single prompt, a plain file holding "give this student this score,
send this feedback, leave that one alone because I flagged it," and it files that prompt in the
teacher repo. Later, in a Claude Code session I open in that repo, I say "run the pending intents,"
and the AI reads the file and does the actual typing: the gradebook, the feedback files, the push to
Canvas. I watch it happen. I keep the last say.

I have a name for this shape because I use it everywhere: the single write door. Instead of a dozen
places where something can quietly write a grade, there is one way in, and it runs a prompt I have
already read. The review is not a checkbox at the end. It is the only door, and I am standing in it.
If I never read the prompt, nothing happens. That is the design working, not the design failing.

## What I am honest about

None of this makes the grading unattended, and I would not want it to be. A few seams I say out loud:

- **The token is real access.** The page reads and writes my teacher repos with a token I generate. I
  scope it to only those repos, give it a short life, and keep it in my browser, but it is a key, and
  I treat it like one.
- **The vibe-coded flag is a nudge, not a verdict.** The instructor-only half of a review can carry a
  soft "this looks vibe-coded" flag. It exists to tell me where to look harder, never to accuse a
  student, and it never reaches one.
- **The desk cannot make me care.** It removes the tab-juggling and the raw-Markdown editing. It does
  not remove the reading. If I rubber-stamp a screen full of grain, that is on me, not on the tool. It
  makes the right thing easy. It cannot make it happen.

That last one is the whole point, and it is the same one I teach. A multiplier is only worth anything
if the thing it multiplies is real judgment. [Ten times zero is still zero.](ten-times-zero.md) The
desk multiplies my attention. It does not replace it, and it is built so I can never quietly pretend
it did.

So every grade shows up grainy. I read it, I decide, I sign, and the grain lifts. Then, and only then,
does a student ever see it.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
