// portfolio/ai/webllm-loader.test.ts — UNIT: the single model profile. The demo runs one model (the
// weak 0.5B); the device-tiering + pickProfile were removed 2026-07, so all that's left to pin is that
// WEAK_PROFILE carries a coherent set of knobs (the budget fits inside the window, penalties are set).
import { test, expect } from "bun:test";
import { WEAK_PROFILE } from "./webllm-loader.ts";

test("WEAK_PROFILE is the 0.5B and carries a coherent window/budget pairing", () => {
  expect(WEAK_PROFILE.id).toContain("0.5B");
  // the prompt budget must fit inside the context window (with room reserved for generation)
  expect(WEAK_PROFILE.promptTokenBudget).toBeLessThan(WEAK_PROFILE.contextWindow);
  // a 0.5B needs heavy repetition penalties to not loop — they're its guardrails, so keep them present
  expect(WEAK_PROFILE.frequencyPenalty).toBeGreaterThan(0);
  expect(WEAK_PROFILE.presencePenalty).toBeGreaterThan(0);
  // generation caps are ordered: a chat reply gets the most room, the arrival greeting the least
  expect(WEAK_PROFILE.maxTokens).toBeGreaterThanOrEqual(WEAK_PROFILE.summarizeMaxTokens);
  expect(WEAK_PROFILE.summarizeMaxTokens).toBeGreaterThanOrEqual(WEAK_PROFILE.arriveMaxTokens);
});
