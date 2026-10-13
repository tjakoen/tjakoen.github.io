# Builder field-map prompt experiment, October 14, 2026

I tested a shorter Builder prompt that named the destination field for intro descriptions and
requested card or callout phrases. It also told the model not to move wording between blocks. I ran
four briefs on the warm desktop WebGPU profile: the bakery baseline, two bike-shop phrasings, and the
pottery studio brief.

The reviewed composition passed all four scenarios after code reconciliation. That score measures
the guarded result, so I checked each raw model answer as well. The model still omitted the bakery's
city, put the bike-shop card wording in the wrong field or rewrote it, and added unsupported claims
such as exceptional service, a new-bike promise, high-quality clay, and workshop techniques. The
pottery answer retained the requested card phrase but added unsupported copy. These are the same
failure classes seen with the previous prompt. The experiment did not improve raw field placement or
grounding, so I restored the previous prompt and did not ship the candidate.

The [JSON capture](builder-field-map-prompt-experiment-2026-10-14.json) contains the exact candidate
prompt, raw answers, reviewed fields, and timings. The field map remains useful as application-owned
context, but prompt wording alone has not made this local model a dependable writer. The Builder
still needs visible review and source reconciliation, and raw writing reliability remains open.
