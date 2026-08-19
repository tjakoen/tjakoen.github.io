// portfolio/tools/diagram-cache.ts — how a cache filename is derived, for the tools that report
// one to a person.
//
// The cache location and its version tag moved to src/diagrams.ts when the renderer was wired
// into the content routes, because the server became the primary reader of the cache and a tool
// importing from src/ is the right direction here. They are re-exported below, so the gate and
// the warm tool still import them from this module.
//
// ---- Why this cache is a correctness device and not a speed one --------------------------
// tools/export.ts spawns src/server.ts and crawls it, so the static export renders every entry
// page through MILL's diagram path. The Pages deploy (.github/workflows/pages.yml) runs
// `bun install --frozen-lockfile` and nothing else: there is no `playwright install` step, unlike
// the e2e job in ci.yml which needs one explicitly. On a browser cache miss during a deploy,
// chromium.launch() throws, MILL logs once and disables the renderer
// (node_modules/@tjakoen/mill/diagrams/mermaid-playwright.ts), and every mermaid fence degrades
// to an ordinary code block. Both `bun run export` and `bun run verify:export` stay green while
// that happens, and the site publishes raw mermaid source.
//
// A committed cache means the deploy never needs a browser at all. The gate is what makes the
// cache trustworthy: an entry missing from it fails the build instead of quietly publishing
// source text.
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cachedRenderer } from "@tjakoen/mill/diagrams/cache.ts";
import { DIAGRAM_CACHE_DIR, DIAGRAM_VERSION_TAG, WARM_COMMAND } from "../src/diagrams.ts";

export { DIAGRAM_CACHE_DIR, DIAGRAM_VERSION_TAG, WARM_COMMAND };


/**
 * The cache filename MILL would use for this fence, derived by ASKING MILL rather than by
 * restating its hash.
 *
 * MILL keeps its keyFor() private, so the alternative was to copy
 * `sha1(lang \0 source \0 versionTag)` into this repo by eye. A copied formula is a gate that
 * lies the moment MILL changes the construction: the gate would go on passing against keys
 * nothing reads. So this hands MILL's own cachedRenderer an empty directory and a stub renderer,
 * lets it write, and reads back the name it chose. If MILL changes how a key is built, this
 * follows it for free, and the only way it can break is loudly.
 *
 * Used for reporting only. The gate itself never needs the filename: it asks cachedRenderer
 * whether the entry is there and watches whether the inner renderer gets called.
 */
export async function cacheFileNameFor(lang: string, source: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "portfolio-diagram-key-"));
  try {
    await cachedRenderer(dir, async () => "<svg/>", DIAGRAM_VERSION_TAG)(lang, source);
    const [file] = await readdir(dir);
    if (!file) throw new Error("MILL's cachedRenderer wrote no file, so no key could be derived");
    return file;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
