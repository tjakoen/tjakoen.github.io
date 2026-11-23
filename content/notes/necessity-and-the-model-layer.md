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

  It picks the model for me. A free model and a small plan take the light work, Opus and Sol keep the planning, and a
  fallback order with cooldowns handles the day a model says 429. Hard guards keep the free model, Go
  and DeepSeek off work machines and work repositories.

  Necessity, mother of innovation. The story is in the note, and the technical version is in a second one.
socialImage:
  - "/media/notes/model-layer-architecture.gif"
  - "/media/notes/model-layer-infographic.gif"
  - "/media/notes/necessity-and-the-model-layer-social.png"
socialImageAlt:
  - "An animated diagram of the whole stack, from me through the loop, the Model Intelligence Layer, the harnesses and the models by role, with Opus and Sol for planning and review, down to PANTRY. A numbered caption follows one request: the registry gives it a tier, the free model is out for today, so OpenCode Go takes it, while private repositories stay on Claude and Codex and the paid API waits for my typed yes. PANTRY logs the call. The tagline reads: never stalls, never overspends, never leaks private code."
  - "Six cards titled 6 rules behind how my agents pick a model, and who pays: tiers, not models; one free model, then Go; paid only on a typed yes; four at a time; recover, don't stall; and checked every session. Each card's small diagram plays on a loop, and a banner reads: spend free and flat-rate first; real money only on a typed yes."
  - "The layers of the setup stacked on one card: me, the loop of standards, plans, review and human gates, then the Model Intelligence Layer with a registry, route check, model guard and work guard, then the harnesses Claude Code, OpenCode and the Codex app, then the models, where the free and Go models and the DeepSeek API are dashed because they may keep prompts. A line says they are for personal projects only."
---

I spent my Codex usage and still had four hours to go before the five-hour refresh. I was in the zone. I did not want to stop.

The Claude weekly limit had already put me three days from a refresh, and Codex was halfway out with six days left on its own. I do a lot of work with AI, and once again I ran out. I did not want to spend more. The $100 plans feel like too much pressure to maximize, because paying that much turns every idle evening into a small failure to use what I bought.

So I did what I usually do when something annoys me enough. I built infrastructure.

> This continues [The Loop Outlives the Model](one-loop-three-harnesses.md), where I explained bringing DeepSeek in when both plans ran out. This is the short story of what came next. [How the Model Intelligence Layer Works](how-the-model-layer-works.md) is the technical one.

## The night I went looking for a way out

The first thing I tried was running a model on my own machine. I have an RTX 3050 with 8 GB of memory. It runs small models fine and runs the ones I would want for coding badly, and a coding model that is worse than the one I am paying for is not a saving, it is a hobby. I put that idea back on the shelf for a year or two.

The second thing was free models online. They exist, they are better than I expected, and the catch is printed on the label: a free endpoint may keep whatever you send it. I decided I could accept that trade for my own projects, where the code is public anyway, and for nothing else. That decision is the most important one in this note, and most of what I built exists to enforce it.

None of this was a new idea about the work. I already handed light work down from Sonnet to Haiku before I built any of it, so the strong plan was never doing everything. The free models are one more rung on that same ladder, at the cheap end. What is new is that the rung costs nothing and the ladder now crosses providers.

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

In plain words, here is how it behaves.

Planning and review stay on the strong models, Opus on Claude and Sol on Codex, because that is where judgment pays for itself. Everything lighter goes down a fixed order: one free model first, then the same model on a small monthly plan, then the Codex plan I have already paid for. The paid DeepSeek API is not in that order at all. It is an escalation, and it runs only after I type an approval in a terminal. Before it picks Go, it reads how much of Go's allowance is left and skips it when a limit is reached. When a model says no anyway, the layer cools it down and picks the next one, and a main session that runs out moves to Go on its own before it would ever ask me about the paid route. If a session starts on the wrong model, it stops before doing any work and offers me a restart. Every session and subagent leaves one record of what it used, and my desk, PANTRY, shows free and paid apart.

<figure class="shot">
  <img class="shot__img" src="/media/notes/model-layer-architecture.gif" width="1200" height="1300" loading="lazy" data-lightbox
       alt="An animated diagram of the whole stack: me at the top, then the loop of standards, plans, independent review and human gates, then the Model Intelligence Layer with its registry, router, supervisor and recovery, then the harnesses Claude Code, OpenCode and the Codex app, then the models by role: Opus and Sol for planning and review, the free model, OpenCode Go and Luna for light work, and the DeepSeek API only on my yes. PANTRY sits underneath. A numbered caption follows one request: it becomes a plan, passes the gates, the registry gives it a tier, the router sends it through OpenCode to the free model, which is out for today, so OpenCode Go takes it. While it runs, two labels show that private repositories stay private and the paid API waits for my typed yes. The answer comes back and PANTRY logs one more usage row. The tagline reads: never stalls, never overspends, never leaks private code.">
  <figcaption class="shot__cap">One request through the whole stack. Opus and Sol keep the planning and review; the light work goes to the first model that is not out, and nothing private or paid moves without the rule that guards it.</figcaption>
</figure>

<!-- stack:ladder -->
<svg viewBox="0 0 640 358" width="100%" role="img" aria-label="The order for light work. First DeepSeek V4.1 Flash Free, the one free model, since the free models share one daily message cap. Second the same model on the OpenCode Go plan, a small monthly plan with one shared allowance. Third the Codex models, Luna and then Sol at low effort, while the Codex plan has usage left. Fourth, when none is left, the route check stops and asks me. The paid DeepSeek API is never in this order. It is an escalation that needs an approval I type in a terminal." style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif"><rect x="20" y="14" width="600" height="68" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="36" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">1. DeepSeek V4.1 Flash Free</text><text x="320" y="54" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">The one free model. The free models share one daily message cap,</text><text x="320" y="70" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">so a chain of five was one fallback in practice.</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="86" x2="320" y2="108"/><path d="M316,102 L320,108 L324,102"/></g><rect x="20" y="112" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="134" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">2. DeepSeek V4.1 Flash on OpenCode Go</text><text x="320" y="152" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">The same model on a small monthly plan with one shared allowance</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="168" x2="320" y2="190"/><path d="M316,184 L320,190 L324,184"/></g><rect x="20" y="194" width="600" height="52" rx="8" style="fill:none;stroke:var(--color-line);stroke-width:1"/><text x="320" y="216" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">3. The Codex models</text><text x="320" y="234" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">Luna, then Sol at low effort, while the plan has usage left</text><g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="320" y1="250" x2="320" y2="272"/><path d="M316,266 L320,272 L324,266"/></g><rect x="20" y="276" width="600" height="68" rx="8" style="fill:none;stroke:var(--color-fg);stroke-width:2.2"/><text x="320" y="298" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">4. Stop and ask me</text><text x="320" y="316" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">The paid DeepSeek API is never in this order.</text><text x="320" y="332" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">It is an escalation, and it needs the approval I type.</text></svg>
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

The third is fewer apps and fewer moods. I do not choose between four programs when something runs out. I open the one I always open.

## The turn

I ran out at the wrong moment, with four hours left on a clock I could not argue with. Now the next model is a lookup, the lookup knows what it is allowed to touch, and I stay in the zone.

If you want the machinery, every piece with its diagram and a list of the steps to build your own, it is in [How the Model Intelligence Layer Works](how-the-model-layer-works.md). The setup guide that the layer sits on is [Set Up the Loop With One Prompt](loop-setup.md).

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
