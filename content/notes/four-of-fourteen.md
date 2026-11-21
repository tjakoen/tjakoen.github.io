---
title: "Four of Fourteen: Borrowing Brad Frost's Skills for GRAIN"
audience: [build, learn]
level: intro
subtitle: "Someone whose book shaped how I build just published his skills for AI agents. I took four, left ten, and wrote down why for each one."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-21
readingTime: "~6 min"
tags: [design-systems, ai, grain, standards, workflow]
summary: >
  Brad Frost published a set of agent skills for design systems, product design and healthy AI
  habits. I kept the four that can check GRAIN against rules it already claims to keep: tokens
  only, one vocabulary, contrast that holds, pages built from real components. The other ten
  were skipped for stated reasons. A borrowed skill is a second opinion I audit against, not a
  rule, until I write its finding into one of my own standards.
social: |
  Brad Frost published fourteen agent skills. I took four.

  Atomic design is half the reason GRAIN exists, so this was not a casual read. The four I kept
  can check rules GRAIN says it already keeps. The ten I skipped either assume tools I don't use
  or would compete with the guardrails I already run.

  A borrowed skill is a second opinion, not a rule. It becomes a rule when I write it into my
  own standard.
socialImage: "/media/notes/four-of-fourteen-social.png"
socialImageAlt: "Fourteen squares for Brad Frost's fourteen skills, grouped into design systems, product design, mental health and setup. Four are filled in: token architecture, AI rails, inspection and vibe-killer. The caption says four of fourteen, kept on purpose."
---

## Fourteen skills on a Saturday

Fourteen skills. Three folders and a setup script. One author whose idea of atoms, molecules and organisms is how I
still think about components. [Confirm, or swap in how Atomic Design actually reached you.]

