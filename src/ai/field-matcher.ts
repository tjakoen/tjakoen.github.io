// portfolio/ai/field-matcher.ts — the deterministic matcher behind the "describe a form in plain
// English" builder demo: turns a free-text description into a FieldSpec, a closed list of which
// fields and choices to render. Same design law as notes-tags.ts (matching a topic against the REAL
// tag set) and catalog.ts (matching a nav phrase against the REAL route list): code enumerates, the
// model never does. It matters more here than in either of those, because a field spec IS a list of
// slugs (name keys, type values, surfaces) by another name, and the grain plan's section 8 finding
// from the desk 0.5B retune is that a small model allowed to enumerate invents them. So every field
// and choice that can ever appear is declared once, below, in a CLOSED SET. The only thing a model
// may later touch is wording: applyWording, and nothing else in this file.
//
// Pure + framework-free: no DOM, no page, no model call. Unit-tests headless.

/** One rendered form field. Every key is always present, `null` where unset — this is a renderer
 *  contract (grain's field atom): an absent key logs a dev warning, an explicit `null` does not.
 *  `required` is the literal string "required" or `null`, never `true`/`""`, because a boolean HTML
 *  attribute can't bind from an empty string. */
export interface FieldItem {
  surface: string;
  label: string;
  name: string;
  type: string;
  placeholder: string | null;
  value: string | null;
  required: "required" | null;
}

/** One rendered choice group (a select or radio set). Same always-present-keys contract as FieldItem;
 *  `selected` is "selected" or `null` for the same boolean-attribute reason. */
export interface ChoiceItem {
  surface: string;
  label: string;
  name: string;
  options: Array<{ value: string; label: string; selected: "selected" | null }>;
}

export interface FieldSpec {
  fields: FieldItem[];
  choices: ChoiceItem[];
  unsupported: Array<{ token: string; reason: string }>;
}

// ---------------------------------------------------------------------------------------------
// Normalizing + phrase matching
// ---------------------------------------------------------------------------------------------
// notes-tags.ts's norm/fold/tokens idiom is the pattern this follows, but it doesn't export a
// reusable normalizer (its `tokens` helper also drops stopwords and is single-word only), and this
// matcher needs multi-word phrase tokens ("phone number", "get in touch") to match as a unit. So the
// normalizer below is written locally: lowercase, strip punctuation, collapse whitespace, then fold
// each word's trailing plural "s" the same way notes-tags does, and join back into a padded string
// so a phrase check is one `includes` call with word boundaries guaranteed by the padding.

const normalize = (s: string): string => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
const fold = (w: string): string => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);
const foldedWords = (s: string): string[] => normalize(s).split(" ").filter(Boolean).map(fold);

/** A normalized, folded, space-padded form of a string, for a safe substring-with-word-boundaries
 *  check: `padded(desc).includes(padded(token))` can't false-match "email" inside "emailing". */
const padded = (s: string): string => ` ${foldedWords(s).join(" ")} `;

/** A token list matches when the description contains ANY one of them as a phrase. */
const anyTokenHits = (desc: string, tokens: string[]): boolean => tokens.some((t) => desc.includes(padded(t)));

// ---------------------------------------------------------------------------------------------
// The closed set of known fields
// ---------------------------------------------------------------------------------------------

interface FieldEntry {
  name: string;
  type: string;
  label: string;
  placeholder: string | null;
  required: boolean;
  tokens: string[];
}

const surfaceFor = (name: string): string => `field:builder-${name}`;

