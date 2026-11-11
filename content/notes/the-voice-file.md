---
title: "The Voice File Your Team Forgot to Write"
subtitle: "A repo usually tells the agent how to build and almost never tells it how to write, so the tickets arrive in the model's default voice: context first, the ask in paragraph four. Give the agent a short file that tells it what belongs on line one."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-11-11
readingTime: "~8 min"
tags: [ai, standards, communication, team, workflow]
summary: >
  Teams wrote down how their code should be built and left the writing to the model, so ticket
  comments, reviews and chat arrive in a default voice that buries the ask. The fix is a short
  VOICE.md at the repo root: what a reader must do first, per surface, with examples from the
  team's own tracker. The rules that transfer are layout rules, and the evidence here is a snapshot
  from one team's review output, not a study.
social: |
  I counted 25 AI-drafted code reviews. The verdict was on the last line in all 25.

  The same thing happens with a ticket comment. Say an export comes back empty. The reporter
  can answer “Which account were you signed in as?” without reading every check I ran.

  That's the first rule I'd put in VOICE.md. Put the question on line one. Give the checks a
  place the reader can open when they need them.
socialImage: "/media/notes/the-voice-file-social-ticket.png"
socialImageAlt: "Two versions of an export ticket comment. The first ends by asking which account the reporter used. The second opens with that question, keeps the untested date filter visible, and folds the two account checks."
---

Your team never wrote down what a reader needs first, so the model chose for you, and it chose paragraph four.

A ticket comment now arrives as a status report: the context, a restatement of the request, a list of what was tried, and somewhere near the bottom the one thing the reader has to do. The same shape shows up in a review thread and in chat, where a question that needed one line arrives with a paragraph of setup. The writing is grammatical and often thorough. It is also a pile of work, and the person reading it is doing that work in a sidebar between two other tickets, on a phone, deciding whether this one is their turn.

Over two days, all 25 review summaries put the verdict on the last line. The 41 review comments averaged 694 visible characters, and the claim and the ask together ran a median of 253. Two comments folded anything. That is a snapshot from one team.

The model did not invent that shape. It was built to be helpful and complete. A ticket comment has to be actionable and short. Those are different jobs, and nothing in the repository said which one applied.

## The ask is in paragraph four

**You already wrote the instruction file for code. Write the one for prose.**

At the root of a repo, AGENTS.md or CLAUDE.md usually answers the questions an agent has before it touches code.

- Where does the plan live?
- Which tests do I run?
- What do I check before I commit?

The agent reads those instructions when the session opens. Then it has to write a ticket comment, and the repo goes quiet. The model opens with context, recounts the work, and saves the question for the end.

Put VOICE.md beside the instruction file and point the agent to it. Tell it what the reader needs first in a ticket, a review, or chat. Give it an example from your own tracker.

**Before**

> I looked into the export and got a full report as an admin and an empty one as a counselor. It could be permissions or the date filter, which I haven't tested yet. Which account were you signed in as when your export came back empty?

**After**

<blockquote class="callout">
<strong>Needs the reporter:</strong> which account were you signed in as when the export came back empty?<br>
Permissions or the date filter could explain the empty export. The filter is still untested.
</blockquote>

<details>
<summary>What I checked (2)</summary>

- Export fills for an admin account.
- The same report as a counselor comes back empty.

</details>

The reporter can answer from the first line. If they need the proof, it is one tap away.

<svg viewBox="0 0 340 270" width="100%" role="img"
     aria-label="Two versions of the same export ticket comment. Before, the comment says the export worked as an admin and came back empty as a counselor, then says the date filter is untested, then asks which account the reporter used. After, the question comes first, the untested date filter stays visible, and the two account checks are folded under What I checked."
     style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:16px">
  <rect x="1" y="1" width="338" height="125" rx="8"
        style="fill:var(--color-bg);stroke:var(--color-line)"/>
  <rect x="1" y="141" width="338" height="128" rx="8"
        style="fill:var(--color-bg);stroke:var(--color-fg)"/>
  <g style="fill:var(--color-fg)">
    <text x="18" y="28" font-weight="bold">Before</text>
    <text x="18" y="55">The export worked as an admin.</text>
    <text x="18" y="74">As a counselor, it came back empty.</text>
    <text x="18" y="93">I haven’t tested the date filter yet.</text>
    <text x="18" y="112">Which account were you signed in as?</text>
    <text x="18" y="168" font-weight="bold">After</text>
  </g>
  <rect x="12" y="177" width="316" height="30" rx="4" style="fill:var(--color-fg)"/>
  <text x="18" y="197" style="fill:var(--color-bg)" font-weight="bold">Which account were you signed in as?</text>
  <text x="18" y="226" style="fill:var(--color-fg)">I haven’t tested the date filter yet.</text>
  <text x="18" y="250" style="fill:var(--color-muted)">▸ What I checked (2)</text>
</svg>

*The same export ticket, with the question at the end and then at the top.*

## What goes in the file

**A voice file is short, example-first, and sorted by the surface a person reads.**

Forty lines that get read beat four thousand that get skimmed, because the file competes with the code for the model's attention. Examples carry more than adjectives. One bad comment and one good one teach a register faster than a page saying be clear and concise, which every writer already believes and the model will cheerfully agree with while doing the opposite.

The rules that survive a change of team are layout rules, not taste rules:

