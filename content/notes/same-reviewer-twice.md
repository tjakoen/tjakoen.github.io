---
title: "Anthropic Built My Code Reviewer. Separately."
audience: [build, lead]
level: intermediate
subtitle: "I sat in Anthropic's webinar on how they review code and kept recognizing my own review kit on the slides. Eleven parts matched, five were ahead of me, and the one I care about most is the one neither of us has finished: deciding how much risk needs a human."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-19
readingTime: "~10 min"
tags: [ai, code-review, workflow, claude]
summary: >
  I built my own AI pull request reviewer over three months, then watched Anthropic describe theirs
  and found the two had converged on nearly the same design: parallel lenses, skeptics that try to
  refute each finding, precision over volume, outcome scoring and a reviewer that never approves.
  Where mine was behind was a cap on review rounds, voting verifiers and evals on known-clean pull
  requests. The part that matters most to me is scaling human approval by risk, which I am building
  now and have not proven.
social: |
  I sat in Anthropic's webinar on how the Claude Code team does code review and kept recognizing my
  own reviewer.

  Parallel lenses. Skeptics told to refute every finding. Nits dropped because they were usually
  wrong. Every comment scored afterwards. A reviewer that never approves.

  Eleven parts of my review kit matched theirs, built without having seen it. Five were behind,
  and I have since fixed one of them.

  The part I care about most is the one neither of us has finished: a small, low-risk pull request
  should not need me, and a risky one should find me fast. I'm building that now. Ask me in a month
  whether it worked.
socialImage: "/media/notes/same-reviewer-twice-social.png"
socialImageAlt: "My review kit, held up against Anthropic's. Sixteen circles in two rows: eleven filled for the parts we both built, five hollow for where theirs was ahead. Underneath, the line: the part I care about most is the one neither of us has finished, how much risk needs me."
---

## I approved a pull request I had not read

Not a big one. A few lines, a renamed prop, a test that still passed, and my review kit had already
been through it and found nothing worth saying. I clicked approve on the strength of that silence,
and about four seconds later I realized I could not have told you what the change did.

It was fine. That is not the point. The point is that I had become a rubber stamp with a GitHub
login, and the reviewer I built to save my attention had quietly trained me to stop paying it.

So in the week before Anthropic ran its webinar, *How the Claude Code team does code review*, I had
one question on a sticky note. Which pull requests actually need my eyes, and can the rest stop
waiting for me?

I went in expecting to take notes. I came out with a scorecard.

## Then Morgan Lunt put my architecture on a slide

