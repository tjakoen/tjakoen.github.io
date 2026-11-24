// portfolio/src/ai/desk-agent.ts — the "Watch me work" agent loop and the context it is given.
//
// Split out of desk-reasoner.ts. The loop is shared by showcase-start (through tools.emit) and
// showcaseResume (through the door's applyOp), so `emit` is its only I/O; `rt` carries the deps and
// the model profile.
import type { RenderOp } from "@tjakoen/grain/ai/contract.ts";
import type { DeskRuntime } from "./desk-runtime.ts";
import type { DeskDeps } from "./desk-reasoner.ts";
import type { DeskEngine } from "./webllm-loader.ts";
import type { NavDest } from "./catalog.ts";
import type { AgentContext } from "./showcase.ts";
import { SHOWCASE_STEP_CAP, SHOWCASE_MAX_MISSES, validateToolCall, buildAgentSystemPrompt, nextStepCommand, recordDone, parseToolCall, resolveAnchor } from "./showcase.ts";
import { suggestChipsHtml } from "./desk-hud.ts";
import { CONTACT_FILL_BEAT_MS, NAV_GLIDE_MS } from "./desk-timing.ts";
import { CONTACT_FIELD_SURFACE } from "./contact-draft.ts";

// The flagship note's slug — the ONE hand-pinned note. Source of truth: content.ts FLAGSHIP_NOTE_SLUG.
export const FLAGSHIP_NOTE_SLUG = "ten-times-zero";
  // ---- "Watch me work" AGENT loop. The 0.5B drives the site itself: each turn it emits ONE tool call,
  // the harness validates it against the live page (routes/anchors must be real; law #2), applies the
  // real op, records it, and advances. A GO ends the on-page loop (stash state + navigate; the door's
  // showcaseResume re-hydrates on arrival). Shared by showcase-start (via tools.emit) and showcaseResume
  // (via the door's applyOp), so `emit` is the only I/O it takes. Not a canned animation — nothing runs
  // until the model is loaded, and every action is the model's own choice. ----
export const agentDelay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
export const AGENT_MAX_TOKENS = 64;   // one action line (a NOTE/DRAFT sentence at most)

export async function buildAgentContext(deps: DeskDeps): Promise<AgentContext> {
    const catalog = deps.loadCatalog ? await deps.loadCatalog().catch(() => [] as NavDest[]) : [];
    const info = deps.pageInfo?.() ?? { route: "/", title: "" };
    const manifest = deps.pageManifest?.();
    const hasNotepad = !!manifest?.targets.some((tt) => tt.accepts.includes("note.append"));
    // CURATE the routes the agent may choose from: the whole sitemap would drown the 0.5B's tiny window,
    // so offer only the top-level sections (depth ≤ 1) plus the flagship note the goal calls for. The
    // list stays short + coherent, and validateToolCall pins GO to exactly this set.
    const seg = (r: string): number => (r.replace(/\/+$/, "") || "/").split("/").filter(Boolean).length;
    const flagshipRoute = `/notes/${FLAGSHIP_NOTE_SLUG}`;
    const routes = catalog.filter((d) => seg(d.route) <= 1 || (d.route.replace(/\/+$/, "") || "/") === flagshipRoute);
    // Keep the anchor list SHORT (a 0.5B drowns in a dozen slugs), and float the goal's key section to
    // the front so "HIGHLIGHT 1" (what the next-step hint suggests) lands on the part that matters.
    const KEY_ANCHOR = "the-one-number-that-matters";
    const rawAnchors = deps.pageAnchors?.() ?? [];
    const anchors = (rawAnchors.includes(KEY_ANCHOR) ? [KEY_ANCHOR, ...rawAnchors.filter((a) => a !== KEY_ANCHOR)] : rawAnchors).slice(0, 6);
    return {
      route: info.route,
      title: info.title || info.route,
      routes,
      anchors,
      hasNotepad,
      hasContact: deps.hasContactField?.() ?? false,
    };
  }

