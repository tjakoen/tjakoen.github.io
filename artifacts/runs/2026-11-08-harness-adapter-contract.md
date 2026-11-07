---
title: The adapter contract, and the first case it caught
date: 2026-11-08
status: complete
lane: gated
branch: main
scope:
  - standards/HOOKS.md
  - standards/LOOP.md
  - standards/README.md
  - artifacts/reviews/
  - .claude/skills/
touched:
  - standards/HOOKS.md
  - standards/LOOP.md
  - standards/README.md
  - artifacts/reviews/2026-11-08-review-harness-adapter/01-hooks-adapter-contract.png
  - artifacts/reviews/2026-11-08-review-harness-adapter/02-hooks-case-list.png
  - .claude/skills/hooks/SKILL.md | gitignored, regenerated
  - .claude/skills/loop-standard/SKILL.md | gitignored, regenerated
skills:
  - loop-standard
  - hooks
gates:
  - bun run check | clean, no output
  - bun test | 875 pass, 0 fail, 3772 expect() calls, 48 files
  - bun run lint:links | 60 rendered files, no dead relative links
  - bun tools/voice-lint.ts on the three changed files | 65 flags before, 65 after
  - bun cli.ts skills sync (pantry) | 19 skills mounted, 3 written, 0 pruned
  - GET /standards/hooks | 200, the new section and the case list in the HTML
  - GET /standards | 200, the changed index row renders
diffstat: 5 files changed, 96 insertions(+), 10 deletions(-) across three standards and two screenshots
dirty:
  - CLAUDE.md | another session's uncommitted work, left alone
  - docs/CONTENT-BACKLOG.md | another session's uncommitted work, left alone
  - docs/HARNESS-DSH.md | another session's uncommitted work, left alone
  - content/notes/one-loop-three-harnesses.md | another session's untracked draft, left alone
unpushed: 2 | push is owner-gated
verifiedBy: not yet by a second session
doctor: 23 checks, 0 failing, 2 due; the graph merge and the context budget, both carried by name
---

# Run report: one contract, three harnesses

## What was asked

Take what was useful from HKUDS's AgentPilot, credit it, and use it if it improves the workflow. The
useful part of that project is not the policy model. It is that a coding host is treated as a worker
behind a declared adapter contract, with a registry of where each host keeps its skills and an
installer per host rather than a second copy of the rules.

## What was done

A new section 4c in [HOOKS.md](/Users/tjakoenstolk/Local/Development/bread-repos/tjakoen.github.io/standards/HOOKS.md),
between the output gates and the limits. It states six signals a harness has to be able to give,
each tied to the rule it carries: start of session, before a write, before a spawn, after a tool
call, end of turn, session identity. Then ten conformance cases, each an action and the observation
that decides it, run against every adapter when the adapter changes.

Three supporting edits. The section names the shape's source and says plainly that none of its
software runs here. The index row and the frontmatter now describe the adapter contract rather than
three hooks. LOOP section 4b points at 4c where it says a lane the harness enforces beats a lane the
run remembers.

The standards were regenerated into the skills mount: 19 skills, 3 written.

## The case list found a hole on its first run

This is the part worth the reading. LOOP section 4b's printed path list carries `**/*payment*`. The
shell guard implements that as a last-segment match, so a file under a payments directory is not
caught. The DSH guard carries an extra `payments` directory rule and catches it. Probed with the same
payload, on 2026-11-08:

```
shell guard, /tmp/estate/payments/charge.ts   -> exit 0, allowed
dsh guard,   /tmp/estate/payments/charge.ts   -> blocked: money
shell guard, /tmp/estate/billing/invoice.ts   -> exit 2, blocked
dsh guard,   /tmp/estate/billing/invoice.ts   -> blocked: money
```

The counts are seventeen path rules plus the package.json special case in the shell guard, and
twenty in the DSH guard. Three differ, and only the payments one is a rule about the estate. The
other two protect the DSH guard's own source and its composition, which is correct and which the
section now requires an adapter to declare.

## Gate output, verbatim

```
$ bun run check
$ tsc --noEmit
```

```
$ bun test
 875 pass
 0 fail
 3772 expect() calls
Ran 875 tests across 48 files. [9.23s]
```

```
$ bun run lint:links
link-lint: 60 rendered file(s), no dead relative links.
```

```
$ bun tools/voice-lint.ts standards/LOOP.md standards/HOOKS.md standards/README.md
HEAD: 65 flag(s)   NOW: 65 flag(s)
```

```
$ bun cli.ts skills sync ../tjakoen.github.io   # from the pantry repo
19 skills mounted, 3 written, 0 pruned
```

```
$ GET /standards/hooks   -> 200, "adapter contract", "seventeen path rules", "ten-case conformance"
$ GET /standards         -> 200, the changed row renders
```

## What the gates did not cover

Two of the ten cases were run, on two of the three adapters. Cases 3 and 4, the write inside the
lane and the write outside it, against the Claude shell guard and the DSH guard. Case 4 on the shell
guard is what passed a docs page; case 3 is what blocked billing. The other eight cases are prose.
Nothing here proves the Codex adapter at all, and nothing proves the spawn, the end gate, or the two
session attribution cases on any adapter.

The standard itself is not machine-checked either. Nothing reads HOOKS section 4c and fails when a
harness drifts. The case list is only as good as the person running it, which is why it says to file
a run report: the date is the evidence, not the list.

## What was not done

- The shell guard fix. `[^/]*payment[^/]*$` should also catch a path segment under `payments/`, the
  way the DSH guard already does. That file is in the private tools repo, outside this workspace, so
  it is named here rather than patched. It is a two-line change to a regex and a test case.
- The other eight conformance cases, and the Codex column, on any adapter.
- No second pass by a session that did not write this.
- The two unpushed commits.
- The branch moved under this run. Another session merged its own pull request and checked out
  codex/nest-polish while this work was in progress, so the earlier standards commits from this
  session sit on codex/nest-terminal-controls, whose pull request has already merged without them.
  They are preserved on a local branch, standards/loop-additions-2026-11-08, and which line should
  carry all three commits is the owner's call rather than a rebase taken here.

## What needs human eyes

- Whether the finding above should be fixed now in the private tools repo, and whether the case list
  should live beside the guards as a runnable test rather than as prose in a standard. The second
  one is the stronger idea and the larger one.
- Whether six signals is the right number, or whether session identity is a harness capability the
  contract cannot ask for everywhere.
- The two screenshots in [the review folder](/Users/tjakoenstolk/Local/Development/bread-repos/tjakoen.github.io/artifacts/reviews/2026-11-08-review-harness-adapter/01-hooks-adapter-contract.png).
