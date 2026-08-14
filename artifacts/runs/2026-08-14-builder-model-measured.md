---
title: The model gets measured, and it cannot use the vocabulary
date: 2026-08-14
status: complete
lane: gated
branch: main
scope:
  - tools/desk-audit.ts
  - plans
  - artifacts/runs
touched:
  - tools/desk-audit.ts
  - plans/builder-design.md
  - artifacts/runs/2026-08-14-builder-model-measured.md
skills:
  - loop-standard
  - voice
plans:
  - builder-design, Verification and Open | plans/builder-design.md
gates:
  - bunx tsc --noEmit | exit 0, no output
  - bun test | 544 pass, 0 fail, 33 files
  - bun tools/lint-gate.ts | net ZERO on this diff, measured against a stash
  - bun tools/desk-audit.ts | 0 of 5 builder scenarios pass, which is the finding rather than a gate
diffstat: 2 files changed, 261 insertions, 16 deletions
unpushed: 59 | portfolio 59, grain 15. Both held. Pushing stays the owner's call and was not taken.
verifiedBy: nobody yet, and no tour is owed. Nothing a person looks at changed: /builder, its canvas, its rail and its drawer are untouched, and the whole diff is a local-only measuring tool plus two documents. The evidence a reader wants here is the numbers below and the reports under .cache/desk-audit/.
doctor: four flags due, carried by name below, none fixed.
---

# The model gets measured, and it cannot use the vocabulary

D5 shipped the claim that the 0.5B chooses the block verb on `/builder`. Nothing had ever checked
whether it chooses correctly. `builder-canvas.e2e.ts` scripts the engine, so it proves every link in
the chain around the model and none of the model: it answers `block:b4` because the test told it to.

`tools/desk-audit.ts` now has five `/builder` scenarios that drive the real Qwen2.5-0.5B through
WebGPU. The answer is that it does not choose correctly, and it does not choose correctly in a very
specific way.

## What was run, and what came back

Every scenario opens the same page: an intro, a card and a callout from the address, plus a second
card from a second prompt, giving b1 lede, b2 card, b3 callout, b4 card. Then one sentence goes into
the canvas composer, and the canvas is read back.

| Scenario | The sentence | Wanted |
| --- | --- | --- |
| `builder-drop` | drop the second card | b4 gone |
| `builder-bare-id` | drop b4 | b4 gone |
| `builder-span` | make the callout full width | b3 full |
| `builder-move` | move the callout up | b1 b3 b2 b4 |
| `builder-no-verb` | the card should mention pricing | a reply, and nothing moved |

Eighteen model answers across five runs of the set. **Not one landed a correct op, and not one
targeted a block at all.**

- Sixteen of eighteen answered `move`, which is not a verb in the vocabulary, and fifteen aimed it at
  `builder-rail`, which is a real surface on the page that accepts no verb.
- One answered `block.remove` on `builder-said`, which is the line the page writes its own status to.
- One ran away into a payload nesting `builder-rail` inside itself until it hit the token cap.
- The payload key drifted between `direction` and `move`, and one answer put a block id in it.
- Every answer carried a confident reply. "The page has been moved to the bottom." Nothing had moved.

## It is the vocabulary, not the reference

The comfortable reading is that "the second card" asks a 0.5B to filter and count, which it cannot
do, and that better phrasing would rescue it. `builder-bare-id` exists to close that off: it hands
the address over literally, "drop b4", with nothing left to resolve. Same answer, `move` on
`builder-rail`.

So the failure is at the vocabulary. No amount of better referring language reaches it, which is
worth knowing before someone spends a day on the phrasing.

The prompt was read rather than assumed. The manifest handed over lists `block:b1` through
`block:b4` against all three block verbs, and this page's own line under it names the four ids, the
three width words and the two directions. It is 14 actions and 53 targets long, 17 of those targets
being chat message ids, and the model reliably picks a plausible-looking surface out of that list.
That is the strongest lead and it is grain's rather than this repo's: `manifestForReasoner` is
grain's function and narrowing what a screen offers a small model is a fleet-wide change.

## What the same eighteen runs prove

Every failure was caught, and the fence is now measured rather than argued.

