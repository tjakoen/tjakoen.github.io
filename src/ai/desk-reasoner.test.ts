// portfolio/ai/desk-reasoner.test.ts — the desk reasoner with a FAKE engine + captured emit.
// Covers the offline-not-stub requirement (2026-07-13): a failed/absent model marks the chat OFFLINE
// and never delegates chat to the stub. Headless CI has no WebGPU, so this fake-driven suite IS the
// coverage for both the healthy and the degraded paths.
import { test, expect, describe } from "bun:test";
import { makeDeskReasoner, parseArrival, parseModelChoices, type DeskDeps, type DeskNote } from "./desk-reasoner.ts";
import { buildCatalog } from "./catalog.ts";
import { WEAK_PROFILE, type DeskEngine } from "./webllm-loader.ts";
import type { Knowledge } from "./retrieval.ts";
import type { Reasoner, ReasonTools } from "@tjakoen/grain/ai/reasoner.ts";
import type { Intent, RenderOp } from "@tjakoen/grain/ai/contract.ts";
import * as kit from "@tjakoen/grain/ai/reasoner-kit.ts";
import { streamChat } from "@tjakoen/grain/ai/model-chat.ts";

function makeTools() {
  const ops: RenderOp[] = [];
  const state = { cancel: false };
  const tools: ReasonTools = {
    archiveItem: async () => {},
    renderSurface: async () => "",
    emit: (op) => { ops.push(op); },
    cancelled: () => state.cancel,
    delay: async () => {},
  };
  return { tools, ops, state };
}

function fakeEngine(deltas: string[], onYield?: () => void) {
  let interrupted = 0;
  const engine: DeskEngine = {
    chat: { completions: { create: async () => ({
      async *[Symbol.asyncIterator]() {
        for (const d of deltas) { yield { choices: [{ delta: { content: d } }] }; onYield?.(); }
      },
    }) } },
    interruptGenerate() { interrupted++; },
  };
  return { engine, interrupted: () => interrupted };
}

const knowledge: Knowledge = {
  builtAt: "t", n: 1, df: { tj: 1 },
  chunks: [{ id: "facts#0", route: "facts", title: "About", heading: "", text: "TJ teaches and builds" }],
};

function makeDeps(over: Partial<DeskDeps> = {}): { deps: DeskDeps; fallbackCalls: string[]; offlineCalls: number } {
  const fallbackCalls: string[] = [];
  const fallback: Reasoner = { decide: async (i) => { fallbackCalls.push(i.action); return { ok: true, ops: [], reply: "stub" }; } };
  const box = { offline: 0 };
  const deps: DeskDeps = {
    profile: WEAK_PROFILE,
    probe: async () => true,
    loadEngine: async () => fakeEngine(["Hello"]).engine,
    loadCatalog: async () => buildCatalog(["/", "/grain/", "/batch/", "/bread/", "/notes/", "/about/"]),
    streamChat,                                        // GRAIN's real streaming transport over the fake engine
    loadKnowledge: async () => knowledge,
    fallback,
    markOffline: () => { box.offline++; },
    kit,
    ...over,
  };
  return { deps, fallbackCalls, get offlineCalls() { return box.offline; } } as { deps: DeskDeps; fallbackCalls: string[]; offlineCalls: number };
}

const chat = (text = "who is TJ?"): Intent =>
  ({ source: "user", session: "s", screen: "notes", surface: "chat-log", action: "chat.send", payload: { text } });

describe("makeDeskReasoner — healthy path", () => {
  test("emits the committed user bubble FIRST (releases the composer), then streams + settles", async () => {
    const { engine } = fakeEngine(["Hel", "lo ", "there"]);
    const { deps } = makeDeps({ loadEngine: async () => engine });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const decision = await r.decide(chat(), tools);

    // 1) first op = your message, committed, on the chat-log (this is what releases the trigger)
    expect(ops[0]!.op).toBe("append");
    expect(ops[0]!.provenance).toBe("user");
    expect(ops[0]!.commit).toBe("committed");
    expect(ops[0]!.target).toBe("chat-log");
    expect(ops[0]!.html).toContain('data-role="you"');
    // 2) second op = the pending desk bubble with a streamable body surface
    expect(ops[1]!.provenance).toBe("ai");
    expect(ops[1]!.commit).toBe("pending");
    expect(ops[1]!.html).toContain('data-surface="chat-msg:');   // per-load-unique id (no cross-nav collision)
    // streamed text lands as `type` ops; a `type done` settles the bubble
    const types = ops.filter((o) => o.op === "type" && typeof o.text === "string");
    expect(types.map((t) => t.text).join("")).toBe("Hello there");
    const settle = ops.find((o) => o.op === "type" && o.done);
    expect(settle).toBeDefined();
    expect(settle!.commit).toBe("committed");
    // after settling, the desk swaps in curated follow-up chips (pinned capability chip first)
    const chipsOp = ops.find((o) => o.op === "replace" && o.target === "suggest-chips");
    expect(chipsOp).toBeDefined();
    expect(chipsOp!.html).toContain("data-suggest-ask");
    expect(chipsOp!.html).toContain("What can I do here?");   // pinned
    expect(chipsOp!.html).toContain("Summarize this page");   // action chip
    expect(decision.reply).toBe("Hello there");
  });

  test("a second turn reuses the engine (no re-load) and carries history", async () => {
    let loads = 0;
    const { engine } = fakeEngine(["ok"]);
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return engine; } });
    const r = makeDeskReasoner(deps);
    await r.decide(chat("first"), makeTools().tools);
    await r.decide(chat("second"), makeTools().tools);
    expect(loads).toBe(1);
  });
});

describe("makeDeskReasoner — offline (NO stub fallback for chat)", () => {
  test("probe false → markOffline, honest offline line, and chat is NOT delegated to the stub", async () => {
    const { deps, fallbackCalls } = makeDeps({ probe: async () => false });
    let offline = 0;
    deps.markOffline = () => { offline++; };
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const decision = await r.decide(chat(), tools);

    expect(offline).toBeGreaterThan(0);
    expect(fallbackCalls).toEqual([]);                       // chat never went to the stub
    // no streaming happened — the last op is a committed replace with the offline line
    expect(ops.some((o) => o.op === "type")).toBe(false);
    const last = ops[ops.length - 1]!;
    expect(last.op).toBe("replace");
    expect(last.commit).toBe("committed");
    expect(last.html).toContain("offline");
    expect(decision.reply).toContain("offline");
  });

  test("loadEngine throws → offline, sticky (later sends short-circuit without re-probing)", async () => {
    let probes = 0;
    const { deps } = makeDeps({ probe: async () => { probes++; return true; }, loadEngine: async () => { throw new Error("cdn down"); } });
    let offline = 0;
    deps.markOffline = () => { offline++; };
    const r = makeDeskReasoner(deps);

    const err = console.error; console.error = () => {};      // the load-failure path logs by design
    try {
      await r.decide(chat("one"), makeTools().tools);
      await r.decide(chat("two"), makeTools().tools);
    } finally { console.error = err; }

    expect(offline).toBeGreaterThan(0);
    expect(probes).toBe(1);                                  // sticky: no re-probe after going offline
  });
});

describe("makeDeskReasoner — load failure (single model, no fallback)", () => {
  test("a failed load goes offline after ONE attempt — one model, nothing lighter to retry", async () => {
    let loads = 0;
    const { deps } = makeDeps({ profile: WEAK_PROFILE, loadEngine: async () => { loads++; throw new Error("cdn down"); } });
    let offline = 0; deps.markOffline = () => { offline++; };
    const r = makeDeskReasoner(deps);
    const err = console.error; console.error = () => {};
    try { await r.decide(chat(), makeTools().tools); } finally { console.error = err; }

    expect(loads).toBe(1);                                        // one attempt only — nothing lighter to retry
    expect(offline).toBeGreaterThan(0);
  });
});

describe("makeDeskReasoner — control", () => {
  test("cancel mid-stream calls interruptGenerate and still settles the bubble", async () => {
    const { tools, ops, state } = makeTools();
    const fe = fakeEngine(["a", "b", "c"], () => { state.cancel = true; });   // flip after the first delta
    const { deps } = makeDeps({ loadEngine: async () => fe.engine });
    const r = makeDeskReasoner(deps);

    await r.decide(chat(), tools);

    expect(fe.interrupted()).toBeGreaterThan(0);
    // it still settled (done + committed) so the bubble never hangs pending
    const settle = ops.find((o) => o.op === "type" && o.done);
    expect(settle).toBeDefined();
    expect(settle!.commit).toBe("committed");
  });

  test("reset() re-arms a degraded desk so the next send probes again", async () => {
    let probes = 0;
    const { deps } = makeDeps({ probe: async () => { probes++; return false; } });   // stays offline
    const r = makeDeskReasoner(deps);
    await r.decide(chat("one"), makeTools().tools);   // probe #1 → offline (sticky)
    r.reset();                                        // re-arm
    await r.decide(chat("two"), makeTools().tools);   // probes again
    expect(probes).toBe(2);
  });

  test("a non-chat verb passes straight through to the stub (no bubbles emitted)", async () => {
    const { deps, fallbackCalls } = makeDeps();
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const decision = await r.decide({ ...chat(), action: "demo.run", surface: "screen" }, tools);

    expect(fallbackCalls).toEqual(["demo.run"]);
    expect(ops).toEqual([]);                                 // desk didn't touch the chat log
    expect(decision.reply).toBe("stub");
  });
});

