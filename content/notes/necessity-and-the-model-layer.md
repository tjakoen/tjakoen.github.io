---
title: "Necessity Is the Mother of Innovation"
audience: [build, learn]
level: deep
subtitle: "I ran out of AI usage with hours still on the clock, refused to pay for the next tier, and ended up building a layer that chooses the model for me."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-23
readingTime: "~25 min"
tags: [ai, workflow, tokenomics, standards, tooling]
summary: >
  A Model Intelligence Layer is the part of an AI setup that decides which model plays which role,
  enforces the decision, falls back when a model runs out, and records what every session cost and
  where its prompts went. I built one after running out of usage mid-task: free models do the light
  work, Opus and Sol keep orchestration, hard guards keep every free model and DeepSeek away from
  work, and PANTRY reports free and paid apart. This note defines the layer, shows how each piece
  is proven, and lists what is public and what is private so you
  can build your own.
social: |
  I spent my Codex usage with four hours left on the five-hour refresh. I was in the zone and did not
  want to stop. The next tier up felt like too much pressure to maximize, so I built a layer instead.

  It picks the model for me. Free models take the light work, Opus and Sol keep the planning, and a
  fallback order with cooldowns handles the day a model says 429. Hard guards keep every free model
  and DeepSeek off work machines and work repositories.

  Necessity, mother of innovation. The whole architecture, what is proven and what is not, and what
  you would need to build your own is in the note.
socialImage: "/media/notes/necessity-and-the-model-layer-social.png"
socialImageAlt: "The full architecture of the Model Intelligence Layer on one card: three harnesses feed one layer made of a registry, a model guard, a route check and a work guard, which picks between private Claude and Codex models and non-private free and DeepSeek models, and writes one usage record per session."
---

I spent my Codex usage and still had four hours to go before the five-hour refresh. I was in the zone. I did not want to stop.

That sentence is the whole origin of this note. The Claude weekly limit had already put me three days from a refresh, and Codex was halfway out with six days left on its own. I do a lot of work with AI, and once again I ran out. I did not want to spend more. The $100 plans feel like too much pressure to maximize, because paying that much turns every idle evening into a small failure to use what I bought.

So I did what I usually do when something annoys me enough. I built infrastructure.

This is the long version of that build. It defines a thing I am calling a Model Intelligence Layer, shows each part of mine, says which parts are proven and which only look proven, and ends with a list of what you would need to make your own. The short version is that the model is now a decision my setup makes, and I only make the decisions that need me.

> This continues [The Loop Outlives the Model](one-loop-three-harnesses.md), where I explained bringing DeepSeek in when both of my plans ran out. The setup guide is [Set Up the Loop With One Prompt](loop-setup.md). Read either first if the words harness, loop or standards are new.

## The night I went looking for a way out

The first thing I tried was running a model on my own machine. I have an RTX 3050 with 8 GB of memory. It runs small models fine and runs the ones I would want for coding badly, and a coding model that is worse than the one I am paying for is not a saving, it is a hobby. I put that idea back on the shelf for a year or two.

The second thing was free models online. They exist, they are better than I expected, and the catch is printed on the label: a free endpoint may keep whatever you send it. I decided I could accept that trade for my own projects, where the code is public anyway, and for nothing else. That decision is the most important one in this note, and most of the architecture below exists to enforce it.

The part I had not expected was how little of the work needed the expensive model. A search through a codebase does not need a frontier model. Neither does summarizing a file or running through a checklist. I had been spending the strong plan on all of it because nothing was stopping me.

## The old setup and the new one

Before this, my setup had a clear shape.

- Claude was the main tool. I think it works best for me, so the main session ran there.
- The Codex app was the backup, and the way I ran a second project in parallel.
- DeepSeek Harness, which I call DSH, was the last fallback when both plans were out.

It worked, and it had one flaw I could not see until I ran out in the middle of something. Each fallback was a different program with a different way of starting, and the choice between them was mine, made tired, at the worst moment.

The new shape has fewer programs and one decision-maker.

