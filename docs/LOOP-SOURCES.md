# Sources: what the loop was built from

Every outside source that shaped the AI workflow in this estate, what each one actually contributed,
and where that contribution ended up. Kept because the credits are currently scattered across a
standard, two file headers, a lockfile and one draft note, which is four places to look and one place
to forget.

**This exists for [one-loop-every-repo](../content/notes/one-loop-every-repo.md),
still a draft.** A note is prose and will never carry a bibliography, so it will name three or four of
these in the body and lean on this file for the rest. Anything published under the byline that borrows
an idea names where it came from, which is a habit rather than a rule and worth keeping either way.

**Honest limit on the list itself.** This is what the repository can evidence: a cite in a standard, a
credit in a file header, an entry in a lockfile, a decision in agent memory. Sources sent in a chat
that left no trace in a file are not here, and it is worth reading this once to see what is missing
rather than assuming it is complete.

---

## The primitives, and the argument for a loop at all

**Addy Osmani, [Loop Engineering](https://addyosmani.com/blog/loop-engineering/).**
The five reusable primitives: automations, worktrees, skills, connectors, and sub-agents over
persistent state. The case that durable AI work is assembled from a small set of composable parts
rather than found in a clever prompt.

Landed in LOOP section 1, which maps four of the five onto what this estate already ran. The fifth,
automations, was consciously rejected on 2026-07-26 and the rejection was the more interesting half: a
scheduled agent that finds a problem at 3am has nobody to hand it to, so the heartbeat here was
work-triggered instead. That decision was the spine of LOOP section 2 and it was an argument with the
source rather than an application of it.

**It was reopened on 2026-09-16 and the reopening is worth reading before the paragraph above is
quoted anywhere.** The full record is in
[the decision](https://github.com/tjakoen/tjakoen.github.io/blob/main/plans/decisions/2026-09-16-proactive-loops.md),
and the short version is that the July argument was about where a finding LANDS and was written as
though it were about timers. A scheduled run whose output is a notification is worthless for exactly
the reason given. A scheduled run whose output is an issue, a draft pull request, or a line in the
file the session-start doctor already reads is the same finding at the same desk, earlier. LOOP
section 2a keeps the true part as one of four conditions a chore must pass before it may run
unattended, and five chores now do.

**Addy Osmani, the four kinds of loops** ([post](https://www.linkedin.com/posts/addyosmani_the-four-kinds-of-loops-ugcPost-7502269314499084288-EX2A/)).
Read 2026-09-16, and the reason the July call got reopened. Loops sorted by what you hand off: the
verification check, then the stop condition, then the trigger, then the prompt itself. Turn-based,
goal-based, time-based, proactive.

Landed as LOOP section 2a, the ladder and the promotion gate, and section 2b, the table of what
actually runs unattended. Two things came out of it and the smaller-sounding one mattered more. The
first is vocabulary: this estate had been operating at rungs one and two for months with no name for
either, so every conversation about going further collapsed into an argument about autonomy in
general rather than about which specific thing was being handed over. Naming the rungs made it
possible to say yes to one and no to another. The second is the load-bearing line, *more autonomy is
not the upgrade, the check is*, which is the same claim as the verify rule in LOOP section 2 and the
run ledger in section 4, reached from a direction this estate had not tried. A weak check at the
turn-based rung is a mistake you catch next turn because you are sitting there. The same weak check
on a schedule is that mistake repeated into a report nobody opened.

**Addy Osmani, [Beyond Vibe Coding](https://beyond.addy.ie).**
The seventy percent problem: an AI gets you most of the way and the last stretch is where unmanaged
work rots. Plan-first over prompt-and-pray. Quality gates as non-negotiable.

This is why the heartbeat in LOOP section 2 and the gate in SESSION-LOOP section 2 exist at all. It
also carries the comprehension-debt warning that the whole loop is built around, the one that says a
loop shipping code faster than anyone understands it is not a productivity win but debt. That is the
same claim as [ten times zero](../content/notes/ten-times-zero.md), arrived at from the other
direction, and the convergence is why both are cited rather than one.

**Addy Osmani, [Agentic Code Quality](https://addyo.substack.com/p/agentic-code-quality).**
Read 2026-08-13, and the newest of these. Human code review does not scale to machine-speed output, so
quality stops being a review activity and becomes a systems design problem: build the verification
harness, then let the agents run inside it. Constraints sit at three points, pre-work, real time, and
the production boundary. The quality signals a harness owes: unit, property and acceptance tests,
mutation testing to prove the tests catch anything, cyclomatic complexity, architecture rules enforced
in the linter, security scanning, and back-pressure, meaning a way to slow agent output when
verification is the bottleneck rather than quietly lowering the bar.

What it produced here was an audit rather than a feature, and the finding is worth carrying into the
note verbatim: this estate was already ahead of the article on process and behind it on measurement.
The envelope and the three lanes are its pre-work constraint. The context trigger is its real-time
one. The hard stops are its production boundary. There is even a fourth point it does not have, the
turn-end gate. What was missing was the entire second list, and the reason is worth saying out loud:
every gate here had been written in response to a process failure that actually happened, and none in
response to a quality failure, because quality failures had been caught by a human reading the diff.
That works at one person and one repo, and it is precisely the thing the article says stops working.

The audit is [the 2026-08-13 loop audit](AUDIT-AI-LOOP-2026-08-13.md). Back-pressure remains
unbuilt and deliberately so, since nothing here measures the ratio and nothing needs to until a second
unattended session exists.

---

## The verification discipline

**Alfonso Graziano, [Learning AI-Native Software Engineering](https://alfonsograziano.it/book).**
Where the context-engineering and spec-driven-development framing comes from, and the verification
gates that LOOP section 4 turns into a checklist. His sentence that human verification is
non-negotiable is the one that became a nine-item list rather than a principle.

**[GitHub Spec Kit](https://github.com/github/spec-kit).**
Formalizes spec-driven development: a versioned spec becomes a plan becomes atomic tasks becomes code,
governed by a constitution of project principles. The PLAN.md and PROOF culture here was already this
shape, so the cite is external validation rather than an influence. The word constitution is the part
worth stealing, because it is a better name than anything used here for what the five non-negotiables
in every CLAUDE.md already are.

---

## The long-running-agent harness

**Anthropic, [Effective harnesses for long-running agents](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents).**
Published 26 November 2025 by Anthropic's engineering team; the page carries no individual byline.
The initializer agent and the coding agent, the JSON feature list that marks each feature passing or
failing, the progress file plus git log as the handoff, and one feature per session, paired against
four failure modes: declaring victory early, a tree left half-built between sessions, a feature marked
done without being tested end to end, and rediscovering how to start the app every session. Their
reason for JSON over Markdown is the part worth keeping: a model is far less likely to rewrite a
structured status file than a checklist it can reword.

Read on 2026-11-09 and found mostly a subset. The session-start ritual, the progress record and the
rule that verification comes from an agent that did not write the change were already stricter here
(SESSION-LOOP section 1, the run ledger in LOOP section 4a, the verify rule in section 2). It named one
real gap: this estate's plan board is Markdown that the session itself edits, so a run can reshape the
task it failed. That is now a task in [the loop plan](../plans/ai-workflow-loop.md), not a change to
the standard.

**Prithvi Rajasekaran, [Harness design for long-running application development](https://www.anthropic.com/research/harness-design-long-running-apps).**
Anthropic Labs, 24 March 2026.
Planner, generator and evaluator; the finding that agents grade their own work generously, which is why
the evaluator is a separate agent tuned against its own logs; four design criteria with hard thresholds;
the sprint contract, agreed before any code, that bridges a high-level spec to testable behavior;
verification through the running app rather than the diff; and the cost table that makes the trade
honest, a solo run at 20 minutes and 9 dollars against the full harness at six hours and 200, and a
later version at 3h50 and 124.70. Its closing lesson is the one that landed: every harness component
encodes an assumption about what the model cannot do alone, the assumptions go stale, and a new model
is the moment to strip one at a time and see whether the result holds. That rule is now the paragraph
before the caveats in LOOP section 5.

Honest limit on the second: the harness was built for greenfield full-stack apps generated from a
one-line prompt, which is not the shape of the work in this estate. The evaluator economics transfer;
the three-agent scaffold does not have to. The sprint contract is on the plan as a scoped follow-up,
limited to tasks with a surface a person can look at.

---

## The writing standard

**ASD-STE100, Simplified Technical English.**
A documentation standard from aerospace, written decades before the web so an aircraft maintenance
manual reads the same in every hangar on earth. Plain verbs, one name for each thing, no decorative
fog.

Evaluated deliberately rather than adopted, and the evaluation is recorded: some of it is genuinely
anti-VOICE and was rejected on those grounds. What survived is the discipline underneath, which is
that handing a language model a system to follow makes it write like a system, and handing it a wish
makes it write like a wish. The draft note already carries this in prose and it is the strangest of
the sources, which is exactly why it should stay in the published version.

**woosal1337/blog, ste-lint.py.**
The design borrowed straight into [the voice linter](../tools/voice-lint.ts), credited in that
file's header: lint only the mechanical rules, and say plainly that you are only covering the
mechanical rules. That second clause is the whole trick. It is what lets a linter cover a third of a
writing standard without anyone mistaking it for the standard.

---

## Vendored, not just read

**[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills).**
Two skills mounted into this repo rather than cited: doubt-driven-development and
incremental-implementation. They are the only third-party skills here, they are pinned by content hash
in the skills lockfile, and they are mounted rather than committed. Worth naming in the note because
they are the one place an outside source runs as code in a session instead of sitting behind an
argument in a document.

**Richard Edens, [C.R.I.S.S.P.](https://github.com/richardedens/crissp) (Apache-2.0).**
An agentic SDLC framework for Claude Code that makes the same bet as this estate: AI colleagues
build, scripts with no model in them decide what is green, and a person decides what ships. Read on
2026-11-06. Two of its guards were taken whole as ideas: the release gate, which lets a deploy through
only with a green full run at most seven days old plus a green check on every commit since and has no
bypass, and the coverage gate, under which coverage may only go up. The tile row on its Tests
dashboard was taken as the shape for showing that gate.

Landed in PANTRY as the release certificate (certify.ts, with the gate tiles on /control) and in LOOP
section 4(a), which now names the certificate as the check a run report's claim can be held to. No
code was copied. One part was changed rather than applied: its gate tracks commit IDs, and here the
gate matches the code tree, so a squash merge of already certified code keeps the gate open. Its UX
persona rounds and its before-and-after design approval were read and left for later, because each
round costs a model run and that needs a budget call first.

---

## Where each already appears, for whoever finishes the note

| Source | Already cited in |
|---|---|
| Loop Engineering | LOOP section 1 and section 5, the draft note body |
| Beyond Vibe Coding | LOOP section 5, the draft note body |
| Agentic Code Quality | LOOP section 5, this file, the 2026-08-13 audit |
| Graziano | LOOP section 5 |
| Spec Kit | LOOP section 5 |
| Effective harnesses | LOOP section 5, this file, the P7 tasks in plans/ai-workflow-loop.md |
| Harness design (Rajasekaran) | LOOP section 5, this file, the P7 tasks in plans/ai-workflow-loop.md |
| C.R.I.S.S.P. | LOOP section 4(a), standards NOTICE, and in PANTRY its NOTICE, README, PLAN and the certify and /control source |
| ASD-STE100 | VOICE, the draft note body, agent memory |
| ste-lint.py | the header of the voice linter |
| agent-skills | the skills lockfile |

The note owes three or four of these in prose and no more, because a list of sources in a personal
note reads as a citation performance. This file is where the rest live, and a single link to it at the
end of the note is the whole mechanism.
