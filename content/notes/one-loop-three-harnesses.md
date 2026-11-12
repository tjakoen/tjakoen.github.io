---
title: "The Loop Outlives the Model."
audience: build
subtitle: "Three models, one loop: how I use Claude, Codex and DeepSeek at the same time with almost no friction."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-11-08
readingTime: "~11 min"
tags: [ai, workflow, standards, developer-tools, process]
people: [addy-osmani, alfonso-graziano, cole-medin]
sources: [book-beyond-vibe-coding, book-loop-engineering, book-ai-native-engineering]
summary: >
  How I run Claude, Codex and DeepSeek on one shared loop. The public standards are the contract, and
  a private agent-config repo wires them across my machines. Choosing a model is a routing decision,
  not a brand loyalty. The entry plans on Claude and Codex still unlock the top model, so the only
  constraint is the usage allowance, not access. A unified loop is what makes that allowance more
  than enough. This is my setup, a suggestion, not a rule: the same loop fits Gemini, a local model,
  or whatever comes next.
social: |
  I kept running out of Claude in the middle of a task. One day I opened Codex on the same branch
  and finished the work without changing a single instruction. That was the day I stopped thinking
  of the model as the thing I was buying.

  What I needed was a loop that could survive the switch. This piece is how I built it: the public
  standards are the contract, a private agent-config repo wires them across my machines, and the
  model is a route.

  The entry plans still reach the top model. The only constraint is the usage allowance. The loop
  is what makes that allowance enough.
socialImage: "/media/notes/one-loop-three-harnesses-social.png"
socialImageAlt: "One person running Claude Code, Codex and DeepSeek on one loop."
---

## The day one of them ran out

I was all in on Claude. Work introduced me to it, and I liked that Anthropic built for developers
first. I started using it for my personal projects.

The cheapest plan was enough at first. Then the projects grew, and the cheapest plan stopped being
enough. The next step up was a bigger usage window, not a better model; it was more than I needed
and more than I wanted to pay. Claude kept running out on the smallest plan, but I do a lot. I build
things, run projects, grade and research.

So I tried Codex. I had heard good things, and it had a free month. I started using it when Claude
ran out. The first time it happened mid-task, I opened Codex, checked out the same branch, and
finished the work without changing a single instruction. That should have felt like freedom. Instead
it exposed the problem: moving between providers mid-project is not smooth unless something holds
the state. That was the day I stopped thinking of the model as the thing I was buying.

They were good at different things, so I started picking between them per project. Then I was
jumping between them whenever one ran out. I needed a way to switch without losing the thread. That
is how this started.

DeepSeek Harness came later. The price was the first thing anyone mentioned, and I was hesitant
because it is Chinese. Then both Claude and Codex ran out with days to go before the refill. I jumped in. It
fit.

I have three devices, two subscriptions, one usage account, and a private repo for my AI settings.
That is the most 2026 sentence I have written, and two years ago it would have embarrassed me. Now
it is the most honest description of how I work. I still get the top model on the entry plans. What
I am buying is usage, not access. The usage is the cheap part. The loop is the expensive part, and I
built it myself.

This is not a review of Claude, Codex or DeepSeek. It is a report from the room where they meet. It
is also one person's setup, offered as a suggestion. The loop does not care which model is
underneath; Gemini or a local model would fit the same shape.

## The loop was the thing I had not written down

I already wrote the long version of the loop across repositories:
[I Was Shipping Faster Than I Could Understand It](one-loop-every-repo.md). That note carries a
correction. Three weeks after I published it, I found that the doctor had run once in 165 sessions,
because the script could not find its own program from any directory except the one beside it. It
announced itself unavailable and exited quietly. I left the claim and the correction in public
because the gap is the useful part. A loop that is remembered is not a loop. It has to be checked.

