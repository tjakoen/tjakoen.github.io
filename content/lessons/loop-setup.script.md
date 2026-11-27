# Set up the loop with one prompt

Status: DRAFT script for Tjakoen to read aloud and edit. Cut into beats from the earlier narration; not yet read or checked by him.

How this script works. The note stays open on the page while the recording plays. Each beat is a short spoken line about one idea, and it names the phrase in the note that lights up while it plays. The wording is the earlier narration, cut to the lines that carry the idea. Format of a beat: a highlight line (section id, then a quote that must appear in that section of the note, or figure: and a figure name), then the spoken words.

## Stop 1: One prompt, five pieces

**Beat 1**
highlight: intro | The model is not in the contract. That is the point.

You can set up the loop in one session, and you start it with a prompt. I call the whole thing the loop contract. The standards you write are the rules. The repo's instruction file is the front door. The plan is the work. The checklist is the proof that the loop loaded. The report is the evidence. And the human gate is the stop. The harness is the program that runs the session, and the model is the rented part. The model is not in the contract. That is the point.

**Beat 2**
highlight: start-with-the-prompt | That is the loop as a settings project

So, the prompt. It's short on purpose. It points at the setup page, and the page carries the detail. You paste it into a fresh session at the root of your repo, and it says, more or less, set up the loop in this repo, read the setup guide, start with the smallest first step, and do not edit anything until you have told me what you found and what you would do first. The right answer is small. A good reply names the instruction file, the plan, the one check, the first task, and the public rule you would rewrite for this repo. If it comes back with a platform, a hook for every event and a migration plan, stop. That's the loop as a settings project, not the loop as a practice.

**Beat 3**
highlight: what-the-loop-is | instruction file, linked to the standards

It's five pieces, and I'll walk them in a circle. The front door is one instruction file, linked to the standards you keep. It proves a session knows the rules before it writes anything. The plan is one markdown file in the repo. It proves the work has a scope and a finish. The checklist is one script with one verdict. It proves the loop loaded, not just the model. The report is the run, the checks and the evidence. It proves the work can be checked without anyone having to ask you. And the human gate is the lane, the commit and the publish. It proves the judgment stays human.

**Beat 4**
highlight: what-the-loop-is | The model can change; the contract stays.

The harness calls those pieces, and the adapter step is the only part that changes from one harness to the next. Everything else stays put. A contract is something both sides can check. The model can change, and the contract stays. There's a name I borrowed for the thing this protects against, comprehension debt. It's the gap between the code you can generate and the code you can understand. The loop is how I keep that debt visible.

**Digest:** The loop is five pieces: front door, plan, checklist, report, human gate. The model is not one of them. Start with one short prompt and expect a small answer.

**Trial:** Paste the setup prompt into a fresh session at your repo root and check whether the answer fits on one screen and names a first step.

**Runes:**
intro | The model is not in the contract. That is the point.
start-with-the-prompt | That is the loop as a settings project
what-the-loop-is | The model can change; the contract stays.

## Stop 2: The front door, the plan and the proof it loaded

**Beat 1**
highlight: your-standards-are-the-contract-you-write | A standard you did not write is a rule you cannot defend.

The public standards are my example, not a rulebook you adopt. Read them, steal the shape, and write the version that fits your work. If one of my rules does not fit, write the one that does, and say why. A standard you did not write is a rule you cannot defend. That's also why the prompt asks the AI to tell you where my standards don't fit. The loop is yours. The standards are the part you keep.

**Beat 2**
highlight: step-one-the-front-door | instruction file, linked to the standards

Step one is the front door. It's one instruction file, linked to the standards, not a copy of them. In my repos that's the agents file, with the Claude file as a symlink pointing at it. It's the first thing a session reads, and it should answer four questions in plain language. What is this repo? How do I run the checks? Where does the plan live? And what may a session not touch? A copy is a future argument about which one is right. Link them and let the standards carry the detail. And don't adopt a rule you haven't read, because a rule you cannot defend is not yours.

**Beat 3**
highlight: step-two-the-plan-and-the-report | It is the sentence the session can finish.

Step two is the plan and the report. The plan is a markdown file. The board is a window. The report is the receipt. A plan in the repo is enough. Put it in a plans folder and give it a scope, a finish and a status. It writes nothing back, because the markdown is the truth. The plan isn't a project management tool. It's the sentence the session can finish.

**Beat 4**
highlight: step-three-the-checklist | fix the row, not the output.

It's one script, and it runs at the start of a session. It checks what has to be true before you trust that session. The instructions loaded, the front door is there, the plan exists, the check runs, the board and the code map can be reached, and the tree is clean. Then it ends with one verdict. Agentic Loop Loaded, or not loaded, with the failing rows named. And when a row fails, fix the row, not the output. Never edit the block. I read it precisely because the script produced it and the model didn't.

**Digest:** Write your own standards and link them from one front door file. A plan needs a finish, a report needs its checks. The checklist proves the loop loaded, and nobody edits its verdict.

**Trial:** Open your repo's instruction file and check whether it answers the four questions: what the repo is, how to run the checks, where the plan lives, and what a session may not touch.

**Runes:**
your-standards-are-the-contract-you-write | A standard you did not write is a rule you cannot defend.
step-two-the-plan-and-the-report | It is the sentence the session can finish.
step-three-the-checklist | fix the row, not the output.

## Stop 3: Guards, adapters and the first run

**Beat 1**
highlight: step-four-the-guards-when-they-earn-it | hooks when the same mistake

Start with the guards as prose. Move them to hooks when the same mistake happens twice. The first guard is the human lane. It's the short list of paths only you touch, like the deploy config, the billing code, the secrets, or your employer's repo. Write the lane into the front door. Add a hook only when the honor system fails.

**Beat 2**
highlight: step-four-the-guards-when-they-earn-it | a rule with two implementations needs one test list

A handoff I had written as a numbered list passed the old guard and failed the new one. The new guard was looking for a colon, and the numbered list didn't have one. A numbered list is a normal way to write a handoff, so the guard was wrong. The bigger lesson is that a rule with two implementations needs one test list, and I didn't have one. So write one test list for the rule, not one per harness, and run the same cases against both.

**Beat 3**
highlight: step-five-the-adapter | The adapter is the only part that changes per harness.

Step five is the adapter, and it's the only part that changes per harness. Claude Code and Codex use hooks. DeepSeek uses a plugin, because it has no shell hook events. The checklist, the standards, the plan and the report stay the same. The adapter is just the small piece that calls them. You do not need three harnesses. Start with the one you use.

**Beat 4**
highlight: the-first-run | The first is boring. The second is why most people stop.

Open a fresh session at the repo root. Run the checklist, read the verdict and fix any failing rows. Pick a task small enough for one session, write the plan, do the work and leave the report. Then give the report to a second reader and let the human land it. Start with the prompt and the five pieces, and you have a checked session by the end of the day and a loop you can improve. Start with the platform, and you have a settings project, a half-installed adapter and no work. The first is boring. The second is why most people stop. The model will change. The loop is the part you keep.

**Digest:** Guards start as prose and become hooks when a mistake repeats. The adapter is the only part that changes per harness. Run one small, checked session first, and keep the human gate.

**Trial:** Write your human lane, the short list of paths only you touch, into your front door file.

**Runes:**
step-four-the-guards-when-they-earn-it | a rule with two implementations needs one test list
step-five-the-adapter | The adapter is the only part that changes per harness.
the-first-run | The first is boring. The second is why most people stop.