- **Front the ask.** The first line carries the action and the owner: needs a check, needs the reporter, fixed and back to you. Nothing above it.
- **Fold the proof under one label, with a count.** Also worth doing (3) tells a reader whether the tap is worth it. Fourteen labels for two kinds of block is a shrug.
- **Never fold a hedge.** If the claim rests on something untested, the caveat sits next to the claim. Fold it and a careful finding turns into a flat assertion.
- **A one-line comment stays one line.** Structure is for comments with more than one thing to say, not a costume for a short one.
- **Each surface has its own register.** A chat message can be a sentence. A pull request body cannot, and documentation takes full sentences and all the articles.
- **Give the model rules for whole sentences.** [Ege Vusal Chelebi](https://www.chele.bi/videos/the-cure-for-ai-slop) tried a writing skill derived from Simplified Technical English on six tasks. The linter counted 74 percent fewer violations per hundred words on Claude Sonnet and 50 percent fewer on GPT-5.5. A banned-word list cut violations by 3 percent and 40 percent, respectively. The linter scored the writing against a set of rules. The test did not measure whether readers found the ask faster.

My own standard is public at [portfolio.tjakoen.com/standards/voice](https://portfolio.tjakoen.com/standards/voice). It is longer than a team needs because it is also a guide to one person's prose. Take its structure, not its length: the registers, the scan rule, the list of shapes it refuses.

Here is a version to commit to a team repository tomorrow.

<div class="copy-template" data-copy-template>
<button class="share-block__copy" type="button" data-copy-template-button aria-live="polite" hidden>Copy VOICE.md</button>

```markdown
# VOICE.md

How we write anything a teammate reads: ticket
comments, pull request bodies, review comments,
chat, docs. Read this before drafting. Where a
rule here fights the model's default, this file
wins.

## The one rule

Front what the reader has to do. Fold what only
proves it. Never fold a hedge.

## By surface

### Ticket comment
- First line in bold: the action and its owner.
  Needs a check, needs the reporter, fixed and
  back to you.
- Then short groups under a plain lead-in: what
  I checked, what is still open.
- A blank line between groups. Every ticket key
  is a link.
- One thing to say? One line. No heading, no
  bullets.

### Pull request body
- Start with what changed and what you need the
  reviewer to check. Keep open risks visible.

### Review summary
- Start with the verdict and the next action.
- Tests and proof fold under a label with a
  count.

### Review comment
- Ask, do not declare. State the mechanism,
  then put the fix as a question the author can
  say no to.
- The proof folds. The caveat does not.

### Chat
- The ask is the first sentence. No "quick
  question" preamble.
- One update per message, not a status report.

### Docs
- Full prose. No fragments, no compression. All
  the articles.

## Never
- Em dashes. Use a comma, a period, or
  parentheses.
- Backticks in prose. Code and literal terminal output only, never for emphasis.
- "It's not just X, it's Y." "I hope this
  helps." "In conclusion."
- A list of exactly three tidy bullets, every
  time.
- A hedge moved out of sight.

## Before and after

Bad:
> I looked into the export and got a full report
> as an admin and an empty one as a counselor.
> It could be permissions or the date filter,
> which I haven't tested yet. Which account were
> you signed in as when your export came back empty?

Good:
> **Needs the reporter:** which account were you
> signed in as when the export came back empty?
>
> Permissions or the date filter could explain
> the empty export. The filter is still untested.
>
> <details>
> <summary>What I checked (2)</summary>
>
> - Export fills for an admin account.
> - The same report as a counselor comes back empty.
>
> </details>

On a tracker without disclosures, put the proof
below the ask and caveat under the same label.

Replace these two examples with a real pair from
our tracker. A real bad comment is worth ten
invented ones.
```

</div>

The examples are the part to replace first. A comment that made someone scroll and a rewritten one that did not are worth more than anything invented here.

## A file nobody points at is a file nobody reads

**An agent reads what its instruction chain tells it to read.**

If VOICE.md sits at the root and the file that loads at session start never mentions it, the model will find it sometimes and ignore it most of the time. The change is two lines: one in AGENTS.md saying to read VOICE.md before writing anything a person reads, and one in the review or ticket skill if the team has one. The agent already reads the plan before it codes. It reads the voice file before it comments.

Placement in the workflow matters as much as placement in the tree. The file has to be in front of the model at the moment of drafting, not in a wiki it has never opened. If the tool ignores repository files, the file is not in force. Paste it in, or accept that the default is still doing the writing.

## Two teams, one model

**The file does not make the model better at writing. It makes the default yours.**

Team one never writes it. Every comment is a small negotiation: the reader reconstructs the ask, the writer explains why the output is fine, and the tracker becomes a place people read late and answer shortly. Nothing is broken. The cost is spread across every reader, which is why it never shows up on a ticket.

Team two commits the file and points the agent at it. When a comment buries the ask, the team adds the original and a rewrite to the file. The next draft has a pair to follow. The ask belongs on line one, and the label tells the reader how much proof sits behind it.

## What the file cannot do

**A file is a prompt, not a guarantee.**

It drifts. Models change and teams change, and a rule nobody has edited in a year is probably describing a surface nobody uses. The maintenance is small and it is not optional: when a bad comment lands, add it as an example.

It does not stop the paste. Someone will drop in a generated comment that never read the file. What the file gives the next person is a standard to point at, which is more than a bad comment usually gets.

Before the team changed its review format, folded feedback was acted on less often than visible feedback. The sample since the change is small, so it is still open whether folding helps. A reader who never reaches the ask cannot act on it.

Your team already has a voice. It is in the good tickets, the ones that start with the ask and leave the proof below. Write it down, put it where the agent reads it, and stop letting the model choose.

An agent will write in a voice. The only question is whose.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
