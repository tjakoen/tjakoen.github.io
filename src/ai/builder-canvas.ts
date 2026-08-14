// portfolio/ai/builder-canvas.ts — /builder, composing in the browser. This is the phase that makes
// the demo work where it actually lives.
//
// WHAT WAS BROKEN. The published /builder has never done anything. The demo is a GET round trip the
// SERVER interprets and this site exports to static hosting, so dist/builder/index.html is a single
// file frozen at the empty state, no ?ask= variant is exported, and GitHub Pages has no server to
// interpret one. Every Examples link and every desk-driven build has landed on an empty page for
// the page's whole life. It worked in dev and only in dev.
//
// WHAT THIS DOES ABOUT IT, and the two rules it will not break.
//
// It does not re-implement the matcher. block-set.ts, composition.ts and builder-page.ts are pure
// and client-safe, so the browser imports the SAME modules the server calls. The closed set, the
// three layout words, the refusals and the page's own state flags are decided once, in TypeScript,
// and the answer is identical on both sides because it is the same answer.
//
// It does not re-implement the renderer. The page ships every block pre-rendered once by the real
// server-side renderer, hidden, as a template library (ai/canvas.ts renderLibrary). Composing
// clones a node from there and fills it through the same data-field and data-bind-* attributes the
// template carries (ai/canvas-dom.ts). Structure was decided by the one engine before the browser
// woke up.
//
// WITH JAVASCRIPT OFF, on the live server, nothing here runs and nothing is lost: the composer is a
// plain GET form and the server renders the same canvas. On a static host with JavaScript off the
// page stays empty and honest, which is what it always was.
import {
  addFromDescription, emptyComposition, fromDocument, moveBlock, removeBlock, setSpan,
  type PageComposition,
} from "./composition.ts";
import { BLOCK_COMPONENTS, isSpan, type Block } from "./block-set.ts";
import { viewOf, type BuilderView } from "./builder-page.ts";
import {
  BLOCK_ID_ATTR, CANVAS_SURFACE, CELL_CLASS, LIBRARY_CLASS, REPEATS, SPAN_ATTR, TEMPLATE_ATTR,
  fillTree, restoreSurfaces,
} from "./canvas-dom.ts";

/** The page's own chrome binds over the VIEW; a block binds over its own DATA; the composer binds
 *  over its one-item spec. Filling the board must therefore stop at all three, or the view's data
 *  would be walked into markup that means something else and every label would quietly go blank. */
const FILL_SKIP = `.canvas, .wb__rows, .${LIBRARY_CLASS}, .builder-composer`;

const $ = <T extends Element>(sel: string, root: ParentNode = document): T | null => root.querySelector<T>(sel);

// ---------------------------------------------------------------------------------------------
// Cloning and filling one block
// ---------------------------------------------------------------------------------------------

function templateFor(library: Element, name: string): Element | null {
  const holder = $(`[${TEMPLATE_ATTR}="${name}"]`, library);
  return holder?.firstElementChild ?? null;
}

/** One component, cloned from the library and filled. Recursive, because a form nests controls and
 *  a choice nests options, and REPEATS is the whole of what this knows about that: which list, which
 *  template, which container. Everything else about the markup was settled by the renderer. */
function build(library: Element, name: string, data: unknown): Element | null {
  const tpl = templateFor(library, name);
  if (!tpl) return null;
  const node = tpl.cloneNode(true) as Element;
  restoreSurfaces(node);
  fillTree(node, data);
  for (const rule of REPEATS[name] ?? []) {
    const items = (data as Record<string, unknown>)?.[rule.list];
    if (!Array.isArray(items)) continue;
    const into = rule.into ? $(rule.into, node) : node;
    if (!into) continue;
    for (const item of items) {
      const child = build(library, rule.template, item);
      if (child) into.append(child);
    }
  }
  return node;
}

/** One block in its grid cell. The cell is three attributes rather than a cloned template because
 *  it holds no content of its own, and both writers get its class and attribute names from the same
 *  constants (canvas-dom.ts) so the server's cell and this one cannot drift apart. */
function cellFor(library: Element, block: Block): Element | null {
  const inner = build(library, block.component, block.data);
  if (!inner) return null;
  const cell = document.createElement("div");
  cell.className = CELL_CLASS;
  cell.setAttribute(SPAN_ATTR, block.span);
  cell.setAttribute(BLOCK_ID_ATTR, block.id);
  cell.append(inner);
  return cell;
}

// ---------------------------------------------------------------------------------------------
// Painting the page from a view
// ---------------------------------------------------------------------------------------------

/** Rebuild the canvas and re-apply the page's own bindings. The canvas is rebuilt whole rather than
 *  appended to: a composition is small, one code path is easier to trust than two, and reorder and
 *  delete (a later phase) need the whole-rebuild path anyway. */
function paint(board: Element, canvas: Element, rail: Element, library: Element, view: BuilderView): void {
  canvas.replaceChildren(...view.blocks.map((b) => cellFor(library, b)).filter((c): c is Element => c !== null));
  rail.replaceChildren(...view.rows.map((r) => build(library, "block-row", r)).filter((n): n is Element => n !== null));
  fillTree(board, view, FILL_SKIP);
}

