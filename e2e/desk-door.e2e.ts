// tjakoen.github.io/e2e/desk-door.e2e.ts — THE DESK, CLIENT-TRANSPORT (the exported site's path).
// The frozen site runs the desk as a LOCAL browser model behind grain's client door. Headless
// Chromium has no WebGPU, so this suite exercises the OFFLINE path — which, per the 2026-07-13
// requirement, is NOT a stub fallback: the desk marks itself offline and HIDES the chat (composer +
// suggestion chips) behind a "Desk Offline" note, while the door + stub demos stay online.
//
// We reproduce the export's stamp (data-ai-transport="client" + the desk door) by rewriting the page
// response — the dev server itself uses the server door — and delete navigator.gpu so the probe is
// deterministically negative regardless of the CI machine's GPU.
import { test, expect } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";

// Serve the page as the FROZEN site would: client transport + the portfolio's own desk door.
async function asClientDesk(page: import("@playwright/test").Page, path: string) {
  await page.route(path, async (route) => {
    const res = await route.fetch();
    const html = (await res.text()).replace(
      /<body\b/,
      `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`,
    );
    await route.fulfill({ response: res, body: html });
  });
}

test.describe("THE DESK — client transport, no WebGPU → Desk Offline (chat hidden, no stub)", () => {
  test.beforeEach(async ({ page }) => {
    // guarantee the WebGPU probe fails, so the offline path is deterministic (not GPU-dependent)
    await page.addInitScript(() => {
      try { Object.defineProperty(navigator, "gpu", { value: undefined, configurable: true }); } catch { /* already absent */ }
    });
  });

  test("the desk goes offline: whole chat surface hidden, only the centered Desk Offline note shown", async ({ page }) => {
    await asClientDesk(page, "**/grain");
    await page.goto("/grain");

    // the portfolio's CHAT-SPECIFIC marker flips (set by the desk door once the probe comes back false)
    await expect(page.locator("body")).toHaveAttribute("data-desk", "offline");

    // the whole chat surface is hidden — the ways to TALK to the desk AND the greeting/log itself,
    // so nothing chat-shaped lingers when there's nothing to talk to…
    await expect(page.locator(".assistant__composer")).toBeHidden();
    await expect(page.locator(".assistant__suggest")).toBeHidden();
    await expect(page.locator(".assistant__log")).toBeHidden();
    // …replaced by the honest note, centered in the pane
    await expect(page.locator(".assistant__offline")).toBeVisible();
    await expect(page.locator(".assistant__offline")).toContainText("offline");
  });

  test("global presence stays ONLINE — the door loaded, so stub demos are unaffected", async ({ page }) => {
    await asClientDesk(page, "**/grain");
    await page.goto("/grain");
    // the desk model is offline, but the DOOR came up (client loopback) → presence is honestly online,
    // proving the chat-offline marker is separate from transport presence (demos keep working).
    await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");
    await expect(page.locator("body")).toHaveAttribute("data-desk", "offline");
  });

  test("the grounding corpus is served and non-empty", async ({ page }) => {
    const res = await page.request.get("/knowledge.json");
    expect(res.status()).toBe(200);
    const corpus = await res.json();
    expect(Array.isArray(corpus.chunks)).toBe(true);
    expect(corpus.chunks.length).toBeGreaterThan(0);
    expect(corpus.chunks.some((c: { route: string }) => c.route === "facts")).toBe(true);
  });

  // 2026-07-13 requirement, made explicit end-to-end: even if a chat.send intent reaches the door
  // anyway (the composer is hidden, but the door itself stays live — the desk's own guard is what
  // has to hold, not just the CSS), the desk must answer HONEST-OFFLINE, never a stub-scripted reply
  // (grain's stub answers chat.send with "Noted — "..."" — that string must never appear here).
  test("a chat.send raised anyway (bypassing the hidden composer) gets the honest offline line, never a stub answer", async ({ page }) => {
    await asClientDesk(page, "**/grain");
    await page.goto("/grain");
    await expect(page.locator("body")).toHaveAttribute("data-desk", "offline");

    await page.evaluate(() =>
      (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
        .grain.door.submit("chat.send", "chat-log", { text: "who is TJ?" }));

    const reply = page.locator('[data-surface="chat-log"] .chat-message[data-role="ai"]').last();
    await expect(reply).toContainText("offline");
    await expect(reply).not.toContainText("Noted —");   // the stub's chat.send phrasing — never leaks through
  });
});
