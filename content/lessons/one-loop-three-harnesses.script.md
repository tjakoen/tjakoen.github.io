# One Loop, Three Harnesses

Status: DRAFT script for Tjakoen to read aloud and edit. Written from the note; not yet read or checked by him.

## Stop 1: The day Claude ran out

Before I start, an update, because this note has already aged. Since I wrote it I deleted the DeepSeek Harness app. DeepSeek now reaches me through OpenCode, next to free models and the Codex plan, behind a layer that picks the model for me. And the privacy line you'll hear about later became a hard rule, enforced by guards. The full story of that is a later note, I Ran Out With Hours Left. What follows is how it looked when I wrote it.

I was all in on Claude. Work introduced me to it, and I liked that Anthropic built for developers first, so I started using it for my own projects too.

The cheapest plan was enough at first. Then the projects grew. The next step up was a bigger usage window, not a better model, and it was more than I needed and more than I wanted to pay. So Claude kept running out on the small plan. That's on me. I do a lot. I build things, run projects, grade and research.

So I tried Codex. I'd heard good things, and it had a free month. I used it when Claude ran out. The first time that happened in the middle of a task, I opened Codex, checked out the same branch, and finished the work without changing a single instruction.

That should have felt like freedom. It exposed a problem instead. Moving between providers in the middle of a project is not smooth unless something holds the state. That was the day I stopped thinking of the model as the thing I was buying.

They were good at different things, so I started picking one per project. Then I was jumping between them whenever one ran out. I needed a way to switch without losing the thread.

DeepSeek came later. The price was the first thing anyone mentioned, and I was hesitant because it's a Chinese service. Then Claude and Codex both ran out with days left before the refill. I jumped in. It fit.

So here is my setup. Three devices, two subscriptions, one usage account, and a private repo for my AI settings. That is the most 2026 sentence I have ever written, and two years ago it would have embarrassed me. On the entry plans I still get the top model. What I'm buying is usage, not access. The usage is the cheap part. The loop is the expensive part, and I built it myself.

This isn't a review of the three of them. It's a report from the room where they meet, and it's one person's setup, offered as a suggestion. The loop doesn't care what's underneath. Gemini or a local model would fit the same shape.

Now the part I had not written down. I'd already written the long version of the loop, in I Was Shipping Faster Than I Could Understand It. That note carries a correction. Three weeks after I published it, I found the doctor, the check that is supposed to start every session, had run once in a hundred and sixty-five sessions. The script couldn't find its own program from any folder but the one beside it. It said it was unavailable and quietly exited. I left the claim and the correction both in public, because the gap is the useful part. A loop that is remembered is not a loop. It has to be checked.

The public standards are the contract I wrote for myself. A private repo is the wiring. One links to the other, and the link is not a copy. If you build a loop, write your own standards. Mine are a draft, not a product.

Next, what the loop actually is, piece by piece, and why the model is just a route.

**Digest:** Running out of Claude mid-task showed that switching models only works if something holds the state. The model is rented, and the loop is built. A loop you only remember is not a loop.

**Trial:** Write down where the state of your current project lives right now: the plan, the branch, the next step. If it only lives in your head or one chat, note that.

**Runes:**
the-day-one-of-them-ran-out | What I am buying is usage, not access.
the-loop-was-the-thing-i-had-not-written-down | A loop that is remembered is not a loop.

## Stop 2: The model is a route

So what is the loop? A plan is a markdown file. The board is a window on those files, not a database. Mine is PANTRY, the orchestrator I built. It reads the plans, shows what's ready, and lets a session claim a plan and put it back. It writes nothing back. And you don't need PANTRY. A folder of plans is enough. It's just what I use.

A session starts by reading the repo and the plan. The doctor runs first and puts what's due in front of me. A run leaves a report with the checks it actually ran. A change you can see leaves a short walkthrough. Someone who didn't write the change checks it. And the human lands it.

That's five pieces. One instruction file, one plan, one checklist, one report and a human gate. The setup guide has the terminal output and the steps. This is the why.

Then the harness. Every rule in my loop standards assumes something is running the hooks, and for a long time I didn't say what. Then I started moving between harnesses, and the loop had to prove it wasn't the harness.

