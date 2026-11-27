# I Ran Out With Hours Left

Status: DRAFT script for Tjakoen to read aloud and edit. Written from the note; not yet read or checked by him.

## Stop 1: I ran out, and I would not pay my way out

I spent my Codex usage and still had four hours to go before its five-hour window refreshed. I was in the zone. I did not want to stop.

It was not the first wall that week. The Claude weekly limit had already left me three days from a refresh, and Codex was halfway through its weekly allowance with six days still to go. I do a lot of work with AI, and once again I had run out.

The obvious fix was the next tier up. I didn't want it. Paying that much turns every idle evening into a small failure to use what I bought, and I did not want my evenings grading me. So I did what I usually do when something annoys me enough. I built infrastructure.

This picks up from The Loop Outlives the Model, where I brought DeepSeek in once both plans had run out. If you haven't heard that one, the short version is that I already had a loop. A plan, then a session that runs its checklist first, then a report, then a second reader, then me. The model is not one of those pieces. That turned out to matter, because it meant the model could become a decision instead of a fixture.

The first thing I tried was running a model on my own machine. I have an RTX 3050 with 8 gigabytes of memory. It runs small models fine, and it runs the ones I would actually want for coding badly. A coding model that is worse than the one I'm paying for is not a saving, it is a hobby. I put that idea back on the shelf for a year or two.

The second thing was free models online. They exist, they're better than I expected, and the catch is printed on the label. A free endpoint may keep whatever you send it. I decided I could accept that trade for my own projects, where the code is public anyway, and for nothing else. That decision is the most important one in this whole lesson, and most of what I built exists to enforce it.

None of this was a new idea about the work itself. Before I built any of it, I was already handing light work down from Sonnet to Haiku, my smallest Claude model. The strong plan was never doing everything. The free models are one more rung on that same ladder, at the cheap end. What is new is that the rung costs nothing, and the ladder now crosses providers.

So here is what my setup looked like before, and what it looks like now.

Before, Claude Code was my main tool. The Codex app was the backup, and the way I ran a second project in parallel. And DeepSeek Harness, which I call DSH, was the last fallback for when both plans were out. When something ran out, I picked the next model by hand.

Now, Claude Code is still where I work when I want Claude. OpenCode does all my coding outside Claude, and my Codex usage, a free model, a small monthly plan and the DeepSeek API all plug straight into it. Anthropic's own plan can't plug into OpenCode. In my testing it only lets another harness in through an API token that is billed apart from the plan. Codex lets its plan in directly, and Claude Code is a good harness for Claude anyway.

I stopped using the DSH app and put that side on hold. Fewer apps is a feature. I kept the Codex app, but for work that isn't coding, which means the ChatGPT side and anything at work.

So the new shape has fewer programs, and one decision-maker where I used to be. I'm calling that decision-maker a Model Intelligence Layer. It is the part of my setup that decides which model does which job, and what happens when one runs out. In the next stop I'll open it up and show you the decisions it owns.

**Digest:** I ran out of Claude and Codex mid-task and refused to buy the next tier. A local model was too weak and free models may keep what you send, so I allowed them only on my own public code. My setup shrank to fewer apps, with one layer choosing the model.

**Trial:** Write down every AI tool and plan you use, and next to each, the role it plays and what you do by hand when it runs out.

**Runes:**
intro | So I did what I usually do when something annoys me enough.
the-night-i-went-looking-for-a-way-out | is not a saving, it is a hobby
the-old-setup-and-the-new-one | Fewer apps is a feature.

## Stop 2: Four decisions I did not want to make tired

The layer owns four decisions. Which model plays which role. Whether that choice was actually obeyed. What happens when a model runs out. And what each run cost, and where the prompt went.

I did not want to make those four decisions tired, in the middle of something. So I wrote them down once and let hooks enforce them.

It has five parts. A registry, which is the list of model ids, their tiers and their roles. A model guard, which restarts a session that came up on the wrong model. A route check, which picks the model and knows about cooldowns and which repositories are cleared. A work guard, which allows only a company account at work. And a usage record, one line per session. Let me tell you how they behave together, in plain words.

The first rule is that judgment goes up and typing goes down. Planning and review stay on the strong models. That's Opus on Claude and Sol on Codex, or DeepSeek V4 Pro on the Go plan when Codex is spent. That's where judgment pays for itself. When the main session reaches a piece of work that needs judgment, it hands that piece to a strong subagent and gets one answer back. A search, a read or a small edit goes the other way, to a light subagent. Anything else stays in the main session. Either way the main session keeps its own conversation, and its place.

The second rule is that light work falls down a fixed order. First one free model, DeepSeek Flash Free. Then the same model on a small monthly plan, OpenCode Go. Then the Codex models on the plan I already pay for, Luna and then Sol at low effort. Before it picks the monthly plan, it reads how much of that plan's allowance is left, and it skips the plan when a limit is reached. When a model says no anyway, the layer cools it down and moves on to the next one. And if every model is out, it stops and asks me rather than reaching for money.

