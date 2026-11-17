# The DSH loop CLI

This directory keeps the repo-side start and end commands for DeepSeek Harness. The machine-level
plugin, guards, checklist, MCP config and installer live in the private agent-config repo at
shared/tools/dsh, linked into ~/.dsh/loop.

- start: the doctor, the skill mount check, the graph age and the freshness check from
  tools/map-freshness.ts, which names any skill or graph that fell behind its source.
- end: the graph refresh, the typecheck, the lint gate and the run ledger evidence.
- close: whether this session can be archived, as one of four verdicts with the evidence above it.
- guard: ask the human-lane rules about a path before a write.
- envelope: check a handoff file for the four headings.

The full mapping, the install and the limits are in docs/HARNESS-DSH.md.