/** Apply one rail button to the composition. The ops are the pure functions composition.ts has had
 *  since the day it was written, and until now nothing but a test had ever called one: the canvas
 *  was append-only, so every mistake was permanent until you started the page over. That, more than
 *  any amount of chrome, is what stopped this page feeling like a builder.
 *
 *  An unrecognized op returns the composition unchanged rather than throwing, which matches what
 *  every function it calls already does with an id that is not there. */
function applyOp(comp: PageComposition, op: string, id: string): PageComposition {
  if (op === "remove") return removeBlock(comp, id);
  if (op.startsWith("span:")) {
    const span = op.slice("span:".length);
    return isSpan(span) ? setSpan(comp, id, span) : comp;
  }
  if (op === "move:up" || op === "move:down") {
    const from = comp.blocks.findIndex((b) => b.id === id);
    if (from === -1) return comp;
    return moveBlock(comp, id, op === "move:up" ? from - 1 : from + 1);
  }
  return comp;
}

// ---------------------------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------------------------

/** What the page already holds, read back off the page itself.
 *
 *  The Spec pane prints the composition document, so the page is already carrying its own state in
 *  a form an import understands, and reading it back is cheaper and more honest than embedding a
 *  second copy for a script. An empty pane means the server rendered nothing, which is either the
 *  empty state or a static host that never saw the prompt; the caller tells those apart by whether
 *  the URL carries an ask. */
function stateFromPage(): PageComposition {
  const printed = $('[data-surface="builder-spec"]')?.textContent?.trim();
  if (!printed) return emptyComposition();
  try {
    return fromDocument(JSON.parse(printed), BLOCK_COMPONENTS);
  } catch {
    // A pane that is not JSON is a page this build did not render. Starting empty is the safe
    // direction: the visitor's next prompt still works, where a throw here would kill the composer.
    return emptyComposition();
  }
}

function boot(): void {
  const board = $(".board");
  const canvas = $(`[data-surface="${CANVAS_SURFACE}"]`);
  const rail = $('[data-surface="builder-rail"]');
  const library = $(`.${LIBRARY_CLASS}`);
  const composer = $<HTMLFormElement>(".builder-composer");
  if (!board || !canvas || !rail || !library || !composer) return;

  let state = stateFromPage();
  const askInURL = new URLSearchParams(location.search).get("ask")?.trim() ?? "";

  // THE STATIC-HOST CASE, and the whole reason this file exists: the address carries a prompt and
  // the page came back with nothing on it, because the host froze one file and serves it whatever
  // the query string says. Compose it here.
  if (askInURL && state.blocks.length === 0) {
    state = addFromDescription(state, askInURL);
    paint(board, canvas, rail, library, viewOf(state, askInURL));
    // The composer holds the prompt that produced the page, so a visitor edits rather than retypes.
    // It is set here rather than through the fill, because the composer binds over its own one-item
    // spec and the fill walking it with the view's data would blank it. On the live server the
    // server already seeded it; on a static host nobody had, and the box came up empty under a page
    // it had supposedly built.
    const box = $<HTMLTextAreaElement>("textarea", composer);
    if (box && !box.value) box.value = askInURL;
  }

  // Every later prompt ADDS to what is already there, which is the whole difference from the form
  // demo: a page you build up rather than one you keep re-rolling. Intercepted rather than left to
  // the plain GET, because a round trip would throw the composition away and, on a static host,
  // would come back to the same frozen file.
  composer.addEventListener("submit", (e) => {
    const box = $<HTMLTextAreaElement>("textarea", composer);
    const ask = box?.value.trim() ?? "";
    if (!ask) return;
    e.preventDefault();
    const before = state.blocks.length;
    state = addFromDescription(state, ask);
    paint(board, canvas, rail, library, viewOf(state, ask, state.blocks.length - before));
    // The URL keeps carrying the LATEST prompt, so an example link and a shared address still work.
    // The composition does not go in it: a whole page of blocks grows past what a link can carry.
    // The honest consequence, said on the page as well as here, is that reloading rebuilds from
    // that last prompt alone rather than from everything you added.
    history.replaceState(null, "", `${location.pathname}?ask=${encodeURIComponent(ask)}`);
  });

  // The rail's buttons, through ONE delegated listener on the rail itself rather than one per
  // button. The rows are replaced on every repaint, so a listener bound to a button would be bound
  // to a node that no longer exists by the time you pressed the next one, and rebinding after each
  // paint is a bookkeeping job with nothing to gain. The row carries the block id, the button
  // carries the op, and neither needs registering.
  rail.addEventListener("click", (e) => {
    const button = (e.target as Element | null)?.closest("[data-op]");
    const id = button?.closest("[data-block]")?.getAttribute("data-block");
    const op = button?.getAttribute("data-op");
    if (!op || !id) return;
    const next = applyOp(state, op, id);
    // A press that changes nothing repaints nothing: pressing the span a block already has, or the
    // up arrow on the first row, is a no-op rather than a flicker.
    if (next === state) return;
    state = next;
    paint(board, canvas, rail, library, viewOf(state, currentAsk(), null));
  });

  /** The prompt as it currently stands, for a repaint that no prompt caused. The composer holds the
   *  page's own prompt, so an op reads it back rather than the view carrying a stale copy of it. */
  function currentAsk(): string {
    return $<HTMLTextAreaElement>("textarea", composer!)?.value.trim() ?? "";
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