- Claude Code is still where I work when I want Claude. Nothing about that changed.
- OpenCode does all my coding outside Claude. Codex usage, the free models and the DeepSeek API all plug into it directly.
- Claude cannot plug into OpenCode. In my testing, Anthropic only lets a third-party harness in through an API token, which is billed on its own and not tied to the five-hour or weekly usage of a plan. Codex lets its plan in directly. I am fine with that, because Claude Code is a good harness and I was always going to use it for Claude.
- The layer decides which model runs, enforces the rules about delegation and subagents, and records what happened.
- I deleted the DSH app. Fewer apps is a feature.
- I kept the Codex app, but for work that is not coding: the ChatGPT side, and anything at work.

Two lanes came out of that, and they matter more than the program list. In the personal lane, anything goes through the chain below. In the work lane, only the company's Claude and Codex ever see a prompt. I will come back to that, because it is the part I would be least willing to get wrong.

## What a Model Intelligence Layer is

**A Model Intelligence Layer is the part of your setup that owns four decisions: which model plays which role, whether that choice was obeyed, what happens when the model is unavailable, and what the run cost and where the prompt went.** Everything else in this note is one of those four, built.

I call it a layer because it sits between the harness (the program that runs a session) and the models (the rented part), and it stays the same when either one changes. The loop contract from the earlier notes says the model is not part of the contract. The layer is where that sentence gets a mechanism.

It rests on three pieces of vocabulary, all from [MODELS](/standards/models), the public standard that holds the policy.

| Piece | What it is | Mine |
|---|---|---|
| Tier | How much judgment a kind of work needs: strong, execution, cheapest | Opus, Sonnet, Haiku on Claude; Sol, Sol at low effort, Luna on Codex |
| Role | A kind of work, pinned to one tier | Orchestration and prose on strong; review, implementation, research on execution; lightweight on cheapest |
| Registry | The one file where every model identifier lives | A single JSON file in my private config repo |

Agents map to a tier, never to a role, so a pin has exactly one kind of value to check. My planner, goldfish and writer sit on the strong tier. The auditor and implementer sit on execution. The locator sits on cheapest.

The main session runs on the execution tier, on every harness that can pin it. A main session spends most of its turns typing, reading and wiring, and paying strong-tier prices for that was exactly what I was trying to stop.

