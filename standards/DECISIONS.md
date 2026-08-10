---
title: DECISIONS — how a run reaches the human, and how the answer comes back
summary: The four ways a run asks for something it cannot decide alone, what picks between them, what a decision request has to contain, and the one channel an answer returns on so a session that did not ask can still act on it.
when: >
  Read this BEFORE asking the human anything mid-run, and before building any surface that collects
  an answer: a decision request, a review tour that ends in a question, a handoff, a prompt card, an
  approval step. It owns which surface a question belongs on and how the answer gets back; LOOP
  section 4b owns how much scrutiny a change earns, and SESSION-LOOP section 5 owns the shape of the
  handoff itself. Don't skip because you are about to just ask in chat - asking in chat is one of the
  four and the right one more often than the machinery suggests, but only when someone is there to
  read it.
---

# DECISIONS

A run reaches a person for one of two reasons. It needs something decided that it cannot decide
alone, or it has produced something a person has to look at. This file owns both: which surface the
question belongs on, what the question has to carry, and how the answer returns.

It does not own how much scrutiny a change earns. That is the lane, and LOOP section 4b owns it. It
does not own the shape of a handoff brief, which is SESSION-LOOP section 5, or what a review tour is,
which is TOUR-STANDARD. Those are pointed at, never restated.

---

## 1. The four ways

| The situation | The surface | What happens to the session |
|---|---|---|
| The answer is not about anything you can look at, and the run is blocked without it | Ask in the chat | Waits |
| The answer is not about anything you can look at, and the run is not blocked | A decision request in the inbox | Keeps working |
| A change is visible and needs judging, and the session can stay alive | A review tour ending in a decision card | Waits, or works on something else |
| The work is done, or the window is filling, and the next piece is separate | The handoff, and the next session | Ends |

A fifth case gets proposed every time this list is written, and it is not a fifth surface: **the
session that sleeps, runs out, or dies and is picked up later.** That is not a way of asking
anything. It is the property the four above maintain by making state durable before they hand over.
Treating it as a peer sends someone looking for a mechanism to build, and there is none to build.

---

## 2. What picks between them

**The lane says how much scrutiny. Visibility says which surface.** They are different questions and
answering one does not answer the other. A gated change that renders is a tour. A gated change that
does not is a diff. A human-lane change that blocks is a question in the chat. A human-lane change
that does not block is a request in the inbox.

Underneath both sits the thing that actually decides how much machinery is worth it: **how far the
person is from the work.**

- **Watching.** They correct you mid-flight, in the chat, with no mechanism at all. This beats every
  surface below it and costs nothing to build.
- **Present but not watching.** You ask, they answer, in the chat. Still no machinery.
- **Nearby, later.** They will look, but not now. This is the tour and the decision card.
- **Gone.** The handoff, and whatever the next session reads.

The ordering is the useful part, because it says when **not** to build. If someone is at the machine,
none of the surfaces earn their cost. They exist for the hours nobody is watching, which is also
exactly when an unattended run is most likely to drift, so they are worth having and worth keeping
out of the way the rest of the time.

---

## 3. What a decision request contains

A request that only states the question is a request the reader has to reconstruct. Four things,
and the fourth is the one most often left out:

- **The question**, stated so it can be answered without reading the code.
- **The options**, as a closed set where one exists. Two is the minimum that is actually a choice,
  and one of them should be an escape for the case where none of them is right, because the whole
  reason the question is being asked is that the run could not anticipate the answer.
- **A recommendation**, with its reason. A request with no recommendation pushes the whole judgment
  onto the reader and wastes the context the run already has.
- **What it unblocks.** The answer will often be read by a session that did not ask, so it has to say
  what changes once it is answered. Without that, an answer arrives with nobody able to use it.

A decision that turns out not to change what gets built should not have been raised. Recording it and
moving on is the correct move, and it is cheaper than an inbox nobody opens.

---

## 4. How the answer comes back

