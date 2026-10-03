// portfolio/ai/block-set.ts — the closed set of BLOCKS the page builder can compose, and the
// deterministic matcher over it. Same design law as field-matcher.ts, notes-tags.ts and catalog.ts:
// code enumerates, the model never does. It matters at least as much here as it does for a field
// spec, because a component name is a slug by another name and a small model allowed to enumerate
// invents them (the desk 0.5B retune's finding). So every block that can ever appear on a generated
// page is declared once, below.
//
// WHY THE BLOCKS ARE PORTFOLIO COMPONENTS RATHER THAN GRAIN ONES, measured 2026-08-14 rather than
// assumed: not one of grain's molecules or organisms ships an .html template. Only the atoms do (18
// of them). A molecule in grain is a documented CLASS CONVENTION a page author writes by hand, so
// `render("card", …)` has nothing to expand and never could. The builder needs a component it can
// name at runtime, so the portfolio owns a thin template per block that emits exactly the markup
// grain's own doc for that molecule documents. Consuming the stack, not forking it: those templates
// declare no class of their own, and if the block set proves out they are what would graduate up.
//
// Pure + framework-free: no DOM, no page, no model call, no renderer. Unit-tests headless.
import { matchSpec, type FieldSpec } from "./field-matcher.ts";

/** The layout vocabulary, and it is three words on purpose. A description can ask for two things
 *  side by side and the matcher answers `half`; it can never ask for a grid, a column count or a
 *  width. Layout is the thing the sandbox plan warned a matcher should not be guessing at, and a
 *  closed set of three is how that warning is answered rather than ignored. */
export type Span = "full" | "half" | "third";
export const SPANS: readonly Span[] = ["full", "half", "third"];
export const isSpan = (s: unknown): s is Span => typeof s === "string" && (SPANS as readonly string[]).includes(s);

/** Maximum number of blocks one prompt can add, whether the plan came from the model or the matcher. */
export const MAX_BLOCKS_PER_PROMPT = 8;

/** One block on a composed page. `component` is a registered component NAME the renderer expands at
 *  runtime; `data` is what that component's bindings read; `props` are the config attributes a
 *  hand-author would have put on the tag. `id` is stable per block so a later phase can reorder and
 *  delete without matching on content. */
export interface Block {
  id: string;
  component: string;
  span: Span;
  data: Record<string, unknown>;
  props: Record<string, string>;
}

/** A refused ask: what was recognized, and why it is not built. Never a silently dropped request —
 *  the honest half of the demo is the part that says out loud what it will not fake. */
export interface BlockRefusal { token: string; reason: string }

export interface Composition {
  blocks: Block[];
  refusals: BlockRefusal[];
}

/** Copy fields the model may draft for a new block. Component identity, layout, props, and every
 *  field not listed here remain owned by the code. */
const BLOCK_COPY_LIMITS: Record<string, Record<string, number>> = {
  lede: { body: 280 },
  card: { title: 60, body: 280 },
  callout: { body: 240 },
  stat: { value: 24, label: 60, sub: 120 },
};

/** Keep generated copy inside the visible text fields the matching component already exposes.
 *  Text is filled through `textContent` in the browser; stripping controls and limiting each field
 *  also prevents a model response from turning one short brief into a very large exported page. */
export function sanitizeBlockCopy(name: string, raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const limits = BLOCK_COPY_LIMITS[name];
  if (!limits) return {};
  const input = raw as Record<string, unknown>;
  const copy: Record<string, string> = {};
  for (const [field, maxLength] of Object.entries(limits)) {
    const value = input[field];
    if (typeof value !== "string") continue;
    const cleaned = [...value]
      .map((character) => character.charCodeAt(0) <= 0x1f || character.charCodeAt(0) === 0x7f ? " " : character)
      .join("")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength)
      .trim();
    if (cleaned) copy[field] = cleaned;
  }
  return copy;
}

