import { test, expect } from "@playwright/test";

test("voice comparison keeps the claim and the actual checks readable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/notes/the-voice-file");
  const figure = page.locator('[data-live-figure="voice"]');
  await expect(figure.getByRole("button", { name: "Compare both" })).toHaveAttribute("aria-pressed", "true");
  await figure.getByRole("button", { name: "AI draft", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(figure.locator('[data-voice-version="before"]')).toBeVisible();
  await expect(figure.locator('[data-voice-version="before"]')).toContainText("on a phone remains pending.");
  await expect(figure.locator('[data-voice-version="after"]')).toBeHidden();
  await figure.getByRole("button", { name: "In your own words", exact: true }).click();
  await expect(figure.locator('[data-voice-version="before"]')).toBeHidden();
  await expect(figure.locator('[data-voice-version="after"]')).toContainText("I still need to test sign-in on a phone.");
  await expect(figure.locator('[data-voice-version="after"]')).toBeVisible();
  await figure.getByRole("button", { name: "Compare both" }).click();
  await expect(figure.locator('[data-voice-version="before"]')).toBeVisible();
  expect(await figure.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
});

test("both wording examples survive without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/notes/the-voice-file`);
  const figure = page.locator('[data-live-figure="voice"]');
  await expect(figure.locator('[data-voice-version="before"]')).toBeVisible();
  await expect(figure.locator('[data-voice-version="after"]')).toBeVisible();
  await expect(figure.getByRole("button")).toHaveCount(0);
  await context.close();
});
