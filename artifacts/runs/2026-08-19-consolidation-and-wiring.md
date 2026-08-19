---
title: Nine sessions consolidated, the ledger cleared, and two claims that were deductions became measurements
date: 2026-08-19
status: complete
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
  - view/pages/builder/preview.html
  - view/components/pages/builder/builder.css
  - e2e/builder-canvas.e2e.ts
  - plans/site-builder.md
  - src/server.ts
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
  - view/pages/builder/preview.html
  - view/components/pages/builder/builder.css
  - e2e/builder-canvas.e2e.ts
  - plans/site-builder.md
  - src/server.ts
  - package.json
  - bun.lock
skills:
  - voice
  - loop-standard
  - figures
  - tour-standard
plans: plans/site-builder.md P5, marked done. It was opened, stopped on the owner call the plan
  flags, answered as a real route, and built.
gates:
  - "bun run check | $ tsc --noEmit, no output, exit 0"
  - "bun test | 600 pass, 0 fail, 2050 expect() calls, 37 files"
  - "bunx playwright test e2e/builder-canvas.e2e.ts | 58 passed"
  - "bun run lint:links | 53 rendered file(s), no dead relative links."
  - "bun tools/lint-gate.ts | level, 4455 flags against a 4455 baseline"
  - "bun run verify:export | sitemap, dead-link walk and diagram cache all OK"
  - "bun tools/diagram-cache-gate.ts | probed three ways against the real repo, red twice and green once"
  - "bun ../pantry/cli.ts doctor . | 21 checks, 0 failing, 0 due"
  - "greenroom bun run check | tsc, exit 0"
  - "greenroom bun test lib | 68 pass, 0 fail, 225 expect() calls"
diffstat: 7 portfolio commits, plus 1 in greenroom and 2 in claude-config. See the log from 8ad8a88.
unpushed: 0 | all 8 portfolio commits are on origin/main, pushed in two batches on the owner's word.
  Greenroom's 1 and claude-config's 3 are pushed too. CI and the Pages deploy are green on beaa3cb.
verifiedBy: nobody yet. This is the author's own account. Three claims in it were checked by a route
  independent of the thing making the claim: the diagram gate was probed by hand in both directions
  rather than observed passing, the greenroom reconciliation was re-measured from git rather than
  read out of the prior session's report, and the builder numbers come from ten runs of the live
  model rather than from a deduction.
doctor: 21 checks, 0 failing, 1 due. Both flags standing at session start were closed rather than
  carried: the cold-start context budget and the run-ledger evidence. Graphify freshness is the one
  left, and it is a treadmill rather than debt: a PostToolUse hook re-extracts on every edit, so the
  merged graph goes stale again the moment anything is touched. It was cleared three times during
  this run and is due again. Worth a look at whether the check should compare against the last merge
  rather than the last extraction.
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

**Nothing from the build order.** P5 was the item that stopped for a decision, the owner answered it
as a real route, and it was built. What P5 deliberately does NOT close is written into the plan and
onto the page: a shared preview link arrives empty on the published site, because that page carries
no template library where the workbench does. Closing it means carrying the library and the paint
loop onto the preview, which is its own phase.

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

**The builder's new failure mode: answered, and the first answer was wrong.** The recommendation this
report originally carried, refusing a destructive verb on a resolved bare id, was built and then
measured. It took the one edit the model lands with it, three runs to zero, because that edit is a
drop written short. Forbidding the mistake cost the feature, so it was reverted and the canvas got an
Undo instead: a wrong drop is one press to put back, with the block's data intact.

The lesson is the one this run keeps relearning. The guard was recommended from a deduction, in the
same report that spends a section on a deduction being replaced by a measurement. Measuring it took
about three minutes.

**The launch post.** It is ready as far as anything mechanical can tell. Whether it sounds like him
is the read that is still owed, and it is the last thing between the draft and appbuildersph.com.

## What the second half added, after the decisions

The owner answered three calls mid-run and the work followed them.

**An Undo on the builder canvas**, in place of the guard above. A stack of whole compositions rather
than inverse ops, so a restored block comes back with its own data; it records what the desk did as
well as what a press did. Writing it surfaced a real pre-existing bug: the rail compared the next
composition to the current one by identity, but two of the three verbs build a new object
unconditionally and clamp rather than refuse, so the check only ever caught the id-not-found case.
Harmless while it cost a repaint, not harmless once a no-op press could stack a step that undoes
nothing visible. It compares by shape now.

**Builder P5**, as a real route. The details and its one known limit are in the plan and above.
