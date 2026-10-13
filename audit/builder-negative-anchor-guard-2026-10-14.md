# Builder negative-anchor guard audit

## Finding

The Builder's source-anchor check treated capitalized names, quoted phrases, and numbers in a brief
as required content without checking whether the visitor had forbidden them. For example, a request
not to use “award-winning bakery” or claim a 2019 opening could promote those values into positive
anchors. That could pressure a generated draft to repeat exactly the claims the visitor rejected.

## Change

The source-anchor parser now ignores candidates in a nearby negative clause. It also treats common
instruction words, including “do,” “avoid,” “exclude,” “leave out,” “never,” “omit,” “skip,” “use,”
and “without,” as instructions rather than capitalized names. Unit regressions cover those forms and
confirm that positive wording later in the brief remains an anchor. The live audit grader can also
assert that forbidden copy is absent.

## Live check

Three October 14 WebGPU runs used the local Qwen2.5-1.5B profile. Each passed 1/1 visible-copy checks.
The first used “Do not call it an award-winning bakery or claim it opened in 2019.” The second used
“Avoid calling it an award-winning bakery, and leave out any claim that it opened in 2019.” Both
used the brief's Hearth Bakery and Utrecht anchors, omitted the forbidden phrase and year, removed
unrequested blocks, and reduced the remaining intro to source-supported words. The third asked the
intro to include “neighborhood bakery,” while avoiding “award-winning bakery,” excluding “certified
organic,” and leaving out a 2019 opening claim. It retained the positive phrase in `lede.body` and
omitted all three prohibited details. The raw responses and visible results are in the
[first report](builder-negative-anchor-live-2026-10-14.json),
[second report](builder-negative-anchor-check-2026-10-14.json), and
[third report](builder-mixed-prohibitions-live-2026-10-14.json).

The raw models still proposed unsupported claims, including opening hours, online ordering, pastries,
ambiance, visitor counts, and opening history. Those were not shown in the resulting pages. These
checks demonstrate the guard and review path for three briefs; they do not establish reliable
raw-model writing or general negation understanding. Broader writing quality, natural-language
editing, and a cold-start check on actual phone hardware remain open.
