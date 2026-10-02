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
// THOSE FIVE ARE NO LONGER REFUSED FOR THE ADDRESS, SINCE 2026-08-19. The counts above stand as a
// measurement of what the live model said on 2026-08-15. What changed under them is the fence:
// readModelMove now resolves a bare id UP to its prefixed address when the live manifest carries
// exactly one block at that address, so an answer of b2 on a page holding one block:b2 is read as
// block:b2 and goes out the door. That is the read side of the direction filed as Open 3, and it is
// the only side taken: the prompt side was tried, measured strictly worse, and stays reverted. What
// has NOT happened is a fresh run of the live model against the new fence, so "not one correct edit"
// describes the runs that exist rather than what this build would do today.
//
// GRAIN OWNS THE MACHINERY. buildReasonerPrompt, parseModelMove and validateMove are grain's, passed
// in rather than imported so this module stays pure and headless: the browser refuses a bare grain
// import, and a test should not need a URL import to check a refusal.
import type { Manifest, ManifestTarget } from "@tjakoen/grain/ai/manifest.ts";
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

/** The edit prompt is a view of the live manifest, narrowed to the three operations this composer
 *  supports. The original manifest remains the validator's authority. Hiding unrelated actions and
 *  readable status text keeps the small model focused on the block controls it can actually use. */
export function blockEditManifest(manifest: Manifest): Manifest {
  const actions = manifest.actions.filter((action) => isBlockVerb(action.name));
  const targets: ManifestTarget[] = manifest.targets
    .filter((target) => target.kind === "block" && target.accepts.some(isBlockVerb));
  return {
    ...manifest,
    actions,
    targets,
    inView: {},
    note: "Live builder targets and actions, narrowed to the block edits this page supports.",
  };
}

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

/** The human's message, with the page's current blocks and editing limits attached.
 *
 *  It rides in the USER turn because this page's rules do not belong in GRAIN's shared preamble.
 *  Each live block is named by its short ID, type and position among blocks of that type. The IDs
 *  give the model something concrete to copy; the labels give requests such as "the second card" a
 *  little more context. Neither makes a small model reliable, so the browser announces the action
 *  before it runs and keeps Undo available.
 *
 *  The model receives only the block operations this page can currently perform. Copy editing is
 *  not one of them, and the browser refuses clear copy-writing requests before reaching the model.
 *  The reply-without-acting escape is also explicit: a model given a verb list may otherwise turn a
 *  question about the page into an unrelated removal. */
export function blockMessage(
  message: string,
  blocks: readonly (string | Pick<import("./block-set.ts").Block, "id" | "component">)[],
): string {
  const counts = new Map<string, number>();
  const descriptions = blocks.map((block) => {
    if (typeof block === "string") return block;
    const component = block.component.replace(/^block-/, "");
    const ordinal = (counts.get(component) ?? 0) + 1;
    counts.set(component, ordinal);
    const order = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"][ordinal - 1]
      ?? `${ordinal}th`;
    const label = component === "lede" ? "intro paragraph"
      : component === "card" ? `${order} card`
      : component === "callout" ? "callout"
      : component === "stat" ? "stat tile"
      : component === "form" ? "form"
      : "block";
    return `${block.id} (${label})`;
  });
  const ids = descriptions.length ? descriptions.join(", ") : "none";
  return [
    message.trim(),
    "",
    "(You are editing a page that is already built. The blocks from top to bottom are:",
    `${ids}. The only action names are block.remove, block.span and block.move.`,
    "Use the full action name, not a shortened word such as move.",
    "block.remove drops its target. block.span takes span: full, half or third.",
    "block.move takes direction: up or down. Each action targets exactly one listed block.",
    "If the request cannot be done with these actions, reply without acting and use action: null.)",
  ].join("\n");
}

// ---------------------------------------------------------------------------------------------
// Reading what came back
// ---------------------------------------------------------------------------------------------

const idOf = (surface: string): string => surface.replace(/^block:/, "");

