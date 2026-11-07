// Nest mockup: open any page with ?nest in the address. A playable sketch of plans/ant-nest-game.md:
// ants leave a crack in the page, steal real letters, carry them to the queen, and every three
// letters she lays another ant. Click an ant to squash it; a carried letter goes back where it was.
// Every colour is a theme token, so each flavor recolours it: soil in faint and muted ink, the ants
// in ink, and the queen, the grass and the stolen letters in the flavor accent.
(() => {
  const modes = document.querySelector(".assistant__modes");
  const aside = document.querySelector(".assistant");
  const main = document.querySelector(".app-shell__main") || document.querySelector("main");
  if (!modes || !aside || !main || document.getElementById("nest-mock")) return;

  const style = document.createElement("style");
  style.textContent = `
    #nest-mock { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: var(--space-2, 8px);
      padding: var(--space-3, 12px); font: 12px/1.4 var(--font-mono); color: var(--ink); }
    #nest-mock .muted { color: var(--ink-muted); }
    #nest-mock .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; display: flex; justify-content: space-between; }
    #nest-mock .well { flex: 1; min-height: 0; overflow: hidden; background: var(--paper-2); border: 1px solid var(--color-line); }
    .nest-pre { margin: 0; font-family: var(--font-mono); font-size: 10px; line-height: 1.2; letter-spacing: -0.04em;
      -webkit-text-stroke: 0.05em currentColor; color: var(--ink-faint); user-select: none; }
    .nest-pre b { font-weight: inherit; }
    .nest-pre .t1 { color: var(--ink-muted); } .nest-pre .t2, .nest-pre .t5, .nest-pre .t6 { color: var(--color-accent); }
    .nest-pre .t3, .nest-pre .t4 { color: var(--ink); }
    #nest-mock .stats { display: grid; grid-template-columns: auto 1fr auto 1fr; gap: 2px 10px; margin: 0; align-items: baseline; }
    #nest-mock .stats dt, #nest-mock .stats dd { font-size: 12px; line-height: 1.4; }
    #nest-mock .stats dd { margin: 0; text-align: right; }
    #nest-mock .accent { color: var(--color-accent); }
    #nest-mock .row { display: flex; gap: 6px; }
    #nest-mock button { flex: 1; padding: 6px; background: none; border: 1px solid currentColor; color: inherit; font: inherit; cursor: pointer; }
    .nest-layer { position: absolute; left: 0; top: 0; width: 0; height: 0; z-index: 50; }
    .nest-ant { position: absolute; width: 23px; height: 13px; margin: -6px 0 0 -11px; color: var(--ink); cursor: crosshair; }
    .nest-ant svg { display: block; }
    .nest-ant i { position: absolute; left: 4px; top: -15px; font: 700 15px var(--font-accent, Georgia), serif; font-style: normal; color: var(--color-accent); }
    .nest-squash { position: absolute; color: var(--ink-faint); font: 14px var(--font-mono); pointer-events: none; transition: opacity 1.2s; }
    .nest-crack { position: absolute; font: 16px/1.2 var(--font-mono); letter-spacing: -0.04em; white-space: pre; color: var(--ink-muted);
      -webkit-text-stroke: 0.05em currentColor; pointer-events: none; transform: translate(-50%, -50%); }`;
  document.head.append(style);

  // ---- Braille dot canvas: each 2x4 block of dots becomes one character, coloured by its strongest tone.
  const canvas = (w, h) => {
    const dots = new Int8Array(w * h).fill(-1);
    const bit = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];
    const ok = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
    return {
      dots,
      set: (x, y, t) => { x |= 0; y |= 0; if (ok(x, y)) dots[y * w + x] = Math.max(dots[y * w + x], t); },
      clear: (x, y) => { x |= 0; y |= 0; if (ok(x, y)) dots[y * w + x] = -1; },
      render: (src = dots) => {
        let out = "";
        for (let cy = 0; cy < h; cy += 4) {
          for (let cx = 0; cx < w; cx += 2) {
            let code = 0, tone = -1;
            for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) {
              const t = src[(cy + dy) * w + cx + dx];
              if (t >= 0) { code |= bit[dy][dx]; tone = Math.max(tone, t); }
            }
            const ch = String.fromCharCode(0x2800 + code);
            out += tone > 0 ? `<b class="t${tone}">${ch}</b>` : ch;
          }
          out += "\n";
        }
        return out;
      },
    };
  };

  // ---- The panel: the tab, then a well the nest fills edge to edge, then the numbers.
  modes.querySelectorAll("[role=tab]").forEach((b) => b.setAttribute("aria-selected", "false"));
  const tab = document.createElement("button");
  tab.type = "button"; tab.setAttribute("role", "tab"); tab.textContent = "Nest"; tab.setAttribute("aria-selected", "true");
  modes.append(tab);
  [...aside.children].forEach((el) => { if (!el.classList.contains("assistant__head")) el.style.display = "none"; });
  aside.style.display = "flex"; aside.style.flexDirection = "column";
  const panel = document.createElement("div");
  panel.id = "nest-mock";
  panel.innerHTML = `
    <div class="lbl muted"><span>colony 01</span><span data-k="status">foraging</span></div>
    <div class="well"><pre class="nest-pre" role="img" aria-label="Side view of the ant nest"></pre></div>
    <div class="lbl muted"><span>next ant</span><span class="accent" data-k="bar"></span></div>
    <dl class="stats">
      <dt class="muted">ants</dt><dd data-k="ants">0</dd><dt class="muted">squashed</dt><dd data-k="squashed">0</dd>
      <dt class="muted">stolen</dt><dd data-k="stolen">0</dd><dt class="muted">page</dt><dd data-k="page">100%</dd>
      <dt class="muted">larder</dt><dd class="accent" data-k="larder" style="grid-column: span 3; text-align: left">empty</dd>
    </dl>
    <div class="row"><button data-k="pause">pause colony</button><button data-k="restore" class="muted">restore page</button></div>`;
  aside.append(panel);
  const $ = (k) => panel.querySelector(`[data-k="${k}"]`);
  const pre = panel.querySelector(".nest-pre");
  const well = panel.querySelector(".well");

  // Size the dot grid to the well: measure one Braille cell, then take as many as fit.
  const probe = document.createElement("span"); probe.textContent = "⣿".repeat(20); pre.append(probe);
  const cellW = probe.getBoundingClientRect().width / 20, cellH = probe.getBoundingClientRect().height;
  probe.remove();
  const cols = Math.floor(well.clientWidth / cellW), rows = Math.floor(well.clientHeight / cellH);
  const W = cols * 2, H = rows * 4;
  const nest = canvas(W, H);
  const X = (u) => u * W, Y = (v) => v * H, R = Math.max(4, W / 7);

  // Soil in two tones, a grass line, tunnels and chambers carved out by proportion.
  let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const sky = Math.round(Y(0.06));
  for (let y = sky + 2; y < H; y++) for (let x = 0; x < W; x++) if ((x + 2 * y) % 4 === 0 || rnd() < 0.05) nest.set(x, y, y < Y(0.3) ? 1 : 0);
  for (let x = 0; x < W; x++) { nest.set(x, sky + Math.round(Math.sin(x / 5)), 2); if (x % 3 === 0) nest.set(x, sky - 2 + (x % 2), 2); }
  const carve = (cx, cy, rx, ry) => { for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) if ((i * i) / (rx * rx) + (j * j) / (ry * ry) <= 1) nest.clear(cx + i, cy + j); };
  const tunnels = [
    [[0.5, 0.04], [0.5, 0.25], [0.3, 0.42], [0.22, 0.47]],
    [[0.5, 0.25], [0.74, 0.4], [0.78, 0.56]],
    [[0.32, 0.42], [0.36, 0.7], [0.5, 0.84]],
    [[0.78, 0.56], [0.66, 0.78], [0.52, 0.85]],
  ].map((path) => path.map(([u, v]) => [X(u), Y(v)]));
  tunnels.forEach((path) => { for (let k = 0; k < path.length - 1; k++) { const [a, b] = [path[k], path[k + 1]]; for (let s = 0; s <= 40; s++) carve(a[0] + (b[0] - a[0]) * s / 40, a[1] + (b[1] - a[1]) * s / 40, 2, 2); } });
  const nursery = [X(0.2), Y(0.49)], larder = [X(0.8), Y(0.58)], queen = [X(0.5), Y(0.88)];
  carve(nursery[0], nursery[1], R * 0.8, R * 0.45); carve(larder[0], larder[1], R * 0.85, R * 0.45); carve(queen[0], queen[1], R * 1.3, R * 0.65);
  // the queen: a long gold abdomen, thorax and head, six legs
  for (let j = -R * 0.25; j <= R * 0.25; j++) for (let i = -R * 0.6; i <= R * 0.6; i++) if ((i * i) / (R * R * 0.36) + (j * j) / (R * R * 0.0625) <= 1) nest.set(queen[0] + R * 0.25 + i, queen[1] + j, 6);
  for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) { nest.set(queen[0] - R * 0.5 + i, queen[1] + j, 6); if (Math.abs(i) + Math.abs(j) < 3) nest.set(queen[0] - R * 0.5 - 5 + i, queen[1] + j, 6); }
  for (let k = -1; k <= 1; k++) for (let s = 1; s < 4; s++) { nest.set(queen[0] - R * 0.5 + k * 3 + s * k, queen[1] + 2 + s, 6); nest.set(queen[0] - R * 0.5 + k * 3 + s * k, queen[1] - 2 - s, 6); }
  const base = nest.dots.slice();

  // Tunnel walkers in the panel follow the carved paths so the nest is never still.
  const flat = tunnels.flatMap((path) => { const pts = []; for (let k = 0; k < path.length - 1; k++) for (let s = 0; s < 20; s++) pts.push([path[k][0] + (path[k + 1][0] - path[k][0]) * s / 20, path[k][1] + (path[k + 1][1] - path[k][1]) * s / 20]); return [pts]; });

  // ---- Game state
  const state = { ants: [], stolen: [], larder: [], squashed: 0, food: 0, paused: false, letters: 0 };
  main.style.position = main.style.position || "relative";
  const layer = document.createElement("div"); layer.className = "nest-layer"; main.append(layer);
  const toLocal = (r) => { const m = main.getBoundingClientRect(); return [r.left - m.left + main.scrollLeft, r.top - m.top + main.scrollTop]; };

  // The crack sits beside the copy, low in the first screen of the page.
  const mainR = main.getBoundingClientRect();
  const hole = [main.clientWidth * 0.82, Math.min(main.clientHeight * 0.62, 420) + main.scrollTop];
  const crack = document.createElement("div"); crack.className = "nest-crack";
  crack.textContent = "⢀⣠⡴⠾⠛⠳⣦⣤⡴⠞⠋⠙⠷⣤⣀\n⠀⠈⠛⠛⠛⠋⠉⠙⠛⠋";
  crack.style.left = hole[0] + "px"; crack.style.top = hole[1] + "px"; layer.append(crack);

  // Every letter on screen that an ant could take, as text node + index, counted once for the score.
  const letters = () => {
    const out = []; const walk = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (layer.contains(n) || !n.parentElement.offsetParent || /^(SCRIPT|STYLE|PRE|CODE)$/.test(n.parentElement.tagName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    for (let n; (n = walk.nextNode());) for (let i = 0; i < n.data.length; i++) if (/[A-Za-z]/.test(n.data[i])) out.push([n, i]);
    return out;
  };
  state.letters = letters().length;
  const rectOf = (n, i) => { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1); return r.getBoundingClientRect(); };
  const setChar = (n, i, ch) => { n.data = n.data.slice(0, i) + ch + n.data.slice(i + 1); };

  const antSvg = (() => {
    let dots = "";
    ["..x.........x.", "...x.......x..", "..x..x...x.x..", ".xxx.xx.xxxxx.", "xxxx.xxx.xxxxx", ".xxx.xx.xxxxx.", "..x..x...x....", ".x...x....x..."]
      .forEach((row, y) => [...row].forEach((k, x) => { if (k === "x") dots += `<circle cx="${x * 1.6 + 0.8}" cy="${y * 1.6 + 0.8}" r="0.72"/>`; }));
    return `<svg width="23" height="13" viewBox="0 0 22.4 12.8" fill="currentColor" aria-hidden="true">${dots}</svg>`;
  })();

  const spawn = () => {
    const el = document.createElement("button");
    el.className = "nest-ant"; el.setAttribute("aria-label", "Ant. Press to squash."); el.innerHTML = antSvg;
    el.style.cssText += "background:none;border:0;padding:0";
    const ant = { el, x: hole[0], y: hole[1], target: null, carry: null, home: false };
    el.addEventListener("click", (e) => { e.stopPropagation(); squash(ant); });
    layer.append(el); state.ants.push(ant); pickTarget(ant);
  };

  const pickTarget = (ant) => {
    const pool = letters().filter(([n, i]) => { const r = rectOf(n, i); return r.width > 0 && r.top > mainR.top && r.bottom < mainR.bottom; });
    if (!pool.length) { ant.home = true; return; }
    const [n, i] = pool[Math.floor(Math.random() * pool.length)];
    const r = rectOf(n, i); const [lx, ly] = toLocal(r);
    ant.target = { n, i, x: lx + r.width / 2, y: ly + r.height / 2 };
  };

  const squash = (ant) => {
    if (ant.carry) setChar(ant.carry.n, ant.carry.i, ant.carry.ch), state.stolen = state.stolen.filter((s) => s !== ant.carry);
    const mark = document.createElement("div"); mark.className = "nest-squash"; mark.textContent = "⠪⠕";
    mark.style.left = ant.x - 8 + "px"; mark.style.top = ant.y - 9 + "px"; layer.append(mark);
    requestAnimationFrame(() => (mark.style.opacity = "0")); setTimeout(() => mark.remove(), 1300);
    ant.el.remove(); state.ants = state.ants.filter((a) => a !== ant); state.squashed++;
  };

  const step = (ant, dt) => {
    const goal = ant.home || ant.carry ? { x: hole[0], y: hole[1] } : ant.target;
    if (!goal) return pickTarget(ant);
    const dx = goal.x - ant.x, dy = goal.y - ant.y, d = Math.hypot(dx, dy), v = 38 * dt;
    if (d > v) { ant.x += (dx / d) * v + Math.sin(performance.now() / 120 + ant.x) * 0.3; ant.y += (dy / d) * v; }
    ant.el.style.left = ant.x + "px"; ant.el.style.top = ant.y + "px";
    ant.el.style.transform = `rotate(${Math.atan2(dy, dx) + Math.PI}rad)`;
    const label = ant.el.querySelector("i"); if (label) label.style.transform = `rotate(${-(Math.atan2(dy, dx) + Math.PI)}rad)`;
    if (d > v) return;
    if (ant.carry) { // home with a letter: the larder takes it and the queen eats
      state.larder.push(ant.carry.ch); state.food++; ant.carry = null; ant.el.querySelector("i")?.remove();
      if (state.food % 3 === 0 && state.ants.length < 14) setTimeout(spawn, 400);
      pickTarget(ant);
    } else if (ant.target) { // at the letter: lift it if it is still there
      const { n, i } = ant.target; const ch = n.data[i];
      if (/[A-Za-z]/.test(ch || "")) {
        setChar(n, i, " "); ant.carry = { n, i, ch }; state.stolen.push(ant.carry);
        const tag = document.createElement("i"); tag.textContent = ch; ant.el.append(tag);
      }
      ant.target = null;
    }
  };

  // ---- Loop: move ants every frame, redraw the panel a few times a second.
  let last = performance.now(), tick = 0;
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!state.paused) state.ants.slice().forEach((a) => step(a, dt));
    if ((tick = (tick + 1) % 8) === 0) draw(now);
    requestAnimationFrame(frame);
  };
  const draw = (now) => {
    const d = base.slice();
    const put = (x, y, t) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < W && y < H) d[y * W + x] = t; };
    const workers = Math.min(state.ants.length + 2, 10);
    for (let k = 0; k < workers; k++) { const path = flat[k % flat.length]; const p = path[Math.floor((now / 90 + k * 13) % path.length)]; for (let s = -1; s < 3; s++) put(p[0] + s, p[1], 3); }
    const eggs = state.food % 3; for (let k = 0; k < 2 + eggs * 2; k++) { put(nursery[0] - R * 0.5 + k * 3, nursery[1] + 1, 4); put(nursery[0] - R * 0.5 + k * 3 + 1, nursery[1] + 1, 4); }
    for (let k = 0; k < Math.min(state.larder.length, Math.floor(R * 0.8)); k++) { put(larder[0] - R * 0.7 + k * 2, larder[1] + 2, 5); put(larder[0] - R * 0.7 + k * 2, larder[1] + 1 - (k % 2), 5); }
    pre.innerHTML = nest.render(d);
    const left = 3 - (state.food % 3);
    $("bar").textContent = "⣿⣿⣿⣿".repeat(3 - left) + "⣀⣀⣀⣀".repeat(left);
    $("ants").textContent = state.ants.length; $("squashed").textContent = state.squashed;
    $("stolen").textContent = state.stolen.length;
    $("page").textContent = Math.round(100 * (1 - state.stolen.length / Math.max(1, state.letters))) + "%";
    $("larder").textContent = state.larder.slice(-14).join("") || "empty";
    $("status").textContent = state.paused ? "paused" : state.ants.length ? "foraging" : "beaten";
  };

  $("pause").addEventListener("click", () => { state.paused = !state.paused; $("pause").textContent = state.paused ? "wake colony" : "pause colony"; });
  $("restore").addEventListener("click", () => {
    state.stolen.forEach((s) => setChar(s.n, s.i, s.ch)); state.stolen = [];
    state.ants.forEach((a) => { a.carry = null; a.el.querySelector("i")?.remove(); a.target = null; });
  });

  for (let k = 0; k < 4; k++) setTimeout(spawn, k * 700);
  requestAnimationFrame(frame);
})();
