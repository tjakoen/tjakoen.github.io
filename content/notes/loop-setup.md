---
title: "Set Up the Loop With One Prompt"
subtitle: "The prompt, the loop, the harness, and the standards you write for yourself. Start thin; add the guards when they earn it."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-11-08
readingTime: "~12 min"
tags: [ai, workflow, setup, developer-tools, process]
people: [addy-osmani, alfonso-graziano, cole-medin]
sources: [book-beyond-vibe-coding, book-loop-engineering, book-ai-native-engineering]
summary: >
  A prompt-first setup guide for the loop, the harness, and the standards you write for yourself:
  one instruction file, one plan, one checklist, one report, one human gate. It starts with the
  prompt, installs the five pieces, and shows the terminal verdict that tells you the loop loaded.
social: |
  The loop is five pieces: a front door, a plan, a checklist, a report, a human gate. This is how I
  put them on a fresh repo with one prompt, without turning the setup into a platform project.

  Start thin. Add the guards when they earn it. This is my setup, not a rule: Gemini or a local
  model fits the same loop.
---

> This is the setup companion to [The Loop Outlives the Model](one-loop-three-harnesses.md). That
> note is why the loop matters. This one is how to put it on your device.

**You can set up the loop in one session, starting with a prompt.** I call the whole thing the loop
contract: the standards you write are the rules, the repo's instruction file is the front door, the
plan is the work, the checklist is the proof that the loop loaded, the report is the evidence, and
the human gate is the stop. The harness is the program that runs the session; the model is the
rented part. The model is not in the contract. That is the point.

This is my setup, not a requirement. Take what fits and improve the rest. The loop is model-agnostic:
I use Claude, Codex and DeepSeek, and the same shape would take Gemini, a local model, or whatever
comes next.

## Start with the prompt

**The prompt is short.** It points at this page, and the page carries the detail. Paste this into
a fresh session at the repo root.

```text
Set up the loop in this repo. Read the setup guide:
https://portfolio.tjakoen.com/notes/loop-setup
Start with the smallest first step. Do not edit anything
until you have told me what you found and what you would
do first.
```

**The right answer is small.** It should name the instruction file, the plan, the one check, the
first task, and the public rule you would rewrite for this repo. If it comes back with a platform, a
hook for every event and a migration plan, stop. That is the loop as a settings project, not the
loop as a practice.

<details class="note-agent">
<summary>Read this if you're an agent</summary>

The page you are reading is the setup. The one-line prompt is enough for a person; if you need the
exact brief, run this:

```text
You are setting up my AI loop on this repo. Read these public
standards as a reference, not a rulebook:
- https://portfolio.tjakoen.com/standards/loop
- https://portfolio.tjakoen.com/standards/session-loop
- https://portfolio.tjakoen.com/standards/hooks
- https://portfolio.tjakoen.com/standards/ai-repo-standard
- https://portfolio.tjakoen.com/standards/voice

Then inspect this repository and tell me, before you write
anything:
1. What already exists: the instruction file, the plan, the
   tests, the CI, the git state, and the board.
2. What is missing for a session to start with a check,
   work from a plan, leave a report, and stop at a human gate.
3. Where these public standards do not fit this repo, and what
   we should write in our own front door instead.
4. The smallest first step, with the exact files and commands.

If this repository has a pantry.config.json, use PANTRY:
orient first, then next, claim the plan, heartbeat while
you work, and release it when done. PANTRY is optional;
it is just the board I use. If it does not, the plans
folder is enough.

Do not edit or install anything yet. Ask me before the first
write. Keep the loop thin: one instruction file, one plan, one
report, one check. Do not copy the standards into the repo;
link them.
```

**What the exact brief is doing:**
- It sets the boundary: read first, no writes, ask before the first one.
- It names the five pieces.
- It asks where the public standards do not fit, so you write your own.
- It asks for the smallest first step.
- It keeps [PANTRY](/pantry) optional; the plans folder is enough.
- It keeps the standards public: link, do not copy.

</details>

If the answer is longer than a screen, ask for the first step only. The rest can wait.

## What the loop is

**The loop is five pieces. The harness is the program that runs them. The model is not one of them.**

| Piece | What it is | What it proves |
|---|---|---|
| The front door | One instruction file, linked to the standards you keep | A session knows the rules before it writes |
| The plan | One markdown file in the repo | The work has a scope and a finish |
| The checklist | One script, one verdict | The loop loaded, not just the model |
| The report | The run, the checks, the evidence | The work can be checked without asking you |
| The human gate | The lane, the commit, the publish | The judgment stays human |

