---
title: "How the Model Intelligence Layer Works"
audience: [build, learn]
level: deep
subtitle: "The registry, the guards, the fallback order and the usage record, one piece at a time, each graded by what it proves."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-23
readingTime: "~21 min"
tags: [ai, workflow, tokenomics, standards, tooling]
summary: >
  The technical companion to the note on why I built a Model Intelligence Layer. It shows the registry
  that owns every model id, the model guard that restarts a session on the wrong model, the route check
  with its fallback order, cooldowns and repository clearance, the hard guards that keep free models off
  work, and the usage record PANTRY reads. It ends with what is public, what is private, and a list of
  the steps to build your own.
social: |
  The layer behind my model choices is five small pieces: a registry, a model guard, a route check, a work
  guard and a usage record.

  This is the technical note. Every diagram can be dragged and zoomed. It shows how each piece works, what
  it proves, which parts of my setup are public and which are private, and the steps to build your own.
socialImage: "/media/notes/necessity-and-the-model-layer-social.png"
socialImageAlt: "The layers of the setup stacked on one card: me, the loop of standards, plans, review and human gates, then the Model Intelligence Layer with a registry, route check, model guard and work guard, then the harnesses Claude Code, OpenCode and the Codex app, then the models, where the free models and the DeepSeek API are dashed because they may keep prompts. A line says they are for personal projects only."
---


> This is the technical companion to [Necessity Is the Mother of Innovation](necessity-and-the-model-layer.md), which tells why I built the layer. This note shows how it works, piece by piece, so you can build your own.

Everything here comes from the setup I run every day. Each diagram can be dragged and zoomed, and hovering a box lights up what connects to it.

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


<!-- stack:parts -->
<svg viewBox="0 0 640 698" width="100%" role="img" aria-label="Every part of the layer, top to bottom. I make the requests and approvals. Under me the loop holds public standards, plans, independent review and human gates. Under the loop the Model Intelligence Layer has five parts: the registry of model ids, tiers and roles; the model guard that restarts a session on the wrong model; the route check that picks a model with cooldowns and repository clearance; the work guard that allows only a company account at work; and the usage record, one line per session. Under the layer are three harnesses: Claude Code, which the model guard and the work guard cover; OpenCode, which the route check and the launch gate cover; and the Codex app, which the work guard covers. Under the harnesses are four groups of models: Claude and Codex models, which are private, and the free models and the DeepSeek API, which are not. The usage record feeds PANTRY, which keeps the shared state." style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif"><rect x="20" y="14" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Me</text><text x="320" y="54" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Requests and approvals</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="70" x2="320" y2="92"/><path d="M316,86 L320,92 L324,86"/><path d="M316,76 L320,70 L324,76"/></g><rect x="20" y="96" width="600" height="78" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="118" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">The loop</text><rect x="32" y="122" width="136.5" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="100.25" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Public standards</text><rect x="178.5" y="122" width="136.5" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="246.75" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Plans</text><rect x="325" y="122" width="136.5" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="393.25" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Independent review</text><rect x="471.5" y="122" width="136.5" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="539.75" y="142" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Human gates</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="178" x2="320" y2="200"/><path d="M316,194 L320,200 L324,194"/><path d="M316,184 L320,178 L324,184"/></g><rect x="20" y="204" width="600" height="110" rx="8" style="fill:none;stroke:var(--color-fg);stroke-width:2.2"/><text x="320" y="226" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">The Model Intelligence Layer</text><rect x="32" y="230" width="107.2" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="85.6" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Registry</text><text x="85.6" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">model ids,</text><text x="85.6" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">tiers, roles</text><rect x="149.2" y="230" width="107.2" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="202.79999999999998" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Model guard</text><text x="202.79999999999998" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">wrong model</text><text x="202.79999999999998" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">restarts</text><rect x="266.4" y="230" width="107.2" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Route check</text><text x="320" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">order, cooldowns,</text><text x="320" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">clearance</text><rect x="383.6" y="230" width="107.2" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="437.20000000000005" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Work guard</text><text x="437.20000000000005" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">company account</text><text x="437.20000000000005" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">only at work</text><rect x="500.8" y="230" width="107.2" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="554.4" y="250" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Usage record</text><text x="554.4" y="268" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">one line per</text><text x="554.4" y="283" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">session</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="318" x2="320" y2="340"/><path d="M316,334 L320,340 L324,334"/><path d="M316,324 L320,318 L324,324"/></g><rect x="20" y="344" width="600" height="110" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="366" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Harnesses, and which parts cover them</text><rect x="32" y="370" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="124.66666666666667" y="390" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Claude Code</text><text x="124.66666666666667" y="408" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">model guard,</text><text x="124.66666666666667" y="423" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">work guard</text><rect x="227.33333333333334" y="370" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="390" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">OpenCode</text><text x="320" y="408" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">route check,</text><text x="320" y="423" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">launch gate</text><rect x="422.6666666666667" y="370" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="515.3333333333334" y="390" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Codex app</text><text x="515.3333333333334" y="408" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">work guard</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="458" x2="320" y2="480"/><path d="M316,474 L320,480 L324,474"/><path d="M316,464 L320,458 L324,464"/></g><rect x="20" y="484" width="600" height="94" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="506" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Models</text><rect x="32" y="510" width="136.5" height="46" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="100.25" y="530" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Claude</text><text x="100.25" y="548" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">private</text><rect x="178.5" y="510" width="136.5" height="46" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="246.75" y="530" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Codex models</text><text x="246.75" y="548" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">private</text><rect x="325" y="510" width="136.5" height="46" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:5 4"/><text x="393.25" y="530" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Free models</text><text x="393.25" y="548" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">not private</text><rect x="471.5" y="510" width="136.5" height="46" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:5 4"/><text x="539.75" y="530" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">DeepSeek API</text><text x="539.75" y="548" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">paid, not private</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="582" x2="320" y2="604"/><path d="M316,598 L320,604 L324,598"/><path d="M316,588 L320,582 L324,588"/></g><line x1="20" y1="608" x2="620" y2="608" style="stroke:var(--color-line);stroke-width:1"/><text x="24" y="632" style="fill:var(--color-fg);font-size:14px">PANTRY</text><text x="24" y="652" style="fill:var(--color-muted);font-size:12px">Reads the usage records, free and paid kept apart.</text><text x="24" y="668" style="fill:var(--color-muted);font-size:12px">Shared state that any session can read.</text></svg>
<!-- /stack:parts -->