<svg viewBox="0 0 600 240" width="100%" role="img"
     aria-label="The public standards, the contract and the map: LOOP, SESSION-LOOP, HOOKS, AI-REPO-STANDARD, CONFORMANCE, VOICE, NOTE-STANDARD and FIGURES. They link to the private repo, the wiring, which holds the settings, checklist, hooks, MCP and machine paths. The link is not a copy."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-contract0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <rect x="15" y="15" width="280" height="200" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <rect x="385" y="15" width="200" height="160" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/>
  <g text-anchor="middle">
    <text x="155" y="48" style="fill:var(--color-bg);font-size:14px">The public standards</text>
    <text x="155" y="66" style="fill:var(--color-bg);font-size:12px;opacity:.8">the contract, the map</text>
    <text x="45" y="100" text-anchor="start" style="fill:var(--color-bg);font-size:12px">LOOP</text>
    <text x="45" y="124" text-anchor="start" style="fill:var(--color-bg);font-size:12px">HOOKS</text>
    <text x="45" y="148" text-anchor="start" style="fill:var(--color-bg);font-size:12px">CONFORMANCE</text>
    <text x="45" y="172" text-anchor="start" style="fill:var(--color-bg);font-size:12px">NOTE-STANDARD</text>
    <text x="165" y="100" text-anchor="start" style="fill:var(--color-bg);font-size:12px">SESSION-LOOP</text>
    <text x="165" y="124" text-anchor="start" style="fill:var(--color-bg);font-size:12px">AI-REPO-STANDARD</text>
    <text x="165" y="148" text-anchor="start" style="fill:var(--color-bg);font-size:12px">VOICE</text>
    <text x="165" y="172" text-anchor="start" style="fill:var(--color-bg);font-size:12px">FIGURES</text>
    <text x="485" y="42" style="fill:var(--color-fg);font-size:14px">The private repo</text>
    <text x="485" y="60" style="fill:var(--color-muted);font-size:12px">the wiring</text>
    <text x="485" y="88" style="fill:var(--color-muted);font-size:12px">settings</text>
    <text x="485" y="106" style="fill:var(--color-muted);font-size:12px">checklist</text>
    <text x="485" y="124" style="fill:var(--color-muted);font-size:12px">hooks</text>
    <text x="485" y="142" style="fill:var(--color-muted);font-size:12px">MCP</text>
    <text x="485" y="160" style="fill:var(--color-muted);font-size:12px">machine paths</text>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="295" y1="100" x2="385" y2="100" marker-end="url(#fl-contract0)"/>
  </g>
  <text x="340" y="88" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">linked</text>
</svg>

*The [public standards](/standards) are the contract I wrote for myself; the private repo is the wiring. The link is not a copy. That distinction is the whole note.*

If you build a loop, write your own standards. Mine are a draft, not a product.

## What the loop actually is

A plan is a markdown file. The board is a window on those files, not a database. Mine is
[PANTRY](/pantry), the orchestrator I built: it reads the plans, shows what is ready, and lets a
session claim a plan and put it back. It writes nothing back.

PANTRY is not required for the loop. A plans folder is enough; it is just what I use.

A session starts by reading the repo and the plan. The doctor runs first: it reads the repo and puts
what is due in front of me. A run leaves a report with the checks it actually ran. A change you can
see leaves a short walkthrough. A person who did not write the change checks it. The human lands it.

The loop is five pieces: one instruction file, one plan, one checklist, one report, and a human
gate. The setup guide has the terminal output and the steps. This note is why I keep it.

