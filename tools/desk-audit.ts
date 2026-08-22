// tools/desk-audit.ts — REAL-MODEL scenario audit for the desk (the retune's measuring stick).
// Drives the live site in a real Chromium WITH WebGPU (unlike the e2e suite, which is headless and
// model-offline by design), asks the actual Qwen2.5-0.5B a fixed scenario list, and grades the
// replies (must-mention keywords, expected navigation, protocol leaks, loops). Run it BEFORE a
// prompt/retrieval change and AFTER, then diff the two reports.
//
//   bun tools/desk-audit.ts baseline          # label the report; writes .cache/desk-audit/report-<label>.json
//   bun tools/desk-audit.ts after --headed    # force a visible window (default tries headless first)
//   bun tools/desk-audit.ts quick --only=bread-stack,who-is-tj
//
// Local-only, never CI: needs WebGPU (headless works on a Mac via the full-Chromium channel; if no
// adapter shows up we relaunch headed) and the first run downloads ~350MB of weights — a PERSISTENT
// browser profile (.cache/desk-audit/profile) keeps them cached across runs.
import { chromium, type BrowserContext, type Page } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3131);
const BASE = `http://localhost:${PORT}`;
const DESK_DOOR = "/modules/portfolio/ai/desk-door.js";
const OUT_DIR = ".cache/desk-audit";
const PROFILE_DIR = `${OUT_DIR}/profile`;

// ---- the scenario list. Each is a REAL visitor question, phrased to reach the layer under test:
// the model tail (grounded chat / fuzzy nav / capability awareness) unless marked deterministic —
// those run as controls, proving the harness itself drives the full chain. Graders are honest
// minimums, not prose taste: a pass means "not broken", the captured text is what the retune reads.
/** A /grain/builder edit rather than a chat ask, and the only scenario shape that grades the PAGE.
 *
 *  The rest of this file asks the desk a question and reads the reply. The builder's edit path does
 *  not go through chat at all: the sentence is typed into the canvas composer, the router decides it
 *  is an edit, grain hands the live manifest to the model, and what comes back moves a block. So the
 *  honest grader here is which blocks are on the canvas afterwards, in what order, at what span —
 *  the reply line is a claim about the op and the canvas is whether the op happened.
 *
 *  This is also the ONE thing the e2e suite cannot measure. `builder-canvas.e2e.ts` scripts the
 *  engine, so it proves every link in the chain around the model and nothing about the model: it
 *  answers `block:b4` because the test told it to. A real 0.5B asked for "the second card" may hand
 *  back the first, and b2 is as real an address as b4. That is the number these scenarios exist to
 *  produce. */
interface BuilderEdit {
  /** The description the page opens on, as `?ask=`. Composed by the matcher, no model involved. */
  compose: string;
  /** Further composer prompts run before the edit, each of them an ADD the router never sends to the
   *  model. One description emits each block at most once, so a page with two cards on it takes two
   *  prompts, and "the second card" means nothing until it does.
   *
   *  Named `andThen` rather than the `then` it wants to be, because an object carrying a `then` key
   *  is a thenable: anything that ever `await`s one of these gets its own field called as a promise
   *  resolver. The lint gate caught it, and it was the only lint this change added. */
  andThen?: string[];
  /** The block ids that must be on the canvas, in order, after the edit lands. */
  wantIds: string[];
  /** Spans that must hold after the edit, by block id. Only the blocks worth naming. */
  wantSpans?: Record<string, string>;
}

interface Scenario {
  id: string;
  page: string;                    // where the question is asked from
  ask: string;
  /** Present on a /grain/builder edit: `page` and `ask` still name where and what, but the ask is typed
   *  into the canvas composer and the canvas is what gets graded. */
  builder?: BuilderEdit;
  /** every group must have ≥1 case-insensitive hit in the reply (AND of ORs) */
  mustMention?: string[][];
  /** the browser must END on this pathname (a navigation scenario) */
  mustNavigate?: string;
  /** case-insensitive substrings that must NOT appear (protocol leaks, stub phrasing) */
  mustNotMention?: string[];
  /** cap on reply length — a 0.5B past this is usually rambling (ignored for nav scenarios) */
  maxChars?: number;
  deterministic?: boolean;         // control: answered without the model
  /** C2 visitor memory — skip the per-scenario "grain.notepad" localStorage clear (below) after THIS
   *  scenario, so the very next scenario in the list inherits whatever the desk just wrote to the
   *  pad. Used by exactly one pair (memory-det → memory-read, see their own comments) — every other
   *  scenario clears the pad as usual so a written memory can never leak into an unrelated ask. */
  keepNotepad?: boolean;
}