describe("makeDeskReasoner — UI actions (the showcase: the desk drives the page)", () => {
  const body = (ops: RenderOp[]) => ops.find((o) => o.op === "replace" && String(o.target).startsWith("chat-msg:"));
  const chipsOf = (ops: RenderOp[]) => ops.find((o) => o.op === "replace" && o.target === "suggest-chips");

  test("capabilities: text bubble + action chips, and NO model load", async () => {
    let loads = 0;
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([]).engine; } });
    deps.pageInfo = () => ({ route: "/grain", title: "GRAIN" });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("what can I do here?"), tools);

    expect(loads).toBe(0);                                   // capabilities never downloads the model
    expect(d.reply).toContain("open the latest note");
    expect(d.reply).toContain("GRAIN");                     // page title woven in (typed into the bubble, not dropped)
    // typed out word by word (typeOut), not a single hard drop: more than just the pending bubble op
    expect(ops.filter((o) => String(o.target).startsWith("chat-msg:")).length).toBeGreaterThan(1);
    expect(chipsOf(ops)!.html).toContain("Summarize this page");
    expect(chipsOf(ops)!.html).toContain("What can I do here?");   // pinned
  });

  test("capabilities reads GRAIN's manifest for page-specific operables (not a hardcoded list)", async () => {
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/grain", title: "Grain" });
    deps.pageManifest = () => ({                       // shape of grain's domManifest
      screen: "grain", actions: [], inView: {}, note: "",
      targets: [
        { id: "screen", kind: "screen", accepts: ["demo.run"] },       // generic → skipped
        { id: "chat-log", kind: "chat-log", accepts: ["chat.send"] },  // the desk itself → skipped
        { id: "item:ITM-1", kind: "item", accepts: ["item.archive"] }, // page-specific → surfaced
      ],
    });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("what can I do here?"), tools);

    expect(d.reply).toContain("archive an item");        // derived from the manifest's item target
    expect(d.reply).not.toContain("watch the desk act out a live demo");   // the generic `screen` was skipped
    // the manifest-derived line is TYPED into the bubble (typeOut), so the answer reaches the chat
    expect(ops.filter((o) => String(o.target).startsWith("chat-msg:")).length).toBeGreaterThan(1);
  });

  test("open the latest note: narrate → spotlight the note surface → navigate, no model", async () => {
    let loads = 0; let navd = "";
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([]).engine; } });
    deps.listNotes = async () => [{ slug: "newest", title: "The Newest", route: "/notes/newest" }];
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    await r.decide(chat("show me the latest note"), tools);

    expect(loads).toBe(0);
    expect(navd).toBe("/notes/newest");
    const spot = ops.find((o) => o.op === "spotlight" && o.target === "nav:/notes");   // the lamp goes to the Notes nav item
    expect(spot?.active).toBe(true);
    expect(spot?.click).toBe(true);                                                    // …and "clicks" it
  });

  test("navigate to a section: spotlights then navigates", async () => {
    let navd = "";
    const { deps } = makeDeps();
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    await r.decide(chat("take me to GRAIN"), tools);

    expect(navd).toBe("/grain");
    expect(ops.some((o) => o.op === "spotlight" && o.active)).toBe(true);
  });

  test("deterministic actions work even when the model is offline (probe false)", async () => {
    let navd = "";
    const { deps } = makeDeps({ probe: async () => false });
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);
    await r.decide(chat("go to grain"), makeTools().tools);
    expect(navd).toBe("/grain");                             // navigation needs no WebGPU
  });

  test("summarize this page: loads the model and streams a summary of the page text", async () => {
    const { engine } = fakeEngine(["A ", "summary."]);
    const { deps } = makeDeps({ loadEngine: async () => engine });
    deps.pageText = () => "This page is about GRAIN and the one door.";
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("summarize this page"), tools);

    expect(d.reply).toBe("A summary.");
    expect(ops.some((o) => o.op === "type" && o.done && o.commit === "committed")).toBe(true);
  });
});

describe("parseArrival — the 0.5B's arrival reply", () => {
  test("greeting line + CHIPS line → greeting text and up to 3 chips", () => {
    const { greeting, chips } = parseArrival("You're on Notes, long-form writing.\nCHIPS: Latest note | Why teach with AI | What is BREAD");
    expect(greeting).toBe("You're on Notes, long-form writing.");
    expect(chips).toEqual(["Latest note", "Why teach with AI", "What is BREAD"]);
  });
  test("greeting only (no CHIPS) → greeting, empty chips (static starters stand)", () => {
    expect(parseArrival("Just a greeting, nothing else.")).toEqual({ greeting: "Just a greeting, nothing else.", chips: [] });
  });
  test("empty / garbage → empty greeting (caller no-ops)", () => {
    expect(parseArrival("").greeting).toBe("");
  });
});

describe("makeDeskReasoner — arrive() (page-arrival awareness)", () => {
  const arrivalReply = "You're on the Notes page, long-form writing.\nCHIPS: Latest note | Why teach with AI";

  test("reads the page → emits a greeting bubble + reasoner-driven chips (pinned first)", async () => {
    const { deps } = makeDeps({ loadEngine: async () => fakeEngine([arrivalReply]).engine });
    deps.pageText = () => "Notes: long-form writing about building and teaching with AI.";
    deps.pageInfo = () => ({ route: "/notes", title: "Notes" });
    const r = makeDeskReasoner(deps);
    const captured: RenderOp[] = [];

    await r.arrive((op) => captured.push(op));

    // a pending thinking bubble is shown during generation, then SETTLED into the greeting (replace)
    const thinking = captured.find((o) => o.op === "append" && o.target === "chat-log");
    expect(thinking).toBeDefined();
    expect(thinking!.provenance).toBe("ai");
    expect(thinking!.commit).toBe("pending");
    expect(thinking!.html).toContain("desk-typing");                  // the animated indicator
    const greeting = captured.find((o) => o.op === "replace" && typeof o.target === "string" && o.target.startsWith("chat-msg:arrive-body"));
    expect(greeting).toBeDefined();
    expect(greeting!.commit).toBe("committed");
    expect(greeting!.html).toContain("You're on the Notes page");     // the greeting, settled into the same bubble
    const chips = captured.find((o) => o.op === "replace" && o.target === "suggest-chips");
    expect(chips).toBeDefined();
    expect(chips!.html).toContain("Latest note");                     // a model-derived chip
    expect(chips!.html).toContain("What can I do here?");             // always pinned first
  });

  test("offline (probe false) → no-op, no ops, and the static chips stand", async () => {
    const { deps } = makeDeps({ probe: async () => false });
    deps.pageText = () => "some page text";
    deps.pageInfo = () => ({ route: "/notes", title: "Notes" });
    const r = makeDeskReasoner(deps);
    const captured: RenderOp[] = [];
    await r.arrive((op) => captured.push(op));
    expect(captured).toEqual([]);
  });

  test("engine ready but the model gives nothing usable → the thinking bubble is removed (stays quiet)", async () => {
    const { deps } = makeDeps({ loadEngine: async () => fakeEngine([]).engine });   // empty reply → no greeting parses out
    deps.pageText = () => "Notes: writing about building and teaching with AI.";
    deps.pageInfo = () => ({ route: "/notes", title: "Notes" });
    const r = makeDeskReasoner(deps);
    const captured: RenderOp[] = [];
    await r.arrive((op) => captured.push(op));
    expect(captured.some((o) => o.op === "append")).toBe(true);        // the thinking bubble WAS shown
    const removed = captured.find((o) => o.op === "remove");
    expect(removed).toBeDefined();                                     // …then cleaned up on the miss
    expect(captured.some((o) => o.op === "replace" && o.target === "suggest-chips")).toBe(false);
  });

  test("no page text → no-op (nothing to greet about)", async () => {
    let loads = 0;
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([arrivalReply]).engine; } });
    deps.pageText = () => "";
    const r = makeDeskReasoner(deps);
    const captured: RenderOp[] = [];
    await r.arrive((op) => captured.push(op));
    expect(captured).toEqual([]);
    expect(loads).toBe(0);                                            // never even loaded the model
  });
});

describe("parseModelChoices — the 0.5B's CHOICES: reply", () => {
  test("parses a well-formed question + options", () => {
    const r = parseModelChoices("CHOICES: Which layer? | GRAIN | BATCH | MILL");
    expect(r).toEqual({ prompt: "Which layer?", choices: [
      { label: "GRAIN", value: "GRAIN" }, { label: "BATCH", value: "BATCH" }, { label: "MILL", value: "MILL" }] });
  });
  test("caps at 5 options and drops blanks", () => {
    const r = parseModelChoices("choices: pick | a | b | c | d | e | f | g");
    expect(r?.choices.length).toBe(5);
  });
  test("rejects a miss (no question, or fewer than 2 options, or not the protocol)", () => {
    expect(parseModelChoices("CHOICES: only one")).toBeNull();
    expect(parseModelChoices("Just a normal answer.")).toBeNull();
    expect(parseModelChoices("CHOICES:")).toBeNull();
  });
});

describe("makeDeskReasoner — clarify (AI asks, human picks)", () => {
  test("a vague ask → deterministic choice buttons, no model load", async () => {
    let loads = 0;
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([]).engine; } });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();
    await r.decide(chat("show me around"), tools);
    expect(loads).toBe(0);                                         // deterministic + offline-safe: never touched the model
    const dialog = ops.find((o) => o.op === "replace" && typeof o.html === "string" && o.html.includes("data-choices"));
    expect(dialog).toBeDefined();
    expect(dialog!.html).toContain('data-action="chat.send"');
    expect(dialog!.html).toContain("chat-choice");
    expect(dialog!.html).toContain('data-payload-text=');          // each button carries its own answer
  });

  test("the model can ASK: a CHOICES: reply becomes a first-class choices op", async () => {
    const { engine } = fakeEngine(["CHOICES: Which layer do you mean? | GRAIN | BATCH"]);
    const { deps } = makeDeps({ loadEngine: async () => engine });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();
    await r.decide(chat("tell me about the layers"), tools);       // not a deterministic action → hits the model
    const choices = ops.find((o) => o.op === "choices");
    expect(choices).toBeDefined();
    expect(choices!.choices).toEqual([{ label: "GRAIN", value: "GRAIN" }, { label: "BATCH", value: "BATCH" }]);
    // the streamed bubble is settled to the plain question (no raw "CHOICES:" text left showing)
    const settled = ops.find((o) => o.op === "replace" && typeof o.html === "string" && o.html.includes("Which layer do you mean?"));
    expect(settled).toBeDefined();
    expect(settled!.html).not.toContain("CHOICES:");
  });
});

