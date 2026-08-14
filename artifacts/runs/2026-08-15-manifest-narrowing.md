---
title: The manifest gets narrowed, and the model starts naming blocks
date: 2026-08-15
status: complete
lane: gated
branch: main
scope:
  - grain packages/grain/ai
  - grain packages/grain/plans
  - src/ai/block-reasoner.ts
  - artifacts/runs
touched:
  - grain packages/grain/ai/manifest-dom.ts
  - grain packages/grain/ai/manifest-dom.test.ts
  - grain packages/grain/plans/reasoner-manifest-narrowing.md
  - src/ai/block-reasoner.ts
  - artifacts/runs/2026-08-15-manifest-narrowing.md
skills:
  - loop-standard
  - voice
plans:
  - reasoner-manifest-narrowing | grain packages/grain/plans/reasoner-manifest-narrowing.md
  - builder-design, Open 3 | plans/builder-design.md
gates:
  - bunx tsc --noEmit (portfolio) | exit 0, no output
  - bun test (portfolio) | 539 pass, 0 fail, 32 files
  - bun run check (grain, 5 packages) | exit 0 on every package
  - bun run test (grain, 5 packages) | 635 pass, 0 fail
  - bun run lint (grain) | no new warning on the edited file
  - bun tools/lint-gate.ts | net ZERO on this diff, measured against a stash
  - bun tools/desk-audit.ts | 0 of 5 builder scenarios pass, before and after, which is the finding rather than a gate
diffstat: grain 4 commits, 3 files, 163 insertions, 15 deletions. Portfolio 1 file, 15 insertions, comment only.
unpushed: 81 | portfolio 62, grain 19. Both held. Pushing stays the owner's call and was not taken.
verifiedBy: nobody yet, and no tour is owed. Nothing a person looks at changed. /builder, its canvas, its rail and its drawer render exactly as they did; the whole diff is the text handed to a model plus a comment. The evidence a reader wants is the counts below and the reports under .cache/desk-audit/.
doctor: four flags due at session start, carried by name below, none fixed.
---

# The manifest gets narrowed, and the model starts naming blocks

Yesterday's measurement left one lead. The manifest handed to the 0.5B on `/builder` was fourteen
actions and fifty-three targets, seventeen of them chat message ids, and the model reliably picked a
plausible-looking surface out of that list rather than a block. Narrowing it was the owner's choice
over retuning this repo's prompt, and it is GRAIN's function rather than this repo's, so it needed
its own session and its own cap.

The five scenarios are still five reds. Everything underneath them moved, and then one further change
moved it back, which is the part of this run worth reading.

## What was surveyed before anything was cut

Seven callers reach the manifest functions outside `node_modules` and outside `dist`. The useful
shape is that the three consumers a narrower manifest would hurt, the MCP tool and the two
human-facing scripts, none of them take `manifestForReasoner` as a prompt: the scripts read the JSON
or the raw targets, and the MCP tool reads both. So a cut made inside the two text functions reaches
the two prompt paths and leaves the x-ray overlay, the terminal's `context` command and both
validation paths alone. The full table is in grain's plan file.

Two questions went to the owner before a line was written, because neither was in any file. Narrowing
is default-on for every screen rather than opt-in where a small model drives, on the argument that a
target no verb accepts is noise for a large model too. And the one portfolio file needed for an
opt-in design was granted, then turned out to be unnecessary: this repo's
`node_modules/@tjakoen/grain` is a symlink to the grain repo, so the change was live here the moment
it was written, with no publish and no version bump.

## The cut that costs nothing

A target whose accepts list is empty cannot be a legal move. `validateMove` refuses any target that
does not carry the verb, so a model that picks one has lost the turn before it starts, and listing it
in the prompt can only mislead. Seventeen of the fifty-three targets were `chat-msg:` ids, and
`chat-msg` is no registered surface kind, so every one of them was push-only and rendered its own
line saying that no verb targets it.

`manifestToText` now lists the operable targets and says how many it left out, so the omission is
stated rather than hidden. Where nothing was push-only the string is byte-identical to what it was,
which is the fleet guarantee and has a test of its own. `domManifest` is untouched.

Fifty-three targets became eight, four of them the blocks.

## The failure moved, and named its own cause

