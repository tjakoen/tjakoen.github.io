---
title: "Two Hundred Final Projects, and the Ones I Didn't See Coming"
subtitle: "Seven sections, three subjects, more than 200 final projects, all of them public. I told my students to build for themselves instead of a made-up client, and some of what came back is better than apps I've paid for."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-06
readingTime: "~5 min"
tags: [teaching, students, portfolio, ai, github]
summary: >
  A look back at semester one of 2026: seven sections, three subjects, more than 200 public final
  projects and 594 badges. The one rule that shaped them was to build something you actually need,
  publish it in the open, and own every line, including the lines AI wrote.
---

Seven sections. Three subjects. More than 200 final projects. 73 Flutter apps, around 127
full-stack apps, and a stack of team websites built with no framework at all. 594 badges, every one
signed off by me.

Those are this semester's numbers, a snapshot of semester one, 2026, and a year ago I wasn't sure I'd
still be teaching to see them. I run an engineering team full-time, and last term the grading on
top of that nearly buried me. I wrote about [nearly quitting](why-i-teach.md) already. The short
version is that I built a platform to take the grind off my plate instead, and kept the part I
actually like.

That turned out to be the most useful thing I had to teach.

## Build for yourself, not a made-up client

The line I kept repeating all semester was simple: **build something you actually need.** Not a
pretend client brief, not a to-do app for a fictional bakery. Something that solves your own
problem.

The reason is practical. If you built it for yourself, you're its biggest advocate. You know why
every feature is there, because you were the one who needed it, and you can talk about it in an
interview with real pride instead of reciting a spec. I'd know. My grading platform exists because I
was drowning, and it's the project I can talk about longest without notes.

They took that and ran with it.

A clipboard for job posts you find on your phone, so you can apply later from a laptop. An OJT
hours tracker. A dorm finder near campus. Flood warnings and route advice for commuters around
Angeles City, which is the kind of problem you only think to solve if you've waded through it.

And then the fun ones. A wardrobe app for people who own plenty of clothes and keep wearing the same
five, which I took personally. Apps for crochet, for aquariums, for basketball. A fan-made remake of
a board game. Honestly, these were some of my favorites to grade, because you could tell they cared.
Nobody builds a crochet pattern tracker to hit a rubric.

<figure class="shot">
  <img class="shot__img" src="/media/proud-of-my-students/flutter.jpg" width="1080" height="1080" loading="lazy" data-lightbox
       alt="73 Flutter apps from two sections of Applications Development: Love My Closet, Bahantabay, Reaction Chain and Nook.">
  <figcaption class="shot__cap">Applications Development, two sections, 73 Flutter apps. The wardrobe app, the flood warnings and the board game are all in here.</figcaption>
</figure>

<figure class="shot">
  <img class="shot__img" src="/media/proud-of-my-students/fullstack.jpg" width="1080" height="1080" loading="lazy" data-lightbox
       alt="127 full-stack apps in React, Express and PostgreSQL from four sections: JobStash, LiturgyGen, WorkBud and Rentora.">
  <figcaption class="shot__cap">Four sections of React, Express and PostgreSQL, 127 full-stack apps. One of them prints Mass missalettes for a real campus office.</figcaption>
</figure>

<figure class="shot">
  <img class="shot__img" src="/media/proud-of-my-students/web.jpg" width="1080" height="1080" loading="lazy" data-lightbox
       alt="Intro to Web team sites built with plain HTML, CSS and JavaScript: Memora, HAU Dorm Finder, Hour.ly and LifeQuest.">
  <figcaption class="shot__cap">Intro to Web, plain HTML, CSS and JavaScript. No frameworks, which is a rule I don't only hand to students.</figcaption>
</figure>

## Public, or it didn't happen

Every project had to be published on GitHub, out in the open.

A project sitting in a private folder helps nobody, including the student who built it. A public
one goes in a portfolio and keeps working for them long after the semester ends. It's the first link
a recruiter clicks, and it's evidence instead of a claim on a résumé.

## Use AI, and own every line

I was just as strict about AI, in the other direction from what people expect. My team uses it
every day, and that's where the whole industry is going, so banning it would be teaching students to
work in a world that no longer exists.

So they could use it. They just had to use it responsibly: credit it, write down what it did and
what they did, and own every line, including the parts AI wrote. If you can't explain a function in
your own repo, it isn't yours yet. That's the same rule I hold myself to, and it's the whole argument
of [Ten Times Zero Is Still Zero](ten-times-zero.md): the tool multiplies what you already know.

