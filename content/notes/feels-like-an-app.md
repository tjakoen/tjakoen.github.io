---
title: "This Site Feels Like an App. It's a Stack of Full Page Loads."
subtitle: "Every click here loads a whole new document, the old-fashioned way. It still feels like a single-page app, because the browser now does the part I used to ship a framework for. Here is the actual machinery, seams and all."
author: "Tjakoen Stolk"
status: DRAFT
type: note
date: 2026-07-05
readingTime: "~13 min"
tags: [batch, grain, mill, no-build, view-transitions, architecture]
summary: >
  A technical tour of how tjakoen.github.io is built, and why it is a different way of doing things:
  the single-page feel is a cross-document View Transition, not an SPA; there is no build step,
  because a Bun server composes the HTML and the static site is a frozen crawl of it; there is no
  client framework, only a handful of small scripts leaning on native browser elements; writes go
  through one path that also runs with no server; and the whole thing is three layers stacked one
  direction. The AI side of the story lives in its own whitepaper.
---

Click around this site for a minute. Change the theme, open the assistant panel, jump from a note to the showcase and back. It moves like an app: the chrome stays put, only the content changes, nothing flashes white between screens.

Now open your browser's network tab and do it again. Every one of those navigations is a full document load. A whole new HTML page, fetched from scratch, the way the web worked in 1996. There is no client-side router. There is no app shell held in memory. The page you are on gets thrown away and a new one arrives, every single time.

I want to be honest about that gap between what it feels like and what it is, because the gap is the whole trick. For years the only way to get the smooth feel was to stop doing full page loads: keep one page alive, swap the insides with JavaScript, and pay for a framework to manage the mess. I did that for a decade. This site does the opposite, and it feels the same. The reason is that the browser grew up, which is a story [I already told](the-browser-grew-up.md). This note is the part that comes after the sales pitch: the actual machinery.

## The single-page illusion is one line of CSS

Here is the trick, stated plainly. When you navigate between two pages that share the same layout, the browser can animate the difference instead of blanking the screen. It is called a cross-document View Transition. I named it in passing in the other note as one of the primitives that retired a library; this is the part I skipped there, the actual mechanism. Turning it on is genuinely one declaration:

```css
@view-transition { navigation: auto; }
```

That lives in the stylesheet every page loads. On its own it cross-fades the whole document, which is nice but not the effect I wanted. The effect I wanted is the chrome staying still while only the content moves, and that takes one more idea: you name the regions that should be treated as *the same thing* across the two pages.

```css
.app-shell__rail    { view-transition-name: shell-rail; }
.app-shell__topbar  { view-transition-name: shell-topbar; }
.app-shell__window  { view-transition-name: shell-window; }
.app-shell__status  { view-transition-name: shell-status; }
```

Because the sidebar on the old page and the sidebar on the new page carry the same name, the browser understands they are one continuous element and morphs it in place rather than fading it out and back in. Only the main content area, which has no shared name, actually cross-fades. So the rail, the top bar, the status row all hold steady while the middle swaps. That is the entire single-page feel. No router, no diffing, no virtual anything. Two full documents and a promise that these boxes are the same box.

