// The two things worth testing here are the renderer and the trim, because both decide what a dream
// is allowed to believe it read. A renderer that drops tool results loses the evidence; one that
// keeps a whole session loses the middle and must say so; a trim that silently shortens a transcript
// turns "I read this session" into a lie. Everything else in tools/dream.ts is file plumbing.

import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  coverage,
  dreamDueLine,
  dreamLimits,
  dshSlug,
  indexCoverage,
  isDreamDue,
  memoryIndexPath,
  frontmatterDate,
  frontmatterTitle,
  isInside,
  renderTranscript,
  ROOT,
  parseEvents,
  safeName,
  sessionHeader,
  stripHarnessNoise,
  trimToBudget,
  type Manifest,
  type TranscriptEvent,
} from "./dream.ts";

describe("trimToBudget", () => {
  test("leaves a short text exactly as it was", () => {
    const text = "USER:\nsmall session";
    expect(trimToBudget(text, 1_000)).toEqual({ text, elided: 0 });
  });

  test("keeps the head and the tail and drops the middle", () => {
    const text = `HEAD${"x".repeat(5_000)}TAIL`;
    const { text: out, elided } = trimToBudget(text, 1_000);
    expect(out.startsWith("HEAD")).toBe(true);
    expect(out.endsWith("TAIL")).toBe(true);
    expect(out).toContain("characters elided from the middle");
    expect(elided).toBeGreaterThan(4_000);
    expect(out).not.toContain("x".repeat(5_000));
  });

  test("never runs past the cap it advertises, marker included", () => {
    const text = "y".repeat(50_000);
    const { text: out } = trimToBudget(text, 1_000);
    expect(out.length).toBeLessThanOrEqual(1_000);
  });
});

describe("renderTranscript", () => {
  const events: TranscriptEvent[] = [
    { type: "session", id: "abc", createdAt: Date.UTC(2026, 10, 9), cwd: "/repo" },
    { type: "system/message", data: { message: { content: [{ type: "text", text: "harness preamble" }] } } },
    {
      type: "user/message",
      data: { content: [{ type: "text", text: "fix the bar" }] },
    },
    {
      type: "assistant/message",
      data: {
        message: {
          content: [
            { type: "reasoning", text: "thinking that is not evidence" },
            { type: "text", text: "the bar is baked at export" },
          ],
        },
      },
    },
    { type: "tool/call", data: { callId: "c1", name: "bash", arguments: '{"command":"bun test"}' } },
    {
      type: "tool/result",
      data: {
        message: { toolCallId: "c1", isError: false, content: [{ type: "text", text: "94 pass\n0 fail" }] },
      },
    },
  ];

  test("keeps what the agent was asked, concluded and ran", () => {
    const { text } = renderTranscript(events);
    expect(text).toContain("USER:\nfix the bar");
    expect(text).toContain("AGENT:\nthe bar is baked at export");
    expect(text).toContain("TOOL CALL bash:");
    expect(text).toContain("TOOL RESULT (bash):\n94 pass\n0 fail");
  });

  test("leaves out the reasoning and the harness preamble", () => {
    const { text } = renderTranscript(events);
    expect(text).not.toContain("thinking that is not evidence");
    expect(text).not.toContain("harness preamble");
  });

  test("names a result by the call it answers, and flags an error", () => {
    const { text } = renderTranscript([
      { type: "tool/call", data: { callId: "c9", name: "read", arguments: "{}" } },
      { type: "tool/result", data: { message: { toolCallId: "c9", isError: true, content: [{ type: "text", text: "ENOENT" }] } } },
    ]);
    expect(text).toContain("TOOL RESULT (read) (error):");
  });

  test("clips one huge result and counts what it dropped", () => {
    const big = "y".repeat(20_000);
    const { text, elidedChars } = renderTranscript(
      [{ type: "tool/result", data: { message: { toolCallId: "nope", content: [{ type: "text", text: big }] } } }],
      { maxResultChars: 100, maxChars: 1_000_000 },
    );
    expect(text).toContain("TOOL RESULT (tool):");
    expect(elidedChars).toBe(19_900);
  });
});

