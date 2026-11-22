// e2e/desk-download-consent.e2e.ts: the desk asks before it downloads the 350 MB model.
//
// A first model question used to start the download on its own. These tests run the real door and
// reasoner against a scripted engine and count how many times the loader is called, because the
// promise is about what does not happen: nothing downloads until the visitor says yes.
import { test, expect, type Page } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";
const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

// A capable device and an instant engine. Every call to loadEngine is counted in sessionStorage, which
// survives the desk's own navigations.
const WEBLLM_STUB = `
export async function probeDevice() { return { webgpu: true, deviceMemory: 8, cores: 8, maxBufferSize: 4 * 1024 ** 3 }; }
export function canRunModel() { return true; }
export async function webgpuAvailable() { return true; }
export async function loadEngine({ onProgress }) {
  sessionStorage.setItem("__loadCalls", String(Number(sessionStorage.getItem("__loadCalls") ?? "0") + 1));
  onProgress?.({ progress: 1, text: "fake engine ready" });
  return { fake: true };
}
`;
const MODEL_CHAT_STUB = `
export async function* streamChat() { yield "Scripted answer from the fake model."; }
`;

async function fakeModelDesk(page: Page, opts: { savedCopy?: boolean } = {}) {
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
  await page.addInitScript((saved) => {
    try {
      Object.defineProperty(navigator, "gpu", { value: { requestAdapter: async () => ({}) }, configurable: true });
    } catch { /* already present */ }
    if (saved) {
      try { localStorage.setItem("desk-model-saved:Qwen2.5-0.5B-Instruct-q4f16_1-MLC", "1"); } catch { /* blocked */ }
      void caches.open("webllm/model");
    }
  }, Boolean(opts.savedCopy));
}

const ask = (page: Page, text: string) =>
  page.evaluate((t) => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
    .grain.door.submit("chat.send", "chat-log", { text: t }), text);

async function deskReady(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");
}

const loadCalls = (page: Page): Promise<number> =>
  page.evaluate(() => Number(sessionStorage.getItem("__loadCalls") ?? "0"));

const QUESTION = "Can you help me understand this site?";
const choice = (page: Page) => page.locator('[data-surface="chat-log"] [data-download-choice]');

test.describe("the desk asks before downloading the model", () => {
  test("a first question shows the size and two buttons, and downloads nothing yet", async ({ page }) => {
    await fakeModelDesk(page);
    await page.goto("/");
    await deskReady(page);
    await ask(page, QUESTION);
    await expect(choice(page)).toBeVisible();
    await expect(choice(page).getByRole("button", { name: "Download 350 MB" })).toBeVisible();
    await expect(choice(page).getByRole("button", { name: "Not now" })).toBeVisible();
    await expect(page.locator('[data-surface="chat-log"]')).toContainText("download about 350 MB");
    expect(await loadCalls(page)).toBe(0);
  });

  test("Not now downloads nothing, says so, and keeps the desk online", async ({ page }) => {
    await fakeModelDesk(page);
    await page.goto("/");
    await deskReady(page);
    await ask(page, QUESTION);
    await choice(page).getByRole("button", { name: "Not now" }).click();
    await expect(page.locator('[data-surface="chat-log"]')).toContainText("won't download anything");
    await expect(choice(page)).toHaveCount(0);
    await expect(page.locator("body")).not.toHaveAttribute("data-desk", "offline");
    expect(await loadCalls(page)).toBe(0);
  });

  test("Download loads the model once, answers, and does not ask again", async ({ page }) => {
    await fakeModelDesk(page);
    await page.goto("/");
    await deskReady(page);
    await ask(page, QUESTION);
    await choice(page).getByRole("button", { name: "Download 350 MB" }).click();
    await expect(page.locator('[data-surface="chat-log"]')).toContainText("Scripted answer from the fake model.");
    expect(await loadCalls(page)).toBe(1);
    expect(await page.evaluate((id) => sessionStorage.getItem("desk-download-ok:" + id), MODEL_ID)).toBe("yes");
    await ask(page, "And what else can you tell me about it?");
    await expect(choice(page)).toHaveCount(0);
    expect(await loadCalls(page)).toBe(1);
  });

  test("a visitor with a saved copy is never asked, because nothing downloads", async ({ page }) => {
    await fakeModelDesk(page, { savedCopy: true });
    await page.goto("/");
    await deskReady(page);
    await expect(page.locator("[data-model-notice]")).toContainText("Your copy is saved here");
    await ask(page, QUESTION);
    await expect(page.locator('[data-surface="chat-log"]')).toContainText("Scripted answer from the fake model.");
    await expect(choice(page)).toHaveCount(0);
  });
});
