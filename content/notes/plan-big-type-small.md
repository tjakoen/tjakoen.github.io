---
title: "Plan on the Big Model, Type on the Small One"
subtitle: "A junior developer kept running out of tokens before lunch. The fix was advice I had stopped thinking of as advice: let the expensive model think, hand the typing to cheaper subagents, and turn the effort dial down further than feels safe."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-13
readingTime: "~8 min"
tags: [ai, claude-code, codex, workflow, tokens]
summary: >
  Plan and orchestrate on Opus, implement with Sonnet subagents, and try low effort before assuming
  you need high. Why the split works, why the biggest models rarely pay for themselves in my daily
  work, how to run a trial instead of taking my word for it, and the same pattern in Codex.
social: |
  "Why do I keep running out of tokens before lunch?"

  A junior developer asked me that this week. Every turn they ran, the planning, the renames, the
  one-line fixes, went to the biggest model at the highest effort.

  What I told them, which I had stopped noticing I do:

  Plan and orchestrate on Opus. Hand the typing to Sonnet subagents. Try low effort before you
  assume you need high, and run ten tasks on each to find out.

  The part that matters more: low effort only works for me because months of small rules live in my
  repo, not in the model's head. Models get retired. The loop you build around them stays, and
  it is the real skill to start on.
socialImage:
  - "/media/notes/plan-big-type-small-social-1-question.png"
  - "/media/notes/plan-big-type-small-social-2-split.png"
  - "/media/notes/plan-big-type-small-social-3-loop.png"
socialImageAlt:
  - "Card one of three, a question set large: Why do I keep running out of tokens before lunch? Below it, the answer was advice I thought was obvious."
  - "Card two of three: plan on the big model, type on the small one. Opus plans, Sonnet types each piece, Opus reviews, with a tier above for research on Fable."
  - "Card three of three: a rule written once, read by every session after it. One file grows into instructions, checks and hooks. Models get retired; the loop you build stays."
---

## The question that made me write this

A junior developer came to me this week with a simple complaint. Their sessions kept hitting the
limit before lunch, and they wanted to know what I was doing differently.

I watched how they worked for a few minutes. Everything ran on the biggest model at the highest
effort setting: the planning, the file reads, the one-line fixes, the renames. Every turn was paying
top rate, including the turns that were just typing.

I told them two things. Plan and orchestrate on Opus, and let Sonnet subagents do the implementing.
And put Opus on low effort for a while and see whether you miss anything.

They had not heard either one. I was honestly surprised, and then I realised why. I have been knee
deep in this for months. Somewhere along the way these stopped being decisions and became habits,
and a habit is the easiest thing in the world to forget you ever had to learn. That is the reason
this note exists.

## Thinking and typing are different jobs

Most of a build task is not hard. Deciding what to change, in which files, in what order, and what
done looks like is hard. Writing the function once all of that is decided is mostly typing. Paying
the most capable model to do the typing is paying a senior engineer to retype a spec.

So the work splits in two. The main session runs on Opus. It reads the code, asks the questions,
writes the plan, and cuts the work into pieces small enough that each one has a settled answer.
Each piece goes to a Sonnet subagent with a short brief: the files, the contract, the finish line.
The subagent works in its own context and hands back a result. Opus reads it, checks it against the
plan, and either accepts it or sends it back.

<svg viewBox="-1 0 342 360" width="100%" role="img"
     aria-label="Opus reads the code and plans. The plan becomes a short brief per piece. Each brief goes to its own Sonnet subagent, which does the typing. Opus reviews every result against the plan: what fails is sent back as a new brief, and what passes is done."
     style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-planbig0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="60" y="16" width="180" height="36" rx="6"/>
    <rect x="60" y="88" width="180" height="36" rx="6"/>
    <rect x="10" y="160" width="130" height="36" rx="6"/>
    <rect x="160" y="160" width="130" height="36" rx="6"/>
    <rect x="30" y="232" width="240" height="36" rx="6"/>
  </g>
  <rect x="60" y="304" width="180" height="36" rx="6"
        style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="150" y1="52" x2="150" y2="84" marker-end="url(#fl-planbig0)"/>
    <line x1="125" y1="124" x2="82" y2="156" marker-end="url(#fl-planbig0)"/>
    <line x1="175" y1="124" x2="218" y2="156" marker-end="url(#fl-planbig0)"/>
    <line x1="82" y1="196" x2="125" y2="228" marker-end="url(#fl-planbig0)"/>
    <line x1="218" y1="196" x2="175" y2="228" marker-end="url(#fl-planbig0)"/>
    <line x1="150" y1="268" x2="150" y2="300" marker-end="url(#fl-planbig0)"/>
    <path d="M270,250 C318,250 318,106 244,106" marker-end="url(#fl-planbig0)"/>
  </g>
  <g text-anchor="middle">
    <text x="150" y="38.3" style="fill:var(--color-fg)">Opus reads and plans</text>
    <text x="150" y="110.3" style="fill:var(--color-fg)">A brief per piece</text>
    <text x="75" y="182.3" style="fill:var(--color-fg)">Sonnet subagent</text>
    <text x="225" y="182.3" style="fill:var(--color-fg)">Sonnet subagent</text>
    <text x="150" y="254.3" style="fill:var(--color-fg)">Opus reviews against the plan</text>
    <text x="150" y="326.3" style="fill:var(--color-bg)">Done</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;
       stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="300" y="146">sent back</text>
  </g>
