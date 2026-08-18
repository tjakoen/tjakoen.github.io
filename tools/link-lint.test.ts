// The one thing worth testing here is the boundary: a link the renderer rewrites must not fire, and
// a link it leaves alone must. Both directions, because a checker that flags everything gets muted
// and a checker that flags nothing is the state this tool was written to leave.

import { describe, expect, test } from "bun:test";
import { isDead, scan } from "./link-lint.ts";

describe("isDead", () => {
  test("flags a relative climb the renderer does not rewrite", () => {
    expect(isDead("../content/notes/ten-times-zero.md")).toBe(true);
    expect(isDead("../docs/PHILOSOPHY.md")).toBe(true);
    expect(isDead("../../README.md")).toBe(true);
  });

  test("passes a layer doc at any depth, which docsLink resolves", () => {
    expect(isDead("../../batch/docs/CONVENTIONS.md")).toBe(false);
    expect(isDead("../grain/docs/GRAIN.md")).toBe(false);
  });

  test("passes the shapes that never climb", () => {
    expect(isDead("AUDIT-STANDARD.md")).toBe(false);
    expect(isDead("./why-i-teach.md")).toBe(false);
    expect(isDead("/notes/ten-times-zero")).toBe(false);
    expect(isDead("https://github.com/tjakoen/batch#readme")).toBe(false);
  });

  test("keeps judging the path when a fragment is attached", () => {
    expect(isDead("../docs/PHILOSOPHY.md#the-beliefs")).toBe(true);
    expect(isDead("../../batch/docs/CONVENTIONS.md#section-4")).toBe(false);
  });
});

describe("scan", () => {
  test("reports the real line and target", () => {
    const source = ["# Title", "", "See [the note](../content/notes/origin-story.md) for more."].join("\n");
    expect(scan("standards/VOICE.md", source)).toEqual([
      { file: "standards/VOICE.md", line: 3, target: "../content/notes/origin-story.md" },
    ]);
  });

  test("reads an href the same way as a Markdown destination", () => {
    expect(scan("a.md", '<a href="../docs/PHILOSOPHY.md">beliefs</a>')).toHaveLength(1);
  });

  test("ignores a relative import inside a fenced block", () => {
    const source = ["```ts", 'import { Item } from "../domain/item.ts";', "```"].join("\n");
    expect(scan("docs/batch/ARCHITECTURE.md", source)).toEqual([]);
  });

  test("ignores a path inside inline code, which is prose about a path", () => {
    expect(scan("a.md", "never a hardcoded `../grain/docs` relative path")).toEqual([]);
  });

  test("would have caught the finding that survived two audits", () => {
    const source = "- [`GETTING-STARTED.md`](GETTING-STARTED.md) and [`SPLIT-PLAN`](../../SPLIT-PLAN.md).";
    expect(scan("docs/batch/CONSUME-AS-GIT-DEPS.md", source)).toHaveLength(1);
  });
});
