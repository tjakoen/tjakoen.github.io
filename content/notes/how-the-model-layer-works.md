---
title: "How the Model Intelligence Layer Works"
audience: [build, learn]
level: deep
subtitle: "The registry, the guards, the fallback order and the usage record, one piece at a time, each graded by what it proves."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-23
readingTime: "~25 min"
tags: [ai, workflow, tokenomics, standards, tooling]
summary: >
  The technical companion to the note on why I built a Model Intelligence Layer. It shows the registry
  that owns every model id, the model guard that restarts a session on the wrong model, the route check
  with its fallback order, cooldowns and repository clearance, the approval I type before any paid call,
  the limits on spawning, the hard guards that keep free models off work, and the usage record PANTRY
  reads. It ends with what is public, what is private, and a list of the steps to build your own.
---

> This is the technical companion to [Necessity Is the Mother of Innovation](necessity-and-the-model-layer.md), which tells why I built the layer. This note shows how it works, piece by piece, so you can build your own.

Everything here comes from the setup I run every day. The flow diagrams zoom with Ctrl and the mouse wheel, or with a pinch, and hovering a box in one lights up what connects to it. The other figures hold still.

## What a Model Intelligence Layer is

**A Model Intelligence Layer is the part of your setup that owns four decisions: which model plays which role, whether that choice was obeyed, what happens when the model is unavailable, and what the run cost and where the prompt went.** Everything else in this note is one of those four, built.

