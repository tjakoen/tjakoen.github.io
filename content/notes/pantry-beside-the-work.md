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
readingTime: "~9 min"
tags: [ai, stack, tooling]
summary: >
  PANTRY is my local command center for AI coding sessions: a plan board, claims and heartbeats so
  two sessions never take the same work, a doctor that checks the loop, and an MCP server agents
  call. I built it in July and barely used it, because it felt in the way. It was a web app I had to spin up by
  hand in every project and nothing in my day ever made me do that. The fix was not a better board.
  It was an always-on hub, then a dashboard, a desktop app and a pane beside the chat, so PANTRY is
  already open when the work starts. Parts of that are still landing, and the evidence is one
  person's use.
---

I have to be honest about PANTRY. I built it, I wrote about it, and I barely used it. Most days it
just felt like it was in the way.

It was not broken. It was one more thing between me and the work. It lived in a sibling folder, it came up with a command I had to remember, and it served one project
on one port until I closed the terminal. Every session I opened with Claude went straight to the
code, because the code was right there, and the board that was supposed to tell that session what to
do sat in a folder I had not opened in days.

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
Codex doing most of the typing, and none of those sessions remembers the last one. They need
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

One day, eighteen commits, and it is the day PANTRY started working. The hub is one container that
serves every project at once, so there is nothing to start and no port to remember. And the agents
stopped needing me to open the board, because the board came to them. A session now calls PANTRY
over MCP before it does anything: it reads an orientation brief, asks what is next, claims a plan so
no other session takes it, and heartbeats while it works. A claim that goes quiet for thirty
minutes expires and the plan goes back on the board.

That is the whole point of PANTRY, and it took me four months to say it plainly. It is not a
dashboard for me to admire. It is the place where my sessions and I agree on what is being done and
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
a browser tab. So I asked whether I should drop the web app and use Obsidian, which I
already keep open. The answer was no: Obsidian would show the plan files, but it would not know about
claims, heartbeats or a session that died halfway through. What I wanted was not a different tool. I
wanted PANTRY to feel like a workspace, the thing that is open next to the work rather than a
destination.

That turned into four pieces of work, run as four sessions at once, coordinated through PANTRY
itself.

> PANTRY only works if it is already open when the work starts. Everything since November is that
> one sentence.

**The dashboard.** Needs you moved to the front first. Then the top bar became a sidebar of projects
with their worktrees folded underneath, a preview pane, and a narrow sidebar mode built for living in
a strip down the edge of the screen. That merged as [tjakoen/pantry#4](https://github.com/tjakoen/pantry/pull/4).

```console
2026-11-14  💄 Move PANTRY to a sidebar layout with Needs you first
2026-11-14  📊 Make the command center a dashboard, with a sidebar mode (#4)
```

**The desktop app.** A Tauri shell, picked over Electron because it uses the system webview instead
of shipping its own browser, so it costs a window rather than a gigabyte. It finds the hub by itself,
shows an offline page with a Start button when the hub is down, and keeps the Needs you count in the
menu bar. Alongside it, two commands: one that makes sure the hub is running and returns at once if
it already is, and one that brings the app forward on a project. Sessions call the first at startup,
so the hub is up before anyone thinks about it. This one is still landing. The shell is written and
the commit says, honestly, that it has not been built yet.

```console
2026-11-14  ✨ Add pantry hub ensure, a richer health endpoint and pantry open
2026-11-14  🚧 Add the Tauri shell for the PANTRY desktop app, not yet built
```

**The pane beside the chat.** A Claude Code plugin that shows PANTRY in a pane next to the
conversation: the project's Needs you items, the work in flight, and a link into the sidebar mode.
The count also sits in the status line. This is the piece I wanted most, because it puts the board in
the one window I never close. It is on a branch and not merged.

```console
2026-11-14  🧩 Add a Claude Code plugin that shows PANTRY beside the chat
```

**The public release.** PANTRY was written for exactly one person, and a release has to admit that.
The doctor's checks now come in three tiers. The contract can fail: plans in the right shape, the MCP
server registered. The loop warns with a fix and a link. My own habits, the run reports and the
standards I care about, stay silent unless a project opts in. Someone else should be able to use
PANTRY without inheriting my opinions about commit messages. Also on a branch, also not merged.

```console
2026-11-14  🚀 Prepare PANTRY for a public release, with tiered doctor checks
```

## What I have not shown

All of the evidence here is mine. One person, a handful of repositories, a few months, and a commit
count I am reading as a usage count, which it only roughly is. I have not watched anyone else set
PANTRY up, and the public release exists precisely to find out what breaks when they do. The clean
install trials in that branch ran on my machine under an empty home folder, which is a start and not
a second user.

The claim that putting PANTRY beside the chat will make me use it is a hypothesis with one strong
piece of support: the parts that already sit in the path of the work, the doctor and the MCP server,
are the parts that got used. The desktop app and the pane are the same bet. I will know in a month,
and the commit chart will say so whether I like it or not.

The note itself stays a draft until the app is built and the release is out.

## Where it sits now

In July I built a command center, and then I mostly stepped around it. It was not that the board
was wrong. It stood between me and the code, and anything that stands there gets walked past.

Now it is meant to walk to me. The agents already ask it before they start. If the app and the pane
land the way the branches say, the count will sit in the menu bar and the board will sit beside the
chat, and the only step left between me and it will be looking left.

I am fairly sure I can manage that one.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
