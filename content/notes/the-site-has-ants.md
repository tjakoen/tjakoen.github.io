---
title: "I put bugs on my website. On purpose."
audience: [build]
level: intro
subtitle: "A small, self-growing ant colony hidden on a professional site. It has rules, rival colonies, and no win screen, because it is a simulation more than a game."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-11-07
updated: 2026-11-12
readingTime: "~16 min"
tags: [web-platform, stack]
summary: >
  My portfolio has ants now. They read the page, take real letters home, feed a queen, build more
  mounds, and meet a rival colony that grows on its own rules. It is a handful of plain JavaScript
  modules on the same vanilla stack as the site, built over a weekend as a small, serious easter egg and a test of
  the workflow behind it.
image: /media/notes/nest-og.png
imageAlt: "Three ants carry the missing D from the TJ's Desk heading over the remaining letters and up a dotted trail to a Braille mound. I lead engineering teams, build multi-model AI workflows, and mentor software developers. I put bugs on my website. On purpose. portfolio.tjakoen.com."
socialImage: /media/notes/nest-social.png
socialImageAlt: "Three ants carry the missing D from the TJ's Desk heading over the remaining letters and up a dotted trail to a Braille mound. I lead engineering teams, build multi-model AI workflows, and mentor software developers. I put bugs on my website. On purpose. portfolio.tjakoen.com."
social: |
  My portfolio has bugs now.

  Every portfolio has bugs. I gave mine a home, a queen, and a job stealing the copy.

  The colony is a small simulation: scouts find letters, lay scent trails, and workers carry the real
  glyphs home. The gaps stay put, so the paragraph you were reading goes missing one letter at a
  time. A rival colony grows from the same rules, spends the letters it takes, and builds its own
  mounds. There is no win screen. It just keeps going. On any other page, open it with the small ant
  in the status bar or the word nest in the terminal. The play button in this note opens the full
  game on the home page, clear of the live figures.

  No canvas, no game library, no framework. A few plain JavaScript modules on the same vanilla stack as
  the rest of the site.
---

<p class="nest-start" hidden><a href="/?nest=play" data-nest-start>Play the colony</a></p>

I did not need to put ants on my portfolio. That was the point.

The site is where I show the serious work: the systems, the standards, the writing, the way I build. An ant colony is not serious. But I kept thinking about how much of the interesting part of software is behavior, the part you cannot see in a screenshot, and a portfolio that only shows finished surfaces felt a little flat.

So I hid a small living thing under the copy. You can ignore it forever. If you find it, it should feel like finding a door in a wall.

The door is an ant. On a desktop, every so often, one wanders across whatever page you're reading. Click it and it runs for the small ant button at the bottom of the screen. That button starts the colony on the page you're on.

It's rare on purpose. The first ant turns up after two to four minutes of reading, counted across the pages you visit, and the next one can take ten to twenty. It works on every page except this one. The figures below need this page for themselves, so no stray ant crosses it, and the button here sends you to the home page instead.

## Why I built this

