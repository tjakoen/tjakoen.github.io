// tjakoen.github.io/e2e/desk-citation.e2e.ts — A3 (citation chip): a grounded model answer carries a
// deterministic "Read more" link built by CODE from the TOP retrieval chunk — the model's own output
// is a scripted stub here, so the link appearing with the right route proves it never came from the
// model. Same fake-engine stub as desk-model-chain.e2e.ts (the desk must count as ONLINE and the
// grounded path must reach the model tail); retrieval itself runs over the REAL /knowledge.json.
//
// The ask below was verified against the real corpus (buildPortfolioKnowledge + retrieve): the top
// chunk for "What did TJ build with grain?" is /grain/docs/ai-interface — a real page, not facts —
// so the citation must render and point there (with its A1 heading anchor when the chunk has one).
import { test, expect, type Page } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";
const CITE_ROUTE = "/grain/docs/ai-interface";

const WEBLLM_STUB = `
export async function probeDevice() { return { webgpu: true, deviceMemory: 8, cores: 8, maxBufferSize: 4 * 1024 ** 3 }; }
export function canRunModel() { return true; }
export async function webgpuAvailable() { return true; }
export async function loadEngine({ onProgress }) { onProgress?.({ progress: 1, text: "fake engine ready" }); return { fake: true }; }
`;
const MODEL_CHAT_STUB = `
export async function* streamChat(engine, messages, opts) {
  yield "TJ built this site's showcase pages with grain.";
}
`;

async function fakeModelDesk(page: Page) {
  await page.route("**/*", async (route, req) => {
    const url = new URL(req.url());
    if (url.pathname === "/modules/grain/ai/webllm.js")
      return route.fulfill({ contentType: "text/javascript", body: WEBLLM_STUB });
    if (url.pathname === "/modules/grain/ai/model-chat.js")
      return route.fulfill({ contentType: "text/javascript", body: MODEL_CHAT_STUB });
    if (req.resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    if (!(res.headers()["content-type"] || "").includes("text/html")) return route.fulfill({ response: res });
    const html = (await res.text()).replace(/<body\b/, `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`);
    return route.fulfill({ response: res, body: html });
  });
  await page.addInitScript(() => {
    try {
      Object.defineProperty(navigator, "gpu", {
        value: { requestAdapter: async () => ({}) }, configurable: true,
      });
    } catch { /* already present */ }
  });
}

const ask = (page: Page, text: string) =>
  page.evaluate((t) => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
    .grain.door.submit("chat.send", "chat-log", { text: t }), text);

test("a grounded answer carries a deterministic Read more link to the top retrieval chunk", async ({ page }) => {
  await fakeModelDesk(page);
  await page.goto("/");
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).not.toHaveAttribute("data-desk", "offline");

  await ask(page, "What did TJ build with grain?");

  // the scripted model reply streams, settles, then the code-built citation replaces the body —
  // the link's route can only have come from retrieval (the stub never mentions it).
  const cite = page.locator(".desk-cite a");
  await expect(cite).toHaveCount(1, { timeout: 10000 });
  expect((await cite.getAttribute("href"))?.startsWith(CITE_ROUTE)).toBe(true);
  await expect(page.locator(".desk-cite")).toContainText("Read more");
});
