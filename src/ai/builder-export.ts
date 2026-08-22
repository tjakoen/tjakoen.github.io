// portfolio/ai/builder-export.ts — take it away. Three files off ONE composition, and the import
// that reads the first of them back.
//
// WHY THREE. A composed page is worth nothing if it only exists inside the tool that composed it,
// and the three forms answer three different questions a person actually has. The JSON is the
// composition itself, and it is the only one that comes back: import reads it and the page is the
// page again. The rendered page is the thing you can open, send, or drop on a host, and it carries
// grain's stylesheet so it still looks like what you built. The tag source is what you paste into a
// page you already have, which is the form a developer would have hand-written if they had skipped
// the builder entirely.
//
// WHAT COMES OFF ON THE WAY OUT, and it is the same rule for both HTML forms. The builder's own
// instrumentation is stripped: the block addresses, the block ids, and the renderer's data-field
// and data-bind directives. An exported page ships no dispatcher, so an address on it advertises an
// operation nothing can perform, which is exactly the failure the tick box verb was invented to
// close (grain plans/check-set-op.md). The directives go for a plainer reason: they are how the
// browser fills a clone, and a page nobody is going to fill again should read like markup rather
// than like a template someone forgot to finish.
//
// WHAT STAYS ON, everywhere, in all three: the byline. It is rendered once by grain's own
// madeWith() and handed in here, never retyped, because a signature that each app writes for itself
// is a signature that drifts. The visible footer is the half a person reads and the half someone
// will eventually delete; the comment at the top of the file and the data-made-with on the root are
// the half that survives that, and the export copy on the page says both are there rather than
// hiding them.
//
// Pure and framework-free: strings in, strings out, no DOM and no renderer. The browser hands it
// markup the one renderer produced (read off the canvas) and a test hands it markup the same
// renderer produced (rendered straight), so both sides are exercising the same code over the same
// bytes. Client-safe (ARCHITECTURE §19): shipped to the browser, so treat its whole source as
// public.
import { toDocument, type PageComposition } from "./composition.ts";
import type { Span } from "./block-set.ts";

/** The GRAIN byline, in the two forms an export needs it. Built from ONE piece of markup, which is
 *  whatever grain's `madeWith()` returned, so neither form is a second copy of the line. */
export interface Byline {
  /** The footer markup, exactly as grain rendered it, links and all. */
  html: string;
  /** The same line as plain words, for the JSON and for the HTML comment. Derived by taking the
   *  tags out of the markup rather than by writing the sentence again: grain owns the wording, and
   *  a hand-typed twin here would be the drift this whole arrangement exists to prevent. */
  text: string;
}

/** Read a byline out of the markup grain's `madeWith()` produced. Returns null for anything that
 *  is not markup with words in it, so a caller can refuse to export rather than ship a page whose
 *  signature quietly went missing. */
export function bylineFrom(markup: string | null | undefined): Byline | null {
  const html = (markup ?? "").trim();
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return html && text ? { html, text } : null;
}

/** One block on its way out: the layout word its cell carries, and the block's own markup. The
 *  browser reads both off the canvas; a test renders them. Neither side hands over the cell wrapper,
 *  because the wrapper is written below and writing it twice is how the two drift. */
export interface ExportBlock {
  span: Span;
  html: string;
}

/** A file to hand over: what to call it, what it is, and what is in it. */
export interface ExportFile {
  name: string;
  type: string;
  body: string;
}

/** The name a composition goes out under. The canvas head has said untitled.html since D1, so the
 *  three files agree with the one line on screen that already named the thing. Whether a
 *  composition should have a name of its own is an open question the design plan is holding. */
export const EXPORT_STEM = "untitled";

/** The storage key the workbench writes a canvas to and /grain/builder/preview reads it back from.
 *
 *  It lives in this module rather than in either side of the handover, because both sides import it
 *  and a constant declared in one of them would make the other depend on a module it has no other
 *  reason to load. This one is pure: importing it starts nothing. The value is a preview rather than
 *  an export, but it is the same subject, handing a composition out of the page it was built on.
 *
 *  LOCAL storage, and that was measured rather than chosen. Session storage is the better fit on
 *  paper, since a handover is one visit's working state, and it does not work here: the preview
 *  opens in a new tab with `noopener`, and a context opened that way does not inherit its opener's
 *  session storage. Driven in a real browser, the preview came up with three blocks where the canvas
 *  held two. Dropping `noopener` would fix it by giving the new tab a handle back on this one, which
 *  is a worse trade for a page whose whole subject is what a page is allowed to do.
 *
 *  So it is local storage used as a message: the reader deletes it before it renders anything, and
 *  it carries a timestamp the reader checks, so a key left behind by a tab that never opened cannot
 *  come back as somebody's page an hour later. */
