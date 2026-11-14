---
title: "I Built a Command Center and Then Forgot to Turn It On"
audience: [build]
level: intro
subtitle: "PANTRY was supposed to be where my AI sessions and I agreed on what to do next. For two months it sat in a folder, waiting for me to start it by hand. This is how it became an app that sits beside the work instead."
author: "Tjakoen Stolk"
status: DRAFT
type: note
layout: timeline
date: 2026-11-14
readingTime: "~12 min"
tags: [ai, stack, tooling]
summary: >
  PANTRY is my local command center for AI coding sessions: a plan board, claims and heartbeats so
  two sessions never take the same work, a doctor that checks the loop, and an MCP server agents
  call. I built it in July and barely used it, because it felt in the way. It was a web app I had to spin up by
  hand in every project and nothing in my day ever made me do that. The fix was not a better board.
  It was an always-on hub, then a dashboard, a desktop app and a pane beside the chat, so PANTRY is
  already open when the work starts, and so a session can show me a plan instead of describing
  one. The evidence is still one person's use.
---

I have to be honest about PANTRY. I built it, I wrote about it, and I barely used it. Most days it
just felt like it was in the way.

It was not broken. It was one more thing between me and the work. It lived in a sibling folder, it came up with a command I had to remember, and it served one project
on one port until I closed the terminal. Every session I opened with Claude went straight to the
code, because the code was right there, and the board that was supposed to tell that session what to
do sat in a folder I had not opened in days.

And yet I never stopped working on it. I kept improving it and kept it wired into the loop: the
doctor at every session start, the plans folder every repo writes to, the standards it mounts. I
could not bring myself to use the board, and I could not bring myself to let it go either, because
I could not argue with the goal. Projects that stay aligned and accountable, and agents in the loop
that cost me nothing extra to keep there, are worth a tool I find annoying. That is a strange
relationship to have with your own software, and I suspect it is not a rare one.

As a snapshot, on `Nov 14` the PANTRY repository holds 168 commits on main and four branches still in
flight. Here is where they fell.

<svg viewBox="0 0 620 300" width="100%" role="img"
     aria-label="PANTRY commits per month on main, July to November 2026: 49 in July, 78 in August, 7 in September, 2 in October, and 32 in November through the 14th. Activity collapses in September and October and returns in November when PANTRY became an always-on hub."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;
            --paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--bar:#cbc1b3;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="299" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="30" style="fill:var(--muted);font-size:15px">PANTRY commits on main, per month (snapshot, Nov 14)</text>
  <line x1="40" y1="240" x2="590" y2="240" style="stroke:var(--edge)"/>
  <rect x="60" y="141" width="70" height="99" style="fill:var(--ink)"/>
  <rect x="170" y="82" width="70" height="158" style="fill:var(--ink)"/>
  <rect x="280" y="226" width="70" height="14" style="fill:var(--bar)"/>
  <rect x="390" y="236" width="70" height="4" style="fill:var(--bar)"/>
  <rect x="500" y="175" width="70" height="65" style="fill:var(--ink)"/>
  <g text-anchor="middle" style="fill:var(--muted);font-size:12.5px">
    <text x="95" y="134">49</text>
    <text x="205" y="75">78</text>
    <text x="315" y="219">7</text>
    <text x="425" y="229">2</text>
    <text x="535" y="168">32</text>
  </g>
  <g text-anchor="middle" style="fill:var(--ink);font-size:14px">
    <text x="95" y="258">Jul</text>
    <text x="205" y="258">Aug</text>
    <text x="315" y="258">Sep</text>
    <text x="425" y="258">Oct</text>
    <text x="535" y="258">Nov</text>
  </g>
  <text x="28" y="288" style="fill:var(--accent);font-size:13px">The gap is the months it had to be started by hand.</text>
</svg>

*Commits per month on PANTRY's main branch. November counts only its first fourteen days.*

That gap is the story. I want to be fair to it before I tell it, because a quiet repository has more
than one explanation. September and October were also the months my [PR review
kit](the-reviewer-that-learned-to-be-wrong.md) ate every evening I had. But the review kit is the
tell. It ran on a schedule, so it got used whether I remembered it or not. PANTRY waited to be
asked, and nobody asked.

## Jul 8 · It started as a cockpit

The first commit is a plan, and the plan was big:

