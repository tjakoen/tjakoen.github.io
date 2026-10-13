// ---------------------------------------------------------------------------------------------
// block-composer.ts — the model on the BUILD path
// ---------------------------------------------------------------------------------------------
// What this is for, and it is the one thing /builder could not previously claim. Until now the page
// composed by word list: `matchBlocks` scans a description for tokens it knows and emits one block
// per name that hit. That path is fast, it is honest about its refusals, and it works on a machine
// with no model at all, which is why it stays. What it cannot do is READ a sentence. It cannot count
// ("two cards" gave one card, every time), it cannot order ("a callout, then the intro" came back in
// the table's order), and it cannot tell a mention from a request.
//
// So the division of labour here is the same one block-reasoner.ts already states for editing, and
// it is the whole rule: THE MODEL UNDERSTANDS, THE CODE ENUMERATES. The model reads the sentence and
// answers with an ordered list of names and optional copy for the visible text fields the code
// allows. Every name is checked against the closed set before anything is built, and anything
// unrecognised is dropped rather than guessed at. Copy fields are stripped of control characters and
// bounded before they can replace a block's example text.
//
// WHY THE WORD LIST IS STILL HERE, which reads like the fallback the edit path explicitly refuses.
// It is not the same call. On the edit path a fallback would let the page claim an AI edit no AI
// made, so there is none. On the build path the word list is the FLOOR rather than a stand-in: a
// shared /builder?ask= link has to compose on a phone with no WebGPU, and a page that answered a
// link with "the desk cannot run here" would be a link that only works on the author's laptop. The
// page says which one composed it, every time, so the two are never confused for each other.

import {
  BLOCK_NAMES, blockCopyLimit, isSpan, matchBlocks, MAX_BLOCKS_PER_PROMPT, sanitizeBlockCopy, type Span,
} from "./block-set.ts";

/** How many blocks one sentence may produce. A repetition loop is the 0.5B's documented failure
 *  shape on this page (an answer of `{"move": {"move": {"move": …` ran to the token cap on
 *  2026-08-22), and a plan is exactly the place that turns into four hundred cards. The cap is not a
 *  judgement about how big a page should be, it is a bound on what a broken answer can cost. */
export const MAX_PLANNED_BLOCKS = MAX_BLOCKS_PER_PROMPT;

/** The local model's output is constrained to the same closed vocabulary that the reader validates.
 *  The renderer remains code-owned: the schema only narrows the completion shape and copy fields. */
