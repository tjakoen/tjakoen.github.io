# docs/ — the option (b) seam (prototype)

Decision (2026-07-09): the portfolio becomes the physical home of the stack's explanatory docs
(option b). This folder is the landing zone: layer docs migrate to docs/<layer>/ here, and
consumers (pantry, this site's own routes) resolve them through this repo's package exports
instead of each layer's package. This file proves the seam end to end before any real doc moves.
