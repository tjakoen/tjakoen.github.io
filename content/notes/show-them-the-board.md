---
title: "I Showed My Team a Dashboard. Two Weeks Later They Showed Me Theirs."
subtitle: "I spent a month building a people app the slow way, then replaced it in an afternoon with a Claude dashboard. The better part came after I demoed it: my team went and built their own."
author: "Tjakoen Stolk"
status: PUBLISHED
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
  checker that keeps our work aligned with decisions as they change, and Kyle (https://www.linkedin.com/in/kylealanmanayon/) built
  his own work board in Obsidian.

  If you lead people and you've built something, show them. The worst case is they nod.
---

## I was building the wrong thing, carefully

For about a month I was writing an app called People Manager. It was going to be the one place I
looked at my team: tickets, pull requests, cycle time, the things I bring to a one-on-one. It had a
plan folder, a design, a few hundred commits. It was also going nowhere fast, and it took me a while to see why.

I was thinking like a developer, not like an AI orchestrator. I had sat down to build the thing the
way I would have three years ago: a schema, a server, a page at a time, every screen typed into
existence. Meanwhile the tokens that could have built it were being eaten by the other thing I had
made, the robot that reviews my team's pull requests. I was spending the machine on the work and
spending myself on the typing, which is exactly backwards.

> I kept asking how to build it. The better question was what I wanted to see.

So one afternoon I asked the better question. I asked Claude for a dashboard instead of an app,
pointed it at the data, and handed it People Manager as a reference for what I wanted. It was done before I
had finished being skeptical about it. That dashboard is called Crew Watch, and I am now fairly sure
I do not need People Manager anymore.

In fairness to the timing, I was already building dashboards with Claude before it was a feature. The
review board was one. Then Anthropic shipped [Claude Dashboards](https://claude.com/resources/articles/dashboards-and-motion)
on October 8, and what I had been doing by hand got easier: a dashboard became a thing you ask for,
pin, and keep, rather than a page you coax into existence. That launch is what got me to try the lazy
version of People Manager at all, and the announcement is how I found it.

That is the small story. The bigger one is what happened after I showed it to my team.

## The review kit, now with a window

The first dashboard I leaned on was the board for my PR review kit. It started in
August as one review skill I ran by hand, and as a snapshot it is now 737 commits and a 2.6 release
later, which is a story of its own: [Six Hundred Commits to Teach a Reviewer It Was Wrong](the-reviewer-that-learned-to-be-wrong.md). The short
version of how it works today: pull requests arrive from the team's code review column, scheduled
routines review them against the ticket and the epic's decided rules, follow up on replies, re-review
new commits, and post under my account. It never approves or merges. Approval stays mine.

What changed most is that I stopped managing it from a terminal. Every pull request the kit has
touched sits on a board, in the column of whoever owes the next move. I can queue one by pasting a
link, correct a finding, see which lens has been wrong lately, and watch whether precision and cost
are moving the right way. I still run the reviews. I just get to look at them like a person instead
of reading log files like a raccoon going through a bin.

<figure class="shot">
  <img class="shot__img" src="/media/review-kit/board-in-claude.jpg" width="2880" height="1000" loading="lazy" data-lightbox
       alt="The review board open as a Claude dashboard, with a mock of the Claude sidebar beside it pinning the review board, Crew Watch, the epic board and a chat thread for each. The board shows five columns: queued, in flight, waiting on author, waiting on you, and done, holding demo pull requests.">
  <figcaption class="shot__cap">My actual board, the current version, running on invented pull requests, inside a mock of the Claude app it lives in. The sidebar is mocked for this note, and it is close to mine: each dashboard is pinned next to the chat thread that builds and runs it, so the board and the conversation are always one click apart.</figcaption>
</figure>


Two things made it worth writing about again:

- **Other managers use it.** The kit is not a personal toy anymore. It is shared, each manager gets
  their own profile and board, and a teammate's kit can run a second look on a pull request mine
  already reviewed, posting only what it adds.
- **It has a backup brain.** When my Claude usage passes the limits I set on the board, new reviews
  wait, and Codex can take over once my weekly use crosses a threshold I choose. Running out of
  tokens used to mean the reviews stopped. Now it means they change hands.

<svg viewBox="0 0 360 448" width="100%" role="img"
     aria-label="How the review kit runs. A pull request reaches code review in Jira. The Reviews routine checks it against the ticket, the epic's decisions and six lenses, and posts a verdict. Follow-ups answer replies and verify fixes, and new commits get a re-review. If my Claude usage passes my limit, Codex takes over the routine. Approval always stays with me."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-kit0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="55" y="16" width="250" height="36" rx="6"/>
    <rect x="55" y="192" width="250" height="52" rx="6"/>
    <rect x="55" y="280" width="250" height="52" rx="6"/>
  </g>
  <rect x="55" y="88" width="250" height="68" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <rect x="55" y="380" width="250" height="52" rx="6" style="fill:none;stroke:var(--color-fg);stroke-width:2"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="180" y1="52" x2="180" y2="88" marker-end="url(#fl-kit0)"/>
    <line x1="180" y1="156" x2="180" y2="192" marker-end="url(#fl-kit0)"/>
    <line x1="180" y1="244" x2="180" y2="280" marker-end="url(#fl-kit0)"/>
    <line x1="180" y1="332" x2="180" y2="380" marker-end="url(#fl-kit0)"/>
    <path d="M55,306 C15,306 15,122 55,122" marker-end="url(#fl-kit0)"/>
  </g>
  <g text-anchor="middle">
    <text x="180" y="38.3" style="fill:var(--color-fg)">A pull request reaches code review</text>
    <text x="180" y="112" style="fill:var(--color-bg)">Reviews routine</text>
    <text x="180" y="128.5" style="fill:var(--color-bg);font-size:12px">ticket, epic decisions, six lenses</text>
    <text x="180" y="145" style="fill:var(--color-bg);font-size:12px">Claude, or Codex past my limit</text>
    <text x="180" y="214.3" style="fill:var(--color-fg)">A verdict, posted under my name</text>
    <text x="180" y="230.8" style="fill:var(--color-muted);font-size:12px">and a card on the board</text>
    <text x="180" y="302.3" style="fill:var(--color-fg)">Follow up on replies and fixes</text>
    <text x="180" y="318.8" style="fill:var(--color-muted);font-size:12px">new commits loop back for a re-review</text>
    <text x="180" y="402.3" style="fill:var(--color-fg)">Approval stays with me</text>
    <text x="180" y="418.8" style="fill:var(--color-muted);font-size:12px">it never approves, merges or pushes</text>
  </g>
</svg>

*The kit does the rounds. The last box is the one it cannot reach.*


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

DevLake deserves more credit than one box in a diagram. [Apache DevLake](https://devlake.apache.org/)
is an open-source tool that pulls your Jira and GitHub history into one database and puts dashboards
on top: cycle time, review time, what finished per sprint. It was the step that taught me what the
numbers even were. Before it, I had opinions about how the team was doing. After it, I had a lake of
real data and a set of queries that defined each metric precisely, which is the part that carried
forward. When Crew Watch came along, those definitions became its spec, and the audit I ran checked
Crew Watch's figures against DevLake's before I trusted them. DevLake answered the questions it was
built for. It just was not built for mine, which were about people rather than pipelines, and that gap
is what the next two tries were for.

<figure class="shot">
  <img class="shot__img" src="/media/crew/people-manager.jpg" width="1280" height="800" loading="lazy" data-lightbox
       alt="People Manager in its demo mode, with an invented roster: a banner saying so, a sidebar of people whose one-on-ones are slipping, and a status page headed five relationships are slipping, with this week's open questions grouped by person.">
  <figcaption class="shot__cap">People Manager, running its own demo mode with an invented roster. It is a good app. It was also a month in and nowhere near done.</figcaption>
</figure>


The honest footnote is that the afternoon was not really an afternoon. Crew Watch was fast because
People Manager already existed. A month of deciding what the view should show, which numbers I
trusted and which questions I actually ask in a one-on-one, was sitting in a plan folder, and the
dashboard got to read all of it.

> The app did not ship. The thinking inside it did.

That is the part I would underline for anyone trying this. The expensive work was never the code. It
was deciding what matters, and no model did that for me. A month of my judgment, written down, is what
let an afternoon of Claude's typing land. I will take that trade every time, and I would not tell
anyone the dashboard came from nothing.

I am keeping this part about how it works rather than what it shows, because what it shows is my
team, and that stays at work. A small script pulls from Jira and GitHub into one data file, the
dashboard renders it, and an audit I ran against the old DevLake numbers caught the places where the
two disagreed before anyone saw a wrong figure in a one-on-one.

<figure class="shot">
  <img class="shot__img" src="/media/crew/crew-watch-in-claude.jpg" width="2880" height="1720" loading="lazy" data-lightbox
       alt="Crew Watch open as a Claude dashboard in a mock of the Claude sidebar, filled with invented people and tickets: fourteen things that need me, from overdue one-on-ones to blocked tickets.">
  <figcaption class="shot__cap">Crew Watch, refilled with invented people and tickets for this note, inside the same mock Claude sidebar. The real one looks the same, with my team in it.</figcaption>
</figure>

## Then I showed them

I do not hand my team an AI policy and hope. I show them what I built, rough edges included, and let
them decide it looks easy enough to try. Nobody gets inspired by a mandate. People get inspired by
watching someone they work with do the thing, on their real problems, and come out the other side
with an afternoon back.

So I show my team what I build whenever I can. Not as a performance, more as a dare. I joke that
if I were still a full-time developer I would have automated my whole process end to end by now, and
the joke is doing a job: it tells them the tokens they have are for exactly this, and that making
their own work easier is not a side project, it is the work.

A couple of weeks ago I demoed the review board and Crew Watch. In that couple of weeks, two of them
built their own. I did not assign either one.

> The best thing a demo can do is make someone else open their own session.

### Kercwin's epic checker

Full credit goes to [Kercwin](https://www.linkedin.com/in/kercwin-paul-ocampo-22729222b/). This is his first job, and he went from developer to tech lead in about a year, which is fast for
anyone. I pushed him into the role because I saw
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

That matters more than it sounds, because an epic here has a lot of hands on it: the plan owner,
product, leads from more than one team, and the developers doing the work. With that many people,
alignment is the hard part, and his checker is the thing that keeps everyone reading the same page.
Two of its choices started as my advice, and I like that he kept them. Confluence is the source of
truth, so decisions live where everyone already reads them instead of inside a tool only one person
opens. And the run logs are shared, so anyone can see what the checker did, when, and on whose run.

<figure class="shot">
  <img class="shot__img" src="/media/crew/epic-board-in-claude.jpg" width="2880" height="1720" loading="lazy" data-lightbox
       alt="Kercwin's epic board open as a Claude dashboard in a mock of the Claude sidebar, on an invented epic called Reports export: tabs for what blocks a merge, what needs deciding and open conflicts, a list headed fix first with two conflicts between pull requests, and one flagged decision open on the right with Claude's recommendation and accept, accept with changes and reject buttons.">
  <figcaption class="shot__cap">Kercwin's board, his latest version, running on an invented epic inside the same mock sidebar. A flagged decision goes against the plan, Claude recommends a change, and a person picks the button.</figcaption>
</figure>

The idea underneath it is not his or mine. It comes from Matt, our CTO, whose standing rule is to
move bugs as far left in the process as they will go. A wrong assumption caught on a ticket is
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
  <text x="340" y="136" text-anchor="end" style="fill:var(--color-muted);font-size:12px">dearer to fix</text>
</svg>

*Matt's rule, drawn. Every step right costs more than the one before it.*

I helped him plan it, and then I did the most flattering thing a manager can do to a teammate's
project: I started using it and sending commits. As a snapshot, the history has about 81 commits from
him and 14 from me. Mine are mostly plumbing, a daily refresh routine for every epic on the index, a
run log and stats view on the board, workday-only scheduling, and the hook that lets my review kit
fold the epic check's decided deviations into its verdict. His tool now makes my reviews smarter. I
did not plan that, and I like it a lot.

### Kyle's Obsidian board

[Kyle](https://www.linkedin.com/in/kylealanmanayon/) is a junior on my team, and he is on track to be
a senior in due time.

In my one-on-one with him last week, he showed me a dashboard he had built
in Obsidian to run his own work: his tickets, his pull requests, what is waiting on him and what is
waiting on someone else. He had built it shortly after my demo. Nobody asked him to, and it is not for
me. It is for him.

I found that genuinely cool, and a little inspiring in the other direction. A junior developer saw a
manager's dashboard and did not think "nice tool for managers." He thought "I could have one of those
for me," picked Obsidian, and made it. That is the exact instinct I was hoping the
demo would plant, and seeing it come from a junior made it land harder. It is also the habit that turns a junior into a senior: noticing the friction in your own work and fixing it
instead of carrying it.

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
