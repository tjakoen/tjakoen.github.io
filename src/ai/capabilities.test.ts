// portfolio/ai/capabilities.test.ts — the ONE capability catalog. Pins: operate/see are derived from
// the manifest ONLY (never a hand-typed guess), the built-ins come from actions.ts's own vocabulary
// (never duplicated here), and the phrase order keeps self-contained capabilities ahead of navigation
// (the audit finding both consumers — the capabilities reply and the model's canDo feed — rely on).
import { test, expect, describe } from "bun:test";
import { buildCapabilityCatalog, catalogPhrases } from "./capabilities.ts";
import { ACTION_CAPABILITIES } from "./actions.ts";
import type { Manifest } from "@tjakoen/grain/ai/manifest.ts";

const manifest = (targets: Manifest["targets"], readable: unknown[] = []): Manifest => ({
  screen: "test", actions: [], note: "",
  inView: readable.length ? { readable } : {},
  targets,
});

describe("buildCapabilityCatalog — operate (DOM + registry derived)", () => {
  test("a page-specific target's accepted verb becomes an operate capability", () => {
    const m = manifest([{ id: "item:ITM-1", kind: "item", accepts: ["item.archive"] }]);
    const catalog = buildCapabilityCatalog({ manifest: m, hasDestinations: false });
    expect(catalog.operate.map((c) => c.phrase)).toContain("archive an item");
  });

  test("the generic screen/chat-log targets never contribute an operate capability", () => {
    const m = manifest([
      { id: "screen", kind: "screen", accepts: ["demo.run"] },
      { id: "chat-log", kind: "chat-log", accepts: ["chat.send"] },
    ]);
    const catalog = buildCapabilityCatalog({ manifest: m, hasDestinations: false });
    expect(catalog.operate.map((c) => c.phrase)).not.toContain("watch the desk act out a live demo");
  });

  test("two targets accepting the same verb only produce ONE capability (deduped)", () => {
    const m = manifest([
      { id: "item:A", kind: "item", accepts: ["item.archive"] },
      { id: "item:B", kind: "item", accepts: ["item.archive"] },
    ]);
    const catalog = buildCapabilityCatalog({ manifest: m, hasDestinations: false });
    expect(catalog.operate.filter((c) => c.verb === "item.archive").length).toBe(1);
  });

  test("a verb with no phrase mapping is real (in the manifest) but silently unnarrated", () => {
    const m = manifest([{ id: "notepad-src", kind: "notepad", accepts: ["note.replace"] }]);
    const catalog = buildCapabilityCatalog({ manifest: m, hasDestinations: false });
    // note.replace is the human's Commit button, not a verb the desk narrates as its own
    expect(catalog.operate.some((c) => c.verb === "note.replace")).toBe(false);
  });

  test("note.append (the notepad target every page's shell carries) becomes the ONE remember capability", () => {
    const m = manifest([{ id: "notepad", kind: "notepad", accepts: ["note.append", "note.replace"] }]);
    const catalog = buildCapabilityCatalog({ manifest: m, hasDestinations: false });
    expect(catalog.operate.map((c) => c.phrase)).toContain("remember something you tell me, on your notepad");
  });
});

describe("buildCapabilityCatalog — see (readable regions)", () => {
  test("no data-read surfaces on the page ⇒ no readable-region capability", () => {
    const m = manifest([{ id: "screen", kind: "screen", accepts: [] }]);
    const catalog = buildCapabilityCatalog({ manifest: m, hasDestinations: false });
    expect(catalog.see.some((c) => c.verb.startsWith("read:"))).toBe(false);
  });

  test("a data-read surface becomes a see capability, with a friendly phrase for a known kind", () => {
    const m = manifest([], [{ id: "notepad-body", kind: "notepad", text: "hello" }]);
    const catalog = buildCapabilityCatalog({ manifest: m, hasDestinations: false });
    expect(catalog.see.map((c) => c.phrase)).toContain("see what's on your notepad");
  });

  test("an unrecognized readable kind still renders, with the generic fallback phrase", () => {
    const m = manifest([], [{ id: "widget", kind: "gizmo", text: "hi" }]);
    const catalog = buildCapabilityCatalog({ manifest: m, hasDestinations: false });
    expect(catalog.see.map((c) => c.phrase)).toContain("read what's on the gizmo");
  });

  test("two readable surfaces of the same kind only produce ONE capability (deduped)", () => {
    const m = manifest([], [
      { id: "a", kind: "gizmo", text: "1" },
      { id: "b", kind: "gizmo", text: "2" },
    ]);
    const catalog = buildCapabilityCatalog({ manifest: m, hasDestinations: false });
    expect(catalog.see.filter((c) => c.verb === "read:gizmo").length).toBe(1);
  });
});

describe("buildCapabilityCatalog — navigate + built-ins from actions.ts", () => {
  test("every ACTION_CAPABILITIES entry lands in the catalog's matching group", () => {
    const catalog = buildCapabilityCatalog({ manifest: undefined, hasDestinations: false });
    for (const ac of ACTION_CAPABILITIES) {
      const group = ac.group === "see" ? catalog.see : ac.group === "navigate" ? catalog.navigate : catalog.operate;
      expect(group.map((c) => c.phrase)).toContain(ac.phrase);
    }
  });

  test("the generic 'take you to any page' capability only appears when there's somewhere to go", () => {
    const withDest = buildCapabilityCatalog({ manifest: undefined, hasDestinations: true });
    const withoutDest = buildCapabilityCatalog({ manifest: undefined, hasDestinations: false });
    expect(withDest.navigate.map((c) => c.phrase)).toContain("take you to any page on this site");
    expect(withoutDest.navigate.map((c) => c.phrase)).not.toContain("take you to any page on this site");
  });

  test("an absent manifest still carries the code-enumerated built-ins (headless-safe)", () => {
    const catalog = buildCapabilityCatalog({ manifest: undefined, hasDestinations: false });
    expect(catalog.see.length + catalog.navigate.length + catalog.operate.length).toBeGreaterThan(0);
  });
});

describe("catalogPhrases", () => {
  test("orders see + operate ahead of navigate, regardless of build order", () => {
    const m = manifest([{ id: "item:A", kind: "item", accepts: ["item.archive"] }]);
    const catalog = buildCapabilityCatalog({ manifest: m, hasDestinations: true });
    const phrases = catalogPhrases(catalog);
    const navIdx = phrases.indexOf("take you to any page on this site");
    const operateIdx = phrases.indexOf("archive an item");
    expect(operateIdx).toBeGreaterThanOrEqual(0);
    expect(navIdx).toBeGreaterThan(operateIdx);
  });

  test("flattens every group into one array, in group order", () => {
    const catalog = { see: [{ group: "see" as const, verb: "s", phrase: "S" }], navigate: [{ group: "navigate" as const, verb: "n", phrase: "N" }], operate: [{ group: "operate" as const, verb: "o", phrase: "O" }] };
    expect(catalogPhrases(catalog)).toEqual(["S", "O", "N"]);
  });
});
