// portfolio/ai/actions.ts — the desk's DETERMINISTIC action router (CLIENT-SAFE §19.2, pure). Maps a
// typed request (or an action chip's text) to a non-navigation ACTION the reasoner then drives —
// summarize / capabilities / clarify / open-latest-note / note-write. NAVIGATION is NOT here anymore:
// it's resolved against the live sitemap catalog (catalog.ts, resolveNav) so the desk sends a visitor
// only to routes that actually exist and the set scales with the site — no hardcoded alias table to
// grow. Free text that matches no action here falls through to catalog navigation, then to chat.
//
// This file is also the SOURCE for the desk's ONE capability catalog (capabilities.ts): ACTION_CAPABILITIES
// below is routeAction's own vocabulary, annotated with a group + a plain phrase — never a second,
// hand-copied description living somewhere else.

export type Choice = { label: string; value: string };
export type Action =
  | { kind: "open-latest-note" }
  // the flagship note — the ONE hand-pinned note (content.ts FLAGSHIP_NOTE_SLUG, "ten-times-zero"),
  // distinct from "latest" (which is dynamic — whichever note is newest). A fixed pin, so the reasoner
  // navigates it deterministically (zero model) the same way open-latest-note does — never the 0.5B
  // guessing a slug and echoing a bare path (the desk-audit's flagship-navigation gap).
  | { kind: "open-flagship-note" }
  | { kind: "summarize" }
  | { kind: "note-write"; instruction: string }
  | { kind: "capabilities" }
  | { kind: "clarify"; prompt: string; choices: Choice[] }
  | { kind: "deep-link"; query: string }
  // B2 notes filtering — "show me notes about X". `topic` is the RAW captured phrase; the reasoner
  // (never this router) matches it against the real tag set (notes-tags.ts matchTags) — law #2, the
  // model/router never picks a tag itself, only extracts what the visitor said.
  | { kind: "notes-filter"; topic: string }
  // A2 guided tour — a fixed, code-enumerated walk through 4 top-level stops (tour.ts). Zero model:
  // both kinds are matched here, before the model ever loads (see desk-reasoner.ts).
  | { kind: "tour-start" }
  | { kind: "tour-stop" }
  // "Watch me work" — the flagship showcase (showcase.ts). Like the tour it's a fixed, code-enumerated
  // multi-stop drive, but each stop DOES something (open a note, highlight a passage, save a notepad
  // line, prefill a message) — the desk piloting the real site end to end. Zero model. Shares the
  // tour's "type anything to stop" cancel, so its stop reuses tour-stop (handled in the reasoner).
  | { kind: "showcase-start" }
  // A4 theme switching — `target` is "dark", "light", "next" (cycle to whatever's next), or one of the
  // FLAVORS names below. Zero model: matched here, then RE-VALIDATED against the live <html data-themes>
  // list by the reasoner before it drives anything (a page could ship a different set than this file's
  // comment promises to track).
  | { kind: "theme"; target: string }
  // B3 mail batch archive — "archive everything from BREAD CI". `sender` is the RAW captured phrase;
  // the reasoner (never this router) matches it against the real sender set the /mail inbox rows carry
  // (mail-sender.ts matchSender) — the same law #2 split B2's `topic` follows: this router only
  // extracts what the visitor said, never a sender guess.
  | { kind: "mail-archive"; sender: string }
  // B1 contact prefill — "tell TJ I want to talk about grain". `message` is the RAW captured phrase
  // (original casing + punctuation — it becomes the draft's body, so norm()'s lowercasing would mangle
  // it); the reasoner drafts it into the /mail compose body via grain's field.set — field TARGETING is
  // a fixed registered surface in code (law #2), and the AI never submits (no submit verb exists).
  | { kind: "contact-message"; message: string }
  // C1 visitor-intent onboarding — the TRIGGER only. Whether the desk actually ASKS is stateful
  // (nag-guard: at most once per session, never once an intent is already set) — that decision belongs
  // to the reasoner, not this pure router, so this kind carries no payload beyond "the trigger fired".
  | { kind: "intent-ask" }
  // The three answers to the ask, re-entering the router as chat.send text exactly like a
  // CLARIFY_CHOICES pick does — see INTENT_CHOICES below for the exact phrases that route here.
  | { kind: "intent-set"; intent: "recruiter" | "developer" | "student" }
  // C2 visitor memory — "remember I'm here about grain". `fact` is the RAW captured remainder
  // (original casing/punctuation, B1's contact-message precedent — memory.ts's own sanitize is the
  // only cleanup it gets); the reasoner (never this router) writes it to the notepad as a marked
  // line and never composes or edits the wording itself (law #2).
  | { kind: "memory-set"; fact: string }
  // C2 visitor memory — "forget what you know about me". No payload: the desk never deletes pad
  // content (that would be the one irreversible AI action this whole feature is built to avoid), so
  // the reasoner's handler is a fixed, code-authored explanation, never a model-composed reply.
  | { kind: "memory-forget" };

