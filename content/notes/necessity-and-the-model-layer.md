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
  I built a Model Intelligence Layer: free models take the light work, Opus and Sol keep the planning, a
  fallback order handles the day a model says no, and hard guards keep every free model and DeepSeek away
  from anything that is not mine. This is the short version of why, and what changed. The technical note
  shows how it works.
social: |
  I spent my Codex usage with four hours left on the five-hour refresh. I was in the zone and did not
  want to stop. The next tier up felt like too much pressure to maximize, so I built a layer instead.

  It picks the model for me. Free models take the light work, Opus and Sol keep the planning, and a
  fallback order with cooldowns handles the day a model says 429. Hard guards keep every free model
  and DeepSeek off work machines and work repositories.

  Necessity, mother of innovation. The story is in the note, and the technical version is in a second one.
socialImage: "/media/notes/necessity-and-the-model-layer-social.png"
socialImageAlt: "The full architecture of the Model Intelligence Layer on one card: three harnesses feed one layer made of a registry, a model guard, a route check and a work guard, which picks between private Claude and Codex models and non-private free and DeepSeek models, and writes one usage record per session."
---

I spent my Codex usage and still had four hours to go before the five-hour refresh. I was in the zone. I did not want to stop.

The Claude weekly limit had already put me three days from a refresh, and Codex was halfway out with six days left on its own. I do a lot of work with AI, and once again I ran out. I did not want to spend more. The $100 plans feel like too much pressure to maximize, because paying that much turns every idle evening into a small failure to use what I bought.

So I did what I usually do when something annoys me enough. I built infrastructure.

> This continues [The Loop Outlives the Model](one-loop-three-harnesses.md), where I explained bringing DeepSeek in when both plans ran out. This is the short story of what came next. [How the Model Intelligence Layer Works](how-the-model-layer-works.md) is the technical one.

## The night I went looking for a way out

The first thing I tried was running a model on my own machine. I have an RTX 3050 with 8 GB of memory. It runs small models fine and runs the ones I would want for coding badly, and a coding model that is worse than the one I am paying for is not a saving, it is a hobby. I put that idea back on the shelf for a year or two.

The second thing was free models online. They exist, they are better than I expected, and the catch is printed on the label: a free endpoint may keep whatever you send it. I decided I could accept that trade for my own projects, where the code is public anyway, and for nothing else. That decision is the most important one in this note, and most of what I built exists to enforce it.

The part I had not expected was how little of the work needed the expensive model. A search through a codebase does not need a frontier model. Neither does summarizing a file or running through a checklist. I had been spending the strong plan on all of it because nothing was stopping me.

## The old setup and the new one

Before this, Claude was my main tool. I think it works best for me. The Codex app was the backup, and the way I ran a second project in parallel. DeepSeek Harness, which I call DSH, was the last fallback when both plans were out.

It worked, and it had one flaw I could not see until I ran out in the middle of something. Each fallback was a different program with a different way of starting, and the choice between them was mine, made tired, at the worst moment.

The new shape has fewer programs and one decision-maker.

- Claude Code is still where I work when I want Claude.
- OpenCode does all my coding outside Claude. Codex usage, the free models and the DeepSeek API all plug into it directly.
- Claude cannot plug into OpenCode. In my testing, Anthropic only lets a third-party harness in through an API token, which is billed on its own and not tied to the five-hour or weekly usage of a plan. Codex lets its plan in directly. I am fine with that, because Claude Code is a good harness and I was always going to use it for Claude.
- I deleted the DSH app. Fewer apps is a feature.
- I kept the Codex app, but for work that is not coding: the ChatGPT side, and anything at work.

The decision-maker is the thing I am calling a Model Intelligence Layer.

## What a Model Intelligence Layer does

**It owns four decisions: which model plays which role, whether that choice was obeyed, what happens when the model runs out, and what the run cost and where the prompt went.** I did not want to make those four decisions tired, so I wrote them down once and let hooks enforce them.

In plain words, here is how it behaves.

Planning and review stay on the strong models, Opus on Claude and Sol on Codex, because that is where judgment pays for itself. Everything lighter goes down a fixed order: the free models first, then the Codex plan I have already paid for, then the DeepSeek API under a small daily cap. When a model says no, the layer cools it down and picks the next one. If a session starts on the wrong model, it stops before doing any work and offers me a restart. Every session and subagent leaves one record of what it used, and my desk, PANTRY, shows free and paid apart.

