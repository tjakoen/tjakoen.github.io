---
title: "The hooks standard gets its second pass, a rendered page, and one claim it had forked"
date: 2026-08-21
status: complete
lane: gated
branch: main
scope:
  - standards/HOOKS.md
  - standards/README.md
verifiedBy: a Sonnet subagent that did not write the standard, plus the served HTML
---

# The hooks standard, verified rather than described

This run wrote `standards/HOOKS.md` and indexed it, then had it checked by an agent that did not
write it. The report at `2026-08-20-hooks-standard-and-exemption.md` was written by the parent, which
finished the landing while this session was interrupted, and it closes by naming two things it could
not do: the standard had never been read against a rendered page, and only the mechanical half of
VOICE had been run. This report carries what was owed after that.

## The second pass found a real defect

A Sonnet subagent checked every factual claim against the running scripts, the live hooks block, and
`link-machine.sh`. It confirmed the events, the matchers, the limits, the environment variable names,
the approval-file mechanism, the missing approval file and commit `797a67a` with quoted evidence, and
it found one thing wrong:

> **Section 3 claims blocking is unique to human-lane.sh, but section 4 and the file's own table say
> otherwise.** [...] This claim is copy-pasted verbatim from `human-lane.sh`'s own header comment
> ("WHY BLOCKING IS RIGHT HERE AND NOWHERE ELSE... That distinction is the owner's call of
> 2026-08-13") — which was true *when written*, on 2026-08-13, before spawn-envelope.sh existed.

The standard had inherited a comment written before a later decision, which is the exact failure its
own section 4 warns a reader about. Section 3 now says blocking is rare, that this hook was the first
of two, and that the second arrived a week later.

It also proved the guard's self-protection by running the rule rather than reading it:

```
printf '/Users/tjakoenstolk/.claude/settings.json' | grep -qE '(^|/)\.claude/settings(\.local)?\.json$'  → MATCH
```

And it surfaced a fragility neither script states outright: `human-lane.sh` reads the approval file
*before* the rules protecting the guard and the approval file, so an over-broad approved pattern
would unprotect both. Per this run's bound, that is now named in the standard and left unfixed.

## One claim went stale during the run

Section 4 said `spawn-envelope.sh` still opened with a NOT WIRED banner. It did when the standard was
written; the banner was corrected in claude-config `67a7781` while this run was in flight. Checked at
source rather than assumed, and the section now records that the header was caught and fixed, plus
the fact that the second machine carries its own settings copy and does not run this check at all.

## Rendered, not described

```
$ curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/standards/hooks
200
$ curl -s http://localhost:3000/standards/hooks | ...
table rows: 4
H2: 1. Where they live, and how a machine gets them
H2: 2. session-doctor.sh, at session start
H2: 3. human-lane.sh, before a write
H2: 4. spawn-envelope.sh, before a spawn
H2: 5. Three limits that cost something to learn
H2: 6. The off switch is part of the design
H2: 7. Red flags
H2: 8. Before you change one of these
```

Screenshot of the page top in the session. The desk shell traps scroll, so the rest of the page was
read out of the served HTML rather than from a viewport that would not move. `/standards` returns 200
and carries the new index row. A later session inserted a section 4b; the numbering still reads in
order.

## The skill mount was a question, not an assumption

The standard carries a `when:` key, so the sync tool mounts it with no extra wiring:

```
  sync  hooks (HOOKS.md)
18 skills mounted, 1 written, 0 pruned
```

Slug `hooks`, no override needed. The slug was checked against the harness listing first, because a
mount colliding with a built-in is silently shadowed, which is why `LOOP.md` carries
`skill: loop-standard`. Nothing claims `hooks`. The mount then appeared in this session's own skill
listing, which is the only proof it is reachable rather than merely on disk.

## Gate output, verbatim

```
lint gate: 1 lint(s) regressed against tools/lint-baseline.json:
  voice:backtick: baseline 3073 -> now 3075 (+2)
A real increase is fine — rerun `bun run lint:baseline` to accept it deliberately. A surprise
one is a warning worth fixing before it joins the baseline permanently.
```

**Both backticks belong to another session in this shared tree**, checked rather than assumed:

```
$ for f in content/notes/build-the-floor.md docs/CONTENT-BACKLOG.md standards/HOOKS.md; do
    echo -n "$f: "; git diff -U0 -- $f | grep '^+' | grep -c '`[^`]\+`'; done
content/notes/build-the-floor.md: 0
docs/CONTENT-BACKLOG.md: 2
standards/HOOKS.md: 0
```

`standards/HOOKS.md` carries zero backticks and zero em-dashes in prose. Before those edits landed the
gate read:

```
lint gate: level. 4455 flag(s) total (oxlint + voice-lint), matching or under the 4455 in tools/lint-baseline.json (generated 2026-08-19).
```

```
link-lint: 56 rendered file(s), no dead relative links.
```

```
[warn] cold-start context: 20,008 chars over 4 files, over the 20,000 budget — MEMORY.md is 10,530 of it
[warn] graphify freshness: merged-graph.json predates this repo's own extraction — run pantry graph merge
[warn] skills mounted: 1 stale (hooks) — run pantry skills sync
21 checks, 0 failing, 3 due
```

The skills row was this run's own doing and is cleared: `18 skills mounted, 0 written, 0 pruned`. The
other two are carried by name and are not this run's; the cold-start one is now on its second carry.

## Diffstat

```
 standards/HOOKS.md   | 320 +++++++++++++++++++++++++++++++++++++++++
 standards/README.md  |  10 ++
```

## What was not done

- **No hook was edited, no settings file was touched, nothing was pushed.** Two limitations found
  while writing, the approval-file ordering and the stale banner, were named in the standard. The
  banner was fixed by another session, not this one.
- **The file is longer than its model.** `GRAPH.md` is 9.5K and this is 18.6K. Three hooks each owing
  four answers is structurally more than GRAPH's one mechanism, so the length was accepted rather than
  trimmed into vagueness.
- **The other wired hooks are named in one paragraph and not documented.** They report rather than
  gate, and the handoff one belongs to `SESSION-LOOP.md` section 5.
- **The judgment half of VOICE is still owed**, exactly as the parent's report said. No linter runs it.

## What needs human eyes

- **Parallel sessions committed this run's working tree twice, mid-run**, as `b0c69d1` and inside
  `b66446e`. Nothing was lost and nothing was reverted, but the fix from the second pass landed inside
  a commit about something else, and the same shared-tree race hit a different session here yesterday.
  That is twice in two days.
- **This run's own commits and the parent's report describe the same work from two sides.** Neither is
  wrong; whoever reads the ledger should read both or neither.
- **claude-config is three commits behind its remote and one ahead.** Checked: none of the upstream
  commits touch `shared/tools/` or `machines/`, so nothing described in the standard is stale because
  of it.
