---
title: A table of contents for the standards, so an agent loads one section instead of one file
date: 2026-11-17
status: complete
lane: gated
branch: claude/ai-workflow-standards-index
scope: [tools/standards-index.ts, tools/standards-index.test.ts, standards/INDEX.json, package.json, CLAUDE.md, plans/standards-section-index.md, artifacts/runs]
touched:
  - tools/standards-index.ts
  - tools/standards-index.test.ts
  - standards/INDEX.json
  - package.json
  - CLAUDE.md
  - plans/standards-section-index.md
  - artifacts/runs/2026-11-17-standards-section-index.md
diffstat: a 414 line generator and a 242 line test in tools/, a generated 3,159 line index in standards/, one package script, 20 lines in CLAUDE.md, an 89 line plan and this report
unpushed: 0 once the push lands | claude/ai-workflow-standards-index
verifiedBy: 22 new tests (fixtures plus the real folder and a freshness check), the full bun test run, a typecheck, the lint gate, the link lint and hand runs of the toc and read commands
doctor: not run | the PANTRY doctor is not on this cloud machine
consulted:
  - CLAUDE.md
  - VOICE.md
---

The brief was retrieval by reasoning rather than by embedding, which people have started calling
vectorless RAG: give the agent a table of contents, let it pick the branch, and load only that. The
standards were the obvious place to start. Twenty-three files, 374 KB between them, and the two an
agent reaches for most, VOICE and LOOP, are each past six hundred lines. Almost every question a
session brings to one of them lives under a single heading.

## What changed

**A generator.** tools/standards-index.ts reads every real file in standards/ (the AGENTS.md symlink
is skipped, the same way the rendered collection skips it) and writes standards/INDEX.json. Each
standard gets its slug, published URL, the skill it mounts as, its title, summary and when, its lead,
and a tree of H2 sections with their H3 children. Every section carries its anchor, its first and last
line in the file, a one-line summary and the other standards it points at. Each standard also lists
the standards that point back at it.

**Anchors cannot drift from the page.** They come from MILL's slugifyHeading, the function that
stamps the id on a rendered heading, and a test checks every anchor in the real folder against the
heading on the line the index says it starts on.

**A drill-down CLI on the same file.** The JSON is the machine-readable artifact, and 108 KB is still
too much to read whole on every question, so the generator doubles as the reader. The cost of
answering one question about VOICE, measured on this checkout:

| Step | Bytes read |
|---|---|
| toc, one line per standard | 4,487 |
| toc voice, every section with range and summary | 4,667 |
| read voice#the-honesty-clause-non-negotiable | 351 |
| The whole of VOICE.md, the old way | 49,431 |

About 9.5 KB to land on the right section instead of 49 KB to land on the right file, and the gap
widens with every neighbour the agent would otherwise have opened to follow a cross-reference.

**A gate on staleness.** The last test regenerates the index in memory and compares it to the
committed file. A standard edited without running bun run standards:index fails bun test with a
message saying which command to run. That is the standards folder's own rule, that a standard and its
index change in the same commit, made mechanical.

**CLAUDE.md's Start here** now tells the agent to read the tree before the file, with the three
commands, when loading a whole standard is still right, and what a thin summary means.

## Why standards/INDEX.json

The package already exports ./standards/*, which is how PANTRY resolves the standards, so the index
reaches PANTRY with no wiring on either side. It sits next to README.md, the human index it is the
twin of. And the /standards collection harvests only .md, so the file never becomes a page; the link
lint confirms nothing rendered changed. The folder's rule that no code creeps in still holds: the
index is data, and the code that writes it lives in tools/.

## Gate output

```text
$ bun install --frozen-lockfile
Checked 139 installs across 156 packages (no changes) [6.00ms]

$ bun run check
$ tsc --noEmit

$ bun test tools/standards-index.test.ts
 22 pass
 0 fail
 621 expect() calls
Ran 22 tests across 1 file. [28.00ms]

$ bun test
 1007 pass
 1 fail
 5244 expect() calls
Ran 1008 tests across 56 files. [7.92s]
(fail) retrieval scenario evals (real corpus) > "What can the desk assistant do?" grounds on facts [33.53ms]

$ bun tools/lint-gate.ts
lint gate: 2 lint(s) regressed against tools/lint-baseline.json:
  voice:emoji: baseline 73 -> now 94 (+21)
  oxlint:eslint(no-shadow): baseline 0 -> now 3 (+3)
A real increase is fine — rerun `bun run lint:baseline --accept` to accept it deliberately. A surprise
one is a warning worth fixing before it joins the baseline permanently.

$ bun tools/link-lint.ts
link-lint: 72 rendered file(s), no dead relative links.

$ bun tools/standards-index.ts --check
standards/INDEX.json is current
```

**Neither red line is this run's.** With every change of this run stashed, the same retrieval eval
fails and the lint gate reports the same two regressions, voice:emoji at 94 and no-shadow at 3. My
first pass added four oxlint findings in the generator (two Array#sort calls, a needless escape and a
regex where startsWith reads better); all four are fixed, and oxlint on the two new files is clean.
The baseline was not touched.

**What the gates did not cover.** The Playwright suite was not run: nothing here renders, the link
lint confirms no page changed, and the index is invisible to the site. The quality of the summaries is
not tested beyond "present and taken from the right place". Whether an agent actually follows the new
Start here paragraph is a behavior, and nothing here measures it.

## What was not done

- Moving the parser into PANTRY. The PANTRY repo is not attached to this session; the plan lists what
  should move and in what order.
- A line in standards/CLAUDE.md's definition of done naming the index. I drafted it and backed it out,
  because that file renders as a public page and a rendered change owes a screenshot this run could not
  justify. The root CLAUDE.md and the failing test both carry the rule meanwhile.
- The pre-existing retrieval eval failure and the two lint regressions, which belong to earlier work.
- The doctor and the second pass by a session that did not write the change. Neither is available to
  this cloud run.

## What needs human eyes

- The summaries. They are each section's opening sentence, trimmed at 200 characters. Most read well;
  a few that open with a table say only "A table: Rationalization, Reality." Skim
  bun tools/standards-index.ts toc on two or three standards and decide whether extractive is good
  enough or whether a written summary in each standard's frontmatter is worth the upkeep.
- Whether the Start here paragraph is placed and weighted right against the skills paragraph above it,
  since on the owner's machine the skills are mounted and the index is the second route rather than
  the only one.
