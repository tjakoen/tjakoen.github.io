---
title: Run reports name what they read
date: 2026-11-17
status: complete
lane: gated
branch: claude/ai-workflow-retrieval-trace
scope:
  - artifacts/runs/README.md
  - standards/LOOP.md
  - standards/SESSION-LOOP.md
  - tools/run-report-lint.ts
  - tools/run-report-lint.test.ts
  - package.json
touched:
  - plans/run-report-retrieval-trace.md
  - artifacts/runs/README.md
  - artifacts/runs/2026-11-17-retrieval-trace.md
  - standards/LOOP.md
  - standards/SESSION-LOOP.md
  - tools/run-report-lint.ts
  - tools/run-report-lint.test.ts
  - tools/dream.ts
  - package.json
plans:
  - run-report-retrieval-trace
consulted:
  - CLAUDE.md
  - LOOP.md#a-the-run-ledger-evidence-or-it-didnt-happen
  - LOOP.md#8-red-flags
  - LOOP.md#9-verification-before-a-session-is-called-done
  - SESSION-LOOP.md#1-session-start-orient-before-you-touch-anything
  - SESSION-LOOP.md#5-handoff-end-a-session-so-the-next-one-starts-cold-but-oriented
  - VOICE.md#punctuation-formatting-conventions
  - VOICE.md#register-by-surface
gates:
  - bun run check
  - bun test
  - bun tools/lint-gate.ts
  - bun tools/run-report-lint.ts
  - bun tools/voice-lint.ts on the new prose
  - bun tools/link-lint.ts
  - bunx playwright test --ignore-snapshots
diffstat: a new 168-line lint with a 110-line test, a new 80-line README for the run ledger, ten lines across LOOP and SESSION-LOOP, two lines in the dream tool, one script, a plan and this report.
unpushed: 0
verifiedBy: The lint runs green over all 80 reports, this one included, and its test fails an anchor that matches no heading. The LOOP section 4a bullet, the LOOP section 9 checkbox and the SESSION-LOOP section 1 sentence were rendered on a local server at 1280px and screenshotted in the session.
doctor: not run. PANTRY is not in this cloud checkout, so bun ../pantry/cli.ts doctor has nothing to call.
---

# Run reports name what they read

A run report now carries a consulted list: the standard sections, skills and graph queries the run
opened before it wrote, one line each. An entry for a section takes the form VOICE.md#register-by-surface,
where the slug comes from MILL's slugifyHeading, the function that stamps the id on the rendered
heading. So every entry is also a deep link to the published page, and it should line up with the
section anchors in the standards index a sibling session is building.

The rule lives in LOOP section 4a as a fifth bullet, with a checkbox in section 9 and a red flag in
section 8. SESSION-LOOP section 1 says to keep the list while reading, since it is hard to rebuild at
the end. The shape of the whole frontmatter, which had no written home until now, is in
artifacts/runs/README.md.

bun run lint:runs checks every report. It fails on an entry of the wrong shape, a standard that does
not exist, or an anchor that matches no ## or ### heading. Reports dated 2026-11-17 or later must
carry the field; the 79 earlier ones are grandfathered. The written word none is an accepted answer and
an empty list is not.

## What this run consulted, and what it did not

The list above is what this run actually opened. Two things are missing from it, and both are honest
absences rather than oversights. No skill entries: the standards are not mounted as skills in this
cloud container, so they were read from standards/ directly. No graph entries: graphify is not
installed here, so discovery ran on grep, which the field has no shape for.

That second gap is worth a decision. A grep sweep is retrieval too, and leaving it out means the list
undercounts what a run without the graph did. The field stays at three shapes for now, because a grep
log is exactly the play-by-play the brief said to avoid.

## Gate output

```
$ bun run check
$ tsc --noEmit
(no output, exit 0)

$ bun test
 993 pass
 1 fail
 4647 expect() calls
Ran 994 tests across 56 files. [7.63s]

(fail) retrieval scenario evals (real corpus) > "What can the desk assistant do?" grounds on facts
Expected: "grounded"
Received: "got [/grain/docs/design-system, /notes/show-them-the-board, /grain/docs/grain]"

$ bun test tools/run-report-lint.test.ts
 8 pass
 0 fail
 24 expect() calls

$ bun tools/lint-gate.ts
lint gate: 2 lint(s) regressed against tools/lint-baseline.json:
  voice:emoji: baseline 73 -> now 94 (+21)
  oxlint:eslint(no-shadow): baseline 0 -> now 3 (+3)

$ bun tools/run-report-lint.ts
run-report-lint: 80 reports, 1 with a consulted list, 0 problems

$ bun tools/voice-lint.ts artifacts/runs/README.md plans/run-report-retrieval-trace.md
voice-lint: 0 flag(s) across 2 file(s) (0 tell, 0 warn).

$ bun tools/link-lint.ts
link-lint: 72 rendered file(s), no dead relative links.

$ bunx playwright test --ignore-snapshots   (through a throwaway config naming /opt/pw-browsers/chromium)
  1) e2e/builder-canvas.e2e.ts:1582:3 › the preview route › the switch shows the markup without fetching anything
    Error: expect(received).toBe(expected) // Object.is equality
    Expected: 0
    Received: 7
  2) e2e/portfolio-canonical-routes.e2e.ts:54:3 › sitemap canonical routes › a browser without inline PDF support can open the deck from its fallback
    Error: expect(locator).toBeVisible() failed
    Expected: visible
    Received: hidden
  2 failed
  618 passed (20.5m)

$ the two failures rerun alone, on this branch and on the base commit f62bca1
  this branch: 2 failed (Received: 15; Received: hidden)
  f62bca1:     2 failed (Received: 15; Received: hidden)
```

The bun test failure, both lint-gate regressions and both Playwright failures predate this run. The
two Playwright tests fail the same way on the base commit, rerun in isolation, so they are not flakes. With every file this run touched
moved aside, the clean HEAD gives the same retrieval-evals failure and the same two regressions. They
are carried forward, not fixed here.

What the gates did not cover. The lint proves an entry points at a real section, never that the run
read it, and a tidy list written after the fact passes. It does not check skill names against the
mounted skills, because those are gitignored and absent in CI. It does not know the INDEX.json the
sibling session is building; the two agree only if that index also slugs with MILL's slugifyHeading.

## What was not done

- PANTRY's runs view does not read consulted yet. Older reports carry a skills field that it does
  read; the README tells new reports to put skill names in consulted instead. Teaching PANTRY the
  new field is bounded work in a sibling repo, so per SESSION-LOOP section 5 it belongs to its own
  session.
- The lint is not wired into CI or the lint gate. It runs as bun run lint:runs and inside bun test
  through its real-tree test, which already fails CI on a dangling anchor.
- No second pass by a session that did not write the change.
- Doctor not run, as above.

## What needs human eyes

- Whether consulted should replace skills in PANTRY outright, or both stay.
- Whether a fourth shape for grep or file reads is wanted, or three is the right size.
- The cutoff date of 2026-11-17 is hard-coded in the lint as CONSULTED_SINCE.
- Once the sibling INDEX.json lands, a cross-check that its anchors match headingAnchors would close
  the one place the two could drift.
