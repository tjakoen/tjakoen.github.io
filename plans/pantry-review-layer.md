---
id: pantry-review-layer
status: doing
track: ai
depends: [crumb-prefilled-demo, agent-autonomy-tiers]
touches:
  - ../pantry/answers.ts
  - ../pantry/answers.test.ts
  - ../pantry/app.ts
  - ../pantry/cli.ts
  - ../pantry/config.ts
  - ../pantry/crumb-mount.test.ts
  - ../pantry/preview.test.ts
  - ../pantry/decisions.ts
  - ../pantry/doctor.ts
  - ../pantry/preview.ts
  - ../pantry/pantry-decisions.js
  - ../pantry/pantry-review-client.js
  - ../pantry/pantry-review.js
  - ../pantry/pantry.css
  - ../pantry/pantry-cmdk.js
  - ../pantry/pantry-map.js
  - ../pantry/INSTALL.md
  - content/tours/review-answer-channel.md
  - content/tours/review-tier1-nongrain.md
  - decisions/answers.jsonl
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
  **Amended after P2 was reviewed, and for the same reason the bullet above was.** "Caps the body"
  was true of what got written and false of what got read: the handler buffered the whole request and
  then measured it, so an oversized body was already in memory when the refusal was decided. The read
  now stops at the cap. The rule is therefore stated as the stronger thing it has to be: the bytes are
  never taken, not merely never used.
- PANTRY keeps its promise not to mutate the plan corpus. It may append answers; it may never write
  `plans/*.md`, content, or code. That boundary is what made the read-only stance worth having, and
  it survives.
  **Amended after P2 was reviewed.** The check written to enforce this refused markdown and nothing
  else, so a mistyped config key would have appended into a source file, a package manifest or a
  dotfile, all of which the sentence above names and none of which the code caught. "Everything
  except the corpus" is not a list anyone finishes writing. It is now an allowlist of two log
  extensions, plus a refusal to write through a symlink, because a name check is a string check and
  a link is exactly what makes a string check wrong.

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
- [x] **P2. The decision card and the write-back.** The option-ask card, and the append-only answer
      log that satisfies DECISIONS section 4. Half of the card already exists in crumb's prompt card
      and should move rather than be rewritten.
      **Done 2026-08-10.** The card did not move and should not have: CRUMB still draws it, and
      PANTRY's injected client reads it. `pantry/answers.ts` owns the log, one POST route owns the
      write, and both the decision inbox and the review rail write through it. Two surfaces, one path
      back, exactly as section 4 asks.
- [x] **P3. The wait and the read on wake.** The session-side half: wait while awake, read on wake,
      and an entry that carries its own question. SESSION-LOOP section 1 already tells a session to
      look; this gives it something to find.
      **Done 2026-08-10** as `pantry answers`, `answers wait`, `answers ack` and `answers record`.
      Built with P2 because neither is testable alone.
- [ ] **P4. Tier 1 on a non-GRAIN project.** Attributes into pocket-tickets, capture at run time,
      review at leisure. This is the phase that proves the whole thing is not portfolio-shaped.
  - [x] **P4a. PANTRY carries CRUMB instead of expecting it.** `@tjakoen/crumb` is a PANTRY
        dependency now, `createCrumbRoutes` is mounted at `/__pantry/crumb` over a new `toursDir`
        config key, and `crumb-live.js` + `crumb.css` are served as PANTRY's own assets.
        **Done 2026-08-10.** The one thing that needed a decision rather than plumbing: CRUMB's client
        carries a single absolute import, `/scripts/ai-spotlight.js`, because it is a host-served asset
        and cannot import a `.ts` sibling. On a GRAIN host that path is right. On a non-GRAIN target it
        is a request fired at the reviewed app for a file that app has never heard of, so PANTRY
        rebases it onto its own prefix — the same move P0 made for GRAIN's font `url()`, and the third
        time now that "PANTRY moved off the root, so PANTRY pays" has been the answer.
        A test reads the real package file and asserts that import is still the ONLY absolute one,
        because a rebase that moves one specifier by name stops being complete the day a second
        appears, and the symptom would be a 404 against the reviewed app rather than an error here.
  - [x] **P4b. The injection, and what it must not do twice.** A page with no CRUMB gets three tags
        rather than P0's one: the stylesheet, the prefix, the client.
        **Done 2026-08-10**, with two corrections to what was assumed.
        **The prefix is set by an inline script, not by rewriting `<html>`.** CRUMB reads
        `data-crumb-prefix` off the document element, and the obvious implementation edits that tag,
        which would have given the proxy a second insertion point and a second thing to get wrong.
        One insertion point, still immediately before `</body>`, and the deferred module reads the
        attribute the inline script set.
        **A page that already runs CRUMB gets nothing added, and that is decided per PAGE.** Two
        clients on one document drive the same `crumb:active` sessionStorage key from two places; the
        symptom is a tour that flickers between steps, which nobody traces back to a duplicated
        script tag. Per page rather than per boot because one route of a host can mount CRUMB and
        another not, and the config cannot know which.
        **A meta CSP is now stripped when PANTRY injects.** The response HEADER was already dropped in
        P0; the same policy in markup was not, and it blocks the inline prefix script specifically.
        The failure it produces is a tour that does not start with no failed request to point at.
  - [x] **P4c. The rail asks the project first and PANTRY second.** The manifest fetch was hardcoded
        at the project's `/crumb/tours.json`, which is exactly the portfolio-shaped assumption P4
        exists to break. **Done 2026-08-10.** The project still wins where it answers, because a GRAIN
        host owns its own tours and a copy carried by PANTRY would be a second source that disagrees
        the first time either is edited. The rail says whose tours it is showing when they are
        PANTRY's, because a reviewer who wants to edit a step will otherwise go looking in the
        project, and on Tier 1 the file is not there — it is in the repo running PANTRY, which is the
        whole arrangement that let the project stay untouched.
  - [ ] **P4d. Capture at run time.** The harness drives the app step by step, fails loudly on a
        surface that is not there, and writes the states into `artifacts/reviews/<id>/`.
  - [ ] **P4e. The proof, and the diff nobody applied yet.** A scratch Next app carrying real
        `data-surface` attributes, walked in a browser; and the attribute diff for ph-live handed
        over rather than committed — see the owner call below.
        **The walk is done 2026-08-10** against a Next 15.5 production build in `/tmp/tier1-proof`
        carrying five `data-surface` attributes and nothing else. All three steps of
        `content/tours/review-tier1-nongrain.md` resolved: the lamp landed on the list heading, then
        navigated a real route change and landed on the refund badge to within six pixels of its box,
        then moved to the total line without a reload; the decision card rendered both asks and the
        composed prompt, and PANTRY's injected client read it. Two defects found on the way, both
        recorded above.

