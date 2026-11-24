// portfolio/src/ai/desk-deterministic.ts — every desk turn that needs no model.
//
// Themes, tours, navigation, note and mail actions, memory, the showcase kickoff, deep links and the
// form demo. It is offline safe: it returns a Decision when it claims the turn, and null to hand the
// turn to the model path. Split out of desk-reasoner.ts; rt carries the shared state.

import type { Decision } from "@tjakoen/grain/ai/contract.ts";

import { retrieve, FACTS_ROUTE } from "./retrieval.ts";

import { ACTION_CHIPS, // C1 visitor-intent onboarding — the ask's own copy/choices, and the CLARIFY pair it falls back to
  // once the nag-guard says "don't ask again" (same bubble shape either way).
  CLARIFY_PROMPT, CLARIFY_CHOICES, INTENT_PROMPT, INTENT_CHOICES } from "./actions.ts";
import { resolveNav, stripSlash, joinPhrases } from "./catalog.ts";
// B2 notes filtering — matching a visitor's free-text topic against the REAL tag set (never a model
// guess, law #2). Pure + framework-free (notes-tags.ts), same family as catalog.ts's resolver.
import { matchTags, uniqueTags } from "./notes-tags.ts";
// B3 mail batch archive — matching a visitor's free-text sender phrase against the REAL sender set on
// /mail (never a model guess, law #2). Pure + framework-free (mail-sender.ts), notes-tags.ts's sibling.
import { matchSender } from "./mail-sender.ts";

// B1 contact prefill — the deterministic draft (the visitor's words + a salutation) and the ONE
// registered field surface the desk may fill (never a model-picked selector, law #2). Pure
// (contact-draft.ts), same family as the matchers above.
import { draftMessage, draftSubject, CONTACT_FIELD_SURFACE, CONTACT_SUBJECT_SURFACE } from "./contact-draft.ts";
// D1 form builder demo — the closed-set matcher (field-matcher.ts, "Read first" — the ONE thing that
// decides which fields/choices ever exist) plus the demo values drafted for its TEXT fields only
// (form-draft.ts — never a `choices` item, see that file's own banner on why). KNOWN_FIELD_LABELS/
// KNOWN_CHOICE_LABELS name the closed set honestly when a description matches nothing at all.
import { matchSpec, KNOWN_FIELD_LABELS, KNOWN_MESSAGE_LABELS, KNOWN_CHOICE_LABELS } from "./field-matcher.ts";
import { draftFieldValues, draftCheckStates } from "./form-draft.ts";
// C2 visitor memory — the notepad IS the memory. Write-time sanitize + the one line marker
// (sanitizeMemoryFact, memoryLine) and read-time parseMemories (re-sanitize + cap, for the VISITOR
// NOTES prompt block). Pure (memory.ts), same family as contact-draft.ts.
import { sanitizeMemoryFact, memoryLine, parseMemories } from "./memory.ts";
// A2 guided tour — the fixed, code-enumerated stop list (tour.ts). Zero model: tour-start/tour-stop
// are matched deterministically (actions.ts) and driven from this data, never from the model's own
// judgment of "what's on the site" (CLAUDE.md design law — code enumerates routes, never the model).
import { TOUR_STOPS } from "./tour.ts";
import { SHOWCASE_GOAL } from "./showcase.ts";
// GRAIN's reasoner-kit — the chat bubble markup the desk USED to fork now comes from here (injected
// as deps.kit at runtime; the door URL-

// The desk's ONE capability catalog (capabilities.ts) — what it can see / navigate / operate, built
// from GRAIN's live-DOM manifest + actions.ts's own closed vocabulary. Both the deterministic
// "capabilities" reply below and the model's canDo prompt feed read from this SAME catalog, so they
// can't drift apart into two different-shaped answers to "what can I do here?".
import { buildCapabilityCatalog, catalogPhrases } from "./capabilities.ts";
import { FLAGSHIP_NOTE_SLUG } from "./desk-agent.ts";
import type { DeskRuntime } from "./desk-runtime.ts";
import type { Turn } from "./desk-reasoner.ts";
import { THEME_CLICK_BEAT_MS, MAIL_ARCHIVE_BEAT_MS, CONTACT_FILL_BEAT_MS } from "./desk-timing.ts";
import { esc, navLinkFor, humanizeSeg } from "./desk-text.ts";

