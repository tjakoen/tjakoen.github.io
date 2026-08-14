// portfolio/ai/block-command.ts — the half of D3 that CHOOSES. Turn "drop the second card" into
// `block.remove` on `block:b2`, and turn everything it cannot resolve into a refusal that says why.
//
// WHY THIS EXISTS. As of D2 a human could remove a block, reorder one and change its span, and the
// model could not: its only lever on this page was writing a description into `field:builder-ask`,
// and no description means "drop the second card" because the matcher only ever adds. D3's first
// half closed the vocabulary side — `block` is a kind in grain's contract, `block.remove`,
// `block.span` and `block.move` are verbs, and every cell on the canvas carries its address. This
// closes the other side. The page was operable by an AI; nothing was operating it.
//
// WHAT IT IS NOT. It is not a model, and that is the design rather than a shortcut. block-set.ts,
// field-matcher.ts, notes-tags.ts and catalog.ts all state the same law: code enumerates, the model
// never does. A verb is a closed set of three, a span is a closed set of three, a direction is a
// closed set of two, and a target is something already on the page with an id printed in the rail.
// There is nothing left in that sentence for a 0.5B to invent, and every part of it that a small
// model does drift on — an index, a component name, a width in pixels — is a part this deliberately
// never asks for.
//
// WHAT IT REFUSES, and refusing out loud is half the point. An ask that names no block on the page,
// an ask that names two, and an ask for a width that is not one of the three all come back as a
// reason rather than a guess. A builder that quietly operates on the wrong block is worse than one
// that says it did not understand, because the first kind of mistake is one you find later.
//
// Pure + framework-free: no DOM, no page, no door, no model call. Unit-tests headless.
import { isSpan, type Span } from "./block-set.ts";

/** Which way a block moves, and there are two. Mirrors `MoveDirection` in grain's ai/contract.ts
 *  rather than importing it, for the reason ai-dispatch.js re-states the same closed sets: this
 *  module ships to the browser through the portfolio's own module path and its imports stay
 *  relative. The drift is guarded by a test that asserts the two words, the same way grain guards
 *  its dispatcher's copies. */
export type MoveDirection = "up" | "down";
export const MOVE_DIRECTIONS: readonly MoveDirection[] = ["up", "down"];

/** One block as this module needs to see it: an address and what it is. The caller passes the
 *  composition in order; nothing here reads the DOM or the block's data. */
export interface BlockRef {
  id: string;
  /** The registered component, e.g. `block-card`. Matched against the closed set below. */
  component: string;
}

/** What a chosen command is: an Intent, in the shape the one door takes, plus the line the page
 *  says out loud. `surface` is the block's real address, so this travels the same path a human
 *  press does rather than reaching into the page's own state. */
export interface BlockCommand {
  action: "block.remove" | "block.span" | "block.move";
  surface: string;
  payload: Record<string, unknown>;
  /** What the page tells the visitor it is about to do, in words rather than in verb names. */
  said: string;
}

/** Three answers, and the middle one is the one that keeps the composer working.
 *
 *  `none` means the text was not an edit at all, so the caller composes with it exactly as before:
 *  a description that adds blocks must keep going straight to the matcher, because adding is not a
 *  verb here and never will be. `refusal` means it WAS an edit and it will not be guessed at. */
export type BlockRead =
  | { kind: "command"; command: BlockCommand }
  | { kind: "none" }
  | { kind: "refusal"; said: string };

// ---------------------------------------------------------------------------------------------
// Normalizing — the same three helpers block-set.ts and field-matcher.ts use, for the same reason
// ---------------------------------------------------------------------------------------------

const normalize = (s: string): string => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const padded = (s: string): string => ` ${normalize(s)} `;
const hits = (text: string, tokens: readonly string[]): boolean => tokens.some((t) => text.includes(` ${t} `));

// ---------------------------------------------------------------------------------------------
// The closed word lists
// ---------------------------------------------------------------------------------------------

/** Removing, in the words people actually use for it. `drop` is here because it is the verb in the
 *  sentence this whole phase is named after, and it is also the riskiest one: "drop in a card" means
 *  add. That risk is answered by the empty-page guard in `readBlockCommand` rather than by dropping
 *  the word, because refusing the flagship phrase to be safe from a rarer one is the wrong trade. */
const REMOVE_TOKENS = ["remove", "delete", "drop", "lose", "scrap", "bin", "ditch", "take out", "get rid of", "kill"];

