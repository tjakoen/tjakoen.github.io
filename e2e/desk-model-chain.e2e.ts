// tjakoen.github.io/e2e/desk-model-chain.e2e.ts — the MODEL TAIL, end to end, with a SCRIPTED fake
// engine. Headless CI has no WebGPU, so the real 0.5B can't run here (tools/desk-audit.ts drives that,
// locally) — but everything AROUND the model is deterministic and testable: retrieval + prompt
// assembly, the NAVIGATE:/CHOICES: protocol parsing, catalog validation of a model-chosen route, and
// grain actually driving the page. We stub the TWO grain transport modules the desk door URL-imports
// (webllm.js: the probe + loader; model-chat.js: streamChat) at the network layer — the door, the
// reasoner, prompt.ts, retrieval.ts, catalog.ts and grain's dispatcher all run REAL. The stub scripts
// replies by the user's message and records every prompt on window.__deskPrompts for assertions.
import { test, expect, type Page } from "@playwright/test";

const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";

// The stubbed grain WebLLM transport: a capable device, an instant "download", an opaque engine.
const WEBLLM_STUB = `
export async function probeDevice() { return { webgpu: true, deviceMemory: 8, cores: 8, maxBufferSize: 4 * 1024 ** 3 }; }
export function canRunModel() { return true; }
export async function webgpuAvailable() { return true; }
export async function loadEngine({ onProgress }) { onProgress?.({ progress: 1, text: "fake engine ready" }); return { fake: true }; }
`;

// The stubbed streaming chat: pick a scripted reply by the last user message, stream it word by word,
// and log the full prompt (messages + knobs) for the prompt-content assertions below.
const MODEL_CHAT_STUB = `
export async function* streamChat(engine, messages, opts) {
  const seen = JSON.parse(sessionStorage.getItem("__deskPrompts") ?? "[]");
  seen.push({ messages, opts });
  sessionStorage.setItem("__deskPrompts", JSON.stringify(seen));   // survives the desk's own navigations
  const user = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  let reply = "Scripted grounded answer from the fake model.";
  if (/mill documentation/i.test(user)) reply = "NAVIGATE:/mill/docs";
  else if (/atlantis/i.test(user)) reply = "NAVIGATE:/atlantis";
  else if (/pick a layer/i.test(user)) reply = "CHOICES: Which layer do you want? | GRAIN | MILL | BATCH";
  else if (/grain is impressive/i.test(user)) reply = "- Grain is impressive";
  for (const part of reply.match(/\\S+\\s*/g) ?? [reply]) yield part;
}
`;

// Serve every document as the export does (client transport + desk door), give the page a WebGPU
// API surface (desk-door's up-front gate checks navigator.gpu.requestAdapter exists), and swap the
// two grain transport modules for the stubs. Everything else is the real site.
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

interface CapturedPrompt { messages: { role: string; content: string }[]; opts?: Record<string, unknown> }
const prompts = (page: Page): Promise<CapturedPrompt[]> =>
  page.evaluate(() => JSON.parse(sessionStorage.getItem("__deskPrompts") ?? "[]") as never);

test.describe("THE DESK's model tail — scripted engine, real everything else", () => {
  test("model NAVIGATE to a real route: shortlist offered, route validated, grain drives the page there", async ({ page }) => {
    await fakeModelDesk(page);
    await page.goto("/");
    await deskReady(page);

    // NOT verb-anchored ("I want to read X" now resolves deterministically, catalog.ts NAV_VERB) —
    // this phrasing has no nav verb, so it falls through to the model tail the stub scripts.
    await ask(page, "maybe the mill documentation could help me");

    await page.waitForURL("**/mill/docs");                        // the model's choice, validated + driven by grain
    // the prompt that produced it carried the REAL-route shortlist protocol
    const sys = (await prompts(page))[0]!.messages[0]!;
    expect(sys.role).toBe("system");
    expect(sys.content).toContain("NAVIGATE:");                   // the protocol was offered…
    expect(sys.content).toContain("/mill/docs");                  // …scoped to real routes incl. the destination
  });

  test("model NAVIGATE to an invented route: refused, honest line, no protocol leak, no navigation", async ({ page }) => {
    await fakeModelDesk(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "take me to atlantis");

    const log = page.locator(".assistant__log");
    await expect(log).toContainText("I'm not sure where that is on the site");
    await expect(log).not.toContainText("NAVIGATE:");             // the raw protocol token never reaches the visitor
    expect(new URL(page.url()).pathname).toBe("/");               // and we went nowhere
  });

  test("model CHOICES: question bubble + real choice buttons; a tap re-enters the desk and acts", async ({ page }) => {
    await fakeModelDesk(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "help me pick a layer");

    const log = page.locator(".assistant__log");
    await expect(log).toContainText("Which layer do you want?");
    await expect(log).not.toContainText("CHOICES:");              // parsed, never leaked raw
    const choices = page.locator("[data-choices] button");
    await expect(choices).toHaveCount(3);
    await expect(choices.nth(0)).toHaveText("GRAIN");

    // tapping GRAIN submits "GRAIN" as a chat.send → the deterministic catalog resolver (a bare
    // place-name) navigates for real — the full loop from model question to grain-driven page move.
    await choices.nth(0).click();
    await page.waitForURL("**/grain");
  });

  test("note-write: 'jot down that…' → the model composes, the entry lands on the notepad, chat confirms", async ({ page }) => {
    await fakeModelDesk(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "jot down that grain is impressive");

    // the composed entry lands on the notepad's push surface (grain note.append), the pad is revealed,
    // and the chat settles to the confirmation — the whole write path, minus only the real model
    await expect(page.locator('[data-surface="notepad-body"] .notepad__entry')).toContainText("Grain is impressive");
    await expect(page.locator(".assistant__log")).toContainText("Added that to your notepad");
  });

  test("grounded chat: the assembled system prompt carries persona + route-tagged CONTEXT + the desk's protocols", async ({ page }) => {
    await fakeModelDesk(page);
    await page.goto("/");
    await deskReady(page);

    await ask(page, "What is the BREAD stack?");

    await expect(page.locator(".assistant__log")).toContainText("Scripted grounded answer");
    const sys = (await prompts(page))[0]!.messages[0]!;
    expect(sys.role).toBe("system");
    expect(sys.content).toContain("You are the Desk");            // persona
    expect(sys.content).toContain("CONTEXT");                     // retrieval grounding present…
    expect(sys.content).toMatch(/\[\/?[a-z"]/i);                  // …route-tagged chunks ([/notes/…] or [facts])
    expect(sys.content).toContain("CHOICES:");                    // the always-on clarify protocol
    expect(sys.content).toContain("Things YOU (the Desk) can do");// capability awareness (canDo block)
    expect(sys.content).toContain("summarize this page");         // …with the built-in actions listed
    // generation knobs flow from the ONE profile (webllm-loader WEAK_PROFILE), not ad-hoc values
    const opts = (await prompts(page))[0]!.opts as { maxTokens?: number };
    expect(opts.maxTokens).toBe(220);
  });
});
