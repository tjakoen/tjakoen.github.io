---
title: "The Console I Built to Stop Drowning"
subtitle: "I went from four classes to seven in one term. The first thing I built to survive it was a QR attendance scanner. It taught me a shape, a data-free page that reads my teacher repos live and only writes back through one door, and that shape grew into the whole console: attendance on one tab, and every AI-proposed grade held grainy until I sign it on the other."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-07-31
readingTime: "~10 min"
tags: [teaching, ai, grain, attendance, github, assessment]
summary: >
  The story of the Course Console, and how it grew out of a scaling problem. Going from four classes
  to seven made attendance alone unmanageable, so I built a data-free QR scanner: signed codes a
  student cannot forge, scanned on my phone, verified by a workflow. That scanner taught me a shape,
  a page that holds no data, reads my repos live, and writes back only through one reviewed door.
  The same shape then swallowed grading review: AI-proposed grades render in grain type until I
  approve or edit them, at which point they go clean, and nothing reaches a student until I turn my
  decisions into a prompt I have read. One console, two tabs, one rule: the machine drafts, I sign.
---

## Four classes became seven

The term my teaching load jumped from four classes to seven, nothing about the job changed except
the arithmetic, and the arithmetic is what nearly finished me. I teach between 150 and 300 students
in a term, part-time, on top of a full-time job that does not care how many roll sheets I have. At
four classes I was tired. At seven, the mechanical parts of teaching stopped being an annoyance and
became the thing that could actually end it.

Attendance was the first to break. Not the hard part of teaching, not the part I signed up for, just
a tax I paid every session: names called, a sheet passed, a spreadsheet reconciled later at a desk at
night. Multiply that by seven rooms and it is no longer a tax, it is a second job stapled to the
first. I was losing the hours I wanted to spend on actual students to the pure clerical grind of
proving they were in the room.

So I did the thing I always do when a chore scales past me. I stopped doing it by hand and built the
smallest possible tool that would.

## So I built a scanner

The first version was almost embarrassingly small: a web page that turns my phone into a scanner. Each
student carries a QR code in their own workspace. I open the scanner, pick the section, point the
camera, and the room checks itself in. A green flash means a good scan, red means wrong class or an
unreadable code, and a short sound tells me without looking. What used to be a roll call is now a
walk down the aisle.

The part I care about is underneath. A bare student number painted into squares would be trivial to
fake, and attendance you can forge is worse than no attendance at all. So each code carries three
things: the section, the student number, and a signature. The signature
is a short cryptographic stamp computed from a secret only my teacher repo holds. The scanner can read
a name off the number, but it cannot mint a valid code, and neither can a student sitting at home. A
code that does not verify does not get quietly dropped, it gets marked as flagged, so a bad scan is
visible instead of silent.

Where the data lives matters as much as where it does not. The scanner page is a data-free shell. No
class list is baked into it, nothing sits on a server, because there is no server. It writes each
scanning session as a small batch, a plain CSV filed by date and time in my private teacher repo, and
a workflow takes it from there: it verifies every signature, flags the forgeries, and rolls the
batches into a summary. Then it publishes one file back to each student, an attendance record that
holds only their own dates. A student can see that they were marked present on the days they were
present. A student never sees a classmate's attendance, because that was never theirs to see.

<figure class="shot">
  <img class="shot__img" src="/media/console/scanner.jpg" width="729" height="1120" loading="lazy" data-lightbox
       alt="The attendance scanner at phone width: a section picked, a roster of 24 loaded, three students checked in with times, and the CSV path the batch will be written to shown underneath.">
  <figcaption class="shot__cap">The scanner at the width I actually hold it, camera off, running on synthetic students. The three names went in by hand, which is the fallback for a code that will not read, and the file the batch commits to is named before anything is written to it.</figcaption>
</figure>

