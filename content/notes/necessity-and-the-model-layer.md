---
title: "Necessity Is the Mother of Innovation"
audience: [learn, build]
level: intro
subtitle: "I ran out of AI usage with hours still on the clock, refused to pay for the next tier, and ended up building a layer that chooses the model for me."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-23
readingTime: "~7 min"
tags: [ai, workflow, tokenomics]
summary: >
  I ran out of Claude and Codex usage in the middle of a task and would not pay for the next tier up. So
  I built a Model Intelligence Layer: one free model and a small monthly plan take the light work, Opus and
  Sol keep the planning, a fallback order handles the day a model says no, an approval I type guards the
  one paid route, and hard guards keep every non-private model away from anything that is not mine. This is
  the short version of why, and what changed, and it says plainly what is still ahead. The technical note
  shows how it works.
social: |
  I spent my Codex usage with four hours left on the five-hour refresh. I was in the zone and did not
  want to stop. The next tier up felt like too much pressure to maximize, so I built a layer instead.

  It picks the model for me. Opus and Sol keep the planning and review. Light work goes to one free
  model, then a small monthly plan, then the plan I already pay for. The paid API waits for an approval
  I type.

  So it never stalls, it never overspends, and it never leaks private code: no model that may keep
  a prompt ever touches a work machine or a work repository.

  Necessity, mother of innovation. The story is in the note, with a technical companion for anyone who
  wants to build their own.
socialImage:
  - "/media/notes/model-layer-architecture.gif"
  - "/media/notes/model-layer-infographic.gif"
socialImageAlt:
  - "An animated diagram of the whole stack, from me through the loop, the Model Intelligence Layer, the harnesses and the models by role, with Opus and Sol for planning and review, down to PANTRY. A numbered caption follows one request: the registry gives it a tier, the free model is out for today, so OpenCode Go takes it, while private repositories stay on Claude and Codex and the paid API waits for my typed yes. PANTRY logs the call. The tagline reads: never stalls, never overspends, never leaks private code."
  - "Six cards titled 6 rules behind how my agents pick a model, and who pays: tiers, not models; one free model, then Go; paid only on a typed yes; four at a time; recover, don't stall; and checked every session. Each card's small diagram plays on a loop, and a banner reads: spend free and flat-rate first; real money only on a typed yes."
---

I spent my Codex usage and still had four hours to go before the five-hour refresh. I was in the zone. I did not want to stop.

The Claude weekly limit had already put me three days from a refresh, and Codex was halfway out with six days left on its own. I do a lot of work with AI, and once again I ran out. I did not want to spend more. The $100 plans feel like too much pressure to maximize, because paying that much turns every idle evening into a small failure to use what I bought.

So I did what I usually do when something annoys me enough. I built infrastructure.

> This continues [The Loop Outlives the Model](one-loop-three-harnesses.md), where I explained bringing DeepSeek in when both plans ran out. This is the short story of what came next. [How the Model Intelligence Layer Works](how-the-model-layer-works.md) is the technical one.

## The night I went looking for a way out

The first thing I tried was running a model on my own machine. I have an RTX 3050 with 8 GB of memory. It runs small models fine and runs the ones I would want for coding badly, and a coding model that is worse than the one I am paying for is not a saving, it is a hobby. I put that idea back on the shelf for a year or two.

The second thing was free models online. They exist, they are better than I expected, and the catch is printed on the label: a free endpoint may keep whatever you send it. I decided I could accept that trade for my own projects, where the code is public anyway, and for nothing else. That decision is the most important one in this note, and most of what I built exists to enforce it.

None of this was a new idea about the work. I already handed light work down from Sonnet to Haiku before I built any of it, so the strong plan was never doing everything. The free models are one more rung on that same ladder, at the cheap end. What is new is that the rung costs nothing and the ladder now crosses providers.

