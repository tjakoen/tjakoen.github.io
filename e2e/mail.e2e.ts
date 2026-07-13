// portfolio/e2e/mail.e2e.ts — CONFORMANCE: the /mail mailbox shell (Pass 3 — Mail,
// plans/drifting-pondering-brook.md). The page had zero e2e coverage before this pass. Every
// message on the page is dressing (FROM "The Desk" TO the visitor, hand-authored, never a fake
// received mail); the ONE live control is the reused Compose form and its mailto hand-off, so
// most of this spec's job is proving that path still works while the mailbox chrome around it is
// honestly inert (Reply/Forward/Archive disabled, folder counts real, nothing else JS-gated).
import { test, expect } from "@playwright/test";

test.describe("the /mail mailbox (JS on)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/mail");
  });

  test("folders show real counts", async ({ page }) => {
    const folders = page.locator("[data-mailbox-folders] [data-folder]");
    await expect(folders).toHaveCount(4);

    await expect(page.locator('[data-folder="inbox"] .mailbox__folder-count')).toHaveText("3");
    await expect(page.locator('[data-folder="sent"] .mailbox__folder-count')).toHaveText("1");
    await expect(page.locator('[data-folder="drafts"] .mailbox__folder-count')).toHaveText("1");
    await expect(page.locator('[data-folder="archive"] .mailbox__folder-count')).toHaveText("2");
  });

  test("the island collapses to one reader, Inbox filtered, on load", async ({ page }) => {
    await expect(page.locator(".mailbox__reader:not([hidden])")).toHaveCount(1);
    await expect(page.locator("#msg-welcome")).toBeVisible();

    await expect(page.locator('[data-folder="inbox"]').first()).toHaveAttribute("aria-current", "page");
    const visibleItems = page.locator(".mailbox__item:not([hidden])");
    await expect(visibleItems).toHaveCount(3);
    for (const folder of await visibleItems.evaluateAll((els) => els.map((el) => el.getAttribute("data-folder")))) {
      expect(folder).toBe("inbox");
    }
  });

  test("clicking a message swaps the reader and marks it current", async ({ page }) => {
    const shippedItem = page.locator('a.mailbox__item[href="#msg-shipped"]');
    await shippedItem.click();

    await expect(page.locator("#msg-shipped")).toBeVisible();
    await expect(page.locator("#msg-welcome")).toBeHidden();
    await expect(shippedItem).toHaveAttribute("aria-current", "page");
    await expect(page.locator('a.mailbox__item[href="#msg-welcome"]')).not.toHaveAttribute("aria-current", "page");
  });

  test("Reply, Forward, and Archive are disabled on every reader", async ({ page }) => {
    const tools = page.locator(".mailbox__reader-tools .btn");
    const count = await tools.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(tools.nth(i)).toBeDisabled();
    }
  });

  test("a folder filters the message list", async ({ page }) => {
    const folderNav = page.locator("[data-mailbox-folders]");
    await folderNav.locator('a[data-folder="archive"]').click();

    const visible = page.locator(".mailbox__item:not([hidden])");
    await expect(visible).toHaveCount(2);
    for (const folder of await visible.evaluateAll((els) => els.map((el) => el.getAttribute("data-folder")))) {
      expect(folder).toBe("archive");
    }
    await expect(folderNav.locator('a[data-folder="archive"]')).toHaveAttribute("aria-current", "page");
    await expect(folderNav.locator('a[data-folder="inbox"]')).not.toHaveAttribute("aria-current", "page");
  });

  test("Compose reveals and focuses the form", async ({ page }) => {
    await expect(page.locator("#compose")).toBeHidden();
    await page.locator("[data-open-compose]").click();

    await expect(page.locator("#compose")).toBeVisible();
    await expect(page.locator("#compose-subject")).toBeFocused();
  });

  test("the mailto address assembles after JS runs", async ({ page }) => {
    await expect(page.locator("[data-to-addr]")).toHaveText("<tjakoen.s@gmail.com>");
  });

  test("a compose submit does not navigate the page", async ({ page }) => {
    await page.locator("[data-open-compose]").click();
    await page.locator("#compose-subject").fill("Hello from the e2e suite");
    await page.locator("#compose-body").fill("Just checking the send path stays local.");

    const urlBefore = page.url();
    await page.locator('.compose button[type="submit"]').click();
    await page.waitForTimeout(200);
    expect(page.url()).toBe(urlBefore);
  });
});

test.describe("the /mail mailbox (no JS)", () => {
  test.use({ javaScriptEnabled: false });

  test("every reader is visible, the compose form is present and usable", async ({ page }) => {
    await page.goto("/mail");

    await expect(page.locator(".mailbox__reader")).toHaveCount(7);
    for (const reader of await page.locator(".mailbox__reader").all()) {
      await expect(reader).toBeVisible();
    }

    // the list isn't filtered by folder either — nothing real is JS-gated
    await expect(page.locator(".mailbox__item")).toHaveCount(7);
    for (const item of await page.locator(".mailbox__item").all()) {
      await expect(item).toBeVisible();
    }

    await expect(page.locator("#compose")).toBeVisible();
    await expect(page.locator("[data-compose]")).toBeVisible();
    await expect(page.locator("#compose-subject")).toBeVisible();
    await expect(page.locator("#compose-body")).toBeVisible();
    await expect(page.locator('.compose button[type="submit"]')).toBeVisible();

    // the address never assembles without JS, so the noscript mailto fallback is the real path
    await expect(page.locator("[data-to-addr]")).toHaveText("(the desk)");
    await expect(page.locator('.compose__hint a[href^="mailto:"]')).toBeVisible();
  });
});
