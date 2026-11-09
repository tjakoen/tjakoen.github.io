import { buildNestBase, composeNestGrid, encodeNestBraille } from "./nest-assets.js";
import { createNestEngine } from "./nest-engine.js";
import { storeCapacity } from "./nest-simulation.js";

const VIEW_WIDTH = 720;
const VIEW_HEIGHT = 480;
const GRID_WIDTH = 96;
const GRID_HEIGHT = 128;
const COLS = GRID_WIDTH / 2;
const ROWS = GRID_HEIGHT / 4;
const CELL_WIDTH = VIEW_WIDTH / COLS;
const CELL_HEIGHT = VIEW_HEIGHT / ROWS;
const SVG = "http://www.w3.org/2000/svg";
const makeSvg = (name, attrs = {}) => {
  const node = document.createElementNS(SVG, name);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
};

function makeWorld() {
  const words = "ants carry food";
  const letters = [...words].filter((char) => /[a-z]/i.test(char)).map((char, index) => ({ id: `interior-letter-${index + 1}`, text: char }));
  const home = { x: 360, y: 192, holeX: 360, holeY: 34, width: 136, height: 55 };
  const frame = {
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    nowMs: performance.now(),
    home,
    letters: letters.map(({ id }, index) => ({
      id,
      x: 424 + index % 13 * 17,
      y: 38 + Math.floor(index / 13) * 38,
      width: 8,
      height: 14,
      claimable: true,
    })),
    obstacles: [],
    moundSites: [],
  };
  return { world: { id: "note-colony-interior", letters }, frame };
}

function toneClass(tone) {
  return tone > 0 ? `t${tone}` : "";
}

export function mountColony(host) {
  const svg = makeSvg("svg", { class: "colony-interior", viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`, preserveAspectRatio: "xMidYMid meet", "aria-hidden": "true" });
  const layer = makeSvg("g", { class: "colony-interior__cells" });
  const base = buildNestBase(GRID_WIDTH, GRID_HEIGHT);
  const rendered = encodeNestBraille(base.cells, GRID_WIDTH, GRID_HEIGHT);
  const cells = rendered.map(({ char, tone }, index) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;
    const node = makeSvg("text", {
      x: col * CELL_WIDTH,
      y: (row + 1) * CELL_HEIGHT - (row === ROWS - 1 ? 3 : 0),
      class: `colony-interior__cell ${toneClass(tone)}`,
      "data-tone": tone,
    });
    node.textContent = char;
    layer.append(node);
    return node;
  });
  svg.append(layer);
  host.replaceChildren(svg);

  const { world, frame: initialFrame } = makeWorld();
  const engine = createNestEngine({
    world,
    settings: { rivals: "disabled", maxAnts: 12, partyThresholds: [3, 6, 9] },
    seed: 61421,
    initialFrame,
  });
  let lastFrame = performance.now();
  let lastDraw = 0;
  let paused = document.hidden;
  let inView = true;
  let resetAfter = 0;
  let completedCycles = 0;
  let stopped = false;
  let frameRequest = 0;
  let observer;

  function draw(snapshot, now) {
    const nestAnts = snapshot.ants.filter((ant) => ant.location === "nest").map((ant) => ({
      id: ant.id,
      role: ant.role,
      where: "nest",
      route: ant.route || "up",
      d: ant.d ?? 0,
      food: ant.letterId ? "letter" : null,
    }));
    const viewState = {
      ants: nestAnts,
      eggs: snapshot.eggs.map((egg) => ({ ...egg, d: Infinity })),
      queen: snapshot.queen,
      queenDead: snapshot.colony.queenDead,
      party: snapshot.colony.worshipPhase === "home" ? null : {},
      stores: snapshot.colony.stores,
      built: snapshot.colony.built,
      larder: Array.from({ length: snapshot.interiorLarder }, (_, index) => index),
    };
    const next = encodeNestBraille(
      composeNestGrid(base.cells, GRID_WIDTH, GRID_HEIGHT, base.radius, viewState, now, storeCapacity),
      GRID_WIDTH,
      GRID_HEIGHT,
    );
    next.forEach(({ char, tone }, index) => {
      const cell = cells[index];
      if (cell.textContent !== char) cell.textContent = char;
      const key = tone > 0 ? String(tone) : "";
      if (cell.dataset.tone !== key) {
        cell.dataset.tone = key;
        cell.setAttribute("class", `colony-interior__cell ${toneClass(tone)}`.trim());
      }
    });
    host.dataset.worship = snapshot.colony.worshipPhase;
    host.dataset.stores = String(snapshot.colony.stores);
    host.dataset.inLarder = String(snapshot.interiorLarder);
    host.dataset.antsInside = String(nestAnts.length);
    host.dataset.completedCycles = String(completedCycles);
    host.dataset.step = String(snapshot.elapsedMs);
  }

  function cycle(snapshot, now) {
    const drained = snapshot.letters.every((letter) => letter.state === "stored");
    const settled = snapshot.ants.every((ant) => ant.location === "nest");
    if (drained && settled && snapshot.colony.worshipIndex >= 2) {
      if (!resetAfter) resetAfter = now + 800;
      if (now >= resetAfter) {
        const reset = engine.reset({ ...initialFrame, nowMs: now });
        completedCycles++;
        resetAfter = 0;
        draw(reset.snapshot, now);
        return;
      }
    } else resetAfter = 0;
    host.dataset.phase = resetAfter ? "reset" : snapshot.colony.worshipPhase;
  }

  function tick(now) {
    frameRequest = 0;
    if (stopped || paused) return;
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    const result = engine.step(dt, { ...initialFrame, nowMs: now });
    if (now - lastDraw >= 100) {
      lastDraw = now;
      draw(result.snapshot, now);
      cycle(result.snapshot, now);
    }
    scheduleTick();
  }

  function scheduleTick() {
    if (!stopped && !paused && !frameRequest) frameRequest = requestAnimationFrame(tick);
  }
  function updatePause() {
    paused = document.hidden || !inView;
    lastFrame = performance.now();
    if (paused && frameRequest) { cancelAnimationFrame(frameRequest); frameRequest = 0; }
    else scheduleTick();
  }
  document.addEventListener("visibilitychange", updatePause);
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updatePause();
    }, { rootMargin: "100px" });
    observer.observe(host);
  }
  host.dataset.completedCycles = "0";
  draw(engine.snapshot(), performance.now());
  scheduleTick();
  return () => {
    stopped = true;
    if (frameRequest) cancelAnimationFrame(frameRequest);
    observer?.disconnect();
    document.removeEventListener("visibilitychange", updatePause);
    engine.destroy();
    host.replaceChildren();
  };
}