<svg viewBox="0 0 600 400" width="100%" role="img"
     aria-label="The loop runs around the front door: plan, session with the checklist first, report, second reader, human, then the next plan. The arrows circle the loop."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-loop0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <rect x="10" y="10" width="580" height="380" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:5 5"/>
  <text x="30" y="34" style="fill:var(--color-muted);font-size:11px">The front door: the rules</text>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="235" y="43" width="130" height="44" rx="6"/>
    <rect x="363" y="136" width="130" height="44" rx="6"/>
    <rect x="314" y="287" width="130" height="44" rx="6"/>
    <rect x="156" y="287" width="130" height="44" rx="6"/>
    <rect x="107" y="136" width="130" height="44" rx="6"/>
  </g>
  <rect x="107" y="136" width="130" height="44" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <path d="M 300 135 A 65 65 0 0 1 361.8 179.9" marker-end="url(#fl-loop0)"/>
    <path d="M 361.8 179.9 A 65 65 0 0 1 338.2 252.6" marker-end="url(#fl-loop0)"/>
    <path d="M 338.2 252.6 A 65 65 0 0 1 261.8 252.6" marker-end="url(#fl-loop0)"/>
    <path d="M 261.8 252.6 A 65 65 0 0 1 238.2 179.9" marker-end="url(#fl-loop0)"/>
    <path d="M 238.2 179.9 A 65 65 0 0 1 300 135" marker-end="url(#fl-loop0)"/>
  </g>
  <g text-anchor="middle">
    <text x="300" y="63" style="fill:var(--color-fg);font-size:14px">Plan</text>
    <text x="300" y="80" style="fill:var(--color-muted);font-size:11px">one markdown file</text>
    <text x="428" y="156" style="fill:var(--color-fg);font-size:14px">Session</text>
    <text x="428" y="173" style="fill:var(--color-muted);font-size:11px">the checklist runs first</text>
    <text x="379" y="307" style="fill:var(--color-fg);font-size:14px">Report</text>
    <text x="379" y="324" style="fill:var(--color-muted);font-size:11px">the checks it ran</text>
    <text x="221" y="307" style="fill:var(--color-fg);font-size:14px">Second reader</text>
    <text x="221" y="324" style="fill:var(--color-muted);font-size:11px">someone else checks</text>
    <text x="172" y="156" style="fill:var(--color-bg);font-size:13px">The human lands it</text>
    <text x="172" y="173" style="fill:var(--color-bg);font-size:11px">the judgment is human</text>
    <text x="300" y="200" style="fill:var(--color-muted);font-size:12px">The loop</text>
  </g>
</svg>

*The loop: a plan, a session with the checklist first, a report, a second reader, and the human who lands it. The front door is the rules around all of it. Then the next plan.*

[The old note](one-loop-every-repo.md) has the long version. The standards are public if you want the
rules rather than my account of them.

## Three harnesses, one standard

The harness was the next gap. Every rule in the loop standards assumes something is running the
hooks, and for a long time I did not say what. Then I started moving between harnesses.

> The loop had to prove it was not the harness.

The word harness has two meanings, and I have used both. In
[Everybody Wants the Agent](build-the-floor.md) it meant the scaffolding around a model: what it
sees, what it may touch, who checks the result. Here I mean the program that runs the session:
Claude Code, Codex, DeepSeek Harness. The loop sits above both. When I say the harness changed, I
mean the program, not the shape of the work.

I use all three. The first two get the loop through a settings file; DeepSeek gets it through a
small plugin. The rules did not change. The guide has the adapter table and the setup.

<svg viewBox="0 0 600 320" width="100%" role="img"
     aria-label="One public standards set feeds one private agent-config repo, which wires the same standard into three machines: a personal laptop, a personal PC and a work laptop. The public part is shared; the private part holds machine settings, not work data."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-devices0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <rect x="90" y="16" width="420" height="50" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="90" y="110" width="420" height="50" rx="6"/>
    <rect x="15" y="250" width="180" height="48" rx="6"/>
    <rect x="210" y="250" width="180" height="48" rx="6"/>
    <rect x="405" y="250" width="180" height="48" rx="6"/>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="300" y1="66" x2="300" y2="110" marker-end="url(#fl-devices0)"/>
    <path d="M300,160 L300,200"/>
    <line x1="105" y1="200" x2="495" y2="200"/>
    <line x1="105" y1="200" x2="105" y2="250" marker-end="url(#fl-devices0)"/>
    <line x1="300" y1="200" x2="300" y2="250" marker-end="url(#fl-devices0)"/>
    <line x1="495" y1="200" x2="495" y2="250" marker-end="url(#fl-devices0)"/>
  </g>
  <g text-anchor="middle">
    <text x="300" y="38" style="fill:var(--color-bg);font-size:14px">The public standards</text>
    <text x="300" y="56" style="fill:var(--color-bg);font-size:12px">one source, published and linked</text>
    <text x="300" y="132" style="fill:var(--color-fg)">The private agent-config</text>
    <text x="300" y="148" style="fill:var(--color-muted);font-size:12px">settings, checklist, hooks, MCP, paths</text>
    <text x="105" y="271" style="fill:var(--color-fg)">Personal laptop</text>
    <text x="105" y="287" style="fill:var(--color-muted);font-size:12px">same standard</text>
    <text x="300" y="271" style="fill:var(--color-fg)">Personal PC</text>
    <text x="300" y="287" style="fill:var(--color-muted);font-size:12px">same standard</text>
    <text x="495" y="271" style="fill:var(--color-fg)">Work laptop</text>
    <text x="495" y="287" style="fill:var(--color-muted);font-size:12px">same standard, separate data</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="300" y="90">one source</text>
    <text x="300" y="184">config, not content</text>
  </g>
