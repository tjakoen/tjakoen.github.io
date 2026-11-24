---
status: complete
consulted: [SESSION-LOOP.md, BRIEF.md, VOICE.md, LOOP.md, COMMIT-STANDARD.md, skill:session-loop, skill:brief, skill:voice]
plan: plans/session-labels-and-pantry-link.md
verifiedBy: >
  agent-config: 1061 tests pass, including 6 new session-name tests and 5 new spawn-session tests; a real
  child session was created with parentID, confirmed absent from the top-level list, and deleted.
  portfolio: tsc clean, 1063 tests pass, the lint gate at 4497 flags against a baseline of 4528, and the
  standards index regenerated to 31 standards and 276 sections.
unpushed: 0 | both commits are on origin/main, agent-config 45a3f9cc and portfolio 573509a9
doctor: The session-start checklist reported Agentic Loop Loaded, with warns for the 20k instruction budget and 97 commits since the newest run report.
touched:
  - standards/SESSION-LOOP.md
  - standards/BRIEF.md
  - standards/INDEX.json
  - plans/session-labels-and-pantry-link.md
  - ~/Local/agent-config/shared/tools/session-name.sh
  - ~/Local/agent-config/shared/tools/session-name.test.ts
  - ~/Local/agent-config/shared/tools/spawn-session.sh
  - ~/Local/agent-config/shared/tools/spawn-session.test.ts
  - ~/Local/agent-config/shared/CLAUDE.md
---

# A session wears the name of its work, and PANTRY follows it

Asked in chat on 2026-11-24: name sessions so they say what the work is, make that the PANTRY plan's
name too, show which session is the parent and which are its children, and have the reply open PANTRY
on the right project once the actions are on the page.

## What was actually there

- Every session row carries a parent id, `POST /api/session` accepts `parentID` and `title`, and
  `PATCH /api/session/{id}` sets the title. Verified on this session.
- `spawn-session.sh` called `opencode run`, which creates a **top-level** session. The children this
  estate spawns are siblings because of our tool, not because the harness cannot nest them.
- `opencode session list` prints top-level sessions only, and `session delete` takes a session and its
  children. So the tree is real in the database and invisible in the list.
- Titles come from the first prompt: three sibling sessions were titled with the same sixty
  characters of their prompt, and root sessions got unrelated model summaries.

## What changed

- **`session-name.sh`** writes the label to the session title through the API and to the plan's first
  heading, so the board and the list cannot drift. A label with no letter allocates the next free
  root letter for the project, per day, skipping any letter a session used in the last twelve hours.
- **`spawn-session.sh --parent <id|self>`** creates a real child through the API, titled `A1` under
  `A`, `A1.1` under `A1`, counting siblings from the titles already in the project. It refuses a
  parent with no label rather than guessing a letter.
- **SESSION-LOOP §8** owns the rule, including the tree and the twelve-hour letter rule.
- **BRIEF §3** now says a reply that ends with actions moves the owner's PANTRY window to the plan
  first and links it under the actions, with a checklist item and a rationalization.
- The global instruction points at both commands.

## Evidence

| Claim | How it was checked |
|---|---|
| A child is a real child | Created `A99: probe` with `parentID` on this session, read it back with the parent set, confirmed it is absent from `session list`, deleted it |
| The title and the plan move together | Ran `session-name.sh "A: …"` on this session; the title read back correctly and the plan's H1 changed |
| The label allocates correctly | 6 tests: given label, next free letter, B after A, a title that only looks like a letter, the twelve-hour expiry, dry run |
| Sibling counting | 5 tests: A1 under A, A3 after A1 and A2, A1.1 under A1, `--as`, a refused unlabelled parent |

## What did not go green first time

- The plan lookup matched no project because macOS resolves `/var` to `/private/var` and the registry
  stores the other one. Both sides are now resolved before they are compared, and a test would have
  caught it if the first version had one.
- One `bun test` run in agent-config reported 3 failures at `model-guard.test.ts:615`. Two later runs
  of the same suite reported 0, and the failing file is untouched by this change. Called a flake, not
  a pass.

## Left on the board

- An OpenCode plugin that does what `auto-plan.py` does for Claude Code and Codex: open the plan,
  claim it, name the session. Until it exists, OpenCode sessions are named by hand or by the spawner.
- A PANTRY panel in the OpenCode desktop side region, embedded as a `WebContentsView` through a GUI
  plugin. The API exists and is experimental; see the reply of 2026-11-24.
