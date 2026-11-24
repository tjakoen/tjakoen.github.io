---
status: complete
consulted: [VOICE.md#core-principles, BRIEF.md, DECISIONS.md#1-the-four-ways, LOOP.md, TOUR-STANDARD.md, FIGURES.md, skill:brief]
plan: plans/brief-standard.md
verifiedBy: The clean-tree worktree at /tmp/portfolio-ci passed the standards-index check and its 23 tests before the push.
unpushed: 0
doctor: The session-start checklist reported one warn (11 uncommitted paths that another session owned) and PANTRY serving with 4 ready plans. Nothing blocked this run.
touched:
  - standards/BRIEF.md
  - standards/README.md
  - standards/INDEX.json
  - content/notes/the-voice-file.md
  - plans/brief-standard.md
  - ~/Local/agent-config/shared/CLAUDE.md
---

# BRIEF: a standard for how a run talks to the owner

The owner asked for the other half of VOICE.md. VOICE shapes what the AI writes as him. Nothing owned
what the AI writes to him, and a light model on the OpenCode fallback chain buried the ask in walls of
text. This run wrote that standard, mounted it on every harness, and extended the note that first made
the point.

## What changed

- **BRIEF.md is new.** The ask first, numbered steps carrying their prompt, a link to anything that
  renders while it stays running, bullets for detail, a table once three things are compared, plain
  words, one state table per multi-step report, and a section on why a light model needs the shape
  more rather than a shorter answer.
- **The shape is credited to Kercwin Ocampo**, linked to his people page, because his own file pointed
  this direction first.
- **The global instruction file points at it**, in agent-config, so the rule fires in Claude Code,
  Codex, DSH and OpenCode rather than waiting for a model to choose the skill.
- **The skill mounts** as brief, confirmed in the mounted list.
- **content/notes/the-voice-file.md gained a section**, "Write down the shape you want back", with a
  before and after table, the honest limit, and a link to the standard.

## Verification

```text
bun run check            clean (tsc --noEmit)
bun test                 1052 pass, 0 fail, 5702 expect() calls
bun run lint:links       no dead relative links across 88 rendered files
bun tools/lint-gate.ts   level, 4410 flags under the 4528 baseline
bun run diagrams:check   every diagram fence named and cached
bun tools/standards-index.ts --check   current
```

Two page loads were checked live after the deploy:

```text
https://portfolio.tjakoen.com/standards/brief            200, contains "Say where the work stands"
https://portfolio.tjakoen.com/notes/the-voice-file       200, contains the link to /standards/brief
```

Both were also read on the local dev server at http://localhost:3000 and screenshotted in the session.

## What the first push got wrong

The first commit failed its CI index check. The index had been regenerated while another session held
an uncommitted edit to standards/CONFORMANCE.md, so the committed index described a tree that CI never
had. The second commit rebuilt the index from the committed standards and proved it in a detached
worktree with the repository's own node_modules, where the index check and its 23 tests passed. This is
the per-session attribution problem LOOP section 4b names, met in the index rather than in a diff.

## What was not done

- The CI run for the second commit was still in progress when this report was written. The deploy
  workflow on the same commit completed and the two live URLs answered.
- The OpenCode claim tool refuses the tool name opencode, so PANTRY could not record this session's
  claim. The plan file says what the work was; the ledger row is missing.
- Nothing forces an OpenCode main session onto the intended tier. The owner's session was on DeepSeek
  V4.1 Flash (Go), the third link in the main chain and a light model by the registry's own label.
  That gap belongs to the Model Intelligence Layer and is not fixed here.