/** The disambiguation the desk offers for a vague "where should I go?" — each choice's `value` is a
 *  phrase the desk itself resolves (catalog navigation or a capabilities ask), so a click just
 *  re-enters the router. Deterministic + offline-safe: no model needed to ASK, and none to ANSWER.
 *  "Take the tour" leads (A2) — the vague ask this offers most often ("show me around") IS the tour. */
export const CLARIFY_PROMPT = "Sure — where would you like to go?";
export const CLARIFY_CHOICES: Choice[] = [
  { label: "Take the tour", value: "take the tour" },
  { label: "GRAIN", value: "take me to grain" },
  { label: "The notes", value: "take me to the notes" },
  { label: "The BREAD stack", value: "take me to the bread stack" },
  { label: "About TJ", value: "take me to about" },
  { label: "What can I do here?", value: "what can I do here?" },
];

// C1 visitor-intent onboarding — the deterministic CHOICES ask (grain choicesOp), same "each choice's
// value re-enters the router" idiom as CLARIFY_CHOICES above. "visiting" is load-bearing in the prompt
// copy itself (the audit grader hooks on it) — see desk-reasoner.ts's INTENT_PROMPT text.
export const INTENT_PROMPT = "Hey! Who's visiting today? Pick one and I'll tailor the tour — or just keep chatting.";
export const INTENT_CHOICES: Choice[] = [
  { label: "Recruiter or hiring", value: "I'm hiring" },
  { label: "Developer curious about the stack", value: "I'm a developer" },
  { label: "Student of TJ's", value: "I'm a student of TJ's" },
];

const norm = (s: string): string => s.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();

// A4 theme switching — the flavor axis's CODE-SIDE mirror of <html data-themes> (view/pages/*.html).
// GRAIN itself hardcodes no theme names (theme.js reads the live attribute) — this const exists only
// so the router can recognize a flavor word in FREE TEXT; the reasoner re-validates against the LIVE
// list before acting, so a renamed/reordered/added flavor here never drives a click the DOM doesn't
// back. Keep in sync with view/pages/*.html's data-themes value.
const FLAVORS = ["sourdough", "baguette", "brioche"];

// "Show me the part about X" (A1, deep-link answers) — a request for WHERE on the site something is
// covered, distinct from navigation (a page) or summarize (this page). The captured remainder becomes
// `query`, which the reasoner retrieves against the corpus; a hit with a rendered heading anchor scrolls
// + spotlights straight to that section instead of answering in prose. Three phrasings the audit's
// "where does TJ talk about teaching with AI?" family exercises; order doesn't matter (mutually exclusive
// triggers), so first match wins.
const DEEP_LINK_PATTERNS: RegExp[] = [
  // "show/find/see/read/open the part/section/bit/passage/paragraph about/on/where/covering X"
  /\b(?:show|find|see|read|open)\b.*?\b(?:part|section|bit|passage|paragraph)\b.*?\b(?:about|on|where|covering)\b\s+(.+)$/,
  // "where does/do/did TJ talk/write/say/speak/mention(s) (about) X" — "about" is optional ("mention X")
  /\bwhere\s+(?:does|do|did)\b.*?\b(?:talks?|writes?|says?|speaks?|mentions?)\b\s*(?:about\s+)?(.+)$/,
  // "take/jump me to the part/section about/on X"
  /\b(?:take|jump)\s+me\s+to\s+the\s+(?:part|section)\b.*?\b(?:about|on)\b\s+(.+)$/,
];

