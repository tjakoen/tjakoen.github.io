// portfolio/ai/contact-draft.test.ts — B1 contact prefill: the deterministic draft the desk fills
// into the /mail compose body. The visitor's words survive verbatim (casing + punctuation); only a
// salutation and a closing period are added, and only when missing.
import { test, expect, describe } from "bun:test";
import { draftMessage, CONTACT_FIELD_SURFACE } from "./contact-draft.ts";

describe("draftMessage", () => {
  test("wraps a bare phrase in the salutation and closes the sentence", () => {
    expect(draftMessage("I want to talk about grain")).toBe("Hi TJ, I want to talk about grain.");
  });
  test("keeps the visitor's own casing + punctuation verbatim", () => {
    expect(draftMessage("GRAIN looks great — can we chat?")).toBe("Hi TJ, GRAIN looks great — can we chat?");
  });
  test("a phrase that already opens like a letter gets no second salutation", () => {
    expect(draftMessage("Hi TJ, loved the notes")).toBe("Hi TJ, loved the notes.");
    expect(draftMessage("Hello! Quick question about MILL.")).toBe("Hello! Quick question about MILL.");
  });
  test("already-closed sentences keep their own ending", () => {
    expect(draftMessage("I'd like a call.")).toBe("Hi TJ, I'd like a call.");
    expect(draftMessage("are you hiring?")).toBe("Hi TJ, are you hiring?");
  });
  test("whitespace-only drafts to nothing (the reasoner declines, never a blank fill)", () => {
    expect(draftMessage("   ")).toBe("");
  });
});

test("the one registered field surface is named in code — targeting is never a model pick", () => {
  expect(CONTACT_FIELD_SURFACE).toBe("field:contact-message");
});
