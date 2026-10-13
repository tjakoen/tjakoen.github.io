# Builder negative-anchor guard audit

## Finding

The Builder's source-anchor check treated capitalized names, quoted phrases, and numbers in a brief
as required content without checking whether the visitor had forbidden them. For example, a request
not to use “award-winning bakery” or claim a 2019 opening could promote those values into positive
anchors. That could pressure a generated draft to repeat exactly the claims the visitor rejected.

## Change

The source-anchor parser now ignores candidates in a nearby negative clause. It also treats common
instruction verbs, including “do,” “avoid,” “never,” and “use,” as instructions rather than names.
Unit regressions cover “do not,” “avoid,” “exclude,” and “leave out” instructions, while confirming
that a later positive phrase remains an anchor. The live audit grader can also assert that forbidden
copy is absent.

## Live check

Two October 14 WebGPU runs used the local Qwen2.5-1.5B profile. Both passed 1/1 visible-copy checks.
The first used “Do not call it an award-winning bakery or claim it opened in 2019.” The second used
“Avoid calling it an award-winning bakery, and leave out any claim that it opened in 2019.” Both
results retained “Hearth Bakery” and “Utrecht,” omitted the forbidden phrase and year, removed
unrequested blocks, and reduced the remaining intro to source-supported words. The raw responses and
visible results are in the [first report](builder-negative-anchor-live-2026-10-14.json) and
[second report](builder-negative-anchor-check-2026-10-14.json).

The raw models still proposed unsupported claims, including opening hours, online ordering, pastries,
ambiance, visitor counts, and opening history. Those were not shown in the resulting pages. These
checks demonstrate the guard and review path for two briefs; they do not establish reliable raw-model
writing or general negation understanding. Broader writing quality, natural-language editing, and a
cold-start check on actual phone hardware remain open.
