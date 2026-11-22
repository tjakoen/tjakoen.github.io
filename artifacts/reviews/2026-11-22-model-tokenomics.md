# Goldfish review: model-tokenomics

Three fresh goldfish read `plans/model-tokenomics.md` on 2026-11-22, each with only the plan and the files
it names. None was a fork. Readiness then ran twice more on the rewrites.

## Comprehension: UNDERSTANDABLE, with gaps

Eighteen assumptions, the load-bearing ones about how a spent plan is detected, which candidates each
harness and tier gets, how repositories are matched, and what a usage record sums. The rewrite answers each
of them.

## Critic

Thirteen findings. The most serious: the strong tier's fall to Flash had no trigger and conflicted with the
model guard; nothing knew a plan was spent; the paid API had no spending guard; the registry shape and the
MODELS.md text disagreed with the new order; the usage record could double-count and could not read
subagent turns. The strongest argument against the plan was to ship the usage record alone and build the
router after measuring. The owner chose to build both here, with every limit a registry setting, so the Mac
run tunes numbers rather than rebuilding logic.

## Readiness: NO-GO three times, then resolved

The first pass found fifteen gaps, the second thirteen, the third four blocking and seven minor. Each pass
narrowed the gaps to smaller ones, and the plan's "Precise rules" section records every answer: the entry
shape, lookup by id, the paid cap with unknown prices, streak rules, the no-private-candidate exit, who
relays an ask, the plan field, offsets, wiring, gates, approval past the paid cap, OpenCode's tiers through
`tiersFrom`, cost values for every entry, test directory overrides, and the strong tier in an uncleared
repository. No fourth pass ran; the remaining gaps were specific enough that each fix closes it directly.

## Owner decisions

The owner set the privacy rule on 2026-11-22: a repository not on the list asks, a no keeps work on Claude
and Codex, and every free and DeepSeek model, the paid API included, is not private. The owner chose to
build both the route check and the usage record here. Three narrower defaults (Codex before the paid API, a
plan marked out by its quota error, a five-dollar daily cap) are registry settings the owner can change.
