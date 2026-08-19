---
title: "The spawn envelope deny hook, built and proved but not switched on"
date: 2026-08-20
status: complete
lane: gated
branch: main
skills:
  - loop-standard
  - voice
scope:
  - ~/Local/claude-config/shared/tools/
  - artifacts/runs/
touched:
  - ~/Local/claude-config/shared/tools/spawn-envelope.sh
  - ~/Local/claude-config/shared/tools/spawn-envelope.test.ts
  - artifacts/runs/2026-08-20-spawn-envelope-deny-hook.md
diffstat: 2 files added in claude-config, 315 insertions; 1 file added here
unpushed: 0
verifiedBy: a reviewer subagent that did not write the hook, 2026-08-20
doctor: 21 checks, 0 failing, 1 due and carried by name, cold-start context
---

# Run report: the spawn envelope deny hook, built and proved but not switched on

Date: 2026-08-20
Session: spawn envelope deny hook
Parent session: 75b4360c-fac3-4cba-88d0-237e771b22df

The hook exists, it is green in both directions against fixtures, and **nothing on this machine
runs it.** Wiring it is the owner's call and the ask that closes this run. That separation is the
whole design of the evening rather than an unfinished edge: the artifact has been designed and
deliberately unbuilt since 2026-08-13 because a bad deny hook on spawning blocks every session on
this machine, including sessions belonging to other work.

This report lives here rather than in claude-config because that repo carries no run ledger.

## The envelope this run declared

- **Lane:** gated, and handled as the strictest kind of gated. The artifact runs in every session on
  the machine once it is switched on, so the review that matters is a human one before the switch.
- **Scope cap:** `~/Local/claude-config`, the hooks directory and a test fixture. One hook script
  plus its test.
- **Hard stops:** no push. Do not wire it into any `settings.json`. Do not edit
  `shared/commands/handoff.md` or any standard. Do not touch the existing hooks. Never read or
  modify any repo named edge.
- **Ask-triggers:** the wiring step is itself an ask and is the finish line rather than an
  interruption. Also ask if proving it needs a real spawn rather than a fixture. An ask stops the run.

## What was built

Two new files, both in `~/Local/claude-config/shared/tools/`, which is the hooks directory on this
machine and is mounted live at `~/.claude/tools/` through a symlink the linker creates.

| File | Lines | What it is |
| --- | --- | --- |
| `spawn-envelope.sh` | 102 | The hook. Reads a `PreToolUse` payload on stdin, matches `spawn_session` and `send_prompt`, reads the `prompt` argument, exits 2 with a reason when any of the four envelope headings is absent. |
| `spawn-envelope.test.ts` | 213 | 21 cases, run with `bun test`. Both directions plus the fail-open cases. |

The four headings it looks for are **Lane, Scope cap, Hard stops, Ask-triggers**, and the reason
those exact four is that two files already had to agree on them: LOOP section 4b names "the lane,
the scope cap, the hard stops, the ask-triggers", and `/handoff` step 4, rewritten earlier tonight,
names the same four as the parts a spawn carries. A check graded against a spelling nobody uses is a
check that fails on correct work, so the names were taken from those two files rather than invented.

Matching is deliberately loose about presentation and strict about position. A heading may be bold,
a bullet, a blockquote or an ATX heading, may be any case, and may use "Hard stop" or "Ask triggers"
in the singular or with a space. What it may not be is a mention inside a sentence, because a prompt
that says the lane is gated somewhere in a paragraph has not declared anything a successor can find
when reading cold. That asymmetry is on purpose and is written into the script: a false pass costs
one unenveloped spawn, a false block costs every spawn on the machine, and those are not the same
price.

## Gate results, verbatim

The suite:

```
$ bun test spawn-envelope.test.ts
bun test v1.3.14 (0d9b296a)

 21 pass
 0 fail
 29 expect() calls
Ran 21 tests across 1 file. [888.00ms]
```

Direction one, an envelope-carrying prompt. The payload is the envelope this very run was handed,
so the pass case is a real handoff rather than a synthetic minimum:

```
=== DIRECTION 1: envelope present -> passes ===
exit=0
```

Direction two, the same shape of task with the rails left off. This is the case that was hit on
2026-08-13, when a session spawned a successor with a task and no envelope and nothing noticed:

