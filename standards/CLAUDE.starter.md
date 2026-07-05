# CLAUDE.md: <PROJECT NAME>

> **Starter template.** Copy this to the root of a new repo as `CLAUDE.md`, delete this line, and
> fill the `<…>` placeholders. It wires a fresh project into Tjakoen's personal standards (voice,
> badges, AI-use posture) from day one. The standards live publicly at
> `https://tjakoen.github.io` (source in the batch-stack repo under `portfolio/standards/`), so you
> can either link them or copy `VOICE.md` + `README-STANDARD.md` into this repo.

## What this is

<One paragraph: what this project is, who it's for, and the single most important thing to know
before touching it.>

## How I work here (non-negotiables)

- **I build with AI, out loud, on purpose.** Every commit is co-authored with Claude. That is a
  discipline, not a shortcut; see the posture below.
- **AI multiplies, it doesn't add.** The AI types; I engineer. I keep the judgment, the architecture,
  and the final call. If I can't explain it, I didn't build it.
- **Tests + a green build before "done."** <Name the check/test commands for this repo.>
- **Write the decision down.** Keep a short record of *why* non-obvious choices were made so the next
  session inherits the reasoning instead of relitigating it.

## Voice (for any prose in my name)

Follow **VOICE.md** (`portfolio/standards/VOICE.md` in batch-stack, or the published copy). The short
version: honest, quirky, self-deprecating, concrete, opinionated-with-the-why; **no backticks in
prose**; contractions in casual writing, expanded in formal docs. Never publish a claim I haven't
earned; keep money vague.

## README presentation (do this once, at repo start)

Follow **README-STANDARD.md** (`portfolio/standards/README-STANDARD.md`). In short:

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
