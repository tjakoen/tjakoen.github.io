# artifacts/runs: the run ledger

Each file here is one run report: what a session changed, what it checked, what it left, and what it
read before it wrote. The rule that a run owes one lives in LOOP section 4a, and the list a report is
checked against is LOOP section 9. This file only describes the shape, so a session writing its first
report has a template to copy rather than eighty examples to reverse-engineer.

Name the file with the date and a short slug, for example 2026-11-17-retrieval-trace.md. This README
is the one Markdown file in the folder that is not a report, and the tools that read the folder skip it
by name.

## The frontmatter

```yaml
---
title: Run reports name what they read
date: 2026-11-17
status: complete            # complete, partial or review
lane: gated                 # high, gated or human per LOOP 4b; direct for a chat ask
branch: claude/ai-workflow-retrieval-trace
scope:                      # what the run declared it would touch
  - tools/run-report-lint.ts
touched:                    # what it actually touched; growth past scope is named in the body
  - tools/run-report-lint.ts
  - artifacts/runs/2026-11-17-retrieval-trace.md
plans:
  - run-report-retrieval-trace
consulted:                  # what the run read before it wrote; see below
  - LOOP.md#a-the-run-ledger-evidence-or-it-didnt-happen
  - VOICE.md#punctuation-formatting-conventions
  - skill:voice
  - graph:slugifyHeading
gates:
  - bun run check
  - bun test
diffstat: one sentence, in words, on the size of the change.
unpushed: 0
verifiedBy: how a person could see the change was right, and what they would look at.
doctor: the doctor's count and every flag it raised, or why it did not run.
---
```

The body below the frontmatter carries the gate output verbatim, what was not done, and what needs
human eyes. Those three are prose because they do not fit a field, and LOOP section 9 checks for them.

Older reports carry a skills field: a flat list of mounted skill names. It still parses, and PANTRY's
runs view reads it. A new report puts those names in consulted as skill entries instead, so there is
one list to read rather than two to reconcile.

## The consulted field

A report that says it followed VOICE has made a claim. A report that names the section it opened has
made a claim someone can check. LOOP section 4a treats the first kind as unverified, so this field is
how a run gets the second kind on the record.

It is a list, not a log: one line per thing the run actually read, not one line per tool call. Three
shapes are allowed.

- **A standard, or one section of it.** The filename as it sits in standards/, then a hash and the
  heading's slug, for example VOICE.md#register-by-surface. The slug is the one MILL stamps on the
  rendered heading, so the entry is also a deep link to the published page, and it lines up with the
  section anchors in the standards index. A bare filename, such as LOOP.md, means the run read the
  whole file. Only ## and ### headings carry an anchor.
- **A skill.** skill: and the skill's name, for example skill:loop-standard. A plugin skill keeps its
  prefix, as in skill:anthropic-skills:pdf.
- **A graph query.** graph: and the query as it was asked, for example graph:slugifyHeading.

A run that read nothing writes consulted: none. That is an honest answer and it passes. An empty list
does not, because it reads the same as a field nobody filled in.

## The check

bun run lint:runs reads every report here and fails on an entry it cannot resolve: a shape that is none
of the three, a standard file that does not exist, or an anchor that matches no heading. Reports dated
2026-11-17 or later must carry the field. Earlier ones are grandfathered and checked only where they
have it.

What the check cannot do is prove the run read what it lists. A tidy list written after the fact
passes. The field makes the claim specific enough to hold against the transcript, which is the step
up from a claim with nothing behind it, and no further.