export const BUILD_PLAN_SCHEMA = {
  type: "object",
  properties: {
    blocks: {
      type: "array",
      minItems: 1,
      maxItems: MAX_PLANNED_BLOCKS,
      items: {
        type: "object",
        properties: {
          name: { type: "string", enum: BLOCK_NAMES },
          copy: {
            type: "object",
            properties: {
              title: { type: "string", maxLength: 60 },
              body: { type: "string", maxLength: 360 },
              value: { type: "string", maxLength: 30 },
              label: { type: "string", maxLength: 60 },
              sub: { type: "string", maxLength: 80 },
            },
            additionalProperties: false,
          },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
    span: { enum: ["full", "half", "third", null] },
  },
  required: ["blocks"],
  additionalProperties: false,
} as const;

export type PlanRead =
  /** Names, in the model's own order, every one of them in the closed set. `dropped` carries what
   *  was thrown away so the console can say what the model asked for and did not get. */
  | { kind: "plan"; names: string[]; span: Span | null; dropped: string[]; copies: Record<string, string>[] }
  /** Nothing usable came back. The caller composes by word list and says so. */
  | { kind: "unusable"; because: string };

const COPY_GLUE = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "for", "from", "has",
  "have", "he", "her", "his", "i", "if", "in", "into", "is", "it", "its", "of", "on", "or",
  "our", "she", "that", "the", "their", "them", "then", "there", "these", "they", "this",
  "those", "to", "was", "we", "were", "which", "who", "with", "you", "your", "about",
]);
const NEGATION = new Set([
  "not", "never", "no", "without", "cannot", "can't", "dont", "don't", "isn't", "aren't",
  "wasn't", "weren't", "doesn't", "didn't", "won't", "wouldn't", "shouldn't",
]);

const DRAFT_VERBS = new Set([
  "add", "avoid", "build", "can", "could", "create", "design", "do", "give", "help", "make",
  "never", "please", "show", "use", "write",
]);
const ANCHOR = /(?<![\p{L}\p{N}_])[\p{Lu}][\p{L}\p{M}'’-]*(?:\s+[\p{Lu}][\p{L}\p{M}'’-]*)*/gu;
const QUOTED = /[“"]([^”"]+)[”"]/gu;
const REQUESTED_WORDING = /\bwith the (?:exact )?(?:words?|phrase)\s+([^.!?]+?)(?=[.!?]|$)/giu;
const INTRO_DESCRIPTION = /\b(?:intro(?:duction)?|lede)\b[^.!?]*?\b(?:says?\s+it\s+is|describing\s+it\s+as|describes?\s+it\s+as|for|about)\s+([^,;.!?]+?)(?=,\s*(?:and\s+)?then\b|[;.!?]|$)/giu;
const NUMBER = /\b\d[\d,.]*(?:%|\b)/gu;

/** A fact inside a nearby negative clause must not be repeated without its negation. */
function followsNegation(brief: string, index: number): boolean {
  const before = brief.slice(0, index);
  const clause = before.split(/[,;.!?]|\b(?:but|however|instead)\b/iu).at(-1) ?? before;
  const context = clause.replace(/\bnot only\b|\b(?:don't|do not) forget\b/giu, "");
  return /\b(?:not|never|no|without|cannot|can't|don't|dont|isn't|aren't|wasn't|weren't|doesn't|didn't|won't|wouldn't)\b/iu.test(context);
}

/** Detect a small, reviewable set of exact details that a draft should preserve.
 *
 * This catches capitalized names, quoted phrases, wording assigned to an intro or introduced with
 * "with the words/phrase", and numeric values. It is a reminder for human review, not entity
 * recognition or proof that the remaining brief was covered.
 */
export function briefAnchors(brief: string): string[] {
  const found: Array<{ value: string; index: number }> = [];
  for (const match of brief.matchAll(ANCHOR)) {
    const value = match[0].trim().replace(/^[’'“"]+|[.,;:!?’'”"]+$/gu, "");
    const first = value.split(/\s+/)[0]?.toLowerCase();
    if (DRAFT_VERBS.has(first ?? "") || value.length < 2) continue;
    found.push({ value, index: match.index ?? 0 });
  }
  for (const pattern of [QUOTED, REQUESTED_WORDING, INTRO_DESCRIPTION, NUMBER]) {
    for (const match of brief.matchAll(pattern)) {
      const value = (match[1] ?? match[0]).trim();
      const start = match.index ?? 0;
      found.push({ value, index: start + (match[1] ? match[0].indexOf(match[1]) : 0) });
    }
  }
  found.sort((a, b) => a.index - b.index);
  const seen = new Set<string>();
  return found.flatMap(({ value, index }) => {
    if (followsNegation(brief, index)) return [];
    const key = value.toLocaleLowerCase().replaceAll("’", "'").replace(/\s+/g, " ");
    if (seen.has(key)) return [];
    seen.add(key);
    return [value];
  });
}

/** Return detected names, quotes, or numeric values not present verbatim in the reviewed copy. */
export function briefAnchorsMissingFromDraft(brief: string, copy: string): string[] {
  const tokens = (value: string): string[] => (value.match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) ?? [])
    .map((term) => term.toLocaleLowerCase().replaceAll("’", "'"));
  const copyTokens = tokens(copy);
  return briefAnchors(brief).filter((anchor) => {
    const expected = tokens(anchor);
    return !copyTokens.some((_, index) => expected.every((term, offset) => copyTokens[index + offset] === term));
  });
}

function requestedWordingTargets(brief: string): Array<{ phrase: string; block: string | null }> {
  const aliases: Record<string, string> = {
    intro: "lede", introduction: "lede", lede: "lede", card: "card", callout: "callout",
  };
  const namedPhraseTargets = [...brief.matchAll(REQUESTED_WORDING)].map((match) => {
    const phrase = (match[1] ?? "").trim();
    const before = brief.slice(0, match.index ?? 0);
    const boundary = Math.max(before.lastIndexOf("."), before.lastIndexOf("!"), before.lastIndexOf("?"), before.lastIndexOf(";"));
    const context = before.slice(boundary + 1);
    const mentions = [...context.matchAll(/\b(intro(?:duction)?|lede|card|callout)\b/giu)];
    const marker = mentions.at(-1)?.[1]?.toLocaleLowerCase();
    return { phrase, block: marker ? aliases[marker] ?? null : null };
  }).filter((entry) => entry.phrase.length > 0);
  const introTargets = [...brief.matchAll(INTRO_DESCRIPTION)].map((match) => ({
    phrase: (match[1] ?? "").trim(),
    block: "lede",
  })).filter((entry) => entry.phrase.length > 0);
  return [...namedPhraseTargets, ...introTargets];
}

/** List meaningful generated words that do not appear in the brief. This is a review aid, not a
 *  grounding test: matching words cannot prove that a sentence uses them truthfully. */
export function termsOutsideBrief(brief: string, copy: string): string[] {
  const terms = (text: string): string[] => text.match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) ?? [];
  const supplied = new Set(terms(brief).map((term) => term.toLowerCase().replaceAll("’", "'")));
  const seen = new Set<string>();
  return terms(copy).filter((term) => {
    const folded = term.toLowerCase().replaceAll("’", "'");
    if (COPY_GLUE.has(folded) || supplied.has(folded) || seen.has(folded)) return false;
    seen.add(folded);
    return true;
  });
}

export interface GroundedBlockCopy {
  copy: Record<string, string>;
  /** Fields whose model wording was shortened or removed because no brief phrase supported it. */
  changedFields: string[];
}

/** Keep only a verbatim phrase the visitor supplied. The model can still choose blocks and order,
 *  but generated prose is not treated as evidence merely because some of its words overlap the
 *  brief. Longer text fields need two meaningful source words; short labels may use one exact
 *  source word. The returned phrase is sliced from the brief itself, preserving its wording. */
export function groundBlockCopy(
  brief: string,
  name: string,
  raw: unknown,
): GroundedBlockCopy {
  const proposed = sanitizeBlockCopy(name, raw);
  const contentWords = (value: string): number =>
    (value.match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) ?? [])
      .filter((word) => !COPY_GLUE.has(word.toLocaleLowerCase().replaceAll("’", "'"))).length;
  const tokens = (value: string): Array<{ value: string; start: number; end: number }> =>
    [...value.matchAll(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu)].map((match) => ({
      value: match[0].toLocaleLowerCase().replaceAll("’", "'"),
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    }));
  const source = tokens(brief);
  const copy: Record<string, string> = {};
  const changedFields: string[] = [];
  for (const [field, value] of Object.entries(proposed)) {
    const candidate = tokens(value);
    const minimum = field === "body" || field === "sub" ? 2 : 1;
    let best: { start: number; end: number; words: number } | undefined;
    for (let left = 0; left < source.length; left++) {
      for (let right = 0; right < candidate.length; right++) {
        let length = 0;
        while (
          left + length < source.length && right + length < candidate.length
          && source[left + length]!.value === candidate[right + length]!.value
        ) length++;
        if (!length) continue;
        let first = left;
        let last = left + length - 1;
        while (first < last && COPY_GLUE.has(source[first]!.value)) first++;
        while (last > first && COPY_GLUE.has(source[last]!.value)) last--;
        if (source.slice(Math.max(0, first - 2), first).some((token) => NEGATION.has(token.value))) continue;
        const text = brief.slice(source[first]!.start, source[last]!.end);
        if (contentWords(text) < minimum) continue;
        if (!best || length > best.words) {
          best = { start: source[first]!.start, end: source[last]!.end, words: length };
        }
      }
    }
    const grounded = best ? brief.slice(best.start, best.end).slice(0, blockCopyLimit(name, field) ?? 0).trim() : "";
    if (grounded) copy[field] = grounded;
    if (grounded !== value) changedFields.push(field);
  }
  return { copy, changedFields };
}

export interface ReconciledBuildPlan {
  names: string[];
  copies: GroundedBlockCopy[];
  droppedBlocks: number;
}

/** Keep the model's order where it agrees with explicitly requested block types and counts. Remove
 *  surplus block requests, restore explicitly requested blocks the model omitted, and ground every
 *  text field in source wording. When detected names or numbers are missing, keep them as source
 *  phrases in the first usable text field so a layout omission cannot silently lose them. */
export function reconcileBuildPlan(
  brief: string,
  names: readonly string[],
  copies: readonly Record<string, string>[],
): ReconciledBuildPlan {
  const componentNames: Record<string, string> = {
    "block-lede": "lede",
    "block-card": "card",
    "block-callout": "callout",
    "block-stat": "stat",
    "block-form": "form",
  };
  const explicit = matchBlocks(brief).blocks.map((block) => componentNames[block.component]).filter(Boolean);
  const remaining = new Map<string, number>();
  for (const name of explicit) remaining.set(name, (remaining.get(name) ?? 0) + 1);
  const keptNames: string[] = [];
  const keptCopies: Record<string, string>[] = [];
  let droppedBlocks = 0;
  for (const [index, name] of names.entries()) {
    if (explicit.length > 0) {
      const count = remaining.get(name) ?? 0;
      if (!count) {
        droppedBlocks++;
        continue;
      }
      remaining.set(name, count - 1);
    }
    keptNames.push(name);
    keptCopies.push(copies[index] ?? {});
  }
  if (explicit.length > 0) {
    for (const name of explicit) {
      const count = remaining.get(name) ?? 0;
      if (!count) continue;
      keptNames.push(name);
      keptCopies.push({});
      remaining.set(name, count - 1);
    }
  }

  const grounded = keptNames.map((name, index) => groundBlockCopy(brief, name, keptCopies[index]));
  for (const { phrase, block } of requestedWordingTargets(brief)) {
    if (!block) continue;
    const target = grounded.findIndex((result, index) => keptNames[index] === block
      && blockCopyLimit(block, "body") !== null);
    if (target < 0) continue;
    const copy = grounded[target]!.copy;
    const prior = copy.body ?? "";
    const foldedPhrase = phrase.toLocaleLowerCase();
    if (prior.toLocaleLowerCase().includes(foldedPhrase)) continue;
    copy.body = phrase;
    if (!grounded[target]!.changedFields.includes("body")) grounded[target]!.changedFields.push("body");
  }
  const missing = briefAnchorsMissingFromDraft(
    brief,
    grounded.flatMap((result) => Object.values(result.copy)).join(" "),
  );
  if (missing.length) {
    const target = grounded.findIndex((result, index) =>
      ["lede", "card", "callout"].includes(keptNames[index] ?? "")
      && blockCopyLimit(keptNames[index] ?? "", "body") !== null);
    if (target >= 0) {
      const name = keptNames[target] ?? "";
      const limit = blockCopyLimit(name, "body") ?? 0;
      const copy = grounded[target]!.copy;
      const prior = copy.body ?? "";
      let anchors = "";
      for (const anchor of missing) {
        const next = anchors ? anchors + " · " + anchor : anchor;
        const joined = prior ? next + " · " + prior : next;
        if (joined.length > limit) continue;
        anchors = next;
      }
      if (anchors) {
        copy.body = prior ? anchors + " · " + prior : anchors;
        if (!grounded[target]!.changedFields.includes("body")) grounded[target]!.changedFields.push("body");
      }
    }
  }
  return { names: keptNames, copies: grounded, droppedBlocks };
}

// ---------------------------------------------------------------------------------------------
// The prompt
// ---------------------------------------------------------------------------------------------

/** The sentence, with the closed set attached to it.
 *
 *  NAMED LITERALLY, and that is a measured preference rather than a style. block-reasoner.ts records
 *  what happened when the edit prompt printed addresses the model could not copy back: it collapsed.
 *  A 0.5B copies a short bare token well and reproduces almost nothing else, so the five names go in
 *  as five bare words and the answer is asked for in the same alphabet it was handed.
 *
 *  REPEATS ARE SPELLED OUT because counting is the single capability this path buys. If the model is
 *  not told that a name may appear twice it returns a set, which is what the word list already gave
 *  and would make the whole detour pointless.
 *
 *  There is no reply-without-acting escape here, and that is the difference from `blockMessage`. A
 *  message typed into an empty builder is a request for a page. There is no page yet to answer
 *  questions about, and the router upstream has already decided this sentence is not an edit. */
export function composeMessage(ask: string, names: readonly string[] = BLOCK_NAMES): string {
  return [
    ask.trim(),
    "",
    "(Answer as JSON with a blocks array. Each entry is an object with a name and optional copy, like {\"blocks\":[{\"name\":\"lede\",\"copy\":{\"body\":\"A concise introduction.\"}},{\"name\":\"card\",\"copy\":{\"title\":\"A title\",\"body\":\"A concise description.\"}}]}.)",
    `The only block names are: ${names.join(", ")}. Use no other name.`,
    "Repeat an object to ask for more than one block of the same name, and write different copy for each one when the brief gives you enough detail.",
    "Use only copy fields that belong to that block: lede.body; card.title and card.body; callout.body; stat.value, stat.label and stat.sub. Forms are composed by the code and do not take copy here.",
    "Write brief, plain text without HTML. Use only facts, names, dates and numbers stated in the visitor's sentence. Do not invent claims, testimonials, guarantees or statistics. Omit a copy field when the sentence does not support it; the code will keep its example text.",
    "Put blocks in the order the sentence asks for. Add \"span\": \"full\", \"half\" or \"third\" only if the sentence says how wide they sit.)",
  ].join("\n");
}

// ---------------------------------------------------------------------------------------------
// Reading what came back
// ---------------------------------------------------------------------------------------------

/** The first balanced JSON object in a string.
 *
 *  A small model wraps its answer in prose, in a fenced code block, or in both, and it frequently
 *  emits a second object after the first. Scanning for balance rather than reaching for the last
 *  brace means a truncated repetition loop, which never closes, fails to parse here instead of
 *  parsing as something surprising further downstream. */
function firstObject(raw: string): string | null {
  const start = raw.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) return raw.slice(start, i + 1); }
  }
  return null;
}