describe("makeDeskReasoner — catalog navigation (deterministic over the real sitemap, model for the tail)", () => {
  const CATALOG = buildCatalog(
    ["/", "/grain/", "/notes/", "/notes/ten-times-zero/"],
    { "/notes/ten-times-zero": "Ten Times Zero" },
  );

  test("a clean 'take me to X' navigates deterministically — WITHOUT loading the model", async () => {
    let loads = 0, navd = "";
    const { deps } = makeDeps({
      loadEngine: async () => { loads++; return fakeEngine(["x"]).engine; },
      loadCatalog: async () => CATALOG,
    });
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("take me to grain"), tools);

    expect(navd).toBe("/grain");
    expect(loads).toBe(0);                       // never downloaded the model just to navigate
    expect(d.reply).toBe("Navigating to Grain");
    expect(ops.some((o) => o.op === "spotlight" && o.target === "nav:/grain" && o.active)).toBe(true);
  });

  test("the model may NAVIGATE to a REAL catalog route for a fuzzy ask", async () => {
    const { engine } = fakeEngine(["NAVIGATE:/notes"]);
    let navd = "";
    const { deps } = makeDeps({ loadEngine: async () => engine, loadCatalog: async () => CATALOG });
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("take me somewhere new"), makeTools().tools);

    expect(navd).toBe("/notes");
    expect(d.reply).toBe("Navigating to Notes");
  });

  test("model NAVIGATE to a route NOT in the catalog → no nav, and the raw token never leaks", async () => {
    const { engine } = fakeEngine(["NAVIGATE:/secret-admin"]);
    let navd = "";
    const { deps } = makeDeps({ loadEngine: async () => engine, loadCatalog: async () => CATALOG });
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    const d = await r.decide(chat("take me to the vault"), tools);

    expect(navd).toBe("");                       // never navigated to an invented route
    expect(d.reply).not.toContain("NAVIGATE:");  // the raw protocol token is never shown to the visitor
  });

  test("no catalog dep → a nav phrase falls through to plain chat (no crash), model answers normally", async () => {
    const { engine } = fakeEngine(["Just an answer."]);
    let navd = "";
    const { deps } = makeDeps({ loadEngine: async () => engine, loadCatalog: undefined });   // no catalog
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("take me to grain"), makeTools().tools);

    expect(navd).toBe("");                        // nothing to resolve against → no navigation
    expect(d.reply).toBe("Just an answer.");      // handled as ordinary chat instead
  });

  // 1a — the flagship note: a fixed, hand-pinned target, driven deterministically (no model), never a
  // bare slug echoed by the 0.5B. Lands on the pin regardless of what the dynamic notes list holds.
  test("'take me to the flagship note' navigates to the pinned note without loading the model", async () => {
    let loads = 0, navd = "";
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine(["x"]).engine; } });
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);

    await r.decide(chat("take me to the flagship note"), makeTools().tools);

    expect(loads).toBe(0);                        // deterministic — never touched the model
    expect(navd).toBe("/notes/ten-times-zero");   // the fixed pin (FLAGSHIP_NOTE_SLUG)
  });

  // 1b — the weak 0.5B echoes a bare route as its whole reply instead of the NAVIGATE protocol; treat
  // that as the same navigate intent so the visitor never sees a raw slug as an "answer".
  test("a bare route echoed by the model (no NAVIGATE: prefix) still navigates when it's a real route", async () => {
    const { engine } = fakeEngine(["/notes/ten-times-zero"]);
    let navd = "";
    const { deps } = makeDeps({ loadEngine: async () => engine, loadCatalog: async () => CATALOG });
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("where's that big essay again"), makeTools().tools);

    expect(navd).toBe("/notes/ten-times-zero");
    expect(d.reply).toBe("Navigating to Ten Times Zero");   // narrated as a nav, not the raw slug
  });

  // 1c — a bare deictic follow-up reuses the LAST place the desk sent the visitor, so "go there" after
  // an offer/citation lands on that target instead of re-resolving (which drifted to a different note).
  test("'go there' after a navigate reuses the last target (no re-resolution)", async () => {
    const navd: string[] = [];
    const { deps } = makeDeps({ loadCatalog: async () => CATALOG });
    deps.navigate = (u) => { navd.push(u); };
    const r = makeDeskReasoner(deps);

    await r.decide(chat("take me to grain"), makeTools().tools);   // sets the last target
    const d = await r.decide(chat("go there"), makeTools().tools); // reuses it — no destination of its own

    expect(navd).toEqual(["/grain", "/grain"]);
    expect(d.reply).toBe("Navigating to Grain");
  });
});

describe("makeDeskReasoner — note-write (the desk composes + appends a notepad entry)", () => {
  test("appends the composed entry to the notepad-body, reveals the pad, and confirms", async () => {
    const { engine } = fakeEngine(["- one\n", "- two"]);
    let revealed = 0;
    const { deps } = makeDeps({
      loadEngine: async () => engine,
      pageManifest: () => ({ note: "", targets: [{ id: "notepad", kind: "notepad", accepts: ["note.append", "note.replace"] }] }) as any,
      pageText: () => "some page content",
      revealNotepad: () => { revealed++; },
    });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("add summary bullets to my notepad"), tools);

    expect(d.ok).toBe(true);
    // the composed markdown landed as an AI-graded notepad entry (grain's note.append op-builder)
    const append = ops.find((o) => o.op === "append" && typeof o.html === "string" && o.html.includes("notepad__entry"));
    expect(append).toBeDefined();
    expect(append!.provenance).toBe("ai");
    expect(append!.html).toContain('data-grade="grain"');
    expect(revealed).toBe(1);                    // panel flipped to the Notepad view
  });

  test("no notepad on the page → honest decline, nothing appended", async () => {
    const { engine } = fakeEngine(["- x"]);
    let revealed = 0;
    const { deps } = makeDeps({
      loadEngine: async () => engine,
      pageManifest: () => ({ note: "", targets: [{ id: "screen", kind: "screen", accepts: [] }] }) as any,
      revealNotepad: () => { revealed++; },
    });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("save this to my notepad"), tools);

    expect(d.ok).toBe(false);
    expect(ops.some((o) => o.op === "append" && typeof o.html === "string" && o.html.includes("notepad__entry"))).toBe(false);
    expect(revealed).toBe(0);
  });
});

describe("makeDeskReasoner — A1 deep-link answers (\"show me the part about X\")", () => {
  // Chunk.anchor is a parallel, in-flight contract addition (retrieval.ts is owned elsewhere) — not
  // type-annotated as Knowledge here so the extra `anchor` field type-checks either side of that land.
  const deepKnowledge = {
    builtAt: "t", n: 2, df: { teach: 1, ai: 1 },
    chunks: [
      { id: "facts#0", route: "facts", title: "About", heading: "", text: "TJ teaches and builds" },
      {
        id: "notes/ten-times-zero#1", route: "/notes/ten-times-zero", title: "Ten Times Zero",
        heading: "Teaching with AI", text: "Why teaching with AI matters to TJ.",
        anchor: "teaching-with-ai",
      },
    ],
  };

  test("hit on ANOTHER route: no model load, arrives with the anchor surface, navigates to the chunk's own route", async () => {
    let loads = 0;
    // a boxed capture (like makeDeps's own `box` above) — a plain `let` reassigned only inside the
    // callback trips a known tsc control-flow quirk, narrowing the read after `await` to `never`.
    const box: { arrived: { surface?: string; announce?: string; anchor?: string } | null } = { arrived: null };
    let navd = "";
    const { deps } = makeDeps({
      loadKnowledge: async () => deepKnowledge as unknown as Knowledge,
      loadEngine: async () => { loads++; return fakeEngine([]).engine; },
    });
    deps.pageInfo = () => ({ route: "/notes", title: "Notes" });
    deps.navigate = (u) => { navd = u; };
    deps.arrive = (surface, announce, anchor) => { box.arrived = { surface, announce, anchor }; };
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    const d = await r.decide(chat("show me the part about teaching with ai"), tools);

    expect(loads).toBe(0);                                        // deterministic — never touched the model
    expect(navd).toBe("/notes/ten-times-zero");                   // the chunk's own route, not a nav-link guess
    expect(box.arrived?.surface).toBe("anchor:teaching-with-ai");
    expect(box.arrived?.anchor).toBe("teaching-with-ai");
    expect(box.arrived?.announce).toContain("Teaching with AI");
    expect(box.arrived?.announce).toContain("Ten Times Zero");
    expect(d.ok).toBe(true);
  });

  test("hit on THIS page: scrolls in place, spotlights the anchor, never navigates", async () => {
    let scrolled = "";
    let navd = "";
    const { deps } = makeDeps({ loadKnowledge: async () => deepKnowledge as unknown as Knowledge });
    deps.pageInfo = () => ({ route: "/notes/ten-times-zero", title: "Ten Times Zero" });
    deps.navigate = (u) => { navd = u; };
    deps.scrollToAnchor = (a) => { scrolled = a; return true; };
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("show me the part about teaching with ai"), tools);

    expect(scrolled).toBe("teaching-with-ai");
    expect(navd).toBe("");                                        // stayed put — no navigation
    const spot = ops.find((o) => o.op === "spotlight" && o.target === "anchor:teaching-with-ai");
    expect(spot?.active).toBe(true);
    expect(d.reply).toContain("Teaching with AI");
  });

  test("hit on THIS page but no scrollToAnchor dep: spotlight still lands (a no-op find at worst) and the turn settles", async () => {
    const { deps } = makeDeps({ loadKnowledge: async () => deepKnowledge as unknown as Knowledge });
    deps.pageInfo = () => ({ route: "/notes/ten-times-zero", title: "Ten Times Zero" });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("show me the part about teaching with ai"), tools);

    // the spotlight is emitted BEFORE the scroll (the acting chrome must land before the scroll
    // target is measured — desk-door lesson), so it fires even without the dep, and releases.
    const spot = ops.find((o) => o.op === "spotlight" && o.target === "anchor:teaching-with-ai");
    expect(spot?.active).toBe(true);
    const release = ops.find((o) => o.op === "spotlight" && o.target === "screen");
    expect(release?.active).toBe(false);
    expect(d.ok).toBe(true);
    expect(d.reply).toContain("Teaching with AI");
  });

  test("a corpus MISS falls through to the model path (still a real, grounded chat answer)", async () => {
    let loads = 0;
    const { deps } = makeDeps({
      loadKnowledge: async () => knowledge,           // the default fixture — no non-facts hit for "grain"
      loadEngine: async () => { loads++; return fakeEngine(["Grain is TJ's on-page AI toolkit."]).engine; },
    });
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    const d = await r.decide(chat("show me the part about grain"), tools);

    expect(loads).toBe(1);                                        // did NOT short-circuit deterministically
    expect(d.reply).toBe("Grain is TJ's on-page AI toolkit.");
  });
});

