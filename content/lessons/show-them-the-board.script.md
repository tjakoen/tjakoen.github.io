# Show them the board

Status: DRAFT script for Tjakoen to read aloud and edit. Written from the note; not yet read or checked by him.

## Stop 1: A month on the wrong thing

For about a month I was writing an app called People Manager. It was going to be the one place I looked at my engineering team at Career Team. Tickets, pull requests, cycle time, the things I bring to a one-on-one. It had a plan folder, a design, and a few hundred commits. It was also going nowhere fast, and it took me a while to see why.

I was thinking like a developer, not like an AI orchestrator. I had sat down to build it the way I would have three years ago. A schema, a server, a page at a time, every screen typed into existence. Meanwhile the tokens that could have built it were being eaten by the other thing I had made, the robot that reviews my team's pull requests. So I was spending the machine on the work and spending myself on the typing. That is exactly backwards.

I kept asking how to build it. The better question was what I wanted to see.

So one afternoon I asked the better question. I asked Claude for a dashboard instead of an app. I pointed it at the data and handed it People Manager as a reference for what I wanted. It was done before I had finished being skeptical about it. That dashboard is called Crew Watch, and I am now fairly sure I do not need People Manager anymore.

In fairness to the timing, I was already building dashboards with Claude before it was a feature. Then Anthropic shipped Claude Dashboards on October 8, and what I had been doing by hand got easier. A dashboard became a thing you ask for, pin and keep, instead of a page you coax into existence. That launch is what got me to try the lazy version of People Manager at all.

One thing before I go on. Every screen in this note runs on mock data. The dashboards are the real ones, but every person, ticket, pull request and number in them is invented. The real versions hold my team's work and Career Team's data, and those stay at work.

The first dashboard I leaned on was the board for my PR review kit. That is the set of Claude skills that reviews my team's pull requests and posts under my name. It never approves or merges; approval stays mine. How it grew from one hand-run skill in August into what it is now has its own note. Here I only want the window.

What changed most is that I stopped managing it from a terminal. Every pull request the kit has touched has a card on the board, in the column of whoever owes the next move. I can queue one by pasting a link. I can correct a finding, see which lens has been wrong lately, and watch whether precision and cost are moving the right way. The reviews run on their own. I just get to look at them like a person, instead of reading log files like a raccoon going through a bin.

The kit goes round in a loop. Review, verdict, follow up, re-review. The one step it cannot take, approval, sits outside the circle with me.

That is the small story. Next is Crew Watch itself, and why it took me four tries to get there.

**Digest:** I spent a month building an app the way a developer would. An afternoon with a Claude dashboard replaced it. The review kit got a window, and approval stayed with me.

**Trial:** Pick one view you keep meaning to build as an app. Write down, in three sentences, what you want to see on it, and ask Claude for a dashboard instead.

**Runes:**
i-was-building-the-wrong-thing-carefully | I was thinking like a developer, not like an AI orchestrator.
i-was-building-the-wrong-thing-carefully | I was spending the machine on the work
the-review-kit-now-with-a-window | It never approves or merges; approval stays mine.

## Stop 2: Four tries at one view

Crew Watch is the view I take into one-on-ones and planning. It took me four tries to get there, and the first three were all reasonable at the time.

The first was a spreadsheet pulling GitHub data. The second was Apache DevLake, and DevLake deserves more credit than one box in a diagram. It is an open-source tool that pulls your Jira and GitHub history into one database and puts dashboards on top. Cycle time, review time, what finished per sprint. It also has a dashboard for DORA metrics, like how often changes reach production and how long they take to get there.

DevLake taught me what those numbers even were. Before it, I had opinions about how the team was doing. After it, I had real data and a set of queries that defined each metric precisely. That part carried forward. When Crew Watch came along, those definitions became its spec, and an audit checked Crew Watch's figures against DevLake's before I trusted them. DevLake answered the questions it was built for. It just was not built for mine. DevLake measured the pipeline. My questions were about the people in it.

The third try was People Manager, the app from the last stop. It is a good app. It was also a month in and nowhere near done.

