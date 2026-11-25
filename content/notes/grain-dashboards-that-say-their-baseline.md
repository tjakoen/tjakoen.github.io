---
title: "Dashboards That Say What They Compare Against"
audience: [build]
level: intro
subtitle: "Most of what I build on GRAIN turns into a dashboard, and every one of them reinvented its own grid, its own delta and its own empty state. A post about a dashboard skill for coding agents gave me the rules to stop doing that."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-17
readingTime: "~3 min"
tags: [ai, grain, design, dashboards]
summary: >
  GRAIN had a stat tile, a trend chart and a data table, and nothing that put them on a page. Ram
  Maheshwari posted about dashboard-design-skill, a playbook that teaches an agent to build data
  screens instead of the usual row of KPI cards. I took the rules that fit GRAIN's monochrome
  doctrine and built a dashboards layer: a page that states its baseline, a panel with every state,
  a delta with no red or green, a bullet graph instead of a gauge, and a ranked list with a slim
  share bar. No chart library. A plan for keeping repos current with GRAIN came out of the same ask.
---

Every dashboard I have built on GRAIN started the same way: three stat tiles in a flex row, a
sentence under each number, and a chart that the page never said how to read. The course reports,
the run summaries and the cockpit home all made their own grid and their own idea of an empty panel.
The design system had the pieces and no opinion about the page.

Ram Maheshwari posted about
[dashboard-design-skill](https://github.com/abdiraimov-otabek/dashboard-design-skill) by Otabek
Abdiraimov, a skill that gives a coding agent a designer's rules for data screens
([the post](https://www.linkedin.com/posts/rammcodes_this-is-straight-up-magic-for-building-beautiful-share-7527972016134598656-01sA/)).
One commenter asked the right question: does it tell the agent which numbers matter, or only how to
lay them out? That question decided the first rule of the layer.

## The page states its baseline

A delta of 12 percent means nothing until you know what it is 12 percent of. So the dashboard head
holds three things: the title, the period, and what every delta on the page compares against, in
plain text. Each tile then carries a one-word baseline beside its change, and the sentence lives
once, in the head, instead of under every number.

<svg viewBox="0 0 300 220" width="100%" role="img"
     aria-label="The shape of a GRAIN dashboard. A head with the title and the period it compares against, then a strip of stat tiles, then a grid of panels: a ranked list spanning two columns and a bullet graph."
     style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13px">
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="20" y="64" width="80" height="44" rx="5"/>
    <rect x="110" y="64" width="80" height="44" rx="5"/>
    <rect x="200" y="64" width="80" height="44" rx="5"/>
    <rect x="20" y="120" width="260" height="44" rx="5"/>
    <rect x="20" y="174" width="125" height="36" rx="5"/>
  </g>
  <line x1="20" y1="48" x2="280" y2="48" style="stroke:var(--color-fg);stroke-width:1"/>
  <text x="20" y="38" style="fill:var(--color-fg);font-size:15px">Sales</text>
  <text x="280" y="38" text-anchor="end" style="fill:var(--color-muted);font-size:11px">vs the two weeks before</text>
  <g style="fill:var(--color-fg)">
    <text x="30" y="84">€48.2k</text><text x="120" y="84">1,204</text><text x="210" y="84">0</text>
  </g>
  <g style="fill:var(--color-muted);font-size:10.5px">
    <text x="30" y="100">▲ 12% vs prior</text><text x="120" y="100">▼ 3% vs prior</text><text x="210" y="100">was 1</text>
    <text x="30" y="138">Revenue by source</text><text x="30" y="190">Monthly target</text>
  </g>
  <g style="stroke:var(--color-fg);stroke-width:2">
    <line x1="30" y1="150" x2="165" y2="150"/><line x1="30" y1="157" x2="110" y2="157"/>
    <line x1="30" y1="200" x2="110" y2="200"/><line x1="122" y1="194" x2="122" y2="206"/>
  </g>
</svg>

## What I took, and what I left

From the skill I took the encodings: a slim share bar along each row of a ranked list instead of a
tinted block behind it, a bullet graph instead of a radial gauge, "was 1" in a quiet tone instead of
a red minus 100 percent when one sale became none, a grid that adds columns as the screen widens,
and every panel state written in words (loading, empty with a next step, stale with when it was last
true). I also took its habit of checking on screenshots at a phone and a desktop width before
calling the work done.

I left its colour. The skill ships Tailwind tokens and red and green deltas. GRAIN is monochrome on
purpose: whether up is good depends on the measure, and a component cannot know whether it is
showing revenue or churn. So direction is a glyph and a word, and the layer has no hue to lose for a
colour-blind reader.

I also left a chart library out. The trend chart already shows the pattern: the caller computes the
values, the component draws them with tokens, and a table is the text alternative. The bullet graph
and the share bars take their values through CSS custom properties.

## Operable like everything else

Every tile and panel carries a data-surface address, so a tour, a spotlight or the reasoner can point
at one number rather than at the page. A panel the AI is writing wears the same dashed in-transit
edge as every other GRAIN surface. No new verb was needed.

## The other half of the ask

The same request asked for the loop to notice which GRAIN packages a repo uses and to say when it
has fallen behind. That touches PANTRY and my agent config, so it is a plan, not code: a doctor row
that compares the resolved versions with the latest release, and an upgrade note per release that
names a codemod when markup has to change. I will build it once I have decided how far behind counts
as due.

## Sources

- Ram Maheshwari, [LinkedIn post on a dashboard skill](https://www.linkedin.com/posts/rammcodes_this-is-straight-up-magic-for-building-beautiful-share-7527972016134598656-01sA/), the prompt for this work.
- Otabek Abdiraimov, [dashboard-design-skill](https://github.com/abdiraimov-otabek/dashboard-design-skill), the source of the share bar, the one-word baseline, "was 1", the bullet graph, the panel states and the screenshot check.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
