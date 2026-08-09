---
id: pantry-review-layer
status: todo
track: ai
depends: [crumb-prefilled-demo, agent-autonomy-tiers]
touches:
  - ../pantry/app.ts
  - ../pantry/cli.ts
  - ../pantry/config.ts
  - ../pantry/doctor.ts
  - ../pantry/preview.ts
  - ../pantry/pantry-review-client.js
  - ../pantry/pantry-review.js
  - ../pantry/pantry.css
  - ../pantry/pantry-cmdk.js
  - ../pantry/pantry-map.js
  - ../pantry/pantry.css
  - ../pantry/INSTALL.md
  - standards/DECISIONS.md
  - standards/TOUR-STANDARD.md
owner: unassigned
---

# PANTRY hosts the review, CRUMB makes it addressable

Decided 2026-08-10, in conversation, after the owner rejected the version of this I proposed first.
Mine had PANTRY rendering a review *about* a change. Theirs has PANTRY **hosting the project and
conducting the review on it**, which is a different and more useful thing: it turns PANTRY from a
reporting surface into the layer the whole loop is driven from.

[DECISIONS](../standards/DECISIONS.md) is the canon this builds toward. It owns which surface a
question belongs on, what a request carries, and the contract the answer comes back on. Nothing in
this plan changes that contract; this is the mechanism that finally satisfies it.

## Why this shape

CRUMB drives a tour by resolving `data-surface` addresses on the page it is running in. That works
beautifully on a GRAIN host and not at all anywhere else, so a review layer built on CRUMB alone can
only ever review GRAIN projects. PANTRY has no such constraint: it is already its own deployment
alongside whatever it is pointed at, and it already reads the plans, the runs and the decisions.

The unlock is that **same-origin proxying lets PANTRY inject its own tour client into any page**. The
reviewed project ships nothing, installs nothing, and does not know it is being toured.

Two practical arguments settled it beyond the design one. PANTRY installs as a git dependency, so this
can reach other repos today, while CRUMB is an npm package behind a publish. And a review hosted
outside the project keeps working when the project is not running, because the evidence is committed
rather than live.

## The three tiers

Each tier is what a step's evidence can be, and the difference between them is **addressability**,
not interactivity. Any project can be driven inside the embed; only some can be pointed at reliably.

- **Tier 0, any project, nothing installed.** The live app in the middle pane, fully interactive.
  Steps are prose plus a verify line the human performs. This is what a `verify:` line already is in
  TOUR-STANDARD, so it is not a new concept, only a new pane.
- **Tier 1, any project, one attribute.** Sprinkle `data-surface="ticket:refund-state"` into the
  markup and PANTRY injects grain's spotlight into the proxied page, so the tour can light elements
  by name. No GRAIN dependency and no build change. This tier is the reason the fallback is
  screenshots rather than CSS selectors: a selector-driven tour silently points at the wrong element
  after a refactor, and a review that looks right while being wrong is worse than no review.
- **Tier 2, GRAIN hosts.** The door as well, so a step can stage state through `field.set`, which is
  the prefill built in `crumb-prefilled-demo`.

**Screenshots are the durable record and the offline path, not the medium.** They are what makes a
review readable from a phone three days later, and what makes it survive the dev server being off.

## Drive at capture time, not at review time

For a non-GRAIN project the run drives the app e2e-style and captures states into
`artifacts/reviews/<id>/`. The review then reads. This is the important ordering and it is easy to
get backwards: a stale selector during capture fails loudly in the harness where a failure is a
signal, while a stale selector during review silently lights the wrong thing in front of the one
person who trusted it. GRAIN is the exception, because a `data-surface` address is a contract rather
than a guess, so live driving at review time is safe there.

## What is actually hard

**The proxy, and only the proxy.** Everything else is ordinary work. Two decisions make it much
smaller than it first looked, both from the fact that this is local-only development tooling:

- **Serve PANTRY's own UI under a reserved prefix and proxy everything else at the root.** No URL
  rewriting at all, because the app's root-relative URLs resolve exactly as they already do. The only
  injected byte is one script tag before the closing body tag.
- **Review a local production build, not the dev server.** No hot-reload websocket to pass through,
  no dev overlay, no dev-only headers. It is also the more honest thing to review, since it is what
  ships. Websocket passthrough can come later as an upgrade for anyone who wants `next dev`.

Content-Security-Policy is a non-issue for the same reason: we own the proxy, it is localhost, and
stripping a header on a dev preview has no threat model behind it.

**The one thing local-ness does not solve is auth cookies.** A project that sets cookies for its own
port will not see them through PANTRY's origin, so a logged-in session can vanish. Usually a
forwarded Set-Cookie away, but it is the thing most likely to make the first attempt look broken for
a reason unrelated to the proxy logic.