<svg viewBox="0 0 457 380" width="100%" role="img"
     aria-label="You click a link and the browser fetches a whole new HTML document. If both pages share view-transition-name regions, the named chrome (rail, topbar, status) morphs in place while the unnamed main content cross-fades — so a full page load feels like one continuous app."
     style="display:block;width:100%;max-width:540px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-feelsl0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="178" y="16" width="127" height="36" rx="6"/>
    <rect x="83" y="94" width="316" height="36" rx="6"/>
    <polygon points="242,172 372,209 242,246 111,209"/>
    <rect x="16" y="250" width="222" height="52" rx="6"/>
    <rect x="272" y="250" width="170" height="52" rx="6"/>
  </g>
  <rect x="135" y="328" width="212" height="36" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="242" y1="52" x2="242" y2="94" marker-end="url(#fl-feelsl0)"/>
    <line x1="242" y1="130" x2="242" y2="172" marker-end="url(#fl-feelsl0)"/>
    <line x1="199" y1="234" x2="171" y2="250" marker-end="url(#fl-feelsl0)"/>
    <line x1="284" y1="234" x2="312" y2="250" marker-end="url(#fl-feelsl0)"/>
    <line x1="170" y1="302" x2="212" y2="328" marker-end="url(#fl-feelsl0)"/>
    <line x1="314" y1="302" x2="271" y2="328" marker-end="url(#fl-feelsl0)"/>
  </g>
  <g text-anchor="middle">
    <text x="242" y="38.3" style="fill:var(--color-fg)">You click a link</text>
    <text x="242" y="116.3" style="fill:var(--color-fg)">Browser fetches a whole new HTML document</text>
    <text x="242" y="205.3" style="fill:var(--color-fg)">Do both pages share</text>
    <text x="242" y="221.8" style="fill:var(--color-fg)">view-transition-name regions?</text>
    <text x="127" y="272.3" style="fill:var(--color-fg)">Named chrome morphs in place</text>
    <text x="127" y="288.8" style="fill:var(--color-muted);font-size:12px">rail · topbar · status hold steady</text>
    <text x="356" y="272.3" style="fill:var(--color-fg)">Unnamed main content</text>
    <text x="356" y="288.8" style="fill:var(--color-fg)">cross-fades</text>
    <text x="242" y="350.3" style="fill:var(--color-bg)">Feels like one continuous app</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="185" y="237">yes</text>
    <text x="298" y="237">yes</text>
  </g>
</svg>

*What actually happens on a click versus what you perceive: a fresh document every time, dressed up as a continuous surface.*

There is a small honest footnote here. Some state does survive the page swap, because it is stored in your browser rather than in server memory: which panels you have open, whether the rail is collapsed, the theme you picked. That is a few lines of localStorage, not a framework. Persisting the actual conversation with the assistant across loads is on the roadmap and not done yet, so if you reload mid-chat today, the transcript does not come back. I would rather say that than let you find out.

And if you have reduced motion turned on, the whole transition switches off and you get instant jumps, which is the correct behavior and, again, one line of CSS.

## There is no build step, and the pages are photographs

I made the full case for "no build step, and I mean it literally" in the [other note](the-browser-grew-up.md), so I will not relitigate it here. The short version: a Bun server reads my templates, expands the custom component tags I invented, and returns finished HTML, running the TypeScript directly with nothing compiled into a folder in between. The server *is* the build step, and it runs on demand.

Two details specific to how this site is put together are worth adding. First, the stylesheet you load, the one with every component's styles in it, is not a file I maintain. Each component owns its own styles, built the way [atomic design](https://atomicdesign.bradfrost.com/) teaches: small atoms compose into molecules compose into whole organisms, behavior living at the lowest layer and cascading up by inheritance rather than getting bolted on per piece. The served stylesheet is just those parts concatenated at the moment you request it. There is no bundle to keep in sync with the components, because the components *are* the bundle. (I have confessed at length about being a design-systems person to my core in [the origin story](origin-story.md); this is what that looks like in the plumbing.)

