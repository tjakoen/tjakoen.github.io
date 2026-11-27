# The reviewer that learned to be wrong

Status: DRAFT script for Tjakoen to read aloud and edit. Cut into beats from the earlier narration; not yet read or checked by him.

How this script works. The note stays open on the page while the recording plays. Each beat is a short spoken line about one idea, and it names the phrase in the note that lights up while it plays. The wording is the earlier narration, cut to the lines that carry the idea. Format of a beat: a highlight line (section id, then a quote that must appear in that section of the note, or figure: and a figure name), then the spoken words.

## Stop 1: Why not?

**Beat 1**
highlight: intro | it keeps a log of every time it was wrong

My PR review kit is a set of Claude skills that reviews my team's pull requests at Career Team the way I would, in the tone I would, and posts under my account. It reads the ticket before the diff. It never approves anything. And it keeps a log of every time it was wrong. That last part is most of the story. As a snapshot, on November 9 the repository had 737 commits and sat at release 2.6. That number sounds like a flex. It's closer to a confession. Most of those commits are the reviewer being told it was wrong, and me building the machinery to tell it.

**Beat 2**
highlight: early-aug-why-not | My name goes on the approval

Before any of this, I was already using the company's standard PR reviewer, and I was still reading every word it wrote. My name goes on the approval, so its output had to be right before I clicked anything. He wanted AI built into how the engineering teams actually worked, and that was the bar he wanted to bring here. I explained that I was still checking everything the reviewer did by hand. He asked why. I said I didn't trust it. He asked, "Why not?"

**Beat 3**
highlight: early-aug-why-not | make it into something I could trust

Something clicked. I didn't have a good answer. And I realized the honest response wasn't to keep distrusting the reviewer, but to make it into something I could trust. Then came the rabbit hole. So before I changed a line of the reviewer, I pulled hundreds of their reviews and mined them for the rules they kept repeating. That turned into the self-learning loop this whole lesson is about. The reviewer's own comments get scored against what happened next, and every miss gets folded back in as a lesson.

**Beat 4**
highlight: early-aug-why-not | trust it for reasons I could show

It made me want to trust my AI, and to trust it for reasons I could show rather than a feeling. Everything after that is me trying to earn it. A record I could check. A fix every time the record said it was wrong. And guardrails around the parts I was never going to hand over.

**Digest:** I was reading every word an AI reviewer wrote because I didn't trust it. A one-line question, why not, turned that into a project to earn trust I could show.

**Trial:** Name one AI tool whose output you still check line by line. Write one sentence answering why not, and one thing that would have to be true for you to stop checking.

**Runes:**
intro | it keeps a log of every time it was wrong
early-aug-why-not | My name goes on the approval
early-aug-why-not | make it into something I could trust

## Stop 2: A reviewer I had to babysit, and the day it started keeping score

**Beat 1**
highlight: aug-14-it-started-as-a-reviewer-i-had-to-babysit | typed a pull request number

The first version was a skill I typed a pull request number into, and watched. I started from the staff-level PR reviewer our Director of Engineering built for the platform group. The core was his. A handful of parallel lenses over the change, covering security, accessibility, tests, migrations and a staff-engineer read. What I added was the reading before the diff, the linked ticket and its epic, and my own tone on the way out. Theirs is the reviewer for everyone. Mine is the opinionated one, and it reviews the way I do.

**Beat 2**
highlight: aug-14-it-started-as-a-reviewer-i-had-to-babysit | annoying from day one

Review the ticket, not just the diff. Post one review, and stop calling everything Minor. Ask whether we already built this. Each of those is a review I watched go out and winced at. It was useful from day one and annoying from day one, which I suspect is true of most first hires. Then on August 18 came the turn the rest of the story hangs on. The first scored outcomes. Every finding the reviewer posts gets a row in an outcome log, scored later by what happened to it. Fixed, answered, closed without a change, or ignored.

**Beat 3**
highlight: aug-18-then-it-had-to-keep-score | A reviewer does not get better by being prompted harder.

