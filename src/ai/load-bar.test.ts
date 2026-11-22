import { describe, expect, test } from "bun:test";
import { loadBar } from "./desk-reasoner.ts";
import { STRONG_PROFILE, WEAK_PROFILE } from "./webllm-loader.ts";

describe("loadBar", () => {
  test("a first visit counts megabytes against the profile's download size", () => {
    const html = loadBar(40, WEAK_PROFILE, false);
    expect(html).toContain("Downloading Qwen2.5-0.5B: 140 of about 350 MB. One time only.");
    expect(html).toContain('style="width:40%"');
    expect(html).toContain(">40%<");
  });

  test("a bigger model reports its own, bigger download", () => {
    expect(loadBar(10, STRONG_PROFILE, false)).toContain("88 of about 875 MB");
  });

  test("a returning visitor is told the copy is saved, with no download count", () => {
    const html = loadBar(60, WEAK_PROFILE, true);
    expect(html).toContain("Loading Qwen2.5-0.5B from the copy saved on this device.");
    expect(html).not.toContain("MB");
  });

  test("the start of a download reads zero megabytes, not a blank", () => {
    expect(loadBar(0, WEAK_PROFILE, false)).toContain("0 of about 350 MB");
  });
});
