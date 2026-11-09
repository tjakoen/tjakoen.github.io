import {
  advanceBuild,
  foodShares,
  roleSpeed,
  stepMovement,
  storeCapacity,
  worshipReturnAt,
  worshipTarget,
} from "./nest-simulation.js";
import { NEST_LAYOUT, nestRouteLength, nestRoutePoint } from "./nest-assets.js";

const STEP_MS = 100;
const SPEEDS = new Set([1, 2, 4]);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function randomFrom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

export function createNestEngine({ world, settings, seed, initialFrame }) {
  if (!world?.id || !Array.isArray(world.letters) || !initialFrame?.home) throw new TypeError("Nest engine requires a source world and initial frame");
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new TypeError("Nest engine seed must be an unsigned 32-bit integer");
  const options = {
    rivals: settings?.rivals === "enabled" ? "enabled" : "disabled",
    maxAnts: Math.max(4, settings?.maxAnts || 20),
    partyThresholds: settings?.partyThresholds || [20, 50, 90, 140, 200, 280, 380],
  };
  let random = randomFrom(seed);
  let destroyed = false;
  let sequence = 0;
  let accumulator = 0;
  let state;

  const randomIndex = (items) => items.length ? Math.floor(random() * items.length) : -1;
  const emit = (effects, type, payload) => effects.push({ sequence: ++sequence, type, payload });
  const sourcePosition = (frame, id) => frame.letters.find((letter) => letter.id === id);

  function initialize(frame) {
    const letters = world.letters.map((source) => {
      const point = sourcePosition(frame, source.id);
      return {
        id: source.id,
        text: source.text,
        x: point?.x ?? frame.width * 0.75,
        y: point?.y ?? frame.height * 0.35,
        width: point?.width ?? 8,
        height: point?.height ?? 12,
        claimable: point?.claimable !== false,
        state: "free",
        carrierIds: [],
      };
    });
    const home = { ...frame.home };
    state = {
      elapsedMs: 0,
      nowMs: frame.nowMs,
      colony: {
        paused: false, over: false, overrun: false, queenDead: false,
        stores: 0, larder: [], meals: 0, built: 0, stolenTotal: 0, peak: 4,
        worshipIndex: 0, worshipThreshold: worshipTarget(options.partyThresholds[0]),
        worshipPhase: "home", speed: 4, feedFlip: false,
      },
      home,
      queen: { id: 0, x: home.holeX, y: home.holeY, visible: false, heading: -Math.PI / 2, eat: 0, lay: 0 },
      ants: [], letters, trails: [], mounds: [], eggs: [], rival: null, interiorLarder: [], queenMealCount: 0,
      party: null, nextEggAt: frame.nowMs + 6000, nextScoutAt: frame.nowMs + 1800,
    };
    for (let i = 0; i < 4; i++) {
      const role = i === 0 ? "scout" : "worker";
      state.ants.push({
        id: i + 1, role, job: role === "scout" ? "scout" : "nest",
        location: "nest", x: home.holeX + (i - 1.5) * 3, y: home.holeY + i,
        px: home.holeX, py: home.holeY, heading: role === "scout" ? -Math.PI / 2 : 0,
        walkPhase: 0, health: 1, trailId: null, letterId: null, targetId: null,
        path: [], pathIndex: 0, wander: 0,
        nestRoute: i === 0 ? "hatch" : "up",
        nestDistance: i === 0 ? nestRouteLength(NEST_LAYOUT.routes.hatch) * 0.5 : nestRouteLength(NEST_LAYOUT.routes.up) - 0.07 - (i - 1) * 0.025,
      });
    }
  }

  function snapshot() {
    return deepFreeze({
      elapsedMs: state.elapsedMs,
      colony: { ...state.colony, larder: state.colony.larder.slice() },
      queen: { ...state.queen },
      ants: state.ants.map((ant) => ({
        id: ant.id, role: ant.role, job: ant.job, location: ant.location,
        x: ant.x, y: ant.y, heading: ant.heading, walkPhase: ant.walkPhase, health: ant.health,
        targetId: ant.targetId || undefined, trailId: ant.trailId || undefined,
        letterId: ant.letterId || undefined, moundId: ant.moundId || undefined,
        buildProgress: ant.buildProgress, where: ant.location === "nest" ? "nest" : "page",
        route: ant.nestRoute, d: ant.nestDistance, food: ant.letterId ? "letter" : null,
      })),
      letters: state.letters.map(({ id, x, y, state: letterState, carrierIds }) => ({
        id, x, y, state: letterState, carrierIds: carrierIds.slice(),
      })),
      trails: state.trails.map((trail) => ({
        id: trail.id, side: "main", state: trail.state, points: trail.points.map((point) => point.slice()),
        antIds: trail.antIds.slice(), letterIds: trail.letterIds.slice(),
      })),
      mounds: state.mounds.map((mound) => ({ ...mound })),
      eggs: state.eggs.map((egg) => ({ ...egg, d: nestRouteLength(NEST_LAYOUT.routes.lay) })),
      interiorLarder: state.interiorLarder.length,
      rival: null,
    });
  }

  const result = (effects = []) => ({ snapshot: snapshot(), effects });
  const byId = (id) => state.ants.find((ant) => ant.id === id);
  const freeLetters = () => state.letters.filter((letter) => letter.claimable && letter.state === "free");
  const trailById = (id) => state.trails.find((trail) => trail.id === id);

  function chooseTarget(ant, trail) {
    const candidates = freeLetters();
    if (!candidates.length) return null;
    let pool = candidates;
    if (trail?.points.length > 2) {
      const near = candidates.filter((letter) => trail.points.some((point) => Math.hypot(point[0] - letter.x, point[1] - letter.y) < 92));
      if (near.length) pool = near;
    }
    const selected = pool[randomIndex(pool)];
    if (selected) {
      ant.targetId = selected.id;
      ant.letterId = selected.id;
    }
    return selected;
  }

  function ensureTrail(ant, point) {
    if (ant.trailId && trailById(ant.trailId)) return trailById(ant.trailId);
    const points = ant.pathHistory?.length > 1 ? ant.pathHistory.map((item) => item.slice()) : [[state.home.holeX, state.home.holeY], [point.x, point.y]];
    points.push([point.x, point.y]);
    const trail = { id: `${world.id}-trail-${state.trails.length + 1}`, state: "ready", points, antIds: [], letterIds: [] };
    state.trails.push(trail);
    ant.trailId = trail.id;
    return trail;
  }

  function claim(ant, letter, effects) {
    if (!letter || letter.state !== "free") return false;
    letter.state = "gather";
    letter.carrierIds = [ant.id];
    ant.letterId = letter.id;
    ant.targetId = letter.id;
    ant.job = "carry-home";
    ant.location = "world";
    const trail = ensureTrail(ant, letter);
    ant.path = trail.points.toReversed().map(([x, y]) => ({ x, y }));
    ant.path.push({ x: state.home.holeX, y: state.home.holeY });
    ant.pathIndex = 0;
    ant.pathHistory = null;
    if (!trail.letterIds.includes(letter.id)) trail.letterIds.push(letter.id);
    if (!trail.antIds.includes(ant.id)) trail.antIds.push(ant.id);
    emit(effects, "letterClaimed", { letterId: letter.id, antId: ant.id });
    return true;
  }

  function setPath(ant, trail, direction, target) {
    const points = trail?.points.length > 1 ? trail.points : [[state.home.holeX, state.home.holeY], [target.x, target.y]];
    ant.path = (direction === "out" ? points : points.toReversed()).map(([x, y]) => ({ x, y }));
    if (target) ant.path.push({ x: target.x, y: target.y });
    ant.pathIndex = 0;
  }

  function arriveHome(ant, frame) {
    const letter = state.letters.find((item) => item.id === ant.letterId);
    if (!letter || letter.state === "stored") return;
    letter.state = "larder";
    letter.carrierIds = [ant.id];
    ant.location = "nest";
    ant.x = state.home.holeX;
    ant.y = state.home.holeY;
    ant.job = "inside-letter";
    ant.nestRoute = "down";
    ant.nestDistance = 0;
    ant.path = [];
    ant.targetId = letter.id;
    state.nowMs = frame.nowMs;
  }

  function stepInsideAnt(ant, dt) {
    const route = NEST_LAYOUT.routes[ant.nestRoute];
    if (!route) return;
    const length = nestRouteLength(route);
    ant.nestDistance = Math.min(length, ant.nestDistance + 0.18 * dt * state.colony.speed);
    const [u, v, heading] = nestRoutePoint(route, ant.nestDistance);
    ant.nestX = u;
    ant.nestY = v;
    ant.heading += (((heading - ant.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, 9 * dt);
    ant.walkPhase += dt * 4;
    if (ant.nestDistance < length) return;
    if (ant.nestRoute === "down") {
      if (ant.letterId && !state.interiorLarder.includes(ant.letterId)) state.interiorLarder.push(ant.letterId);
      ant.nestRoute = "feed";
      ant.nestDistance = 0;
      ant.job = "inside-feed";
    } else if (ant.nestRoute === "feed") {
      const letter = state.letters.find((item) => item.id === ant.letterId);
      if (letter && letter.state !== "stored") {
        state.interiorLarder = state.interiorLarder.filter((id) => id !== letter.id);
        letter.state = "stored";
        letter.carrierIds = [];
        state.colony.larder.push(letter.id);
        state.colony.stolenTotal++;
        const shares = foodShares(1, state.colony.feedFlip, !state.colony.queenDead);
        state.colony.feedFlip = shares.feedFlip;
        state.colony.stores += shares.stores;
        state.colony.meals = (state.colony.meals || 0) + shares.meals;
        for (let meal = 0; meal < shares.meals; meal++) {
          state.queenMealCount++;
          state.queen.eat = 0.8;
          if (state.queenMealCount % 3 === 0 && state.ants.length + state.eggs.length < options.maxAnts) {
            state.queen.lay = 1;
            state.eggs.push({ id: `${world.id}-egg-${state.eggs.length + state.colony.peak + 1}`, x: state.home.x, y: state.home.y, progress: 0, age: 0 });
          }
        }
      }
      ant.letterId = null;
      ant.nestRoute = "up";
      ant.nestDistance = 0;
      ant.job = "inside-return";
    } else if (ant.nestRoute === "up" || ant.nestRoute === "hatch") {
      ant.location = "nest";
      ant.job = "nest";
      ant.nestRoute = "up";
      ant.nestDistance = length;
      ant.targetId = null;
      ant.letterId = null;
      ant.path = [];
      ant.trailId = state.trails[0]?.id || null;
      if (ant.role === "scout") ant.role = "worker";
    }
  }

  function beginForage(ant, trail, frame) {
    const letter = chooseTarget(ant, trail);
    if (!letter) {
      ant.job = ant.role === "scout" ? "scout" : "nest";
      ant.location = "nest";
      ant.targetId = null;
      return false;
    }
    ant.job = "forage";
    ant.location = "world";
    ant.trailId = trail?.id || state.trails[0]?.id || null;
    setPath(ant, trailById(ant.trailId), "out", letter);
    ant.targetId = letter.id;
    ant.letterId = null;
    if (trail && !trail.points.some((point) => Math.hypot(point[0] - letter.x, point[1] - letter.y) < 12)) trail.points.push([letter.x, letter.y]);
    ant.lastForageAt = frame.nowMs;
    return true;
  }

  function moveAlongPath(ant, dt, frame) {
    let target = ant.path[ant.pathIndex];
    while (target && distance(ant, target) < 2) target = ant.path[++ant.pathIndex];
    if (!target) return true;
    const speed = roleSpeed(ant.role, ant.job === "carry-home" ? "carry" : "scout", 44, {
      letterNeed: 1,
      factor: state.colony.speed,
    });
    const beforeX = ant.x, beforeY = ant.y;
    const arrived = stepMovement(ant, target.x, target.y, dt, speed, { now: frame.nowMs, blocked: () => false });
    const moved = Math.hypot(ant.x - beforeX, ant.y - beforeY);
    ant.walkPhase += moved / 4;
    ant.px = beforeX;
    ant.py = beforeY;
    const trail = trailById(ant.trailId);
    if (trail && ant.job === "scout" && moved > 0.4) trail.points.push([ant.x, ant.y]);
    if (arrived) ant.pathIndex++;
    return ant.pathIndex >= ant.path.length;
  }

  function stepAnt(ant, dt, frame, effects) {
    if (state.party && ant.job !== "dance") return;
    if (ant.job.startsWith("inside-")) {
      stepInsideAnt(ant, dt);
      return;
    }
    if (ant.job === "nest") {
      if (state.party || state.colony.paused) return;
      const trail = state.trails.find((item) => item.state === "ready");
      if (ant.role === "scout" || trail) beginForage(ant, trail, frame);
      return;
    }
    if (ant.job === "scout") {
      if (!ant.targetId) {
        const letter = chooseTarget(ant, null);
        if (!letter) return;
        ant.job = "scout-walk";
        ant.location = "world";
        ant.path = [{ x: letter.x, y: letter.y }];
        ant.pathIndex = 0;
      }
    }
    if (ant.job === "scout-walk" || ant.job === "forage") {
      ant.pathHistory ||= [[ant.x, ant.y]];
      const arrived = moveAlongPath(ant, dt, frame);
      const previous = ant.pathHistory.at(-1);
      if (Math.hypot(ant.x - previous[0], ant.y - previous[1]) > 2) ant.pathHistory.push([ant.x, ant.y]);
      const letter = state.letters.find((item) => item.id === ant.targetId);
      if (arrived && letter?.state === "free") claim(ant, letter, effects);
      else if (arrived && letter?.state !== "free") { ant.job = "nest"; ant.location = "nest"; ant.targetId = null; ant.letterId = null; ant.path = []; ant.pathIndex = 0; }
      return;
    }
    if (ant.job === "carry-home") {
      const trail = trailById(ant.trailId);
      if (!ant.path.length) setPath(ant, trail, "back", { x: state.home.holeX, y: state.home.holeY });
      const arrived = moveAlongPath(ant, dt, frame);
      if (arrived || distance(ant, state.home) < 6) arriveHome(ant, frame);
    }
  }

  function startWorship(frame) {
    const stage = { x: clamp(state.home.x + 145, 80, frame.width - 50), y: clamp(state.home.y - 72, 40, frame.height - 55) };
    const dancers = state.ants.filter((ant) => ant.location !== "nest" && !ant.letterId && ant.job !== "carry-home");
    state.party = { startedAt: frame.nowMs, stage, phase: "gathering", dancers: dancers.map((ant) => ant.id), returnAt: Infinity };
    state.colony.worshipPhase = "gathering";
    state.queen.visible = true;
    state.queen.x = state.home.holeX;
    state.queen.y = state.home.holeY;
    dancers.forEach((ant, index) => {
      ant.job = "dance";
      ant.partyAngle = (index / Math.max(1, dancers.length)) * Math.PI * 2;
      ant.partyRadius = 48;
    });
  }

  function stepParty(frame, dt) {
    const party = state.party;
    if (!party) return;
    const elapsed = frame.nowMs - party.startedAt;
    if (party.phase === "gathering") {
      const u = clamp(elapsed / 850, 0, 1);
      state.queen.x = state.home.holeX + (party.stage.x - state.home.holeX) * u;
      state.queen.y = state.home.holeY + (party.stage.y - state.home.holeY) * u;
      const gathered = party.dancers.every((id) => {
        const ant = byId(id);
        if (!ant) return true;
        const angle = ant.partyAngle;
        const target = { x: party.stage.x + Math.cos(angle) * ant.partyRadius, y: party.stage.y + Math.sin(angle) * ant.partyRadius * 0.55 };
        stepMovement(ant, target.x, target.y, dt, roleSpeed(ant.role, "dance", 44, { factor: state.colony.speed }), { now: frame.nowMs });
        ant.walkPhase += 0.35;
        return distance(ant, target) < 7;
      });
      if (gathered && elapsed >= 850) {
        party.phase = "dance";
        party.returnAt = worshipReturnAt(frame.nowMs + 4000);
        state.colony.worshipPhase = "dance";
      }
      return;
    }
    if (party.phase === "dance" && frame.nowMs >= party.returnAt) {
      party.phase = "returning";
      state.colony.worshipPhase = "returning";
    }
    if (party.phase === "returning") {
      const arrived = state.queen.x === state.home.holeX && state.queen.y === state.home.holeY;
      if (!arrived) {
        const done = stepMovement(state.queen, state.home.holeX, state.home.holeY, dt, 44 * state.colony.speed, { now: frame.nowMs });
        if (!done) return;
      }
      state.queen.visible = false;
      state.colony.stores = Math.max(state.colony.stores, storeCapacity(state.colony.built));
      state.colony.worshipIndex++;
      state.colony.worshipThreshold = worshipTarget(options.partyThresholds[state.colony.worshipIndex] ?? state.colony.stolenTotal + 40);
      party.dancers.forEach((id) => {
        const ant = byId(id);
        if (ant) { ant.job = "nest"; ant.location = "nest"; ant.x = state.home.holeX; ant.y = state.home.holeY + 5; ant.targetId = null; ant.letterId = null; ant.path = []; ant.pathIndex = 0; ant.nestRoute = "up"; ant.nestDistance = nestRouteLength(NEST_LAYOUT.routes.up); }
      });
      state.colony.worshipPhase = "home";
      state.party = null;
    }
  }

  function stepEconomy(frame, dt) {
    state.queen.eat = Math.max(0, state.queen.eat - dt);
    state.queen.lay = Math.max(0, state.queen.lay - dt);
    if (frame.nowMs >= state.nextEggAt) {
      state.eggs.push({ id: `${world.id}-egg-${state.eggs.length + state.colony.peak}`, x: state.home.x, y: state.home.y - 12, progress: 0, age: 0 });
      state.nextEggAt = Infinity;
    }
    state.eggs.forEach((egg) => { egg.progress = clamp(egg.progress + dt / 3.4, 0, 1); egg.age += dt; });
    const hatch = state.eggs.findIndex((egg) => egg.progress >= 1);
    if (hatch >= 0 && state.ants.length < options.maxAnts) {
      state.eggs.splice(hatch, 1);
      const id = state.ants.reduce((max, ant) => Math.max(max, ant.id), 0) + 1;
      state.ants.push({ id, role: "worker", job: "inside-hatch", location: "nest", x: state.home.holeX, y: state.home.holeY, heading: 0, walkPhase: 0, health: 1, path: [], pathIndex: 0, trailId: state.trails[0]?.id || null, targetId: null, letterId: null, carrierIds: [], nestRoute: "hatch", nestDistance: 0 });
      state.colony.peak = Math.max(state.colony.peak, state.ants.length);
    }
    if (state.colony.stores >= storeCapacity(state.colony.built) && state.mounds.length < 1) {
      const site = frame.moundSites[0];
      if (site) {
        state.colony.stores -= storeCapacity(state.colony.built);
        const mound = { id: site.id, x: site.x, y: site.y, width: site.width, height: site.height, progress: 0, health: 5 };
        state.mounds.push(mound);
        const builder = state.ants.find((ant) => ant.location === "nest" && ant.role === "worker");
        if (builder) {
          builder.role = "builder";
          builder.job = "build-walk";
          builder.location = "world";
          builder.targetId = mound.id;
          builder.buildProgress = 0;
          builder.path = [{ x: mound.x, y: mound.y }];
          builder.pathIndex = 0;
        }
      }
    }
    state.mounds.forEach((mound) => {
      const builder = state.ants.find((ant) => ant.targetId === mound.id && ant.role === "builder");
      if (!builder) return;
      if (builder.job === "build-walk") {
        if (moveAlongPath(builder, dt, frame)) builder.job = "building";
      } else if (builder.job === "building") {
        mound.progress = advanceBuild(mound.progress, dt);
        builder.buildProgress = mound.progress;
        if (mound.progress >= 1) { state.colony.built++; builder.job = "build-home"; builder.path = [{ x: state.home.holeX, y: state.home.holeY }]; builder.pathIndex = 0; }
      } else if (builder.job === "build-home") {
        if (moveAlongPath(builder, dt, frame)) { builder.role = "worker"; builder.job = "nest"; builder.location = "nest"; builder.targetId = null; }
      }
    });
  }

  initialize(initialFrame);

  function assertAlive() {
    if (destroyed) throw new Error("Nest engine destroyed");
  }

  return {
    step(dt, frame) {
      assertAlive();
      if (!frame || !Number.isFinite(dt) || dt < 0) return result();
      state.nowMs = frame.nowMs;
      if (!state.colony.paused) {
        const scaled = Math.min(0.05, dt) * state.colony.speed;
        state.elapsedMs += scaled * 1000;
        accumulator += scaled * 1000;
        const effects = [];
        while (accumulator >= STEP_MS) {
          const fixed = STEP_MS / 1000;
          state.ants.forEach((ant) => stepAnt(ant, fixed, frame, effects));
          stepEconomy(frame, fixed);
          if (state.colony.worshipIndex < 2 && !state.party && state.colony.stolenTotal >= state.colony.worshipThreshold) startWorship(frame);
          accumulator -= STEP_MS;
        }
        if (state.party) stepParty(frame, Math.min(0.05, dt));
        return result(effects);
      }
      return result();
    },
    command(action) {
      assertAlive();
      if (!action || typeof action !== "object") return result();
      const effects = [];
      if (action.type === "setPaused" && typeof action.paused === "boolean") state.colony.paused = action.paused;
      else if (action.type === "setSpeed" && SPEEDS.has(action.multiplier)) state.colony.speed = action.multiplier;
      else if (action.type === "squashAnt") {
        const ant = byId(action.antId);
        if (ant) { ant.health = 0; state.ants = state.ants.filter((item) => item !== ant); }
      } else if (action.type === "restoreWorld") {
        state.letters.forEach((letter) => {
          if (letter.state === "free") return;
          letter.state = "free"; letter.carrierIds = [];
          emit(effects, "letterRestored", { letterId: letter.id, x: letter.x, y: letter.y });
        });
        state.colony.larder = [];
        state.colony.stolenTotal = 0;
        state.colony.worshipIndex = 0;
        state.colony.worshipThreshold = worshipTarget(options.partyThresholds[0]);
        state.ants.forEach((ant) => { if (ant.letterId) { ant.letterId = null; ant.job = "nest"; ant.location = "nest"; ant.targetId = null; } });
      } else return result();
      return result(effects);
    },
    snapshot() { assertAlive(); return snapshot(); },
    reset(frame) {
      assertAlive();
      if (!frame?.home) return result();
      const effects = [];
      state.letters.forEach((letter) => {
        if (letter.state !== "free") emit(effects, "letterRestored", { letterId: letter.id, x: sourcePosition(frame, letter.id)?.x ?? letter.x, y: sourcePosition(frame, letter.id)?.y ?? letter.y });
      });
      sequence = effects.at(-1)?.sequence || sequence;
      accumulator = 0;
      random = randomFrom(seed);
      initialize(frame);
      return result(effects);
    },
    destroy() { destroyed = true; state = null; },
  };
}
