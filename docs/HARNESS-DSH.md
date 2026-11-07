# DeepSeek Harness and the loop

DSH is a second harness for this repo. It reads the same front door and the same standards, and it
runs none of the Claude Code hooks. The standards arrive as skills; the enforcement needs a DSH
equivalent. This page is that equivalent, what it covers, and the part it honestly does not.

The one-line version: **the rules travel, the wiring is rebuilt per harness.** A skill is portable,
a pre-tool hook is not.

## What DSH reads

- AGENTS.md at session start. The file is a symlink to CLAUDE.md, so both names resolve.
- The global instruction file at ~/.dsh/AGENTS.md and ~/.agents/AGENTS.md. Both link to
  agent-config/shared/CLAUDE.md, the same file Claude and Codex read.
- .agents/skills, which is a symlink to .claude/skills. That is the one mount DSH scans. Pantry
  writes the live copy with the sync command below, and the symlink means DSH sees the update
  without a second sync.
- The DSH loop plugin, installed at ~/.dsh/loop/ and mounted by an insert entry in
  ~/.dsh/profiles/desktop/cordis.patch.yml. The source lives in agent-config/shared/tools/dsh.
- MCP servers from the profile patch: pantry over streamable-http at 127.0.0.1:4400/mcp, and
  tokensave and headroom over stdio. The tools appear as mcp__pantry__*, and so on.

```sh
# from the pantry repo, after a standards edit
bun cli.ts skills sync ../tjakoen.github.io
```

DSH does not read .claude/settings.json, .claude/settings.local.json, .codex/hooks.json or
~/.claude.json. None of the Claude Code hooks fire here.

## The session routine

At the first turn, from the repo root:

```sh
bun tools/dsh-loop/cli.mjs start
```

It runs the machine doctor, prints the warnings and due rows, checks that .agents/skills still
points at the live mount, and reports the graph age. The full doctor is a command because DSH has no
session-start event. The session checklist is separate and does run automatically: the plugin runs
it on the first step and injects the block, and the global instruction file says to show that block
verbatim at the top of the first reply.

Before calling work done:

```sh
bun tools/dsh-loop/cli.mjs end
```

It refreshes the graph, runs the typecheck and the lint gate, prints the dirty and unpushed state,
and prints the two lines the run report owes: what was not done, and what needs human eyes.

Before a handoff, or when a guard denial is a surprise:

```sh
bun tools/dsh-loop/cli.mjs guard .github/workflows/ci.yml
bun tools/dsh-loop/cli.mjs envelope /tmp/handoff.txt
```

The first asks the human-lane rules about a path. The second checks a handoff for the four headings
LOOP section 4b requires.

## What the plugin enforces

The plugin does three jobs inside DSH:

1. **The human lane.** A write to a path in LOOP section 4b is denied with a reason, before the tool
   runs. It covers CI and workflows, migrations and SQL, auth and permission paths, secrets,
   credentials, .npmrc, .pem, billing and payment, wrangler, Dockerfile, Terraform, the version,
   publishConfig and exports fields of package.json, and the guard's own files.
2. **The spawn envelope.** A subagent or subagent_fork prompt needs the lane, the scope cap, the
   hard stops and the ask-triggers as headings. A send_message under 400 characters is exempt
   because it is usually a nudge to a child already running, not a handoff. A spawn is never exempt.
3. **Graph refresh.** A successful write or edit schedules graphify update on the nearest repo root,
   debounced by two seconds. The Claude PostToolUse hook did this; the plugin replaces it.
4. **The session checklist.** On the first step of a root session it runs the shared checklist in
   DSH mode and injects the block. The block checks the global instructions, the plugin and its
   profile entry, the MCP entries, the project memory index, the standards, PANTRY, the graph and
   git state, and ends with the verdict.
5. **Nudges.** One-time PostToolUse reminders for a bash or tool result over its bound, a session
   that reads and searches without delegating, a search sweep without a graph query, and a finish
   nudge after an edit that says to run the end command.
6. **Session events.** Start, write and stop lines in the project's sessions.jsonl, the same shape
   the Claude hooks write, so the doctor and PANTRY count a DSH session.

The owner's approval file is the one Claude already uses: ~/.claude/human-lane-approved, one
extended regular expression per line. A path matching a line is allowed through, so an approval
written for Claude carries to DSH and the record stays in one place.

The plugin fails open on anything outside its rules. A guard that throws, or a graph refresh that
fails, never breaks the tool call that triggered it.

## What DSH still does not carry

- **The full doctor is a command, not a start event.** The checklist runs automatically and covers
  the health rows; the doctor adds the kit and run-ledger checks, so the AGENTS.md line asks for it
  first. The finish nudge asks the model to run the end command, which is still the close.
- **The turn-end gate is a command, not a stop hook.** The end command is manual. Nothing blocks a
  session from declaring done without it.
- **Shell writes are outside the guard.** A bash command can write anywhere. Parsing shell to find
  the target is a losing game, the same gap the Claude hook names in its own header.
- **Deletions under content/ are outside the guard.** They happen through the shell, so they fall in
  the same gap.
- **A workflow script is not envelope-checked.** The agent calls live inside JavaScript the tool
  receives as a script, not as a prompt. A subagent call is checked.
- **The ~/.claude.json permissions and the artifacts/runs ledger are not read or written
  automatically.** The MCP servers are configured in the profile patch. The project memory index is
  named by the checklist and read on demand; DSH does not load it automatically or keep a second
  store. DSH has its own session store under ~/.dsh. A run report is still the session's job.
- **The context-trigger nudge is absent.** The output bounds, the delegation and discovery
  reminders, and the finish nudge are in the plugin. The context trigger reads the transcript for
  the window, which DSH does not expose the same way.

## Install and remove

```sh
bun ~/.dsh/loop/install.mjs             # show the plan
bun ~/.dsh/loop/install.mjs --write     # link the source and patch the profile
bun ~/.dsh/loop/install.mjs --status    # what is installed
bun ~/.dsh/loop/install.mjs --uninstall --write
```

The installer links ~/.dsh/loop to agent-config/shared/tools/dsh, merges the machine's MCP
entries from machines/<host>/dsh/mcp.yml, and backs up the profile patch before it writes. DSH
applies the patch on hot reload or on restart. If a write to a human-lane path is still allowed
after the install, restart the app and check the status command.

The plugin source is committed in agent-config. The link is what loads, and the guard blocks an
agent from editing either the linked source or the profile patch that mounts it.

## A new machine

After the pantry sync has written .claude/skills:

```sh
ln -s ../.claude/skills .agents/skills
# from the agent-config checkout, after writing machines/<host>/dsh/mcp.yml
shared/tools/link-machine.sh
bun shared/tools/dsh/install.mjs --write
```

The first line is what makes DSH read the live standards; it is repo-local and gitignored. The
linker and installer are what give the loop its teeth; they are machine state, and the source is
committed in agent-config. This page is the instructions for rebuilding all of it.

---

*The rules this page points at are [LOOP](https://tjakoen.github.io/standards/loop) and
[HOOKS](https://tjakoen.github.io/standards/hooks). Where they disagree with this page about a
rule, they win. This page wins only on what the DSH side actually does.*
