// Each box runs one bounded colony event with the same movement, food, combat, and build rules as Nest.
import { antClasses, antMarkup, miniArt, poseAntWings } from "./nest-assets.js";
import {
  BUILD_TIME,
  MOUND_BITE_INTERVAL,
  RIVAL_FOUNDING_TIME,
  RIVAL_MOUND_HEALTH,
  advanceBuild,
  combatHealth,
  combatPower,
  damageMound,
  foodShares,
  groupCanWin,
  roleSpeed,
  stepMovement,
  storeCapacity,
  worshipReturnAt,
} from "./nest-simulation.js";

const NS = "http://www.w3.org/2000/svg";
const WIDTH = 600;
const HEIGHT = 200;
const BASE_SPEED = 76;
const svg = (name, attrs = {}) => {
  const el = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, String(value)));
  return el;
};

const stateLabel = {
  eat: "Scout finds and carries letters home",
  colony: "Letters feed the stores and raise a mini mound",
  fight: "Main ants meet rival guards and resolve a group fight",
  castes: "Worker, soldier, flyer, queen, and rival guard move by role",
  worship: "The queen leaves, the colony gathers, and worship ends",
  rival: "A rival builds, steals letters, and is driven off",
};

const modeFor = (host) => host.dataset.nestMode === "theft" ? "eat" : host.dataset.nestMode;
const allLettersDelivered = (s) => s.letters.every((letter) => letter.state === "delivered");

function recordRule(sim, name) {
  if (sim.usedRules.has(name)) return;
  sim.usedRules.add(name);
  sim.host.dataset.rulesUsed = [...sim.usedRules].join(" ");
}

function setPhase(sim, phase) {
  if (sim.phase === phase) return;
  sim.phase = phase;
  sim.phaseAt = sim.clock;
  sim.host.dataset.eventState = phase;
}

function addFloor(sim, y = 182) {
  sim.svg.append(svg("path", { d: `M24 ${y} H576`, class: "nest-scene__floor" }));
}

function addTrail(sim) {
  const el = svg("path", { class: "nest-scene__trail", d: "" });
  sim.dynamic.append(el);
  return el;
}

function forageRoute(actor, home, letter) {
  const end = { x: letter.x, y: letter.y + 12 };
  const dx = end.x - home.x;
  const dy = end.y - home.y;
  const distance = Math.hypot(dx, dy) || 1;
  const bend = Math.min(34, Math.max(16, distance * 0.14)) * (actor.id % 2 ? 1 : -1);
  return [
    { x: (home.x + end.x) / 2 - dy / distance * bend, y: (home.y + end.y) / 2 + dx / distance * bend },
    end,
  ];
}

function trailPoints(path, start = 0, end = 1, steps = 10) {
  const length = path.getTotalLength();
  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = start + (end - start) * index / steps;
    const point = path.getPointAtLength(length * t);
    return { x: point.x, y: point.y };
  });
}

function moveOnRoute(sim, actor, route, dt, options = {}) {
  const point = route[actor.routeIndex || 0];
  if (!point) return true;
  if (moveActor(sim, actor, point, dt, options)) {
    actor.routeIndex = (actor.routeIndex || 0) + 1;
    sim.host.dataset.trailRouteSteps = String((Number(sim.host.dataset.trailRouteSteps) || 0) + 1);
    return actor.routeIndex >= route.length;
  }
  return false;
}

function addMound(sim, x, y, { width = 118, height = 54, rival = false, progress = 1 } = {}) {
  const holder = svg("foreignObject", { x, y, width, height, class: "nest-scene__mound" });
  const pre = document.createElement("pre");
  pre.className = `nest-scene__mound-art${rival ? " rival" : ""}`;
  pre.textContent = miniArt(progress);
  holder.append(pre);
  sim.dynamic.append(holder);
  return { holder, pre, x, y, width, height, progress };
}

function setMoundProgress(sim, mound, progress) {
  const value = Math.max(0, Math.min(1, progress));
  if (Math.abs(value - mound.progress) < 0.01 && value !== 1) return;
  mound.progress = value;
  mound.pre.textContent = miniArt(value);
  mound.pre.dataset.progress = value.toFixed(2);
  recordRule(sim, "miniArt");
}

function addActor(sim, role, side, x, y, { job = "idle", scale = 1 } = {}) {
  const wrap = svg("g", { class: antClasses(role, side), "data-role": role, "data-side": side });
  const turn = svg("g");
  const ant = svg("svg", { x: -11.5, y: -6.5, width: 23, height: 13, viewBox: "0 0 22.4 12.8", class: "nest-scene__ant-art" });
  ant.innerHTML = antMarkup({ flyer: role === "flyer" || role === "rival-flyer" });
  turn.append(ant);
  wrap.append(turn);
  sim.dynamic.append(wrap);
  const actor = { id: sim.actors.length + 1, role, side, x, y, heading: side === "rival" ? Math.PI : 0, job, scale, el: wrap, turn, carry: null, stuck: 0, paused: false, flightPhase: 0 };
  sim.actors.push(actor);
  placeActor(actor);
  return actor;
}

