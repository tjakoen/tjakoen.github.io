// Exercise the exported client transport without fetching a real model.
import { test, expect, devices, type Page } from "@playwright/test";

test.describe.configure({ timeout: 90_000 });

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";

// Serve the page as the FROZEN site would: client transport + the portfolio's own desk door.
async function asClientDesk(page: Page, path: string) {
  await page.route(path, async (route) => {
    const res = await route.fetch();
    const html = (await res.text()).replace(
      /<body\b/,
      `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`,
    );
    await route.fulfill({ response: res, body: html });
  });
}

async function openClientDesk(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true", { timeout: 25_000 });
}

test.describe("THE DESK — client transport, no WebGPU → Browse", () => {
  test.beforeEach(async ({ page }) => {
    // guarantee the WebGPU probe fails, so the offline path is deterministic (not GPU-dependent)
    await page.addInitScript(() => {
      try { Object.defineProperty(navigator, "gpu", { value: undefined, configurable: true }); } catch { /* already absent */ }
    });
  });

  test("Browse replaces the chat when the model cannot run", async ({ page }) => {
    await asClientDesk(page, "**/grain");
    await openClientDesk(page, "/grain");

    // the portfolio's CHAT-SPECIFIC marker flips (set by the desk door once the probe comes back false)
    await expect(page.locator("body")).toHaveAttribute("data-desk", "offline");

    // the whole chat surface is hidden — the ways to TALK to the desk AND the greeting/log itself,
    // so nothing chat-shaped lingers when there's nothing to talk to…
    await expect(page.locator(".assistant__composer")).toBeHidden();
    await expect(page.locator(".assistant__suggest")).toBeHidden();
    await expect(page.locator(".assistant__log")).toBeHidden();
    await expect(page.getByRole("region", { name: "Browse the portfolio" })).toBeVisible();
    await expect(page.getByText(/Local AI is unavailable here/)).toBeVisible();
  });

  test("global presence stays ONLINE — the door loaded, so stub demos are unaffected", async ({ page }) => {
    await asClientDesk(page, "**/grain");
    await openClientDesk(page, "/grain");
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

  test("bypassing the hidden composer does not start a chat turn", async ({ page }) => {
    await asClientDesk(page, "**/grain");
    await openClientDesk(page, "/grain");
    await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");
    await sendDirectly(page);
    await expect(page.locator('.assistant__log [data-role="you"]')).toHaveCount(0);
  });
});

// A COLD Safari load can have the WebGPU API present yet return a null adapter for the first instant
// (the GPU process isn't warm the moment the desk module evaluates), then work a beat later. The
// up-front gate must NOT strand the desk offline on that single racy adapter — it gates on the API
// being present and lets the real engine load (on first use, GPU warm) be the true test.
test.describe("THE DESK — WebGPU API present, first adapter momentarily null (cold Safari)", () => {
  test("stays optimistic: the chat is NOT hidden just because the first adapter probe came back null", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, "gpu", {
          value: { requestAdapter: () => Promise.resolve(null) },   // API present, adapter null (cold)
          configurable: true,
        });
      } catch { /* already defined */ }
    });
    await asClientDesk(page, "**/grain");
    await openClientDesk(page, "/grain");

    // the door comes up (client loopback) as always…
    await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");
    // …and the up-front probe().then(markOffline) must NOT have fired on the null adapter alone:
    // the chat surface stays, the composer is usable (the real load, on first send, is the true test).
    await expect(page.locator(".assistant__composer")).toBeVisible();
    await expect(page.locator("body")).not.toHaveAttribute("data-desk", "offline");
  });
});


async function sendDirectly(page: Page) {
  return page.evaluate(() =>
    (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): Promise<unknown> } } })
      .grain.door.submit("chat.send", "chat-log", { text: "What is BREAD?" }));
}

async function fakeAvailableModel(page: Page, fail = false) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", { value: { requestAdapter: async () => null }, configurable: true });
  });
  await page.route("**/modules/grain/ai/webllm.js", (route) => route.fulfill({
    contentType: "text/javascript",
    body: `
      export async function probeDevice() { return { webgpu: true, deviceMemory: 8 }; }
      export async function loadEngine() {
        sessionStorage.setItem("test-model-loads", String(Number(sessionStorage.getItem("test-model-loads")) + 1));
        ${fail ? 'throw new Error("Model fetch failed");' : 'return { fake: true };'}
      }
    `,
  }));
}

