// /app/routes/ai-routes.ts — the AI interaction surface:
//   GET  /ui/loop          initial card list (htmx loads it; the demo screen)
//   POST /intent           THE ONE DOOR — every human/AI interaction enters here
//   GET  /stream           per-session SSE channel (server→client push)
//   GET  /ai/manifest      the AI's instruction manual for a screen
import type { TaskService } from "../demo/services/task-service.ts";
import type { Stream } from "@tjakoen/batch/http/stream.ts";
import type { Accepts } from "@tjakoen/grain/ai/accepts.ts";
import type { InteractionLayer } from "@tjakoen/grain/ai/interaction-layer.ts";
import type { Intent, ActionName } from "@tjakoen/grain/ai/contract.ts";
import { isAction, actionsForKind, surface } from "@tjakoen/grain/ai/contract.ts";
import { LoopCard } from "../demo/view/components.ts";
import { toLoopCardView } from "../demo/services/task-views.ts";
import { buildManifest, type ManifestTarget } from "@tjakoen/grain/ai/manifest.ts";

const htmlFragment = (s: string, status = 200) =>
  new Response(s, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });

// A well-formed Intent, or null. The door never trusts the client's shape.
// PROVENANCE: the HTTP door is the HUMAN/external entrance, so an intent arriving here is
// ALWAYS `source:"user"` — the client's own `source` field is ignored (it can't self-declare
// as the AI and earn the "desk is acting" spotlight). A genuine AI/worker actor raises its
// intent IN-PROCESS via layer.handleIntent({ source:"ai", … }), never over the wire.
function parseIntent(b: unknown, sessionFallback: string): Intent | null {
  if (b == null || typeof b !== "object") return null;
  const o = b as Record<string, unknown>;
  if (typeof o.surface !== "string" || typeof o.action !== "string") return null;
  if (!isAction(o.action)) return null;
  return {
    source: "user",   // stamped at the door; never taken from the client (see above)
    session: typeof o.session === "string" && o.session ? o.session : sessionFallback,
    screen: typeof o.screen === "string" ? o.screen : "",
    surface: o.surface,
    action: o.action,
    payload: o.payload && typeof o.payload === "object" ? (o.payload as Record<string, unknown>) : {},
  };
}

export function buildAiRoutes(service: TaskService, stream: Stream, layer: InteractionLayer, accepts: Accepts) {
  return {
    "/ui/loop": {
      GET: async () => {
        // demo fixtures (ITM-demo-*) are the /loop showcase's own cards, not user tasks —
        // keep them out of the list so each item surface address stays unique on the page.
        const tasks = (await service.listTasks()).filter((t) => !t.id.startsWith("ITM-demo"));
        const cards = await Promise.all(tasks.map((t) => LoopCard(toLoopCardView(t))));
        return htmlFragment(cards.join("") || `<p class="muted">No tasks.</p>`);
      },
    },

    "/intent": {
      POST: async (req: Request) => {
        let body: unknown;
        try { body = await req.json(); } catch { return Response.json({ error: "invalid JSON" }, { status: 400 }); }
        const intent = parseIntent(body, "anon");
        if (!intent) return Response.json({ error: "invalid intent" }, { status: 400 });
        // Fire-and-forget: the door acknowledges immediately; the confirmation (or
        // rollback) lands over SSE. That's the proof the push channel is real.
        void layer.handleIntent(intent).catch((e) => console.error("[/intent]", e));
        return new Response(null, { status: 202 });
      },
    },

    "/stream": {
      GET: (req: Request) => {
        const session = new URL(req.url).searchParams.get("session") ?? "anon";
        return stream.subscribe(session);
      },
    },

    "/ai/manifest": {
      GET: async (req: Request) => {
        const screen = new URL(req.url).searchParams.get("screen") ?? "loop";
        const tasks = await service.listTasks();
        // accepts are DERIVED, never hand-typed (AI-INTERFACE §4):
        //  - regions: inverted from the action registry (actionsForKind)
        //  - items: harvested from the loop-card component (data-accepts), narrowed by state
        const itemAccepts = (accepts.byKind()["item"] ?? []) as ActionName[];
        const targets: ManifestTarget[] = [
          { id: surface("reflection"), kind: "reflection", accepts: actionsForKind("reflection") },
          // chat-log is part of the global chrome (app-frame), so it's operable on every screen
          { id: surface("chat-log"), kind: "chat-log", accepts: actionsForKind("chat-log") },
          ...tasks.map((t) => ({
            id: surface("item", t.id),
            kind: "item",
            accepts: t.status === "active" ? itemAccepts : [],
          })),
        ];
        return Response.json(buildManifest(screen, targets, { itemCount: tasks.length }));
      },
    },
  };
}