/** The prefixed address a bare id means, when the live manifest leaves no doubt about which one.
 *
 *  WHY THIS EXISTS, AND WHY IT IS ON THIS SIDE. The prompt hands the model short ids because that is
 *  the only form a 0.5B reliably copies back, and the manifest addresses the same blocks long. That
 *  gap was measured rather than argued: five of fifteen answers named the right block AND a real
 *  block verb and were refused for writing b2 where the page addresses block:b2. Printing the long
 *  form in the prompt was the obvious fix, it was taken on 2026-08-15, and it made the model strictly
 *  worse, so the comment on blockMessage keeps those numbers and that door stays shut. This is the
 *  other side of the same problem: widen what the fence will READ, and leave what the model is told
 *  alone.
 *
 *  IT RESOLVES, IT DOES NOT GUESS. Exactly one block at block:<id> and nothing already answering to
 *  the short form, or it returns null and the refusal path runs untouched. Two blocks at one address
 *  is a page where the short form has no single meaning, and a fence that picks one of them for the
 *  model would be claiming an intent nothing expressed. */
function resolveBareId(target: string, manifest: Manifest): string | null {
  if (!target || target.includes(":")) return null;
  if (manifest.targets.some((t) => t.id === target)) return null;
  const matches = manifest.targets.filter((t) => t.id === `block:${target}`);
  return matches.length === 1 ? `block:${target}` : null;
}

/** The move as the page will act on it: the same move, with a resolvable short address written out.
 *  Everything downstream, grain's validation, the refusal copy and the said line, sees this one, so
 *  the page never describes an address it did not use. */
function normalizeTarget(move: ModelMoveLike, manifest: Manifest): ModelMoveLike {
  if (typeof move.target !== "string") return move;
  const resolved = resolveBareId(move.target, manifest);
  return resolved === null ? move : { ...move, target: resolved };
}

/** The short ids the rail prints, from the addresses the manifest carries. */
const blockIdsIn = (manifest: Manifest): string[] =>
  manifest.targets.filter((t) => t.id.startsWith("block:")).map((t) => idOf(t.id));

/** A list a person reads, rather than a comma-joined array. */
export const inWords = (items: string[], last: "and" | "or" = "and"): string =>
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
 *  it was reaching the page verbatim: about half the live model's answers landed in exactly that
 *  branch, back when a bare id was still refused. So the reason still goes to `because` word for
 *  word, and the line the page SHOWS is derived here from the move and the live manifest instead.
 *
 *  Derived rather than pattern-matched against grain's wording, because grain owns those strings and
 *  is free to change them, and copy that silently degrades to a generic sentence the day an upstream
 *  string moves is worse than copy that never read it.
 *
 *  NOTHING HERE FORGIVES A MOVE. Every branch describes a refusal that has already happened and only
 *  chooses the words for it. The forgiving happens one step earlier and in the open: readModelMove
 *  resolves a bare id up to its prefixed address before grain ever sees the move, so the answer that
 *  used to reach the near-miss branch is now an edit rather than a sentence about an edit. What is
 *  left of that branch is the case the resolver will not guess at, a page carrying two blocks at one
 *  address, and it still says nothing moved. */
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
    // What is left of the near-miss case. A short address the page carries once is resolved before
    // validation and never arrives here; one the page carries twice does, because there is no single
    // block it can mean and the fence will not pick for the model.
    if (manifest.targets.some((t) => t.id === `block:${target}`))
      return `The desk aimed at ${target}, and this page holds more than one block at that address, so nothing moved.`;
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

  // A short address is written out here, before grain validates and before any copy is derived, so
  // every reader downstream sees the one move the page will actually make. See resolveBareId for why
  // this is done on the way IN and not by teaching the prompt to print the long form.
  const asked = normalizeTarget(parsed.move, manifest);

  const checked = grain.validateMove(asked, manifest);
  if (!checked.ok) {
    return {
      kind: "refusal",
      // Two audiences, two sentences. grain's reason names the legal targets and is the most useful
      // thing a developer can read in the console, so it goes to `because` untouched; refusalSaid
      // writes the same refusal for the person looking at the page.
      said: refusalSaid(asked, manifest),
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
