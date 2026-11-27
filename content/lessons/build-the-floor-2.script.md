# Build the Floor, part two: from scored runs to the loop

Status: DRAFT script for Tjakoen to read aloud and edit. Written from the note; not yet read or checked by him.

## Stop 1: Score it, then take the human out of the trigger

Part one left us with two skills in the hands of a pilot group, run by hand, with an outcome log that has rows in it from the first run. Now we find out whether they work.

Stage two has one objective. Find out which skills actually work, with numbers rather than impressions. A skill nobody runs is a document, and a skill nobody scored can't be promoted. This is where most of these programmes quietly stop, because it's the stage with no artifact to show.

So log every run. What it was invoked on, what it produced, and whether the outcome held. Then score a sample by hand. It's tedious and there's no way around it, because the whole promotion mechanism downstream is built on a count of scored runs. And "it seems to be working well" is not a threshold.

Two things I'd fix early, both learned the hard way. Decide the required count in advance, sized to blast radius. Release notes can graduate on a handful of scored runs, because a wrong one is embarrassing. Review comments need more, because a wrong one wastes an engineer an hour. A skill that opens pull requests against production needs far more again, because a wrong one is an incident. And keep the log where it survives a rebuild. The early runs are the ones you can't reconstruct, and they're the ones that tell you whether a skill got better or you just got used to it.

Adoption is political here as much as technical. Don't mandate usage. A skill that has to be required is a skill that is not good enough yet, and mandating it costs you the signal that would have told you so.

I've since watched the other half of that. I demoed a dashboard I'd built to my team and required nothing. Two weeks later the tech lead on my team had built an epic checker for his projects, and a junior on my team had built his own work board. Two people on one team is an anecdote, and I wouldn't size a programme on it. But it's the direction I expected, and a mandate would have told me nothing about whether either tool was wanted.

Stage two is done when each skill has its agreed count of scored runs, the catalog has a maintainer, and you can name which skills work rather than which ones feel good.

Stage three takes the human out of the trigger, and nothing else. It should be a flag, not a rewrite. The skill a developer runs today runs headless in CI tomorrow. If your tooling can't do that, this is where you find out, at the worst possible moment, having written everything twice.

Two rules before anything gets a trigger. Never automate a stage the skill hasn't actually completed. It sounds too obvious to say, and it's the most common violation I've seen, because a well-written skill reads as though it works. And start with a trigger a human still initiates, like a comment, a label or a ticket moving. Firing on an event with nobody in the loop is the next stage, not this one.

If I could only teach one thing, it'd be this. An instruction in a context file is a request. A lifecycle hook is enforcement. They feel similar when you write them, and they are not the same object at all.

I've proved that on myself. My own standards require a git worktree per run. I wrote that rule twice, in two places, published it, and linked it from every repository. Then I checked, and I had never once used a worktree. The rule was perfect. Nothing enforced it, so nothing happened. So anything whose violation would be an incident belongs in a hook, not a paragraph. Protected paths, secret scanning, the disclosure marker, the commit conventions. And know which of your hooks can block, and which can only report after the fact.

Last, before an agent takes a ticket unattended, something has to decide whether it should. Don't ask the model. Models are badly calibrated about their own capability, and they'll say yes. Ask whether the substrate is there instead. How many files the change touches, the test coverage on those paths, whether a context file covers that subsystem, whether the criteria are testable, and how similar tickets went before. Green means the substrate is there. Amber means it isn't, so the amber list is a work order, not an opinion. And red has to be deterministic, with path rules and a blocking hook on auth, payments, migrations, secrets and personal data.

Next, stage four, and the four things that must be true before anything runs unattended.

**Digest:** Log every run, score a sample by hand, and set the promotion bar by what a wrong run costs. Don't mandate usage, because a mandate hides whether a skill is wanted. Then fire the same skill from a trigger, enforce anything serious with a hook, and judge tickets on the substrate rather than the model's opinion.