The word has two meanings, and I've used both. In Everybody Wants the Agent it meant the scaffolding around a model: what it sees, what it may touch, who checks the result. Here I mean the program that runs the session. Claude Code, Codex, DeepSeek Harness. The loop sits above both meanings.

I use all three. The first two get the loop through a settings file. DeepSeek got it through a small plugin. The rules did not change.

And I use three machines. A personal laptop, a personal PC and a work laptop. The work laptop gets the same standard and the same config repo, because I want one way to code. Work projects stay on it, and the personal machines never hold them. The private repo is agent config, not content. Each machine gets its own settings and its own path to the board.

Now the model. The loop is portable. The model is the part I rent, and I had to unlearn the idea that I was buying one.

The entry plan on Claude and Codex is the one I want. A plan is not a model. It's the size of the window, and the entry window is enough. Two entry plans plus the cheap DeepSeek meter cost me less and do more than the big plan on one. I won't quote numbers. The shape is what matters.

I max the allowance out on purpose, so I don't feel like I'm wasting money. A fixed window is predictable, and it forces me to choose the work. An open-ended token meter makes me hesitate, and hesitation is a tax.

The routing is simple. Claude Opus 5.5 on Low for the shape of a problem, Medium when the problem earns it. GPT Sol on Low or Medium for a long build once the plan is clear. DeepSeek when the allowances are out, or when the experiment is cheap. A subagent for a wide read with a small answer. Low and Medium are how much thinking budget I give, not different models. The access is the same.

I pick an owner model per project. The owner is the one I reach for first, not a lock. I've pushed one too hard, hit the five-hour or the weekly window, and moved the same project to the other. The loop is what makes that safe. The work is committed, the main branch is clean, the work sits on its own branch, and the handoff says what it is and where it stops. The next model opens the same repo, not a different project.

That's the part I didn't expect. The model switch is not a crisis. It's a Tuesday.

Next, what a week looks like with all of this running, and the line I don't cross.

**Digest:** The loop is five pieces: an instruction file, a plan, a checklist, a report and a human gate. The harness and the model can change underneath it. Switching is safe because the work is committed and handed off.

**Trial:** Write a three-line handoff for something you're working on: what the work is, where it stops, and which branch it's on. Could another model pick it up from that alone?

**Runes:**
what-the-loop-actually-is | A plans folder is enough; it is just what I use.
three-harnesses-one-standard | The rules did not change.
the-model-is-a-routing-decision | The model switch is not a crisis. It is a Tuesday.

## Stop 3: The line I do not cross

Outside work I run one to five projects at a time. The big one is the next course platform. Last semester's native course platform proved the shape works, and this one is the proper hosted platform. I wouldn't have started it without the loop. I also keep the portfolio current, revisit old work, and teach part time at the School of Computing at Holy Angel University.

The loop is good enough that when an idea arrives, I can hand it off and go do something else. That's what changed my week, not the model. And this isn't a flex about volume. I do a lot with AI because the loop makes the volume safe to carry, not because I can hold it all in my head. I can't.

At Career Team I use the company's Claude and Codex with the same loop, for management work and technical work. The work laptop is on company accounts. Hardcoded rules keep work data out of the personal setup. Grading is the same split. The loop handles the mechanics, and the judgment stays mine. No student data goes into the public repo, or into any service I wouldn't trust with it.

Privacy isn't one question. I work from home, so the work laptop sits in the same room as the personal machines. The separation is the machine and the account, not the room. Work projects stay on the work laptop and in company accounts. Personal projects stay on the personal machines. The work devices have security that would flag or block a personal project before it got far. That separation isn't a disclaimer. It's what lets me use one loop for both without lying about which is which.

DeepSeek is a Chinese service, so the data sits under a different jurisdiction. I use it for work that's already public or disposable, and for experiments where cost matters. Never for student data, employer code, or anything private. I build in the open, so the public part is public by design. I wouldn't make that trade for data that isn't mine to publish.

