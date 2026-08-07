---
title: GRAPH.md — navigate the code by graph, not by fan-out
summary: The retrieval standard - ask the code graph a scoped question before you fan out grep, reads, and subagents. A small structured answer instead of a pile of files, and a free hook that keeps the graph honest.
when: >
  Read this BEFORE answering any question about code by searching - "where is X", "what calls Y",
  "how does Z connect to W", "find all uses of", "map this directory" - and before firing a wide
  grep, reading a file whole, or spawning a search subagent. Don't skip because grep feels faster or
  because you assume the graph is stale: a stale graph is one command to refresh, and the fan-out you
  were about to do costs more than checking.
---

# Navigate the code by graph, not by fan-out

The standard for the cheapest way to answer a question about code: **ask the graph first.** Before an
agent (or a person) fans out a wide grep, reads five files whole, or spawns a search subagent to answer
"where is X", "what calls Y", "how does Z connect to W", it queries a precomputed code graph and gets back
a small, scoped subgraph instead of a pile of raw source. The point is retrieval discipline: pull the
few nodes the question needs, not the whole neighbourhood, so the context window holds signal instead of
scroll.

> Split of responsibility: **[`SESSION-LOOP.md`](SESSION-LOOP.md) owns model economy** (which brain runs
> which step, §6) and **[`LOOP.md`](LOOP.md) owns the mechanical heartbeat** (what fires on push and at
> session start). This file owns one narrow thing they both lean on: *how a code question is answered
> without burning the window.* When they overlap, defer to them on cadence and model choice; this file
> wins only on "reach for the graph before you reach for grep."

**The architecture in one line:** the graph is a committed-tool artifact built from the code by static
analysis (no model, no API cost), refreshed on every edit by a hook, and queried by symbol name. It is a
retrieval index, not a source of truth: the code is the truth, the graph is the fast way in.

---

## 1. The rule (graph-first for structural questions)

Any question about *structure* goes to the graph before it goes to fan-out. Structural means: where a
symbol is defined, what calls or imports it, the shortest path between two parts of the system, which
files cluster together, what the load-bearing hubs are. For those, a graph query returns a handful of
`file:line` nodes and the edges between them. The alternatives cost far more window:

| Question | Fan-out cost | Graph cost |
|---|---|---|
| "Where is this wired, what touches it" | Wide grep, then read several files whole | One query, a scoped subgraph of `file:line` nodes |
| "How does A reach B" | Read the call chain by hand across files | One shortest-path query |
| "What are the core abstractions here" | Read the whole tree to build a mental map | The graph's hub and community summary |

The win is not that grep is slow, it is that grep hands back *everything that matched* and the reader
pays window for all of it. The graph hands back *the few nodes that answer the question* and the reader
pays for those. On a large repo that is the difference between a readable answer and a scrolled one.

---

## 2. Query by symbol, not by prose (the empirical rule)

The one operating lesson, learned the hard way: **query with names the code actually contains, not with
an English description of the concept.** A symbol or filename lands on the right nodes; a fuzzy phrase
lands on documentation headings and misses the code entirely.

- Good: the function, type, file, or route name. It resolves to real `file:line` nodes and their edges.
- Poor: "how does the login flow sanitise input". The phrase matches prose, not symbols, and returns
  section titles instead of the handler you wanted.

If you only know the concept and not the name, spend one cheap read to *find* a name (a route string, an
exported function), then let the graph expand from it. Seed with a symbol; let the graph do the reach.

---

## 3. Keep it fresh, for free (the hook)

A stale graph is worse than none: it answers confidently about code that moved. Two rules keep it honest.

