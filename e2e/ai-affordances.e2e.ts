// portfolio/e2e/ai-affordances.e2e.ts — the AI's AFFORDANCES, live in the browser.
//
// The unit tier proves the registry + manifest carry the calling contract (payload schema, hints,
// descriptions) and that the door echoes valid moves on a rejection. This tier proves those reach
// the REAL page a reasoner reads: the `context` command prints the enriched manifest, an unafforded
// intent through the one door (window.grain.door — the public seam) surfaces the valid moves, and a
// valid note.append actually writes through the door. Together: what the manifest promises, the
// running desk can see and act on. (The in-browser reasoner is the stub — this covers the
// affordances a real model consumes, not model judgment, which is M★.)
import { test, expect } from "@playwright/test";

// The door's public browser seam (grain/scripts/ai-dispatch.js → window.grain.door).
type DoorWindow = Window & {
  grain?: { door?: { submit(action: string, target: string, payload?: unknown): void; online(): boolean } };
};

/** Wait until the one door is live (the SSE `ready` handshake landed) so a submit isn't dropped. */
async function doorReady(page: import("@playwright/test").Page) {
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");
  await page.waitForFunction(() => !!(window as DoorWindow).grain?.door?.online?.());
}

test.describe("AI affordances are live — the manifest the desk reasons over", () => {
  test("`context` prints the enriched manifest: description + payload schema + hints", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Control+`");
    const input = page.locator(".console__cmd");
    await input.fill("context");
    await input.press("Enter");

    const feed = page.locator('[data-surface="console"]');
    // the calling contract a reasoner needs to CONSTRUCT an intent — not just verb names
    await expect(feed).toContainText('"description"');
    await expect(feed).toContainText('"payload"');
    await expect(feed).toContainText('"hints"');
    // specific enrichment proving the registry reached the live-DOM projection
    await expect(feed).toContainText('"idempotent"');
    await expect(feed).toContainText('"destructive"');   // note.replace's hint
  });

  test("an unafforded intent is rejected with the valid moves echoed — the reasoner can self-correct", async ({ page }) => {
    await page.goto("/");
    await doorReady(page);
    // chat.send is NOT valid on the notepad (it takes note.append / note.replace). The door rejects
    // and the flash names what the surface DOES accept — that copy lands as the target's title.
    await page.evaluate(() =>
      (window as DoorWindow).grain!.door!.submit("chat.send", "notepad", { text: "x" }));

    const notepad = page.locator('[data-surface="notepad"]').first();
    await expect(notepad).toHaveAttribute("title", /note\.append/, { timeout: 5000 });
    await expect(notepad).toHaveAttribute("title", /note\.replace/);
  });

  test("a valid note.append writes through the door — the new verb, live end-to-end", async ({ page }) => {
    await page.goto("/");
    await doorReady(page);
    await page.evaluate(() =>
      (window as DoorWindow).grain!.door!.submit("note.append", "notepad", { text: "hello from e2e" }));

    // the stub reasoner appends one entry to the inner notepad-body push surface, pushed over SSE
    const entry = page.locator('[data-surface="notepad-body"] .notepad__entry');
    await expect(entry).toContainText("hello from e2e", { timeout: 5000 });
  });
});
