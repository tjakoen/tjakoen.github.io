// portfolio/e2e/portfolio-shell.e2e.ts — the PORTFOLIO's unified workspace shell (the BREAD frame:
// grain shell primitives + the site nav + the site-wide theme toggles), tested on the home (/), which
// is the first page migrated into the frame (Phase 4). Lives here because the e2e runner drives the
// app from the repo root; on the split it travels with the portfolio's own repo.
import { test, expect } from "@playwright/test";

test.describe("the portfolio workspace shell (BREAD frame, on /)", () => {
  test("renders TJ's Desk chrome + the explorer rail as plain-hypermedia nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".rail-head")).toContainText("TJ's Desk");
    // THE EDITOR v2: the rail is the EXPLORER — a file tree of the real sources, every file a
    // real <a href> (works with no JS; SEO-safe) — plus the fixed APP links at the bottom.
    await expect(page.locator(".side-rail .file-tree")).toBeAttached();
    await expect(page.locator('.file-tree a[href="/"]')).toContainText("index.html");
    await expect(page.locator('.file-tree a[href="/grain/docs/grain"]')).toContainText("GRAIN.md");
    // the activity-bar is icon-only (aria-label is the name): the Explorer toggle at the top,
    // then the fixed APP links below a spacer (VS Code's bottom icon group), never hidden by the
    // explorer's own collapse/mobile-drawer state.
    await expect(page.locator('.activity-bar__item[data-shell="rail-toggle"]')).toHaveAttribute("aria-label", "Explorer");
    for (const [label, href] of [["Calendar", "/calendar"], ["Mail", "/mail"], ["Catalog", "/catalog"], ["Profile", "/about"]] as const)
      await expect(page.locator(`.activity-bar__item[href="${href}"]`)).toHaveAttribute("aria-label", label);
    // the assistant + console live on the page — the site-wide AI's home
    await expect(page.locator('.app-shell__aside [data-surface="chat-log"]')).toBeAttached();
    await expect(page.locator('.app-shell__console [data-surface="console"]')).toBeAttached();
  });

  test("topbar toggles cycle theme + flip light/dark site-wide (tokens on <html>)", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    // theme-cycle rotates the data-themes list: sourdough (default, no attr) → baguette → brioche
    await page.locator("[data-cycle-theme]").click();
    await expect(html).toHaveAttribute("data-theme", "baguette");
    await page.locator("[data-cycle-theme]").click();
    await expect(html).toHaveAttribute("data-theme", "brioche");
    // light/dark toggle sets data-color-scheme
    await page.locator("[data-toggle-scheme]").click();
    await expect(html).toHaveAttribute("data-color-scheme", /^(light|dark)$/);
  });
});
