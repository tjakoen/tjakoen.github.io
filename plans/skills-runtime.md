---
id: skills-runtime
status: todo
track: ai
depends: [ai-workflow-loop]
touches:
  - standards/
  - ../pantry/
  - plans/
owner: ai
---
# Skills runtime + loop feedback — make the standards fire, make adherence visible

> Goal (owner, 2026-08-05): the standards stop being prose that a session *decides* to read and
> become skills that *fire* at the moment of the decision. Rolled out estate-wide through PANTRY,
> because PANTRY is already in every repo and the owner works several at once. PANTRY gains the
> feedback half: it shows whether the loop was actually followed, not just whether the kit exists.
>
> Extended by the owner the same day: **more utility in PANTRY**. So this plan also takes the two
> tools we already pay for and under-use — graphify (S4: we use two of nine commands, and doctor
> never asks the graph a question) and headroom (S5: mis-recorded as a dud, actually a narrow win on
> repetitive machine output, and disqualified from anything that must stay verbatim).

**Source.** [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) — the executable
form of [Loop Engineering](https://addyosmani.com/blog/loop-engineering/), which
[`LOOP.md`](../standards/LOOP.md) §5 already cites for the five primitives. 24 skills, 4 personas,
7 reference checklists, a `plugin.json`, install via `npx skills add` or the plugin marketplace.

**The gap it exposes.** Swept all nine BREAD repos plus `~/.claude` on 2026-08-05: **no `skills/`
dir anywhere**, only `.claude/settings.json`. LOOP.md §1 maps the Skills primitive to "the standards
set + the per-repo CLAUDE.md kit." That cell is the weak one. A standard is prose someone must
choose to fetch, and it decays over a long session. A skill is model-invoked: the description
matches the task, it re-enters context mid-run, unprompted.

**Why this is not theoretical.** Our own record, from the memory index and the audit trail:

- Uncommitted piles across five-plus sessions (desk polish, KICKSTART, the VOICE sweep, loop-cleanup
  passes 7 through 10) — all green gates, all sitting undelivered. That is verbatim the
  `incremental-implementation` red flag "large uncommitted changes accumulating," and no standard of
  ours names it.
- LOOP.md §2's verify rule ("verified by a session or agent that did not write it") has no protocol.
  `doubt-driven-development` is one, and it carries the detail we lack: **never pass the CLAIM to the
  reviewer**. Hand a reviewer your reasoning and you get agreement back, not review.
- LOOP.md §4b's "a gate red twice on one cause means stop" has no counter. Their 3-cycle stop
  condition has one, plus an escalation path.
- The ten-pass doc sweep (dead links, the wrong benchmark, "three→four", the 150-300 contradiction).
  Verification checklists at slice close catch that at pass one.

**The unblock.** PANTRY piece 11c (doctor accountability checks) has been TODO since 2026-07-26,
blocked on exactly one thing: *"deferred until the ledger format is pinned down — it isn't a doc-link
or a file stat yet, it needs a schema."* **A skill's Verification section is that schema.** Every
skill ends in a checkbox list of evidence requirements. A run report that carries the union of the
checklists from the skills that fired is a ledger with a shape, and a shape is checkable.

**Architecture, unchanged.** The agent does, the standard governs, PANTRY shows and checks, and
**PANTRY still runs no model**. Every check below is a file stat, a git plumbing call, or an age
comparison. The self-reported half is written by the agent and only *rendered* by PANTRY, same
read-only posture as the decision inbox.

---

## Tasks

### S0 — pilot before building (one session, reversible)

Test the one assumption everything else rests on: **do skills actually fire unprompted?** A skill
with a badly shaped description never triggers and is pure context bloat. Cheaper to learn that now.

- [x] **Installed 2026-08-05** into the portfolio: `npx skills add addyosmani/agent-skills --skill
      doubt-driven-development --skill incremental-implementation`. Layout is `.agents/skills/<name>/SKILL.md`
      with `.claude/skills/<name>` symlinks pointing into it, plus a root `skills-lock.json`. The
      installer reports "universal" coverage for 17 agents and symlinks Claude Code specifically.
      Gitignored for the pilot (mounted, not committed) — S2 still owns the permanent call.
- [x] **The description shape is settled, and it is the S1 finding.** Theirs are imperative trigger
      conditions; ours are descriptive page prose. Side by side:
      - theirs — *"Use when correctness matters more than speed, when working in unfamiliar code, when
        stakes are high (production, security-sensitive logic, irreversible operations)…"*
      - ours (`VOICE.md` `summary:`) — *"The standard for anything published in Tjakoen's name -
        cadence, the machine-tells to avoid, and the honesty clause."*

      Ours says what the document **is**; theirs says when to **act**. A `pantry skills sync` that
      emitted our `summary:` as `description:` would mount skills that never fire. S1's `when:` key is
      therefore confirmed as required, not optional — this was the assumption the pilot existed to test
      and it broke in our favour.
- [x] **Mount confirmed loading.** Both skills appeared in the harness's available-skills list later
      the same day, with their descriptions intact. So the install path works end to end and the
      harness reads it — half of "do skills work here" is answered.
- [x] **Self-trigger test run 2026-08-05. The mechanism works; ours stayed silent.** A census of every
      transcript in this project found 8 `Skill` invocations, and `dataviz` fired twice unprompted in a
      main-thread session with no slash command anywhere in it — so auto-invocation demonstrably works
      here. `incremental-implementation` and `doubt-driven-development` have fired **zero** times since
      install, including on a clean control run: a fresh unprimed subagent touching 6 files and 328
      tests, which matches that skill's stated trigger word for word. The discriminator is register.
      The skills that fire are written as commands with pre-emptive placement ("read it BEFORE writing
      the first line"), literal trigger tokens, and an anti-rationalization clause; ours are written as
      conditions. `doubt-driven-development` never met a risky-enough decision, so it is untested rather
      than disproven.
- [x] Recorded in [`plans/decisions/2026-08-05-skills-self-trigger.md`](decisions/2026-08-05-skills-self-trigger.md),
      with the census table and the register comparison.

**Exit: met, and it did not shrink S1 — it specced it.** Because the mechanism is confirmed, the
frontmatter *is* the whole return, so S1 grows a register requirement rather than losing scope: each
`when:` carries a "before you X" clause, literal trigger tokens, and one anti-rationalization line
lifted from that standard's own Rationalizations table. One question the test could not answer and S2
should: whether subagents can invoke skills at all.

### S1 — the skill format, canon side (portfolio `standards/`)

Standards stay canonical and published at `/standards`. Skill form is a *generated view*, never a
second copy — the SSOT rule holds.

> **S1 CLOSED 2026-08-06.** The single-variable mount test passed clean: session `4218d514` was given
> only an editorial-pass request on `content/notes/watch-its-hands.md`, named no skill anywhere, and
> `voice` fired once at line 13 of 58 — after the first read of the target file and **before any
> edit**, which is the pre-emptive placement the `when:` shape asks for. Nothing before line 13
> references skills. An earlier attempt the same day (session `400d0cd7`) also fired but was thrown
> out as void: it had read a handoff naming `voice` as the thing under observation, the repo's own
> CLAUDE.md independently orders "read VOICE first", and the session deliberated about whether to
> invoke. Contaminated positives were discarded rather than banked. **The register theory holds:
> imperative `when:` text makes a standard self-trigger.** Everything below then landed in
> `4070eb94` (the nine `when:` keys) and `d1e43c5c` (the three sections).

- [x] **VOICE, GRAPH and LOOP carry `when:` as of 2026-08-05; the other 12 wait on the mount test.**
      MILL takes it cleanly: `parseYamlish` supports `>` folded blocks, and the adapters read only
      named keys, so nothing leaks. Verified by render, not by reading the parser — `/standards/voice`
      returns 200 with its title and body intact and zero occurrences of the `when:` text in the HTML.
      `voice` is mounted at `.claude/skills/voice/SKILL.md` (360-char description, 30KB body) and
      **appeared in the live skill listing the moment it was written**. Emitted by a throwaway
      prototype of the S2 sync: read canon, `parseFrontmatter`, `when:` becomes `description:`, body
      copied verbatim under a "canon lives in `standards/`" pointer. GRAPH and LOOP are deliberately
      NOT mounted, so the next fresh session is a single-variable test.
- [x] **DONE 2026-08-06 (`4070eb94`).** Add a `when:` frontmatter key to each standard: trigger-shaped, not summary-shaped. Current
      `title` + `summary` are page prose; `summary` makes a bad description. Confirm MILL ignores the
      unknown key before touching all 15 files. **The 2026-08-05 self-trigger decision fixes the
      register** — the skills that actually fire here are written as commands, so every `when:` needs
      all three of:
      1. **Pre-emptive placement.** "Read this BEFORE writing the first line of prose under the
         byline", not "use when writing prose". It has to fire at intent, not after.
      2. **Literal trigger tokens.** The surface words the prompt will contain, verbatim: for VOICE,
         "note", "post", "README", "commit message", "publish", "draft".
      3. **One anti-rationalization line**, lifted from that standard's own Rationalizations table
         below. "Don't skip because it is internal." The excuse gets pre-refuted in the description,
         where it is read, rather than only in the body, which never loads if the skill never fires.

      **Landed on 9 files** (the 3 already done + these = 12 of 15). `AI-REPO-STANDARD.md` had no
      frontmatter at all and gained a full block, which stopped MILL lifting its H1 and printed the
      title twice, so its body heading is now distinct the way VOICE and FIGURES already were. Three
      files carry no `when:` on purpose and this is now recorded in `standards/CLAUDE.md`: `README.md`
      is the index, `CLAUDE.md` is the directory's own rules and already auto-loads, `AGENTS.md` is a
      symlink to it. Verified by render: all 14 pages 200, zero frontmatter text in any HTML.
- [x] **DONE 2026-08-06 (`d1e43c5c`).** Add a **Rationalizations** table to the three standards that get skipped most. Named excuse,
      named rebuttal, one row each:
      - VOICE — "one em-dash reads better here", "this is internal so the voice rules are off"
        (the voice-lint pass caught 41 prose TELLs; each one had an excuse behind it).
      - GRAPH — "faster to just grep", "the graph is probably stale."
      - LOOP §2/§4 — "I wrote it and I checked it, that counts", "the gate is flaky, run it again."
- [x] **DONE 2026-08-06 (`d1e43c5c`).** Add **Red Flags** to the same three. Ours must include the estate's real one: uncommitted or
      unpushed work accumulating across sessions. It leads LOOP §8, called out as the one this estate
      actually breaks. VOICE's and GRAPH's are process-shaped rather than output-shaped on purpose
      (drafted before opening the file; three greps before any graph query), since the output-level
      tells already had homes.
- [x] **DONE 2026-08-06 (`d1e43c5c`).** Add **Verification** checkboxes to each. This is the load-bearing one — it is the 11c ledger
      schema, so keep the lists short, mechanical, and evidence-shaped (gate output verbatim, not
      "tests pass"). **LOOP §9 is the schema**: gate output verbatim, diffstat, what was not done,
      what needs human eyes, every touched file committed or named as deliberately dirty, unpushed
      commits counted with a reason, second pass by someone who did not write it, declared scope
      compared against what was touched, doctor flags fixed or carried by name. GRAPH §7 is
      per-question (quote the query, cite the file and line it was confirmed at). VOICE's is
      per-piece and points at the smell test for the judgment half rather than restating it.
      **SSOT fix that fell out:** GRAPH's adoption checklist had been restating its own steady-state
      rules, so it now points at §7 instead of repeating it.
- [ ] Do NOT import their 24-skill catalog. We have 15 standards and a thin-kit principle; take the
      format, not the inventory. Same for the Google team norms (Hyrum's Law, the Beyonce Rule,
      change-size line counts) — team-scale, and we are solo.

### S2 — `pantry skills` (the estate-wide rollout)

The whole point of routing this through PANTRY: the owner works several repos at once, and PANTRY is
already in all of them. One command, same surface everywhere.

> **S2 CLOSED 2026-08-07** (pantry `skills.ts` + `skills.test.ts`, wired into `cli.ts`, `init.ts`,
> `doctor.ts`; PLAN.md piece 11f). 22 new tests, tsc clean, `pantry check` 19 pages 0 problems. Live
> in the canon home: 12 standards mounted, `pantry skills list` all ok, `pantry doctor` reports
> `skills mounted: 12 standards mounted and current`. The three pre-existing failures in pantry's
> suite (retrieval + app plan fixtures) were failing before this branch and are untouched by it.
> An independent second pass caught three defects before commit, two of them a guard that existed on
> one path and not its twin (prune refused to delete through a symlinked slot; sync would write
> through one). Detail lives in pantry PLAN.md 11f.

- [x] **DONE.** `pantry skills sync [dir]` — materialize `.claude/skills/<slug>/SKILL.md` from canon. Resolve
      the standards out of the portfolio package with `import.meta.resolve`, the exact trick 11b
      already uses for `CLAUDE.starter.md`, and degrade to a skip when the package is absent.
      **One rule the build added:** the canon home reads its OWN `standards/` dir
      (`standardsSource: "canon"`), never its installed copy of itself. Syncing the home from a pin
      of itself would mount yesterday's canon over today's, which is the exact drift this prevents.
- [x] **DONE.** Generated, gitignored, never committed — same posture as `graphify-out`. Reference-don't-fork
      holds: no repo carries a copy, every repo mounts the same canon. Implemented as a
      **self-gitignoring mount**: sync writes `.claude/skills/.gitignore` holding `*`, so no host's
      own `.gitignore` is edited (init.ts's non-invasive rule, extended to this command).
- [x] **DONE.** Emit frontmatter as `name` (the slug) + `description` (the `when:` line from S1). Body is the
      standard, unchanged. The description is JSON-encoded, since a `when:` is multi-sentence prose
      carrying colons and quotes and SKILL.md frontmatter is read as YAML.
- [x] **DONE.** `pantry skills list` — what is mounted, what version, how stale. Freshness is a
      **content diff, not an mtime compare**: regenerate the expected SKILL.md in memory and compare.
      An install rewrites mtimes for reasons that have nothing to do with canon moving, so mtime
      would lie in both directions. Foreign skills in the same dir are listed and left alone, so the
      output is an honest inventory of what the harness will load rather than only of what we wrote.
- [x] **DONE.** Fold into `pantry init --kit` so a new repo gets skills on day one.
- [x] **DONE.** Doctor gains **skills-freshness** (warn): mounted skills older than the canon they came from,
      or absent in a kit repo. Absent package degrades to info, never a false alarm. Absence only
      reads as due in a repo carrying a CLAUDE.md, so a host that never opted in cannot be nagged.
- [x] **DEFERRED, on purpose.** Third-party skills stay hand-installed for now. The config allowlist is
      still the estate-consistent answer, but nothing third-party has been adopted, and a config key
      with no consumer is speculative surface. Revisit when the first one actually lands. Sync
      already leaves foreign skills untouched and reports them, so hand-installing one is safe today.

**Two findings worth carrying forward.**

- **A name collision is silent, and it is fatal.** The harness ships its own `loop` skill. Our
  `LOOP.md` mount was written to disk, never appeared in the skill listing, and therefore could never
  fire, with no error anywhere. Canon now carries an optional `skill:` frontmatter key that overrides
  the slug, `LOOP.md` uses `skill: loop-standard`, and `standards/CLAUDE.md` records the rule: check
  the listing after mounting, because a written file is not a live skill. Worth noting that this
  would have gone unnoticed indefinitely, since the failure looks exactly like success from the
  sync's side.
- **A stale pin and a missing package read identically and have different fixes.** Pantry's own
  `tjakoen.github.io` pin predates the `when:` keys, so syncing there mounts nothing. That first
  reported as "no standards package resolvable", which is wrong: the package is there, the pin is
  old. They are separate messages now, one saying install and one saying bump. **This is also the
  standing blocker on the estate-wide rollout**: every repo but the canon home mounts from its pin,
  so the rollout lands only after the portfolio is pushed and each host runs `deps:refresh`.

**Still open at S2's close:** whether subagents can invoke skills at all (S0 could not answer it, and
neither could this). GRAPH and LOOP mounted for the first time here, but this session named both
repeatedly while building the mount, so it is contaminated as a self-trigger test the same way
session `400d0cd7` was. The clean test is still available to a fresh session that does graph-shaped
or gate-shaped work without naming them.

### S3 — the feedback mechanism (what the owner asked for)

Two halves, matching the doctor's existing error/warn split and the no-model constraint.

**(a) Mechanical — doctor checks, pure git and file stat, no model, no self-report.** These catch the
failures we actually have:

> **S3a CLOSED 2026-08-11** (pantry `hygiene.ts` + `hygiene.test.ts`, four checks in `doctor.ts`, the
> `hygiene` config key; PLAN.md piece 11g). 41 new tests, tsc clean, 611/611 green. The thresholds are
> the owner's, answered through the answer channel rather than decided by the run that needed them
> (ref `2026-08-11-loop-hygiene-thresholds`), which is the part of this task that was not about code.
> **It earned itself on the first live run:** 42 commits in the portfolio since its newest run report,
> against a line of 15, and nothing before this said so.

- [x] **DONE. uncommitted-age** (warn): working tree dirty, and the oldest unstaged change is older than N
      days. This is the estate's number-one observed smell and nothing currently surfaces it.
      **The age is an mtime and mtime is a FLOOR**, so a file first written three weeks ago and touched
      this morning reads as fresh. That is the right direction for a warn: the check under-reports and
      cannot cry wolf, and what it actually measures is written, untouched since, and still uncommitted.
- [x] **DONE. unpushed-age** (warn): local branch ahead of its remote by N commits or M days. Directly
      targets the "LOCAL, push owner-gated" pile-up across passes 7 through 10. Count and age are an OR:
      one commit sitting a fortnight is a pile-up, and so is forty from this afternoon. A branch with no
      upstream is unmeasurable rather than maximally behind, since counting its whole history against
      nothing produces a number that is true and useless.
- [x] **DONE. no-remote** (info, not warn): mill and proof were 404 upstream by design when this was
      written; this must not read as a failure. Info in BOTH directions, so there is no state of this
      check that can be read as a fault.
- [x] **DONE. run-report-presence** (warn): a branch with commits and no run report under
      `artifacts/runs/`. Measured as commits since the newest DATED report, so it scales with work
      rather than the calendar; a host with no runs dir is silent, same as the evidence check.
- [x] **DONE. Every threshold config-driven** in `pantry.config` under `hygiene`, deterministic `now`
      injection for the age math, same discipline as 11a. **A key set to null MUTES its check** and says
      so in the detail line, while an absent key takes the estate default: a host that never mentioned a
      check has not opted out of it, and a host that said something must never be warned on a line its
      config appears to have turned off. A check nobody can turn off is a check everybody mutes.

**(b) Self-reported — the run ledger, agent writes, PANTRY renders.** This is 11c, unblocked by S1's
Verification sections.

> **S3b CLOSED 2026-08-07** (pantry `runs.ts` + `runs.test.ts`, the `runsDir` config key, a doctor
> `run-report-evidence` warn, `artifacts/runs/README.md`; PLAN.md piece 11c). 29 new tests, tsc clean,
> 212/215 suite green — the same 3 retrieval/app plan fixtures were red before this branch, confirmed
> by stashing the change and re-running. The schema is LOOP §9 read literally: nine items, each
> absent-or-present, no judgement call anywhere in the check.

- [x] **DONE.** Pin the run-report schema: which skills fired, the union of their verification checkboxes, gate
      output **verbatim**, the diffstat, what was not done, what needs human eyes. LOOP.md §4a already
      specifies the prose contract; this gives it a parseable shape. **The nine §9 items map to nine
      gap ids**; three of them are body headings (`Gate output`, `What was not done`, `What needs human
      eyes`) matched loosely on case, punctuation and level, and `Gate output` must hold a non-empty
      fenced block — prose where verbatim belongs is itself a gap. The S5 no-compression rule is
      written into the schema doc as a rule, not a preference.
      **One part of this bullet is deliberately NOT built: the union of the fired skills' own
      Verification checkboxes.** The report carries `skills:` (which fired), and §9 is the universal
      spine every run owes. Checking VOICE's or GRAPH's per-skill checkboxes on top would mean
      resolving each fired standard out of canon and matching its checkbox text against the report,
      which is a fuzzy match on prose — exactly the false-positive risk 9c warns about, and the same
      reason `doc-symbol-drift` is scoped to backticked identifiers. Revisit when a run has actually
      been slowed down by its absence.
- [x] **DONE.** Land reports at `artifacts/runs/<id>.md` — `artifacts/` already exists and is already served
      (11e), so this needs no new tracked dir, same move as decisions living under `plans/`.
      Config key `runsDir`, default `<artifactsDir>/runs`.
- [x] **DONE.** Frontmatter is the MILL-parseable subset (scalars + dash-lists), so the existing GRAIN adapter
      renders the body with no new parser. A two-field entry uses 11d's `label | detail` pipe
      convention (`gates: - bun test | 212 pass`).
- [x] **DONE, and one of them computes.** Doctor's `run-report-evidence` (warn) names the two most
      recent reports missing §9 items with their gaps and counts the rest; no runs dir at all is an
      info naming where a report goes, so a host that never opted in is never nagged. The computed one
      is **`scope-growth`**: `scope:` (declared envelope) versus `touched:` (what was hit), by prefix
      compare. LOOP §4b's scope cap was a promise with nothing measuring it; now it has a number.
- [ ] **Half landed 2026-08-11 with S3a, half deliberately not.** Of the two 11c checks held back for
      the threshold call: **branch with no ledger entry IS `run-report-presence`** and shipped. **Plan
      item claimed with no checkpoint in N days did not**, and it is not a threshold problem: a plan
      item has no timestamp of its own, so "claimed" would have to be derived from git history per item
      (timeline.ts's per-file walk), which is a git call per plan file at every session start and the
      cost this module refuses to pay. It needs a cheaper signal before it needs a number.

**(c) The surface — where adherence becomes visible.**

- [ ] **BLOCKED on the owner, and it is the open question below.** A `/loop` surface (or a home-strip
      row next to the audit / doc / graph / deps freshness pills): which skills fired over the last N
      runs, which red flags were hit, uncommitted and unpushed age, run reports missing evidence. The
      data layer is ready and surface-shaped; only the placement call is missing.
- [x] **DONE 2026-08-07.** Feed open loop-hygiene warnings into the AI-retrieval context pack (`/llms.txt`,
      `/knowledge.json`), the same way open decisions already lead it. That closes the loop: the next
      session reads its own adherence record at orientation. `Knowledge.incompleteRuns` + a
      `## Loop hygiene` callout that leads the pack beside open decisions, plus `/runs.json` as the
      machine twin. **Silent when the ledger is clean** — same rule the inbox follows, so it only ever
      shouts when something was actually skipped. Demonstrated live rather than asserted: the first
      report written under the schema flagged its own author's scope growth, and that warn is now the
      first thing `/llms.txt` says.
- [x] **DONE.** Surface gated by config (`runs`, default on — route, count, callout and surface entry
      all go with it), absent dirs degrade to empty-state guidance, never a crash.

### S4 — maximize graphify (the doc-drift half of the feedback loop)

**Audit, 2026-08-05.** We use roughly a third of the tool. `graphify --help` offers `explain`, `path`,
`affected`, `save-result`, `merge-graphs`, `diagnose multigraph`, `cluster-only`, `watch`, `clone`.
We use exactly two: `update` (via the PostToolUse hook, all 9 repos) and `query` (the GRAPH.md rule).
`GRAPH_REPORT.md` is generated in every repo and **nothing reads it**. `graphify-out/memory/` does not
exist anywhere, so the `save-result` feedback loop has never run. `pantry doctor` checks the graph's
*age* and never asks it a question. PANTRY's `drift.ts` (piece 9c) lints dead **links** only, never
symbols.

**Honest scope on "automate docs".** graphify is AST extraction plus clustering. It cannot *write* a
good doc — `explain` is neighbour-listing, not prose, and community naming needs an LLM backend we do
not wire in. What it can do, with **zero model and zero API cost**, is *check* docs, which is the half
that actually failed us. The ten-pass doc sweep (stale claims, dead symbol names, "three→four", the
150-300 contradiction) is exactly what a symbol-level check catches on pass one. So: automate the
verification, not the writing. That also keeps PANTRY's no-model constraint intact.

**Measured before built, 2026-08-07.** The severity was left open pending a false-positive rate, so the
rate came first: a throwaway probe over the portfolio's 33 docs, run against freshly rebuilt graphs,
before a line of the lint was written. Three findings, and each one changed the design.

*One:* **the shape of the reference decides everything.** Backticked bare calls (`doSomething()`) are
the only high-signal shape. 34 spans in scope, 25 resolved, 9 flagged; grepping all 9 against every
repo on disk, 5 were genuinely dead (`formFields`, `jsonBody`, `escHtml`, `inference` twice) and 4 were
real symbols graphify simply does not node. **56% precision.** Path refs were measured too, against a
better oracle than the graph (a whole-estate file index — graphify nodes no `.css` and no `.md`, so it
can only ever say "missing"). Even so: 14% flagged, and the flags were dominated by references that are
*correct* — generated artifacts, planned-but-unwritten notes, route payloads named without a slash.
A lint that shouts at a backlog for naming a file it intends to write is not worth having. Path refs
are out, and that is a closed question rather than a deferred one.

**Re-measured after building, same day, and the number moved.** The probe walked `docs/` raw against a
5-repo merge; the shipped check walks the doc *collections* the server serves (24 pages, not 33 files)
against the full 7-repo merge. On that footing: **7 flags, 3 of them real** — `formFields()`,
`jsonBody()`, `escHtml()`, each verified absent from all seven repos by grep — and 4 live symbols
graphify does not node (`observe`, `spot`, `clearConsole`, `decide`). **43% precision**, not 56%.
Recording the lower number because it is the one the shipped check actually produces. It does not
change the severity call: info was already the floor, and 3 real finds for 4 dismissals is a trade a
session can make in seconds.

*Two:* **the merged graph is a prerequisite, not a nice-to-have.** Against the portfolio's own graph the
flag rate was 73.5%; against a fresh 5-repo merged graph, 26.5%. The portfolio's docs are layer-doc
mirrors of sibling repos, so its own graph structurally cannot confirm a grain symbol. This promotes
`merge-graphs` out of the "lower priority" bucket it was filed in below.

*Three:* **staleness was doing real damage to the measurement.** Every repo but the portfolio was on an
8-day-old graph, and the false positives it produced (`manifestForReasoner`, `webgpuAvailable`,
`probeDevice`) all vanished on a rebuild. `graphify update` finished in 2 to 4 seconds on each of the
five estate repos, so the 2026-07-30 hang is specific to large *foreign* trees, exactly as the limit
below says, and does not argue against refreshing our own.

- [x] **DONE 2026-08-07. `doc-symbol-drift` (doctor, info).** `checkSymbolDrift` in `drift.ts`, wired as
      a `doc-symbol-drift` info check in `doctor.ts`. Info, not warn or error: 56% precision is worth
      SHOWING a session and not worth making anyone dismiss, and a noisy lint would undercut the
      drift-free claim the same way 9c warns about. Owner confirmed the severity against the measured
      rate. Bare call form only; method form, path refs and fenced code blocks are all out of scope by
      design, and the header comment in `drift.ts` records why for each. One problem per identifier per
      page. The check's detail line names *which* graph answered, because a count means nothing without
      it. Raising the severity later is a config change, not a rewrite.
- [x] **DONE 2026-08-07, but NOT the check this item specified.** The rule as written ("flag a plan
      whose declared touches are narrower than the blast radius") was measured first and **rejected on
      the numbers**. The radius of a single `config.ts` is 22 of pantry's files, 12 of which went
      untouched in the run that declared it. Requiring a scope to cover its radius would mean declaring
      the whole repo every time, which makes the declaration worthless. It also aimed at the wrong
      artifact: plan `touches:` is coarse and directory-level (`standards/`, `../pantry/`), while the
      thing that carries a real file list is the S3b **run report's** `scope:`.

      What the measurement *did* support, across all three run reports on disk: **11 of 11 files that
      grew past a declared scope were already connected to it in the graph. Zero surprises.** So the
      question worth asking is not "did you declare the whole radius" but "when you grew, could the
      graph have told you up front". Two pieces:

      - **`pantry scope <file...>`** — the pre-flight query. What a change to these files is likely to
        reach, asked *before* the work, so the declaration can be right the first time. This is the
        half that has actual leverage: the last two sessions both grew past their scope, and both
        times the answer was one query away.
      - **`scope-radius` (doctor, info)** — the post-hoc diagnosis, splitting each report's growth into
        predictable and surprising. Info, not warn: the run ledger already carries the warn for growth,
        and saying it twice at warn teaches people to skim both. It currently reports 11 predictable
        and 0 surprising, which is the honest state and not a bug.

      `graphify affected` is reimplemented in-process over `graph.json` rather than shelled out, because
      doctor runs it once per scope file per report and a subprocess each time is far too slow for
      something that fires at session start. Verified against the real binary on 8 seeds before being
      trusted, including the 22-file case: exact match on every one.

      **The two graph-backed checks want OPPOSITE artifacts, and getting it wrong is silent.** The
      symbol lint wants the widest graph available, because a portfolio doc may name any sibling repo's
      symbol. A blast radius wants the narrowest, because a run report's scope names files in *this*
      repo. Feeding the radius the merged graph made it report every local file as "outside any blast
      radius" on the first live run. Both call sites now name their graph explicitly and a test pins it.
- [ ] **`undocumented-export` (doctor, info).** Exported symbol with no mention in any doc the brain
      knows. Info, not warn — not everything deserves prose, and this would cry wolf as an error.
- [ ] **HACKING.md verification.** The portfolio hand-maintains a route → source map ("which file do I
      open to change X"). The graph knows that mapping. Verify the hand-written map against it rather
      than generating it — generated docs rot unread, a failing check gets fixed.
- [x] **DONE 2026-08-07. Read `GRAPH_REPORT.md` instead of only stat-ing it.** Doctor's
      graphify-freshness check now parses the report's built-from commit and compares it against
      `git rev-parse HEAD` (the report literally tells you to), falling back to the old age check when
      there is no report or no git. It justified itself on the first run: the portfolio's graph was
      **zero days old and built one commit behind HEAD**, so the age check was calling a stale graph
      fresh. It also showed the fallback is load-bearing rather than defensive, because an incremental
      `graphify update` sometimes writes a `GRAPH_REPORT.md` with no Graph Freshness block at all.

      **The first live run also caught a false positive in the check itself**, which is the part worth
      keeping. It flagged the portfolio, whose only churn since the graph was built was one markdown
      file. GRAPH.md §4 is explicit that the refresh re-extracts *code*, so doc commits legitimately
      leave the graph current. The check now diffs `builtFrom..HEAD` and only warns when something
      outside prose, images and lockfiles moved. Four outcomes, and an unreachable built-from commit
      (after a history rewrite) warns rather than silently passing, because failing to verify is not
      the same as verifying.

      **A second defect, found by review and reproduced before it was reported.** `GRAPH_REPORT.md`
      describes `graph.json`, the extraction. But `resolveGraphPath` *prefers* `merged-graph.json`,
      which `pantry graph merge` writes separately and which no report describes. So the check could
      read a report that was honestly current about a file nothing consumes, while `/map` and the
      symbol lint read the stale merged graph beside it. That is the same lie the mtime check was
      telling, moved one artifact over. It was live in the portfolio within minutes of the merge
      command existing: the edit hook re-extracted `graph.json` at 16:13 and the 16:10 merged graph
      went on being served under a clean "built from HEAD". A merge older than the extraction it should
      have included now short-circuits to a warn naming its own remedy.
- [ ] **First real drift the lint found (a content chore, not a tooling one).** `docs/batch/ARCHITECTURE.md`
      names `formFields()`, `jsonBody()` and `escHtml()`. None of the three exists anywhere in the
      estate: not in batch, not in grain, not in pantry, not here. So the layer doc describes a shape
      the code has moved past. Left unfixed deliberately — the lint's job this session was to be built
      and measured, and fixing the prose needs someone who knows what those three became. This is the
      payoff line for the whole item: three dead names in a published doc, found in one run, by a check
      that costs no model and no API call.
- [ ] **Wire `save-result`.** Every non-trivial graph Q&A written back to `graphify-out/memory/`, so
      the graph accumulates answers instead of re-deriving them. This is a second feedback loop and it
      costs nothing. Confirm the dir stays gitignored with the rest of `graphify-out`.
- [x] **DONE 2026-08-07. Estate graph via `merge-graphs`.** Promoted from "lower priority" by the
      measurement above, which showed the per-repo graph cannot answer for docs that describe sibling
      repos. `pantry graph merge [dir]` (new `graph.ts`, wired in `cli.ts`) scans the sibling repos for
      an existing `graphify-out/graph.json` and merges them into the host's own
      `graphify-out/merged-graph.json`, which `config.graphPath` already prefers. 7 repos in, 4735
      nodes, 7571 edges.

      **It only ever runs `merge-graphs`, never `update`.** That is the whole safety story: merging
      reads JSON that is already on disk, so the 2026-07-30 extraction hang cannot happen here. A repo
      without a graph is skipped and named, never built for. Capped at 120s with a kill-and-report, and
      `doctor` does not call it — it stays an explicit operator command, per the limit below.

      The payoff, measured end to end: the portfolio's `doc-symbol-drift` count went from 18
      unresolved identifiers on its own graph to 7 on the estate graph, and doctor's detail line says
      which graph answered so the number can be read at all. The stray `merged-graph.json` from the
      earlier experiment is now a produced artifact with a command behind it. Cross-repo *edges* were
      not the reason to build it and remain unevaluated; the merged **node set** is what the lint needs.
- [ ] **Known limits to respect:** `graphify update` HANGS on large foreign trees (pocket-tickets,
      >2min, backed out 2026-07-30) — any pantry integration must be opt-in per repo with a timeout,
      never a blocking step in `doctor`. And graphify query only wins on symbol names, never English
      prose (GRAPH.md §2); a pantry wrapper must not tempt anyone into prose queries.

### S5 — headroom (token savings, correctly scoped)

**Correction to the 2026-07-30 finding.** It was recorded as "a DUD, `router:noop`, 0% saved." That
test only ever ran on markdown. Re-tested 2026-08-05 across three content types: headroom is a
**router**, and it skips two of them on purpose.

| Content | Transform | Saved |
|---|---|---|
| Markdown prose | `router:noop` | 0% |
| Recent code (`doctor.ts`) | `router:protected:recent_code` | 0% |
| Repetitive log / doctor output | `router:search:0.21` | **79.2%** |

So it is not a dud, it is narrow: **repetitive machine output** is its whole niche — test runs, CI
logs, grep sweeps, doctor output across an estate. We generate a lot of that.

**The disqualifying caveat, and it decides placement.** The compression is lossy by truncation (33 log
lines rendered as 5 plus a retrieval hash) **and it corrupted the timestamps**: `2026-07-30` came back
as `2026:7:30`. That is fine for scanning, and fatal for anything quoted or parsed.

- [x] **DONE 2026-08-07, in the S3b schema.** Never on run-report gate evidence. LOOP.md §4a demands
      gate output *verbatim*. Compressed output is not verbatim, and the timestamp mangling proves it
      can silently alter what it returns. Written into `artifacts/runs/README.md` as a rule, not a
      preference, and the evidence check rejects a gate section that is prose rather than a fenced
      block — so the cheapest way to break the rule now fails a check.
- [ ] **Never on prose or code.** Zero savings by design; calling it there is pure overhead.
- [ ] **Where it may go:** an in-session convenience for scanning long repetitive tool output before
      reasoning over it. That is a harness habit, not estate infrastructure.
- [ ] **Decide: does this belong in canon at all?** Leaning no. It is a personal-harness tool like
      caveman and rtk, which the GRAPH.md rollout deliberately kept OUT of the published standard
      (2026-07-30). Consistency says headroom stays out too. Owner call — if it stays out, this task
      closes as a recorded decision and nothing ships.
- [ ] Fix the stale memory entry either way, so the "DUD" claim stops being repeated.

### S6 — canon rewrite + distribution

- [ ] Rewrite LOOP.md §1's Skills row. It currently claims the primitive through the standards set;
      once `pantry skills` exists, the claim becomes true and the row should say how.
- [ ] LOOP.md §5 cites the blog post but not the repo. Add the cite, and cash the "living base"
      caveat while doing it.
- [ ] LOOP.md §2 gains the verify *protocol* (CLAIM / EXTRACT / DOUBT / RECONCILE / STOP), and §4b's
      gate-red-twice gets the explicit cycle counter and escalation path.
- [ ] **New, from S3b.** §4a says a run closes with a report and does not say where the report lands or
      what shape it takes. It now has both (`artifacts/runs/<date>-<slug>.md`, the §9 items as
      frontmatter keys and three required headings), and §9 should say so in one line rather than
      leaving the convention to live only in PANTRY. Canon prose, so it waits for the owner's read.
- [ ] Split the checklists out of AI-DEVELOPMENT.md (221 lines, definition-of-done inside) into
      loadable `references/`. Their progressive-disclosure split matches our own "load one file, not
      six" rule better than we currently manage.
- [ ] `plugin.json` in the portfolio so `/plugin install` works for the standards. Doubles as a
      showcase artifact — the site sells the stack, and an installable stack sells harder than a
      readable one. KICKSTART could become an install rather than a paste-in prompt.

### S7 — the note

- [ ] A note once S3 has run long enough to have real data: what the adherence record actually showed.
      Honest limits over hype — if the skills mostly did not fire, that is the note. Folds into
      ai-workflow-loop P5 ("How I work with AI") rather than competing with it.

### S8 — the token budget (measured, not guessed)

**Baseline, 2026-08-05.** Cold start in the portfolio loads **14,163 chars, roughly 3.5k tokens**,
before a single line of work: `CLAUDE.md` 3,685 + `MEMORY.md` 9,488 + `~/.claude/RTK.md` 964 +
`~/.claude/CLAUDE.md` 26. Every session pays it. Nothing measures it.

- [x] **MEMORY.md trimmed** (done 2026-08-05). It was 9,488 chars across 31 lines — 67% of cold start
      — while its own rule says one line per memory and never the content. Worst line was 2,484 chars
      of pass-by-pass saga with commit hashes. Verified every detail still lived in the underlying
      memory files, then cut to true one-line hooks: **9,488 → 2,742**, about 1.7k tokens saved per
      session. The open risk is re-bloat; the rule needs holding, not just stating.
- [ ] **rtk: install it or rip it out.** The PreToolUse hook `rtk hook claude` fires on *every* Bash
      call and the binary exists nowhere on this machine (checked `~/.local/bin`, `~/.cargo/bin` —
      no cargo at all — `/usr/local/bin`, `/opt/homebrew/bin`, npm global, brew list). Meanwhile
      `@RTK.md` costs ~250 tokens per session advertising 60-90% savings on git, grep, find, and ls
      output that we do not receive. It is real and recoverable: homebrew-core formula, Apache-2.0,
      v0.44.2, <https://github.com/rtk-ai/rtk>; `brew install rtk` is the whole fix because the hook
      is already written. Owner call, but the current state is the worst of both — full cost, zero
      benefit.
- [ ] **`claude-md-size` doctor check (warn).** Estate median is ~3,300 chars. greenroom is **36,255**
      and bread is **17,993**. LOOP.md §3 already calls a config-dump `CLAUDE.md` a bug and asks for a
      cold read under a minute; opening greenroom costs ~9k tokens before you type. The standard has
      the rule and no measurement — this is the measurement. Threshold owner-set, same as S3a.
- [x] **Split greenroom + bread `CLAUDE.md`** (done 2026-08-05, LOCAL, unpushed). Front door keeps
      what-this-is, commands, the non-negotiables, definition of done, and the pointers; the depth
      moved verbatim into `docs/ALIGNMENT.md` (the when-you-change-X-update-Y table, the bulk in both)
      and `docs/OPERATING-NOTES.md`. **greenroom 36,255 → 9,065. bread 17,993 → 8,620.** Nothing
      deleted — extracted by line range, then spot-checked for the distinctive strings on both sides.
      `pantry doctor` after: both 0 failing, doc links resolve 0 problems. bread also stopped forking
      the graphify rules into its front door and now points at `/standards/graph` instead, which is
      the reference-don't-fork rule it was quietly breaking.
- [ ] **Pick one code-graph tool.** `tokensave` 7.0.2 sits installed and unwired at `~/.local/bin`
      (34 languages, semantic queries instead of file reads, its own token counter; indexed the
      portfolio in 351ms — 207 files, 1749 nodes). It overlaps graphify heavily. Running two half-way
      is worse than running one fully; S4 should evaluate them head to head and drop one.
- [ ] **Bound unpredictable command output.** `tokensave status` returned ~35KB of ANSI art in
      testing; the harness capped it by persisting to a file, which was luck rather than discipline.
      Worth a line in the standards: pipe through `head` when you cannot predict the size.
- [ ] **Gotcha worth recording:** `tokensave status` prompts interactively and **auto-answers yes**
      under a non-TTY shell, silently running `init` (1.9MB `.tokensave` + a `.gitignore` line).
      Reverted on discovery. Any pantry integration must pass an explicit non-interactive flag.

**Ranked by measured saving:**

| Fix | Saves | Effort |
|---|---|---|
| MEMORY.md one-line rule | ~1.7k tokens/session | done |
| rtk installed, or hook + import removed | 60-90% of Bash output, or ~250 tokens/session | minutes |
| Split greenroom + bread `CLAUDE.md` | up to ~9k tokens on those repos | a pass each |
| `claude-md-size` doctor check | prevents recurrence estate-wide | S3a-sized |
| One graph tool, fully wired | queries instead of file reads | S4 |

---

## What we are explicitly not adopting

- **The 24-skill catalog.** Format, not inventory.
- **Google team norms** (Hyrum's Law, the Beyonce Rule, line-count change sizing). Team-scale; solo estate.
- **The `.gemini/` and Antigravity command dirs.** Claude-only.
- **Automations / scheduled agents.** Already consciously rejected 2026-07-26 (LOOP.md §1). Their set
  does not push it either.

## Non-negotiables carried through every phase

- **PANTRY runs no model.** Mechanical checks are stats, git plumbing, and graph queries — graphify's
  extraction is AST-only and costs nothing. The self-reported half is written by the agent and only
  rendered.
- **Verification automated, never authorship.** graphify checks docs; it does not write them. A
  generated doc rots unread; a failing check gets fixed.
- **Evidence stays verbatim.** No compression, summarization, or truncation touches gate output in a
  run report. headroom mangled a timestamp in testing; that is the whole reason for the rule.
- **SSOT.** Standards are canonical; skills are a generated, gitignored view. No repo forks canon.
- **Nothing new is committed per repo.** Skills mount, reports land in `artifacts/`, decisions under
  `plans/`. No new tracked dirs.
- **Absent pieces degrade to info.** A repo with no remote, no e2e, or no package is not a failure.
- **The loop drafts, the human lands.** None of this changes the merge gate.

## Open questions

- ~~S0 outcome gates S1's scope — do skills fire unprompted, and at what description quality?~~
  **Answered 2026-08-05** (`plans/decisions/2026-08-05-skills-self-trigger.md`): yes unprompted, but
  only for command-register descriptions. Ours never fired. S1 gains the register spec.
- ~~Can subagents invoke skills at all?~~ **Yes, answered 2026-08-05.** A subagent asked to list its
  own tools reports `Skill` among them. So `pantry skills sync` serves delegated work as well as
  main-thread sessions, and the S0 control arm's silence was a real choice, not a missing tool.
- Third-party skills: config allowlist through `pantry skills`, or per-repo by hand? (S2)
- ~~Thresholds for uncommitted-age and unpushed-age. The estate's real pattern is weeks, not days —
  pick numbers that flag the pile-up without crying wolf on a normal working day.~~ **Answered by the
  owner 2026-08-11** through the answer channel (ref `2026-08-11-loop-hygiene-thresholds`): option B, a
  working week. 5 days uncommitted, 5 days or 25 commits unpushed, a run report every 15 commits.
  Decided against measured commit rate (9.9 per active day in the portfolio, peak 42), and the known
  cost was stated when it was chosen: pushes here are authorised in bursts days apart, so unpushed-age
  will sometimes warn about the gap between authorisations rather than about the work.
- Does `/loop` earn its own surface, or is it a home-strip row? (S3c)
- `doc-symbol-drift` severity: error (fails CI, like the link lint it extends) or warn (surfaced, the
  cognitive tier acts)? Depends entirely on the false-positive rate on a first run. (S4)
- Is the merged estate graph worth building, or are cross-repo edges too thin to earn a surface? (S4)
- Does headroom belong in canon at all, or stay a personal-harness tool like caveman and rtk? Leaning
  out, for consistency with the GRAPH.md rollout decision. (owner, S5)

## Definition of done

`pantry skills sync` mounts canon as firing skills in every kit repo, `pantry doctor` flags
uncommitted and unpushed pile-up plus missing run evidence, a run report has a schema and the 11c
checks read it, doctor *queries* the graph instead of only stat-ing it (symbol drift, declared-versus-real
blast radius, freshness by commit not file age), and the adherence record feeds back into the next
session's orientation. The proof is the same as LOOP.md's: you cannot tell the repos apart by how they
are worked — and now you can tell, per repo, whether the loop was actually followed.
