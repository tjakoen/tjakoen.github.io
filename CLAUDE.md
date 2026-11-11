# CLAUDE.md — portfolio

Onboarding and operating rules for anyone (AI or human) working here: the personal site
(portfolio.tjakoen.com), all published content, and the canonical home of the personal standards
(`/standards`, rendered through MILL from this repo's `standards/` dir, which PANTRY resolves too).
Read this first: most content work happens here, so before writing anything in Tjakoen's name, read
the standards below.

> Follows the `CLAUDE.starter.md` template from the published standards index
> <https://portfolio.tjakoen.com/standards>. The voice and badge standards it points to are the source
> of truth for how anything published should read and look.

## What this is

This repo is **the app + composition root** — it wires grain + batch + mill and runs the
site — plus the content layer: the blog/notes, the résumé and showcase pages (`/`, `/grain`, `/batch`),
and the standards. It uses MILL to render Markdown content into GRAIN pages — **MILL is built and
live** (`/notes`, `/grain/docs`, `/batch/docs` render through it); content is authored as `.md`. It
uses the stack; it does not build it. Pages are trailheads to the canonical docs, never forks of them.

## What this is worked in

The harness is whichever program runs the session: Claude Code, Codex or DeepSeek Harness. The loop is
the same in all three; the adapter is what changes. The desk is **Nimbalyst**, and three of its
properties matter here: uncommitted work is attributed **per session**, so a dirty tree is not
automatically yours (LOOP §4b); a rendered change can be screenshotted and shown inline rather than
described; and `.nimbalyst/` plus `nimbalyst-local/` are gitignored private working material, never
site content. The standards state the capability and name the tool only as the example. See
[`plans/done/nimbalyst-in-the-loop.md`](plans/done/nimbalyst-in-the-loop.md).

When the session opens in DeepSeek Harness (DSH), the front door is this same file and the skills come
from .agents/skills, a symlink to .claude/skills. DSH runs none of the Claude Code hooks: the loop
plugin carries the human-lane guard, the spawn envelope, the graph refresh and the session checklist,
which runs on the first step and whose block is shown at the top of the first reply. The profile mounts
the pantry, tokensave and headroom MCP servers. Its commands are `bun tools/dsh-loop/cli.mjs start` at
the first turn and `end` before calling work done. See [docs/HARNESS-DSH.md](docs/HARNESS-DSH.md).

## Start here (reading order)

The standards are installed here as **skills**. Invoke them, do not fetch them: `Skill(voice)`,
`Skill(figures)`, `Skill(note-standard)`, and the rest of the twenty-one under `.claude/skills/`. A
published URL is the human-readable copy of the same file, so fetching a standard this repo already
ships is a wasted round trip. The source of every one lives in `standards/`; edit there and regenerate
the gitignored skills with `bun cli.ts skills sync ../tjakoen.github.io` from the pantry repo (reach for
it through bun, since no pantry binary is on PATH here). DSH reads the same mount through the
.agents/skills symlink, so one sync serves both harnesses.

1. [`PHILOSOPHY.md`](docs/PHILOSOPHY.md): the *why*. Read first.
2. *Skill(intake)*: read BEFORE work on a pasted document, forwarded brief or long handoff that wants
   something changed. It turns the blob into lane, scope cap, hard stops, ask-triggers and a finish
   line, and says plainly when no brief is needed.
3. `Skill(voice)`: the writing standard. Match it for any prose in his name.
4. `Skill(figures)`: the figure standard, the two tokenized SVG scaffolds, and the mermaid rule (a
   generated diagram only, with a label).
5. `Skill(note-standard)`: how a note is built, plus a prompt to draft one.
6. `Skill(readme-standard)`: badges and README presentation.
7. `Skill(graph)`: read before any "where is X" or "what calls Y" question. This repo carries a live
   code graph, so `graphify query <symbol>` answers in one call where a grep sweep costs many. Seed the
   query with a symbol the code contains; a partial name returns "No matching nodes found." and reads
   like a broken tool.
8. [`CONTENT-BACKLOG.md`](docs/CONTENT-BACKLOG.md): written, in flight, left.
9. [`PLAN.md`](docs/architecture/PLAN.md) + [`FEATURES.md`](docs/architecture/FEATURES.md): the site's
   *how* and *what*.
10. [`HACKING.md`](docs/HACKING.md): the route to source map for a small edit, without cold-reading
    `server.ts`.

Whole-repo doc map: [`../bread/DOCS.md`](../bread/DOCS.md).

## Non-negotiables

- **Content follows [VOICE](https://portfolio.tjakoen.com/standards/voice)** (how it reads) **and
  [NOTE-STANDARD](https://portfolio.tjakoen.com/standards/note-standard)** (how a note is built:
  frontmatter, structure, footer). No em-dashes and no backticks in prose, money stays vague
  (no ratios), visuals per [FIGURES](https://portfolio.tjakoen.com/standards/figures). Honest limits over hype.
- **A terse-output mode never reaches the page.** Any style rule that compresses replies governs chat
  and nothing else. Files under `content/`, `standards/`, `docs/`, any README, page copy inside
  `src/`, and every commit message are full prose under VOICE. Where the two disagree about something
  written down, VOICE wins and the compression rule is off for that file. Code comments are held to
  VOICE by a reader rather than by `bun run lint:voice`; `tools/voice-lint.ts` says why grading them
  buries the page copy.
- **A rendered change is shown before it is called done.** Anything a person can end up looking at, a
  page, a component, a figure, a note, a calendar post, closes with a screenshot in the session or a
  CRUMB dev tour. Saying in the run report that it renders correctly is not the same claim as letting
  someone see it, and the turn-end nudge reaches a human reading the transcript rather than the
  session that still could act. The tour-standard skill says which surfaces count and how a step is
  written.
- **The public address is <https://portfolio.tjakoen.com>.** Use it in published copy, canonical
  links, social posts, cards and standards links. The old github.io host still redirects, but it is
  not the address we print. A card takes its host from `SITE.origin` in `src/seo.ts`, never from a
  string in the template.
- **Public-repo guardrails.** Company is "Career Team". Neutral, no names, lessons-forward on
  anything sensitive. No student data or private course internals.
- **AI use flown proudly.** Every repo carries the "made with Claude, Codex and DeepSeek" badge + footer
  ([README-STANDARD](https://portfolio.tjakoen.com/standards/readme-standard)); the flagship post is
  `content/notes/ten-times-zero.md`.
- **It consumes the stack, never forks it.** New design work belongs up in grain, not here.

## Running the gates

Run the same Bun checks as this repository's CI from the repository root:

```sh
bun install --frozen-lockfile
bun run check
bun test
bun tools/lint-gate.ts
bunx playwright install chromium
bunx playwright test --ignore-snapshots
```

Record the actual test totals and failures. Historical fixed counts are not an acceptance bar for
a growing suite. The lint gate compares against its committed baseline and is advisory. CI skips
image comparisons because the committed visual baselines are macOS-specific; use the unmodified
visual suite on macOS when changing presentation. See .github/workflows/ci.yml for runner details.

On DSH, bun tools/dsh-loop/cli.mjs end runs the typecheck, the lint gate and the graph refresh;
bun tools/dsh-loop/cli.mjs start runs the doctor and the mount check. See
[docs/HARNESS-DSH.md](docs/HARNESS-DSH.md).

The earlier container command depended on a sibling compose file absent from this checkout.
Do not prescribe it unless that setup is restored and verified. Windows runs that exercise symlinks
need Developer Mode or a verified environment that supports them; report that prerequisite explicitly.