</svg>

*One public canon, one private wiring, three machines.*

I use three machines: a personal laptop, a personal PC and a work laptop. The work laptop gets the
same standard and the same config repo because I want one way to code. Work projects stay there;
the personal machines never hold them. The private repo is agent config, not content. Each machine
gets its own settings and its own path to the board. The public standards are one source. The
private repo points at them.

## The model is a routing decision

The loop is portable. The model is the part I rent. I had to unlearn the idea that I was buying a
model.

The entry plan on Claude and Codex is the one I want. The plan is not the model; it is the size of
the window. The entry window is enough. Two entry plans plus the cheap DeepSeek meter are cheaper
and more effective for me than the big plan on one.

I max the allowance out on purpose, so I do not feel like I am wasting money. A fixed window is
predictable, and it forces me to choose the work. An open-ended token meter makes me hesitate, and
hesitation is a tax. DeepSeek is cheap enough that I can meter it, which is why some projects start
there.

I am not going to quote the numbers. The shape is what matters.

The routing is simple. Claude Opus 5.5 on Low for the shape, Medium when the problem earns it. GPT
Sol on Low or Medium for the long build. DeepSeek when the allowances are out, or the experiment is
cheap. A subagent for a wide read with a small answer. The model is a routing decision, not an
identity. The Low and Medium labels are how much thinking budget I give the model, not different
models. The access is the same.

| Work shape | What I reach for | Why |
|---|---|---|
| The shape is still moving, or the bug is hard | Claude Opus 5.5, Low, then Medium when it earns it | The plan is the hard part; a wrong one costs more later |
| The plan is clear and the build is long | GPT Sol, Low or Medium | It holds a long build |
| One allowance is exhausted, or both are, or the experiment is cheap | DeepSeek | The backup, and the cheap experiment |
| A wide read with a small answer | A subagent on any model | It reads wide; I get the short answer |

<svg viewBox="0 0 600 360" width="100%" role="img"
     aria-label="The loop stays at the center. Work routes to Claude Opus 5.5 for an unclear shape or hard coding, to GPT Sol for a large build, to DeepSeek for a backup or a cheap experiment, and to a subagent for a wide read with a small answer."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-route0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="30" y="24" width="200" height="54" rx="6"/>
    <rect x="370" y="24" width="200" height="54" rx="6"/>
    <rect x="30" y="270" width="200" height="54" rx="6"/>
    <rect x="370" y="270" width="200" height="54" rx="6"/>
  </g>
  <rect x="225" y="148" width="150" height="56" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="225" y1="176" x2="130" y2="78" marker-end="url(#fl-route0)"/>
    <line x1="375" y1="176" x2="470" y2="78" marker-end="url(#fl-route0)"/>
    <line x1="225" y1="176" x2="130" y2="270" marker-end="url(#fl-route0)"/>
    <line x1="375" y1="176" x2="470" y2="270" marker-end="url(#fl-route0)"/>
  </g>
  <g text-anchor="middle">
    <text x="130" y="44" style="fill:var(--color-fg)">Claude Opus 5.5</text>
    <text x="130" y="62" style="fill:var(--color-muted);font-size:12px">shape, hard coding, low</text>
    <text x="470" y="44" style="fill:var(--color-fg)">GPT Sol</text>
    <text x="470" y="62" style="fill:var(--color-muted);font-size:12px">large build, low to medium</text>
    <text x="130" y="290" style="fill:var(--color-fg)">DeepSeek</text>
    <text x="130" y="308" style="fill:var(--color-muted);font-size:12px">backup, cheap experiment</text>
    <text x="470" y="290" style="fill:var(--color-fg)">A subagent</text>
    <text x="470" y="308" style="fill:var(--color-muted);font-size:12px">wide reads, small answer</text>
    <text x="300" y="170" style="fill:var(--color-bg);font-size:14px">The loop</text>
    <text x="300" y="188" style="fill:var(--color-bg);font-size:12px">plans, gates, git</text>
  </g>
