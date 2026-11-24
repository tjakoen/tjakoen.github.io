// models-standard.test.ts: the published tier table and the registry must name the same OpenCode lane.
//
// The registry is the only home of model ids. standards/MODELS.md is the table an agent and a reader meet
// first, so a lane that exists in the registry and is missing from the table (or the other way round) is the
// drift that produced a wrong sentence in a note. The test reads the installed model-roles tool, so it skips
// on a machine that has never been linked rather than failing a checkout that does not carry the registry.
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const REGISTRY_TOOL = join(homedir(), ".claude", "tools", "model-roles.ts");
const STANDARD = join(import.meta.dir, "..", "standards", "MODELS.md");

describe.skipIf(!existsSync(REGISTRY_TOOL))("MODELS.md and the registry", () => {
  const read = (file: string) => readFileSync(file, "utf8");
  const row = (text: string, label: string) =>
    text.split("\n").find((line) => line.startsWith(`| ${label} |`))?.split("|").map((cell) => cell.trim());

  test("the OpenCode strong cell names the Codex model and the Go strong lane", async () => {
    const { loadRegistry } = await import(REGISTRY_TOOL);
    const reg = loadRegistry();
    const cells = row(read(STANDARD), "strong");
    expect(cells).toBeDefined();
    const opencode = cells![5];
    expect(opencode).toContain("gpt-6.2-sol");
    expect(opencode).toContain("DeepSeek V4 Pro");
    expect(opencode).not.toContain("Sonnet");
    expect(reg.fallback.opencode.strongGo.model).toBe("DeepSeek V4 Pro (Go)");
  });

  test("the OpenCode main row names the same Go strong lane", async () => {
    const cells = row(read(STANDARD), "execution (main)");
    expect(cells).toBeDefined();
    const opencode = cells![5];
    expect(opencode).toContain("gpt-6.2-sol");
    expect(opencode).toContain("DeepSeek V4 Pro");
    expect(opencode).toContain("light chain");
  });
});
