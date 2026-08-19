---
title: "BREAD: a no-build hypermedia stack, and the site that is its own proof"
venue: appbuildersph.com
author: Tjakoen Stolk
status: DRAFT
date: 2026-08-19
summary: >
  A launch post for the BREAD stack, written for a builder audience. States what the
  four layers are, what runs today, and what does not work yet. Every link goes to a
  public repo or a live page.
---

# BREAD: a no-build hypermedia stack, and the site that is its own proof

I got tired of a build step standing between me and a page.

Not in a principled way at first. In the ordinary way, where you change one line of CSS and wait for
a bundler to think about it. I had a personal site to rebuild and a teaching load that eats most of
my week, so I did the thing you are not supposed to do: I skipped the framework, wrote plain HTML
and CSS, and pointed Bun straight at the TypeScript. No build. Bun reads the source and serves it.

That turned into four layers, and then into a stack, and then into the site you can go and read
right now, which runs on it. Every claim below has a repo behind it.

## The four layers, plus the app that runs them

**BATCH** is the substrate. Server-rendered hypermedia on Bun, no build step, near-zero client
JavaScript. It is the bottom of the pile and the least interesting to talk about, which is roughly
how a substrate should be. [github.com/tjakoen/batch](https://github.com/tjakoen/batch)

**GRAIN** is the part I actually care about. It is a design system where a person and an AI operate
the *same* controls through one shared vocabulary. Not an API bolted on the side for the machine to
use privately. The same door. When the AI moves something, the page shows a visible grain so you can
see a machine had a hand in it. [github.com/tjakoen/grain](https://github.com/tjakoen/grain)

**MILL** turns Markdown into GRAIN pages. It renders the notes and every layer doc on the site.

**PROOF** and **CRUMB** sit together at the top. PROOF is a plan board where the plans are Markdown
files and the board is a projection of them, never the other way round. CRUMB runs a guided tour over
the live app, so a walkthrough is a file that breaks when the app changes, instead of a video that
quietly goes stale.

**PANTRY** is not in that chain at all. It is the app that composes the layers into one server.

Four of those are on npm. PANTRY deliberately is not, and the docs say so rather than pretending
otherwise. Worth knowing if you go looking: the unscoped name *pantry* on npm belongs to a stranger's
package, so do not install it expecting mine.

## The demo I am least comfortable showing you

There is a page on the site called the builder. You type a sentence, and a small language model
running *in your browser* composes a page out of real GRAIN blocks. No server round trip to a big
model. A half-billion parameter model, on your machine, driving a design system.

Here is the honest part. Building a page from a description works. Editing one afterwards mostly does
not. I measured it: the model picked the right block and the right verb five times out of fifteen,
and every one of those five was rejected on a technicality in how it wrote the address. I have since
made the fence more forgiving, and I have not re-run the model against it, so I am not going to stand
here and tell you it works now. The page itself says the same thing, in the same words, to anyone who
opens it.

I could have shipped a demo that only ever shows the good path. That version would be a better
advertisement and a worse thing to have built.

## Why any of this instead of a framework

Because frameworks make you do things their way, and I would rather own the whole surface than rent
someone else's opinions about it. That is a taste, not a law, and it costs me things. I write more
by hand. I do not get an ecosystem. When something breaks, it is mine.

What I get back is that there is nothing between the source and the server. A page is a real document
at a real URL that works with no JavaScript. The parts that need JavaScript are added on top, never
required underneath.

## The receipts

The whole site is the demo. It is also open, so the claim is checkable rather than assertable:

- The stack, all together: [tjakoen.github.io/bread](https://tjakoen.github.io/bread)
- How I actually work with AI, with the counts and what they cost:
  [tjakoen.github.io/notes/ten-times-zero](https://tjakoen.github.io/notes/ten-times-zero)
- The standards I hold my own work to, published rather than described:
  [tjakoen.github.io/standards](https://tjakoen.github.io/standards)

Claude typed most of it. I made the calls, and I have the receipts for both halves. That is not a
confession, it is the interesting part: a multiplier only pays if you can catch the thing lying to
you. Ten times zero is still zero.

If you want to build on it, there is a link you can drop into a coding agent on an empty project and
it will interview you first and work out which layers you actually need:
[tjakoen.github.io/kickstart](https://tjakoen.github.io/kickstart).

Tell me what breaks.
