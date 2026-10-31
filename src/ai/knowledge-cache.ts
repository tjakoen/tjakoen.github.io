// The server's compiled grounding corpus is shared by concurrent requests. A failed load is
// retryable; development content watchers invalidate a successful value after an authored edit.
import type { Knowledge } from "./retrieval.ts";

export function createKnowledgeCache(build: () => Promise<Knowledge>): {
  load(): Promise<Knowledge>;
  invalidate(): void;
} {
  let pending: Promise<Knowledge> | null = null;
  return {
    load() {
      if (!pending) {
        const current = Promise.resolve().then(build).catch((error: unknown) => {
          // An older request may fail after an edit already started a replacement build.
          if (pending === current) pending = null;
          throw error;
        });
        pending = current;
      }
      return pending;
    },
    invalidate() { pending = null; },
  };
}
