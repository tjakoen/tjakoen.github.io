---
title: GLOSSARY — the words this estate uses, so a session spends fewer tokens decoding them
summary: >
  The working vocabulary of the portfolio and the loop around it: desk, door, surface, intent,
  grade, grain, lane, envelope, brief, run report, handoff, claim. One line each, the word as it is
  used here rather than as the framework invented it, so a cold session can read a plan or a note
  without inferring the meaning from context.
when: >
  Read this BEFORE writing a plan, a note, a review or a handoff in this estate, and the moment a
  term in a ticket or a standard does not resolve in one read. It owns the shared vocabulary, not
  the process: LOOP, SESSION-LOOP and the standards they point at own what to do, and this file only
  says what the words mean. Don't skip because the term looks obvious - half of the estate's
  confusion is two people using one word for two things.
---

# GLOSSARY

The words below are the estate's, not a framework's. Each entry says what the word means here, and
where it is defined if the answer needs more than a line. When two standards disagree about a word,
the standard that owns the behaviour wins and this file changes.

## The loop

| Word | What it means here |
|---|---|
| **The loop** | The workflow that runs across every repository: start oriented, work under a plan, verify by second pass, close with evidence. [`LOOP.md`](LOOP.md) owns it. |
| **Session** | One run of one harness in one directory. Disposable. The repo is what survives. [`SESSION-LOOP.md`](SESSION-LOOP.md) owns the inside of one. |
| **Lane** | How much scrutiny a change earns, decided before the work starts: production, prototype or throwaway. [`INTAKE.md`](INTAKE.md) owns the envelope that carries it. |
| **Envelope** | The four answers a nontrivial brief gets before work: lane, scope cap, hard stops, ask-triggers, plus a finish line. |
| **Brief** | Anything a run says to the owner. It opens with the ask, numbers every step he runs, and links whatever renders. [`BRIEF.md`](BRIEF.md) owns the shape. |
| **Run report** | The committed record of one session's work: what changed, the gate output verbatim, what is unpushed, what needs human eyes. Lives in `artifacts/runs/`. |
| **Handoff** | A prompt for the next session, written so it survives a cold start. [`SESSION-LOOP.md`](SESSION-LOOP.md) section 5 owns what it carries. |
| **Second pass** | Verification by a reader who is not the writer. Not a re-read of your own diff. [`LOOP.md`](LOOP.md) owns it. |
| **Gate** | A command whose exit code decides whether work may land. A check that cannot fail is not a gate. |

## The portfolio's own vocabulary

| Word | What it means here |
|---|---|
| **Desk** | The site's shell: the app window, the rail, the status bar, the ⌘K search. One desk, every page. |
| **Door** | The one endpoint an AI operates the page through (`POST /intent`), the same one a person's click takes. There is no side channel. |
| **Surface** | An addressable region of a page an agent can operate, marked `data-surface`. Not every element is one. |
| **Intent** | The message a click or an AI decision sends through the door. A human click and an AI decision become the same thing. |
| **Verb** | The named action an intent carries (`chat.send`, `move:up`). Declared in the vocabulary, not invented per handler. |
| **Grade** | The visible signal for who acted: **grain** means the AI did it, clean means a person did. The styling follows the grade, never a per-component rule. |
| **GRAIN** | The design system and interaction layer that makes grade, surface and intent real. The stack is BATCH, GRAIN, MILL and PROOF. |
| **Track / tour** | A guided walk through a page, rendered by CRUMB. A review tour is the screenshots-and-steps artifact a UI change owes. |
| **Folded note** | A note whose content moved into a longer one, kept as a redirect so old links survive. |

## Work and ownership

| Word | What it means here |
|---|---|
| **Plan** | A Markdown file in `plans/` with frontmatter and a task list. PROOF renders the board; the files are the source of truth. |
| **Claim** | A session's temporary hold on a plan, so two sessions do not take the same work. Expires without a heartbeat. |
| **`waits:`** | The frontmatter line on a blocked plan that says what it waits on. PANTRY shows it to the owner. |
| **Decision** | A question that is the owner's to answer, with the options and a default. [`DECISIONS.md`](DECISIONS.md) owns which surface it goes on. |
| **Owner** | Tjakoen. The human whose answer a decision needs and whose name a published page carries. |
| **Company** | "Career Team", exactly, in anything public. Never the legal name and never a colleague's. |

## Models and routing

| Word | What it means here |
|---|---|
| **Registry** | `agent-config/shared/model-roles.json`: the only home of model identifiers, roles, tiers and prices. |
| **Tier** | Strong, execution or cheapest. A role sits on a tier; a session picks a tier, not a model name. |
| **Route check** | The script that answers which model a delegated task should use, with cooldowns, allowances and repository clearance. |
| **Clearance** | Whether a repository may be sent to a model that keeps prompts. Recorded once per repository, asked once. |
| **Escalation** | Spending real money because the plans are out. Never automatic; the owner's recorded approval is what allows it. |
| **Harness** | The program running the session: Claude Code, Codex, OpenCode or DSH. The loop is the same in all of them; the adapter differs. |

## Rules about words

- A term with a row above is written in lower case in prose unless it is a product name (GRAIN,
  PANTRY, MILL, BATCH, PROOF, CRUMB).
- If a new term enters the estate and a reader would have to infer it twice, it earns a row here in
  the same change that introduced it.
- A row that no longer matches the behaviour is worse than a missing row: fix it or delete it.