test.describe("THE DESK — mobile Browse with WebGPU available", () => {
  const { viewport, userAgent, isMobile, hasTouch } = devices["iPhone 13"];
  test.use({ viewport, userAgent, isMobile, hasTouch });

  test("opens recent updates and shortcuts without fetching a model", async ({ page }) => {
    await fakeAvailableModel(page);
    await asClientDesk(page, "**/grain");
    await asClientDesk(page, "**/notes");
    await openClientDesk(page, "/grain");
    await page.getByRole("button", { name: "Search the site" }).click();
    await expect(page.locator("dialog.cmdk[open]")).toBeVisible();
    await page.keyboard.press("Escape");
    const browse = page.getByRole("region", { name: "Browse the portfolio" });
    await page.getByRole("tab", { name: "Browse" }).click();
    await expect(page.locator(".app-shell[data-aside-open]")).toHaveCount(1);
    await expect(browse).toContainText("On mobile");
    await expect(browse).toContainText("No AI model is downloaded.");
    await expect(page.getByRole("tab", { name: "Chat", exact: true })).toBeHidden();
    await expect(page.getByRole("textbox", { name: "Ask the desk" })).toBeHidden();

    const recent = browse.getByRole("region", { name: "Recent updates" });
    await expect(recent.locator(".recent__item")).toHaveCount(4);
    await expect(recent.locator(".recent__item").first()).toHaveAttribute("href", /^\/(notes|calendar)\//);
    await expect(browse.getByRole("searchbox")).toHaveCount(0);
    await sendDirectly(page);
    await expect(page.locator('.assistant__log [data-role="you"]')).toHaveCount(0);
    expect(await page.evaluate(() => sessionStorage.getItem("test-model-loads"))).toBeNull();
    await browse.getByRole("link", { name: "Notes", exact: true }).click();
    await expect(page).toHaveURL(/\/notes\/?$/);
    await expect(page.locator("body")).toHaveAttribute("data-desk-mode", "browse", { timeout: 25_000 });
  });

  test("the Builder composes a draft without loading a model", async ({ page }) => {
    await fakeAvailableModel(page);
    await asClientDesk(page, "**/grain/builder");
    await openClientDesk(page, "/grain/builder");
    await expect(page.locator("body")).toHaveAttribute("data-desk-mode", "browse", { timeout: 25_000 });
    const brief = page.locator('[data-surface="field:builder-ask"]');
    await brief.fill("An opening paragraph and a stat");
    await page.getByRole("button", { name: "Build it", exact: true }).click();
    await expect(page.locator('[data-surface="builder-said"]')).toContainText("This used no AI model.");
    expect(await page.evaluate(() => sessionStorage.getItem("test-model-loads"))).toBeNull();
  });
});

test("desktop Browse persists across navigation and leaves the model optional", async ({ page }) => {
  await fakeAvailableModel(page);
  await asClientDesk(page, "**/grain");
  await asClientDesk(page, "**/notes");
  await openClientDesk(page, "/grain");
  await expect(page.locator("[data-model-notice]")).toContainText("About 350 MB");
  await page.getByRole("tab", { name: "Browse", exact: true }).click();
  await page.getByRole("navigation", { name: "Portfolio shortcuts" }).getByRole("link", { name: "Notes", exact: true }).click();
  await expect(page.locator("body")).toHaveAttribute("data-desk-mode", "browse", { timeout: 25_000 });
  await expect(page.getByRole("region", { name: "Recent updates" }).locator(".recent__item").first()).toBeVisible();
  await sendDirectly(page);
  await expect(page.locator('.assistant__log [data-role="you"]')).toHaveCount(0);
  await page.getByRole("tab", { name: "Chat", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Ask the desk" })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("test-model-loads"))).toBeNull();
});

test("a failed desktop model load opens Browse instead of stranding the Desk", async ({ page }) => {
  await fakeAvailableModel(page, true);
  await asClientDesk(page, "**/grain");
  await openClientDesk(page, "/grain");
  await expect(page.locator("body")).toHaveAttribute("data-desk-mode", "local");
  await sendDirectly(page);
  await expect(page.getByRole("region", { name: "Browse the portfolio" })).toBeVisible();
  await expect(page.getByText(/Local AI is unavailable here/)).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem("test-model-loads"))).toBe("1");
});

test("Browse refreshes open updates and displays their published types", async ({ page }) => {
  await page.clock.install();
  await fakeAvailableModel(page);
  await asClientDesk(page, "**/grain");
  let revision = 0;
  await page.route("**/recent.json", (route) => route.fulfill({
    json: revision++ === 0
      ? [{ href: "/notes/ten-times-zero", title: "Ten Times Zero", kindLabel: "Note" }]
      : [{ href: "/calendar/new-talk", title: "A newly published talk", kindLabel: "Talk" }],
  }));
  await openClientDesk(page, "/grain");
  expect(revision).toBe(0);
  await page.getByRole("tab", { name: "Browse", exact: true }).click();
  const recent = page.getByRole("region", { name: "Recent updates" });
  await expect(recent.getByRole("link", { name: "Note Ten Times Zero" })).toBeVisible();
  await page.clock.fastForward(60_000);
  await expect(recent.getByRole("link", { name: "Talk A newly published talk" })).toBeVisible();
});
