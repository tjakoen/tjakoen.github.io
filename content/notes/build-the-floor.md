---
title: "Everybody Wants the Agent. Somebody Has to Build the Floor."
subtitle: "How an organization goes from developers with AI subscriptions to real automation, in five stages over eighteen months. Skills first, used by hand, then triggered, then unattended. The agent is the last thing you build, not the first."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-08-18
readingTime: "~24 min"
deck: "Build the floor | Talk | /talks/build-the-floor | 27 slides · runs in the browser, no download"
tags: [ai, workflow, standards, developer-tools, architecture]
summary: >
  Most organizations have bought AI subscriptions and are hoping the automation arrives on its own.
  This is the roadmap that actually gets there, and the implementation behind each stage. Instrument
  and make one repository legible now. Extract skills from the people who do the work and let
  developers run them by hand. Score what happens. Then fire the same skills from triggers, then
  chain them into loops that run unattended. One artifact travels the whole way, so there is never a
  second system and never a migration project. Includes what to build now, what six months looks
  like, where a year lands, and the six ways these systems fail without telling you.
---

## The part everybody skips

Everybody wants the agent that opens pull requests while they sleep. I want it too. It is genuinely
the most interesting thing to happen to this job in my career.

Almost nobody wants to build the thing underneath it, which is unglamorous, takes a quarter, and
mostly consists of making a codebase legible to a machine that has never met you.

I have been building this across about a dozen repositories over the last few months, and I have
gotten a useful amount of it wrong in public. The smaller, one-person version of it is written up in
[I Was Shipping Faster Than I Could Understand It](one-loop-every-repo.md), including the week I
could not explain half of what had shipped. This is the shape that works, the parts that broke, and what I
would do with an organization's worth of it. It is an implementation note, not a business case, so
there is no section here about what AI means for your industry.

One thing before the build, because it is the reason the build is shaped this way.

## The floor is the variable, and it is measurable

DORA said it plainly across roughly five thousand technology professionals: AI amplifies whatever an
organization already is. Strong engineering organizations get faster. Weak ones fail faster.

Faros AI then put a stopwatch on both halves. Two years of telemetry, 22,000 developers, 4,000
teams, each team's lowest-adoption period against its highest.

<div class="live-fig" data-live-figure="whiplash" data-surface="figure:whiplash">
<svg viewBox="0 0 620 268" width="100%" role="img"
     aria-label="Faros AI telemetry across 22,000 developers comparing low and high AI adoption. Epics completed per developer rose 66 percent and task throughput rose 34 percent. Against that, bugs per developer rose 54 percent, incidents per pull request rose 243 percent, median time in code review rose 442 percent, and code churn rose 861 percent."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;--paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--bar:#cbc1b3;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="267" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="30" style="fill:var(--muted);font-size:15px">What high AI adoption bought, and what it cost</text>
  <text x="28" y="58" style="fill:var(--muted);font-size:12.5px">the gains</text>
  <text x="28" y="82" style="fill:var(--ink);font-size:14px">Epics per developer</text>
  <rect x="230" y="68" width="46" height="18" style="fill:var(--bar)"/>
  <text x="284" y="82" style="fill:var(--muted);font-size:12.5px">+66%</text>
  <text x="28" y="110" style="fill:var(--ink);font-size:14px">Task throughput</text>
  <rect x="230" y="96" width="24" height="18" style="fill:var(--bar)"/>
  <text x="262" y="110" style="fill:var(--muted);font-size:12.5px">+34%</text>
  <text x="28" y="146" style="fill:var(--muted);font-size:12.5px">the bill</text>
  <text x="28" y="170" style="fill:var(--ink);font-size:14px">Bugs per developer</text>
  <rect x="230" y="156" width="38" height="18" style="fill:var(--ink)"/>
  <text x="276" y="170" style="fill:var(--muted);font-size:12.5px">+54%</text>
  <text x="28" y="198" style="fill:var(--ink);font-size:14px">Incidents per pull request</text>
  <rect x="230" y="184" width="169" height="18" style="fill:var(--ink)"/>
  <text x="407" y="198" style="fill:var(--muted);font-size:12.5px">+243%</text>
  <text x="28" y="226" style="fill:var(--ink);font-size:14px">Median time in review</text>
  <rect x="230" y="212" width="307" height="18" style="fill:var(--ink)"/>
  <text x="545" y="226" style="fill:var(--muted);font-size:12.5px">+442%</text>
  <text x="28" y="252" style="fill:var(--accent);font-size:13px">Code churn rose 861%, which is off this scale entirely.</text>
