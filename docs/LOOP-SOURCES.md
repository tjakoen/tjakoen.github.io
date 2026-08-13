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
automations, was consciously rejected on 2026-07-26 and the rejection is the more interesting half: a
scheduled agent that finds a problem at 3am has nobody to hand it to, so the heartbeat here is
work-triggered instead. That decision is the spine of LOOP section 2 and it is an argument with the
source rather than an application of it.

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

---

## Where each already appears, for whoever finishes the note

| Source | Already cited in |
|---|---|
| Loop Engineering | LOOP section 1 and section 5, the draft note body |
| Beyond Vibe Coding | LOOP section 5, the draft note body |
| Agentic Code Quality | LOOP section 5, this file, the 2026-08-13 audit |
| Graziano | LOOP section 5 |
| Spec Kit | LOOP section 5 |
| ASD-STE100 | VOICE, the draft note body, agent memory |
| ste-lint.py | the header of the voice linter |
| agent-skills | the skills lockfile |

The note owes three or four of these in prose and no more, because a list of sources in a personal
note reads as a citation performance. This file is where the rest live, and a single link to it at the
end of the note is the whole mechanism.
