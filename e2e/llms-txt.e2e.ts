// portfolio/e2e/llms-txt.e2e.ts — the AI-facing index (llmstxt.org) is a shipped route with no other
// coverage. It used to be the one surface the stack's thesis rests on that nothing would fail over if
// it were deleted. This walks its own links, so a moved route fails here before a crawler finds it.
import { test, expect } from "@playwright/test";

test("/llms.txt names the stack and the library, and every link in it resolves", async ({ request, baseURL }) => {
  const res = await request.get("/llms.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/plain");
  const body = await res.text();

  for (const must of ["BREAD", "## The stack", "/standards", "/skills", "/docs"]) {
    expect(body).toContain(must);
  }

  const origin = new URL(baseURL!).origin;
  const paths = [...body.matchAll(/\((https?:\/\/[^)\s]+)\)/g)]
    .map((m) => new URL(m[1]!))
    .filter((u) => u.origin === origin)
    .map((u) => u.pathname);
  expect(paths.length).toBeGreaterThan(5);

  for (const path of paths) {
    const hit = await request.get(path);
    expect(hit.status(), `${path} linked from /llms.txt`).toBe(200);
  }
});
