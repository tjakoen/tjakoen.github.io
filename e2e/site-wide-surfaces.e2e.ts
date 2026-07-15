// portfolio/e2e/site-wide-surfaces.e2e.ts — proves the command surfaces are SITE-WIDE, not
// /grain-only. Terminal + Catalog ride the shared <portfolio-frame> + PAGE_ASSETS, so they must
// mount on any page. Also covers the portfolio `content` command (desk-commands.js), the content
// lens that complements grain's operable-surface `context`.
import { test, expect } from "@playwright/test";

test.describe("command surfaces are site-wide (not /grain-only)", () => {
  test("the terminal mounts on a non-grain page (/mail)", async ({ page }) => {
    await page.goto("/mail");
    const box = page.locator('.console__box[data-terminal="interactive"]');
    await expect(box.locator(".console__cmd")).toBeAttached();      // the injected input row
    await page.keyboard.press("Control+`");
    await expect(page.locator(".app-shell")).toHaveAttribute("data-console-open", "");
    await expect(box.locator(".console__cmd")).toBeFocused();
  });

  test("the Catalog pane embeds /catalog on a non-grain page (/notes)", async ({ page }) => {
    await page.goto("/notes");
    // switch the assistant to Catalog mode — catalog-peek.js lazy-embeds /catalog on first open
    await page.locator('[data-shell-mode="catalog"]').click();
    await expect(page.locator('.assistant[data-mode="catalog"]')).toBeVisible();
    const frame = page.locator(".catalog-pane__frame");
    await expect(frame).toHaveAttribute("src", /\/catalog/);         // the iframe got its source
  });

  test("`content` prints the page's readable text — the slice the desk reads", async ({ page }) => {
    await page.goto("/notes/ten-times-zero");
    await page.keyboard.press("Control+`");
    const input = page.locator(".console__cmd");
    await input.fill("content");
    await input.press("Enter");
    const feed = page.locator('[data-surface="console"]');
    await expect(feed).toContainText("chars of readable text");      // the header line
    await expect(feed).toContainText("Vibe coder");                  // real prose from THIS page
    // and it must not have swallowed the escaped-quote (A2 fix): backslash-quote never appears
    await expect(feed).not.toContainText('\\"Vibe coder');
  });
});
