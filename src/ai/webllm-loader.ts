// portfolio/ai/webllm-loader.ts — the portfolio's MODEL CHOICE for grain's WebLLM transport.
//
// The engine machinery (the WebGPU probe, the CDN loader, the streaming engine + progress types) lives
// UP in grain (`@tjakoen/grain/ai/webllm.ts` + `model-chat.ts`) — grain owns the reusable transport, the
// app owns which model runs and how it is tuned. This file holds both local profiles and selects the
// 1.5B only for the Builder on devices that pass a conservative capability check. The shared desk and
// other devices keep the 0.5B. The reasoner reads every size-dependent knob from the selected profile.
//
// CLIENT-SAFE (§19.2): the grain imports below are TYPE-ONLY (erased at build), so this module compiles
// to plain data — no bare npm import reaches the browser. The real WebLLM `import(url)` lives in grain's
// webllm.ts (the one CDN touchpoint), not here.

import type { StreamingChatEngine } from "@tjakoen/grain/ai/model-chat.ts";
import type { DeviceCapability, EngineProgress } from "@tjakoen/grain/ai/webllm.ts";

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

/** The smaller profile for the shared desk and devices that do not pass the Builder's larger-model gate. */
export const WEAK_PROFILE: ModelProfile = {
  id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
  label: "Qwen2.5-0.5B",
  downloadNote: "About 350 MB the first time, then cached.",
  contextWindow: 2048,
  promptTokenBudget: 1400,
  maxTokens: 220,
  summarizeMaxTokens: 160,
  arriveMaxTokens: 150,
  // 0.3 (down from 0.5, 2026-07-24): the desk audit showed run-to-run variance at 0.5 — the same
  // grounded question would enumerate the stack one run and drop the enumeration the next. Grounded
  // Q&A wants the model hugging the CONTEXT, not exploring; the penalties below stay as the anti-loop
  // guardrails (do NOT loosen them to compensate).
  temperature: 0.3,
  topP: 0.9,
  frequencyPenalty: 0.6,
  presencePenalty: 0.4,
};

/** The Builder's larger local profile. It costs more to download, so only the Builder route selects it
 *  and only when the browser reports conservative memory or GPU signals. */
export const STRONG_PROFILE: ModelProfile = {
  id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  label: "Qwen2.5-1.5B",
  downloadNote: "About 875 MB the first time, then cached.",
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

const STRONG_MEMORY_GB = 8;
const STRONG_GPU_BYTES = 3 * 1024 ** 3;
const CAPABLE_CORES = 8;
const MIN_GPU_BYTES = 512 * 1024 ** 2;

/** Require a clear capability signal before the Builder can load the 1.5B profile. The browser's
 *  report is only a conservative proxy; the live model still has to load successfully on first use. */
export function canRunStrong(cap: DeviceCapability): boolean {
  if (!cap.webgpu) return false;
  const mem = cap.deviceMemory ?? 0;
  const gpu = cap.maxBufferSize ?? 0;
  const cores = cap.cores ?? 0;
  return mem >= STRONG_MEMORY_GB || gpu >= STRONG_GPU_BYTES || (cores >= CAPABLE_CORES && gpu >= MIN_GPU_BYTES);
}

/** Keep the shared site desk on its smaller profile. The Builder gets the larger profile only on a
 *  device that passes the conservative memory/GPU gate. Paths can arrive with or without a slash. */
export function profileForPage(pathname: string | undefined, cap: DeviceCapability): ModelProfile {
  if (pathname?.replace(/\/+$/, "") === "/grain/builder" && canRunStrong(cap)) return STRONG_PROFILE;
  return WEAK_PROFILE;
}

// The desk's engine handle IS grain's streaming chat engine — kept under the desk's own name so the
// reasoner reads in the desk's vocabulary. Re-exported (as a type) for desk-reasoner + its tests.
export type DeskEngine = StreamingChatEngine;
export type { EngineProgress };
