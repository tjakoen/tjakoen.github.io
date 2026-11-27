# Build the Floor, part one: the roadmap and the first two stages

Status: DRAFT script for Tjakoen to read aloud and edit. Written from the note; not yet read or checked by him.

## Stop 1: Everybody wants the agent

Everybody wants the agent that opens pull requests while they sleep. I want it too. It is genuinely the most interesting thing to happen to this job in my career.

Almost nobody wants to build the thing underneath it. That part is unglamorous, it takes a quarter, and it mostly consists of making a codebase legible to a machine that has never met you.

I've been building this across about a dozen repositories over the last few months, and I've gotten a useful amount of it wrong in public. This lesson is the shape that works, the parts that broke, and what I would do with an organization's worth of it. It's an implementation talk, not a business case, so you won't hear me explain what AI means for your industry.

One word before we start, because it trips people up. In this lesson I use harness the way the industry does. It means the machinery around a model. What it sees, what it may touch, and who checks the result. In my newer notes I use the same word for the program that runs a session, like Claude Code or Codex. Same word, different layer. Here, it's the machinery.

And one idea before the build, because it's the reason the build is shaped the way it is. The floor is the variable, and you can measure it.

DORA said it plainly, across roughly five thousand technology professionals. AI amplifies whatever an organization already is. Strong engineering organizations get faster. Weak ones fail faster.

Then Faros AI put a stopwatch on both halves. Two years of telemetry, twenty-two thousand developers, four thousand teams, each team's lowest-adoption period against its highest. The gains are real. Epics per developer went up sixty-six percent, and task throughput went up thirty-four percent. The bill is bigger. Bugs per developer went up fifty-four percent. Incidents per pull request went up two hundred and forty-three percent. Median time in review went up four hundred and forty-two percent. And code churn went up eight hundred and sixty-one percent.

Faros call it the Acceleration Whiplash, and the mechanism isn't mysterious. Generation capacity is elastic. Review capacity is not. Merges with no review at all rose thirty-one point three percent. Listen carefully to that one, because the wrong version is going around. It's a thirty-one percent rise in unreviewed merges. It is not a claim that a third of everything goes unreviewed.

I call the thing that decides which side you land on the substrate gap. It's the distance between what your tools can do and what your codebase can absorb. Every technique in this lesson is a way of closing some of that gap.

The good writing on this files that machinery under the word harness, and the definition I borrow is Anthropic's. A harness is the structured system you build around a model. Watch the ambiguity, though. Plenty of people use the same word for the tool you work inside, which is a thing you buy rather than a thing you build. The one that decides your outcome is the one you build.

Two more numbers to carry into the build, and then I'll stop citing things. Veracode's 2026 report puts unguided AI-generated code at a fifty-six percent security pass rate, flat for two years, while syntactic correctness climbed past ninety-five percent. So the failure is not in the typing. And METR's controlled trial found experienced maintainers were nineteen percent slower with AI while believing they'd been twenty percent faster. So don't instrument any of this with a survey.

Next, I'll put the whole roadmap on one page, and tell you which half of it I have actually measured.

**Digest:** AI amplifies what an organization already is, and the Faros numbers show gains smaller than the costs. Generation scales and review does not. The substrate gap is the distance between what the tools can do and what the codebase can absorb.

**Trial:** Pick one repository you know and write two sentences, one on what an AI tool can already do there and one on what the codebase could not absorb.

**Runes:**
the-part-everybody-skips | making a codebase legible to a machine that has never met you
the-floor-is-the-variable-and-it-is-measurable | the thing that decides which side you land on the substrate gap
the-floor-is-the-variable-and-it-is-measurable | which tells you not to instrument this with a survey

## Stop 2: Five stages, one artifact

Here's the whole thing on one page. Eighteen months, from a room full of developers with subscriptions to an organization with real automation.

Stage zero is instrumenting, and making one repository legible, months zero to two. Stage one is extracting skills and running them by hand, months one to five. Stage two is daily use with scored outcomes, months three to nine. Stage three is the same skills fired by triggers, months six to twelve. And stage four is chained, unattended loops, months ten to eighteen. Each stage opens on scored runs behind it, not on the date.

The order of the stages is the argument, and I'll defend it. The month numbers are an estimate. I have not run this at organizational scale for eighteen months, and a roadmap that hides which half is measured isn't worth following.

Most organizations have bought stage zero and are hoping stage four arrives on its own.

The spine of it is one idea. A skill is written once and then promoted. A developer runs it by hand. You log what happened. Once it has enough scored runs behind it, the same file gets fired by a trigger instead of a person. Once that holds at volume, it runs unattended. Then it chains into other skills, and you have a loop. You never build a second system, and there is never a migration project where the manual thing gets rewritten as the automated thing.

