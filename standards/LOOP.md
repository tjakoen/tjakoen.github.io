---
title: LOOP.md — one AI workflow across every repo
summary: The system around the sessions - how every repo is worked the same way, the heartbeat that makes skipped chores visible, and the contract that keeps an unattended run honest.
skill: loop-standard
when: >
  Read this at session start before touching anything, and again BEFORE calling work done,
  committing, opening a PR, writing a handoff, or ending a session. Covers verify-by-second-pass, the
  run evidence a session owes, and uncommitted or unpushed work piling up across sessions. Don't skip
  because you wrote it and checked it yourself - that is one pass, not two - and don't rerun a
  failing gate hoping it is flaky.
---

# One AI workflow across every repo

The standard for how *every* project is operated with an AI, so any repo of mine runs the same way:
the same session shape, the same recurring chores, the same evidence left behind. One person can run a
dozen repos only if the twelfth one behaves exactly like the first. This file is that "exactly like."

> Split of responsibility: **[`SESSION-LOOP.md`](SESSION-LOOP.md) owns one session** — how a single
> run orients, loops, remembers, and hands off. **This file owns the system around the sessions** — the
> heartbeat that spans them, the kit shape they all share, the accountability contract that holds when
> nobody is watching. When they overlap, SESSION-LOOP wins on *how a session moves*; this file wins on
> *how the sessions add up to a governed estate*. It sits one floor above SESSION-LOOP and points down
> at [`AI-DEVELOPMENT.md`](AI-DEVELOPMENT.md) (the standards) and
> [`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md) (the repo kit) for the detail. Don't restate them here,
> point at them.

**The architecture in one line:** the agent *does* (AI sessions, human-run), the standard *governs*
(this folder), PANTRY *shows and checks* (the board, retrieval, the doctor), and the heartbeat fires on
push and at session start — no cron, no scheduled agents. The loop is work-triggered: the standards hold
*as* the work happens, not because a robot runs at night.

---

## 1. The primitives (Osmani's five, mapped to this stack)

The loop is built from five reusable primitives (see *Why a loop at all* below for the source). Four of
them map cleanly onto what this estate already runs; the fifth is adapted on purpose.

| Primitive | What it is | Where it lives here |
|---|---|---|
| **Skills** | Reusable instructions the agent loads on demand | The standards set + the per-repo `CLAUDE.md` kit ([`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md)). Load the one the task needs, not all six. |
| **Persistent state** | Memory that survives a session | Memory discipline + the PROOF board (SESSION-LOOP §4), and CRUMB dev tours as the run evidence a rendered change leaves behind (§4a). Durable facts get promoted to committed docs; scratch stays in the agent store. |
| **Sub-agents** | Delegate scoped work to a cheaper brain | The model economy (SESSION-LOOP §6): plan in the top tier, execute in the mid tier, push wide reads to a small-tier subagent. |
| **Worktrees** | Isolated checkouts so parallel work doesn't collide | Git worktrees for parallel sessions (§2). One branch, one worktree, one run — no two agents editing the same tree. |
| **Connectors** | Tools the agent reaches out through | grain-mcp + PANTRY retrieval. Built, and standardized here rather than left per-repo. |