<svg viewBox="0 0 360 404" width="100%" role="img"
     aria-label="A signed QR code lives in each student's workspace. I scan the room with my phone on the Scan tab. The session commits as a CSV batch in my private teacher repo. A workflow verifies every signature and flags forgeries. Each student is published a record holding only their own attendance."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-att0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="55" y="16" width="250" height="36" rx="6"/>
    <rect x="60" y="176" width="240" height="52" rx="6"/>
    <rect x="55" y="264" width="250" height="52" rx="6"/>
    <rect x="45" y="352" width="270" height="36" rx="6"/>
  </g>
  <rect x="70" y="88" width="220" height="52" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="180" y1="52" x2="180" y2="88" marker-end="url(#fl-att0)"/>
    <line x1="180" y1="140" x2="180" y2="176" marker-end="url(#fl-att0)"/>
    <line x1="180" y1="228" x2="180" y2="264" marker-end="url(#fl-att0)"/>
    <line x1="180" y1="316" x2="180" y2="352" marker-end="url(#fl-att0)"/>
  </g>
  <g text-anchor="middle">
    <text x="180" y="38.3" style="fill:var(--color-fg)">Signed QR in each student's workspace</text>
    <text x="180" y="110.3" style="fill:var(--color-bg)">I scan the room on my phone</text>
    <text x="180" y="126.8" style="fill:var(--color-bg);font-size:12px">the Scan tab, camera on</text>
    <text x="180" y="198.3" style="fill:var(--color-fg)">The session commits as a CSV batch</text>
    <text x="180" y="214.8" style="fill:var(--color-muted);font-size:12px">filed by date, in my private repo</text>
    <text x="180" y="286.3" style="fill:var(--color-fg)">A workflow verifies every signature</text>
    <text x="180" y="302.8" style="fill:var(--color-muted);font-size:12px">and flags the forgeries</text>
    <text x="180" y="374.3" style="fill:var(--color-fg)">Each student sees only their own record</text>
  </g>
</svg>

*A signed code the scanner can read but a student cannot forge, and a record that only ever shows you your own days.*

## The scanner taught me a shape

The scanner solved attendance, but the more useful thing it did was hand me a pattern, and once I saw
the pattern I could not unsee how much of my job fit it.

The shape is this. The page itself holds nothing. It reads what it needs live, straight from my teacher
repos through the GitHub API, into my own browser, using a token I paste into settings that never
leaves this machine. It is allowed to talk to exactly one host on the whole internet and nothing else.
And it does not scatter its writes: everything it changes goes back through a single, deliberate door,
never a dozen quiet ones. Data-free by default, read live, write through one door. That was the scanner,
and it turned out to be the answer to a much bigger problem I had been dreading.

Because attendance was never the thing that actually scared me at seven classes. Grading was.

## The shape ate grading

I let an AI draft grades and feedback for hundreds of students a term. Written down plainly, that
should frighten me, and for a while it did, because somewhere in that pile is a real person whose
semester I can quietly get wrong at scale, faster than I ever could by hand. The rule that lets me
sleep is the one I teach: the machine drafts, the teacher signs. The honest question was always what
"signs" looks like when there are three hundred of them and one of me.

For a long time the answer was ugly. The grades and the feedback lived in gradebook files across a
pile of teacher repos, and reviewing them meant opening tabs, reading raw Markdown, and editing in a
text field that had no idea it was holding somebody's grade. So I pointed the scanner's shape at it,
and the grading review became the console's other tab.

It reads my gradebooks live, the same way the scanner reads the room, and it shows me one screen of
everything the machine has proposed and nothing has committed to. Here is the part I like most. The
design system I build everything with, GRAIN, exists to make one idea real: you should be able to look
at software and see whose hand did what. Text a machine wrote renders with a grain to it. Text a human
has settled renders clean. On the review screen that stops being a metaphor. Every grade and every
line of feedback the AI proposes shows up in grain type. It looks unfinished on purpose, because it is,
a draft nobody has stood behind yet. The moment I approve it or edit it, the grain lifts and the text
goes clean, because now a human wrote it. I cannot mistake a thing the machine guessed for a thing I
decided, because the two do not look the same.

