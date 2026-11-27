---
id: harbor-curriculum
status: todo
track: learning
depends: [quest-map, quest-lessons]
touches: [content/notes, content/quests/regions.json, content/lessons/harbor.script.md, docs/CONTENT-BACKLOG.md]
owner: human
---

# Harbor curriculum: an on-ramp before the first quest

/learn is a guided path through my notes. Its first stop on the mainland is Ten Times Zero, a 25 minute
read that already assumes the reader knows what a harness, a loop and a session are. The audience I
actually want (students and juniors in their third or fourth year, who use ChatGPT but have never built
their own AI loop) has no gentle way in. This plan gives the Harbor its own short notes, so the path
starts where they are.

Status of this file: a first plan from a brainstorm on 2026-11-27. Nothing below is written yet. The
decisions that are made live in [plans/decisions/2026-11-27-harbor-gets-notes.md](decisions/2026-11-27-harbor-gets-notes.md).
Everything marked proposal is a suggestion, not a decision.

## The reader

- A student or junior, about third or fourth year, or just out.
- Already knows basic programming and the web stack (front end, back end, React, JavaScript, Next).
  This path does not teach those. It says plainly that they belong to school and to practice, and that
  the AI skill grows alongside them, not instead of them.
- Uses a chat assistant today. Has not set up a harness, a plan file, a standards file or a loop.
- Is a little afraid of AI, or a little afraid of being left behind. The path should leave them feeling
  enabled and curious, not behind.

## The voice of the path (decided)

- Sharing, not instructing. "This is how I do it and it works for me", never "this is how it is done".
- No claim of expertise. Credentials are the work itself: a long run of daily use, a stack built with AI,
  a team that copied the idea and made it their own.
- Every note ends by sending the reader off to try something and make their own version.
- Fundamentals are pointed at, not taught. A note says why a concept matters more now, and sends the
  reader to good teaching elsewhere.
- Follows VOICE and the note standard like any other note.

## What the deep dive found (2026-11-27)

1. **The Harbor is empty on purpose.** regions.json gives it zero notes and one outside link, Claude
   Academy. quest-map recorded "No Harbor notes" as a decision. This plan reverses that, see the decision file.
2. **The first real note is the steepest one in the stage.** Ten Times Zero is 7,957 words, 14 sections,
   25 minutes, with receipts from 1,147 commits. It is a good argument for someone already inside the
   practice. It is a hard first read for someone outside.
3. **Jargon is assumed, never introduced.** Harness, loop, session, context, token, tier, skill and
   standard are used from the first paragraph. A glossary exists (standards/GLOSSARY.md) but the path
   never points at it.
4. **The "intro" regions are not all for this reader.** Model Mines holds Build the Floor (9,844 words,
   39 minutes, audience lead and build). Guild Hall holds two notes written for engineering leads. Both
   are good notes, aimed at a different person.
5. **Gaps with no note at all:** the junior-on-a-team mental model; framing what done looks like before
   you start; drawing before building (mockups, data flow, user flow); the software engineering
   fundamentals that matter more with AI; moving from a chat window to a harness; capturing ideas from
   your phone into the loop; talking about your AI work in an interview; and "build your own, do not copy mine".
6. **Material that already exists and should be linked, not rewritten:** I Ran Out With Hours Left (keeping
   momentum past a usage limit), The Voice File (making it sound like you), Show Them the Board and the
   PANTRY note (keeping many ideas straight), Why I Teach (credentials in my own words), the design
   standard (ERD, DFD, wireframes, flows) which is a standard rather than a note.
7. **Lessons are mostly empty shells.** Only the Harbor script and a few others are drafted. Stop titles,
   digests, runes and trials are blank in most lesson files. New Harbor notes should get their lesson cut
   at the same time, using the quest-lessons rules.
8. **No curriculum is needed (decided 2026-11-27).** The software engineering basics are reintroduced in
   short, and each concept links out to a good outside source instead of reproducing a course.
9. **Atomic design is already in the notes, but never taught.** Origin Story says GRAIN is built on Brad
   Frost's atomic design, Four of Fourteen says it is half the reason GRAIN exists, and Feels Like an App
   mentions it in passing. No note explains it to a beginner or shows GRAIN as the example.
10. **The browser note exists.** The Browser Grew Up (16 minutes, published) is the platform story.
    Harbor links to it and does not repeat it.

## Proposal: the Harbor notes

Short notes, one idea each, about 1,200 to 2,000 words and under 8 minutes. Order is a proposal.