The webinar was given by Morgan Lunt, a Member of Technical Staff on Claude Code, and it walked
through the reviewer Anthropic runs on its own pull requests. The same design is written up in their
public post, [Solving code review at Anthropic](https://claude.dev/blog/solving-code-review-at-anthropic/),
and the product side lives in the [Claude Code code review docs](https://code.claude.com/docs/en/code-review).
Everything I say about their reviewer below comes from those two pages, so you can check me.

About ten minutes in I stopped taking notes and started ticking boxes. Several finder agents running
side by side, each looking for a different kind of problem. Mine runs six lenses in parallel:
security, accessibility, a staff-engineer read, tests, migrations and React performance. Verifiers
whose job is to knock findings down. Mine sends skeptics after every finding, in batches of six on
Sonnet, with a dedicated skeptic for anything that would block a merge. Style and cleanup filtered
out. I had dropped nits from verification entirely, because when I measured them they were the
category most often wrong.

That is a strange feeling, by the way. Half pride, half the suspicion that I had just spent three
months reinventing something a team with far more people had already shipped. Both halves are true.

## Eleven of sixteen

Here is the whole comparison, laid out the way I scored it on the night. The left column is my kit
as it stood the day of the webinar, before the change I made afterwards. The right column is
Anthropic's reviewer as their post describes it.

<svg viewBox="0 0 620 540" width="100%" role="img"
     aria-label="A side-by-side of sixteen review design choices. Eleven matched between my review kit and Anthropic's reviewer: parallel lenses against several finder agents, skeptics against voting verifiers, nits dropped on precision against style filtered out, capped comment volume against capped nits, an increment tier against reviewing only the new diff, a flagged-history file against never posting a finding twice, collapsing three alike findings against flagging the bug class, an outcomes log against fixed, wrong, intentional and not-worth-it scoring, disposition evals and fixture replays against daily incident and revert evals, a calibrate skill against fixing at the source, and neither one approving. Five were places mine was behind: no round cap against stopping at three rounds, a single skeptic against several verifiers voting, no evals on known-clean pull requests, no Pre-existing severity label, and reverts not mined as eval cases."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;
            --paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--bar:#cbc1b3;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="539" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="30" style="fill:var(--muted);font-size:15px">My review kit against Anthropic's reviewer</text>
  <text x="56" y="64" style="fill:var(--muted);font-size:12.5px">Mine, the day of the webinar</text>
  <text x="330" y="64" style="fill:var(--muted);font-size:12.5px">Theirs, from the public post</text>
  <g style="fill:var(--ink);stroke:var(--ink);stroke-width:1.5">
    <circle cx="36" cy="87.5" r="6"/><circle cx="36" cy="113.5" r="6"/><circle cx="36" cy="139.5" r="6"/>
    <circle cx="36" cy="165.5" r="6"/><circle cx="36" cy="191.5" r="6"/><circle cx="36" cy="217.5" r="6"/>
    <circle cx="36" cy="243.5" r="6"/><circle cx="36" cy="269.5" r="6"/><circle cx="36" cy="295.5" r="6"/>
    <circle cx="36" cy="321.5" r="6"/><circle cx="36" cy="347.5" r="6"/>
  </g>
  <g style="fill:none;stroke:var(--ink);stroke-width:1.5">
    <circle cx="36" cy="385.5" r="6"/><circle cx="36" cy="411.5" r="6"/><circle cx="36" cy="437.5" r="6"/>
    <circle cx="36" cy="463.5" r="6"/><circle cx="36" cy="489.5" r="6"/>
  </g>
  <line x1="28" y1="366" x2="592" y2="366" style="stroke:var(--edge)"/>
  <g style="fill:var(--ink);font-size:14px">
    <text x="56" y="92">Six lenses in parallel</text>
    <text x="56" y="118">Skeptics told to refute</text>
    <text x="56" y="144">Nits dropped on precision</text>
    <text x="56" y="170">6 comments, about 3,000 characters</text>
    <text x="56" y="196">An increment tier</text>
    <text x="56" y="222">A flagged-history file</text>
    <text x="56" y="248">Three alike become one comment</text>
    <text x="56" y="274">An outcomes log</text>
    <text x="56" y="300">Disposition evals, fixture replays</text>
    <text x="56" y="326">A calibrate skill</text>
    <text x="56" y="352">Never approves</text>
    <text x="56" y="390">No round cap (added since)</text>
    <text x="56" y="416">One skeptic per blocking finding</text>
    <text x="56" y="442">No known-clean evals</text>
    <text x="56" y="468">No Pre-existing label</text>
    <text x="56" y="494">Reverts not mined</text>
  </g>
  <g style="fill:var(--muted);font-size:12.5px">
    <text x="330" y="92">Several finder agents</text>
    <text x="330" y="118">Verifiers that vote</text>
    <text x="330" y="144">Style and cleanup filtered out</text>
    <text x="330" y="170">Severity labels, capped nits</text>
    <text x="330" y="196">Review only the new diff</text>
    <text x="330" y="222">Never post a finding twice</text>
    <text x="330" y="248">Flag the bug class</text>
    <text x="330" y="274">Fixed, wrong, intentional, not worth it</text>
    <text x="330" y="300">Daily incident and revert evals</text>
    <text x="330" y="326">Fix at the source</text>
    <text x="330" y="352">Never approves; findings hold merge</text>
    <text x="330" y="390">Stops at three rounds</text>
    <text x="330" y="416">Several verifiers vote</text>
    <text x="330" y="442">Evals on PRs known to be clean</text>
    <text x="330" y="468">A Pre-existing severity</text>
    <text x="330" y="494">Reverts become eval cases</text>
  </g>
  <text x="28" y="526" style="fill:var(--accent);font-size:13px">Eleven matched before I had seen theirs. Five were ahead of me.</text>
</svg>

*Filled is a choice we both made. Hollow is a place their reviewer was ahead of mine.*

A few of the matches are close enough to be funny. My kit keeps a file of everything it has already
flagged on a pull request so it never posts the same finding twice, and their post says the same
thing in nearly the same words. Mine collapses three or more findings that share one fix into a
single comment, and theirs flags the bug class rather than every instance of it. Mine caps a review
at six inline comments, about three thousand characters and three nits, and says out loud how many
it cut. Theirs labels severity and caps the nits.

None of that is because I am clever. It is because both of us ran into the same wall, which is that
a reviewer who talks too much stops being read. Once you take that wall seriously, the design mostly
writes itself. I wrote about how mine got there, one wrong turn at a time, in
[Seven Hundred Commits to Teach a Reviewer It Was Wrong](the-reviewer-that-learned-to-be-wrong.md).

## Where theirs was ahead

Five places, and I want to be specific about them, because a scorecard where I only list my wins is
a press release.

**They cap the rounds.** Their reviewer stops after three rounds on a pull request. Mine kept going
for as long as the author kept pushing, which meant a long-lived branch could collect review after
review, each one finding slightly different things to say. Their post reports what the cap did, and
it is the cleanest number in the whole piece.

<svg viewBox="0 0 620 262" width="100%" role="img"
     aria-label="Anthropic's own figures for what capping review rounds did. Mean reviews before a pull request passed fell from 2.08 to 1.32. The share of pull requests needing five or more rounds fell from 8.9 percent to 1.5 percent."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;
            --paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--bar:#cbc1b3;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="261" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="30" style="fill:var(--muted);font-size:15px">What a three-round cap did, on Anthropic's numbers</text>
  <text x="28" y="66" style="fill:var(--ink);font-size:14px">Mean reviews before a pull request passed</text>
  <rect x="28" y="76" width="333" height="22" style="fill:var(--bar)"/>
  <text x="369" y="92" style="fill:var(--muted);font-size:12.5px">2.08 before</text>
  <rect x="28" y="104" width="211" height="22" style="fill:var(--ink)"/>
  <text x="247" y="120" style="fill:var(--muted);font-size:12.5px">1.32 after</text>
  <text x="28" y="160" style="fill:var(--ink);font-size:14px">Pull requests that needed five or more rounds</text>
  <rect x="28" y="170" width="356" height="22" style="fill:var(--bar)"/>
  <text x="392" y="186" style="fill:var(--muted);font-size:12.5px">8.9% before</text>
  <rect x="28" y="198" width="60" height="22" style="fill:var(--ink)"/>
  <text x="96" y="214" style="fill:var(--muted);font-size:12.5px">1.5% after</text>
  <text x="28" y="248" style="fill:var(--accent);font-size:13px">Stopping at three rounds made review converge, and almost nothing dragged on.</text>
</svg>

*Their numbers, from their post. Mine have only just started counting.*

I have since added a round cap and a convergence metric to my kit, so it now tracks how many reviews
a pull request takes to pass. I do not have enough pull requests through it yet to draw my own
version of that chart, and I am not going to borrow their bars and pretend they are mine.

**Their verifiers vote.** Mine sends one skeptic after each blocking finding. Theirs puts several
verifiers on a finding and lets them vote, which is the obvious next step for a design that already
trusts disagreement. I just had not taken it.

**They test on clean code.** My evals are balanced between findings that should be raised and
findings that should be dropped, and I replay old fixtures to make sure a fix stays fixed. What I do
not have is a set of pull requests that are known to be clean, where the right answer is silence.
That is the eval that would catch a reviewer slowly getting chattier, and I did not have it.

**They label the old stuff.** Their reviewer has an explicit severity for a problem that was already
in the code before the pull request touched it. Mine handles that case in prose, which works, but a
label is easier to filter and easier to count.

**They mine their reverts.** Every revert and every incident becomes an eval case, daily. Mine learns
from what the author did with each comment. It does not yet learn from the changes that got merged,
shipped and then pulled back, which is the most honest signal a reviewer could ask for.

## The part I came in for

None of those five was on my sticky note. The sticky note said risk.

Here is what I want, stated as plainly as I can. A pull request that renames a prop and touches
nothing else should not sit in my queue waiting for me to click a button I am not really pressing. A
pull request that changes how a migration runs, or what a permission check lets through, should find
me fast and tell me why. Today both arrive the same way, and both wait.

The webinar described the same idea from the other side. Anthropic scales human approval by risk,
and it watches the result with guardrails, not trust: how many human approvals each pull request
gets, and the revert and incident rates afterwards. If the guardrails move the wrong way, the line
moves back.

That is the design I am building for my review kit's board now. It is not finished, and here is the
shape it is heading towards.

<svg viewBox="-1 0 426 420" width="100%" role="img"
     aria-label="The risk tier I am building. A pull request opens. My review kit reviews it. It scores the risk, which is the part being built. A small, low-risk pull request goes to a dashed node asking whether it could be approved without me, which is an open policy question and not something the kit does. Anything riskier is flagged to me, which is the emphasis node. Both paths feed the guardrails, approvals per pull request, reverts and incidents, and a line from the guardrails runs back to the risk score, so they move the threshold."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-same-reviewer-twice0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="115" y="16" width="170" height="36" rx="6"/>
    <rect x="95" y="80" width="210" height="36" rx="6"/>
    <rect x="85" y="144" width="230" height="36" rx="6"/>
    <rect x="10" y="230" width="175" height="50" rx="6" style="stroke-dasharray:4 3"/>
    <rect x="70" y="340" width="260" height="50" rx="6"/>
  </g>
  <rect x="215" y="230" width="175" height="50" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="200" y1="52" x2="200" y2="78" marker-end="url(#fl-same-reviewer-twice0)"/>
    <line x1="200" y1="116" x2="200" y2="142" marker-end="url(#fl-same-reviewer-twice0)"/>
    <line x1="200" y1="180" x2="99" y2="228" marker-end="url(#fl-same-reviewer-twice0)"/>
    <line x1="200" y1="180" x2="301" y2="228" marker-end="url(#fl-same-reviewer-twice0)"/>
    <line x1="97" y1="280" x2="158" y2="338" marker-end="url(#fl-same-reviewer-twice0)"/>
    <line x1="303" y1="280" x2="242" y2="338" marker-end="url(#fl-same-reviewer-twice0)"/>
    <path d="M330,365 H410 V162 H317" style="stroke-dasharray:4 3" marker-end="url(#fl-same-reviewer-twice0)"/>
  </g>
  <g text-anchor="middle">
    <text x="200" y="38.3" style="fill:var(--color-fg)">A pull request opens</text>
    <text x="200" y="102.3" style="fill:var(--color-fg)">My review kit reviews it</text>
    <text x="200" y="166.3" style="fill:var(--color-fg)">It scores the risk (being built)</text>
    <text x="97.5" y="251" style="fill:var(--color-fg)">Small and low risk</text>
    <text x="97.5" y="269" style="fill:var(--color-muted);font-size:12px">approve without me?</text>
    <text x="302.5" y="251" style="fill:var(--color-bg)">Needs my eyes</text>
    <text x="302.5" y="269" style="fill:var(--color-bg);font-size:12px">flagged to me, with why</text>
    <text x="200" y="361" style="fill:var(--color-fg)">The guardrails</text>
    <text x="200" y="379" style="fill:var(--color-muted);font-size:12px">approvals per PR, reverts, incidents</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;
       stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="200" y="410">the guardrails move the threshold</text>
  </g>
</svg>

*The dashed box is a question, not a feature. The kit does not approve anything, and it will not.*

I want to be careful about that dashed box, because it is the easiest thing in this note to
overread. My review kit never approves a pull request. It comments, it can ask for changes, and it
can mark its own threads resolved once a fix lands, and that is where its authority stops. Anthropic's
reviewer does not approve either. It posts findings, and inside Anthropic an open finding holds the merge until someone deals with it. Whether a small, low-risk pull request
should ever merge without a human click is a policy decision, and at Career Team it is a decision for
people, made in a room, with the guardrail numbers on the table. The kit's job is to make that
decision cheap to take and cheap to reverse, by being right about which pull requests are which.

What I have built so far is the first half. The board can already show me which reviews found
nothing, and the risk tier on top of it is in progress. What I have not built is any evidence that
the tier is right, and I will not have that until enough pull requests have gone through it to
compare its calls against what actually got reverted.

## What I have not shown

The match itself proves less than it feels like it does. Two teams arriving at the same design is a
good sign that the design is sensible, and it is no sign at all that mine works as well as theirs.
They have revert and incident evals running daily on far more pull requests than I will ever see.
I have an outcomes log, a few months of scored comments and a team small enough that one busy week
moves every number.

The round cap is new. I can tell you it is there. I cannot yet tell you it did for me what it did for
them.

And the risk tier is a plan with a diagram, which is the stage where everything looks right. The
guardrails are the honest part of it, because they are the bit designed to tell me when I am wrong.

## Back to the sticky note

I still have it. It still says the same thing, which pull requests need my eyes and can the rest
stop waiting for me, and the webinar did not answer it. It did something more useful. It showed me
that the people who build the model I review with landed on the same question, drew the same
guardrails around it, and kept a human in the loop while they figured it out.

So that is what I am doing, slowly and with the numbers on. The next pull request that renames a
prop will still wait for me. The difference is that this time I am going to read it.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
