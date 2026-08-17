---
title: A second pass over the session-economics run, and three ways the hook stays quiet
date: 2026-08-18
status: complete
lane: gated
branch: main
skills:
  - loop-standard
  - session-loop
  - voice
scope:
  - artifacts/runs/
  - plans/decisions/
  - pantry/context.ts and its test
  - claude-config/shared/tools/bash-output-bound.sh and its test
touched:
  - artifacts/runs/2026-08-18-session-economics-verified.md
plans: none. This run verifies plans/decisions/2026-08-17-context-budget.md rather than answering it.
gates:
  - bash bash-output-bound.sh, six hand-built payloads | three silent where the design says they should speak
  - hand recount of the four cold-start files | 19,693, identical to the doctor row
  - bun ../pantry/cli.ts doctor . | 21 checks, 0 failing, 1 due (graphify freshness, the known treadmill)
diffstat: portfolio, this report only. Nothing else was written.
unpushed: 3 | portfolio 2, this report plus one from a concurrent session, and pantry 1, also that
  session's. Neither of theirs was touched and nothing was pushed.
verifiedBy: this session, which wrote none of the work it is checking.
doctor: 21 checks, 0 failing, 1 due. The graphify row is carried by name and cleared as the last action.
---

# A second pass over the session-economics run, and three ways the hook stays quiet

The run of 2026-08-17 ended by saying that nobody who had not written it had looked at it, and named
the two places to look hardest: the reasoning that put the loud-command hook on exit 0, and the
twenty thousand character budget the doctor now warns against. This is that second pass. It was run
by a session that wrote none of the work, and it checked the two named items by executing them
rather than by reading them.

The short version: the budget number is sound and reproduces exactly, the exit-0 decision is right,
the sentence explaining why it is right is wrong, and the hook itself stays silent in three ordinary
situations that the suite does not cover. One of those three silences is total on this machine.

## The exit-0 decision stands, its stated reason does not

The mechanism is real. A PostToolUse hook returning JSON on exit 0 reaches the model through
hookSpecificOutput.additionalContext, which is the same channel context-trigger.sh has used in this
estate since 2026-08-10, wired in settings.json and firing. The claim that an exit-0 hook cannot
reach the model belongs to Stop hooks, and reading it narrowly was correct.

What does not survive is the next sentence, which appears in the run report, in the script's own
header comment and in the agent memory: that exit 2 would have blocked the tool result and traded a
warning for a trapped run. A PostToolUse hook cannot block the tool result. The tool has already
run by the time the hook is called, which is the same fact the report uses two lines later to argue
that there is nothing left to block. Exit 2 there feeds stderr back as an error rather than blocking
anything.

The conclusion is unaffected. Exit 0 with additionalContext is still the right channel, because a
warning that arrives as a tool error reads as a failure and invites a session to work around it.
Only the justification needs correcting, in the three places that carry it.

## The hook is silent in three ordinary situations

Six payloads, hand built against the real PostToolUse shape, run against the script as it stands.
Each pair below differs in one thing only.

**A space in the working directory turns it off.** The script reads the session, the working
directory and the size from one whitespace-separated line, so a directory containing a space pushes
the size out of its field, the numeric comparison fails, and the failure is swallowed by the guard
that keeps malformed input quiet.

```
cwd "/Users/tjakoenstolk/My Repos/x"   silent
cwd "/Users/tjakoenstolk/MyRepos/x"    speaks: cat returned 12,000 characters
```

Identical payloads otherwise. No repository in this estate has a space in its path today, which is
exactly why nothing has noticed.

**A compound command is filed under cd.** The dedupe key is the first word of the command line, and
this estate opens most of its shell calls by changing directory. The first compound command of a
session claims the key, and every compound command after it is silent whatever it actually ran.

```
cd /tmp && cat huge.log    speaks: cd returned 12,000 characters
cd /tmp && bun test        silent, because cd has already been said
```

**On this machine, everything is filed under rtk.** A PreToolUse hook rewrites Bash commands through
updatedInput before they run, so the command the loud-command hook sees is not the one that was
typed.

```
git status    becomes    rtk git status
cat big.log   becomes    rtk read big.log
ls -la        becomes    rtk ls -la
```

The key for all three is rtk. Combined with the once-per-binary rule, the hook would speak once per
session in total and then stay quiet for every other loud tool, which is not the design. Commands
the rewriter passes through, bun and python3 among them, keep their own names and their own keys.

