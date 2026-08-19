// portfolio/src/diagrams.ts — where the committed diagram cache lives, and the renderer the
// SERVER reads it with.
//
// The constants moved here from tools/diagram-cache.ts when the renderer was wired, because the
// serving path is now the primary consumer and a tool importing from src/ is the right direction
// for this repo. tools/diagram-cache.ts re-exports them, so nothing that already imported them
// there had to change.
//
// ---- The renderer the site serves with is CACHE-ONLY -------------------------------------
// `servedDiagramRenderer` reads the committed cache and never launches a browser. That is the
// whole point of committing the cache rather than rendering on demand:
//
//   - tools/export.ts spawns src/server.ts and crawls it, so the static export renders every
//     entry page through this exact path. A browser-launching renderer here would put chromium
//     in the deploy's path, and .github/workflows/pages.yml installs no browser.
//   - A live server that shells out to chromium on a cache miss pays seconds per page for a
//     picture that will be identical every time.
//
// So a fence with no cache entry renders as an ordinary code block, and that is deliberately
// visible rather than quiet. tools/diagram-cache-gate.ts is what makes it impossible to ship:
// an uncached fence in served content fails the build and names the warm command. The author's
// loop is: write the fence, run `bun run diagrams:warm`, commit the SVG beside the Markdown.
import { join } from "node:path";
import { cachedRenderer, CACHE_VERSION } from "@tjakoen/mill/diagrams/cache.ts";
import { MERMAID_VERSION_TAG } from "@tjakoen/mill/diagrams/mermaid-playwright.ts";
import type { DiagramRenderer } from "@tjakoen/mill/diagrams/prepare.ts";

/**
 * The committed cache directory. It sits under content/ because these SVGs belong to the content
 * that produced them, and it is deliberately NOT under .cache/, which .gitignore drops: a cache
 * this repo does not commit is a cache the deploy does not have.
 */
export const DIAGRAM_CACHE_DIR = join(import.meta.dir, "..", "content", "diagrams");

/**
 * The version tag folded into every cache key. MILL splits the versioning in two on purpose:
 * CACHE_VERSION covers MILL's own post-processing, MERMAID_VERSION_TAG covers the sentinel
 * palette that makes one cached SVG follow the theme, and the consumer joins them. Bumping
 * either upstream invalidates every committed SVG, which is the intended behaviour: a stored SVG
 * is only valid for the transformation that produced it.
 */
export const DIAGRAM_VERSION_TAG = `${CACHE_VERSION}+${MERMAID_VERSION_TAG}`;

/** The command a person runs to fill the cache for a fence the gate found uncached. */
export const WARM_COMMAND = "bun run diagrams:warm";

/**
 * The renderer the content routes serve with: MILL's disk cache wrapped around a renderer that
 * never renders. A hit returns the committed SVG; a miss returns null and the fence falls back to
 * a code block.
 *
 * The inner function is not a placeholder for a real renderer that belongs here later. It is the
 * design: rendering happens in tools/diagram-warm.ts, on an author's machine, once per diagram.
 * Because it never returns markup, MILL's cachedRenderer never writes, so serving a page cannot
 * modify the cache the gate is checking.
 */
export function servedDiagramRenderer(): DiagramRenderer {
  return cachedRenderer(DIAGRAM_CACHE_DIR, async () => null, DIAGRAM_VERSION_TAG);
}