That last part is deliberate. The paid DeepSeek API sits outside the order on purpose. It is an escalation, not a step. No agent holds its key. It runs on a prepaid balance I topped up myself, and a call only happens after I type an approval in a terminal. The daily cap counts an approved call as spent the moment I approve it, before any money moves.

Three requests show where each rule bites.

Say the free model is out for the day. The route check skips it and OpenCode Go takes the work. Nothing stalls.

Say the request is in a private repository. The free model and Go both get skipped, because both may keep prompts. Luna takes it instead. Nothing leaks.

Say the work genuinely needs the paid model. Then it waits for my typed yes. Nothing overspends.

Two more things happen in every session, whatever the request. If a session starts on the wrong model, it stops before doing any work and offers me a restart. And every session and every subagent leaves one record of what it used, so my desk, PANTRY, shows free and paid apart.

That's the machine as I use it. The next stop is the less flattering part, which is what I've actually seen it do, what I haven't, and the one rule I refuse to bend.

**Digest:** The layer decides the model per role, checks it was obeyed, handles running out, and records cost. Judgment goes to strong models and light work falls down a free, then flat-rate, then paid-plan order. The pay-per-token API sits outside that order and needs a typed yes.

**Trial:** Take one task you did today and sort its pieces into judgment and typing, then name the cheapest model you would trust with each typing piece.

**Runes:**
what-a-model-intelligence-layer-does | I did not want to make those four decisions tired
what-a-model-intelligence-layer-does | it stops and asks me rather than reaching for money
what-a-model-intelligence-layer-does | Judgment goes up, typing goes down.

## Stop 3: What I have seen, and the line I hold

It is built, I use it every day, and parts of it are still unproven. Both of those are true at once, so I'll take them in order.

I built it in two rounds. The first round is the everyday part. The list of models and what each one is for, the check that a session runs on the model it should, the order light work falls down, and a record of every call.

The second round is for the moments that go wrong. A paid call leaves a record and waits until I type approve. No more than four agents run at once. Before a big task, a check says whether it fits in what the model can hold, and it advises but never blocks. A session that gets cut off leaves a checkpoint the next one can pick up from. A scout researches new models when I ask, and never adds one on its own. And a plan that changes the setup itself, anything touching my hooks, settings or standards, cannot start until a fresh reviewer has read it. I call that reviewer the goldfish. It has seen nothing of the conversation that produced the plan, so it reads only what is written down.

Seven rounds of independent audit went through that second round before I called it ready.

Now the honest part. I have seen Go take light work after its allowance was checked, live on my Mac. I have not yet seen the free model run out in the middle of a task and Go take over by itself. I have not seen a main session move on when it runs out, or the Codex side of the checks, or Sol take light work on OpenCode. Those are tested, not yet seen. Continuing a cut-off session is still half by hand, because I click to archive the old one. And on the thirtieth of November I'm going to look at a week of records and decide whether free should still go first.

Then there's the rule I will not bend. On my work computer, only the company's Claude and Codex. The free model, Go and DeepSeek are for my own projects, on my own computer. Those three may keep what they are sent, so they never see work code. And I did not leave that to my memory, which is exactly the thing I would not leave it to.

Three guards hold the line, and a mistake has to get past all three. A computer the setup can't identify is treated as a work computer. In work context, every prompt checks the signed-in account and is blocked unless it's a company one. And the wrapper that starts OpenCode, which runs the light chain, refuses to start it in work context, whatever I've said about the repository. My own computer has one more rule. I clear each repository myself, one at a time, before a model that keeps prompts may touch it. I would not let a tired evening be the reason one of them saw something that wasn't mine.

So what did it change? It never stalls, it never overspends, and it never leaks private code. Each of those has a mechanism behind it rather than a promise. The fallback order, the typed approval against a prepaid balance, and the guards.

The first change is the one I wanted. So far, I haven't run out in the middle of something. The free model and the small plan take the light work, so the strong plans last longer, and when one does empty, the next model is a lookup and not a decision.

The second is that I work at low effort now, which is a setting for how long a model thinks before it answers. Opus runs low and Sonnet runs medium, because the architecture carries the load. The plan is written, the review is fresh, the guards are hooks. A model that doesn't have to hold the whole project in its head can think less and be right more often. That's my experience since the loop and the harness were in place, not a controlled comparison.

The third is fewer apps and fewer moods. I don't choose between four programs when something runs out. I open the one I always open.

I ran out at the wrong moment, with four hours left on a clock I couldn't argue with. Now the next model is a lookup, and the lookup knows what it's allowed to touch. If you want the machinery, every piece of it and the steps to build your own, that's the next lesson, How the Model Intelligence Layer Works.

**Digest:** The layer is built and used daily, but several fallbacks are tested and not yet seen live. Work code never reaches a model that may keep prompts, and three guards enforce that. The gains so far are no mid-task stalls, lower effort settings and fewer apps, as experience rather than a measured comparison.

**Trial:** List the repositories you work in and mark each one as fine or not fine for a model that may keep your prompts, then write down what would stop you from getting it wrong on a tired evening.

**Runes:**
what-is-built-and-what-is-still-ahead | Those are tested, not yet seen.
the-rule-i-will-not-bend | a mistake has to get past all three
what-it-changed | the next model is a lookup and not a decision
