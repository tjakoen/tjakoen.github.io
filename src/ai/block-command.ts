// portfolio/ai/block-command.ts — the ROUTER. Is this prompt describing a page, or editing the one
// that is already here?
//
// WHAT THIS USED TO BE, because the history is the lesson. This file shipped on 2026-08-14 as a
// deterministic chooser: a word list that turned "drop the second card" into `block.remove` on an id
// without a model in sight. It worked, and the owner's read was that a page whose whole argument is
// building with AI should not be reaching its decisions without one. The choosing moved to
// block-reasoner.ts, where the 0.5B reads grain's live manifest and grain validates what comes back.
// What stayed here is the one question the model cannot be asked, because asking it needs the model.
//
// WHY THE ROUTING CANNOT GO TO THE MODEL. A description has to compose on a machine that cannot run
// a model at all: that path is the page's whole no-JavaScript, no-WebGPU, static-host story, and it
// predates the desk by months. If every prompt waited on a completion to find out whether it was an
// edit, then building a page would stop working wherever editing does. So the router runs first, it
// runs on nothing, and only what it routes to an edit ever reaches the model.
//
// AND WHY IT IS GRAMMAR RATHER THAN VOCABULARY. The first version asked "does this contain a verb
// word", and a real prompt broke it the day it shipped: "a form to sign up" contains " up ", so it
// was read as a move, went looking for a form to move, found none, and refused to build the form it
// was being asked for. A word list can only ever grow another hole. You edit "the card" and you ask
// for "a card", so the question is which one the sentence said.
//
// Pure + framework-free: no DOM, no page, no door, no model call. Unit-tests headless.

/** Which way a block moves, and there are two. Mirrors `MoveDirection` in grain's ai/contract.ts
 *  rather than importing it, for the reason ai-dispatch.js re-states the same closed sets: this
 *  module ships to the browser through the portfolio's own module path and its imports stay
 *  relative. The drift is guarded by a test that asserts the two words, the same way grain guards
 *  its dispatcher's copies. */
export type MoveDirection = "up" | "down";
export const MOVE_DIRECTIONS: readonly MoveDirection[] = ["up", "down"];

const normalize = (s: string): string => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

/** Standing on its own, each of these can only mean something already here. A page you are asking
 *  for has no "it" yet. */
const PRONOUNS = [" it ", " that ", " this ", " them ", " those "];

/** A definite article, a demonstrative, an ordinal, or a name for the end of a list. On its own each
 *  one means nothing: "the fold" is not a block. It has to be pointing AT something. */
const DEFINITE = [
  " the ", " that ", " this ", " its ",
  " first ", " 1st ", " second ", " 2nd ", " third ", " 3rd ", " fourth ", " 4th ",
  " fifth ", " 5th ", " sixth ", " 6th ", " last ", " final ",
];

/** What a person calls a block that is already on the page. The five kinds by the names the rail
 *  prints, plus the two generic ones, because "the second one" and "the last block" are how people
 *  talk about a list they are looking at.
 *
 *  This is a vocabulary and the file's own header argues against vocabularies, so it is worth being
 *  exact about the difference. The words that were dangerous were VERBS: they claimed to know what
 *  you wanted done, and every one of them was also an ordinary English word a description uses. A
 *  noun after "the" claims only that you are pointing at something, and being wrong about that costs
 *  a question to the model rather than the wrong edit. */
const BLOCK_NOUNS = [
  "block", "blocks", "one", "ones",
  "lede", "intro", "introduction", "opening", "standfirst",
  "card", "cards", "tile", "tiles",
  "callout", "callouts", "aside", "note", "quote",
  "stat", "stats", "statistic", "kpi", "metric", "counter",
  "form", "forms", "signup",
];

const firstIndexOf = (text: string, needles: readonly string[]): number =>
  needles.reduce((best, n) => {
    const at = text.indexOf(n);
    return at !== -1 && (best === -1 || at < best) ? at : best;
  }, -1);

/** Does this prompt point at something already on the page?
 *
 *  An EMPTY page is never an edit whatever the words say, and that guard is doing more work than it
 *  looks like: "drop in a card" is an ordinary way to ask for a card, and where there is nothing to
 *  drop it can only mean the add it sounds like.
 *
 *  Three ways to be pointing. A bare id, because the rail prints them and nothing else looks like
 *  one. A pronoun, because a page that does not exist has no "it". Or a definite marker with a block
 *  noun AFTER it, and the order is the whole rule: "the second card" points at a card, while "a card
 *  above the fold" carries both words and points at nothing, because the card comes first and what
 *  follows "the" is a fold.
 *
 *  Both mistakes cost something real, which is why this is stricter than it first was. A false NO
 *  sends an edit to the matcher, which adds rather than edits. A false YES sends a description to
 *  the model, which answers that no verb applies, and the description is never built at all. */
export function looksLikeAnEdit(prompt: string, blockCount: number): boolean {
  if (blockCount === 0) return false;
  const text = ` ${normalize(prompt)} `;
  if (!text.trim()) return false;
  if (/ b\d+ /.test(text)) return true;
  if (PRONOUNS.some((p) => text.includes(p))) return true;
  const pointer = firstIndexOf(text, DEFINITE);
  if (pointer === -1) return false;
  const noun = firstIndexOf(text.slice(pointer), BLOCK_NOUNS.map((n) => ` ${n} `));
  return noun !== -1;
}
