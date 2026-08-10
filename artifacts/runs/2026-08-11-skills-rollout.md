---
title: The standards mount in all seven repos, and the blocker was never real
date: 2026-08-11
status: complete
lane: gated
branch: main
scope:
  - plans/skills-runtime.md
  - plans/decisions/answers.jsonl
  - artifacts/runs/
  - ../pantry/package.json
  - ../pantry/bun.lock
touched:
  - plans/skills-runtime.md
  - plans/decisions/answers.jsonl
  - artifacts/runs/2026-08-11-skills-rollout.md
  - ../pantry/package.json
  - ../pantry/bun.lock
skills:
  - decisions
plans:
  - skills-runtime S2 rollout | /docs/plans/skills-runtime
gates:
  - bun test (pantry, after the pin bump) | 611 pass, 0 fail
  - bunx tsc --noEmit (pantry) | clean
  - pantry skills list, all 7 repos | 16 in canon, 0 stale, 0 shadowed each
  - git status, all 5 newly mounted repos | 0 dirty, the self-gitignoring mount holds
  - harness skill listing | the 5 newly written canon-home skills appeared live, including decisions
diffstat: 2 files changed, 7 insertions(+), 5 deletions(-) in pantry; 3 files changed in the portfolio
dirty:
unpushed: 4 | portfolio 2, pantry 2; the push is the owner's call and was deliberately not taken
verifiedBy: not yet, and the rollout's own claim was checked against the harness listing rather than against the files written
doctor: 0 failing, 4 due in pantry; skills-freshness now reads 16 standards mounted and current, where it read pin predates when: keys
---

The standards have been mountable estate-wide since 2026-08-07 and were mounted in exactly one repo.
Now they are in seven: portfolio, pantry, grain, batch, bread, greenroom, project, each reporting
sixteen in canon and none stale.

**The plan's stated blocker was wrong, and it had been carried for four days.** S2 recorded that
every repo but the canon home mounts from its own `tjakoen.github.io` pin, so the rollout waited on a
push plus a `deps:refresh` in each host. That is not how the resolution works. `import.meta.resolve`
runs against the PANTRY module, not against the host, so canon comes out of pantry's own dependency
while the mount lands in the host's `.claude/skills`. One pin has ever mattered, and it was pantry's.
Five repos needed no dependency, no config and no code.

This was checked rather than assumed, and the reason for checking is S2's own finding: a written file
is not a live skill. The same discipline says an assumed blocker is not a measured one. Running the
list command from a sibling checkout in grain answered it in one call, before anything was built.

**The canon home was the worst-off repo in the estate.** Four standards stale and one never mounted
at all: `DECISIONS.md`, canon since 2026-08-10, had no mount, which is why nothing has ever
auto-fired on decision-shaped work. The session that wrote a decision request for the thresholds
earlier today read the standard as a file, because the skill it should have fired did not exist. It
appeared in the harness listing the moment it was written.

**What the owner's call turned out to be worth.** The question raised was how five repos with no
portfolio dependency should resolve canon, and the answer chosen was a sibling-checkout fallback with
a `standardsDir` config key. Verification made the key unnecessary: the effect already existed. The
answer is recorded and acked anyway, and the key was not built, on S2's own rule that a config key
with no consumer is speculative surface. DECISIONS section 3 says a decision that turns out not to
change what gets built should be recorded and moved past rather than defended.

## Gate output

```
$ bun ../pantry/cli.ts skills list          # the canon home, BEFORE
  stale conformance (CONFORMANCE.md)
  none  decisions (DECISIONS.md)
  stale loop-standard (LOOP.md)
  stale session-loop (SESSION-LOOP.md)
  stale tour-standard (TOUR-STANDARD.md)
16 skills in canon, 5 stale or unmounted, 0 shadowed

$ bun ../pantry/cli.ts skills sync          # the canon home
16 skills mounted, 5 written, 0 pruned

$ for r in grain batch bread greenroom project pantry tjakoen.github.io; do pantry skills list; done
grain               16 skills in canon, 0 stale or unmounted, 0 shadowed
batch               16 skills in canon, 0 stale or unmounted, 0 shadowed
bread               16 skills in canon, 0 stale or unmounted, 0 shadowed
greenroom           16 skills in canon, 0 stale or unmounted, 0 shadowed
project             16 skills in canon, 0 stale or unmounted, 0 shadowed
pantry              16 skills in canon, 0 stale or unmounted, 0 shadowed
tjakoen.github.io   16 skills in canon, 0 stale or unmounted, 0 shadowed

$ for r in grain batch bread greenroom project; do git status --porcelain | wc -l; done
grain       0 dirty
batch       0 dirty
bread       0 dirty
greenroom   0 dirty
project     0 dirty

$ bun test                                  # pantry, after the pin bump
 611 pass
 0 fail
Ran 611 tests across 22 files. [4.55s]

$ bun cli.ts doctor | grep "skills mounted" # pantry
[info] skills mounted: 16 standards mounted and current

$ cd bread && bunx pantry skills list       # the caveat, measured
pantry: unknown command "skills"
usage: pantry <serve|check|doctor|deps|init> [dir] [--port N] [--force] [--kit]
```

## What was NOT done

- **This run's scope was declared at close, not before it started, so its clean scope line is not
  evidence of anything.** The sibling report today (pantry's `2026-08-11-loop-hygiene-checks`) carries
  a real growth flag because its scope was written up front and then outgrown. This one names the full
  envelope because it was written knowing the answer, which makes the comparison worthless in this
  direction. Worth saying rather than banking a green line: the check measures prediction, and there
  was no prediction here.
- **The `standardsDir` config key was not built**, though it was the option chosen. Verification
  showed it would have had no consumer. Recorded in the answer log with that reason rather than
  quietly dropped.
- **No repo's own installed pantry was updated.** Only bread installs `@tjakoen/pantry`, and that copy
  predates S2 so completely that it has no `skills` command. Every mount here came from the sibling
  checkout, which is the workflow in use and not a claim about a fresh clone elsewhere.
- **Layer pins left alone in pantry.** Doctor reports grain, mill and proof behind. That is a separate
  chore with its own blast radius and it does not belong inside a docs rollout.
- **No push.** Four commits across two repos now.
- **Nothing was verified about whether the newly mounted skills FIRE in those repos.** Mounting is
  what was done. Firing is a per-repo observation that only real work in those repos can produce.

## What needs human eyes

- **Whether DECISIONS firing changes anything.** It has been canon for a day and mountable for none of
  it. The next session that has to ask something is the first real test, and the interesting outcome
  is the negative one: if it still does not fire on decision-shaped work, the `when:` text is the
  suspect, not the mount.
- **bread's installed pantry.** It is old enough to lack a command that shipped four days ago. Either
  it gets refreshed from the git remote after pantry is pushed, or bread should use the sibling
  checkout like everything else and stop carrying the dependency.
- **The second pass.** Same session wrote and checked this. The claim most worth attacking is the
  resolution finding, since it contradicts four days of plan text: the test is to run the list command
  from a repo with no portfolio dependency and read which canon path it prints.
