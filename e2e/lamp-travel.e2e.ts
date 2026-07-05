// portfolio/e2e/lamp-travel.e2e.ts — CONFORMANCE: the spotlight lamp actually TRAVELS.
// Guards the class of bug where a motion token (--ai-focus-move) exists but the mechanism
// can't render motion (grain/CLAUDE.md lesson 9): a class-swap "spotlight" produced exactly
// one rect per surface — a teleport — while the docs promised a glide. So this asserts the
// MOTION itself: during a demo run the lamp's rect must interpolate through many positions,
// and the run must release the veil on its own (lesson 7 — natural-completion release).
import { test, expect } from "@playwright/test";

test("the lamp glides between surfaces (interpolated rects, not teleports) and releases", async ({ page }) => {
  await page.goto("/grain");
  await page.evaluate(() => {
    const w = window as unknown as { __rects: Set<string>; };
    w.__rects = new Set();
    const tick = () => {
      const lamp = document.querySelector(".ai-lamp");
      if (lamp?.classList.contains("is-on")) {
        const r = lamp.getBoundingClientRect();
        w.__rects.add(`${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}`);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.click('[data-action="demo.run"]');
  await expect(page.locator(".ai-backdrop.is-on")).toBeVisible();          // it enters "acting"

  // natural completion: the veil must drop on its own (no stop click)
  await expect(page.locator(".ai-backdrop.is-on")).toBeHidden({ timeout: 40_000 });

  // travel: the scenario visits ~6 surfaces; a teleporting lamp yields ~1 rect per surface.
  // A gliding lamp interpolates — demand an order of magnitude more distinct positions.
  const distinct = await page.evaluate(() => (window as unknown as { __rects: Set<string> }).__rects.size);
  expect(distinct).toBeGreaterThan(30);
});
