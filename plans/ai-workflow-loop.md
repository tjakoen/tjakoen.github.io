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
- [x] Diff the forked standards files against canon; harvest, then delete and re-point.
      **Done 2026-07-26.** All forks were strict older subsets of canon, nothing to upstream:
      lakbay-ph (AI-DEVELOPMENT + AI-REPO-STANDARD), thesis-advising (AI-DEVELOPMENT +
      AI-REPO-STANDARD + VOICE), and a third the sweep missed — batch-stack/AI-REPO-STANDARD.md.
      lakbay-ph forks deleted + CLAUDE.md/README.md re-pointed to URL canon (commit f3456e9).
      thesis-advising forks LEFT in place (owner call: repo is non-git, skip until git-inited).
- [x] Add missing `AGENTS.md → CLAUDE.md` symlinks. **Done 2026-07-26.** ph-live (28356f7e),
      lakbay-ph (in f3456e9). Correction: the sweep's "batch-stack" was stale intel — that dir was
      the DEAD pre-split monorepo (frozen 2026-07-08, fully split into bread-repos/*); its local
      copy was deleted (owner call) and the symlink work redirected to the live split. Added root
      CLAUDE.md + AGENTS symlink to bread-repos/grain (336e057, had per-package files but no root
      front door).
- [x] Bootstrap bare repos from CLAUDE.starter. **Done 2026-07-26.**
      bread-repos/framework-bench done (6dbe23c). test-results (bread-repos: no git, only
      .last-run.json; Development/: empty) = confirmed scratch, skipped. pocket-tickets-api DROPPED
      from scope — the repo was deleted by the owner mid-sweep (drafted kit discarded).
- [x] Remote course-platform umbrellas retrofitted. **Done + PUSHED 2026-07-26.**
      Cloned both github-native-course-platform (public umbrella + Course Console) and HAU
      (private operational workspace, PII); both had a bespoke CLAUDE.md, no forks, but no AGENTS
      symlink. Added AGENTS -> CLAUDE symlink to each, committed with gitmoji house style
      (platform 07fd1b5, HAU bdff41c), owner PUSHED both; the canonical ~/Local/HAU +
      ~/Local/HAU/github-native-course-platform copies ff-pulled the symlink; throwaway Development/
      clones removed. Teacher/student templates
      excluded (they are submodules of the platform; user-facing, owner call). NOT done: neither
      CLAUDE.md references the personal standards by URL — deferred to the P4 thin-shape rollout
      rather than editing HAU's 76KB private doc blind. NOTE: grader-ui is now a retired redirect
      stub (folded into platform/console/); bread-repos/grader-ui is a corpse (cleanup candidate,
      like the deleted batch-stack).
- [ ] (Bootstrap-prompt consolidation moved to P4 — the starter is touched once, after the thin
      shape is settled in P1. P0 repos get today's starter; they pick up the thin shape in the
      P4 rollout.)

### P1 — write the standard: standards/LOOP.md
> **DONE 2026-07-26** (uncommitted). Wrote `standards/LOOP.md` (6 sections: primitives 4-of-5 +
> automations consciously-not-adopted; work-triggered two-tier heartbeat + worktrees + verify rule +
> staleness flags; thin-CLAUDE.md kit shape + memory public-repo teeth; accountability contract
> ledger + rails; "why a loop" research subsection w/ all 4 cites + comprehension-debt→ten-times-zero
> + STE-style honest caveat; §12-mirror adoption checklist). Wired: standards/README.md index row +
> fit-together note; SESSION-LOOP + AI-REPO-STANDARD reciprocal pointers; view/pages/docs/index.html
> Standards list row. Renders at /standards/loop (dir-sourced, no route reg needed). voice-lint N/A
> (standards exempt — backticks/em-dashes are sibling house style). VERIFY RULE MET: reviewed by a
> fresh Sonnet agent that didn't write it → SHIP, no must-fixes (one cosmetic reword applied).
> BLOCKED-carry: §5 research base is a living doc, revisit after owner reads the two O'Reilly books.
- [x] New standard, one floor above SESSION-LOOP (SESSION-LOOP owns one session; LOOP owns the
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
- [x] Define the thin-CLAUDE.md kit shape here (the standard owns the shape; P4 applies it to
      the starter): the irreducible cold-start minimum in CLAUDE.md (what-this-is, commands,
      five non-negotiables, "bunx pantry for the rest"), everything else in the standard
      pantry-mounted dirs (docs/, plans/, decisions/, artifacts/). Memory discipline: durable
      facts promoted to committed docs; scratch/private stays in the agent store (in-repo
      memory in a public repo would publish working context). Standards referenced by URL,
      never files in the repo.
- [x] The accountability contract (keeps an unattended session honest — Osmani's "human
      verification non-negotiable" made mechanical): (a) the run ledger — claim a plan item before
      touching code, checkpoint at load-bearing moments, close with a run report (gate results
      verbatim, diffstat, what was NOT done, what needs human eyes); evidence-or-it-didn't-happen;
      (b) the rails — a declared envelope per run: scope cap, hard stops (no merge, no push to
      main, no deletes, nothing outward-facing), ask-triggers (scope growth, owner-only decision,
      gate red twice on the same cause → stop and file a finding, don't thrash).
- [x] "Why a loop at all" research subsection citing the three sources; comprehension-debt warning
      tied to ten-times-zero.
- [x] Adoption checklist mirroring AI-REPO-STANDARD §12 (day one / first month / steady state).

### P2 — PANTRY becomes the control center (work lands in pantry repo, its PLAN.md owns detail)
> Spec + detail now live in pantry `PLAN.md` piece 11 (11a doctor … 11e artifacts/home/timeline).
- [x] `pantry doctor`: kit compliance (CLAUDE.md present, AGENTS symlink, forked-standards
      detection, plans/ + config present) + staleness flags (last audit report age, graphify
      freshness, e2e suite presence) + existing drift lint, one command, CI-able nonzero exit.
      **DONE 2026-07-26** — pantry piece 11a, branch `feat/pantry-doctor` (commit 8703b5d, NOT
      merged/pushed — human gates). doctor.ts + doctor.test.ts (23 cases), CLI wired,
      `standardsSource: "canon"` opt-out added to config for the standards home. error/warn/info
      split (error fails CI, warn surfaces what's due at exit 0). Verified: 68/68 pantry suite green,
      tsc clean, live smoke (compliant repo exit 0, bare repo exit 1). Independent Sonnet reviewer
      (didn't write it) → found 2 must-fixes (unguarded readlink TOCTOU; drift fold-in untested),
      BOTH FIXED + re-verified, plus should-fixes (symlink-target resolves to cwd, boundary/fresh
      cases).
- [ ] Doctor accountability checks: stale claims (plan item claimed, no checkpoint in N days),
      branches with no ledger entry, run reports missing gate evidence, unresolved decisions
      blocking runs.
- [x] `pantry init --kit` (explicit opt-in, write-if-absent only — the non-invasive rule holds):
      CLAUDE.md from starter, AGENTS symlink, plans/, pantry.config.json.
      **DONE 2026-07-26** — pantry piece 11b, branch `feat/pantry-doctor` (commit 456aa64, stacked on
      doctor 8703b5d, NOT merged/pushed — human gates). Starter resolved from the portfolio package via
      `import.meta.resolve`; CLAUDE.md + AGENTS symlink write-if-absent, never overwritten even with
      `--force` (lstat-guarded, so a dangling host symlink is preserved). Acceptance MET: `pantry
      doctor` green right after (live smoke exit 0). 74/74 green, tsc clean, init.test.ts (6 cases).
      Independent reviewer → 1 must-fix (exists→lstat write-through gap) FIXED + re-verified.
- [x] The decision inbox: agents write decision-requests as markdown (status open/resolved,
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
      **DONE 2026-07-26** — pantry piece 11d, branch `feat/pantry-doctor` (commit 68b3999,
      stacked on 11b 456aa64, NOT merged/pushed — human gates). Owner call: decision files live
      UNDER `plans/` (`plans/decisions/`, config `decisionsDir`), so PROOF tooling + `pantry
      doctor`'s plans-present check already cover them. decisions.ts (pure data) + client
      generate-prompt (no POST, PANTRY writes nothing) + `/decisions`·`/decisions/<id>`·
      `/decisions.json` gated by a `decisions` surface. Open decisions LEAD `/llms.txt` +
      `knowledge.json` `openDecisions`, so an autonomous run resolves them first. 87/87 green,
      tsc clean, live HTTP smoke passed. Independent reviewer → no issues; hardened the one
      caveat (evidence href scheme-validated, javascript:/data: dropped) + tested.
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
