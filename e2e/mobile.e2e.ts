// tjakoen.github.io/e2e/mobile.e2e.ts — the phone layout (<768px). On a phone the bottom bar holds
// Menu, Browse and Tour: Menu raises a drawer of key pages and the file tree, Browse raises the Browse
// sheet, and Tour starts the phone's own tour. Covers what only a browser shows.
import { test, expect } from "@playwright/test";

test.describe("mobile — the bottom bar", () => {
  test.use({ viewport: { width: 375, height: 720 } });

  test("Menu raises a drawer of key pages above the bar, and its links navigate", async ({ page }) => {
    await page.goto("/");
    const shell = page.locator(".app-shell");
    const bar = page.getByRole("navigation", { name: "Main" });
    await expect(bar).toBeInViewport();
    await expect(page.locator('.app-shell__topbar [data-shell="rail-toggle"]')).toBeHidden();

    const menu = bar.getByRole("button", { name: "Menu" });
    await menu.click();
    await expect(shell).toHaveAttribute("data-rail-open", "true");
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    const keyPages = page.getByRole("navigation", { name: "Key pages" });
    await expect(keyPages).toBeInViewport();
    // the drawer ends where the bar starts, so no page link sits under it
    const barTop = Math.round((await bar.boundingBox())?.y ?? 0);
    await expect.poll(async () => {
      const drawer = await page.locator(".app-shell__rail").boundingBox();
      return Math.round((drawer?.y ?? 0) + (drawer?.height ?? 0));
    }).toBeLessThanOrEqual(barTop + 1);

    await keyPages.getByRole("link", { name: "Résumé" }).click();
    await expect(page).toHaveURL(/\/resume\/?$/);
  });

  test("Browse raises the Browse sheet above the bar and lowers it again", async ({ page }) => {
    await page.goto("/");
    const shell = page.locator(".app-shell");
    const aside = page.locator(".app-shell__aside");
    const browse = page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: "Browse" });

    await expect(shell).not.toHaveAttribute("data-aside-open", "");
    await expect(aside).not.toBeInViewport();

    await browse.click();
    await expect(shell).toHaveAttribute("data-aside-open", "");
    await expect(browse).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".assistant")).toHaveAttribute("data-mode", "browse");
    await expect(page.locator("#desk-browse")).toBeInViewport();
    const barTop = Math.round((await page.getByRole("navigation", { name: "Main" }).boundingBox())?.y ?? 0);
    await expect.poll(async () => {
      const sheet = await aside.boundingBox();
      return Math.round((sheet?.y ?? 0) + (sheet?.height ?? 0));
    }).toBeLessThanOrEqual(barTop + 1);

    await browse.click();
    await expect(shell).not.toHaveAttribute("data-aside-open", "");
    await expect(browse).toHaveAttribute("aria-expanded", "false");
  });

  test("the sheet carries no Catalog or Notepad, and Tour starts the phone tour", async ({ page }) => {
    await page.goto("/");
    const bar = page.getByRole("navigation", { name: "Main" });
    await bar.getByRole("button", { name: "Browse" }).click();
    await expect(page.locator('.assistant__modes [data-shell-mode="catalog"]')).toBeHidden();
    await expect(page.locator('.assistant__modes [data-shell-mode="notepad"]')).toBeHidden();
    await expect(bar.getByRole("button", { name: "Tour" })).toHaveAttribute("data-crumb-start", "mobile");
    const tour = await page.request.get("/crumb/tours/mobile.json");
    expect(tour.ok()).toBe(true);
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
