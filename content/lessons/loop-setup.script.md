# Set up the loop with one prompt

Status: DRAFT script for Tjakoen to read aloud and edit. Written from the note; not yet read or checked by him.

## Stop 1: One prompt, five pieces

You can set up the loop in one session, and you start it with a prompt. That's the whole promise of this lesson, and I'd rather make it small than make it impressive.

I call the whole thing the loop contract. The standards you write are the rules. The repo's instruction file is the front door. The plan is the work. The checklist is the proof that the loop loaded. The report is the evidence. And the human gate is the stop. The harness is the program that runs the session, and the model is the rented part. Notice what's missing from that list. The model is not in the contract. That is the point.

I should say early that this is my setup, not a requirement. Take what fits and improve the rest. I use Claude, Codex and DeepSeek, and the same shape would take Gemini, a local model, or whatever comes next.

So, the prompt. It's short on purpose. It points at the setup page, and the page carries the detail. You paste it into a fresh session at the root of your repo, and it says, more or less, set up the loop in this repo, read the setup guide, start with the smallest first step, and do not edit anything until you have told me what you found and what you would do first.

That last part is the important one. The right answer is small. A good reply names the instruction file, the plan, the one check, the first task, and the public rule you would rewrite for this repo. If it comes back with a platform, a hook for every event and a migration plan, stop. That's the loop as a settings project, not the loop as a practice. And if the answer is longer than a screen, ask for the first step only. The rest can wait.

For an agent that wants more than one line, the page has a longer brief folded away. It sets a boundary first. Read before you write, and ask before the first write. It names the five pieces. It asks where my public standards do not fit your repo, so you end up writing your own. It asks for the smallest first step with the exact files and commands. It keeps my board, PANTRY, optional, because a plans folder is enough. And it says to link the standards rather than copy them into the repo.

Now, what the loop actually is. It's five pieces, and I'll walk them in a circle.

The front door is one instruction file, linked to the standards you keep. It proves a session knows the rules before it writes anything.

The plan is one markdown file in the repo. It proves the work has a scope and a finish.

The checklist is one script with one verdict. It proves the loop loaded, not just the model.

The report is the run, the checks and the evidence. It proves the work can be checked without anyone having to ask you.

And the human gate is the lane, the commit and the publish. It proves the judgment stays human.

The harness calls those pieces, and the adapter step is the only part that changes from one harness to the next. Everything else stays put.

A contract is something both sides can check. The model can change, and the contract stays. There's a name I borrowed for the thing this protects against, comprehension debt. It's the gap between the code you can generate and the code you can understand. The loop is how I keep that debt visible.

Those five pieces are the thin loop. The guards and the adapters are add-ons, and you do not need them on the first day.

Next, I'll go through the pieces one at a time, starting with the part that is really yours, the standards you write for yourself.

**Digest:** The loop is five pieces: front door, plan, checklist, report, human gate. The model is not one of them. Start with one short prompt and expect a small answer.

**Trial:** Paste the setup prompt into a fresh session at your repo root and check whether the answer fits on one screen and names a first step.

**Runes:**
intro | The model is not in the contract. That is the point.
start-with-the-prompt | That is the loop as a settings project
what-the-loop-is | The model can change; the contract stays.

## Stop 2: The front door, the plan and the proof it loaded

The public standards are my example, not a rulebook you adopt. Read them, steal the shape, and write the version that fits your work. If one of my rules does not fit, write the one that does, and say why. A standard you did not write is a rule you cannot defend. That's also why the prompt asks the AI to tell you where my standards don't fit. The loop is yours. The standards are the part you keep.

Step one is the front door. It's one instruction file, linked to the standards, not a copy of them. In my repos that's the agents file, with the Claude file as a symlink pointing at it. It's the first thing a session reads, and it should answer four questions in plain language. What is this repo? How do I run the checks? Where does the plan live? And what may a session not touch?

Into it go the repo, the stack and the commands. The links to the standards you actually use, mine or yours. The rules you wrote yourself, where they differ from the public set. The loop itself, meaning where the plan lives, how to run the checklist, where the report goes and what the human gate is. Your board, if you have one. And the one-file rule, which says there is one file, the other name is a symlink, and there is no second copy.

What you should not do is paste the standards into it. A copy is a future argument about which one is right. Link them and let the standards carry the detail. And don't adopt a rule you haven't read, because a rule you cannot defend is not yours. If the prompt proposes a hook or a platform before it proposes the front door, ask it to start again.

Step two is the plan and the report. The plan is a markdown file. The board is a window. The report is the receipt.

A plan in the repo is enough. Put it in a plans folder and give it a scope, a finish and a status. My board is PANTRY, the orchestrator I built. It reads the plans folder, shows what's ready, and lets a session claim a plan, send a heartbeat while it works, and release it when it's done. It writes nothing back, because the markdown is the truth. PANTRY is live, and it is not required. It's just what I use. If your repo doesn't have it, a plans folder is the same shape. The plan isn't a project management tool. It's the sentence the session can finish.

The report goes in an artifacts folder, dated and named. It carries the checks that actually ran, the output, the diff and the open questions. It is not a diary. It's the evidence the next person needs. So check three things. The plan has a finish. The report names the checks, not just the result. And the report is short enough for a second person to read.

