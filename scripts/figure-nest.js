// Each box runs one bounded colony event with the same movement, food, combat, and build rules as Nest.
import { antClasses, antMarkup, miniArt } from "./nest-assets.js";
import {
  BUILD_TIME,
  RIVAL_FOUNDING_TIME,
  advanceBuild,
  blockedByTrailMate,
  combatHealth,
  combatPower,
  duelOdds,
  foodShares,
  groupCanWin,
  roleSpeed,
  stepMovement,
  TRAIL_FOLLOW_GAP,
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
  fight: "Guard and flyer duels, two rival guards against one soldier, and two workers against one rival guard",
  castes: "Worker, soldier, flyer, queen, and rival guard move by role",
  worship: "The queen leaves, the colony gathers, and worship ends",
  rival: "A rival founds a mound, patrols its trail, and banks stolen letters while the main colony forages",
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

function addActor(sim, role, side, x, y, { job = "idle" } = {}) {
  const wrap = svg("g", { class: antClasses(role, side), "data-role": role, "data-side": side });
  const turn = svg("g");
  turn.innerHTML = antMarkup({ role, centered: true });
  wrap.append(turn);
  sim.dynamic.append(wrap);
  const actor = { id: sim.actors.length + 1, role, side, x, y, px: x, py: y, heading: side === "rival" ? Math.PI : 0, job, el: wrap, turn, carry: null, stuck: 0, paused: false, flightPhase: 0, trailId: null };
  sim.actors.push(actor);
  placeActor(actor);
  return actor;
}

function placeActor(actor) {
  actor.el.setAttribute("transform", `translate(${actor.x} ${actor.y})`);
  // The shared ant artwork faces left at rest.
  actor.turn.setAttribute("transform", `rotate(${actor.heading * 180 / Math.PI + 180})`);
}

function moveActor(sim, actor, target, dt, { job = actor.job, factor = 1, letterNeed = 1 } = {}) {
  actor.job = job;
  const speed = roleSpeed(actor.role, job, BASE_SPEED, { letterNeed, factor });
  recordRule(sim, "roleSpeed");
  const beforeX = actor.x, beforeY = actor.y;
  actor.px = beforeX;
  actor.py = beforeY;
  const arrived = stepMovement(actor, target.x, target.y, dt, speed, {
    now: sim.clock * 1000,
    blocked: () => blockedByTrailMate(actor, sim.actors, TRAIL_FOLLOW_GAP),
  });
  if (actor.home) actor.el.classList.toggle("inside-mound", Math.hypot(actor.x - actor.home.x, actor.y - actor.home.y) < 11);
  recordRule(sim, "stepMovement");
  const walking = Math.hypot(actor.x - beforeX, actor.y - beforeY) > 0.02;
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
      actor.trailId = `${sim.mode}-${actor.side}`;
      actor.pathPoints = [[actor.x, actor.y]];
      actor.forageRoute = forageRoute(actor, home, next);
    }
    if (actor.job === "scout" || actor.job === "toLetter") {
      const letter = actor.letter;
      const route = actor.trailRoute || sim.trailPoints?.[actor.side] || actor.forageRoute;
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
      const trailCurve = actor.trailRoute || sim.trailPoints?.[actor.side] || actor.forageRoute;
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
      if (actor.side === "main") applyFood(sim, letter);
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
  sim.actors = [addActor(sim, "queen", "main", home.x, home.y), addActor(sim, "worker", "main", home.x - 10, home.y + 7, { job: "search" }), addActor(sim, "worker", "main", home.x + 9, home.y + 6, { job: "search" }), addActor(sim, "soldier", "main", home.x + 1, home.y + 12)];
  sim.actors.forEach((actor) => { actor.home = home; actor.el.classList.add("inside-mound"); });
  sim.trailPath = addTrail(sim);
  sim.data = { home, forage: sim.actors.slice(1, 3), builder: null, mound: null, build: 0, buildTarget: { x: 456, y: 164 }, stage: "delivery" };
  setPhase(sim, "workers-deliver");
}

const FIGHT_CASES = [
  { id: "guard-duel", title: "Guard duel", main: ["soldier"], rival: ["rival-guard"] },
  { id: "rival-group", title: "Two rival guards against one soldier", main: ["soldier"], rival: ["rival-guard", "rival-guard"], defending: "main" },
  { id: "main-group", title: "Two workers against one rival guard", main: ["worker", "worker"], rival: ["rival-guard"], defending: "rival" },
  { id: "flyer-duel", title: "Flyer duel", main: ["flyer"], rival: ["rival-flyer"] },
];

function sceneText(sim, text, y) {
  const label = svg("text", { class: "nest-scene__caption", x: WIDTH / 2, y, "text-anchor": "middle" });
  label.textContent = text;
  sim.dynamic.append(label);
  return label;
}

function setupFight(sim) {
  const encounter = FIGHT_CASES[sim.completedCycles % FIGHT_CASES.length];
  const title = sceneText(sim, encounter.title, 35);
  const trail = svg("path", { d: "M158 108 Q218 82 289 100 H311 Q382 82 442 108", class: "nest-scene__trail" });
  sim.dynamic.append(trail);
  const group = (roles, side, start, end) => {
    const route = trailPoints(trail, start, end);
    return roles.map((role, index) => {
      const offset = (index - (roles.length - 1) / 2) * 19;
      const lane = route.map(({ x, y }) => ({ x, y: y + offset }));
      const actor = addActor(sim, role, side, lane[0].x, lane[0].y);
      actor.trailRoute = lane;
      actor.routeIndex = 1;
      return actor;
    });
  };
  const mains = group(encounter.main, "main", 0, 0.465);
  const rivals = group(encounter.rival, "rival", 1, 0.535);
  const status = sceneText(sim, "", 164);
  const odds = encounter.defending ? null : duelOdds(mains[0].role, rivals[0].role);
  if (odds !== null) title.textContent += ` · ${Math.round(odds * 100)}% chance for the main colony`;
  sim.data = { encounter, mains, rivals, status, odds };
  setPhase(sim, "trail-approach");
}

function setupCastes(sim) {
  addFloor(sim, 153);
  const roles = [
    { role: "worker", side: "main", x: 78, y: 98, factor: 1, route: [[112, 82], [120, 112]] },
    { role: "soldier", side: "main", x: 187, y: 98, factor: 0.8, route: [[212, 80], [216, 116]] },
    { role: "flyer", side: "main", x: 297, y: 98, factor: 1, route: [[337, 70], [346, 105]] },
    { role: "queen", side: "main", x: 405, y: 98, factor: 0.9, route: [[441, 91], [434, 114]] },
    { role: "rival-guard", side: "rival", x: 515, y: 98, factor: 0.7, route: [[482, 80], [478, 116]] },
  ];
  sim.actors = roles.map((entry) => {
    const actor = addActor(sim, entry.role, entry.side, entry.x, entry.y, { job: "role-route" });
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
  const queen = addActor(sim, "queen", "main", home.x, home.y, { job: "worship" });
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
  addMound(sim, 36, 125, { width: 126, height: 54 });
  sim.letters = addSentence(sim, "The page feeds both colonies.", [4, 5, 6, 7, 20, 21, 22, 23]);
  sim.letters.forEach((letter, index) => { letter.side = index < 4 ? "main" : "rival"; });
  sim.storeMax = storeCapacity(0);
  recordRule(sim, "storeCapacity");

  const mainTrail = addTrail(sim);
  mainTrail.setAttribute("d", `M105 164 Q153 86 ${sim.letters[2].x} 70`);
  const rivalTrail = addTrail(sim);
  rivalTrail.classList.add("rival");
  rivalTrail.setAttribute("visibility", "hidden");
  rivalTrail.setAttribute("d", `M488 164 Q434 86 ${sim.letters[6].x} 70`);
  sim.trailPoints = { main: trailPoints(mainTrail), rival: trailPoints(rivalTrail) };

  const workers = [addActor(sim, "rival-worker", "rival", home.x, home.y, { job: "wait" }),
    addActor(sim, "rival-worker", "rival", home.x, home.y, { job: "wait" })];
  const mainWorkers = [addActor(sim, "worker", "main", mainHome.x, mainHome.y, { job: "search" }),
    addActor(sim, "worker", "main", mainHome.x, mainHome.y, { job: "search" })];
  const guard = addActor(sim, "rival-guard", "rival", home.x, home.y, { job: "guard" });
  guard.patrol = sim.trailPoints.rival.slice(1, -1).map(({ x, y }) => ({ x: x + 8, y }));
  for (const crew of [workers, mainWorkers]) {
    crew.forEach((actor, index) => {
      const offset = index === 0 ? -5 : 5;
      actor.trailRoute = sim.trailPoints[actor.side].map(({ x, y }) => ({ x: x + offset, y }));
    });
  }
  const builders = [-26, 0, 26].map((offset) => {
    const builder = addActor(sim, "builder", "rival", home.x + offset, home.y + 10);
    builder.el.classList.remove("walk");
    return builder;
  });
  [...workers, guard, ...mainWorkers].forEach((actor) => {
    actor.home = actor.side === "main" ? mainHome : home;
    actor.el.classList.add("inside-mound");
  });
  const status = sceneText(sim, "The rival mound takes shape", 26);
  sim.data = { home, mainHome, rivalMound, rivalTrail, guard, workers, mainWorkers, builders, build: 0, status, banked: 0 };
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
    sim.data.builder = addActor(sim, "builder", "main", sim.data.home.x, sim.data.home.y, { job: "build-walk" });
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

function tickFight(sim, dt) {
  const { encounter, mains, rivals, odds, status } = sim.data;
  const actors = [...mains, ...rivals];
  if (sim.phase === "trail-approach") {
    const arrived = actors.map((actor) => moveOnRoute(sim, actor, actor.trailRoute, dt, {
      job: actor.role === "flyer" ? "fly" : "follow",
    }));
    if (!arrived.every(Boolean)) return;
    actors.forEach((actor) => {
      actor.el.classList.remove("walk");
      actor.el.classList.add("fighting");
    });
    status.textContent = odds === null ? "The nearby ants join the fight" : "The ants clash";
    setPhase(sim, "clash");
    return;
  }
  if (sim.clock - sim.phaseAt < 1) return;

  const result = { encounter: encounter.id };
  let loser;
  if (odds !== null) {
    recordRule(sim, "duelOdds");
    result.odds = odds;
    result.winner = Math.random() < odds ? "main" : "rival";
    loser = result.winner === "main" ? rivals[0] : mains[0];
  } else {
    const target = encounter.defending === "main" ? mains[0] : rivals[0];
    const attackers = encounter.defending === "main" ? rivals : mains;
    const nearby = attackers.filter((actor) => Math.hypot(actor.x - target.x, actor.y - target.y) < 42);
    result.power = nearby.reduce((total, actor) => total + combatPower(actor.role, actor.side), 0);
    result.health = combatHealth(target.role, target.side);
    ["combatPower", "combatHealth", "groupCanWin"].forEach((rule) => recordRule(sim, rule));
    if (groupCanWin(result.power, result.health)) {
      result.winner = nearby[0].side;
      loser = target;
    }
  }
  actors.forEach((actor) => actor.el.classList.remove("fighting"));
  if (loser) loser.el.style.opacity = "0";
  status.textContent = result.winner === "main" ? "The main colony wins" :
    result.winner === "rival" ? "The rival colony wins" : "The defender holds";
  sim.host.dataset.lastFight = JSON.stringify(result);
  completeCycle(sim);
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
  useForage(sim, dt, { home: data.mainHome, workers: data.mainWorkers });
  if (sim.phase === "rival-build") {
    data.build = advanceBuild(data.build, dt, RIVAL_FOUNDING_TIME);
    recordRule(sim, "advanceBuild");
    setMoundProgress(sim, data.rivalMound, data.build);
    if (data.build < 1) return;
    data.builders.forEach((actor) => actor.el.remove());
    sim.actors = sim.actors.filter((actor) => !data.builders.includes(actor));
    data.rivalTrail.removeAttribute("visibility");
    data.workers.forEach((actor) => { actor.job = "search"; });
    data.status.textContent = "Rival workers follow the red trail";
    setPhase(sim, "rival-steals");
  }

  useForage(sim, dt, {
    home: data.home,
    workers: data.workers,
    onDelivery: () => {
      data.banked++;
      data.status.textContent = `Letters banked by the rival · ${data.banked}`;
      sim.host.dataset.rivalLettersBanked = String((Number(sim.host.dataset.rivalLettersBanked) || 0) + 1);
    },
  });
  const { guard } = data;
  if (sim.clock >= (guard.resumeAt ?? 0) && moveOnRoute(sim, guard, guard.patrol, dt, { job: "guard", factor: 0.7 })) {
    guard.el.classList.remove("walk");
    guard.patrol.reverse();
    guard.routeIndex = 1;
    guard.resumeAt = sim.clock + 0.6;
  }
  if (allLettersDelivered(sim)) completeCycle(sim);
}

function tick(sim, dt) {
  sim.clock += dt;
  if (sim.phase === "complete") {
    if (sim.clock - sim.phaseAt >= (sim.mode === "fight" || sim.mode === "rival" ? 1.7 : 0.65)) resetCycle(sim);
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
  host.dataset.maxStoresSeen = "0";
  host.dataset.lastRulesUsed = "";
  host.dataset.cycle = "1";
  host.dataset.stores = "0";
  drawScene(sim);
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;
    tick(sim, dt);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  return true;
}