<figure class="shot">
  <img class="shot__img" src="/media/console/review.jpg" width="1440" height="900" loading="lazy" data-lightbox
       alt="One student open in the review queue: the student's submitted work on the left, and on the right an approve button, a score override, the AI-drafted student-facing feedback, and a separate instructor-only panel holding the proposed total and the AI-authored read.">
  <figcaption class="shot__cap">One student, mid-review. The feedback on the right is the machine's draft, sitting in grain type until I approve or edit it, and the panel below it is the instructor-only half that never leaves my screen.</figcaption>
</figure>

And the console does not grade. It never reaches into a repo and writes a score, which sounds like a
limitation until you see what it buys. When I finish reviewing, it does not push my decisions anywhere.
It gathers every call I made into a single prompt, a plain file that says give this student this score,
send this feedback, leave that one alone because I flagged it, and it files that prompt in the repo.
Later, in a Claude Code session I open there, I say run the pending decisions, and the AI does the
actual typing: the gradebook, the feedback files, the push to Canvas. I watch it happen. I keep the
last say. This is the single write door again, the same one the scanner uses. Instead of a dozen
places where something can quietly write a grade, there is one way in, and it runs a prompt I have
already read. The review is not a checkbox at the end. It is the only door, and I am standing in it.

<figure class="shot">
  <img class="shot__img" src="/media/console/intent.jpg" width="1440" height="900" loading="lazy" data-lightbox
       alt="The apply-grades prompt the console generates: a plain Markdown brief naming the teacher repo, the rules that must not be violated, the numbered steps to run, and a reminder that the held activities stay out of this push.">
  <figcaption class="shot__cap">What the console writes instead of a grade. It files this in the repo and stops, and nothing moves until I run it in a session and read what it did.</figcaption>
</figure>

<svg viewBox="0 0 360 492" width="100%" role="img"
     aria-label="The console reads my gradebooks live in my browser. AI-proposed grades show up in grain type. I approve or edit, which flips grain to clean. The console then writes an intent, not a grade, holding every decision in one file. A Claude Code session runs the intent in the repo while I keep the last say. Only then does it reach the student's repo and Canvas."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-con0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="55" y="16" width="250" height="36" rx="6"/>
    <rect x="65" y="88" width="230" height="52" rx="6"/>
    <rect x="55" y="264" width="250" height="52" rx="6"/>
    <rect x="45" y="352" width="270" height="52" rx="6"/>
    <rect x="40" y="440" width="280" height="36" rx="6"/>
  </g>
  <rect x="75" y="176" width="210" height="52" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="180" y1="52" x2="180" y2="88" marker-end="url(#fl-con0)"/>
    <line x1="180" y1="140" x2="180" y2="176" marker-end="url(#fl-con0)"/>
    <line x1="180" y1="228" x2="180" y2="264" marker-end="url(#fl-con0)"/>
    <line x1="180" y1="316" x2="180" y2="352" marker-end="url(#fl-con0)"/>
    <line x1="180" y1="404" x2="180" y2="440" marker-end="url(#fl-con0)"/>
  </g>
  <g text-anchor="middle">
    <text x="180" y="38.3" style="fill:var(--color-fg)">Gradebooks, read live in my browser</text>
    <text x="180" y="110.3" style="fill:var(--color-fg)">The review tab</text>
    <text x="180" y="126.8" style="fill:var(--color-muted);font-size:12px">AI grades show up in grain type</text>
    <text x="180" y="198.3" style="fill:var(--color-bg)">I approve or edit</text>
    <text x="180" y="214.8" style="fill:var(--color-bg);font-size:12px">grain flips to clean</text>
    <text x="180" y="286.3" style="fill:var(--color-fg)">It writes an intent, not a grade</text>
    <text x="180" y="302.8" style="fill:var(--color-muted);font-size:12px">every decision, in one file</text>
    <text x="180" y="374.3" style="fill:var(--color-fg)">Claude Code runs it in the repo</text>
    <text x="180" y="390.8" style="fill:var(--color-muted);font-size:12px">I keep the last say</text>
    <text x="180" y="462.3" style="fill:var(--color-fg)">Only then: the student's repo and Canvas</text>
  </g>
