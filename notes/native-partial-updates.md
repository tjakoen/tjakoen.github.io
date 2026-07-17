---
title: "I Finally Ran the Benchmark I Kept Promising"
subtitle: "For two notes I said my stack was fast because it ships less, and then admitted I hadn't measured it. So I built the same blog four ways and measured it. Here is the number, and the new browser feature that pushes it close to zero."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-07-17
readingTime: "~7 min"
tags: [native-first, web-platform, performance, no-build, batch]
summary: >
  I built the same small blog four ways, my native stack, the same stack with the browser doing the
  HTML swap, Astro, and Next, and measured what each ships for one identical filter. Next sends about
  118 kilobytes of JavaScript where my stack sends two, roughly 162 times more, with the same rendered
  HTML and the same SEO on every build. Declarative Partial Updates, a new browser primitive, pushes the
  cost lower still by letting the server stream fragments the browser patches in with no library, though
  it is a flagged experiment and not safe across browsers before about 2027.
---

For two notes now I made the same promise and then quietly walked away from it. I said my stack ships less, so it should be faster, and then I told you I had not actually run the benchmark, so I would not print a number I could not back. Twice. At some point a bet you keep calling well-founded and never test is just a thing you are afraid to measure.

So I measured it.

## The setup, before any numbers

Here is the honest version of what I built. One small blog, the same content, rendered four ways: my own native stack on Bun, the same stack with a single change I will get to, then Astro, then Next. Every one of them renders the same HTML, ships the same stylesheet byte for byte, and carries the same page metadata, the title and description and canonical link and the structured data. If one of them had better SEO, that would be a flaw in the test, not a win for the stack, so I handed all four the same head on purpose. Then one script boots each build, measures it the same way, and writes the table.

The only thing I let vary is the one piece of real interactivity on the page: a filter that narrows the post list as you type and pick tags. That filter is the whole fight. It is the exact small interaction people reach for a framework to build, so the JavaScript each stack ships to make it work is the number worth staring at.

## The number

<svg viewBox="0 0 620 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bar chart of JavaScript shipped for one identical filter: Astro about 744 bytes, native stack about 2 kilobytes, native with Declarative Partial Updates about 3 kilobytes, and Next about 118 kilobytes.">
  <rect x="0.5" y="0.5" width="619" height="249" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="32" style="fill:var(--muted);font-size:15px">JavaScript shipped for one identical filter</text>
  <line x1="24" y1="46" x2="596" y2="46" style="stroke:var(--edge);stroke-width:1"/>

  <text x="28" y="78" style="fill:var(--ink);font-size:14px">Astro</text>
  <rect x="150" y="66" width="3" height="18" style="fill:var(--accent)"/>
  <text x="162" y="79" style="fill:var(--muted);font-size:13px">744 b</text>

  <text x="28" y="114" style="fill:var(--ink);font-size:14px">native / BATCH</text>
  <rect x="150" y="102" width="7" height="18" style="fill:var(--accent)"/>
  <text x="166" y="115" style="fill:var(--muted);font-size:13px">2 kb</text>

  <text x="28" y="150" style="fill:var(--ink);font-size:14px">native + DPU</text>
  <rect x="150" y="138" width="11" height="18" style="fill:var(--accent)"/>
  <text x="170" y="151" style="fill:var(--muted);font-size:13px">3 kb</text>

  <text x="28" y="186" style="fill:var(--ink);font-size:14px">Next.js</text>
  <rect x="150" y="174" width="430" height="18" style="fill:var(--ink)"/>
  <text x="574" y="187" style="fill:var(--paper);font-size:13px;text-anchor:end">118 kb</text>

  <text x="28" y="228" style="fill:var(--accent);font-size:13px">Same filter, same HTML, same SEO. About 162 times the JavaScript.</text>
</svg>

*The bars are to scale. That is the whole point: three of them are slivers.*

For the same filter, on the same page, Next ships about 118 kilobytes of JavaScript, the React runtime plus the work of waking it up in the browser. My native stack ships about two. Astro, to its real credit, ships even less than I do, a few hundred bytes, because its filter is a small script with nothing underneath it, and on a page this static that is a genuinely strong showing. I am not going to pretend otherwise. But the shape is the argument: roughly a hundred and sixty times the code, for the identical thing the reader does.

A few honest asterisks, because this only means something if I do not cook it. Astro inlines its little script into the page, so a naive count would report zero, and measured properly it is those few hundred bytes, which I counted. My own server does not compress its responses in this test, which makes my numbers look slightly worse than they would behind a real CDN, so if anything the gap is wider than I am claiming. And the load times, which I did record, I am treating as corroboration and not proof, because they come off my machine with no real network in the way. The bytes are the case. The clock just nods along.

## The part I did not expect to be measuring yet

There is a fourth build in that table I slid past: my stack, with one change. In the normal version, a small script I ship does the swap, taking the filtered list and putting it on the page. In this one, the browser does the swap itself.

That is Declarative Partial Updates, [the proposal I flagged in the first note](the-browser-grew-up.md), and the fragment-swap path I said I had not taken [in the follow-up](feels-like-an-app.md). The server sends a piece of HTML, and the page slots it in using plain native methods, setHTML and a streaming cousin of it, with no swap library in between. There is even a way to open a hole in the page mid-stream and fill it further down in the same response, which the browser patches in with no script at all. I built that variant, pointed the same measuring script at it, and the interactive filter came in around three kilobytes of glue, while the streamed-in fill shipped, for the swap itself, nothing. The browser did it.

## Why I still have not moved onto it

Because it barely exists yet, and I would rather say so than sell it. The full feature runs in exactly one browser, Chrome, and only behind a flag you turn on by hand. Firefox ships the smallest piece, the plain setHTML setter, in a normal release. Safari has not said a word. None of it is safe to put in front of a real visitor before roughly 2027, and I checked all three cases against my own demo rather than trusting a changelog, so I am confident about that shape even this early.

And even once it lands, it does not retire the small libraries. Something like htmx does far more than the swap: it decides what triggers a request, how the request is shaped, how the back button still works. Declarative Partial Updates takes only the swap, the one bit of glue I had to import, and hands it to the browser. The runtime you ship gets smaller. It does not go to zero. There is also a trade I am not hiding: the native-swap version asks the server for each fragment, so it spends a round-trip where my plain client-side filter spends none. Fewer bytes, one more request. On that one I took the measurement, not a side.

## The promise, kept

So here is the number I owed across two notes, with a receipt under it at last. Less shipped really is less, by about two orders of magnitude at the far end, for the same page doing the same job. And the one piece of glue I was still importing, the browser is reaching down to pick up on its own.

I spent two posts saying the browser grew up. Turns out it is still growing, and this time I stayed long enough to time it.

> The bet I kept calling well-founded is measured now. It held.

*(The full harness and the four builds live in the framework bench repo, so you can run it yourself and get your own numbers.* [ *Link once the repo is pushed.* ] *)*

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
