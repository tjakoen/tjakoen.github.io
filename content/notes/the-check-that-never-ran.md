---
title: "The Check Ran Once in 165 Sessions, and I Got the Reason Wrong"
subtitle: "Six weeks after I published a note saying every one of my repos runs the same workflow, I finally measured it. It was living in one. I spent most of a day building a thoughtful theory about why, and the real answer was a relative file path."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-08-20
readingTime: "~7 min"
tags: [ai, workflow, measurement, process, standards]
summary: >
  I built a check that fires when I sit down to work, rolled it across a dozen repositories, and
  wrote a note about it. Six weeks later my session store said it had run exactly once outside the
  repo where it was built. The obvious reading was a discipline problem, and I argued myself into
  it for most of a day before running the check by hand from the wrong folder and watching it fail
  to find its own program. It had never been able to start, in any repo but the one it was written
  beside. What the numbers measured was real. The reason I hung on them was invented, and it held up
  for six weeks because it was plausible and nobody ran the command that would have killed it.
---

## One run in a hundred and sixty-five sessions

Here is the query I ran on a Wednesday night, six weeks after publishing a note about how well my
workflow was going.

One hundred and sixty-five AI sessions in my largest client project since early July. One of them
ran the check that is supposed to fire at the start of every single one.

Not one in ten. One.

I had built that check for a reason I still believe in, and I had written it up in
[I Was Shipping Faster Than I Could Understand It](one-loop-every-repo.md), where I said, in those
words, that I had made every one of my repos run it. That sentence was published on the thirtieth of
July. The number above is what it looked like on the nineteenth of August.

Across the four other repositories my table named, the picture was flatter still. Two hundred and
eighty-eight sessions between them. One doctor run, the one above. Zero run reports, which are the
short evidence notes a session is supposed to leave behind when it finishes. Meanwhile this site,
where the whole thing was built, had eighty-seven sessions that ran it and sixty-two that wrote a
report. All of those are a snapshot taken on the nineteenth of August rather than a standing count,
and I will come back to why that matters more than it sounds.

<svg viewBox="0 0 620 302" width="100%" role="img"
     aria-label="Five repositories, showing total AI sessions and how many of them ran the session-start check, measured 2026-08-19. A client project: 165 sessions, 1 ran the check. This site: 148 sessions, 87 ran the check. A teaching repo: 55 sessions, none. A side project: 42 sessions, none. An internal tool: 26 sessions, none. In four of the five the check was never able to start."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;
            --paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--bar:#cbc1b3;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="301" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="30" style="fill:var(--muted);font-size:15px">Sessions per repository, and how many ran the check</text>
  <text x="28" y="48" style="fill:var(--muted);font-size:12.5px">Measured 2026-08-19. Bar length is sessions; the filled part ran the check.</text>

  <rect x="190" y="68" width="355" height="16" style="fill:var(--bar)"/>
  <rect x="190" y="68" width="2" height="16" style="fill:var(--ink)"/>
  <text x="28" y="80" style="fill:var(--ink);font-size:14px">a client project</text>
  <text x="28" y="95" style="fill:var(--muted);font-size:12.5px">1 ran the check</text>
  <text x="553" y="80" style="fill:var(--muted);font-size:12.5px">165</text>

  <rect x="190" y="108" width="318" height="16" style="fill:var(--bar)"/>
  <rect x="190" y="108" width="187" height="16" style="fill:var(--ink)"/>
  <text x="28" y="120" style="fill:var(--ink);font-size:14px">this site</text>
  <text x="28" y="135" style="fill:var(--muted);font-size:12.5px">87 ran the check</text>
  <text x="516" y="120" style="fill:var(--muted);font-size:12.5px">148</text>

  <rect x="190" y="148" width="118" height="16" style="fill:var(--bar)"/>
  <text x="28" y="160" style="fill:var(--ink);font-size:14px">a teaching repo</text>
  <text x="28" y="175" style="fill:var(--muted);font-size:12.5px">none did</text>
  <text x="316" y="160" style="fill:var(--muted);font-size:12.5px">55</text>

  <rect x="190" y="188" width="90" height="16" style="fill:var(--bar)"/>
  <text x="28" y="200" style="fill:var(--ink);font-size:14px">a side project</text>
  <text x="28" y="215" style="fill:var(--muted);font-size:12.5px">none did</text>
  <text x="288" y="200" style="fill:var(--muted);font-size:12.5px">42</text>

  <rect x="190" y="228" width="56" height="16" style="fill:var(--bar)"/>
  <text x="28" y="240" style="fill:var(--ink);font-size:14px">an internal tool</text>
  <text x="28" y="255" style="fill:var(--muted);font-size:12.5px">none did</text>
  <text x="254" y="240" style="fill:var(--muted);font-size:12.5px">26</text>

  <text x="28" y="283" style="fill:var(--accent);font-size:13px">In four of the five, it was never able to start.</text>
</svg>

*The shape I read as a habit problem. It is a plumbing problem.*

## The story I told myself, and it was a good one

I want to be precise about what I did next, because the mistake is the whole note and it does not
look like a mistake from the inside.

I did not shrug. I took the numbers seriously and started building an explanation, and the
explanation I built was about discipline. It went like this. A check that fires when you sit down
costs you something immediately: it interrupts, it hands you a list, it delays the thing you came to
do. Whatever it buys you arrives later, and often it arrives for somebody else, which in my case
means a future version of me who has forgotten why any of this is here. Machinery whose cost is now
and whose payoff is later and elsewhere is machinery that gets skipped. Every time.

