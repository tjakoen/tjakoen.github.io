---
title: Portfolio AI disclosure
date: 2026-11-11
status: complete
lane: direct
branch: main
scope:
  - view/pages/ai-disclosure.html
  - view/pages/about.html
  - view/pages/teaching/index.html
  - content/notes/why-i-teach.md
  - docs/HACKING.md
  - content/tours/review-ai-disclosure.md
  - artifacts/runs/2026-11-11-ai-disclosure.md
gates:
  - bun install --frozen-lockfile
  - bun run check
  - bun test
  - bun tools/lint-gate.ts
  - bun run lint:links
  - bunx playwright install chromium
  - bunx playwright test --ignore-snapshots
  - bun node_modules/.bin/crumb check content/tours
diffstat: A 38-line page and a 25-line tour, one link added to About, one paragraph revised in Teaching, one route map entry, and this report.
unpushed: 0
verifiedBy: An independent agent checked the teaching claims against the portfolio, the rendered route and sitemap, and the three tour addresses. Its findings narrowed the privacy statement and made the disclosure commitment prospective.
---

# Portfolio AI disclosure

The new page describes how AI contributes to projects, writing, and teaching. The About profile and the AI section of Teaching link to it. The page credits Codex for researching, drafting, and implementing the disclosure itself.

Jared Cunha’s personal disclosure supplied the example of a standing page. Kari D. Weaver’s AID Framework supplied the emphasis on describing what a tool did. CU Boulder’s teaching guidance supplied the prompt to tell students how their instructor uses AI. The portfolio’s own grading console note and Flutter badge ground the teaching examples.

## Gate output

```text
bun install v1.3.14 (0d9b296a)
Checked 139 installs across 156 packages (no changes) [98.00ms]
$ tsc --noEmit
 979 pass
 0 fail
 4286 expect() calls
Ran 979 tests across 53 files. [11.63s]
lint gate: level. 4375 flag(s) total (oxlint + voice-lint), matching or under the 4528 in tools/lint-baseline.json (generated 2026-11-09).
voice-lint: 0 flag(s) across 1 file(s) (0 tell, 0 warn).
link-lint: 66 rendered file(s), no dead relative links.
✓ review-ai-disclosure — 3 step(s), dev
  15 passed (1.1m)
```

The last line is the final targeted Playwright run for About, including its macOS screenshot comparison. The first broad run caught the link changing the exact tagline text. The final link sits in the profile actions. The browser check followed About and Teaching into the disclosure, opened the three CRUMB steps, and confirmed the page fit its content pane at 390 pixels. The site sitemap includes the new route. The links gate counts relative links in its configured rendered files, and the browser and HTTP checks separately covered the new page’s links.

The full browser run stopped after 11.8 minutes. The About failure was from the earlier markup and passed in the final targeted run. The other ten failures were in Calendar, Desk actions, Desk contact prefill, Desk theme switching, developer-docs entry points, and GRAIN. Those failures were not diagnosed in this change.

```text
  11 failed
  261 did not run
  333 passed (11.8m)
```

An earlier combined About and visual run was interrupted with the Catalog snapshot still pending. Welcome, GRAIN, About, Résumé, and Notes differed from their baselines in that run. The final About snapshot passed after the link moved to the existing action row.

```text
  5 failed
  1 did not run
  26 passed (9.0m)
```

The code graph query returned 256 tokens of context against an estimated 9,487 for direct exploration. The route and source locations were confirmed in the repository.

## What was not done

The six files in scope are left uncommitted for review. The public site has not been published. No unrelated tests, snapshots, or pre-existing working changes were edited. No PANTRY plan was claimed because this was a direct request.

## What needs human eyes

The per-piece disclosure commitment is proposed policy. Read it and the grading paragraph before publishing under your name.

## Follow-up on the classroom rule

Tjakoen confirmed that students document AI use across all activities. The disclosure and Teaching page now say so. The disclosure links straight to the classroom rules in *Why I Teach*, where the note explains what students report and how their account is checked against their commits. The note retains its rules for which tools students can use. An independent review caught the first draft broadening the major-activity rule, so that wording was restored before the final checks.

```text
 13 pass
 0 fail
 1196 expect() calls
Ran 13 tests across 1 file. [2.47s]
voice-lint: 0 flag(s) across 2 file(s) (0 tell, 0 warn).
link-lint: 66 rendered file(s), no dead relative links.
✓ review-ai-disclosure — 5 step(s), dev
Rendered HTML checks passed for disclosure, teaching note and anchor, Teaching card, and Flutter badge.
Phone-width browser check passed: disclosure, classroom-rule deep link, exam rule, Teaching card, and Flutter badge.
```

The focused browser check also captured the revised disclosure at 390 pixels. These checks cover the classroom copy and links. The full browser results above belong to the original run.

[Open the local review tour](http://localhost:3170/ai-disclosure?crumb=review-ai-disclosure&crumb-mode=dev&crumb-frame)