/** Moving, split by direction. `earlier` and `later` are here because the rail's arrows are up and
 *  down but a page is read top to bottom, and both descriptions of the same press are honest.
 *
 *  A direction word on its own is NOT a move, and that rule was bought with a real defect: "a form
 *  to sign up" contains " up ", so it was read as a move, found no form on the page to move, and
 *  refused a perfectly ordinary description of a form. A direction says which way, never that. */
const UP_TOKENS = ["up", "earlier", "sooner", "higher", "above"];
const DOWN_TOKENS = ["down", "later", "lower", "below"];
const MOVE_TOKENS = ["move", "shift", "reorder", "swap", "promote", "demote", "bump"];

/** Resizing, as an intent rather than as a width. The width itself is one of three words, found
 *  separately, because "make it wider" is a real sentence that this verb cannot answer. */
const SPAN_TOKENS = ["span", "width", "wide", "size", "resize"];

/** The nudges, and they are refused on purpose. `block.span` is a SET, for the reason check.set is:
 *  a verb that flips or nudges whatever is there lands somewhere different on a replay, so it can
 *  never honestly carry `idempotent: true`. A visitor who says "wider" gets told the three words. */
const NUDGE_TOKENS = ["wider", "widen", "narrower", "narrow", "bigger", "smaller", "shrink", "grow", "expand"];

/** Moving further than one place, refused for the same reason: the verb shifts a block ONE place,
 *  because that is the affordance the rail offers and an index is the number a small model drifts
 *  on. "To the top" is a loop, not a verb, and pretending otherwise would put a cap and a clamp
 *  inside something advertised as a single move. */
const FAR_MOVE_TOKENS = ["to the top", "to the bottom", "to the end", "to the start", "all the way", "to the front", "to the back"];

/** The blocks a target can be named by, and this list is derived from nothing on purpose: it is the
 *  words a person reading the RAIL would use, and the rail prints the component's own label. Kept
 *  beside the closed set it mirrors rather than inside block-set.ts, because block-set's tokens
 *  answer a different question — which block a description ASKS FOR — and one table serving both
 *  would quietly make every synonym for "gallery" a way to name a block that is not on the page. */
const TARGET_TOKENS: Array<{ component: string; label: string; tokens: string[] }> = [
  { component: "block-lede", label: "lede", tokens: ["lede", "intro", "introduction", "opening", "standfirst"] },
  { component: "block-card", label: "card", tokens: ["card", "tile"] },
  { component: "block-callout", label: "callout", tokens: ["callout", "aside", "note", "quote", "pull quote"] },
  { component: "block-stat", label: "stat tile", tokens: ["stat", "stat tile", "statistic", "kpi", "metric", "number", "counter"] },
  { component: "block-form", label: "form", tokens: ["form", "contact form", "signup", "sign up"] },
];

/** Ordinals as words, because a rail row is "the second one" long before it is "b2". `last` is here
 *  and `first` is not special: `first` is simply 1.
 *
 *  The plain number words are deliberately absent. "The second one" contains "one", so a table
 *  holding both would read that sentence as position 1 or position 2 depending on which key an
 *  object happened to iterate first, and a target that depends on key order is a bug waiting for a
 *  refactor. A digit is still reachable through the `block 2` form below. */
const ORDINALS: Record<string, number> = {
  first: 1, "1st": 1,
  second: 2, "2nd": 2,
  third: 3, "3rd": 3,
  fourth: 4, "4th": 4,
  fifth: 5, "5th": 5,
  sixth: 6, "6th": 6,
};

// ---------------------------------------------------------------------------------------------
// Reading the parts
// ---------------------------------------------------------------------------------------------

/** The width word, taken as the LAST of the three to appear.
 *
 *  That rule exists because `third` is both a width and an ordinal, and English puts the target
 *  before the width: "make the third card half" and "make the second one a third" both read
 *  correctly under it, and both would read wrong under the first-match rule. The position comes back
 *  with it so the target search can stay to the left of the width and never mistake one for the
 *  other. */
function readSpan(text: string): { span: Span; at: number } | null {
  let found: { span: Span; at: number } | null = null;
  for (const word of ["full", "half", "third"]) {
    const at = text.lastIndexOf(` ${word} `);
    if (at !== -1 && (!found || at > found.at) && isSpan(word)) found = { span: word, at };
  }
  return found;
}

/** Which way a move goes. `null` when the text asked to move something without saying where, which
 *  is a refusal rather than a default: guessing down because most moves are down is the kind of
 *  helpfulness that edits the wrong thing. */