```console
$ git log --reverse --format='%ad  %s' --date=short
2026-07-08  docs(pantry): plan the dev-docs + AI cockpit app; PROOF becomes a mountable layer
2026-07-08  feat(pantry): the dev-docs + AI cockpit app (v1) — composes the layers
2026-07-08  feat(proof): piece 3 — live board over SSE (file watcher + broadcast)
```

The idea was simple and I still believe it. I work across half a dozen repositories with Claude and
Codex doing most of the typing, and lately DeepSeek too, and none of those sessions remembers the last one. They need
somewhere outside their own context to read what is planned, what someone else already took, and
what is waiting on me. A plans folder in each repo gets you most of the way, and [the loop
setup](loop-setup.md) still says so. PANTRY was the layer on top: one board over those plan files, a
live view of who is working on what, and the standards mounted where a session could find them.

It composed the rest of the stack, so it also ate the rest of July in plumbing. Forty-nine commits,
a good share of them about where packages resolve from. I am a design-systems person to my core,
and I spent the first month of a command center on its supply chain.

## Jul 26 · Then it got a doctor

```console
2026-07-26  feat: pantry doctor — the loop's mechanical tier
2026-08-11  feat(doctor): four checks for work that is finished and still sitting
2026-08-17  feat(doctor): the cold start gets measured instead of remembered
```

The doctor is the part of PANTRY that never needed me to open anything. It runs from a hook at the
start of every session and prints the rows you can see at the top of my own transcripts: worktrees
against live sessions, run reports falling behind, a graph older than its code. August was its best
month. Seventy-eight commits, most of them a new check for a way I had been caught out.

That should have been the hint. The piece of PANTRY that fired by itself kept growing. The piece
that waited for a browser tab did not. I wrote about the sharpest version of that lesson in [The
Check Ran Once in 165 Sessions](the-check-that-never-ran.md), and then, I am a little embarrassed to
say, failed to apply it to the board.

## Aug 10 · It could serve a project, one at a time

```console
2026-08-10  feat: let PANTRY serve a project under its own origin
```

This is the commit that made PANTRY a real web app, and the one that set up the problem. Each
project got its own server. To see the board for this site I had to go to the pantry folder, start
it pointed at this repo, and keep that terminal alive. A second project meant a second server on a
second port. The address changed depending on which I had started first.

None of that is hard. It is just a step, and a step that sits outside the work is a step that does
not happen. I would open a session meaning to start PANTRY first, the session would already be
reading code, and by the time I thought of the board the plan was in my head and the chat instead.

## Sep and Oct · Nine commits

```console
2026-09-03  feat(control): the page that says where the project is
2026-09-15  feat(doctor): measure worktree isolation against live sessions
2026-10-02  feat(timeline): show run close activity
```

The board still got the occasional page. The doctor still got checks, since the doctor was the bit I
actually saw. But the commit count tells you how often I opened the thing, and it was close to never.

## Nov 4 · Then it stopped waiting to be started

```console
2026-11-04  🐳 Add the always-on hub that serves every project from one container
2026-11-04  🔌 Serve PANTRY to Claude Code and Codex over MCP from the hub
2026-11-04  🎛️ Let agents claim ready plans from PANTRY over MCP
2026-11-04  🧭 Make the alignment brief PANTRY's home page
```

One day, eighteen commits, and it is the day PANTRY started working. The hub was one Docker container
that served every project at once, so there is nothing to start and no port to remember. And the agents
stopped needing me to open the board, because the board came to them. A session now calls PANTRY
over MCP before it does anything: it reads an orientation brief, asks what is next, claims a plan so
no other session takes it, and heartbeats while it works. A claim that goes quiet for thirty
minutes expires and the plan goes back on the board. (The container did not last. Ten days later
the hub went native, and the Docker files are on their way out on a branch of their own.)

