// site/figure-nest.js — small, self-running simulations of the colony's events.
//
// Each host owns its own state. Nothing is a keyframe: ants choose a free letter, carry it, fight
// over a point, gather at the queen, or build. When the event resolves, the little world resets and
// runs again. The visuals are the game's dot ants and Braille mound, drawn in the page tokens.
import { ANT_BODY as BODY, ANT_LEGS_A as LEGS_A, ANT_LEGS_B as LEGS_B, MAIN_MOUND } from "./nest-assets.js";

const circle = (x, y, r = .72) => `<circle cx="${x * 1.6 + .8}" cy="${y * 1.6 + .8}" r="${r}"/>`;
const dots = (pts) => pts.map(([x, y]) => circle(x, y)).join("");
const trail = (d) => `<path class="nest-scene__trail" d="${d}"/>`;
const mound = (x, y, w = 160, h = 72, rival = false) => `<foreignObject x="${x}" y="${y}" width="${w}" height="${h}"><pre xmlns="http://www.w3.org/1999/xhtml" class="nest-scene__mound-art${rival ? " rival" : ""}">${MAIN_MOUND}</pre></foreignObject>`;
const SHELL = (_head, _hint, svg, _status = "working") => `<div class="nest-scene"><div class="nest-scene__stage"><svg viewBox="0 0 600 400" role="img">${svg}</svg></div></div>`;

const backgrounds = {
  eat: () => `${mound(38, 272, 132, 60)}${trail("M100 330 C190 265 285 190 390 120")}<text x="74" y="96" class="nest-theft__word">the copy is food</text>`,
  colony: () => `${mound(220, 58, 160, 72)}<path d="M18 126 L582 126" class="nest-scene__surface"/>${trail("M300 126 L300 210")}${trail("M300 210 L150 266")}${trail("M300 210 L450 266")}${trail("M300 210 L300 330")}${trail("M300 330 L145 356")}${trail("M300 330 L455 356")}<ellipse cx="300" cy="336" rx="76" ry="36" class="nest-scene__room"/><ellipse cx="150" cy="266" rx="58" ry="28" class="nest-scene__room"/><ellipse cx="450" cy="266" rx="58" ry="28" class="nest-scene__room"/><ellipse cx="145" cy="360" rx="48" ry="22" class="nest-scene__room"/><ellipse cx="455" cy="360" rx="48" ry="22" class="nest-scene__room"/><foreignObject data-mini x="505" y="292" width="84" height="42" opacity=".15"><pre xmlns="http://www.w3.org/1999/xhtml" class="nest-scene__mound-art">${MAIN_MOUND}</pre></foreignObject>`,
  fight: () => `${trail("M34 260 L566 260", "var(--color-line)", ".3")}`,
  castes: () => "",
  worship: () => `${mound(196, 270, 208, 72)}<ellipse cx="300" cy="190" rx="130" ry="55" class="nest-scene__orbit"/>`,
  rival: () => `${mound(40, 300, 116, 54, true)}${mound(444, 300, 116, 54)}${trail("M100 312 C190 250 280 238 360 262")}${trail("M500 312 C410 250 320 238 280 262")}`,
};

const scene = (mode) => SHELL(
  { eat: "Eating", colony: "The colony", fight: "Fighting", castes: "The castes", worship: "Worship", rival: "Rival" }[mode] || "The colony",
  { eat: "a scout finds a letter, carries it, and the stores rise", colony: "the colony grows while the ants work the rooms", fight: "the crowd resolves the clash", castes: "worker, soldier, flyer, queen and rival guard", worship: "the queen and the circle around her", rival: "the rival builds, steals, and is driven off" }[mode] || "",
  backgrounds[mode](), { worship: "DANCING", fight: "FIGHTING", castes: "CASTES" }[mode] || "WORKING",
);

const rand = (n) => Math.random() * n;
const moveTo = (a, target, speed, dt) => {
  const dx = target.x - a.x, dy = target.y - a.y, d = Math.hypot(dx, dy) || 1;
  const step = Math.min(d, speed * dt);
  a.x += dx / d * step; a.y += dy / d * step;
  const want = Math.atan2(dy, dx);
  let turn = want - a.heading;
  while (turn > Math.PI) turn -= Math.PI * 2;
  while (turn < -Math.PI) turn += Math.PI * 2;
  a.heading += turn * Math.min(1, dt * 12);
  return d <= speed * dt + 1;
};