<svg viewBox="0 0 574 260" width="100%" role="img"
     aria-label="Atoms compose into molecules into organisms into a page. Independently, each component contributes its own CSS to the one stylesheet you load: every component's CSS, concatenated on request."
     style="display:block;width:100%;max-width:560px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-feelsl1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="37" y="16" width="176" height="52" rx="6"/>
    <rect x="41" y="80" width="168" height="52" rx="6"/>
    <rect x="16" y="144" width="217" height="52" rx="6"/>
    <rect x="88" y="208" width="73" height="36" rx="6"/>
  </g>
  <rect x="235" y="112" width="323" height="52" rx="6" style="fill:var(--color-fg);stroke:var(--color-fg);stroke-width:1"/>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="125" y1="68" x2="125" y2="80" marker-end="url(#fl-feelsl1)"/>
    <line x1="125" y1="132" x2="125" y2="144" marker-end="url(#fl-feelsl1)"/>
    <line x1="125" y1="196" x2="125" y2="208" marker-end="url(#fl-feelsl1)"/>
    <line x1="198" y1="68" x2="323" y2="112" marker-end="url(#fl-feelsl1)" stroke-dasharray="5 4"/>
    <line x1="208" y1="116" x2="235" y2="119" marker-end="url(#fl-feelsl1)" stroke-dasharray="5 4"/>
    <line x1="233" y1="157" x2="235" y2="157" marker-end="url(#fl-feelsl1)" stroke-dasharray="5 4"/>
  </g>
  <g text-anchor="middle">
    <text x="125" y="38.3" style="fill:var(--color-fg)">Atoms</text>
    <text x="125" y="54.8" style="fill:var(--color-muted);font-size:12px">b-button · b-input · b-badge</text>
    <text x="125" y="102.3" style="fill:var(--color-fg)">Molecules</text>
    <text x="125" y="118.8" style="fill:var(--color-muted);font-size:12px">card · tab · chat-message</text>
    <text x="125" y="166.3" style="fill:var(--color-fg)">Organisms</text>
    <text x="125" y="182.8" style="fill:var(--color-muted);font-size:12px">app-shell · sidebar-panel · console</text>
    <text x="125" y="230.3" style="fill:var(--color-fg)">A page</text>
    <text x="397" y="134.3" style="fill:var(--color-bg)">The stylesheet you load</text>
    <text x="397" y="150.8" style="fill:var(--color-muted);font-size:12px">every component's own CSS, concatenated on request</text>
  </g>
  <g text-anchor="middle" style="fill:var(--color-muted);font-size:12px;stroke:var(--color-bg);stroke-width:3;paint-order:stroke">
    <text x="222" y="112">its own CSS</text>
  </g>
</svg>

*Atomic design in the plumbing: small parts compose into big ones, and the stylesheet the browser loads is just each part's own styles concatenated on request. The components are the bundle.*

Second, and the part I find genuinely satisfying: this site is hosted as plain static files on GitHub Pages, with nothing running behind it. So where did the server go? I run it once, crawl every page it serves, and freeze the results to disk. The static site is a *projection* of the running app, not a second renderer that might drift from the first. There is exactly one thing that knows how to build a page, and the export just takes photographs of its output. One source of truth, photographed, not re-implemented.

The crawl is a single command, so the whole deploy is a GitHub Actions job. This very page reached you because, on my last push, a runner spun up the server, took the photographs, published the folder to Pages, and threw the server away. The build server existed for a few seconds inside a runner and never once for a visitor. GitHub Pages itself is not a server, it is a shelf for files, so the shape I keep coming back to holds: a server is a thing you borrow briefly to produce files, not a thing that has to stay running to hand them out.

One clarification I owe you, because "no server" is easy to overread. The stack is not anti-server; this deployment simply does not need one. The very same app boots as a live server, and that is exactly what you want the day a page needs real server things: a database, a genuine API call, data that changes per request. The static export is layered *on top of* that running server, a projection of it, never a replacement for it. So the portfolio ships as frozen files because it is only content plus a browser-side demo, while a fuller product built on this same stack keeps its server for the parts that earn one. Static is a choice this content gets to make, not a ceiling the stack imposes.

The rule under all of that is simple, and it keeps me honest about what can freeze: a page can become a static file only if it looks the same for every visitor at the moment it is built. Content passes that test easily. Data pulled from a database can pass too, as long as I bake it in once as a snapshot rather than reading it fresh per visit. Anything that genuinely changes per person or per request, a logged-in view, a live write, cannot be a photograph and stays on a server. This site happens to be all the freezable kind. A different app would draw the line in a different place, and the same stack would let it.

## The only script that earns its keep

Open the page source and count the JavaScript. There is no framework runtime. What you find instead is a small handful of plain scripts leaning on things the browser already does: a theme toggle, the sidebar collapse, the command palette wiring. The command palette itself, the one that opens on Cmd-K, is a native *dialog* element. It brings its own focus trap, its own backdrop, its own Escape-to-close. The script just tells it when to open.

