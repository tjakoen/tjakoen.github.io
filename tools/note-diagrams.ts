// portfolio/tools/note-diagrams.ts — the diagrams of the Model Intelligence Layer notes, drawn by GRAIN's
// diagram organism and written into the notes as committed HTML, so a note carries a diagram that pans,
// zooms and traces on hover without a build step.
//
//   bun tools/note-diagrams.ts           # rewrite every block between <!-- diagram:ID --> or <!-- stack:ID --> markers
//   bun tools/note-diagrams.ts --check   # exit 1 when a block is stale (the test runs the same comparison)
//
// A note holds a marker pair and the tool fills it. The definitions below are the source of truth: edit them,
// run the tool, commit the note. The organism owns layout, shapes and behavior (grain, components/organisms/
// diagram); nothing here draws a shape.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { layeredDiagram, type LayeredInput } from "@tjakoen/grain/components/organisms/diagram/diagram.ts";

const E = (from: string, to: string, label?: string, title?: string) => ({ from, to, label, title });

export const DIAGRAMS: Record<string, LayeredInput> = {
  architecture: {
    kind: "layers",
    label: "The architecture of the Model Intelligence Layer. The owner sets intent and approvals. The loop, made of public standards, plans and human gates, feeds a registry that holds every model identifier. Three enforcement parts sit on it: the model guard, the route check and the work guard. They govern three harnesses, Claude Code, OpenCode and the Codex app. The harnesses reach four groups of models: Claude, Codex models, the free chain and the DeepSeek API. Every session writes a usage record that PANTRY reports.",
    nodes: [
      { id: "owner", kind: "person", label: "Owner", sub: "intent and approvals" },
      { id: "loop", kind: "system", label: "The loop", sub: "standards, plans, human gates" },
      { id: "registry", kind: "container", label: "Registry", sub: "every model id lives here" },
      { id: "guard", kind: "container", label: "Model guard", sub: "wrong model restarts itself" },
      { id: "route", kind: "container", label: "Route check", sub: "order, cooldowns, clearance" },
      { id: "work", kind: "container", label: "Work guard", sub: "company accounts only at work" },
      { id: "cc", kind: "container", label: "Claude Code" },
      { id: "oc", kind: "container", label: "OpenCode" },
      { id: "cx", kind: "container", label: "Codex app" },
      { id: "claude", kind: "external", label: "Claude", sub: "private" },
      { id: "codex", kind: "external", label: "Codex models", sub: "private" },
      { id: "free", kind: "external", label: "Free chain", sub: "not private" },
      { id: "ds", kind: "external", label: "DeepSeek API", sub: "paid, not private" },
      { id: "ledger", kind: "system", label: "Usage record, then PANTRY", sub: "free and paid kept apart" },
    ],
    edges: [
      E("owner", "loop"), E("loop", "registry"),
      E("registry", "guard"), E("registry", "route"), E("registry", "work"),
      E("guard", "cc"), E("route", "oc"), E("work", "cc"), E("work", "oc"), E("work", "cx"),
      E("cc", "claude"), E("oc", "codex"), E("oc", "free"), E("oc", "ds"), E("cx", "codex"),
      E("claude", "ledger"), E("codex", "ledger"), E("free", "ledger"), E("ds", "ledger"),
    ],
  },
  route: {
    kind: "flow",
    label: "How the route check picks a model for a delegated light task. First it checks whether the repository has been answered, and asks once if not. Then it walks the light chain in order and takes the first entry that is not skipped. An entry is skipped when it is not private and the repository is not cleared, when it is cooling down, when it is demoted for the day, or when its plan is out. If an entry is left, the task launches. If every entry is skipped, the paid DeepSeek API is used under a daily cap, and past the cap the route check stops and asks me. If the launched child hits a rate limit, the model is put on a cooldown and the route check picks once more.",
    nodes: [
      { id: "start", kind: "start", label: "Delegated light task" },
      { id: "repo", kind: "decision", label: "Repo answered?" },
      { id: "ask", kind: "action", label: "Ask me, store the answer" },
      { id: "walk", kind: "action", label: "Walk the light chain in order" },
      { id: "left", kind: "decision", label: "Entry left?" },
      { id: "paid", kind: "decision", label: "Under the daily cap?" },
      { id: "launch", kind: "action", label: "Launch the child" },
      { id: "limit", kind: "decision", label: "Rate limit?" },
      { id: "retry", kind: "action", label: "Cool the model, pick once more" },
      { id: "stop", kind: "end", label: "Stop and ask me" },
      { id: "done", kind: "end", label: "Record the usage" },
    ],
    edges: [
      E("start", "repo"), E("repo", "ask", "no"), E("repo", "walk", "yes"), E("ask", "walk"),
      E("walk", "left"), E("left", "launch", "yes"), E("left", "paid", "no"),
      E("paid", "launch", "yes", "The paid DeepSeek API runs as the last entry, under the daily cap"), E("paid", "stop", "no"),
      E("launch", "limit"), E("limit", "retry", "yes"), E("limit", "done", "no"),
    ],
  },
  guard: {
    kind: "flow",
    label: "How the model guard handles a session on the wrong model. At the first prompt it reads the model from the transcript and compares it with the registry's main model. If they match, the work starts. If not, the session stops before doing any work and proposes a restart card with the right model and effort. I click the card and a replacement session runs the task. The stopped session then offers Archive it or Keep it. On Archive it, it detaches the replacement first and archives itself second. A replacement that is still on the wrong model is blocked and never respawns.",
    nodes: [
      { id: "start", kind: "start", label: "First prompt of a session" },
      { id: "match", kind: "decision", label: "Matches the registry?" },
      { id: "work", kind: "end", label: "Work starts" },
      { id: "card", kind: "action", label: "Stop, propose the Restart card" },
      { id: "click", kind: "action", label: "I click the card" },
      { id: "again", kind: "decision", label: "Replacement right?" },
      { id: "block", kind: "end", label: "Block, never respawn" },
      { id: "run", kind: "action", label: "Replacement runs the task" },
      { id: "reply", kind: "action", label: "Archive it or Keep it" },
      { id: "arch", kind: "end", label: "Detach, then archive" },
    ],
    edges: [
      E("start", "match"), E("match", "work", "yes"), E("match", "card", "no"),
      E("card", "click"), E("click", "again"), E("again", "run", "yes"), E("again", "block", "no"),
      E("run", "reply"), E("reply", "arch"),
    ],
  },
  work: {
    kind: "flow",
    label: "How the work lane is guarded. First the machine is identified from its own name, and a machine that cannot be identified counts as a work machine. In work context, every prompt passes the account check, which blocks it unless the signed-in account is a company account. Launching DeepSeek Harness or OpenCode is refused by the launch gate, whatever the repository's clearance says. Outside work context, a repository I have cleared may use the free chain, the Codex plan and the DeepSeek API.",
    nodes: [
      { id: "start", kind: "start", label: "A session starts" },
      { id: "id", kind: "decision", label: "Machine identified?" },
      { id: "ctx", kind: "decision", label: "Work context?" },
      { id: "acct", kind: "decision", label: "Company account?" },
      { id: "block", kind: "end", label: "Prompt blocked" },
      { id: "only", kind: "end", label: "Company Claude and Codex only" },
      { id: "gate", kind: "action", label: "Launch gate refuses dsh and opencode" },
      { id: "personal", kind: "end", label: "Cleared repo: free chain allowed" },
    ],
    edges: [
      E("start", "id"), E("id", "ctx", "yes"), E("id", "gate", "no", "An unidentified machine counts as a work machine"),
      E("ctx", "acct", "yes"), E("ctx", "personal", "no"),
      E("acct", "block", "no"), E("acct", "only", "yes"), E("gate", "only"),
    ],
  },
  review: {
    kind: "flow",
    label: "Where the elephant and the goldfish fit. The long session, the elephant, writes a canonical plan with its linked files. Three fresh goldfish read only the plan and the files it links. Comprehension explains the plan back, the critic lists missing assumptions and risks, and readiness asks whether an independent implementer could build it. If the verdict is not go, the elephant resolves the findings and the plan is reviewed again. On go, I approve the plan. A fresh session then implements it test first in its own worktree, and an independent auditor verifies the result against evidence.",
    nodes: [
      { id: "plan", kind: "action", label: "Elephant writes the plan" },
      { id: "comp", kind: "action", label: "Goldfish: comprehension" },
      { id: "crit", kind: "action", label: "Goldfish: critic" },
      { id: "ready", kind: "action", label: "Goldfish: readiness" },
      { id: "go", kind: "decision", label: "Go?" },
      { id: "fix", kind: "action", label: "Elephant resolves findings" },
      { id: "approve", kind: "action", label: "I approve the plan" },
      { id: "build", kind: "action", label: "Fresh session builds, test first" },
      { id: "audit", kind: "end", label: "Auditor verifies" },
    ],
    edges: [
      E("plan", "comp"), E("plan", "crit"), E("plan", "ready"),
      E("comp", "go"), E("crit", "go"), E("ready", "go"),
      E("go", "approve", "yes"), E("go", "fix", "no"),
      E("approve", "build"), E("build", "audit"),
    ],
  },
};


