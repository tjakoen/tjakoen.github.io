import { test, expect } from "@playwright/test";

test.describe("sitemap canonical routes", () => {
  for (const [route, selector] of [
    ["/catalog/", ".cat-main"],
    ["/reference/", "#main-content .masthead"],
    ["/notes/", ".note-feed"],
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
});