import { DOWNLOAD_DECLINED_LINE, loadBar } from "./desk-copy.ts";
export { parseModelChoices, DOWNLOAD_DECLINED_LINE, loadBar } from "./desk-copy.ts";
export { NAV_GLIDE_MS, CONTACT_FILL_BEAT_MS, FORM_FILL_BEAT_MS } from "./desk-timing.ts";
export { suggestChipsHtml } from "./desk-hud.ts";

  // The deterministic turn: every action that needs no model (theme, tours, nav, memory, the
  // showcase, deep-links). It is offline safe, returns a Decision when it claims the turn, and
  // returns null to fall through to the model path. It takes the per-turn Turn and captures deps,
  // profile, rt.lastTarget, ensureEngine and runAgentTurns from the reasoner, the way runAgentTurns does.
  export async function deterministicTurn(rt: DeskRuntime, turn: Turn): Promise<Decision | null> {
  const { deps, profile } = rt;
    const { tools, log, text, action, getCatalog, tourWasActive, showcaseWasActive,
      setBody, setBodyRaw, setChips, offline, modelBlocked, declineModel, narrate, minThink, typeOut, travelAndNavigate } = turn;
      if (action?.kind === "capabilities") {
        const where = deps.pageInfo?.().title;
        // the ONE catalog: everything this page's live manifest reports as operable/readable, plus
        // the desk's own built-in verbs (actions.ts's ACTION_CAPABILITIES) — never a hand-written
        // sentence that can drift from what routeAction and the manifest actually offer.
        const manifest = deps.pageManifest?.();
        const catalog = await getCatalog();
        const phrases = catalogPhrases(buildCapabilityCatalog({ manifest, hasDestinations: catalog.length > 0 }));
        const line = `Here's what I can do${where ? ` from ${where}` : ""}: ${joinPhrases(phrases)} — just ask. Ask me, or tap a chip below. I answer here and narrate my steps in the terminal.`;
        await minThink();
        await typeOut(line);
        setChips([...ACTION_CHIPS, "Take me to GRAIN", "Open the notes"]);
        return { ok: true, ops: [], reply: line };
      }

      // A2 guided tour — stop. Deterministic + offline: an honest line either way, distinguishing a
      // real cancel from "there was nothing to cancel" (tourWasActive was captured above, BEFORE the
      // generic clear a few lines up already cleared the cursor for this very message).
      if (action?.kind === "tour-stop") {
        await minThink();
        const line = (tourWasActive || showcaseWasActive)
          ? "Okay, stopping here. Ask me anything, or wander on your own."
          : "There's nothing running right now.";
        await typeOut(line);
        setChips([...ACTION_CHIPS, "Take me to GRAIN"]);
        return { ok: true, ops: [], reply: line };
      }

      // A2 guided tour — start. Deterministic + offline: the stop list, its copy, and the pacing all
      // come from tour.ts (code, never the model). This reasoner drives only the FIRST leg; every
      // leg after rides the door's own runTourLeg (desk-door.ts) since no chat.send happens between
      // stops — travelAndNavigate's `arrive` stash is what hands the announce across each page load.
      if (action?.kind === "tour-start") {
        if (!deps.navigate) {
          // Matches how open-latest-note degrades when it can't drive the page: an honest decline,
          // no crash, no pretending the tour started.
          await minThink();
          const line = "I can't drive the page from here, so I can't run the tour. Ask me something else instead.";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "no navigate dep" };
        }
        const here = stripSlash(deps.pageInfo?.().route ?? "/");
        const [first, second] = TOUR_STOPS;
        if (!first || !second) return { ok: false, ops: [], reply: "The tour has no stops configured.", reason: "no tour stops" };
        await minThink();
        if (here === stripSlash(first.route)) {
          // Already standing on stop 0 — fold the intro and stop 0's own announce into one typed
          // line (no navigation needed to "arrive" somewhere we already are), then head to stop 1.
          const intro =
            "Gladly. Four quick stops: this front page, GRAIN, BATCH, and the notes. Type anything to " +
            "stop early. You're on the first stop now: TJ's front page, home of the resume and the doors into everything else.";
          await typeOut(intro);
          // tourSet BEFORE travelAndNavigate: navigate tears the page down, so the cursor for the
          // NEXT stop must already be stashed before we leave.
          deps.tourSet?.(1);
          await travelAndNavigate(second.navLink, second.route, second.label, second.announce, "the navigation");
          return { ok: true, ops: [], reply: intro };
        }
        const intro = "Gladly. Four quick stops: the front page, GRAIN, BATCH, and the notes. Type anything to stop early.";
        await typeOut(intro);
        deps.tourSet?.(0);
        await travelAndNavigate(first.navLink, first.route, first.label, first.announce, "the navigation");
        return { ok: true, ops: [], reply: intro };
      }

      // "Watch me work" — the AGENT demo (showcase.ts). Unlike every deterministic action above, this
      // NEEDS the model: nothing moves until it's loaded (the honest fix — no canned animation before
      // the AI exists). Load it with the visible bar, then hand the 0.5B the goal and let IT drive:
      // runAgentTurns loops on this page (the model chooses each action, the harness validates + applies
      // it), and a GO carries the agent state across the load for the door's showcaseResume to continue.
      if (action?.kind === "showcase-start") {
        if (!deps.navigate) {
          await minThink();
          const line = "I can't drive the page from here, so I can't run the demo. Ask me something else instead.";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "no navigate dep" };
        }
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
        // the model is up — settle the load bubble into the kickoff line, then let the agent take over.
        setBody(esc("On it — watch me work. I'll drive the site myself, one step at a time. Type anything to stop me."), "committed");
        deps.showcaseStateSet?.({ goal: SHOWCASE_GOAL, done: [], step: 0 });
        await rt.runAgentTurns(engine, (op) => tools.emit(op));
        return { ok: true, ops: [], reply: "Running the demo." };
      }

      // A4 theme switching — deterministic + offline (zero model, runs before the load like every
      // other action here). The desk drives the SAME visible status-bar buttons a human would
      // (revealNotepad's pattern, no private channel), validating against the LIVE DOM both before
      // deciding what to click and after, to confirm the click actually landed — CLAUDE.md's
      // "validate twice" design law, and the honest thing to do across a demo that runs on every page.
      if (action?.kind === "theme") {
        await minThink();
        if (!deps.themeState || (!deps.clickCycleTheme && !deps.clickToggleScheme)) {
          const line = "I can't reach the theme controls here.";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "no theme deps" };
        }
        const target = action.target;

        if (target === "dark" || target === "light") {
          if (!deps.clickToggleScheme) {
            const line = "I can't reach the theme controls here.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "no toggle-scheme dep" };
          }
          const before = deps.themeState();
          if (before.scheme === target) {
            const line = `It's already ${target} here.`;
            await typeOut(line);
            return { ok: true, ops: [], reply: line };
          }
          narrate("clicks", "the light and dark switch");
          deps.clickToggleScheme();
          const line = `There you go, ${target} mode.`;
          await typeOut(line);
          return { ok: true, ops: [], reply: line };
        }

        if (!deps.clickCycleTheme) {
          const line = "I can't reach the theme controls here.";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "no cycle-theme dep" };
        }

        if (target === "next") {
          narrate("clicks", "the theme control");
          deps.clickCycleTheme();
          const after = deps.themeState();
          const line = `Switched the theme to ${after.flavor}.`;
          await typeOut(line);
          return { ok: true, ops: [], reply: line };
        }

        // a named flavor — validated against the LIVE themes list (not actions.ts's FLAVORS mirror):
        // this page's real data-themes is the truth.
        const state = deps.themeState();
        const targetIdx = state.themes.indexOf(target);
        if (targetIdx < 0) {
          const options = state.themes.length ? joinPhrases(state.themes) : "no themes";
          const line = `The themes here are ${options}. Which one would you like?`;
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "unknown flavor" };
        }
        if (state.flavor === target) {
          const line = `You're already on ${target}.`;
          await typeOut(line);
          return { ok: true, ops: [], reply: line };
        }
        const currentIdx = state.themes.indexOf(state.flavor);
        const clicks = (targetIdx - (currentIdx < 0 ? 0 : currentIdx) + state.themes.length) % state.themes.length;
        narrate("clicks", "the theme control");
        for (let i = 0; i < clicks; i++) {
          deps.clickCycleTheme();
          if (i < clicks - 1) await tools.delay(THEME_CLICK_BEAT_MS);   // let the visitor SEE each flavor step past
        }
        const after = deps.themeState();
        if (after.flavor !== target) {
          const line = "Hmm, that didn't take. Try the theme button up top.";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "click didn't land" };
        }
        const line = `Switched the theme to ${target}.`;
        await typeOut(line);
        return { ok: true, ops: [], reply: line };
      }

      // B2 notes filtering — "show me notes about teaching". Deterministic + offline: match the
      // topic against the REAL tag set (notes-tags.ts, never a model guess — law #2) BEFORE deciding
      // anything about the UI. A miss falls through (no return) to the model path a few lines down —
      // same idiom as the A1 deep-link miss above: the deterministic path only claims the turn when
      // it can actually deliver, so an unmatched topic still gets an honest grounded chat answer
      // instead of a doomed "0 results" filter.
      if (action?.kind === "notes-filter") {
        const notes = (await deps.listNotes?.()) ?? [];
        const matched = matchTags(action.topic, uniqueTags(notes));
        if (matched.length) {
          const tagLabel = joinPhrases(matched);
          const onNotes = !!deps.pageInfo && stripSlash(deps.pageInfo().route) === "/notes";
          if (onNotes) {
            // Already standing on the feed — drive the VISIBLE tag chips a human would tap
            // (revealNotepad's pattern, no private channel), validating twice: only click a tag the
            // live DOM actually carries as a chip, then confirm each click actually checked the box
            // before claiming success (CLAUDE.md's "validate twice" design law).
            await minThink();
            if (!deps.notesTagChips || !deps.clickNotesTag) {
              const line = "I can't reach the tag filter here.";
              await typeOut(line);
              return { ok: false, ops: [], reply: line, reason: "no notes-tag deps" };
            }
            const live = deps.notesTagChips();
            const onPage = matched.filter((t) => live.includes(t));
            if (!onPage.length) {
              const line = `I don't see a "${tagLabel}" tag on this page yet.`;
              await typeOut(line);
              return { ok: false, ops: [], reply: line, reason: "tag not on page" };
            }
            narrate("clicks", "the tag filter");
            const landed = onPage.filter((t) => deps.clickNotesTag!(t));
            if (!landed.length) {
              const line = "Hmm, that didn't take. Try the tag chips above the feed.";
              await typeOut(line);
              return { ok: false, ops: [], reply: line, reason: "click didn't land" };
            }
            const count = deps.visibleNoteCount?.();
            const countBit = count === undefined ? "." : ` — ${count} match${count === 1 ? "" : "es"}.`;
            const line = `Filtering the notes by ${joinPhrases(landed)}${countBit} Tap the chip again to clear.`;
            await typeOut(line);
            return { ok: true, ops: [], reply: line };
          }
          // elsewhere on the site — travel to the filtered feed. The destination island's own
          // applyQueryTags (content.ts) checks the matching chips on load, so there's no extra
          // arrival work here beyond the announce.
          await minThink();
          await typeOut(`The notes have a ${tagLabel} tag — filtering the feed for you.`);
          await travelAndNavigate(
            "/notes", `/notes?tag=${matched.map(encodeURIComponent).join(",")}`, "Notes",
            `Here are the notes tagged ${tagLabel}.`, "the navigation",
          );
          return { ok: true, ops: [], reply: `Filtering notes by ${tagLabel}` };
        }
        // no real tag matched — fall through, no return.
      }

      // B3 mail batch archive — "archive everything from BREAD CI". Deterministic + offline, unlike
      // every OTHER deterministic action above: an archive VERB must never reach the 0.5B (a "no such
      // sender" miss is a hard, honest decline here, not a fall-through to a grounded chat guess —
      // the model has no business inventing whether a sender's mail exists).
      if (action?.kind === "mail-archive") {
        const onMail = !!deps.pageInfo && stripSlash(deps.pageInfo().route) === "/mail";

        if (onMail) {
          await minThink();
          if (!deps.mailSenders || !deps.mailItemsFrom || !deps.archiveMailItem) {
            const line = "I can't reach the mailbox from here.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "no mail deps" };
          }
          // Enumerate the REAL senders off the live inbox rows — never a model guess (law #2) — and
          // match the visitor's raw phrase against them (mail-sender.ts).
          const senders = deps.mailSenders();
          const matched = matchSender(action.sender, senders);
          if (!matched) {
            const known = senders.length ? joinPhrases(senders) : "no one";
            const line = `I don't see any mail from "${action.sender}" in the inbox — the senders here are ${known}.`;
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "no such sender" };
          }
          const items = deps.mailItemsFrom(matched);
          if (!items.length) {
            // Idempotent re-ask: a sender that's real but already fully archived is a normal, honest
            // "nothing to do" — not an error.
            const line = `Nothing from ${matched} left in the inbox.`;
            await typeOut(line);
            return { ok: true, ops: [], reply: line };
          }

          narrate("archives", `the mail from ${matched}`);
          const landed: string[] = [];
          for (const item of items) {
            // Click the row, letting the visitor SEE each letter light up before it moves —
            // MAIL_ARCHIVE_BEAT_MS is the named pace knob (same "validate twice" honesty contract as
            // the A4 theme + B2 notes-tag clicks: the row's OWN data-folder is re-read afterward).
            tools.emit(deps.kit.spotlightOp(item.surface, { active: true, click: true }));
            await tools.delay(MAIL_ARCHIVE_BEAT_MS);
            if (deps.archiveMailItem(item.id)) landed.push(item.id);
          }
          tools.emit(deps.kit.spotlightOp("screen", { active: false }));

          if (!landed.length) {
            const line = "Hmm, that didn't take. Try the Archive button in the reader.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "click didn't land" };
          }
          const n = landed.length;
          const countBit = n === items.length ? `${n}` : `${n} of ${items.length}`;
          const line = `Archived ${countBit} letter${n === 1 ? "" : "s"} from ${matched}. They're in the Archive folder now.`;
          await typeOut(line);
          return { ok: true, ops: [], reply: line };
        }

        // elsewhere on the site — stash the RAW sender phrase and travel to the mailbox; this
        // reasoner instance doesn't survive the navigate (the MPA tears the page down), so the door's
        // OWN cross-page task (desk-door.ts, runMailTask) does the matching + archiving once the
        // mailbox settles, using the SAME matchSender + MAIL_ARCHIVE_BEAT_MS this branch would.
        if (deps.mailTaskSet && deps.navigate) {
          await minThink();
          const line = `Heading to the mail panel to archive the mail from ${action.sender}.`;
          await typeOut(line);
          deps.mailTaskSet(action.sender);   // stash BEFORE navigating — the navigate tears this down
          await travelAndNavigate("/mail", "/mail", "Mail", "Here's the mailbox.", "the navigation");
          return { ok: true, ops: [], reply: line };
        }
        await minThink();
        const line = "I can't reach the mailbox from here.";
        await typeOut(line);
        return { ok: false, ops: [], reply: line, reason: "no mail deps" };
      }

      // B1 contact prefill — "tell TJ I want to talk about grain". Deterministic + offline: the
      // draft is the visitor's own words (contact-draft.ts, never the 0.5B), the target is the ONE
      // registered field named in code (law #2), and the fill goes through grain's field.set/`fill`
      // op — so Send stays the visitor's alone (no submit verb exists to call).
      if (action?.kind === "contact-message") {
        const draft = draftMessage(action.message);
        if (!draft) {
          await minThink();
          const line = "What would you like the message to say?";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "empty draft" };
        }
        const onMail = !!deps.pageInfo && stripSlash(deps.pageInfo().route) === "/mail";

        if (onMail) {
          await minThink();
          if (!deps.openCompose || !deps.contactFieldValue) {
            const line = "I can't reach the compose panel from here.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "no contact deps" };
          }
          // Open the SAME compose panel a human would (the visible ✎ Compose button), and only
          // fill a panel that actually opened — validate before, not just after.
          if (!deps.openCompose()) {
            const line = "Hmm, the compose panel won't open here. Try the ✎ Compose button.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "compose didn't open" };
          }
          narrate("drafts", "a message in the compose panel");
          tools.emit(deps.kit.spotlightOp(CONTACT_FIELD_SURFACE, { active: true }));
          await tools.delay(CONTACT_FILL_BEAT_MS);
          // The subject first, best-effort: a subject that will not fill never blocks the body.
          const subject = draftSubject(action.message);
          if (subject) { try { tools.emit(deps.kit.fillOp(CONTACT_SUBJECT_SURFACE, subject)); } catch { /* optional */ } }
          try {
            tools.emit(deps.kit.fillOp(CONTACT_FIELD_SURFACE, draft));
          } catch {
            // fillOp throws at compose time on an unsafe value (over grain's cap / control chars) —
            // decline honestly rather than letting a too-long ask die silently at the dispatcher.
            tools.emit(deps.kit.spotlightOp("screen", { active: false }));
            const line = "That message is too long for me to draft — shorten it and I'll fill it in.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "unsafe draft value" };
          }
          await tools.delay(CONTACT_FILL_BEAT_MS);
          tools.emit(deps.kit.spotlightOp("screen", { active: false }));
          // Validate twice: the field's OWN value must read the draft back, or the fill didn't land.
          if (deps.contactFieldValue() !== draft) {
            const line = "Hmm, that didn't take — the message field stayed empty. Try typing it in.";
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "fill didn't land" };
          }
          const line = "Drafted your message in the compose panel — read it over, edit anything, and hit Send. Sending stays yours.";
          await typeOut(line);
          return { ok: true, ops: [], reply: line };
        }

        // elsewhere on the site — stash the ALREADY-DRAFTED message and travel to the mailbox; this
        // reasoner instance doesn't survive the navigate (the MPA tears the page down), so the
        // door's own cross-page task (desk-door.ts, runContactTask) opens the compose and fills the
        // same field once /mail settles, at the same CONTACT_FILL_BEAT_MS pace.
        if (deps.contactTaskSet && deps.navigate) {
          await minThink();
          if (!deps.contactTaskSet(draft)) {
            const line = `I couldn't save this draft for the next page, so I stayed here. Copy this message into Mail:\n\n${draft}`;
            await typeOut(line);
            return { ok: false, ops: [], reply: line, reason: "contact draft persistence failed" };
          }
          const line = "Heading to the mail panel to draft that for you — you'll review and send it.";
          await typeOut(line);
          await travelAndNavigate("/mail", "/mail", "Mail", "Here's the compose panel.", "the navigation");
          return { ok: true, ops: [], reply: line };
        }
        await minThink();
        const line = "I can't reach the compose panel from here.";
        await typeOut(line);
        return { ok: false, ops: [], reply: line, reason: "no contact deps" };
      }

      // D1 form builder demo — "build me a form that asks for a name and an email". Deterministic +
      // offline: matchSpec (field-matcher.ts) is the ONE thing that ever decides which fields/choices
      // exist — this handler never picks a field itself (law #2). Unlike B1/B3, there's no on-page
      // branch: /grain/builder renders from its OWN query string on a plain GET, so every ask is a fresh
      // navigation, even when the visitor is already standing on /grain/builder.
      if (action?.kind === "form-build") {
        const spec = matchSpec(action.description);
        await minThink();
        if (!spec.fields.length && !spec.messages.length && !spec.choices.length) {
          // Nothing matched at all — an honest decline naming the REAL closed set, never a vague
          // "I don't understand". An action verb never falls through to the model.
          const known = joinPhrases([...KNOWN_FIELD_LABELS, ...KNOWN_MESSAGE_LABELS, ...KNOWN_CHOICE_LABELS]);
          const line = spec.unsupported.length
            ? `I can't build that yet. ${spec.unsupported.map((u) => u.reason).join(" ")} I can add ${known}.`
            : `I build forms from a fixed list of fields, and nothing in that asked for one of them. I can add ${known}.`;
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "no fields matched" };
        }
        if (!deps.navigate) {
          const line = "I can't navigate from here, so I can't build the form. Ask me something else instead.";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "no navigate dep" };
        }
        const href = `/grain/builder?ask=${encodeURIComponent(action.description)}`;
        // Every control the dispatcher can TYPE into: the text fields and the message box, which is
        // a textarea and travels the same fill path. Never a `choices` item — see form-draft.ts.
        const values = draftFieldValues([...spec.fields, ...spec.messages]);
        // The tick boxes, and they are drafted separately because they take check.set rather than
        // field.set: a tick box's value is what the form submits, not whether it is ticked.
        const checks = draftCheckStates(spec.checks);
        const line = "Building that form now, and I'll fill in a few demo values so you can see it live.";
        await typeOut(line);
        if (Object.keys(values).length || Object.keys(checks).length) {
          deps.formTaskSet?.({ values, checks });   // stash BEFORE navigating
        }
        await travelAndNavigate("/grain/builder", href, "Builder", "Here's the form.", "the navigation");
        return { ok: true, ops: [], reply: line };
      }

      // C2 visitor memory — "remember I'm here about grain". Deterministic + offline, like every
      // action above: an action verb has no model tail (B3's archive, B1's draft — same idiom), so
      // this never touches the engine. The 0.5B never composes or edits the fact — memory.ts's
      // write-time sanitize is the only cleanup the visitor's own words get, and an over-cap or
      // now-empty (protocol-tokens-only) fact is an honest DECLINE, never a silent truncation
      // (fillOp's "too long to draft" precedent). Manifest-guarded on note.append, note-write's own
      // guard, since v1 assumes the notepad is in the frame everywhere but never trusts that blindly.
      if (action?.kind === "memory-set") {
        const hasNotepad = !!deps.pageManifest?.().targets.some((tt) => tt.accepts.includes("note.append"));
        await minThink();
        if (!hasNotepad) {
          const line = "I don't see a notepad here to remember that on.";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "no notepad surface" };
        }
        const fact = sanitizeMemoryFact(action.fact);
        if (!fact) {
          const line = "That's too long (or nothing at all) for me to remember as one fact — try something shorter and plainer.";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "empty or over-cap fact" };
        }
        narrate("writes", "a memory to the notepad");
        tools.emit(deps.kit.noteAppendOp(memoryLine(fact), "ai"));
        tools.emit(deps.kit.spotlightOp("notepad", { active: true }));
        deps.revealNotepad?.();
        const line = "Noted on your pad — it's yours to edit or remove.";
        await typeOut(line);
        await tools.delay(1400);
        tools.emit(deps.kit.spotlightOp("screen", { active: false }));
        return { ok: true, ops: [], reply: line };
      }

      // C2 visitor memory — read the marked facts straight from the visitor's notepad. This is a
      // structured lookup, not a language task: do not load the model to paraphrase personal notes.
      if (action?.kind === "memory-read") {
        const memories = parseMemories(deps.padMarkdown?.() ?? "");
        await minThink();
        const line = memories.length
          ? `I have this saved from what you told me: ${memories.map((fact) => `“${fact}”`).join("; ")}. It's on your notepad, where you can edit or remove it.`
          : "I don't have any Desk memories saved yet. Tell me “remember …” and I'll add it to your notepad.";
        deps.revealNotepad?.();
        tools.emit(deps.kit.spotlightOp("notepad", { active: true }));
        await typeOut(line);
        await tools.delay(1400);
        tools.emit(deps.kit.spotlightOp("screen", { active: false }));
        return { ok: true, ops: [], reply: line };
      }

      // Stable questions about the portfolio's author and the desk runtime have exact, authored
      // answers in facts.md. Reading the named section avoids asking a small model to reconstruct
      // public profile details or invent implementation claims from a partial retrieval result.
      if (action?.kind === "portfolio-faq") {
        const knowledge = await deps.loadKnowledge();
        const heading = action.topic === "bio" ? "Who is TJ?" : "How does the desk work under the hood?";
        const chunk = knowledge.chunks.find((item) => item.route === FACTS_ROUTE && item.heading === heading);
        await minThink();
        if (!chunk) {
          const line = "I don't have that information on hand. The About page has the current details.";
          await typeOut(line);
          return { ok: false, ops: [], reply: line, reason: "authored FAQ section missing" };
        }
        const line = chunk.text.split(/(?<=[.!?])\s+/).slice(0, action.topic === "bio" ? 2 : 3).join(" ");
        await typeOut(line);
        return { ok: true, ops: [], reply: line };
      }

      // C2 visitor memory — "forget what you know about me". Deterministic + offline: the desk
      // NEVER deletes or edits pad content — that's the one irreversible AI action this whole
      // feature is built to avoid (noteReplaceOp could nuke the visitor's OWN notes right alongside
      // any memory line — rejected in the plan). So this is a fixed, code-authored explanation
      // pointing at the pad, never a model reply: forgetting is the visitor deleting the line.
      if (action?.kind === "memory-forget") {
        await minThink();
        tools.emit(deps.kit.spotlightOp("notepad", { active: true }));
        deps.revealNotepad?.();
        const line = "I don't delete anything on your pad. Everything I remember lives there as a " +
          "“Desk memory” line — delete that line and I forget it too.";
        await typeOut(line);
        await tools.delay(1400);
        tools.emit(deps.kit.spotlightOp("screen", { active: false }));
        return { ok: true, ops: [], reply: line };
      }

      // C1 visitor-intent onboarding — the ASK. Deterministic + offline, like every action above: the
      // router only recognized the TRIGGER (a greeting or an explicit "who's visiting" ask); whether
      // to actually present the choices is THIS stateful call — the nag-guard. Ask at most once a
      // session, and never again once an intent is already set: either way, a repeat trigger falls
      // through to the ordinary CLARIFY bubble (same prompt/choiceGroup shape as the "clarify" branch
      // just below) rather than a silent no-op, so a second "hi" still gets a useful deterministic
      // answer instead of nothing.
      if (action?.kind === "intent-ask") {
        const alreadyAsked = deps.intentAsked?.() ?? false;
        const alreadyAnswered = !!deps.intentGet?.();
        await minThink();
        if (alreadyAsked || alreadyAnswered) {
          setBodyRaw(esc(CLARIFY_PROMPT) + deps.kit.choiceGroup(log, CLARIFY_CHOICES), "committed");
          return { ok: true, ops: [], reply: CLARIFY_PROMPT };
        }
        deps.intentMarkAsked?.();   // mark BEFORE rendering — a mid-render throw still counts as "asked"
        setBodyRaw(esc(INTENT_PROMPT) + deps.kit.choiceGroup(log, INTENT_CHOICES), "committed");
        return { ok: true, ops: [], reply: INTENT_PROMPT };
      }

      // C1 visitor-intent onboarding — the ANSWER. Deterministic + offline: each branch is a fixed,
      // code-authored effect (never model prose) per the roadmap's shape. The intent itself NEVER
      // reaches buildPrompt or any model message — it only biases a CODE-CHOSEN chip pool
      // (pickFollowups' intent param, below), so the injection surface stays at zero.
      if (action?.kind === "intent-set") {
        deps.intentSet?.(action.intent);

        // C2 visitor memory tie-in (plan default: YES) — consent IS answering the ask, so the
        // stated intent becomes a visible memory line from the visitor's very first interaction.
        // SILENT: no extra chat line beyond what intent-set already says below, and manifest-guarded
        // the same honest way memory-set is above (no notepad here ⇒ no write, never a crash).
        if (deps.pageManifest?.().targets.some((tt) => tt.accepts.includes("note.append")))
          tools.emit(deps.kit.noteAppendOp(memoryLine(`visiting as a ${action.intent}`), "ai"));

        if (action.intent === "recruiter") {
          const onResume = !!deps.pageInfo && stripSlash(deps.pageInfo().route) === "/resume";
          await minThink();
          if (onResume) {
            // Already there — no navigation, just spotlight the role board in place (the A1 deep-link
            // same-page idiom: spotlight first, a beat to let it register, then release).
            const line = "Recruiter mode. You're already on the résumé — here's the role board.";
            await typeOut(line);
            setChips(["Summarize TJ's experience", "Open the flagship note", "What did TJ build?"]);
            tools.emit(deps.kit.spotlightOp("role-board", { active: true }));
            await tools.delay(1500);
            tools.emit(deps.kit.spotlightOp("screen", { active: false }));
            return { ok: true, ops: [], reply: line };
          }
          const line = "Recruiter mode. Taking you to TJ's résumé.";
          await typeOut(line);
          // setChips is deliberately SKIPPED here: this branch navigates (a real MPA page load), and
          // site.js's setDefaultChips() unconditionally rebuilds [data-suggest-chips] from the static
          // per-page starter set on every fresh load — verified the chip row does NOT survive a
          // navigate (unlike the chat log / terminal, which persist via localStorage). A pre-navigate
          // setChips call here would just be overwritten a moment later, so the recruiter pool instead
          // reaches the visitor through pickFollowups' intent bias, the first time they chat again
          // after arriving (see the grounded-chat and fuzzy-nav-miss call sites below).
          await travelAndNavigate(
            "/resume", "/resume", "Résumé", "Here's TJ's résumé — recruiter view.",
            "the navigation", "role-board",
          );
          return { ok: true, ops: [], reply: line };
        }

        if (action.intent === "developer") {
          // No navigation — just an offer + chips leaning /grain, /batch, docs (the A2 tour and the
          // catalog resolve every one of these deterministically, so tapping a chip never touches the
          // model either).
          await minThink();
          const line = "Developer mode. Want the guided tour of the stack, or straight to GRAIN or the BATCH docs?";
          await typeOut(line);
          setChips(["Take the tour", "Take me to GRAIN", "Open the BATCH docs"]);
          return { ok: true, ops: [], reply: line };
        }

        // student — the B2 path: match "teaching" against the REAL tag set (never hardcode the tag
        // itself, law #2), so this still degrades honestly if a future content pass ever drops it.
        const notes = (await deps.listNotes?.()) ?? [];
        const matched = matchTags("teaching", uniqueTags(notes));
        await minThink();
        if (matched.length) {
          const tagLabel = joinPhrases(matched);
          const line = "Student mode. Here are TJ's notes on teaching.";
          await typeOut(line);
          await travelAndNavigate(
            "/notes", `/notes?tag=${matched.map(encodeURIComponent).join(",")}`, "Notes",
            `Here are the notes tagged ${tagLabel}.`, "the navigation",
          );
          return { ok: true, ops: [], reply: line };
        }
        // No real "teaching" tag exists (yet) — degrade to the plain notes feed rather than a doomed
        // empty-tag filter, the same "claim only what the deterministic path can deliver" idiom B2's
        // own no-match branch follows above.
        const line = "Student mode. Here are TJ's notes.";
        await typeOut(line);
        await travelAndNavigate("/notes", "/notes", "Notes", "Here are the notes.", "the navigation");
        return { ok: true, ops: [], reply: line };
      }

      if (action?.kind === "clarify") {
        // Deterministic + offline: one clean bubble — the prompt with the choice buttons under it.
        // choiceGroup (trusted, self-escaping) goes INSIDE the body so it's a single message; the
        // dispatcher still resolves the group pick-once (keyed on [data-choices], not the op kind).
        await minThink();
        setBodyRaw(esc(action.prompt) + deps.kit.choiceGroup(log, action.choices), "committed");
        return { ok: true, ops: [], reply: action.prompt };
      }

      if (action?.kind === "open-latest-note") {
        const notes = (await deps.listNotes?.()) ?? [];
        const target = notes[0];
        if (target && deps.navigate) {
          await minThink();
          await typeOut(`Opening the latest note, “${target.title}”.`);
          rt.lastTarget = { route: target.route, label: target.title };
          await travelAndNavigate("/notes", target.route, "Notes", `Here's the latest note, “${target.title}”.`, "the notebook");
          return { ok: true, ops: [], reply: `Opening ${target.title}` };
        }
        setBody(esc("I couldn't reach the notebook just now."), "committed");
        return { ok: false, ops: [], reply: "notes unavailable", reason: "notes unavailable" };
      }

      // the flagship note — a FIXED, hand-pinned note (FLAGSHIP_NOTE_SLUG), the sibling of
      // open-latest-note: zero model, drive the page straight to it. The title comes off the live
      // notes list (never hardcoded here) so it can't drift from what /notes actually renders; a
      // missing entry falls back to the known title rather than an empty quote.
      if (action?.kind === "open-flagship-note") {
        const route = `/notes/${FLAGSHIP_NOTE_SLUG}`;
        if (deps.navigate) {
          const notes = (await deps.listNotes?.()) ?? [];
          const target = notes.find((n) => stripSlash(n.route) === stripSlash(route));
          const title = target?.title ?? "Ten Times Zero Is Still Zero";
          await minThink();
          await typeOut(`Opening the flagship note, “${title}”.`);
          rt.lastTarget = { route, label: title };
          await travelAndNavigate("/notes", route, "Notes", `Here's the flagship note, “${title}”.`, "the notebook");
          return { ok: true, ops: [], reply: `Opening ${title}` };
        }
        setBody(esc("I couldn't reach the notebook just now."), "committed");
        return { ok: false, ops: [], reply: "notes unavailable", reason: "notes unavailable" };
      }

      // A1 "show me the part about X" (deep-link answers) — deterministic + offline-safe, like every
      // action above: retrieve action.query against the corpus and, ONLY when the top hit actually
      // carries a rendered heading anchor (the MILL contract — Chunk.anchor / data-surface="anchor:*"),
      // jump straight to that section instead of answering in prose. A facts-route hit doesn't count
      // (there's no real heading to land on) — filtered out below. A MISS is deliberately NOT settled
      // here: the deterministic path only claims the turn when it can actually deliver, so an
      // ungrounded ask falls straight through to the normal model path a few lines down (still a real,
      // grounded chat answer — just not a jump).
      if (action?.kind === "deep-link") {
        const knowledge = await deps.loadKnowledge().catch(() => null);
        const hit = knowledge
          ? retrieve(action.query, knowledge, 3).find((c) => c.route !== FACTS_ROUTE && c.anchor)
          : undefined;
        if (hit) {
          const heading = hit.heading || hit.title;
          const onThisPage = deps.pageInfo && stripSlash(deps.pageInfo().route) === stripSlash(hit.route);
          if (onThisPage) {
            // already here — no navigation, just find + spotlight the section in place.
            narrate("finds", heading);
            await minThink();
            const line = `That's under “${heading}”, right on this page.`;
            await typeOut(line);
            // Spotlight FIRST, scroll second: activating the lamp raises the shell's acting chrome,
            // and a smooth scroll started before that layout settles animates to a stale target
            // (measured ~158px short). The lamp follows its surface through the scroll by design
            // (ai-spotlight.js), so lighting an off-screen section then gliding to it is the
            // intended choreography. A missing anchor makes both ops no-op finds — harmless.
            tools.emit(deps.kit.spotlightOp(`anchor:${hit.anchor}`, { active: true }));
            await tools.delay(120);   // let the acting-chrome layout settle before measuring the scroll target
            if (deps.scrollToAnchor?.(hit.anchor!)) await tools.delay(1500);
            tools.emit(deps.kit.spotlightOp("screen", { active: false }));
            return { ok: true, ops: [], reply: line };
          }
          // elsewhere on the site — travel there, but land the lamp ON the section: the arrival stash
          // carries the anchor, and desk-door's runArrival scrolls to it before the spotlight fires.
          const navLink = navLinkFor(hit.route);
          await minThink();
          const line = `That's under “${heading}” in “${hit.title}”. Taking you there.`;
          await typeOut(line);
          rt.lastTarget = { route: hit.route, label: hit.title };
          await travelAndNavigate(
            navLink, hit.route, humanizeSeg(navLink),
            `Here's the part about “${heading}”, from “${hit.title}”.`, "the navigation",
            `anchor:${hit.anchor}`, hit.anchor,
          );
          return { ok: true, ops: [], reply: line };
        }
        // no usable hit — fall through (no return): the model path below still gets a shot at it.
      }

      // Deterministic navigation over the REAL sitemap catalog (catalog.ts resolveNav) — runs before
      // the model even loads, so "take me to X" navigates instantly, offline of the model, and only
      // ever to a route that exists. Not a hardcoded alias table: the catalog is the live sitemap, so
      // it scales with the site. A confident match navigates; anything fuzzier falls to the model tail
      // below (which gets a real-route shortlist), and an unrecognized place to an honest chat reply.
      if (!action && deps.navigate) {
        const catalog = await getCatalog();
        const dest = resolveNav(text, catalog);
        if (dest) {
          await minThink();
          await typeOut(`Taking you to ${dest.label}.`);
          rt.lastTarget = { route: dest.route, label: dest.label };
          await travelAndNavigate(dest.route, dest.route, dest.label, `Here's ${dest.label}.`, "the navigation");
          return { ok: true, ops: [], reply: `Navigating to ${dest.label}` };
        }
      }

    return null;
  };

  // The model turn: load the local model (after the visitor agrees to the download), then summarize, write
  // to the notepad, or answer a grounded chat. There is no stub fallback: an unavailable or failed
  // model marks the desk offline.