Here's the line I'd put on the wall. A reviewer does not get better by being prompted harder. It gets better by being shown, row by row, where it was wrong. This is the part of the kit I care about most, and the part I'd build first if I started again. The reviewer isn't a prompt I keep polishing. It's a loop that grades itself and changes itself, and I sit at one point in it. Every score is read per topic, never as one average. A reviewer can be excellent on database changes and noisy on frontend speed, and the mean of those looks fine. And the one point where I sit is the arrow into a change. The loop can find the lens that needs fixing and propose the fix, but it can't change itself without my sign-off.

**Beat 4**
highlight: sep-17-the-talk-was-the-old-version | the sidebar itself was the board

By then it wasn't a reviewer I ran by hand any more. It was already largely automatic and already learning from itself. It ran out of the Claude Code desktop app. Scheduled checks found pull requests waiting for review, spun up a session for each one, and filed every session into a sidebar section by its status, so the sidebar itself was the board. The talk showed the review as six specialist reviewers reading the change at once, with most of what they find never reaching the author. It passes through checks that throw things out, then through the reviewer arguing against its own findings, and a handful of comments come out.

**Digest:** The first version needed watching and learned manners commit by commit. From August 18 every comment was scored by what happened next, read per topic, and no change lands without my sign-off.

**Trial:** Take the last five review comments you left or received. Mark each one fixed, answered, closed without a change, or ignored, and see which topic scores worst.

**Runes:**
aug-14-it-started-as-a-reviewer-i-had-to-babysit | annoying from day one
aug-18-then-it-had-to-keep-score | A reviewer does not get better by being prompted harder.
sep-17-the-talk-was-the-old-version | the sidebar itself was the board

## Stop 3: Other people, a second engine, and a bill

**Beat 1**
highlight: sep-28-then-other-people-wanted-it | the first release a teammate can set up, use and repair alone

In late September the repository was restructured so someone who wasn't me could clone it. On September 28 the installer learned to set the kit up from a profile per person. The 1.0 release notes put it plainly. It was the first release a teammate can set up, use and repair alone. I'm no longer the only manager whose reviews run through it. Once there were two kits, they started reviewing the same pull requests. So on October 19 the kit learned the second look. When a teammate's kit has already reviewed the head commit, mine runs only what theirs left unchecked and posts an addendum.

**Beat 2**
highlight: oct-8-then-it-needed-a-second-engine | runs fewer reviews at once

Then there's a practical problem with running a reviewer on a schedule. My Claude usage is finite, and pull requests are not. On October 8 the reviewer was adapted for Codex. Then Codex became the fallback for when I run low. In mid-October the switch stopped being something I flipped by hand. As my weekly Claude use climbs, the kit runs fewer reviews at once. Past a threshold I choose, new reviews go to Codex. A pull request keeps the engine that first reviewed it, so a conversation that started with Codex finishes with Codex instead of changing voice halfway through.

**Beat 3**
highlight: oct-8-then-it-needed-a-second-engine | on the bad week I want a list and a button

So I built a second, much smaller thing next to the kit. A minimal Codex dashboard that shows the review queue and lets me keep reviews moving with no Claude at all. It's plain on purpose. It exists for the bad week, and on the bad week I want a list and a button, not a tour. I want to be clear about one limit here. Codex is the backup, not a peer I've benchmarked. That comparison work exists and it isn't finished. What is finished is that a quiet week on one engine no longer means a quiet week on reviews.

**Beat 4**
highlight: oct-13-then-it-had-to-earn-its-keep | on results, not on taste

A reviewer that runs every night costs something, and I wanted model choices made the same way as lens changes, on results, not on taste. So the model behind each part of the kit is a decision with a trial behind it. The six lenses and the skeptic were pinned to Sonnet in September, and they held their precision, so the expensive model only does the parts that need judgment. The review itself went from Opus 5 at medium, to Opus 5.5 at medium, to Opus 5.5 at low. Low held up. Across thirty reviews it found more per review than the medium baseline, and not one blocking finding was thrown out. On October 13 the kit started pricing every review session at list rates. That's an estimate, not the bill, but it's the same estimate every week, so the trend is real. Over the first four weeks of data, the median cost of a review came down a long way.