<svg viewBox="0 0 620 290" width="100%" role="img"
     aria-label="Two lanes. In the top lane, Opus runs the main session: it plans, then sends a short brief to each of two Sonnet subagents in the bottom lane. Each subagent reads its files and does the typing inside its own context, so those files never enter the main session. Only the result travels back up to Opus, which reviews it against the plan: a miss is sent back to planning as a new brief, and a pass is done. The main context stays small because the file reading happens below."
     style="display:block;width:100%;max-width:620px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-planbig0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:4 4">
    <rect x="6" y="28" width="608" height="64" rx="8"/>
    <rect x="6" y="150" width="608" height="134" rx="8"/>
  </g>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="42" width="110" height="36" rx="6"/>
    <rect x="360" y="42" width="150" height="36" rx="6"/>
    <rect x="150" y="166" width="100" height="100" rx="6"/>
    <rect x="270" y="166" width="100" height="100" rx="6"/>
  </g>
  <g style="fill:none;stroke:var(--color-muted);stroke-width:1"><rect x="172" y="214" width="14" height="18" rx="2"/><rect x="192" y="214" width="14" height="18" rx="2"/><rect x="212" y="214" width="14" height="18" rx="2"/><rect x="292" y="214" width="14" height="18" rx="2"/><rect x="312" y="214" width="14" height="18" rx="2"/><rect x="332" y="214" width="14" height="18" rx="2"/></g>
  <rect x="528" y="42" width="72" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <path d="M60,78 C60,130 180,118 180,162" marker-end="url(#fl-planbig0)"/>
    <path d="M90,78 C90,128 300,112 300,162" marker-end="url(#fl-planbig0)"/>
    <path d="M225,166 C225,120 410,128 410,82" marker-end="url(#fl-planbig0)"/>
    <path d="M345,166 C345,130 440,128 440,82" marker-end="url(#fl-planbig0)"/>
    <line x1="510" y1="60" x2="524" y2="60" marker-end="url(#fl-planbig0)"/>
    <path d="M400,42 C400,4 75,4 75,38" marker-end="url(#fl-planbig0)"/>
  </g>
  <g text-anchor="middle">
    <text x="75" y="64.3" style="fill:var(--color-fg)">Opus plans</text>
    <text x="435" y="64.3" style="fill:var(--color-fg)">Opus reviews</text>
    <text x="564" y="64.3" style="fill:var(--color-bg)">Done</text>
    <text x="200" y="196" style="fill:var(--color-fg)">Sonnet</text>
    <text x="320" y="196" style="fill:var(--color-fg)">Sonnet</text>
    <text x="200" y="254" style="fill:var(--color-muted);font-size:11.5px">reads, types</text>
    <text x="320" y="254" style="fill:var(--color-muted);font-size:11.5px">reads, types</text>
  </g>
  <g style="fill:var(--color-muted);font-size:11.5px">
    <text x="190" y="110" style="stroke:var(--color-bg);stroke-width:3;paint-order:stroke">main session: its context stays small</text>
    <text x="390" y="230">subagents: the files they</text><text x="390" y="246">read stay down here</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="118" y="132">brief</text>
    <text x="470" y="132">result only</text>
    <text x="238" y="16">sent back</text>
  </g>
</svg>

*The split from [Plan Big, Type Small](plan-big-type-small.md): Opus plans and reviews, the smaller model types in between, and the files it reads stay down there. The layer only makes the bottom lane cheaper.*

## The old setup and the new one

Before this, Claude Code was my main tool, the Codex app was the backup and the way I ran a second project, and DeepSeek Harness, which I call DSH, was the last fallback when both plans were out. Making those three work together is what [The Loop Outlives the Model](one-loop-three-harnesses.md) was about, so I will not retell it. Here they are side by side with where each role sits now.