**Trial:** Pick one rule your team has written down, and check whether anything actually enforces it or whether it only asks.

**Runes:**
stage-two-get-them-used-and-score-what-happens | A skill nobody runs is a document
stage-two-get-them-used-and-score-what-happens | a skill that is not good enough yet
stage-three-the-same-skills-fired-by-triggers | A lifecycle hook is enforcement

## Stop 2: The loop, and which parts are allowed to cost tokens

Stage four is the loop. The objective is two or three loops running unattended, on work a machine can verify.

Before anything runs unattended, four things have to be true, and all four are things you build. Visibility, meaning you can say what is happening today. Verifiability, meaning a machine can decide whether a change is correct. Legibility, meaning an agent can read the codebase without a human explaining it. And containment, meaning you know what breaks if it's wrong, and you've tested that. Assisted development needs the first and the third. Anything unattended needs all four.

I like that framing because it turns "we're not ready" into a list somebody owns. Nobody argues with "our CI is too flaky for a machine to adjudicate a change." That's a number.

Visibility is the cheap one, and it's mostly the join key from stage zero. Verifiability is your existing CI problem wearing a new hat. The two that are genuinely new work are legibility and containment.

Now the shape of the loop itself. A trigger fires. A disposable sandbox is provisioned. A model implements the change. Then plain code lints and tests it. If it fails, a model gets a capped number of attempts and goes back to the tests. If it passes, a pull request opens and a human reviews it, and that review is never skipped. Two boxes cost model tokens. Everything else is plain code that runs the same way every time.

That split is the design decision worth stealing from Stripe's minions, and a one-person project can have it on day one. Git operations, linting, formatting, running the tests, filling in the pull request template. All of that is plain code. Only the steps that need judgement call a model. It buys reliability and cuts cost in the same move, which is a combination you almost never get. Addy Osmani calls the general shape loop engineering. You stop being the person who prompts the agent, and you design the system that does it instead.

Four things around it aren't negotiable, and I learned three of them by not having them.

A hard retry cap. Code, CI, one attempt to fix, one more push, and then a human takes it. Without that, you get a loop that spends real money rediscovering that it can't solve the problem.

A disposable sandbox with real permissions inside it. Cut off from production and the internet, and then stop asking for confirmation on every action. Contain at the environment boundary, not the action boundary. Approval prompts are neither safe nor fast, and worse, they train people to click yes without reading, which is the exact reflex you were trying to prevent.

Scoped, short-lived credentials. Never a personal token in a shared CI variable.

And a kill switch that stops every loop, tested before you need it. Untested rollback is a plan, not a control.

One more thing about stage four, because it's where the bill shows up. When one of these gets expensive, the instinct is to swap the whole thing onto a cheaper model. That's the wrong unit of decision. In the systems I've actually measured, most of the bill sits in parallel fan-out, the several independent analysis passes over one change, while the instruction text is a rounding error. Swapping the model changes your price per token. It doesn't touch the fan-out, and it risks the precision that justified building the thing.

So the order is this. Get a quality baseline first, because a cost change you can't measure is a change you can't evaluate. Then push work into plain code, because every candidate a script can rule out before the fan-out is fan-out you never pay for. Only then pick per step, a cheap model for the high-volume steps, the strongest one on the analysis passes, and no model at all wherever a path rule will do.

Stage four is done when at least two loops have run unattended for a month, agent change failure rate is no worse than human, and review latency hasn't degraded. If any of those three is false, the answer is fewer loops, not more.

Next, the six ways these systems fail without telling you. I've hit all six.

**Digest:** Nothing runs unattended without visibility, verifiability, legibility and containment. In the loop only the implement and fix steps call a model, and everything else is plain code. Cap retries, sandbox it, scope the credentials, test the kill switch, and push work into plain code before shopping for a cheaper model.

**Trial:** Take one workflow you would like to automate and mark each step as needing judgement or not, then count how many really need a model.