export const PREVIEW_HANDOVER_KEY = "portfolio.builder.preview";

/** How long a handover is worth reading, in milliseconds. A new tab opens in well under a second;
 *  a minute is generous enough to survive a slow first paint and short enough that nothing stale
 *  ever renders. */
export const PREVIEW_HANDOVER_TTL = 60_000;

/** What the workbench writes and the preview reads. Versioned by shape rather than by a number: the
 *  reader checks every field, so a value this build did not write fails the check and the preview
 *  falls back to composing from the address. */
export interface PreviewHandover {
  /** Each canvas cell's outer markup, in order. */
  cells: string[];
  /** When it was written, so the reader can refuse a stale one. */
  at: number;
}

// ---------------------------------------------------------------------------------------------
// Cleaning
// ---------------------------------------------------------------------------------------------

/** Attributes the builder put there and an exported page has no use for.
 *
 *  `data-surface` and `data-block-id` are the addresses the rail and the dispatcher work through.
 *  `data-template-surface` is how a library entry parks an address until it is cloned, so it should
 *  never reach a cell at all; it is listed because a stray one on an exported page would be worse
 *  than useless, it would be a parked address nobody is ever going to unpark. `data-field` and
 *  `data-bind-*` are the renderer's own directives, which the canvas keeps on purpose because the
 *  browser reads them to fill a clone. Nothing fills an exported page. */
const INSTRUMENT_ATTRS = /\s+data-(?:surface|block-id|template-surface|field|bind-[\w-]+)="[^"]*"/g;

/** Take the builder's fingerprints off one block's markup. Everything else survives untouched:
 *  every class here is grain's, and `data-pad`, `data-status` and `data-size` are grain's own
 *  documented attributes rather than this page's. */
export const cleanBlockHtml = (html: string): string => html.replace(INSTRUMENT_ATTRS, "");

/** Re-indent a block's markup by one level so a pasted fragment reads like something a person laid
 *  out. Lines are moved, never reflowed: the renderer preserved each template's own line breaks,
 *  and re-wrapping them here would be this module having an opinion about markup it did not write. */
const indent = (html: string, by: string): string =>
  html.split("\n").map((line) => (line.trim() ? by + line.trimEnd() : "")).join("\n");

/** One cell, as either export writes it. The span rides on the cell and the block inside stays
 *  layout-free, which is what grain's card and stat-tile docs each ask for and what lets the same
 *  block sit at any width without a second variant of it. */
const cellSource = (block: ExportBlock, pad: string): string =>
  `${pad}<div class="canvas__cell" data-span="${block.span}">\n`
  // Trimmed before indenting, and it is not cosmetic: a server-rendered block arrives wrapped in
  // the newlines its template file carries, and the same block read off the canvas as outerHTML
  // arrives with none. Without this the two sides produce different bytes for the same page.
  + `${indent(cleanBlockHtml(block.html).trim(), pad + "  ")}\n`
  + `${pad}</div>`;

// ---------------------------------------------------------------------------------------------
// 1. The JSON, and it is the only one that comes back
// ---------------------------------------------------------------------------------------------

/** The composition as a document, with the byline in it. Pretty-printed, because a file a person
 *  may open and hand-edit should be readable, and hand-editing it is a case import already handles:
 *  anything this build cannot render degrades to a named refusal rather than to a broken page.
 *
 *  The byline goes in as a plain string field rather than as markup, since JSON is not a page and a
 *  footer would be a lie about what this file is. Import ignores it, which is the point: the
 *  signature travels with the composition and never becomes something the composition depends on. */
export function exportJson(comp: PageComposition, byline: Byline): ExportFile {
  return {
    name: `${EXPORT_STEM}.json`,
    type: "application/json",
    body: JSON.stringify(toDocument(comp, byline.text), null, 2) + "\n",
  };
}

