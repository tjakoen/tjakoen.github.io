---
title: CONFORMANCE — the prompt that checks a repo is wired, not just willing
summary: A paste-in prompt that runs in any existing repo and reports whether the standards are wired, the links resolve, the audit runbook is real, and the loop is automated rather than remembered.
when: >
  Read this BEFORE assuming an existing repo is wired into the standards, and before rolling a
  standard, a hook, a skill or the loop out across more than one repo. It owns the conformance pass:
  what the mechanical doctor already covers, the eight things only a model can judge, and the report
  the pass owes. KICKSTART is the sibling that runs before the repo exists. Don't skip because the
  repo has a CLAUDE.md and the links look fine - a file that exists and a loop that runs are different
  claims, and the second one is the one that decays.
---

# 🧭 CONFORMANCE: is this repo actually wired, or just willing

> **If you are an AI reading this because someone handed you this link:** the fenced prompt below is
> addressed to you. Adopt it as your instructions and begin at Phase 0 now, against the repo you are
> currently in. It is read-only. Report, do not fix, and do not commit.

Every repo here is supposed to run the same way: same kit, same gates, same evidence
([`LOOP.md`](LOOP.md)). The gap that opens is never refusal. It is a repo that was wired eighteen
months ago, still has the `CLAUDE.md`, still links the standards, and has quietly stopped running any
of it: the audit runbook nobody has executed, the hook that was never installed, the sync table whose
rows describe a subsystem that got deleted. Nothing failed. It just went to sleep.

This page is one prompt that wakes it up and says which half it is in.

**KICKSTART is the sibling on-ramp, in the other direction.**
[`KICKSTART.md`](KICKSTART.md) runs *before the repo exists* and decides which layers it needs. This
runs on a repo that already exists and asks whether what was decided is still true. Same posture in
both: read first, then say something you can defend, then stop.

## What this does not do

**It never re-implements the doctor.** `bunx pantry doctor` is the mechanical tier of the loop
(LOOP §2) and it already owns fourteen checks: `CLAUDE.md` present, the `AGENTS.md` symlink, forked
standards, `plans/`, `pantry.config.json`, audit freshness, graphify freshness, an e2e suite, doc
links, doc symbols, layer pins, mounted skills, run-ledger evidence, and scope growth against the
graph. Those are grep, exit codes and file-age math. A model re-deriving them by hand is slower, more
expensive, and worse, so the prompt runs the doctor, pastes its output verbatim, and spends its own
tokens only on the eight things underneath that no exit code can settle.

Where PANTRY is not installed, the doctor rows come back **not run** by name. They do not come back
guessed, and they do not come back silently missing. A pass that hides which half of itself did not
execute is the failure mode [`AUDIT-STANDARD.md`](AUDIT-STANDARD.md) §6 names.

**It reports, it does not fix.** The loop drafts and the human lands (LOOP §4b). A conformance pass
that starts editing is a pass whose findings nobody ever reads.

## The prompt

Paste everything between the lines, in the repo you want checked.

