---
title: "Note: the loop nobody ran"
status: done
owner: unassigned
written: 2026-08-20
created: 2026-08-19
---

# Note: the loop nobody ran

> **WRITTEN 2026-08-20** as `content/notes/the-check-that-never-ran.md`, status DRAFT. The owner's
> read is still owed; no session flips a note to PUBLISHED. Three of the figures below were
> re-derived from the store before drafting and needed correction, and the corrections are recorded
> in this file rather than only in the note:
>
> - **288 is exact, its label was wrong.** It is the sum of the four other workspaces this brief's
>   own table names (165 + 55 + 42 + 26). Sessions genuinely outside the portfolio are 306, because
>   the bread-repos root (13), grain (4) and greenroom (1) never made the table. The note says "the
>   four other repositories my table named" rather than presenting it as a total.
> - **87 doctor runs and 62 run reports are 2026-08-19 snapshots**, and the note date-stamps them in
>   the sentence that makes them. A precise match on the doctor command in the store returns 52 and
>   a match on edited run-report paths returns 45; the original pass used a broader rule that a
>   second pass could not reconstruct. The parts that reproduce exactly are the ones the argument
>   rests on: ph-live 165 sessions with 1 doctor run, and zero run reports in any workspace outside
>   the portfolio.
> - **53 of 148 is a 2026-08-19 snapshot with a moving denominator.** The store held 454 sessions
>   that night and holds 460 now; all six are portfolio sessions spawned on the night of the 19th,
>   and five of the six are work about the loop. The note prints that rather than restating the
>   ratio, because re-deriving it today makes it worse and that is the honest ending.
>
> Exact on re-check and used as standing facts: 454 sessions across 8 workspaces since 2026-07-04,
> 59 sessions named a variant of "Review pasted text", the longest session at 11,396 messages, and
> four non-portfolio repos carrying `pantry.config.json` at the time of the claim.

A note for `content/notes/`, briefed and queued rather than started. The owner approved it on
2026-08-19 alongside three other pieces; the harness caps a session at four children in flight and
this was the fifth, so the brief is parked here instead of being lost in a chat log. **Spawn it as
its own session when one of the other three lands.** It is not work for whoever happens to be
reading this file.

The other three, all spawned 2026-08-19: the pantry graph freshness fix, the estate-wide loop
rollout, and the orphaned audit findings sweep.

## The measurement this note is about

Queried from the Nimbalyst session store on 2026-08-19: 454 sessions across 8 workspaces since
2026-07-04. The store is SQLite at
`~/Library/Application Support/@nimbalyst/electron/sqlite-db.backups/nimbalyst.backup-current.sqlite`
and the backup is the one to read, never the live file.

**The loop lives in one repo.** Sessions per workspace, against how many ever ran the doctor and
ever wrote a run report:

| workspace | sessions | ran doctor | run report |
|---|---|---|---|
| ph-live | 165 | 1 | 0 |
| tjakoen.github.io | 148 | 87 | 62 |
| HAU | 55 | 0 | 0 |
| lakbay-ph | 42 | 0 | 0 |
| admin-interface | 26 | 0 | 0 |

288 sessions outside the portfolio. One ran the doctor. None wrote a run report. Four of those repos
already carried `pantry.config.json`.

**Do not write the note around adoption, because that reading was checked and is wrong.** The
machine-level session-start hook resolves pantry through `../pantry/cli.ts`, which only exists
relative to `bread-repos/`. From ph-live every resolution path fails and the hook prints
`doctor NOT RUN`. The loop was never reachable outside one directory, so the one doctor run in
ph-live's 165 sessions was a human typing it. The honest subject is a diagnosis that survived six
weeks because the usage numbers looked like an answer.

**The loop's cost was paid inside the loop.** 53 of 148 portfolio sessions were about the loop, the
standards, pantry or an audit rather than about the product. That is 36%. Across the estate, 93 of
454.

**The handoff almost never happened.** 21 spawns in 454 sessions, 4.6%, and 20 of the 21 are in the
one repo. Mean session length runs 605 to 920 messages; the longest is 11,396.

**Work arrived without an envelope.** 59 sessions are named some variant of "Review pasted text".
61 more are audits or sweeps, and audit findings need a ledger, which two repos out of ten have.

## The argument

The interesting failure is not that the loop was built badly. It is that it was built in the repo
whose job is to demonstrate it, measured there, and therefore always looked like it was working. A
tool adopted only by its author is a tool with no evidence behind it.

The sharper half arrived late and is better: the diagnosis itself was wrong for most of a day. The
usage numbers were read as a story about discipline, when a single command run from the wrong
directory would have shown the tool could not start. A measurement tells you what did not happen.
It never tells you why, and the gap between those two is where a confident wrong answer lives.

The half that generalizes: machinery that never fires is usually machinery whose cost lands now and
whose benefit lands later, on somebody else. Handing off costs a brief today. Not handing off costs
a reader tomorrow.

It should not end tidily. The rollout was decided the same day and is unproved, so the honest ending
is a hypothesis with a date on it rather than a lesson learned.

## Constraints for whoever writes it

- Verify every number again. A note arguing from figures it did not check is the failure it is about.
- `Skill(note-standard)` owns the artifact, `Skill(voice)` how it reads, `Skill(figures)` the figure.
  The figure is required; sessions against loop usage per workspace is the obvious one.
- Public-repo guardrails: company is "Career Team", no names, no student data, nothing about HAU
  beyond that it is a private teaching repo.
- Scope is `content/notes/`, one figure, and the backlog entry. Do not touch the loop machinery the
  note is about. Do not push.
- If the argument does not survive re-checking the numbers, say so and stop.
