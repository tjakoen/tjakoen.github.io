// portfolio/ai/canvas-dom.ts — the canvas cell contract, the pre-rendered template library, and
// the browser-side fill. This is the module that lets /builder work on a static host.
//
// THE PROBLEM, and it is worth stating because the answer looks like over-engineering otherwise:
// the published /builder has never done anything. The demo is a GET round trip the SERVER
// interprets, and this site exports to static hosting, so dist/builder/index.html is one file
// frozen at the empty state and no ?ask= variant exists for Pages to serve. Every example link and
// every desk-driven build lands on an empty page. It works in dev and only in dev.
//
// THE ANSWER, and the rule it keeps: there is no second renderer. The page ships every block in the
// set PRE-RENDERED ONCE by the real server-side renderer, hidden, as a template library. Adding a
// block clones that node and fills it by reading the same `data-field` and `data-bind-*` attributes
// the template already carries. What lives here is a FILLER, not a renderer: it expands no tag, it
// discovers no component, it resolves no props, and it knows exactly five repeats because a closed
// set has exactly five. Everything structural was decided by the one engine before the browser saw
// it.
//
// Client-safe (ARCHITECTURE §19): no node:, no bun, no npm. Shipped to the browser, so treat its
// whole source as public.
import { BLOCK_TEMPLATE_SPECS, FORM_COMPONENT } from "./block-set.ts";

/** The grid cell that wraps one block. The grid itself is `.canvas`, styled in builder.css. */
export const CELL_CLASS = "canvas__cell";
/** The layout vocabulary, on the cell rather than on the block: a block stays layout-free and its
 *  parent places it, which is what grain's own stat-tile doc asks for and what lets the same block
 *  sit at any span without a second variant of it. */
export const SPAN_ATTR = "data-span";
/** The block's stable id, so a later reorder or delete can find the cell without matching content. */
export const BLOCK_ID_ATTR = "data-block-id";
/** The canvas surface, the one address the composed page hangs off. Not a registered surface KIND,
 *  so it is push-only and no verb targets it, the same footing as builder-form and builder-spec. */
export const CANVAS_SURFACE = "builder-canvas";
/** Each library entry is wrapped in a node carrying this attribute, so a clone is one lookup. */
export const TEMPLATE_ATTR = "data-block-template";
/** The library's own container. Hidden by builder.css, and hidden by `display: none` specifically,
 *  because that is the one property that takes it out of sight, out of layout and out of the
 *  accessibility tree at once. */
export const LIBRARY_CLASS = "builder-library";
/** How a template parks an address until it is cloned.
 *
 *  A library entry is markup that is not on the page yet, and a `data-surface` on it would be a
 *  second element answering to an address that is supposed to name one thing. The manifest would
 *  see it, a tour's lamp could light a node nobody can see, and both failures are the quiet kind.
 *  So the library renames every address on its way in and the browser renames it back on the way
 *  out, which keeps the rule generic: no block has to know it carries an address. */
export const TEMPLATE_SURFACE_ATTR = "data-template-surface";
export const SURFACE_ATTR = "data-surface";

// ---------------------------------------------------------------------------------------------
// What goes in the library
// ---------------------------------------------------------------------------------------------
// Every entry is rendered with a PLACEHOLDER: every key the template binds, present and null. Two
// reasons, and both are load-bearing. A missing key warns in dev (the renderer's `missing: warn`),
// so a placeholder that forgot one is a visible failure rather than a quiet blank. And a null value
// renders empty rather than sample text, so a fill that silently did nothing shows as an empty
// block instead of showing last month's sample content wearing this month's prompt.
//
// The atoms carry the props block-form.html puts on their tags. That is the one piece of drift risk
// in the design: the library renders `<b-memo size="sm" rows="6">` here and block-form.html writes
// the same attributes there, and a rows count changed in one place would make a cloned message box
// a different shape from a server-rendered one. A test reads block-form.html and compares.

export interface LibraryEntry {
  /** The registered component name, and the key a clone is looked up by. */
  name: string;
  /** Every key the template binds, present and null (or empty, for a list a nested each reads). */
  placeholder: Record<string, unknown>;
  /** The config props the component is used with, exactly as its usage site writes them. */
  props: Record<string, string>;
}

const nulls = (keys: string[]): Record<string, unknown> =>
  Object.fromEntries(keys.map((k) => [k, null]));

/** Every block in the set, ready to pre-render. The four content blocks come straight off the block
 *  table, so a new block joins the library without anyone remembering to add it here. The form is
 *  the one entry written by hand, because its placeholder is four EMPTY LISTS rather than four
 *  nulls: the library ships the empty form shell and the browser appends control clones into it. */
export const BLOCK_LIBRARY: LibraryEntry[] = [
  ...BLOCK_TEMPLATE_SPECS.map((s) => ({ name: s.component, placeholder: nulls(s.keys), props: s.props })),
  { name: FORM_COMPONENT, placeholder: { fields: [], messages: [], choices: [], checks: [] }, props: {} },
];

/** The four control atoms a form block nests, plus the option a choice nests. Per-item data keys
 *  come from each atom's own doc in grain; the props come from block-form.html's tags. */
