// portfolio/src/ai/desk-model.ts — the desk's model turn: prompt, stream, parse, settle.
//
// The half of a turn that needs the local model. Split out of desk-reasoner.ts; rt carries the deps,
// the profile and the conversation history. It returns a Decision when it claims the turn.

import type { Decision } from "@tjakoen/grain/ai/contract.ts";
import { buildPrompt, PromptBudgetError, type ChatMessage } from "./prompt.ts";
import { retrieve, FACTS_ROUTE } from "./retrieval.ts";

import { navShortlist, stripSlash } from "./catalog.ts";
// B2 notes filtering — matching a visitor's free-text topic against the REAL tag set (never a model
// guess, law #2). Pure + framework-free (notes-tags.ts), same family as catalog.ts's resolver.

// B3 mail batch archive — matching a visitor's free-text sender phrase against the REAL sender set on
// /mail (never a model guess, law #2). Pure + framework-free (mail-sender.ts), notes-tags.ts's sibling.

// B1 contact prefill — the deterministic draft (the visitor's words + a salutation) and the ONE
// registered field surface the desk may fill (never a model-picked selector, law #2). Pure
// (contact-draft.ts), same family as the matchers above.

// D1 form builder demo — the closed-set matcher (field-matcher.ts, "Read first" — the ONE thing that
// decides which fields/choices ever exist) plus the demo values drafted for its TEXT fields only
// (form-draft.ts — never a `choices` item, see that file's own banner on why). KNOWN_FIELD_LABELS/
// KNOWN_CHOICE_LABELS name the closed set honestly when a description matches nothing at all.

// C2 visitor memory — the notepad IS the memory. Write-time sanitize + the one line marker
// (sanitizeMemoryFact, memoryLine) and read-time parseMemories (re-sanitize + cap, for the VISITOR
// NOTES prompt block). Pure (memory.ts), same family as contact-draft.ts.
import { parseMemories } from "./memory.ts";
// A2 guided tour — the fixed, code-enumerated stop list (tour.ts). Zero model: tour-start/tour-stop
// are matched deterministically (actions.ts) and driven from this data, never from the model's own
// judgment of "what's on the site" (CLAUDE.md design law — code enumerates routes, never the model).

// GRAIN's reasoner-kit — the chat bubble markup the desk USED to fork now comes from here (injected
// as deps.kit at runtime; the door URL-

// The desk's ONE capability catalog (capabilities.ts) — what it can see / navigate / operate, built
// from GRAIN's live-DOM manifest + actions.ts's own closed vocabulary. Both the deterministic
// "capabilities" reply below and the model's canDo prompt feed read from this SAME catalog, so they
// can't drift apart into two different-shaped answers to "what can I do here?".
import { buildCapabilityCatalog, catalogPhrases } from "./capabilities.ts";
import { esc } from "./desk-text.ts";

import { deterministicTurn } from "./desk-deterministic.ts";
import type { DeskRuntime } from "./desk-runtime.ts";
import type { Turn } from "./desk-reasoner.ts";

