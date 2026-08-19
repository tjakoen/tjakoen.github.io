---
title: Two sessions' finished work committed and pushed, four packages published, and the three tests that caught up afterwards
date: 2026-08-19
status: complete
lane: gated
branch: main
skills:
  - loop-standard
  - voice
  - note-standard
scope:
  - content/notes/
  - view/pages/talks/
  - view/components/molecules/live-figure/
  - scripts/
  - standards/
  - docs/
  - tools/
  - e2e/
  - package.json
  - bun.lock
  - grain/packages/
  - claude-config memory for this project
scopeGrowth: none. The envelope this run was given was stated in prose rather than in paths: the
  uncommitted work of two idle sessions in the portfolio and in grain, the npm release of the four
  stack packages, and the portfolio's dependency bump onto them. The path list above is that same
  envelope written so the ledger can measure it, added on 2026-08-19. Every path in it was reached
  by finishing one of those three things.
touched:
  - content/notes/build-the-floor.md
  - view/pages/talks/build-the-floor.html
  - view/pages/talks/index.html
  - scripts/figure-floor.js
  - scripts/talk-floor.js
  - scripts/figures.js
  - view/components/molecules/live-figure/live-figure.css
  - standards/VOICE.md
  - standards/NOTE-STANDARD.md
  - docs/CONTENT-BACKLOG.md
  - tools/lint-baseline.json
  - package.json
  - bun.lock
  - e2e/crumb-prompt-and-prefill.e2e.ts
  - grain/packages/mill/diagrams/ and its wiring
  - grain/packages/grain/components/molecules/readiness/
  - grain/packages/{grain,mill,crumb,proof}/package.json
  - claude-config memory for this project
plans: none claimed. This was a cleanup pass over other sessions' finished work, then a release, then
  the test fixes that release exposed.
gates:
  - "bun run check (portfolio, clean worktree at HEAD) | $ tsc --noEmit, no output, exit 0"
  - "bun test (portfolio, clean worktree at HEAD) | 592 pass, 0 fail, 2028 expect() calls, 36 files"
  - "bun run lint:links | link-lint: 53 rendered file(s), no dead relative links."
  - "bun tools/lint-gate.ts (clean worktree at HEAD) | voice:backtick: baseline 3071 -> now 3075 (+4).
    NOT this run's: traced to 410f34e, a concurrent session's commit. Level at both of this run's
    own commits, 36e13c5 and e2ff70d."
  - "bunx playwright test --ignore-snapshots (clean worktree at e2ff70d, before the fix) | 4 failed,
    283 passed, 1 skipped"
  - "bunx playwright test --ignore-snapshots (same worktree, after the fix) | 284 passed, 1 skipped,
    3 failed under full parallel load"
  - "bunx playwright test (those 3, --workers=1) | 3 passed (14.1s). Flake, not regression."
  - "CI on 128c731 | typecheck, tests, lint count 16s pass; end to end 5m26s pass"
  - "bun run check (grain, all five packages) | Exited with code 0, five times"
  - "bun test (grain) | 663 pass, 0 fail, 1902 expect() calls, 68 files"
  - "npm view, after publish | grain 0.1.23, mill 0.3.0, crumb 0.1.10, proof 0.1.4"
  - "bun ../pantry/cli.ts doctor . | 21 checks, 0 failing, 4 due"
diffstat: two repos. Portfolio 15 files across 8 commits, roughly 2,200 insertions, most of it the
  note and the deck. Grain 25 files across 3 commits, roughly 1,260 insertions.
unpushed: 0 | all 8 portfolio and 3 grain commits from this run are on origin/main. The 1 commit
  ahead of origin at close belonged to the Site builder P4 session, and it has since been pushed too.
verifiedBy: the 2026-08-19 consolidation session, which did not write this report. It re-measured the
  closing claim by an independent route rather than re-reading the account: all six BREAD repos read
  ahead=0 and clean, CI and the Pages deploy are green on 8ad8a88, and npm returns grain 0.1.23,
  crumb 0.1.10 and proof 0.1.4. Mill has since moved past this run's 0.3.0 to 0.4.0.
doctor: 21 checks, 0 failing, 4 due. Cold-start context carried by name with the owner's consent.
  Graphify freshness was cleared during the run and re-staled by concurrent edits. Layer pins and the
  run-ledger row both belong to sibling sessions and are named below.
---

# Two sessions' finished work committed and pushed, four packages published, and the three tests that caught up afterwards

Two sessions had finished work and never closed it out. The portfolio held an AI adoption note, its
twenty-seven slide deck, five live figures and the standards edits the note forced, idle for eleven
hours. Grain held the mermaid to SVG renderer for MILL and a readiness molecule, idle for three days
with its own PLAN.md already marked built. Both passed every gate when checked. Nothing was wrong
with the work, only with the ending, which is the section 8 case rather than a quality problem.

## The red gate belonged to nobody in the tree

