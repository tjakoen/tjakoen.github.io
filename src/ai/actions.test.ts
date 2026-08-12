// portfolio/ai/actions.test.ts — the deterministic ACTION router (summarize / capabilities / clarify /
// latest-note / note-write). Navigation is NOT here anymore — it's resolved against the sitemap catalog
// (catalog.ts, covered by catalog.test.ts), so a nav phrase falls through this router as null.
import { test, expect, describe } from "bun:test";
import { routeAction, PINNED_CHIP, ACTION_CHIPS, CLARIFY_CHOICES, INTENT_CHOICES, ACTION_CAPABILITIES } from "./actions.ts";
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
    for (const s of ["take me to grain", "go to the notes", "grain", "take me home"])
      expect(routeAction(s)).toBeNull();
  });

  test("the flagship note routes deterministically (a fixed pin, distinct from the dynamic 'latest')", () => {
    for (const s of ["take me to the flagship note", "read the flagship post", "open the flagship", "show me the marquee note"])
      expect(routeAction(s)?.kind).toBe("open-flagship-note");
    // checked BEFORE open-latest, so a flagship ask never resolves to the newest-by-date note
    expect(routeAction("open the flagship note")?.kind).not.toBe("open-latest-note");
    // an INFORMATIONAL ask (no intent verb) still answers in prose, not a navigate
    expect(routeAction("what's the flagship post about?")).toBeNull();
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

  test("'Watch me work' phrasings route to the showcase", () => {
    for (const s of ["watch me work", "watch the AI act", "watch the desk work", "run the demo", "play the showcase", "show me the demo"])
      expect(routeAction(s)?.kind).toBe("showcase-start");
  });

  test("'stop the demo' / 'stop the showcase' route to tour-stop (the shared cancel)", () => {
    for (const s of ["stop the demo", "stop the showcase", "end the demo"])
      expect(routeAction(s)?.kind).toBe("tour-stop");
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

  describe("B1 contact prefill", () => {
    test("phrasings extract the message RAW — casing + punctuation survive (it becomes the draft body)", () => {
      const cases: [string, string][] = [
        ["tell TJ I want to talk about grain", "I want to talk about grain"],
        ["go to contact and tell TJ I want to talk about grain", "I want to talk about grain"],
        ["message TJ that GRAIN looks great!", "GRAIN looks great!"],
        ["email tj I'd like a call", "I'd like a call"],
        ["write to TJ: love the stack", "love the stack"],
      ];
      for (const [s, message] of cases) {
        const a = routeAction(s);
        expect(a?.kind).toBe("contact-message");
        if (a?.kind === "contact-message") expect(a.message).toBe(message);
      }
    });

    test("an empty remainder falls through (null), same as every capture's own guard", () => {
      expect(routeAction("tell TJ")).toBeNull();
    });

    test("no clash: mail-archive still wins its own phrasings ('the mail from X' is never a message)", () => {
      expect(routeAction("archive everything from BREAD CI")?.kind).toBe("mail-archive");
    });

    test("no clash: 'where does TJ talk about teaching' stays a deep-link, not a message", () => {
      expect(routeAction("where does TJ talk about teaching")?.kind).toBe("deep-link");
    });
  });

  describe("D1 form builder demo", () => {
    test("build/make/create/design a form phrasings all route form-build, description is the WHOLE message", () => {
      const cases = [
        "build me a form that asks for a name and an email",
        "Make a form for a signup",
        "create a contact form",
        "design a form asking for phone and budget",
        "whip up a form with a name field",
      ];
      for (const s of cases) {
        const a = routeAction(s);
        expect(a?.kind).toBe("form-build");
        if (a?.kind === "form-build") expect(a.description).toBe(s);
      }
    });

    test("casing/punctuation survive verbatim in the description (it feeds matchSpec, not norm())", () => {
      const s = "Build me a form that asks for a Name, an Email, and what they want to talk about!";
      const a = routeAction(s);
      expect(a?.kind).toBe("form-build");
      if (a?.kind === "form-build") expect(a.description).toBe(s);
    });

    test("no clash: contact-message still wins 'tell TJ' phrasings even when 'form' appears nearby", () => {
      expect(routeAction("tell TJ I liked the form on your site")?.kind).toBe("contact-message");
    });

    test("a bare mention of 'form' with no build-ish verb does not trigger", () => {
      expect(routeAction("what's this form for")?.kind).not.toBe("form-build");
    });

    test("a QUESTION about building a form never navigates — it has the verb and the noun, and it is still a question", () => {
      const questions = [
        "how did you build this form",
        "why would you create a form that way",
        "what makes a form addressable",
        "did you build the form on the about page yourself",
        "does the desk make a form from the spec or the other way round",
      ];
      for (const s of questions) expect(routeAction(s)?.kind).not.toBe("form-build");
    });

    test("a polite opener is still a request: can/could/would never disqualify a build ask", () => {
      const requests = [
        "can you build me a form with a name and an email",
        "could you make a signup form",
        "would you create a form asking for a phone number",
      ];
      for (const s of requests) {
        const a = routeAction(s);
        expect(a?.kind).toBe("form-build");
        if (a?.kind === "form-build") expect(a.description).toBe(s);
      }
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

  describe("C2 visitor memory", () => {
    test("a substantive 'remember X' captures the fact VERBATIM (casing + punctuation survive)", () => {
      const cases: [string, string][] = [
        ["remember I'm here about grain", "I'm here about grain"],
        ["please remember I like the BREAD stack", "I like the BREAD stack"],
        ["Remember my favorite color is blue.", "my favorite color is blue."],
      ];
      for (const [s, fact] of cases) {
        const a = routeAction(s);
        expect(a?.kind).toBe("memory-set");
        if (a?.kind === "memory-set") expect(a.fact).toBe(fact);
      }
    });

    test("a leading 'that' is connective tissue, stripped from the captured fact", () => {
      const a = routeAction("remember that my name is Anna");
      expect(a?.kind).toBe("memory-set");
      if (a?.kind === "memory-set") expect(a.fact).toBe("my name is Anna");
    });

    test("deictic-only remainders mean the PAGE, not a fact — stay note-write", () => {
      for (const s of ["remember this", "remember that", "remember it", "remember this page", "remember the page"])
        expect(routeAction(s)?.kind).toBe("note-write");
    });

    test("a bare 'remember' (no remainder) is not a memory ask", () => {
      expect(routeAction("remember")?.kind).not.toBe("memory-set");
    });

    test("an explicit notepad write beats a leading 'remember' clause (notepad mention wins)", () => {
      expect(routeAction("remember to add bullets to my notepad")?.kind).toBe("note-write");
    });

    test("'add bullets to my notepad' (no 'remember') is unaffected — still note-write", () => {
      expect(routeAction("add summary bullets to my notepad")?.kind).toBe("note-write");
    });

    test("an embedded 'remember' mid-sentence is not a memory ask (whole-message-anchored)", () => {
      expect(routeAction("I'll always remember this place")?.kind).not.toBe("memory-set");
    });

    test("'forget X' routes memory-forget", () => {
      for (const s of ["forget what you know about me", "forget everything", "Forget my name"])
        expect(routeAction(s)?.kind).toBe("memory-forget");
    });

    test("'forget it' / 'forget that' fall through — casual dismissal, not a memory ask", () => {
      expect(routeAction("forget it")?.kind).not.toBe("memory-forget");
      expect(routeAction("forget that")?.kind).not.toBe("memory-forget");
    });

    test("an embedded 'forget' mid-sentence is not a memory-forget ask (whole-message-anchored)", () => {
      expect(routeAction("I'll never forget this trip")?.kind).not.toBe("memory-forget");
    });
  });
});

// ACTION_CAPABILITIES (the source the desk's ONE capability catalog folds in, capabilities.ts) must
// never claim an ability routeAction doesn't actually recognize — a drift guard against the exact
// scatter this feature was built to close: one representative trigger per listed kind, proven live.
describe("ACTION_CAPABILITIES — every listed kind is a REAL, reachable routeAction outcome", () => {
  const EXAMPLE: Partial<Record<string, string>> = {
    summarize: "summarize this page",
    "deep-link": "show me the part about grain",
    "open-latest-note": "show me the latest note",
    "tour-start": "take the tour",
    "notes-filter": "show me notes about teaching",
    theme: "switch to dark mode",
    "showcase-start": "watch me work",
    "form-build": "build me a form that asks for a name and an email",
  };

  test("every capability's kind has an example, and the example routes to that exact kind", () => {
    for (const cap of ACTION_CAPABILITIES) {
      const example = EXAMPLE[cap.kind];
      expect(example, `no example wired for "${cap.kind}"`).toBeDefined();
      expect(routeAction(example!)?.kind).toBe(cap.kind);
    }
  });

  test("no duplicate kinds — one capability entry per Action kind", () => {
    const kinds = ACTION_CAPABILITIES.map((c) => c.kind);
    expect(new Set(kinds).size).toBe(kinds.length);
  });
});
