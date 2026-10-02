import { test, expect } from "@playwright/test";

test("the résumé print sheet follows the supplied two-page layout", async ({ page }) => {
  await page.goto("/resume");
  await page.emulateMedia({ media: "print" });

  const name = page.locator(".profile-card__name");
  await expect(name).toBeVisible();
  expect(await name.evaluate((el) => getComputedStyle(el).textTransform)).toBe("uppercase");
  expect(await name.evaluate((el) => getComputedStyle(el).color)).toBe("rgb(33, 63, 107)");

  const roles = page.locator(".cv-list").first().locator(":scope > .cv-entry");
  await expect(roles).toHaveCount(8);
  expect(await roles.nth(4).evaluate((el) => getComputedStyle(el).breakBefore)).toBe("page");
  await expect(page.locator(".cv-entry__detail").first()).toBeVisible();
  await expect(page.locator("[data-resume-print]")).toBeHidden();
});