**Runes:**
stage-four-the-loop | Two boxes cost model tokens.
stage-four-the-loop | A kill switch that stops every loop, tested before you need it
stage-four-the-loop | That is the wrong unit of decision

## Stop 3: Six ways it fails quietly

I've built a few of these end to end, some at work and some for myself. I'm keeping the specifics vague, because what's built where I work isn't mine to publish, and the outcomes aren't the interesting part anyway. The failure modes are. I have hit all six. And the uncomfortable thing about all six is that every one of them produces a report that reads like a pass.

One. Checks that fail by going quiet. A broken check and a clean input produce exactly the same output, which is silence. I've shipped several of these. A column index that was off by one. A pipeline signal that never arrived. A pattern that never matched anything. Every one was invisible until something measured it. This is the most dangerous mode on the list, because the system reports success the whole time.

So every automated check has to tell "I ran and found nothing" apart from "I did not run." Make each run say what executed and what was skipped. A silent pass is not a pass.

The most expensive one I've shipped has its own write-up, The Check Ran Once in 165 Sessions. The broken check was the cheap half. The costly half was the day I spent explaining its silence with a confident theory about discipline, when the answer was a relative path.

Two. Architecture built on a capability nobody checked. I once designed something with a layered credential system, multiple fallback paths, each layer documented and several of them individually verified. It was elegant. It has never completed a single run, because the whole structure rested on one capability nobody probed, and that capability doesn't exist. Every layer above it is correct and useless. And the lesson isn't "be careful." I was careful. Other assumptions in that same system were verified end to end, and being rigorous everywhere else bought me exactly nothing. Verify the leaf before you build the tree.

Three. Reporting a measurement as the thing measured. "Zero results found" quietly turns into "there is nothing there." Every number accurate, every sentence built on them false.

Four. Rules that are quietly impossible. You ask an agent to verify something its environment can't actually do. It produces output that reads as verified, because it has no way to tell you it couldn't. So ask for what's possible, and have it state what's left over.

Five. A capability documented into existence. A flag shows up in the usage text. Nothing implements it. Nothing errors. Now there's prose describing something the system can't do, and it will be believed for months.

Six. Documentation drifting from the thing it describes. Accurate when written, and silently not anymore. It does the most damage in the file you tell everyone to read first, which is of course the file nobody re-reads.

Under several of those sits one habit. After any schema, format or external change, search for every reader. That includes the prose readers, not just the code.

And the one principle I'd put on the wall. Deterministic tools extract the structure, and prose comes after. Documentation about how a system is built should come from tools that read the code and the commit history, with prose explaining what the tools found, never deciding what is true. A structural claim the tools missed and the prose covered for is a bug nobody can find, because the document reads as though it was checked.

One more that costs nothing on day one and a lot on day four hundred. Build the generic thing, and treat your own version as a configuration of it. If an internal tool might one day be shared or reused, separate the engine from the configuration as a directory boundary from the first commit. That boundary is also what stops a company name, a ticket key or a private path from leaking into the half you eventually want to share.

Next, the honest limit on everything I've told you so far, which is that most of it has an expiry date.

**Digest:** Six failures that all look like a good week: silent checks, unverified foundations, measurements read as facts, impossible rules, documented features that do not exist, and drifting docs. Every check must report what ran and what was skipped. Let tools establish the structure and let prose explain it.

**Trial:** Pick one automated check you rely on and find out how you would know if it had stopped running.

**Runes:**
six-ways-these-systems-fail-without-telling-you | A silent pass is not a pass
six-ways-these-systems-fail-without-telling-you | Every number accurate, every sentence built on them false
six-ways-these-systems-fail-without-telling-you | I was careful.

## Stop 4: Scaffolding expires, the floor does not

Here's the honest limit on everything in the last two lessons, and it's the sharpest line in Anthropic's harness write-ups. Every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions are worth stress testing.

