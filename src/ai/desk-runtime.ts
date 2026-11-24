// portfolio/src/ai/desk-runtime.ts — the shared state and helpers a turn stage is handed.
//
// The desk's reasoner was one closure holding six pieces of state and every stage. This is the seam
// the decomposition hangs on: the factory owns one DeskRuntime, the stage modules take it, and no
// stage imports the factory at runtime (the DeskDeps/Turn imports are type-only and erased).
import type { RenderOp } from "@tjakoen/grain/ai/contract.ts";
import type { DeskDeps } from "./desk-reasoner.ts";
import type { DeskEngine, EngineProgress, ModelProfile } from "./webllm-loader.ts";
import type { ChatMessage } from "./prompt.ts";

/** The memoised engine load and the sticky offline flag. One object, shared by every stage. */
export interface EngineState {
  promise: Promise<DeskEngine | null> | null;
  degraded: boolean;
}

export interface DeskRuntime {
  deps: DeskDeps;
  profile: ModelProfile;
  /** The last turns, in order. Shared by reference; stages push to it, never replace it. */
  history: ChatMessage[];
  engineState: EngineState;
  /** The last place the desk navigated to or cited, so a bare "go there" can reuse it. */
  lastTarget: { route: string; label: string } | null;
  ensureEngine(onProgress: (p: EngineProgress) => void): Promise<DeskEngine | null>;
  downloadAllowed(say: (html: string, commit: "committed") => void): Promise<boolean>;
  runAgentTurns(engine: DeskEngine, emit: (op: RenderOp) => void): Promise<void>;
}