**Refresh on every edit, mechanically.** Each repo carries a `PostToolUse` hook in `.claude/settings.json`
that re-extracts the graph after any file edit. The extraction is static analysis only, so it costs no
tokens and no API call and finishes in about a second. The hook is guarded: if the tool is not installed
it is a silent no-op, so the repo stays portable.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "command -v graphify >/dev/null 2>&1 && nohup graphify update \"$CLAUDE_PROJECT_DIR\" >/dev/null 2>&1 &"
          }
        ]
      }
    ]
  }
}
```

**Never commit the artifact.** The generated graph output directory is git-ignored in every repo. It is a
derived index, rebuilt on demand from the code; committing it would be committing a photograph of a moving
thing, and the merge conflicts alone would earn their own standard. The tool, the hook, and this rule are
what travel between repos; the graph itself is always local and always freshly built.

---

## 4. When not to reach for it (honest limits)

The graph is a structural index, and outside that job it earns nothing.

- **Prose and intent questions.** "Why was this decided" lives in `docs/`, `decisions/`, and the commit
  history, not in a call graph. Reach for those.
- **Tiny repos.** A few hundred lines is faster to read whole than to index. The graph pays off when the
  tree is large enough that a mental map costs real reading.
- **Semantic freshness on non-code files.** The free refresh re-extracts *code*. Doc and image changes
  need a fuller rebuild, which is a deliberate, occasional step, not the per-edit hook.
- **Trusting it as truth.** Inferred edges carry a confidence score and can be wrong; isolated nodes may
  mean a real gap or just a missing edge. Treat a graph answer as a strong lead to verify in the source,
  never as the last word. The code is the truth.

If the question is not structural, or the repo is small, skip the graph and read. Retrieval discipline
means picking the cheapest tool that answers *this* question, and sometimes that tool is your eyes.

---

## 5. Rationalizations (what talks a session out of asking first)

| Rationalization | Reality |
|---|---|
| "Grep is faster." | Faster to type, not faster to answer. Grep hands back matches and you read files to turn them into an answer; the graph hands back the answer. Count the reads, not the keystrokes. |
| "The graph is probably stale." | Refreshing is one command and the hook has usually already done it. Assuming staleness to justify a fan-out costs more than checking would have. |
| "It's one file, I know where it is." | Then the question was not structural and this standard does not apply. If you are about to grep for callers, it was. |
| "I'll grep first and fall back to the graph." | That is the fan-out this file exists to prevent, run in full before the cheap step. Reverse the order. |
| "The graph won't understand this framework's magic." | Often true, which is why a graph answer is a lead to verify in source (§4). A partial lead still beats a blank page. |
| "It's a small repo." | Then §4 already excused you. Say that is the reason, instead of reaching for one of the rows above. |

---

## 6. Red flags

- Three or more greps fired before any graph query.
- A query written as an English sentence instead of seeded with symbol and file names (§2).
- A whole file read to find one caller.
- A graph answer treated as the last word with no source opened.
- A search subagent spawned for a question the graph answers structurally.
- The graph report generated in every repo and read in none.
- The graph refreshed twice with no edits in between.

---

## 7. Verification (per question, not per repo)

Evidence-shaped, so the answer can be audited rather than taken on trust.

- [ ] The query that was run is quoted, with the symbols it was seeded with (§2).
- [ ] What came back is recorded as the nodes and edges it named, not paraphrased as "nothing much".
- [ ] Anything acted on cites the file and line where it was confirmed in source (§4).
- [ ] If grep, a whole-file read, or a search subagent ran, the notes say what the graph returned
      first and why that was not enough.
- [ ] `git status` shows nothing from the graph output directory staged.

---

## 8. Adoption checklist

Mirrors the shape in [`AI-REPO-STANDARD.md`](AI-REPO-STANDARD.md): one small kit addition per repo.

Day one (a few minutes):

- [ ] Add the `PostToolUse` hook from §3 to the repo's `.claude/settings.json` (merge it in if the file
      already has hooks, do not clobber existing ones).
- [ ] Confirm the graph output directory is git-ignored.
- [ ] Build the graph once so day-one queries work. The same refresh command bootstraps from nothing.

Steady state is §7: that checklist runs per question, and it is the whole of what "adopted" means
here. Nothing to add per repo once the hook is in.

The proof that this landed: an agent answering "what touches this" pulls back five nodes and a diagram
instead of five files and a scroll, and the window it saved goes to the actual work.

---

*Living document. When the retrieval workflow changes, update this file. The graph tooling is a means,
not the point: if a better index arrives, this standard describes the discipline, and the tool is swapped
underneath it.*
