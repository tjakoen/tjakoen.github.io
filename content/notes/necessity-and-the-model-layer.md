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

<!-- diagram:architecture -->
<figure class="diagram" data-diagram="layers">
  <div class="diagram__bar" role="toolbar" aria-label="Diagram controls">
    <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
    <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
    <button type="button" data-zoom="reset">Fit</button>
    <span class="diagram__hint">Scroll or pinch to zoom, drag to pan, hover to trace, click to open.</span>
  </div>
  <svg class="diagram__svg" viewBox="0 0 960 1078" data-w="960" data-h="1078" role="img" aria-label="The architecture of the Model Intelligence Layer. The owner sets intent and approvals. The loop, made of public standards, plans and human gates, feeds a registry that holds every model identifier. Three enforcement parts sit on it: the model guard, the route check and the work guard. They govern three harnesses, Claude Code, OpenCode and the Codex app. The harnesses reach four groups of models: Claude, Codex models, the free chain and the DeepSeek API. Every session writes a usage record that PANTRY reports." xmlns="http://www.w3.org/2000/svg"><defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs><g class="dg-edges"><g class="dg-edge" data-edge="owner-loop" data-ends="owner loop"><title>owner-loop</title><path class="dg-line" d="M480,114 L480,210" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M480,114 L480,210"/></g><g class="dg-edge" data-edge="loop-registry" data-ends="loop registry"><title>loop-registry</title><path class="dg-line" d="M480,272 L480,368" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M480,272 L480,368"/></g><g class="dg-edge" data-edge="registry-guard" data-ends="registry guard"><title>registry-guard</title><path class="dg-line" d="M428.00632911392404,430 L266.99367088607596,526" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M428.00632911392404,430 L266.99367088607596,526"/></g><g class="dg-edge" data-edge="registry-route" data-ends="registry route"><title>registry-route</title><path class="dg-line" d="M478.626582278481,430 L474.373417721519,526" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M478.626582278481,430 L474.373417721519,526"/></g><g class="dg-edge" data-edge="registry-work" data-ends="registry work"><title>registry-work</title><path class="dg-line" d="M530.620253164557,430 L687.379746835443,526" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M530.620253164557,430 L687.379746835443,526"/></g><g class="dg-edge" data-edge="guard-cc" data-ends="guard cc"><title>guard-cc</title><path class="dg-line" d="M220.13245033112582,588 L236.02649006622516,684" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M220.13245033112582,588 L236.02649006622516,684"/></g><g class="dg-edge" data-edge="route-oc" data-ends="route oc"><title>route-oc</title><path class="dg-line" d="M474.4370860927152,588 L478.887417218543,684" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M474.4370860927152,588 L478.887417218543,684"/></g><g class="dg-edge" data-edge="work-cc" data-ends="work cc"><title>work-cc</title><path class="dg-line" d="M635.7615894039735,588 L319.1523178807947,684" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M635.7615894039735,588 L319.1523178807947,684"/></g><g class="dg-edge" data-edge="work-oc" data-ends="work oc"><title>work-oc</title><path class="dg-line" d="M685.0331125827814,588 L521.0066225165563,684" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M685.0331125827814,588 L521.0066225165563,684"/></g><g class="dg-edge" data-edge="work-cx" data-ends="work cx"><title>work-cx</title><path class="dg-line" d="M734.3046357615895,588 L722.8609271523179,684" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M734.3046357615895,588 L722.8609271523179,684"/></g><g class="dg-edge" data-edge="cc-claude" data-ends="cc claude"><title>cc-claude</title><path class="dg-line" d="M220.9271523178808,732 L144.63576158940398,828" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M220.9271523178808,732 L144.63576158940398,828"/></g><g class="dg-edge" data-edge="oc-codex" data-ends="oc codex"><title>oc-codex</title><path class="dg-line" d="M537.2185430463576,732 L766.0927152317881,828" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M537.2185430463576,732 L766.0927152317881,828"/></g><g class="dg-edge" data-edge="oc-free" data-ends="oc free"><title>oc-free</title><path class="dg-line" d="M460.92715231788077,732 L384.63576158940396,828" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M460.92715231788077,732 L384.63576158940396,828"/></g><g class="dg-edge" data-edge="oc-ds" data-ends="oc ds"><title>oc-ds</title><path class="dg-line" d="M499.07284768211923,732 L575.364238410596,828" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M499.07284768211923,732 L575.364238410596,828"/></g><g class="dg-edge" data-edge="cx-codex" data-ends="cx codex"><title>cx-codex</title><path class="dg-line" d="M739.0728476821192,732 L815.364238410596,828" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M739.0728476821192,732 L815.364238410596,828"/></g><g class="dg-edge" data-edge="claude-ledger" data-ends="claude ledger"><title>claude-ledger</title><path class="dg-line" d="M190.63291139240505,890 L409.36708860759495,986" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M190.63291139240505,890 L409.36708860759495,986"/></g><g class="dg-edge" data-edge="codex-ledger" data-ends="codex ledger"><title>codex-ledger</title><path class="dg-line" d="M769.367088607595,890 L550.632911392405,986" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M769.367088607595,890 L550.632911392405,986"/></g><g class="dg-edge" data-edge="free-ledger" data-ends="free ledger"><title>free-ledger</title><path class="dg-line" d="M383.54430379746833,890 L456.45569620253167,986" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M383.54430379746833,890 L456.45569620253167,986"/></g><g class="dg-edge" data-edge="ds-ledger" data-ends="ds ledger"><title>ds-ledger</title><path class="dg-line" d="M576.4556962025316,890 L503.54430379746833,986" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M576.4556962025316,890 L503.54430379746833,986"/></g></g><g class="dg-nodes"><g class="dg-node dg-k-person" data-node="owner"><title>Owner</title><circle class="dg-box" cx="480" cy="44" r="14"/><rect class="dg-box" x="390" y="60" width="180" height="54" rx="16"/><text class="dg-title" x="480" y="85" text-anchor="middle">Owner</text><text class="dg-sub" x="480" y="101" text-anchor="middle">intent and approvals</text></g><g class="dg-node dg-k-system" data-node="loop"><title>The loop</title><rect class="dg-box dg-heavy" x="374" y="210" width="212" height="62" rx="6"/><text class="dg-title" x="480" y="239" text-anchor="middle">The loop</text><text class="dg-sub" x="480" y="255" text-anchor="middle">standards, plans, human gates</text></g><g class="dg-node dg-k-container" data-node="registry"><title>Registry</title><rect class="dg-box" x="388" y="368" width="184" height="62" rx="6"/><text class="dg-title" x="480" y="397" text-anchor="middle">Registry</text><text class="dg-sub" x="480" y="413" text-anchor="middle">every model id lives here</text></g><g class="dg-node dg-k-container" data-node="guard"><title>Model guard</title><rect class="dg-box" x="116" y="526" width="198" height="62" rx="6"/><text class="dg-title" x="215" y="555" text-anchor="middle">Model guard</text><text class="dg-sub" x="215" y="571" text-anchor="middle">wrong model restarts itself</text></g><g class="dg-node dg-k-container" data-node="route"><title>Route check</title><rect class="dg-box" x="374" y="526" width="198" height="62" rx="6"/><text class="dg-title" x="473" y="555" text-anchor="middle">Route check</text><text class="dg-sub" x="473" y="571" text-anchor="middle">order, cooldowns, clearance</text></g><g class="dg-node dg-k-container" data-node="work"><title>Work guard</title><rect class="dg-box" x="632" y="526" width="212" height="62" rx="6"/><text class="dg-title" x="738" y="555" text-anchor="middle">Work guard</text><text class="dg-sub" x="738" y="571" text-anchor="middle">company accounts only at work</text></g><g class="dg-node dg-k-container" data-node="cc"><title>Claude Code</title><rect class="dg-box" x="150" y="684" width="180" height="48" rx="6"/><text class="dg-title" x="240" y="713" text-anchor="middle">Claude Code</text></g><g class="dg-node dg-k-container" data-node="oc"><title>OpenCode</title><rect class="dg-box" x="390" y="684" width="180" height="48" rx="6"/><text class="dg-title" x="480" y="713" text-anchor="middle">OpenCode</text></g><g class="dg-node dg-k-container" data-node="cx"><title>Codex app</title><rect class="dg-box" x="630" y="684" width="180" height="48" rx="6"/><text class="dg-title" x="720" y="713" text-anchor="middle">Codex app</text></g><g class="dg-node dg-k-external" data-node="claude"><title>Claude</title><rect class="dg-box dg-dashed" x="30" y="828" width="180" height="62" rx="6"/><text class="dg-title" x="120" y="857" text-anchor="middle">Claude</text><text class="dg-sub" x="120" y="873" text-anchor="middle">private</text></g><g class="dg-node dg-k-external" data-node="codex"><title>Codex models</title><rect class="dg-box dg-dashed" x="750" y="828" width="180" height="62" rx="6"/><text class="dg-title" x="840" y="857" text-anchor="middle">Codex models</text><text class="dg-sub" x="840" y="873" text-anchor="middle">private</text></g><g class="dg-node dg-k-external" data-node="free"><title>Free chain</title><rect class="dg-box dg-dashed" x="270" y="828" width="180" height="62" rx="6"/><text class="dg-title" x="360" y="857" text-anchor="middle">Free chain</text><text class="dg-sub" x="360" y="873" text-anchor="middle">not private</text></g><g class="dg-node dg-k-external" data-node="ds"><title>DeepSeek API</title><rect class="dg-box dg-dashed" x="510" y="828" width="180" height="62" rx="6"/><text class="dg-title" x="600" y="857" text-anchor="middle">DeepSeek API</text><text class="dg-sub" x="600" y="873" text-anchor="middle">paid, not private</text></g><g class="dg-node dg-k-system" data-node="ledger"><title>Usage record, then PANTRY</title><rect class="dg-box dg-heavy" x="383" y="986" width="194" height="62" rx="6"/><text class="dg-title" x="480" y="1015" text-anchor="middle">Usage record, then PANTRY</text><text class="dg-sub" x="480" y="1031" text-anchor="middle">free and paid kept apart</text></g></g><g class="dg-labels"></g></svg>
</figure>
<!-- /diagram:architecture -->

*The whole layer. Drag it, zoom it, and hover a box to light up what it touches. The dashed boxes are the models that may keep what they are sent.*

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
