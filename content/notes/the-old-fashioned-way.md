---
title: "I Built a Real Course Platform and Then Parked It"
audience: [build, teach]
level: intro
subtitle: "I spent weeks building a proper second course platform with a database, logins and row-level security, so it could one day be a product. Most of it rebuilt what my GitHub-based setup already did. This is why I parked it, and what runs my sections now."
author: "Tjakoen Stolk"
status: DRAFT
type: note
layout: timeline
date: 2026-11-20
readingTime: "~8 min"
tags: [ai, teaching, tooling]
summary: >
  I teach university software-engineering sections on a course platform built out of GitHub itself:
  organizations, teacher repositories, grading in GitHub Actions and a sync to Canvas. I then built a
  second, more "legit" platform on Supabase, with a database, auth, row-level security, Edge Functions
  and two Cloudflare Pages sites, hoping it could become a product. Weeks later it mostly replicated
  what the first one already did, and no student had ever used it. On 2026-11-20 I parked it. Canvas
  and the student repositories are the source of truth, in-lab activity submissions double as
  attendance, and management is a Claude dashboard. With AI writing the code, the expensive part is
  no longer the code, so building the classic app first was the old-fashioned instinct.
social: |
  I built a second course platform this term. A real one: a database, logins, row-level security,
  serverless functions, two deployed sites.

  Weeks in, I looked at what it did. It replicated what my GitHub-based setup already did. No student
  had ever opened it.

  So I parked it today. Canvas and the student repositories hold the truth, the lab submissions
  double as attendance, and I manage it all from a dashboard Claude builds on request.

  With the modern way of coding, I was still thinking the old-fashioned way. When the code is cheap,
  the thing worth building is the smallest layer the work actually needs.
socialImage: "/media/notes/the-old-fashioned-way-social.png"
socialImageAlt: "I built a real course platform and then parked it: on the left a tall stack of boxes labelled database, auth, row-level security, functions and two sites, crossed out; on the right three small boxes, Canvas, student repos and a Claude dashboard."
---

Today I parked a course platform I spent weeks building. It had 105 database migrations, about 71
tables, row-level security on all of them, and two sites deployed on Cloudflare Pages. No student
ever logged into it.

That last fact is the whole note, really. But it took me a while to see it, so here is the long way
round.

## The platform I already had

I teach software-engineering sections at a university. For a while now the course has run on a
platform built out of GitHub itself. Each class gets an organization, I keep a teacher repository
per section, every student works in their own repository, and grading runs in GitHub Actions. A sync
pushes the results to Canvas, which is where the university expects grades to live.

