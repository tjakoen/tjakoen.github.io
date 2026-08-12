// portfolio/scripts/desk-commands.js — the PORTFOLIO's own terminal commands (the persona lives
// here, so grain/scripts/terminal.js stays persona-neutral). Registers through the GRAIN seam
// (window.grain.terminal.register). Loads AFTER terminal.js, so the registry already exists.
//
// Voice: quirky, self-deprecating, in the owner's register (standards/VOICE.md). These are the
// commands a visitor is meant to find — a whoami and a few honest easter eggs that each teach
// something about the stack rather than just wink. (A `tour` command is planned — it lands with
// its reasoner choreography, not before: no command ships whose behavior isn't implemented.)
(() => {
  "use strict";
  const t = window.grain && window.grain.terminal;
  if (!t) { console.warn("[desk-commands] window.grain.terminal not ready — is terminal.js loaded first?"); return; }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ── desk verbs: the terminal as a THIRD client of the ONE door ───────────────────────────────────
  // (plan: desk-hero-demo P2b). grain's terminal already raises `ask`/`tour`/`stop` as real Intents
  // through window.grain.door.submit — these commands add the operate-the-site verbs on top, each one
  // phrasing what the visitor typed as the SAME natural-language intent the chat + the suggest chips
  // send. So the deterministic router (ai/actions.ts) does the recognizing, the desk drives the real
  // surface (filter/archive/deep-link/draft/theme/tour), and it narrates its steps in the chat and
  // here. Law #2: the terminal never routes a verb itself — it only restates the ask; the router owns
  // the recognizing. Guards mirror grain's own `ask` (door loaded + a chat to answer in + online).
  const deskSubmit = (ctx, text, echo) => {
    if (!ctx.door) return ctx.printErr("the door isn't loaded on this page.");
    if (!document.querySelector('[data-surface="chat-log"]')) return ctx.printErr("no desk on this page to run that in.");
    if (!ctx.door.online()) return ctx.printErr("the desk is offline — can't run that right now.");
    ctx.door.submit("chat.send", "chat-log", { text });
    if (echo) ctx.print(echo);
    return undefined;
  };

  t.register({ name: "notes", args: "<topic>", help: "filter the notes by a topic (drives /notes)", run(ctx) {
    if (!ctx.arg) return ctx.printErr("notes about what? try ‘notes teaching’.");
    return deskSubmit(ctx, `show me the notes about ${ctx.arg}`, `→ filtering the notes for ‘${ctx.arg}’ — watch the chat.`);
  }});
  t.register({ name: "archive", args: "<sender>", help: "archive every message from a sender (drives /mail)", run(ctx) {
    if (!ctx.arg) return ctx.printErr("archive from whom? try ‘archive BREAD CI’.");
    return deskSubmit(ctx, `archive everything from ${ctx.arg}`, `→ archiving mail from ‘${ctx.arg}’ — watch the chat.`);
  }});
  t.register({ name: "find", args: "<topic>", help: "jump to where TJ covers a topic (deep-link)", run(ctx) {
    if (!ctx.arg) return ctx.printErr("find what? try ‘find teaching with ai’.");
    return deskSubmit(ctx, `where does TJ talk about ${ctx.arg}`, `→ looking for ‘${ctx.arg}’ — watch the chat.`);
  }});
  t.register({ name: "draft", args: "<message>", help: "start a message to TJ (prefills the contact form — you send it)", run(ctx) {
    if (!ctx.arg) return ctx.printErr("draft what? try ‘draft I want to talk about GRAIN’.");
    return deskSubmit(ctx, `tell TJ ${ctx.arg}`, "→ drafting your message — watch the chat. The desk fills it in; you send it.");
  }});
  t.register({ name: "tour", args: "", help: "take the guided tour", run(ctx) {
    return deskSubmit(ctx, "take the tour", "→ starting the tour — watch the chat.");
  }});

  // theme — OVERRIDES grain's flavor-only builtin so the terminal routes theme through the desk (the
  // one door), the same "make it dark" / "switch to brioche" the chat understands: dark/light/next is
  // the SCHEME axis, any other word is a flavor — both handled by the desk's theme verb (ai/actions.ts,
  // re-validated against the live <html data-themes>). Flavor switching is PRESERVED (still works, now
  // narrated); no arg is a pure read (current flavor + the axes), so it needs no door.
  t.register({ name: "theme", args: "<dark|light|next|flavor>", help: "switch the theme (drives the desk)", run(ctx) {
    const th = window.grain && window.grain.theme;
    if (!ctx.arg) {
      if (!th || !th.themes) return ctx.printErr("theming isn't loaded on this page.");
      return ctx.print(`flavors: ${th.themes().join(", ")} · scheme: dark/light — current flavor: ${th.theme && th.theme()}`);
    }
    const a = ctx.arg.toLowerCase();
    const text = /^(dark|light)$/.test(a) ? `make it ${a}`
      : a === "next" ? "cycle the theme"
      : `switch to the ${ctx.arg} theme`;
    return deskSubmit(ctx, text, `→ theme: ${ctx.arg} — watch the chat.`);
  }});

  // ── whoami: the short version ───────────────────────────────────────────────────────────────────
  t.register({ name: "whoami", args: "", help: "who built this", run(ctx) {
    ctx.print("Tjakoen Stolk — I teach software engineering and build AI-first interfaces.");
    ctx.print("This whole site is my own no-build stack: BATCH · GRAIN · MILL. I direct, Claude types.");
    ctx.printHtml('more: <a href="/about">/about</a> · <a href="/notes/ten-times-zero">/notes/ten-times-zero</a>');
  }});

  // ── content: the page's READABLE TEXT (what the page SAYS) ──────────────────────────────────────
  // grain's built-in `context` prints the DOM MANIFEST — the operable surfaces, i.e. what the AI can
  // DO here (by design; manifest-dom.ts harvests [data-surface], never prose). That leaves a real gap:
  // nothing surfaces what the page actually SAYS. `content` fills it, reading the SAME slice the desk
  // chat reasons over (`.app-shell__main` textContent — pageText() in ai/desk-door.ts), so "what the
  // terminal shows" and "what the AI sees" are one thing. Together: context = affordances, content = prose.
  t.register({ name: "content", args: "", help: "the readable text on THIS page (what the desk reads)", run(ctx) {
    const main = document.querySelector(".app-shell__main");
    const text = (main ? main.textContent : "").replace(/\s+/g, " ").trim();
    if (!text) { ctx.printErr("no readable text on this page (the desk would see nothing here either)."); return; }
    const MAX = 4000;   // keep the dump bounded in the console feed; the desk itself reads the full text
    ctx.print(`${location.pathname} — ${text.length} chars of readable text (context = what you can do; content = what it says):`);
    ctx.print(text.length > MAX ? text.slice(0, MAX) + " …[truncated, " + (text.length - MAX) + " more]" : text);
  }});

  // ── resume: the short version in the console; the full record is /resume ─────────────────────────
  t.register({ name: "resume", args: "", help: "the working record (opens /resume)", run(ctx) {
    ctx.print("Tjakoen Stolk — dev manager, tech lead, and part-time software engineering teacher.");
    ctx.print("I build AI-first, no-build interfaces (this whole site is one) and teach 100 to 150 students a semester.");
    ctx.print("I direct, Claude types.");
    ctx.printHtml('full record: <a href="/resume">/resume</a> · history: <a href="https://www.linkedin.com/in/tjakoenstolk">LinkedIn</a> · code: <a href="https://github.com/tjakoen">GitHub</a>');
  }});

  // ── easter eggs — each one honest about how this thing actually works ───────────────────────────
  t.register({ name: "sudo", args: "", help: "", run(ctx) {
    ctx.print("you're already the operator. Equal footing is the whole point here — no elevated mode to grant.");
  }});
  t.register({ name: "rm", args: "", help: "", run(ctx) {
    // rm -rf / and friends
    if (ctx.arg.includes("-rf") || ctx.arg.includes("/")) ctx.printErr("one vocabulary. There are no demolition verbs in the contract — so there's nothing to run.");
    else ctx.printErr("rm isn't a verb the desk understands. The whole surface is a closed set — see ‘context’.");
  }});
  t.register({ name: "vim", args: "", help: "", run(ctx) {
    ctx.print("no. This site already has one editor, and you're inside it.");
  }});

  // ── clearcache: the full local wipe — the same "start clean" the window Refresh (top-left) runs ──
  t.register({ name: "clearcache", args: "", help: "wipe everything saved here — chat, notes, tabs, the downloaded AI model — and reload", run(ctx) {
    const wipe = window.tjClearCache;
    if (typeof wipe !== "function") { ctx.printErr("the site island isn't up yet — try the Refresh button (top-left)."); return; }
    ctx.print("this clears EVERYTHING on this device: chat, notes, open tabs, and the model weights (~350MB).");
    wipe();   // shows the are-you-sure, then wipes + reloads; a no-op on cancel
  }});
  t.register({ name: "bake", args: "", help: "", async run(ctx) {
    const theme = window.grain && window.grain.theme;
    if (!theme || !theme.themes) return ctx.printErr("the oven's cold — theming isn't loaded.");
    const flavors = theme.themes();
    const start = theme.theme();
    const beats = [["proofing…", 0], ["scoring…", 1], ["baked.", 2]];
    for (const [word, i] of beats) {
      const f = flavors[i % flavors.length];
      ctx.print(`${word} ${f}`);
      try { theme.setTheme(f); } catch { /* skip a missing flavor */ }
      await wait(650);
    }
    try { theme.setTheme(start); } catch { /* restore */ }   // a demo, not a preference change
    ctx.print(`back to ${start}. (nothing actually saved — that was a show.)`);
  }});

})();