That's why it's skills first and automation last. Automation built before the skill exists is a bespoke pipeline that encodes nobody's judgement. The skill is the asset. The loop is just the skill with the human taken out of the trigger, once it has earned that.

I want to be straight about where I am on this. It's an organization-scale roadmap, not a claim that my own work is at stage four. When I first published it, I had no scored team outcomes to show. Since then one skill has walked the first three stages where I work. A pull request reviewer I ran by hand in August now fires on triggers, and every comment it posts gets scored by what happened next. That's one skill on one team. I haven't shown that it makes the codebase better, and I still have no chained, unattended engineering loop to show. Stage four remains a proposal.

So what can you do now? Weeks, not months, and none of it needs a procurement conversation. First, instrument, and that includes a disclosure marker. Every agent-authored change gets marked, with a label, a branch prefix, a bot author or a commit trailer, whatever your forge supports. That marker is the join key for every comparison worth making later, and it can't be backfilled. Second, make one repository legible, the highest-traffic one, with a senior in the room. Third, extract two skills from people who actually do the work, ticket scoping and review assist, and give them to three to five engineers to run by hand, with the outcome log starting on the first run. At the end of that you have a baseline nobody disputes, one repo an agent can work in, and two skills in real use. It is not impressive, and it is the entire foundation.

At six months, skills are in daily use across teams, with a private catalog and a maintainer, growing by contribution. The first workflows fire from triggers, like review assist on every pull request. And you can answer the question that matters. Is the failure rate of agent-authored changes worse than human-authored? Six months of marked changes makes that computable.

At a year, two or three loops run unattended on genuinely verifiable work, like dependency upgrades with test verification, or flaky test triage. Human review before merge, always, but nobody is starting the work.

What has to be true to get there? Coverage and CI good enough that machines adjudicate most changes, documentation dense enough that agents rarely need a human, and review capacity that scales. The organizations doing this today built that substrate over years, for humans. Starting now means doing both at once. That's achievable. It isn't faster.

Next, before the stages in detail, I'll show you what the thing being built actually looks like.

**Digest:** Five stages over about eighteen months, and the order matters more than the dates. A skill is written once and promoted from manual to triggered to unattended, so there is never a second system. Only one skill has walked the first three stages in my own work, and stage four is still a proposal.

**Trial:** Place your team on the five stages, then write the one thing you would need in place to honestly start the next one.

**Runes:**
the-roadmap | a skill is written once and then promoted
the-roadmap | It is not impressive and it is the entire foundation
the-roadmap | Stage four remains a proposal.

## Stop 3: What the floor actually is

Five stages is a build order, not a description. Somebody asked me what the thing being built actually is, as one artifact rather than a list of parts, and the answer took me longer to say than it should have. The clearest drawing of it I've seen is in Cole Medin's AI-native starter pack, and I've borrowed its cross-section because it's better than the one I was carrying around in my head.

Start with what it buys. Picture one epic, walked twice, with the same model doing the typing both times. Without a layer, two of the steps are cut by hand up front, and two more come back as repairs after the code already exists. With a layer, those same two steps are cut by a skill, the gate runs before the pull request, and the only thing left for a person is one spot-check. Same epic, same model. The whole difference is in what was written down beforehand.

Now the cross-section. It has three layers.

Layer one is what it knows before it starts. Rules that sit in context every session, carrying the stack and the conventions. And context that loads only when it's relevant, like architecture and API contracts.

Layer two is what it knows how to do. Skills, whose one line is always in context while the body loads only when it runs. And subagents, with their own context window, that a skill can delegate to and run in parallel.

Layer three is what it can reach, and what stops it. Connections to the tracker, the spec pages and the forge. Hooks that fire on edit and commit, to format, lint and block, and that are never the model's choice. And a code graph that answers where a symbol is and what calls what.

All of it is files, committed and reviewed like code. Not one of those layers is a setting in somebody's editor.

The boxes are the easy part. Three things about them aren't obvious, and they cost real money to learn.

The always-on file is a router, not an encyclopedia. Everything in it is paid for on every session in that repository forever. That's why two hundred lines is a ceiling, not a target. Put the same content in a second copy at the repository root, in the file every other tool reads, and the layer belongs to the repository rather than to whichever vendor you picked in month one. That costs an afternoon, and I didn't spend it until embarrassingly late.

A skill is cheap to have and expensive to ignore. Its one line sits in context permanently and the body only loads when it runs. So a catalog of forty skills is affordable, and a context file of forty topics is not.

