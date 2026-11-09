---
title: PROMPT — what a prompt owes before the work starts
summary: The checks an opening prompt is held to and the short polish pass that fixes it at session start, plus the rules for the prompts that live in files (instruction files, skills, agent prompts) so they stop carrying debt older models needed.
when: >
  Read this BEFORE acting on the first prompt of a session, and BEFORE editing a CLAUDE.md, an
  AGENTS.md, a skill, an agent definition or any other prompt that lives in a file. It scores an
  opening prompt against five checks and polishes it with at most three questions, and it holds
  instruction files to the debt rules. Don't skip because the prompt looks clear - a prompt that
  reads clearly to its writer is the one whose missing finish line nobody notices.
---

# PROMPT

A prompt is the cheapest place to fix a piece of work. Every minute spent on a vague opening is paid
back later as a wrong direction, a second pass or a question asked after the spending started. This
file owns two things: what an opening prompt has to carry, and what a prompt stored in a file must
leave out.

**What this owns, and what it leaves alone.** [INTAKE](INTAKE.md) owns the long paste: a blob longer
than a screen, or one with two deliverables, gets the four intake questions and a brief on disk.
This file owns everything shorter, which is most of what gets typed. [LOOP](LOOP.md) section 4b owns
what an envelope is, and nothing here restates it. [SESSION-LOOP](SESSION-LOOP.md) owns the handoff
prompt and the subagent prompt.

---

## 1. Why this exists

Prompts collect debt the way code does. A habit that helped an older model stays in the prompt long
after the model stopped needing it, and on a current model it costs tokens and can make the answer
worse. A talk by Lance Martin of Anthropic, summarized in a LinkedIn post by Charly Wargnier, put a number on it: in some internal tests, cleaning that debt out cut cost by up to
72 percent with no meaningful loss in quality. Those are reported figures, not ones measured here.

The opening prompt has the opposite problem. It carries too little rather than too much: a task
with no finish line, no scope, and no say on what the session may not touch.

---

## 2. The five checks for an opening prompt

A prompt that opens work passes when it carries all five. Each one is a question the session would
otherwise answer for itself, silently.

1. **Done.** What is true when this is finished, and how anyone would check it.
2. **Scope.** What it may touch, as a directory or a surface, and what is out of bounds.
3. **One task.** A single deliverable. Two tasks in one prompt is a sign it belongs to INTAKE.
4. **Evidence.** The thing the work depends on is linked rather than pasted or remembered: the
   ticket, the file, the page, the failing output.
5. **Stops.** Anything beyond the standing hard stops, and whether a question halts the run.

A check can pass by being obvious. A prompt that names its own file has its scope. A question that
changes nothing needs no stops. Score what is missing, not what is unwritten.

---

## 3. The polish pass

This runs once, on the first prompt of a session, before the first edit.

**When it fires.** The prompt wants something changed, and at least one check in section 2 fails in
a way the session would have to guess. It skips a question, a lookup, a one-line ask that names its
own file, and a prompt that points at an open plan. It hands a long paste to INTAKE instead. A skip
is said out loud in one sentence, so the person knows the check ran.

**What it does.**

- **Score the prompt** against the five checks, in one line: which pass and which fail.
- **Ask at most three questions,** one round trip, each pre-filled with a proposed answer and marked
  as lifted from the prompt or invented. Ask only about a failed check that changes the work.
- **Suggest the fixes** that need no answer, such as a link to the evidence or a tighter verb.
- **Return the polished prompt** as a block the person can accept, edit or throw away, and start
  only once they answer. Blank is not consent.

**Three questions, never four.** The polish pass has to cost less than the mistake it prevents. The
moment it is slower than retyping the prompt, people stop letting it run.

**Why it is a skill and not a hook.** INTAKE section 7 makes the case and it holds here unchanged: a
prompt-submit hook runs in every session on the machine, including the ones this file says to skip.
The trigger line above is what fires the pass. The honest gap is the same one INTAKE names: a pass
that should have fired and did not leaves no trace.

---

## 4. Prompts that live in files

Instruction files, skills and agent prompts are read on every run, so their debt is paid on every
run. Hold them to these rules.

- **No rituals.** Drop "think step by step", forced verification passes, "be maximally thorough"
  and scratch pads. Effort is a setting, not a sentence. Remove each one and check whether the
  output changed before keeping it.
- **No contradictions.** Two rules that disagree confuse a current model rather than being quietly
  resolved. When a new rule overrides an old one, the old one goes in the same edit.
- **Stable first, changing last.** The prompt cache only reuses an exact prefix, so an early edit
  invalidates everything after it. Order content from the most stable (instructions, tools) to the
  least (session state, the message).
- **One home per rule.** A rule stated in two files drifts into two rules. Point, do not copy.
- **A budget.** An instruction file has a size it stays under, and the session checklist already
  reports it. A new rule pays for itself by retiring an old one or by naming what it prevents.
- **Measure a claimed improvement.** A prompt change that is said to help is compared on cases it
  was not tuned on, with a pass or fail grade, before the claim is written down.

---

## 5. Rationalizations

| Rationalization | Reality |
|---|---|
| "The prompt is clear, I know what to do." | Knowing the task is not knowing when it is done. The finish line is still invented, now by someone confident. |
| "Asking slows them down." | Three pre-filled questions cost seconds. One wrong direction costs the session. |
| "The ritual does no harm, so it can stay." | It is paid on every run, and on current models it can make the answer worse. Test it out. |
| "I will add the new rule and leave the old one." | That is a contradiction with a delay on it. |

---

## 6. Red flags

- Work started on a prompt with no finish line and no question asked about it.
- A fourth polish question.
- A polished prompt adopted without the person answering it.
- An instruction file that grew without anything leaving it.
- A rule that exists in two files.

---

## 7. Verification

- [ ] The polish pass ran on the first prompt, or its skip was said in one sentence.
- [ ] The score names the checks that failed.
- [ ] At most three questions, each pre-filled and marked lifted or invented.
- [ ] Work started only after the person answered.
- [ ] An edited instruction file carries no ritual, no contradiction, and is under its budget.
