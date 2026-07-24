// portfolio/ai/mail-sender.test.ts — B3 mail batch archive's sender matcher. Pins the behavior that
// replaces any temptation to let the model pick a sender: real senders in, the right one out (or
// none), nothing invented.
import { test, expect, describe } from "bun:test";
import { matchSender } from "./mail-sender.ts";

const SENDERS = ["BREAD CI", "The Desk", "Grain Release Bot"];

describe("matchSender", () => {
  test("exact match (case/whitespace-insensitive)", () => {
    expect(matchSender("bread ci", SENDERS)).toBe("BREAD CI");
    expect(matchSender("BREAD CI", SENDERS)).toBe("BREAD CI");
    expect(matchSender("  bread   ci  ", SENDERS)).toBe("BREAD CI");
  });

  test("sender-covered-by-query: every sender word appears in a longer query phrase", () => {
    expect(matchSender("the bread ci bot", SENDERS)).toBe("BREAD CI");
    expect(matchSender("everything from bread ci please", SENDERS)).toBe("BREAD CI");
  });

  test("query-covered-by-sender: a bare partial name is covered by the fuller sender", () => {
    expect(matchSender("bread", SENDERS)).toBe("BREAD CI");
    expect(matchSender("desk", SENDERS)).toBe("The Desk");
    expect(matchSender("grain", SENDERS)).toBe("Grain Release Bot");
  });

  test("a single-letter stray overlap never matches (\"b\" is not a token of BREAD CI)", () => {
    expect(matchSender("b", SENDERS)).toBeNull();
  });

  test("an overlap whose only shared token is 1 char long doesn't count, even if it IS a real token", () => {
    // "a" is a real word of neither sender's tokens here, but if it were, a 1-char overlap alone must
    // not clear the length floor. Exercise the floor directly against a 1-char sender token.
    expect(matchSender("a", ["A B Co"])).toBeNull();
  });

  test("an unrelated phrase matches nothing", () => {
    expect(matchSender("quantum physics newsletter", SENDERS)).toBeNull();
  });

  test("an empty or whitespace-only query matches nothing, no crash", () => {
    expect(matchSender("", SENDERS)).toBeNull();
    expect(matchSender("   ", SENDERS)).toBeNull();
  });

  test("empty senders list → null, no crash", () => {
    expect(matchSender("bread", [])).toBeNull();
  });

  test("priority: exact equality beats a partial cover even when a different sender covers the query", () => {
    // "the desk" is an exact match for "The Desk" AND a query-covered-by-sender partial hit is not in
    // play here, but this pins the exact-equality path stays the type that wins when it applies.
    expect(matchSender("the desk", SENDERS)).toBe("The Desk");
  });

  test("priority: sender-covered-by-query outranks query-covered-by-sender, even OUT of list order", () => {
    // query "grain release bot" fully covers "Grain Release Bot"'s three words (sender-covered-by-
    // query, rank 1) but only PARTIALLY covers "Grain Release Bot Extra"'s four (so that one only
    // qualifies as query-covered-by-sender, rank 2) — the rank-1 sender wins even though it's listed
    // SECOND, proving priority beats plain list order.
    const senders = ["Grain Release Bot Extra", "Grain Release Bot"];
    expect(matchSender("grain release bot", senders)).toBe("Grain Release Bot");
  });

  test("ties within the same rank are broken by list order (first wins)", () => {
    const senders = ["Bread Bot", "Bread Bakery"];
    // "bread" is query-covered-by-sender for BOTH — first in list order wins.
    expect(matchSender("bread", senders)).toBe("Bread Bot");
  });

  test("first BEST match wins even if a later, lower-ranked sender also overlaps", () => {
    const senders = ["Bread", "BREAD CI"];
    // "bread" is an exact match for "Bread" (rank 0) — beats "BREAD CI" (rank 2, query-covered).
    expect(matchSender("bread", senders)).toBe("Bread");
  });
});