describe("stripHarnessNoise", () => {
  test("drops the workspace instructions the harness repeats in every user turn", () => {
    const text = "fix the bar\n\n<system-reminder>\nInstructions from: ~/.dsh/AGENTS.md\nno filler\n</system-reminder>";
    expect(stripHarnessNoise(text)).toBe("fix the bar");
  });

  test("leaves a user turn that carries no reminder alone", () => {
    expect(stripHarnessNoise("  fix the bar  ")).toBe("fix the bar");
  });
});

describe("the run dir never lands in the repository", () => {
  test("the project root and anything under it are inside", () => {
    expect(isInside("/repo", "/repo")).toBe(true);
    expect(isInside("/repo", "/repo/artifacts/dream")).toBe(true);
  });

  test("a symlink from outside that resolves into the repository counts as inside", () => {
    const outside = mkdtempSync(join(tmpdir(), "dream-link-"));
    const repo = join(outside, "repo");
    mkdirSync(repo);
    const link = join(outside, "link");
    symlinkSync(repo, link);
    expect(isInside(repo, link)).toBe(true);
  });

  test("a sibling and a parent are not", () => {
    expect(isInside("/repo", "/repo-other/x")).toBe(false);
    expect(isInside("/repo", "/etc/dream")).toBe(false);
    expect(isInside("/repo", "/tmp/dsh-dream-repo")).toBe(false);
  });

  test("a child whose name starts with two dots is still a child", () => {
    // The first version read every ".." prefix as a climb, so --out /repo/..foo wrote a transcript
    // into the repository while the guard said it was outside.
    expect(isInside("/repo", "/repo/..foo")).toBe(true);
    expect(isInside("/repo", "/repo/..")).toBe(false);
  });
});

describe("project slugs", () => {
  // Both were read off the real directories rather than invented, because a wrong slug means an
  // empty sessions lane that looks like a project with no history.
  const cwd = "/Users/tjakoenstolk/Local/Development/bread-repos/tjakoen.github.io";

  test("dsh keeps the dots and pads with two dashes", () => {
    expect(dshSlug(cwd)).toBe("--Users-tjakoenstolk-Local-Development-bread-repos-tjakoen.github.io--");
  });

  test("the tool's root is this repository whatever directory it is run from", () => {
    expect(existsSync(join(ROOT, "package.json"))).toBe(true);
    expect(existsSync(join(ROOT, "tools", "dream.ts"))).toBe(true);
  });
});

describe("safeName", () => {
  test("a session that names itself a path cannot steer the write", () => {
    for (const raw of ["../escape", "a/b", "..", ".", ""]) {
      const name = safeName(raw);
      expect(name).not.toContain("/");
      expect(name.startsWith("..")).toBe(false);
    }
  });

  test("a normal id survives unchanged", () => {
    expect(safeName("66ccb635-1426-420f-a43b-4dd8ff59e98f")).toBe("66ccb635-1426-420f-a43b-4dd8ff59e98f");
  });
});

describe("parseEvents", () => {
  test("counts a line that will not parse instead of hiding it", () => {
    const parsed = parseEvents('{"type":"session","id":"a"}\n[not json\n');
    expect(parsed.events).toHaveLength(1);
    expect(parsed.skipped).toBe(1);
  });
});

describe("isDreamDue", () => {
  const clock = (ageDays: number, newItems: number) => ({ ageDays, newItems, runs: newItems, sessions: 0 });

  test("enough new work makes it due whatever the age", () => {
    expect(isDreamDue(clock(1, 8))).toBe(true);
  });

  test("a quiet week is not due", () => {
    expect(isDreamDue(clock(5, 3))).toBe(false);
  });

  test("an abandoned index is due on a single new fact", () => {
    expect(isDreamDue(clock(31, 1))).toBe(true);
  });

  test("an old index with nothing new is not due, because there is nothing to read", () => {
    expect(isDreamDue(clock(400, 0))).toBe(false);
  });
});

