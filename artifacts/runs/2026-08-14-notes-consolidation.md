---
title: Two notes fold into the ones that owed them, and four drafts finally publish
date: 2026-08-14
status: complete
lane: gated
branch: main
scope:
  - content/notes/
  - content/data/desk-feed.json
  - docs/CONTENT-BACKLOG.md
  - src/content.ts
  - src/server.ts
  - tools/export.ts
  - artifacts/runs/
touched:
  - content/notes/where-were-we.md
  - content/notes/native-partial-updates.md
  - content/notes/one-loop-every-repo.md
  - content/notes/the-browser-grew-up.md
  - content/notes/feels-like-an-app.md
  - content/notes/whitepaper-one-vocabulary.md
  - content/data/desk-feed.json
  - docs/CONTENT-BACKLOG.md
  - src/content.ts
  - src/server.ts
  - tools/export.ts
  - artifacts/runs/2026-08-14-notes-consolidation.md
skills:
  - voice
plans: none. The ask arrived as a question about one note and grew into an audit of all twelve; it
  was small enough to carry in the session rather than open a plan file for.
gates:
  - bun run check (tsc --noEmit)
  - bun test
  - bun run lint:voice
  - bun run lint (oxlint)
  - bun run export
  - bun run verify:export
diffstat: 15 files changed (292 insertions, 283 deletions) across two commits plus one uncommitted
  fix, of which 2 files are deletions and 1 is this report. The insertion and deletion counts are
  close to even on purpose: this was a consolidation, not a rewrite, and almost every deleted line
  reappears inside another note.
dirty: nothing of this session's is uncommitted except the canonical fix described below, which is
  staged for a third commit. The tree is shared with four sibling sessions in the same workstream,
  so every count here was taken by pathspec rather than from a whole-tree read.
unpushed: 34 | portfolio commits, of which 3 are this session's. Pushing stays the owner's call and
  was not taken. The doctor's own threshold of 25 was already crossed before this session started.
verifiedBy: nobody yet. Everything below was checked by the session that wrote it, which is one
  pass, not two. The rendered surfaces were screenshotted rather than described, which is evidence a
  human can check quickly, but it is not a second pass.
doctor: six flags due at session start, none fixed, all carried. graphify freshness, the grain pin
  at 0.1.21 (deliberately unpublished per an earlier run), two 2026-08-11 run reports missing gate
  output whose sessions are gone, the unpushed count, and one unacted answer (review-controls-complete)
  belonging to another session's thread. This report answers the "15 commits since the newest run
  report" flag and nothing else.
---

## What was asked, and what the audit actually found

The ask was a question about one note: `/notes/where-were-we` felt removable. The wider ask was
whether twelve notes is too many.

Twelve notes, about thirty-eight thousand words, in four clusters. The finding is that redundancy
was real but not evenly spread, and the note the owner suspected was the right suspicion for a
reason the owner had not named.

- **Native web platform**, three notes, the worst overlap.
- **AI workflow**, three notes, one of which was a slice of another.
- **Teaching**, three notes, two telling the same platform build story.
- **AI provenance**, two notes, correct as two: the same argument in two registers for two readers.

## The two folds

**`where-were-we.md` into `one-loop-every-repo.md`.** The strongest evidence was already written
down in this repo: `docs/CONTENT-BACKLOG.md` described it as "the PROOF/plans-as-files slice" of
the estate-wide note. Its subject had folded into grain as a package, so the standalone tool the
note argues for no longer exists as a standalone thing. And the note closed by handing the reader
across to its sibling, which is a note telling you it is a section.

What survived the fold: the plans-as-files argument, the pull-quote that is the best line in the
piece, and the parser-to-board flow figure. What did not: the opening beat, because
one-loop-every-repo already summarised it in a sentence and now tells it in place.

**`native-partial-updates.md` into `the-browser-grew-up.md`.** The parent note's own summary
promised "the benchmark I finally ran" and then linked away to it, which is a note that owes
something and pays with a pointer.

**`feels-like-an-app.md` was audited for the same overlap and mostly cleared.** It defers to
the-browser-grew-up by name in four places already. One genuine restatement was cut. This is worth
recording because the instruction was to trim it and the honest answer was that there was little to
trim; manufacturing a bigger cut would have been the wrong kind of compliance.

## The defect found in the move

The benchmark bar chart referenced `--paper`, `--ink`, `--muted` and `--accent` and never defined
them, unlike the replacement-map figure in the same note, which carries the palette inline. An
undefined custom property on a `fill` resolves to the initial value, so the chart had been rendering
wrong for as long as it had existed. It now carries the same inline palette as its sibling, per the
one-family rule in FIGURES.

Nobody had noticed because the note was DRAFT in a status field that gates nothing, and because a
figure that renders *something* does not look broken until you compare it to the one beside it.

## The URL problem, and why the stub is not a 301

A folded note's URL is live, indexed and linked from wherever it was shared. The obvious answer is
a 301, and it is wrong here. The static export freezes response **bodies**; a redirect the crawler
followed would write the destination note's full text at both addresses and hand search engines two
copies of the same note.

