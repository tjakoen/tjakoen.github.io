---
title: "Eight Things a Review Comment Owes the Person Reading It"
audience: [lead, build]
level: intro
subtitle: "For my team, now that half of you are building your own AI reviewers. Our reviews were mostly right. They still blocked on nits, said things twice and left out the reason, and those are fundamentals, not automation."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-11-18
readingTime: "~9 min"
tags: [ai, leadership, code-review]
summary: >
  Written for my dev team at Career Team after juniors told me our reviews were blocking on nits,
  inflating minor things and repeating themselves. Across 654 review comments on one product, about
  half human and half AI, the comments were mostly right; weight, repetition and missing reasons
  were the problem. Eight fundamentals of a good comment, each with what we saw and what would have
  been better, as the spec for the AI reviewers the team is now building.
social: |
  The juniors on my team told me our code reviews were wearing them out. Nits that block. Minor
  things raised as major. The same comment twice.

  So we read 654 review comments, half human and half AI. They were mostly right. That was never
  the problem.

  My own reviewer's log says why it matters: authors act on 98% of its blocking findings and 46%
  of its nits. Same accuracy. The label decided.

  Eight things a review comment owes the person reading it, with the before and after for each.
socialImage: "/media/notes/a-comment-is-a-cost-social.png"
socialImageAlt: "Four bars for how often authors acted on a reviewer's comments: blocking issues 98 percent, inline comments 92 percent, nits 46 percent, notes in the review body 46 percent, under the line: same reviewer, same accuracy."
---

This one is for my team. Some of you, mostly the juniors, have told me our reviews are wearing you
out: nits that block the merge, minor things raised as major, the same point posted twice. You
were right to say it, and since I started the AI reviewing here, part of the complaint lands on me.

In September I gave a talk on that reviewer, [Every Time It Was Wrong](/talks/every-time-it-was-wrong),
and the long version is in
[Seven Hundred Commits to Teach a Reviewer It Was Wrong](the-reviewer-that-learned-to-be-wrong.md).
Since then several of you have built AI review workflows of your own. I am genuinely glad about
that, and a little smug that the talk had something to do with it. But it means the quality of our
reviews now depends on what each of those reviewers has been told a good comment is.

So this note is less about automation and more about the fundamentals underneath it. They hold
whether you write the comment or a reviewer you built writes it, and if you are steering one, they
are the spec. Think of it as the next turn of the same loop: I showed you mine, you built yours, and
now we agree on what all of them should be aiming at.

Every comment on a pull request spends the author's attention. A good one buys something with it: a
bug that does not ship, a test that would have caught the next one. A bad one spends it and buys
nothing, and it also teaches the author to read the next comment a little less carefully. That
second cost is the one we keep underestimating, because it never shows up on the pull request where
it was paid.

## What two months of one product's reviews looked like

From mid-September to mid-November 2026 I read every review on one product at
[Career Team](/leading): 53 pull requests with reviews, and 654 top-level review comments on them.
Roughly half came from people and half from the AI reviewers many of us now run, mine included.
These are a snapshot of one product over two months, not a standing fact about the team, and no
person, pull request or ticket in this note is named, because that was never the point.

Most of it was good. Evidence was cited in about 90 percent of the AI comments and about 75 percent
of the human ones. The problems were somewhere else:

- **Weight.** There were 105 blocking items, and about 94 of them came from AI reviewers. Three
  reviews requested changes while saying, in their own text, that nothing blocked. Only a handful
  made a true nit hold a merge, but a handful is enough to teach a team that "blocking" is a mood.
- **Repetition.** About 60 near-duplicate pairs sat on the same pull request.
- **Missing reasons.** A fix was suggested in 34 percent of AI comments and 10 percent of human
  ones, and the worst blocking comments gave a rule code and nothing else.

The duplicates came from three places, and none of them was a person being careless:

