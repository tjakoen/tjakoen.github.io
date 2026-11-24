---
title: "Write for the Person Who Has to Read It"
audience: [lead, learn]
level: intro
subtitle: "AI says a lot. Your reader still has to find the point. Give it examples of words you would actually use."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-11-11
updated: 2026-11-24
changelog:
  - "2026-11-24 | Added the other half of a voice file: the shape you want the AI's answer to come back in, with the ask first, numbered steps, a linked running page, and a table once three things are compared."
  - "2026-11-21 | Added a worked wording example and expanded the VOICE.md template to cover words you would use and claims you can explain."
readingTime: "~10 min"
tags: [standards, leadership, workflow, teaching]
people: [kercwin, ege-vusal-chelebi]
sources: [book-cure-for-ai-slop]
summary: >
  An AI draft goes out under your name. Use words you would say and claims you can explain,
  so your reader can understand what you mean without asking you to translate it. Save
  examples of those rewrites in a short VOICE.md, then teach the agent where the question
  and the untested parts belong. The same file can point the other way: write down the shape
  you want the answer to come back in.
social: |
  AI says a lot. Your reader still has to find the point.

  If you wouldn’t say it yourself, or can’t explain what it means, why send it under your name?

  Everyone working with AI should have a VOICE.md. Give it examples of how you actually write.
  Get to the point. Your reader has enough work already.
socialImage: "/media/notes/the-voice-file-social-ticket.png"
socialImageAlt: "Two versions of the same report say sign-in worked on a laptop and phone testing is still pending. The AI draft uses formal wording about validation and subsequent navigation; the rewrite says what happened in plain words."
---

Your class project is due tomorrow. You tested sign-in on your laptop and reached the dashboard. You still need to test it on a phone. You give an AI those notes for the project report, and it hands you a paragraph about “sign-in functionality” and “subsequent navigation.” Your instructor has to translate it back into what you did.

**If it represents you, it should sound like you.** Your instructor needs to know what worked and what you still need to check. Your teammate needs the same thing from a ticket: what you found, and what they have to do next. Neither should have to ask you to translate a paragraph you would never have written yourself.

An AI draft can turn two plain sentences into a paragraph full of phrases you would never say. Your instructor now has to turn “subsequent navigation” back into “I reached the dashboard.” Your teammate has to read the ticket again to find the question. The model saved you a minute and handed the work to someone else. Generous of it.

I tell my students and junior teammates the same thing: **Don't let AI do what you can't do or understand yourself.** That applies to the words you publish under your name. If a draft says the bug is caused by permissions, you should be able to explain what you checked and why it points to permissions. If you only know that two accounts got different results, say that. Read the draft aloud before you post it. Rewrite any sentence you wouldn't say or couldn't explain if someone asked.

Fixing one draft by hand is easy. Fixing the same draft every week is the part that wears you down, because the AI forgets your fix the moment the chat closes. A short file called VOICE.md gives the next session examples to start from. Save words you would actually use, alongside the draft they replaced, and tell the agent to read them before it writes. Everyone working with AI should have one. The rest of this note shows what to put in it.

## Say what you actually mean

Go back to the project report. The only test you ran was signing in on your laptop and reaching the dashboard. Compare what the AI wrote with what you can explain to your instructor.

<figure class="live-fig voice-compare" data-live-figure="voice" data-surface="figure:voice" aria-label="The same sign-in report in AI wording and in your own words">
<div class="voice-compare__versions" aria-live="polite" aria-atomic="true">
<section data-voice-version="before" aria-label="AI draft">
<p><strong>AI draft</strong></p>
<blockquote>The application’s sign-in functionality was successfully validated on a laptop, with subsequent navigation to the dashboard. Validation of sign-in functionality on a phone remains pending.</blockquote>
<p class="voice-compare__note">The facts are there. Your reader has to translate the wording.</p>
</section>
<section data-voice-version="after" aria-label="In your own words">
<p><strong>In your own words</strong></p>
<blockquote>I signed in on my laptop and reached the dashboard. I still need to test sign-in on a phone.</blockquote>
<p class="voice-compare__note">The reader knows what worked and what you still need to test.</p>
</section>
</div>
<figcaption>The same facts in both versions. Only the wording changes.</figcaption>
</figure>

Both versions say sign-in worked on a laptop, the dashboard opened, and the phone test is still pending. The first makes your instructor translate “sign-in functionality was successfully validated” into “I signed in.” The rewrite says what happened in words you could use in a conversation. Your reader gets the same information with less work.

That is the check to make before you send an AI draft. Would you use these words yourself? Do you understand every claim? Can the person reading it tell what you mean? If a sentence fails, rewrite it before it goes out under your name. Save the pair in VOICE.md so the agent can see the difference next time.

