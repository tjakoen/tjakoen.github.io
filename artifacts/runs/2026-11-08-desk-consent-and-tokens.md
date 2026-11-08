---
title: Ask before the desk stores a cookie, and put the panel on the type scale
date: 2026-11-08
status: complete
lane: gated
branch: main
scope: [scripts, src, e2e, docs, package.json, bun.lock, artifacts/runs]
touched:
  - scripts/desk-consent.js
  - scripts/page-islands.js
  - scripts/nest-mockup.js
  - src/server.ts
  - e2e/desk-consent.e2e.ts
  - e2e/desk-door.e2e.ts
  - e2e/grain-page.e2e.ts
  - e2e/notes-demo.e2e.ts
  - docs/AUDIT-2026-11-08.md
  - package.json
  - bun.lock
  - artifacts/runs/2026-11-08-desk-consent-and-tokens.md
diffstat: 12 files changed, 237 insertions(+), 37 deletions(-), this report included
unpushed: 1 | main is one commit ahead of origin after this commit
verifiedBy: 897 unit tests, 69 desk and Nest browser tests including the two new consent tests, three WCAG scans, the typecheck, the lint gate at 4483, link lint over 61 files, and two screenshots of the notice and the retokenized panel
doctor: 23 checks, 0 failing, 1 due | the Claude Code context budget, a machine setting
---

## What was asked

The audit's open items were the session cookie, with consent asked in the chat, and the Nest panel's
sub-scale type. GRAIN 0.1.30 was released for both: the client now takes a server-issued session id,
the chat-message docs carry a consent-notice pattern, and the type scale gained two dense steps.

## What changed

**The desk asks before it stores.** A first-party session cookie is offered in a chat message from
the desk, with Remember this chat and Not now. Nothing is written before the choice. Not now stores
nothing and the tab is not asked again; Allow stores the tab's session id for 30 days. The question
is asked after the first exchange, not on page load, because it is about remembering a conversation
that has started.

**The page boots the session.** A tiny inline script in the page head reads the cookie or mints a
UUID and sets window.__DESK_SESSION__ before the dispatcher runs. GRAIN 0.1.30 reads that id before
its own per-tab fallback, so the seam is live in the app rather than only in the package.

**The panel is on the scale.** The Nest's raw 8, 9, 10, 11 and 12px sizes now use --text-3xs,
--text-2xs and --text-2xs from GRAIN, which documents the 4.5:1 floor for both dense steps. The
layout holds at 374px and the meters, log, stats and larder still fit.

**The counts follow the new message.** The chat tests that count messages now exclude the consent
notice by its attribute, so the notice can appear without moving their arithmetic.

## Gate output

```text
$ bun run check
$ tsc --noEmit

$ bun test
 897 pass
 0 fail
 3895 expect() calls
Ran 897 tests across 49 files. [7.06s]

$ bun tools/lint-gate.ts
lint gate: level. 4483 flag(s) total (oxlint + voice-lint), matching or under the 4483 in tools/lint-baseline.json (generated 2026-11-08).

$ bun run lint:links
link-lint: 61 rendered file(s), no dead relative links.

$ bunx playwright test e2e/desk-consent.e2e.ts e2e/editor-shell.e2e.ts e2e/grain-page.e2e.ts e2e/notes-demo.e2e.ts e2e/desk-door.e2e.ts e2e/terminal.e2e.ts --ignore-snapshots --workers=2
 69 passed (1.3m)

$ bunx playwright test e2e/wcag.e2e.ts -g "open Nest|light, part 2" --ignore-snapshots
 3 passed (54.8s)
```

## What was not done

The server still accepts a session id it did not mint. The consent cookie and the GRAIN seam are the
first half; validating issued ids at /stream and /intent is the second and is named as the remaining
partial in the audit page.

The full browser suite was not rerun end to end. The 69 selected desk and Nest specs passed.

The visual baselines were not regenerated. The consent notice only appears after a chat message, so
page-level snapshots that show no conversation are unchanged; chat surfaces will differ when a run
does not carry consent.

## What needs human eyes

Read the consent question once for tone and for the 30-day promise. Play the first exchange and
watch where the notice lands after the reply. Look at the panel at the new dense sizes and decide
whether the meter hints at 10px are better or merely bigger.
