# Build the Floor, part one: the roadmap and the first two stages

Status: DRAFT script for Tjakoen to read aloud and edit. Cut into beats from the earlier narration; not yet read or checked by him.

How this script works. The note stays open on the page while the recording plays. Each beat is a short spoken line about one idea, and it names the phrase in the note that lights up while it plays. The wording is the earlier narration, cut to the lines that carry the idea. Format of a beat: a highlight line (section id, then a quote that must appear in that section of the note, or figure: and a figure name), then the spoken words.

## Stop 1: Everybody wants the agent

**Beat 1**
highlight: the-part-everybody-skips | making a codebase legible to a machine that has never met you

Everybody wants the agent that opens pull requests while they sleep. I want it too. It is genuinely the most interesting thing to happen to this job in my career. Almost nobody wants to build the thing underneath it. That part is unglamorous, it takes a quarter, and it mostly consists of making a codebase legible to a machine that has never met you. I've been building this across about a dozen repositories over the last few months, and I've gotten a useful amount of it wrong in public. This lesson is the shape that works, the parts that broke, and what I would do with an organization's worth of it.

**Beat 2**
highlight: the-floor-is-the-variable-and-it-is-measurable | generation capacity is elastic and review capacity

DORA said it plainly, across roughly five thousand technology professionals. AI amplifies whatever an organization already is. Strong engineering organizations get faster. Weak ones fail faster. Two years of telemetry, twenty-two thousand developers, four thousand teams, each team's lowest-adoption period against its highest. The gains are real. Epics per developer went up sixty-six percent, and task throughput went up thirty-four percent. The bill is bigger. Faros call it the Acceleration Whiplash, and the mechanism isn't mysterious. Generation capacity is elastic. Review capacity is not.

**Beat 3**
highlight: the-floor-is-the-variable-and-it-is-measurable | the thing that decides which side you land on the substrate gap

I call the thing that decides which side you land on the substrate gap. It's the distance between what your tools can do and what your codebase can absorb. Every technique in this lesson is a way of closing some of that gap. The good writing on this files that machinery under the word harness, and the definition I borrow is Anthropic's. A harness is the structured system you build around a model. The one that decides your outcome is the one you build.

**Beat 4**
highlight: the-floor-is-the-variable-and-it-is-measurable | which tells you not to instrument this with a survey

Veracode's 2026 report puts unguided AI-generated code at a fifty-six percent security pass rate, flat for two years, while syntactic correctness climbed past ninety-five percent. So the failure is not in the typing. And METR's controlled trial found experienced maintainers were nineteen percent slower with AI while believing they'd been twenty percent faster. So don't instrument any of this with a survey.

**Digest:** AI amplifies what an organization already is, and the Faros numbers show gains smaller than the costs. Generation scales and review does not. The substrate gap is the distance between what the tools can do and what the codebase can absorb.

**Trial:** Pick one repository you know and write two sentences, one on what an AI tool can already do there and one on what the codebase could not absorb.

**Runes:**
the-part-everybody-skips | making a codebase legible to a machine that has never met you
the-floor-is-the-variable-and-it-is-measurable | the thing that decides which side you land on the substrate gap
the-floor-is-the-variable-and-it-is-measurable | which tells you not to instrument this with a survey

## Stop 2: Five stages, one artifact

**Beat 1**
highlight: the-roadmap | stage zero and are hoping stage four

Here's the whole thing on one page. Eighteen months, from a room full of developers with subscriptions to an organization with real automation. Stage zero is instrumenting, and making one repository legible, months zero to two. Stage one is extracting skills and running them by hand, months one to five. Stage two is daily use with scored outcomes, months three to nine. Stage three is the same skills fired by triggers, months six to twelve. And stage four is chained, unattended loops, months ten to eighteen. Each stage opens on scored runs behind it, not on the date.

**Beat 2**
highlight: the-roadmap | a skill is written once and then promoted

Most organizations have bought stage zero and are hoping stage four arrives on its own. The spine of it is one idea. A skill is written once and then promoted. A developer runs it by hand. You log what happened. Once it has enough scored runs behind it, the same file gets fired by a trigger instead of a person. Once that holds at volume, it runs unattended. Then it chains into other skills, and you have a loop.

**Beat 3**
highlight: the-roadmap | Stage four remains a proposal.

