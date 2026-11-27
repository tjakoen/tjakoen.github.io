# One loop, every repo

Status: DRAFT script for Tjakoen to read aloud and edit. Written from the note; not yet read or checked by him.

## Stop 1: The week I could not explain my own work

A quick word on where this sits. What I am about to describe is the earlier version of my loop. The principles still hold. One instruction file, one plan, one report, one session check, one human gate. What changed later is the harness and the model layer, and that has its own lessons. This one is the long version of the principles.

There was a week where I looked at what had shipped across my repositories and could not, off the top of my head, explain half of it. It all worked. The tests were green. And I could feel a gap opening between the code that existed and the code I actually understood.

That is a strange kind of fear, because on paper it looks like success. I run about a dozen repositories now, mostly alone, mostly with an AI doing a real share of the typing. The output went up and up. But output going up while understanding stays flat is not a productivity win. It is debt with a nice green dashboard on top. You can run a repo you no longer understand right up until the day you have to fix it.

I have a maxim for this, worn smooth from teaching it. Ten times zero is still zero. The AI multiplies what I bring. If what I bring is a shrinking understanding of my own estate, then the faster it goes, the worse the problem gets. The speed was never the thing to protect. The understanding was.

The embarrassing part is that I built the trap myself, one reasonable decision at a time.

Every repo worked a little differently. One kept its plans in a document. Another kept them in my head. A third kept them in whatever the last session's handoff prompt happened to capture. Every session opened with me asking the machine where we were, and the machine reading four notebooks to work out an answer it had worked out yesterday.

That was one symptom. The deeper one was that "how I work with AI here" had a different answer in every folder, so nothing I learned in one repo made the next one safer. Twelve repos, twelve slightly different workflows, and me the only thing they had in common. One person can run a dozen repos only if the twelfth one behaves exactly like the first.

So instead of adding more, I went and read the people who had thought about this harder than I had.

The most useful was Addy Osmani's writing on what he calls loop engineering. It makes the case that durable AI work is built from a small set of reusable parts, not a clever prompt. His companion book carries the harder half. He calls it the seventy percent problem, where an AI gets you most of the way and the last stretch is exactly where unmanaged work rots. And he argues that quality gates are not optional. That is the writing that named the fear I already had.

The other source was older and stranger. A documentation standard from aerospace, written decades before the web, so that an aircraft maintenance manual reads the same in every hangar on earth. Plain verbs, one name for each thing, no decorative fog. The surprise is how well that discipline lands on a language model. Hand a machine a system to follow and it writes like it. Hand it a wish and it writes like a wish.

So I did not invent a workflow. I stole the shape the field already agreed on, and made every one of my repos run it.

Next, the first thing I actually changed, which was where the plan lives.

**Digest:** Output went up while my understanding stayed flat, and that is debt. Twelve repos ran twelve workflows. I borrowed a shared shape from loop engineering and from aerospace manuals instead of inventing one.

**Trial:** Pick two of your repos. Write down, for each, where its current plan lives. If the answers differ, you have found the first thing to fix.

**Runes:**
the-week-i-couldnt-explain-my-own-work | It all worked. The tests were green.
first-an-honest-look-at-what-i-was-doing-wrong | The embarrassing part is that I had built the trap myself
so-i-stopped-building-features-and-read | I stole the shape the field already agreed on

## Stop 2: A plan in a file, and a heartbeat at the desk

The obvious move would have been a better handoff prompt. I went the other way and took the plan out of the conversation entirely.

One plan per markdown file, in a plans folder, with a small header. An id, a status of todo, doing, done or blocked, an optional track, what it depends on, what code it touches, and whose plan it is. The body is prose and a checklist. That is the whole format, and the smallness is the design.

The AI already edits markdown. It is the most native motion it has. So keeping a plan current costs it one line. It flips the status field in the file it is already working in. No plugin, no API, no new tool for the machine to learn. The discipline rides on a motion that already exists, and that is the only kind of discipline that survives a long session.

