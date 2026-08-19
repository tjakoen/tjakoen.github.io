---
title: "The handoff opens the next session itself, and five siblings' work stops sitting"
date: 2026-08-20
status: complete
lane: gated
branch: main
skills:
  - voice
  - session-loop
  - loop-standard
scope:
  - shared/commands/handoff.md in claude-config
  - artifacts/runs/
  - committing and pushing five sibling sessions' finished work, on the owner's instruction
touched:
  - artifacts/runs/2026-08-19-evaporated-audit-findings.md
  - artifacts/runs/2026-08-19-intake-standard.md
  - artifacts/runs/2026-08-19-loop-rollout-estate.md
  - artifacts/runs/2026-08-20-handoff-spawns-and-estate-cleanup.md
diffstat: 3 files changed, 743 insertions(+)
unpushed: 0
verifiedBy: the repo's own gates, run at HEAD on a clean tree, pasted below
doctor: 0 failing, 1 due and carried by name, cold-start context
---

# The handoff opens the next session itself

The command that ends a session had always ended in a copyable block, which meant every handoff ended
in a person copying and pasting. The owner ran it twice in one evening and copied the result both
times, which is what started this. The measured version of the same thing is worse: 21 handoffs in
454 sessions, 4.6%, and a step that ends in manual work is a step that gets skipped.

## What was built

`shared/commands/handoff.md` in claude-config, rewritten from four numbered steps to five, and
reordered. The old order could not carry a spawn at all: step 2 emitted the prompt and step 4 settled
the envelope, so a spawn placed where it looked natural would have fired before the envelope existed
and handed the successor a task nobody had approved. The new order is durable state, then the
worth-it decision, then the body, then the envelope, then the send. LOOP section 4b says the message
carrying the task carries the envelope, and the last step is where the two finally meet.

"If applicable" is spelled out rather than left to judgment at the moment of use, because judgment at
that moment is exactly what produced the 4.6%. Four conditions: the harness offers `spawn_session`,
there is a next task at all, the envelope is settled, and the owner has not asked to review first.
The child cap gets its own fallback, since it fired here on 2026-08-19: park the brief as a file the
way `plans/note-the-loop-nobody-ran.md` was parked, then print the block too.

A second pass, on the owner's correction, added the flags. `isolated` was being passed true, reasoning
from the tool's own phrase about not polluting the caller's workstream, which reads like tidiness and
is really a visibility trade. Six sessions from one thread lost their workstream grouping that way and
there is no reparent tool. `notifyOnComplete` flips on against the tool default, with the failure mode
it opens closed in the same breath: a parent woken by a finishing child reports it and stops rather
than helping itself to the next piece.

## The cleanup that followed

Asked where things stood across sessions, the answer was that two sibling sessions had finished their
work and walked away without committing it. Four repos carried the loop rollout uncommitted, and this
repo carried two run reports untracked. On the owner's instruction all of it was committed by pathspec
and pushed: batch, bread, grain, project, tjakoen.github.io and claude-config, six repos, all now
clean and at zero unpushed.

Two run reports the ledger had been flagging were retrofitted rather than rewritten. The evidence was
mostly already there and simply not machine-readable: the intake report had gate output pasted
verbatim and no frontmatter at all, and the evaporated-findings report had frontmatter and no gate
section, because it was a read-only pass that changed no code. Nothing was invented. Both files open
with a blockquote naming the session that added the fields and the day it did, and the one thing git
could not answer says so inside a fence that opens with NOT A PASTE, per the shape settled on
2026-08-15. The ledger now reads 32 of 32.

## Gate output

```
$ bun run check
$ tsc --noEmit

$ bun test
[mill] a mermaid diagram has no accessible name and will render as a code block instead. Add label="…" to the fence, saying in words what the diagram shows, node by node, including any loop and any exit. Diagram begins: flowchart TB

 600 pass
 0 fail
 2050 expect() calls
Ran 600 tests across 37 files. [2.69s]

$ bun run lint:links
$ bun tools/link-lint.ts
link-lint: 54 rendered file(s), no dead relative links.

$ bun tools/lint-gate.ts
lint gate: level. 4455 flag(s) total (oxlint + voice-lint), matching or under the 4455 in tools/lint-baseline.json (generated 2026-08-19).
```

The mermaid line is a warning the test suite prints by design and not a failure; the run is 600 pass,
0 fail. `pantry graph merge` was also run, which cleared the graphify freshness flag the doctor had
been carrying.

## What was not done

The rewritten command was never executed. A session cannot run a slash command against itself, so
every claim about its behaviour is a read of the instructions against a real transcript rather than an
observed run. The walk-through used session `914e2362`, whose turns 6 and 7 were both `/handoff` and
both copied by hand.

Three facts in the command come from the tool schema or from another session's notes rather than from
something reproduced here: the four-child cap and its exact refusal string, the effect of
`inheritModel`, and the absence of a reparent tool. The `notifyOnComplete` argument rests on two
children the owner saw stopped on a question card; by the time this session queried them all six were
idle with `waitingForInput` false, so that evidence was not reproduced either.

The doctor's cold-start context flag was left alone. MEMORY.md is 10,658 of the 20,136 characters over
a 20,000 budget, and trimming it means consolidating or deleting memories, which is the owner's call
rather than a cleanup.

## What needs human eyes

Whether `notifyOnComplete` should stay on. The argument for it is real friction the owner lived
through, and it was not reproducible afterwards, so it is the one flag in the command resting on a
report rather than on a measurement.

Whether the five sibling sessions' work, now committed and pushed on their behalf, reads the way its
authors intended. Their commits carry messages written from the outside, by a session that read the
diffs and not the threads that produced them.

---

*Written with Claude, in one session, against six repos and the session store.*
