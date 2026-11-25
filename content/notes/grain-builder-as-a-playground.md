---
title: "Rethinking the GRAIN Builder as a Playground"
audience: [build]
level: intro
subtitle: "My builder lets an AI pick from a menu of five blocks and calls that building a page. An A2UI playground showed me what it looks like when the model writes the page and you watch it happen."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-17
readingTime: "~3 min"
tags: [ai, grain, builder]
summary: >
  The GRAIN builder works, and I find it weak. Asked for three stat cards, it draws three identical
  cards that all say the same thing, because the model only names blocks and code fills the copy.
  Atai Barkai's post about the A2UI playground showed the other shape: the model writes the whole
  tree, one component per line, and you watch the code arrive beside the page. The plan is a three
  pane builder, a compose format GRAIN validates line by line, and two named authors. Nothing is
  built, and the biggest choice, GRAIN's own format or A2UI itself, is still open.
---

I asked my own builder for a lede, three stat cards and a sign-up form. It drew three cards that all
said "18 atoms". The page claims an AI builds it, and what it shows is an AI that chose three names
from a menu of five while my code filled in the rest. Anyone who looks twice can see that.

## The prompt

Atai Barkai [posted about the A2UI playground](https://www.linkedin.com/posts/atai-barkai_we-built-an-a2ui-playground-ask-the-agent-ugcPost-7527800388524171264-FOIp/)
that CopilotKit built. I opened [the playground](https://a2ui.open.bot) and asked it for Q3 sales by
region as a dashboard. It answered in about twelve lines, one component per line, each with an id
and its props, copy and numbers included. The code filled in on one side while the page painted on
the other. The commenters under the post singled out the same thing I did: watching the code arrive
is the part worth learning from.

[A2UI](https://a2ui.org) is Google's spec underneath it. The agent may place only components the
app has registered, the tree streams, and data is declared rather than run. That last stance is
GRAIN's own. The rest is what my builder is missing.

## Why mine feels weak

There are four reasons, and none of them is the styling. The model is not authoring anything: it
names parts. There is nothing to watch: the page appears all at once. The vocabulary of five blocks
and three widths cannot say "dashboard", so every ask turns into the same page. And the control rail
the human gets reaches further than the three verbs the model gets, which turns the demo inside
out.

Under all four sits the model. I measured the in-browser 0.5B on the builder in August and it got
zero of eighteen edits right. No redesign that keeps it as the only author fixes the result.

## The shape I want

<svg viewBox="0 0 300 150" width="100%" role="img"
     aria-label="The planned builder in three panes. On the left, the prompt and sample asks. In the middle, the code pane, where each component arrives as one line and is ticked or refused by GRAIN's validation. On the right, the canvas, which paints each component once its line passes."
     style="display:block;width:100%;max-width:440px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="bp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="8" y="20" width="80" height="110" rx="6"/>
    <rect x="200" y="20" width="92" height="110" rx="6"/>
  </g>
  <rect x="106" y="20" width="76" height="110" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="88" y1="75" x2="104" y2="75" marker-end="url(#bp-arrow)"/>
    <line x1="182" y1="75" x2="198" y2="75" marker-end="url(#bp-arrow)"/>
  </g>
  <g text-anchor="middle">
    <text x="48" y="70" style="fill:var(--color-fg)">Prompt</text>
    <text x="48" y="88" style="fill:var(--color-muted);font-size:12px">and samples</text>
    <text x="144" y="70" style="fill:var(--color-bg)">Code</text>
    <text x="144" y="88" style="fill:var(--color-bg);font-size:12px">line by line</text>
    <text x="246" y="70" style="fill:var(--color-fg)">Canvas</text>
    <text x="246" y="88" style="fill:var(--color-muted);font-size:12px">paints on pass</text>
  </g>
</svg>

Three panes: the conversation, the code, the page. Each line in the code pane is checked by the same
door GRAIN already uses to refuse a bad edit, so a wrong line is refused alone and does not sink the
page. The rail moves under the canvas as an inspector, so the human controls stay. A hosted model
writes the tree, the 0.5B keeps the small edits it can manage, and the page says which one wrote
what. No fallback gets to claim an AI wrote what code wrote.

The masthead follows the slop check from [the other half of this
work](slop-stays-out-of-grain.md): headline, byline, rule, no eyebrow. The playground's own heading
carries an eyebrow, and GRAIN's catalog will not offer one.

## The choice I have not made

GRAIN's contract today is a set of verbs that edit a page that already exists, and it has no verb
that adds. To be the thing a model writes, GRAIN needs a catalog of components with typed props,
containers that nest, data as records, and a way to create. I can build that as GRAIN's own small
compose format, or I can emit A2UI itself and register GRAIN's components as its catalog. The first
keeps the format mine. The second gets the renderers and the ecosystem for free. I want one spike of
each before I choose.

There are honest open questions too. Should a public portfolio page call a hosted model at all, and
who pays? Is the no-add rule retired or kept for the small model? None of the builder above exists
yet. It is a plan with a mockup, and the screenshot of three identical cards is still live at
/grain/builder.

## Sources

- Atai Barkai, [LinkedIn post announcing the A2UI playground](https://www.linkedin.com/posts/atai-barkai_we-built-an-a2ui-playground-ask-the-agent-ugcPost-7527800388524171264-FOIp/), and the comments under it.
- [The A2UI playground by CopilotKit](https://a2ui.open.bot), the source of the three-pane layout and the line-by-line stream.
- [A2UI, Google's site and spec](https://a2ui.org), for the locked catalog, the streamed format and declared data.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