The order of the stages is the argument, and I'll defend it. The month numbers are an estimate. I have not run this at organizational scale for eighteen months, and a roadmap that hides which half is measured isn't worth following. Since then one skill has walked the first three stages where I work. A pull request reviewer I ran by hand in August now fires on triggers, and every comment it posts gets scored by what happened next. That's one skill on one team. I haven't shown that it makes the codebase better, and I still have no chained, unattended engineering loop to show. Stage four remains a proposal.

**Beat 4**
highlight: the-roadmap | It is not impressive and it is the entire foundation

First, instrument, and that includes a disclosure marker. Every agent-authored change gets marked, with a label, a branch prefix, a bot author or a commit trailer, whatever your forge supports. That marker is the join key for every comparison worth making later, and it can't be backfilled. At the end of that you have a baseline nobody disputes, one repo an agent can work in, and two skills in real use. It is not impressive, and it is the entire foundation.

**Digest:** Five stages over about eighteen months, and the order matters more than the dates. A skill is written once and promoted from manual to triggered to unattended, so there is never a second system. Only one skill has walked the first three stages in my own work, and stage four is still a proposal.

**Trial:** Place your team on the five stages, then write the one thing you would need in place to honestly start the next one.

**Runes:**
the-roadmap | a skill is written once and then promoted
the-roadmap | It is not impressive and it is the entire foundation
the-roadmap | Stage four remains a proposal.

## Stop 3: What the floor actually is

**Beat 1**
highlight: the-floor-has-a-shape-and-it-is-worth-naming | epic walked twice, five stops

Picture one epic, walked twice, with the same model doing the typing both times. Without a layer, two of the steps are cut by hand up front, and two more come back as repairs after the code already exists. With a layer, those same two steps are cut by a skill, the gate runs before the pull request, and the only thing left for a person is one spot-check. Same epic, same model. The whole difference is in what was written down beforehand. All of it is files, committed and reviewed like code. Not one of those layers is a setting in somebody's editor.

**Beat 2**
highlight: the-floor-has-a-shape-and-it-is-worth-naming | The always-on file is a router, not an encyclopedia

The always-on file is a router, not an encyclopedia. Everything in it is paid for on every session in that repository forever. That's why two hundred lines is a ceiling, not a target. A skill is cheap to have and expensive to ignore. Its one line sits in context permanently and the body only loads when it runs. So a catalog of forty skills is affordable, and a context file of forty topics is not.

**Beat 3**
highlight: the-floor-has-a-shape-and-it-is-worth-naming | tracker, the spec pages and the forge

In my case it's a code graph rebuilt on every edit, so what calls this is one query instead of a search and a guess. In a large repository, that's the difference between an agent that navigates and one that reads twelve files hoping. Most teams stop at the repository boundary, and that's the mistake I made for the longest. The same catalog is worth more at the edges. At the spec document, an epic becomes tickets with acceptance criteria. Work arrives well-formed, instead of being repaired downstream by the most expensive people you have.

**Beat 4**
highlight: the-floor-has-a-shape-and-it-is-worth-naming | closed when the class is gone

Last, the edge that makes it compound. Every bug gets a root cause, and the root cause becomes a rule, a regression test, and a sweep for the same shape everywhere else. The bug isn't closed when the symptom goes away. It's closed when the class is gone. I do two thirds of that. I write the rule and add the test, and then I skip the sweep, which is exactly why the same shape keeps arriving with a different filename.

**Digest:** The floor is three layers of files: what the agent knows, what it can do, and what it can reach and what stops it. Keep the always-on file short, let skills load on demand, and keep a code graph. Every bug should come back as a rule, a test and a sweep.

**Trial:** Open the context file of a repository you use and count its lines, then mark anything in it that belongs in a path-scoped rule instead.

**Runes:**
the-floor-has-a-shape-and-it-is-worth-naming | The always-on file is a router, not an encyclopedia
the-floor-has-a-shape-and-it-is-worth-naming | A skill is cheap to have and expensive to ignore.
the-floor-has-a-shape-and-it-is-worth-naming | closed when the class is gone

## Stop 4: Stage zero, know where you are

**Beat 1**
highlight: stage-zero-instrument-and-make-one-repository-legible | disclosure marker on every agent change

The objective of stage zero is two things. Know where you are, and give one repository enough written down that an agent can work in it. The big one is change failure rate, split agent-authored against human-authored. That's the whole ballgame, and it needs a disclosure marker on every agent change to be computable at all. Put the marker in before you need it, because it can't be backfilled. Then review latency, and time to first review. That's the verification tax, measured directly, and it's the first thing that moves when you've overshot.

