---
id: ai-workflow-loop
status: todo
track: ai
depends: []
touches:
  - standards/
  - plans/
  - ../pantry/
  - ../greenroom/
  - ../../lakbay-ph/
  - ../../thesis-advising/
  - content/notes/
owner: ai
---
# The loop — one standard AI workflow across every repo

> Goal (owner, 2026-07-26): every project operates with AI the same way, to the standard set here,
> with the portfolio as the source of truth for the how, the why, and the loop. Repos are
> retrofittable after the fact. The repeatable chores that get skipped (e2e, linting, audits) get a
> heartbeat that makes skipping visible. PANTRY is the per-repo control center: cockpit + state +
> checks, never the model.

**Research base** (cite in LOOP.md, same precedent move as the STE cite in VOICE):
[Loop Engineering](https://addyosmani.com/blog/loop-engineering/) (Osmani — the five primitives:
automations, worktrees, skills, connectors, sub-agents + persistent state; the comprehension-debt
warning), [Beyond Vibe Coding](https://beyond.addy.ie) (Osmani — the 70% problem, plan-first,
quality gates), [Learning AI-Native Software Engineering](https://alfonsograziano.it/book)
(Graziano — context engineering, spec-driven development, verification gates). Owner is reading the
two books; LOOP.md is a living doc, revisit after. Also cite
[GitHub Spec Kit](https://github.com/github/spec-kit) — spec-driven development formalized
(versioned spec → plan → atomic tasks → code; a "constitution" of project principles): our
PLAN.md/PROOF culture is this already, the cite is external validation and the constitution term is
worth borrowing for CLAUDE.md + standards.

**The architecture in one line:** the agent does (Claude Code sessions, human-run), the standard
governs (portfolio `standards/`), PANTRY shows and checks (board, retrieval, doctor), CI + the
working session trigger (checks fire on push and at session start — no cron, no scheduled
agents; decided 2026-07-26: the loop is work-triggered, standards hold AS we work).

**Audit of today (2026-07-26 sweep):**
- Canon already covers 3 of 5 loop primitives (skills = standards + CLAUDE.md kit; state = memory
  discipline + PROOF board; sub-agents = model economy). Missing: automations (heartbeat) and
  worktrees. Connectors built (grain-mcp, pantry retrieval) but not standardized.
- Diverged forks of AI-DEVELOPMENT/AI-REPO-STANDARD in `lakbay-ph/` + `thesis-advising/` (July 6–8
  snapshots) — violates reference-don't-fork.
- No kit at all: `pocket-tickets-api`, `framework-bench`, `thesis-advising`, `test-results`.
  Partial (CLAUDE.md, no AGENTS symlink): `batch-stack`, `ph-live`, `lakbay-ph`.
- grader-ui + the GitHub-Native Course Platform are already a human-gated AI loop in production —
  the case study.

## Tasks

### P0 — compliance sweep (retrofit the estate)
- [ ] Diff the two forked standards files against canon; harvest anything worth keeping upstream,
      then delete the forks and re-point via starter-pattern CLAUDE.md.
- [ ] Add missing `AGENTS.md → CLAUDE.md` symlinks (batch-stack, ph-live, lakbay-ph).
- [ ] Bootstrap bare repos from CLAUDE.starter (pocket-tickets-api, framework-bench; owner call on
      test-results — may be scratch).
- [ ] (Bootstrap-prompt consolidation moved to P4 — the starter is touched once, after the thin
      shape is settled in P1. P0 repos get today's starter; they pick up the thin shape in the
      P4 rollout.)

### P1 — write the standard: standards/LOOP.md
- [ ] New standard, one floor above SESSION-LOOP (SESSION-LOOP owns one session; LOOP owns the
      system around sessions). Contents: the loop primitives mapped to our stack — taking four
      of Osmani's five and consciously adapting the fifth: no scheduled automations (decided
      2026-07-26; no cron, no Routines, standards hold AS we work). The heartbeat is
      work-triggered, two tiers: mechanical (CI runs doctor + tests + e2e + lint on push;
      doctor also runs at session start — the SESSION-LOOP §1 orientation step grows a rule —
      and its findings land in plans/ triage), cognitive (a normal working session picks up
      what doctor flagged: runs AUDIT.md when the staleness flag says it's due, drafts fixes on
      a branch, human gates the merge). Skipping stays impossible not because a robot runs at
      night but because every session and every push SHOWS what's due. Plus: worktree isolation
      for parallel sessions; the verify rule (a change is verified by a session/agent that
      didn't write it — no grading your own homework); staleness flags (audit overdue, graphify
      stale, e2e missing).
- [ ] Define the thin-CLAUDE.md kit shape here (the standard owns the shape; P4 applies it to
      the starter): the irreducible cold-start minimum in CLAUDE.md (what-this-is, commands,
      five non-negotiables, "bunx pantry for the rest"), everything else in the standard
      pantry-mounted dirs (docs/, plans/, decisions/, artifacts/). Memory discipline: durable
      facts promoted to committed docs; scratch/private stays in the agent store (in-repo
      memory in a public repo would publish working context). Standards referenced by URL,
      never files in the repo.
- [ ] The accountability contract (keeps an unattended session honest — Osmani's "human
      verification non-negotiable" made mechanical): (a) the run ledger — claim a plan item before
      touching code, checkpoint at load-bearing moments, close with a run report (gate results
      verbatim, diffstat, what was NOT done, what needs human eyes); evidence-or-it-didn't-happen;
      (b) the rails — a declared envelope per run: scope cap, hard stops (no merge, no push to
      main, no deletes, nothing outward-facing), ask-triggers (scope growth, owner-only decision,
      gate red twice on the same cause → stop and file a finding, don't thrash).
- [ ] "Why a loop at all" research subsection citing the three sources; comprehension-debt warning
      tied to ten-times-zero.
- [ ] Adoption checklist mirroring AI-REPO-STANDARD §12 (day one / first month / steady state).

### P2 — PANTRY becomes the control center (work lands in pantry repo, its PLAN.md owns detail)
- [ ] `pantry doctor`: kit compliance (CLAUDE.md present, AGENTS symlink, forked-standards
      detection, plans/ + config present) + staleness flags (last audit report age, graphify
      freshness, e2e suite presence) + existing drift lint, one command, CI-able nonzero exit.
- [ ] Doctor accountability checks: stale claims (plan item claimed, no checkpoint in N days),
      branches with no ledger entry, run reports missing gate evidence, unresolved decisions
      blocking runs.
- [ ] `pantry init --kit` (explicit opt-in, write-if-absent only — the non-invasive rule holds):
      CLAUDE.md from starter, AGENTS symlink, plans/, pantry.config.json.
- [ ] The decision inbox: agents write decision-requests as markdown (status open/resolved,
      options, a recommendation, evidence links); PANTRY renders a `/decisions` surface
      (question + flagged code + artifacts side by side) and the agent shares the localhost
      link. Resolution = the grader-ui / grain-handoff pattern: click through the options, an
      ALWAYS-PRESENT additional-notes textbox, then "generate prompt" assembles resolutions +
      notes + the instruction to mark the decision files resolved — human pastes it into chat,
      the AGENT records the resolutions as part of acting. PANTRY stays 100% read-only (no
      intent door needed — clicks are local state, the prompt is the write path). Known
      tradeoff, accepted: clicks aren't durable until the prompt is pasted. The decision file
      doubles as a ledger entry. Autonomous runs ALWAYS ask here (chat has nobody in it);
      interactive sessions use it for artifact-heavy decisions, chat for quick ones.
- [ ] Artifacts dir per run (screenshots, HTML artifacts, audit reports, diffs) that PANTRY
      serves and decision files / run reports link into — where evidence lives.
- [ ] Home surface: latest audit + drift reports with freshness ("audit N days old"), next to
      the board. Mindmap expansion ideas go to pantry's own PLAN.md (not forked here).
- [ ] `/timeline` — the retrospective project timeline (NOT a forecast gantt; no estimates
      culture): plan bars from the git-derived dates of the plan files' own status transitions,
      `depends` arrows, commit-activity density underneath, audit/run-report markers, "working
      on this N months, active M days" stat tiles. All derived from git + plans + dated
      reports — no new tracking, no model. Optional later: a `target:` frontmatter field if
      forward planning is ever wanted. Viz detail in pantry's PLAN.md, built per the dataviz
      skill + FIGURES.
- [ ] Keep the constraint: PANTRY runs no model. Doctor checks, board shows; agents act.

### P3 — wire real loops in pilots
- [ ] Greenroom first (verification-native, already has plans/ + AUDIT): CI-on-push heartbeat +
      doctor at session start; findings → plans/ triage → board; audit run in-session when the
      staleness flag fires.
- [ ] Wire the rails mechanically in pilots: Claude Code hooks blocking push/merge/destructive
      commands in autonomous runs; verify pass by a session that didn't write the change, walking
      the run report against the diff before human review.
- [ ] Convert the pilots to the thin-CLAUDE.md shape (defined in P1): content moves into the
      pantry-mounted dirs, pantry's session context pack (its PLAN.md) becomes the real front
      door; doctor flags an agent store bloated with should-be-promoted facts.
- [ ] Portfolio second: audit + audit:desk + lint:voice + verify:export in the heartbeat; same
      triage flow.
- [ ] Write up grader-ui + course platform as the existing-loop case study (in LOOP.md or the note).

### P4 — wire the canon + roll out the estate
- [ ] standards/README.md index row for LOOP.md; SESSION-LOOP + AI-REPO-STANDARD pointers;
      sync-table row ("workflow changed → update LOOP.md").
- [ ] Revise CLAUDE.starter.md ONCE to the thin shape defined in P1 (absorbs the P0 bootstrap
      prompt — starter is touched a single time, after the shape is settled).
- [ ] Roll the loop out beyond the pilots: `pantry init --kit` + doctor green on every active
      repo; heartbeat wired where the repo is hosted (GitHub Actions on-push where on GitHub,
      doctor at session start everywhere). Done = doctor green estate-wide, no repo "doing its
      own thing."

### P5 — the note: "How I work with AI"
- [ ] content/notes/ per NOTE-STANDARD, theme "How I work with AI" — the loop-era sequel to
      ten-times-zero (that note owns the multiplier thesis + receipts; this one owns the
      SYSTEM: the loop, the heartbeat, the control center, one person + an AI running a dozen
      repos the same way). Research-backed: cite the full base above (Osmani ×2, Graziano,
      Spec Kit), the same receipts-in-hand posture as the STE cite in VOICE. Comprehension debt
      as the ten-times-zero callback. The PANTRY name earns its keep in the story: the pantry
      is where everything the work needs is stocked, one door, same shelves in every kitchen.
      Add to CONTENT-BACKLOG.md. The note is a narrative PROJECTION of LOOP.md — story and
      why, never a second copy of the rules.
- [ ] Ship it in every project: PANTRY renders the note (+ LOOP.md it points at) as a
      package-resolved surface in every repo's cockpit — same mechanism as the existing
      /standards surface, resolved from the portfolio package, never copied. Opening any
      repo's pantry shows how that repo is worked on. Surface naming/placement (own page vs
      part of /about) is pantry PLAN.md detail.

## Non-negotiables carried into every phase
- Portfolio standards/ stays SSOT; every repo references, never forks.
- Human gates merge and anything outward-facing. The loop drafts; it does not land.
- Mechanical checks never need a model; cognitive runs always leave evidence (board findings,
  branch, report).
- PANTRY stays read-only and model-free; the generated prompt is the only write path a human
  carries out of it.

## Open questions (decide when the phase reaches them)
- test-results repo: bootstrap or declare scratch and skip? (owner call, P0)
- decisions/ + artifacts/ config keys and whether artifacts/ is committed or gitignored
  (pantry PLAN.md owns this; leaning gitignored + regenerable, same rule as graphify-out).
- Scheduled automations: consciously NOT adopted (owner, 2026-07-26 — work-triggered only). If
  the estate ever outgrows in-session cadence, Claude Code Routines / claude-code-action on
  cron are the researched fallback; revisit then, not before.

## Definition of done (the whole plan)
LOOP.md published and linked from the index; doctor green on every active repo; both pilots
running the work-triggered heartbeat (CI on push + doctor at session start) with findings
landing on their boards; decisions flowing through the inbox with the generate-prompt flow; the
starter produces a compliant repo in one paste; the note published. The proof is the estate
behaving identically: any repo, `bunx pantry`, same surfaces, same loop.
