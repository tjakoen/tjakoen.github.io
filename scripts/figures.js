// site/figures.js — upgrades a figure in prose into the live version from the talk.
//
// PROGRESSIVE ENHANCEMENT, and the order matters. What the server sends is the static SVG the
// FIGURES standard asks for: self-contained, its own palette, no dependencies. This file runs
// afterwards and, only if it runs, replaces that SVG with the interactive widget. Turn JS off,
// print the page, crawl it, or export it to dist and the figure that was always there is what you
// get. Nothing here is load-bearing for meaning.
//
// Why it's allowed at all: the rule in FIGURES says "no client JS", and gives as its reason that
// script would break the zero-framework-JS promise. That promise is about frameworks. This page
// already ships a dozen small vanilla islands (theme, cmdk, lightbox, tabs, terminal), and this is
// one more of exactly that shape. The static fallback is what keeps the standard's real intent.
import { MULTIPLIER_MARKUP, mountMultiplier } from "/site/figure-multiplier.js";

const BUILDERS = {
  multiplier: (host) => {
    host.innerHTML = MULTIPLIER_MARKUP;
    return mountMultiplier(host.querySelector("[data-mult]"));
  },
};

for (const host of document.querySelectorAll("[data-live-figure]")) {
  const build = BUILDERS[host.dataset.liveFigure];
  if (!build) continue;                      // unknown name: leave the static figure alone
  const fallback = host.innerHTML;           // keep it, so a thrown builder is not a blank hole
  try {
    if (!build(host)) host.innerHTML = fallback;
  } catch {
    host.innerHTML = fallback;
  }
}