</svg>

*The model changes with the work. The loop does not.*

I choose an owner model per project. The owner is the one I reach for first, not a lock. I have
pushed one too hard, hit the five-hour or weekly window, and moved the same project to the other
model. The loop is what makes that safe: the work is committed, the main branch is clean, the work
sits on its own branch, and the handoff says what the work is and where it stops. The next model
opens the same repo, not a different project.

That is the part I did not expect. The model switch is not a crisis. It is a Tuesday. The project
does not care which model is typing, as long as the loop is holding the state.

## A week with one to five projects

Outside work I run one to five projects at a time. The big one is the next course platform. Last
semester's native course platform was the proof that the shape works. This one is the proper hosted
platform, and it is the project I would not have started without the loop. I also keep the portfolio
current, revisit old work, and teach as a part-time instructor at the
[School of Computing at Holy Angel University](/teaching).

<svg viewBox="0 0 600 340" width="100%" role="img"
     aria-label="The loop in the center holds five project threads: the course platform, the portfolio, old work, grading at Holy Angel University, and work at Career Team. The loop sends each thread's next step; the head only checks the loop, one thread at a time."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-threads0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="15" y="20" width="105" height="50" rx="6"/>
    <rect x="130" y="20" width="105" height="50" rx="6"/>
    <rect x="245" y="20" width="105" height="50" rx="6"/>
    <rect x="360" y="20" width="105" height="50" rx="6"/>
    <rect x="475" y="20" width="105" height="50" rx="6"/>
    <rect x="225" y="270" width="150" height="44" rx="6"/>
  </g>
  <rect x="225" y="140" width="150" height="56" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="240" y1="140" x2="67.5" y2="70" marker-end="url(#fl-threads0)"/>
    <line x1="270" y1="140" x2="182.5" y2="70" marker-end="url(#fl-threads0)"/>
    <line x1="300" y1="140" x2="297.5" y2="70" marker-end="url(#fl-threads0)"/>
    <line x1="330" y1="140" x2="412.5" y2="70" marker-end="url(#fl-threads0)"/>
    <line x1="360" y1="140" x2="527.5" y2="70" marker-end="url(#fl-threads0)"/>
    <line x1="300" y1="196" x2="300" y2="270" marker-end="url(#fl-threads0)"/>
  </g>
  <g text-anchor="middle">
    <text x="67.5" y="40" style="fill:var(--color-fg);font-size:12px">Course platform</text>
    <text x="67.5" y="57" style="fill:var(--color-muted);font-size:11px">the big one</text>
    <text x="182.5" y="40" style="fill:var(--color-fg);font-size:12px">Portfolio</text>
    <text x="182.5" y="57" style="fill:var(--color-muted);font-size:11px">current</text>
    <text x="297.5" y="40" style="fill:var(--color-fg);font-size:12px">Old work</text>
    <text x="297.5" y="57" style="fill:var(--color-muted);font-size:11px">revisit</text>
    <text x="412.5" y="40" style="fill:var(--color-fg);font-size:12px">Grading</text>
    <text x="412.5" y="57" style="fill:var(--color-muted);font-size:11px">Holy Angel</text>
    <text x="527.5" y="40" style="fill:var(--color-fg);font-size:12px">Work</text>
    <text x="527.5" y="57" style="fill:var(--color-muted);font-size:11px">Career Team</text>
    <text x="300" y="164" style="fill:var(--color-bg);font-size:14px">The loop</text>
    <text x="300" y="182" style="fill:var(--color-bg);font-size:12px">plans, gates, git</text>
    <text x="300" y="290" style="fill:var(--color-fg);font-size:13px">My head</text>
    <text x="300" y="306" style="fill:var(--color-muted);font-size:11px">one thread at a time</text>
  </g>
  <text x="310" y="240" style="fill:var(--color-muted);font-size:12px">I check</text>