<!-- stack:layers -->
<svg viewBox="0 0 640 682" width="100%" role="img" aria-label="The layers of my setup, top to bottom. I make the requests, decisions and approvals. Under me the loop holds the public standards, the plans, independent review and the human gates. Under the loop sits the Model Intelligence Layer, made of a registry of every model, a route check that picks a model with cooldowns and repository clearance, a model guard that restarts a session on the wrong model, and a work guard that allows only company accounts at work. Under that are three harnesses, Claude Code, OpenCode and the Codex app. Under those are four groups of models: Claude and Codex models, which are private, and the free models and the DeepSeek API, which are not. Beside every layer, PANTRY and the usage records keep the shared state that any session can read." style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif"><rect x="20" y="14" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Me</text><text x="320" y="54" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Requests, decisions and approvals</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="70" x2="320" y2="92"/><path d="M316,86 L320,92 L324,86"/><path d="M316,76 L320,70 L324,76"/></g><rect x="20" y="96" width="600" height="78" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="118" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">The loop</text><rect x="32" y="122" width="136.5" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="100.25" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Public standards</text><rect x="178.5" y="122" width="136.5" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="246.75" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Plans</text><rect x="325" y="122" width="136.5" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="393.25" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Independent review</text><rect x="471.5" y="122" width="136.5" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="539.75" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Human gates</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="178" x2="320" y2="200"/><path d="M316,194 L320,200 L324,194"/><path d="M316,184 L320,178 L324,184"/></g><rect x="20" y="204" width="600" height="110" rx="8" style="fill:none;stroke:var(--color-fg);stroke-width:2.2"/><text x="320" y="226" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">The Model Intelligence Layer</text><rect x="32" y="230" width="136.5" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="100.25" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Registry</text><text x="100.25" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">every model id,</text><text x="100.25" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">tiers and roles</text><rect x="178.5" y="230" width="136.5" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="246.75" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Route check</text><text x="246.75" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">order, cooldowns,</text><text x="246.75" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">repo clearance</text><rect x="325" y="230" width="136.5" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="393.25" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Model guard</text><text x="393.25" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">a wrong model</text><text x="393.25" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">restarts itself</text><rect x="471.5" y="230" width="136.5" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="539.75" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Work guard</text><text x="539.75" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">company accounts</text><text x="539.75" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">only at work</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="318" x2="320" y2="340"/><path d="M316,334 L320,340 L324,334"/><path d="M316,324 L320,318 L324,324"/></g><rect x="20" y="344" width="600" height="94" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="366" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Harnesses</text><rect x="32" y="370" width="185.33333333333334" height="46" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="124.66666666666667" y="390" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Claude Code</text><text x="124.66666666666667" y="408" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">Claude only</text><rect x="227.33333333333334" y="370" width="185.33333333333334" height="46" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="390" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">OpenCode</text><text x="320" y="408" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">all other coding</text><rect x="422.6666666666667" y="370" width="185.33333333333334" height="46" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="515.3333333333334" y="390" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Codex app</text><text x="515.3333333333334" y="408" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">non-coding work</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="442" x2="320" y2="464"/><path d="M316,458 L320,464 L324,458"/><path d="M316,448 L320,442 L324,448"/></g><rect x="20" y="468" width="600" height="94" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="490" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Models</text><rect x="32" y="494" width="136.5" height="46" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="100.25" y="514" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Claude</text><text x="100.25" y="532" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">private</text><rect x="178.5" y="494" width="136.5" height="46" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="246.75" y="514" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Codex models</text><text x="246.75" y="532" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">private</text><rect x="325" y="494" width="136.5" height="46" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:5 4"/><text x="393.25" y="514" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Free models</text><text x="393.25" y="532" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">not private</text><rect x="471.5" y="494" width="136.5" height="46" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:5 4"/><text x="539.75" y="514" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">DeepSeek API</text><text x="539.75" y="532" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">paid, not private</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="566" x2="320" y2="588"/><path d="M316,582 L320,588 L324,582"/><path d="M316,572 L320,566 L324,572"/></g><line x1="20" y1="592" x2="620" y2="592" style="stroke:var(--color-line);stroke-width:1"/><text x="24" y="616" style="fill:var(--color-fg);font-size:14px">Shared state</text><text x="24" y="636" style="fill:var(--color-muted);font-size:12px">PANTRY, plans, usage records, run evidence, handoffs.</text><text x="24" y="652" style="fill:var(--color-muted);font-size:12px">Any session can read it, and no session owns it.</text></svg>
<!-- /stack:layers -->

*The whole setup, top to bottom. The heavy outline is the layer. The dashed tiles are the models that may keep what they are sent.*

