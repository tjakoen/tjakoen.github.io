// portfolio/ai/block-reasoner.ts — the model chooses the verb, and code decides whether it is allowed
// to have chosen it.
//
// WHAT CHANGED, AND WHY. D3b shipped a deterministic word list that turned "drop the second card"
// into `block.remove` on an id. It worked, and the owner's read was that a page whose whole argument
// is about building with AI should not be reaching its decisions without one. That is the right
// call: the demo's claim was doing less than the page said it was.
//
// So the model does the UNDERSTANDING and code does the ENUMERATING, which is the same division
// block-set.ts already states about component names. The 0.5B reads the live manifest, which lists
// the blocks actually on the page and the verbs each one accepts, and answers with one move. Nothing
// it says is trusted: grain parses it, grain validates it against that same manifest, and this file
// then narrows what survives to the three verbs that edit a composed page.
//
// THE LIMIT, STATED HERE BECAUSE IT CANNOT BE ENGINEERED AWAY. Validation catches a verb that does
// not exist, a target that is not on the page, a payload of the wrong shape, and a verb the target
// does not accept. It cannot catch a move that is legal and WRONG: asked for the second card, a
// small model may hand back the first one, and b2 is as real an address as b4. That is why every
// command carries the id it is about to touch in words the page shows before the op lands.
//
// THAT GUARD HAS NEVER BEEN NEEDED, AND THE REASON IS WORSE THAN THE GUARD. This comment used to
// close by saying the honest demo is one where you can see it pick the wrong block. Measured on
// 2026-08-15 over thirty-three answers from the live 0.5B, it does not get that far: eighteen
// answers before the manifest was narrowed aimed at no block at all, and of the fifteen after it,
// seven named a block, five named the right block AND a real block verb, and all five were refused
// for answering b2 where the manifest addresses block:b2. Not one correct edit in either set, and
// the canvas was byte-identical in every run. So the demo people actually watch is the refusal path,
// which is why the said lines below are page copy rather than debug output. The numbers and the
// reverted prompt-side fix are in plans/builder-design.md, Open 3.
//
// GRAIN OWNS THE MACHINERY. buildReasonerPrompt, parseModelMove and validateMove are grain's, passed
// in rather than imported so this module stays pure and headless: the browser refuses a bare grain
// import, and a test should not need a URL import to check a refusal.
import type { Manifest } from "@tjakoen/grain/ai/manifest.ts";
import { SPANS, isSpan } from "./block-set.ts";
import { MOVE_DIRECTIONS, type MoveDirection } from "./block-command.ts";

const isDirection = (d: unknown): d is MoveDirection =>
  typeof d === "string" && (MOVE_DIRECTIONS as readonly string[]).includes(d);

/** The three verbs that edit a composed page. A move that validates but is not one of these is
 *  refused here rather than in grain, because grain is right that `field.set` on this page's prompt
 *  box is a legal move; it is simply not an EDIT, and letting it through this path would have the
 *  model type into the composer instead of touching the page it was asked about. */
export const BLOCK_VERBS = ["block.remove", "block.span", "block.move"] as const;
export type BlockVerb = (typeof BLOCK_VERBS)[number];
const isBlockVerb = (a: string): a is BlockVerb => (BLOCK_VERBS as readonly string[]).includes(a);

export interface BlockIntent {
  action: BlockVerb;
  surface: string;
  payload: Record<string, unknown>;
  /** What the page says before the op lands. It NAMES the block, because a legal-but-wrong target is
   *  the one failure validation cannot see, and a demo that hides it is worse than one that does not. */
  said: string;
}

export type ModelRead =
  | { kind: "command"; command: BlockIntent }
  /** The model chose to talk rather than act, which is a legal move in grain's vocabulary and the
   *  right answer to "the intro should mention pricing": there is no verb for it. */
  | { kind: "reply"; said: string }
  | { kind: "refusal"; said: string; because: string };

/** grain's model boundary, injected. Exactly the two functions, so a test can hand over a stub and a
 *  browser can hand over the URL-imported module. */
export interface GrainModelPort {
  parseModelMove(raw: string): { ok: true; move: ModelMoveLike } | { ok: false; reason: string };
  validateMove(move: ModelMoveLike, manifest: Manifest):
    | { ok: true; move: { action: string | null; target: string; payload: Record<string, unknown>; reply?: string } }
    | { ok: false; reason: string };
}
/** grain's ModelMove, structurally. Restated rather than imported so the injected port needs no type
 *  gymnastics at the call site; grain's own types are the ones that actually check the shape. */
export interface ModelMoveLike {
  action?: string | null;
  target?: string;
  payload?: Record<string, unknown>;
  reply?: string;
}

// ---------------------------------------------------------------------------------------------
// The prompt
// ---------------------------------------------------------------------------------------------

