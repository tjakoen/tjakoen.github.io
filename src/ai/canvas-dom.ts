// portfolio/ai/canvas-dom.ts — the canvas cell contract, written down once so the server and the
// browser cannot disagree about it.
//
// The canvas is a grid of cells and each cell holds exactly one rendered block. The server builds
// those cells while rendering a composition; the browser builds them while composing one. That is
// two writers for one piece of markup, which is the shape a class name silently drifts in, so the
// class and the two attributes live here as constants and both writers import them.
//
// Client-safe (ARCHITECTURE §19): no node:, no bun, no DOM, no renderer. This module is shipped to
// the browser, so treat its whole source as public.

/** The grid cell that wraps one block. The grid itself is `.canvas`, styled in builder.css. */
export const CELL_CLASS = "canvas__cell";
/** The layout vocabulary, on the cell rather than on the block: a block stays layout-free and its
 *  parent places it, which is what grain's own stat-tile doc asks for and what lets the same block
 *  sit at any span without a second variant of it. */
export const SPAN_ATTR = "data-span";
/** The block's stable id, so a later reorder or delete can find the cell without matching content. */
export const BLOCK_ID_ATTR = "data-block-id";
/** The canvas surface, the one address the composed page hangs off. Not a registered surface KIND,
 *  so it is push-only and no verb targets it, the same footing as builder-form and builder-spec. */
export const CANVAS_SURFACE = "builder-canvas";