describe("makeDeskReasoner — A2 guided tour", () => {
  test("tour-start from '/': sets the cursor to stop 1 BEFORE navigating to /grain", async () => {
    const calls: string[] = [];
    let navd = "";
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/", title: "Welcome" });
    deps.navigate = (u) => { calls.push(`navigate:${u}`); navd = u; };
    deps.tourSet = (at) => { calls.push(`tourSet:${at}`); };
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    const d = await r.decide(chat("take the tour"), tools);

    expect(navd).toBe("/grain");
    expect(calls).toEqual(["tourSet:1", "navigate:/grain"]);   // cursor stashed BEFORE the tear-down
    expect(d.ok).toBe(true);
  });

  test("tour-start from elsewhere (e.g. /mill/docs): sets the cursor to stop 0 and navigates home", async () => {
    const calls: string[] = [];
    let navd = "";
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/mill/docs", title: "MILL docs" });
    deps.navigate = (u) => { calls.push(`navigate:${u}`); navd = u; };
    deps.tourSet = (at) => { calls.push(`tourSet:${at}`); };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("start the tour"), makeTools().tools);

    expect(navd).toBe("/");
    expect(calls).toEqual(["tourSet:0", "navigate:/"]);
    expect(d.ok).toBe(true);
  });

  test("no navigate dep: an honest decline, no crash, no tourSet call", async () => {
    const { deps } = makeDeps();
    let set = 0;
    deps.tourSet = () => { set++; };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("take the tour"), makeTools().tools);

    expect(set).toBe(0);
    expect(d.ok).toBe(false);
    expect((d.reply ?? "").toLowerCase()).toContain("can't drive");
  });

  test("a plain chat message while a tour is active calls tourClear (\"type anything to stop\")", async () => {
    const { engine } = fakeEngine(["Just an answer."]);
    const { deps } = makeDeps({ loadEngine: async () => engine });
    let cleared = 0;
    deps.tourActive = () => true;
    deps.tourClear = () => { cleared++; };
    const r = makeDeskReasoner(deps);

    await r.decide(chat("who is TJ?"), makeTools().tools);

    expect(cleared).toBe(1);
  });

  test("tour-start itself does NOT clear the tour cursor even while one is active (it restashes its own)", async () => {
    const { deps } = makeDeps();
    deps.navigate = () => {};
    let cleared = 0;
    deps.tourActive = () => true;
    deps.tourClear = () => { cleared++; };
    const r = makeDeskReasoner(deps);

    await r.decide(chat("take the tour"), makeTools().tools);

    expect(cleared).toBe(0);
  });

  test("tour-stop while a tour IS active: an honest stop line + chips, no model load", async () => {
    let loads = 0;
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([]).engine; } });
    deps.tourActive = () => true;
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    const d = await r.decide(chat("stop the tour"), tools);

    expect(loads).toBe(0);
    expect(d.reply).toContain("stopping here");
  });

  test("tour-stop with NO tour active: an honest 'nothing running' line, not a false stop", async () => {
    const { deps } = makeDeps();
    deps.tourActive = () => false;
    deps.showcaseActive = () => false;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("stop the tour"), makeTools().tools);

    expect(d.reply).toContain("nothing running");
  });
});

describe("makeDeskReasoner — 'Watch me work' AGENT", () => {
  // An engine whose successive generations are SCRIPTED (one per create() call), so a multi-turn agent
  // loop can be driven deterministically — the plain fakeEngine replays one fixed output every turn.
  function scriptedEngine(turns: string[]): DeskEngine {
    let i = 0;
    return {
      chat: { completions: { create: async () => {
        const text = turns[Math.min(i, turns.length - 1)] ?? "DONE"; i++;
        return { async *[Symbol.asyncIterator]() { yield { choices: [{ delta: { content: text } }] }; } };
      } } },
      interruptGenerate() {},
    };
  }
  // In-memory agent-state relay (the door's sessionStorage seam) + the page-context deps the loop reads.
  function withAgentDeps(over: Partial<DeskDeps>, turns: string[]) {
    const store: { s: import("./showcase.ts").ShowcaseState | null } = { s: null };
    const { deps } = makeDeps({
      loadEngine: async () => scriptedEngine(turns),
      showcaseStateGet: () => store.s,
      showcaseStateSet: (s) => { store.s = s; },
      showcaseClear: () => { store.s = null; },
      showcaseActive: () => store.s !== null,
      pageAnchors: () => [],
      hasContactField: () => false,
      ...over,
    });
    return { deps, store };
  }

  test("the model loads FIRST, then the agent drives: a GO is validated + navigated, state stashed", async () => {
    let navd = "";
    let loads = 0;
    const { deps, store } = withAgentDeps({
      pageInfo: () => ({ route: "/", title: "Welcome" }),
      navigate: (u) => { navd = u; },
      // the real sitemap catalog carries note routes; the default test catalog only has top-level ones
      loadCatalog: async () => buildCatalog(["/", "/grain/", "/notes/", "/notes/ten-times-zero/", "/mail/"], { "/notes/ten-times-zero": "Ten Times Zero" }),
      loadEngine: async () => { loads++; return scriptedEngine(["GO /notes/ten-times-zero"]); },
    }, ["GO /notes/ten-times-zero"]);
    const r = makeDeskReasoner(deps);

    await r.decide(chat("watch me work"), makeTools().tools);

    expect(loads).toBe(1);                                   // nothing moved until the model was up
    expect(navd).toBe("/notes/ten-times-zero");              // the model's OWN choice, validated against the catalog
    expect(store.s?.done).toContain("GO /notes/ten-times-zero");
    expect(store.s?.step).toBe(1);                           // state stashed for the door to resume on arrival
  });

  test("an invalid choice is REJECTED (not applied) and fed back; repeated misses end the demo", async () => {
    let navd = "";
    const { deps, store } = withAgentDeps({
      pageInfo: () => ({ route: "/", title: "Welcome" }),
      navigate: (u) => { navd = u; },
    }, ["GO /secret-admin", "GO /nowhere", "GO /also-fake"]);   // all off the curated route list
    const r = makeDeskReasoner(deps);

    await r.decide(chat("watch me work"), makeTools().tools);

    expect(navd).toBe("");                                   // never navigated to an invented route
    expect(store.s).toBeNull();                              // the demo wrapped up after SHOWCASE_MAX_MISSES
  });

  test("no navigate dep: an honest decline, model never loads", async () => {
    let loads = 0;
    const { deps } = withAgentDeps({ navigate: undefined, loadEngine: async () => { loads++; return scriptedEngine(["DONE"]); } }, ["DONE"]);
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("watch me work"), makeTools().tools);

    expect(loads).toBe(0);
    expect(d.ok).toBe(false);
    expect((d.reply ?? "").toLowerCase()).toContain("can't drive");
  });

  test("showcaseResume re-hydrates the loop on arrival: the model picks a NOTE, the harness appends it", async () => {
    const appended: RenderOp[] = [];
    const { deps, store } = withAgentDeps({
      pageInfo: () => ({ route: "/notes/ten-times-zero", title: "Ten Times Zero" }),
      pageManifest: () => ({ note: "", targets: [{ id: "notepad", kind: "notepad", accepts: ["note.append"] }] }) as any,
      revealNotepad: () => {},
    }, ["NOTE The judgment is human; the typing is not.", "DONE"]);
    store.s = { goal: "g", done: ["GO /notes/ten-times-zero"], step: 1 };   // mid-demo, just arrived
    const r = makeDeskReasoner(deps);

    await r.showcaseResume((op) => appended.push(op));

    // the model's chosen NOTE was applied through grain's note.append op-builder (AI ink), then DONE cleared it
    const note = appended.find((o) => o.op === "append" && typeof o.html === "string" && o.html.includes("notepad__entry"));
    expect(note).toBeDefined();
    expect(store.s).toBeNull();                              // DONE ended the demo
  });

  test("a plain chat message while a demo is active calls showcaseClear (\"type anything to stop\")", async () => {
    const { engine } = fakeEngine(["Just an answer."]);
    const { deps } = makeDeps({ loadEngine: async () => engine });
    let cleared = 0;
    deps.showcaseActive = () => true;
    deps.showcaseClear = () => { cleared++; };
    const r = makeDeskReasoner(deps);

    await r.decide(chat("who is TJ?"), makeTools().tools);

    expect(cleared).toBe(1);
  });
});