function placeActor(actor) {
  actor.el.setAttribute("transform", `translate(${actor.x} ${actor.y})`);
  actor.turn.setAttribute("transform", `rotate(${actor.heading * 180 / Math.PI}) scale(${actor.scale})`);
}

function moveActor(sim, actor, target, dt, { job = actor.job, factor = 1, letterNeed = 1 } = {}) {
  actor.job = job;
  const speed = roleSpeed(actor.role, job, BASE_SPEED, { letterNeed, factor });
  recordRule(sim, "roleSpeed");
  const beforeX = actor.x, beforeY = actor.y;
  const arrived = stepMovement(actor, target.x, target.y, dt, speed, {
    now: sim.clock * 1000,
    blocked: () => false,
  });
  if (actor.home) actor.el.classList.toggle("inside-mound", Math.hypot(actor.x - actor.home.x, actor.y - actor.home.y) < 11);
  recordRule(sim, "stepMovement");
  const walking = Math.hypot(actor.x - beforeX, actor.y - beforeY) > 0.02;
  if (actor.role === "flyer") {
    if (walking) actor.flightPhase = (actor.flightPhase + dt * Math.PI * 16) % (Math.PI * 2);
    poseAntWings(actor.el, actor.flightPhase, walking);
  }
  if (walking && actor.pathPoints &&
      Math.hypot(actor.x - actor.pathPoints.at(-1)[0], actor.y - actor.pathPoints.at(-1)[1]) > 5) {
    actor.pathPoints.push([actor.x, actor.y]);
  }
  actor.el.classList.toggle("walk", walking);
  placeActor(actor);
  return arrived;
}

function addSentence(sim, sentence, targetIndexes, x = 230, y = 58) {
  const text = svg("text", { class: "nest-scene__sentence", x: x + 90, y, "text-anchor": "middle" });
  const letters = [];
  const glyphs = [...sentence].map((char) => {
    const node = svg("tspan");
    node.textContent = char;
    text.append(node);
    return node;
  });
  sim.dynamic.append(text);
  targetIndexes.forEach((index) => {
    const char = [...sentence][index];
    const position = text.getStartPositionOfChar(index);
    const width = text.getSubStringLength(index, 1);
    letters.push({ id: letters.length, ch: char, x: position.x + width / 2, y, node: glyphs[index], state: "free", need: 1 });
  });
  return letters;
}

function attachCarryGlyph(sim, actor, letter) {
  const glyph = svg("text", { class: "nest-scene__carry", "text-anchor": "middle" });
  glyph.textContent = letter.ch;
  sim.dynamic.append(glyph);
  actor.carryGlyph = glyph;
}

function updateCarryGlyph(actor) {
  if (actor.carryGlyph) {
    actor.carryGlyph.setAttribute("x", actor.x);
    actor.carryGlyph.setAttribute("y", actor.y - 13);
  }
}

function addStores(sim, { count = 12, value = 0, seed = "·" } = {}) {
  sim.storeMax = count;
  sim.stores = value;
  sim.storeContents = Array.from({ length: value }, () => seed);
  renderStores(sim);
}

function renderStores(sim) {
  if (sim.host.dataset.stores !== undefined) sim.host.dataset.stores = String(sim.stores);
  sim.host.dataset.maxStoresSeen = String(Math.max(Number(sim.host.dataset.maxStoresSeen) || 0, sim.stores));
}

function applyFood(sim, letter) {
  const shares = foodShares(letter.need, sim.feedFlip, true);
  recordRule(sim, "foodShares");
  sim.feedFlip = shares.feedFlip;
  const gained = Math.min(sim.storeMax - sim.stores, shares.stores);
  sim.stores += gained;
  for (let index = 0; index < gained; index++) sim.storeContents.push(letter.ch);
  sim.meals += shares.meals;
  sim.host.dataset.meals = String(sim.meals);
  renderStores(sim);
}

