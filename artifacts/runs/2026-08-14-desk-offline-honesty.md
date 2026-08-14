---
title: The dev desk stops improvising, and a dead door says so on the pane
date: 2026-08-14
status: complete
lane: gated
branch: main
scope:
  - package.json
  - scripts/site.js
  - src/server.ts
  - artifacts/runs/
touched:
  - package.json
  - scripts/site.js
  - src/server.ts
skills:
  - loop-standard
  - voice
plans:
  - none, this came in as a bug report from the owner's local run
gates:
  - bun run check | tsc --noEmit, exit 0, no output
  - bun test | 426 pass, 0 fail, 1600 expect() calls, 27 files
  - bun run lint | exit 1, 35 warnings, the identical warning set as HEAD without these edits
  - bun tools/lint-gate.ts | four categories above baseline, none of them from this change
  - bunx playwright test e2e/desk-door.e2e.ts e2e/ai-degradation.e2e.ts | 7 passed (10.6s)
  - bunx playwright test (full suite) | 7 failed, 1 skipped, 238 passed (7.7m)
  - bunx playwright test (the 5 failing specs, alone, this tree) | 1 failed (catalog baseline), 39 passed (1.0m)
  - bunx playwright test (the same 5 specs, alone, worktree at the commit before this one) | 2 failed (catalog baseline, grain-page choreography), 38 passed (54.1s)
