import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { learnTarget } from "./learn-command.js";

describe("learnTarget", () => {
  test("a bare learn opens the map", () => {
    expect(learnTarget("")).toMatchObject({ ok: true, href: "/learn" });
    expect(learnTarget("   ")).toMatchObject({ ok: true, href: "/learn" });
    expect(learnTarget(undefined)).toMatchObject({ ok: true, href: "/learn" });
  });

  test("a quest id becomes the quest deep link", () => {
    expect(learnTarget("loop-setup")).toMatchObject({ ok: true, href: "/learn#quest=loop-setup" });
    expect(learnTarget("  Loop-Setup ")).toMatchObject({ ok: true, href: "/learn#quest=loop-setup" });
  });

  test("an id with a stop number becomes the stop deep link", () => {
    expect(learnTarget("loop-setup.2")).toMatchObject({ ok: true, href: "/learn#stop=loop-setup.2" });
  });

  test("anything else is refused and never reaches the address", () => {
    for (const bad of ["two words", "../etc", "a#b", "x.0", "x.1.2", "-lead", "trail-", "a--b", "<script>"]) {
      const out = learnTarget(bad);
      expect(out.ok, bad).toBe(false);
      expect(out.href, bad).toBeUndefined();
    }
  });
});

describe("the learn command in desk-commands.js", () => {
  const source = readFileSync(new URL("./desk-commands.js", import.meta.url), "utf8");
  test("is registered hidden, so help leaves it out", () => {
    expect(source).toMatch(/name: "learn"[^\n]*hidden: true/);
  });
});
