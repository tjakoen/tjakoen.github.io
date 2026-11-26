# Quest map mockups

These are design references for plans/quest-map.md and plans/quest-lessons.md. They are not shipped code.

- fullscreen.html is the working map. Serve this folder with any static server and open it. It fetches its baked art from art/ and its quest data from the JSON block inside the file. Without the art folder, or with ?procedural on the address, it draws everything itself in the browser, which is also how the art is made.
- bake-art.ts bakes that art at build time: bun docs/mockups/quest-map/bake-art.ts. It writes the base map, the waves layer, the path-only map, the layer icon, the six landmark scenes and the sparkle spots for each of the six flavor and scheme pairs into art/. Run it again after any change to the drawing code or the palette, and commit the result. Set QM_CHROMIUM to a browser binary if the Chromium Playwright expects is not installed.
- index.html is an older static study. Some sections still show superseded designs, such as pixel pins and the Foothills name.
- in-site-note-map-card.html is in-site-note.html plus the Where this sits card and the Related, on the map row. build-note-map-card.py makes it from in-site-note.html and the baked art. Do not ship it.
- in-site-map.html and in-site-note.html show the map and a lesson card inside the real portfolio shell. They inline the site's own CSS, so each is about 400 KB. Do not ship them.

## Regenerating the in-site pages

build-in-site.py needs these next to it: note.html (a rendered note page fetched from a running site), css/ (the site stylesheets named in that page, saved with slashes turned into underscores) and fonts_*.woff2. Run it with Python 3 from that folder. The pages are mockups, so they are checked by eye.

## Before shipping the real feature

The mover sprites (people, boats, birds, the kraken) are still built on load, because they are small and move every frame. Render the region and quest lists as plain HTML so the route works without JavaScript, and add tests and the accessibility gate. The audit in the quest-map plan lists the rest.
