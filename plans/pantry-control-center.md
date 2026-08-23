---
id: pantry-control-center
status: doing
track: ai
depends: [pantry-review-layer, runs-surface-polish]
touches:
  - ../pantry/app.ts
  - ../pantry/app.test.ts
  - ../pantry/sessions.ts
  - ../pantry/sessions.test.ts
  - ../pantry/config.ts
  - ../pantry/config.test.ts
  - ../pantry/context.ts
  - ../pantry/doctor.ts
  - ../pantry/capture.test.ts
  - ../pantry/crumb-mount.test.ts
  - ../pantry/drift.test.ts
  - ../pantry/init.test.ts
  - ../pantry/preview.test.ts
  - ../pantry/retrieval.test.ts
  - ../pantry/skills.test.ts
  - ../pantry/pantry.css
  - ../pantry/pantry-control.js
  - ~/.claude/tools/session-event.sh
owner: unassigned
---

# The control center: one place that knows where the project is

The problem is not that any single session is opaque. It is that there are six of them, plus their
subagents, spread over three repos, and no surface anywhere answers the question a person actually
has at nine in the morning: where is this project, and what is it waiting on. Nimbalyst solves the
neighbouring problem well, a session per tab and a board to group them, so the gap it leaves is
about the project rather than about the sessions.

PANTRY already holds most of the answer and has never joined it up. `/plans` renders the plan board
from files. `/runs` holds the closed runs and what evidence each one is missing. `/decisions` and
`/answers` hold the open questions and the log of answers. `/map` draws the knowledge graph the
agent works from. `/timeline` draws the retrospective history. Five surfaces, five separate visits,
each one true and none of them a status.

> The control center is a projection of the plan, with sessions as an attribute of a row. It is not
> a list of sessions.

That constraint is the whole design. A list of sessions is a monitor, it duplicates the editor, and
it goes stale the moment nobody is watching it. The plan is the durable spine: a step either moved
today or it did not, and whether a session is alive right now is a fact hanging off that step. Get
this backwards and the surface becomes a screensaver for the impatient.

## The four questions, and where each already has data

1. **What is this project meant to do?** The plan board, live at `/plans` since PROOF landed.
2. **What is moving right now, and who is moving it?** Nothing anywhere knows this. PANTRY has no
   concept of a session at all. This is the one genuinely new thing the plan builds.
3. **Did the loop actually run this time?** `hooks.ts` knows which mechanisms are mounted, doctor
   knows which checks are due, `/runs` knows what a closed run carried. Nothing shows whether the
   session in front of you ran any of it.
4. **What is waiting on me?** `/decisions` and the answer log, both live.

Three of the four are built. The work is the second one, plus a page that joins all four, plus the
step from one repo to several.

## The session record, and why not the transcript

The harness writes a JSONL transcript per session under the config dir, and `context.ts` already
knows how to find that directory for a given repo. It is tempting, because it is append-only, richly
detailed and needs no instrumentation at all.

It is also a file format nobody here owns, undocumented, belonging to a vendor who can change it in
a point release. Building the spine of a surface on it means the surface breaks on somebody else's
schedule.

So the order is: a heartbeat file first, the transcript later and only as enrichment. A machine-level
hook appends one line per event to a per-repo JSONL log, on SessionStart, on a coarse sample of
PostToolUse, and on Stop. Each line carries the session id, the repo, the parent session where the
harness supplies one, the event kind, and a timestamp. That is a schema we control, it is a few
hundred bytes a session, and it degrades to an empty list rather than to a crash. If transcript
parsing is ever added, it enriches a row that already renders without it, and a parse failure costs
detail instead of the page.

The state a row can honestly show from heartbeats alone: alive, idle since a timestamp, ended, or
waiting on a decision. Not what the model is thinking. A surface that animates a thought it cannot
observe is a lie with a spinner on it.

## Phases

**C0. The session record.** The event schema, the emitter hook, `pantry/sessions.ts` as the reader,
and `/sessions.json` as the machine twin. No page yet. Doctor gains a check that the emitter is
mounted, because an observer layer reading an empty log and rendering a calm dashboard is the exact
silent-degrade failure the hooks manifest was built to prevent.

**C1. The page, from files, no live transport.** `/control` renders the join: every plan with an
open step, the sessions attached to each, the loop lamps for the current session, and the block of
things waiting on a human. It reads the same files everything else reads, so it can be walked, and
it can be replayed for a session that ended last Tuesday. Replay first is deliberate. A live view is
only ever watched by somebody sitting in front of it, and the value that survives the person walking
away is the record.

**C2. Live.** The same renderer with a tail on it. PANTRY serves no event stream of its own today,
but `app.ts` already imports PROOF's `watchPlans` and mounts its live channel, so the transport is a
precedent to extend rather than a mechanism to invent. The preview proxy already taught the cost of
this: a push path and a response path are not the same path, and anything rebased has to be rebased
in both.

