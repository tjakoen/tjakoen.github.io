---
title: "I Showed My Team a Dashboard. Two Weeks Later They Showed Me Theirs."
subtitle: "I spent a month building a people app the slow way, then replaced it in an afternoon with a Claude dashboard. The better part came after I demoed it: my team went and built their own."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-10
readingTime: "~8 min"
tags: [ai, leadership, claude, dashboards, team]
summary: >
  How I run my engineering team at Career Team on Claude dashboards: a PR review kit with a board I
  share with other managers and a Codex fallback for when my Claude usage runs dry, and Crew Watch,
  a team view that replaced three earlier attempts, including an app I was building by hand. Then
  the part I care about more: after one demo, my tech lead built an epic checker that keeps our work
  aligned with decisions as they change, and another developer built his own work dashboard in
  Obsidian. The rule I hold them to is the one I hold my students to: own the output, or do not ship it.
social: |
  I spent a month hand-building a people app for my team. Then I replaced it in an afternoon with a
  Claude dashboard.

  The better part came after I demoed it. Within two weeks, Kercwin (https://www.linkedin.com/in/kercwin-paul-ocampo-22729222b/) built an epic
  checker that keeps our work aligned with decisions as they change, and Kyle (LINKEDIN_KYLE) built
  his own work board in Obsidian.

  If you lead people and you've built something, show them. The worst case is they nod.
---

## I was building the wrong thing, carefully

For about a month I was writing an app called People Manager. It was going to be the one place I
looked at my team: tickets, pull requests, cycle time, the things I bring to a one-on-one. It had a
plan folder, a design, a few hundred commits. It was also going nowhere fast, and the reason was
embarrassing: my tokens kept getting eaten by the other thing I had built, the robot that reviews my
team's pull requests.

So one afternoon I tried something lazier. I asked Claude for a dashboard instead of an app, pointed
it at the data, and handed it People Manager as a reference for what I wanted. It was done before I
had finished being skeptical about it. That dashboard is called Crew Watch, and I am now fairly sure
I do not need People Manager anymore.

That is the small story. The bigger one is what happened after I showed it to my team.

## The review kit, now with a window

The first dashboard I leaned on was the board for my PR review kit. I [wrote about the kit before]
([LINK: the updated article on how the kit works now]), and a lot has changed since. The short
version of how it works today: pull requests arrive from the team's code review column, scheduled
routines review them against the ticket and the epic's decided rules, follow up on replies, re-review
new commits, and post under my account. It never approves or merges. Approval stays mine.

What changed most is that I stopped managing it from a terminal. Every pull request the kit has
touched sits on a board, in the column of whoever owes the next move. I can queue one by pasting a
link, correct a finding, see which lens has been wrong lately, and watch whether precision and cost
are moving the right way. I still run the reviews. I just get to look at them like a person instead
of reading log files like a raccoon going through a bin.

Two things made it worth writing about again:

- **Other managers use it.** The kit is not a personal toy anymore. It is shared, each manager gets
  their own profile and board, and a teammate's kit can run a second look on a pull request mine
  already reviewed, posting only what it adds.
- **It has a backup brain.** When my Claude usage passes the limits I set on the board, new reviews
  wait, and Codex can take over once my weekly use crosses a threshold I choose. Running out of
  tokens used to mean the reviews stopped. Now it means they change hands.

## Crew Watch, attempt number four

Crew Watch is the view I take into one-on-ones and planning. It took me four tries to get there, and
the first three were all reasonable at the time.

<svg viewBox="0 0 360 404" width="100%" role="img"
     aria-label="Four attempts at a team view. A spreadsheet, kept by hand. DevLake, a metrics platform with dashboards. People Manager, a full app I was coding myself, which stalled for lack of tokens. Crew Watch, a Claude dashboard built in an afternoon with People Manager as its reference."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-crew0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="55" y="16" width="250" height="52" rx="6"/>
    <rect x="55" y="104" width="250" height="52" rx="6"/>
    <rect x="55" y="192" width="250" height="52" rx="6"/>
  </g>
  <rect x="55" y="280" width="250" height="52" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="180" y1="68" x2="180" y2="104" marker-end="url(#fl-crew0)"/>
    <line x1="180" y1="156" x2="180" y2="192" marker-end="url(#fl-crew0)"/>
    <line x1="180" y1="244" x2="180" y2="280" marker-end="url(#fl-crew0)"/>
  </g>
  <path d="M305,218 C345,218 345,306 305,306" style="fill:none;stroke:var(--color-muted);stroke-width:1.5;stroke-dasharray:4 4" marker-end="url(#fl-crew0)"/>
  <g text-anchor="middle">
    <text x="180" y="38.3" style="fill:var(--color-fg)">Sheets</text>
    <text x="180" y="54.8" style="fill:var(--color-muted);font-size:12px">kept by hand, stale by Thursday</text>
    <text x="180" y="126.3" style="fill:var(--color-fg)">DevLake</text>
    <text x="180" y="142.8" style="fill:var(--color-muted);font-size:12px">real metrics, not my questions</text>
    <text x="180" y="214.3" style="fill:var(--color-fg)">People Manager</text>
    <text x="180" y="230.8" style="fill:var(--color-muted);font-size:12px">a whole app, stalled on tokens</text>
    <text x="180" y="302.3" style="fill:var(--color-bg)">Crew Watch</text>
    <text x="180" y="318.8" style="fill:var(--color-bg);font-size:12px">a Claude dashboard, one afternoon</text>
    <text x="180" y="380" style="fill:var(--color-muted);font-size:12px">dashed: People Manager as the reference</text>
  </g>
</svg>

*Four tries at the same view. The third one did not ship, and it still did the most work.*

The honest footnote is that the afternoon was not really an afternoon. Crew Watch was fast because
People Manager already existed. A month of deciding what the view should show, which numbers I
trusted and which questions I actually ask in a one-on-one, was sitting in a plan folder, and the
dashboard got to read all of it. The app did not ship. The thinking inside it did. I will take that
trade every time, and I would not tell anyone the dashboard came from nothing.

I am keeping this part about how it works rather than what it shows, because what it shows is my
team, and that stays at work. A small script pulls from Jira and GitHub into one data file, the
dashboard renders it, and an audit I ran against the old DevLake numbers caught the places where the
two disagreed before anyone saw a wrong figure in a one-on-one.

## Then I showed them

I try to show my team what I build whenever I can. Not as a performance, more as a dare. I joke that
if I were still a full-time developer I would have automated my whole process end to end by now, and
the joke is doing a job: it tells them the tokens they have are for exactly this, and that making
their own work easier is not a side project, it is the work.

A couple of weeks ago I demoed the review board and Crew Watch. In that couple of weeks, two of them
built their own.

### Kercwin's epic checker

Full credit goes to [Kercwin](https://www.linkedin.com/in/kercwin-paul-ocampo-22729222b/). He is fairly new, and I pushed him into the tech lead role because I saw
something in him before he did. I know that feeling from the other side. A lot of my job with him is
the stuff nobody puts on a ticket: the voice that says you are not ready, learning to hand work off
instead of carrying it, getting him to see in himself what the rest of us already see. He is doing a
great job, and he is still working out what kind of leader he wants to be, which is the correct
amount of figured out for anyone.

Before he built anything, he showed the team how he makes Claude talk to him. Tables, diagrams,
specific wording, a format his brain reads fast. I laughed, because mine went the opposite way. Every
rule I have written is about how the AI should sound when it writes as me. His is about how it should
sound when it writes *to* him. Same tool, opposite direction, and both of them right.

Then, inspired by the review board, he built the epic checker. It keeps an epic's code and tickets
aligned with its architecture plan. As a project evolves, decisions change, and the work done last
sprint can quietly drift from the decision made this sprint. The checker scans a pull request or a
ticket against the plan, flags conflicts with other open pull requests, and catches ticket problems
before any code exists. It has its own board where the plan owner ticks decisions, drafts tickets,
and moves conflicts. It helps him do the tech lead part of the job: staying on top of technical
decisions while they are still moving.

The idea underneath it is not his or mine. It comes from Matt, our CTO, whose standing rule is to
move bugs as far left in the process as they will go. A wrong assumption caught on a ticket is
cheaper than one caught in review, which is cheaper than one caught in production. The epic checker
is that rule turned into a tool.

I helped him plan it, and then I did the most flattering thing a manager can do to a teammate's
project: I started using it and sending commits. As a snapshot, the history has about 81 commits from
him and 14 from me. Mine are mostly plumbing, a daily refresh routine for every epic on the index, a
run log and stats view on the board, workday-only scheduling, and the hook that lets my review kit
fold the epic check's decided deviations into its verdict. His tool now makes my reviews smarter. I
did not plan that, and I like it a lot.

### Kyle's Obsidian board

Then in my one-on-one with [Kyle](LINKEDIN_KYLE) last week, he showed me a dashboard he built in Obsidian to run his
own work: his tickets, his pull requests, what is waiting on him and what is waiting on someone else.
Nobody asked him to. It is not for me, it is for him, which is exactly why I was happy to see it.

## The rule that comes with the tokens

I push hard for AI, because I think it is where the work is going and I would rather my team arrive
early than late. But the push always comes with the same rule, and it is the one I give my students.

You own what you ship. If Claude wrote it, you still have to be able to explain it, defend it in a
review, and say why it is right. Do not post a comment, open a pull request, or send a chat message
you could not have written yourself or do not understand. Make it readable by a human, because a human
is going to read it. The tool is allowed to type. It is not allowed to think for you.

That rule is why I am comfortable cheering them on. Kercwin's checker does not decide anything. It
puts the decision in front of the person who owns it. Kyle's board does not do his work. It shows him
where it is. The machine drafts, and someone with their name on it signs.

## What I have not earned yet

Two weeks and two tools is a good story, not a trend. I do not know yet whether this sticks, whether
the rest of the team builds something, or whether the epic checker still gets opened in three months.
Crew Watch replacing People Manager is my judgment after a short run, not a proven fact, and the app
is parked rather than deleted in case I am wrong. And a dashboard is only as honest as the data under
it, which is why the audit came before the one-on-ones and not after.

What I am sure of is smaller. I built a board so I could stop reading log files. I showed it to my
team mostly to show off. They took the hint, built their own, and one of them made my reviews better
in the process. If you lead people and you have been sitting on something you built, show them. The
worst case is they nod. The best case is they show you theirs.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
