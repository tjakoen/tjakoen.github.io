// portfolio/ai/canvas.ts — a composition, rendered. This is the whole of what "compose GRAIN from
// data" costs on the server: a loop over the blocks calling the ONE renderer, because
// `render(name, data, props)` takes the component name as a runtime string. There is no second
// engine here and there is deliberately no room for one.
//
// SERVER ONLY, and the line matters: this imports ../render.ts, which walks the components
// directory off disk. block-set.ts and composition.ts stay client-safe precisely so the browser can
// hold the same composition; this module is the half that cannot travel.
import { render } from "../render.ts";
import type { Block } from "./block-set.ts";
import { BLOCK_ID_ATTR, CELL_CLASS, SPAN_ATTR } from "./canvas-dom.ts";

/** Strip HTML comments from rendered block markup.
 *
 *  The renderer leaves a component's own comment in its output. That is engine behaviour across
 *  every page on this site and it is usually harmless, because a hand-written page's components
 *  carry a line or two. A block template carries a paragraph: why the template lives in the
 *  portfolio rather than in grain, which of grain's docs it mirrors, what the null contract costs.
 *  That commentary is written for whoever opens the repo, and a composed page ships it to every
 *  visitor, so the canvas drops it at the edge rather than the templates going quiet.
 *
 *  Deciding it here rather than at export (P4) is deliberate: the export writes what the page
 *  already is, so a page that is clean when served is clean when frozen, and there is no second
 *  rule to keep in sync. Only block output goes through this. Nothing else on the site changes,
 *  and the `data-field` / `data-bind-*` directives are NOT touched, because the browser reads them
 *  to fill a cloned block. They are the contract, not the commentary. */
export const stripBlockComments = (html: string): string => html.replace(/<!--[\s\S]*?-->/g, "");

/** One block, rendered into its grid cell. The cell is built here rather than by a component
 *  because it wraps markup, and the renderer escapes what it binds: a component that could take
 *  rendered HTML as data would be a hole in the exact place this design closes one. `span` comes
 *  from a closed set of three words and `id` is issued as `b<number>`, so neither can carry a quote
 *  out of a description into an attribute. */
export async function renderCell(block: Block): Promise<string> {
  const html = stripBlockComments(await render(block.component, block.data, block.props));
  return `<div class="${CELL_CLASS}" ${SPAN_ATTR}="${block.span}" ${BLOCK_ID_ATTR}="${block.id}">${html}</div>`;
}

/** The whole canvas: every block in composition order. An empty composition renders nothing at all
 *  rather than a placeholder, because the page's own empty state already says what to do next and
 *  two of those would be one too many. */
export async function renderCanvas(blocks: readonly Block[]): Promise<string> {
  const cells = await Promise.all(blocks.map(renderCell));
  return cells.join("");
}
