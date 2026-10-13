# Builder grounded-sentence follow-up, October 14, 2026

## Finding

Six warm WebGPU draft scenarios passed their visible-copy checks after source reconciliation, but
the result could still read as a set of phrases separated by dots. The exact intro phrase in the
mixed-prohibition brief exposed this most clearly. The raw Qwen2.5-1.5B answers also continued to
invent details, move wording between fields, and add blocks the visitor had not requested.

## Change

When a brief names a page subject and location and explicitly states an intro description, the
reviewed intro now joins those supplied facts into a short sentence. The same rule handles a positive
exact phrase assigned to the intro. A separate welcome form joins the subject, location, and named
audience. These sentence forms use words from the brief with ordinary grammatical glue. The
negative-clause guard still filters prohibited wording before a phrase can be used.

The anchor fallback also drops a partial phrase when it overlaps a missing full name. This avoids
results such as “Hearth Bakery · Bakery in Utrecht” and restores the complete name and location
without repeating part of the name. Unrecognized request shapes continue through the existing source
phrase path; this is not a general natural-language writer or a claim checker.

## Live checks

Six warm scenarios on the local Qwen2.5-1.5B-Instruct-q4f16_1-MLC profile passed once each after
reconciliation. The set covered a bakery, two bike-shop phrasings, explicit negative instructions, a
mixed positive and negative brief, and a pottery studio. The reviewed results retained names,
locations, and requested phrases in their named fields. The welcome request produced “Hearth Bakery
in Utrecht welcomes neighbors.” The mixed-prohibition result in that six-case run still appeared as
a phrase list, so I added a separate regression and follow-up live check. The exact intro request then
produced “Hearth Bakery is a neighborhood bakery in Utrecht.” and excluded “award-winning,”
“certified,” “organic,” and “2019.” The final exact-phrase check passed 1/1.

The latest exact-phrase run also records the revised field explanation: the Builder says that the
sentence was composed from details in the brief, and the review reminds visitors that the check does
not verify claims. The raw model proposed organic bread in that run; the reviewed draft omitted it.

The raw answers remain unreliable. They invented details such as Sweden, Canada, an owner named
Sarah, opening hours, visitor counts, service claims, and locally sourced ingredients. They also
placed requested wording in the wrong field or omitted it. The audit scores the reviewed result
before acceptance and records the raw answer separately. These checks do not establish reliable raw
writing, broad semantic understanding, or factual verification.

The five-case baseline, six-case follow-up, and exact-phrase recheck are
[here](builder-reliability-varied-2026-10-14.json),
[here](builder-reliability-postfix-2026-10-14.json), and
[here](builder-exact-intro-phrase-2026-10-14.json). Local verification passed all 736 unit tests,
all 74 focused Builder browser cases, typecheck, the link check across 56 rendered files, and the
lint baseline at 4,479 against 4,491. The Builder's physical-phone cold start remains unmeasured.