The fifth primitive is **automations**, a scheduled agent that runs on a timer. It was rejected outright
on 2026-07-26, and that rejection stood for seven weeks and was right for all of them. **It is now adopted
under a gate**, decided 2026-09-16 and recorded in
[the decision](https://github.com/tjakoen/tjakoen.github.io/blob/main/plans/decisions/2026-09-16-proactive-loops.md):
a chore may run on a timer once a deterministic check exists that can tell whether its output is right,
and not one day before. The original reasoning still holds for every chore that has not passed that gate,
and it is in §2. What changed is not the appetite for autonomy. It is that a handful of chores finally
grew a check worth trusting, and §2a is the ladder that says which ones.

---

## 2. The heartbeat (work-triggered first, then scheduled where a check earns it)

The chores that get skipped are the boring recurring ones: the e2e suite, the lint pass, the audit that's
three weeks overdue. A heartbeat makes skipping *visible*, and for most of this estate's life it did that
by making every push and every session *show what's due*, with nothing running unattended at all. That is
still the default and still where a new chore starts. A chore leaves it only by passing the gate in §2a.
Two tiers of check, and the machine tier now has four triggers rather than three.

**Tier 1 — mechanical (no model, fires on a machine trigger).**

| Trigger | What runs | On red |
|---|---|---|
| Push | The doctor + typecheck + tests + e2e + lint (CI, where the repo is on GitHub). | CI fails the push visibly. Nonzero exit, no merge. |
| Session start | The doctor, as the first orientation step (SESSION-LOOP §1 grows this rule). Its answer-log check reads the decision channel in the same pass. | Its findings land in `plans/` triage — the session sees them before touching code. An answer nobody has acted on is named there too, so it is acted on or acked, never simply not seen. |
| Turn end | The typecheck when a typed file moved this turn, `proof verify` over the diff, a nudge for the dev tour §4a asks of a rendered change, and a lint count graded against a committed baseline. | The run does not get to say "done" yet. Ordered by what each catches: a type error is broken code, a lint flag is a preference. |
| Schedule (weekly, §2b) | Only the chores that passed the §2a gate: link rot, a cold build on a clean checkout, the unacked-answer count, a dependency refresh. | It files a finding where the next session will meet it. It never fails a push, because there is no push to fail, and it never lands anything. |
| CI red on main | Nothing is rerun. The responder reads which job went red and files it. | Same. A finding, not a fix. The fix is a session's job, and a human still gates the merge. |

**Two rules keep the turn-end tier from being deleted, and both were learned by nearly deleting it.**
**Gate an expensive check on the thing that makes it necessary.** A typecheck costs several times
everything else in that row combined, so it runs only when a typed file actually changed, which makes
it free on a prose turn and present on every turn that could break the build. A gate that feels slow
gets removed rather than tuned (§7). **Grade a noisy check against a baseline rather than zero.** A
repo with existing lint debt fails a from-zero check on its first run and has it muted inside a week,
so the count is compared to a committed baseline and only a rise is worth saying out loud. The debt
stays visible as a number instead of a wall, and accepting a real increase is a deliberate command
rather than an argument. **A baseline is a high water mark, not a settled state.** The failure mode
found on 2026-08-12 is the one this clause now closes: a baseline that can only grow, absorbing every
new count in silence, reports level forever while the debt underneath it triples. So the regenerate
command accepts any decrease for free and refuses any increase, naming each count that would climb;
taking one on needs a second flag on the command line. Whoever lowers a number lowers it for good.

The mechanical tier never needs a model. It is grep, exit codes, and file-age math. Its whole job is to
*surface*: kit compliance, drift, and staleness flags (audit overdue, graphify stale, e2e suite missing).
This is what PANTRY's `doctor` command is for (P2).

**Reading the answer channel is a step here rather than a habit, and the difference is the point.**
[DECISIONS](DECISIONS.md) §4 built a channel where a question raised by one run is answered and read
by another, and then said out loud that nothing obliged anyone to look at it. A sentence in a standard
does not make a session read a file; a line in the report it already runs at session start does. So
the count of answers no session has acted on sits beside the staleness flags, warn rather than error,
for the same reason every other warn here is a warn: CI has nobody to act on a pending decision, and a
check that blocks a push on one gets muted within a week. Acting on an answer or deferring it are both
one command, and both make the count go down honestly.

**Tier 2 — cognitive (a normal working session, human-run).**

A session picks up what the doctor flagged. When a staleness flag says the audit is due, it runs
[`AUDIT.md`](AI-REPO-STANDARD.md) in-session, drafts fixes on a branch, and stops at the merge — the human
gates it. The cognitive tier is where judgment lives; it always leaves evidence (board findings, a branch,
a run report). It does not land anything.

**Why work-triggered first, and what the 2026-07-26 objection actually was.** A scheduled agent that finds
a problem at 3am has nobody to hand it to, and its output is a notification competing with every other
notification. A check that fires at session start hands its finding to the one context that is *already
about to change the code*. Skipping stays impossible not because something runs unattended, but because
the due work is in front of whoever is working.

Read that again and the objection is not to the timer. It is to the *destination*. A scheduled run whose
finding lands in a notification is worthless for exactly the reason given; a scheduled run whose finding
lands in the issue tracker, in a draft pull request, or in the triage file the session-start doctor
already reads is the same finding arriving at the same desk, just earlier. That distinction was available
in July and went unmade, which is why the call came out as a blanket no rather than a condition. §2a is
the condition, written out. The part of the original reasoning that survives intact is the harder part:
the run still may not land anything, and nothing here creates an unattended agent making changes nobody
asked for.

**Worktree isolation.** Parallel sessions get parallel worktrees — one branch each, isolated checkouts, no
two agents mutating the same tree. This is the `worktrees` primitive doing real work: it is what makes
"run a couple of these at once" safe instead of a race.

**The verify rule (no grading your own homework).** A change is verified by a session or agent that *did
not write it*. The author's own "looks right" does not count as verification — a second pass walks the run
report against the diff before human review. This is the one rule that keeps an autonomous loop from
confidently shipping its own mistakes.

The dev tour in §4a does **not** satisfy this rule and must never be sold as though it does. The agent that
wrote the change writes the tour, so a tour is still the first pass wearing better clothes. What it changes
is the cost of the second: the reviewing session walks named surfaces instead of cold-reading a patch, and
the human walks the live page instead of trusting a screenshot. Cheaper to verify is not the same as
verified.

---

## 2a. The four rungs, and what earns the fourth

Osmani's second frame on loops, after the five primitives in §1, sorts them by *what you hand off*. Four
rungs, each one handing over a thing the previous rung kept.

| Rung | What you hand off | What stops it | Where this estate is |
|---|---|---|---|
| **Turn-based** | the verification check | the agent decides it is done, or that it needs you | Every session, by default. SESSION-LOOP §2 is this rung written out. |
| **Goal-based** | the stop condition | a measurable target is met | The gate loop. Green typecheck, green tests, a lint count at or under baseline. |
| **Time-based** | the trigger | the schedule, until you stop it | §2b, from 2026-09-16. Weekly sweep, weekly dependency refresh. |
| **Proactive** | the prompt | you do, explicitly | §2b, the CI responder. An event starts the work with nobody in the room. |

**More autonomy is not the upgrade. The check is.** That is the source's own sharpest line, and it is the
same claim the verify rule above and the evidence rule in §4 already make from the other direction. A weak
check at the turn-based rung produces a mistake you catch on the next turn, because you are sitting there.
The identical weak check at the proactive rung produces that mistake on a schedule, in a report nobody
opened, for as long as the schedule runs. Climbing a rung does not improve a loop. It multiplies whatever
the loop already was, and nothing in the mechanism cares about the sign.

So a chore does not climb because it is tedious. It climbs when it can be checked.

**The promotion gate.** Four conditions, all of them, before a chore may run on a trigger you are not
present for:

1. **A deterministic check decides the outcome.** An exit code, a count against a committed baseline, a
   diff against a known-good. Not a model's read of whether it went well. This is §4b's high-lane test
   moved up a level, and it fails the same way: if the only thing that can tell you the run was fine is
   the run itself, the answer is no.
2. **The check would catch the chore going wrong, not merely that it ran.** A workflow reporting success
   because it completed is a green light wired to the ignition rather than to the engine.
3. **The finding lands where the next session will meet it.** An issue, a draft pull request, or a file
   the session-start doctor already reads. Not a notification, not an email, not a message into an empty
   room. This is the whole of the 2026-07-26 objection, kept as a condition it is possible to satisfy
   rather than a veto it was not.
4. **The run cannot land anything.** Every hard stop in §4b applies without amendment: no merge, no push
   to a default branch, no deletes, nothing outward-facing. The loop drafts and a human lands, and this
   rung is where that sentence stops being a slogan and becomes the only thing standing between a timer
   and a repository.

**Demotion is part of the design, and it has to be, or the ladder only goes one way.** A proactive chore
drops back to work-triggered when either of two things happens, and both are countable rather than felt:
its findings go three cycles with nobody acting on them, or its check goes red twice on the same cause.
The first means it is producing noise, and the honest response is to stop producing it rather than to
tune the threshold until it is quiet. The second is §4b's ask-trigger, which does not get a weaker reading
because the run was unattended when it fired. A ladder with no way down is a ratchet, and §4b already
explains why this estate does not build those.

---

## 2b. What actually runs unattended

The promotion table. Every row names its trigger, the check that earned it the rung, what it may produce,
and whether it is wired today. Rows that are not wired say so by name, the same honesty
[the conformance standard](CONFORMANCE.md) asks for, because a promotion table reading as all-green is
the one thing worse than a short one.

| Chore | Trigger | The check that earns the rung | May produce | State |
|---|---|---|---|---|
| Link rot on published content | Weekly | bun run lint:links, which exits nonzero on a dead relative link and has no threshold where some are acceptable | One issue, one line per dead link | Wired |
| Cold build drift | Weekly | bun run check and bun test on a clean checkout, which catches breakage arriving from outside rather than from a diff | A line in the same issue | Wired |
| Unacked answers in the decision log | Weekly | The answer log read against its acks and counted past a threshold. Already a session-start check; the schedule catches the weeks nobody opened a session | A line in the same issue | Wired |
| Dependency upgrades | Weekly | CI on the branch it opens. The refresh is not the check, the suite is | One draft pull request, never merged | Wired |
| CI red on the default branch | The failing run | The suite that already went red. Nothing is rerun and nothing is diagnosed | One issue naming the first red job | Wired |
| Uncommitted work across the estate | Session start | git status across every repo, which is §8's standing red flag and the estate's real recurring one | A triage line the session reads | **Not wired as a schedule**, and it cannot be: the repos are local and a runner cannot see them. It stays at the session-start trigger, where it already works. |

**One issue, reopened, rather than one issue per run.** A weekly job filing a fresh issue every Monday
teaches you to close them unread by about the fourth Monday. The sweep maintains a single issue, rewrites
its body with what is true now, and closes it when the body would be empty. How long that issue has been
open is then a real number about the estate rather than a number about the scheduler.

**The dependency row is the only one that writes, and it is worth being exact about why that is allowed.**
It opens a branch and a draft pull request. It does not merge, and the branch it pushes is never the
default one. Under §4b's lanes that is a gated change rather than a high one, and the gate is the suite
plus a person reading the diff. The reason it is allowed at all is that its failure mode is loud: a bad
bump goes red in CI, on the branch it was proposed on, in front of the review it was already going to get.

**What is deliberately not here.** No chore that edits source on a schedule. No chore whose output is a
judgment. No chore that runs the audit unattended, because the audit's findings need the cognitive tier
and filing them without it produces a list nobody can act on. Adding one of these later means passing
§2a's four conditions in writing first, in a decision record, not in a commit message.

---

## 3. The thin CLAUDE.md kit shape

Every repo carries the same shape, and the shape is deliberately thin. The `CLAUDE.md` holds the
irreducible cold-start minimum; everything else is a pantry-mounted directory the agent fetches only when
the task needs it. (The standard owns this shape; the P4 rollout applies it to `CLAUDE.starter.md`.)

**In `CLAUDE.md` (the front door, nothing more):**

- **What this is** — one paragraph, so a cold agent knows where it landed.
- **Commands** — how to build, test, run. The two or three that matter.
- **The five non-negotiables** — the rules a change is held to, stated flat.
- **"`bunx pantry` for the rest"** — the one pointer that mounts the depth (the board, the docs, the
  plans, the decisions) on demand.

**Everything else lives in the pantry-mounted dirs**, not the front door: `docs/`, `plans/`,
`decisions/`, `artifacts/`. A cold read of `CLAUDE.md` should take under a minute; the depth is one command
away when it is actually needed. A `CLAUDE.md` that has grown into a config dump is a bug — it means
content that belongs in a mounted dir leaked into the front door.

**Standards are referenced by URL, never forked into the repo.** Every repo points at
<https://tjakoen.github.io/standards>; none carries its own copy. Two copies drift, and then both are
suspect. (This is the reference-don't-fork rule from the standards index, made a kit requirement.)

**Memory discipline** (the SESSION-LOOP §4 split, with one public-repo teeth): a durable, repo-worthy fact
gets *promoted to a committed doc*. Scratch and private working context stays in the agent's own memory
store. In a **public** repo this is not a preference — an in-repo memory file would publish your working
context to the world. The doctor flags an agent store bloated with facts that should have been promoted,
and a repo that leaks scratch into a committed file.

---

## 4. The accountability contract (keep an unattended run honest)

An AI run that touches code without a human watching each step needs a contract, or "trust me" is doing all
the load-bearing work. This is human verification made mechanical: not a vibe, a checklist the run must
satisfy. Two halves.

### (a) The run ledger — evidence or it didn't happen

- **Claim before you touch.** Claim a plan item before editing code, so two sessions don't collide on the
  same work and so the trail starts before the diff does.
- **Checkpoint at load-bearing moments.** A short note at each real decision or risky move — not a
  play-by-play, the moments that would matter to someone reconstructing the run.
- **Close with a run report.** Gate results *verbatim* (not "tests pass" — the actual output), the
  diffstat, **what was not done**, and **what needs human eyes**. A report that only lists wins is a
  report that is hiding something.
- **A change a person can see owes a tour.** When the diff touches something that renders, the run
  closes with a CRUMB dev tour as well as the report: one step per changed surface, each carrying
  what moved and a verify line the reviewer can actually execute. A diff describes the edit; a tour
  shows the thing. The reviewer walks the real page instead of reconstructing it from a patch, and
  the per-step status is a machine-readable form of "what needs human eyes". Nothing else in this
  list is replaced by it. A change with no rendered surface, a parser, a CLI flag, a doc, owes no
  tour, and asking for one anyway is how the habit gets muted.

The rule underneath all four: **evidence or it didn't happen.** A claim of "verified" with no gate output
attached is treated as unverified.

**Where the repo runs PANTRY, hand over the link, not the summary.** The cockpit renders the run
ledger at `/runs`, the plan board at `/plans`, the open questions at `/decisions` and the evidence at
`/artifacts`, all read-only and all from the files the run already wrote. A session that closes by
pasting its own account into chat has written the one version of events it controls; a link points at
the parsed report, including the §9 items it is missing and any scope it grew past. Localhost is the
link, the same call the decision inbox already made, so this applies while the owner is at the machine
the work happened on and not from a phone. Where a repo does not run PANTRY, the report file itself is
the handover and chat carries the path to it. Neither replaces the report: the surface only renders
what the run was already honest enough to write down.

### (b) The rails — a declared envelope per run

Before an autonomous run starts, it declares its envelope, and the envelope is enforced (mechanically where
the tooling allows — Claude Code hooks blocking the forbidden commands; P3):

- **Scope cap** — the files or the area this run is allowed to touch. Growth past it is an ask-trigger, not
  a judgment call the run makes alone.
- **Hard stops** — no merge, no push to main, no deletes, nothing outward-facing. The loop *drafts*; a
  human *lands*. These are absolute, not defaults.
- **Ask-triggers** — stop and ask when: scope grows past the cap, a decision is genuinely the owner's, or a
  gate goes red twice on the same cause. That last one matters: **a gate red twice on one cause means stop
  and file a finding, not thrash.** An agent retrying the same failing approach is burning tokens to look
  busy.

Autonomous runs route every ask through the decision inbox (P2) — chat has nobody in it. Interactive
sessions use the inbox for artifact-heavy decisions and chat for the quick ones.

**An ask stops the run.** Not a pause you promise to honor, a stop: put the question where it belongs
and end the turn. A wait is not passive, because nothing interrupts a session when the answer lands,
so a run that asks and carries on gets its answer after the decision it was meant to inform. State
this in the envelope explicitly rather than assuming it, since the pull to keep making progress while
a question is outstanding is exactly what a run that wants to look busy will follow. Leave the tree
clean before stopping, so the answer arrives to a session that can act on it instead of one that has
to tidy up first.

**The envelope travels with the handoff, and the session that opens the next one declares it.** A
successor opened at the context line inherits the task automatically and inherits nothing else, so an
envelope that lives only in the outgoing session's head is an envelope the chain loses on its first
hop. The rule: the same message that carries the task carries the lane, the scope cap, the hard
stops, the ask-triggers, and whether an ask stops the run. **Show it to the owner and let them adjust
it if they are in the room, declare it yourself if they are not, and never leave it unsaid.** This
does not reopen the no-confirmation rule for the spawn itself: durable state is still the gate, and a
session that stops to ask permission at the stop line is spending the room it has left on the
question. What needs a human is the shape of the envelope, not the decision to hand off.

**Those three are a floor, and a floor applied identically to every change is a blunt instrument.**
The same envelope governs a typo fix and a schema migration, so it is either too tight to work under
or too loose to trust. Autonomy is a property of the change, its evidence and the harness around it,
not a setting on the model, so a change is classified into one of three lanes and the envelope
follows from the lane.

| Lane | The change | What happens |
|---|---|---|
| High | Routine, reversible, covered by a gate that would catch it going wrong | The run proceeds alone |
| Gated | Real blast radius, but a mistake can be walked back | Automated checks, then a targeted human review of the diff |
| Human | Irreversible, or novel with weak evidence | The human decides before anything is written |

**Irreversibility, not difficulty, puts a change in the human lane.** A one-character migration is
human. A two-hundred-line refactor of pure functions under test is not. Sorting by how hard a change
looks is how the dangerous small ones get waved through, because they are the ones that never look
like much.

<svg viewBox="-1 0 463 330" width="100%" role="img"
     aria-label="Two questions decide the lane. A proposed change is asked whether it touches an irreversible path; if yes it goes to the human lane, where the owner decides first. If no, it is asked whether a gate exists that would catch it going wrong; if no it goes to the gated lane, which means automated checks and then a targeted review of the diff. Only if yes does it reach the high lane, where the run proceeds alone. Push, merge, publish and delete are hard stops rather than lanes, and sit outside this diagram."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-lanes0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="30" y="14" width="200" height="34" rx="6"/>
    <rect x="30" y="84" width="200" height="48" rx="6"/>
    <rect x="30" y="168" width="200" height="48" rx="6"/>
    <rect x="270" y="84" width="190" height="48" rx="6"/>
    <rect x="270" y="168" width="190" height="48" rx="6"/>
  </g>
  <rect x="30" y="252" width="200" height="34" rx="6"
        style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="130" y1="48" x2="130" y2="84" marker-end="url(#fl-lanes0)"/>
    <line x1="130" y1="132" x2="130" y2="168" marker-end="url(#fl-lanes0)"/>
    <line x1="130" y1="216" x2="130" y2="252" marker-end="url(#fl-lanes0)"/>
    <line x1="230" y1="108" x2="270" y2="108" marker-end="url(#fl-lanes0)"/>
    <line x1="230" y1="192" x2="270" y2="192" marker-end="url(#fl-lanes0)"/>
  </g>
  <g text-anchor="middle" style="fill:var(--color-fg)">
    <text x="130" y="36.3">A proposed change</text>
    <text x="130" y="103">Does it touch an</text>
    <text x="130" y="119">irreversible path?</text>
    <text x="130" y="187">Would a gate catch</text>
    <text x="130" y="203">it going wrong?</text>
    <text x="365" y="103">Human</text>
    <text x="365" y="119">the owner decides first</text>
    <text x="365" y="187">Gated</text>
    <text x="365" y="203">checks, then a review</text>
  </g>
  <g text-anchor="middle">
    <text x="130" y="274.3" style="fill:var(--color-bg)">High: the run proceeds alone</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;
       stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="250" y="104">yes</text>
    <text x="250" y="188">no</text>
    <text x="130" y="153">no</text>
    <text x="130" y="237">yes</text>
    <text x="230" y="318">Push, merge, publish, delete: hard stops, not lanes.</text>
  </g>
</svg>

The classifier is paths first, because paths are checkable and a judgement call can be talked into
anything. A change is in the human lane if it touches any of these, and the lane is the worst thing
in the diff rather than the average of it:

```
.github/**                      CI, workflow permissions, anything holding a secret
**/migrations/**  **/*.sql      schema changes, which outlive the run that made them
**/auth/**  **/*permission*     who can do what
**/*secret*  **/*credential*  **/.npmrc  **/*.pem
**/billing/**  **/*payment*     money
package.json (version, publishConfig, exports)
wrangler.*  Dockerfile  **/*.tf deploy and infrastructure surface
deletions under content/**      published pages someone may already be linking to
```

Some irreversible things are not paths at all, and those stay where they already are: pushing,
merging, publishing, rewriting history, deleting anything, and every outward-facing action remain
**hard stops** rather than lanes. A hard stop is not the top of the ladder, it is off the ladder.

Two rules keep this from turning into a permissions system that quietly grants itself more:

- **The lane is computed per change and never stored.** There is no ladder, so there is nothing to
  ratchet. This also sidesteps the question of what track record earns and over what window, which is
  genuinely unsettled here and should not be answered by accident.
- **Evidence can only narrow the high lane, never widen it.** A change qualifies as high only if a
  gate exists that would actually catch it going wrong. Missing coverage is not neutral, it drops the
  change to gated, because "the tests pass" means nothing when the tests do not reach the change.

**A lane the harness enforces beats a lane the run remembers.** Rails that live only in a document
are followed by whoever read the document, which on a long run is a coin flip. Two harness
capabilities carry real weight here, and both are worth asking for by name when choosing one:

- **Per-action approval decided per action, not per session.** A blanket yes at the start is the
  binary rail this section replaces, one lane wide and always the widest. Better is a harness that
  judges each action and interrupts only for the ones that earn it, which is the three lanes running
  as a mechanism instead of a promise. The failure mode to watch is drift toward always-approve,
  because a gate that never fires and a gate that is off look identical from inside the run.
- **Uncommitted and unpushed work attributed to the session that made it.** The §9 durable-state
  check reads the tree, and a tree cannot say who dirtied it, so with two sessions open in one repo
  the check reports the other one's mess as yours and a session goes looking for work it never did.
  A harness that tracks edited files per session answers that directly.

This estate runs on Nimbalyst, which does both. The requirement is the standard; the product is an
example, and a harness that does neither is not disqualified so much as owed more discipline
elsewhere: read the paths before believing a dirty count, and keep the ask-triggers in front of you.

**A scheduled run declares its envelope in the workflow file, because there is no session to declare
it in.** Everything above assumes a run that can be told something at the start. A job on a timer
cannot, so the envelope has to be legible in the thing that defines the job, and that is a stricter
requirement than it sounds: it means the scope cap, the hard stops and the ask-triggers are readable
by a person opening the file in the tracker, not inferred from what the script happens to do.

- **The scope cap is the permissions block.** Read-only unless the row in §2b says otherwise, and the
  one row that writes is capped at a branch and a pull request. A workflow that grants itself more
  than its row needs is the finding, whether or not it ever uses the grant.
- **The hard stops are enforced by not having the permission, not by the script choosing well.** A run
  that could merge and declines to is one edit away from merging. A run with no merge permission is
  not.
- **The ask-trigger is the issue it files.** A scheduled run has no way to stop and ask, so its
  equivalent of asking is filing the finding and going quiet. That is the same shape as *an ask stops
  the run*, and it matters that it is the same shape: a job that files a finding and then tries to
  fix it has carried on past the point where it should have stopped, exactly like a session that
  asks a question and keeps typing.
- **Every unattended run is attributable.** Which workflow, which run, which commit, on every finding
  it files. This is the §4a ledger for a run with no session behind it, and it is the difference
  between a finding you can trace and a finding you can only believe.

---

## 5. Why a loop at all (the precedent, and the receipt)

This is not a new instinct, and it is not only mine. The industry converged on the same shape from three
directions, and the convergence is the argument.

**The primitives are named and defended.** Addy Osmani's
[Loop Engineering](https://addyosmani.com/blog/loop-engineering/) sets out the five reusable primitives
this file maps in §1 (automations, worktrees, skills, connectors, sub-agents over persistent state) — the
case that durable AI work is built from a small set of composable parts, not a clever prompt. His
[Beyond Vibe Coding](https://beyond.addy.ie) carries the harder half: the "70% problem" (an AI gets you
most of the way and the last stretch is where unmanaged work rots), plan-first over prompt-and-pray, and
quality gates as non-negotiable. That book is why the heartbeat (§2) and the gate (SESSION-LOOP §2) exist
at all.

**The ladder is named, and it settled an argument this file had been having with itself.** Osmani's
*four kinds of loops* sorts loops by what you hand off: the verification check, then the stop
condition, then the trigger, then the prompt itself. §2a is that ladder applied here. Two things came
out of reading it. The first is vocabulary, which sounds minor and was not: this file had been
describing rungs one and two at length without a name for either, so every discussion of going further
turned into an argument about autonomy in general rather than about which specific thing was being
handed over. The second is the line the whole of §2a is built on, *more autonomy is not the upgrade,
the check is*, which is the same claim as the verify rule and the run ledger and arrives at it from
the direction this estate had not tried. The 2026-07-26 rejection of scheduled work was reopened on
2026-09-16 on the strength of it, and the reopening is recorded rather than quietly performed.

**The verification discipline is named.** Alfonso Graziano's
[Learning AI-Native Software Engineering](https://alfonsograziano.it/book) is where the context-engineering
and spec-driven-development framing comes from, and the verification gates that §4's contract makes
mechanical. His "human verification is non-negotiable" is the sentence §4 turns into a checklist.

**The spec-first shape is formalized.** [GitHub's Spec Kit](https://github.com/github/spec-kit) formalizes
spec-driven development — a versioned spec becomes a plan becomes atomic tasks becomes code, governed by a
"constitution" of project principles. Our `PLAN.md` and PROOF culture is already this; the cite is external
validation, and *constitution* is a good word for what the five non-negotiables in every `CLAUDE.md`
already are.

**The quality half is named too, and this estate is behind on it.** Osmani's
[Agentic Code Quality](https://addyo.substack.com/p/agentic-code-quality) makes the argument the rest
of this file assumes: human code review does not scale to machine-speed output, so quality stops being
a review activity and becomes a systems design problem. Constraints sit at three points, before the
work, during it, and at the production boundary, which is the shape §2 and §4 already have. What it
adds is the list of signals a harness owes and this one does not yet carry: mutation testing, a
complexity ceiling, architecture rules in the linter, a security scan, and back-pressure, meaning a
way to slow agent output when verification is the bottleneck rather than quietly lowering the bar.
The 2026-08-13 audit found the asymmetry and named its cause: every gate here was written after a
process failure that actually happened, and none after a quality failure, because quality failures
were caught by a human reading the diff. That works at one person and one repo, which is exactly the
condition the article says it stops working under.

Two honest caveats, the same posture as the STE cite in [`VOICE.md`](VOICE.md): the two books are being
read as this is written, so this section is a living base, not a finished literature review — it gets
revisited after the read. And none of these sources is a study of *this* estate; they are the shape the
field agrees on, and this file is one person applying it, not proof it scales to a team.

**The comprehension-debt warning.** Osmani's sharpest point, and the one this whole file is built around:
a loop that ships code faster than anyone understands it is not a productivity win, it is *debt* — you can
run a repo you no longer comprehend right up until the day you have to fix it. This is exactly the
[ten-times-zero](https://tjakoen.github.io/notes/ten-times-zero) thesis: the multiplier is real, and
anything times zero is still zero. The verify rule (§2), the run ledger (§4), and the human gate on every
merge exist precisely so speed never outruns comprehension. The loop draft; the human, who still
understands the code, lands.

---

## 6. Adoption checklist

Mirrors [`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md) §12 — one floor up, for the loop rather than the repo.

Day one (an hour):

- [ ] `pantry init --kit`, or by hand: thin `CLAUDE.md` from the starter, `AGENTS.md → CLAUDE.md` symlink,
      `plans/`, config. Standards referenced by URL, not forked.
- [ ] Run `pantry doctor` once. Fix what it flags. Green doctor is day-one done.

> PANTRY is not on the public registry yet, so `pantry` and `bunx pantry` will not resolve on a
> machine that has not cloned it, and the unscoped name on npm belongs to an unrelated package.
> Install it from its repo, or do day one by hand and mark the doctor rows **not run** by name,
> the way [`CONFORMANCE.md`](CONFORMANCE.md) does. A checklist step that cannot run is worth more
> said out loud than left looking green.
- [ ] Wire the mechanical heartbeat: CI on push where the repo is on GitHub; doctor at session start
      everywhere.

First month (as the work happens, not as a project):

- [ ] First staleness flag fires → run the cognitive tier: draft the fix on a branch, human gates the
      merge, leave the run report.
- [ ] First autonomous run → declare the rails (§4b), write the run ledger, close with a report carrying
      gate output verbatim.
- [ ] First artifact-heavy or owner-only decision → route it through the decision inbox, not chat.
- [ ] `CLAUDE.md` grew past the front-door minimum → move the depth into a pantry-mounted dir.

Steady state: the estate behaves identically. Any repo, `bunx pantry`, same surfaces, same loop, same
evidence trail. Doctor green estate-wide, no repo "doing its own thing." The proof of the loop is that you
cannot tell the repos apart by how they are worked.

---

## 7. Rationalizations (what talks a run out of the contract)

The contract in §4 is rarely rejected. It is talked out of, one reasonable-sounding sentence at a time.

| Rationalization | Reality |
|---|---|
| "I wrote it and I checked it, that counts." | That is one pass. §2 asks for a second by someone who did not write it, because the author's eye reads what it meant to write, not what it wrote. |
| "The gate is flaky, run it again." | A gate red twice on one cause is a stop and a finding (§4b), not a retry. Rerunning with no edit in between is burning tokens to look busy. |
| "I'll commit at the end, it's all one change." | The end is where sessions get interrupted. Uncommitted work does not survive a crash, a context limit, or a change of mind. |
| "Pushing is the owner's call, so I'll leave it local." | Leaving it local is right. Leaving it local and unrecorded is not: the handoff names what is unpushed and why, or the next session inherits a surprise. |
| "The tests passed, that's the evidence." | "Tests passed" is a claim. The gate output verbatim is the evidence, and §4a treats the claim alone as unverified. |
| "Nothing worth reporting, the run went fine." | A report listing only wins is the exact report §4a warns about. What was not done and what needs human eyes are the load-bearing lines. |
| "I'll summarize the run in chat, it is faster to read." | Faster, and written by the party with an interest in how it reads. §4a asks for the link where the repo runs PANTRY, because the rendered ledger names the evidence items the report is missing and the summary never will. |
| "The scope only grew a little." | Growth past the cap is an ask-trigger, not a judgment the run makes alone (§4b). The size of the growth does not change who owns the call. |
| "Doctor is noisy, I'll deal with it later." | Later is the next session, which reads the same flags and makes the same excuse. That is how a flag becomes furniture. |
| "Put it on a schedule, then it definitely gets done." | Scheduled means it definitely *runs*. Whether it gets done is the check, and §2a will not promote a chore that has not got one. A timer on an unchecked chore automates the appearance of the work. |
| "It is only a small thing to also fix while it is in there." | The scheduled run drafts. Every hard stop in §4b applies to it unchanged, and it has fewer ways to notice it was wrong than a session does, not more. |
| "The weekly job has been green for a month, so that area is fine." | Green means the check passed. §2a condition 2 is the question worth asking instead: would this check have gone red if the thing it watches broke? A job that reports success for completing is furniture with a schedule. |
| "Nobody has closed the sweep issue, so there is nothing in it." | Or there is, and it is being scrolled past. Three cycles unacted is a demotion trigger in §2a, not a sign the chore is working quietly. |

---

## 8. Red flags

- **Uncommitted work spanning more than one session, in any repo.** This is the estate's real one, and
  it is the one that keeps recurring.
- Work committed but unpushed, with no line in the handoff saying so.
- The same gate rerun with no edit in between.
- A run report with no "what was not done" section.
- "Verified" written with no gate output attached to it.
- Scope grew past the declared cap and no ask was raised.
- A plan item edited before it was claimed.
- Doctor flags carried across three or more sessions untouched.
- A session ended with no handoff because "it is obvious where this is."
- Two sessions working the same area with no claim between them.
- A scheduled workflow holding a permission no row in §2b asks for.
- The sweep issue open and untouched for three cycles, which is the §2a demotion trigger rather than good news.
- A scheduled run that fixed something instead of filing it.
- A chore promoted to a timer with no decision record naming the check that earned it.

---

## 9. Verification (before a session is called done)

Short, mechanical, evidence-shaped, and meant to be machine-checkable: this list is the schema the
run ledger is checked against, not a vibe pass.

- [ ] Gate output pasted verbatim in the run report, not summarized.
- [ ] Diffstat in the report.
- [ ] "What was not done" written, even when the answer is nothing.
- [ ] "What needs human eyes" written, even when the answer is nothing.
- [ ] Every touched file is either committed or named in the handoff as deliberately left dirty.
- [ ] Unpushed commits counted and named, with the reason they are unpushed.
- [ ] The second pass was done by a session or agent that did not write the change (§2).
- [ ] Declared scope compared against what was actually touched, and any growth was asked about
      rather than absorbed. `proof verify` does this mechanically against a plan's `touches`; a run
      that reasoned it out by hand instead should say so.
- [ ] A change that renders left a dev tour, or the report says why it did not owe one.
- [ ] Every answer in the log this run acted on was acked, so the next session's count is honest.
- [ ] Doctor run, and every flag either fixed or carried forward by name.
- [ ] Open findings from the unattended sweep read, and each one either acted on or carried forward
      by name. An unattended run only pays for itself at the point someone reads it.

---

*Living document. When the workflow changes, update this file — the same rule it asks of everything else.
The research base (§5) is revisited after the two books are read.*
