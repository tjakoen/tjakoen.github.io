// e2e/loop.spec.ts — the /loop demo, exercised through a real browser. This is the only
// tier that validates the CLIENT dispatcher (grain/scripts/ai-dispatch.js): a real click /
// keypress → POST /intent → SSE op → DOM mutation, plus the native <dialog> palette.
import { test, expect } from "@playwright/test";

test.describe("/loop — the desk", () => {
  test("human: typing a request + Enter makes the desk reply in the reflection line", async ({ page }) => {
    await page.goto("/loop");
    const input = page.locator('input[data-surface="ask-input"]');
    await input.fill("plan my thursday");
    await input.press("Enter");
    // round-trip: dispatcher → /intent → reasoner → SSE type ops → applyType writes the line
    await expect(page.locator('[data-surface="reflection"]')).toContainText("Noted");
  });

  test("⌘K opens the command palette <dialog>, Escape closes it", async ({ page }) => {
    await page.goto("/loop");
    const palette = page.locator("dialog.cmdk");
    await expect(palette).toBeHidden();
    await page.keyboard.press("ControlOrMeta+k");
    await expect(palette).toBeVisible();
    await expect(page.locator("dialog.cmdk input")).toBeFocused();   // native focus-trap moved focus in
    await page.keyboard.press("Escape");
    await expect(palette).toBeHidden();                              // native Escape-to-close
  });

  test('"Watch the desk work" raises the spotlight and writes the plan list', async ({ page }) => {
    await page.goto("/loop");
    await page.getByRole("button", { name: "Watch the desk work" }).click();
    await expect(page.locator(".ai-backdrop.is-on")).toBeVisible();          // the desk is acting
    await expect(page.locator('[data-surface="plan-item:1"]'))               // it drafts the plan…
      .toContainText("Deep-work", { timeout: 20_000 });
    await expect(page.locator(".ai-backdrop")).not.toHaveClass(/is-on/, { timeout: 30_000 });   // …then hands back
  });

  test("takeover: the terminal opens and narrates the run (action badges) while the chat previews alongside", async ({ page }) => {
    await page.goto("/loop");
    const shell = page.locator(".app-shell");
    await page.getByRole("button", { name: "Watch the desk work" }).click();

    await expect(shell).toHaveAttribute("data-acting", "true");                       // the acting bar lights up
    // the desk keeps the docked terminal OPEN once it acts, so the narration stays visible instead of
    // collapsing behind the "Terminal ▸" bar (site.js mirrors data-acting → data-console-open).
    await expect(shell).toHaveAttribute("data-console-open", "");
    await expect(page.locator(".console__feed")).toBeVisible();
    // the chat's thinking box shows a small LIVE PREVIEW of the same output, alongside the open terminal
    await expect(page.locator("[data-terminal-preview]")).toContainText(/\w/, { timeout: 15_000 });
    // …and the open terminal narrates the run as action badges
    await expect(page.locator('.console__box [data-surface="console"] .action-badge').first()).toBeVisible({ timeout: 15_000 });
    await expect(shell).not.toHaveAttribute("data-acting", "true", { timeout: 30_000 });  // hands back at the end
  });

  test("takeover: the chat (communication) stays visible while the terminal shows the thinking", async ({ page }) => {
    await page.goto("/loop");
    const shell = page.locator(".app-shell");
    await page.getByRole("button", { name: "Watch the desk work" }).click();
    await expect(shell).toHaveAttribute("data-acting", "true");
    // the chat stays put — it no longer collapses during a run
    await expect(page.locator('.app-shell__aside [data-surface="chat-log"]')).toBeVisible();
    // and the compact thinking box is shown alongside it
    await expect(page.locator(".chat-thinking")).toBeVisible();
  });

  test("takeover: you can prepare a chat message mid-run without interrupting the desk", async ({ page }) => {
    await page.goto("/loop");
    const shell = page.locator(".app-shell");
    await page.getByRole("button", { name: "Watch the desk work" }).click();
    await expect(shell).toHaveAttribute("data-acting", "true");

    // the chat is visible throughout the run — typing in it is not an interrupt (ai-dispatch
    // ignores clicks on the desk's own surfaces: the aside + the console)
    const input = page.locator('[data-surface="chat-input"]');
    await input.click();
    await input.fill("do this next");
    await expect(page.locator("dialog.ai-confirm")).toBeHidden();
    await expect(input).toHaveValue("do this next");
  });
});
