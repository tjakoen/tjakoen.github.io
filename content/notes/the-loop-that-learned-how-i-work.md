---
title: "I Kept Telling My AI the Same Thing. So I Taught the Loop to Notice."
audience: [build]
level: deep
subtitle: "My review bot learned to be wrong because every comment it left got a score. My working sessions never did. Every correction I typed died at the end of the chat, so I started writing them down and grading what the loop does with them."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-12
readingTime: "~7 min"
tags: [ai, workflow, measurement, standards]
summary: >
  The loop I work in only got better when I told it to. The one part that improved on its own was my
  pull request reviewer, and the reason was boring: every comment it posted got scored by what
  happened next. So I pointed the same idea at my working sessions. The loop writes down what it
  notices while we work, proposes a change only once a pattern has shown up three times, and my yes
  or no on each proposal is the score. The scores are read per kind, and a kind that stops firing
  counts as a finding, because a check that never fires looks exactly like one with nothing to find.
---

## I have typed "are we clean on main" more times than my own name

Some time this autumn I noticed I had a catchphrase, and I was saying it to a machine.

"Are we clean on main? If yes, remove the worktrees and branches, local and remote." I type it at the
end of a lot of sessions. Then, a few days later, "I'm out of storage again, clean something up."
Then, in a note I am editing, I fix the same kind of sentence I fixed last week, and explain the same
idea the same way I explained it last week, to a model that will not remember either.

None of that is a complaint about the model. It did exactly what I asked, every time. The problem is
that I was the only part of the system that remembered, and I am the part that is supposed to be
doing something else.

## The one thing that already learned

I have one tool that genuinely gets better without me. It is the [pull request reviewer](the-reviewer-that-learned-to-be-wrong.md),
and it took seven hundred commits to get there, but the core of it is small. Every comment it posts
is written down, and later scored by what happened to it: fixed, argued with, or ignored. The scores
are read per topic, never as one average, so one bad habit cannot hide behind a good one. A low
score points at one thing to repair.

Nothing about that is clever. What it has that my working sessions never had is a record of its own
outputs, and a verdict on each one.

My sessions have plenty of outputs. They have a run report at the end and a memory pass that reads
those reports back. What they never had was the second half: something that turns what happened into
a proposal, and a way of knowing whether the proposal was any good.

## The shape I am building

<svg viewBox="0 0 700 200" role="img"
   aria-label="A loop in five steps. During a session the agent writes signals to a ledger without acting on them. At the close of the session a harvest groups them. A pattern seen in three sessions becomes a proposal on the board. The owner accepts, edits or rejects it, and that verdict is the score. Scores read per kind tune what the loop watches for next, and the loop returns to the start."
   style="display:block;width:100%;height:auto;margin:0 0 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:12px">
<defs>
  <marker id="sl-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
    <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
  </marker>
</defs>
<g style="fill:none;stroke:var(--color-muted);stroke-width:1.4">
  <path d="M150 50 L190 50" marker-end="url(#sl-a)"/>
  <path d="M330 50 L370 50" marker-end="url(#sl-a)"/>
  <path d="M510 50 L550 50" marker-end="url(#sl-a)"/>
  <path d="M620 74 L620 120 L520 120" marker-end="url(#sl-a)"/>
  <path d="M380 144 L80 144 L80 78" marker-end="url(#sl-a)"/>
</g>
<g style="fill:var(--color-bg);stroke:var(--color-fg);stroke-width:1.2">
  <rect x="10" y="26" width="140" height="48" rx="4"/>
  <rect x="190" y="26" width="140" height="48" rx="4"/>
  <rect x="370" y="26" width="140" height="48" rx="4"/>
  <rect x="550" y="26" width="140" height="48" rx="4"/>
  <rect x="380" y="120" width="140" height="48" rx="4"/>
</g>
<g style="fill:var(--color-fg)" text-anchor="middle">
  <text x="80" y="47">signal</text>
  <text x="80" y="63" style="fill:var(--color-muted);font-size:11px">written, not acted on</text>
  <text x="260" y="47">harvest</text>
  <text x="260" y="63" style="fill:var(--color-muted);font-size:11px">at the close</text>
  <text x="440" y="47">proposal</text>
  <text x="440" y="63" style="fill:var(--color-muted);font-size:11px">seen three times</text>
  <text x="620" y="47">my verdict</text>
  <text x="620" y="63" style="fill:var(--color-muted);font-size:11px">yes, edit, no</text>
  <text x="450" y="141">the score</text>
  <text x="450" y="157" style="fill:var(--color-muted);font-size:11px">per kind, tunes the watcher</text>
</g>
</svg>

While we work, the agent notices things and writes them down in a ledger. It does not act on them.
An agent that improves the loop halfway through fixing a bug has just made the bug fix twice as big.

At the end of the session, a harvest reads the ledger. One correction is noise. The same correction
in three separate sessions is a habit, and a habit becomes a proposal on my board, with the evidence
quoted: the three times I said it, in my own words.

Then I say yes, edit it, or no. Ignoring it for two weeks counts as a no. That answer is the score,
and it is the whole reason this is a loop rather than a suggestion box.

## What it watches for

Five kinds, and I am deliberately building them in order of how cheaply I can tell whether they work.

The first is routine: the same request, in my words, across sessions. My cleanup catchphrase is the
test case. It should come back as one routine I can run by name, and every new chore the loop catches
becomes a step inside it rather than a second routine. I tried listing eight routines on a first
pass and then asked myself which of them I had actually requested. Two.

After that come the harder ones. How I correct prose, which should end up as rules in my voice
standard. How I direct diagrams and social images. Work that deserves a note, or that makes an old
note wrong. And friction in the loop itself, like a rule I have explained to a session for the fifth
time.

Voice goes last. Every other piece of writing I publish is held to that file, so a bad edit there
does not stay in one place.

## The trap I already fell into once

In August I [measured a check](the-check-that-never-ran.md) that was supposed to run at the start
of every session. It had run once in a hundred and sixty-five. The silence looked exactly like a
quiet, healthy system, and I spent a day building a theory about discipline before finding a broken
file path.

A watcher has the same failure. If it stops noticing anything, my board goes calm, and calm is the
most convincing lie a dashboard tells. So every kind reports how often it fires, next to how often
it is right, and a kind that has been silent for two weeks shows up as a finding of its own.

## What it does not get to do

It never edits my voice standard, a hook, or a rule on its own. It proposes, with receipts, and I
decide. It stores the pattern and never the text of anyone else's post, because some of what it sees
involves other people, and none of it belongs in a public repo.

It also does not belong to one model. The ledger is plain files, the board is my own, and the loop
already runs in three harnesses, so the same signals arrive whichever one I happened to open that
morning. [The loop outlives the model](one-loop-three-harnesses.md), and this part of it has to as
well.

## What I have not shown

I have not shown any of it works. As I write this the plan is committed and the ledger is empty.
[PLACEHOLDER: the first weeks of numbers, precision and fire rate per kind, and the first proposal I
accepted without having asked for it.]

Even with numbers, an accepted proposal is a proxy. It tells me I agreed with the loop. It does not
tell me the loop made my work better, and I know from [ten times zero](ten-times-zero.md) how easy
it is to multiply a number that was never real.

But I have one reviewer that taught itself to be wrong, and the only difference between it and
everything else I run is that somebody wrote down what happened next. Starting today, my sessions
keep score too.

The next time I type "are we clean on main", I would like the loop to have beaten me to it.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
