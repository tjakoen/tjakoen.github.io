# AI-DEVELOPMENT.md — how I build full stack with AI

A portable playbook for developing software with an AI partner. Drop this into any
repo. It's not about a specific stack — it's about **how the human and the AI work
together**, the standards that keep the work honest, the pitfalls that recur, and the
way problems get turned into solutions.

The one-line version: **I direct, the AI types.** I own the intent, the architecture,
and the taste; the AI does the reading, drafting, and legwork at speed. Neither replaces
the other.

> Companion: **[`SESSION-LOOP.md`](SESSION-LOOP.md)** owns the *mechanics* — how a session
> orients, the loop it repeats, memory, handoff, and model economy. This file owns the
> *standards* it all runs against. The full folder map is **[`README.md`](README.md)**.

---

## 1. The working relationship

**I set direction; the AI executes and reports.** My job is deciding *what* and *why*
and judging *is this right*. The AI's job is *how*, fast, plus surfacing what I can't see
from where I sit (every call site, the edge case, the doc that contradicts the code).

**AI is augmentation, not replacement.** It extends what I can do — it doesn't do it
instead of me. I stay in the loop on anything that's hard to reverse or outward-facing.
I read the diff before it lands. I don't merge what I haven't understood.

**The AI is an operator, and a good operator is legible.** I want to see what it's
doing and why: plans before big changes, honest reports after (what passed, what was
skipped, what's still broken). No "done!" when it isn't.

**Trust the code over any memory, doc, or my own claim.** When the AI finds that
reality contradicts what it was told, it says so instead of proceeding on the wrong
premise. That's the whole value of a second reader.

---

## 2. How I interact with the AI

- **Give intent, not just tasks.** "Add caching" is weak. "Reads should survive a cold
  cache without a flash of stale content — figure out where" gives the AI a target it
  can reason against. State the *why*; let it find the *how*.
- **Front-load constraints.** Say the non-negotiables up front (layering, no new deps,
  match surrounding style). Cheaper than correcting after.
- **Plan before big moves.** For anything non-trivial, get a plan first and approve it.
  Small mechanical edits don't need it.
- **One decision at a time when it's genuinely mine.** If a choice changes what gets
  built and I haven't specified it, the AI asks — with a recommendation, not a survey.
  If there's an obvious default, it picks and tells me.
- **Act when the info is there.** Don't re-ask what's already answered. Don't re-litigate
  a settled decision. When there's enough to act, act.
- **Delegate wide reading.** "Where is X used, what calls Y, map this dir" is exactly
  what to hand off — I want the conclusion, not the file dumps.
- **Demand faithful reports.** Tests fail → say so with the output. Step skipped → say
  that. Done and verified → say it plainly, no hedging.

---

## 3. Standards (the bar every change is held to)

- **Definition of done = code + tests + docs synced + green checks.** Not one of these.
  All of them. "It compiles" is not done.
- **Match the surrounding code.** Same naming, same idioms, same comment density. New
  code should read like it was always there, not like a graft.
- **Tests are part of the work, written as you build** — not a chore bolted on after.
  If behavior changed and no test covers it, the work isn't finished.
- **Keep the green gate green.** Typecheck + tests pass *before* calling something done,
  every time. A red build is a stop-the-line event.
- **Single source of truth per fact.** Every concept has one home. Everything else
  *points at* it — a projection, never a fork. Two copies of a truth drift; then both
  are suspect.
- **Docs travel with code.** Change behavior → update the doc that describes it, same
  change. Stale docs are worse than none; they actively mislead the next reader.
- **One vocabulary.** Reference the real registry/type/constant, never a magic string
  copy of it. Drift between "the word" and "the thing" is a whole class of silent bugs
  designed out.

---

## 4. Conventions (defaults that hold across projects)

- **Keep dependencies close to the floor.** Every dep is a liability — a build step, a
  supply-chain surface, a thing to upgrade. Reach for the platform first; add a library
  only when it earns its place.
- **Index the codebase for the AI.** A whole-repo knowledge graph (I use
  [`graphify`](https://github.com/safishamsi/graphify) — local tree-sitter AST, zero API
  cost) lets the AI answer "what connects X to Y", "where does this abstraction live", and
  orient itself from a scoped subgraph instead of re-reading and re-grepping raw files.
  Measured ~20x fewer tokens per codebase question on this repo. Keep it *fresh or it
  lies*: rebuild on the post-commit hook (`graphify hook install`) and after any code edit
  (`graphify update .`, AST-only, free). It's a **dev aid**, not a runtime dep — output is
  generated and git-ignored, so the foreign toolchain (Python) stays out of the app. The
  graph is an orientation layer, not a substitute for reading the actual lines you're about
  to change.
- **Tokens/config over hardcoded values.** Colors, sizes, endpoints, feature flags —
  named in one place, read everywhere. Re-skin or re-point by changing the source, never
  by editing every consumer.
- **One direction of dependency.** Lower layers know nothing of higher ones. If you have
  to reach across or upward, add a *port* (an interface the lower layer defines, the
  higher one implements) — don't create a back-channel.
- **One write path.** All mutations go through a single door you can see, log, and test.
  Reads can be many; writes should be one. Auditability falls out for free.
- **Absolute paths and repo-root-relative commands.** Fewer "works on my machine"
  surprises.
- **Commit/push only when asked.** Branch off main for anything non-trivial. Never add
  AI co-author trailers or attribution unless explicitly wanted.
- **Conventional-ish commits.** `type: imperative summary`. Body only when the *why*
  isn't obvious from the diff.
- **Match the model to the task — plan and orchestrate in Opus, execute and delegate to Sonnet subagents where possible.**
  Reason with the strongest model (planning, architecture, hard debugging); once the plan's approved,
  execute on the mid tier; hand wide reads to a small-model subagent. The default is to drop off the
  big model as soon as the work stops being *thinking*. The full rule of thumb and how to actually
  capture the savings is **[`SESSION-LOOP.md`](SESSION-LOOP.md) §6**.

### Reusable prompt: index the codebase for the AI

Paste into a fresh session in any repo to set up the knowledge-graph index (see the
"Index the codebase for the AI" convention above). Freshness rides the git post-commit
hook + a free AST update — *never* the build or test step (they fire on unchanged code;
the graph would rebuild for nothing).

```
Set up graphify (github.com/safishamsi/graphify) as a token-saving dev aid in this repo —
a whole-repo tree-sitter knowledge graph I query instead of grepping/re-reading raw files.

1. Install (skip if present): `uv tool install graphifyy` (CLI is `graphify`; fall back to
   `pipx install graphifyy` without uv).
2. Build free (AST-only, no API cost): `graphify update .` — confirm graphify-out/ exists,
   report node/edge count.
3. Auto-update on commit: `graphify hook install` (post-commit + post-checkout). Note that
   hooks are per-clone (not committed) — each clone re-runs this.
4. gitignore graphify-out/ (generated, per-machine).
5. Register with Claude Code: `graphify claude install` (appends a section to CLAUDE.md +
   two PreToolUse hooks to .claude/settings.json). Then DELETE the "matcher": "Read|Glob"
   hook block — keep only the "matcher": "Bash" grep gate — and validate the JSON. (The Read
   gate nags on every source read including edits: pure friction.)
6. Verify: `graphify query "<real question about this repo>"` + `graphify benchmark`; report
   the token-reduction figure.
7. If this repo has a standards/AI-dev doc, add a short "Index the codebase for the AI"
   bullet (what it is, ~Nx fewer tokens/query, updates via post-commit hook + free
   `graphify update .`, dev aid only — git-ignored output, never a runtime dep).

Rules: don't commit unless I ask. Stage only the graphify files; leave unrelated changes
unstaged. Report committable (.gitignore, CLAUDE.md, standards doc) vs local-only
(.claude/settings.json, git hooks). Rollback: `graphify claude uninstall` +
`graphify hook uninstall`.
```

---

## 5. Common pitfalls (and the guard for each)

| Pitfall | What it looks like | Guard |
|---|---|---|
| **Silent failure** | An op quietly no-ops; the AI looks stuck or "done" but nothing changed | Make invalid states loud — no-op *and report*. Never fail quiet. |
| **Fixing the instance, not the cause** | Same bug returns in a new spot | Ask *why it was possible*; close it at the source (contract, type, doc). |
| **Docs drift** | Doc says one thing, code does another | Trust code; fix the doc in the same change. SSOT + projections. |
| **Magic-string drift** | A verb/key copied as a literal, silently out of sync | Reference the registry, not a copy. Drift-guard the exceptions. |
| **Premature abstraction** | A framework for a problem you have once | Wait for the third occurrence. Two is a coincidence. |
| **Scope creep in a "small" edit** | A one-liner touches nine files | Name the scope up front; if it grows, stop and re-plan. |
| **Merging what you don't understand** | AI-written code lands unread | Read the diff. If you can't explain it, don't ship it. |
| **Over-trusting recalled memory** | Acting on a stale fact about a file/flag | Verify it still exists before relying on it. |
| **Confident-but-wrong AI** | Plausible answer, no evidence | Ask for the file:line. Make it show, not assert. |

---

## 6. Problem → solution (the loop)

1. **Reproduce / locate first.** Don't theorize into the void. Find the actual line.
   Delegate the search if it's wide.
2. **Name the root cause, not the symptom.** "Token expiry uses `<` not `<=`" — a
   specific, checkable claim, not "auth is flaky."
3. **Smallest fix that closes the cause.** Then ask: can the *class* of this bug be
   designed out? Sharpen the type, tighten the contract, fix the misleading doc.
4. **Prove it.** A test that fails before and passes after. Run it. Quote the result.
5. **Sync the ripple.** Anything that had to change alongside — docs, tests, related
   call sites — changes now, not "later."
6. **Record the non-obvious.** If a real decision got made or something surprising got
   learned, write it down so the next session (human or AI) inherits it — the memory format
   and where each kind of fact lives is **[`SESSION-LOOP.md`](SESSION-LOOP.md) §4**.

**Core principle: a mistake is a signal about the system, not just the operator.** When
the AI trips, or a person trips, suspect the docs/design *first*. An operator stumbling
measures the system's clarity. The bar: this should be easy for a human and *even more*
legible and operable for an AI. If the AI got it wrong, the contract probably let it.

---

## 7. Seeing the work

- **Show, don't tell.** For anything visual or behavioral, produce the artifact —
  screenshot, running output, a rendered page — not a description of it.
- **Verify end-to-end before calling it done.** Drive the real flow, not just the unit
  test. Tests green + feature actually exercised = done.
- **Report honestly, always.** What works, what's untested, what's known-broken. The
  value of the report is its truth.

---

## 8. Quick checklist (paste at the top of a session)

```
Before done:
[ ] Code matches surrounding style
[ ] Tests written + passing (right tier for the change)
[ ] Typecheck / lint green
[ ] Docs synced to behavior (SSOT, no forks)
[ ] Root cause closed, not just the instance
[ ] Diff read and understood
[ ] Decision/surprise recorded if non-obvious
```

---

*This is a living document. When how I work changes, update it — the same rule it asks
of everything else.*
