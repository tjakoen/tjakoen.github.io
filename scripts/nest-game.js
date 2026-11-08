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
    party: [20, 50, 90, 140, 200, 280, 380], // letters stolen at each colony dance
  };
  const LINE = TUNING.line, MAX_ANTS = TUNING.maxAnts, SPEED = TUNING.speed;
  const GAP = TUNING.gap, NEST_SPEED = TUNING.nestSpeed;

  const style = document.createElement("style");
  style.textContent = `
    #nest-mock { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 10px;
      padding: var(--space-3, 12px); font: 12px/1.4 var(--font-mono); color: var(--ink);
      min-width: 0; max-width: 100%; overflow-x: hidden; }
    #nest-mock > * { min-width: 0; max-width: 100%; }
    #nest-mock .head { min-width: 0; }
    #nest-mock .head .lbl { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #nest-mock .muted { color: var(--ink-muted); }
    #nest-mock .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; display: flex; justify-content: space-between; gap: 8px; }
    #nest-mock .well { position: relative; flex: 1 1 0; min-height: 0; overflow: hidden; background: var(--paper-2); border: 1px solid var(--color-line);
      display: flex; align-items: stretch; justify-content: center; }
    .nest-pre { width: 100%; height: 100%; margin: 0; font-family: var(--font-mono); font-size: 10px; line-height: 1.2; letter-spacing: -0.04em;
      -webkit-text-stroke: 0.05em currentColor; color: var(--ink-faint); user-select: none; }
    .nest-pre b { font-weight: inherit; }
    .nest-pre .t1 { color: var(--ink-muted); } .nest-pre .t2, .nest-pre .t5, .nest-pre .t6 { color: var(--color-accent); }
    .nest-pre .t3, .nest-pre .t4 { color: var(--ink); }
    #nest-mock .stats { display: grid; grid-template-columns: auto 1fr auto 1fr; gap: 2px 10px; margin: 0; align-items: baseline; }
    #nest-mock .stats dt, #nest-mock .stats dd { margin: 0; font-size: 12px; line-height: 1.4; }
    #nest-mock .stats dd { text-align: right; font-variant-numeric: tabular-nums; }
    #nest-mock .accent { color: var(--color-accent); }
    #nest-mock .bar { font-family: var(--font-mono); letter-spacing: -0.04em; -webkit-text-stroke: 0.05em currentColor; }
    #nest-mock .nest-foot { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; min-width: 0; margin-bottom: -10px; }
    #nest-mock .nest-foot .log { flex: 1; min-width: 0; }
    #nest-mock .nest-foot .note-link { flex: 0 0 auto; margin: 0; }
    #nest-mock .log { margin: 0; padding: 0; list-style: none; min-height: 1.4em; max-height: 1.4em; overflow: hidden; font-size: 11px; color: var(--ink-muted); }
    #nest-mock .log li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #nest-mock .log li:first-child { color: var(--ink); }
    #nest-mock .log li::before { content: "› "; color: var(--ink-faint); }
    #nest-mock .row { display: flex; gap: 6px; }
    #nest-mock button { flex: 1; padding: 6px; background: none; border: 1px solid currentColor; color: inherit; font: inherit; cursor: pointer; }
    #nest-mock button:hover { background: var(--paper-2); }
    #nest-mock .tools button { position: relative; display: grid; place-items: center; min-width: 0; min-height: 40px; }
    #nest-mock .tools button:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
    #nest-mock .tools button[data-cooldown]::after { content: attr(data-cooldown); position: absolute; right: 2px; bottom: 0; font-size: 9px; }
    #nest-mock .tool-help { min-height: 1.5em; height: 1.5em; overflow: hidden; margin: 0; font-size: 10px; line-height: 1.3; }
    #nest-mock { position: relative; }
    #nest-mock .confirm { position: absolute; inset: auto var(--space-3, 12px) var(--space-3, 12px); padding: var(--space-3, 12px);
      background: var(--paper); border: 1px solid var(--ink); box-shadow: 0 6px 24px rgba(0,0,0,.35); }
    #nest-mock .confirm p { margin: 0 0 8px; }
    .nest-layer { position: absolute; left: 0; top: 0; width: 100%; z-index: 50; pointer-events: none; overflow: hidden; user-select: none; -webkit-user-select: none; }
    [data-nest-tool="squash"], [data-nest-tool="squash"] *,
    [data-nest-tool="wipe"], [data-nest-tool="wipe"] * { user-select: none; -webkit-user-select: none; }
    .nest-ant, .nest-hill, .nest-stray { user-select: none; -webkit-user-select: none; }
    .nest-scent { position: absolute; left: 0; top: 0; width: 1px; height: 1px; overflow: visible; }
    .nest-layer { --nest-trail: var(--ink-muted); --nest-rival: #a33b3b; }
    :root[data-color-scheme="dark"] .nest-layer { --nest-rival: #e08a8a; }
    :root[data-color-scheme="light"] .nest-layer { --nest-trail: color-mix(in srgb, var(--ink) 66%, var(--paper)); }
    @media (prefers-color-scheme: light) { :root:not([data-color-scheme="dark"]) .nest-layer { --nest-trail: color-mix(in srgb, var(--ink) 66%, var(--paper)); } }
    .nest-hill.rival, .nest-ant.rival { color: var(--nest-rival); }
    .nest-hill.rising { animation: nest-hill-rise .78s cubic-bezier(.2,.8,.2,1) both; transform-origin: 50% 100%; }
    .nest-hill.hit { animation: nest-hill-hit .3s steps(2); }
    @keyframes nest-hill-hit { 50% { transform: translateX(3px); filter: brightness(1.5); } }
    .nest-hill.unbuilding { animation: nest-hill-unbuild .55s cubic-bezier(.6,0,.8,.4) both; transform-origin: 50% 100%; }
    @keyframes nest-hill-unbuild { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(10px) scaleY(.06); } }
    .nest-sweet-card, .nest-event-card { position: absolute; z-index: 5; width: 46px; height: 28px; padding: 0; border: 0; background: none; color: var(--color-accent); cursor: pointer; pointer-events: auto; animation: nest-sweet-fade 12s linear both; }
    .nest-event-card { width: 44px; }
    .nest-sweet-card .wrapper, .nest-event-card .wrapper { position: absolute; top: 4px; width: 15px; height: 20px; background: currentColor; opacity: .78; transition: transform .42s ease, opacity .42s; }
    .nest-sweet-card .wrapper.left, .nest-event-card .wrapper.left { left: 0; clip-path: polygon(100% 0, 0 50%, 100% 100%); transform-origin: 100% 50%; }
    .nest-sweet-card .wrapper.right, .nest-event-card .wrapper.right { right: 0; clip-path: polygon(0 0, 100% 50%, 0 100%); transform-origin: 0 50%; }
    .nest-sweet-card .candy, .nest-event-card .candy { position: absolute; left: 13px; top: 4px; width: 20px; height: 20px; border-radius: 50%; background: currentColor; box-shadow: inset 0 0 0 3px var(--paper), 0 0 8px color-mix(in srgb, currentColor 35%, transparent); transition: transform .42s ease, opacity .42s; }
    .nest-sweet-card .candy::after { content: ""; position: absolute; left: 6px; top: 3px; width: 8px; height: 14px; border-radius: 50%; background: var(--paper); opacity: .65; }
    .nest-event-card[data-kind="vacuum"] .candy { border-radius: 4px; }
    .nest-event-card[data-kind="vacuum"] .candy::after { content: ""; position: absolute; left: 8px; top: 3px; width: 3px; height: 14px; background: var(--paper); }
    .nest-event-card[data-kind="anteater"] .candy { left: 11px; width: 24px; height: 10px; top: 9px; border-radius: 10px 0 0 10px; }
    .nest-event-card[data-kind="anteater"] .candy::after { content: ""; position: absolute; right: 1px; top: 3px; width: 7px; height: 4px; border-radius: 50%; background: var(--paper); }
    .nest-event-card .candy svg { position: absolute; inset: 0; width: 100%; height: 100%; stroke: var(--paper); fill: none; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .nest-sweet-card.unwrapping .wrapper.left, .nest-event-card.unwrapping .wrapper.left { transform: translateX(-28px) rotate(-35deg); opacity: 0; }
    .nest-sweet-card.unwrapping .wrapper.right, .nest-event-card.unwrapping .wrapper.right { transform: translateX(28px) rotate(35deg); opacity: 0; }
    .nest-sweet-card.unwrapping .candy, .nest-event-card.unwrapping .candy { transform: scale(1.35); }
    .nest-sweet-card:focus-visible, .nest-event-card:focus-visible { outline: 2px dashed var(--color-accent); outline-offset: 3px; }
    .nest-ant.fighting { animation: nest-fight .12s steps(2) infinite; color: var(--nest-rival); }
    .nest-ant.fighting::after { content: "✶"; position: absolute; left: 50%; top: -12px; color: var(--color-accent); font-size: 12px; }
    .nest-ant.marching { filter: drop-shadow(0 0 4px var(--color-accent)); }
    @keyframes nest-fight { 50% { transform: translateX(2px) rotate(4deg); } }
    .nest-sweet { position: absolute; z-index: 4; color: var(--color-accent); font: 18px/1 var(--font-mono); letter-spacing: 2px; text-shadow: 0 0 8px color-mix(in srgb, var(--color-accent) 40%, transparent); pointer-events: none; }
    main.nest-sweet-planning { cursor: crosshair; }

    .nest-vacuum { position: absolute; z-index: 6; width: 100px; height: 100%; pointer-events: none; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent); border-left: 1px solid var(--color-accent); }
    .nest-tongue { position: absolute; z-index: 6; pointer-events: none; overflow: visible; }
    .nest-suck { position: absolute; z-index: 7; width: 3px; height: 3px; border-radius: 50%; background: var(--color-accent); pointer-events: none; }
    .nest-ant.stuck { color: var(--color-accent); opacity: .8; }
    @keyframes nest-sweet-fade { from { opacity: 1; } to { opacity: .15; } }
    .nest-event-card { width: 54px !important; height: 54px !important; padding: 7px !important; border: 1px solid var(--color-accent) !important; background: var(--paper) !important; border-radius: 0 !important; }
    .nest-event-card .wrapper { display: none !important; }
    .nest-event-card .candy { position: static !important; width: 100% !important; height: 100% !important; background: none !important; box-shadow: none !important; border-radius: 0 !important; }
    .nest-event-card .candy::after { display: none !important; }
    .nest-event-card .candy svg { width: 100%; height: 100%; }
    .nest-event-card:hover, .nest-event-card:focus-visible { background: var(--paper-2) !important; outline: 2px dashed var(--color-accent); outline-offset: 2px; }
    @keyframes nest-hill-rise { from { opacity: 0; transform: translateY(9px) scaleY(.12); } to { opacity: 1; transform: none; } }
    .nest-scent polyline.rival { stroke: var(--nest-rival); }
    .nest-meter .hint .rival, #nest-mock .stat-grid .rival { color: var(--nest-rival); }
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
    .nest-ant .legs-b, .nest-stray .legs-b { opacity: 0; }
    .nest-ant.walk .legs-a, .nest-stray.walk .legs-a { animation: nest-step .18s steps(1) infinite; }
    .nest-ant.walk .legs-b, .nest-stray.walk .legs-b { animation: nest-step .18s steps(1) infinite reverse; }
    .nest-stray.running .legs-a { animation-duration: .1s; }
    .nest-stray.running .legs-b { animation-duration: .1s; }
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
    .nest-ant.flash { color: var(--color-accent); animation: nest-ant-flash .18s steps(2) 2; }
    @keyframes nest-ant-flash { 50% { opacity: .25; } }
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
    .nest-mini.exposed { color: var(--color-accent); }
    .nest-mini.denied { color: var(--color-accent); transform: translateX(2px); }
    .nest-hill { pointer-events: auto; cursor: pointer; transition: opacity .3s, filter .3s; }
    .nest-hill.pressing { filter: brightness(1.4); }
    .nest-hill.sealed { color: var(--color-accent); }
    .nest-hill.sealed b { color: var(--color-accent); }
    .nest-scent .hit { stroke: transparent; stroke-width: 24; stroke-dasharray: none; cursor: cell; opacity: 1; }
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
    #nest-mock .tools button[aria-pressed="true"] { color: var(--color-accent); border-color: currentColor; background: var(--paper-2); box-shadow: inset 0 0 0 1px currentColor; }
    .nest-scent .hit { pointer-events: none; }
    .nest-layer[data-tool="wipe"] .nest-scent .hit { pointer-events: stroke; touch-action: none; }
    #nest-mock .tools button[disabled] { opacity: .45; cursor: default; }
    .nest-switch { background: none; border: 0; padding: 2px 4px; margin: 0 6px; color: var(--ink-faint); cursor: pointer; line-height: 0; }
    [data-nest-start] { font: 11px/1 var(--font-mono); letter-spacing: .06em; text-transform: uppercase; padding: 8px 12px; border: 1px solid currentColor; background: none; color: inherit; cursor: pointer; }
    [data-nest-start]:hover, [data-nest-start]:focus-visible { background: var(--paper-2); outline: 1px dashed var(--color-accent); outline-offset: 2px; }
    .nest-switch:hover, .nest-switch:focus-visible { color: var(--ink); }
    .nest-switch[aria-pressed="true"] { color: var(--color-accent); }
    .nest-switch.nest-pulse svg { animation: nest-pulse 1.1s ease-out 2; }
    @keyframes nest-pulse { 0%, 100% { transform: scale(1); } 40% { transform: scale(1.45); } }
    body.nest-links-locked a[href] { cursor: not-allowed; }
    body.nest-links-locked #nest-mock a[href], body.nest-links-locked .nest-switch, body.nest-links-locked [data-surface="console"] a[href] { cursor: pointer; }
    .nest-lock-toast { position: fixed; left: 50%; bottom: 48px; transform: translateX(-50%); z-index: 300;
      display: flex; align-items: center; gap: 10px; max-width: min(92vw, 470px); padding: 10px 12px;
      background: var(--paper); color: var(--ink); border: 1px solid var(--ink); box-shadow: 4px 4px 0 var(--color-line);
      font: 11px/1.35 var(--font-mono); }
    .nest-lock-toast button { border: 1px solid currentColor; background: none; padding: 4px 8px; font: inherit; color: inherit; cursor: pointer; white-space: nowrap; }
    .nest-lock-toast button:hover { background: var(--paper-2); }
    #nest-mock .nest-sound-hint { color: var(--color-accent); border-color: var(--color-accent); animation: nest-sound-pulse 1.2s ease-in-out infinite; }
    @keyframes nest-sound-pulse { 0%, 100% { box-shadow: 0 0 0 0 transparent; background-color: transparent; } 50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-accent) 40%, transparent); background-color: color-mix(in srgb, var(--color-accent) 12%, transparent); } }
    @media (prefers-reduced-motion: reduce) { #nest-mock .nest-sound-hint { animation: none; outline: 1px dashed var(--color-accent); outline-offset: 2px; } }
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
    .nest-queen { position: absolute; width: 60px; height: 38px; margin: -19px 0 0 -30px; color: var(--color-accent); pointer-events: none; z-index: 2;

      filter: drop-shadow(0 0 4px color-mix(in srgb, var(--color-accent) 35%, transparent)); transition: opacity .4s, left 1.2s ease-in-out, top 1.2s ease-in-out; }
    .nest-queen svg { display: block; width: 60px; height: 38px; overflow: visible; }
    .queen-braille { margin: 0; font: 10px/1 var(--font-mono); letter-spacing: 0; color: inherit; text-align: center; white-space: pre; }
    .nest-queen.panel-queen { z-index: 4; }
    .nest-queen.bob { animation: nest-bob .55s ease-in-out infinite alternate; }
    .nest-queen.crawling { animation: nest-queen-crawl .18s steps(2) infinite; }
    .nest-queen.dancing { animation: nest-queen-dance .5s ease-in-out infinite alternate; }
    @keyframes nest-queen-crawl { 50% { transform: translateY(1px) rotate(2deg); } }
    @keyframes nest-queen-dance { to { transform: translateY(-3px) rotate(-4deg); } }
    .nest-ant.dancing { pointer-events: none; }
    .nest-ant.dancing svg { animation: nest-dance .55s ease-in-out infinite alternate; }
    @keyframes nest-dance { to { transform: translateY(-2px) rotate(6deg); } }
    #nest-mock.celebrating .well { animation: nest-party-glow 1.4s ease-in-out infinite alternate; }
    #nest-mock.celebrating .nest-pre { animation: nest-party-sway 1.4s ease-in-out infinite alternate; }
    @keyframes nest-party-glow { from { border-color: var(--color-line); box-shadow: inset 0 0 0 0 transparent; } to { border-color: var(--color-accent); box-shadow: inset 0 0 22px color-mix(in srgb, var(--color-accent) 15%, transparent); } }
    @keyframes nest-party-sway { to { transform: translateY(-1.5px); filter: brightness(1.1); } }
    .nest-orbit { position: absolute; white-space: pre; pointer-events: none; color: var(--color-accent); font: 11px/1 var(--font-mono); opacity: .75; }
    @keyframes nest-bob { to { transform: translateY(-3px); } }
    #nest-mock .nest-meters { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    #nest-mock .nest-meter { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 6px; align-content: start;
      padding: 6px 8px; border: 1px solid var(--color-line); background: var(--paper-2); }
    #nest-mock .nest-meter > .lbl { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #nest-mock .nest-meter .hint { grid-column: 1 / -1; font: 8px/1.15 var(--font-mono); font-style: normal; letter-spacing: .02em; opacity: .55; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #nest-mock .nest-meter__bar { grid-column: 1 / -1; font: 10px/1.2 var(--font-mono); letter-spacing: .04em; white-space: nowrap; overflow: hidden; }
    #nest-mock .nest-meter__bar .fill { color: var(--color-accent); }
    #nest-mock .nest-meter__bar .rest { color: var(--ink-faint); opacity: .7; }
    #nest-mock .stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px 10px; margin: 0; align-items: baseline; }
    #nest-mock .stat-grid div { display: flex; justify-content: flex-start; gap: 4px; min-width: 0; overflow: hidden; }
    #nest-mock .stat-grid dt { margin: 0; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-muted); white-space: nowrap; }
    #nest-mock .stat-grid dd { margin: 0; font-size: 12px; font-variant-numeric: tabular-nums; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #nest-mock .tools button { min-width: 0; }
    #nest-mock .tools button.wide { flex: 1.8; }
    #nest-mock .head .lbl { font-size: 9px; }
    #nest-mock .tools button span { font-size: 9px; letter-spacing: .04em; text-transform: uppercase; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #nest-mock .tools button kbd { position: absolute; top: 2px; left: 4px; font: 8px var(--font-mono); color: var(--ink-faint); }
    #nest-mock .tools button[aria-pressed="true"] kbd { color: var(--color-accent); }
    #nest-mock .note-link { color: var(--ink-muted); font-size: 9px; line-height: 1.2; text-decoration: none; }
    #nest-mock .note-link:hover { color: var(--ink); }
    #nest-mock .activity { margin: 0; padding: 0; list-style: none; min-height: 2.6em; font-size: 10px; color: var(--ink-muted); }
    #nest-mock .activity li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #nest-mock .activity li:first-child { color: var(--ink); }
    #nest-mock .activity li::before { content: "› "; color: var(--ink-faint); }
    @media (prefers-reduced-motion: reduce) { .nest-ant.walk .legs-a, .nest-ant.walk .legs-b, .nest-stray.walk .legs-a, .nest-stray.walk .legs-b, .nest-stray.running .legs-a, .nest-stray.running .legs-b, .nest-ant.wait svg, .nest-queen.bob, .nest-queen.crawling, .nest-queen.dancing, .nest-ant.swatted svg, .nest-splat, .nest-ant.dancing svg, .nest-ant.flash, .nest-hill.rising, #nest-mock.celebrating .well, #nest-mock.celebrating .nest-pre { animation: none; } }`;
  document.head.append(style);

  // ================================ the switch ================================
  // A tiny dot ant in the status bar is the only trace of the game. Clicking it starts a colony and
  // the Nest takes over the whole sidebar; the ant again, or the × in the panel, asks before
  // clearing the colony and handing the sidebar back.
  const bar = document.querySelector(".status-bar");
  if (!bar) return; // a page without the desk chrome has nowhere to put the launcher
  let antBtn = bar.querySelector(".nest-switch");
  if (!antBtn) {
    antBtn = document.createElement("button");
    antBtn.type = "button"; antBtn.className = "nest-switch"; antBtn.title = "Nest"; antBtn.setAttribute("aria-label", "Open the Nest");
    antBtn.setAttribute("aria-pressed", "false");
    antBtn.innerHTML = `<svg width="18" height="10" viewBox="0 0 22.4 12.8" fill="currentColor" aria-hidden="true">${[
      [0, 0], [1, 1], [1, 2], [1, 3], [2, 3], [3, 3], [5, 3], [6, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [0, 4], [1, 4], [2, 4], [3, 4], [5, 4], [6, 4], [7, 4],
      [9, 4], [10, 4], [11, 4], [12, 4], [13, 4], [1, 5], [2, 5], [3, 5], [5, 5], [6, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [5, 2], [4, 1], [9, 2], [10, 1],
      [7, 6], [8, 7], [2, 6], [1, 7]].map(([x, y]) => `<circle cx="${x * 1.6 + 0.8}" cy="${y * 1.6 + 0.8}" r="0.72"/>`).join("")}</svg>`;
    if (bar.querySelector(".status-bar__xray")) bar.insertBefore(antBtn, bar.querySelector(".status-bar__xray")); else bar.append(antBtn);
  }
  if (antBtn._nestLoader) { antBtn.removeEventListener("click", antBtn._nestLoader); delete antBtn._nestLoader; }
  let game = null;

  // A stray ant is the easter egg for a closed Nest. It walks the reading pane on its own, not on
  // a trail, and if someone clicks it the ant runs for the launcher and makes it pulse. One click
  // marks the tab, so the random ant does not come back until a new tab.
  let strayTimer = null, strayExitTimer = null, strayEl = null, strayLeaving = false;
  const STRAY_KEY = "nest-stray-clicked";
  const strayConsumed = () => { try { return sessionStorage.getItem(STRAY_KEY) === "1"; } catch { return false; } };
  const consumeStray = () => { try { sessionStorage.setItem(STRAY_KEY, "1"); } catch { /* private mode */ } };
  const strayReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The ant art is shared by the colony and the stray easter egg.
  const LEGS_A = [[5, 2], [4, 1], [9, 2], [10, 1], [7, 6], [8, 7], [2, 6], [1, 7]];
  const LEGS_B = [[7, 2], [8, 1], [3, 2], [2, 1], [5, 6], [4, 7], [10, 6], [11, 7]];
  const BODY = ["", "", "", ".xxx.xx.xxxxx.", "xxxx.xxx.xxxxx", ".xxx.xx.xxxxx."].flatMap((row, y) => [...row].map((k, x) => k === "x" ? [x, y] : null).filter(Boolean)).concat([[0, 0], [1, 1], [1, 2]]);
  const dots = (pts) => pts.map(([x, y]) => `<circle cx="${x * 1.6 + 0.8}" cy="${y * 1.6 + 0.8}" r="0.72"/>`).join("");
  const ANT_SVG = `<svg width="23" height="13" viewBox="0 0 22.4 12.8" fill="currentColor" aria-hidden="true">${dots(BODY)}<g class="legs-a">${dots(LEGS_A)}</g><g class="legs-b">${dots(LEGS_B)}</g></svg>`;
  // The soldier is the same animal with a wider head and two mandibles, in the flyer's quieter
  // colour. At a glance it should not read as another worker.
  const SOLDIER_SVG = `<svg width="23" height="13" viewBox="-2.4 0 24.8 12.8" fill="currentColor" aria-hidden="true">${dots(BODY)}${dots([[-1, 4], [-1.5, 3], [-1.5, 5], [-1, 2], [-1, 6]])}<g class="legs-a">${dots(LEGS_A)}</g><g class="legs-b">${dots(LEGS_B)}</g></svg>`;
  const launcherVisible = () => { const r = antBtn.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const cancelStray = () => {
    clearTimeout(strayTimer); clearTimeout(strayExitTimer);
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
    clearTimeout(strayExitTimer);
    strayLeaving = true;
    const from = el.getBoundingClientRect(), to = antBtn.getBoundingClientRect();
    if (!to.width || strayReduced()) {
      el.remove(); strayEl = null; strayLeaving = false; pulseLauncher(); scheduleStray(180000 + Math.random() * 120000); return;
    }
    // A run along the page, not a flight: down to the bottom of the reading pane, along the
    // status bar, then up into the launcher. The ant turns at each corner and keeps its legs.
    const start = [from.left + from.width / 2, from.top + from.height / 2];
    const target = [to.left + to.width / 2, to.top + to.height / 2];
    const bottomY = Math.min(main.getBoundingClientRect().bottom - 6, target[1] - 4);
    const path = [
      start,
      [start[0] + (Math.random() - 0.5) * 30, bottomY],
      [target[0], bottomY],
      target,
    ];
    el.style.position = "fixed"; el.style.margin = "0"; el.style.zIndex = "100";
    el.style.left = (start[0] - 11) + "px"; el.style.top = (start[1] - 6) + "px";
    el.classList.add("running");
    let seg = 0;
    const step = () => {
      if (!strayEl || game) return;
      const a = path[seg], b = path[seg + 1];
      const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const dur = Math.max(140, dist / 0.65), t0 = performance.now();
      const last = seg === path.length - 2;
      const frame = (now) => {
        if (!strayEl || game) return;
        const k = Math.min(1, (now - t0) / dur);
        const x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k;
        const bob = Math.sin(k * Math.PI * 6) * 0.8;
        el.style.left = (x - 11) + "px"; el.style.top = (y - 6 + bob) + "px";
        const scale = last ? 1 - k * 0.12 : 1;
        el.style.transform = `rotate(${Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI}rad) scale(${scale})`;
        if (last) el.style.opacity = String(0.7 * (1 - k * 0.75));
        if (k < 1) requestAnimationFrame(frame);
        else {
          seg++;
          if (seg < path.length - 1) step();
          else { el.remove(); strayEl = null; strayLeaving = false; pulseLauncher(); scheduleStray(180000 + Math.random() * 120000); }
        }
      };
      requestAnimationFrame(frame);
    };
    step();
  };
  const leaveStray = () => {
    if (!strayEl || strayLeaving) return;
    strayLeaving = true;
    clearTimeout(strayExitTimer);
    const el = strayEl;
    const sx = parseFloat(el.style.left) || 0;
    const tx = sx < main.clientWidth / 2 ? -30 : main.clientWidth + 30;
    const t0 = performance.now(), dur = 700;
    const frame = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      el.style.left = sx + (tx - sx) * k + "px";
      el.style.opacity = String(0.7 * (1 - k));
      if (k < 1) requestAnimationFrame(frame);
      else { el.remove(); strayEl = null; strayLeaving = false; scheduleStray(120000 + Math.random() * 120000); }
    };
    requestAnimationFrame(frame);
  };
  const spawnStray = (force = false) => {
    if (!force && (strayConsumed() || game || document.hidden || !launcherVisible() || strayEl)) return;
    if (force && (game || document.hidden || !launcherVisible() || strayEl)) return;
    const fromLeft = Math.random() < 0.5;
    const y = main.scrollTop + Math.max(80, main.clientHeight * (0.25 + Math.random() * 0.45));
    const startX = fromLeft ? -24 : main.clientWidth + 24;
    const endX = fromLeft ? main.clientWidth + 30 : -30;
    const endY = y + (Math.random() - 0.5) * 140;
    const el = document.createElement("button");
    el.type = "button"; el.className = "nest-stray walk"; el.innerHTML = ANT_SVG;
    el.setAttribute("aria-label", "A stray ant. Follow it to the Nest.");
    el.style.left = startX + "px"; el.style.top = y + "px";
    el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); runToLauncher(el); });
    main.append(el); strayEl = el; strayLeaving = false;
    clearTimeout(strayExitTimer);
    strayExitTimer = setTimeout(leaveStray, 14000 + Math.random() * 5000);
    const steps = 4 + Math.floor(Math.random() * 3), legs = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      legs.push([startX + (endX - startX) * t + (Math.random() - 0.5) * 24, y + (endY - y) * t + (Math.random() - 0.5) * 44]);
    }
    const walk = (i) => {
      if (!strayEl || game || strayLeaving) return;
      if (i >= legs.length) { clearTimeout(strayExitTimer); el.remove(); strayEl = null; scheduleStray(120000 + Math.random() * 120000); return; }
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
  document.querySelectorAll("[data-nest-start]").forEach((button) => {
    if (button._nestLoader) { button.removeEventListener("click", button._nestLoader); delete button._nestLoader; }
    button.addEventListener("click", () => { if (!game) openNest(); });
  });
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
    fast: '<path d="m4 5 7 7-7 7m7-14 7 7-7 7"/>',
    restore: '<path d="M4 10a8 8 0 1 1 1 8m-1-8V4m0 6h6"/>',
  };
  const icon = (name) => `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
  const toolHelp = {
    squash: "Click or tap ants to squash them. Stop them from destroying the page!",
    wipe: "Drag across a dotted trail to scatter its ants. Stop them from destroying the page!",
    read: "Links unlocked. The colony keeps running.",
  };
  const tool = (name, label, key, wide = false) => `<button type="button" class="${wide ? "wide" : ""}" data-tool="${name}" aria-label="${label}" title="${toolHelp[name]}" aria-pressed="false">${icon(name)}<span>${label}</span><kbd>${key}</kbd></button>`;
  const action = (key, glyph, label, help) => `<button type="button" data-k="${key}" aria-label="${label}" title="${help}">${icon(glyph)}</button>`;
  const gameAction = (key, glyph, text, label, help) => `<button type="button" data-k="${key}" aria-label="${label}" title="${help}">${icon(glyph)}<span data-label>${text}</span></button>`;
  panel.innerHTML = `
    <div class="head"><span class="lbl muted"><span>nest · colony 01</span></span><span class="lbl muted"><span data-k="status">waking</span></span>
      <button class="x" data-k="x" type="button" aria-label="Close the Nest" title="Close">×</button></div>
    <p class="muted tool-help" data-k="tool-help" aria-live="polite"></p>
    <div class="well"><pre class="nest-pre" role="img" aria-label="Side view of the ant nest"></pre></div>
    <div class="nest-foot">
      <ul class="log activity" data-k="log" aria-live="polite"></ul>
      <a class="note-link" href="/notes/the-site-has-ants" target="_blank" rel="noopener" title="The colony, explained">explained ↗</a>
    </div>
    <div class="nest-meters">
      <div class="nest-meter"><span class="lbl muted">page left</span><span class="lbl" data-k="holds-val">100%</span>
        <div class="nest-meter__bar" data-k="holds-bar" role="progressbar" aria-label="Page left" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><span class="fill" data-k="holds"></span><span class="rest" data-k="holds-rest"></span></div>
        <i class="hint"><span data-k="holds-hint">page still whole</span><span class="rival" data-k="rival-hint"></span></i></div>
      <div class="nest-meter"><span class="lbl muted">stores</span><span class="lbl" data-k="stores-val">0/12</span>
        <div class="nest-meter__bar" data-k="stores-bar" role="progressbar" aria-label="Stores" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="fill" data-k="stores"></span><span class="rest" data-k="stores-rest"></span></div>
        <i class="hint">builds mound builders</i></div>
      <div class="nest-meter"><span class="lbl muted">meals to egg</span><span class="lbl" data-k="bar-val">0/3</span>
        <div class="nest-meter__bar" data-k="bar-bar" role="progressbar" aria-label="Meals to the next egg" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="fill" data-k="bar"></span><span class="rest" data-k="bar-rest"></span></div>
        <i class="hint">three meals lay an egg</i></div>
      <div class="nest-meter"><span class="lbl muted">next worship</span><span class="lbl" data-k="worship-val">0/20</span>
        <div class="nest-meter__bar" data-k="worship-bar" role="progressbar" aria-label="Next worship" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="fill" data-k="worship"></span><span class="rest" data-k="worship-rest"></span></div>
        <i class="hint">the queen dances</i></div>
    </div>
    <dl class="stat-grid">
      <div title="Scouts find new food"><dt>scouts</dt><dd class="accent" data-k="scouts">0</dd></div>
      <div title="Workers carry letters"><dt>workers</dt><dd data-k="workers">0</dd></div>
      <div title="Soldiers guard the hill"><dt>soldiers</dt><dd data-k="soldiers">0</dd></div>
      <div title="Mini hills"><dt>hills</dt><dd class="accent" data-k="minis">0</dd></div>
      <div title="Flyers steal letters"><dt>flyers</dt><dd data-k="flyers">0</dd></div>
      <div title="Rival theft"><dt>rival</dt><dd class="rival" data-k="rivals">0</dd></div>
      <div title="Scent trails in use"><dt>trails</dt><dd data-k="trails">0</dd></div>
      <div title="Ants squashed"><dt>squashed</dt><dd data-k="squashed">0</dd></div>
      <div title="Letters stolen" style="grid-column: 1 / -1"><dt>larder</dt><dd class="accent" data-k="larder" style="text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">empty</dd></div>
    </dl>
    <div class="row tools" role="group" aria-label="Colony tools">
      ${tool("squash", "Squash", "1")}${tool("wipe", "Wipe", "2")}${gameAction("bait", "bait", "Bait", "Drop bait", "Place a crumb to lure nearby ants away.")}${gameAction("seal", "seal", "Seal", "Seal hills", "Seal every anthill for a few seconds.")}
    </div>
    <div class="row tools" role="group" aria-label="Page controls">
      ${tool("read", "Links", "3", true)}${action("sound", "muted", "Unmute", "Turn on colony sounds.")}${gameAction("speed", "fast", "1×", "Speed 1×", "Run the colony faster.")}${action("pause", "pause", "Pause", "Pause the colony.")}${action("restore", "restore", "Restore page", "Put stolen letters back and re-site the mounds while the colony keeps running.")}
    </div>

    <div class="confirm" data-k="confirm" role="alertdialog" aria-labelledby="nest-confirm-title" hidden>
      <p id="nest-confirm-title"><b data-k="confirm-title">Close the Nest?</b></p>
      <p class="muted" data-k="confirm-body">The colony is cleared and every stolen letter goes back where it was.</p>
      <div class="row"><button data-k="leave">clear and close</button><button data-k="stay" class="muted">keep playing</button></div>
    </div>
    <div class="confirm" data-k="reset-confirm" role="alertdialog" aria-labelledby="nest-reset-title" hidden>
      <p id="nest-reset-title"><b>Reset the page?</b></p>
      <p class="muted">The main mound moves to a new spot, every letter goes back, and the colony keeps its ants.</p>
      <div class="row"><button data-k="reset-go">reset the page</button><button data-k="reset-cancel" class="muted">keep playing</button></div>
    </div>`;
  aside.append(panel);
  const $ = (k) => panel.querySelector(`[data-k="${k}"]`);
  const setAction = (key, glyph, label, help) => {
    const button = $(key);
    const text = button.querySelector("[data-label]")?.textContent || "";
    button.innerHTML = icon(glyph) + (text ? `<span data-label>${text}</span>` : "");
    button.setAttribute("aria-label", label);
    button.title = help;
  };
  const pre = panel.querySelector(".nest-pre");
  const well = panel.querySelector(".well");
  const log = (msg) => { const li = document.createElement("li"); li.textContent = msg; $("log").prepend(li); while ($("log").children.length > 1) $("log").lastChild.remove(); };

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
  let nestCells = null, nestCols = 0, nestRows = 0;
  const buildNest = () => {
    nestCells = null;
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
  // A Braille cell stays in the DOM for the life of the nest. Redrawing only changes the cells
  // whose dots moved, so the panel no longer replaces a thousand nodes ten times a second.
  const buildNestCells = () => {
    nestCols = W / 2; nestRows = H / 4;
    nestCells = Array.from({ length: nestCols * nestRows });
    const frag = document.createDocumentFragment();
    for (let row = 0; row < nestRows; row++) {
      for (let col = 0; col < nestCols; col++) {
        const cell = document.createElement("b");
        cell.textContent = "\u2800";
        cell.dataset.tone = "";
        cell._ch = "\u2800";
        nestCells[row * nestCols + col] = cell;
        frag.append(cell);
      }
      frag.append("\n");
    }
    pre.replaceChildren(frag);
  };
  new ResizeObserver(buildNest).observe(well);

  // ================================ the page ================================
  let allowLeave = false;
  const onBeforeUnload = (e) => {
    if (allowLeave || state.over || stopped) return;
    e.preventDefault(); e.returnValue = "Leaving this page closes the colony.";
    return e.returnValue;
  };
  addEventListener("beforeunload", onBeforeUnload);
  const state = { ants: [], eggs: [], trails: [], larder: [], stolen: new Set(), openingTargets: [], squashed: 0, meals: 0, paused: false,
    over: false, stores: 0, built: 0, feedFlip: false, peak: 0, stolenTotal: 0, sound: false, speed: 1,
    env: null, envNext: 0, cache: null, scoutQueue: [],
    queen: { eat: 0, lay: 0 }, total: 0, party: null, partyIndex: 0, nextParty: TUNING.party[0], trailSerial: 0 };
  const trailCap = () => Math.min(12, Math.max(LINE, Math.ceil(state.ants.length / 3)));
  const rival = { active: false, mound: null, trails: [], ants: [], minis: [], stolen: new Set(), returnAt: 0, hp: 8 };
  if (getComputedStyle(main).position === "static") main.style.position = "relative";
  const layer = document.createElement("div"); layer.className = "nest-layer"; main.append(layer);
  // the layer covers the page exactly and clips what crosses its edge, so nothing scrolls sideways
  const fitLayer = () => { layer.style.height = "0"; layer.style.height = main.scrollHeight + "px"; };
  fitLayer(); new ResizeObserver(fitLayer).observe(main);
  const scent = document.createElementNS("http://www.w3.org/2000/svg", "svg"); scent.classList.add("nest-scent"); layer.append(scent);
  let frameRect = null;
  const pageRect = () => frameRect || main.getBoundingClientRect();
  const local = (r, m = pageRect()) => [r.left - m.left + main.scrollLeft, r.top - m.top + main.scrollTop];

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
  const onScreen = (r, m = pageRect()) => r.width > 0 && r.top > m.top + 10 && r.bottom < m.bottom - 10;
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
  const findHomeSpot = (avoid) => {
    const rects = [];
    for (const n of textNodes(main)) { if (!/\S/.test(n.data)) continue; const r = document.createRange(); r.selectNodeContents(n); for (const c of r.getClientRects()) { const [x, y] = local(c); rects.push([x, y, x + c.width, y + c.height]); } }
    main.querySelectorAll("img, svg, pre, button, input, textarea, figure, hr").forEach((el) => { if (layer.contains(el)) return; const c = el.getBoundingClientRect(); if (c.width) { const [x, y] = local(c); rects.push([x, y, x + c.width, y + c.height]); } });
    const w = hr.width, h = hr.height, pad = 14;
    const collect = (top, bottom) => {
      let spots = [];
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
    // The hill opens where the player already is, in a random empty cell of the visible page.
    // The old roomiest-spot rule kept choosing the same big top-right gap.
    let top = main.scrollTop, bottom = top + main.clientHeight;
    let spots = collect(top, bottom);
    if (!spots.length) { top = 0; bottom = main.scrollHeight; spots = collect(top, bottom); }
    if (!spots.length) return [main.clientWidth * 0.5, main.scrollTop + main.clientHeight * 0.5];
    const clear = spots.filter((p) => p[2] >= 18);
    const pool = clear.length ? clear : spots;
    const away = avoid ? pool.filter((p) => Math.hypot(p[0] - avoid[0], p[1] - avoid[1]) > 90) : pool;
    const use = away.length ? away : pool;
    const cells = new Map();
    for (const p of use) {
      const col = Math.min(2, Math.max(0, Math.floor((p[0] / main.clientWidth) * 3)));
      const row = Math.min(2, Math.max(0, Math.floor(((p[1] - top) / (bottom - top)) * 3)));
      const key = `${col},${row}`;
      if (!cells.has(key)) cells.set(key, []);
      cells.get(key).push(p);
    }
    const keys = [...cells.keys()];
    const cell = cells.get(keys[Math.floor(Math.random() * keys.length)]);
    return cell[Math.floor(Math.random() * cell.length)];
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
    if (state.party) return;
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
  home.el.classList.add("rising");
  setTimeout(() => home.el?.classList.remove("rising"), 900);
  const hillOf = (ant) => ant.trail?.hill || ant.hill || home;

  // A trail feeds from a patch, the letters within PATCH pixels of where its scout found food, so
  // the ants on it visibly work one small area of the page.
  const PATCH = 70;
  // A bigger colony can keep a longer, wider patch alive. This is what lets a busy trail at
  // the far end of the page keep finding letters instead of dying at its first small clump.
  const patchRadius = () => Math.min(170, PATCH + Math.max(0, state.ants.length - 8) * 6);
  const inPatch = (r, c) => { const m = pageRect(); return Math.hypot(r.left + r.width / 2 - (c[0] - main.scrollLeft + m.left), r.top + r.height / 2 - (c[1] - main.scrollTop + m.top)) <= patchRadius(); };
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


  const newAnt = (role, route, d) => { state.total++; const a = { id: state.total, role, where: "nest", route, d }; state.ants.push(a); return a; };
  const scoutsOut = () => state.ants.some((a) => a.role === "scout");
  const scoutCount = () => state.ants.filter((a) => a.role === "scout").length;
  // A big letter that is still short of its crew is the one trail that must not wait its turn.
  // The helper is aimed at that exact letter, and helpers already walking are counted, so the
  // colony sends only the missing crew instead of piling every worker onto the patch.
  const helpLetterFor = (t) => {
    if (t.side || !t.ready || t.state === "gone") return null;
    for (const a of t.ants) {
      const L = a.letter;
      if (!L || L.state !== "gather" || L.need <= L.crew.length) continue;
      const inFlight = state.ants.filter((x) => x.helpLetter === L).length;
      if (L.crew.length + inFlight < L.need) return L;
    }
    return null;
  };
  const needsHelp = (t) => !!helpLetterFor(t);

  // Workers leaving the nest take the ready trails in turn, skipping any that are full or worked
  // out, so every trail fills at the same pace and a finished trail's ants move to the others.
  const openTrail = () => {
    const cap = trailCap();
    const ready = state.trails.filter((t) => !t.side && t.ready && t.state !== "gone" && t.ants.size < cap && remaining(t));
    if (!ready.length) return null;
    const help = ready.filter(needsHelp);
    const pool = help.length ? help : ready;
    state.rr = ((state.rr || 0) + 1) % pool.length;
    return pool[state.rr];
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
    if (t.side === "rival") { retireRivalTrail(t); return; }
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
    const a = newAnt("scout", "hatch", 0); label(a);
    log("a trail fades; a scout hatches");
  };

  // A worker at the top of the tunnel decides whether to go out: follow a trail with room on it,
  // scout if nobody is scouting, or wait in the tunnel.
  const atEntrance = (ant) => {
    if (state.over || hills.every(isSealed)) { ant.d = LEN[ant.route] - 0.01 - 0.025 * waitingRank(ant); return; } // nowhere to go out
    if (ant.role === "scout") return emerge(ant);
    if (ant.role === "soldier") {
      const ready = state.trails.filter((t) => !t.side && t.ready && t.state !== "gone");
      if (ready.length) { ant.lane = ((ant.id % 5) - 2) * 8; ant.patrol = ready[Math.floor(Math.random() * ready.length)]; return emerge(ant); }
      ant.d = LEN[ant.route] - 0.01 - 0.025 * waitingRank(ant); return;
    }
    let help = null;
    for (const trail of state.trails) {
      const L = helpLetterFor(trail);
      if (L) { help = { trail, L }; break; }
    }
    if (help) { join(ant, help.trail); ant.helpLetter = help.L; return emerge(ant); }
    // One trail for every two ants. A scout already looking for a patch counts toward the
    // target, so the colony can raise several lines at once instead of filling one line first.
    const wantTrails = Math.max(2, Math.round(state.ants.length / 2));
    const mainTrails = state.trails.filter((t) => !t.side).length;
    if (mainTrails + scoutCount() < wantTrails) {
      if (ant.trail) { ant.trail.ants.delete(ant); ant.trail = null; }
      ant.role = "scout"; log("a worker turned scout"); return emerge(ant);
    }
    const t = openTrail(ant);
    if (t) { join(ant, t); return emerge(ant); }
    if (ant.trail) { ant.trail.ants.delete(ant); ant.trail = null; }
    ant.d = LEN[ant.route] - 0.01 - 0.025 * waitingRank(ant); // queue in the tunnel
  };
  const waitingRank = (ant) => state.ants.filter((a) => a.where === "nest" && a.route === "up" && a.d > LEN.up - 0.3 && a.id < ant.id).length;

  const antTransform = (a) => `translate3d(${a.px}px, ${a.py}px, 0) rotate(${a.heading + Math.PI}rad)`;
  const placeAnt = (a) => {
    a.el.style.left = "0px"; a.el.style.top = "0px";
    a.el.style.transform = antTransform(a);
    a.el._px = a.px; a.el._py = a.py; a.el._heading = a.heading; a.el._walk = true;
  };
  const emerge = (ant) => {
    const open = hills.filter((h) => !isSealed(h)); ant.hill = open[Math.floor(Math.random() * open.length)] || home;
    const hole = ant.hill.hole;
    ant.where = "page"; ant.x = hole[0]; ant.y = hole[1]; ant.heading = -Math.PI / 2; ant.px = ant.x; ant.py = ant.y;
    ant.el = document.createElement("button"); ant.el.type = "button";
    ant.el.className = "nest-ant walk"; ant.el.innerHTML = ant.role === "soldier" ? SOLDIER_SVG : ANT_SVG;
    ant.el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); swarm(ant); });
    layer.append(ant.el); placeAnt(ant);
    if (ant.role === "scout") { ant.job = "scout-pending"; state.scoutQueue.push(ant); return; }
    else if (ant.role === "soldier") { ant.lane = ant.lane || ((ant.id % 5) - 2) * 8; ant.patrolLaps = 0; ant.job = "patrol"; ant.path = lanePath(ant.patrol.pts, ant.lane); ant.k = 0; ant.hp = ant.hp || 2; }
    else if (ant.trail && ant.trail.state !== "gone") { ant.job = "follow"; ant.path = lanePath(ant.trail.pts, ant.lane || 0); ant.k = 0; }
    else { ant.job = "home"; ant.path = [hole.slice()]; ant.k = 0; }
    label(ant);
  };
  const label = (ant) => { if (!ant.el) return; ant.el.inert = state.tool === "wipe"; ant.el.classList.toggle("scout", ant.role === "scout"); ant.el.classList.toggle("soldier", ant.role === "soldier" || ant.role === "guard"); ant.el.classList.toggle("builder", ant.role === "builder"); ant.el.setAttribute("aria-label", `${{ scout: "Scout", soldier: "Soldier", worker: "Worker", guard: "Guard", flyer: "Flying", builder: "Builder", rival: "Rival" }[ant.role]} ant. Press to squash.`); };

  // A scout wanders: loose waypoints toward a block of text no trail reaches yet, its steps recorded.
  const remaining = (t) => {
    if (!t || t.state === "gone") return false;
    const now = performance.now();
    if (t.ttl && now / 1000 > t.ttl) return false;
    // The step and every worker at the entrance ask this. A short cache keeps the text and rect
    // scan off the hot path; a trail may linger for at most this long after its last letter.
    if (t.remainAt && now - t.remainAt < 600) return t.remainValue;
    t.remainAt = now;
    for (const n of textNodes(t.block)) for (let i = 0; i < n.data.length; i++) {
      if (!/\S/.test(n.data[i])) continue;
      const L = letterOf(n, i); if (L.state === "stolen") continue;
      if (inPatch(rectOf(n, i), t.end)) { t.remainValue = true; return true; }
    }
    t.remainValue = false;
    return false;
  };

  const scout = (ant) => {
    const hole = hillOf(ant).hole;
    const opening = state.openingTargets.length < 3;
    const firstOpening = state.openingTargets.length === 0;
    // A block that already has a trail or a scout walking to it is taken. This is what keeps the
    // first three scouts off one paragraph, and later scouts off an active source.
    const busyBlocks = new Set([
      ...state.trails.map((t) => t.block),
      ...state.ants.filter((a) => (a.job === "scout" || a.scoutRoute) && a.block).map((a) => a.block),
    ]);
    const options = [];
    for (const n of textNodes(main)) for (let i = 0; i < n.data.length; i += 3) {
      if (!/\S/.test(n.data[i]) || letterOf(n, i).state !== "free") continue;
      const r = rectOf(n, i); if (!r.width) continue;
      if (busyBlocks.has(blockOf(n))) continue;
      const [x, y] = local(r);
      if (opening && !onScreen(r)) continue;
      if (state.trails.some((t) => Math.hypot(t.end[0] - x, t.end[1] - y) < patchRadius() * 2)) continue;
      options.push([n, x + r.width / 2, y + r.height]);
    }
    if (!options.length) {
      // The opening hint can miss on a page with a wide empty margin. Fall back to any free
      // block before turning the scout around, or the colony can loop forever.
      const free = [];
      for (const n of textNodes(main)) for (let i = 0; i < n.data.length; i += 3) {
        if (!/\S/.test(n.data[i]) || letterOf(n, i).state !== "free") continue;
        const r = rectOf(n, i); if (!r.width) continue;
        const [x, y] = local(r);
        free.push([n, x + r.width / 2, y + r.height]);
      }
      const open = free.filter((o) => !busyBlocks.has(blockOf(o[0])));
      options.push(...(open.length ? open : free));
    }
    if (!options.length) { ant.role = "worker"; ant.job = "home"; ant.path = [hole.slice()]; ant.k = 0; return; }
    if (state.cache) {
      const nearCache = options.filter((o) => Math.hypot(o[1] - state.cache.x, o[2] - state.cache.y) < 340);
      if (nearCache.length) options.splice(0, options.length, ...nearCache);
    }
    const distToHole = (o) => Math.hypot(o[1] - hole[0], o[2] - hole[1]);
    const spread = (o) => Math.min(...state.openingTargets.map(([px, py]) => Math.hypot(o[1] - px, o[2] - py)));
    const moundSide = hole[0] > main.clientWidth / 2 ? 1 : -1;
    // Stay near the mound while there is still food here. The old second and third scouts were
    // deliberately opposite or spread out, which sent trails across the page past a full table.
    const near = options.filter((o) => distToHole(o) < 400);
    const close = near.length ? near : options;
    const opposite = close.filter((o) => (o[1] - hole[0]) * moundSide < 0);
    const pick = firstOpening
      ? close.reduce((best, o) => (distToHole(o) < distToHole(best) ? o : best), close[0])
      : state.openingTargets.length === 1
        ? (opposite.length ? opposite : close).reduce((best, o) => (distToHole(o) > distToHole(best) ? o : best), (opposite.length ? opposite : close)[0])
        : state.openingTargets.length === 2
          ? close.reduce((best, o) => (spread(o) > spread(best) ? o : best), close[0])
          : close.reduce((best, o) => (distToHole(o) < distToHole(best) ? o : best), close[0]);
    const [node, tx, ty] = pick;
    const block = blockOf(node);
    if (state.openingTargets.length < 3) state.openingTargets.push([tx, ty]);
    // One soft C or S through two random control points, with a little walk in the line. The
    // three-wave version read like a graph, and one symmetric bow read like a straight line.
    const dx = tx - hole[0], dy = ty - hole[1], dist = Math.hypot(dx, dy) || 1;
    const nx = -dy / dist, ny = dx / dist;
    const amp = Math.min(54, Math.max(11, dist * 0.23));
    const side = Math.random() < 0.5 ? -1 : 1;
    const c1 = amp * (0.6 + Math.random() * 0.8) * side;
    const c2 = amp * (0.25 + Math.random() * 0.75) * (Math.random() < 0.28 ? -side : side);
    const p0 = [hole[0], hole[1]];
    const p1 = [hole[0] + dx * 0.3 + nx * c1, hole[1] + dy * 0.3 + ny * c1];
    const p2 = [hole[0] + dx * 0.7 + nx * c2, hole[1] + dy * 0.7 + ny * c2];
    const p3 = [tx, ty];
    const phase = Math.random() * Math.PI * 2;
    let jag = 0;
    const path = [];
    for (let s = 0; s <= 28; s++) {
      const k = s / 28, u = 1 - k;
      const bx = u * u * u * p0[0] + 3 * u * u * k * p1[0] + 3 * u * k * k * p2[0] + k * k * k * p3[0];
      const by = u * u * u * p0[1] + 3 * u * u * k * p1[1] + 3 * u * k * k * p2[1] + k * k * k * p3[1];
      jag = jag * 0.58 + (Math.random() - 0.5) * 5.2;
      const wobble = (Math.sin(k * 5.2 + phase) * 0.6 + jag) * Math.sin(Math.PI * k);
      path.push([bx + nx * wobble, by + ny * wobble]);
    }
    ant.job = "scout"; ant.block = block; ant.path = chaikin(path, 1); ant.k = 0; ant.walked = [hole.slice()];
  };

  const routePts = (ant) => (ant.trail ? ant.trail.pts : ant.scoutRoute ? ant.scoutRoute.pts : null);
  const backPath = (ant) => (routePts(ant) ? lanePath(routePts(ant).toReversed(), -(ant.lane || 0)) : []).concat([hillOf(ant).hole.slice()]);
  const goHome = (ant) => { ant.job = "home"; ant.path = backPath(ant); ant.k = 0; ant.letter = null; ant.helpLetter = null; ant.scoutRoute = null; ant.el?.classList.remove("wait"); };
  // A big letter can outlive its trail. If the scent is wiped or aged out while a worker is
  // waiting on the letter, put the worker back on the page and free the letter instead of
  // leaving a `wait` job with no route and no trail.
  const abandonGather = (ant) => {
    const L = ant.letter;
    if (ant.trail) { ant.trail.ants.delete(ant); ant.trail = null; }
    if (L) {
      L.crew = L.crew.filter((a) => a !== ant);
      if (!L.crew.length) L.state = "free";
    }
    ant.letter = null;
    ant.el?.classList.remove("wait");
    goHome(ant);
  };

  // A light first letter is carried home before the trail opens; a scout killed on the way leaves
  // nothing for the workers to join. A heavy letter opens the trail at the pickup and calls a
  // crew, because one scout cannot lift it and a trail-less wait would stall the colony.
  // Trails that leave the same hill close together share their first stretch. Snapping the
  // nearby early points onto an existing line turns a pile of near-parallel curves into one
  // trunk, then lets the new branch peel off where it actually diverges.
  const mergeRoute = (pts, block, trails = state.trails) => {
    const cross = (a, b, c, d) => {
      const rx = b[0] - a[0], ry = b[1] - a[1], sx = d[0] - c[0], sy = d[1] - c[1];
      const den = rx * sy - ry * sx; if (!den) return null;
      const t = ((c[0] - a[0]) * sy - (c[1] - a[1]) * sx) / den;
      const u = ((c[0] - a[0]) * ry - (c[1] - a[1]) * rx) / den;
      return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [a[0] + t * rx, a[1] + t * ry] : null;
    };
    let best = null;
    for (const t of trails) {
      if (t.state === "gone" || t.block === block) continue;
      for (let i = 1; i < pts.length; i++) for (let j = 1; j < t.pts.length; j++) {
        const hit = cross(pts[i - 1], pts[i], t.pts[j - 1], t.pts[j]);
        if (hit && (!best || i < best.i)) best = { i, j, hit, t };
      }
    }
    if (best) {
      const trunk = best.t.pts.slice(0, best.j + 1);
      const merged = [...trunk, best.hit, ...pts.slice(best.i + 1)];
      const clean = [];
      for (const p of merged) if (!clean.length || Math.hypot(p[0] - clean[clean.length - 1][0], p[1] - clean[clean.length - 1][1]) > 4) clean.push(p);
      return chaikin(clean, 1);
    }
    return pts;
  };

  const layTrail = (ant, copy = "the scout is home; a trail is laid") => {
    const route = ant.scoutRoute; if (!route) return null;
    const merged = mergeRoute(route.pts, route.block, state.trails.filter((t) => !t.side));
    const points = merged.map((p) => p.join(",")).join(" ");
    const halo = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    halo.setAttribute("points", points); halo.classList.add("halo");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("points", points);
    const born = performance.now() / 1000;
    const t = { pts: merged, block: route.block, end: route.end, ants: new Set(), line, halo, ready: true, hill: route.hill,
      state: "ready", born, ttl: born + TUNING.trailTtl };
    scent.append(halo, line);
    line.style.opacity = "0"; halo.style.opacity = "0";
    requestAnimationFrame(() => { line.style.opacity = ""; halo.style.opacity = ""; });
    addEraser(t);
    state.trails.push(t);
    ant.scoutRoute = null;
    log(copy);
    chord([392, 523], 0.18, 0.03);
    return t;
  };

  const toLetter = (ant, block, light) => {
    if (!block) return goHome(ant);
    const preferred = ant.helpLetter;
    ant.helpLetter = null;
    if (preferred && preferred.state === "gather" && preferred.crew.length < preferred.need) {
      preferred.crew.push(ant); ant.letter = preferred; ant.job = "toLetter";
      const r = rectOf(preferred.n, preferred.i); const [x, y] = local(r);
      const k = preferred.crew.length - 1, spread = (k - (preferred.need - 1) / 2) * 12;
      ant.path = [[x + r.width / 2 + spread, y + r.height]]; ant.k = 0; return;
    }
    const all = freeIn(block, ant.trail ? ant.trail.end : ant.scoutRoute ? ant.scoutRoute.end : [ant.x, ant.y]);
    // a scout alone takes a letter it can lift alone, when the patch has one
    const pick = (light && all.find((f) => f.L.state === "free" && needOf(f.L.n) === 1)) || all[0];
    if (!pick) return goHome(ant);
    const L = pick.L;
    if (L.state === "free") { L.need = needOf(L.n); L.state = "gather"; L.crew = []; }
    L.crew.push(ant); ant.letter = L; ant.job = "toLetter";
    // A light letter can be carried alone, so the scout takes it home before the trail opens.
    // A heavy letter cannot, and that is the case that used to stall: the scout stood at the
    // letter waiting for a crew that had no trail to follow. Only the heavy pickup opens the
    // trail early, and the call for help goes out with it.
    if (light && ant.scoutRoute && needOf(L.n) > 1) {
      const t = layTrail(ant, "the scout calls for help; a trail is laid");
      if (t) join(ant, t);
    }
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

  // A click on a pile takes the whole pile. The top ant is not the only one under the finger.
  const swarm = (ant) => {
    if (!ant || ant.dead) return;
    const pile = state.ants.filter((a) => a !== ant && a.el && !a.dead && Math.hypot(a.x - ant.x, a.y - ant.y) < 18);
    squash(ant);
    pile.forEach((a) => squash(a));
  };
  const squash = (ant) => {
    if (state.tool !== "squash" || state.over || state.overrun || ant.dead || ant.job === "dance") return;
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

  const enterNest = (ant, carrying, meal = 1) => {
    ant.el?.remove(); ant.el = null; ant.where = "nest"; ant.route = "down"; ant.d = 0; ant.food = carrying || null; ant.meal = meal; ant.letter = null;
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

  const PATROL_LAPS = 4; // two full out-and-back passes before a guard visits its mound
  const patrolMound = (ant) => (ant.mini && minis.includes(ant.mini) ? ant.mini : home);
  const patrolCircle = (ant) => {
    const m = patrolMound(ant);
    const c = m.spot ? [m.spot.x, m.spot.y - 6] : [m.hole[0], m.hole[1]];
    return Array.from({ length: 9 }, (_, k) => {
      const a = (k / 8) * Math.PI * 2;
      return [c[0] + Math.cos(a) * 28, c[1] + Math.sin(a) * 16];
    });
  };

  const stepPage = (ant, dt) => {
    if (ant.tongue || ant.job === "scout-pending") return;
    ant.px = ant.x; ant.py = ant.y;
    if (ant.job === "dance") return; // the party moves its own dancers
    if (ant.job === "wait") {
      if (!ant.letter || ant.letter.state !== "gather") { ant.el?.classList.remove("wait"); goHome(ant); return; }
      if (!ant.trail || ant.trail.state === "gone" || !state.trails.includes(ant.trail)) { abandonGather(ant); return; }
    }
    if (ant.job === "crew") return; // crew members are placed by their leader
    if (ant.job === "baited") return;
    if (ant.job === "fly") return stepFlyer(ant, dt);
    if (ant.job === "sweet-walk" || ant.job === "sweet-eat") return stepSweetAnt(ant, dt);
    if (ant.job === "build-walk" || ant.job === "building" || ant.job === "mini-home") return stepMiniJob(ant, dt);
    if (ant.job === "rival-siege" || ant.job === "rival-contest") return stepRivalDefense(ant, dt);
    if ((ant.job === "defend" || ant.job === "guard") && ant.defendUntil && performance.now() > ant.defendUntil) {
      ant.defendUntil = 0;
      if (ant.mini && minis.includes(ant.mini)) {
        if (ant.patrol && state.trails.includes(ant.patrol)) assignGuard(ant, ant.patrol);
        else { ant.job = "mini-home"; ant.path = [ant.mini.hole.slice()]; ant.k = 0; }
      } else { ant.job = "guard"; ant.path = []; }
      return;
    }
    if (ant.job === "defend") { // a clicked mound calls its guards home
      const g = ant.path[ant.k];
      if (!g) { ant.job = "guard"; ant.path = []; return; }
      if (move(ant, g[0], g[1], dt, SPEED * 0.9)) {
        ant.px = ant.x; ant.py = ant.y;
        if (++ant.k >= ant.path.length) { ant.job = "guard"; ant.path = []; }
      } else { ant.px = ant.x; ant.py = ant.y; }
      return;
    }
    if (ant.job === "patrol-return") {
      const g = ant.path[ant.k];
      if (!g) { ant.job = "patrol-circle"; ant.path = patrolCircle(ant); ant.k = 0; return; }
      if (move(ant, g[0], g[1], dt, SPEED * 0.9)) {
        ant.px = ant.x; ant.py = ant.y;
        if (++ant.k >= ant.path.length) { ant.job = "patrol-circle"; ant.path = patrolCircle(ant); ant.k = 0; }
      } else { ant.px = ant.x; ant.py = ant.y; }
      return;
    }
    if (ant.job === "patrol-circle") {
      const g = ant.path[ant.k];
      if (!g) { ant.job = "patrol"; ant.path = []; ant.k = 0; return; }
      if (move(ant, g[0], g[1], dt, SPEED * 0.8)) {
        ant.px = ant.x; ant.py = ant.y;
        if (++ant.k >= ant.path.length) {
          ant.patrolLaps = 0;
          const t = ant.patrol;
          if (t && state.trails.includes(t)) { ant.job = "patrol"; ant.path = lanePath(t.pts, ant.lane || 0); ant.k = 0; }
          else if (ant.mini && minis.includes(ant.mini)) { ant.job = "mini-home"; ant.path = [ant.mini.hole.slice()]; ant.k = 0; }
          else { ant.job = "home"; ant.path = [hillOf(ant).hole.slice()]; ant.k = 0; }
        }
      } else { ant.px = ant.x; ant.py = ant.y; }
      return;
    }
    if (ant.job === "patrol") { // soldiers and guards walk their trail out and back, guarding it
      if (ant.circling && state.trails.some((trail) => trail.ready && trail.state !== "gone")) return assignGuard(ant);
      if (!ant.circling && !state.trails.includes(ant.patrol)) {
        if (ant.mini && minis.includes(ant.mini)) { ant.retired = true; ant.job = "mini-home"; ant.path = [ant.mini.hole.slice()]; ant.k = 0; }
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
      if (move(ant, g[0], g[1], dt, SPEED * 0.8)) {
        if (++ant.k >= ant.path.length) {
          ant.patrolLaps = (ant.patrolLaps || 0) + 1;
          if (ant.patrolLaps >= PATROL_LAPS) {
            const m = patrolMound(ant);
            ant.job = "patrol-return"; ant.path = [m.hole.slice()]; ant.k = 0;
          } else { ant.path = ant.path.toReversed(); ant.k = 0; }
        }
      }
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
      if (ant.scoutRoute) layTrail(ant);
      if (ant.role === "scout") { ant.role = "worker"; }
      if (ant.role === "flyer") { state.stores += L.need; ant.letter = null; ant.job = "fly"; ant.path = [randomPoint()]; ant.k = 0; return; } // flyers feed the stores and fly on
      L.crew.forEach((a) => { if (a !== ant && a.el) enterNest(a, null); });
      return enterNest(ant, L.ch, L.need);
    }
    if (!move(ant, goal[0], goal[1], dt, ant.job === "scout" ? SPEED * 1.35 : SPEED)) {
      if (ant.job === "scout" && Math.hypot(ant.x - ant.walked[ant.walked.length - 1][0], ant.y - ant.walked[ant.walked.length - 1][1]) > 14) ant.walked.push([ant.x, ant.y]);
      ant.px = ant.x; ant.py = ant.y; return;
    }
    ant.px = ant.x; ant.py = ant.y;
    if (++ant.k < ant.path.length) return;
    if (ant.job === "scatter") return regroup(ant);
    if (ant.job === "scout") { // found food: keep the walk as a route until a letter is home
      ant.walked.push([ant.x, ant.y]);
      const pts = chaikin(ant.walked, 1);
      ant.scoutRoute = { pts, block: ant.block, end: [ant.x, ant.y], hill: hillOf(ant) };
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
      // A light letter is one portion. A heading that needed two or three ants is worth that many
      // portions, split half to the stores and half to the queen in the same alternating order.
      if (ant.food) {
        const portions = Math.max(1, ant.meal || 1);
        for (let k = 0; k < portions; k++) {
          if ((state.feedFlip = !state.feedFlip) && !state.queenDead) state.stores++;
          else {
            state.meals++; state.queen.eat = 0.8;
            if (state.meals % 3 === 0 && !state.queenDead) { state.queen.lay = 1; setTimeout(() => { state.eggs.push({ d: 0, age: 0 }); log("the queen laid an egg"); blip(660, 0.06, "sine", 0.04); }, 900); }
          }
        }
        state.larder.shift();
      }
      ant.food = null; ant.meal = 1; ant.route = "up"; ant.d = 0; return;
    }
    if (ant.route === "up") atEntrance(ant);
  };

  // ================================ the round ================================
  // There is no win and no reserve. If the last ant is gone the queen sends one scout back out
  // and the colony carries on. The only ending left is the page itself running out.
  const checkWipe = () => {
    if (state.over || state.ants.length || state.eggs.length || minis.length || state.builder) return;
    newAnt("scout", "hatch", 0);
    log("the queen sends out a scout"); blip(330, 0.08, "sine");
  };
  // A missing scout is a gap, not an ending. The queen sends one whenever nobody is scouting, so
  // a killed scout cannot leave the colony with no way to find a new trail.
  const ensureScout = () => {
    if (state.over || state.overrun || state.queenDead || state.party) return;
    if (state.ants.some((a) => a.role === "scout" || a.job === "scout")) return;
    if (state.builder) return;
    newAnt("scout", "hatch", 0);
    log("the queen sends out a scout");
  };
  // ================================ the dance ================================
  // The colony does not wait for the page to empty. Every few letters it stops, the queen comes
  // out of the hill, and the workers circle her. Then they go back to work. The thresholds rise
  // because a colony that danced every twenty letters forever would be a metronome, not a colony.
  // The queen is the same dot animal as the sidepanel, not a separate card. She leaves the nest
  // for a stage outside the hill; the sidepanel queen disappears while she is out.
  // A clear patch of page near the home mound: below it first, then to either side. The queen
  // should walk into open ground, not through a line of prose.
  const stageSpot = () => {
    const terrain = miniTerrain(true);
    const hb = home.el.getBoundingClientRect(); const m = main.getBoundingClientRect();
    const hx = hb.left - m.left + main.scrollLeft, hy = hb.top - m.top + main.scrollTop;
    const own = [hx, hy, hx + hb.width, hy + hb.height];
    const obstacles = terrain.obstacles.filter((r) => !(r[0] < own[2] && r[2] > own[0] && r[1] < own[3] && r[3] > own[1]));
    const baseX = hx + hb.width / 2;
    const baseY = hy + hb.height;
    const fallback = { x: baseX, y: Math.min(main.scrollHeight - 30, baseY + 26) };
    for (const [dx, dy] of [[0, 26], [0, 54], [hb.width / 2 + 34, 18], [-hb.width / 2 - 34, 18], [hb.width / 2 + 46, 44], [-hb.width / 2 - 46, 44]]) {
      const x = baseX + dx, y = Math.min(main.scrollHeight - 30, baseY + dy);
      const box = [x - 54, y - 38, x + 54, y + 44];
      if (box[0] < 4 || box[2] > main.clientWidth - 4 || box[1] < 0 || box[3] > main.scrollHeight) continue;
      if (overlaps(box, own)) continue;
      if (!obstacles.some((r) => overlaps(box, r))) return { x, y };
    }
    return fallback;
  };
  // The current milestone is fixed. It does not move while the colony hatches, so the bar can
  // actually reach it; only the dance that completes it raises the next target.
  const worshipTarget = () => Math.max(8, state.nextParty);

  // A little queen walks up out of the panel nest for the start of the dance, and back down at
  // the end. The page queen does the long walk to the stage in between.
  const panelQueen = (descend = false) => {
    const q = document.createElement("div");
    q.className = "nest-queen panel-queen";
    q.innerHTML = queenMarkup();
    q.style.left = `${QUEEN[0] * well.clientWidth}px`;
    q.style.top = `${QUEEN[1] * well.clientHeight}px`;
    well.append(q);
    const frames = descend
      ? [{ transform: "translate(-50%, -240%) scale(.7)", opacity: 0 },
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 }]
      : [{ transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        { transform: "translate(-50%, -240%) scale(.7)", opacity: 0 }];
    q.animate(frames, { duration: 1200, easing: "ease-in-out" }).onfinish = () => q.remove();
  };
  const queenMarkup = () => "<pre class='queen-braille' aria-hidden='true'>⢀⣀⣀⡀\n⣿⣿⣿⣿\n⠶⠶⠶⠶</pre>";
  const startParty = (final = false) => {
    if (state.party || state.queenDead) return;
    const now = performance.now();
    const mound = home;
    const stage = stageSpot();
    const queen = document.createElement("div"); queen.className = "nest-queen bob crawling"; queen.innerHTML = queenMarkup();
    queen.style.left = mound.hole[0] + "px"; queen.style.top = (mound.hole[1] - 8) + "px";
    layer.append(queen);
    requestAnimationFrame(() => { queen.style.left = stage.x + "px"; queen.style.top = stage.y + "px"; });
    setTimeout(() => { queen.classList.remove("crawling"); queen.classList.add("dancing"); }, 1200);
    panel.classList.add("celebrating");
    scent.style.opacity = "0";
    panelQueen();
    hills.forEach((h) => { h.el.style.pointerEvents = "none"; });
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
    const until = now + (final ? 16000 : 9000);
    state.party = { start: now, until, returnAt: until - 1400, final, queen, dancers, glyphs, stage, returning: false,
      queenFrom: mound.hole.slice() };
    state.queen.lay = 0;
    log(final ? "the colony takes the page" : "the colony dances");
    melody();
  };
  const stepParty = (now, dt) => {
    const p = state.party; if (!p) return;
    const t = now / 1000;
    if (!p.returning && now >= p.returnAt) {
      p.returning = true;
      p.queen.style.left = p.queenFrom[0] + "px";
      p.queen.style.top = (p.queenFrom[1] - 8) + "px";
      p.queen.classList.remove("dancing");
      p.queen.classList.add("crawling");
    }
    p.dancers.forEach((a) => {
      if (!a.el) return;
      const angle = a.party.angle + t * 0.9;
      move(a, p.stage.x + Math.cos(angle) * a.party.radius, p.stage.y + Math.sin(angle) * a.party.radius * 0.55 + 8, dt, SPEED * 0.9);
      a.px = a.x; a.py = a.y;
    });
    p.glyphs.forEach((g, i) => {
      const angle = (i / Math.max(1, p.glyphs.length)) * Math.PI * 2 + t * 0.7;
      const r = Number(g.dataset.radius) || 58;
      g.style.left = (p.stage.x + Math.cos(angle) * r) + "px";
      g.style.top = (p.stage.y + Math.sin(angle) * r * 0.55 - 4) + "px";
    });
    if (now >= p.until) endParty();
  };
  const endParty = () => {
    const p = state.party; if (!p) return;
    p.queen.remove(); p.glyphs.forEach((g) => g.remove());
    panel.classList.remove("celebrating");
    scent.style.opacity = "";
    panelQueen(true);
    hills.forEach((h) => { h.el.style.pointerEvents = ""; });
    p.dancers.forEach((a) => {
      if (!a.el) return;
      a.el.classList.remove("dancing");
      label(a);
      a.party = null;
      if (a.role === "guard" && a.mini && minis.includes(a.mini)) {
        a.job = "mini-home"; a.path = [a.mini.hole.slice()]; a.k = 0;
      } else if (a.trail && state.trails.includes(a.trail)) {
        a.job = "follow"; a.path = lanePath(a.trail.pts, a.lane || 0); a.k = 0;
      } else if (a.patrol && state.trails.includes(a.patrol)) {
        a.job = "patrol"; a.path = lanePath(a.patrol.pts, a.lane || 0); a.k = 0;
      } else {
        a.job = "home"; a.path = [hillOf(a).hole.slice()]; a.k = 0;
      }
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
  const STORE_COSTS = [12, 18, 24], MAX_MINIS = 3, BUILD_TIME = 8, MINI_HP = 5, SPAWN_EVERY = 6, HEAL_AFTER = 6, HEAL_EVERY = 5;
  const MOUND_REACH = 560;
  const storeCap = () => STORE_COSTS[Math.min(state.built, STORE_COSTS.length - 1)];
  const miniArt = (p) => { // a small Braille dome; p from 0 to 1 decides how much of it stands
    const w = 18, h = 8, cells = new Int8Array(w * h).fill(-1);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = (x - w / 2) / (w / 2), top = h * u * u; const hash = ((x * 73 + y * 151) % 97) / 97; if (y >= top && ((x + y) % 2 === 0 || y < top + 1.2) && hash < p) cells[y * w + x] = 0; }
    for (let y = 0; y < 3; y++) for (let x = w / 2 - 2; x < w / 2 + 2; x++) cells[y * w + x] = -1;
    let out = ""; for (let cy = 0; cy < h; cy += 4) { for (let cx = 0; cx < w; cx += 2) { let code = 0; for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) if (cells[(cy + dy) * w + cx + dx] >= 0) code |= bit[dy][dx]; out += String.fromCharCode(0x2800 + code); } out += "\n"; }
    return out.trimEnd();
  };
  const overlaps = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

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
    for (const el of main.querySelectorAll("img, svg, pre, button, input, select, textarea, figure, hr")) {
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
  const findMiniSpot = (reach = MOUND_REACH) => {
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
      const nearHome = Math.hypot((x - home.base[0]) * 1.15, y - home.base[1]);
      // A mound guards the trails around it. Keep it within reach of the main hill, then spread
      // the later ones enough that their guards are not stacked on one patch.
      if (nearHome > reach) return;
      const score = (minis.length < 2 ? -nearHome : separation - nearHome * 0.45) + (box[1] >= viewTop && box[3] <= viewBottom ? 1000 : 0);
      if (score > bestScore) { best = spot; bestScore = score; }
    };
    for (const [left, , right, bottomEdge] of terrain.gaps) {
      const center = (left + right) / 2;
      for (const offset of [-18, 0, 18]) consider(center + offset + (Math.random() - 0.5) * 18, bottomEdge + (Math.random() - 0.5) * 8, true);
    }
    // Leave a little air around the grid. A few random probes keep the third mound from landing
    // on the same rail as the first two, which is what made the hills look placed by a grid.
    for (let n = 0; n < 28; n++) {
      consider(34 + Math.random() * (main.clientWidth - 68), top + 40 + Math.random() * Math.max(1, bottom - top - 80), false);
    }
    if (best) return best;
    for (let y = top + 40; y < bottom - 4; y += 12) {
      for (let x = 34; x <= main.clientWidth - 34; x += 12) consider(x + (Math.random() - 0.5) * 8, y + (Math.random() - 0.5) * 8, false);
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
    a.el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); swarm(a); });
    layer.append(a.el); placeAnt(a); state.ants.push(a); label(a); return a;
  };
  // ---- the sweet: a rare lure that buys the page time without feeding the copy -------------
  const eventIcon = (kind) => kind === "vacuum"
    ? "<svg viewBox='0 0 20 20' aria-hidden='true'><rect x='4' y='4' width='12' height='12' rx='3'/><path d='M8 8h4M10 4V1'/></svg>"
    : "<svg viewBox='0 0 20 20' aria-hidden='true'><path d='M2 11c4-7 9-7 13 0l3 4H1z'/><circle cx='7' cy='10' r='1'/><path d='M5 15h10'/></svg>";
  const unwrapCard = (el, done) => {
    if (el.classList.contains("unwrapping")) return;
    el.classList.add("unwrapping");
    setTimeout(done, 430);
  };
  const sweetCard = () => {
    if (state.sweet || state.sweetCard || state.sweetPlanning || state.party) return;
    const spot = findMiniSpot();
    if (!spot) { state.sweetNext = performance.now() + 20000; return; }
    const el = document.createElement("button");
    el.type = "button"; el.className = "nest-sweet-card";
    el.setAttribute("aria-label", "A wrapped candy. Click to unwrap and place it.");
    el.innerHTML = "<span class='wrapper left'></span><span class='candy'></span><span class='wrapper right'></span>";
    el.style.left = `${spot.x}px`; el.style.top = `${Math.max(10, spot.y - 70)}px`;
    layer.append(el);
    const card = { el, ttl: 12000 };
    state.sweetCard = card;
    const remove = () => {
      if (state.sweetCard !== card) return;
      el.remove(); state.sweetCard = null; state.sweetNext = performance.now() + 70000 + Math.random() * 50000;
    };
    setTimeout(remove, card.ttl);
    el.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      if (state.sweetCard !== card || card.unwrapping) return;
      card.unwrapping = true;
      unwrapCard(el, () => {
        if (state.sweetCard !== card) return;
        el.remove(); state.sweetCard = null;
        state.sweetPlanning = true; main.classList.add("nest-sweet-planning");
        log("place the unwrapped sweet on a clear patch");
        setTimeout(() => {
          if (!state.sweetPlanning) return;
          state.sweetPlanning = false; main.classList.remove("nest-sweet-planning");
          state.sweetNext = performance.now() + 70000 + Math.random() * 50000;
        }, 8000);
      });
    });
  };
  const removeSweet = (why) => {
    const sweet = state.sweet; if (!sweet) return;
    sweet.el.remove(); state.sweet = null;
    state.sweetNext = performance.now() + 70000 + Math.random() * 50000;
    state.ants.filter((a) => a.sweetTarget === sweet).forEach((a) => goHome(a));
    log(why === "eaten" ? "the sweet is gone; the page is still here" : "the sweet fades away");
  };
  const placeSweet = (x, y) => {
    if (!state.sweetPlanning || state.sweet) return null;
    state.sweetPlanning = false; main.classList.remove("nest-sweet-planning");
    const el = document.createElement("div");
    el.className = "nest-sweet"; el.textContent = "⣿⣿⣿⣿⣿⣿";
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    layer.append(el);
    const sweet = { x, y, pieces: 6, el, ttl: 25000 };
    state.sweet = sweet;
    state.sweetNext = performance.now() + 70000 + Math.random() * 50000;
    for (let i = 0; i < 2; i++) {
      const a = spawnPageAnt("worker", home.hole.slice(), null);
      a.job = "sweet-walk"; a.sweetTarget = sweet;
      a.path = [[x + (i ? 18 : -18), y + 10]]; a.k = 0;
    }
    if (rival.active && rival.mound) spawnRivalUnit("rival-sweet", rival.mound.hole.slice(), [[x, y]], sweet);
    log("the sweet is placed; workers are coming");
    blip(520, 0.08, "sine", 0.03);
    setTimeout(() => { if (state.sweet === sweet) removeSweet("faded"); }, sweet.ttl);
    return sweet;
  };
  const stepSweetAnt = (ant, dt) => {
    const sweet = state.sweet;
    if (!sweet || ant.sweetTarget !== sweet) { goHome(ant); return; }
    if (ant.job === "sweet-walk") {
      const g = ant.path[ant.k];
      if (!g) { ant.job = "sweet-eat"; ant.nextEat = performance.now() + 250; return; }
      if (move(ant, g[0], g[1], dt, SPEED * 1.45)) { ant.px = ant.x; ant.py = ant.y; if (++ant.k >= ant.path.length) { ant.job = "sweet-eat"; ant.nextEat = performance.now() + 250; } }
      else { ant.px = ant.x; ant.py = ant.y; }
      return;
    }
    if (performance.now() < (ant.nextEat || 0)) return;
    ant.nextEat = performance.now() + 500;
    sweet.pieces--;
    if ((state.feedFlip = !state.feedFlip)) state.stores++;
    else { state.meals++; state.queen.eat = 0.8; }
    sweet.el.textContent = "⣿".repeat(Math.max(0, sweet.pieces));
    blip(420, 0.04, "sine", 0.02);
    if (sweet.pieces <= 0) removeSweet("eaten");
  };

  // ---- environmental pest control: a switch and an anteater, never banked -----------------
  const removeEnvAnt = (a) => {
    if (a.side === "rival") removeRivalAnt(a);
    else {
      if (a.letter?.state === "carried") drop(a.letter);
      else if (a.letter?.state === "gather") { a.letter.crew = a.letter.crew.filter((m) => m !== a); if (!a.letter.crew.length) a.letter.state = "free"; }
      squashQuiet(a);
    }
    state.squashed++;
  };
  const resolveEnv = (kind) => {
    const card = state.env; if (!card) return;
    state.env = null; card.el.remove();
    const all = [...state.ants.filter((a) => a.el && a.where === "page"), ...rival.ants];
    const anchor = all[Math.floor(Math.random() * all.length)] || { x: main.clientWidth / 2, y: main.clientHeight / 2 };
    const distToSeg = (p, a, b) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((p.x - a[0]) * dx + (p.y - a[1]) * dy) / l));
      return Math.hypot(p.x - (a[0] + t * dx), p.y - (a[1] + t * dy));
    };
    if (kind === "vacuum") {
      const angle = (Math.random() < 0.5 ? 1 : -1) * (0.55 + Math.random() * 0.3);
      const len = Math.hypot(main.clientWidth, main.scrollHeight) * 0.85;
      const from = [anchor.x - Math.cos(angle) * len, anchor.y - Math.sin(angle) * len];
      const to = [anchor.x + Math.cos(angle) * len, anchor.y + Math.sin(angle) * len];
      const sweep = document.createElement("div"); sweep.className = "nest-vacuum";
      sweep.style.width = "220px"; sweep.style.height = main.scrollHeight + "px"; sweep.style.left = "0"; sweep.style.top = "0"; sweep.style.transformOrigin = "0 0";
      layer.append(sweep);
      sweep.animate([{ transform: `translate(${from[0]}px, ${from[1]}px) rotate(${angle}rad)` }, { transform: `translate(${to[0]}px, ${to[1]}px) rotate(${angle}rad)` }], { duration: 1600, easing: "ease-in-out" }).onfinish = () => sweep.remove();
      for (let i = 0; i < 12; i++) {
        const p = document.createElement("span"); p.className = "nest-suck";
        const sx = anchor.x + (Math.random() - 0.5) * 260, sy = anchor.y + (Math.random() - 0.5) * 160;
        p.style.left = sx + "px"; p.style.top = sy + "px"; layer.append(p);
        p.animate([{ transform: "translate(0,0)", opacity: .9 }, { transform: `translate(${anchor.x - sx}px, ${anchor.y - sy}px)`, opacity: 0 }], { duration: 1000, easing: "ease-in" }).onfinish = () => p.remove();
      }
      setTimeout(() => {
        all.filter((a) => a.el && distToSeg(a, from, to) < 85).forEach(removeEnvAnt);
        log("the vacuum takes a slice of the page");
      }, 700);
    } else {
      const cy = anchor.y;
      const pts = [];
      for (let k = 0; k <= 36; k++) { const u = k / 36; pts.push([-20 + u * (main.clientWidth + 40), cy + Math.sin(u * Math.PI * 2.4) * 54 + Math.sin(u * Math.PI * 5) * 12]); }
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("class", "nest-tongue"); svg.setAttribute("width", String(main.clientWidth)); svg.setAttribute("height", String(main.clientHeight));
      const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      line.setAttribute("points", pts.map((p) => p.join(",")).join(" ")); line.setAttribute("fill", "none"); line.setAttribute("stroke", "var(--color-accent)"); line.setAttribute("stroke-width", "7"); line.setAttribute("stroke-linecap", "round");
      const head = document.createElementNS("http://www.w3.org/2000/svg", "circle"); head.setAttribute("cx", pts[pts.length - 1][0]); head.setAttribute("cy", pts[pts.length - 1][1]); head.setAttribute("r", "7"); head.setAttribute("fill", "var(--color-accent)");
      svg.append(line, head); layer.append(svg);
      const stuck = [];
      if (anchor.el && !anchor.tongue) { anchor.tongue = true; anchor.el.classList.add("stuck"); stuck.push(anchor); }
      const stick = () => {
        for (const a of all) {
          if (!a.el || a.tongue) continue;
          if (pts.some((p, i) => i && distToSeg(a, pts[i - 1], p) < 16)) {
            a.tongue = true; a.px = a.x; a.py = a.y; a.el.classList.add("stuck"); stuck.push(a);
          }
        }
      };
      const timer = setInterval(stick, 120);
      setTimeout(() => {
        clearInterval(timer);
        line.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350 }).onfinish = () => svg.remove();
        setTimeout(() => { stuck.forEach(removeEnvAnt); log("the tongue retracts; the stuck ants are gone"); }, 350);
      }, 3000);
      log("the anteater unrolls its tongue");
    }
    blip(kind === "vacuum" ? 120 : 90, 0.24, "sawtooth", 0.04);
    state.envNext = performance.now() + 80000 + Math.random() * 60000;
  };
  const spawnEnv = (kind) => {
    if (state.env || state.party) return;
    const spot = findMiniSpot();
    if (!spot) { state.envNext = performance.now() + 20000; return; }
    const el = document.createElement("button");
    el.type = "button"; el.className = "nest-event-card"; el.dataset.kind = kind;
    el.setAttribute("aria-label", kind === "vacuum" ? "A wrapped switch. Click to unwrap." : "A wrapped anteater. Click to unwrap.");
    el.innerHTML = `<span class='wrapper left'></span><span class='candy'>${eventIcon(kind)}</span><span class='wrapper right'></span>`;
    el.style.left = `${spot.x}px`; el.style.top = `${Math.max(10, spot.y - 64)}px`;
    layer.append(el);
    const card = { el, kind, ttl: 10000 };
    state.env = card;
    el.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      if (card.unwrapping) return;
      card.unwrapping = true;
      unwrapCard(el, () => resolveEnv(kind));
    });
    setTimeout(() => { if (state.env === card) { el.remove(); state.env = null; state.envNext = performance.now() + 80000; } }, card.ttl);
  };

  const startBuild = () => {
    let spot = findMiniSpot();
    if (!spot) {
      spot = findMiniSpot(MOUND_REACH + 320);
      if (spot) log("the stores are full; the colony expands outward for a mound");
    }
    if (!spot) {
      spot = findMiniSpot(Infinity);
      if (spot) log("the stores are full; the colony expands to the rest of the page");
    }
    if (!spot) {
      nextBuildSearch = performance.now() + 6000;
      log("the stores are full; there is no clear ground anywhere for another mound");
      return;
    }
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
    } else if (ant.job === "mini-home") { if (ant.mini && minis.includes(ant.mini)) assignGuard(ant, null, !!ant.retired); else squashQuiet(ant); }
  };
  const exposedArt = (p) => miniArt(p).split("\n").map((row) => {
    const mid = Math.floor(row.length / 2);
    return row.slice(0, mid) + " " + row.slice(mid + 1);
  }).join("\n");
  const markGuards = (mound) => {
    const count = mound.guards.size;
    if (count) mound.hadGuards = true;
    const exposed = !count && mound.hadGuards;
    mound.el.classList.toggle("open", !count);
    mound.el.classList.toggle("exposed", exposed);
    if (exposed) mound.el.textContent = exposedArt(mound.hp / MINI_HP);
    mound.el.setAttribute("aria-label", exposed
      ? `Mini hill, exposed, ${mound.hp} hits left`
      : count ? `Mini hill, ${count} guards` : `Mini hill, ${mound.hp} hits left`);
  };
  const callGuards = (mound) => {
    mound.guards.forEach((g) => {
      g.job = "defend"; g.circling = false;
      g.defendUntil = performance.now() + 4000;
      // Stand beside the mound, not on the hole: a guard parked on the nest blocks the click.
      const side = g.id % 2 ? 1 : -1;
      g.path = [[mound.spot.x + side * 28, mound.spot.y - 2]]; g.k = 0;
    });
  };
  const squashQuiet = (ant) => { ant.el?.remove(); ant.el = null; state.ants = state.ants.filter((a) => a !== ant); };
  const removeMini = (mound, keepAnts = false) => {
    mound.el.remove();
    mound.links.forEach((link) => link.remove());
    minis.splice(minis.indexOf(mound), 1);
    if (!keepAnts) state.built = Math.max(0, state.built - 1);
    if (keepAnts) {
      mound.guards.forEach((g) => {
        g.mini = null; g.hill = home; g.job = "home"; g.path = [home.hole.slice()]; g.k = 0;
        g.patrol = null; g.circling = false; g.defendUntil = 0;
      });
    } else {
      mound.guards.forEach(squashQuiet);
    }
    mound.flyers.forEach((flyer) => { flyer.mini = null; flyer.hill = home; });
  };
  const makeMini = (spot) => {
    const el = document.createElement("div"); el.className = "nest-hill nest-mini"; el.textContent = miniArt(1);
    el.setAttribute("role", "button"); el.setAttribute("tabindex", "0");
    positionMini(el, spot);
    const m = { el, spot, base: [spot.x, spot.y], hole: [spot.x, spot.y - 17], hp: MINI_HP, hadGuards: false, guards: new Set(), flyers: new Set(), next: performance.now() / 1000 + 2, lastHit: 0, nextHeal: 0, links: [] };
    el.addEventListener("click", (e) => {
      e.stopPropagation(); if (state.overrun || state.queenDead) return;
      if (m.guards.size) {
        callGuards(m);
        el.classList.add("denied"); setTimeout(() => el.classList.remove("denied"), 300);
        m.guards.forEach((g) => {
          if (!g.el) return;
          g.el.classList.add("flash");
          setTimeout(() => g.el?.classList.remove("flash"), 380);
        });
        blip(180, 0.05, "square"); return;
      }
      m.hp--; m.lastHit = performance.now() / 1000; m.nextHeal = 0;
      el.textContent = miniArt(m.hp / MINI_HP); markGuards(m);
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
    minis.push(m); markGuards(m); log("a mini hill stands"); return m;
  };
  // A guard walks from its mini hill to the nearest point of a trail, then patrols that trail.
  // It leaves no line behind it: a soldier is not a scent.
  const assignGuard = (g, preferred, stay = false) => {
    if (!g.mini || !minis.includes(g.mini)) { g.job = "home"; g.path = [hillOf(g).hole.slice()]; g.k = 0; return; }
    const ready = state.trails.filter((t) => !t.side && t.ready && t.state !== "gone");
    if (!ready.length || stay) {
      const c = [g.mini.spot.x, g.mini.spot.y - 6];
      g.job = "patrol"; g.patrol = null; g.circling = true; g.retired = stay;
      g.path = Array.from({ length: 7 }, (_, k) => [c[0] + Math.cos(k * 1.1) * 42, c[1] + 10 + Math.sin(k * 1.1) * 24]);
      g.k = 0; return;
    }
    // A guard stays on its own trail until that trail is gone; it only takes a new one when it
    // has just come out of the mound.
    const distanceTo = (trail) => Math.min(...trail.pts.map(([x, y]) => Math.hypot(x - g.x, y - g.y)));
    const t = preferred && ready.includes(preferred) ? preferred : ready.reduce((best, trail) => (distanceTo(trail) < distanceTo(best) ? trail : best), ready[0]);
    let best = 0, bd = Infinity;
    t.pts.forEach((p, k) => { const d = Math.hypot(p[0] - g.x, p[1] - g.y); if (d < bd) { bd = d; best = k; } });
    const lo = Math.max(1, best - 4), hi = Math.min(t.pts.length, best + 5);
    // Walk beside the trail, never on it: the workers need the line itself and a guard in the
    // same lane is what made a busy trail look crowded.
    g.lane = ((g.id % 5) - 2) * 8;
    g.job = "patrol"; g.patrol = t; g.circling = false; g.retired = false; g.patrolLaps = 0;
    g.path = [[g.x, g.y], ...lanePath(t.pts.slice(lo, hi), g.lane)]; g.k = 0;
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
      // A mound that is hurt but not broken grows one hit back at a time.
      if (m.hp > 0 && m.hp < MINI_HP && t - (m.lastHit || 0) > HEAL_AFTER) {
        if (!m.nextHeal) m.nextHeal = t + HEAL_EVERY;
        else if (t >= m.nextHeal) {
          m.hp = Math.min(MINI_HP, m.hp + 1); m.nextHeal = t + HEAL_EVERY;
          m.el.textContent = miniArt(m.hp / MINI_HP); markGuards(m);
        }
      } else if (m.hp >= MINI_HP) m.nextHeal = 0;
      if (t < m.next || state.queenDead) return; m.next = t + SPEED_SPAWN();
      if (m.guards.size < 3 && !(m.hadGuards && m.guards.size === 0)) { const g = spawnPageAnt("guard", [m.spot.x + (Math.random() < 0.5 ? -22 : 22), m.spot.y + 2], m); m.guards.add(g); markGuards(m); assignGuard(g); blip(180, 0.05, "sawtooth", 0.03); }
      else if (m.flyers.size < 3) { const f = spawnPageAnt("flyer", m.hole.slice(), m); m.flyers.add(f); f.job = "fly"; f.path = [randomPoint()]; f.k = 0; blip(720, 0.04, "sine", 0.02); }
    });
  };
  const SPEED_SPAWN = () => SPAWN_EVERY * (0.8 + Math.random() * 0.4);

  // ---- wiping a trail: drag across its scent
  const regroup = (ant) => {
    const patrol = ant.role === "soldier" || ant.role === "guard";
    let nearest = null;
    for (const trail of state.trails) {
      if (trail.side || !trail.ready || (!patrol && (trail.ants.size >= trailCap() || !remaining(trail)))) continue;
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
    if (trail.side === "rival") {
      retireRivalTrail(trail);
      blip(240, 0.2, "sawtooth"); noiseBurst(0.18, 0.06, 500);
      log("you wiped a rival scent trail");
      return;
    }
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
      ant.letter = null; ant.helpLetter = null; ant.patrol = null; ant.circling = false; ant.lead = null;
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
      if (!e.isPrimary || !from || Math.hypot(e.clientX - from[0], e.clientY - from[1]) < 12) return;
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

  // ---- the rival colony: a small, inverse-colour nuisance below the fold -------------------
  const removeRivalAnt = (a) => {
    if (a.letter?.state === "rival-carry") { a.letter.glyph?.remove(); showChar(a.letter); a.letter.state = "free"; a.letter = null; }
    a.el?.remove(); a.el = null;
    a.trail?.ants.delete(a);
    rival.ants = rival.ants.filter((x) => x !== a);
  };
  const squashRival = (a) => {
    if (!a.el) return;
    state.squashed++;
    a.el.classList.add("swatted");
    blip(160, 0.08, "square", 0.04);
    setTimeout(() => { if (a.el) removeRivalAnt(a); }, 260);
    log("you squashed a rival ant");
  };
  const rivalArt = () => {
    const w = 42, h = 15, cells = new Int8Array(w * h).fill(-1); let seed = 17; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = (x - w / 2) / (w / 2), top = h * (u * u) * 0.9 + Math.sin(x * 0.45) * 0.7;
      if (y >= top && ((x + y) % 2 === 0 || y < top + 1.2 || rnd() < 0.18)) cells[y * w + x] = y > h - 3 ? 1 : 0;
    }
    for (let y = 0; y < 4; y++) for (let x = Math.floor(w * 0.57); x < Math.floor(w * 0.57) + 5; x++) cells[y * w + x] = -1;
    let out = "";
    for (let cy = 0; cy < h; cy += 4) { for (let cx = 0; cx < w; cx += 2) { let code = 0, t = -1; for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) { const v = cells[(cy + dy) * w + cx + dx]; if (v >= 0) { code |= bit[dy][dx]; t = Math.max(t, v); } } const ch = String.fromCharCode(0x2800 + code); out += t === 1 ? `<b>${ch}</b>` : ch; } out += "\n"; }
    return out.trimEnd();
  };
  const rivalMound = () => {
    const template = document.createElement("div");
    template.className = "nest-hill rival";
    template.innerHTML = rivalArt();
    template.setAttribute("aria-hidden", "true");
    const terrain = miniTerrain();
    const hw = hr.width, hh = hr.height;
    const side = home.base[0] < main.clientWidth / 2 ? 1 : -1;
    let spots = [];
    const clear = (box) => miniFits(box, terrain.obstacles) && !terrain.gaps.some((r) => overlaps(box, r));
    for (const radius of [380, 460, 550, 650]) {
      for (let k = 0; k < 18; k++) {
        const angle = (k / 18) * Math.PI * 2 + Math.random() * 0.2;
        const x = home.base[0] + Math.cos(angle) * radius;
        const y = home.base[1] + Math.sin(angle) * radius * 0.62;
        if ((x - home.base[0]) * side < 150) continue;
        if (Math.hypot(x - home.base[0], y - home.base[1]) < 360) continue;
        const box = [x - hw / 2 - 10, y - hh - 10, x + hw / 2 + 10, y + 10];
        if (clear(box)) spots.push({ x, y });
      }
    }
    // If no ring spot is open, search the rest of the page for the nearest clear full-size
    // patch. This keeps the rival close enough to meet the main trails instead of leaving it
    // stranded in a text block.
    if (!spots.length) {
      for (let y = 80; y < main.scrollHeight - 40; y += 46) {
        for (let x = 100; x < main.clientWidth - 100; x += 46) {
          const box = [x - hw / 2 - 10, y - hh - 10, x + hw / 2 + 10, y + 10];
          if (clear(box)) spots.push({ x, y });
        }
      }
      const far = spots.filter((p) => Math.hypot(p.x - home.base[0], p.y - home.base[1]) > 360);
      const opposite = far.filter((p) => (p.x - home.base[0]) * side > 150);
      if (opposite.length) spots = opposite;
      else if (far.length) spots = far;
    }
    if (!spots.length) return null;
    const nearest = Math.min(...spots.map((p) => Math.hypot(p.x - home.base[0], p.y - home.base[1])));
    const pool = spots.filter((p) => Math.hypot(p.x - home.base[0], p.y - home.base[1]) < nearest + 140);
    const { x, y } = pool[Math.floor(Math.random() * pool.length)];
    template.style.left = `${x - hw / 2}px`;
    template.style.top = `${y - hh}px`;
    layer.append(template);
    template.classList.add("rising");
    setTimeout(() => template.classList.remove("rising"), 900);
    return { el: template, base: [x, y], hole: [x, y - hh + 4] };
  };
  const rivalTarget = (exclude = new Set()) => {
    const hole = rival.mound.hole;
    let best = null, bestD = Infinity;
    for (const n of textNodes(main)) for (let i = 0; i < n.data.length; i++) {
      if (!/\S/.test(n.data[i])) continue;
      const L = letterOf(n, i);
      if (L.state !== "free" || L.span || exclude.has(blockOf(n))) continue;
      const r = rectOf(n, i); if (!r.width) continue;
      const [x, y] = local(r);
      const d = Math.hypot(x - hole[0], y - hole[1]);
      if (d < bestD) { bestD = d; best = { L, block: blockOf(n), x: x + r.width / 2, y: y + r.height, r }; }
    }
    return best;
  };
  const rivalTrail = (pick) => {
    const hole = rival.mound.hole;
    const dx = pick.x - hole[0], dy = pick.y - hole[1], dist = Math.hypot(dx, dy) || 1;
    const nx = -dy / dist, ny = dx / dist;
    const amp = Math.min(46, Math.max(10, dist * 0.2));
    const side = Math.random() < 0.5 ? -1 : 1;
    const c1 = amp * (0.6 + Math.random() * 0.8) * side;
    const c2 = amp * (0.25 + Math.random() * 0.75) * (Math.random() < 0.28 ? -side : side);
    const p0 = [hole[0], hole[1]], p1 = [hole[0] + dx * 0.3 + nx * c1, hole[1] + dy * 0.3 + ny * c1];
    const p2 = [hole[0] + dx * 0.7 + nx * c2, hole[1] + dy * 0.7 + ny * c2], p3 = [pick.x, pick.y];
    const phase = Math.random() * Math.PI * 2; let jag = 0;
    let pts = [];
    for (let s = 0; s <= 28; s++) {
      const k = s / 28, u = 1 - k;
      const bx = u * u * u * p0[0] + 3 * u * u * k * p1[0] + 3 * u * k * k * p2[0] + k * k * k * p3[0];
      const by = u * u * u * p0[1] + 3 * u * u * k * p1[1] + 3 * u * k * k * p2[1] + k * k * k * p3[1];
      jag = jag * 0.58 + (Math.random() - 0.5) * 4.2;
      const wobble = (Math.sin(k * 5.2 + phase) * 0.6 + jag) * Math.sin(Math.PI * k);
      pts.push([bx + nx * wobble, by + ny * wobble]);
    }
    pts = mergeRoute(pts, pick.block, rival.trails);
    const halo = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    halo.setAttribute("points", pts.map((p) => p.join(",")).join(" ")); halo.classList.add("halo", "rival");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("points", halo.getAttribute("points")); line.classList.add("rival");
    scent.append(halo, line);
    const born = performance.now() / 1000;
    const t = { pts, block: pick.block, end: [pick.x, pick.y], ants: new Set(), line, halo, ready: true,
      side: "rival", state: "ready", born, ttl: born + TUNING.trailTtl };
    addEraser(t);
    state.trails.push(t); rival.trails.push(t);
    return t;
  };
  const spawnRival = (trail) => {
    const hole = rival.mound.hole;
    const a = { id: ++state.total, role: "rival", side: "rival", where: "page", x: hole[0], y: hole[1], px: hole[0], py: hole[1],
      heading: -Math.PI / 2, trail, job: "rival-follow", lane: Math.random() < 0.5 ? 3 : -3, hp: 1 };
    a.path = lanePath(trail.pts, a.lane); a.k = 0;
    a.el = document.createElement("button"); a.el.type = "button"; a.el.className = "nest-ant rival walk";
    a.el.innerHTML = ANT_SVG; a.el.setAttribute("aria-label", "Rival ant. Press to squash.");
    a.el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); squashRival(a); });
    layer.append(a.el); placeAnt(a); label(a); rival.ants.push(a); trail.ants.add(a);
  };
  const stealRival = (trail, ant) => {
    if (!trail || !state.trails.includes(trail)) return false;
    const options = freeIn(trail.block, trail.end);
    if (!options.length) return false;
    const L = options[0].L;
    const r = rectOf(L.n, L.i); const [x, y] = local(r);
    hideChar(L); L.state = "rival-carry"; L.crew = [];
    const glyph = document.createElement("span"); glyph.className = "nest-letter rival-carry"; glyph.textContent = L.ch;
    glyph.style.cssText += lookOf(L.n.parentElement); glyph.style.left = x + "px"; glyph.style.top = y + "px";
    layer.append(glyph); ant.letter = L; ant.glyph = glyph;
    log(`the rival picks up “${L.ch}”`);
    blip(330, 0.05, "triangle", 0.03);
    return true;
  };
  const spawnRivalUnit = (job, at, path, sweet) => {
    const a = { id: ++state.total, role: job === "rival-guard" ? "guard" : "rival", side: "rival", where: "page", x: at[0], y: at[1], px: at[0], py: at[1],
      heading: -Math.PI / 2, job, path, k: 0, sweetTarget: sweet, hp: job === "rival-guard" ? 2 : 1 };
    a.el = document.createElement("button"); a.el.type = "button"; a.el.className = "nest-ant rival walk";
    a.el.innerHTML = ANT_SVG; a.el.setAttribute("aria-label", "Rival ant. Press to squash.");
    a.el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); squashRival(a); });
    layer.append(a.el); placeAnt(a); label(a); rival.ants.push(a);
    return a;
  };
  const rivalBait = (x, y) => {
    rival.ants.filter((a) => a.el && Math.hypot(a.x - x, a.y - y) < 210).forEach((a) => {
      a.job = "rival-bait"; a.baitUntil = performance.now() + 6000; a.path = [[x, y]]; a.k = 0;
    });
  };
  const stepRival = (a, dt) => {
    if (!a.el || a.tongue) return;
    if (a.job === "rival-flyer") {
      const g = a.path[a.k]; if (!g) { a.path = [randomPoint()]; a.k = 0; return; }
      if (move(a, g[0], g[1], dt, SPEED * 1.5)) { a.px = a.x; a.py = a.y; a.path = [randomPoint()]; a.k = 0; }
      return;
    }
    if (a.job === "rival-build") {
      const g = a.path[a.k]; if (!g) return;
      if (move(a, g[0], g[1], dt, SPEED * 0.55)) { a.px = a.x; a.py = a.y; if (++a.k >= a.path.length) { a.path = a.path.toReversed(); a.k = 0; } }
      return;
    }
    if (a.job === "rival-guard") {
      const g = a.path[a.k]; if (!g) return;
      if (move(a, g[0], g[1], dt, SPEED * 0.7)) { a.px = a.x; a.py = a.y; if (++a.k >= a.path.length) { a.path = a.path.toReversed(); a.k = 0; } }
      return;
    }
    if (a.job === "rival-bait") {
      const g = a.path[a.k];
      if (g && move(a, g[0], g[1], dt, SPEED * 0.9)) { a.px = a.x; a.py = a.y; a.k = 0; }
      if (performance.now() >= a.baitUntil) { a.job = a.trail && state.trails.includes(a.trail) ? "rival-follow" : "rival-pause"; a.path = a.trail ? lanePath(a.trail.pts, a.lane) : []; a.k = 0; a.pauseAt = performance.now() + 300; }
      return;
    }
    const now = performance.now();
    if (a.job === "rival-pause") {
      if (now < a.pauseAt) return;
      if (!a.trail || !state.trails.includes(a.trail)) { removeRivalAnt(a); return; }
      a.job = "rival-follow"; a.path = lanePath(a.trail.pts, a.lane); a.k = 0;
      return;
    }
    const g = a.path[a.k]; if (!g) return;
    if (!move(a, g[0], g[1], dt, SPEED * 0.9)) { a.px = a.x; a.py = a.y; return; }
    a.px = a.x; a.py = a.y;
    if (a.glyph) { a.glyph.style.left = a.x + 2 + "px"; a.glyph.style.top = a.y - 16 + "px"; }
    if (++a.k < a.path.length) return;
    if (a.job === "rival-follow") {
      stealRival(a.trail, a);
      a.job = "rival-home"; a.path = lanePath(a.trail.pts.toReversed(), -a.lane); a.k = 0;
    } else if (a.job === "rival-home") {
      if (a.letter?.state === "rival-carry") {
        a.letter.glyph?.remove(); a.letter.state = "stolen"; rival.stolen.add(a.letter); a.letter = null; a.glyph = null;
        log("the rival banks a letter at its mound");
      }
      a.job = "rival-pause"; a.pauseAt = now + 700;
      if (a.trail && !remaining(a.trail)) { const old = a.trail; retireRivalTrail(old, false); rivalRetarget(); }
    }
  };
  let lastRivalFight = 0;
  const combatPower = (a) => (a.role === "soldier" || a.role === "guard") ? 2 : 1;
  const combHp = (a) => (a.role === "soldier" || a.role === "guard" ? 2 : 1);
  const removeMainCombatant = (a) => {
    if (a.letter?.state === "carried") drop(a.letter);
    else if (a.letter?.state === "gather") { a.letter.crew = a.letter.crew.filter((m) => m !== a); if (!a.letter.crew.length) a.letter.state = "free"; }
    squashQuiet(a);
  };
  const rivalCombat = (now) => {
    if (now - lastRivalFight < 300) return;
    lastRivalFight = now;
    const mains = state.ants.filter((a) => a.el && a.where === "page");
    const rivals = rival.ants.filter((a) => a.el);
    const near = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < 26;
    for (const r of rivals.slice()) {
      if (!r.el) continue;
      const group = mains.filter((m) => m.el && near(m, r));
      const power = group.reduce((s, a) => s + combatPower(a), 0);
      if (power < combHp(r)) continue;
      r.el.classList.add("fighting"); group.forEach((a) => a.el?.classList.add("fighting"));
      setTimeout(() => { group.forEach((a) => a.el?.classList.remove("fighting")); if (r.el) r.el.classList.remove("fighting"); }, 320);
      removeRivalAnt(r); state.squashed++;
      log(group.length > 1 ? "workers overwhelm a rival ant" : "a main ant drives off a rival ant");
    }
    for (const m of mains) {
      if (!m.el) continue;
      const group = rival.ants.filter((r) => r.el && near(r, m));
      const power = group.reduce((s, a) => s + combatPower(a), 0);
      if (power < combHp(m)) continue;
      m.el.classList.add("fighting"); group.forEach((r) => r.el?.classList.add("fighting"));
      setTimeout(() => { group.forEach((r) => r.el?.classList.remove("fighting")); if (m.el) m.el.classList.remove("fighting"); }, 320);
      removeMainCombatant(m); state.squashed++;
      log("the rival ants overwhelm a main ant");
    }
  };

  const trailCross = (a, b) => {
    for (let i = 1; i < a.pts.length; i++) for (let j = 1; j < b.pts.length; j++) {
      const [x1, y1] = a.pts[i - 1], [x2, y2] = a.pts[i], [x3, y3] = b.pts[j - 1], [x4, y4] = b.pts[j];
      const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
      if (!d) continue;
      const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
      const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
    }
    return null;
  };
  const rivalContestPoint = () => {
    for (const a of state.trails.filter((t) => !t.side)) for (const b of rival.trails) {
      const p = trailCross(a, b); if (p) return p;
    }
    return null;
  };
  const stepRivalDefense = (ant, dt) => {
    if (!rival.active || !rival.mound) return goHome(ant);
    const target = ant.job === "rival-contest" ? ant.path[ant.k] : rival.mound.hole;
    if (!target) return goHome(ant);
    if (!move(ant, target[0], target[1], dt, SPEED * 0.85)) { ant.px = ant.x; ant.py = ant.y; return; }
    ant.px = ant.x; ant.py = ant.y;
    if (ant.job === "rival-siege") {
      if (performance.now() < (ant.nextBite || 0)) return;
      ant.nextBite = performance.now() + 900;
      rival.hp--; rival.mound.el.classList.add("hit"); setTimeout(() => rival.mound?.el.classList.remove("hit"), 320);
      blip(150, 0.08, "square", 0.035);
      log(`the colony bites the rival mound (${Math.max(0, rival.hp)} left)`);
      if (rival.hp <= 0) { log("the main colony breaks the rival mound"); retreatRival(); goHome(ant); }
    }
  };
  let nextRivalAttack = 0;
  const tickRivalAttack = (now) => {
    if (!rival.active || state.party || now < nextRivalAttack) return;
    nextRivalAttack = now + 3500;
    const unit = state.ants.find((a) => a.el && (a.role === "soldier" || a.role === "guard") && a.job !== "dance" && !a.rivalSiege && !a.rivalContest);
    if (!unit) return;
    const contest = rivalContestPoint();
    if (!contest && rival.stolen.size === 0) return;
    if (contest) {
      unit.job = "rival-contest"; unit.path = [contest]; unit.k = 0; unit.rivalContest = true; unit.el.classList.add("marching");
      log("a guard moves to a contested trail");
    } else {
      unit.job = "rival-siege"; unit.path = [rival.mound.hole.slice()]; unit.k = 0; unit.rivalSiege = true; unit.el.classList.add("marching");
      log("a guard marches on the rival mound");
    }
  };

  const retireRivalTrail = (t, retreat = true) => {
    if (!t || t.state === "gone") return;
    t.state = "gone"; t.ready = false;
    t.line.remove(); t.halo.remove(); t.hit?.remove();
    state.trails = state.trails.filter((x) => x !== t);
    rival.trails = rival.trails.filter((x) => x !== t);
    [...t.ants].forEach(removeRivalAnt);
    if (retreat && !rival.trails.length) retreatRival();
  };
  const retreatRival = () => {
    if (!rival.active) return;
    rival.active = false;
    [...rival.trails].forEach((t) => retireRivalTrail(t, false));
    [...rival.ants].forEach(removeRivalAnt);
    rival.mound?.el.remove(); rival.mound = null;
    rival.minis.forEach((m) => m.el.remove()); rival.minis = [];
    const deadAt = rival.mound ? rival.mound.base.slice() : [home.base[0], home.base[1]];
    rival.stolen.forEach((L) => { showChar(L); L.state = "free"; L.crew = []; });
    rival.stolen.clear();
    state.cache = { x: deadAt[0], y: deadAt[1], until: performance.now() + 30000 };
    rival.returnAt = performance.now() + 22000 + Math.random() * 18000;
    log("the rival colony retreats below the fold");
  };
  const foundRival = () => {
    if (rival.active || state.over || state.party) return;
    const mound = rivalMound();
    if (!mound) { rival.mound = null; rival.returnAt = performance.now() + 8000; return; }
    rival.mound = mound; rival.active = true; rival.returnAt = 0; rival.hp = 8; rival.buildUntil = performance.now() + 3200;
    const builders = [];
    for (let i = 0; i < 3; i++) {
      const bx = mound.base[0] + (i - 1) * 26, by = mound.base[1] + 8;
      builders.push(spawnRivalUnit("rival-build", [bx, by], Array.from({ length: 6 }, (_, k) => [bx + Math.cos(k * 1.1) * 16, by + Math.sin(k * 1.1) * 10]), null));
    }
    log("three rival builders start the mound");
    setTimeout(() => {
      builders.forEach(removeRivalAnt);
      if (!rival.active || rival.mound !== mound) return;
      const pick = rivalTarget();
      if (!pick) { mound.el.remove(); rival.active = false; rival.mound = null; rival.returnAt = performance.now() + 8000; return; }
      const used = new Set();
      for (let i = 0; i < 3; i++) {
        const next = i === 0 ? pick : rivalTarget(used);
        if (!next) break;
        used.add(next.block);
        const t = rivalTrail(next); spawnRival(t);
      }
      const miniSpots = [];
      const terrain = miniTerrain();
      for (const radius of [130, 170, 210]) {
        for (let k = 0; k < 18; k++) {
          const a = (k / 18) * Math.PI * 2;
          const x = rival.mound.base[0] + Math.cos(a) * radius, y = rival.mound.base[1] + Math.sin(a) * radius * 0.6;
          const box = [x - 26, y - 26, x + 26, y + 16];
          if (!miniFits(box, terrain.obstacles)) continue;
          if (Math.hypot(x - home.base[0], y - home.base[1]) < 180) continue;
          if (miniSpots.some((p) => Math.hypot(p.x - x, p.y - y) < 90)) continue;
          miniSpots.push({ x, y }); break;
        }
        if (miniSpots.length >= 2) break;
      }
      miniSpots.slice(0, 2).forEach((p) => {
        const x = p.x, y = p.y;
        const el = document.createElement("div"); el.className = "nest-hill rival rival-mini"; el.textContent = miniArt(1);
        el.style.left = `${x}px`; el.style.top = `${y}px`; layer.append(el); el.classList.add("rising"); setTimeout(() => el.classList.remove("rising"), 900);
        rival.minis.push({ el, base: [x, y] });
        const trail = rival.trails[0];
        const path = trail ? lanePath(trail.pts, (rival.minis.length % 2 ? 1 : -1) * 9) : Array.from({ length: 7 }, (_, k) => [x + Math.cos(k * 0.9) * 25, y + Math.sin(k * 0.9) * 16]);
        spawnRivalUnit("rival-guard", [x, y], path, null);
        spawnRivalUnit("rival-flyer", [x, y], [randomPoint()], null);
      });
      log("the rival trails open");
      blip(260, 0.1, "sawtooth", 0.025);
    }, 2600);
  };
  const placeBait = (e) => {
    setBaitArmed(false);
    const m = main.getBoundingClientRect(), x = e.clientX - m.left + main.scrollLeft, y = e.clientY - m.top + main.scrollTop;
    const crumb = document.createElement("div"); crumb.className = "nest-bait"; crumb.textContent = "⣴⣦"; crumb.style.left = x + "px"; crumb.style.top = y + "px"; layer.append(crumb);
    baitReady = performance.now() / 1000 + BAIT_COOL; blip(400, 0.08, "sine"); noiseBurst(0.05, 0.03, 900);
    const lured = state.ants.filter((a) => a.el && a !== state.builder && !a.letter && a.job !== "crew" && a.role !== "soldier" && Math.hypot(a.x - x, a.y - y) < 200);
    lured.forEach((a) => { a.trail?.ants.delete(a); a.trail = null; a.helpLetter = null; a.job = "bait"; a.path = [[x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 20]]; a.k = 0; });
    if (rival.active) rivalBait(x, y);
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
    if (!state.party) {
      const qx = QUEEN[0] * W, qy = QUEEN[1] * H, q = state.queen;
      const swell = state.queenDead ? 0.9 : 1 + 0.06 * Math.sin(now / 400) + 0.25 * q.lay;
      const ax = R * 0.6 * swell, ay = R * 0.26 * swell;
      for (let j = -ay; j <= ay; j++) for (let i = -ax; i <= ax; i++) if ((i * i) / (ax * ax) + (j * j) / (ay * ay) <= 1 && (Math.round(i + j) % 2 === 0 || Math.abs(j) < ay * 0.5)) put(qx + R * 0.15 + i, qy + j, state.queenDead ? 0 : 6);
      const hx = qx - R * 0.6 - (q.eat > 0 ? step * 2 : 0);
      for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { put(qx - R * 0.45 + i, qy + j, 6); if (Math.abs(i) + Math.abs(j) < 3) put(hx - 4 + i, qy + j, 6); }
      for (let k = -1; k <= 1; k++) for (let s = 1; s < 4; s++) { const lx = qx - R * 0.45 + k * 3 + s * k + (step && k === 0 ? 1 : 0); put(lx, qy + 2 + s, 6); put(lx, qy - 2 - s, 6); }
      if (q.eat > 0) { put(hx - 8 + q.eat * 3, qy, 5); put(hx - 8 + q.eat * 3, qy - 1, 5); }
      if (q.lay > 0) put(qx + R * 0.15 + ax + 2, qy, 4);
    }
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
    if (!nestCells || nestCols !== W / 2 || nestRows !== H / 4) buildNestCells();
    let cellIndex = 0;
    for (let cy = 0; cy < H; cy += 4) {
      for (let cx = 0; cx < W; cx += 2) {
        let code = 0, tone = -1;
        for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) { const t = d[(cy + dy) * W + cx + dx]; if (t >= 0) { code |= bit[dy][dx]; tone = Math.max(tone, t); } }
        const ch = String.fromCharCode(0x2800 + code);
        const cell = nestCells[cellIndex++];
        if (cell._ch !== ch) { cell.firstChild.data = ch; cell._ch = ch; }
        const toneKey = tone > 0 ? String(tone) : "";
        if (cell.dataset.tone !== toneKey) { cell.className = tone > 0 ? `t${tone}` : ""; cell.dataset.tone = toneKey; }
      }
    }
  };

  const statText = new Map();
  const setText = (key, value) => {
    const text = String(value);
    if (statText.get(key) === text) return;
    const el = $(key); if (el) el.textContent = text;
    statText.set(key, text);
  };
  const meterCells = new Map();
  const meterObserver = new ResizeObserver((entries) => {
    for (const entry of entries) meterCells.set(entry.target, Math.max(10, Math.floor(entry.contentRect.width / 6)));
  });
  for (const key of ["stores", "holds", "bar", "worship"]) {
    const meter = $(`${key}-bar`);
    if (!meter) continue;
    meterCells.set(meter, Math.max(10, Math.floor(meter.clientWidth / 6)));
    meterObserver.observe(meter);
  }
  const drawStats = () => {
    const setMeter = (key, ratio, text) => {
      const r = Math.min(1, Math.max(0, ratio));
      const meter = $(`${key}-bar`);
      const cells = meterCells.get(meter) ?? Math.max(10, Math.floor((meter?.clientWidth || 160) / 6));
      const filled = Math.round(r * cells);
      setText(key, "█".repeat(filled));
      setText(`${key}-rest`, "░".repeat(cells - filled));
      if (meter) {
        const now = String(Math.round(r * 100));
        if (meter.getAttribute("aria-valuenow") !== now) meter.setAttribute("aria-valuenow", now);
        const valueText = text ?? `${Math.round(r * 100)}%`;
        if (meter.getAttribute("aria-valuetext") !== valueText) meter.setAttribute("aria-valuetext", valueText);
      }
      if (text != null) setText(`${key}-val`, text);
    };
    let scouts = 0, workers = 0, soldiers = 0, flyers = 0;
    for (const ant of state.ants) {
      if (ant.role === "scout") scouts++;
      else if (ant.role === "worker") workers++;
      else if (ant.role === "soldier" || ant.role === "guard") soldiers++;
      else if (ant.role === "flyer") flyers++;
    }
    setText("scouts", scouts); setText("workers", workers); setText("soldiers", soldiers); setText("flyers", flyers);
    setText("minis", minis.length);
    const cap = storeCap();
    setMeter("stores", state.stores / cap, state.builder ? "building" : minis.length >= MAX_MINIS ? "full" : `${state.stores}/${cap}`);
    const rivalStolen = rival.stolen.size;
    setText("rivals", rivalStolen);
    setText("rival-hint", rivalStolen ? ` · rival ${rivalStolen}` : "");
    const held = pageLetters ? Math.max(0, 1 - (state.stolen.size + rivalStolen) / pageLetters) : 1;
    setMeter("holds", held, `${Math.round(held * 100)}%`);
    const pageLeft = Math.round(held * 100);
    setText("holds-hint", pageLeft >= 99 ? "page still whole"
      : pageLeft >= 75 ? "the copy is thinning"
      : pageLeft >= 50 ? "half the page is left"
      : pageLeft >= 25 ? "the page is mostly gone"
      : pageLeft > 0 ? "only a few letters left" : "the page is gone");
    const wait = Math.ceil(baitReady - performance.now() / 1000);
    const sealWait = Math.ceil(Math.max(...hills.map((h) => h.cool)) - performance.now() / 1000);
    const sealButton = $("seal"), bait = $("bait");
    const sealDisabled = sealWait > 0 || state.queenDead || !!state.party;
    if (sealButton.disabled !== sealDisabled) sealButton.disabled = sealDisabled;
    if (state.over && main.classList.contains("nest-armed")) setBaitArmed(false);
    const baitDisabled = wait > 0 || state.over || state.tool === "read";
    if (bait.disabled !== baitDisabled) bait.disabled = baitDisabled;
    for (const [key, seconds] of [["seal", sealWait], ["bait", wait]]) {
      const button = $(key); const cooldown = seconds > 0 ? `${seconds}s` : "";
      if (cooldown) { if (button.dataset.cooldown !== cooldown) button.dataset.cooldown = cooldown; }
      else if (button.hasAttribute("data-cooldown")) button.removeAttribute("data-cooldown");
    }
    setText("trails", state.trails.length);
    setText("squashed", state.squashed);
    setText("larder", [...state.stolen].slice(-18).map((L) => L.ch).join("") || "empty");
    const fed = state.meals % 3;
    setMeter("bar", fed / 3, `${fed}/3`);
    const worshipAt = worshipTarget();
    setMeter("worship", state.stolenTotal / worshipAt, `${state.stolenTotal}/${worshipAt}`);
    setText("status", state.party ? "dancing" : state.queenDead ? "the queen is dead" : state.overrun ? "overrun"
      : state.paused ? "paused" : state.queen.lay > 0 ? "laying" : state.queen.eat > 0 ? "feeding"
      : scoutsOut() ? "scouting" : state.trails.length ? "foraging" : "resting");
  };

  // ================================ the loop ================================
  let last = performance.now(), tick = 0, rafId = 0;
  let stopped = false;
  const stopLoop = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } };
  const startLoop = () => {
    if (rafId || stopped || state.paused || document.hidden) return;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  };
  const onVisibility = () => { if (document.hidden) stopLoop(); else startLoop(); };
  document.addEventListener("visibilitychange", onVisibility);
  const frame = (now) => {
    rafId = 0;
    if (stopped) return;
    try { tickFrame(now); } catch (err) { frameRect = null; console.error("nest:", err); }
    if (!stopped && !state.paused && !document.hidden) rafId = requestAnimationFrame(frame);
  };
  const tickFrame = (now) => {
    frameRect = main.getBoundingClientRect();
    const dt = Math.min(0.05, (now - last) / 1000) * state.speed; last = now;
    if (!state.paused) {
      if (state.party) stepParty(now, dt);
      if (state.scoutQueue.length) { const pending = state.scoutQueue.shift(); if (pending?.el && pending.role === "scout") scout(pending); }
      state.ants.slice().forEach((a) => (a.where === "nest" ? stepNest(a, dt) : stepPage(a, dt)));
      rival.ants.slice().forEach((a) => stepRival(a, dt));
      rivalCombat(now);
      tickRivalAttack(now);
      for (const a of state.ants) {
        const el = a.el; if (!el) continue;
        if (a.px !== el._px || a.py !== el._py || a.heading !== el._heading) {
          el.style.transform = antTransform(a);
          el._px = a.px; el._py = a.py; el._heading = a.heading;
        }
        const walking = a.job !== "wait" && !a.paused;
        if (el._walk !== walking) { el.classList.toggle("walk", walking); el._walk = walking; }
      }
      for (const a of rival.ants) {
        const el = a.el; if (!el) continue;
        if (a.px !== el._px || a.py !== el._py || a.heading !== el._heading) {
          el.style.transform = antTransform(a); el._px = a.px; el._py = a.py; el._heading = a.heading;
        }
      }
      if (rival.active && rival.ants.length === 0 && performance.now() > (rival.buildUntil || 0) && performance.now() > (rival.rebuildUntil || 0)) retreatRival();
      if (!rival.active && !state.party && state.partyIndex >= 1 && performance.now() >= rival.returnAt) foundRival();
      if (!state.sweet && !state.sweetCard && !state.sweetPlanning && !state.party && performance.now() >= state.sweetNext) sweetCard();
      if (!state.env && !state.party && performance.now() >= state.envNext) spawnEnv(Math.random() < 0.5 ? "vacuum" : "anteater");
      state.queen.eat = Math.max(0, state.queen.eat - dt); state.queen.lay = Math.max(0, state.queen.lay - dt * 0.7);
      state.eggs.slice().forEach((e) => {
        if (e.d < LEN.lay) e.d += NEST_SPEED * 0.6 * dt;
        else if ((e.age += dt) > 3.4 && state.ants.length < MAX_ANTS) {
          state.eggs.splice(state.eggs.indexOf(e), 1);
          const soldiers = state.ants.filter((a) => a.role === "soldier").length;
          const wantSoldiers = Math.min(3, Math.floor(state.ants.length / 8));
          const soldier = state.ants.length >= 10 && soldiers < wantSoldiers && Math.random() < 0.3;
          newAnt(soldier ? "soldier" : "worker", "hatch", 0);
          log(soldier ? "a soldier hatched" : "an egg hatched");
          blip(soldier ? 220 : 440, 0.06, "square", 0.035);
          setTimeout(() => blip(soldier ? 330 : 660, 0.05, "sine", 0.03), 90);
        }
      });
    }
    if ((tick = (tick + 1) % 6) === 0) {
      if (!state.paused) state.trails.slice().forEach((t) => {
        if (t.side === "rival" || t.state === "gone") return;
        if (!remaining(t)) {
          const wore = t.ttl && performance.now() / 1000 > t.ttl;
          retire(t);
          log(wore ? "a trail wears out" : "a trail ran out of letters");
          blip(220, 0.22, "sine", 0.03, -70);
        }
      });
      if (!state.over) {
        state.peak = Math.max(state.peak, state.ants.length); checkWipe(); ensureScout();
        if (!state.overrun && !state.party && state.stolenTotal >= worshipTarget()) startParty(false);
        tickMinis(now);
      }
      drawNest(now); drawStats();
    }
    frameRect = null;
  };

  $("bait").addEventListener("click", () => {
    if (state.over || state.tool === "read" || performance.now() / 1000 < baitReady) return;
    setBaitArmed(!main.classList.contains("nest-armed"));
  });
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
    document.body.classList.toggle("nest-links-locked", !linksOpen);
    const links = panel.querySelector('[data-tool="read"]');
    if (links) {
      const text = linksOpen ? "Links unlocked" : "Links locked";
      const span = links.querySelector("span"); if (span) span.textContent = text;
      links.setAttribute("aria-label", text);
      links.title = linksOpen ? "Page links work again. The colony keeps running." : "Page links are locked. Switch to Links to use them.";
    }
    panel.querySelectorAll("[data-tool]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.tool === t));
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
  let lockToast = null, lockToastTimer = 0;
  const hideLockToast = () => { clearTimeout(lockToastTimer); lockToast?.remove(); lockToast = null; };
  const showLockToast = () => {
    if (!lockToast) {
      lockToast = document.createElement("div");
      lockToast.className = "nest-lock-toast";
      lockToast.setAttribute("role", "status");
      const text = document.createElement("span");
      text.textContent = "Links are locked while the colony is playing.";
      const use = document.createElement("button");
      use.type = "button"; use.textContent = "Use Links (3)";
      use.addEventListener("click", () => { setTool("read"); hideLockToast(); });
      lockToast.append(text, use);
      document.body.append(lockToast);
    }
    clearTimeout(lockToastTimer);
    lockToastTimer = setTimeout(hideLockToast, 5000);
  };
  const gameChrome = (el) => !!el.closest?.("#nest-mock, [data-surface='console'], .nest-switch");
  const holdLinks = (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target || gameChrome(target)) return;
    const inMain = main.contains(target);
    const a = target.closest("a[href]");
    if (state.tool === "read") {
      if (!a || e.type !== "click" || state.over || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      e.preventDefault(); e.stopPropagation();
      confirmLeave(() => { allowLeave = true; location.assign(a.href); }, {
        title: "Leave this page?",
        body: "Leaving this page closes the colony; every stolen letter goes back where it was.",
        action: "leave and close",
      });
      return;
    }
    if (!state.over && e.type === "click" && e.detail > 0 && inMain && main.classList.contains("nest-armed")) {
      e.preventDefault(); e.stopPropagation(); placeBait(e); return;
    }
    if (layer.contains(target)) return;
    if (a) { e.preventDefault(); e.stopPropagation(); showLockToast(); return; }
    if (inMain && target.closest("button, summary, label, input, select, textarea, [role=button]")) { e.preventDefault(); e.stopPropagation(); }
  };
  document.addEventListener("click", holdLinks, true);
  document.addEventListener("auxclick", holdLinks, true);
  // Wipe with a drag anywhere on the page, not only if the pointer starts on the thin hit path.
  let wipeFrom = null;
  main.addEventListener("click", (e) => {
    if (!state.sweetPlanning) return;
    e.preventDefault(); e.stopPropagation();
    const m = main.getBoundingClientRect();
    placeSweet(e.clientX - m.left + main.scrollLeft, e.clientY - m.top + main.scrollTop);
  }, true);
  main.addEventListener("pointerdown", (e) => {
    if (state.tool !== "wipe" || !e.isPrimary || e.button !== 0) return;
    if (e.target.closest?.("#nest-mock, .nest-switch, [data-surface='console']")) return;
    e.preventDefault(); wipeFrom = [e.clientX, e.clientY];
  });
  main.addEventListener("pointermove", (e) => {
    if (!wipeFrom || state.tool !== "wipe") return;
    if (Math.hypot(e.clientX - wipeFrom[0], e.clientY - wipeFrom[1]) < 8) return;
    const m = main.getBoundingClientRect();
    const at = [e.clientX - m.left + main.scrollLeft, e.clientY - m.top + main.scrollTop];
    const hit = state.trails.find((t) => t.pts.some((p) => Math.hypot(p[0] - at[0], p[1] - at[1]) < 24));
    if (!hit) return;
    wipeFrom = null;
    wipeTrail(hit, at);
  });
  ["pointerup", "pointercancel"].forEach((ev) => main.addEventListener(ev, () => { wipeFrom = null; }));
  setTool("squash");
  $("x").addEventListener("click", leave);
  $("seal").addEventListener("click", () => hills.forEach(seal));
  $("sound").addEventListener("click", () => {
    state.sound = !state.sound;
    if (state.sound) setAction("sound", "sound", "Mute", "Turn off colony sounds.");
    else setAction("sound", "muted", "Unmute", "Turn on colony sounds.");
    blip(520, 0.08, "sine");
  });
  const soundBtn = $("sound");
  let soundHintTimer = 0;
  const clearSoundHint = () => { soundBtn.classList.remove("nest-sound-hint"); clearTimeout(soundHintTimer); };
  soundBtn.classList.add("nest-sound-hint");
  soundHintTimer = setTimeout(clearSoundHint, 8000);
  ["pointerenter", "focus", "click"].forEach((ev) => soundBtn.addEventListener(ev, clearSoundHint, { once: true }));
  $("speed").addEventListener("click", () => {
    state.speed = state.speed >= 4 ? 1 : state.speed * 2;
    setAction("speed", "fast", `Speed ${state.speed}×`, `Run the colony at ${state.speed}×.`);
    $("speed").querySelector("[data-label]").textContent = `${state.speed}×`;
  });
  $("pause").addEventListener("click", () => {
    state.paused = !state.paused;
    if (state.paused) { setAction("pause", "play", "Resume", "Resume the colony."); stopLoop(); }
    else { setAction("pause", "pause", "Pause", "Pause the colony."); }
    layer.querySelectorAll(".nest-ant").forEach((el) => { el.classList.toggle("walk", !state.paused); el._walk = !state.paused; });
    if (state.paused) drawStats(); else startLoop();
  });
  let resetting = false;
  const resetPage = () => {
    if (resetting) return;
    resetting = true;
    home.el.classList.add("unbuilding");
    setTimeout(() => {
    if (state.builder?.spot.gap) cancelBuild(state.builder);
    const oldMinis = minis.slice();
    oldMinis.forEach((m) => removeMini(m, true));
    state.trails.slice().forEach(retire);
    const spot = findHomeSpot(home.base);
    home.base = spot;
    home.hole = [spot[0], spot[1] - hr.height + 4];
    home.el.style.left = spot[0] - hr.width / 2 + "px";
    home.el.style.top = spot[1] - hr.height + "px";
    state.ants.forEach((a) => {
      if (a.where !== "page") return;
      if (a.letter?.state === "carried") drop(a.letter);
      a.letter = null; a.trail = null; a.job = "home"; a.path = [home.hole.slice()]; a.k = 0;
      a.el?.classList.remove("wait");
    });
    oldMinis.forEach(() => { const s = findMiniSpot(); if (s) makeMini(s); });
    retreatRival();
    rival.stolen.forEach((L) => { showChar(L); L.state = "free"; L.crew = []; });
    rival.stolen.clear();
    state.stolen.forEach((L) => { showChar(L); L.state = "free"; L.crew = []; });
    state.stolen.clear(); state.larder = []; log("every letter is back; the mounds have moved");
    const r = home.el.getBoundingClientRect(), view = main.getBoundingClientRect();
    if (r.top < view.top + 24 || r.bottom > view.bottom - 24) {
      home.el.scrollIntoView({ block: "center", inline: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    home.el.classList.remove("unbuilding");
    home.el.classList.add("rising");
    setTimeout(() => home.el?.classList.remove("rising"), 950);
    resetting = false;
    }, 560);
  };
  $("restore").addEventListener("click", () => { $("reset-confirm").hidden = false; $("reset-go").focus(); });
  $("reset-go").addEventListener("click", () => { $("reset-confirm").hidden = true; resetPage(); });
  $("reset-cancel").addEventListener("click", () => { $("reset-confirm").hidden = true; antBtn.focus(); });

  // Six ants to start: three scouts already on their way up and three workers below them. The
  // opening is a beat, not a waiting room: a trail should exist before the player wonders if it works.
  newAnt("scout", "hatch", LEN.hatch * 0.85); newAnt("scout", "hatch", LEN.hatch * 0.55); newAnt("scout", "hatch", LEN.hatch * 0.3);
  for (let k = 0; k < 3; k++) newAnt("worker", "up", LEN.up - 0.06 - k * 0.025);
  state.sweetNext = performance.now() + 12000;
  state.envNext = performance.now() + 30000;
  log("the colony wakes; three scouts head out");
  blip(196, 0.3, "sine", 0.04, -40);
  setTimeout(() => { if (!state.queenDead && !state.over) { state.queen.lay = 1; state.eggs.push({ d: 0, age: 0 }); log("the queen lays the first egg"); blip(660, 0.06, "sine", 0.04); } }, 6000);
  startLoop();

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
    meterObserver.disconnect();
    stopLoop();
    stopped = true; document.removeEventListener("click", holdLinks, true);
    document.removeEventListener("auxclick", holdLinks, true); document.removeEventListener("keydown", onKey);
    document.removeEventListener("visibilitychange", onVisibility);
    removeEventListener("beforeunload", onBeforeUnload);
    main.classList.remove("nest-armed"); delete main.dataset.nestTool;
    if (state.party) {
      state.party.queen.remove();
      state.party.glyphs.forEach((g) => g.remove());
      state.party.dancers.forEach((a) => a.el?.classList.remove("dancing"));
      panel.classList.remove("celebrating");
      hills.forEach((h) => { h.el.style.pointerEvents = ""; });
      state.party = null;
    }
    state.ants.forEach((a) => { const L = a.letter; if (L && L.glyph) { L.glyph.remove(); showChar(L); } });
    state.stolen.forEach(showChar);
    rival.stolen.forEach(showChar);
    rival.ants.slice().forEach(removeRivalAnt);
    rival.mound?.el.remove();
    for (const [letter, animation] of returningLetters) {
      animation.cancel();
      finishReturn(letter);
    }
    hideLockToast();
    clearTimeout(soundHintTimer);
    document.body.classList.remove("nest-links-locked");
    delete window.__nest;
    layer.remove(); panel.remove();
    hidden.forEach((el) => { el.style.display = el.dataset.nestDisplay; delete el.dataset.nestDisplay; });
    if (sidebarWasHidden) shell?.setAttribute("data-aside-hidden", "true");
    antBtn.setAttribute("aria-pressed", "false"); antBtn.setAttribute("aria-label", "Open the Nest");
  };
  let leaveGo = null;
  $("leave").addEventListener("click", () => { $("confirm").hidden = true; leaveGo?.(); });
  $("stay").addEventListener("click", () => { $("confirm").hidden = true; antBtn.focus(); });
  const confirmLeave = (go, copy = {}) => {
    $("confirm-title").textContent = copy.title || "Close the Nest?";
    $("confirm-body").textContent = copy.body || "The colony is cleared and every stolen letter goes back where it was.";
    $("leave").textContent = copy.action || "clear and close";
    const box = $("confirm"); box.hidden = false; $("leave").focus();
    leaveGo = go;
  };
  if (new URLSearchParams(location.search).has("nest-debug")) {
    window.__nest = { state, rival, home, startParty, wipeTrail, retire, squash, makeMini, findMiniSpot, newAnt, label, foundRival, sweetCard, placeSweet, spawnEnv, resolveEnv, spawnPageAnt, spawnRivalUnit, rivalCombat };
  }
  return { stop, confirmLeave };
  };
})();
