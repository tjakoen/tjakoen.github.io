# Build the Floor, part two: from scored runs to the loop

Status: DRAFT script for Tjakoen to read aloud and edit. Cut into beats from the earlier narration; not yet read or checked by him.

How this script works. The note stays open on the page while the recording plays. Each beat is a short spoken line about one idea, and it names the phrase in the note that lights up while it plays. The wording is the earlier narration, cut to the lines that carry the idea. Format of a beat: a highlight line (section id, then a quote that must appear in that section of the note, or figure: and a figure name), then the spoken words.

## Stop 1: Score it, then take the human out of the trigger

**Beat 1**
highlight: stage-two-get-them-used-and-score-what-happens | A skill nobody runs is a document

Stage two has one objective. Find out which skills actually work, with numbers rather than impressions. A skill nobody runs is a document, and a skill nobody scored can't be promoted. So log every run. What it was invoked on, what it produced, and whether the outcome held. Then score a sample by hand. It's tedious and there's no way around it, because the whole promotion mechanism downstream is built on a count of scored runs. And "it seems to be working well" is not a threshold.

**Beat 2**
highlight: stage-two-get-them-used-and-score-what-happens | a skill that is not good enough yet

Decide the required count in advance, sized to blast radius. Release notes can graduate on a handful of scored runs, because a wrong one is embarrassing. Review comments need more, because a wrong one wastes an engineer an hour. A skill that opens pull requests against production needs far more again, because a wrong one is an incident. Adoption is political here as much as technical. Don't mandate usage. A skill that has to be required is a skill that is not good enough yet, and mandating it costs you the signal that would have told you so.

**Beat 3**
highlight: stage-three-the-same-skills-fired-by-triggers | A lifecycle hook is enforcement

Stage three takes the human out of the trigger, and nothing else. It should be a flag, not a rewrite. The skill a developer runs today runs headless in CI tomorrow. If your tooling can't do that, this is where you find out, at the worst possible moment, having written everything twice. Never automate a stage the skill hasn't actually completed. It sounds too obvious to say, and it's the most common violation I've seen, because a well-written skill reads as though it works. If I could only teach one thing, it'd be this. An instruction in a context file is a request. A lifecycle hook is enforcement. They feel similar when you write them, and they are not the same object at all.

**Beat 4**
highlight: stage-three-the-same-skills-fired-by-triggers | never once used a worktree. The rule

My own standards require a git worktree per run. I wrote that rule twice, in two places, published it, and linked it from every repository. Then I checked, and I had never once used a worktree. The rule was perfect. Nothing enforced it, so nothing happened. So anything whose violation would be an incident belongs in a hook, not a paragraph. Don't ask the model. Models are badly calibrated about their own capability, and they'll say yes. Ask whether the substrate is there instead. Green means the substrate is there. Amber means it isn't, so the amber list is a work order, not an opinion.

**Digest:** Log every run, score a sample by hand, and set the promotion bar by what a wrong run costs. Don't mandate usage, because a mandate hides whether a skill is wanted. Then fire the same skill from a trigger, enforce anything serious with a hook, and judge tickets on the substrate rather than the model's opinion.

**Trial:** Pick one rule your team has written down, and check whether anything actually enforces it or whether it only asks.

**Runes:**
stage-two-get-them-used-and-score-what-happens | A skill nobody runs is a document
stage-two-get-them-used-and-score-what-happens | a skill that is not good enough yet
stage-three-the-same-skills-fired-by-triggers | A lifecycle hook is enforcement

## Stop 2: The loop, and which parts are allowed to cost tokens

**Beat 1**
highlight: stage-four-the-loop | work are legibility and containment

Before anything runs unattended, four things have to be true, and all four are things you build. Visibility, meaning you can say what is happening today. Verifiability, meaning a machine can decide whether a change is correct. Legibility, meaning an agent can read the codebase without a human explaining it. And containment, meaning you know what breaks if it's wrong, and you've tested that. Assisted development needs the first and the third. Anything unattended needs all four. I like that framing because it turns "we're not ready" into a list somebody owns.