// B2 notes filtering — "show me notes about X" / "notes tagged X" / "filter the notes by X". The
// captured remainder becomes `topic`, a RAW phrase the reasoner matches against the real tag set
// (notes-tags.ts) — this router only extracts what was asked, never a tag guess (law #2). Two shapes:
// a notes-word followed by an about/on/tagged/covering/related-to connector, or an explicit filter/
// narrow verb aimed at the notes/feed. Checked AFTER clarify (so "show me around" still clarifies) and
// BEFORE open-latest-note (so "show me the latest note" — no about/tagged connector here — still opens
// the newest note instead of a doomed empty-topic filter).
const NOTES_FILTER_PATTERNS: RegExp[] = [
  /\b(?:notes?|posts?|articles?|entries|writings?)\b.*?\b(?:about|on|tagged(?:\s+with)?|covering|related\s+to)\b\s+(.+)$/,
  /\b(?:filter|narrow)\b.*?\b(?:notes?|posts?|feed)\b.*?\b(?:by|to|about|on)\b\s+(.+)$/,
];

// B3 mail batch archive — "archive everything from BREAD CI" / "archive all mail from bread ci" /
// "archive the emails from The Desk". The captured remainder becomes `sender`, a RAW phrase the
// reasoner matches against the real sender set on /mail (mail-sender.ts) — this router only extracts
// what was asked, never a sender guess (law #2, the same split B2's `topic` follows). Two shapes: a
// blanket "everything/all/every (mail)" quantifier, or an explicit "the mail/messages/emails/letters"
// noun — both anchored on the word "archive" (an item.archive verb) so a stray "from" in an unrelated
// sentence never fires this.
const MAIL_ARCHIVE_PATTERNS: RegExp[] = [
  /\barchive\b\s+(?:everything|all(?:\s+(?:the\s+)?(?:mail|messages?|emails?|letters?))?|every\s+(?:mail|message|email|letter))\s+from\s+(.+)$/,
  /\barchive\b\s+(?:the\s+)?(?:mail|messages?|emails?|letters?)\s+from\s+(.+)$/,
];

// B1 contact prefill — "tell TJ I want to talk about grain" / "message TJ that grain looks great" /
// "go to contact and tell TJ …" (the tell-clause matches anywhere in the sentence). Run against the
// RAW text (case-insensitive), not norm()'s output: the captured remainder becomes the draft's BODY,
// so its casing and punctuation must survive. A leading "that" is connective tissue, not message text.
const CONTACT_MESSAGE_PATTERNS: RegExp[] = [
  /\b(?:tell|message|email|write\s+to)\s+tj\b[\s,:-]*(?:that\s+)?(.+)$/i,
];

// C2 visitor memory — "remember I'm here about grain" / "please remember that my name is Anna".
// WHOLE-message-anchored (^), like the C1 greeting/who's-visiting triggers below: an embedded
// "remember" mid-sentence ("I'll always remember this place") isn't a memory ask. Run against the RAW
// text (case-insensitive), the same B1 contact-message precedent, since the remainder becomes the pad
// line's fact VERBATIM — the 0.5B never composes or edits the visitor's own words (law #2). A leading
// "that" is connective tissue, stripped the same way B1 drops one from "tell TJ that …".
const MEMORY_SET_RE = /^(?:please\s+)?remember\s+(.+)$/i;
// A DEICTIC-only remainder — "remember this", "remember that", "remember it", "remember this page",
// "remember the page" and NOTHING else — means "remember the PAGE", not a fact about the visitor;
// that's note-write's job (unchanged since before this feature). Checked against norm()'s output
// (lowercased, punctuation stripped) so "This page." / "It!" still count.
const DEICTIC_ONLY_RE = /^(?:this|that|it|this page|the page)$/;

