---
title: "How I Teach With AI, and Where I Lock It Out"
subtitle: "I used an AI to build the platform I run 100 to 150 students a semester through, and to draft their feedback at scale. I also used it to build the one exam where AI is banned from the room. Here's exactly how I use it in my teaching (with the numbers), and every place I deliberately refuse to."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-07-03
readingTime: "~9 min"
tags: [teaching, education, ai, automation, github-actions, assessment]
summary: >
  A transparent, practitioner's account of using AI to teach: building an entire GitHub-native
  course platform, drafting feedback at scale under a strict "name the concept, never the fix" rule,
  and holding every AI grade for human review. It's grounded in receipts (537 commits, more prose
  than code, a ~2,200-line engine) and it's honest about the limits: the proctored exam where AI is
  banned outright, the PII I keep away from the model, and the boundaries I had to keep hardening so
  the automation could never quietly damage a real student's work.
---

## Two sentences that look like a contradiction

I use AI heavily in my teaching. I also used it to build the one assessment in my course where AI is
banned from the room.

Both are true, and the space between them is the whole point. I'm not for AI or against it in
education; I think that framing is lazy. I'm for using it *out loud and on purpose* where it makes me
a better teacher, and taking it away, deliberately, where its presence would rob a student of the
thing they came to learn. This post is the honest version of both halves: exactly how I use it, and
exactly where I don't.

It's the same with my students as it is with me: whether they use AI or not was never the question I
care about. The only thing I'm precious about is whether they actually learned the thing. Reach for
every tool in the box or none of them, the bar doesn't move: **if you can't explain it back to me,
you didn't learn it.**

The belief underneath it all is simple enough to fit on a napkin, and it's the same one I hand my
students on day one: AI doesn't *add* to what you can do, it *multiplies* it, and
[ten times zero is still zero](ten-times-zero.md). Keep that in your pocket; everything below is that
idea, applied to the job of teaching.

## The rules I give my students

So here's what that belief turns into on the ground, because "learning is the point" is not the same
as "anything goes." I'm blunt about vibe coding, and the rules follow the multiplier straight down:

- **In the lab, use AI all you want.** That's practice. Practice is where you're supposed to have
  training wheels.
- **On the major activities, you get your course material and your own previous work, nothing
  else.** No generating your way out of the thing the activity exists to teach.
- **Exams come straight out of your head. No tools.** If you learned it, this is easy. If you didn't,
  no autocomplete is going to save you, and that's the whole point.

And the one that makes the room go quiet:

> If I flag your work as vibe-coded and you can't explain it back to me when I ask: automatic fail
> on that activity.

Not because you used a tool. Because you shipped something with your name on it that you don't
understand. In the real world that's how you get found out; in my class it's just a faster, cheaper
version of the same lesson. **If you can't explain it, you didn't build it,** and that's not a high
bar. That's *the* bar.

## What I actually use it for

Not "help me write a function." The biggest use by far is **building an entire teaching platform**,
a GitHub-native course setup where the repo *is* the LMS. That's its own build story, told in full in
[How I Turned a GitHub Org Into My Whole Classroom](how-i-turned-github-into-a-classroom.md); the
short version is an AI wrote most of the engine alongside me, and I kept the parts with consequences
for myself.

From there it fans out across the whole job:

- **Feedback and code review at scale.** An engine reads each submission and drafts feedback grounded
  in that activity's rubric.
- **Course materials.** Content units for git, JavaScript fundamentals, React, styling: the lesson
  prose itself.
- **Assignments and rubrics.** Per-activity rubrics with weighted line items, including a scored
  design rubric.
- **Assessment design, including the anti-cheating kind.** A proctored, in-lab practical quiz that
  pulls the whole semester together, graded by dozens of automated tests.
- **Documentation and handoff.** An architecture doc, an AI-usage guide for other instructors, an
  onboarding file, so the platform is something a colleague could actually pick up.

## The receipts