</svg>

*The loop is what makes that many threads possible without pretending I can hold them all in my head.*

It is good enough that when an idea arrives, I
can hand it off and go do something else. That is the part that changed my week, not the model.
None of this is a flex about volume. I do a lot with AI because the loop makes the volume safe to
carry.

At [Career Team](/leading) I use the company's Claude and Codex with the same loop, for management work and
technical work. The work laptop is on company accounts. The hardcoded rules keep the work data out
of the personal setup. The config is a standard, not a copy of the work.

Grading is the same split. The loop handles the mechanics; the judgment stays mine. No student data
goes into the public repo, and no student data goes into a service I would not trust with it.

## The line I do not cross

The privacy question is not one question. I work from home, so the work laptop sits in the same room
as the personal machines. The separation is the machine and the account, not the room. On the work
laptop, I use the company's Claude and Codex. Work projects stay on the work laptop and in the
company accounts; they do not move to the personal machines. Personal projects stay on the personal machines; they do not go into the company accounts. The work
devices have security built in that would flag or block a personal project before it got far. The
private repo is agent config, not content.
That separation is not a disclaimer. It is the thing that lets me use the same loop for work and for
personal projects without lying about which is which.

DeepSeek is a Chinese service, so the data is under a different jurisdiction. I use it for work that
is already public or disposable, and for experiments where the cost matters. I do not use it for
student data, employer code, or anything private. I build in the open, so the public part is public
by design. That is the trade I make, and it is not one I would make for data that is not mine to
publish.

Local models: I would like one, but the math does not work yet. The token volume I would need to pay
off the hardware is large, and a coding model that is worse than the paid one is not worth the desk
space. I will wait for a consumer GPU that reaches the current frontier, something like Opus 5.5,
hopefully in a year or two. That is a hope, not a forecast. When it happens, the loop will not care
which model is underneath.

## What I have not solved

The loop is finished enough for me. DeepSeek has no stop signal I can catch, so the close check
fills the gap. It reads the session log, scopes the dirty paths to this session, and says whether the
session can be archived. The next session's start checks the tree. The nudge is the reminder, the
close is the check, and I run the end command anyway.

Each new harness needs a small adapter, and I will have to write one when the next one arrives. The
private config is one point of failure: if it breaks, all three machines break. It is not three
drifting copies. link-machine.sh links each machine to the same config, and the checklist catches a
machine that has slipped. The drift is a failing row, not a slow surprise.

The checklist can prove the loop loaded. It cannot prove the work is good. The second reader is still
the thing that catches the work.

This is one person's setup, not a study. Tool preference is not evidence. The standards name the
capability, not the vendor, because the vendor will change. The test is whether the loop still runs
when it does.

## The sources

The people whose work this builds on are on the [reading page](/reading):
[Addy Osmani](/people#addy-osmani) for the loop and the comprehension-debt warning,
[Alfonso Graziano](/people#alfonso-graziano) for writing down what I meant, and
[Cole Medin](/people#cole-medin) for the project as one artifact. The standards are public; the
guide has the links.

## The part I keep

The setup is its own note: [Set Up the Loop With One Prompt](loop-setup.md). The story is why;
the guide is how.

The plans will change. The models will change. One day the model might run on the desk. The
loop is the part I keep: the plan, the gate, the evidence, the human who lands it. The model is the
part I rent.

That is the whole bet. I am not loyal to a model. I am loyal to the loop that lets me switch.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