// ---------------------------------------------------------------------------------------------
// Normalizing + phrase matching — the same idiom field-matcher.ts uses, imported in spirit rather
// than in code because that module's helpers are private to it and this one needs the same three.
// ---------------------------------------------------------------------------------------------

const normalize = (s: string): string => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const fold = (w: string): string => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);
const padded = (s: string): string => ` ${normalize(s).split(" ").filter(Boolean).map(fold).join(" ")} `;
const anyTokenHits = (desc: string, tokens: string[]): boolean => tokens.some((t) => desc.includes(padded(t)));

// ---------------------------------------------------------------------------------------------
// The closed set
// ---------------------------------------------------------------------------------------------

interface BlockEntry {
  /** The name a description matches, and the block's key in a spec. */
  name: string;
  /** The registered component the renderer expands. Always a real template — a test asserts it. */
  component: string;
  /** What the entry is called when the page names the set out loud. */
  label: string;
  /** The span a description gets when it does not ask for one. */
  defaultSpan: Span;
  tokens: string[];
  /** Deterministic sample content. See the note below on why the matcher supplies this at all. */
  sample: Record<string, unknown>;
  props?: Record<string, string>;
}

// Sample content is deterministic and remains the fallback when the model does not provide a safe
// value for one of the text fields registered below. Model copy is accepted only for those fields,
// after `sanitizeBlockCopy` strips controls and bounds its length. It cannot change a component name,
// field shape, span, or prop.
const BLOCK_TABLE: BlockEntry[] = [
  {
    name: "lede",
    component: "block-lede",
    label: "Lede",
    defaultSpan: "full",
    tokens: ["lede", "intro", "introduction", "opening paragraph", "opening line", "standfirst", "summary paragraph"],
    sample: { body: "A page composed from a closed set of components, where code picks the parts and nothing invents a name." },
  },
  {
    name: "card",
    component: "block-card",
    label: "Card",
    defaultSpan: "half",
    tokens: ["card", "tile", "feature", "feature box", "content card", "info card"],
    sample: { title: "No build step", body: "Nothing between source and server: no bundler, no transpiler, no watcher." },
    props: { pad: "sm" },
  },
  {
    name: "callout",
    component: "block-callout",
    label: "Callout",
    defaultSpan: "full",
    tokens: ["callout", "aside", "note box", "quote", "blockquote", "pull quote", "warning", "highlight"],
    sample: { body: "Nothing here submits anywhere. This is a static site, and the builder composes a page rather than serving one.", status: null },
  },
  {
    name: "stat",
    component: "block-stat",
    label: "Stat tile",
    defaultSpan: "third",
    tokens: ["stat", "statistic", "kpi", "metric", "number", "figure", "counter", "stat tile"],
    sample: { value: "18", label: "atoms", sub: "every one with a template the renderer expands" },
  },
];

/** Give repeated fallback cards distinct examples so a multi-card preview does not look duplicated.
 *  Model-written fields still replace these values when the visitor builds through the local model. */
const REPEATED_CARD_SAMPLES: Record<string, string>[] = [
  { title: "No build step", body: "Nothing between source and server: no bundler, no transpiler, no watcher." },
  { title: "A closed set", body: "The model chooses registered blocks; the code owns their fields and rendering." },
];

function sampleFor(name: string, occurrence: number, fallback: Record<string, unknown>): Record<string, unknown> {
  if (name !== "card") return { ...fallback };
  return { ...fallback, ...REPEATED_CARD_SAMPLES[occurrence % REPEATED_CARD_SAMPLES.length] };
}

// ---------------------------------------------------------------------------------------------
// The form block: today's field tables, as one entry in the set
// ---------------------------------------------------------------------------------------------
// The form is a block among blocks now rather than the subject of the page, and this is the whole of
// what that reframing costs. field-matcher.ts is untouched and still owns which fields, choices,
// message boxes and tick boxes a description asks for; this only decides WHETHER a description asked
// for a form at all, and hands the spec through as the block's data. Nothing about the form demo
// stops working, including the desk operating what it generated.
/** The form's own block component. Named here rather than inline so BLOCK_COMPONENTS can carry it
 *  and the has-a-real-template test covers it like every other block. */