<!-- compare:setup -->
<svg viewBox="0 0 640 431" width="100%" role="img" aria-label="My setup before and now, side by side, by role. Main tool: Claude Code before, and Claude Code still, when I want Claude. Second tool: the Codex app before, as the backup and for a parallel project, and now OpenCode, which does all coding outside Claude with the Codex plan, a free model, a small monthly plan and the DeepSeek API plugged in. Last fallback: DeepSeek Harness before, and now deleted. Non-coding work: whichever app was open before, and now the Codex app, for the ChatGPT side and anything at work. Who picks the model: me, by hand, before, and now the Model Intelligence Layer." style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif"><text x="259" y="26" text-anchor="middle" style="fill:var(--color-muted);font-size:12px;letter-spacing:2px">BEFORE</text><text x="503" y="26" text-anchor="middle" style="fill:var(--color-muted);font-size:12px;letter-spacing:2px">NOW</text><text x="124" y="71.5" text-anchor="end" style="fill:var(--color-muted);font-size:12.5px">Main tool</text><rect x="142" y="40" width="234" height="55" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="259" y="64" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">Claude Code</text><text x="259" y="82" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">my main tool</text><rect x="386" y="40" width="234" height="55" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="503" y="64" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">Claude Code</text><text x="503" y="82" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">still, when I want Claude</text><text x="124" y="151.5" text-anchor="end" style="fill:var(--color-muted);font-size:12.5px">Second tool</text><rect x="142" y="105" width="234" height="85" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="259" y="136.5" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">Codex app</text><text x="259" y="154.5" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">backup, and a second</text><text x="259" y="169.5" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">project in parallel</text><rect x="386" y="105" width="234" height="85" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="503" y="129" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">OpenCode</text><text x="503" y="147" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">all coding outside Claude:</text><text x="503" y="162" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">Codex plan, a free model,</text><text x="503" y="177" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">a small plan, DeepSeek API</text><text x="124" y="231.5" text-anchor="end" style="fill:var(--color-muted);font-size:12.5px">Last fallback</text><rect x="142" y="200" width="234" height="55" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="259" y="224" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">DeepSeek Harness</text><text x="259" y="242" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">when both plans ran out</text><rect x="386" y="200" width="234" height="55" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:5 4"/><text x="503" y="224" text-anchor="middle" style="fill:var(--color-muted);font-size:13.5px">Deleted</text><text x="503" y="242" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">one app fewer</text><text x="124" y="304" text-anchor="end" style="fill:var(--color-muted);font-size:12.5px">Non-coding work</text><rect x="142" y="265" width="234" height="70" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:5 4"/><text x="259" y="304" text-anchor="middle" style="fill:var(--color-muted);font-size:13.5px">Whichever was open</text><rect x="386" y="265" width="234" height="70" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="503" y="289" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">Codex app</text><text x="503" y="307" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">the ChatGPT side,</text><text x="503" y="322" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">and anything at work</text><text x="124" y="384" text-anchor="end" style="fill:var(--color-muted);font-size:12.5px">Picks the model</text><rect x="142" y="345" width="234" height="70" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="259" y="376.5" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">Me, by hand</text><text x="259" y="394.5" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">when something ran out</text><rect x="386" y="345" width="234" height="70" rx="8" style="fill:none;stroke:var(--color-fg);stroke-width:2.2"/><text x="503" y="369" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">The layer</text><text x="503" y="387" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">registry, route check,</text><text x="503" y="402" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">guards</text></svg>
<!-- /compare:setup -->

*The same five roles, before and now. The heavy outline is the change that matters.*

The new shape has fewer programs and one decision-maker. A few things about it.

- Claude Code is still where I work when I want Claude.
- OpenCode does all my coding outside Claude. Codex usage, a free model, a small monthly plan and the DeepSeek API all plug into it directly.
- Claude cannot plug into OpenCode. In my testing, Anthropic only lets a third-party harness in through an API token, which is billed on its own and not tied to the five-hour or weekly usage of a plan. Codex lets its plan in directly. I am fine with that, because Claude Code is a good harness and I was always going to use it for Claude.
- I deleted the DSH app. Fewer apps is a feature.
- I kept the Codex app, but for work that is not coding: the ChatGPT side, and anything at work.

The decision-maker is the thing I am calling a Model Intelligence Layer.

