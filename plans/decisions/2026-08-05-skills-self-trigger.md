# Decision — do mounted skills fire unprompted? (S0 exit)

- **Date:** 2026-08-05
- **Gates:** `plans/skills-runtime.md` S0 → S1
- **Verdict:** **Yes, the mechanism works. No, ours did not fire.** The discriminator is description
  shape, and it is the whole lever. S1 keeps its `when:` key and gains a register requirement.

## The question

The pilot (`doubt-driven-development`, `incremental-implementation`, installed 2026-08-05) was already
confirmed to *mount* and appear in the harness's available-skills list. Appearing is not firing. S0's
open half: does the model reach for a skill on its own, without being told to?

## Method

The session assigned this test had already read the skill names, so its own behaviour is worthless as
evidence. Three arms, in ascending order of how much weight they carry:

1. **Control arm (weak).** A fresh Sonnet subagent, given a genuine multi-file engineering task
   (the P1 capability catalog from `plans/ai-agency-navigation.md`) with zero mention of skills.
   Its transcript was then grepped for `Skill` tool calls.
2. **Cross-session census (load-bearing).** Every transcript in this project's history grepped for
   `"name":"Skill"`, then each hit classified as model-chosen or human-typed by checking whether any
   human turn actually invoked it as a slash command.
3. **Register comparison.** The descriptions of the skills that *did* fire, read against ours.

## Evidence

**Control arm: did not fire.** The subagent touched 6 files (4 modified, 2 new), added 15 tests, and
ran a 328-test suite. `incremental-implementation`'s stated trigger is *"Use when implementing any
feature or change that touches more than one file"* — matched verbatim by the work. `Skill` tool
calls in its transcript: **0**. It *had* the descriptions: the transcript carries a `skill_listing`
attachment, `skillCount: 41`, `isInitial: true`, both pilot skills named with full descriptions.

*Caveat raised, then closed the same day.* The transcript carries no tool schemas, so it could not
show whether the `Skill` tool was in the subagent's inventory at all — and a subagent that cannot
invoke skills would produce the same silence. Settled by asking a throwaway subagent to list its own
tools: `Skill` is there, alongside `Agent`, `Bash`, `Edit`, `Read`, `Write`, `ToolSearch`. So the
control arm **could** have fired the skill and did not. The arm is decisive after all.

**Cross-session census: 8 invocations, all of them built-ins, none of them ours.**

| Skill | Date | Model-chosen? |
|---|---|---|
| `dataviz` ×2 | 2026-07-29 | **Yes.** Zero slash-command markers anywhere in that transcript. |
| `claude-api` | 2026-07-25 | Model-chosen; no human turn invoked it. |
| `planning:design` | 2026-07-24 | Model-chosen; no human turn invoked it. |
| `handoff` ×4 | Jul 22 / Jul 24 / Jul 26 / Aug 5 | Human-typed `/handoff`. |
| `incremental-implementation` | — | **Never.** |
| `doubt-driven-development` | — | **Never.** |

`dataviz` firing twice, unprompted, in a main-thread session settles the mechanism question: the
harness's auto-invocation path works in this project. So the pilot's silence is not "skills do not
fire here." It is "these two do not fire."

**Register comparison: the ones that fire are written as commands, not descriptions.**

- `dataviz` — *"Use this skill whenever you are about to create ANY chart… **Read it BEFORE** writing
  the first line of chart code"*, followed by a literal token list (`"chart"`, `"graph"`, `"plot"`,
  `"heatmap"`, `"legend"`, `"axis"`…).
- `claude-api` — *"**TRIGGER** — read BEFORE opening the target file; **don't skip because it 'looks
  like a one-liner'**"*, plus an explicit `SKIP only when…` clause.
- `incremental-implementation` (ours, mounted, silent) — *"Use when implementing any feature or change
  that touches more than one file."*

Three properties separate them, and all three are absent from the pilot pair:

1. **Pre-emptive placement.** "Read it BEFORE writing the first line" fires at the moment of intent.
   "Use when implementing" fires, at best, once you already know you are implementing.
2. **Literal trigger tokens.** A list of surface words the prompt is likely to contain, verbatim.
3. **An anti-rationalization clause.** "Don't skip because it looks like a one-liner" pre-refutes the
   excuse. This is the same shape as S1's planned Rationalizations table, doing its work in the
   description rather than the body.

## Consequences for S1

S1 does **not** shrink to "fix our frontmatter". The opposite: the mechanism is confirmed, so
frontmatter is the entire return on investment, and it now has a spec rather than a guess.

- The `when:` key stands, confirmed twice over. `summary:` remains unusable as `description:` — it is
  page prose, and page prose is exactly the register that stays silent.
- **New requirement:** `when:` is written in the imperative pre-emptive register, and each one carries
  (a) a "before you X" clause, (b) literal trigger tokens, (c) one anti-rationalization line lifted
  from that standard's own Rationalizations table.
- The Rationalizations tables planned for VOICE / GRAPH / LOOP now have a second job: their sharpest
  row seeds the description.
- S2's `pantry skills sync` must emit `when:`, never `summary:`. A sync that emitted `summary:` would
  mount fifteen skills that behave exactly like the pilot pair did: present, listed, and silent.

## Still open

- `doubt-driven-development` never got a genuinely risky decision to trigger against. Untested, not
  disproven.

*(Closed while drafting S1: subagents do carry the `Skill` tool, so `pantry skills sync` serves
delegated work too, not only main-thread sessions.)*

## Side effect

The control arm's task was real work, and it landed: P1 of `plans/ai-agency-navigation.md` (the
capability catalog) is implemented in the working tree. Verified independently, not taken on the
agent's word: `tsc --noEmit` clean, 328 pass / 0 fail. Uncommitted.
