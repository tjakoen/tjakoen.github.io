// tjakoen.github.io/e2e/ia-nav.e2e.ts — CONFORMANCE: Phase 4 (IA/navigation correctness). Two
// things the corpus already carries but the nav didn't surface: the published Standards subpages
// (site.js's [data-tree-fill] mechanism, scripts/site.js ~124-140, fetches /search.json and fills
// any [data-tree-fill="/prefix"] box with every page under that prefix) and the layer docs
// (/grain/docs, /batch/docs), whose tabs used to collide on the label "docs" (tabs.js falls back
// to the last path segment when no data-tab-label source entry matches). Lives here because the
// e2e runner drives the app from the repo root; travels with the portfolio on the split.
import { test, expect } from "@playwright/test";

test.describe("Phase 4 — IA/navigation correctness", () => {
  test("the Standards/ tree box fills in from the corpus (site.js [data-tree-fill])", async ({ page }) => {
    await page.goto("/docs");
    const fillBox = page.locator('[data-tree-fill="/standards"]');
    await expect(fillBox).toBeAttached();
    // the fill is async (fetch("/search.json")) — wait for it to land rather than racing it
    await expect(fillBox.locator("a.file-tree__file")).not.toHaveCount(0, { timeout: 5_000 });
    const hrefs = await fillBox.locator("a.file-tree__file").evaluateAll((els) => els.map((a) => a.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThanOrEqual(9);   // the 9 published /standards/* subpages
    for (const href of hrefs) expect(href).toMatch(/^\/standards\//);
    // the index link sits above the fill box, outside it (a real entry, not corpus-derived)
    await expect(page.locator('.file-tree a[href="/standards"][data-variant="index"]')).toBeAttached();
  });

  test("/grain/docs and /batch/docs open tabs with distinct labels (no more shared 'docs')", async ({ page }) => {
    await page.goto("/grain/docs");
    await page.goto("/batch/docs");
    const grainTab = page.locator('[data-open-tabs] a[href="/grain/docs"]');
    const batchTab = page.locator('[data-open-tabs] a[href="/batch/docs"]');
    await expect(grainTab).toBeAttached();
    await expect(batchTab).toBeAttached();
    const grainLabel = (await grainTab.textContent())?.trim();
    const batchLabel = (await batchTab.textContent())?.trim();
    expect(grainLabel).not.toBe(batchLabel);
    expect(grainLabel).not.toBe("docs");
    expect(batchLabel).not.toBe("docs");
    expect(grainLabel).toContain("grain");
    expect(batchLabel).toContain("batch");
  });

  test("the pinned Welcome tab stays fully readable even when the strip auto-scrolls to a later tab", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("grain.tabs.open", JSON.stringify([
        "/grain", "/batch", "/mill", "/proof", "/pantry", "/greenroom",
        "/docs", "/reference", "/notes", "/loop", "/resume", "/about",
      ]));
    });
    await page.setViewportSize({ width: 390, height: 800 });   // narrow enough that the strip overflows
    await page.goto("/mill");   // site.js scrollIntoView("nearest")s this tab into view on load
    const pinned = page.locator('[data-open-tabs] a[data-pinned]');
    await expect(pinned).toContainText("Welcome");
    const box = await pinned.boundingBox();
    const barBox = await page.locator("[data-open-tabs]").boundingBox();
    expect(box).not.toBeNull();
    expect(barBox).not.toBeNull();
    // sticky-to-the-left: the pinned tab's own left edge sits at (or past) the strip's left edge —
    // never scrolled negative/behind it, which is what produced the "elcome" clip.
    expect(box!.x).toBeGreaterThanOrEqual(barBox!.x - 1);
  });
});
