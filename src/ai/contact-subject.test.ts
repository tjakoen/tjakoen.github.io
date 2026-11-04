// portfolio/ai/contact-subject.test.ts — draftSubject: the subject is the visitor's own words, trimmed.
import { describe, expect, test } from "bun:test";
import { draftMessage, draftSubject } from "./contact-draft.ts";

describe("draftSubject", () => {
  test("takes the topic after 'about'", () => {
    expect(draftSubject("I want to talk about grain")).toBe("About grain");
    expect(draftSubject("I'd like to talk about a teaching job")).toBe("About a teaching job");
  });
  test("drops a filler opener when there is no 'about'", () => {
    expect(draftSubject("I'd like to collaborate on a course")).toBe("Collaborate on a course");
  });
  test("keeps a plain phrase and capitalises it", () => {
    expect(draftSubject("loved the grain talk")).toBe("Loved the grain talk");
  });
  test("works on a finished draft, greeting and period included", () => {
    expect(draftSubject(draftMessage("I want to talk about grain"))).toBe("About grain");
    expect(draftSubject("Hello TJ, quick question about mentoring!")).toBe("About mentoring");
  });
  test("caps a long phrase at a word boundary", () => {
    const s = draftSubject("I want to discuss the way the course platform handles student repositories across several terms");
    expect(s.length).toBeLessThanOrEqual(60);
    expect(s.endsWith(" ")).toBe(false);
    expect("I want to discuss the way the course platform handles student repositories".toLowerCase()).toContain(s.toLowerCase().split(" ").slice(-1)[0]!);
  });
  test("an empty phrase gives an empty subject", () => {
    expect(draftSubject("   ")).toBe("");
  });
});