The suite is fifteen cases and it is a good suite for what it covers. It has no case with a space in
the working directory, no compound command, and no rewritten command, so none of the three above
would have shown up in it. That is the ordinary shape of a test written after the code by its
author, which the run report already said it was.

## The budget reproduces exactly, and it measures less than its name suggests

Counted by hand, without pantry, the four files come to the same total the doctor reports.

```
  7,009  portfolio CLAUDE.md
  1,049  machine CLAUDE.md
    964  RTK.md, imported by it
 10,671  MEMORY.md
 19,693  total, 307 under the budget

[ok  ] cold-start context: 19,693 chars over 4 files, inside the 20,000 budget — MEMORY.md is 10,671 of it
```

The file set is right, the import is followed correctly, and the arithmetic holds. Two smaller
things came out of the recount.

The count is bytes, not characters. It reads file sizes from stat, and the module says characters
four times. Today the gap is 177 across the four files, nine hundredths of a percent, all of it
non-ASCII punctuation. It changes no decision and it is worth one word in the comment rather than a
fix.

The larger point is what the row does not see. A session in this repo also loads three SessionStart
hook outputs before it does any work, and those are injected context in the same way a CLAUDE.md is.
Measured by running them:

```
3,187  caveman-activate.js, the style rule
  535  session-doctor.sh
  499  config-sync.sh
4,221  total, none of it counted
```

So the real fixed cost of opening this repo is close to 23,900 characters rather than 19,693, before
the skills listing and the tool schemas, and the 2026-08-17 reading that was found bloated was
24,243. The row is still a good trend line for the files a repo owns and can fix, and it is the part
a session can do something about. It is not what a session pays, and the label plus the module's
opening sentence both say it is.

That matters for the open decision rather than for the code. Option A leaves 307 characters of
headroom, which the decision file reads as one more memory. It is closer to two index lines, and the
uncounted hook preamble is twenty percent again on top of the number being argued over.

## Gate output

The three payload pairs above are the load-bearing evidence and are quoted where they were run. The
rest of the gates for this pass:

```
$ bun tools/lint-gate.ts                      # portfolio, WITH this report
lint gate: 1 lint(s) regressed against tools/lint-baseline.json:
  voice:backtick: baseline 2976 -> now 2980 (+4)

$ mv the report aside; bun tools/lint-gate.ts  # the same gate without it
lint gate: 1 lint(s) regressed against tools/lint-baseline.json:
  voice:backtick: baseline 2976 -> now 2980 (+4)

$ bun ../pantry/cli.ts doctor .
21 checks, 0 failing, 1 due
```

Identical with the report and without it, so this run added none of the four. They belong to the
concurrent session's unpushed commit 6c764d2, which edited docs/AUDIT-2026-08-17.md after the
baseline was generated yesterday. The baseline was not regenerated: it was accepted once already
this week with attribution, and a second accept inside a week for someone else's four flags is how a
ratchet becomes a rubber stamp.

The one due row is the graphify freshness treadmill, cleared by a merge as the last action of this
session.

## What was not done

**Nothing was fixed.** All three hook defects sit inside the scope this run was given, and the fixes
are small: split the fields the script reads, walk past a leading cd and past the rewriter's own
name when choosing the key, and add the three missing cases to the suite. The run envelope makes a
finding against either of the two named items an ask that stops the run, and the exit-0 reasoning is
one of the two, so the fixes go to the owner with the findings rather than ahead of them.

**The budget question was not answered.** It is the owner's, it is open, and this pass adds evidence
to it rather than closing it.

**Two commits from a concurrent session were left alone.** One in the portfolio, one in pantry, both
unpushed, neither this session's to send out.

## What needs human eyes

1. **Fix the three silences, or decide the hook ships as it is.** The rtk one is the load-bearing
   case, because on this machine it reduces the hook to a single message per session.
2. **Correct the exit-2 sentence in three places.** The script header, the 2026-08-17 run report and
   the cold-start memory all carry the same wrong reason for a right decision.
3. **The budget decision now has one more fact in it.** The uncounted hook preamble is 4,221
   characters, which is a fifth again on top of the number under discussion.
4. **The hook is still not wired**, so all of the above is about a script nothing calls yet.