// Declaration order here IS the output order (see matchSpec below) — never the order the words
// appeared in the description. That's a deliberate, honest limit: a description that asks for
// "phone, then name" still renders name first, because the form's own field order is a design
// decision this matcher owns, not something free text should drive.
//
// `required` is a judgment call, not something the description controls: name and email are the two
// fields a contact form can't function without, so they're required by default; everything else
// is optional. A future description-driven "required" toggle is out of scope here.
const FIELD_TABLE: FieldEntry[] = [
  {
    name: "name",
    type: "text",
    label: "Name",
    placeholder: "Your name",
    required: true,
    tokens: ["name", "full name", "your name"],
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "you@example.com",
    required: true,
    tokens: ["email", "email address", "e mail"],
  },
  {
    name: "phone",
    type: "tel",
    label: "Phone",
    placeholder: "Your phone number",
    required: false,
    tokens: ["phone", "phone number", "telephone", "mobile number", "mobile"],
  },
  {
    name: "company",
    type: "text",
    label: "Company",
    placeholder: "Where you work",
    required: false,
    tokens: ["company", "organization", "organisation", "employer", "business name"],
  },
  {
    name: "role",
    type: "text",
    label: "Role",
    placeholder: "Your job title",
    required: false,
    tokens: ["role", "job title", "title", "position"],
  },
  {
    name: "subject",
    type: "text",
    label: "Subject",
    placeholder: "What this is about",
    required: false,
    tokens: ["subject", "subject line", "message subject"],
  },
  {
    name: "website",
    type: "url",
    label: "Website",
    placeholder: "https://",
    required: false,
    tokens: ["website", "web site", "url", "portfolio link"],
  },
  {
    // Money stays vague per VOICE (no ratios, no false precision), so the label and placeholder
    // say plainly that a rough figure is fine, rather than pretending this is a strict range picker
    // it isn't (it's `type: "text"`, not a number/select). Honest about what the field actually is.
    name: "budget",
    type: "text",
    label: "Budget (roughly)",
    placeholder: "No need to be exact",
    required: false,
    tokens: ["budget", "price range", "how much they can spend", "how much to spend"],
  },
];

// ---------------------------------------------------------------------------------------------
// The closed set of known choices
// ---------------------------------------------------------------------------------------------

interface ChoiceOption {
  value: string;
  label: string;
  selected: boolean;
}

interface ChoiceEntry {
  name: string;
  label: string;
  tokens: string[];
  options: ChoiceOption[];
}

// Exactly one option per choice carries `selected: true` below — the closed-set default a form
// renders before anyone has touched it. Which one is a judgment call: "something else" for topic
// (the honest catch-all, not a guess at what a visitor wants), "email" for contact method (the
// field this form already asks for), "no rush" for timeline (never presume urgency on someone
// else's behalf).
const CHOICE_TABLE: ChoiceEntry[] = [
  {
    name: "topic",
    label: "Topic",
    tokens: [
      "topic",
      "which topic",
      "what they want to talk about",
      "want to talk about",
      "talk about",
      "reason for contacting",
      "reason for reaching out",
    ],
    options: [
      { value: "grain", label: "GRAIN", selected: false },
      { value: "batch", label: "BATCH", selected: false },
      { value: "hiring", label: "Hiring", selected: false },
      { value: "teaching", label: "Teaching", selected: false },
      { value: "other", label: "Something else", selected: true },
    ],
  },
  {
    name: "contact-method",
    label: "Preferred contact method",
    tokens: [
      "contact method",
      "how to contact them",
      "how to reach them",
      "preferred contact method",
      "contact preference",
      "email or phone",
    ],
    options: [
      { value: "email", label: "Email", selected: true },
      { value: "phone", label: "Phone", selected: false },
    ],
  },
  {
    name: "timeline",
    label: "Timeline",
    tokens: ["timeline", "time frame", "timeframe", "deadline", "when they need this", "how soon"],
    options: [
      { value: "asap", label: "ASAP", selected: false },
      { value: "this-month", label: "This month", selected: false },
      { value: "this-quarter", label: "This quarter", selected: false },
      { value: "no-rush", label: "No rush", selected: true },
    ],
  },
];

// ---------------------------------------------------------------------------------------------
// The closed set of things this stack recognizes but refuses to render
// ---------------------------------------------------------------------------------------------

interface UnsupportedEntry {
  token: string;
  reason: string;
  tokens: string[];
}

// A refusal, not a gap the matcher forgot to fill. A caller (the demo page) shows this list to stay
// honest about the limit rather than silently dropping the request.
const UNSUPPORTED_TABLE: UnsupportedEntry[] = [
  {
    token: "message",
    reason:
      "no textarea atom exists yet, and grain's .field frame has no textarea rule, so a long message would " +
      "have to render as a single-line text input that truncates whatever gets typed into it.",
    tokens: [
      "message box",
      "comments box",
      "comment box",
      "long message",
      "detailed message",
      "text area",
      "textarea",
      "additional comments",
      "tell us more",
      "big message",
      "space to write",
    ],
  },
  {
    token: "file upload",
    reason: "no file-input atom is built yet, and there is nowhere safe on this stack to store an uploaded file.",
    tokens: ["file upload", "upload a file", "attach a file", "attachment", "upload files", "file attachment"],
  },
];

