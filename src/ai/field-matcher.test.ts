// portfolio/ai/field-matcher.test.ts — pins the closed-set contract matchSpec/applyWording promise:
// a description picks from a fixed list of fields, message boxes and choices, never invents one, and
// the model's only seam (applyWording) can reword a label or placeholder and nothing structural.
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
      expect(Object.keys(f).sort()).toEqual(["error", "hint", "label", "name", "placeholder", "required", "surface", "type", "value"].sort());
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
      expect(Object.keys(c).sort()).toEqual(["error", "hint", "label", "name", "options", "surface"].sort());
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

describe("matchSpec: the message box", () => {
  // This ask was a REFUSAL until 2026-08-13, when grain gained b-textarea and b-memo. It renders now,
  // and it renders as its own kind rather than as a text field, because a component cannot choose
  // which component it is: a message goes through b-memo, a field through b-field.
  test("a message box renders, as a message and never as a text field", () => {
    const spec = matchSpec("a contact form with a name, an email, and a big message box for details");
    expect(spec.fields.map((f) => f.name)).toEqual(["name", "email"]);
    expect(spec.fields.some((f) => f.name === "message")).toBe(false);
    expect(spec.messages.map((m) => m.name)).toEqual(["message"]);
    expect(spec.messages[0]!.surface).toBe("field:builder-message");
    expect(spec.unsupported).toEqual([]);
  });

  test("message items: every key present, no type key, never required", () => {
    const spec = matchSpec("a message box");
    expect(spec.messages.length).toBe(1);
    for (const m of spec.messages) {
      expect(Object.keys(m).sort()).toEqual(["error", "hint", "label", "name", "placeholder", "required", "surface", "value"].sort());
      expect(m.value).toBeNull();
      expect(m.required).toBeNull();
    }
  });

  test("one message however many of its phrases hit", () => {
    const spec = matchSpec("a message box, a comments box, and space to write a long message");
    expect(spec.messages.map((m) => m.name)).toEqual(["message"]);
  });
});

describe("matchSpec: unsupported", () => {
  test("a file upload is still refused, and it is the only refusal left", () => {
    const spec = matchSpec("name, email, a message box, and let them attach a file");
    expect(spec.messages.map((m) => m.name)).toEqual(["message"]);
    expect(spec.unsupported.map((u) => u.token)).toEqual(["file upload"]);
    expect(spec.unsupported[0]!.reason).toContain("no file-input atom is built yet");
  });
});

describe("matchSpec: empty or nonsense input", () => {
  test("empty string yields empty everything", () => {
    const spec = matchSpec("");
    expect(spec).toEqual({ fields: [], choices: [], messages: [], checks: [], unsupported: [] });
  });

  test("nonsense unrelated text yields empty everything, never a guessed default form", () => {
    const spec = matchSpec("quantum physics and a haiku about the weather");
    expect(spec).toEqual({ fields: [], choices: [], messages: [], checks: [], unsupported: [] });
  });
});

describe("matchSpec: surfaces are unique across the whole spec", () => {
  test("every field + message + choice + tick box surface is distinct", () => {
    const spec = matchSpec(
      "name, email, phone, company, role, subject, website, budget, a message box, topic, " +
      "contact method, timeline, consent, newsletter, copy me in",
    );
    const surfaces = [...spec.fields.map((f) => f.surface), ...spec.messages.map((m) => m.surface),
      ...spec.choices.map((c) => c.surface), ...spec.checks.map((c) => c.surface)];
    expect(new Set(surfaces).size).toBe(surfaces.length);
    expect(surfaces.length).toBe(15);
  });
});

// The whole reason a tick box is a fourth array rather than a field with a type, and the whole
// reason the verb had to exist before the matcher could offer one. Each of these was made to fail
// before it was kept.
describe("matchSpec: tick boxes", () => {
  test("a consent ask generates a required tick box, unticked", () => {
    const spec = matchSpec("a name, an email, and a box to agree to the terms");
    expect(spec.checks.map((c) => c.name)).toEqual(["consent"]);
    const consent = spec.checks[0]!;
    expect(consent.type).toBe("checkbox");
    expect(consent.required).toBe("required");
    // Never pre-ticked: a generated form must not claim a visitor agreed to something. The desk
    // ticks it afterwards, visibly, which is the demo's closing move.
    expect(consent.checked).toBeNull();
    expect(consent.value).toBe("agreed");
  });

  // The correctness key. A field: address advertises field.set, which writes el.value, and a tick
  // box's value is what the form SUBMITS rather than whether it is ticked: the write would land,
  // report success and move nothing. check: names the kind that accepts the verb which can.
  test("a tick box is addressed check:, and nothing else in the spec is", () => {
    const spec = matchSpec("a name, an email, a message box, a topic, and a newsletter checkbox");
    expect(spec.checks.map((c) => c.surface)).toEqual(["check:builder-newsletter"]);
    for (const item of [...spec.fields, ...spec.messages, ...spec.choices]) {
      expect(item.surface.startsWith("field:")).toBe(true);
    }
  });

  test("the matcher never emits a radio: a group is a choice, and a choice is already a select", () => {
    const spec = matchSpec("consent, newsletter, copy me in, a topic, a preferred contact method");
    for (const check of spec.checks) expect(check.type).toBe("checkbox");
    expect(spec.checks).toHaveLength(3);
  });

  test("a form with no tick-box words in it generates none", () => {
    expect(matchSpec("a name and an email").checks).toEqual([]);
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

  test("replaces a message box's label and placeholder", () => {
    const out = applyWording(matchSpec("a message box"), {
      message: { label: "Anything else?", placeholder: "As much or as little as you like" },
    });
    expect(out.messages[0]!.label).toBe("Anything else?");
    expect(out.messages[0]!.placeholder).toBe("As much or as little as you like");
    expect(out.messages[0]!.surface).toBe("field:builder-message");
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