const create = (mode, stage) => {
  const layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  layer.dataset.simLayer = "";
  stage.querySelector("svg")?.append(layer);
  const mk = (role, x, y, cls = "") => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "g");
    el.setAttribute("class", "nest-ant " + cls);
    el.innerHTML = dots(BODY) + `<g class="legs-a">${dots(LEGS_A)}</g><g class="legs-b">${dots(LEGS_B)}</g>`;
    el.setAttribute("fill", role.includes("rival") ? "var(--nest-rival, #9b3a32)" : "currentColor");
    layer.append(el);
    return { id: s.ants.length, role, x, y, el, hp: role.includes("guard") || role === "soldier" ? 2 : 1, power: role.includes("guard") || role === "soldier" ? 2 : 1, cooldown: 0, carry: null, phase: rand(6.28) };
  };
  const mkLetter = (x, y, ch) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "text");
    el.setAttribute("x", x); el.setAttribute("y", y); el.setAttribute("text-anchor", "middle");
    el.setAttribute("style", "fill:var(--ink);font-family:var(--font-accent,Georgia,serif);font-size:22px");
    el.textContent = ch; layer.append(el);
    return { x, y, ch, free: true, el };
  };
  const s = { mode, stage, ants: [], letters: [], t: 0, phase: 0, stores: 0, mini: 0, labelEl: null };

  if (mode === "eat") {
    s.letters = [mkLetter(390, 120, "a"), mkLetter(460, 150, "n"), mkLetter(330, 86, "e")];
    s.ants = [mk("worker", 100, 330), mk("worker", 100, 330), mk("worker", 100, 330)];
    s.ants.forEach((a) => { a.job = "seek"; });
  } else if (mode === "colony") {
    s.letters = [mkLetter(420, 270, "a"), mkLetter(446, 274, "n")];
    s.ants = [mk("queen", 300, 336), mk("worker", 300, 336), mk("worker", 300, 336), mk("soldier", 300, 336)];
    s.ants.forEach((a) => { a.job = a.role === "queen" ? "idle" : "seek"; });
  } else if (mode === "fight") {
    s.ants = [mk("soldier", 150, 230), mk("worker", 120, 280), mk("rival-guard", 450, 230, "rival"), mk("rival-guard", 480, 280, "rival")];
    s.ants.forEach((a) => { a.job = "fight"; });
  } else if (mode === "castes") {
    s.ants = [mk("worker", 88, 110), mk("soldier", 208, 105), mk("flyer", 330, 105), mk("queen", 456, 105), mk("rival-guard", 552, 110, "rival")];
    s.ants[0].el.setAttribute("style", "fill:var(--color-fg)");
    s.ants[1].el.insertAdjacentHTML("beforeend", '<path d="M2 1 L-4 -1 M2 10 L-4 12" style="fill:none;stroke:currentColor;stroke-width:1.2"/>');
    s.ants[2].el.insertAdjacentHTML("beforeend", '<ellipse cx="10" cy="4" rx="6" ry="2.1" opacity=".3"/><ellipse cx="16" cy="4" rx="6" ry="2.1" opacity=".3"/>');
    s.ants[3].el.setAttribute("style", "fill:var(--color-accent)");
    s.ants[4].el.setAttribute("style", "fill:var(--nest-rival, #9b3a32)");
  } else if (mode === "worship") {
    s.ants = [mk("queen", 300, 190), mk("worker", 300, 190), mk("worker", 300, 190), mk("worker", 300, 190), mk("worker", 300, 190), mk("worker", 300, 190), mk("worker", 300, 190), mk("worker", 300, 190), mk("worker", 300, 190)];
  } else if (mode === "rival") {
    s.ants = [mk("rival-worker", 80, 300, "rival"), mk("rival-worker", 80, 300, "rival"), mk("rival-guard", 80, 300, "rival"), mk("worker", 500, 300), mk("soldier", 500, 300)];
    s.ants.forEach((a, i) => { a.job = i < 3 ? "steal" : "guard"; });
    s.letters = [mkLetter(300, 120, "a"), mkLetter(355, 140, "n"), mkLetter(410, 105, "d")];
    s.mini = 0;
  }
  return s;
};

const reset = (s) => {
  s.t = 0; s.stores = 0; s.mini = 0;
  if (s.mode === "eat") { s.letters.forEach((l) => { l.free = true; l.el.style.opacity = "1"; }); s.ants.forEach((a) => { a.carry = null; a.job = "seek"; a.x = 100; a.y = 330; }); }
  if (s.mode === "colony") { s.letters.forEach((l) => { l.free = true; l.el.style.opacity = "1"; }); s.ants.forEach((a) => { a.carry = null; a.job = "seek"; a.x = 300; a.y = 336; }); }
  if (s.mode === "fight") { s.ants.forEach((a, i) => { a.hp = a.power = (a.role.includes("guard") || a.role === "soldier") ? 2 : 1; a.x = i < 2 ? 150 + i * 20 : 450 + (i - 2) * 20; a.y = 230 + (i % 2) * 50; a.el.style.display = ""; }); }
  if (s.mode === "worship") { s.stores = 0; s.ants.forEach((a) => { a.phase = rand(6.28); }); }
  if (s.mode === "colony") { const mini = s.stage.querySelector("[data-mini]"); if (mini) mini.style.opacity = String(.15 + s.mini * .85); }
  if (s.mode === "rival") { s.ants.forEach((a, i) => { a.hp = a.power = 1; a.x = i < 3 ? 80 : 500; a.y = 300; a.el.style.display = ""; a.job = i < 3 ? "steal" : "guard"; }); s.mini = 0; }
};