## The owner call P4 was built around

**ph-live is the target, and nothing was written into it.** Asked on 2026-08-10 and answered: build
the whole PANTRY side, prove Tier 1 on a scratch app, hand over the attribute diff rather than commit
it. So the proof is a fixture and the real target is untouched, which is the right way round — the
attributes are the only thing Tier 1 asks a project for, and asking is the owner's to do.

Worth stating because the plan's own wording invited the wrong repo: two checkouts answer to
"pocket-tickets" on this machine, and the one the plan meant is `~/Local/Development/ph-live`
(remote `tjakoen/pocket-tickets`, a Next 15 app under `apps/web`, already carrying a
`pantry.config.json`). The other sits next to the employer repo that is off limits and is not part of
this estate.

**What the survey of it turned up, since that is the part the owner is being asked to decide on.**
Ten attributes proposed, on `pantry/artifacts/reviews/2026-08-10-tier1-nongrain/`. The route to walk
first is the create-event wizard's media step, because it is the work in flight, it is the only
wizard step that is real rather than a disabled preview, and it runs against a local production build
with no auth and no backend: the save degrades to an amber banner rather than throwing when the API
is unreachable, which makes it reviewable on a laptop with nothing else running.

Two things that would have bitten later. **The app already has its own `data-tour` convention** for an
internal tour engine, so `data-surface` arrives beside a thing that looks like it and is not; there
is no literal collision, and there is a real chance of someone conflating them. And the obvious
candidate for a shared attribute, the placeholder notice reused across six-plus routes, is exactly
the wrong one: a single address on a component that appears on many screens resolves to whichever
copy the query hits first, which is the selector-drift failure this plan rejected selectors to avoid,
arriving through an attribute instead.

## What P4's walk found that reading would not have

Both of these were invisible from the code, both were found by looking at the screen, and both have
the same shape: **the server was doing exactly what it was written to do, and the page was wrong.**

**A stylesheet served is not a stylesheet that applies.** `crumb.css` is written against GRAIN's token
vocabulary, so on a host that defines none of those names the card renders with no background, no
border and no radius: transparent text lying over the app. Every server-side check said the sheet was
served, 200, fourteen kilobytes. Then one level down, the same thing again and worse — the lamp's
geometry lives in GRAIN's `ai.css`, which nothing was serving at all, so the lamp was a static div in
the body flow two hundred pixels below the element it claimed to be lighting, while the card, the
step counter, the status badge and the navigation all looked correct. A tour that lights the wrong
place while reporting the right element is precisely the failure the plan's addressability argument
exists to prevent, arriving through the one door nobody had guarded.

The fix is one composed stylesheet, in cascade order, and the reason it is safe had to be checked
rather than assumed: all three files declare custom properties, `@font-face`, and rules scoped to
class and attribute names a foreign app does not use. That was then measured rather than argued — the
app's own computed styles and element geometry are identical served directly and served through
PANTRY with the tour layer injected.

