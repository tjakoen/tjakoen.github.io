// portfolio/ai/field-matcher.test.ts — pins the closed-set contract matchSpec/applyWording promise:
// a description picks from a fixed list of fields and choices, never invents one, and the model's
// only seam (applyWording) can reword a label or placeholder and nothing structural.
import { test, expect, describe } from "bun:test";
import { matchSpec, applyWording, type FieldSpec } from "./field-matcher.ts";

describe("matchSpec: realistic description", () => {
  test("name, email, and what they want to talk about -> name + email fields, topic choice", () => {
    const spec = matchSpec("a contact form with a name, an email and what they want to talk about");

    expect(spec.fields.map((f) => f.name)).toEqual(["name", "email"]);
    expect(spec.fields.map((f) => f.surface)).toEqual(["field:builder-name", "field:builder-email"]);

    expect(spec.choices.map((c) => c.name)).toEqual(["topic"]);
    expect(spec.choices[0]!.surface).toBe("field:builder-topic");
    expect(spec.choices[0]!.options.map((o) => o.value)).toEqual(["grain", "batch", "hiring", "teaching", "other"]);

    expect(spec.unsupported).toEqual([]);
  });
});

describe("matchSpec: every emitted item carries the full key set", () => {
  test("field items: every key present, required only 'required'/null", () => {
    const spec = matchSpec("name, email, phone, company, role, subject, website, budget");
    expect(spec.fields.length).toBe(8);
    for (const f of spec.fields) {
      expect(Object.keys(f).sort()).toEqual(["label", "name", "placeholder", "required", "surface", "type", "value"].sort());
      expect(f.value).toBeNull();
      expect(f.required === "required" || f.required === null).toBe(true);
    }
    // name + email are the two defaults required; everything else is optional.
    const requiredNames = spec.fields.filter((f) => f.required === "required").map((f) => f.name);
    expect(requiredNames).toEqual(["name", "email"]);
  });

  test("choice items: every key present, every option's selected only 'selected'/null, exactly one selected", () => {
    const spec = matchSpec("topic, contact method, timeline");
    expect(spec.choices.length).toBe(3);
    for (const c of spec.choices) {
      expect(Object.keys(c).sort()).toEqual(["label", "name", "options", "surface"].sort());
      const selectedFlags = c.options.map((o) => o.selected);
      for (const s of selectedFlags) expect(s === "selected" || s === null).toBe(true);
      expect(selectedFlags.filter((s) => s === "selected").length).toBe(1);
      for (const o of c.options) {
        expect(Object.keys(o).sort()).toEqual(["label", "selected", "value"].sort());
      }
    }
  });
});

describe("matchSpec: output order is declaration order", () => {
  test("fields come back in table order regardless of the order words appear in the description", () => {
    const spec = matchSpec("budget, website, subject, role, company, phone, email, name");
    expect(spec.fields.map((f) => f.name)).toEqual([
      "name",
      "email",
      "phone",
      "company",
      "role",
      "subject",
      "website",
      "budget",
    ]);
  });

  test("choices come back in table order too", () => {
    const spec = matchSpec("timeline, contact method, topic");
    expect(spec.choices.map((c) => c.name)).toEqual(["topic", "contact-method", "timeline"]);
  });
});

describe("matchSpec: dedup", () => {
  test("a name mentioned three times yields one field", () => {
    const spec = matchSpec("name, name, your name please, full name too");
    expect(spec.fields.map((f) => f.name)).toEqual(["name"]);
  });
});

describe("matchSpec: unsupported", () => {
  test("a message box is refused, not rendered as a field", () => {
    const spec = matchSpec("a contact form with a name, an email, and a big message box for details");
    expect(spec.fields.map((f) => f.name)).toEqual(["name", "email"]);
    expect(spec.fields.some((f) => f.name === "message")).toBe(false);
    expect(spec.unsupported).toEqual([
      {
        token: "message",
        reason:
          "no textarea atom exists yet, and grain's .field frame has no textarea rule, so a long message would " +
          "have to render as a single-line text input that truncates whatever gets typed into it.",
      },
    ]);
  });

  test("a file upload ask is refused too, and both refusals can appear together", () => {
    const spec = matchSpec("name, email, a message box, and let them attach a file");
    expect(spec.unsupported.map((u) => u.token)).toEqual(["message", "file upload"]);
  });
});