The lint baseline had been failing since 2026-08-18. Measured against a clean tree at HEAD, so the
ninety-one backtick increase was already committed and no working tree caused it. It came from the
public audit reports, mostly the public audit doc added in f1f6768. Every session opening
after that inherited a failing gate it did not break, which is exactly how a gate gets rationalized
and then muted. Accepted deliberately, with the per-commit attribution written into the message.

The same trap fired again later in the run from the other direction. At close the gate reads four
over its baseline, and that four traces to 410f34e, a concurrent session's commit. This run's own
two commits in that window, 36e13c5 and e2ff70d, both leave the gate level. **If a baseline is red,
find out whether HEAD alone is red before believing the working tree did it.**

## Three defects the shipping sessions did not catch

The talks index claimed twenty-six slides against a deck that runs twenty-seven. The note had no
deck frontmatter, so nothing linked the deck it shipped alongside. And the note carried
a draft status while nothing in the render path reads that field, so it was already listed on
the notes index and would have gone public with the flag still on. The owner chose PUBLISHED. A status
field that no code reads is a safety net that is not there.

## The release, and what the commit log got wrong about it

All four packages had real unpublished changes. Scope was measured by unpacking each published
tarball and diffing it against the local tree, because the commit log and the registry disagree: the
0.1.22 publish went out from a commit later than the one that set the version, so the log listed as
pending several things already on npm. That is how this run found that the form atoms and the
check.set verb had shipped, while two memory files still described them as held.

Mill's floor on grain moved from 0.1.8 up to 0.1.23, because its renderer emits a figure with the
diagram variant and the stylesheet for that variant is what grain ships. Left alone, mill 0.3.0 would
install happily against grain 0.1.22 and a rendered flowchart would spill out of the column instead
of scrolling.

## The release shipped without e2e evidence, and then earned it

CI's browser install step stalled past fifteen minutes and the job was cancelled by a concurrent
push, so the dependency bump went out with the fast gate green and the end to end job never run.
Running the suite from a clean worktree at the pushed commit found four failures. Three were real
and all came from crumb 0.1.10: the composed prompt card now ships collapsed inside a details
element, an owner's call from 2026-08-11, and the version guard was written as an equality against
0.1.9, so a routine upgrade reported itself as a broken feature. The fourth was the local model being
timing sensitive under parallel load; it passes serially every time.

None of this needed the released packages touched. The behaviour change was intended and the tests
were stale. CI on the fix commit is green, end to end included, in five and a half minutes.

## Gate output

```
NOT A PASTE. Reconstructed 2026-08-19 by a later session. The original terminal output was not
kept, so every number below is copied from this report's own gates: list and from nowhere else.
Nothing here was re-run to produce this block.

portfolio, clean worktree at HEAD
  $ bun run check          tsc --noEmit, no output, exit 0
  $ bun test               592 pass, 0 fail, 2028 expect() calls, 36 files
  $ bun run lint:links     53 rendered file(s), no dead relative links.
  $ bun tools/lint-gate.ts voice:backtick: baseline 3071 -> now 3075 (+4)
                           not this run's: traced to 410f34e, a concurrent session's commit

end to end, clean worktree at e2ff70d
  before the fix     4 failed, 283 passed, 1 skipped
  after the fix      284 passed, 1 skipped, 3 failed under full parallel load
  those 3, --workers=1   3 passed (14.1s)

CI on 128c731
  typecheck, tests, lint count   16s pass
  end to end                     5m26s pass

grain
  $ bun run check    exit 0, five times, one per package
  $ bun test         663 pass, 0 fail, 1902 expect() calls, 68 files
  $ npm view         grain 0.1.23, mill 0.3.0, crumb 0.1.10, proof 0.1.4

$ bun ../pantry/cli.ts doctor .
  21 checks, 0 failing, 4 due
```

## What was not done

- **The mermaid renderer is not wired into this site.** That is a deliberate non-goal in mill's own
  plan, so a mermaid fence here still renders as an ordinary code block. A sibling session is now
  working on exactly this.
- **No CRUMB dev tour was written for the note or the deck.** Both were shown as screenshots, local
  and live, which is what the repo's own rule asks for. LOOP's stricter reading would want a tour.
- **The four backtick regression at HEAD was not accepted.** It is a concurrent session's and
  accepting a baseline is an act for whoever caused it.
- **The visual baseline specs were not run.** CI ignores snapshots and this run followed it. A concurrent session reports three of them failing at HEAD.

## What needs human eyes

- **Proof 0.1.4 pulls batch from a GitHub commit** rather than from npm, pinned to d13d361 and
  added 2026-08-09 in 1976987, first published here. Installing proof from npm now clones a repo
  where 0.1.3 did not. Nobody decided that at release time; it rode along, and it is published.
- **Mill 0.4.0 exists in the grain workspace and is not on npm.** The doctor's layer-pins row compares
  this site's pin against it and reads as behind. That belongs to the Mermaid cache gate session.
- **Three sibling sessions were live in this tree throughout.** Every commit here was made by
  pathspec for that reason. One commit was made into a verification worktree on a detached HEAD by
  mistake and redone in the repo; nothing was lost, but it is the failure mode a shared tree invites.
