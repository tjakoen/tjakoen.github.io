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

// Sample content is DETERMINISTIC and it is the honest answer to "what does a block say when the
// description did not say". The alternative is the model composing it, and on a 0.5B that is exactly
// where invention starts: a generated page whose prose the model wrote is a text generator wearing a
// composition generator's clothes. Wording is a seam that already exists (field-matcher's
// applyWording) and it can reach these later; until it does, what lands on the page is code's.
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

// ---------------------------------------------------------------------------------------------
// matchBlocks
// ---------------------------------------------------------------------------------------------

/** How a description asks for two things beside each other. Matching a layout phrase sets the span
 *  of everything the same description produced, because a description says how the PAGE should read
 *  rather than how one block should: per-block spans are a direct-edit affordance, not something
 *  free text should be inferring one block at a time. */
const SIDE_BY_SIDE = ["side by side", "beside each other", "next to each other", "two column", "in a row", "across"];
const THREE_UP = ["three column", "three up", "three across", "in three"];

/** Turn a description into blocks. Declaration order in BLOCK_TABLE is the output order, never the
 *  order words appeared: a page's own block order is a design decision this table owns, the same
 *  rule field-matcher.ts states for fields. A block is emitted at most once however many of its
 *  tokens hit, because dedup falls out of one entry per name rather than a separate pass.
 *  `startIndex` seeds block ids so a later add can continue a composition rather than collide with
 *  it — the ids stay stable and unique across repeated calls. */
export function matchBlocks(description: string, startIndex = 0): Composition {
  const desc = padded(description);
  const forced: Span | null = anyTokenHits(desc, THREE_UP) ? "third"
    : anyTokenHits(desc, SIDE_BY_SIDE) ? "half"
    : null;

  const blocks: Block[] = [];
  for (const entry of BLOCK_TABLE) {
    if (!anyTokenHits(desc, entry.tokens)) continue;
    blocks.push({
      id: `b${startIndex + blocks.length + 1}`,
      component: entry.component,
      span: forced ?? entry.defaultSpan,
      data: { ...entry.sample },
      props: { ...entry.props },
    });
  }

  const form = matchFormBlock(description);
  if (form) {
    blocks.push({
      id: `b${startIndex + blocks.length + 1}`,
      component: FORM_COMPONENT,
      span: forced ?? "full",
      data: form as unknown as Record<string, unknown>,
      props: {},
    });
  }

  const refusals: BlockRefusal[] = [];
  for (const entry of REFUSAL_TABLE) {
    if (!anyTokenHits(desc, entry.tokens)) continue;
    refusals.push({ token: entry.token, reason: entry.reason });
  }

  return { blocks, refusals };
}
