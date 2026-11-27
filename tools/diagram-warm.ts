// portfolio/tools/diagram-warm.ts — render every diagram fence in served content and commit the
// SVGs. The escape hatch tools/diagram-cache-gate.ts points at when it goes red.
//
// This runs on an author's machine, never in CI. That asymmetry is the design: the heavy renderer
// needs chromium and mermaid, the deploy has neither, and the committed cache is what carries a
// diagram from the machine that could render it to the one that cannot. See tools/diagram-cache.ts.
//
// It is deliberately loud about a renderer that is not available. MILL's own renderer logs once and
// then returns null forever, which is right for a page (a diagram must never take a page down) and
// wrong for this tool: a warm run that quietly rendered nothing would leave someone believing the
// cache was filled right up until the gate said otherwise.
//
//   bun run diagrams:warm             fill the cache for served content
//   bun run diagrams:warm -- --drafts  also fill it for draft notes, which the gate does not check
//
// The renderer launches playwright's own chromium. If the installed browser is a different build than the one
// playwright expects, point PLAYWRIGHT_BROWSERS_PATH at a folder that links the installed one under the expected name.
import { createRequire } from "node:module";
import { mkdir, readdir, readFile } from "node:fs/promises";
import { relative, join } from "node:path";
import { prepareDiagrams } from "@tjakoen/mill/diagrams/prepare.ts";
import { cachedRenderer } from "@tjakoen/mill/diagrams/cache.ts";
import { createMermaidRenderer } from "@tjakoen/mill/diagrams/mermaid-playwright.ts";
import { collectionSources } from "../src/content.ts";
import { DIAGRAM_CACHE_DIR, DIAGRAM_VERSION_TAG } from "./diagram-cache.ts";
import { checkDiagramCache } from "./diagram-cache-gate.ts";

const REPO_ROOT = join(import.meta.dir, "..");
const require = createRequire(import.meta.url);

/** Name what is missing before the renderer swallows it, so the fix is one line instead of a hunt. */
function missingPieces(): string[] {
  const missing: string[] = [];
  for (const [pkg, hint] of [
    ["playwright", "bun add -d playwright && bunx playwright install chromium"],
    ["mermaid/dist/mermaid.min.js", "bun add -d mermaid"],
  ] as const) {
    try { require.resolve(pkg); } catch { missing.push(hint); }
  }
  return missing;
}

const before = await checkDiagramCache();
if (before.length === 0 && !process.argv.includes("--drafts")) {
  console.log(`[diagram-warm] nothing to render: every diagram fence in served content is already cached`);
  process.exit(0);
}
console.log(`[diagram-warm] ${before.length} uncached fence(s) to render`);

const missing = missingPieces();
if (missing.length) {
  console.error(`[diagram-warm] the mermaid renderer needs packages this repo does not install:\n`);
  for (const hint of missing) console.error(`  ${hint}`);
  console.error(
    `\n[diagram-warm] They stay out of the deploy on purpose: the committed cache is what the deploy reads.` +
    `\n[diagram-warm] FAILED`,
  );
  process.exit(1);
}

await mkdir(DIAGRAM_CACHE_DIR, { recursive: true });
const mermaid = createMermaidRenderer();
const render = cachedRenderer(DIAGRAM_CACHE_DIR, mermaid, DIAGRAM_VERSION_TAG);

try {
  for (const { prefix, source } of collectionSources()) {
    for (const slug of await source.list()) {
      const raw = await source.read(slug);
      if (raw === null) continue;
      const svgs = await prepareDiagrams(raw, render);
      if (svgs.size) console.log(`[diagram-warm] ${prefix}/${slug}: ${svgs.size} diagram(s) ready`);
    }
  }
  // Draft notes are not in the served sources above, so a diagram in a draft would render as a code block
  // on the /drafts page until the note published. Warm every note file, so a draft shows its diagrams too.
  const notesDir = join(REPO_ROOT, "content", "notes");
  for (const f of (await readdir(notesDir)).filter((x) => x.endsWith(".md"))) {
    const svgs = await prepareDiagrams(await readFile(join(notesDir, f), "utf8"), render);
    if (svgs.size) console.log(`[diagram-warm] notes/${f.slice(0, -3)}: ${svgs.size} diagram(s) ready (drafts included)`);
  }
} finally {
  await mermaid.close();
}

// The second pass is the receipt. A renderer that failed halfway leaves the cache short, and this
// is what refuses to call that a success.
const after = await checkDiagramCache();
if (after.length) {
  console.error(`[diagram-warm] ${after.length} fence(s) still uncached after the run:\n`);
  for (const f of after) console.error(`  ✗ ${f}`);
  console.error(`\n[diagram-warm] FAILED`);
  process.exit(1);
}

console.log(
  `[diagram-warm] cache filled at ${relative(REPO_ROOT, DIAGRAM_CACHE_DIR)}. Commit the new SVGs: ` +
  `the deploy reads them and cannot render its own.`,
);
