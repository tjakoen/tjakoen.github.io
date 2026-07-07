// portfolio/routes/vocab-reference-endpoints.test.ts — DRIFT GUARD: grain/ai/vocab-reference.ts's
// ENDPOINTS list is hand-maintained (the door's literal route strings have no shared runtime
// registry with ai-routes.ts), so this asserts every listed path is a real string literal in
// THIS app's ai-routes.ts — a renamed/removed endpoint fails this test instead of silently
// going stale in the generated /reference page.
import { test, expect } from "bun:test";
import { ENDPOINTS } from "../../grain/ai/vocab-reference.ts";

test("every ENDPOINTS path is a real route literal in ai-routes.ts", async () => {
  const src = await Bun.file(new URL("./ai-routes.ts", import.meta.url)).text();
  for (const { path } of ENDPOINTS) expect(src).toContain(`"${path}"`);
});
