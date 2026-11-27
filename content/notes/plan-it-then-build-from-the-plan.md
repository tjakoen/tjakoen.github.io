---
title: "Plan It, Then Build From the Plan"
audience: [learn]
level: intro
subtitle: "Two hours in, the AI has touched eleven files and you can't say which of your five asks are done. A plan the AI works through, one step at a time, fixes that."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-27
readingTime: "~6 min"
tags: [ai, workflow, teaching]
summary: >
  A plan is a short checklist in a file, with a goal, small steps and what done looks like for each. Have
  the AI draft it from your brief and your drawing, edit it yourself, then build one step at a time and
  tick each off. It survives a closed session, it keeps the AI from wandering, and it tells you where you
  are. It's also the habit my own loop automates, so it's worth doing by hand first.
social: |
  Two hours into an AI session, it has touched eleven files and you can't say which of your five asks
  are done.

  The fix is boring and it works: a plan in a file, small steps, one at a time, tick each off.

  Do it by hand first. Here's how:
socialImage: "/media/notes/plan-it-then-build-from-the-plan-social.png"
socialImageAlt: "A card from the Harbor path of Learn AI with me, titled Plan It, Then Build From the Plan, with the line: Two hours into an AI session, it has touched eleven files and you can't say which of your five asks"
---

You're two hours into a session. The AI has changed eleven files, you asked for five things, and you
couldn't say which are done, which are half done, and which it quietly skipped. The chat scrolls on for
miles.

That's not a problem with the AI. It's a problem with having nothing to point at. The first thing I fixed
in my own workflow was where the plan lives. I took it out of the conversation and put it in a markdown
file in the project, and my sessions have been easier to pick up ever since.

## A plan is a list you can tick off

A short file with three parts: the goal, from your brief. A list of small steps, in order. And under each
step, what done looks like. This is an example, not a template.

```text
Goal: a one-page portfolio with an AI roadmap that shows what I've learned.
Stack: plain HTML, CSS and JavaScript on GitHub Pages, because I know them and it's free.

1. A home page with my name and one sentence, in my words.
   Done: it loads at my GitHub Pages address.
2. A roadmap section with one entry.
   Done: the entry shows a date, a title, what I learned, and a link that opens.
3. A badges section.
   Done: it shows one badge I earned, with a link to where I earned it.
```

Nothing in it is code. It's your brief cut into pieces small enough to check with your own eyes. If you've
ever been handed a ticket with acceptance criteria, it's the same thing.

## Talk about the stack first

Before the plan has steps, I ask my AI what to build this with, meaning the language, the framework and the
tools: "What are the usual ways to build this? What would you pick, and why?"

Many ways work. A mobile app might be Flutter or React Native. A website might be plain HTML, CSS and
JavaScript, which is what I use, or a framework, or even PHP. I start from the popular ones. More has been
written about them, and in my experience the AI is steadier on them too. For your portfolio, I'd suggest
plain HTML, CSS and JavaScript on GitHub Pages: free, and nothing to build. If you already know something
else, use that.

My advice hasn't changed: stick with what you're familiar with. Avoid agentic coding in a language or
framework you have no experience with at all. The AI makes anything feel easy, but if you can't read what
it wrote, you risk not knowing what you're building.

You can learn a new stack on a project, with the AI as your teacher, if you make it a learning project on
purpose. Have it explain each file and say why this way and not another. Break something and fix it
together. Don't move on until you can explain this step in your own words, or it quietly turns into blind
vibe coding. Then I put the stack at the top of the plan, with the reason. If it's new to me, I add a step
to learn the basics first.

## Let the AI draft it, then you edit it

I don't write the plan from scratch. I give my AI the brief, the drawing and the stack and ask: "Don't
write any code yet. Break this into small steps, each with what done looks like."

Then I read it like a teammate's proposal. Is a step too big, the order wrong, something missing, something
there I didn't ask for? The AI is guessing at my intentions, so the edit is where my judgment goes in. A
good step is small enough to explain in a sentence. "Build the backend" is a project, so I ask for it to
be split.

## Use what your harness already has

