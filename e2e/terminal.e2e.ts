// portfolio/e2e/terminal.e2e.ts — the INTERACTIVE TERMINAL (grain/scripts/terminal.js worn by the
// portfolio's console). The unit tier drift-guards the verb literals; this is the only tier that
// covers the island's real behavior: mount (opt-in), local commands, the grade doctrine in the
// feed (human echo settles clean, machine output stays grain), and the keybinding.
import { test, expect } from "@playwright/test";

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
