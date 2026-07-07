// portfolio/e2e/notes-demo.e2e.ts — CONFORMANCE: the /notes "what have you been up to" run
// (DEMO-PLAN.md item 1, staged on /notes — NOTES-PAGE-PLAN.md idea 6). Same door, same
// demo.run verb as /grain's trigger; the reasoner's "notes" screen branch travels the real
// note surfaces (mill/serve.ts itemSurfacePrefix) and writes its digest into the SIDEBAR CHAT
// (owner feedback, NOTES-PAGE-PLAN.md 2026-07-07 — not a standalone card). Asserts the
// natural-completion release, not just that the run starts (grain/CLAUDE.md lesson 7).
import { test, expect } from "@playwright/test";

test("'See what's new' travels the newest notes, writes the digest into the chat (grain), and releases on its own", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/notes");

  const trigger = page.locator("[data-ai-run]");
  const before = await page.locator('[data-surface="chat-log"] .chat-message').count();
  await trigger.click();

  await expect(page.locator(".ai-backdrop.is-on")).toBeVisible({ timeout: 3000 });    // ops NOT dropped
  await expect(page.locator(".app-shell")).toHaveAttribute("data-acting", "true");    // the shell takes over
  await expect(page.locator(".app-shell__console .console__line").first())
    .toBeAttached({ timeout: 8000 });                                                 // narrating to the console

  // hands back by itself — the run must release on natural completion, not just on stop
  await expect(page.locator(".ai-backdrop.is-on")).toHaveCount(0, { timeout: 15000 });
  await expect(page.locator(".app-shell")).not.toHaveAttribute("data-acting", "true");
  await expect(trigger).not.toHaveAttribute("data-commit", "pending");

  // the digest landed in the chat — a fresh AI bubble, stays grain (AI-authored text stays grain)
  await expect(page.locator('[data-surface="chat-log"] .chat-message')).toHaveCount(before + 1);
  const reply = page.locator('[data-surface="chat-log"] .chat-message[data-role="ai"]').last();
  await expect(reply).toHaveAttribute("data-grade", "grain");
  await expect(page.locator('[data-surface="desk-note"]')).not.toBeEmpty();
});
