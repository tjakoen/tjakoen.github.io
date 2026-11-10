import { buildNestBase, composeNestGrid, encodeNestBraille } from "./nest-assets.js";
import { createNestEngine } from "./nest-engine.js";
import { storeCapacity } from "./nest-simulation.js";

function makeWorld() {
  const words = "ants carry food";
  const letters = [...words].filter((char) => /[a-z]/i.test(char)).map((text, index) => ({ id: `interior-letter-${index + 1}`, text }));
  const width = 600;
  const height = 400;
  const home = { x: width / 2, y: height * 0.88, holeX: width / 2, holeY: height * 0.12, width: 136, height: 55 };
  const frame = {
    width,
    height,
    nowMs: performance.now(),
    home,
    letters: letters.map(({ id }, index) => ({
      id,
      x: width * (0.63 + index % 13 * 0.023),
      y: height * (0.055 + Math.floor(index / 13) * 0.09),
      width: 8,
      height: 14,
      claimable: true,
    })),
    obstacles: [],
    moundSites: [],
  };
  return { world: { id: "note-colony-interior", letters }, frame };
}

const toneClass = (tone) => tone > 0 ? `t${tone}` : "";

export function mountColony(host) {
  const pre = document.createElement("pre");
  pre.className = "colony-interior nest-pre";
  pre.setAttribute("aria-hidden", "true");
  host.replaceChildren(pre);

  let engine;
  let initialFrame;
  let base;
  let gridWidth = 0;
  let gridHeight = 0;
  let cells = [];
  let lastFrame = performance.now();
  let lastDraw = 0;
  let paused = document.hidden;
  let inView = true;
  let resetAfter = 0;
  let completedCycles = 0;
  let stopped = false;
  let frameRequest = 0;
  let observer;
  let resizeObserver;

  function buildCells(width, height) {
    gridWidth = width;
    gridHeight = height;
    const cols = width / 2;
    const rows = height / 4;
    cells = Array.from({ length: cols * rows });
    const fragment = document.createDocumentFragment();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = document.createElement("b");
        cell.textContent = "\u2800";
        cell.dataset.tone = "";
        cell._ch = "\u2800";
        cells[row * cols + col] = cell;
        fragment.append(cell);
      }
      fragment.append("\n");
    }
    pre.replaceChildren(fragment);
  }

  function measureAndReset() {
    if (stopped) return;
    const probe = document.createElement("span");
    probe.textContent = "⣿".repeat(20);
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
    pre.append(probe);
    const probeRect = probe.getBoundingClientRect();
    probe.remove();
    const cellWidth = probeRect.width / 20;
    const cellHeight = probeRect.height;
    if (!cellWidth || !cellHeight || !pre.clientWidth || !pre.clientHeight) return;
    const width = Math.floor(pre.clientWidth / cellWidth) * 2;
    const height = Math.floor(pre.clientHeight / cellHeight) * 4;
    if (width < 20 || height < 20 || (width === gridWidth && height === gridHeight && engine)) return;
    const now = performance.now();
    const { world, frame } = makeWorld();
    initialFrame = frame;
    base = buildNestBase(width, height);
    buildCells(width, height);
    engine?.destroy();
    engine = createNestEngine({
      world,
      settings: { rivals: "disabled", maxAnts: 12, partyThresholds: [1_000_000] },
      seed: 61421,
      initialFrame: { ...initialFrame, nowMs: now },
    });
    lastFrame = now;
    resetAfter = 0;
    host.dataset.phase = "starting";
    draw(engine.snapshot(), now);
  }

  function draw(snapshot, now) {
    if (!cells.length) return;
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
      party: null,
      stores: snapshot.colony.stores,
      built: snapshot.colony.built,
      larder: Array.from({ length: snapshot.interiorLarder }, (_, index) => index),
    };
    const next = encodeNestBraille(
      composeNestGrid(base.cells, gridWidth, gridHeight, base.radius, viewState, now, storeCapacity),
      gridWidth,
      gridHeight,
    );
    next.forEach(({ char, tone }, index) => {
      const cell = cells[index];
      if (cell._ch !== char) {
        cell._ch = char;
        cell.textContent = char;
      }
      const key = tone > 0 ? String(tone) : "";
      if (cell.dataset.tone !== key) {
        cell.dataset.tone = key;
        cell.className = toneClass(tone);
      }
    });
    host.dataset.worship = snapshot.colony.worshipPhase;
    host.dataset.queenHome = "true";
    host.dataset.stores = String(snapshot.colony.stores);
    host.dataset.inLarder = String(snapshot.interiorLarder);
    host.dataset.antsInside = String(nestAnts.length);
    host.dataset.completedCycles = String(completedCycles);
    host.dataset.step = String(snapshot.elapsedMs);
  }

  function cycle(snapshot, now) {
    const drained = snapshot.letters.every((letter) => letter.state === "stored");
    const settled = snapshot.ants.every((ant) => ant.location === "nest");
    if (drained && settled) {
      if (!resetAfter) resetAfter = now + 2200;
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
    if (stopped || paused || !engine) return;
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
    if (!stopped && !paused && engine && !frameRequest) frameRequest = requestAnimationFrame(tick);
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
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(measureAndReset);
    resizeObserver.observe(host);
  }
  host.dataset.completedCycles = "0";
  measureAndReset();
  scheduleTick();
  return () => {
    stopped = true;
    if (frameRequest) cancelAnimationFrame(frameRequest);
    observer?.disconnect();
    resizeObserver?.disconnect();
    document.removeEventListener("visibilitychange", updatePause);
    engine?.destroy();
    host.replaceChildren();
  };
}
