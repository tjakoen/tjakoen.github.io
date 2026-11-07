// Mockup only: open any page with ?nest in the address to see the Nest idea.
// Everything is drawn in Braille dots, the same way PR 37 draws the homepage baguette: a mono <pre>,
// a two-by-four dot cell per character, the flavor accent for what matters and faint ink for soil.
(() => {
  const modes = document.querySelector(".assistant__modes");
  const aside = document.querySelector(".assistant");
  if (!modes || !aside || document.getElementById("nest-mock")) return "skip";

  // A dot canvas. set(x, y, tone) marks one dot; render() packs each 2x4 block into one Braille
  // character and colours it by the strongest tone inside it (0 soil, 1 ink, 2 accent).
  const canvas = (w, h) => {
    const dots = new Int8Array(w * h).fill(-1);
    const bit = [[0x01, 0x08], [0x02, 0x10], [0x04, 0x20], [0x40, 0x80]];
    return {
      set: (x, y, t) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) dots[y * w + x] = Math.max(dots[y * w + x], t); },
      clear: (x, y) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) dots[y * w + x] = -1; },
      render: () => {
        let out = "";
        for (let cy = 0; cy < h; cy += 4) {
          for (let cx = 0; cx < w; cx += 2) {
            let code = 0, tone = -1;
            for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 2; dx++) {
              const t = dots[(cy + dy) * w + cx + dx];
              if (t >= 0) { code |= bit[dy][dx]; tone = Math.max(tone, t); }
            }
            const ch = String.fromCharCode(0x2800 + code);
            out += tone >= 0 ? `<b class="t${tone}">${ch}</b>` : ch;
          }
          out += "\n";
        }
        return out;
      },
    };
  };

  // The nest: speckled soil, a grass line, tunnels and three chambers carved out of it.
  const W = 76, H = 112, c = canvas(W, H);
  let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let y = 10; y < H; y++) for (let x = 0; x < W; x++) if ((x + 2 * y) % 4 === 0 || rnd() < 0.06) c.set(x, y, y < 34 ? 1 : 0);
  for (let x = 0; x < W; x++) { c.set(x, 8 + Math.round(Math.sin(x / 5)), 2); if (x % 3 === 0) c.set(x, 6 + (x % 2), 2); }
  const carve = (x, y, rx, ry) => { for (let j = -ry; j <= ry; j++) for (let i = -rx; i <= rx; i++) if ((i * i) / (rx * rx) + (j * j) / (ry * ry) <= 1) c.clear(x + i, y + j); };
  const tunnel = (pts) => { for (let k = 0; k < pts.length - 1; k++) { const [a, b] = [pts[k], pts[k + 1]]; for (let s = 0; s <= 30; s++) carve(a[0] + (b[0] - a[0]) * s / 30, a[1] + (b[1] - a[1]) * s / 30, 2, 2); } };
  tunnel([[38, 6], [38, 28], [22, 46], [16, 52]]);
  tunnel([[38, 28], [56, 44], [60, 62]]);
  tunnel([[24, 46], [28, 78], [38, 90]]);
  tunnel([[60, 62], [50, 86], [40, 92]]);
  carve(16, 54, 11, 6); carve(60, 64, 12, 6); carve(38, 96, 18, 9);
  // eggs in the nursery, letters in the larder, the queen in the bottom chamber
  [10, 13, 16, 19, 22].forEach((x) => { c.set(x, 57, 4); c.set(x + 1, 57, 4); });
  for (let x = 50; x < 70; x += 2) { c.set(x, 68, 5); c.set(x, 69, 5); }
  for (let j = -3; j <= 3; j++) for (let i = -9; i <= 9; i++) if ((i * i) / 81 + (j * j) / 9 <= 1) c.set(40 + i, 99 + j, 6);
  for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) c.set(29 + i, 98 + j, 6);
  for (let k = -1; k <= 1; k++) { c.set(30 + k * 5, 103, 6); c.set(30 + k * 5 + 1, 104, 6); c.set(30 + k * 5, 94, 6); c.set(30 + k * 5 + 1, 93, 6); }
  // workers in the tunnels: three dots in a row, head to tail
  [[38, 16], [30, 38], [48, 36], [26, 64], [56, 50], [46, 80]].forEach(([x, y]) => { c.set(x - 1, y, 3); c.set(x, y, 3); c.set(x + 1, y, 3); c.set(x + 2, y, 3); });

  // 1. The fourth tab, after Notepad.
  modes.querySelectorAll("[role=tab]").forEach((b) => b.setAttribute("aria-selected", "false"));
  const tab = document.createElement("button");
  tab.type = "button"; tab.role = "tab"; tab.textContent = "Nest"; tab.setAttribute("aria-selected", "true");
  modes.append(tab);

  const style = document.createElement("style");
  style.textContent = `
    .nest-pre { font-family: var(--font-mono); line-height: 1.2; letter-spacing: -0.04em; -webkit-text-stroke: 0.05em currentColor;
      color: var(--nest-soil); margin: 0; user-select: none; }
    #nest-mock, .nest-layer {
      --nest-soil: color-mix(in oklab, #8a5a30 88%, var(--color-accent));
      --nest-topsoil: color-mix(in oklab, #b98450 88%, var(--color-accent));
      --nest-grass: color-mix(in oklab, #86b24f 88%, var(--color-accent));
      --nest-ant: color-mix(in oklab, #d9603a 90%, var(--color-accent));
      --nest-egg: #efe6d0;
      --nest-gold: color-mix(in oklab, #f0b545 82%, var(--color-accent)); }
    .nest-pre b { font-weight: inherit; }
    #nest-mock .nest-pre { padding: 6px 4px; border-radius: 2px;
      background: linear-gradient(transparent 7%, color-mix(in oklab, #4a2e17 45%, var(--paper)) 7%, color-mix(in oklab, #2e1c0e 55%, var(--paper))); }
    .nest-pre .t0 { color: var(--nest-soil); } .nest-pre .t1 { color: var(--nest-topsoil); } .nest-pre .t2 { color: var(--nest-grass); }
    .nest-pre .t3 { color: var(--nest-ant); } .nest-pre .t4 { color: var(--nest-egg); }
    .nest-pre .t5, .nest-pre .t6 { color: var(--nest-gold); }
    #nest-mock { padding: var(--space-3, 12px); font: var(--text-sm, 12px)/1.5 var(--font-mono); color: var(--ink); }
    #nest-mock .muted { color: var(--ink-muted); } #nest-mock .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
    #nest-mock .bar { font-family: var(--font-mono); color: var(--nest-gold); letter-spacing: -0.04em; }
    #nest-mock button { flex: 1; padding: 6px; background: none; border: 1px solid currentColor; color: inherit; font: inherit; }
    .nest-ant { position: absolute; white-space: pre; font-family: var(--font-mono); color: var(--nest-ant); -webkit-text-stroke: 0.06em currentColor; letter-spacing: -0.04em; line-height: 1.2; }
    .nest-ant i { position: absolute; left: 0.2em; top: -0.95em; font: 700 1.15em var(--font-serif, Georgia), serif; color: var(--nest-gold); -webkit-text-stroke: 0; }
    .nest-gap { display: inline-block; width: 0.5em; border-bottom: 1px dotted var(--nest-gold); }`;
  document.head.append(style);

  // 2. The panel: the dot nest, then the colony's numbers and the two controls.
  [...aside.children].forEach((el) => { if (!el.classList.contains("assistant__head")) el.style.display = "none"; });
  const panel = document.createElement("div");
  panel.id = "nest-mock";
  panel.innerHTML = `
    <div class="lbl muted" style="display:flex;justify-content:space-between"><span>colony 01</span><span>day 3</span></div>
    <pre class="nest-pre" aria-label="Side view of the ant nest: a queen, a nursery and a larder of stolen letters" role="img" style="font-size:10px">${c.render()}</pre>
    <div style="display:flex;justify-content:space-between;margin-top:6px"><span class="lbl muted">next ant</span><span class="bar">⣿⣿⣿⣿⣿⣿⣿⣿⣀⣀⣀⣀⣀</span></div>
    <div class="muted" style="text-align:right">3 letters to go</div>
    <pre style="margin:12px 0;font:inherit">workers   <b style="color:var(--nest-ant)">14</b>   larder  <b style="color:var(--nest-gold)">teach</b>
squashed  <b>23</b>   page    <b>91%</b></pre>
    <div style="display:flex;gap:6px"><button>pause colony</button><button class="muted">restore page</button></div>
    <p class="muted" style="margin-top:10px">Off by default. Restore page puts every letter back.</p>`;
  aside.append(panel);

  // 3. The page: a Braille crack in the copy, and ants walking off with letters.
  const main = document.querySelector("main") || document.body;
  const layer = document.createElement("div");
  layer.className = "nest-layer"; layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:50";
  document.body.append(layer);
  const r = main.getBoundingClientRect();
  const cx = r.left + r.width * 0.74, cy = r.top + 372;
  const put = (x, y, html, cls, size) => { const el = document.createElement("div"); el.className = cls; el.style.cssText += `left:${x}px;top:${y}px;font-size:${size}px`; el.innerHTML = html; layer.append(el); return el; };
  put(cx - 40, cy - 8, "⢀⣠⡴⠾⠛⠳⣦⣤⡴⠞⠋⠙⠷⣤⣀", "nest-ant nest-pre", 16).style.color = "var(--nest-topsoil)";
  put(cx - 30, cy + 9, "⠈⠛⠛⠛⠋⠉⠙⠛⠋", "nest-ant nest-pre", 16).style.color = "var(--nest-soil)";
  // One ant as a grid of round dots, drawn as a tiny SVG the way the toast favicon is: Braille text
  // turns to a solid block at this size, round dots stay crisp. Head, thorax, abdomen, legs, feelers.
  const antArt = (() => {
    let dots = "";
    ["..x.........x.", "...x.......x..", "..x..x...x.x..", ".xxx.xx.xxxxx.", "xxxx.xxx.xxxxx", ".xxx.xx.xxxxx.", "..x..x...x....", ".x...x....x..."]
      .forEach((row, y) => [...row].forEach((k, x) => { if (k === "x") dots += `<circle cx="${x * 1.6 + 0.8}" cy="${y * 1.6 + 0.8}" r="0.72"/>`; }));
    return `<svg width="23" height="13" viewBox="0 0 22.4 12.8" fill="currentColor" aria-hidden="true">${dots}</svg>`;
  })();
  const ant = (x, y, letter, flip) => { const el = put(x, y, antArt + (letter ? `<i>${letter}</i>` : ""), "nest-ant", 13); if (flip) el.style.transform = "scaleX(-1)"; return el; };
  ant(cx - 150, cy - 66, "g"); ant(cx - 78, cy - 34, "r"); ant(cx + 30, cy - 96, null, true); ant(cx - 230, cy - 118, null);
  const target = ant(cx - 320, cy - 182, null); target.style.outline = "1px dashed var(--nest-gold)"; target.style.outlineOffset = "4px";

  // Mark where letters were taken, so the theft reads on the page itself.
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  const hits = [];
  for (let n; (n = walker.nextNode()) && hits.length < 3;) if (n.data.length > 30 && n.data.indexOf("ow") > 0) hits.push(n);
  hits.forEach((n) => {
    const at = n.data.indexOf("ow"); const rest = n.splitText(at); rest.data = rest.data.slice(1);
    const gap = document.createElement("span"); gap.className = "nest-gap"; rest.before(gap);
  });
  document.body.style.cursor = "crosshair";
  return "ok";
})();
