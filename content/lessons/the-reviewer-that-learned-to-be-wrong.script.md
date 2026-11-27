# The reviewer that learned to be wrong

Status: DRAFT script for Tjakoen to read aloud and edit. Written from the note; not yet read or checked by him.

## Stop 1: Why not?

My PR review kit is a set of Claude skills that reviews my team's pull requests at Career Team the way I would, in the tone I would, and posts under my account. It reads the ticket before the diff. It never approves anything. And it keeps a log of every time it was wrong. That last part is most of the story.

On August 14 I committed the first version. The next day I made forty more commits to it, and one of them was titled "review the ticket, not just the diff." That should have told me how this was going to go. As a snapshot, on November 9 the repository had 737 commits and sat at release 2.6. That number sounds like a flex. It's closer to a confession. Most of those commits are the reviewer being told it was wrong, and me building the machinery to tell it.

One thing before I go on. Every screen in the note this comes from runs on mock data. The board is the real one, running on invented pull requests and invented people. The real version holds Career Team's work, and it stays at work. So this lesson is about how the kit works and how it got there, never about what it found.

Here's how it started. Before any of this, I was already using the company's standard PR reviewer, and I was still reading every word it wrote. My name goes on the approval, so its output had to be right before I clicked anything. I also sit in the architecture group, which means some pull requests can't merge until I review them. That summer, code review was a real bottleneck on the team. Architecture review was the worst of it, and a fair share of that queue was waiting on me.

So in a manager meeting I raised it with our Director of Engineering. He wanted AI built into how the engineering teams actually worked, and that was the bar he wanted to bring here. I explained that I was still checking everything the reviewer did by hand. He asked why. I said I didn't trust it.

He asked, "Why not?"

Something clicked. I didn't have a good answer. And I realized the honest response wasn't to keep distrusting the reviewer, but to make it into something I could trust. Then came the rabbit hole.

The first thing I noticed was how much there was to learn from other people's reviews. The architecture group takes review seriously and leaves a lot of feedback. So before I changed a line of the reviewer, I pulled hundreds of their reviews and mined them for the rules they kept repeating. That turned into the self-learning loop this whole lesson is about. The reviewer's own comments get scored against what happened next, and every miss gets folded back in as a lesson.

From there it turned into a habit. Whenever someone shares something I think could make the reviewer better, a teammate's tool, a post, a paper, I take what I can from it and put it in the kit. Google's written standard for code review went in. So did the way Alibaba moved the parts of its AI reviewer that must not go wrong out of the model and into plain code. So did how Addy Osmani describes the loop agentic work runs on.

What he gave me in that meeting was a question. It made me want to trust my AI, and to trust it for reasons I could show rather than a feeling. Everything after that is me trying to earn it. A record I could check. A fix every time the record said it was wrong. And guardrails around the parts I was never going to hand over.

Next, the first version, and the week it spent learning manners.

**Digest:** I was reading every word an AI reviewer wrote because I didn't trust it. A one-line question, why not, turned that into a project to earn trust I could show.

**Trial:** Name one AI tool whose output you still check line by line. Write one sentence answering why not, and one thing that would have to be true for you to stop checking.

**Runes:**
intro | it keeps a log of every time it was wrong
early-aug-why-not | My name goes on the approval
early-aug-why-not | make it into something I could trust

## Stop 2: A reviewer I had to babysit, and the day it started keeping score

The first version was a skill I typed a pull request number into, and watched. I started from the staff-level PR reviewer our Director of Engineering built for the platform group. The core was his. A handful of parallel lenses over the change, covering security, accessibility, tests, migrations and a staff-engineer read. Every finding checked a second time before it was kept. And one review posted with comments anchored to lines. What I added was the reading before the diff, the linked ticket and its epic, and my own tone on the way out. Theirs is the reviewer for everyone. Mine is the opinionated one, and it reviews the way I do.

The first two days of history are mostly the skill learning manners. The commit titles read like notes from a bad first week. Review the ticket, not just the diff. Post one review, and stop calling everything Minor. Ask whether we already built this. Each of those is a review I watched go out and winced at. It was useful from day one and annoying from day one, which I suspect is true of most first hires.

Then on August 18 came the turn the rest of the story hangs on. The first scored outcomes.

Every finding the reviewer posts gets a row in an outcome log, scored later by what happened to it. Fixed, answered, closed without a change, or ignored. Anything a human reviewer caught that mine didn't goes into a separate miss log. By September 9 there was a standing skill whose only job is to read those logs and fold the lessons back into the lenses.

I'd love to say this went smoothly. On October 1 there's a commit that locks the outcome log, because eleven scores in twelve were being lost. Two routines had been writing to the same file and quietly overwriting each other. So for a stretch the reviewer was being graded on a sample of almost nothing, and I hadn't noticed. A measuring tool that loses its measurements is a very confident way to learn nothing.

