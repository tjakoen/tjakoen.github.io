---
id: quest-map
status: todo
track: learning
depends: []
touches: [content/quests, standards/NOTE-STANDARD.md, tools/quests.ts, view/pages/journey, src/content.ts]
owner: human
---

# Quest map: an AI learning path on the journey page

A dot-matrix pixel map of the notes, grouped into regions you can walk in order. Someone who wants to
learn AI gets a place to start and a guided route through my own writing and the outside sources I
used. It is the colorful corner of a plain site, and the first draft of what an online course here
could look like.

Mockups, light and dark, open in a browser: [docs/mockups/quest-map/index.html](../docs/mockups/quest-map/index.html).

## The look

- **Real pixel art.** Solid pixels, one outline pixel around every sprite, two-tone shading, no smoothing.
  The map is drawn from code: noise terrain, a biome per region, roads, and hand-built sprites for each
  landmark (pines, mountains with a cave, the hall, the castle, the summit flag).
- **Google Maps layout.** Search and filter chips float top left, and a place panel on the left carries the
  selected region with a numbered route. Layers sit bottom left and zoom and find-me bottom right. A blue
  dot marks the adventurer, and a main road in amber links the quests in order.
- **Zoom adds detail.** Zooming in shows what the world view leaves out: tents, torches, a mine cart and
  numbered stop pins. The RPG quest modal opens over the zoomed map.
- **Warm paper, amber accent.** It shares the ant colony's palette, so the site keeps one voice. Labels
  carry a halo the way map labels do.
- Final build uses a self-hosted pixel font. The mockup falls back to monospace.

## Decisions already made

- No Foothills notes. The first stop points out to Claude Academy for the basics. The exact URL is
  still to confirm before it ships.
- The map page has no sidebar. The sidebar comes back as the lesson book inside a quest note.
- Quest tokens ship in light and dark, and the sidebar in lesson mode uses the same tokens.
- The voice player is an open book. Underneath it is a plain audio element with captions.
- Character comes from a seed or a chosen username, never from hardware. A browser cannot read a MAC
  address, and fingerprinting is the wrong thing to build.
- Progress is a save file or save code. The badge link carries the state after the hash, so it never
  reaches a server. The badge page says plainly that it is self-reported.
- Quest badges live in their own namespace. Classroom award pages carry student names and must never
  share a collection, an index or a feed with them.

## The map from what exists

The notes already carry what a quest needs. Nothing new is typed per note.

| Quest field | Comes from |
|---|---|
| Region | shared tags, plus a hand-approved region in content/quests/regions |
| Adventurer level | the note's level: intro, intermediate, deep |
| Class | the note's audience: build, lead, learn, teach |
| XP | readingTime plus the number of stops |
| You will learn | the note's summary and its headings |
| Sources on the trail | the note's Sources section in the body, and the sources ids that point at the Reading shelf |
| Order | depends on a plan-style prerequisite list in the region file |

First six regions, from the published AI notes (order inside each is a guess to be corrected):

| Region | Landmark | Notes |
|---|---|---|
| Foothills | hills | one external stop: Claude Academy |
| Loop Forest | pines | one-loop-every-repo, one-loop-three-harnesses, loop-setup, the-check-that-never-ran |
| Model Mines | mountain and cave | necessity-and-the-model-layer, plan-big-type-small, how-the-model-layer-works |
| Guild Hall | hall | show-them-the-board, move-bugs-left, the-reviewer-that-learned-to-be-wrong |
| GRAIN Keep | castle | watch-its-hands, whitepaper-one-vocabulary, grain drafts as they publish |
| Summit | peak with flag | build-the-floor, ten-times-zero |

Long notes (build-the-floor, how-the-model-layer-works, ten-times-zero, the whitepaper) become several
stops, one per heading group. A stop is the unit a recording, a transcript cue and a concept highlight
attach to.

## Adding a note adds a quest

This is the part that keeps the map alive without hand editing.

1. NOTE-STANDARD gets a short section, "Does it fit the map". The note skill runs the check before a
   note is called finished, the way it already checks the footer and the figure.
2. tools/quests.ts check reads the note's frontmatter and body and prints one of three outcomes:
   fits an existing region (and where), fits nothing yet, or cannot be placed (missing level, tags,
   or sources).
3. A fit is written to content/quests as one small file, so the map and the note list stay in step.
   The quests index is generated, never hand kept, the same rule the plans board follows.
4. Notes that fit no region are grouped by shared tags. When five or more notes share a tag set, the
   tool proposes a new region with a name and a landmark. A person approves the name, landmark and
   position in the same change that publishes the note. The map shows unmapped groups as fog with
   a count, as in the mockup.
5. Drafts never become quests. A quest appears when its note publishes, and a pin on the map that
   points at a draft is a failing test.

## What gets built, in order

- [ ] Quest tokens, light and dark, in the theme. The canvas reads them so the map re-skins with the page.
- [ ] content/quests collection and generated index, plus tools/quests.ts check with tests.
- [ ] NOTE-STANDARD section and a regenerated mounted skill, so the note skill runs the check.
- [ ] Map page with no sidebar: dot-matrix canvas, numbered pins as real buttons, zoom, and an ordered list view that carries the same content for keyboard and screen reader users.
- [ ] Landmark zoom and quest modal: class, level, XP, what it covers, sources, begin quest.
- [ ] Guild card: seeded character, optional username, save file and save code, load.
- [ ] Badge link that rebuilds the card from the hash, with the self-reported notice on the page.
- [ ] Path badges as a new badge class reusing the medallion, in the quest palette, in their own namespace.
- [ ] Lesson mode: the sidebar becomes the book. Sidecar file per note holds cues, concept ids and the plain-words digest. The note itself is untouched.
- [ ] Concept highlight in the note, driven through the GRAIN surface and verb registry, not a back channel.
- [ ] Reduced motion, captions, keyboard path and contrast checked in both themes.
- [ ] First recording for one quest, to prove the book end to end before recording the rest.

## Where the code lives

The map, modal, guild card and book are generic. They should end up in a GRAIN or CRUMB layer, with
this site supplying the data and the theme. Build them here first and extract once the shape has held
for a second quest set. Design work belongs up in grain, so the extraction is part of done, not a
someday.

## Honest limits

- Progress is local to the browser until saved. Clearing storage without a save file loses it.
- The badge shows what the holder says they finished. Nothing on a static site can prove it.
- The region groupings are my first read of the notes, not a curriculum. Order and prerequisites need
  a read-through by the author before launch.

## Done when

The map ships with six regions, one fully recorded quest, the check wired into the note skill, tsc and
bun test green, and screenshots of the map, a modal and the lesson book in light and dark shown in the
session.
