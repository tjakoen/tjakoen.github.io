// portfolio/e2e/visual.e2e.ts — VISUAL REGRESSION baseline (the guard for "a tiny UI tweak
// silently broke the layout"). The other e2e specs assert BEHAVIOR (a click reaches the door,
// the spotlight raises); none of them would catch a shifted margin, a dropped border, a broken
// grid. This one pins the *pixels* of the key static screens so a visual regression fails loudly.
//
//   bun run test:e2e visual                      # compare against the committed baselines
//   bun run test:e2e visual --update-snapshots   # re-bless after an INTENTIONAL visual change
//
// Baselines live in visual.e2e.ts-snapshots/ and are committed. They are PLATFORM-SPECIFIC
// (Playwright names them per-OS, e.g. *-darwin.png) — regenerate on the platform CI runs on if
// that ever differs from the author's machine. Only the STATIC, deterministic screens are here:
// the AI-acting / mid-typing states are non-deterministic by nature (a frame of a stream) and
// belong in the behavior specs + `bun run shots`, not a pixel baseline.
import { test, expect } from "@playwright/test";

// Freeze the two sources of per-run pixel jitter: (1) the site.js typed chat greeting (a JS
// typewriter that only fires on a fresh cache — seed the stored keys so it's skipped and the
// chat shows its stable empty state); (2) CSS animation/transition (Playwright's `animations:
// "disabled"` handles those at snapshot time). Init script runs before any page script, so the
// greeting gate (`get("tj.chat") == null`) is already false when site.js checks it.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("tj.chat", "");          // greeting skipped → empty-state chat (deterministic)
      localStorage.setItem("tj.terminal", "");      // no restored console noise
      localStorage.setItem("tj.welcome-startup", "off");
    } catch { /* private mode — greeting will type, snapshot may flake; acceptable */ }
  });
});

// A small per-pixel tolerance absorbs sub-pixel font antialiasing across runs while still
// catching real layout shifts (a moved element trips far more than 1% of the frame).
const SHOT = { fullPage: true, animations: "disabled", maxDiffPixelRatio: 0.01 } as const;

// `freeze`, when set, pins the clock before navigation — /calendar (Pass 2 — Calendar) plots the
// REAL current month/week, so an unfrozen clock's today ring moves every day and breaks the
// baseline monthly. 2026-07-12 sits after every fixture event (data/desk-feed.json, the real note
// frontmatter) but in the same month as all of them, so the baseline shows a populated month
// rather than an empty one.
const screens: Array<[name: string, path: string, freeze?: Date]> = [
  ["welcome", "/"],          // THE EDITOR shell — the most-seen surface
  ["loop", "/loop"],         // the reference "watch the AI act" screen, idle
  ["grain", "/grain"],       // the GRAIN showcase
  ["batch", "/batch"],       // the BATCH showcase
  ["catalog", "/catalog"],   // the generated component catalog
  ["about", "/about"],       // a plain content page
  ["notes", "/notes"],       // the /notes feed (Pass 1 — Notes: a portfolio route override)
  ["calendar", "/calendar", new Date("2026-07-12T12:00:00")],   // Pass 2 — Calendar (time frozen, see above)
];

for (const [name, path, freeze] of screens) {
  test(`${name} (${path}) matches its visual baseline`, async ({ page }) => {
    if (freeze) await page.clock.setFixedTime(freeze);
    await page.goto(path, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);   // no FOUC frame in the baseline
    await expect(page).toHaveScreenshot(`${name}.png`, SHOT);
  });
}
