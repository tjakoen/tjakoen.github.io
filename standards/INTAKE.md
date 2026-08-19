---
title: INTAKE — turning a pasted blob into a scoped brief
summary: The four questions a pasted document has to answer before a session starts spending, why the answers are confirmed by a person rather than inferred from the blob, where the brief lands, and the test for when no brief is needed at all.
when: >
  Read this BEFORE starting work on a pasted document, a forwarded brief, a handoff from another
  session, or any ask that runs longer than a screen and wants something changed. It turns the blob
  into the envelope LOOP section 4b names (the lane, the scope cap, the hard stops, the ask-triggers)
  plus a definition of done, by putting four questions to the person and writing the answers down.
  Don't skip because the ask reads clearly - a blob that reads clearly is the one whose scope grows
  quietly, and an envelope invented after the work started is the one thing the scope-growth check
  can never catch.
---

# INTAKE

A run declares its envelope before it starts. That is [LOOP](LOOP.md) section 4b, and it is written
as though the envelope were sitting there waiting to be declared. Usually it is not. Work arrives in
this estate as a pasted document, and a pasted document carries a task without carrying a lane, a cap,
a stop or a finish line. The session invents all five, silently, in its first thirty seconds.

That invention is the gap this file closes. It is worth closing because every later check depends on
it: a scope-growth check has nothing to measure growth against when no cap was ever stated, so the
only move left is to widen the boundary after the fact and call it judgment.

**What this owns is arrival.** LOOP section 4b owns what an envelope is and this file never restates
it, borrows its four names exactly, and adds a fifth item of its own. [SESSION-LOOP](SESSION-LOOP.md)
section 5 owns the shape of a handoff going out. [DECISIONS](DECISIONS.md) owns which surface a
question belongs on, and section 3 below is a straight application of it rather than a second opinion.

---

## 1. The measurement this exists because of

Taken on 2026-08-19 over every session transcript in the portfolio repo. Skill bodies were excluded,
so these are documents a person actually wrote to open a piece of work.

| What the blob carried | Count |
|---|---|
| A named envelope block, liftable as a unit | 7 |
| The substance scattered through prose, unnamed | 23 |
| Neither | 24 |
| **Total work blobs** | **54** |

The middle row is the interesting one and it changes the design. Nearly half of these blobs already
say do not push, or off limits, or only phase P0, somewhere in paragraph six. The information is
present and it is unusable: a successor session cannot lift it, a checker cannot read it, and the
writer has no way to tell which of their constraints survived the read.

So the job is only sometimes to invent an envelope. More often it is to lift one that is already
there, name it, and get the naming confirmed.

---

## 2. When it fires, and when it does not

A skill that fires on everything gets switched off, and then it protects nothing. Fire only when all
three of these hold:

- **The blob wants something changed.** It asks for a build, a fix, a migration, a sweep. A question,
  a lookup or an explanation writes nothing, so there is no scope to cap.
- **It runs longer than a screen, or it names more than one deliverable.** Two asks in one paste is
  the single most reliable predictor of growth in the ledger, and it beats length as a trigger.
- **It carries no named envelope already.** Seven of the fifty-four did. Read theirs and use it.

Skip in every other case, and skip out loud in one sentence rather than silently, so the person knows
the test ran. Three skips worth naming, because each one gets argued:

| The case | Why no brief |
|---|---|
| A one-line ask that names its own file | The file is the cap and the ask is the finish line |
| One item of an open plan | The plan already holds the cap; point at it instead of copying it |
| Read-only work: a question, an audit that writes no fix | Nothing is written, so nothing can grow |

An audit is the edge worth watching. An audit that only reports is read-only. An audit that fixes
what it finds is a change, and its cap is the thing most often missing, since the fixes are unknown
when the work starts. Ask for a cap on where fixes may land, not on what they may be.

---

## 3. The four questions

One round trip, four questions, every field pre-filled from the blob. Put them on a single form and
never split them across turns.

**The surface is the chat, and that is a conclusion rather than a shortcut.** DECISIONS section 2
sorts surfaces by how far the person is from the work, and intake happens at the one moment they are
certainly present: they just pasted. A decision inbox earns nothing here, and building one for this
would be machinery for the case that does not apply.

**Ask in this order, because each answer narrows the next.**

1. **What is done?** One sentence, plus how anyone would check it. This goes first because it is what
   a blob most reliably lacks, and because a finish line bounds every answer below it.
2. **What may it touch?** The scope cap, as paths or directories. Prefer a directory the person can
   read at a glance over a file list that will be wrong by the second commit.
3. **Which lane?** High, gated, or human. Propose this from the paths in question 2 rather than from
   the tone of the blob: LOOP section 4b classifies by path, paths are checkable, and a judgment call
   about how hard something looks can be talked into anything.
4. **What stops it?** Anything to add to the standing hard stops, which are already absolute and are
   not re-asked. Then the ask-triggers, and the one line that gets left out most: whether an ask stops
   the run.

That last line matters enough to be its own field rather than a footnote. LOOP section 4b makes an ask
a stop by default, and a run under a deadline reads silence as permission to keep going and collect
the answer later, which is the same as never asking.

**Four questions, and there is never a fifth.** Anything else worth knowing goes in the brief as an
assumption for the person to correct while they read it. A fifth question is how this becomes slower
than the paste it is scoping, and the moment it is slower it stops being run.

---

## 4. Propose, never adopt

Pre-filling from the blob is the whole reason this is fast. It is also the exact move that would turn
it back into the thing it replaces, so the line is drawn hard:

- **Every field is a proposal until a person answers it.** A pre-filled answer is a draft the person
  is reading, not an answer they gave.
- **Blank is not consent.** An unanswered question has no default. If nobody answers, there is no
  envelope, and the work does not start. That refusal is the entire mechanism; without it this is a
  guess with a form around it.