**What P0 found when it got there, since this paragraph half-predicted it.** Cookies were the easy
half: cookies ignore port, so a target on `localhost:3000` and PANTRY on `localhost:4400` are the
same cookie host and a login survives untouched. Two smaller things did bite, and both are the same
shape, PANTRY addressing the root it just gave away. A framework that builds an absolute redirect
from the upstream request sends the browser back to the raw target, off PANTRY's origin and out of
the review, so a Location on the target's own origin is rewritten to a path. And PANTRY's own
stylesheet loads its display font from `url("/fonts/...")`, which under the prefix is a request
fired at the reviewed app, so CSS is rebased alongside the HTML. Neither was visible by reading; the
browser walk found both.

## Security, stated rather than implied

The proxy fetches a URL and serves it same-origin, and the write-back accepts a POST and appends to
disk. Both are only safe because of what bounds them, so the bounds are part of the build and not a
later hardening pass:

- The preview target comes from config and never from the request. No open relay.
  **Amended after P0 was reviewed, because this bullet was true and the code still had the hole it
  was meant to prevent.** The target was read from config, and then the request's own pathname was
  concatenated onto it. A pathname beginning with a double slash resolves scheme-relative, so
  `//example.com/x` against the target origin became `http://example.com/x`, and the loopback check
  passed at boot while a request walked around it. The rule is therefore stated one level lower:
  the origin actually fetched is asserted to equal the configured target, every time, and the
  path is normalized before it is joined. A bullet about where a value comes from does not cover
  what a URL constructor does with it later.
- Loopback targets only, and the route is off unless a target is configured.
- The write-back refuses anything that is not a loopback request, caps the body, appends only, and
  writes to a path from config rather than one the client names.
- PANTRY keeps its promise not to mutate the plan corpus. It may append answers; it may never write
  `plans/*.md`, content, or code. That boundary is what made the read-only stance worth having, and
  it survives.

## Phases

- [x] **P0. The proxy.** Reserved prefix for PANTRY's own routes, everything else passed through at
      root, one injected script tag into HTML responses, target from config and off by default.
      Prove it on the portfolio first because it is a plain Bun server, then on a Next.js production
      build because that is the harder target and the one that generalises.
      **Done 2026-08-10** (`pantry/preview.ts`, `previewTarget` in the host config, PANTRY under
      `/__pantry`). Both targets walked in a browser: the portfolio and a Next 15 production build
      each came back byte-identical to a direct fetch apart from the 63-byte script tag, React
      hydrated through the proxy, and a cookie login survived the origin change. Report:
      `../pantry/artifacts/runs/2026-08-10-pantry-preview-proxy.md`.
- [x] **P1. The review surface.** PANTRY renders a tour file (importing `@tjakoen/crumb/core`, one
      parser, never a second) as chrome around the embed: step rail, the pane, the card.
      **Done 2026-08-10** at `/__pantry/review`, and with one correction to the shape above: PANTRY
      parses no tour at all. The rail reads the reviewed project's OWN manifest through the proxy at
      `/crumb/tours.json`, which keeps the "one parser, never a second" rule by having none rather
      than by having the right one, and means the shell needs no new config key. The card and the
      lamp stay CRUMB's, drawn inside the frame.
- [ ] **P2. The decision card and the write-back.** The option-ask card, and the append-only answer
      log that satisfies DECISIONS section 4. Half of the card already exists in crumb's prompt card
      and should move rather than be rewritten.
- [ ] **P3. The wait and the read on wake.** The session-side half: wait while awake, read on wake,
      and an entry that carries its own question. SESSION-LOOP section 1 already tells a session to
      look; this gives it something to find.
- [ ] **P4. Tier 1 on a non-GRAIN project.** Attributes into pocket-tickets, capture at run time,
      review at leisure. This is the phase that proves the whole thing is not portfolio-shaped.

## What this costs that nothing else here costs

PANTRY currently reads a repo. This makes it need to know how to **run** one, which is a bigger
install contract than reading files. A preview URL in config is the small version and where this
should start. If that key starts growing into a launcher, a process manager, or a build step, that is
the signal this went too far, and the honest retreat is back to committed screenshots, which need
none of it.

## Open, and genuinely not decided

- ~~Whether CRUMB's frame presentation should be deleted once PANTRY draws the chrome.~~ **Settled
  2026-08-10 by the owner: kept.** PANTRY draws the rail outside the frame and CRUMB keeps drawing
  the card and the lamp inside it. Nothing is deleted, the standalone path for a GRAIN host with no
  PANTRY alongside survives, and the duplication is two different jobs rather than two chromes: the
  rail says where you are in the walk, the card says what the step is.
- Whether PANTRY forcing a theme should reach the app it is reviewing. Same origin means one
  localStorage and both read GRAIN's keys, so today it does, and the review bar says so rather than
  leaving it to be discovered. Stopping it means PANTRY not using GRAIN's theme script unmodified,
  which is a fork, so it is a real trade and not an oversight.
- Whether the answer log lives per repo or once per machine. Per repo keeps it with the evidence;
  per machine means a session only ever watches one path.
- Whether a review can be walked against a deployed URL rather than localhost. Everything above
  assumes local, deliberately, and the security section is only sound under that assumption.