**A production build's cache headers describe bytes nobody served.** A change to the injected block
did not appear in the browser, and the reason is that reviewing a production build — the deliberate
choice from P0 — means meeting a long `Cache-Control` and a strong `ETag`, both computed upstream and
both now lying about what went out. The page kept being served from cache with a previous run's
client in it, and revalidation agreed, because the target's bytes really had not changed. The symptom
is the worst available to a review: the reviewer is looking at an older build of the review layer and
nothing on screen says so. An injected response is `no-store` with its validators dropped now, and a
conditional request for a document is stripped on the way up so the target cannot answer 304 with no
body to inject into. Assets keep the caching the app shipped; only the page PANTRY changed pays.

## What P2 found that reading would not have

**A closed card is still a card.** CRUMB's popover is a `<dialog>`, and ending a tour closes it
rather than removing it, so the selector that finds the card kept finding one after the walk was
over, with the last answers still sitting in its fields. PANTRY would have offered to record an
answer to a tour nobody was on. The fix is to ask whether the dialog is open, and the reason it took
a walk to find is that every reading of the code says a card is present exactly when a tour is
running. The frame presentation has no such trap, because ending removes the element.

**A childList observer never sees a dialog close**, since `open` is an attribute. The same watcher
that missed it had been shipping since P1 for the fold control, which had the same lingering bug and
nobody had noticed, because a stale Fold button does nothing when clicked.

**The composed text is a contract worth keeping and the labels are not.** An answer is recorded with
the question read from the TOUR FILE and the choice read from the SCREEN. Scraping the label off the
card would agree with the file almost always, and the once it did not, the disagreement would land in
a log read by a session that can check neither.

**And eleven more from two independent reviewers who did not write it.** The count is not the point;
the shape is. Every one of them lived in a place the author had already written a confident sentence
about:

- **The refusal that protected one file type.** The check enforcing "never writes plan corpus"
  refused markdown and let `.ts`, `.json`, `.env` and extensionless paths through, so a mistyped
  config key would have appended into source. A denylist of what must not be written cannot be
  finished; it is an allowlist of two log extensions now. A symlink also walked straight past the
  name check, which is what a name check does.
- **The cap that measured instead of stopping.** The body was read whole and then compared to the
  cap, which caps what gets written and nothing else. The same mistake the proxy made about
  Content-Length in P0, made again one layer up, by the person who had written the P0 note.
- **The comment that named the bug it did not prevent.** The argument parser guessed whether a flag
  took a value by looking at the next token, and its own comment said "getting this wrong would make
  `pantry answers --json ack x` eat `ack`". It ate `ack`. Which flags take values is declared now,
  because arity cannot be inferred from an argument list.
- **A wait that could never end.** A non-numeric timeout became NaN, a NaN deadline is never past,
  and a NaN sleep returns instantly, so the command became a silent hot loop with no error and no
  exit. Found by a reviewer running it, not by reading it. This is the worst failure shape available
  to an unattended loop, and it was three characters of validation away.
- **A wait that could not see the answer.** It matched answers newer than the moment it started, so
  one given in the seconds before the session got round to waiting was invisible: the command blocked
  its full timeout and reported nothing while the list showed it unread. Unacked is the right test,
  since an ack is already the record of what has been consumed.
- **A retry that wrote twice.** Two asks, one POST fails, the reviewer presses the button again, and
  the ask that succeeded is appended a second time to a log with no way to retract it.

The count worth remembering is not eleven. It is that the walk found two, the reviewers found eleven,
and the author found none of the thirteen while writing them.

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
  **Narrowed by P4, in the half that turned out to be answerable.** For a NON-GRAIN target there is
  nothing to leak into: PANTRY now injects GRAIN's token sheet so its own card has tokens to read,
  and a token sheet is a set of names an app that never heard of GRAIN does not read. Measured rather
  than argued — the reviewed app's computed styles and element geometry are byte-identical served
  directly and served through PANTRY with the tour layer in it. The question survives only for a
  GRAIN target, which is the case where both ends really do read the same keys, and a GRAIN target is
  also the one PANTRY injects nothing into.
- ~~Whether the answer log lives per repo or once per machine.~~ **Settled 2026-08-10 by the owner:
  per repo, with the path in config.** The default sits beside the decision requests and rides the
  same git history as the change it unblocks; an absolute path outside the repo makes it per machine
  for anyone who wants that, and neither is a mode with its own code.
  **What building it changed about it.** The default was `answers.log` until the first write, when
  git ignored it: `*.log` is in this repo's .gitignore and in most others ever written. A per-repo
  log that git never sees gives up the whole reason for choosing per repo, so the default is
  `answers.jsonl`. The choice was the owner's; the extension was the part nobody could have decided
  in advance, because it only appears once a real repo ignores a real file.
- Whether a review can be walked against a deployed URL rather than localhost. Everything above
  assumes local, deliberately, and the security section is only sound under that assumption.
