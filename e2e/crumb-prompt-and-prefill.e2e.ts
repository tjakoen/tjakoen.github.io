// tjakoen.github.io/e2e/crumb-prompt-and-prefill.e2e.ts — P1b of plans/crumb-prefilled-demo.md: the
// portfolio-side proof for P0 (a step's `at` may declare query state and gets there in ONE
// navigation), P1 (a tour ends with a card that composes the next prompt) and P2 (a step may stage
// text into its own field, through the app's door, and says so).
//
// This file could not be committed green until `@tjakoen/crumb` shipped all three, because the
// portfolio consumes the published package rather than a workspace copy. It did at 0.1.9, so the
// version guard below is not ceremony: if a future pin regresses past any of these, the guard names
// the reason instead of leaving six assertions failing for no stated cause.
//
// The two tours under test are real review tours, not fixtures. That is deliberate — a fixture tour
// would prove the client works and say nothing about whether the tours people actually walk still do.
import { test, expect, type Page } from "@playwright/test";
import pkg from "../package.json" with { type: "json" };

type CrumbWin = Window & {
  crumb: { start(id: string, opts?: { frame?: boolean; mode?: string }): void; end(): void };
};

const PROMPT_TOUR = "review-prompt-card";   // P0 + P1: query state in `at`, and the `## prompt` card
const PREFILL_TOUR = "say-hello";           // P2: three steps, the last one stages a draft
const FIELD = '[data-surface="field:contact-message"]';
const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";

// The published package is the thing under test here, so state the floor once. This was written as
// an equality against "^0.1.9" and duly failed the moment crumb went to 0.1.10, which is the one
// thing a floor must never do: it reported a routine upgrade as a broken feature. Compare the
// numbers instead, so the guard fires when the pin goes BACKWARDS and stays quiet when it moves on.
const CRUMB_FLOOR = [0, 1, 9];
test("the pinned crumb is new enough to have heard of any of this", () => {
  const pinned = String(pkg.dependencies["@tjakoen/crumb"]).replace(/^\D+/, "").split(".").map(Number);
  expect(pinned).toHaveLength(3);
  const [a, b, c] = pinned, [x, y, z] = CRUMB_FLOOR;
  expect(a * 1e6 + b * 1e3 + c).toBeGreaterThanOrEqual(x * 1e6 + y * 1e3 + z);
});

const endTour = (page: Page) =>
  page.evaluate(() => (window as unknown as CrumbWin).crumb.end()).catch(() => { /* page already left */ });

test.describe("crumb P0 — a step's `at` may carry query state", () => {
  test("the tour is served with the query state its step declares", async ({ page }) => {
    await page.goto("/");
    const summary = await page.evaluate(async (id) => {
      const res = await fetch(`/crumb/tours/${id}.json`, { headers: { accept: "application/json" } });
      return res.json();
    }, PROMPT_TOUR);

    expect(summary.mode).toBe("dev");
    expect(summary.steps).toHaveLength(2);
    expect(summary.steps[1].at).toBe("/mail?subject=grain");
  });

  // The regression this whole phase started from: the client compared a target carrying a query
  // string against a bare pathname, so the two could never match. It navigated, the page loaded, it
  // navigated again, forever. Counting document navigations is the only assertion that can tell a
  // fixed hop from a loop that happens to be paused when the expect runs.
  test("a step with query state arrives in one navigation, and the URL settles", async ({ page }) => {
    await page.goto("/");

    let navigations = 0;
    page.on("framenavigated", (frame) => { if (frame === page.mainFrame()) navigations += 1; });

    await page.evaluate((id) => (window as unknown as CrumbWin).crumb.start(id, { frame: true, mode: "dev" }), PROMPT_TOUR);
    await page.locator('[data-crumb-goto="1"]').click();

    await expect(page).toHaveURL(/\/mail\?subject=grain$/);
    await expect(page.locator(".crumb-frame__count")).toHaveText("2 / 2");

    // Give a loop room to show itself: if resume() still disagreed with the address bar, this window
    // is long enough for several more hops.
    await page.waitForTimeout(1500);
    expect(navigations).toBe(1);
    await expect(page).toHaveURL(/\/mail\?subject=grain$/);

    await endTour(page);
  });

  test("a step that declares no query state leaves the host's own params alone", async ({ page }) => {
    await page.goto("/?keep=me");
    await page.evaluate((id) => (window as unknown as CrumbWin).crumb.start(id, { frame: true, mode: "dev" }), PROMPT_TOUR);
    await page.locator('[data-crumb-goto="0"]').click();

    await expect(page.locator(".crumb-frame__count")).toHaveText("1 / 2");
    await expect(page).toHaveURL(/\/\?keep=me$/);   // step 1's `at` is "/", which has no opinion on ?keep

    await endTour(page);
  });
});

