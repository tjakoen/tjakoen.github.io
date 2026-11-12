---
id: self-learning-loop
status: todo
track: ai
depends: [memory-dream]
touches:
  - plans/
  - tools/
  - standards/loop.md
  - standards/hooks.md
  - ../pantry/
  - ../../agent-config/shared/tools/
  - content/notes/
owner: ai
---
# Self-learning loop: the loop notices, proposes and gets scored

> Asked by the owner on 2026-11-12. The loop only improves when it is told to. The PR review kit
> shows the other way: every output is scored by what happened next, and the scores tune the thing
> that produced it. This plan points that same loop at the work sessions themselves.

## The gap

Memory-dream already reads finished runs and sessions back into memory. It distills facts. It never
proposes a change, and nothing grades whether what it kept was worth keeping. The missing piece is
not observation. It is the outcome score, read per kind, that the review kit has had since 18 August.

The goal, in the owner's words: the loop should observe ongoing work and find its own chances to
improve, without being told explicitly.

## The shape

    session → signal → harvest → proposal → owner verdict → outcome log → tune the observer

1. **Signals go to a ledger, never into the work.** During a session the agent appends short typed
   entries to `signals/<date>-<session>.jsonl`. It does not act on them, because acting mid-task is
   the scope growth LOOP section 4b forbids.
2. **The harvest runs at close.** An extension of `bun run dream` groups signals and promotes a
   pattern only past a threshold: seen in at least three sessions. One correction is noise; three
   is a habit.
3. **A proposal is a PANTRY plan** under `plans/proposed/`, with `owner: human-review` and the
   evidence quoted inline. Nothing edits VOICE, a standard or a hook by itself.
4. **The owner's verdict is the score**: accepted, edited then accepted, rejected, or ignored for
   fourteen days, which counts as a soft reject.
5. **Scores are read per kind, per project and per harness**, never as one average, so a noisy
   detector cannot hide behind a good one. A kind with low precision gets a stricter threshold or a
   rewritten prompt.

## Signal kinds

| Kind | What it notices | What it proposes |
|---|---|---|
| voice | The owner's grammar and "how to explain this" corrections in note chats | A VOICE rule plus a counterexample, citing at least two of his own sentences |
| craft | How he directs social images and diagrams | An addition to FIGURES or a social-card skill |
| content | Work that would make a note, or makes an old note stale | A new note, or an update to an old one |
| loop | Friction: a rule re-explained, a hook denied, a gate rerun | A change to LOOP, a hook or a skill |
| routine | The same request in his words across sessions | A new step in the tidy routine, or a skill on the project it belongs to (HAU, for example) |

Build order: routine first, scoped to HAU and this repo. It is the cheapest signal to read and the
easiest to score, since a skill is either used afterwards or it is not. VOICE comes last, because a
bad edit there spreads to everything.

## Reporting

- During a session: nothing.
- At session start: one line under the checklist, written by `session-checklist.sh`, for example
  `Signals: 4 open, 11 logged this week → <pantry>/signals`.
- In PANTRY: a Signals surface listing open proposals with accept, reject and **make me a prompt**,
  which writes a ready-to-paste session prompt carrying the evidence, the scope and the finish line.
  A button that starts the session directly can come later.
- Weekly: precision per kind, on the same surface.

## Maintenance is one routine

One routine, `tidy`, with ordered steps, not a table of routines:

1. Check that main is clean and up to date. If it is not, stop and say why.
2. Fix the regenerable doctor flags (skills sync, graph merge) without asking.
3. List what can go: merged worktrees, merged branches locally and on the remote, and the largest
   caches that are safe to remove, each with its size.
4. Ask once, then delete what was approved.

It has one PANTRY button and one name in any harness. When the routine detector finds a chore that
keeps coming back, it proposes a new step for `tidy`, never a second routine.

## Child sessions archive themselves

The owner has already asked for this repeatedly, so it needs no detector. The rule goes in LOOP: a
child session reports to its parent, then archives itself, unless its work is unmerged or it is
waiting on the owner. The mechanism goes in each harness adapter (Claude Code session tools, the DSH
spawn envelope, the Codex equivalent), proved against the HOOKS adapter contract.

## Harness neutral by design

This must not only work with Claude.

- The ledger is plain JSONL in the repo.
- Signals are written through a PANTRY MCP tool, `pantry_signal`, with a CLI fallback. Claude, Codex
  and DSH all reach PANTRY already.
- The harvest reads transcripts through one adapter per harness behind a shared interface.
- The session-start line comes from the checklist script, which already runs in all three.
- Every signal records the harness that wrote it, as review labels tell Claude and Codex apart.

The test: if any one harness disappeared, everything except its adapter keeps working.

## Guardrails

- **Privacy.** LinkedIn and HAU involve other people. A signal stores the pattern, never another
  person's text or any student detail. This repository is public.
- **Watching changes behavior.** Detection runs as a pass over the transcript after the session, not
  as a standing instruction in the main prompt, so the agent does not learn to echo the owner.
- **Fatigue.** At most one digest a day. The fourteen-day ignore rate says whether that cap is loose.

## Phases

1. Ledger format, `pantry_signal`, and the session-start count line.
2. Harvest with the routine kind and Claude and DSH transcript adapters; `tidy` as a skill.
3. PANTRY Signals surface with verdict buttons and make me a prompt; outcome log and weekly scores.
4. Child archive-and-report rule in LOOP plus the three adapters.
5. The voice, craft, content and loop kinds, one at a time, each gated on the precision of the last.

## Done when

- A routine the owner repeated three times shows up in PANTRY as a proposal without being asked for.
- His verdict on it lands in the outcome log, and precision per kind is readable.
- The same path works from a Codex or DSH session.

## The note this earns

"The loop that learned how I work", paired with "The reviewer that learned to be wrong", with
precision per kind as its figure. It is written only after a few weeks of scores. The honest limit
is already known: an accepted proposal is a proxy, not proof that the loop got better.