/** The human's message, with the page's own constraint attached.
 *
 *  It rides in the USER turn rather than the system preamble because grain owns the preamble and
 *  this is one page's rule rather than the vocabulary's. It names the block ids literally: a 0.5B
 *  copies far better than it computes, and "pick one of b1, b2, b3, b4" is a copy where "the second
 *  card" is a filter and a count. Naming them does not make the model right, it makes it possible.
 *
 *  THE BARE ID IS DELIBERATE AND IT WAS TRIED THE OTHER WAY. This line names `b2` while the manifest
 *  a few lines above addresses the same block `block:b2`, which reads like a contradiction worth
 *  fixing, and on 2026-08-15 it was fixed: the ids were printed as `block:b1` through `block:b4` to
 *  match. It made the model strictly worse, measured over 25 answers across two variants. On bare
 *  ids, seven of fifteen answers aimed at a block and six named a real block verb. On prefixed ids,
 *  zero of fifteen aimed at a block, and the model collapsed to answering `move` on `builder`, a
 *  token off the screen name. Dropping the extra "copy it exactly" instruction and keeping only the
 *  prefix did not recover it: zero of ten aimed at a block. So the change was reverted whole.
 *
 *  The reading that survives the data is that a 0.5B can copy `b2` and cannot copy `block:b2`, and
 *  that being handed an address it cannot reproduce is worse than being handed a short one that
 *  needs a prefix added. The contradiction is real and the fix is on the other side: normalize a
 *  bare id UP to `block:<id>` when reading the answer, rather than pushing the long form down into
 *  the prompt. That is a decision rather than a cleanup, so it is filed and not taken here.
 *
 *  The reply-without-acting escape is spelled out on purpose. Without it a small model handed a verb
 *  list treats every message as a command to be answered with a verb, and "what is this page for"
 *  becomes a removal. */
export function blockMessage(message: string, blockIds: string[]): string {
  const ids = blockIds.length ? blockIds.join(", ") : "none";
  return [
    message.trim(),
    "",
    "(You are editing a page that is already built. The only verbs that change it are block.remove,",
    `block.span and block.move, and each one targets exactly one block. The blocks here are: ${ids}.`,
    "block.span takes span: full, half or third. block.move takes direction: up or down.",
    "If the message is not asking for one of those three changes, reply without acting.)",
  ].join("\n");
}

// ---------------------------------------------------------------------------------------------
// Reading what came back
// ---------------------------------------------------------------------------------------------

const idOf = (surface: string): string => surface.replace(/^block:/, "");

/** The short ids the rail prints, from the addresses the manifest carries. */
const blockIdsIn = (manifest: Manifest): string[] =>
  manifest.targets.filter((t) => t.id.startsWith("block:")).map((t) => idOf(t.id));

/** A list a person reads, rather than a comma-joined array. */
const inWords = (items: string[], last: "and" | "or" = "and"): string =>
  items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} ${last} ${items[items.length - 1]}`;

/** The three verbs in the words the rest of the page uses for them. */
const VERB_WORDS: Record<BlockVerb, string> = {
  "block.remove": "drop a block",
  "block.span": "set a block's width",
  "block.move": "move a block",
};

/** The visitor-facing half of a refusal grain has already made.
 *
 *  grain's reason is written for whoever is debugging the vocabulary. `no surface "b2" on this
 *  screen` is the right sentence in a console and the wrong one on a page a visitor is reading, and
 *  it was reaching the page verbatim: about half the live model's answers land in exactly that
 *  branch. So the reason still goes to `because` word for word, and the line the page SHOWS is
 *  derived here from the move and the live manifest instead.
 *
 *  Derived rather than pattern-matched against grain's wording, because grain owns those strings and
 *  is free to change them, and copy that silently degrades to a generic sentence the day an upstream
 *  string moves is worse than copy that never read it.
 *
 *  NOTHING HERE FORGIVES A MOVE. Every branch describes a refusal that has already happened and only
 *  chooses the words for it. The near-miss branch especially: it says the address was one prefix
 *  short and it still says nothing moved, because normalizing a bare id up to block:<id> is a
 *  decision about how forgiving the fence should be, it is filed in plans/builder-design.md as Open
 *  3, and it is not taken here. */
function refusalSaid(move: ModelMoveLike, manifest: Manifest): string {
  const action = move.action ?? null;
  if (action === null) return "The desk answered without a change and without anything to say, so nothing moved.";

  if (typeof action !== "string")
    return "The desk answered with something that is not a verb at all, so nothing moved.";
  // A manifest without an actions list is not evidence that the verb is unknown, so this only
  // convicts when there is a list to convict against. Everything else falls through to the target
  // branches, which refuse it just as honestly and with a more useful sentence.
  if (manifest.actions && !manifest.actions.some((a) => a.name === action))
    return `The desk asked for ${action}, which is not a change anything on this page can make.`;

  const verb = isBlockVerb(action) ? VERB_WORDS[action] : action;
  const target = typeof move.target === "string" ? move.target : "";
  if (!target) return `The desk chose to ${verb} without saying which one, so nothing moved.`;

  const surface = manifest.targets.find((t) => t.id === target);
  if (!surface) {
    // The measured majority case, and the one that used to print grain's console sentence. The model
    // names the block correctly and writes the address short.
    if (manifest.targets.some((t) => t.id === `block:${target}`))
      return `The desk aimed at ${target}, and this page addresses that block as block:${target}. An address that is one word short is still not the address, so nothing moved.`;
    const ids = blockIdsIn(manifest);
    return ids.length
      ? `The desk aimed at ${target}, which is not on this page. The blocks here are ${inWords(ids)}.`
      : `The desk aimed at ${target}, and there are no blocks on this page yet.`;
  }
  // Cast to widen, the same idiom isBlockVerb uses: `action` is a string that has already been
  // checked against the manifest's own action list, and ActionName is the narrower type on the way in.
  if (!(surface.accepts as readonly string[]).includes(action))
    return `${idOf(target)} is on this page, but it does not take that change.`;

  return `The desk's answer was missing something the change needs, so nothing moved.`;
}

