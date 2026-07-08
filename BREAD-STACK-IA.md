# BREAD-stack IA — how the stack presents on the portfolio

The information-architecture plan for how the portfolio shows the BREAD stack. The stack grew from
three members to five, and the surfaces that present it drifted: some show three layers, none show
all five, and the two newest members have no presence at all. This is the plan to make the whole
stack read as one coherent, navigable family with a single obvious entry point.

> Pages are trailheads, never forks. Every member's canonical story lives beside its code (each
> layer's docs and PLAN). These pages tease and link. When the stack changes, the canonical doc
> changes first; this IA and the pages that render it are projections of it. Keep them honest.

## The five members (roles + status — the source of truth for the cards)

Reading order is the dependency order: batch, then grain, then mill, then proof. PANTRY is not a
layer in that chain; it is the app that composes them (the neutral sibling of this portfolio).

| Member | Role (one line) | Build status |
|---|---|---|
| **BATCH** | the no-build, server-rendered hypermedia substrate, the bottom layer | Live (runs this site) |
| **GRAIN** | the AI-interaction design system and its default theme (grain = AI) | Live |
| **MILL** | a Markdown to GRAIN-pages content engine, a layer above both | Live (renders the notes and layer docs) |
| **PROOF** | the AI plan board: plans are markdown files, the board is a projection of them | Building (core parser, the board, and the check/init tooling shipped; the live board is next) |
| **PANTRY** | the installable dev-docs and AI cockpit app that composes the layers into one server you run | Building (v1 runs: home, the board, the framework docs; reference/catalog next) |

## Current-state audit (what exists, what is scattered)

The stack is presented across these portfolio surfaces today:

- `/bread` — the umbrella overview. Shows only **three** layers (BATCH, GRAIN, MILL). Headline is
  "Three layers, one direction." No PROOF, no PANTRY. This is the single entry point, and it is out
  of date.
- `/batch`, `/grain`, `/mill` — one trailhead per layer. Each is a good page on its own, but they
  don't share a shape: `/bread` uses a work-card (name, kind, body, link); `/mill` and `/batch` use
  plain cards (title, body). Only `/mill` shows a status flag ("Live"); the others show none.
- The nav frame (`portfolio-frame.html`) — the explorer file tree mirrors the repo root as
  top-level siblings: portfolio/, batch/, grain/, mill/. **No proof/, no pantry/.**
- `llms.ts` (the AI-facing index) — "The stack" lists three members; the prose says "three layers,
  batch to grain to mill".

What is wrong, in one list:

1. **The five are never shown as one family.** The overview stops at three.
2. **No consistent member shape.** Cards differ page to page; build status is shown for one member
   and omitted for the rest, so the reader can't tell live from planned.
3. **PROOF and PANTRY are invisible.** Two real members of the stack have zero portfolio presence.
4. **The layer-versus-app distinction isn't drawn.** PANTRY is an app that composes the layers, not
   a fourth link in the chain; nothing on the site says so.
5. **Cross-links are ad hoc.** Each footer points at a different subset of siblings; there is no
   "you are here in the stack" spine.

## The proposed navigation

One obvious entry point, one repeated card shape, the dependency order, and the layer/app split made
explicit.

### `/bread` is the front door (the stack directory)

Rebuild `/bread` to present **all five members** in a single consistent card family. Every card is
the same shape: emoji and name, a one-line role (the card "kind"), a build-status flag (the honest
state), a short body, and a link to that member's trailhead. Two groups, in reading order:

- **The layers** (batch, grain, mill, proof) — the dependency chain, one direction.
- **The app that runs them** (PANTRY, with this portfolio named as the other consumer) — same
  layers, two composition roots.

Then the dependency diagram: BATCH to GRAIN to MILL to PROOF, with PANTRY shown as the app that
mounts them. Honest status lives on every card, so live and planned never blur.

### One trailhead per member, same shape

- `/batch`, `/grain`, `/mill` — keep (GRAIN stays the rich flagship demo). Add a status flag where
  missing and a "part of the BREAD stack" footer spine so every member links back to `/bread`.
- `/proof` — **new.** A trailhead in the `/mill` shape: role, the honest building status, what it is
  (files are the source of truth, the board is a projection), and a link to the canonical plan.
- `/pantry` — **new.** Same shape: role, the building status, what it mounts, the layer-versus-app
  framing, and a link to the canonical plan.

### The nav frame gets the two new siblings

Add `proof/` and `pantry/` to the explorer file tree as top-level siblings (the tree mirrors the
repo root one to one, so they belong there, not nested under a bread/ wrapper).

### The AI-facing index gets them too

`llms.ts` "The stack" section lists all five with honest one-line notes; the prose stops saying
"three layers".

### The resulting tree

```
/bread                     the stack directory — one card per member, reading order, honest status
  ├─ /batch                substrate         (live)
  │   └─ /batch/docs        canonical docs via MILL
  ├─ /grain                design system     (live)
  │   └─ /grain/docs        canonical docs via MILL
  ├─ /mill                 content engine    (live)
  ├─ /proof                AI plan board     (building)      ← new
  └─ /pantry               dev-docs cockpit  (building)      ← new
```

## Honesty rules (per VOICE)

- No em-dashes, no backticks in prose. Status is stated plainly, limits over hype.
- PROOF is **building**: the core parser, the board, and the check/init tooling are shipped; the
  live board is not. Don't imply it's done.
- PANTRY is **building**: v1 runs (home, the board, the framework docs); reference/catalog and the
  full install-anywhere story are not done. Say so.
- Canonical docs and plans stay the single source. These pages link to them; they never copy them.

## Files this touches (all under tjakoen.github.io/)

- `pages/bread/index.html` — rebuilt as the five-member directory.
- `pages/proof/index.html` — new trailhead.
- `pages/pantry/index.html` — new trailhead.
- `pages/batch/index.html`, `pages/mill/index.html` — status flag and a shared stack-footer spine.
- `pages/grain/index.html` — a "part of BREAD" link in the footer (page otherwise unchanged).
- `components/organisms/portfolio-frame/portfolio-frame.html` — proof/ and pantry/ in the explorer.
- `llms.ts` — all five members in the AI-facing index.

> Status note: this IA was authored 2026-07-08 (audit + plan). Implementation follows. The status
> lines above reflect PROOF (core + board + check/init built) and PANTRY (v1 built) as of that date.