<svg viewBox="0 0 440 330" width="100%" role="img"
     aria-label="How a session works with PANTRY. It orients by reading the project brief, asks PANTRY what is next, and claims a ready plan. While it works it sends a heartbeat every ten minutes, which keeps the claim alive. If it goes silent for thirty minutes the claim expires and the plan goes back on the board to be picked up again. When the work is finished the session releases the plan as done, and the board knows it without anyone telling it."
     style="display:block;width:100%;max-width:440px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-pantry0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="100" y="16" width="220" height="36" rx="6"/>
    <rect x="100" y="80" width="220" height="36" rx="6"/>
    <rect x="100" y="144" width="220" height="36" rx="6"/>
    <rect x="100" y="208" width="220" height="36" rx="6"/>
  </g>
  <rect x="100" y="272" width="220" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="210" y1="52" x2="210" y2="78" marker-end="url(#fl-pantry0)"/>
    <line x1="210" y1="116" x2="210" y2="142" marker-end="url(#fl-pantry0)"/>
    <line x1="210" y1="180" x2="210" y2="206" marker-end="url(#fl-pantry0)"/>
    <line x1="210" y1="244" x2="210" y2="270" marker-end="url(#fl-pantry0)"/>
    <path d="M320,226 L360,226 L360,162 L322,162" marker-end="url(#fl-pantry0)"/>
    <path d="M100,226 L50,226 L50,98 L98,98" marker-end="url(#fl-pantry0)"/>
  </g>
  <g text-anchor="middle">
    <text x="210" y="38.3" style="fill:var(--color-fg)">Orient: read the brief</text>
    <text x="210" y="102.3" style="fill:var(--color-fg)">Next: what is ready?</text>
    <text x="210" y="166.3" style="fill:var(--color-fg)">Claim the plan</text>
    <text x="210" y="230.3" style="fill:var(--color-fg)">Work</text>
    <text x="210" y="294.3" style="fill:var(--color-bg)">Release: done, and the board knows</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="392" y="190">heartbeat</text>
    <text x="392" y="205">every 10 min</text>
    <text x="50" y="158">silent</text>
    <text x="50" y="173">30 min</text>
  </g>
</svg>

*What a session does with PANTRY, over MCP, without me opening anything.*

The goal of PANTRY, and it took me four months to say it plainly, is to keep my projects aligned
and accountable, and to make working with agents in the loop feel like no extra work at all. It is
not a dashboard for me to admire. It is the place where my sessions and I agree on what is being done and
by whom, so I can run several at once without two of them rewriting the same file, and so the one
thing only I can decide sits in a column called Needs you instead of scrolling past in a chat.

The usage tracking came a week later, and it settled a question I had been answering with feelings:

```console
2026-11-10  Track token usage per project, plan, area and model, with a Usage page
```

Every session that writes now works under a plan, so its tokens land on that plan. The rule is
enforced by a hook rather than by my memory, which by now you will not be surprised to hear was the
point.

## Nov 14 · Then it moved beside the work

The agents were using PANTRY. I still mostly was not, because looking at it still meant switching to
a browser tab. So I asked whether I should drop the web app and move the board into Obsidian.

That question did not come from nowhere. Two people on my team track their work in Obsidian.
[Kyle](/people#kyle), a junior, built himself a work board in it, which I wrote about in [Show Them
the Board](show-them-the-board.md). And I watched a senior engineer on the team run her whole week
out of it, one checklist at a time. I have been through the entire to-do app journey, Obsidian
included, and [none of them stuck](origin-story.md). She is a checklist person and it simply works
for her. I am honestly envious.

So the answer was no, and not because Obsidian is wrong. It would show the plan files, but it would
not know about claims, heartbeats or a session that died halfway through, and it would be one more
app I open for a week and then stop opening. What I wanted was not a different tool. I wanted
PANTRY to feel like a workspace, the thing that is open next to the work rather than a destination.

That turned into four pieces of work, run as four sessions at once, each with its own plan on the
PANTRY board. I used PANTRY to work on PANTRY, which is either the best test a tool can get or a very
elaborate way to avoid using it for anything else. Probably both.

It also caught us. While they ran, the command center had flagged its own builders: seven files
written outside any plan, marked Strayed, sitting in the Agents column for anyone to see. The tool
whose job is keeping work accountable held the work on itself to account, and I would rather show
that than crop it out.

<figure class="shot">
  <img class="shot__img" src="/media/pantry/command-center.jpg" width="2560" height="1720" loading="lazy" data-lightbox
       alt="PANTRY's command center for the pantry repository itself. Chips across the top read 2 Agents, 1 Strayed, 0 Ready, 0 Needs you and 4 Drift. The Agents column shows the dashboard plan done by Claude, and below it a No plan card marked unplanned listing seven files written with no plan, including hub-ensure.ts, tiers.ts and docs/WORKFLOW.md. The Queue is empty, and the Inbox holds four drift warnings with Copy fix buttons.">
  <figcaption class="shot__cap">PANTRY's command center on the PANTRY repository, while the four sessions ran. This is the layout from before the new dashboard; the Strayed card is the sessions that built PANTRY writing outside their plans.</figcaption>
</figure>

> PANTRY only works if it is already open when the work starts. Everything since November is that
> one sentence.

