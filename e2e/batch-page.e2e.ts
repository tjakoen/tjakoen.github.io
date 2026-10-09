import { test, expect } from "@playwright/test";

test("BATCH presents the portfolio audit with its scope and reproduction path", async ({ page }) => {
  await page.goto("/batch");

  const audit = page.locator(".batch-audit");
  await expect(audit).toContainText("October 9, 2026");
  await expect(audit).toContainText("211,553 bytes of JavaScript");
  await expect(audit).toContainText("745,209 total transferred bytes across 35 requests");
  await expect(audit).toContainText("cut 56,053 JavaScript bytes from the earlier run");
  await expect(audit).toContainText("not a benchmark of a minimal BATCH app");
  await expect(audit.locator('a[href="https://github.com/tjakoen/tjakoen.github.io/blob/main/audit/report.md"]'))
    .toBeVisible();
  await expect(audit).toContainText("bun run audit");
  await expect(page.locator(".card__title", { hasText: "Server-first, not no-JS" })).toBeVisible();
});