I was inspired by [Swarm Protocol](https://domvirus.com/games/swarm-protocol/), a browser ant game by DOM VIRUS. I liked the way it made a colony feel like a system made of tiny local decisions. I looked at the [source](https://github.com/coded-dot-design/dom-virus), then I wondered what a much smaller version would feel like inside my own site.

The first version came together over a weekend. I used it as a reason to try DeepSeek and to test the loop I now use for most of my work: notice something interesting, turn it into a small project, give it enough constraints to make it real, then let the AI do most of the typing while I keep the judgment, review and taste. I moved between DeepSeek, Codex and Claude as the colony grew, but the loop stayed the same. I wrote more about that in [The Loop Outlives the Model](one-loop-three-harnesses.md). This portfolio is a small proof of concept for the loop too: the standards and checks that guide the AI are part of the site it helps build. The test was whether an idea from a browser link could become something working on the site without the process turning into a second job.

Most people will never see the colony. I wanted the people who find it to spend a minute watching a scout steal the copy, then get their page back when they close the Nest.

I also wanted to show what the framework can do. The site is built on GRAIN, a system that mostly renders documents. A game is a useful stress test: if the same tokens, the same typography and the same small-module discipline can carry an interactive colony, then the framework is doing more than laying out text. And if it cannot, I would rather find out by building something fun.

## What it is

A self-growing ecosystem built from rules.

There is no single script that says "now the colony does this." Each ant has a small amount of state and follows a small rule. A scout looks for a letter. A worker follows a trail. A letter that needs two or three ants takes two or three. The queen turns meals into eggs. The stores turn food into a builder. The builder raises a mini mound. The mini mound sends guards to patrol and flyers to steal. The rival does the same thing, with its own resource and its own limits.

The boxes in this note start each event with its own setup and replay it. Their ants use the same sprites and rules for walking, carrying and fighting as the full colony. Open the full colony to see how those events happen on their own.


The loop is the whole design. Letters are food and building material. Ants are the machinery that moves both. There is no final level and no score to chase. The colony can grow, the rival can grow, and the page can run out of letters. When it does, the colony keeps the emptied page as a permanent celebration instead of showing a win screen.

## How the colony works

The first scouts leave the hill and look for letters near home first. A scout takes one letter back to the entrance, and that walk becomes a trail. The trail is the memory. Workers do not need to know where the letter came from; they follow the scent and carry the next one.

The letters are real. A letter taken from this page is the actual glyph, in its actual font and color, lifted out of its sentence. The space it leaves stays exactly where it was, so the paragraph never reflows. The reading gets worse one character at a time, which is a much quieter kind of damage than a banner.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="theft" data-surface="figure:nest-theft">
</div>

*A scout finds letters; workers carry them home and the stores rise.*

A heavy heading needs a crew. A small letter can be carried by one ant. A larger one takes two or three, and the trail waits until the crew is full. When the letter reaches the nest, its portions are split between the queen and the stores. The queen turns meals into eggs. Full stores send a builder to raise a mini mound elsewhere on the page. If the colony is at its population cap, a worker takes the job. A mini mound stays above ground and spawns guards to patrol and flyers to steal letters. The rival does the same thing, with its own resource and limits.

## Inside the nest

The main mound marks the entrance to the colony's underground nest. Tunnels connect the queen's chamber, nursery, larder and stores. Mini mounds are different: they stay above ground and spawn soldiers and flyers; they do not have tunnels.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="colony" data-surface="figure:nest-rooms">
</div>

*Workers feed the stores, then a builder raises a new mini mound.*

The queen's chamber sits at the bottom, beside rooms for the nursery, larder and stores. The queen leaves only for worship. Inside the main nest, workers carry letters to the larder, turn them into meals, then feed the queen and stores.

<div class="live-fig live-fig--nest live-fig--colony" data-live-figure="colony" data-surface="figure:nest-colony-loop" role="img" aria-label="Inside the colony: ants carry food through the nest to the queen, stores and nursery."></div>

*Inside the nest, workers feed the queen, fill the stores and tend the nursery.*

## Why the colony stops to worship

Worship is the one moment the whole colony shares a direction. The trails go quiet as the colony gathers and the rival heads for its own mound. It is also the economy's reset: the stores fill, which pays for the soldiers and builders that keep the colony alive after the pause.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="worship" data-surface="figure:nest-worship">
</div>

*The queen leaves the mound; the colony gathers, circles, and returns with full stores.*

The first dance comes at twenty letters, then fifty, then ninety:

1. The queen climbs out of the panel and walks to a clear patch.
2. Ants from her colony gather around her while the rival shelters in its mound.
3. The queen dances, then returns through the entrance. The panel queen comes back only after she is home.

The next threshold is fixed for the current dance and moves only after the queen returns. Hatching cannot keep pushing the target away.

There is no win screen after the dance. Worship is the colony's own event, not the player's reward screen. It gives the simulation a pulse: a reason for the ants to gather, a reason for the stores to matter, and a moment where the queen is visibly the center of the nest. Then the trails reopen and the colony goes back to work.

## The rival is a second ecosystem, not a second player

The first rival appears after the second worship, not the first. It starts as a smaller colony with one trail, a few workers and a guard. A new rival comes at worships three, four and five if the last one was beaten. After the fifth, the page sends another rival every fifth worship: ten, fifteen, twenty. If a rival survives one or more of those dances, one new colony arrives after it falls.

The rival is not a second player base. It does not take orders, it does not get a turn, and it cannot see the whole board. It runs the same kind of local rules the main colony runs: follow a trail, take a letter, carry it home, spend it on another ant. The difference is that its growth comes out of what it steals.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="rival" data-surface="figure:nest-rival">
</div>

*The main colony forages while the rival mound takes shape. Once the mound is ready, rival workers follow the red trail and carry letters home while a guard patrols.*

Builders walk to a site before the mound takes shape. Workers and guards leave the entrance one at a time. Its population starts at a little over half the main colony, not one ant below it, and that share grows slowly with each new rival. It can still raise trails, mini mounds and flyers, but it cannot outgrow the nest it is fighting. The first rival is a real fight. Later rivals start from the live main colony, because a grown colony should not get a free win against a fresh, tiny rival. The goal is a clear main-colony advantage, not a guaranteed walkover.

The rival prefers the left side when the main colony is on the right, and it keeps its distance. That is partly visual, so the two colonies do not sit on top of each other, and partly mechanical, so the rival has room to grow before the main trails reach it. Its mini mounds can be clicked down, and its guards react to the damage. A rival mound is not a one-ant job: two main ants can work it together, and the mound shakes under the crew before it comes down. The rival can break a main mini hill the same way, so a mound left without guards does not last. When the rival falls, its stolen letters are gone for good. There is no cache to clean up and no loot to collect. The reward is the celebration and a quieter page.

## Who wins a fight

Combat is deliberately small. The main colony gets the advantage, but not every fight is a formality.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="fight" data-surface="figure:nest-fight">
</div>

*Four encounters repeat in turn. The guard and flyer duels roll for a winner each time. In the other two, the ants close enough to join the fight can overpower a lone defender.*

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="castes" data-surface="figure:nest-castes">
</div>

*From left to right, a worker, a soldier, a flyer, the queen and a red rival guard.*


The rules are simple enough to hold in your head:

- A main guard wins sixty percent of duels against a rival guard.
- Two rival guards can overwhelm one main guard.
- A main flyer wins seventy-five percent of duels against a rival flyer.
- Workers are weak alone, but two can take a guard together.

Group fights stay open for about a second, so nearby ants can pile in. The game counts the ants still close enough when the fight ends. The numbers make the main colony feel like the home team without turning the rival into a decoration.

## You are the disturbance, not the colony

You do not command the ants. You disturb them.

Wait for a dotted trail to appear, select Wipe, then drag across the trail. The ants leave that trail and look for another route. Watch what happens to the delivery you interrupted.

- **Squash** flattens one ant.
- **Wipe** breaks a trail and sends its ants looking for another.
- **Bait** pulls nearby ants away from their work.
- **Seal** closes a mound for a while.
- **Links** hands the page back. While the other tools are active, page links are locked so a missed click does not send you somewhere else.
- **Restore** asks first, then returns every hidden letter, moves the main mound, keeps the ants and scrolls to the new hill.

Speed, pause and mute are there because a simulation should be comfortable to leave running.

There is no game over screen. If the main colony loses every ant, the queen sends a scout, a soldier and workers back out, even when a mini hill is still standing. The nest can be hurt, but it cannot be permanently deleted. If the rival loses every ant, its mound sends another one out; the colony is beaten only when the mound itself is broken. A trail that no ant has walked for a while fades, so an old path does not sit on the page forever. If the page runs out of letters, the colony stays in a permanent celebration: the queen keeps her circle, some ants wander the page, and every hill keeps a dancer on top.

Closing the Nest refreshes the page, so every letter is restored from its source rather than from a pile of patched text. A new page starts a fresh colony.

The absence of a win condition is the design, not a missing feature. A portfolio game that ends with YOU WIN is a different thing: it asks the visitor to stop reading and play until the game is over. Here you can watch a delivery, interrupt one, then close the Nest and get your sentence back. The state is the interesting part. The score would only get in the way.

## How it is built

The game is a few plain JavaScript modules. No canvas, no game library, no build step for the game itself.

The visible pieces are small and shared:

- The nest is a grid of Braille characters, each cell eight dots, colored by the active GRAIN theme.
- The ants are tiny inline SVGs made of round dots, with two leg frames.
- The scent trails are soft, broken curves with a small walk in them, so they look walked rather than sampled.
- The sounds are synthesized from a few oscillators and one noise buffer. There are no audio files.

The game is lazy loaded. The browser fetches it when someone opens the colony or a stray ant is due to cross the page.

The important constraint is that the page stays a page. The ants take real glyphs from real text nodes. The gaps keep the layout. The panel is a normal part of the sidebar, not an overlay that steals the screen. The game has to be able to disappear without a trace when it closes.

The rules are in the code, but they are not a scripted sequence. There is a trail system, a letter economy, a queen, stores, mounds, guards, flyers, a rival with a resource budget and a population cap. The behavior comes from those parts interacting. That is why the same game can feel calm on one page and busy on another, and why it can keep running after the page has been read.

## Why the workflow matters

I could not have justified this as a serious side project if it took a month. It took a weekend because the loop around it is good enough to carry a small idea quickly: a rough direction, a lot of AI typing, a browser to play it in, tests around the parts that matter, and a review pass that catches the things I would have missed at 2 a.m.

That is the real advertisement. Not that an AI can write a game. That I can see something interesting, turn it into a small idea, and have a tested thing on my site before the interest goes away. The AI does a lot of the work. I keep the decisions, the standards and the final read. This note is part of the same loop: the game exists, the tests exist, and the writing is the explanation.

I also wanted the portfolio to stay professional. The easter egg is small on purpose. It is behind a status-bar ant, a terminal word and a button in a note. It does not interrupt a recruiter reading the résumé, and it does not turn the home page into a game landing page. If you find it, you get a surprise. If you do not, the site is still the site.

The lone ant from the top of this note is the fourth way in, and the only one that comes looking for you. It will not find you here, so the button below opens the colony on the home page.

<p class="nest-start" hidden><a href="/?nest=play" data-nest-start>Open the full colony</a></p>

On desktop, click the ant icon at the bottom of the status bar to open the colony from any other page. The playable colony is desktop-only. The figures in this note also run on phones. Leave it running for a minute. The page is the food.

## What I have not earned yet

The game has been played by me, a preview browser, and a browser suite. That is still a small audience. Balance is an opinion: the population caps, the cost of a mound, the sixty and seventy-five percent duels, the point where the rival goes to war. The tests cover the rules I can state, not the feeling of a long session on a slow laptop.

A phone needs a different kind of care. On a narrow column, a thumb covers the ant and the copy around it. For now the playable colony and the stray ant stay on desktop.

The honest position is that this is a finished small simulation. It is not a finished piece of game design. The rules hold. The economy runs. The rival can surprise me. The next round is less about adding systems and more about watching the existing ones for a long time.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
