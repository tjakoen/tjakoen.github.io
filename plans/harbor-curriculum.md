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
8. **I could not find the teaching curriculum** in either repo. The software engineering course material
   is not here, so notes drawn from it need it pasted in or linked.

## Proposal: the Harbor notes

Short notes, one idea each, about 1,200 to 2,000 words and under 8 minutes. Order is a proposal.

| # | Working title | One idea | Builds on |
|---|---|---|---|
| 1 | Your AI is a junior on your team | It cannot think for you, so you set the direction. This is the mental model for everything after. | new |
| 2 | Know what done looks like first | Say what you expect to see at the end before you start. Framing, a brief, an expected result. | brief standard |
| 3 | Draw it before you build it | Mockups, a data flow diagram, a user flow, a persona. Why drawing matters more when you did not type the code. | design standard |
| 4 | The fundamentals you still own | Clean code, tests, git, reading a diff. Not taught here. Why they matter more when you review more than you write. | new |
| 5 | The words you will hear | Model, harness, context, token, prompt, agent, skill, loop. One plain line each, then back to work. | glossary standard |
| 6 | From a chat window to your first loop | The step from ChatGPT to a harness with a plan file and one check. Any harness works. | loop-setup (later) |
| 7 | Catch the idea, then loop it | Phone note, then plan, then build. How a whole learning site took about 48 hours. | new |
| 8 | Build your own, do not copy mine | Take what is useful, change it, share it back. My team's own dashboards as the proof. | show-them-the-board |

Possible later notes, not Harbor: how to talk about your AI work in an interview; how to keep going when
usage runs out (exists); how to make it sound like you (exists).

## Tasks

- [ ] Answer the open questions in the decision file
- [ ] Decide the final list and order of Harbor notes
- [ ] Update regions.json so Harbor lists its notes, and update quest-map's "No Harbor notes" line
- [ ] Draft note 1 as DRAFT under the note standard, in a conversation, then read it aloud before it ships
- [ ] Cut a lesson for each Harbor note by the quest-lessons rules
- [ ] Rewrite the Harbor script so it hands over to the Harbor notes, not straight to Ten Times Zero
- [ ] Link the glossary from the path
- [ ] Decide whether the path needs a student track and a lead track
- [ ] Add each landed note to docs/CONTENT-BACKLOG.md
