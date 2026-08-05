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
- [ ] **Self-trigger test still open, and needs a FRESH session.** Appearing in the list is not the
      same as firing unprompted. Next portfolio session: work normally on a multi-file change, do NOT
      name the skills, then record whether `incremental-implementation` fires on its own, at what
      moment, and whether it changed the output. `doubt-driven-development` wants a genuinely risky
      decision to trigger against, so it may need a second sitting.
- [ ] Record the answer in `plans/decisions/`. It gates S1's scope.

**Exit:** a decision file saying fire / did-not-fire with the trigger evidence. If they do not fire,
the description shape is the whole lesson and S1 shrinks to "fix our frontmatter"; S2 onward still
holds, because materializing is useful regardless.

### S1 — the skill format, canon side (portfolio `standards/`)

Standards stay canonical and published at `/standards`. Skill form is a *generated view*, never a
second copy — the SSOT rule holds.

- [ ] Add a `when:` frontmatter key to each standard: trigger-shaped, not summary-shaped. "Use when
      you are about to write prose under the byline. Use before any commit that touches
      `content/`." Current `title` + `summary` are page prose; `summary` makes a bad description.
      Confirm MILL ignores the unknown key before touching all 15 files.
- [ ] Add a **Rationalizations** table to the three standards that get skipped most. Named excuse,
      named rebuttal, one row each:
      - VOICE — "one em-dash reads better here", "this is internal so the voice rules are off"
        (the voice-lint pass caught 41 prose TELLs; each one had an excuse behind it).
      - GRAPH — "faster to just grep", "the graph is probably stale."
      - LOOP §2/§4 — "I wrote it and I checked it, that counts", "the gate is flaky, run it again."
- [ ] Add **Red Flags** to the same three. Ours must include the estate's real one: uncommitted or
      unpushed work accumulating across sessions.
- [ ] Add **Verification** checkboxes to each. This is the load-bearing one — it is the 11c ledger
      schema, so keep the lists short, mechanical, and evidence-shaped (gate output verbatim, not
      "tests pass").
- [ ] Do NOT import their 24-skill catalog. We have 15 standards and a thin-kit principle; take the
      format, not the inventory. Same for the Google team norms (Hyrum's Law, the Beyonce Rule,
      change-size line counts) — team-scale, and we are solo.

### S2 — `pantry skills` (the estate-wide rollout)

The whole point of routing this through PANTRY: the owner works several repos at once, and PANTRY is
already in all of them. One command, same surface everywhere.

- [ ] `pantry skills sync [dir]` — materialize `.claude/skills/<slug>/SKILL.md` from canon. Resolve
      the standards out of the portfolio package with `import.meta.resolve`, the exact trick 11b
      already uses for `CLAUDE.starter.md`, and degrade to a skip when the package is absent.
- [ ] Generated, gitignored, never committed — same posture as `graphify-out`. Reference-don't-fork
      holds: no repo carries a copy, every repo mounts the same canon.
- [ ] Emit frontmatter as `name` (the slug) + `description` (the `when:` line from S1). Body is the
      standard, unchanged.
- [ ] `pantry skills list` — what is mounted, what version, how stale.
- [ ] Fold into `pantry init --kit` so a new repo gets skills on day one.
- [ ] Doctor gains **skills-freshness** (warn): mounted skills older than the canon they came from,
      or absent in a kit repo. Absent package degrades to info, never a false alarm.
- [ ] Decide whether third-party skills (theirs, if S0 is positive) are mounted by the same command
      from a config allowlist, or installed per-repo by hand. Config allowlist is the estate-consistent
      answer; confirm at S2.

### S3 — the feedback mechanism (what the owner asked for)

Two halves, matching the doctor's existing error/warn split and the no-model constraint.

**(a) Mechanical — doctor checks, pure git and file stat, no model, no self-report.** These catch the
failures we actually have:

- [ ] **uncommitted-age** (warn): working tree dirty, and the oldest unstaged change is older than N
      days. This is the estate's number-one observed smell and nothing currently surfaces it.
- [ ] **unpushed-age** (warn): local branch ahead of its remote by N commits or M days. Directly
      targets the "LOCAL, push owner-gated" pile-up across passes 7 through 10.
- [ ] **no-remote** (info, not warn): mill and proof are 404 upstream by design as of the last sweep;
      this must not read as a failure.
