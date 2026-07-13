// tjakoen.github.io/e2e/desk-actions.e2e.ts — THE DESK DRIVES THE UI (the GRAIN showcase). Headless
// Chromium has no WebGPU, so the desk model is offline — but the DETERMINISTIC actions (navigate /
// open a note / capabilities) run BEFORE the model and work anyway, driving the page through grain's
// one door. We raise them the same way any island does: window.grain.door.submit (the public seam),
// exactly like a human's chip tap. Every navigation is served as the frozen site would be (client
// transport + the desk door), so the cross-page "arrival" choreography runs on the destination too.
import { test, expect, type Page } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";

// Serve EVERY document as the export does (client transport + desk door), so the door + its arrival
// replay run on each page we land on — not just the first.
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

// Raise a chat intent through the ONE door (the same path a chip tap or a typed Send takes).
const ask = (page: Page, text: string) =>
  page.evaluate((t) => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
    .grain.door.submit("chat.send", "chat-log", { text: t }), text);

async function deskReady(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");   // the client door came up
}

test.describe("THE DESK drives the page (deterministic actions, no WebGPU needed)", () => {
  test("navigate: 'take me to GRAIN' → the desk navigates to /grain and announces on arrival", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "take me to GRAIN");

    await page.waitForURL("**/grain");                                   // it drove the navigation
    await expect(page.locator(".assistant__log")).toContainText("Here's GRAIN");   // arrival choreography resumed
  });

  test("open a note: 'show me the latest note' → navigates into a /notes/ entry", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "show me the latest note");

    await page.waitForURL(/\/notes\/[a-z0-9-]+$/);                       // opened an actual note
  });

  test("capabilities: 'what can I do here?' lists the actions in the chat", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/grain");
    await deskReady(page);

    await ask(page, "what can I do here?");

    await expect(page.locator(".assistant__log")).toContainText("open the latest note");
    await expect(page.locator(".assistant__log")).toContainText("summarize this page");
  });

  test("the user's message is committed even though the model is offline (composer released)", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/grain");
    await deskReady(page);

    await ask(page, "what can I do here?");

    // the "you" bubble lands committed (clean) — the release path that stands the watchdog down
    await expect(page.locator('.assistant__log .chat-message[data-role="you"]')).toContainText("what can I do here?");
  });
});
