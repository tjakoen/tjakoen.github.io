---
title: What should the cold-start context budget be?
status: open
options:
  - A, 20,000 characters — the shipped first guess, roughly 5,000 tokens
  - B, 16,000 characters — tighter, and the portfolio is over it today
  - C, 24,000 characters — the reading that was found bloated, made the ceiling
  - Leave it a first guess — keep the number, drop the ask, retune after a second repo
recommendation: A for now, and revisit after a second repo has been measured. The number is doing its job at the portfolio's current size; what it has never been is agreed.
unblocks: nothing is blocked. The check ships and works with the current default. This asks whether the number should carry the same weight as the hygiene thresholds beside it.
evidence:
  - pantry context.ts, DEFAULT_CONTEXT_BUDGET | the comment saying it is a guess
  - artifacts/runs/2026-08-17-session-economics.md | the run that built it
  - plans/decisions/2026-08-11-loop-hygiene-thresholds.md | the sibling that got a decision
---

# One number, and whether it is agreed or assumed

The doctor grew a cold-start row on 2026-08-17. It measures what a session in a repo loads before it
does any work, and it warns when that crosses a budget. The measurement is not in question. The
budget is.

## Where 20,000 came from

Two readings, both taken in this repo. On 2026-08-05 a session measured 14,163 characters and read
it as comfortable. On 2026-08-17 the same measurement came to 24,243 and read as bloated to the
person who found it. Twenty thousand sits between them, and it was deliberately placed where the
repo it was written in passes rather than fails, because a check that is red on the day it ships is
a check that gets muted inside a week.

That is a defensible way to pick a first number. It is not a measurement, and the code says so.

## Why this is being asked at all

The four hygiene thresholds beside it in the same doctor were explicitly not chosen by the run that
built them. They went to the owner, came back as option B, and landed with the reasoning written
into the comment. The stated principle was that a threshold is an agreement about what too long
means in this estate, and a plausible number nobody agreed to is an opinion wearing a default's
clothes.

By that principle this number wants the same treatment. The counter-argument is real: a ceiling on
context is less contested than a definition of stale, one repo has been measured rather than three,
and the sibling audit-activity numbers in the same file were allowed to ship as an illustration
without a decision. Either posture is consistent with something already in the estate, which is why
it is a question rather than a fix.

## What each option costs

**A, 20,000.** The portfolio sits at 19,693 today, so the row reads ok with almost no headroom. The
next memory written crosses it. That is arguably the check working exactly as intended, and
arguably a line that will read as noise within a week.

**B, 16,000.** Fires today. Everything the trim recovered would have to be recovered again somewhere
else, most plausibly by splitting the portfolio's CLAUDE.md, which LOOP section 3 already asks for
in repos that have grown a config dump.

**C, 24,000.** Never fires at today's size, including at the size that was found bloated. It would
have to be crossed before it says anything, which is a ceiling that ratifies the drift it was built
to catch.

**Leave it a guess.** The number stays, the comment stays honest, and nobody has to decide anything
until a second repo has been measured. The cost is that a later session quotes it as measured,
which is the specific failure the memory written this week already warns about.

## Evidence

The reading, live, on the day the check landed:

```
[ok  ] cold-start context: 19,693 chars over 4 files, inside the 20,000 budget — MEMORY.md is 10,671 of it
```

The four files are this repo's CLAUDE.md, the agent memory index for this project, the machine-wide
CLAUDE.md and the RTK file it imports. Only the first two are this repo's to fix.