describe("makeDeskReasoner — A4 theme switching", () => {
  // A fake theme.js: `themes` is the fixed ordered list, and the two "clicks" actually mutate the
  // live-read state (mirroring how the real DOM would change under theme.js), so the reasoner's
  // post-click re-read (validate-twice) is exercised for real, not stubbed to always succeed.
  function fakeTheme(themes: string[], startFlavor: string, startScheme: "dark" | "light") {
    let flavor = startFlavor;
    let scheme = startScheme;
    let cycleClicks = 0;
    let toggleClicks = 0;
    return {
      themeState: () => ({ themes, flavor, scheme }),
      clickCycleTheme: () => { cycleClicks++; const i = themes.indexOf(flavor); flavor = themes[(i + 1) % themes.length]!; return true; },
      clickToggleScheme: () => { toggleClicks++; scheme = scheme === "dark" ? "light" : "dark"; return true; },
      get cycleClicks() { return cycleClicks; },
      get toggleClicks() { return toggleClicks; },
    };
  }

  test("'switch to brioche' from sourdough: two cycle clicks (sourdough→baguette→brioche), confirms by name", async () => {
    const ft = fakeTheme(["sourdough", "baguette", "brioche"], "sourdough", "light");
    const { deps } = makeDeps();
    deps.themeState = ft.themeState; deps.clickCycleTheme = ft.clickCycleTheme; deps.clickToggleScheme = ft.clickToggleScheme;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("switch to brioche"), makeTools().tools);

    expect(ft.cycleClicks).toBe(2);
    expect(ft.toggleClicks).toBe(0);
    expect(d.ok).toBe(true);
    expect(d.reply).toContain("brioche");
  });

  test("already on the requested flavor: no click, honest 'already' line", async () => {
    const ft = fakeTheme(["sourdough", "baguette", "brioche"], "brioche", "light");
    const { deps } = makeDeps();
    deps.themeState = ft.themeState; deps.clickCycleTheme = ft.clickCycleTheme; deps.clickToggleScheme = ft.clickToggleScheme;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("switch to brioche"), makeTools().tools);

    expect(ft.cycleClicks).toBe(0);
    expect(d.ok).toBe(true);
    expect((d.reply ?? "").toLowerCase()).toContain("already");
  });

  test("a flavor the router knows but THIS page's live list doesn't: no click, an honest line naming the LIVE options", async () => {
    // "brioche" is a real actions.ts FLAVORS word (so the router matches it), but this page's own
    // live data-themes doesn't carry it — the reasoner re-validates against the LIVE list, not the
    // router's static mirror, so it must decline honestly rather than click blind.
    const ft = fakeTheme(["sourdough", "baguette"], "sourdough", "light");
    const { deps } = makeDeps();
    deps.themeState = ft.themeState; deps.clickCycleTheme = ft.clickCycleTheme; deps.clickToggleScheme = ft.clickToggleScheme;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("switch to brioche"), makeTools().tools);

    expect(ft.cycleClicks).toBe(0);
    expect(d.ok).toBe(false);
    expect(d.reply).toContain("sourdough");
    expect(d.reply).toContain("baguette");
  });

  test("'cycle the theme' clicks once and confirms the NEW flavor by name", async () => {
    const ft = fakeTheme(["sourdough", "baguette", "brioche"], "sourdough", "light");
    const { deps } = makeDeps();
    deps.themeState = ft.themeState; deps.clickCycleTheme = ft.clickCycleTheme; deps.clickToggleScheme = ft.clickToggleScheme;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("cycle the theme"), makeTools().tools);

    expect(ft.cycleClicks).toBe(1);
    expect(d.reply).toContain("baguette");
  });

  test("'make it dark' when light: one toggle click, confirms dark mode", async () => {
    const ft = fakeTheme(["sourdough", "baguette", "brioche"], "sourdough", "light");
    const { deps } = makeDeps();
    deps.themeState = ft.themeState; deps.clickCycleTheme = ft.clickCycleTheme; deps.clickToggleScheme = ft.clickToggleScheme;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("make it dark"), makeTools().tools);

    expect(ft.toggleClicks).toBe(1);
    expect((d.reply ?? "").toLowerCase()).toContain("dark");
  });

  test("'make it dark' when already dark: no click, honest 'already' line", async () => {
    const ft = fakeTheme(["sourdough", "baguette", "brioche"], "sourdough", "dark");
    const { deps } = makeDeps();
    deps.themeState = ft.themeState; deps.clickCycleTheme = ft.clickCycleTheme; deps.clickToggleScheme = ft.clickToggleScheme;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("make it dark"), makeTools().tools);

    expect(ft.toggleClicks).toBe(0);
    expect((d.reply ?? "").toLowerCase()).toContain("already");
  });

  test("a click that doesn't land settles an honest 'didn't take' line instead of a false confirm", async () => {
    const { deps } = makeDeps();
    deps.themeState = () => ({ themes: ["sourdough", "baguette", "brioche"], flavor: "sourdough", scheme: "light" });
    deps.clickCycleTheme = () => true;     // "clicks" but the flavor never actually moves (stubborn button)
    deps.clickToggleScheme = () => true;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("switch to brioche"), makeTools().tools);

    expect(d.ok).toBe(false);
    expect((d.reply ?? "").toLowerCase()).toContain("didn't take");
  });

  test("no theme deps at all: an honest decline, no crash", async () => {
    const { deps } = makeDeps();
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("switch to brioche"), makeTools().tools);

    expect(d.ok).toBe(false);
    expect((d.reply ?? "").toLowerCase()).toContain("can't reach");
  });

  test("theme switching never loads the model", async () => {
    let loads = 0;
    const ft = fakeTheme(["sourdough", "baguette", "brioche"], "sourdough", "light");
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return { chat: { completions: { create: async () => ({ [Symbol.asyncIterator]: async function* () {} }) } }, interruptGenerate() {} }; } });
    deps.themeState = ft.themeState; deps.clickCycleTheme = ft.clickCycleTheme; deps.clickToggleScheme = ft.clickToggleScheme;
    const r = makeDeskReasoner(deps);

    await r.decide(chat("switch to brioche"), makeTools().tools);

    expect(loads).toBe(0);
  });
});

describe("makeDeskReasoner — B2 notes filtering (\"show me notes about teaching\")", () => {
  const notes: DeskNote[] = [
    { slug: "a", title: "A", route: "/notes/a", tags: ["teaching", "ai"] },
    { slug: "b", title: "B", route: "/notes/b", tags: ["grain"] },
  ];

  test("already on /notes: clicks the LIVE chip, confirms via clickNotesTag's return, reports a count", async () => {
    let loads = 0;
    const clicked: string[] = [];
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([]).engine; } });
    deps.listNotes = async () => notes;
    deps.pageInfo = () => ({ route: "/notes", title: "Notes" });
    deps.notesTagChips = () => ["teaching", "grain"];             // the LIVE chips on this page
    deps.clickNotesTag = (t) => { clicked.push(t); return true; };
    deps.visibleNoteCount = () => 3;
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("show me notes about teaching"), tools);

    expect(loads).toBe(0);                                        // deterministic — never touched the model
    expect(clicked).toEqual(["teaching"]);                        // only the tag notes-tags.ts actually matched
    expect(d.ok).toBe(true);
    expect(d.reply).toContain("teaching");
    expect(d.reply).toContain("3 match");
    const narrated = ops.find((o) => o.op === "append" && o.target === "console");
    expect(narrated).toBeDefined();
  });

  test("a matched tag with no chip on this page: honest decline, no click attempted", async () => {
    const clicked: string[] = [];
    const { deps } = makeDeps();
    deps.listNotes = async () => notes;
    deps.pageInfo = () => ({ route: "/notes", title: "Notes" });
    deps.notesTagChips = () => ["grain"];                         // "teaching" isn't a chip here
    deps.clickNotesTag = (t) => { clicked.push(t); return true; };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("show me notes about teaching"), makeTools().tools);

    expect(clicked).toEqual([]);
    expect(d.ok).toBe(false);
    expect(d.reply).toContain("teaching");
  });

  test("elsewhere on the site: navigates to /notes?tag=<matched> with an arrival announce naming it", async () => {
    let navd = "";
    const box: { arrived: { surface?: string; announce?: string } | null } = { arrived: null };
    const { deps } = makeDeps();
    deps.listNotes = async () => notes;
    deps.pageInfo = () => ({ route: "/", title: "Welcome" });
    deps.navigate = (u) => { navd = u; };
    deps.arrive = (surface, announce) => { box.arrived = { surface, announce }; };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("show me notes about teaching"), makeTools().tools);

    expect(navd).toBe("/notes?tag=teaching");
    expect(box.arrived?.announce).toContain("teaching");
    expect(d.ok).toBe(true);
  });

  test("a topic that matches no real tag falls through to the model (still a grounded chat answer)", async () => {
    let loads = 0;
    const { deps } = makeDeps({
      loadEngine: async () => { loads++; return fakeEngine(["Grain is TJ's on-page AI toolkit."]).engine; },
    });
    deps.listNotes = async () => notes;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("show me notes about quantum physics"), makeTools().tools);

    expect(loads).toBe(1);                                        // did NOT short-circuit deterministically
    expect(d.reply).toBe("Grain is TJ's on-page AI toolkit.");
  });
});

