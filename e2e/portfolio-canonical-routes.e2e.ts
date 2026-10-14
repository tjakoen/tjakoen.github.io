import { test, expect } from "@playwright/test";

test("every canonical route fits desktop and phone viewports", async ({ page }) => {
  test.setTimeout(180_000);
  const sitemap = await page.request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, loc]) => new URL(loc!).pathname);
  expect(routes.length).toBeGreaterThan(0);
  expect(new Set(routes).size, "sitemap contains duplicate canonical routes").toBe(routes.length);

  for (const route of routes) {
    await page.setViewportSize({ width: 1440, height: 900 });
    const response = await page.goto(route);
    expect(response?.status(), `${route} desktop response`).toBe(200);
    const desktop = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    expect(desktop.document, `${route} overflows at desktop: ${JSON.stringify(desktop)}`).toBeLessThanOrEqual(desktop.viewport + 1);

    await page.setViewportSize({ width: 390, height: 844 });
    const phone = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    expect(phone.document, `${route} overflows at phone width: ${JSON.stringify(phone)}`).toBeLessThanOrEqual(phone.viewport + 1);
  }
});

test.describe("sitemap canonical routes", () => {
  for (const [route, selector] of [
    ["/catalog/", ".cat-main"],
    ["/reference/", "#main-content .masthead"],
    ["/notes/", ".note-feed"],
    ["/decks/", ".deck-index__list"],
    ["/decks/engineering-ai-for-social-impact/", ".deck-page__title"],
    ["/decks/from-code-to-career/", ".deck-page__title"],
    ["/decks/gdg-hau-ai-hack-ideation/", ".deck-page__title"],
    ["/decks/reality-check-ai-ethics/", ".deck-page__title"],
    ["/decks/version-one/", ".deck-page__title"],
    ["/grain/builder/", ".builder-composer"],
    ["/grain/builder/preview/", ".preview-pane"],
  ]) {
    test(`${route} resolves as advertised`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator(selector)).toBeVisible();
    });
  }

  test("a browser without inline PDF support can open the deck from its fallback", async ({ page }) => {
    await page.goto("/decks/reality-check-ai-ethics/");
    const fallbackLink = page.locator(".doc-frame__fallback a");
    await expect(fallbackLink).toHaveAttribute("href", "/media/decks/reality-check-ai-ethics.pdf");
    await expect(fallbackLink).toBeVisible();
    const pdf = await page.request.get("/media/decks/reality-check-ai-ethics.pdf");
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()["content-type"]).toContain("application/pdf");
    expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  });

  test("the deck breadcrumb opens a useful index of every presentation", async ({ page }) => {
    await page.goto("/decks/");
    await expect(page.getByRole("heading", { name: "Talks and decks" })).toBeVisible();
    await expect(page.locator(".deck-index__list a")).toHaveCount(5);
    await expect(page.locator(".deck-index__list a").first()).toHaveAttribute("href", /^\/decks\//);
    await expect(page.locator('.deck-index__list a[href="/decks/version-one"]')).toHaveText("Version One");
  });

  test("the Version One deck stays inside the phone viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/decks/version-one/");
    await expect(page.locator(".deck-page__title")).toHaveText("Version One");
    const board = page.locator("main .board");
    expect(await board.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(await board.evaluate((el) => el.clientWidth));
  });

  test("the workshop page links directly to its in-shell presentation", async ({ page }) => {
    await page.goto("/calendar/loop-hau-version-one");
    const deck = page.locator('main a.event-deck[href="/decks/version-one"]');
    await expect(deck).toBeVisible();
    await expect(deck).toContainText("47 slides");
    await page.setViewportSize({ width: 390, height: 844 });
    const board = page.locator("main .board");
    expect(await board.evaluate((el) => el.scrollWidth)).toBeLessThanOrEqual(await board.evaluate((el) => el.clientWidth));
  });

  test("the GRAIN intro links to its static-compatible AI interface guide", async ({ page }) => {
    await page.goto("/grain/");
    await expect(page.getByRole("link", { name: "AI interface" }).first()).toHaveAttribute("href", "/grain/docs/ai-interface");
    await expect(page.getByRole("link", { name: "Read how the interface works." })).toHaveAttribute("href", "/grain/docs/ai-interface");
  });

  test("plan detail pages link back to the public plan board", async ({ page }) => {
    const response = await page.goto("/plans/plan/site-builder/");
    expect(response?.status()).toBe(200);
    await expect(page.locator(".proof-back")).toHaveAttribute("href", "/plans");
    await expect(page.getByRole("link", { name: "builder-ai-depth.md" }).last()).toHaveAttribute("href", "/plans/plan/builder-ai-depth");
  });
});