import { parseModelChoices, pickFollowups, DOWNLOAD_DECLINED_LINE, loadBar } from "./desk-copy.ts";
export { parseModelChoices, DOWNLOAD_DECLINED_LINE, loadBar } from "./desk-copy.ts";
export { NAV_GLIDE_MS, CONTACT_FILL_BEAT_MS, FORM_FILL_BEAT_MS, MAIL_ARCHIVE_BEAT_MS } from "./desk-timing.ts";
export { suggestChipsHtml } from "./desk-hud.ts";

  export async function modelTurn(rt: DeskRuntime, turn: Turn): Promise<Decision> {
  const { deps, profile, history } = rt;
    const { tools, log, text, action, getCatalog,
      setBody, setBodyRaw, setChips, offline, modelBlocked, declineModel, narrate, streamInto, typeOut, travelAndNavigate } = turn;
      // A feed's featured card already has an authored title and summary. Return that verified
      // content directly instead of asking a 0.5B model to paraphrase and invent unsupported claims.
      if (action?.kind === "summarize" && stripSlash(deps.pageInfo?.().route ?? "") === "/notes") {
        const featured = deps.pageSummary?.();
        if (!featured) {
          setBody(esc("There's nothing on this page for me to summarize."), "committed");
          return { ok: false, ops: [], reply: "empty page", reason: "no visible note summary" };
        }
        narrate("reads", "the featured note");
        const line = `The featured note is “${featured.title}.” Its summary says: ${featured.summary}`;
        await typeOut(line);
        return { ok: true, ops: [], reply: line };
      }

      // 4) needs the model. Load it once the visitor has agreed to the download (downloadAllowed): a real progress bar, honest
      //    about the one-time cost. No stub fallback — unavailable/failed ⇒ Desk Offline.
      if (modelBlocked()) return declineModel();
      if (rt.engineState.degraded) return offline();
      if (!(await rt.downloadAllowed(setBody))) return declineModel(DOWNLOAD_DECLINED_LINE);
      const { label } = profile;
      const warm = deps.isWarm?.() === true;
      setBodyRaw(loadBar(0, profile, warm), "pending");
      narrate("loads", warm ? `${label} from the copy saved on this device` : `${label}, one time, cached, runs on your device`);
      let lastPct = -1;
      const engine = await rt.ensureEngine((p) => {
        const pct = Math.round((p.progress || 0) * 100);
        if (pct !== lastPct) { lastPct = pct; setBodyRaw(loadBar(pct, profile, warm), "pending"); }
      });
      if (!engine) return offline();
      if (tools.cancelled()) { setBody(esc("Stopped."), "committed"); return { ok: true, ops: [], reply: "Stopped." }; }

      // 4a) summarize this page — read the DOM content, stream a SHORT summary (capped tokens +
      //     penalties + the loop-guard keep the 0.5B from spinning).
      if (action?.kind === "summarize") {
        const page = (deps.pageText?.() ?? "").replace(/\s+/g, " ").trim();
        if (!page) { setBody(esc("There's nothing on this page for me to summarize."), "committed"); return { ok: false, ops: [], reply: "empty page", reason: "no page text" }; }
        narrate("reads", "this page");
        const acc = await streamInto(engine, [
          // The prompt asks for subjects and claims from the page rather than a description of the
          // page. A summary that only says it summarizes topics is not useful to the visitor.
          { role: "system", content: "In 1 or 2 plain sentences, summarize only claims stated in the CONTENT. For a list of articles, name two listed titles or their stated subjects. Do not infer a shared purpose, schedule, outcome, or claim. Do not describe the page or say that you are summarizing it. No headings, markdown, lists, hype, or repetition." },
          { role: "user", content: `Page: ${deps.pageInfo?.().title ?? ""}\n\nCONTENT:\n${page.slice(0, 4000)}` },
        ], profile.summarizeMaxTokens);
        return { ok: true, ops: [], reply: acc };
      }

      // 4a') write to the notepad — the desk COMPOSES a short markdown entry and appends it through
      //      GRAIN's own note.append op-builder (kit.noteAppendOp → the notepad-body surface, graded
      //      grain as an AI author). Only when this page actually HAS a notepad (the manifest reports a
      //      target that accepts note.append — harvested even while the pane is hidden); otherwise an
      //      honest decline instead of writing into the void.
      if (action?.kind === "note-write") {
        const hasNotepad = !!deps.pageManifest?.().targets.some((tt) => tt.accepts.includes("note.append"));
        if (!hasNotepad) {
          setBody(esc("I don't see a notepad on this page to write to. I can summarize the page or take you somewhere instead."), "committed");
          return { ok: false, ops: [], reply: "no notepad here", reason: "no notepad surface" };
        }
        const page = (deps.pageText?.() ?? "").replace(/\s+/g, " ").trim();
        narrate("writes", "a note to the notepad");
        const note = (await streamInto(engine, [
          { role: "system", content:
            "You write a SHORT markdown note to save to the visitor's notepad. Output ONLY the note's " +
            "markdown — prefer 2 to 5 concise '- ' bullet points (an optional one-line heading is fine) — " +
            "with no preamble, no sign-off, and no repetition. Base it on the visitor's request; when they " +
            "refer to 'this page' or ask for a summary, draw from the PAGE CONTENT." },
          { role: "user", content: page
            ? `Request: ${action.instruction}\n\nPAGE CONTENT:\n${page.slice(0, 3500)}`
            : `Request: ${action.instruction}` },
        ], profile.summarizeMaxTokens)).trim();
        if (!note) {
          setBody(esc("I couldn't compose a note for that. Tell me what to jot down and I'll add it."), "committed");
          return { ok: false, ops: [], reply: "empty note", reason: "empty note" };
        }
        // land the entry on the notepad, spotlight + reveal the pad so the write is visible, then
        // settle the chat bubble to a confirmation (the streamed preview has served its purpose).
        tools.emit(deps.kit.noteAppendOp(note, "ai"));
        tools.emit(deps.kit.spotlightOp("notepad", { active: true }));
        deps.revealNotepad?.();
        setBody(esc("Added that to your notepad."), "committed");
        await tools.delay(1400);
        tools.emit(deps.kit.spotlightOp("screen", { active: false }));
        return { ok: true, ops: [], reply: "Added to the notepad." };
      }

      // 4b) grounded chat (default). Retrieve grounding, stream, then swap the chips to curated
      //     follow-ups (suggestChipsHtml pins "What can I do here?" first).
      const catalog = await getCatalog();
      const knowledge = await deps.loadKnowledge();
      const grounding = retrieve(text, knowledge, 3);
      narrate("reads", grounding.map((c) => c.route).join(", ") || "facts");
      // The fuzzy tail: hand the model a small, relevance-ranked shortlist of REAL destinations from
      // the sitemap catalog (navShortlist), so when the deterministic resolver above wasn't confident
      // the model still chooses from routes that exist — never an invented slug.
      const shortlist = navShortlist(text, catalog);
      // What the desk can DO here — the SAME ONE capability catalog the deterministic route
      // announces (capabilities.ts: this page's live manifest + actions.ts's built-in verbs),
      // handed to the MODEL too, so a freeform "what are you able to do?" answers capability-aware
      // instead of guessing from prose. catalogPhrases already orders self-contained (see/operate)
      // before navigate (audit finding: a 0.5B tends to echo whichever item comes first).
      const manifest = deps.pageManifest?.();
      const canDo = catalogPhrases(buildCapabilityCatalog({ manifest, hasDestinations: catalog.length > 0 }));
      // C2 visitor memory (plan default: ALWAYS feed) — the sanitized "Desk memory" lines off the
      // visitor's OWN notepad right now, re-sanitized + capped by parseMemories (defense in depth:
      // this is the first visitor-authored free text ever entering the system prompt). Omitted
      // entirely when empty, the same "absent/empty leaves the prompt unchanged" contract canDo/nav
      // already follow — never an empty VISITOR NOTES block for the model to puzzle over.
      const visitorNotes = parseMemories(deps.padMarkdown?.() ?? "");
      let messages: ChatMessage[];
      try {
        messages = buildPrompt({
          query: text || "Hello", chunks: grounding, history, navShortlist: shortlist, canDo,
          visitorNotes: visitorNotes.length ? visitorNotes : undefined, tokenBudget: profile.promptTokenBudget,
        });
      } catch (error) {
        if (!(error instanceof PromptBudgetError)) throw error;
        setBody(esc(error.message), "committed");
        return { ok: false, ops: [], reply: error.message, reason: "prompt budget exceeded" };
      }
      const acc = await streamInto(engine, messages);

      // The model chose to navigate. Validate TWICE before acting on generated text: the route must be
      // REAL (present in the sitemap catalog — never trust the model to have stayed in scope), AND
      // kit.navigateOp's own isSafeNavigateHref check (it throws on anything unsafe).
      const navMatch = MODEL_NAVIGATE_RE.exec(acc.trim());
      // 1b: the weak 0.5B sometimes ECHOES a bare route ("/notes/ten-times-zero") as its whole reply
      // instead of the NAVIGATE:<route> protocol — treat a whole-message bare path as the same
      // navigate intent, so the visitor never sees a raw slug as an "answer". Only when the ENTIRE
      // trimmed reply is a single path (a path mentioned mid-sentence is left as prose).
      const bareRoute = !navMatch && /^\/[^\s]*$/.test(acc.trim()) ? acc.trim() : null;
      const navPath = navMatch?.[1] ?? bareRoute;
      if (navPath && deps.navigate) {
        const route = navPath.split("#")[0] ?? "";
        const dest = catalog.find((d) => d.route === route);
        if (dest) {
          try {
            deps.kit.navigateOp("screen", route);   // throws on an unsafe href — validate before acting
            setBody(esc(`Taking you to ${dest.label}.`), "committed");
            rt.lastTarget = { route: dest.route, label: dest.label };
            await travelAndNavigate(route, route, dest.label, `Here's ${dest.label}.`, "the navigation");
            return { ok: true, ops: [], reply: `Navigating to ${dest.label}` };
          } catch (err) {
            console.error("[desk] model chose an unsafe navigate href", route, err);   // fall through to the honest line
          }
        }
        // The model emitted a NAVIGATE we WON'T honor — a route it invented (not in the catalog) or an
        // unsafe href. Never leak the raw "NAVIGATE:<route>" protocol token to the visitor. Settle an
        // honest line pointing at what's actually reachable (the shortlist we offered).
        const offer = shortlist.length ? shortlist.slice(0, 4).map((d) => d.label).join(", ") : "GRAIN, the notes, or the BREAD stack";
        const line = `I'm not sure where that is on the site. I can take you to ${offer}, or answer a question about it.`;
        setBody(esc(line), "committed");
        history.push({ role: "user", content: text || "Hello" }, { role: "assistant", content: line });
        setChips([...pickFollowups(text, history, deps.intentGet?.() ?? undefined), "Summarize this page"]);
        return { ok: true, ops: [], reply: line };
      }

      // The model chose to start the contact flow (CONTACT: protocol, prompt.ts). It only decides;
      // the message it hands back runs through the SAME deterministic branch the fixed pattern
      // reaches, so the draft is still contact-draft.ts's and sending stays the visitor's.
      const contact = MODEL_CONTACT_RE.exec(acc.trim())?.[1];
      if (contact) {
        const decided = await deterministicTurn(rt, { ...turn, action: { kind: "contact-message", message: contact.trim() } });
        if (decided) return decided;
      }

      // The model chose to ASK instead of answer (CHOICES: protocol, prompt.ts). Turn the raw
      // "CHOICES: q | a | b" into a real ask: the streamed bubble becomes the question, and grain's
      // first-class choicesOp appends the pick-one buttons (each a chat.send carrying its value).
      const asked = parseModelChoices(acc);
      if (asked) {
        setBody(esc(asked.prompt), "committed");
        tools.emit(deps.kit.choicesOp(log, "", asked.choices));
        history.push({ role: "user", content: text || "Hello" }, { role: "assistant", content: asked.prompt });
        return { ok: true, ops: [], reply: asked.prompt };
      }

      // A3: a deterministic "Read more" citation under the grounded answer — built by CODE from the
      // TOP retrieval chunk (the model never writes a path; law #2). Only when the grounding came
      // from a real page (not the hand-authored facts) the visitor isn't already on. The link rides
      // A1's rendered heading ids when the chunk has one, so "Read more" lands on the exact section
      // (a native #fragment jump — no desk choreography needed for a human click). Replacing the
      // settled body with the same escaped text + the cite span reuses the one replaceBodyOp path.
      const top = grounding[0];
      const here = deps.pageInfo ? stripSlash(deps.pageInfo().route) : "";
      if (acc.trim() && top && top.route !== FACTS_ROUTE && stripSlash(top.route) !== here) {
        const href = top.anchor ? `${top.route}#${top.anchor}` : top.route;
        setBodyRaw(
          esc(acc.trim()) +
          `<span class="desk-cite">Read more: <a href="${esc(href)}">${esc(top.title)}</a></span>`,
          "committed");
        // 1c: a following "go there" now reuses THIS cited note (not a fresh retrieval that drifted).
        rt.lastTarget = { route: top.route, label: top.title };
      }
      history.push({ role: "user", content: text || "Hello" }, { role: "assistant", content: acc });
      setChips([...pickFollowups(text, history, deps.intentGet?.() ?? undefined), "Summarize this page"]);
      return { ok: true, ops: [], reply: acc };
  };
// The model's own navigation choice, per the NAVIGATE:<route> protocol prompt.ts offers it (scoped to
// the real sitemap-catalog shortlist — see navBlock in prompt.ts). Matched loosely (case-insensitive,
// trims stray whitespace) since a 0.5B doesn't always hit a format byte-exact; the chosen route is then
// validated against the real catalog before we act on it.
const MODEL_NAVIGATE_RE = /^navigate:\s*(\/\S*)\s*$/i;

// The model's own decision to start the contact flow (CONTACT: protocol, prompt.ts). Loose on case and
// spacing for the same reason as NAVIGATE; a reply that only mentions "contact" mid-sentence is prose.
const MODEL_CONTACT_RE = /^contact:\s*["“]?([\s\S]+?)["”]?\s*$/i;

