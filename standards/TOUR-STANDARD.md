---
title: TOUR-STANDARD.md — the review-tour standard
summary: How a CRUMB dev tour is built - picking surfaces, writing a verify line someone can run, stamping the status, and handing it over.
when: >
  Read this BEFORE writing a review tour, and BEFORE saying a change that renders is done: a UI
  change, a new component, a page, a figure, anything a person can look at. It owns the artifact
  (which surfaces become steps, what a review line says, what a verify line must let someone do,
  the status vocabulary, the handoff link); LOOP section 4a owns the rule that a rendered change
  owes one at all. Don't skip because you can describe the change in a sentence - the sentence is
  what the reviewer already cannot check, and a tour with vague verify lines is worse than none
  because it looks like evidence.
---

# 🍪 TOUR-STANDARD.md: the review-tour standard

A diff describes an edit. A tour shows the thing. When a change is something a person can look at,
the review should happen on the page, not in a patch, and the walk should be written by whoever just
made the change while they still remember what to be nervous about.

This owns the artifact. [LOOP.md](LOOP.md) section 4a owns the rule that a rendered change owes one,
and section 2 owns the limit: a tour you wrote about your own change is not a second pass. Read them
together, not instead of each other.

## What a tour is

A markdown file in the host's tours folder, rendered by CRUMB. Frontmatter, an intro, then one
`## <surface>` heading per step. The surface is a `data-surface` address on the page, which is what
the lamp lights.

```markdown
---
id: review-live-figures
mode: dev
title: "Review: the figures went live"
route: /notes/ten-times-zero
---
The intro. What changed, in two or three sentences, and anything true of the whole change.

## figure:ratio
- at: /notes/ten-times-zero
- status: needs-verification
- review: What moved here, and why it is the risky one.
- verify: Scroll into it from the paragraph above. Nothing should overlap, at desktop and phone width.
The demo-mode narration. Shown in both modes; the review and verify lines are the dev half.
```

`mode: dev` is what makes it a review tour. Without it the review, verify and status lines still
parse but the tour opens as a demo.

## The seven rules

**One step per surface that changed, not one per commit.** The reviewer is checking the app, not
your history. Two commits that both touched the same figure are one step. A commit that touched
six figures is six.

**The surface has to exist before the tour does.** A step points at a `data-surface` address. If the
thing you changed has no address, give it one first. That is usually a single attribute next to
whatever hook the element already carries, and it is worth doing on its own: an addressable region is
what makes anything, a tour or an agent, able to point at it later.

**A verify line is an instruction, not a description.** The test is whether someone who has never
seen the code can follow it and end up knowing whether it worked. "Check the spacing" fails. "Scroll
slowly into this figure from the paragraph above; nothing should overlap, at desktop width and at
phone width" passes. Name the interaction, name the widths or states that matter, and say what the
correct outcome looks like, especially when the correct outcome is that nothing happens.

**A step is read standing up, so it is short.** The card sits over the thing it points at, and the
reviewer is looking past it at the app. A step that fills the card gets skimmed, and a skimmed step
is worse than a missing one because it still looks like it was read. Two sentences for the review
line and one instruction for the verify line is the size that gets used. The rule is not a word count
so much as a test: if the card has to be scrolled, the step is doing something a step should not.

Long context is not banned, it is relocated, and the place is not another panel on the same screen.
The reasoning behind a change, the history, the thing you nearly did instead: that is the plan and
the run report, which a reviewer reads when they want it and skips when they do not. A review chrome
that mirrors the step's prose beside the card has not solved anything, it has printed it twice, and
the second copy is the one nobody reads. If a step will not fit its card, shorten the step.

**Stamp the status honestly, and use `needs-verification` more than feels comfortable.** The five are
`new`, `changed`, `needs-verification`, `verified`, `known-issue`. `verified` means someone who did
not write it has actually walked it. Marking your own work verified is the exact move the standard
above refuses, so on a tour you wrote about your own change, `verified` is almost always wrong.
`known-issue` is not an admission of failure, it is the cheapest way to stop a reviewer filing
something you already know about.