// ── layered stacks: bands of tiles with an arrow between them ────────────────────────────────────────────────
// A stack shows what sits on what: each layer is a band, a layer may hold tiles, and an arrow between two bands
// says which way they talk. It is the picture for architecture and for "where each step fits", where a flow
// would only add arrows. Drawn to the FIGURES flow scaffold: theme tokens only, one emphasized layer, no style
// element, and a spoken name on the root.
interface StackTile { t: string; s?: string[]; dashed?: boolean }
interface StackLayer { title: string; sub?: string[]; tiles?: StackTile[]; emphasis?: boolean; footer?: boolean }
interface Stack { label: string; arrows: "both" | "down"; layers: StackLayer[] }

const X = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const STACKS: Record<string, Stack> = {
  layers: {
    arrows: "both",
    label: "The layers of my setup, top to bottom. I make the requests, decisions and approvals. Under me the loop holds the public standards, the plans, independent review and the human gates. Under the loop sits the Model Intelligence Layer, made of a registry of every model, a route check that picks a model with cooldowns and repository clearance, a model guard that restarts a session on the wrong model, and a work guard that allows only company accounts at work. Under that are three harnesses, Claude Code, OpenCode and the Codex app. Under those are four groups of models: Claude and Codex models, which are private, and the free models and the DeepSeek API, which are not. Beside every layer, PANTRY and the usage records keep the shared state that any session can read.",
    layers: [
      { title: "Me", sub: ["Requests, decisions and approvals"] },
      { title: "The loop", tiles: [
        { t: "Public standards" }, { t: "Plans" }, { t: "Independent review" }, { t: "Human gates" }] },
      { title: "The Model Intelligence Layer", emphasis: true, tiles: [
        { t: "Registry", s: ["every model id,", "tiers and roles"] },
        { t: "Route check", s: ["order, cooldowns,", "repo clearance"] },
        { t: "Model guard", s: ["a wrong model", "restarts itself"] },
        { t: "Work guard", s: ["company accounts", "only at work"] }] },
      { title: "Harnesses", tiles: [
        { t: "Claude Code", s: ["Claude only"] }, { t: "OpenCode", s: ["all other coding"] }, { t: "Codex app", s: ["non-coding work"] }] },
      { title: "Models", tiles: [
        { t: "Claude", s: ["private"] }, { t: "Codex models", s: ["private"] },
        { t: "Free models", s: ["not private"], dashed: true }, { t: "DeepSeek API", s: ["paid, not private"], dashed: true }] },
      { title: "Shared state", footer: true, sub: ["PANTRY, plans, usage records, run evidence, handoffs.", "Any session can read it, and no session owns it."] },
    ],
  },
  review: {
    arrows: "down",
    label: "Where the elephant and the goldfish fit. The elephant, the long session with the project context, writes the canonical plan and stores it under plans with its linked dependencies. Three independent goldfish then review it cold: comprehension asks whether a fresh reader can explain the plan, the critic asks what assumptions, risks or dependencies are missing, and readiness asks whether an independent implementer could build it. The elephant resolves the findings and I approve the plan, with the review evidence kept under artifacts and reviews. A fresh session then builds against the approved plan and an independent auditor verifies the result.",
    layers: [
      { title: "Elephant: context-rich planning", sub: ["Holds the project history, the requirements and the decisions,", "and produces the canonical plan"] },
      { title: "Canonical plan", sub: ["Stored under plans, with its linked dependencies"] },
      { title: "Three independent goldfish reviews", tiles: [
        { t: "Comprehension", s: ["Can a fresh reader", "explain the plan?"] },
        { t: "Critic", s: ["What assumptions, risks", "or dependencies are missing?"] },
        { t: "Readiness", s: ["Can an independent", "implementer build it?"] }] },
      { title: "The elephant resolves the findings, then I approve", sub: ["Review evidence goes under artifacts and reviews"] },
      { title: "Fresh implementation, then the auditor", emphasis: true, sub: ["Build against the approved plan, then verify the result on its own"] },
    ],
  },
};

