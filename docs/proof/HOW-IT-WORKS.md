---
title: "How PROOF works"
---

## The one design law

**Files are the source of truth. The board is a projection. The AI maintains files, never the
board.** Nothing in PROOF writes to a plan file. There is no endpoint, no button, no "mark done"
action that touches disk from the board side, a status change happens by editing a plan's own
frontmatter, the same file the AI (or a human) was already editing. Delete PROOF entirely and the
plans are still just readable markdown; the tool is a viewport, never a store.

The honest pitch, stated plainly: roughly 70% human observability, 30% AI efficiency. The AI never
looks at the board. Its gain is the file structure itself: a cheaper session start, one ground
truth parallel sessions can share, plans forced into small pieces before they turn into a mess. The
board is for the human watching.

## The schema

A plan is a `.md` file with a deliberately small frontmatter block, six fields, on purpose:

```yaml
---
id: 001-interaction-timeline    # = the filename stem, the plan's stable address
status: doing                   # todo | doing | done | blocked
track: A                        # optional; a free grouping label
depends: []                     # ids this plan waits on
touches: [grain/ai/contract.ts] # optional; code areas
owner: ai                       # ai | human
---
```

Body = the plan's prose, plus a task checklist (`- [ ]` / `- [x]`). A big task can become its own
child plan file rather than growing one file without bound. The schema stays this small on purpose:
a heavier one turns the AI into a bookkeeper instead of a builder.

A malformed plan is never silently dropped. An invalid `status` or `owner` falls back to a default
*and* reports the error, so the board still shows the card, flagged, rather than making a plan
disappear because of a typo.

## The board is four columns

`STATUSES = ["todo", "doing", "done", "blocked"]` is the closed vocabulary, and the board lays out
one column per status, left to right, in that order: **To do**, **Doing**, **Done**, **Blocked**.
Within a column, cards sort by `id` (the `001-…`, `002-…` prefix carries the intended order).

A card shows its status badge, an owner mark (`AI` or `Human`), the track (if set), a `done/total
tasks` progress count, the last-modified date, and a `touches` chip list when the plan names code
areas. A plan with parse errors gets a visible warning flag on its own card: the board is also the
lint's window, an issue is surfaced, not hidden.

## Where the dates come from

`lastModified` reads a plan file's last git commit time (`git log -1 --format=%cI`), degrading to
the filesystem's mtime if the folder isn't a git repo, and to `null` if neither is available. Git is
the timeline: a plan's history *is* the record of the AI's decisions.

## Clicking a card

`/plan/:id` renders that plan's full body through MILL (`renderGrainDocument`, the same engine
[MILL's docs](mill/docs/GETTING-STARTED.md) describe), with a body-only layout, since the plan
already leads with its own `# Title` and PROOF renders the frontmatter facts separately above it.
The grade guardrail still runs, plan prose is human-authored content, so it stamps clean even though
an AI likely wrote both the plan and the code it describes.

## Live updates (opt-in)

Passing `liveScriptSrc` to `createProofRoutes` appends a client script tag that connects over SSE.
A file watcher (`watchPlans`) debounces a change to `plans/` and broadcasts a `replace` render op
targeting the `proof-board` surface, so every open tab rebuilds without a manual refresh. It's
read-only in both directions: the watcher only ever pushes a rebuilt view, it never accepts a
message back. Omit `liveScriptSrc` and the board still works, it's just a normal server-rendered
page that needs a reload to see a change.

## The CLI

- **`proof check [dir]`**: a deterministic lint. Schema validity, duplicate plan ids, dangling
  `depends` (a plan waiting on an id that doesn't exist), a `done` plan with unticked tasks left, a
  `doing` plan gone stale with no recorded activity for a while. Exits nonzero on a problem, so it's
  CI-able.
- **`proof init [dir]`**: scaffolds `plans/` (a starter plan + a README explaining the schema) plus
  optional hook scripts (a `SessionStart` hook that injects the plan index into context, a
  pre-commit nudge). Non-invasive: it only ever writes new files, and prints the one manual wiring
  step rather than editing a host's existing `settings.json` or `CLAUDE.md` itself.
- **`proof serve [dir] [--port N]`**: the standalone board, for a project with no host app to mount
  `createProofRoutes` into.

## What's not built yet

Per [`proof/PLAN.md`](https://github.com/tjakoen/grain/blob/main/packages/proof/PLAN.md): a mindmap
view joining plan nodes with memory links and a code graph, a multi-project board (one `proof serve`
over several plans folders), and any human interaction with the board through the client-side door,
are all phase 2, not built. The board stays read-only in every direction today.

## Non-goals

Not a task manager for humans, humans edit the same files the AI does. Not a store, no database, no
board state outside the files and git. Not a second plan system, a repo that already has plan prose
in some other form migrates it in, it doesn't run PROOF alongside something else.
