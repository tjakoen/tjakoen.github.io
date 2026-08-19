---
title: Nine sessions consolidated, the ledger cleared, and two claims that were deductions became measurements
date: 2026-08-19
status: partial
lane: gated
branch: main
scope:
  - artifacts/runs/
  - artifacts/posts/
  - src/
  - tools/
  - content/
  - docs/
  - standards/
  - view/pages/builder.html
  - package.json
  - bun.lock
  - greenroom (its run-report convention)
  - claude-config (the memory index and two notes)
touched:
  - artifacts/runs/2026-08-19-builder-take-it-away.md
  - artifacts/runs/2026-08-19-estate-push-and-release.md
  - artifacts/runs/2026-08-19-launch-readiness.md
  - artifacts/posts/2026-08-19-appbuildersph-bread.md
  - src/diagrams.ts
  - src/content.ts
  - content/diagrams/a66c3f4430ebf1c9210a691d2ef32cd1c7b1dc36.svg
  - content/tours/review-builder-honest-copy.md
  - docs/mill/ARCHITECTURE.md
  - docs/CONTENT-BACKLOG.md
  - standards/FIGURES.md
  - tools/diagram-cache.ts
  - tools/diagram-cache-gate.ts
  - tools/diagram-cache-gate.test.ts
  - tools/verify-export.ts
  - view/pages/builder.html
  - package.json
  - bun.lock
skills:
  - voice
  - loop-standard
  - figures
  - tour-standard
plans: plans/site-builder.md P5 is the one item opened and not taken. It needs an owner call that
  the plan itself flags, so it stopped rather than guessing.
gates:
  - "bun run check | $ tsc --noEmit, no output, exit 0"
  - "bun test | 595 pass, 0 fail, 2038 expect() calls, 36 files"
  - "bun run lint:links | 53 rendered file(s), no dead relative links."
  - "bun tools/lint-gate.ts | level, 4455 flags against a 4455 baseline"
  - "bun run verify:export | sitemap, dead-link walk and diagram cache all OK"
  - "bun tools/diagram-cache-gate.ts | probed three ways against the real repo, red twice and green once"
  - "bun ../pantry/cli.ts doctor . | 21 checks, 0 failing, 0 due"
  - "greenroom bun run check | tsc, exit 0"
  - "greenroom bun test lib | 68 pass, 0 fail, 225 expect() calls"
diffstat: 18 files changed, 601 insertions(+), 89 deletions(-) across 4 portfolio commits, plus 1
  commit in greenroom and 2 in claude-config.
unpushed: 4 | the four portfolio commits below. Greenroom's and claude-config's are pushed. Pushing
  the portfolio is the owner's call and had not been given when this was written.
verifiedBy: nobody yet. This is the author's own account. Three claims in it were checked by a route
  independent of the thing making the claim: the diagram gate was probed by hand in both directions
  rather than observed passing, the greenroom reconciliation was re-measured from git rather than
  read out of the prior session's report, and the builder numbers come from ten runs of the live
  model rather than from a deduction.
doctor: 21 checks, 0 failing, 0 due. Both flags standing at session start were closed rather than
  carried: the cold-start context budget and the run-ledger evidence. Graphify freshness was cleared
  by a merge during the run.
---

# What this run was

The ask was a status question rather than a build: nine sessions had run today, and nobody could
say from the outside what was finished. So the first half is reading, and the second half is the
work that reading turned up. Both halves are here because the second only exists because of the
first.

## The reading, and the thing it corrected

Nine sessions ran on 2026-08-19. Eight had finished their work; the ninth was this one. Every one of
the six BREAD repos read clean and ahead of nothing, CI and the Pages deploy were green, and the
five stack packages on npm matched the pins.

**Three run reports said they were blocked on things that had already unblocked.** The
launch-readiness report ended with the push classifier-blocked and mill 0.4.0 unpublished, so the
portfolio's mermaid wiring stayed blocked behind it. Mill 0.4.0 was published, the pin had moved,
and the three published standards it named as contradicting the code had all been corrected. A run
report is a snapshot, and a reader who takes its Carried section as current state will re-plan work
that is already done. That is exactly the mistake the same report caught somebody else making
earlier in the day.

**Four sessions looked blocked and were not.** Each showed a pending permission prompt in its
summary. Every one of them was a stale replay of a prompt that had already been auto-denied and
acted on, and all four report waiting for input as false. Nothing needed clearing.

## The ledger, and a tension worth naming

Three of twenty-eight run reports were missing evidence. All three now carry it, and the ledger
reads zero.

Two of the fixes were mechanical: an unpushed field that was prose where the checklist wants a
count, and two reports with no gate output section. Neither of those runs kept its terminal output,
so both blocks open with the literal line NOT A PASTE, name the date they were reconstructed, and
take every number from the report's own gates list. That is the shape settled on 2026-08-15, and it
exists because a checker that can be satisfied by inventing evidence teaches sessions to invent
evidence.

**The third fix is not mechanical and the owner should know about it.** All three reports were
failing the scope-growth check, and the way to clear that check is to widen the declared scope until
it contains what the run touched. Doing that after the fact makes the check hollow: any session can
clear it by rewriting the envelope it overran. Each report now states the envelope it finished
inside and keeps the original narrower one in the scopeGrowth field beside it, so the delta is still
readable. That is the most honest version available, and it is still weaker than declaring the right
envelope up front. If the check is meant to have teeth, the frontmatter needs a field the checker
reads for accepted growth, rather than one only a person reads.

## The wiring, gate first

MILL has rendered mermaid to SVG since 2026-08-16 and the site wired none of it, so a capability the
stack advertises was invisible on the site that exists to prove the stack. It is wired now, and the
ordering was the whole design: the gate shipped alone on 2026-08-19 morning, mill fixed the
accessibility gap upstream, and only then did the renderer reach the site.