export const FORM_COMPONENT = "block-form";

const FORM_TOKENS = [
  "form", "contact form", "signup", "sign up", "signup form", "get in touch", "enquiry", "inquiry",
  "registration", "register", "survey", "questionnaire", "feedback form", "application form",
];

/** Did the description ask for a form, and what did the field matcher make of it? Returns null when
 *  no form was asked for, so a caller can tell "no form" from "a form with nothing in it". */
export function matchFormBlock(description: string): FieldSpec | null {
  const desc = padded(description);
  const spec = matchSpec(description);
  const asked = anyTokenHits(desc, FORM_TOKENS);
  const matchedControls = spec.fields.length + spec.messages.length + spec.choices.length + spec.checks.length > 0;
  // A bare "a form" with no controls named still asked for a form; a description that names fields
  // without saying "form" asked for one too. Neither is a guess: both are the description's own words.
  return asked || matchedControls ? spec : null;
}

// ---------------------------------------------------------------------------------------------
// The closed set of things this builder recognizes and refuses
// ---------------------------------------------------------------------------------------------
// Two different reasons live here and the difference is worth keeping. "Page furniture" is a refusal
// on principle: a shell, a rail or a top bar is the frame a page sits IN, and a description asking
// for one has misunderstood what is being built rather than asked for something missing. "Not yet"
// is a gap with a date on it: the component exists and is documented, and the block set has not
// grown a template for it. A refusal that cannot say which of the two it is teaches nobody anything.
const REFUSAL_TABLE: Array<{ token: string; reason: string; tokens: string[] }> = [
  {
    token: "app shell",
    reason: "a shell, a side rail and a top bar are the frame a page sits in rather than content it can hold, so a composed page is placed INTO one rather than asking for its own.",
    tokens: ["app shell", "shell", "side rail", "sidebar", "top bar", "topbar", "nav bar", "navbar", "activity bar", "status bar"],
  },
  {
    token: "table",
    reason: "the table and data-table molecules are documented and have no block template yet, so a table would have to be faked from cards.",
    tokens: ["table", "data table", "spreadsheet", "rows and column", "grid of data"],
  },
  {
    token: "image",
    reason: "figure, gallery and media-card all need a real image to point at, and a generated page has none: an invented src is a broken picture with a confident name.",
    tokens: ["image", "picture", "photo", "gallery", "figure", "screenshot", "carousel", "media card", "video"],
  },
  {
    token: "timeline",
    reason: "the timeline, note, chat-log and presentation organisms are on the v1 list and have no block template yet.",
    tokens: ["timeline", "chat log", "conversation", "notepad", "presentation", "slide", "deck", "activity feed"],
  },
];

// ---------------------------------------------------------------------------------------------
// The set's own names, for an honest decline
// ---------------------------------------------------------------------------------------------
export const KNOWN_BLOCK_LABELS: string[] = BLOCK_TABLE.map((e) => e.label);
/** Every component the block set can name. A test asserts each one resolves to a real template, so
 *  the set can never advertise a block the renderer would fail to expand. */
export const BLOCK_COMPONENTS: string[] = [...BLOCK_TABLE.map((e) => e.component), FORM_COMPONENT];

/** The names a model may answer with, which is the same closed set spelled the way a sentence spells
 *  it. Derived from the table rather than written out a second time, so a block added above becomes
 *  something the model can ask for in the same commit that makes it buildable. block-composer.ts
 *  prints these into the prompt and checks every answer against them. */
export const BLOCK_NAMES: string[] = [...BLOCK_TABLE.map((e) => e.name), "form"];

