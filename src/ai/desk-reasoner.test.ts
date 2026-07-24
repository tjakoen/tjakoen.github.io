// portfolio/ai/desk-reasoner.test.ts — the desk reasoner with a FAKE engine + captured emit.
// Covers the offline-not-stub requirement (2026-07-13): a failed/absent model marks the chat OFFLINE
// and never delegates chat to the stub. Headless CI has no WebGPU, so this fake-driven suite IS the
// coverage for both the healthy and the degraded paths.
import { test, expect, describe } from "bun:test";
import { makeDeskReasoner, parseArrival, parseModelChoices, type DeskDeps } from "./desk-reasoner.ts";
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
    loadCatalog: async () => buildCatalog(["/", "/grain/", "/batch/", "/bread/", "/notes/", "/loop/", "/about/"]),
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
    deps.pageInfo = () => ({ route: "/loop", title: "Loop" });
    deps.pageManifest = () => ({                       // shape of grain's domManifest
      screen: "loop", actions: [], inView: {}, note: "",
      targets: [
        { id: "screen", kind: "screen", accepts: ["demo.run"] },       // generic → skipped
        { id: "chat-log", kind: "chat-log", accepts: ["chat.send"] },  // the desk itself → skipped
        { id: "item:ITM-1", kind: "item", accepts: ["item.archive"] }, // page-specific → surfaced
      ],
    });
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("what can I do here?"), tools);

    expect(d.reply).toContain("archive a task");        // derived from the manifest's item target
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
    ["/", "/grain/", "/notes/", "/loop/", "/notes/ten-times-zero/"],
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
    const { engine } = fakeEngine(["NAVIGATE:/loop"]);
    let navd = "";
    const { deps } = makeDeps({ loadEngine: async () => engine, loadCatalog: async () => CATALOG });
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);

    const d = await r.decide(chat("take me somewhere new"), makeTools().tools);

    expect(navd).toBe("/loop");
    expect(d.reply).toBe("Navigating to Loop");
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