- **Say where each proposal came from.** Lifted from the blob, or invented. The person reads a lifted
  proposal in a second and an invented one carefully, and they cannot tell which is which unless it
  is marked.
- **Carry a recommendation and a reason.** DECISIONS section 3 requires it. A form with options and no
  recommendation pushes the whole judgment back onto the reader and wastes the context already read.

---

## 5. The brief

The output is one file, and the same text is the prompt that opens the next session. Two uses, one
artifact, so they cannot drift apart.

```markdown
## The task

<one paragraph: what is being asked, and why it matters now>

## Done means

<one sentence, plus the command or the surface that proves it>

## The envelope

- **Lane:** high | gated | human, and the path that decides it
- **Scope cap:** the directories this run may write in
- **Hard stops:** no push, no merge, no publish, no delete, no other repo, plus anything specific
- **Ask-triggers:** scope grows past the cap, a call that is genuinely the owner's, a gate red twice
  on one cause, plus anything specific
- **An ask does / does not stop the run.**

## Assumptions I made

<the ones the person did not answer directly, so they can be corrected on sight>

## Verify before claiming done

<the gates, named, with the instruction to report all of them>
```

The assumptions block earns its place. Four questions cannot cover a real piece of work, and the
honest alternative to a fifth question is writing down what was assumed where the person will see it
while the work is still cheap to redirect.

---

## 6. Where it lands

A brief lives in *artifacts/briefs/*, named by date and slug, beside the run reports it will later be
judged against. **That directory is not committed**, and the reason was found by running this skill
against a real paste rather than worked out in advance.

A brief quotes the blob, and the blob is whatever a person had on their clipboard: a client name, an
employer detail, a private link, a question a student asked them. None of that has been read for
publication. In a public repo an artifacts directory is published on the next commit, so a brief
filed there leaks the paste by default, and it leaks it in the one repo most likely to be read by a
stranger.

What is safe to publish is the envelope on its own. A lane, a list of directories and a list of stops
carry no content from the blob. So the split is: the brief stays local and the run report, which is
committed, restates the envelope block and cites the brief by filename. The pairing survives for
anyone checking whether a run stayed inside its bounds, and the paste does not travel with it.

Two other placements were rejected. Chat alone is the thing being replaced, since a session that dies
takes the envelope with it. A file under *plans/* was the closer call and it loses because PROOF owns
that directory and validates what is in it as plan documents: a brief is not a plan, and filing it as
one inflates the plan count and puts a schema between a person and thirty seconds of writing.

The rule is that a brief is never published, rather than that one particular path is ignored. Where a
repo is private already, no ignore line is needed and nothing above changes.

---

## 7. Why this is a skill and not a hook

The obvious next thought is a prompt-submit hook that fires on every paste, and it is worth saying
plainly why that is not what this is.

**A hook fires deterministically and a skill fires on a judgment.** For the problem here that is a
real difference, because the moment the envelope is needed is the moment nobody thinks to ask for one.
So the hook is the stronger mechanism on paper.

It is out of scope here by an explicit owner call, and the reasoning holds independently: a
prompt-submit hook runs in every session on the machine, so a bad one degrades every piece of work
being done, including the ones this file says to skip. The blast radius of the fix would be wider than
the blast radius of the problem.

The middle path is real and it is what this file relies on. A standard mounted as a skill carries a
trigger line that the model reads at the start of every session, so a well-written trigger fires
without a hook. That is how every other standard in this set already works.

**The honest residual gap: model-triggered means probabilistic.** A skill that should have fired and
did not leaves no trace, which is the same failure the hook would close and the same one that cannot
be measured from inside a session that never noticed. Whether that gap is worth a hook is an owner
decision, and it stays open rather than being answered by building the weaker half of it.

---

## 8. Rationalizations

| Rationalization | Reality |
|---|---|
| "The blob is clear enough, I know what to do." | Knowing what to do is the task, not the envelope. The cap, the stops and the finish line are still invented, and now they are invented by someone confident. |
| "I will infer the envelope and confirm it as I go." | Confirming as you go means confirming after spending. The whole value is that four answers arrive before the first edit. |
| "Asking costs more than the work." | For a one-line ask, correct, and section 2 says to skip. For anything that grew past a screen, four pre-filled questions cost less than one wrong direction. |
| "They are busy, I will assume the safe answer." | There is no safe default for a scope cap. The safe-looking assumption is the widest one, every time. |
| "It already says do not push, that is the envelope." | That is one hard stop in one paragraph. An envelope a successor can lift is a block, not a sentence buried in prose. |
| "I will write the brief at the end so it is accurate." | A brief written at the end is a run report. They are different artifacts and only one of them can bound anything. |

---

## 9. Red flags

- Work started on a multi-part paste with no cap written anywhere.
- A brief whose scope cap is the repository root.
- A pre-filled answer that shipped without a person ever answering it.
- A fifth question.
- A lane argued from how hard the work looks rather than from the paths it touches.
- A brief that never says whether an ask stops the run.
- An envelope that first appears in the run report.
- A brief committed to a public repository, the pasted blob and all.

---

## 10. Verification

- [ ] The fire test in section 2 was run, and a skip was said out loud rather than assumed.
- [ ] Four questions went to the person in one round trip, pre-filled, each marked lifted or invented.
- [ ] No field was adopted without an answer, and no fifth question was asked.
- [ ] The lane follows from the paths in the scope cap, not from the tone of the blob.
- [ ] The brief names whether an ask stops the run.
- [ ] The brief is on disk in artifacts/briefs/ before the first edit, not after.
- [ ] The brief is uncommitted, and the run report carries the envelope block in its place.
- [ ] Assumptions that no question covered are written where the person will see them.