function readDirection(text: string): MoveDirection | null {
  const up = hits(text, UP_TOKENS), down = hits(text, DOWN_TOKENS);
  if (up === down) return null;             // neither said, or both said, and both are a refusal
  return up ? "up" : "down";
}

/** The ordinal a target carries, as a 1-based position, or `"last"`. Searches only the part of the
 *  text left of `before`, which is how a width word never gets read as a position. */
function readOrdinal(text: string, before = text.length): number | "last" | null {
  // The trailing space is load-bearing rather than tidy: every token test here is padded on both
  // sides, and a slice that ends exactly where the width word starts would cut the last word's
  // right-hand space off. "Make the second card half" would then fail to see a card at all.
  const head = `${text.slice(0, before)} `;
  if (head.includes(" last ") || head.includes(" final ") || head.includes(" bottom ")) return "last";
  for (const [word, n] of Object.entries(ORDINALS)) if (head.includes(` ${word} `)) return n;
  const numbered = / block (\d+) /.exec(head) ?? / (\d+)(?:st|nd|rd|th) /.exec(head);
  return numbered ? Number(numbered[1]) : null;
}

/** Which KIND of block was named, if any. Returns the entry rather than the component so a refusal
 *  can use the label a person would recognize. */
function readKind(text: string, before = text.length): (typeof TARGET_TOKENS)[number] | null {
  // The trailing space is load-bearing rather than tidy: every token test here is padded on both
  // sides, and a slice that ends exactly where the width word starts would cut the last word's
  // right-hand space off. "Make the second card half" would then fail to see a card at all.
  const head = `${text.slice(0, before)} `;
  for (const entry of TARGET_TOKENS) if (hits(head, entry.tokens)) return entry;
  return null;
}

// ---------------------------------------------------------------------------------------------
// Resolving the target
// ---------------------------------------------------------------------------------------------

/** Does the sentence point at something that ALREADY EXISTS?
 *
 *  This is the one discriminator between an edit and a description, and it is grammar rather than
 *  vocabulary: you edit "the card" and you ask for "a card". Without it, every verb word is a trap
 *  waiting for an innocent description to step on it, and one already did: "a form to sign up" was
 *  read as a move because it contains a direction word.
 *
 *  A definite article, a demonstrative, an ordinal, "last", or a bare id off the rail. Anything
 *  else is a description of something to build, and descriptions go to the matcher untouched. */
const DEFINITE = [
  " the ", " it ", " it.", " that ", " this ", " its ",
  " first ", " 1st ", " second ", " 2nd ", " third ", " 3rd ", " fourth ", " 4th ",
  " fifth ", " 5th ", " sixth ", " 6th ", " last ", " final ", " bottom ",
];
const pointsAtSomethingHere = (text: string): boolean =>
  DEFINITE.some((d) => text.includes(d)) || / b\d+ /.test(text);

const nth = <T>(list: T[], where: number | "last"): T | undefined =>
  where === "last" ? list.at(-1) : list[where - 1];

/** Which block the text names, or the reason it names none of them.
 *
 *  Four ways in, and the order is deliberate. A literal id wins, because the rail prints ids and
 *  someone reading one is naming exactly one thing. A kind plus an ordinal is "the second card". A
 *  kind alone is "the form", which resolves only when there is one form. An ordinal alone is "the
 *  second one". Nothing at all resolves only on a page holding a single block, where "it" cannot be
 *  ambiguous. Everything else is a refusal that says what it counted. */
function resolveTarget(text: string, blocks: BlockRef[], before: number): { block: BlockRef } | { said: string } {
  const byId = / (b\d+) /.exec(`${text.slice(0, before)} `) ?? / (b\d+) /.exec(text);
  if (byId) {
    const found = blocks.find((b) => b.id === byId[1]);
    if (found) return { block: found };
    return { said: `There is no ${byId[1]} on this page. The rail lists what is here.` };
  }

  const kind = readKind(text, before);
  const ordinal = readOrdinal(text, before);

  if (kind) {
    const of = blocks.filter((b) => b.component === kind.component);
    if (of.length === 0) return { said: `There is no ${kind.label} on this page to work on.` };
    if (ordinal !== null) {
      const found = nth(of, ordinal);
      if (found) return { block: found };
      return { said: `There ${of.length === 1 ? "is one" : `are ${of.length}`} ${kind.label}${of.length === 1 ? "" : "s"} on this page, so there is no ${ordinal === "last" ? "last" : `number ${ordinal}`} one.` };
    }
    if (of.length === 1) return { block: of[0]! };
    return { said: `There are ${of.length} ${kind.label}s on this page. Say which one: the first, the second, or its id from the rail.` };
  }

  if (ordinal !== null) {
    const found = nth(blocks, ordinal);
    if (found) return { block: found };
    return { said: `This page holds ${blocks.length} block${blocks.length === 1 ? "" : "s"}, so there is no ${ordinal === "last" ? "last" : `number ${ordinal}`} one.` };
  }

  if (blocks.length === 1) return { block: blocks[0]! };
  return { said: "Which block? Name it by kind, by position, or by the id in the rail." };
}

