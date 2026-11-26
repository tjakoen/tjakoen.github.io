---
id: quest-map
status: todo
track: learning
depends: []
touches: [content/quests, standards/NOTE-STANDARD.md, tools/quests.ts, view/pages/journey, src/content.ts, docs/mockups/quest-map]
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
- **You are here.** The blue dot is gone. A small pixel adventurer labelled You stands beside the next
  unfinished quest on the route, so the marker says where you are in the path and not just where the map
  happens to be. The find-me button and Continue both go there.
- **The map has life, slowly.** Ferries sail between the Foothills pier and the Guild Hall harbour along the
  south coast. Gulls circle the port, birds circle the forest and nest in its trees, fish jump, and the Guild
  Hall chimney smokes. Up close the places are lived in: a few dwarves swing picks in the mines and one
  pushes an ore cart along the shaft, guards stand at the castle gate, the keep door and the walls and patrol the ramparts,
  villagers walk the Guild Hall streets, sailors work the pier, elves cross the walkways in the canopy and
  climbers work the switchback to the summit. The snowfield under the peak has a frozen lake, snowy pines and
  cabins. After dark, fireflies drift over the forest. The water glints at about a third of the earlier pace.
  Open sea runs a long way around the island, then ends at a rounded wall of cloud at the border of the map,
  and past it there is only more cloud, never open water. You reach the cloud by panning out, and the view stops at the wall, so you never scroll into empty cloud. A kraken lives in
  the sea at the top-left. Everything moves in pixel steps, holds still under reduced motion, and follows the
  Motion button.
- **One style, two rules.** Art, meaning the terrain, landmarks, detail scenes and the moving layer, is solid
  pixels with the dark outline color around every building and mountain, two-tone shading, no translucency, no
  blur and no smoothing. Trees and plants take a darker green for their edge and houses a darker brown, never black. Ground patches blend
  softly like terrain and carry no outline. Chrome, meaning the
  panel, pins, hover cards, buttons and settings, uses 2 to 3 pixel borders in the ink color, hard offset
  shadows with no blur, monospace for interface text and Georgia for prose. Pins take the art's outline color
  for their border so they sit in the same world. Nothing mixes the two: no soft shadows on chrome and no
  glows or fades in the art.
- **Google Maps layout.** Search and filter chips float top left, and a place panel on the left carries the
  selected region with a numbered route. Layers sit bottom left and zoom and find-me bottom right. A blue
  dot marks the adventurer, and a main road in amber links the quests in order.
- **Zoom adds detail.** Zooming in shows what the world view leaves out: tents, torches, a mine cart and
  numbered stop pins. The quest opens in the place panel.
- **The map moves, a little.** A second canvas over the map redraws about six times a second, in pixel steps:
  glints on the water, torch flames, the summit flag and a pulse on the adventurer. Nothing else moves. It
  draws nothing while the view is panning, zooming or flying, so interaction stays smooth. It is decoration
  only. It starts off when the system asks for reduced motion, and a Motion button turns it on or off either way.
- **Warm paper, amber accent.** It shares the ant colony's palette, so the site keeps one voice. Labels
  carry a halo the way map labels do.
- **Theming follows the site.** The chrome (panel, search, chips, guild card, book pages) reads
  GRAIN tokens only, so it works in sourdough, baguette and brioche, in light and dark. The art palette
  is quest-specific and keyed on data-color-scheme, never on the flavor. The page is a scoped exception to
  the one-hue rule, art only, and nothing depends on color alone. Every flavor and scheme pair gets a
  contrast check, and the mockup has the switcher.
- **The lesson book is a quest book.** The transcript plays as dialogue from a pixel Guide, a rune lights in
  the note's margin when a concept is taught, runes collect in a Codex, each stop ends with a Trial, sources
  sit in a Pack, and Save progress is resting at a campfire. Plain text and captions stay underneath.
- **Mobile.** The map is full screen with floating search and chips. The place panel becomes a bottom
  sheet that peeks, then drags up into the route list. Zooming to a landmark opens the quest as a sheet.
  In lesson mode the note stays full screen and the book collapses to a player dock with the Guide's
  current line, which opens into a full sheet with the same tabs, rune card, trial and campfire save. The
  two-page spread becomes one page you swipe between. Touch targets are at least 38 pixels.
