// portfolio/ai/actions.test.ts — the deterministic ACTION router (summarize / capabilities / clarify /
// latest-note / note-write). Navigation is NOT here anymore — it's resolved against the sitemap catalog
// (catalog.ts, covered by catalog.test.ts), so a nav phrase falls through this router as null.
import { test, expect, describe } from "bun:test";
import { routeAction, PINNED_CHIP, ACTION_CHIPS, CLARIFY_CHOICES, INTENT_CHOICES } from "./actions.ts";
import { navTarget } from "./catalog.ts";

describe("routeAction", () => {
  test("summarize phrasings", () => {
    for (const s of ["Summarize this page", "summarise it", "tl;dr", "give me a recap", "sum up this page"])
      expect(routeAction(s)?.kind).toBe("summarize");
  });

  test("note-write phrasings carry the instruction", () => {
    for (const s of ["Add summary bullets to my notepad", "save this to the notepad", "jot this down", "jot down that grain looks promising", "make a note", "put a to-do in my notepad", "note that down"]) {
      const a = routeAction(s);
      expect(a?.kind).toBe("note-write");
      if (a?.kind === "note-write") expect(a.instruction).toBe(s.trim());
    }
  });

  test("note-write beats summarize when the notepad is named (writes, not just summarizes to chat)", () => {
    expect(routeAction("summarize this page to my notepad")?.kind).toBe("note-write");
  });

  test("capabilities phrasings (incl. the pinned chip)", () => {
    for (const s of [PINNED_CHIP, "what can I do here?", "what should I do next", "suggest what to do next", "what's here"])
      expect(routeAction(s)?.kind).toBe("capabilities");
  });

  test("page-inventory asks are capabilities too (the 0.5B mangles route lists — audit finding)", () => {
    for (const s of ["Which pages can you take me to?", "what pages are there", "where can you take me"])
      expect(routeAction(s)?.kind).toBe("capabilities");
  });

  test("open the latest note (a dynamic action, not catalog nav)", () => {
    for (const s of ["Show me the latest note", "show the latest blog", "open the newest post", "read the most recent article"])
      expect(routeAction(s)?.kind).toBe("open-latest-note");
  });

  test("deep-link phrasings extract the topic as `query` (A1: show me the part about X)", () => {
    const cases: [string, string][] = [
      ["Show me the part about teaching with AI", "teaching with ai"],
      ["find the section on grain's spotlight", "grain s spotlight"],
      ["show me the bit covering BREAD", "bread"],
      ["open the passage about MILL", "mill"],
      ["where does TJ talk about teaching with AI", "teaching with ai"],
      ["where do you mention BATCH", "batch"],
      ["where did TJ write about grain", "grain"],
      ["take me to the part about teaching with AI", "teaching with ai"],
      ["jump me to the section on BREAD", "bread"],
    ];
    for (const [s, query] of cases) {
      const a = routeAction(s);
      expect(a?.kind).toBe("deep-link");
      if (a?.kind === "deep-link") expect(a.query).toBe(query);
    }
  });

  test("deep-link with an empty remainder falls through (null) rather than routing a doomed lookup", () => {
    for (const s of ["show me the section about", "show me the section on"])
      expect(routeAction(s)).toBeNull();
  });

  test("guard phrasings still route to their old kinds, not deep-link", () => {
    expect(routeAction("show me the latest note")?.kind).toBe("open-latest-note");
    expect(routeAction("show me around")?.kind).toBe("clarify");
    expect(routeAction("what can I do here")?.kind).toBe("capabilities");
  });

  test("navigation phrases fall through here (null) — the catalog resolves them, not this router", () => {
    for (const s of ["take me to grain", "go to the notes", "grain", "take me home", "take me to the flagship note"])
      expect(routeAction(s)).toBeNull();
  });

  test("a vague 'help me get somewhere' ask offers choices (deterministic disambiguation)", () => {
    // "give me a tour" / "take a tour" used to land here — A2 now starts the tour directly instead
    // (see the tour tests below), so they're no longer in this vague-ask list.
    for (const s of ["show me around", "where should I go", "help me choose", "what are my options", "I'm not sure", "surprise me"]) {
      const a = routeAction(s);
      expect(a?.kind).toBe("clarify");
      if (a?.kind === "clarify") { expect(a.choices.length).toBeGreaterThanOrEqual(2); expect(a.prompt).toBeTruthy(); }
    }
  });

  test("A2: tour-start phrasings", () => {
    for (const s of ["take the tour", "start the tour", "begin the tour", "give me a tour", "take a tour", "give me the tour"])
      expect(routeAction(s)?.kind).toBe("tour-start");
  });

  test("A2: tour-stop phrasings", () => {
    for (const s of ["stop the tour", "end the tour", "cancel the tour", "quit the tour"])
      expect(routeAction(s)?.kind).toBe("tour-stop");
  });

  test("A2: 'stop the tour' is never mistaken for a tour-start (both share the word 'tour')", () => {
    expect(routeAction("stop the tour")?.kind).not.toBe("tour-start");
  });

  test("A2: 'show me around' still clarifies (it's vague, unlike a direct tour ask)", () => {
    expect(routeAction("show me around")?.kind).toBe("clarify");
  });

  test("A2: the tour is the FIRST clarify choice", () => {
    expect(CLARIFY_CHOICES[0]).toEqual({ label: "Take the tour", value: "take the tour" });
  });

  test("every clarify choice is actionable — an action here, or a real nav command for the catalog", () => {
    const a = routeAction("show me around");
    if (a?.kind !== "clarify") throw new Error("expected clarify");
    for (const c of a.choices)
      expect(routeAction(c.value) !== null || navTarget(c.value) !== null).toBe(true);
  });

  test("plain questions fall through to chat (null)", () => {
    for (const s of ["What is BREAD?", "Who is TJ?", "how is this site built", ""])
      expect(routeAction(s)).toBeNull();
  });

  test("the action chips all route to an action (never null)", () => {
    for (const chip of [PINNED_CHIP, ...ACTION_CHIPS]) expect(routeAction(chip)).not.toBeNull();
  });

  describe("A4 theme switching", () => {
    test("scheme phrasings (dark/light + a mode-ish companion word)", () => {
      for (const s of ["make it dark", "dark mode", "switch to dark", "go dark", "light mode", "make it light", "make it darker"])
        expect(routeAction(s)?.kind).toBe("theme");
    });

    test("scheme target picks the bare word (not the -er suffix)", () => {
      expect(routeAction("make it dark")).toEqual({ kind: "theme", target: "dark" });
      expect(routeAction("light mode")).toEqual({ kind: "theme", target: "light" });
      expect(routeAction("make it darker")).toEqual({ kind: "theme", target: "dark" });
    });

    test("a chat-shaped scheme question still fires (unambiguous enough, per design)", () => {
      expect(routeAction("is dark mode supported")?.kind).toBe("theme");
    });

    test("flavor phrasings, incl. a bare name (unambiguous — no nav destination shares these words)", () => {
      for (const s of ["switch to brioche", "use the baguette theme", "change the theme to sourdough", "brioche theme", "brioche"])
        expect(routeAction(s)).toEqual({ kind: "theme", target: s.includes("baguette") ? "baguette" : s.includes("sourdough") ? "sourdough" : "brioche" });
    });

    test("cycle/next phrasings target 'next'", () => {
      for (const s of ["cycle the theme", "next theme"])
        expect(routeAction(s)).toEqual({ kind: "theme", target: "next" });
    });

    test("'switch to grain' is NOT theme — grain isn't a flavor, falls through to catalog nav", () => {
      expect(routeAction("switch to grain")).toBeNull();
    });

    test("'take me to the notes' is unaffected by the theme check", () => {
      expect(routeAction("take me to the notes")).toBeNull();
    });
  });

  describe("B2 notes filtering", () => {
    test("phrasings extract the topic as `topic` (never a tag guess — the reasoner matches it, law #2)", () => {
      const cases: [string, string][] = [
        ["show me notes about teaching", "teaching"],
        ["notes tagged ai", "ai"],
        ["filter the notes by grain", "grain"],
        ["which notes are about design systems", "design systems"],
      ];
      for (const [s, topic] of cases) {
        const a = routeAction(s);
        expect(a?.kind).toBe("notes-filter");
        if (a?.kind === "notes-filter") expect(a.topic).toBe(topic);
      }
    });

    test("an empty remainder falls through (null), same as deep-link's own guard", () => {
      expect(routeAction("filter the notes by")).toBeNull();
    });

    test("'show me the latest note' still opens the latest note, not a filter (no about/tagged connector)", () => {
      expect(routeAction("show me the latest note")?.kind).toBe("open-latest-note");
    });

    test("'make a note about grain' still writes to the notepad, not a filter (note-write fires first)", () => {
      expect(routeAction("make a note about grain")?.kind).toBe("note-write");
    });

    test("'where does TJ write about teaching' still deep-links, not a filter (deep-link fires first)", () => {
      expect(routeAction("where does TJ write about teaching")?.kind).toBe("deep-link");
    });

    test("'summarize the notes' still summarizes, not a filter (summarize fires first)", () => {
      expect(routeAction("summarize the notes")?.kind).toBe("summarize");
    });
  });

  describe("B3 mail batch archive", () => {
    test("phrasings extract the sender as `sender` (never a sender guess — the reasoner matches it, law #2)", () => {
      const cases: [string, string][] = [
        ["archive everything from BREAD CI", "bread ci"],
        ["archive all mail from bread ci", "bread ci"],
        ["archive the emails from The Desk", "the desk"],
      ];
      for (const [s, sender] of cases) {
        const a = routeAction(s);
        expect(a?.kind).toBe("mail-archive");
        if (a?.kind === "mail-archive") expect(a.sender).toBe(sender);
      }
    });

    test("an empty remainder falls through (null), same as deep-link/notes-filter's own guard", () => {
      expect(routeAction("archive everything from")).toBeNull();
    });

    test("no clash: 'archive' alone doesn't fire (no 'from' target)", () => {
      expect(routeAction("archive")?.kind).not.toBe("mail-archive");
    });

    test("no clash: unrelated actions still route as before", () => {
      expect(routeAction("take me to the notes")).toBeNull();
      expect(routeAction("show me notes about teaching")?.kind).toBe("notes-filter");
      expect(routeAction("hi")?.kind).toBe("intent-ask");
    });
  });

  describe("C1 visitor-intent onboarding", () => {
    test("greeting forms route intent-ask (a WHOLE-message greeting/vague opener)", () => {
      for (const s of ["hi", "Hi", "hey!", "hello", "howdy", "yo", "good morning", "Good Afternoon.", "help"])
        expect(routeAction(s)?.kind).toBe("intent-ask");
    });

    test("an explicit 'who's/who is visiting' ask routes intent-ask", () => {
      for (const s of ["who's visiting", "who is visiting", "who's visiting today"])
        expect(routeAction(s)?.kind).toBe("intent-ask");
    });

    test("an EMBEDDED 'who is visiting' (mid-sentence mention, not an ask) does not trigger", () => {
      expect(routeAction("I wonder who is visiting")?.kind).not.toBe("intent-ask");
    });

    test("a greeting WORD embedded in a longer message does not trigger the ask", () => {
      expect(routeAction("hi, take me to grain")).not.toEqual(expect.objectContaining({ kind: "intent-ask" }));
      expect(routeAction("hi, take me to grain")?.kind).not.toBe("intent-ask");
    });

    test("'help me find the docs' still hits the existing clarify pattern, not the bare-'help' trigger", () => {
      expect(routeAction("help me find the docs")?.kind).toBe("clarify");
    });

    test("the three intent-set values (and their 'i am' longhand)", () => {
      expect(routeAction("I'm hiring")).toEqual({ kind: "intent-set", intent: "recruiter" });
      expect(routeAction("I am hiring")).toEqual({ kind: "intent-set", intent: "recruiter" });
      expect(routeAction("I'm a developer")).toEqual({ kind: "intent-set", intent: "developer" });
      expect(routeAction("I am a developer")).toEqual({ kind: "intent-set", intent: "developer" });
      expect(routeAction("I'm a student")).toEqual({ kind: "intent-set", intent: "student" });
      expect(routeAction("I am a student")).toEqual({ kind: "intent-set", intent: "student" });
      expect(routeAction("I'm a student of TJ's")).toEqual({ kind: "intent-set", intent: "student" });
    });

    test("every INTENT_CHOICES value round-trips through the router to its own intent", () => {
      const expected = { "Recruiter or hiring": "recruiter", "Developer curious about the stack": "developer", "Student of TJ's": "student" } as const;
      for (const c of INTENT_CHOICES) {
        const a = routeAction(c.value);
        expect(a?.kind).toBe("intent-set");
        if (a?.kind === "intent-set") expect(a.intent).toBe(expected[c.label as keyof typeof expected]);
      }
    });

    test("ordinary sentences merely CONTAINING 'student'/'developer' mid-sentence do not hijack", () => {
      for (const s of [
        "the developer conference is next week",
        "I am a senior developer at a tech company",
        "I'm a student of design, not code",
        "he's a developer for our team",
      ]) expect(routeAction(s)?.kind).not.toBe("intent-set");
    });
  });
});