</svg>

*The split: the expensive model thinks at both ends, and the cheap one does the typing in between.*

There is a second saving hiding in that picture. Every file a subagent reads lives in the
subagent's context, not the main one. The orchestrating session stays small, so every later turn in
it is cheaper, and the plan does not get buried under a pile of file dumps.

The split has one rule that matters more than the rest. Only hand off work that is already decided.
A subagent given a piece that is still being designed will design it for you, quietly, and you will
find out in review. If you cannot write the brief in a few lines, the piece is not ready to leave.

## The biggest model is not the default

I almost never reach for the very top tier, Fable on the Claude side or Astra on the Codex side. I
have played with both, and they are impressive. For what I do day to day, the tokenomics just do
not work. Opus and Sol have built nearly everything I have shipped this year, and the gap between
them and the top tier rarely shows up in a pull request.

Where Fable has earned its place is research and audits: reading a whole project and telling me
what I got wrong, or working through a question where breadth and depth matter more than speed. It
has been a godsend for that. But notice that even then it does not replace the pattern. It adds a
layer on top of it. Plan on Fable, orchestrate on Opus, implement with Sonnet subagents. The
expensive model does the one job only it does well, and then hands off.

<svg viewBox="-1 0 362 236" width="100%" role="img"
     aria-label="Three tiers, top to bottom. Fable plans: research, audits and the big questions, used rarely. Opus orchestrates: it cuts the plan into briefs and reviews every result. Sonnet subagents implement: they type each settled piece. Each tier hands down to the one below, and the cheapest tier does the most work."
     style="display:block;width:100%;max-width:420px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-planbig1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="110" y="16" width="140" height="44" rx="6"/>
    <rect x="70" y="96" width="220" height="44" rx="6"/>
  </g>
  <rect x="10" y="176" width="340" height="44" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="180" y1="60" x2="180" y2="92" marker-end="url(#fl-planbig1)"/>
    <line x1="180" y1="140" x2="180" y2="172" marker-end="url(#fl-planbig1)"/>
  </g>
  <g text-anchor="middle">
    <text x="180" y="36" style="fill:var(--color-fg)">Fable plans</text>
    <text x="180" y="52" style="fill:var(--color-muted);font-size:11.5px">research and audits, rarely</text>
    <text x="180" y="116" style="fill:var(--color-fg)">Opus orchestrates</text>
    <text x="180" y="132" style="fill:var(--color-muted);font-size:11.5px">briefs every piece, reviews every result</text>
    <text x="180" y="196" style="fill:var(--color-bg)">Sonnet subagents implement</text>
    <text x="180" y="212" style="fill:var(--color-bg);font-size:11.5px">most of the tokens, at the lowest rate</text>
  </g>
</svg>

*The wider the box, the more of the work it does. The narrowest box costs the most per token.*

## Try low effort before you assume high

The second piece of advice surprised them more. I run Opus on low effort almost all of the time.

That works for me, and I want to be honest about why. Over the past months I built a loop around
the model: instruction files that say how each repo works, standards installed as skills, hooks
that check the work at session start and before it is called done, a plan file for every piece of
work. On low effort the model does not have to work out from nothing how I like things done,
because the repo tells it. The thinking that high effort would spend rediscovering the context is
already written down.

A fresh setup does not have that, so low effort may cost you something there. Do not take my word
for it either way. Run a trial:

1. Pick twenty ordinary tasks from your backlog, the kind you do every week.
2. Do ten on medium effort and ten on low.
3. Have your agent log each one as it finishes: the task, the effort setting, the tokens used,
   whether it needed a second attempt, and what you had to correct.
4. Compare the two halves at the end.

