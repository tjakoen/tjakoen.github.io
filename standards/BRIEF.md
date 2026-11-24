---
title: BRIEF.md — a run talks to the person, not about the work
summary: The shape of anything a run says to Tjakoen instead of to the code - the ask first, every step a runnable one carrying its prompt, a link to whatever is running, bullets for detail, a table or a figure when the data has a shape, and the words he already uses. One shape on every harness and every surface.
when: >
  Read this BEFORE writing anything addressed to Tjakoen rather than to the code: a chat reply, a run
  report, an audit, a PANTRY plan or task note, a handoff prompt, a decision request, a review or
  ticket reply. It owns the shape of the message; DECISIONS owns which surface it goes on,
  SESSION-LOOP owns what a handoff carries, VOICE owns anything published in his name. Don't skip
  because the model is a light one or the reply feels short - the shape is what carries the clarity a
  small model cannot, and a brief he has to ask about has already cost more than it saved.
---

# BRIEF.md: a run talks to the person, not about the work

Every message a run writes is read by one person: the owner, usually between two other things, with
the tab open and the cursor waiting. He is not reading a transcript. He is looking for the one thing
he has to do next, or the one thing he has to look at.

The brief gives him that first, then the detail, in blocks small enough to scan.

The shape came from [Kercwin Ocampo](/people#kercwin), the tech lead on my team. Before he built his
epic checker he showed the team how he makes Claude talk to him: tables, diagrams, a fixed wording, a
format his brain reads fast. That is the same move as [VOICE](VOICE.md), pointed the other way. VOICE
tells the model how to sound like me. This file tells it how to sound like something I can use.

**The standard in one line:** the ask comes first, a step he runs arrives numbered and complete,
anything that renders arrives running and linked, the run says where it stands, and every block is
small enough to scan.

---

## 1. The ask comes first

Open with what the reader has to do, before any account of what the run did. One line naming it, then
the steps, then the detail.

**Before**

> I have finished the export fix. While I was in there I also noticed the date filter has an edge case
> around month ends, and the test file needed two small changes. Could you run the e2e suite when you
> get a chance?

**After**

> **Needs you:** run the e2e suite. It needs an idle machine.
>
> 1. Stop the dev server.
> 2. Run: bunx playwright test --ignore-snapshots
> 3. Paste the totals back.
>
> **What changed**
> - The export fix itself.
> - A month-end edge case in the date filter, untested on purpose until the suite runs.

A run with nothing to ask says so in the first line and does not manufacture a question. "Done,
nothing needed" is a complete opener. "Let me know what you think" is not a question.

## 2. A step he runs arrives numbered and complete

Anything with an order is numbered, one action per number, and each number can be pasted or typed as
written. No "then update the config" without the file and the line.

A command in a brief is one of two things: a command the session already ran, with its output, or one
it names as untested. A command nobody has run is not evidence.

When the next step is a prompt for another session or another tool, the prompt is in the message,
ready to paste, inside a fenced block, with nothing around it that has to be edited out first. It
names the repo, the session and the finish line, so it survives a cold start.

If the prompt runs past about fifteen lines, or carries file paths, or is mostly context, it goes in
a file instead:

- Path: artifacts/prompts/YYYY-MM-DD-<slug>.md, beside the run reports.
- The first line says what to do with it, in one sentence, for example: paste this into a fresh
  session in the portfolio repo.
- Open the file once after writing it. A file that does not open is worse than no file.
- Check that every path it names exists. A prompt that points at a missing file fails at the reader.
- Link the absolute path in the brief, and keep the one line he needs in case he would rather paste
  from chat.

Never describe a prompt he is supposed to run. "Ask the agent to check the standards index" hands him
the work of writing it. [PROMPT](PROMPT.md) owns how a prompt that lives in a file is built. This
section owns that it exists, opens, and is linked.

## 3. If it renders, it is running and it is linked

A sentence about a page is not a page. When the work is something he can look at:

1. Start it before writing the message, in the background, and leave it running.
2. Put the URL on its own line, near the top, as a link he can click.
3. Say which port it is on and that it stays up until the next change.
4. Keep it up across the reply. Do not stop it to clean up, and do not let it die of neglect.
5. If the port is taken, use the next one and give the new number.

> **Open:** <http://localhost:4321/standards/brief>
>
> Running on 4321 until the next change. Say the word and I stop it.

When it fails to start, the brief says that, with the error line and the command that produced it. "It
renders correctly" is a claim about a screen he cannot see, and a run that says it has handed him a
sentence instead of a page. [TOUR-STANDARD](TOUR-STANDARD.md) says what a change owes when it needs
judging rather than a glance.

**PANTRY is already running, so point it at the work.** The session-start hook opens it on this
project and nothing after that moves it, so by the second project of the day it is showing the wrong
one. When a reply ends with actions he has to take:

1. Move his window first, with *pantry_act* to the plan the reply is about. A link he has to find
   and click is a step he did not ask for.
2. Then put the link under the actions, on its own line:
   <pantry://project/tjakoen.github.io>. In a browser the same page is
   <http://localhost:4400/open/tjakoen.github.io>.
3. Name the plan in that line, because the window may still have been on another one when he looked.

A reply with nothing to act on carries no link. A link on every message is a link nobody reads.

## 4. Bullets carry the detail, one point each

Prose is for the argument. Anything listable is a bullet: what changed, what was read, what remains,
what it costs. One point per bullet, the load-bearing words first, the consequence after. No bullet
longer than two sentences, and one level of nesting, because a third level is a table.

Bold the word the eye needs when the reader is scanning: the file, the decision, the number.

A run report is a brief with a job, and [LOOP](LOOP.md) section 9 owns the evidence it has to carry.
This section owns how that evidence arrives: bullets and a table, not three paragraphs of narration.

## 5. A table when there is state, a figure when there is shape

Three or more things compared on the same two or three facts is a table. Fewer than three is a
sentence. A table has a header row, one fact per column, and no cell longer than a sentence.

Data with a shape, such as a trend, a distribution or a before and after, is a figure, and
[FIGURES](FIGURES.md) owns how it is drawn. Chat cannot draw, so in chat a table is the
visualization. A real figure belongs on a page, which means render the page and link it under section
3 rather than describing the chart in words.

## 6. Write in the words he already uses

Plain words, short sentences, the term he uses rather than the one the framework invented.
[VOICE](VOICE.md) owns the register. The part that matters here is the reader.

- Expand an acronym the first time, unless he introduced it in the same conversation.
- Name the file, the route, the command. "The config" is not a place.
- Say what a number means beside it. "12 tests" is half a fact; "12 tests, 2 failing" is the fact.
- When a technical choice sits behind the ask, give the one-sentence reason, not the design story.
- If a sentence only makes sense after opening another file, that file is the link, and the sentence
  says what he will find in it.

## 7. Cut what he cannot act on

Not in a brief:

- a restatement of the question
- a summary of the message that just ended
- an invitation to ask questions, in any of its forms
- an apology for the length of a message that is long because it was not shaped
- a walk through the attempts that failed, unless the failure is the finding
- a hedge where a fact is available

The test: every line tells him what to do, what happened, or where to look. A line that does none of
the three is deleted, not shortened.

## 8. One shape, in the container each surface gives it

| Surface | Lands in | What the surface changes | What stays the same |
|---|---|---|---|
| Chat reply | The session | Nothing shrinks it. A two-line reply still leads with the ask | Ask first, links, plain words |
| Run report | artifacts/runs/, PANTRY | Evidence is a table, and any unpushed commit is named | Ask first, bullets, links |
| PANTRY plan or task | The plan file | One task per line, and the task names the next action, not the topic | The line is the same shape as a bullet |
| Handoff | A fresh session | The prompt is the message. [SESSION-LOOP](SESSION-LOOP.md) section 5 owns what it carries | Numbered, complete, paste-ready |
| Decision request | Inbox or card | [DECISIONS](DECISIONS.md) owns the surface and the answer channel | One question, the options, the default |
| Review or ticket reply | The PR or the ticket | [VOICE](VOICE.md) owns the wording, because it publishes | The ask sits at the top, not the bottom |

The container changes where the reader meets the brief. It never changes the order inside it.

## 9. A light model needs the shape more, not a shorter answer

The run that prompted this file was on DeepSeek V4.1 Flash, a light model by the registry's own label,
because the Codex plan was out and the free model had already been rate-limited. A light model writes
the same content with less
structure around it: fewer headings, longer paragraphs, the ask somewhere in the middle. The fix is
not a shorter reply. It is the same reply with its blocks fixed in place, because the shape is the
part the model cannot supply and the run can.

- Keep each block to what a small model can hold: one ask, one list, one table.
- Put the ask on the first line, where it survives being skimmed.
- Prefer a worked example to an instruction, in this file and in any brief that hands work on. A
  light model copies a shape and interprets a rule.

## 10. Say where the work stands

A run that takes more than one step owes a state table every time it reports, on every surface. The
table answers three questions before he asks any of them: what is done, what is happening now, and
what waits on him.

| # | Step | State | Evidence |
|---|---|---|---|
| 1 | Read the standard and its neighbours | done | BRIEF.md drafted |
| 2 | Push and watch the deploy | now | run 4534, failed at the index test |
| 3 | Read the live page | next | waits on you |

- One row per step, in order, and the step in progress says "now".
- A row says "done" only when its evidence sits on the row. A done row with no evidence is a claim.
- Update the table as the work moves, instead of writing a fresh account at the end.

Anything stuck gets its own line under the table, with what it is stuck on and what frees it. Waiting
on the owner is a blocker, not a status.

| What | Blocked on | Unblocks when |
|---|---|---|
| The deploy | a test that fails only in CI | the index is rebuilt from the committed standards |

An open question that has not been answered gets a line there too, even when the run is not blocked.
A question buried in paragraph four is a question the run will ask again next week.

At the end of a run, the table is the run report's summary, so a reader who opens it later meets the
same shape. A decision request inherits the row it blocks, so the person answering knows what moves
when they answer.

## The checklist

Before anything reaches the reader:

1. The first line says what he has to do, or that nothing is needed.
2. Every step he runs is numbered and can be pasted as written.
3. A prompt longer than the message is a file, the file opens, and the path is linked.
4. Anything that renders is running, with its URL on its own line.
5. Detail sits in bullets, one point each.
6. Three or more comparable things are a table, and a shape is a figure on a page.
7. Every acronym is expanded once, and every number says what it means.
8. No line restates, apologizes, or invites questions.
9. A run with more than one step shows a state table, and every blocker and open question sits under
   it.
10. A reply that ends with actions moves PANTRY to the plan and links it, under the actions.

## Rationalizations

| The excuse | The answer |
|---|---|
| "The reply is short, so shape does not matter." | A two-line reply still has an ask. Put it first. |
| "The model is small and will lose the formatting." | Then keep the blocks smaller. That is the case this file exists for. |
| "I described the page in the report." | He cannot look at a description. Start it and link it. |
| "The prompt is long, so I said what it should contain." | Now he has to write it. Put it in a file and link the file. |
| "Numbering one step is fussy." | Then it is a sentence, not a list. Two steps are numbered. |
| "He knows what that acronym means." | Today he does. The next session reading this thread has no context. |
| "I already showed him this in the last message." | He scrolled past it. A link costs one line to repeat. |
| "He knows where PANTRY is." | It shows one project at a time and he runs fourteen. Point it at this one. |

## Verification

- Every item under the ask can be done without a follow-up question.
- Every command was run by the session, or is marked untested with its reason.
- Every URL answers with the page it claims, and it was opened once before sending.
- Every linked prompt file exists, opens, and starts with what to do with it.
- No table cell is longer than a sentence.
- The state table's current row matches the last thing the session actually did.
- The message contains no invitation to ask questions, no summary of itself, and no wish that it
  helped.
