// portfolio/ai/composition.ts — a composed page as STATE, and the four things that can happen to
// it. The builder's whole difference from the form demo lives here: a prompt adds to what is already
// there rather than replacing it, so the composition is something you build up rather than something
// you keep re-rolling.
//
// Pure and framework-free: no DOM, no renderer, no storage. Every function takes a composition and
// returns a NEW one, which is what makes the same code correct on the server (rendering a spec) and
// in the browser (holding the live one) without a second implementation. Where the state PERSISTS is
// a later phase's problem and deliberately not this file's.
import { matchBlocks, isSpan, type Block, type BlockRefusal, type Span } from "./block-set.ts";

/** A composed page. `blocks` is ordered and the order is what renders. `refusals` is what the last
 *  add was asked for and would not build, kept beside the blocks rather than thrown away, because a
 *  page that silently drops half a request is the failure this whole demo argues against. */
export interface PageComposition {
  blocks: Block[];
  refusals: BlockRefusal[];
}

export const emptyComposition = (): PageComposition => ({ blocks: [], refusals: [] });

/** The next free block index, so ids never collide with what is already there. Derived from the ids
 *  themselves rather than from the array length, because a composition someone has deleted from has
 *  fewer blocks than it has issued ids, and reusing an id would make a later reorder or delete hit
 *  the wrong block. A hand-edited or imported id that is not `b<number>` simply does not raise the
 *  ceiling, which is the safe direction: worst case a fresh id is higher than it needed to be. */
export function nextIndex(comp: PageComposition): number {
  let max = 0;
  for (const b of comp.blocks) {
    const m = /^b(\d+)$/.exec(b.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

/** Add whatever a description asks for to the END of the composition. The refusals REPLACE rather
 *  than accumulate: they describe the last thing asked for, and a list that grew forever would still
 *  be showing a visitor what they were refused three prompts ago as though it just happened. */
export function addFromDescription(comp: PageComposition, description: string): PageComposition {
  const { blocks, refusals } = matchBlocks(description, nextIndex(comp));
  return { blocks: [...comp.blocks, ...blocks], refusals };
}

/** Drop one block by id. An id that is not there returns the composition unchanged rather than
 *  throwing: a delete of something already gone is the same end state, and a caller racing itself
 *  should not get an exception for arriving second. */
export function removeBlock(comp: PageComposition, id: string): PageComposition {
  return { ...comp, blocks: comp.blocks.filter((b) => b.id !== id) };
}

/** Move one block to a new position. `to` is clamped rather than validated, because the two ways to
 *  get this wrong (past the end, below zero) both have one obvious right answer and neither is worth
 *  an error a caller has to handle. An unknown id changes nothing. */
export function moveBlock(comp: PageComposition, id: string, to: number): PageComposition {
  const from = comp.blocks.findIndex((b) => b.id === id);
  if (from === -1) return comp;
  const blocks = [...comp.blocks];
  const [block] = blocks.splice(from, 1);
  const target = Math.max(0, Math.min(to, blocks.length));
  blocks.splice(target, 0, block!);
  return { ...comp, blocks };
}

/** Change one block's span. An unknown id or a span outside the closed set changes nothing — the
 *  three words are the whole vocabulary and a caller inventing a fourth is refused here rather than
 *  reaching a stylesheet that has no rule for it. */
export function setSpan(comp: PageComposition, id: string, span: Span): PageComposition {
  if (!isSpan(span)) return comp;
  return { ...comp, blocks: comp.blocks.map((b) => (b.id === id ? { ...b, span } : b)) };
}

// ---------------------------------------------------------------------------------------------
// The document: what export writes and import reads
// ---------------------------------------------------------------------------------------------
// A composition is the thing you take away, so it needs a shape that survives leaving. `version` is
// carried from the first release rather than added at the first breakage, because a document with no
// version is one a later reader has to guess about. `refusals` are deliberately NOT exported: they
// are the last prompt's conversation, not part of the page.

export const COMPOSITION_VERSION = 1;

export interface CompositionDocument {
  version: number;
  /** The GRAIN byline, present only on a document that was EXPORTED. The page's own spec pane
   *  prints the composition without it, because the pane is showing state rather than handing over
   *  a file, and a signature on something nobody is taking away signs nothing. Import ignores it in
   *  either case: the byline travels with the composition and the composition never depends on it,
   *  which is what keeps a hand-edited file that dropped the line a valid file rather than a
   *  refusal. */
  madeWith?: string;
  blocks: Block[];
}

/** The composition as a document. `madeWith` is grain's own byline, passed in by whoever is writing
 *  a file rather than known here, because this module is pure and the line belongs to grain. */
export const toDocument = (comp: PageComposition, madeWith?: string): CompositionDocument =>
  madeWith
    ? { version: COMPOSITION_VERSION, madeWith, blocks: comp.blocks }
    : { version: COMPOSITION_VERSION, blocks: comp.blocks };

/** Read a document back into a composition, dropping anything that is not a block this build can
 *  render. A hand-edited or older file degrades to the blocks that survive, WITH a named refusal for
 *  each one that did not, rather than to a broken page or a thrown error — the same rule the matcher
 *  follows, applied to a file instead of a sentence. `known` is the caller's list of renderable
 *  component names, passed in rather than imported, so this file stays pure and a test can drive it
 *  with a set of its own. */
export function fromDocument(raw: unknown, known: readonly string[]): PageComposition {
  const doc = raw as Partial<CompositionDocument> | null;
  if (!doc || !Array.isArray(doc.blocks)) {
    return { blocks: [], refusals: [{ token: "the file", reason: "that is not a composition: it carries no blocks array." }] };
  }
  const blocks: Block[] = [];
  const refusals: BlockRefusal[] = [];
  for (const b of doc.blocks) {
    if (!b || typeof b !== "object") continue;
    const { id, component, span, data, props } = b as Partial<Block>;
    if (typeof component !== "string" || !known.includes(component)) {
      refusals.push({
        token: typeof component === "string" ? component : "a block",
        reason: "this build has no component by that name, so it would render as nothing rather than as what the file meant.",
      });
      continue;
    }
    blocks.push({
      id: typeof id === "string" && id ? id : `b${blocks.length + 1}`,
      component,
      // An unrecognized span falls back rather than refusing the whole block: the content is the
      // part worth keeping, and full is the layout that is never wrong, only sometimes wide.
      span: isSpan(span) ? span : "full",
      data: data && typeof data === "object" ? { ...data } : {},
      props: props && typeof props === "object" ? { ...props } : {},
    });
  }
  return { blocks, refusals };
}
