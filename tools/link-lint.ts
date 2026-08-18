// portfolio/tools/link-lint.ts — fail on a relative Markdown link that 404s once the page renders.
//
// Markdown under standards/, content/notes/ and docs/<layer>/ is authored as files and served as
// pages. src/content.ts rewrites the link shapes it knows: a bare sibling (foo.md) and a layer doc
// (grain/docs/FOO.md, at any depth). Anything else with a ../ in it survives the rewrite untouched,
// so a browser resolves it against the page URL and gets a 404. That gap was a comment in
// src/content.ts for months, which is the weakest rung on the hardening ladder: the 2026-08-17 audit
// found ten live instances, and the 2026-07-29 audit had already found one that shipped unfixed for
// a year. A comment describes a defect. This refuses it.
//
//   bun run lint:links                 # every rendered Markdown surface
//   bun run lint:links path/to/file.md # explicit files
//
// It exits non-zero on a hit, unlike the advisory voice count, because a dead link is a defect
// rather than a style flag: there is no judgment call to leave to a person, and no threshold where
// some are acceptable. The fix is always the same, point it at the route or at the repo on GitHub.

import { readdir } from "node:fs/promises";
import { join } from "node:path";

// The dirs whose Markdown becomes a page. A file outside these ships as source, where a relative
// path is correct and this check would be wrong to fire.
const RENDERED_DIRS = [
  "standards",
  "content/notes",
  "docs/grain",
  "docs/batch",
  "docs/mill",
  "docs/proof",
  "docs/crumb",
  "docs/pantry",
];

// The one shape src/content.ts resolves at any depth: ../../batch/docs/CONVENTIONS.md is fine
// because docsLink matches the layer and the filename, not the number of dots in front of them.
const LAYER_DOC = /(?:^|\/)(grain|batch)\/docs\/[A-Za-z0-9._-]+\.md$/;

export type DeadLink = { file: string; line: number; target: string };

/** Strip fenced blocks and inline code, keeping line count intact so a hit reports a real line. */
function withoutCode(source: string): string {
  let fenced = false;
  return source
    .split("\n")
    .map((line) => {
      if (line.trimStart().startsWith("```")) {
        fenced = !fenced;
        return "";
      }
      return fenced ? "" : line.replace(/`[^`]*`/g, "");
    })
    .join("\n");
}

/** Every link target a reader can click: Markdown destinations and raw hrefs. */
function targets(line: string): string[] {
  const found: string[] = [];
  for (const m of line.matchAll(/\]\(([^)\s]+)/g)) found.push(m[1]!);
  for (const m of line.matchAll(/href="([^"]+)"/g)) found.push(m[1]!);
  return found;
}

/** A target is dead when it climbs out of its own directory and nothing downstream rewrites it. */
export function isDead(target: string): boolean {
  if (!target.includes("../")) return false;
  const path = target.split("#")[0]!;
  return !LAYER_DOC.test(path);
}

export function scan(file: string, source: string): DeadLink[] {
  const hits: DeadLink[] = [];
  withoutCode(source)
    .split("\n")
    .forEach((line, i) => {
      for (const target of targets(line)) {
        if (isDead(target)) hits.push({ file, line: i + 1, target });
      }
    });
  return hits;
}

async function markdownIn(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter((e) => e.isFile() && e.name.endsWith(".md")).map((e) => join(dir, e.name));
  } catch {
    return []; // a layer that ships no docs dir is not a failure, it is just absent
  }
}

if (import.meta.main) {
  const argv = process.argv.slice(2);
  const files = argv.length
    ? argv
    : (await Promise.all(RENDERED_DIRS.map(markdownIn))).flat().toSorted();

  const hits: DeadLink[] = [];
  for (const file of files) hits.push(...scan(file, await Bun.file(file).text()));

  for (const hit of hits) {
    console.log(`${hit.file}:${hit.line}: dead relative link ${hit.target}`);
  }

  if (hits.length) {
    console.log(
      `\nlink-lint: ${hits.length} dead relative link(s) across ${new Set(hits.map((h) => h.file)).size} file(s).`,
    );
    console.log(
      "These render into hrefs the browser resolves against the page URL, so they 404 on the site.",
    );
    console.log("Point each at its route (/notes/<slug>) or at the file on GitHub.");
    process.exit(1);
  }

  console.log(`link-lint: ${files.length} rendered file(s), no dead relative links.`);
}