**Beat 2**
highlight: stage-zero-instrument-and-make-one-repository-legible | individual-level metrics never feed a performance review

Then edit distance before merge on agent pull requests. Merged as-is and merged after somebody rewrote half of it look identical in every standard metric, and they are completely different outcomes. One rule about all of them, and it isn't technical, but it decides whether the data is real. Individual-level metrics never feed a performance review. Roll them up to the team. Say it once in writing and then honour it, because the moment people suspect otherwise, you're measuring the gaming instead of the work.

**Beat 3**
highlight: stage-zero-instrument-and-make-one-repository-legible | Long context files make it worse, not better

Long context files make it worse, not better. I kept adding, because every session that went sideways felt like a missing paragraph. Past somewhere around two hundred lines it degrades. The model has more to hold, and the important rules stop standing out. What actually worked was moving the specifics into path-scoped rules that only load when a session touches that subsystem, and keeping the root file to what is true everywhere.

**Beat 4**
highlight: stage-zero-instrument-and-make-one-repository-legible | Environment parity is the boring one that decides everything

Environment parity is the boring one that decides everything. Commit the tool configuration. A fresh CI container and a new engineer's laptop should inherit the same setup, because the moment the agent's environment differs from the human's, you're debugging two systems. If I could put one legibility number on a dashboard, it'd be this. What percentage of your repositories could a new senior work in on day one, from what is written down? Stage zero is done when the baseline is published and nobody disputes it, every agent change is marked in a way you can query, and one repository is legible enough for that new senior.

**Digest:** Measure change failure rate split by agent and human, which needs a marker on every agent change from day one. Keep individual metrics out of performance reviews. Make one repository legible with a short root file, path-scoped rules and committed tool configuration.

**Trial:** Check whether you could run one query today that separates agent-authored changes from human-authored ones, and if not, write down the marker you would add.

**Runes:**
stage-zero-instrument-and-make-one-repository-legible | individual-level metrics never feed a performance review
stage-zero-instrument-and-make-one-repository-legible | Long context files make it worse, not better
stage-zero-instrument-and-make-one-repository-legible | Environment parity is the boring one that decides everything

## Stop 5: Stage one, supervision before output

**Beat 1**
highlight: stage-one-extract-the-skills | Write them by extraction, not invention

A skill is a senior engineer's judgement, written down once, applied consistently, and improved by pull request. A folder of instructions, versioned and reviewable. That's the entire idea, and it's the only part of any of this that compounds. Write them by extraction, not invention. Watch a senior do the task. Write down what they actually did. Have them correct it. Ship it. Then iterate on real usage.

**Beat 2**
highlight: stage-one-extract-the-skills | supervise work before the one that produces work

Give it a maintainer and a changelog, or it dies. A marketplace nobody owns is an abandoned folder within two quarters. I know what that folder looks like. I have one. Everybody builds the coder first. It's the exciting one, it demos well, and it's the reason the budget got approved. It's also the one you're least equipped to supervise on day one, and that's how you end up with the Faros numbers. Plenty of output, and no capacity to check it. So build the four skills that supervise work before the one that produces work.

**Beat 3**
highlight: stage-one-extract-the-skills | Code review checks a diff against house standards. Docs

First, plan. It turns a raw ticket into acceptance criteria, affected components, a test plan and risk notes. Second, code review. It reviews a diff against house standards and the repository's context, and it comments but never blocks. Third, docs. It catches drift between code and docs on merge and proposes the update. Fourth, QA. It writes tests to house convention, on the paths a change touches.

**Beat 4**
highlight: stage-one-extract-the-skills | to grade their own output

Anthropic's engineering team got to the same shape from the other direction. Building a harness for long-running agents, they split it into a planner, a generator and an evaluator. Their reason for the evaluator is blunt. Get those four good enough that you'd defend their output in a code review, and the coder becomes an ordinary engineering problem. Build the coder first, and you've bought a very fast way to generate work nobody has time to check.

**Digest:** A skill is a senior's judgement written down and improved by pull request, extracted from people who do the work. Build plan, review, docs and QA before the coder, because those four are what supervise it. Give the catalog an owner or it rots.

**Trial:** Pick one task a senior on your team does well, and write the first five steps of it as they actually do it, then ask them to correct you.

**Runes:**
stage-one-extract-the-skills | supervise work before the one that produces work
stage-one-extract-the-skills | Write them by extraction, not invention
stage-one-extract-the-skills | I know what that folder looks like. I have one.