Here's the line I'd put on the wall. A reviewer does not get better by being prompted harder. It gets better by being shown, row by row, where it was wrong.

This is the part of the kit I care about most, and the part I'd build first if I started again. The reviewer isn't a prompt I keep polishing. It's a loop that grades itself and changes itself, and I sit at one point in it.

Two details in that loop do most of the work. Every score is read per topic, never as one average. A reviewer can be excellent on database changes and noisy on frontend speed, and the mean of those looks fine. And the one point where I sit is the arrow into a change. The loop can find the lens that needs fixing and propose the fix, but it can't change itself without my sign-off. Every change it does make is re-run on old pull requests before it counts.

On September 17 I introduced the kit to the team in a talk called Every Time It Was Wrong. By then it wasn't a reviewer I ran by hand any more. It was already largely automatic and already learning from itself. It ran out of the Claude Code desktop app. Scheduled checks found pull requests waiting for review, spun up a session for each one, and filed every session into a sidebar section by its status, so the sidebar itself was the board.

The talk showed the review as six specialist reviewers reading the change at once, with most of what they find never reaching the author. It passes through checks that throw things out, then through the reviewer arguing against its own findings, and a handful of comments come out. That shape hasn't changed since.

Around the same days, a second skill started answering replies, checking a claimed fix at the new commit and resolving its own threads. A push from the author started queueing a re-review over just the new commits. And every unattended routine got one report format, so I could read a night's work in a table instead of a transcript.

Next, what happened when other people wanted it.

**Digest:** The first version needed watching and learned manners commit by commit. From August 18 every comment was scored by what happened next, read per topic, and no change lands without my sign-off.

**Trial:** Take the last five review comments you left or received. Mark each one fixed, answered, closed without a change, or ignored, and see which topic scores worst.

**Runes:**
aug-14-it-started-as-a-reviewer-i-had-to-babysit | annoying from day one
aug-18-then-it-had-to-keep-score | A reviewer does not get better by being prompted harder.
sep-17-the-talk-was-the-old-version | the sidebar itself was the board

## Stop 3: Other people, a second engine, and a bill

In late September the repository was restructured so someone who wasn't me could clone it. On September 28 the installer learned to set the kit up from a profile per person. Everything personal, the outcome log, the watcher state, the boards a person cares about, moved under that person's own directory.

The board page followed in mid-October. One page per person, with Board, History, Calibration and Stats tabs. Cards that move between columns depending on who owes the next move. A Run now button, settings that live on the board, and setup from one paste. The 1.0 release notes put it plainly. It was the first release a teammate can set up, use and repair alone. I'm no longer the only manager whose reviews run through it.

Once there were two kits, they started reviewing the same pull requests. So on October 19 the kit learned the second look. When a teammate's kit has already reviewed the head commit, mine runs only what theirs left unchecked and posts an addendum. At first it left a one-line note when it had nothing new. Now it posts nothing at all, and since early November every second look carries its own label, so a silent one still shows on the pull request. In November it also started building on the platform group's reviewer when that one had already left a verdict, instead of repeating it.

Then there's a practical problem with running a reviewer on a schedule. My Claude usage is finite, and pull requests are not. On October 8 the reviewer was adapted for Codex. Within days the calibration loop could find reviews from both through their labels, so a review Codex wrote is scored in the same log as one Claude wrote.

Then Codex became the fallback for when I run low. In mid-October the switch stopped being something I flipped by hand. As my weekly Claude use climbs, the kit runs fewer reviews at once. Four at a time under seventy percent, then three, then two, then one at ninety. Past a threshold I choose, new reviews go to Codex. A pull request keeps the engine that first reviewed it, so a conversation that started with Codex finishes with Codex instead of changing voice halfway through.

That still left the week I burn through Claude completely, when the board itself has nothing to run on. So I built a second, much smaller thing next to the kit. A minimal Codex dashboard that shows the review queue and lets me keep reviews moving with no Claude at all. It's plain on purpose. It exists for the bad week, and on the bad week I want a list and a button, not a tour.

I want to be clear about one limit here. Codex is the backup, not a peer I've benchmarked. That comparison work exists and it isn't finished. What is finished is that a quiet week on one engine no longer means a quiet week on reviews.

And then the bill. A reviewer that runs every night costs something, and I wanted model choices made the same way as lens changes, on results, not on taste. So the model behind each part of the kit is a decision with a trial behind it.

The six lenses and the skeptic were pinned to Sonnet in September, and they held their precision, so the expensive model only does the parts that need judgment. The review itself went from Opus 5 at medium, to Opus 5.5 at medium, to Opus 5.5 at low. Low held up. Across thirty reviews it found more per review than the medium baseline, and not one blocking finding was thrown out. I tried Haiku for the routines that only check for work. It was far cheaper per check, but a pinned model doesn't switch a session that's already running, so those slots went back to Opus.

