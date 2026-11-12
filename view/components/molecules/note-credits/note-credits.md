# note-credits

The people and sources block at the end of a note. Each name links to its entry on /people and
each work to its card on /reading, so a reader who wants to know who someone is lands on the
site's own page first.

Emitted by `src/content.ts` (`renderNoteCredits`) for any `/notes` entry whose frontmatter lists
`people:` or `sources:`. Both are lists of slugs. A person's slug is the `id` of their entry in
`view/pages/people.html`, and a source's slug is the `id` of its card in `view/pages/reading.html`.
The name, role and title are read off those pages, so each lives in one place.

```yaml
people: [kercwin, matt-monroe]
sources: [book-loop-engineering]
```

`src/content.test.ts` fails a note that lists a slug neither page carries.
