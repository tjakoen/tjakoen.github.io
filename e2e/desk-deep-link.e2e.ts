// tjakoen.github.io/e2e/desk-deep-link.e2e.ts — A1 (deep-link answers): "show me the part about X" →
// deterministic retrieve → the top ANCHORED chunk → typeOut → travelAndNavigate stashing
// sessionStorage "desk-arrival" → the destination door scrolls to the heading id + spotlights it.
// Entirely deterministic (actions.ts DEEP_LINK_PATTERNS + retrieval.ts, no model tokens involved) —
// same fake-engine stub as desk-model-chain.e2e.ts so the desk still counts as ONLINE (deskReady()
// gates on it), but the deep-link path itself never touches streamChat.
//
// The ask/route/anchor below were verified against the REAL corpus (bun -e, buildPortfolioKnowledge +
// retrieve): "where does TJ talk about using AI with students" tokenizes to "using ai with students",
// and the top-scoring anchored, non-facts chunk is /notes/how-i-use-ai-in-teaching's "## The stories
// worth telling" heading (slug "the-stories-worth-telling" per ai/slug.ts) — NOT the note's lead
// section, and not a /grain/docs chunk (several more literal phrasings, e.g. "teaching with AI", land
// there instead — this phrasing was chosen because it lands on the note).
import { test, expect, type Page } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";
const NOTE_ROUTE = "/notes/how-i-use-ai-in-teaching";
const ANCHOR = "the-stories-worth-telling";
const HEADING_TEXT = "The stories worth telling";
const DEEP_LINK_ASK = "where does TJ talk about using AI with students";

// Same stub shape as desk-model-chain.e2e.ts: a capable device, an instant "download", an opaque
// engine — the deep-link path never calls streamChat, but the desk still needs to probe ONLINE before
// deskReady() will pass.
const WEBLLM_STUB = `
export async function probeDevice() { return { webgpu: true, deviceMemory: 8, cores: 8, maxBufferSize: 4 * 1024 ** 3 }; }
export function canRunModel() { return true; }
export async function webgpuAvailable() { return true; }
export async function loadEngine({ onProgress }) { onProgress?.({ progress: 1, text: "fake engine ready" }); return { fake: true }; }
`;
const MODEL_CHAT_STUB = `
export async function* streamChat(engine, messages, opts) {
  yield "Scripted grounded answer from the fake model.";
}
`;

async function fakeModelDesk(page: Page) {
  await page.route("**/*", async (route, req) => {
    const url = new URL(req.url());
    if (url.pathname === "/modules/grain/ai/webllm.js")
      return route.fulfill({ contentType: "text/javascript", body: WEBLLM_STUB });
    if (url.pathname === "/modules/grain/ai/model-chat.js")
      return route.fulfill({ contentType: "text/javascript", body: MODEL_CHAT_STUB });
    if (req.resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    if (!(res.headers()["content-type"] || "").includes("text/html")) return route.fulfill({ response: res });
    const html = (await res.text()).replace(/<body\b/, `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`);
    return route.fulfill({ response: res, body: html });
  });
  await page.addInitScript(() => {
    try {
      Object.defineProperty(navigator, "gpu", {
        value: { requestAdapter: async () => ({}) }, configurable: true,
      });
    } catch { /* already present */ }
  });
}

const ask = (page: Page, text: string) =>
  page.evaluate((t) => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
    .grain.door.submit("chat.send", "chat-log", { text: t }), text);

async function deskReady(page: Page) {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door));
  await expect(page.locator("body")).toHaveAttribute("data-ai-online", "true");
  await expect(page.locator("body")).not.toHaveAttribute("data-desk", "offline");   // the stub probe passed
}

test.describe("A1 deep-link answers — anchors, cross-page travel, in-place scroll", () => {
  test("rendered headings carry anchors: the target section ships id + data-surface", async ({ page }) => {
    await page.goto(NOTE_ROUTE);
    const heading = page.locator(`#${ANCHOR}`);
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveText(HEADING_TEXT);
    await expect(heading).toHaveAttribute("data-surface", `anchor:${ANCHOR}`);
  });

  test("deep-link ask navigates, scrolls to the section, and spotlights it", async ({ page }) => {
    await fakeModelDesk(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, DEEP_LINK_ASK);

    // deterministic retrieve → the model tail is never needed → travelAndNavigate lands us here.
    await page.waitForURL(`**${NOTE_ROUTE}`);
    expect(new URL(page.url()).pathname).toBe(NOTE_ROUTE);

    // the destination door (runArrival) scrolls to the anchor BEFORE the spotlight lands (450ms
    // settle + a 400ms scroll beat) — poll for the heading having actually reached the viewport top.
    const heading = page.locator(`#${ANCHOR}`);
    await expect.poll(async () => (await heading.boundingBox())?.y ?? Infinity, { timeout: 5000 }).toBeLessThan(200);

    // the spotlight lands on the anchor surface (grain's ai-spotlit marker, ai-spotlight.js), then
    // releases on its own after the ~1.5s hold — natural completion, no stop click.
    await expect(heading).toHaveClass(/ai-spotlit/, { timeout: 3000 });
    await expect(heading).not.toHaveClass(/ai-spotlit/, { timeout: 4000 });
  });

  test("same-page ask scrolls to the section without navigating", async ({ page }) => {
    await fakeModelDesk(page);
    await page.goto(NOTE_ROUTE);
    await deskReady(page);

    await ask(page, DEEP_LINK_ASK);

    const heading = page.locator(`#${ANCHOR}`);
    await expect.poll(async () => (await heading.boundingBox())?.y ?? Infinity, { timeout: 5000 }).toBeLessThan(200);
    await expect(heading).toHaveClass(/ai-spotlit/, { timeout: 3000 });

    // no cross-page travel: we're still on the same note, same URL, the whole way through.
    expect(new URL(page.url()).pathname).toBe(NOTE_ROUTE);
    await expect(heading).not.toHaveClass(/ai-spotlit/, { timeout: 4000 });
  });
});
