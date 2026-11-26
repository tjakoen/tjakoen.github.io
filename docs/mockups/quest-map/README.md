# Quest map mockups

These are design references for plans/quest-map.md and plans/quest-lessons.md. They are not shipped code.

- fullscreen.html is the working map. It is one file with no network requests, and it bakes its art in the browser at load.
- index.html is an older static study. Some sections still show superseded designs, such as pixel pins and the Foothills name.
- in-site-map.html and in-site-note.html show the map and a lesson card inside the real portfolio shell. They inline the site's own CSS, so each is about 400 KB. Do not ship them.

## Regenerating the in-site pages

build-in-site.py needs these next to it: note.html (a rendered note page fetched from a running site), css/ (the site stylesheets named in that page, saved with slashes turned into underscores) and fonts_*.woff2. Run it with Python 3 from that folder. The pages are mockups, so they are checked by eye.

## Before shipping the real feature

Bake the base map, the detail scenes and the sprites to a cached image at build time, render the region and quest lists as plain HTML so the route works without JavaScript, move the quest, route and scene data out of the script, and add tests and the accessibility gate. The audit in the quest-map plan lists the rest.
