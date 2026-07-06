// tjakoen.github.io/e2e/persistence.e2e.ts — THE EDITOR v3 resilience: dev-island state survives MPA
// navigation. The shell is an MPA (every nav is a real page load), so x-ray and the terminal's
// open-state would reset on each hop unless persisted (localStorage). These assert they don't.
import { test, expect } from "@playwright/test";

test.describe("THE EDITOR v3 — island state survives navigation", () => {
  test("x-ray: toggled on, it stays on across a page load", async ({ page }) => {
    await page.goto("/loop");
    await expect(page.locator("html")).not.toHaveAttribute("data-xray", "");
    await page.locator("[data-xray-toggle]").click();               // turn it on
    await expect(page.locator("html")).toHaveAttribute("data-xray", "");
    // navigate to another page — x-ray restores from storage on boot
    await page.goto("/grain");
    await expect(page.locator("html")).toHaveAttribute("data-xray", "");
    // turn it off; the off-state persists too
    await page.locator("[data-xray-toggle]").click();
    await page.goto("/loop");
    await expect(page.locator("html")).not.toHaveAttribute("data-xray", "");
  });

  test("terminal open-state: opened, it stays open across a page load; closed stays closed", async ({ page }) => {
    await page.goto("/loop");
    const shell = page.locator(".app-shell");
    await expect(shell).not.toHaveAttribute("data-console-open", "");
    // open the terminal (the title-bar terminal button)
    await page.locator('.window-bar [data-shell="console-toggle"]').click();
    await expect(shell).toHaveAttribute("data-console-open", "");
    await page.goto("/grain");
    await expect(page.locator(".app-shell")).toHaveAttribute("data-console-open", "");
    // close it again; the closed state persists
    await page.locator('.window-bar [data-shell="console-toggle"]').click();
    await page.goto("/loop");
    await expect(page.locator(".app-shell")).not.toHaveAttribute("data-console-open", "");
  });

  test("terminal GROW toggle: expands the console to fill the shell, persists, and auto-opens a closed console", async ({ page }) => {
    await page.goto("/loop");
    const shell = page.locator(".app-shell");
    const grow = page.locator('.console__grow');
    await expect(shell).not.toHaveAttribute("data-console-open", "");
    await expect(shell).not.toHaveAttribute("data-console-expanded", "");
    // growing a CLOSED console opens it too (growing something hidden makes no sense)
    await grow.click();
    await expect(shell).toHaveAttribute("data-console-open", "");
    await expect(shell).toHaveAttribute("data-console-expanded", "");
    // survives a page load
    await page.goto("/grain");
    await expect(page.locator(".app-shell")).toHaveAttribute("data-console-expanded", "");
    // collapsing persists too
    await page.locator('.console__grow').click();
    await page.goto("/loop");
    await expect(page.locator(".app-shell")).not.toHaveAttribute("data-console-expanded", "");
  });
});
