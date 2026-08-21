---
title: "I Was Shipping Faster Than I Could Understand It"
subtitle: "I run about a dozen repositories with an AI, and one week I realized I could no longer explain half of what had shipped. So I stopped adding features and built one workflow every repo runs the same way: a doctor that fires when I sit down, a contract that keeps an unattended run honest, and a rule that nothing lands until a human who still understands it says so."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-07-30
readingTime: "~10 min"
tags: [ai, workflow, process, developer-tools, standards, planning]
summary: >
  How I got back on top of AI-assisted work across a dozen repos: one shared workflow instead of a
  dozen improvised ones. Plan state moved out of chat and into markdown files the AI already edits,
  with a board that renders them and writes nothing back. A work-triggered heartbeat (a doctor at
  every session start, CI on every push) that makes skipped chores visible. An accountability
  contract (a run ledger, declared rails, and verification by a second pass) that keeps an
  unattended run honest, and a documentation discipline borrowed from aerospace manuals and from
  Addy Osmani's writing on loop engineering. One person applying the shape the field agrees on,
  honest that it isn't proof it scales to a team.
---

## The week I couldn't explain my own work

There was a week where I looked at what had shipped across my repositories and could not, off the top
of my head, explain half of it. It all worked. The tests were green. And I could feel a gap opening
between the code that existed and the code I actually understood.

That is a strange kind of fear, because on paper it looks like success. I run about a dozen
repositories now, mostly alone, mostly with an AI doing a real share of the typing. The output went
up and up. But output going up while comprehension stays flat is not a productivity win. It is debt
with a nice green dashboard on top, and you can run a repo you no longer understand right up until the
day you have to fix it.

I have a maxim for this, worn smooth from teaching it: [ten times zero is still zero.](ten-times-zero.md)
The AI multiplies what I bring. If what I bring is a shrinking understanding of my own estate, then
the faster it goes, the worse the problem gets. The speed was never the thing to protect. The
comprehension was.

## First, an honest look at what I was doing wrong

The embarrassing part is that I had built the trap myself, one reasonable decision at a time.

Every repo worked a little differently. This one kept its plans in a document, that one in my head,
a third in whatever the last session's handoff prompt happened to capture. Every session opened with
me asking the machine where we were, and the machine reading four notebooks to work out an answer it
had worked out yesterday. That was one symptom. The deeper one was that
"how I work with AI here" was a different answer in every folder, so nothing I learned in one repo
made the next one safer. Twelve repos, twelve slightly different workflows, and me the only thing they
had in common. One person can run a dozen repos only if the twelfth one behaves exactly like the
first.

## So I stopped building features and read

Instead of adding more, I went and read the people who had thought about this harder than I had.