The narrowing did not fix the scenarios, and the way it failed was the useful part. The model stopped
answering with a wrong target and started answering with `builder-said`, an id that is in no targets
list at all. It is in the `in view` block, and the two line shapes were nearly the same:

    - id [kind] -> verbs        a target
    - id [kind] "text"          a readable surface

Same dash, same brackets, same order, differing only in what came after. A model told to pick a
target from a list found two lists, and the second one held the status line the page writes to. So
the state block stopped competing: no dash, no brackets, entries indented as `id = "text"` under a
heading that says in words that these are not targets and no verb acts on them.

## What the number did

Fifteen answers after both changes, against the eighteen that set the baseline. Still zero of five
scenarios passing, and every other measure moved.

| | before | after |
| --- | --- | --- |
| targets handed over | 53 | 8 |
| answers naming a real block verb | 0 of 18 | 6 of 15 |
| answers aimed at a block | 0 of 18 | 7 of 15 |
| answers aimed at `builder-rail` | 15 of 18 | 0 |
| answers aimed at `builder-said` | 1 of 18 | 0 |
| answers inventing the verb `move` | 16 of 18 | 8 of 15 |

Five of the fifteen picked a real block verb and a real block number, which had not happened once in
eighteen prior answers. Every one of those five was refused for the same reason: the target was `b2`
where the manifest addresses it `block:b2`.

## The fix that was authorized, measured, and reverted

That prefix looked like a contradiction this estate had written rather than a limit of the model. The
page's own line said "The blocks here are: b1, b2, b3, b4" three lines under a manifest listing
`block:b1` through `block:b4`, and the function that writes it says in its own comment that it names
the ids literally because a small model copies rather than computes. It copied. It was handed the
form that does not resolve.

The owner granted the change on that reasoning and the reasoning was wrong.

Printing the ids as `block:b1` through `block:b4`, with one added line telling the model to copy the
address exactly, prefix included: **zero of fifteen answers aimed at a block**, down from seven. The
model collapsed to answering `move` on `builder`, a token off the screen name, in fifteen answers out
of fifteen. Dropping the added instruction line and keeping only the prefix did not recover it:
**zero of ten aimed at a block**. Twenty-five answers across two variants, both worse than the bare
id, so the change was reverted whole rather than tuned a third time.

The reading that survives the data is that a 0.5B can copy `b2` and cannot copy `block:b2`, and that
handing it an address it cannot reproduce is worse than handing it a short one that needs a prefix
added. The contradiction is real; the fix is on the other side of it, normalizing a bare id up to
`block:<id>` when the answer is read rather than pushing the long form down into the prompt. That is
a decision rather than a cleanup, so it was filed and not taken.

What ships from that attempt is the comment in `src/ai/block-reasoner.ts` recording it, because a
contradiction that looks worth fixing and is not will otherwise be fixed again by the next reader.

## What was not done

- **The five reds are still red.** Narrowing was the strongest lead in the data and it was not
  enough. The plan's fallbacks, retuning this repo's prompt or saying the honest thing on the page,
  are both still open, and the first one is now known to be harder than it looked.
- **Nothing was pushed.** Eighty-one commits are held across the two repos, sixty-two here and
  nineteen in grain, of which four are this session's and all four are grain's. Pushing stays the
  owner's call and it was not taken.
- **grain 0.1.22 is unpublished** and the pin here stays at 0.1.21. The symlink meant the measurement
  never needed a publish.
- **The two red gate timeouts were not touched.** The catalog visual spec and `grain-page.e2e.ts:182`
  are one load-edge item and tuning them is tuning a gate until it passes.
- **The lint baseline was not refreshed.** It is stale by a wide margin, `voice:backtick` alone is
  seventy-five over, and none of it is this diff's: measured against a stash, this diff is net zero.
  It belongs to whoever caused it.
- **Nobody has watched any of this.** The audit drives a headless browser. `/builder` has still never
  been opened on a WebGPU machine and asked to drop a card by hand, which was already true yesterday
  and is not fixed by a better manifest.

## Doctor flags, carried

Four were due at session start and none was fixed, because none is this run's.

- **graphify freshness**, the merged graph predates this repo's own extraction.
- **layer pins current**, grain 0.1.21 against 0.1.22, which is deliberate while the publish is held.
- **run ledger**, four of twenty reports missing evidence. This report is the twenty-first and is
  written to the standard; the four earlier ones belong to their own sessions.
- **unpushed work**, now eighty-one across the two repos, said above with the number rather than
  around it.
