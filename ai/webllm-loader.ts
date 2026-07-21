// portfolio/ai/webllm-loader.ts — the portfolio's MODEL CHOICE for grain's WebLLM transport.
//
// The engine machinery (the WebGPU probe, the CDN loader, the streaming engine + progress types) now
// lives UP in grain (`@tjakoen/grain/ai/webllm.ts` + `model-chat.ts`) — grain owns the reusable
// transport, the app owns only WHICH model runs. This file is that choice: the model id grain loads and
// the human-readable label the desk shows. desk-door.ts wires grain's `loadEngine({ modelId })` with
// MODEL_ID; desk-reasoner keeps its `DeskEngine`/`EngineProgress` type names as aliases of grain's
// types, so the rewire touched no call sites there.
//
// CLIENT-SAFE (§19.2): the grain imports below are TYPE-ONLY (erased at build), so this module compiles
// to two plain constants — no bare npm import reaches the browser. The real WebLLM `import(url)` lives
// in grain's webllm.ts (the one CDN touchpoint), not here.

import type { StreamingChatEngine } from "@tjakoen/grain/ai/model-chat.ts";
import type { EngineProgress } from "@tjakoen/grain/ai/webllm.ts";

/** The MLC model the desk loads (Qwen2.5-0.5B, 4-bit) — small enough to run in-browser on WebGPU. */
export const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
/** The label shown in the desk's load bar + narration. */
export const MODEL_LABEL = "Qwen2.5-0.5B";

// The desk's engine handle IS grain's streaming chat engine — kept under the desk's own name so the
// reasoner reads in the desk's vocabulary. Re-exported (as a type) for desk-reasoner + its tests.
export type DeskEngine = StreamingChatEngine;
export type { EngineProgress };
