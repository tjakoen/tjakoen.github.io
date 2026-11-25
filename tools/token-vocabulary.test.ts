// tools/token-vocabulary.test.ts — every custom property the portfolio READS is one GRAIN or the
// portfolio DEFINES. The portfolio's copy of grain/styles/vars-defined.test.ts, adopted after the
// 2026-11-25 audit found eight references that had never resolved.
//
// CSS has no undefined-variable error. `var(--nope)` renders as nothing and is noticed within the
// hour; `var(--nope, green)` renders as green and ships. So a fallback is not an excuse here, it is
// the aggravating factor: `var(--space-7)` with no fallback silently dropped a margin, and
// `var(--leading-snug)` silently dropped a line-height, through an audit and a release.
//
// The vocabulary is shared, so GRAIN's definitions count. What the portfolio may not do is invent
// a name and lean on a fallback to make it work: that is a token that will never follow a re-skin.
import { test, expect } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const GRAIN = dirname(fileURLToPath(import.meta.resolve("@tjakoen/grain/PLAN.md")));

// Shipped styling only. node_modules, generated output and the private desk material hold no
// vocabulary of ours to police.
const SKIP = new Set(["node_modules", "dist", "build", ".git", "coverage", "graphify-out", "artifacts", ".claude"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// A DEFINITION is `--name:` in declaration position, in a stylesheet or in an inline style
// attribute. A reference never matches, because `var(--x)` puts a `)` or a `,` after the name.
const DEFINE = /(?:^|[;{\s"'])(--[a-zA-Z0-9_-]+)\s*:/gm;
const REFERENCE = /var\(\s*(--[a-zA-Z0-9_-]+)/g;

// Comments are blanked, not deleted, so line numbers survive and prose about a removed token is
// not read as a use of it (grain/styles/vars-defined.test.ts learned this the hard way).
const blankComments = (text: string) =>
  text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));

const read = (f: string) => readFileSync(f, "utf8");

// The two honest reasons a reference has no declaration, each with the receipt that makes it
// checkable. Adding a name here without one turns this guard back into decoration.
const EXTERNALLY_SET = new Map<string, string>([
  ["--read", "runtime: scripts/note-progress.js:32 setProperty, documented in view/components/molecules/note-contents/note-contents.md:22"],
]);

test("every custom property the portfolio reads is defined by GRAIN or the portfolio", () => {
  const defined = new Set<string>();
  for (const f of walk(GRAIN).filter((p) => /\.(css|ts|html|js)$/.test(p))) {
    for (const m of blankComments(read(f)).matchAll(DEFINE)) defined.add(m[1]);
  }
  const own = walk(ROOT).filter(
    (p) => /\.(css|html)$/.test(p) || (/\.(ts|js)$/.test(p) && !p.includes(".test.")),
  );
  for (const f of own) {
    for (const m of blankComments(read(f)).matchAll(DEFINE)) defined.add(m[1]);
  }

  const offenders: string[] = [];
  for (const file of own) {
    const text = blankComments(read(file));
    text.split("\n").forEach((line, i) => {
      for (const m of line.matchAll(REFERENCE)) {
        const name = m[1];
        if (defined.has(name) || EXTERNALLY_SET.has(name)) continue;
        offenders.push(`${relative(ROOT, file)}:${i + 1} reads ${name}, which nothing defines`);
      }
    });
  }
  expect(offenders).toEqual([]);
});

test("the allowlist keeps its receipts", () => {
  for (const [name, receipt] of EXTERNALLY_SET) {
    const [where] = receipt.split(": ")[1].split(" ");
    expect(name.startsWith("--")).toBe(true);
    expect(/:\d/.test(where)).toBe(true);
  }
});