// ---------------------------------------------------------------------------------------------
// The closed set's own names, for an honest decline
// ---------------------------------------------------------------------------------------------
// Additive export for the /builder demo's desk intent (desk-reasoner.ts's form-build handler): when
// a description matches nothing at all, the desk declines and names what it CAN build instead of a
// vague "I don't understand" — and the names it lists have to be these exact labels, not a second,
// hand-typed list that can drift from the table above.
export const KNOWN_FIELD_LABELS: string[] = FIELD_TABLE.map((e) => e.label);
export const KNOWN_CHOICE_LABELS: string[] = CHOICE_TABLE.map((e) => e.label);

// ---------------------------------------------------------------------------------------------
// matchSpec
// ---------------------------------------------------------------------------------------------

/** Turn a plain-English description into a FieldSpec: which fields and choices to render, and which
 *  recognized-but-unsupported asks got refused instead of faked. Matching a field's whole token list
 *  against the description means a field/choice is emitted AT MOST ONCE regardless of how many of
 *  its tokens hit or how many times the description repeats them — dedup falls out of the closed set
 *  having one entry per name, not a separate dedup pass. Output order is FIELD_TABLE / CHOICE_TABLE
 *  declaration order, not the order words appeared in the description (see the comment on
 *  FIELD_TABLE). No match at all returns empty arrays; this function never guesses a default form. */
export function matchSpec(description: string): FieldSpec {
  const desc = padded(description);

  const fields: FieldItem[] = [];
  for (const entry of FIELD_TABLE) {
    if (!anyTokenHits(desc, entry.tokens)) continue;
    fields.push({
      surface: surfaceFor(entry.name),
      label: entry.label,
      name: entry.name,
      type: entry.type,
      placeholder: entry.placeholder,
      value: null,
      required: entry.required ? "required" : null,
    });
  }

  const choices: ChoiceItem[] = [];
  for (const entry of CHOICE_TABLE) {
    if (!anyTokenHits(desc, entry.tokens)) continue;
    choices.push({
      surface: surfaceFor(entry.name),
      label: entry.label,
      name: entry.name,
      options: entry.options.map((o) => ({ value: o.value, label: o.label, selected: o.selected ? "selected" : null })),
    });
  }

  const unsupported: Array<{ token: string; reason: string }> = [];
  for (const entry of UNSUPPORTED_TABLE) {
    if (!anyTokenHits(desc, entry.tokens)) continue;
    unsupported.push({ token: entry.token, reason: entry.reason });
  }

  return { fields, choices, unsupported };
}

// ---------------------------------------------------------------------------------------------
// applyWording — the ONE seam the model may touch
// ---------------------------------------------------------------------------------------------

const MAX_LABEL = 60;
const MAX_PLACEHOLDER = 80;

/** Strip control characters and newlines, collapse whitespace, cap length, and drop the result
 *  entirely if cleaning leaves nothing — a blank or hostile model output degrades to the deterministic
 *  default rather than to an empty label. */
function sanitizeOverride(raw: string | undefined, maxLen: number): string | null {
  if (raw == null) return null;
  const cleaned = raw
    .replace(/[\r\n\t\x00-\x1F\x7F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen)
    .trim();
  return cleaned.length ? cleaned : null;
}

/** Apply model-composed wording on top of a matched FieldSpec. This is the only seam a model is
 *  allowed to touch: it may replace `label` and, for a field, `placeholder`. It can never add, remove,
 *  or reorder an item, and it can never change `surface`, `name`, `type`, `required`, or an option's
 *  `value`/`selected` — those stay exactly what matchSpec decided. An unknown key in `wording` (a name
 *  that matches nothing in the spec) is ignored silently. Returns a new FieldSpec; the input is never
 *  mutated. */
export function applyWording(
  spec: FieldSpec,
  wording: Record<string, { label?: string; placeholder?: string }>,
): FieldSpec {
  const fields = spec.fields.map((item) => {
    const w = wording[item.name];
    if (!w) return { ...item };
    const label = sanitizeOverride(w.label, MAX_LABEL);
    const placeholder = sanitizeOverride(w.placeholder, MAX_PLACEHOLDER);
    return {
      ...item,
      label: label ?? item.label,
      placeholder: placeholder ?? item.placeholder,
    };
  });

  const choices = spec.choices.map((item) => {
    const w = wording[item.name];
    if (!w) return { ...item, options: item.options.map((o) => ({ ...o })) };
    const label = sanitizeOverride(w.label, MAX_LABEL);
    return {
      ...item,
      label: label ?? item.label,
      options: item.options.map((o) => ({ ...o })),
    };
  });

  return { fields, choices, unsupported: spec.unsupported.map((u) => ({ ...u })) };
}
