---
title: "The Decision Model I Did Not Install"
audience: [build, learn]
level: deep
subtitle: "AnyJev turns an open model into a typed decision with a real probability. I read it for my agent loop, took four ideas, and left the model on the shelf."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-24
readingTime: "~9 min"
tags: [ai, workflow, tooling, models]
summary: >
  AnyJev turns an open model into a decision model: a typed question, a probability over the answers,
  and a correction for the order the options arrive in. I read it because I wanted my agent loop to be
  smarter and more predictable, then tested one of the loop's own claims against the wiring. The test
  found a real gap, and it also found the limit of what a library like this can fix. This note shows
  what AnyJev does, why it does not drop into a loop on rented APIs, and the four ideas I am copying
  instead.
social: |
  A repo called AnyJev was trending, so I spent a morning reading it as a list of things wrong with my
  own agent loop.

  The pitch is good. Give a model a typed question, read the probability over the answers, and correct
  for the order the options arrive in. No training, no labels. They report the share of decisions safe
  to automate at a 5 percent error going from 7.7 percent to 46.3 percent.

  I did not install it. My loop runs on rented APIs, and AnyJev needs the numbers under the
  next-token distribution. Running it myself means a model server I have to keep alive.

  I took four ideas instead: give a decision a type and a probability, ask two-option questions both
  ways, cap how often a hard case escalates, and keep one source of truth for routing.

  The morning also made me test one of my own claims, and it failed. That part is in the note.
socialImage: "/media/notes/the-decision-model-i-did-not-install-social.png"
socialImageAlt: "A paper and ink card titled The decision model I did not install. Four tiles read: a typed question, a probability, both orders, and a capped escalation. A line at the foot reads: I took the interface, not the model."
---

I have a bad habit. When a repo trends, I read it as a list of things wrong with my own setup.

AnyJev showed up in my feed with a promise that fits the habit. Turn any language model into a decision model. Not a chatbot with opinions, a thing that answers a typed question and gives you a probability over the answers, with no training and no labels.

I spent a morning with it. This is what it does, where it would fit in my loop, and why the model stayed on the shelf while four of its ideas came home with me.

## What AnyJev actually does

You hand it a state and a typed question. A choice with four options, a yes or no, a score from one to five. It reads the model's next-token distribution over those option labels and returns a decision with a probability attached. Nothing is parsed out of prose, so a decision cannot fail to parse.

The clever part is what it does about bias. A raw readout changes its answer when you reorder the options, and it carries a preference for some labels over others. The training-free version averages over rotations of the options and divides out the label prior it estimated without labels. They call that L0. On Qwen3-8B, over 300 test items, reversing the options flipped the raw answer 23.0 percent of the time. With L0 it flipped 7.3 percent of the time. Accuracy went from 74.7 to 80.3.

<svg viewBox="0 0 620 330" width="100%" role="img"
     aria-label="Two pairs of bars for AnyJev on Qwen3-8B over 300 test items. The first pair, the answer flipping when the options are reversed, falls from 23.0 percent with the raw readout to 7.3 percent with L0. The second pair, decisions safe to automate at a 5 percent error, rises from 7.7 percent raw to 46.3 percent with L0."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;
            --paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--bar:#cbc1b3;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="329" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="30" style="fill:var(--muted);font-size:15px">AnyJev, Qwen3-8B, 300 items, no labels</text>

  <g style="stroke:var(--edge);stroke-width:1">
    <line x1="190" y1="58" x2="190" y2="272"/>
    <line x1="285" y1="58" x2="285" y2="272"/>
    <line x1="380" y1="58" x2="380" y2="272"/>
    <line x1="475" y1="58" x2="475" y2="272"/>
  </g>
  <g text-anchor="middle" style="fill:var(--muted);font-size:12.5px">
    <text x="190" y="288">0</text>
    <text x="285" y="288">12.5</text>
    <text x="380" y="288">25</text>
    <text x="475" y="288">37.5</text>
    <text x="570" y="288">50%</text>
  </g>

  <text x="182" y="84" text-anchor="end" style="fill:var(--muted);font-size:14px">Raw</text>
  <rect x="190" y="68" width="175" height="22" rx="2" style="fill:var(--bar)"/>
  <text x="373" y="84" style="fill:var(--muted);font-size:12.5px">23.0</text>

  <text x="182" y="118" text-anchor="end" style="fill:var(--ink);font-size:14px">L0</text>
  <rect x="190" y="102" width="56" height="22" rx="2" style="fill:var(--ink)"/>
  <text x="254" y="118" style="fill:var(--ink);font-size:12.5px">7.3</text>

  <text x="28" y="160" style="fill:var(--muted);font-size:13px">Answer flips when the options are reversed, percent</text>

  <text x="182" y="202" text-anchor="end" style="fill:var(--muted);font-size:14px">Raw</text>
  <rect x="190" y="186" width="59" height="22" rx="2" style="fill:var(--bar)"/>
  <text x="257" y="202" style="fill:var(--muted);font-size:12.5px">7.7</text>

  <text x="182" y="236" text-anchor="end" style="fill:var(--ink);font-size:14px">L0</text>
  <rect x="190" y="220" width="352" height="22" rx="2" style="fill:var(--ink)"/>
  <text x="550" y="236" style="fill:var(--ink);font-size:12.5px">46.3</text>

  <text x="28" y="264" style="fill:var(--muted);font-size:13px">Decisions safe to automate at a 5 percent error, percent</text>

  <text x="28" y="312" style="fill:var(--accent);font-size:13px">One correction, no labels: nearly half the decisions become safe to take.</text>
