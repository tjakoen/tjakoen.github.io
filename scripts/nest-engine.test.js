import { describe, expect, test } from "bun:test";
import { createNestEngine } from "./nest-engine.js";

function makeWorld() {
  const letters = Array.from({ length: 36 }, (_, index) => ({ id: `letter-${index + 1}`, text: "letter" }));
  const frame = {
    width: 720,
    height: 240,
    nowMs: 0,
    home: { x: 80, y: 198, holeX: 102, holeY: 180, width: 136, height: 55 },
    letters: letters.map(({ id }, index) => ({
      id,
      x: 240 + (index % 12) * 24,
      y: 48 + Math.floor(index / 12) * 22,
      width: 8,
      height: 14,
      claimable: true,
    })),
    obstacles: [],
    moundSites: [{ id: "mini-1", x: 588, y: 198, width: 76, height: 38 }],
  };
  return { world: { id: "unit-colony", letters }, frame };
}

describe("createNestEngine", () => {
  test("runs a colony through collection, worship, building, drain, and reset", () => {
    const { world, frame } = makeWorld();
    const engine = createNestEngine({
      world,
      settings: { rivals: "disabled", maxAnts: 12, partyThresholds: [8, 16] },
      seed: 81,
      initialFrame: frame,
    });
    const effects = [];
    let nowMs = 0;
    let completedCycles = 0;
    let latest = engine.snapshot();
    let sawInteriorTransport = false;
    let sawQueenWorship = false;

    for (let tick = 0; tick < 30_000 && completedCycles < 2; tick++) {
      nowMs += 50;
      const currentFrame = { ...frame, nowMs };
      const result = engine.step(0.05, currentFrame);
      effects.push(...result.effects.map((effect) => effect.type));
      latest = result.snapshot;
      sawInteriorTransport ||= latest.interiorLarder > 0
        || latest.ants.some((ant) => ant.job.startsWith("inside-"));
      sawQueenWorship ||= latest.colony.worshipPhase !== "home";
      if (latest.letters.every((letter) => letter.state === "stored")
        && latest.ants.every((ant) => ant.location === "nest")
        && latest.colony.worshipIndex >= 2) {
        const reset = engine.reset(currentFrame);
        effects.push(...reset.effects.map((effect) => effect.type));
        latest = reset.snapshot;
        completedCycles++;
      }
    }

    expect(completedCycles).toBe(2);
    expect(sawInteriorTransport).toBe(true);
    expect(sawQueenWorship).toBe(true);
    expect(effects).toContain("letterClaimed");
    expect(effects).toContain("letterRestored");
    expect(latest.colony.stolenTotal).toBe(0);
    expect(latest.ants.length).toBeGreaterThanOrEqual(4);
    expect(latest.ants.every((ant) => Number.isFinite(ant.x) && Number.isFinite(ant.y))).toBe(true);
    expect(Object.isFrozen(latest.ants[0])).toBe(true);
    engine.destroy();
    expect(() => engine.snapshot()).toThrow("Nest engine destroyed");
  });
});
