// Nest mockup: open any page with ?nest in the address. A playable sketch of plans/ant-nest-game.md.
//
// One colony, two views. Every ant is either in the nest (drawn in Braille dots in the sidebar) or
// out on the page (a small dot SVG). A scout wanders out, finds a block of text, lifts a letter and
// walks home, which lays a trail. Ants that come out next follow that trail until six are on it;
// the seventh goes scouting for a new one. Big letters need a crew of two or three ants. A letter
// travels in its own colour, font and underline. Home, the letter goes to the larder, then to the
// queen, who eats and lays an egg every third meal; the egg is carried to the nursery and hatches.
// Click an ant to squash it: a letter it was carrying drifts slowly back into its slot.
// Every colour is a theme token, so each flavor recolours the nest.
(() => {
  const modes = document.querySelector(".assistant__modes");
  const aside = document.querySelector(".assistant");
  const main = document.querySelector(".app-shell__main") || document.querySelector("main");
  if (!modes || !aside || !main || document.getElementById("nest-mock")) return;

  const LINE = 6;          // ants on one trail before the next one scouts a new trail
  const MAX_ANTS = 24;
  const SPEED = 40;        // page pixels per second
  const NEST_SPEED = 0.16; // nest units per second

  const style = document.createElement("style");
  style.textContent = `
    #nest-mock { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: var(--space-2, 8px);
      padding: var(--space-3, 12px); font: 12px/1.4 var(--font-mono); color: var(--ink); }
    #nest-mock .muted { color: var(--ink-muted); }
    #nest-mock .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; display: flex; justify-content: space-between; }
    #nest-mock .well { flex: 1 1 0; min-height: 0; overflow: hidden; background: var(--paper-2); border: 1px solid var(--color-line);
      display: flex; align-items: center; justify-content: center; }
    .nest-pre { margin: 0; font-family: var(--font-mono); font-size: 10px; line-height: 1.2; letter-spacing: -0.04em;
      -webkit-text-stroke: 0.05em currentColor; color: var(--ink-faint); user-select: none; }
    .nest-pre b { font-weight: inherit; }
    .nest-pre .t1 { color: var(--ink-muted); } .nest-pre .t2, .nest-pre .t5, .nest-pre .t6 { color: var(--color-accent); }
    .nest-pre .t3, .nest-pre .t4 { color: var(--ink); }
    #nest-mock .stats { display: grid; grid-template-columns: auto 1fr auto 1fr; gap: 2px 10px; margin: 0; align-items: baseline; }
    #nest-mock .stats dt, #nest-mock .stats dd { margin: 0; font-size: 12px; line-height: 1.4; }
    #nest-mock .stats dd { text-align: right; }
    #nest-mock .accent { color: var(--color-accent); }
    #nest-mock .row { display: flex; gap: 6px; }
    #nest-mock button { flex: 1; padding: 6px; background: none; border: 1px solid currentColor; color: inherit; font: inherit; cursor: pointer; }
    .nest-layer { position: absolute; left: 0; top: 0; width: 0; height: 0; z-index: 50; pointer-events: none; }
    .nest-ant { position: absolute; width: 23px; height: 13px; margin: -6px 0 0 -11px; padding: 0; border: 0; background: none;
      color: var(--ink); cursor: crosshair; pointer-events: auto; }
    .nest-ant svg { display: block; overflow: visible; }
    .nest-ant .legs-b { opacity: 0; }
    .nest-ant.walk .legs-a { animation: nest-step .18s steps(1) infinite; }
    .nest-ant.walk .legs-b { animation: nest-step .18s steps(1) infinite reverse; }
    .nest-ant.lift svg { animation: nest-lift .35s ease-out; }
    .nest-ant.wait svg { animation: nest-wait 1s ease-in-out infinite; }
    @keyframes nest-step { 0% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes nest-lift { 40% { transform: translateY(-3px) scale(1.08); } }
    @keyframes nest-wait { 50% { transform: rotate(8deg); } }
    .nest-letter { position: absolute; white-space: pre; pointer-events: none; line-height: 1; }
    .nest-letter.home { transition: left 1.8s cubic-bezier(.3,.7,.3,1), top 1.8s cubic-bezier(.3,.7,.3,1); }
    .nest-squash { position: absolute; color: var(--ink-faint); font: 14px var(--font-mono); pointer-events: none; transition: opacity 1.2s; }
    .nest-crack { position: absolute; font: 16px/1.2 var(--font-mono); letter-spacing: -0.04em; white-space: pre; color: var(--ink-muted);
      -webkit-text-stroke: 0.05em currentColor; pointer-events: none; transform: translate(-50%, -50%); }
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
    <div class="lbl muted"><span>next egg</span><span class="accent" data-k="bar"></span></div>
    <dl class="stats">
      <dt class="muted">on page</dt><dd data-k="out">0</dd><dt class="muted">in nest</dt><dd data-k="in">0</dd>
      <dt class="muted">trails</dt><dd data-k="trails">0</dd><dt class="muted">squashed</dt><dd data-k="squashed">0</dd>
      <dt class="muted">stolen</dt><dd data-k="stolen">0</dd><dt class="muted">page</dt><dd data-k="page">100%</dd>
      <dt class="muted">larder</dt><dd class="accent" data-k="larder" style="grid-column: span 3; text-align: left">empty</dd>
    </dl>
    <div class="row"><button data-k="pause">pause colony</button><button data-k="restore" class="muted">restore page</button></div>`;
  aside.append(panel);
  const $ = (k) => panel.querySelector(`[data-k="${k}"]`);
  const pre = panel.querySelector(".nest-pre");
  const well = panel.querySelector(".well");

  // ================================ the nest ================================
  // Routes in nest units (0..1 across, 0..1 down). Ants and eggs in the nest hold a route and a
  // distance along it, so the nest can be redrawn at any size without losing anyone.
  const ROUTES = {
    down:  [[0.5, 0.0], [0.5, 0.24], [0.73, 0.4], [0.8, 0.57]],              // entrance to larder
    feed:  [[0.8, 0.57], [0.68, 0.76], [0.58, 0.86]],                        // larder to the queen
    up:    [[0.58, 0.86], [0.38, 0.72], [0.32, 0.43], [0.5, 0.24], [0.5, 0.0]], // queen back out
    lay:   [[0.42, 0.88], [0.38, 0.72], [0.3, 0.47], [0.2, 0.5]],            // egg to the nursery
    hatch: [[0.2, 0.5], [0.32, 0.43], [0.5, 0.24], [0.5, 0.0]],              // newborn to the entrance
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
    const e = r[r.length - 1]; return [e[0], e[1], 0];
  };
  const NURSERY = [0.2, 0.5], LARDER = [0.8, 0.58], QUEEN = [0.5, 0.88];

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
    const sky = Math.round(H * 0.05);
    for (let y = sky + 2; y < H; y++) for (let x = 0; x < W; x++) if ((x + 2 * y) % 4 === 0 || rnd() < 0.05) set(x, y, y < H * 0.3 ? 1 : 0);
    for (let x = 0; x < W; x++) { set(x, sky + Math.round(Math.sin(x / 5)), 2); if (x % 3 === 0) set(x, sky - 2 + (x % 2), 2); }
    const carve = (cx, cy, rx, ry) => { for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) if ((i * i) / (rx * rx) + (j * j) / (ry * ry) <= 1) clear(cx + i, cy + j); };
    Object.values(ROUTES).forEach((r) => { for (let k = 0; k < r.length - 1; k++) for (let s = 0; s <= 50; s++) carve((r[k][0] + (r[k + 1][0] - r[k][0]) * s / 50) * W, (r[k][1] + (r[k + 1][1] - r[k][1]) * s / 50) * H, 2, 2); });
    carve(NURSERY[0] * W, NURSERY[1] * H, R * 0.85, R * 0.45);
    carve(LARDER[0] * W, LARDER[1] * H, R * 0.85, R * 0.45);
    carve(QUEEN[0] * W, QUEEN[1] * H, R * 1.4, R * 0.7);
  };
  new ResizeObserver(buildNest).observe(well);

  // ================================ the colony ================================
  const state = { ants: [], eggs: [], trails: [], larder: [], stolen: new Set(), squashed: 0, meals: 0, paused: false,
    queen: { eat: 0, lay: 0 }, total: 0 };
  const cs0 = getComputedStyle(main); if (cs0.position === "static") main.style.position = "relative";
  const layer = document.createElement("div"); layer.className = "nest-layer"; main.append(layer);
  const local = (r) => { const m = main.getBoundingClientRect(); return [r.left - m.left + main.scrollLeft, r.top - m.top + main.scrollTop]; };
  const hole = [main.clientWidth * 0.82, Math.min(main.clientHeight * 0.6, 420) + main.scrollTop];
  const crack = document.createElement("div"); crack.className = "nest-crack";
  crack.textContent = "⢀⣠⡴⠾⠛⠳⣦⣤⡴⠞⠋⠙⠷⣤⣀\n⠀⠈⠛⠛⠛⠋⠉⠙⠛⠋";
  crack.style.left = hole[0] + "px"; crack.style.top = hole[1] + "px"; layer.append(crack);

  // ---- letters on the page
  const letterAt = new Map(); // "node index" key is awkward, so letters hang off a WeakMap per node
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
  const pageLetters = textNodes(main).reduce((s, n) => s + (n.data.match(/[A-Za-z]/g) || []).length, 0);
  const setChar = (n, i, ch) => { n.data = n.data.slice(0, i) + ch + n.data.slice(i + 1); };
  const blockOf = (n) => n.parentElement.closest("p, h1, h2, h3, h4, li, dd, blockquote, figcaption, a") || n.parentElement;

  // free letters in a block, the ones a crew is already gathering at first
  const freeIn = (block, from) => {
    const found = [];
    for (const n of textNodes(block)) for (let i = 0; i < n.data.length; i++) {
      if (!/[A-Za-z]/.test(n.data[i])) continue;
      const L = letterOf(n, i); L.ch = n.data[i];
      if (L.state === "free" || (L.state === "gather" && L.crew.length < L.need)) {
        const r = rectOf(n, i); if (!onScreen(r)) continue;
        const [x, y] = local(r); found.push({ L, x: x + r.width / 2, y: y + r.height / 2, r });
      }
    }
    found.sort((a, b) => (b.L.state === "gather") - (a.L.state === "gather") || Math.hypot(a.x - from[0], a.y - from[1]) - Math.hypot(b.x - from[0], b.y - from[1]));
    return found;
  };

  // A carried letter is a copy of the original glyph in the original's own style: colour, face,
  // size, weight, case, and the underline of whichever ancestor draws one.
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

  const hatch = () => { if (state.ants.length >= MAX_ANTS) return; state.total++; state.ants.push({ id: state.total, where: "nest", route: "hatch", d: 0 }); };

  const emerge = (ant) => {
    ant.where = "page"; ant.x = hole[0]; ant.y = hole[1]; ant.heading = Math.PI / 2;
    ant.el = document.createElement("button"); ant.el.type = "button";
    ant.el.className = "nest-ant walk"; ant.el.setAttribute("aria-label", "Ant. Press to squash."); ant.el.innerHTML = ANT_SVG;
    ant.el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); squash(ant); });
    layer.append(ant.el);
    const trail = state.trails.find((t) => t.ants.size < LINE && freeIn(t.block, t.end).length);
    if (trail) { ant.job = "follow"; ant.trail = trail; trail.ants.add(ant); ant.path = trail.pts.slice(); ant.k = 0; }
    else scout(ant);
  };

  // A scout wanders: a few loose waypoints toward a block it cannot see yet, its steps recorded.
  const scout = (ant) => {
    const blocks = [...new Set(textNodes(main).filter((n) => /[A-Za-z]/.test(n.data) && onScreen(n.parentElement.getBoundingClientRect())).map(blockOf))]
      .filter((b) => !state.trails.some((t) => t.block === b));
    if (!blocks.length) { ant.job = "home"; ant.path = [hole.slice()]; ant.k = 0; return; }
    const block = blocks[Math.floor(Math.random() * blocks.length)];
    const [bx, by] = local(block.getBoundingClientRect());
    const tx = bx + Math.random() * Math.min(200, block.getBoundingClientRect().width), ty = by + block.getBoundingClientRect().height / 2;
    const path = [];
    for (let s = 1; s <= 4; s++) path.push([hole[0] + (tx - hole[0]) * s / 5 + (Math.random() - 0.5) * 90, hole[1] + (ty - hole[1]) * s / 5 + (Math.random() - 0.5) * 60]);
    path.push([tx, ty]);
    ant.job = "scout"; ant.block = block; ant.path = path; ant.k = 0; ant.walked = [hole.slice()];
  };

  const toLetter = (ant, block) => {
    const pick = freeIn(block, [ant.x, ant.y])[0];
    if (!pick) { ant.job = "home"; ant.path = backPath(ant); ant.k = 0; return; }
    const L = pick.L;
    if (L.state === "free") { L.need = parseFloat(getComputedStyle(L.n.parentElement).fontSize) >= 28 ? 3 : parseFloat(getComputedStyle(L.n.parentElement).fontSize) >= 20 ? 2 : 1; L.state = "gather"; }
    L.crew.push(ant); ant.letter = L; ant.job = "toLetter"; ant.path = [[pick.x + (L.crew.length - 1) * 9 - 6, pick.y + 6]]; ant.k = 0;
  };

  const backPath = (ant) => (ant.trail ? ant.trail.pts.slice().reverse() : []).concat([hole.slice()]);

  const lift = (L) => {
    const r = rectOf(L.n, L.i); const [x, y] = local(r);
    const glyph = document.createElement("span"); glyph.className = "nest-letter"; glyph.textContent = L.ch;
    glyph.style.cssText += lookOf(L.n.parentElement); glyph.style.left = x + "px"; glyph.style.top = y + "px";
    layer.append(glyph);
    L.home = [x, y]; L.glyph = glyph; L.state = "carried";
    setChar(L.n, L.i, " ");
    const leader = L.crew[0];
    L.crew.forEach((a, k) => { a.job = k ? "crew" : "carry"; a.lead = leader; a.slot = k; a.el.classList.remove("wait"); a.el.classList.add("lift"); setTimeout(() => a.el?.classList.remove("lift"), 400); });
    leader.path = backPath(leader); leader.k = 0;
  };

  const drop = (L) => { // the letter drifts back to its slot, then becomes text again
    if (!L || L.state !== "carried") return;
    L.state = "returning";
    const g = L.glyph; g.classList.add("home");
    requestAnimationFrame(() => { g.style.left = L.home[0] + "px"; g.style.top = L.home[1] + "px"; });
    setTimeout(() => { setChar(L.n, L.i, L.ch); g.remove(); L.glyph = null; L.state = "free"; L.crew = []; }, 1900);
    L.crew.forEach((a) => { if (a.el) { a.job = "home"; a.letter = null; a.path = backPath(a); a.k = 0; } });
  };

  const squash = (ant) => {
    const L = ant.letter;
    if (L && L.state === "carried") drop(L);
    else if (L) { L.crew = L.crew.filter((a) => a !== ant); if (!L.crew.length) L.state = "free"; }
    const mark = document.createElement("div"); mark.className = "nest-squash"; mark.textContent = "⠪⠕";
    mark.style.left = ant.x - 8 + "px"; mark.style.top = ant.y - 9 + "px"; layer.append(mark);
    requestAnimationFrame(() => (mark.style.opacity = "0")); setTimeout(() => mark.remove(), 1300);
    leavePage(ant); state.ants = state.ants.filter((a) => a !== ant); state.squashed++;
  };

  const leavePage = (ant) => { ant.el?.remove(); ant.el = null; ant.trail?.ants.delete(ant); };

  const enterNest = (ant, carrying) => {
    leavePage(ant); ant.where = "nest"; ant.route = "down"; ant.d = 0; ant.food = carrying || null; ant.letter = null; ant.trail = null;
  };

  const move = (ant, tx, ty, dt, speed) => {
    const dx = tx - ant.x, dy = ty - ant.y, d = Math.hypot(dx, dy), v = speed * dt;
    if (d > 0.5) ant.heading = Math.atan2(dy, dx);
    if (d <= v) { ant.x = tx; ant.y = ty; return true; }
    const wob = Math.sin(performance.now() / 140 + ant.id) * 0.35;
    ant.x += (dx / d) * v - (dy / d) * wob; ant.y += (dy / d) * v + (dx / d) * wob; return false;
  };

  const stepPage = (ant, dt) => {
    if (ant.job === "wait") return;
    if (ant.job === "crew") { // walk beside the leader, under the same letter
      const L = ant.lead; if (!L.el) { ant.job = "home"; ant.path = backPath(ant); ant.k = 0; return; }
      const side = ant.slot % 2 ? 1 : -1;
      move(ant, L.x + Math.cos(L.heading + Math.PI / 2) * 9 * side, L.y + Math.sin(L.heading + Math.PI / 2) * 9 * side, dt, SPEED * 1.4);
      ant.heading = L.heading; return;
    }
    const goal = ant.path[ant.k]; if (!goal) return;
    const L = ant.letter;
    const slow = ant.job === "carry" ? 1 / (1 + 0.35 * (L.need - 1)) : 1;
    if (!move(ant, goal[0], goal[1], dt, SPEED * slow)) {
      if (ant.job === "scout" && ant.walked && Math.hypot(ant.x - ant.walked[ant.walked.length - 1][0], ant.y - ant.walked[ant.walked.length - 1][1]) > 14) ant.walked.push([ant.x, ant.y]);
      if (ant.job === "carry") { L.glyph.style.left = ant.x - L.glyph.offsetWidth / 2 + "px"; L.glyph.style.top = ant.y - L.glyph.offsetHeight - 5 + "px"; }
      return;
    }
    if (++ant.k < ant.path.length) return;
    // reached the end of the path
    if (ant.job === "scout") { // found food: this walk becomes a trail
      ant.walked.push([ant.x, ant.y]);
      const t = { pts: ant.walked, block: ant.block, end: [ant.x, ant.y], ants: new Set([ant]) };
      state.trails.push(t); ant.trail = t; toLetter(ant, ant.block);
    } else if (ant.job === "follow") toLetter(ant, ant.trail.block);
    else if (ant.job === "toLetter") {
      const L2 = ant.letter;
      if (!L2 || L2.state !== "gather") { ant.job = "home"; ant.path = backPath(ant); ant.k = 0; return; }
      if (L2.crew.length >= L2.need && L2.crew.every((a) => a.job === "wait" || a === ant)) lift(L2);
      else { ant.job = "wait"; ant.el.classList.add("wait"); }
    } else if (ant.job === "carry") {
      const L3 = ant.letter; L3.glyph.remove(); L3.state = "stolen"; state.stolen.add(L3);
      L3.crew.forEach((a) => { if (a !== ant && a.el) enterNest(a, null); });
      enterNest(ant, L3.ch);
    } else enterNest(ant, null);
  };

  const stepNest = (ant, dt) => {
    ant.d += NEST_SPEED * dt;
    if (ant.d < LEN[ant.route]) return;
    if (ant.route === "hatch") return emerge(ant);
    if (ant.route === "down") { if (ant.food) state.larder.push(ant.food); ant.route = "feed"; ant.d = 0; ant.food = ant.food ? "meal" : null; return; }
    if (ant.route === "feed") {
      if (ant.food) { state.larder.shift(); state.meals++; state.queen.eat = 0.8; if (state.meals % 3 === 0) { state.queen.lay = 1; setTimeout(() => state.eggs.push({ d: 0, age: 0 }), 900); } }
      ant.food = null; ant.route = "up"; ant.d = 0; return;
    }
    if (ant.route === "up") emerge(ant);
  };

  // ================================ drawing the nest ================================
  const drawNest = (now) => {
    if (!base) return;
    const d = base.slice();
    const put = (x, y, t) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) d[y * W + x] = t; };
    const step = Math.floor(now / 180) % 2;
    // queen: abdomen breathes, swells while laying; head bobs while eating
    const qx = QUEEN[0] * W, qy = QUEEN[1] * H, q = state.queen;
    const swell = 1 + 0.06 * Math.sin(now / 400) + 0.25 * q.lay;
    const ax = R * 0.6 * swell, ay = R * 0.26 * swell;
    for (let j = -ay; j <= ay; j++) for (let i = -ax; i <= ax; i++) if ((i * i) / (ax * ax) + (j * j) / (ay * ay) <= 1 && (Math.round(i + j) % 2 === 0 || Math.abs(j) < ay * 0.5)) put(qx + R * 0.15 + i, qy + j, 6);
    const hx = qx - R * 0.6 - (q.eat > 0 ? step * 2 : 0);
    for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { put(qx - R * 0.45 + i, qy + j, 6); if (Math.abs(i) + Math.abs(j) < 3) put(hx - 4 + i, qy + j, 6); }
    for (let k = -1; k <= 1; k++) for (let s = 1; s < 4; s++) { const lx = qx - R * 0.45 + k * 3 + s * k + (step && k === 0 ? 1 : 0); put(lx, qy + 2 + s, 6); put(lx, qy - 2 - s, 6); }
    if (q.eat > 0) { put(hx - 8 + q.eat * 3, qy, 5); put(hx - 8 + q.eat * 3, qy - 1, 5); }   // a letter going in
    if (q.lay > 0) put(qx + R * 0.15 + ax + 2, qy, 4);                                       // an egg coming out
    // larder: one gold pair of dots per stored letter
    state.larder.forEach((_, k) => { if (k < R * 0.8) { put(LARDER[0] * W - R * 0.7 + k * 2, LARDER[1] * H + 2, 5); put(LARDER[0] * W - R * 0.7 + k * 2, LARDER[1] * H + 1 - (k % 2), 5); } });
    // eggs: carried along the lay route, then waiting in the nursery, wobbling before they hatch
    state.eggs.forEach((e, k) => {
      const [u, v] = e.d < LEN.lay ? along("lay", e.d) : [NURSERY[0] - 0.08 + (k % 5) * 0.035, NURSERY[1] + 0.01];
      const wob = e.d >= LEN.lay && e.age > 2 ? step : 0;
      put(u * W + wob, v * H, 4); put(u * W + 1 + wob, v * H, 4);
    });
    // ants inside: four body dots on the route, legs flicking either side, a gold dot ahead if fed
    state.ants.forEach((a) => {
      if (a.where !== "nest") return;
      const [u, v, ang] = along(a.route, Math.min(a.d, LEN[a.route]));
      const x = u * W, y = v * H, cx = Math.cos(ang), cy = Math.sin(ang);
      for (let s = -2; s <= 1; s++) put(x + cx * s, y + cy * s, 3);
      const leg = step ? 1 : -1; put(x - cy * 1.5 + cx * leg, y + cx * 1.5 + cy * leg, 3); put(x + cy * 1.5 - cx * leg, y - cx * 1.5 - cy * leg, 3);
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
    const out = state.ants.filter((a) => a.where === "page").length;
    $("out").textContent = out; $("in").textContent = state.ants.length - out;
    $("trails").textContent = state.trails.filter((t) => t.ants.size).length;
    $("squashed").textContent = state.squashed; $("stolen").textContent = state.stolen.size;
    $("page").textContent = Math.round(100 * (1 - state.stolen.size / Math.max(1, pageLetters))) + "%";
    $("larder").textContent = [...state.stolen].slice(-14).map((L) => L.ch).join("") || "empty";
    const fed = state.meals % 3; $("bar").textContent = "⣿⣿⣿⣿".repeat(fed) + "⣀⣀⣀⣀".repeat(3 - fed);
    $("status").textContent = state.paused ? "paused" : !state.ants.length && !state.eggs.length ? "beaten" : state.queen.lay > 0 ? "laying" : state.queen.eat > 0 ? "feeding" : "foraging";
  };

  // ================================ the loop ================================
  let last = performance.now(), tick = 0;
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!state.paused) {
      state.ants.slice().forEach((a) => (a.where === "nest" ? stepNest(a, dt) : stepPage(a, dt)));
      state.ants.forEach((a) => { if (a.el) { a.el.style.left = a.x + "px"; a.el.style.top = a.y + "px"; a.el.style.transform = `rotate(${a.heading + Math.PI}rad)`; a.el.classList.toggle("walk", a.job !== "wait"); } });
      state.queen.eat = Math.max(0, state.queen.eat - dt); state.queen.lay = Math.max(0, state.queen.lay - dt * 0.7);
      state.eggs.slice().forEach((e) => { if (e.d < LEN.lay) e.d += NEST_SPEED * 0.6 * dt; else if ((e.age += dt) > 4) { state.eggs.splice(state.eggs.indexOf(e), 1); hatch(); } });
      state.trails = state.trails.filter((t) => t.ants.size || freeIn(t.block, t.end).length);
    }
    if ((tick = (tick + 1) % 6) === 0) { drawNest(now); drawStats(); }
    requestAnimationFrame(frame);
  };

  $("pause").addEventListener("click", () => {
    state.paused = !state.paused; $("pause").textContent = state.paused ? "wake colony" : "pause colony";
    layer.querySelectorAll(".nest-ant").forEach((el) => el.classList.toggle("walk", !state.paused));
  });
  $("restore").addEventListener("click", () => {
    state.ants.forEach((a) => { if (a.letter?.state === "carried") drop(a.letter); });
    state.stolen.forEach((L) => { setChar(L.n, L.i, L.ch); L.state = "free"; L.crew = []; });
    state.stolen.clear(); state.larder = [];
  });

  // the colony starts with three ants on their way out and two eggs in the nursery
  for (let k = 0; k < 3; k++) { hatch(); state.ants[k].d = LEN.hatch * (0.7 - k * 0.25); }
  state.eggs.push({ d: LEN.lay, age: 1 }, { d: LEN.lay, age: 0 });
  requestAnimationFrame(frame);
})();
