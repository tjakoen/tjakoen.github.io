// portfolio/ai/form-draft.test.ts — draftFieldValues never touches a choice, only ever drafts a
// value for a name in the closed set, and is reproducible (the same fields draft the same values).
import { test, expect, describe } from "bun:test";
import { matchSpec } from "./field-matcher.ts";
import { draftFieldValues } from "./form-draft.ts";

describe("draftFieldValues", () => {
  test("drafts one value per matched TEXT field, keyed by its exact surface", () => {
    const spec = matchSpec("name, email, phone, company, role, subject, website, budget");
    const values = draftFieldValues(spec.fields);

    expect(Object.keys(values).sort()).toEqual(
      [
        "field:builder-name", "field:builder-email", "field:builder-phone", "field:builder-company",
        "field:builder-role", "field:builder-subject", "field:builder-website", "field:builder-budget",
      ].sort(),
    );
    for (const v of Object.values(values)) expect(v.length).toBeGreaterThan(0);
  });

  test("never drafts a value for a choice — only spec.fields is a valid input", () => {
    const spec = matchSpec("name, email, topic, contact method, timeline");
    const values = draftFieldValues(spec.fields);   // the caller passes fields, never choices

    expect(Object.keys(values)).toEqual(["field:builder-name", "field:builder-email"]);
    expect(values["field:builder-topic"]).toBeUndefined();
    expect(values["field:builder-contact-method"]).toBeUndefined();
    expect(values["field:builder-timeline"]).toBeUndefined();
  });

  test("no fields in, nothing out", () => {
    expect(draftFieldValues([])).toEqual({});
  });

  test("reproducible: the same field list drafts the same values every time", () => {
    const spec = matchSpec("name and email");
    expect(draftFieldValues(spec.fields)).toEqual(draftFieldValues(spec.fields));
  });
});
