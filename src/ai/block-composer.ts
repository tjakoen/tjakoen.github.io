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

import { BLOCK_NAMES, isSpan, MAX_BLOCKS_PER_PROMPT, sanitizeBlockCopy, type Span } from "./block-set.ts";

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
export const COMPLETION_TIMEOUT_MS = 45_000;

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