- **Per-region scenes.** Each region has a small pixel scene (hills, forest, mines, hall, keep, summit)
  used on the place panel, the lesson card and the mobile card, so nothing is a stretched map crop.
- **Numbers.** Quest level follows the note's level field: intro is Lv 1, intermediate Lv 2, deep Lv 3, shown as a label only.
  XP is 25 per reading minute plus 100 per trial, a sample formula to tune after the pilot. Class comes
  from the note's audience, and reading time from its readingTime.
- Final build uses a self-hosted pixel font. The mockup falls back to monospace.

## Decisions already made

- No Foothills notes. The first stop points out to Claude Academy for the basics. The exact URL is
  still to confirm before it ships. Foothills is one island of its own off the south-west coast, a port with a pier, because it points
  outside the site. Ferries sail from that pier along the south coast to a harbour at the Guild Hall, on a
  faint dotted route. The first region on the
  mainland is Loop Forest.
- Map mode is a screen of its own, the way the builder is. The explorer rail is collapsed, the assistant
  sidebar is hidden and the terminal is hidden, so the map takes the whole window. The sidebar comes back as
  the lesson book inside a quest note.
- The journey page is new. view/pages/journey does not exist yet, and this plan creates it.
- Path badges are not the course badges I issue at HAU. They are a different kind of badge: their own
  collection under their own prefix, their own medallion and their own criteria page. Nothing is added to
  /badges, and no code keyed on the /badges prefix is reused.
- Quest tokens ship in light and dark, and the sidebar in lesson mode uses the same tokens.
- The voice player is an open book. Underneath it is a plain audio element with captions.
- Character comes from a seed or a chosen username, never from hardware. A browser cannot read a MAC
  address, and fingerprinting is the wrong thing to build.
- Progress is a save file or save code. The badge link carries the state after the hash, so it never
  reaches a server. The badge page says plainly that it is self-reported.
- Quest badges live in their own namespace. Classroom award pages carry student names and must never
  share a collection, an index or a feed with them.

## Notes and lessons are many to many

A quest is a stop on the map. A lesson is one recording, made of ordered segments, and a segment is a
note plus a heading range. So one long note can become several lessons, and a pair of notes can teach as
one lesson. The sidecar file (cues, runes, plain-words digest, trial) belongs to the lesson, never to the
note, so notes stay untouched.

Where a note is cut into stops, how big a stop is and which lessons exist are decided in [quest-lessons](quest-lessons.md).

## The map is the page (decided)

The first mockups boxed the map beside a panel. That was a layout of convenience, not a design. The map
fills the viewport and everything else floats on it, as in Google Maps.

- **Layout.** Search and the place panel sit top left, filter chips beside them, display settings top right,
  layers and the zoom level bottom left, zoom and find-me bottom right. The display settings are one icon,
  closed by default, that opens icon buttons for motion, the three flavors as swatches and auto, light and
  dark. On a phone the icon moves to the bottom left and the panel is a bottom
  sheet. The site sidebar stays closed on this page.
- **The panel has a pinned back button.** A bar at the top of the panel stays in view while the panel
  scrolls. It holds a real button at the top left that names where it goes (All regions from a region, the
  region from a quest, the quest from a stop, and Back from a search) and a short breadcrumb beside it.
  Escape does the same one step. Previous and next buttons at the right of the bar step through regions in a
  region, through the whole route of quests in a quest, and through stops in a stop. They are disabled at
  the ends, name their target in a tooltip, and the left and right square bracket keys do the same.
- **The panel replaces the modal.** Welcome, region, quest and stop are four states of one place panel,
  the way a place card works. The RPG details (class, level, XP, what it covers, stops) live in the quest
  state. Begin quest opens the note in lesson mode. The separate modal over the zoomed map is dropped.
- **Zoom is four integer levels** so pixels stay square: World, Regions, Landmark and Stops, at 4, 6, 8 and
  12 screen pixels per map pixel. Scroll or double-click steps one level around the cursor, drag pans, and
  clicking a pin flies there, stepping through the levels on the way. Smooth fractional zoom is rejected
  because it blurs pixel art.
- **Semantic zoom.** World shows the six region pins and names. Regions shows every quest pin with its
  short name. Landmark adds the detail sprites and, for the selected quest, amber stop pins. Stops names
  each stop. Region labels fade as quest labels arrive.