<svg viewBox="0 0 600 400" width="100%" role="img"
     aria-label="The loop runs around the front door: plan, session with the checklist first, report, second reader, human, then the next plan. The arrows circle the loop."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-loop0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <rect x="10" y="10" width="580" height="380" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1;stroke-dasharray:5 5"/>
  <text x="30" y="34" style="fill:var(--color-muted);font-size:11px">The front door: the rules</text>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="235" y="43" width="130" height="44" rx="6"/>
    <rect x="363" y="136" width="130" height="44" rx="6"/>
    <rect x="314" y="287" width="130" height="44" rx="6"/>
    <rect x="156" y="287" width="130" height="44" rx="6"/>
    <rect x="107" y="136" width="130" height="44" rx="6"/>
  </g>
  <rect x="107" y="136" width="130" height="44" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <path d="M 300 135 A 65 65 0 0 1 361.8 179.9" marker-end="url(#fl-loop0)"/>
    <path d="M 361.8 179.9 A 65 65 0 0 1 338.2 252.6" marker-end="url(#fl-loop0)"/>
    <path d="M 338.2 252.6 A 65 65 0 0 1 261.8 252.6" marker-end="url(#fl-loop0)"/>
    <path d="M 261.8 252.6 A 65 65 0 0 1 238.2 179.9" marker-end="url(#fl-loop0)"/>
    <path d="M 238.2 179.9 A 65 65 0 0 1 300 135" marker-end="url(#fl-loop0)"/>
  </g>
  <g text-anchor="middle">
    <text x="300" y="63" style="fill:var(--color-fg);font-size:14px">Plan</text>
    <text x="300" y="80" style="fill:var(--color-muted);font-size:11px">one markdown file</text>
    <text x="428" y="156" style="fill:var(--color-fg);font-size:14px">Session</text>
    <text x="428" y="173" style="fill:var(--color-muted);font-size:11px">the checklist runs first</text>
    <text x="379" y="307" style="fill:var(--color-fg);font-size:14px">Report</text>
    <text x="379" y="324" style="fill:var(--color-muted);font-size:11px">the checks it ran</text>
    <text x="221" y="307" style="fill:var(--color-fg);font-size:14px">Second reader</text>
    <text x="221" y="324" style="fill:var(--color-muted);font-size:11px">someone else checks</text>
    <text x="172" y="156" style="fill:var(--color-bg);font-size:13px">The human lands it</text>
    <text x="172" y="173" style="fill:var(--color-bg);font-size:11px">the judgment is human</text>
    <text x="300" y="200" style="fill:var(--color-muted);font-size:12px">The loop</text>
  </g>
</svg>

*The loop: a plan, a session with the checklist first, a report, a second reader, and the human who lands it. The front door is the rules around all of it. Then the next plan.*

The standards are the rules you write. The public set is my example. The repo's instruction file is
the front door. The plan is the work. The checklist is the proof that the loop loaded. The report is
the evidence. The human gate is the stop. The harness is the program that calls those pieces; the
adapter step is the only part that changes per harness. The model is the rented part.

