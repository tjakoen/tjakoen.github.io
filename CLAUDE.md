# CLAUDE.md — portfolio

Onboarding + operating rules for anyone (AI or human) working in `portfolio/`: the personal site
(tjakoen.github.io) and the home of all published content, the notes, and the personal standards.
Read this first. This is where most content work happens, so before writing anything in Tjakoen's
name, read the standards below.

> This file follows `standards/CLAUDE.starter.md`. The personal voice/badge standards it points to
> are the source of truth for how anything published should read and look.

## What this is

`portfolio/` is a consumer of grain + batch, plus the content layer: the blog/notes, the résumé and
showcase pages (`/`, `/grain`, `/batch`), and the standards. It uses MILL to render Markdown content
into GRAIN pages (MILL is planned; content is authored as `.md` now). It uses the stack; it does not
build it. Pages are trailheads to the canonical docs, never forks of them.

## Start here (reading order)

1. [`PHILOSOPHY.md`](PHILOSOPHY.md): the *why* beneath the whole stack. Read first.
2. [`standards/VOICE.md`](standards/VOICE.md): the writing standard (voice, the machine-tells to
   avoid). Match it for any prose in his name.
3. [`standards/FIGURES.md`](standards/FIGURES.md): the figure standard, the tokenized SVG scaffold +
   the mermaid-vs-SVG rule. Use it for any diagram or chart.
4. [`standards/NOTE-STANDARD.md`](standards/NOTE-STANDARD.md): how a note/blog post is built
   (frontmatter, structure, the sign-off footer) + a reusable prompt to draft one. Use it for any
   `notes/*.md`.
5. [`standards/README-STANDARD.md`](standards/README-STANDARD.md): badges + README presentation,
   with a reusable prompt to run in any repo.
6. [`CONTENT-BACKLOG.md`](CONTENT-BACKLOG.md): what is written, what is in-flight, what is left.
7. [`PLAN.md`](PLAN.md) + [`FEATURES.md`](FEATURES.md): the site's *how* and *what*.

Whole-repo doc map: [`../DOCS.md`](../DOCS.md).

## Non-negotiables

- **Content follows `standards/VOICE.md`** (how it reads) **and `standards/NOTE-STANDARD.md`** (how a
  note is built: frontmatter, structure, footer). No em-dashes and no backticks in prose, money stays
  vague (no ratios), visuals per [`standards/FIGURES.md`](standards/FIGURES.md). Honest limits over hype.
- **Public-repo guardrails.** Company is "Career Team". Neutral, no names, lessons-forward on
  anything sensitive. No student data or private course internals.
- **AI use flown proudly.** Every repo carries the "made with Claude" badge + footer
  (`standards/README-STANDARD.md`); the flagship post is `notes/ten-times-zero.md`.
- **It consumes the stack, never forks it.** New design work belongs up in grain, not here.
