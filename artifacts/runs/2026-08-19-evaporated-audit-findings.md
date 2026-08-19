---
title: The audit findings that evaporated, and the sixty-two percent of them that fixed themselves
date: 2026-08-19
status: complete
lane: high
branch: main
skills:
  - audit-standard
  - voice
  - loop-standard
scope:
  - the Nimbalyst session store (read-only, from the backup)
  - read-only verification against admin-interface, lakbay-ph, ph-live, HAU, batch, greenroom, tjakoen.github.io
  - artifacts/runs/
touched:
  - artifacts/runs/2026-08-19-evaporated-audit-findings.md
---

# The audit findings that evaporated

Sixty-one of the four hundred and fifty-four sessions since 2026-07-04 were audits or sweeps. Two
repos keep a run ledger. The worry that prompted this pass was that the other repos ran audits whose
findings had nowhere to go, and that a large body of real defects was sitting in a SQLite table that
nobody reads.

The worry is smaller than it looked, but not for the reason anyone expected. The findings mostly did
land. What they landed in was not a ledger.

## What was measured

The session store was read from the backup at
`~/Library/Application Support/@nimbalyst/electron/sqlite-db.backups/nimbalyst.backup-current.sqlite`,
copied to `/tmp` and queried read-only. Sixty-one sessions carry "audit" or "sweep" in the title.
Twelve of those are empty shells with zero messages, the spawn records of sessions that were opened
and never run, so forty-nine sessions actually produced anything. For each of those, the closing
assistant messages were extracted, which is where an audit states its findings, and the finding lists
were pulled out of the narrative.

Every finding was then checked against the repo as it stands today. A finding naming a file that no
longer exists, or a number that is no longer the number, is history rather than a finding, and it was
dropped. So was anything that could not be verified from the code, which mostly means findings about
GitHub state or about a student's grade rather than about a line someone can open.

## The two counts that matter

**Fifty-five findings were extracted and checked. Twenty-one are still true. Thirty-four were
dropped.**

That is a drop rate of sixty-two percent, and it is the real answer to the question this pass was
asked. Most of what an audit finds gets fixed by the work that follows it, and gets fixed without
anyone consulting the audit. The evaporation is real, but what evaporates is mostly already dead.

The drop rate is not evenly spread, and where it clusters is the actual finding.

| Repo | Checked | Still true | Dropped | Drop rate |
|---|---|---|---|---|
| admin-interface | 5 | 0 | 5 | 100% |
| ph-live | 15 | 6 | 9 | 60% |
| tjakoen.github.io | 15 | 9 | 6 | 40% |
| HAU | 10 | 3 | 7 | 70% |
| lakbay-ph | 5 | 2 | 3 | 60% |
| batch and greenroom | 5 | 2 | 3 | 60% |

One of the twenty-one is a security-shaped item in ph-live. It was surfaced directly to the owner
rather than filed here, per the envelope this run was given, and it is not in the tables below. It is
counted in the twenty-one.

## One thing to say before the list

The premise that outside the portfolio the findings had nowhere to go turns out to be wrong in the
two repos that ran the most audits. ph-live keeps `docs/reports/` with five dated audit reports, and
a plan board entry at `plans/audit-2026-08-01-followups.md` with a checkbox per finding, correction
notes where the audit was wrong, and a `status: blocked` header naming the one section still open.
admin-interface keeps `plans/0008-ui-audit.md` with the same shape. Both of those are run ledgers in
everything but name.

What they do not have is a common place, a common name, or a way for a session in one repo to see
what a session in another repo already found. The absence is not a record. The absence is a
convention.

## Open findings, by repo

### tjakoen.github.io (portfolio)

Nine of the fifteen checked are still true. These are the least evaporated, and the reason is that
this repo writes its audits down in `docs/AUDIT-*.md` with an explicit open-or-fixed column per row,
so an open finding stays visibly open instead of quietly aging out.