<svg viewBox="0 0 640 480" width="100%" role="img"
     aria-label="The architecture of the Model Intelligence Layer. Three harnesses, Claude Code, OpenCode and the Codex app, feed one layer made of four parts: the registry that holds every model identifier, the model guard that restarts a session on the wrong model, the route check that picks a model with cooldowns and repository clearance, and the work guard that allows only company accounts in work context. The layer routes to four groups of models: Claude, which is private; Codex, which is private; the free model chain, which is not private; and the DeepSeek API, which is paid and not private. Every session and subagent then writes one usage record, which PANTRY reports with free and paid kept apart."
     style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-mil0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="14" width="186" height="52" rx="6"/>
    <rect x="227" y="14" width="186" height="52" rx="6"/>
    <rect x="434" y="14" width="186" height="52" rx="6"/>
    <rect x="20" y="272" width="140" height="64" rx="6"/>
    <rect x="180" y="272" width="140" height="64" rx="6"/>
    <rect x="340" y="272" width="140" height="64" rx="6" stroke-dasharray="5 4"/>
    <rect x="500" y="272" width="120" height="64" rx="6" stroke-dasharray="5 4"/>
    <rect x="20" y="404" width="600" height="54" rx="6"/>
  </g>
  <rect x="20" y="112" width="600" height="112" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="113" y1="66" x2="113" y2="110" marker-end="url(#fl-mil0)"/>
    <line x1="320" y1="66" x2="320" y2="110" marker-end="url(#fl-mil0)"/>
    <line x1="527" y1="66" x2="527" y2="110" marker-end="url(#fl-mil0)"/>
    <line x1="90" y1="224" x2="90" y2="270" marker-end="url(#fl-mil0)"/>
    <line x1="250" y1="224" x2="250" y2="270" marker-end="url(#fl-mil0)"/>
    <line x1="410" y1="224" x2="410" y2="270" marker-end="url(#fl-mil0)"/>
    <line x1="560" y1="224" x2="560" y2="270" marker-end="url(#fl-mil0)"/>
    <line x1="320" y1="336" x2="320" y2="402" marker-end="url(#fl-mil0)"/>
  </g>
  <g text-anchor="middle">
    <text x="113" y="36" style="fill:var(--color-fg)">Claude Code</text>
    <text x="113" y="54" style="fill:var(--color-muted);font-size:12px">main session, Claude only</text>
    <text x="320" y="36" style="fill:var(--color-fg)">OpenCode</text>
    <text x="320" y="54" style="fill:var(--color-muted);font-size:12px">all coding outside Claude</text>
    <text x="527" y="36" style="fill:var(--color-fg)">Codex app</text>
    <text x="527" y="54" style="fill:var(--color-muted);font-size:12px">non-coding work</text>
    <text x="320" y="138" style="fill:var(--color-bg);font-size:15px">The Model Intelligence Layer</text>
    <text x="95" y="170" style="fill:var(--color-bg)">Registry</text>
    <text x="95" y="188" style="fill:var(--color-bg);font-size:12px">every model id</text>
    <text x="95" y="204" style="fill:var(--color-bg);font-size:12px">lives here</text>
    <text x="250" y="170" style="fill:var(--color-bg)">Model guard</text>
    <text x="250" y="188" style="fill:var(--color-bg);font-size:12px">wrong model</text>
    <text x="250" y="204" style="fill:var(--color-bg);font-size:12px">restarts itself</text>
    <text x="405" y="170" style="fill:var(--color-bg)">Route check</text>
    <text x="405" y="188" style="fill:var(--color-bg);font-size:12px">picks, cooldowns,</text>
    <text x="405" y="204" style="fill:var(--color-bg);font-size:12px">repo clearance</text>
    <text x="545" y="170" style="fill:var(--color-bg)">Work guard</text>
    <text x="545" y="188" style="fill:var(--color-bg);font-size:12px">company accounts</text>
    <text x="545" y="204" style="fill:var(--color-bg);font-size:12px">only at work</text>
    <text x="90" y="296" style="fill:var(--color-fg)">Claude</text>
    <text x="90" y="314" style="fill:var(--color-muted);font-size:12px">Opus, Sonnet, Haiku</text>
    <text x="90" y="329" style="fill:var(--color-muted);font-size:11px">private</text>
    <text x="250" y="296" style="fill:var(--color-fg)">Codex</text>
    <text x="250" y="314" style="fill:var(--color-muted);font-size:12px">Sol, Luna</text>
    <text x="250" y="329" style="fill:var(--color-muted);font-size:11px">private</text>
    <text x="410" y="296" style="fill:var(--color-fg)">Free chain</text>
    <text x="410" y="314" style="fill:var(--color-muted);font-size:12px">five free models</text>
    <text x="410" y="329" style="fill:var(--color-muted);font-size:11px">not private</text>
    <text x="560" y="296" style="fill:var(--color-fg)">DeepSeek API</text>
    <text x="560" y="314" style="fill:var(--color-muted);font-size:12px">paid, capped</text>
    <text x="560" y="329" style="fill:var(--color-muted);font-size:11px">not private</text>
    <text x="320" y="427" style="fill:var(--color-fg)">One usage record per session and subagent</text>
    <text x="320" y="446" style="fill:var(--color-muted);font-size:12px">model, cost class, private or not, tokens. PANTRY reads it.</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="320" y="262">dashed boxes: a prompt may be kept</text>
  </g>
</svg>

*Three harnesses on top, four kinds of model underneath, and the layer is the only thing that decides which meets which. Dashed boxes are the ones that may keep what they are sent.*

## Orchestration stays on the strong tier, and the way it gets there matters

My first instinct was to switch the main session's model whenever the work got hard. I did not build that, for two reasons I only learned by trying. A hook cannot switch the main session's model at all, so the switch would depend on a model remembering to ask. And switching mid-session throws away the prompt cache, so the whole conversation is paid for again at the new tier's price on the next turn.

So escalation is delegation. When the next piece is planning, architecture or review, the main session hands it to a subagent pinned to the strong tier. The subagent's context ends when the piece ends, and the main session keeps its cache. Opus on Claude Code and Sol on Codex and OpenCode keep orchestration, and nothing in the free chain is ever allowed to take it.