I teach "keep the receipts," so here are mine. Across the workspace behind all of this, as of this
writing: **537 commits** in about three and a half weeks, roughly **47,000 lines** added, most of it
built with an AI at my side.

The number I care about most, though, is the same one that shows up when I build anything with AI:
**there's nearly as much prose as code.** Something like 17,700 lines of Markdown against 23,800
lines of code, config, and workflows. For every four lines of code, about three lines of *words*:
lessons, rubrics, READMEs, planning docs. That ratio is the whole argument for how I work, and it has
its own post, [Ten Times Zero Is Still Zero](ten-times-zero.md); here it just says the quiet part
about teaching out loud, that it's a writing job as much as a coding one, and the repo shows it.

A few more, because they tell the story:

- **Four standalone design docs existed before the code did:** architecture, the AI-grading plan,
  the UI plan, the onboarding file. About 1,100 lines of "here's what we're building and why" before
  a feature was written. Same method as the rest of my work: intent first, code second.
- **The engine itself is ~2,200 lines** across 13 tools, including a ~340-line AI-feedback module
  and a gradebook library.
- **A bot identity (course-bot) made 103 of those commits**, the ones that actually deliver grades
  and materials to students. The mechanical delivery is fully automated; the *decisions* behind it
  are not.

## The stories worth telling

**The quiz that bans the tool that built it.** I used AI to build a three-hour, proctored,
closed-resource practical exam (AI tools off, Copilot off, web closed), and I wrote 58 automated
tests to grade it. Read that back: I used a machine to build the one room the machine isn't allowed
into. It's almost too on-the-nose, and that's exactly why I like it. AI multiplied my ability to
*build* the exam. It does nothing for the student in the chair, who has to write React with nothing
open but their own earlier code. That's ten times zero in a single artifact.

**Feedback that never says "AI" and never hands over the answer.** The feedback engine has a rule
baked into its code, not bolted on afterward: *never give the corrected code or the exact fix; name
the concept to revisit, or ask a guiding question.* The class-grounding prompt says it again:
students are expected to research and arrive at solutions themselves. So even when I scale feedback
across a hundred-plus students, the AI is under standing orders to protect the fundamentals, not
shortcut them. It's the crutch-versus-multiplier thesis enforced in a system prompt.

**A wall between the machine and the student.** Every piece of AI feedback is split in two. The
student-facing half is prose only: no scores, no mention of a machine, reads like my own margin
notes. The instructor-only half carries a *proposed* grade and a quiet "this looks vibe-coded" flag
meant for my eyes. Nothing AI-generated reaches a student automatically; it's all held for my review.
There's even a defensive line of code whose only job is to strip the instructor-only part out before
it can leak into the student copy. **The machine drafts; the teacher signs.** I let AI write the
first pass. I never let it grade or speak to a student on its own.