*Every part of the layer, top to bottom. The heavy outline is the layer itself, and the dashed tiles are the models that may keep what they are sent.*


## Orchestration stays on the strong tier, and the way it gets there matters

My first instinct was to switch the main session's model whenever the work got hard. I did not build that, for two reasons I only learned by trying. A hook cannot switch the main session's model at all, so the switch would depend on a model remembering to ask. And switching mid-session throws away the prompt cache, so the whole conversation is paid for again at the new tier's price on the next turn.

So escalation is delegation, which I was already doing before the layer existed: light work went down from Sonnet to Haiku. The layer keeps that rule and adds rungs under it. When the next piece is planning, architecture or review, the main session hands it to a subagent pinned to the strong tier. The subagent's context ends when the piece ends, and the main session keeps its cache. Opus on Claude Code and Sol on Codex and OpenCode keep orchestration, and nothing in the free chain is ever allowed to take it.

<!-- stack:delegation -->
<svg viewBox="0 0 640 384" width="100%" role="img" aria-label="Escalation is delegation, not a switch. The main session runs on the execution tier and holds the conversation and its prompt cache. When the next piece is planning, architecture or review, the main session hands it to a subagent pinned to the strong tier. The subagent reads only the plan and the files it links, and its context ends when the piece ends. The answer returns to the main session, which keeps its cache and carries on at its own tier. Switching the main session's model instead would throw the cache away." style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif"><rect x="20" y="14" width="600" height="68" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Main session, on the execution tier</text><text x="320" y="54" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Sonnet on Claude Code, Sol at low effort on Codex.</text><text x="320" y="70" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">It keeps the conversation and its prompt cache.</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="86" x2="320" y2="108"/><path d="M316,102 L320,108 L324,102"/></g><rect x="20" y="112" width="600" height="78" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="134" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">The next piece needs judgment</text><rect x="32" y="138" width="185.33333333333334" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="124.66666666666667" y="158" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Planning</text><rect x="227.33333333333334" y="138" width="185.33333333333334" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="158" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Architecture</text><rect x="422.6666666666667" y="138" width="185.33333333333334" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="515.3333333333334" y="158" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Review</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="194" x2="320" y2="216"/><path d="M316,210 L320,216 L324,210"/></g><rect x="20" y="220" width="600" height="68" rx="8" style="fill:none;stroke:var(--color-fg);stroke-width:2.2"/><text x="320" y="242" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">A subagent pinned to the strong tier</text><text x="320" y="260" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Opus on Claude Code, Sol on Codex and OpenCode.</text><text x="320" y="276" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">It gets the plan and the files it links. Its context ends with the piece.</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="292" x2="320" y2="314"/><path d="M316,308 L320,314 L324,308"/></g><rect x="20" y="318" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="340" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">One answer comes back</text><text x="320" y="358" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">The main session carries on at its own tier, with its cache intact.</text></svg>
<!-- /stack:delegation -->

*A piece that needs judgment goes down to the strong tier and comes back as one answer, so the cache stays warm.*

