# AI-REPO-STANDARD.md — structure a repo so AI sessions compound

A portable standard for the *repo side* of AI-assisted development. Its companion,
**AI-DEVELOPMENT.md**, covers the working relationship — how the human and the AI interact,
the standards a change is held to, the pitfalls. This file covers the **machinery you commit
to the repo** so that every AI session inherits everything the previous sessions learned,
instead of starting from zero and re-making old mistakes.

Distilled from a repo where this is working well
([the bread monorepo](https://github.com/tjakoen/bread)). Drop this file into any repo and
build the kit below.

The one-line version: **treat every AI mistake as a bug in the repo's docs or architecture,
and fix it where it compounds — in a committed contract, not in the chat.**

---

## 0. The core principle everything else serves

> **An operator tripping on the system measures the system's clarity, not just the
> operator's.** If the AI got something wrong building here, suspect the docs or the design
> first. The bar: the repo must be easy for a human and *even more* legible and operable
> for an AI.

A chat session is disposable; the repo is durable. Anything learned in a session — a
decision, a trap, a convention — is lost unless it lands in a committed file the next
session will actually read. Every pattern below is a different answer to "where does this
learning go so it can't be lost?"

---

## 1. The file kit

| File | Job | One-line test that it's working |
|---|---|---|
| `CLAUDE.md` (root) | Onboarding + operating rules. The front door for any AI or human. | A fresh session can start real work without asking orientation questions. |
| `CLAUDE.md` (per subsystem) | That area's non-negotiables + its **hard-won lessons**. | The same mistake never ships twice in that subsystem. |
| `AUDIT.md` | A repeatable alignment runbook: does the repo still obey its own rules? | Any session (human or AI) can run it and produce the same findings. |
| `DOCS.md` | The map: where every doc lives and what altitude it covers. | No one greps for "where is the doc about X." |
| `ROADMAP.md` (or PLAN.md) | The canonical execution plan; read before substantive work. | Parallel sessions don't drift or duplicate effort. |
| `AI-DEVELOPMENT.md` | The interaction playbook (portable, copied between repos). | New collaborators (human or AI) work the same way. |

Small repo? Collapse the kit: one `CLAUDE.md` with an audit section and a plan section.
The *jobs* are the invariant, not the file count.

---

## 2. The root CLAUDE.md — onboarding, not a config dump

The strongest CLAUDE.md files read like onboarding for a new senior hire, and they follow
a consistent shape:

1. **A self-maintenance contract in the first lines.** *"Read this first, then the docs it
   points to. Keep it accurate: if you change how the project works, update this file too."*
   This single sentence is what keeps the file alive instead of rotting.
2. **What this is** — one paragraph plus (if layered) a small dependency diagram. The AI's
   mental model of the architecture forms here; get the direction of dependency into it early.
3. **A reading order, why-first.** Numbered: philosophy/intent doc first, then the rulebook,
   then the reference docs. An AI that knows *why* the rules exist applies them to cases the
   rules never anticipated. Name the single source of truth explicitly ("the SSOT for X is
   `path/to/file.ts`") and name the reference example ("the reference screen is `/loop`").
4. **Commands** — the exact dev/check/test invocations, nothing the AI has to guess.
5. **Non-negotiables** — a *short* list of the rules that must never break, each one line,
   pointing at the full rule elsewhere. Not the whole rulebook: the five things that, if
   violated, poison everything downstream.
6. **The sync table** (§3) and the **definition of done** (§8).
7. **Working notes** — commit etiquette, environment quirks, "run from repo root."

What it is *not*: a style guide, a changelog, or a dump of everything. Length is a cost the
AI pays every session — every line must earn its place, and detail belongs in the docs the
reading order points to.

---

## 3. The sync table — "when you change X, also update Y"

The single highest-leverage pattern. Drift — code that outgrew its docs, a copied constant
that diverged, a test that no longer covers the behavior — is the default failure mode of
AI-speed development, because the AI happily changes X without knowing Y exists.

The fix is an explicit table in CLAUDE.md mapping every *kind* of change to everything that
must move with it:

| You change… | …also update |
|---|---|
| A public verb / API action | the type/registry → its handler → unit + integration test → the contract doc |
| A component | its colocated doc → a test for any behavior → the catalog/index |
| A design token / config value | the one source file only (never per-consumer) |
| User-visible behavior | the doc that describes it, in the same change |
| A plan/roadmap step | tick it in the plan → sync the affected layer's plan |
| A notable decision | a memory / decision record, so the next session inherits it |

Build the table from *your* repo's real change-kinds, and grow it: every time drift is
discovered, that's a missing or incomplete row — add it. The table turns "keep docs in
sync" from a virtue into a checklist an AI can walk mechanically.

---

## 4. Subsystem CLAUDE.md + the hard-won lessons section

Each major subsystem (layer, package, app) carries its own `CLAUDE.md`, seeded from a shared
starter template, with two payloads:

- **That area's non-negotiables** — the local rules (import boundaries, file conventions,
  idioms) that a session working *only here* must know.
- **Hard-won lessons — do NOT repeat these.** The most valuable section in the whole kit.

The lessons format that works:

- **Numbered, and framed as root causes, not incidents.** Not "we had a bug in the
  spotlight" but "if a treatment needs a new rule per surface kind, the treatment is at the
  wrong altitude — attach it to the geometry, not the element."
- **Symptom → cause lines** for the traps that *look* like something else: "a demo that
  does nothing for a beat, or can't be stopped = dropped early ops, not logic." This is what
  lets a future session diagnose in one read instead of one afternoon.
- **A shared root named up front** when the lessons rhyme: "these all share one root —
  reaching for a bespoke mechanism instead of the vocabulary that already exists, and
  contracts that fail silently."
- **The meta-lesson stated explicitly:** if you (human or AI) keep getting something wrong,
  the *contract* is unclear — fix the contract or add a test that catches misuse; don't
  just patch the instance.

Write a lesson the moment its bug is fixed, while the causal chain is fresh. A lesson that
only exists in a chat transcript is a lesson the repo never learned.

---

## 5. AUDIT.md — the alignment runbook

A committed, repeatable procedure that checks the repo still obeys **its own rules**. The
design rules that make it work:

- **The canon defines "aligned"; the audit only references it.** AUDIT.md points at
  CLAUDE.md and the concept docs — it never restates them. If a check and a canon doc
  disagree, the canon wins and the audit gets fixed. (Single source of truth applies to
  the audit itself.)
- **Every check is a command plus a pass bar.** Not "check layering" but the actual grep
  with the expected output ("expect none"). Mechanical checks are checks an AI can run
  identically every time:

  ```bash
  # layering purity: lower layer imports nothing from upper → expect zero hits
  grep -rn "import" lower/ --include=*.ts | grep -iE "upper|app"
  # hardcoded values that should be tokens/config → expect zero hits
  grep -rnE "#[0-9a-fA-F]{3,6}|rgb\(" components/ --include=*.css
  ```

- **A findings template:** ✅ passing / ⚠️ findings as `file:line` — what — fix-or-flag /
  deferred-and-accepted. "Done" = all green + every finding fixed or explicitly flagged.
- **When to run:** before a commit, after a big change — and periodically as a **full pass
  with your strongest model**, including an adversarial review of recent landings. Fix the
  findings in the same session and commit the report; the report doubles as a dated
  snapshot of the repo's health.

---

## 6. Single source of truth + projections

Every fact gets exactly one home; everything else *points at* it or *summarizes* it — a
projection, never a fork. Concretely:

- Concept docs are the source; landing pages, READMEs, and teasers are projections that
  must "summarize the source truly and add nothing the source doesn't have."
- A **capabilities list per subsystem** ("what X gives you": heroes + also-rans) as the
  single source for what it does — with an audit check that walks code against the list
  both ways: a shipped capability missing from the list is a finding (buried), a listed
  capability that no longer exists is a finding (stale).
- `DOCS.md` maps it all, one table: doc → where it lives → what it is → what altitude.

Why this is an *AI* concern and not just hygiene: an AI reads everything and trusts what it
reads. Two divergent copies of a truth don't just confuse it — they make it confidently
wrong. SSOT is what makes "read the docs first" safe advice.

---

## 7. The hardening ladder — make rules machine-checkable

When a rule matters, promote it up this ladder as far as it will go:

1. **A comment in one module** — worthless as a contract; it gets reinvented, wrong.
2. **A committed doc** — the floor. Now every session sees it.
3. **A grep with a pass bar in AUDIT.md** — now it's verifiable, identically, by anyone.
4. **A runtime/boot guard or conformance test** — a startup check that warns on vocabulary
   drift; a test that asserts the *usage contract*, not just that the page renders.
5. **Designed out** — the top rung. Restructure so the mistake is impossible: the invalid
   state can't be expressed, the copied constant has nothing to copy.

Two corollaries worth stealing verbatim:

- **Contracts must not fail silently.** A no-op on invalid input looks identical to success
  from the outside — to an AI especially, which can't squint at the screen. No-op *and
  report*, always.
- **A knob that changes nothing is a disconnected knob, not a wrong value.** Before tuning
  any config/token, verify the mechanism actually consumes it — measure the behavior; if
  turning the knob produces no measurable change, the mechanism is broken and the tuning
  session is over. Never ship a named behavior ("glide", "retry", "cache") the mechanism
  can't render — documented behavior with no implementation is the worst drift, invisible
  to typecheck and tests.

---

## 8. Definition of done — one sentence, enforced everywhere

> **Done = code + the right test tier(s) + docs synced (walk the sync table) + checks green
> + a memory/decision record if a decision was made.**

State it in the root CLAUDE.md and repeat it in every subsystem CLAUDE.md. It's the
counterweight to the AI's natural failure mode of declaring victory at "it compiles."

---

## 9. Memory discipline (agent memory vs. committed docs)

Two tiers, with a promotion rule:

- **Agent memory** (Claude's per-project memory) — decisions, preferences, context.
  Write one whenever a real decision is made or something non-obvious is learned; the next
  session inherits it automatically. If a recalled memory contradicts the code, **trust the
  code and fix the memory**.
- **Committed docs** — anything durable and repo-worthy (a rule, a lesson, a convention)
  gets *promoted* out of memory into CLAUDE.md / the lessons section / the rulebook.
  Memory is a scratchpad for the pair of you; the repo is the institution.

And make "read the plan first" a rule: substantive work starts by reading ROADMAP/PLAN so
concurrent sessions don't drift — and landing a step means ticking it there in the same
change.

---

## 10. Let the AI show its work

If the project has a UI, an AI in a headless session can't point at a screen — so build the
channel once: a scripted command (`npm run shots` / Playwright) that boots the app, captures
the key screens *and states* (not just pages — the mid-interaction moments), and writes a
self-contained gallery the AI can publish or link. Then make it a rule in CLAUDE.md: use it
whenever the user asks to "see" something or anything visual changed.

The general form, UI or not: **the repo should give the AI a way to produce evidence** —
screenshots, audit reports, test output — because "show, don't tell" only works if showing
is cheap.

---

## 11. Index the codebase for the AI

Grepping and re-reading raw files is the AI's default way to orient — and its single
biggest token sink, plus a source of partial-picture mistakes (it acts on the three files
it read, not the ten that mattered). Commit an index that answers structural questions
directly: a whole-repo knowledge graph (I use
[`graphify`](https://github.com/safishamsi/graphify) — local tree-sitter AST, zero API
cost) the AI queries — "what connects X to Y", "where does this abstraction live", "what's
impacted if I change this" — and gets back a scoped subgraph instead of a pile of files.
Measured ~20x fewer tokens per codebase question on the reference repo.

The committed machinery, mapped to this standard's own patterns:

- **A CLAUDE.md rule that teaches query-first** — "for codebase questions, run
  `graphify query` before grepping; read raw files to *change* lines, not to *find* them."
  Without the rule the index sits unused; this is the §7 hardening ladder, rung 2.
- **Freshness on the git post-commit hook, never the build or test step.** Commits are the
  right granularity; build and test fire constantly on unchanged code, so the graph would
  rebuild for nothing. Incremental AST updates are free (no LLM), so the hook is cheap. A
  stale index is worse than none — it lies with confidence, the §6 SSOT failure mode.
- **Git-ignore the generated output.** It's per-machine and derived, not canon. That also
  keeps a foreign toolchain (graphify is Python) out of the app — it's a **dev aid**, never
  a runtime dep. Regenerated on clone via the hook install.

The reusable copy-paste setup prompt lives in `AI-DEVELOPMENT.md` §4 ("Index the codebase
for the AI"). The index is an orientation layer, not a substitute for reading the actual
lines you're about to change — same as a map is not the territory.

---

## 12. Adoption checklist

Day one (an hour):

- [ ] Copy in `AI-DEVELOPMENT.md` (the interaction playbook) and this file.
- [ ] Write the root `CLAUDE.md`: what-this-is, reading order, commands, five
      non-negotiables, definition of done, the self-maintenance line.
- [ ] Start the sync table with the 3–4 change-kinds you already know about.

First month (as the work happens, not as a project):

- [ ] First recurring AI mistake → start the **hard-won lessons** section with it.
- [ ] First drift discovered → add its row to the sync table; add a grep for it to a new
      `AUDIT.md`.
- [ ] Subsystems grow distinct rules → give each its own `CLAUDE.md` from a shared starter.
- [ ] More than a couple of docs → add `DOCS.md`.
- [ ] Codebase big enough that grep/re-read dominates a session → stand up the AI index
      (§11): build the graph, add the query-first CLAUDE.md rule, wire the post-commit hook.
- [ ] Run the first full audit with your strongest model; fix findings in-session; commit
      the report.

Steady state: the kit maintains itself, because the operating rules *include* maintaining
it — that's what the sync table, the self-maintenance contract, and "fix the cause, not the
instance" are for.

---

*Living document, same rule as everything it describes: when how this works changes, update
this file in the same change.*