</svg>

*The result that made me keep reading. Accuracy moved six points. The share I could hand to a machine more than quintupled, with no labels anywhere.*

There is a trained variant too, Tacit, where the model learns to give in one forward pass the answer it reaches when it reasons. With adaptive on, a decision whose top two answers are close goes to the model's own reasoning, and the share that escalates is capped. At most a fifth of the last thousand decisions, however hard the traffic gets. Every escalation is reported.

That cap is the part I kept thinking about.

## Where my loop makes decisions

My loop runs on Claude, Codex and OpenCode, the three harnesses in [The Loop Outlives the Model](one-loop-three-harnesses.md). It makes three kinds of decision.

The first kind is a rule. Which model takes this prompt, whether a repository may go to a model that is not private, whether the paid route is open. Those live in a registry and a router, and they should stay rules. A probability would make them worse.

The second kind is a judgment with a cheap answer. Is this piece of work planning or building? Is this review finding real? Does this gate pass? Today those are words in a prompt and a regex in a hook, and the regex is the part someone has to maintain.

The third kind is the one I care about. A decision that matters enough to escalate, where the cost of being wrong is a wasted session rather than a wrong label. AnyJev is built for the first and second kinds, and its cap is the primitive the third kind has been missing.

## Why it does not drop into my loop

The models I use are rented through APIs. AnyJev needs the logits, the raw numbers under the next-token distribution, and for Tacit it needs the weights. Neither is on the menu.

Running it locally would mean a model server on a machine I own, a GPU or a good Metal backend, and another service to keep alive and back up. The repo supports Hugging Face, vLLM, SGLang and llama.cpp, and the last one makes a small checkpoint plausible on a Mac. That is still a new moving part in a setup whose whole argument is fewer moving parts.

Then there is the domain. Its benchmarks are classification tasks. Intent labels on customer messages. Yes or no on a statement. The repo lists agent-loop evaluation as a roadmap item, not a result. A loop like mine does not need a better classifier. It needs fewer places where the answer depends on which model happened to wake up.

So I did not install it. I did use it as a test.

## The test it made me run

AnyJev is about decisions that carry a probability. My loop is full of decisions that do not. So I picked the one I had written down most confidently. Planning goes to the strong tier.

[The technical note](how-the-model-layer-works.md) says planning and review stay on the strong tier, Opus and Sol, or DeepSeek V4 Pro on the Go plan when Codex is spent. That is the design. The registry gives OpenCode a strong lane of its own, and as of today that lane is V4 Pro, not a Sonnet the provider does not serve. When Codex is marked out, the strong tier answers on V4 Pro.

I got the first version of this wrong. I ran the router, saw the Codex model come back, and wrote that the strong tier was not V4 Pro. It is. The Codex plan was simply not marked out yet, so the strong lane was still borrowing Codex's model. Move the plan out and the same command answers V4 Pro.

The gap is one layer down. I asked what this session could actually spawn. Three subagents. A reviewer on the Codex model, a second reviewer on Gemini for when Codex is spent, and a writer. No planner. The OpenCode config listed eight agents and the planner was not one of them. The registry said the planner role was strong. No agent in that harness asked for the role.

The escalation hook did not save it either. That hook runs in Claude Code and Codex, where the planner exists. OpenCode runs plugins, not shell hooks, so no advice fired at all. The session planned the work itself, on the model it was already on.

The verifier had a row for delegation, and it said unsupported, with a note that OpenCode uses a paid reviewer rather than the planner hook. So the system knew. The note I published did not.

