---
title: The Nest loads when the ant is clicked, not on every page
date: 2026-11-08
status: complete
lane: gated
branch: perf/nest-lazy-load
scope: [scripts, e2e, audit, artifacts/runs]
touched:
  - scripts/page-islands.js
  - scripts/nest-mockup.js
  - scripts/desk-commands.js
  - e2e/terminal.e2e.ts
  - audit/report.json
  - audit/report.md
  - artifacts/runs/2026-11-08-nest-lazy-load.md
diffstat: three scripts, one e2e file, the regenerated audit, and this report
unpushed: 1
verifiedBy: resource timing before and after on two routes; a lazy request test; the full terminal e2e; the acceptance filter; the unit suite; typecheck; oxlint; the lint gate; the link lint; and the full audit
doctor: not run for this scoped pass
---

The Nest was the one page island imported on every route. A page that never opened the colony
still downloaded the 138,230 byte game module and its CSS. The launcher now lives in the page
island itself, and the game is imported only by the ant, the note start button, the `nest`
terminal command, the `stray` terminal command, or a direct `window.__nestLauncher.open()` call.

## Numbers

Measured with Playwright resource timing in a fresh context at 1440x900, after the page load and
before any interaction.

| Route | Requests before | Requests after | Raw JS before | Raw JS after | Game before | Game after |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 61 | 60 | 518,179 | 383,896 | yes | no |
| `/notes/the-site-has-ants` | 64 | 63 | 520,817 | 386,534 | yes | no |

Script requests drop from 47 to 46 on `/`, and from 48 to 47 on the note. The raw drop is 134,283
bytes on both routes. The launcher adds 3,899 bytes to `page-islands.js`, so the net is 134,283
rather than the game's full 138,230.

After the first click the game request appears and the raw total goes to 522,437 on `/` and
525,075 on the note. The click path is not slower in a way the tests can see; the game is imported
before the panel is built.

The regenerated audit is narrower than the resource-timing sum because it counts the document's
script delivery rather than every dynamically imported module. It reports 232 KB JS and 38
requests on `/`, and 234 KB JS and 41 requests on the note. The committed audit baseline in HEAD
predates the current build, so the Playwright before and after is the comparison this report
relies on.

## What changed

`scripts/page-islands.js` now builds the status-bar ant, its small stylesheet, the note start
handlers, the `window.__nestLauncher` placeholder and the `window.__nestStray` placeholder. The
first interaction imports `/site/nest-mockup.js` and hands control to the game.

`scripts/nest-mockup.js` now reuses the launcher's ant instead of creating a second one, and takes
over the click and start handlers after import. The game still owns the panel, the colony, the
stray animation and the debug hooks.

`scripts/desk-commands.js` makes `stray` import the game before it spawns the ant. The `nest`
command already imported the game, and neither command opens the panel on its own.

`e2e/terminal.e2e.ts` adds a request-level test that fails if `/site/nest-mockup.js` is fetched
before the ant is clicked, then passes after the click.

## Gates

The typecheck and oxlint are clean.

```text
$ bun run check
$ tsc --noEmit
```

```text
$ bunx oxlint scripts/page-islands.js scripts/nest-mockup.js scripts/desk-commands.js e2e/terminal.e2e.ts
Found 0 warnings and 0 errors.
Finished in 32ms on 4 files with 137 rules using 8 threads.
```

The unit suite is unchanged.

```text
$ bun test
 896 pass
 0 fail
 3890 expect() calls
Ran 896 tests across 49 files. [7.84s]
```

The lint gate still reports the two advisory regressions from main.

```text
$ bun tools/lint-gate.ts
lint gate: 2 lint(s) regressed against tools/lint-baseline.json:
  voice:backtick: baseline 3116 -> now 3121 (+5)
  oxlint:eslint(no-unused-expressions): baseline 0 -> now 1 (+1)
A real increase is fine — rerun `bun run lint:baseline` to accept it deliberately. A surprise
one is a warning worth fixing before it joins the baseline permanently.
```

The link lint passes.

```text
$ bun run lint:links
link-lint: 61 rendered file(s), no dead relative links.
```

The acceptance filter passes.

```text
$ PORT=3184 bunx playwright test e2e/terminal.e2e.ts e2e/wcag.e2e.ts -g "nest|open Nest" --ignore-snapshots
Running 5 tests using 4 workers
  5 passed (4.4s)
```

The full terminal suite passes, including the note start, the terminal command, the stray command,
the debug hooks and the pause loop.

```text
$ PORT=3184 bunx playwright test e2e/terminal.e2e.ts --ignore-snapshots
Running 30 tests using 4 workers
  30 passed (37.4s)
```

The audit was regenerated and every page returned successfully.

```text
$ bun run audit
[audit] / … ok (200, 232kb JS / 942kb total, 38 req, load 129ms)
[audit] /notes/the-site-has-ants/ … ok (200, 234kb JS / 1235kb total, 41 req, load 64ms)
[audit] wrote audit/report.json + audit/report.md
[audit] endpoints: `/sitemap.xml` ✓ · `/robots.txt` ✓ · `/llms.txt` ✓
```

The launcher is visible on `/`, the note, `/standards/voice`, `/plans`, `/grain`, `/batch`,
`/about`, `/resume`, `/mail` and `/cv`, with no game request before interaction. The `/cv` route
was the page without the desk console in this check.

## What was not done

The launcher is inline in `scripts/page-islands.js`, not a separate module, because the scope cap
did not name a new file. The game module still contains the old launcher fallback and the stray
controller. It reuses the launcher's ant and is loaded only on first use, so the byte goal is met,
but this is a hybrid split rather than a pure launcher module.

The random stray on a cold page no longer appears before the game has been imported once. The
`stray` terminal command and `window.__nestStray.spawn()` import the game first. The e2e stray
test still passes, including the reload path. This is the one visible behavior change to review.

`?nest-debug` still requires the launcher click. It does not auto-open the colony; the existing
tests click the ant and then read `window.__nest`. The debug hook names and shapes are unchanged.

The full 521-test Playwright suite was not rerun for this pass. The terminal suite and the stated
acceptance filter ran. The earlier loop-performance branch had 510 of 521 pass with the failures
in builder, AI presence and plan pages; those are outside this change.

No push, no merge, no GRAIN change, no node_modules change, no view markup and no new server route.

## What needs human eyes

The cold-page stray: decide whether the easter egg should still appear before the game has ever
been imported. Restoring it means moving the stray controller and its ant art into the launcher,
which grows the launcher and weakens the byte win.

The inline launcher: decide whether this is acceptable or whether a separate
`scripts/nest-launcher.js` should be allowed in a follow-up. The scope cap did not name the file.

The hybrid game file: the game still owns a fallback launcher. A later cleanup can remove that
copy after the inline launcher has proved stable.

The audit numbers: the audit's 232 KB / 38 requests on `/` and the Playwright 383,896 bytes / 60
requests are different measurements, not a contradiction. Use the resource timing for before and
after, and the audit for the product's own baseline.

## Screenshots

- `screenshots/nest-lazy-launcher.png`: the enlarged status-bar launcher on `/`, closed.
- `screenshots/nest-lazy-open.png`: the colony after the first click.
- `screenshots/nest-lazy-open-full.png`: the full page with the open colony.
