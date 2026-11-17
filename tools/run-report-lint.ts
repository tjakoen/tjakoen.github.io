// portfolio/tools/run-report-lint.ts — check the consulted list on every run report.
//
// A run report says what changed and which gates passed. The consulted field says what the run read
// before it wrote: standard sections, skills, graph queries. LOOP section 4a treats a claim with
// nothing behind it as unverified, and "I followed VOICE" is that claim until it names the section.
//
//   bun run lint:runs                       # every report under artifacts/runs/
//   bun run lint:runs artifacts/runs/x.md   # explicit files
//
// What it checks: every entry has one of the three shapes, every standard file named exists, and every
// #anchor resolves to a ## or ### heading in that file under MILL's slugifyHeading, the same function
// that stamps the id on the rendered page. A report dated on or after CONSULTED_SINCE must carry the
// field; older reports predate it and are only checked when they have it.
//
// What it cannot check: that the run actually read what it lists. A tidy, fabricated list passes.
// The field makes the claim specific enough for a person or a later audit to hold against the
// transcript, and that is the whole of what it does. It exits non-zero on a hit, because a dangling
// anchor is a defect with one fix, not a style call.

import { readdir, readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { slugifyHeading } from "@tjakoen/mill/core/slug.ts";

/** The first day a run report owes the field. Reports before it are grandfathered. */
export const CONSULTED_SINCE = "2026-11-17";

const RUNS_DIR = "artifacts/runs";
const STANDARDS_DIR = "standards";

export type Entry =
  | { kind: "standard"; file: string; anchor: string | null }
  | { kind: "skill"; name: string }
  | { kind: "graph"; query: string };

/** Parse one consulted entry, or return the reason it is malformed. */
export function parseEntry(raw: string): Entry | { error: string } {
  const value = raw.trim();
  if (value.startsWith("skill:")) {
    const name = value.slice("skill:".length).trim();
    return /^[a-z0-9][a-z0-9-]*(:[a-z0-9][a-z0-9-]*)?$/.test(name)
      ? { kind: "skill", name }
      : { error: `skill name "${name}" is not a lowercase slug (plugin:skill is allowed)` };
  }
  if (value.startsWith("graph:")) {
    const query = value.slice("graph:".length).trim();
    return query ? { kind: "graph", query } : { error: "graph: entry has no query" };
  }
  const match = /^([A-Z][A-Z0-9.-]*\.md)(?:#([a-z0-9-]+))?$/.exec(value);
  if (match) return { kind: "standard", file: match[1], anchor: match[2] ?? null };
  return {
    error: `"${value}" is none of STANDARD.md#section-slug, skill:name or graph:query`,
  };
}

/** The anchors MILL renders for a Markdown file: ## and ### headings, outside code fences. */
export function headingAnchors(markdown: string): Set<string> {
  const anchors = new Set<string>();
  let fenced = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const heading = /^#{2,3}\s+(.+?)\s*#*\s*$/.exec(line);
    if (!heading) continue;
    const plain = heading[1]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // a link keeps its text, drops its target
      .replace(/[`*_]/g, "");
    const slug = slugifyHeading(plain);
    if (slug) anchors.add(slug);
  }
  return anchors;
}

/** Frontmatter as an object, or null when the file has none. */
export function frontmatter(text: string): Record<string, unknown> | null {
  if (!text.startsWith("---")) return null;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return null;
  try {
    const parsed = Bun.YAML.parse(text.slice(3, end));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** The report's date: the date field, else the filename prefix. */
export function reportDate(file: string, fields: Record<string, unknown>): string | null {
  const raw = fields.date;
  if (raw instanceof Date) return raw.toISOString().slice(0, 10);
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  return /^(\d{4}-\d{2}-\d{2})/.exec(basename(file))?.[1] ?? null;
}

export type Standards = Map<string, Set<string>>;

/** Lint one report's text. Returns the problems, empty when it is clean. */
export function lintReport(file: string, text: string, standards: Standards): string[] {
  const fields = frontmatter(text);
  const date = reportDate(file, fields ?? {});
  if (!fields) {
    return date !== null && date >= CONSULTED_SINCE ? [`${file}: no frontmatter`] : [];
  }
  const owed = date !== null && date >= CONSULTED_SINCE;

  if (!("consulted" in fields)) {
    return owed ? [`${file}: dated ${date}, owes a consulted list (LOOP section 4a)`] : [];
  }
  const value = fields.consulted;
  if (value === "none") return [];
  if (!Array.isArray(value)) {
    return [`${file}: consulted is a list, or the word none when the run read nothing`];
  }
  if (value.length === 0) return [`${file}: consulted is empty; write none if the run read nothing`];

  const problems: string[] = [];
  for (const raw of value) {
    if (typeof raw !== "string") {
      problems.push(`${file}: consulted entry ${JSON.stringify(raw)} is not a string`);
      continue;
    }
    const entry = parseEntry(raw);
    if ("error" in entry) {
      problems.push(`${file}: ${entry.error}`);
      continue;
    }
    if (entry.kind !== "standard") continue;
    const anchors = standards.get(entry.file);
    if (!anchors) {
      problems.push(`${file}: ${entry.file} is not a file under standards/`);
    } else if (entry.anchor && !anchors.has(entry.anchor)) {
      problems.push(`${file}: ${entry.file}#${entry.anchor} matches no ## or ### heading`);
    }
  }
  return problems;
}

/** Every standard file and its anchors, read once. */
export async function loadStandards(dir = STANDARDS_DIR): Promise<Standards> {
  const standards: Standards = new Map();
  for (const name of await readdir(dir)) {
    if (!name.endsWith(".md")) continue;
    standards.set(name, headingAnchors(await readFile(join(dir, name), "utf8")));
  }
  return standards;
}

async function main(argv: string[]): Promise<number> {
  const files = argv.length
    ? argv
    : (await readdir(RUNS_DIR))
        .filter((name) => name.endsWith(".md") && name !== "README.md")
        .map((name) => join(RUNS_DIR, name));
  const standards = await loadStandards();
  let traced = 0;
  const problems: string[] = [];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    if (frontmatter(text)?.consulted !== undefined) traced += 1;
    problems.push(...lintReport(file, text, standards));
  }
  for (const problem of problems) console.error(problem);
  console.log(
    `run-report-lint: ${files.length} reports, ${traced} with a consulted list, ${problems.length} problems`,
  );
  return problems.length ? 1 : 0;
}

if (import.meta.main) process.exit(await main(process.argv.slice(2)));
