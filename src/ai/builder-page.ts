// portfolio/ai/builder-page.ts — the /builder route's own pure seam: turn a raw `?ask=` query
// param into everything the page renders, so the query-param handling (trim, the empty state, the
// JSON the page prints, which CSS state a section's visibility keys off) unit-tests headless and
// server.ts stays a thin wire-the-request-in, hand-the-file-out.
//
// What changed on 2026-08-14, and it is the whole of the reframing: this used to shape ONE form's
// field spec into view data. It now shapes a COMPOSITION, which is an ordered list of blocks from
// the closed set in block-set.ts, and a form is one of those blocks. matchSpec (field-matcher.ts)
// is untouched and still decides every field, choice, message box and tick box; it is simply asked
// through the form block now rather than being the subject of the page.
import { matchSpec, type MessageItem } from "./field-matcher.ts";
import { FORM_COMPONENT, type Block, type BlockRefusal } from "./block-set.ts";
import { addFromDescription, emptyComposition, toDocument } from "./composition.ts";

export interface BuilderView {
  /** The trimmed ask, echoed back on the page as "the prompt that produced this" — "" when none. */
  ask: string;
  /** "result" once there's an ask to show, "empty" otherwise — the ONE flag builder.html's CSS
   *  keys the whole page's empty-vs-result layout off (`[data-builder-state="…"]`). */
  builderState: "empty" | "result";
  /** The composition, in order. server.ts renders these through the one renderer; the page template
   *  never names a component, because naming components is what the closed set is for. */
  blocks: Block[];
  unsupported: BlockRefusal[];
  /** Present (truthy marker string) only when there is something to show —
   *  field-matcher.ts's own "a literal marker string or null, never boolean text" convention, so a
   *  `data-bind-` attribute can toggle CSS visibility by the attribute's mere presence. */
  hasBlocks: "hasblocks" | null;
  /** Whether one of those blocks is a form. The page carries prose about what a generated form can
   *  and cannot do, and that prose has no business showing on a page with no form on it. */
  hasForm: "hasform" | null;
  hasUnsupported: "hasunsupported" | null;
  /** A real ask that matched literally nothing — not even a refusal — so the page can say so plainly
   *  instead of silently rendering three empty sections. */
  matchedNothing: "matchednothing" | null;
  /** Pretty-printed JSON of the composition document: exactly what an export writes and an import
   *  reads back, so the pane shows the artifact rather than a description of one. A form block's
   *  data is matchSpec's own result, so the field spec is still visible in here, one level in. */
  specJson: string;
  /** The composer, as a one-item spec so the page can render it through the SAME b-memo the
   *  generated message boxes use. It is one item rather than a bare string for two reasons that both
   *  bite: a textarea has no value attribute, so the current ask has to arrive as CONTENT through
   *  `data-field`, which is exactly what b-memo already does; and the box carries a real
   *  `field:` surface, so the desk can draft a prompt into it through the one door instead of the
   *  page growing a second way in. The value is the current ask, so the composer comes up holding
   *  what produced the page and a visitor edits rather than retypes. */
  composer: MessageItem[];
}

/** The composer's spec, built around whatever ask is in play. `name` is `ask` because the whole
 *  round trip is a plain GET form posting back to /builder: submitting produces `/builder?ask=…`,
 *  which is the same shareable, reproducible address the example links carry, and it needs no
 *  JavaScript to work. */
const composerFor = (ask: string): MessageItem[] => [{
  surface: "field:builder-ask",
  label: "Describe a page",
  name: "ask",
  placeholder: "An intro, two cards side by side, and a contact form with a name and an email",
  value: ask || null,
  required: null,
  hint: null,
  error: null,
}];

/** Every refusal the ask earned, block-level and field-level, as one list.
 *
 *  Two tables can refuse the same description and they refuse different things: block-set.ts says a
 *  side rail is furniture rather than content, field-matcher.ts says an upload has nowhere to
 *  upload to. Both are the same kind of answer to a visitor, so they land in one list rather than
 *  two sections. matchSpec runs even when the ask produced no form, because "a card and a file
 *  upload" has still been told no about the upload and dropping that silently is the failure this
 *  whole demo argues against. Deduped by token, so an ask that both tables recognize says it once. */
function refusalsFor(ask: string, blockRefusals: BlockRefusal[]): BlockRefusal[] {
  const out: BlockRefusal[] = [];
  const seen = new Set<string>();
  for (const r of [...blockRefusals, ...matchSpec(ask).unsupported]) {
    if (seen.has(r.token)) continue;
    seen.add(r.token);
    out.push(r);
  }
  return out;
}

/** Build the /builder page's whole view from a raw `ask` query param. Safe to call with the
 *  untrimmed `URLSearchParams` value directly — this does its own trim, so server.ts never has to
 *  agree with a second copy of that rule. An empty (or whitespace-only) ask never runs the matcher:
 *  it would return empty everything anyway, and skipping the call keeps "nothing was asked" and
 *  "something was asked and matched nothing" honestly distinct in the returned view. */
export function buildBuilderView(rawAsk: string): BuilderView {
  const ask = rawAsk.trim();
  if (!ask) {
    return {
      ask: "", builderState: "empty", blocks: [], unsupported: [],
      hasBlocks: null, hasForm: null, hasUnsupported: null, matchedNothing: null,
      specJson: "", composer: composerFor(""),
    };
  }
  const comp = addFromDescription(emptyComposition(), ask);
  const unsupported = refusalsFor(ask, comp.refusals);
  const hasBlocks = comp.blocks.length > 0;
  return {
    ask,
    builderState: "result",
    blocks: comp.blocks,
    unsupported,
    hasBlocks: hasBlocks ? "hasblocks" : null,
    hasForm: comp.blocks.some((b) => b.component === FORM_COMPONENT) ? "hasform" : null,
    hasUnsupported: unsupported.length > 0 ? "hasunsupported" : null,
    matchedNothing: !hasBlocks && unsupported.length === 0 ? "matchednothing" : null,
    specJson: JSON.stringify(toDocument(comp), null, 2),
    composer: composerFor(ask),
  };
}