| # | Working title | One idea | Builds on |
|---|---|---|---|
| 1 | Your AI is a junior on your team | It cannot think for you, so you set the direction. This is the mental model for everything after. | new |
| 2 | Know what done looks like first | Say what you expect to see at the end before you start. Framing, a brief, an expected result. | brief standard |
| 3 | Draw it before you build it | A map note: use case diagram, ERD, DFD, wireframe, mockup, design system. One plain paragraph each on what it answers and when to draw it, then a link out to a good source. Why drawing matters more when you did not type the code. | design standard |
| 4 | The fundamentals you still own | Clean code, tests, git, reading a diff. Not taught here. Why they matter more when you review more than you write. | new |
| 5 | The words you will hear | Model, harness, context, token, prompt, agent, skill, loop. One plain line each, then back to work. | glossary standard |
| 6 | From a chat window to your first loop | The step from ChatGPT to a harness with a plan file and one check. Any harness works. | loop-setup (later) |
| 7 | Catch the idea, then loop it | Phone note, then plan, then build. How a whole learning site took about 48 hours. | new |
| 8 | Build your own, do not copy mine | Take what is useful, change it, share it back. My team's own dashboards as the proof. | show-them-the-board |

Possible later notes, not Harbor: how to talk about your AI work in an interview; how to keep going when
usage runs out (exists); how to make it sound like you (exists).

## Tasks

- [x] Answer the open questions in the decision file (2026-11-27)
- [ ] Find outside sources for each drawing in note 3 and for the fundamentals in note 4
- [ ] Decide whether atomic design and GRAIN as the worked example is its own note or part of note 3
- [ ] Decide the final list and order of Harbor notes
- [ ] Update regions.json so Harbor lists its notes, and update quest-map's "No Harbor notes" line
- [ ] Draft note 1 as DRAFT under the note standard, in a conversation, then read it aloud before it ships
- [ ] Cut a lesson for each Harbor note by the quest-lessons rules
- [ ] Rewrite the Harbor script so it hands over to the Harbor notes, not straight to Ten Times Zero
- [ ] Link the glossary from the path
- [ ] Decide whether the path needs a student track and a lead track
- [ ] Add each landed note to docs/CONTENT-BACKLOG.md

## Keeping the notes page uncluttered (proposal, 2026-11-27)

What exists today: /notes already has audience tabs (How I build, How I lead, Learning to build), a level
filter (Start here, Deep dive), tag chips, New and Top sorting, search, and the flagship pinned first. With
about nine more short notes the feed grows from 38 to about 47, and the Harbor notes would sit between
unrelated posts by date.

Options, cheapest first:

1. **No code.** Mark every Harbor note audience learn and level intro, and send readers to the Learning to
   build tab. Costs nothing, but the notes still appear in the All feed in date order.
2. **A series field (recommended).** Add series and seriesOrder to the frontmatter. The feed shows one card for
   the whole series ("The Harbor: nine short notes, start here") that opens an ordered list. Each note gets a
   previous and next link. Notes stay at their own addresses, so /learn links and old links do not move.
3. **Derive it from the quest map.** regions.json already orders the notes, so a note listed there could
   count as a path note. Rejected for now: it makes the feed depend on quest data, and the map is meant to
   consume notes, not shape them.

Open: does a series card replace its notes in the All tab, or only collapse them? Recommendation: collapse
them in All, and show them individually under the Learning to build tab.

## Progress

- [x] Introduction drafted as content/notes/start-here.md (DRAFT, 2026-11-27)
- [ ] Introduction still owes: a social card image, the path figure, and four claims only the author can
  confirm (see the list in the conversation)
- [ ] Decide the notes page option above
- [x] Note 1 drafted as content/notes/ai-teammate-never-asks-questions.md (DRAFT, 2026-11-27)
- [x] Harbor lesson file and spoken script written for both drafts (content/lessons/harbor.yml and harbor.script.md, four stops). Replaces the earlier placeholder script, which was written before the notes existed.
- [ ] Both notes still owe a social card image and a drawn figure, and the contract test cap on drafts without a card (7) is now exceeded
- [ ] Every new Harbor note ships with its script and lesson stops in the same pass (decided 2026-11-27: the script is a companion of the note, written from it)
- [ ] Next drafts: note 2 (know what done looks like first, may fold into note 1), then the drawing map
- [x] Script format decided 2026-11-27: a script is a short concept narration, not the note read aloud. Each stop is three or four beats, each beat is one idea in about 20 to 45 seconds, and each beat names the section and the quote in the note that lights up while it plays. Narration adds the why or the practice and does not repeat the page. About 1.5 minutes a stop. The harbor script was rewritten to this format. Cues and timestamps come later, once the recordings exist.
- [x] Start Here deepened with a Who I am section and a link to /about (2026-11-27). Facts taken only from the public About page.
- [x] Note 2 drafted: content/notes/draw-it-before-the-ai-builds-it.md, a map of six drawings (use case, data flow, ERD, wireframe, mockup, design system) with outside links, plus its lesson file and script (three stops). The earlier idea of a separate know-what-done-looks-like note is folded into note 1.
- [ ] Atomic design with GRAIN as the worked example: still to decide whether it is its own note (it is teased in note 2 as coming later)
- [ ] The outside links in note 2 were found by search and not opened. Check each one before the note is published.
- [ ] Per-note scripts: each note ships with a script. Short notes share a lesson (the Harbor lesson holds Start Here and note 1), because a lesson needs three to six stops.

