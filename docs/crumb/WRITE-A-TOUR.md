---
title: "Writing a CRUMB tour"
---

A CRUMB tour is one markdown file. Minimal frontmatter up top, then a body where every `## <surface>`
heading is a step. There is no separate steps array to keep in sync; the heading text *is* the step's
target, and everything under it (up to the next heading) is that step's content. This page documents
the grammar exactly as `core/schema.ts` parses it, with a real tour from this site as the worked
example. See [`GETTING-STARTED.md`](GETTING-STARTED.md) for how a host mounts and serves tours.

## The one design law

Tours are markdown data. CRUMB reads them and highlights, it never writes to your app, and it never
writes back to the tour file either (a human-authored tour stays exactly what you wrote). Delete
CRUMB and the tour files are still readable markdown.

## Frontmatter

```yaml
---
id: portfolio           # optional; must match the filename stem or it's ignored with a warning
mode: demo               # "demo" | "dev", defaults to "demo" if missing or invalid
title: "A tour of the desk"
route: /                 # the entry route the tour opens on; default "/"
---
```

- **The tour's id always comes from the filename**, lowercased (`Review-Nav.md` → `review-nav`), not
  from frontmatter. An `id:` field is optional and purely a sanity check: if it's present and
  doesn't match the filename stem, the parser keeps the filename and reports the mismatch as a
  parse warning (`crumb check` surfaces it).
- **`mode`** is one of `demo` (onboarding/marketing walkthrough) or `dev` (a post-change AI review,
  adds review/status/verify per step). Same tour component either way; only the mode attribute
  flips. Missing or invalid falls back to `demo` with a warning, never a hard failure.
- **`title`** defaults to the id if omitted.
- **`route`** defaults to `/` if omitted.

There is no `steps:` field in frontmatter, despite what you might see in older design notes. Steps
live in the body (below): a step written as a frontmatter list is not how the shipping parser reads
a tour.

## The body: intro, then `## <surface>` steps

Everything before the first `## ` heading is the tour's **intro** (its opening prose, shown on the
tour's first "intro card"). Every `## ` heading after that starts a new step, in document order:

```markdown
Welcome. This quick tour lights up a few pieces of the app, one at a time.

## nav:/notes
- status: changed
- review: The dock gained a Plans row and split into groups.
- verify: Hover each row; every one is a real link.
This is the app dock. Each row is an addressable navigation surface.

## note:ten-times-zero
- at: /notes
- status: new
- verify: Use Back in the sidebar; the tour keeps its place.
The flagship post, on how the whole stack got built with AI doing most of the typing.
```