<svg viewBox="0 0 448 424" width="100%" role="img"
     aria-label="A student pushes work; the AI drafts feedback grounded in the rubric, split into a student-facing half (prose only, no scores or fixes) and an instructor-only half (proposed grade plus soft flags). Both are held for my review; I edit and sign; then it is delivered to the student's repo in a deliberate, separate step."
     style="display:block;width:100%;max-width:540px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-howius0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="152" y="16" width="158" height="36" rx="6"/>
    <rect x="157" y="84" width="148" height="52" rx="6"/>
    <rect x="16" y="152" width="206" height="52" rx="6"/>
    <rect x="256" y="152" width="176" height="52" rx="6"/>
    <rect x="157" y="220" width="148" height="36" rx="6"/>
    <rect x="123" y="356" width="217" height="52" rx="6"/>
  </g>
  <rect x="172" y="288" width="118" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="231" y1="52" x2="231" y2="84" marker-end="url(#fl-howius0)"/>
    <line x1="188" y1="136" x2="162" y2="152" marker-end="url(#fl-howius0)"/>
    <line x1="274" y1="136" x2="301" y2="152" marker-end="url(#fl-howius0)"/>
    <line x1="168" y1="204" x2="198" y2="220" marker-end="url(#fl-howius0)"/>
    <line x1="295" y1="204" x2="265" y2="220" marker-end="url(#fl-howius0)"/>
    <line x1="231" y1="256" x2="231" y2="288" marker-end="url(#fl-howius0)"/>
    <line x1="231" y1="324" x2="231" y2="356" marker-end="url(#fl-howius0)"/>
  </g>
  <g text-anchor="middle">
    <text x="231" y="38.3" style="fill:var(--color-fg)">Student pushes work</text>
    <text x="231" y="106.3" style="fill:var(--color-fg)">AI drafts feedback</text>
    <text x="231" y="122.8" style="fill:var(--color-muted);font-size:12px">grounded in the rubric</text>
    <text x="119" y="174.3" style="fill:var(--color-fg)">Student-facing half</text>
    <text x="119" y="190.8" style="fill:var(--color-muted);font-size:12px">prose only — no scores, no fixes</text>
    <text x="344" y="174.3" style="fill:var(--color-fg)">Instructor-only half</text>
    <text x="344" y="190.8" style="fill:var(--color-muted);font-size:12px">proposed grade + soft flags</text>
    <text x="231" y="242.3" style="fill:var(--color-fg)">Held for my review</text>
    <text x="231" y="310.3" style="fill:var(--color-bg)">I edit and sign</text>
    <text x="231" y="378.3" style="fill:var(--color-fg)">Delivered to the student's repo</text>
    <text x="231" y="394.8" style="fill:var(--color-muted);font-size:12px">a deliberate, separate step</text>
  </g>
</svg>

*The wall: the machine drafts both halves; nothing reaches a student until I sign it.*

**The bug I kept having to fix: keep the machine off the students' repos.** A recurring theme in the
commit history is *me hardening boundaries* so a bad automated run couldn't quietly corrupt a real
student's work. The mechanics of that (grading off a snapshot, a separate deliberate publish step,
the access model) are the plumbing at the heart of the
[build-story post](how-i-turned-github-into-a-classroom.md); what matters *here* is the shape of the
decision. The interesting engineering was never the AI. It was building the guardrails around it.

## Where I refuse to use it

This is the part most "AI in education" takes skip, so I'll be specific. The limits are the design.

- **AI is banned outright from the highest-stakes assessment.** When I need a true read on the
  fundamentals, I take the tool away, from the students *and* from myself.
- **It never grades or speaks to a student unsupervised.** Every AI grade is *proposed*, every AI
  paragraph is held for my review and edit before it's published. The whole system assumes the model
  is a drafter, not a decider.
- **The authenticity flag is a soft signal, not a verdict.** The "looks vibe-coded" flag is
  documented in the code as exactly that: a nudge to the instructor, never an accusation. I didn't
  trust it to be right, so I built it to never reach a student and never stand as evidence on its own.
- **Student PII stays away from the model on purpose.** The feedback engine deliberately skips
  personal data; there's a comment in the code that says as much. That's a place I chose to
  constrain the tool rather than let it see everything.
- **The disclosure is a choice, not a byproduct.** There isn't a single AI co-author trailer across
  those 537 commits, not because the AI didn't help, but because I won't let the tooling auto-brand
  my work in hundreds of quiet signatures. Instead there's one honest front-door statement: a "made
  with Claude" badge and a line saying the platform was built with its help, in the interest of
  transparency. Same principle as the classroom: use the tool out loud, once, on purpose, and own
  every call it makes on your behalf.

None of these are the AI failing. They're me deciding where a multiplier is the wrong instrument,
where the point of the exercise *is* the un-multiplied human.

## Why this shape

Put it all together and it's the same law from both sides of the desk. I let AI multiply the parts of
teaching that are mechanical (building the platform, drafting the first-pass feedback, delivering
grades) so I can spend my actual attention on the part that isn't: the student in front of me who
needs the thing to finally click. And I lock it out, hard, of the moments where a student has to prove
they're not zero.

The AI is a force multiplier for a human who stays accountable for every decision. I'd be a
hypocrite to teach that and run my own tools any other way.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
