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
import { looksLikeAnEdit } from "./block-command.ts";
import { blockMessage, readModelMove } from "./block-reasoner.ts";

// grain's model boundary and its live-DOM manifest, pulled by URL because the module server refuses
// a bare import in the browser — the same shape desk-door.ts uses for the door, the kit and the chat
// transport.
//
// These are grain's, deliberately: the prompt the model is handed, the parser that pulls a move out
// of whatever it says, and the validator that checks that move against what is actually on the
// screen. A portfolio copy of any of the three would be a second opinion about what is legal, and
// the manifest is the only thing that knows.
//
// LAZY, and that was measured rather than preferred. Loading them at the top means a top-level
// await, which defers this whole module's evaluation and therefore `boot()` — and boot is what
// installs the MutationObserver that notices an AI edit. An op that lands in that gap is silently
// missed, which is exactly the failure the observer exists to close. A span test that had been
// green all day went red on the first version of this file. Nothing needs grain until an edit is
// actually being read, and by then a model call is about to cost far more than an import.
type GrainModel = typeof import("@tjakoen/grain/ai/model.ts");
type GrainManifest = typeof import("@tjakoen/grain/ai/manifest-dom.ts");
let grainPair: Promise<[GrainModel, GrainManifest]> | null = null;
const loadGrain = (): Promise<[GrainModel, GrainManifest]> => {
  grainPair ??= Promise.all([
    import(new URL("../../grain/ai/model.js", import.meta.url).href) as Promise<GrainModel>,
    import(new URL("../../grain/ai/manifest-dom.js", import.meta.url).href) as Promise<GrainManifest>,
  ]);
  return grainPair;
};
import { viewOf, type BuilderView } from "./builder-page.ts";
import {
  BLOCK_ID_ATTR, CANVAS_SURFACE, CELL_CLASS, LIBRARY_CLASS, REPEATS, SPAN_ATTR, SURFACE_ATTR,
  TEMPLATE_ATTR, blockSurface, fillTree, restoreSurfaces,
} from "./canvas-dom.ts";

/** The page's own chrome binds over the VIEW; a block binds over its own DATA; the composer binds
 *  over its one-item spec. Filling the board must therefore stop at all three, or the view's data
 *  would be walked into markup that means something else and every label would quietly go blank. */
const FILL_SKIP = `.canvas, .wb__rows, .${LIBRARY_CLASS}, .builder-composer`;

const $ = <T extends Element>(sel: string, root: ParentNode = document): T | null => root.querySelector<T>(sel);

/** The one door, as the dispatcher island publishes it (grain's ai-dispatch.js, `window.grain.door`).
 *
 *  Reached through the public seam rather than by importing a door module, because that seam is the
 *  point: a click on a rail button, an Intent from the desk and an Intent from this page's prompt
 *  bar all go out the same wire, inherit the same validation and come back as the same render ops.
 *  A page that composed its own door would be a second way in, and this page has argued against
 *  having one since the composer was written. */
interface GrainDoor {
  submit(action: string, target: string, payload?: Record<string, unknown>, trigger?: Element | null): void;
  /** Whether the reply channel actually came up. Honest, set by outcome, never assumed. */
  online(): boolean;
}
const grainDoor = (): GrainDoor | null =>
  (window as unknown as { grain?: { door?: GrainDoor } }).grain?.door ?? null;

/** The DESK's model, as desk-door.ts publishes it. One structured completion, no conversation.
 *
 *  Its absence is the honest offline signal and is treated as one: this page says the desk cannot
 *  run rather than reaching for a word list that is not the model. That was the owner's call on
 *  2026-08-14, and the reason is that a silent fallback would let the page claim an AI edit for
 *  something no AI touched. */
interface DeskModel { complete(prompt: string): Promise<string | null> }
const deskModel = (): DeskModel | null =>
  (window as unknown as { desk?: DeskModel }).desk ?? null;

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
  // The address, and it is here because the verbs exist: block.remove, block.span and block.move
  // landed in grain's contract first. An address that arrives before a working verb advertises an
  // operation nothing can perform, which is the tick box's lesson (grain plans/check-set-op.md).
  cell.setAttribute(SURFACE_ATTR, blockSurface(block.id));
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
  repaintChrome(board, rail, library, view);
}

