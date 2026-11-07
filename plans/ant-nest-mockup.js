// Mockup only: paste into the console on any page of the local site to see the Nest idea.
// It fakes the sidebar tab, the nest, a crack in the page and ants carrying letters. No game logic.
(() => {
  const ink = "var(--ink, #e8e2d4)", faint = "var(--ink-faint, #8a8474)", accent = "#d9a441";
  const modes = document.querySelector(".assistant__modes");
  const aside = document.querySelector(".assistant");
  if (!modes || !aside || document.getElementById("nest-mock")) return;

  // 1. The fourth tab.
  modes.querySelectorAll("[role=tab]").forEach((b) => b.setAttribute("aria-selected", "false"));
  const tab = document.createElement("button");
  tab.type = "button"; tab.role = "tab"; tab.textContent = "Nest"; tab.setAttribute("aria-selected", "true");
  modes.append(tab);

  // 2. The nest panel: a side-view cross-section of soil with chambers and tunnels.
  [...aside.children].forEach((c) => { if (!c.classList.contains("assistant__head")) c.style.display = "none"; });
  const panel = document.createElement("div");
  panel.id = "nest-mock";
  panel.style.cssText = "padding:12px;font:12px/1.5 var(--font-mono, monospace);color:" + ink;
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;color:${faint};text-transform:uppercase;letter-spacing:.08em;font-size:10px">
      <span>Colony 01</span><span>day 3</span></div>
    <svg viewBox="0 0 260 340" width="100%" role="img" aria-label="Side view of the ant nest">
      <rect x="0" y="40" width="260" height="300" fill="#2a2219"/>
      <path d="M0 40 Q40 30 80 40 T160 38 T260 40" stroke="#5a7a3a" stroke-width="4" fill="none"/>
      <path d="M130 40 L130 90 Q130 110 100 120 L60 160 M130 90 Q160 110 190 130 L200 190 M100 120 Q90 200 120 250 M200 190 Q170 240 130 270"
            stroke="#1a140e" stroke-width="12" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="168" rx="34" ry="16" fill="#1a140e"/>
      <ellipse cx="205" cy="198" rx="36" ry="17" fill="#1a140e"/>
      <ellipse cx="128" cy="282" rx="58" ry="26" fill="#1a140e"/>
      <text x="60" y="160" fill="${faint}" font-size="8" text-anchor="middle">nursery</text>
      <text x="205" y="190" fill="${faint}" font-size="8" text-anchor="middle">larder</text>
      <text x="128" y="268" fill="${faint}" font-size="8" text-anchor="middle">queen</text>
      <!-- stolen letters stacked in the larder -->
      <text x="186" y="206" fill="${accent}" font-size="11" font-family="serif">T e a c h</text>
      <!-- queen -->
      <g transform="translate(128 288)">
        <ellipse cx="14" cy="0" rx="16" ry="8" fill="#6b3d22"/><circle cx="-4" cy="0" r="6" fill="#4a2a16"/>
        <circle cx="-13" cy="-1" r="4" fill="#4a2a16"/>
        <path d="M-6 6 l-6 8 M0 7 l0 9 M6 6 l6 8 M-6 -6 l-6 -8 M0 -7 l0 -9 M6 -6 l6 -8" stroke="#4a2a16" stroke-width="1.4"/>
      </g>
      <!-- eggs + larvae -->
      <g fill="#efe6d0">${[0,1,2,3,4].map(i=>`<ellipse cx="${44+i*8}" cy="172" rx="3" ry="2"/>`).join("")}</g>
      <!-- workers in tunnels -->
      ${[[130,70],[112,116],[196,160],[105,215],[160,250]].map(([x,y])=>`<g transform="translate(${x} ${y})"><ellipse rx="4" ry="2" fill="#0c0906"/><circle cx="-5" r="2" fill="#0c0906"/></g>`).join("")}
    </svg>
    <div style="margin-top:6px;height:6px;background:#2a2219;border:1px solid ${faint}">
      <div style="width:62%;height:100%;background:${accent}"></div></div>
    <div style="display:flex;justify-content:space-between;color:${faint};margin-top:4px">
      <span>next ant: 3 letters</span><span>workers 14</span></div>
    <dl style="display:grid;grid-template-columns:1fr auto;gap:2px 8px;margin:14px 0">
      <dt style="color:${faint}">Letters stolen</dt><dd style="margin:0">47</dd>
      <dt style="color:${faint}">Ants squashed</dt><dd style="margin:0">23</dd>
      <dt style="color:${faint}">Page integrity</dt><dd style="margin:0">91%</dd>
    </dl>
    <div style="display:flex;gap:6px">
      <button style="flex:1;padding:6px;border:1px solid ${ink};background:none;color:${ink}">Pause colony</button>
      <button style="flex:1;padding:6px;border:1px solid ${faint};background:none;color:${faint}">Restore page</button></div>
    <p style="color:${faint};margin-top:10px">Off by default. Closing this tab leaves the colony asleep; Restore page puts every letter back.</p>`;
  aside.append(panel);

  // 3. The page: a crack the ants come out of, and workers walking off with letters.
  const main = document.querySelector("main") || document.body;
  const layer = document.createElement("div");
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:50";
  const r = main.getBoundingClientRect();
  const cx = r.left + r.width * 0.72, cy = r.top + 380;
  layer.innerHTML = `
    <svg width="100%" height="100%" style="position:absolute;inset:0">
      <path d="M${cx-30} ${cy} l12 -6 l8 7 l10 -9 l9 5 l11 -3" stroke="#0c0906" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M${cx-30} ${cy} l12 -6 l8 7 l10 -9 l9 5 l11 -3" stroke="${faint}" stroke-width="1" fill="none" transform="translate(0 3)"/>
    </svg>`;
  aside.parentElement.ownerDocument.body.append(layer);

  const ant = (x, y, rot, letter) => {
    const a = document.createElement("div");
    a.className = "nest-ant";
    a.style.cssText = `position:absolute;left:${x}px;top:${y}px;transform:rotate(${rot}deg);transition:left 6s linear,top 6s linear`;
    a.innerHTML = `<svg width="26" height="16" viewBox="-13 -8 26 16"><ellipse cx="5" rx="5" ry="3" fill="#0c0906"/><circle cx="-1" r="2.4" fill="#0c0906"/><circle cx="-6" r="2.6" fill="#0c0906"/>
      <path d="M-2 2 l-3 5 M1 2 l0 5 M4 2 l3 5 M-2 -2 l-3 -5 M1 -2 l0 -5 M4 -2 l3 -5 M-8 -1 l-4 -4 M-8 1 l-4 4" stroke="#0c0906" stroke-width="1"/></svg>`
      + (letter ? `<span style="position:absolute;left:-10px;top:-14px;font:700 15px Georgia,serif;color:${accent};transform:rotate(${-rot}deg)">${letter}</span>` : "");
    layer.append(a); return a;
  };
  const walkers = [ant(cx - 140, cy - 60, 20, "g"), ant(cx - 70, cy - 30, 30, "r"), ant(cx + 40, cy - 90, 160, null), ant(cx - 220, cy - 110, 15, null)];
  ant(cx - 300, cy - 175, 0, null).style.outline = `1px dashed ${accent}`;   // the cursor's target
  requestAnimationFrame(() => walkers.forEach((w) => { w.style.left = cx - 10 + "px"; w.style.top = cy - 6 + "px"; }));

  // A blank where a letter was taken, so the theft reads on the page itself.
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  for (let n, i = 0; (n = walker.nextNode()) && i < 3;) {
    const at = n.data.indexOf("ow");
    if (at > 0 && n.data.length > 30) { n.data = n.data.slice(0, at) + " w" + n.data.slice(at + 2); i++; }
  }
  document.body.style.cursor = "crosshair";
})();
