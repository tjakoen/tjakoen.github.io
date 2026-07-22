// portfolio/ai/webllm-loader.test.ts — UNIT: the device→profile mapping. The profiles themselves are
// plain data; the logic worth pinning is pickProfile's conservative tiering (strong only on a clearly
// capable device, weak everywhere else — an over-guess means a visible OOM).
import { test, expect } from "bun:test";
import { pickProfile, WEAK_PROFILE, STRONG_PROFILE } from "./webllm-loader.ts";

test("pickProfile: deviceMemory ≥ 8 → the strong 1.5B", () => {
  expect(pickProfile({ webgpu: true, deviceMemory: 8 })).toBe(STRONG_PROFILE);
  expect(pickProfile({ webgpu: true, deviceMemory: 16 })).toBe(STRONG_PROFILE);
});

test("pickProfile: deviceMemory < 8 → the weak 0.5B", () => {
  expect(pickProfile({ webgpu: true, deviceMemory: 4 })).toBe(WEAK_PROFILE);
});

test("pickProfile: unknown deviceMemory (Firefox/Safari) → weak, the conservative choice", () => {
  expect(pickProfile({ webgpu: true })).toBe(WEAK_PROFILE);
});

test("profiles carry the model id + a coherent window/budget pairing", () => {
  expect(WEAK_PROFILE.id).toContain("0.5B");
  expect(STRONG_PROFILE.id).toContain("1.5B");
  // a bigger window earns a bigger prompt budget (the budget must fit inside the window)
  expect(STRONG_PROFILE.contextWindow).toBeGreaterThan(WEAK_PROFILE.contextWindow);
  expect(STRONG_PROFILE.promptTokenBudget).toBeGreaterThan(WEAK_PROFILE.promptTokenBudget);
  // the strong model loops less, so its penalties relax
  expect(STRONG_PROFILE.frequencyPenalty).toBeLessThan(WEAK_PROFILE.frequencyPenalty);
});
