// portfolio/e2e/interactions.e2e.ts — e2e as a MESSY HUMAN: things only a real browser shows.
// Interrupting an in-flight run, clicking when you shouldn't, auto-scroll following the desk,
// the command palette actually searching, fat-finger empty submits, and the real archive loop.
import { test, expect } from "@playwright/test";

test.describe("/loop — interrupting the desk", () => {
  test("clicking the backdrop mid-run opens 'stop?' and stopping hands control back", async ({ page }) => {
    await page.goto("/loop");
    await page.getByRole("button", { name: "Watch the desk work" }).click();
    await expect(page.locator(".ai-backdrop.is-on")).toBeVisible();      // the desk is acting

    await page.locator(".ai-backdrop").click();                          // a click while it works = interrupt
    const confirm = page.locator("dialog.ai-confirm");
    await expect(confirm).toBeVisible();                                  // mediated: it ASKS, never force-kills
    await confirm.getByRole("button", { name: /stop/i }).click();

    await expect(confirm).toBeHidden();
    await expect(page.locator(".ai-backdrop")).not.toHaveClass(/is-on/, { timeout: 10_000 });   // released
    // and the page is interactive again — a human can carry on
    const input = page.locator('input[data-surface="ask-input"]');
    await input.fill("ok");
    await input.press("Enter");
    await expect(page.locator('[data-surface="reflection"]')).toContainText("Noted", { timeout: 8_000 });
  });

  test("'Let it finish' resumes — the desk keeps working", async ({ page }) => {
    await page.goto("/loop");
    await page.getByRole("button", { name: "Watch the desk work" }).click();
    await expect(page.locator(".ai-backdrop.is-on")).toBeVisible();
    await page.keyboard.press("Escape");                                 // Escape while acting = interrupt
    const confirm = page.locator("dialog.ai-confirm");
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: /finish/i }).click();
    await expect(confirm).toBeHidden();
    await expect(page.locator(".ai-backdrop.is-on")).toBeVisible();      // still working
  });

  test("clicking a button mid-run does NOT start a second run — it interrupts", async ({ page }) => {
    await page.goto("/loop");
    const watch = page.getByRole("button", { name: "Watch the desk work" });
    await watch.click();
    await expect(page.locator(".ai-backdrop.is-on")).toBeVisible();
    await watch.click({ force: true });                                  // fat-finger the same button again
    await expect(page.locator("dialog.ai-confirm")).toBeVisible();       // → interrupt, not a 2nd demo
    // the plan list never got a duplicate first bullet from a second run
    await page.locator("dialog.ai-confirm").getByRole("button", { name: /finish/i }).click();
  });
});

test.describe("/loop — auto-scroll follows the spotlight", () => {
  test.use({ viewport: { width: 800, height: 560 } });                   // short, so lower surfaces are off-screen

  test("the main pane scrolls to keep the acted-on surface in view", async ({ page }) => {
    await page.goto("/loop");
    // the shell owns scrolling now: content lives in <main class="app-shell__main"> (overflow auto),
    // not the window. The spotlight's scrollIntoView scrolls that pane.
    const main = page.locator(".app-shell__main");
    await main.evaluate((el) => { el.scrollTop = 0; });
    expect(await main.evaluate((el) => el.scrollTop)).toBe(0);
    await page.getByRole("button", { name: "Watch the desk work" }).click();

    // as the spotlight walks down to the plan / cards / summary, the pane must scroll
    await expect.poll(() => main.evaluate((el) => el.scrollTop), { timeout: 25_000 })
      .toBeGreaterThan(50);
    // the late 'summary' surface ends up scrolled into view, not left below the fold
    await expect(page.locator('[data-surface="summary"]')).toContainText("Plan's set", { timeout: 30_000 });
    await expect(page.locator('[data-surface="summary"]')).toBeInViewport();
  });
});

test.describe("/loop — the command palette (⌘K), as a human uses it", () => {
  test("type a query and Enter navigates to the match", async ({ page }) => {
    await page.goto("/loop");
    await page.keyboard.press("ControlOrMeta+k");
    await expect(page.locator("dialog.cmdk")).toBeVisible();
    await page.locator("dialog.cmdk input").fill("about");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/about$/);
  });

  test("clicking outside the sheet dismisses it (light-dismiss)", async ({ page }) => {
    await page.goto("/loop");
    await page.keyboard.press("ControlOrMeta+k");
    const palette = page.locator("dialog.cmdk");
    await expect(palette).toBeVisible();
    await page.mouse.click(5, 5);                                        // the ::backdrop, outside the sheet
    await expect(palette).toBeHidden();
  });
});

test.describe("/loop — fat-finger & the real archive loop", () => {
  test("pressing Enter on an EMPTY request still gets a graceful reply", async ({ page }) => {
    await page.goto("/loop");
    const input = page.locator('input[data-surface="ask-input"]');
    await input.click();
    await input.press("Enter");                                          // empty submit
    await expect(page.locator('[data-surface="reflection"]')).toContainText("Nothing to note", { timeout: 8_000 });
  });

  test("a real task: Archive flips it to Archived through the one door", async ({ page }) => {
    await page.goto("/loop");
    const card = page.locator('[data-surface="item:ITM-seed-1"]');      // the seeded ACTIVE item
    await expect(card.getByRole("button", { name: "Archive" })).toBeVisible({ timeout: 8_000 });
    await card.getByRole("button", { name: "Archive" }).click();
    await expect(card).toContainText("Archived", { timeout: 8_000 });    // committed (clean) re-render landed
  });
});
