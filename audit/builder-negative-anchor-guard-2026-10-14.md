# Builder negative-anchor guard audit

## Finding

The Builder's source-anchor check treated capitalized names, quoted phrases, and numbers in a brief
as required content without checking whether the visitor had forbidden them. For example, a request
not to use “award-winning bakery” or claim a 2019 opening could promote those values into positive
anchors. That could pressure a generated draft to repeat exactly the claims the visitor rejected.

## Change

The source-anchor parser now ignores candidates in a nearby negative clause. It also treats common
instruction verbs, including “do,” “avoid,” “never,” and “use,” as instructions rather than names.
A unit regression covers a forbidden quoted phrase and year, and verifies that only the requested
business name remains an anchor. The live audit grader can also assert that forbidden copy is absent.

## Live check

The October 14 WebGPU run used the local Qwen2.5-1.5B profile. It passed 1/1 visible-copy checks for
the brief “Build a page for Hearth Bakery in Utrecht. Do not call it an award-winning bakery or claim
it opened in 2019. Add an intro that welcomes neighbors.” The resulting page retained “Hearth Bakery”
and “Utrecht,” omitted the forbidden phrase and year, removed two unrequested blocks, and reduced the
remaining intro to source-supported words. The full raw response and visible result are in the
[machine-readable report](builder-negative-anchor-live-2026-10-14.json).

The raw model still proposed unsupported opening hours, online ordering, pastries, and ambiance.
Those were not shown in the resulting page. This check demonstrates the guard and review path for one
brief; it does not establish reliable raw-model writing or general negation understanding. Broader
writing quality, natural-language editing, and a cold-start check on actual phone hardware remain
open.