/** The set membership test, folded so casing and stray spacing never decide a block's fate. */
const canonical = (value: unknown, names: readonly string[]): string | null => {
  if (typeof value !== "string") return null;
  const folded = value.trim().toLowerCase();
  return names.find((n) => n === folded) ?? null;
};

/** Turn a raw completion into a plan, or say why it is not one.
 *
 *  NOTHING THE MODEL SAYS IS TRUSTED, which is the same posture `readModelMove` takes a file over.
 *  Every name is checked against the closed set and an unrecognised one is DROPPED rather than
 *  corrected: the nearest legal name to an invented one is a guess about intent, and this page's
 *  whole argument is that code does not guess. Dropping is also what makes the failure visible, since
 *  a plan that lost half its names still reports them.
 *
 *  An answer that survives with no names left is unusable rather than an empty page. The model
 *  answering with nothing legal and the sentence genuinely asking for nothing are different events,
 *  and only the second one should compose an empty canvas. */
export function readModelPlan(raw: string, names: readonly string[] = BLOCK_NAMES): PlanRead {
  const text = firstObject(raw);
  if (text === null) return { kind: "unusable", because: "no JSON object in the answer" };

  let parsed: unknown;
  try { parsed = JSON.parse(text); }
  catch { return { kind: "unusable", because: "the answer's JSON object did not parse" }; }
  if (typeof parsed !== "object" || parsed === null) {
    return { kind: "unusable", because: "the answer parsed to something that is not an object" };
  }

  const record = parsed as Record<string, unknown>;
  // A single name where a list was asked for is the one shape worth accepting rather than refusing:
  // it is unambiguous, and it costs a person a whole round trip to be told off for it.
  const listed = Array.isArray(record.blocks) ? record.blocks
    : typeof record.blocks === "string" ? [record.blocks]
    : null;
  if (listed === null) return { kind: "unusable", because: "the answer carried no blocks list" };

  const kept: string[] = [];
  const dropped: string[] = [];
  const copies: Record<string, string>[] = [];
  for (const item of listed) {
    if (kept.length >= MAX_PLANNED_BLOCKS) break;
    const block = item && typeof item === "object" && !Array.isArray(item)
      ? item as Record<string, unknown>
      : null;
    const rawName = block ? block.name : item;
    const name = canonical(rawName, names);
    if (name === null) dropped.push(typeof item === "string" ? item : JSON.stringify(item));
    else {
      kept.push(name);
      copies.push(sanitizeBlockCopy(name, block?.copy));
    }
  }
  if (kept.length === 0) {
    return { kind: "unusable", because: `no name in the answer is in the set: ${dropped.join(", ") || "the list was empty"}` };
  }

  return { kind: "plan", names: kept, span: isSpan(record.span) ? record.span : null, dropped, copies };
}

