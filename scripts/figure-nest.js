// site/figure-nest.js — the ant colony as a live figure, not a screenshot.
//
// Each host is a small boxed stage. The elements are the game's own dot ants, Braille-derived
// mounds, letters and scent trails; the colours are the page tokens, so the figures follow the
// active flavour. The movement is a set loop: a scout walks a trail, a worker carries a letter
// home, the colony's castes gather, and the queen's worship circles. Nothing here is the game
// itself; the real colony is still behind the ant in the status bar.
const BODY = [[0,0],[1,1],[1,2]].concat(
  ["","","",".xxx.xx.xxxxx.","xxxx.xxx.xxxxx",".xxx.xx.xxxxx."]
    .flatMap((row, y) => [...row].map((k, x) => (k === "x" ? [x, y] : null)).filter(Boolean)),
);
const LEGS = [[5,2],[4,1],[9,2],[10,1],[7,6],[8,7],[2,6],[1,7]];
const circle = (x, y, r, cls = "") => `<circle cx="${x}" cy="${y}" r="${r}"${cls ? ` class="${cls}"` : ""}/>`;
const dots = (pts, r = .72) => pts.map(([x, y]) => circle(x * 1.6 + .8, y * 1.6 + .8, r)).join("");
const ant = (cls = "") => `<g class="nest-ant ${cls}" fill="currentColor">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>`;
const movingAnt = (id, cls = "") => `<g data-walk="${id}" class="nest-ant ${cls}" fill="currentColor">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>`;
const mound = (cx, base, w, h, rival = false) => {
  let out = "";
  for (let row = 0; row < h; row += 1) {
    const y = base - row * 3.4;
    const half = (w / 2) * Math.sqrt((h - row) / h);
    for (let x = -half; x <= half; x += 5.2) out += circle(cx + x, y, .9);
  }
  return `<g class="nest-scene__mound${rival ? " nest-scene__mound-rival" : ""}">${out}</g>`;
};
const trail = (d) => `<path class="nest-scene__trail" d="${d}"/>`;
const label = (x, y, text, cls = "nest-scene__label") => `<text x="${x}" y="${y}" class="${cls}" text-anchor="middle">${text}</text>`;

const SHELL = (head, hint, svg, status = "working") => `<div class="nest-scene">
  <div class="nest-scene__head"><span>${head}</span><strong>${status}</strong></div>
  <div class="nest-scene__stage">${svg}</div>
  <p class="nest-scene__hint">${hint}</p>
</div>`;

const colony = () => SHELL("The colony", "queen's chamber · nursery · larder · stores", `
  <svg viewBox="0 0 600 400" role="img" aria-label="A live cutaway colony: a queen in the chamber, ants walking a tunnel, a scout carrying a letter, and the nursery, larder and stores.">
    <path d="M18 126 L582 126" style="fill:none;stroke:var(--color-line);stroke-width:1.4"/>
    ${mound(300,126,150,22)}
    ${label(300,48,"entrance at the crown")}
    ${trail("M300 126 L300 210")}
    ${trail("M300 210 L150 262")}
    ${trail("M300 210 L450 262")}
    ${trail("M300 210 L300 330")}
    ${trail("M300 330 L145 356")}
    ${trail("M300 330 L455 356")}
    <ellipse cx="300" cy="336" rx="76" ry="36" style="fill:none;stroke:var(--color-line)"/>
    <ellipse cx="150" cy="266" rx="58" ry="28" style="fill:none;stroke:var(--color-line)"/>
    <ellipse cx="450" cy="266" rx="58" ry="28" style="fill:none;stroke:var(--color-line)"/>
    <ellipse cx="145" cy="360" rx="48" ry="22" style="fill:none;stroke:var(--color-line)"/>
    <ellipse cx="455" cy="360" rx="48" ry="22" style="fill:none;stroke:var(--color-line)"/>
    <g transform="translate(300 336) scale(1.7)">${ant("nest-ant--queen")}</g>
    ${label(300,394,"queen's chamber")}
    ${label(150,246,"nursery")}
    ${label(450,246,"larder")}
    ${label(145,394,"stores")}
    ${label(455,394,"stores")}
    <g fill="var(--ink-muted)" opacity=".7">${[0,1,2,3].map(i=>circle(134+i*9,254,2)).join("")}${[0,1,2].map(i=>circle(440+i*10,258,2)).join("")}</g>
    <text x="420" y="272" text-anchor="middle" style="fill:var(--ink);font-size:17px">a</text>
    <text x="446" y="274" text-anchor="middle" style="fill:var(--ink);font-size:17px">n</text>
    ${movingAnt("a")}${movingAnt("b")}${movingAnt("c")}
    ${label(300,204,"tunnel")}
  </svg>`);

