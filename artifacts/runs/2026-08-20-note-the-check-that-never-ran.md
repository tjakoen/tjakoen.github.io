# Run report: the parked note gets written

**Date:** 2026-08-20
**Lane:** gated (published prose under the owner's byline)
**Bound:** write the note briefed at `plans/note-the-loop-nobody-ran.md`. One piece of work, no
pickup of the next backlog item.
**Result:** written as `content/notes/the-check-that-never-ran.md`, status DRAFT. Not pushed.

## What was asked, and what shipped

The brief was parked on 2026-08-19 because the harness caps a session at four children in flight and
this was the fifth. All four landed, so it was spawned.

Shipped:

- `content/notes/the-check-that-never-ran.md`, a personal note of about 1,700 words carrying one
  data-viz figure built to the FIGURES scaffold, two code fences, the pull-quote, the sign-off
  footer, and a relative cross-link to `one-loop-every-repo.md`, which is the note this one answers.
- `plans/note-the-loop-nobody-ran.md` flipped to `status: done` and annotated with the three number
  corrections below, so the corrections survive outside the note and outside this report.

The figure is inline SVG on the data-viz scaffold: canvas 620 wide, self-contained e-ink palette on
the root, one accent used once on the payoff line, `role="img"` with an `aria-label` that states the
data in words. Five bars, each showing sessions with the doctor-run portion filled. In four of the
five the filled portion is absent and in the fifth it is two pixels, which is the argument in a
picture.

## The one thing the brief warned about

The brief says plainly not to write the note around adoption, because that reading was checked and is
wrong. The draft does not. Its subject is a diagnosis that survived six weeks because usage numbers
looked like an answer, and the section that presents the discipline theory presents it as the
comfortable wrong answer the author argued himself into, not as the finding.

The diagnosis was verified at source rather than taken from the brief. The resolution ladder in
`~/.claude/tools/session-doctor.sh` documents it in its own comments, and the fix landed as
claude-config commit `797a67a`.

## The ask, and why it fired

The envelope's first ask-trigger is that the measurement in the brief contradicting a re-check stops
the run rather than being quietly resolved. It fired. A verification pass over the session store
(`nimbalyst.backup-current.sqlite`, opened read-only) could not reproduce three of the brief's
figures, so the run stopped and went to chat.

The owner's answer was that none of the three is unevidenced: two are snapshots and one has a
mislabeled denominator. Keep all three, present none of them as a standing fact. That is what the
note does.

| Figure | Status after re-check | How the note handles it |
|---|---|---|
| 288 | Exact arithmetic, wrong label. It is the four other named workspaces (165 + 55 + 42 + 26). All sessions outside the portfolio are 306; the bread-repos root, grain and greenroom add 18 the table never listed. | Written as "the four other repositories my table named", never as a total. |
| 87 doctor runs, 62 run reports | 2026-08-19 snapshots. A precise match on the doctor command returns 52; edited run-report paths return 45. The broader original rule could not be reconstructed. | Date-stamped in the sentence that makes them, and flagged in the text as a snapshot rather than a standing count. |
| 53 of 148 meta-work | 2026-08-19 snapshot against a denominator that has moved to 154. | The note prints what moved instead of restating the ratio: six sessions landed since, five of them about the loop. The ratio got worse because it was measured. |

Exact on re-check and used as standing facts: 454 sessions across 8 workspaces since 2026-07-04; 59
sessions named a variant of "Review pasted text"; the longest session at 11,396 messages; four
non-portfolio repos carrying `pantry.config.json` at the time of the claim; and the pair the whole
argument rests on, 165 sessions in the client project with 1 doctor run, and zero run reports in any
workspace outside the portfolio.

## The two late facts, both verified, both used as the ending

Neither changes the argument. Both were checked rather than accepted.

The reach bug is fixed and the client project produces a real reading for the first time. Run today
against that repo, verbatim:

```
pantry doctor, at session start (LOOP section 2, Tier 1). Passing rows omitted:

[warn] cold-start context: 27,024 chars over 4 files, over the 20,000 budget — MEMORY.md is 18,639 of it
[warn] graphify freshness: graph built from 30dd3d8f, 3 file(s) graphify has not extracted since (.github/workflows/deploy-production.yml, .github/workflows/deploy-staging.yml, .gitignore) — run graphify update .
[warn] e2e suite present: no e2e suite — the mechanical gate can't run end-to-end
21 checks, 0 failing, 3 due
```

The rollout reached eleven repositories carrying both `CLAUDE.md` and `pantry.config.json`, counted
by walking the disk rather than by trusting the count. The handoff said twelve. Eleven is what is
there, and the note says eleven. The twelfth is most likely `claude-config`, which carries neither
file and is not a kit repo.

## Guardrails

The note names no repository. The brief permitted naming the private teaching repo as a private
teaching repo, but naming was not needed for the argument, so the figure and the prose use neutral
labels ("a client project", "a teaching repo", "a side project", "an internal tool", "this site").
That is the conservative side of the public-repo guardrail and it cost the note nothing. No student
data, no names, no money figures, no exact ratios beyond the session counts already public in the
sibling note's own claims.

## Gate output, verbatim

Voice lint, the new note alone:

```
voice-lint: 0 flag(s) across 1 file(s) (0 tell, 0 warn).
This is the MECHANICAL subset of VOICE.md only. The judgment half — texture, the wink, honest limits, the formula tell — is the smell test in standards/VOICE.md, run by a human.
```

Voice lint, whole repo, for the standing baseline this run did not move:

```
voice-lint: 4423 flag(s) across 139 file(s) (4288 tell, 135 warn).
```

Unit suite:

```
 600 pass
 0 fail
 2060 expect() calls
Ran 600 tests across 37 files. [2.70s]
```

Session-start doctor for this repo, verbatim, carried by name because it is DUE and untriaged by
this run:

```
[warn] cold-start context: 20,136 chars over 4 files, over the 20,000 budget — MEMORY.md is 10,658 of it
[info] forked standards: this repo is the canon home (standardsSource: canon) — fork check skipped
21 checks, 0 failing, 1 due
```

The cold-start warning is carried, not fixed. MEMORY.md is 10,658 of the 20,136 and trimming it is
memory-estate work outside this envelope. It is the second session to carry this flag; a third
untouched carry is a LOOP section 8 red flag.

## Rendered, and where to look

The note was served and looked at rather than described. Dev server at
`http://localhost:3000/notes/the-check-that-never-ran`. The figure renders in the page's own
typography with the two-pixel filled sliver legible at reading size; the data-viz scaffold keeps its
own light palette in the dark theme, which is what the standard specifies for data-viz and not a
bug. Screenshot in the session transcript.

Served HTML confirmed to carry all six section headings, the page title, both code fences, one
`role="img"` SVG, the pull-quote as a callout blockquote, the sign-off footer with its link to
`ten-times-zero`, and the cross-link resolving to `/notes/one-loop-every-repo`.

## What this run did NOT do, and why

- **No push.** Hard stop in the envelope.
- **No publish flip.** `status: DRAFT`. The owner's read is owed on every note and a session cannot
  self-close that.
- **No backlog entry.** The brief's own scope line mentions the backlog entry, but the run envelope's
  scope cap does not include `docs/`, and the envelope wins. `docs/CONTENT-BACKLOG.md` still has no
  row for this note. That is an ask, not an oversight.
- **No edits to the standards the note describes.** Quoting them was the job.
- **No pickup of the next backlog item.** The bound was one note.

## What needs the owner's eyes

1. **The judgment half of the smell test.** The linter covers the mechanical half only. The rows a
   human has to read are the texture, the wink, whether the honest limits are honest, and the formula
   tell. The draft deliberately uses few signature moves: the number-opener, one
   confession-inside-the-confession, and the callback close. No piano metaphor.
2. **Whether the self-referential confession earns its place.** The section "What I still cannot
   reproduce, including one I got wrong twice" admits the 288 mislabeling inside a note about
   misreading a measurement. It is the sharpest thing in the piece and it is also the thing most
   likely to read as too clever. That is a call the owner should make, not this session.
3. **The title.** "The Check Ran Once in 165 Sessions, and I Got the Reason Wrong" is long. It is
   specific and it carries the turn, which is what the standard asks of a title, but a shorter one
   may exist.
4. **The backlog row**, if it is wanted.