## Start with the question you need answered

The same habit applies to a ticket, a shared record of a bug or a piece of work. Say you are a few months into your first developer job, and a bug ticket is waiting for an update. You paste the thread into an AI and post what comes back. It is four paragraphs long, and the question you needed answered is in the last one.

Once the words say what you mean, put them where the reader can use them. Someone reported an empty export. You tried two accounts and got different results. To take the next step, you need to know which account the reporter used.

**Before**

> I looked into the export and got a full report as an admin and an empty one as a counselor. It could be permissions or the date filter, which I haven't tested yet. Which account were you signed in as when your export came back empty?

**After**

<blockquote class="callout">
<strong>Needs the reporter:</strong> which account were you signed in as when the export came back empty?<br>
Permissions or the date filter could explain the empty export. The filter is still untested.
<details>
<summary>What I checked (2)</summary>
<ul>
<li>Export fills for an admin account.</li>
<li>The same report as a counselor comes back empty.</li>
</ul>
</details>
</blockquote>

The date filter stays visible because it could change what you investigate next. The two account checks can sit under the disclosure because the reporter can answer without opening it.

Use these three questions to check your next draft before you post.

<svg viewBox="0 0 340 230" width="100%" role="img"
     aria-label="Before posting, check three things in order. Put what the reader needs to do on the first line. Keep anything that could change the answer visible. Put supporting checks under a label below."
     style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:16px">
  <defs>
    <marker id="fl-voice-file" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <rect x="12" y="4" width="316" height="52" rx="6"
        style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="fill:none;stroke:var(--color-line)">
    <rect x="12" y="89" width="316" height="52" rx="6"/>
    <rect x="12" y="174" width="316" height="52" rx="6"/>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1.5">
    <line x1="170" y1="63" x2="170" y2="82" marker-end="url(#fl-voice-file)"/>
    <line x1="170" y1="148" x2="170" y2="167" marker-end="url(#fl-voice-file)"/>
  </g>
  <g text-anchor="middle">
    <text x="170" y="36" style="fill:var(--color-bg)">What does the reader need to do?</text>
    <text x="170" y="121" style="fill:var(--color-fg)">What could change the answer?</text>
    <text x="170" y="206" style="fill:var(--color-fg)">Which checks can go below?</text>
  </g>
</svg>

## What goes in the file

**Write down the examples you want the agent to follow.**

You can keep a VOICE.md for yourself in a class repo or a side project. On a team, ask whoever owns the repository whether one exists, and offer to start it if it does not. The rest of this section is the setup.

The agent reads AGENTS.md or CLAUDE.md when the session opens. That file tells it which tests to run. When you ask it to write, it also needs examples of how you speak and what your reader needs. Without them, it may turn a laptop test into a claim about every device, or recount the work and leave the question at the bottom.

Put VOICE.md beside the instruction file and add a line telling the agent to read it before writing. Start with a draft you would never say aloud and your rewrite. Add an example from your own tracker to show where the question goes in a ticket. Do the same for a review and a chat message when you have a pair worth keeping.

<svg viewBox="0 0 340 248" width="100%" role="img"
     aria-label="At startup the agent reads AGENTS.md or CLAUDE.md. When asked to write a ticket comment, it follows the instruction to read VOICE.md. It uses the tracker example to draft a comment with the question first."
     style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto 1.5rem;
            font-family:Georgia,'Times New Roman',serif;font-size:16px">
  <defs>
    <marker id="fl-voice-file-instructions" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line)">
    <rect x="12" y="4" width="316" height="62" rx="6"/>
    <rect x="12" y="93" width="316" height="62" rx="6"/>
  </g>
  <rect x="12" y="182" width="316" height="62" rx="6"
        style="fill:var(--color-fg);stroke:var(--color-fg)"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5">
    <line x1="170" y1="71" x2="170" y2="88" marker-end="url(#fl-voice-file-instructions)"/>
    <line x1="170" y1="160" x2="170" y2="177" marker-end="url(#fl-voice-file-instructions)"/>
  </g>
  <g text-anchor="middle">
    <text x="170" y="30" style="fill:var(--color-fg)">The session opens</text>
    <text x="170" y="51" style="fill:var(--color-muted)">Read AGENTS.md or CLAUDE.md</text>
    <text x="170" y="119" style="fill:var(--color-fg)">You ask for a ticket comment</text>
    <text x="170" y="140" style="fill:var(--color-muted)">Follow the pointer to VOICE.md</text>
    <text x="170" y="208" style="fill:var(--color-bg)">The agent drafts the comment</text>
    <text x="170" y="229" style="fill:var(--color-bg)">Use the example to put the question first</text>
  </g>
