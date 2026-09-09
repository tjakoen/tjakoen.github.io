// portfolio/src/server.test.ts — the traversal guard, seen refusing every way out of its root.
//
// serveFont and serveMedia hand a caller-supplied path segment to Bun.file. withinRoot is the one
// line that keeps that segment from escaping the fonts/media directory with a ../ or an absolute
// path — the security-relevant check in server.ts. The 2026-09-08 audit found it had no test at all,
// so a regression that let an escape through would ship undetected. Each escape here is paired with
// the legitimate path it must still allow, so a guard stubbed to always return false fails too.
import { test, expect } from "bun:test";
import { resolve } from "node:path";
import { withinRoot } from "./server.ts";

const ROOT = resolve("/srv/app/fonts");

test("a plain filename inside the root is allowed", () => {
  expect(withinRoot(ROOT, "inter.woff2")).toBe(true);
});

test("a nested path inside the root is allowed", () => {
  expect(withinRoot(ROOT, "subset/inter-latin.woff2")).toBe(true);
});

test("the root itself is allowed", () => {
  expect(withinRoot(ROOT, "")).toBe(true);
  expect(withinRoot(ROOT, ".")).toBe(true);
});

test("a ../ escape to the parent is refused", () => {
  expect(withinRoot(ROOT, "../secret.key")).toBe(false);
});

test("a deep ../../ escape is refused", () => {
  expect(withinRoot(ROOT, "../../../../etc/passwd")).toBe(false);
});

test("a ../ that dips out and back in is normalized and judged on where it lands", () => {
  // out of fonts, into a sibling — must be refused even though it re-descends
  expect(withinRoot(ROOT, "../media/og-card.png")).toBe(false);
  // out and back into fonts itself — lands inside, allowed
  expect(withinRoot(ROOT, "../fonts/inter.woff2")).toBe(true);
});

test("an absolute-looking rel is neutralized into the root by join, not honored as absolute", () => {
  // join("/srv/app/fonts", "/etc/passwd") collapses the leading slash into a separator, so the path
  // lands INSIDE the root (/srv/app/fonts/etc/passwd) and is allowed — it simply 404s, never serving
  // /etc/passwd. The escape vector that actually matters is ../, covered above.
  expect(withinRoot(ROOT, "/etc/passwd")).toBe(true);
});

test("a sibling directory sharing the root's name prefix is refused", () => {
  // /srv/app/fonts-evil starts with the string "/srv/app/fonts" but is NOT inside it; the trailing
  // separator in the check is what catches this.
  expect(withinRoot(ROOT, "../fonts-evil/inter.woff2")).toBe(false);
});
