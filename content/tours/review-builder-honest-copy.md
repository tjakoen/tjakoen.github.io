---
id: review-builder-honest-copy
mode: dev
title: "Review: the builder page says what was measured"
route: /grain/builder
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
drawer used to carry a paragraph saying the model had not been run against the new fence. It has
now, on 2026-08-19, and the paragraph says what it earned instead of what it hoped: one scenario
lands and four still do not, and the same run caught the loosened fence letting a destructive answer
through. The page answered that with an Undo button rather than by forbidding the answer, because
forbidding it was measured too and it took the working edit with it. Read the trade hardest, because
a page reporting a win it half earned is exactly where one starts flattering itself.

## builder-help
- at: /grain/builder
- status: needs-verification
- review: The drawer, and the riskiest step of the two. Four paragraphs after the four-line vocabulary list carry hard numbers, and they now come from two runs rather than one: the 2026-08-15 counts (thirty-three answers, eighteen before the manifest was narrowed and fifteen after, seven that named a block, five refused on the address form) and the 2026-08-19 re-run against the loosened fence. If any of those disagree with the run reports, the page is lying with more precision than it used to. Read the second run's paragraphs hardest, because they are the ones reporting a change the page itself asked for.
- verify: Open the drawer and read from the four-line list to the end of it. The 2026-08-15 numbers should still match artifacts/runs/2026-08-15-manifest-narrowing.md and should still read as a dated measurement. The paragraph after them should now carry a measured result rather than a deduction: drop b4 landing two times in three, the four referring-expression scenarios landing none, and an unrelated block removed once in four on the ask no verb can serve. Every one of those should be traceable to the reports under .cache/desk-audit. The drawer may claim exactly one edit works, the simplest one, and no sentence should widen that to editing in general.
The drawer that tells you what this page can and cannot do.

## builder-said
- at: /grain/builder?ask=An%20intro%2C%20two%20cards%20side%20by%20side%2C%20and%20a%20callout
- status: needs-verification
- review: The line that answers an edit, and the one place a refusal reaches a person. It used to print grain's own reason after a prefix, so a visitor got the sentence written for a console. Each refusal is now written twice: this line for the reader, and grain's exact reason to the console through the same object, so nothing was lost in making it readable. The near-miss branch used to be the one to be suspicious of: it told you the address was one word short and refused anyway, because forgiving it was an open decision. That decision was taken on 2026-08-19 and the fence now resolves the short form when exactly one block answers to it, so an answer of that shape reaches the acting line instead of this refusal. What to be suspicious of now is the other direction: an ambiguous or absent address must still refuse, and it must still refuse in a visitor's words.
- verify: With blocks on the canvas, type "drop the second card" into the box above and press Build it. On a machine that cannot run the model, this line should say the desk cannot run and the canvas must not change. On a machine that can, read whatever comes back as a visitor would: it should name what the desk aimed at, say plainly that nothing moved, and contain no quoted address, no word "surface" and no word "screen". Then check the canvas still holds four blocks.
The status line under the prompt box.

## prompt
Two things the walk cannot settle, because both are judgments about words rather than behaviour.
- ask: reads-wrong | Anything in the drawer or the refusal line that overclaims, underclaims, or reads like a developer wrote it for another developer?
- ask: rerun | The fence now reads a short address up to the long one, and nobody has run the live model against it. Having watched a real answer: does it land now, and what did the page say while it happened?
- template: Continue the /grain/builder honest-copy work in tjakoen.github.io (tour {tour}).\nWhat reads wrong: {reads-wrong}\nWhat the live model did against the new fence: {rerun}\nThe plan is plans/builder-design.md, Open 3 and Open 4; the run reports are artifacts/runs/2026-08-15-builder-honest-copy.md and artifacts/runs/2026-08-19-builder-take-it-away.md. Nothing is pushed.
- handoff: https://claude.ai/new?q={payload}

## builder-undo
- at: /grain/builder?ask=An%20intro%2C%20a%20card%20and%20a%20callout
- status: needs-verification
- review: The control that exists because of a measurement rather than a design. The live model removed a block nobody mentioned, once in four tries, and the guard that would have forbidden that answer took the one working edit with it. So a wrong drop is reversible instead of impossible. Worth being suspicious of two things: whether the restored block comes back with its own content rather than as a placeholder, and whether the button ever sits there offering an undo that would do nothing.
- verify: With three blocks on the canvas, drop the middle one from the rail. Undo should appear beside Build it. Press it: the block comes back in its old position with the same words it had, and the button disappears again. Then press full on a block that is already full, and the up arrow on the first row. Neither changes anything, so Undo must stay hidden.
The Undo control in the composer bar.
