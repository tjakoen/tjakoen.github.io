---
title: "Plan on the Big Model, Type on the Small One"
subtitle: "Advice I gave a junior developer this week, which I had assumed everyone already knew: let the expensive model think and orchestrate, hand the typing to cheaper subagents, and turn the effort dial down further than feels safe."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-13
readingTime: "~5 min"
tags: [ai, claude-code, codex, workflow, tokens]
summary: >
  Plan and orchestrate on Opus, implement with Sonnet subagents, and try Opus on low effort before
  assuming you need high. Why the split works, why low effort works for me only because the loop
  around it does the remembering, and the same pattern in Codex.
---

## The thing I thought was obvious

A junior developer asked me this week why their sessions kept burning through their limit before
lunch. I looked at how they worked and gave them two pieces of advice. The first was to plan and
orchestrate on Opus and let Sonnet subagents do the implementing. The second was to put Opus on low
effort and see whether they missed anything.

They had not heard either one. I had stopped thinking of them as advice at all, which is usually a
sign something is worth writing down.

## Thinking and typing are different jobs

Most of a build task is not hard. Deciding what to change, in which files, in what order, and what
done looks like is hard. Writing the function once that is decided is mostly typing. Paying the
most capable model to do the typing is paying a senior engineer to retype a spec.

So the split goes like this. The main session runs on Opus. It reads the code, asks the questions,
writes the plan, and breaks the work into pieces small enough that each one has a settled answer.
Each piece then goes to a subagent on Sonnet with a short brief: the files, the contract, the
finish line. The subagent does the work in its own context and hands back a result. Opus reads the
result, checks it against the plan, and either accepts it or sends it back.

```mermaid label="Opus plans and reviews; Sonnet subagents implement each settled piece"
flowchart LR
  A[Opus: read and plan] --> B[Brief per piece]
  B --> C[Sonnet subagent]
  B --> D[Sonnet subagent]
  C --> E[Opus: review against plan]
  D --> E
  E -->|accepted| F[Done]
  E -->|sent back| B
```

There is a second saving hiding in that picture. Every file a subagent reads lives in the
subagent's context, not the main one. The orchestrating session stays small, so every later turn in
it is cheaper, and it does not lose the plan under a pile of file dumps.

The split has limits. A piece of work that is still being designed should not go to a subagent,
because the subagent will design it for you, quietly. Hand off only what is decided. If you cannot
write the brief in a few lines, the piece is not ready.

## Try low effort before you assume high

The second piece of advice surprised them more. I run Opus on low effort almost all the time.

That works for me, and I want to be honest about why. Over the past months I built a loop around
the model: instruction files that say how each repo works, standards installed as skills, hooks that
check the work at session start and before it is called done, a plan file for every piece of work.
The model on low effort does not have to work out from nothing how I like things done, because the
repo tells it. The thinking that high effort would spend rediscovering the context is already
written down.

A fresh setup does not have that, so low effort may cost you something there. But it is cheap to
find out. Run a week on low. Notice where it gets something wrong, and ask whether more thinking
would have fixed it or whether a line in your instruction file would have. Usually it is the line.
Write it, and the next session gets it for free, at any effort level.

Raise the effort for the turns that earn it: a hard design call, a bug that has already beaten one
attempt, a plan for a large change. Then drop it again.

## The same pattern in Codex

None of this is specific to Claude. In Codex the shape is the same: plan in the main session on the
strongest model with reasoning effort set higher, and hand the implementation to subagents on a
smaller, cheaper model at low or medium reasoning effort. Codex reads an AGENTS.md the way Claude
Code reads a CLAUDE.md, so the instruction file that makes low effort safe in one tool makes it safe
in the other. In my setup they are the same file.

## What to take from it

- Plan and review on the big model. Implement on the small one.
- Only delegate work that is already decided, with a brief of a few lines.
- Start on low effort, and fix what goes wrong with a written rule before you reach for more thinking.
- The cheap setting is cheap because the context lives in files, not in the model's head.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
