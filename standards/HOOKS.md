---
title: HOOKS.md — the gates that fire before you do
summary: The three machine-level hooks that enforce parts of the loop on every session in every repo - what each one fires on, what it does, what it deliberately cannot do, and how to turn it off.
when: >
  Read this BEFORE trusting that a rule in LOOP or SESSION-LOOP is enforced rather than merely
  written, before a session-start report or a blocked write surprises you, and before adding,
  editing or switching off anything under the machine's tools directory. It owns the machinery:
  which event each hook fires on, the limits that are deliberate, and the off switch for each one.
  Don't skip because you have read LOOP - LOOP says what the rules are, and this says which three of
  them a machine actually stops you over.
---

# The gates that fire before you do

A standard is a sentence until something enforces it. On this machine three hooks turn three rules
from [LOOP.md](LOOP.md) into machinery: the doctor that reads a repo before the first prompt, the
guard that refuses a write to an irreversible path, and the check that refuses a spawn carrying no
run envelope. They fire in every session, in every repo, whether or not the session has read
anything. This file is the description of them that is not their own source code.

> Split of responsibility: **[LOOP.md](LOOP.md) owns the rules** (the mechanical tier in section 2,
> the lanes and the envelope in section 4b) and **[SESSION-LOOP.md](SESSION-LOOP.md) owns the inside
> of a session** (section 5 owns the handoff and the hook behind it). This file owns one narrow thing
> neither of them describes: *the machinery that enforces some of those rules, and the shape of the
> holes in it.* Where they disagree with this file about a rule, they win. This file wins only on
> what the code on the machine actually does.

**The architecture in one line:** each hook is a small shell script that reads the harness event on
standard input, decides in a few milliseconds, and either exits 0 and says nothing or exits with the
one status that stops the call. Nothing here calls a model, nothing here costs tokens, and nothing
here fixes anything by itself.

---

## 1. Where they live, and how a machine gets them

The scripts live in a private config repo, under shared/tools. The machine's own tools directory is
a symlink to it, so an edit in either place is the same edit and shows up in git immediately.

Settings are the exception. The per-machine settings file is **copied, not linked**, because the
harness rewrites it in place when permissions change, and a rewrite replaces the file rather than
following a symlink. The live file and the committed one are two files that drift, and
link-machine.sh reconciles them in either direction.

Two consequences worth knowing before you go looking for a wire:

- **The committed settings are not proof of what is running.** Read the live file on the machine to
  find out what fires today. A script's own header comment is not proof either: see section 4.
- **A session cannot switch one of these off.** The live settings file matches a path rule in
  section 3 below, so an agent editing it is blocked by one of the very hooks it would be
  unwiring. That is deliberate, and it is why every off switch in this file is described as the
  owner's act.

| Hook | Event | Matches | What it can do |
|---|---|---|---|
| session-doctor.sh | SessionStart | every session | Print. Always exits 0. |
| human-lane.sh | PreToolUse | the write tools | Block the write, with a reason. |
| spawn-envelope.sh | PreToolUse | spawn and follow-up prompt tools | Block the spawn, naming what is missing. |

**More than three hooks are wired here, and this file covers three.** The others are housekeeping
and turn-end readouts: a config drift check at session start, a skill refresh, the token proxy in
front of the shell tool, the turn-end gate and session guard on Stop, and the context trigger on
PostToolUse that carries the handoff. The last of those belongs to
[SESSION-LOOP.md](SESSION-LOOP.md) section 5 and is not repeated here. The three below are the ones
that decide whether work proceeds, which is why they earn a standard and a shell alias does not.

Section 4b is the exception to that split. The three output gates decide nothing and only print, so
by the rule above they would be housekeeping. They are here because they were built from a
measurement rather than an intuition, and because the way the first one misread its own payload is a
lesson about gates in general rather than about those three scripts.

---

## 2. session-doctor.sh, at session start

**Fires on:** SessionStart, in whatever directory the session opened.

**What it does.** Resolves the PANTRY command, runs the doctor against the repo, and prints the rows
that mean something: warnings, failures, any check that came back not run, and the summary count. The
passing rows are dropped on purpose. Twenty green lines at every session start in every repo is how a
check becomes furniture, and the count at the end is the confirmation that the rest of it ran.

A not-run row survives that filter deliberately. A checker that hides which half of itself did not
execute is the failure [AUDIT-STANDARD.md](AUDIT-STANDARD.md) names, and reading "0 failing" as all
clear while four checks never executed is exactly the mistake it exists to stop.

**What it cannot do.** It never fixes anything and it always exits 0, so it cannot stop a session from
ignoring what it printed. It only speaks in a repo carrying a CLAUDE.md or a PANTRY config, and exits
silently everywhere else, because a machine-level hook runs in every scratch clone a session is ever
opened in. It has no opinion about whether a flag is important. It surfaces; the session decides.

