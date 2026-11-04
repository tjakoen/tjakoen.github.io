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

/** The registered compose-subject surface on /mail. Filled alongside the body, and optional: when it
 *  does not land, the body still does, and Send falls back to mail.html's default subject. */
export const CONTACT_SUBJECT_SURFACE = "field:contact-subject";

const SUBJECT_MAX = 60;
// The greeting draftMessage may have added, so a subject can be drawn from a draft or a raw phrase.
const LEADING_GREETING = /^(?:hi|hiya|hello|hey|dear|good\s+(?:morning|afternoon|evening))\b[^,]*,\s*/i;
// "…about X" names the topic better than anything else the visitor is likely to have said.
const ABOUT = /\babout\s+(.+)$/i;
// Openers that carry no topic: "I want to", "I'd like to", "I'm hoping to", "can we", "please".
const FILLER = /^(?:(?:i(?:'d| would)? (?:like|love|want|wanted|hope|am hoping|'m hoping) to|can we|could we|please)\s+)+/i;

/** A short subject line drawn from the visitor's own words: the topic after "about" when there is one,
 *  otherwise the phrase with its greeting and filler opener removed. Never invented, never the model's:
 *  every word in it is one the visitor typed. Capped at a word boundary, first letter capitalised. */
export function draftSubject(phrase: string): string {
  let p = phrase.trim().replace(LEADING_GREETING, "").replace(/[.!?…]+$/, "").trim();
  if (!p) return "";
  const about = ABOUT.exec(p);
  p = about ? `About ${about[1]!.trim()}` : p.replace(FILLER, "");
  if (p.length > SUBJECT_MAX) {
    const cut = p.slice(0, SUBJECT_MAX + 1);
    p = cut.slice(0, cut.lastIndexOf(" ") > 20 ? cut.lastIndexOf(" ") : SUBJECT_MAX).replace(/[,;:\s]+$/, "");
  }
  return p.charAt(0).toUpperCase() + p.slice(1);
}