test.describe("crumb P1 — the tour hands back a prompt", () => {
  test("the card sits one past the last step, in place of the step counter", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((id) => (window as unknown as CrumbWin).crumb.start(id, { frame: true, mode: "dev" }), PROMPT_TOUR);

    // index 2 on a two-step tour: the card, not a step
    await page.locator('[data-crumb-goto="2"]').click();
    await expect(page.locator(".crumb-frame__count")).toHaveCount(0);

    // The paste block ships COLLAPSED (crumb 0.1.10, owner's call): open, it pushed Finish off the
    // bottom of a card with no scroll of its own. The textarea stays in the DOM either way, so both
    // halves are worth asserting — shut by default, and reachable in one press.
    const paste = page.locator("details.crumb-sidebar__paste");
    await expect(paste).not.toHaveAttribute("open", "");
    await expect(page.locator(".crumb-sidebar__composed")).toBeHidden();
    await paste.locator("summary").click();
    await expect(page.locator(".crumb-sidebar__composed")).toBeVisible();
    await expect(page.locator(".crumb-sidebar__composed")).toHaveAttribute("readonly", "");

    // both asks the tour declared are on the card
    await expect(page.locator('[data-crumb-ask="reads-wrong"]')).toBeVisible();
    await expect(page.locator('[data-crumb-ask="next-tier"]')).toBeVisible();

    await endTour(page);
  });

  // The point of the card is that the composed text is the tour's OUTPUT. Unanswered tokens stay as
  // themselves rather than collapsing to an empty line, so a half-answered card is visibly half done.
  test("an answer composes into the prompt live, and an unanswered token stays visible", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((id) => (window as unknown as CrumbWin).crumb.start(id, { frame: true, mode: "dev" }), PROMPT_TOUR);
    await page.locator('[data-crumb-goto="2"]').click();

    const composed = page.locator(".crumb-sidebar__composed");
    await expect(composed).toHaveValue(/\{reads-wrong\}/);
    await expect(composed).toHaveValue(/tour review-prompt-card/);       // {tour} resolves without asking
    await expect(composed).toHaveValue(/Review: the tour hands back a prompt/);   // and so does {title}

    await page.locator('[data-crumb-ask="reads-wrong"]').fill("the second card oversells the fix");
    await expect(composed).toHaveValue(/the second card oversells the fix/);
    await expect(composed).toHaveValue(/\{next-tier\}/);                 // the one still unanswered

    await endTour(page);
  });

  // The popover has no step list, so there is no `data-crumb-goto` to jump with: the only way to the
  // card is the way a reader gets there, which is Next off the end of the last step.
  test("the card renders in the popover presentation too", async ({ page }) => {
    await page.goto("/");
    await page.evaluate((id) => (window as unknown as CrumbWin).crumb.start(id, { mode: "dev" }), PROMPT_TOUR);

    await page.locator('[data-crumb="next"]').click();                        // intro → step 1
    await expect(page.locator(".crumb-pop__count")).toHaveText("1 / 2");
    await page.locator('[data-crumb="next"]').click();                        // step 1 → step 2
    await expect(page.locator(".crumb-pop__count")).toHaveText("2 / 2");
    await page.locator('[data-crumb="next"]').click();                        // step 2 → the card

    await expect(page.locator(".crumb-pop__count")).toHaveCount(0);
    // Collapsed here too — the popover is the tighter of the two presentations, so it needs it more.
    await expect(page.locator(".crumb-pop__composed")).toBeHidden();
    await page.locator("details.crumb-pop__paste summary").click();
    await expect(page.locator(".crumb-pop__composed")).toBeVisible();
    await expect(page.locator('.crumb-pop [data-crumb-ask="reads-wrong"]')).toBeVisible();

    await endTour(page);
  });

  // The handoff button is host-conditional on purpose: without grain's handoff.js it would be inert,
  // so it is not rendered rather than rendered dead. Both halves are worth holding — the absence is
  // the one a future "just always render it" would quietly break.
  test("the handoff button appears only when the host loaded grain's handoff.js", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => { delete (window as unknown as { grainHandoff?: unknown }).grainHandoff; });
    await page.evaluate((id) => (window as unknown as CrumbWin).crumb.start(id, { frame: true, mode: "dev" }), PROMPT_TOUR);
    await page.locator('[data-crumb-goto="2"]').click();
    await expect(page.locator("[data-handoff]")).toHaveCount(0);
    await endTour(page);

    await page.evaluate(() => { (window as unknown as { grainHandoff: unknown }).grainHandoff = {}; });
    await page.evaluate((id) => (window as unknown as CrumbWin).crumb.start(id, { frame: true, mode: "dev" }), PROMPT_TOUR);
    await page.locator('[data-crumb-goto="2"]').click();
    const button = page.locator("[data-handoff]");
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("data-handoff-source", ".crumb-sidebar__composed");

    await endTour(page);
  });
});

