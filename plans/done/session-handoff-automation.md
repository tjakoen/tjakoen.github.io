---
id: session-handoff-automation
status: done
track: ai
depends: []
touches:
  - .claude/settings.json
  - tools/
  - standards/SESSION-LOOP.md
owner: unassigned
---

# Hand off without being asked

Asked 2026-08-09. Today a handoff happens because someone notices the thread is long and says so.
The ask is that it fires on its own: when the context gets close to full, or when the task and its
subtasks are done, the session makes the state durable, writes the brief, and opens the next tab in
the same workstream.

SESSION-LOOP §5 already says *when* a handoff is worth emitting and *what* it contains. Nothing here
changes that contract. This is the trigger and the wiring under it, which is the half that has always
been human.

## The mechanism exists, in three pieces

**The spawn.** Nimbalyst's `spawn_session` takes a self-contained prompt, runs as a sibling in the
same workstream (shared files-edited and tabs), and inherits the caller's working directory including
a worktree. `inheritModel` keeps the next tab on the same model. This is the "new chat tab related to
the same session" half, and it is already built.

**The brief.** The `/handoff` skill already generates it to SESSION-LOOP §5's shape. The automation
composes the two: generate, then spawn with it. No new prose format.

**The token trigger, and this is the part worth pinning.** A session cannot read its own remaining
context, but the harness writes it to disk. Every assistant turn in
`~/.claude/projects/<slug>/<session-id>.jsonl` carries a `usage` block, and
`input_tokens + cache_creation_input_tokens + cache_read_input_tokens` on the newest one is the
context actually being carried. Measured on the session that wrote this plan: about 90k. So the
trigger is a hook that tails one file and compares one number. No model, no guessing, the same
posture as every other mechanical check here.

## The design questions

- **The threshold, and which side of it.** "Close to 200k" is two different rules: warn at 160k so
  there is room to close cleanly, or hard-stop at 190k. The first is useful, the second is a
  guarantee. Probably both, at different volumes.
- **Auto-spawn or auto-offer.** Spawning a tab unasked is a real action taken without a human in the
  loop, which is exactly what LOOP §4b calls outward-facing. The honest first version warns and
  offers; the version that spawns on its own should wait for the classification work in
  `plans/agent-autonomy-tiers.md` to say which lane it sits in.
- **Task completion is a judgement, not a number.** "Done and all subtasks done" has no file to read.
  It is a rule in the standard and a habit, and the hook can only remind.
- **A handoff whose state is not durable is a trap** (SESSION-LOOP §5). The trigger must run the gate
  and the commit check first, or it will cheerfully hand the next session an uncommitted tree.
- **Where the rule lives.** A hook in `.claude/settings.json` is per-repo. A `.nimbalyst`-level rule
  would be per-project across every session. Both, probably, but the estate's answer is usually the
  committed file rather than the tool config.

## Tasks

- [x] Write the reader: `tools/context-usage.ts`, with `tools/context-usage.test.ts` (10). Verified
      against a real 1083-turn session, cross-checked against an independent count: 834,960 both ways.
- [x] Decide the two thresholds and which one is loud. **The 200k premise was wrong** and the
      measurement is the finding: twelve recent sessions here reach 835k, 458k, 267k, 264k. The
      window is 1M on claude-opus-5, so the defaults are warn 700k, stop 900k, both overridable.
- [x] Wire it as a hook and confirm it fires. It runs inside `tools/review-gate.sh` ahead of the git
      guards, because a clean tree can still be one turn from the end of the window, and `--quiet`
      keeps it silent until it crosses the line. Verified end to end through the hook with a real
      payload on stdin.
