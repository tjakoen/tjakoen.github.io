// Page-specific enhancements stay off routes that have no matching content.
const tasks = [];

if (document.querySelector("[data-lightbox]")) {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/styles/lightbox.css";
  const loaded = new Promise((resolve) => {
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", resolve, { once: true });
  });
  document.head.append(stylesheet);
  tasks.push(loaded.then(() => import("/scripts/lightbox.js")));
}

if (document.querySelector("[data-live-figure]")) tasks.push(import("/site/figures.js"));

// The ant in the status bar is the door, not the colony. The small launcher below owns the ant,
// the first click and the open API; the 138 KB game module is imported only when someone opens it,
// types `nest`, asks for a stray, or calls the debug hook. The game keeps the same test hooks.
const nestModes = document.querySelector(".assistant__modes");
const nestAside = document.querySelector(".assistant");
const nestMain = document.querySelector(".app-shell__main") || document.querySelector("main");
const nestBar = document.querySelector(".status-bar");
if (nestModes && nestAside && nestMain && nestBar) {
  const nestStyle = document.createElement("style");
  nestStyle.textContent = `
    .nest-switch { background: none; border: 0; padding: 2px 4px; margin: 0 6px; color: var(--ink-faint); cursor: pointer; line-height: 0; }
    .nest-switch:hover, .nest-switch:focus-visible { color: var(--ink); }
    .nest-switch[aria-pressed="true"] { color: var(--color-accent); }
    .nest-switch.nest-pulse svg { animation: nest-pulse 1.1s ease-out 2; }
    @keyframes nest-pulse { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.45); } }
    [data-nest-start] { font: 11px/1 var(--font-mono); letter-spacing: .06em; text-transform: uppercase; padding: 8px 12px; border: 1px solid currentColor; background: none; color: inherit; cursor: pointer; }
    [data-nest-start]:hover, [data-nest-start]:focus-visible { background: var(--paper-2); outline: 1px dashed var(--color-accent); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { .nest-switch.nest-pulse svg { animation: none; } }`;
  document.head.append(nestStyle);

  const NEST_ANT_POINTS = [
    [0, 0], [1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [5, 3], [6, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [0, 4], [1, 4], [2, 4], [3, 4], [5, 4], [6, 4], [7, 4],
    [9, 4], [10, 4], [11, 4], [12, 4], [13, 4], [1, 5], [2, 5], [3, 5], [5, 5], [6, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [5, 2], [4, 1], [9, 2], [10, 1],
    [7, 6], [8, 7], [2, 6], [1, 7]];
  const NEST_ANT_SVG = `<svg width="18" height="10" viewBox="0 0 22.4 12.8" fill="currentColor" aria-hidden="true">${NEST_ANT_POINTS.map(([x, y]) => `<circle cx="${x * 1.6 + 0.8}" cy="${y * 1.6 + 0.8}" r="0.72"/>`).join("")}</svg>`;

  const nestAnt = document.createElement("button");
  nestAnt.type = "button"; nestAnt.className = "nest-switch"; nestAnt.title = "Nest";
  nestAnt.setAttribute("aria-label", "Open the Nest"); nestAnt.setAttribute("aria-pressed", "false");
  nestAnt.innerHTML = NEST_ANT_SVG;
  if (nestBar.querySelector(".status-bar__xray")) nestBar.insertBefore(nestAnt, nestBar.querySelector(".status-bar__xray"));
  else nestBar.append(nestAnt);

  let nestGamePromise = null;
  const ensureNestGame = () => {
    if (!nestGamePromise) nestGamePromise = import("/site/nest-mockup.js").catch((err) => {
      nestGamePromise = null;
      throw err;
    });
    return nestGamePromise;
  };
  let nestPlaceholderLauncher = null, nestPlaceholderStray = null;

  const openNest = async () => {
    try {
      await ensureNestGame();
      if (window.__nestLauncher && window.__nestLauncher !== nestPlaceholderLauncher) window.__nestLauncher.open();
    } catch (err) { console.error("nest:", err); }
  };
  const firstClick = (event) => { event.preventDefault(); void openNest(); };
  nestAnt._nestLoader = firstClick;
  nestAnt.addEventListener("click", firstClick);
  document.querySelectorAll("[data-nest-start]").forEach((button) => {
    const click = (event) => { event.preventDefault(); void openNest(); };
    button._nestLoader = click;
    button.addEventListener("click", click);
  });

  nestPlaceholderLauncher = { open: openNest, close: () => {} };
  window.__nestLauncher = nestPlaceholderLauncher;
  nestPlaceholderStray = {
    spawn: async (force = false) => {
      try {
        await ensureNestGame();
        if (window.__nestStray && window.__nestStray !== nestPlaceholderStray) window.__nestStray.spawn(force);
      } catch (err) { console.error("nest:", err); }
    },
    cancel: () => {},
  };
  window.__nestStray = nestPlaceholderStray;
}

if (document.querySelector("[data-note-progress]")) tasks.push(import("/site/note-progress.js"));

await Promise.all(tasks);
