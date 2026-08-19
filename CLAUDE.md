# CLAUDE.md — portfolio

Onboarding + operating rules for anyone (AI or human) working in `tjakoen.github.io/`: the personal site
(tjakoen.github.io), the home of all published content and the notes, and the canonical home of the
personal standards (`/standards`, rendered through MILL from this repo's own `standards/` dir — since
the 2026-07-09 fold-in, the same option-b move used for the layer docs; PANTRY resolves the same files
out of this repo's package). Read this first. This is where most content work happens, so before
writing anything in Tjakoen's name, read the standards below.

> This file follows the `CLAUDE.starter.md` template from the published standards index
> <https://tjakoen.github.io/standards>. The personal voice/badge standards it points to
> are the source of truth for how anything published should read and look.

## What this is

`tjakoen.github.io/` is **the app + composition root** — it wires grain + batch + mill and runs the
site — plus the content layer: the blog/notes, the résumé and showcase pages (`/`, `/grain`, `/batch`),
and the standards. It uses MILL to render Markdown content into GRAIN pages — **MILL is built and
live** (`/notes`, `/grain/docs`, `/batch/docs` render through it); content is authored as `.md`. It
uses the stack; it does not build it. Pages are trailheads to the canonical docs, never forks of them.

## What this is worked in

The harness is **Nimbalyst**: sessions grouped into workstreams with their subagents, tabs and
edited files visible together, per-action permission judged rather than blanket-approved, and
`spawn_session` so a handoff opens the next session instead of being pasted into one. It matters to
anyone working here for three practical reasons: uncommitted work is attributed **per session**, so a
dirty tree is not automatically yours (LOOP §4b); a rendered change can be screenshotted and shown
inline rather than described; and `.nimbalyst/` plus `nimbalyst-local/` are gitignored private
working material, never site content. None of this is required by the standards, which state the
capability and name the tool only as the example. See [`plans/nimbalyst-in-the-loop.md`](plans/nimbalyst-in-the-loop.md).

## Start here (reading order)

The standards are installed here as **skills**. Invoke them, do not fetch them: `Skill(voice)`,
`Skill(figures)`, `Skill(note-standard)`, `Skill(readme-standard)`, and the rest of the seventeen
under `.claude/skills/`. The published URLs below are the human-readable copy of the same file and
are there for a reader, not for a session: a web fetch to read a standard this repo already ships
is a wasted round trip. The source of every one lives in this repo's `standards/` dir, so edits go
there and then get regenerated into the gitignored, never-committed skills dir by running
`bun cli.ts skills sync ../tjakoen.github.io` from the pantry repo. That package does name a pantry
binary, but it is not installed on PATH here, so reach for it through bun rather than assuming the
short command exists.

1. [`PHILOSOPHY.md`](docs/PHILOSOPHY.md): the *why* beneath the whole stack. Read first.
2. *Skill(intake)* ([published](https://tjakoen.github.io/standards/intake)): read it BEFORE
   starting work on a pasted document, a forwarded brief or a handoff that runs longer than a
   screen and wants something changed. It turns the blob into the lane, the scope cap, the hard
   stops, the ask-triggers and a finish line by putting four questions to the owner, and it says
   plainly when no brief is needed so it does not fire on a one-line ask.
3. `Skill(voice)` ([published](https://tjakoen.github.io/standards/voice)): the writing standard
   (voice, the machine-tells to avoid). Match it for any prose in his name.
4. `Skill(figures)` ([published](https://tjakoen.github.io/standards/figures)): the figure standard,
   the two tokenized inline-SVG scaffolds (data-viz + flow) and the no-mermaid-on-the-published-site
   rule. Use it for any diagram or chart.
5. `Skill(note-standard)` ([published](https://tjakoen.github.io/standards/note-standard)): how a
   note/blog post is built (frontmatter, structure, the sign-off footer) + a reusable prompt to
   draft one. Use it for any `content/notes/*.md`.
6. `Skill(readme-standard)` ([published](https://tjakoen.github.io/standards/readme-standard)):
   badges + README presentation, with a reusable prompt to run in any repo.
7. `Skill(graph)` ([published](https://tjakoen.github.io/standards/graph)): read it before answering
   any "where is X", "what calls Y" or "map this directory" question. This repo carries a live code
   graph, rebuilt by a PostToolUse hook on every edit, so `graphify query <symbol>` answers those in
   one call where a grep sweep costs many. Seed the query with a symbol the code actually contains:
   a partial name returns a bare "No matching nodes found." and reads like a broken tool.
8. [`CONTENT-BACKLOG.md`](docs/CONTENT-BACKLOG.md): what is written, what is in-flight, what is left.
9. [`PLAN.md`](docs/architecture/PLAN.md) + [`FEATURES.md`](docs/architecture/FEATURES.md): the site's *how* and *what*.
10. [`HACKING.md`](docs/HACKING.md): the route → source map + "which file do I open to change X" — the
   fast path for a *small* edit (human or AI) without cold-reading `server.ts`.

Whole-repo doc map: [`../bread/DOCS.md`](../bread/DOCS.md).

## Non-negotiables

- **Content follows [VOICE](https://tjakoen.github.io/standards/voice)** (how it reads) **and
  [NOTE-STANDARD](https://tjakoen.github.io/standards/note-standard)** (how a note is built:
  frontmatter, structure, footer). No em-dashes and no backticks in prose, money stays vague
  (no ratios), visuals per [FIGURES](https://tjakoen.github.io/standards/figures). Honest limits over hype.
- **A terse-output mode never reaches the page.** Any style rule that compresses replies (the caveman
  plugin is the one installed here, and its reminder arrives on every turn, where VOICE has to be
  pulled once) governs chat and nothing else. Files under `content/`, `standards/`, `docs/`, any
  README, any page copy inside `src/`, and every commit message are full prose under VOICE. If the
  two ever seem to disagree about something being written down, VOICE wins and the compression rule
  is off for that file. Code comments are held to VOICE by a reader rather than by
  `bun run lint:voice`: see the note in `tools/voice-lint.ts` on why grading them buries the page copy.
- **A rendered change is shown before it is called done.** Anything a person can end up looking at, a
  page, a component, a figure, a note, a calendar post, closes with a screenshot in the session or a
  CRUMB dev tour. Saying in the run report that it renders correctly is not the same claim as letting
  someone see it, and the turn-end nudge reaches a human reading the transcript rather than the
  session that still could act. The tour-standard skill says which surfaces count and how a step is
  written.
- **Public-repo guardrails.** Company is "Career Team". Neutral, no names, lessons-forward on
  anything sensitive. No student data or private course internals.
- **AI use flown proudly.** Every repo carries the "made with Claude" badge + footer
  ([README-STANDARD](https://tjakoen.github.io/standards/readme-standard)); the flagship post is
  `content/notes/ten-times-zero.md`.
- **It consumes the stack, never forks it.** New design work belongs up in grain, not here.