**The reach bug, because the shape of it recurs.** The command was resolved through three rungs, all
relative to the repo the session opened. In practice that meant only repos sitting beside the PANTRY
clone ever got a reading. Everywhere else the hook printed its own not-run message and exited, at
every session start, for six weeks. Four repos were affected and the usage numbers that resulted read
like a verdict on the people using the loop rather than a broken path. An absolute fourth rung fixed
it in commit 797a67a, placed last so a repo carrying its own copy still wins.

The lesson is not about path resolution. **A gate that fails quietly produces evidence of the wrong
thing**, and the evidence looks like an answer for as long as nobody runs the check by hand.

**How to turn it off.**

- One repo: it already excuses itself where there is no kit file and no bun.
- One tree: set AGENT_EXCLUDE_PREFIX, which every path-aware hook here honours.
- A different layout: set PANTRY_CLI to point at the command somewhere else.
- Entirely: remove the SessionStart entry from the machine settings, which is the owner's edit.

---

## 3. human-lane.sh, before a write

**Fires on:** PreToolUse, on the file-writing tools.

**What it does.** Reads the path the tool is about to write and matches it against the human-lane list
from [LOOP.md](LOOP.md) section 4b: CI and workflow files, migrations and SQL, auth, anything named
for a permission, a secret or a credential, billing and payment paths, deploy surface. Three entries
are not in section 4b's printed list and are here because they are the machinery of the check itself:
the permission settings, this script, and its own approval file. A guard a session can edit is a guard
a session can remove, and the failure would look exactly like the guard passing.

Package manifests are a special case that section 4b anticipates. The file is ordinary and three of its
fields are not, so the payload is decoded and only an edit whose text touches the version, publish
config or exports field is stopped. A script or a dependency edit passes. Blocking every manifest edit
would put every dependency bump in the human lane, which is the blunt instrument section 4b opens by
naming.

**Blocking is rare here, and this was the first of it.** Every gate in this estate exits 0 except the
two PreToolUse denials in this file, and that default is sound: a gate that fails a turn over a soft
signal gets removed within the week. A path on this list is not a soft signal. It is a rule LOOP
already states as absolute, so blocking makes the mechanism match the prose instead of adding a
constraint of its own. When this hook was written on 2026-08-13 it was the only teeth in the estate;
section 4 is the second set, added a week later, and the bar for a third is the same argument.

**The escape hatch is a file the owner writes.** A file in the machine's config directory holds one
extended regular expression per line, and a path matching one is allowed through. The file is itself
in the blocked list, so a session cannot approve its own way past the guard. Writing a line in it is
the human deciding before anything is written, which is what section 4b asks for, and it leaves a
record of what was approved. **It was first written on 2026-08-21**, carrying one anchored pattern
for the settings file so the output gates in section 4b could be wired. Every other listed path
still blocks, and the guard, the settings-local variant and the approval file itself stay protected.

That first use is worth reading as the shape the hatch was built for rather than as a weakening of
it. A session proposed the change, hit the block, and stopped. The owner wrote the line. The session
then made the edit and watched it work. Three acts, three different hands on them, and a line in a
file saying what was approved and when.

One fragility in that hatch, named rather than fixed: the approval file is read *before* the rules
that protect the guard and the hatch itself, so a pattern broad enough to match everything would
unprotect both. The self-protection holds exactly as far as the owner writes narrow patterns. Write
the path, not a wildcard.

**What it cannot do, and this is known rather than discovered.**

- **The shell tool.** A shell command writes anywhere, and parsing shell to find out where is a losing
  game. This hook never sees it.
- **Deletions under the content directory**, which section 4b also lists. A delete happens through the
  shell, so it falls in the gap above.
- **Anything that is not a write.** It never sees a read.

Routing around the block with a shell command is the rationalization [LOOP.md](LOOP.md) section 7
exists to name. The gap is real, it is written in the script itself, and using it deliberately is a
different act from tripping over it.

**How to turn it off.**

- One path, permanently: the owner adds a regular expression to the approval file.
- One tree: AGENT_EXCLUDE_PREFIX.
- Entirely: remove the write-tool matcher from the machine settings.

---

## 4. spawn-envelope.sh, before a spawn

**Fires on:** PreToolUse on the tools that start a session or send an unsolicited prompt to a running
one. The match is anchored on the harness prefix and the exact tool name rather than on a suffix,
because a suffix match also catches any tool whose name happens to end in those letters. Wired
2026-08-20.

**What it does.** Reads the prompt the tool was handed and checks it carries the four headings LOOP
section 4b names: the lane, the scope cap, the hard stops, the ask-triggers. If any is absent the call
is denied with exit 2, which is the only PreToolUse status that stops a tool call, and the message
names the missing part rather than saying no. Matching is anchored to the start of a line, because
these are headings: a prompt that uses the words in a sentence has not declared anything.

