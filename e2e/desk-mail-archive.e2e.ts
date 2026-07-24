// tjakoen.github.io/e2e/desk-mail-archive.e2e.ts — B3 MAIL BATCH ARCHIVE. Same headless-Chromium-
// has-no-WebGPU setup as desk-theme.e2e.ts / desk-notes-filter.e2e.ts: every path here is
// DETERMINISTIC (actions.ts's mail-archive routing, mail-sender.ts's sender match against the live
// DOM, desk-reasoner.ts's on-page handler clicking the island's real Archive buttons, and
// desk-door.ts's desk-mail-task stash + runMailTask for the cross-page case) — zero model, no
// download, no generation. Even the unknown-sender miss stays deterministic on purpose: an ACTION
// verb never falls through to the 0.5B, it declines honestly naming the real senders instead.
import { test, expect, type Page } from "@playwright/test";
import mailbox from "../content/data/mailbox.json" with { type: "json" };

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";
const CI_IDS = mailbox.messages.filter((m) => m.from === "BREAD CI" && m.folder === "inbox").map((m) => m.id);
const INBOX_TOTAL = mailbox.messages.filter((m) => m.folder === "inbox").length;

async function clientDeskEverywhere(page: Page) {
  await page.route("**/*", async (route, req) => {
    if (req.resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    if (!(res.headers()["content-type"] || "").includes("text/html")) return route.fulfill({ response: res });
    const html = (await res.text()).replace(/<body\b/, `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`);
    return route.fulfill({ response: res, body: html });
  });
  await page.addInitScript(() => {   // force the no-WebGPU (offline model) path deterministically
    try { Object.defineProperty(navigator, "gpu", { value: undefined, configurable: true }); } catch { /* absent */ }
  });
}

const ask = (page: Page, text: string) =>
  page.evaluate((t) => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
    .grain.door.submit("chat.send", "chat-log", { text: t }), text);

async function deskReady(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");   // the client door came up
}

test.describe("B3 mail batch archive (deterministic, no model needed)", () => {
  test("on /mail: archives every BREAD CI letter through the island's real Archive buttons", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/mail");
    await deskReady(page);
    expect(CI_IDS.length).toBeGreaterThan(1);   // the fixture must keep this a real BATCH

    await ask(page, "archive everything from BREAD CI");

    // every CI row leaves the inbox (the island's own archiveMessage ran per letter, not a cosmetic flip)
    for (const id of CI_IDS) {
      await expect(page.locator(`a.mailbox__item[href="#msg-${id}"]`))
        .toHaveAttribute("data-folder", "archive", { timeout: 15_000 });
    }
    // the rail count reflects it, and the desk reported the honest count
    await expect(page.locator('[data-mailbox-folders] [data-folder="inbox"] .mailbox__folder-count'))
      .toHaveText(String(INBOX_TOTAL - CI_IDS.length));
    await expect(page.locator(".assistant__log")).toContainText(`Archived ${CI_IDS.length}`);
    await expect(page.locator(".assistant__log")).toContainText("BREAD CI");

    // asking again is idempotent: an honest "nothing left", never a re-archive or a crash
    await ask(page, "archive everything from BREAD CI");
    await expect(page.locator(".assistant__log")).toContainText("Nothing from BREAD CI", { timeout: 10_000 });
  });

  test("from '/': stashes the batch, navigates to /mail, and the door runs it on arrival", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "archive everything from BREAD CI");

    await page.waitForURL(/\/mail\b/);
    for (const id of CI_IDS) {
      await expect(page.locator(`a.mailbox__item[href="#msg-${id}"]`))
        .toHaveAttribute("data-folder", "archive", { timeout: 20_000 });
    }
    await expect(page.locator(".assistant__log")).toContainText(`Archived ${CI_IDS.length}`);
  });

  test("an unknown sender declines deterministically, naming the real senders — nothing is archived", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/mail");
    await deskReady(page);

    await ask(page, "archive everything from Hogwarts");

    await expect(page.locator(".assistant__log")).toContainText("The Desk", { timeout: 10_000 });   // the real senders, enumerated by code
    await expect(page.locator('a.mailbox__item[data-folder="archive"]'))
      .toHaveCount(mailbox.messages.filter((m) => m.folder === "archive").length);   // only the fixture's own archived letters
    expect(new URL(page.url()).pathname).toBe("/mail");   // no navigation, no model fall-through
  });
});