They showed it on themselves. An earlier version of their harness broke work into sprints with a full context reset between each one, because models lost coherence and wrapped up early as the window filled. A model generation later, that whole mechanism was removed, and the same work ran as one continuous session. The scaffolding was real, it was load-bearing, and then it was dead weight.

Everything I've described is scaffolding of that kind. The ticket triage exists because models overstate their own capability. The retry cap exists because a loop can't tell when it's stuck. The evaluator skills exist because generators praise their own work. Each of those is a bet about a current limitation, and some of those bets will expire. So schedule the stress test. Once a model generation, take one component out and see whether the outcome degrades. Keep what still earns its place, and delete what doesn't.

What doesn't expire is the other half. Verification, legible documentation, containment, and the marker on every agent change. Those aren't compensations for a weak model. They're how you find out what happened, and a better model makes them more valuable, not less.

The model itself turned out to be on the list of things that expire. I now run the same loop on Claude, Codex and DeepSeek, and moving a task between them changes no instruction, because the standards are the contract and the model is a routing decision. For an organization, that's practical. Write the floor against the work, keep it out of any one vendor's harness, and a price change or an outage becomes a routing change.

So where do you start? If you keep one stop from these two lessons, keep this one. Five things, in order, and none of them needs a budget line or anybody's permission.

First, mark every agent-authored change. Today. It takes an afternoon, and it's the only item that can't be done later, because every comparison worth making for the next two years is a join against that marker. You're done when one query returns agent changes and human changes separately.

Second, pull ninety days of delivery history and publish it. Deployment frequency, lead time, change failure rate, review latency, revert rate. Not to prove anything yet, just to have a number from before the programme.

Third, make your highest-traffic repository legible. One context file, written with a senior in the room, under two hundred lines, with the tool configuration committed next to it.

Fourth, extract two skills from the people who do the work, ticket scoping and review assist, run by hand only. You're done when three to five engineers run them by choice, not because you asked.

Fifth, start the outcome log on the first run, and score a sample by hand.

That's roughly the first two months, and it's entirely unglamorous. Notice what isn't on the list. Buying anything, choosing a model, or writing a policy document. Four of those five wait perfectly well. The log gets a little costlier every month you delay, because the early runs can't be rebuilt. And the marker is a door closing behind you, because it can't be applied to work that's already merged. If you can only do one thing this week, do the marker.

Let me be accurate about who's telling you this. I don't have a formal background in AI or machine learning. I haven't shipped a model, run an ML platform, or done research in the field, and if you need somebody to train something, I'm the wrong person. I'm a development manager and technical lead who has built the loop, wired the hooks, written the skills, hit all six of those failure modes, and gone back to find out why. The interesting problems all turned out to be in the plumbing, not the prompting.

What I'd want is to own this end to end somewhere it matters. Run the baseline. Make the standards enforced rather than published. Get the skills out of the seniors before they leave. Build the loops on the boring tasks first. And report the numbers honestly, including the ones that went the wrong way.

And I'd ask for one thing up front, which is time to build the floor before anybody expects the agent. That's a quarter of unglamorous work. It's also the only version I've seen hold up, including on myself, where the rule I wrote and never ran looked exactly like a rule that worked, right up until I checked.

Everybody wants the agent. I would rather be the one who builds the floor.

**Digest:** Most scaffolding is a bet on a current model weakness, so remove one piece each model generation and see if anything breaks. Verification, legible docs, containment and the change marker do not expire. Start with five unglamorous steps, and if you only do one this week, mark every agent-authored change.

**Trial:** Write the exact label, branch prefix or trailer your team would use to mark agent-authored changes, and the one query that would list them.

**Runes:**
your-scaffolding-has-an-expiry-date | The scaffolding was real, it was load-bearing
where-to-start-concretely | If you can only do one thing this week, do the marker
what-i-would-want-to-build | I would rather be the one who builds the floor
