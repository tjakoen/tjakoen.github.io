// portfolio/e2e/skills-page.e2e.ts — /skills, the index of the published library.
//
// The page is generated from standards/ by tools/skills-library.ts, so this spec checks the two
// things generation can get wrong: the list is not empty or truncated, and every card links to the
// site ROUTE, not the mounted name (LOOP mounts as `loop-standard` and lives at /standards/loop).
import { test, expect } from "@playwright/test";

test("the library page lists the skills, names the router, and carries a working install line", async ({ page }) => {
  await page.goto("/skills");

  await expect(page.locator(".masthead")).toContainText("skills an agent loads on its own");
  expect(await page.locator(".card").count()).toBeGreaterThan(20);

  // the way in comes first: the router, the flow and the glossary.
  await expect(page.locator(".card").first()).toContainText("GLOSSARY");
  await expect(page.locator('a.card[href="/standards/which-skill"]')).toBeVisible();
  await expect(page.locator('a.card[href="/standards/main-flow"]')).toBeVisible();

  // the mounted name and the route differ for LOOP; the card must use the route.
  await expect(page.locator('a.card[href="/standards/loop"]')).toBeVisible();
  await expect(page.locator('a.card[href="/standards/loop-standard"]')).toHaveCount(0);

  await expect(page.getByText("npx skills@latest add tjakoen/skills")).toBeVisible();

  // a card is a real link, not decoration.
  await page.locator('a.card[href="/standards/voice"]').click();
  await expect(page).toHaveURL(/\/standards\/voice$/);
  await expect(page.locator("h1").first()).toBeVisible();
});
