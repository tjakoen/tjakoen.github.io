---
id: model-guard-respawn
status: done
track: ai
depends: [model-intelligence-layer-phase-a]
touches:
  - claude-config:shared/model-roles.json
  - claude-config:shared/tools/model-roles.ts
  - claude-config:shared/tools/model-roles.test.ts
  - claude-config:shared/tools/model-guard.sh
  - claude-config:shared/tools/model-guard.test.ts
  - claude-config:shared/tools/expected-hooks.txt
  - claude-config:shared/tools/mil-verify.ts
  - claude-config:shared/tools/mil-verify.test.ts
  - claude-config:shared/commands/handoff.md
  - claude-config:machines/*/settings.json
  - claude-config:artifacts/runs/<date>-model-guard-respawn.md
  - standards/MODELS.md
  - standards/MODELS-VERIFY.md
  - standards/INDEX.json
owner: ai
---

# A session on the wrong model stops, and a session on the right one takes its prompt

## Why

Phase A (`plans/model-intelligence-layer-phase-a.md`, done) made the registry's execution tier the
main session's model on every machine, which is Sonnet on Claude Code. Nothing enforces it. A session
started by another session inherits that session's model, and the owner can pick any model from the
menu; on 2026-11-22 the Phase A verify session ran on Opus for the first reason, and its model probe
failed. The owner wants a session that starts on the wrong model to stop at once, say so, start a
replacement on the right model with the same prompt, and archive itself.

## Decisions (owner, 2026-11-22, in chat)

- **D1. Mismatch means respawn.** Every main session runs the registry's main tier. Work that needs
  the strong tier reaches it by delegating to a strong-tier agent, as MODELS.md already says; there is
  no sanctioned Opus main session.
- **D2. A per-session override exists.** The phrase `keep this model` (case-insensitive) in the
  owner's first prompt records an override for that session id only. The same phrase in any later
  prompt also lifts a pending respawn, which is the owner's way out if a respawn stalls.
- **D3. Outside the desktop app the session blocks and shows the command.**
- **D4. A session started on Opus on purpose is respawned too.** There is no exemption for child
  sessions; spawners start children on the registry's main id.
- **D5. A child that is still wrong never respawns again.** A mismatched session with
  `CLAUDE_CODE_CHILD_SESSION=1` whose prompt came from a respawn (the instruction marks it with the
  line `respawned-by-model-guard`) takes the exit-2 path instead, so a desktop app that ignored the
  `model` argument produces one blocked session, never a loop.

## Facts this design rests on

From <https://code.claude.com/docs/en/hooks>, read 2026-11-22:

- Only SessionStart receives `model`, and it is optional (absent after `/clear` or on recovery). Its
  value is a full id such as `claude-opus-5`. SessionStart also carries `source`: `startup`,
  `resume`, `clear` or `compact`.
- Every event receives `session_id`.
- UserPromptSubmit exit 2 blocks the prompt and shows stderr to the user, not the model.
  `additionalContext` reaches the model and is not shown as a chat message.
- Hooks on one event run in parallel, so order in the settings file means nothing.

From this machine and the desktop app's own tool schemas, 2026-11-22 (not from the hooks page; the
live acceptance below is what proves them):

- The desktop app sets `CLAUDE_CODE_ENTRYPOINT=claude-desktop`; a session started by another session
  also has `CLAUDE_CODE_CHILD_SESSION=1`.
- `mcp__ccd_session__start_session` takes `initiation`, `context`, `cwd`, `model` (a full id such as
  `claude-sonnet-5-5`, same family as the parent or cheaper) and `prompt`.
  `mcp__ccd_session_mgmt__archive_session` takes `session_id: "self"` and asks the owner to approve
  unless the session runs in auto or bypass mode.
- Existing hooks deny a tool call by exiting 2 with the reason on stderr (`spawn-envelope.sh`).

## Mechanism

One script, `claude-config:shared/tools/model-guard.sh <event>`, with state in
`${MODEL_GUARD_STATE_DIR:-$HOME/.claude/state/model-guard}/<session_id>.json`. It reads
`session_id`, `source`, `model` and `prompt` from stdin with `sed` patterns, never with bun or python,
because it runs on every tool call. A fields-it-cannot-read payload is treated as "nothing to do".

**Registry.** `shared/model-roles.json` gains a full id beside each Claude Code alias, for example
`"execution": { "model": "sonnet", "id": "claude-sonnet-5-5", "verified": true }`. The alias stays
the pin the resolver checks; the id is what `start_session` needs. `model-roles.ts main claude`
prints `<alias> <id>` for the main tier, tested first in `model-roles.test.ts`.

**Matching.** Strip any `[...]` suffix, split on `-`, and match when the alias is one of the tokens.
`claude-sonnet-5-5`, `sonnet` and `sonnet[1m]` match `sonnet`; `claude-opus-5-5` does not.

1. **`start`, SessionStart.**
   - `source: startup`: writes a fresh state file with the payload's `model` (or `unknown`) and the
     main tier's alias and id, read once with `bun "$HOME/.claude/tools/model-roles.ts" main claude` (the installed copy, which `link-machine.sh` links to the repo). When bun is missing,
     it records `unknown` and prints one warning line, so the session runs unguarded and says so.
   - `resume`, `clear` or `compact`: leaves an existing state file alone, so the `prompted` flag and
     any override survive and a long task is never respawned mid-way. With no state file, it does
     what `startup` does but sets `prompted` at once, so a resumed session is never respawned.
   - Every `start` deletes state files older than seven days.
2. **`prompt`, UserPromptSubmit.**
   - No state file, an `unknown` model, or a match: nothing.
   - A later prompt containing `keep this model` while `respawn-pending`: clears pending, records the
     override, nothing else.
   - Otherwise, only on the first prompt (no `prompted` flag; it is then set):
     - mismatch with `keep this model`: records the override, nothing else;
     - mismatch with `CLAUDE_CODE_ENTRYPOINT=claude-desktop`, unless it is a respawned child (D5):
       sets `respawn-pending` and prints the stdout JSON
       `{"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "additionalContext": "..."}}`,
       whose context tells the session to do three things and nothing else. First, call
       `start_session` with `initiation: "user_asked"`, `context: "fresh"`, `cwd` set to the
       current directory, `model` set to the registry id, and `prompt` set to the line `respawned-by-model-guard` followed by the owner's prompt
       verbatim (the hook embeds it JSON-escaped). Second, tell the owner in one line that it
       started on the wrong model, which session took over, and that attachments or images in the
       prompt did not carry over and need re-adding there. Third, call `archive_session` with
       `session_id: "self"`;
     - mismatch with any other entrypoint (the CLI, Nimbalyst, Codex, DSH): exit 2. Stderr says the
       session is on the wrong model, gives the restart command without the prompt
       (`claude --model sonnet` for Claude Code), and asks the owner to paste the prompt again in the
       new session. The prompt is never embedded in a command, so no shell quoting is involved.
3. **`tool`, PreToolUse, no matcher.** When the state file says `respawn-pending`, it exits 2 with
   the reason for every tool except `mcp__ccd_session__start_session`,
   `mcp__ccd_session_mgmt__archive_session` and `ToolSearch`. Other PreToolUse hooks still run in
   parallel, which is harmless: a call one hook denies does not run. When the state file is absent or
   not pending, it exits after one `sed` and one file test.

If the session ignores the instruction, every tool stays denied, so it can do no work. The owner
types `keep this model` to carry on, or archives it by hand. If `start_session` refuses, the session
says so in one line and the owner restarts by hand. The manual way to clear a stuck session is to
delete its state file; MODELS.md names the path.

**Handoff.** `shared/commands/handoff.md` gains one line: a successor session is started with
`model` set to the registry's main id, so a handoff from an Opus session never produces an Opus
successor that then respawns.

Out of scope: a model switch from the menu partway through a session (a later plan can use
PreModelSwitch); Codex and DSH payloads, unchecked for a model field (verifier rows report
UNSUPPORTED); subagents, which are pinned in their agent files; and the read-only list for built-in
agents in `spawn-envelope.sh`, found during this review and left for its own small task.

## Steps

All in claude-config, test first. A bun test drives the bash script through Git Bash, as
`spawn-envelope.test.ts` does. Every test sets `MODEL_GUARD_STATE_DIR` to a temporary directory.

1. **Tests first** in `model-roles.test.ts` (the `main claude` command) and `model-guard.test.ts`:
   matching for `claude-sonnet-5-5`, `sonnet[1m]` and `claude-opus-5-5`; `startup` versus `resume`,
   `clear` and `compact`, with and without a state file; the desktop respawn context carrying the
   prompt verbatim with quotes, `$`, backticks and newlines, and the registry id; the exit-2 path with
   the restart command and no prompt in it; `keep this model` on the first prompt and on a later
   pending prompt; a second prompt never triggering; no state file and `unknown` never triggering;
   `tool` denying Edit, Bash and Agent while pending, allowing the three named tools, and allowing
   everything otherwise; bun missing at `start`; and the seven-day cleanup.
2. **Registry ids, the resolver command and the hook.**
3. **Handoff line** in `shared/commands/handoff.md`.
4. **Wiring.** In `machines/tjakoens-windows-pc/settings.json`, one entry per event, in the form every
   hook there already uses:
   `"C:\\Program Files\\Git\\bin\\bash.exe" "C:\\Users\\tjako\\.claude\\tools\\model-guard.sh" start`
   (and `prompt`, `tool`). On both MacBooks (`machines/tjakoens-macbook-air/settings.json` and
   `machines/tjakoens-macbook-pro/settings.json`): `bash "$HOME"/.claude/tools/model-guard.sh start` (and
   `prompt`, `tool`). Add `model-guard.sh` to `expected-hooks.txt`. The MacBook entries cannot be run
   from the Windows PC; the owner's next MODELS-VERIFY run there is their test.
5. **Verifier.** `model.guarded` (mechanically enforced) in `mil-verify.ts`, tested first in
   `mil-verify.test.ts`. It takes the three model-guard command strings from the live settings, runs
   each with `MODEL_GUARD_STATE_DIR` set to a fresh temporary directory and `session_id`
   `mil-verify-fixture`, feeds `start` with `claude-opus-5-5`, a desktop first `prompt`, then `tool`
   for Edit, and expects `respawn-pending` and exit 2. It never touches the real state directory.
6. **Run report** at `claude-config:artifacts/runs/<date>-model-guard-respawn.md`.
7. **Standard.** A short section in `standards/MODELS.md` (the rule, the override, the stuck-session
   path, the attachment limit) and a probe in `standards/MODELS-VERIFY.md`; regenerate the index with
   `bun run standards:index` in the same commit. This step runs in a portfolio session after the
   claude-config work is committed.

## Acceptance

**The build session proves:** every test in steps 1 and 5 red first and green after; the full
`bun test shared/tools` suite with no new failure; `model-roles.ts check` still clean.

**After the owner pushes and applies settings, an acceptance session proves:**
`mil-verify --harness claude` shows `model.guarded` PASS; a desktop session opened on Opus with an
ordinary prompt starts a Sonnet session with the same prompt and asks to archive itself; one opened
on Opus with `keep this model` carries on; and a `/compact` in a guarded session does not respawn it.

## Envelope

- Lane: gated. Hooks are reviewed by the owner before they go live.
- Scope cap: the `touches` list.
- Hard stops: no push; no change to `human-lane.sh` or `spawn-envelope.sh`; no session writes live
  settings; no Edge repository.
- Ask-triggers: a test cannot be made red first; a gate goes red twice on the same cause; the live
  desktop behavior differs from the facts above.

## Owner's answer

D4 was answered on 2026-11-22: respawn it too.

## Resume card

- Stopped: All seven steps are done. The guard passed live acceptance on 2026-11-22 after six runs, and step 7 added the Model guard section to MODELS.md and a probe to MODELS-VERIFY.md.
- Next: The owner pushes claude-config and this repo.
- Waiting on: Nothing.
- Ended: done
- Left: 2026-11-22 by claude
