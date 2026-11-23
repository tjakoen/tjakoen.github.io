// portfolio/tools/note-diagrams.ts — the diagrams of the Model Intelligence Layer notes, drawn by GRAIN's
// diagram organism and written into the notes as committed HTML, so a note carries a diagram that pans,
// zooms and traces on hover without a build step.
//
//   bun tools/note-diagrams.ts           # rewrite every block between <!-- diagram:ID --> or <!-- stack:ID --> or <!-- compare:ID --> markers
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
  route: {
    kind: "flow",
    label: "How the route check picks a model for a delegated light task. First it checks whether the repository has been answered, and asks once if not. Then it walks the light chain in order and takes the first entry that is not skipped. An entry is skipped when it is not private and the repository is not cleared, when it is cooling down, when it is demoted for the day, or when its plan is out. If an entry is left, the task launches. If every entry is skipped, the route check stops and asks me. The paid DeepSeek API is never part of this order. If the launched child hits a rate limit, the model is put on a cooldown and the route check picks once more.",
    nodes: [
      { id: "start", kind: "start", label: "Delegated light task" },
      { id: "repo", kind: "decision", label: "Repo answered?" },
      { id: "ask", kind: "action", label: "Ask me, store the answer" },
      { id: "walk", kind: "action", label: "Walk the light chain in order" },
      { id: "left", kind: "decision", label: "Entry left?" },
      { id: "launch", kind: "action", label: "Launch the child" },
      { id: "limit", kind: "decision", label: "Rate limit?" },
      { id: "retry", kind: "action", label: "Cool the model, pick once more" },
      { id: "stop", kind: "end", label: "Stop and ask me" },
      { id: "done", kind: "end", label: "Record the usage" },
    ],
    edges: [
      E("start", "repo"), E("repo", "ask", "no"), E("repo", "walk", "yes"), E("ask", "walk"),
      E("walk", "left"), E("left", "launch", "yes"), E("left", "stop", "no"),
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
    label: "How the work lane is guarded. A session starts and the machine is identified from its own name. A machine that cannot be identified counts as a work machine. A work machine, or a work repository, puts the session in work context. In work context every prompt passes the account check: a company account passes and any other account, a personal Claude or Codex included, is blocked. Launching DeepSeek Harness or OpenCode in work context is refused by the launch gate. Outside work context, a personal machine in a repository I have cleared may use the free model, the Go plan and the Codex plan.",
    nodes: [
      { id: "start", kind: "start", label: "A session starts" },
      { id: "id", kind: "decision", label: "Machine identified?" },
      { id: "ctx", kind: "decision", label: "Work machine or repo?" },
      { id: "work", kind: "action", label: "Work context" },
      { id: "personal", kind: "end", label: "Personal lane: a cleared repo may use the light chain" },
      { id: "acct", kind: "decision", label: "Company account?" },
      { id: "gate", kind: "end", label: "Launch gate refuses dsh and opencode" },
      { id: "block", kind: "end", label: "Prompt blocked" },
      { id: "pass", kind: "end", label: "Prompt passes" },
    ],
    edges: [
      E("start", "id"), E("id", "ctx", "yes"), E("id", "work", "no", "A machine the setup cannot identify counts as a work machine"),
      E("ctx", "work", "yes"), E("ctx", "personal", "no"),
      E("work", "acct", "every prompt"), E("work", "gate", "launch attempt"),
      E("acct", "block", "no", "Any account that is not a company account, or one the hook cannot read"), E("acct", "pass", "yes"),
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
  ladder: {
    arrows: "down",
    label: "The order for light work. First DeepSeek V4.1 Flash Free, the one free model, since the free models share one daily message cap. Second the same model on the OpenCode Go plan, a small monthly plan with one shared allowance. Third the Codex models, Luna and then Sol at low effort, while the Codex plan has usage left. Fourth, when none is left, the route check stops and asks me. The paid DeepSeek API is never in this order. It is an escalation that needs an approval I type in a terminal.",
    layers: [
      { title: "1. DeepSeek V4.1 Flash Free", sub: ["The one free model. The free models share one daily message cap,", "so a chain of five was one fallback in practice."] },
      { title: "2. DeepSeek V4.1 Flash on OpenCode Go", sub: ["The same model on a small monthly plan with one shared allowance"] },
      { title: "3. The Codex models", sub: ["Luna, then Sol at low effort, while the plan has usage left"] },
      { title: "4. Stop and ask me", emphasis: true, sub: ["The paid DeepSeek API is never in this order.", "It is an escalation, and it needs the approval I type."] },
    ],
  },
  layers: {
    arrows: "both",
    label: "The layers of my setup, top to bottom. I make the requests, decisions and approvals. Under me the loop holds the public standards, the plans, independent review and the human gates. Under the loop sits the Model Intelligence Layer, made of a registry of every model, a route check that picks a model with cooldowns and repository clearance, a model guard that restarts a session on the wrong model, and a work guard that allows only company accounts at work. Under that are three harnesses, Claude Code, OpenCode and the Codex app. Under those are four groups of models: Claude and Codex models, which are private, and the free and Go models and the DeepSeek API, which are not. Beside every layer, PANTRY and the usage records keep the shared state that any session can read.",
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
        { t: "Free and Go", s: ["not private"], dashed: true }, { t: "DeepSeek API", s: ["approval only"], dashed: true }] },
      { title: "Shared state", footer: true, sub: ["PANTRY, plans, usage records, run evidence, handoffs.", "Any session can read it, and no session owns it."] },
    ],
  },
  parts: {
    arrows: "both",
    label: "Every part of the layer, top to bottom. I make the requests and approvals. Under me the loop holds public standards, plans, independent review and human gates. Under the loop the Model Intelligence Layer has five parts: the registry of model ids, tiers and roles; the model guard that restarts a session on the wrong model; the route check that picks a model with cooldowns and repository clearance; the work guard that allows only a company account at work; and the usage record, one line per session. Under the layer are three harnesses: Claude Code, which the model guard and the work guard cover; OpenCode, which the route check and the launch gate cover; and the Codex app, which the work guard covers. Under the harnesses are four groups of models: Claude and Codex models, which are private, and the free and Go models and the DeepSeek API, which are not. The usage record feeds PANTRY, which keeps the shared state.",
    layers: [
      { title: "Me", sub: ["Requests and approvals"] },
      { title: "The loop", tiles: [
        { t: "Public standards" }, { t: "Plans" }, { t: "Independent review" }, { t: "Human gates" }] },
      { title: "The Model Intelligence Layer", emphasis: true, tiles: [
        { t: "Registry", s: ["model ids,", "tiers, roles"] },
        { t: "Model guard", s: ["wrong model", "restarts"] },
        { t: "Route check", s: ["order, cooldowns,", "clearance"] },
        { t: "Work guard", s: ["company account", "only at work"] },
        { t: "Usage record", s: ["one line per", "session"] }] },
      { title: "Harnesses, and which parts cover them", tiles: [
        { t: "Claude Code", s: ["model guard,", "work guard"] },
        { t: "OpenCode", s: ["route check,", "launch gate"] },
        { t: "Codex app", s: ["work guard"] }] },
      { title: "Models", tiles: [
        { t: "Claude", s: ["private"] }, { t: "Codex models", s: ["private"] },
        { t: "Free and Go", s: ["not private"], dashed: true }, { t: "DeepSeek API", s: ["approval only"], dashed: true }] },
      { title: "PANTRY", footer: true, sub: ["Reads the usage records, free and paid kept apart.", "Shared state that any session can read."] },
    ],
  },
  delegation: {
    arrows: "down",
    label: "Escalation is delegation, not a switch. The main session runs on the execution tier and holds the conversation and its prompt cache. When the next piece is planning, architecture or review, the main session hands it to a subagent pinned to the strong tier. The subagent reads only the plan and the files it links, and its context ends when the piece ends. The answer returns to the main session, which keeps its cache and carries on at its own tier. Switching the main session's model instead would throw the cache away.",
    layers: [
      { title: "Main session, on the execution tier", sub: ["Sonnet on Claude Code, Sol at low effort on Codex.", "It keeps the conversation and its prompt cache."] },
      { title: "The next piece needs judgment", tiles: [
        { t: "Planning" }, { t: "Architecture" }, { t: "Review" }] },
      { title: "A subagent pinned to the strong tier", emphasis: true, sub: ["Opus on Claude Code, Sol on Codex and OpenCode.", "It gets the plan and the files it links. Its context ends with the piece."] },
      { title: "One answer comes back", sub: ["The main session carries on at its own tier, with its cache intact."] },
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


// ── side by side: the same roles, before and now ───────────────────────────────────────────────────────────
// Rows are roles, the left column is how a role was filled before and the right column is how it is filled
// now. One cell may be heavy (the change that matters), a cell may be faint and dashed (something that is gone).
// Drawn to the FIGURES flow scaffold: theme tokens only, a spoken name on the root, no style element.
interface CompareCell { t: string; s?: string[]; heavy?: boolean; gone?: boolean }
interface CompareRow { role: string; before: CompareCell; now: CompareCell }
interface Compare { label: string; before: string; now: string; rows: CompareRow[] }

export const COMPARES: Record<string, Compare> = {
  setup: {
    before: "Before", now: "Now",
    label: "My setup before and now, side by side, by role. Main tool: Claude Code before, and Claude Code still, when I want Claude. Second tool: the Codex app before, as the backup and for a parallel project, and now OpenCode, which does all coding outside Claude with the Codex plan, a free model, a small monthly plan and the DeepSeek API plugged in. Last fallback: DeepSeek Harness before, and now deleted. Non-coding work: whichever app was open before, and now the Codex app, for the ChatGPT side and anything at work. Who picks the model: me, by hand, before, and now the Model Intelligence Layer.",
    rows: [
      { role: "Main tool", before: { t: "Claude Code", s: ["my main tool"] }, now: { t: "Claude Code", s: ["still, when I want Claude"] } },
      { role: "Second tool", before: { t: "Codex app", s: ["backup, and a second", "project in parallel"] }, now: { t: "OpenCode", s: ["all coding outside Claude:", "Codex plan, a free model,", "a small plan, DeepSeek API"] } },
      { role: "Last fallback", before: { t: "DeepSeek Harness", s: ["when both plans ran out"] }, now: { t: "Deleted", s: ["one app fewer"], gone: true } },
      { role: "Non-coding work", before: { t: "Whichever was open", gone: true }, now: { t: "Codex app", s: ["the ChatGPT side,", "and anything at work"] } },
      { role: "Picks the model", before: { t: "Me, by hand", s: ["when something ran out"] }, now: { t: "The layer", s: ["registry, route check,", "guards"], heavy: true } },
    ],
  },
};

export function compareSvg(id: string): string {
  const c = COMPARES[id];
  if (!c) throw new Error(`no comparison named ${id}`);
  const W = 640, PAD = 20, ROLE_W = 112, G = 10;
  const cw = (W - 2 * PAD - ROLE_W - 2 * G) / 2;
  const x1 = PAD + ROLE_W + G, x2 = x1 + cw + G;
  const parts: string[] = [];
  parts.push(`<text x="${x1 + cw / 2}" y="26" text-anchor="middle" style="fill:var(--color-muted);font-size:12px;letter-spacing:2px">${X(c.before.toUpperCase())}</text>`);
  parts.push(`<text x="${x2 + cw / 2}" y="26" text-anchor="middle" style="fill:var(--color-muted);font-size:12px;letter-spacing:2px">${X(c.now.toUpperCase())}</text>`);
  let y = 40;
  const cell = (x: number, yy: number, h: number, k: CompareCell) => {
    const stroke = k.heavy ? "stroke:var(--color-fg);stroke-width:2.2" : "stroke:var(--color-line);stroke-width:1";
    const dash = k.gone ? ";stroke-dasharray:5 4" : "";
    parts.push(`<rect x="${x}" y="${yy}" width="${cw}" height="${h}" rx="8" style="fill:none;${stroke}${dash}"/>`);
    const lines = k.s ?? [];
    const top = yy + (h - (20 + lines.length * 15)) / 2 + 14;
    const fill = k.gone ? "var(--color-muted)" : "var(--color-fg)";
    parts.push(`<text x="${x + cw / 2}" y="${top}" text-anchor="middle" style="fill:${fill};font-size:13.5px">${X(k.t)}</text>`);
    lines.forEach((ln, j) => parts.push(`<text x="${x + cw / 2}" y="${top + 18 + j * 15}" text-anchor="middle" style="fill:var(--color-muted);font-size:11.5px">${X(ln)}</text>`));
  };
  c.rows.forEach((r) => {
    const n = Math.max(r.before.s?.length ?? 0, r.now.s?.length ?? 0);
    const h = 40 + Math.max(n, 1) * 15;
    parts.push(`<text x="${PAD + ROLE_W - 8}" y="${y + h / 2 + 4}" text-anchor="end" style="fill:var(--color-muted);font-size:12.5px">${X(r.role)}</text>`);
    cell(x1, y, h, r.before);
    cell(x2, y, h, r.now);
    y += h + 10;
  });
  const H = y + 6;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${X(c.label)}" style="display:block;width:100%;max-width:600px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif">${parts.join("")}</svg>`;
}

const clean = (html: string) => html.replace(/\n\s*\n/g, "\n").trim();
export const block = (id: string) => {
  const def = DIAGRAMS[id];
  if (!def) throw new Error(`no diagram named ${id}`);
  return `<!-- diagram:${id} -->\n${clean(layeredDiagram(def))}\n<!-- /diagram:${id} -->`;
};
export const compareBlock = (id: string) => `<!-- compare:${id} -->\n${compareSvg(id)}\n<!-- /compare:${id} -->`;
export const stackBlock = (id: string) => `<!-- stack:${id} -->\n${stackSvg(id)}\n<!-- /stack:${id} -->`;
const MARK = /<!-- (diagram|stack|compare):([a-z-]+) -->[\s\S]*?<!-- \/\1:\2 -->/g;

/** Replace every marker pair in a note's text with the current drawing. */
export function fill(text: string): string {
  return text.replace(MARK, (_m, kind: string, id: string) => (kind === "stack" ? stackBlock(id) : kind === "compare" ? compareBlock(id) : block(id)));
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
