---
id: mill-list-continuation
status: doing
track: ai
depends: []
touches:
  - package.json
  - mill-list-continuation.md
owner: human
---

# Every multi-line bullet on the published site is broken

Found 2026-08-10 while checking that a new figure rendered. It was not the figure. A list item whose
text wraps to a second line renders as a truncated item followed by an orphaned paragraph, on the
live site, and it has presumably been doing so since MILL started serving the standards.

## What it looks like

Source, ordinary Markdown with a two-space continuation:

```md
- **Scope cap** — the files or the area this run is allowed to touch. Growth past it is an ask-trigger, not
  a judgment call the run makes alone.
```

Rendered:

```html
<ul class="list"><li class="list__item"><strong>Scope cap</strong> — … is an ask-trigger, not</li></ul>
<p>a judgment call the run makes alone.</p>
```

The sentence is cut mid-clause, the list closes early, and the rest becomes a paragraph at the outer
indent. A reader sees a bullet that stops making sense followed by a stray line.

## The count, measured rather than guessed

Occurrences of `</li></ul><p>` on each rendered standards page, served locally from this repo:

| page | broken | page | broken |
|---|---|---|---|
| ai-development | 26 | note-standard | 9 |
| ai-repo-standard | 24 | graph | 8 |
| voice | 33 | tree | 8 |
| audit-standard | 18 | readme-standard | 5 |
| loop | 17 | conformance | 2 |
| session-loop | 14 | kickstart | 0 |
| figures | 10 | tour-standard | 0 |

174 across twelve of fourteen pages. The two clean pages are clean because their bullets happen to
fit on one line, not because they are written differently.

## Root cause

`mill/core/markdown.ts`, the list branch. It gathers only consecutive lines that match `LIST_ITEM`:

```ts
while (i < lines.length) {
  const m = lines[i].match(LIST_ITEM);
  if (!m || /\d/.test(m[1]) !== ordered) break;
  items.push(parseInline(m[2]));
  i++;
}
```

A continuation line does not match `LIST_ITEM`, so the loop breaks, the list node closes, and the
line falls through to the paragraph branch below it. That branch already does the right thing for
prose (`while … && !startsBlock(lines[i])` joins soft-wrapped lines with a space), which is what
makes this look like an oversight rather than a decision: the same file handles soft wrap correctly
one block type away.

MILL's header calls itself "a documented SUBSET, not CommonMark". That is fair, and it is not a
defence here. The subset claims to support lists, multi-line items are ordinary Markdown rather than
an exotic corner, and the failure is silent and visibly wrong rather than a graceful degradation.

## The fix, and why it is not in this commit

One loop, in another repo. MILL lives in `grain/packages/mill` since the fold-in, so the change is:
consume continuation lines into the current item until a blank line or the next block start, reusing
the same `startsBlock` test the paragraph branch uses. It wants a test per case: continuation,
continuation followed by a new item, continuation followed by a blank line, and a nested list, which
this parser does not support and should keep not supporting rather than half-supporting.

Then grain publishes and this repo bumps the pin, which is a hard stop under LOOP section 4b and the
owner's call, not a session's.

## Tasks

- [ ] Fix the list branch in `grain/packages/mill/core/markdown.ts` and add the four cases to
      `core/markdown.test.ts`.
- [ ] Publish grain, bump the pin here, and re-run the count above. The pass bar is zero
      `</li></ul><p>` across all fourteen standards pages.
- [x] Check the notes as well as the standards. They are rendered by the same engine and nobody had
      counted them. `ten-times-zero`, the flagship post, has **11**. `watch-its-hands` has none. So
      this is not a standards-only defect, it reaches the published writing, and the pass bar above
      covers the notes as well.