The router sent each sentence to the edit path. grain built the prompt from the live manifest. grain
refused what came back, by name: unknown verb, or a surface that does not accept the verb. The page
said which refusal it was, in a sentence a visitor can act on. And the canvas was byte-identical in
all eighteen runs: `b1/full b2/half b3/full b4/half`, every time.

The claim in the plan has flipped direction. It used to be that everything around the model is proved
and the model is unmeasured. It is now that the fence is measured and holds, and the thing inside it
cannot yet do the job.

## Three defects the harness found in itself

Worth recording, because two of them would have produced a confident wrong number.

**A scenario that passed for the wrong reason.** `builder-no-verb` was graded on the canvas not
moving, which is what "reply without acting" looks like. It is also what a REFUSAL looks like. The
first run scored a hit while the model was answering `block.remove` on `builder-said` and grain was
throwing it out. A refusal and a correct reply are opposite outcomes that a canvas grader cannot
tell apart, so the scenario now fails on the refusal wording as well.

**Two prompts, one identical reply, and no way to see why.** The first two scenarios came back with
the same refusal line. A refusal line cannot tell you whether the model said the same wrong thing
twice or the harness handed it the same prompt twice. The audit now records what the model was asked
and what it answered, verbatim, into the report, by wrapping the desk's one completion seam before
any page script runs. That field is the most useful thing in the report and it did not exist.

**A launch failure reported as missing hardware.** An interrupted run left a Chromium holding the
persistent profile. Every rung of the launch ladder then failed on `ProcessSingleton`, and the tool
threw `no WebGPU adapter available in any launch mode`, which sends whoever reads it to look at
their GPU. It now says no browser would start, and names the profile and the command that clears it.

One more, in the code rather than the measurement: the scenario shape wanted a field called `then`,
and an object with a `then` key is a thenable, so anything that ever awaits one gets its own field
called as a promise resolver. The lint gate caught it. It is `andThen`.

## Gate output

```
$ bunx tsc --noEmit
(no output, exit 0)

$ bun test
 544 pass  0 fail            Ran 544 tests across 33 files.

$ bun tools/lint-gate.ts                        # with this session's diff
  5 regressed: voice:backtick +75, no-array-sort +10, no-thenable +5, voice:emoji +2, no-control-regex +1

$ git stash push -- tools/desk-audit.ts && bun tools/lint-gate.ts    # the same gate at HEAD
  4 regressed: voice:backtick +75, no-array-sort +10, voice:emoji +2, no-control-regex +1

  So four of the five are pre-existing at HEAD, from a baseline another session left stale, and this
  diff added exactly one: no-thenable, which is the `then` field above. After the rename, net zero.

$ bun tools/desk-audit.ts builder-baseline --only=builder-drop,builder-bare-id,builder-span,builder-move,builder-no-verb
  0/5 passed — .cache/desk-audit/report-builder-baseline.json
```

**Playwright was not run and that is deliberate**, not skipped. Nothing under `src/`, `e2e/`, `view/`
or `src/server.ts` changed: the diff is a local-only audit tool and two documents. The suite has a
known-red catalog visual spec under full-suite load, filed in the plan's Open as the owner's call,
and running it here would produce that same red against a diff that cannot have caused it.

## Session doctor flags, carried by name

Four due, none fixed, the same four as the last several runs. `graphify freshness`. `layer pins
current`, one behind on purpose while grain 0.1.22 is held. `run ledger`, older reports from sessions
that are gone. `unpushed work`, now 59 in the portfolio and 15 in grain, both held on the owner's
standing call.

## What needs human eyes

1. **What to do about a model that cannot use the vocabulary.** Three directions are written up in
   the plan's Open, item 3. The strongest one is grain's rather than this repo's, and none of them is
   a session's call to make.
2. **The catalog visual spec's 5s timeout, and `grain-page.e2e.ts:182`.** Unchanged, untouched, still
   one load-edge item with two instances.
3. **The answer channel.** Four rounds of tour answers have not reached `plans/decisions/answers.jsonl`.
   It is its own task with its own scope, and it was not started under this one's cap.
4. **Push, and publish.** 59 portfolio commits, 15 grain, and grain 0.1.22 still unpublished.