A contract is something both sides can check. The model can change; the contract stays.
[Addy Osmani](/people#addy-osmani) calls the gap between the code you can generate and the code you can
understand comprehension debt. The loop is how I keep that debt visible.

The five pieces are the thin loop. The guards and the adapters are add-ons. You do not need them on
the first day.

## Your standards are the contract you write

**The public standards are my example, not a rulebook you adopt.** Read them, steal the shape, and
write the version that fits your work. The front door is where your standards live. If a public rule
does not fit, write the version that does, and say why. A standard you did not write is a rule you
cannot defend.

The prompt asks the AI to tell you where the public standards do not fit. That is the point. The
loop is yours; the standards are the part you keep.

## Step one: the front door

**One instruction file, linked to the standards, not a copy of them.**

The front door is the AGENTS.md file, with CLAUDE.md as a symlink to it. It is the first file a
session reads. It should answer four questions in plain language: what this repo is, how to run the
checks, where the plan lives, and what a session may not touch.

**What to put in it:**
- The repo, the stack, the commands.
- The standards links you actually use: mine, or yours. The public set is a reference.
- The rules you wrote, where they differ from the public set.
- The loop: where the plan lives, how to run the checklist, where the report goes, what the human
  gate is.
- The board, if you have one: PANTRY or a plans folder.
- The one-file rule: AGENTS.md is the file; CLAUDE.md is the symlink; no second copy.

**What not to do:** paste the standards into the file. A copy is a future argument about which one
is right. Link them, and let the standards carry the detail. Do not adopt a public rule you have not
read; a rule you cannot defend is not yours.

The prompt should propose this file first. If it proposes a hook or a platform before the front door,
ask it to start again.

## Step two: the plan and the report

**The plan is a markdown file. The board is a window. The report is the receipt.**

A plan in the repo is enough. Put it in a plans folder, give it a scope, a finish, and a status. The
board is a view of those files. Mine is PANTRY, the orchestrator I built: it reads the plans folder,
shows what is ready, and lets a session claim a plan, heartbeat while it works, and release it when
it is done. It writes nothing back; the markdown is the truth.

PANTRY is live, and it is not required for this setup. It is just what I use. If your
repo has a pantry.config.json, use the PANTRY flow: orient first, take the next plan, claim it,
heartbeat while you work, and release it when done. If it does not, a plans folder is the same shape.
The plan file is the truth; the board is the window. The plan is not a project management tool. It is
the sentence the session can finish.

The report goes in an artifacts folder, dated and named. It carries the checks that actually ran,
the output, the diff, and the open questions. It is not a diary. It is the evidence the next person
needs.

**What to check:**
- The plan has a finish.
- The report names the checks, not just the result.
- The report is short enough for a second person to read.

## Step three: the checklist

**The checklist is the piece that tells you the loop loaded.**

One script. It runs at the start of a session. It checks the things that have to be true before you
trust the session: the instructions loaded, the front door is there, the plan exists, the check
runs, the board and the code map are reachable, and the tree is clean. It ends with one verdict:
Agentic Loop Loaded, or not loaded with the failing rows named.

This is the checklist from this repo, shortened to fit. The rows are my machine; yours will name
your plan, your tests and your board.

<div class="note-terminal" role="region" aria-label="The session checklist output" style="margin:1.5rem 0;padding:1rem 1.1rem;border-radius:6px;background:var(--color-fg);color:var(--color-bg);overflow-x:auto;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.78rem;line-height:1.65">
<pre style="margin:0;padding:0;border:0;background:transparent;color:inherit;font:inherit;white-space:pre">Agentic loop check, tjakoen.github.io (PANTRY project, DSH)
 ok   DSH, deepseek-flash
 ok   Instructions: global + repo, 18k chars of the 20k budget
 ok   Memory: 83 notes, index loads whole
 ok   DSH loop: plugin linked and mounted
 ok   MCP: pantry, tokensave, headroom configured
 ok   No style override
 ok   Standards: 21 skills mounted
 ok   PANTRY: serving tjakoen.github.io, 1 ready, 0 claimed
 ok   tokensave: indexed, 0 day(s) old
 ok   graphify: graph 0 day(s) old
 ok   Git: codex/nest-terminal-controls, 0 uncommitted
Agentic Loop Loaded (DSH)</pre>
</div>

**How to run it:** at the start of a session, before the work. Show the block verbatim. The model
does not write the verdict. If the hook printed nothing, say the checklist did not run.

**The checklist is not a test suite.** It proves the loop loaded. The tests and the CI prove the
work. The second reader proves the judgment. Do not ask one tool to do all three.

**What to do when a row fails:** fix the row, not the output. Do not edit the block. The owner reads
it precisely because the script produced it and the model did not.

## Step four: the guards, when they earn it

**Start with the guards as prose. Move them to hooks when the same mistake happens twice.**

The first guard is the human lane: the short list of paths only you touch. The deploy config, the
billing code, the secrets, the employer repo. Write the lane in the front door. Add a hook only when
the honor system fails.

The second guard is the handoff. A subagent gets four headings:

```text
Lane: high, gated or human, and why
Scope cap: the dirs it may touch
Hard stops: no push, no publish, no merge
Ask-triggers: what stops the run, and where the ask goes
```

Start with the headings as prose. Add a check when a handoff arrives without them.

The audit found one thing worth telling. A handoff I had written as a numbered list passed the old
guard and failed the new one. The new guard was looking for a colon; the numbered list did not have
one. A numbered list is a normal way to write a handoff, so the guard was wrong. I fixed it and
added the numbered case to the test. The lesson is bigger than the bug: a rule with two
implementations needs one test list, and I did not have one.

**What to do about it:** write one test list for the rule, not one per harness. Run the same cases
against both. If the rule lives in two places, the test list is the only thing that keeps them
honest.

The guards protect the five pieces. Do not add them before the pieces.

## Step five: the adapter

**The adapter is the only part that changes per harness.**

Claude Code and Codex use hooks. DeepSeek uses a plugin, because it has no shell hook events. The
checklist, the standards, the plan and the report are the same. The adapter is the small piece that
calls them.

The loop is model-agnostic. I use Claude, Codex and DeepSeek; you can wire Gemini, a local model, or
whatever you use. The adapter is the only part that changes.

| Harness | The adapter | What you still do by hand |
|---|---|---|
| Claude Code | A settings file runs the scripts | Nothing on a normal turn |
| Codex | The same scripts in its hooks file | Keep the settings copy in sync |
| DeepSeek Harness | A plugin, because it has no shell hook events | Run the end command before you call it done |

<svg viewBox="0 0 600 300" width="100%" role="img"
     aria-label="The public standards, the loop, voice, hooks, note and figure rules, feed one private agent-config repo; that repo wires three harnesses, Claude Code and Codex through shell hooks and DeepSeek Harness through a plugin and MCP; each harness runs the same loop in a repo."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-three0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <rect x="90" y="16" width="420" height="56" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="90" y="110" width="420" height="44" rx="6"/>
    <rect x="15" y="230" width="180" height="48" rx="6"/>
    <rect x="210" y="230" width="180" height="48" rx="6"/>
    <rect x="405" y="230" width="180" height="48" rx="6"/>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="300" y1="72" x2="300" y2="110" marker-end="url(#fl-three0)"/>
    <path d="M300,154 L300,190"/>
    <line x1="105" y1="190" x2="495" y2="190"/>
    <line x1="105" y1="190" x2="105" y2="230" marker-end="url(#fl-three0)"/>
    <line x1="300" y1="190" x2="300" y2="230" marker-end="url(#fl-three0)"/>
    <line x1="495" y1="190" x2="495" y2="230" marker-end="url(#fl-three0)"/>
  </g>
  <g text-anchor="middle">
    <text x="300" y="38" style="fill:var(--color-bg);font-size:14px">The public standards</text>
    <text x="300" y="56" style="fill:var(--color-bg);font-size:12px">loop, voice, hooks, note, figures, conformance</text>
    <text x="300" y="128" style="fill:var(--color-fg)">The private agent-config</text>
    <text x="300" y="144" style="fill:var(--color-muted);font-size:12px">settings, checklist, hooks, MCP, paths</text>
    <text x="105" y="251" style="fill:var(--color-fg)">Claude Code</text>
    <text x="105" y="267" style="fill:var(--color-muted);font-size:12px">shell hooks</text>
    <text x="300" y="251" style="fill:var(--color-fg)">Codex</text>
    <text x="300" y="267" style="fill:var(--color-muted);font-size:12px">shell hooks</text>
    <text x="495" y="251" style="fill:var(--color-fg)">DeepSeek Harness</text>
    <text x="495" y="267" style="fill:var(--color-muted);font-size:12px">plugin + MCP</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="300" y="176">one loop, three adapters</text>
  </g>
</svg>

*The public standards are the contract; the private config is the wiring; the adapter is what
changes. My wiring; yours can be one file.*

You do not need three harnesses. Start with the one you use. The loop is one instruction file, one
checklist, one plan, one report. The adapter is the only swap.

The public standards are the contract. The private config is the wiring. I keep a private config
repo with the settings, the checklist, the guards, the board connection and the machine paths. You
can start with one file.

**What to move, what to keep.** The test is whether a reader could use it without your machine. The
voice rules pass. The checklist rule passes. The handoff headings pass. The machine paths, the
employer rules and the secrets do not.

The private config is one point of failure: if it breaks, every machine breaks. It is not a copy
per machine. link-machine.sh links each machine to the same config, and the checklist catches a
machine that has slipped. Keep it small.

## The first run

**A fresh session, the checklist, one small task, one report, one second reader.**

1. Open a fresh session at the repo root.
2. Run the checklist. Read the verdict. Fix the failing rows.
3. Pick a task small enough for one session. Write the plan. Do the work. Leave the report.
4. Give the report to a second reader. Let the human land it.

**What good looks like:** the checklist block is at the top, the verdict is loaded, the plan has a
finish, the report names the checks, and the second reader can explain the change without you.

**The next start is the backstop.** If a session leaves work uncommitted, the next session's
checklist sees it and asks. The close check reads the session log and scopes the dirty paths to the
session. The nudge is the reminder; the close is the check; the next start is the tree check.

**Two ways this goes.** If you start with the prompt and the five pieces, you have a checked session
by the end of the day and a loop you can improve. If you start with the platform, you have a
settings project, a half-installed adapter and no work. The first is boring. The second is why most
people stop.

**What the loop cannot prove:** the checklist proves the loop loaded, not that the work is good. The
second reader is still the thing that catches the work. The private config can drift. The adapter is
code, and code rots. The model will change.

**What to do about it:**
- Start with one repo and one harness.
- Add the second harness after the first run.
- Keep the human gate. Do not automate the commit or the publish.
- Read the standards; do not copy them.
- Keep one test list for the rules that live in two places.

## The sources

**The people are on the reading page, not in a footnote.** [The reading page](/reading) has the work
that shaped this: [Addy Osmani](/people#addy-osmani) on the loop and the
comprehension-debt warning, [Alfonso Graziano](/people#alfonso-graziano) on writing down
what you meant, and [Cole Medin](/people#cole-medin) on the project as one artifact. The public
standards are my own draft, not a universal; the reading page is the trail back to the people, and
the standards are the shape I made from them. Write yours.

## The turn

**The model will change. The loop is the part you keep.** Start with the prompt. The model can
change after.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
