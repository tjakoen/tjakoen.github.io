# Builder model profile and raw output, October 14, 2026

The previous live JSON reports recorded the model as unspecified. They could not establish whether a
result came from the 0.5B desk profile or the larger Builder profile. I added the selected model ID
to non-visible page metadata and taught the live audit to record it with each scenario.

A warm WebGPU check identified the selected Builder profile as
Qwen2.5-1.5B-Instruct-q4f16_1-MLC. Its guarded workflow passed one bike-shop brief. The raw answer
claimed more than twenty years of service and promised reliable, affordable work, none of which the
brief supplied. It also rewrote the requested tune-up phrase as an invitation to choose an
“adventure.” Source reconciliation removed those claims and restored the requested wording to the
reviewed intro and card fields. The pass therefore verifies the review guard, while the raw answer
confirms that this profile still invents details and misses exact wording.

The [JSON capture](builder-model-profile-check-2026-10-14.json) records the selected model, prompt,
raw output, reviewed fields, and result. New live runs now carry the selected profile; earlier
reports remain unassigned and should not be attributed to a specific model after the fact.

After deployment, headless production checks selected the 0.5B profile at both 1280px and 390px.
The Builder disclosure appeared at both sizes, with no horizontal overflow or page errors. These
checks verify the deployed selector metadata and layout in Chromium; the emulated phone viewport does
not measure a handset's model capability, memory, download, or generation time.