<svg viewBox="0 0 700 200" width="100%" role="img"
     aria-label="Three sources feed about sixty near-duplicate pairs on the same pull request: a re-review restating its own earlier points, a second reviewer repeating what the first already said, and a review summary copying its own inline comments. All three arrive at the same author, who reads the same point twice."
     style="display:block;width:100%;height:auto;margin:0 0 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13px">
  <defs>
    <marker id="dup-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-muted)">
    <rect x="8" y="16" width="290" height="44" rx="4"/>
    <rect x="8" y="76" width="290" height="44" rx="4"/>
    <rect x="8" y="136" width="290" height="44" rx="4"/>
  </g>
  <g style="fill:var(--color-fg)">
    <text x="22" y="36">a re-review restating</text>
    <text x="22" y="96">a second reviewer repeating</text>
    <text x="22" y="156">a summary copying</text>
  </g>
  <g style="fill:var(--color-muted);font-size:11.5px">
    <text x="22" y="52">its own earlier points</text>
    <text x="22" y="112">what the first already said</text>
    <text x="22" y="172">its own inline comments</text>
  </g>
  <g style="fill:none;stroke:var(--color-muted);stroke-width:1.4">
    <path d="M298 38 L430 92" marker-end="url(#dup-a)"/>
    <path d="M298 98 L430 98" marker-end="url(#dup-a)"/>
    <path d="M298 158 L430 104" marker-end="url(#dup-a)"/>
  </g>
  <rect x="434" y="66" width="258" height="64" rx="4" style="fill:var(--color-fg)"/>
  <text x="563" y="94" text-anchor="middle" style="fill:var(--color-bg)">about 60 points</text>
  <text x="563" y="112" text-anchor="middle" style="fill:var(--color-bg)">read twice by one author</text>
</svg>

*Three honest habits, one tired author.*

## Why the label matters more than I thought

My reviewer keeps an outcome log, and every finding it posts is scored later by what happened to it:
fixed, answered, wrong or ignored. As of this week the log holds 2,203 scored findings, and
precision has sat around 99 percent the whole way through. So the next figure is not about whether
it was right. It is about whether anyone did anything.

<svg viewBox="0 0 700 214" width="100%" role="img"
     aria-label="How often authors acted on the reviewer's findings, by how they were labeled, across 2,203 scored findings with precision around 99 percent throughout: blocking issues 98 percent, inline comments 92 percent, nits 46 percent, notes in the review body 46 percent."
     style="display:block;width:100%;height:auto;margin:0 0 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13px">
  <text x="8" y="20" style="fill:var(--color-muted);font-size:12px">authors acted on it, by label (precision about 99% in every row)</text>
  <text x="8" y="56" style="fill:var(--color-fg)">blocking issue</text>
  <rect x="170" y="42" width="441" height="20" style="fill:var(--color-fg)"/>
  <text x="620" y="57" style="fill:var(--color-fg)">98%</text>
  <text x="8" y="94" style="fill:var(--color-fg)">inline comment</text>
  <rect x="170" y="80" width="414" height="20" style="fill:var(--color-fg)"/>
  <text x="593" y="95" style="fill:var(--color-fg)">92%</text>
  <text x="8" y="132" style="fill:var(--color-fg)">nit</text>
  <rect x="170" y="118" width="207" height="20" style="fill:var(--color-line)"/>
  <text x="386" y="133" style="fill:var(--color-muted)">46%</text>
  <text x="8" y="170" style="fill:var(--color-fg)">review-body note</text>
  <rect x="170" y="156" width="207" height="20" style="fill:var(--color-line)"/>
  <text x="386" y="171" style="fill:var(--color-muted)">46%</text>
  <text x="8" y="204" style="fill:var(--color-fg);font-size:14px">Same reviewer, same accuracy. The label decided whether anyone acted.</text>
</svg>

*The label is a promise about weight, and authors take it at its word.*

That is the good news and the warning in one picture. Authors trust the labels. When a reviewer
blocks, they act, almost every time. Which means every nit dressed up as a blocker spends credibility
the next real blocker needed. The log does not prove that the cheap labels caused the low numbers, a
nit is also less worth doing, but it does show that the label and the response move together.

## Eight fundamentals

Each one comes with something we actually saw, anonymized, and what would have been better. If you
recognize one of yours, that is the point, not a callout: people and AI reviewers both posted the
comments on this list.

### 1. A finding needs a consequence

Say what goes wrong, for whom, if this merges. If you cannot name it, it is not a finding yet.