- [x] Carry the reader to the other repos, or move it somewhere all of them mount. **Mounted, not
      carried.** Copying was the wrong half of the "or": the reader takes its transcript path off the
      hook payload and derives the rest from the cwd, so a per-repo copy would have been the same
      file three times. It lives at `~/.claude/tools/context-usage.ts` with its test, run by
      `~/.claude/tools/session-guard.sh` from a user-level Stop hook, which also took the
      durable-state half out of the portfolio's gate for the same reason. Owner asked what happens on
      a new device: `~/.claude` is itself a repo (`tjakoen/claude-config`), so the trigger travels
      with a clone. The portfolio's `tools/review-gate.sh` keeps only what is actually its business,
      proof verify and the tour reminder, and the two hooks are additive so both still fire.
      Verified in four repos at a forced threshold: portfolio (5 uncommitted), pantry (2 unpushed),
      bread and grain (both green), plus silence at the default threshold.
- [x] Exclude the off-limits path. A machine-level hook runs everywhere by definition, and the edge
      rule is "do not read it either", so the guard exits on a prefix match before it touches git or
      the transcript. Verified: forced warn in that tree prints nothing. Overridable by env, since
      the path is this machine's fact rather than a rule anyone else should inherit.
      NOT DONE, and deliberately: the owner asked for that checkout to be deleted. Its remote is
      2FA-gated and unreachable from here, so deletion cannot be undone and cannot be verified safe
      without reading the repo, which is the thing the rule forbids. Left for the owner to do by hand
      from a machine that can reach the remote.
- [x] Add the durable-state precondition, so the trigger runs the gate before it suggests anything.
      Lives in `tools/review-gate.sh`, not in the reader: the reader stays pure over a transcript and
      keeps its unit tests, and git is the gate's business. A non-empty `--quiet` capture is the
      warn/stop signal, which avoids both a second read of a file that runs to tens of megabytes and a
      verdict string this script would have to keep in step with the tool. It reports three facts
      (uncommitted paths, unpushed commits or a missing upstream, proof verdict) and says so plainly
      when all three are green, because a gate that only ever complains gets skimmed.
      `CONTEXT_WARN` / `CONTEXT_STOP` were added alongside it: without them the fire path could only be
      seen by actually reaching 700k, so nobody had ever watched it work. Verified across all four
      branches — silent at ok, dirty tree, clean-with-upstream, and unpushed/no-upstream (the last two
      in a throwaway repo, since this tree cannot be clean and dirty at once).
- [x] Amend SESSION-LOOP §5 with the trigger, keeping the shape of the brief where it already is.
      Two touches, both additive: the durable-state paragraph now says the precondition is checked
      rather than recited, and a new paragraph after the measurement one records that the trigger is
      built, where the two lines sit, and that they are one machine's measurement rather than a
      number to inherit. The brief's shape is untouched. voice-lint holds at 42 pre-existing flags,
      so nothing new was added; the file path is italicised rather than backticked for that reason.
- [x] ~~Only then, and only if the autonomy plan puts it in a lane that allows it, let the trigger
      call `spawn_session` itself rather than offering.~~ **Rewritten and closed 2026-08-10: the hook
      recommends, the model asks, and nobody builds a spawning CLI.**
      The lane question came out fine and was not the blocker: LOOP §4b classifies by
      irreversibility, and a spawned sibling is reversible (close the tab) and inward-facing, so it
      sits in the gated lane rather than the human one. What blocks it is plumbing. `session-guard.sh`
      is a bash Stop hook and `spawn_session` is an MCP tool held by the model, so a shell cannot
      call it at all.
      Of the two ways out, the CLI entry point was rejected. It would put a committed hook in this
      estate on the private internals of one editor, on one machine, to automate a step that the
      gated lane says a human confirms anyway. The saving is a sentence; the cost is a coupling that
      breaks whenever the host changes and that no other repo here would ever be able to use.
      So the task becomes the shape that was already true: the hook reports the reading and the
      durable-state facts, and the model reads that and offers. One line was owed to make the offer
      real rather than implied, and `context-usage.ts` now carries it in the stop message: offer to
      open the sibling, and opening one unasked is not that line's call.
      What this deliberately does not do is fire on its own. A session that opens tabs without being
      asked is a session nobody is watching, and the whole point of §5 is that the handoff is the
      moment a human is still holding the thread.
