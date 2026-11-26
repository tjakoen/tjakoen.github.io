// tools/note-contract.test.ts — the frontmatter and share contract NOTE-STANDARD states, over the
// real notes rather than a fixture.
//
// Why a test and not a review habit: the share block is opt-in at render time. A note with no
// `social` key renders with no block and nothing fails, so two published notes shipped without a card
// in November and the suite stayed green. A contract that only a reader can catch is a sentence.
//
// Drafts are allowed to be incomplete. The rule applies at PUBLISHED, which is the point at which the
// note is announced, so a DRAFT with no block is reported by the count at the bottom rather than
// failing the suite.
import { test, expect } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { Glob } from "bun";
import { join } from "node:path";

const CUTOVER = "2026-09-01";
const FLAGSHIP = "ten-times-zero.md";

type Note = { file: string; status: string; date: string; social: boolean; images: string[]; alts: string[]; companion: boolean };

function readNote(file: string): Note {
  const fm = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
  const one = (key: string) => fm.match(new RegExp(`^${key}:[ \\t]*(.*)$`, "m"))?.[1]?.trim() ?? null;
  // A single card is a scalar; a note with several figures lists them under the same key.
  const many = (key: string): string[] => {
    const lines = fm.split("\n");
    const at = lines.findIndex((line) => line.startsWith(`${key}:`));
    if (at < 0) return [];
    const inline = one(key)?.replace(/^["']|["']$/g, "").trim();
    const out: string[] = inline ? [inline] : [];
    for (const line of lines.slice(at + 1)) {
      const item = line.match(/^\s+-\s+(.*)$/);
      if (item) out.push(item[1].trim().replace(/^["']|["']$/g, ""));
      else if (!/^\s/.test(line)) break;
    }
    return out.filter(Boolean);
  };
  return {
    file,
    status: one("status")?.replace(/^["']|["']$/g, "") ?? "",
    date: one("date")?.replace(/^["']|["']$/g, "") ?? "",
    // `social: |` starts a block scalar, so the value is empty and the key is what matters.
    social: /^social:/m.test(fm),
    images: many("socialImage"),
    alts: many("socialImageAlt"),
    companion: /^companion:\s*true\s*$/m.test(fm),
  };
}

const notes = Array.from(new Glob("content/notes/*.md").scanSync(".")).map(readNote);
// NOTE-STANDARD's companion exception: a note that carries no post of its own, marked `companion: true`.
const requiresBlock = (n: Note) => n.status === "PUBLISHED" && !n.companion && (n.date >= CUTOVER || n.file.endsWith(FLAGSHIP));

test("every published note from the 2026-09-01 cutover carries a share block, a card and alt text", () => {
  const missing = notes
    .filter(requiresBlock)
    .filter((n) => !n.social || n.images.length === 0 || n.alts.length === 0)
    .map((n) => `${n.file}: ${!n.social ? "no social block" : n.images.length === 0 ? "no socialImage" : "no socialImageAlt"}`);
  expect(missing).toEqual([]);
});

test("a card is never declared without alt text, and every declared card exists on disk", () => {
  const problems = notes.flatMap((n) => {
    const out: string[] = [];
    if (n.images.length !== n.alts.length) out.push(`${n.file}: ${n.images.length} card(s) and ${n.alts.length} alt text(s)`);
    for (const image of n.images) {
      if (!existsSync(join("content", image.replace(/^\//, "")))) out.push(`${n.file}: ${image} is not on disk`);
    }
    return out;
  });
  expect(problems).toEqual([]);
});

test("every note declares the required frontmatter the standard lists", () => {
  const required = ["title", "subtitle", "author", "status", "type", "date", "readingTime", "tags", "summary"];
  const missing = notes.flatMap((n) => {
    const fm = readFileSync(n.file, "utf8").match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
    return required.filter((k) => !new RegExp(`^${k}:`, "m").test(fm)).map((k) => `${n.file}: no ${k}`);
  });
  expect(missing).toEqual([]);
});

test("the drafts still waiting on a card are counted, so the number cannot grow unnoticed", () => {
  const draftsWaiting = notes.filter((n) => n.status !== "PUBLISHED" && n.date >= CUTOVER && !n.companion && n.images.length === 0);
  // Not a failure while they are drafts. This line is the count a publish check reads first.
  console.log(`[note-contract] ${draftsWaiting.length} draft(s) dated from ${CUTOVER} have no card yet: ${draftsWaiting.map((n) => n.file).join(", ") || "none"}`);
  expect(draftsWaiting.length).toBeLessThanOrEqual(7);
});