The review half of this borrows a name. Google published a paper on what it calls [the Elephant-Goldfish model](https://research.google/pubs/elephants-goldfish-and-the-new-golden-age-of-software-engineering/), and there is [a repository](https://github.com/google/elephant-goldfish-model) with the practice written down. The shape I took from it is simple. The long session that holds all the context is the elephant, and its job ends at a plan another reader can follow. Fresh reviewers with no memory of the conversation are the goldfish. They get the plan file and the files it links, nothing else, and they tell you where the plan does not stand up on its own. My adaptation, three goldfish with three roles, is written up in [AI-DEVELOPMENT](/standards/ai-development), and it keeps the fresh-context rule and drops what my other standards already cover.

The layer is what makes that cheap enough to do every time. The elephant runs on the cheaper execution tier. The goldfish and the planner are pinned to the strong tier, so the expensive model only ever reads what it needs to judge. A hook watches each prompt and names the agent that fits, once per case per session, so it advises and does not nag. Every spawn also has to carry an envelope: the lane, the scope cap, the hard stops and the ask-triggers. A spawn without one is refused. That is how delegation and subagent rules get enforced rather than hoped for.

<!-- stack:review -->
<svg viewBox="0 0 640 482" width="100%" role="img" aria-label="Where the elephant and the goldfish fit. The elephant, the long session with the project context, writes the canonical plan and stores it under plans with its linked dependencies. Three independent goldfish then review it cold: comprehension asks whether a fresh reader can explain the plan, the critic asks what assumptions, risks or dependencies are missing, and readiness asks whether an independent implementer could build it. The elephant resolves the findings and I approve the plan, with the review evidence kept under artifacts and reviews. A fresh session then builds against the approved plan and an independent auditor verifies the result." style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif"><rect x="20" y="14" width="600" height="68" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Elephant: context-rich planning</text><text x="320" y="54" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Holds the project history, the requirements and the decisions,</text><text x="320" y="70" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">and produces the canonical plan</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="86" x2="320" y2="108"/><path d="M316,102 L320,108 L324,102"/></g><rect x="20" y="112" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="134" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Canonical plan</text><text x="320" y="152" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Stored under plans, with its linked dependencies</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="168" x2="320" y2="190"/><path d="M316,184 L320,190 L324,184"/></g><rect x="20" y="194" width="600" height="110" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="216" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Three independent goldfish reviews</text><rect x="32" y="220" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="124.66666666666667" y="240" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Comprehension</text><text x="124.66666666666667" y="258" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">Can a fresh reader</text><text x="124.66666666666667" y="273" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">explain the plan?</text><rect x="227.33333333333334" y="220" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="240" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Critic</text><text x="320" y="258" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">What assumptions, risks</text><text x="320" y="273" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">or dependencies are missing?</text><rect x="422.6666666666667" y="220" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="515.3333333333334" y="240" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Readiness</text><text x="515.3333333333334" y="258" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">Can an independent</text><text x="515.3333333333334" y="273" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">implementer build it?</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="308" x2="320" y2="330"/><path d="M316,324 L320,330 L324,324"/></g><rect x="20" y="334" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="356" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">The elephant resolves the findings, then I approve</text><text x="320" y="374" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Review evidence goes under artifacts and reviews</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="390" x2="320" y2="412"/><path d="M316,406 L320,412 L324,406"/></g><rect x="20" y="416" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-fg);stroke-width:2.2"/><text x="320" y="438" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Fresh implementation, then the auditor</text><text x="320" y="456" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Build against the approved plan, then verify the result on its own</text></svg>
<!-- /stack:review -->

*The elephant plans, three goldfish check the plan cold, and only then does a fresh session build.*

## The guard that restarts a session on the wrong model

A rule that lives in a document is a suggestion. The first rule I enforced was the plainest: every main session runs the registry's main model, and nothing in a menu or a spawner's defaults changes that.

It needed enforcing because a session started by another session inherits that session's model, and I can pick anything from the picker. The guard is one shell script wired to four hook events, and it reads the model out of the transcript, because the desktop app's start event does not carry one.

This note is a small proof. The session that drafted it opened on Opus, the registry says Sonnet, and the guard stopped it before it did any work. It proposed a restart card titled with the right model and effort, the card carried the original prompt, and I clicked it. The replacement session is the one writing this. The stopped one then offered two reply buttons, archive it or keep it, and archived itself only after detaching the replacement. That order is not taste. Archiving a parent archives its children, and the app's automatic mode refuses a hook-requested archive, which is why the restart is a click and the archive is a reply.

Three rules came out of the live runs.

- A phrase in my first prompt, keep this model, records an exception for that one session and nothing else. There is no standing exemption.
- A replacement that is still on the wrong model never respawns again. It takes the blocking path, so a desktop app that ignores the model argument produces one blocked session and never a loop.
- On every other harness the guard exits with an error on the first prompt, prints the restart command and asks me to paste the prompt again. The prompt is never put in a command, so there is no shell quoting to get wrong.

It took six live runs before it passed acceptance, and the run report in my config repo holds the evidence.


<!-- diagram:guard -->
<figure class="diagram" data-diagram="flow">
  <div class="diagram__bar" role="toolbar" aria-label="Diagram controls">
    <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
    <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
    <button type="button" data-zoom="reset">Fit</button>
    <span class="diagram__hint">Scroll or pinch to zoom, drag to pan, hover to trace, click to open.</span>
  </div>
  <svg class="diagram__svg" viewBox="0 0 528 1172" data-w="528" data-h="1172" role="img" aria-label="How the model guard handles a session on the wrong model. At the first prompt it reads the model from the transcript and compares it with the registry's main model. If they match, the work starts. If not, the session stops before doing any work and proposes a restart card with the right model and effort. I click the card and a replacement session runs the task. The stopped session then offers Archive it or Keep it. On Archive it, it detaches the replacement first and archives itself second. A replacement that is still on the wrong model is blocked and never respawns." xmlns="http://www.w3.org/2000/svg"><defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs><g class="dg-edges"><g class="dg-edge" data-edge="start-match" data-ends="start match"><title>start-match</title><path class="dg-line" d="M264,78 L264,174" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,78 L264,174"/></g><g class="dg-edge" data-edge="match-work" data-ends="match work"><title>yes</title><path class="dg-line" d="M237.66007351654122,240.9007526693506 L141.873417721519,346" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M237.66007351654122,240.9007526693506 L141.873417721519,346"/></g><g class="dg-edge" data-edge="match-card" data-ends="match card"><title>no</title><path class="dg-line" d="M286.8623518687329,242.102096627165 L365.7721518987342,346" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M286.8623518687329,242.102096627165 L365.7721518987342,346"/></g><g class="dg-edge" data-edge="card-click" data-ends="card click"><title>card-click</title><path class="dg-line" d="M364,394 L284,490" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M364,394 L284,490"/></g><g class="dg-edge" data-edge="click-again" data-ends="click again"><title>click-again</title><path class="dg-line" d="M264,538 L264,634" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,538 L264,634"/></g><g class="dg-edge" data-edge="again-run" data-ends="again run"><title>yes</title><path class="dg-line" d="M286.8623518687329,702.102096627165 L365.7721518987342,806" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M286.8623518687329,702.102096627165 L365.7721518987342,806"/></g><g class="dg-edge" data-edge="again-block" data-ends="again block"><title>no</title><path class="dg-line" d="M240.09384850941188,701.7415113032514 L156.29113924050634,806" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M240.09384850941188,701.7415113032514 L156.29113924050634,806"/></g><g class="dg-edge" data-edge="run-reply" data-ends="run reply"><title>run-reply</title><path class="dg-line" d="M364,854 L284,950" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M364,854 L284,950"/></g><g class="dg-edge" data-edge="reply-arch" data-ends="reply arch"><title>reply-arch</title><path class="dg-line" d="M264,998 L264,1094" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,998 L264,1094"/></g></g><g class="dg-nodes"><g class="dg-node dg-k-start" data-node="start"><title>First prompt of a session</title><rect class="dg-box" x="167" y="30" width="194" height="48" rx="24"/><text class="dg-title" x="264" y="59" text-anchor="middle">First prompt of a session</text></g><g class="dg-node dg-k-decision" data-node="match"><title>Matches the registry?</title><path class="dg-box" d="M264,174 L374,212 L264,250 L154,212 z"/><text class="dg-title" x="264" y="217" text-anchor="middle">Matches the registry?</text></g><g class="dg-node dg-k-end" data-node="work"><title>Work starts</title><rect class="dg-box dg-heavy" x="30" y="346" width="180" height="48" rx="24"/><text class="dg-title" x="120" y="375" text-anchor="middle">Work starts</text></g><g class="dg-node dg-k-action" data-node="card"><title>Stop, propose the Restart card</title><rect class="dg-box" x="270" y="346" width="228" height="48" rx="6"/><text class="dg-title" x="384" y="375" text-anchor="middle">Stop, propose the Restart card</text></g><g class="dg-node dg-k-action" data-node="click"><title>I click the card</title><rect class="dg-box" x="174" y="490" width="180" height="48" rx="6"/><text class="dg-title" x="264" y="519" text-anchor="middle">I click the card</text></g><g class="dg-node dg-k-decision" data-node="again"><title>Replacement right?</title><path class="dg-box" d="M264,634 L374,672 L264,710 L154,672 z"/><text class="dg-title" x="264" y="677" text-anchor="middle">Replacement right?</text></g><g class="dg-node dg-k-end" data-node="block"><title>Block, never respawn</title><rect class="dg-box dg-heavy" x="47" y="806" width="180" height="48" rx="24"/><text class="dg-title" x="137" y="835" text-anchor="middle">Block, never respawn</text></g><g class="dg-node dg-k-action" data-node="run"><title>Replacement runs the task</title><rect class="dg-box" x="287" y="806" width="194" height="48" rx="6"/><text class="dg-title" x="384" y="835" text-anchor="middle">Replacement runs the task</text></g><g class="dg-node dg-k-action" data-node="reply"><title>Archive it or Keep it</title><rect class="dg-box" x="174" y="950" width="180" height="48" rx="6"/><text class="dg-title" x="264" y="979" text-anchor="middle">Archive it or Keep it</text></g><g class="dg-node dg-k-end" data-node="arch"><title>Detach, then archive</title><rect class="dg-box dg-heavy" x="174" y="1094" width="180" height="48" rx="24"/><text class="dg-title" x="264" y="1123" text-anchor="middle">Detach, then archive</text></g></g><g class="dg-labels"><g class="dg-elabel"><rect x="173.2667456190301" y="284.4503763346753" width="33" height="18" rx="3"/><text x="189.7667456190301" y="297.4503763346753" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="313.31725188373355" y="285.0510483135825" width="26" height="18" rx="3"/><text x="326.31725188373355" y="298.0510483135825" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="309.81725188373355" y="745.0510483135824" width="33" height="18" rx="3"/><text x="326.31725188373355" y="758.0510483135824" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="185.1924938749591" y="744.8707556516257" width="26" height="18" rx="3"/><text x="198.1924938749591" y="757.8707556516257" text-anchor="middle">no</text></g></g></svg>
</figure>
<!-- /diagram:guard -->

*A session on the wrong model stops before it does any work.*

## The free chain, in order

This is the part that fixed the original problem. It is the same ladder as Sonnet down to Haiku, extended across providers and down to free. For light work, the layer tries these in order and takes the first one that is not skipped.

**Claude is not in this chain, and the reason is the plan, not the model.** As far as I have tested, Anthropic admits a third-party harness only through an API token, which is billed on its own and not tied to the five-hour or weekly usage of a plan. Codex admits its plan directly, so OpenCode can spend the Codex plan I already pay for. A Claude plan can only be spent inside Claude Code, which runs Claude on the tiers pinned in its agent files, and those subagents never go through the route check. So the chain holds the free models and Codex, and Claude lives one level up, in its own harness.

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


<!-- diagram:route -->
<figure class="diagram" data-diagram="flow">
  <div class="diagram__bar" role="toolbar" aria-label="Diagram controls">
    <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
    <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
    <button type="button" data-zoom="reset">Fit</button>
    <span class="diagram__hint">Scroll or pinch to zoom, drag to pan, hover to trace, click to open.</span>
  </div>
  <svg class="diagram__svg" viewBox="0 0 528 1372" data-w="528" data-h="1372" role="img" aria-label="How the route check picks a model for a delegated light task. First it checks whether the repository has been answered, and asks once if not. Then it walks the light chain in order and takes the first entry that is not skipped. An entry is skipped when it is not private and the repository is not cleared, when it is cooling down, when it is demoted for the day, or when its plan is out. If an entry is left, the task launches. If every entry is skipped, the paid DeepSeek API is used under a daily cap, and past the cap the route check stops and asks me. If the launched child hits a rate limit, the model is put on a cooldown and the route check picks once more." xmlns="http://www.w3.org/2000/svg"><defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs><g class="dg-edges"><g class="dg-edge" data-edge="start-repo" data-ends="start repo"><title>start-repo</title><path class="dg-line" d="M264,78 L264,174" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,78 L264,174"/></g><g class="dg-edge" data-edge="repo-ask" data-ends="repo ask"><title>no</title><path class="dg-line" d="M264,250 L264,346" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,250 L264,346"/></g><g class="dg-edge" data-edge="repo-walk" data-ends="repo walk"><title>yes</title><path class="dg-line" d="M264,250 L264,490" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,250 L264,490"/></g><g class="dg-edge" data-edge="ask-walk" data-ends="ask walk"><title>ask-walk</title><path class="dg-line" d="M264,394 L264,490" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,394 L264,490"/></g><g class="dg-edge" data-edge="walk-left" data-ends="walk left"><title>walk-left</title><path class="dg-line" d="M264,538 L264,634" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,538 L264,634"/></g><g class="dg-edge" data-edge="left-launch" data-ends="left launch"><title>yes</title><path class="dg-line" d="M251.72393538913363,705.7591776798826 L152.72727272727272,978" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M251.72393538913363,705.7591776798826 L152.72727272727272,978"/></g><g class="dg-edge" data-edge="left-paid" data-ends="left paid"><title>no</title><path class="dg-line" d="M264,710 L264,806" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,710 L264,806"/></g><g class="dg-edge" data-edge="paid-launch" data-ends="paid launch"><title>The paid DeepSeek API runs as the last entry, under the daily cap</title><path class="dg-line" d="M241.1376481312671,874.102096627165 L162.22784810126583,978" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M241.1376481312671,874.102096627165 L162.22784810126583,978"/></g><g class="dg-edge" data-edge="paid-stop" data-ends="paid stop"><title>no</title><path class="dg-line" d="M286.8623518687329,874.102096627165 L365.7721518987342,978" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M286.8623518687329,874.102096627165 L365.7721518987342,978"/></g><g class="dg-edge" data-edge="launch-limit" data-ends="launch limit"><title>launch-limit</title><path class="dg-line" d="M162.22784810126583,1026 L241.1376481312671,1129.8979033728351" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M162.22784810126583,1026 L241.1376481312671,1129.8979033728351"/></g><g class="dg-edge" data-edge="limit-retry" data-ends="limit retry"><title>yes</title><path class="dg-line" d="M241.1376481312671,1190.1020966271649 L162.22784810126583,1294" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M241.1376481312671,1190.1020966271649 L162.22784810126583,1294"/></g><g class="dg-edge" data-edge="limit-done" data-ends="limit done"><title>no</title><path class="dg-line" d="M290.3399264834588,1188.9007526693506 L386.126582278481,1294" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M290.3399264834588,1188.9007526693506 L386.126582278481,1294"/></g></g><g class="dg-nodes"><g class="dg-node dg-k-start" data-node="start"><title>Delegated light task</title><rect class="dg-box" x="174" y="30" width="180" height="48" rx="24"/><text class="dg-title" x="264" y="59" text-anchor="middle">Delegated light task</text></g><g class="dg-node dg-k-decision" data-node="repo"><title>Repo answered?</title><path class="dg-box" d="M264,174 L374,212 L264,250 L154,212 z"/><text class="dg-title" x="264" y="217" text-anchor="middle">Repo answered?</text></g><g class="dg-node dg-k-action" data-node="ask"><title>Ask me, store the answer</title><rect class="dg-box" x="170" y="346" width="188" height="48" rx="6"/><text class="dg-title" x="264" y="375" text-anchor="middle">Ask me, store the answer</text></g><g class="dg-node dg-k-action" data-node="walk"><title>Walk the light chain in order</title><rect class="dg-box" x="153" y="490" width="222" height="48" rx="6"/><text class="dg-title" x="264" y="519" text-anchor="middle">Walk the light chain in order</text></g><g class="dg-node dg-k-decision" data-node="left"><title>Entry left?</title><path class="dg-box" d="M264,634 L374,672 L264,710 L154,672 z"/><text class="dg-title" x="264" y="677" text-anchor="middle">Entry left?</text></g><g class="dg-node dg-k-decision" data-node="paid"><title>Under the daily cap?</title><path class="dg-box" d="M264,806 L374,844 L264,882 L154,844 z"/><text class="dg-title" x="264" y="849" text-anchor="middle">Under the daily cap?</text></g><g class="dg-node dg-k-action" data-node="launch"><title>Launch the child</title><rect class="dg-box" x="54" y="978" width="180" height="48" rx="6"/><text class="dg-title" x="144" y="1007" text-anchor="middle">Launch the child</text></g><g class="dg-node dg-k-decision" data-node="limit"><title>Rate limit?</title><path class="dg-box" d="M264,1122 L374,1160 L264,1198 L154,1160 z"/><text class="dg-title" x="264" y="1165" text-anchor="middle">Rate limit?</text></g><g class="dg-node dg-k-action" data-node="retry"><title>Cool the model, pick once more</title><rect class="dg-box" x="30" y="1294" width="228" height="48" rx="6"/><text class="dg-title" x="144" y="1323" text-anchor="middle">Cool the model, pick once more</text></g><g class="dg-node dg-k-end" data-node="stop"><title>Stop and ask me</title><rect class="dg-box dg-heavy" x="294" y="978" width="180" height="48" rx="24"/><text class="dg-title" x="384" y="1007" text-anchor="middle">Stop and ask me</text></g><g class="dg-node dg-k-end" data-node="done"><title>Record the usage</title><rect class="dg-box dg-heavy" x="318" y="1294" width="180" height="48" rx="24"/><text class="dg-title" x="408" y="1323" text-anchor="middle">Record the usage</text></g></g><g class="dg-labels"><g class="dg-elabel"><rect x="251" y="289" width="26" height="18" rx="3"/><text x="264" y="302" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="247.5" y="405" width="33" height="18" rx="3"/><text x="264" y="418" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="185.72560405820317" y="898.8795888399413" width="33" height="18" rx="3"/><text x="202.22560405820317" y="911.8795888399413" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="251" y="749" width="26" height="18" rx="3"/><text x="264" y="762" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="185.18274811626645" y="917.0510483135824" width="33" height="18" rx="3"/><text x="201.68274811626645" y="930.0510483135824" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="313.31725188373355" y="917.0510483135824" width="26" height="18" rx="3"/><text x="326.31725188373355" y="930.0510483135824" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="185.18274811626645" y="1233.0510483135824" width="33" height="18" rx="3"/><text x="201.68274811626645" y="1246.0510483135824" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="325.2332543809699" y="1232.4503763346752" width="26" height="18" rx="3"/><text x="338.2332543809699" y="1245.4503763346752" text-anchor="middle">no</text></g></g></svg>
</figure>
<!-- /diagram:route -->

*The route check, from the delegated task to a launched child. A rate limit sends it round once.*

## Repository clearance and the privacy flag

**Why every model carries a private flag.** A free endpoint may keep whatever you send it, and I cannot read every provider's terms every time I add a model. DeepSeek, the paid API included, is a service under a different jurisdiction than mine. So I stopped reasoning about each one and wrote the answer into the registry once. A model is private when it is one of the two providers I would let see work code, and not private otherwise. The route check reads the flag, so a model nobody has classified never gets the benefit of the doubt.

Every model in the registry carries two keys: a cost class, which is free, plan or metered, and a private flag. Claude and Codex are private. Every free model is not private, and so is every DeepSeek model, the paid API included. An id nobody has listed is recorded as unknown and not private, so a model nobody classified is never counted as safe. Here is the registry's view of the models in play, by name, with the two keys.

| Model | Runs on | Cost class | Private | Where it sits |
|---|---|---|---|---|
| Claude Opus, Sonnet, Haiku | Claude Code | plan | yes | The strong, execution and cheapest tiers on Claude. Not in the chain. |
| GPT Sol | Codex, OpenCode | plan | yes | The strong tier on Codex, and the main model on OpenCode. In the chain at low effort. |
| GPT Luna | Codex, OpenCode | plan | yes | The cheapest tier on Codex, and the first Codex entry in the chain. |
| DeepSeek V4.1 Flash Free | OpenCode | free | no | First in the chain. |
| MiMo V2.6 Flash Free | OpenCode | free | no | Second in the chain. |
| LongCat 2.5 Free | OpenCode | free | no | Third in the chain. |
| Nemotron 3.5 Lightning Free | OpenCode | free | no | Fourth in the chain. |
| Flint 40B Free | OpenCode | free | no | Fifth in the chain. |
| DeepSeek V4.1 Flash | OpenCode | metered | no | Last in the chain, under a daily cap. Also the strong tier when both plans are out. |
| GPT Astra | Codex | plan | yes | A paid escalation only. It needs my approval and is not wired. |

A flag is not a decision, so the second piece is a question I answer once per repository. The first time the route check runs in a repository it has no entry for, it stops and asks whether non-private models may see this code. On yes, the full chain applies. On no, only Claude and Codex are candidates, so the work still runs and never leaves those two providers. Nothing is cleared by default.

The answer is stored under the lower-cased absolute path of the repository's top level, so a subfolder or a worktree maps to its own repository. It is a small list of true and false. Not clever, and exactly as clever as it needs to be.

## Work is a different lane, enforced three ways

Everything above is for my personal projects. This section is the opposite.

**The free models and DeepSeek are for personal projects only. A work machine and a work repository use only the company's Claude and Codex, and three separate guards enforce that, so a mistake has to get past all three.** I will describe them without the company's identifiers, because the identifiers are the one thing in this setup I will never publish.


<!-- diagram:work -->
<figure class="diagram" data-diagram="flow">
  <div class="diagram__bar" role="toolbar" aria-label="Diagram controls">
    <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
    <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
    <button type="button" data-zoom="reset">Fit</button>
    <span class="diagram__hint">Scroll or pinch to zoom, drag to pan, hover to trace, click to open.</span>
  </div>
  <svg class="diagram__svg" viewBox="0 0 678 912" data-w="678" data-h="912" role="img" aria-label="How the work lane is guarded. A session starts and the machine is identified from its own name. A machine that cannot be identified counts as a work machine. A work machine, or a work repository, puts the session in work context. In work context every prompt passes the account check: a company account passes and any other account, a personal Claude or Codex included, is blocked. Launching DeepSeek Harness or OpenCode in work context is refused by the launch gate. Outside work context, a personal machine in a repository I have cleared may use the free chain." xmlns="http://www.w3.org/2000/svg"><defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs><g class="dg-edges"><g class="dg-edge" data-edge="start-id" data-ends="start id"><title>start-id</title><path class="dg-line" d="M339,78 L339,174" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M339,78 L339,174"/></g><g class="dg-edge" data-edge="id-ctx" data-ends="id ctx"><title>yes</title><path class="dg-line" d="M339,250 L339,346" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M339,250 L339,346"/></g><g class="dg-edge" data-edge="id-work" data-ends="id work"><title>A machine the setup cannot identify counts as a work machine</title><path class="dg-line" d="M318.48500739545517,242.9130025547936 L135.92727272727274,518" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M318.48500739545517,242.9130025547936 L135.92727272727274,518"/></g><g class="dg-edge" data-edge="ctx-work" data-ends="ctx work"><title>yes</title><path class="dg-line" d="M303.3833164734262,409.69605478172906 L153.26582278481013,518" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M303.3833164734262,409.69605478172906 L153.26582278481013,518"/></g><g class="dg-edge" data-edge="ctx-personal" data-ends="ctx personal"><title>no</title><path class="dg-line" d="M361.8623518687329,414.102096627165 L440.7721518987342,518" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M361.8623518687329,414.102096627165 L440.7721518987342,518"/></g><g class="dg-edge" data-edge="work-acct" data-ends="work acct"><title>every prompt</title><path class="dg-line" d="M128.27848101265823,566 L162.78800575805872,666.0459616472161" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M128.27848101265823,566 L162.78800575805872,666.0459616472161"/></g><g class="dg-edge" data-edge="work-gate" data-ends="work gate"><title>launch attempt</title><path class="dg-line" d="M174.53164556962025,566 L424.46835443037975,676" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M174.53164556962025,566 L424.46835443037975,676"/></g><g class="dg-edge" data-edge="acct-block" data-ends="acct block"><title>Any account that is not a company account, or one the hook cannot read</title><path class="dg-line" d="M184.2535525142887,734.6305909496093 L212.2405063291139,834" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M184.2535525142887,734.6305909496093 L212.2405063291139,834"/></g><g class="dg-edge" data-edge="acct-pass" data-ends="acct pass"><title>yes</title><path class="dg-line" d="M216.68403036430067,723.4273349650598 L415.7848101265823,834" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M216.68403036430067,723.4273349650598 L415.7848101265823,834"/></g></g><g class="dg-nodes"><g class="dg-node dg-k-start" data-node="start"><title>A session starts</title><rect class="dg-box" x="249" y="30" width="180" height="48" rx="24"/><text class="dg-title" x="339" y="59" text-anchor="middle">A session starts</text></g><g class="dg-node dg-k-decision" data-node="id"><title>Machine identified?</title><path class="dg-box" d="M339,174 L449,212 L339,250 L229,212 z"/><text class="dg-title" x="339" y="217" text-anchor="middle">Machine identified?</text></g><g class="dg-node dg-k-decision" data-node="ctx"><title>Work machine or repo?</title><path class="dg-box" d="M339,346 L449,384 L339,422 L229,384 z"/><text class="dg-title" x="339" y="389" text-anchor="middle">Work machine or repo?</text></g><g class="dg-node dg-k-action" data-node="work"><title>Work context</title><rect class="dg-box" x="30" y="518" width="180" height="48" rx="6"/><text class="dg-title" x="120" y="547" text-anchor="middle">Work context</text></g><g class="dg-node dg-k-end" data-node="personal"><title>Personal lane: a cleared repo may use the free chain</title><rect class="dg-box dg-heavy" x="270" y="518" width="378" height="48" rx="24"/><text class="dg-title" x="459" y="547" text-anchor="middle">Personal lane: a cleared repo may use the free chain</text></g><g class="dg-node dg-k-decision" data-node="acct"><title>Company account?</title><path class="dg-box" d="M174.5,662 L284.5,700 L174.5,738 L64.5,700 z"/><text class="dg-title" x="174.5" y="705" text-anchor="middle">Company account?</text></g><g class="dg-node dg-k-end" data-node="gate"><title>Launch gate refuses dsh and opencode</title><rect class="dg-box dg-heavy" x="344.5" y="676" width="269" height="48" rx="24"/><text class="dg-title" x="479" y="705" text-anchor="middle">Launch gate refuses dsh and opencode</text></g><g class="dg-node dg-k-end" data-node="block"><title>Prompt blocked</title><rect class="dg-box dg-heavy" x="129" y="834" width="180" height="48" rx="24"/><text class="dg-title" x="219" y="863" text-anchor="middle">Prompt blocked</text></g><g class="dg-node dg-k-end" data-node="pass"><title>Prompt passes</title><rect class="dg-box dg-heavy" x="369" y="834" width="180" height="48" rx="24"/><text class="dg-title" x="459" y="863" text-anchor="middle">Prompt passes</text></g></g><g class="dg-labels"><g class="dg-elabel"><rect x="322.5" y="289" width="33" height="18" rx="3"/><text x="339" y="302" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="214.20614006136395" y="327.4565012773968" width="26" height="18" rx="3"/><text x="227.20614006136395" y="340.4565012773968" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="211.82456962911817" y="454.84802739086456" width="33" height="18" rx="3"/><text x="228.32456962911817" y="467.84802739086456" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="388.31725188373355" y="457.0510483135825" width="26" height="18" rx="3"/><text x="401.31725188373355" y="470.0510483135825" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="98.53324338535847" y="607.0229808236081" width="94" height="18" rx="3"/><text x="145.53324338535847" y="620.0229808236081" text-anchor="middle">every prompt</text></g><g class="dg-elabel"><rect x="245.5" y="612" width="108" height="18" rx="3"/><text x="299.5" y="625" text-anchor="middle">launch attempt</text></g><g class="dg-elabel"><rect x="185.2470294217013" y="775.3152954748047" width="26" height="18" rx="3"/><text x="198.2470294217013" y="788.3152954748047" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="299.73442024544147" y="769.7136674825299" width="33" height="18" rx="3"/><text x="316.23442024544147" y="782.7136674825299" text-anchor="middle">yes</text></g></g></svg>
</figure>
<!-- /diagram:work -->

*One question, asked first, and three locks on the work side.*


**Fail-closed machine detection.** Each machine of mine is a directory in the private config repo, and a device resolves which one it is from its own hostname. When nothing resolves, the device is treated as a work machine. That does not mean only the company's Claude and Codex can run. It means the account check below applies, so a company account still works and a personal one is blocked until the machine is identified. An unidentified machine is the wrong place to guess, and the cost of guessing wrong the safe way is a blocked prompt, which I can fix in a minute.

**An account check on every prompt.** In work context, a hook reads which account the harness is signed in to. A company account passes. Any other account blocks the prompt, my personal Claude and my personal Codex included, and so does an account the hook cannot read. So the lane is enforced by the account itself, not by which program runs: the same Claude Code works at work with the company account and works on my personal projects with my own. At session start the hook only warns. The prompt is where it blocks. It prints only the word company, never the address it read, and it works for both Claude and Codex.

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

**I work at low effort, on purpose.** No pin in the registry sets reasoning effort to high. The strong tier earns its place through the model, and an execution-tier model at high effort is a strong-tier bill without a strong-tier choice behind it. Opus runs at low effort. Sonnet runs at medium. I wrote the argument for working this way, with its figure of the four boxes that let a session on low effort stay right, in [Plan on the Big Model, Type on the Small One](plan-big-type-small.md). The layer is one more of those boxes: it takes the model choice off the session, so the session has less to hold. I have worked at low effort ever since, and the work has held up, which is the evidence I have.

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

The layer is not finished, and I would rather say so than let the diagrams above suggest otherwise. Built so far are the registry, the tiers and roles, the session check, the model guard, the operational fallback, the work guards and the usage records. A second phase is planned and not built.

| Planned, not built | State |
|---|---|
| Recorded paid escalation | Paid escalation is still marked approval-required and unwired in the registry |
| Predictive context budgeting | Not built |
| Recovery checkpoints and session continuation | Not built |
| Goldfish freshness enforcement | Not built. The review in the figure above is a practice with agents today, not something a hook enforces |
| Execution supervisor, run evidence and decisions | Not built |
| Model Scout | Not built |

[Phase B: update this table and the diagrams as each part lands.]

The layer proves the routing and the privacy rules. It does not prove the work is good. The second reader, the fresh goldfish, is still the thing that catches that. Ten times zero is still zero, and a cheaper model is still a model.

## The sources

The idea of reviewing a plan with fresh readers comes from Google's [Elephants, Goldfish, and the New Golden Age of Software Engineering](https://research.google/pubs/elephants-goldfish-and-the-new-golden-age-of-software-engineering/), and the practice I adapted is in the [elephant-goldfish-model](https://github.com/google/elephant-goldfish-model) repository, Apache 2.0. [OpenCode](https://opencode.ai) is the harness. [Addy Osmani](/people#addy-osmani) is on the reading page for the loop, and the vocabulary of harness, loop and standards comes from [The Loop Outlives the Model](one-loop-three-harnesses.md) and [Set Up the Loop With One Prompt](loop-setup.md). The policy is [MODELS](/standards/models), the review practice is [AI-DEVELOPMENT](/standards/ai-development), and the desk that shows the usage is [PANTRY](pantry-beside-the-work.md). The numbers here are a snapshot from 2026-11-23, and every model name will be out of date before you read this, which is the reason the registry exists.

## The turn

I ran out at the wrong moment, with four hours left on a clock I could not argue with. Now the next model is a lookup, the lookup knows what it is allowed to touch, and I stay in the zone.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
