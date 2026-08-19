---
title: "INTAKE, turning a pasted blob into a scoped brief"
date: 2026-08-19
status: complete
lane: gated
branch: main
skills:
  - intake
  - voice
  - loop-standard
scope:
  - standards/
  - CLAUDE.md
  - .gitignore
  - artifacts/runs/
touched:
  - .gitignore
  - CLAUDE.md
  - artifacts/runs/2026-08-19-intake-standard.md
  - standards/INTAKE.md
  - standards/README.md
diffstat: 5 files changed, 444 insertions(+), 9 deletions(-)
unpushed: 0
verifiedBy: a later session that did not write the run, 2026-08-20
doctor: 0 failing, 2 due and carried by name, cold-start context and run ledger
---

# Run report: INTAKE, turning a pasted blob into a scoped brief

> The frontmatter above was retrofitted on 2026-08-20 by a session that did not write this run. Every
> field comes from git or from the report's own text, never from a guess: the diffstat and the touched
> list are `git show` on commit `0dab776`, the unpushed count is 0 because the commit is on
> `origin/main`, and the scope is the envelope this report already declared below, written out as
> paths because the ledger reads paths and the original wrote "the portfolio's own docs". The gate fences
> further down are the original session's own pastes and were not touched or re-run. The in-body
> diffstat under *Gate results* was taken before the final edits and reads 245 lines for INTAKE.md
> where git records 256; git is the one to trust.

Date: 2026-08-19
Session: blob-to-brief intake skill
Parent session: 914e2362-2f92-4566-a70a-c1c4d75b6cb3

## The envelope this run declared

- **Lane:** gated, as handed over. A skill mounted machine-wide has real blast radius and a mistake
  is reversible by deleting one file.
- **Scope cap:** standards/ and the portfolio's own docs. Held. Files touched: standards/INTAKE.md
  (new), standards/README.md, CLAUDE.md, .gitignore.
- **Hard stops:** no hook, no push, no other repo. All held. Nothing was pushed. Pantry was read and
  its skills sync command was run, which writes only into this repo's gitignored skills directory;
  no file in pantry was modified.
- **Ask-triggers:** raise it if this should be a hook, or if an existing skill already covers it.
  Both were evaluated and both are answered below. Neither triggered a stop, per the brief.

## What was built

One new standard, standards/INTAKE.md, mounted as the skill named intake. It owns arrival: the point
where work turns up as a pasted document carrying a task but no lane, no cap, no stop and no finish
line. It borrows LOOP section 4b's four names exactly rather than inventing a fifth vocabulary, and
adds a definition of done.

Registration, checked against how an existing standard is wired rather than assumed:

- The file itself. Standards are auto-discovered, so no route was added. Confirmed at
  <http://localhost:3007/standards/intake>, HTTP 200, title rendered from the frontmatter.
- The index row and a "How they fit together" entry in standards/README.md, which the standards
  directory's own CLAUDE.md requires in the same commit.
- The skill mount. Pantry globs standards for any file carrying a `when:` key, so no pantry edit was
  needed. `pantry skills list` reports `ok intake (INTAKE.md)` and `17 skills in canon, 0 stale or
  unmounted, 0 shadowed`. The slug does not collide with a built-in, which was worth checking because
  a collision is silent: LOOP.md already hit exactly that and carries a `skill:` override because
  of it.
- A reading-order entry in CLAUDE.md, inserted at position 2 with the rest renumbered.

## The measurement behind it

Taken over every session transcript for this repo, first user turn only, skill bodies excluded.

| What the blob carried | Count |
|---|---|
| A named envelope block | 7 |
| Substance scattered through prose, unnamed | 23 |
| Neither | 24 |
| Total work blobs | 54 |

The brief handed to this session cited 59 sessions titled some variant of "Review pasted text". That
number was confirmed exactly against the session store: 21 file, 20 content, 14 document, plus four
one-off variants, 59 in total out of 454 sessions.

The middle row above is the one that changed the design, and it was not visible from the titles. A
first pass counted 47 of 54 blobs as having no envelope. Reading them showed that was wrong: many say
do not push, or off limits, or only phase P0, somewhere in paragraph six. The information is present
and unusable, so for nearly half the cases the skill's job is to lift and name an envelope rather than
invent one. That is why every field is pre-filled from the blob and marked as lifted or invented.

## Run against three real blobs

All three are real first-turn blobs from this repo's transcripts, not fixtures.

1. **Transcript 4218d514, 197 characters.** An editorial pass on one named draft file. Fire test:
   SKIPPED, one-line ask naming its own file. No brief written. This is the case that keeps the skill
   from being switched off.