The one script that is genuinely load-bearing, the one the whole design system is built around, is the door. And it is smaller than you would guess, because it only has two jobs. One: when you act on something marked as actionable, it optimistically flips that thing into its pending state and posts your intent to the single write path. Two: it listens for the edits that come back and applies each one by finding its region by *semantic* address, never by hunting for a CSS class or a tag. Send intents out; apply edits as they return. That is the entire client-side model, and, tellingly, it says nothing about a server: the script behaves identically whether a real backend decides what changes or, on this static site, the same logic runs in the browser and hands the edits straight back.

<svg viewBox="0 0 347 440" width="100%" role="img"
     aria-label="The one write path, step by step: you act on an actionable element (a click, or Enter in a field); it flips to its pending grain state optimistically; it posts your intent through the one write path; something decides what changes (a live server, or the same logic in the browser); a list of small typed edits comes back; each edit finds its region by semantic address, not a CSS selector, and updates it; the pending state releases and the surface settles."
     style="display:block;width:100%;max-width:520px;height:auto;margin:0 auto 1.5rem;font-family:Georgia,'Times New Roman',serif;font-size:13.5px">
  <defs>
    <marker id="fl-feelsl2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" style="fill:var(--color-muted)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--color-line);stroke-width:1">
    <rect x="57" y="16" width="232" height="52" rx="6"/>
    <rect x="42" y="78" width="264" height="52" rx="6"/>
    <rect x="20" y="140" width="307" height="36" rx="6"/>
    <rect x="34" y="202" width="279" height="52" rx="6"/>
    <rect x="41" y="264" width="265" height="36" rx="6"/>
    <rect x="18" y="326" width="312" height="52" rx="6"/>
    <rect x="16" y="388" width="315" height="36" rx="6"/>
  </g>
  <g style="stroke:var(--color-muted);stroke-width:1.5;fill:none">
    <line x1="174" y1="68" x2="174" y2="78" marker-end="url(#fl-feelsl2)"/>
    <line x1="174" y1="130" x2="174" y2="140" marker-end="url(#fl-feelsl2)"/>
    <line x1="174" y1="176" x2="174" y2="202" marker-end="url(#fl-feelsl2)"/>
    <line x1="174" y1="254" x2="174" y2="264" marker-end="url(#fl-feelsl2)"/>
    <line x1="174" y1="300" x2="174" y2="326" marker-end="url(#fl-feelsl2)"/>
    <line x1="174" y1="378" x2="174" y2="388" marker-end="url(#fl-feelsl2)"/>
  </g>
  <g text-anchor="middle">
    <text x="174" y="38.3" style="fill:var(--color-fg)">You act on an actionable element</text>
    <text x="174" y="54.8" style="fill:var(--color-muted);font-size:12px">a click, or Enter in a field</text>
    <text x="174" y="100.3" style="fill:var(--color-fg)">That element flips to its pending state</text>
    <text x="174" y="116.8" style="fill:var(--color-muted);font-size:12px">optimistically — the grain look</text>
    <text x="174" y="162.3" style="fill:var(--color-fg)">It posts your intent through the one write path</text>
    <text x="174" y="224.3" style="fill:var(--color-fg)">Something decides what changes</text>
    <text x="174" y="240.8" style="fill:var(--color-muted);font-size:12px">a live server, or the same logic in the browser</text>
    <text x="174" y="286.3" style="fill:var(--color-fg)">A list of small typed edits comes back</text>
    <text x="174" y="348.3" style="fill:var(--color-fg)">Each edit finds its region by semantic address</text>
    <text x="174" y="364.8" style="fill:var(--color-muted);font-size:12px">not a CSS selector — and updates it</text>
    <text x="174" y="410.3" style="fill:var(--color-fg)">The pending state releases: the surface settles</text>
  </g>
</svg>

*What the one script does, start to finish: send an intent out the door, then apply the edits that come back, addressing each region by name. The script runs the same whether a server or the browser itself is what decides.*