// ---- P2: the tour stages a field, through the door -------------------------
// The door has to be genuinely live for any of this, and headless Chromium has no WebGPU, so the
// desk falls back to its client transport — the same setup desk-contact-prefill.e2e.ts uses, and for
// the same reason. Without it `prefillStep` returns "offline", which is an honest answer to a
// different question than the one these tests ask.
async function clientDeskEverywhere(page: Page) {
  await page.route("**/*", async (route, req) => {
    if (req.resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    if (!(res.headers()["content-type"] || "").includes("text/html")) return route.fulfill({ response: res });
    const html = (await res.text()).replace(/<body\b/, `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`);
    return route.fulfill({ response: res, body: html });
  });
  await page.addInitScript(() => {
    try { Object.defineProperty(navigator, "gpu", { value: undefined, configurable: true }); } catch { /* absent */ }
  });
}

const doorUp = async (page: Page) => {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");
};

test.describe("crumb P2 — a step stages a draft into its own field", () => {
  // P2's own prerequisite, and a real defect fixed for people as well as tours: the compose panel
  // starts collapsed, CRUMB has no flow verbs, so without a working deep link there was nothing a
  // tour could do to reach this field at all.
  test("/mail#compose opens the panel on a cold load, with no click", async ({ page }) => {
    await page.goto("/mail#compose");
    await expect(page.locator("#compose")).toBeVisible();
    await expect(page.locator(FIELD)).toBeVisible();
  });

  // Walked the way a visitor walks it: the popover, Next off the intro, three steps. Deliberately not
  // the frame presentation, and not a jump to the last step — `crumb.start` honours the tour's own
  // `route:` and goes home first, so a jump from /mail lands back on / and reloads the page under the
  // assertion. The walk is also the only version of this that proves the middle step is survivable.
  async function walkToTheStagedStep(page: Page) {
    await clientDeskEverywhere(page);
    await page.goto("/");
    await doorUp(page);
    await page.evaluate((id) => (window as unknown as CrumbWin).crumb.start(id, { mode: "demo" }), PREFILL_TOUR);
    for (let i = 0; i < 3; i += 1) await page.locator('[data-crumb="next"]').click();
    await expect(page).toHaveURL(/\/mail#compose$/);
    await doorUp(page);
  }

  test("the tour fills the field through the door, and says that it did", async ({ page }) => {
    await walkToTheStagedStep(page);
    await expect(page.locator("#compose")).toBeVisible();

    const field = page.locator(FIELD);
    await expect(field).toHaveValue(/I came in through the notes/, { timeout: 15_000 });
    // the write went through `field.set`, so it wears the door's own ink — the same grade a fill
    // during a real session leaves, which is the whole point of not touching `.value`
    await expect(field).toHaveAttribute("data-grade", "grain");

    // and the card says so, in the exact words that keep a staged field from reading as a real one
    const note = page.locator(".crumb-pop__staged");
    await expect(note).toHaveAttribute("data-staged", "staged");
    await expect(note).toContainText("Staged by the tour");

    await endTour(page);
  });

  // The refusal is the half that matters for trust. Typing over the draft is what strips the door's
  // ink (grain's own grade rule: a trusted input event un-grades the field), and the next render of
  // the same step has to notice — otherwise a tour re-staging on any re-render would quietly delete
  // what the reader had just written. The mode flip is the cheapest re-render that does not navigate.
  test("typing over the draft settles it: the tour stops claiming the field", async ({ page }) => {
    await walkToTheStagedStep(page);
    const field = page.locator(FIELD);
    await expect(field).toHaveValue(/I came in through the notes/, { timeout: 15_000 });

    await field.fill("my own words, over the top of the tour's");
    await expect(field).not.toHaveAttribute("data-grade", "grain");

    await page.evaluate(() => (window as unknown as { crumb: { setMode(m: string): void } }).crumb.setMode("dev"));

    await expect(page.locator(".crumb-sidebar__staged, .crumb-pop__staged")).toHaveAttribute("data-staged", "occupied");
    await expect(field).toHaveValue("my own words, over the top of the tour's");

    await endTour(page);
  });

  // Send is a control the tour cannot reach — there is no submit verb in grain's vocabulary. Holding
  // it here means a future verb that could submit has to break this test on its way in.
  test("nothing is sent: the walk ends on /mail with the draft still a draft", async ({ page }) => {
    await walkToTheStagedStep(page);
    await expect(page.locator(FIELD)).toHaveValue(/I came in through the notes/, { timeout: 15_000 });

    await expect(page).toHaveURL(/\/mail#compose$/);
    await expect(page.locator(FIELD)).toBeVisible();          // still on the compose screen
    await expect(page.locator('.compose [type="submit"]')).toBeVisible();   // Send is there, and untouched

    await endTour(page);
  });
});
