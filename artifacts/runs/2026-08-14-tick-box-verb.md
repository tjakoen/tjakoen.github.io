---
title: The vocabulary learns to tick a box, and the atom gets its address last
date: 2026-08-14
status: complete
lane: gated
branch: main
scope:
  - ../grain/packages/grain/ai/
  - ../grain/packages/grain/scripts/
  - ../grain/packages/grain/components/atoms/b-check/
  - ../grain/packages/grain/components/form-from-data.test.ts
  - ../grain/packages/grain/plans/
  - src/
  - content/data/
  - view/
  - e2e/
  - plans/
  - artifacts/runs/
touched:
  - ../grain/packages/grain/ai/contract.ts
  - ../grain/packages/grain/ai/contract.test.ts
  - ../grain/packages/grain/ai/reasoner.ts
  - ../grain/packages/grain/ai/reasoner-kit.ts
  - ../grain/packages/grain/ai/reasoner-kit.test.ts
  - ../grain/packages/grain/ai/interaction-layer.test.ts
  - ../grain/packages/grain/ai/vocab-reference.ts
  - ../grain/packages/grain/scripts/ai-dispatch.js
  - ../grain/packages/grain/scripts/ai-dispatch.test.ts
  - ../grain/packages/grain/components/atoms/b-check/b-check.html
  - ../grain/packages/grain/components/atoms/b-check/b-check.md
  - ../grain/packages/grain/components/form-from-data.test.ts
  - ../grain/packages/grain/plans/check-set-op.md
  - ../grain/packages/grain/plans/form-from-data.md
  - content/data/contact-form.json
  - src/server.ts
  - src/contact-form.test.ts
  - view/pages/about.html
  - e2e/about.e2e.ts
  - e2e/visual.e2e.ts-snapshots/catalog-darwin.png
  - plans/builder-sandbox.md
skills:
  - loop-standard
  - voice
plans:
  - builder-sandbox, the tick-box verb | plans/builder-sandbox.md
  - check-set-op, the whole of it | ../grain/packages/grain/plans/check-set-op.md
  - form-from-data section 5b, the finding it closes | ../grain/packages/grain/plans/form-from-data.md
gates:
  - bun test (grain workspace) | 619 pass, 0 fail
  - bun run check (grain) | 5 packages, all exited 0
  - bun run lint (grain) | no errors; the two warnings on files touched here are pre-existing lines
  - bunx tsc --noEmit (portfolio) | exit 0, no output
  - bun test (portfolio) | 427 pass, 0 fail, 1614 expect() calls, 27 files
  - bunx playwright test (portfolio, full) | 247 passed, 1 skipped, 0 failed
  - bun tools/lint-gate.ts | 4 pre-existing regressions, unchanged by this diff (measured at HEAD)
diffstat: grain 13 files changed (303 insertions, 48 deletions) plus one new plan file; portfolio 8 files changed (118 insertions, 13 deletions) plus this report
unpushed: 48 | grain 12, portfolio 36. Both counts predate this run, whose work is still uncommitted at the time of writing. Pushing stays the owner's call and was not taken.
verifiedBy: nobody yet. The mutation table is the author proving the author's own tests, which is a second pass over the tests and not a second reader over the design. The two calls this run made on the owner's behalf, its own kind and a set rather than a toggle, are the part worth a real read.
doctor: five flags were due, one is closed and four are carried by name in their own section below. The one closed is the answer log: this run acted on a-20260813T2210Z-controls and acked it. The layer pin reading one behind is deliberate and this run makes it more so, since the verb went inside the held bundle.
---

# The vocabulary learns to tick a box, and the atom gets its address last

Yesterday's build finished the control family and then said plainly that it had left one thing
undone: a tick box was the one control the AI could not operate. `field.set` was the only verb the
vocabulary had for a form control, and it writes `el.value`. A tick box has a value, and that value
is **what the form submits when the box is ticked, not whether it is ticked**. So the write would
land, pass every guard, report success, change what the form means, and leave the control looking
exactly as it did before. `b-check` therefore shipped with no address at all, and the absence was
kept as a conformance test with the reason written beside it.

The owner authorized the verb on 2026-08-13. This run built it.

