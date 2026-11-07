// Nest mockup: open any page with ?nest in the address. A playable sketch of plans/ant-nest-game.md.
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
  const main = document.querySelector(".app-shell__main") || document.querySelector("main");
  if (!modes || !aside || !main || document.getElementById("nest-mock")) return;

  const LINE = 6;          // ants that share one trail
  const MAX_ANTS = 24;
  const SPEED = 40;        // page pixels per second
  const GAP = 27;          // spacing between ants walking the same way
  const NEST_SPEED = 0.16; // nest units per second

  const style = document.createElement("style");
  style.textContent = `
    #nest-mock { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: var(--space-2, 8px);
      padding: var(--space-3, 12px); font: 12px/1.4 var(--font-mono); color: var(--ink); }
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
    .nest-layer { position: absolute; left: 0; top: 0; width: 100%; z-index: 50; pointer-events: none; overflow: hidden; }
    .nest-scent { position: absolute; left: 0; top: 0; width: 1px; height: 1px; overflow: visible; }
    .nest-scent polyline { fill: none; stroke: var(--ink-faint); stroke-width: 1.2; stroke-dasharray: 1 5; stroke-linecap: round; opacity: .55; transition: opacity 1s; }
    .nest-ant { position: absolute; width: 23px; height: 13px; margin: -6px 0 0 -11px; padding: 0; border: 0; background: none;
      color: var(--ink); cursor: crosshair; pointer-events: auto; }
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
    @media (prefers-reduced-motion: reduce) { .nest-ant.walk .legs-a, .nest-ant.walk .legs-b, .nest-ant.wait svg { animation: none; } }`;
  document.head.append(style);

  // ================================ the panel ================================
  modes.querySelectorAll("[role=tab]").forEach((b) => b.setAttribute("aria-selected", "false"));
  const tab = document.createElement("button");
  tab.type = "button"; tab.setAttribute("role", "tab"); tab.textContent = "Nest"; tab.setAttribute("aria-selected", "true");
  modes.append(tab);
  [...aside.children].forEach((el) => { if (!el.classList.contains("assistant__head")) el.style.display = "none"; });
  const panel = document.createElement("div");
  panel.id = "nest-mock";
  panel.innerHTML = `
    <div class="lbl muted"><span>colony 01</span><span data-k="status">waking</span></div>
    <div class="well"><pre class="nest-pre" role="img" aria-label="Side view of the ant nest"></pre></div>
    <ul class="log" data-k="log" aria-live="polite"></ul>
    <div class="lbl muted"><span>page intact</span><span><span class="bar" data-k="intact"></span> <span data-k="page">100%</span></span></div>
    <div class="lbl muted"><span>next egg</span><span class="bar accent" data-k="bar"></span></div>
    <dl class="stats">
      <dt class="muted">scouts</dt><dd class="accent" data-k="scouts">0</dd><dt class="muted">workers</dt><dd data-k="workers">0</dd>
      <dt class="muted">trails</dt><dd data-k="trails">0</dd><dt class="muted">squashed</dt><dd data-k="squashed">0</dd>
      <dt class="muted">larder</dt><dd class="accent" data-k="larder" style="grid-column: span 3; text-align: left">empty</dd>
    </dl>
    <div class="row"><button data-k="pause">pause colony</button><button data-k="restore" class="muted">restore page</button></div>`;
  aside.append(panel);
  const $ = (k) => panel.querySelector(`[data-k="${k}"]`);
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
  const NURSERY = [0.2, 0.54], LARDER = [0.8, 0.61], QUEEN = [0.5, 0.89];

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
    carve(QUEEN[0] * W, QUEEN[1] * H, R * 1.4, R * 0.7);
  };
  new ResizeObserver(buildNest).observe(well);

  // ================================ the page ================================
  const state = { ants: [], eggs: [], trails: [], larder: [], stolen: new Set(), squashed: 0, meals: 0, paused: false,
    queen: { eat: 0, lay: 0 }, total: 0 };
  if (getComputedStyle(main).position === "static") main.style.position = "relative";
  const layer = document.createElement("div"); layer.className = "nest-layer"; main.append(layer);
  // the layer covers the page exactly and clips what crosses its edge, so nothing scrolls sideways
  const fitLayer = () => { layer.style.height = "0"; layer.style.height = main.scrollHeight + "px"; };
  fitLayer(); new ResizeObserver(fitLayer).observe(main);
  const scent = document.createElementNS("http://www.w3.org/2000/svg", "svg"); scent.classList.add("nest-scent"); layer.append(scent);
  const local = (r) => { const m = main.getBoundingClientRect(); return [r.left - m.left + main.scrollLeft, r.top - m.top + main.scrollTop]; };


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
    const w = 44, h = 16, dots = new Int8Array(w * h).fill(-1); let seed = 3; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = (x - w / 2) / (w / 2), top = h * (u * u) * 0.95; if (y >= top && ((x + y) % 2 === 0 || y < top + 1.2 || rnd() < 0.2)) dots[y * w + x] = y > h - 3 ? 1 : 0; }
    for (let y = 0; y < 4; y++) for (let x = w / 2 - 3; x < w / 2 + 3; x++) dots[y * w + x] = -1;
    let out = "";
    for (let cy = 0; cy < h; cy += 4) { for (let cx = 0; cx < w; cx += 2) { let code = 0, t = -1; for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) { const v = dots[(cy + dy) * w + cx + dx]; if (v >= 0) { code |= bit[dy][dx]; t = Math.max(t, v); } } const ch = String.fromCharCode(0x2800 + code); out += t === 1 ? `<b>${ch}</b>` : ch; } out += "\n"; }
    hill.innerHTML = out.trimEnd();
  }
  layer.append(hill);
  const hr = hill.getBoundingClientRect();
  // Where the hill goes: an empty patch of the visible page that the whole mound fits in, as far
  // from any text as the page allows. Among the roomiest spots one is picked at random.
  const hillBase = (() => {
    const rects = [];
    for (const n of textNodes(main)) { if (!/\S/.test(n.data)) continue; const r = document.createRange(); r.selectNodeContents(n); for (const c of r.getClientRects()) { const [x, y] = local(c); rects.push([x, y, x + c.width, y + c.height]); } }
    main.querySelectorAll("img, svg, button, input, textarea, figure, hr").forEach((el) => { if (layer.contains(el)) return; const c = el.getBoundingClientRect(); if (c.width) { const [x, y] = local(c); rects.push([x, y, x + c.width, y + c.height]); } });
    const w = hr.width, h = hr.height, pad = 14, spots = [];
    for (let y = main.scrollTop + h + 30; y < main.scrollTop + main.clientHeight - 20; y += 18) for (let x = w / 2 + 20; x < main.clientWidth - w / 2 - 20; x += 18) {
      const box = [x - w / 2 - pad, y - h - pad, x + w / 2 + pad, y + pad];
      let near = Infinity;
      for (const r of rects) {
        const dx = Math.max(r[0] - box[2], box[0] - r[2], 0), dy = Math.max(r[1] - box[3], box[1] - r[3], 0);
        near = Math.min(near, Math.hypot(dx, dy)); if (!near) break;
      }
      if (near > 0) spots.push([x, y, near]);
    }
    if (!spots.length) return [main.clientWidth * 0.85, main.scrollTop + main.clientHeight * 0.8];
    const best = Math.max(...spots.map((p) => Math.min(p[2], 160)));
    const roomy = spots.filter((p) => Math.min(p[2], 160) >= best * 0.8);
    return roomy[Math.floor(Math.random() * roomy.length)];
  })();
  hill.style.left = hillBase[0] - hr.width / 2 + "px"; hill.style.top = hillBase[1] - hr.height + "px";
  const hole = [hillBase[0], hillBase[1] - hr.height + 4];

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
        const r = rectOf(n, i); if (!onScreen(r) || (center && !inPatch(r, center))) continue;
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

  const newAnt = (role, route, d) => { state.total++; const a = { id: state.total, role, where: "nest", route, d }; state.ants.push(a); return a; };
  const scoutsOut = () => state.ants.some((a) => a.role === "scout");
  // Workers leaving the nest take the ready trails in turn, skipping any that are full or worked
  // out, so every trail fills at the same pace and a finished trail's ants move to the others.
  const openTrail = () => {
    const ready = state.trails.filter((t) => t.ready && t.ants.size < LINE && remaining(t));
    if (!ready.length) return null;
    state.rr = ((state.rr || 0) + 1) % ready.length;
    return ready[state.rr];
  };
  const join = (ant, t) => { if (ant.trail && ant.trail !== t) ant.trail.ants.delete(ant); ant.trail = t; t.ants.add(ant); };
  const leaveTrail = (ant) => {
    const t = ant.trail; if (!t) return; t.ants.delete(ant); ant.trail = null;
    if (!t.ants.size) { retire(t); log("a trail went cold"); }
  };
  const retire = (t) => { state.trails = state.trails.filter((x) => x !== t); t.line.style.opacity = "0"; setTimeout(() => t.line.remove(), 1000); t.ready = false; t.ants.forEach((a) => (a.trail = null)); };

  // A worker at the top of the tunnel decides whether to go out: follow a trail with room on it,
  // scout if nobody is scouting, or wait in the tunnel.
  const atEntrance = (ant) => {
    if (ant.role === "scout") return emerge(ant);
    const t = openTrail(ant);
    if (t) { join(ant, t); return emerge(ant); }
    if (ant.trail) ant.trail.ants.delete(ant), (ant.trail = null);
    if (!scoutsOut()) { ant.role = "scout"; log("a worker turned scout"); return emerge(ant); }
    ant.d = LEN[ant.route] - 0.01 - 0.025 * waitingRank(ant); // queue in the tunnel
  };
  const waitingRank = (ant) => state.ants.filter((a) => a.where === "nest" && a.route === "up" && a.d > LEN.up - 0.3 && a.id < ant.id).length;

  const emerge = (ant) => {
    ant.where = "page"; ant.x = hole[0]; ant.y = hole[1]; ant.heading = -Math.PI / 2; ant.px = ant.x; ant.py = ant.y;
    ant.el = document.createElement("button"); ant.el.type = "button";
    ant.el.className = "nest-ant walk"; ant.el.innerHTML = ANT_SVG;
    ant.el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); squash(ant); });
    layer.append(ant.el);
    if (ant.role === "scout") scout(ant);
    else { ant.job = "follow"; ant.path = ant.trail.pts.slice(); ant.k = 0; }
    label(ant);
  };
  const label = (ant) => { if (!ant.el) return; ant.el.classList.toggle("scout", ant.role === "scout"); ant.el.setAttribute("aria-label", `${ant.role === "scout" ? "Scout" : "Worker"} ant. Press to squash.`); };

  // A scout wanders: loose waypoints toward a block of text no trail reaches yet, its steps recorded.
  const remaining = (t) => {
    for (const n of textNodes(t.block)) for (let i = 0; i < n.data.length; i++) {
      if (!/\S/.test(n.data[i])) continue;
      const L = letterOf(n, i); if (L.state === "stolen") continue;
      if (inPatch(rectOf(n, i), t.end)) return true;
    }
    return false;
  };

  const scout = (ant) => {
    // the scout heads for a random visible character well clear of every patch already worked
    const options = [];
    for (const n of textNodes(main)) for (let i = 0; i < n.data.length; i += 3) {
      if (!/\S/.test(n.data[i]) || letterOf(n, i).state !== "free") continue;
      const r = rectOf(n, i); if (!onScreen(r)) continue;
      const [x, y] = local(r);
      if (state.trails.some((t) => Math.hypot(t.end[0] - x, t.end[1] - y) < PATCH * 2)) continue;
      options.push([n, x + r.width / 2, y + r.height]);
    }
    if (!options.length) { ant.role = "worker"; ant.job = "home"; ant.path = [hole.slice()]; ant.k = 0; return; }
    const [node, tx, ty] = options[Math.floor(Math.random() * options.length)];
    const block = blockOf(node);
    const path = [];
    for (let s = 1; s <= 4; s++) path.push([hole[0] + (tx - hole[0]) * s / 5 + (Math.random() - 0.5) * 100, hole[1] + (ty - hole[1]) * s / 5 + (Math.random() - 0.5) * 60]);
    path.push([tx, ty]);
    ant.job = "scout"; ant.block = block; ant.path = path; ant.k = 0; ant.walked = [hole.slice()];
  };

  const backPath = (ant) => (ant.trail ? ant.trail.pts.slice().reverse() : []).concat([hole.slice()]);
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
    if (light && L.need > 1 && ant.trail && !ant.trail.ready) { ant.trail.ready = true; scent.append(ant.trail.line); log(`a big “${L.ch}”; the scout calls for help`); }
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
    const leader = L.crew[0];
    leader.cx = L.crew.reduce((s, a) => s + a.x, 0) / L.crew.length; leader.cy = L.crew.reduce((s, a) => s + a.y, 0) / L.crew.length;
    L.crew.forEach((a, k) => { a.job = k ? "crew" : "carry"; a.lead = leader; a.slot = k; a.el.classList.remove("wait"); a.el.classList.add("lift"); setTimeout(() => a.el?.classList.remove("lift"), 400); });
    leader.path = backPath(leader); leader.k = 0;
  };

  // The letter drifts home on a slow, gentle arc, then becomes text again.
  const drop = (L) => {
    if (!L || L.state !== "carried") return;
    L.state = "returning";
    const g = L.glyph, sx = parseFloat(g.style.left), sy = parseFloat(g.style.top), [ex, ey] = L.home;
    const lift = Math.min(60, 20 + Math.hypot(ex - sx, ey - sy) * 0.15);
    const frames = [0, 0.25, 0.5, 0.75, 1].map((t) => ({ left: sx + (ex - sx) * t + "px", top: sy + (ey - sy) * t - Math.sin(t * Math.PI) * lift + "px", transform: `rotate(${(1 - t) * 6 * Math.sin(t * 9)}deg)` }));
    g.animate(frames, { duration: 3800, easing: "cubic-bezier(.45,.05,.35,1)" }).finished.then(() => {
      showChar(L); g.remove(); L.glyph = null; L.state = "free"; L.crew = [];
    });
    L.crew.forEach((a) => { if (a.el) goHome(a); });
  };

  const squash = (ant) => {
    const L = ant.letter;
    if (L && L.state === "carried") drop(L);
    else if (L) { L.crew = L.crew.filter((a) => a !== ant); if (!L.crew.length) L.state = "free"; }
    const mark = document.createElement("div"); mark.className = "nest-squash"; mark.textContent = "⠪⠕";
    mark.style.left = ant.px - 8 + "px"; mark.style.top = ant.py - 9 + "px"; layer.append(mark);
    requestAnimationFrame(() => (mark.style.opacity = "0")); setTimeout(() => mark.remove(), 1500);
    ant.el?.remove(); ant.el = null;
    state.ants = state.ants.filter((a) => a !== ant); state.squashed++;
    leaveTrail(ant);
    if (!state.ants.length) { newAnt("scout", "hatch", 0); log("the colony is gone; the queen sends a scout"); }
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
    if (d > 0.5) ant.heading = Math.atan2(dy, dx);
    if (d <= v) { ant.x = tx; ant.y = ty; return true; }
    if (ant.job !== "carry" && blocked(ant)) { ant.paused = true; ant.stuck = (ant.stuck || 0) + dt; return false; }
    ant.paused = false; if (ant.stuck) ant.stuck = Math.max(0, ant.stuck - dt * 0.5);
    const wob = Math.sin(performance.now() / 140 + ant.id) * 0.3;
    ant.x += (dx / d) * v - (dy / d) * wob; ant.y += (dy / d) * v + (dx / d) * wob; return false;
  };

  const stepPage = (ant, dt) => {
    ant.px = ant.x; ant.py = ant.y;
    if (ant.job === "wait" || ant.job === "crew") return; // crew members are placed by their leader
    const goal = ant.path[ant.k]; if (!goal) return;
    const L = ant.letter;
    if (ant.job === "carry") { // the leader moves the centre of the crew; everyone stands under the letter
      ant.x = ant.cx; ant.y = ant.cy;
      const arrived = move(ant, goal[0], goal[1], dt, SPEED / (1 + 0.3 * (L.need - 1)));
      ant.cx = ant.x; ant.cy = ant.y;
      const n = L.crew.length, nx = -Math.sin(ant.heading), ny = Math.cos(ant.heading);
      L.crew.forEach((a, k) => { const off = (k - (n - 1) / 2) * 12; a.x = a.px = ant.cx + nx * off; a.y = a.py = ant.cy + ny * off; a.heading = ant.heading; });
      const t = performance.now() / 260;
      L.glyph.style.left = ant.cx - L.glyph.offsetWidth / 2 + "px";
      L.glyph.style.top = ant.cy - L.glyph.offsetHeight - 5 + Math.sin(t) * 1.2 + "px";
      L.glyph.style.transform = `rotate(${Math.sin(t * 0.8) * 3}deg)`;
      if (!arrived || ++ant.k < ant.path.length) return;
      L.glyph.remove(); L.state = "stolen"; state.stolen.add(L);
      if (ant.trail && !ant.trail.ready) { ant.trail.ready = true; scent.append(ant.trail.line); log("the scout is home; a trail is laid"); }
      if (ant.role === "scout") { ant.role = "worker"; }
      L.crew.forEach((a) => { if (a !== ant && a.el) enterNest(a, null); });
      return enterNest(ant, L.ch);
    }
    if (!move(ant, goal[0], goal[1], dt, SPEED)) {
      if (ant.job === "scout" && Math.hypot(ant.x - ant.walked[ant.walked.length - 1][0], ant.y - ant.walked[ant.walked.length - 1][1]) > 14) ant.walked.push([ant.x, ant.y]);
      ant.px = ant.x; ant.py = ant.y; return;
    }
    ant.px = ant.x; ant.py = ant.y;
    if (++ant.k < ant.path.length) return;
    if (ant.job === "scout") { // found food: the walk becomes a trail and the scout becomes a worker
      ant.walked.push([ant.x, ant.y]);
      // the trail exists from here but stays unscented and closed until the scout gets a letter home
      const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      line.setAttribute("points", ant.walked.map((p) => p.join(",")).join(" "));
      const t = { pts: ant.walked, block: ant.block, end: [ant.x, ant.y], ants: new Set(), line, ready: false };
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
    } else enterNest(ant, null);
  };

  const stepNest = (ant, dt) => {
    if (ant.route === "up" && ant.d >= LEN.up - 0.3 && ant.d < LEN.up && ant.held) { ant.held = false; }
    ant.d += NEST_SPEED * dt;
    if (ant.d < LEN[ant.route]) return;
    if (ant.route === "hatch") { ant.route = "up"; ant.d = LEN.up; return atEntrance(ant); }
    if (ant.route === "down") { if (ant.food) state.larder.push(ant.food); ant.route = "feed"; ant.d = 0; ant.food = ant.food ? "meal" : null; return; }
    if (ant.route === "feed") {
      if (ant.food) {
        state.larder.shift(); state.meals++; state.queen.eat = 0.8;
        if (state.meals % 3 === 0) { state.queen.lay = 1; setTimeout(() => { state.eggs.push({ d: 0, age: 0 }); log("the queen laid an egg"); }, 900); }
      }
      ant.food = null; ant.route = "up"; ant.d = 0; return;
    }
    if (ant.route === "up") atEntrance(ant);
  };

  // ================================ drawing the nest ================================
  const drawNest = (now) => {
    if (!base) return;
    const d = base.slice();
    const put = (x, y, t) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) d[y * W + x] = t; };
    const step = Math.floor(now / 180) % 2;
    const qx = QUEEN[0] * W, qy = QUEEN[1] * H, q = state.queen;
    const swell = 1 + 0.06 * Math.sin(now / 400) + 0.25 * q.lay;
    const ax = R * 0.6 * swell, ay = R * 0.26 * swell;
    for (let j = -ay; j <= ay; j++) for (let i = -ax; i <= ax; i++) if ((i * i) / (ax * ax) + (j * j) / (ay * ay) <= 1 && (Math.round(i + j) % 2 === 0 || Math.abs(j) < ay * 0.5)) put(qx + R * 0.15 + i, qy + j, 6);
    const hx = qx - R * 0.6 - (q.eat > 0 ? step * 2 : 0);
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { put(qx - R * 0.45 + i, qy + j, 6); if (Math.abs(i) + Math.abs(j) < 3) put(hx - 4 + i, qy + j, 6); }
    for (let k = -1; k <= 1; k++) for (let s = 1; s < 4; s++) { const lx = qx - R * 0.45 + k * 3 + s * k + (step && k === 0 ? 1 : 0); put(lx, qy + 2 + s, 6); put(lx, qy - 2 - s, 6); }
    if (q.eat > 0) { put(hx - 8 + q.eat * 3, qy, 5); put(hx - 8 + q.eat * 3, qy - 1, 5); }
    if (q.lay > 0) put(qx + R * 0.15 + ax + 2, qy, 4);
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
    $("scouts").textContent = state.ants.filter((a) => a.role === "scout").length;
    $("workers").textContent = state.ants.filter((a) => a.role === "worker").length;
    $("trails").textContent = state.trails.length; $("squashed").textContent = state.squashed;
    const intact = 1 - state.stolen.size / Math.max(1, pageLetters), cells = 12, full = Math.round(intact * cells);
    $("page").textContent = (intact * 100).toFixed(intact < 1 ? 1 : 0) + "%";
    $("intact").textContent = "⣿".repeat(full) + "⣀".repeat(cells - full);
    $("larder").textContent = [...state.stolen].slice(-14).map((L) => L.ch).join("") || "empty";
    const fed = state.meals % 3; $("bar").textContent = "⣿⣿⣿⣿".repeat(fed) + "⣀⣀⣀⣀".repeat(3 - fed);
    $("status").textContent = state.paused ? "paused" : state.queen.lay > 0 ? "laying" : state.queen.eat > 0 ? "feeding" : scoutsOut() ? "scouting" : state.trails.length ? "foraging" : "resting";
  };

  // ================================ the loop ================================
  let last = performance.now(), tick = 0;
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!state.paused) {
      state.ants.slice().forEach((a) => (a.where === "nest" ? stepNest(a, dt) : stepPage(a, dt)));
      state.ants.forEach((a) => { if (a.el) { a.el.style.left = a.px + "px"; a.el.style.top = a.py + "px"; a.el.style.transform = `rotate(${a.heading + Math.PI}rad)`; a.el.classList.toggle("walk", a.job !== "wait" && !a.paused); } });
      state.queen.eat = Math.max(0, state.queen.eat - dt); state.queen.lay = Math.max(0, state.queen.lay - dt * 0.7);
      state.eggs.slice().forEach((e) => {
        if (e.d < LEN.lay) e.d += NEST_SPEED * 0.6 * dt;
        else if ((e.age += dt) > 4 && state.ants.length < MAX_ANTS) { state.eggs.splice(state.eggs.indexOf(e), 1); newAnt("worker", "hatch", 0); log("an egg hatched"); }
      });
    }
    if ((tick = (tick + 1) % 6) === 0) {
      if (!state.paused) state.trails.slice().forEach((t) => { if (!remaining(t)) { retire(t); log("a trail ran out of letters"); } });
      drawNest(now); drawStats();
    }
    requestAnimationFrame(frame);
  };

  $("pause").addEventListener("click", () => {
    state.paused = !state.paused; $("pause").textContent = state.paused ? "wake colony" : "pause colony";
    layer.querySelectorAll(".nest-ant").forEach((el) => el.classList.toggle("walk", !state.paused));
  });
  $("restore").addEventListener("click", () => {
    state.ants.forEach((a) => { if (a.letter?.state === "carried") drop(a.letter); });
    state.stolen.forEach((L) => { showChar(L); L.state = "free"; L.crew = []; });
    state.stolen.clear(); state.larder = []; log("every letter is back");
  });

  // Six ants to start: two scouts on their way up, four workers waiting in the tunnel below them.
  newAnt("scout", "hatch", LEN.hatch * 0.85); newAnt("scout", "hatch", LEN.hatch * 0.55);
  for (let k = 0; k < 4; k++) newAnt("worker", "up", LEN.up - 0.06 - k * 0.025);
  log("the colony wakes; two scouts head out");
  requestAnimationFrame(frame);
})();