describe("makeDeskReasoner — B3 mail batch archive (\"archive everything from BREAD CI\")", () => {
  const CI_ITEMS = [
    { id: "ci-grain", subject: "grain release", surface: "item:mail-ci-grain" },
    { id: "ci-pages", subject: "pages release", surface: "item:mail-ci-pages" },
    { id: "ci-batch", subject: "batch release", surface: "item:mail-ci-batch" },
  ];

  test("on /mail, no mail deps at all: an honest decline, no crash", async () => {
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/mail", title: "Mail" });
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("archive everything from BREAD CI"), makeTools().tools);

    expect(d.ok).toBe(false);
    expect(d.reason).toBe("no mail deps");
    expect((d.reply ?? "").toLowerCase()).toContain("can't reach the mailbox");
  });

  test("on /mail, unknown sender: a deterministic decline naming the REAL senders (never reaches the model)", async () => {
    let loads = 0;
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([]).engine; } });
    deps.pageInfo = () => ({ route: "/mail", title: "Mail" });
    deps.mailSenders = () => ["BREAD CI", "The Desk"];
    deps.mailItemsFrom = () => [];
    deps.archiveMailItem = () => true;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("archive everything from Nobody"), makeTools().tools);

    expect(loads).toBe(0);                                        // an archive verb never reaches the 0.5B
    expect(d.ok).toBe(false);
    expect(d.reason).toBe("no such sender");
    expect(d.reply).toContain("nobody");   // the raw phrase, norm()'d lowercase like every other action
    expect(d.reply).toContain("BREAD CI");
    expect(d.reply).toContain("The Desk");
  });

  test("on /mail, a matched sender with nothing left in the inbox: idempotent 'nothing left' ok:true", async () => {
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/mail", title: "Mail" });
    deps.mailSenders = () => ["BREAD CI"];
    deps.mailItemsFrom = () => [];
    deps.archiveMailItem = () => true;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("archive everything from bread ci"), makeTools().tools);

    expect(d.ok).toBe(true);
    expect(d.reply).toContain("Nothing from BREAD CI");
  });

  test("happy path: archives every item in order and reports the count", async () => {
    let loads = 0;
    const archived: string[] = [];
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([]).engine; } });
    deps.pageInfo = () => ({ route: "/mail", title: "Mail" });
    deps.mailSenders = () => ["BREAD CI"];
    deps.mailItemsFrom = (sender) => (sender === "BREAD CI" ? CI_ITEMS : []);
    deps.archiveMailItem = (id) => { archived.push(id); return true; };
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("archive everything from BREAD CI"), tools);

    expect(loads).toBe(0);                                        // deterministic — never touched the model
    expect(archived).toEqual(["ci-grain", "ci-pages", "ci-batch"]);   // in order, one per item
    expect(d.ok).toBe(true);
    expect(d.reply).toBe("Archived 3 letters from BREAD CI. They're in the Archive folder now.");
    // each item's own surface gets spotlighted + "clicked" before archiveMailItem is asked to confirm
    const spots = ops.filter((o) => o.op === "spotlight" && o.active && o.click);
    expect(spots.map((s) => s.target)).toEqual(CI_ITEMS.map((i) => i.surface));
    // the lamp releases the screen once the batch is done
    expect(ops.some((o) => o.op === "spotlight" && o.target === "screen" && !o.active)).toBe(true);
  });

  test("a failed click reports landed-of-total, not a false full count", async () => {
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/mail", title: "Mail" });
    deps.mailSenders = () => ["BREAD CI"];
    deps.mailItemsFrom = () => CI_ITEMS;
    deps.archiveMailItem = (id) => id !== "ci-pages";   // one of the three doesn't take
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("archive everything from BREAD CI"), makeTools().tools);

    expect(d.ok).toBe(true);
    expect(d.reply).toContain("Archived 2 of 3 letters from BREAD CI");
  });

  test("zero landed: an honest 'didn't take' decline, not a false success", async () => {
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/mail", title: "Mail" });
    deps.mailSenders = () => ["BREAD CI"];
    deps.mailItemsFrom = () => CI_ITEMS;
    deps.archiveMailItem = () => false;
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("archive everything from BREAD CI"), makeTools().tools);

    expect(d.ok).toBe(false);
    expect(d.reason).toBe("click didn't land");
    expect((d.reply ?? "").toLowerCase()).toContain("didn't take");
  });

  test("elsewhere on the site: stashes the RAW sender phrase via mailTaskSet BEFORE navigating to /mail", async () => {
    const calls: string[] = [];
    let navd = "";
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/", title: "Welcome" });
    deps.navigate = (u) => { calls.push(`navigate:${u}`); navd = u; };
    deps.mailTaskSet = (sender) => { calls.push(`mailTaskSet:${sender}`); };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("archive everything from BREAD CI"), makeTools().tools);

    expect(navd).toBe("/mail");
    expect(calls).toEqual(["mailTaskSet:bread ci", "navigate:/mail"]);   // stashed BEFORE the tear-down
    expect(d.ok).toBe(true);
    expect(d.reply).toContain("bread ci");   // the raw phrase, norm()'d lowercase like every other action
  });

  test("elsewhere on the site, no mail-task deps: an honest decline, no crash", async () => {
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/", title: "Welcome" });
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("archive everything from BREAD CI"), makeTools().tools);

    expect(d.ok).toBe(false);
    expect((d.reply ?? "").toLowerCase()).toContain("can't reach the mailbox");
  });
});

describe("makeDeskReasoner — B1 contact prefill (\"tell TJ I want to talk about grain\")", () => {
  const DRAFT = "Hi TJ, I want to talk about grain.";

  test("on /mail happy path: opens compose, fills the ONE registered field with the drafted words, validates", async () => {
    let loads = 0, opened = 0;
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([]).engine; } });
    deps.pageInfo = () => ({ route: "/mail", title: "Mail" });
    deps.openCompose = () => { opened++; return true; };
    deps.contactFieldValue = () => DRAFT;   // the live field reads the draft back (validate twice)
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("tell TJ I want to talk about grain"), tools);

    expect(loads).toBe(0);                  // deterministic — the 0.5B never composes or targets
    expect(opened).toBe(1);                 // the same visible ✎ Compose button a human would click
    const fill = ops.find((o) => o.op === "fill");
    expect(fill).toMatchObject({ target: "field:contact-message", text: DRAFT, provenance: "ai", commit: "committed" });
    // the lamp lands on the field before the fill, and releases the screen after
    expect(ops.some((o) => o.op === "spotlight" && o.target === "field:contact-message" && o.active)).toBe(true);
    expect(ops.some((o) => o.op === "spotlight" && o.target === "screen" && !o.active)).toBe(true);
    expect(d.ok).toBe(true);
    expect(d.reply).toContain("Sending stays yours");
  });

  test("on /mail, compose won't open: an honest decline, no fill emitted", async () => {
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/mail", title: "Mail" });
    deps.openCompose = () => false;
    deps.contactFieldValue = () => "";
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("tell TJ I want to talk about grain"), tools);

    expect(d.ok).toBe(false);
    expect(d.reason).toBe("compose didn't open");
    expect(ops.find((o) => o.op === "fill")).toBeUndefined();
  });

  test("on /mail, the fill doesn't land (field stays empty): an honest 'didn't take', not a false success", async () => {
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/mail", title: "Mail" });
    deps.openCompose = () => true;
    deps.contactFieldValue = () => "";   // the field never took the value
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("tell TJ I want to talk about grain"), makeTools().tools);

    expect(d.ok).toBe(false);
    expect(d.reason).toBe("fill didn't land");
    expect((d.reply ?? "").toLowerCase()).toContain("didn't take");
  });

  test("on /mail, no contact deps at all: an honest decline, no crash", async () => {
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/mail", title: "Mail" });
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("tell TJ I want to talk about grain"), makeTools().tools);

    expect(d.ok).toBe(false);
    expect(d.reason).toBe("no contact deps");
    expect((d.reply ?? "").toLowerCase()).toContain("can't reach the compose panel");
  });

  test("elsewhere on the site: stashes the ALREADY-DRAFTED message BEFORE navigating to /mail", async () => {
    const calls: string[] = [];
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/", title: "Welcome" });
    deps.navigate = (u) => { calls.push(`navigate:${u}`); };
    deps.contactTaskSet = (message) => { calls.push(`contactTaskSet:${message}`); };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("tell TJ I want to talk about grain"), makeTools().tools);

    expect(calls).toEqual([`contactTaskSet:${DRAFT}`, "navigate:/mail"]);   // drafted + stashed BEFORE the tear-down
    expect(d.ok).toBe(true);
    expect((d.reply ?? "")).toContain("review and send");
  });

  test("elsewhere on the site, no contact-task deps: an honest decline, no crash", async () => {
    const { deps } = makeDeps();
    deps.pageInfo = () => ({ route: "/", title: "Welcome" });
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("tell TJ I want to talk about grain"), makeTools().tools);

    expect(d.ok).toBe(false);
    expect((d.reply ?? "").toLowerCase()).toContain("can't reach the compose panel");
  });
});

