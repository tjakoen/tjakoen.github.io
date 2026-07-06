// tjakoen.github.io/e2e/editor-tabs.e2e.ts — THE EDITOR v2: the explorer file tree + the open-pages tab
// strip (grain file-tree + scripts/tabs.js worn by the portfolio frame). The strip is a
// localStorage PROJECTION of navigation over a plain MPA — these tests assert the projection
// (open/close/persist/pin) and the tree's honesty mechanics (collapsed folders, current-file
// marking, real-link navigation). Lives here because the e2e runner drives the app from the
// repo root; travels with the portfolio on the split.
import { test, expect } from "@playwright/test";

test.describe("THE EDITOR v2 — explorer + open tabs", () => {
  test("folders ship collapsed; the current page's ancestors unfold and the file is marked", async ({ page }) => {
    await page.goto("/bread");
    // the current file is marked and every ancestor <details> of it is open…
    const current = page.locator('.file-tree a[aria-current="page"]');
    await expect(current).toHaveAttribute("href", "/bread");
    // bread.html lives directly under portfolio/ (the 1:1 repo-root mirror) — that folder unfolds…
    await expect(page.locator('.file-tree > .file-tree__dir:has(> summary:text-is("portfolio/"))')).toHaveAttribute("open", "");
    // …while an unrelated top-level folder stays collapsed (collapsed-by-default doctrine).
    // NB exact summary text — :has-text would also match ancestors.
    await expect(page.locator('.file-tree > .file-tree__dir:has(> summary:text-is("batch/"))')).not.toHaveAttribute("open", "");
  });

  test("index files are dimmed + labeled by section; visiting opens a closable tab named for the section", async ({ page }) => {
    await page.goto("/");
    // Welcome is the PINNED first tab: current, with the pin marker and NO close affordance
    const pinned = page.locator('[data-open-tabs] a[data-pinned]');
    await expect(pinned).toHaveAttribute("aria-current", "page");
    await expect(pinned.locator(".tab__close")).toHaveCount(0);
    await expect(pinned.locator(".tab__pin")).toHaveCount(1);
    // the GRAIN index sits under the top-level grain/ folder (collapsed on "/"); open it and click
    await page.locator('.file-tree summary:text-is("grain/")').click();
    const grainIndex = page.locator('.file-tree a[href="/grain"]');
    await expect(grainIndex).toHaveAttribute("data-variant", "index");   // dimmed entry file
    await grainIndex.click();
    await expect(page).toHaveURL(/\/grain$/);
    // the visit is now an open tab, labeled by its data-tab-label (the SECTION, not "index.html")
    const tab = page.locator('[data-open-tabs] a[href="/grain"]');
    await expect(tab).toContainText("GRAIN");
    await expect(tab).not.toContainText("index.html");
    await expect(tab).toHaveAttribute("aria-current", "page");
  });

  test("collapsed-except-current at depth: on /grain/docs/grain the grain→docs chain unfolds, siblings stay shut", async ({ page }) => {
    await page.goto("/grain/docs/grain");
    // the whole ancestor chain is open…
    await expect(page.locator('.file-tree > .file-tree__dir:has(> summary:text-is("grain/"))')).toHaveAttribute("open", "");
    await expect(page.locator('.file-tree__dir:has(> summary > a[href="/grain/docs"])')).toHaveAttribute("open", "");
    // …but unrelated top-level siblings (portfolio/, batch/) stay collapsed
    await expect(page.locator('.file-tree > .file-tree__dir:has(> summary:text-is("portfolio/"))')).not.toHaveAttribute("open", "");
    await expect(page.locator('.file-tree__dir:has(> summary:text-is("batch/"))')).not.toHaveAttribute("open", "");
  });

  test("open tabs persist across navigation; × closes — active close falls back to a neighbor", async ({ page }) => {
    await page.goto("/bread");
    await page.goto("/mill");
    // both visits sit in the strip on the LATER page (the localStorage projection)
    await expect(page.locator('[data-open-tabs] a[href="/bread"]')).toBeAttached();
    const mill = page.locator('[data-open-tabs] a[href="/mill"]');
    await expect(mill).toHaveAttribute("aria-current", "page");
    // close a BACKGROUND tab: it leaves the strip, the page stays put
    await page.locator('[data-open-tabs] a[href="/bread"] .tab__close').click();
    await expect(page.locator('[data-open-tabs] a[href="/bread"]')).toHaveCount(0);
    await expect(page).toHaveURL(/\/mill$/);
    // close the ACTIVE tab: the strip navigates away from it (neighbor, else the pinned Welcome)
    await mill.locator(".tab__close").click();
    await expect(page).not.toHaveURL(/\/mill$/);
    // and the closed tab does NOT come back on the next page (it left the stored list)
    await expect(page.locator('[data-open-tabs] a[href="/mill"]')).toHaveCount(0);
  });

  test("the status-bar breadcrumb is linked: segments navigate, the last stays text", async ({ page }) => {
    await page.goto("/grain/docs/grain");
    const crumb = page.locator("[data-breadcrumb]");
    await expect(crumb.locator('a[href="/"]')).toContainText("tjakoen.github.io");
    await expect(crumb.locator('a[href="/grain"]')).toContainText("grain");
    await expect(crumb.locator('a[href="/grain/docs"]')).toContainText("docs");
    await expect(crumb.locator("a")).toHaveCount(3);   // the last segment is plain text
    await crumb.locator('a[href="/grain/docs"]').click();
    await expect(page).toHaveURL(/\/grain\/docs$/);
  });

  test("zero-JS fallback: the pinned tab renders and the tree still navigates", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.locator('[data-open-tabs] a[data-pinned]')).toContainText("Welcome");
    // native <details> unfold + a plain link — no JS anywhere in the path
    const siteDir = page.locator('.file-tree > .file-tree__dir:has(> summary:text-is("portfolio/"))');
    await siteDir.locator('> summary').click();
    await page.locator('.file-tree a[href="/bread"]').click();
    await expect(page).toHaveURL(/\/bread$/);
    await ctx.close();
  });
});