## What a Model Intelligence Layer does

**It owns four decisions: which model plays which role, whether that choice was obeyed, what happens when the model runs out, and what the run cost and where the prompt went.** I did not want to make those four decisions tired, so I wrote them down once and let hooks enforce them.

<!-- stack:parts -->
<svg viewBox="0 0 640 714" width="100%" role="img" aria-label="Every part of the layer, top to bottom. I make the requests and approvals. Under me the loop holds public standards, plans, independent review and human gates. Under the loop the Model Intelligence Layer has five parts: the registry of model ids, tiers and roles; the model guard that restarts a session on the wrong model; the route check that picks a model with cooldowns and repository clearance; the work guard that allows only a company account at work; and the usage record, one line per session. Under the layer are three harnesses: Claude Code, which the model guard and the work guard cover; OpenCode, which the route check and the launch gate cover; and the Codex app, which the work guard covers. Under the harnesses are the models by role: Opus and Sol, private, for planning and review; Luna, private, for light work; the free model and Go for light work, which may keep prompts; and the DeepSeek API, only on my yes, which may keep prompts too. The usage record feeds PANTRY, which keeps the shared state." style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif"><rect x="20" y="14" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Me</text><text x="320" y="54" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Requests and approvals</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="70" x2="320" y2="92"/><path d="M316,86 L320,92 L324,86"/><path d="M316,76 L320,70 L324,76"/></g><rect x="20" y="96" width="600" height="78" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><a href="/notes/loop-setup"><title>The loop: read more</title><text x="320" y="118" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px;text-decoration:underline;text-decoration-color:var(--color-muted)">The loop</text></a><a href="/standards"><title>Public standards: read more</title><rect x="32" y="122" width="136.5" height="30" rx="6" style="fill:transparent;stroke:var(--color-line);stroke-width:1"/><text x="100.25" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px;text-decoration:underline;text-decoration-color:var(--color-muted)">Public standards</text></a><a href="/notes/plan-big-type-small"><title>Plans: read more</title><rect x="178.5" y="122" width="136.5" height="30" rx="6" style="fill:transparent;stroke:var(--color-line);stroke-width:1"/><text x="246.75" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px;text-decoration:underline;text-decoration-color:var(--color-muted)">Plans</text></a><a href="/drafts/same-reviewer-twice"><title>Independent review: read more</title><rect x="325" y="122" width="136.5" height="30" rx="6" style="fill:transparent;stroke:var(--color-line);stroke-width:1"/><text x="393.25" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px;text-decoration:underline;text-decoration-color:var(--color-muted)">Independent review</text></a><rect x="471.5" y="122" width="136.5" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="539.75" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Human gates</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="178" x2="320" y2="200"/><path d="M316,194 L320,200 L324,194"/><path d="M316,184 L320,178 L324,184"/></g><rect x="20" y="204" width="600" height="110" rx="8" style="fill:none;stroke:var(--color-fg);stroke-width:2.2"/><text x="320" y="226" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">The Model Intelligence Layer</text><rect x="32" y="230" width="107.2" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="85.6" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Registry</text><text x="85.6" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">model ids,</text><text x="85.6" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">tiers, roles</text><rect x="149.2" y="230" width="107.2" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="202.79999999999998" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Model guard</text><text x="202.79999999999998" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">wrong model</text><text x="202.79999999999998" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">restarts</text><rect x="266.4" y="230" width="107.2" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Route check</text><text x="320" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">order, cooldowns,</text><text x="320" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">clearance</text><rect x="383.6" y="230" width="107.2" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="437.20000000000005" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Work guard</text><text x="437.20000000000005" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">company account</text><text x="437.20000000000005" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">only at work</text><rect x="500.8" y="230" width="107.2" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="554.4" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Usage record</text><text x="554.4" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">one line per</text><text x="554.4" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">session</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="318" x2="320" y2="340"/><path d="M316,334 L320,340 L324,334"/><path d="M316,324 L320,318 L324,324"/></g><rect x="20" y="344" width="600" height="110" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><a href="/notes/one-loop-three-harnesses"><title>Harnesses, and which parts cover them: read more</title><text x="320" y="366" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px;text-decoration:underline;text-decoration-color:var(--color-muted)">Harnesses, and which parts cover them</text></a><rect x="32" y="370" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="124.66666666666667" y="390" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Claude Code</text><text x="124.66666666666667" y="408" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">model guard,</text><text x="124.66666666666667" y="423" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">work guard</text><rect x="227.33333333333334" y="370" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="390" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">OpenCode</text><text x="320" y="408" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">route check,</text><text x="320" y="423" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">launch gate</text><rect x="422.6666666666667" y="370" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="515.3333333333334" y="390" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Codex app</text><text x="515.3333333333334" y="408" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">work guard</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="458" x2="320" y2="480"/><path d="M316,474 L320,480 L324,474"/><path d="M316,464 L320,458 L324,464"/></g><rect x="20" y="484" width="600" height="110" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="506" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Models, by role</text><rect x="32" y="510" width="136.5" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="100.25" y="530" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Opus · Sol</text><text x="100.25" y="548" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">planning, review,</text><text x="100.25" y="563" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">private</text><rect x="178.5" y="510" width="136.5" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="246.75" y="530" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Luna</text><text x="246.75" y="548" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">light work,</text><text x="246.75" y="563" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">private</text><rect x="325" y="510" width="136.5" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="393.25" y="530" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Free and Go</text><text x="393.25" y="548" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">light work,</text><text x="393.25" y="563" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">keep prompts</text><rect x="471.5" y="510" width="136.5" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="539.75" y="530" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">DeepSeek API</text><text x="539.75" y="548" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">only on my yes,</text><text x="539.75" y="563" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">keeps prompts</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="598" x2="320" y2="620"/><path d="M316,614 L320,620 L324,614"/><path d="M316,604 L320,598 L324,604"/></g><line x1="20" y1="624" x2="620" y2="624" style="stroke:var(--color-line);stroke-width:1"/><a href="/drafts/pantry-beside-the-work"><title>PANTRY: read more</title><text x="24" y="648" style="fill:var(--color-fg);font-size:14px;text-decoration:underline;text-decoration-color:var(--color-muted)">PANTRY</text></a><text x="24" y="668" style="fill:var(--color-muted);font-size:12px">Reads the usage records, free and paid kept apart.</text><text x="24" y="684" style="fill:var(--color-muted);font-size:12px">Shared state that any session can read.</text></svg>
<!-- /stack:parts -->

