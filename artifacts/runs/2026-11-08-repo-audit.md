---
title: Audit the whole repo and close the silent-pass class
date: 2026-11-08
status: complete
lane: gated
branch: main
scope: [src, src/ai, src/routes, scripts, view, content, standards, docs, plans, tools, e2e, .github/workflows, audit, CLAUDE.md]
touched:
  - src/server.ts
  - src/config.ts
  - src/content.ts
  - src/component-refs.ts
  - src/ai/catalog.ts
  - src/ai/actions.ts
  - src/ai/desk-reasoner.ts
  - src/ai/block-composer.ts
  - scripts/nest-mockup.js
  - scripts/talk.js
  - e2e/wcag.e2e.ts
  - e2e/welcome-flagship.e2e.ts
  - e2e/terminal.e2e.ts
  - tools/export.ts
  - tools/link-lint.ts
  - tools/screenshots.ts
  - tools/lint-baseline.json
  - view/pages/grain/builder.html
  - standards/README.md
  - standards/SESSION-LOOP.md
  - content/notes/build-the-floor.md
  - content/notes/whitepaper-one-vocabulary.md
  - docs/HACKING.md
  - docs/CONTENT-BACKLOG.md
  - docs/AUDIT-2026-11-08.md
  - plans/ant-nest-game.md
  - .github/workflows/heartbeat.yml
  - audit/report.json
  - audit/report.md
  - CLAUDE.md
diffstat: 41 files changed, 16,028 insertions(+), 1,759 deletions(-), mostly the refreshed 427 page audit report
unpushed: 1 | main is one commit ahead of origin after this commit
verifiedBy: 897 unit tests, 119 affected browser tests plus the two open-Nest scans and five repeats of the placement test, the full typecheck, the lint gate at 4483, link lint over 61 files, the 427 page AEO/SEO audit with zero failures, and the doctor
doctor: 23 checks, 0 failing, 1 due | the Claude Code context budget, a machine setting
---

## What was asked

After main was merged and pushed, audit the whole repo: content, code, framework and design-system
compliance, tests, coverage and WCAG. The audit ran as five read-only auditors by bounded scope, each
with the nine-dimension rubric from AUDIT-STANDARD, and this report is the run beside the dated
findings page at docs/AUDIT-2026-11-08.md.

## What changed

**The silent-pass class is closed.** Five checks could report success without doing their work: the
WCAG route scan could scan zero pages, the screenshot tool exited 0 after a failed capture, the
heartbeat swallowed exit 2 and closed the findings issue, the export dropped badge routes on a
corrupt index, and the component preflight scanned nothing when a template root was missing. Each
one now refuses to report a pass when it did no work, or fails loudly with the path.

**Two real faults.** The short share route /b/toString returned Object.prototype.toString and threw a
500 through a plain object lookup; it now uses a validated null-prototype map and Object.hasOwn. The
desk's SSE stream was being closed by Bun's 10 second idle timeout, so the browser reconnected every
ten seconds and a push in the gap had no subscriber; the server now allows 120 seconds.

**CI is un-red.** The merge of d4badde deployed but failed its end-to-end job on the anthill placement
test, which binned ten random placements into a 3x3 box and could collapse them into one on the CI
layout. It now compares the actual pixel position and passed five repeats locally.

**Content and standards agree with themselves again.** The standards index and 38 other links printed
the retired host; FIGURES was described as no mermaid in two places; a plan link pointed into a moved
file; HACKING had an orphan row and no /teaching; SESSION-LOOP used em-dashes; a published whitepaper
carried an editorial to-do and the wrong arXiv title, now verified and corrected; its footer and
build-the-floor's were out of order or missing.

**Small code and test repairs.** PORT validation, a non-null filter, four small text and regex fixes,
dead nest state, two leaked ResizeObservers, the drifted trap click count, a malformed custom-element
close tag, a vacuous feed-order assertion, and the plan and frontmatter fields the schema expects.

## Gate output

```text
$ bun run check
$ tsc --noEmit

$ bun test
 897 pass
 0 fail
 3895 expect() calls
Ran 897 tests across 49 files. [6.92s]

$ bun tools/lint-gate.ts
lint gate: level. 4483 flag(s) total (oxlint + voice-lint), matching or under the 4483 in tools/lint-baseline.json (generated 2026-11-08).

$ bun run lint:links
link-lint: 61 rendered file(s), no dead relative links.

$ bunx playwright test e2e/terminal.e2e.ts e2e/welcome-flagship.e2e.ts e2e/builder-canvas.e2e.ts e2e/wcag.e2e.ts -g "terminal|flagship|builder|light, part 4" --ignore-snapshots --workers=2
 119 passed (2.3m)

$ bunx playwright test e2e/wcag.e2e.ts -g "open Nest" --ignore-snapshots
 2 passed (5.9s)

$ bunx playwright test e2e/terminal.e2e.ts -g "anthill moves between empty cells" --repeat-each=5
 5 passed (17.4s)

$ bun run audit
 427 canonical pages, 427 successful, 0 HTTP failures, 0 pages with a document finding
 JavaScript 32kb-472kb per page, max local load 632ms
```

## What was not done

The full browser suite was not rerun end to end; 119 affected specs plus the Nest scans were. The
deferred items in the audit page are not fixed: the four decompositions, the component table
consolidation, the canvas-dom tests, the export two-way check, the eager game load, the panel type
scale and the 359 KB JS budget. Phone and touch layout for the Nest is still owed.

## What needs human eyes

The decompositions of content.ts, builder-canvas, desk-reasoner and the nest script want plans
rather than patches. The AI session id should become a server-issued cookie if the desk is ever
opened beyond a personal demo. The CONTENT-BACKLOG's 2026-08-19 entry says it was published after a
pass dated 2026-08-20; that chronology is the owner's record and was left for him. The panel's 8 to
12px type and its one literal shadow are design calls, not mechanical fixes.
