// portfolio/ai/capabilities.ts — the desk's ONE capability catalog: what it can SEE, NAVIGATE, and
// OPERATE, on THIS page, right now. Two sources feed it, and only two — never a third, hand-copied
// sentence living somewhere else:
//   • GRAIN's live-DOM manifest (deps.pageManifest, grain/ai/manifest-dom.ts) — operable controls
//     (every [data-surface] target's real accepted verbs) and readable regions (every surface that
//     opted into data-read, the manifest's `inView.readable` — grain's MCP-"resources" analog).
//     Harvested from the DOM + the action registry, never hand-typed, so it can't drift from what's
//     actually on screen (AI-INTERFACE §4).
//   • actions.ts's own closed Action vocabulary — the deterministic router (routeAction) already
//     enumerates every free-text thing the desk can do; ACTION_CAPABILITIES (actions.ts) is that same
//     union's presentation metadata (group + plain phrase), so this module never re-lists it by hand.
//
// This catalog is what desk-reasoner.ts now reads for BOTH the "what can I do here?" reply and the
// model's own canDo prompt feed — one source, so a visitor never gets two different-shaped answers to
// the same question, and a capability can't go stale in one place while the other still advertises it.
//
// CLIENT-SAFE (§19.2), pure: no DOM access of its own, only the already-harvested Manifest shape.

import type { Manifest } from "@tjakoen/grain/ai/manifest.ts";
import { ACTION_CAPABILITIES } from "./actions.ts";

export type CapabilityGroup = "see" | "navigate" | "operate";

export interface Capability {
  group: CapabilityGroup;
  /** The grain ActionName this maps to (e.g. "field.set"), or the actions.ts Action kind (e.g.
   *  "theme") for a built-in that isn't a grain verb — always traceable back to its source, never a
   *  bare description invented for this catalog. */
  verb: string;
  /** A plain-language fragment, ready to join into an "I can …" sentence. */
  phrase: string;
}

// Verb -> plain phrase, for the OPERATE surfaces the live manifest reports as accepting a verb right
// now. Kept small on purpose — grain's own vocabulary "grows reluctantly" (contract.ts), and a verb
// with no phrase here is still real (still visible in the raw manifest / x-ray), just not narrated
// in prose yet.
const OPERATE_PHRASE: Record<string, string> = {
  "item.archive": "archive an item",
  "say.set": "note something to the reflection",
  "say.stream": "ask for a quick reflection",
  "demo.run": "watch the desk act out a live demo",
  // B1 contact prefill — the /mail compose body is a registered field: the desk drafts, you send.
  "field.set": "have a message to TJ drafted for you",
  "note.append": "remember something you tell me, on your notepad",
  // note.replace deliberately carries no phrase: it's the human's Commit button, never a verb the
  // desk calls on its own initiative (memory.ts's memory-forget explains why — the desk never
  // deletes pad content, the one irreversible AI action this whole feature is built to avoid).
};

// Surface kind -> plain phrase, for a surface that opted into `data-read`. A kind with no entry here
// still renders (the generic fallback below) — this dict only supplies nicer wording for the ones
// worth naming specifically.
const READ_PHRASE: Record<string, string> = {
  notepad: "see what's on your notepad",
};

/** Shape of one entry in the manifest's `inView.readable` (manifest-dom.ts's ReadableSurface) — kept
 *  structural here rather than importing the type, so this module only depends on the Manifest shape
 *  it actually reads. */
interface ReadableEntry { id: string; kind: string; text: string }

/** Every DISTINCT verb the live manifest's targets accept right now, minus the generic screen/chat-log
 *  scaffolding every page carries — one Capability per verb (not per target: two fields that both
 *  accept field.set only say it once). */
function operateCapabilities(manifest: Manifest): Capability[] {
  const verbs = new Set<string>();
  for (const t of manifest.targets) {
    if (t.kind === "screen" || t.kind === "chat-log") continue;
    for (const v of t.accepts) verbs.add(v);
  }
  const out: Capability[] = [];
  for (const v of verbs) {
    const phrase = OPERATE_PHRASE[v];
    if (phrase) out.push({ group: "operate", verb: v, phrase });
  }
  return out;
}

/** Every surface that opted into `data-read` — the manifest's live "in view" state — reported as a
 *  see-capability. One phrase per DISTINCT kind. Empty when nothing on the page opted in (most pages
 *  today: only the notepad body does) — the honest answer, not a guess. */
function readCapabilities(manifest: Manifest): Capability[] {
  const readable = (manifest.inView.readable as ReadableEntry[] | undefined) ?? [];
  const seen = new Set<string>();
  const out: Capability[] = [];
  for (const r of readable) {
    if (seen.has(r.kind)) continue;
    seen.add(r.kind);
    out.push({ group: "see", verb: `read:${r.kind}`, phrase: READ_PHRASE[r.kind] ?? `read what's on the ${r.kind}` });
  }
  return out;
}

export interface CapabilityCatalog {
  see: Capability[];
  navigate: Capability[];
  operate: Capability[];
}

export interface CatalogInput {
  /** GRAIN's live-DOM manifest for THIS page. Omitted only when the reasoner has none (headless
   *  tests) — the catalog then carries just the code-enumerated built-ins. */
  manifest?: Manifest;
  /** Whether the site's real nav catalog (catalog.ts) resolved to at least one destination — gates
   *  the single generic "take you to any page" capability on there actually being somewhere to go. */
  hasDestinations: boolean;
}

/** Build the ONE catalog: everything the desk can see, go, or do, right here, right now. The operate
 *  and see legs are 100% DOM + registry derived (never hand-typed); navigate/the rest come off the
 *  closed, code-enumerated Action vocabulary (actions.ts's ACTION_CAPABILITIES) — never a second,
 *  hand-written English list living somewhere else that can quietly drift from what routeAction
 *  actually recognizes. */
export function buildCapabilityCatalog(input: CatalogInput): CapabilityCatalog {
  const { manifest, hasDestinations } = input;
  const see: Capability[] = manifest ? readCapabilities(manifest) : [];
  const navigate: Capability[] = [];
  const operate: Capability[] = manifest ? operateCapabilities(manifest) : [];

  for (const ac of ACTION_CAPABILITIES) {
    const cap: Capability = { group: ac.group, verb: ac.kind, phrase: ac.phrase };
    (cap.group === "see" ? see : cap.group === "navigate" ? navigate : operate).push(cap);
  }
  if (hasDestinations) navigate.push({ group: "navigate", verb: "navigate", phrase: "take you to any page on this site" });

  return { see, navigate, operate };
}

/** Flatten a catalog to its phrases, in ONE stable order — see + operate (self-contained: the desk
 *  answers or acts right here) BEFORE navigate (which sends the visitor elsewhere and has its own
 *  NAVIGATE:<route> protocol block in prompt.ts already). A 0.5B tends to echo whichever item comes
 *  first when asked "what can you do" (the baseline audit's finding, carried over from the array this
 *  replaces) — keeping navigation last avoids it leading with "I can take you to a page" instead of
 *  something it can actually do on the spot. Both consumers (the deterministic capabilities reply and
 *  the model's canDo prompt feed) read this SAME order. */
export function catalogPhrases(catalog: CapabilityCatalog): string[] {
  return [...catalog.see, ...catalog.operate, ...catalog.navigate].map((c) => c.phrase);
}