*Every part, top to bottom. Each layer has its own note: [the loop](loop-setup.md) and its [standards](/standards), [plans](plan-big-type-small.md) and [independent review](same-reviewer-twice.md); [the three harnesses](one-loop-three-harnesses.md); and [PANTRY](pantry-beside-the-work.md), which keeps the record. The underlined boxes link to them too.*

In plain words, here is how it behaves.

Planning and review stay on the strong models, Opus on Claude and Sol on Codex, because that is where judgment pays for itself. Everything lighter goes down a fixed order: one free model first, then the same model on a small monthly plan, then the Codex plan I have already paid for. The paid DeepSeek API is not in that order at all. It is an escalation, and it runs only after I type an approval in a terminal. Before it picks Go, it reads how much of Go's allowance is left and skips it when a limit is reached. When a model says no anyway, the layer cools it down and picks the next one, and a main session that runs out moves to Go on its own before it would ever ask me about the paid route. If a session starts on the wrong model, it stops before doing any work and offers me a restart. Every session and subagent leaves one record of what it used, and my desk, PANTRY, shows free and paid apart.

<!-- diagram:delegate -->
<figure class="diagram" data-diagram="flow">
  <div class="diagram__bar" role="toolbar" aria-label="Diagram controls">
    <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
    <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
    <button type="button" data-zoom="reset">Fit</button>
    <span class="diagram__hint">Scroll or pinch to zoom, drag to pan, hover to trace, click to open.</span>
  </div>
  <svg class="diagram__svg" viewBox="0 0 555 740" data-w="555" data-h="740" role="img" aria-label="How a piece of work is delegated. When the next piece needs judgment, such as planning, architecture or review, the main session hands it to a subagent on the strong tier, Opus or Sol, with the plan and the files it links. When the piece is light and bounded, such as a search, a read or a small edit, it goes to a subagent down the light chain. Anything else stays in the main session. Either way one answer comes back, and the main session keeps its conversation and its cache." xmlns="http://www.w3.org/2000/svg"><defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs><g class="dg-edges"><g class="dg-edge" data-edge="start-judge" data-ends="start judge"><title>start-judge</title><path class="dg-line" d="M277.5,78 L277.5,174" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M277.5,78 L277.5,174"/></g><g class="dg-edge" data-edge="judge-strong" data-ends="judge strong"><title>Planning, architecture or review</title><path class="dg-line" d="M253.35808580858085,241.66006600660066 L157.03488372093022,360" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M253.35808580858085,241.66006600660066 L157.03488372093022,360"/></g><g class="dg-edge" data-edge="judge-light" data-ends="judge light"><title>no</title><path class="dg-line" d="M301.30410022779046,241.7767653758542 L391.19589977220954,354.2232346241458" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M301.30410022779046,241.7767653758542 L391.19589977220954,354.2232346241458"/></g><g class="dg-edge" data-edge="light-chain" data-ends="light chain"><title>A search, a read or a small edit</title><path class="dg-line" d="M374.69487076665087,408.07640990120666 L190.67721518987344,518" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M374.69487076665087,408.07640990120666 L190.67721518987344,518"/></g><g class="dg-edge" data-edge="light-main" data-ends="light main"><title>no</title><path class="dg-line" d="M416.54138537470925,421.4675214160095 L420.5126582278481,518" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M416.54138537470925,421.4675214160095 L420.5126582278481,518"/></g><g class="dg-edge" data-edge="strong-back" data-ends="strong back"><title>strong-back</title><path class="dg-line" d="M148.62582781456953,408 L266.37417218543044,662" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M148.62582781456953,408 L266.37417218543044,662"/></g><g class="dg-edge" data-edge="chain-back" data-ends="chain back"><title>chain-back</title><path class="dg-line" d="M171.66666666666666,566 L256.3333333333333,662" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M171.66666666666666,566 L256.3333333333333,662"/></g></g><g class="dg-nodes"><g class="dg-node dg-k-start" data-node="start"><title>The next piece of work</title><rect class="dg-box" x="187.5" y="30" width="180" height="48" rx="24"/><text class="dg-title" x="277.5" y="59" text-anchor="middle">The next piece of work</text></g><g class="dg-node dg-k-decision" data-node="judge"><title>Needs judgment?</title><path class="dg-box" d="M277.5,174 L387.5,212 L277.5,250 L167.5,212 z"/><text class="dg-title" x="277.5" y="217" text-anchor="middle">Needs judgment?</text></g><g class="dg-node dg-k-action" data-node="strong"><title>Strong subagent: Opus or Sol</title><rect class="dg-box" x="30" y="360" width="215" height="48" rx="6"/><text class="dg-title" x="137.5" y="389" text-anchor="middle">Strong subagent: Opus or Sol</text></g><g class="dg-node dg-k-decision" data-node="light"><title>Light and bounded?</title><path class="dg-box" d="M415,346 L525,384 L415,422 L305,384 z"/><text class="dg-title" x="415" y="389" text-anchor="middle">Light and bounded?</text></g><g class="dg-node dg-k-action" data-node="chain"><title>Light subagent, down the chain</title><rect class="dg-box" x="36.5" y="518" width="228" height="48" rx="6"/><text class="dg-title" x="150.5" y="547" text-anchor="middle">Light subagent, down the chain</text></g><g class="dg-node dg-k-end" data-node="main"><title>Stays in the main session</title><rect class="dg-box dg-heavy" x="324.5" y="518" width="194" height="48" rx="24"/><text class="dg-title" x="421.5" y="547" text-anchor="middle">Stays in the main session</text></g><g class="dg-node dg-k-end" data-node="back"><title>One answer comes back</title><rect class="dg-box dg-heavy" x="187.5" y="662" width="180" height="48" rx="24"/><text class="dg-title" x="277.5" y="691" text-anchor="middle">One answer comes back</text></g></g><g class="dg-labels"><g class="dg-elabel"><rect x="188.69648476475555" y="291.83003300330034" width="33" height="18" rx="3"/><text x="205.19648476475555" y="304.83003300330034" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="333.25" y="289" width="26" height="18" rx="3"/><text x="346.25" y="302" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="266.18604297826215" y="454.03820495060336" width="33" height="18" rx="3"/><text x="282.68604297826215" y="467.03820495060336" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="405.5270218012787" y="460.73376070800475" width="26" height="18" rx="3"/><text x="418.5270218012787" y="473.73376070800475" text-anchor="middle">no</text></g></g></svg>