## Revised Harbor order (proposal, 2026-11-27)

Raised in conversation: the plan had no note on planning or on making the AI check its work, and the
loop does both automatically, which a beginner cannot yet have. Early on they have to do both by hand,
and the manual habit is also what justifies a reusable skill later.

| # | Note | One idea | Status |
|---|---|---|---|
| 0 | Start Here | Who I am, who this is for, how the path works | drafted |
| 1 | The teammate who never asks questions | Your AI guesses, so you brief it: goal, done, leave alone | drafted |
| 2 | Have the AI draw it before it builds it | The AI draws, you agree, save the plan in the project | drafted, revised |
| 3 | Plan it, then build from the plan | A written plan with steps the AI works through and you tick off. Planning by hand before a loop does it for you. | proposed |
| 4 | Make it check its own work | A manual audit: ask the AI to check the result against your brief and your drawing, run it, read the diff, then have a fresh session review it. Why checking in the same session flatters the work. | proposed |
| 5 | The third time you type it, save it | Once you have typed the same plan or audit prompt a few times, it becomes a skill. The skill is justified by repetition you already did by hand. | proposed |
| 6 | The words you will hear | A plain glossary walk | proposed |
| 7 | From a chat window to your first loop | Chat to a harness with a plan file and one check | proposed |
| 8 | Catch the idea, then loop it | Phone note to plan to build | proposed |
| 9 | Build your own, do not copy mine | Close the Harbor | proposed |
| later | Atomic design with GRAIN as the example; the fundamentals you still own | | to decide |

Notes 3 to 5 are one arc: plan by hand, audit by hand, then automate the repeat as a skill. They hand off
to existing notes: Set Up the Loop With One Prompt (the loop does it for you), The Check That Never Ran
and The Reviewer That Learned to Be Wrong (why checks need checking).

Open assumption to confirm: that readers have already met skills in the Claude Academy lessons. I have not
checked what that course covers, so note 5 must either say what a skill is in two lines or link to where
the Academy explains it.

## Decisions, 2026-11-27 (later)

- Claude Academy covers skills, routines, worktrees and similar tools, so Harbor notes may name one with a
  clause of definition and tell the reader to ask their agent. No note spends words teaching them.
  The note 5 assumption above is resolved: readers have met skills.
- Note 3 drafted: content/notes/plan-it-then-build-from-the-plan.md (about 800 words, 4 minutes), with a
  three-stop lesson and script. It ends by pointing to note 4 (checking its own work).
- [x] Note 4 drafted: content/notes/make-it-check-its-own-work.md with a three-stop lesson and script. Manual audit: evidence for each done line, run it yourself, a fresh session reviews, write down what it keeps missing. Hands off to the loop.
- [x] PROOF (/proof) and PANTRY (/pantry) are linked from notes 3 and 4 as things built for myself, never required. Show Them the Board is linked as the build-your-own story. Pantry Beside the Work is still a DRAFT note, so it is not linked from the path yet.
- [ ] Next: note 5, the third time you type it, save it as a skill

## Decisions, 2026-11-27 (tests and stack)

