import { test, expect } from "@playwright/test";

test.describe("portfolio page headings", () => {
  for (const route of [
    "/catalog/",
    "/notes/",
    "/calendar/",
    "/mail/",
    "/grain/builder/",
    "/plans/plan/portfolio-finish-line/",
    "/plans/plan/note-the-loop-nobody-ran/",
    "/badges/adet-2125-midterm/",
    "/standards/voice/",
  ]) {
    test(`${route} has one page heading`, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });
  }
});