// ---------------------------------------------------------------------------------------------
// The bound on one answer
// ---------------------------------------------------------------------------------------------

/** How long one completion may take before the page stops waiting for it.
 *
 *  Generous rather than tight, because a cold engine on a modest GPU genuinely takes tens of seconds
 *  for a first answer and a bound that cut those off would be a bug wearing a fix's clothes. What it
 *  exists to stop is the unbounded case. */
export const COMPLETION_TIMEOUT_MS = 75_000;

/** A completion, or null if it did not arrive in time.
 *
 *  WHY THIS IS HERE, and it is a defect closed rather than a precaution taken. Measured on
 *  2026-08-22 against the live 0.5B: asked to drop the second card, the model answered
 *  `{"move": {"move": {"move": …` and ran to the token cap without ever closing the object. The page
 *  sat on "Reading the page…" for as long as anyone was willing to watch, with no error, no refusal
 *  and nothing to click. One answer in five looked like that.
 *
 *  A TIMEOUT IS NOT A CANCELLATION and this does not pretend otherwise: the completion carries on
 *  underneath, holding the GPU until it hits its own cap. What this buys is that the PAGE stops
 *  lying about what it is doing. Cancelling the work properly belongs to whoever owns the engine
 *  seam, which is desk-reasoner.ts, and is a larger change than the hang deserves. */
export function completeWithin(
  desk: { complete(prompt: string, schema?: Record<string, unknown>): Promise<string | null> },
  prompt: string,
  ms: number = COMPLETION_TIMEOUT_MS,
  schema?: Record<string, unknown>,
): Promise<string | null> {
  // A race rather than one promise with a guard flag. Two independent promises make "whichever
  // arrives first" the structure rather than something a settled flag has to enforce, and a reader
  // checking that a late answer cannot overwrite an early timeout has nothing left to check.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  const answer = desk.complete(prompt, schema).catch((err: unknown) => {
    console.error("[builder] the desk threw", err);
    return null;
  });
  return Promise.race([answer, timeout]).finally(() => clearTimeout(timer));
}