describe("makeDeskReasoner — D1 form builder demo (\"build me a form that asks for a name and an email\")", () => {
  const ASK = "build me a form that asks for a name, an email and what they want to talk about";

  test("happy path: drafts demo values for the TEXT fields only, stashes BEFORE navigating to /builder", async () => {
    let loads = 0;
    const calls: string[] = [];
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([]).engine; } });
    deps.navigate = (u) => { calls.push(`navigate:${u}`); };
    deps.formTaskSet = (values) => { calls.push(`formTaskSet:${JSON.stringify(values)}`); };
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat(ASK), tools);

    expect(loads).toBe(0);   // deterministic — matchSpec decides the structure, no model involved
    expect(d.ok).toBe(true);
    expect(calls[1]).toBe(`navigate:/builder?ask=${encodeURIComponent(ASK)}`);
    const stashed = JSON.parse(calls[0]!.replace(/^formTaskSet:/, ""));
    // name + email are the matched TEXT fields; "what they want to talk about" matched the topic
    // CHOICE, and a choice's surface must never appear here (see form-draft.ts's own banner).
    expect(Object.keys(stashed).sort()).toEqual(["field:builder-email", "field:builder-name"]);
    expect(stashed["field:builder-topic"]).toBeUndefined();
    // the lamp travels to the /builder nav link before the navigate fires
    expect(ops.some((o) => o.op === "spotlight" && o.target === "nav:/builder" && o.active)).toBe(true);
  });

  test("nothing matched: an honest decline naming the real closed set, no navigate, no stash", async () => {
    const calls: string[] = [];
    const { deps } = makeDeps();
    deps.navigate = (u) => { calls.push(`navigate:${u}`); };
    deps.formTaskSet = (values) => { calls.push(`formTaskSet:${JSON.stringify(values)}`); };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("build me a form about quantum physics and a haiku"), makeTools().tools);

    expect(d.ok).toBe(false);
    expect(d.reason).toBe("no fields matched");
    expect(calls).toEqual([]);   // no navigate, no stash — never a doomed empty-form trip
    expect((d.reply ?? "")).toContain("Name");   // a real closed-set label, not a vague apology
  });

  test("a matched-but-unsupported ask (a message box only): the decline names the refusal reason", async () => {
    const { deps } = makeDeps();
    deps.navigate = () => {};
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("build me a form with a big message box"), makeTools().tools);

    expect(d.ok).toBe(false);
    expect(d.reason).toBe("no fields matched");
    expect((d.reply ?? "").toLowerCase()).toContain("textarea");
  });

  test("no navigate dep: an honest decline, no crash, no stash", async () => {
    const calls: string[] = [];
    const { deps } = makeDeps();
    deps.formTaskSet = (values) => { calls.push(JSON.stringify(values)); };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat(ASK), makeTools().tools);

    expect(d.ok).toBe(false);
    expect(d.reason).toBe("no navigate dep");
    expect(calls).toEqual([]);
  });
});

describe("makeDeskReasoner — A3 citation (a deterministic 'Read more' under a grounded answer)", () => {
  // one real-route chunk (with an A1 anchor) + the facts block — the retrieval floor's fallback.
  const citeKnowledge = {
    builtAt: "t", n: 2, df: { teach: 1, ai: 1 },
    chunks: [
      { id: "facts#0", route: "facts", title: "About", heading: "", text: "TJ teaches and builds" },
      {
        id: "notes/ten-times-zero#1", route: "/notes/ten-times-zero", title: "Ten Times Zero",
        heading: "Teaching with AI", text: "Why teaching with AI matters to TJ.",
        anchor: "teaching-with-ai",
      },
    ],
  };

  test("a grounded answer gains a code-built Read more link to the top chunk's route#anchor", async () => {
    const { deps } = makeDeps({
      loadKnowledge: async () => citeKnowledge as unknown as Knowledge,
      loadEngine: async () => fakeEngine(["Teaching with AI matters because it is honest."]).engine,
    });
    deps.pageInfo = () => ({ route: "/", title: "Welcome" });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    await r.decide(chat("why teaching with ai matters"), tools);

    const cite = ops.find((o) => typeof o.html === "string" && o.html.includes("desk-cite"));
    expect(cite).toBeDefined();
    expect(cite!.html).toContain('href="/notes/ten-times-zero#teaching-with-ai"');
    expect(cite!.html).toContain("Read more");
    expect(cite!.html).toContain("Ten Times Zero");
  });

  test("a facts-grounded answer carries no citation (nowhere to read more)", async () => {
    const { deps } = makeDeps({
      loadKnowledge: async () => knowledge,   // facts only — the floor's fallback grounding
      loadEngine: async () => fakeEngine(["TJ is a dev manager."]).engine,
    });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    await r.decide(chat("who is TJ?"), tools);

    expect(ops.some((o) => typeof o.html === "string" && o.html.includes("desk-cite"))).toBe(false);
  });

  test("no citation when the top chunk is the page the visitor is already on", async () => {
    const { deps } = makeDeps({
      loadKnowledge: async () => citeKnowledge as unknown as Knowledge,
      loadEngine: async () => fakeEngine(["Teaching with AI matters because it is honest."]).engine,
    });
    deps.pageInfo = () => ({ route: "/notes/ten-times-zero", title: "Ten Times Zero" });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    await r.decide(chat("why teaching with ai matters"), tools);

    expect(ops.some((o) => typeof o.html === "string" && o.html.includes("desk-cite"))).toBe(false);
  });
});

describe("makeDeskReasoner — C1 visitor-intent onboarding", () => {
  // A fake sessionStorage-backed intent (mirrors desk-door.ts's own intentGet/intentSet/intentAsked/
  // intentMarkAsked shape) so the nag-guard's statefulness is exercised for real, not stubbed away.
  function fakeIntent(opts: { intent?: "recruiter" | "developer" | "student" | null; asked?: boolean } = {}) {
    let intent = opts.intent ?? null;
    let asked = opts.asked ?? false;
    let markCalls = 0;
    const setCalls: string[] = [];
    return {
      intentGet: () => intent,
      intentSet: (i: "recruiter" | "developer" | "student") => { intent = i; setCalls.push(i); },
      intentAsked: () => asked,
      intentMarkAsked: () => { asked = true; markCalls++; },
      get markCalls() { return markCalls; },
      get setCalls() { return setCalls; },
    };
  }
  const chipsOf = (ops: RenderOp[]) => ops.find((o) => o.op === "replace" && o.target === "suggest-chips");
  const notes: DeskNote[] = [
    { slug: "a", title: "A", route: "/notes/a", tags: ["teaching", "ai"] },
    { slug: "b", title: "B", route: "/notes/b", tags: ["grain"] },
  ];

  test("a fresh session's first 'hi': presents the ask (choices rendered), marks asked, no model load", async () => {
    let loads = 0;
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([]).engine; } });
    const fi = fakeIntent();
    deps.intentGet = fi.intentGet; deps.intentSet = fi.intentSet; deps.intentAsked = fi.intentAsked; deps.intentMarkAsked = fi.intentMarkAsked;
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("hi"), tools);

    expect(loads).toBe(0);                                          // deterministic — never touched the model
    expect(fi.markCalls).toBe(1);
    expect((d.reply ?? "").toLowerCase()).toContain("visiting");     // the audit grader hooks on this word
    const dialog = ops.find((o) => o.op === "replace" && typeof o.html === "string" && o.html.includes("data-choices"));
    expect(dialog).toBeDefined();
    expect(dialog!.html).toContain("Recruiter or hiring");
    expect(dialog!.html).toContain("Developer curious about the stack");
    expect(dialog!.html).toContain("Student of TJ");
  });

  test("a second 'hi' this session (already asked, no answer): falls to the ordinary clarify choices", async () => {
    const { deps } = makeDeps();
    const fi = fakeIntent({ asked: true });
    deps.intentGet = fi.intentGet; deps.intentAsked = fi.intentAsked; deps.intentMarkAsked = fi.intentMarkAsked;
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("hi"), tools);

    expect(fi.markCalls).toBe(0);                                   // never re-marks — already asked
    expect(d.reply).not.toContain("visiting");
    const dialog = ops.find((o) => o.op === "replace" && typeof o.html === "string" && o.html.includes("data-choices"));
    expect(dialog).toBeDefined();
    expect(dialog!.html).toContain("Take the tour");                // CLARIFY_CHOICES, not INTENT_CHOICES
  });

  test("'hi' with an intent already set: also falls to clarify, never re-asks", async () => {
    const { deps } = makeDeps();
    const fi = fakeIntent({ intent: "developer" });
    deps.intentGet = fi.intentGet; deps.intentAsked = fi.intentAsked; deps.intentMarkAsked = fi.intentMarkAsked;
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    await r.decide(chat("hi"), tools);

    expect(fi.markCalls).toBe(0);
    const dialog = ops.find((o) => o.op === "replace" && typeof o.html === "string" && o.html.includes("data-choices"));
    expect(dialog!.html).toContain("Take the tour");
  });

  test("recruiter answer: navigates to /resume, stashing the role-board spotlight on arrival", async () => {
    let navd = "";
    const box: { arrived: { surface?: string; announce?: string } | null } = { arrived: null };
    const { deps } = makeDeps();
    const fi = fakeIntent();
    deps.intentGet = fi.intentGet; deps.intentSet = fi.intentSet;
    deps.pageInfo = () => ({ route: "/", title: "Welcome" });
    deps.navigate = (u) => { navd = u; };
    deps.arrive = (surface, announce) => { box.arrived = { surface, announce }; };
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    const d = await r.decide(chat("I'm hiring"), tools);

    expect(fi.setCalls).toEqual(["recruiter"]);
    expect(navd).toBe("/resume");
    expect(box.arrived?.surface).toBe("role-board");
    expect(d.ok).toBe(true);
  });

  test("recruiter answer, already on /resume: no navigation, spotlights the role board in place", async () => {
    let navd = "";
    const { deps } = makeDeps();
    const fi = fakeIntent();
    deps.intentGet = fi.intentGet; deps.intentSet = fi.intentSet;
    deps.pageInfo = () => ({ route: "/resume", title: "Résumé" });
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("I'm hiring"), tools);

    expect(navd).toBe("");
    const spot = ops.find((o) => o.op === "spotlight" && o.target === "role-board" && o.active);
    expect(spot).toBeDefined();
    expect(chipsOf(ops)!.html).toContain("Summarize TJ's experience");
    expect(d.ok).toBe(true);
  });

  test("developer answer: sets chips, no navigation, no model load", async () => {
    let loads = 0;
    let navd = "";
    const { deps } = makeDeps({ loadEngine: async () => { loads++; return fakeEngine([]).engine; } });
    const fi = fakeIntent();
    deps.intentGet = fi.intentGet; deps.intentSet = fi.intentSet;
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("I'm a developer"), tools);

    expect(fi.setCalls).toEqual(["developer"]);
    expect(loads).toBe(0);
    expect(navd).toBe("");
    expect(chipsOf(ops)!.html).toContain("Take the tour");
    expect(chipsOf(ops)!.html).toContain("Take me to GRAIN");
    expect(chipsOf(ops)!.html).toContain("Open the BATCH docs");
    expect(d.ok).toBe(true);
  });

  test("student answer: navigates to /notes?tag=teaching (the real tag, matched via notes-tags.ts)", async () => {
    let navd = "";
    const box: { arrived: { surface?: string; announce?: string } | null } = { arrived: null };
    const { deps } = makeDeps();
    const fi = fakeIntent();
    deps.intentGet = fi.intentGet; deps.intentSet = fi.intentSet;
    deps.listNotes = async () => notes;
    deps.navigate = (u) => { navd = u; };
    deps.arrive = (surface, announce) => { box.arrived = { surface, announce }; };
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    const d = await r.decide(chat("I'm a student"), tools);

    expect(fi.setCalls).toEqual(["student"]);
    expect(navd).toBe("/notes?tag=teaching");
    expect(box.arrived?.announce).toContain("teaching");
    expect(d.ok).toBe(true);
  });

  test("student answer with no real 'teaching' tag anywhere: degrades to the plain notes feed", async () => {
    let navd = "";
    const { deps } = makeDeps();
    const fi = fakeIntent();
    deps.intentGet = fi.intentGet; deps.intentSet = fi.intentSet;
    deps.listNotes = async () => [{ slug: "b", title: "B", route: "/notes/b", tags: ["grain"] }];
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    const d = await r.decide(chat("I'm a student"), tools);

    expect(navd).toBe("/notes");
    expect(d.ok).toBe(true);
  });

  test("pickFollowups intent bias: a set intent leads the follow-up chips after a grounded answer", async () => {
    const { engine } = fakeEngine(["Some grounded answer."]);
    const { deps } = makeDeps({ loadEngine: async () => engine });
    const fi = fakeIntent({ intent: "recruiter" });
    deps.intentGet = fi.intentGet;
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    await r.decide(chat("who is TJ?"), tools);

    const chips = chipsOf(ops)!.html;
    expect(chips).toContain("Summarize TJ's experience");
    expect(chips).toContain("What did TJ build?");
  });

  test("C2 tie-in (default: YES): answering the ask also writes a silent 'visiting as a X' memory line", async () => {
    const { deps } = makeDeps({
      pageManifest: () => ({ note: "", targets: [{ id: "notepad", kind: "notepad", accepts: ["note.append", "note.replace"] }] }) as any,
    });
    const fi = fakeIntent();
    deps.intentGet = fi.intentGet; deps.intentSet = fi.intentSet;
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("I'm a developer"), tools);

    const append = ops.find((o) => o.op === "append" && typeof o.html === "string" && o.html.includes("Desk memory: visiting as a developer"));
    expect(append).toBeDefined();
    expect(append!.provenance).toBe("ai");
    // silent: the reply is intent-set's OWN line, no extra memory-write sentence tacked on
    expect(d.reply).toBe("Developer mode. Want the guided tour of the stack, or straight to GRAIN or the BATCH docs?");
  });

  test("C2 tie-in: no notepad on the page → no memory write, intent-set still answers normally", async () => {
    const { deps } = makeDeps({ pageManifest: () => ({ note: "", targets: [{ id: "screen", kind: "screen", accepts: [] }] }) as any });
    const fi = fakeIntent();
    deps.intentGet = fi.intentGet; deps.intentSet = fi.intentSet;
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("I'm a developer"), tools);

    expect(ops.some((o) => o.op === "append" && typeof o.html === "string" && o.html.includes("Desk memory"))).toBe(false);
    expect(d.ok).toBe(true);
  });
});

