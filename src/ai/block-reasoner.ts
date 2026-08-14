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
// command carries the id it is about to touch in words the page shows before the op lands. The
// honest demo is one where you can see it pick the wrong block, not one that cannot.
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
      // grain's reason already names the legal targets when a target was wrong, which is the most
      // useful sentence available and is written to be read by whoever is retrying.
      said: `The desk picked something that will not work here: ${checked.reason}`,
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
      said: `A block is ${SPANS.join(", ")} wide, and the desk asked for ${JSON.stringify(move.payload.span)}.`,
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
