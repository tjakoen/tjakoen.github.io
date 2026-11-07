---
title: "My portfolio has ants now, and they eat the copy"
subtitle: "A small game on a professional site, built with no canvas and no framework, where the enemy steals the very letters you came to read."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-11-07
updated: 2026-11-08
readingTime: "~7 min"
tags: [games, interactive, vanilla, grain, claude]
summary: >
  My portfolio has bugs now. I gave them a home, and the ants eat the copy. The ant in the status
  bar opens the colony; type nest in the terminal if you prefer the word. Scouts find letters, lay
  scent trails, and workers carry the real glyphs home to a queen drawn in Braille dots. It is a
  small game built on the same vanilla stack as everything else here, to show that the stack can do
  play as well as documents, and it took more tuning of ant traffic than of anything that looks
  like game design.
image: /media/notes/nest-og.png
imageAlt: "TJ's Desk home page with an ant colony at work: an anthill drawn in Braille dots, scent trails running down to the page copy with letters missing, and the Nest panel in the sidebar."
social: |
  My portfolio has bugs now.

  Every portfolio has bugs. I gave mine a home, a queen, and a job stealing the copy.

  Click the ant in the status bar, or type nest in the terminal, to find the colony. Scouts find
  letters, lay scent trails, and workers carry the real glyphs home to a queen drawn in Braille
  dots. The gaps they leave stay put, so you watch the paragraph you were reading go missing one
  letter at a time.

  No canvas, no game library, no framework. One plain JavaScript file on the same vanilla stack as
  the rest of the site, colored by the theme's own tokens.

  The ant is the door. The word is the shortcut. The copy is the food.
---

I had no game on my portfolio. For someone who keeps telling students the interesting part of software is the behavior, that was a little embarrassing. So I gave the bugs a home. This site now has ants.

The ant is already in the status bar. Click it, or open the terminal at the bottom of the page, type *nest*, and press Enter. The terminal command does the same thing. If you want to see it listed, type *help* first: *nest* sits next to *reveal the ant colony*.

Click the ant, and an anthill turns up in an empty patch of whatever page you are on, and the colony goes to work on the copy.

> The enemy in this game wants the sentence you were halfway through reading.

![The Nest open on a note: an anthill in the top corner, a dotted scent trail down to the subtitle, an ant carrying a letter, gaps where letters were taken, and the colony panel in the sidebar.](/media/notes/nest-trails.jpg)

## What the ants actually do

Three scouts leave the hill first. The first takes the nearest letter; the next two take the options farthest from the ones already chosen, so the opening spreads across the page. Later scouts stay off a block that already has a trail or a scout on the way. Each one wanders to a letter, picks it up, and walks it home. The letter it takes is the real glyph, in its real font, color and underline, and the space it leaves stays exactly where it was, so the paragraph never reflows. You just watch it get gappier.

A scout that makes it home lays a scent trail. Workers follow trails five to a line, filled in turn so no trail starves, and a heading in a big font needs a crew of two or three to lift. A trail fades when its patch is empty or after ninety seconds, and a worker turns scout to find the next one. Once the colony passes eight, soldiers hatch: bigger, quieter in color than a worker, and worth two hits.

Every other letter feeds the queen in the sidebar, who lays eggs. The rest goes into two storerooms, and when they fill up a builder ant walks out and raises a mini hill somewhere else on the page, sometimes below the fold. Its mound thins as it takes hits. Guards walk out to an existing trail and patrol it, and flyers ignore trails entirely and pinch letters from anywhere. A colony that has taken twenty letters stops to dance, then fifty, then a rising count: the queen comes out of the hill, the workers circle her, and then they go back to work.

<svg viewBox="0 0 480 236" width="100%" role="img"
     aria-label="The colony loop: scouts find a letter and lay a trail; workers follow the trail and carry letters home; half the letters feed the queen, who lays more ants; the other half fill the stores, and full stores send a builder to raise a mini hill, which sends guards to the trails and flyers to steal letters anywhere."
     style="display:block;width:100%;max-width:480px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-nest0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="16" y="16" width="130" height="36" rx="6"/>
    <rect x="175" y="16" width="130" height="36" rx="6"/>
    <rect x="334" y="16" width="130" height="36" rx="6"/>
    <rect x="80" y="110" width="130" height="36" rx="6"/>
    <rect x="270" y="110" width="130" height="36" rx="6"/>
    <rect x="270" y="184" width="194" height="36" rx="6"/>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="146" y1="34" x2="173" y2="34" marker-end="url(#fl-nest0)"/>
    <line x1="305" y1="34" x2="332" y2="34" marker-end="url(#fl-nest0)"/>
    <line x1="370" y1="52" x2="175" y2="108" marker-end="url(#fl-nest0)"/>
    <line x1="400" y1="52" x2="345" y2="108" marker-end="url(#fl-nest0)"/>
    <path d="M80,128 C30,128 30,70 70,54" marker-end="url(#fl-nest0)" stroke-dasharray="5 4"/>
    <line x1="335" y1="146" x2="335" y2="182" marker-end="url(#fl-nest0)"/>
    <path d="M466,202 C478,120 300,90 260,54" marker-end="url(#fl-nest0)" stroke-dasharray="5 4"/>
  </g>
  <g text-anchor="middle" style="fill:var(--color-fg)">
    <text x="81" y="38.3">scout finds letter</text>
    <text x="240" y="38.3">trail is laid</text>
    <text x="399" y="38.3">workers carry</text>
    <text x="145" y="132.3">queen lays ants</text>
    <text x="335" y="132.3">stores fill</text>
    <text x="367" y="206.3">builder raises mini hill</text>
  </g>