**Digest:** The kit became installable by teammates, learned to build on their reviews, and hands work to Codex as my Claude use climbs. Model choices are trials judged on results.

**Trial:** Pick one model choice in your own setup that you made on taste. Write the one result that would tell you whether a cheaper model could do it.

**Runes:**
sep-28-then-other-people-wanted-it | the first release a teammate can set up, use and repair alone
oct-8-then-it-needed-a-second-engine | on the bad week I want a list and a button
oct-13-then-it-had-to-earn-its-keep | on results, not on taste

## Stop 4: Receipts, a map, and choosing what to look at

**Beat 1**
highlight: oct-14-then-it-had-to-prove-its-repairs-held | A replayed one is a receipt.

A replay ledger arrived on October 14, and by mid-October it did the part that convinced me. When a lens gets repaired after a miss, the repair is replayed on the pull request the miss came from, at the commit the original review ran on. On November 3 a batch of thirty-three replays came back, and nine lens rules were fixed because the replays found them wanting. A repair that hasn't been replayed is a hope. A replayed one is a receipt.

**Beat 2**
highlight: oct-18-then-it-got-a-map-of-the-code | who calls each changed function

That misses the thing that breaks most often in a codebase our size, which is the code that isn't in the diff but depends on it. So on October 18 the kit gained code graphs, built with a tool called Graphify from each branch the team ships, and shared by everyone who runs the kit. Before the lenses run, the review cuts a slice of that graph for the change and hands it over. Who calls each changed function. Functions with the same name in other apps. The permission and feature gates on each one. And the tests that touch them.

**Beat 3**
highlight: oct-18-then-it-got-a-map-of-the-code | hard blocks, not good intentions

Hard blocks, not good intentions. It's an outside library, and the kit runs only its code-reading pass, as a pinned version checked against a hash, in a sandbox with no network. Its installers, hooks and server are never run. The graphs stay in the kit's private repository and on the machines of the people who run the kit. A tool that reads the whole codebase can't send any of it anywhere, because nothing in that sandbox can reach anywhere to send it.

**Beat 4**
highlight: oct-26-then-it-had-to-decide-what-deserved-a-look | so the queue does not drown

The same day, risk intake arrived. A pull request from outside my boards gets queued only when it touches a high-risk area and reaches code my team owns. It's capped at a ranked three a day, so the queue doesn't drown. Release 2.6, on November 4, made every lens prove it read its rules before its findings count. A lens that skips them twice gets named in the evidence, and the review can't post a PASS. Show your work, or it doesn't count.

**Digest:** Every repair is replayed on the exact commit it missed, so a fix is a receipt rather than a hope. The kit now reads a sandboxed code graph, the epic's decisions and a capped stream of risky outside changes.

**Trial:** Find one bug fix you made recently because something was missed. Write down how you would replay the original check against the original commit to prove the fix would now catch it.

**Runes:**
oct-14-then-it-had-to-prove-its-repairs-held | A replayed one is a receipt.
oct-18-then-it-got-a-map-of-the-code | hard blocks, not good intentions
oct-26-then-it-had-to-decide-what-deserved-a-look | so the queue does not drown

## Stop 5: The one it let through, and how it works now

**Beat 1**
highlight: oct-30-then-it-let-one-through | The reviewer had read that migration and said nothing.

I've run the kit unattended for months, and in that time we broke production once on a change it had passed. A data-fix migration was meant to remove a few unwanted entries from one customer's dropdown. Its filter matched on a type field that some unrelated rows also carried. So it switched off a handful of reference rows another part of the product depended on. The reviewer had read that migration and said nothing.

**Beat 2**
highlight: oct-30-then-it-let-one-through | what happens after the miss

It was recorded against the migrations lens. On October 30 that lens got a new rule. A change to rows that other features read is checked against every reader of that data. The ticket that asked for it is only one of them. Then the repair was replayed on the original pull request, at the commit the review had read the first time, with no hint of what had gone wrong. It blocked the change. Two other pull requests with the same shape went in as test cases alongside it, and it caught those too. One production break in months is a record I'm comfortable defending. It's also the best argument for the loop I have. A reviewer that never misses doesn't exist, so the question was always what happens after the miss.

