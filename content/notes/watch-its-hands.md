---
title: "Watch Its Hands"
subtitle: "I wrote a research paper about letting an AI press the same buttons I press. This is the version I would say out loud, to someone who has no intention of reading a research paper."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-08-06
readingTime: "~7 min"
tags: [ai, hci, grain, design-systems]
summary: >
  Most AI works offstage. You ask, it disappears, it comes back with a result and a summary of itself.
  I built the opposite: the AI operates the same controls I do, enters through the same single door,
  and leaves its handwriting on everything it touched. Here is the plain-language version of the
  argument, and the part I have not proven yet.
---

I teach software engineering part-time, and the piece of a lab session that actually lands is never
the explaining. It is the twenty minutes where I put my screen up and build the thing badly in front
of everyone. I typo. I read the error out loud. I rename a variable because the first name was dumb.
Nobody has ever learned anything from my finished repo.

> You do not learn the piano from a recording. You learn it sitting next to someone, in the same room,
> watching their hands.

That sentence is the whole reason [the whitepaper](whitepaper-one-vocabulary.md) exists. The paper
says it in about twenty-eight minutes of careful academic hedging, with citations. This note says it
in seven, with none.

## Most AI is a recording

Two shapes dominate right now, and both of them put the work offstage.

The first is the assistant in the sidebar. You describe what you want, it goes away, it comes back
with an answer and a tidy paragraph explaining what it did. When it is right, you got a result. You
did not get a demonstration. You cannot check its reasoning by looking at the screen, because nothing
on the screen moved; the only artifact is its own account of itself, which is exactly the witness you
would least like to rely on.

The second is the computer-use agent: the model looks at your screen, finds the button, and moves the
mouse. It imitates a person. This is genuinely impressive and it is also backwards. The model is
reverse-engineering an interface that was designed for eyes and hands, guessing at pixels, while your
role shrinks to writing instructions and watching a cursor twitch. It works right up until it clicks
the wrong thing, and then you are debugging a screenshot.

Neither of these is a bad idea. They are just both answers to "how do we let the AI use software
built for humans." I got interested in a different question: what if the software were built for
both of us from the start, and neither of us got a shortcut.

## So I built the boring version

The thing I built is a design system called GRAIN. Boring on purpose. There is no clever agent in it.

Instead of teaching a model to imitate a person, the interface publishes a short, fixed list of
things that can be done, and a list of places they can be done to. Not CSS selectors, not
coordinates: names. Open this. Choose that. Set this field. That list is generated from the component
tree itself, so it cannot quietly drift out of date, because it *is* the interface, projected.

Then three rules, and honestly the first one carries most of the weight.

### Same buttons

When I click, the app does not change anything directly. It writes down what I meant and submits it.
When the AI decides, it writes down what it meant and submits it. Same object. Same list. Same
validation.

The consequence is the part I care about: **the AI has no move available to it that I do not also
have.** Not because it has been politely asked to stay in its lane, and not because there is a stop
button bolted on the side, but because there is no other lane. If the interface does not afford it,
the vocabulary does not contain it, and the request dies at the door. Capability parity by
construction is a much better night's sleep than capability parity by policy.

It cuts the other way too, which surprised people more than I expected. I do not get a direct write
either. My click is a request, same as its decision. Nobody reaches into the database from the couch.

### One way in

Every one of those requests goes through a single endpoint, and a single component is allowed to
actually change anything. One door, one writer.

<svg viewBox="0 0 620 356" width="100%" role="img"
     aria-label="A human click and an AI decision both become the same request object, which passes through one door, is handled by a single writer, and comes back as updates to the named surfaces. The AI's edits stay grainy; the human's settle clean."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="wih-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="95" y="20" width="170" height="40" rx="6"/>
    <rect x="355" y="20" width="170" height="40" rx="6"/>
    <rect x="180" y="96" width="260" height="40" rx="6"/>
    <rect x="145" y="226" width="330" height="40" rx="6"/>
    <rect x="100" y="290" width="420" height="50" rx="6"/>
  </g>
  <rect x="155" y="160" width="310" height="42" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="180" y1="60" x2="292" y2="94" marker-end="url(#wih-arrow)"/>
    <line x1="440" y1="60" x2="328" y2="94" marker-end="url(#wih-arrow)"/>
    <line x1="310" y1="136" x2="310" y2="158" marker-end="url(#wih-arrow)"/>
    <line x1="310" y1="202" x2="310" y2="224" marker-end="url(#wih-arrow)"/>
    <line x1="310" y1="266" x2="310" y2="288" marker-end="url(#wih-arrow)"/>
  </g>
  <g style="fill:var(--color-fg)" text-anchor="middle">
    <text x="180" y="45">I click</text>
    <text x="440" y="45">it decides</text>
    <text x="310" y="121">the same request object</text>
    <text x="310" y="251">one writer, checked against the list</text>
    <text x="310" y="315">the named surfaces update<tspan x="310" dy="17" style="fill:var(--color-muted);font-size:12px">its edits stay grainy, mine settle clean</tspan></text>
  </g>
  <text x="310" y="186" text-anchor="middle" style="fill:var(--color-bg)">one door</text>