The most useful was Addy Osmani's writing on what he calls
[loop engineering](https://addyosmani.com/blog/loop-engineering/): the case that durable AI work is
built from a small set of reusable parts, not a clever prompt. His companion book carries the harder
half, the "70 percent problem," where an AI gets you most of the way and the last stretch is exactly
where unmanaged work rots, and the argument that quality gates are not optional. That is the writing
that named the fear I already had.

The other source was older and stranger: a documentation standard from aerospace, the kind written
decades before the web so that an aircraft maintenance manual reads the same in every hangar on earth.
Plain verbs, one name for each thing, no decorative fog. The surprise is how well that discipline
lands on a language model. Hand a machine a *system* to follow and it writes like it. Hand it a wish
and it writes like a wish. Writing things down the same way every time turns out to be the whole game,
whether the reader is a mechanic or a model.

So I did not invent a workflow. I stole the shape the field already agreed on, and made every one of
my repos run it.

## The first thing I fixed was where the plan lives

The obvious move would have been a better handoff prompt. I went the other way and took the plan out
of the conversation entirely.

One plan per markdown file, in a plans folder, with a small frontmatter: an id, a status (todo,
doing, done, blocked), an optional track, what it depends on, what code it touches, and whose plan it
is. The body is prose and a checklist. That is the whole format, and the smallness is the design.

The AI already edits markdown. It is the most native motion it has. So keeping a plan current costs
it one line: flip the status field in the file it is already working in. No plugin, no API, no new
tool for the machine to learn. The discipline rides on a motion that already exists, which is the
only kind of discipline that survives a long session.

Then a separate little tool reads that folder and renders it as a kanban board in the browser, built
out of my own design system. The board writes nothing. It is a window, not a database. Delete the
tool and the plans are still sitting there as readable markdown in git, which is exactly where they
were all along. I called it [PROOF](/proof), because the stack it joins is already named batch,
grain and mill, and I have committed to the bread thing well past the point of dignity.

> The output has provenance. The intent has none.

That line is why I bothered. I had spent months on a design system where the machine's work is
visible on the surface: text the AI wrote renders with a grain to it, text a human settled renders
clean. The whole thesis is that you should be able to *look* at software and see whose hand did
what. Meanwhile the most important artifact in the room, the plan, lived wherever the last
conversation happened to leave it. I could watch the AI's hands on the keys and still had to ask it
what it thought it was doing.

<svg viewBox="0 0 467 266" width="100%" role="img"
     aria-label="The AI edits plans markdown files and a human edits the same files; a parser turns them into a derived index, which becomes the board in the browser, alongside the git log. The board is a window onto the index, never a store."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-plans0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="16" y="16" width="153" height="36" rx="6"/>
    <rect x="203" y="16" width="207" height="36" rx="6"/>
    <rect x="165" y="82" width="69" height="36" rx="6"/>
    <rect x="122" y="214" width="155" height="36" rx="6"/>
    <rect x="380" y="161" width="71" height="36" rx="6"/>
  </g>
  <rect x="143" y="148" width="113" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="121" y1="52" x2="171" y2="82" marker-end="url(#fl-plans0)"/>
    <line x1="278" y1="52" x2="228" y2="82" marker-end="url(#fl-plans0)"/>
    <line x1="200" y1="118" x2="200" y2="148" marker-end="url(#fl-plans0)"/>
    <line x1="200" y1="184" x2="200" y2="214" marker-end="url(#fl-plans0)"/>
    <line x1="380" y1="188" x2="272" y2="214" marker-end="url(#fl-plans0)"/>
    <path d="M122,232 C92,232 92,166 143,166" marker-end="url(#fl-plans0)" stroke-dasharray="5 4"/>
  </g>
  <g text-anchor="middle">
    <text x="93" y="38.3" style="fill:var(--color-fg)">AI edits plans/*.md</text>
    <text x="307" y="38.3" style="fill:var(--color-fg)">a human edits the same files</text>
    <text x="200" y="104.3" style="fill:var(--color-fg)">parser</text>
    <text x="200" y="170.3" style="fill:var(--color-bg)">derived index</text>
    <text x="200" y="236.3" style="fill:var(--color-fg)">board in the browser</text>
    <text x="415" y="183.5" style="fill:var(--color-fg)">git log</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="83" y="199" transform="rotate(-90 83 199)">a window, never a store</text>
  </g>
</svg>

The first thing on [that board](/plans) was the plan for building the board, which is either a good
sign or a closed loop with delusions of grandeur. Either way it has been a while since a session
opened with anyone asking where we were.

I should be honest about who this helps, because the split is lopsided. The AI never looks at the
board. Its share is real but modest: a cheaper start to each session, a ground truth two parallel
sessions cannot argue about, and plans forced into pieces small enough to have a status at all. The
rest lands on me. I get to glance at a wall instead of interrogating a chat window. If I sold this as
an AI productivity tool I would be lying about which side of it the value falls on.

The wall fixed where the plan lives. It did nothing about the chores nobody flips a status field for.

## One heartbeat, and it fires while I'm already working

The chores that get skipped are the boring recurring ones: the end-to-end suite, the lint pass, the
audit that is three weeks overdue. The fix is not discipline, because discipline is exactly the thing
that fails at 1am. The fix is to make skipping *visible*.

So there is a heartbeat, and the important choice was when it beats. Not at 3am. A robot that finds a
problem in the middle of the night has nobody to hand it to, and its report competes with every other
notification I ignore. The heartbeat fires when I am *already working*: a check on every push, and a
doctor as the first thing every session does when I sit down. It is not clever. It is grep, exit
codes, and file-age math. Its whole job is to put the due work in front of the one person who is about
to change the code anyway.

<svg viewBox="0 0 300 348" width="100%" role="img"
     aria-label="The work-triggered loop: a push or a session start fires the doctor; the doctor surfaces what's due, such as drift, a stale audit, or missing tests; a working session drafts a fix on a branch; a second pass verifies it, never the one that wrote it; then I land it, and the loop returns to the start. Nothing lands unread."
     style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-loop0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="55" y="16" width="190" height="36" rx="6"/>
    <rect x="35" y="78" width="230" height="52" rx="6"/>
    <rect x="45" y="156" width="210" height="36" rx="6"/>
    <rect x="35" y="218" width="230" height="52" rx="6"/>
  </g>
  <rect x="90" y="296" width="120" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="150" y1="52" x2="150" y2="78" marker-end="url(#fl-loop0)"/>
    <line x1="150" y1="130" x2="150" y2="156" marker-end="url(#fl-loop0)"/>
    <line x1="150" y1="192" x2="150" y2="218" marker-end="url(#fl-loop0)"/>
    <line x1="150" y1="270" x2="150" y2="296" marker-end="url(#fl-loop0)"/>
    <path d="M90,314 C20,314 20,34 55,34" marker-end="url(#fl-loop0)"/>
  </g>
  <g text-anchor="middle">
    <text x="150" y="38.3" style="fill:var(--color-fg)">A push, or a session starts</text>
    <text x="150" y="100.3" style="fill:var(--color-fg)">The doctor surfaces what's due</text>
    <text x="150" y="116.8" style="fill:var(--color-muted);font-size:12px">drift, a stale audit, missing tests</text>
    <text x="150" y="178.3" style="fill:var(--color-fg)">A session drafts a fix on a branch</text>
    <text x="150" y="240.3" style="fill:var(--color-fg)">A second pass verifies it</text>
    <text x="150" y="256.8" style="fill:var(--color-muted);font-size:12px">never the one that wrote it</text>
    <text x="150" y="318.3" style="fill:var(--color-bg)">I land it</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="27" y="174" transform="rotate(-90 27 174)">nothing lands unread</text>
  </g>
</svg>

*The loop drafts. The human, who still understands the code, lands.*

The little program that runs the checks is part of my own tooling now, a doctor I can point at any
repo to ask "what is out of shape here." A green doctor is what "day one done" means for a new repo. A
red one is a to-do list I did not have to remember to write.

## The contract that keeps an unattended run honest

The heartbeat surfaces the work. A separate thing had to keep the *doing* of it honest, because the
moment an AI touches code without me watching every keystroke, "trust me" is carrying all the weight.
So there is a contract, and it is deliberately mechanical, a checklist a run has to satisfy rather
than a feeling I have about it.

- **Evidence or it didn't happen.** A run claims the plan item before it edits, leaves a short note at
  each real decision, and closes with a report that carries the actual gate output, not the phrase
  "tests pass." A report that lists only wins is a report that is hiding something. It also has to say
  what it did *not* do, and what needs my eyes.
- **A declared envelope.** Before an unattended run starts, it states the files it may touch and the
  lines it may not cross: no merge, no push to the main branch, no deletes, nothing that reaches the
  outside world. The loop drafts. A human lands. Those are absolute, not defaults.
- **No grading your own homework.** A change is verified by a pass that did *not* write it. The
  author's own "looks right" does not count, which is the one rule that keeps a fast loop from
  confidently shipping its own mistakes. It is the same wall I put between the AI and my students, just
  pointed at my own code.

None of it is exotic. It is human verification, written down so it happens the same way every time
instead of the way I feel like doing it at midnight.

## What I am honest about

This is one person's estate, not a study. Two things I will not overclaim.

It is not proof it scales to a team. Everything here works because there is exactly one human in the
loop who still understands the code and gates every merge. Whether the same shape holds when there are
five of those humans is a real open question, and I have not earned an answer to it yet. And the books
I leaned on are still being read as I write this, so this is a living base, not a finished theory.
I am reporting a change that worked for me, with the seams showing.

**A correction, dated the twentieth of August.** The subtitle of this note says every one of my
repositories runs the same workflow, and I wrote that sentence believing it. Three weeks later I
queried my own session store and found the doctor had run once in a hundred and sixty-five sessions
in my largest client project, and not at all in three of the others. It was not a discipline problem.
The script could not find its own program from any directory except the one it was written beside, so
it announced itself unavailable and exited quietly with a success code. The path is fixed and the
rollout is real now, but a rollout is not a result, which is exactly the mistake the sentence above
makes. I am leaving it as published rather than editing it, because the gap between what I claimed
and what was running is the more useful artifact. The whole thing, including the day I spent
explaining the silence with a theory about discipline, is in
[The Check Ran Once in 165 Sessions](the-check-that-never-ran.md).

I also chose *not* to build the one piece everyone assumes you want: the scheduled agent that runs at
night. I do not have one, on purpose. A check I will actually act on is a check that fires while I am
already at the desk. A check that fires while I am asleep is a report I will read the way I read every
other 3am notification, which is not at all.

## Where that leaves me

The point of all this was never to ship more. It was to stop shipping things I could not explain. So
now, when I sit down, the doctor tells me what is out of shape before I touch anything. When a run
finishes, it hands me evidence instead of a shrug. And nothing reaches the main branch of any repo
until I, the one human who still has to understand it, sign off.

I can explain what shipped this week again. That is the whole win, and it is the same one from the
classroom, pointed at myself: the multiplier is real, and it is only worth having if you stay worth
multiplying.

Since writing this I have taken the same shape and asked what it would look like at the scale of an
engineering organization rather than one person with a dozen repositories. That is
[Everybody Wants the Agent](build-the-floor.md): the same argument about verification and legibility,
turned into a roadmap, with the research behind it and the parts that broke on me left in.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