**One channel, append only, and the same one whether the answer came from a card, a form or a paste.**
Two surfaces, one path back: the run writes its request where the inbox renders it, and the answer
lands in a single log the next thing to run reads.

The rule that makes this durable is not the waiting. **A session waits while it is awake, and reads
the log when it wakes.** The wait is an optimization for the case where the session survives; the read
on wake is the contract. Get that the wrong way round and the answer is only usable while the process
that asked is still alive, which is the case least likely to hold.

Two consequences worth stating, because both have already been got wrong here:

- **The wait is not passive.** Nothing interrupts a run when a file changes. A session that has raised
  a question and not been told to wait will simply carry on, and the answer will sit unread.
- **The answer has to carry its own question.** The session that reads it may have none of the context
  of the one that asked. An entry that is only a choice, with no reference to what was being chosen
  between, is not actionable.

**Where this stands today, honestly:** the mechanism exists as of 2026-08-10. PANTRY owns one
append-only log, three surfaces write to it (the decision inbox, a review tour's decision card, and
one command for an answer that arrived by paste), and a session both reads it and blocks on it
through PANTRY's answers command. The habit was the missing half and it is a step now: the doctor
report a session already runs at start counts the answers nobody has acted on and names them, so
[LOOP](LOOP.md) §2's mechanical tier surfaces an unread answer the same way it surfaces an overdue
audit. It warns rather than fails, because CI has no session to act on a pending decision.

What is still not proven is the surface with the shortest path and the least evidence: nobody has
ever pressed the review rail's Record answer button. Confirmed by the owner on 2026-08-10, and worth
writing down rather than assuming, because the two write paths that HAVE been exercised are the two
that a session can drive itself.

Three things building it settled that were not obvious from the design.

- **An answer needs a choice or a note, never both required.** "None of these, and here is why" is
  the answer a decision card exists to catch, and refusing it pushes the reader into picking an
  option they do not mean.
- **An ack is an entry, not an edit.** Whether an answer has been acted on is derived by appending an
  acknowledgement rather than by marking the answer, which keeps the log append-only and keeps
  "what is still unread" answerable from the file alone.
- **The log needs a name git will keep.** The obvious one, ending in dot log, was silently ignored on
  its first write, because that extension is wildcarded in nearly every ignore file ever written. A
  log the repo never commits is a log the next clone does not have.

---

## 5. Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll just ask in chat, it's faster." | It is, when someone is reading. Asking in chat while nobody is there is the same as not asking, and the run stops for hours on a question that had an obvious default. |
| "It's a small call, I'll decide it myself." | Usually right. The test is not size, it is reversibility (LOOP section 4b). A small irreversible call is the one to raise. |
| "I'll raise it so they're informed." | An inbox is not a newsletter. A request that does not change what gets built is a record, not a decision, and every one of those makes the real ones cheaper to skip. |
| "I described the change, that's enough to judge it." | The description is the thing the reviewer cannot check. If it renders, it owes a tour (LOOP section 4a). |
| "I'll wait for the answer before doing anything else." | Only if nothing else can proceed. A blocked run is a stopped run; the inbox exists so the question can be pending while the work continues. |
| "The next session will figure out what this answer was for." | It will not. It has none of your context. The entry says what it unblocks or it is unusable. |

---

## 6. Red flags

- A question asked in chat during an unattended run.
- A decision request with no recommendation.
- An options list with one option.
- A run blocked on a question that had a safe default.
- An answer in the log that no session has acted on.
- A rendered change handed over with a description instead of a tour.
- Two surfaces asking the same question, because the first one was not checked before the second was
  raised.

---

## 7. Verification

- [ ] Every question raised this run is on the surface its lane and its visibility select.
- [ ] Every decision request carries a question, options, a recommendation, and what it unblocks.
- [ ] Nothing was raised that would not change what gets built.
- [ ] Any pending answer log was read at session start, and acted on or explicitly deferred.
- [ ] A run that raised a blocking question said so, rather than waiting silently.
- [ ] State was durable before any surface that ends the session was used.
