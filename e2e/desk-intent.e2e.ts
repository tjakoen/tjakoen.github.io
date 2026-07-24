// tjakoen.github.io/e2e/desk-intent.e2e.ts — C1 VISITOR-INTENT ONBOARDING. Same headless-Chromium-
// has-no-WebGPU setup as desk-notes-filter.e2e.ts / desk-tour.e2e.ts for the DETERMINISTIC path
// (actions.ts's intent-ask/intent-set routing, desk-reasoner.ts's deterministic ask + per-intent
// effects, desk-door.ts's sessionStorage-backed nag-guard) — zero model, no download, no generation.
import { test, expect, type Page } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";

async function clientDeskEverywhere(page: Page) {
  await page.route("**/*", async (route, req) => {
    if (req.resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    if (!(res.headers()["content-type"] || "").includes("text/html")) return route.fulfill({ response: res });
    const html = (await res.text()).replace(/<body\b/, `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`);
    return route.fulfill({ response: res, body: html });
  });
  await page.addInitScript(() => {   // force the no-WebGPU (offline model) path deterministically
    try { Object.defineProperty(navigator, "gpu", { value: undefined, configurable: true }); } catch { /* absent */ }
  });
}

const ask = (page: Page, text: string) =>
  page.evaluate((t) => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
    .grain.door.submit("chat.send", "chat-log", { text: t }), text);

async function deskReady(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");   // the client door came up
}

const sessionValue = (page: Page, key: string): Promise<string | null> =>
  page.evaluate((k) => sessionStorage.getItem(k), key);

test.describe("C1 visitor-intent onboarding (deterministic, no model needed)", () => {
  test("first 'hi': the ask renders 3 choices and marks asked; 'Recruiter or hiring' lands on /resume with the role board spotlighted; a repeat 'hi' then falls to the ordinary clarify", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "hi");

    // dispatchEvent, not click: the log is display:none offline (no WebGPU here, same reasoning as
    // desk-actions.e2e.ts's clarify test), but the choice's real click handler still runs the
    // pick-through-the-door path even though the surface has no layout box a real pointer could hit.
    const choices = page.locator(".assistant__log [data-choices] .chat-choice");
    await expect(choices.first()).toBeAttached();
    expect(await choices.count()).toBe(3);
    await expect(page.locator(".assistant__log .chat-choice", { hasText: "Recruiter or hiring" })).toBeAttached();
    await expect(page.locator(".assistant__log .chat-choice", { hasText: "Developer curious about the stack" })).toBeAttached();
    await expect(page.locator(".assistant__log .chat-choice", { hasText: "Student of TJ" })).toBeAttached();
    // the nag-guard's own flag — the ask marks itself BEFORE rendering, so it's already set by now.
    expect(await sessionValue(page, "desk-intent-asked")).toBe("1");

    await page.locator(".assistant__log .chat-choice", { hasText: "Recruiter or hiring" }).first().dispatchEvent("click");

    await page.waitForURL("**/resume");
    expect(new URL(page.url()).pathname).toBe("/resume");
    expect(await sessionValue(page, "visitor-intent")).toBe("recruiter");

    // the arrival stash's surface is "role-board" (view/pages/resume.html's .board carries that
    // data-surface) — the destination door's runArrival replays the spotlight once it lands, then
    // releases it on its own after the hold (same choreography A1's cross-page deep-link uses).
    const roleBoard = page.locator('[data-surface="role-board"]');
    await expect(roleBoard).toHaveClass(/ai-spotlit/, { timeout: 5000 });
    await expect(roleBoard).not.toHaveClass(/ai-spotlit/, { timeout: 4000 });

    // A repeat "hi" — an intent is now set, so the nag-guard falls straight to the ordinary clarify
    // bubble (CLARIFY_CHOICES) instead of asking again.
    await ask(page, "hi");
    await expect(page.locator(".assistant__log .chat-choice", { hasText: "Take the tour" }).last()).toBeAttached();
    await expect(page.locator(".assistant__log .chat-choice", { hasText: "Recruiter or hiring" })).toHaveCount(1);   // no NEW intent ask rendered
  });

  test("student answer from '/': navigates to /notes?tag=teaching, landing with the filter already applied", async ({ page }) => {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "I'm a student of TJ's");

    await page.waitForURL(/\/notes\?tag=teaching\b/);
    expect(await sessionValue(page, "visitor-intent")).toBe("student");
    const teachingChip = page.locator('[data-feed-controls] input[type="checkbox"][value="teaching"]');
    await expect(teachingChip).toBeChecked({ timeout: 10_000 });   // the destination island's own applyQueryTags
    await expect(page.locator(".assistant__log")).toContainText("teaching");   // the arrival announce named it
  });
});
