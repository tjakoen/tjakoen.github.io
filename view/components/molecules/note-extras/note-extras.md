# note-extras

The small furniture a note page carries around its body. Everything here is emitted by
`src/content.ts`, so there is no template to compose by hand.

- **The draft banner** sits at the top of every page under `/drafts`, the unlisted section that
  serves notes whose `status` is `DRAFT`. It says the note is unfinished and asks the reader not
  to pass it on.
- **The edited line** sits under the masthead when a note's frontmatter carries `updated:` with a
  day later than `date:`.
- **The changelog** sits at the foot when the frontmatter carries `changelog:`.
- **The Share tab** sits beside Rendered and Source on a published note and opens a dialog with the
  note's address and a copy button.

```yaml
updated: 2026-11-12
changelog:
  - "2026-11-12 | What changed, in a sentence a returning reader can act on."
```

`updated` and `changelog` are for major changes only. NOTE-STANDARD says which changes count.