Code intelligence is the leg everybody drops. In my case it's a code graph rebuilt on every edit, so what calls this is one query instead of a search and a guess. In a large repository, that's the difference between an agent that navigates and one that reads twelve files hoping.

And the layer doesn't live in the editor. Most teams stop at the repository boundary, and that's the mistake I made for the longest. The same catalog is worth more at the edges. At the spec document, an epic becomes tickets with acceptance criteria. At the tracker, the agent reads the real ticket, not a paraphrase. In the codebase, it plans, builds and runs the gate. At the forge, the review skill goes first and a person spot-checks after. Work arrives well-formed, instead of being repaired downstream by the most expensive people you have.

The loop everybody passes around is prime, plan, implement, validate, with the gate before the pull request. I agree with the shape. Where I get off is the order. The packaged version hands you the implementer on day one, because that's the part that demos. Build the supervision first and the same loop still assembles.

Last, the edge that makes it compound. Every bug gets a root cause, and the root cause becomes a rule, a regression test, and a sweep for the same shape everywhere else. The bug isn't closed when the symptom goes away. It's closed when the class is gone. I do two thirds of that. I write the rule and add the test, and then I skip the sweep, which is exactly why the same shape keeps arriving with a different filename.

Next, stage zero, where you find out where you actually are.

**Digest:** The floor is three layers of files: what the agent knows, what it can do, and what it can reach and what stops it. Keep the always-on file short, let skills load on demand, and keep a code graph. Every bug should come back as a rule, a test and a sweep.

**Trial:** Open the context file of a repository you use and count its lines, then mark anything in it that belongs in a path-scoped rule instead.

**Runes:**
the-floor-has-a-shape-and-it-is-worth-naming | The always-on file is a router, not an encyclopedia
the-floor-has-a-shape-and-it-is-worth-naming | A skill is cheap to have and expensive to ignore.
the-floor-has-a-shape-and-it-is-worth-naming | closed when the class is gone

## Stop 4: Stage zero, know where you are

The objective of stage zero is two things. Know where you are, and give one repository enough written down that an agent can work in it.

The instrumentation first. This isn't a reporting pack. These are the numbers that tell you whether the floor is going in.

The big one is change failure rate, split agent-authored against human-authored. That's the whole ballgame, and it needs a disclosure marker on every agent change to be computable at all. Put the marker in before you need it, because it can't be backfilled.

Then review latency, and time to first review. That's the verification tax, measured directly, and it's the first thing that moves when you've overshot. Then the CI first-pass rate on agent changes, which tells you whether output is arriving correct rather than just arriving. Then median diff size, because rising size makes review worse and inflates your throughput numbers at the same time, which is a nasty pairing.

Then edit distance before merge on agent pull requests. Merged as-is and merged after somebody rewrote half of it look identical in every standard metric, and they are completely different outcomes. Then duplication and refactoring. GitClear found duplicated blocks up eighty-one percent since 2023, while refactoring fell to three point eight percent of changes. Left unwatched, that shows up eighteen months later as an unexplained slowdown. And last, the percentage of tickets you can classify green. That's your substrate as a number that moves.

One rule about all of them, and it isn't technical, but it decides whether the data is real. Individual-level metrics never feed a performance review. Roll them up to the team. Say it once in writing and then honour it, because the moment people suspect otherwise, you're measuring the gaming instead of the work.

And one more I learned after I first published this. Before you read any of these numbers as adoption, confirm the thing being counted can actually start. A zero on a dashboard has two possible causes, and only one of them is people. I got that wrong about a check of my own, and I'll tell that story in the next lesson.

Now legibility. A context file at the repo root, read automatically at the start of every session. Architecture, conventions, the build and test commands, the deployment model. Roughly what you'd explain to a new senior in their first week.

I got three things wrong here before I got them right.

Long context files make it worse, not better. I kept adding, because every session that went sideways felt like a missing paragraph. Past somewhere around two hundred lines it degrades. The model has more to hold, and the important rules stop standing out. What actually worked was moving the specifics into path-scoped rules that only load when a session touches that subsystem, and keeping the root file to what is true everywhere.

Write it for the machine, not for a human who might also read it. Those are different documents. A human wants the why and the history. An agent wants the invariants, the commands, and the things that will look reasonable and be wrong.

Environment parity is the boring one that decides everything. Commit the tool configuration. A fresh CI container and a new engineer's laptop should inherit the same setup, because the moment the agent's environment differs from the human's, you're debugging two systems. It's free at the start and miserable to retrofit.

If I could put one legibility number on a dashboard, it'd be this. What percentage of your repositories could a new senior work in on day one, from what is written down? That's the same question as whether an agent can.