And here is the honest footnote. The afternoon was not really an afternoon. Crew Watch was fast because People Manager already existed. A month of deciding what the view should show, which numbers I trusted, and which questions I actually ask in a one-on-one was sitting in a plan folder. The dashboard got to read all of it.

The app did not ship. The thinking inside it did.

That is the part I would underline for anyone trying this. The expensive work was never the code. It was deciding what matters, and no model did that for me. A month of my judgment, written down, is what let an afternoon of Claude's typing land. I will take that trade every time, and I would not tell anyone the dashboard came from nothing.

How it works is simple. A small script pulls from Jira and GitHub into one data file, and the dashboard renders it. The audit against the old DevLake numbers caught the places where the two disagreed before anyone saw a wrong figure in a one-on-one. What it shows is my team, and that stays at work.

What it changed is the conversation. Before, we looked at the usual numbers. Commits, lines changed, pull requests opened. I think those are unproductive stats. They count activity, and nobody walks out of a one-on-one knowing what to do differently because their commit count was average.

So I built Crew Watch to be about people. Each person is compared, anonymously, to the rest of the team, so the comparison points at where to focus instead of at who is ahead. If someone moves really fast, maybe we look harder at code quality, so the speed is not borrowing from later. If someone has a lot of kickbacks, the question is why. Maybe the tickets are not written well, maybe they are not being read closely, and those get fixed in different places. If someone is a senior, are they carrying more of the reviewing? And how do story points weigh against how long the work takes? That is a talk about estimating, not effort.

The numbers are a diagnostic, not a grade, and they are read over a quarter rather than one sprint. That framing is what lets someone hear "your kickbacks are high" as a puzzle we solve together.

It landed. As a snapshot, over five weeks of one-on-ones, the dashboard came up in most of them and nobody pushed back. One developer said seeing their numbers next to the team's finally gave them a clear direction. Several left with one concrete thing to work on. That is a handful of people saying so out loud, not a survey, and I would rather say that plainly than round it up.

Next, what happened when I showed all this to my team.

**Digest:** Crew Watch took four tries. It was fast only because a month of written-down judgment already existed. It compares people to the team to point at where to focus, not to grade.

**Trial:** Write down the three questions you actually ask in a one-on-one. For each, name the one number that would help you ask it better.

**Runes:**
crew-watch-attempt-number-four | DevLake measured the pipeline. My questions were about the people in it.
crew-watch-attempt-number-four | The app did not ship. The thinking inside it did.
crew-watch-attempt-number-four | The expensive work was never the code.

## Stop 3: The demo is the policy

I do not hand my team an AI policy and hope. I show them what I built, rough edges included, and let them decide it looks easy enough to try. Nobody gets inspired by a mandate. People get inspired by watching someone they work with do the thing, on their real problems, and come out the other side with an afternoon back.

So I show my team what I build whenever I can. Not as a performance, more as a dare. I joke that if I were still a full-time developer I would have automated my whole process end to end by now. The joke is doing a job. It tells them the tokens they have are for exactly this, and that making their own work easier is the work.

A couple of weeks ago I demoed the review board and Crew Watch. In that couple of weeks, three of them built their own. I did not assign any of them.

The best thing a demo can do is make someone else open their own session.

The tech lead on my team built an epic checker. It reads every ticket and open pull request against the epic's architecture plan in Confluence, and puts each new decision or conflict in front of the person who owns it. I started sending it commits, and one of them lets my review kit fold the epic check's decided deviations into its verdict. His tool now makes my reviews smarter.

A junior on my team showed me, in our one-on-one, a board he had built in Obsidian to run his own work. His tickets, his pull requests, what is waiting on him and what is waiting on someone else. Nobody asked him to, and it is not for me. It is for him. He saw a manager's dashboard and did not think "nice tool for managers." He thought "I could have one of those for me." That is the habit that turns a junior into a senior. You notice the friction in your own work and fix it instead of carrying it.

A fresh graduate, about three months on the team, built a desk for his own pull requests. Approvals, checks, new comments, and whether merged work has reached UAT yet. A script on his laptop pulls from GitHub every ten minutes and writes a file the dashboard reads. The laptop does the fetching, not the model, so keeping it current costs no tokens at all.