</svg>

*A grade is grainy until I sign it, and the console cannot write one on its own.*

## The wall between the machine and the student

Scaling feedback to hundreds of students only works if the scaling never costs a student the honesty
of it, so every piece of AI feedback is split in two before it goes anywhere. The student-facing half
is prose only. No scores, no mention of a machine, and by a rule baked into the engine's code, never
the corrected line or the exact fix, only the concept to revisit or a question to chase. It reads like
my own margin notes because it is standing in for them. The instructor-only half is the part meant for
my eyes: a proposed grade, and a quiet flag when something looks vibe-coded. There is even a defensive
line of code whose entire job is to strip the instructor half out before it can leak into the student
copy. Nothing the machine writes reaches a student on its own. It all waits on the review tab, grainy,
until I sign it.

## Where I lock it out

The console is where I let AI multiply me. It is not the whole story, because a multiplier is only ever
worth what it multiplies, and ten times zero is still zero. So there are rooms I keep it out of, on
purpose, and those limits are the design, not a gap in it.

- **AI is banned from the highest-stakes assessment.** When I need a true read on the fundamentals, I
  take the tool away, from the students and from myself. I even used AI to build that exam, the one
  room the machine is not allowed into, which is almost too on-the-nose, and exactly why I trust it.
- **It never grades or speaks to a student unsupervised.** Every AI grade is proposed, every AI
  paragraph is held for my review and edit. The whole system assumes the model is a drafter, not a
  decider.
- **The vibe-coded flag is a nudge, not a verdict.** It tells me where to look harder. It never
  reaches a student, and it never stands as evidence on its own.
- **Student data stays away from the model.** The feedback engine skips personal data on purpose, and
  the console is a data-free shell that keeps student records off any server and out of the page. The
  safest place for student data is nowhere, so that is where it goes.

## You can open the thing

The last piece I am proud of is that none of this is a story you have to take on faith. The console
ships a [demo mode](https://tjakoen.github.io/github-native-course-platform/?demo=1) you can open in
your own browser, and it is not a mock-up. It runs the real code, with one part swapped: the connection
to GitHub is replaced with an in-memory stand-in full of synthetic students. Everything else is the
actual page, the actual grain type, the actual review flow, just with nobody real inside it. Every
screenshot in this post came straight out of it, and the
[code is public](https://github.com/tjakoen/github-native-course-platform) if you would rather read it
than click it. The claims in this post are a URL, not a paragraph.

<figure class="shot">
  <img class="shot__img" src="/media/console/demo.jpg" width="1440" height="900" loading="lazy" data-lightbox
       alt="The console dashboard in demo mode, with a demo badge in the sidebar, a banner explaining that three invented classes were generated in this browser with no GitHub connection and no token, and a footer repeating that writes go through intents.">
  <figcaption class="shot__cap">The front door of the demo, which says out loud what it is. Three invented classes, no token, no connection, and every write simulated in the tab and gone when you close it.</figcaption>
</figure>

## What I am honest about

None of this makes teaching unattended, and I would not want it to be. A few seams I say out loud:

- **The token is real access.** The scanner and the review both act with a token I generate. I scope
  it tightly, give it a short life, and keep it in my browser, but it is a key, and I treat it like one.
- **The two doors are not the same door, on purpose.** Grades go through the reviewed prompt, because
  a grade is a judgment. Attendance commits more directly, because a scan I made in the room is already
  my attestation. I decided that split deliberately, and I can defend it.
- **The console cannot make me care.** It removes the tab-juggling, the roll call, the raw-Markdown
  editing. It does not remove the reading. If I rubber-stamp a screen full of grain, that is on me, not
  on the tool. It makes the right thing easy. It cannot make it happen.

I went from four classes to seven and built a scanner so I would not drown. What I actually built was a
shape, and the shape turned out to be the whole answer: hold no data, read live, write through one door
I am standing in. Attendance checks itself in. Every grade shows up grainy. I read it, I decide, I sign,
and only then does a student ever see it.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