- [ ] **run-report-presence** (warn): a branch with commits and no run report under `artifacts/runs/`.
- [ ] Every threshold config-driven in `pantry.config`, defaults sane, deterministic `now` injection
      for the age math — same discipline as 11a.

**(b) Self-reported — the run ledger, agent writes, PANTRY renders.** This is 11c, unblocked by S1's
Verification sections.

- [ ] Pin the run-report schema: which skills fired, the union of their verification checkboxes, gate
      output **verbatim**, the diffstat, what was not done, what needs human eyes. LOOP.md §4a already
      specifies the prose contract; this gives it a parseable shape.
- [ ] Land reports at `artifacts/runs/<id>.md` — `artifacts/` already exists and is already served
      (11e), so this needs no new tracked dir, same move as decisions living under `plans/`.
- [ ] Frontmatter is the MILL-parseable subset (scalars + dash-lists), so the existing GRAIN adapter
      renders the body with no new parser.
- [ ] Doctor's 11c checks, now that the schema exists: report missing gate evidence, plan item claimed
      with no checkpoint in N days, branch with no ledger entry.

**(c) The surface — where adherence becomes visible.**

- [ ] A `/loop` surface (or a home-strip row next to the audit / doc / graph / deps freshness pills):
      which skills fired over the last N runs, which red flags were hit, uncommitted and unpushed age,
      run reports missing evidence.
- [ ] Feed open loop-hygiene warnings into the AI-retrieval context pack (`/llms.txt`,
      `/knowledge.json`), the same way open decisions already lead it. That closes the loop: the next
      session reads its own adherence record at orientation.
- [ ] Surface gated by config, absent dirs degrade to empty-state guidance, never a crash.

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

- [ ] **`doc-symbol-drift` (doctor, error or warn).** Extend `drift.ts` past links: a doc that names a
      symbol (backticked identifier, a `file.ts:line` ref) which no longer exists in `graph.json` is
      drift. Keep it as narrow and high-signal as the existing link lint — backticked identifiers and
      path refs only, never bare English words. A noisy lint would undercut the drift-free claim the
      same way 9c warns about.
- [ ] **`touches:` verification via `graphify affected` (doctor, warn).** Plan frontmatter carries a
      hand-maintained `touches:` list. `graphify affected "X" --relation ... --depth N` computes the
      real blast radius. Flag a plan whose declared touches are narrower than the graph says. This is
      not cosmetic: LOOP.md §4b's **scope cap** is currently a promise with no measurement, and this
      makes it measurable.
- [ ] **`undocumented-export` (doctor, info).** Exported symbol with no mention in any doc the brain
      knows. Info, not warn — not everything deserves prose, and this would cry wolf as an error.
- [ ] **HACKING.md verification.** The portfolio hand-maintains a route → source map ("which file do I
      open to change X"). The graph knows that mapping. Verify the hand-written map against it rather
      than generating it — generated docs rot unread, a failing check gets fixed.
- [ ] **Read `GRAPH_REPORT.md` instead of only stat-ing it.** It already carries node/edge/community
      counts, extraction confidence, and the built-from commit. Doctor's graphify-freshness check
      should compare that commit against `git rev-parse HEAD` (the report literally tells you to) —
      a far better staleness signal than file age, which is what we use now.
- [ ] **Wire `save-result`.** Every non-trivial graph Q&A written back to `graphify-out/memory/`, so
      the graph accumulates answers instead of re-deriving them. This is a second feedback loop and it
      costs nothing. Confirm the dir stays gitignored with the rest of `graphify-out`.
- [ ] **Estate graph via `merge-graphs`.** BREAD is the cross-repo control plane; a merged graph is the
      map it claims to be. PANTRY already has a stray `merged-graph.json` from an earlier experiment.
      Decide the owner (bread renders it, or `pantry --estate`), and whether cross-repo edges are real
      enough to be worth it. Lower priority than the per-repo checks above.
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

- [ ] **Never on run-report gate evidence.** LOOP.md §4a demands gate output *verbatim*. Compressed
      output is not verbatim, and the timestamp mangling proves it can silently alter what it returns.
      Write this into the S3b schema as a rule, not a preference.
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

- S0 outcome gates S1's scope — do skills fire unprompted, and at what description quality? (owner + evidence)
- Third-party skills: config allowlist through `pantry skills`, or per-repo by hand? (S2)
- Thresholds for uncommitted-age and unpushed-age. The estate's real pattern is weeks, not days —
  pick numbers that flag the pile-up without crying wolf on a normal working day. (owner, S3a)
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
