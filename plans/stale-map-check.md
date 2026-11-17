---
id: stale-map-check
status: done
track: ai
depends: []
touches:
  - tools/map-freshness.ts
  - tools/map-freshness.test.ts
  - tools/dsh-loop/cli.mjs
  - tools/dsh-loop/README.md
  - .claude/settings.json
  - .claude/hooks/map-freshness.sh
  - docs/HARNESS-DSH.md
  - CLAUDE.md
owner: ai
---

# Say when the map is older than the ground

Two things in this repo are derived and gitignored, and an agent navigates by both. The skills under
.claude/skills are generated from standards/ by the pantry sync. The code graph under graphify-out is
refreshed on edit and at session end. Either can fall behind its source, and nothing at session start
says so. The start command reports how old the graph is in minutes, which answers the wrong question:
a graph three days old over code nobody touched is fine, and one two minutes old over a file edited
after it is not.

The voice note on 11 November is the case that prompted this. The mounted voice skill had been synced
three days before a change to VOICE.md, and the only way the session found out was by diffing the two
files by hand.

## What the check does

One module, tools/map-freshness.ts, with a list of derived artifacts. Each entry knows how to compare
itself to its source and returns findings. Two entries ship now.

- **Skills against standards, by content.** For every standard that carries a when line, find the
  mounted skill by slug (the skill key, else the lowercased filename) and compare a hash of the body
  and a hash of the description against the standard's body and when line. Whitespace is normalized
  before hashing, because the sync re-encodes the when line and the comparison is about meaning, not
  folding. A stale skill is named, and so is the part that moved. This does not need the pantry
  package, which a cloud session and a DSH start without the pantry mount do not have.
- **Graph against code, by time.** The graph has no per-file hash this repo can read, so this one is
  honest about using mtime: the graph file against the newest tracked or untracked code file. It names
  that file and the gap.

An absent mount is a skip, not a failure: a cloud checkout has no skills and no graph, and a check
that cries wolf there is how a start report becomes furniture.

## Room for the standards index

A sibling session is adding a generated standards/INDEX.json. The module exports derivedFile, which
takes a path and a function that builds the expected content in memory, and reports stale when the
bytes on disk hash differently. Adding the index is one line in the artifact list once its generator
can be imported: the same regenerate and compare rule the pantry sync uses for skills, so mtime never
decides.

## Where it runs

- DSH: bun tools/dsh-loop/cli.mjs start prints the freshness lines after the graph age.
- Claude Code: a second SessionStart entry in .claude/settings.json runs a hook that prints only when
  something is stale, and stays silent when bun is missing.
- By hand: bun tools/map-freshness.ts, with --json for the facts and --strict to exit 1 when stale.

## Tasks

- [x] Plan.
- [x] The check, with the skills and graph entries and the derivedFile extension point.
- [x] Tests: fresh, stale body, stale description, missing skill, no mount, graph older and newer,
      derivedFile both ways.
- [x] Wire into DSH start and the Claude Code SessionStart hook.
- [x] Docs: HARNESS-DSH, the dsh-loop README, CLAUDE.md.
- [x] Gates and a run report.