Everything else on the page is either server-rendered HTML or a native primitive doing its native job. That is the bar the design system holds itself to, in [its own words](/grain): the browser first, a small script only when the platform truly cannot.

## One write path (and why it runs with no server)

One architectural choice is worth calling out here, because it is the same "server on demand, not by default" instinct applied to changes instead of pages. Every change to the page goes through a single write path rather than a scatter of endpoints: an interaction becomes an Intent, one component decides what happens, and the result comes back as small typed edits applied to the DOM. Reads stay plain, loaded straight from the server as HTML; only writes funnel through the one door.

The part that fits this note is what that buys the static build. The same write path can be composed to run entirely in the browser, with the edits looping straight back into the page in memory instead of over a network. So the frozen static site is not a dead snapshot: the interactive demos still work with no backend at all, because the door does not care whether there is a server behind it. Same code, once with a server, once without.

That door is also where the more interesting idea lives: a human and the AI operate the *same* controls through it, as peers, with the machine's presence shown right in the typography. But that is a whole separate thesis, and it has its own home. The readable version is in [the origin story](origin-story.md); the full argument, with the literature, is the whitepaper [One Vocabulary, Two Operators](whitepaper-one-vocabulary.md). This note is about the plumbing, not the philosophy, so I will point you across rather than repeat it.

## Three layers, stacked one direction

None of the above lives in one big pile. It is three layers, and dependency only ever flows one way.

<svg viewBox="0 0 620 290" width="100%" role="img"
     aria-label="The stack, three layers, dependency flowing one direction only. BATCH is the substrate at the bottom: a no-build server that composes HTML, runs on Bun, ships no framework. GRAIN sits on top of BATCH: the design system and the one-door AI interaction model. MILL sits on top of GRAIN: the content engine that turns Markdown into pages, and it renders this very note. Each layer depends only on the ones below it, so each can be extracted into its own project."
     style="max-width:560px;height:auto;font-family:Georgia,'Times New Roman',serif;--paper:#faf7f1;--edge:#e6ddd0;--ink:#2b2b2b;--muted:#6b6259;--bar:#cbc1b3;--accent:#d97757"
     xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" width="619" height="289" style="fill:var(--paper);stroke:var(--edge)"/>
  <text x="28" y="30" style="fill:var(--muted);font-size:15px">The stack: each layer builds only on the ones below</text>

  <rect x="120" y="52" width="380" height="52" style="fill:var(--paper);stroke:var(--edge);stroke-width:1"/>
  <text x="140" y="76" style="fill:var(--ink);font-size:14px">MILL</text>
  <text x="140" y="94" style="fill:var(--muted);font-size:12.5px">Markdown into pages (live: it renders this note)</text>

  <rect x="120" y="118" width="380" height="52" style="fill:var(--paper);stroke:var(--edge);stroke-width:1"/>
  <text x="140" y="142" style="fill:var(--ink);font-size:14px">GRAIN</text>
  <text x="140" y="160" style="fill:var(--muted);font-size:12.5px">The design system + the one-door AI model</text>

  <rect x="120" y="184" width="380" height="52" style="fill:var(--paper);stroke:var(--edge);stroke-width:1"/>
  <text x="140" y="208" style="fill:var(--ink);font-size:14px">BATCH</text>
  <text x="140" y="226" style="fill:var(--muted);font-size:12.5px">The substrate: no-build server, Bun, no framework</text>

  <text x="504" y="150" style="fill:var(--muted);font-size:12.5px" transform="rotate(-90 504 150)">depends downward only</text>

  <text x="28" y="270" style="fill:var(--accent);font-size:13px">One direction of dependency, so any layer lifts out into its own project.</text>
</svg>

*The stack: BATCH the substrate, GRAIN the design system on top of it, MILL the content engine on top of that. Nothing ever imports upward.*

