---
title: What should the four loop-hygiene thresholds be?
status: resolved
options:
  - A, days — uncommitted 2d, unpushed 2d or 10 commits, run report every 10 commits
  - B, a working week — uncommitted 5d, unpushed 5d or 25 commits, run report every 15 commits
  - C, weeks — uncommitted 10d, unpushed 14d or 40 commits, run report every 25 commits
  - None of these — say the four numbers you want and they land verbatim
recommendation: B, a working week — uncommitted 5d, unpushed 5d or 25 commits, run report every 15 commits
unblocks: the defaults for the four S3a doctor checks (uncommitted-age, unpushed-age, no-remote, run-report-presence). The checks and their tests are written and green against injected thresholds; only the default constant is empty, and it is the last thing to land before this commits.
evidence:
  - plans/skills-runtime.md S3a | /docs/plans/skills-runtime
  - pantry hygiene.ts, the four checks | /docs/plans
  - measured commit rate, this file's Evidence section
---

# The four numbers

> **Resolved 2026-08-11: option B, a working week.** uncommittedMaxAgeDays 5, unpushedMaxAgeDays 5,
> unpushedMaxCommits 25, runReportMaxCommits 15. Answered by the owner in chat, recorded on the one
> channel (`plans/decisions/answers.jsonl`, ref `2026-08-11-loop-hygiene-thresholds`) so a session
> that did not ask can still act on it, and landed as `DEFAULT_HYGIENE` in pantry's `hygiene.ts` with
> the measurement below written into the comment beside it. The cost named under the recommendation
> stands as accepted rather than dismissed: unpushed-age will sometimes warn about the gap between
> owner-authorised pushes rather than about the work.

Four checks landed in PANTRY's doctor this run. Each one warns when something has been sitting too
long, and each one needs a number saying what too long is. The code takes them from
`pantry.config`, so any of these is a config edit later rather than a rewrite. What it cannot do is
invent them, because the whole failure mode here is a threshold nobody agreed to: a check that fires
on a normal working day gets muted within a week, and a check set so loose it never fires is a check
nobody notices is dead.

| Key | What it measures | What warning means |
|---|---|---|
| uncommittedMaxAgeDays | the oldest dirty file in the working tree, by mtime | work is written and not committed |
| unpushedMaxAgeDays | the oldest commit not on the upstream | work is committed and not delivered |
| unpushedMaxCommits | how many commits are ahead of the upstream | same, by size instead of by age |
| runReportMaxCommits | commits landed since the newest run report | commits with no ledger entry behind them |

## Evidence

**Commit rate, measured today over the last thirty days.** This is the number that decides whether a
commit-count threshold is any good.

| Repo | Active days | Commits | Mean per active day | Busiest day |
|---|---|---|---|---|
| tjakoen.github.io | 25 | 247 | 9.9 | 42 |
| pantry | 12 | 81 | 6.8 | 49 |
| grain | 22 | 108 | 4.9 | 10 |

So a ten-commit unpushed threshold fires on an ordinary portfolio day, every day. Anything under
about twenty is a daily alarm rather than a signal. That is the single hardest constraint on option A.

**The pile-ups this is aimed at, from the record rather than from memory of it.** Uncommitted work
across five or more sessions (desk polish, KICKSTART, the VOICE sweep, loop-cleanup passes 7 through
10), all with green gates, all undelivered. Unpushed piles that stood for days at a time and were
cleared in single authorised bursts on 2026-08-06, 2026-08-09 and 2026-08-10. Every one of those
would have been caught by any of the three options below. None of them was caught by anything,
because nothing measured it.

**Today's state, for calibration:** every repo in the estate is at zero unpushed and the portfolio
carries two dirty entries, both from this run. Nothing here fires under any option, which is the
honest baseline to set a threshold from.

## What the numbers do not mean

**uncommitted-age reads mtime, and mtime is a floor rather than the true age.** A file first changed
three weeks ago and touched again this morning reads as fresh. The check therefore under-reports and
never over-reports, which is the right direction for a warn, and it means a low number is safer here
than it looks: it is measuring untouched-and-uncommitted, not merely uncommitted.

**unpushed-age and unpushed-commits are an OR, not an AND.** Either one crossing warns. A single
commit sitting for two weeks is a pile-up and so is forty commits from this afternoon.

**run-report-presence counts commits since the newest dated report**, so it scales with work rather
than with the calendar. A repo with no runs directory at all stays silent, same as the existing
evidence check, so a host that never opted in is never nagged.

## The recommendation, and why it is not obvious

**B, the working week.** The estate's real pattern is weeks rather than days, which argues for C, and
the reason to land under it anyway is what the two thresholds are for. These are warns that a session
reads at start, not gates. A number tuned to the point where the pile-up is already bad tells you
after it is bad; a number at about a working week tells you while it is still one commit and one push
to clear. Five days also cannot fire inside a single day's work in any repo measured above, so it
keeps the one property that matters most: it never cries wolf on a normal day.

The case against B and for C is real and worth stating: the last three pushes were owner-authorised
bursts days apart, so B will warn during the ordinary gap between authorisations, and a warn that
appears because the owner has not yet said push is a warn about the owner rather than about the work.
If that reads as noise from where you sit, C is the right call and nothing in the code changes.