Then a separate little tool reads that folder and renders it as a kanban board in the browser, built out of my own design system. The board writes nothing. It is a window, not a database. Delete the tool and the plans are still sitting there as readable markdown in git. I called it PROOF, because the stack it joins is already named batch, grain and mill, and I have committed to the bread thing well past the point of dignity.

Here is why I bothered. The output has provenance. The intent has none. I had spent months on a design system where the machine's work is visible on the surface. Text the AI wrote renders with a grain to it, and text a human settled renders clean. Meanwhile the most important thing in the room, the plan, lived wherever the last conversation left it. I could watch the AI's hands on the keys and still had to ask it what it thought it was doing.

The first thing on that board was the plan for building the board. That is either a good sign or a closed loop with delusions of grandeur.

I should be honest about who this helps, because the split is lopsided. The AI never looks at the board. Its share is real but modest. A cheaper start to each session, a ground truth two parallel sessions cannot argue about, and plans forced into pieces small enough to have a status. The rest lands on me. I get to glance at a wall instead of interrogating a chat window. If I sold this as an AI productivity tool, I would be lying about which side the value falls on.

The wall fixed where the plan lives. It did nothing about the chores nobody flips a status field for. The end-to-end suite, the lint pass, the audit that is three weeks overdue. The fix is not discipline, because discipline is exactly the thing that fails at 1am. The fix is to make skipping visible.

So there is a heartbeat, and the important choice was when it beats. Not at 3am. A robot that finds a problem in the middle of the night has nobody to hand it to, and its report competes with every other notification I ignore. The heartbeat fires when I am already working. A check on every push, and a doctor as the first thing every session does when I sit down.

It is not clever. It is grep, exit codes and file-age math. Its whole job is to put the due work in front of the one person who is about to change the code anyway.

Then the loop goes like this. The doctor surfaces what is due. A session drafts a fix on a branch. A second pass verifies it, never the one that wrote it. Then I land it. The loop drafts. The human, who still understands the code, lands.

That doctor is part of my own tooling now. I can point it at any repo and ask what is out of shape. A green doctor is what day one done means for a new repo. A red one is a to-do list I did not have to remember to write.

Next, what keeps a run honest when I am not watching it.

**Digest:** Plans live in small markdown files the AI already edits. A board renders them and writes nothing back. A doctor fires when I sit down, so skipped chores become visible.

**Trial:** Write one plan for something you are doing this week as a markdown file with an id, a status and a checklist. Update its status once when you finish a step.

**Runes:**
the-first-thing-i-fixed-was-where-the-plan-lives | The board writes nothing. It is a window, not a database.
the-first-thing-i-fixed-was-where-the-plan-lives | The output has provenance. The intent has none.
one-heartbeat-and-it-fires-while-im-already-working | The fix is not discipline, because discipline is exactly the thing

## Stop 3: The contract, and the correction

The heartbeat surfaces the work. Something else had to keep the doing of it honest, because the moment an AI touches code without me watching every keystroke, "trust me" is carrying all the weight. So there is a contract. It is deliberately mechanical, a checklist a run has to satisfy rather than a feeling I have about it.

The first part is evidence or it did not happen. A run claims the plan item before it edits. It leaves a short note at each real decision. And it closes with a report that carries the actual gate output, not the phrase "tests pass." A report that lists only wins is a report that is hiding something. It also has to say what it did not do, and what needs my eyes.

The second part is a declared envelope. Before an unattended run starts, it states the files it may touch and the lines it may not cross. No merge, no push to the main branch, no deletes, nothing that reaches the outside world. The loop drafts. A human lands. Those are absolute, not defaults.

The third part is no grading your own homework. A change is verified by a pass that did not write it. The author's own "looks right" does not count. That is the one rule that keeps a fast loop from confidently shipping its own mistakes. It is the same wall I put between the AI and my students, just pointed at my own code.

None of it is exotic. It is human verification, written down so it happens the same way every time, instead of the way I feel like doing it at midnight.