export async function runAgentTurns(rt: DeskRuntime, engine: DeskEngine, emit: (op: RenderOp) => void): Promise<void> {
  const { deps, profile } = rt;
    const say = (text: string): void =>
      emit({ target: "chat-log", op: "append", provenance: "ai", commit: "committed",
        html: deps.kit.chatBubble("ai", "grain", deps.kit.chatBody(deps.kit.esc(text)), "Desk") });
    const finish = (text: string): void => {
      emit(deps.kit.spotlightOp("screen", { active: false }));
      say(text);
      deps.showcaseClear?.();
      emit({ target: "suggest-chips", op: "replace", provenance: "ai", commit: "committed",
        html: suggestChipsHtml(["Take me to the flagship note", "What is GRAIN?"]) });
    };
    const strip = (r: string): string => r.replace(/\/+$/, "") || "/";

    const ctx = await buildAgentContext(rt.deps);
    let misses = 0;
    for (;;) {
      const state = deps.showcaseStateGet?.() ?? null;
      if (!state) return;   // cancelled ("type anything to stop") or finished
      if (state.step >= SHOWCASE_STEP_CAP) { finish("That's the demo — I drove the site end to end. Ask me anything, or explore on your own."); return; }

      // One agent turn, in up to two passes. Pass 1: the model chooses FREELY (a bare imperative cue —
      // never a question, which the 0.5B parroted back as chatter). Pass 2, only if pass 1 was invalid:
      // a HARDENED retry that asks it to output exactly the suggested command. The mechanical steps
      // (GO/HIGHLIGHT/DONE) don't need the model's judgment, so a malformed one shouldn't wedge the demo;
      // the authored steps (NOTE/DRAFT) seed a coherent line the model keeps or replaces. The model still
      // drives when it produces valid output — the forced pass is a floor, not a script.
      const runPass = async (user: string, temp: number): Promise<string> => {
        let raw = "";
        for await (const delta of deps.streamChat(engine, [
          { role: "system", content: buildAgentSystemPrompt(state, ctx) },
          { role: "user", content: user },
        ], { maxTokens: AGENT_MAX_TOKENS, temperature: temp, topP: profile.topP,
          frequencyPenalty: profile.frequencyPenalty, presencePenalty: profile.presencePenalty })) raw += delta;
        return raw;
      };
      let call: ReturnType<typeof parseToolCall>;
      let check: ReturnType<typeof validateToolCall>;
      try {
        const raw1 = await runPass("Reply now with one action line.", 0.2);
        call = parseToolCall(raw1);
        check = validateToolCall(call, ctx);
        if (!check.ok) {
          const forced = nextStepCommand(state, ctx);
          const raw2 = await runPass(`Output exactly this line and nothing else:\n${forced}`, 0);
          call = parseToolCall(raw2);
          check = validateToolCall(call, ctx);
        }
      } catch (err) {
        console.error("[desk] agent turn failed", err);
        finish("Something interrupted the demo — ask me anything, or try again.");
        return;
      }

      if (!check.ok) {
        // even the forced pass failed — feed the reason back, bounded so a weak model can't spin forever.
        misses++;
        deps.showcaseStateSet?.({ ...state, done: recordDone(state.done, `rejected ${call.kind}: ${check.why}`) });
        if (misses >= SHOWCASE_MAX_MISSES) { finish("I'll wrap the demo up there. Ask me anything, or explore on your own."); return; }
        continue;
      }
      misses = 0;

      if (call.kind === "done") { finish("That's me — one AI driving the whole site through the same door you use. Ask me anything."); return; }

      if (call.kind === "highlight") {
        const id = resolveAnchor(call.anchor, ctx.anchors)!;   // validated above, so it resolves
        say("Here's the part that matters.");
        emit(deps.kit.narrateOp("finds", `the "${id}" section`));
        emit(deps.kit.spotlightOp(`anchor:${id}`, { active: true }));
        await agentDelay(120);
        deps.scrollToAnchor?.(id);
        await agentDelay(1500);
        emit(deps.kit.spotlightOp("screen", { active: false }));
        deps.showcaseStateSet?.({ ...state, done: recordDone(state.done, `HIGHLIGHT ${id}`), step: state.step + 1 });
        continue;
      }

      if (call.kind === "note") {
        say("Saving a takeaway to your notepad.");
        emit(deps.kit.narrateOp("writes", "a takeaway to the notepad"));
        emit(deps.kit.noteAppendOp(call.text, "ai"));
        deps.revealNotepad?.();
        emit(deps.kit.spotlightOp("notepad", { active: true }));
        await agentDelay(1400);
        emit(deps.kit.spotlightOp("screen", { active: false }));
        deps.showcaseStateSet?.({ ...state, done: recordDone(state.done, `NOTE ${call.text}`), step: state.step + 1 });
        continue;
      }

      if (call.kind === "draft") {
        // open the visible compose panel, spotlight the ONE registered field, fill it — never submit.
        if (deps.openCompose?.()) {
          say("Drafting a message to TJ — I'll fill it, but sending stays yours.");
          emit(deps.kit.narrateOp("drafts", "a message to TJ (never sent)"));
          emit(deps.kit.spotlightOp(CONTACT_FIELD_SURFACE, { active: true }));
          await agentDelay(CONTACT_FILL_BEAT_MS);
          try { emit(deps.kit.fillOp(CONTACT_FIELD_SURFACE, call.text)); }
          catch (err) { console.error("[desk] agent draft rejected", err); }
          await agentDelay(1200);
          emit(deps.kit.spotlightOp("screen", { active: false }));
        }
        deps.showcaseStateSet?.({ ...state, done: recordDone(state.done, `DRAFT ${call.text}`), step: state.step + 1 });
        continue;
      }

      // GO: the only tool that ends the page. Record + stash BEFORE navigating (the navigate tears the
      // page down), run the same lamp-to-nav choreography the reasoner's own navigation uses, then hand
      // off — the door's showcaseResume picks the loop back up on the destination page.
      if (call.kind === "go") {
        const dest = ctx.routes.find((d) => strip(d.route) === strip(call.route))!;
        deps.showcaseStateSet?.({ ...state, done: recordDone(state.done, `GO ${dest.route}`), step: state.step + 1 });
        emit(deps.kit.narrateOp("clicks", dest.label));
        deps.revealNav?.(dest.route);
        emit(deps.kit.spotlightOp(`nav:${dest.route}`, { active: true, click: true }));
        await agentDelay(NAV_GLIDE_MS);
        deps.navigate?.(dest.route);
        return;
      }
    }
  }
