# One loop, every repo

Status: DRAFT script for Tjakoen to read aloud and edit. Cut into beats from the earlier narration; not yet read or checked by him.

How this script works. The note stays open on the page while the recording plays. Each beat is a short spoken line about one idea, and it names the phrase in the note that lights up while it plays. The wording is the earlier narration, cut to the lines that carry the idea. Format of a beat: a highlight line (section id, then a quote that must appear in that section of the note, or figure: and a figure name), then the spoken words.

## Stop 1: The week I could not explain my own work

**Beat 1**
highlight: the-week-i-couldnt-explain-my-own-work | It all worked. The tests were green.

There was a week where I looked at what had shipped across my repositories and could not, off the top of my head, explain half of it. It all worked. The tests were green. And I could feel a gap opening between the code that existed and the code I actually understood. The output went up and up. But output going up while understanding stays flat is not a productivity win. It is debt with a nice green dashboard on top. Ten times zero is still zero. The AI multiplies what I bring. If what I bring is a shrinking understanding of my own estate, then the faster it goes, the worse the problem gets.

**Beat 2**
highlight: first-an-honest-look-at-what-i-was-doing-wrong | The embarrassing part is that I had built the trap myself

The embarrassing part is that I built the trap myself, one reasonable decision at a time. Every repo worked a little differently. One kept its plans in a document. Another kept them in my head. A third kept them in whatever the last session's handoff prompt happened to capture. The deeper one was that "how I work with AI here" had a different answer in every folder, so nothing I learned in one repo made the next one safer. Twelve repos, twelve slightly different workflows, and me the only thing they had in common. One person can run a dozen repos only if the twelfth one behaves exactly like the first.

**Beat 3**
highlight: so-i-stopped-building-features-and-read | half, the "70 percent problem,"

The most useful was Addy Osmani's writing on what he calls loop engineering. It makes the case that durable AI work is built from a small set of reusable parts, not a clever prompt. He calls it the seventy percent problem, where an AI gets you most of the way and the last stretch is exactly where unmanaged work rots. A documentation standard from aerospace, written decades before the web, so that an aircraft maintenance manual reads the same in every hangar on earth. Plain verbs, one name for each thing, no decorative fog. The surprise is how well that discipline lands on a language model. Hand a machine a system to follow and it writes like it. Hand it a wish and it writes like a wish.

**Beat 4**
highlight: so-i-stopped-building-features-and-read | I stole the shape the field already agreed on

What I am about to describe is the earlier version of my loop. The principles still hold. One instruction file, one plan, one report, one session check, one human gate. So I did not invent a workflow. I stole the shape the field already agreed on, and made every one of my repos run it.

**Digest:** Output went up while my understanding stayed flat, and that is debt. Twelve repos ran twelve workflows. I borrowed a shared shape from loop engineering and from aerospace manuals instead of inventing one.

**Trial:** Pick two of your repos. Write down, for each, where its current plan lives. If the answers differ, you have found the first thing to fix.

**Runes:**
the-week-i-couldnt-explain-my-own-work | It all worked. The tests were green.
first-an-honest-look-at-what-i-was-doing-wrong | The embarrassing part is that I had built the trap myself
so-i-stopped-building-features-and-read | I stole the shape the field already agreed on

## Stop 2: A plan in a file, and a heartbeat at the desk

**Beat 1**
highlight: the-first-thing-i-fixed-was-where-the-plan-lives | plan per markdown file, in a plans folder

The obvious move would have been a better handoff prompt. I went the other way and took the plan out of the conversation entirely. One plan per markdown file, in a plans folder, with a small header. An id, a status of todo, doing, done or blocked, an optional track, what it depends on, what code it touches, and whose plan it is. The AI already edits markdown. It is the most native motion it has. So keeping a plan current costs it one line. It flips the status field in the file it is already working in.

**Beat 2**
highlight: the-first-thing-i-fixed-was-where-the-plan-lives | The board writes nothing. It is a window, not a database.

Then a separate little tool reads that folder and renders it as a kanban board in the browser, built out of my own design system. The board writes nothing. It is a window, not a database. Delete the tool and the plans are still sitting there as readable markdown in git. The output has provenance. The intent has none. The rest lands on me. I get to glance at a wall instead of interrogating a chat window. If I sold this as an AI productivity tool, I would be lying about which side the value falls on.

**Beat 3**
highlight: one-heartbeat-and-it-fires-while-im-already-working | The fix is not discipline, because discipline is exactly the thing

