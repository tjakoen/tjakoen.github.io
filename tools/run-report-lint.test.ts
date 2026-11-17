// The lint is worth testing at its two edges: an entry that points at a real section must pass, and
// one that points at nothing must fail. A checker that flags everything gets muted, and one that
// flags nothing is the unbacked claim it was written to catch. The last block runs it over the real
// standards and the real run reports, so a renamed heading breaks this test rather than a link.

import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  CONSULTED_SINCE,
  headingAnchors,
  lintReport,
  loadStandards,
  parseEntry,
  type Standards,
} from "./run-report-lint.ts";

const standards: Standards = new Map([
  ["VOICE.md", new Set(["core-principles", "register-by-surface"])],
  ["LOOP.md", new Set(["a-the-run-ledger-evidence-or-it-didnt-happen"])],
]);

const report = (date: string, consulted: string) =>
  `---\ntitle: A run\ndate: ${date}\n${consulted}\n---\n\nbody\n`;

describe("parseEntry", () => {
  test("reads the three shapes", () => {
    expect(parseEntry("VOICE.md#core-principles")).toEqual({
      kind: "standard",
      file: "VOICE.md",
      anchor: "core-principles",
    });
    expect(parseEntry("LOOP.md")).toEqual({ kind: "standard", file: "LOOP.md", anchor: null });
    expect(parseEntry("skill:loop-standard")).toEqual({ kind: "skill", name: "loop-standard" });
    expect(parseEntry("skill:anthropic-skills:pdf")).toEqual({ kind: "skill", name: "anthropic-skills:pdf" });
    expect(parseEntry("graph:slugifyHeading")).toEqual({ kind: "graph", query: "slugifyHeading" });
  });

  test("refuses the shapes that would not line up with the index", () => {
    expect("error" in parseEntry("voice.md#core-principles")).toBe(true);
    expect("error" in parseEntry("standards/VOICE.md#core-principles")).toBe(true);
    expect("error" in parseEntry("VOICE.md#Core Principles")).toBe(true);
    expect("error" in parseEntry("skill:Voice")).toBe(true);
    expect("error" in parseEntry("graph:")).toBe(true);
    expect("error" in parseEntry("read the voice file")).toBe(true);
  });
});

describe("headingAnchors", () => {
  test("slugs ## and ### headings the way MILL renders them, and skips fences and #", () => {
    const md = [
      "# Title",
      "## 1. The primitives (Osmani's five)",
      "### (a) The run ledger — evidence",
      "## A [linked](https://x.test) `code` heading",
      "```md",
      "## not a heading",
      "```",
    ].join("\n");
    expect([...headingAnchors(md)]).toEqual([
      "1-the-primitives-osmanis-five",
      "a-the-run-ledger-evidence",
      "a-linked-code-heading",
    ]);
  });
});

describe("lintReport", () => {
  test("passes a list whose every entry resolves", () => {
    const text = report(
      CONSULTED_SINCE,
      "consulted:\n  - VOICE.md#core-principles\n  - LOOP.md\n  - skill:voice\n  - graph:lintReport",
    );
    expect(lintReport("r.md", text, standards)).toEqual([]);
  });

  test("flags an anchor with no heading and a file that is not a standard", () => {
    const text = report(CONSULTED_SINCE, "consulted:\n  - VOICE.md#no-such-section\n  - NOPE.md");
    const problems = lintReport("r.md", text, standards);
    expect(problems).toHaveLength(2);
    expect(problems[0]).toContain("VOICE.md#no-such-section");
    expect(problems[1]).toContain("NOPE.md");
  });

  test("owes the field from the cutoff on, and grandfathers what came before", () => {
    expect(lintReport("r.md", report(CONSULTED_SINCE, "status: complete"), standards)).toHaveLength(1);
    expect(lintReport("r.md", report("2026-11-11", "status: complete"), standards)).toEqual([]);
    expect(lintReport("2026-08-01-old.md", "# no frontmatter\n", standards)).toEqual([]);
    expect(lintReport("2026-12-01-new.md", "# no frontmatter\n", standards)).toHaveLength(1);
  });

  test("accepts none as an honest answer, and refuses an empty list that says nothing", () => {
    expect(lintReport("r.md", report(CONSULTED_SINCE, "consulted: none"), standards)).toEqual([]);
    expect(lintReport("r.md", report(CONSULTED_SINCE, "consulted: []"), standards)).toHaveLength(1);
    expect(lintReport("r.md", report(CONSULTED_SINCE, "consulted: VOICE.md"), standards)).toHaveLength(1);
  });
});

describe("the real tree", () => {
  test("every run report under artifacts/runs/ passes against the real standards", async () => {
    const real = await loadStandards();
    const dir = "artifacts/runs";
    const files = (await readdir(dir)).filter((name) => name.endsWith(".md") && name !== "README.md");
    const problems: string[] = [];
    for (const name of files) {
      problems.push(...lintReport(join(dir, name), await readFile(join(dir, name), "utf8"), real));
    }
    expect(problems).toEqual([]);
  });
});