const theft = () => SHELL("The page is food", "a scout takes a real letter, then carries it home", `
  <svg viewBox="0 0 600 400" role="img" aria-label="A live letter raid: an ant walks a trail to a sentence, removes the letter a, leaves the gap, and carries the glyph back to the mound.">
    ${mound(100,330,110,18)}
    ${trail("M100 330 C180 250 280 180 410 110")}
    <text x="120" y="95" class="nest-theft__word">the copy is <tspan data-theft-letter>a</tspan>nd food</text>
    ${movingAnt("thief")}
    <text class="nest-theft__carry" data-theft-carry>a</text>
    ${label(100,360,"mound")}
    ${label(410,74,"a real letter")}
  </svg>`);

const worship = () => SHELL("Worship", "the queen leaves, the ants circle, the stores fill", `
  <svg viewBox="0 0 600 400" role="img" aria-label="A live worship loop: the queen stands above the mound while eight ants orbit her, with the stores filling.">
    ${mound(300,332,170,20)}
    <ellipse cx="300" cy="190" rx="130" ry="55" class="nest-scene__orbit"/>
    <g transform="translate(300 190) scale(3.2)">${ant("nest-ant--queen")}</g>
    ${Array.from({length:8},(_,i)=>`<g data-orbit="${i}" class="nest-ant" fill="currentColor">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>`).join("")}
    ${label(300,58,"the queen is centre")}
    ${label(300,350,"stores fill")}
    ${label(300,382,"the trails go quiet")}
  </svg>`, "DANCING");

const mount = (host) => {
  const mode = host.dataset.nestMode || "colony";
  host.innerHTML = mode === "worship" ? worship() : mode === "theft" ? theft() : colony();
  const stage = host.querySelector(".nest-scene__stage");
  if (!stage) return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return true;

  const walkers = [...stage.querySelectorAll("[data-walk]")];
  const thief = stage.querySelector("[data-walk='thief']");
  const letter = stage.querySelector("[data-theft-letter]");
  const carry = stage.querySelector("[data-theft-carry]");
  const orbit = [...stage.querySelectorAll("[data-orbit]")];
  const start = performance.now();

  const place = (el, points, t) => {
    const total = points.length - 1;
    const u = Math.max(0, Math.min(.999, t)) * total;
    const i = Math.floor(u), f = u - i;
    const [x1, y1] = points[i], [x2, y2] = points[Math.min(total, i + 1)];
    const x = x1 + (x2 - x1) * f, y = y1 + (y2 - y1) * f;
    el.setAttribute("transform", `translate(${x} ${y}) rotate(${Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI})`);
  };

  const tick = (now) => {
    const t = (now - start) / 1000;
    if (mode === "colony") {
      const paths = [
        [[300,130],[300,210],[150,266],[150,336]],
        [[300,130],[300,210],[450,266],[450,336]],
        [[300,130],[300,210],[300,330],[300,360]],
      ];
      walkers.forEach((el, i) => place(el, paths[i], ((t * .06) + i * .31) % 1));
    } else if (mode === "theft") {
      const cycle = (t % 7) / 7;
      const u = cycle < .45 ? cycle / .45 : cycle < .8 ? 1 - (cycle - .45) / .35 : 0;
      place(thief, [[100,330],[180,250],[280,170],[330,95]], u);
      const taken = cycle > .28 && cycle < .82;
      if (letter) letter.style.visibility = taken ? "hidden" : "";
      if (carry) {
        carry.style.display = cycle > .38 && cycle < .82 ? "" : "none";
        carry.setAttribute("x", String(410 + (100 - 410) * Math.min(1, (cycle - .38) / .44)));
        carry.setAttribute("y", String(95 + (300 - 95) * Math.min(1, (cycle - .38) / .44)));
      }
    } else {
      orbit.forEach((el, i) => {
        const a = t * .9 + (i / orbit.length) * Math.PI * 2;
        el.setAttribute("transform", `translate(${300 + Math.cos(a) * 130} ${190 + Math.sin(a) * 55}) rotate(${a * 180 / Math.PI + 90})`);
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return true;
};

export const mountNest = mount;