<svg viewBox="0 0 700 150" width="100%" role="img"
     aria-label="A before and after pair. Seen: Blocking: INTEGRATION_TESTS_NOT_UPDATED. Better: The new retry path has no integration case, and integration tests only run on a schedule, so a regression here ships unnoticed. Add a case for hold, then retry."
     style="display:block;width:100%;height:auto;margin:0 0 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13px">
  <text x="8" y="18" style="fill:var(--color-muted);font-size:12px">seen</text>
  <rect x="8" y="26" width="684" height="36" rx="4" style="fill:none;stroke:var(--color-line);stroke-dasharray:4 3"/>
  <text x="22" y="49" style="fill:var(--color-muted)">Blocking: INTEGRATION_TESTS_NOT_UPDATED.</text>
  <text x="8" y="84" style="fill:var(--color-fg);font-size:12px">better</text>
  <rect x="8" y="92" width="684" height="52" rx="4" style="fill:none;stroke:var(--color-fg);stroke-width:1.6"/>
  <text x="22" y="113" style="fill:var(--color-fg)">The new retry path has no integration case, and integration tests only run on a schedule,</text>
  <text x="22" y="132" style="fill:var(--color-fg)">so a regression here ships unnoticed. Add a case for hold, then retry.</text>
</svg>

*Same finding. One of them tells the author what breaks.*

### 2. Severity matches the consequence

Blocking means users or data get hurt if this merges. Everything else is a suggestion, and should
say so. We saw a review request changes and then open with "No blockers, but..." The better version
posts it as a comment and puts the test gaps under a fold labeled as worth doing.

### 3. A nit never blocks

A template placeholder in the description, a name you would have picked differently, an unused
export: label it as a nit and let the author decide. We saw a "Steps to Test" placeholder counted in
the list that held a merge. Better: "nit: Steps to Test still has the template text." The 98 and 46
above are the reason. Mixing the two spends the credibility of the first on the second.

### 4. One issue gets one comment

Before you post, read what is already there. If someone raised it, reply or react, and do not open a
second thread. If you wrote a summary, point to the inline comment instead of copying it. We saw a
second-opinion review restate a migration concern that was already open from the first. Better:
"+1 on the open migration thread above, nothing new to add." Or, if you are a machine, nothing at
all.

### 5. Check before you assert

A claim about how the code behaves needs the line that proves it. A claim about "the convention
here" needs a count across the service, not one neighbor in the same file. If you have not checked,
ask, and say it is a question. We saw a hypothetical about signed-in users, posted as a question,
send an author off to investigate a branch the reviewer could have read. Better: read the branch
first, then either drop the comment or point to the line.

### 6. Say why, and offer a fix

"Could we drop this?" leaves the author guessing whether it gates the merge and what you are worried
about. Only 10 percent of human comments carried a fix. The best one we found did the whole pattern
in one line: "toBeInstanceOf(Date) passes on any date. Could this freeze time and assert the exact
value?" The reason first, then the fix, as a question the author can say no to.

### 7. Verify the fix

When the author says "done," check the code at the new commit and say so in writing. Silently
closing a thread tells the next reader nothing. The good version we saw read: "9 of 11 prior threads
are fixed at the new commit. Two items remain on the new code."

### 8. Know when to stay silent

Not everything you notice belongs on this pull request. Work the description already scoped out, a
cleanup in a file the change did not touch, a baseline unrelated to the feature: those go on a
ticket. And a serious finding deserves a serious opening line. Banter in front of a data exposure
makes it read as a joke.

## How to steer the reviewer you are building

Every one of the eight is a gate you can write down, and that is the part I most want you to steal
for your own prompts and skills. What worked in mine, in the order a finding meets it:

- **Gates before posting.** A finding has to know the ticket's intent, check it was not already
  raised, prove any convention by searching the whole service, anchor to an exact line, and survive
  the question of whether the author needs it at all.
- **A severity rubric tied to harm.** Blocking means users or data are harmed if this merges.
  Everything else is an issue, a nit or a question, and the verdict has to agree with the text.
- **Dedupe.** Read the existing threads first, and let the summary point to inline comments rather
  than repeat them.
- **Evidence or a question.** Every claim cites a file and a line, or it is phrased as a question.
- **Evals from real cases.** Keep the real misses and the real false positives as cases it must drop
  or raise, and rerun them after every change.
- **An outcome log.** Score what authors fixed, answered, called wrong or ignored. Without it you are
  guessing, and guessing feels a lot like knowing right up until the numbers arrive.

## What I have not shown

I have not shown that following the eight makes code better. I have shown what 654 comments on one
product looked like over two months, and how one reviewer's labels lined up with what authors did.
The duplicate and blocking counts came from reading the threads, which means a judgment call on each
pair, and a second reader would land a few either way.

My reviewer still writes the occasional nit nobody acts on. It is right about it, too. That was
never the problem.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