- Note 4 now teaches unit tests and end-to-end tests by name, links out (Fowler's Practical Test Pyramid,
  freeCodeCamp's e2e tutorial, Playwright), and says every language and framework has a standard way to
  test. The wired-in habit: tell the AI to write the tests as it builds, one per done line, so it stays
  accountable to its own definition of done and the next session has tests to run. Lesson went to four stops.
- Note 3 now has a Talk about the stack first section: ask the AI for the usual options, prefer popular
  stacks, stick with what you know (mobile may be Flutter or React Native, web may be vanilla or even PHP),
  never do agentic coding in a stack you have no experience with, and write the choice and its reason at the
  top of the plan. Lesson went to four stops.
- Outside links in note 4 came from search and have not been opened. Check them before publishing.
- Testing is unfamiliar to this reader (school often skips it), so note 4's tests section is written from zero: the idea as the check you already do by hand, one small JavaScript example in words and code, what pass and fail mean, unit versus end-to-end, and a trick of watching each new test fail before it passes. The note grew to about 1,450 words. Option to decide: split testing into its own note if the section keeps growing.
- Note 3 now says a new stack can be learned on a real project, but only as a learning project on purpose (explain each file, ask why this way, break something and fix it, no next step until you can explain this one), and adds an Orchestrate it, don't just vibe it section. It names the common pitfall of shipping something you do not understand and cannot easily fix, separates the blind vibe coder from the orchestrator who directs, checks each step and can fix it, and points to Ten Times Zero, where the word is claimed with one word in front: professional. Test for anything the AI builds: could I explain it and fix it if the AI were not here tomorrow.
- [ ] Consider echoing the vibe coder versus orchestrator line in Start Here and the teammate note, so the idea runs through the whole Harbor.
- Trim pass, 2026-11-27: the concepts are basic, so the notes should not run long. Start Here 1,300 to 1,235 words, drawing note 1,410 to 1,230, planning note 1,400 to 1,060, audit note 1,450 to 1,115. Cut repeats and kept every phrase the scripts highlight. Rule going forward: say it once, drop the second example, and aim for about 1,000 words a note unless the idea needs more.
- [x] Note 5 drafted: content/notes/save-it-as-a-skill.md (about 700 words), with a three-stop lesson and script. A skill is a prompt earned by typing it by hand three times, written by the agent from a session that worked and edited by the reader. Audits stay manual (the author's loop tells him when one is due and he decides). A routine, or scheduled loop, runs a skill only when the work is repeated, boring and checkable. The author's real examples, no judgment in any: checking whether classes are graded, moving tickets due for code review into the reviewer queue, updating team metrics calculations. This matches plans/decisions/2026-09-16-proactive-loops.md, which refuses an audit on a timer and any scheduled chore that edits source.
- [ ] Next in the arc: note 6 (the words you will hear), note 7 (from a chat window to your first loop), note 8 (catch the idea, then loop it), note 9 (build your own). Atomic design with GRAIN and the fundamentals note still to decide.

## A running project for the Harbor (proposal, 2026-11-27)

Idea from the author: give the first island one small ongoing project, so each note has a stage to point at.
A basic portfolio skeleton, with an AI roadmap page that records what the reader learned about agentic coding.
A reader who already has a portfolio adds to it. A reader without one starts from the skeleton, a static page
on GitHub Pages. The framework and design system from this site can be suggested, with starting prompts,
but nothing is required. The design and content come from the reader, and the notes guide. The roadmap page
is also a home for the badges. When the Harbor is done the reader has a real thing.

**Mapping notes to project stages (draft):**

| Note | Project stage |
|---|---|
| Start Here | Choose: add to a portfolio you have, or start the skeleton. Repo and GitHub Pages. |
| 1 The teammate | Write the brief for your portfolio: goal, what done looks like, what not to touch |
| 2 The drawing | Draw it: who visits, what an entry on the roadmap remembers, the roadmap page wireframe |
| 3 The plan | Pick the stack, write the plan, build step 1 only |
| 4 Check its work | Evidence, a test or two, a fresh review. Roadmap entry one. |
| 5 Save it as a skill | The repeated chore is adding a roadmap entry, so that becomes the skill. A link check is a candidate routine. |
| later | Words, chat to loop, capture ideas, design system (their own design), build your own, badges |

**Why it works:** each note ends with a trial that is a real step, and each roadmap entry is the reader
writing in their own words what they learned, which is also evidence for a job interview.

**Risks named so far (to resolve in conversation):**
- Some drawings (ERD, data flow) are light for a static site. The notes must say so honestly.
- The stack note says stick with what you know, so the skeleton is a default and never a requirement.
- Badges are self-reported (quest-map decision), so a portfolio cannot prove them. A badge may need to point at
  evidence on the roadmap page. Decide before promising anything.
- A public repo and a public page: remind readers to leave out personal data and secrets, and to claim only
  what they learned.
- Examples in notes 1 to 5 use an invented study planner. Replace them with this project, or with the author's
  own real portfolio artifacts, which are more honest than an invented scenario.
- The skeleton needs a home repo, which is an outward action and needs the author's go-ahead.