describe("matchSpec: empty or nonsense input", () => {
  test("empty string yields empty everything", () => {
    const spec = matchSpec("");
    expect(spec).toEqual({ fields: [], choices: [], unsupported: [] });
  });

  test("nonsense unrelated text yields empty everything, never a guessed default form", () => {
    const spec = matchSpec("quantum physics and a haiku about the weather");
    expect(spec).toEqual({ fields: [], choices: [], unsupported: [] });
  });
});

describe("matchSpec: surfaces are unique across the whole spec", () => {
  test("every field + choice surface is distinct", () => {
    const spec = matchSpec(
      "name, email, phone, company, role, subject, website, budget, topic, contact method, timeline",
    );
    const surfaces = [...spec.fields.map((f) => f.surface), ...spec.choices.map((c) => c.surface)];
    expect(new Set(surfaces).size).toBe(surfaces.length);
    expect(surfaces.length).toBe(11);
  });
});

describe("applyWording", () => {
  const base = (): FieldSpec => matchSpec("name, email, topic");

  test("replaces a field's label and placeholder", () => {
    const spec = base();
    const out = applyWording(spec, { name: { label: "What should we call you?", placeholder: "First name is fine" } });
    const name = out.fields.find((f) => f.name === "name")!;
    expect(name.label).toBe("What should we call you?");
    expect(name.placeholder).toBe("First name is fine");
  });

  test("replaces a choice's label", () => {
    const spec = base();
    const out = applyWording(spec, { topic: { label: "What's this about?" } });
    const topic = out.choices.find((c) => c.name === "topic")!;
    expect(topic.label).toBe("What's this about?");
  });

  test("cannot change surface, name, type, required, or the item list", () => {
    const spec = base();
    const out = applyWording(spec, {
      name: { label: "Renamed" },
      // @ts-expect-error — wording is only allowed to carry label/placeholder; this exercises the
      // runtime guarantee that even a caller who bypasses the type system can't smuggle a structural
      // change through.
      email: { surface: "field:builder-hacked", name: "hacked", type: "hidden", required: false },
    });
    expect(out.fields.map((f) => f.name)).toEqual(spec.fields.map((f) => f.name));
    expect(out.fields.map((f) => f.surface)).toEqual(spec.fields.map((f) => f.surface));
    const email = out.fields.find((f) => f.name === "email")!;
    expect(email.surface).toBe("field:builder-email");
    expect(email.type).toBe("email");
    expect(email.required).toBe("required");
  });

  test("a wording entry for an unknown key is ignored", () => {
    const spec = base();
    const out = applyWording(spec, { doesNotExist: { label: "Whatever" } });
    expect(out).toEqual(spec);
  });

  test("a hostile label (newlines, control chars) is sanitized rather than passed through", () => {
    const spec = base();
    const out = applyWording(spec, { name: { label: "Your\nname\t\x00here" } });
    const name = out.fields.find((f) => f.name === "name")!;
    expect(name.label).toBe("Your name here");
  });

  test("an overlong label is capped, not truncated mid-render into garbage length", () => {
    const spec = base();
    const long = "x".repeat(500);
    const out = applyWording(spec, { name: { label: long } });
    const name = out.fields.find((f) => f.name === "name")!;
    expect(name.label.length).toBeLessThanOrEqual(60);
  });

  test("an empty-after-cleaning label degrades to the deterministic default, never an empty label", () => {
    const spec = base();
    const out = applyWording(spec, { name: { label: "   \n\t  " } });
    const name = out.fields.find((f) => f.name === "name")!;
    const original = spec.fields.find((f) => f.name === "name")!;
    expect(name.label).toBe(original.label);
    expect(name.label.length).toBeGreaterThan(0);
  });

  test("a literal empty string also degrades to the default", () => {
    const spec = base();
    const out = applyWording(spec, { name: { label: "" } });
    const name = out.fields.find((f) => f.name === "name")!;
    expect(name.label).toBe(spec.fields.find((f) => f.name === "name")!.label);
  });

  test("returns a new object and does not mutate the input", () => {
    const spec = base();
    const snapshot = JSON.parse(JSON.stringify(spec));
    const out = applyWording(spec, { name: { label: "Changed" } });
    expect(spec).toEqual(snapshot);
    expect(out).not.toBe(spec);
    expect(out.fields).not.toBe(spec.fields);
  });
});