**Beat 3**
highlight: nov-9-how-it-works-now | to refute every finding before

The review reads the ticket and its epic before the diff. It sends six specialist lenses over the change and tries to refute every finding before keeping it. Then it posts comments anchored to lines, with a PASS, REQUEST CHANGES or BLOCKING verdict. It checks the change against the epic's decided rules and the decisions in the ticket's comments, and notes any other open pull request editing the same lines. After the review, each event gets its own response. A reply from the author gets answered if the team's recorded decisions settle it, and otherwise it's left for me. A claimed fix gets checked at the new commit, and the kit resolves its own thread.

**Beat 4**
highlight: nov-9-how-it-works-now | A PASS from the kit means it has nothing left to say

The learning half is the part that earns the trust. Every comment is scored by what happened next. Every miss is recorded with the lens that should have caught it. A theme that keeps being closed without a fix gets its lens tightened. And every repair is replayed where the miss happened. It never approves, never merges and never pushes code. Guards block a push rather than merely discourage one. A PASS from the kit means it has nothing left to say, and the approve button stays mine.

**Digest:** The kit passed one change that broke production, and the repair was replayed on the original commit and blocked it. It reviews only in my working hours, and approval never leaves my hands.

**Trial:** Write down the last miss your own review process let through. Write the one rule that would have caught it, and which pull request you would replay it on.

**Runes:**
oct-30-then-it-let-one-through | The reviewer had read that migration and said nothing.
oct-30-then-it-let-one-through | what happens after the miss
nov-9-how-it-works-now | A PASS from the kit means it has nothing left to say

## Stop 6: What the team felt, what I got back, and what I haven't shown

**Beat 1**
highlight: what-the-team-felt-and-what-i-got-back | The median barely moved, because

The median barely moved. It was under two hours before the kit and it's under an hour now. Most pull requests were never the problem, because someone usually picked them up within a couple of hours. Before the kit, one pull request in four waited seventeen and a half hours or more. Since the board and the Codex fallback, that one in four waits three hours or more. That's the bottleneck I raised in that manager meeting.

**Beat 2**
highlight: what-the-team-felt-and-what-i-got-back | It is a before and after, not an experiment.

I owe you the limits on that. These are wall-clock hours, nights included, so an overnight routine flatters itself against a human who reviews in the morning. The window before the kit is only a few weeks. And other things changed over the same months that I can't separate from the kit. It is a before and after, not an experiment.

**Beat 3**
highlight: what-the-team-felt-and-what-i-got-back | gave back the part only I can do

Before the kit, first-pass review ate a big share of my working hours. I was the bottleneck, reading every word a reviewer I didn't trust had written. Now I don't re-read its reviews at all. I trust them, which was the whole point of answering his question, and the calibration that earned that trust runs without me. So the hours that used to go to the review queue go to the people on my team instead. For a manager, that's the real trade. The kit took the part of the job a machine can be held to a standard on, and gave back the part only I can do.

**Beat 4**
highlight: what-i-have-not-shown | I have not shown that the kit makes the codebase better.

I have not shown that the kit makes the codebase better. I've shown that its findings get scored, that its misses get replayed, and that the share of its comments people act on is something I can look at instead of guess at. Whether that adds up to fewer bugs reaching production is a longer study than three months, and I haven't run it. Review the ticket, not just the diff. Seven hundred commits later the kit still does that first. And almost everything after it is the same idea, turned on the reviewer itself. Read what it was supposed to do, then check what it actually did.

**Digest:** The worst-case wait for a first review fell from most of a day to about three hours, as a before and after, not an experiment. The hours I got back went to my team, and better code is still unproven.

**Trial:** Pull the open and first-review times for your team's last twenty pull requests. Work out how long the slowest one in four waited, and write it down as your baseline.

**Runes:**
what-the-team-felt-and-what-i-got-back | It is a before and after, not an experiment.
what-the-team-felt-and-what-i-got-back | gave back the part only I can do
what-i-have-not-shown | I have not shown that the kit makes the codebase better.