- **Landmark detail maps.** From the Landmark level each landmark turns into its own small map, drawn at twice
  the world's resolution. The castle in GRAIN Keep becomes walls, corner towers, a gate, a keep, a library and an
  armory. The Guild Hall becomes a village with streets, a plaza, a market and a notice board. The Model Mines
  mountain becomes a lobed mine hill with shafts, timber, rails, an ore vault, lanterns and snow caps. Loop
  Forest becomes an elf town in the canopy: great trees with houses built into their crowns, plank walkways
  and rope bridges looping between them, a hearth on a round platform in the central tree, and lanterns. The
  four stations are a scroll house, a workshop, a lantern tower and a gate house. No place is a plain oval: ground
  patches, the forest loop and the mine hill are all warped, so each has its own outline. The Summit becomes one peak with a single switchback trail, a camp, two cabins and a frozen lake, kept quiet on purpose. The
  Foothills become a port island with a lighthouse, a boathouse, a pier for the ferries and the start camp. Quests sit at buildings and stops sit at rooms, so the place you zoom into is
  what the lesson is about. Only the landmark nearest the middle of the view shows its detail, and it eases in over about a
  third of a second. Drag to another region and the old detail fades out while the next fades in, and the
  pins of the other regions dim, so the map feels like one place rather than a switch. Each scene is baked
  once into an offscreen canvas, and a selected quest draws a trail through its stops.
- **Pins and labels are real elements over the canvas, and they are not pixel art.** The terrain and landmarks
  are pixel art. A pin is a clean round marker with a number, a white edge and a pointer, so it reads against
  busy terrain: red for open, green with a check for done, grey for filtered out, amber for a stop. It stays
  the same size at every zoom level, has a target of at least 44 pixels with its padding, and grows and gains
  a ring when selected. A pin shows no name by default. Hovering or focusing it shows a small card beside it with the name,
  level, minutes and stop count, flipped to the left near the screen edge. A click opens the quest in the place panel and hides the
  card until the pointer leaves the pin, so a selected pin never leaves a card covering the map. Pins are smaller while zoomed out and full size from the
  Landmark level. Stop pins are numbered one to nine. Pins are buttons with names and labels are text, so keyboard and screen reader users
  get the same route lists and the canvas is decoration. Arrow keys
  pan and plus and minus zoom. Escape goes up one level.
- **Working prototype:** docs/mockups/quest-map/fullscreen.html, with the real quests, levels, reading
  times and proposer stops. Drag, scroll, click and search all work.

## Mockups (part of this plan)

The mockups are the design reference for this plan and for quest-lessons. A build task is done when what
it ships matches the mockup it cites, or the plan records why it differs. The files live in
docs/mockups/quest-map, open in any browser, and have a flavor picker (sourdough, baguette, brioche) and
an Auto, Light and Dark switch.

| File | What it is | Backs |
|---|---|---|
| fullscreen.html | The working full-screen map: drag, zoom, fly-to, search, filter chips, the place panel in four states, a bottom sheet on a phone. Real quests, levels, reading times and proposer stops. | The map is the page, the zoom rules, the place panel |
| in-site-map.html | The map inside the real portfolio shell, in map mode: the explorer rail collapsed, the assistant sidebar and the terminal hidden. Built from the live site's own markup and CSS, with the theme buttons wired to all six flavor and scheme pairs. | Map mode, how the page sits in the site |
| in-site-note.html | A real note page with the lesson card under the byline, above the contents block, and the stop pips beside the section headings. Same method. | Lesson card, section pips |
| index.html section 1 | Static layout study of the Google Maps arrangement. Superseded by fullscreen.html. | History only |
| index.html section 2 | The zoomed landmark with a modal. Superseded: the place panel replaces the modal. | History only |
| index.html section 3 | The guild card, save, and how the badge link rebuilds it. | Guild card, badge link |
| index.html section 4 | Lesson mode as a quest book: Guide dialogue, margin runes, Log, Codex, Pack, Trial, campfire save, level-up. | The lesson book |
| index.html section 5 | The compatibility check run on a new note. | Adding a note adds a quest |
| index.html section 6 | Notes and lessons as a many to many model. | Notes and lessons |
| index.html section 7 | The lesson card on a note, with section pips and variants. | Lesson card |
| index.html section 8 | Runes versus badges, and a badge page. | Runes and badges |
| index.html section 9 | Six phone screens. | Mobile |

