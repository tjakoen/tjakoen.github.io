import { describe, expect, test } from "bun:test";
import {
  advanceBuild,
  blockedByTrailMate,
  trailClearance,
  combatHealth,
  combatPower,
  damageMound,
  duelOdds,
  foodShares,
  groupCanWin,
  roleSpeed,
  RIVAL_FOUNDING_TIME,
  RIVAL_MOUND_HEALTH,
  MOUND_BITE_INTERVAL,
  stepMovement,
  storeCapacity,
  worshipReturnAt,
  worshipTarget,
} from "./nest-simulation.js";
import { antClasses, antMarkup, miniArt } from "./nest-assets.js";

describe("shared nest rules", () => {
  test("mound bites remove one shared hit point without going below zero", () => {
    expect(RIVAL_MOUND_HEALTH).toBe(16);
    expect(RIVAL_FOUNDING_TIME).toBe(3.2);
    expect(MOUND_BITE_INTERVAL).toBe(1.1);
    expect(damageMound(16)).toBe(15);
    expect(damageMound(1)).toBe(0);
    expect(damageMound(0)).toBe(0);
  });

  test("movement eases heading and uses its explicit clock for sway", () => {
    const ant = { id: 3, x: 0, y: 0, heading: Math.PI, job: "follow" };
    const arrived = stepMovement(ant, 20, 0, 0.1, 10, { now: 240, blocked: () => false });
    expect(arrived).toBe(false);
    expect(ant.heading).toBeCloseTo(Math.PI - 0.9 * Math.PI, 6);
    expect(ant.x).toBeCloseTo(1, 6);
  });

  test("ants queue behind same-trail ants moving in the same direction", () => {
    const leader = { id: 1, x: 38, y: 0, px: 37, py: 0, heading: 0, job: "follow", trailId: "trail-1", where: "page" };
    const follower = { id: 2, x: 20, y: 0, px: 20, py: 0, heading: 0, job: "follow", trailId: "trail-1", where: "page" };
    expect(blockedByTrailMate(follower, [leader, follower])).toBe(true);
    expect(blockedByTrailMate({ ...follower, trailId: "trail-2" }, [leader, follower])).toBe(false);
    expect(blockedByTrailMate({ ...follower, heading: Math.PI }, [leader, follower])).toBe(false);
    expect(blockedByTrailMate({ ...follower, stuck: 1 }, [leader, follower])).toBe(false);
  });

  test("a trail follower uses only the space left by the ant ahead", () => {
    const trail = {};
    const leader = { id: 1, x: 19, y: 0, heading: 0, job: "follow", trail };
    const follower = { id: 2, x: 0, y: 0, heading: 0, job: "follow", trail };
    const maxStep = trailClearance(follower, [leader, follower], 50, 0);
    expect(maxStep).toBe(1);
    stepMovement(follower, 50, 0, 0.1, 44, { now: 0, maxStep, wander: 0 });
    expect(follower.x).toBe(1);
    expect(trailClearance(follower, [leader, follower], 50, 0)).toBe(0);
    leader.x += 3;
    expect(trailClearance(follower, [leader, follower], 50, 0)).toBe(3);
    expect(trailClearance(follower, [{ ...leader, trail: {} }, follower], 50, 0)).toBe(Infinity);
    expect(trailClearance(follower, [{ ...leader, job: "home" }, follower], 50, 0)).toBe(Infinity);
    expect(trailClearance(follower, [{ ...leader, x: follower.x }, follower], 50, 0)).toBe(0);
  });

  test("an inbound worker queues behind the center of a letter crew", () => {
    const trail = {};
    const carrier = { id: 1, x: 16, y: 8, cx: 19, cy: 0, heading: 0, job: "carry", trail };
    const follower = { id: 2, x: 0, y: 0, heading: 0, job: "home", trail };
    expect(trailClearance(follower, [carrier, follower], 50, 0)).toBe(1);
  });

  test("two converging followers yield in one direction at a bend", () => {
    const trail = {};
    const first = { id: 1, x: 0, y: -3, heading: Math.PI / 6, job: "follow", trail };
    const second = { id: 2, x: 0, y: 3, heading: -Math.PI / 6, job: "follow", trail };
    expect(trailClearance(first, [first, second], 35, 17)).toBe(Infinity);
    expect(trailClearance(second, [first, second], 35, -17)).toBe(0);
  });

  test("carried letters keep the game's load and role speeds", () => {
    expect(roleSpeed("worker", "carry", 100, { letterNeed: 1 })).toBe(100);
    expect(roleSpeed("worker", "carry", 100, { letterNeed: 3 })).toBeCloseTo(62.5);
    expect(roleSpeed("flyer", "carry", 100, { letterNeed: 3 })).toBe(170);
    expect(roleSpeed("scout", "scout", 100)).toBe(135);
  });

  test("feed portions alternate between stores and meals, including a dead queen", () => {
    expect(foodShares(3, false, true)).toEqual({ stores: 2, meals: 1, feedFlip: true });
    expect(foodShares(2, false, false)).toEqual({ stores: 0, meals: 2, feedFlip: false });
    expect(foodShares(0, false, true)).toEqual({ stores: 1, meals: 0, feedFlip: true });
  });

  test("combat values preserve role health, group threshold, and duel odds", () => {
    expect(combatPower("worker", "main")).toBe(1);
    expect(combatPower("guard", "rival")).toBe(2);
    expect(combatHealth("guard", "rival")).toBe(2);
    expect(groupCanWin(2, combatHealth("guard", "rival"))).toBe(true);
    expect(groupCanWin(1, 2)).toBe(false);
    expect(duelOdds("soldier", "guard")).toBe(0.6);
    expect(duelOdds("flyer", "rival-flyer")).toBe(0.75);
  });

  test("store, build, and worship thresholds keep the game's values", () => {
    expect([0, 1, 4, 8].map(storeCapacity)).toEqual([12, 18, 36, 36]);
    expect(advanceBuild(0, 4)).toBe(0.5);
    expect(advanceBuild(0.95, 1)).toBe(1);
    expect(worshipTarget(0)).toBe(8);
    expect(worshipTarget(20)).toBe(20);
    expect(worshipReturnAt(9000)).toBe(6800);
  });

  test("ant roles and progressive mounds use shared game assets", () => {
    expect(antMarkup()).toContain('class="legs-a"');
    expect(antMarkup({ role: "flyer" })).toContain('class="wing"');
    expect(antMarkup({ role: "rival-guard" })).toBe(antMarkup({ role: "soldier" }));
    expect(antClasses("rival-guard", "rival")).toContain("rival");
    expect(antClasses("rival-worker", "rival")).toContain("rival-worker");
    expect(miniArt(0)).not.toBe(miniArt(1));
    expect(miniArt(0)).toContain("\u2800");
  });
});

