/* site/talk-floor.js — the live figures for "Everybody Wants the Agent", on the deck.
 *
 * Consumer of the presentation organism's one public seam, exactly like site/talk.js:
 *
 *   deck.addEventListener("presentation:slide", (e) => { const { title, step, entered } = e.detail })
 *
 * The widgets themselves live in site/figure-floor.js and are shared with the post, so the deck
 * cannot drift from the paragraph. What differs is only the trigger: in prose you drag the dial
 * yourself, and here the slide steps drive it, because a room does not have a mouse.
 */
import { mountWhiplash, mountBuildOrder, mountRuleGate, mountRoadmap, mountAgentLoop } from '/site/figure-floor.js';

const deck = document.querySelector('.presentation[data-deck]');
if (deck) {
  const hosts = {};
  for (const host of deck.querySelectorAll('[data-live-figure]')) {
    const name = host.dataset.liveFigure;
    const build = { whiplash: mountWhiplash, buildorder: mountBuildOrder, rulegate: mountRuleGate, roadmap: mountRoadmap, agentloop: mountAgentLoop }[name];
    if (!build) continue;
    const fallback = host.innerHTML;                  // the static SVG stays the safety net
    try { if (build(host)) hosts[name] = host; else host.innerHTML = fallback; }
    catch { host.innerHTML = fallback; }
  }

  // Step 0 is the slide landing, so each figure starts where the argument starts: adoption at zero,
  // build order on "coder first". Every step after that walks it one notch, which means the figure
  // is driven by the same arrow key as everything else and there is nothing extra to remember.
  const WHIP_STEPS = [0, 35, 70, 100];
  deck.addEventListener('presentation:slide', (e) => {
    const { title, step } = e.detail;
    if (title === 'The whiplash' && hosts.whiplash?.__setAdoption) {
      hosts.whiplash.__setAdoption(WHIP_STEPS[Math.min(step, WHIP_STEPS.length - 1)]);
    }
    if (title === 'Build order' && hosts.buildorder?.__setMode) {
      hosts.buildorder.__setMode(step >= 1 ? 'floor' : 'coder');
    }
    if (title === 'The roadmap' && hosts.roadmap?.__setMonth) {
      hosts.roadmap.__setMonth([0, 2, 6, 12, 18][Math.min(step, 4)]);
    }
    if (title === 'Loop architecture' && hosts.agentloop?.__runLoop) {
      hosts.agentloop.__runLoop(step >= 1);
    }
    if (title === 'Instruction or hook' && hosts.rulegate?.__setMode) {
      hosts.rulegate.__setMode(step >= 1 ? 'hook' : 'instruction');
    }
  });
}