**C3. The graph, lit up.** `/map` already draws the graphify knowledge graph for the project. The
graphify hook already fires on every edit. Joining those means the nodes a session touched in this
run can carry a mark, so a person sees which part of the codebase the work landed in without reading
a diff. Cheap, because both halves exist.

**C4. Several repos.** The registry lives outside every repo, because it is machine state and because
editing a config in seven places to add an eighth is worse than editing one list. The trap is already
recorded from the parked n8n design: decision ids collide across repos, since the id is a filename,
so anything that dedupes has to key on the pair of repo and id. Keying on the ref alone means an
answer in one repo silently suppresses the same question in another.

**C5. The review loop, folded in.** A finished run currently sits until somebody remembers to walk
it. The capture command and the review rail both exist, so the control center gains a row for a
review that is due, linking straight into the walk. That closes the loop the plan is named after:
work happens, the loop shows it happened, the review is the next thing on the same page.

## Read-only, and the question underneath it

PANTRY writes one thing, the answer log, and that constraint is what makes it safe to point at
somebody else's project. Every phase above is a read. The registry in C4 is machine state outside
the repos, not a write into them.

The interesting question is the one raised for later: whether PANTRY eventually becomes a place to
talk to the AI, with the editor still doing the editing. Worth saying plainly what that costs, so
the decision is made rather than drifted into. The answer channel is already a conversation, a
question routed to a human and an answer recorded, and extending that surface is in keeping with
what PANTRY is. Holding a channel to a model runner is a different thing: it makes PANTRY a client
of something that costs money and can act, and the model-free promise in its own docs would have to
be rewritten rather than quietly stretched. That is an owner decision with a real trade behind it,
and nothing in C0 through C5 depends on the answer.

## Tasks

- [x] C0. Design the event line and write it down before any code, including what is deliberately
      absent from it. **The schema and every "why not" is the header of `pantry/sessions.ts`.**
- [ ] C0. The emitter as a machine-level hook, mounted once, listed in the loop manifest.
      **Written and exercised against a scratch config dir; NOT mounted, because wiring it edits
      every session on this machine and that is the owner's call, not the build order's.**
- [x] C0. `pantry/sessions.ts`, pure over parsed events, file IO isolated the way `map.ts` isolates
      the graph load. **15 tests, and the clock is passed in so a payload is reproducible.**
- [x] C0. `/sessions.json`, and a doctor check on the log. **It measures whether events have
      ARRIVED, not whether the hook is mounted: the wiring lives in a settings file PANTRY has no
      business reading. Info when the log is absent, warn when it exists and cannot be read or
      carries a bad line that is not the last one.**
- [x] C0. The surface is off by default and the route refuses anything but loopback. **A row names
      the operator's home directory and every file a session wrote, none of which is in the repo
      being served, and `Bun.serve` binds every interface.**
- [ ] C1. `/control`, static, replayable, linked from `/runs` and `/plans` rather than living alone.
- [ ] C1. List the twin in `knowledge.json` and `llms.txt` when the surface is on and something is
      alive, beside the run-ledger entry. The one surface built for a machine reader is invisible to
      the index that reader consults.
- [ ] C1. The loop lamps: doctor at start, graphify, the gate, the handoff. Lit means it ran in this
      session, not that it is configured.
- [ ] C2. The live channel, extending PROOF's rather than adding a second one.
- [ ] C3. Mark the graph nodes a run touched, on `/map`.
- [ ] C4. The registry outside the repos, keyed on the pair of repo and id.
- [ ] C5. The review-due row, wired to the existing capture and rail.
- [ ] Decide: does the transcript ever get parsed, and what breaks when its format changes.
- [ ] Decide: does PANTRY ever hold a channel to a model, and does the model-free promise change.

## What is still rough

The privacy posture is settled and implemented rather than promised: the surface is off unless the
host asks for it, the route refuses anything that is not loopback, only a write-shaped tool
contributes a file path, and the off-limits tree is excluded by the working directory and by the path
being recorded. Two independent reviewers were pointed at C0 and between them found three blockers,
nine majors and five minors; every one is either fixed with a test or written down here.

The one that mattered most was not a leak. The harness fires its Stop event at the end of every
turn, not at the end of a session, so a stop taken as final made every live session read as ended
from its first turn onward. That is the single claim this whole layer exists to make. It now maps
SessionEnd instead, and a stop followed by later events is a session that carried on.

Volume is bounded rather than measured. The reader caps what it reads and says when it read only the
tail, and the emitter no longer records a path for every read, which was what made a read-heavy
session exempt itself from the throttle. Nobody has yet counted a real session's log, and that is
still owed before C1 renders it on a page.

The honest risk is that this is a dashboard nobody opens. Replay-first is the hedge, and the second
hedge is that it must earn its place from the pages people already visit. If `/control` needs to be
remembered, it has already failed.