I liked that theory. I still like it, which is a warning sign I did not read at the time. It
explained the other numbers on the same page. Only twenty-one of four hundred and fifty-four sessions
handed off properly to the next one, and twenty of those twenty-one were in this repo, the one where
I was watching. Fifty-nine sessions were named some variant of "Review pasted text," which is what it
looks like when work arrives as a wall of text with no shape on it. The longest single session in the
store ran to eleven thousand three hundred and ninety-six messages, which is not a session, it is a
hostage situation.

All of that is true and none of it was the answer.

## Then I ran it myself, from the wrong folder

Late in the day I did the thing I should have done first. I opened the client project and ran the
check by hand.

It could not find its own program.

The check is a small shell script wired to fire at session start. Its job is to locate my tooling and
ask it what is out of shape in this repository. Locating the tooling is three lines, and here they
are as they stood:

```bash
if command -v pantry >/dev/null 2>&1; then
  pantry="pantry"
elif [ -f "../pantry/cli.ts" ]; then
  pantry="bun ../pantry/cli.ts"
elif [ -f "node_modules/@tjakoen/pantry/cli.ts" ]; then
  pantry="bun node_modules/@tjakoen/pantry/cli.ts"
```

Read it as a machine would. The first rung asks whether the program is installed globally. It is not,
because I never published it anywhere. The second rung looks for a sibling folder next to whatever
repo the session opened in, which resolves only if you are already standing inside the one directory
where all my stack repos live side by side. The third rung looks for a vendored copy, which the
client project has no reason to carry.

So from anywhere except that one directory, all three rungs miss, and the script prints a line saying
the check did not run and exits quietly with a success code.

One hundred and sixty-five sessions in that repo were not one hundred and sixty-five sessions
declining a check. They were one hundred and sixty-five sessions being told the check was unavailable,
in a message small enough that neither I nor the machine reading it ever treated it as a fault.

The one recorded run was a human typing the command by hand. That human was me, and I did it from the
directory where it happens to work.

## Why the wrong answer was so comfortable

The reason I spent a day on the wrong diagnosis is not that I am careless with data. It is that the
wrong diagnosis was a story about behavior, and I already had a moral ready for it.

A behavior story flatters you a little even when it accuses you. It says the tool is sound and the
human is weak, which is a shape I know how to fix: more discipline, better nudges, a rule written
down somewhere. A plumbing story says the tool never worked and you did not check. There is no moral
in that. There is only a path with two dots in it.

Here is the part that generalizes past my particular script, and it is smaller and less satisfying
than the theory I built:

> A measurement tells you what did not happen. It will never tell you why, and the distance between
> those two is exactly the size of a confident wrong answer.

Every number in that first section was correct. The reading laid over the top of them was invented,
and it survived six weeks because it was plausible and because nobody, including me, ran the one
command that would have killed it in five seconds.

## What I still cannot reproduce, including one I got wrong twice

Since the whole point here is not trusting figures you have not checked, I had this note's numbers
re-derived from the store before writing it, and two things came back that I am obliged to print.

The first is that "two hundred and eighty-eight sessions" is exact arithmetic and I originally
labelled it wrong. It is the sum of the four other repositories in my table. It is not every session
outside this site, which is three hundred and six, because three small workspaces never made the
table at all. So the confession has a confession inside it: while writing up how I misread my own
measurement, I misread a different one, in the same document, on the same page.

The second is that the eighty-seven and the sixty-two are pinned to the nineteenth of August and have
already moved. The store held four hundred and fifty-four sessions that night. It holds four hundred
and sixty now. Every one of those six landed in this repository, and none of them was product work.

That last fact is the uncomfortable one, so let me put it plainly rather than bury it. On the
nineteenth of August, fifty-three of the one hundred and forty-eight sessions in this repo were about
the workflow, the standards, the tooling or an audit, rather than about anything a visitor to this
site would ever see. Roughly a third of the work was the machinery, not the thing the machinery is
for. Six sessions have landed since. Five of them were about the workflow.

Measuring the loop is loop work. The ratio got worse because I looked at it.

## What it says now

The path is fixed. There is a fourth rung on that ladder that resolves by absolute path, so the
script can find its tooling from anywhere on this machine, and it sits last on purpose so that a repo
carrying its own copy still wins.

I pointed it at the client project this morning, and for the first time in a hundred and sixty-five
sessions it answered:

```
21 checks, 0 failing, 3 due
```

A stale code graph, a missing end to end suite, and a context budget I have blown by seven thousand characters. None of it dramatic. All of it work that had been sitting there since early
July, invisible, because the thing whose job was to say so could not open its mouth.

Eleven repositories now carry both the config and the instructions, and the check reaches all of
them. That is where I have to stop, because that is a rollout and not a result. The thing I got wrong
last time was calling a rollout a result, and I would rather not do it twice in one note.

So: a hypothesis with a date on it. If I run the same query in October and the four quiet repos are
still quiet, then my discipline theory was right all along and I owe it an apology. If they are not,
the check was simply never in the room. I do not know which yet, and the honest version of this note
is the one that says so rather than the one that ties a bow on it.

What I do know is that for six weeks I had a number that looked exactly like an answer. One run in a
hundred and sixty-five. It was never an answer. It was a symptom, and I read it as a verdict, and the
difference cost me a day and a published sentence I now have to live with.

The check runs in that repo now. It took five seconds to find out it never had.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
