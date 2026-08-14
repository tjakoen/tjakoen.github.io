// portfolio/ai/builder-page.ts — the /builder route's own pure seam: turn a raw `?ask=` query
// param into everything the page renders, so the query-param handling (trim, the empty state, the
// JSON the page prints, which CSS state a section's visibility keys off) unit-tests headless and
// server.ts stays a thin wire-the-request-in, hand-the-file-out. matchSpec (field-matcher.ts) still
// decides every field/choice/refusal; this only shapes ITS result into view data.
import { matchSpec, type FieldItem, type ChoiceItem, type MessageItem } from "./field-matcher.ts";

export interface BuilderView {
  /** The trimmed ask, echoed back on the page as "the prompt that produced this" — "" when none. */
  ask: string;
  /** "result" once there's an ask to show, "empty" otherwise — the ONE flag builder.html's CSS
   *  keys the whole page's empty-vs-result layout off (`[data-builder-state="…"]`). */
  builderState: "empty" | "result";
  fields: FieldItem[];
  choices: ChoiceItem[];
  messages: MessageItem[];
  unsupported: Array<{ token: string; reason: string }>;
  /** Present (truthy marker string) only when there's at least one field, message box or choice to
   *  render —
   *  field-matcher.ts's own "a literal marker string or null, never boolean text" convention, so a
   *  `data-bind-` attribute can toggle CSS visibility by the attribute's mere presence. */
  hasFields: "hasfields" | null;
  hasUnsupported: "hasunsupported" | null;
  /** A real ask that matched literally nothing — not even a refusal — so the page can say so plainly
   *  instead of silently rendering three empty sections. */
  matchedNothing: "matchednothing" | null;
  /** Pretty-printed JSON of exactly what matchSpec returned — "" in the empty state (nothing ran). */
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
  label: "Describe a form",
  name: "ask",
  placeholder: "A contact form with a name, an email, and what they want to talk about",
  value: ask || null,
  required: null,
  hint: null,
  error: null,
}];

/** Build the /builder page's whole view from a raw `ask` query param. Safe to call with the
 *  untrimmed `URLSearchParams` value directly — this does its own trim, so server.ts never has to
 *  agree with a second copy of that rule. An empty (or whitespace-only) ask never calls matchSpec:
 *  matchSpec("") already returns empty everything, but skipping the call keeps "nothing was asked"
 *  and "something was asked and matched nothing" honestly distinct in the returned view. */
export function buildBuilderView(rawAsk: string): BuilderView {
  const ask = rawAsk.trim();
  if (!ask) {
    return {
      ask: "", builderState: "empty", fields: [], choices: [], messages: [], unsupported: [],
      hasFields: null, hasUnsupported: null, matchedNothing: null, specJson: "",
      composer: composerFor(""),
    };
  }
  const spec = matchSpec(ask);
  const hasFields = spec.fields.length > 0 || spec.messages.length > 0 || spec.choices.length > 0;
  return {
    ask,
    builderState: "result",
    fields: spec.fields,
    choices: spec.choices,
    messages: spec.messages,
    unsupported: spec.unsupported,
    hasFields: hasFields ? "hasfields" : null,
    hasUnsupported: spec.unsupported.length > 0 ? "hasunsupported" : null,
    matchedNothing: !hasFields && spec.unsupported.length === 0 ? "matchednothing" : null,
    specJson: JSON.stringify(spec, null, 2),
    composer: composerFor(ask),
  };
}
