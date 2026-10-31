import { describe, expect, test } from "bun:test";
import { createKnowledgeCache } from "./knowledge-cache.ts";
import type { Knowledge } from "./retrieval.ts";

const corpus = (builtAt: string): Knowledge => ({ builtAt, chunks: [], df: {}, n: 0 });

describe("compiled grounding cache", () => {
  test("concurrent and warm requests share one build", async () => {
    let builds = 0;
    const cache = createKnowledgeCache(async () => corpus(String(++builds)));
    const first = cache.load();
    expect(cache.load()).toBe(first);
    expect(await first).toEqual(corpus("1"));
    expect(await cache.load()).toBe(await first);
    expect(builds).toBe(1);
  });

  test("authored edits invalidate the completed value", async () => {
    let builds = 0;
    const cache = createKnowledgeCache(async () => corpus(String(++builds)));
    await cache.load();
    cache.invalidate();
    expect(await cache.load()).toEqual(corpus("2"));
  });

  test("a failed build reports its error and permits recovery", async () => {
    let builds = 0;
    const cache = createKnowledgeCache(async () => {
      if (++builds === 1) throw new Error("content read failed");
      return corpus("recovered");
    });
    await expect(cache.load()).rejects.toThrow("content read failed");
    expect(await cache.load()).toEqual(corpus("recovered"));
  });

  test("an older failure cannot discard the build started after an edit", async () => {
    let rejectOld!: (error: Error) => void;
    let builds = 0;
    const cache = createKnowledgeCache(() => ++builds === 1
      ? new Promise<Knowledge>((_resolve, reject) => { rejectOld = reject; })
      : Promise.resolve(corpus("new")));
    const old = cache.load();
    const rejection = old.catch((error: unknown) => error);
    await Promise.resolve();
    cache.invalidate();
    const current = cache.load();
    expect(await current).toEqual(corpus("new"));
    rejectOld(new Error("old read failed"));
    expect(await rejection).toEqual(new Error("old read failed"));
    expect(cache.load()).toBe(current);
    expect(builds).toBe(2);
  });
});