const tick = (s, dt) => {
  s.t += dt;
  if (s.mode === "eat" || s.mode === "colony") {
    const home = s.mode === "eat" ? { x: 100, y: 330 } : { x: 300, y: 336 };
    s.ants.forEach((a) => {
      if (a.role === "queen") return;
      if (a.carry) {
        if (moveTo(a, home, 95, dt)) { a.carry = null; a.job = "seek"; s.stores++; }
      } else {
        const L = s.letters.find((l) => l.free); if (!L) return;
        if (moveTo(a, L, 100, dt)) { L.free = false; L.el.style.opacity = "0"; a.carry = L; }
      }
    });
    if (!s.letters.some((l) => l.free) && !s.ants.some((a) => a.carry) && s.t > 1) {
      if (s.mode === "colony" && s.stores >= 2 && s.mini < 1) s.mini = Math.min(1, s.mini + dt * .4);
      if (s.t > (s.mode === "colony" ? 10 : 7)) reset(s);
    }
  } else if (s.mode === "fight") {
    const main = s.ants.filter((a) => !a.role.includes("rival")), rival = s.ants.filter((a) => a.role.includes("rival"));
    s.ants.forEach((a) => { const foe = (a.role.includes("rival") ? main : rival).find((b) => b.hp > 0); if (!foe) return; if (moveTo(a, foe, 70, dt)) { a.cooldown -= dt; if (a.cooldown <= 0) { foe.hp -= a.power; foe.el.style.display = foe.hp > 0 ? "" : "none"; a.cooldown = .6; } } });
    if (!main.some((a) => a.hp > 0) || !rival.some((a) => a.hp > 0)) { if (s.t > 5) reset(s); }
  } else if (s.mode === "castes") {
    s.ants.forEach((a, i) => { a.phase += dt * (.6 + i * .07); const x = [88,208,330,456,552][i]; a.x = x + Math.sin(a.phase) * (i < 3 ? 14 : 4); a.y = [110,105,105,105,110][i] + Math.cos(a.phase) * 5; });
  } else if (s.mode === "worship") {
    s.phase += dt;
    if (s.phase > 10) reset(s);
    s.stores = Math.min(1, s.phase / 8);
    s.ants.forEach((a, i) => { if (a.role === "queen") return; const ang = s.phase * .9 + (i / s.ants.length) * Math.PI * 2; a.x = 300 + Math.cos(ang) * 130; a.y = 190 + Math.sin(ang) * 55; });
  } else if (s.mode === "rival") {
    s.phase += dt;
    if (s.phase < 3) s.mini = Math.min(1, s.phase / 3);
    s.ants.forEach((a) => {
      if (a.job === "steal") { const L = s.letters.find((l) => l.free); if (L && moveTo(a, L, 70, dt)) { L.free = false; L.el.style.opacity = "0"; a.job = "home"; } else if (a.job === "home" && moveTo(a, { x: 100, y: 300 }, 80, dt)) { a.job = "steal"; } }
      else { const r = s.ants.find((b) => b.role.includes("rival") && b.hp > 0); if (r && moveTo(a, r, 75, dt)) { r.hp -= 1; if (r.hp <= 0) r.el.style.display = "none"; } }
    });
    if (s.phase > 9) reset(s);
  }
};

const draw = (s) => {
  s.ants.forEach((a) => {
    a.el.classList.add("walk");
    const bob = a.role === "queen" ? 0 : Math.sin((s.t * 9) + (a.id || 0)) * 0.5;
    a.el.setAttribute("transform", `translate(${a.x} ${a.y + bob}) scale(${a.role === "queen" ? 2 : a.role === "soldier" || a.role.includes("guard") ? 1.3 : 1}) rotate(${(a.heading || 0) * 180 / Math.PI})`);
  });
  if (s.mode === "colony") { const mini = s.stage.querySelector("[data-mini]"); if (mini) mini.style.opacity = String(.15 + s.mini * .85); }
  if (s.mode === "rival") {
    const pre = s.stage.querySelector(".nest-scene__mound-art.rival");
    if (pre) pre.style.opacity = String(.3 + s.mini * .7);
  }
};

const mountNest = (host) => {
  const mode = host.dataset.nestMode === "theft" ? "eat" : host.dataset.nestMode || "colony";
  host.innerHTML = scene(mode);
  const stage = host.querySelector(".nest-scene__stage");
  if (!stage) return false;
  const sim = create(mode, stage);
  draw(sim);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    tick(sim, dt); draw(sim); requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return true;
};
export { mountNest };
