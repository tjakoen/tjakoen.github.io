---
id: review-builder-honest-copy
mode: dev
title: "Review: the builder page says what was measured"
route: /builder
---
Two pieces of copy on this page were making claims the measurements do not support, and both are
rewritten. The drawer promised that the honest demo is the one where you watch the model pick the
wrong block; measured over thirty-three answers from the live model, it never gets that far, so the
drawer now says what does happen instead. And every refusal the model earns was reaching a visitor
in the words a console wants, which on the majority case reads as no surface "b2" on this screen.
Nothing about how the page behaves changed. Only what it says about itself, which means the whole
review is reading, and reading is the one thing a passing test cannot do for you.

Read on 2026-08-19 or later, one thing behind this tour has moved. The bare-id question below was
answered, and the fence now reads a short address up to the long one when exactly one block answers
to it. So the near-miss refusal the second step tells you to be suspicious of is gone, and the
drawer carries a paragraph saying that the model has not been run against the new fence yet. That
paragraph is the thing worth reviewing hardest now, because an unverified improvement is exactly
where a page starts flattering itself.

## builder-help
- at: /builder
- status: needs-verification
- review: The drawer, and the riskiest step of the two. Three paragraphs after the four-line vocabulary list are new, and they carry hard numbers: thirty-three answers, eighteen before the manifest was narrowed and fifteen after, seven that named a block, five that named the right block and the right verb and were refused on the address form. If any of those disagree with the run reports, the page is now lying with more precision than it used to.
- verify: Open the drawer and read from the four-line list to the end of it. The numbers should match artifacts/runs/2026-08-15-manifest-narrowing.md, and every one of them should read as a dated measurement rather than as a description of today. The paragraph after them should say the fence changed on 2026-08-19, that the five near misses would pass it, and that this is a deduction because nobody has re-run the model. No sentence anywhere in the drawer should claim an edit works.
The drawer that tells you what this page can and cannot do.

## builder-said
- at: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20and%20a%20callout
- status: needs-verification
- review: The line that answers an edit, and the one place a refusal reaches a person. It used to print grain's own reason after a prefix, so a visitor got the sentence written for a console. Each refusal is now written twice: this line for the reader, and grain's exact reason to the console through the same object, so nothing was lost in making it readable. The near-miss branch used to be the one to be suspicious of: it told you the address was one word short and refused anyway, because forgiving it was an open decision. That decision was taken on 2026-08-19 and the fence now resolves the short form when exactly one block answers to it, so an answer of that shape reaches the acting line instead of this refusal. What to be suspicious of now is the other direction: an ambiguous or absent address must still refuse, and it must still refuse in a visitor's words.
- verify: With blocks on the canvas, type "drop the second card" into the box above and press Build it. On a machine that cannot run the model, this line should say the desk cannot run and the canvas must not change. On a machine that can, read whatever comes back as a visitor would: it should name what the desk aimed at, say plainly that nothing moved, and contain no quoted address, no word "surface" and no word "screen". Then check the canvas still holds four blocks.
The status line under the prompt box.

## prompt
Two things the walk cannot settle, because both are judgments about words rather than behaviour.
- ask: reads-wrong | Anything in the drawer or the refusal line that overclaims, underclaims, or reads like a developer wrote it for another developer?
- ask: rerun | The fence now reads a short address up to the long one, and nobody has run the live model against it. Having watched a real answer: does it land now, and what did the page say while it happened?
- template: Continue the /builder honest-copy work in tjakoen.github.io (tour {tour}).\nWhat reads wrong: {reads-wrong}\nWhat the live model did against the new fence: {rerun}\nThe plan is plans/builder-design.md, Open 3 and Open 4; the run reports are artifacts/runs/2026-08-15-builder-honest-copy.md and artifacts/runs/2026-08-19-builder-take-it-away.md. Nothing is pushed.
- handoff: https://claude.ai/new?q={payload}
