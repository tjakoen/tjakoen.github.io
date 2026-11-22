// portfolio/ai/model-saved.ts: does this browser already hold a saved copy of the desk's model?
//
// WebLLM keeps the downloaded weights in the browser's Cache Storage, which is what turns a 350 MB
// first visit into a few seconds on every visit after. The desk used to remember that only for the
// current tab (sessionStorage), so a returning visitor was warned about a download that would never
// happen. This module remembers it across visits and double-checks it against Cache Storage, because
// a browser may evict the cache without telling the page.
//
// Everything the module touches arrives through SavedCopyEnv, so the unit tests need no browser.
// A wrong answer is always the cautious one: when anything throws or looks off, the visitor is told
// to expect the download, never promised a fast load that does not come.

export interface SavedCopyEnv {
  storage?: Pick<Storage, "getItem" | "setItem">;
  caches?: Pick<CacheStorage, "has">;
  /** navigator.storage.persist: asks the browser not to evict this origin's data under disk pressure. */
  persist?: () => Promise<boolean>;
}

/** The Cache Storage bucket WebLLM puts model weights in. If a WebLLM upgrade renames it, the check
 *  below answers false and the desk falls back to the honest download copy. */
export const WEBLLM_MODEL_CACHE = "webllm/model";

const markerKey = (modelId: string): string => "desk-model-saved:" + modelId;

/** True only when a past load finished AND the weights are still in Cache Storage. */
export async function hasSavedCopy(modelId: string, env: SavedCopyEnv): Promise<boolean> {
  try {
    if (env.storage?.getItem(markerKey(modelId)) !== "1") return false;
    if (!env.caches) return false;
    return await env.caches.has(WEBLLM_MODEL_CACHE);
  } catch {
    return false;
  }
}

/** Record a finished load and ask the browser to keep the weights. Returns whether the browser agreed
 *  to persist them; a refusal changes nothing else, since the cache still works for now. */
export async function rememberSavedCopy(modelId: string, env: SavedCopyEnv): Promise<boolean> {
  try { env.storage?.setItem(markerKey(modelId), "1"); } catch { /* storage may be blocked */ }
  try { return (await env.persist?.()) === true; } catch { return false; }
}

/** The environment the page really has, each part optional because private windows and older
 *  browsers lack some of them. */
export function browserSavedCopyEnv(): SavedCopyEnv {
  const env: SavedCopyEnv = {};
  try { if (typeof localStorage !== "undefined") env.storage = localStorage; } catch { /* blocked */ }
  try { if (typeof caches !== "undefined") env.caches = caches; } catch { /* blocked */ }
  try {
    const manager = typeof navigator !== "undefined" ? navigator.storage : undefined;
    if (manager && typeof manager.persist === "function") env.persist = () => manager.persist();
  } catch { /* blocked */ }
  return env;
}
