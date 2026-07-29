// portfolio/e2e/terminal.e2e.ts — the INTERACTIVE TERMINAL (grain/scripts/terminal.js worn by the
// portfolio's console). The unit tier drift-guards the verb literals; this is the only tier that
// covers the island's real behavior: mount (opt-in), local commands, the grade doctrine in the
// feed (human echo settles clean, machine output stays grain), the keybinding, and — since the
// desk-hero-demo P2b work — the DESK VERBS that make the terminal a real third client of the one door.
import { test, expect, type Page } from "@playwright/test";
import mailbox from "../content/data/mailbox.json" with { type: "json" };

test.describe("the interactive terminal (third client of the one door)", () => {
  test("mounts only on the opt-in console, and Ctrl+` opens + focuses it", async ({ page }) => {
    await page.goto("/");
    const box = page.locator('.console__box[data-terminal="interactive"]');
    await expect(box.locator(".console__cmd")).toBeAttached();      // the injected input row
    await page.keyboard.press("Control+`");
    await expect(page.locator(".app-shell")).toHaveAttribute("data-console-open", "");
    await expect(box.locator(".console__cmd")).toBeFocused();
  });

  test("help lists the builtins + the portfolio's whoami; the echo settles clean", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+`");
    const input = page.locator(".console__cmd");
    await input.fill("help");
    await input.press("Enter");
    const feed = page.locator('[data-surface="console"]');
    // the echoed command is the HUMAN's line: grade=smooth (settles clean, grade doctrine)
    await expect(feed.locator('.console__line[data-variant="cmd"]')).toHaveAttribute("data-grade", "smooth");
    // machine output stays on the feed's default (grain) — no grade override on builtin output
    await expect(feed).toContainText("whoami");                     // desk-commands registered
    await expect(feed).toContainText("navigate to a page");         // the go builtin's help line
    // an unknown command reports honestly instead of failing silent
    await input.fill("frobnicate");
    await input.press("Enter");
    await expect(feed).toContainText("command not found: frobnicate");
  });

  test("go navigates by page slug (a local read against the ⌘K corpus)", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+`");
    const input = page.locator(".console__cmd");
    await input.fill("go bread");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/bread$/);
  });
});

// ---- the DESK VERBS (P2b): the terminal restates each command as the SAME natural-language intent
// the chat + suggest chips send, then raises it through window.grain.door.submit — so the
// deterministic router (ai/actions.ts) does the recognizing and the desk drives the real surface.
// Same headless-no-WebGPU client-door setup as desk-notes-filter.e2e.ts / desk-mail-archive.e2e.ts:
// every path here is DETERMINISTIC (filter/archive), zero model, no download, no generation. ----
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

async function terminalReady(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");   // the client door came up
  await page.keyboard.press("Control+`");                                         // open the console
  await expect(page.locator(".console__cmd")).toBeFocused();
}

const run = async (page: Page, cmd: string) => {
  const input = page.locator(".console__cmd");
  await input.fill(cmd);
  await input.press("Enter");
};

test.describe("terminal desk verbs (deterministic, no model needed)", () => {
  test("`notes teaching` filters through the door: teaching chip checked, ?tag= mirrored", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/notes");
    await terminalReady(page);
    const totalCards = await page.locator(".note-card").count();

    await run(page, "notes teaching");

    const teachingChip = page.locator('[data-feed-controls] input[type="checkbox"][value="teaching"]');
    await expect(teachingChip).toBeChecked({ timeout: 10_000 });
    await expect(page).toHaveURL(/[?&]tag=teaching\b/);
    await expect(page.locator(".note-card:not([hidden])").first()).toBeVisible();
    expect(await page.locator(".note-card[hidden]").count()).toBeGreaterThan(0);
    expect(await page.locator(".note-card[hidden]").count()).toBeLessThan(totalCards);
  });

  test("`archive BREAD CI` drives the island's real Archive buttons for every CI letter", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/mail");
    await terminalReady(page);
    expect(CI_IDS.length).toBeGreaterThan(1);   // the fixture must keep this a real BATCH

    await run(page, "archive BREAD CI");

    for (const id of CI_IDS) {
      await expect(page.locator(`a.mailbox__item[href="#msg-${id}"]`))
        .toHaveAttribute("data-folder", "archive", { timeout: 15_000 });
    }
    await expect(page.locator('[data-mailbox-folders] [data-folder="inbox"] .mailbox__folder-count'))
      .toHaveText(String(INBOX_TOTAL - CI_IDS.length));
    await expect(page.locator(".assistant__log")).toContainText(`Archived ${CI_IDS.length}`);
    await expect(page.locator(".assistant__log")).toContainText("BREAD CI");
  });

  test("`notes` with no topic is a local usage error — nothing is routed", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/notes");
    await terminalReady(page);

    await run(page, "notes");

    await expect(page.locator('[data-surface="console"]')).toContainText("notes about what?");
    await expect(page).not.toHaveURL(/[?&]tag=/);   // nothing was routed
  });
});