/** What a pre-rendered template library needs to know about each block: the component to render,
 *  the data keys it binds (read off the sample, which is the same set), and the props it is used
 *  with. Exported as data rather than as a second hand-written list so a block added to the table
 *  above joins the library the moment it exists — the same rule BLOCK_COMPONENTS follows.
 *  canvas-dom.ts turns this into the placeholder each library entry renders with. */
export const BLOCK_TEMPLATE_SPECS: Array<{ component: string; keys: string[]; props: Record<string, string> }> =
  BLOCK_TABLE.map((e) => ({ component: e.component, keys: Object.keys(e.sample), props: { ...e.props } }));

// ---------------------------------------------------------------------------------------------
// matchBlocks
// ---------------------------------------------------------------------------------------------

/** How a description asks for blocks beside each other. A phrase attached to cards applies to those
 *  cards; a general layout phrase applies to every block the same description produced. */
const SIDE_BY_SIDE = ["side by side", "beside each other", "next to each other", "two column", "in a row", "across"];
const THREE_UP = ["three column", "three up", "three across", "in three"];
const CARD_SCOPED_LAYOUT = ["card side by side", "card beside each other", "card next to each other", "card in a row"];

const COUNTS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
};

function countFor(desc: string, tokens: readonly string[]): number {
  const words = desc.trim().split(" ");
  for (const token of tokens) {
    const phrase = padded(token).trim().split(" ");
    for (let index = 0; index <= words.length - phrase.length; index++) {
      if (words.slice(index, index + phrase.length).join(" ") !== phrase.join(" ")) continue;
      const preceding = words[index - 1] ?? "";
      const parsed = Number(preceding);
      if (Number.isInteger(parsed) && parsed > 0) return parsed;
      if (COUNTS[preceding]) return COUNTS[preceding]!;
    }
  }
  return 1;
}

/** Turn a description into blocks. Declaration order in BLOCK_TABLE is the output order, never the
 *  order words appeared. An explicit count directly before a block name repeats that block, while
 *  other mentions still produce one. The total is capped to the same per-prompt limit as model plans.
 *  `startIndex` seeds block ids so a later add can continue a composition rather than collide with
 *  it, and the ids stay stable and unique across repeated calls. */
export function matchBlocks(description: string, startIndex = 0): Composition {
  const desc = padded(description);
  const scopedToCards = anyTokenHits(desc, CARD_SCOPED_LAYOUT);
  const cardSpan: Span | null = scopedToCards ? "half" : null;
  const forced: Span | null = scopedToCards ? null : anyTokenHits(desc, THREE_UP) ? "third"
    : anyTokenHits(desc, SIDE_BY_SIDE) ? "half"
    : null;

  const blocks: Block[] = [];
  for (const entry of BLOCK_TABLE) {
    if (!anyTokenHits(desc, entry.tokens)) continue;
    const count = Math.min(countFor(desc, entry.tokens), MAX_BLOCKS_PER_PROMPT - blocks.length);
    for (let repeat = 0; repeat < count; repeat++) {
      blocks.push({
        id: `b${startIndex + blocks.length + 1}`,
        component: entry.component,
        span: entry.name === "card" ? cardSpan ?? forced ?? entry.defaultSpan : forced ?? entry.defaultSpan,
        data: sampleFor(entry.name, repeat, entry.sample),
        props: { ...entry.props },
      });
    }
  }

  const form = matchFormBlock(description);
  if (form && blocks.length < MAX_BLOCKS_PER_PROMPT) {
    blocks.push({
      id: `b${startIndex + blocks.length + 1}`,
      component: FORM_COMPONENT,
      span: forced ?? "full",
      data: form as unknown as Record<string, unknown>,
      props: {},
    });
  }

  return { blocks, refusals: refusalsFor(description) };
}

