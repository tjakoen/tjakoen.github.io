// site/figure-nest.js — the ant colony as a live figure, not a screenshot.
//
// Each host is a small boxed stage. The elements are the game's own dot ants, Braille-derived
// mounds, letters and scent trails; the colours are the page tokens, so the figures follow the
// active flavour. The movement is a set loop: a scout walks a trail, a worker carries a letter
// home, the colony's castes gather, and the queen's worship circles. Nothing here is the game
// itself; the real colony is still behind the ant in the status bar.
const MAIN_MOUND = "\u2800\u2800\u2800\u2800\u2800\u2800\u2880\u28e0\u2894\u2806\u2800\u2800\u2890\u2896\u28a4\u28c0\u2800\u2800\u2800\u2800\u2800\u2800\n\u2800\u2800\u2800\u2800\u28e0\u28fe\u2895\u2895\u28bd\u2895\u28f5\u28d7\u289d\u2895\u28b5\u28b5\u289d\u28a6\u2840\u2800\u2800\u2800\n\u2800\u2800\u28e0\u289e\u289d\u28b5\u28f5\u2895\u2895\u289d\u2895\u2895\u28bd\u289f\u2895\u289d\u2895\u2895\u289d\u28a6\u2840\u2800\n\u28a0\u28de\u28b7\u2897\u289f\u28f7\u2895\u2895\u289d\u2897\u289d\u28dd\u28dd\u289d\u28dd\u28d5\u2897\u2895\u289d\u2897\u289d\u28a6";
const BODY = [[0,0],[1,1],[1,2]].concat(
  ["","","",".xxx.xx.xxxxx.","xxxx.xxx.xxxxx",".xxx.xx.xxxxx."]
    .flatMap((row, y) => [...row].map((k, x) => (k === "x" ? [x, y] : null)).filter(Boolean)),
);
const LEGS = [[5,2],[4,1],[9,2],[10,1],[7,6],[8,7],[2,6],[1,7]];
const circle = (x, y, r, cls = "") => `<circle cx="${x}" cy="${y}" r="${r}"${cls ? ` class="${cls}"` : ""}/>`;
const dots = (pts, r = .72) => pts.map(([x, y]) => circle(x * 1.6 + .8, y * 1.6 + .8, r)).join("");
const ant = (cls = "") => `<g class="nest-ant ${cls}" fill="currentColor">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>`;
const movingAnt = (id, cls = "") => `<g data-walk="${id}" class="nest-ant ${cls}" fill="currentColor">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>`;
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
    <foreignObject x="220" y="58" width="160" height="72"><pre xmlns="http://www.w3.org/1999/xhtml" class="nest-scene__mound-art">${MAIN_MOUND}</pre></foreignObject>
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
    <foreignObject x="42" y="282" width="116" height="54"><pre xmlns="http://www.w3.org/1999/xhtml" class="nest-scene__mound-art">${MAIN_MOUND}</pre></foreignObject>
    ${trail("M100 330 C180 250 280 180 410 110")}
    <text x="120" y="95" class="nest-theft__word">the copy is <tspan data-theft-letter>a</tspan>nd food</text>
    ${movingAnt("thief")}
    <text class="nest-theft__carry" data-theft-carry>a</text>
    ${label(100,360,"mound")}
    ${label(410,74,"a real letter")}
  </svg>`);

const worship = () => SHELL("Worship", "the queen leaves, the ants circle, the stores fill", `
  <svg viewBox="0 0 600 400" role="img" aria-label="A live worship loop: the queen stands above the mound while eight ants orbit her, with the stores filling.">
    <foreignObject x="196" y="270" width="208" height="72"><pre xmlns="http://www.w3.org/1999/xhtml" class="nest-scene__mound-art">${MAIN_MOUND}</pre></foreignObject>
    <ellipse cx="300" cy="190" rx="130" ry="55" class="nest-scene__orbit"/>
    <g transform="translate(300 190) scale(3.2)">${ant("nest-ant--queen")}</g>
    ${Array.from({length:8},(_,i)=>`<g data-orbit="${i}" class="nest-ant" fill="currentColor">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>`).join("")}
    ${label(300,58,"the queen is centre")}
    ${label(300,350,"stores fill")}
    ${label(300,382,"the trails go quiet")}
  </svg>`, "DANCING");


const fight = () => SHELL("The fight", "one second, then the crowd decides", `
  <svg viewBox="0 0 600 400" role="img" aria-label="A live fight loop: main workers and a rival guard clash, the fight opens, and the group resolves.">
    ${trail("M36 260 L560 260", "var(--color-line)", ".35")}
    <g data-fight-main="a" transform="translate(170 220)">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>
    <g data-fight-main="b" transform="translate(130 270)">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>
    <g data-fight-rival="a" transform="translate(430 220)" fill="var(--nest-rival, #9b3a32)">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>
    <g data-fight-rival="b" transform="translate(470 270)" fill="var(--nest-rival, #9b3a32)">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>
    <ellipse data-fight-ring cx="300" cy="250" rx="58" ry="24" style="fill:none;stroke:var(--color-accent);stroke-dasharray:2 4;opacity:.25"/>
    ${label(110,330,"main workers")}
    ${label(490,330,"rival guards")}
    ${label(300,76,"the fight opens")}
    ${label(300,102,"the nearest ants join")}
  </svg>`, "FIGHTING");

const castes = () => SHELL("The castes", "same animal, different jobs", `
  <svg viewBox="0 0 600 400" role="img" aria-label="The live caste sheet: worker, soldier, flyer, queen and rival guard, drawn with the game's dot ants.">
    <g data-caste="0" transform="translate(88 96) scale(1.5)">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>
    <g data-caste="1" transform="translate(208 92) scale(1.75)">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>
    <g data-caste="2" transform="translate(330 92) scale(1.5)">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>
    <g data-caste="3" transform="translate(456 92) scale(2.1)" fill="var(--color-accent)">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>
    <g data-caste="4" transform="translate(552 96) scale(1.7)" fill="var(--nest-rival, #9b3a32)">${dots(BODY)}<g opacity=".82">${dots(LEGS)}</g></g>
    ${label(88,140,"worker")}
    ${label(208,138,"soldier")}
    ${label(330,138,"flyer")}
    ${label(456,140,"queen")}
    ${label(552,138,"rival guard")}
    ${label(300,206,"the colony is a set of jobs, not a rank")}
    ${label(300,250,"two workers beat one guard")}
    ${label(300,276,"two rival guards beat one main guard")}
    ${label(300,302,"main flyer beats rival flyer 75%")}
  </svg>`, "CASTES");

const mount = (host) => {
  const mode = host.dataset.nestMode || "colony";
  host.innerHTML = mode === "worship" ? worship() : mode === "theft" ? theft() : mode === "fight" ? fight() : mode === "castes" ? castes() : colony();
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
    } else if (mode === "fight") {
      const phase = (t % 4) / 4;
      const clash = phase < .5 ? phase / .5 : 0;
      const back = phase < .5 ? 0 : (phase - .5) / .5;
      const push = Math.sin(clash * Math.PI) * 34;
      const retreat = Math.sin(back * Math.PI) * 20;
      stage.querySelectorAll("[data-fight-main]").forEach((el, i) => {
        const base = i ? 130 : 170;
        el.setAttribute("transform", `translate(${base + push - retreat} ${i ? 270 : 220})`);
      });
      stage.querySelectorAll("[data-fight-rival]").forEach((el, i) => {
        const base = i ? 470 : 430;
        el.setAttribute("transform", `translate(${base - push + retreat} ${i ? 270 : 220})`);
      });
      const ring = stage.querySelector("[data-fight-ring]");
      if (ring) ring.style.opacity = String(.15 + Math.sin(clash * Math.PI) * .5);
      const on = clash > .35;
      stage.querySelectorAll("[data-fight-main], [data-fight-rival]").forEach((el) => el.classList.toggle("nest-fight", on));
    } else if (mode === "castes") {
      stage.querySelectorAll("[data-caste]").forEach((el, i) => {
        const x = [88,208,330,456,552][i];
        el.setAttribute("transform", `translate(${x} ${92 + Math.sin(t * 1.7 + i) * 4}) scale(${[1.5,1.75,1.5,2.1,1.7][i]})`);
      });
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