Where the mockups and the prose disagree, the prose wins and the mockup is a bug. Known gaps in the
mockups: index.html still draws the older pixel pins in sections 1, 2 and 9, and fullscreen.html and the in-site pages show the decided markers; the pixel font is a monospace stand-in, the Guide's lines are placeholders, stop pin positions
are formula placed, and the sheet heights on phone are sample proportions.

## The map from what exists

The notes already carry what a quest needs. Nothing new is typed per note.

| Quest field | Comes from |
|---|---|
| Region | shared tags, plus a hand-approved region in content/quests/regions |
| Quest level chip | the note's level: intro, intermediate, deep. A difficulty label only. It does not order regions or gate anything. Player level comes from XP alone, on a curve to set after the pilot. |
| Class | the note's audience: build, lead, learn, teach |
| XP | readingTime plus the number of stops |
| You will learn | the note's summary and its headings |
| Sources on the trail | the note's Sources section in the body, and the sources ids that point at the Reading shelf |
| Order | depends on a plan-style prerequisite list in the region file |

First six regions, from the published AI notes (order inside each is a guess to be corrected):

| Region | Landmark | Notes |
|---|---|---|
| Foothills | an island with hills, off the coast | one external stop: Claude Academy |
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
- [ ] Full-screen map page in map mode (rail collapsed, assistant sidebar and terminal hidden): pixel canvas, four integer zoom levels, semantic zoom, fly-to, pins as real buttons and the panel's route lists as the keyboard and screen reader path.
- [ ] Place panel states (welcome, region, quest, stop): class, level, XP, what it covers, stops, sources and begin quest.
- [ ] Guild card: seeded character, optional username, save file and save code, load.
- [ ] Badge link that rebuilds the card from the hash, with the self-reported notice on the page.
- [ ] Path badges as their own kind of badge, separate from the HAU course badges: a new collection under its own prefix, its own medallion in the quest palette and its own criteria page. Earned by finishing a region's trials, with the runes collected shown as its skills.
- [ ] Lesson card on each note that has a lesson, linking the note to its lesson and back (see quest-lessons).
- [ ] Lesson mode: the sidebar becomes the quest book. A sidecar file per lesson holds segments, cues, rune ids, the plain-words digest and the trial. The notes themselves are untouched.
- [ ] Wire the quest UI to GRAIN tokens and verify every flavor and scheme pair for contrast.
- [ ] Concept highlight in the note, driven through the GRAIN surface and verb registry, not a back channel.
- [ ] Motion layer: water glints, torches, the flag and one pulse, paused during pan and zoom, off under reduced motion, with a Motion button.
- [ ] Reduced motion, captions, keyboard path and contrast checked in both themes.
- [ ] First recording for one quest, to prove the book end to end before recording the rest.
- [ ] Extract the map, place panel, guild card and book into GRAIN once the pilot has run, leaving this site to supply the data and the theme.

## Where the code lives

The map, place panel, guild card and book are generic. They should end up in GRAIN, with this site
supplying the data and the theme. Build them here first and extract them once the pilot lesson has run
end to end. Design work belongs up in grain, so the extraction is a task on the list below and part of
done, not a someday.

## Tests and gates

- Unit tests for tools/quests.ts: placement outcomes, the five-note region proposal, and a pin on a draft failing.
- A keyboard-only walk of the map and the place panel, and a test that Motion starts off under reduced motion.
- The WCAG gate over the map page and a note with a lesson card, in all six flavor and scheme pairs.
- The playwright suite, including the visual baselines on macOS, plus the lint gate.
- A run report under artifacts/runs and a memory note for the decisions made.

## Honest limits

- Where about four and a half hours of audio is hosted is not decided. A public repository is the wrong home for large files.
- Progress is local to the browser until saved. Clearing storage without a save file loses it.
- The badge shows what the holder says they finished. Nothing on a static site can prove it.
- The region groupings are my first read of the notes, not a curriculum. Order and prerequisites need
  a read-through by the author before launch.

## Done when

The map ships with six regions, one fully recorded quest, the check wired into the note skill, the
extraction into GRAIN done, every gate in Tests and gates green with the totals recorded, and screenshots
of the map, the place panel and the lesson book in light and dark shown in the session.