<svg viewBox="0 0 620 430" width="100%" role="img"
     aria-label="The fallback order for light work. First the free chain of five models, DeepSeek V4.1 Flash Free, MiMo V2.6 Flash Free, LongCat 2.5 Free, Nemotron 3.5 Lightning Free and Flint 40B Free, in registry order. When all are skipped or cooling down, the cheaper Codex models while the Codex plan has usage left, Luna first and then Sol at low effort. When those are out, DeepSeek V4.1 Flash on the paid API under a small daily cap. Past the cap, the layer stops and asks me. A model is skipped when it is not private and the repository is not cleared, when it is cooling down, when it is demoted for the day, or when its plan is marked out."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-mil1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="16" width="360" height="68" rx="6"/>
    <rect x="20" y="124" width="360" height="62" rx="6"/>
    <rect x="20" y="226" width="360" height="62" rx="6" stroke-dasharray="5 4"/>
  </g>
  <rect x="20" y="334" width="360" height="62" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="200" y1="84" x2="200" y2="122" marker-end="url(#fl-mil1)"/>
    <line x1="200" y1="186" x2="200" y2="224" marker-end="url(#fl-mil1)"/>
    <line x1="200" y1="288" x2="200" y2="332" marker-end="url(#fl-mil1)"/>
  </g>
  <g text-anchor="middle">
    <text x="200" y="38" style="fill:var(--color-fg)">1. The free chain, in registry order</text>
    <text x="200" y="57" style="fill:var(--color-muted);font-size:12px">DeepSeek V4.1 Flash, MiMo V2.6 Flash, LongCat 2.5,</text>
    <text x="200" y="74" style="fill:var(--color-muted);font-size:12px">Nemotron 3.5 Lightning, Flint 40B (all free)</text>
    <text x="200" y="148" style="fill:var(--color-fg)">2. The cheaper Codex models</text>
    <text x="200" y="168" style="fill:var(--color-muted);font-size:12px">Luna, then Sol at low effort, while the plan has usage</text>
    <text x="200" y="250" style="fill:var(--color-fg)">3. DeepSeek V4.1 Flash, paid API</text>
    <text x="200" y="270" style="fill:var(--color-muted);font-size:12px">only under a small daily cap</text>
    <text x="200" y="358" style="fill:var(--color-bg)">4. Stop and ask me</text>
    <text x="200" y="378" style="fill:var(--color-bg);font-size:12px">past the cap, or nothing is available</text>
  </g>
  <g style="fill:var(--color-muted);font-size:12px">
    <text x="400" y="40">Skipped when:</text>
    <text x="400" y="60">not private, repo</text>
    <text x="400" y="76">not cleared</text>
    <text x="400" y="100">cooling down</text>
    <text x="400" y="118">demoted for today</text>
    <text x="400" y="142">Codex plan marked out</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="296" y="108">all skipped</text>
    <text x="296" y="210">plan out</text>
    <text x="296" y="316">cap reached</text>
  </g>
</svg>

*Free first, then the plan I have already paid for, then the meter.*

## The rule I will not bend

**The free models and DeepSeek are for personal projects only.** My work machine and my work repositories use only the company's Claude and Codex, and I did not leave that to my memory.

Three guards enforce it, and a mistake has to get past all three. A machine the setup cannot identify counts as a work machine. In work context, every prompt checks which account it is signed in to and is blocked unless it is a company account. And the commands that start DeepSeek Harness and OpenCode refuse to run in work context at all, whatever I have said about the repository. Free models may keep your prompts, and I decided I would not let a tired evening be the reason one saw something that was not mine.

## What it changed

The first change is the one I wanted. I stopped running out in the middle of something. The free chain takes the light work, so the strong plans last longer, and when one of them does empty, the next model is a lookup and not a decision.

The second is that I work at low effort now. Opus runs low and Sonnet runs medium, because the architecture carries the load: the plan is written, the review is fresh, the guards are hooks. A model that does not have to hold the whole project in its head can think less and be right more often. I have worked this way since the loop and the harness were in place, and the work has held up. That is my experience, not a controlled comparison.

The third is fewer apps and fewer moods. I do not choose between four programs when something runs out. I open the one I always open.

## The turn

I ran out at the wrong moment, with four hours left on a clock I could not argue with. Now the next model is a lookup, the lookup knows what it is allowed to touch, and I stay in the zone.

If you want the machinery, every piece with its diagram and a list of the steps to build your own, it is in [How the Model Intelligence Layer Works](how-the-model-layer-works.md). The setup guide that the layer sits on is [Set Up the Loop With One Prompt](loop-setup.md).

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
