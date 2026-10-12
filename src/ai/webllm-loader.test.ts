// portfolio/ai/webllm-loader.test.ts — UNIT: the two local model profiles and the conservative Builder gate.
import { test, expect } from "bun:test";
import { canRunStrong, profileForPage, STRONG_PROFILE, WEAK_PROFILE } from "./webllm-loader.ts";

test("the 0.5B profile carries a coherent window, budget, and generation pairing", () => {
  expect(WEAK_PROFILE.id).toContain("0.5B");
  expect(WEAK_PROFILE.promptTokenBudget).toBeLessThan(WEAK_PROFILE.contextWindow);
  expect(WEAK_PROFILE.frequencyPenalty).toBeGreaterThan(0);
  expect(WEAK_PROFILE.presencePenalty).toBeGreaterThan(0);
  expect(WEAK_PROFILE.maxTokens).toBeGreaterThanOrEqual(WEAK_PROFILE.summarizeMaxTokens);
  expect(WEAK_PROFILE.summarizeMaxTokens).toBeGreaterThanOrEqual(WEAK_PROFILE.arriveMaxTokens);
});

test("the 1.5B profile has the larger context and prompt budget its page needs", () => {
  expect(STRONG_PROFILE.id).toContain("1.5B");
  expect(STRONG_PROFILE.contextWindow).toBeGreaterThan(WEAK_PROFILE.contextWindow);
  expect(STRONG_PROFILE.promptTokenBudget).toBeGreaterThan(WEAK_PROFILE.promptTokenBudget);
  expect(STRONG_PROFILE.downloadNote).toContain("875 MB");
});

test("the larger profile requires a conservative memory or GPU signal", () => {
  expect(canRunStrong({ webgpu: true, deviceMemory: 8 })).toBe(true);
  expect(canRunStrong({ webgpu: true, maxBufferSize: 3 * 1024 ** 3 })).toBe(true);
  expect(canRunStrong({ webgpu: true, cores: 8, maxBufferSize: 512 * 1024 ** 2 })).toBe(true);
  expect(canRunStrong({ webgpu: true, deviceMemory: 4, cores: 6, maxBufferSize: 1024 ** 3 })).toBe(false);
  expect(canRunStrong({ webgpu: true, cores: 8, maxBufferSize: 256 * 1024 ** 2 })).toBe(false);
  expect(canRunStrong({ webgpu: false })).toBe(false);
});

test("only the Builder gets the larger profile, and weaker devices keep the smaller one", () => {
  expect(profileForPage("/grain/builder", { webgpu: true, deviceMemory: 8 })).toBe(STRONG_PROFILE);
  expect(profileForPage("/grain/builder/", { webgpu: true, cores: 8, maxBufferSize: 1024 ** 3 })).toBe(STRONG_PROFILE);
  expect(profileForPage("/grain/builder", { webgpu: true, deviceMemory: 4 })).toBe(WEAK_PROFILE);
  expect(profileForPage("/grain", { webgpu: true, deviceMemory: 16 })).toBe(WEAK_PROFILE);
  expect(profileForPage(undefined, { webgpu: true, deviceMemory: 16 })).toBe(WEAK_PROFILE);
});
