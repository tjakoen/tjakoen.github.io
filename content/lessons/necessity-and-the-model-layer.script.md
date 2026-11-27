# I Ran Out With Hours Left

Status: DRAFT script for Tjakoen to read aloud and edit. Cut into beats from the earlier narration; not yet read or checked by him.

How this script works. The note stays open on the page while the recording plays. Each beat is a short spoken line about one idea, and it names the phrase in the note that lights up while it plays. The wording is the earlier narration, cut to the lines that carry the idea. Format of a beat: a highlight line (section id, then a quote that must appear in that section of the note, or figure: and a figure name), then the spoken words.

## Stop 1: I ran out, and I would not pay my way out

**Beat 1**
highlight: intro | So I did what I usually do when something annoys me enough.

I spent my Codex usage and still had four hours to go before its five-hour window refreshed. I was in the zone. I did not want to stop. The obvious fix was the next tier up. I didn't want it. Paying that much turns every idle evening into a small failure to use what I bought, and I did not want my evenings grading me. So I did what I usually do when something annoys me enough. I built infrastructure.

**Beat 2**
highlight: the-night-i-went-looking-for-a-way-out | is not a saving, it is a hobby

I have an RTX 3050 with 8 gigabytes of memory. It runs small models fine, and it runs the ones I would actually want for coding badly. A coding model that is worse than the one I'm paying for is not a saving, it is a hobby. I put that idea back on the shelf for a year or two.

**Beat 3**
highlight: the-night-i-went-looking-for-a-way-out | free endpoint may keep whatever you send

They exist, they're better than I expected, and the catch is printed on the label. A free endpoint may keep whatever you send it. I decided I could accept that trade for my own projects, where the code is public anyway, and for nothing else. That decision is the most important one in this whole lesson, and most of what I built exists to enforce it.

**Beat 4**
highlight: the-old-setup-and-the-new-one | Fewer apps is a feature.

Before, Claude Code was my main tool. The Codex app was the backup, and the way I ran a second project in parallel. And DeepSeek Harness, which I call DSH, was the last fallback for when both plans were out. Fewer apps is a feature. So the new shape has fewer programs, and one decision-maker where I used to be. I'm calling that decision-maker a Model Intelligence Layer. It is the part of my setup that decides which model does which job, and what happens when one runs out.

**Digest:** I ran out of Claude and Codex mid-task and refused to buy the next tier. A local model was too weak and free models may keep what you send, so I allowed them only on my own public code. My setup shrank to fewer apps, with one layer choosing the model.

**Trial:** Write down every AI tool and plan you use, and next to each, the role it plays and what you do by hand when it runs out.

**Runes:**
intro | So I did what I usually do when something annoys me enough.
the-night-i-went-looking-for-a-way-out | is not a saving, it is a hobby
the-old-setup-and-the-new-one | Fewer apps is a feature.

## Stop 2: Four decisions I did not want to make tired

**Beat 1**
highlight: what-a-model-intelligence-layer-does | I did not want to make those four decisions tired

The layer owns four decisions. Which model plays which role. Whether that choice was actually obeyed. What happens when a model runs out. And what each run cost, and where the prompt went. I did not want to make those four decisions tired, in the middle of something. So I wrote them down once and let hooks enforce them.

**Beat 2**
highlight: what-a-model-intelligence-layer-does | Judgment goes up, typing goes down.

The first rule is that judgment goes up and typing goes down. Planning and review stay on the strong models. When the main session reaches a piece of work that needs judgment, it hands that piece to a strong subagent and gets one answer back. A search, a read or a small edit goes the other way, to a light subagent. Anything else stays in the main session. Either way the main session keeps its own conversation, and its place.

**Beat 3**
highlight: what-a-model-intelligence-layer-does | it stops and asks me rather than reaching for money

The second rule is that light work falls down a fixed order. First one free model, DeepSeek Flash Free. Then the same model on a small monthly plan, OpenCode Go. Then the Codex models on the plan I already pay for, Luna and then Sol at low effort. When a model says no anyway, the layer cools it down and moves on to the next one. And if every model is out, it stops and asks me rather than reaching for money. The paid DeepSeek API sits outside the order on purpose. It is an escalation, not a step.