Your harness probably has tools for this already. Claude Code and Codex both have a planning mode, where
the agent looks around and proposes a plan before it touches a file. Both also have a goal feature: you
state the condition that means done, and the agent keeps working across turns until it's met. As I
understand it, planning mode is for when the finish line is fuzzy, and a goal is for after, when you know
it. Your done lines are exactly what a goal wants. The names and switches differ, so ask your agent how
yours works, and check the docs, such as Codex's page on
[following goals](https://developers.openai.com/codex/use-cases/follow-goals).

Use what your harness gives you before you build your own. If you work with more than one, make your
standards aware of what each can do, so each session reaches for its own tools. More on that later. And if
your sessions run dry before lunch, [Plan on the Big Model, Type on the Small One](plan-big-type-small.md)
and [I Ran Out With Hours Left](necessity-and-the-model-layer.md) are how I stretched mine.

## One step at a time

Now I build, with the habit that makes the plan work: "Do step 1 only. Stop and show me when it's done."

Left alone, the AI will run through every step and a few I didn't ask for. When it stops after one, I check
one thing against one line of done. If it's right, I tick it off and say "now step 2." If it's wrong, I
catch it while the mistake is small.

<svg viewBox="0 0 600 140" width="100%" role="img"
     aria-label="Plan, build, tick. The plan lives in a file. You tell the AI to do step 1 only and stop, you check the result against that step&#x27;s done line, then you tick it off. Then you say now step 2, and the loop repeats."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-plan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="6" y="24" width="126" height="52" rx="6"/>
    <rect x="162" y="24" width="126" height="52" rx="6"/>
    <rect x="318" y="24" width="126" height="52" rx="6"/>
  </g>
  <g style="fill:var(--color-fg);stroke:var(--color-fg)">
    <rect x="474" y="24" width="126" height="52" rx="6"/>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="132" y1="50" x2="162" y2="50" marker-end="url(#fl-plan)"/>
    <line x1="288" y1="50" x2="318" y2="50" marker-end="url(#fl-plan)"/>
    <line x1="444" y1="50" x2="474" y2="50" marker-end="url(#fl-plan)"/>
    <path d="M 552 76 L 552 104 L 288 104 L 288 78" marker-end="url(#fl-plan)"/>
  </g>
  <g text-anchor="middle">
    <text x="69.0" y="46.0" style="fill:var(--color-fg)">The plan,</text>
    <text x="69.0" y="63.0" style="fill:var(--color-fg)">in a file</text>
    <text x="225.0" y="46.0" style="fill:var(--color-fg)">Do step 1 only,</text>
    <text x="225.0" y="63.0" style="fill:var(--color-fg)">then stop</text>
    <text x="381.0" y="46.0" style="fill:var(--color-fg)">Check it against</text>
    <text x="381.0" y="63.0" style="fill:var(--color-fg)">its done line</text>
    <text x="537.0" y="46.0" style="fill:var(--color-bg)">Tick it off</text>
    <text x="537.0" y="63.0" style="fill:var(--color-bg)">in the file</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="420" y="98">now step 2</text>
  </g>
</svg>

*One step at a time: do it, check it against its done line, tick it off, then the next.*

## Keep it where it survives

I keep the plan in a file in the project, next to the brief and the drawing, and have the AI tick steps off
as it goes. The AI already edits markdown, so keeping a plan current costs it one line. If the plan lives
only in a chat, it dies when the session does. In a file, tomorrow's session picks up at step 3, because it
can see steps 1 and 2 are done. One caution: a plan lives in your repo, so never put keys or passwords in
it.

I keep mine as markdown files in a plans folder, each with a status at the top. A tool I built,
[PROOF](/proof), turns that folder into a board, and [PANTRY](/pantry) keeps the board open beside my
sessions. I built them for myself and they work for me. You don't need either. You need one file you can
read in ten seconds, and if you want a board later, build a small one of your own. The juniors on my team
each did, and [Show Them the Board](show-them-the-board.md) is that story.

## Your turn

Take the brief and drawings for your portfolio. Talk through the stack with your AI and pick one you know.
Ask for a plan with small steps and a done line for each, no code yet. Split one step, cut one, fix the
order, and save it in your project. Then tell it, "Do step 1 only, and stop," and check the result against
the done line before you let it go on. Or plan something different, and tell me how it went.

**Where I might be wrong.** A plan is a guess, and it'll be wrong somewhere. Step 2 needs something you
didn't see coming, or you change your mind after step 1. When that happens I tell the AI and update the
file. The point isn't that the plan is right. It's that we always hold the same one. For something tiny,
you may not need a plan at all.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
