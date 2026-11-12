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

## The same pattern in Codex

None of this is specific to Claude. I run Claude, Codex and DeepSeek side by side, and I wrote
about why the loop matters more than any one of them in
[The Loop Outlives the Model](one-loop-three-harnesses.md). In Codex my setup is Sol 6.1 on light
for the main session and Luna on medium for the subagents. Same shape: the stronger model plans and
reviews, the cheaper one types. Codex reads an AGENTS.md the way Claude Code reads a CLAUDE.md, and
in my setup they are the same file, so the rules that make low effort safe in one tool make it safe
in the other.

## The lesson

The point I was trying to make to that junior developer was not really about models. It was about
where the intelligence in a session lives. If it lives only in the model, you pay for it on every
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
something done before it is. That is why low effort works for me. I did not get a better model. I
built a better floor for the model to stand on.

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