| File and line | Severity | Finding | Audit |
|---|---|---|---|
| `src/ai/desk-reasoner.ts:632` | blocker | When `openCompose()` returns false the whole draft body is skipped in silence, and line 642 still records the step as done and advances the counter. The showcase reports a step it never performed. | Full project audit, 2026-08-17 |
| `crumb/crumb-live.js:248` | major | `lightStep` returns null when the step's surface is not on the page, and the tour card advances anyway. A tour step pointing at a surface that moved shows nothing and says nothing. | Full project audit, 2026-08-17 |
| `standards/*.md` | major | VOICE calls the em-dash the loudest machine tell, and the standards carry 203 of them. The audit counted 144 on 2026-08-18. The count has gone up, not down, so the ratcheting baseline in `tools/lint-baseline.json` is ratcheting the wrong way. | Public-facing full audit, 2026-08-18 |
| `content/events/yses-uplb-hackfest.md:96`, `yses-uplb-fair-and-talk.md:60`, `codegeeks-hau-sleek-and-swift.md:32,78` | major | Three people are still named in full with no public professional link, against the repo's own rule. One of the four names from the original finding has since been given a link, so this is partly closed. | Public-facing full audit, 2026-08-18 |
| `src/server.ts:358-372` | major | The `/plans` chrome emits a title and `PAGE_HEAD`, and `PAGE_HEAD` carries no description, so all live plan routes ship with no meta description and no OpenGraph or Twitter description either. | Public-facing full audit, 2026-08-18 |
| `standards/NOTE-STANDARD.md:64` | minor | The frontmatter table still says `status` gates publication. An owner call on 2026-08-14 made it decorative and the live site treats DRAFT and PUBLISHED identically. | Public-facing full audit, 2026-08-18 |
| `standards/NOTE-STANDARD.md:100` | minor | The worked example names `the-substrate-gap` and `ninety-days-substrate-gap`. Neither exists under `content/notes/`. | Public-facing full audit, 2026-08-18 |
| `standards/LOOP.md:35-49` | minor | The intro says five primitives, the table holds five rows, and the prose then introduces automations as "the fifth primitive", which makes it the sixth thing called the fifth. | Public-facing full audit, 2026-08-18 |
| `content/data/cv.json:47` | minor | The résumé names a former employer that the content backlog's plan for the same story promises to keep anonymous. | Public-facing full audit, 2026-08-18 |

Dropped here: the BREAD page's four-versus-five layer contradiction (both now say four), the missing
install instructions in the README (a Quick start section exists), the two dead links in
`docs/grain/AI-INTERFACE.md` (replaced with an honest "in a private repo and so unlinked here"),
`grain/README.md` counting four packages where five exist (it now says five), the 35 over-budget meta
descriptions (not re-counted, so dropped as unverified) and the one mechanical-fix blocker in the
2026-08-17 report (not verified in this pass).

### ph-live

Six still true of fifteen checked, one of which was surfaced separately.

| File and line | Severity | Finding | Audit |
|---|---|---|---|
| `apps/web/src/api/artists.ts:16`, `apps/web/src/api/events.ts:35,75,132` | major | The four `/v2` response adapters still take `raw: any` and cast blind. Zod guards form inputs only, so a backend shape change surfaces as a runtime crash deep in a render rather than a caught boundary error. | Code audit, 2026-07-10 |
| `apps/web/.env.example:34`, `apps/web/src/constants/_seatSelectionData.ts` | major | `NEXT_PUBLIC_VENUE_MAP_ENABLED` still defaults to false, so production still serves the legacy seating chart off 922 lines of hardcoded seat data. The follow-up board asks for either the flag flip with acceptance criteria or a written reason the legacy chart is the shipping path, and neither exists. Blocked on Stripe test keys as of 2026-08-09. | Full codebase audit, 2026-08-01 |
| `apps/web/src/api/constants.ts:19-24`, consumed at `apps/web/src/api/client.ts:82` | major | Supabase residue is still the default header set. Every call through `apiClient` sends an `apikey` header and an `Authorization: Bearer` built from the Supabase anon key to a Laravel API that has no use for either. Two call sites now carry comments about working around it, which is the shape of a defect that has been routed around rather than removed. | Fable full audit, 2026-07-22 |
| `apps/web/src/api/axios.ts:16` and `apps/web/src/api/client.ts:52` | minor | Two parallel HTTP clients still both export the name `apiClient`, one as a default export and one as a named function. | Fable full audit, 2026-07-22 |
| `apps/web/src/contexts/DemoModeContext.tsx:13,96,134` | minor | The demo cockpit gate is still env-only, with three `TODO(superadmin)` markers waiting on an `AuthContext` that gains `isSuperadmin` and `isDev`. | Comprehensive project audit, 2026-07-20 |

Dropped here, and this list is the case for optimism. The money path is no longer untyped: all 184
`.jsx` files left in the repo are under `legacy/`. The `components/organisims/` directory typo is
gone. The duplicate backend under `legacy/` is gone, and `legacy/README.md` now carries the decision
about what stays and why. The `docker volume rm` on every deploy is gone, with a note in both deploy
workflows saying what it used to do. The 959 MiB git pack is now 240 MiB and the two mockup PDFs the
finding named are no longer in HEAD. `packages/ui` went from 12 import sites to 31, and
`apps/web/src/components/atoms/Typography.tsx` now opens with six lines explaining why it is
deliberately not a duplicate. The console-log count fell from 28 to 10. The seat-camping and
`disabled_seats` findings could not be verified against current code and were dropped under the rule
rather than guessed at.

