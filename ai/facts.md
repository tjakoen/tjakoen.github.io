---
title: About TJ and this site
description: Hand-authored grounding for the desk assistant. Bio, what BREAD is, and how the site is built.
---

This is grounding for the desk, the small assistant that runs in your browser on this site. It answers from what is written here and from the pages you can open. When it does not know something, it says so and points you at a page.

## Who is TJ?

TJ is a teacher who builds software. He works on a career team, helping people find and grow into work, and he builds the tools that make that teaching go further. The site you are on is his desk: a personal portfolio, a notebook, and a live demo of the way he thinks a site should feel.

His writing sits under Notes. It is honest about limits, low on hype, and written to be read rather than to sell. If you want to know how he works with an AI, the notes are the place to start. The flagship post is "Ten Times Zero" (at /notes/ten-times-zero), on building with an AI in the open.

## What is BREAD?

BREAD is TJ's personal software stack. It is five members, built to depend on each other in one direction, so each layer only knows about the ones below it.

The four layers, in dependency order, are BATCH, GRAIN, MILL, and PROOF. BATCH is the bottom: a no-build, server-rendered hypermedia substrate that runs this site. GRAIN sits on top of it, an AI-interaction design system whose whole idea is that every surface can be operated by both a human and an AI through one shared vocabulary, with the AI's presence shown as a visible grain. MILL is a content engine that turns Markdown into GRAIN pages, and it renders the notes and the layer docs you read here. PROOF is an AI plan board, where plans are Markdown files and the board is a projection of them.

PANTRY is the fifth member, but it is not a link in that chain. It is an app that composes the layers into one dev-docs and AI cockpit you can install and run. This portfolio is its neutral sibling: another app built on the same layers.

You can read each member's own story from its trailhead, at /grain, /batch, and the docs under /grain/docs and /batch/docs.

## How is this site built?

The site is built on the stack it is showing you. BATCH serves it, GRAIN dresses it, and MILL renders the Markdown. It is a multi-page site, not a single-page app: every page is a real document you can link to, and it works with no JavaScript at all. The pieces that need JavaScript are added on top, never required underneath.

It is a static site on GitHub Pages. A build step freezes the live server's output into plain files, so what you get is fast and durable, with no backend to go down.

The assistant is the newest part. Instead of calling a server, the desk loads a small language model straight into your browser and runs it on your own device, grounded on the site's own content. It needs a browser with WebGPU. If your browser cannot run it, the desk goes offline and the rest of the site carries on as normal.

## What can the desk do?

The desk answers questions about TJ, about the BREAD stack, and about anything written on this site. It reads the notes and docs to ground its answers, and it points you at the page when you want the full story. It is a small model, so it keeps its answers short and sticks to what it can actually back up.