Step three is the checklist, and it's the piece that tells you the loop loaded.

It's one script, and it runs at the start of a session. It checks what has to be true before you trust that session. The instructions loaded, the front door is there, the plan exists, the check runs, the board and the code map can be reached, and the tree is clean. Then it ends with one verdict. Agentic Loop Loaded, or not loaded, with the failing rows named. The rows on my page are my machine. Yours will name your plan, your tests and your board.

You run it at the start, before the work, and you show the block exactly as it came out. The model does not write the verdict. If the hook printed nothing, you say the checklist did not run.

The checklist is not a test suite. It proves the loop loaded. The tests and the CI prove the work, and the second reader proves the judgment. Don't ask one tool to do all three. And when a row fails, fix the row, not the output. Never edit the block. I read it precisely because the script produced it and the model didn't.

Next come the guards, and the honest rule about them is that they wait until they've earned their place.

**Digest:** Write your own standards and link them from one front door file. A plan needs a finish, a report needs its checks. The checklist proves the loop loaded, and nobody edits its verdict.

**Trial:** Open your repo's instruction file and check whether it answers the four questions: what the repo is, how to run the checks, where the plan lives, and what a session may not touch.

**Runes:**
your-standards-are-the-contract-you-write | A standard you did not write is a rule you cannot defend.
step-two-the-plan-and-the-report | It is the sentence the session can finish.
step-three-the-checklist | fix the row, not the output.

## Stop 3: Guards, adapters and the first run

Start with the guards as prose. Move them to hooks when the same mistake happens twice.

The first guard is the human lane. It's the short list of paths only you touch, like the deploy config, the billing code, the secrets, or your employer's repo. Write the lane into the front door. Add a hook only when the honor system fails.

Since I first wrote this, the model turned out to be a guard too, and it earned its hook. I ran out of usage in the middle of a task, the loop kept going and the model didn't, so I wrote the layer that chooses the model. That story has its own notes.

The second guard is the handoff. When a session hands work to a subagent, the brief gets four headings. The lane, meaning high, gated or human, and why. The scope cap, meaning the folders it may touch. The hard stops, like no push, no publish and no merge. And the ask-triggers, meaning what stops the run and where the question goes. Start with those headings as prose too, and add a check when a handoff arrives without them.

The audit turned up one thing worth telling. A handoff I had written as a numbered list passed the old guard and failed the new one. The new guard was looking for a colon, and the numbered list didn't have one. A numbered list is a normal way to write a handoff, so the guard was wrong. I fixed it and added the case to the test. The bigger lesson is that a rule with two implementations needs one test list, and I didn't have one. So write one test list for the rule, not one per harness, and run the same cases against both. If the rule lives in two places, that list is the only thing keeping them honest. And remember the guards protect the five pieces. Don't add them before the pieces exist.

Step five is the adapter, and it's the only part that changes per harness. Claude Code and Codex use hooks. DeepSeek uses a plugin, because it has no shell hook events. The checklist, the standards, the plan and the report stay the same. The adapter is just the small piece that calls them.

You do not need three harnesses. Start with the one you use. I keep a private config repo for the wiring, but you can start with one file. The test for what goes public is whether a reader could use it without your machine. The voice rules pass. The checklist rule passes. The handoff headings pass. The machine paths, the employer rules and the secrets do not. And be honest that the private config is one point of failure. If it breaks, every machine breaks. A linking script points each machine at the same config, and the checklist catches a machine that has slipped. Keep it small.

Then the first run. Open a fresh session at the repo root. Run the checklist, read the verdict and fix any failing rows. Pick a task small enough for one session, write the plan, do the work and leave the report. Then give the report to a second reader and let the human land it. Good looks like this. The checklist block is at the top, the verdict says loaded, the plan has a finish, the report names its checks, and the second reader can explain the change without you in the room.

The next start is the backstop. If a session leaves work uncommitted, the next session's checklist sees it and asks.

There are two ways this goes. Start with the prompt and the five pieces, and you have a checked session by the end of the day and a loop you can improve. Start with the platform, and you have a settings project, a half-installed adapter and no work. The first is boring. The second is why most people stop.

Now the limits, because I'd be lying without them. The checklist proves the loop loaded, not that the work is good. The second reader is still what catches the work. The private config can drift. The adapter is code, and code rots. And the model will change. So start with one repo and one harness, add the second harness after the first run, and keep the human gate. Don't automate the commit or the publish.

The people whose work shaped this are on my reading page. My standards are my own draft, not a universal. Write yours.

The model will change. The loop is the part you keep. Open a fresh session, paste the prompt, and see what comes back.

**Digest:** Guards start as prose and become hooks when a mistake repeats. The adapter is the only part that changes per harness. Run one small, checked session first, and keep the human gate.

**Trial:** Write your human lane, the short list of paths only you touch, into your front door file.

**Runes:**
step-four-the-guards-when-they-earn-it | a rule with two implementations needs one test list
step-five-the-adapter | The adapter is the only part that changes per harness.
the-first-run | The first is boring. The second is why most people stop.