</svg>

Forty lines that get read beat four thousand that get skimmed, because the file competes with the code for the model's attention. Examples carry more than adjectives. One bad comment and one good one teach a register faster than a page saying be clear and concise, which every writer already believes and the model will cheerfully agree with while doing the opposite.

Write down what makes the words yours and what helps the reader act:

- **Use words you would say.** Replace a sentence you would have to translate with the words you would use to explain it to a teammate.
- **Keep claims you can explain.** Say what you checked. A test on one laptop does not establish what happens on a phone.
- **Put the ask first.** The first line says what the reader has to do and who has to do it: needs a check, needs the reporter, fixed and back to you.
- **Put the proof under a label with a count.** What I checked (2) tells the reader whether opening it is worth the tap.
- **Keep what you have not tested in view.** If a claim rests on something untested, say so next to the claim, never inside the fold.
- **A one-line comment stays one line.** Structure is for comments with more than one thing to say.

Write them as rules, not as a list of banned words. [Ege Vusal Chelebi](/people#ege-vusal-chelebi) [tried a writing skill](https://www.chele.bi/videos/the-cure-for-ai-slop) derived from Simplified Technical English on six tasks. The linter counted 74 percent fewer violations per hundred words on Claude Sonnet and 50 percent fewer on GPT-5.5. A banned-word list cut violations by 3 percent and 40 percent, respectively. The linter scored the writing against a set of rules. The test did not measure whether readers found the ask faster.

My own standard is public at [portfolio.tjakoen.com/standards/voice](https://portfolio.tjakoen.com/standards/voice). It is longer than a team needs because it is also a guide to one person's prose. Take its structure, not its length: the registers, the scan rule, the list of shapes it refuses.

Try the template on one comment you are about to post. If you are working on a class project, use a paragraph from your project report and ask your instructor which version they would rather grade. On a team, bring the original and your rewrite to your next one-on-one and ask which one they could act on faster.

<div class="copy-template" data-copy-template>
<button class="share-block__copy" type="button" data-copy-template-button aria-live="polite" hidden>Copy VOICE.md</button>

```markdown
# VOICE.md

How we write anything a teammate reads: ticket
comments, pull request bodies, review comments,
chat, docs. Read this before drafting. Where a
rule here fights the model's default, this file
wins.

## The one rule

Use words I would say and claims I can explain.
The reader should not have to translate the draft.

## Before sending

- Read the draft aloud. Rewrite anything I would
  not say to the person receiving it.
- Keep the facts I supplied. Do not turn one test
  into a claim about devices I have not checked.
- Put what the reader needs to do first. Keep
  anything untested visible beside the claim.

## By surface

### Ticket comment
- First line in bold: the action and its owner.
  Needs a check, needs the reporter, fixed and
  back to you.
- Then short groups under a plain lead-in: what
  I checked, what is still open.
- A blank line between groups. Every ticket key
  is a link.
- One thing to say? One line. No heading, no
  bullets.

### Pull request body
- Start with what changed and what you need the
  reviewer to check. Keep open risks visible.

### Review summary
- Start with the verdict and the next action.
- Tests and proof fold under a label with a
  count.

### Review comment
- Ask, do not declare. State the mechanism,
  then put the fix as a question the author can
  say no to.
- The proof folds. The caveat does not.

### Chat
- The ask is the first sentence. No "quick
  question" preamble.
- One update per message, not a status report.

### Docs
- Full prose. No fragments, no compression. All
  the articles.

## Never
- Em dashes. Use a comma, a period, or
  parentheses.
- Backticks in prose. Code and literal terminal output only, never for emphasis.
- "It's not just X, it's Y." "I hope this
  helps." "In conclusion."
- A list of exactly three tidy bullets, every
  time.
- A hedge moved out of sight.

## Before and after

### Say what I checked

Bad:
> The application's sign-in functionality was
> successfully validated on a laptop, with
> subsequent navigation to the dashboard.
> Validation of sign-in functionality on a
> phone remains pending.

Good:
> I signed in on my laptop and reached the
> dashboard. I still need to test sign-in
> on a phone.

Use the words I would use to explain the test.
Keep the same facts when rewriting. Change
the wording, not the result.

### Put the question where the reader can find it

Bad:
> I looked into the export and got a full report
> as an admin and an empty one as a counselor.
> It could be permissions or the date filter,
> which I haven't tested yet. Which account were
> you signed in as when your export came back empty?

Good:
> **Needs the reporter:** which account were you
> signed in as when the export came back empty?
>
> Permissions or the date filter could explain
> the empty export. The filter is still untested.
>
> <details>
> <summary>What I checked (2)</summary>
>
> - Export fills for an admin account.
> - The same report as a counselor comes back empty.
>
> </details>

On a tracker without disclosures, put the proof
below the ask and caveat under the same label.

Replace these examples with my own drafts and
rewrites. Keep a pair that fixes the wording and
a pair that makes the next action easy to find.
```

</div>

The examples are the part to replace first. Save the paragraph that did not sound like you and the one you would send. Keep the comment that made someone scroll and the rewrite that put the question first. Those pairs teach the agent what you mean by writing well.

## The same file can point the other way

**A voice file can also describe how you want the AI to talk to you.**

Everything above is about how the AI should sound when it writes as you. [Kercwin](/people#kercwin), the tech lead on my team, went the other direction. Before he [built his epic checker](move-bugs-left.md), he showed the team how he makes Claude talk to him: tables, diagrams, specific wording, a format his brain reads fast. His file is about the reader at his own desk.

Both files rest on the same idea. Someone has to read what the model writes, and the file tells the model who that is. If you lose the point of a long AI answer halfway down, write down the shape you read fastest and put it beside your VOICE.md. One file shapes what you send your team, and the other shapes what comes back to you.

## Write down the shape you want back

**The other half of a voice file is how the answer comes back.**

Everything so far is about what you send. The answer that lands in your chat has a shape too, and most people never say what they want from it. The model picks: paragraphs, the point somewhere in the middle, a closing offer to help further. On a strong model that is a small annoyance. On a lighter one it is the whole experience, because a model with less room to think spends that room on length instead of structure.

Kercwin's version of the idea is the one I keep coming back to: the format is part of the instruction. He wrote down how he wants Claude to talk to him, tables and diagrams and a fixed order, and the improvement came from the file rather than from a bigger model.

So add the shape to the same file, or a short one beside it. Mine, in order:

- The ask on the first line, before any account of what happened.
- Every step I have to run, numbered and complete enough to paste.
- The prompt itself. If it is long, a file I can open, linked, and checked once before it is sent.
- A link to anything that renders, still running, so I look at the page instead of reading about it.
- Bullets for the detail, one point each.
- A table once there are three things to compare.
- Plain words, acronyms expanded, every number with what it means.

That list is written up as [BRIEF.md](/standards/brief), with the reasons and the before and after. Save your own version beside your VOICE.md, whatever your list is.

The difference is easiest to see side by side.

| What usually comes back | What I ask for instead |
|---|---|
| Four paragraphs, the question in the last one | The ask on the first line, then the detail |
| You can run the test suite | The command, numbered, ready to paste |
| Ask the agent to check the index | The prompt itself, or a link to the file holding it |
| The page renders correctly | The URL, while the page is still running |
| A paragraph comparing three options | A table with one fact per column |

I noticed the gap on a fallback model, not the main one. OpenCode had dropped to a lighter model than the plan intends, and the reports came back in walls of text with the question buried. The shape held when I asked for it, which is the point: the file carried what the model could not. The evidence is a handful of sessions, so call it a working shape rather than a proven one.

A format the model ignores is worth nothing, and a model that ignores a file will ignore one paragraph of it. The reason to write the shape down is the same reason to write your voice down: the next session reads the file, and the file does not forget.

## A file nobody points at is a file nobody reads

**An agent reads what its instruction chain tells it to read.**

If VOICE.md sits at the root and the file that loads at session start never mentions it, the model will find it sometimes and ignore it most of the time. The change is two lines: one in AGENTS.md saying to read VOICE.md before writing anything a person reads, and one in the review or ticket skill if the team has one. The agent already reads the plan before it codes. It reads the voice file before it comments.

Placement in the workflow matters as much as placement in the tree. The file has to be in front of the model at the moment of drafting, not in a wiki it has never opened. If the tool ignores repository files, the file is not in force. Paste it in, or accept that the default is still doing the writing.

## What the file cannot do

**A file is a prompt, not a guarantee.**

It drifts. Models change and teams change, and a rule nobody has edited in a year is probably describing a surface nobody uses. The maintenance is small and it is not optional: when a bad comment lands, add it as an example.

It does not stop the paste. Someone will drop in a generated comment that never read the file. What the file gives the next person is a standard to point at, which is more than a bad comment usually gets.

Before the team changed its review format, folded feedback was acted on less often than visible feedback. The sample since the change is small, so it is still open whether folding helps. A reader who never reaches the ask cannot act on it.

On your next ticket, write the first line yourself. Then give the agent that line, your checks, and the voice file. Before you post, make sure the question is still there and that anything you have yet to test is visible. Use words you would say and keep the claims you can explain. If the rewrite helped, save the pair for the next person who has to write one.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
