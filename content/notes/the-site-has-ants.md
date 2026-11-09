---
title: "My portfolio has ants now, and they eat the copy"
subtitle: "A small, self-growing ant colony hidden on a professional site. It has rules, rival colonies, and no win screen, because it is a simulation more than a game."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-11-07
updated: 2026-11-09
readingTime: "~16 min"
tags: [games, interactive, vanilla, simulation, grain, ai]
summary: >
  My portfolio has ants now. They read the page, take real letters home, feed a queen, build more
  mounds, and meet a rival colony that grows on its own rules. It is one plain JavaScript file on the
  same vanilla stack as the site, built over a weekend as a small, serious easter egg and a test of
  the workflow behind it.
image: /media/notes/nest-og.png
imageAlt: "TJ's Desk home page with an ant colony at work: an anthill drawn in Braille dots, scent trails running down to the page copy with letters missing, and the Nest panel in the sidebar."
socialImage: /media/notes/nest-social.png
socialImageAlt: "A cream social card with a Braille anthill, two dotted scent trails, two ants, and the words My portfolio has ants now."
social: |
  My portfolio has bugs now.

  Every portfolio has bugs. I gave mine a home, a queen, and a job stealing the copy.

  The colony is a small simulation: scouts find letters, lay scent trails, and workers carry the real
  glyphs home. The gaps stay put, so the paragraph you were reading goes missing one letter at a
  time. A rival colony grows from the same rules, spends the letters it takes, and builds its own
  mounds. There is no win screen. It just keeps going. Open it with the small ant in the status bar,
  the button in the note, or the word nest in the terminal.

  No canvas, no game library, no framework. One plain JavaScript file on the same vanilla stack as
  the rest of the site.
---

<p class="nest-start"><button type="button" data-nest-start>Play the colony</button></p>

I did not need to put ants on my portfolio. That was the point.

The site is where I show the serious work: the systems, the standards, the writing, the way I build. An ant colony is not serious. But I kept thinking about how much of the interesting part of software is behavior, the part you cannot see in a screenshot, and a portfolio that only shows finished surfaces felt a little flat.

So I hid a small living thing under the copy. You can ignore it forever. If you find it, it should feel like finding a door in a wall.

## Why I built this