</svg>

![Trails of ants carrying letters across the ten-times-zero note toward the anthill, the stores bar in the sidebar reading building as a builder heads out to raise a mini hill.](/media/notes/nest-mini-hill.jpg)

You fight back with the three tools in the panel, on the icons or the 1, 2 and 3 keys. Squash and Wipe lock every page link, not just the reading pane, so a missed ant does not send you to another page. (I learned that one by clicking an ant, missing, and landing on /projects. Several times.) Wipe across a scent trail and it snaps into two pieces: the ants scatter, then take the nearest trail with room or head back to the hill. A squashed ant flattens under a quick ring. Links hands the page back, but following a page link asks first: leaving ends the colony. There is bait, a hill seal on a cooldown, and a mute button, because sound is off until you ask for it.

## No win screen, no game over

The endings were the part I argued with myself about longest. A portfolio is not an arcade, and a big YOU WIN banner on a résumé page felt wrong. So there isn't one. Wipe out the colony after the queen has spent her two reserve scouts and she dies: the nest goes still and the page keeps its gaps, as a record of the fight. Let roughly one in seven characters go and it is simply too late. The ants stop being squashable and eat on, quietly, until the page is empty. Closing the Nest puts every letter back. A refresh or a move to another page is a reset too: the panel closes, the colony clears, and the launcher waits in the status bar. The colony lives on the page where you opened it.

## Built on the same stack as everything else

No canvas, no game library, no framework. The nest in the sidebar is a grid of Braille characters, each cell eight dots, colored by the theme's own tokens, the same trick as the bread on the home page. The ants are tiny inline SVGs made of round dots, two leg frames swapping. Every color comes from the active flavor of [GRAIN](/grain), so the game is blue on baguette and gold on brioche without me writing a line for either. It is one plain JavaScript file. The sound is synthesized in the same file: a few oscillators and one noise buffer, no audio files.

That was the point of building it at all. A design system that only renders documents is half a claim. This one also renders a small ecosystem that steals from the documents.

## Where the time actually went

Not into the fun parts. Into traffic. The first colony read like a centipede, ants nose to tail. Then every ant piled onto the first trail and ignored the second. Then two trails crossed and the whole colony gridlocked, each ant politely waiting for the one in front of it, forever. The fix there was letting ants only queue behind ants on their own trail heading their own way, plus a timeout for the stubborn ones. Later I gave each trail two lanes and drew the scout's route as one soft cubic with a jagged little walk in it, because a trail should look walked, not sampled. Real ants solved that a long time ago. It took me a few evenings.

Claude did most of the typing, which will surprise nobody who has read [how I work](ten-times-zero.md). The calls were mine: ants that take real letters, gaps that never reflow, no announced ending, and the bit where a professional site hides a game behind a small ant and a word you have to know to type.

## What I have not earned yet

It has been played by me, a preview browser, and a small browser suite, and that is the whole test group. Balance is a guess: the costs of mini hills, the one in seven threshold, how fast the queen breeds. I have watched a guard patrol a trail end to end since, and the first version could get stuck on its own mound; that is fixed now. On a phone it needs a rethink, because squashing an ant with a thumb on a narrow column is a different game, and the stray ant has nowhere to lead because the launcher hides there. I have not built that one.

But if you are reading this on the site, the ant is in the status bar, and the terminal still takes one word. *Nest*. The copy you just read is the food. If a single ant crosses the page later, when the Nest is closed, follow it. It is the same animated ant as the colony, legs and all, and it knows the way back. Click one and it runs down the page, along the status bar and into the launcher, rather than flying there. It will not cross again in that tab. If you leave it alone, it walks off the nearest edge after fourteen to nineteen seconds. If you would rather not wait, the terminal takes *stray*.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
