---
title: "My portfolio has ants now, and they eat the copy"
subtitle: "A hidden game on a professional site, built with no canvas and no framework, where the enemy steals the very letters you came to read."
author: "Tjakoen Stolk"
status: PUBLISHED
type: note
date: 2026-11-07
readingTime: "~6 min"
tags: [games, interactive, vanilla, grain, claude]
summary: >
  Type the word nest on any page of this site and an ant colony moves in. Scouts find letters,
  lay scent trails, and workers carry the real glyphs home to a queen drawn in Braille dots. It is
  a small game built on the same vanilla stack as everything else here, to show that the stack can
  do play as well as documents, and it took more tuning of ant traffic than of anything that looks
  like game design.
image: /media/notes/nest-og.png
imageAlt: "TJ's Desk home page with an ant colony at work: an anthill drawn in Braille dots, scent trails running to two feed cards with letters missing, and the Nest panel in the sidebar."
social: |
  My portfolio has ants now.

  Type the word nest on any page of my site and a colony moves in. Scouts find letters, lay scent
  trails, and workers carry the real glyphs home to a queen drawn in Braille dots. The gaps they
  leave stay put, so you watch the paragraph you were reading go missing one letter at a time.

  No canvas, no game library, no framework. One plain JavaScript file on the same vanilla stack as
  the rest of the site, colored by the theme's own tokens.

  The word is nest. The copy is the food.
---

I had no game on my portfolio. For someone who keeps telling students the interesting part of software is the behavior, that was a little embarrassing. So this site now has ants.

They are hidden. Type *nest* anywhere outside a text field (or add ?nest to the address) and a tiny ant appears in the status bar at the bottom. Click it, and an anthill turns up in an empty patch of whatever page you are on, the page scrolls to it, and the colony goes to work on the copy.

> The enemy in this game wants the sentence you were halfway through reading.

![The Nest open on a note: an anthill in the top corner, a dotted scent trail down to the subtitle, an ant carrying a letter, gaps where letters were taken, and the colony panel in the sidebar.](/media/notes/nest-trails.jpg)

## What the ants actually do

Two scouts leave the hill first. Each one wanders to a letter, picks it up, and walks it home. The letter it takes is the real glyph, in its real font, color and underline, and the space it leaves stays exactly where it was, so the paragraph never reflows. You just watch it get gappier.

A scout that makes it home lays a scent trail. Workers follow trails six to a line, filled in turn so no trail starves, and a heading in a big font needs a crew of two or three to lift. Every other letter feeds the queen in the sidebar, who lays eggs. The rest goes into two storerooms, and when they fill up a builder ant walks out and raises a mini hill somewhere else on the page. Mini hills send out guards, which walk to an existing trail and patrol it, and flyers, which ignore trails entirely and pinch letters from anywhere.

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

![Two trails of ants carrying letters across the ten-times-zero note toward the anthill, the stores bar in the sidebar reading building as a builder heads out to raise a mini hill.](/media/notes/nest-mini-hill.jpg)

You fight back with three tools from the panel. Squash, which is the default, and which also holds every link on the page so a missed ant does not send you to another page. (I learned that one by clicking an ant, missing, and landing on /projects. Several times.) Wipe trail, for dragging across the scent so a line of ants loses the plot. And read page, which hands the links back and leaves the ants alone. There is bait, a hill seal on a cooldown, and a mute button, because sound is off until you ask for it.

## No win screen, no game over

The endings were the part I argued with myself about longest. A portfolio is not an arcade, and a big YOU WIN banner on a résumé page felt wrong. So there isn't one. Wipe out the colony after the queen has spent her two reserve scouts and she dies: the nest goes still and the page keeps its gaps, as a record of the fight. Let roughly one in seven characters go and it is simply too late. The ants stop being squashable and eat on, quietly, until the page is empty. Closing the Nest puts every letter back.

## Built on the same stack as everything else

No canvas, no game library, no framework. The nest in the sidebar is a grid of Braille characters, each cell eight dots, colored by the theme's own tokens, the same trick as the bread on the home page. The ants are tiny inline SVGs made of round dots, two leg frames swapping. Every color comes from the active flavor of [GRAIN](/grain), so the game is blue on baguette and gold on brioche without me writing a line for either. It is one plain JavaScript file, loaded only when you type the word.

That was the point of building it at all. A design system that only renders documents is half a claim. This one also renders a small ecosystem that steals from the documents.

## Where the time actually went

Not into the fun parts. Into traffic. The first colony read like a centipede, ants nose to tail. Then every ant piled onto the first trail and ignored the second. Then two trails crossed and the whole colony gridlocked, each ant politely waiting for the one in front of it, forever. The fix there was letting ants only queue behind ants on their own trail heading their own way, plus a timeout for the stubborn ones. Real ants solved that a long time ago. It took me a few evenings.

Claude did most of the typing, which will surprise nobody who has read [how I work](ten-times-zero.md). The calls were mine: ants that take real letters, gaps that never reflow, no announced ending, and the bit where a professional site hides a game behind a word you have to know to type.

## What I have not earned yet

It has been played by me and by a preview browser, and that is the whole test group. Balance is a guess: the costs of mini hills, the one in seven threshold, how fast the queen breeds. I have not watched a guard patrol a trail end to end. On a phone it needs a rethink, because squashing an ant with a thumb on a narrow column is a different game, and I have not built that one.

But if you are reading this on the site, the word is *nest*. The copy you just read is the food.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