## What shipped

**`check.set`**, a new verb, on **`check`**, a new surface kind, emitting **`tick`**, a new render
op. One of each, which is the whole growth the vocabulary took, and the header on `contract.ts` says
that vocabulary grows reluctantly. The full spec is
[`check-set-op.md`](../../../grain/packages/grain/plans/check-set-op.md), written in the shape
`field-set-op.md` set for its sibling.

The handoff delegated two calls, and both are settled.

**It earns its own kind rather than joining `field`.** A manifest target's `accepts` is derived from
the registry, so a kind is a promise about which verbs work on it. Put both verbs on `field` and the
manifest tells a reasoner that `field.set` is legal on a tick box, which is the exact write the
finding is about: it lands and lies. Two kinds make the advertisement honest per control with no
special case anywhere, and each verb refuses the other's control at the door with the accepts echo
that was already there. The cost is one more word; the alternative is a manifest that misdescribes
one control in every form that has one.

**It is a set, not a toggle.** `field.toggle` was the shape the finding sketched, and it is the wrong
one. A toggle flips whatever is there, so a replay lands in the opposite state, and the verb could
not honestly carry `idempotent: true` — the flag a reasoner reads to decide whether a retry is safe.
A set states the state it wants, so the same payload always reaches the same end state and nothing
has to read the box before writing it. No verb in the vocabulary is named toggle, and a test says so.

## The guard that decides whether this verb is honest

The dispatcher's element check is `TICKABLE_TYPES.has(el.type)`, not `"checked" in el`. The property
check is the obvious one and it is the wrong one, for the same reason the whole finding exists: every
input carries a `checked` property, so a tick aimed at a text field would pass it, assign a property
nothing renders, and report a success nobody can see. That is the same silent lie one level down.
There is a test asserting the type guard is present and the property guard is absent, because the
wrong version of this line looks more idiomatic than the right one.

**A radio may be ticked and never cleared.** A group with nothing selected is a state no click can
reach, so the AI must not be able to put a form there either. The refusal is logged rather than
silent, on the precedent an unsafe `navigate` href already set, and a test asserts the refusal
returns before the assignment rather than logging and carrying on.

## The ordering was the point, and it was followed

The hard stop on this run was that `b-check` must not get its address until the verb actually
operates a control, proved live rather than reasoned, because an address landing before a working
verb is the same false promise in the other direction. So:

1. Contract, dispatcher, kit, reasoner branch, generated reference. Gates green.
2. A hand-authored checkbox on the `/about` contact form, addressed `check:contact-copy`, and the
   verb driven at it through the real door in a real browser. `check.set` ticked it and graded it
   grain. A `field.set` carrying the string `OVERWRITTEN`, aimed at the same surface, left the box's
   value as `yes` and its state untouched: the write that would have lied, refused by the closed
   vocabulary rather than by anything the page had to remember. A human click ticked it and settled
   the grain grade, which is the same lifecycle a prefilled text field follows.
3. Only then `b-check`'s `data-bind-data-surface`, the old "carries NO surface" test replaced by the
   one that keeps the new address honest, and the hand-authored control swapped for the atom
   rendering the same markup from `contact-form.json`. Re-proved live through the atom.

## The first control it operates is a real one

`/about`'s contact form gained a **Copy me in** tick box, which puts the visitor's own address in the
mail draft's cc. It is the only way a static site can give someone a copy of what they sent, since
there is no server here to send them one, and an empty email field simply leaves the cc off rather
than producing a draft addressed to nobody. The point of using a real control rather than a fixture
is that the verb is now covered by something a person also uses. It is a product call as much as a
technical one, and it is listed under what needs human eyes below.

## Gate output

```
$ bun test            (grain workspace)
 619 pass
 0 fail

$ bun run check       (grain)
@tjakoen/grain check: Exited with code 0
@tjakoen/mill check: Exited with code 0
@tjakoen/grain-mcp check: Exited with code 0
@tjakoen/crumb check: Exited with code 0
@tjakoen/proof check: Exited with code 0

$ bunx tsc --noEmit   (portfolio)
(no output, exit 0)

$ bun test            (portfolio)
 427 pass
 0 fail
 1614 expect() calls
Ran 427 tests across 27 files. [2.57s]

$ bunx playwright test (portfolio, full suite)
  1 skipped
  247 passed (1.4m)
```

