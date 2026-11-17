---
title: "Keeping the Slop Out While the Agent Builds"
audience: [build]
level: intro
subtitle: "An agent that builds with GRAIN can still reach for the hero, the eyebrow and the sign-up block every model reaches for. A post about a skill called Hallmark showed me how to check for that while the agent works, and it made me change GRAIN's own masthead."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-17
readingTime: "~6 min"
tags: [ai, grain, design]
summary: >
  GRAIN holds its tokens with tests, and the site runs an accessibility scan, but nothing looked at a
  rendered page and asked whether it read as machine-made. Roy Derks posted about Hallmark, a skill
  that renders a page and checks it against a named list of tells, sorted into tiers. I planned
  grain-lint on the same shape: a Floor that always blocks, a Reflex tier that blocks unless the page
  says why, and a Finish tier that only reports, built for the agent first so it fixes its own output.
  Checking GRAIN against the list caught GRAIN itself, so the masthead moves from eyebrow over
  headline to headline, byline, rule. None of the check is built yet.
---

Every agent I have watched build a page reaches for the same page. A small uppercase label over the
headline, one word in the headline coloured differently, three identical cards, and a sign-up box at
the bottom whether or not there is anything to sign up for. GRAIN gives it the tokens and the
components, and the agent still assembles them into that page, because that page is what the model
has seen most.

GRAIN already tests what it can test. The tokens are held, the contract is held, and this site runs
axe over every page it serves. None of that asks the question that matters here, which is whether a
person looking at the page would think a model made it.

## The prompt

Roy Derks [posted about Hallmark](https://www.linkedin.com/posts/gethackteam_this-coding-agent-skills-stops-every-ai-generated-share-7528002511081721856-McZY/),
a coding-agent skill that stops generated design before it ships. I read [the Hallmark
repo](https://github.com/Nutlope/hallmark) the same afternoon. Three ideas in it were worth taking.
It renders the page in a real browser instead of reading the source. It checks the render against a
named list of tells, so a finding is a rule and a selector rather than a feeling. And it hands the
result to a reviewer with fresh context, which sees what the agent that wrote the page has stopped
seeing.

I did not want Hallmark's taste whole. Its tells are written against a generic page, and GRAIN has a
design language of its own. So the plan is GRAIN's own check, called grain-lint, with the shape
borrowed and the rules written fresh.

## Three tiers, one job each

The useful part of Hallmark is that a rule's tier decides what a finding does. That turns a long
list of opinions into something an agent can act on without asking.

<svg viewBox="0 0 300 236" width="100%" role="img"
     aria-label="The three tiers of grain-lint. Floor blocks with no override: contrast, focus, reduced motion, hardcoded colours. Reflex blocks unless the element records a reason: the eyebrow, the coloured word, identical cards, the closing sign-up. Finish only reports: widows, spacing off the scale, images with no aspect ratio."
     style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <rect x="20" y="16" width="260" height="56" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="88" width="260" height="56" rx="6"/>
    <rect x="20" y="160" width="260" height="56" rx="6"/>
  </g>
  <g text-anchor="middle">
    <text x="150" y="40" style="fill:var(--color-bg)">Floor: always blocks</text>
    <text x="150" y="58" style="fill:var(--color-bg);font-size:12px">contrast, focus, motion, raw colour</text>
    <text x="150" y="112" style="fill:var(--color-fg)">Reflex: blocks unless it says why</text>
    <text x="150" y="130" style="fill:var(--color-muted);font-size:12px">eyebrow, coloured word, card rows</text>
    <text x="150" y="184" style="fill:var(--color-fg)">Finish: reports, never blocks</text>
    <text x="150" y="202" style="fill:var(--color-muted);font-size:12px">widows, off-scale spacing</text>
  </g>
</svg>

The Floor is the part nobody argues with: text below AA contrast, a focus ring that is gone, motion
that ignores reduced-motion, a hex value where a token belongs. Those block, with no way round them.

The Reflex tier is where slop lives. These are the moves a model makes by default, and each is
sometimes right. So a Reflex finding blocks unless the element carries its reason in an attribute,
next to the thing it excuses, where it shows up in a diff and a reviewer can disagree with it.

The Finish tier reports and stops there. A widow in a heading is worth knowing about and not worth
failing a build over.

## Built for the agent, not the review

The point is to keep slop out while an agent works, not to grade the page once it is done. So every
finding names the rule, the selector, and what GRAIN would use instead, and a static mode runs on
every edit in under a second. The agent reads the finding and fixes its own page before I look.
The rendered mode and CI are the backstop.

## It caught GRAIN first

Writing the Reflex list, I got as far as the eyebrow and stopped. GRAIN's own masthead is an eyebrow,
then a display headline, then a hairline rule. The design system I want to hold agents to had the
first tell on the list built into its header.

There were two honest options: excuse it with a recorded reason, or change it. I changed it. The
masthead becomes the headline, then a byline with the name and the date, then the rule. Context goes
below the headline and never above it, and the lint rule that follows is plain: no text above a
page's main heading except breadcrumbs, and no labels above section headings.

## Where it stands

This is a plan, not a tool. The rules are not written, nothing has run against a page, and the
masthead change has not landed. What I have is a shape I trust, borrowed from someone who built it
first, and a first finding against my own work before a line of the checker exists. I will write
again when it has run over the catalog and I can say how many findings were real.

## Sources

- Roy Derks, [LinkedIn post on Hallmark](https://www.linkedin.com/posts/gethackteam_this-coding-agent-skills-stops-every-ai-generated-share-7528002511081721856-McZY/), the prompt for this work.
- [Hallmark](https://github.com/Nutlope/hallmark), the source of the tier model, the render-and-tells check, and the fresh-context reviewer.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
