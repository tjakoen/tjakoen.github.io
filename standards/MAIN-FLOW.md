---
title: MAIN-FLOW — the spine of one piece of work, from an idea to a closed session
summary: >
  The seven stages every substantial piece of work moves through in this estate, the standard that
  owns each one, the artifact it leaves behind, and the gate that proves the stage is done. It is the
  ordered view of the library: the other standards say how a stage is done, and this one says which
  stage you are in and what it owes before the next one starts.
when: >
  Read this BEFORE starting a piece of work that will outlive one exchange (a feature, a note, a
  migration, a refactor), when a task feels stuck because two stages are being run at once, or when
  you are new and the library looks like a pile of rules. It orders the standards, it does not
  replace them: the stage's own standard owns the rule. Don't skip because the work looks small -
  small work skips stages silently, and that is how a one-line fix arrives with no test and no
  report.
---

# MAIN-FLOW

One piece of work, seven stages. Each row names the stage's standard, the artifact the stage leaves
behind, and the gate that says it is finished. A stage is not done because it feels done; it is done
because its artifact exists and its gate passed.

| # | Stage | Owned by | Artifact | Gate |
|---|---|---|---|---|
| 1 | **Orient** | [`SESSION-LOOP`](SESSION-LOOP.md) | A one-line statement of what the repo is and what is in flight | The session checklist ran; the reading order was followed |
| 2 | **Decide** | [`INTAKE`](INTAKE.md), [`DECISIONS`](DECISIONS.md) | The envelope: lane, scope cap, hard stops, ask-triggers, finish line. A decision record for anything only the owner can answer | No open question that the work waits on |
| 3 | **Plan** | [`AI-REPO-STANDARD`](AI-REPO-STANDARD.md) section 8, PROOF | A plan file with one task per action and a finish line | The plan exists, `status: doing`, and is claimed |
| 4 | **Build** | [`AI-DEVELOPMENT`](AI-DEVELOPMENT.md), plus the stage's own standard (design, note, figure, dashboard) | The change, in small verified slices | The narrowest gate that proves the slice |
| 5 | **Verify** | [`AUDIT-STANDARD`](AUDIT-STANDARD.md) is the full pass; [`TOUR-STANDARD`](TOUR-STANDARD.md) is the rendered one | The gate output verbatim. A screenshot or a running tour for anything a person can look at | A second pass by a reader who is not the writer |
| 6 | **Land** | [`COMMIT-STANDARD`](COMMIT-STANDARD.md), [`LOOP`](LOOP.md) | A commit with its gitmoji and bullets; a PR body where a PR is used | The gate green on the landed tree, CI included |
| 7 | **Close** | [`SESSION-LOOP`](SESSION-LOOP.md) section 5, [`BRIEF`](BRIEF.md) | A run report with evidence, the plan closed with its `done:` reference, and a handoff | Nothing uncommitted, nothing unpushed, nothing open without a decision |

## How the stages actually nest

The stages are not a waterfall. A build slice runs stages 4 and 5 in a loop, and a discovery in
stage 5 sends you back to stage 2 with a decision. What must not happen is stage 6 before stage 5, or
stage 7 with a finding that has no decision attached.

```
idea -> orient -> decide -> plan -> [ build -> verify ] -> land -> close
                        ^                    |
                        +---- a surprise -----+
```

## The three cheap stages that get skipped

- **Decide** is skipped because the ask looked clear. That is the one whose scope grows quietly.
- **Plan** is skipped because the work looks like one edit. Then the edit is three files and nobody
  knows why the third one moved.
- **Close** is skipped because the work is done. Then the next session re-derives the same context
  and makes the same mistake.

If time is short, cut stages 4 and 5 down to one slice, never 1, 2, 3 or 7.

## What each stage owes the next

| Stage leaves | The next stage needs |
|---|---|
| Orient | the repo's name for things, so the plan uses the same words |
| Decide | a finish line that can be read as a pass or a fail |
| Plan | tasks small enough that a verify line exists for each |
| Build | a diff the writer can explain line by line |
| Verify | evidence a stranger can re-run |
| Land | a commit message that says what changed, not what was attempted |
| Close | a starting point for the next session, not a summary of this one |
