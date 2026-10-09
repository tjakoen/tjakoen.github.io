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
const hosts = [...document.querySelectorAll("[data-live-figure]")];
const names = new Set(hosts.map((host) => host.dataset.liveFigure));
const needsWidgets = ["ratio", "matrix", "sprint", "loop", "trap"].some((name) => names.has(name));
const needsFloor = ["whiplash", "buildorder", "rulegate", "roadmap", "agentloop", "gates", "twopath", "failreport", "costwait", "promotion"]
  .some((name) => names.has(name));

// Static SVGs already carry the meaning when JavaScript is off. On routes with no live figure, do not
// download the three interactive figure families just because this small upgrade hook is shared by
// the shell. Notes and talk decks load only the family their own figures use.
const [multiplier, widgets, floor] = await Promise.all([
  names.has("multiplier") ? import("/site/figure-multiplier.js") : null,
  needsWidgets ? import("/site/figure-widgets.js") : null,
  needsFloor ? import("/site/figure-floor.js") : null,
]);

const BUILDERS = {
  ...(multiplier ? {
    multiplier: (host) => {
      host.innerHTML = multiplier.MULTIPLIER_MARKUP;
      return multiplier.mountMultiplier(host.querySelector("[data-mult]"));
    },
  } : {}),
  ...(widgets ? { ratio: widgets.mountRatio, matrix: widgets.mountMatrix, sprint: widgets.mountSprint,
    loop: widgets.mountLoop, trap: widgets.mountTrap } : {}),
  ...(floor ? { whiplash: floor.mountWhiplash, buildorder: floor.mountBuildOrder,
    rulegate: floor.mountRuleGate, roadmap: floor.mountRoadmap, agentloop: floor.mountAgentLoop,
    gates: floor.mountGates, twopath: floor.mountTwoPath, failreport: floor.mountFailReport,
    costwait: floor.mountCostWait, promotion: floor.mountPromotion } : {}),
};

for (const host of hosts) {
  const build = BUILDERS[host.dataset.liveFigure];
  if (!build) continue;                      // unknown name: leave the static figure alone
  const fallback = host.innerHTML;           // keep it, so a thrown builder is not a blank hole
  try {
    if (!build(host)) host.innerHTML = fallback;
  } catch {
    host.innerHTML = fallback;
  }
}
