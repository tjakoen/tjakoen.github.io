// portfolio/tools/note-diagrams.ts — the diagrams of the Model Intelligence Layer notes, drawn by GRAIN's
// diagram organism and written into the notes as committed HTML, so a note carries a diagram that pans,
// zooms and traces on hover without a build step.
//
//   bun tools/note-diagrams.ts           # rewrite every block between <!-- diagram:ID --> markers in content/notes
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

const clean = (html: string) => html.replace(/\n\s*\n/g, "\n").trim();
export const block = (id: string) => {
  const def = DIAGRAMS[id];
  if (!def) throw new Error(`no diagram named ${id}`);
  return `<!-- diagram:${id} -->\n${clean(layeredDiagram(def))}\n<!-- /diagram:${id} -->`;
};
const MARK = /<!-- diagram:([a-z-]+) -->[\s\S]*?<!-- \/diagram:\1 -->/g;

/** Replace every marker pair in a note's text with the current drawing. */
export function fill(text: string): string {
  return text.replace(MARK, (_m, id: string) => block(id));
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