| Piece | What it says | What it does |
| --- | --- | --- |
| The registry | Strong is Codex, or V4 Pro on Go once Codex is spent | Names a tier, not an agent |
| The escalation hook | Delegate planning to the planner | Runs in Claude Code and Codex, not in OpenCode |
| The agent list | Eight agents, light routing for bounded work | Had no planner and no strong child |
| This session | Main chain | Runs DeepSeek Flash on Go, the execution path |

The last row is the one that stings. The router, asked for the main chain, now puts V4 Pro second, after the Codex model. This session is on Flash. That means it was started outside the launcher that asks the router, probably as bounded execution work. The loop is not wrong about which model it wants. The session never asked.

That is what more deterministic actually looks like in a setup like mine. Not a better model choosing between routes. One place that owns the route, and every entry point going through it.

The repair took less time than the note. OpenCode now has a planner pinned to V4 Pro on the Go plan, a verifier row fails when a role the registry names has no agent on a harness, and the routing doc is checked against the registry instead of being trusted. Two roles OpenCode routes elsewhere, the plan reviewer and the auditor, carry a written waiver with the reason. The check reads both.

## Four ideas I am taking

None of these needs a GPU.

**A decision gets a type and a probability.** AnyJev refuses free-prose decisions. I do not need logits to copy that. A gate can return a structured answer with a confidence, and the code that reads it can treat a low confidence as a different event from a no.

**Order bias is measurable, so measure it.** If a gate asks whether this is planning or building, ask it both ways. When the two answers disagree, send it up a tier. That is one extra cheap call and it removes a class of silent flips I had no name for before this repo gave me one.

**Escalation needs a cap, not a mood.** My escalation rule fires on the shape of a prompt and says the piece belongs on the strong tier. It has no budget and no record of how often it has fired. A cap per window, with every escalation written down, makes the cost predictable. This is the primitive I most want.

<svg viewBox="0 0 320 392" width="100%" role="img"
     aria-label="A loop with four steps: ask a typed question, read the probability, ask the two-option question both ways, and escalate under a cap. An arrow returns from the capped escalation to the next decision."
     style="display:block;width:100%;max-width:430px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-decision0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="85" y="16" width="150" height="44" rx="6"/>
    <rect x="85" y="96" width="150" height="44" rx="6"/>
    <rect x="85" y="176" width="150" height="44" rx="6"/>
  </g>
  <rect x="85" y="256" width="150" height="44" rx="6"
        style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="160" y1="60" x2="160" y2="92" marker-end="url(#fl-decision0)"/>
    <line x1="160" y1="140" x2="160" y2="172" marker-end="url(#fl-decision0)"/>
    <line x1="160" y1="220" x2="160" y2="252" marker-end="url(#fl-decision0)"/>
    <path d="M85,278 L48,278 L48,38 L81,38" stroke-dasharray="6 5" marker-end="url(#fl-decision0)"/>
  </g>
  <g text-anchor="middle">
    <text x="160" y="43" style="fill:var(--color-fg)">Ask a typed question</text>
    <text x="160" y="123" style="fill:var(--color-fg)">Read the probability</text>
    <text x="160" y="203" style="fill:var(--color-fg)">Ask it both ways</text>
    <text x="160" y="283" style="fill:var(--color-bg)">Escalate under the cap</text>
  </g>
  <text x="60" y="160" text-anchor="middle" transform="rotate(-90 60 160)"
        style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">next decision</text>
</svg>

*The loop I want: a typed question, a probability, a second reading with the options reversed, and an escalation that has a budget.*

**One source of truth.** The registry, the docs and the harness config should be generated from one file, and a test should fail when they disagree. That is the fix for the table above, and it is boring on purpose.

## What I am not claiming

I have not run AnyJev on this loop. I have not measured a smarter route or a faster session. The numbers in this note are theirs, from their benchmark, on a model I do not run.

What I have measured is smaller and more useful. A published claim in my own notes, tested against the setup it describes, was false in one harness. The repair is wiring. The library was the prompt, not the fix.

There is a version of this where the borrowed primitives make routing cheaper and more predictable. I will know when the escalations have a count and the gates have a probability, and neither exists yet.

## The shelf

The repo is on the shelf. The ideas are in the loop.

I still think a decision model is the right shape for the judgment calls in an agent loop. I just do not need to own the weights to get the shape. I need to stop asking a model to answer in prose and then guessing what it meant.

The morning cost me a few hours and one wrong sentence in a published note. The sentence is now right. The four ideas are queued. That is a better trade than another trending repo I read and forgot.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