function useForage(sim, dt, { home, workers, scoutFirst = false, onDelivery = null }) {
  for (const actor of workers) {
    if (actor.job === "idle" || actor.job === "search") {
      if (scoutFirst && actor.role !== "scout" && !sim.trailLaid) continue;
      const next = sim.letters.filter((letter) => letter.state === "free" && (sim.mode !== "rival" || letter.side === actor.side))
        .toSorted((a, b) => Math.hypot(actor.x - a.x, actor.y - a.y) - Math.hypot(actor.x - b.x, actor.y - b.y))[0];
      if (!next) continue;
      next.state = "assigned";
      actor.letter = next;
      actor.job = actor.role === "scout" && scoutFirst ? "scout" : "toLetter";
      actor.pathPoints = [[actor.x, actor.y]];
      actor.forageRoute = forageRoute(actor, home, next);
    }
    if (actor.job === "scout" || actor.job === "toLetter") {
      const letter = actor.letter;
      const route = sim.trailPoints?.[actor.side] || actor.forageRoute;
      let arrived = false;
      if (route) {
        if (actor.routeDirection !== "outbound") { actor.routeDirection = "outbound"; actor.routeIndex = 0; }
        arrived = actor.routeIndex < route.length
          ? moveOnRoute(sim, actor, route, dt, { job: actor.job }) && moveActor(sim, actor, { x: letter.x, y: letter.y + 12 }, dt, { job: actor.job })
          : moveActor(sim, actor, { x: letter.x, y: letter.y + 12 }, dt, { job: actor.job });
      } else arrived = moveActor(sim, actor, { x: letter.x, y: letter.y + 12 }, dt, { job: actor.job });
      if (arrived) {
        actor.foragePath = actor.pathPoints?.slice() || [];
        letter.state = "carried";
        letter.node.style.opacity = "0";
        actor.job = "carry";
        actor.carry = letter;
        actor.routeDirection = "inbound";
        actor.routeIndex = 0;
        attachCarryGlyph(sim, actor, letter);
      }
    } else if (actor.job === "carry") {
      const letter = actor.carry;
      const trailCurve = sim.trailPoints?.[actor.side] || actor.forageRoute;
      const returnRoute = trailCurve?.toReversed();
      const arrived = returnRoute && actor.routeIndex < returnRoute.length
        ? moveOnRoute(sim, actor, returnRoute, dt, { job: "carry", letterNeed: letter.need }) && moveActor(sim, actor, home, dt, { job: "carry", letterNeed: letter.need })
        : moveActor(sim, actor, home, dt, { job: "carry", letterNeed: letter.need });
      updateCarryGlyph(actor);
      if (!arrived) continue;
      letter.state = "delivered";
      actor.carry = null;
      actor.carryGlyph?.remove();
      actor.carryGlyph = null;
      applyFood(sim, letter);
      if (sim.trailPath && !sim.trailLaid) {
        const points = actor.foragePath?.length ? actor.foragePath : actor.pathPoints || [];
        const route = points.map(([px, py], index) => `${index ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
        sim.trailPath.setAttribute("d", route);
        sim.trailPoints ||= {};
        sim.trailPoints[actor.side] = points.map(([x, y]) => ({ x, y }));
        sim.trailLaid = true;
        sim.host.dataset.trailLaid = "true";
      }
      actor.job = "search";
      onDelivery?.(letter);
    }
  }
}

function resetCycle(sim) {
  sim.completedCycles++;
  sim.host.dataset.completedCycles = String(sim.completedCycles);
  sim.host.dataset.resetCount = String(sim.completedCycles);
  sim.host.dataset.cycle = String(sim.completedCycles + 1);
  sim.actors = [];
  sim.usedRules.clear();
  sim.host.dataset.rulesUsed = "";
  sim.letters = [];
  sim.storeMarks = [];
  sim.stores = 0;
  sim.storeContents = [];
  sim.meals = 0;
  sim.feedFlip = false;
  sim.trailLaid = false;
  sim.host.dataset.trailLaid = "false";
  sim.data = {};
  sim.host.dataset.stores = "0";
  setPhase(sim, "reset");
  sim.restartAt = sim.clock + 0.45;
}

function completeCycle(sim) {
  if (sim.phase === "complete" || sim.phase === "reset") return;
  sim.host.dataset.lastRulesUsed = [...sim.usedRules].join(" ");
  setPhase(sim, "complete");
}

function drawScene(sim) {
  sim.dynamic = svg("g", { class: "nest-scene__actors" });
  sim.svg.append(sim.dynamic);
  if (sim.mode === "eat") setupEat(sim);
  else if (sim.mode === "colony") setupColony(sim);
  else if (sim.mode === "fight") setupFight(sim);
  else if (sim.mode === "castes") setupCastes(sim);
  else if (sim.mode === "worship") setupWorship(sim);
  else if (sim.mode === "rival") setupRival(sim);
}

function setupEat(sim) {
  const home = { x: 100, y: 164 };
  addMound(sim, 30, 123, { width: 136, height: 55 });
  sim.trailPath = addTrail(sim);
  sim.letters = addSentence(sim, "letters feed a colony", [0, 5, 17]);
  sim.storeMax = 6;
  addStores(sim, { count: sim.storeMax, x: home.x + 70 });
  sim.actors = [addActor(sim, "scout", "main", home.x, home.y, { job: "search" }), addActor(sim, "worker", "main", home.x - 8, home.y + 6, { job: "search" }), addActor(sim, "worker", "main", home.x + 7, home.y + 7, { job: "search" })];
  sim.actors.forEach((actor) => { actor.home = home; actor.el.classList.add("inside-mound"); });
  sim.data = { home, forage: sim.actors, scoutFirst: true };
  setPhase(sim, "scout-out");
}

function setupColony(sim) {
  const home = { x: 105, y: 164 };
  addMound(sim, 34, 123, { width: 140, height: 55 });
  sim.letters = addSentence(sim, "letters build a new nest", [0, 8]);
  addStores(sim, { count: 12, value: 11, x: home.x + 70, seed: sim.letters[0]?.ch });
  sim.host.dataset.stores = "11";
  sim.storeMax = storeCapacity(0);
  recordRule(sim, "storeCapacity");
  sim.actors = [addActor(sim, "queen", "main", home.x, home.y, { scale: 1.55 }), addActor(sim, "worker", "main", home.x - 10, home.y + 7, { job: "search" }), addActor(sim, "worker", "main", home.x + 9, home.y + 6, { job: "search" }), addActor(sim, "soldier", "main", home.x + 1, home.y + 12, { scale: 1.2 })];
  sim.actors.forEach((actor) => { actor.home = home; actor.el.classList.add("inside-mound"); });
  sim.trailPath = addTrail(sim);
  sim.data = { home, forage: sim.actors.slice(1, 3), builder: null, mound: null, build: 0, buildTarget: { x: 456, y: 164 }, stage: "delivery" };
  setPhase(sim, "workers-deliver");
}

function addFighters(sim, { mainCount = 3, rivalCount = 2, homeX = 118, rivalX = 468 } = {}) {
  for (let index = 0; index < mainCount; index++) addActor(sim, "worker", "main", homeX + index * 2, 154 + index * 8, { job: "approach" });
  for (let index = 0; index < rivalCount; index++) addActor(sim, "rival-guard", "rival", rivalX + index * 7, 144 + index * 18, { job: "guard", scale: 1 });
}

function setupFight(sim) {
  addFloor(sim, 178);
  const trail = svg("path", { d: "M66 158 C134 151 176 137 236 145 S360 162 410 148 S484 141 534 155", class: "nest-scene__trail" });
  sim.dynamic.append(trail);
  addFighters(sim);
  sim.data = { mains: sim.actors.filter((actor) => actor.side === "main"), rivals: sim.actors.filter((actor) => actor.side === "rival"), target: null, fightElapsed: 0, mainLosses: 0,
    trailMet: false };
  sim.data.mains.forEach((actor, index) => { actor.routeIndex = 0; actor.trailRoute = trailPoints(trail, 0.12, 0.48, 8 + index); });
  sim.data.rivals.forEach((actor, index) => { actor.routeIndex = 0; actor.trailRoute = trailPoints(trail, 0.88, 0.52, 6 + index); });
  setPhase(sim, "trail-approach");
}

function setupCastes(sim) {
  addFloor(sim, 153);
  const roles = [
    { role: "worker", side: "main", x: 78, y: 98, factor: 1, route: [[112, 82], [120, 112]] },
    { role: "soldier", side: "main", x: 187, y: 98, factor: 0.8, route: [[212, 80], [216, 116]], scale: 1.2 },
    { role: "flyer", side: "main", x: 297, y: 98, factor: 1, route: [[337, 70], [346, 105]], scale: 1.15 },
    { role: "queen", side: "main", x: 405, y: 98, factor: 0.9, route: [[441, 91], [434, 114]], scale: 1.55 },
    { role: "rival-guard", side: "rival", x: 515, y: 98, factor: 0.7, route: [[482, 80], [478, 116]], scale: 1 },
  ];
  sim.actors = roles.map((entry) => {
    const actor = addActor(sim, entry.role, entry.side, entry.x, entry.y, { job: "role-route", scale: entry.scale || 1 });
    actor.route = [[entry.x, entry.y], ...entry.route.map(([x, y]) => [x, y]), [entry.x, entry.y]];
    actor.routeIndex = 1;
    actor.roleFactor = entry.factor;
    actor.returned = false;
    return actor;
  });
  setPhase(sim, "roles-walk");
}

function setupWorship(sim) {
  addFloor(sim);
  const home = { x: 300, y: 165 };
  addMound(sim, 242, 121, { width: 116, height: 48 });
  addStores(sim, { count: 12, x: home.x + 70 });
  sim.storeMax = storeCapacity(0);
  recordRule(sim, "storeCapacity");
  const queen = addActor(sim, "queen", "main", home.x, home.y, { scale: 1.55, job: "worship" });
  queen.home = home;
  queen.el.classList.add("inside-mound");
  const dancers = Array.from({ length: 7 }, (_, index) => addActor(sim, "worker", "main", home.x + (index - 3) * 11, home.y + 12, { job: "gather" }));
  dancers.forEach((actor) => { actor.home = home; actor.el.classList.add("inside-mound"); });
  sim.actors = [queen, ...dancers];
  sim.data = { home, stage: { x: 300, y: 76 }, queen, dancers, gathered: false, danceStart: 0, returnAt: 0, orbitPhase: 0 };
  setPhase(sim, "queen-leaves");
}

function setupRival(sim) {
  addFloor(sim);
  const home = { x: 488, y: 164 };
  const mainHome = { x: 105, y: 164 };
  const rivalMound = addMound(sim, 425, 125, { width: 126, height: 54, rival: true, progress: 0 });
  addMound(sim, 36, 125, { width: 126, height: 54, progress: 1 });
  sim.letters = addSentence(sim, "rival ants steal letters", [0, 1, 2, 3, 4, 7, 8, 9]);
  sim.letters.forEach((letter, index) => { letter.side = index < sim.letters.length / 2 ? "main" : "rival"; });
  sim.storeMax = storeCapacity(0);
  sim.stores = 0;
  sim.storeContents = [];
  sim.storeMax = storeCapacity(0);
  recordRule(sim, "storeCapacity");
  sim.trailPaths = [addTrail(sim), addTrail(sim)];
  sim.trailPaths[0].setAttribute("d", `M150 158 C174 130 187 113 ${sim.letters[0].x} 83 S${sim.letters[0].x + 22} 68 ${sim.letters[0].x + 38} 63`);
  sim.trailPaths[1].setAttribute("d", `M450 158 C426 130 416 113 ${sim.letters.at(-1).x} 83 S${sim.letters.at(-1).x - 22} 68 ${sim.letters.at(-1).x - 38} 63`);
  sim.trailPoints = {
    main: trailPoints(sim.trailPaths[0]),
    rival: trailPoints(sim.trailPaths[1]),
  };
  const workers = [addActor(sim, "rival-worker", "rival", home.x - 8, home.y + 8, { job: "wait" }), addActor(sim, "rival-worker", "rival", home.x + 8, home.y + 9, { job: "wait" })];
  const mainWorkers = [addActor(sim, "worker", "main", mainHome.x - 8, mainHome.y + 7, { job: "wait" }), addActor(sim, "worker", "main", mainHome.x + 8, mainHome.y + 7, { job: "wait" })];
  const soldiers = [
    addActor(sim, "soldier", "main", mainHome.x - 8, mainHome.y + 12, { job: "wait", scale: 1.2 }),
    addActor(sim, "soldier", "main", mainHome.x, mainHome.y + 14, { job: "wait", scale: 1.2 }),
    addActor(sim, "soldier", "main", mainHome.x + 8, mainHome.y + 12, { job: "wait", scale: 1.2 }),
  ];
  const guards = [addActor(sim, "rival-guard", "rival", home.x - 8, home.y + 7, { job: "guard", scale: 1.25 }), addActor(sim, "rival-guard", "rival", home.x + 8, home.y + 8, { job: "guard", scale: 1.25 })];
  workers.forEach((actor) => { actor.home = home; actor.el.classList.add("inside-mound"); });
  [...mainWorkers, ...soldiers, ...guards].forEach((actor) => { actor.home = actor.side === "main" ? mainHome : home; actor.el.classList.add("inside-mound"); });
  const mains = [...mainWorkers, ...soldiers];
  sim.actors = [...guards, ...workers, ...mains];
  sim.data = { home, mainHome, rivalMound, guards, workers, mainWorkers, soldiers, mains, stage: "build", build: 0, siegeHealth: RIVAL_MOUND_HEALTH, siegeElapsed: 0 };
  setPhase(sim, "rival-build");
}

function tickForage(sim, dt) {
  const before = sim.letters.filter((letter) => letter.state !== "delivered").length;
  useForage(sim, dt, {
    home: sim.data.home,
    workers: sim.data.forage,
    scoutFirst: sim.data.scoutFirst,
    onDelivery: () => {
      if (sim.mode === "eat" && sim.trailLaid) setPhase(sim, "workers-carry");
    },
  });
  const pending = sim.letters.some((letter) => letter.state !== "delivered");
  if (sim.mode === "eat") {
    if (sim.trailLaid && sim.phase === "scout-out") setPhase(sim, "trail-laid");
    if (!pending) {
      if (sim.phase !== "feeding") setPhase(sim, "feeding");
      else if (sim.clock - sim.phaseAt > 0.55) completeCycle(sim);
    }
  } else if (!pending && sim.data.stage === "delivery") {
    sim.data.stage = "build";
    sim.data.builder = addActor(sim, "builder", "main", sim.data.home.x, sim.data.home.y, { job: "build-walk", scale: 1.1 });
    sim.data.mound = addMound(sim, sim.data.buildTarget.x - 56, sim.data.buildTarget.y - 48, { width: 112, height: 50, progress: 0 });
    setPhase(sim, "builder-leaves");
  }
  if (before > 0 && !pending && sim.mode === "colony") sim.host.dataset.buildReady = "true";
}

function tickColonyBuild(sim, dt) {
  const data = sim.data;
  if (!data.builder || data.stage !== "build") return;
  if (data.builder.job === "build-walk") {
    if (moveActor(sim, data.builder, data.buildTarget, dt, { job: "build-walk" })) {
      data.builder.job = "building";
      setPhase(sim, "building");
    }
    return;
  }
  data.build = advanceBuild(data.build, dt, BUILD_TIME);
  recordRule(sim, "advanceBuild");
  setMoundProgress(sim, data.mound, data.build);
  sim.host.dataset.buildProgress = data.build.toFixed(2);
  if (data.build >= 1) {
    data.stage = "ready";
    sim.host.dataset.miniMound = "ready";
    sim.stores = Math.max(0, sim.stores - sim.storeMax);
    sim.storeContents = sim.storeContents.slice(0, sim.stores);
    renderStores(sim);
    setPhase(sim, "mini-ready");
    completeCycle(sim);
  }
}

function tickCombat(sim, dt, { mains, rivals, getTarget, finish } = {}) {
  const aliveMains = mains.filter((actor) => actor.alive !== false);
  const aliveRivals = rivals.filter((actor) => actor.alive !== false);
  if (!aliveRivals.length) { finish(); return; }
  let target = sim.data.target;
  if (!target || target.alive === false) {
    target = getTarget(aliveMains, aliveRivals);
    sim.data.target = target;
    sim.data.fighters = aliveMains;
    sim.data.fightElapsed = 0;
  }
  if (!target) { finish(); return; }
  if (sim.phase !== "clash") {
    const radius = sim.mode === "rival" ? 30 : 26;
    const offsets = aliveMains.map((_, index) => ({ x: target.x - radius, y: target.y + (index - (aliveMains.length - 1) / 2) * 9 }));
    const arrivals = aliveMains.map((actor, index) => moveActor(sim, actor, offsets[index], dt, { job: "approach", factor: 0.9 }));
    const arrived = arrivals.every(Boolean);
    if (!arrived) return;
    target.job = "guard";
    setPhase(sim, "clash");
    sim.data.fightElapsed = 0;
    return;
  }
  sim.data.fightElapsed += dt;
  sim.host.dataset.fightElapsed = sim.data.fightElapsed.toFixed(1);
  if (sim.data.fightElapsed < 1) return;
  const power = aliveMains.reduce((total, actor) => total + combatPower(actor.role, actor.side), 0);
  recordRule(sim, "combatPower");
  const maxHealth = combatHealth(target.role, target.side);
  const health = target.health ?? maxHealth;
  recordRule(sim, "combatHealth");
  const won = groupCanWin(power, health);
  recordRule(sim, "groupCanWin");
  const damage = won ? health : 1;
  target.health = Math.max(0, health - damage);
  target.el.dataset.health = String(target.health);
  target.el.style.opacity = won ? "0.42" : String(Math.max(0.45, target.health / maxHealth));
  sim.host.dataset.lastFight = JSON.stringify({ power, health, damage, remainingHealth: target.health });
  if (!won) {
    const lost = aliveMains.at(-1);
    lost.alive = false;
    lost.el.dataset.health = "0";
    lost.el.style.opacity = "0";
  } else {
    target.alive = false;
    sim.data.pendingTarget = target;
  }
  sim.data.target = null;
  setPhase(sim, won ? "resolve-win" : "resolve-loss");
  sim.data.resolveUntil = sim.clock + 0.35;
  finish.pending = true;
}

function tickFight(sim, dt) {
  if (!sim.data.trailMet) {
    const travelers = [...sim.data.mains, ...sim.data.rivals];
    const arrived = travelers.map((actor) => moveOnRoute(sim, actor, actor.trailRoute, dt, { job: "approach" }));
    if (arrived.every(Boolean)) {
      sim.data.trailMet = true;
      setPhase(sim, "approach");
    }
    return;
  }
  if (sim.phase === "resolve-win" || sim.phase === "resolve-loss") {
    if (sim.clock < sim.data.resolveUntil) return;
    sim.data.pendingTarget?.el.remove();
    sim.data.pendingTarget = null;
    setPhase(sim, "approach");
  }
  tickCombat(sim, dt, {
    mains: sim.data.mains,
    rivals: sim.data.rivals,
    getTarget: (mains, rivals) => rivals[0] || null,
    finish: () => completeCycle(sim),
  });
}

function tickCastes(sim, dt) {
  const returning = sim.actors.every((actor) => actor.returned);
  if (returning) { completeCycle(sim); return; }
  for (const actor of sim.actors) {
    if (actor.returned) continue;
    const point = actor.route[actor.routeIndex];
    if (moveActor(sim, actor, { x: point[0], y: point[1] }, dt, {
      job: actor.role === "flyer" ? "fly" : "role-route",
      factor: actor.roleFactor,
    })) {
      actor.routeIndex++;
      if (actor.routeIndex >= actor.route.length) {
        actor.returned = true;
        actor.el.classList.remove("walk");
        sim.host.dataset.rolesReturned = String((Number(sim.host.dataset.rolesReturned) || 0) + 1);
      }
    }
  }
}

function tickWorship(sim, dt) {
  const data = sim.data;
  const { queen, dancers, home, stage } = data;
  if (sim.phase === "queen-leaves") {
    if (moveActor(sim, queen, stage, dt, { job: "worship", factor: 0.9 })) setPhase(sim, "gather");
    return;
  }
  if (sim.phase === "gather") {
    const arrivals = dancers.map((actor, index) => {
      const angle = (index / dancers.length) * Math.PI * 2;
      return moveActor(sim, actor, { x: queen.x + Math.cos(angle) * 54, y: queen.y + Math.sin(angle) * 28 }, dt, { job: "gather" });
    });
    const arrived = arrivals.every(Boolean);
    if (arrived) {
      data.danceStart = sim.clock;
      data.until = data.danceStart + 9;
      data.returnAt = worshipReturnAt(data.until * 1000) / 1000;
      recordRule(sim, "worshipReturnAt");
      setPhase(sim, "dance");
    }
    return;
  }
  if (sim.phase === "dance") {
    for (const [index, actor] of dancers.entries()) {
      const angle = data.orbitPhase + (index / dancers.length) * Math.PI * 2;
      const target = { x: queen.x + Math.cos(angle) * 54, y: queen.y + Math.sin(angle) * 28 };
      moveActor(sim, actor, target, dt, { job: "dance", factor: 0.9 });
    }
    data.orbitPhase += dt * 0.72;
    if (sim.clock >= data.returnAt) setPhase(sim, "queen-returns");
    return;
  }
  if (sim.phase === "queen-returns") {
    if (moveActor(sim, queen, home, dt, { job: "worship", factor: 0.9 })) {
      for (const actor of dancers) actor.job = "home";
      setPhase(sim, "stores-fill");
    }
    return;
  }
  if (sim.phase === "stores-fill") {
    for (const actor of dancers) moveActor(sim, actor, home, dt, { job: "home" });
    if (dancers.every((actor) => Math.hypot(actor.x - home.x, actor.y - home.y) < 12)) {
      sim.stores = storeCapacity(0);
      sim.storeContents = Array.from({ length: sim.stores }, () => "·");
      recordRule(sim, "storeCapacity");
      renderStores(sim);
      sim.host.dataset.stores = String(sim.stores);
      completeCycle(sim);
    }
  }
}

function tickRival(sim, dt) {
  const data = sim.data;
  if (data.stage === "build") {
    data.build = advanceBuild(data.build, dt, RIVAL_FOUNDING_TIME);
    recordRule(sim, "advanceBuild");
    setMoundProgress(sim, data.rivalMound, data.build);
    sim.host.dataset.buildProgress = data.build.toFixed(2);
    if (data.build >= 1) {
      data.stage = "steal";
      setPhase(sim, "rival-steals");
    }
    return;
  }
  if (data.stage === "steal") {
    data.workers.forEach((actor) => { if (actor.job === "wait") actor.job = "search"; });
    useForage(sim, dt, { home: data.home, workers: data.workers });
    data.mainWorkers.forEach((actor) => { if (actor.job === "wait") actor.job = "search"; });
    useForage(sim, dt, { home: data.mainHome, workers: data.mainWorkers });
    if (allLettersDelivered(sim)) {
      data.stage = "fight";
      data.soldiers.forEach((actor) => { actor.job = "approach"; });
      data.guards.forEach((actor) => { actor.alive = true; actor.el.classList.remove("inside-mound"); });
      setPhase(sim, "main-answers");
    }
    return;
  }
  if (data.stage === "fight") {
    if (sim.phase === "resolve-win" || sim.phase === "resolve-loss") {
      if (sim.clock < sim.data.resolveUntil) return;
      sim.data.pendingTarget?.el.remove();
      sim.data.pendingTarget = null;
      if (data.guards.every((actor) => actor.alive === false)) {
        data.stage = "destroy";
        data.siegeElapsed = 0;
        data.soldiers.forEach((actor) => { actor.job = "rival-siege"; });
        setPhase(sim, "soldiers-destroy-mound");
        return;
      }
      setPhase(sim, "approach");
    }
    tickCombat(sim, dt, {
      mains: data.soldiers,
      rivals: data.guards,
      getTarget: (_mains, aliveGuards) => aliveGuards.find((actor) => actor.alive !== false) || null,
      finish: () => {
        data.stage = "destroy";
        data.siegeElapsed = 0;
        data.soldiers.forEach((actor) => { actor.job = "rival-siege"; });
        setPhase(sim, "soldiers-destroy-mound");
      },
    });
    return;
  }
  if (data.stage === "destroy") {
    const arrivals = data.soldiers.map((actor, index) => moveActor(sim, actor, { x: data.rivalMound.x + 58, y: 159 + index * 7 }, dt, { job: "rival-siege", factor: 0.9 }));
    if (!arrivals.every(Boolean)) return;
    data.siegeElapsed += dt;
    if (data.siegeElapsed >= MOUND_BITE_INTERVAL) {
      data.siegeElapsed = 0;
      for (let index = 0; index < data.soldiers.length && data.siegeHealth > 0; index++) {
        data.siegeHealth = damageMound(data.siegeHealth);
        recordRule(sim, "damageMound");
      }
      setMoundProgress(sim, data.rivalMound, data.siegeHealth / 8);
      sim.host.dataset.rivalMoundHealth = String(data.siegeHealth);
    }
    if (data.siegeHealth === 0) {
      sim.host.dataset.rivalMoundsDestroyed = String((Number(sim.host.dataset.rivalMoundsDestroyed) || 0) + 1);
      data.workers.forEach((actor) => { actor.job = "retreat"; });
      data.stage = "driven-off";
      setPhase(sim, "rival-driven-off");
    }
    return;
  }
  if (data.stage === "driven-off") {
    const returns = data.workers.map((actor, index) => moveActor(sim, actor, { x: data.home.x + index * 7, y: data.home.y + 6 }, dt, { job: "retreat", factor: 0.9 }));
    const returned = returns.every(Boolean);
    if (returned) completeCycle(sim);
  }
}

function tick(sim, dt) {
  sim.clock += dt;
  if (sim.phase === "complete") {
    if (sim.clock - sim.phaseAt >= 0.65) resetCycle(sim);
    return;
  }
  if (sim.phase === "reset") {
    if (sim.clock >= sim.restartAt) {
      sim.svg.replaceChildren();
      drawScene(sim);
    }
    return;
  }
  if (sim.mode === "eat") tickForage(sim, dt);
  else if (sim.mode === "colony") { tickForage(sim, dt); tickColonyBuild(sim, dt); }
  else if (sim.mode === "fight") tickFight(sim, dt);
  else if (sim.mode === "castes") tickCastes(sim, dt);
  else if (sim.mode === "worship") tickWorship(sim, dt);
  else if (sim.mode === "rival") tickRival(sim, dt);
}

export function mountNest(host) {
  const mode = modeFor(host);
  if (!stateLabel[mode]) return false;
  host.innerHTML = `<div class="nest-scene"><div class="nest-scene__stage"><svg viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${stateLabel[mode]}"></svg></div></div>`;
  const scene = host.querySelector(".nest-scene");
  const stage = host.querySelector(".nest-scene__stage");
  const canvas = host.querySelector("svg");
  if (!scene || !stage || !canvas) return false;
  const sim = { host, scene, stage, svg: canvas, mode, clock: 0, phase: "", phaseAt: 0, restartAt: 0, completedCycles: 0, actors: [], letters: [], usedRules: new Set(), data: {} };
  host.dataset.eventState = "starting";
  host.dataset.completedCycles = "0";
  host.dataset.resetCount = "0";
  if (mode === "rival") host.dataset.rivalMoundsDestroyed = "0";
  host.dataset.maxStoresSeen = "0";
  host.dataset.lastRulesUsed = "";
  host.dataset.cycle = "1";
  host.dataset.stores = "0";
  drawScene(sim);
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    tick(sim, dt);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return true;
}