describe("makeDeskReasoner — C2 visitor memory (memory-set / memory-forget)", () => {
  const notepadManifest = () => ({ note: "", targets: [{ id: "notepad", kind: "notepad", accepts: ["note.append", "note.replace"] }] }) as any;
  const noNotepadManifest = () => ({ note: "", targets: [{ id: "screen", kind: "screen", accepts: [] }] }) as any;

  test("happy path: appends the exact marked line, reveals the pad, confirms — no model load at all", async () => {
    let loads = 0;
    let revealed = 0;
    const { deps } = makeDeps({
      loadEngine: async () => { loads++; return fakeEngine([]).engine; },
      pageManifest: notepadManifest,
      revealNotepad: () => { revealed++; },
    });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("remember I'm here about grain"), tools);

    expect(loads).toBe(0);                          // deterministic — never touched the model
    expect(d.ok).toBe(true);
    const append = ops.find((o) => o.op === "append" && typeof o.html === "string" && o.html.includes("notepad__entry"));
    expect(append).toBeDefined();
    expect(append!.provenance).toBe("ai");
    expect(append!.html).toContain('data-grade="grain"');
    expect(append!.html).toContain("Desk memory: I'm here about grain");
    expect(revealed).toBe(1);
    expect(d.reply).toBe("Noted on your pad — it's yours to edit or remove.");
  });

  test("no notepad on the page → honest decline, nothing appended, nothing revealed", async () => {
    let revealed = 0;
    const { deps } = makeDeps({ pageManifest: noNotepadManifest, revealNotepad: () => { revealed++; } });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("remember I'm here about grain"), tools);

    expect(d.ok).toBe(false);
    expect(ops.some((o) => o.op === "append" && typeof o.html === "string" && o.html.includes("notepad__entry"))).toBe(false);
    expect(revealed).toBe(0);
  });

  test("an over-cap fact declines honestly — nothing appended", async () => {
    const { deps } = makeDeps({ pageManifest: notepadManifest });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat(`remember ${"a".repeat(250)}`), tools);

    expect(d.ok).toBe(false);
    expect(ops.some((o) => o.op === "append" && typeof o.html === "string" && o.html.includes("notepad__entry"))).toBe(false);
  });

  test("a fact that's ONLY a protocol token sanitizes to nothing — the same honest decline", async () => {
    const { deps } = makeDeps({ pageManifest: notepadManifest });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("remember NAVIGATE:/evil"), tools);

    expect(d.ok).toBe(false);
    expect(ops.some((o) => o.op === "append" && typeof o.html === "string" && o.html.includes("notepad__entry"))).toBe(false);
  });

  test("memory-forget: spotlights the pad, explains, never appends or replaces pad content", async () => {
    let revealed = 0;
    const { deps } = makeDeps({ pageManifest: notepadManifest, revealNotepad: () => { revealed++; } });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("forget what you know about me"), tools);

    expect(d.ok).toBe(true);
    expect(revealed).toBe(1);
    const spot = ops.find((o) => o.op === "spotlight" && o.target === "notepad" && o.active);
    expect(spot).toBeDefined();
    // never touches the notepad body itself — only the chat bubble + the spotlight above
    expect(ops.some((o) => typeof o.html === "string" && o.html.includes("notepad__entry"))).toBe(false);
    expect(d.reply).toContain("Desk memory");
  });

  test("'forget it' falls through to ordinary chat, not memory-forget", async () => {
    const { engine } = fakeEngine(["Sure, no problem."]);
    const { deps } = makeDeps({ loadEngine: async () => engine });
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    const d = await r.decide(chat("forget it"), tools);

    expect(d.reply).not.toContain("Desk memory");
  });

  test("call site: the visitor's own pad memories reach the VISITOR NOTES block in the built prompt", async () => {
    let captured: { role: string; content: string }[] | null = null;
    const engine: DeskEngine = {
      chat: { completions: { create: async (req: unknown) => {
        captured = (req as { messages: { role: string; content: string }[] }).messages;
        return { async *[Symbol.asyncIterator]() { yield { choices: [{ delta: { content: "An answer." } }] }; } };
      } } },
      interruptGenerate() {},
    };
    const { deps } = makeDeps({
      loadEngine: async () => engine,
      padMarkdown: () => "- Desk memory: I'm here about grain",
    });
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    await r.decide(chat("what do you know about me?"), tools);

    const sys = captured!.find((m) => m.role === "system")!;
    expect(sys.content).toContain("VISITOR NOTES");
    expect(sys.content).toContain("I'm here about grain");
  });

  test("call site: an empty pad never adds a VISITOR NOTES block", async () => {
    let captured: { role: string; content: string }[] | null = null;
    const engine: DeskEngine = {
      chat: { completions: { create: async (req: unknown) => {
        captured = (req as { messages: { role: string; content: string }[] }).messages;
        return { async *[Symbol.asyncIterator]() { yield { choices: [{ delta: { content: "An answer." } }] }; } };
      } } },
      interruptGenerate() {},
    };
    const { deps } = makeDeps({ loadEngine: async () => engine, padMarkdown: () => "" });
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    await r.decide(chat("who is TJ?"), tools);

    const sys = captured!.find((m) => m.role === "system")!;
    expect(sys.content).not.toContain("VISITOR NOTES");
  });
});