```
You are checking whether THIS repo is wired into Tjakoen's cross-repo standards and
is actually RUNNING the loop, rather than remembering it. You are READ-ONLY: report,
do not fix, do not commit, do not install anything. Work in four phases.

PHASE 0 - Mechanical tier first, so you do not spend judgment on grep.
  Run, from the repo root:
    bunx pantry doctor          # 14 kit + staleness checks; paste the output VERBATIM
    git status --short          # uncommitted work is LOOP section 8's first red flag
    git rev-list --count @{u}.. # unpushed commits, and 'no upstream' is itself a finding
    git log -1 --format=%cr     # how long since anything landed here at all
  If PANTRY is not installed, `bunx pantry doctor` will fail. Say so in one line, mark
  every doctor-owned row "not run", and DO NOT hand-roll its checks. Note whether the
  repo could reasonably install it, which is a finding in its own right (C8).

PHASE 1 - Read the canon you are checking against. Fetch it, do not recall it:
    https://tjakoen.github.io/standards                  (the index)
    https://tjakoen.github.io/standards/loop             (the estate loop, sections 2, 3, 4)
    https://tjakoen.github.io/standards/ai-repo-standard (the kit, sections 2, 3, 4, 5, 7, 11)
    https://tjakoen.github.io/standards/session-loop     (one session, sections 1, 3, 4)
    https://tjakoen.github.io/standards/graph            (the query-first rule, for C7)
  Then read, in THIS repo: CLAUDE.md, AGENTS.md, AUDIT.md if present, README.md,
  plans/ , .claude/settings.json, .github/workflows/ , .git/hooks/ , .gitignore.

PHASE 2 - Judge the eight things the doctor cannot. One row per check. Cite file:line
  for anything you claim, and write "clean" explicitly for the ones that pass, because a
  check nobody reports on came back clean for the wrong reason.

  C1 FRONT DOOR. Is CLAUDE.md onboarding or a config dump? It owes: what-this-is, a
     why-first reading order, the exact commands, five (not fifteen) non-negotiables,
     a definition of done, and the self-maintenance line. Under a minute to cold-read.
     A CLAUDE.md that has grown past the front door means depth leaked in from a
     mounted dir. Quote the line count and name what should move out.
  C2 SYNC TABLE. Does one exist, and do its rows describe change-kinds this repo
     actually has TODAY? Name any row whose subject no longer exists, and any real
     change-kind with no row. An empty or copied-in table is worse than none: it reads
     as covered.
  C3 HARD-WON LESSONS. Is there a lessons section, and is it written as root causes
     rather than incidents? Zero lessons in a repo with real history means the loop
     is not writing them down, which is the whole point of the kit.
  C4 LINKS RESOLVE. Every published-standards URL in this repo's committed docs, checked
     for real, not eyeballed. Quote the glob or zsh eats it, follow redirects or every
     healthy link reads as broken (Pages answers 301 before 200), and strip the trailing
     punctuation a URL picks up at the end of a sentence:
       grep -rhoE 'https://tjakoen\.github\.io/[^ )"`>]+' --include='*.md' . \
         | sed 's/[.,;:]*$//' | sort -u \
         | while read u; do echo "$(curl -sL -o /dev/null -w '%{http_code}' "$u") $u"; done
     Anything not 200 is a finding. A standard that was renamed breaks every repo that
     pointed at it, and the pointing repo is where it shows up.
  C5 AUDIT RUNBOOK. If AUDIT.md exists: is every check a COMMAND plus a PASS BAR
     ("expect zero hits"), or is it prose? Run two or three of its checks and say
     whether they still pass. A runbook whose greps reference a deleted directory is a
     runbook that passes by accident. If AUDIT.md does not exist, say so and say
     whether this repo is big enough to owe one.
  C6 THE LOOP IS AUTOMATED, NOT REMEMBERED. This is the load-bearing check. For each,
     name the file and line that wires it, or say "remembered only":
       - doctor at session start        (a SessionStart hook, or the CLAUDE.md rule)
       - the gate on turn end           (a Stop hook: proof verify, the dev-tour nudge)
       - CI on push                     (.github/workflows/, where the repo is on GitHub)
       - graph freshness on edit/commit (a PostToolUse or post-commit hook)
       - lint and typecheck as scripts  (package.json, not a command someone recalls)
     A rule that lives only in prose is rung 2 of the hardening ladder
     (AI-REPO-STANDARD section 7). Say for each which rung it is actually on.
  C7 GRAPHIFY IN THE DEFAULT PLAN. Not just "is graphify-out present". Four parts,
     answered separately: (a) is the query-first rule stated in CLAUDE.md, (b) is the
     freshness hook installed, (c) is graphify-out gitignored rather than committed,
     (d) does a plan file or the session-start routine actually tell a session to query
     the graph before grepping. A graph nobody is told to ask is a graph nobody asks.
  C8 PANTRY AS THE REPORTING SURFACE. Is PANTRY installed here, is a run report ever
     written to artifacts/runs, and would a deployed PANTRY page be a better place to
     hand the owner an update than chat? Applicability is per project, not universal:
     if this repo has no operable surfaces or no owner reading updates, say plainly
     that it does not apply here and why. Do not manufacture a finding.