export function stackSvg(id: string): string {
  const s = STACKS[id];
  if (!s) throw new Error(`no stack named ${id}`);
  const W = 640, PAD = 20, GAP = 30;
  let y = 14;
  const parts: string[] = [];
  s.layers.forEach((l, i) => {
    const tiles = l.tiles ?? [];
    const subLines = l.sub ?? [];
    const tileH = tiles.length ? Math.max(...tiles.map((t) => 30 + (t.s?.length ?? 0) * 16)) : 0;
    const head = 26 + subLines.length * 16;
    const h = l.footer ? 22 + subLines.length * 16 + 22 : head + (tiles.length ? tileH + 12 : 0) + 10;
    const stroke = l.emphasis ? "stroke:var(--color-fg);stroke-width:2.2" : "stroke:var(--color-line);stroke-width:1";
    if (l.footer) {
      parts.push(`<line x1="${PAD}" y1="${y}" x2="${W - PAD}" y2="${y}" style="stroke:var(--color-line);stroke-width:1"/>`);
      parts.push(`<text x="${PAD + 4}" y="${y + 24}" style="fill:var(--color-fg);font-size:14px">${X(l.title)}</text>`);
      subLines.forEach((ln, k) => parts.push(`<text x="${PAD + 4}" y="${y + 44 + k * 16}" style="fill:var(--color-muted);font-size:12px">${X(ln)}</text>`));
    } else {
      parts.push(`<rect x="${PAD}" y="${y}" width="${W - 2 * PAD}" height="${h}" rx="8" style="fill:none;${stroke}"/>`);
      parts.push(`<text x="${W / 2}" y="${y + 22}" text-anchor="middle" style="fill:var(--color-fg);font-size:14.5px">${X(l.title)}</text>`);
      subLines.forEach((ln, k) => parts.push(`<text x="${W / 2}" y="${y + 40 + k * 16}" text-anchor="middle" style="fill:var(--color-muted);font-size:12px">${X(ln)}</text>`));
      const n = tiles.length, inner = W - 2 * PAD - 24, g = 10;
      const tw = n ? (inner - (n - 1) * g) / n : 0;
      tiles.forEach((tl, k) => {
        const tx = PAD + 12 + k * (tw + g), ty = y + head;
        parts.push(`<rect x="${tx}" y="${ty}" width="${tw}" height="${tileH}" rx="6" style="fill:none;stroke:var(--color-line);stroke-width:1${tl.dashed ? ";stroke-dasharray:5 4" : ""}"/>`);
        parts.push(`<text x="${tx + tw / 2}" y="${ty + 20}" text-anchor="middle" style="fill:var(--color-fg);font-size:13px">${X(tl.t)}</text>`);
        (tl.s ?? []).forEach((ln, j) => parts.push(`<text x="${tx + tw / 2}" y="${ty + 38 + j * 15}" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">${X(ln)}</text>`));
      });
    }
    y += h;
    if (s.layers[i + 1]) {
      const x = W / 2, a = y + 4, b = y + GAP - 4;
      const down = `<path d="M${x - 4},${b - 6} L${x},${b} L${x + 4},${b - 6}"/>`;
      const up = `<path d="M${x - 4},${a + 6} L${x},${a} L${x + 4},${a + 6}"/>`;
      parts.push(`<g style="stroke:var(--color-muted);stroke-width:1.5;fill:none"><line x1="${x}" y1="${a}" x2="${x}" y2="${b}"/>${down}${s.arrows === "both" ? up : ""}</g>`);
      y += GAP;
    }
  });
  const H = y + 14;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${X(s.label)}" style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif">${parts.join("")}</svg>`;
}

const clean = (html: string) => html.replace(/\n\s*\n/g, "\n").trim();
export const block = (id: string) => {
  const def = DIAGRAMS[id];
  if (!def) throw new Error(`no diagram named ${id}`);
  return `<!-- diagram:${id} -->\n${clean(layeredDiagram(def))}\n<!-- /diagram:${id} -->`;
};
export const stackBlock = (id: string) => `<!-- stack:${id} -->\n${stackSvg(id)}\n<!-- /stack:${id} -->`;
const MARK = /<!-- (diagram|stack):([a-z-]+) -->[\s\S]*?<!-- \/\1:\2 -->/g;

/** Replace every marker pair in a note's text with the current drawing. */
export function fill(text: string): string {
  return text.replace(MARK, (_m, kind: string, id: string) => (kind === "stack" ? stackBlock(id) : block(id)));
}

if (import.meta.main) {
  const dir = join(import.meta.dir, "..", "content", "notes");
  const check = process.argv.includes("--check");
  let stale = 0;
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".md"))) {
    const path = join(dir, f);
    const text = readFileSync(path, "utf8");
    const next = fill(text);
    if (next === text) continue;
    stale++;
    if (check) console.log(`stale: ${f}`);
    else { writeFileSync(path, next); console.log(`wrote ${f}`); }
  }
  if (check && stale) process.exit(1);
}