2. **Transcript 0a24010d, 1333 characters.** A calendar feed post for a student-organization talk.
   Bucket: neither. No lane, cap, stop or finish line anywhere. Brief written, with two hard stops
   that exist only because a person was asked: do not name the student who asked the question, and do
   not carry the tracking parameters from the pasted social link into a committed file.
3. **Transcript 6985cb8e, 3585 characters.** A correction plus a two-repo release to carry. Bucket:
   substance scattered. The brief lifts four constraints already in the prose and marks them LIFTED,
   and surfaces the one thing the paste never resolves: it asks the run to push and publish, which
   are standing hard stops. Recorded as an explicit owner delegation instead of being settled quietly
   mid-run.

A fourth check, on this session's own brief: it carries a named envelope, so the fire test skips it.

The briefs are on disk in artifacts/briefs/ and are deliberately uncommitted, for the reason below.

## What running it changed about the design

Section 6 originally filed briefs in artifacts/briefs/ as committed files, on the reasoning that a
brief and the run report judging it should sit in sibling directories. Running it against blob 2
broke that. A brief quotes the blob, and that blob carried an organization name, a private social URL
with tracking parameters, and a student's question. This repo is public and artifacts is committed, so
the placement would have published the paste on the next commit.

The fix: a brief is never published. The directory is gitignored, and the run report, which is
committed, restates the envelope block instead. A lane, a list of directories and a list of stops
carry no content from the blob, so the pairing survives for anyone checking whether a run stayed
inside its bounds and the paste does not travel with it. This was found by running the thing, not by
reasoning about it in advance.

## Gate results, verbatim

```
$ bun run check
$ tsc --noEmit
```

```
$ bun test
 600 pass
 0 fail
 2050 expect() calls
Ran 600 tests across 37 files. [2.77s]
```

```
$ bun run lint:links
$ bun tools/link-lint.ts
link-lint: 54 rendered file(s), no dead relative links.
```

```
$ bun tools/lint-gate.ts
lint gate: level. 4455 flag(s) total (oxlint + voice-lint), matching or under the 4455 in tools/lint-baseline.json (generated 2026-08-19).
```

The baseline was 4455 before this change and is 4455 after. The new standard adds zero voice-lint
flags, verified with a direct run: `voice-lint: 0 flag(s) across 1 file(s) (0 tell, 0 warn)`. Two
edits were made to keep it there. The "built with Claude" footer was dropped, since it appears on the
paste-in prompt pages and not on core standards like VOICE, LOOP or DECISIONS, and its emoji would
have raised the count by one. The CLAUDE.md entry uses italics rather than backticks for the same
reason, which is the substitution VOICE itself prescribes.

Diffstat for committed files:

```
 .gitignore          |  4 ++++
 CLAUDE.md           | 23 ++++++++++++++---------
 standards/README.md |  7 +++++++
 standards/INTAKE.md | 245 +++++++++++++++++++++++++++++++++++++ (new)
```

## Two stale counts fixed in passing

CLAUDE.md said "the rest of the eighteen" standards installed as skills. The mounted count is
seventeen, confirmed by `pantry skills list`, and it was already wrong before this change rather than
made wrong by it. Corrected. A first draft of INTAKE repeated the same figure and was rewritten to
avoid carrying a count that goes stale on the next standard.

## What was not done

- **No hook.** A prompt-submit hook was a hard stop in the brief and none was added. Section 7 of the
  standard states the case for one and leaves it as an open owner decision.
- **No push.** Nothing was pushed. Four files are staged for commit by pathspec.
- **No live interview.** The three runs produced briefs whose fields are marked PROPOSED, because the
  standard's own rule is that a field is a proposal until a person answers it. Blobs 2 and 3 are
  historical, so nobody could answer them. The interview surface has not been exercised end to end
  against a live paste, and that is the one part of this that is written but not proven.
- **No memory entry yet.** Worth one if the owner keeps the skill.

## What needs human eyes

- **The hook question.** A skill fires on the model's judgment, and the moment an envelope is needed
  is the moment nobody thinks to ask for one. A skill that should have fired and did not leaves no
  trace. Whether that residual gap is worth a machine-wide prompt-submit hook is the owner's call and
  it is deliberately unanswered.
- **The four questions themselves.** Whether these are the right four is a judgment nothing here can
  check. The fastest way to find out is to use it on the next real paste.
- **Two untracked run reports** in artifacts/runs, from other sessions, were left untouched.