**The heading text is the step's `surface` verbatim.** It must be the exact `data-surface="kind:id"`
address the lamp should light (e.g. `nav:/notes`, `note:ten-times-zero`, `chat-input`, or a bare kind
like `screen` for a surface that isn't scoped to one instance).

Under a heading, lines are split into two buckets:

- A line matching `- key: value` (or `* key: value`, case-insensitive key) where `key` is one of
  `at`, `review`, `status`, `verify` is parsed as step metadata.
- Every other line is appended to the step's **`say`** prose (joined and trimmed), the popover
  narration shown in demo mode.

| Meta key | Meaning |
|---|---|
| `at` | The route this surface lives on. Omit it when the surface is present on the current/every page (nav, a chat input, `screen`) so the tour doesn't need to navigate to reach it. When set and it differs from the current route, the client does a real navigation (`location.assign`), not a fake SPA transition. |
| `review` | Dev-mode-only narration: what changed here. Shown only when the tour is in (or switched to) `dev` mode. |
| `status` | One of `new`, `changed`, `needs-verification`, `verified`, `known-issue` (CRUMB's verification vocabulary, deliberately separate from GRAIN's `data-grade`, which is provenance, not review state). An unrecognized value is dropped with a parse warning; it does not fail the tour. |
| `verify` | The concrete action that confirms the step: "Open the drawer on mobile; the dock shouldn't clip it." Shown alongside `review` in dev mode. |

A tour with zero `## ` steps still parses, but is flagged by `crumb check` ("no steps, a tour needs
at least one"). Nothing a parser encounters is silently dropped: an invalid `mode`, a mismatched
`id`, an unrecognized `status`, or a heading with empty text all come back as warnings attached to
the parsed tour, which `crumb check` prints.

## A real tour, in full

This is `content/tours/portfolio.md`, the live "tour of the desk" on this site (trimmed for space;
the shape is unedited):

```markdown
---
id: portfolio
mode: demo
title: "A tour of the desk"
route: /
---
Welcome. This site is built like a small operating system, and every part of it is an addressable
surface that both a person and an AI can drive. This quick tour lights up the pieces one at a time.

## screen
- verify: Resize the window; the rail, tabs, and panel stay live and keep their addresses.
This whole window is the desk. It is a real app shell, not a marketing page.

## nav:/notes
- status: changed
- review: The dock gained a Plans row and split into an apps group and a meta group.
- verify: Hover each row; every one is a real link with its own destination.
This is the app dock. Each row is an addressable navigation surface.

## note:ten-times-zero
- at: /notes
- status: new
- review: The tour routed here with a real navigation, the same code path as clicking the dock.
- verify: Use Back in the sidebar; the tour navigates home and keeps its place.
Now we have moved for real. This is the flagship post, on how the whole stack got built with AI
doing most of the typing.
```

Note the mix: `screen` and `chat-input` in the real file carry no `at` (they're present on every
page), while `note:ten-times-zero` sets `at: /notes` because that surface only exists on that route.
This one tour is authored once and works in both demo mode (just the `say` prose) and dev mode (adds
`review`/`status`/`verify` per step) because the author filled in both sets of fields; a pure
onboarding tour can simply leave `review`/`status`/`verify` out of every step.

## How the live client walks a tour

`crumb-live.js` fetches the tour once (`GET /crumb/tours/<id>.json`), then walks `steps` in array
order, tracking the current index in `sessionStorage` (`-1` means the intro card, before step 0). For
the current step it:

1. Resolves the step's route (`step.at`, or the tour's `route` for the intro card).
2. If that differs from the current page, does a real navigation and resumes on load.
3. Lights the element at `[data-surface="<step.surface>"]` with GRAIN's traveling lamp, in
   passthrough mode, so the highlighted surface stays clickable while the tour runs.
4. Opens a popover (or, in framed mode, a sidebar) showing `say` (and, in `dev` mode, `review`,
   `status`, and `verify`).

Switching `demo` ↔ `dev` re-renders the same step in place with no navigation. A tour only offers the
toggle at all when at least one step actually carries `review`, `status`, or `verify`; a pure demo
tour with none of those fields shows no dev-mode switch, since it would be a no-op.

## The auto-generated flagship: review tours from the audit trail

`from-timeline.ts` exports `stepsFromTimeline`/`tourFromTimeline`, a pure projection from GRAIN's
`LogEntry[]` audit trail (every `RenderOp` an AI has emitted to an addressable surface) into exactly
the `Tour`/`Step` shape above, grouped one step per surface touched. A step whose crossing failed
(`ok === false`) becomes a `known-issue` step; everything else becomes `needs-verification`.
`toTourMarkdown(tour)` serializes that back to the same frontmatter + `## <surface>` grammar this
page documents, so a generated review tour round-trips through the same parser a hand-authored tour
uses and is a real file a human can edit afterward. This is the engine only: nothing in the package
today automatically writes a `tours/review/<session>.md` file after an AI task finishes; wiring that
end-to-end (the `crumb init` contract) is a later, planned piece.

## Next steps

- [`GETTING-STARTED.md`](GETTING-STARTED.md) for installing and mounting CRUMB, and the exact routes
  it serves.
- CRUMB's [`PLAN.md`](https://github.com/tjakoen/grain/blob/main/packages/crumb/PLAN.md) for the
  full design and the reuse-not-rebuild table against GRAIN's existing primitives.
- Run `bunx crumb check <dir>` against your own `tours/` folder before shipping a new tour.
