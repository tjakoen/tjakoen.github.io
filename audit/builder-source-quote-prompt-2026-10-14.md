# Builder source-quote prompt check, October 14, 2026

## Question

Would a more explicit instruction to quote only exact, contiguous source phrases reduce unsupported
copy in the Builder's raw model answer?

## Method

I added a temporary rule to the structured build prompt asking the model to use exact phrases from the
visitor's brief and omit unsupported fields. I ran the same six warm WebGPU Builder scenarios used in
the October 14 reliability follow-up with Qwen2.5-1.5B-Instruct-q4f16_1-MLC. The browser audit records
the raw model answer separately from the reviewed draft. I compared the new captures with the earlier
six-case run. The outputs are not paired deterministic samples, so this comparison can identify
whether the failure recurred, but it cannot measure a statistically reliable change in rate.

## Result

The guarded draft passed all six scenarios. The raw answer still added unsupported details in the
bakery, bike-shop, and pottery briefs. Examples included fresh-bread claims, a Sweden location, years
of experience, and claims about handcrafted pottery. One mixed-prohibition answer was shorter, but
the result does not establish that the prompt change caused that difference.

The visitor-facing result passed because the existing source reconciler removed or replaced the
unsupported wording. The raw-output requirement therefore remains open. The temporary prompt rule
was removed because this single warm run did not demonstrate a reliable improvement. The complete
machine-readable output, including the raw answers and the final reviewed fields, is in the
[audit capture](builder-source-quote-prompt-2026-10-14.json).

The comparison supports the current product boundary: keep showing reviewed copy and its evidence,
and do not present a guarded-draft pass as proof that the model writes reliably. A future model or
prompt change needs repeated raw-output checks across different briefs before it can close that item.