```
=== DIRECTION 2: envelope absent -> denied ===
BLOCKED: this mcp__nimbalyst-host__spawn_session carries no run envelope (LOOP section 4b).

Missing from the prompt:
  Lane: high, gated or human, and why
  Scope cap: the dirs it may touch; growth past it is an ask
  Hard stops: no push, no publish, no merge, plus whatever this work adds
  Ask-triggers: what stops the run, and where the ask goes

A successor inherits the task automatically and inherits nothing else, so an envelope left unsaid is
one the chain loses on its first hop. The message carrying the task is the message that carries the
envelope. There is no later step where it arrives.

What to do: add the missing headings to the prompt and call the tool again. Each one starts its own
line so it survives being read cold. /handoff step 4 has the long form and the wording to copy.

This checks that the four parts are PRESENT. It cannot check they are any good, and it is not trying
to. If the honest answer to one of them is "nothing", write that down rather than dropping the
heading, because a successor reading "Hard stops: none" knows something a successor reading silence
does not.
exit=2
```

A partial envelope is the case worth naming separately, because it is the one a real session will
actually hit. Handed a prompt carrying Lane and Scope cap only, the hook names Hard stops and
Ask-triggers and stays silent about the two that are there.

## What was not done, and none of it is an oversight

- **Any judgement of whether the envelope is good.** This is a presence check. Four headings of
  nonsense pass it. The limit is deliberate and is written into the script rather than left to be
  discovered: a check satisfiable by magic words becomes a ritual, and a ritual is worse than an
  honest gap because it reads like coverage.
- **Enforcing that an ask stops the run.** Not hookable at all. No event fires when a session asks a
  question, and the Stop hook cannot reach the model at exit 0. Both facts were already measured in
  this estate and neither was re-litigated tonight.
- **Denying `git push` or `npm publish`.** The hook cannot tell the owner's push from a run's, and a
  gate that blocks the owner is a gate about to be switched off.
- **An escape hatch.** `human-lane.sh` has one, an owner-written file of approved patterns, and the
  precedent is good. It was not built here because it is not in the design and the scope cap is one
  script plus its test. It belongs in the wiring decision, and it is listed below as such.

## What needs human eyes

Four things, and the first is the ask that ends this run.

1. **Whether to wire it at all.** Nothing is switched on. The block in
   `machines/tjakoens-macbook-air/settings.json` under `PreToolUse` would need a matcher for the
   spawn tools and a `bash "$HOME"/.claude/tools/spawn-envelope.sh` entry. That is a one-line change
   and it is the whole reason this sat unbuilt for a week.
2. **Matching `send_prompt` is not free, and the cost is measured rather than argued.** `send_prompt`
   is also how a parent answers a running child's question, and a one-line answer has no envelope and
   needs none. As designed and as built, that answer is denied. The cost is pinned as a test rather
   than fixed, because narrowing the design is not this session's call. If a short follow-up should
   pass, that test is the one that changes.
3. **Whether it gets an escape hatch before it is switched on.** See above.
4. **The scope cap and the hard stops read differently on one point, and the reading is stated rather
   than assumed.** The cap allows "the hooks directory"; a hard stop says not to touch
   `~/.claude/tools/`. On this machine those are one directory, since `~/.claude/tools` is a symlink
   to `shared/tools` in the config repo. The reading taken: the hard stop protects the existing
   hooks, which were neither read into nor modified, and the cap allows a new inert file in the same
   directory. No sibling hook was changed, and the new file is referenced by nothing.

## Verification, against LOOP section 9

- **Gate output verbatim:** above, both directions and the suite.
- **Diffstat:** 2 files added in claude-config, 315 lines. 1 file added here, this report. No file
  modified anywhere.
- **What was not done:** the wiring. Named above as the ask.
- **What needs human eyes:** four items above.
- **Every touched file committed:** yes, by pathspec in both repos.
- **Unpushed commits:** the count at the time of writing is 0 in both repos, and this run does not
  push, so its own commits leave both repos ahead by their own count.
- **Second pass by someone who did not write the change:** a reviewer subagent read both files
  against the sibling hook, ran the suite itself, and hunted specifically for a heading spelling a
  real handoff would use that the regexes would miss.
- **Declared scope against what was touched:** reasoned by hand, not by `proof verify`, since
  claude-config carries no plan file with a `touches` list. Two files in the hooks directory and one
  run report here. No growth.
- **A rendered change:** none owed. A hook has no surface a person looks at. The reason a person
  reads is its stderr, and that is pasted above in full rather than described.
- **Doctor:** ran at session start. 21 checks, 0 failing, 1 due, cold-start context at 20,136
  characters over four files against a 20,000 budget, of which MEMORY.md is 10,658. Carried by name
  rather than fixed, since trimming the index is not in this run's cap.
- **Answers acked:** none acted on this run.