const SCENARIOS: Scenario[] = [
  // -- grounded Q&A (the model tail; retrieval + persona under test) --
  { id: "bread-stack", page: "/", ask: "What is the BREAD stack?",
    mustMention: [["batch"], ["grain"], ["mill"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  { id: "who-is-tj", page: "/", ask: "Who is TJ?",
    mustMention: [["teach"], ["Career Team", "dev manager", "tech lead"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  // "read more" = the A3 citation: this ask's top retrieval chunk is a real page (/grain/docs/…, not
  // facts), so the deterministic Read more link must render under the grounded answer.
  { id: "grain-built", page: "/grain", ask: "What did TJ build with grain?",
    mustMention: [["grain"], ["read more"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  { id: "how-desk-works", page: "/", ask: "How do you work under the hood?",
    mustMention: [["browser", "device", "WebGPU", "model"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  // -- capability awareness (the grain-awareness gap: freeform phrasings that MISS the deterministic
  //    capabilities route and land on the model, which today knows nothing about what the desk can do) --
  { id: "cap-freeform", page: "/grain", ask: "What are you able to do for me on this site?",
    mustMention: [["navigate", "take you", "jump", "open"], ["summar"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  { id: "cap-interactive", page: "/grain", ask: "Show me something interactive here",
    mustMention: [["demo", "desk", "chip", "ask"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  { id: "cap-pages", page: "/", ask: "Which pages can you take me to?",
    mustMention: [["grain", "notes", "batch", "resume"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700,
    deterministic: true },   // routed to the capabilities action since 2026-07-24 (the 0.5B mangled route lists)
  // -- the desk ACTS: model-composed writes + summaries (the action paths through the real model) --
  { id: "note-write", page: "/grain", ask: "Jot down that the grain demo looks really promising",
    mustMention: [["notepad"]], mustNotMention: ["NAVIGATE:", "CHOICES:"] },
  // The accepted-words group includes the feed's REAL topic tokens, not just "note(s)": the visible
  // /notes main pane (the summarize input) is a tag cloud + excerpts and barely contains the word
  // "note" at all, so the 0.5B fairly summarizes TOPICS ("native-first", "course platform") — runs
  // that only said those used to fail on grader phrasing, not summary quality (2026-07-24 fix).
  { id: "summarize", page: "/notes", ask: "Summarize this page",
    mustMention: [["note", "notes", "writing", "post", "native-first", "course platform", "teaching", "vibe coding", "web platform"]],
    mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 900 },
  // -- fuzzy navigation (the model's NAVIGATE tail — no deterministic full-cover match) --
  { id: "nav-fuzzy-mill", page: "/", ask: "I want to read the mill documentation",
    mustNavigate: "/mill/docs" },
  // -- deterministic controls (prove the harness end-to-end; these must never regress) --
  { id: "nav-det", page: "/", ask: "take me to the notes", mustNavigate: "/notes", deterministic: true },
  // the flagship note — "take me to the flagship note" routes to the ONE hand-pinned note
  // (actions.ts open-flagship-note + FLAGSHIP_NOTE_SLUG) deterministically: no model, no bare-slug
  // echo. The pin is fixed, so unlike open-latest-note this lands on a known route every run.
  { id: "flagship-det", page: "/", ask: "take me to the flagship note",
    mustNavigate: "/notes/ten-times-zero", mustMention: [["flagship"]], deterministic: true },
  { id: "cap-det", page: "/", ask: "What can I do here?",
    mustMention: [["latest note"], ["summarize"], ["GRAIN"]], deterministic: true },
  // A1 deep-link answers — "where does TJ talk about X" retrieves deterministically (actions.ts
  // DEEP_LINK_PATTERNS) and jumps straight to the anchored section, never the model. Verified against
  // the real corpus (bun -e, buildPortfolioKnowledge + retrieve): this phrasing's top-scoring anchored
  // hit is the-console-i-built-to-stop-drowning note's "So I built a scanner" section, so the arrival
  // announce reads "Here's the part about ... from ...".
  { id: "deep-link-det", page: "/", ask: "show me the part about the QR scanner",
    mustNavigate: "/notes/the-console-i-built-to-stop-drowning", mustMention: [["part", "section", "under"]], deterministic: true },
  // A4 theme switching — "switch to brioche" drives theme.js's own visible cycle-theme control
  // deterministically (actions.ts + desk-reasoner.ts), no model needed; the confirmation names the
  // flavor it landed on.
  { id: "theme-det", page: "/", ask: "switch to brioche", mustMention: [["brioche"]], deterministic: true },
  // B2 notes filtering — "show me notes about teaching" matches the real "teaching" tag
  // (notes-tags.ts, several real notes carry it) and drives straight to the filtered feed
  // deterministically (actions.ts + desk-reasoner.ts): no model. mustNavigate compares
  // location.pathname (grade(), below), which already excludes the ?tag= query string, so the
  // "/notes?tag=teaching" landing still reads as a plain "/notes" navigation here.
  { id: "notes-filter-det", page: "/", ask: "show me notes about teaching", mustNavigate: "/notes", mustMention: [["teaching"]], deterministic: true },
  // B3 mail batch archive — "archive everything from BREAD CI" on /mail enumerates the sender's
  // inbox rows from the live DOM and clicks each reader's real Archive button deterministically
  // (actions.ts + mail-sender.ts + desk-reasoner.ts): no model. On-page on purpose — the cross-page
  // stash (desk-mail-task) lands its result AFTER settle()'s 2s post-navigation read, so that path
  // is e2e-covered (desk-mail-archive.e2e.ts) rather than audited here.
  { id: "mail-archive-det", page: "/mail", ask: "archive everything from BREAD CI", mustMention: [["archived"], ["bread ci"]], deterministic: true },
  // B1 contact prefill — "tell TJ …" on /mail opens the island's real ✎ Compose and fills the ONE
  // registered field (contact-draft.ts + grain field.set) deterministically: no model composes or
  // targets. On-page on purpose, mail-archive-det's own reasoning: the cross-page stash
  // (desk-contact-task) lands after settle()'s post-navigation read, so that path is e2e-covered
  // (desk-contact-prefill.e2e.ts) rather than audited here.
  { id: "contact-det", page: "/mail", ask: "tell TJ I want to talk about grain", mustMention: [["drafted"], ["send"]], deterministic: true },
  // D1 form builder demo — "build me a form that asks for a name, an email and what they want to
  // talk about" matches the closed set (field-matcher.ts's matchSpec: name + email fields, a topic
  // choice) and navigates to /grain/builder?ask=… deterministically (actions.ts + desk-reasoner.ts): no
  // model composes or targets the fields. mustNavigate compares location.pathname (grade(), below),
  // which already excludes the ?ask= query string, so the "/grain/builder?ask=…" landing still reads as a
  // plain "/grain/builder" navigation here, the same idiom notes-filter-det's own ?tag= comment follows.
  // mustMention checks the LAST chat bubble, which by the time settle() reads it is the arrival
  // announce ("Here's the form.") — the field/choice content itself lives on the PAGE, not in chat,
  // so "form" is the honest thing to grade here (deep-link-det's own reasoning, same settle() timing).
  // The cross-page fill itself (desk-form-task + runFormTask) lands AFTER settle()'s post-navigation
  // read, so THAT path is e2e-covered (desk-form-build.e2e.ts) rather than audited here.
  { id: "form-build-det", page: "/", ask: "build me a form that asks for a name, an email and what they want to talk about",
    mustNavigate: "/grain/builder", mustMention: [["form"]], deterministic: true },
  // C1 visitor-intent onboarding — a bare "hi" as the FIRST message this session triggers the
  // deterministic ask (actions.ts + desk-reasoner.ts), no model: the prompt copy names "visiting"
  // (the word this grader hooks on) and offers the three CHOICES. Not last on purpose — tour-det stays
  // the final word per the comment below; this only needs a clean (never-asked) session, which the
  // per-scenario cleanup guarantees regardless of position.
  { id: "intent-det", page: "/", ask: "hi", mustMention: [["visiting"]], deterministic: true },
  // C2 visitor memory (write) — "remember I'm here about grain" writes the marked "Desk memory" line
  // to the pad deterministically (actions.ts + desk-reasoner.ts + memory.ts): no model. Placed
  // immediately before memory-read ON PURPOSE (keepNotepad: true skips this scenario's own pad
  // clear, below) — the fact this write leaves on the pad is exactly what the next scenario reads
  // back through a REAL model answer, not a fake pad like the unit/e2e suites use.
  { id: "memory-det", page: "/", ask: "remember I'm here about grain",
    mustMention: [["noted"], ["pad"]], deterministic: true, keepNotepad: true },
  // C2 visitor memory (read) — the real Qwen2.5-0.5B answering "what do you know about me?" with
  // memory-det's write still on the pad (see keepNotepad above): the VISITOR NOTES block feeds the
  // sanitized fact into the SAME grounded-chat model tail every other Q&A scenario exercises, so a
  // pass here proves the fact reaches an actual model's answer, not just the assembled prompt string.
  { id: "memory-read", page: "/", ask: "what do you know about me?",
    mustMention: [["grain"]], mustNotMention: ["NAVIGATE:", "CHOICES:"], maxChars: 700 },
  // D5 the builder's edit path — the REAL 0.5B choosing a REAL verb on a REAL block. Everything
  // around the model is proved by builder-canvas.e2e.ts and none of the model is, because that suite
  // scripts the engine: it answers `block:b4` because the test told it to. These four are the
  // measurement, and a failure here is a RESULT rather than a broken harness — the page is built so
  // you can watch it pick the wrong block.
  //
  // All four open on the same page: an intro, a card and a callout, plus a second card from a second
  // prompt (b1 lede, b2 card, b3 callout, b4 card). One description emits each block at most once, so
  // "the second card" needs that second prompt to mean anything.
  //
  // The graders are the CANVAS rather than the words. mustMention rides along on the said line
  // because the page names the block before the op lands, and reading it in the report is how a near
  // miss ("Dropping b2.") is told apart from a refusal.
  { id: "builder-drop", page: "/grain/builder", ask: "drop the second card",
    builder: { compose: "An intro, a card and a callout", andThen: ["another card"], wantIds: ["b1", "b2", "b3"] },
    mustMention: [["b4"]] },
  // The control, and it is the one that tells you WHICH thing is broken. "the second card" asks the
  // model to resolve a reference and then use the vocabulary; "drop b4" asks only for the second.
  // A page that fails both is failing at the vocabulary, and no amount of better referring language
  // would save it.
  { id: "builder-bare-id", page: "/grain/builder", ask: "drop b4",
    builder: { compose: "An intro, a card and a callout", andThen: ["another card"], wantIds: ["b1", "b2", "b3"] },
    mustMention: [["b4"]] },
  { id: "builder-span", page: "/grain/builder", ask: "make the callout full width",
    builder: { compose: "An intro, a card and a callout", andThen: ["another card"],
      wantIds: ["b1", "b2", "b3", "b4"], wantSpans: { b3: "full" } },
    mustMention: [["b3"]] },
  { id: "builder-move", page: "/grain/builder", ask: "move the callout up",
    builder: { compose: "An intro, a card and a callout", andThen: ["another card"],
      wantIds: ["b1", "b3", "b2", "b4"] },
    mustMention: [["b3"]] },
  // The reply-without-acting case, which is a first-class answer rather than a failure: there is no
  // verb that rewrites what a block says. Graded on the canvas NOT moving, because the way a small
  // model gets this wrong is to reach for a verb anyway and remove the thing it was asked about.
  //
  // mustNotMention is the whole difference between this scenario measuring something and measuring
  // nothing, and it was added because the first run scored a hit it had not earned: the model
  // answered `block.remove` on `builder-said`, grain refused it for not being a block, and a refusal
  // leaves the canvas exactly as still as the right answer does. "The desk had nothing to change" and
  // "the desk tried something illegal" are opposite outcomes that look identical to a canvas grader.
  { id: "builder-no-verb", page: "/grain/builder", ask: "the card should mention pricing",
    builder: { compose: "An intro, a card and a callout", andThen: ["another card"],
      wantIds: ["b1", "b2", "b3", "b4"] },
    mustNotMention: ["will not work here", "does not edit a block"] },
  // A2 guided tour — "take the tour" from home drives the FIRST leg deterministically (tour.ts,
  // desk-reasoner.ts): no model, straight to /grain, with an announce that names both the stop and
  // the destination. LAST in the list on purpose — see the per-scenario cleanup below.
  { id: "tour-det", page: "/", ask: "take the tour", mustNavigate: "/grain", mustMention: [["stop"], ["grain"]], deterministic: true },
];

// ---- plumbing ----

/** Serve every document the way the frozen export does (client transport + the desk door), so the
 *  real model path runs — the dev server's default is the server-door transport. Same rewrite the
 *  e2e suite uses (e2e/desk-actions.e2e.ts), minus its WebGPU kill switch. */
async function clientDeskEverywhere(page: Page): Promise<void> {
  await page.route("**/*", async (route, req) => {
    if (req.resourceType() !== "document") return route.continue();
    const res = await route.fetch();
    if (!(res.headers()["content-type"] || "").includes("text/html")) return route.fulfill({ response: res });
    const html = (await res.text()).replace(/<body\b/, `<body data-ai-transport="client" data-ai-door="${DESK_DOOR}"`);
    return route.fulfill({ response: res, body: html });
  });
}

const ask = (page: Page, text: string) =>
  page.evaluate((t) => (window as unknown as { grain: { door: { submit(a: string, s: string, p: unknown): void } } })
    .grain.door.submit("chat.send", "chat-log", { text: t }), text);

async function deskReady(page: Page): Promise<void> {
  await page.waitForFunction(() => Boolean((window as unknown as { grain?: { door?: unknown } }).grain?.door), null, { timeout: 20_000 });
  await page.waitForFunction(() => document.body.dataset.aiOnline === "true", null, { timeout: 20_000 });
  const offline = await page.evaluate(() => document.body.dataset.desk === "offline");
  if (offline) throw new Error("desk marked itself offline (no usable WebGPU in this browser)");
}

/** The text of the LAST desk (ai) bubble in the chat log, "" when there is none yet. */
const lastReply = (page: Page): Promise<string> =>
  page.evaluate(() => {
    const bubbles = document.querySelectorAll(".assistant__log .chat-message--ai, .assistant__log .chat-message");
    const last = bubbles[bubbles.length - 1];
    return (last?.textContent ?? "").trim();
  }).catch(() => "");   // navigation mid-poll tears the context — caller handles it

// ---- the builder's own surfaces. Its edit path never touches chat, so it needs its own reader and
// its own idea of what "the reply" is: one line above the canvas that names the block before the op
// lands. The selectors are the ones builder-canvas.e2e.ts drives, deliberately the same strings.
const COMPOSER = ".builder-composer textarea";
const SUBMIT = ".builder-composer button[type=submit]";
const CELL = '[data-surface="builder-canvas"] .canvas__cell';
const SAID = '[data-surface="builder-said"]';

/** The builder's said line, "" while it is still hidden. Shaped like `lastReply` so `settle` can be
 *  handed either one. */
const lastSaid = (page: Page): Promise<string> =>
  page.evaluate((sel) => (document.querySelector(sel)?.textContent ?? "").trim(), SAID).catch(() => "");

/** The canvas as the grader sees it: every cell's id and span, in document order. This is the honest
 *  measurement of a model's choice — the said line is a CLAIM about the op, and this is whether the
 *  op happened and to which block. */
const canvasState = (page: Page): Promise<Array<{ id: string; span: string }>> =>
  page.evaluate((sel) => [...document.querySelectorAll(sel)].map((c) => ({
    id: (c as HTMLElement).dataset.blockId ?? "?",
    span: c.getAttribute("data-span") ?? "?",
  })), CELL).catch(() => []);

/** Record what the model was ASKED and what it ANSWERED, verbatim, by wrapping the desk's one
 *  completion seam before any page script runs.
 *
 *  The report needs the raw answer, not the page's reading of it. Two builder scenarios came back
 *  with the identical refusal line on the first run of these scenarios, and a refusal line cannot
 *  tell you whether the model said the same wrong thing twice or whether the harness handed it the
 *  same prompt twice. `builder-canvas.e2e.ts` stashes the prompt for exactly this reason; this does
 *  the same for both halves, against the real model.
 *
 *  A property definition rather than a patch after load, because desk-door.ts assigns `window.desk`
 *  once, whenever the engine finishes coming up, and there is no event to wait for. */
const recordModel = (page: Page) => page.addInitScript(() => {
  let real: { complete(p: string): Promise<string | null> } | undefined;
  Object.defineProperty(window, "desk", {
    configurable: true,
    get: () => real,
    set: (v: { complete(p: string): Promise<string | null> } | undefined) => {
      real = v && typeof v.complete === "function"
        ? { ...v, complete: async (p: string) => {
            sessionStorage.setItem("__auditPrompt", p);
            const raw = await v.complete(p);
            sessionStorage.setItem("__auditRaw", raw === null ? "(the model did not run)" : raw);
            return raw;
          } }
        : v;
    },
  });
});

const recorded = (page: Page) => page.evaluate(() => ({
  prompt: sessionStorage.getItem("__auditPrompt") ?? "",
  raw: sessionStorage.getItem("__auditRaw") ?? "",
})).catch(() => ({ prompt: "", raw: "" }));

/** Type a prompt into the canvas composer and submit it. The composer's own submit handler is what
 *  routes it, so this is the same way in a visitor has and the only one this scenario shape uses. */
async function submitPrompt(page: Page, text: string): Promise<void> {
  await page.fill(COMPOSER, text);
  await page.click(SUBMIT);
}

/** Compose the starting page, then leave the edit prompt submitted and unread.
 *
 *  The `then` prompts are ADDs: the router sends them to the matcher, no model runs, and each one is
 *  waited on by CELL COUNT rather than a timeout, because a count is the thing that actually changed
 *  and a sleep here would either be slow or flaky on the first load. */
async function composeFor(page: Page, b: BuilderEdit): Promise<void> {
  await page.goto(`${BASE}/grain/builder?ask=${encodeURIComponent(b.compose)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(CELL, { timeout: 20_000 });
  for (const prompt of b.andThen ?? []) {
    const before = (await canvasState(page)).length;
    await submitPrompt(page, prompt);
    await page.waitForFunction(
      ([sel, n]) => document.querySelectorAll(sel as string).length > (n as number),
      [CELL, before] as [string, number], { timeout: 20_000 },
    );
  }
}

// "Reading the page…" is the builder's thinking state, and it belongs here for the same reason
// "Thinking" does: it is a settled, unchanging string, so without it `settle` would return the
// moment the page said it had started rather than when the model answered.
const BUSY = /Thinking|Loading Qwen|Reading the page|\d+%$/;

/** Wait until the desk's reply settles: non-empty, not a load/thinking state, and UNCHANGED for
 *  `stableMs`. A cross-page navigation also ends the wait (nav scenarios). Returns the final text
 *  and the pathname we ended on. `read` is where the reply is: the chat log by default, the
 *  builder's own said line for a builder edit. */
async function settle(
  page: Page, startPath: string, timeoutMs: number, read: (p: Page) => Promise<string> = lastReply,
): Promise<{ text: string; path: string }> {
  const stableMs = 2_500;
  const t0 = Date.now();
  let prev = "";
  let stableSince = Date.now();
  let lastLog = 0;
  for (;;) {
    if (Date.now() - t0 > timeoutMs) return { text: prev, path: await path(page) };
    const p = await path(page);
    if (p !== startPath) {                       // the desk navigated: let the arrival settle, then read
      await page.waitForLoadState("domcontentloaded").catch(() => {});
      await page.waitForTimeout(2_000);
      return { text: await read(page), path: await path(page) };
    }
    const text = await read(page);
    if (text !== prev) { prev = text; stableSince = Date.now(); }
    else if (text && !BUSY.test(text) && Date.now() - stableSince > stableMs) return { text, path: p };
    if (Date.now() - lastLog > 10_000) {         // heartbeat: show download %, long generations
      lastLog = Date.now();
      console.log(`    … ${Math.round((Date.now() - t0) / 1000)}s: ${text.slice(0, 80).replace(/\s+/g, " ")}`);
    }
    await page.waitForTimeout(400);
  }
}

const path = (page: Page): Promise<string> =>
  page.evaluate(() => location.pathname).catch(() => page.url().replace(BASE, "") || "/");

interface Result {
  id: string; ask: string; page: string; deterministic: boolean;
  reply: string; endPath: string; ms: number;
  /** Builder scenarios only: the canvas the edit actually left behind. Recorded even on a pass,
   *  because the point of the report is a diff between two runs and "which block did it pick" is
   *  the number being tracked. */
  canvas?: Array<{ id: string; span: string }>;
  /** Builder scenarios only: what the model was handed and what it said back, verbatim. The report's
   *  most useful field when a scenario fails — the page's reading of a bad answer looks the same
   *  whatever the bad answer was. */
  model?: { prompt: string; raw: string };
  pass: boolean; failures: string[];
}

const shownAs = (cells: Array<{ id: string; span: string }>): string =>
  cells.length ? cells.map((c) => c.id).join(", ") : "an empty canvas";

function grade(
  s: Scenario, reply: string, endPath: string, realRoutes: Set<string>,
  canvas: Array<{ id: string; span: string }> = [],
): string[] {
  const failures: string[] = [];
  const low = reply.toLowerCase();
  // The builder's real grader. Order matters as much as membership: `block.move` changes nothing
  // else, so a move that landed on the wrong block leaves the same four ids in a different sequence.
  if (s.builder) {
    const ids = canvas.map((c) => c.id);
    if (ids.join(",") !== s.builder.wantIds.join(","))
      failures.push(`canvas is ${shownAs(canvas)}, wanted ${s.builder.wantIds.join(", ")}`);
    for (const [id, span] of Object.entries(s.builder.wantSpans ?? {})) {
      const got = canvas.find((c) => c.id === id);
      if (!got) failures.push(`no ${id} on the canvas to check its span`);
      else if (got.span !== span) failures.push(`${id} is ${got.span}, wanted ${span}`);
    }
  }
  if (s.mustNavigate) {
    if (endPath.replace(/\/+$/, "") !== s.mustNavigate) failures.push(`ended on ${endPath}, wanted ${s.mustNavigate}`);
  }
  for (const group of s.mustMention ?? []) {
    if (!group.some((k) => low.includes(k.toLowerCase()))) failures.push(`missing any of [${group.join(", ")}]`);
  }
  for (const bad of s.mustNotMention ?? []) {
    if (low.includes(bad.toLowerCase())) failures.push(`leaked "${bad}"`);
  }
  // EVERY page path the model utters must exist on the real site — the baseline showed it inventing
  // routes like /batch/tutorial. Checked on all scenarios (an invented path is a fail anywhere).
  if (realRoutes.size > 0) {
    const mentioned = reply.match(/(?<![a-z0-9])\/[a-z0-9][a-z0-9/-]+/gi) ?? [];   // lookbehind skips "and/or"
    for (const p of new Set(mentioned.map((m) => m.replace(/[/.,;:]+$/, "")))) {
      if (!realRoutes.has(p.toLowerCase())) failures.push(`invented path ${p}`);
    }
  }
  if (!s.mustNavigate) {
    if (!reply.trim()) failures.push("empty reply");
    if (s.maxChars && reply.length > s.maxChars) failures.push(`rambled: ${reply.length} chars > ${s.maxChars}`);
    // the reasoner's own loop-guard signature: a recurring ~28-char tail
    const tail = reply.slice(-28);
    if (tail.trim().length > 10 && reply.split(tail).length - 1 >= 3) failures.push("looped");
  }
  return failures;
}

// ---- server: reuse one already on the port, else boot our own ----
async function ensureServer(): Promise<(() => void) | null> {
  try { const r = await fetch(BASE, { signal: AbortSignal.timeout(1500) }); if (r.ok) { console.log(`reusing server on :${PORT}`); return null; } } catch { /* boot */ }
  console.log(`booting server on :${PORT}`);
  const proc = Bun.spawn(["bun", "src/server.ts"], { env: { ...process.env, PORT: String(PORT) }, stdout: "ignore", stderr: "inherit" });
  for (let i = 0; i < 60; i++) {
    try { const r = await fetch(BASE, { signal: AbortSignal.timeout(1000) }); if (r.ok) return () => proc.kill(); } catch { /* not yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  proc.kill();
  throw new Error("server did not come up");
}

/** Launch a persistent-profile browser that actually has a WebGPU adapter. Playwright's bundled
 *  Chromium ships without GPU raster on macOS more often than not, so the ladder also tries the
 *  system Chrome (channel "chrome"), headless-new first, then headed. First launch that yields a
 *  real adapter wins. */
async function launchWithWebgpu(forceHeaded: boolean): Promise<BrowserContext> {
  const GPU_ARGS = [
    "--enable-unsafe-webgpu", "--enable-dawn-features=allow_unsafe_apis",
    "--ignore-gpu-blocklist", "--enable-gpu", "--use-angle=metal",
  ];
  const ladder: Array<{ name: string; channel: "chromium" | "chrome"; headless: boolean }> = [
    { name: "bundled chromium, headless", channel: "chromium", headless: true },
    { name: "bundled chromium, headed", channel: "chromium", headless: false },
    { name: "system Chrome, headless", channel: "chrome", headless: true },
    { name: "system Chrome, headed", channel: "chrome", headless: false },
  ];
  const attempts = forceHeaded ? ladder.filter((a) => !a.headless) : ladder;
  // Whether ANY rung got as far as asking for an adapter. Without this the final throw says the
  // machine has no WebGPU when what really happened is that no browser started at all, which sends
  // whoever reads it looking at their GPU. Measured the honest way: an interrupted run left a
  // Chromium holding the profile lock, all four rungs failed on ProcessSingleton, and the tool
  // reported "no WebGPU adapter available in any launch mode".
  let launched = false;
  for (const a of attempts) {
    let ctx: BrowserContext;
    try {
      ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
        channel: a.channel, headless: a.headless, viewport: { width: 1280, height: 900 },
        args: GPU_ARGS,
      });
    } catch (err) { console.log(`launch failed (${a.name}): ${String(err).split("\n")[0]}`); continue; }
    launched = true;
    const probe = await ctx.newPage();
    // navigator.gpu only exists in a SECURE context — about:blank doesn't count, so probe on the site
    await probe.goto(BASE, { waitUntil: "domcontentloaded" }).catch(() => {});
    const hasAdapter = await probe.evaluate(async () => {
      const gpu = (navigator as unknown as { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
      if (!gpu) return false;
      try { return (await gpu.requestAdapter()) != null; } catch { return false; }
    }).catch(() => false);
    await probe.close();
    if (hasAdapter) { console.log(`WebGPU adapter OK — ${a.name}`); return ctx; }
    console.log(`no WebGPU adapter (${a.name})`);
    await ctx.close();
  }
  throw new Error(launched
    ? "no WebGPU adapter available in any launch mode"
    : `no browser would start in any launch mode — see the launch errors above. A stale Chromium `
      + `holding ${PROFILE_DIR} is the usual cause (an interrupted run): pkill -f desk-audit/profile`);
}

// ---- main ----
const argv = process.argv.slice(2);
const label = argv.find((a) => !a.startsWith("--")) ?? "run";
const forceHeaded = argv.includes("--headed");
const only = argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const scenarios = only ? SCENARIOS.filter((s) => only.includes(s.id)) : SCENARIOS;

const stopServer = await ensureServer();
// The site's real routes (for the invented-path grader) — same source the catalog uses.
const realRoutes = new Set<string>(
  [...(await fetch(`${BASE}/sitemap.xml`).then((r) => r.text()).catch(() => ""))
    .matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
    .map((m) => { try { return new URL(m[1]!).pathname; } catch { return m[1]!; } })
    .map((p) => (p.replace(/\/+$/, "") || "/").toLowerCase()),
);
// A browser-launch failure must not orphan the server we just booted (a stale server then serves
// pre-edit modules to every later run — confusing far beyond this tool).
let ctx: BrowserContext;
try { ctx = await launchWithWebgpu(forceHeaded); }
catch (err) { stopServer?.(); throw err; }
const results: Result[] = [];
let firstModelRun = true;

// One scenario, on a given browser context. Throws on a harness/browser failure.
async function runScenario(c: BrowserContext, s: Scenario): Promise<Result> {
  const page = await c.newPage();
  try {
    await clientDeskEverywhere(page);
    if (s.builder) await recordModel(page);
    // A builder edit brings its own landing: the page has to be COMPOSED before there is anything to
    // edit, and the composing is a query param plus a prompt or two, none of which touches the model.
    if (s.builder) await composeFor(page, s.builder);
    else await page.goto(BASE + s.page, { waitUntil: "domcontentloaded" });
    await deskReady(page);
    const startPath = await path(page);
    const t0 = Date.now();
    // Two ways in, and they are different on purpose. Chat goes through the door's `chat.send`; the
    // builder's edit is typed into the canvas composer, because that composer's own submit handler
    // is the router, and going round it would skip the question this scenario exists to ask.
    if (s.builder) await submitPrompt(page, s.ask);
    else await ask(page, s.ask);
    // first model scenario may include the one-time ~350MB download; be patient once
    const timeout = s.deterministic ? 30_000 : firstModelRun ? 420_000 : 150_000;
    const { text, path: endPath } = await settle(page, startPath, timeout, s.builder ? lastSaid : lastReply);
    if (!s.deterministic) firstModelRun = false;
    const canvas = s.builder ? await canvasState(page) : undefined;
    const model = s.builder ? await recorded(page) : undefined;
    // Per-scenario sessionStorage cleanup: tour-det (and any future tour ask) leaves a pending
    // "desk-tour" cursor stashed for the NEXT stop the door hasn't navigated to within this scenario's
    // own page, and intent-det's own ask marks the C1 nag-guard as fired ("visitor-intent" /
    // "desk-intent-asked") — either leftover would hijack or silence a LATER scenario that happens to
    // land on that stop's route, or re-run the intent ask expecting a fresh session. Each scenario
    // gets a clean slate.
    await page.evaluate((keepNotepad: boolean) => {
      sessionStorage.removeItem("desk-tour");
      sessionStorage.removeItem("visitor-intent");
      sessionStorage.removeItem("desk-intent-asked");
      // B3 mail archive: archived letters (and any pending cross-page batch) would make a re-run of
      // mail-archive-det an honest "nothing left in the inbox" instead of a fresh 3-letter sweep.
      sessionStorage.removeItem("tj.mail.archived");
      sessionStorage.removeItem("desk-mail-task");
      // C2 visitor memory: a "Desk memory" line written by ONE scenario must not leak into an
      // UNRELATED later scenario's grounded answer, and the persistent browser profile keeps
      // localStorage between separate `bun tools/desk-audit.ts` invocations too — so this clears on
      // every scenario EXCEPT the one deliberate pair that wants the hand-off (memory-det's own
      // keepNotepad flag, see its comment above).
      if (!keepNotepad) localStorage.removeItem("grain.notepad");
    }, !!s.keepNotepad).catch(() => {});
    const ms = Date.now() - t0;
    const failures = grade(s, text, endPath, realRoutes, canvas);
    return { id: s.id, ask: s.ask, page: s.page, deterministic: !!s.deterministic, reply: text, endPath, ms, canvas, model, pass: failures.length === 0, failures };
  } finally {
    await page.close().catch(() => {});
  }
}

try {
  for (const s of scenarios) {
    console.log(`\n[${s.id}] on ${s.page}: "${s.ask}"`);
    let res: Result;
    try {
      res = await runScenario(ctx, s);
    } catch (err) {
      // Chromium's GPU process can die under repeated engine loads (one full WebLLM load per page —
      // it's an MPA). A dead browser fails every remaining scenario, so relaunch and retry ONCE.
      if (/closed|crashed|Target/i.test(String(err))) {
        console.log(`  browser died (${String(err).split("\n")[0]}) — relaunching once`);
        await ctx.close().catch(() => {});
        ctx = await launchWithWebgpu(forceHeaded);
        try {
          res = await runScenario(ctx, s);
        } catch (err2) {
          res = { id: s.id, ask: s.ask, page: s.page, deterministic: !!s.deterministic, reply: "", endPath: "", ms: 0, pass: false, failures: [`harness error after relaunch: ${String(err2)}`] };
        }
      } else {
        res = { id: s.id, ask: s.ask, page: s.page, deterministic: !!s.deterministic, reply: "", endPath: "", ms: 0, pass: false, failures: [`harness error: ${String(err)}`] };
      }
    }
    results.push(res);
    console.log(`  ${res.pass ? "PASS" : "FAIL"} (${Math.round(res.ms / 1000)}s)${res.failures.length ? " — " + res.failures.join("; ") : ""}`);
    if (res.reply) console.log(`  reply: ${res.reply.slice(0, 220).replace(/\s+/g, " ")}${res.reply.length > 220 ? "…" : ""}`);
    if (res.canvas) console.log(`  canvas: ${res.canvas.map((c) => `${c.id}/${c.span}`).join(" ") || "(empty)"}`);
    if (res.model?.raw) console.log(`  model said: ${res.model.raw.slice(0, 200).replace(/\s+/g, " ")}`);
  }
} finally {
  await ctx.close();
  stopServer?.();
}

const passed = results.filter((r) => r.pass).length;
const report = { label, base: BASE, model: "Qwen2.5-0.5B (WEAK_PROFILE)", passed, total: results.length, results };
await Bun.write(`${OUT_DIR}/report-${label}.json`, JSON.stringify(report, null, 2));
console.log(`\n== ${passed}/${results.length} passed — ${OUT_DIR}/report-${label}.json ==`);
for (const r of results) console.log(`  ${r.pass ? "✓" : "✗"} ${r.id}${r.failures.length ? " — " + r.failures.join("; ") : ""}`);
if (passed < results.length) process.exit(1);