</svg>

*Figure: one door, one writer. My click and its decision are the same object, and neither of us gets
to change anything on our own.*

A single door sounds like a bottleneck and it is. That is the feature. Every action that has ever
happened in the app went past one checkpoint, wearing a name, tagged with who sent it. So the AI's
activity narrates itself for free: reads, chooses, writes, revises, commits. Try narrating a stream
of mouse coordinates that way. You get a spinner and a vibe.

I will admit one seam, because it is real and the paper admits it too. Content you own outright,
meaning your own notes and preferences, can take a direct route, since the write path is picked by who
owns the data rather than by what was convenient that afternoon. Anything the AI reasons about goes
through the door. And there are two legacy direct-write routes still sitting in the demo app from
before the door existed, currently being walked back. I would rather write that down than have you
find it.

### It leaves its handwriting

Here is the part nobody else seems to be doing, and the part I would defend hardest.

When the AI writes text, the text comes out slightly degraded. Grainy, in the literal typographic
sense: the font has grades for it, so the letterforms themselves carry the signal. When it touches a
button, the button gets a dashed edge. A field it filled has a dashed border. A whole region it took
over is outlined.

And the grain *stays*. It is not a loading state that clears when the work commits. Once the machine
has had a hand in something, that something looks like the machine had a hand in it, permanently,
until a human takes it over and settles it clean.

No badge. No little sparkle icon in the corner. No metadata field you would have to go look up. The
disclosure lives in the surface itself, in the same pixels as the thing being disclosed, stamped at
the same door that let the action in. You cannot strip the label off the content, because the content
is the label.

## What I have not earned

I said this note would be the honest version, so.

The architecture I can show you. The door is enforced, the list is validated, the grain is stamped on
the server and tested against spoofing, and the tests are in the repo. Fine.

A small model now runs entirely in your browser, on your own hardware, no server: WebLLM, reading
that same list and driving part of it end to end through the same door. That was the milestone I was
most nervous about, and it is met. It is also narrow. It handles navigation and choices, and its
command of the full vocabulary is unproven: proof that a real model can operate the thing at all, not
proof that the vocabulary is a good general instruction set.

The claims I would most like to make are the ones I cannot. That watching an AI operate visible
controls gives you better expectations of it than a chat agent does. That the grain gets noticed and
read correctly, including by people with low vision, where the literature warns visual-only cues get
missed constantly. That you actually learn the task from watching. Three hypotheses about people, and
the only way to settle one is a study with people in it, which I have not run. I have written the
design for it. Writing the design costs nothing.

And I am not first. My first search for prior art came back empty and I got briefly pleased with
myself; a second sweep a few days later turned up Builder.io's Agent-Native, shipped, holding two of
my three pieces. It carries no provenance surface at all, so the combination still stands. But
"nobody is near this" turned into "several people are near this" in about seventy-two hours, and
pretending otherwise would have been the cheapest possible way to lose the argument.

## Watch its hands

None of this makes the AI smarter. That was never the goal, and I am fairly convinced the goal is
mostly a distraction anyway: [ten times zero is still zero](ten-times-zero.md), and a genius working
behind a curtain is worth less to me than a mediocre one working on the desk.

What it does is put the machine in the room. Same instrument, same keys, in front of you, with its
fingerprints left on every key it pressed. When it is right, you can see how. When it is wrong, you
can see where, and you can reach over and take the keyboard back, which is the sort of thing that is
very hard to do with a paragraph explaining what already happened somewhere else.

I still cannot prove that watching teaches you anything. I only know that it is the one thing that
has ever worked in my classroom.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
