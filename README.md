# portfolio — the personal site

[![Made with Claude](https://img.shields.io/badge/Made_with-Claude-D97757?logo=anthropic&logoColor=white)](https://tjakoen.github.io/notes/ten-times-zero)
[![Code: Apache 2.0](https://img.shields.io/badge/code-Apache_2.0-blue)](LICENSE)
[![Content: all rights reserved](https://img.shields.io/badge/content-all_rights_reserved-lightgrey)](NOTICE)

Tjakoen's personal site (`tjakoen.github.io`) — a **custom BATCH + GRAIN app** that doubles as the
strongest possible proof the stack works: AI-first design, served as plain static files, with a
lightweight AI demo that runs entirely in the visitor's browser.

> **Status: live and running.** THE EDITOR shell (the whole site as one VS-Code-style window),
> the `/grain` and `/batch` showcases, the `/loop` "watch the AI act" demo, the `/catalog`, and the
> notes + rendered layer docs (through MILL) are all built and served today by [`server.ts`](server.ts).
> Still planned: the productivity views (calendar, contacts) and the zero-ops GitHub Pages deploy
> (`batch/export` + a GitHub Actions workflow). New here and want to make a small edit? →
> **[HACKING.md](HACKING.md)** (route → source map + "which file do I open").

## What it is (and isn't)

- It's a **consumer** of the stack — a bespoke app, re-skinning GRAIN via its public seams.
- It **uses [MILL](../mill/PLAN.md) only for content** (the notes/blog + the rendered BATCH/GRAIN
  docs). MILL does **not** build the site — the bespoke surfaces (hero desk, calendar, contacts) are
  the portfolio's own work.
- Organizing concept: a **populated productivity app** (Notes · Calendar · Contacts) with the AI
  **desk** as an assistant that operates them. Not the "Project" product in `project/`.

## Read next

- **[PLAN.md](PLAN.md)** — the execution plan: export → Pages, in-browser AI demo, the build pieces.
- **[FEATURES.md](FEATURES.md)** — the feature menu (north star, the desk, anti-features, reuse table).
- **[CONTENT-BACKLOG.md](CONTENT-BACKLOG.md)** — the content to author (guardrails: public repo, neutral).
- **[GRAIN-PAGE.md](pages/grain/GRAIN-PAGE.md)** · **[BATCH-PAGE.md](pages/batch/BATCH-PAGE.md)** — the `/grain` and `/batch` showcase plans.
- **[PHILOSOPHY.md](PHILOSOPHY.md)** — the beliefs the site proves.
