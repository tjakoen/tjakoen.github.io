# Builder zero-temperature check, October 14, 2026

## Question

Would deterministic sampling reduce unsupported additions in the raw Builder answer?

## Method

I temporarily changed structured completion temperature from 0.2 to 0.0, without changing the prompt,
model, schema, or source reconciliation. I ran the same six warm WebGPU Builder briefs against the
cached Qwen2.5-1.5B-Instruct-q4f16_1-MLC model. The source change was reverted after the run. This is
one six-brief run at each temperature, not a repeated sample that can establish a reliable rate.

## Result

All six reviewed drafts passed because source reconciliation retained the requested fields and
removed unsupported copy. The raw 0.0 answers still included invented details in the bike-shop and
pottery briefs. In the mixed-prohibition brief, the raw output included “organic” even though the
brief explicitly prohibited that claim; the source guard removed it from the reviewed result. The
negative-anchor case proposed three unrequested blocks, which the code removed.

This run does not show that temperature 0.0 improves raw-writing reliability. The original 0.2
setting was restored. The
[audit capture](builder-zero-temp-experiment-2026-10-14.json) preserves each raw answer and reviewed
field for inspection. Raw-writing reliability remains open.
