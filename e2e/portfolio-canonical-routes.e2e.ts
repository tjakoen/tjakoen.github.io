import { test, expect } from "@playwright/test";

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
  });

  test("the deck breadcrumb opens a useful index of every presentation", async ({ page }) => {
    await page.goto("/decks/");
    await expect(page.getByRole("heading", { name: "Talks and decks" })).toBeVisible();
    await expect(page.locator(".deck-index__list a")).toHaveCount(4);
    await expect(page.locator(".deck-index__list a").first()).toHaveAttribute("href", /^\/decks\//);
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
