// portfolio/ai/contact-draft.ts — B1 contact prefill: turn the visitor's captured phrase into the
// draft the desk prefills into the /mail compose body (grain field.set → the `fill` op). PURE +
// deterministic (CLIENT-SAFE §19.2): the 0.5B never composes this — the visitor's own words ARE the
// message; this only adds the salutation and closes the sentence. Field TARGETING is equally
// deterministic (the one registered `field:contact-message` surface, named in code) — law #2: the
// model never picks selectors or enumerates inputs. The visitor reviews and sends; the AI never
// submits (structural — no submit verb exists in grain's vocabulary).

/** The registered compose-body surface on /mail — the ONE field the desk may prefill. */
export const CONTACT_FIELD_SURFACE = "field:contact-message";

// A phrase that already opens like a letter needs no salutation bolted on front.
const OPENS_LIKE_A_LETTER = /^(?:hi|hiya|hello|hey|dear|good\s+(?:morning|afternoon|evening))\b/i;
// Already-closed sentences keep their own ending; anything else gets a period.
const ENDS_CLOSED = /[.!?…]["')\]]?$/;

/** Draft the compose-body text from the visitor's captured phrase — their words, verbatim, wrapped
 *  in a salutation (unless they wrote one) and closed with a period (unless they closed it). */
export function draftMessage(phrase: string): string {
  const p = phrase.trim();
  if (!p) return "";
  const body = OPENS_LIKE_A_LETTER.test(p) ? p : `Hi TJ, ${p}`;
  return ENDS_CLOSED.test(body) ? body : `${body}.`;
}