diffstat: 3 files changed, 39 insertions and 12 deletions, across two commits (f665b72 here, and the src/server.ts half swept into another session's 723b1a7)
dirty: nothing of this session's is uncommitted. e2e/calendar.e2e.ts is dirty and belongs to the calendar session.
unpushed: 33 | portfolio, counted after this run, nearly all of them other sessions'. Pushing stays the owner's call.
verifiedBy: nobody yet. Both states were looked at in a browser by the session that wrote them, and screenshots went into the session transcript rather than a tour.
doctor: 6 due at session start, all carried untouched. graphify freshness, layer pin grain 0.1.21 behind 0.1.22, run ledger evidence on two older reports, unpushed work, run reports keeping up (this report answers that one), answer log review-controls-complete.
---

The owner ran the site locally, asked the desk something, and got "Noted, I'll fold that into your
plan" back twice. That line is not the desk's. It belongs to grain's stub reasoner, which answers
every chat.send with the text you sent wrapped in a promise it cannot keep, and it exists to make the
/grain demo scenarios move without a model.

The desk sidebar sits on every page, so the stub was answering as the desk on every page of the dev
server.

## Why the pane could not tell the truth about it

The offline treatment is real and it works: body[data-desk="offline"] hides the composer, the chips
and the log, shows one centered notice, and forces the status bar to read "desk offline" whatever the
transport says. Only one place sets that marker, which is markOffline in the desk door.

The dev server did not stamp the desk door unless DESK_CLIENT was set. So on a plain `bun run dev`
the door module never loaded, nothing could set the marker, and the pane had no way to say offline
even in principle. Measured on the owner's own running server before the change: data-ai-online was
"true", there was no data-desk attribute at all, the presence chip read "desk online", and the
composer was live. The sidebar was not lying so much as it had no vocabulary for the truth.

## The two halves

`bun run dev` now sets DESK_CLIENT=1 and gets the same door a visitor gets, which is the owner's
call, taken because a dev server that behaves differently from the deployed site is how a stub reply
reaches someone's eyes in the first place. `bun run dev:stub` sets STUB_DESK=1 and forces the SSE
stub back, and STUB_DESK wins over DESK_CLIENT so the override works on any command rather than only
on the one script that spells it. The bare `bun src/server.ts`, which `bun run start` and the
Playwright webServer both boot, stamps nothing, so every e2e spec still drives the transport it
stamps for itself and no spec changed.

site.js closes the other half, for a case the door itself cannot cover. When the door module fails to
load, ai-dispatch marks presence false by outcome and there is no door left to mark anything. The
composer was disabled and left standing, which still looks like a live chat. The portfolio now reads
that outcome from outside and sets the marker itself, so the pane shows the notice instead. Client
transport only, deliberately: the SSE door flips presence off on a transient drop and back on
reconnect, and a blip must not strand the chat behind a permanent notice. The ai-degradation spec,
which is exactly that SSE case, still passes.

## What was seen rather than described

Both states were driven in a headless browser and screenshotted into the session.

- `bun run dev` on a spare port stamps the door, loads the 0.5B, and answers "What is BREAD?" with a
  grounded paragraph about the layers. Where the stub line used to be there is now the desk.
- Forcing the dead-door state on a client transport hides the composer, shows the notice, and flips
  the presence chip to "desk offline".
- `bun run dev:stub` and the bare server both stamp nothing, checked by reading the body tag off the
  wire.

## What was NOT done

- **Nothing was pushed.** 33 commits are ahead of origin, nearly all of them other sessions'.
- **The owner's second sighting was not reproduced.** They reported seeing the offline notice while
  the composer was still usable and the status bar still read online. Those three cannot be true at
  once once the marker is set, since one rule block hides the composer and flips presence together.
  The shape that fits is /components.css not applied on that load, which would leave the notice
  visible as plain markup and the offline rules absent entirely. Left open with the check named
  rather than guessed at.
- **The offline copy was not reworded.** It says the browser cannot run the model, which is right for
  a WebGPU failure and only roughly right for a door that failed to load.
- **No tour was written.** The two states are screenshots in the session, which is thinner evidence
  than a walk somebody else can run.
- **The full suite was not left green.** See below.

## What needs human eyes

1. **The catalog visual baseline fails at HEAD**, alone and under load, and it fails the same way in
   a clean worktree at the commit before this one, so it is not this change. It passed alone as
   recently as the 2026-08-13 report. The likely cause is that node_modules/@tjakoen/grain is a
   symlink to the grain working tree, so /catalog renders whatever grain currently has rather than a
   published package. Worth someone deciding, because re-blessing it would bake a working tree into a
   committed baseline.
2. **Five more specs failed only in the full parallel run** and pass alone on this tree:
   desk-model-chain twice, grain-page's timeline test, notes-demo, terminal. That is the
   choreography-under-load flake family the Playwright config already documents, and it is growing.
3. **Whether dev should download a model at all.** The new default means the first chat.send on a
   fresh dev machine pulls about 350MB. `bun run dev:stub` is the way out, and nobody has used it yet.

## Gate output

```
$ bun run check
$ tsc --noEmit

$ bun test
 426 pass
 0 fail
 1600 expect() calls
Ran 426 tests across 27 files. [3.61s]

$ bunx playwright test e2e/desk-door.e2e.ts e2e/ai-degradation.e2e.ts
  7 passed (10.6s)

$ bunx playwright test
  7 failed
    e2e/desk-model-chain.e2e.ts:78:3 › model NAVIGATE to a real route
    e2e/desk-model-chain.e2e.ts:128:3 › note-write: 'jot down that…'
    e2e/grain-page.e2e.ts:163:3 › the interaction timeline records BOTH halves of a crossing
    e2e/grain-page.e2e.ts:182:3 › AI: 'Watch the AI act' drives the surface through the door
    e2e/notes-demo.e2e.ts:9:1 › 'See what's new' travels the newest notes
    e2e/terminal.e2e.ts:37:3 › go navigates by page slug
    e2e/visual.e2e.ts:53:3 › catalog (/catalog) matches its visual baseline
  1 skipped
  238 passed (7.7m)

# the same five specs alone, this tree: everything but the baseline comes back
$ PORT=3223 bunx playwright test e2e/desk-model-chain.e2e.ts e2e/grain-page.e2e.ts \
    e2e/notes-demo.e2e.ts e2e/terminal.e2e.ts e2e/visual.e2e.ts
  1 failed
    e2e/visual.e2e.ts:53:3 › catalog (/catalog) matches its visual baseline
  39 passed (1.0m)

# the same five specs in a clean worktree at f665b72^, which is this change absent
$ PORT=3222 bunx playwright test e2e/desk-model-chain.e2e.ts e2e/grain-page.e2e.ts \
    e2e/notes-demo.e2e.ts e2e/terminal.e2e.ts e2e/visual.e2e.ts
  2 failed
    e2e/grain-page.e2e.ts:182:3 › AI: 'Watch the AI act' drives the surface through the door
    e2e/visual.e2e.ts:53:3 › catalog (/catalog) matches its visual baseline
  38 passed (54.1s)
```