**Beat 2**
highlight: stage-four-the-loop | Two boxes cost model tokens.

A trigger fires. A disposable sandbox is provisioned. A model implements the change. Then plain code lints and tests it. If it fails, a model gets a capped number of attempts and goes back to the tests. If it passes, a pull request opens and a human reviews it, and that review is never skipped. Two boxes cost model tokens. Everything else is plain code that runs the same way every time. That split is the design decision worth stealing from Stripe's minions, and a one-person project can have it on day one. Only the steps that need judgement call a model. It buys reliability and cuts cost in the same move, which is a combination you almost never get.

**Beat 3**
highlight: stage-four-the-loop | A kill switch that stops every loop, tested before you need it

A hard retry cap. Code, CI, one attempt to fix, one more push, and then a human takes it. Without that, you get a loop that spends real money rediscovering that it can't solve the problem. A disposable sandbox with real permissions inside it. Cut off from production and the internet, and then stop asking for confirmation on every action. Contain at the environment boundary, not the action boundary. And a kill switch that stops every loop, tested before you need it. Untested rollback is a plan, not a control.

**Beat 4**
highlight: stage-four-the-loop | That is the wrong unit of decision

When one of these gets expensive, the instinct is to swap the whole thing onto a cheaper model. That's the wrong unit of decision. In the systems I've actually measured, most of the bill sits in parallel fan-out, the several independent analysis passes over one change, while the instruction text is a rounding error. Swapping the model changes your price per token. It doesn't touch the fan-out, and it risks the precision that justified building the thing. Get a quality baseline first, because a cost change you can't measure is a change you can't evaluate. Then push work into plain code, because every candidate a script can rule out before the fan-out is fan-out you never pay for.

**Digest:** Nothing runs unattended without visibility, verifiability, legibility and containment. In the loop only the implement and fix steps call a model, and everything else is plain code. Cap retries, sandbox it, scope the credentials, test the kill switch, and push work into plain code before shopping for a cheaper model.

**Trial:** Take one workflow you would like to automate and mark each step as needing judgement or not, then count how many really need a model.

**Runes:**
stage-four-the-loop | Two boxes cost model tokens.
stage-four-the-loop | A kill switch that stops every loop, tested before you need it
stage-four-the-loop | That is the wrong unit of decision

## Stop 3: Six ways it fails quietly

**Beat 1**
highlight: six-ways-these-systems-fail-without-telling-you | A silent pass is not a pass

The failure modes are. I have hit all six. And the uncomfortable thing about all six is that every one of them produces a report that reads like a pass. Checks that fail by going quiet. A broken check and a clean input produce exactly the same output, which is silence. This is the most dangerous mode on the list, because the system reports success the whole time. So every automated check has to tell "I ran and found nothing" apart from "I did not run." Make each run say what executed and what was skipped. A silent pass is not a pass.

**Beat 2**
highlight: six-ways-these-systems-fail-without-telling-you | I was careful.

Architecture built on a capability nobody checked. I once designed something with a layered credential system, multiple fallback paths, each layer documented and several of them individually verified. It was elegant. It has never completed a single run, because the whole structure rested on one capability nobody probed, and that capability doesn't exist. Every layer above it is correct and useless. And the lesson isn't "be careful." I was careful. Other assumptions in that same system were verified end to end, and being rigorous everywhere else bought me exactly nothing. Verify the leaf before you build the tree.

**Beat 3**
highlight: six-ways-these-systems-fail-without-telling-you | Every number accurate, every sentence built on them false

Three. Reporting a measurement as the thing measured. "Zero results found" quietly turns into "there is nothing there." Every number accurate, every sentence built on them false. Four. Rules that are quietly impossible. You ask an agent to verify something its environment can't actually do. It produces output that reads as verified, because it has no way to tell you it couldn't. So ask for what's possible, and have it state what's left over. Five. A capability documented into existence. A flag shows up in the usage text. Six. Documentation drifting from the thing it describes. Accurate when written, and silently not anymore.