**It is built to buy three things: it never stalls, it never overspends and it never leaks private code, and the first two rest on fallback paths I have tested but not yet watched fire in real work.** It never stalls because the [light chain](#the-light-chain-in-order) moves on when a model runs out, a handover I have tested and have not yet seen happen live. It never overspends because [the paid route needs my typed approval](#the-paid-route-needs-my-typed-approval) against a prepaid balance, and the main session's recovery path, the one that can end at a paid request, is tested but not seen live either. It never leaks private code because [repository clearance](#repository-clearance-and-the-privacy-flag) and the [work lane](#work-is-a-different-lane-enforced-three-ways) keep anything not mine away from models that may keep it. None of that means the work runs on weak models: planning and review stay on Opus and Sol, and only light, bounded work goes down the chain.

The whole layer comes down to six rules. Pick one to see it play, then jump to the section that explains it.

<div class="live-fig live-fig--rules" data-live-figure="rules" data-surface="figure:rules">
<nav class="rule-cards" aria-label="The layer as six rules, each linking to the section that explains it">
<a class="rule-card" href="#the-registry-and-tiers-instead-of-models"><span class="rule-card__n">1</span><b class="rule-card__t">Tiers, not models</b><span class="rule-card__d">Work asks for a tier; the registry says which model that is today.</span></a>
<a class="rule-card" href="#the-light-chain-in-order"><span class="rule-card__n">2</span><b class="rule-card__t">One free model, then Go</b><span class="rule-card__d">The free models share one daily cap, so the chain holds one, then the small plan.</span></a>
<a class="rule-card" href="#the-paid-route-needs-my-typed-approval"><span class="rule-card__n">3</span><b class="rule-card__t">Paid only on a typed yes</b><span class="rule-card__d">No agent holds the key, and each paid call waits for my approval.</span></a>
<a class="rule-card" href="#spawning-context-recovery-and-the-goldfish-gate"><span class="rule-card__n">4</span><b class="rule-card__t">Four at a time</b><span class="rule-card__d">The supervisor caps live agents per session, their depth and their retries.</span></a>
<a class="rule-card" href="#work-is-a-different-lane-enforced-three-ways"><span class="rule-card__n">5</span><b class="rule-card__t">Work stays in its lane</b><span class="rule-card__d">On a work computer only company accounts and private models are allowed.</span></a>
<a class="rule-card" href="#what-gets-recorded-and-why-free-and-paid-sit-apart"><span class="rule-card__n">6</span><b class="rule-card__t">Checked every session</b><span class="rule-card__d">The checklist proves the layer, and PANTRY's record, before work starts.</span></a>
</nav>
</div>

I call it a layer because it sits between the harness (the program that runs a session) and the models (the rented part), and it stays the same when either one changes. The loop contract from the earlier notes says the model is not part of the contract. The layer is where that sentence gets a mechanism.

The parts, drawn as one stack from me down to the models, are in [Necessity Is the Mother of Innovation](necessity-and-the-model-layer.md#what-a-model-intelligence-layer-does). This note takes them one at a time.

## The registry, and tiers instead of models

**Work asks for a tier, and the registry says which model that tier is today.** It rests on three pieces of vocabulary, all from [MODELS](/standards/models), the public standard that holds the policy.

| Piece | What it is | Mine |
|---|---|---|
| Tier | How much judgment a kind of work needs: strong, execution, cheapest | Opus, Sonnet, Haiku on Claude; Sol, Sol at low effort, Luna on Codex |
| Role | A kind of work, pinned to one tier | Orchestration and prose on strong; review, implementation, research on execution; lightweight on cheapest |
| Registry | The one file where every model identifier lives | A single JSON file in agent-config, my private config repository |

Agents map to a tier, never to a role, so a pin has exactly one kind of value to check. My planner, goldfish and writer sit on the strong tier. The auditor and implementer sit on execution. The locator sits on cheapest. Every model entry also carries a cost class, which says whether a call is free, part of a plan I pay for monthly, or metered by the token, and a private flag, which says whether I would let that provider see work code. The section on clearance below explains why both exist.

The main session runs on the execution tier, on every harness that can pin it. A main session spends most of its turns typing, reading and wiring, and paying strong-tier prices for that was exactly what I was trying to stop. Effort is a registry setting too, and no pin asks for high: Sonnet runs at medium and Opus at low, which the [companion note](necessity-and-the-model-layer.md#what-it-changed) argues from experience. Because the registry is the only home of a model name, a handoff between harnesses names a tier and never a model, and the receiving session looks up its own.

## The guard that restarts a session on the wrong model

A rule that lives in a document is a suggestion. The first rule I enforced was the plainest: every main session runs the registry's main model, and nothing in a menu or a spawner's defaults changes that.

It needed enforcing because a session started by another session inherits that session's model, and I can pick anything from the picker. The guard is one shell script wired to four hook events, and it reads the model out of the transcript, because the desktop app's start event does not carry one.

This note is a small proof. The session that drafted it opened on Opus, the registry says Sonnet, and the guard stopped it before it did any work. It proposed a restart card titled with the right model and effort, the card carried the original prompt, and I clicked it. The replacement session is the one writing this. The stopped one then offered two reply buttons, archive it or keep it, and archived itself only after detaching the replacement. That order is not taste. Archiving a parent archives its children, and the app's automatic mode refuses a hook-requested archive, which is why the restart is a click and the archive is a reply.

Three rules came out of the live runs.

- A phrase in my first prompt, keep this model, records an exception for that one session and nothing else. There is no standing exemption.
- A replacement that is still on the wrong model never respawns again. It takes the blocking path, so a desktop app that ignores the model argument produces one blocked session and never a loop.
- On every other harness the guard exits with an error on the first prompt, prints the restart command and asks me to paste the prompt again. The prompt is never put in a command, so there is no shell quoting to get wrong.

It took six live runs before it passed acceptance, and the run report in agent-config holds the evidence.

<!-- diagram:guard -->
<figure class="diagram" data-diagram="flow">
  <div class="diagram__bar" role="toolbar" aria-label="Diagram controls">
    <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
    <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
    <button type="button" data-zoom="reset">Fit</button>
    <span class="diagram__hint">Ctrl and scroll, or pinch, to zoom; drag to pan; hover to trace; click to open.</span>
  </div>
  <svg class="diagram__svg" viewBox="0 0 528 1172" data-w="528" data-h="1172" role="img" aria-label="How the model guard handles a session on the wrong model. At the first prompt it reads the model from the transcript and compares it with the registry's main model. If they match, the work starts. If not, the session stops before doing any work and proposes a restart card with the right model and effort. I click the card and a replacement session runs the task. The stopped session then offers Archive it or Keep it. On Archive it, it detaches the replacement first and archives itself second. A replacement that is still on the wrong model is blocked and never respawns." xmlns="http://www.w3.org/2000/svg"><defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs><g class="dg-edges"><g class="dg-edge" data-edge="start-match" data-ends="start match"><title>start-match</title><path class="dg-line" d="M264,78 L264,174" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,78 L264,174"/></g><g class="dg-edge" data-edge="match-work" data-ends="match work"><title>yes</title><path class="dg-line" d="M237.66007351654122,240.9007526693506 L141.873417721519,346" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M237.66007351654122,240.9007526693506 L141.873417721519,346"/></g><g class="dg-edge" data-edge="match-card" data-ends="match card"><title>no</title><path class="dg-line" d="M286.8623518687329,242.102096627165 L365.7721518987342,346" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M286.8623518687329,242.102096627165 L365.7721518987342,346"/></g><g class="dg-edge" data-edge="card-click" data-ends="card click"><title>card-click</title><path class="dg-line" d="M364,394 L284,490" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M364,394 L284,490"/></g><g class="dg-edge" data-edge="click-again" data-ends="click again"><title>click-again</title><path class="dg-line" d="M264,538 L264,634" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,538 L264,634"/></g><g class="dg-edge" data-edge="again-run" data-ends="again run"><title>yes</title><path class="dg-line" d="M286.8623518687329,702.102096627165 L365.7721518987342,806" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M286.8623518687329,702.102096627165 L365.7721518987342,806"/></g><g class="dg-edge" data-edge="again-block" data-ends="again block"><title>no</title><path class="dg-line" d="M240.09384850941188,701.7415113032514 L156.29113924050634,806" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M240.09384850941188,701.7415113032514 L156.29113924050634,806"/></g><g class="dg-edge" data-edge="run-reply" data-ends="run reply"><title>run-reply</title><path class="dg-line" d="M364,854 L284,950" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M364,854 L284,950"/></g><g class="dg-edge" data-edge="reply-arch" data-ends="reply arch"><title>reply-arch</title><path class="dg-line" d="M264,998 L264,1094" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,998 L264,1094"/></g></g><g class="dg-nodes"><g class="dg-node dg-k-start" data-node="start"><title>First prompt of a session</title><rect class="dg-box" x="167" y="30" width="194" height="48" rx="24"/><text class="dg-title" x="264" y="59" text-anchor="middle">First prompt of a session</text></g><g class="dg-node dg-k-decision" data-node="match"><title>Matches the registry?</title><path class="dg-box" d="M264,174 L374,212 L264,250 L154,212 z"/><text class="dg-title" x="264" y="217" text-anchor="middle">Matches the registry?</text></g><g class="dg-node dg-k-end" data-node="work"><title>Work starts</title><rect class="dg-box dg-heavy" x="30" y="346" width="180" height="48" rx="24"/><text class="dg-title" x="120" y="375" text-anchor="middle">Work starts</text></g><g class="dg-node dg-k-action" data-node="card"><title>Stop, propose the Restart card</title><rect class="dg-box" x="270" y="346" width="228" height="48" rx="6"/><text class="dg-title" x="384" y="375" text-anchor="middle">Stop, propose the Restart card</text></g><g class="dg-node dg-k-action" data-node="click"><title>I click the card</title><rect class="dg-box" x="174" y="490" width="180" height="48" rx="6"/><text class="dg-title" x="264" y="519" text-anchor="middle">I click the card</text></g><g class="dg-node dg-k-decision" data-node="again"><title>Replacement right?</title><path class="dg-box" d="M264,634 L374,672 L264,710 L154,672 z"/><text class="dg-title" x="264" y="677" text-anchor="middle">Replacement right?</text></g><g class="dg-node dg-k-end" data-node="block"><title>Block, never respawn</title><rect class="dg-box dg-heavy" x="47" y="806" width="180" height="48" rx="24"/><text class="dg-title" x="137" y="835" text-anchor="middle">Block, never respawn</text></g><g class="dg-node dg-k-action" data-node="run"><title>Replacement runs the task</title><rect class="dg-box" x="287" y="806" width="194" height="48" rx="6"/><text class="dg-title" x="384" y="835" text-anchor="middle">Replacement runs the task</text></g><g class="dg-node dg-k-action" data-node="reply"><title>Archive it or Keep it</title><rect class="dg-box" x="174" y="950" width="180" height="48" rx="6"/><text class="dg-title" x="264" y="979" text-anchor="middle">Archive it or Keep it</text></g><g class="dg-node dg-k-end" data-node="arch"><title>Detach, then archive</title><rect class="dg-box dg-heavy" x="174" y="1094" width="180" height="48" rx="24"/><text class="dg-title" x="264" y="1123" text-anchor="middle">Detach, then archive</text></g></g><g class="dg-labels"><g class="dg-elabel"><rect x="173.2667456190301" y="284.4503763346753" width="33" height="18" rx="3"/><text x="189.7667456190301" y="297.4503763346753" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="313.31725188373355" y="285.0510483135825" width="26" height="18" rx="3"/><text x="326.31725188373355" y="298.0510483135825" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="309.81725188373355" y="745.0510483135824" width="33" height="18" rx="3"/><text x="326.31725188373355" y="758.0510483135824" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="185.1924938749591" y="744.8707556516257" width="26" height="18" rx="3"/><text x="198.1924938749591" y="757.8707556516257" text-anchor="middle">no</text></g></g></svg>
</figure>
<!-- /diagram:guard -->

*A session on the wrong model stops before it does any work.*

## Hard work is delegated, never switched to

**Reaching for a stronger model means handing one piece to a subagent pinned to the strong tier, while the main session keeps its own model and its cache.** A hook cannot switch the main session's model, and switching mid-session would throw the prompt cache away, so the whole conversation would be paid for again at the new price. Opus on Claude Code and Sol on Codex and OpenCode keep planning and review, and nothing in the light chain is ever allowed to take them.

<!-- stack:delegation -->
<svg viewBox="0 0 640 384" width="100%" role="img" aria-label="Escalation is delegation, not a switch. The main session runs on the execution tier and holds the conversation and its prompt cache. When the next piece is planning, architecture or review, the main session hands it to a subagent pinned to the strong tier. The subagent reads only the plan and the files it links, and its context ends when the piece ends. The answer returns to the main session, which keeps its cache and carries on at its own tier. Switching the main session's model instead would throw the cache away." style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif"><rect x="20" y="14" width="600" height="68" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Main session, on the execution tier</text><text x="320" y="54" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Sonnet on Claude Code, Sol at low effort on Codex.</text><text x="320" y="70" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">It keeps the conversation and its prompt cache.</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="86" x2="320" y2="108"/><path d="M316,102 L320,108 L324,102"/></g><rect x="20" y="112" width="600" height="78" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="134" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">The next piece needs judgment</text><rect x="32" y="138" width="185.33333333333334" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="124.66666666666667" y="158" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Planning</text><rect x="227.33333333333334" y="138" width="185.33333333333334" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="158" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Architecture</text><rect x="422.6666666666667" y="138" width="185.33333333333334" height="30" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="515.3333333333334" y="158" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Review</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="194" x2="320" y2="216"/><path d="M316,210 L320,216 L324,210"/></g><rect x="20" y="220" width="600" height="68" rx="8" style="fill:none;stroke:var(--color-fg);stroke-width:2.2"/><text x="320" y="242" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">A subagent pinned to the strong tier</text><text x="320" y="260" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Opus on Claude Code, Sol on Codex and OpenCode.</text><text x="320" y="276" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">It gets the plan and the files it links. Its context ends with the piece.</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="292" x2="320" y2="314"/><path d="M316,308 L320,314 L324,308"/></g><rect x="20" y="318" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="340" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">One answer comes back</text><text x="320" y="358" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">The main session carries on at its own tier, with its cache intact.</text></svg>
<!-- /stack:delegation -->

*A piece that needs judgment goes to the strong tier and comes back as one answer, so the cache stays warm. The longer argument for that split is [Plan Big, Type Small](plan-big-type-small.md).*

## Repository clearance and the privacy flag

**Why every model carries a private flag.** A free endpoint may keep whatever you send it, and I cannot read every provider's terms every time I add a model. DeepSeek, the paid API included, is a service under a different jurisdiction than mine. So I stopped reasoning about each one and wrote the answer into the registry once. A model is private when it is one of the two providers I would let see work code, and not private otherwise. The route check reads the flag, so a model nobody has classified never gets the benefit of the doubt.

Claude and Codex are private. Every free model is not private, and so is every DeepSeek model, whether it runs free, on the Go plan or on the paid API. An id nobody has listed is recorded as unknown and not private, so a model nobody classified is never counted as safe. Here is the registry's view of the models in play, by name, with the cost class and the private flag.

| Model | Runs on | Cost class | Private | Where it sits |
|---|---|---|---|---|
| Claude Opus, Sonnet, Haiku | Claude Code | plan | yes | The strong, execution and cheapest tiers on Claude. Not in the chain. |
| GPT Sol | Codex, OpenCode | plan | yes | The strong tier on Codex, and the main model on OpenCode. In the chain at low effort. |
| GPT Luna | Codex, OpenCode | plan | yes | The cheapest tier on Codex, and the first Codex entry in the chain, after the free model and Go. |
| DeepSeek V4.1 Flash Free | OpenCode | free | no | First in the chain. The free models share one daily cap. |
| DeepSeek V4.1 Flash on Go | OpenCode Go | plan | no | Second in the chain. One shared allowance on a flat monthly plan. |
| DeepSeek V4.1 Flash on the API | DeepSeek | metered | no | Not in the chain. Only through an escalation I approve, and the last step of recovery for a main session. |
| GPT Astra | Codex | plan | yes | An escalation only. It needs my approval and is not wired. |

An escalation, in this note, is a request to step outside the chain to a model that costs more, and it waits for an approval only I can type. The section on the paid route says what one takes.

A flag is not a decision, so the second piece is a question I answer once per repository. The first time the route check runs in a repository it has no entry for, it stops and asks whether non-private models may see this code. A repository I answer yes for is cleared, and the full chain applies to it. On no, only Claude and Codex are candidates, so the work still runs and never leaves those two providers. Nothing is cleared by default, and I clear repositories one at a time, by hand.

The answer is stored under the lower-cased absolute path of the repository's top level, so a subfolder or a worktree maps to its own repository. It is a small list of true and false. Not clever, and exactly as clever as it needs to be.

## The light chain, in order

This is the part that fixed the original problem. It is the same ladder as Sonnet down to Haiku, extended across providers and down to free. For light work, the layer tries these in order and takes the first one that is not skipped: one free model, DeepSeek V4.1 Flash Free; the same model on OpenCode Go, a flat monthly plan; then Luna and Sol on the Codex plan I already pay for. The companion note draws it as a ladder.

**Claude is not in this chain, and the reason is the plan, not the model.** As far as I have tested, Anthropic admits a third-party harness only through an API token, which is billed on its own and not tied to the five-hour or weekly usage of a plan. Codex admits its plan directly, so OpenCode can spend the Codex plan I already pay for. A Claude plan can only be spent inside Claude Code, which runs Claude on the tiers pinned in its agent files, and those subagents never go through the route check. So the chain holds the free model, the Go plan and Codex, and Claude lives one level up, in its own harness.

**The chain used to hold five free models, and now it holds one.** OpenCode's free models share one daily message cap, so when one runs out they all do, and five of them were one fallback in practice. After the free model comes the same model on OpenCode Go, a flat monthly plan whose models share one allowance, and then the Codex plan. I keep Go's extra usage setting off, because with it on an exhausted allowance would bill credits with no approval in between. The paid DeepSeek API left the order altogether and became an escalation, which the next section covers. The change is two recorded decisions in MODELS, and the second keeps the free model ahead of Go until a review on 30 November 2026 against a week of what PANTRY recorded.

**A pick is sticky.** Once a delegated task is running on a model, it stays on that model for as long as the model is usable, rather than hopping back up the chain the moment something above it frees up. The next delegation starts again from the top, so a reset cap gets used at the next task, never in the middle of one.

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

On a delegated light task, the layer does these things.

1. **It asks the registry.** The route check reads the chain and my current state: which models are cooling down, meaning resting for a set time after a rate limit; which are demoted, meaning benched for the rest of the day after repeated failures; and which plans are marked out.
2. **It skips what it must.** A model is skipped when it is not private and the repository is not cleared, when it is cooling down, when it is demoted for the day, when it is a Codex model and the Codex plan is out, or when it is Go and Go's allowance reports a limit reached. The plugin, the small piece of code OpenCode loads to launch each delegated child, reads that allowance (the five-hour, weekly and monthly meters) through OpenCode's own server before a pick, so no key leaves it and Go is skipped before a request can fail.
3. **It picks the first entry left.** Exit 0, and one line of JSON comes back with the model, provider, cost class, private flag, effort and the reason.
4. **It tells me when it cannot.** Exit 2 is an unknown harness or tier. Exit 3 means it needs me and prints the question. Exit 4 means no private model is available. Exit 5 is a hard gate. Exit 7 means every candidate is spent, so the session writes a checkpoint and stops, and then I am asked. When both 4 and 7 apply, 4 wins.

When a model fails, the failure type decides what happens. A rate limit or quota error puts that model on a cooldown, sixty minutes by default. A plain error only counts toward demotion, and three failures in a row demote the model for the rest of the day. A quota failure on a Codex or Claude model marks that whole plan out until the reset time the error gives, or six hours when it gives none. Every one of those numbers is a registry setting, so tuning one is never a code change.

The OpenCode plugin that launches a delegated child calls the route check before each launch. If the child dies with a 429, a quota error or a rate-limit message, the plugin tells the route check, takes one new pick, and tries once more. One retry, on purpose. A second failure stops the task and surfaces the error, because a retry loop across the chain is a good way to find a new way to waste an evening. I have tested that retry, but I have not yet watched the free model run out in the middle of real work and the request land on Go by itself.

Here is one light task followed through every check in order, with the skips and the one retry left in. It is a composite of the tested path, not a trace of one live run.

<!-- diagram:worked -->
<figure class="diagram" data-diagram="flow">
  <div class="diagram__bar" role="toolbar" aria-label="Diagram controls">
    <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
    <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
    <button type="button" data-zoom="reset">Fit</button>
    <span class="diagram__hint">Ctrl and scroll, or pinch, to zoom; drag to pan; hover to trace; click to open.</span>
  </div>
  <svg class="diagram__svg" viewBox="0 0 316 1548" data-w="316" data-h="1548" role="img" aria-label="One light task followed through every check, in order. The session's model is checked against the registry and matches. The repository is checked and is already cleared. The main session delegates the task to a light subagent. The route check walks the chain: the free model is skipped because the shared daily cap is spent, and Go is next. The plugin reads Go's five-hour, weekly and monthly allowance, finds room, and the child launches on Go. The child gets a 429, so Go is put on a cooldown and the route check takes its one new pick: the free model is still spent and Go is cooling, so Luna takes it. The child relaunches once on Luna and finishes. One usage record is written with the models, their cost class and their private flag." xmlns="http://www.w3.org/2000/svg"><defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs><g class="dg-edges"><g class="dg-edge" data-edge="start-model" data-ends="start model"><title>start-model</title><path class="dg-line" d="M158,78 L158,174" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M158,78 L158,174"/></g><g class="dg-edge" data-edge="model-repo" data-ends="model repo"><title>model-repo</title><path class="dg-line" d="M158,222 L158,318" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M158,222 L158,318"/></g><g class="dg-edge" data-edge="repo-deleg" data-ends="repo deleg"><title>repo-deleg</title><path class="dg-line" d="M158,366 L158,462" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M158,366 L158,462"/></g><g class="dg-edge" data-edge="deleg-free" data-ends="deleg free"><title>deleg-free</title><path class="dg-line" d="M158,510 L158,606" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M158,510 L158,606"/></g><g class="dg-edge" data-edge="free-allow" data-ends="free allow"><title>free-allow</title><path class="dg-line" d="M158,654 L158,750" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M158,654 L158,750"/></g><g class="dg-edge" data-edge="allow-launch" data-ends="allow launch"><title>Five-hour, weekly and monthly meters read first</title><path class="dg-line" d="M158,798 L158,894" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M158,798 L158,894"/></g><g class="dg-edge" data-edge="launch-limit" data-ends="launch limit"><title>launch-limit</title><path class="dg-line" d="M158,942 L158,1038" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M158,942 L158,1038"/></g><g class="dg-edge" data-edge="limit-retry" data-ends="limit retry"><title>limit-retry</title><path class="dg-line" d="M158,1086 L158,1182" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M158,1086 L158,1182"/></g><g class="dg-edge" data-edge="retry-luna" data-ends="retry luna"><title>retry-luna</title><path class="dg-line" d="M158,1230 L158,1326" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M158,1230 L158,1326"/></g><g class="dg-edge" data-edge="luna-done" data-ends="luna done"><title>luna-done</title><path class="dg-line" d="M158,1374 L158,1470" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M158,1374 L158,1470"/></g></g><g class="dg-nodes"><g class="dg-node dg-k-start" data-node="start"><title>A light task, in a personal repo</title><rect class="dg-box" x="37" y="30" width="242" height="48" rx="24"/><text class="dg-title" x="158" y="59" text-anchor="middle">A light task, in a personal repo</text></g><g class="dg-node dg-k-action" data-node="model"><title>Session model matches the registry</title><rect class="dg-box" x="30" y="174" width="256" height="48" rx="6"/><text class="dg-title" x="158" y="203" text-anchor="middle">Session model matches the registry</text></g><g class="dg-node dg-k-action" data-node="repo"><title>Repository already cleared</title><rect class="dg-box" x="57.5" y="318" width="201" height="48" rx="6"/><text class="dg-title" x="158" y="347" text-anchor="middle">Repository already cleared</text></g><g class="dg-node dg-k-action" data-node="deleg"><title>Delegated to a light subagent</title><rect class="dg-box" x="47" y="462" width="222" height="48" rx="6"/><text class="dg-title" x="158" y="491" text-anchor="middle">Delegated to a light subagent</text></g><g class="dg-node dg-k-action" data-node="free"><title>Free model skipped: cap spent</title><rect class="dg-box" x="47" y="606" width="222" height="48" rx="6"/><text class="dg-title" x="158" y="635" text-anchor="middle">Free model skipped: cap spent</text></g><g class="dg-node dg-k-action" data-node="allow"><title>Go allowance read: room left</title><rect class="dg-box" x="50.5" y="750" width="215" height="48" rx="6"/><text class="dg-title" x="158" y="779" text-anchor="middle">Go allowance read: room left</text></g><g class="dg-node dg-k-action" data-node="launch"><title>Launch the child on Go</title><rect class="dg-box" x="68" y="894" width="180" height="48" rx="6"/><text class="dg-title" x="158" y="923" text-anchor="middle">Launch the child on Go</text></g><g class="dg-node dg-k-action" data-node="limit"><title>The child gets a 429</title><rect class="dg-box" x="68" y="1038" width="180" height="48" rx="6"/><text class="dg-title" x="158" y="1067" text-anchor="middle">The child gets a 429</text></g><g class="dg-node dg-k-action" data-node="retry"><title>Cool Go, one new pick: Luna</title><rect class="dg-box" x="54" y="1182" width="208" height="48" rx="6"/><text class="dg-title" x="158" y="1211" text-anchor="middle">Cool Go, one new pick: Luna</text></g><g class="dg-node dg-k-action" data-node="luna"><title>Relaunch once on Luna</title><rect class="dg-box" x="68" y="1326" width="180" height="48" rx="6"/><text class="dg-title" x="158" y="1355" text-anchor="middle">Relaunch once on Luna</text></g><g class="dg-node dg-k-end" data-node="done"><title>Write one usage record</title><rect class="dg-box dg-heavy" x="68" y="1470" width="180" height="48" rx="24"/><text class="dg-title" x="158" y="1499" text-anchor="middle">Write one usage record</text></g></g><g class="dg-labels"></g></svg>
</figure>
<!-- /diagram:worked -->

*One light task, from the session check to the usage record. The free model is skipped, Go takes the task, a 429 spends the one retry, and Luna finishes it.*

The chain serves delegated light work, the explore, research, locator and implementer children that OpenCode launches through the plugin. The main OpenCode session runs Sol on the Codex plan. If that allowance stops it, the recovery order in the registry is Sol, then the free model, then Go, all automatic, and only then a paid request, which is an escalation and waits for my approval. That order is tested, not yet seen live. The route check on its own, without the worked example's particulars, looks like this.

<!-- diagram:route -->
<figure class="diagram" data-diagram="flow">
  <div class="diagram__bar" role="toolbar" aria-label="Diagram controls">
    <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
    <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
    <button type="button" data-zoom="reset">Fit</button>
    <span class="diagram__hint">Ctrl and scroll, or pinch, to zoom; drag to pan; hover to trace; click to open.</span>
  </div>
  <svg class="diagram__svg" viewBox="0 0 528 1200" data-w="528" data-h="1200" role="img" aria-label="How the route check picks a model for a delegated light task. First it checks whether the repository has been answered, and asks once if not. Then it walks the light chain in order and takes the first entry that is not skipped. An entry is skipped when it is not private and the repository is not cleared, when it is cooling down, when it is demoted for the day, when its plan is out, or, for Go, when its allowance reports a limit reached. If an entry is left, the task launches. If every entry is skipped, the route check stops and asks me. The paid DeepSeek API is never part of this order. If the launched child hits a rate limit, the model is put on a cooldown and the route check picks once more." xmlns="http://www.w3.org/2000/svg"><defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs><g class="dg-edges"><g class="dg-edge" data-edge="start-repo" data-ends="start repo"><title>start-repo</title><path class="dg-line" d="M264,78 L264,174" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,78 L264,174"/></g><g class="dg-edge" data-edge="repo-ask" data-ends="repo ask"><title>no</title><path class="dg-line" d="M264,250 L264,346" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,250 L264,346"/></g><g class="dg-edge" data-edge="repo-walk" data-ends="repo walk"><title>yes</title><path class="dg-line" d="M264,250 L264,490" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,250 L264,490"/></g><g class="dg-edge" data-edge="ask-walk" data-ends="ask walk"><title>ask-walk</title><path class="dg-line" d="M264,394 L264,490" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,394 L264,490"/></g><g class="dg-edge" data-edge="walk-left" data-ends="walk left"><title>walk-left</title><path class="dg-line" d="M264,538 L264,634" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M264,538 L264,634"/></g><g class="dg-edge" data-edge="left-launch" data-ends="left launch"><title>yes</title><path class="dg-line" d="M241.1376481312671,702.102096627165 L162.22784810126583,806" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M241.1376481312671,702.102096627165 L162.22784810126583,806"/></g><g class="dg-edge" data-edge="left-stop" data-ends="left stop"><title>no</title><path class="dg-line" d="M286.8623518687329,702.102096627165 L365.7721518987342,806" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M286.8623518687329,702.102096627165 L365.7721518987342,806"/></g><g class="dg-edge" data-edge="launch-limit" data-ends="launch limit"><title>launch-limit</title><path class="dg-line" d="M162.22784810126583,854 L241.1376481312671,957.897903372835" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M162.22784810126583,854 L241.1376481312671,957.897903372835"/></g><g class="dg-edge" data-edge="limit-retry" data-ends="limit retry"><title>yes</title><path class="dg-line" d="M241.1376481312671,1018.102096627165 L162.22784810126583,1122" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M241.1376481312671,1018.102096627165 L162.22784810126583,1122"/></g><g class="dg-edge" data-edge="limit-done" data-ends="limit done"><title>no</title><path class="dg-line" d="M290.3399264834588,1016.9007526693506 L386.126582278481,1122" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M290.3399264834588,1016.9007526693506 L386.126582278481,1122"/></g></g><g class="dg-nodes"><g class="dg-node dg-k-start" data-node="start"><title>Delegated light task</title><rect class="dg-box" x="174" y="30" width="180" height="48" rx="24"/><text class="dg-title" x="264" y="59" text-anchor="middle">Delegated light task</text></g><g class="dg-node dg-k-decision" data-node="repo"><title>Repo answered?</title><path class="dg-box" d="M264,174 L374,212 L264,250 L154,212 z"/><text class="dg-title" x="264" y="217" text-anchor="middle">Repo answered?</text></g><g class="dg-node dg-k-action" data-node="ask"><title>Ask me, store the answer</title><rect class="dg-box" x="170" y="346" width="188" height="48" rx="6"/><text class="dg-title" x="264" y="375" text-anchor="middle">Ask me, store the answer</text></g><g class="dg-node dg-k-action" data-node="walk"><title>Walk the light chain in order</title><rect class="dg-box" x="153" y="490" width="222" height="48" rx="6"/><text class="dg-title" x="264" y="519" text-anchor="middle">Walk the light chain in order</text></g><g class="dg-node dg-k-decision" data-node="left"><title>Entry left?</title><path class="dg-box" d="M264,634 L374,672 L264,710 L154,672 z"/><text class="dg-title" x="264" y="677" text-anchor="middle">Entry left?</text></g><g class="dg-node dg-k-action" data-node="launch"><title>Launch the child</title><rect class="dg-box" x="54" y="806" width="180" height="48" rx="6"/><text class="dg-title" x="144" y="835" text-anchor="middle">Launch the child</text></g><g class="dg-node dg-k-decision" data-node="limit"><title>Rate limit?</title><path class="dg-box" d="M264,950 L374,988 L264,1026 L154,988 z"/><text class="dg-title" x="264" y="993" text-anchor="middle">Rate limit?</text></g><g class="dg-node dg-k-action" data-node="retry"><title>Cool the model, pick once more</title><rect class="dg-box" x="30" y="1122" width="228" height="48" rx="6"/><text class="dg-title" x="144" y="1151" text-anchor="middle">Cool the model, pick once more</text></g><g class="dg-node dg-k-end" data-node="stop"><title>Stop and ask me</title><rect class="dg-box dg-heavy" x="294" y="806" width="180" height="48" rx="24"/><text class="dg-title" x="384" y="835" text-anchor="middle">Stop and ask me</text></g><g class="dg-node dg-k-end" data-node="done"><title>Record the usage</title><rect class="dg-box dg-heavy" x="318" y="1122" width="180" height="48" rx="24"/><text class="dg-title" x="408" y="1151" text-anchor="middle">Record the usage</text></g></g><g class="dg-labels"><g class="dg-elabel"><rect x="251" y="289" width="26" height="18" rx="3"/><text x="264" y="302" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="247.5" y="405" width="33" height="18" rx="3"/><text x="264" y="418" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="185.18274811626645" y="745.0510483135824" width="33" height="18" rx="3"/><text x="201.68274811626645" y="758.0510483135824" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="313.31725188373355" y="745.0510483135824" width="26" height="18" rx="3"/><text x="326.31725188373355" y="758.0510483135824" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="185.18274811626645" y="1061.0510483135824" width="33" height="18" rx="3"/><text x="201.68274811626645" y="1074.0510483135824" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="325.2332543809699" y="1060.4503763346752" width="26" height="18" rx="3"/><text x="338.2332543809699" y="1073.4503763346752" text-anchor="middle">no</text></g></g></svg>
</figure>
<!-- /diagram:route -->

*The route check, from the delegated task to a launched child. A rate limit sends it round once.*

## The paid route needs my typed approval

The paid DeepSeek API is not in the light chain. It is an escalation, and every escalation leaves a record: the reason, the source model and role, the destination model, why the capability is needed, the approval, the resource use (estimated first, actual once known) and the outcome. The same source, destination and reason always make the same request id, so a repeated request is recognizably the same one. Codex has an escalation tier of its own, GPT Astra, which costs plan money rather than metered money, still needs my approval, and is not wired yet.

**One model, two costs.** Putting Go in exposed a bug waiting to happen. DeepSeek V4.1 Flash is sold twice, as plan cost on Go and as metered cost on the paid API, and three places in my setup looked a model up by its id alone. One of them could have let a paid request skip its approval. So every id in the registry is now written as provider and model, such as opencode-go/deepseek-v4.1-flash. An escalation refuses a bare id that could mean either, the usage ledger (the daily files where every session's use lands, described further down) counts an id it cannot place as metered, and the registry checks that two entries with one id agree per provider. If your registry can hold one model at two prices, give every entry a provider before you need it.

**Only I can give an approval, and only on a terminal.** The approve command appends a line to an approvals file, and that file is the only place approval lives. An answer in my decisions inbox is not approval, and neither is a sentence in chat. An agent has no terminal input, so the command refuses it. An approval is bound to one destination, can be spent once and expires after a day.

**What holds the money is simple on purpose.** I first built a signing layer that tied approvals to Windows Hello, and I took it out as overengineering. The approvals file and the ledger are files an agent can write, and repeated audits kept showing that a file cannot be made forgery proof from inside the tool that reads it. I chose not to chase that. Three plain facts hold the paid route instead: I type the approval in a terminal, agents never hold a provider key, and the paid API runs on a prepaid balance that is a ceiling no agent can raise. The daily cap counts an approved estimate as spent the moment it is approved, before the money moves. The record guards against a careless agent and doubles as the audit trail.

## Spawning, context, recovery and the goldfish gate

Five more pieces handle the hard moments, and each one is small on purpose. Model Scout comes after them.

- **The supervisor is code, not an agent.** It says which tier a piece belongs to, which model the route check gives it and whether to delegate, and it refuses a spawn past my limits: four agents at a time per session, delegation two deep and two retries. The numbers come from the registry, so changing one is not a code change. Every spawn also has to carry an envelope (the lane, the scope cap, the hard stops and the ask-triggers), and a spawn without one is refused.
- **The context check gives advice and never blocks.** A model may carry its window, its usable window, its output reserve and how well that was measured. The check answers whether the next task fits and suggests one of continue, narrow, delegate, compact, checkpoint, fresh session, transfer or stop with a handoff. It always exits cleanly and fails open.
- **A recovery checkpoint is not a handoff.** It is the emergency record for context pressure, a provider failure or an interrupted environment. One marked complete refuses any gate result but green. The old session is superseded only after the new one has written that it verified the recovery. Continuation reuses the model guard's restart path, and it is assisted, not automatic: archiving the old session still needs my click.
- **An editing agent claims its worktree.** Two agents never write the same folder: a claim is keyed to the agent that made it, kept fresh while it runs and released when it ends, in Claude Code and OpenCode. Codex leaves no signal that an agent has finished, so its claims simply expire after thirty minutes. That is a known limit, not a bug.
- **The goldfish gate checks the review, not the reviewer.** The names come from Google's [Elephant-Goldfish model](https://research.google/pubs/elephants-goldfish-and-the-new-golden-age-of-software-engineering/). The long session that holds the context is the elephant, and its job ends at a plan another reader can follow. The goldfish are fresh reviewers who get only the plan file and the files it links. My version, written up in [AI-DEVELOPMENT](/standards/ai-development), runs three of them on the strong tier while the elephant stays on the cheaper execution tier. A plan that touches hooks, settings or standards, or that I mark gated, may not move to doing unless a review sits beside it with Comprehension, Critic and Readiness in that order and a GO at the end. The gate cannot prove the review's context was fresh. That proof stays with a separate probe.

<!-- stack:review -->
<svg viewBox="0 0 640 482" width="100%" role="img" aria-label="Where the elephant and the goldfish fit. The elephant, the long session with the project context, writes the canonical plan and stores it under plans with its linked dependencies. Three independent goldfish then review it cold: comprehension asks whether a fresh reader can explain the plan, the critic asks what assumptions, risks or dependencies are missing, and readiness asks whether an independent implementer could build it. The elephant resolves the findings and I approve the plan, with the review evidence kept under artifacts and reviews. A fresh session then builds against the approved plan and an independent auditor verifies the result." style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif"><rect x="20" y="14" width="600" height="68" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Elephant: context-rich planning</text><text x="320" y="54" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Holds the project history, the requirements and the decisions,</text><text x="320" y="70" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">and produces the canonical plan</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="86" x2="320" y2="108"/><path d="M316,102 L320,108 L324,102"/></g><rect x="20" y="112" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="134" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Canonical plan</text><text x="320" y="152" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Stored under plans, with its linked dependencies</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="168" x2="320" y2="190"/><path d="M316,184 L320,190 L324,184"/></g><rect x="20" y="194" width="600" height="110" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="216" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Three independent goldfish reviews</text><rect x="32" y="220" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="124.66666666666667" y="240" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Comprehension</text><text x="124.66666666666667" y="258" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">Can a fresh reader</text><text x="124.66666666666667" y="273" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">explain the plan?</text><rect x="227.33333333333334" y="220" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="240" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Critic</text><text x="320" y="258" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">What assumptions, risks</text><text x="320" y="273" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">or dependencies are missing?</text><rect x="422.6666666666667" y="220" width="185.33333333333334" height="62" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="515.3333333333334" y="240" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">Readiness</text><text x="515.3333333333334" y="258" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">Can an independent</text><text x="515.3333333333334" y="273" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">implementer build it?</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="308" x2="320" y2="330"/><path d="M316,324 L320,330 L324,324"/></g><rect x="20" y="334" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="356" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">The elephant resolves the findings, then I approve</text><text x="320" y="374" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Review evidence goes under artifacts and reviews</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="390" x2="320" y2="412"/><path d="M316,406 L320,412 L324,406"/></g><rect x="20" y="416" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-fg);stroke-width:2.2"/><text x="320" y="438" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">Fresh implementation, then the auditor</text><text x="320" y="456" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Build against the approved plan, then verify the result on its own</text></svg>
<!-- /stack:review -->

*The elephant plans, three goldfish check the plan cold, and only then does a fresh session build.*

Model Scout is the last piece, and the least busy. It researches models and recommends them when I run it, makes no network calls and never writes the registry. A recommendation always says the model is not added to the chain.

## Work is a different lane, enforced three ways

Everything above is for my personal projects. This section is the opposite.

**The free and Go models and DeepSeek are for personal projects only. A work machine and a work repository use only the company's Claude and Codex, and three separate guards enforce that, so a mistake has to get past all three.** I will describe them without the company's identifiers, because the identifiers are the one thing in this setup I will never publish.

<!-- diagram:work -->
<figure class="diagram" data-diagram="flow">
  <div class="diagram__bar" role="toolbar" aria-label="Diagram controls">
    <button type="button" data-zoom="in" aria-label="Zoom in">+</button>
    <button type="button" data-zoom="out" aria-label="Zoom out">−</button>
    <button type="button" data-zoom="reset">Fit</button>
    <span class="diagram__hint">Ctrl and scroll, or pinch, to zoom; drag to pan; hover to trace; click to open.</span>
  </div>
  <svg class="diagram__svg" viewBox="0 0 685 912" data-w="685" data-h="912" role="img" aria-label="How the work lane is guarded. A session starts and the machine is identified from its own name. A machine that cannot be identified counts as a work machine. A work machine, or a work repository, puts the session in work context. In work context every prompt passes the account check: a company account passes and any other account, a personal Claude or Codex included, is blocked. Launching OpenCode in work context is refused by the launch gate. Outside work context, a personal machine in a repository I have cleared may use the free model, the Go plan and the Codex plan." xmlns="http://www.w3.org/2000/svg"><defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="dg-arrowhead"/></marker></defs><g class="dg-edges"><g class="dg-edge" data-edge="start-id" data-ends="start id"><title>start-id</title><path class="dg-line" d="M342.5,78 L342.5,174" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M342.5,78 L342.5,174"/></g><g class="dg-edge" data-edge="id-ctx" data-ends="id ctx"><title>yes</title><path class="dg-line" d="M342.5,250 L342.5,346" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M342.5,250 L342.5,346"/></g><g class="dg-edge" data-edge="id-work" data-ends="id work"><title>A machine the setup cannot identify counts as a work machine</title><path class="dg-line" d="M321.71908166685284,242.82113730309462 L136.1818181818182,518" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M321.71908166685284,242.82113730309462 L136.1818181818182,518"/></g><g class="dg-edge" data-edge="ctx-work" data-ends="ctx work"><title>yes</title><path class="dg-line" d="M306.5003870718018,409.5637700793497 L153.79746835443038,518" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M306.5003870718018,409.5637700793497 L153.79746835443038,518"/></g><g class="dg-edge" data-edge="ctx-personal" data-ends="ctx personal"><title>no</title><path class="dg-line" d="M365.3623518687329,414.102096627165 L444.2721518987342,518" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M365.3623518687329,414.102096627165 L444.2721518987342,518"/></g><g class="dg-edge" data-edge="work-acct" data-ends="work acct"><title>every prompt</title><path class="dg-line" d="M132.91139240506328,566 L187.76079573022804,667.9553614750121" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M132.91139240506328,566 L187.76079573022804,667.9553614750121"/></g><g class="dg-edge" data-edge="work-gate" data-ends="work gate"><title>launch attempt</title><path class="dg-line" d="M175.0632911392405,566 L427.4367088607595,676" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M175.0632911392405,566 L427.4367088607595,676"/></g><g class="dg-edge" data-edge="acct-block" data-ends="acct block"><title>Any account that is not a company account, or one the hook cannot read</title><path class="dg-line" d="M209.0537545026323,736.5996120809089 L219.84177215189874,834" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M209.0537545026323,736.5996120809089 L219.84177215189874,834"/></g><g class="dg-edge" data-edge="acct-pass" data-ends="acct pass"><title>yes</title><path class="dg-line" d="M244.622676237806,724.3121663905761 L423.38607594936707,834" marker-end="url(#dg-arrow)"/><path class="dg-hit" d="M244.622676237806,724.3121663905761 L423.38607594936707,834"/></g></g><g class="dg-nodes"><g class="dg-node dg-k-start" data-node="start"><title>A session starts</title><rect class="dg-box" x="252.5" y="30" width="180" height="48" rx="24"/><text class="dg-title" x="342.5" y="59" text-anchor="middle">A session starts</text></g><g class="dg-node dg-k-decision" data-node="id"><title>Machine identified?</title><path class="dg-box" d="M342.5,174 L452.5,212 L342.5,250 L232.5,212 z"/><text class="dg-title" x="342.5" y="217" text-anchor="middle">Machine identified?</text></g><g class="dg-node dg-k-decision" data-node="ctx"><title>Work machine or repo?</title><path class="dg-box" d="M342.5,346 L452.5,384 L342.5,422 L232.5,384 z"/><text class="dg-title" x="342.5" y="389" text-anchor="middle">Work machine or repo?</text></g><g class="dg-node dg-k-action" data-node="work"><title>Work context</title><rect class="dg-box" x="30" y="518" width="180" height="48" rx="6"/><text class="dg-title" x="120" y="547" text-anchor="middle">Work context</text></g><g class="dg-node dg-k-end" data-node="personal"><title>Personal lane: a cleared repo may use the light chain</title><rect class="dg-box dg-heavy" x="270" y="518" width="385" height="48" rx="24"/><text class="dg-title" x="462.5" y="547" text-anchor="middle">Personal lane: a cleared repo may use the light chain</text></g><g class="dg-node dg-k-decision" data-node="acct"><title>Company account?</title><path class="dg-box" d="M205,662 L315,700 L205,738 L95,700 z"/><text class="dg-title" x="205" y="705" text-anchor="middle">Company account?</text></g><g class="dg-node dg-k-end" data-node="gate"><title>Launch gate refuses opencode</title><rect class="dg-box dg-heavy" x="375" y="676" width="215" height="48" rx="24"/><text class="dg-title" x="482.5" y="705" text-anchor="middle">Launch gate refuses opencode</text></g><g class="dg-node dg-k-end" data-node="block"><title>Prompt blocked</title><rect class="dg-box dg-heavy" x="132.5" y="834" width="180" height="48" rx="24"/><text class="dg-title" x="222.5" y="863" text-anchor="middle">Prompt blocked</text></g><g class="dg-node dg-k-end" data-node="pass"><title>Prompt passes</title><rect class="dg-box dg-heavy" x="372.5" y="834" width="180" height="48" rx="24"/><text class="dg-title" x="462.5" y="863" text-anchor="middle">Prompt passes</text></g></g><g class="dg-labels"><g class="dg-elabel"><rect x="326" y="289" width="33" height="18" rx="3"/><text x="342.5" y="302" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="215.95044992433552" y="327.4105686515473" width="26" height="18" rx="3"/><text x="228.95044992433552" y="340.4105686515473" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="213.6489277131161" y="454.7818850396749" width="33" height="18" rx="3"/><text x="230.1489277131161" y="467.7818850396749" text-anchor="middle">yes</text></g><g class="dg-elabel"><rect x="391.81725188373355" y="457.0510483135825" width="26" height="18" rx="3"/><text x="404.81725188373355" y="470.0510483135825" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="113.33609406764566" y="607.977680737506" width="94" height="18" rx="3"/><text x="160.33609406764566" y="620.977680737506" text-anchor="middle">every prompt</text></g><g class="dg-elabel"><rect x="247.25" y="612" width="108" height="18" rx="3"/><text x="301.25" y="625" text-anchor="middle">launch attempt</text></g><g class="dg-elabel"><rect x="201.44776332726553" y="776.2998060404544" width="26" height="18" rx="3"/><text x="214.44776332726553" y="789.2998060404544" text-anchor="middle">no</text></g><g class="dg-elabel"><rect x="317.50437609358653" y="770.156083195288" width="33" height="18" rx="3"/><text x="334.00437609358653" y="783.156083195288" text-anchor="middle">yes</text></g></g></svg>
</figure>
<!-- /diagram:work -->

*One question, asked first, and three locks on the work side.*

**Fail-closed machine detection.** Each machine of mine is a directory in agent-config, and a device resolves which one it is from its own hostname. When nothing resolves, the device is treated as a work machine. That does not mean only the company's Claude and Codex can run. It means the account check below applies, so a company account still works and a personal one is blocked until the machine is identified. An unidentified machine is the wrong place to guess, and the cost of guessing wrong the safe way is a blocked prompt, which I can fix in a minute.

**An account check on every prompt.** In work context, a hook reads which account the harness is signed in to. A company account passes. Any other account blocks the prompt, my personal Claude and my personal Codex included, and so does an account the hook cannot read. So the lane is enforced by the account itself, not by which program runs: the same Claude Code works at work with the company account and works on my personal projects with my own. At session start the hook only warns. The prompt is where it blocks. It prints only the word company, never the address it read, and it works for both Claude and Codex.

**A launch gate.** The wrapper that starts OpenCode asks the route check for permission first, and the route check refuses in work context. Starting it inside a work repository is a hard stop, whatever the repository's clearance file says, because a work repository can never be cleared for non-private models.

The honest limit on the third lock is that it guards habit. Calling the binary by its full path skips the wrapper. The account check is the one a session cannot step around, which is why it exists as a separate lock rather than a feature of the third.

These constants live in the code, not in the registry or in any state file, so no answer, flag or clearance can lift them. Each copy has a test. When I wrote the account check I wrote the test first, and I did not run it red before writing the script, so that one rule has a green test without the red one behind it. I am telling you because the red-first run is what makes a test mean something.

## What gets recorded, and why free and paid sit apart

A layer that cannot report is a layer you cannot tune. The Stop and SubagentStop hooks each run a small script that appends one JSON line to a file named for the local date. A line holds the time, the machine, the harness, the project, the plan, the session, the agent type, the model, the provider, the cost class, the private flag, the input, cache and output token counts, the dollar cost where the provider reports one, and how the model was picked.

Four rules keep the ledger honest.

- **Counts do not overlap.** The token numbers are sums since the session's previous record, so nothing is counted twice.
- **Provider, cost class and privacy come from the registry by exact id.** An unknown id records as unknown and not private.
- **The writer can never block a session.** It always exits cleanly, and a failed write is the ledger's problem and nobody else's.
- **Files age out.** Anything older than ninety days is deleted on the first write of each day.

A metered record with no dollar figure and no known price is counted at the whole daily cap until the layer can account for it. That is a conservative guess in the direction that protects me.

[PANTRY](pantry-beside-the-work.md), the desk I built beside my work, reads those files and reports use by project, plan, session and subagent, split by harness, model, cost class and privacy. Free is kept apart from paid, because the point of the free model is to see how much work stopped costing anything. One caveat on today's screen: its funding column groups plan and metered together as paid, while the ledger underneath keeps all three classes.

At every session start, a PANTRY contract row in the session checklist checks that PANTRY reads the usage rows agent-config writes, so a change in the record format cannot quietly blind the desk. Not every machine runs PANTRY: my Windows machine and my work Mac carry a marker that says so, read the plan files straight from each repository, and skip those rows instead of failing them.

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

The model guard sits on two rows on purpose. Claude Code enforces it mechanically with a hook, while the other harnesses can only print the restart command and ask me, which is assisted.

<svg viewBox="0 0 620 356" width="100%" role="img"
     aria-label="Five conformance levels and where my pieces sit. Configured: registry pins for every harness. Mechanically enforced: the model guard in Claude Code, the account check and the launch gate. Verified by test: the route check, the usage ledger and the retry after a faked 429. Assisted: the model guard on the other harnesses, which can only ask. Unsupported, drawn hollow: DeepSeek Harness, on hold, its rows reported as unsupported."
     style="display:block;width:100%;max-width:580px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="16" width="580" height="56" rx="6"/>
    <rect x="20" y="82" width="580" height="56" rx="6"/>
    <rect x="20" y="148" width="580" height="56" rx="6"/>
    <rect x="20" y="214" width="580" height="56" rx="6"/>
    <rect x="20" y="280" width="580" height="56" rx="6" stroke-dasharray="5 4"/>
  </g>
  <g>
    <circle cx="48" cy="44" r="9" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
    <circle cx="48" cy="110" r="9" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
    <circle cx="48" cy="176" r="9" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
    <circle cx="48" cy="242" r="9" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
    <circle cx="48" cy="308" r="9" style="fill:none;stroke:var(--color-fg);stroke-width:1.5"/>
  </g>
  <g>
    <text x="72" y="40" style="fill:var(--color-fg)">Configured</text>
    <text x="72" y="59" style="fill:var(--color-muted);font-size:12px">the registry pins for every harness</text>
    <text x="72" y="106" style="fill:var(--color-fg)">Mechanically enforced</text>
    <text x="72" y="125" style="fill:var(--color-muted);font-size:12px">the model guard in Claude Code, the account check, the launch gate</text>
    <text x="72" y="172" style="fill:var(--color-fg)">Verified by test</text>
    <text x="72" y="191" style="fill:var(--color-muted);font-size:12px">route check, usage ledger, one retry after a quota error</text>
    <text x="72" y="238" style="fill:var(--color-fg)">Assisted</text>
    <text x="72" y="257" style="fill:var(--color-muted);font-size:12px">the model guard on the other harnesses, which can only ask</text>
    <text x="72" y="304" style="fill:var(--color-fg)">Unsupported</text>
    <text x="72" y="323" style="fill:var(--color-muted);font-size:12px">DeepSeek Harness, on hold, its rows reported as unsupported</text>
  </g>
</svg>

*A filled dot means the pieces beside it pass at that level. The hollow one is the level for what a harness cannot do, said out loud.*

## Build your own

You do not need my code. You need these, in this order.

1. **A registry.** One file with your tiers, roles and model ids, and a rule that no other file may contain a model id. Add a cost class and a private flag per model from the start, and write every id as provider and model. Retrofitting privacy into a registry that did not have it is harder than starting with it.
2. **Pins that check against the registry.** Every agent file and settings file is a pin, and a checker reports any that disagree. This is how mine found five files that disagreed.
3. **A main-model guard.** Whatever starts your sessions, make a session on the wrong model stop before it does work, and make the way out explicit and narrow.
4. **A route check.** One script that answers which model takes this task, from the registry and a small state file. Give it exit codes that mean ask me, nothing private available, refused and everything spent, so the caller cannot treat a refusal as a failure to retry, and have the last one write a checkpoint before it stops.
5. **A clearance answer per repository.** Ask once, store the answer, and never default to yes.
6. **A cost order.** Free, then a small fixed plan, then the plan you already pay for, with a sticky pick so a task does not hop between models mid-flight.
7. **A paid route only you can open.** Keep metered spend out of the order. Paid use goes through a request record and an approval typed in a terminal, the provider key stays away from agents, and a prepaid balance is the ceiling.
8. **A work lane with constants in code.** If you also use AI at work, put the identifiers of your work context where no answer can change them, and fail closed when the device cannot be identified.
9. **A usage record.** One line per session and subagent, with the cost class and the private flag, from day one.
10. **A verifier that grades its own checks.** Five levels, one line per check, and a rule that a capability is never reported as working on configuration alone.

If you want to start smaller, steps 1, 4 and 6 are where I would expect most of the saving to come from, though I have not measured how the saving splits between them. Steps 5 and 8 are the ones to add before you let a free model near anything you do not own.

## What is public, and what is private

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
    <text x="475" y="76" style="fill:var(--color-muted);font-size:12px">stated as policy, no registry</text>
    <text x="475" y="150" style="fill:var(--color-bg)">The layer, wired per machine</text>
    <text x="475" y="172" style="fill:var(--color-bg);font-size:12px">registry, guards, route check,</text>
    <text x="475" y="188" style="fill:var(--color-bg);font-size:12px">ledger, running under</text>
    <text x="475" y="204" style="fill:var(--color-bg);font-size:12px">your own settings</text>
    <text x="475" y="272" style="fill:var(--color-fg)">Harnesses and models</text>
    <text x="475" y="292" style="fill:var(--color-muted);font-size:12px">Claude Code, OpenCode, Codex</text>
  </g>
</svg>

*The policy is public so you can copy it. The wiring is private because it names things about my machines and my employer that are not mine to publish.*

**Public, and why.** The standards are the contract, and a contract you cannot read cannot be adopted. [MODELS](/standards/models) holds the tiers, the roles, the guard, the equivalents table and the tokenomics rules. [LOOP](/standards/loop), [SESSION-LOOP](/standards/session-loop) and [HOOKS](/standards/hooks) hold what the layer plugs into, and [VOICE](/standards/voice) holds how this note is written. The portfolio repository that renders them is public too. Nothing in them names an account, a path on my disk or the full registry.

**Private, and why.** The agent-config repository holds the registry with real identifiers, the hook scripts, and the constants the work guard compares against, which identify an employer. It also holds each machine's settings, which are a permission surface: a session is never allowed to write them, and I apply changes myself from a command that refuses to run unless the repository is clean and level with origin, and backs up the live file first. Accounts, keys and sign-ins are in neither repository, and never should be.

## What the layer does not do

The layer is not finished, and I would rather say so than let the diagrams above suggest it. The registry, the guards, the fallback order, the usage records, the escalation records with their typed approval, the supervisor, the context check, recovery checkpoints, the goldfish gate and Model Scout are built and have been through audit. Audit is not the same as use, so here is the line. Proven in real use: the Go route and its allowance check, live through the OpenCode plugin on my Mac, and the whole layer in Claude Code, which my Windows machine checks at every session start. Tested but not yet seen live: the free model running out mid-task and the request moving on by itself, the main session's recovery order, the Codex side of the checks, and Sol taking light work on OpenCode. What is left beyond that is smaller.

| Still ahead | State |
|---|---|
| Continuing a session without a click | Assisted today. Archiving the old session still needs my click |
| Proof that a goldfish review was fresh | The gate checks the order, the place and the findings of a review. It cannot prove the context was isolated |
| Model Scout evaluations | By hand only, on the Mac for free models |
| DeepSeek Harness | On hold. The app is deleted, and the verifier reports its rows as unsupported |

What is on hold or not yet tested has one home, section 19 of MODELS, and I keep it there so this note cannot drift from it.

The layer proves the routing and the privacy rules. It does not prove the work is good. The second reader, the fresh goldfish, is still the thing that catches that. Ten times zero is still zero, and a cheaper model is still a model.

## The sources

The idea of reviewing a plan with fresh readers comes from Google's [Elephants, Goldfish, and the New Golden Age of Software Engineering](https://research.google/pubs/elephants-goldfish-and-the-new-golden-age-of-software-engineering/), and the practice I adapted is in the [elephant-goldfish-model](https://github.com/google/elephant-goldfish-model) repository, Apache 2.0. [OpenCode](https://opencode.ai) is the harness. [Addy Osmani](/people#addy-osmani) is on the reading page for the loop, and the vocabulary of harness, loop and standards comes from [The Loop Outlives the Model](one-loop-three-harnesses.md) and [Set Up the Loop With One Prompt](loop-setup.md). The policy is [MODELS](/standards/models), the review practice is [AI-DEVELOPMENT](/standards/ai-development), and the desk that shows the usage is [PANTRY](pantry-beside-the-work.md). The numbers here are a snapshot from 2026-11-23, and every model name will be out of date before you read this, which is the reason the registry exists.

## The turn

I built this to stop running out, and the part I use most turned out to be the record. Before the layer, a model going dry was a decision I made tired, by hand, at the worst moment, and nothing remembered it afterwards. Now it is a lookup with a reason attached, a skip I can read, and one line in a ledger I can open the next morning and argue with.

If you take one thing, take that shape rather than my code. Put every model name in one file, make every rule that matters a hook instead of a hope, and grade every check by what its pass actually proved. Every model in this note will be renamed soon. The file they live in will not move.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