Stage zero is done when the baseline is published and nobody disputes it, every agent change is marked in a way you can query, and one repository is legible enough for that new senior.

Next, stage one, where the obvious order is wrong.

**Digest:** Measure change failure rate split by agent and human, which needs a marker on every agent change from day one. Keep individual metrics out of performance reviews. Make one repository legible with a short root file, path-scoped rules and committed tool configuration.

**Trial:** Check whether you could run one query today that separates agent-authored changes from human-authored ones, and if not, write down the marker you would add.

**Runes:**
stage-zero-instrument-and-make-one-repository-legible | individual-level metrics never feed a performance review
stage-zero-instrument-and-make-one-repository-legible | Long context files make it worse, not better
stage-zero-instrument-and-make-one-repository-legible | Environment parity is the boring one that decides everything

## Stop 5: Stage one, supervision before output

Stage one turns what your seniors know into files, in an order that builds supervision before it builds output.

A skill is a senior engineer's judgement, written down once, applied consistently, and improved by pull request. A folder of instructions, versioned and reviewable. That's the entire idea, and it's the only part of any of this that compounds.

Write them by extraction, not invention. Watch a senior do the task. Write down what they actually did. Have them correct it. Ship it. Then iterate on real usage. A skill written by somebody who doesn't do the work will be wrong in ways nobody catches until it's been applied fifty times, and I say that as somebody who has written the confident wrong version.

Structure them as a few plugins, not a sprawl. A required core with house standards, the review checklist, security rules and the enforcement hooks. A workflow set that's on by default, for ticket scoping, pull request authoring, review and release notes. Domain plugins that a team opts into. And a private catalog with a manifest, so a repository gets its set by declaring it, not by somebody remembering.

Give it a maintainer and a changelog, or it dies. A marketplace nobody owns is an abandoned folder within two quarters. I know what that folder looks like. I have one.

Now the order, which is the part I'd argue hardest for.

Everybody builds the coder first. It's the exciting one, it demos well, and it's the reason the budget got approved. It's also the one you're least equipped to supervise on day one, and that's how you end up with the Faros numbers. Plenty of output, and no capacity to check it.

So build the four skills that supervise work before the one that produces work.

First, plan. It turns a raw ticket into acceptance criteria, affected components, a test plan and risk notes. It goes first because everything downstream needs a well-formed input, and it improves human work on day one whether or not an agent ever touches it.

Second, code review. It reviews a diff against house standards and the repository's context, and it comments but never blocks. It goes after the review tax directly, which is where Faros says the bill lands, and it writes down the taste the coder will later be judged against.

Third, docs. It catches drift between code and docs on merge and proposes the update. An agent needs legibility to work at all, and this is the only kind of documentation that can't go stale silently.

Fourth, QA. It writes tests to house convention, on the paths a change touches. That's the machine that decides whether the coder was right, so it has to exist before the coder does.

And last, the coder. It implements a bounded change end to end. It's only defensible once the four before it can catch it being wrong. Until then, every line it writes lands on a human.

Anthropic's engineering team got to the same shape from the other direction. Building a harness for long-running agents, they split it into a planner, a generator and an evaluator. Their reason for the evaluator is blunt. Asked to grade their own output, agents "tend to respond by confidently praising the work, even when, to a human observer, the quality is obviously mediocre." The generator can't be trusted to mark its own homework.

So each of the first four builds a piece of the supervision the fifth needs. Plan gives it a spec worth implementing. Review gives it a standard. Docs give it a codebase it can read. QA gives it a verdict that isn't a person's opinion. Get those four good enough that you'd defend their output in a code review, and the coder becomes an ordinary engineering problem. Build the coder first, and you've bought a very fast way to generate work nobody has time to check.

Two more are worth having once those five are in, and both are automation candidates rather than daily skills. Codebase orientation, whose value scales with how bad your docs are. And mechanical migrations, which is the single most automatable thing in any codebase.

Stage one is done when the first two skills are in real use by a pilot group, extracted from the people who do the work, and the outcome log has rows from the first run onwards.

That's where this half stops. In part two, we find out which of those skills actually work, and then we start taking the human out of the trigger.

**Digest:** A skill is a senior's judgement written down and improved by pull request, extracted from people who do the work. Build plan, review, docs and QA before the coder, because those four are what supervise it. Give the catalog an owner or it rots.

**Trial:** Pick one task a senior on your team does well, and write the first five steps of it as they actually do it, then ask them to correct you.

**Runes:**
stage-one-extract-the-skills | supervise work before the one that produces work
stage-one-extract-the-skills | Write them by extraction, not invention
stage-one-extract-the-skills | I know what that folder looks like. I have one.
