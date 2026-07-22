// portfolio/ai/webllm-loader.ts — the portfolio's MODEL CHOICE for grain's WebLLM transport.
//
// The engine machinery (the WebGPU probe, the CDN loader, the streaming engine + progress types) lives
// UP in grain (`@tjakoen/grain/ai/webllm.ts` + `model-chat.ts`) — grain owns the reusable transport, the
// app owns only WHICH model runs AND how it's tuned. This file is that choice, expressed as PROFILES: a
// weak model that runs anywhere WebGPU does, and a stronger one for capable devices. `pickProfile` maps
// grain's device probe (`DeviceCapability`) to a profile; desk-door probes once, picks, and injects the
// chosen profile into the desk, which reads EVERY size-dependent knob (context window, prompt budget,
// generation caps, repetition penalties, the load-bar copy) from it. Nothing about the model size is
// hardcoded downstream — that's what lets the weak path stay tuned while the strong path relaxes.
//
// CLIENT-SAFE (§19.2): the grain imports below are TYPE-ONLY (erased at build), so this module compiles
// to plain data — no bare npm import reaches the browser. The real WebLLM `import(url)` lives in grain's
// webllm.ts (the one CDN touchpoint), not here.

import type { StreamingChatEngine } from "@tjakoen/grain/ai/model-chat.ts";
import type { EngineProgress, DeviceCapability } from "@tjakoen/grain/ai/webllm.ts";

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
  /** Repetition penalties. A 0.5B loops badly without heavy penalties; a bigger model needs far less,
   *  so the strong profile relaxes them (heavy penalties on a capable model flatten its prose). */
  frequencyPenalty: number;
  presencePenalty: number;
}

/** The default tier: Qwen2.5-0.5B (4-bit). Runs on any device that clears grain's WebGPU gate. Its
 *  knobs are the values the desk was tuned to over 2026-07 — heavy penalties, a tight window, short
 *  caps — because a 0.5B spins into repetition without them. Do NOT loosen these; they're the weak
 *  path's guardrails. */
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

/** The strong tier: Qwen2.5-1.5B (4-bit) — same family as the weak model, so the persona + freeform
 *  NAVIGATE:/CHOICES: protocol carry over unchanged; only the knobs relax. ~1.1GB and wants a capable
 *  device, so `pickProfile` only reaches for it on ≥8GB machines. Bigger window + budget (it can hold
 *  more grounding), longer caps, and much lighter penalties (it doesn't loop, so heavy penalties would
 *  only flatten it). */
export const STRONG_PROFILE: ModelProfile = {
  id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  label: "Qwen2.5-1.5B",
  downloadNote: "About 1.1GB the first time, then cached.",
  contextWindow: 4096,
  promptTokenBudget: 3000,
  maxTokens: 320,
  summarizeMaxTokens: 220,
  arriveMaxTokens: 180,
  temperature: 0.6,
  topP: 0.9,
  frequencyPenalty: 0.3,
  presencePenalty: 0.2,
};

/** Map grain's device probe to a profile. Auto-by-device: the strong model only on a clearly capable
 *  machine — `navigator.deviceMemory` ≥ 8 (Chrome reports it, coarse + capped at 8). When the browser
 *  DOESN'T report memory (Firefox/Safari), or reports less, stay on the weak model — the conservative
 *  choice, since a wrong guess up means an OOM the visitor sees. grain's `canRunModel` gate still
 *  decides whether ANY model loads; this only picks WHICH once it can.
 *
 *  `override` forces a tier regardless of the device — the `?tier=weak|strong` dev knob desk-door reads
 *  from the URL, so both tiers can be exercised on one machine. Harmless in prod (a visitor would have to
 *  set it deliberately, and the `canRunModel` gate still applies), so it stays in. */
export function pickProfile(cap: DeviceCapability, override?: "weak" | "strong"): ModelProfile {
  if (override === "weak") return WEAK_PROFILE;
  if (override === "strong") return STRONG_PROFILE;
  return typeof cap.deviceMemory === "number" && cap.deviceMemory >= 8 ? STRONG_PROFILE : WEAK_PROFILE;
}

// The desk's engine handle IS grain's streaming chat engine — kept under the desk's own name so the
// reasoner reads in the desk's vocabulary. Re-exported (as a type) for desk-reasoner + its tests.
export type DeskEngine = StreamingChatEngine;
export type { EngineProgress };