</figure>
<!-- /diagram:delegate -->

*Plan big, type small. Judgment goes up to Opus and Sol, bounded typing goes down the chain, and the main session keeps its place. [Plan Big, Type Small](plan-big-type-small.md) is the habit this makes automatic.*

<div class="live-fig live-fig--pick" data-live-figure="pick" data-surface="figure:pick">
<table class="pick-static">
<caption>How the router picks a model for light work. Planning and review never enter this chain; they stay on Opus and Sol.</caption>
<thead><tr><th scope="col">Request</th><th scope="col">Free model</th><th scope="col">OpenCode Go</th><th scope="col">Luna</th><th scope="col">DeepSeek API</th><th scope="col">Outcome</th></tr></thead>
<tbody>
<tr><th scope="row">The free model is out</th><td>out for today</td><td>takes it</td><td></td><td></td><td>Never stalls</td></tr>
<tr><th scope="row">A private repository</th><td>skipped: keeps prompts</td><td>skipped: keeps prompts</td><td>takes it</td><td></td><td>Never leaks</td></tr>
<tr><th scope="row">It needs the paid model</th><td></td><td></td><td></td><td>waits for my typed yes</td><td>Never overspends</td></tr>
</tbody>
</table>
</div>

*Pick a request to see how the router decides. The paid API is never in the chain; it waits for my typed yes.*

