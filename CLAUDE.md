# CLAUDE.md — portfolio

Onboarding + operating rules for anyone (AI or human) working in `tjakoen.github.io/`: the personal site
(tjakoen.github.io), the home of all published content and the notes, and the *rendered* home of the
personal standards (`/standards`, served from the installed `@tjakoen/standards` package — the source
lives in the `tjakoen/standards` repo, referenced, never forked). Read this first. This is where most
content work happens, so before writing anything in Tjakoen's name, read the standards below.

> This file follows the `CLAUDE.starter.md` template from the published standards index
> <https://tjakoen.github.io/standards>. The personal voice/badge standards it points to
> are the source of truth for how anything published should read and look.

## What this is

`tjakoen.github.io/` is **the app + composition root** — it wires grain + batch + mill and runs the
site — plus the content layer: the blog/notes, the résumé and showcase pages (`/`, `/grain`, `/batch`),
and the standards. It uses MILL to render Markdown content into GRAIN pages — **MILL is built and
live** (`/notes`, `/grain/docs`, `/batch/docs` render through it); content is authored as `.md`. It
uses the stack; it does not build it. Pages are trailheads to the canonical docs, never forks of them.

## Start here (reading order)

1. [`PHILOSOPHY.md`](PHILOSOPHY.md): the *why* beneath the whole stack. Read first.
2. [VOICE](https://tjakoen.github.io/standards/voice): the writing standard (voice, the machine-tells to
   avoid). Match it for any prose in his name.
3. [FIGURES](https://tjakoen.github.io/standards/figures): the figure standard, the tokenized SVG scaffold +
   the mermaid-vs-SVG rule. Use it for any diagram or chart.
4. [NOTE-STANDARD](https://tjakoen.github.io/standards/note-standard): how a note/blog post is built
   (frontmatter, structure, the sign-off footer) + a reusable prompt to draft one. Use it for any
   `notes/*.md`.
5. [README-STANDARD](https://tjakoen.github.io/standards/readme-standard): badges + README presentation,
   with a reusable prompt to run in any repo.
   (Working offline? The same files are installed at `node_modules/@tjakoen/standards/`.)
6. [`CONTENT-BACKLOG.md`](CONTENT-BACKLOG.md): what is written, what is in-flight, what is left.
7. [`PLAN.md`](PLAN.md) + [`FEATURES.md`](FEATURES.md): the site's *how* and *what*.
8. [`HACKING.md`](HACKING.md): the route → source map + "which file do I open to change X" — the
   fast path for a *small* edit (human or AI) without cold-reading `server.ts`.

Whole-repo doc map: [`../DOCS.md`](../DOCS.md).

## Non-negotiables

- **Content follows [VOICE](https://tjakoen.github.io/standards/voice)** (how it reads) **and
  [NOTE-STANDARD](https://tjakoen.github.io/standards/note-standard)** (how a note is built:
  frontmatter, structure, footer). No em-dashes and no backticks in prose, money stays vague
  (no ratios), visuals per [FIGURES](https://tjakoen.github.io/standards/figures). Honest limits over hype.
- **Public-repo guardrails.** Company is "Career Team". Neutral, no names, lessons-forward on
  anything sensitive. No student data or private course internals.
- **AI use flown proudly.** Every repo carries the "made with Claude" badge + footer
  ([README-STANDARD](https://tjakoen.github.io/standards/readme-standard)); the flagship post is
  `notes/ten-times-zero.md`.
- **It consumes the stack, never forks it.** New design work belongs up in grain, not here.
