---
title: DESIGN-STANDARD.md — design artifacts that stay true to the code
summary: The design standard - which planning artifacts a project keeps in its design folder (ERD, data dictionary, DFD, C4, user flows, wireframes, ADRs, traceability), the established method each one follows, which are generated from code and which are written by hand, when a plan owes one, and how tests close the loop. PANTRY renders the files; the files are the truth.
when: >
  Read this BEFORE adding a table, a column, a policy, a screen, a data flow or an integration, before
  choosing between two options for a project, and before writing or reviewing a plan in a project that
  has a design folder: ERD, data dictionary, DFD, C4, architecture diagram, user flow, wireframe, ADR,
  requirement, traceability, RLS test, Supabase schema, migration. Don't skip because the change is
  small - a new column with no dictionary entry is exactly how the design folder stops being true.
---

# Design artifacts that stay true to the code

A design folder is worth keeping only while it matches the system. A diagram drawn once at kickoff
is wrong by the third migration, and a wrong diagram is worse than none because people trust it.
So this standard does three things: it names a small set of artifacts, each following a method that
already has a name, it generates every artifact the code can produce, and it ties the rest to plans
and tests so that drift fails a check instead of waiting to be noticed.

> Split of responsibility: **this standard owns what the artifacts are and when they are owed.** The
> file format each one uses is fixed by the design format contract, which PANTRY builds its views
> and its alignment check against. The **design skill** owns the procedure (create, update, audit).
> **FIGURES** owns anything drawn for a published page.

## 1. The folder

Every project with a design keeps it in one folder at its root, named design. PANTRY renders it as
linked, interactive views, and never edits it: agents and people edit the files, and the files are
the only source of truth. A view that disagrees with its file is a PANTRY bug, never a reason to
change the file.

| File | Artifact | Method | Made by |
|---|---|---|---|
| design/erd.yaml | Entity relationship diagram | Crow's-foot notation | **Generated** from supabase/schemas |
| design/dictionary.yaml | Data dictionary | One entry per table and column, RLS per table | Columns generated, meaning and RLS by hand |
| design/dfd.yaml | Data flow diagram | Gane and Sarson, levels 0 and 1 | By hand |
| design/architecture.yaml | Architecture | C4, levels 1 (context) and 2 (containers) | By hand |
| design/flows/ | User flows, one file each | Steps of five kinds: start, action, decision, system, end | By hand |
| design/wireframes/ | Wireframes, one HTML file per screen | Low fidelity, clickable | By hand |
| design/decisions/ | Architecture decision records | Nygard format | By hand |
| design/requirements.yaml | Traceability | Requirement to artifact to test | By hand |

Every node in every file carries a stable id that is unique within its file. A reference to another
artifact names the file and the id, as in erd#records or flows/share-link#open, and a reference to a
test names its path and its name, separated by two colons. An id never changes once something points
at it; rename the label instead.

## 2. Each artifact and its method

### The ERD

Crow's-foot notation: entities with their columns and types, primary keys, and every foreign key
drawn as a relationship whose ends show zero, one or many. The ERD is **never drawn by hand.** The
design skill reads the declarative schema files and writes erd.yaml; PANTRY draws it. If the picture
is wrong, the schema is wrong, or the generator is, and that is where the fix goes.

### The data dictionary

One entry per table and per column, keyed by the same ids as the ERD. The column list and types are
generated, so they cannot drift; what a person adds is what the schema cannot say: what the column
means, who fills it, whether it holds personal information, and how long it is kept.

Each table also records its **row-level security**: every policy, in plain words (who can read,
insert, update, delete, and under what condition), and the test that proves it. A table with RLS
enabled and no recorded rule is incomplete. A rule with no named test is a claim.

### The DFD

Gane and Sarson notation: rounded processes, open-ended data stores, square external entities, and
named flows between them. Level 0 is the context diagram, one process for the whole system and the
externals it talks to. Level 1 opens that process into its main parts and the stores they share.
Deeper levels are rarely worth their upkeep; add one only when a level 1 process hides a flow a
reviewer has to see.

Every flow carries four facts besides its name:

- **data**: what moves, naming the dictionary columns where it can;
- **region**: where it is processed and stored (Canada, the US, a named provider region);
- **retention**: how long the receiving end keeps it;
- **purpose**: why it moves, in one sentence a client would accept.

Those four are what a privacy assessment asks for, so the DFD is the input to a privacy impact
assessment under Quebec's Law 25 and to a PIPEDA review, rather than a separate document written
from memory. Trust boundaries are drawn explicitly, and every flow that crosses one is walked through
STRIDE (spoofing, tampering, repudiation, information disclosure, denial of service, elevation of
privilege), with each threat either mitigated by a named control or accepted in an ADR.

### The architecture

C4, the first two levels only. Level 1 is the system in its context: the people who use it and the
external systems it depends on. Level 2 is its containers: the frontend, the database, the edge
functions, the storage buckets, the queues, each with its technology and what it talks to. Levels 3
and 4 are the code itself, and the code graph answers those questions better than a diagram.

### User flows

One file per flow, a sequence of steps, each of one kind: start, action, decision, system or end. A
decision step names its branches. Every step that a person sees names its screen, so the flow links
to its wireframe, and every step names the test that walks it, so the flow links to its proof.

