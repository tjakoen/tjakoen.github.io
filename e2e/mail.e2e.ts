// portfolio/e2e/mail.e2e.ts — CONFORMANCE: the /mail mailbox shell (Apps-v2 Pass B — Mail v2,
// plans/imperative-dazzling-pillow.md). Every message is dressing (FROM "The Desk" TO the visitor,
// hand-authored in data/mailbox.json, never a real received mail); the ONE live control is the
// reused Compose form and its mailto hand-off. Pass B moved the messages into mailbox.json (bound
// through mail-folder/mail-row/mail-reader molecules) and added two client-only touches that must
// degrade to nothing: localStorage unread dots and relative dates. Counts/totals are derived from
// the fixture so this spec can't rot when a message is added; the clock is frozen so relative dates
// are deterministic.
import { test, expect } from "@playwright/test";
import mailbox from "../content/data/mailbox.json" with { type: "json" };

const FIXED_NOW = new Date("2026-07-16T12:00:00");
const folderCount = (id: string) => mailbox.messages.filter((m) => m.folder === id).length;
const TOTAL = mailbox.messages.length;
const firstInbox = mailbox.messages.find((m) => m.folder === "inbox")!;   // the reader shown on load

test.describe("the /mail mailbox (JS on)", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(FIXED_NOW);
    await page.goto("/mail");
  });

  test("folders show real counts, derived from the mailbox fixture", async ({ page }) => {
    const folders = page.locator("[data-mailbox-folders] [data-folder]");
    await expect(folders).toHaveCount(mailbox.folders.length);
    for (const f of mailbox.folders) {
      await expect(page.locator(`[data-folder="${f.id}"] .mailbox__folder-count`)).toHaveText(String(folderCount(f.id)));
    }
  });

  test("the island collapses to one reader, Inbox filtered, on load", async ({ page }) => {
    await expect(page.locator(".mailbox__reader:not([hidden])")).toHaveCount(1);
    await expect(page.locator(`#msg-${firstInbox.id}`)).toBeVisible();

    await expect(page.locator('[data-folder="inbox"]').first()).toHaveAttribute("aria-current", "page");
    const visibleItems = page.locator(".mailbox__item:not([hidden])");
    await expect(visibleItems).toHaveCount(folderCount("inbox"));
    for (const folder of await visibleItems.evaluateAll((els) => els.map((el) => el.getAttribute("data-folder")))) {
      expect(folder).toBe("inbox");
    }
  });

  test("clicking a message swaps the reader and marks it current", async ({ page }) => {
    const shippedItem = page.locator('a.mailbox__item[href="#msg-shipped"]');
    await shippedItem.click();

    await expect(page.locator("#msg-shipped")).toBeVisible();
    await expect(page.locator(`#msg-${firstInbox.id}`)).toBeHidden();
    await expect(shippedItem).toHaveAttribute("aria-current", "page");
    await expect(page.locator(`a.mailbox__item[href="#msg-${firstInbox.id}"]`)).not.toHaveAttribute("aria-current", "page");
  });

  test("Reply and Forward are disabled on every reader; Archive is live only on inbox readers", async ({ page }) => {
    const replyForward = page.locator(".mailbox__reader-tools .btn:not([data-mail-archive])");
    expect(await replyForward.count()).toBe(TOTAL * 2);
    for (let i = 0; i < (await replyForward.count()); i++) {
      await expect(replyForward.nth(i)).toBeDisabled();
    }

    const archiveButtons = page.locator(".mailbox__reader-tools [data-mail-archive]");
    await expect(archiveButtons).toHaveCount(TOTAL);
    for (const m of mailbox.messages) {
      const archiveBtn = page.locator(`#msg-${m.id} [data-mail-archive]`);
      if (m.folder === "inbox") {
        await expect(archiveBtn).toBeEnabled();
      } else {
        await expect(archiveBtn).toBeDisabled();
      }
    }
  });

  test("archiving a letter moves it to the Archive folder, updates rail counts, and persists across reload", async ({ page }) => {
    const ciMessage = mailbox.messages.find((m) => m.from === "BREAD CI")!;
    const inboxBefore = folderCount("inbox");
    const archiveBefore = folderCount("archive");

    const row = page.locator(`a.mailbox__item[href="#msg-${ciMessage.id}"]`);
    await row.click();
    const archiveBtn = page.locator(`#msg-${ciMessage.id} [data-mail-archive]`);
    await expect(archiveBtn).toBeEnabled();
    await archiveBtn.click();

    // the row and reader both flip folder, and the row drops out of the (still active) Inbox view
    await expect(row).toHaveAttribute("data-folder", "archive");
    await expect(row).toBeHidden();
    await expect(page.locator(`#msg-${ciMessage.id}`)).toHaveAttribute("data-folder", "archive");
    await expect(archiveBtn).toBeDisabled();

    // rail counts recompute live
    await expect(page.locator('[data-mailbox-folders] [data-folder="inbox"] .mailbox__folder-count')).toHaveText(String(inboxBefore - 1));
    await expect(page.locator('[data-mailbox-folders] [data-folder="archive"] .mailbox__folder-count')).toHaveText(String(archiveBefore + 1));

    // switching to the Archive folder shows the freshly archived letter
    await page.locator('[data-mailbox-folders] a[data-folder="archive"]').click();
    await expect(row).toBeVisible();

    // it survives a reload in the same tab (sessionStorage), rail counts included
    await page.reload();
    await expect(page.locator(`#msg-${ciMessage.id}`)).toHaveAttribute("data-folder", "archive");
    await expect(page.locator('[data-mailbox-folders] [data-folder="inbox"] .mailbox__folder-count')).toHaveText(String(inboxBefore - 1));
    await expect(page.locator('[data-mailbox-folders] [data-folder="archive"] .mailbox__folder-count')).toHaveText(String(archiveBefore + 1));
  });

  test("a folder filters the message list", async ({ page }) => {
    const folderNav = page.locator("[data-mailbox-folders]");
    await folderNav.locator('a[data-folder="archive"]').click();

    const visible = page.locator(".mailbox__item:not([hidden])");
    await expect(visible).toHaveCount(folderCount("archive"));
    for (const folder of await visible.evaluateAll((els) => els.map((el) => el.getAttribute("data-folder")))) {
      expect(folder).toBe("archive");
    }
    await expect(folderNav.locator('a[data-folder="archive"]')).toHaveAttribute("aria-current", "page");
    await expect(folderNav.locator('a[data-folder="inbox"]')).not.toHaveAttribute("aria-current", "page");
  });

  test("a reader surfaces its Related links; a reader without links shows no Related row", async ({ page }) => {
    // shipped carries links → the Related row is present and non-empty
    const shippedLinks = page.locator("#msg-shipped .mailbox__reader-links .mailbox__reader-link");
    await expect(shippedLinks.first()).toHaveAttribute("href", /^\//);
    expect(await shippedLinks.count()).toBe(mailbox.messages.find((m) => m.id === "shipped")!.links.length);
    // welcome carries no links → the :empty row collapses (not visible)
    await expect(page.locator("#msg-welcome .mailbox__reader-links")).toBeHidden();
  });

  test("unread dots: fresh = all unread, opening clears one, and it persists across reload", async ({ page }) => {
    // fresh browser (empty localStorage) → every row unread, including the auto-shown first
    await expect(page.locator(".mailbox__item.is-unread")).toHaveCount(TOTAL);

    await page.locator('a.mailbox__item[href="#msg-shipped"]').click();
    await expect(page.locator('a.mailbox__item[href="#msg-shipped"]')).not.toHaveClass(/is-unread/);
    await expect(page.locator(".mailbox__item.is-unread")).toHaveCount(TOTAL - 1);

    await page.reload();
    // the read one stays read; the rest are still unread (state lives in localStorage)
    await expect(page.locator('a.mailbox__item[href="#msg-shipped"]')).not.toHaveClass(/is-unread/);
    await expect(page.locator(".mailbox__item.is-unread")).toHaveCount(TOTAL - 1);
  });

  test("dated rows relativize against the frozen clock; undated rows keep their literal label", async ({ page }) => {
    // welcome is Jul 14; frozen now is Jul 16 → two days ago, absolute preserved in title
    const welcomeWhen = page.locator('a.mailbox__item[href="#msg-welcome"] .mailbox__item-when');
    await expect(welcomeWhen).toHaveText("2 days ago");
    await expect(welcomeWhen).toHaveAttribute("title", "Jul 14, 2026");
    // the Sent preview has no date → the island leaves its literal label alone
    await expect(page.locator('a.mailbox__item[href="#msg-sent-preview"] .mailbox__item-when')).toHaveText("Not sent");
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

  test("every reader and row is visible, no unread dots, dates absolute, compose usable", async ({ page }) => {
    await page.goto("/mail");

    await expect(page.locator(".mailbox__reader")).toHaveCount(TOTAL);
    for (const reader of await page.locator(".mailbox__reader").all()) {
      await expect(reader).toBeVisible();
    }

    // the list isn't filtered by folder either — nothing real is JS-gated
    await expect(page.locator(".mailbox__item")).toHaveCount(TOTAL);
    for (const item of await page.locator(".mailbox__item").all()) {
      await expect(item).toBeVisible();
    }

    // no read-tracking claim without JS: zero unread dots, and dates stay absolute (never relativized)
    await expect(page.locator(".mailbox__item.is-unread")).toHaveCount(0);
    await expect(page.locator('a.mailbox__item[href="#msg-welcome"] .mailbox__item-when')).toHaveText("Jul 14");

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
