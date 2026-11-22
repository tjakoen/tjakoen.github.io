---
title: The desk's first visit says what it is doing
date: 2026-11-22
status: complete
lane: direct
branch: main
scope:
  - src/ai/model-saved.ts
  - src/ai/desk-browse.ts
  - src/ai/desk-door.ts
  - src/ai/desk-reasoner.ts
  - src/ai/webllm-loader.ts
  - tools/desk-audit.ts
touched:
  - plans/chat-2026-11-22-e811fe7b.md
  - src/ai/model-saved.ts
  - src/ai/model-saved.test.ts
  - src/ai/load-bar.test.ts
  - src/ai/desk-browse.ts
  - src/ai/desk-door.ts
  - src/ai/desk-reasoner.ts
  - src/ai/webllm-loader.ts
  - tools/desk-audit.ts
  - artifacts/runs/2026-11-22-desk-first-visit.md
plans:
  - chat-2026-11-22-e811fe7b
consulted:
  - CLAUDE.md
gates:
  - bun run check
  - bun test
  - bunx playwright test e2e/desk-door.e2e.ts e2e/desk-model-chain.e2e.ts e2e/desk-arrival.e2e.ts --ignore-snapshots
diffstat: about 120 lines of new module and tests, and roughly 30 changed lines across five existing files.
unpushed: 0
verifiedBy: Open the portfolio on a desktop browser with WebGPU. A fresh browser shows the desk notice reading "About 350 MB the first time, then cached." Run localStorage.setItem on the key desk-model-saved:Qwen2.5-0.5B-Instruct-q4f16_1-MLC to 1, create a cache named webllm/model, and reload. The notice now says the copy is saved and the desk will be ready in a few seconds.
doctor: not run. The PANTRY doctor was not part of this task.
---

# The desk's first visit says what it is doing

The desk keeps its 0.5B model on Hugging Face, so a first visit still downloads about 350 MB. This run
changed what the visitor is told and what the browser is asked to keep, and left the download itself
alone.

Three things changed. The desk now remembers a finished load across visits, where it used to remember
it only for the current tab, and it checks that memory against the browser's Cache Storage bucket
named webllm/model before it promises a fast load. After a finished load it asks the browser to keep
the weights through navigator.storage.persist, which lowers the chance that a full disk evicts 350 MB.
And the load bar counts megabytes for a first-time visitor ("Downloading Qwen2.5-0.5B: 140 of about
350 MB. One time only.") and says the copy is saved for a returning one.

The bucket name was confirmed against the pinned WebLLM release, 0.2.79, which uses webllm/model for
weights, webllm/wasm for the compiled library and webllm/config for the model record. If a later
WebLLM release renames the bucket, the check answers no and the desk falls back to the download
wording, which understates rather than overpromises.

## Gate output

The host run of bun test carries thirteen failures that exist without this change. They are the
Windows host problems already recorded in memory (symlinks, line endings, path slugs). The same suite
with this change stashed gave the same thirteen, so the difference is the eleven tests this run added.

```
$ tsc --noEmit

bun test (this change):      1025 pass, 13 fail, 1038 tests across 60 files
bun test (change stashed):   1014 pass, 13 fail
bun test (new files only):   127 pass, 0 fail across model-saved, load-bar, desk-reasoner, webllm-loader

playwright (desk-door, desk-model-chain, desk-arrival):
  19 passed (12.3s)
```

## What was not done

The real 350 MB download was not run in a browser, so the megabyte count on the load bar was checked
only by unit test and not watched live against WebLLM's progress callback. The bar's percentage covers
the download and the move into GPU memory together, which is why the copy says "of about".

The lint gate crashed inside oxlint on this Windows host before it produced a count, and the voice lint
reported thousands of flags across the whole repo that predate this run, so neither gave a usable signal.
The new prose was checked for em-dashes by hand. The Docker gate described in the repo notes was not run.
The visual-regression suite was skipped, since its baselines are macOS-specific.

A data-saver prompt was left out on purpose: a visitor on a metered connection still starts the 350 MB
download by sending a first message, with the size stated above the composer. Asking first on a metered
connection is a reasonable next step and belongs in its own change.

## What needs human eyes

Watch one real first load on a normal connection and read the load bar as a visitor would. The wording
"Downloading Qwen2.5-0.5B: 140 of about 350 MB. One time only." is the part most worth a second look.
Nothing is committed, so the work is in the tree and not on any branch.
