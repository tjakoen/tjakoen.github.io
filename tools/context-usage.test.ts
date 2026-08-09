// portfolio/tools/context-usage.test.ts — the context reader tells the truth about what a session
// is carrying. Every case here is one the real transcripts actually produce, which is why the
// fixtures are shaped like transcript lines rather than like a convenient object.
import { test, expect, describe } from "bun:test";
import { readContext, formatReading, projectSlug } from "./context-usage.ts";

const turn = (usage: Record<string, number>, extra: Record<string, unknown> = {}) =>
  JSON.stringify({ type: "assistant", message: { model: "claude-opus-5", usage }, ...extra });

describe("readContext", () => {
  test("counts the input side of the newest turn, not the sum of every turn", () => {
    const raw = [
      turn({ input_tokens: 10, cache_read_input_tokens: 1000, output_tokens: 500 }),
      turn({ input_tokens: 2, cache_creation_input_tokens: 300, cache_read_input_tokens: 5000, output_tokens: 900 }),
    ].join("\n");
    const r = readContext(raw);
    expect(r.context).toBe(5302);           // 2 + 300 + 5000 — the last turn only
    expect(r.turns).toBe(2);
  });

  // The bug this guards: once the cache is warm `input_tokens` drops to single digits, so a reader
  // that counts only that field reports a full session as empty.
  test("cached reads count — they are still occupying the window", () => {
    const r = readContext(turn({ input_tokens: 2, cache_read_input_tokens: 240_000, output_tokens: 700 }));
    expect(r.context).toBe(240_002);
  });

  test("output tokens are excluded — they are what the turn produced, not what it carried", () => {
    const r = readContext(turn({ input_tokens: 100, output_tokens: 999_999 }));
    expect(r.context).toBe(100);
  });

  test("subagent turns are skipped, so a fan-out cannot make a full thread look comfortable", () => {
    const raw = [
      turn({ input_tokens: 5, cache_read_input_tokens: 800_000 }),
      turn({ input_tokens: 5, cache_read_input_tokens: 3_000 }, { isSidechain: true }),
    ].join("\n");
    const r = readContext(raw);
    expect(r.context).toBe(800_005);
    expect(r.turns).toBe(1);
  });

  // A compaction drops the carried context. Taking the max would keep reporting the old peak forever.
  test("last turn wins, so a compaction reads as a compaction", () => {
    const raw = [
      turn({ cache_read_input_tokens: 900_000 }),
      turn({ cache_read_input_tokens: 40_000 }),
    ].join("\n");
    expect(readContext(raw).context).toBe(40_000);
  });

  test("non-assistant lines, usage-less turns and a half-written last line are all survivable", () => {
    const raw = [
      JSON.stringify({ type: "user", message: { content: "hi" } }),
      JSON.stringify({ type: "assistant", message: { model: "x" } }),   // no usage yet
      turn({ cache_read_input_tokens: 123 }),
      `{"type":"assistant","message":{"usa`,                            // the live-session tail
    ].join("\n");
    const r = readContext(raw);
    expect(r.context).toBe(123);
    expect(r.turns).toBe(1);
  });

  test("an empty transcript reads as zero turns, not zero context", () => {
    const r = readContext("");
    expect(r.turns).toBe(0);
    expect(formatReading({ ...r, transcript: "x.jsonl" })).toContain("no completed assistant turns");
  });

  test("the verdict moves at the thresholds it was given", () => {
    const at = (n: number) => readContext(turn({ cache_read_input_tokens: n }), { warn: 100, stop: 200 }).verdict;
    expect(at(99)).toBe("ok");
    expect(at(100)).toBe("warn");
    expect(at(200)).toBe("stop");
  });

  test("the warn text asks for a handoff and names where the shape lives", () => {
    const r = readContext(turn({ cache_read_input_tokens: 150 }), { warn: 100, stop: 200 });
    expect(formatReading(r)).toContain("hand off");
    expect(formatReading({ ...r, context: 250, verdict: "stop" })).toContain("SESSION-LOOP section 5");
  });
});

describe("projectSlug", () => {
  test("matches the transcript dir the harness actually writes", () => {
    expect(projectSlug("/Users/x/Local/Development/bread-repos/tjakoen.github.io"))
      .toBe("-Users-x-Local-Development-bread-repos-tjakoen-github-io");
  });
});
