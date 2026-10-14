---
title: LOCAL-AI-STANDARD.md
summary: Choose, measure, and tune browser-local AI around real user tasks, with explicit limits and repeatable evidence.
when: >
  Read this before adding a browser-local model, changing its prompt or runtime settings, choosing a
  model profile, or claiming that a local AI feature works well. Use it to audit an existing feature
  before tuning it.
---

# Make browser-local AI earn its place

A local model is useful when it completes a real task better than a small deterministic rule, and
when it does so within the visitor's device, time, privacy, and reliability limits. Model size is one
input to that decision, not the measure of success. This standard is for projects that run inference
in the browser, including a portfolio with several different AI jobs.

## 1. Start from the visitor's task

List each user-visible AI task separately. “The assistant” is not one workload if it answers grounded
questions, summarizes a page, chooses a destination, and edits a document. Record the trigger, the
expected result, the data it may use, the action it may take, what the visitor sees, and what happens
when the model is unavailable or wrong.

Before assigning a model, ask whether the task needs one. Use ordinary code for exact matching,
fixed destinations, bounded choices, known form fields, simple validation, and actions that must be
reliable. Use a model where language understanding or generation adds value. A model can help select
among code-owned options without owning the options, permissions, or write path.

## 2. Keep each boundary legible

Separate the parts of the workflow so a failure points to the right fix:

1. **Inputs:** identify trusted application data, user text, retrieved content, and any untrusted
   instructions. Pass only the information needed for this task.
2. **Preparation:** retrieve relevant sources, enumerate valid targets, and bound the available
   context before generation.
3. **Inference:** give the model one task, a clear output shape, and only the context it needs.
4. **Validation:** parse and validate output in code. Reject unknown fields, destinations, actions,
   or values. Do not treat valid JSON as proof of a correct answer.
5. **Effect:** route changes through an explicit, tested application boundary. Ask for human review
   before consequential or hard-to-reverse changes.
6. **Presentation:** show the proposal, its status, and any uncertainty where the visitor can act on
   them. A failed or unavailable model must not make the rest of the product fail.

Keep secrets and private server data out of browser prompts. Explain the first-use model download and
where inference runs. “Local” describes where inference happens; it does not by itself prove that
downloads, application analytics, or other network requests are absent. Verify each claim against
the actual transport.

## 3. Build an evaluation from real tasks

Create a small, versioned scenario set from the phrases and content people actually use. Include:

- ordinary, ambiguous, and out-of-scope requests;
- paraphrases and a few held-out cases that were not used while tuning;
- missing, conflicting, or negative details when those matter to the feature;
- deterministic controls that should bypass inference;
- model unavailable, slow load, malformed output, and rejected-action cases.

Write the expected user-visible result before running the model. Grade the underlying outcome as well
as the text: the correct destination opened, the correct item changed, required facts survived, no
unsupported claim appeared, and an unsafe proposal was refused or left for review. Keep the raw
output with the result. A schema-valid response can still omit a required fact or invent a claim.

Repeat each important scenario enough to expose variation. Report each run and the aggregate; do not
turn one good sample into a reliability claim. Keep the baseline, scenario wording, grader, and
runtime fixed while comparing a change. Change one meaningful factor at a time, then run the same
cases and the held-out cases again. Restore changes that do not improve the target outcome without
damaging another task.

## 4. Tune the failing layer

Use the evidence to choose the smallest responsible change:

- Wrong or missing source material: fix retrieval, ranking, source quality, or context allocation.
- Correct context, unreliable response: simplify and order instructions around the task; reduce
  competing output requirements; measure decoding changes instead of assuming lower temperature is
  better.
- Wrong target or unsupported effect: move authority into deterministic code, closed sets, guards,
  and review steps. Do not try to prompt a small model into becoming a permission system.
- Explicit exclusions: enforce prohibited outputs in code as well as in the prompt. Test a negative
  request by itself, the same term inside quoted copy, and a later positive correction. A prompt that
  says “do not include this” does not prove that the result left it out.
- Valid structure, poor content: improve field-level grounding and review, or stop asking the model
  to write that content. A bounded output schema controls shape, not truth.
- Poor first-use experience: measure download time and size, show progress, cache safely, explain the
  cost, and leave the feature optional until the model is ready.
- Device failures: use conservative capability checks, keep a tested no-WebGPU path, and avoid
  loading a second model when one warm engine can serve the tasks.

Compare alternative model sizes only against the same task set and visitor-flow criteria. Count first
download cost, warm latency, memory, failures, and output quality together. A larger model is not an
upgrade if the additional cost does not improve the required outcomes on supported devices.

## 5. Measure the browser experience

Record the model identifier and quantization, runtime and browser versions, capability signals, prompt
and decoding settings, scenario-set revision, warm or cold state, load duration, generation duration,
and visible result. Keep timing claims tied to the machine and cache state that produced them.

Check a fresh profile and a warm profile. Check the browser with inference available and the product
when it is unavailable. Review the responsive UI at desktop and narrow phone widths, including loading,
progress, errors, review controls, and long output. Physical-device testing is a separate decision
when hardware-specific evidence is needed; responsive browser checks do not establish performance on
every phone.

## 6. Make the result reusable

Keep the task inventory, scenarios, runner, grader, and dated reports with the project that owns the
feature. Record what changed and why, including failed experiments that informed the choice. Keep
portable rules here; link to project evidence instead of copying its details into this standard.

### Review checklist

- [ ] Each model call maps to a named visitor task and expected outcome.
- [ ] Deterministic tasks bypass the model where that is simpler and more reliable.
- [ ] Inputs, valid outputs, effects, and human review boundaries are explicit.
- [ ] Scenario cases cover normal, ambiguous, negative, held-out, and failure behavior.
- [ ] Raw answers and visible outcomes are reviewed across repeated runs.
- [ ] Changes are compared against the same baseline and do not silently regress other tasks.
- [ ] Model size, download cost, latency, memory, and offline behavior are measured together.
- [ ] Claims about local execution and privacy match the inspected network path.
- [ ] Desktop and narrow-phone browser layouts keep status and review controls usable.
- [ ] The project's own plan records the remaining limits and links to the evidence.
