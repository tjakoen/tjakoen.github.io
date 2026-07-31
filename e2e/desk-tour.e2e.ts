// tjakoen.github.io/e2e/desk-tour.e2e.ts — A2 GUIDED TOUR. Same headless-Chromium-has-no-WebGPU setup
// as desk-actions.e2e.ts (the desk model is offline, so this only exercises the ZERO-MODEL tour path —
// tour.ts's stop list, actions.ts's tour-start/tour-stop routing, the reasoner's first leg, and the
// door's runTourLeg for every leg after). Deterministic throughout: no download, no generation, so the
// only real "slowness" here is the tour's OWN named pacing (TOUR_DWELL_MS + NAV_GLIDE_MS below mirror
// tour.ts / desk-reasoner.ts's real values — kept local rather than imported, since this file drives
// the built site through the browser, not the TS source module graph).
import { test, expect, type Page } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";

// Mirrors tour.ts's TOUR_DWELL_MS (4000) and desk-reasoner.ts's NAV_GLIDE_MS (550) — the two named
// knobs that pace a hop between stops. Generous multipliers below give CI slack without the test
// itself waiting forever on a genuinely broken tour.
const TOUR_DWELL_MS = 4000;
const NAV_GLIDE_MS = 550;
const HOP_TIMEOUT = 20_000;   // one hop = a dwell + a glide + page-load overhead; well clear of both

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
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");
}

const tourCursor = (page: Page): Promise<string | null> =>
  page.evaluate(() => sessionStorage.getItem("desk-tour"));

test.describe("A2 guided tour (deterministic, no model needed)", () => {
  test("the full walk: / → /grain → /batch → /notes, ending with the closing line and a cleared cursor", async ({ page }) => {
    test.setTimeout(90_000);   // three hops, each a dwell + a glide — a real walk takes real time
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "take the tour");

    await page.waitForURL("**/grain", { timeout: HOP_TIMEOUT });
    await expect(page.locator(".assistant__log")).toContainText("Second stop");
    await page.waitForURL("**/batch", { timeout: HOP_TIMEOUT });
    await expect(page.locator(".assistant__log")).toContainText("Third stop");
    await page.waitForURL("**/notes", { timeout: HOP_TIMEOUT });
    await expect(page.locator(".assistant__log")).toContainText("That's the tour");

    // The announce lands early in runArrival's own choreography (a ~450ms wait in); runTourLeg (which
    // clears the cursor) only runs once runArrival's WHOLE replay finishes (its own trailing ~1.5s
    // spotlight hold) — so the text can be visible slightly before the cursor is cleared. Poll, don't
    // assert instantly.
    await expect.poll(() => tourCursor(page)).toBeNull();   // the last stop cleans up its own cursor
  });

  test("the stop affordance: asking to stop mid-dwell clears the cursor and the walk never continues", async ({ page }) => {
    test.setTimeout(60_000);
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "take the tour");
    await page.waitForURL("**/grain", { timeout: HOP_TIMEOUT });

    // Still well inside the dwell window on /grain — stop the tour before the door would advance it.
    await ask(page, "stop the tour");
    await expect.poll(() => tourCursor(page)).toBeNull();
    await expect(page.locator(".assistant__log")).toContainText("stopping here");

    // Wait past the ORIGINAL dwell + glide the door would have used to advance — confirm it didn't.
    await page.waitForTimeout(TOUR_DWELL_MS + NAV_GLIDE_MS + 1_000);
    expect(new URL(page.url()).pathname).toBe("/grain");
  });

  test("clarify integration: a vague 'show me around' offers the tour as its first choice, and picking it starts the walk", async ({ page }) => {
    test.setTimeout(60_000);
    await clientDeskEverywhere(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "show me around");

    const choices = page.locator(".assistant__log [data-choices] .chat-choice");
    await expect(choices.first()).toBeAttached();
    const tourChoice = page.locator(".assistant__log .chat-choice", { hasText: "Take the tour" });
    await expect(tourChoice).toBeAttached();

    // dispatchEvent, not click: the log is display:none offline (no WebGPU here), same reasoning as
    // desk-actions.e2e.ts's clarify test — the choice's real click handler still runs the pick-through-
    // the-door path even though the surface has no layout box to target with a real pointer click.
    await tourChoice.first().dispatchEvent("click");

    await page.waitForURL("**/grain", { timeout: HOP_TIMEOUT });
  });

  test("abandon: a stale/mismatched cursor is cleared on arrival instead of hijacking navigation", async ({ page }) => {
    await clientDeskEverywhere(page);
    // Hand-plant a cursor for stop 1 (/grain) but land on /notes directly — as if the visitor had
    // wandered off mid-tour in an earlier tab, or the tour had been abandoned some other way.
    await page.addInitScript(() => sessionStorage.setItem("desk-tour", JSON.stringify({ at: 1 })));
    await page.goto("/notes");
    await deskReady(page);

    // The door's runTourLeg sees the current route (/notes) doesn't match the cursor's stop (/grain)
    // and clears it rather than acting on a mismatch — give it a moment to run past the arrival replay.
    await expect.poll(() => tourCursor(page)).toBeNull();
    // No navigation was triggered by the stale cursor — still on /notes.
    expect(new URL(page.url()).pathname).toBe("/notes");
  });
});
