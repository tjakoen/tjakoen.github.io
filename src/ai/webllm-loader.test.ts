// portfolio/ai/webllm-loader.test.ts — UNIT: the device→profile mapping. The profiles themselves are
// plain data; the logic worth pinning is pickProfile's conservative tiering (strong only on a clearly
// capable device, weak everywhere else — an over-guess means a visible OOM).
import { test, expect } from "bun:test";
import { pickProfile, WEAK_PROFILE, STRONG_PROFILE } from "./webllm-loader.ts";

test("pickProfile: deviceMemory ≥ 8 → the strong 1.5B", () => {
  expect(pickProfile({ webgpu: true, deviceMemory: 8 })).toBe(STRONG_PROFILE);
  expect(pickProfile({ webgpu: true, deviceMemory: 16 })).toBe(STRONG_PROFILE);
});

test("pickProfile: deviceMemory < 8 and no GPU/core signal → the weak 0.5B", () => {
  expect(pickProfile({ webgpu: true, deviceMemory: 4 })).toBe(WEAK_PROFILE);
});

test("pickProfile: a truthful large GPU buffer (~4GB, Chrome desktop) → strong even without deviceMemory", () => {
  expect(pickProfile({ webgpu: true, maxBufferSize: 4294967292 })).toBe(STRONG_PROFILE);
});

test("pickProfile: SAFARI on a Mac — no deviceMemory, 8 cores, buffer capped to ~1GB → strong", () => {
  expect(pickProfile({ webgpu: true, cores: 8, maxBufferSize: 1073741824 })).toBe(STRONG_PROFILE);
});

test("pickProfile: an iPhone-class device — ~6 cores, capped buffer, no deviceMemory → weak", () => {
  expect(pickProfile({ webgpu: true, cores: 6, maxBufferSize: 1073741824 })).toBe(WEAK_PROFILE);
});

test("pickProfile: 8 cores but a min-spec GPU buffer (256MB) → weak (the buffer floor guards the core path)", () => {
  expect(pickProfile({ webgpu: true, cores: 8, maxBufferSize: 268435456 })).toBe(WEAK_PROFILE);
});

test("pickProfile: no signals at all → weak, the conservative choice", () => {
  expect(pickProfile({ webgpu: true })).toBe(WEAK_PROFILE);
});

test("pickProfile: an override forces the tier regardless of the device (the ?tier= dev knob)", () => {
  expect(pickProfile({ webgpu: true, deviceMemory: 16 }, "weak")).toBe(WEAK_PROFILE);   // capable, forced down
  expect(pickProfile({ webgpu: true, deviceMemory: 4 }, "strong")).toBe(STRONG_PROFILE); // modest, forced up
  expect(pickProfile({ webgpu: true, deviceMemory: 4 }, undefined)).toBe(WEAK_PROFILE);  // no override → auto
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