On October 13 the kit started pricing every review session at list rates. That's an estimate, not the bill, but it's the same estimate every week, so the trend is real. Over the first four weeks of data, the median cost of a review came down a long way. A fourth trial, a stricter low setting, is still running.

Next, the part that convinced me, which is proving a repair actually held.

**Digest:** The kit became installable by teammates, learned to build on their reviews, and hands work to Codex as my Claude use climbs. Model choices are trials judged on results.

**Trial:** Pick one model choice in your own setup that you made on taste. Write the one result that would tell you whether a cheaper model could do it.

**Runes:**
sep-28-then-other-people-wanted-it | the first release a teammate can set up, use and repair alone
oct-8-then-it-needed-a-second-engine | on the bad week I want a list and a button
oct-13-then-it-had-to-earn-its-keep | on results, not on taste

## Stop 4: Receipts, a map, and choosing what to look at

A replay ledger arrived on October 14, and by mid-October it did the part that convinced me. When a lens gets repaired after a miss, the repair is replayed on the pull request the miss came from, at the commit the original review ran on. On November 3 a batch of thirty-three replays came back, and nine lens rules were fixed because the replays found them wanting.

A repair that hasn't been replayed is a hope. A replayed one is a receipt.

Then the kit got a map of the code. The lenses I started from read the diff and the files around it. That misses the thing that breaks most often in a codebase our size, which is the code that isn't in the diff but depends on it. So on October 18 the kit gained code graphs, built with a tool called Graphify from each branch the team ships, and shared by everyone who runs the kit.

Before the lenses run, the review cuts a slice of that graph for the change and hands it over. Who calls each changed function. Functions with the same name in other apps. The permission and feature gates on each one. And the tests that touch them. The graph is rebuilt whenever its branch moves.

This is company code, so Graphify gets the same treatment as everything else in the kit that touches it. Hard blocks, not good intentions. It's an outside library, and the kit runs only its code-reading pass, as a pinned version checked against a hash, in a sandbox with no network. Its installers, hooks and server are never run. The graphs stay in the kit's private repository and on the machines of the people who run the kit. A tool that reads the whole codebase can't send any of it anywhere, because nothing in that sandbox can reach anywhere to send it.

The honest limit is that the graph slice is still on a watch, not on for everyone. It runs on my reviews while I measure whether the lenses that get it find more than the ones that don't.

The newest turns are the reviewer getting choosier about what it reads. On October 26 it started reading the epic's decided rules and the decisions made in Jira comments. On November 3 it folded in the epic check that Kercwin, a tech lead on my team, built as his own plugin after seeing my board. So a deviation the team already agreed to stops being flagged as a defect.

The same day, risk intake arrived. A pull request from outside my boards gets queued only when it touches a high-risk area and reaches code my team owns. It's capped at a ranked three a day, so the queue doesn't drown. And the same graph does a second job here I didn't plan for. It tells risk intake which code is ours, and lets it ignore the shared helpers that almost everything touches, which would otherwise make every change look like ours.

Release 2.6, on November 4, made every lens prove it read its rules before its findings count. A lens that skips them twice gets named in the evidence, and the review can't post a PASS. Show your work, or it doesn't count.

Next, the one time it let something through.

**Digest:** Every repair is replayed on the exact commit it missed, so a fix is a receipt rather than a hope. The kit now reads a sandboxed code graph, the epic's decisions and a capped stream of risky outside changes.

**Trial:** Find one bug fix you made recently because something was missed. Write down how you would replay the original check against the original commit to prove the fix would now catch it.

**Runes:**
oct-14-then-it-had-to-prove-its-repairs-held | A replayed one is a receipt.
oct-18-then-it-got-a-map-of-the-code | hard blocks, not good intentions
oct-26-then-it-had-to-decide-what-deserved-a-look | so the queue does not drown

## Stop 5: The one it let through, and how it works now

I've run the kit unattended for months, and in that time we broke production once on a change it had passed.

A data-fix migration was meant to remove a few unwanted entries from one customer's dropdown. Its filter matched on a type field that some unrelated rows also carried. So it switched off a handful of reference rows another part of the product depended on. The rows were switched off, not deleted, so nothing was lost, and they were restored from the backup the migration itself had taken. But for a few weeks some staff couldn't record work they needed to record, and nothing on screen told them why.

The reviewer had read that migration and said nothing.

So it went through the same loop as every other miss, with more at stake. It was recorded against the migrations lens. On October 30 that lens got a new rule. A change to rows that other features read is checked against every reader of that data, not just against the ticket that asked for it. Then the repair was replayed on the original pull request, at the commit the review had read the first time, with no hint of what had gone wrong. It blocked the change. Two other pull requests with the same shape went in as test cases alongside it, and it caught those too.

