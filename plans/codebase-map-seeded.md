---
id: codebase-map-seeded
status: todo
track: ai
depends: [pantry-control-center]
touches:
  - ../pantry/map.ts
  - ../pantry/map.test.ts
  - ../pantry/graph.ts
  - ../pantry/app.ts
  - ../pantry/app.test.ts
  - ../pantry/pantry-map.js
  - ../pantry/pantry.css
owner: unassigned
---

# The map nobody opens, and the question that would fix it

PANTRY has drawn the codebase since piece 10. `/map` renders graphify's knowledge graph, `/map.json`
is its twin, the layout is deterministic and the central nodes are surfaced by degree. The merged
estate graph behind it is 6,622 nodes and 10,015 edges.

Nobody opens it twice.

The reason is not the drawing. A whole-graph view answers no question anyone arrived with: it proves
a graph exists, which is a fact about the tooling rather than about the code. Every code
visualization that earns a second visit starts from something the reader already cares about and
shows its neighbourhood.

> The fix is a seed, not a bigger canvas.

The questions people actually bring are specific, and three of them already have their answer
computed somewhere in this repo with nothing drawing it. What does this change touch, which
`pantry scope <file>` answers in text. What did this run reach, and did it stay inside the scope it
declared, which `/runs` grades as prose. Is the stack still layered the way it claims, which
`deps.ts` knows and never shows.

## The seeded view

One view, four seeds, the same model underneath. A file. A plan's `touches` list. A run's declared
scope. A session's paths, which the control center's C0 record now collects for every session that
wrote anything.

From the seed, draw the neighbourhood at a radius rather than the whole graph: the nodes reachable in
one or two hops, everything else dropped. Same `map.json` shape, same canvas, a filter and a radius
on top. This is deliberately not a second visualization. A fork of the viz is how a codebase ends up
with two maps that disagree, and the whole argument for the seed is that it needs no new picture.

What it buys, in order of how often it would be used: the scope-growth line in a run report becomes
something a person can look at instead of a sentence they have to trust; a plan gains a picture of
the area it claims; and a session's own edits can be drawn as it makes them, which is the only
version of "watch the AI walk the graph" that is not theatre, because the paths are recorded rather
than imagined.

## What the graph cannot see, and why the picture has to say so

A drawing implies a completeness this graph does not have, which makes an honest legend part of the
feature rather than a nicety. All four of these are measured, not suspected, and re-deriving them
costs a session.

Symbol precision runs at about 43 percent: seven flags, three genuinely dead, and the four false ones
were real symbols graphify does not node, because it nodes neither methods nor unexported functions.
It nodes no CSS and no Markdown at all. Nineteen labels collide inside pantry alone, so a seed given
as a name unions every match, and a union presented without saying so reads as precision.

The last one is the trap that bites silently. The two graph-backed jobs want opposite artifacts: a
symbol lint wants the widest possible graph, and a blast radius wants the narrowest. A radius seeded
from the merged estate graph relabels local files and reports them as unconnected, with no error
anywhere. This view is a radius, so it takes the per-repo graph, and the choice belongs in the code
next to a sentence saying why.

## The cheap sibling, if a picture that cannot lie is worth more

A treemap of the repo sized by churn from the git history, coloured by recency. No graph, so no
precision ceiling, no missing file types and no label collisions. It answers "where is this codebase
actually moving" in one look, and `timeline.ts` already reads the history it needs. Worth building
only if the seeded view lands and the honest-legend problem turns out to be the thing people bounce
off.

## Tasks

- [ ] Decide the seed vocabulary: a path, a plan id, a run id, a session id. Anything a URL cannot
      carry is not a seed.
- [ ] `buildMap` gains a seeded mode over the PER-REPO graph, with the radius as a parameter and the
      artifact choice asserted in a test rather than trusted.
- [ ] A label seed that matches several nodes unions them and SAYS it unioned them. Nineteen
      collisions in one repo is enough to make silence a defect.
- [ ] The legend names what the graph does not node: methods, unexported functions, CSS, Markdown.
- [ ] `/map?seed=<...>` and its twin, with the whole-graph view unchanged and still the default.
- [ ] Link it from where the question is already being asked: the scope line in a run report, the
      touches list on a plan, and the session rows once C1 renders them.
- [ ] Show it. A CRUMB dev tour with one step per seed kind, per LOOP §4a.
- [ ] Optional, gated on the above landing: the churn treemap.

## What is still rough

The radius is a guess. One hop is probably too tight to be interesting and two is probably a hairball
again in the dense parts of grain, and the honest way to settle it is to draw both for three real
seeds and look, rather than to argue about it here.

Nothing in this plan improves the graph itself. Everything above works around what graphify does not
node, and a reader who wants methods and CSS in the picture is asking for a different extractor,
which is a much larger piece of work in somebody else's repo.

This plan and `pantry-control-center` both touch `app.ts` and `pantry.css`. The control center is
building now, so this waits for C1 rather than running beside it.