The review half of this borrows a name. Google published a paper on what it calls [the Elephant-Goldfish model](https://research.google/pubs/elephants-goldfish-and-the-new-golden-age-of-software-engineering/), and there is [a repository](https://github.com/google/elephant-goldfish-model) with the practice written down. The shape I took from it is simple. The long session that holds all the context is the elephant, and its job ends at a plan another reader can follow. Fresh reviewers with no memory of the conversation are the goldfish. They get the plan file and the files it links, nothing else, and they tell you where the plan does not stand up on its own. My adaptation, three goldfish with three roles, is written up in [AI-DEVELOPMENT](/standards/ai-development), and it keeps the fresh-context rule and drops what my other standards already cover.

The layer is what makes that cheap enough to do every time. The elephant runs on the cheaper execution tier. The goldfish and the planner are pinned to the strong tier, so the expensive model only ever reads what it needs to judge. A hook watches each prompt and names the agent that fits, once per case per session, so it advises and does not nag. Every spawn also has to carry an envelope: the lane, the scope cap, the hard stops and the ask-triggers. A spawn without one is refused. That is how delegation and subagent rules get enforced rather than hoped for.

## The guard that restarts a session on the wrong model

A rule that lives in a document is a suggestion. The first rule I enforced was the plainest: every main session runs the registry's main model, and nothing in a menu or a spawner's defaults changes that.

It needed enforcing because a session started by another session inherits that session's model, and I can pick anything from the picker. The guard is one shell script wired to four hook events, and it reads the model out of the transcript, because the desktop app's start event does not carry one.

This note is a small proof. The session that drafted it opened on Opus, the registry says Sonnet, and the guard stopped it before it did any work. It proposed a restart card titled with the right model and effort, the card carried the original prompt, and I clicked it. The replacement session is the one writing this. The stopped one then offered two reply buttons, archive it or keep it, and archived itself only after detaching the replacement. That order is not taste. Archiving a parent archives its children, and the app's automatic mode refuses a hook-requested archive, which is why the restart is a click and the archive is a reply.

Three rules came out of the live runs.

- A phrase in my first prompt, keep this model, records an exception for that one session and nothing else. There is no standing exemption.
- A replacement that is still on the wrong model never respawns again. It takes the blocking path, so a desktop app that ignores the model argument produces one blocked session and never a loop.
- On every other harness the guard exits with an error on the first prompt, prints the restart command and asks me to paste the prompt again. The prompt is never put in a command, so there is no shell quoting to get wrong.

It took six live runs before it passed acceptance, and the run report in my config repo holds the evidence.

## The free chain, in order

This is the part that fixed the original problem. For light work, the layer tries these in order and takes the first one that is not skipped.

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

*Free first, then the plan I have already paid for, then the meter. The dashed box is where a prompt can leave Claude and Codex.*

Codex sits before the paid API on purpose. The Codex plan is already paid for, so spending it costs me nothing I had not committed to, while the paid API costs money from the first token.

On a delegated light task, the layer does these things.

1. **It asks the registry.** The route check reads the chain and my current state: which models are cooling down, which are demoted, which plans are marked out.
2. **It skips what it must.** A model is skipped when it is not private and the repository is not cleared, when it is cooling down, when it is demoted for the day, or when it is a Codex model and the Codex plan is out.
3. **It picks the first entry left.** One line of JSON comes back with the model, provider, cost class, privacy flag, effort and the reason.
4. **It tells me when it cannot.** Exit 3 means it needs me and prints the question. Exit 4 means no private model is available. Exit 5 is a hard gate. Exit 2 is an unknown harness or tier.

When a model fails, the failure type decides what happens. A rate limit or quota error puts that model on a cooldown, sixty minutes by default. A plain error only counts toward demotion, and three failures in a row demote the model for the rest of the day. A quota failure on a Codex or Claude model marks that whole plan out until the reset time the error gives, or six hours when it gives none. Every one of those numbers is a registry setting, so tuning one is never a code change.

The OpenCode plugin that launches a delegated child calls the route check before each launch. If the child dies with a 429, a quota error or a rate-limit message, the plugin tells the route check, takes one new pick, and tries once more. One retry, on purpose. A second failure stops the task and surfaces the error, because a retry loop against four providers is a good way to find a fifth way to waste an evening.


The free chain serves delegated light work, the explore, research, locator and implementer children that OpenCode launches through my plugin. The main OpenCode session runs Sol on the Codex plan.

## Repository clearance and the privacy flag

Every model in the registry carries two keys: a cost class, which is free, plan or metered, and a private flag. Claude and Codex are private. Every free model is not private, and so is every DeepSeek model, the paid API included. An id nobody has listed is recorded as unknown and not private, so a model nobody classified is never counted as safe.

A flag is not a decision, so the second piece is a question I answer once per repository. The first time the route check runs in a repository it has no entry for, it stops and asks whether non-private models may see this code. On yes, the full chain applies. On no, only Claude and Codex are candidates, so the work still runs and never leaves those two providers. Nothing is cleared by default.

The answer is stored under the lower-cased absolute path of the repository's top level, so a subfolder or a worktree maps to its own repository. It is a small list of true and false. Not clever, and exactly as clever as it needs to be.

## Work is a different lane, enforced three ways

Everything above is for my personal projects. This section is the opposite.

**The free models and DeepSeek are for personal projects only. A work machine and a work repository use only the company's Claude and Codex, and three separate guards enforce that, so a mistake has to get past all three.** I will describe them without the company's identifiers, because the identifiers are the one thing in this setup I will never publish.

<svg viewBox="0 0 620 380" width="100%" role="img"
     aria-label="Where am I running decides the lane. Work context is a work machine, a machine the setup cannot identify, or a work repository. In work context three guards apply: fail-closed machine detection, an account check on every prompt that allows only company accounts, and a launch gate that refuses the DeepSeek and OpenCode harnesses. The result is that only the company's Claude and Codex are used. In the personal lane, on a personal machine in a repository I have cleared, the route check may use the free chain, Codex and the DeepSeek API."
     style="display:block;width:100%;max-width:580px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-mil2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="108" width="270" height="62" rx="6"/>
    <rect x="330" y="108" width="270" height="62" rx="6"/>
    <rect x="20" y="206" width="270" height="44" rx="6"/>
    <rect x="20" y="258" width="270" height="44" rx="6"/>
    <rect x="20" y="310" width="270" height="44" rx="6"/>
    <rect x="330" y="206" width="270" height="148" rx="6" stroke-dasharray="5 4"/>
  </g>
  <rect x="210" y="16" width="200" height="48" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="260" y1="64" x2="155" y2="106" marker-end="url(#fl-mil2)"/>
    <line x1="360" y1="64" x2="465" y2="106" marker-end="url(#fl-mil2)"/>
    <line x1="155" y1="170" x2="155" y2="204" marker-end="url(#fl-mil2)"/>
    <line x1="465" y1="170" x2="465" y2="204" marker-end="url(#fl-mil2)"/>
  </g>
  <g text-anchor="middle">
    <text x="310" y="46" style="fill:var(--color-bg)">Where am I running?</text>
    <text x="155" y="130" style="fill:var(--color-fg)">Work context</text>
    <text x="155" y="150" style="fill:var(--color-muted);font-size:12px">work machine, unidentified machine,</text>
    <text x="155" y="164" style="fill:var(--color-muted);font-size:12px">or work repository</text>
    <text x="465" y="130" style="fill:var(--color-fg)">Personal lane</text>
    <text x="465" y="150" style="fill:var(--color-muted);font-size:12px">personal machine, repository</text>
    <text x="465" y="164" style="fill:var(--color-muted);font-size:12px">I have cleared</text>
    <text x="155" y="233" style="fill:var(--color-fg)">1. Unknown machine counts as work</text>
    <text x="155" y="285" style="fill:var(--color-fg)">2. Account check on every prompt</text>
    <text x="155" y="337" style="fill:var(--color-fg)">3. Launch gate refuses dsh, opencode</text>
    <text x="465" y="232" style="fill:var(--color-fg)">The route check may use</text>
    <text x="465" y="256" style="fill:var(--color-muted);font-size:12px">the free chain</text>
    <text x="465" y="276" style="fill:var(--color-muted);font-size:12px">the Codex plan</text>
    <text x="465" y="296" style="fill:var(--color-muted);font-size:12px">the DeepSeek API under its cap</text>
    <text x="465" y="326" style="fill:var(--color-muted);font-size:12px">and asks first in any repo</text>
    <text x="465" y="342" style="fill:var(--color-muted);font-size:12px">it has not seen</text>
  </g>
</svg>

*One question, asked first, and the left lane has three locks.*

**Fail-closed machine detection.** Each machine of mine is a directory in the private config repo, and a device resolves which one it is from its own hostname. When nothing resolves, the device is treated as a work machine. An unidentified machine is the wrong place to guess, and the cost of guessing wrong the safe way is a blocked prompt, which I can fix in a minute.

**An account check on every prompt.** In work context, a hook reads which account the harness is signed in to and exits with an error if it is not a company account, so the prompt never reaches a personal one. The hook prints only the word company, never the address it read. It works for both Claude and Codex.

**A launch gate.** The wrappers that start DeepSeek Harness and OpenCode ask the route check for permission first, and the route check refuses in work context. Starting either one inside a work repository is a hard stop, whatever the repository's clearance file says, because a work repository can never be cleared for non-private models.

The honest limit on the third lock is that it guards habit. Calling the binary by its full path skips the wrapper. The account check is the one a session cannot step around, which is why it exists as a separate lock rather than a feature of the third.

These constants live in the code, not in the registry or in any state file, so no answer, flag or clearance can lift them. Each copy has a test. When I wrote the account check I wrote the test first, and I did not run it red before writing the script, so that one rule has a green test without the red one behind it. I am telling you because the red-first run is what makes a test mean something.

## What gets recorded, and why free and paid sit apart

A layer that cannot report is a layer you cannot tune. The Stop and SubagentStop hooks each run a small script that appends one JSON line to a file named for the local date. A line holds the time, the machine, the harness, the project, the plan, the session, the agent type, the model, the provider, the cost class, the private flag, the input, cache and output token counts, the dollar cost where the provider reports one, and how the model was picked.

Four rules keep the ledger honest.

- **Counts do not overlap.** The token numbers are sums since the session's previous record, so nothing is counted twice.
- **Provider, cost class and privacy come from the registry by exact id.** An unknown id records as unknown and not private.
- **The writer can never block a session.** It always exits cleanly, and a failed write is the ledger's problem and nobody else's.
- **Files age out.** Anything older than ninety days is deleted on the first write of each day.

A metered record with no trustworthy dollar figure is charged at the whole daily cap until the layer can account for it. That is a conservative guess in the direction that protects me.

[PANTRY](pantry-beside-the-work.md), the desk I built beside my work, reads those files and reports use by project, plan, session and subagent, split by harness, model, cost class and privacy. Free is kept apart from paid, because the point of the free chain is to see how much work stopped costing anything. One caveat on today's screen: its funding column groups plan and metered together as paid, while the ledger underneath keeps all three classes.

## Five levels, and what a pass is allowed to claim

The easiest way to lie in this kind of project is to write a check that passes on configuration alone. A file saying the guard exists is not a guard that works.

So every check in the layer is graded by what its pass proves. [MODELS](/standards/models) defines five levels, and the verifier prints one line per check with its level and result.

| Level | What a pass means |
|---|---|
| Configured | The file says so. Nothing has run. |
| Mechanically enforced | A hook refused the wrong thing, called exactly as the live config calls it. |
| Verified by test | A test fed it a fixture and read the result. |
| Assisted | A session ran the probe and reported what it saw. |
| Unsupported | The harness cannot do it, and the report says so out loud. |

<svg viewBox="0 0 620 290" width="100%" role="img"
     aria-label="Five conformance levels and where my pieces sit. Configured: registry pins for every harness. Mechanically enforced: the model guard, the account check and the launch gate. Verified by test: the route check, the usage ledger and the retry after a faked 429. Assisted: the model guard on the Claude Code desktop app, six live runs."
     style="display:block;width:100%;max-width:580px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="16" width="580" height="56" rx="6"/>
    <rect x="20" y="82" width="580" height="56" rx="6"/>
    <rect x="20" y="148" width="580" height="56" rx="6"/>
    <rect x="20" y="214" width="580" height="56" rx="6"/>
  </g>
  <g>
    <circle cx="48" cy="44" r="9" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
    <circle cx="48" cy="110" r="9" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
    <circle cx="48" cy="176" r="9" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
    <circle cx="48" cy="242" r="9" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  </g>
  <g>
    <text x="72" y="40" style="fill:var(--color-fg)">Configured</text>
    <text x="72" y="59" style="fill:var(--color-muted);font-size:12px">the registry pins for every harness</text>
    <text x="72" y="106" style="fill:var(--color-fg)">Mechanically enforced</text>
    <text x="72" y="125" style="fill:var(--color-muted);font-size:12px">the model guard, the account check, the launch gate</text>
    <text x="72" y="172" style="fill:var(--color-fg)">Verified by test</text>
    <text x="72" y="191" style="fill:var(--color-muted);font-size:12px">route check, usage ledger, one retry after a quota error</text>
    <text x="72" y="238" style="fill:var(--color-fg)">Assisted</text>
    <text x="72" y="257" style="fill:var(--color-muted);font-size:12px">the model guard on the Claude Code desktop app, six live runs</text>
  </g>
</svg>

*Filled means proven at that level.*


## Handoffs, and working at low effort

Two habits fall out of having a layer, and they are the ones I did not plan.

**Handoffs got cheaper.** Because the registry is the only home of a model name, a handoff between harnesses does not carry a model with it. The handoff names the lane, the scope cap, the hard stops and the ask-triggers, plus the plan file and the steps left. The receiving session looks up its own model for its own tier. When I finished the tokenomics build, the handoff for the second device was a text block I pasted into OpenCode on the other machine, with the record format in it, and nothing in it said which model should read it.

**I work at low effort, on purpose.** No pin in the registry sets reasoning effort to high. The strong tier earns its place through the model, and an execution-tier model at high effort is a strong-tier bill without a strong-tier choice behind it. Opus runs at low effort. Sonnet runs at medium. When I work this way, the work is good anyway, because the architecture is carrying the load: the plan is written, the review is fresh, the envelope is stated and the guards are hooks. A model that does not have to hold the whole project in its head can think less and be right more often. I have worked at low effort ever since the loop and the harness were in place, and the work has held up, which is the evidence I have.

## Build your own

The shape is portable, and so is most of the code, but not all of it should be published. This is the line I drew, and why.

<svg viewBox="0 0 620 330" width="100%" role="img"
     aria-label="What is public and what is private. Public: the standards, such as MODELS, LOOP, SESSION-LOOP and HOOKS, and the portfolio repository that renders them. Private: the agent-config repository holding the registry with real model ids, the hook scripts and their constants, and each machine's settings; and the accounts, keys and sign-ins, which live in neither repository. The standards are the contract, the private repository wires it to the machines, the harnesses run on those machines, and the layer sits between the harnesses and the models."
     style="display:block;width:100%;max-width:580px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-mil3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="16" width="250" height="84" rx="6"/>
    <rect x="20" y="124" width="250" height="100" rx="6" stroke-dasharray="5 4"/>
    <rect x="20" y="248" width="250" height="64" rx="6" stroke-dasharray="2 4"/>
    <rect x="350" y="16" width="250" height="84" rx="6"/>
    <rect x="350" y="248" width="250" height="64" rx="6"/>
  </g>
  <rect x="350" y="124" width="250" height="100" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="270" y1="58" x2="348" y2="58" marker-end="url(#fl-mil3)"/>
    <line x1="270" y1="174" x2="348" y2="174" marker-end="url(#fl-mil3)"/>
    <line x1="475" y1="224" x2="475" y2="246" marker-end="url(#fl-mil3)"/>
  </g>
  <g text-anchor="middle">
    <text x="145" y="40" style="fill:var(--color-fg)">Public</text>
    <text x="145" y="60" style="fill:var(--color-muted);font-size:12px">the standards: MODELS, LOOP,</text>
    <text x="145" y="76" style="fill:var(--color-muted);font-size:12px">SESSION-LOOP, HOOKS, VOICE</text>
    <text x="145" y="92" style="fill:var(--color-muted);font-size:11px">and the portfolio repo that renders them</text>
    <text x="145" y="148" style="fill:var(--color-fg)">Private: the agent-config repo</text>
    <text x="145" y="168" style="fill:var(--color-muted);font-size:12px">the registry with real ids,</text>
    <text x="145" y="184" style="fill:var(--color-muted);font-size:12px">hook scripts and their constants,</text>
    <text x="145" y="200" style="fill:var(--color-muted);font-size:12px">each machine's settings</text>
    <text x="145" y="272" style="fill:var(--color-fg)">Private, in neither repo</text>
    <text x="145" y="292" style="fill:var(--color-muted);font-size:12px">accounts, keys, sign-ins</text>
    <text x="475" y="40" style="fill:var(--color-fg)">The loop contract</text>
    <text x="475" y="60" style="fill:var(--color-muted);font-size:12px">what every session must obey</text>
    <text x="475" y="76" style="fill:var(--color-muted);font-size:12px">stated as policy, with no ids</text>
    <text x="475" y="150" style="fill:var(--color-bg)">The layer, wired per machine</text>
    <text x="475" y="172" style="fill:var(--color-bg);font-size:12px">registry, guards, route check,</text>
    <text x="475" y="188" style="fill:var(--color-bg);font-size:12px">ledger, running under</text>
    <text x="475" y="204" style="fill:var(--color-bg);font-size:12px">your own settings</text>
    <text x="475" y="272" style="fill:var(--color-fg)">Harnesses and models</text>
    <text x="475" y="292" style="fill:var(--color-muted);font-size:12px">Claude Code, OpenCode, Codex</text>
  </g>
</svg>

*The policy is public so you can copy it. The wiring is private because it names things about my machines and my employer that are not mine to publish.*

**Public, and why.** The standards are the contract, and a contract you cannot read cannot be adopted. [MODELS](/standards/models) holds the tiers, the roles, the guard, the equivalents table and the tokenomics rules. [LOOP](/standards/loop), [SESSION-LOOP](/standards/session-loop) and [HOOKS](/standards/hooks) hold what the layer plugs into, and [VOICE](/standards/voice) holds how this note is written. The portfolio repository that renders them is public too. Nothing in them is a model id, an account or a path on my disk.

**Private, and why.** The agent-config repository holds the registry with real identifiers, the hook scripts, and the constants the work guard compares against, which identify an employer. It also holds each machine's settings, which are a permission surface: a session is never allowed to write them, and I apply changes myself from a command that refuses to run unless the repository is clean and level with origin, and backs up the live file first. Accounts, keys and sign-ins are in neither repository, and never should be.

### What you need to build it

You do not need my code. You need these, in this order.

1. **A registry.** One file with your tiers, roles and model ids, and a rule that no other file may contain a model id. Add a cost class and a private flag per model from the start. Retrofitting privacy into a registry that did not have it is harder than starting with it.
2. **Pins that check against the registry.** Every agent file and settings file is a pin, and a checker reports any that disagree. This is how mine found five files that disagreed.
3. **A main-model guard.** Whatever starts your sessions, make a session on the wrong model stop before it does work, and make the way out explicit and narrow.
4. **A route check.** One script that answers which model takes this task, from the registry and a small state file. Give it exit codes that mean ask me, nothing available and refused, so the caller cannot treat a refusal as a failure to retry.
5. **A cost order and a cap.** Free, then what you have already paid for, then metered, with a daily limit on the last one and a question when you reach it.
6. **A clearance answer per repository.** Ask once, store the answer, and never default to yes.
7. **A work lane with constants in code.** If you also use AI at work, put the identifiers of your work context where no answer can change them, and fail closed when the device cannot be identified.
8. **A usage record.** One line per session and subagent, with the cost class and the private flag, from day one.
9. **A verifier that grades its own checks.** Five levels, one line per check, and a rule that a capability is never reported as working on configuration alone.

If you want to start smaller, steps 1, 4 and 5 give you most of the saving. Steps 7 and 6 are the ones to add before you let a free model near anything you do not own.

## What the layer does not do

The layer proves the routing and the privacy rules. It does not prove the work is good. The second reader, the fresh goldfish, is still the thing that catches that. Ten times zero is still zero, and a cheaper model is still a model.

## The sources

The idea of reviewing a plan with fresh readers comes from Google's [Elephants, Goldfish, and the New Golden Age of Software Engineering](https://research.google/pubs/elephants-goldfish-and-the-new-golden-age-of-software-engineering/), and the practice I adapted is in the [elephant-goldfish-model](https://github.com/google/elephant-goldfish-model) repository, Apache 2.0. [OpenCode](https://opencode.ai) is the harness. [Addy Osmani](/people#addy-osmani) is on the reading page for the loop, and the vocabulary of harness, loop and standards comes from [The Loop Outlives the Model](one-loop-three-harnesses.md) and [Set Up the Loop With One Prompt](loop-setup.md). The policy is [MODELS](/standards/models), the review practice is [AI-DEVELOPMENT](/standards/ai-development), and the desk that shows the usage is [PANTRY](pantry-beside-the-work.md). The numbers here are a snapshot from 2026-11-23, and every model name will be out of date before you read this, which is the reason the registry exists.

## The turn

I ran out at the wrong moment, with four hours left on a clock I could not argue with. Now the next model is a lookup, the lookup knows what it is allowed to touch, and I stay in the zone.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
