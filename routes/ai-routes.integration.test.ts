// portfolio/routes/ai-routes.integration.test.ts — INTEGRATION: the real door, end to end.
// Spins up Bun.serve with the REAL graph (service + SSE stream + interaction layer +
// reasoner), opens a live /stream connection over HTTP, POSTs an intent to /intent, and
// asserts the resulting RenderOps actually arrive over SSE. No browser; many real modules.
import { test, expect, afterAll } from "bun:test";
import { buildAiRoutes } from "./ai-routes.ts";
import { createStream } from "../../batch/http/stream.ts";
import { createInteractionLayer } from "../../grain/ai/interaction-layer.ts";
import { makeStubReasoner } from "../../grain/ai/reasoner.ts";
import { createAccepts } from "../../grain/ai/accepts.ts";
import { InMemoryTaskRepository } from "../demo/data/in-memory-task-repository.ts";
import { TaskService } from "../demo/services/task-service.ts";
import { LoopCard } from "../demo/view/components.ts";
import { toLoopCardView } from "../demo/services/task-views.ts";
import { surfaceId, type Surface } from "../../grain/ai/contract.ts";
import type { Task } from "../demo/domain/task.ts";

function makeServer() {
  const seed: Task[] = [{
    id: "ITM-1", name: "Test task", description: "", status: "active",
    createdAt: new Date(0), updatedAt: new Date(0),
  }];
  const service = new TaskService(new InMemoryTaskRepository(seed));
  const stream = createStream();
  const reasoner = makeStubReasoner({ thinkMs: 0 });
  const renderSurface = async (s: Surface) => {
    const t = await service.getTask(surfaceId(s));
    return t ? LoopCard(toLoopCardView(t)) : "";
  };
  const layer = createInteractionLayer({
    reasoner, stream,
    archiveItem: (id) => service.archiveTask(id).then(() => undefined),
    renderSurface,
  });
  const accepts = createAccepts(["./grain/components", "./tjakoen.github.io/components"]);
  const server = Bun.serve({ port: 0, routes: buildAiRoutes(service, stream, layer, accepts) });
  return { server, service, base: `http://localhost:${server.port}` };
}

// Read SSE `data:` payloads from a live response body until `until(ops)` or a timeout.
async function readOps(res: Response, until: (ops: any[]) => boolean, timeoutMs = 3000): Promise<any[]> {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  const ops: any[] = [];
  let buf = "";
  const deadline = Date.now() + timeoutMs;
  try {
    while (Date.now() < deadline) {
      const tick = new Promise<{ value?: Uint8Array; done: boolean }>((r) => setTimeout(() => r({ done: false }), 150));
      const { value, done } = await Promise.race([reader.read(), tick]);
      if (done) break;
      if (!value) { if (until(ops)) break; else continue; }
      buf += dec.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl); buf = buf.slice(nl + 1);
        if (line.startsWith("data:")) { try { ops.push(JSON.parse(line.slice(5).trim())); } catch { /* comment frame */ } }
      }
      if (until(ops)) break;
    }
  } finally { reader.cancel().catch(() => {}); }
  return ops;
}

const post = (base: string, body: unknown) =>
  fetch(`${base}/intent`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

let toStop: { stop: () => void } | null = null;
afterAll(() => toStop?.stop());

test("POST /intent (item.archive) pushes a committed replace op over /stream", async () => {
  const { server, service, base } = makeServer();
  toStop = server;
  const stream = await fetch(`${base}/stream?session=s1`);   // open the SSE channel first
  const intentRes = await post(base, { source: "user", session: "s1", screen: "loop", surface: "item:ITM-1", action: "item.archive", payload: {} });
  expect(intentRes.status).toBe(202);                        // the door acknowledges immediately

  const ops = await readOps(stream, (o) => o.some((x) => x.op === "replace" && x.commit === "committed"));
  const replace = ops.find((o) => o.op === "replace");
  expect(replace).toBeTruthy();
  expect(replace.commit).toBe("committed");                  // confirmation landed over the push channel
  expect(replace.target).toBe("item:ITM-1");
  expect((await service.getTask("ITM-1"))?.status).toBe("archived");   // the real write happened
});

test("the door ignores a client-declared source:'ai' — HTTP intents are always 'user'", async () => {
  // Provenance can't be spoofed over the wire: a client claiming source:"ai" must NOT earn the
  // AI-acting treatment. The interaction layer brackets genuine AI intents with spotlight ops
  // (provenance:"ai"); a downgraded intent produces none — that absence is the proof.
  const { server, base } = makeServer();
  toStop = server;
  const stream = await fetch(`${base}/stream?session=s1`);
  const res = await post(base, { source: "ai", session: "s1", screen: "loop", surface: "item:ITM-1", action: "item.archive", payload: {} });
  expect(res.status).toBe(202);

  const ops = await readOps(stream, (o) => o.some((x) => x.op === "replace" && x.commit === "committed"));
  expect(ops.some((o) => o.op === "replace")).toBe(true);            // the write still happened
  expect(ops.some((o) => o.op === "spotlight")).toBe(false);        // …but NOT bracketed as AI-acting
});

test("a malformed intent is rejected at the door with 400 (no SSE op)", async () => {
  const { server, base } = makeServer();
  toStop = server;
  const res = await post(base, { surface: "item:ITM-1" });   // missing action
  expect(res.status).toBe(400);
});

test("POST /intent (chat.send) streams your message + the desk's grain reply over /stream", async () => {
  const { server, base } = makeServer();
  toStop = server;
  const stream = await fetch(`${base}/stream?session=s1`);
  const res = await post(base, { source: "user", session: "s1", screen: "dashboard", surface: "chat-log", action: "chat.send", payload: { text: "hello desk" } });
  expect(res.status).toBe(202);                              // the door acknowledges immediately

  const ops = await readOps(stream, (o) => o.some((x) => x.op === "type" && x.done));
  const appends = ops.filter((o) => o.op === "append");
  expect(appends.some((o) => o.html?.includes("hello desk"))).toBe(true);                       // your bubble arrived
  expect(appends.some((o) => o.provenance === "ai" && o.html?.includes('data-grade="grain"'))).toBe(true);  // the desk's grain bubble
  expect(ops.some((o) => o.op === "type")).toBe(true);                                          // the reply streamed in
});

test("GET /ai/manifest reflects the harvested vocabulary (reflection + item.archive)", async () => {
  const { server, base } = makeServer();
  toStop = server;
  const manifest = await (await fetch(`${base}/ai/manifest?screen=loop`)).json();
  const targets: any[] = manifest.targets ?? [];
  expect(targets.find((t) => t.id === "reflection")?.accepts).toContain("say.set");
  expect(targets.find((t) => t.id === "item:ITM-1")?.accepts).toContain("item.archive");
  // chat-log is global chrome (app-frame) → the manifest must advertise it too (honesty guarantee)
  expect(targets.find((t) => t.id === "chat-log")?.accepts).toContain("chat.send");
});