### HAU

Three still true of ten checked. HAU is the repo where the code findings are worth the most, because
its tooling grades real students and a false clean has a person on the other end of it.

| File and line | Severity | Finding | Audit |
|---|---|---|---|
| `github-native-course-platform/teacher-template/tools/org-audit.mjs:317` | blocker | The access pass skips any repo that is neither a workspace nor a well-formed activity name, on the comment that "hygiene pass covers junk/malformed". The hygiene pass reports those repos by name but never reads their collaborators. Line 334 then prints "access: clean". The audit found this live: a student held admin on `HAU-6ADET/AGET`, the repo classified as junk, the access pass skipped it, and the summary reported clean. A check that passes when it could not run is the exact case the severity vocabulary calls a blocker. | Cross-org platform audit, 2026-08-13 |
| `github-native-course-platform/teacher-template/tools/org-audit.mjs:174` | major | `publicOK` is `isTemplate` or `isSolution` or `isDemo`, and `isTemplate` at line 155 matches only names ending in `-classcode-yourname`. `final-project-template` was deliberately made public on 2026-08-11 with Pages live, and matches none of the three, so every run flags it twice: once as junk to delete or rename, once as a repo that should be private. The file's own comment at line 178 says an audit noisy enough to ignore is how the real problems hid. | Cross-org platform audit, 2026-08-13 |
| `.github/workflows/template-visibility.yml`, absent in all 8 teacher repos | major | Still not installed. Every flip button on the Console templates board fails on dispatch. This one has not evaporated at all: it is carried by name in `HANDOFF.md` section 8 and twice in `CLAUDE.md`, and it is blocked on the owner by human-lane policy rather than on a session. | Cross-org platform audit, 2026-08-13 |

Dropped here: the GRADES.md finding, where students saw the automated test count instead of the
delivered grade, is fixed at `publish-grades.mjs:183` where the row now writes `displayScore(r)` with
the raw test count kept beside it. The student-with-admin grant on AGET was put to the owner and left
in place as their call, so it has a decision attached and is not an open finding. The identity data
findings, the four repos needing a manual rename, the duplicate collision in APSI 2203, the blank
`student.json` on a held capstone and the note-count mismatch in 2134 are all GitHub or gradebook
state rather than code, and none could be verified read-only from the tree.

### lakbay-ph

Two still true of five checked.

| File and line | Severity | Finding | Audit |
|---|---|---|---|
| `.gitignore:45`, against `tools/scraper/airbnb_pampanga_all_with_coords.json` and `tools/scraper/klook_all_pages.json` | major | The 2026-07-20 audit reported these scraped JSON files as "gitignored plus untracked". The gitignore rule landed. The untracking did not, and `git ls-files` still lists both, 924 KB of scraped third-party listing data carried in every clone. A gitignore entry over a tracked file changes nothing, which makes this the silent-no-op shape: the guard reads as done and the thing it guards is still there. | Comprehensive project audit, 2026-07-20 |
| `packages/design_system/lib/src/tokens/lakbay_typography.dart:35` | minor | `LakbayType.editorial` is defined, documented, and has zero consumers across `apps/` and `packages/`. The Fraunces family it names was kept by an explicit founder override on 2026-07-13 for long-form prose that has not been written yet. | Comprehensive project audit, 2026-07-20 |

Dropped here: `map_screen.dart` is 330 lines, not 819. The responsive wrap on the four pushed routes
shipped. The scraped JSON remaining in git history was recorded at the time as accepted for a private
repo, so it has a decision attached.

### batch and greenroom

Two still true of five checked. Both were found by a portfolio audit reading across the estate, and
both live in repos that have never had an audit session of their own.

| File and line | Severity | Finding | Audit |
|---|---|---|---|
| `greenroom/lib/records.ts:159` | major | `resultsDir` joins on `basename(dirName)`, and `basename("..")` returns `".."`, so a crafted run identifier resolves outside `RUNS_DIR`. The containment guard that the sibling static handler gets right is missing here. | Full project audit, 2026-08-17 |
| `batch/http/static.ts:38` | major | Any extension outside the `TYPES` map is served as `text/html`. An uploaded or generated file with an unmapped extension is handed to the browser as a document to render rather than as bytes to download. | Full project audit, 2026-08-17 |