import { detourAround } from "./nest-simulation.js";

describe("detourAround", () => {
  const box = { l: 100, t: 100, r: 300, b: 200 };
  test("leaves a clear path alone", () => {
    expect(detourAround({ x: 0, y: 0 }, 400, 0, [box])).toBeNull();
  });
  test("aims for a near corner when the box is in the way", () => {
    const [x, y] = detourAround({ x: 50, y: 150 }, 350, 150, [box]);
    expect(x).toBeLessThan(100);
    expect(y < 100 || y > 200).toBe(true);
  });
  test("walks out of a box it stands in", () => {
    const [x] = detourAround({ x: 105, y: 150 }, 0, 150, [box]);
    expect(x).toBeLessThan(100);
  });
  test("ignores a box that holds the target", () => {
    expect(detourAround({ x: 0, y: 150 }, 200, 150, [box])).toBeNull();
  });
  test("reaches the far side by walking", () => {
    const ant = { x: 50, y: 150, heading: 0, id: 1 };
    for (let i = 0; i < 2000 && Math.hypot(ant.x - 350, ant.y - 150) > 1; i++) {
      stepMovement(ant, 350, 150, 0.016, 120, { now: i * 16, obstacles: [box], wander: 0 });
      expect(ant.x > 101 && ant.x < 299 && ant.y > 101 && ant.y < 199).toBe(false);
    }
    expect(Math.hypot(ant.x - 350, ant.y - 150)).toBeLessThan(1.5);
  });
});
