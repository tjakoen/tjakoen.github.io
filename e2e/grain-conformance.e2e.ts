// portfolio/e2e/grain-conformance.e2e.ts — GRAIN "used correctly" conformance.
//
// These assert the design system's USAGE CONTRACTS hold in a real browser — via computed style and
// geometry — not merely that a page renders. They guard the silent-failure traps a doc alone can't
// enforce (the exact class of mistake that kept slipping through): a grade that only applied to some
// elements, chat that only aligns in a flex column, an input that must show the dashed grain edge.
// On the grain repo split (CONVENTIONS §10) this becomes grain's own e2e against a minimal harness;
// today it rides the /grain document (which links every grain sheet + the fonts) and injects its
// own fixtures, so it's independent of how any one page happens to compose things.
import { test, expect, type Page } from "@playwright/test";

// mount fixture markup into the grain-styled document (fonts + all sheets already linked there)
async function mount(page: Page, html: string) {
  await page.goto("/grain");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate((h: string) => { document.body.innerHTML = `<main style="width:640px;padding:24px">${h}</main>`; }, html);
}

test.describe("GRAIN conformance — the design system used correctly", () => {
  test("grade: data-grade='grain' applies the grain font to ANY element, even a bare <span>", async ({ page }) => {
    await mount(page, `<span id="g" data-grade="grain">x</span><p id="c">x</p>`);
    const grain = await page.locator("#g").evaluate((el) => getComputedStyle(el).fontFamily);
    const clean = await page.locator("#c").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(grain).toContain("Redaction 50");            // the grain grade actually resolved
    expect(clean).toContain("Redaction");
    expect(clean).not.toContain("Redaction 50");        // clean stays clean
  });

  test("chat-message aligns you→right / AI→left inside a chat-log", async ({ page }) => {
    await mount(page, `
      <div class="chat-log">
        <div class="chat-message" data-role="ai" data-grade="grain"><span class="chat-message__body">ai</span></div>
        <div class="chat-message" data-role="you"><span class="chat-message__body">you</span></div>
      </div>`);
    const ai = await page.locator('.chat-message[data-role="ai"]').boundingBox();
    const you = await page.locator('.chat-message[data-role="you"]').boundingBox();
    expect((you?.x ?? 0)).toBeGreaterThan((ai?.x ?? 0));   // "you" sits to the right of the AI
  });

  test("input at data-commit='pending' wears the grain dashed edge", async ({ page }) => {
    await mount(page, `<label class="field" data-commit="pending"><input class="field__input" value="x"></label>`);
    const border = await page.locator(".field__input").evaluate((el) => getComputedStyle(el).borderStyle);
    expect(border).toContain("dashed");
  });

  test("reduced-motion: the streaming caret does not animate", async ({ page }) => {
    await mount(page, `<span class="caret"></span>`);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const anim = await page.locator(".caret").evaluate((el) => getComputedStyle(el).animationName);
    expect(anim).toBe("none");
  });

  test("button with data-commit='pending' wears the dashed grain edge (non-text atom)", async ({ page }) => {
    await mount(page, `<button class="btn" data-commit="pending">Save</button>`);
    const border = await page.locator(".btn[data-commit='pending']").evaluate((el) => getComputedStyle(el).borderStyle);
    expect(border).toContain("dashed");
  });

  test("grade: data-grade='smooth' applies the clean font; data-grade='accent' applies the accent font", async ({ page }) => {
    await mount(page, `
      <span id="s" data-grade="smooth">x</span>
      <span id="a" data-grade="accent">x</span>`);
    const smooth = await page.locator("#s").evaluate((el) => getComputedStyle(el).fontFamily);
    const accent = await page.locator("#a").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(smooth).toContain("Redaction");
    expect(smooth).not.toContain("Redaction 50");
    expect(smooth).not.toContain("Redaction 70");
    expect(accent).toContain("Redaction 70");
  });

  test("grade: child inside data-grade='grain' container inherits the grain font", async ({ page }) => {
    await mount(page, `<div data-grade="grain"><p id="child">x</p></div>`);
    const font = await page.locator("#child").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(font).toContain("Redaction 50");
  });

  test("field: .field:focus-within snaps font from grain to smooth", async ({ page }) => {
    await mount(page, `<label class="field" id="f"><input class="field__input" id="inp"></label>`);
    const resting = await page.locator("#f").evaluate((el) => getComputedStyle(el).fontFamily);
    await page.locator("#inp").focus();
    const focused = await page.locator("#f").evaluate((el) => getComputedStyle(el).fontFamily);
    expect(resting).toContain("Redaction 50");    // grain at rest
    expect(focused).not.toContain("Redaction 50"); // snaps clean on focus
    expect(focused).toContain("Redaction");
  });
});