Dropped here: `greenroom/lib/run-scope.ts:52` still fails open for a run key with no matching row, but
the line now carries a comment stating the company-open default as the intent, so the finding as
written, that no decision was attached, is no longer true. The bun git-dependency resolution race from
the 2026-07-08 stack audit was root-caused and turned into a policy, and the dead-doc deletions it
proposed could not be verified.

### admin-interface

Nothing. Five findings checked, five dropped, and this repo is the cleanest demonstration of why the
drop rate is what it is. The `/stream` idle timeout the audit flagged as known-and-unfixed is set at
`server.ts:1139`. The `/ai/manifest` advertising a dead `reflection` surface is not only fixed but
guarded by a test at `app/ai/surfaces.test.ts:35` that exists to stop the regression by name. The
`.app-shell` collision allow-list at `app/view/css.test.ts:22` is an empty set with a comment saying
the doctrine is that it stays empty. The two owner-blocked items, the Drive Picker and the
unrestricted Google API key, were both closed by the 0.4.0 release, whose commit message is "the
release that carries no credentials at all".

That repo answered its own audit inside two sessions and then built the mechanism that stops each
finding from recurring. It is the pattern the other repos should copy, and it needed no ledger to do
it.

## Where these should have landed

Per repo, the place that already exists or the smallest place that would work. The rollout session
should build the convention, not the storage: every one of these repos can already hold a report, and
what none of them can do is find one written by a session in a different repo.

**ph-live.** It already has the right answer, in two halves. `docs/reports/audit-<date>.md` holds the
evidence and `plans/audit-<date>-followups.md` holds the board entry with one checkbox per finding.
Keep both. The gap is that the 2026-07-10 code audit landed at `plans/code-audit.md` instead, marked
`status: done` while three of its findings are still open, so a reader who trusts the header is
misled. The convention to enforce: a report is `docs/reports/`, a work list is `plans/`, and a plan is
not done while a finding under it is open.

**admin-interface.** Findings land in the numbered plan that owns them, `plans/00NN-<topic>.md`, and
the recurrence guard lands in a test next to the code. That is already the practice. Nothing to build,
and it is worth writing down as the reference case.

**HAU.** The three open findings are already carried by name in `HANDOFF.md` and `CLAUDE.md`, which is
why they survived. What HAU lacks is a place for a finding about the tooling as distinct from a
finding about the term. `memory/` holds one audit note from July and nothing since. The right home is
`ops/audit-<date>.md`, beside the scripts the findings are about, with the two `org-audit.mjs`
findings as the first entries, because a defect in the audit tool is the one class that cannot be
found by running the audit tool.

**lakbay-ph.** `docs/AUDIT.md` exists and was reframed as a frozen historical baseline on 2026-07-10,
which left the repo with a file named AUDIT that is explicitly not where an audit goes. Later audits
then had nowhere to land and went into memory and a commit message. Either unfreeze it as a running
log or add `docs/reports/` the way ph-live has it. The frozen baseline should not keep the name.

**batch and greenroom.** These are the only genuine evaporation in the set. Both findings were made by
a portfolio session reading across the estate, written into `docs/AUDIT-2026-08-17.md` in this repo,
and never carried into the repo that has to fix them. Neither has run an audit of its own, and neither
has a place to put one. They need the smallest possible thing: an `AUDIT.md` in the repo root that
lists the open findings against that repo, whoever found them. bread and greenroom already have a file
by that name, so the shape exists and only needs filling.

**tjakoen.github.io.** No change. The dated `docs/AUDIT-*.md` files with an open-or-fixed column per
row are why this repo has the lowest drop rate in the table, and the reason is not that its code is
worse. It is that an open finding here stays legible as open, so it neither gets fixed by accident nor
forgotten on purpose. That column is the whole mechanism, and it is what the other five repos are
missing.

## What this pass did not cover

Twelve of the sixty-one audit sessions have no messages at all and were not read. Of the forty-nine
that ran, only the closing assistant messages were sampled, so a finding stated in the middle of a
long session and never restated at the end was not seen. Several sessions run past three thousand
messages and were deliberately not read whole.

Findings about GitHub state, Canvas grades and org membership were dropped rather than checked,
because verifying them means live API calls against student data and this run was scoped read-only
against the tree. That is most of what the HAU audits found, so HAU's seventy percent drop rate is
partly an artifact of what could be verified here rather than a claim that seventy percent of its
findings were resolved.

No repo was modified. Nothing was fixed. One file was written, this one.

---

*Written with Claude, in one session, against the session store rather than against memory.*
