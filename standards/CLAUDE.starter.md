# CLAUDE.md: <PROJECT NAME>

> **Starter template.** Copy this to the root of a new repo as `CLAUDE.md`, delete this line, and
> fill the `<…>` placeholders. It wires a fresh project into Tjakoen's personal standards (how I build
> with AI, voice, badges, AI-use posture) from day one. The standards live publicly at
> `https://tjakoen.github.io` (source in the batch-stack repo under `tjakoen.github.io/standards/`) —
> **reference them, don't fork them.** The [`standards/README.md`](https://tjakoen.github.io/standards)
> index is the map; point this repo at it rather than copying files that will drift.
>
> **Make it tool-agnostic.** Symlink `AGENTS.md → CLAUDE.md` (`ln -s CLAUDE.md AGENTS.md`) so any
> agent that reads the cross-tool `AGENTS.md` convention (Codex, Cursor, Copilot, Gemini CLI, …) gets
> the same instructions Claude Code reads from `CLAUDE.md`. One file, every tool.

## What this is

<One paragraph: what this project is, who it's for, and the single most important thing to know
before touching it.>

## How I work here (non-negotiables)

The full rulebook is **[`AI-DEVELOPMENT.md`](https://tjakoen.github.io/standards/AI-DEVELOPMENT.md)**
(the standards) + **[`SESSION-LOOP.md`](https://tjakoen.github.io/standards/SESSION-LOOP.md)** (the
session mechanics, memory, handoff, model economy). The short version for this repo:

- **I build with AI, out loud, on purpose.** The work is co-authored with Claude as a *practice* —
  not a git trailer (see the commit convention below; no `Co-Authored-By` lines). The receipt is the
  README badge + footer and the flagship note, not commit metadata.
- **AI multiplies, it doesn't add.** The AI types; I engineer. I keep the judgment, the architecture,
  and the final call. If I can't explain it, I didn't build it.
- **Definition of done = code + tests + docs synced + green gate.** <Name the check/test commands for
  this repo.> Not one of these — all of them.
- **Write the decision down.** Keep a short record of *why* non-obvious choices were made so the next
  session inherits the reasoning instead of relitigating it (format: SESSION-LOOP §4).
- **Hand off when a task finishes.** Gate green, committed, decisions recorded → emit a compact
  handoff prompt for the next session (SESSION-LOOP §5).

## Voice (for any prose in my name)

Follow **VOICE.md** (`tjakoen.github.io/standards/VOICE.md` in batch-stack, or the published copy). The short
version: honest, quirky, self-deprecating, concrete, opinionated-with-the-why; **no backticks in
prose**; contractions in casual writing, expanded in formal docs. Never publish a claim I haven't
earned; keep money vague.

## README presentation (do this once, at repo start)

Follow **README-STANDARD.md** (`tjakoen.github.io/standards/README-STANDARD.md`). In short:

1. **Title emoji.** One emoji before the H1 that fits this repo (my repos lean a bread/baking family).
2. **A curated badge row** (~5–7, honesty rule: only true, ideally verifiable badges), always led by:
   `[![Made with Claude](https://img.shields.io/badge/Made_with-Claude-D97757?logo=anthropic&logoColor=white)](https://tjakoen.github.io/notes/ten-times-zero)`
3. **The text footer** at the bottom of the README:
   > ---
   > 🤖 **Built with Claude. I don't prompt and pray, I prompt and prove.** Every commit here is co-authored with an AI, on purpose. [How I actually work with AI, receipts and all →](https://tjakoen.github.io/notes/ten-times-zero)

The fastest way: paste the "reusable prompt" from README-STANDARD.md into a Claude session here, and it reads this
codebase and proposes the emoji + honest badge set for you.

## Commit convention

No AI attribution trailers on commits (`Co-Authored-By: Claude` etc. — enforced globally via
`attribution` settings). The receipt behind the "built with Claude" claim is the README badge +
footer and the flagship note, not commit metadata.

## Docs / structure

<List this repo's key files and where the important docs live. If it grows past a couple of root
docs, group them under `docs/` and keep only `README.md` + `CLAUDE.md` at the root.>