// C2 visitor memory — "forget what you know about me" / "forget everything". WHOLE-message-anchored
// like MEMORY_SET_RE above. "forget it" / "forget that" are excluded on purpose: a casual dismissal
// ("nah, forget it") is not a memory-forget ask, and the desk has nothing to lose by treating it as
// ordinary chat instead of a pointed decline about pad contents.
const FORGET_RE = /^forget\b\s*(.*)$/i;

/** Match a request to a deterministic ACTION, or null → (catalog navigation, then) grounded chat.
 *  Order matters: the specific intents resolve before the broad ones. Navigation is handled by the
 *  caller against the sitemap catalog, not here. */
export function routeAction(text: string): Action | null {
  const t = norm(text);
  if (!t) return null;

  // write to the notepad — the desk COMPOSES an entry and appends it (note.append). Checked FIRST so
  // "summarize this to my notepad" writes to the pad rather than only summarizing into the chat, AND
  // so an explicit "remember to add this to my notepad" still writes to the PAGE's pad rather than
  // being read as a C2 memory ask below (the notepad mention wins — the deliberate exception to "remember
  // routes before note-write" documented on the memory-set Action kind above). Two triggers: an explicit
  // notepad mention with a write-ish verb, or a bare "jot this down"/"make a note".
  if (/\bnotepad\b/.test(t) && /\b(add|save|writ\w*|put|jot|note|append|record|capture|stick|drop|summari[sz]e)\b/.test(t))
    return { kind: "note-write", instruction: text.trim() };

  // C2 visitor memory — checked here, BEFORE the bare "remember (this|that)" note-write trigger below
  // (the split this feature adds: a SUBSTANTIVE "remember X" is a fact about the VISITOR, a deictic-only
  // one is still about the PAGE). Run against the RAW text so the fact keeps its casing/punctuation.
  const memMatch = MEMORY_SET_RE.exec(text.trim());
  if (memMatch) {
    const fact = memMatch[1]!.trim().replace(/^that\s+/i, "").trim();
    if (fact && !DEICTIC_ONLY_RE.test(norm(fact))) return { kind: "memory-set", fact };
    // empty or deictic-only remainder — fall through (no return): a bare "remember"/"remember this"
    // isn't a memory ask, and the deictic case is caught by the note-write trigger just below instead.
  }
  const forgetMatch = FORGET_RE.exec(text.trim());
  if (forgetMatch) {
    const remainder = norm(forgetMatch[1] ?? "");
    if (remainder !== "it" && remainder !== "that") return { kind: "memory-forget" };
    // "forget it"/"forget that" — a casual dismissal, not a pointed ask about pad contents. Fall through.
  }

  if (/\b(jot (this|that|it|down)|note (this|that|it) down|make a note|take a note|remember (this|that|it|this page|the page))\b/.test(t))
    return { kind: "note-write", instruction: text.trim() };

  // deep-link — "show me the part about X" (see DEEP_LINK_PATTERNS above). An empty remainder (nothing
  // left to look up, e.g. a stray "show me the section about") is NOT a deep-link — fall through to
  // whatever the rest of the router decides instead of routing a doomed empty-query lookup.
  for (const re of DEEP_LINK_PATTERNS) {
    const m = re.exec(t);
    const query = m?.[1]?.trim();
    if (query) return { kind: "deep-link", query };
  }

  // summarize this page
  if (/\b(summari[sz]e|sum up|recap)\b/.test(t) || /tl;?dr/i.test(text)) return { kind: "summarize" };

  // capabilities — "what can I do here", "what should I do next", "suggest what to do". Also the
  // page-inventory asks ("which pages can you take me to", "where can you take me"): the desk-audit
  // showed the 0.5B mangling a route list into invented slugs, and the capabilities reply already
  // names every section — so the model never gets this one.
  if (/\bwhat can i do\b/.test(t) || /\bwhat (should|can) i (do|try)\b/.test(t) ||
      /\bwhat to do\b/.test(t) || /\b(suggest|recommend)\b.*\b(do|next|try)\b/.test(t) ||
      /\bwhat.?s (here|next)\b/.test(t) ||
      /\b(which|what) pages?\b/.test(t) || /\bwhere can you take (me|us)\b/.test(t))
    return { kind: "capabilities" };

  // A2 guided tour — "stop the tour" BEFORE "take the tour": both share the word "tour", and a stop
  // phrase ("stop/end/cancel/quit the tour") must never be mistaken for a start. Checked here (after
  // deep-link/summarize/capabilities, before clarify) so a tour ask never falls into the vaguer
  // "show me around" clarify bucket below — it's specific enough to act on directly.
  if (/\b(?:stop|end|cancel|quit)\s+the\s+(?:tour|demo|showcase)\b/.test(t)) return { kind: "tour-stop" };
  if (/\b(?:take|start|begin)\s+(?:the|a)\s+tour\b/.test(t) || /\bgive me\s+(?:the|a)\s+tour\b/.test(t))
    return { kind: "tour-start" };

  // "Watch me work" — the flagship showcase (showcase.ts). Two shapes: "watch …" with a work/act verb
  // (watch me work, watch the AI act, watch the desk work), or a run/play/start/show verb aimed at a
  // "demo"/"showcase". Checked alongside the tour so it never falls into the vaguer clarify bucket.
  if (/\bwatch\b.*\b(work|act)\b/.test(t) || /\b(?:run|play|start|show me|see)\b.*\b(?:demo|showcase)\b/.test(t))
    return { kind: "showcase-start" };

  // A4 theme switching — zero model, both axes GRAIN's theme.js already exposes. Checked here (after
  // the specific intents above, before the vaguer clarify bucket below) so a theme ask never gets
  // mistaken for "help me get somewhere".
  //
  // scheme (dark/light): the bare word alone isn't enough — a stray "dark" shouldn't hijack an
  // unrelated sentence — so it needs a mode-ish companion (mode/theme/make it/switch/go). A
  // chat-shaped question like "is dark mode supported" still fires: unambiguous enough, and the
  // reasoner answers it honestly either way (already-dark vs. a real toggle). "dark(er)"/"light(er)"
  // both count ("make it darker").
  const SCHEME_WORD = /\b(dark|light)(?:er)?\b/;
  if (SCHEME_WORD.test(t) && /\b(?:mode|theme|make it|switch|go)\b/.test(t)) {
    const m = SCHEME_WORD.exec(t)!;
    return { kind: "theme", target: m[1]! };
  }
  // cycle/next flavor — "cycle the theme", "next theme".
  if (/\b(?:cycle|next)\b.*\btheme\b|\btheme\b.*\b(?:cycle|next)\b/.test(t)) return { kind: "theme", target: "next" };
  // a named flavor, ANYWHERE in the message ("switch to brioche", "use the baguette theme", "change
  // the theme to sourdough", a bare "brioche"). No switch-ish context required for the bare case — these
  // words are unambiguous site-wide (no nav destination shares them, so this can never shadow a
  // catalog match like "switch to grain", which isn't a flavor name and falls through below).
  for (const f of FLAVORS) if (new RegExp(`\\b${f}\\b`).test(t)) return { kind: "theme", target: f };

  // B3 mail batch archive — checked here (after theme, before the C1 intent-ask trigger below) so an
  // archive ask never gets swallowed by a greeting/vague-opener check further down. An empty remainder
  // (nothing left to look up, e.g. a stray "archive everything from") is NOT a mail-archive — fall
  // through, same empty-remainder guard as deep-link and notes-filter above, rather than routing a
  // doomed empty-sender lookup.
  for (const re of MAIL_ARCHIVE_PATTERNS) {
    const m = re.exec(t);
    const sender = m?.[1]?.trim();
    if (sender) return { kind: "mail-archive", sender };
  }

  // B1 contact prefill — checked here (after mail-archive: "…the mail from X" must never read as a
  // message to send; before the C1 trigger below). Runs against the RAW text so the captured message
  // keeps its casing + punctuation (see CONTACT_MESSAGE_PATTERNS). An empty remainder (a stray "tell
  // TJ") is NOT a contact ask — fall through, the same empty-remainder guard every capture above uses.
  for (const re of CONTACT_MESSAGE_PATTERNS) {
    const m = re.exec(text);
    const message = m?.[1]?.trim();
    if (message) return { kind: "contact-message", message };
  }

  // C1 visitor-intent onboarding — the TRIGGER, checked here, BEFORE the clarify block below (per the
  // roadmap's "router pattern before the clarify check"). Two shapes: (a) a WHOLE-message greeting/vague
  // opener — nothing else in the message, so "help me find the docs" still falls through to the
  // clarify patterns just below rather than being swallowed by a bare "help"; (b) an explicit "who's/
  // who is visiting" ask. This router only recognizes the trigger — whether the desk actually ASKS is
  // stateful (nag-guard: at most once a session, never again once an intent is set), so that call
  // belongs to the reasoner (desk-reasoner.ts), not this pure function.
  if (/^(?:hi|hiya|hello|hey|yo|howdy|good (?:morning|afternoon|evening)|help)$/.test(t)) return { kind: "intent-ask" };
  // ^-anchored like the greeting above: an EMBEDDED mention ("I wonder who is visiting") isn't an
  // ask to be onboarded — only a message that LEADS with the question is.
  if (/^who\s+(?:is|s)\s+visiting\b/.test(t)) return { kind: "intent-ask" };

  // C1 visitor-intent onboarding — the three ANSWERS (INTENT_CHOICES above), re-entering the router the
  // same way a CLARIFY_CHOICES pick does. Anchored to the WHOLE message (norm() already stripped the
  // apostrophe in "I'm" down to a bare "i m"/"i am") so an ordinary sentence that merely CONTAINS
  // "student" or "developer" ("I'm a student of design, not code") never hijacks — only a complete
  // "I'm a/am a student/developer[...]" sentence does. The student form tolerates a trailing
  // "of tj's" (also apostrophe-stripped to "of tj s"), since that's the exact label/value text.
  const IM = "(?:m|am)";
  if (new RegExp(`^i\\s+${IM}\\s+hiring$`).test(t)) return { kind: "intent-set", intent: "recruiter" };
  if (new RegExp(`^i\\s+${IM}\\s+a\\s+developer$`).test(t)) return { kind: "intent-set", intent: "developer" };
  if (new RegExp(`^i\\s+${IM}\\s+a\\s+student(?:\\s+of\\s+tj(?:\\s*s)?)?$`).test(t)) return { kind: "intent-set", intent: "student" };

  // clarify — a vague "help me get somewhere" ask with no concrete destination. Offer choices rather
  // than a wall of text or a guess. Kept BEFORE latest-note so "show me around" resolves here.
  // ("give me/take a tour" used to land here — A2 now starts the tour directly, above.)
  if (/\bshow me around\b/.test(t) || /\bsurprise me\b/.test(t) ||
      /\bwhere (should|can|do) i (go|start|look|begin)\b/.test(t) || /\bhelp me (choose|decide|navigate|find|get around)\b/.test(t) ||
      /\b(what are my |my )?options\b/.test(t) || /\bnot sure\b/.test(t))
    return { kind: "clarify", prompt: CLARIFY_PROMPT, choices: CLARIFY_CHOICES };

  // B2 notes filtering — checked here (after clarify, before latest-note) so "show me the latest
  // note" (no about/tagged connector) still falls through to the dedicated latest-note action below,
  // while "show me notes about teaching" resolves here first. An empty remainder (nothing left to
  // match, e.g. a stray "filter the notes by") is NOT a filter — fall through, same as deep-link's
  // empty-remainder guard, rather than routing a doomed empty-topic lookup.
  for (const re of NOTES_FILTER_PATTERNS) {
    const m = re.exec(t);
    const topic = m?.[1]?.trim();
    if (topic) return { kind: "notes-filter", topic };
  }

  // open the latest note — a "latest/newest/recent" qualifier + a note word + an intent verb. Stays a
  // dedicated action (not catalog nav) because "latest" is dynamic — it resolves to whichever note is
  // newest, not a fixed route.
  const noteWord = /\b(note|notes|blog|post|posts|article|writing|entry)\b/;
  const latest = /\b(latest|newest|recent|last|most recent)\b/;
  const intent = /\b(show|open|read|see|go|take|latest|newest|recent)\b/;

  // the flagship note — a flagship WORD + an intent verb ("take me to the flagship note", "read the
  // flagship post"). Checked BEFORE open-latest so the pin wins over the newest-by-date note. An intent
  // verb is required so an informational "what's the flagship post about?" still answers in prose.
  const flagship = /\b(flagship|signature|headline|featured|marquee)\b/;
  if (flagship.test(t) && intent.test(t)) return { kind: "open-flagship-note" };

  if (latest.test(t) && noteWord.test(t) && intent.test(t)) return { kind: "open-latest-note" };

  return null;
}

