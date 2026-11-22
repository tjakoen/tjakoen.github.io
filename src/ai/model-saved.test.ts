import { describe, expect, test } from "bun:test";
import { hasSavedCopy, rememberSavedCopy, WEBLLM_MODEL_CACHE, type SavedCopyEnv } from "./model-saved.ts";

const memory = (seed: Record<string, string> = {}) => {
  const data = new Map(Object.entries(seed));
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};
const cachesWith = (names: string[]) => ({ has: async (n: string) => names.includes(n) });
const ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

describe("hasSavedCopy", () => {
  test("is true only when the marker is set and the weights are still cached", async () => {
    const env: SavedCopyEnv = { storage: memory({ ["desk-model-saved:" + ID]: "1" }), caches: cachesWith([WEBLLM_MODEL_CACHE]) };
    expect(await hasSavedCopy(ID, env)).toBe(true);
  });

  test("is false when the browser evicted the cache behind the marker", async () => {
    const env: SavedCopyEnv = { storage: memory({ ["desk-model-saved:" + ID]: "1" }), caches: cachesWith([]) };
    expect(await hasSavedCopy(ID, env)).toBe(false);
  });

  test("is false with no marker, for a different model, or with no Cache Storage", async () => {
    expect(await hasSavedCopy(ID, { storage: memory(), caches: cachesWith([WEBLLM_MODEL_CACHE]) })).toBe(false);
    expect(await hasSavedCopy("other", { storage: memory({ ["desk-model-saved:" + ID]: "1" }), caches: cachesWith([WEBLLM_MODEL_CACHE]) })).toBe(false);
    expect(await hasSavedCopy(ID, { storage: memory({ ["desk-model-saved:" + ID]: "1" }) })).toBe(false);
  });

  test("answers false instead of throwing when storage is blocked", async () => {
    const blocked = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
    expect(await hasSavedCopy(ID, { storage: blocked, caches: cachesWith([WEBLLM_MODEL_CACHE]) })).toBe(false);
  });
});

describe("rememberSavedCopy", () => {
  test("writes the marker and reports whether the browser agreed to persist", async () => {
    const storage = memory();
    expect(await rememberSavedCopy(ID, { storage, persist: async () => true })).toBe(true);
    expect(storage.getItem("desk-model-saved:" + ID)).toBe("1");
  });

  test("a refused or failing persist request is not an error", async () => {
    expect(await rememberSavedCopy(ID, { storage: memory(), persist: async () => false })).toBe(false);
    expect(await rememberSavedCopy(ID, { storage: memory(), persist: async () => { throw new Error("no"); } })).toBe(false);
  });

  test("still resolves when there is no storage and no persist", async () => {
    expect(await rememberSavedCopy(ID, {})).toBe(false);
  });
});