### Wireframes

Low fidelity, in plain HTML, one file per screen: grey boxes, real labels, no colour or brand.
Links between screens carry the target screen's id, so a reviewer can click through a flow before
any component exists. Low fidelity is deliberate: it keeps the review on what the screen does and
where it leads, and it costs nothing to throw away. Visual design belongs up in GRAIN.

### ADRs

Nygard format: a title, a status, the context, the decision, and its consequences. The status is
proposed, accepted or superseded, and a superseded record names the one that replaced it. An ADR
is never edited to say something new once it is accepted; a new record supersedes it, so the history
of a choice stays readable. Each one is short; if the context runs past a screen, it is two choices.

### Traceability

requirements.yaml lists each requirement once: its id, its text, the plan that delivers it, the
artifacts that describe it, and the tests that prove it. It is the spine the other files hang from,
and it is the gate (section 5).

## 3. Generated, or written by hand

Generate everything the code already knows. Today that is the ERD and the column half of the
dictionary, both from the declarative schemas. Write by hand only what the code cannot say: meaning,
intent, privacy facts, flows of people, and the reasons behind a choice.

A generated file is never edited. Its header says so, and the alignment check fails when it is older
than any schema file it was generated from. A hand-written file is never regenerated over; the skill
merges generated columns into the dictionary and leaves every hand-written field alone.

## 4. When a plan owes an artifact

A plan lists the artifacts it creates or changes in its frontmatter, under design, as a list of
references:

```yaml
design: [erd#bookings, dictionary#bookings, flows/book-call, decisions/004-calendar-provider]
```

The field is optional for a plan that changes no design. It is owed when the plan does any of these:

| The plan… | It owes |
|---|---|
| adds or changes a table, a column or a policy | the regenerated ERD, and the dictionary entry with its RLS rules |
| adds a screen or changes where one leads | a wireframe and the user flow that reaches it |
| chooses between options someone could reasonably question | an ADR |
| adds a data flow, an external service or a new place data is stored | a DFD update with all four flow facts, and STRIDE if it crosses a trust boundary |
| adds a container or an external system | a C4 update |
| delivers a requirement | the requirement's line in requirements.yaml, with its tests |

A plan that touches supabase/schemas and names no ERD or dictionary reference fails the alignment
check. That is the rule people will want to skip, and it is the one that keeps the folder true.

## 5. Tests close the loop

Traceability is the gate. A plan is not done while one of its requirements has no test, or has a
test that is not passing. Line coverage is supporting evidence only: a high number says code ran,
not that the requirement holds, and it never stands in for a missing trace.

Three kinds of test carry the traces:

- **RLS tests in pgTAP**, run with supabase test db, one per policy recorded in the dictionary. Each
  one signs in as each role the policy names and asserts both sides: the row it may see, and the row
  it may not. A policy test that only checks the allowed side proves nothing about the boundary.
- **Unit and integration tests**, run with bun test, for logic outside the database.
- **End-to-end tests**, for the user flows, one per flow, walking the steps the flow names.

## 6. Supabase declarative schemas

The schema is declared, not migrated by hand. The desired state of the database lives in
supabase/schemas, one file per area, and the migration is generated from the difference:

```sh
supabase db diff -f <name>
```

Read the generated migration before committing it, because the diff tool writes what changed, not
what was meant. The schema files are what the ERD is generated from, so a change that skips them
leaves the ERD wrong even when the database is right.

Some changes the diff cannot express or gets wrong, and those still take a hand-written migration,
committed next to the schema change:

- **data changes**: inserts, updates, deletes and backfills (DML), including seed rows a feature
  needs in production;
- **renames**: a renamed column or table reads as a drop and a create, which loses the data;
- **some grants and revokes**, and changes to default privileges;
- **some view changes**, such as security_invoker and other view options, and views whose
  dependencies must be dropped and recreated in order;
- **some policy changes**, such as altering a policy in place rather than dropping and recreating it;
- **anything the diff tool lists as unsupported** in its current release: check its documentation,
  because the list shrinks.

A hand-written migration says in its first comment why the diff could not produce it.

## Rationalizations

| The excuse | The answer |
|---|---|
| The ERD is obvious from the schema. | It is, which is why it is generated rather than skipped. |
| It is one column. | One undocumented column at a time is how a dictionary stops being trusted. |
| The DFD is for big systems. | The privacy assessment is not optional, and the DFD is what it is written from. |
| We all agreed, an ADR is overhead. | The next person was not in the room. Five short sections cost less than the meeting it replaces. |
| Coverage is at ninety percent. | Coverage says code ran. Traceability says the requirement holds. |
| The diff handles migrations. | Not renames, not data, not every grant. Read the list in section 6. |

## Red flags

- erd.yaml edited by hand, or its recorded schema hash no longer matching the schema files.
- A table with RLS enabled and no rule in the dictionary, or a rule with no test.
- A flow crossing a trust boundary with no region, retention or purpose.
- An accepted ADR edited to say something new.
- A plan marked done with a requirement that has no passing test.
- A migration that renames a column with no hand-written step.

## Verification

- The design skill's audit mode reports no drift, quoted verbatim.
- PANTRY's alignment rows pass for the project.
- supabase test db and bun test output, verbatim, with the RLS tests named.
- Each plan that changed a design names it in its design field.
