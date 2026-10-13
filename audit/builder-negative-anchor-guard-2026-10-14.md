# Builder negative-anchor guard audit

## Finding

The Builder's source-anchor check treated capitalized names, quoted phrases, and numbers in a brief
as required content without checking whether the visitor had forbidden them. For example, a request
not to use “award-winning bakery” or claim a 2019 opening could promote those values into positive
anchors. That could pressure a generated draft to repeat exactly the claims the visitor rejected.

## Change

The source-anchor parser now ignores candidates in a nearby negative clause. It also treats common
instruction words, including “do,” “avoid,” “exclude,” “leave out,” “never,” “omit,” “skip,” “use,”
and “without,” as instructions rather than capitalized names. The same negative-clause check now
filters source spans before they can ground generated copy. It also stops a matched source span at
the first instruction or prohibited phrase, so a positive phrase before a sentence boundary cannot
pull the following negative instruction into the draft. This closes a related gap where the model
could reuse an isolated forbidden word, such as “organic,” because it appeared in a quoted
prohibition. Unit regressions cover those forms and confirm that a positive phrase later in the brief
remains an anchor and can still ground the draft. The live audit grader also checks forbidden terms
in the visible result.

## Live check

Six October 14 WebGPU runs used the local Qwen2.5-1.5B profile. Each passed 1/1 visible-copy checks.
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

Two follow-up runs used the clearer form “Do not use [prohibited phrase] and add an intro with the
exact phrase [positive wording].” The raw model proposed “organic bread” in one run and “organic
ingredients” in the other, even though the brief excluded a certified-organic claim. The reviewed
draft kept the requested “neighborhood bakery” wording and removed both organic suggestions. The
grader also checks “award-winning,” “certified,” “organic,” and “2019” independently, rather than
only checking the complete phrase. See the [first follow-up](builder-positive-after-negation-2026-10-14.json)
and [source-span check](builder-negative-span-live-2026-10-14.json). After the span-boundary fix, a
third recheck of the same mixed brief passed 1/1, kept the requested positive wording, and removed
three unrequested blocks. Its [report](builder-negative-span-recheck-2026-10-14.json) records the
raw response and reviewed result. The unit regression directly reproduces the cross-sentence phrase
and confirms that only “Hearth Bakery” can be grounded from that input.

The raw models still proposed unsupported claims, including opening hours, online ordering, pastries,
ambiance, visitor counts, and opening history. Those were not shown in the resulting pages. These
checks demonstrate the guard and review path for one repeated mixed-prohibition brief and two
shorter prohibition briefs; they do not establish reliable raw-model writing or general negation
understanding. Broader writing quality, natural-language editing, and a cold-start check on actual
phone hardware remain open.
