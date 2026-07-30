# plans/README.md — the PROOF contract

This folder is a PROOF plan board. Each file is one plan: a markdown document with a small
frontmatter block, followed by prose and a task checklist. The board renders these files; it
never stores anything of its own.

## The frontmatter schema

Every plan file starts with a frontmatter block containing exactly these fields.

```yaml
---
id: 001-example        # equals the filename stem; the plan's stable address
status: todo            # one of: todo, doing, done, blocked
track: A                # optional; a free grouping label
depends: []              # ids of other plans this one waits on
touches: []              # optional; code paths this plan affects
owner: ai                # one of: ai, human
---
```

Field by field:

- id. Equals the filename without the extension. If you set it in frontmatter it must match
  the filename, or nothing that depends on it will resolve.
- status. One of todo, doing, done, or blocked. This is the one field that changes the most,
  and the one rule below is entirely about keeping it honest.
- track. Optional. A short label for grouping related plans; leave it empty if you do not need
  one.
- depends. A list of other plan ids this plan is waiting on. Empty list if none.
- touches. Optional. A list of code paths this plan is expected to affect, used to scope
  related tooling and show blast radius. Empty list if not applicable.
- owner. One of ai or human, marking whose intent the plan represents.

## The one rule

Files are the source of truth. The board is only a projection of what is already on disk.

Update a plan's status the moment the work behind it changes state. Do this in the same file
you are already editing, as part of the work, not as a separate bookkeeping step.

Never hand maintain a board, an index, or a tasks.json alongside these files. Any derived index
is generated from the plan files themselves; a hand edited copy of it is dual bookkeeping and is
not part of this design.

Never build a second plan system next to this one. If this project already tracks plans in
prose somewhere else, migrate that content into plans/ or leave PROOF out entirely.

## Viewing the board

Running proof check lints this folder for schema problems, illegal status values, and plans
that are marked done while their checklist still has open items. A viewer such as pantry, or
proof serve directly, renders these files as a kanban style board for a human to look at. The
board is read only; edit the plan files themselves to change anything.
