// portfolio/ai/webllm-loader.ts — the portfolio's MODEL CHOICE for grain's WebLLM transport.
//
// The engine machinery (the WebGPU probe, the CDN loader, the streaming engine + progress types) lives
// UP in grain (`@tjakoen/grain/ai/webllm.ts` + `model-chat.ts`) — grain owns the reusable transport, the
// app owns only WHICH model runs AND how it's tuned. This file is that choice: a single PROFILE — the
// weak Qwen2.5-0.5B that runs anywhere grain's WebGPU gate clears. desk-door injects it into the desk,
// which reads EVERY size-dependent knob (context window, prompt budget, generation caps, repetition
// penalties, the load-bar copy) from it. The demo is locked to this one model — the stronger 1.5B tier
// was removed 2026-07 (no visible gain on the portfolio's short, grounded Q&A for a ~1.1GB download).
//
// CLIENT-SAFE (§19.2): the grain imports below are TYPE-ONLY (erased at build), so this module compiles
// to plain data — no bare npm import reaches the browser. The real WebLLM `import(url)` lives in grain's
// webllm.ts (the one CDN touchpoint), not here.

import type { StreamingChatEngine } from "@tjakoen/grain/ai/model-chat.ts";
import type { EngineProgress } from "@tjakoen/grain/ai/webllm.ts";

/** A model choice plus ALL the tuning that depends on its size. The desk reads generation knobs, the
 *  prompt budget, and the load-bar copy from the profile it's handed — so swapping the profile is the
 *  only change needed to run a different-sized model well. */
export interface ModelProfile {
  /** The MLC model id grain's loadEngine pulls from the CDN. */
  id: string;
  /** Human-readable label for the load bar + narration. */
  label: string;
  /** The one-time download-size line shown in the load bar (honest about first-visit cost). */
  downloadNote: string;
  /** The engine's context window (context_window_size) — a bigger model earns a bigger window. */
  contextWindow: number;
  /** The approx-token budget prompt.ts holds the assembled prompt under (sized to the window). */
  promptTokenBudget: number;
  /** Default max generation tokens for a chat reply. */
  maxTokens: number;
  /** Max tokens for "summarize this page" (kept shorter than a chat reply). */
  summarizeMaxTokens: number;
  /** Max tokens for the on-arrival greeting (shortest of all — one line + chips). */
  arriveMaxTokens: number;
  temperature: number;
  topP: number;
  /** Repetition penalties. A 0.5B loops badly without heavy penalties — these are its guardrails. */
  frequencyPenalty: number;
  presencePenalty: number;
}

/** The one model the desk runs: Qwen2.5-0.5B (4-bit), on any device that clears grain's WebGPU gate.
 *  Its knobs are the values the desk was tuned to over 2026-07 — heavy penalties, a tight window, short
 *  caps — because a 0.5B spins into repetition without them. Do NOT loosen these; they're its guardrails. */
export const WEAK_PROFILE: ModelProfile = {
  id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
  label: "Qwen2.5-0.5B",
  downloadNote: "About 350MB the first time, then cached.",
  contextWindow: 2048,
  promptTokenBudget: 1400,
  maxTokens: 220,
  summarizeMaxTokens: 160,
  arriveMaxTokens: 150,
  temperature: 0.5,
  topP: 0.9,
  frequencyPenalty: 0.6,
  presencePenalty: 0.4,
};

// The desk's engine handle IS grain's streaming chat engine — kept under the desk's own name so the
// reasoner reads in the desk's vocabulary. Re-exported (as a type) for desk-reasoner + its tests.
export type DeskEngine = StreamingChatEngine;
export type { EngineProgress };
