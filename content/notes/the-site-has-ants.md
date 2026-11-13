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
readingTime: "~9 min"
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
  mounds. There is no win screen. It just keeps going. Open it with the small ant in the status bar, the
  word nest in the terminal, or the play button in this note, where the ants walk around the live
  figures instead of through them.

  No canvas, no game library, no framework. A few plain JavaScript modules on the same vanilla stack as
  the rest of the site.
---

<p class="nest-start" hidden><a href="/?nest=play" data-nest-start>Play the colony</a></p>

I did not need to put ants on my portfolio. That was the point.

The site is where I show the serious work: the systems, the standards, the writing, the way I build. An ant colony is not serious. But I kept thinking about how much of the interesting part of software is behavior, the part you cannot see in a screenshot, and a portfolio that only shows finished surfaces felt a little flat.

So I hid a small living thing under the copy. You can ignore it forever. If you find it, it should feel like finding a door in a wall.

The door is an ant. On a desktop, every few minutes of reading, one wanders across the page. Click it and it bolts for the small ant button at the bottom of the screen, which wakes the whole colony. The play button on this page wakes it right here. The figures below turn into walls the ants walk around, and they freeze while the colony runs so the real thing gets the whole machine.

## Where it came from

I blame [Swarm Protocol](https://domvirus.com/games/swarm-protocol/), a browser ant game by DOM VIRUS that makes a colony feel like a thousand tiny local decisions. I read the [source](https://github.com/coded-dot-design/dom-virus) and wondered what a much smaller version would do if you let it loose inside a real website.

It also made a good stress test. The site runs on GRAIN, a system that mostly renders documents. If the same tokens, type and small modules can carry a living colony, the framework is doing more than laying out text. If they cannot, I would rather find out by building something fun.

## The page is the food

Nobody tells the colony what to do. Each ant carries a tiny bit of state and one small rule. Scouts look for letters. Workers follow trails. The queen turns meals into eggs, full stores turn into builders, and builders raise new mounds. Everything you see is those rules bumping into each other.

A scout finds a letter near home and carries it back, and that walk becomes a scent trail. Workers do not need to know where the food is. They follow the smell and fetch the next one.

The letters are real. Each one is the actual glyph, in its actual font and color, lifted out of its sentence. The gap it leaves stays put, so the paragraph never reflows. It just gets harder to read, one character at a time. It is the quietest kind of vandalism I could think of.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="theft" data-surface="figure:nest-theft">
</div>

*A scout finds letters; workers carry them home and the stores rise.*

Body text is a snack for one ant. A big heading letter needs a crew of two or three, and the trail waits until everyone has arrived to lift it. Back home, the food is split between the queen and the stores. When the stores fill up, a builder heads out and raises a mini mound somewhere else on the page, and that mound sends out guards to patrol and flyers to steal.

## Inside the nest

The main mound is the front door to a real nest underneath: tunnels, a queen's chamber, a nursery, a larder and the stores. The mini mounds are outposts with no basement.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="colony" data-surface="figure:nest-rooms">
</div>

*Workers feed the stores, then a builder raises a new mini mound.*

Workers haul letters down to the larder, turn them into meals, and carry those to the queen. She never leaves her chamber, except for one thing.

<div class="live-fig live-fig--nest live-fig--colony" data-live-figure="colony" data-surface="figure:nest-colony-loop" role="img" aria-label="Inside the colony: ants carry food through the nest to the queen, stores and nursery."></div>

*Inside the nest, workers feed the queen, fill the stores and tend the nursery.*

## Why the colony stops to worship

At twenty stolen letters, then fifty, then ninety, the queen climbs out of the nest, walks to a clear patch of page and dances. Every trail goes quiet. Her colony gathers in a ring around her, and the rival, wisely, hides in its mound.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="worship" data-surface="figure:nest-worship">
</div>

*The queen leaves the mound; the colony gathers, circles, and returns with full stores.*

It is not a win screen. It is the colony's heartbeat: the stores fill, which pays for the soldiers and builders that come next, and then the trails reopen and everyone goes back to work.

## Then the neighbours move in

After the second dance, a rival colony shows up. Nobody controls it, including me. It runs the same small rules as the home colony: find a letter, carry it home, spend it on another ant. It just happens to be eating the same page.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="rival" data-surface="figure:nest-rival">
</div>

*The main colony forages while the rival mound takes shape. Once the mound is ready, rival workers follow the red trail and carry letters home while a guard patrols.*

The rival settles on the far side of the page and starts at a little over half your size, so it is a real fight and not a decoration. It raises its own mounds and flyers. Two ants working together can tear down an enemy mound, which shakes under the crew before it falls, and the rival will happily do the same to any of your outposts left without guards. When a rival falls, the letters it stole are gone for good. Beat one and, a few dances later, another one arrives.

## Who wins a fight

Your colony is the home team, but not by much.

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="fight" data-surface="figure:nest-fight">
</div>

*Four encounters repeat in turn. The guard and flyer duels roll for a winner each time. In the other two, the ants close enough to join the fight can overpower a lone defender.*

<div class="live-fig live-fig--nest" data-live-figure="nest" data-nest-mode="castes" data-surface="figure:nest-castes">
</div>

*From left to right, a worker, a soldier, a flyer, the queen and a red rival guard.*


Your guards win most one-on-ones, but two rival guards will overwhelm one of yours. A lone worker is lunch, while two workers can take down a guard. Every fight stays open for about a second, so whoever is nearby piles in, and numbers usually decide it.

## You are the disturbance, not the colony

You do not command the ants. You disturb them.

Try this: wait for a dotted trail, pick Wipe, and drag across it. Then watch a dozen ants stop, mill about, and slowly work out a new route home.

- **Squash** flattens one ant.
- **Wipe** breaks a trail and sends its ants looking for another.
- **Bait** pulls nearby ants away from their work.
- **Seal** closes a mound for a while.
- **Links** hands the page back. While the other tools are active, page links are locked so a missed click does not send you somewhere else.
- **Restore** asks first, then returns every hidden letter, moves the main mound, keeps the ants and scrolls to the new hill.

Speed, pause and mute are there because a simulation should be comfortable to leave running.

There is no game over. Squash every ant and the queen quietly sends out a fresh scout, a soldier and a few workers. And if the colony eats the entire page, it throws a party that never ends: the queen keeps dancing, and every hill gets a dancer on top.

There is no win screen either, and that is on purpose. A portfolio game that ends in YOU WIN asks you to stop reading and grind. This one asks for a minute of watching. When you close the Nest, the page reloads and every letter comes home.

## How it is built

The game is a few plain JavaScript modules. No canvas, no game library, no build step for the game itself.

The visible pieces are small and shared:

- The nest is a grid of Braille characters, each cell eight dots, colored by the active GRAIN theme.
- The ants are tiny inline SVGs made of round dots, with two leg frames.
- The scent trails are soft, broken curves with a small walk in them, so they look walked rather than sampled.
- The sounds are synthesized from a few oscillators and one noise buffer. There are no audio files.

None of it loads until someone opens the colony or a stray ant is due. And the one hard rule is that the page stays a page: real glyphs from real text, gaps that hold the layout, a panel that sits in the sidebar instead of over your screen, and nothing left behind when it closes.

## A weekend, not a month

I could not have justified a month on ants. It took a weekend, and it doubled as a test of the loop I now use for most of my work: spot something interesting, give it enough constraints to be real, let the AI do most of the typing, and keep the judgment, the review and the taste for myself. I moved between DeepSeek, Codex and Claude as the colony grew, and the loop held. There is more on that in [The Loop Outlives the Model](one-loop-three-harnesses.md).

That is the real advertisement. Not that an AI can write a game, but that I can see something interesting and have a tested thing on my site before the interest wears off.

It also stays out of the way. A recruiter reading the résumé will never trip over it. If you find it, you get a surprise. If you do not, the site is still the site.

<p class="nest-start" hidden><a href="/?nest=play" data-nest-start>Open the full colony</a></p>

Leave it running for a minute. The page is the food.

## What I have not earned yet

The game has been played by me, a preview browser, and a browser suite. That is still a small audience. Balance is an opinion: the population caps, the cost of a mound, the sixty and seventy-five percent duels, the point where the rival goes to war. The tests cover the rules I can state, not the feeling of a long session on a slow laptop.

A phone needs a different kind of care. On a narrow column, a thumb covers the ant and the copy around it. For now the playable colony and the stray ant stay on desktop.

The honest position is that this is a finished small simulation. It is not a finished piece of game design. The rules hold. The economy runs. The rival can surprise me. The next round is less about adding systems and more about watching the existing ones for a long time.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