// ---------------------------------------------------------------------------------------------
// 2. The rendered page, with grain's stylesheet
// ---------------------------------------------------------------------------------------------

/** The six-column grid, written into the exported page rather than linked.
 *
 *  This is the one piece of the builder's own CSS an exported page needs, and being honest about
 *  where it comes from matters: the grid is this page's, not grain's. Six columns because it is the
 *  smallest count the three layout words divide into cleanly, full at six, half at three, third at
 *  two, so a span is a span rather than a rounding. The breakpoint here is a media query where the
 *  builder's own is a container query, and that is not an oversight: an exported page is the whole
 *  window, so the window is the right thing to measure. */
const GRID_CSS = `
      .canvas { display: grid; grid-template-columns: repeat(6, 1fr); gap: var(--space-4);
        align-items: start; max-width: 72rem; margin: var(--space-6) auto; padding: 0 var(--space-4); }
      .canvas__cell { min-width: 0; }
      .canvas__cell[data-span="full"] { grid-column: span 6; }
      .canvas__cell[data-span="half"] { grid-column: span 3; }
      .canvas__cell[data-span="third"] { grid-column: span 2; }
      @media (max-width: 48rem) { .canvas__cell[data-span] { grid-column: span 6; } }`;

/** The four stylesheets that make an exported page look like what you built, in the order every
 *  page on this site loads them: the tokens, the element defaults, grain's own rules, and the
 *  per-component bundle the style server assembles. Linked to the origin the export was made from
 *  rather than copied into the file, because copying them would freeze a snapshot of a design
 *  system that is still moving, and because four stylesheets inlined is a file nobody wants to
 *  open. The honest cost is stated in the page copy: this page needs the network to look right. */
const STYLESHEETS = ["/styles/variables.css", "/styles/global.css", "/styles/grain.css", "/components.css"];

/** A whole document you can open. `origin` is where the stylesheets are fetched from, and the caller
 *  passes the address the export was made at, so a page exported from the published site points at
 *  the published site and one exported from a dev server points at the dev server. Deriving it
 *  rather than hardcoding it means there is no second place that has to know where this site
 *  lives. */
export function exportPage(blocks: readonly ExportBlock[], byline: Byline, origin: string): ExportFile {
  const base = origin.replace(/\/+$/, "");
  const links = STYLESHEETS.map((href) => `    <link rel="stylesheet" href="${base}${href}">`).join("\n");
  const cells = blocks.map((b) => cellSource(b, "      ")).join("\n");
  const body =
`<!DOCTYPE html>
<!-- ${byline.text} -->
<html lang="en" data-made-with="GRAIN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>A page composed with GRAIN</title>
${links}
    <style>${GRID_CSS}
    </style>
  </head>
  <body>
    <main class="canvas">
${cells}
    </main>
    ${byline.html}
  </body>
</html>
`;
  return { name: `${EXPORT_STEM}.html`, type: "text/html", body };
}

// ---------------------------------------------------------------------------------------------
// 3. The tag source, which is what you would have written
// ---------------------------------------------------------------------------------------------

/** The markup on its own, ready to paste into a page that already exists.
 *
 *  Every class in here is grain's, and that is the whole reason this form is worth shipping: a
 *  molecule in grain is a documented class convention a page author writes by hand, so the markup a
 *  composed page produced and the markup a developer would have typed are the same markup. The
 *  builder did the choosing, not the inventing.
 *
 *  It carries no stylesheet links, because the page you are pasting into already has them, and it
 *  carries the grid as a comment rather than as CSS, because a fragment that shipped a rule would
 *  be writing into someone else's stylesheet from inside their markup. */
export function exportTags(blocks: readonly ExportBlock[], byline: Byline): ExportFile {
  const cells = blocks.map((b) => cellSource(b, "  ")).join("\n");
  const body =
`<!-- ${byline.text} -->
<!-- Paste this into a page that already loads GRAIN. Every class below is grain's own, so this is
     the markup you would have hand-written. The six-column grid the spans key off is the builder's
     rather than grain's, so it comes with the page export and not with this one: full spans six
     columns, half spans three, third spans two. -->
<div class="canvas" data-made-with="GRAIN">
${cells}
</div>
${byline.html}
`;
  return { name: `${EXPORT_STEM}.tags.html`, type: "text/html", body };
}