It did nothing about the chores nobody flips a status field for. The end-to-end suite, the lint pass, the audit that is three weeks overdue. The fix is not discipline, because discipline is exactly the thing that fails at 1am. The fix is to make skipping visible. Not at 3am. A robot that finds a problem in the middle of the night has nobody to hand it to, and its report competes with every other notification I ignore. The heartbeat fires when I am already working. A check on every push, and a doctor as the first thing every session does when I sit down. It is not clever. It is grep, exit codes and file-age math. Its whole job is to put the due work in front of the one person who is about to change the code anyway.

**Beat 4**
highlight: one-heartbeat-and-it-fires-while-im-already-working | the doctor; the doctor surfaces

Then the loop goes like this. The doctor surfaces what is due. A session drafts a fix on a branch. A second pass verifies it, never the one that wrote it. Then I land it. The loop drafts. The human, who still understands the code, lands. A green doctor is what day one done means for a new repo. A red one is a to-do list I did not have to remember to write.

**Digest:** Plans live in small markdown files the AI already edits. A board renders them and writes nothing back. A doctor fires when I sit down, so skipped chores become visible.

**Trial:** Write one plan for something you are doing this week as a markdown file with an id, a status and a checklist. Update its status once when you finish a step.

**Runes:**
the-first-thing-i-fixed-was-where-the-plan-lives | The board writes nothing. It is a window, not a database.
the-first-thing-i-fixed-was-where-the-plan-lives | The output has provenance. The intent has none.
one-heartbeat-and-it-fires-while-im-already-working | The fix is not discipline, because discipline is exactly the thing

## Stop 3: The contract, and the correction

**Beat 1**
highlight: the-contract-that-keeps-an-unattended-run-honest | None of it is exotic.

So there is a contract. It is deliberately mechanical, a checklist a run has to satisfy rather than a feeling I have about it. Before an unattended run starts, it states the files it may touch and the lines it may not cross. No merge, no push to the main branch, no deletes, nothing that reaches the outside world. A change is verified by a pass that did not write it. The author's own "looks right" does not count. None of it is exotic. It is human verification, written down so it happens the same way every time, instead of the way I feel like doing it at midnight.

**Beat 2**
highlight: what-i-am-honest-about | This is one person's estate, not a study.

This is one person's estate, not a study. It is not proof it scales to a team. Everything here works because there is exactly one human in the loop who still understands the code and gates every merge. Whether the same shape holds with five of those humans is a real open question, and I have not earned an answer yet. And then there is the correction, dated the twentieth of August. This note's subtitle says every one of my repositories runs the same workflow, and I wrote that believing it. Three weeks later I queried my own session store. The doctor had run once in a hundred and sixty-five sessions in my largest client project, and not at all in three of the others.

**Beat 3**
highlight: what-i-am-honest-about | script could not find its own program

It was not a discipline problem. The script could not find its own program from any directory except the one it was written beside. So it announced itself unavailable and exited quietly with a success code. The path is fixed and the rollout is real now. But a rollout is not a result. I left the sentence as published rather than editing it, because the gap between what I claimed and what was running is the more useful thing to keep.

**Beat 4**
highlight: where-that-leaves-me | It was to stop shipping things I could not explain.

The point of all this was never to ship more. It was to stop shipping things I could not explain. Now, when I sit down, the doctor tells me what is out of shape before I touch anything. When a run finishes, it hands me evidence instead of a shrug. And nothing reaches the main branch of any repo until I sign off. I can explain what shipped this week again. That is the whole win. The multiplier is real, and it is only worth having if you stay worth multiplying.

**Digest:** A run must bring evidence, stay inside a declared envelope, and be checked by a pass that did not write it. It is one person's estate, not a study. My own check once ran in one session out of a hundred and sixty-five, and I left that correction in.

**Trial:** Before your next AI run, write down the files it may touch and two lines it may not cross. Afterwards, check the run against that list.

**Runes:**
the-contract-that-keeps-an-unattended-run-honest | None of it is exotic.
what-i-am-honest-about | This is one person's estate, not a study.
where-that-leaves-me | It was to stop shipping things I could not explain.

## Stop 4: Watch its hands

**Beat 1**
highlight: intro | Nobody has ever learned anything from my finished repo.

The piece of a lab session that actually lands is never the explaining. It is the twenty minutes where I put my screen up and build the thing badly in front of everyone. I typo. I rename a variable because the first name was dumb. Nobody has ever learned anything from my finished repo. You do not learn the piano from a recording. You learn it sitting next to someone, in the same room, watching their hands.

