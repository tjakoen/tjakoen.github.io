import { describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const LINT = join(import.meta.dir, "voice-lint.ts");

/** Emoji findings voice-lint reports for one Markdown file's text. */
function emojiFindings(text: string): number {
  const dir = mkdtempSync(join(tmpdir(), "voice-emoji-"));
  const file = join(dir, "page.md");
  writeFileSync(file, text);
  const r = Bun.spawnSync(["bun", LINT, file], { stdout: "pipe", stderr: "pipe" });
  return (r.stdout.toString() + r.stderr.toString()).split("\n").filter((l) => l.includes("emoji in published prose")).length;
}

describe("the emoji rule and palette tables", () => {
  test("a table cell holding only an emoji is a palette entry and is not flagged", () => {
    expect(emojiFindings("| Gitmoji | Use |\n| --- | --- |\n| ✨ | A new feature. |\n| ♻️ | A refactor. |\n| 🚑️ | An urgent fix. |\n")).toBe(0);
  });

  test("an emoji beside words in a table cell is still flagged", () => {
    expect(emojiFindings("| Step | Note |\n| --- | --- |\n| one | ✨ shiny |\n")).toBe(1);
  });

  test("an emoji in a prose line is still flagged", () => {
    expect(emojiFindings("A plain merge keeps the 🔀 emoji.\n")).toBe(1);
  });
});