/** What a description refuses, whichever path composed it.
 *
 *  Split out of `matchBlocks` so the model path gets the same honest "can't build" list. A refusal is
 *  a fact about the SENTENCE rather than about the composition: a page that asked for a gallery
 *  asked for one whether the blocks were chosen by a word list or by a model, and a model that
 *  quietly omits the gallery from its plan has not declined it out loud. Reading the description
 *  here rather than trusting the plan is what keeps that promise on both paths. */
export function refusalsFor(description: string): BlockRefusal[] {
  const desc = padded(description);
  const refusals = REFUSAL_TABLE.filter((entry) => anyTokenHits(desc, entry.tokens))
    .map((entry) => ({ token: entry.token, reason: entry.reason }));
  const requested = BLOCK_TABLE.reduce((count, entry) =>
    count + (anyTokenHits(desc, entry.tokens) ? countFor(desc, entry.tokens) : 0), 0)
    + (matchFormBlock(description) ? 1 : 0);
  if (requested > MAX_BLOCKS_PER_PROMPT) {
    refusals.push({
      token: `${requested} blocks`,
      reason: `One prompt can add up to ${MAX_BLOCKS_PER_PROMPT} blocks. The remaining requested blocks were left out.`,
    });
  }
  return refusals;
}

/** Build a composition from names a model chose, in the order it chose them.
 *
 *  ORDER IS THE MODEL'S HERE, and that is a deliberate departure from `matchBlocks`, which returns
 *  BLOCK_TABLE's declaration order and says in its own comment that page order is a decision the
 *  table owns. The reason that rule existed is that the word list never knew where a word appeared:
 *  it scans for tokens and has no reading of the sentence, so a fixed order was the only defensible
 *  one available. A model does know, and taking its order is the difference between a page that
 *  matched a sentence and a page that read one. The table's order still governs the word-list path,
 *  untouched.
 *
 *  A NAME IS NOT A GUARANTEE OF A BLOCK. The form is the case: it is the one entry whose content
 *  comes from the description rather than from a sample, so a plan naming `form` over a sentence with
 *  no fields and no form words in it produces nothing. That is code enumerating, exactly as intended.
 *  The model can ask for a form; only `matchFormBlock` can say what is in it. */
export function composeFromNames(
  names: readonly string[],
  description: string,
  startIndex = 0,
  planSpan: Span | null = null,
  copies: readonly Record<string, string>[] = [],
): Composition {
  const desc = padded(description);
  const scopedToCards = anyTokenHits(desc, CARD_SCOPED_LAYOUT);
  const cardSpan: Span | null = scopedToCards ? "half" : null;
  // The description's own layout word outranks the model's. A phrase attached to cards scopes its
  // layout to those cards; a general layout phrase applies across the page. Neither form lets a
  // model's span override something the person wrote down plainly.
  const forced: Span | null = scopedToCards ? null : anyTokenHits(desc, THREE_UP) ? "third"
    : anyTokenHits(desc, SIDE_BY_SIDE) ? "half"
    : planSpan;

  const blocks: Block[] = [];
  const occurrences = new Map<string, number>();
  for (const [index, name] of names.entries()) {
    if (name === "form") {
      const form = matchFormBlock(description);
      if (!form) continue;
      blocks.push({
        id: `b${startIndex + blocks.length + 1}`,
        component: FORM_COMPONENT,
        span: forced ?? "full",
        data: form as unknown as Record<string, unknown>,
        props: {},
      });
      continue;
    }
    const entry = BLOCK_TABLE.find((e) => e.name === name);
    if (!entry) continue;
    const occurrence = occurrences.get(name) ?? 0;
    occurrences.set(name, occurrence + 1);
    blocks.push({
      id: `b${startIndex + blocks.length + 1}`,
      component: entry.component,
      span: name === "card" ? cardSpan ?? forced ?? entry.defaultSpan : forced ?? entry.defaultSpan,
      data: { ...sampleFor(name, occurrence, entry.sample), ...sanitizeBlockCopy(name, copies[index]) },
      props: { ...entry.props },
    });
  }

  return { blocks, refusals: refusalsFor(description) };
}
