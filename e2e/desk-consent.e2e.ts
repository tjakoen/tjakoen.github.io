// e2e/desk-consent.e2e.ts — the desk asks before it stores a session cookie.
//
// The question is a chat message with two real buttons (molecules/chat-message), asked after the
// first exchange. Allow stores the tab's session id; Not now stores nothing and does not ask again
// in that tab. The cookie is readable by the page because the inline bootstrap in the page head
// has to read it before the dispatcher runs.
import { test, expect } from "@playwright/test";

async function firstExchange(page: import("@playwright/test").Page) {
  const log = page.locator('[data-surface="chat-log"]');
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true", { timeout: 8000 });
  await page.locator('.assistant__composer input[data-surface="chat-input"]').fill("hello desk");
  await page.locator('.assistant__composer .icon-btn[data-action="chat.send"]').click();
  return log;
}

test.describe("the desk's cookie consent", () => {
  test("asks before storing, and Not now stores nothing", async ({ page }) => {
    await page.goto("/");
    const log = await firstExchange(page);
    const notice = log.locator("[data-consent-notice]");
    await expect(notice).toBeVisible({ timeout: 8000 });
    expect(await page.evaluate(() => document.cookie)).not.toContain("desk_session=");

    await notice.getByRole("button", { name: "Not now" }).click();
    await expect(notice).toHaveCount(0);
    expect(await page.evaluate(() => document.cookie)).not.toContain("desk_session=");

    await page.reload();
    await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true", { timeout: 8000 });
    await page.locator('.assistant__composer input[data-surface="chat-input"]').fill("still here");
    await page.locator('.assistant__composer .icon-btn[data-action="chat.send"]').click();
    await expect(page.locator('[data-surface="chat-log"] [data-consent-notice]')).toHaveCount(0);
  });

  test("Allow stores the session id and does not ask again", async ({ page }) => {
    await page.goto("/");
    const log = await firstExchange(page);
    const notice = log.locator("[data-consent-notice]");
    await expect(notice).toBeVisible({ timeout: 8000 });
    const before = await page.evaluate(() => (window as Window & { __DESK_SESSION__?: string }).__DESK_SESSION__);
    await notice.getByRole("button", { name: "Remember this chat" }).click();
    expect(await page.evaluate(() => document.cookie)).toContain(`desk_session=${encodeURIComponent(before!)}`);

    await page.reload();
    await expect(page.locator('[data-surface="chat-log"] [data-consent-notice]')).toHaveCount(0);
    expect(await page.evaluate(() => (window as Window & { __DESK_SESSION__?: string }).__DESK_SESSION__)).toBe(before);
  });
});