## Every new test was proved by mutation

Green tests are a claim, and three of these carry the design rather than describing it, so each was
made to fail on purpose before it was kept.

| Mutation | What went red |
| --- | --- |
| `check.set` accepts `["check", "field"]` | 3 fail: the registry shape, the non-overlap assertion, and the door test that refuses `check.set` on a text field |
| Dispatcher guard back to `"checked" in el` | 2 fail: the type-guard test and the radio-refusal ordering test |
| Reasoner validates `checked === undefined` instead of `isCheckedState` | 1 fail: the non-boolean rejection, which is the string-`"false"` hazard |

Each mutation was reverted and the full suite re-run green afterwards.

## The catalog baseline, and whose red it was

Editing any component's `.md` re-renders the catalog and turns `catalog-darwin.png` red, and that red
belongs to whoever edited the doc. `b-check.md` was edited here, so the baseline was refreshed here,
and the rendered page was read before blessing it rather than after: the new prose sits under its
heading, the code fence carries its Copy control, the live panel renders a real ticked box, and the
new paragraph about radio groups reads correctly. Only `catalog-darwin.png` changed. `/about` has a
baseline too and did not move, because the default view of that page shows the Profile panel and the
contact form is behind its tab.

## Carried, not fixed: the four lint regressions

`bun tools/lint-gate.ts` reports four counts above the committed baseline: `voice:backtick` +60,
`oxlint:unicorn(no-array-sort)` +12, `voice:emoji` +2, `oxlint:eslint(no-control-regex)` +1. None of
them is this diff's. That is measured rather than assumed: a detached worktree at `HEAD` produces the
same four numbers exactly, so the baseline has been stale since some earlier committed run. It is
deliberately **not** re-blessed here, because accepting another session's drift under this run's name
is how a ratchet stops meaning anything. Whoever owns those commits should run `bun run lint:baseline`
and say what they accepted.

## Session doctor flags, carried by name

Five were due at session start. `answer log` is closed: `a-20260813T2210Z-controls` was the answer
this run acted on, and it is acked. The other four are untouched and are named here rather than
silently carried: `graphify freshness` (the merged graph predates this repo's own extraction),
`layer pins current` (grain 0.1.21 < 0.1.22, and refreshing the pin is exactly what must not happen
while the bundle is held), `run ledger` (three older reports missing evidence), and `unpushed work`
(36 commits ahead at session start, and pushing is the owner's call, see below).

## What was NOT done

- **Nothing was pushed or published**, per the run envelope. Grain 0.1.22 is held unpublished on
  purpose, and the owner's answer this run was that the verb goes **inside the held bundle** rather
  than shipping after it. So the bundle now carries the controls and the verb that operates them, and
  there is no published window in which a tick box exists that nothing can tick.
- **Nothing, on the docs.** `docs/grain/AI-INTERFACE.md` was outside the scope cap and was reported
  as drift rather than quietly fixed; the owner extended the cap mid-run, so the verb table, the
  surface-kind list, the `RenderOpKind` union, the `RenderOp` shape and a note explaining why the
  two kinds are separate all landed there in the same run. The ten backticks that added to the lint
  ratchet are the file's own convention for a literal token, which VOICE allows; the one em-dash the
  first draft added was removed rather than absorbed.
- **Sandbox pieces 1 and 2 were not started.** The verb was the whole of this unit, and piece 2 in
  particular now has what it was waiting for.

## What needs human eyes

1. **The Copy me in tick box is a new control on a published page.** The verb needed a real control
   to operate and this is the honest one, but adding it is a product decision. Dropping it costs one
   entry in `content/data/contact-form.json` and one tag in `view/pages/about.html`.
2. **The names.** Kind `check`, verb `check.set`, op `tick`, alongside the `b-memo` and `b-check`
   naming calls already recorded as open. Cheap to change while nothing is published, expensive after.
3. **Push.** 36 commits ahead at session start plus this run's, oldest more than a day old. Still the
   owner's call, and still blocking the skills rollout.
