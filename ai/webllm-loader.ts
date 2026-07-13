// portfolio/ai/webllm-loader.ts — the ONE CDN touchpoint. Everything WebLLM-specific is contained
// here so the reasoner (desk-reasoner.ts) stays a pure, injectable unit that unit-tests with a fake
// engine. CLIENT-SAFE (§19.2): no bare npm import (the module server refuses those) — WebLLM is
// pulled from a pinned https URL via dynamic import, so there is NO package.json entry. A local
// minimal DeskEngine shape stands in for the npm types (no @mlc-ai/web-llm devDependency).
//
// Weights (~350MB) come from the HuggingFace CDN on first use and are cached by the browser's Cache
// API (WebLLM's default) — a second visit skips the download. GitHub Pages can't send COOP/COEP, so
// this is WebGPU-only (no SharedArrayBuffer path), which is exactly the gate below.

import type { ChatMessage } from "./prompt.ts";

// Pinned so a CDN-side change can't silently alter behavior; a load failure degrades to Desk Offline.
const WEBLLM_URL = "https://esm.run/@mlc-ai/web-llm@0.2.79";
const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

/** Model-load progress, normalized from WebLLM's initProgressCallback. */
export interface EngineProgress {
  progress: number;   // 0..1
  text: string;       // WebLLM's human-readable status ("Fetching param cache…")
}

/** One streamed completion delta (the slice of WebLLM's chunk shape we consume). */
export interface DeskDelta {
  choices: Array<{ delta: { content?: string } }>;
}

export interface DeskCompletionOptions {
  messages: ChatMessage[];
  stream: true;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  // Penalties matter a LOT on a 0.5B: without them it falls into "a board, a screen, a board…"
  // repetition loops. OpenAI-compatible; MLC applies them during sampling.
  frequency_penalty?: number;
  presence_penalty?: number;
}

/** The minimal structural surface of a WebLLM engine the desk uses — kept local so we depend on the
 *  CDN module's SHAPE, not its published types. */
export interface DeskEngine {
  chat: { completions: { create(opts: DeskCompletionOptions): Promise<AsyncIterable<DeskDelta>> } };
  interruptGenerate(): void;
}

// Narrow shims for the browser globals we probe — the project's tsc has no DOM lib (bun-types only),
// so we reach them through a typed view of globalThis rather than pulling the whole DOM in.
interface GpuAdapterSource { requestAdapter(): Promise<unknown> }
interface ProbeNavigator { gpu?: GpuAdapterSource; deviceMemory?: number }
const nav = (): ProbeNavigator | undefined =>
  (globalThis as unknown as { navigator?: ProbeNavigator }).navigator;

/** Can this browser run the local model? WebGPU is required; a known-low deviceMemory (when the
 *  browser reports it — Firefox/Safari don't, so absence never blocks) rules out an almost-certain
 *  OOM up front. Any throw counts as unavailable → the desk goes offline honestly. */
export async function webgpuAvailable(): Promise<boolean> {
  const n = nav();
  if (!n || !n.gpu || typeof n.gpu.requestAdapter !== "function") return false;
  if (typeof n.deviceMemory === "number" && n.deviceMemory < 4) return false;
  try {
    return Boolean(await n.gpu.requestAdapter());
  } catch {
    return false;
  }
}

/** Load and warm the engine, reporting download progress. Dynamic-imports WebLLM from the pinned URL
 *  (the string is held in a variable so tsc treats the import as `any` rather than trying to resolve
 *  a URL specifier). Throws on any failure — the caller degrades to Desk Offline. */
export async function loadEngine(onProgress: (p: EngineProgress) => void): Promise<DeskEngine> {
  const url = WEBLLM_URL;                                   // non-literal → tsc yields Promise<any>
  const webllm = await import(url);
  const engine = await webllm.CreateMLCEngine(
    MODEL_ID,
    { initProgressCallback: (r: { progress?: number; text?: string }) => onProgress({ progress: r.progress ?? 0, text: r.text ?? "" }) },
    { context_window_size: 2048 },
  );
  return engine as DeskEngine;
}

export const MODEL_LABEL = "Qwen2.5-0.5B";