When low effort gets something wrong, ask one question about it. Would more thinking have fixed
this, or would one line in my instruction file have fixed it? Usually it is the line. Write it,
and every session after that gets it for free, at any effort level. Raise the effort for the turns
that earn it, a hard design call, a bug that has already beaten one attempt, a plan for a large
change, and then drop it again.

<svg viewBox="-36 0 377 262" width="100%" role="img"
     aria-label="How a miss becomes part of the loop. A session on low effort gets something wrong. Ask whether more thinking or one written rule would have fixed it. Usually the rule: write it into the instruction file. Every later session reads that file, at any effort level, so the next session starts smarter, and the cycle repeats with the next miss."
     style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-planbig2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="70" y="16" width="200" height="36" rx="6"/>
    <rect x="40" y="88" width="260" height="36" rx="6"/>
    <rect x="70" y="208" width="200" height="36" rx="6"/>
  </g>
  <rect x="70" y="148" width="200" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="170" y1="52" x2="170" y2="84" marker-end="url(#fl-planbig2)"/>
    <line x1="170" y1="124" x2="170" y2="144" marker-end="url(#fl-planbig2)"/>
    <line x1="170" y1="184" x2="170" y2="204" marker-end="url(#fl-planbig2)"/>
    <path d="M70,226 C10,226 10,34 66,34" marker-end="url(#fl-planbig2)"/>
  </g>
  <g text-anchor="middle">
    <text x="170" y="38.3" style="fill:var(--color-fg)">Low effort gets it wrong</text>
    <text x="170" y="110.3" style="fill:var(--color-fg)">More thinking, or one written rule?</text>
    <text x="170" y="170.3" style="fill:var(--color-bg)">Write the rule down</text>
    <text x="170" y="230.3" style="fill:var(--color-fg)">Every session reads it</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="22" y="134">next miss</text>
  </g>
</svg>

*A miss fixed with thinking is paid for again tomorrow. A miss fixed with a rule is paid for once.*

## The same pattern in Codex

None of this is specific to Claude. I run Claude, Codex and DeepSeek side by side, and I wrote
about why the loop matters more than any one of them in
[The Loop Outlives the Model](one-loop-three-harnesses.md). In Codex my setup is Sol 6.1 on light
for the main session and Luna on medium for the subagents. Same shape: the stronger model plans and
reviews, the cheaper one types. Codex reads an AGENTS.md the way Claude Code reads a CLAUDE.md, and
in my setup they are the same file, so the rules that make low effort safe in one tool make it safe
in the other.

## The lesson

What I was really telling that junior developer is where the intelligence in a session should
live. If it lives only in the model, you pay for it on every
turn, at the highest rate, and you pay again tomorrow. If it lives in your files, the plan, the
instructions, the rules you wrote down after something went wrong, then a cheaper model on a lower
setting can carry it, and the expensive one is free for the few calls that need it.

- Plan and review on the big model. Implement on the small one.
- Only delegate work that is already decided, with a brief of a few lines.
- Save the top tier for research and audits, and put it above the pattern, not in place of it.
- Measure low against medium on your own work before you decide.
- Fix a miss with a written rule before you reach for more thinking.

## Where this goes next

Here is what I told that junior developer at the end, and what I would tell anyone starting out.
The model split and the effort setting are the easy part. They save you tokens this week. What
saves you tokens, time and frustration for the rest of your career is the thing underneath them.

None of what I run today existed on day one. It started as one instruction file with three rules in
it. Then a rule I kept repeating to the model became a line in that file. A mistake I kept catching
in review became a check. A check I kept forgetting to run became a hook. Months of small additions
later, I have a loop that orients every session, holds the work to a standard, and refuses to call
something done before it is. That is why low effort works for me. The model is the same one everyone
else gets. The floor it stands on took me months.

You can build yours the same way, one rule at a time. Start with the word itself: I wrote about what
a harness is, and why the machinery around the model matters more than the model, in
[Everybody Wants the Agent. Somebody Has to Build the Floor.](build-the-floor.md) The story of how
my own loop came together, and why I needed it, is in
[I Was Shipping Faster Than I Could Understand It](one-loop-every-repo.md). When you are ready to
set one up, [Set Up the Loop With One Prompt](loop-setup.md) gets you started in an afternoon. And
once it runs, [The Loop Outlives the Model](one-loop-three-harnesses.md) shows why it keeps paying
off long after the model you built it for has been replaced.

Every model you use today will be retired. The loop you build around them stays, and it gets better
every time you teach it something. That is the real skill in working with AI, and you can start on
it today, with one file and the first rule you are tired of repeating.

What feels obvious to me after months of doing this was news to someone last week. A year from now,
your loop will be the obvious thing you forget you ever had to learn. Write it down, and pass it on.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
