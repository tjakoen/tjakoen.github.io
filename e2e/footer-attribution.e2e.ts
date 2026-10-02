import { test, expect } from "@playwright/test";

const PAGES = [
  "/about", "/batch", "/bread", "/calendar", "/crumb", "/docs", "/grain/builder",
  "/greenroom", "/mail", "/mill", "/native-github-classroom/docs",
  "/native-github-classroom", "/pantry", "/projects", "/proof", "/resume",
];

test.describe("portfolio footer attribution", () => {
  for (const path of PAGES) {
    test(`${path} uses the same human-accountable AI byline`, async ({ page }) => {
      await page.goto(path);
      const attribution = page.locator(".page-foot > p").filter({ hasText: "AI helps me write and review" });
      await expect(attribution).toHaveCount(1);
      await expect(attribution).toContainText("I direct the work, test the result, and answer for what ships.");
      await expect(attribution.locator('a[href="/notes/ten-times-zero"]')).toHaveText("How I work with AI →");
      await expect(attribution).not.toContainText("🤖");
      await expect(attribution).not.toContainText("Every commit here is co-authored");
    });
  }
});