One production break in months is a record I'm comfortable defending. It's also the best argument for the loop I have. A reviewer that never misses doesn't exist, so the question was always what happens after the miss.

So how does it work now? A pull request lands on my board from my team's code review column, from risk intake, or because I pasted it in. Scheduled routines take it from there, and only between five in the evening and seven in the morning. That's my working day, since I work nights, so every review lands while I'm awake to answer for it.

The loop at the center is the one I showed in September. What changed since is everything around it. Where pull requests come from, what a review reads before the diff, who else is reviewing, and which engine does the work.

The review reads the ticket and its epic before the diff. It sends six specialist lenses over the change and tries to refute every finding before keeping it. Then it posts comments anchored to lines, with a PASS, REQUEST CHANGES or BLOCKING verdict. It checks the change against the epic's decided rules and the decisions in the ticket's comments, and notes any other open pull request editing the same lines. And it runs the epic check where the epic has one.

After the review, each event gets its own response. A reply from the author gets answered if the team's recorded decisions settle it, and otherwise it's left for me. A claimed fix gets checked at the new commit, and the kit resolves its own thread. New commits get a re-review over just those commits. A head commit a teammate's kit already reviewed gets a second look. And when my Claude use passes the weekly threshold, new reviews go to Codex.

The learning half is the part that earns the trust. Every comment is scored by what happened next. Every miss is recorded with the lens that should have caught it. A theme that keeps being closed without a fix gets its lens tightened. And every repair is replayed where the miss happened.

It never approves, never merges and never pushes code. Guards block a push rather than merely discourage one. A PASS from the kit means it has nothing left to say, and the approve button stays mine.

Next, what my team felt, and what I got back.

**Digest:** The kit passed one change that broke production, and the repair was replayed on the original commit and blocked it. It reviews only in my working hours, and approval never leaves my hands.

**Trial:** Write down the last miss your own review process let through. Write the one rule that would have caught it, and which pull request you would replay it on.

**Runes:**
oct-30-then-it-let-one-through | The reviewer had read that migration and said nothing.
oct-30-then-it-let-one-through | what happens after the miss
nov-9-how-it-works-now | A PASS from the kit means it has nothing left to say

## Stop 6: What the team felt, what I got back, and what I haven't shown

The bottleneck that started all this was review wait, so that's the number I checked. Crew Watch, the team dashboard I built for my one-on-ones, keeps every pull request my team opened since late July with its reviews. I looked at the time from a pull request being opened to its first review by anyone other than its author. This is a snapshot, taken on November 10.

The median barely moved. It was under two hours before the kit and it's under an hour now. Most pull requests were never the problem, because someone usually picked them up within a couple of hours. The long tail is what the kit took apart. Before the kit, one pull request in four waited seventeen and a half hours or more. Since the board and the Codex fallback, that one in four waits three hours or more. That's the bottleneck I raised in that manager meeting.

I owe you the limits on that. These are wall-clock hours, nights included, so an overnight routine flatters itself against a human who reviews in the morning. The window before the kit is only a few weeks. And other things changed over the same months that I can't separate from the kit. It is a before and after, not an experiment.

The other half of the payoff was mine. Before the kit, first-pass review ate a big share of my working hours. I was the bottleneck, reading every word a reviewer I didn't trust had written. Now I don't re-read its reviews at all. I trust them, which was the whole point of answering his question, and the calibration that earned that trust runs without me.

So the hours that used to go to the review queue go to the people on my team instead. The one-on-ones, the unblocking, the dashboards. For a manager, that's the real trade. The kit took the part of the job a machine can be held to a standard on, and gave back the part only I can do.

Now what I haven't shown. I have not shown that the kit makes the codebase better. I've shown that its findings get scored, that its misses get replayed, and that the share of its comments people act on is something I can look at instead of guess at. Whether that adds up to fewer bugs reaching production is a longer study than three months, and I haven't run it.

Back to that commit on day two. Review the ticket, not just the diff. Seven hundred commits later the kit still does that first. And almost everything after it is the same idea, turned on the reviewer itself. Read what it was supposed to do, then check what it actually did.

That's where this lesson ends, and the path carries on to the next stop on the map.

**Digest:** The worst-case wait for a first review fell from most of a day to about three hours, as a before and after, not an experiment. The hours I got back went to my team, and better code is still unproven.

**Trial:** Pull the open and first-review times for your team's last twenty pull requests. Work out how long the slowest one in four waited, and write it down as your baseline.

**Runes:**
what-the-team-felt-and-what-i-got-back | It is a before and after, not an experiment.
what-the-team-felt-and-what-i-got-back | gave back the part only I can do
what-i-have-not-shown | I have not shown that the kit makes the codebase better.
