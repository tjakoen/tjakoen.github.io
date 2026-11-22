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
socialImageAlt: "The full architecture of the Model Intelligence Layer on one card: three harnesses feed one layer made of a registry, a model guard, a route check and a work guard, which picks between private Claude and Codex models and non-private free and DeepSeek models, and writes one usage record per session."
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

*Every part of the layer, top to bottom. The dashed boxes are the models that may keep what they are sent.*


## Orchestration stays on the strong tier, and the way it gets there matters

My first instinct was to switch the main session's model whenever the work got hard. I did not build that, for two reasons I only learned by trying. A hook cannot switch the main session's model at all, so the switch would depend on a model remembering to ask. And switching mid-session throws away the prompt cache, so the whole conversation is paid for again at the new tier's price on the next turn.

So escalation is delegation. When the next piece is planning, architecture or review, the main session hands it to a subagent pinned to the strong tier. The subagent's context ends when the piece ends, and the main session keeps its cache. Opus on Claude Code and Sol on Codex and OpenCode keep orchestration, and nothing in the free chain is ever allowed to take it.

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

Every model in the registry carries two keys: a cost class, which is free, plan or metered, and a private flag. Claude and Codex are private. Every free model is not private, and so is every DeepSeek model, the paid API included. An id nobody has listed is recorded as unknown and not private, so a model nobody classified is never counted as safe.

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
  <svg class="diagram__svg" viewBox="0 0 609 768" data-w="609" data-h="768" role="img" aria-label="How the work lane is guarded. First the machine is identified from its own name, and a machine that cannot be identified counts as a work machine. In work context, every prompt passes the account check, which blocks it unless the signed-in account is a company account. Launching DeepSeek Harness or OpenCode is refused by the launch gate, whatever the repository's clearance says. Outside work context, a repository I have cleared may use the free chain, the Codex plan and the DeepSeek API." xmlns="http://www.w3.org/2000/svg"><defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs><g class="dg-edges"><g class="dg-edge" data-edge="start-id" data-ends="start id"><title>start-id</title><path class="dg-line" d="M304.5,78 L304.5,174" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M304.5,78 L304.5,174"/></g><g class="dg-edge" data-edge="id-ctx" data-ends="id ctx"><title>yes</title><path class="dg-line" d="M277.1824520281276,240.5630288824441 L167.3175479718724,355.4369711175559" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M277.1824520281276,240.5630288824441 L167.3175479718724,355.4369711175559"/></g><g class="dg-edge" data-edge="id-gate" data-ends="id gate"><title>An unidentified machine counts as a work machine</title><path class="dg-line" d="M328.6419141914191,241.66006600660066 L424.9651162790698,360" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M328.6419141914191,241.66006600660066 L424.9651162790698,360"/></g><g class="dg-edge" data-edge="ctx-acct" data-ends="ctx acct"><title>yes</title><path class="dg-line" d="M142.90382339319714,420.9968610096228 L150.59617660680286,519.0031389903772" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M142.90382339319714,420.9968610096228 L150.59617660680286,519.0031389903772"/></g><g class="dg-edge" data-edge="ctx-personal" data-ends="ctx personal"><title>no</title><path class="dg-line" d="M181.74379325046735,407.57941687711127 L402.01162790697674,532" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M181.74379325046735,407.57941687711127 L402.01162790697674,532"/></g><g class="dg-edge" data-edge="acct-block" data-ends="acct block"><title>no</title><path class="dg-line" d="M155.8536036036036,593.186936936937 L161.98101265822785,690" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M155.8536036036036,593.186936936937 L161.98101265822785,690"/></g><g class="dg-edge" data-edge="acct-only" data-ends="acct only"><title>yes</title><path class="dg-line" d="M194.42709010766674,579.8615506900787 L383.3354430379747,690" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M194.42709010766674,579.8615506900787 L383.3354430379747,690"/></g><g class="dg-edge" data-edge="gate-only" data-ends="gate only"><title>gate-only</title><path class="dg-line" d="M443.04545454545456,408 L425.95454545454544,690" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M443.04545454545456,408 L425.95454545454544,690"/></g></g><g class="dg-nodes"><g class="dg-node dg-k-start" data-node="start"><title>A session starts</title><rect class="dg-box" x="214.5" y="30" width="180" height="48" rx="24"/><text class="dg-title" x="304.5" y="59" text-anchor="middle">A session starts</text></g><g class="dg-node dg-k-decision" data-node="id"><title>Machine identified?</title><path class="dg-box" d="M304.5,174 L414.5,212 L304.5,250 L194.5,212 z"/><text class="dg-title" x="304.5" y="217" text-anchor="middle">Machine identified?</text></g><g class="dg-node dg-k-decision" data-node="ctx"><title>Work context?</title><path class="dg-box" d="M140,346 L250,384 L140,422 L30,384 z"/><text class="dg-title" x="140" y="389" text-anchor="middle">Work context?</text></g><g class="dg-node dg-k-decision" data-node="acct"><title>Company account?</title><path class="dg-box" d="M153.5,518 L263.5,556 L153.5,594 L43.5,556 z"/><text class="dg-title" x="153.5" y="561" text-anchor="middle">Company account?</text></g><g class="dg-node dg-k-end" data-node="block"><title>Prompt blocked</title><rect class="dg-box dg-heavy" x="73.5" y="690" width="180" height="48" rx="24"/><text class="dg-title" x="163.5" y="719" text-anchor="middle">Prompt blocked</text></g><g class="dg-node dg-k-end" data-node="only"><title>Company Claude and Codex only</title><rect class="dg-box dg-heavy" x="313.5" y="690" width="222" height="48" rx="24"/><text class="dg-title" x="424.5" y="719" text-anchor="middle">Company Claude and Codex only</text></g><g class="dg-node dg-k-action" data-node="gate"><title>Launch gate refuses dsh and opencode</title><rect class="dg-box" x="310" y="360" width="269" height="48" rx="6"/><text class="dg-title" x="444.5" y="389" text-anchor="middle">Launch gate refuses dsh and opencode</text></g><g class="dg-node dg-k-end" data-node="personal"><title>Cleared repo: free chain allowed</title><rect class="dg-box dg-heavy" x="323.5" y="532" width="242" height="48" rx="24"/><text class="dg-title" x="444.5" y="561" text-anchor="middle">Cleared repo: free chain allowed</text></g></g><g class="dg-labels"><g class="dg-elabel"><rect x="205.75" y="289" width="33" height="18" rx="3"/><text x="222.25" y="302" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="363.80351523524445" y="291.83003300330034" width="26" height="18" rx="3"/><text x="376.80351523524445" y="304.83003300330034" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="130.25" y="461" width="33" height="18" rx="3"/><text x="146.75" y="474" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="278.87771057872203" y="460.78970843855564" width="26" height="18" rx="3"/><text x="291.87771057872203" y="473.78970843855564" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="145.91730813091573" y="632.5934684684685" width="26" height="18" rx="3"/><text x="158.91730813091573" y="645.5934684684685" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="272.3812665728207" y="625.9307753450394" width="33" height="18" rx="3"/><text x="288.8812665728207" y="638.9307753450394" text-anchor="middle">yes</text></g></g></svg>
</figure>
<!-- /diagram:work -->

*One question, asked first, and three locks on the work side.*


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