[Brad Frost](https://bradfrost.com) published [his skills](https://github.com/bradfrost/skills)
for AI agents, under MIT, and the timing was rude. A few hours earlier a session of mine had
found that GRAIN's muted ink failed contrast on some surfaces, darkened it, and cut a release. A
design system that calls itself AI-operable had just been caught by the most boring check in
the book. So when a design-systems person I learned from offers to lend me his checklist, I
read it.

I did not install all fourteen. That was the whole exercise.

## Where borrowed skills live

I keep two shelves. My own skills, the ones I wrote, sit in one folder and get linked into every
tool I use. Skills somebody else wrote sit in a separate folder called third-party, as a pinned
copy with the licence beside it, so when a review cites one I can point at the exact text it ran
against.

That shelf already had two sets on it before today:

- the [Dashboard Design plugin by UXKIN](https://github.com/uxkin/agent), MIT, which I audit
  PANTRY's pages against;
- Anthropic's [Design plugin](https://github.com/anthropics/knowledge-work-plugins), from their
  knowledge-work plugins, which ships without a licence file and is noted that way.

Brad's four went in as the third, at a pinned commit, with his MIT licence at the top of the
folder and again inside each skill, because a skill gets copied on its own more often than a
folder does.

## The four I kept

GRAIN makes four promises it can be held to. Components read tokens, never a hard-coded color.
Humans and the AI work through one vocabulary, no back door. The grade on the type is a signal
that the machine had a hand in something. And the contrast contracts hold on every surface,
which, as of this week, I can no longer say I checked by feel.

Each skill I kept tests one of those from the outside:

- **ds-token-architecture** checks a token set against a three-tier ladder, from definitions to
  usage to components. That is the tokens-only rule, examined by a stranger who did not write it.
- **ds-ai-rails** asks whether a coding agent actually stays on the system or quietly freehands
  its own CSS. That is the one-vocabulary rule, seen from the agent's chair.
- **ds-inspection** walks a design system through ten stations, including accessibility,
  machine-readable docs and agent access. Those last two are where GRAIN's MCP server and its
  contracts live, and the first is where the muted ink failed.
- **vibe-killer** takes a page full of bespoke CSS and rebuilds it from real components. MILL
  pages and these notes drift into one-off styling more often than I'd like to admit, and this
  is the cleanup I keep doing by hand.

<svg viewBox="0 0 620 330" width="100%" role="img"
     aria-label="Fourteen squares, one per skill in Brad Frost's collection, grouped by folder. Design systems has five: token architecture, AI rails and inspection are filled in as kept, adoption plan and ASCII are outlined as skipped. Product design has four: vibe-killer is kept, product inspection, product to Storybook and Storybook to product are skipped. Mental health has five limits skills, all skipped. Setup has one, skipped. Four kept in all."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;
            --paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="329" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="32" style="fill:var(--muted);font-size:15px">Brad Frost's fourteen skills, and the four I kept</text>
  <g style="font-size:13px;fill:var(--muted)">
    <text x="28" y="72">Design systems</text>
    <text x="28" y="142">Product design</text>
    <text x="28" y="212">Mental health</text>
    <text x="28" y="282">Setup</text>
  </g>
  <g style="fill:var(--ink)">
    <rect x="150" y="56" width="22" height="22"/>
    <rect x="236" y="56" width="22" height="22"/>
    <rect x="322" y="56" width="22" height="22"/>
    <rect x="150" y="126" width="22" height="22"/>
  </g>
  <g style="fill:none;stroke:var(--muted);stroke-width:1.5">
    <rect x="408" y="56" width="22" height="22"/><rect x="494" y="56" width="22" height="22"/>
    <rect x="236" y="126" width="22" height="22"/><rect x="322" y="126" width="22" height="22"/><rect x="408" y="126" width="22" height="22"/>
    <rect x="150" y="196" width="22" height="22"/><rect x="236" y="196" width="22" height="22"/><rect x="322" y="196" width="22" height="22"/><rect x="408" y="196" width="22" height="22"/><rect x="494" y="196" width="22" height="22"/>
    <rect x="150" y="266" width="22" height="22"/>
  </g>
  <g style="font-size:11px;fill:var(--ink)">
    <text x="150" y="96">tokens</text><text x="236" y="96">AI rails</text><text x="322" y="96">inspection</text>
    <text x="150" y="166">vibe-killer</text>
  </g>
  <g style="font-size:11px;fill:var(--muted)">
    <text x="408" y="96">adoption</text><text x="494" y="96">ASCII</text>
    <text x="236" y="166">product</text><text x="322" y="166">to Storybook</text><text x="408" y="166">from Storybook</text>
    <text x="150" y="236">setup</text><text x="236" y="236">endings</text><text x="322" y="236">energy</text><text x="408" y="236">quiet hours</text><text x="494" y="236">sessions</text>
    <text x="150" y="306">start here</text>
  </g>
  <text x="592" y="306" text-anchor="end" style="fill:var(--accent);font-size:14px">4 kept</text>
</svg>

## The ten I left, and the reasons

The two Storybook skills move screens between a product and its Storybook, in each direction.
GRAIN has no Storybook. Its catalog is a living page the AI can drive, which is sort of the
point of it, so these would be solving a problem I deliberately don't have.

The adoption plan and the product inspection are about a product taking on a design system,
not the system itself. They will matter the day someone adopts GRAIN in an app I don't own. That
day is not today.

The ASCII wireframe skill is charming, and I mean that. It sketches a page as monospace art
where every region maps to a real component. I already sketch on paper, which is the one tool in
my stack I have never had to upgrade, so it fills no gap.

The last six were the hardest call. The limits skills set quiet hours, a ceiling on sessions per
day, and a definite ending to each session, and wire them in through hooks. Honestly, a man who
works sixteen-hour days by choice is the target audience. But my sessions already run through a
loop with its own hooks and its own rules for how a session ends, and two sets of hooks arguing
over whether I'm allowed to open a terminal is a bad way to find out which one wins. If I take
them, I'll take them on purpose, as a decision about my own habits, not as a side effect of a
design-system review.

> A borrowed skill is a second opinion. It becomes a rule the day I write its finding into my own standard.

## What I have not done yet

I have not run any of the four against GRAIN. They sit on the shelf, copied and credited, and
they are not even loaded into a session yet, because the folder they live in is not wired into
my tools. Every reason above is a reading of what each skill says it does, not a measurement of
what it found. [Run ds-token-architecture and ds-inspection on GRAIN and record what they
caught.]

I also don't know yet whether a three-tier ladder fits a system whose grade tokens carry meaning
rather than color. That is exactly the kind of disagreement I want a stranger's checklist to
start.

## Credit where it's due

Brad Frost wrote the four skills I kept, and the [Atomic Design](https://atomicdesign.bradfrost.com) idea GRAIN is built on. The [skills repository](https://github.com/bradfrost/skills) is MIT, copyright Brad
Frost Web LLC. The other two sets on the same shelf belong to
[UXKIN](https://github.com/uxkin/agent) and to
[Anthropic](https://github.com/anthropics/knowledge-work-plugins). None of them is my work. I
just kept the receipts.

A muted ink failed contrast, and the fix was a darker gray. The lesson was cheaper still: check
the boring things with somebody else's list.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