**Why it exists at all.** A successor inherits the task automatically and inherits nothing else, so an
envelope left unsaid is one the chain loses on its first hop. The handoff command used to end in a
block a human pasted, and that paste was an accidental review. Since the command began opening the
successor itself, that review is gone and envelope-less spawns get likelier rather than rarer.

**The short-follow-up exemption**, which is the part most likely to be met in anger. The follow-up tool
does two unrelated jobs through one name. It hands a child new work, which is a handoff and owes an
envelope, and it nudges a child already running, which is a sentence and owes nothing. Nothing in the
payload tells the two apart, so a prompt under a character threshold is let through on that tool only.
The threshold is a guess with a margin rather than a measurement, and an environment variable
overrides it. **A spawn is never exempt at any length**, because a spawn always starts a session on a
task. Answering a child's question is a different tool and was never matched.

The cost of the exemption, stated rather than left to be found: a genuine task that fits under the
threshold passes unjudged.

**What it cannot do.**

- **Judge whether the envelope is any good.** See section 5. This is a presence check and nothing more.
- **Enforce that an ask stops the run.** That is not hookable at all: no event fires when a session
  asks a question, and the event that could is the one that cannot reach a model. See section 5.

**Deliberately absent:** denying a push or a publish. The hook cannot tell the owner's push from a
run's, and a gate that blocks the owner is a gate about to be switched off.

**Wired on one machine, and the script used to disagree.** The other machine here carries its own
settings copy and does not run this check, because it cannot be tested from where the decision was
made. Writing this standard also caught the script's own header still saying NOT WIRED a day after
the wire went in, which is now corrected in place with the mistake left visible rather than erased. A
comment written at build time and a wire added later is the ordinary way a file starts lying about
itself, and it is the reason this file tells a reader to check the settings rather than the banner.

**How to turn it off.**

- The follow-up half: raise the threshold environment variable until nothing reaches it.
- Entirely: remove the matcher entry from the machine settings.
- There is no per-repo exclusion, on purpose. A spawn is not a path, so there is nothing to exclude
  against.

---

## 4b. The output gates

**Fires on:** PostToolUse. Three scripts, wired 2026-08-21: bash-output-bound.sh at a 4,000
character bound, tool-output-bound.sh, and code-discovery.sh.

**What they do.** The first two say once, per command or per tool per session, that something
returned more characters than a bound. The third says once per session that a repo carrying a code
graph has been searched four times without one being queried. All three exit 0 and speak through the
additional-context channel described in section 5, so none of them can stop anything, and each says
so in its own message: a PostToolUse hook cannot save the call it fires on, only the next one.

**Why they are a group rather than three notes.** They were built from one measurement rather than
three hunches. token-burn.ts in the same directory attributes every character in a transcript to the
tool call, the reply or the image that put it there, and run across twelve sessions in the portfolio
it put the shell at roughly sixty percent of everything carried, the session-listing tools at ten,
and the assistant's own replies at five. The compression rule installed on this machine, restated on
every turn, governs that last slice. Two of these gates aim at the first two numbers. The third aims
at three percent and says so in its header, because what a graph query buys is a bounded answer
rather than a smaller one, and a gate that overstated itself would be muted within the week.

**The bound is the whole design question.** Set too high a gate never fires and reads as coverage;
set too low it becomes furniture. Both output gates take an environment variable, and both were
retuned from measured averages rather than round numbers.

**What they cannot do.** Nothing about images, deliberately. A screenshot arrives as several hundred
thousand characters of base64 and is billed by pixel area instead, so any bound counting characters
fires on every screenshot ever taken while telling the session something false. Both output gates
skip an image result rather than judging it.

**Measure what reaches the model, not what the payload contains, and this cost a false positive to
learn.** Within minutes of being wired, tool-output-bound.sh reported an ordinary edit at 23,626
characters. What an edit returns to the conversation is a one-line confirmation near 160. The rest,
the file's prior contents above all, is bookkeeping the harness keeps for undo and never puts in
context. The first version summed every field of the response. **A gate that nags about characters
nobody is paying for is worse than no gate**, because the advice cannot be followed and the session
correctly learns to ignore it. The fields are now named and skipped, with the case in the suite.

That defect was invisible to eleven passing tests and surfaced on the first real firing, which is
section 5's last lesson arriving on schedule: a gate nobody has watched fire has not been tested, it
has been described.

**How to turn them off.** Three levels, per section 6. The bounds move with BASH_OUTPUT_MAX and
TOOL_OUTPUT_MAX, the sweep threshold with CODE_DISCOVERY_SWEEP, and all three honour the exclusion
prefix. Unwiring is removing the entry from the machine settings, which is the owner's act.