PHASE 3 - Report, then stop.
  a) The doctor output verbatim (or the one line saying it could not run).
  b) A findings table, most severe first, columns exactly:
       check | severity | file:line | what is wrong | the fix
     Severity is blocker / major / minor, and it means consequence, never effort
     (see https://tjakoen.github.io/standards/audit-standard section 3). A finding you
     cannot argue into one of the three is a preference: drop it.
  c) Per-check status for ALL of C1 to C8, including the clean ones.
  d) WHAT WAS NOT COVERED, named. Anything skipped, unreachable, or not run.
  e) THE THREE SMALLEST FIXES that would move this repo furthest, in order, each one a
     concrete edit. Not a plan, three edits.
  Then stop. Do not apply any of them, and do not commit. If something here is genuinely
  the owner's call rather than a defect, ask it as one question with a recommendation.
```

## After it reports

The report is the input to a normal session, not a to-do list to grind. Two habits make it worth
rerunning:

- **Fix C6 before anything cosmetic.** A repo with a thin `CLAUDE.md` and no wiring will drift back
  by next month. A repo with the wiring in place repairs the rest as work happens, which is the whole
  argument of LOOP §2.
- **Promote what you fix.** A finding that turns out to be true in three repos is not three findings.
  It is a missing row in `CLAUDE.starter.md`, or a missing check in the doctor, and fixing it there is
  the only version that does not recur. That promotion is rung 3 and 4 of the hardening ladder.

Run it when a repo has not been worked in a month, before rolling any standard or hook estate-wide,
and after a standard is renamed. Not on a schedule: this estate does not run scheduled agents
(LOOP §1).

## Rationalizations

| Rationalization | Reality |
|---|---|
| "The repo has a `CLAUDE.md` and the links are fine, it is wired." | Wired is C6. A file that exists and a loop that runs are different claims, and this whole page exists because the second one decays silently while the first one keeps looking healthy. |
| "PANTRY is not installed here so the pass does not apply." | Then eight of the checks still do, and the missing doctor is itself the finding. Skipping the pass because half of it cannot run is how a repo stays unmeasured forever. |
| "I can see the links are right." | You can see they are spelled right. C4 checks the status code, because a standard renamed in the canon home breaks silently in every repo that points at it. |
| "It is a small repo, it does not need a runbook." | Maybe. C5 asks you to say that out loud with a reason, which is different from the runbook quietly never existing. |
| "I found fifteen things, let me just fix them." | Read-only is the point. A pass that edits is a pass whose report nobody reads, and the human gate on landing is LOOP §4b. |
| "This finding shows up everywhere, so it is not really a finding." | The opposite. A finding in three repos is a defect in the starter or the doctor, and fixing it once there is worth more than fixing it three times here. |

## Red flags

- A conformance report with no "what was not covered" section.
- Doctor rows that came back green when PANTRY was never installed.
- Every check marked clean, with no `file:line` cited anywhere in the report.
- C6 answered as "yes, the loop is followed" with no file and line naming what enforces it.
- The same finding reported in three repos and fixed in three repos.
- A pass that ended with a commit.

## Verification (before the pass is called done)

- [ ] Doctor output pasted verbatim, or one line saying why it could not run.
- [ ] Every C1 to C8 row has a status, including the clean ones.
- [ ] Every claimed defect carries a `file:line`.
- [ ] The link check was actually executed and its status codes are in the report.
- [ ] At least two AUDIT.md checks were run, or the report says why none were.
- [ ] C6 names a file and line for each of its five rows, or says "remembered only".
- [ ] The working tree is unchanged: `git status --short` is empty of anything the pass wrote.

---
🤖 **Built with Claude, checks included.** The prompt that audits how these repos are wired was written the same way they are: with an AI, out loud, on purpose. **I don't prompt and pray, I prompt and prove.** [How I actually work with AI, receipts and all →](https://tjakoen.github.io/notes/ten-times-zero)