// ---------------------------------------------------------------------------------------------
// readBlockCommand
// ---------------------------------------------------------------------------------------------

/** Read one prompt against the composition it was typed over.
 *
 *  `blocks` is the page as it stands, in order. An EMPTY page never yields a command, and that guard
 *  is doing more work than it looks like: "drop in a card" is a perfectly ordinary way to ask for a
 *  card, and on a page with nothing to drop it can only mean the add it sounds like. With blocks
 *  present the same words mean what they say. */
export function readBlockCommand(prompt: string, blocks: BlockRef[]): BlockRead {
  if (blocks.length === 0) return { kind: "none" };
  const text = padded(prompt);
  if (!text.trim()) return { kind: "none" };

  // An edit has to point at something already on the page. A description never does, so this is
  // what keeps the verb words from ambushing one. It comes FIRST because it is cheap and total: no
  // definite reference, no command, whatever words the sentence happens to contain.
  if (!pointsAtSomethingHere(text)) return { kind: "none" };

  const span = readSpan(text);
  const wantsRemove = hits(text, REMOVE_TOKENS);
  const wantsSpan = hits(text, SPAN_TOKENS) || span !== null;
  const wantsNudge = hits(text, NUDGE_TOKENS);
  const wantsMove = hits(text, MOVE_TOKENS);

  // Not an edit at all. The composer takes it and adds, which is what every prompt did before this
  // module existed and what most prompts still should do.
  if (!wantsRemove && !wantsMove && !wantsSpan && !wantsNudge) return { kind: "none" };

  // Two verbs in one sentence. Refused rather than ranked: "remove the card and move the form up"
  // is two operations, the door takes one Intent, and picking the first would silently do half of
  // what was asked.
  if (wantsRemove && (hits(text, MOVE_TOKENS) || span !== null)) {
    return { kind: "refusal", said: "That asks for more than one change. One at a time: drop a block, set its width, or move it." };
  }

  if (wantsNudge) {
    return { kind: "refusal", said: "A block is full, half or third wide, and those are the only three. Name the one you want rather than wider or smaller." };
  }

  const cut = span?.at ?? text.length;

  if (wantsRemove) {
    const target = resolveTarget(text, blocks, text.length);
    if ("said" in target) return { kind: "refusal", said: target.said };
    return {
      kind: "command",
      command: { action: "block.remove", surface: `block:${target.block.id}`, payload: {}, said: `Dropping ${target.block.id}.` },
    };
  }

  if (wantsSpan) {
    if (!span) {
      return { kind: "refusal", said: "Say which width: full, half or third." };
    }
    const target = resolveTarget(text, blocks, cut);
    if ("said" in target) return { kind: "refusal", said: target.said };
    return {
      kind: "command",
      command: {
        action: "block.span", surface: `block:${target.block.id}`, payload: { span: span.span },
        said: `Setting ${target.block.id} to ${span.span} width.`,
      },
    };
  }

  // Moving, and the far-move refusal comes before the direction read: "move it to the top" names a
  // direction perfectly well and still is not one press.
  if (hits(text, FAR_MOVE_TOKENS)) {
    return { kind: "refusal", said: "A block moves one place at a time. Say up or down, or press the arrow again." };
  }
  const direction = readDirection(text);
  if (!direction) {
    return { kind: "refusal", said: "Which way: up or down?" };
  }
  const target = resolveTarget(text, blocks, text.length);
  if ("said" in target) return { kind: "refusal", said: target.said };
  return {
    kind: "command",
    command: {
      action: "block.move", surface: `block:${target.block.id}`, payload: { direction },
      said: `Moving ${target.block.id} ${direction}.`,
    },
  };
}
