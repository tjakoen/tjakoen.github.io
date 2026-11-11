---
title: "Our CTO Said Move Bugs to the Left. My Tech Lead Built the Tool."
subtitle: "Matt's standing rule is that a wrong assumption gets cheaper the earlier you catch it. Kercwin turned that rule into an epic checker that reads every ticket and pull request against the plan before the drift sets in."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-11-10
readingTime: "~5 min"
tags: [ai, leadership, claude, dashboards, team]
summary: >
  Kercwin, the tech lead of my team, built an epic checker that keeps a busy project aligned to its
  architecture plan. It reads each ticket and open pull request against the plan in Confluence, flags new
  decisions and conflicts between pull requests, and puts each one in front of the person who owns it. The
  idea under it is our CTO Matt Monroe's rule: move bugs as far to the left in the process as possible.
social: |
  Our CTO, Matt Monroe (https://www.linkedin.com/in/matt-monroe-a3728593/), has a standing rule: move bugs
  as far to the left in the process as possible. A wrong assumption caught on a ticket is cheaper than one caught
  in review, which is cheaper than one caught in production.

  Kercwin (https://www.linkedin.com/in/kercwin-paul-ocampo-22729222b/), the tech lead of my team,
  turned that rule into a tool. His epic checker reads every ticket and open pull request against the
  architecture plan, and puts each drift in front of the person who owns the decision.

  It does not decide anything. It just makes sure the decision gets made on the ticket, not in production.
socialImage: "/media/notes/move-bugs-left-social.png"
socialImageAlt: "Move bugs left. Catch it on the ticket, not in production. Four stops on a line, ticket, review, testing and production, each dot bigger than the last, with the first two boxed: the epic checker works here."
---

An epic at [Career Team](/leading) has a lot of hands on it: the plan owner, product,
leads from potentially more than one team, and the developers doing the work. Decisions change while the work is
moving, and the code written last sprint can quietly drift from the decision made this sprint. Nobody
notices until review, or testing, or a customer.

Kercwin built the thing that notices first. This note is about that tool and the rule it came from.
How it started, with a demo of my own dashboards, is in
[I Showed My Team a Dashboard. Two Weeks Later They Showed Me Theirs.](show-them-the-board.md)

## Matt's rule

The idea underneath it is not his or mine. It comes from [Matt](https://www.linkedin.com/in/matt-monroe-a3728593/), our CTO, and it is his standing
rule:

> Move bugs as far to the left in the process as possible.
>
> *My interpretation, from what I remember of a knowledge-sharing session by [Matt Monroe](https://www.linkedin.com/in/matt-monroe-a3728593/), CTO at [Career Team](https://careerteam.com). Not his exact words.*

A wrong assumption caught on a ticket is
cheaper than one caught in review, which is cheaper than one caught in production. The epic checker
is that rule turned into a tool.

<svg viewBox="0 0 360 150" width="100%" role="img"
     aria-label="Where a wrong assumption gets caught, from cheapest to most expensive: on the ticket, in review, in testing, in production. The epic checker works at the ticket and the pull request, the left end of the line."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13px">
  <defs>
    <marker id="fl-left0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <line x1="20" y1="60" x2="340" y2="60" style="stroke:var(--color-muted);stroke-width:1.5" marker-end="url(#fl-left0)"/>
  <rect x="14" y="40" width="150" height="40" rx="6" style="fill:none;stroke:var(--color-fg);stroke-width:2"/>
  <g style="fill:var(--color-fg)"><circle cx="40" cy="60" r="5"/><circle cx="125" cy="60" r="5"/><circle cx="210" cy="60" r="5"/><circle cx="300" cy="60" r="5"/></g>
  <g text-anchor="middle" style="fill:var(--color-fg)">
    <text x="40" y="104">Ticket</text><text x="125" y="104">Review</text><text x="210" y="104">Testing</text><text x="300" y="104">Production</text>
    <text x="89" y="30" style="font-size:12px">the epic checker works here</text>
  </g>
  <text x="20" y="136" style="fill:var(--color-muted);font-size:12px">cheaper to fix</text>
  <text x="340" y="136" text-anchor="end" style="fill:var(--color-muted);font-size:12px">more expensive to fix</text>
</svg>

*Matt's rule, drawn. Every step right costs more than the one before it.*

Kercwin credits it the same way. At the team's engineering knowledge-sharing session, he opened his
presentation about his skill and dashboard with his own reading of what Matt said, and then put the
job in his own terms:
preventative and proactive measures, tracking and auditing to steer technical direction, and bridging
delivery between product, leads and developers, in any order the cycle runs.

## Who built it

Full credit goes to [Kercwin](https://www.linkedin.com/in/kercwin-paul-ocampo-22729222b/). He went from developer to tech lead in about a year, which is fast for
anyone. I pushed him into the role because I saw something in him before he did, which is a feeling I
know from the other side. A lot of my job with him is
the stuff nobody puts on a ticket: the inner voice in your head that says you are not ready, learning to hand work off
instead of carrying it, getting him to see in himself what the rest of us already see. He is doing a
great job, and he is still working out what kind of leader he wants to be, which is the correct
amount of figured out for anyone.

Before he built anything, he showed the team how he makes Claude talk to him. Tables, diagrams,
specific wording, a format his brain reads fast. I laughed, because mine went the opposite way. Every
rule I have written is about how the AI should sound when it writes as me. His is about how it should
sound when it writes *to* him. Same tool, opposite direction, and both of them right.


## How the epic checker works

Inspired by my review board, he built the epic checker. It keeps an epic's code and tickets
aligned with its architecture plan, so he can stay on top of technical decisions while they are still
moving.

<svg viewBox="0 0 360 476" width="100%" role="img"
     aria-label="How the epic checker works. The architecture plan in Confluence is the source of truth. A ticket before any code exists, or an open pull request, goes into the epic check, which reads it against the plan and the other open pull requests. It surfaces new decisions, conflicts between pull requests, and ticket problems. Those land on the decision board, where the plan owner ticks decisions, drafts tickets and moves conflicts, and every decision is written back to the plan."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-epic0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <rect x="55" y="16" width="250" height="52" rx="6" style="fill:none;stroke:var(--color-fg);stroke-width:2"/>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="104" width="150" height="52" rx="6"/>
    <rect x="190" y="104" width="150" height="52" rx="6"/>
    <rect x="45" y="280" width="270" height="52" rx="6"/>
    <rect x="45" y="368" width="270" height="68" rx="6"/>
  </g>
  <rect x="60" y="192" width="240" height="52" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="140" y1="68" x2="140" y2="104" marker-end="url(#fl-epic0)"/>
    <line x1="220" y1="68" x2="220" y2="104" marker-end="url(#fl-epic0)"/>
    <line x1="95" y1="156" x2="140" y2="192" marker-end="url(#fl-epic0)"/>
    <line x1="265" y1="156" x2="220" y2="192" marker-end="url(#fl-epic0)"/>
    <line x1="180" y1="244" x2="180" y2="280" marker-end="url(#fl-epic0)"/>
    <line x1="180" y1="332" x2="180" y2="368" marker-end="url(#fl-epic0)"/>
    <path d="M315,402 C352,402 352,42 305,42" stroke-dasharray="4 4" marker-end="url(#fl-epic0)"/>
  </g>
  <g text-anchor="middle">
    <text x="180" y="38.3" style="fill:var(--color-fg)">The architecture plan</text>
    <text x="180" y="54.8" style="fill:var(--color-muted);font-size:12px">in Confluence, the source of truth</text>
    <text x="95" y="126.3" style="fill:var(--color-fg)">A ticket</text>
    <text x="95" y="142.8" style="fill:var(--color-muted);font-size:12px">before any code exists</text>
    <text x="265" y="126.3" style="fill:var(--color-fg)">A pull request</text>
    <text x="265" y="142.8" style="fill:var(--color-muted);font-size:12px">while it is still open</text>
    <text x="180" y="214.3" style="fill:var(--color-bg)">The epic check</text>
    <text x="180" y="230.8" style="fill:var(--color-bg);font-size:12px">against the plan and every open PR</text>
    <text x="180" y="302.3" style="fill:var(--color-fg)">New decisions, conflicts, ticket problems</text>
    <text x="180" y="318.8" style="fill:var(--color-muted);font-size:12px">each one a row someone owns</text>
    <text x="180" y="390.3" style="fill:var(--color-fg)">The decision board</text>
    <text x="180" y="406.8" style="fill:var(--color-muted);font-size:12px">the plan owner ticks decisions,</text>
    <text x="180" y="422.3" style="fill:var(--color-muted);font-size:12px">drafts tickets and moves conflicts</text>
    <text x="180" y="462" style="fill:var(--color-muted);font-size:12px">dashed: every decision goes back into the plan</text>
  </g>
</svg>

*The plan stays the source of truth. The checker only ever points at where the work and the plan disagree.*

That matters more than it sounds, because of all those hands from the opening. With that many people,
alignment is the hard part, and his checker is the thing that keeps everyone reading the same page.
Two of its choices started as my advice, and I like that he kept them. Confluence is the source of
truth, so decisions live where everyone already reads them instead of inside a tool only one person
opens. And the run logs are shared, so anyone can see what the checker did, when, and on whose run.

<figure class="shot">
  <img class="shot__img" src="/media/crew/epic-board-in-claude.jpg" width="2880" height="1720" loading="lazy" data-lightbox
       alt="Kercwin's epic board open as a Claude dashboard in a mock of the Claude sidebar, on an invented epic called Reports export: tabs for what blocks a merge, what needs deciding and open conflicts, a list headed fix first with two conflicts between pull requests, and one flagged decision open on the right with Claude's recommendation and accept, accept with changes and reject buttons.">
  <figcaption class="shot__cap">Kercwin's board, his latest version, running on an invented epic inside the same mock sidebar. A flagged decision goes against the plan, Claude recommends a change, and a person picks the button.</figcaption>
</figure>

The checker does not decide anything. It puts the decision in front of the person who owns it, with a
recommendation and three buttons, and a person picks one. That is the rule I hold the whole team to:
the tool is allowed to type, and someone with their name on it signs.

## What came back to me

I helped him plan it, and then I did the most flattering thing a manager can do to a teammate's
project: I started using it and sending commits. As a snapshot, the history has about 81 commits from
him and 14 from me. Mine are mostly plumbing, a daily refresh routine for every epic on the index, a
run log and stats view on the board, workday-only scheduling, and the hook that lets my review kit
fold the epic check's decided deviations into its verdict.

**His tool now makes my reviews smarter.** I did not plan that, and I like it a lot. It is the part of
this project I would point at first: a tool built for one tech lead's epics ended up improving a
reviewer that runs on every pull request the team opens. My reviews now know which deviations from
an epic were decided on purpose, so a deliberate change no longer gets flagged like a mistake.

> **One person's tool made another person's tool better.** When one of us shares what helps them,
> the whole team gets the benefit, and that is the lesson I would keep from this project.

## What my reviewer already learned the hard way

My review kit has been through this road, and the story of it is in
[Seven Hundred Commits to Teach a Reviewer It Was Wrong](the-reviewer-that-learned-to-be-wrong.md).
Three of its lessons carry straight over to an epic checker, and I have been passing them to Kercwin.

<svg viewBox="0 0 360 250" width="100%" role="img"
     aria-label="Three lessons from my reviewer and what each becomes on the epic checker. Keep score: every review comment graded by what happened next becomes every flag graded as accepted, changed, rejected or ignored. Read scores per topic: sharp on database changes and noisy on frontend speed becomes split by kind of flag, conflicts versus new decisions. A miss is worth more than a hit: a fix replayed on the commit it missed becomes a decision found late turned into a test for the next run."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13px">
  <defs>
    <marker id="fl-lesson0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px">
    <text x="90" y="18">My reviewer</text><text x="270" y="18">The epic checker</text>
  </g>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="10" y="30" width="160" height="60" rx="6"/><rect x="190" y="30" width="160" height="60" rx="6"/>
    <rect x="10" y="105" width="160" height="60" rx="6"/><rect x="190" y="105" width="160" height="60" rx="6"/>
    <rect x="10" y="180" width="160" height="60" rx="6"/><rect x="190" y="180" width="160" height="60" rx="6"/>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1.5">
    <line x1="170" y1="60" x2="189" y2="60" marker-end="url(#fl-lesson0)"/>
    <line x1="170" y1="135" x2="189" y2="135" marker-end="url(#fl-lesson0)"/>
    <line x1="170" y1="210" x2="189" y2="210" marker-end="url(#fl-lesson0)"/>
  </g>
  <g text-anchor="middle" style="fill:var(--color-fg)">
    <text x="90" y="54">Keep score</text>
    <text x="90" y="72" style="fill:var(--color-muted);font-size:11.5px">each comment graded by</text>
    <text x="90" y="84" style="fill:var(--color-muted);font-size:11.5px">what happened next</text>
    <text x="270" y="54">Grade every flag</text>
    <text x="270" y="72" style="fill:var(--color-muted);font-size:11.5px">accepted, changed, rejected,</text>
    <text x="270" y="84" style="fill:var(--color-muted);font-size:11.5px">or never touched</text>
    <text x="90" y="129">Score per topic</text>
    <text x="90" y="147" style="fill:var(--color-muted);font-size:11.5px">sharp on databases,</text>
    <text x="90" y="159" style="fill:var(--color-muted);font-size:11.5px">noisy on frontend speed</text>
    <text x="270" y="129">Split by kind of flag</text>
    <text x="270" y="147" style="fill:var(--color-muted);font-size:11.5px">conflicts apart from</text>
    <text x="270" y="159" style="fill:var(--color-muted);font-size:11.5px">new decisions</text>
    <text x="90" y="204">A miss beats a hit</text>
    <text x="90" y="222" style="fill:var(--color-muted);font-size:11.5px">the fix replayed on the</text>
    <text x="90" y="234" style="fill:var(--color-muted);font-size:11.5px">commit it missed</text>
    <text x="270" y="204">A late decision</text>
    <text x="270" y="222" style="fill:var(--color-muted);font-size:11.5px">becomes a test the</text>
    <text x="270" y="234" style="fill:var(--color-muted);font-size:11.5px">next run must pass</text>
  </g>
</svg>

*The same three lessons, carried from one tool to the other.*

The first is to keep score. My reviewer only got good once every comment it left was graded by what
happened next: fixed, answered, closed without a change, or ignored. A flag on the epic board can be
graded the same way. A decision that got accepted, changed or rejected is a result, and a flag nobody
ever touched is a result too, just a less flattering one.

The second is to read the scores per topic, never as one average. My reviewer can be sharp on
database changes and noisy on frontend speed, and the mean of those two looks fine. A checker can be
right about conflicts between pull requests and wrong about what counts as a new decision, and only a
split by kind of flag shows which.

The third is that a miss is worth more than a hit. When my reviewer lets something through, the fix
to its lens is replayed on the exact commit it missed before the fix counts. The epic checker's
version of that is a decision that surfaced in review or in testing instead of on the ticket. Every
one of those is a test the next run should pass.

None of that replaces the person with the buttons. It only tells them, with a record rather than a
feeling, how much the flags are worth reading.

## What the board says so far

Everything the checker produces lands in Confluence and Jira, so the numbers are easy to count. As a
snapshot on Nov 10, about ten days after the Epic Alignment space was set up:

| What | Count |
|---|---|
| Architecture plans the checker reads against | 16 |
| Conflict pages it has opened | about 19 |
| Conflicts already closed | 7 |
| Follow-up tickets it drafted, labeled epic-review | 48 |
| Of those, already done | 28 |

These numbers do not say whether a flag was right. A closed conflict can mean two pull requests merged
cleanly or that someone decided it was not a conflict at all, and the board does not grade that yet.
That is the first lesson above, waiting to be applied.

## What I have not earned yet

It is a few weeks old. I do not know yet whether it still gets opened in three months, or whether the
leads on other teams come to trust its flags enough to act on them without double-checking. The
cheaper-to-the-left curve is Matt's rule and a well-worn one, but I have no number of my own yet for bugs
it caught early. What I can say is smaller: when the checker flags a drift, it flags it on the ticket or the open pull
request, in front of the person who owns the decision, which is exactly where Matt said it belongs.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
