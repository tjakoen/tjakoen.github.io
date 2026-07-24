// tjakoen.github.io/e2e/desk-notes-filter.e2e.ts — B2 NOTES FILTERING. Same headless-Chromium-has-no-
// WebGPU setup as desk-theme.e2e.ts for the two DETERMINISTIC scenarios (actions.ts's notes-filter
// routing, desk-reasoner.ts's deterministic handler, and desk-door.ts's real clicks on content.ts's
// [data-feed-controls] tag chips + read of the live checkbox state) — zero model, no download, no
// generation. The third scenario (a topic that matches no real tag) needs the MODEL tail for its
// honest fallback answer, so it borrows desk-model-chain.e2e.ts's scripted-engine stubbing instead.
import { test, expect, type Page } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";

async function clientDeskEverywhere(page: Page) {
  await page.route("**/*", async (route, req) => {
    if (req.resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    if (!(res.headers()["content-type"] || "").includes("text/html")) return route.fulfill({ response: res });
    const html = (await res.text()).replace(/<body\b/, `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`);
    return route.fulfill({ response: res, body: html });
  });
  await page.addInitScript(() => {   // force the no-WebGPU (offline model) path deterministically
    try { Object.defineProperty(navigator, "gpu", { value: undefined, configurable: true }); } catch { /* absent */ }
  });
}

const ask = (page: Page, text: string) =>
  page.evaluate((t) => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
    .grain.door.submit("chat.send", "chat-log", { text: t }), text);

async function deskReady(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");   // the client door came up
}

test.describe("B2 notes filtering (deterministic, no model needed)", () => {
  test("on /notes: checks the teaching chip, hides non-teaching cards, mirrors ?tag= into the URL", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/notes");
    await deskReady(page);
    const totalCards = await page.locator(".note-card").count();

    await ask(page, "show me notes about teaching");

    const teachingChip = page.locator('[data-feed-controls] input[type="checkbox"][value="teaching"]');
    await expect(teachingChip).toBeChecked({ timeout: 10_000 });
    await expect(page).toHaveURL(/[?&]tag=teaching\b/);
    // at least one card stays visible (the real teaching-tagged notes) and at least one hides —
    // proves the island's own applyFilters actually ran, not just the checkbox flipping in isolation.
    await expect(page.locator(".note-card:not([hidden])").first()).toBeVisible();
    expect(await page.locator(".note-card[hidden]").count()).toBeGreaterThan(0);
    expect(await page.locator(".note-card[hidden]").count()).toBeLessThan(totalCards);
  });

  test("from '/': navigates to /notes?tag=teaching, lands with the filter already applied + an announce", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "show me notes about teaching");

    await page.waitForURL(/\/notes\?tag=teaching\b/);
    const teachingChip = page.locator('[data-feed-controls] input[type="checkbox"][value="teaching"]');
    await expect(teachingChip).toBeChecked({ timeout: 10_000 });   // the destination island's own applyQueryTags
    await expect(page.locator(".assistant__log")).toContainText("teaching");   // the arrival announce named it
  });
});

// ---- the model tail: mirrors desk-model-chain.e2e.ts's stubbing (same two grain transport modules,
// same fake-engine shape) — a topic notes-tags.ts can't match against any real tag is deliberately NOT
// claimed deterministically (desk-reasoner.ts's own miss idiom), so it needs a real answer here. ----
const WEBLLM_STUB = `
export async function probeDevice() { return { webgpu: true, deviceMemory: 8, cores: 8, maxBufferSize: 4 * 1024 ** 3 }; }
export function canRunModel() { return true; }
export async function webgpuAvailable() { return true; }
export async function loadEngine({ onProgress }) { onProgress?.({ progress: 1, text: "fake engine ready" }); return { fake: true }; }
`;
const MODEL_CHAT_STUB = `
export async function* streamChat(engine, messages, opts) {
  const reply = "Scripted grounded answer from the fake model.";
  for (const part of reply.match(/\\S+\\s*/g) ?? [reply]) yield part;
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
      Object.defineProperty(navigator, "gpu", { value: { requestAdapter: async () => ({}) }, configurable: true });
    } catch { /* already present */ }
  });
}

async function fakeModelDeskReady(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");
  await expect(page.locator("body")).not.toHaveAttribute("data-desk", "offline");   // the stub probe passed
}

test.describe("B2 notes filtering — a no-match topic falls to the model path", () => {
  test("'show me notes about quantum physics' matches no real tag: a real grounded answer, no navigation", async ({ page }) => {
    await fakeModelDesk(page);
    await page.goto("/");
    await fakeModelDeskReady(page);

    await ask(page, "show me notes about quantum physics");

    await expect(page.locator(".assistant__log")).toContainText("Scripted grounded answer");
    expect(new URL(page.url()).pathname).toBe("/");   // never navigated — the miss falls to plain chat
  });
});
