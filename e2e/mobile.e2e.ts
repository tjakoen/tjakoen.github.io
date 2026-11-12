// tjakoen.github.io/e2e/mobile.e2e.ts — the phone layout (<768px). On a phone the bottom nav is the
// site's navigation: Home, Notes, Projects, Calendar and Menu. The rail drawer and its topbar toggle
// are gone, and Menu raises the Browse sheet above the bar. Covers what only a browser shows.
import { test, expect } from "@playwright/test";

test.describe("mobile — the bottom nav", () => {
  test.use({ viewport: { width: 375, height: 720 } });

  test("the bottom nav replaces the drawer and its links navigate", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeInViewport();
    await expect(page.locator('.app-shell__topbar [data-shell="rail-toggle"]')).toBeHidden();
    await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    await nav.getByRole("link", { name: "Calendar" }).click();
    await expect(page).toHaveURL(/\/calendar\/?$/);
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Calendar" }))
      .toHaveAttribute("aria-current", "page");
  });

  test("Menu raises the Browse sheet above the bar and lowers it again", async ({ page }) => {
    await page.goto("/");
    const shell = page.locator(".app-shell");
    const aside = page.locator(".app-shell__aside");
    const menu = page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Menu" });

    // closed: the sheet is fully below the viewport, with no header peeking over the page
    await expect(shell).not.toHaveAttribute("data-aside-open", "");
    await expect(aside).not.toBeInViewport();

    await menu.click();
    await expect(shell).toHaveAttribute("data-aside-open", "");
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".assistant")).toHaveAttribute("data-mode", "browse");
    await expect(page.locator("#desk-browse")).toBeInViewport();
    // the sheet ends where the bar starts, so the bar stays tappable
    const sheet = await aside.boundingBox();
    const bar = await page.getByRole("navigation", { name: "Main" }).boundingBox();
    expect(Math.round((sheet?.y ?? 0) + (sheet?.height ?? 0))).toBeLessThanOrEqual(Math.round(bar?.y ?? 0) + 1);

    await menu.click();
    await expect(shell).not.toHaveAttribute("data-aside-open", "");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
  });

  test("the sheet carries no Catalog or Notepad on a phone", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Menu" }).click();
    await expect(page.locator('.assistant__modes [data-shell-mode="catalog"]')).toBeHidden();
    await expect(page.locator('.assistant__modes [data-shell-mode="notepad"]')).toBeHidden();
  });
});

test("the mobile note stays readable while the Nest launcher and direct play stay off", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const page = await context.newPage();
    const gameRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/site/nest-game.js")) gameRequests.push(request.url());
    });
    await page.goto("/?nest=play");
    await expect(page.locator(".nest-switch")).toBeHidden();
    await expect(page.locator("#nest-mock, .nest-layer, .nest-stray")).toHaveCount(0);
    await page.goto("/notes/the-site-has-ants");
    await expect(page.locator(".nest-scene")).toHaveCount(6);
    await expect(page.locator("[data-nest-start]").first()).toBeHidden();
    await page.setViewportSize({ width: 900, height: 390 });
    await page.goto("/?nest=play");
    await expect(page.locator(".nest-switch")).toBeHidden();
    await expect(page.locator("#nest-mock, .nest-layer, .nest-stray")).toHaveCount(0);
    await page.locator(".console__expand").click();
    const input = page.getByRole("textbox", { name: "Terminal command" });
    for (const command of ["nest", "stray"]) {
      await input.fill(command);
      await input.press("Enter");
      await expect(page.locator('[data-surface="console"]')).toContainText(`command not found: ${command}`);
    }
    await expect(page.locator("#nest-mock, .nest-layer, .nest-stray")).toHaveCount(0);
    expect(gameRequests).toEqual([]);
  } finally {
    await context.close();
  }
});

test("narrowing a desktop window closes the Nest and restores page controls", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/?nest=play");
  await expect(page.locator("#nest-mock")).toBeVisible();
  await page.getByRole("button", { name: "Wipe", exact: true }).click();
  await page.setViewportSize({ width: 700, height: 800 });
  await expect(page.locator("#nest-mock, .nest-layer")).toHaveCount(0);
  await expect(page.locator(".nest-switch")).toBeHidden();
  const canUsePointer = await page.locator(".app-shell__main").evaluate((main) =>
    main.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, isPrimary: true })));
  expect(canUsePointer).toBe(true);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.getByRole("button", { name: "Open the Nest" }).click();
  await expect(page.locator("#nest-mock")).toBeVisible();
});