Local models? I'd like one. The math doesn't work yet. The token volume I'd need to pay off the hardware is large, and a coding model worse than the paid one isn't worth the desk space. I'm waiting for a consumer GPU that reaches the current frontier, maybe in a year or two. That's a hope, not a forecast.

Then what I haven't solved. DeepSeek had no stop signal I could catch, so a close check fills the gap. It reads the session log, scopes the changed files to that session, and says whether the session can be archived. I run the end command anyway.

Each new harness needs a small adapter, and I'll have to write one for the next. The private config is one point of failure. If it breaks, all three machines break. But it's not three drifting copies. Each machine links to the same config, and the checklist catches a machine that has slipped.

And the big one. The checklist can prove the loop loaded. It cannot prove the work is good. The second reader is still the thing that catches the work. This is one person's setup, not a study, and tool preference is not evidence.

The note credits Addy Osmani for the loop and the warning about comprehension debt, Alfonso Graziano for writing down what I meant, and Cole Medin for treating the project as one artifact.

The plans will change, and so will the models. The loop is the part I keep: the plan, the gate, the evidence, the human who lands it. I'm not loyal to a model. I'm loyal to the loop that lets me switch.

Next we leave this note for an older one, The Check Ran Once in 165 Sessions, which tells the story behind that one run in a hundred and sixty-five.

**Digest:** One loop carries five threads because it holds the state. Work and personal stay split by machine and account. The checklist proves the loop loaded, never that the work is good.

**Trial:** List the places your AI tools can see data. For each, write one line saying what must never go there.

**Runes:**
the-line-i-do-not-cross | The separation is the machine and the account, not the room.
what-i-have-not-solved | It cannot prove the work is good.
the-part-i-keep | I am loyal to the loop that lets me switch.

## Stop 4: One run in a hundred and sixty-five

This stop moves to a different note, The Check Ran Once in 165 Sessions, and I Got the Reason Wrong. It's the correction the last note kept pointing at.

On a Wednesday night, three weeks after I published a note about how well my workflow was going, I ran a query. A hundred and sixty-five AI sessions in my largest client project since early July. One of them ran the check that's supposed to fire at the start of every single one.

Not one in ten. One.

I built that check for a reason I still believe in. And I'd written, in those words, that I'd made every one of my repos run it. That sentence went out on the thirtieth of July. The number is from the nineteenth of August.

The other repositories in my table looked flatter still. Two hundred and eighty-eight sessions between the four of them, one doctor run, the one I just mentioned, and zero run reports. Meanwhile this site, where the whole thing was built, had eighty-seven sessions that ran it and sixty-two that left a report. Those are a snapshot from that one night, not a standing count, and that turns out to matter.

What I did next is the whole story, because the mistake doesn't look like a mistake from the inside. I didn't shrug. I took the numbers seriously and built an explanation, and it was about discipline. A check that fires when you sit down costs you right now. It interrupts, it hands you a list, it delays what you came to do. Whatever it buys you comes later, often for somebody else. In my case that's a future me who's forgotten why any of this is here. Cost now, payoff later and elsewhere. That machinery gets skipped. Every time.

I liked that theory. I still like it, which was a warning sign I didn't read. It explained everything else on the page. Only twenty-one of four hundred and fifty-four sessions handed off properly, and twenty of those were in this repo, where I was watching. Fifty-nine sessions were named some version of review pasted text. The longest session in the store ran to eleven thousand three hundred and ninety-six messages, which is not a session. It's a hostage situation.

All of that is true, and none of it was the answer.

Late that day I did what I should have done first. I opened the client project and ran the check by hand. It could not find its own program.

The check is a small shell script that fires at session start. Its job is to find my tooling and ask what's out of shape in the repo. Finding the tooling took three tries. First, is the program installed globally? It isn't, because I never published it. Second, is there a sibling folder next to this repo? That only works if you're already standing in the one directory where all my stack repos sit side by side. Third, is there a vendored copy? The client project has no reason to carry one.

So from anywhere but that directory, all three miss. The script prints a line saying the check didn't run, and it exits quietly with a success code.