**Beat 2**
highlight: most-ai-is-a-recording | both of them put the work offstage.

Most AI right now is a recording. Two shapes dominate, and both of them put the work offstage. You describe what you want, it goes away, and it comes back with an answer and a tidy paragraph about what it did. When it is right, you got a result. You did not get a demonstration. Nothing on the screen moved. The only record is its own account of itself, which is exactly the witness you would least like to rely on. The model looks at your screen, finds the button and moves the mouse. It imitates a person. That is impressive, and it is also backwards.

**Beat 3**
highlight: so-i-built-the-boring-version | Same object. Same list. Same

It is a design system called GRAIN, and there is no clever agent in it. The interface publishes a short, fixed list of things that can be done, and a list of places they can be done to. Not selectors, not coordinates, but names. The list is generated from the component tree itself, so it cannot quietly drift out of date. Same buttons. When I click, the app does not change anything directly. It writes down what I meant and submits it. When the AI decides, it does the same. Same object, same list, same checks. So the AI has no move available to it that I do not also have. Not because it was politely asked to stay in its lane, but because there is no other lane.

**Beat 4**
highlight: so-i-built-the-boring-version | One door, one writer.

One way in. Every request goes through a single endpoint, and a single component is allowed to change anything. One door, one writer. That sounds like a bottleneck, and it is. That is the feature. Every action went past one checkpoint, wearing a name, tagged with who sent it, so the AI's activity narrates itself for free. When the AI writes text, the text comes out slightly grainy, because the font has grades for it. A button it touched gets a dashed edge. A field it filled gets a dashed border. And the grain stays, until a human takes it over and settles it clean.

**Digest:** Most AI works offstage, as a sidebar or as a cursor imitating a person. I built the boring version instead. Same buttons, one door, and the AI leaves its handwriting on everything it touches.

**Trial:** Open any AI tool you use and ask it to change one thing for you. Afterwards, write down what you could actually see it do, apart from its own summary.

**Runes:**
intro | Nobody has ever learned anything from my finished repo.
most-ai-is-a-recording | both of them put the work offstage.
so-i-built-the-boring-version | One door, one writer.

## Stop 5: What I have not earned

**Beat 1**
highlight: what-i-have-not-earned | same list and driving part

A small model now runs entirely in your browser, on your own hardware, with no server. It is WebLLM, reading that same list and driving part of it end to end through the same door. That was the milestone I was most nervous about, and it is met. It is also narrow. It handles navigation and choices, and its command of the full vocabulary is unproven. It is proof that a real model can operate the thing at all. It is not proof that the vocabulary is a good general instruction set.

**Beat 2**
highlight: what-i-have-not-earned | Writing the design costs nothing.

The claims I would most like to make are the ones I cannot. That watching an AI operate visible controls gives you better expectations of it than a chat agent does. That the grain gets noticed and read correctly, including by people with low vision, where the research warns that visual-only cues get missed constantly. That you actually learn the task from watching. Those are hypotheses about people, and the only way to settle one is a study with people in it, which I have not run. I have written the design for it. Writing the design costs nothing.

**Beat 3**
highlight: what-i-have-not-earned | And I am not first.

And I am not first. My first search for prior art came back empty, and I got briefly pleased with myself. A second sweep a few days later turned up Builder.io's Agent-Native, shipped, holding two of my three pieces. It carries no provenance surface at all, so the combination still stands. But "nobody is near this" turned into "several people are near this" in about seventy-two hours. Pretending otherwise would have been the cheapest possible way to lose the argument.

**Beat 4**
highlight: watch-its-hands | None of this makes the AI smarter.

None of this makes the AI smarter. That was never the goal, and I am fairly convinced that goal is mostly a distraction anyway. Ten times zero is still zero. What it does is put the machine in the room. Same instrument, same keys, in front of you, with its fingerprints on every key it pressed. When it is right, you can see how. When it is wrong, you can see where, and you can reach over and take the keyboard back. I still cannot prove that watching teaches you anything. I only know it is the one thing that has ever worked in my classroom.

**Digest:** The door, the list and the grain are built and tested. A small in-browser model drives part of it, narrowly. Whether watching teaches anyone is a hypothesis I have not tested with people.

**Trial:** Pick one claim you make about a tool you built. Sort it into either shown, with a test or a receipt, or hoped for, and say which out loud.

**Runes:**
what-i-have-not-earned | Writing the design costs nothing.
what-i-have-not-earned | And I am not first.
watch-its-hands | None of this makes the AI smarter.