**Beat 4**
highlight: what-a-model-intelligence-layer-does | Free, the one free model, since the free

Three requests show where each rule bites. Say the free model is out for the day. The route check skips it and OpenCode Go takes the work. Nothing stalls. Say the request is in a private repository. The free model and Go both get skipped, because both may keep prompts. Luna takes it instead. Nothing leaks. Say the work genuinely needs the paid model. Then it waits for my typed yes. Nothing overspends. If a session starts on the wrong model, it stops before doing any work and offers me a restart.

**Digest:** The layer decides the model per role, checks it was obeyed, handles running out, and records cost. Judgment goes to strong models and light work falls down a free, then flat-rate, then paid-plan order. The pay-per-token API sits outside that order and needs a typed yes.

**Trial:** Take one task you did today and sort its pieces into judgment and typing, then name the cheapest model you would trust with each typing piece.

**Runes:**
what-a-model-intelligence-layer-does | I did not want to make those four decisions tired
what-a-model-intelligence-layer-does | it stops and asks me rather than reaching for money
what-a-model-intelligence-layer-does | Judgment goes up, typing goes down.

## Stop 3: What I have seen, and the line I hold

**Beat 1**
highlight: what-is-built-and-what-is-still-ahead | reads only what is written down.

It is built, I use it every day, and parts of it are still unproven. Both of those are true at once, so I'll take them in order. And a plan that changes the setup itself, anything touching my hooks, settings or standards, cannot start until a fresh reviewer has read it. I call that reviewer the goldfish. It has seen nothing of the conversation that produced the plan, so it reads only what is written down.

**Beat 2**
highlight: what-is-built-and-what-is-still-ahead | Those are tested, not yet seen.

Now the honest part. I have seen Go take light work after its allowance was checked, live on my Mac. I have not yet seen the free model run out in the middle of a task and Go take over by itself. I have not seen a main session move on when it runs out, or the Codex side of the checks, or Sol take light work on OpenCode. Those are tested, not yet seen. Continuing a cut-off session is still half by hand, because I click to archive the old one. And on the thirtieth of November I'm going to look at a week of records and decide whether free should still go first.

**Beat 3**
highlight: the-rule-i-will-not-bend | a mistake has to get past all three

Then there's the rule I will not bend. On my work computer, only the company's Claude and Codex. The free model, Go and DeepSeek are for my own projects, on my own computer. Those three may keep what they are sent, so they never see work code. And I did not leave that to my memory, which is exactly the thing I would not leave it to. Three guards hold the line, and a mistake has to get past all three. A computer the setup can't identify is treated as a work computer. In work context, every prompt checks the signed-in account and is blocked unless it's a company one. And the wrapper that starts OpenCode, which runs the light chain, refuses to start it in work context, whatever I've said about the repository. I would not let a tired evening be the reason one of them saw something that wasn't mine.

**Beat 4**
highlight: what-it-changed | the next model is a lookup and not a decision

It never stalls, it never overspends, and it never leaks private code. Each of those has a mechanism behind it rather than a promise. So far, I haven't run out in the middle of something. The free model and the small plan take the light work, so the strong plans last longer, and when one does empty, the next model is a lookup and not a decision. I ran out at the wrong moment, with four hours left on a clock I couldn't argue with. Now the next model is a lookup, and the lookup knows what it's allowed to touch.

**Digest:** The layer is built and used daily, but several fallbacks are tested and not yet seen live. Work code never reaches a model that may keep prompts, and three guards enforce that. The gains so far are no mid-task stalls, lower effort settings and fewer apps, as experience rather than a measured comparison.

**Trial:** List the repositories you work in and mark each one as fine or not fine for a model that may keep your prompts, then write down what would stop you from getting it wrong on a tired evening.

**Runes:**
what-is-built-and-what-is-still-ahead | Those are tested, not yet seen.
the-rule-i-will-not-bend | a mistake has to get past all three
what-it-changed | the next model is a lookup and not a decision