---

## 5. Three limits that cost something to learn

None of these are guessable from the harness documentation, and each was found by building the wrong
thing first.

**A Stop hook at exit 0 addresses a reader who cannot act.** Its output lands in the transcript as an
attachment on the session's last line, where the model has already stopped. Measured from both ends on
2026-08-10: the text arrived in the transcript and never appeared in the next turn's context. Exit 2 is
the only other path and it blocks the stop, which can trap an unattended run in a loop it cannot leave.
So every nudge on a Stop hook here is addressed to a human by necessity rather than by style. **The
event that reaches the model is PostToolUse**, which returns additional context that arrives as a
system reminder, and whose payload carries the session id and transcript path so nothing has to guess
which transcript belongs to which session. Probe the channel before writing an instruction into it. One
throwaway hook emitting a nonce plus one tool call settles it in under a minute.

**A presence check cannot check the envelope is any good.** Four headings of nonsense pass the spawn
check. That is deliberate and it must stay deliberate: **a check satisfiable by magic words becomes a
ritual, and a ritual is worse than an honest gap because it reads like coverage.** A machine can see
that the four parts are there. Whether the scope cap is the right scope cap is a judgment, and the
right place for it is the owner reading the envelope before the spawn, which
[LOOP.md](LOOP.md) section 4b already asks for.

**Test a shell hook the way it is invoked.** A defect that fires ten times out of ten in a clean shell
returned zero out of twenty when the same command was issued through an agent's shell tool, because
commands issued that way inherit a signal disposition the script never sees in production. The bug was
a pipe into a matcher that exits on its first hit: the writer dies of a broken pipe, the pipeline
status is promoted, and a heading that *was* found reads as missing. Size-triggered, so the whole suite
was green while carrying it. **A test harness that differs from the invocation path is not a weaker
test, it is a test of something else, and it returns green with total confidence.** Run the script the
way the hook runs it, or the harness answers instead of the code.

There is a fourth, older lesson underneath all three: **a gate nobody has watched fire has not been
tested, it has been described.** Thirteen passing tests missed a hook that never fired in real use,
because every test left the tree in a state the real trigger never sees.

---

## 6. The off switch is part of the design

Every hook here ships with a documented way to stop it, and that is a design requirement rather than a
courtesy. **A gate nobody can find the off switch for is a gate that gets worked around**, and a worked
around gate is worse than no gate, because the routing around is invisible and the gate still reads as
coverage on paper.

Three levels, weakest first, and every hook in this file has at least the third:

1. **Tune.** An environment variable moves a threshold or a path without editing the script. Reach for
   this to try a different number, not to make a gate stop mattering.
2. **Exempt.** A named path in the approval file, or a tree behind the exclusion prefix. This is the
   level that leaves a record of what was approved, which is why the approval is a file and not a flag.
3. **Unwire.** Remove the entry from the machine settings. The owner's act, because that file sits in
   the human lane and because a hook removed on one machine is still wired until the change is pushed
   back to the config repo.

Turning one off is legitimate and belongs in the run report of whoever did it. Working around one
quietly is what this section exists to make unnecessary.

---

## 7. Red flags

- A hook edited without running it the way the harness runs it (section 5).
- A new gate whose scope grows from presence into judgment, so that satisfying it becomes a ritual.
- An instruction to the model written on a Stop hook.
- A hook that fails silently and returns a value that looks like a finding rather than a failure.
- A gate switched on with no off switch written down anywhere a reader will find it.
- A script header describing a wiring decision instead of the settings file describing it.
- A session routing a blocked write through the shell rather than asking.
- A run report that says a gate passed without saying which gate, on which event, in which repo.

---

## 8. Before you change one of these

Evidence-shaped, in the manner of [LOOP.md](LOOP.md) section 9, and short because the blast radius
is the whole machine rather than one repo.

- [ ] The script was run the way the harness invokes it, not as a subshell of an agent's session.
- [ ] Both branches were exercised: the case that passes and the case that blocks.
- [ ] The gate was watched firing in a real session, not only in its test suite.
- [ ] The change was made in the config repo, and the live machine files were reconciled in the
      direction that keeps both honest.
- [ ] The off switch is written in the script and in this file, at whichever of the three levels the
      change created.
- [ ] Anything the hook now cannot do is named here rather than left for the next reader to discover.
- [ ] If the wiring changed, the settings file and the script's header agree about it.

A deny hook is the one kind of change where a mistake reaches every session on the machine, including
ones nobody is watching. That is the argument for building it, proving it, and switching it on as three
separate acts rather than one.

---

*Living document. When a hook is added, retired or rewired, update this file in the same run. The
scripts are the truth about behaviour; this is the truth about intent, and the two go stale in
different directions.*