/** Everything about the page EXCEPT the canvas: the rail's rows, the counts, the flags, the spec.
 *  Split out because reconciling after an AI op must not rebuild the canvas — the dispatcher already
 *  changed it, and rebuilding would throw away the AI ink it put on the cell it touched. */
function repaintChrome(board: Element, rail: Element, library: Element, view: BuilderView): void {
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

/** Read the composition back off the canvas.
 *
 *  THE REASON THIS EXISTS, and it is the whole of what wiring the AI to a block costs. The AI does
 *  not call these functions. It raises an Intent, grain's reasoner answers with a render op, and
 *  grain's dispatcher applies that op to the addressed cell — because a reasoner reaching into this
 *  module's variables would be the privileged AI-to-DOM back channel the architecture refuses. So
 *  after an op the DOM is right and this module's `state` is stale, and a stale state is not a
 *  cosmetic problem: the next prompt would append to a composition that still holds the block the
 *  AI just removed, and it would come back.
 *
 *  The split is deliberate. The DOM is the authority on WHICH blocks are here, in what order, at
 *  what span, because that is exactly what the three verbs change. `known` stays the authority on
 *  each block's DATA, because rendered markup cannot be read back into a block's data object
 *  without guessing, and guessing is how a form block loses its spec. */
function readComposition(canvas: Element, known: PageComposition): PageComposition {
  const byId = new Map(known.blocks.map((b) => [b.id, b]));
  const blocks: Block[] = [];
  for (const cell of canvas.children) {
    const id = cell.getAttribute(BLOCK_ID_ATTR);
    const block = id ? byId.get(id) : undefined;
    if (!block) continue;                       // a cell this build did not put there is not a block
    const span = cell.getAttribute(SPAN_ATTR);
    blocks.push(isSpan(span) ? { ...block, span } : block);
  }
  return { blocks, refusals: known.refusals };
}

/** Whether two compositions differ in anything the canvas can show. Cheap and total: ids in order,
 *  plus each span. Data cannot change under us, because no verb changes it. */
const sameShape = (a: PageComposition, b: PageComposition): boolean =>
  a.blocks.length === b.blocks.length &&
  a.blocks.every((x, i) => x.id === b.blocks[i]!.id && x.span === b.blocks[i]!.span);

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

  /** The prompt that last COMPOSED this page, which is not the same thing as what is in the box.
   *
   *  A repaint needs the page's own prompt: the one the canvas is showing, echoed back as "this is
   *  what produced it" and run past the refusal tables for anything the description asked for and
   *  did not get. An edit command is typed into the same box and is none of those things, so a
   *  repaint that read the box would relabel the page with "drop the second card" and then hand
   *  that sentence to a matcher looking for components in it. */
  let pageAsk = askInURL;

  /** What the last prompt was READ as, said in one line above the note.
   *
   *  Written straight to the element rather than bound through the view, because the view is
   *  repainted every time an op lands, and the op that lands is the one this line is announcing: a
   *  bound line would blank itself at the exact moment it came true. */
  const saidLine = $('[data-surface="builder-said"]');
  const say = (text: string, read: "command" | "refusal" | "thinking" | "reply"): void => {
    if (!saidLine) return;
    saidLine.textContent = text;
    saidLine.setAttribute("data-read", read);
    saidLine.removeAttribute("hidden");
  };
  const clearSaid = (): void => {
    if (!saidLine) return;
    saidLine.textContent = "";
    saidLine.removeAttribute("data-read");
    saidLine.setAttribute("hidden", "");
  };

  /** An edit, from the sentence to the op. The model chooses; nothing it says is trusted.
   *
   *  The order matters and every step of it is somebody else's code. grain harvests the manifest
   *  from the live DOM, so the model is told which blocks are here and which verbs each one accepts,
   *  read off the page rather than off this module's state. grain builds the prompt. The desk runs
   *  the model. grain parses whatever came back and validates it against that same manifest.
   *  block-reasoner.ts narrows the survivors to the three verbs that edit a page and checks their
   *  closed word lists, which validation does not. Only then does an Intent go out the one door.
   *
   *  What is NOT here is a fallback. If the model cannot run, this says so and stops. */
  async function runEdit(ask: string): Promise<void> {
    const desk = deskModel();
    if (!desk) {
      say("The desk cannot run here, so there is nothing to read your sentence. The rail's own controls still work.", "refusal");
      return;
    }
    const door = grainDoor();
    if (!door || !door.online()) {
      // Applying the op locally would look identical on screen and would be a demo of the rail
      // wearing a prompt bar, which is not what this page claims.
      say("The door is not up, so a block verb has nowhere to go. The rail's own controls still work.", "refusal");
      return;
    }

    say("Reading the page…", "thinking");
    const [grainModel, grainManifest] = await loadGrain();
    const manifest = grainManifest.domManifest(document);
    const prompt = grainModel.buildReasonerPrompt(
      grainManifest.manifestForReasoner(document),
      blockMessage(ask, state.blocks.map((b) => b.id)),
    );

    const raw = await desk.complete(prompt);
    if (raw === null) {
      say("The desk could not run the model here, so it did not guess. The rail's own controls still work.", "refusal");
      return;
    }

    const read = readModelMove(raw, manifest, grainModel);
    if (read.kind === "refusal") {
      console.info("[builder] refused the desk's move:", read.because, raw);
      say(read.said, "refusal");
      return;
    }
    if (read.kind === "reply") { say(read.said, "reply"); return; }

    // Through the one door, never through applyOp. Calling this module's own op function here would
    // be quicker and would prove nothing: the point is that a block can be operated by something
    // that only knows a verb and an address, and the way to show that is to send exactly those two
    // things out the same wire a rail button uses. The dispatcher answers by mutating the addressed
    // cell, and the watcher below derives the composition back off the DOM.
    //
    // The line says which block BEFORE the op lands, and that is the one guard against the failure
    // validation cannot see: a move that is legal and wrong. Measured, the live 0.5B has never got
    // that far. Over thirty-three answers, eighteen before grain's reasoner manifest was narrowed
    // and fifteen after, zero edits landed, seven named a block at all, and five of those named the
    // right block AND the right verb and were refused on the address form, since the answer says b2
    // where the manifest addresses block:b2. So this guard covers a failure nothing here has yet
    // produced, and it stays because the address is the one thing a reader can check before the
    // page moves rather than after.
    say(read.command.said, "command");
    door.submit(read.command.action, read.command.surface, read.command.payload);
  }

  // A prompt is ROUTED before it is read, and the router runs on nothing.
  //
  // Over a page that already holds blocks, a prompt may be an EDIT of it: "drop the second card" is
  // a sentence the matcher can do nothing with, because adding is the only thing it knows how to do.
  // looksLikeAnEdit answers that one question by grammar, which is why it needs no model and no word
  // list: you edit "the card" and you ask for "a card". Everything it routes to an edit goes to the
  // model; everything else still ADDS, which is the whole difference from the form demo and the part
  // that has to keep working on a machine that cannot run a model at all.
  //
  // Intercepted rather than left to the plain GET, because a round trip would throw the composition
  // away and, on a static host, would come back to the same frozen file.
  composer.addEventListener("submit", (e) => {
    const box = $<HTMLTextAreaElement>("textarea", composer);
    const ask = box?.value.trim() ?? "";
    if (!ask) return;
    e.preventDefault();

    if (looksLikeAnEdit(ask, state.blocks.length)) {
      void runEdit(ask).catch((err) => {
        console.error("[builder] the edit path failed", err);
        say("Something went wrong reading that. The rail's own controls still work.", "refusal");
      });
      return;
    }

    clearSaid();
    const before = state.blocks.length;
    state = addFromDescription(state, ask);
    pageAsk = ask;
    repaint(viewOf(state, ask, state.blocks.length - before));
    // The URL keeps carrying the LATEST prompt, so an example link and a shared address still work.
    // The composition does not go in it: a whole page of blocks grows past what a link can carry.
    // The honest consequence, said on the page as well as here, is that reloading rebuilds from
    // that last prompt alone rather than from everything you added. An EDIT never touches the
    // address, because the address names what produced the page rather than what was done to it.
    history.replaceState(null, "", `${location.pathname}?ask=${encodeURIComponent(ask)}`);
  });

  // THE HANDSHAKE, and it is what makes an AI-driven block edit real rather than cosmetic.
  //
  // The AI never calls this module. It raises an Intent, grain's reasoner answers with a render op,
  // and grain's dispatcher applies that op to the addressed cell. So the DOM changes underneath us,
  // and without this the page would keep composing against a block the AI had already removed and
  // paint it straight back on the next prompt: a delete that lands, reports success and undoes
  // itself, which is exactly the class of silent lie the tick box verb was invented to close.
  //
  // A MutationObserver rather than the `change` event the span and move ops fire, because the third
  // verb does not fire one: block.remove rides the generic `remove` op, which deletes the element
  // and announces nothing. One watcher that sees all three beats two mechanisms and a gap.
  const watcher = new MutationObserver(() => {
    const next = readComposition(canvas, state);
    if (sameShape(state, next)) return;          // an attribute we do not read changed; nothing to do
    state = next;
    // The chrome only. The canvas is already right, and rebuilding it would throw away the AI ink
    // the dispatcher just put on the cell it touched.
    repaintChrome(board, rail, library, viewOf(state, pageAsk, null));
  });
  // `subtree: true` is load-bearing rather than cautious: a span op sets the attribute on a CELL,
  // and an attributeFilter without a subtree only ever watches the canvas element's own attributes.
  // Without it the remove and move ops were noticed and the span op silently was not, which is a
  // worse failure than none of them working, because two out of three looks like it works.
  watcher.observe(canvas, { childList: true, subtree: true, attributes: true, attributeFilter: [SPAN_ATTR] });

  /** Paint, then DRAIN the watcher's queue. Our own paint is not news, and draining is how that is
   *  said rather than with a flag: a MutationObserver callback runs in a microtask, so a flag set
   *  and cleared around a synchronous paint would already be false by the time the callback read
   *  it. `takeRecords` empties the queue in the same tick, so the callback never sees a mutation
   *  this module made. */
  const repaint = (view: BuilderView): void => {
    paint(board, canvas, rail, library, view);
    watcher.takeRecords();
  };

  // Collapsing the rail. A workbench whose tool panel cannot get out of the way charges a permanent
  // 20rem tax on the thing you are actually looking at. The attribute lands on the workbench rather
  // than the rail because collapsing is a layout change and the grid owns layout, which is the same
  // shape the shell's own aside and console toggles use.
  //
  // Remembered for the session, not forever: this is a preference someone expressed by pressing a
  // button, so it should survive a rebuild of the page and not outlive the visit. sessionStorage is
  // exactly that, and it is wrapped because a browser with storage denied must still toggle.
  const RAIL_KEY = "portfolio.builder.rail-collapsed";
  const workbench = board.querySelector(".wb");
  const railToggle = $<HTMLButtonElement>("[data-rail-toggle]", board);
  if (workbench && railToggle) {
    const setCollapsed = (on: boolean): void => {
      workbench.setAttribute("data-rail-collapsed", String(on));
      railToggle.setAttribute("aria-expanded", String(!on));
      railToggle.textContent = on ? "\u25B8" : "\u25C2";     // ▸ closed, ◂ open: the arrow points where a press goes
      railToggle.title = on ? "Show the block list" : "Collapse the block list";
    };
    try { if (sessionStorage.getItem(RAIL_KEY) === "1") setCollapsed(true); } catch { /* storage denied */ }
    railToggle.addEventListener("click", () => {
      const next = workbench.getAttribute("data-rail-collapsed") !== "true";
      setCollapsed(next);
      try { sessionStorage.setItem(RAIL_KEY, next ? "1" : "0"); } catch { /* storage denied */ }
    });
  }

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
    repaint(viewOf(state, pageAsk, null));
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
