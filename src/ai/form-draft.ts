// portfolio/ai/form-draft.ts — the /builder demo's D1 fill: turn matchSpec's own matched TEXT
// fields into the demo values the desk prefills once it lands on /builder. Same family as
// contact-draft.ts (PURE + deterministic — CLIENT-SAFE §19.2): the "compose" step is code, not a
// live model call, because the closed field-name set (field-matcher.ts's FIELD_TABLE) already IS
// the model-proof boundary this whole demo exists to show off. A canned, honest sample value per
// name is the same discipline contact-draft.ts applies to a whole message — reproducible, never
// invented per-request, so the same ask always drafts the same fill.
//
// Only ever called against `spec.fields` (matchSpec's TEXT-input array) — never `spec.choices` (its
// <select> array). Two verified hazards make that a hard rule, not a style preference: grain's fill
// dispatcher guards a `field.set` target with `"value" in el`, which a <select> also satisfies, and
// a surface's kind is derived from its address prefix alone ("field:" on EITHER an <input> or a
// <select>), so nothing about the surface name itself tells the dispatcher which element it landed
// on. Filling a select with a value that isn't one of its options sets it BLANK, silently — measured
// live, not theoretical (see desk-reasoner.ts's and desk-door.ts's own comments on the same hazard).
// This module has no export that can reach a choice's surface, so that mistake can't happen here.
import type { FieldItem } from "./field-matcher.ts";

// One short, honest demo value per name in the closed set (field-matcher.ts's FIELD_TABLE) — every
// name this demo can ever match already has one, so a real ask never drafts nothing for a field it
// rendered. Budget stays vague on purpose, matching FIELD_TABLE's own "Budget (roughly)" honesty.
const SAMPLE_BY_NAME: Record<string, string> = {
  name: "Ada Rivers",
  email: "ada.rivers@example.com",
  phone: "555-0142",
  company: "Rivers Studio",
  role: "Product designer",
  subject: "A quick question",
  website: "https://ada-rivers.example",
  budget: "Flexible, happy to talk ranges",
};

/** Draft a demo value for every matched TEXT field, keyed by the exact surface `field.set` targets
 *  (so a caller never has to re-derive `field:builder-<name>` itself). A name outside the closed
 *  set — shouldn't happen, matchSpec only ever emits a FIELD_TABLE name — drafts nothing rather than
 *  guessing; the returned map only ever carries entries for fields this function actually knows. */
export function draftFieldValues(fields: FieldItem[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const sample = SAMPLE_BY_NAME[f.name];
    if (sample) out[f.surface] = sample;
  }
  return out;
}
