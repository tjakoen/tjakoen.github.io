# Goldfish review: model-intelligence-layer-phase-a

Three fresh goldfish read the plan at `plans/model-intelligence-layer-phase-a.md` with only the plan
and its linked files, on 2026-11-22. None was a fork.

## Comprehension: UNDERSTANDABLE

Fourteen gaps were found and resolved in the plan before the other two passes ran: the main model per
machine, the registry shape, the lighter envelope set, the session order around step 9, the reconcile
test path, level versus result, the fetch behavior, the context reader, the expected-hooks source, the
canary mechanism, and missing `touches` entries.

## Readiness: NO-GO

1. O1 and O2 are open, and step 6 cannot be built without O2.
2. The registry example leaves the concrete ids unfilled, so the implementer would invent the policy.
3. D5 (verify before naming) contradicts step 4 (write unverified ids).
4. The Astra exclusion rule names no id or pattern.
5. Nothing says how the verifier is invoked, or whether reconcile runs before it.
6. Nothing says what `live.match` and `hooks.wired` report for a harness that is not installed.
7. Acceptance asks for an OpenCode run that cannot happen, omits a Claude Code run, and names no one
   to flip the Codex `verified` flags.
8. It is not stated that `context-usage.ts` already counts cached input.
9. `mil-verify.test.ts` has no stated assertion or fixture.
10. Developer Mode detection, the slug source and the fixture origin are unspecified.
11. Codex coverage and the exact heading strings of the envelope guard are unspecified.
12. Removing the escalation hook has no test.
13. The `agents` map mixes roles and tiers.

## Critic

1. The reconcile writes the permission surface, and no step reconciles that with human-lane.sh.
2. The backups have no location, retention or restore path.
3. The escalation script must be unwired before it is deleted, or every prompt fails.
4. A timed-out fetch must be told apart from an up-to-date one, with tests.
5. The PreToolUse matcher must also cover `Agent` and `Task`, and the classification rule is ambiguous.
6. Goldfish being read-only must be tested against its frontmatter.
7. Codex ids cannot be verified on the Windows PC.
8. The registry test checks itself against the files it was written to match.
9. Fixture checks prove scripts, not live wiring.
10. Session start gets slower, and bun and DSH paths are unaddressed.
11. The order of reconcile and verifier is unstated.
12. The freshness probe has no falsifiable pass criterion.
13. OpenCode acceptance passes with no evidence.
14. The Windows symlink logic would be duplicated.
15. The MacBooks change to Opus without a verification or a notice to the owner.
16. "Multimodal" misnames the layer.
17. MODELS.md would state rules before session C proves them.
18. Strongest counterargument: a report-only reconcile, with the owner running `link-machine.sh`,
    closes the same gap without crossing the human lane, and Opus on every main session is the most
    expensive choice.

## Resolution

The owner answered four questions on 2026-11-22. Self-resolution repairs everything except the
permission surface, which is shown and applied only on approval (critic 1 and 18, readiness 1).
Sonnet runs the main session, and escalation goes to strong-tier agents, because a hook cannot switch
the model and a switch discards the cache (critic 15 and 18). The brief's tier table is the Codex
mapping, entered unverified until the owner's Codex run (readiness 3, critic 7). The row reads
"Model Intelligence Layer" (critic 16).

The plan was then rewritten. Each remaining finding maps to a change:
- readiness 2 and 13: the registry is fully specified, and agents map to tiers only;
- readiness 4: the `forbiddenDefaults` list;
- readiness 5 and 11, critic 11: the verifier command, and the reconcile runs first;
- readiness 6: UNSUPPORTED for a harness that is not installed;
- readiness 7, critic 13: a Claude Code run before handover, and OpenCode reported as not installed;
- readiness 8: the context reader already counts cached input;
- readiness 9: the mil-verify test is specified;
- readiness 10, critic 4: the slug source, the Developer Mode probe, a bare-repo origin and the
  failure-path tests;
- readiness 12, critic 3: the hook stays, so there is no deletion to order;
- critic 2: backups with retention and a restore command;
- critic 5 and 6: the fixed list wins, an unknown type counts as editing, the matcher is updated,
  and a frontmatter test guards the list;
- critic 8: rule tests on fixtures alongside the real-repo test;
- critic 9: `envelope.denies` runs the live command;
- critic 10: a two-second budget, the bun-missing case, and state files per harness;
- critic 12: a 16-hex canary with a stated pass criterion;
- critic 14: the shared `windows-links.sh`;
- critic 17: session C goes first, and MODELS.md describes what was built.

## Readiness, second pass: NO-GO, nine findings

Resolved: an owner checkpoint between the build and the acceptance; `codex/hooks.json` added to
`touches`; the Codex envelope left NOT TESTED until the Codex run observes its spawn tool; the review
advice names real agents; the slug is derived rather than repaired; tests for `--apply-settings` and
`--restore-settings`; the checks defined per harness; an `ids.verified` row and an owner for flipping
the Codex flags; and slowness shown in the row without failing it.

## Readiness, third pass: GO

Four non-blocking points were fixed: the stray slug item, the Codex effort pin, a named acceptance
session, and the byte comparison for `live.match`.
