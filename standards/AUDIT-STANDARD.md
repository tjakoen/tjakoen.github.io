---
title: AUDIT-STANDARD.md — how a repo gets audited
summary: The whole-repo audit - the nine dimensions it looks at, the severity words, the subagent fan-out that runs it, and the report it owes.
when: >
  Read this BEFORE running an audit, a full pass, a health check, a quality sweep, or a "is this
  codebase any good" review, and before writing or editing a repo's AUDIT.md. It owns the rubric (the
  nine dimensions), the severity vocabulary, the parallel subagent fan-out, and the report artifact.
  AI-REPO-STANDARD owns the per-repo runbook file; this owns what a real audit actually looks at.
  Don't skip because you already read the code - one reader going file by file is the exact failure
  mode the fan-out exists to fix, and a finding without a file:line is an opinion.
---

# How a repo gets audited

An audit is the pass where a repo is judged as a whole, against the bar it claims to hold itself to.
It is not a code review. A review reads a diff and asks "should this land". An audit reads the repo
and asks "is this still what we said it was". Different question, different cadence, different
artifact.

> Split of responsibility. **[`AI-DEVELOPMENT.md`](AI-DEVELOPMENT.md) defines the bar** (§3 standards,
> §4 conventions, §5 pitfalls, §8 the gate checklist). **[`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md)
> §5 owns the per-repo `AUDIT.md`**, the committed runbook of that repo's own mechanical checks.
> **This file owns the audit itself**: what gets looked at, how severe a finding is, how the work is
> fanned out, and what the report has to contain. When a check here and a repo's canon disagree, the
> canon wins and this pass files a finding against the check.

---

## 1. The two halves

Every audit has both. Running one and calling it done is the most common way an audit lies.

**Alignment.** Does the repo still obey its own written rules? Layering, vocabulary, the "change X so
update Y" table, the capability list, the doc that describes the behavior. This half is mostly
mechanical: greps with pass bars, and it belongs in the repo's own `AUDIT.md` because the rules are
repo-specific. AI-REPO-STANDARD §5 is the shape of that file.

**Quality.** Is the code good, independent of whether it matches the docs? A repo can be perfectly
aligned with a badly written rulebook. This half is the rubric in §2, and it is the same everywhere,
which is why it lives here and not in any one repo.

---

## 2. The rubric (the nine dimensions)

Hunt each one explicitly. A dimension nobody looked for is a dimension that came back clean for the
wrong reason, so an audit report says "clean" per dimension rather than staying silent.

| # | Dimension | What is actually being hunted |
|---|---|---|
| 1 | **Clean code** | Oversized files and functions, dead code, unreachable branches, deep nesting, names that need a comment to survive. |
| 2 | **DRY and atomicity** | The same logic in two places (both `file:line` named, or it is not a finding), a function doing three jobs, a module with no single reason to change. |
| 3 | **Design-system use** | Hardcoded colors, spacing, sizes, fonts where a token exists. Hand-rolled markup where a component exists. A token defined and never consumed. The machine-operable vocabulary spelled as a magic string instead of read from the registry. |
| 4 | **Efficiency** | Work repeated per request that could be computed once, synchronous filesystem calls in a request path, re-parsing the same content, a regex built inside a loop, a linear scan that should be an index, an unbounded loop. |
| 5 | **Error handling** | Empty or swallowing catch blocks, unawaited promises, `JSON.parse` with no guard, a response used without a status check, and above all the **silent no-op**: a contract that quietly does nothing looks identical to success from the outside. No-op and report, always (AI-DEVELOPMENT §5). |
| 6 | **Input validation** | Garbage in, garbage out is a design choice, not an excuse. Every trust boundary (CLI args, HTTP body, config read from another repo, model output) validates, and says so when it rejects. |
| 7 | **Types** | `any`, `as` casts, non-null `!`, `@ts-ignore`, missing return types on exported functions, stringly-typed values that want to be a union. Each one is a place the compiler was told to stop helping. |
| 8 | **Tests** | Coverage of exported behavior, and more importantly whether a test would fail if the feature were deleted. A UI test that asserts a 200 and a visible container sees nothing. §5 of this file is the bar. |
| 9 | **Readability** | Missing or misleading file-header comment, comment density that does not match its neighbours, a comment that contradicts the code it sits above. New code should read like it was always there (AI-DEVELOPMENT §3). |

**Lint is a gate, not a dimension.** Unused variables, shadowing, loose equality and floating
promises are not worth a human reading for. If a repo has no lint gate, that itself is one finding
against the repo, filed once, and the fix is to add the gate rather than to list what it would have
caught. The estate uses oxlint for this: fast, close to zero config, no plugin sprawl.

---

## 3. Severity

Three words, and they mean consequence, never effort. A one-character fix can be a blocker.

- **blocker.** It is wrong now, or it silently hides being wrong. Data loss, an unguarded write, a
  contract that fails quiet, a check that passes when it could not run. Fix before anything else
  lands.
- **major.** It will cause a bug or a wasted afternoon soon. A duplicated rule that will drift, a
  missing validation at a real boundary, an untested exported path, a 1600 line file nobody can hold
  in their head.
- **minor.** True, worth fixing, costs nothing to defer. Naming, a stale comment, a type that could
  be tighter.

If a finding cannot be argued into one of the three, it is a preference and does not belong in the
report.

---

## 4. The fan-out (run it in parallel, read-only)

One reader going file by file is slow, and worse, it gets tired in a predictable order: the last
directory always gets the thinnest pass. Audits are the ideal shape for parallel subagents, because
the scopes are genuinely independent and the output is small relative to the reading.

The shape that works:

1. **Carve by bounded scope, not by dimension.** One agent per repo, or per subsystem when a repo is
   large enough that one agent would skim. Overlapping scopes waste tokens and produce duplicate
   findings that then have to be merged by hand.
2. **Every auditor is read-only, and told so in the prompt.** Parallel agents editing the same tree
   is how an audit turns into a merge conflict. Findings first, fixes second, always.
3. **Hand each agent the whole rubric, not a slice of it.** An agent given only "check types" will
   report only type findings, including in the file where the real problem was a swallowed error.
4. **Demand `file:line` on every finding, and say that speculation is not wanted.** This is the one
   instruction that separates an audit from a plausible essay. Make it show, not assert
   (AI-DEVELOPMENT §5).
5. **Fix the output format in the prompt.** A table with the same columns from every agent merges for
   free. Prose from six agents has to be re-read and re-typed.
6. **Ask for a MECHANICAL section.** The subset of findings that are safe to apply with no judgment
   call, ideally as exact old string to new string. That section is what the fix wave consumes.

Model tier for the auditors follows [`SESSION-LOOP.md`](SESSION-LOOP.md) §6 and §7: the reading is
wide but the judgment is real, so auditors sit on the mid tier, and the synthesis that ranks and
de-duplicates their output stays on the strong one.

**Where the barrier is.** Findings from all agents are collected before fixing starts, because
de-duplication needs the full set: the same duplicated helper will be reported by both agents that
own one of its two homes.

---

## 5. Tests get audited, not trusted

A green suite is evidence of nothing until someone checks what it asserts. The questions that
actually find the holes:

- **Would this test fail if the feature were deleted?** If not, it is decoration. Name the offenders
  concretely, as "delete X and this still passes".
- **Does a UI test see anything?** Asserting a 200, or that a container is visible, verifies that the
  server did not crash. For a change a person can look at, the test asserts rendered text, computed
  style, or layout, or it is not testing the change.
- **Is it at the right tier?** Behavior driven through a browser that a unit test could pin is slow
  and fragile for no gain. The reverse is also a finding.
- **What is flaky by construction?** Hardcoded sleeps, ordering dependence, a live network call, a
  fixed port.
- **What has no test at all?** A plain list of production files, per repo. Boring, and the highest
  value output of the whole dimension.

---

## 6. The report

The audit's artifact. Dated, committed, and written so the next reader can act without rerunning it.

- **A findings table**, most severe first: `file:line`, severity, dimension, problem, fix. One row
  per finding, no prose paragraphs standing in for rows.
- **Per-dimension status**, including the clean ones. Silence is not a pass.
- **The gate output verbatim**, not a summary of it. "Tests pass" is a claim; the last lines of the
  run are evidence.
- **What was not covered**, named. A scope that was skipped, a repo left out, a suite that was not
  run. An audit that hides its own gaps is worse than a smaller audit that admits them.
- **Done means** every finding fixed, or explicitly flagged as deferred and accepted with a reason.
  An open finding with no decision attached is an unfinished audit.

The report is a dated snapshot, so keep the old ones. The diff between two audits is the only honest
measure of whether the repo is getting better.

---

## 7. Fixing

- **The gate comes first.** Typecheck, lint, unit tests, end-to-end. An audit run against a red gate
  measures nothing, because the first finding is the red gate.
- **Mechanical fixes land in the same session**, in one wave, after all findings are in. They are the
  ones with no judgment call: an unused import, a missing return type, a swallowed error that clearly
  wanted a rethrow.
- **Judgment calls get reported, not applied.** A decomposition, a renamed public export, a changed
  contract. Those are the human's, and they usually want a plan rather than a patch.
- **Close the class, not the instance.** Every finding worth fixing gets one question after it: could
  this have been made impossible? Promote the rule up the hardening ladder (AI-REPO-STANDARD §7) as
  far as it will go. A finding that recurs in two consecutive audits is a missing gate, not a
  careless session.
- **A rendered fix owes a tour** ([`TOUR-STANDARD.md`](TOUR-STANDARD.md)), same as any other change a
  person can look at.

---

## 8. When to run one

| Trigger | Depth |
|---|---|
| A subsystem got substantially rewritten | That subsystem, full rubric. |
| Before a release, or before pointing anyone public at the repo | Full pass, strongest model, all repos in the estate that ship. |
| The heartbeat says the audit is overdue ([`LOOP.md`](LOOP.md) §2) | Full pass. The staleness flag exists because this is the chore that gets skipped. |
| The same bug class showed up twice | Targeted: that dimension, every repo. The second occurrence is the signal. |
| A new dimension got added to this rubric | Every repo, that dimension only. |

---

## 9. Rationalizations

| The excuse | Why it does not hold |
|---|---|
| "I wrote this code, I know what is in it." | You know what you intended. The audit reads what is there. Those diverge silently, which is the entire point. |
| "The tests are green." | Green measures the tests, not the code. §5 exists because a suite can be green and blind at the same time. |
| "It is a small repo." | Small repos are where the unguarded write and the swallowed error live longest, because nobody ever felt the need to look. |
| "I will note the findings and fix them later." | An unfixed finding with no deferral decision attached is how a report becomes a list nobody reads. Fix it or flag it, in this session. |
| "One agent can just read the whole thing." | It can, and the last directory gets the thinnest pass every time. The fan-out is not about speed, it is about even attention. |
| "This finding is subjective." | Then it is not a finding. Argue it into blocker, major, or minor, or drop it. |

---

## 10. Red flags

- A findings table with no `file:line` anywhere in it.
- A report where every dimension came back clean, and none of them say how they were checked.
- A "MECHANICAL" section that quietly contains a rename of a public export.
- The same finding present in the previous audit, unflagged, with no gate added.
- An audit run before the gate was green.
- A subagent that returned prose instead of the table it was given.

---

## 11. Verification (before an audit is called done)

- [ ] Gate output pasted verbatim: typecheck, lint, unit, end-to-end.
- [ ] All nine dimensions have a status line, including the clean ones.
- [ ] Every finding carries a real `file:line` and one of the three severity words.
- [ ] Every finding is fixed, or flagged as deferred with a reason.
- [ ] Mechanical fixes applied in one wave, diff read before it landed.
- [ ] At least one finding asked "could this class have been designed out", and the answer landed
      somewhere durable (a gate, a type, a test, the repo's `AUDIT.md`).
- [ ] Scope gaps named in the report.
- [ ] Report committed with its date.

---

*Living document. When the rubric changes, every repo owes that dimension a pass, and this file says
so in §8.*
