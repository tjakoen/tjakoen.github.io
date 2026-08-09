---
id: review-conformance-standard
mode: dev
title: "Review: the conformance prompt joins the standards"
route: /standards
---
Backlog item 1 asked for one paste-in prompt that can be run in any other repo to check the standards
are wired, the links resolve, and the loop is automated rather than remembered. This adds it as a
twelfth published standard, `standards/CONFORMANCE.md`, rendered at `/standards/conformance` and
mounted as the `conformance` skill. The design call worth reviewing is what the prompt refuses to do:
`pantry doctor` already owns fourteen mechanical checks, so the prompt runs it, pastes its output, and
spends its own judgment only on the eight things an exit code cannot settle.

## screen:standards-index
- at: /standards
- status: changed
- review: The index gains one row, "Checking a repo is still wired", and the on-ramp paragraph at the bottom grew from two files to three. KICKSTART runs before the repo exists, CLAUDE.starter wires the repo you then create, CONFORMANCE is what you run months later to find out whether any of it is still running.
- verify: Load /standards and find the new row in the table. Then read the "How they fit together" list and confirm the KICKSTART bullet now names three files in order, not two.
The ordering is the argument: the first two are wiring and the third is the only one that catches
wiring going quietly dead.

## screen:conformance-page
- at: /standards/conformance
- status: changed
- review: The new page. It opens with the AI-reading-this callout that KICKSTART uses, states what it deliberately does not do, then carries the paste-in prompt, an after-it-reports section, and the Rationalizations, Red flags and Verification sections the heavier standards carry.
- verify: Load /standards/conformance. Confirm the page title reads "the prompt that checks a repo is wired, not just willing" and is distinct from every other standard's title. Scroll to the fenced block and confirm it renders as one unbroken code block, not as four.
The title matters more than usual here: five standards pages shared a title once, and the fix only
holds if new pages are checked at the point they are added.

## screen:conformance-prompt-c6
- at: /standards/conformance
- status: needs-verification
- review: Check C6 is the load-bearing one and the place to argue with me. It asks for a file and a line that wires each of five things (doctor at session start, the gate on turn end, CI on push, graph freshness, lint and typecheck as scripts) or the words "remembered only". Run against this repo it finds two wired in `.claude/settings.json` and no session-start doctor hook at all.
- verify: Read C6 in the prompt, then open `.claude/settings.json` here and count. There is a Stop hook running the review gate and a PostToolUse hook running graphify, and nothing that runs the doctor when a session starts. Decide whether that gap is worth closing in the canon home before the prompt is handed to any other repo.
This is the check finding a real hole in the repo that owns the standard, which is the best evidence
available that the check is worth having.

## screen:conformance-prompt-c4
- at: /standards/conformance
- status: changed
- review: Check C4 checks every published-standards URL for real. The command shipped here is the corrected one: the glob is quoted because zsh eats it unquoted, curl follows redirects because Pages answers 301 before 200, and trailing sentence punctuation is stripped before the request. The first draft of all three was wrong and reported seven healthy links as broken.
- verify: Copy the C4 command out of the page and run it in this repo. Every line should read 200. If any line reads 301, the copy lost the -L flag.
Worth stating plainly: this check was written, run, found to be wrong, and rewritten, which is the
only reason it works. A command in a standard that nobody ever executed is a suggestion.

## screen:loop-handover
- at: /standards/loop
- status: changed
- review: Backlog item 2 lands here as one paragraph in section 4a and one Rationalizations row. Where a repo runs PANTRY, a session hands over the link rather than pasting its own account of the run into chat, because the rendered ledger names the evidence items the report is missing and a summary never will. Localhost is the link, the same call the decision inbox already made, and that limit is stated rather than glossed.
- verify: Load /standards/loop, find section 4a, and read the paragraph after "evidence or it didn't happen". It should say localhost out loud and say what happens in a repo with no PANTRY. Then check section 7 for the new row about summarising in chat.
The paragraph is deliberately not a new rule about reports. The report was always owed; this only
changes how it reaches you.

## screen:kickstart-loop-wiring
- at: /kickstart
- status: changed
- review: The new-project prompt now carries both items. Phase 2 reads the loop standard, phase 3 gains a section c that makes the plan name the file wiring each part of the loop on day one (doctor at session start, CI on push, the turn-end gate, the code graph, where a run report goes and whether PANTRY is the surface you get linked to), and the old open-questions section moved to d. The page footer now points at the conformance prompt as the other end of the same on-ramp.
- verify: Load /kickstart and find "THE LOOP, WIRED ON DAY ONE" inside the fenced prompt. Check the list ends at d, not two c's. Then scroll to the closing section and confirm the conformance link is there.
This is the part worth arguing with. Section c makes the prompt longer, and a longer prompt is a
prompt more people paste half of. The trade was made on the grounds that a loop retrofitted later is
the thing this whole page exists to prevent.