<!-- stack:ladder -->
<svg viewBox="0 0 640 134" width="100%" role="img" aria-label="The order for light work. First DeepSeek V4.1 Flash Free, the one free model, since the free models share one daily message cap. Second the same model on the OpenCode Go plan, a small monthly plan with one shared allowance. Third the Codex models, Luna and then Sol at low effort, while the Codex plan has usage left. Fourth, when none is left, the route check stops and asks me. The paid DeepSeek API is never in this order. It is an escalation that needs an approval I type in a terminal." style="display:block;width:100%;max-width:640px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif"><rect x="20" y="14" width="133.5" height="66" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="86.75" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">1. Free model</text><text x="86.75" y="56" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">DeepSeek Flash Free,</text><text x="86.75" y="72" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">one shared daily cap</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="156.5" y1="47" x2="172.5" y2="47"/><path d="M166.5,43 L172.5,47 L166.5,51"/></g><rect x="175.5" y="14" width="133.5" height="66" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="242.25" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">2. OpenCode Go</text><text x="242.25" y="56" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">the same model on</text><text x="242.25" y="72" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">a small monthly plan</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="312" y1="47" x2="328" y2="47"/><path d="M322,43 L328,47 L322,51"/></g><rect x="331" y="14" width="133.5" height="66" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="397.75" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">3. Codex models</text><text x="397.75" y="56" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">Luna, then Sol,</text><text x="397.75" y="72" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">on my Codex plan</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="467.5" y1="47" x2="483.5" y2="47"/><path d="M477.5,43 L483.5,47 L477.5,51"/></g><rect x="486.5" y="14" width="133.5" height="66" rx="8" style="fill:none;stroke:var(--color-fg);stroke-width:2.2"/><text x="553.25" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:13.5px">4. Stop and ask me</text><text x="553.25" y="56" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">when every model</text><text x="553.25" y="72" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">is out</text><line x1="20" y1="94" x2="620" y2="94" style="stroke:var(--color-line);stroke-width:1;stroke-dasharray:4 4"/><text x="320" y="118" text-anchor="middle" style="fill:var(--color-fg);font-size:12.5px">The paid DeepSeek API is never in this order. It is an escalation, and it needs the approval I type.</text></svg>
<!-- /stack:ladder -->