And nobody planned this next part. The two juniors built their boards together. One picked Obsidian because he did not want his board tied to Claude and how much of his plan it used. That worry is why the other desk fetches the way it does. One junior's constraint became the other junior's design. Share what helps you, because it rarely stops at helping only you.

I push hard for AI. But the push always comes with the same rule, and it is the one I give my students. You own what you ship. If Claude wrote it, you still have to explain it, defend it in a review, and say why it is right. Do not post a comment, open a pull request or send a message you could not have written yourself. The tool is allowed to type. It is not allowed to think for you.

The rule holds for me too, which is why letting go of my own reviewer took so long. It now runs fully automated, and I trust it fairly well, for reasons I can show rather than a feeling. None of my team's tools decide anything either. The machine drafts, and someone with their name on it signs.

Now the honest part. Two weeks and three tools is a good story, not a trend. I do not know yet whether this sticks, or whether the epic checker still gets opened in three months. Crew Watch replacing People Manager is my judgment after a short run, and the app is parked rather than deleted in case I am wrong. And a dashboard is only as honest as the data under it.

If you lead people and you have built something, show them. The worst case is they nod.

The epic checker earned its own note, so that is where we go next.

**Digest:** I lead with demos, not mandates. Three people built their own tools without being asked, and one of them made my reviews better. The rule stays the same: own what you ship.

**Trial:** Pick one thing you built that helps you. Book ten minutes to show it to one colleague, rough edges included.

**Runes:**
my-whole-ai-policy-is-a-demo | Nobody gets inspired by a mandate.
the-rule-that-comes-with-the-tokens | It is not allowed to think for you.
what-i-have-not-earned-yet | Two weeks and three tools is a good story, not a trend.

## Stop 4: Move bugs left

This stop moves to a second note, the one about the epic checker my tech lead built.

An epic at Career Team has a lot of hands on it. The plan owner, product, leads from maybe more than one team, and the developers doing the work. Decisions change while the work is moving, and the code written last sprint can quietly drift from the decision made this sprint. Nobody notices until review, or testing, or a customer.

My tech lead built the thing that notices first. The idea under it is not his or mine. It comes from our CTO, and it is his standing rule, at least as I remember it from a knowledge-sharing session. Move bugs as far to the left in the process as possible. Those are my words for it, not his exact ones.

A wrong assumption caught on a ticket is cheaper than one caught in review, which is cheaper than one caught in production. Every step right costs more than the one before it. The epic checker is that rule turned into a tool.

Full credit for it goes to my tech lead. He went from developer to tech lead in about a year, which is fast for anyone. I pushed him into the role because I saw something in him before he did, and that is a feeling I know from the other side. A lot of my job with him is the stuff nobody puts on a ticket. The inner voice that says you are not ready. Learning to hand work off instead of carrying it. He is doing a great job, and he is still working out what kind of leader he wants to be, which is the correct amount of figured out for anyone.

Before he built anything, he showed the team how he makes Claude talk to him. Tables, diagrams, specific wording, a format his brain reads fast. I laughed, because mine went the opposite way. Every rule I have written is about how the AI should sound when it writes as me. His is about how it should sound when it writes to him. Same tool, opposite direction, and both of them right.

Inspired by my review board, he built the epic checker. It keeps an epic's code and tickets aligned with its architecture plan, so he can stay on top of technical decisions while they are still moving.

Here is how it works. The architecture plan lives in Confluence, and it is the source of truth. A ticket, before any code exists, or a pull request, while it is still open, goes into the epic check. The check reads it against the plan and against every other open pull request. What comes out is new decisions, conflicts between pull requests, and ticket problems, each one a row someone owns. Those land on a decision board. The plan owner ticks decisions, drafts tickets and moves conflicts, and every decision goes back into the plan.

With that many people, alignment is the hard part, and his checker keeps everyone reading the same page. Two of its choices started as my advice, and I like that he kept them. Confluence is the source of truth, so decisions live where everyone already reads them, instead of inside a tool only one person opens. And the run logs are shared, so anyone can see what the checker did, when, and on whose run.

