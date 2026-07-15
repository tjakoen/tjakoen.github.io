// portfolio/e2e/desk-arrival.e2e.ts — page-arrival awareness PLUMBING (the model-driven greeting
// itself needs WebGPU, a manual gate; headless CI has none). Covers: the desk-warm flag is set on the
// first chat.send, and arrival is a SAFE no-op when the model can't run (static starter chips stand,
// no page error) — so a nav never breaks and an un-engaged visitor is never forced to load the model.
import { test, expect } from "@playwright/test";

test.describe("page-arrival awareness (plumbing)", () => {
  test("the desk-warm flag is set on the first chat.send (a chip click)", async ({ page }) => {
    await page.goto("/");
    expect(await page.evaluate(() => sessionStorage.getItem("desk-warm"))).toBeNull();
    await page.locator(".assistant__suggest [data-suggest-ask]").first().click();
    await expect
      .poll(() => page.evaluate(() => sessionStorage.getItem("desk-warm")))
      .toBe("1");
  });

  test("arrival is a safe no-op without WebGPU: static chips stand, no page error", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto("/");
    // pretend the visitor already engaged the desk this session
    await page.evaluate(() => sessionStorage.setItem("desk-warm", "1"));
    await page.goto("/notes");   // warm nav → the door calls arrive() → no WebGPU → no-op
    // the static starter chips are still there (arrival never replaced them)
    await expect(page.locator("[data-suggest-chips] [data-suggest-ask]")).toHaveCount(4);
    expect(errors).toEqual([]);
  });

  test("an un-engaged visitor (never warm) navigates with the static chips untouched", async ({ page }) => {
    await page.goto("/notes");
    expect(await page.evaluate(() => sessionStorage.getItem("desk-warm"))).toBeNull();
    await expect(page.locator("[data-suggest-chips] [data-suggest-ask]")).toHaveCount(4);
  });
});