Now the honest part. This is one person's estate, not a study. It is not proof it scales to a team. Everything here works because there is exactly one human in the loop who still understands the code and gates every merge. Whether the same shape holds with five of those humans is a real open question, and I have not earned an answer yet. The books I leaned on were still being read as I wrote this, so it is a living base, not a finished theory.

And then there is the correction, dated the twentieth of August. This note's subtitle says every one of my repositories runs the same workflow, and I wrote that believing it. Three weeks later I queried my own session store. The doctor had run once in a hundred and sixty-five sessions in my largest client project, and not at all in three of the others.

It was not a discipline problem. The script could not find its own program from any directory except the one it was written beside. So it announced itself unavailable and exited quietly with a success code. The path is fixed and the rollout is real now. But a rollout is not a result. I left the sentence as published rather than editing it, because the gap between what I claimed and what was running is the more useful thing to keep. That story has its own note.

I also chose not to build the one piece everyone assumes you want, the scheduled agent that runs at night. I do not have one, on purpose. A check I will act on is a check that fires while I am already at the desk. A check that fires while I am asleep is a report I will read the way I read every other 3am notification, which is not at all.

So where does that leave me? The point of all this was never to ship more. It was to stop shipping things I could not explain. Now, when I sit down, the doctor tells me what is out of shape before I touch anything. When a run finishes, it hands me evidence instead of a shrug. And nothing reaches the main branch of any repo until I sign off.

I can explain what shipped this week again. That is the whole win. The multiplier is real, and it is only worth having if you stay worth multiplying.

Next, this lesson moves to a second note, about why I want to see the AI work at all.

**Digest:** A run must bring evidence, stay inside a declared envelope, and be checked by a pass that did not write it. It is one person's estate, not a study. My own check once ran in one session out of a hundred and sixty-five, and I left that correction in.

**Trial:** Before your next AI run, write down the files it may touch and two lines it may not cross. Afterwards, check the run against that list.

**Runes:**
the-contract-that-keeps-an-unattended-run-honest | None of it is exotic.
what-i-am-honest-about | This is one person's estate, not a study.
where-that-leaves-me | It was to stop shipping things I could not explain.

## Stop 4: Watch its hands

This stop moves to a different note, Watch Its Hands. It is the plain version of a research paper I wrote about letting an AI press the same buttons I press.

I teach software engineering part-time. The piece of a lab session that actually lands is never the explaining. It is the twenty minutes where I put my screen up and build the thing badly in front of everyone. I typo. I read the error out loud. I rename a variable because the first name was dumb. Nobody has ever learned anything from my finished repo.

You do not learn the piano from a recording. You learn it sitting next to someone, in the same room, watching their hands.

That sentence is the whole reason the whitepaper exists. The paper says it in about twenty-eight minutes of careful academic hedging. This note says it in seven.

Most AI right now is a recording. Two shapes dominate, and both of them put the work offstage.

The first is the assistant in the sidebar. You describe what you want, it goes away, and it comes back with an answer and a tidy paragraph about what it did. When it is right, you got a result. You did not get a demonstration. Nothing on the screen moved. The only record is its own account of itself, which is exactly the witness you would least like to rely on.

The second is the computer-use agent. The model looks at your screen, finds the button and moves the mouse. It imitates a person. That is impressive, and it is also backwards. The model is reverse-engineering an interface designed for eyes and hands, guessing at pixels, while your role shrinks to writing instructions and watching a cursor twitch. It works right up until it clicks the wrong thing, and then you are debugging a screenshot.

Neither is a bad idea. They both answer "how do we let the AI use software built for humans." I got interested in a different question. What if the software were built for both of us from the start, and neither of us got a shortcut?

So I built the boring version. It is a design system called GRAIN, and there is no clever agent in it. The interface publishes a short, fixed list of things that can be done, and a list of places they can be done to. Not selectors, not coordinates, but names. Open this. Choose that. Set this field. The list is generated from the component tree itself, so it cannot quietly drift out of date.

Then three rules, and the first one carries most of the weight.