The checker does not decide anything. It puts the decision in front of the person who owns it, with a recommendation and three buttons, and a person picks one. That is the rule I hold the whole team to. The tool is allowed to type, and someone with their name on it signs.

Next, what came back to me from helping on it, and what the numbers say so far.

**Digest:** A wrong assumption is cheaper the earlier you catch it. The epic checker reads tickets and pull requests against the plan and puts each drift in front of its owner. It recommends; a person decides.

**Trial:** Take one open ticket and its plan or spec. Spend five minutes listing anything in the ticket the plan does not already decide.

**Runes:**
matts-rule | Move bugs as far to the left in the process as possible.
how-the-epic-checker-works | The checker does not decide anything.
who-built-it | Same tool, opposite direction, and both of them right.

## Stop 5: What came back, and what the board says

I helped him plan the epic checker, and then I did the most flattering thing a manager can do to a teammate's project. I started using it and sending commits. As a snapshot, the history has about 81 commits from him and 14 from me. Mine are mostly plumbing. A daily refresh for every epic on the index, a run log and stats view on the board, workday-only scheduling, and the hook that lets my review kit fold the epic check's decided deviations into its verdict.

That last one is the part I would point at first. A tool built for one tech lead's epics ended up improving a reviewer that runs on every pull request the team opens. My reviews now know which deviations from an epic were decided on purpose, so a deliberate change no longer gets flagged like a mistake. I did not plan that, and I like it a lot.

My review kit has been down this road already, and three of its lessons carry straight over. I have been passing them on.

The first is to keep score. My reviewer only got good once every comment it left was graded by what happened next. Fixed, answered, closed without a change, or ignored. A flag on the epic board can be graded the same way. A decision that got accepted, changed or rejected is a result. A flag nobody ever touched is a result too, just a less flattering one.

The second is to read the scores per topic, never as one average. My reviewer can be sharp on database changes and noisy on frontend speed, and the mean of those two looks fine. A checker can be right about conflicts between pull requests and wrong about what counts as a new decision. Only a split by kind of flag shows which.

The third is that a miss is worth more than a hit. When my reviewer lets something through, the fix to its lens is replayed on the exact commit it missed before the fix counts. For the epic checker, a miss is a decision that surfaced in review or testing instead of on the ticket. Every one of those is a test the next run should pass.

None of that replaces the person with the buttons. It only tells them, with a record rather than a feeling, how much the flags are worth reading.

So what does the board say? Everything the checker produces lands in Confluence and Jira, so it is easy to count. As a snapshot on November 10, about ten days after the space was set up, it was reading against 16 architecture plans. It had opened about 19 conflict pages and 7 were already closed. It had drafted 48 follow-up tickets, and 28 of those were done.

Those numbers do not say whether a flag was right. A closed conflict can mean two pull requests merged cleanly, or that someone decided it was not a conflict at all, and the board does not grade that yet. That is the first lesson, waiting to be applied.

And the honest limits. It is a few weeks old. I do not know yet whether it still gets opened in three months, or whether leads on other teams will trust its flags enough to act without double-checking. The cheaper-to-the-left curve is a well-worn rule, but I have no number of my own yet for bugs it caught early. What I can say is smaller. When the checker flags a drift, it flags it on the ticket or the open pull request, in front of the person who owns the decision, which is exactly where our CTO said it belongs.

That is the end of this lesson. Next, take a look at your own review loop and ask what it is keeping score of.

**Digest:** Helping on a teammate's tool made my own reviewer smarter. Three lessons carry over: keep score, split by topic, and treat a miss as a test. The early counts are real, but they do not yet say whether a flag was right.

**Trial:** Look at the last five flags or review comments your team left. Mark each as fixed, answered, closed without change, or ignored.

**Runes:**
what-came-back-to-me | I did not plan that, and I like it a lot.
what-the-board-says-so-far | These numbers do not say whether a flag was right.
what-i-have-not-earned-yet | It is a few weeks old.
