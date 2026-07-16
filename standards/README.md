---
title: standards/ — how I build, write, and work with AI
summary: The index - one line per standard, so a reader loads one file, not six.
---

# 📐 standards/ — how I build, write, and work with AI

[![Made with Claude](https://img.shields.io/badge/Made_with-Claude-D97757?logo=anthropic&logoColor=white)](https://tjakoen.github.io/notes/ten-times-zero)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache_2.0-blue)](LICENSE)
[![Published](https://img.shields.io/badge/published-tjakoen.github.io%2Fstandards-2ea44f)](https://tjakoen.github.io/standards)

The single source of truth for how I work across every repo: how I build software with an AI
partner, how anything under my byline reads, and how a new repo is set up. Public and portable —
any repo of mine references this folder instead of copying its own drifting rules.

**How to use this, human or AI:** read this index first, then fetch **only** the standard the task in
front of you needs. Each line below is the whole hook — that's the point, so you load one file, not
six.

## The standards

| Read this when you're… | Standard | In one line |
|---|---|---|
| **Building anything with an AI** | [AI-DEVELOPMENT.md](AI-DEVELOPMENT.md) | The working relationship, the definition of done, the conventions and pitfalls every change is held to. The rulebook. |
| **Running a session / handing off** | [SESSION-LOOP.md](SESSION-LOOP.md) | The session lifecycle: orient, the loop, the recurring chores, memory (so lessons stick), the handoff, and model economy. |
| **Writing prose in my name** | [VOICE.md](VOICE.md) | The writing standard — cadence, the honesty clause, the machine-tells to refuse. Owns *how it reads*. |
| **Drafting a note / blog post** | [NOTE-STANDARD.md](NOTE-STANDARD.md) | How a note is built — frontmatter, structure, footer — plus a runnable prompt. Owns the *artifact*; VOICE owns the words. |
| **Making a diagram or chart** | [FIGURES.md](FIGURES.md) | The figure standard — two tokenized inline-SVG scaffolds (data-viz + flow), one palette each, no mermaid on the published site. |
| **Setting up a README** | [README-STANDARD.md](README-STANDARD.md) | Title emoji, the honest badge row, the "built with Claude" footer, plus a runnable prompt. |
| **Starting a new repo** | [CLAUDE.starter.md](CLAUDE.starter.md) | The `CLAUDE.md` template that wires a fresh repo into all of the above from day one. |

## How they fit together

- **AI-DEVELOPMENT + SESSION-LOOP** are the engineering pair: the first is the standards, the second
  is the session mechanics that run against them. Start here for any building work.
- **VOICE + NOTE-STANDARD + README-STANDARD + FIGURES** are the writing set: VOICE owns the prose,
  the others own specific artifacts and point back at it. Start here for any published words.
- **CLAUDE.starter** is the on-ramp: it's how a new repo inherits the whole set.

## The one rule this folder lives by

Single source of truth, everywhere. Each fact has exactly one home here; every other mention is a
*pointer*, never a copy. Two copies of a rule drift, and then both are suspect. If you find the same
thing stated in two of these files, one of them is a bug — fix it to a link.

---
🤖 **Built with Claude, rules included.** The standards that govern how I work with an AI were themselves written with one, which is either very meta or very honest, and I am going with both. **I don't prompt and pray, I prompt and prove.** [How I actually work with AI, receipts and all →](https://tjakoen.github.io/notes/ten-times-zero)
