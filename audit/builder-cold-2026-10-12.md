# Builder cold download, October 12, 2026

The larger Builder model transferred about 875 MB of model assets in a fresh Chromium profile.
The draft retained the visitor's supplied facts but added claims the visitor had not supplied.
This measurement closes the desktop download-size question. It does not establish dependable
writing or performance on phone hardware.

## Method

I opened the current local portfolio in Playwright's full Chromium channel with WebGPU enabled.
The browser used a new persistent profile, and Chrome DevTools Protocol network capture started
before the Builder page opened. I submitted the brief through the visible composer and observed
its status every ten seconds. The profile selected Qwen2.5-1.5B-Instruct-q4f16_1-MLC.

The capture includes all 30 weight shards listed in the model's pinned ndarray-cache index at
commit 9bd564b064631febf14deadcac492efb761d60c3. Every recorded model response was uncached and
returned HTTP 200. The transfer total includes the weight shards, tokenizer, configuration,
weight index, and compiled WebGPU library. WebLLM's JavaScript runtime is reported separately.
The accompanying [JSON record](builder-cold-2026-10-12.json) retains the per-file encoded transfer
sizes and strips CDN query strings.

| Measurement | Bytes |
| --- | ---: |
| Declared weight-shard body sizes | 868,547,584 |
| Chromium encoded transfer for all model assets | 875,219,838 |
| WebLLM JavaScript runtime | 1,661,197 |
| Model assets plus runtime | 876,881,035 |

The encoded transfer measurement comes from Network.loadingFinished. It is a browser transfer
measurement, not a disk footprint or an exact count of network packets. The public notice rounds
model assets to about 875 MB. The smaller profile's 350 MB notice remains an estimate.

## Brief and result

The submitted brief was:

> Build a landing page for Hearth Bakery in Utrecht. Add an intro that says it is a neighborhood
> bakery, then a card titled Sourdough with the words baked fresh each morning.

The page composed a lede and a card. The visible draft was:

> Hearth Bakery is a neighborhood bakery in Utrecht, known for its fresh, artisanal bread.
>
> Sourdough
>
> Baked fresh each morning, our sourdough is a staple of our bakery.

The supplied name, city, bakery description, product title, and requested product wording survived.
The claims about artisanal bread and a staple product were invented. The page reported that the
model composed the result. The draft was visible at the 60,046-millisecond observation after
submission; the preceding observation was at about 50 seconds, so this is a sampled interval
rather than an exact generation time. Loading and generation are both included.

Grounded writing, repeated edit reliability, and actual phone cold-start measurements remain open
in the [Builder plan](/plans/plan/builder-ai-depth).