describe("dreamLimits", () => {
  test("zero is a threshold, not a missing value", () => {
    expect(dreamLimits({ DREAM_MIN_ITEMS: "0", DREAM_MAX_AGE_DAYS: "0" })).toEqual({
      minItems: 0,
      maxAgeDays: 0,
    });
  });

  test("nonsense falls back to the dull defaults", () => {
    expect(dreamLimits({ DREAM_MIN_ITEMS: "many" })).toEqual({ minItems: 8, maxAgeDays: 30 });
  });
});

describe("the memory store path", () => {
  test("follows the harness slug rule, dots turned to dashes", () => {
    expect(
      memoryIndexPath("/Users/tjakoenstolk/Local/Development/bread-repos/tjakoen.github.io"),
    ).toEndWith("/.claude/projects/-Users-tjakoenstolk-Local-Development-bread-repos-tjakoen-github-io/memory/MEMORY.md");
  });
});

describe("dreamDueLine", () => {
  test("names the evidence and the way to act on it", () => {
    const line = dreamDueLine({ ageDays: 12, newItems: 9, runs: 6, sessions: 3 });
    expect(line).toContain("12 day(s) ago");
    expect(line).toContain("6 run report(s), 3 session(s)");
    expect(line).toContain("plans/memory-dream.md");
  });
});

describe("indexCoverage", () => {
  const index = "# Memory index\n\n- [a](a.md): one\n- [b](b.md): two\n- [c](c.md): three\n";

  test("a full index over its notes is clean", () => {
    expect(indexCoverage(index, ["MEMORY.md", "a.md", "b.md", "c.md"])).toEqual({
      missing: [],
      dead: [],
      duplicates: [],
      linked: 3,
    });
  });

  test("names a note with no line, a line with no note, and a note linked twice", () => {
    const thin = "- [a](a.md): one\n- [a](a.md): one again\n- [gone](gone.md): nothing\n";
    const found = indexCoverage(thin, ["MEMORY.md", "a.md", "b.md"]);
    expect(found.missing).toEqual(["b.md"]);
    expect(found.dead).toEqual(["gone.md"]);
    expect(found.duplicates).toEqual(["a.md"]);
  });

  test("a line carrying three links counts all three", () => {
    const bundled = "- audits: [a](a.md); [b](b.md); [c](c.md): three\n";
    expect(indexCoverage(bundled, ["MEMORY.md", "a.md", "b.md", "c.md"]).missing).toEqual([]);
  });
});

describe("coverage", () => {
  test("names every source with no output", () => {
    const dir = mkdtempSync(join(tmpdir(), "dream-test-"));
    const present = join(dir, "present.txt");
    writeFileSync(present, "ok");
    const manifest = {
      sources: [
        { id: "a", outputPath: present },
        { id: "b", outputPath: join(dir, "absent.txt") },
      ],
    } as unknown as Manifest;
    expect(coverage(manifest)).toEqual({ total: 2, missing: ["b"] });
  });
});

describe("frontmatter", () => {
  const report = "---\ntitle: Keep the view counts\ndate: 2026-11-09\n---\n\nbody";

  test("reads the date a dream must date a fact with", () => {
    expect(frontmatterDate(report)).toBe("2026-11-09");
  });

  test("reads the title", () => {
    expect(frontmatterTitle(report)).toBe("Keep the view counts");
  });

  test("finds the date behind a title long enough to fill a real report's header", () => {
    // The first version read only 400 characters, so a report whose title and fields ran past that
    // lost its date, and --since then skipped every report in the corpus.
    const long = `---\ntitle: ${"A very long run report title ".repeat(20)}\ndate: 2026-11-09\nstatus: complete\n---\n\nbody`;
    expect(long.indexOf("date:")).toBeGreaterThan(400);
    expect(frontmatterDate(long)).toBe("2026-11-09");
    expect(frontmatterTitle(long)?.startsWith("A very long run report title")).toBe(true);
  });

  test("returns undefined without frontmatter rather than guessing", () => {
    expect(frontmatterDate("# no frontmatter")).toBeUndefined();
  });
});

describe("sessionHeader", () => {
  test("dates the session absolutely", () => {
    const header = sessionHeader({ id: "abc", createdAt: Date.UTC(2026, 10, 9), origin: "subagent" });
    expect(header).toContain("date: 2026-11-09");
    expect(header).toContain("origin: subagent");
  });
});