export const ATOM_LIBRARY: LibraryEntry[] = [
  {
    name: "b-field",
    placeholder: { label: null, name: null, type: null, placeholder: null, value: null, required: null, surface: null, hint: null, error: null },
    props: { size: "sm" },
  },
  {
    name: "b-memo",
    placeholder: { label: null, name: null, placeholder: null, value: null, required: null, surface: null, hint: null, error: null },
    props: { size: "sm", rows: "6" },
  },
  {
    name: "b-choice",
    placeholder: { label: null, name: null, options: [], surface: null, hint: null, error: null },
    props: { size: "sm" },
  },
  {
    name: "b-check",
    placeholder: { label: null, name: null, type: null, value: null, checked: null, required: null, surface: null, hint: null, error: null },
    props: { size: "sm" },
  },
  {
    // Nested one level further in, inside a choice's select. No props: an option is styled by the
    // platform and grain's own doc says so.
    name: "b-option",
    placeholder: { value: null, label: null, selected: null },
    props: {},
  },
];

/** One repeat: clone `template` once per item in `list`, and put the clones in `into` (a selector
 *  inside the parent) or in the parent itself.
 *
 *  This is the whole of what the filler knows about structure, and the list is short because the
 *  block set is closed. A form nests four kinds of control in the order block-form.html declares
 *  them, and a choice nests its options. Nothing else in the set repeats anything. */
export interface RepeatRule { list: string; template: string; into: string | null }

export const REPEATS: Record<string, RepeatRule[]> = {
  [FORM_COMPONENT]: [
    { list: "fields", template: "b-field", into: null },
    { list: "messages", template: "b-memo", into: null },
    { list: "choices", template: "b-choice", into: null },
    { list: "checks", template: "b-check", into: null },
  ],
  "b-choice": [{ list: "options", template: "b-option", into: "select" }],
};

// ---------------------------------------------------------------------------------------------
// The fill: PASS 1 of the renderer, read in the browser over markup the renderer produced
// ---------------------------------------------------------------------------------------------
// Deliberately the same three rules batch/render/render.ts applies, including the ones that look
// like details: own-property-only path resolution (so no data key can reach __proto__), an empty
// value dropping the attribute rather than setting it to "", and the URL-scheme guard. The last is
// belt and braces here, because every value on this page comes from a closed table, but a guard
// that only exists on the server is one someone eventually routes around.

interface Resolved { found: boolean; value: unknown }

export function resolvePath(obj: unknown, path: string): Resolved {
  if (path === "" || path === ".") return { found: true, value: obj };
  let cur: unknown = obj;
  for (const key of path.split(".")) {
    if (cur == null || !Object.hasOwn(Object(cur), key)) return { found: false, value: undefined };
    cur = (cur as Record<string, unknown>)[key];
  }
  return { found: true, value: cur };
}

export function format(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

const URL_ATTRS = new Set(["href", "src", "action", "formaction", "poster", "background", "ping"]);
const SAFE_URL = /^(?:https?:|mailto:|tel:|\/|\.\/|\.\.\/|#|\?)/i;
export function safeAttr(attr: string, value: string): string {
  if (!URL_ATTRS.has(attr.toLowerCase())) return value;
  const trimmed = value.trim();
  return trimmed === "" || SAFE_URL.test(trimmed) ? value : "";
}

/** Apply one element's own directives. Returns nothing and mutates, because that is what filling a
 *  cloned node is. Text goes through textContent, which escapes: a description's words can never
 *  become markup, on the server or here. */
export function fillOne(el: Element, data: unknown): void {
  const field = el.getAttribute("data-field");
  if (field !== null) el.textContent = format(resolvePath(data, field).value);
  // A copy, and it is load-bearing: `el.attributes` is a LIVE NamedNodeMap, this loop removes
  // attributes as it goes, and removing during a live iteration skips the next entry. A binding
  // whose value is empty would silently leave the one after it unfilled.
  for (const { name, value } of Array.from(el.attributes)) {
    if (!name.startsWith("data-bind-")) continue;
    const attr = name.slice("data-bind-".length);
    const v = safeAttr(attr, format(resolvePath(data, value).value));
    if (v === "") el.removeAttribute(attr);
    else el.setAttribute(attr, v);
  }
}

/** Fill an element and everything under it, stopping at any subtree that matches `skip`.
 *
 *  The skip is not an optimization. The page's own chrome carries bindings over the VIEW (the
 *  builder state, the flags, the prompt, the spec), and the blocks on the canvas carry bindings
 *  over their own BLOCK DATA. Walking one with the other's data would clear every label on the
 *  page to empty string, and it would do it quietly. */
/** Give a freshly cloned node its addresses back. The inverse of what renderLibrary did on the way
 *  in, and generic on purpose: a block that grows a literal address later needs no change here. */
export function restoreSurfaces(root: Element): void {
  for (const el of [root, ...root.querySelectorAll(`[${TEMPLATE_SURFACE_ATTR}]`)]) {
    const parked = el.getAttribute(TEMPLATE_SURFACE_ATTR);
    if (parked === null) continue;
    el.removeAttribute(TEMPLATE_SURFACE_ATTR);
    el.setAttribute(SURFACE_ATTR, parked);
  }
}

export function fillTree(root: Element, data: unknown, skip?: string): void {
  if (skip && root.matches(skip)) return;
  fillOne(root, data);
  // No copy needed here, unlike the attribute loop above: filling changes attributes and text, and
  // never the shape of the tree, so the live collection cannot shift under the walk.
  for (const child of root.children) fillTree(child, data, skip);
}
