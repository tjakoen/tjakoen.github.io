---
id: agent-autonomy-tiers
status: todo
track: ai
depends: []
touches:
  - standards/LOOP.md
  - standards/CONFORMANCE.md
owner: unassigned
---

# Autonomy earned by evidence, not granted by the model

Osmani's [agent-autonomy post](https://www.linkedin.com/posts/addyosmani_ai-programming-softwareengineering-share-7491386804474966016-EXfz/)
and its figure, handed over 2026-08-09. The claim: autonomy is a property of the task, the evidence
and the harness, not of the model, and not a permanent setting. A proposed change is classified on
**risk, evidence and track record** into one of three lanes.

| Lane | The change | What happens |
|---|---|---|
| High | Routine, proven, this kind has been seen before | The agent proceeds alone and ships |
| Gated | Non-trivial, real blast radius | Automated checks plus a targeted human review |
| Human | Novel, high-risk, weak evidence | The human decides: auth, permissions, money, migrations |

The line worth stealing verbatim: **irreversibility, not difficulty, defines the human lane.** A
one-character migration is human; a two-hundred-line refactor of pure functions with tests need not
be.

## Why this repo is unusually ready for it

LOOP §4b already declares rails per run, but they are **binary**: hard stops and ask-triggers, the
same for every change. The three-lane model is the missing middle, and the estate already generates
the inputs it needs, which is the whole reason this is worth building rather than quoting.

- **Blast radius is already measured.** `proof verify` reads a diff against a plan's `touches`, and
  `pantry scope` answers what a change is likely to reach *before* the work starts.
- **Track record is already parsed.** The run ledger (`runs.ts`) scores every closed run against
  LOOP §9 and computes scope growth. A repo's adherence history is already a machine-readable series,
  which is exactly what "has this agent earned it" needs and almost nobody has.
- **The harness half exists.** The Stop hook runs the review gate; the doctor runs on demand.

## Open questions, and they are the whole design

- **What classifies a change, mechanically.** Path globs (anything touching auth, migrations, money,
  `.github/`) are the honest floor. Risk-by-file is crude but checkable; risk-by-judgement is a model
  call that can be talked into anything.
- **What counts as track record, and over what window.** Last N runs clean? Per change-kind rather
  than per repo? This is the same unanswered threshold question that already blocks S3a in
  `plans/skills-runtime.md`, and it should land with those, not invent its own number.
- **Does a lane ever get demoted.** A promotion-only ladder is a ratchet, and one bad ship should
  cost something.
- **Where the classification is recorded.** A run report field is the obvious home, which makes the
  lane part of the evidence rather than a decision made in chat and forgotten.

## Tasks

- [ ] Read the post and the figure against LOOP §4b and write down every place the binary rails are
      already doing a three-lane job badly.
- [ ] Decide the mechanical classifier: the irreversible-path list first, since that is the lane with
      real consequences and the easiest to write as globs.
- [ ] Amend LOOP §4b with the three lanes, keeping the hard stops absolute. The rails become the
      human lane rather than the only lane.
- [ ] Add a `lane:` field to the run-report schema, and teach `runs.ts` to read it.
- [ ] Only then consider computing a lane suggestion from the ledger. Building the promotion
      mechanism before the classification is settled is how it becomes a number nobody trusts.
- [ ] A figure for the standard, per FIGURES, since the source is a figure and the three lanes are
      exactly the shape a flow scaffold renders.
