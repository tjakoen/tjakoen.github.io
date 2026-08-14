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

## builder-help
- at: /builder
- status: needs-verification
- review: The drawer, and the riskiest step of the two. Three paragraphs after the four-line vocabulary list are new, and they carry hard numbers: thirty-three answers, eighteen before the manifest was narrowed and fifteen after, seven that named a block, five that named the right block and the right verb and were refused on the address form. If any of those disagree with the run reports, the page is now lying with more precision than it used to.
- verify: Open the drawer and read from the four-line list to the end of it. The numbers should match artifacts/runs/2026-08-15-manifest-narrowing.md, no sentence should promise that an edit works, and the last paragraph should leave you clear that describing a page works and editing one does not yet.
The drawer that tells you what this page can and cannot do.

## builder-said
- at: /builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20and%20a%20callout
- status: needs-verification
- review: The line that answers an edit, and the one place a refusal reaches a person. It used to print grain's own reason after a prefix, so a visitor got the sentence written for a console. Each refusal is now written twice: this line for the reader, and grain's exact reason to the console through the same object, so nothing was lost in making it readable. The near-miss branch is the one to be suspicious of. It tells you the address was one word short and it still refuses, on purpose, because forgiving it is an open decision nobody has taken.
- verify: With blocks on the canvas, type "drop the second card" into the box above and press Build it. On a machine that cannot run the model, this line should say the desk cannot run and the canvas must not change. On a machine that can, read whatever comes back as a visitor would: it should name what the desk aimed at, say plainly that nothing moved, and contain no quoted address, no word "surface" and no word "screen". Then check the canvas still holds four blocks.
The status line under the prompt box.

## prompt
Two things the walk cannot settle, because both are judgments about words rather than behaviour.
- ask: reads-wrong | Anything in the drawer or the refusal line that overclaims, underclaims, or reads like a developer wrote it for another developer?
- ask: bare-id | Having now seen a refusal for yourself: should a bare id be normalized up to block:<id> when the answer is read, or does the fence stay strict?
- template: Continue the /builder honest-copy work in tjakoen.github.io (tour {tour}).\nWhat reads wrong: {reads-wrong}\nOn normalizing a bare id: {bare-id}\nThe plan is plans/builder-design.md, Open 3 and Open 4; the run report is artifacts/runs/2026-08-15-builder-honest-copy.md. Nothing is pushed.
- handoff: https://claude.ai/new?q={payload}
