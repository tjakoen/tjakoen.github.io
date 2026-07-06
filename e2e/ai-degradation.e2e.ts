// tjakoen.github.io/e2e/ai-degradation.e2e.ts — THE EDITOR v3: HONEST offline degradation. When the
// door's reply channel can't come up, the AI must not pretend — presence goes offline, AI controls
// visibly disable (grain's [data-ai-run]/[data-ai-gate] gating), and the demo says why. This is the
// contract for the real model later (presence = transport health). We simulate a broken /stream.
import { test, expect } from "@playwright/test";

test.describe("THE EDITOR v3 — offline degradation + presence gating", () => {
  test("a broken /stream takes the desk offline: controls disable + the demo says why", async ({ page }) => {
    // kill the SSE reply channel — the EventSource connection fails (es.onerror → markOnline(false))
    await page.route("**/stream*", (route) => route.abort());
    await page.goto("/grain");

    // presence flips to offline (by outcome), and the status-bar wording follows
    await expect(page.locator("body")).toHaveAttribute("data-ai-online", "false");
    await expect(page.locator(".presence__off")).toBeVisible();
    await expect(page.locator(".presence__on")).toBeHidden();

    // the "Watch the AI act" trigger is visibly disabled (grain gating: pointer-events off)
    const watch = page.locator("[data-ai-run]");
    await expect(watch).toHaveCSS("pointer-events", "none");
    // the composer (data-ai-gate) is gated too
    await expect(page.locator("[data-ai-gate]")).toHaveCSS("pointer-events", "none");
    // the degraded copy explains why
    await expect(page.locator(".offline-hint")).toBeVisible();
  });

  test("presence STAR + wording read online when the channel is healthy", async ({ page }) => {
    await page.goto("/grain");
    await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");
    await expect(page.locator(".presence__on")).toBeVisible();
    await expect(page.locator(".offline-hint")).toBeHidden();
    await expect(page.locator("[data-ai-run]")).not.toHaveCSS("pointer-events", "none");
  });
});
