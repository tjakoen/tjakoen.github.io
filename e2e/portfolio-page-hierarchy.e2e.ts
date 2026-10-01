import { test, expect } from "@playwright/test";

test.describe("portfolio page headings", () => {
  for (const route of [
    "/notes/",
    "/calendar/",
    "/mail/",
    "/grain/builder/",
    "/plans/plan/000-welcome/",
    "/plans/plan/note-the-loop-nobody-ran/",
    "/badges/adet-2125-midterm/",
    "/standards/voice/",
  ]) {
    test(`${route} has one page heading`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("main h1")).toHaveCount(1);
    });
  }
});
