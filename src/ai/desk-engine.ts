// portfolio/src/ai/desk-engine.ts — loading the desk's local model, once per page.
//
// Split out of desk-reasoner.ts with the rest of the reasoner's stages. The state it owns is the one
// piece of the desk that must survive every turn: the memoised load and the sticky offline flag. A
// failed load degrades the desk to offline for the session; it does not retry another profile.
import type { DeskDeps } from "./desk-reasoner.ts";
import type { DeskEngine, EngineProgress, ModelProfile } from "./webllm-loader.ts";
import type { EngineState } from "./desk-runtime.ts";
import { esc } from "./desk-text.ts";

/** May this turn start the model download? A saved copy or an already-loaded engine needs no question. */
export async function downloadAllowed(
  deps: DeskDeps,
  profile: ModelProfile,
  state: EngineState,
  say: (html: string, commit: "committed") => void,
): Promise<boolean> {
  if (state.promise || deps.isWarm?.() === true || !deps.askDownload) return true;
  say(esc(`To answer on your device I need to download about ${profile.downloadMB} MB, one time. ` +
    `The model runs here, so your questions stay on this device.`), "committed");
  return deps.askDownload(profile);
}

/** Load the engine once (probe-gated). Returns null on unavailable or failed and flips the desk offline. */
export async function ensureEngine(
  deps: DeskDeps,
  profile: ModelProfile,
  state: EngineState,
  onProgress: (p: EngineProgress) => void,
): Promise<DeskEngine | null> {
  if (state.degraded) return null;
  if (!state.promise) {
    state.promise = (async () => {
      if (!(await deps.probe())) return null;
      return await deps.loadEngine(profile, onProgress);
    })();
  }
  try {
    const engine = await state.promise;
    if (!engine) { state.degraded = true; deps.markOffline(); }
    return engine;
  } catch (err) {
    console.error("[desk] model load failed", err);
    state.degraded = true;
    deps.markOffline();
    return null;
  }
}