## How 594 badges get checked

Grading more than 200 projects by hand is exactly the thing that nearly made me quit, so it isn't
done by hand. Tests and AI do the first pass on every submission. Nothing gets issued until I sign
off.

<svg viewBox="0 0 262 360" width="100%" role="img"
     aria-label="How a badge gets issued: a student pushes to a public GitHub repo, automated tests run, AI does a first-pass review, I review and sign off, and only then is the badge issued. If anything fails, it goes back to the student."
     style="display:block;width:100%;max-width:470px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-proud0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="31" y="16" width="200" height="52" rx="6"/>
    <rect x="31" y="94" width="200" height="36" rx="6"/>
    <rect x="31" y="156" width="200" height="52" rx="6"/>
    <rect x="31" y="234" width="200" height="36" rx="6"/>
  </g>
  <rect x="31" y="296" width="200" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="131" y1="68" x2="131" y2="94" marker-end="url(#fl-proud0)"/>
    <line x1="131" y1="130" x2="131" y2="156" marker-end="url(#fl-proud0)"/>
    <line x1="131" y1="208" x2="131" y2="234" marker-end="url(#fl-proud0)"/>
    <line x1="131" y1="270" x2="131" y2="296" marker-end="url(#fl-proud0)"/>
    <path d="M231,252 C256,252 256,42 231,42" stroke-dasharray="4 3" marker-end="url(#fl-proud0)"/>
  </g>
  <g text-anchor="middle">
    <text x="131" y="38.3" style="fill:var(--color-fg)">Student pushes</text>
    <text x="131" y="54.8" style="fill:var(--color-muted);font-size:12px">to a public GitHub repo</text>
    <text x="131" y="116.3" style="fill:var(--color-fg)">Tests run</text>
    <text x="131" y="178.3" style="fill:var(--color-fg)">AI first pass</text>
    <text x="131" y="194.8" style="fill:var(--color-muted);font-size:12px">flags, never decides</text>
    <text x="131" y="256.3" style="fill:var(--color-fg)">I sign off</text>
    <text x="131" y="318.3" style="fill:var(--color-bg)">Badge issued</text>
  </g>
</svg>

The dashed line is the one that matters. Anything that fails at any step goes back to the student,
and the AI never issues anything on its own. It flags; I decide. The machine took the hours, not the
judgment.

<figure class="shot">
  <img class="shot__img" src="/media/proud-of-my-students/badges.jpg" width="1080" height="1080" loading="lazy" data-lightbox
       alt="Three issued badges from Application Development and Emerging Technologies: Flutter App Development and two Builds with Flutter and AI.">
  <figcaption class="shot__cap">Three of the 594, from the Flutter class.</figcaption>
</figure>

The criteria are public too, one page per badge, so a recruiter can see exactly what a student had
to show to earn one:

- **Applications Development:** [Dart and Flutter Foundations](/badges/adet-prelim),
  [Flutter App Development](/badges/adet-midterm), [Builds with Flutter and AI](/badges/adet-finals)
- **Full-stack JavaScript:** [Frontend Design with Cloud](/badges/apsi-prelim),
  [Full Stack Web Development](/badges/apsi-midterm),
  [Builds Full-Stack JavaScript and AI](/badges/apsi-finals)
- **Intro to Web:** [Web Foundations](/badges/introweb-prelim),
  [Interactive Web Pages](/badges/introweb-midterm), [Builds for the Web and AI](/badges/introweb-finals)

Or [all of them in one place](/badges).

## The curriculum I wasn't asked to teach

Being part-time and still working in the industry means I get to teach things that aren't on the
syllabus: planning before you type, documentation someone else can follow, and design systems
instead of one-off screens.

Seeing those show up in their final projects, without me asking, made me happier than any number at
the top of this page.

## Better than apps I've paid for

Some of these are better than apps I've paid for. More than once I opened a student's code and
thought, huh, that's a better way to do it, and quietly took notes.

That's the part of teaching nobody warns you about. You go in to teach, and you walk out learning.

To my students: thank you. I'm proud of you. Keep building.

Every project has its own page, by class:

- [Applications Development](/calendar/2026-s1-appdev-students)
- [Full-stack JavaScript](/calendar/2026-s1-apsi-students)
- [Intro to Web](/calendar/2026-s1-introweb-students)

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