BATCH is the substrate: the no-build server, the component tags, the static export. GRAIN sits on it and adds the design system and the one-door interaction model, importing nothing from BATCH except a single narrow port. MILL, the content engine that renders these Markdown notes into pages, sits on top of GRAIN. Because the arrows only ever point down, any layer can be lifted out and used on its own, which is the plan once each one has earned it.

Here is a small, concrete example of what "one direction, one source" buys you day to day. Every page on this site needs the same invariant head: the theme guard that runs before first paint, the stylesheets, the startup script. For a while that boilerplate risked being copy-pasted into every page template, hand-authored and MILL-rendered alike, which is exactly the kind of thing that drifts the moment you forget one. So it moved to a single place, the one spot where the layers are wired together, and gets injected once. Now no page lists it, which means no page can list it *wrong*. Small change, but it is the whole philosophy in miniature: if something must be identical everywhere, it should be written in exactly one place.

## The seams, closed and still open

Time for the honest ledger, because a technical note that only lists wins is marketing.

For a long time the gap I kept flagging here was that I had not benchmarked any of this, and I wanted to be careful about what I did and did not know, because "is this actually faster than a framework" is the fair question and it deserves a better answer than "obviously yes." That gap is closed now. I built the same reference app four ways and measured it with one script, and the number is finally in hand. So this ledger has changed shape: the performance seam is settled, and the honest caveats that remain are smaller and more specific.

Start with the terminology, because it is the whole answer. This is not a single-page app. It is a multi-page app, full document loads, wearing the costume of one. That distinction decides the performance question. What is categorically true, no benchmark required, is that it ships less: no framework runtime, no hydration step, no client-side router. Less to download, less to parse, less to run on the main thread. For a content site, that is a real advantage and it is checkable by reading the network tab, not by trusting my gut.

The one place a full-page-load site can *lose* to a well-built single-page app is per navigation: I refetch a whole HTML document and the browser re-parses it, where a real SPA would fetch a sliver of JSON and swap a fragment. But that gap is smaller than it sounds here, because the shell styles and scripts are cached after the first visit, so a later navigation refetches only the HTML itself, which is small and compressed, and the browser composites the transition on the GPU. So the honest claim is not "faster, full stop." It is "ships categorically less, which for this kind of site means faster, with the measured number now in hand." Where a framework genuinely wins on speed is heavy client state, offline editing, drag-and-drop, big live data grids, and this site does none of that. The proof is the same reference app built four ways and measured by one script, and it exists now: [I finally ran it](native-partial-updates.md).

There is a newer wrinkle worth flagging, because it lands exactly on that one gap. The reason a full page load costs more per navigation is that I resend the whole document where an SPA would send a sliver and swap a fragment. The browser is now growing a native way to do the sliver: a set of proposals under the name Declarative Partial Updates that let a server stream fragments of HTML straight into named slots on the page, with no framework and no client router in the way. Chrome has the full thing behind a flag today and Firefox already ships the smallest piece, so it is early, and not something I would lean on in front of a visitor before it settles across browsers. But it is the honest counterweight to this whole note. The full-page-load path I chose and the fragment-swap path I did not are both, slowly, becoming things the native platform just does. The day that proposal is safe to build on, that one per-navigation gap gets smaller without a single dependency added. I built and measured that variant already, and it turned into [its own note](native-partial-updates.md).

One more honest note, since I sent the AI story across to the whitepaper: the door and the vocabulary are real and running, and the model that drives them is wired now too. A small language model runs directly in your browser and moves the desk around, choosing the next view and offering the choices instead of following a fixed script. It is small, so it fumbles the strange prompt, and it needs a recent browser with WebGPU to wake up at all. The whitepaper is the right place to hear that caveat in full, so I will not repeat it here beyond flagging that the mind is no longer a step behind the plumbing. Both are running now.

So that is the machinery. A stack of full page loads wearing the costume of a single-page app, composed by a server with no build step, then frozen into static files that a CDN serves in its sleep. A different way of doing things, and an old one, wearing new browser features well.

Reload the page. It will feel like an app. Now you know it is lying, and exactly how.

---

*The [judgment is human](ten-times-zero.md). The typing, by design, is not.*
