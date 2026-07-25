// portfolio/ai/memory.test.ts — C2 visitor memory: write-time sanitize (decline over-cap, never
// truncate the visitor's words), the one line marker, and read-time parseMemories (protocol-token
// strip, last-N, total cap, and the post-reload single-blob shape grain's notepad round-trip leaves
// behind — see notepad.js RESTORE).
import { test, expect, describe } from "bun:test";
import { sanitizeMemoryFact, memoryLine, parseMemories, MEMORY_PREFIX, MEMORY_FACT_CAP } from "./memory.ts";

describe("sanitizeMemoryFact", () => {
  test("collapses whitespace (incl. newlines) to one line and trims", () => {
    expect(sanitizeMemoryFact("  I'm here   about\n  grain  ")).toBe("I'm here about grain");
  });

  test("strips a NAVIGATE: protocol token (route only, rest of the fact survives)", () => {
    expect(sanitizeMemoryFact("I'm here about grain NAVIGATE:/evil today")).toBe("I'm here about grain today");
    expect(sanitizeMemoryFact("navigate:/evil")).toBeNull();   // nothing usable survives
  });

  test("strips a CHOICES: protocol token (takes the rest of the line, like the model's own protocol)", () => {
    expect(sanitizeMemoryFact("my name is Anna CHOICES: pick one | a | b")).toBe("my name is Anna");
  });

  test("protocol tokens are stripped case-insensitively", () => {
    expect(sanitizeMemoryFact("hello Navigate:/x world")).toBe("hello world");
  });

  test("empty or whitespace-only input declines (null, not empty string)", () => {
    expect(sanitizeMemoryFact("")).toBeNull();
    expect(sanitizeMemoryFact("   ")).toBeNull();
  });

  test("a fact within the cap survives untouched (aside from whitespace collapse)", () => {
    const fact = "a".repeat(MEMORY_FACT_CAP);
    expect(sanitizeMemoryFact(fact)).toBe(fact);
  });

  test("over the write cap DECLINES — never a silent truncation of the visitor's words", () => {
    const long = "a".repeat(MEMORY_FACT_CAP + 1);
    expect(sanitizeMemoryFact(long)).toBeNull();
  });
});

describe("memoryLine", () => {
  test("prefixes the fact with the exact marker", () => {
    expect(memoryLine("my name is Anna")).toBe("- Desk memory: my name is Anna");
    expect(memoryLine("my name is Anna")).toBe(`${MEMORY_PREFIX}my name is Anna`);
  });
});

describe("parseMemories", () => {
  test("reads back a single marked line", () => {
    expect(parseMemories("- Desk memory: I'm here about grain")).toEqual(["I'm here about grain"]);
  });

  test("ignores ordinary bullets and non-memory lines", () => {
    const pad = "# Notes\n- buy milk\n- Desk memory: my name is Anna\n- another thing";
    expect(parseMemories(pad)).toEqual(["my name is Anna"]);
  });

  test("keeps only the LAST 3, oldest of those first", () => {
    const pad = [1, 2, 3, 4, 5].map((n) => `- Desk memory: fact ${n}`).join("\n");
    expect(parseMemories(pad)).toEqual(["fact 3", "fact 4", "fact 5"]);
  });

  test("a custom max is honored", () => {
    const pad = [1, 2, 3].map((n) => `- Desk memory: fact ${n}`).join("\n");
    expect(parseMemories(pad, 1)).toEqual(["fact 3"]);
  });

  test("re-sanitizes on read: a hand-edited line carrying a protocol token comes back stripped", () => {
    const pad = "- Desk memory: I'm here about grain NAVIGATE:/evil";
    const out = parseMemories(pad);
    expect(out).toEqual(["I'm here about grain"]);
    expect(out.join(" ")).not.toContain("NAVIGATE");
  });

  test("an over-length hand-edited line is truncated (with an ellipsis), not dropped", () => {
    const pad = `- Desk memory: ${"a".repeat(250)}`;
    const out = parseMemories(pad);
    expect(out.length).toBe(1);
    expect(out[0]!.length).toBeLessThanOrEqual(200);
    expect(out[0]!.endsWith("…")).toBe(true);
  });

  test("total cap 400 across the kept lines — drops from the OLDEST of the kept set to fit", () => {
    const pad = [1, 2, 3].map((n) => `- Desk memory: ${"x".repeat(150)} ${n}`).join("\n");
    const out = parseMemories(pad);
    const total = out.reduce((n, f) => n + f.length, 0);
    expect(total).toBeLessThanOrEqual(400);
    // the newest fact ("3") survives; the oldest ("1") was dropped to make room
    expect(out.some((f) => f.endsWith("3"))).toBe(true);
    expect(out.some((f) => f.endsWith("1"))).toBe(false);
  });

  test("post-reload single-blob input: grain's notepad RESTORE folds every entry into ONE markdown blob", () => {
    // deriveSource joins entries with "\n\n" — a memory line survives that fold as long as it's
    // still its own line inside the blob, which is exactly what memoryLine's bullet produces.
    const blob = "# My notepad\n\nSome visitor bullet\n\n- Desk memory: visiting as a developer\n\nAnother line";
    expect(parseMemories(blob)).toEqual(["visiting as a developer"]);
  });

  test("no memory lines at all → empty array", () => {
    expect(parseMemories("just some plain notes\nwith no markers")).toEqual([]);
  });
});
