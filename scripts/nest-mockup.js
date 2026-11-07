// Nest: a playable sketch of plans/ant-nest-game.md. The ant in the status bar opens it, and so
// does the `nest` terminal command. `?nest-debug` exposes the local test hooks.
//
// One colony, two views. Every ant is either in the nest (Braille dots in the sidebar) or out on
// the page (a small dot SVG), and it leaves and enters through the anthill drawn in both places.
// The colony starts with two scouts and four workers. Workers stay home until a scout finds text
// and walks a letter back, which lays a scent trail; that scout becomes a worker, and workers
// follow the trail, six to a line. A full line, or no trail at all, sends a worker out to scout.
// A trail lasts while any of its ants live. Big letters need a crew of two or three, who carry it
// side by side. A carried letter keeps its own colour, face and underline, and drifts home slowly
// when a carrier is squashed. If the whole colony dies, the queen sends out one new scout.
// Every colour is a theme token, so each flavor recolours the nest.
(() => {
  const modes = document.querySelector(".assistant__modes");
  const aside = document.querySelector(".assistant");
  const shell = aside?.closest(".app-shell");
  const main = document.querySelector(".app-shell__main") || document.querySelector("main");
  if (!modes || !aside || !main || document.getElementById("nest-mock")) return;

  // One place for the numbers that decide how the colony feels. The traffic values are the
  // difference between a line of ants and a pile of them, so they stay together.
  const TUNING = {
    line: 5,              // ants that share one trail
    maxAnts: 20,
    speed: 44,            // page pixels per second
    gap: 18,              // spacing between ants walking the same way
    nestSpeed: 0.18,      // nest units per second
    trailTtl: 90,         // seconds before a trail wears out even with letters left
    trailFade: 1600,      // ms a spent trail takes to leave the page
    firstScoutRange: 240, // the opening scout keeps its first find close to the hill
    party: [20, 50, 90, 140, 200, 280, 380], // letters stolen at each colony dance
  };
  const LINE = TUNING.line, MAX_ANTS = TUNING.maxAnts, SPEED = TUNING.speed;
  const GAP = TUNING.gap, NEST_SPEED = TUNING.nestSpeed;

  const style = document.createElement("style");
  style.textContent = `
    #nest-mock { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: var(--space-2, 8px);
      padding: var(--space-3, 12px); font: 12px/1.4 var(--font-mono); color: var(--ink);
      min-width: 0; max-width: 100%; overflow-x: hidden; }
    #nest-mock > * { min-width: 0; max-width: 100%; }
    #nest-mock .head { min-width: 0; }
    #nest-mock .head .lbl { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #nest-mock .muted { color: var(--ink-muted); }
    #nest-mock .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; display: flex; justify-content: space-between; gap: 8px; }
    #nest-mock .well { flex: 1 1 0; min-height: 0; overflow: hidden; background: var(--paper-2); border: 1px solid var(--color-line);
      display: flex; align-items: center; justify-content: center; }
    .nest-pre { margin: 0; font-family: var(--font-mono); font-size: 10px; line-height: 1.2; letter-spacing: -0.04em;
      -webkit-text-stroke: 0.05em currentColor; color: var(--ink-faint); user-select: none; }
    .nest-pre b { font-weight: inherit; }
    .nest-pre .t1 { color: var(--ink-muted); } .nest-pre .t2, .nest-pre .t5, .nest-pre .t6 { color: var(--color-accent); }
    .nest-pre .t3, .nest-pre .t4 { color: var(--ink); }
    #nest-mock .stats { display: grid; grid-template-columns: auto 1fr auto 1fr; gap: 2px 10px; margin: 0; align-items: baseline; }
    #nest-mock .stats dt, #nest-mock .stats dd { margin: 0; font-size: 12px; line-height: 1.4; }
    #nest-mock .stats dd { text-align: right; font-variant-numeric: tabular-nums; }
    #nest-mock .accent { color: var(--color-accent); }
    #nest-mock .bar { font-family: var(--font-mono); letter-spacing: -0.04em; -webkit-text-stroke: 0.05em currentColor; }
    #nest-mock .log { margin: 0; padding: 0; list-style: none; min-height: 4.2em; font-size: 11px; color: var(--ink-muted); }
    #nest-mock .log li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #nest-mock .log li:first-child { color: var(--ink); }
    #nest-mock .log li::before { content: "› "; color: var(--ink-faint); }
    #nest-mock .row { display: flex; gap: 6px; }
    #nest-mock button { flex: 1; padding: 6px; background: none; border: 1px solid currentColor; color: inherit; font: inherit; cursor: pointer; }
    #nest-mock button:hover { background: var(--paper-2); }
    #nest-mock .tools button { position: relative; display: grid; place-items: center; min-width: 0; min-height: 40px; }
    #nest-mock .tools button:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
    #nest-mock .tools button[data-cooldown]::after { content: attr(data-cooldown); position: absolute; right: 2px; bottom: 0; font-size: 9px; }
    #nest-mock .tool-help { min-height: 2.8em; margin: 0; }
    #nest-mock { position: relative; }
    #nest-mock .confirm { position: absolute; inset: auto var(--space-3, 12px) var(--space-3, 12px); padding: var(--space-3, 12px);
      background: var(--paper); border: 1px solid var(--ink); box-shadow: 0 6px 24px rgba(0,0,0,.35); }
    #nest-mock .confirm p { margin: 0 0 8px; }
    .nest-layer { position: absolute; left: 0; top: 0; width: 100%; z-index: 50; pointer-events: none; overflow: hidden; user-select: none; -webkit-user-select: none; }
    [data-nest-tool="squash"], [data-nest-tool="squash"] *,
    [data-nest-tool="wipe"], [data-nest-tool="wipe"] * { user-select: none; -webkit-user-select: none; }
    .nest-ant, .nest-hill, .nest-stray { user-select: none; -webkit-user-select: none; }
    .nest-scent { position: absolute; left: 0; top: 0; width: 1px; height: 1px; overflow: visible; }
    .nest-layer { --nest-trail: var(--ink-muted); }
    :root[data-color-scheme="light"] .nest-layer { --nest-trail: color-mix(in srgb, var(--ink) 66%, var(--paper)); }
    @media (prefers-color-scheme: light) { :root:not([data-color-scheme="dark"]) .nest-layer { --nest-trail: color-mix(in srgb, var(--ink) 66%, var(--paper)); } }
    .nest-scent polyline { fill: none; stroke: var(--nest-trail); stroke-width: 1.7; stroke-dasharray: 1 4.2; stroke-linecap: round; opacity: .8; transition: opacity 1s; }
    .nest-scent polyline.halo { stroke: var(--paper); stroke-width: 3.6; stroke-dasharray: none; opacity: .55; }
    .nest-scent polyline.breaking { transition: opacity .55s, transform .55s; }
    .nest-scent polyline.scouting { opacity: .3; }
    .nest-ant { position: absolute; width: 23px; height: 13px; margin: -6px 0 0 -11px; padding: 0; border: 0; background: none;
      color: var(--ink); cursor: crosshair; pointer-events: auto; }
    @media (pointer: coarse) {
      .nest-ant { width: 44px; height: 44px; margin: -22px 0 0 -22px; display: grid; place-items: center; }
    }
    .nest-ant:hover svg, .nest-ant:focus-visible svg { transform: scale(1.35); }
    .nest-ant:focus-visible { outline: 1px dashed var(--color-accent); outline-offset: 3px; }
    .nest-ant.scout { color: var(--color-accent); }
    .nest-ant svg { display: block; overflow: visible; transition: transform .15s; }
    .nest-ant .legs-b { opacity: 0; }
    .nest-ant.walk .legs-a { animation: nest-step .18s steps(1) infinite; }
    .nest-ant.walk .legs-b { animation: nest-step .18s steps(1) infinite reverse; }
    .nest-ant.lift svg { animation: nest-lift .35s ease-out; }
    .nest-ant.wait svg { animation: nest-wait 1s ease-in-out infinite; }
    @keyframes nest-step { 0% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes nest-lift { 40% { transform: translateY(-3px) scale(1.08); } }
    @keyframes nest-wait { 50% { transform: rotate(8deg); } }
    .nest-letter { position: absolute; white-space: pre; pointer-events: none; line-height: 1; transform-origin: 50% 100%; }
    .nest-squash { position: absolute; color: var(--ink-faint); font: 14px var(--font-mono); pointer-events: none; transition: opacity 1.4s; }
    .nest-hill { position: absolute; font: 12px/1.2 var(--font-mono); letter-spacing: -0.04em; white-space: pre; color: var(--ink-muted);
      -webkit-text-stroke: 0.05em currentColor; pointer-events: none; }
    .nest-hill b { font-weight: inherit; color: var(--ink-faint); }
    .nest-ant.soldier, .nest-ant.guard { color: var(--ink-muted); }
    .nest-ant.soldier svg, .nest-ant.guard svg { transform: scale(1.35); }
    .nest-ant.soldier:hover svg, .nest-ant.guard:hover svg { transform: scale(1.62); }
    .nest-ant.hit { color: var(--color-accent); }
    .nest-ant.flyer { color: var(--ink-muted); }
    .nest-ant.flyer .wing { animation: nest-flap .1s steps(1) infinite; }
    .nest-ant.builder { color: var(--color-accent); }
    .nest-ant.swatted { pointer-events: none; }
    .nest-ant.swatted svg { animation: nest-swat .3s cubic-bezier(.2,.8,.3,1) forwards; }
    .nest-splat { position: absolute; width: 16px; height: 16px; margin: -8px 0 0 -8px; border: 1px solid var(--color-accent); border-radius: 50%; pointer-events: none; animation: nest-splat .5s ease-out forwards; }
    @keyframes nest-swat { 40% { transform: scale(1.25,.5) translateY(2px); } 100% { transform: scale(1.55,.16) translateY(4px); opacity: 0; } }
    @keyframes nest-splat { to { transform: scale(2.4); opacity: 0; } }
    @keyframes nest-flap { 50% { opacity: .15; } }
    .nest-mini { width: 56px; height: 20px; translate: -50% -100%; text-align: center; font-size: 9px; line-height: 10px; }
    .nest-badge { position: absolute; translate: -50% 0; font: 10px/1 var(--font-mono); color: var(--ink-muted); pointer-events: none; white-space: nowrap; }
    .nest-badge.open { color: var(--color-accent); }
    .nest-mini.open { cursor: pointer; }
    .nest-mini.denied { color: var(--color-accent); transform: translateX(2px); }
    .nest-hill { pointer-events: auto; cursor: pointer; transition: opacity .3s, filter .3s; }
    .nest-hill.pressing { filter: brightness(1.4); }
    .nest-hill.sealed { color: var(--color-accent); }
    .nest-hill.sealed b { color: var(--color-accent); }
    .nest-scent .hit { stroke: transparent; stroke-width: 16; stroke-dasharray: none; cursor: grab; opacity: 1; }
    .nest-bait { position: absolute; font: 16px var(--font-mono); color: var(--color-accent); -webkit-text-stroke: .05em currentColor;
      transform: translate(-50%, -50%); pointer-events: none; transition: opacity 1s; }
    [data-nest-tool="squash"], [data-nest-tool="squash"] :is(a, button, summary, label) { cursor: crosshair; }
    [data-nest-tool="wipe"], [data-nest-tool="wipe"] :is(a, button, summary, label) { cursor: cell; }
    .nest-armed, .nest-armed * { cursor: copy !important; }
    .nest-layer.overrun .nest-ant { cursor: not-allowed; }
    #nest-mock .end { position: absolute; inset: var(--space-3, 12px); display: flex; flex-direction: column; justify-content: center; gap: 10px;
      padding: var(--space-4, 16px); background: var(--paper); border: 1px solid var(--ink); text-align: center; }
    #nest-mock .end h3 { margin: 0; font: 400 var(--text-xl, 20px)/1.2 var(--font-accent, serif); }
    #nest-mock .end pre { margin: 0; font: inherit; text-align: left; display: inline-block; }
    #nest-mock details { font-size: 11px; color: var(--ink-muted); } #nest-mock summary { cursor: pointer; }
    #nest-mock details p { margin: 6px 0 0; }
    #nest-mock .tools button[aria-pressed="true"] { color: var(--color-accent); border: 2px solid currentColor; background: var(--paper-2); }
    .nest-scent .hit { pointer-events: none; }
    .nest-layer[data-tool="wipe"] .nest-scent .hit { pointer-events: stroke; touch-action: none; }
    #nest-mock .tools button[disabled] { opacity: .45; cursor: default; }
    .nest-switch { background: none; border: 0; padding: 2px 4px; margin: 0 6px; color: var(--ink-faint); cursor: pointer; line-height: 0; }
    .nest-switch:hover, .nest-switch:focus-visible { color: var(--ink); }
    .nest-switch[aria-pressed="true"] { color: var(--color-accent); }
    .nest-switch.nest-pulse svg { animation: nest-pulse 1.1s ease-out 2; }
    @keyframes nest-pulse { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.45); } }
    .nest-stray { position: absolute; width: 23px; height: 13px; margin: -6px 0 0 -11px; padding: 0; border: 0; background: none;
      color: var(--ink-muted); cursor: pointer; z-index: 40; opacity: .7; pointer-events: auto; transition: opacity .35s, color .35s; }
    .nest-stray:hover, .nest-stray:focus-visible { color: var(--ink); opacity: 1; }
    .nest-stray:focus-visible { outline: 1px dashed var(--color-accent); outline-offset: 3px; }
    .nest-stray svg { display: block; width: 23px; height: 13px; overflow: visible; }
    @media (prefers-reduced-motion: reduce) { .nest-switch.nest-pulse svg { animation: none; } }
    #nest-mock .head { display: flex; align-items: center; gap: 8px; justify-content: space-between; }
    #nest-mock .head .lbl:first-child { flex: 1; }
    #nest-mock .head .x { flex: 0 0 auto; width: 24px; height: 24px; padding: 0; border: 1px solid transparent; font: 16px/1 var(--font-mono); color: var(--ink-muted); }
    #nest-mock .head .x:hover { border-color: var(--color-line); color: var(--ink); }
    .nest-mini.hit { animation: nest-mini-hit .25s ease-out; }
    @keyframes nest-mini-hit { 30% { transform: translateX(2px) scale(.96); } }
    .nest-queen { position: absolute; width: 40px; height: 22px; margin: -11px 0 0 -20px; color: var(--color-accent); pointer-events: none; z-index: 2; transition: opacity .4s; }
    .nest-queen svg { width: 100%; height: 100%; display: block; }
    .nest-queen.bob { animation: nest-bob .55s ease-in-out infinite alternate; }
    .nest-orbit { position: absolute; white-space: pre; pointer-events: none; color: var(--color-accent); font: 11px/1 var(--font-mono); opacity: .75; }
    @keyframes nest-bob { to { transform: translateY(-3px); } }
    .nest-decor { position: absolute; pointer-events: none; color: var(--ink-muted); opacity: .9; z-index: 0;
      margin: 0; font: 13px/0.95 var(--font-mono); letter-spacing: -0.04em; -webkit-text-stroke: 0.05em currentColor;
      white-space: pre; user-select: none; }
    #nest-mock .nest-meters { display: grid; gap: 5px; }
    #nest-mock .nest-meter { display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; align-items: baseline; }
    #nest-mock .nest-meter__bar { grid-column: 1 / -1; height: 10px; background: var(--paper-2); border: 1px solid var(--color-line); border-radius: 999px; overflow: hidden; }
    #nest-mock .nest-meter__bar > span { display: block; height: 100%; width: 0; background: var(--ink); border-radius: 999px; transition: width .35s; }
    #nest-mock .nest-meter__bar.accent > span { background: var(--color-accent); }
    #nest-mock .stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, auto)); gap: 1px 10px; margin: 0; align-items: baseline; }
    #nest-mock .stat-grid div { display: flex; justify-content: space-between; gap: 6px; min-width: 0; overflow: hidden; }
    #nest-mock .stat-grid dt { margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-muted); white-space: nowrap; }
    #nest-mock .stat-grid dd { margin: 0; font-size: 12px; font-variant-numeric: tabular-nums; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #nest-mock .tools button { min-width: 0; }
    #nest-mock .tools button span { font-size: 9px; letter-spacing: .04em; text-transform: uppercase; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #nest-mock .tools button kbd { position: absolute; top: 2px; left: 4px; font: 8px var(--font-mono); color: var(--ink-faint); }
    #nest-mock .tools button[aria-pressed="true"] kbd { color: var(--color-accent); }
    #nest-mock .link-state { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 10px; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-muted); min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    #nest-mock .link-state .dot { width: 7px; height: 7px; border-radius: 50%; border: 1px solid var(--color-accent); }
    #nest-mock .link-state.open { color: var(--ink); }
    #nest-mock .link-state.open .dot { background: var(--color-accent); }
    #nest-mock .note-link { margin-top: auto; padding-top: 6px; color: var(--ink-muted); font-size: 10px; text-decoration: none; border-top: 1px solid var(--color-line); }
    #nest-mock .note-link:hover { color: var(--ink); }
    #nest-mock .activity { margin: 0; padding: 0; list-style: none; min-height: 2.6em; font-size: 10px; color: var(--ink-muted); }
    #nest-mock .activity li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #nest-mock .activity li:first-child { color: var(--ink); }
    #nest-mock .activity li::before { content: "› "; color: var(--ink-faint); }
    @media (prefers-reduced-motion: reduce) { .nest-ant.walk .legs-a, .nest-ant.walk .legs-b, .nest-ant.wait svg, .nest-queen.bob, .nest-ant.swatted svg, .nest-splat { animation: none; } }`;
  document.head.append(style);

  // ================================ the switch ================================
  // A tiny dot ant in the status bar is the only trace of the game. Clicking it starts a colony and
  // the Nest takes over the whole sidebar; the ant again, or the × in the panel, asks before
  // clearing the colony and handing the sidebar back.
  const bar = document.querySelector(".status-bar");
  if (!bar) return; // a page without the desk chrome has nowhere to put the launcher
  const antBtn = document.createElement("button");
  antBtn.type = "button"; antBtn.className = "nest-switch"; antBtn.title = "Nest"; antBtn.setAttribute("aria-label", "Open the Nest");
  antBtn.setAttribute("aria-pressed", "false");
  antBtn.innerHTML = `<svg width="18" height="10" viewBox="0 0 22.4 12.8" fill="currentColor" aria-hidden="true">${[
    [0, 0], [1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [5, 3], [6, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [0, 4], [1, 4], [2, 4], [3, 4], [5, 4], [6, 4], [7, 4],
    [9, 4], [10, 4], [11, 4], [12, 4], [13, 4], [1, 5], [2, 5], [3, 5], [5, 5], [6, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [5, 2], [4, 1], [9, 2], [10, 1],
    [7, 6], [8, 7], [2, 6], [1, 7]].map(([x, y]) => `<circle cx="${x * 1.6 + 0.8}" cy="${y * 1.6 + 0.8}" r="0.72"/>`).join("")}</svg>`;
  if (bar.querySelector(".status-bar__xray")) bar.insertBefore(antBtn, bar.querySelector(".status-bar__xray")); else bar.append(antBtn);
  let game = null;

  // A stray ant is the easter egg for a closed Nest. It walks the reading pane on its own, not on
  // a trail, and if someone clicks it the ant runs for the launcher and makes it pulse. One click
  // marks the tab, so the random ant does not come back until a new tab.
  let strayTimer = null, strayEl = null, strayLeaving = false;
  const STRAY_KEY = "nest-stray-clicked";
  const strayConsumed = () => { try { return sessionStorage.getItem(STRAY_KEY) === "1"; } catch { return false; } };
  const consumeStray = () => { try { sessionStorage.setItem(STRAY_KEY, "1"); } catch { /* private mode */ } };
  const strayReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const launcherVisible = () => { const r = antBtn.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const cancelStray = () => {
    clearTimeout(strayTimer);
    strayLeaving = false;
    if (strayEl) { strayEl.remove(); strayEl = null; }
  };
  const scheduleStray = (delay) => {
    clearTimeout(strayTimer);
    if (game || document.hidden || !launcherVisible() || strayConsumed()) return;
    strayTimer = setTimeout(spawnStray, delay ?? 30000 + Math.random() * 60000);
  };
  const pulseLauncher = () => {
    antBtn.classList.add("nest-pulse");
    setTimeout(() => antBtn.classList.remove("nest-pulse"), 2400);
  };
  const runToLauncher = (el) => {
    if (!el || strayEl !== el) return;
    consumeStray();
    strayLeaving = true;
    const from = el.getBoundingClientRect(), to = antBtn.getBoundingClientRect();
    if (!to.width || strayReduced()) {
      el.remove(); strayEl = null; strayLeaving = false; pulseLauncher(); scheduleStray(180000 + Math.random() * 120000); return;
    }
    const tx = to.left + to.width / 2 - 11, ty = to.top + to.height / 2 - 6;
    el.style.position = "fixed"; el.style.margin = "0";
    el.style.left = from.left + "px"; el.style.top = from.top + "px";
    const t0 = performance.now(), dur = 900;
    const frame = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = k * k;
      el.style.left = from.left + (tx - from.left) * e + "px";
      el.style.top = from.top + (ty - from.top) * e - Math.sin(k * Math.PI) * 22 + "px";
      el.style.transform = `rotate(${Math.atan2(to.top - from.top, to.left - from.left) + Math.PI}rad) scale(${1 - k * 0.45})`;
      el.style.opacity = String(0.7 * (1 - k * 0.5));
      if (k < 1) requestAnimationFrame(frame);
      else { el.remove(); strayEl = null; strayLeaving = false; pulseLauncher(); scheduleStray(180000 + Math.random() * 120000); }
    };
    requestAnimationFrame(frame);
  };
  const spawnStray = (force = false) => {
    if (!force && (strayConsumed() || game || document.hidden || !launcherVisible() || strayEl)) return;
    if (force && (game || document.hidden || !launcherVisible() || strayEl)) return;
    if (getComputedStyle(main).position === "static") main.style.position = "relative";
    const fromLeft = Math.random() < 0.5;
    const y = main.scrollTop + Math.max(80, main.clientHeight * (0.25 + Math.random() * 0.45));
    const startX = fromLeft ? -24 : main.clientWidth + 24;
    const endX = fromLeft ? main.clientWidth + 30 : -30;
    const endY = y + (Math.random() - 0.5) * 140;
    const el = document.createElement("button");
    el.type = "button"; el.className = "nest-stray"; el.innerHTML = antBtn.innerHTML;
    el.setAttribute("aria-label", "A stray ant. Follow it to the Nest.");
    el.style.left = startX + "px"; el.style.top = y + "px";
    el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); runToLauncher(el); });
    main.append(el); strayEl = el; strayLeaving = false;
    const steps = 4 + Math.floor(Math.random() * 3), legs = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      legs.push([startX + (endX - startX) * t + (Math.random() - 0.5) * 24, y + (endY - y) * t + (Math.random() - 0.5) * 44]);
    }
    const walk = (i) => {
      if (!strayEl || game || strayLeaving) return;
      if (i >= legs.length) { el.remove(); strayEl = null; scheduleStray(120000 + Math.random() * 120000); return; }
      const [tx, ty] = legs[i], sx = parseFloat(el.style.left), sy = parseFloat(el.style.top);
      const dur = 1800 + Math.random() * 1800, t0 = performance.now();
      const frame = (now) => {
        if (!strayEl || game || strayLeaving) return;
        const k = Math.min(1, (now - t0) / dur), e = k * k * (3 - 2 * k);
        el.style.left = sx + (tx - sx) * e + Math.sin(k * 9) * 2 + "px";
        el.style.top = sy + (ty - sy) * e + Math.cos(k * 7) * 1.5 + "px";
        el.style.transform = `rotate(${Math.atan2(ty - sy, tx - sx) + Math.PI + Math.sin(k * 8) * 0.06}rad)`;
        if (k < 1) requestAnimationFrame(frame);
        else setTimeout(() => walk(i + 1), 300 + Math.random() * 900);
      };
      requestAnimationFrame(frame);
    };
    walk(0);
  };

  // The colony lives on the page. A refresh or a move to another page is a fresh start: no panel,
  // no saved colony, just the launcher. The one thing that survives is the tab's stray flag.
  try { localStorage.removeItem("nest-colony"); } catch { /* private mode */ }
  try { if (localStorage.getItem("portfolio:aside-mode") === "nest") localStorage.removeItem("portfolio:aside-mode"); } catch { /* private mode */ }
  const leave = () => game && game.confirmLeave(() => { game.stop(); game = null; antBtn.focus(); scheduleStray(); });
  const openNest = () => { game = start(); };
  antBtn.addEventListener("click", () => { if (game) leave(); else openNest(); });
  window.__nestLauncher = { open: () => { if (!game) openNest(); }, close: () => { if (game) leave(); } };
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelStray(); else scheduleStray(); });
  scheduleStray();
  window.__nestStray = { spawn: (force = false) => { cancelStray(); spawnStray(force); if (!strayEl) scheduleStray(); }, cancel: cancelStray };
  if (new URLSearchParams(location.search).has("nest-debug")) {
    window.__stray = { spawnStray, cancelStray, scheduleStray, pulseLauncher };
  }

  const start = () => {
  cancelStray();
  // ================================ the panel ================================
  antBtn.setAttribute("aria-pressed", "true"); antBtn.setAttribute("aria-label", "Close the Nest");
  const sidebarWasHidden = shell?.getAttribute("data-aside-hidden") === "true";
  shell?.removeAttribute("data-aside-hidden");
  const hidden = [...aside.children].filter((el) => el.style.display !== "none");
  hidden.forEach((el) => { el.dataset.nestDisplay = el.style.display; el.style.display = "none"; });
  const panel = document.createElement("div");
  panel.id = "nest-mock";
  panel.dataset.surface = "nest-controls";
  const icons = {
    squash: '<circle cx="12" cy="12" r="7"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5"/>',
    wipe: '<path d="m4 13 8-8a2 2 0 0 1 3 0l5 5a2 2 0 0 1 0 3l-7 7H9l-5-5a1.5 1.5 0 0 1 0-2Zm4-4 9 9m-4 2h8"/>',
    read: '<path d="m10 13 4-4m-5 6-1 1a3 3 0 0 1-4-4l4-4a3 3 0 0 1 4 0m3 1 1-1a3 3 0 0 1 4 4l-4 4a3 3 0 0 1-4 0"/>',
    bait: '<path d="m4 16 3-7 7-4 5 3 2 8-6 4-7-1zM9 13h.01m6-4h.01m1 6h.01"/>',
    cancel: '<path d="m6 6 12 12M18 6 6 18"/>',
    seal: '<path d="M2 19 8 9h8l6 10H2Zm7-10V6h6v3m-4 6h2"/>',
    muted: '<path d="M3 9h4l5-4v14l-5-4H3zM16 9l5 6m0-6-5 6"/>',
    sound: '<path d="M3 9h4l5-4v14l-5-4H3zm13 0a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/>',
    pause: '<path d="M9 5v14m6-14v14"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    restore: '<path d="M4 10a8 8 0 1 1 1 8m-1-8V4m0 6h6"/>',
  };
  const icon = (name) => `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
  const toolHelp = {
    squash: "Click or tap ants to squash them. Page links are locked.",
    wipe: "Drag across a dotted trail to scatter its ants. Page links are locked.",
    read: "Page links work again. The colony keeps running.",
  };
  const tool = (name, label, key) => `<button type="button" data-tool="${name}" aria-label="${label}" title="${toolHelp[name]}" aria-pressed="false">${icon(name)}<span>${label}</span><kbd>${key}</kbd></button>`;
  const action = (key, glyph, label, help) => `<button type="button" data-k="${key}" aria-label="${label}" title="${help}">${icon(glyph)}</button>`;
  panel.innerHTML = `
    <div class="head"><span class="lbl muted"><span>nest · colony 01</span></span><span class="lbl muted"><span data-k="status">waking</span></span>
      <button class="x" data-k="x" type="button" aria-label="Close the Nest" title="Close">×</button></div>
    <div class="well"><pre class="nest-pre" role="img" aria-label="Side view of the ant nest"></pre></div>
    <ul class="log activity" data-k="log" aria-live="polite"></ul>
    <div class="nest-meters">
      <div class="nest-meter"><span class="lbl muted">page holds</span><span class="lbl" data-k="holds-val">100%</span>
        <div class="nest-meter__bar accent" data-k="holds-bar" role="progressbar" aria-label="Page holds" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><span data-k="holds"></span></div></div>
      <div class="nest-meter"><span class="lbl muted">stores</span><span class="lbl" data-k="stores-val">0/12</span>
        <div class="nest-meter__bar accent" data-k="stores-bar" role="progressbar" aria-label="Stores" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span data-k="stores"></span></div></div>
      <div class="nest-meter"><span class="lbl muted">next egg</span><span class="lbl" data-k="bar-val">0/3</span>
        <div class="nest-meter__bar accent" data-k="bar-bar" role="progressbar" aria-label="Next egg" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span data-k="bar"></span></div></div>
    </div>
    <dl class="stat-grid">
      <div><dt>scouts</dt><dd class="accent" data-k="scouts">0</dd></div>
      <div><dt>workers</dt><dd data-k="workers">0</dd></div>
      <div><dt>soldiers</dt><dd data-k="soldiers">0</dd></div>
      <div><dt>reserve</dt><dd class="accent" data-k="reserve">2</dd></div>
      <div><dt>hills</dt><dd class="accent" data-k="minis">0</dd></div>
      <div><dt>flyers</dt><dd data-k="flyers">0</dd></div>
      <div><dt>trails</dt><dd data-k="trails">0</dd></div>
      <div><dt>squashed</dt><dd data-k="squashed">0</dd></div>
      <div><dt>larder</dt><dd class="accent" data-k="larder" style="grid-column: span 3; text-align: left">empty</dd></div>
    </dl>
    <div class="row tools" role="group" aria-label="Page tools">
      ${tool("squash", "Squash", "1")}${tool("wipe", "Wipe", "2")}${tool("read", "Links", "3")}
    </div>
    <p class="link-state" data-k="link-state" aria-live="polite"><span class="dot"></span><span data-k="link-text">links locked</span></p>
    <div class="row tools" role="group" aria-label="Colony controls">
      ${action("bait", "bait", "Drop bait", "Place a crumb to lure nearby ants away.")}
      ${action("seal", "seal", "Seal hills", "Seal every anthill for a few seconds.")}
      ${action("sound", "muted", "Unmute", "Turn on colony sounds.")}
      ${action("pause", "pause", "Pause", "Pause the colony.")}
      ${action("restore", "restore", "Restore page", "Put stolen letters back while the colony keeps running.")}
    </div>
    <p class="muted tool-help" data-k="tool-help" aria-live="polite"></p>
    <a class="note-link" href="/notes/the-site-has-ants" target="_blank" rel="noopener">the colony, explained ↗</a>

    <div class="confirm" data-k="confirm" role="alertdialog" aria-labelledby="nest-confirm-title" hidden>
      <p id="nest-confirm-title"><b>Close the Nest?</b></p>
      <p class="muted">The colony is cleared and every stolen letter goes back where it was.</p>
      <div class="row"><button data-k="leave">clear and close</button><button data-k="stay" class="muted">keep playing</button></div>
    </div>`;
  aside.append(panel);
  const $ = (k) => panel.querySelector(`[data-k="${k}"]`);
  const setAction = (key, glyph, label, help) => {
    const button = $(key);
    button.innerHTML = icon(glyph);
    button.setAttribute("aria-label", label);
    button.title = help;
  };
  const pre = panel.querySelector(".nest-pre");
  const well = panel.querySelector(".well");
  const log = (msg) => { const li = document.createElement("li"); li.textContent = msg; $("log").prepend(li); while ($("log").children.length > 3) $("log").lastChild.remove(); };

  // ================================ the nest ================================
  // Routes in nest units (0..1 across, 0..1 down). Ants and eggs hold a route and a distance along
  // it, so the nest can be redrawn at any size without losing anyone. The entrance is the mound.
  const SURFACE = 0.16, MOUND = 0.075;
  const ROUTES = {
    down:  [[0.5, SURFACE - MOUND * 0.55], [0.5, 0.3], [0.73, 0.44], [0.8, 0.6]],            // anthill to larder
    feed:  [[0.8, 0.6], [0.68, 0.77], [0.58, 0.87]],                                         // larder to the queen
    up:    [[0.58, 0.87], [0.38, 0.74], [0.32, 0.47], [0.5, 0.3], [0.5, SURFACE - MOUND * 0.55]], // queen back out
    lay:   [[0.42, 0.89], [0.38, 0.74], [0.3, 0.51], [0.2, 0.54]],                           // egg to the nursery
    hatch: [[0.2, 0.54], [0.32, 0.47], [0.5, 0.3], [0.5, SURFACE - MOUND * 0.55]],            // newborn to the anthill
  };
  const routeLen = (r) => r.slice(1).reduce((s, p, k) => s + Math.hypot(p[0] - r[k][0], p[1] - r[k][1]), 0);
  const LEN = Object.fromEntries(Object.entries(ROUTES).map(([k, r]) => [k, routeLen(r)]));
  const along = (name, d) => {
    const r = ROUTES[name];
    for (let k = 0; k < r.length - 1; k++) {
      const seg = Math.hypot(r[k + 1][0] - r[k][0], r[k + 1][1] - r[k][1]);
      if (d <= seg) return [r[k][0] + (r[k + 1][0] - r[k][0]) * d / seg, r[k][1] + (r[k + 1][1] - r[k][1]) * d / seg, Math.atan2(r[k + 1][1] - r[k][1], r[k + 1][0] - r[k][0])];
      d -= seg;
    }
    const e = r[r.length - 1]; return [e[0], e[1], -Math.PI / 2];
  };
  const NURSERY = [0.2, 0.54], LARDER = [0.8, 0.61], QUEEN = [0.5, 0.89], STORES = [[0.13, 0.76], [0.87, 0.8]];

  const bit = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];
  let W = 0, H = 0, R = 0, base = null;
  const buildNest = () => {
    const probe = document.createElement("span"); probe.textContent = "⣿".repeat(20); pre.textContent = ""; pre.append(probe);
    const pr = probe.getBoundingClientRect(); probe.remove();
    const cellW = pr.width / 20, cellH = pr.height;
    if (!cellW || !cellH || !well.clientHeight) return;
    W = Math.floor(well.clientWidth / cellW) * 2; H = Math.floor(well.clientHeight / cellH) * 4;
    R = Math.max(4, W / 7);
    base = new Int8Array(W * H).fill(-1);
    const set = (x, y, t) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < W && y < H) base[y * W + x] = t; };
    const clear = (x, y) => set(x, y, -1);
    let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const sky = Math.round(H * SURFACE);
    // soil below the surface, in two tones
    for (let y = sky + 2; y < H; y++) for (let x = 0; x < W; x++) if ((x + 2 * y) % 4 === 0 || rnd() < 0.05) set(x, y, y < H * 0.36 ? 1 : 0);
    // the anthill: a dome of packed dots on the surface, the entrance a gap at its crown
    const mx = W * 0.5, mw = W * 0.24, mh = H * MOUND;
    for (let y = sky - mh; y <= sky + 1; y++) for (let x = mx - mw; x <= mx + mw; x++) {
      const u = (x - mx) / mw, top = sky - mh * (1 - u * u);
      if (y >= top && ((x + y) % 2 === 0 || y < top + 1.5)) set(x, y, 1);
    }
    // grass either side of the mound
    for (let x = 0; x < W; x++) { if (Math.abs(x - mx) < mw) continue; set(x, sky + Math.round(Math.sin(x / 5) * 0.6), 2); if (x % 3 === 0) set(x, sky - 2 + (x % 2), 2); }
    const carve = (cx, cy, rx, ry) => { for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) if ((i * i) / (rx * rx) + (j * j) / (ry * ry) <= 1) clear(cx + i, cy + j); };
    Object.values(ROUTES).forEach((r) => { for (let k = 0; k < r.length - 1; k++) for (let s = 0; s <= 50; s++) carve((r[k][0] + (r[k + 1][0] - r[k][0]) * s / 50) * W, (r[k][1] + (r[k + 1][1] - r[k][1]) * s / 50) * H, 2, 2); });
    carve(mx, sky - mh + 1, 2, 2);
    carve(NURSERY[0] * W, NURSERY[1] * H, R * 0.85, R * 0.45);
    carve(LARDER[0] * W, LARDER[1] * H, R * 0.85, R * 0.45);
    // the two storerooms, joined to the tunnels by short side passages
    STORES.forEach(([u, v], k) => { const [tu, tv] = k ? [0.68, 0.77] : [0.36, 0.72]; for (let s2 = 0; s2 <= 30; s2++) carve((u + (tu - u) * s2 / 30) * W, (v + (tv - v) * s2 / 30) * H, 1.5, 1.5); carve(u * W, v * H, R * 0.7, R * 0.42); });
    carve(QUEEN[0] * W, QUEEN[1] * H, R * 1.4, R * 0.7);
  };
  new ResizeObserver(buildNest).observe(well);

  // ================================ the page ================================
  const state = { ants: [], eggs: [], trails: [], larder: [], stolen: new Set(), squashed: 0, meals: 0, paused: false,
    reserve: 2, over: false, stores: 0, built: 0, feedFlip: false, peak: 0, stolenTotal: 0, sound: false,
    queen: { eat: 0, lay: 0 }, total: 0, party: null, partyIndex: 0, nextParty: TUNING.party[0], trailSerial: 0 };
  if (getComputedStyle(main).position === "static") main.style.position = "relative";
  const layer = document.createElement("div"); layer.className = "nest-layer"; main.append(layer);
  // the layer covers the page exactly and clips what crosses its edge, so nothing scrolls sideways
  const fitLayer = () => { layer.style.height = "0"; layer.style.height = main.scrollHeight + "px"; };
  fitLayer(); new ResizeObserver(fitLayer).observe(main);
  const scent = document.createElementNS("http://www.w3.org/2000/svg", "svg"); scent.classList.add("nest-scent"); layer.append(scent);
  const local = (r) => { const m = main.getBoundingClientRect(); return [r.left - m.left + main.scrollLeft, r.top - m.top + main.scrollTop]; };

  // A trail should look walked, not sampled. Chaikin keeps the two ends and rounds every corner.
  const chaikin = (pts, passes = 2) => {
    let out = pts.map((p) => p.slice());
    for (let n = 0; n < passes && out.length > 2; n++) {
      const next = [out[0]];
      for (let i = 0; i < out.length - 1; i++) {
        const a = out[i], b = out[i + 1];
        next.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
        next.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
      }
      next.push(out[out.length - 1]);
      out = next;
    }
    return out;
  };
  // Two lanes, one out and one back. Without it every ant walks the same three pixels and the
  // line reads as a pile the moment it turns.
  const lanePath = (pts, offset) => pts.map((p, i) => {
    if (!offset) return p.slice();
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
    return [p[0] - (dy / d) * offset, p[1] + (dx / d) * offset];
  });


  // ---- letters
  const byNode = new WeakMap();
  const letterOf = (n, i) => { let m = byNode.get(n); if (!m) byNode.set(n, (m = new Map())); let L = m.get(i); if (!L) m.set(i, (L = { n, i, ch: n.data[i], state: "free", crew: [], need: 1 })); return L; };
  const textNodes = (root) => {
    const out = []; const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (layer.contains(n) || !n.parentElement || !n.parentElement.offsetParent || /^(SCRIPT|STYLE|PRE|CODE|BUTTON)$/.test(n.parentElement.tagName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    for (let n; (n = walk.nextNode());) out.push(n);
    return out;
  };
  const rectOf = (n, i) => { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1); return r.getBoundingClientRect(); };
  const onScreen = (r) => { const m = main.getBoundingClientRect(); return r.width > 0 && r.top > m.top + 10 && r.bottom < m.bottom - 10; };
  const pageLetters = textNodes(main).reduce((s, n) => s + (n.data.match(/\S/g) || []).length, 0);
  // A taken letter is hidden where it stands, never removed, so the words around it do not move.
  // Its character is split into its own span; letters after it in the same text node move to the
  // new node, and their records move with them.
  const hideChar = (L) => {
    if (!L.span) {
      const n = L.n, i = L.i, old = byNode.get(n) || new Map();
      const mid = i > 0 ? n.splitText(i) : n;
      if (mid.data.length > 1) {
        const after = mid.splitText(1), moved = new Map();
        old.forEach((rec, k) => { if (k > i) { rec.n = after; rec.i = k - i - 1; moved.set(rec.i, rec); old.delete(k); } });
        byNode.set(after, moved);
      }
      old.delete(i);
      const span = document.createElement("span"); span.className = "nest-gap";
      mid.replaceWith(span); span.append(mid);
      L.n = mid; L.i = 0; L.span = span; byNode.set(mid, new Map([[0, L]]));
    }
    L.span.style.visibility = "hidden";
  };
  const showChar = (L) => { if (L.span) L.span.style.visibility = ""; };
  const blockOf = (n) => n.parentElement.closest("p, h1, h2, h3, h4, li, dd, blockquote, figcaption, a") || n.parentElement;
  const needOf = (n) => { const fs = parseFloat(getComputedStyle(n.parentElement).fontSize); return fs >= 28 ? 3 : fs >= 20 ? 2 : 1; };

  // The anthill on the page: the same dome, drawn in Braille, its entrance at the crown.
  const hill = document.createElement("div"); hill.className = "nest-hill"; hill.setAttribute("aria-hidden", "true");
  {
    const w = 44, h = 16, cells = new Int8Array(w * h).fill(-1); let seed = 3; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = (x - w / 2) / (w / 2), top = h * (u * u) * 0.95; if (y >= top && ((x + y) % 2 === 0 || y < top + 1.2 || rnd() < 0.2)) cells[y * w + x] = y > h - 3 ? 1 : 0; }
    for (let y = 0; y < 4; y++) for (let x = w / 2 - 3; x < w / 2 + 3; x++) cells[y * w + x] = -1;
    let out = "";
    for (let cy = 0; cy < h; cy += 4) { for (let cx = 0; cx < w; cx += 2) { let code = 0, t = -1; for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) { const v = cells[(cy + dy) * w + cx + dx]; if (v >= 0) { code |= bit[dy][dx]; t = Math.max(t, v); } } const ch = String.fromCharCode(0x2800 + code); out += t === 1 ? `<b>${ch}</b>` : ch; } out += "\n"; }
    hill.innerHTML = out.trimEnd();
  }
  layer.append(hill);
  const hr = hill.getBoundingClientRect();
  hill.classList.add("nest-hill-live");
  // Where the hill goes: an empty patch of the visible page that the whole mound fits in, as far
  // from any text as the page allows. Among the roomiest spots one is picked at random.
  const minis = [];
  const findHomeSpot = () => {
    const rects = [];
    for (const n of textNodes(main)) { if (!/\S/.test(n.data)) continue; const r = document.createRange(); r.selectNodeContents(n); for (const c of r.getClientRects()) { const [x, y] = local(c); rects.push([x, y, x + c.width, y + c.height]); } }
    main.querySelectorAll("img, svg, button, input, textarea, figure, hr").forEach((el) => { if (layer.contains(el)) return; const c = el.getBoundingClientRect(); if (c.width) { const [x, y] = local(c); rects.push([x, y, x + c.width, y + c.height]); } });
    const w = hr.width, h = hr.height, pad = 14;
    const collect = (top, bottom) => {
      const spots = [];
      for (let y = Math.max(h + 10, top + h + 26); y < Math.min(main.scrollHeight - 20, bottom - 8); y += 18) for (let x = w / 2 + 20; x < main.clientWidth - w / 2 - 20; x += 18) {
        const box = [x - w / 2 - pad, y - h - pad, x + w / 2 + pad, y + pad];
        let near = Infinity;
        for (const r of rects) {
          const dx = Math.max(r[0] - box[2], box[0] - r[2], 0), dy = Math.max(r[1] - box[3], box[1] - r[3], 0);
          near = Math.min(near, Math.hypot(dx, dy)); if (!near) break;
        }
        if (near > 0) spots.push([x, y, near]);
      }
      return spots;
    };
    // The hill opens where the player already is. Ants may work the whole page afterwards, but
    // the front door never makes someone scroll to find it.
    let spots = collect(main.scrollTop, main.scrollTop + main.clientHeight);
    if (!spots.length) spots = collect(0, main.scrollHeight);
    if (!spots.length) return [main.clientWidth * 0.85, main.scrollTop + main.clientHeight * 0.8];
    const best = Math.max(...spots.map((p) => Math.min(p[2], 160)));
    const roomy = spots.filter((p) => Math.min(p[2], 160) >= best * 0.8);
    return roomy[Math.floor(Math.random() * roomy.length)];
  };
  // Each hill is a mound on the page with its own entrance. A long press seals it for a while.
  const SEAL = 8, SEAL_COOL = 20;
  const hills = [];
  const makeHill = (homeBase) => {
    const el = hill.cloneNode(true); el.style.left = homeBase[0] - hr.width / 2 + "px"; el.style.top = homeBase[1] - hr.height + "px";
    el.setAttribute("aria-label", "Anthill. Hold to seal.");
    const h = { el, base: homeBase, hole: [homeBase[0], homeBase[1] - hr.height + 4], sealed: 0, cool: 0 };
    let timer = null;
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); el.classList.add("pressing"); timer = setTimeout(() => seal(h), 650); });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => el.addEventListener(ev, () => { clearTimeout(timer); el.classList.remove("pressing"); }));
    layer.append(el); hills.push(h); return h;
  };
  const seal = (h) => {
    const now = performance.now() / 1000;
    if (h.cool > now) { log(`the hill can be sealed again in ${Math.ceil(h.cool - now)}s`); return; }
    h.sealed = now + SEAL; h.cool = now + SEAL_COOL; h.el.classList.add("sealed"); blip(180, 0.18, "square"); noiseBurst(0.15, 0.05, 400);
    log("you sealed the anthill");
    setTimeout(() => { h.el.classList.remove("sealed"); log("the anthill is open again"); }, SEAL * 1000);
  };
  const isSealed = (h) => h.sealed > performance.now() / 1000;
  hill.remove();
  const firstSpot = findHomeSpot();
  const home = makeHill(firstSpot);
  const hillOf = (ant) => ant.trail?.hill || ant.hill || home;

  // A little ground around the mound: Braille glyphs for grass, stones, a leaf and a mushroom,
  // the same alphabet as the hill and the sidebar nest. The old SVG strokes read as scribbles.
  const brailleDecor = (text, left, top) => {
    const decor = document.createElement("pre");
    decor.className = "nest-decor"; decor.setAttribute("aria-hidden", "true");
    decor.textContent = text;
    decor.style.left = left + "px"; decor.style.top = top + "px";
    layer.append(decor);
    return decor;
  };
  const decorate = (h) => {
    let seed = Math.max(1, Math.round(h.base[0] * 7 + h.base[1] * 13));
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const leaf = rnd() > 0.35;
    const lines = [
      "⠁⠂  " + (leaf ? "⠢⠔" : "⠒⠲"),
      "⠉⠊  " + (leaf ? "⠪⠕" : "⠶⠦"),
      "⣀⣀⣀⣀⣀⣀⣀⣀",
    ];
    h.decor = brailleDecor(lines.join("\n"), h.base[0] - 42, h.base[1] - 10);
  };
  decorate(home);

  // A trail feeds from a patch, the letters within PATCH pixels of where its scout found food, so
  // the ants on it visibly work one small area of the page.
  const PATCH = 70;
  const inPatch = (r, c) => Math.hypot(r.left + r.width / 2 - (c[0] - main.scrollLeft + main.getBoundingClientRect().left), r.top + r.height / 2 - (c[1] - main.scrollTop + main.getBoundingClientRect().top)) <= PATCH;
  const freeIn = (block, center) => {
    const found = [];
    for (const n of textNodes(block)) for (let i = 0; i < n.data.length; i++) {
      if (!/\S/.test(n.data[i])) continue;
      const L = letterOf(n, i); L.ch = n.data[i];
      if (L.state === "free" || (L.state === "gather" && L.crew.length < L.need)) {
        const r = rectOf(n, i); if (center && !inPatch(r, center)) continue;
        const [x, y] = local(r); found.push({ L, x: x + r.width / 2, y: y + r.height, r });
      }
    }
    // no reading order: any free letter in the block, though a crew still gathering comes first
    for (let k = found.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [found[k], found[j]] = [found[j], found[k]]; }
    found.sort((a, b) => (b.L.state === "gather") - (a.L.state === "gather"));
    return found;
  };

  // A carried letter is a copy of the glyph in the original's own style: colour, face, size,
  // weight, case, and the underline of whichever ancestor draws one.
  const lookOf = (el) => {
    const cs = getComputedStyle(el);
    let deco = "none", off = "auto";
    for (let p = el; p && p !== main; p = p.parentElement) { const pc = getComputedStyle(p); if (pc.textDecorationLine !== "none") { deco = pc.textDecoration; off = pc.textUnderlineOffset; break; } }
    return `color:${cs.color};font-family:${cs.fontFamily};font-size:${cs.fontSize};font-weight:${cs.fontWeight};font-style:${cs.fontStyle};` +
      `text-transform:${cs.textTransform};letter-spacing:${cs.letterSpacing};text-decoration:${deco};text-underline-offset:${off};-webkit-text-stroke:${cs.webkitTextStroke || "0"}`;
  };

  // ---- ants
  const LEGS_A = [[5, 2], [4, 1], [9, 2], [10, 1], [7, 6], [8, 7], [2, 6], [1, 7]];
  const LEGS_B = [[7, 2], [8, 1], [3, 2], [2, 1], [5, 6], [4, 7], [10, 6], [11, 7]];
  const BODY = ["", "", "", ".xxx.xx.xxxxx.", "xxxx.xxx.xxxxx", ".xxx.xx.xxxxx."].flatMap((row, y) => [...row].map((k, x) => k === "x" ? [x, y] : null).filter(Boolean)).concat([[0, 0], [1, 1], [1, 2]]);
  const dots = (pts) => pts.map(([x, y]) => `<circle cx="${x * 1.6 + 0.8}" cy="${y * 1.6 + 0.8}" r="0.72"/>`).join("");
  const ANT_SVG = `<svg width="23" height="13" viewBox="0 0 22.4 12.8" fill="currentColor" aria-hidden="true">${dots(BODY)}<g class="legs-a">${dots(LEGS_A)}</g><g class="legs-b">${dots(LEGS_B)}</g></svg>`;
  // The soldier is the same animal with a wider head and two mandibles, in the flyer's quieter
  // colour. At a glance it should not read as another worker.
  const SOLDIER_SVG = `<svg width="23" height="13" viewBox="-2.4 0 24.8 12.8" fill="currentColor" aria-hidden="true">${dots(BODY)}${dots([[-1, 4], [-1.5, 3], [-1.5, 5], [-1, 2], [-1, 6]])}<g class="legs-a">${dots(LEGS_A)}</g><g class="legs-b">${dots(LEGS_B)}</g></svg>`;

  const newAnt = (role, route, d) => { state.total++; const a = { id: state.total, role, where: "nest", route, d }; state.ants.push(a); return a; };
  const scoutsOut = () => state.ants.some((a) => a.role === "scout");
  // Workers leaving the nest take the ready trails in turn, skipping any that are full or worked
  // out, so every trail fills at the same pace and a finished trail's ants move to the others.
  const openTrail = () => {
    const ready = state.trails.filter((t) => t.ready && t.state !== "gone" && t.ants.size < LINE && remaining(t));
    if (!ready.length) return null;
    state.rr = ((state.rr || 0) + 1) % ready.length;
    return ready[state.rr];
  };
  const join = (ant, t) => {
    if (ant.trail && ant.trail !== t) ant.trail.ants.delete(ant);
    ant.trail = t;
    ant.lane = (ant.id % 2 ? 1 : -1) * 3.2;
    t.ants.add(ant);
  };
  const leaveTrail = (ant) => {
    const t = ant.trail; if (!t) return;
    t.ants.delete(ant); ant.trail = null;
    if (!t.ants.size && !remaining(t)) retire(t);
  };
  // A spent trail leaves slowly and sends somebody out to find the next patch, so the colony
  // never sits still waiting for a worker to notice there is nothing left to do.
  const retire = (t) => {
    if (!t || t.state === "gone") return;
    t.state = "gone"; t.ready = false;
    t.line.style.opacity = "0"; t.halo.style.opacity = "0";
    t.hit?.remove();
    setTimeout(() => { t.line.remove(); t.halo.remove(); }, TUNING.trailFade);
    state.trails = state.trails.filter((x) => x !== t);
    t.ants.forEach((a) => { if (a.trail === t) a.trail = null; });
    spawnSuccessor();
  };
  const spawnSuccessor = () => {
    if (state.over || state.overrun || state.queenDead) return;
    if (state.ants.some((a) => a.role === "scout")) return;
    const pick = state.ants.find((a) => a.role === "worker" && a.job !== "carry" && a.job !== "crew" && a.job !== "dance");
    if (pick) {
      const held = pick.letter;
      if (held?.state === "gather") {
        held.crew = held.crew.filter((a) => a !== pick);
        if (!held.crew.length) held.state = "free";
      }
      pick.letter = null;
      pick.role = "scout";
      if (pick.where === "page") { pick.job = "home"; pick.path = [hillOf(pick).hole.slice()]; pick.k = 0; }
      label(pick);
      log("a trail fades; a worker turns scout");
      return;
    }
    if (!state.ants.some((a) => a.role === "scout")) {
      const a = newAnt("scout", "hatch", 0); label(a);
      log("a trail fades; a scout hatches");
    }
  };

  // A worker at the top of the tunnel decides whether to go out: follow a trail with room on it,
  // scout if nobody is scouting, or wait in the tunnel.
  const atEntrance = (ant) => {
    if (state.over || hills.every(isSealed)) { ant.d = LEN[ant.route] - 0.01 - 0.025 * waitingRank(ant); return; } // nowhere to go out
    if (ant.role === "scout") return emerge(ant);
    if (ant.role === "soldier") {
      const ready = state.trails.filter((t) => t.ready && t.state !== "gone");
      if (ready.length) { ant.patrol = ready[Math.floor(Math.random() * ready.length)]; return emerge(ant); }
      ant.d = LEN[ant.route] - 0.01 - 0.025 * waitingRank(ant); return;
    }
    const t = openTrail(ant);
    if (t) { join(ant, t); return emerge(ant); }
    if (ant.trail) { ant.trail.ants.delete(ant); ant.trail = null; }
    if (!scoutsOut()) { ant.role = "scout"; log("a worker turned scout"); return emerge(ant); }
    ant.d = LEN[ant.route] - 0.01 - 0.025 * waitingRank(ant); // queue in the tunnel
  };
  const waitingRank = (ant) => state.ants.filter((a) => a.where === "nest" && a.route === "up" && a.d > LEN.up - 0.3 && a.id < ant.id).length;

  const emerge = (ant) => {
    const open = hills.filter((h) => !isSealed(h)); ant.hill = open[Math.floor(Math.random() * open.length)] || home;
    const hole = ant.hill.hole;
    ant.where = "page"; ant.x = hole[0]; ant.y = hole[1]; ant.heading = -Math.PI / 2; ant.px = ant.x; ant.py = ant.y;
    ant.el = document.createElement("button"); ant.el.type = "button";
    ant.el.className = "nest-ant walk"; ant.el.innerHTML = ant.role === "soldier" ? SOLDIER_SVG : ANT_SVG;
    ant.el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); squash(ant); });
    layer.append(ant.el);
    if (ant.role === "scout") scout(ant);
    else if (ant.role === "soldier") { ant.job = "patrol"; ant.path = lanePath(ant.patrol.pts, ant.lane || 0); ant.k = 0; ant.hp = ant.hp || 2; }
    else if (ant.trail && ant.trail.state !== "gone") { ant.job = "follow"; ant.path = lanePath(ant.trail.pts, ant.lane || 0); ant.k = 0; }
    else { ant.job = "home"; ant.path = [hole.slice()]; ant.k = 0; }
    label(ant);
  };
  const label = (ant) => { if (!ant.el) return; ant.el.inert = state.tool === "wipe"; ant.el.classList.toggle("scout", ant.role === "scout"); ant.el.classList.toggle("soldier", ant.role === "soldier" || ant.role === "guard"); ant.el.classList.toggle("builder", ant.role === "builder"); ant.el.setAttribute("aria-label", `${{ scout: "Scout", soldier: "Soldier", worker: "Worker", guard: "Guard", flyer: "Flying", builder: "Builder" }[ant.role]} ant. Press to squash.`); };

  // A scout wanders: loose waypoints toward a block of text no trail reaches yet, its steps recorded.
  const remaining = (t) => {
    if (!t || t.state === "gone") return false;
    if (t.ttl && performance.now() / 1000 > t.ttl) return false;
    for (const n of textNodes(t.block)) for (let i = 0; i < n.data.length; i++) {
      if (!/\S/.test(n.data[i])) continue;
      const L = letterOf(n, i); if (L.state === "stolen") continue;
      if (inPatch(rectOf(n, i), t.end)) return true;
    }
    return false;
  };

  const scout = (ant) => {
    const hole = hillOf(ant).hole;
    const opening = state.stolenTotal === 0 && state.meals === 0 && state.trails.length === 0;
    const options = [];
    for (const n of textNodes(main)) for (let i = 0; i < n.data.length; i += 3) {
      if (!/\S/.test(n.data[i]) || letterOf(n, i).state !== "free") continue;
      const r = rectOf(n, i); if (!r.width) continue;
      const [x, y] = local(r);
      if (opening && (!onScreen(r) || Math.hypot(x - hole[0], y - hole[1]) > TUNING.firstScoutRange)) continue;
      if (state.trails.some((t) => Math.hypot(t.end[0] - x, t.end[1] - y) < PATCH * 2)) continue;
      options.push([n, x + r.width / 2, y + r.height]);
    }
    if (!options.length) {
      // The opening hint can miss on a page with a wide empty margin. Fall back to any free
      // letter on the page before turning the scout around, or the colony can loop forever.
      for (const n of textNodes(main)) for (let i = 0; i < n.data.length; i += 3) {
        if (!/\S/.test(n.data[i]) || letterOf(n, i).state !== "free") continue;
        const r = rectOf(n, i); if (!r.width) continue;
        const [x, y] = local(r);
        options.push([n, x + r.width / 2, y + r.height]);
      }
    }
    if (!options.length) { ant.role = "worker"; ant.job = "home"; ant.path = [hole.slice()]; ant.k = 0; return; }
    const pick = opening
      ? options.reduce((best, o) => (Math.hypot(o[1] - hole[0], o[2] - hole[1]) < Math.hypot(best[1] - hole[0], best[2] - hole[1]) ? o : best), options[0])
      : options[Math.floor(Math.random() * options.length)];
    const [node, tx, ty] = pick;
    const block = blockOf(node);
    // One gentle bend, then a smoothed route. The old four random jitters made the trail look
    // like it had been drawn while running.
    const dx = tx - hole[0], dy = ty - hole[1], dist = Math.hypot(dx, dy) || 1;
    const nx = -dy / dist, ny = dx / dist;
    const amp = Math.min(44, Math.max(10, dist * 0.22) * (0.8 + Math.random() * 0.4));
    const path = [];
    for (let s = 0; s <= 28; s++) {
      const k = s / 28;
      const bow = Math.sin(Math.PI * k) * amp;
      path.push([hole[0] + dx * k + nx * bow, hole[1] + dy * k + ny * bow]);
    }
    ant.job = "scout"; ant.block = block; ant.path = chaikin(path, 1); ant.k = 0; ant.walked = [hole.slice()];
  };

  const backPath = (ant) => (ant.trail ? lanePath(ant.trail.pts.toReversed(), -(ant.lane || 0)) : []).concat([hillOf(ant).hole.slice()]);
  const goHome = (ant) => { ant.job = "home"; ant.path = backPath(ant); ant.k = 0; ant.letter = null; ant.el?.classList.remove("wait"); };

  const toLetter = (ant, block, light) => {
    if (!block) return goHome(ant);
    const all = freeIn(block, ant.trail ? ant.trail.end : [ant.x, ant.y]);
    // a scout alone takes a letter it can lift alone, when the patch has one
    const pick = (light && all.find((f) => f.L.state === "free" && needOf(f.L.n) === 1)) || all[0];
    if (!pick) return goHome(ant);
    const L = pick.L;
    if (L.state === "free") { L.need = needOf(L.n); L.state = "gather"; L.crew = []; }
    // a scout that finds only heavy letters cannot carry one home alone, so it opens the trail to call help
    if (light && L.need > 1 && ant.trail && !ant.trail.ready) {
      ant.trail.ready = true;
      ant.trail.line.classList.remove("scouting"); ant.trail.halo.classList.remove("scouting");
      if (ant.trail.hit && !ant.trail.hit.isConnected) scent.append(ant.trail.hit);
      log(`a big “${L.ch}”; the scout calls for help`); chord([349, 440], 0.16, 0.025);
    }
    L.crew.push(ant); ant.letter = L; ant.job = "toLetter";
    const k = L.crew.length - 1, spread = (k - (L.need - 1) / 2) * 12;
    ant.path = [[pick.x + spread, pick.y + 7]]; ant.k = 0;
  };

  const lift = (L) => {
    const r = rectOf(L.n, L.i); const [x, y] = local(r);
    const glyph = document.createElement("span"); glyph.className = "nest-letter"; glyph.textContent = L.ch;
    glyph.style.cssText += lookOf(L.n.parentElement); glyph.style.left = x + "px"; glyph.style.top = y + "px";
    layer.append(glyph);
    L.home = [x, y]; L.glyph = glyph; L.state = "carried";
    hideChar(L);
    blip(520, 0.05, "sine", 0.03);
    const leader = L.crew[0];
    leader.cx = L.crew.reduce((s, a) => s + a.x, 0) / L.crew.length; leader.cy = L.crew.reduce((s, a) => s + a.y, 0) / L.crew.length;
    L.crew.forEach((a, k) => { a.job = k ? "crew" : "carry"; a.lead = leader; a.slot = k; a.el.classList.remove("wait"); a.el.classList.add("lift"); setTimeout(() => a.el?.classList.remove("lift"), 400); });
    leader.path = backPath(leader); leader.k = 0;
  };

  // The letter drifts home on a slow, gentle arc, then becomes text again.
  const returningLetters = new Map();
  const finishReturn = (letter) => {
    returningLetters.delete(letter);
    showChar(letter); letter.glyph.remove(); letter.glyph = null; letter.state = "free"; letter.crew = [];
  };
  const drop = (L) => {
    if (!L || L.state !== "carried") return;
    L.state = "returning";
    const g = L.glyph, sx = parseFloat(g.style.left), sy = parseFloat(g.style.top), [ex, ey] = L.home;
    const arc = Math.min(60, 20 + Math.hypot(ex - sx, ey - sy) * 0.15);
    const frames = [0, 0.25, 0.5, 0.75, 1].map((t) => ({ left: sx + (ex - sx) * t + "px", top: sy + (ey - sy) * t - Math.sin(t * Math.PI) * arc + "px", transform: `rotate(${(1 - t) * 6 * Math.sin(t * 9)}deg)` }));
    const animation = g.animate(frames, { duration: 3800, easing: "cubic-bezier(.45,.05,.35,1)" });
    returningLetters.set(L, animation);
    animation.addEventListener("finish", () => { if (returningLetters.has(L)) finishReturn(L); }, { once: true });
    L.crew.forEach((a) => { if (a.el) goHome(a); });
  };

  const squash = (ant) => {
    if (state.tool !== "squash" || state.over || state.overrun || ant.dead) return;
    if ((ant.role === "soldier" || ant.role === "guard") && ant.hp > 1) {
      ant.hp--; ant.el?.classList.add("hit"); setTimeout(() => ant.el?.classList.remove("hit"), 250);
      blip(300, 0.06, "square"); noiseBurst(0.04, 0.03, 2200); return;
    }
    ant.dead = true;
    blip(140 + Math.random() * 40, 0.09, "triangle");
    noiseBurst(0.05, 0.05, 900);
    const L = ant.letter;
    if (L && L.state === "carried") drop(L);
    else if (L) { L.crew = L.crew.filter((a) => a !== ant); if (!L.crew.length) L.state = "free"; }
    const mark = document.createElement("div"); mark.className = "nest-squash"; mark.textContent = "⠪⠕";
    mark.style.left = ant.px - 8 + "px"; mark.style.top = ant.py - 9 + "px"; layer.append(mark);
    requestAnimationFrame(() => (mark.style.opacity = "0")); setTimeout(() => mark.remove(), 1500);
    const el = ant.el;
    if (el) {
      el.classList.add("swatted");
      const splat = document.createElement("div"); splat.className = "nest-splat";
      splat.style.left = ant.px + "px"; splat.style.top = ant.py + "px"; layer.append(splat);
      setTimeout(() => splat.remove(), 650);
      setTimeout(() => el.remove(), 340);
      ant.el = null;
    }
    state.ants = state.ants.filter((a) => a !== ant); state.squashed++;
    leaveTrail(ant); if (ant.mini) { ant.mini.guards.delete(ant); ant.mini.flyers.delete(ant); markGuards(ant.mini); }
    if (ant.role === "builder") failBuild(ant);
    checkWipe();
  };

  const enterNest = (ant, carrying) => {
    ant.el?.remove(); ant.el = null; ant.where = "nest"; ant.route = "down"; ant.d = 0; ant.food = carrying || null; ant.letter = null;
  };

  // Walk toward a point. Ants keep their distance: one that would close on an ant ahead going the
  // same way stops for the frame, which is what turns a trail into a line.
  // Only ants on the same trail, heading the same way, hold each other up, so two crossing trails
  // never lock; and an ant kept waiting for more than a second walks on anyway.
  const outbound = (a) => a.job === "follow" || a.job === "toLetter";
  const blocked = (ant) => (ant.stuck || 0) < 1 && state.ants.some((o) => o !== ant && o.el && o.job !== "crew" && o.lead !== ant && ant.lead !== o &&
    ant.trail && o.trail === ant.trail && outbound(o) === outbound(ant) &&
    Math.hypot(o.px - ant.x, o.py - ant.y) < GAP && Math.cos(ant.heading - o.heading) > 0.2 &&
    ((o.px - ant.x) * Math.cos(ant.heading) + (o.py - ant.y) * Math.sin(ant.heading)) > 0);
  const move = (ant, tx, ty, dt, speed) => {
    const dx = tx - ant.x, dy = ty - ant.y, d = Math.hypot(dx, dy), v = speed * dt;
    if (d > 0.5) {
      const want = Math.atan2(dy, dx);
      const diff = ((want - ant.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      ant.heading += diff * Math.min(1, 9 * dt);
    }
    if (d <= v) { ant.x = tx; ant.y = ty; return true; }
    if (ant.job !== "carry" && blocked(ant) && (ant.stuck || 0) < 0.32) { ant.paused = true; ant.stuck = (ant.stuck || 0) + dt; return false; }
    ant.paused = false; if (ant.stuck) ant.stuck = Math.max(0, ant.stuck - dt * 1.4);
    // A little sway, folded into the heading instead of kicked sideways every frame.
    const sway = Math.sin(performance.now() / 240 + ant.id * 0.7) * 0.12;
    ant.x += (dx / d) * v - (dy / d) * sway; ant.y += (dy / d) * v + (dx / d) * sway; return false;
  };

  const stepPage = (ant, dt) => {
    ant.px = ant.x; ant.py = ant.y;
    if (ant.job === "dance") return; // the party moves its own dancers
    if (ant.job === "wait" || ant.job === "crew") return; // crew members are placed by their leader
    if (ant.job === "baited") return;
    if (ant.job === "fly") return stepFlyer(ant, dt);
    if (ant.job === "build-walk" || ant.job === "building" || ant.job === "mini-home") return stepMiniJob(ant, dt);
    if (ant.job === "patrol") { // soldiers and guards walk their trail out and back, guarding it
      if (ant.circling && state.trails.some((trail) => trail.ready && trail.state !== "gone")) return assignGuard(ant);
      if (!ant.circling && !state.trails.includes(ant.patrol)) {
        if (ant.mini && minis.includes(ant.mini)) { ant.job = "mini-home"; ant.path = [ant.mini.hole.slice()]; ant.k = 0; }
        else { ant.job = "home"; ant.path = [hillOf(ant).hole.slice()]; ant.k = 0; }
        return;
      }
      const g = ant.path[ant.k];
      if (!g) {
        if (ant.mini && minis.includes(ant.mini)) { ant.job = "mini-home"; ant.path = [ant.mini.hole.slice()]; ant.k = 0; }
        else { ant.job = "home"; ant.path = [hillOf(ant).hole.slice()]; ant.k = 0; }
        return;
      }
      const beforeX = ant.x, beforeY = ant.y;
      if (move(ant, g[0], g[1], dt, SPEED * 0.8)) { if (++ant.k >= ant.path.length) { ant.path = ant.path.toReversed(); ant.k = 0; } }
      ant.progress = (ant.progress || 0) + Math.hypot(ant.x - beforeX, ant.y - beforeY);
      if (!ant.probe) ant.probe = performance.now();
      if (performance.now() - ant.probe > 6000) {
        // A guard that has stopped moving is a bug, not a patrol. Send it back to the mound so
        // the next assign can choose a fresh path instead of leaving it standing in the dirt.
        if (ant.progress < 30) {
          if (ant.mini && minis.includes(ant.mini)) { ant.job = "mini-home"; ant.path = [ant.mini.hole.slice()]; ant.k = 0; }
          else { ant.job = "home"; ant.path = [hillOf(ant).hole.slice()]; ant.k = 0; }
        }
        ant.probe = performance.now(); ant.progress = 0;
      }
      ant.px = ant.x; ant.py = ant.y; return;
    }
    const goal = ant.path[ant.k]; if (!goal) return;
    const L = ant.letter;
    if (ant.job === "carry") { // the leader moves the centre of the crew; everyone stands under the letter
      ant.x = ant.cx; ant.y = ant.cy;
      const arrived = move(ant, goal[0], goal[1], dt, ant.role === "flyer" ? SPEED * 1.7 : SPEED / (1 + 0.3 * (L.need - 1)));
      ant.cx = ant.x; ant.cy = ant.y;
      const n = L.crew.length, nx = -Math.sin(ant.heading), ny = Math.cos(ant.heading);
      L.crew.forEach((a, k) => { const off = (k - (n - 1) / 2) * 12; a.x = a.px = ant.cx + nx * off; a.y = a.py = ant.cy + ny * off; a.heading = ant.heading; });
      const t = performance.now() / 260;
      L.glyph.style.left = ant.cx - L.glyph.offsetWidth / 2 + "px";
      L.glyph.style.top = ant.cy - L.glyph.offsetHeight - 5 + Math.sin(t) * 1.2 + "px";
      L.glyph.style.transform = `rotate(${Math.sin(t * 0.8) * 3}deg)`;
      if (!arrived || ++ant.k < ant.path.length) return;
      if (isSealed(hillOf(ant))) { ant.k = ant.path.length - 1; return; } // waits at the sealed hill, letter held up
      L.glyph.remove(); L.state = "stolen"; state.stolen.add(L); state.stolenTotal++;
      blip(520, 0.05, "sine"); chord([523, 659], 0.16, 0.022);
      if (ant.trail && !ant.trail.ready) {
        ant.trail.ready = true;
        ant.trail.line.classList.remove("scouting"); ant.trail.halo.classList.remove("scouting");
        if (ant.trail.hit && !ant.trail.hit.isConnected) scent.append(ant.trail.hit);
        log("the scout is home; a trail is laid"); chord([392, 523], 0.18, 0.03);
      }
      if (ant.role === "scout") { ant.role = "worker"; }
      if (ant.role === "flyer") { state.stores++; ant.letter = null; ant.job = "fly"; ant.path = [randomPoint()]; ant.k = 0; return; } // flyers feed the stores and fly on
      L.crew.forEach((a) => { if (a !== ant && a.el) enterNest(a, null); });
      return enterNest(ant, L.ch);
    }
    if (!move(ant, goal[0], goal[1], dt, SPEED)) {
      if (ant.job === "scout" && Math.hypot(ant.x - ant.walked[ant.walked.length - 1][0], ant.y - ant.walked[ant.walked.length - 1][1]) > 14) ant.walked.push([ant.x, ant.y]);
      ant.px = ant.x; ant.py = ant.y; return;
    }
    ant.px = ant.x; ant.py = ant.y;
    if (++ant.k < ant.path.length) return;
    if (ant.job === "scatter") return regroup(ant);
    if (ant.job === "scout") { // found food: the walk becomes a trail and the scout becomes a worker
      ant.walked.push([ant.x, ant.y]);
      // the trail exists from here but stays unscented and closed until the scout gets a letter home
      const pts = chaikin(ant.walked, 1);
      const points = pts.map((p) => p.join(",")).join(" ");
      const halo = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      halo.setAttribute("points", points); halo.classList.add("halo");
      const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      line.setAttribute("points", points);
      const born = performance.now() / 1000;
      const t = { pts, block: ant.block, end: [ant.x, ant.y], ants: new Set(), line, halo, ready: false, hill: hillOf(ant),
        state: "scouting", born, ttl: born + TUNING.trailTtl };
      line.classList.add("scouting"); halo.classList.add("scouting");
      scent.append(halo, line);
      addEraser(t);
      state.trails.push(t); join(ant, t);
      log(`scout found “${(ant.block.textContent || "").trim().slice(0, 22)}”`);
      toLetter(ant, ant.block, true);
    } else if (ant.job === "follow") { if (ant.trail && state.trails.includes(ant.trail)) toLetter(ant, ant.trail.block); else goHome(ant); }
    else if (ant.job === "toLetter") {
      const L2 = ant.letter;
      if (!L2 || L2.state !== "gather") return goHome(ant);
      ant.job = "wait"; ant.el.classList.add("wait");
      if (L2.crew.length >= L2.need && L2.crew.every((a) => a.job === "wait")) lift(L2);
      else if (L2.need > 1 && L2.crew.length === 1) log(`a big “${L2.ch}” needs ${L2.need} ants`);
    } else if (ant.job === "dive") { if (ant.letter && ant.letter.state === "gather") lift(ant.letter); else { ant.job = "fly"; ant.path = [randomPoint()]; ant.k = 0; } }
    else if (ant.job === "bait") { ant.job = "baited"; ant.el.classList.add("wait"); }
    else if (isSealed(hillOf(ant))) { ant.k = ant.path.length - 1; ant.el.classList.add("wait"); }
    else { ant.el.classList.remove("wait"); enterNest(ant, null); }
  };

  const stepNest = (ant, dt) => {
    if (ant.route === "up" && ant.d >= LEN.up - 0.3 && ant.d < LEN.up && ant.held) { ant.held = false; }
    ant.d += NEST_SPEED * dt;
    if (ant.d < LEN[ant.route]) return;
    if (ant.route === "hatch") { ant.route = "up"; ant.d = LEN.up; return atEntrance(ant); }
    if (ant.route === "down") { if (ant.food) state.larder.push(ant.food); ant.route = "feed"; ant.d = 0; ant.food = ant.food ? "meal" : null; return; }
    if (ant.route === "feed") {
      // every other letter goes to the stores instead of the queen; a full store builds a mini hill
      if (ant.food && (state.feedFlip = !state.feedFlip) && !state.queenDead) { state.larder.shift(); state.stores++; ant.food = null; }
      if (ant.food) {
        state.larder.shift(); state.meals++; state.queen.eat = 0.8;
        if (state.meals % 3 === 0 && !state.queenDead) { state.queen.lay = 1; setTimeout(() => { state.eggs.push({ d: 0, age: 0 }); log("the queen laid an egg"); blip(660, 0.06, "sine", 0.04); }, 900); }
      }
      ant.food = null; ant.route = "up"; ant.d = 0; return;
    }
    if (ant.route === "up") atEntrance(ant);
  };

  // ================================ the round ================================
  // The colony loses when the page cannot hold any more: LOSE letters gone, about one in seven of
  // the page's characters, never fewer than 25 and never more than 120. You win only when the
  // colony is wiped out with no eggs left and the queen has spent both reserve scouts, so clearing
  // the first wave is a start, not a win.
  const LOSE = Math.max(25, Math.min(120, Math.round(pageLetters * 0.15)));
  const checkWipe = () => {
    if (state.over || state.ants.length || state.eggs.length || minis.length || state.builder) return;
    if (state.overrun) { newAnt("scout", "hatch", 0); return; } // past saving: the colony always comes back
    if (state.reserve > 0) { state.reserve--; newAnt("scout", "hatch", 0); log(`the colony is gone; the queen spends a reserve scout (${state.reserve} left)`); return; }
    end(true);
  };
  // Neither ending announces itself. Wipe the colony with the reserves spent and the queen dies:
  // the nest goes still and the page keeps whatever gaps it has. Let LOSE letters go and it is too
  // late: ants can no longer be squashed, and they eat on until the page is empty.
  const end = (won) => {
    if (won) {
      state.over = true; state.queenDead = true;
      log("the queen is dead"); blip(110, 0.6, "sine");
    } else {
      state.overrun = true; layer.classList.add("overrun");
      log("too late: the colony has the page"); blip(90, 0.5, "sawtooth");
      startParty(true);
    }
  };

  // ================================ the dance ================================
  // The colony does not wait for the page to empty. Every few letters it stops, the queen comes
  // out of the hill, and the workers circle her. Then they go back to work. The thresholds rise
  // because a colony that danced every twenty letters forever would be a metronome, not a colony.
  const QUEEN_SVG = `<svg viewBox="0 0 44 24" fill="currentColor" aria-hidden="true">
    <circle cx="8" cy="12" r="2.4"/><circle cx="11" cy="12" r="3.1"/><circle cx="15" cy="12" r="3.5"/>
    <circle cx="20" cy="12" r="4.3"/><circle cx="26" cy="12" r="5.2"/><circle cx="33" cy="12" r="6.1"/>
    <path d="M8 4 11 7 14 3 17 7 20 3 23 7 26 3 29 7 32 4" fill="none" stroke="currentColor" stroke-width="1.2"/>
  </svg>`;
  const startParty = (final = false) => {
    if (state.party || state.queenDead) return;
    const now = performance.now();
    const mound = home;
    const queen = document.createElement("div"); queen.className = "nest-queen bob"; queen.innerHTML = QUEEN_SVG;
    queen.style.left = mound.hole[0] + "px"; queen.style.top = (mound.hole[1] - 8) + "px";
    layer.append(queen);
    const dancers = state.ants.filter((a) => a.el && a.where === "page" && !a.letter && a.job !== "carry" && a.job !== "crew" && a.job !== "wait" && a.role !== "builder");
    dancers.forEach((a, i) => {
      a.party = { angle: (i / Math.max(1, dancers.length)) * Math.PI * 2, radius: 40 + (i % 3) * 13 };
      a.job = "dance"; a.el.classList.remove("wait"); a.el.classList.add("dancing");
    });
    const glyphs = [];
    [...state.stolen].slice(-8).forEach((L, i) => {
      const g = document.createElement("span"); g.className = "nest-orbit"; g.textContent = L.ch;
      g.dataset.radius = String(54 + (i % 2) * 16);
      layer.append(g); glyphs.push(g);
    });
    state.party = { start: now, until: now + (final ? 16000 : 9000), final, queen, dancers, glyphs };
    state.queen.lay = 0;
    log(final ? "the colony takes the page" : "the colony dances");
    melody();
  };
  const stepParty = (now, dt) => {
    const p = state.party; if (!p) return;
    const t = now / 1000;
    p.dancers.forEach((a) => {
      if (!a.el) return;
      const angle = a.party.angle + t * 0.9;
      move(a, home.hole[0] + Math.cos(angle) * a.party.radius, home.hole[1] + Math.sin(angle) * a.party.radius * 0.55 + 8, dt, SPEED * 0.9);
      a.px = a.x; a.py = a.y;
    });
    p.glyphs.forEach((g, i) => {
      const angle = (i / Math.max(1, p.glyphs.length)) * Math.PI * 2 + t * 0.7;
      const r = Number(g.dataset.radius) || 58;
      g.style.left = (home.hole[0] + Math.cos(angle) * r) + "px";
      g.style.top = (home.hole[1] + Math.sin(angle) * r * 0.55 - 4) + "px";
    });
    if (now >= p.until) endParty();
  };
  const endParty = () => {
    const p = state.party; if (!p) return;
    p.queen.remove(); p.glyphs.forEach((g) => g.remove());
    p.dancers.forEach((a) => {
      if (!a.el) return;
      a.el.classList.remove("dancing");
      a.job = "home"; a.path = [hillOf(a).hole.slice()]; a.k = 0; a.party = null;
    });
    state.party = null;
    if (p.final) { state.nextParty = Infinity; return; }
    state.partyIndex = Math.min(state.partyIndex + 1, TUNING.party.length);
    state.nextParty = TUNING.party[state.partyIndex] ?? state.nextParty + 120;
  };

  // ================================ mini hills ================================
  // Every other letter fills the stores. A full store sends a builder out of the main hill to raise
  // a mini hill in open ground; squash the builder and the stores are lost. A mini hill sends out
  // guards, which walk to an existing trail and patrol it, and flyers, which roam and steal any
  // letter. It falls to a few clicks, but only once none of its guards are left.
  const STORE_COSTS = [12, 18, 24], MAX_MINIS = 3, BUILD_TIME = 8, MINI_HP = 5, SPAWN_EVERY = 6;
  const storeCap = () => STORE_COSTS[Math.min(state.built, STORE_COSTS.length - 1)];
  const miniArt = (p) => { // a small Braille dome; p from 0 to 1 decides how much of it stands
    const w = 18, h = 8, cells = new Int8Array(w * h).fill(-1);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = (x - w / 2) / (w / 2), top = h * u * u; const hash = ((x * 73 + y * 151) % 97) / 97; if (y >= top && ((x + y) % 2 === 0 || y < top + 1.2) && hash < p) cells[y * w + x] = 0; }
    for (let y = 0; y < 3; y++) for (let x = w / 2 - 2; x < w / 2 + 2; x++) cells[y * w + x] = -1;
    let out = ""; for (let cy = 0; cy < h; cy += 4) { for (let cx = 0; cx < w; cx += 2) { let code = 0; for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) if (cells[(cy + dy) * w + cx + dx] >= 0) code |= bit[dy][dx]; out += String.fromCharCode(0x2800 + code); } out += "\n"; }
    return out.trimEnd();
  };
  const overlaps = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

  // A couple of ground pieces away from the hill, in empty space, so the page itself feels
  // inhabited rather than only the mound. They are decorations: no clicks, no game state.
  const scatterDecor = () => {
    const rects = [];
    for (const n of textNodes(main)) {
      if (!/\S/.test(n.data)) continue;
      const range = document.createRange(); range.selectNodeContents(n);
      for (const r of range.getClientRects()) { const [x, y] = local(r); rects.push([x, y, x + r.width, y + r.height]); }
    }
    main.querySelectorAll("img, svg, figure, hr").forEach((el) => {
      if (layer.contains(el)) return;
      const c = el.getBoundingClientRect();
      if (c.width) { const [x, y] = local(c); rects.push([x, y, x + c.width, y + c.height]); }
    });
    [...hills, ...minis].forEach((mound) => {
      const c = mound.el.getBoundingClientRect();
      if (c.width) { const [x, y] = local(c); rects.push([x - 24, y - 24, x + c.width + 24, y + c.height + 24]); }
    });
    const picked = [];
    for (let tries = 0; tries < 160 && picked.length < 2; tries++) {
      const x = 28 + Math.random() * (main.clientWidth - 56);
      const y = main.scrollTop + 60 + Math.random() * (main.clientHeight - 120);
      const box = [x - 28, y - 26, x + 28, y + 6];
      if (rects.some((r) => overlaps(box, r))) continue;
      if (picked.some((p) => Math.hypot(p[0] - x, p[1] - y) < 90)) continue;
      picked.push([x, y]);
    }
    picked.forEach(([x, y], i) => {
      brailleDecor(i % 2 ? "⠢⠔\n⣀⣀⣀⣀" : "⠁⠂  ⠶\n⣀⣀⣀⣀", x - 28, y - 22);
    });
  };
  scatterDecor();
  // The compact mound fits on a line of prose. An open-ground site also needs room for its badge.
  const miniBox = ({ x, y, gap }) => [x - 30, y - (gap ? 20 : 34), x + 30, y + 2];
  const miniTerrain = (includeMinis = true) => {
    const gaps = [], obstacles = [];
    const stolen = new Set([...state.stolen].map((letter) => letter.span));
    const addRect = (rect, list, pad = 0) => {
      if (!rect.width || !rect.height) return;
      const [x, y] = local(rect);
      list.push([x - pad, y - pad, x + rect.width + pad, y + rect.height + pad]);
    };
    const range = document.createRange();
    for (const node of textNodes(main)) {
      if (!/\S/.test(node.data)) continue;
      range.selectNodeContents(node);
      const list = stolen.has(node.parentElement) ? gaps : obstacles;
      for (const rect of range.getClientRects()) addRect(rect, list);
    }
    for (const el of main.querySelectorAll("img, svg, button, input, select, textarea, figure, hr")) {
      if (!layer.contains(el)) addRect(el.getBoundingClientRect(), obstacles, 4);
    }
    for (const mound of includeMinis ? [...hills, ...minis] : hills) {
      addRect(mound.el.getBoundingClientRect(), obstacles, 24);
      if (mound.badge) addRect(mound.badge.getBoundingClientRect(), obstacles, 8);
    }
    return { gaps, obstacles };
  };
  const miniFits = (box, obstacles) => box[0] >= 4 && box[2] <= main.clientWidth - 4 &&
    box[1] >= 0 && box[3] <= main.scrollHeight && !obstacles.some((rect) => overlaps(box, rect));
  const miniSiteFits = (spot, box, { gaps, obstacles }) => miniFits(box, obstacles) &&
    spot.gap === gaps.some((rect) => overlaps(box, rect));
  const findMiniSpot = () => {
    const terrain = miniTerrain();
    const top = 0, bottom = main.scrollHeight;
    const viewTop = main.scrollTop, viewBottom = viewTop + main.clientHeight;
    const bases = [...hills, ...minis].map((mound) => mound.base);
    let best = null, bestScore = -Infinity;
    const consider = (x, y, gap) => {
      const spot = { x, y, gap };
      const box = miniBox(spot);
      if (box[1] < top + 4 || box[3] > bottom - 4 || !miniSiteFits(spot, box, terrain)) return;
      const separation = Math.min(...bases.map(([baseX, baseY]) => Math.hypot((x - baseX) * 1.5, y - baseY)));
      // A hill in the current view is preferred, but a lower scroll is a fine place too.
      const score = separation + (box[1] >= viewTop && box[3] <= viewBottom ? 1000 : 0);
      if (score > bestScore) { best = spot; bestScore = score; }
    };
    for (const [left, , right, bottomEdge] of terrain.gaps) {
      const center = (left + right) / 2;
      for (const offset of [-18, 0, 18]) consider(center + offset, bottomEdge, true);
    }
    if (best) return best;
    for (let y = top + 40; y < bottom - 4; y += 12) {
      for (let x = 34; x <= main.clientWidth - 34; x += 12) consider(x, y, false);
    }
    return best;
  };
  const positionMini = (element, { x, y }) => {
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  };
  const randomPoint = () => [20 + Math.random() * (main.clientWidth - 40), main.scrollTop + 30 + Math.random() * (main.clientHeight - 60)];
  const spawnPageAnt = (role, at, mini) => {
    state.total++; const a = { id: state.total, role, where: "page", x: at[0], y: at[1], px: at[0], py: at[1], heading: -Math.PI / 2, mini, hill: mini || home, hp: role === "guard" ? 2 : 1 };
    a.el = document.createElement("button"); a.el.type = "button"; a.el.className = "nest-ant walk" + (role === "flyer" ? " flyer" : "");
    a.el.innerHTML = role === "flyer" ? ANT_SVG.replace("<g class=\"legs-a\">", `<g class="wing"><ellipse cx="9" cy="2" rx="5" ry="2.2" opacity=".45"/><ellipse cx="15" cy="2" rx="5" ry="2.2" opacity=".45"/></g><g class="legs-a">`) : role === "guard" ? SOLDIER_SVG : ANT_SVG;
    a.el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); squash(a); });
    layer.append(a.el); state.ants.push(a); label(a); return a;
  };
  const startBuild = () => {
    const spot = findMiniSpot(); if (!spot) return;
    const b = spawnPageAnt("builder", home.hole.slice(), null);
    b.job = "build-walk"; b.path = [[spot.x, spot.y - 6]]; b.k = 0; b.spot = spot; state.builder = b;
    log("the stores are full; a builder heads out");
  };
  const failBuild = (b) => {
    b.mound?.remove(); state.builder = null; state.stores = 0; log("you stopped the builder; the stores are lost");
  };
  const cancelBuild = (ant) => {
    ant.mound?.remove();
    state.builder = null;
    squashQuiet(ant);
  };
  const stepMiniJob = (ant, dt) => {
    if (ant.job === "building") {
      const before = ant.build || 0;
      ant.build = (ant.build || 0) + dt / BUILD_TIME;
      if (Math.floor(ant.build * 5) !== Math.floor(before * 5)) noiseBurst(0.04, 0.03, 700);
      ant.mound.textContent = miniArt(Math.min(1, ant.build));
      ant.heading += Math.sin(performance.now() / 150) * 0.05;
      if (ant.build < 1) return;
      if (!miniSiteFits(ant.spot, miniBox(ant.spot), miniTerrain())) return cancelBuild(ant);
      ant.mound.remove(); makeMini(ant.spot); state.stores = Math.max(0, state.stores - storeCap()); state.built++; state.builder = null;
      ant.job = "home"; ant.role = "worker"; ant.path = [home.hole.slice()]; ant.k = 0; label(ant); return;
    }
    const g = ant.path[ant.k]; if (!g) return;
    if (!move(ant, g[0], g[1], dt, SPEED)) { ant.px = ant.x; ant.py = ant.y; return; }
    ant.px = ant.x; ant.py = ant.y;
    if (ant.job === "build-walk") {
      if (!miniSiteFits(ant.spot, miniBox(ant.spot), miniTerrain())) return cancelBuild(ant);
      ant.job = "building"; ant.build = 0; ant.el.classList.add("wait");
      ant.mound = document.createElement("div"); ant.mound.className = "nest-hill nest-mini"; layer.append(ant.mound);
      ant.mound.textContent = miniArt(0.02);
      positionMini(ant.mound, ant.spot);
      log("a mini hill is going up");
    } else if (ant.job === "mini-home") { if (ant.mini && minis.includes(ant.mini)) assignGuard(ant); else squashQuiet(ant); }
  };
  const markGuards = (mound) => {
    const count = mound.guards.size;
    mound.el.setAttribute("aria-label", count ? `Mini hill, ${count} guards` : `Mini hill, ${mound.hp} hits left`);
    mound.el.classList.toggle("open", !count);
  };
  const squashQuiet = (ant) => { ant.el?.remove(); ant.el = null; state.ants = state.ants.filter((a) => a !== ant); };
  const removeMini = (mound) => {
    mound.el.remove();
    mound.decor?.remove();
    mound.links.forEach((link) => link.remove());
    minis.splice(minis.indexOf(mound), 1);
    mound.guards.forEach(squashQuiet);
    mound.flyers.forEach((flyer) => { flyer.mini = null; flyer.hill = home; });
  };
  const makeMini = (spot) => {
    const el = document.createElement("div"); el.className = "nest-hill nest-mini"; el.textContent = miniArt(1);
    el.setAttribute("role", "button"); el.setAttribute("tabindex", "0");
    positionMini(el, spot);
    const m = { el, spot, base: [spot.x, spot.y], hole: [spot.x, spot.y - 17], hp: MINI_HP, guards: new Set(), flyers: new Set(), next: performance.now() / 1000 + 2, links: [] };
    el.addEventListener("click", (e) => {
      e.stopPropagation(); if (state.overrun || state.queenDead) return;
      if (m.guards.size) {
        el.classList.add("denied"); setTimeout(() => el.classList.remove("denied"), 300);
        blip(180, 0.05, "square"); return;
      }
      m.hp--; el.textContent = miniArt(m.hp / MINI_HP); markGuards(m);
      el.classList.remove("hit"); void el.offsetWidth; el.classList.add("hit");
      blip(160, 0.1, "square"); noiseBurst(0.05, 0.05, 700);
      for (let i = 0; i < 4; i++) {
        const dust = document.createElement("div"); dust.className = "nest-splat";
        dust.style.left = (spot.x + (Math.random() - 0.5) * 24) + "px";
        dust.style.top = (spot.y - Math.random() * 10) + "px";
        layer.append(dust); setTimeout(() => dust.remove(), 600);
      }
      if (m.hp > 0) return;
      removeMini(m); log("you broke a mini hill"); blip(90, 0.4, "square"); noiseBurst(0.2, 0.06, 320); checkWipe();
    });
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } });
    layer.append(el);
    m.decor = brailleDecor("⠁⠂  ⠶\n⣀⣀⣀⣀", spot.x - 48, spot.y - 6);
    minis.push(m); markGuards(m); log("a mini hill stands"); return m;
  };
  // A guard walks from its mini hill to the nearest point of a trail, then patrols that trail.
  // It leaves no line behind it: a soldier is not a scent.
  const assignGuard = (g) => {
    if (!g.mini || !minis.includes(g.mini)) { g.job = "home"; g.path = [hillOf(g).hole.slice()]; g.k = 0; return; }
    const ready = state.trails.filter((t) => t.ready && t.state !== "gone");
    if (!ready.length) {
      const c = [g.mini.spot.x, g.mini.spot.y - 6];
      g.job = "patrol"; g.patrol = null; g.circling = true;
      g.path = Array.from({ length: 7 }, (_, k) => [c[0] + Math.cos(k * 1.1) * 42, c[1] + 10 + Math.sin(k * 1.1) * 24]);
      g.k = 0; return;
    }
    const t = ready[Math.floor(Math.random() * ready.length)];
    let best = 0, bd = Infinity;
    t.pts.forEach((p, k) => { const d = Math.hypot(p[0] - g.mini.hole[0], p[1] - g.mini.hole[1]); if (d < bd) { bd = d; best = k; } });
    g.job = "patrol"; g.patrol = t; g.circling = false;
    g.path = [g.mini.hole.slice(), ...t.pts.slice(best)]; g.k = 0;
    g.guardLink = null;
  };
  const stepFlyer = (f, dt) => {
    const g = f.path[f.k];
    if (!move(f, g[0], g[1], dt, SPEED * 2.1)) { f.px = f.x; f.py = f.y; return; }
    f.px = f.x; f.py = f.y;
    if (Math.random() < 0.35) { // dive for a letter somewhere on screen
      const pool = []; for (const n of textNodes(main)) for (let i = 0; i < n.data.length; i += 2) { if (!/\S/.test(n.data[i])) continue; const L = letterOf(n, i); if (L.state !== "free" || needOf(n) > 1) continue; const r = rectOf(n, i); if (onScreen(r)) pool.push([L, r]); if (pool.length > 400) break; }
      if (pool.length) { const [L, r] = pool[Math.floor(Math.random() * pool.length)]; const [x, y] = local(r); L.state = "gather"; L.need = 1; L.crew = [f]; f.letter = L; f.job = "dive"; f.path = [[x + r.width / 2, y + r.height]]; f.k = 0; return; }
    }
    f.path = [randomPoint()]; f.k = 0;
  };
  let nextBuildSearch = 0;
  const tickMinis = (now) => {
    const t = now / 1000;
    if (!state.paused && now >= nextBuildSearch && !state.builder && !state.queenDead && minis.length < MAX_MINIS && state.stores >= storeCap()) {
      nextBuildSearch = now + 1000;
      startBuild();
    }
    minis.forEach((m) => {
      if (t < m.next || state.queenDead) return; m.next = t + SPEED_SPAWN();
      if (m.guards.size < 2) { const g = spawnPageAnt("guard", [m.spot.x + (Math.random() < 0.5 ? -22 : 22), m.spot.y + 2], m); m.guards.add(g); markGuards(m); assignGuard(g); blip(180, 0.05, "sawtooth", 0.03); }
      else if (m.flyers.size < 2) { const f = spawnPageAnt("flyer", m.hole.slice(), m); m.flyers.add(f); f.job = "fly"; f.path = [randomPoint()]; f.k = 0; blip(720, 0.04, "sine", 0.02); }
    });
  };
  const SPEED_SPAWN = () => SPAWN_EVERY * (0.8 + Math.random() * 0.4);

  // ---- wiping a trail: drag across its scent
  const regroup = (ant) => {
    const patrol = ant.role === "soldier" || ant.role === "guard";
    let nearest = null;
    for (const trail of state.trails) {
      if (!trail.ready || (!patrol && (trail.ants.size >= LINE || !remaining(trail)))) continue;
      for (let i = 1; i < trail.pts.length; i++) {
        const [x, y] = trail.pts[i - 1];
        const dx = trail.pts[i][0] - x, dy = trail.pts[i][1] - y;
        const lengthSq = dx * dx + dy * dy;
        if (!lengthSq) continue;
        const fraction = Math.max(0, Math.min(1, ((ant.x - x) * dx + (ant.y - y) * dy) / lengthSq));
        const point = [x + fraction * dx, y + fraction * dy];
        const distance = Math.hypot(ant.x - point[0], ant.y - point[1]);
        if (!nearest || distance < nearest.distance) nearest = { trail, i, point, distance };
      }
    }
    if (!nearest) {
      if (ant.mini) {
        ant.job = "mini-home"; ant.path = [ant.mini.hole.slice()]; ant.k = 0;
        return;
      }
      return goHome(ant);
    }
    const { trail, i, point } = nearest;
    ant.path = [point, ...trail.pts.slice(i)]; ant.k = 0;
    if (patrol) {
      ant.patrol = trail; ant.job = "patrol";
    } else {
      join(ant, trail); ant.job = "follow";
      if (ant.role === "scout") { ant.role = "worker"; label(ant); }
    }
  };
  const breakTrail = (t, at) => {
    if (!t || t.state === "gone" || !at) return;
    let best = 0, bd = Infinity;
    t.pts.forEach((p, i) => { const d = Math.hypot(p[0] - at[0], p[1] - at[1]); if (d < bd) { bd = d; best = i; } });
    [t.pts.slice(0, best + 1), t.pts.slice(best)].forEach((pts, side) => {
      if (pts.length < 2) return;
      const pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      pl.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
      pl.style.cssText = "fill:none;stroke:var(--nest-trail);stroke-width:1.6;pointer-events:none";
      scent.append(pl);
      pl.animate([{ opacity: 0.8, transform: "translate(0,0)" }, { opacity: 0, transform: `translate(${side ? 8 : -8}px, 4px)` }], { duration: 650, easing: "ease-out" }).onfinish = () => pl.remove();
    });
    for (let i = 0; i < 10; i++) {
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", at[0]); dot.setAttribute("cy", at[1]); dot.setAttribute("r", "1.4");
      dot.setAttribute("fill", "var(--nest-trail)"); scent.append(dot);
      const dx = (Math.random() - 0.5) * 70, dy = (Math.random() - 0.5) * 50;
      dot.animate([{ transform: "translate(0,0)", opacity: 0.9 }, { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }], { duration: 500 + Math.random() * 300, easing: "ease-out" }).onfinish = () => dot.remove();
    }
  };
  const wipeTrail = (trail, at) => {
    if (!trail || trail.state === "gone") return;
    breakTrail(trail, at);
    const displaced = state.ants.filter((ant) => ant.el && (ant.trail === trail || ant.patrol === trail));
    retire(trail);
    displaced.forEach((ant, i) => {
      const letter = ant.letter;
      if (letter?.state === "carried") drop(letter);
      else if (letter?.state === "gather") {
        letter.crew = letter.crew.filter((member) => member !== ant);
        if (!letter.crew.length) letter.state = "free";
      }
      if (ant.guardLink) {
        ant.guardLink.remove();
        ant.mini.links = ant.mini.links.filter((link) => link !== ant.guardLink);
        ant.guardLink = null;
      }
      ant.letter = null; ant.patrol = null; ant.circling = false; ant.lead = null;
      ant.el.classList.remove("wait");
      const angle = i * 2.4 + ant.heading + Math.PI / 2;
      const x = Math.max(10, Math.min(main.scrollWidth - 10, ant.x + Math.cos(angle) * 42));
      const y = Math.max(10, Math.min(main.scrollHeight - 10, ant.y + Math.sin(angle) * 42));
      ant.job = "scatter"; ant.path = [[x, y]]; ant.k = 0;
    });
    blip(240, 0.2, "sawtooth"); noiseBurst(0.18, 0.06, 500); log("you wiped a scent trail");
  };
  const addEraser = (t) => {
    const hit = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    hit.setAttribute("points", t.line.getAttribute("points")); hit.classList.add("hit"); t.hit = hit;
    let from = null;
    hit.addEventListener("pointerdown", (e) => {
      if (!e.isPrimary || e.button !== 0) return;
      e.preventDefault(); from = [e.clientX, e.clientY]; hit.setPointerCapture(e.pointerId);
    });
    hit.addEventListener("pointermove", (e) => {
      if (!e.isPrimary || !from || Math.hypot(e.clientX - from[0], e.clientY - from[1]) < 28) return;
      from = null;
      if (state.trails.includes(t)) {
        const m = main.getBoundingClientRect();
        wipeTrail(t, [e.clientX - m.left + main.scrollLeft, e.clientY - m.top + main.scrollTop]);
      }
    });
    hit.addEventListener("lostpointercapture", () => (from = null));
  };

  // ---- bait: a crumb that pulls nearby ants off course for a few seconds
  const BAIT_COOL = 12, BAIT_TIME = 6;
  let baitReady = 0;
  const setBaitArmed = (armed) => {
    main.classList.toggle("nest-armed", armed);
    if (armed) setAction("bait", "cancel", "Cancel bait", "Cancel bait placement.");
    else setAction("bait", "bait", "Drop bait", "Place a crumb to lure nearby ants away.");
    $("tool-help").textContent = armed ? "Click or tap the page to drop bait." : toolHelp[state.tool];
  };
  const placeBait = (e) => {
    setBaitArmed(false);
    const m = main.getBoundingClientRect(), x = e.clientX - m.left + main.scrollLeft, y = e.clientY - m.top + main.scrollTop;
    const crumb = document.createElement("div"); crumb.className = "nest-bait"; crumb.textContent = "⣴⣦"; crumb.style.left = x + "px"; crumb.style.top = y + "px"; layer.append(crumb);
    baitReady = performance.now() / 1000 + BAIT_COOL; blip(400, 0.08, "sine"); noiseBurst(0.05, 0.03, 900);
    const lured = state.ants.filter((a) => a.el && a !== state.builder && !a.letter && a.job !== "crew" && a.role !== "soldier" && Math.hypot(a.x - x, a.y - y) < 200);
    lured.forEach((a) => { a.trail?.ants.delete(a); a.trail = null; a.job = "bait"; a.path = [[x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 20]]; a.k = 0; });
    log(lured.length ? `${lured.length} ant${lured.length > 1 ? "s" : ""} took the bait` : "nothing near enough to smell it");
    setTimeout(() => {
      crumb.style.opacity = "0"; setTimeout(() => crumb.remove(), 1000);
      lured.forEach((a) => { if (a.el) { a.el.classList.remove("wait"); a.job = "home"; a.path = [hillOf(a).hole.slice()]; a.k = 0; } });
    }, BAIT_TIME * 1000);
  };

  // ---- sound: off by default, one small synth, no audio files
  let audio = null, master = null, noiseBuffer = null;
  const audioCtx = () => {
    if (!audio) {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      master = audio.createGain(); master.gain.value = 0.9;
      const comp = audio.createDynamicsCompressor();
      master.connect(comp).connect(audio.destination);
      noiseBuffer = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.3), audio.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (audio.state === "suspended") audio.resume();
    return audio;
  };
  function blip(freq, dur, type = "sine", gain = 0.06, slide = 0) {
    if (!state.sound) return;
    try {
      const ctx = audioCtx();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ctx.currentTime + dur);
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g).connect(master); o.start(); o.stop(ctx.currentTime + dur);
    } catch { /* a browser that will not give us sound keeps the game */ }
  }
  function noiseBurst(dur = 0.06, gain = 0.05, cutoff = 1200) {
    if (!state.sound) return;
    try {
      const ctx = audioCtx();
      const src = ctx.createBufferSource(); src.buffer = noiseBuffer;
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = cutoff;
      const g = ctx.createGain(); g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      src.connect(f).connect(g).connect(master); src.start(); src.stop(ctx.currentTime + dur);
    } catch { /* same */ }
  }
  const chord = (freqs, dur = 0.2, gain = 0.03) => freqs.forEach((f, i) => setTimeout(() => blip(f, dur, "sine", gain), i * 45));
  const melody = () => [392, 440, 523, 587, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.18, "sine", 0.04), i * 90));

  // ================================ drawing the nest ================================
  const drawNest = (now) => {
    if (!base) return;
    const d = base.slice();
    const put = (x, y, t) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) d[y * W + x] = t; };
    const step = Math.floor(now / 180) % 2;
    const qx = QUEEN[0] * W, qy = QUEEN[1] * H, q = state.queen;
    const swell = state.queenDead ? 0.9 : 1 + 0.06 * Math.sin(now / 400) + 0.25 * q.lay;
    const ax = R * 0.6 * swell, ay = R * 0.26 * swell;
    for (let j = -ay; j <= ay; j++) for (let i = -ax; i <= ax; i++) if ((i * i) / (ax * ax) + (j * j) / (ay * ay) <= 1 && (Math.round(i + j) % 2 === 0 || Math.abs(j) < ay * 0.5)) put(qx + R * 0.15 + i, qy + j, state.queenDead ? 0 : 6);
    const hx = qx - R * 0.6 - (q.eat > 0 ? step * 2 : 0);
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { put(qx - R * 0.45 + i, qy + j, 6); if (Math.abs(i) + Math.abs(j) < 3) put(hx - 4 + i, qy + j, 6); }
    for (let k = -1; k <= 1; k++) for (let s = 1; s < 4; s++) { const lx = qx - R * 0.45 + k * 3 + s * k + (step && k === 0 ? 1 : 0); put(lx, qy + 2 + s, 6); put(lx, qy - 2 - s, 6); }
    if (q.eat > 0) { put(hx - 8 + q.eat * 3, qy, 5); put(hx - 8 + q.eat * 3, qy - 1, 5); }
    if (q.lay > 0) put(qx + R * 0.15 + ax + 2, qy, 4);
    { const cap = storeCap(), fill = Math.min(1, state.stores / cap), per = Math.round(fill * R * 1.1);
      STORES.forEach(([u, v], c) => { for (let k = 0; k < per; k++) { const col = k % Math.max(2, Math.floor(R * 0.9)), row = Math.floor(k / Math.max(2, Math.floor(R * 0.9))); put(u * W - R * 0.45 + col * 1.0 + (c ? 0 : 0), v * H + 2 - row, 5); } }); }
    state.larder.forEach((_, k) => { if (k < R * 0.8) { put(LARDER[0] * W - R * 0.7 + k * 2, LARDER[1] * H + 2, 5); put(LARDER[0] * W - R * 0.7 + k * 2, LARDER[1] * H + 1 - (k % 2), 5); } });
    state.eggs.forEach((e, k) => {
      const [u, v] = e.d < LEN.lay ? along("lay", e.d) : [NURSERY[0] - 0.08 + (k % 5) * 0.035, NURSERY[1] + 0.01];
      const wob = e.d >= LEN.lay && e.age > 2 ? step : 0;
      put(u * W + wob, v * H, 4); put(u * W + 1 + wob, v * H, 4);
    });
    state.ants.forEach((a) => {
      if (a.where !== "nest") return;
      const [u, v, ang] = along(a.route, Math.min(a.d, LEN[a.route]));
      const x = u * W, y = v * H, cx = Math.cos(ang), cy = Math.sin(ang), t = a.role === "scout" ? 5 : 3;
      for (let s = -2; s <= 1; s++) put(x + cx * s, y + cy * s, t);
      const leg = step ? 1 : -1; put(x - cy * 1.5 + cx * leg, y + cx * 1.5 + cy * leg, t); put(x + cy * 1.5 - cx * leg, y - cx * 1.5 - cy * leg, t);
      if (a.food) { put(x + cx * 3, y + cy * 3, 5); put(x + cx * 3, y + cy * 3 - 1, 5); }
    });
    let out = "";
    for (let cy = 0; cy < H; cy += 4) {
      for (let cx = 0; cx < W; cx += 2) {
        let code = 0, tone = -1;
        for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) { const t = d[(cy + dy) * W + cx + dx]; if (t >= 0) { code |= bit[dy][dx]; tone = Math.max(tone, t); } }
        const ch = String.fromCharCode(0x2800 + code);
        out += tone > 0 ? `<b class="t${tone}">${ch}</b>` : ch;
      }
      out += "\n";
    }
    pre.innerHTML = out;
  };

  const drawStats = () => {
    const setMeter = (key, ratio, text) => {
      const r = Math.min(1, Math.max(0, ratio));
      const fill = $(key); if (fill) fill.style.width = `${Math.round(r * 100)}%`;
      const meter = $(`${key}-bar`);
      if (meter) {
        meter.setAttribute("aria-valuenow", String(Math.round(r * 100)));
        meter.setAttribute("aria-valuetext", text ?? `${Math.round(r * 100)}%`);
      }
      const val = $(`${key}-val`); if (val && text != null) val.textContent = text;
    };
    $("scouts").textContent = state.ants.filter((a) => a.role === "scout").length;
    $("workers").textContent = state.ants.filter((a) => a.role === "worker").length;
    $("soldiers").textContent = state.ants.filter((a) => a.role === "soldier" || a.role === "guard").length;
    $("flyers").textContent = state.ants.filter((a) => a.role === "flyer").length;
    $("minis").textContent = minis.length;
    const cap = storeCap();
    setMeter("stores", state.stores / cap, state.builder ? "building" : minis.length >= MAX_MINIS ? "full" : `${state.stores}/${cap}`);
    $("reserve").textContent = `${state.reserve}/2`;
    const held = Math.max(0, 1 - state.stolen.size / LOSE);
    setMeter("holds", held, `${Math.round(held * 100)}%`);
    const wait = Math.ceil(baitReady - performance.now() / 1000);
    const sealWait = Math.ceil(Math.max(...hills.map((h) => h.cool)) - performance.now() / 1000);
    $("seal").disabled = sealWait > 0 || state.queenDead;
    if (state.over && main.classList.contains("nest-armed")) setBaitArmed(false);
    $("bait").disabled = wait > 0 || state.over || state.tool === "read";
    for (const [key, seconds] of [["seal", sealWait], ["bait", wait]]) {
      if (seconds > 0) $(key).dataset.cooldown = `${seconds}s`;
      else $(key).removeAttribute("data-cooldown");
    }
    $("trails").textContent = state.trails.length;
    $("squashed").textContent = state.squashed;
    $("larder").textContent = [...state.stolen].slice(-18).map((L) => L.ch).join("") || "empty";
    const fed = state.meals % 3;
    setMeter("bar", fed / 3, `${fed}/3`);
    $("status").textContent = state.party ? "dancing" : state.queenDead ? "the queen is dead" : state.overrun ? "overrun"
      : state.paused ? "paused" : state.queen.lay > 0 ? "laying" : state.queen.eat > 0 ? "feeding"
      : scoutsOut() ? "scouting" : state.trails.length ? "foraging" : "resting";
  };

  // ================================ the loop ================================
  let last = performance.now(), tick = 0;
  let stopped = false;
  const frame = (now) => {
    if (stopped) return;
    try { tickFrame(now); } catch (err) { console.error("nest:", err); }
    requestAnimationFrame(frame);
  };
  const tickFrame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!state.paused) {
      if (state.party) stepParty(now, dt);
      state.ants.slice().forEach((a) => (a.where === "nest" ? stepNest(a, dt) : stepPage(a, dt)));
      state.ants.forEach((a) => { if (a.el) { a.el.style.left = a.px + "px"; a.el.style.top = a.py + "px"; a.el.style.transform = `rotate(${a.heading + Math.PI}rad)`; a.el.classList.toggle("walk", a.job !== "wait" && !a.paused); } });
      state.queen.eat = Math.max(0, state.queen.eat - dt); state.queen.lay = Math.max(0, state.queen.lay - dt * 0.7);
      state.eggs.slice().forEach((e) => {
        if (e.d < LEN.lay) e.d += NEST_SPEED * 0.6 * dt;
        else if ((e.age += dt) > 3.4 && state.ants.length < MAX_ANTS) {
          state.eggs.splice(state.eggs.indexOf(e), 1);
          const soldier = state.ants.length >= 8 && Math.random() < 0.22;
          newAnt(soldier ? "soldier" : "worker", "hatch", 0);
          log(soldier ? "a soldier hatched" : "an egg hatched");
          blip(soldier ? 220 : 440, 0.06, "square", 0.035);
          setTimeout(() => blip(soldier ? 330 : 660, 0.05, "sine", 0.03), 90);
        }
      });
    }
    if ((tick = (tick + 1) % 6) === 0) {
      if (!state.paused) state.trails.slice().forEach((t) => {
        if (t.state === "gone") return;
        if (!remaining(t)) {
          const wore = t.ttl && performance.now() / 1000 > t.ttl;
          retire(t);
          log(wore ? "a trail wears out" : "a trail ran out of letters");
          blip(220, 0.22, "sine", 0.03, -70);
        }
      });
      if (!state.over) {
        state.peak = Math.max(state.peak, state.ants.length); checkWipe();
        if (!state.overrun && state.stolen.size >= LOSE) end(false);
        if (!state.overrun && !state.party && state.stolenTotal >= state.nextParty) startParty(false);
        tickMinis(now);
      }
      drawNest(now); drawStats();
    }
  };

  $("bait").addEventListener("click", () => {
    if (state.over || state.tool === "read" || performance.now() / 1000 < baitReady) return;
    setBaitArmed(!main.classList.contains("nest-armed"));
  });
  const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const setTool = (t) => {
    if (!toolHelp[t]) return;
    state.tool = t;
    layer.dataset.tool = t;
    layer.inert = t === "read";
    layer.querySelectorAll(".nest-ant").forEach((button) => { button.inert = t === "wipe"; });
    main.dataset.nestTool = t;
    if (main.classList.contains("nest-armed")) setBaitArmed(false);
    $("tool-help").textContent = toolHelp[t];
    const linksOpen = t === "read";
    $("link-state").classList.toggle("open", linksOpen);
    $("link-text").textContent = linksOpen ? "links open" : "links locked";
    panel.querySelectorAll("[data-tool]").forEach((b) => {
      const on = b.dataset.tool === t;
      b.setAttribute("aria-pressed", String(on));
      if (on && !reduceMotion()) b.animate([{ transform: "translateY(1px) scale(.95)" }, { transform: "none" }], { duration: 180, easing: "ease-out" });
    });
    blip(t === "read" ? 520 : 380, 0.04, "sine", 0.025);
  };
  const onKey = (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]")) return;
    const map = { "1": "squash", "2": "wipe", "3": "read" };
    if (map[e.key]) { e.preventDefault(); setTool(map[e.key]); }
    if (e.key === "Escape" && main.classList.contains("nest-armed")) setBaitArmed(false);
  };
  document.addEventListener("keydown", onKey);
  panel.querySelectorAll("[data-tool]").forEach((b) => b.addEventListener("click", () => setTool(b.dataset.tool)));
  const holdLinks = (e) => {
    if (state.tool === "read") return;
    if (!state.over && e.type === "click" && e.detail > 0 && main.classList.contains("nest-armed")) {
      e.preventDefault(); e.stopPropagation(); placeBait(e); return;
    }
    if (layer.contains(e.target)) return;
    if (e.target.closest("a, button, summary, label, input, select, textarea, [role=button]")) { e.preventDefault(); e.stopPropagation(); }
  };
  main.addEventListener("click", holdLinks, true);
  main.addEventListener("auxclick", holdLinks, true);
  setTool("squash");
  $("x").addEventListener("click", leave);
  $("seal").addEventListener("click", () => hills.forEach(seal));
  $("sound").addEventListener("click", () => {
    state.sound = !state.sound;
    if (state.sound) setAction("sound", "sound", "Mute", "Turn off colony sounds.");
    else setAction("sound", "muted", "Unmute", "Turn on colony sounds.");
    blip(520, 0.08, "sine");
  });
  $("pause").addEventListener("click", () => {
    state.paused = !state.paused;
    if (state.paused) setAction("pause", "play", "Resume", "Resume the colony.");
    else setAction("pause", "pause", "Pause", "Pause the colony.");
    layer.querySelectorAll(".nest-ant").forEach((el) => el.classList.toggle("walk", !state.paused));
  });
  $("restore").addEventListener("click", () => {
    if (state.builder?.spot.gap) cancelBuild(state.builder);
    minis.filter((mound) => mound.spot.gap).forEach(removeMini);
    state.ants.forEach((a) => { if (a.letter?.state === "carried") drop(a.letter); });
    state.stolen.forEach((L) => { showChar(L); L.state = "free"; L.crew = []; });
    state.stolen.clear(); state.larder = []; log("every letter is back");
  });

  // Six ants to start: three scouts already on their way up and three workers below them. The
  // opening is a beat, not a waiting room: a trail should exist before the player wonders if it works.
  newAnt("scout", "hatch", LEN.hatch * 0.85); newAnt("scout", "hatch", LEN.hatch * 0.55); newAnt("scout", "hatch", LEN.hatch * 0.3);
  for (let k = 0; k < 3; k++) newAnt("worker", "up", LEN.up - 0.06 - k * 0.025);
  log("the colony wakes; three scouts head out");
  blip(196, 0.3, "sine", 0.04, -40);
  setTimeout(() => { if (!state.queenDead && !state.over) { state.queen.lay = 1; state.eggs.push({ d: 0, age: 0 }); log("the queen lays the first egg"); blip(660, 0.06, "sine", 0.04); } }, 6000);
  requestAnimationFrame(frame);

  let terrainWidth = main.clientWidth;
  const watchTerrain = new ResizeObserver(() => {
    if (main.clientWidth === terrainWidth) return;
    terrainWidth = main.clientWidth;
    const builder = state.builder;
    if (!minis.length && !builder) return;
    const terrain = miniTerrain(false);
    const fits = ({ spot }) => miniSiteFits(spot, miniBox(spot), terrain);
    if (builder && !fits(builder)) cancelBuild(builder);
    minis.filter((mound) => !fits(mound)).forEach(removeMini);
  });
  watchTerrain.observe(main);

  // Leaving: put every letter back, carried or stolen, and take the colony off the page.
  const stop = () => {
    watchTerrain.disconnect();
    stopped = true; main.removeEventListener("click", holdLinks, true);
    main.removeEventListener("auxclick", holdLinks, true); document.removeEventListener("keydown", onKey);
    main.classList.remove("nest-armed"); delete main.dataset.nestTool;
    if (state.party) {
      state.party.queen.remove();
      state.party.glyphs.forEach((g) => g.remove());
      state.party.dancers.forEach((a) => a.el?.classList.remove("dancing"));
      state.party = null;
    }
    state.ants.forEach((a) => { const L = a.letter; if (L && L.glyph) { L.glyph.remove(); showChar(L); } });
    state.stolen.forEach(showChar);
    for (const [letter, animation] of returningLetters) {
      animation.cancel();
      finishReturn(letter);
    }
    delete window.__nest;
    layer.remove(); panel.remove();
    hidden.forEach((el) => { el.style.display = el.dataset.nestDisplay; delete el.dataset.nestDisplay; });
    if (sidebarWasHidden) shell?.setAttribute("data-aside-hidden", "true");
    antBtn.setAttribute("aria-pressed", "false"); antBtn.setAttribute("aria-label", "Open the Nest");
  };
  let leaveGo = null;
  $("leave").addEventListener("click", () => { $("confirm").hidden = true; leaveGo?.(); });
  $("stay").addEventListener("click", () => { $("confirm").hidden = true; antBtn.focus(); });
  const confirmLeave = (go) => {
    const box = $("confirm"); box.hidden = false; $("leave").focus();
    leaveGo = go;
  };
  if (new URLSearchParams(location.search).has("nest-debug")) {
    window.__nest = { state, home, startParty, wipeTrail, retire, squash, makeMini, findMiniSpot, newAnt, label };
  }
  return { stop, confirmLeave };
  };
})();