**Beat 4**
highlight: six-ways-these-systems-fail-without-telling-you | tools extract the structure, prose comes

Deterministic tools extract the structure, and prose comes after. Documentation about how a system is built should come from tools that read the code and the commit history, with prose explaining what the tools found, never deciding what is true. A structural claim the tools missed and the prose covered for is a bug nobody can find, because the document reads as though it was checked. Build the generic thing, and treat your own version as a configuration of it. If an internal tool might one day be shared or reused, separate the engine from the configuration as a directory boundary from the first commit.

**Digest:** Six failures that all look like a good week: silent checks, unverified foundations, measurements read as facts, impossible rules, documented features that do not exist, and drifting docs. Every check must report what ran and what was skipped. Let tools establish the structure and let prose explain it.

**Trial:** Pick one automated check you rely on and find out how you would know if it had stopped running.

**Runes:**
six-ways-these-systems-fail-without-telling-you | A silent pass is not a pass
six-ways-these-systems-fail-without-telling-you | Every number accurate, every sentence built on them false
six-ways-these-systems-fail-without-telling-you | I was careful.

## Stop 4: Scaffolding expires, the floor does not

**Beat 1**
highlight: your-scaffolding-has-an-expiry-date | The scaffolding was real, it was load-bearing

Every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions are worth stress testing. An earlier version of their harness broke work into sprints with a full context reset between each one, because models lost coherence and wrapped up early as the window filled. A model generation later, that whole mechanism was removed, and the same work ran as one continuous session. The scaffolding was real, it was load-bearing, and then it was dead weight. Each of those is a bet about a current limitation, and some of those bets will expire. So schedule the stress test. Once a model generation, take one component out and see whether the outcome degrades. Keep what still earns its place, and delete what doesn't.

**Beat 2**
highlight: your-scaffolding-has-an-expiry-date | Verification, legible documentation, containment and the marker

What doesn't expire is the other half. Verification, legible documentation, containment, and the marker on every agent change. Those aren't compensations for a weak model. They're how you find out what happened, and a better model makes them more valuable, not less. I now run the same loop on Claude, Codex and DeepSeek, and moving a task between them changes no instruction, because the standards are the contract and the model is a routing decision. For an organization, that's practical. Write the floor against the work, keep it out of any one vendor's harness, and a price change or an outage becomes a routing change.

**Beat 3**
highlight: where-to-start-concretely | If you can only do one thing this week, do the marker

First, mark every agent-authored change. Today. It takes an afternoon, and it's the only item that can't be done later, because every comparison worth making for the next two years is a join against that marker. Second, pull ninety days of delivery history and publish it. Third, make your highest-traffic repository legible. Fourth, extract two skills from the people who do the work, ticket scoping and review assist, run by hand only. Fifth, start the outcome log on the first run, and score a sample by hand. If you can only do one thing this week, do the marker.

**Beat 4**
highlight: what-i-would-want-to-build | I would rather be the one who builds the floor

The interesting problems all turned out to be in the plumbing, not the prompting. What I'd want is to own this end to end somewhere it matters. Run the baseline. And report the numbers honestly, including the ones that went the wrong way. And I'd ask for one thing up front, which is time to build the floor before anybody expects the agent. That's a quarter of unglamorous work. Everybody wants the agent. I would rather be the one who builds the floor.

**Digest:** Most scaffolding is a bet on a current model weakness, so remove one piece each model generation and see if anything breaks. Verification, legible docs, containment and the change marker do not expire. Start with five unglamorous steps, and if you only do one this week, mark every agent-authored change.

**Trial:** Write the exact label, branch prefix or trailer your team would use to mark agent-authored changes, and the one query that would list them.

**Runes:**
your-scaffolding-has-an-expiry-date | The scaffolding was real, it was load-bearing
where-to-start-concretely | If you can only do one thing this week, do the marker
what-i-would-want-to-build | I would rather be the one who builds the floor
