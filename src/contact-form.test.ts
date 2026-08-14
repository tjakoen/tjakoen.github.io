// portfolio/contact-form.test.ts — guards content/data/contact-form.json against the two renderer
// contracts b-field/b-choice/b-option actually enforce (probed in batch/render/render.ts, not
// re-probed here): an absent key on an each item logs a dev warning where an explicit null stays
// quiet, and a boolean attribute can't bind as "" so required/selected must be the literal string
// or null. A spec that violates either one still renders, just with a console warning nobody reads
// and a form that silently drops "required" or "selected" — this test is the thing that would catch
// the drift before a person ever opens /about.
import { test, expect, describe } from "bun:test";
import { join } from "node:path";

interface ContactField {
  surface: string; label: string; name: string; type: string;
  placeholder: string | null; value: string | null; required: string | null;
}
interface ContactMessage {
  surface: string; label: string; name: string;
  placeholder: string | null; value: string | null; required: string | null;
}
interface ContactOption { value: string; label: string; selected: string | null }
interface ContactChoice { surface: string; label: string; name: string; options: ContactOption[] }
interface ContactCheck {
  surface: string; label: string; name: string; type: string; value: string | null;
  checked: string | null; required: string | null; hint: string | null; error: string | null;
}
interface ContactForm {
  fields: ContactField[]; messages: ContactMessage[]; choices: ContactChoice[]; checks: ContactCheck[];
}

const path = join(import.meta.dir, "..", "content", "data", "contact-form.json");
const spec: ContactForm = await Bun.file(path).json();

const FIELD_KEYS = ["surface", "label", "name", "type", "placeholder", "value", "required"];
// No "type": a textarea has none, and b-memo binds no such attribute.
const MESSAGE_KEYS = ["surface", "label", "name", "placeholder", "value", "required"];
const CHOICE_KEYS = ["surface", "label", "name", "options"];
const OPTION_KEYS = ["value", "label", "selected"];
// A tick box binds its own type (a binding replaces where a config prop appends, so b-check covers
// both controls from one template) and both message slots, which b-field's own spec does not carry.
const CHECK_KEYS = ["surface", "label", "name", "type", "value", "checked", "required", "hint", "error"];

describe("contact-form.json shape", () => {
  test("has at least one field, one message box and one choice", () => {
    expect(spec.fields.length).toBeGreaterThan(0);
    expect(spec.messages.length).toBeGreaterThan(0);
    expect(spec.choices.length).toBeGreaterThan(0);
    expect(spec.checks.length).toBeGreaterThan(0);
  });

  test("every message item carries every key as its own property (no absent-key warning)", () => {
    for (const message of spec.messages) {
      for (const key of MESSAGE_KEYS) expect(Object.prototype.hasOwnProperty.call(message, key)).toBe(true);
      expect(message.required === "required" || message.required === null).toBe(true);
    }
  });

  test("every field item carries every key as its own property (no absent-key warning)", () => {
    for (const field of spec.fields) {
      for (const key of FIELD_KEYS) expect(Object.prototype.hasOwnProperty.call(field, key)).toBe(true);
    }
  });

  test("every choice item, and every option inside it, carries every key", () => {
    for (const choice of spec.choices) {
      for (const key of CHOICE_KEYS) expect(Object.prototype.hasOwnProperty.call(choice, key)).toBe(true);
      for (const option of choice.options) {
        for (const key of OPTION_KEYS) expect(Object.prototype.hasOwnProperty.call(option, key)).toBe(true);
      }
    }
  });

  test("required is the literal string \"required\" or null, never \"\" or true", () => {
    for (const field of spec.fields) {
      expect(field.required === "required" || field.required === null).toBe(true);
    }
  });

  test("selected is the literal string \"selected\" or null, at most one per choice", () => {
    for (const choice of spec.choices) {
      let selectedCount = 0;
      for (const option of choice.options) {
        expect(option.selected === "selected" || option.selected === null).toBe(true);
        if (option.selected === "selected") selectedCount += 1;
      }
      expect(selectedCount).toBeLessThanOrEqual(1);
    }
  });

  test("every tick box carries every key, with checked as the literal string or null", () => {
    for (const check of spec.checks) {
      for (const key of CHECK_KEYS) expect(Object.prototype.hasOwnProperty.call(check, key)).toBe(true);
      expect(check.checked === "checked" || check.checked === null).toBe(true);
      expect(check.required === "required" || check.required === null).toBe(true);
      expect(check.type === "checkbox" || check.type === "radio").toBe(true);
    }
  });

  // The prefix decides which verb the manifest advertises on the control, so it is a correctness
  // key rather than a naming one. A tick box addressed field: would advertise field.set, and
  // field.set writes el.value — which on a tick box is what the form SUBMITS, not whether it is
  // ticked. The write would land, report success and move nothing. Hence check: for a tick box and
  // field: for everything else in this file, asserted rather than left to whoever edits it next.
  test("a text control's surface starts with field:, a tick box's with check:, and none repeat", () => {
    const fieldish = [...spec.fields.map((f) => f.surface), ...spec.messages.map((m) => m.surface),
      ...spec.choices.map((c) => c.surface)];
    for (const surface of fieldish) expect(surface.startsWith("field:")).toBe(true);
    for (const check of spec.checks) expect(check.surface.startsWith("check:")).toBe(true);
    const all = [...fieldish, ...spec.checks.map((c) => c.surface)];
    expect(new Set(all).size).toBe(all.length);
  });

  // This one matters more now than it did, because the form HAS a message box since 2026-08-13 and
  // the obvious name for its address is the one /mail's compose textarea already answers to. The
  // desk's draft flow resolves field:contact-message in code (contact-draft.ts) and asks the live
  // DOM whether a draft target is present; a second control wearing that name on another page makes
  // that question answer true where the flow never drafts. Hence field:about-message here.
  test("surfaces don't collide with /mail's registered field:contact-message", () => {
    const surfaces = [...spec.fields.map((f) => f.surface), ...spec.messages.map((m) => m.surface),
      ...spec.choices.map((c) => c.surface)];
    expect(surfaces).not.toContain("field:contact-message");
  });
});