/** Presentation metadata for the Action kinds a visitor can ASK for directly, anywhere on the site
 *  (deterministic, zero model) — folded into the desk's ONE capability catalog (capabilities.ts) so
 *  "what can I do here?" and the model's own canDo reasoning describe EXACTLY what routeAction
 *  recognizes, never a hand-copied second list that can drift from it. Left out on purpose:
 *   - internal/silent kinds triggered by the conversation's own flow, not asked for as a capability
 *     (clarify, tour-stop, intent-ask/intent-set, open-flagship-note — a pin of open-latest-note).
 *   - note-write and memory-set/-forget: both land on the SAME notepad target the DOM-derived
 *     note.append capability already names (capabilities.ts's OPERATE_PHRASE) — listing them again
 *     here would just repeat it under a different word.
 *   - contact-message and mail-archive: NOT global — a message draft only makes sense where the
 *     compose field exists, mail archiving only where there's an inbox. Both are already covered,
 *     honestly and per-page, by the DOM-derived operate capabilities (field.set / item.archive) —
 *     adding them here would claim the ability on pages that don't actually carry the surface. */
export interface ActionCapability {
  kind: Action["kind"];
  group: "see" | "navigate" | "operate";
  phrase: string;
}
export const ACTION_CAPABILITIES: ActionCapability[] = [
  { kind: "summarize", group: "see", phrase: "summarize this page" },
  { kind: "deep-link", group: "see", phrase: "point you to the part of the site that covers something specific" },
  { kind: "open-latest-note", group: "navigate", phrase: "open the latest note" },
  { kind: "tour-start", group: "navigate", phrase: "walk you through the site on a guided tour" },
  { kind: "notes-filter", group: "operate", phrase: "filter the notes by topic" },
  { kind: "theme", group: "operate", phrase: "switch the site's theme" },
  { kind: "showcase-start", group: "operate", phrase: "drive the site itself, step by step, so you can watch" },
];

/** The pinned first chip — always offered on every page (the showcase's "what can I do here?"). */
export const PINNED_CHIP = "What can I do here?";

/** The desk's headline actions, offered as chips on a cold page + in the capabilities reply. */
export const ACTION_CHIPS = ["Summarize this page", "Show me the latest note"];