**A step that stages state says so, in its own prose.** A tour may write into the app, through the
app's own door, and a `prefill` line is the first thing that does it. The moment it does, the screen
the reviewer is looking at is no longer one the app reached by itself, and a screen with words already
in it reads exactly like one that did. So the step says plainly that the tour put them there, and what
the tour then refused to do (the message is staged, sending it is yours). The client draws a staged
label of its own, which is a label, and labels get skipped. Saying it in the narration is the part
someone actually reads, and a review tour that lets a staged state pass for a real one has inverted
the only thing it is for.

**Say what is riskiest, not what is most impressive.** The step most worth a careful look is usually
the smallest one: the spacing fix landed at the end, the edge case nobody asked for. Put the honest
nervousness in the review line. A tour that reads like a changelog of wins is hiding the same thing a
run report full of wins is hiding.

## The handoff

A review tour is written for one change and handed to one person, so the handoff is a link. Any URL
on the host takes the tour id as a query parameter, plus the mode and the framed presentation:

```
https://example.com/notes/my-post?crumb=review-my-change&crumb-mode=dev&crumb-frame
```

End the run report with that link. A tour nobody was handed is a file, not a review.

**Close the loop in the tour, not in chat.** A tour may end with a `## prompt` section: the questions
the walk could not answer itself, and a template that composes the answers into a prompt to paste
back into a session. Use it for the judgements only the reviewer can make (does this read right, which
piece comes next), never for something the walk already showed. Two or three questions is the size
that gets answered; a form of eight is a survey, and a survey gets closed. The grammar is in
[WRITE-A-TOUR](https://tjakoen.github.io/crumb/docs/write-a-tour).

## Where it lives, and who sees it

Flat, in the host's tours folder, named `review-<slug>.md`. Not in a subfolder: the loader reads the
folder without recursing, so a tour one level down is invisible to the board and fails silently,
which is the worst of both.

Check whether the host publishes its tours before writing anything you would not put on the live
site. On tjakoen.github.io the tours folder is exported, so a review tour ships publicly, and that is
deliberate: it is a receipt. On a host where that is not wanted, the folder has to move out of the
exported tree first.

## Rationalizations

| Rationalization | Reality |
|---|---|
| "The diff is small and obvious." | Small and obvious is where spacing, focus order and mobile break, because nobody looked. The tour costs a paragraph. |
| "I will write the tour after review." | Then it is documentation, not review. The point is that it exists before someone else looks. |
| "There is no surface for it." | Then add one. That is a one-line change and it is the same work that makes the region addressable to anything else later. |
| "I checked it myself, so it is verified." | You are the author. Section 2 of LOOP is explicit: that is one pass. Stamp `needs-verification`. |
| "Everything is fine, so every step is `verified`." | A tour with no `needs-verification` anywhere is a tour nobody will read carefully, including the reviewer. |

## Red flags

- A verify line that starts with "Check" or "Make sure" and names no interaction.
- Every step stamped `changed`, with no sense of which one to look at first.
- A step whose review line restates the commit message.
- A tour whose steps outnumber the surfaces that actually changed.
- A tour written but never linked in the run report.

## Verification

- [ ] Every changed rendered surface has exactly one step, and no step points at an unchanged one.
- [ ] Every step's surface address resolves on the page the step names.
- [ ] Every verify line names an interaction and the outcome that means it worked.
- [ ] No step the author wrote about their own change is stamped `verified`.
- [ ] `crumb check` passes on the tours folder.
- [ ] The handoff link is in the run report.

---
🤖 **Built with Claude, and the tour is how I make it check the work rather than take my word for
it.** I decided what "reviewed" has to mean; Claude typed the parser that enforces it. **I don't
prompt and pray, I prompt and prove.**
[How I actually work with AI, receipts and all →](https://tjakoen.github.io/notes/ten-times-zero)
