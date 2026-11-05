---
title: Closing the AI agency plan, from the export fix to the subject line
date: 2026-11-05
status: complete
lane: gated
branch: claude/agency-close
scope: [tools/export.ts, tools/desk-audit.ts, e2e, content/tours, src/ai, view/pages/mail.html, plans/ai-agency-navigation.md, artifacts/runs]
touched:
  - tools/export.ts
  - e2e/visual.e2e.ts-snapshots/catalog-darwin.png
  - content/tours/review-contact-flow-and-xray.md
  - src/ai/xray-panel.ts
  - e2e/xray-panel.e2e.ts
  - src/ai/prompt.ts
  - src/ai/desk-reasoner.ts
  - src/ai/desk-reasoner.test.ts
  - tools/desk-audit.ts
  - e2e/desk-model-chain.e2e.ts
  - src/ai/contact-draft.ts
  - src/ai/contact-subject.test.ts
  - src/ai/desk-door.ts
  - view/pages/mail.html
  - e2e/desk-contact-prefill.e2e.ts
  - plans/ai-agency-navigation.md
  - artifacts/runs/2026-11-05-ai-agency-close.md
diffstat: six merged pull requests, 13 to 17 plus this one; the largest, the contact protocol, was 5 files and 61 insertions
unpushed: 0 | every change went through a pull request and was merged after CI passed
verifiedBy: none | no independent reviewer; CI, the real-model audit and browser checks are the evidence
doctor: not rerun this run | the three 2026-10-14 builder reports' evidence and the memory budget were still carried on November 4
---

# Closing the AI agency plan, from the export fix to the subject line

## Envelope

The owner asked, in turn: whether x-ray v2 was done and verified, then to ship the fix, clear the
follow-ups, finish the AI agency plan, try the model on the contact flow, draft a subject line, and
keep the task-specific handovers instead of a general planner. Each change went through its own pull
request, merged only after CI passed, with the owner's go-ahead in chat.

## Result

The first x-ray merge did not deploy: the static export froze modules from a fixed list and the new
panel module was not on it, so verify:export stopped the upload. The live site stayed on the earlier
build. PR 13 added the module and the panel went live.

The follow-ups removed a stray node_modules link that split Playwright into two instances, checked
the panel in light theme and at phone width, and refreshed the catalog baseline, which had gone stale
on grain's later component docs before this work.

The review tour walks the contact flow and the AI view. Writing it found the panel covering the
desk's chat input, so the panel now docks beside the chat aside.

The model may now start the contact flow with a CONTACT: token. On the real 0.5B, across two runs with
identical results, it started the flow for 2 of 4 phrasings the fixed pattern misses and for 0 of 2
controls, and the two existing answer scenarios still passed.

The desk now drafts a subject line from the visitor's own words. The owner closed the last decision
by keeping the handovers, so the plan is done.

## Gate output

These are this session's terminal summaries, copied from the runs.

```text
bun test (subject line)
 875 pass
 0 fail

playwright: desk-contact-prefill, desk-model-chain, mail, xray-panel
  28 passed (1.1m)

desk audit contact-model and contact-model-2, real Qwen2.5-0.5B
== 6/8 passed, 2 failed ==
  ✗ contact-model-collab — ended on /, wanted /mail
  ✗ contact-model-pass — ended on /notes, wanted /mail
  ✓ contact-model-reach, contact-model-howto, both controls, who-is-tj, bread-stack

playwright visual suite on macOS after the catalog refresh
  10 passed

CI on pull requests 13 to 17: end to end pass; typecheck, tests, lint count pass
```

## What was not done

- The optional hover hint from P5 is still unbuilt.
- No note was written about the contact flow; that waits on the owner walking the tour.
- The two missed contact phrasings still get a poor answer from the model, as they did before.
- The live contact flow was not driven end to end on the deployed site, because the model runs in
  the visitor's browser; the local walk, CI and the audit stand in for it.

## What needs human eyes

- Walk the tour: https://tjakoen.github.io/?crumb=review-contact-flow-and-xray&crumb-mode=dev&crumb-frame
- Whether "About mentoring students" style subjects read right in a real mail app.