It is not pretty. It is a pile of workflows, scripts and conventions. But it works, the students
already live in GitHub for the actual coursework, and it is public at
[github.com/tjakoen/github-native-course-platform](https://github.com/tjakoen/github-native-course-platform)
if you want to see what that pile looks like.

## The platform I wanted to have

Somewhere along the way I started to feel that the pile was not a real product. A real product has a
database. It has accounts and a login page. It has row-level security, so a student can only ever
read their own rows. It has functions on a server and a front end on a CDN.

And if I built that, I thought, maybe other teachers could use it. Maybe I could sell it.

So I built it. Supabase for the database, auth and Edge Functions, Cloudflare Pages for two sites.
With Claude and Codex doing most of the typing, it went fast, which is exactly the problem. Fast
meant I never had to stop and ask whether each table earned its place. As a snapshot on the day I
parked it, the build held 105 migrations and about 71 tables.

## What it actually did

A few weeks in, I sat down to plan the step where students would finally use it, and I listed what
it would do for them on day one.

Submit work: they already do that, in their repositories. See their grade: Canvas already shows it.
Get feedback: it already comes back in the repository, from the Actions run. Know whether they were
in class: that was the one thing the old setup did not track.

Nearly everything on the list was a copy of something that already worked, moved into tables I now
had to keep in step with the originals. I had not built a platform. I had built a second source of
truth for data that already had one.

<svg viewBox="0 0 620 330" width="100%" role="img"
     aria-label="Two columns compare the parked build with what runs the course now. The parked build was a six-layer stack: Cloudflare Pages sites, Edge Functions, row-level security, auth, about 71 tables and 105 migrations, and none of it used by students. What runs now is three pieces: Canvas holds grades, student repositories hold the work and lab submissions that double as attendance, and a Claude dashboard handles management."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;
            --paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--bar:#cbc1b3;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="329" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="30" style="fill:var(--muted);font-size:15px">The parked build and what replaced it (snapshot, Nov 20)</text>
  <text x="150" y="62" text-anchor="middle" style="fill:var(--ink);font-size:15px">Parked build</text>
  <g style="fill:none;stroke:var(--bar)">
    <rect x="50" y="76" width="200" height="30"/>
    <rect x="50" y="110" width="200" height="30"/>
    <rect x="50" y="144" width="200" height="30"/>
    <rect x="50" y="178" width="200" height="30"/>
    <rect x="50" y="212" width="200" height="30"/>
    <rect x="50" y="246" width="200" height="30"/>
  </g>
  <g text-anchor="middle" style="fill:var(--muted);font-size:13px">
    <text x="150" y="96">two Cloudflare Pages sites</text>
    <text x="150" y="130">Edge Functions</text>
    <text x="150" y="164">row-level security</text>
    <text x="150" y="198">auth and accounts</text>
    <text x="150" y="232">about 71 tables</text>
    <text x="150" y="266">105 migrations</text>
  </g>
  <text x="150" y="304" text-anchor="middle" style="fill:var(--accent);font-size:13.5px">students who used it: none</text>
  <text x="460" y="62" text-anchor="middle" style="fill:var(--ink);font-size:15px">What runs now</text>
  <g style="fill:none;stroke:var(--ink);stroke-width:1.5">
    <rect x="360" y="90" width="200" height="50"/>
    <rect x="360" y="156" width="200" height="50"/>
    <rect x="360" y="222" width="200" height="50"/>
  </g>
  <g text-anchor="middle">
    <text x="460" y="112" style="fill:var(--ink);font-size:14px">Canvas</text>
    <text x="460" y="130" style="fill:var(--muted);font-size:12px">grades, the official record</text>
    <text x="460" y="178" style="fill:var(--ink);font-size:14px">Student repositories</text>
    <text x="460" y="196" style="fill:var(--muted);font-size:12px">work, feedback, attendance</text>
    <text x="460" y="244" style="fill:var(--ink);font-size:14px">A Claude dashboard</text>
    <text x="460" y="262" style="fill:var(--muted);font-size:12px">management, built on request</text>
  </g>
</svg>

## What runs my sections now

The answer turned out to be smaller than either platform.

Canvas and the student repositories are the source of truth. Canvas holds the grades because the
university already treats it as the record. The repositories hold the work, because that is where
the students already are.

The one gap, attendance, closed itself without a table. Every lab has an in-class activity that the
students submit before they leave. If the submission is there, they were there. The work they hand in
is the attendance sheet.

And the management side, the part I thought needed a whole admin app, is a dashboard Claude builds
and updates when I ask a question about my sections. It reads from the two sources of truth. It owns
nothing, so there is nothing in it to drift.

## Thinking the old-fashioned way

Here is the line I keep coming back to. I have the modern way of coding: I describe what I want and
an agent writes it. And with that in my hands, I was still thinking the old-fashioned way.

The old way says a serious tool needs its own database, its own accounts and its own admin screens,
because building those is the expensive part, so you build them once and properly. That rule made
sense when the code was the cost. It is not the cost any more. An agent can write 105 migrations
faster than I can review them. What still costs something is every place the truth lives, every
system that has to agree with another one, and every screen someone has to learn.

So the question changed. It is no longer "what would a real product have?" It is "what is the
smallest layer the work actually needs?" For my sections, the answer was a dashboard over two
systems that already existed.

## The same call, twice

This is not the first time I made this exact decision. At work I wanted a view of my team for
one-on-ones, and my first serious answer was People Manager, a whole app I was coding myself. It
stalled. Then one afternoon I asked Claude for a dashboard instead, pointed it at the data, and handed
it People Manager as a reference. That dashboard became Crew Watch, and I wrote the story up in
[I Showed My Team a Dashboard](show-them-the-board.md).

Both times the shape was the same: a classic app, built because it felt like the grown-up version,
replaced by the systems already in use and a dashboard on top of them. You would think I would have
recognised it the second time sooner.

## How I parked it

Parking is not the same as deleting, so I did it carefully. The repository is archived with a tag at
its last state. The database was backed up and then deleted. The paid Supabase plan moved to another
project that actually needs a database. And the README and docs of the GitHub-based platform were
updated the same day, so they describe how the course really runs now.

If a day comes when other teachers want this, the tag is there. But I would start that day by asking
what they already use, not by opening a migration file.

## Where it sits now

Today I parked a platform no student ever logged into. The course did not notice. That is the
clearest sign I have that it was never the course's platform. It was mine.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
