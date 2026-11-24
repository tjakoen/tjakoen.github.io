---
id: session-labels-and-pantry-link
status: doing
track: ai
depends: []
touches:
  - plans/
  - standards/SESSION-LOOP.md
  - standards/BRIEF.md
  - ../../../.claude/tools/session-name.sh
  - ../../../.claude/tools/spawn-session.sh
owner: ai
---
# A: Session labels and the PANTRY link

> Asked on 2026-11-24: name every session so it immediately says what the work is, make that the
> PANTRY plan's name too, mark which session is the parent and which are its children, and have the
> reply open PANTRY on the right project once the actions are on screen.

## Why

OpenCode already stores a parent on every session and its API accepts one, so the tree exists. What
does not exist is a name. A child session is titled `general: <first 60 characters of the prompt>`,
which is identical across siblings, and a root session gets a model summary that has nothing to do
with its PANTRY plan. The session list then reads as a pile of paraphrases, and the board reads as a
pile of `chat-2026-11-24-…`, and nothing joins the two.

`spawn-session.sh` calls `opencode run`, which creates a new top-level session. Our children are
siblings because of our own tool, not because the harness cannot nest them.

## The shape

```
A:    Portfolio Design Changes     root session, root plan
A1:   Style                        first child
A2:   Note content                 second child
A1.1: Token audit                  grandchild
```

- One command writes the session title and the plan's H1 together, so they cannot drift.
- A spawned child is a real child: it carries `parentID`, and it reports back into the parent's
  inbox when it finishes.
- The letter is allocated per project per day, skipping any letter a session touched in the last
  twelve hours. A child takes its parent's prefix and the next free number.
- A reply that ends with actions carries `pantry://project/<name>?to=<page>`, and the session moves
  the owner's window there first with `pantry_act`.

## Tasks

- [x] `session-name.sh`: one command, sets the session title and the plan's H1 together
- [x] `spawn-session.sh --parent`: allocate the next sibling label, and create a real child
- [x] `SESSION-LOOP` owns the naming rule, `BRIEF` owns the PANTRY line
- [ ] An OpenCode plugin does what `auto-plan.py` does: opens the plan, claims it, names the session
- [ ] A PANTRY panel in the OpenCode desktop side region, embedded through a GUI plugin

## Notes

The last two are separate builds and stay on the board. Until the plugin lands, an OpenCode session
is labelled by `session-name.sh` and by `spawn-session.sh --parent`, which is every session this
estate starts on purpose.
