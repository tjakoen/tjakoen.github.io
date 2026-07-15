// portfolio/ai/desk-reasoner.test.ts — the desk reasoner with a FAKE engine + captured emit.
// Covers the offline-not-stub requirement (2026-07-13): a failed/absent model marks the chat OFFLINE
// and never delegates chat to the stub. Headless CI has no WebGPU, so this fake-driven suite IS the
// coverage for both the healthy and the degraded paths.
import { test, expect, describe } from "bun:test";
import { makeDeskReasoner, navRoutesFromManifest, parseArrival, type DeskDeps } from "./desk-reasoner.ts";
import type { DeskEngine } from "./webllm-loader.ts";
import type { Knowledge } from "./retrieval.ts";
import type { Reasoner, ReasonTools } from "@tjakoen/grain/ai/reasoner.ts";
import type { Intent, RenderOp } from "@tjakoen/grain/ai/contract.ts";
import * as kit from "@tjakoen/grain/ai/reasoner-kit.ts";

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
    probe: async () => true,
    loadEngine: async () => fakeEngine(["Hello"]).engine,
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
    expect(body(ops)!.html).toContain("GRAIN");             // page title woven in
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
    expect(body(ops)!.html).toContain("archive a task");
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

    const bubble = captured.find((o) => o.op === "append" && o.target === "chat-log");
    expect(bubble).toBeDefined();
    expect(bubble!.provenance).toBe("ai");
    expect(bubble!.html).toContain("You're on the Notes page");   // the greeting, in the bubble body
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

describe("navRoutesFromManifest", () => {
  test("pulls bare routes out of manifestForReasoner's nav: lines, ignoring everything else", () => {
    const text = [
      "screen: loop",
      "targets: (4)",
      "- nav:/grain [nav] -> (no verb currently targets this)",
      "- nav:/notes [nav] -> (no verb currently targets this)",
      "- chat-log [chat-log] -> chat.send",
      "- item:ITM-1 [item] -> item.archive",
    ].join("\n");
    expect(navRoutesFromManifest(text)).toEqual(["/grain", "/notes"]);
  });

  test("no nav: lines → empty list", () => {
    expect(navRoutesFromManifest("screen: (none)\ntargets: (none — this page declares no [data-surface] elements)")).toEqual([]);
  });
});

describe("makeDeskReasoner — Tier-2 navigation (the model's own NAVIGATE:<route> choice)", () => {
  const manifestWith = (...routes: string[]): string =>
    routes.map((r) => `- nav:${r} [nav] -> (no verb currently targets this)`).join("\n");

  test("model replies NAVIGATE:<route> for a route it was actually offered → the desk navigates", async () => {
    const { engine } = fakeEngine(["NAVIGATE:/loop"]);
    let navd = "";
    const { deps } = makeDeps({ loadEngine: async () => engine });
    deps.navigate = (u) => { navd = u; };
    deps.pageManifestText = () => manifestWith("/loop", "/notes");
    const r = makeDeskReasoner(deps);
    const { tools, ops } = makeTools();

    const d = await r.decide(chat("take me somewhere new"), tools);

    expect(navd).toBe("/loop");
    expect(d.reply).toBe("Navigating to /loop");
    // the raw sentinel never settles as the visible reply — it's replaced with a friendly line
    const lastReplace = [...ops].reverse().find((o) => o.op === "replace");
    expect(lastReplace!.html).not.toContain("NAVIGATE:");
    expect(lastReplace!.html).toContain("Taking you to /loop");
    expect(ops.some((o) => o.op === "spotlight" && o.target === "nav:/loop" && o.active)).toBe(true);
  });

  test("model names a route it was NOT offered → treated as plain text, no navigation", async () => {
    const { engine } = fakeEngine(["NAVIGATE:/secret-admin"]);
    let navd = "";
    const { deps } = makeDeps({ loadEngine: async () => engine });
    deps.navigate = (u) => { navd = u; };
    deps.pageManifestText = () => manifestWith("/loop");   // "/secret-admin" was never offered
    const r = makeDeskReasoner(deps);
    const { tools } = makeTools();

    const d = await r.decide(chat("take me somewhere"), tools);

    expect(navd).toBe("");                       // never navigated
    expect(d.reply).toBe("NAVIGATE:/secret-admin");   // fell through to a plain (if odd) reply
  });

  test("no manifest offered (e.g. a page with no live nav) → the prompt gets no NAVIGATE protocol, model answers normally", async () => {
    const { engine } = fakeEngine(["Just an answer."]);
    let navd = "";
    const { deps } = makeDeps({ loadEngine: async () => engine });
    deps.navigate = (u) => { navd = u; };
    const r = makeDeskReasoner(deps);   // no pageManifestText dep at all

    const d = await r.decide(chat("who is TJ?"), makeTools().tools);

    expect(navd).toBe("");
    expect(d.reply).toBe("Just an answer.");
  });
});