/** What the page will say it is doing, in words rather than in verb names, always naming the id. */
function sayFor(action: BlockVerb, surface: string, payload: Record<string, unknown>): string {
  const id = idOf(surface);
  if (action === "block.remove") return `Dropping ${id}.`;
  if (action === "block.span") return `Setting ${id} to ${String(payload.span)} width.`;
  return `Moving ${id} ${String(payload.direction)}.`;
}

/** Turn the model's raw text into something the door can be given, or into a reason it cannot.
 *
 *  Every failure path says something a person can act on, because the refusals ARE the demo: a
 *  builder that silently does nothing when the model wanders is indistinguishable from a broken one.
 *  `because` carries grain's own developer-facing reason for the console; `said` is the line the
 *  page shows. */
export function readModelMove(raw: string, manifest: Manifest, grain: GrainModelPort): ModelRead {
  const parsed = grain.parseModelMove(raw);
  if (!parsed.ok) {
    return {
      kind: "refusal",
      said: "The desk did not answer with a move it could make. Try naming the block, like drop b2.",
      because: parsed.reason,
    };
  }

  const checked = grain.validateMove(parsed.move, manifest);
  if (!checked.ok) {
    return {
      kind: "refusal",
      // Two audiences, two sentences. grain's reason names the legal targets and is the most useful
      // thing a developer can read in the console, so it goes to `because` untouched; refusalSaid
      // writes the same refusal for the person looking at the page.
      said: refusalSaid(parsed.move, manifest),
      because: checked.reason,
    };
  }

  const move = checked.move;
  if (move.action === null) {
    return { kind: "reply", said: move.reply?.trim() || "The desk had nothing to change here." };
  }
  if (!isBlockVerb(move.action)) {
    return {
      kind: "refusal",
      said: `The desk chose ${move.action}, which does not edit a block. This box changes the page with drop, width and move.`,
      because: `${move.action} is legal in the vocabulary but is not one of ${BLOCK_VERBS.join(", ")}`,
    };
  }

  // The closed WORD lists, and grain does not check these: `validateMove` checks the payload's
  // SCHEMA, so `span: "wide"` is a string where a string was required and passes. Measured, not
  // assumed — a test asserted a refusal here and got a command. The dispatcher would refuse it a
  // moment later and log to the console, which is a no-op the visitor sees as nothing happening,
  // after the page has already said it was setting a block to wide width. Refusing here means the
  // page never claims a change it is not about to make.
  if (move.action === "block.span" && !isSpan(move.payload.span)) {
    return {
      kind: "refusal",
      said: `A block is ${inWords([...SPANS], "or")} wide, and the desk asked for ${JSON.stringify(move.payload.span)}.`,
      because: `block.span payload outside the closed set: ${JSON.stringify(move.payload.span)}`,
    };
  }
  if (move.action === "block.move" && !isDirection(move.payload.direction)) {
    return {
      kind: "refusal",
      said: `A block moves ${MOVE_DIRECTIONS.join(" or ")}, and the desk asked for ${JSON.stringify(move.payload.direction)}.`,
      because: `block.move payload outside the closed set: ${JSON.stringify(move.payload.direction)}`,
    };
  }

  return {
    kind: "command",
    command: {
      action: move.action,
      surface: move.target,
      payload: move.payload,
      said: sayFor(move.action, move.target, move.payload),
    },
  };
}
