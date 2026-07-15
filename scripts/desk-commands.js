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
    ctx.printHtml('full record: <a href="/resume">/resume</a> · history: <a href="https://www.linkedin.com/in/tjakoen-stolk-53b449126/">LinkedIn</a> · code: <a href="https://github.com/tjakoen">GitHub</a>');
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