*Free first, then a small monthly plan, then the plan I already pay for. The paid DeepSeek API is never in the order.*

## What is built, and what is still ahead

**I built the layer in two phases, and I will not call it finished.** The first phase is the registry with its tiers and roles, the session check, the model guard, the fallback order with its cooldowns, the work guards and the usage records. The second phase added the pieces for the hard moments. Every paid escalation leaves a record and waits for an approval I type in a terminal. A supervisor caps how many agents run at once. A context check says whether the next task fits. A recovery checkpoint lets a session continue after an interruption, and a Model Scout researches new models when I ask. A goldfish gate refuses to start a big plan that has no cold review. The second phase went through several audits before I called it ready.

Some of it is proven in real use, and some is only tested. The Go route and the allowance check ran live on my Mac, and the whole layer checks out in Claude Code on my Windows machine at the start of every session. What I have not yet seen happen for real is the free model running out in the middle of work and the request moving on to Go by itself, the Codex side of the checks, and Sol taking light work on OpenCode. Continuing a session is assisted, not automatic: I still click to archive the old one. The order of free and Go gets a review on 30 November, against a week of what PANTRY recorded.

## The rule I will not bend

**The free and Go models and DeepSeek are for personal projects only.** My work machine and my work repositories use only the company's Claude and Codex, and I did not leave that to my memory.

Three guards enforce it, and a mistake has to get past all three. A machine the setup cannot identify counts as a work machine. In work context, every prompt checks which account it is signed in to and is blocked unless it is a company account. And the commands that start DeepSeek Harness and OpenCode refuse to run in work context at all, whatever I have said about the repository. Free models may keep your prompts, and I decided I would not let a tired evening be the reason one saw something that was not mine.

## What it changed

**It never stalls, it never overspends, and it never leaks private code.** That is the whole pitch, and each part has a mechanism behind it rather than a promise: the fallback order, the typed approval with a prepaid cap, and the guards that keep anything not mine away from models that may keep it.

The first change is the one I wanted. So far, I have not run out in the middle of something. The free model and the small plan take the light work, so the strong plans last longer, and when one of them does empty, the next model is a lookup and not a decision.

The second is that I work at low effort now. Opus runs low and Sonnet runs medium, because the architecture carries the load: the plan is written, the review is fresh, the guards are hooks. A model that does not have to hold the whole project in its head can think less and be right more often. I have worked this way since the loop and the harness were in place, and the work has held up. That is my experience, not a controlled comparison.

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

*The loop from [Set Up the Loop With One Prompt](loop-setup.md): a plan, a session with the checklist first, a report, a second reader, and me. That is what carries the load, so the model can run at low effort.*

The third is fewer apps and fewer moods. I do not choose between four programs when something runs out. I open the one I always open.

## The turn

I ran out at the wrong moment, with four hours left on a clock I could not argue with. Now the next model is a lookup, the lookup knows what it is allowed to touch, and I stay in the zone.

If you want the machinery, every piece with its diagram and a list of the steps to build your own, it is in [How the Model Intelligence Layer Works](how-the-model-layer-works.md). The setup guide that the layer sits on is [Set Up the Loop With One Prompt](loop-setup.md).

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
