// portfolio/tools/diagram-cache-gate.ts — fail the build when a mermaid fence in SERVED content
// has no committed SVG in the diagram cache.
//
// The failure this exists to catch is silent, which is the whole reason it is a gate rather than a
// warning. tools/diagram-cache.ts carries the full account; the short version is that the Pages
// deploy installs no browser, MILL's mermaid renderer disables itself when it cannot find one, and
// the fence degrades to a code block. Nothing goes red. The site publishes raw mermaid source and
// the first person to notice is a visitor.
//
// Two things this gate refuses to do by hand, because a gate that reimplements what it guards is a
// gate that can drift into lying about it:
//
//   1. It does not parse Markdown for fences. It calls MILL's own prepareDiagrams over the raw
//      file, with MILL's own DIAGRAM_LANGS, so it sees exactly the fences the renderer would.
//   2. It does not compute the cache key. It wraps a probe renderer in MILL's own cachedRenderer
//      and watches whether the probe gets called: a call means cachedRenderer looked for the file
//      and did not find it, which is the definition of a miss, whatever the key formula is.
//
// Scope is the served collections and nothing wider. A mermaid fence in an unserved file, and
// docs/AUDIT-AI-LOOP-2026-08-13.md holds two of them today, reaches no page and is not a risk.
// Failing on it would train people to work around the gate.
//
//   bun tools/diagram-cache-gate.ts        # standalone
//   bun run verify:export                  # what pages.yml actually calls
import { readdir } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { prepareDiagrams } from "@tjakoen/mill/diagrams/prepare.ts";
import { cachedRenderer } from "@tjakoen/mill/diagrams/cache.ts";
import type { ContentSource } from "@tjakoen/mill/serve.ts";
import { collectionSources } from "../src/content.ts";
import { DIAGRAM_CACHE_DIR, DIAGRAM_VERSION_TAG, WARM_COMMAND, cacheFileNameFor } from "./diagram-cache.ts";

const REPO_ROOT = join(import.meta.dir, "..");

export interface GatedCollection {
  /** route prefix, for naming the page a reader would land on */
  prefix: string;
  /** the folder behind it, for naming a file someone can open */
  dir: string;
  source: ContentSource;
}

export interface DiagramCacheGateOptions {
  collections?: GatedCollection[];
  cacheDir?: string;
  versionTag?: string;
  warmCommand?: string;
}

/**
 * The real filename behind a slug, so the failure names a path someone can open. dirSource
 * lowercases a filename to make a slug (GRAIN.md becomes grain), so the slug alone does not
 * round-trip. Best effort: an unreadable folder falls back to the slug spelling, which is still
 * enough to find the file.
 */
async function fileForSlug(dir: string, slug: string): Promise<string> {
  try {
    const match = (await readdir(dir))
      .filter((f) => f.endsWith(".md"))
      .find((f) => basename(f, ".md").toLowerCase() === slug.toLowerCase());
    if (match) return join(dir, match);
  } catch {
    // fall through to the slug spelling
  }
  return join(dir, `${slug}.md`);
}

/**
 * The 1-indexed line of the fence that opens this diagram, or null when it cannot be pinned down.
 * The parser hands back the fence BODY with no position, so the body is located in the raw file
 * and the opening fence is the line above it. Reporting only: a wrong line number is a slightly
 * worse message, never a wrong verdict.
 */
function fenceLine(raw: string, source: string): number | null {
  if (source === "") return null;
  const at = raw.indexOf(source);
  if (at < 0) return null;
  return raw.slice(0, at).split("\n").length - 1;
}

/**
 * Walk every served collection, find every diagram fence, and report the ones with no cache entry.
 * Returns a failure line per uncached fence, in the shape tools/verify-export.ts prints.
 *
 * Read-only by construction: the probe renderer returns null, and MILL's cachedRenderer never
 * writes a null result, so running the gate cannot fill the cache it is checking.
 */
export async function checkDiagramCache(opts: DiagramCacheGateOptions = {}): Promise<string[]> {
  const collections = opts.collections ?? collectionSources();
  const cacheDir = opts.cacheDir ?? DIAGRAM_CACHE_DIR;
  const versionTag = opts.versionTag ?? DIAGRAM_VERSION_TAG;
  const warmCommand = opts.warmCommand ?? WARM_COMMAND;

  const failures: string[] = [];

  for (const { prefix, dir, source } of collections) {
    for (const slug of await source.list()) {
      const raw = await source.read(slug);
      if (raw === null) continue;

      // Every call the probe sees is a fence cachedRenderer looked for and did not find.
      const misses: { lang: string; source: string }[] = [];
      const probe = cachedRenderer(
        cacheDir,
        async (lang, fenceSource) => {
          misses.push({ lang, source: fenceSource });
          return null;                                   // a null is never written back
        },
        versionTag,
      );

      await prepareDiagrams(raw, probe);

      const seen = new Set<string>();
      for (const miss of misses) {
        const dedupe = `${miss.lang}\0${miss.source}`;
        if (seen.has(dedupe)) continue;                  // one fence written twice is one problem
        seen.add(dedupe);

        const file = relative(REPO_ROOT, await fileForSlug(dir, slug));
        const line = fenceLine(raw, miss.source);
        const at = line === null ? file : `${file}:${line}`;
        const expected = relative(REPO_ROOT, join(cacheDir, await cacheFileNameFor(miss.lang, miss.source)));
        const opener = miss.source.split("\n")[0]?.trim() ?? "";

        failures.push(
          `${at} (served at ${prefix}/${slug}): a ${miss.lang} fence has no committed SVG. ` +
          `Expected ${expected}. Fence opens "${opener}". ` +
          `Run ${warmCommand} to render it, then commit the SVG.`,
        );
      }
    }
  }

  return failures;
}

/** The standalone report. Exported so a run against a fixture prints exactly what CI would print. */
export function printDiagramCacheReport(failures: string[]): void {
  if (!failures.length) {
    console.log(`[diagram-cache] every diagram fence in served content has a committed SVG`);
    return;
  }
  console.error(`[diagram-cache] ${failures.length} uncached diagram fence(s):\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(
    `\n[diagram-cache] The deploy installs no browser, so an uncached fence publishes as raw source.` +
    `\n[diagram-cache] FAILED`,
  );
}

if (import.meta.main) {
  const failures = await checkDiagramCache();
  printDiagramCacheReport(failures);
  if (failures.length) process.exit(1);
}