</svg>
</div>
<p class="live-fig__note">Drag the dial. Review capacity never moves, because it is a property of your team rather than of the tool you bought. Everything past the line is the queue, and the queue is what the numbers above are measuring.</p>

*The gains are real. They are also the smaller number on the page.*

Faros call it the Acceleration Whiplash, and the mechanism is not mysterious: generation capacity is
elastic and review capacity is not. Merges with no review at all rose 31.3%. Read that carefully,
because the wrong version of it is circulating: it is a 31.3% rise in unreviewed merges, not a claim
that a third of everything goes unreviewed.

I call the thing that decides which side you land on the substrate gap. It is the distance between
what your tools can do and what your codebase can absorb, and every technique below is a way of
closing some of it.

The industry has landed on a word for the machinery that closes it: a **harness**. The definition
worth borrowing is [Anthropic's](https://www.anthropic.com/engineering/harness-design-long-running-apps),
who use it for the structured system you build around a model: the scaffolding that decides what it
sees, what it may touch, and who checks the result. Everything in the second half of this note is harness work
by that definition, and it is worth knowing the term because it is what the good writing on this is
filed under. Watch the ambiguity, though. Plenty of people use the same word for the tool you work
inside, the editor or agent runtime, which is a thing you buy rather than a thing you build. The one
that decides your outcome is the one you build.

Two more numbers worth carrying into the build, then I will stop citing things. Veracode's 2026
report puts unguided AI-generated code at a 56% security pass rate, flat for two years while
syntactic correctness climbed past 95%, which tells you the failure is not in the typing. And METR's
controlled trial found experienced maintainers were 19% slower with AI while believing they had been
20% faster, which tells you not to instrument this with a survey.

## The roadmap

Here is the whole thing on one page. Eighteen months from a room full of developers with
subscriptions to an organization with real automation, and the honest version of how long each part
takes.

<div class="live-fig" data-live-figure="roadmap" data-surface="figure:roadmap">
<p><em>Five stages over eighteen months. Instrument and make one repository legible, months 0 to 2.
Extract skills and run them by hand, 1 to 5. Daily use with scored outcomes, 3 to 9. The same skills
fired by triggers, 6 to 12. Chained unattended loops, 10 to 18. Each stage opens on scored runs
behind it rather than on the date.</em></p>
</div>
<p class="live-fig__note">Drag the cursor to where your organization actually is. It will tell you what should already hold, and what you are allowed to start next.</p>

*Five stages, and the same artifact travels through all of them.*

That is the part I would put in front of a room first, because it is the part that is usually
missing. Most organizations have bought stage zero and are hoping stage four arrives on its own.

**The spine of it is one idea: a skill is written once and then promoted.** A developer runs it by
hand. You log what happened. Once it has enough scored runs behind it, the same file gets fired by a
trigger instead of a person. Once that holds at volume, it runs unattended. Then it chains into
other skills and you have a loop. You never build a second system, and there is never a migration
project where the manual thing gets rewritten as the automated thing.

That is why the order is skills first and automation last, and not the other way around. Automation
built before the skill exists is a bespoke pipeline that encodes nobody's judgement. The skill is
the asset. The loop is just the skill with the human taken out of the trigger, once it has earned
that.

### What we can do now

Weeks, not months, and none of it needs a procurement conversation.

**Instrument, including the disclosure marker.** Every agent-authored change gets marked: a label, a
branch prefix, a bot author, commit trailers, whatever your forge supports. This is the join key for
every comparison worth making later, and it cannot be backfilled. Put it in this week.

**Make one repository legible.** The highest-traffic one, with a senior in the room. Context file,
committed tool configuration, path-scoped rules for the subsystems that genuinely differ.

**Extract two skills from people who actually do the work.** Ticket scoping and review assist. Ship
them to three to five engineers, manual invocation only, and start the outcome log from the first
run.

At the end of that you have a baseline nobody disputes, one repo an agent can work in, and two
skills in real use. It is not impressive and it is the entire foundation.

### What we are doing in six months

Skills in daily use across teams, with a private catalog and a maintainer, growing by contribution
rather than because one person is writing them all. The outcome log has enough scored rows that you
can say which skills work rather than which ones feel good.

The first workflows fire from triggers rather than from people: a review assist that runs on every
pull request, a documentation sync on merge to main. Same files, headless, no rewrite. This is the
moment the tooling decision from month one either pays off or bites, because if the tool cannot run
headless you are now writing everything twice.

And you can answer the question that matters: **is agent-authored change failure rate worse than
human-authored?** Six months of marked changes makes that computable. Nothing else you report will
land as hard.

### Where we are in a year

Two or three loops running unattended on genuinely verifiable work. Dependency upgrades with test
verification, security-finding remediation driven by your existing scanner, flaky test triage.
Human review before merge, always, but nobody is starting the work.

Skills composing rather than standing alone: triage feeds scoping, scoping feeds implementation,
implementation feeds review assist. Senior time visibly shifting toward specification and review,
which is a change worth writing into job design rather than letting it arrive as a surprise.

And past that, into the second year, orchestration: a small senior group directing agent work. It
arrives per domain and not organization-wide, because it will be ready in your best-documented
service long before it is ready in the one everybody is afraid of.

**What has to be true to get there**, stated plainly so it can be argued with: coverage and CI good
enough that machines adjudicate most changes, documentation dense enough that agents rarely need a
human to explain the system, and review capacity that scales, because human review stays mandatory
and is therefore the binding constraint. Organizations demonstrating this today built that substrate
over years, for humans, before agents existed. Starting now means doing both at once. That is
achievable. It is not faster.

The rest of this note is each stage in detail, in the order you build them.

## Stage zero: instrument, and make one repository legible

**Objective: know where you are, and give one repository enough written down that an agent can
work in it.**

### The instrumentation

Not a reporting pack. These are the numbers that tell you whether the floor is going in.

- **Change failure rate, split agent-authored against human-authored.** This is the whole ballgame,
  and it needs a disclosure marker on every agent change to be computable at all. A label, a branch
  prefix, a bot author, commit trailers, whatever your forge supports. Put it in before you need it,
  because it cannot be backfilled.
- **Review latency and time to first review.** The verification tax, measured directly, and the first
  thing that moves when you have overshot.
- **CI first-pass rate on agent changes**, which tells you whether output is arriving correct rather
  than arriving.
- **Median diff size.** Rising size makes review worse and inflates your throughput numbers at the
  same time, which is a nasty pairing.
- **Edit distance before merge on agent pull requests.** Merged as-is and merged after somebody
  rewrote half of it look identical in every standard metric and are completely different outcomes.
- **Duplication ratio and refactor ratio.** GitClear found duplicated blocks up 81% since 2023 while
  refactoring fell to 3.8% of changes. Unmonitored, that arrives in eighteen months as an unexplained
  slowdown.
- **Percentage of tickets classifiable green.** Your substrate, as a number that moves.

And one rule about all of them, which is not technical but decides whether the data is real:
individual-level metrics never feed a performance review. Roll up to team. Say it once in writing and
then honour it, because the moment people suspect otherwise you are measuring the gaming rather than
the work.

### Making a repository legible

A context file at the repo root, read automatically at the start of every session. Architecture,
conventions, the build and test commands, the deployment model. Roughly what you would explain to a
new senior in their first week.

Three things I got wrong here before I got them right.

**Long context files make it worse, not better.** I kept adding, because every session that went
sideways felt like a missing paragraph. Past somewhere around two hundred lines the thing degrades:
the model has more to hold and the important rules stop standing out. The fix that actually worked
was moving specifics into path-scoped rules that only load when a session touches that subsystem,
and keeping the root file to what is true everywhere.

**Write it for the machine, not for a human who might also read it.** These are different documents.
A human reader wants the why and the history. An agent wants the invariants, the commands, and the
things that will look reasonable and be wrong. I have started giving the components an agent
actually operates a second doc written only for the machine: how to drive the thing, not how a
person reads about it.

**Environment parity is the boring one that decides everything.** Commit the tool configuration.
Settings, plugin enablement, whatever your harness reads. A fresh CI container and a new engineer's
laptop should inherit the same setup, because the moment the agent's environment differs from the
human's you are debugging two systems. This is free if you do it at the start and miserable to
retrofit.

The measurable version of legibility, and the one I would put on a dashboard: **what percentage of
your repositories could a new senior work in on day one from what is written down?** That is the
same question as whether an agent can, and it is the amber list that funds the documentation work.

**Done when** the baseline is published and nobody disputes it, every agent-authored change is
marked in a way you can query, and one repository is legible enough that a new senior could work in
it from what is written down.

## Stage one: extract the skills

**Objective: turn what your seniors know into files, in the order that builds supervision before it
builds output.**

### Writing skills that survive contact

A skill is a senior engineer's judgement written down once, applied consistently, and improved by
pull request. Folder of instructions, versioned, reviewable. That is the entire idea and it is the
only part of any of this that compounds.

**Write them by extraction, not invention.** Watch a senior do the task. Write down what they
actually did. Have them correct it. Ship it. Then iterate on real usage. A skill written by somebody
who does not do the work will be wrong in ways nobody catches until it has been applied fifty times,
and I say that as somebody who has written the confident wrong version.

**Structure them as a few plugins rather than a sprawl.** A required core carrying house standards,
the review checklist, security rules and the enforcement hooks. A default-on workflow set for ticket
scoping, pull request authoring, review and release notes. Domain plugins, opt-in per team. A private
catalog with a manifest, so a repository gets its set by declaring it rather than by somebody
remembering.

**Give it a maintainer and a changelog or it dies.** A marketplace nobody owns is an abandoned folder
within two quarters. I know what that folder looks like. I have one.

### Which skills, and in what order

This is the part I would argue hardest for, because the obvious order is wrong.

Everybody builds the coder first. It is the exciting one, it demos well, and it is the reason the
budget got approved. It is also the one you are least equipped to supervise on day one, which is how
you end up with the Faros numbers: plenty of output, no capacity to check it.

**Build the four skills that supervise work before the one that produces work.**

<div class="live-fig" data-live-figure="buildorder" data-surface="figure:buildorder">
<p><em>Five skills in build order. Plan turns a ticket into a testable spec. Code review checks a diff
against house standards. Docs catch drift on merge. QA writes tests to house convention. The coder
comes last, and only once the four above can catch it being wrong.</em></p>
<p class="live-fig__note">Tick the ones you would pass today. It will tell you which kind of AI work you can currently defend, and which gate is in the way.</p>
</div>
<p class="live-fig__note">Flip it. Twelve changes either way, the same coder both times. What changes is how many of them a person has to catch by reading.</p>

*The first four are the supervision. The fifth is the thing being supervised.*

| Skill | What it does | Why it lands here |
|---|---|---|
| **Plan** | Turns a raw ticket into acceptance criteria, affected components, a test plan and risk notes | First, because everything downstream needs a well-formed input, and it improves human work on day one whether or not an agent ever touches it |
| **Code review** | Reviews a diff against house standards and the repository's context. Comments, never blocks | Attacks the review tax directly, which is where Faros says the bill lands. It also writes down the taste the coder will later be judged against |
| **Docs** | Detects drift between code and docs on merge, proposes the update | Legibility is what an agent needs to work at all, and this is the only version of documentation that cannot go stale silently |
| **QA** | Generates tests to house convention, on the paths a change touches | Verifiability. This is the machine that decides whether the coder was right, so it has to exist before the coder does |
| **Coder** | Implements a bounded change end to end | Last. It is only defensible once the four above can catch it being wrong, and until then every line it writes lands on a human |

Anthropic's engineering team arrived at the same shape from the other direction. Building a harness
for long-running agents, they split it into a planner, a generator and an evaluator, and the reason
they give for the third one is blunt: asked to grade their own output, agents "tend to respond by
confidently praising the work, even when, to a human observer, the quality is obviously mediocre."
The evaluator exists because the generator cannot be trusted to mark its own homework. That is the
same claim as this table, arrived at by people optimising a single harness rather than an
organization.

Read the right-hand column downwards and the argument is one sentence: **each of the first four
builds a piece of the supervision the fifth one needs.** Plan gives it a spec worth implementing.
Review gives it a standard. Docs give it a codebase it can read. QA gives it a verdict that is not a
person's opinion.

Get those four polished enough that you would defend their output in a code review, and the coder
becomes an ordinary engineering problem. Build the coder first and you have bought yourself a very
fast way to generate work nobody has time to check.

Two more worth having once those five are in place, and both are high-confidence automation
candidates rather than daily-use skills: **codebase orientation**, whose value scales with how bad
your docs currently are, and **mechanical migrations**, which is the single most automatable thing
in any codebase.

**Done when** the first two skills are in real use by a pilot group, extracted from people who do
the work rather than written for them, and the outcome log has rows in it from the first run
onwards.

## Stage two: get them used, and score what happens

**Objective: find out which skills actually work, with numbers rather than impressions.**

A skill nobody runs is a document, and a skill nobody scored cannot be promoted. This is where most
of these programmes quietly stop, because it is the stage with no artifact to show.

Log every run: what it was invoked on, what it produced, and whether the outcome held. Score a
sample by hand. It is tedious and there is no way around it, because the whole promotion mechanism
downstream is built on a count of scored runs, and "it seems to be working well" is not a threshold.

Two things I would fix early, both learned the hard way. **Decide the required count per stage in
advance**, sized to blast radius: a documentation skill can graduate on a handful, a skill that
opens pull requests against production code should not. And **keep the log where it survives a
rebuild**, because the early runs are the ones you cannot reconstruct and they are the ones that
tell you whether a skill got better or you just got used to it.

Adoption is political as much as it is technical here. Do not mandate usage. A skill that has to be
required is a skill that is not good enough yet, and mandating it costs you the signal that would
have told you so.

**Done when** each skill has its agreed count of scored runs behind it, the catalog has a
maintainer and grows by contribution, and you can name which skills are working rather than which
ones feel good.

## Stage three: the same skills, fired by triggers

**Objective: take the human out of the trigger, and nothing else.**

**This stage should be a flag, not a rewrite.** The skill a developer runs today runs headless in CI
tomorrow, and if your tooling does not support that you will discover it here, at the worst possible
moment, having written everything twice. It is the single property I would optimise the tooling
decision for, because it is what makes every skill written in stage one a candidate automation here
at nearly no marginal cost.

Two rules before anything gets a trigger. **Never automate a stage the skill has not actually
completed**, which sounds too obvious to write down and is the most common violation I have seen,
because a well-written skill reads as though it works. And **start with the trigger a human still
initiates**: a comment, a label, a ticket transition. Firing on an event with nobody in the loop is
the stage after this one, not this one.

### Hooks beat instructions, and that is the whole game

This is the distinction I would put first if I could only teach one thing.

An instruction in a context file is a request. A lifecycle hook is enforcement. They feel similar
when you write them and they are not remotely the same object, and the gap between them is where
most of these systems quietly fail.

I have proved this on myself more than once. My own standards require a git worktree per run. I
wrote that rule twice, in two places, published it, linked it from every repository. Then I checked,
and I had never once used a worktree. The rule was perfect. Nothing enforced it, so nothing happened.
A standard that is written, published, and never executed looks exactly like a standard that works,
which is the most dangerous property a rule can have.

<div class="live-fig" data-live-figure="rulegate" data-surface="figure:rulegate">
<p><em>Ten sessions against one written rule. Six honoured it and four did not, and nothing said so.
Under a hook the same four never land the write at all.</em></p>
</div>
<p class="live-fig__note">Flip it. The four that ignore an instruction look identical to the six that follow it, right up until something measures them.</p>

So: **anything whose violation would be an incident belongs in a hook, not a paragraph.** Protected
paths, secret scanning, the disclosure marker, the commit conventions. Everything else can be an
instruction and it is fine if it is followed most of the time.

The corollary matters too. A hook that exits at the wrong point in the lifecycle reaches nobody. I
spent real time on a check that fired after the tool had already produced its output, which meant it
could report but could not prevent, and the session sailed past it. Know which of your hooks can
block, which can only inform, and which are shouting into a transcript that only a human will read
tomorrow.

### Score the ticket on structure, not on vibes

Before an agent takes a task unattended, something has to decide whether it should. The obvious
implementation is to ask the model. Do not do that.

**Models are badly calibrated about their own capability and will say yes.** I have watched this
repeatedly, and it is not a prompting problem you can fix with a better sentence. It is the same
failure Anthropic hit when they let an agent grade its own work: confident praise for mediocre
output. If self-assessment does not work after the fact, it will not work beforehand either. Ask instead whether
the substrate is there, which is a question about your repository and mostly computable without a
model at all.

The signals I would score:

- How many files the change is likely to touch, from the ticket's linked components
- Test coverage on those specific paths
- Whether a context file covers that subsystem
- Whether the acceptance criteria are testable as written
- How similar past tickets went, from your own outcome log

Green means the substrate for doing it safely is measurably present. Amber means it is not, which is
a fact about your documentation rather than a guess about difficulty. That distinction is the whole
trick: a ticket is amber **because the coverage is missing**, so the amber list is a work order
rather than an opinion.

**Red has to be deterministic.** Path globs plus a blocking hook, the way code ownership rules work.
Auth, payments, migrations, secrets, deploy config, anything touching personal data. A model asked
whether it should refuse will sometimes say no. A hook that blocks writes to those paths never will.

And the number that falls out of this is the best progress metric in the whole system: **the
percentage of tickets classifiable green, tracked over time.** It beats any published benchmark
because it is measured against your codebase, and it moves when you do the documentation work.

**Done when** review assist runs on every pull request without anybody starting it, protected paths
are blocked by a hook rather than by a paragraph, and agent-authored change failure rate is
computable against human-authored.

## Stage four: the loop

**Objective: two or three loops running unattended on work a machine can verify.**

**Before anything runs unattended, four things have to be true.** All four are things you build.

<div class="live-fig" data-live-figure="gates" data-surface="figure:gates">
<p><em>Four gates in sequence. Visibility, meaning you can say what is happening today.
Verifiability, meaning a machine can decide whether a change is correct. Legibility, meaning an
agent can read the codebase without a human explaining it. Containment, meaning you know what
breaks if it is wrong and have tested that. Assisted development needs the first and third.
Anything unattended needs all four.</em></p>
</div>
<p class="live-fig__note">Tick the ones you would pass today. It will tell you which kind of AI work you can currently defend, and which gate is standing in the way.</p>

I like this framing because it turns "we're not ready" into a list somebody owns. Nobody argues with
"our CI is too flaky for a machine to adjudicate a change." That is a number.

Visibility is the cheap one and it is mostly a join key, which I will come back to. Verifiability is
your existing CI problem wearing a new hat. The two that are genuinely new work are legibility and
containment, so that is where the rest of this goes.

### Which nodes are allowed to cost tokens

<div class="live-fig" data-live-figure="agentloop" data-surface="figure:agentloop">
<p><em>A trigger fires, a disposable sandbox is provisioned, a model implements the change, then
plain code lints and tests it. On a failure a model gets a capped number of attempts and returns to
the tests. On success a pull request is opened and a human reviews it, which is never skipped. Only
the implement and fix nodes call a model.</em></p>
</div>
<p class="live-fig__note">Run it. The change fails its tests once, gets one attempt at a fix, and lands on a person either way. Watch which counter moves.</p>

*Two boxes cost model tokens. Everything else is plain code that runs identically every time.*

That split is the design decision worth stealing from Stripe's minions, and it is available to a
one-person project on day one. Git operations, linting, formatting, running the tests, filling in the
pull request template: all plain code that executes the same way forever. Only the judgement-bearing
steps call a model. It buys reliability and cuts cost in the same move, which is a combination you
almost never get. Addy Osmani calls the general shape loop engineering: you stop being the person who
prompts the agent and design the system that does it instead.

Four things around it that are not negotiable, and three of them I learned by not having them:

**A hard retry cap.** Code, CI, one attempt to fix, one more push, then a human takes it. Without
this you get a loop that spends real money rediscovering that it cannot solve the problem.

**A disposable sandbox with real permissions inside it.** Cut off from production and the internet,
and then stop asking for confirmation on every action. Contain at the environment boundary, not the
action boundary. Approval-prompt safety is neither safe nor fast, and worse, it trains people to
click yes without reading, which is the exact reflex you were trying to prevent.

**Scoped, short-lived credentials.** Never a personal token in a shared CI variable. That is fragile
by design and it raises a question that belongs to whoever owns your agreements rather than to the
engineer who just wanted the pipeline green.

**A kill switch that stops every loop, tested before you need it.** Untested rollback is a plan, not
a control.

### Push work left before you shop for a cheaper model

When one of these gets expensive the instinct is to swap the whole thing onto a cheaper or
self-hosted model. That is the wrong unit of decision.

In the systems I have actually measured, the overwhelming majority of the bill sits in parallel
agent fan-out, the several independent analysis passes over one change, while the instruction text
is a rounding error. Swapping the model changes your price per token. It does not touch the fan-out,
and it puts at risk the precision that justified building the thing.

The order that works: establish a quality baseline first, because a cost change made before you can
measure quality is a change you cannot evaluate. Then push work down into deterministic nodes, since
every candidate a plain script can produce or eliminate before fan-out is fan-out you never pay for,
and that costs no accuracy at all. Only then select per node: a cheap or local model for the
high-volume low-judgement steps, the strongest one on the analysis passes, and no model at all
wherever a path rule or a coverage check will do.

Design the loop so the model is a swappable component behind a stable interface, and revisit with
real spend data rather than with an estimate.

**Done when** at least two loops have run unattended for a month, agent-authored change failure
rate is no worse than human-authored, and review latency has not degraded. If any of those three is
false, the answer is fewer loops rather than more.

## Six ways these systems fail without telling you

I have built a few of these end to end, some at work and some for myself. I am keeping the specifics
vague, because what is implemented where I work is not mine to publish and the outcomes are not the
interesting part anyway. The failure modes are. I have hit all six.

**1. Checks that fail by going quiet.** A broken check and a clean input produce identical output:
silence. I have shipped several of these. A column index that was off by one. A pipeline signal that
never arrived. A regex that never matched anything. Every one was invisible until something measured
it, and this is the most dangerous mode on the list because the system reports success the entire
time.

> Every automated check has to distinguish "I ran and found nothing" from "I did not run." Make each
> run emit what executed and what was skipped. A silent pass is not a pass.

**2. Architecture built on an unverified capability.** I once designed something with a layered
credential system, multiple fallback paths, each layer documented and several individually verified.
It was elegant. It has never completed a single run, because the whole structure rested on one
capability nobody probed and that capability does not exist. Every layer above it is correct and
useless.

The lesson is not "be careful." I was careful. Several other assumptions in that same system were
verified end to end, and being rigorous everywhere else bought me exactly nothing. Verify the leaf
before you build the tree.

**3. Reporting a measurement as the thing measured.** "Zero results found" quietly becoming "there is
nothing there." Every number accurate, every sentence built on them false.

**4. Rules that are quietly impossible.** Asking an agent to verify something the environment cannot
actually do. It will produce output that reads as verified, because it has no way to tell you it
could not. Ask for what is possible and have it state what is left over.

**5. A capability documented into existence.** A flag appears in the usage text. Nothing implements
it. Nothing errors. Now there is prose describing something the system cannot do, and it will be
believed for months.

**6. Documentation drifting from the thing it describes.** Accurate when written, silently not
anymore. Most damaging in the file you tell everyone to read first, which is of course the file
nobody re-reads.

The generalization under several of those: after any schema, format or external change, grep for
every reader. Including the prose readers, not just the code.

And the one principle I would put on the wall: **deterministic tools extract the structure, prose
comes after.** Documentation describing how a system is built should be generated by tools that read
the code and the commit history, with prose labelling and explaining what the tools found, never
deciding what is true. A structural claim the tools missed and the prose covered for is a bug nobody
can find, because the document reads as though it was checked.

And one more, which costs nothing on day one and is expensive on day four hundred: **build the
generic thing, and treat your version as a configuration of it.** Any internal tool that might one
day be published, open-sourced, or reused by another business unit separates engine from
configuration as a directory boundary from the first commit. Not as a refactor later. The boundary
is also the thing that stops a company name, a ticket key or a path from a private codebase leaking
into the half you eventually want to share.

## Your scaffolding has an expiry date

One honest limit, and it is the sharpest thing in Anthropic's harness write-ups: **"every component
in a harness encodes an assumption about what the model can't do on its own, and those assumptions
are worth stress testing."**

They demonstrated it on themselves. An earlier version of their harness broke work into sprints with
a full context reset between each one, because models lost coherence and wrapped up early as the
window filled. A model generation later, that entire mechanism was removed: the same work ran as one
continuous session. The scaffolding was real, it was load-bearing, and then it was dead weight.

Everything in this note is scaffolding of that kind. The triage classifier exists because models
overstate their own capability. The retry cap exists because a loop cannot tell when it is stuck.
The evaluator skills exist because generators praise their own work. Each of those is a bet about a
current limitation, and some of those bets will expire.

So schedule the stress test. Once a model generation, take one component out and see whether the
outcome degrades. Keep what still earns its place and delete what does not, because a harness nobody
re-examines becomes a tax you pay forever for a problem that went away.

**What does not expire** is the other half. Verification, legible documentation, containment and the
marker on every agent-authored change are not compensations for a weak model. They are how you find
out what happened, and a better model makes them more valuable rather than less. Anthropic put the
same point the optimistic way round: the better the models get, the more room there is for harnesses
that reach past what the model does alone.

## Where to start, concretely

If you read one section and close the tab, make it this one. Five things, in order, none of which
needs a budget line or anybody's permission.

**1. Mark every agent-authored change. Today.** A label, a branch prefix, a dedicated bot author,
commit trailers, whatever your forge supports. This takes an afternoon and it is the only item here
that cannot be done later, because it cannot be backfilled: every comparison worth making for the
next two years is a join against this marker. *Done when* you can run one query that returns
agent-authored changes and human-authored changes separately.

**2. Pull ninety days of delivery history and publish it.** Deployment frequency, lead time, change
failure rate, review latency, revert rate. Not to prove anything yet, just to have a number that
predates the programme. *Done when* it is written down somewhere the team can see and nobody
disputes it.

**3. Make your highest-traffic repository legible.** One context file, written with a senior in the
room, under two hundred lines. Architecture, conventions, build and test commands, deployment model.
Commit the tool configuration next to it so a fresh container inherits the same setup. *Done when* a
new senior could work in it from what is written down, which is the same test as whether an agent
can.

**4. Extract two skills from people who actually do the work.** Ticket scoping and review assist.
Watch a senior do the task, write down what they did, have them correct it. Manual invocation only,
no triggers. *Done when* three to five engineers are running them by choice rather than because you
asked.

**5. Start the outcome log on the first run.** What it was invoked on, what it produced, whether the
outcome held. Score a sample by hand. It is tedious and there is no way around it. *Done when* you
have enough scored rows to say which skill works rather than which one feels good.

That is roughly the first two months, and it is entirely unglamorous. Notice what is not on the
list: buying anything, choosing a model, or writing a policy document. Those come after, and they
are easier decisions once the first five are behind you.

**If you can only do one thing this week, do the marker.** Everything else on this list can be
started in month three and still work. That one gets harder every day you wait, and its absence is
what makes the whole programme unprovable.

## What I would want to build

I have spent the last few months working this way as my primary mode rather than as an experiment
alongside the real job, and the honest summary is that the interesting problems all turned out to be
in the plumbing rather than the prompting.

Let me be accurate about the shape of that. I do not have a formal background in AI or machine
learning. I have not shipped a model, run an ML platform, or done research in the field, and if what
you need is somebody to train something then I am the wrong person and no amount of this note
changes that. What I am is a development manager and technical lead who has built the loop, wired
the hooks, written the skills, hit all six of those failure modes, and gone back to find out why.

What I would want is to own this problem end to end somewhere it matters. Run the baseline. Make the
standards real, which means enforced rather than published. Extract the skills out of the seniors
before they leave. Build the loops on the boring tasks first. Report the numbers honestly, including
the ones that went the wrong way, because a report that only ever improves stops being read.

And I would ask for one thing up front, which is time to build the floor before anybody expects the
agent. That is a quarter of unglamorous work. It is also the only version of this I have seen hold
up, including on myself, where the rule I wrote and never ran looked exactly like a rule that worked
right up until I checked.

Everybody wants the agent. I would rather be the one who builds the floor.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*

---

### Sources

- [DORA, State of AI-assisted Software Development 2025](https://dora.dev/dora-report-2025/)
- [Faros AI, The AI Engineering Report 2026: The Acceleration Whiplash](https://www.faros.ai/research/ai-acceleration-whiplash) and its [ten takeaways](https://www.faros.ai/blog/ai-acceleration-whiplash-takeaways)
- [METR, Impact of AI on experienced developer productivity](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [Veracode, 2026 GenAI Code Security Report](https://www.veracode.com/blog/2026-genai-code-security-report-ai-risk)
- [GitClear, The AI Code Quality and Maintainability Gap](https://www.gitclear.com/the_ai_code_quality_maintainability_gap)
- [Stripe, Minions: one-shot end-to-end coding agents](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [Anthropic, Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) and [Harness design for long-running apps](https://www.anthropic.com/engineering/harness-design-long-running-apps), on planner/generator/evaluator separation, structured handoffs, and why a harness component is a bet with an expiry date
- [Addy Osmani, Loop Engineering](https://addyosmani.com/blog/loop-engineering/)
- My own version of this loop, smaller and more honest about its limits: [I Was Shipping Faster Than I Could Understand It](one-loop-every-repo.md)