Same buttons. When I click, the app does not change anything directly. It writes down what I meant and submits it. When the AI decides, it does the same. Same object, same list, same checks. So the AI has no move available to it that I do not also have. Not because it was politely asked to stay in its lane, but because there is no other lane. It cuts the other way too. My click is a request, same as its decision. Nobody reaches into the database from the couch.

One way in. Every request goes through a single endpoint, and a single component is allowed to change anything. One door, one writer. That sounds like a bottleneck, and it is. That is the feature. Every action went past one checkpoint, wearing a name, tagged with who sent it, so the AI's activity narrates itself for free. I will admit one seam. Content you own outright, like your own notes and preferences, can take a direct route. And there are two old direct-write routes still in the demo app from before the door existed, being walked back. I would rather say that than have you find it.

It leaves its handwriting. When the AI writes text, the text comes out slightly grainy, because the font has grades for it. A button it touched gets a dashed edge. A field it filled gets a dashed border. And the grain stays, until a human takes it over and settles it clean. No badge, no sparkle icon. The content is the label.

Next, the part I have not proven.

**Digest:** Most AI works offstage, as a sidebar or as a cursor imitating a person. I built the boring version instead. Same buttons, one door, and the AI leaves its handwriting on everything it touches.

**Trial:** Open any AI tool you use and ask it to change one thing for you. Afterwards, write down what you could actually see it do, apart from its own summary.

**Runes:**
intro | Nobody has ever learned anything from my finished repo.
most-ai-is-a-recording | both of them put the work offstage.
so-i-built-the-boring-version | One door, one writer.

## Stop 5: What I have not earned

I said this would be the honest version, so here it is.

The architecture I can show you. The door is enforced, the list is validated, and the grain is stamped on the server and tested against spoofing. The tests are in the repo. Fine.

A small model now runs entirely in your browser, on your own hardware, with no server. It is WebLLM, reading that same list and driving part of it end to end through the same door. That was the milestone I was most nervous about, and it is met. It is also narrow. It handles navigation and choices, and its command of the full vocabulary is unproven. It is proof that a real model can operate the thing at all. It is not proof that the vocabulary is a good general instruction set.

The claims I would most like to make are the ones I cannot. That watching an AI operate visible controls gives you better expectations of it than a chat agent does. That the grain gets noticed and read correctly, including by people with low vision, where the research warns that visual-only cues get missed constantly. That you actually learn the task from watching. Those are hypotheses about people, and the only way to settle one is a study with people in it, which I have not run. I have written the design for it. Writing the design costs nothing.

And I am not first. My first search for prior art came back empty, and I got briefly pleased with myself. A second sweep a few days later turned up Builder.io's Agent-Native, shipped, holding two of my three pieces. It carries no provenance surface at all, so the combination still stands. But "nobody is near this" turned into "several people are near this" in about seventy-two hours. Pretending otherwise would have been the cheapest possible way to lose the argument.

None of this makes the AI smarter. That was never the goal, and I am fairly convinced that goal is mostly a distraction anyway. Ten times zero is still zero. A genius working behind a curtain is worth less to me than a mediocre one working on the desk.

What it does is put the machine in the room. Same instrument, same keys, in front of you, with its fingerprints on every key it pressed. When it is right, you can see how. When it is wrong, you can see where, and you can reach over and take the keyboard back. That is very hard to do with a paragraph explaining what already happened somewhere else.

I still cannot prove that watching teaches you anything. I only know it is the one thing that has ever worked in my classroom.

That closes this lesson. Next time you hand an AI a task, ask where on the screen you could have watched it happen.

**Digest:** The door, the list and the grain are built and tested. A small in-browser model drives part of it, narrowly. Whether watching teaches anyone is a hypothesis I have not tested with people.

**Trial:** Pick one claim you make about a tool you built. Sort it into either shown, with a test or a receipt, or hoped for, and say which out loud.

**Runes:**
what-i-have-not-earned | Writing the design costs nothing.
what-i-have-not-earned | And I am not first.
watch-its-hands | None of this makes the AI smarter.