So `FOLDED_NOTES` in `src/content.ts` maps an old route to a rendered stub carrying a canonical, a
`noindex`, and a meta refresh. It is added to `pageRoutes` in `tools/export.ts` explicitly and stays
out of the sitemap, for the same reason as the `noindex`.

## The second defect, found only by running the export

The stub route was verified live and screenshotted, and it worked. That was not enough. Running the
export revealed the stub's canonical was `/notes/one-loop-every-repo` where every other page in the
export carries `/notes/one-loop-every-repo/` with a trailing slash, because Pages serves the
directory and 301-redirects the extensionless form to it.

A stub whose whole job is to spend one redirect hop was spending two. Fixed by pointing the
canonical, the refresh target and both body links at the trailing-slash form.

This is the run's honest lesson: a route that answers correctly in dev is not a route that exports
correctly, and new code in the export path is untested until the export has run once.

## Gate output, verbatim

Run in a clean worktree at HEAD, because the shared tree carries four sibling sessions' work and a
gate run in it cannot tell whose change is red.

```
$ bun run check
$ tsc --noEmit

$ bun test
bun test v1.3.14 (0d9b296a)

 426 pass
 0 fail
 1600 expect() calls
Ran 426 tests across 27 files. [2.94s]
```

```
$ bun run lint:voice   (scoped to content/notes/)
content/notes/feels-like-an-app.md:19: warn [word-tell] word came free with the model — cut or replace.
content/notes/ten-times-zero.md:519: warn [word-tell] word came free with the model — cut or replace.
content/notes/whitepaper-one-vocabulary.md:211-216: warn [emoji] emoji in published prose — keep it clean.

TELL count across content/notes/: 0
```

Every flag above is a warn, not a TELL, and every one predates this session. The whitepaper's emoji
sit in a table it has carried since July.

```
$ bun run export
[export] done: 118/118 pages, 83/83 data routes, 28 frozen modules, 92 asset files.

$ bun run verify:export
[verify-export] sitemap.xml: every <loc> resolves to a real file, all trailing-slash canonical
[verify-export] dead-link walk: every internal href/src across the exported HTML resolves
[verify-export] OK
```

The exported stubs, after the fix:

```
$ grep -o 'canonical" href="[^"]*"' dist/notes/where-were-we/index.html
canonical" href="/notes/one-loop-every-repo/"
$ grep -c "where-were-we" dist/sitemap.xml
0
```

## The one gate that is red, and why it is not this session's

`bun run lint` (oxlint) exits 1 on a single error:

```
src/ai/field-matcher.ts:417:22: error eslint(no-control-regex): Unexpected control characters
```

`git log -L 417,417` puts that line in `1d0f952`, 2026-08-13, the form-builder work. It is on HEAD,
it predates this session, and no file this session touched contributes to it.

The lint gate also reports baseline regressions: `voice:backtick` +57, `oxlint:no-array-sort` +13,
`voice:emoji` +2, `no-control-regex` +1, `no-array-reverse` +1. The backtick and emoji increases are
this session's, from filenames in the backlog entry and the stub page's eyebrow, both matching the
conventions of the files they sit in. The three oxlint increases are in `e2e/calendar.e2e.ts`,
`e2e/welcome-flagship.e2e.ts` and `src/ai/field-matcher.ts`, none of which this session opened.

**`bun run lint:baseline --write` was deliberately NOT run.** Accepting the baseline would have
silently blessed three sibling sessions' regressions under this session's name, and a baseline
accepted by whoever happened to commit last is a baseline that means nothing.

## What was NOT done

- **The teaching cluster was left alone**, though the audit found it carries the same redundancy:
  `why-i-teach` and `how-i-turned-github-into-a-classroom` and the console note tell overlapping
  versions of the platform build story. That cluster was merged five to three on 2026-07-31, and a
  second pass over two-week-old consolidation is churn. A sibling session in this workstream has the
  console note open right now, so touching it would also have collided.
- **Nothing was pushed.** 34 commits sit ahead of origin/main and the doctor's threshold of 25 was
  crossed before this session opened.
- **The DRAFT status field was left decorative**, on the owner's explicit call. It gates nothing, no
  code reads it, and gating `/notes` on it would have hidden work already published and linked.
- **Two notes stay DRAFT:** the console note (a sibling session has it), and `watch-its-hands`,
  which the backlog has recorded as owing the owner's own read since it was written.

## What needs human eyes

1. **The push.** Three of this session's commits are in the 34. It is the owner's call and the
   doctor has now flagged it twice.
2. **The prose in two rewritten notes.** `one-loop-every-repo` gained a section and
   `the-browser-grew-up` gained a benchmark, then both were flipped to PUBLISHED on the owner's
   instruction in the same session that wrote them. That is the one place this run knowingly bends
   the no-grading-your-own-homework rule, and it bends it because the owner asked directly. The
   writing has had one reader.
3. **`src/ai/field-matcher.ts:417`.** Not this session's, but it is the only red gate in the repo
   and it belongs to whoever owns the form-builder thread.
