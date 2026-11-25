---
status: complete
consulted: [AUDIT-STANDARD.md, LOOP.md#9-verification-before-a-session-is-called-done, SESSION-LOOP.md#8-a-session-wears-the-name-of-its-work, VOICE.md, HOOKS.md#4c-the-adapter-contract-one-set-of-rules-four-harnesses, skill:audit-standard, skill:voice, skill:brief]
plan: plans/chat-2026-11-25-df0690e8.md
verifiedBy: >
  portfolio: 1065 tests pass across 66 files, tsc exits 0, the lint gate reads 4498 flags against a
  baseline of 4528, link-lint finds no dead relative links across 92 rendered files, run-report-lint
  reports 0 problems, every served diagram is named and has its SVG, and the standards index is
  current at 31 standards and 279 sections. The new token gate was proven to fail on a scratch
  stylesheet naming --space-7 and --leading-snug, then the scratch file was removed. The badge page
  and the about page were read on a fresh server at localhost:3100.
  agent-config: 1059 pass, 8 fail, all eight from the MacBook Pro's stale committed snapshot.
unpushed: 0 | both commits are on origin/main
doctor: >
  The session-start checklist reported Agentic Loop Loaded with warns for the instruction budget, four
  stale mounted skills, a stale graph and a dirty tree. The two freshness warns were cleared this
  pass; the budget warn is finding S14 and stays open. pantry_doctor reports 26 checks, 0 failing, 3 due.
touched:
  - tools/token-vocabulary.test.ts
  - src/badge-page.ts
  - view/components/organisms/portfolio-frame/portfolio-frame.css
  - view/components/pages/about/about.css
  - view/components/pages/builder/builder.css
  - view/components/pages/projects/projects.css
  - view/components/pages/talk/talk.css
  - standards/HOOKS.md
  - standards/INDEX.json
  - docs/AUDIT-2026-11-25.md
  - plans/chat-2026-11-25-df0690e8.md
---

# The estate audit, second pass: ten undefined tokens and the gate that finds them

Asked in chat on 2026-11-25 for a full estate audit of the loop, the harness configuration, the
portfolio, the standards, the notes, the code and the design system's use.

## What happened

- An estate audit had already been written that morning and its mechanical fixes committed. This pass
  re-ran every gate, checked those fixes against the code, and found that two of them were incomplete
  and one changed nothing.
- The five-auditor fan-out died on the Go plan's five-hour limit for the second audit running. The
  scopes it was to read stay uncovered, and both reports say so rather than claiming the pass.
- The design-token scan was rebuilt around definitions instead of suspected names. Ten more undefined
  references fell out, including two that silently dropped a line height and a font weight.
- The class now has a gate: `tools/token-vocabulary.test.ts`, the portfolio's copy of GRAIN's
  `vars-defined` test. It was proven to fail before it was trusted.
- Two standards defects left by the morning's fix were closed: section 4c still counted three
  harnesses while listing four, and its new paragraph carried a backtick the voice lint counts.

## What is not done

- The five uncovered scopes: GRAIN's own code, PANTRY and BATCH, BREAD and greenroom and project, the
  portfolio's validation and test dimensions, and the notes as prose.
- The two missing social cards, the instruction-budget definition, the two oversized files and the
  three escapers, each deferred with its reason in the report.
- The non-private-model clearance question, which has now killed the fan-out twice.
