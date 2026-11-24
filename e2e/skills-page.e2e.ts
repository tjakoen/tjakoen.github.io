// portfolio/e2e/skills-page.e2e.ts — /skills, the index of the published library.
//
// The page is generated from standards/ by tools/skills-library.ts, so this spec checks what
// generation can get wrong: the family cards are not empty, every chip links to the site ROUTE (LOOP
// mounts as `loop-standard` and lives at /standards/loop), the page explains how a skill fires, and
// the install line is present.
import { test, expect } from "@playwright/test";

test("the library page explains the mechanism and links every chip to a real standard", async ({ page }) => {
  await page.goto("/skills");

  await expect(page.locator(".skills-title")).toContainText("the agent opens on its own");
  expect(await page.locator(".skills-card").count()).toBeGreaterThanOrEqual(6);
  expect(await page.locator("a[data-skill]").count()).toBeGreaterThan(20);

  // the mechanism, not just a list: the three steps and the loop strip.
  await expect(page.getByRole("heading", { name: "How a skill fires" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "The line is the trigger" })).toBeVisible();
  await expect(page.locator(".skills-loop")).toContainText("which-skill");
  await expect(page.locator(".skills-loop")).toContainText("freshness");

  // the mounted name and the route differ for LOOP; the chip must use the route.
  await expect(page.locator('a[data-skill="loop-standard"]')).toHaveAttribute("href", "/standards/loop");
  await expect(page.locator('a[href="/standards/loop-standard"]')).toHaveCount(0);

  await expect(page.getByText("npx skills@latest add tjakoen/skills")).toBeVisible();

  // a chip is a real link, not decoration.
  await page.locator('a[data-skill="voice"]').click();
  await expect(page).toHaveURL(/\/standards\/voice$/);
  await expect(page.locator("h1").first()).toBeVisible();
});