Those hundred and sixty-five sessions weren't declining a check. They were being told it was unavailable, in a message so small that neither I nor the machine reading it ever treated it as a fault. The one recorded run was a human typing the command. That human was me, standing in the one folder where it works.

Next, why the wrong answer felt so good, and what I couldn't even get right while writing this up.

**Digest:** The check had run once in a hundred and sixty-five sessions. I built a discipline theory for it. Running it by hand showed it had never been able to start.

**Trial:** Pick one hook or script you rely on. Run it by hand from a folder other than the one you built it in, and read what it says.

**Runes:**
one-run-in-a-hundred-and-sixty-five-sessions | Not one in ten. One.
the-story-i-told-myself-and-it-was-a-good-one | which is a warning sign I did not read at the time
then-i-ran-it-myself-from-the-wrong-folder | It could not find its own program.

## Stop 5: A path with two dots in it

I spent a day on the wrong diagnosis, and it isn't because I'm careless with data. The wrong diagnosis was a story about behavior, and I already had a moral ready for it.

A behavior story flatters you a little, even when it accuses you. It says the tool is sound and the human is weak, and I know how to fix that. More discipline, better nudges, a rule written down somewhere. A plumbing story says the tool never worked and you didn't check. There's no moral in that. There's only a path with two dots in it.

The lesson is smaller and less satisfying than my theory was. A measurement tells you what didn't happen. It will never tell you why. The gap between those two is exactly the size of a confident wrong answer. Every number I had was correct. The reading I laid on top of them was invented. It survived three weeks because it was plausible and because nobody, me included, ran the one command that would have killed it in five seconds.

Since the point is not trusting numbers you haven't checked, I had this note's numbers re-derived from the store before I wrote it. Two things came back that I'm obliged to say.

The first is that I labelled a number wrong. The two hundred and eighty-eight is the sum of the four other repositories in my table. It's not every session outside this site. That's three hundred and six, because three small workspaces never made the table. So there's a confession inside the confession. While writing up how I misread my measurement, I misread a different one, on the same page.

The second is that the counts from this site were pinned to that night and had already moved. The store held four hundred and fifty-four sessions then. It holds four hundred and sixty now. All six new ones landed in this repo, and none of them was product work.

That's the uncomfortable one, so I'll say it plainly. On that night, fifty-three of the hundred and forty-eight sessions here were about the workflow, the standards, the tooling or an audit, not anything a visitor would ever see. Roughly a third of the work was the machinery, not the thing the machinery is for. Of the six since, five were about the workflow. Measuring the loop is loop work. It got worse because I looked at it.

Here's what it says now. The path is fixed. The tool now resolves from an absolute path as a fourth rung, so the script finds its tooling from anywhere on this machine. It sits last on purpose, so a repo that carries its own copy still wins.

I pointed it at the client project, and for the first time in a hundred and sixty-five sessions it answered. Twenty-one checks, none failing, three due. A stale code graph, a missing end to end suite, and a context budget I'd blown by seven thousand characters. Nothing dramatic. All of it had been sitting there since early July, invisible, because the thing whose job was to say so couldn't open its mouth.

Eleven repositories now carry the config and the instructions, and the check reaches all of them. And I have to stop there, because that's a rollout and not a result. Calling a rollout a result is what I got wrong last time.

So it's a hypothesis with a date on it. If I run the same query in October and the four quiet repos are still quiet, my discipline theory was right and I owe it an apology. If they aren't, the check was simply never in the room. I don't know which yet.

For three weeks I had a number that looked exactly like an answer. It was a symptom, and I read it as a verdict. The check runs in that repo now. It took five seconds to find out it never had.

That closes this lesson. What comes next on the path picks up from here.

**Digest:** A measurement says what did not happen, never why. The behavior story was comfortable, and the cause was a relative path. A rollout is not a result until it is measured again.

**Trial:** Take one number you have quoted about your own work. Write down the date it was true, and the one command that would confirm or kill your reading of it.

**Runes:**
why-the-wrong-answer-was-so-comfortable | There is only a path with two dots in it.
what-i-still-cannot-reproduce-including-one-i-got-wrong-twice | Measuring the loop is loop work.
what-it-says-now | that is a rollout and not a result