**The served renderer never renders.** It is MILL's disk cache wrapped around a function that
returns null. The static export crawls the running server, so a browser-launching renderer in the
serving path would put chromium in the deploy, and the Pages workflow installs none. Rendering
happens once, on the machine that authored the diagram, and the SVG is committed beside the
Markdown.

**The gate had a second door and it is closed.** An unlabelled fence is refused by MILL before the
renderer is called, so nothing was ever looked up in the cache and the miss-counting pass saw
nothing, while the page would have published raw source. The gate now makes a second pass over
MILL's own parse and fails a diagram fence with no accessible name, naming a near-miss key when the
author reaches for caption instead of label.

The first rendered diagram is the layer chain on the MILL architecture page. It was verified in the
exported HTML, not just on the dev server: the accessible name is on the SVG root and the fence
text appears zero times.

## The two deductions that became measurements

**The builder.** The page had been claiming, since the edit fence was loosened, that five answers
had been one prefix short so they would pass now, and admitting in the same paragraph that this was
a deduction. It was run, ten times across five scenarios, against the same list that had scored zero
before.

| scenario | before | after |
|---|---|---|
| drop b4 | 0 of 1 | 2 of 3 |
| drop the second card | 0 of 1 | 0 of 1 |
| make the callout full width | 0 of 1 | 0 of 1 |
| move the callout up | 0 of 1 | 0 of 1 |
| the card should mention pricing | 0 of 1 | 3 of 4 |

The first correct edit this model has ever completed on that page is in that table. So is something
the deduction could never have found: on the ask no verb can serve, the model reached for a verb
anyway and removed an unrelated block, once in four tries. The strict fence had refused that same
answer on its address. The change bought one working edit and widened the blast radius of a wrong
one, and the page, the tour and the launch post all say both halves.

**The launch post.** It said four layers are on npm. Five are. The miscount drops CRUMB, which is
the same slip the desk's own fact sheet made three days earlier, so it is a recurring shape rather
than a typo: CRUMB shares the top altitude with PROOF, and a list written from the dependency chain
loses whichever of the two the writer thinks of second.

## Gate output

```
$ bun run check
$ tsc --noEmit

$ bun test
 595 pass
 0 fail
 2038 expect() calls
Ran 595 tests across 36 files. [2.67s]

$ bun run lint:links
link-lint: 53 rendered file(s), no dead relative links.

$ bun tools/lint-gate.ts
lint gate: level. 4455 flag(s) total (oxlint + voice-lint), matching or under the 4455 in tools/lint-baseline.json (generated 2026-08-19).

$ bun run verify:export
[verify-export] sitemap.xml: every <loc> resolves to a real file, all trailing-slash canonical
[verify-export] dead-link walk: every internal href/src across the exported HTML resolves
[verify-export] diagram cache: every mermaid fence in served content is named and has a committed SVG
[verify-export] OK

the diagram gate, probed three ways against the real repo
$ bun tools/diagram-cache-gate.ts        # labelled fence, no cache entry yet
  ✗ docs/mill/ARCHITECTURE.md:11 (served at /mill/docs/architecture): a mermaid fence has no
    committed SVG. Expected content/diagrams/a66c3f44….svg. Run bun run diagrams:warm.
$ bun tools/diagram-cache-gate.ts        # the same fence with caption= instead of label=
  ✗ docs/mill/ARCHITECTURE.md:11 …: a mermaid fence has no accessible name, so MILL refuses it and
    the page publishes the source. The fence spells caption; the accessible name is spelled label.
$ bun tools/diagram-cache-gate.ts        # labelled and warmed
[diagram-cache] every diagram fence in served content is named and has a committed SVG

$ bun ../pantry/cli.ts doctor .
21 checks, 0 failing, 0 due

greenroom, at 1203bfc
$ bun run check
$ tsc --noEmit -p tsconfig.next.json
exit=0
$ bun test lib
 68 pass
 0 fail
 225 expect() calls
Ran 68 tests across 9 files. [5.52s]
```

## What was not done

**Builder P5, the preview tab and the catalog sidebar.** Opened and stopped rather than guessed. The
plan carries an open question the owner has never answered, whether the preview is a real route on
this site or a framed sandbox, and the two answers produce different work. The sandbox plan's own
piece 4 asserts a route, which reads like an answer but sits alongside the question rather than
closing it. Nothing was built.

**The launch post's judgment read.** Two stale facts in it were corrected, which is a different job.
The mechanical voice lint reads zero flags, and that measures the tells a script can find.

**The greenroom backup refs.** Tags pre-reconcile-local and pre-reconcile-origin and the branch
pre-reconcile-local-branch all still resolve. They cost nothing and they are what made the
reconciliation reversible, so deleting them is a decision rather than cleanup.

**tjakoen/project stays private and its links stay removed**, per the owner's call this session. No
work followed from it.

## What needs human eyes

**The scope-growth tension above.** It is the only thing in this run that made a check weaker in
order to make it green, and it was done deliberately and in the open. Either the checker grows a
field for accepted growth, or sessions keep clearing the row by rewriting the envelope, and the
second outcome is the one that arrives by default.

**The builder's new failure mode.** One in four is a real rate on a small sample and the page says
so, but the question underneath it is a design call: whether a fence forgiving enough to land the
easy edit is worth a fence that can now destroy a block on an ask it should have refused. Reverting
the normalization is one answer. Refusing any destructive verb whose target was resolved from a bare
id, rather than written in full, is another and probably the better one.

**The launch post.** It is ready as far as anything mechanical can tell. Whether it sounds like him
is the read that is still owed, and it is the last thing between the draft and appbuildersph.com.