I was inspired by [Swarm Protocol](https://domvirus.com/games/swarm-protocol/), a browser ant game by DOM VIRUS. I liked the way it made a colony feel like a system made of tiny local decisions. I looked at the [source](https://github.com/coded-dot-design/dom-virus), then I wondered what a much smaller version would feel like inside my own site.

The first version came together over a weekend. I used it as a reason to test DeepSeek and to test the loop I now use for most of my work: see something interesting, turn it into a small idea, give the idea enough constraints to become real, then let the AI do most of the typing while I keep the judgment, the reviewing and the taste. The interesting part for me was not whether an AI could draw an ant. It was whether the whole loop could carry an idea from a link in a browser tab to a tested thing on the site without turning into a second job.

The portfolio needed to stay serious. So the game had to be quiet. It lives behind the ant in the status bar, a button on this note, and one terminal word. Most people will never see it. The people who do should get a small surprise, not a pop-up asking them to subscribe.

I also wanted to show what the framework can do. The site is built on GRAIN, a system that mostly renders documents. A game is a useful stress test: if the same tokens, the same typography and the same one-file discipline can carry an interactive colony, then the framework is doing more than laying out text. And if it cannot, I would rather find out by building something fun.

## What it is

A self-growing ecosystem built from rules.

There is no single script that says "now the colony does this." Each ant has a small amount of state and follows a small rule. A scout looks for a letter. A worker follows a trail. A letter that needs two or three ants takes two or three. The queen turns meals into eggs. The stores turn food into a builder. The builder raises a mini mound. The mini mound sends guards to patrol and flyers to steal. The rival does the same thing, with its own resource and its own limits.

<p class="nest-start"><a href="#" data-nest-start>Open the colony</a> while you read. It runs on this page.</p>



The loop is the whole design. Letters are food and building material. Ants are the machinery that moves both. There is no final level and no score to beat. The colony can grow, the rival can grow, the page can run out of letters, and the system still has something to do. At some point the page is simply a quieter place with gaps in it.

## How the colony works

The first scouts leave the hill and look for letters near home first. A scout takes one letter back to the entrance, and that walk becomes a trail. The trail is the memory. Workers do not need to know where the letter came from; they follow the scent and carry the next one.

The letters are real. A letter taken from this page is the actual glyph, in its actual font and color, lifted out of its sentence. The space it leaves stays exactly where it was, so the paragraph never reflows. The reading gets worse one character at a time, which is a much quieter kind of damage than a banner.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="theft" data-surface="figure:nest-theft">
</div>

*A scout finds letters; workers carry them home and the stores rise.*

A heavy heading needs a crew. A small letter can be carried by one ant. A larger one takes two or three, and the trail waits until the crew is full. When the letter reaches the nest, its portions are split between the queen and the stores. The queen turns meals into eggs. The stores turn enough food into a builder, and the builder raises a mini mound somewhere else on the page. The mini mound gets its own guards and flyers, and the flyers ignore trails entirely and pinch letters from anywhere.

## Inside the nest

The mound is the only part you see from the outside. Under it, the colony is a small set of rooms and tunnels: the queen's chamber at the bottom, the nursery where eggs wait, the larder where stolen letters are held, and the two stores where meals are counted.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="colony" data-surface="figure:nest-colony">
</div>

*Workers feed the stores, then a builder raises a new mini mound.*

In the nest, the queen's chamber is the room at the bottom, the nursery holds the eggs, the larder holds stolen letters, and the two stores hold meals. The tunnel is the thin route between them, and the crown is the entrance.

The queen never leaves the chamber except for worship. The nursery fills with eggs, the larder with letters, and the stores with the meals those letters become. A worker carrying a letter home is not a delivery to a generic nest; it is feeding a room.

## Why the colony stops to worship

Worship is the one moment the whole colony shares a direction. The rules pause, the trails go quiet, and every ant turns toward the queen. It is also the economy's reset: the stores fill, which pays for the soldiers and builders that keep the colony alive after the pause.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="worship" data-surface="figure:nest-worship">
</div>

*The queen leaves the mound; the colony gathers, circles, and returns with full stores.*

The first dance comes at twenty letters, then fifty, then ninety. The queen climbs out of the panel, walks to a clear patch and dances. Every ant on the page comes toward her, the trails go quiet, and the workers stop carrying. The queen crawls back down, shrinks into the entrance and only then does the panel queen return. The next threshold is fixed for the current dance and only moves after she is home, so hatching does not keep pushing the target away.

There is no win screen after the dance. Worship is the colony's own event, not the player's reward screen. It gives the simulation a pulse: a reason for the ants to gather, a reason for the stores to matter, and a moment where the queen is visibly the center of the nest. Then the trails reopen and the colony goes back to work.

## The rival is a second ecosystem, not a second player

The first rival appears after the second worship, not the first. It starts as a smaller colony with one trail, a few workers and a guard. Later rivals appear on later milestones, and each new one is a little harder than the last.

<p style="margin:0 0 .5rem"><a href="#" data-nest-start>Start the colony</a> if you want to watch a rival arrive.</p>

The rival is not a second player base. It does not take orders, it does not get a turn, and it cannot see the whole board. It runs the same kind of local rules the main colony runs: follow a trail, take a letter, carry it home, spend it on another ant. The difference is that its growth comes out of what it steals.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="rival" data-surface="figure:nest-rival">
</div>

*A rival builds and steals letters; the main colony drives it off.*

Its population stays one ant below the main colony. It can still grow trails, mini mounds and flyers, but it cannot outgrow the nest it is fighting. The first rival is meant to be an easy fight. Later rivals start with more workers and more mounds if the main colony is already large, because a grown colony should not get a free win against a fresh, tiny rival. The goal is a fight with a clear main-colony advantage, not a guaranteed walkover.

The rival prefers the left side when the main colony is on the right, and it keeps its distance. That is partly visual, so the two colonies do not sit on top of each other, and partly mechanical, so the rival has room to grow before the main trails reach it. Its mini mounds can be clicked down, and its guards react to the damage. A rival mound is not a one-ant job: at least three main ants have to be working it at once, and the mound shakes under the crew before it comes down. When the rival falls, its stolen letters are gone for good. There is no cache to clean up and no loot to collect. The reward is the celebration and a quieter page.

## Who wins a fight

Combat is deliberately small. The main colony gets the advantage, but not every fight is a formality.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="fight" data-surface="figure:nest-fight">
</div>

*Main ants and rival guards close on the trail, clash, lose health, and resolve.*

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="castes" data-surface="figure:nest-castes">
</div>

*Worker, soldier, flyer, queen, and rival guard move by role and appearance.*


The exact rules are simple enough to hold in your head. A main guard and a rival guard roll a duel, with the main guard winning sixty percent. Two rival guards do not roll that duel; they overwhelm one main guard. A main flyer has a seventy-five percent edge over a rival flyer. Workers are weak alone, but two of them can take a guard. Fights stay open for about a second, not a frame, so ants nearby can pile in and the winner is decided by the crowd that is actually there. The numbers are there to make the main colony feel like the home team without making the rival a decoration.

## You are the disturbance, not the colony

You do not command the ants. You disturb them.

The panel has Squash and Wipe, Bait and Seal. Squash flattens one ant. Wipe breaks a trail and sends its ants looking for another. Bait pulls nearby ants off their work. Seal closes a mound for a while. The tools lock the page links while they are active, so a missed click does not send you to another page. Links hands the page back. Restore asks first, then puts every hidden letter back, moves the main mound, keeps the ants and scrolls to the new hill. Speed, pause and mute are there because a simulation should be comfortable to leave running.

There is no game over screen. If the main colony loses every ant, the queen sends a scout, a soldier and workers back out. The nest can be hurt, but it cannot be permanently deleted. If the rival loses every ant, its mound falls and the page celebrates. If the page runs out of letters, the colony sends another scout and keeps looking. Closing the Nest puts every letter back. A refresh or a new page starts a fresh colony.

The absence of a win condition is the design, not a missing feature. A portfolio game that ends with YOU WIN is a different thing: it asks the visitor to stop reading and play until the game is over. This one asks them to leave it running while they read, or to poke at it for a minute and close it. The state is the interesting part. The score would only get in the way.

## How it is built

The game is one plain JavaScript file. No canvas, no game library, no build step for the game itself.

The nest is a grid of Braille characters, each cell eight dots, colored by the active GRAIN theme. The ants are tiny inline SVGs made of round dots, with two leg frames. The scent trails are one soft curve with a small walk in it, so a trail looks walked rather than sampled. The sounds are synthesized in the same file: a few oscillators and one noise buffer, no audio files. The whole thing is lazy loaded: the note is a page first, and the game is only requested when someone opens the launcher.

The important constraint is that the page stays a page. The ants take real glyphs from real text nodes. The gaps keep the layout. The panel is a normal part of the sidebar, not an overlay that steals the screen. The game has to be able to disappear without a trace when it closes.

The rules are in the code, but they are not a scripted sequence. There is a trail system, a letter economy, a queen, stores, mounds, guards, flyers, a rival with a resource budget and a population cap. The behavior comes from those parts interacting. That is why the same game can feel calm on one page and busy on another, and why it can keep running after the page has been read.

## Why the workflow matters

I could not have justified this as a serious side project if it took a month. It took a weekend because the loop around it is good enough to carry a small idea quickly: a rough direction, a lot of AI typing, a browser to play it in, tests around the parts that matter, and a review pass that catches the things I would have missed at 2 a.m.

That is the real advertisement. Not that an AI can write a game. That I can see something interesting, turn it into a small idea, and have a tested thing on my site before the interest goes away. The AI does a lot of the work. I keep the decisions, the standards and the final read. This note is part of the same loop: the game exists, the tests exist, and the writing is the explanation.

I also wanted the portfolio to stay professional. The easter egg is small on purpose. It is behind a status-bar ant, a terminal word and a button in a note. It does not interrupt a recruiter reading the résumé, and it does not turn the home page into a game landing page. If you find it, you get a surprise. If you do not, the site is still the site.

<p class="nest-start"><a href="#" data-nest-start>Open the colony</a> and leave it running for a minute. The page is the food.</p>

## What I have not earned yet

The game has been played by me, a preview browser, and a browser suite. That is still a small audience. Balance is an opinion: the population caps, the cost of a mound, the sixty and seventy-five percent duels, the point where the rival goes to war. The tests cover the rules I can state, not the feeling of a long session on a slow laptop.

On a phone it needs a different kind of care. Squashing an ant with a thumb on a narrow column is not the same game, and the launcher hides on small screens, so the stray ant has nowhere to lead. That version is not built.

The honest position is that this is a finished small simulation. It is not a finished piece of game design. The rules hold. The economy runs. The rival can surprise me. The next round is less about adding systems and more about watching the existing ones for a long time.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
