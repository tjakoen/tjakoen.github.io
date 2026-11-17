---
title: The freshness check stops calling every skill stale, and CLAUDE.md gives back a thousand characters
date: 2026-11-17
status: complete
lane: gated
branch: claude/ai-workflow-application-eoi1rc
scope:
  - tools/map-freshness.ts
  - tools/map-freshness.test.ts
  - plans/stale-map-check.md
  - docs/HARNESS-DSH.md
  - CLAUDE.md
touched:
  - tools/map-freshness.ts
  - tools/map-freshness.test.ts
  - plans/stale-map-check.md
  - docs/HARNESS-DSH.md
  - CLAUDE.md
  - artifacts/runs/2026-11-17-freshness-stamp-and-claude-trim.md
plans:
  - stale-map-check
consulted:
  - CLAUDE.md
gates:
  - bun run check
  - bun test
  - bun tools/lint-gate.ts
  - bun tools/voice-lint.ts
---

# What changed

A test run on a synced machine found two problems with the retrieval work merged earlier today.

The freshness check called all 21 mounted skills stale after a one-word edit to one standard. It
compared each standard's text with its skill's text, and the pantry sync rewrites that text on the
way in, so the two never matched. The check now keeps a stamp in the gitignored mount,
.claude/skills/.freshness.json, holding the hash of each standard and of each SKILL.md as last seen
together. A skill is behind when its standard moved and its SKILL.md did not. A changed SKILL.md means
a sync ran, and the stamp moves forward.

The doctor reported the instructions at 21k characters of a 20k budget. The "Read the tree before the
file" section in CLAUDE.md went from a paragraph, a code block and a second paragraph to five lines;
the usage it dropped already lives in the header of tools/standards-index.ts. CLAUDE.md went from
10,115 to 9,153 characters.

# Gates, verbatim

```
$ bun run check
$ tsc --noEmit

$ bun test tools/map-freshness.test.ts
 11 pass
 0 fail

$ bun test
(fail) retrieval scenario evals (real corpus) > "What can the desk assistant do?" grounds on facts
 1026 pass
 1 fail
Ran 1027 tests across 58 files.

$ bun tools/lint-gate.ts
lint gate: 2 lint(s) regressed against tools/lint-baseline.json:
  voice:emoji: baseline 73 -> now 94 (+21)
  oxlint:eslint(no-shadow): baseline 0 -> now 3 (+3)
```

The failing eval and both lint regressions are identical on origin/main before this change. Voice-lint
counts on CLAUDE.md, the plan and HARNESS-DSH are unchanged from main (34, 0, 0).

# Not done

- Playwright was not run; nothing here renders.
- The fix was tested against synthetic mounts only. This cloud checkout has no synced skills.
- A machine already behind on its first look gets baselined as fresh; only the next edit is caught.
- The instructions budget counts the global file too, so 960 fewer characters here may not bring the
  total under 20k on its own.

# Needs human eyes

On the synced machine: run the freshness check once (it baselines), edit one standard, run it again.
It should name that one skill and no other. Then run the skills sync and check the warning clears.