**The dashboard.** Needs you moved to the front first. Then the top bar became a sidebar of projects
with their worktrees folded underneath, a preview pane, and a narrow sidebar mode built for living in
a strip down the edge of the screen. That merged as [tjakoen/pantry#4](https://github.com/tjakoen/pantry/pull/4).

```console
2026-11-14  💄 Move PANTRY to a sidebar layout with Needs you first
2026-11-14  📊 Make the command center a dashboard, with a sidebar mode (#4)
```

**The desktop app.** A Tauri app, picked over Electron because it uses the system webview instead
of shipping its own browser, so it costs a window rather than a gigabyte. It finds the hub by itself,
shows an offline page with a Start button when the hub is down, and keeps the Needs you count in the
menu bar. Alongside it, two commands: one that makes sure the hub is running and returns at once if
it already is, and one that brings the app forward on a project. My session-start hook now calls
both. I tested the cold start by stopping the hub first: the hook brought it back up and opened the
app before the session had read a file. The first commit for the shell said, honestly, that it had
not been built yet. By the end of the day it was built and installed on my machine.

```console
2026-11-14  ✨ Add pantry hub ensure, a richer health endpoint and pantry open
2026-11-14  Add a Tauri desktop app that finds and starts the PANTRY hub (#7)
2026-11-14  🪟 Bring the PANTRY window forward when a link launches the app
```

**The pane beside the chat.** A Claude Code plugin that shows PANTRY in a pane next to the
conversation: the project's Needs you items, the work in flight, and a link into the sidebar mode.
The count also sits in the status line. This is the piece I wanted most, because it puts the board in
the one window I never close. Merged as [tjakoen/pantry#6](https://github.com/tjakoen/pantry/pull/6).

```console
2026-11-14  🧩 Add a Claude Code plugin that shows PANTRY beside the chat (#6)
```

**The public release.** PANTRY was written for exactly one person, and a release has to admit that.
The doctor's checks now come in three tiers. The contract can fail: plans in the right shape, the MCP
server registered. The loop warns with a fix and a link. My own habits, the run reports and the
standards I care about, stay silent unless a project opts in. Someone else should be able to use
PANTRY without inheriting my opinions about commit messages. Merged as
[tjakoen/pantry#5](https://github.com/tjakoen/pantry/pull/5).

```console
2026-11-14  🚀 Prepare PANTRY for a public release, with tiered doctor checks (#5)
```

**The window a session can drive.** This one was not on the list in the morning. Once the app
existed, it seemed silly that a session could only tell me about a plan. So PANTRY got the same
shape GRAIN gives a page: a session asks what it can see, gets back the views and plans with the
moves each one allows, and then makes a move. Ask for a move that does not exist and it is refused,
with the valid ones listed. I tried it the same day. A session asked to show me the plans view, the
window went there, and a second look confirmed it. The try also found a bug: on a project that
proxies a preview, as this site does, the first look failed until a fix landed.

```console
2026-11-14  🧭 Let sessions observe and move the PANTRY window
2026-11-14  🐛 Reach the session door on projects that proxy a preview
```

## What I have not shown

All of the evidence here is mine. One person, a handful of repositories, a few months, and a commit
count I am reading as a usage count, which it only roughly is. I have not watched anyone else set
PANTRY up, and the public release exists precisely to find out what breaks when they do. The clean
install trials ran on my machine under an empty home folder, which is a start and not a second user.
There are no signed downloads yet, so installing the app means building it from source. The hub
has no login item, so it comes up with the first session of the day rather than with the machine.
Windows is untested. And the window still advertises one move, navigate, that it then refuses,
which is exactly the kind of lie the refusal was built to prevent.

The claim that putting PANTRY beside the chat will make me use it is a hypothesis with one strong
piece of support: the parts that already sit in the path of the work, the doctor and the MCP server,
are the parts that got used. The desktop app and the pane are the same bet, and I think the new setup may finally be the answer
to the in-the-way problem. Think, not know. Everything in the last section is a day old. I will know
in a month, and the commit chart will say so whether I like it or not.

## Where it sits now

In July I built a command center, and then I mostly stepped around it. It was not that the board
was wrong. It stood between me and the code, and anything that stands there gets walked past.

Now it walks to me. A session starts, and before it reads a line of code the hub is up and the app
is open. The session asks PANTRY what is next and claims it. The count sits in the menu bar and the
board sits in a pane beside the chat. And when there is a plan I should look at, the session does
not describe it to me. It moves the window to it.

The only step left between me and the board is looking left. I am fairly sure I can manage that one.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
