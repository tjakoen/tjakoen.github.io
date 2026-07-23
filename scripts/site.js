// portfolio/scripts/site.js — the portfolio's own site island (THE EDITOR chrome behaviors).
// Loaded render-BLOCKING in <head> (composition root) because the startup redirect must run
// before first paint; everything DOM-facing waits for DOMContentLoaded. Persona and product
// choices live HERE, not in grain: grain ships the mechanisms (app-window, status-bar,
// theme.js, ai-dispatch's data-ai-online), this file wires them to TJ's site.
(() => {
  "use strict";
  if (window.tjSite) return;   // idempotent
  window.tjSite = true;

  const KEY = { startup: "tj.welcome-startup", lastPage: "tj.last-page", chat: "tj.chat", term: "tj.terminal" };
  const store = (() => { try { return window.localStorage; } catch { return null; } })();
  const get = (k) => { try { return store && store.getItem(k); } catch { return null; } };
  const put = (k, v) => { try { if (store) store.setItem(k, v); } catch { /* private mode */ } };
  const del = (k) => { try { if (store) store.removeItem(k); } catch { /* private mode */ } };

  // ---- "clear everything" — the full local wipe behind the window Refresh (top-left) and the
  // `clearcache` terminal command. Clears ALL device-local state: localStorage (chat history, notes,
  // open tabs, the welcome setting, the saved model choice), sessionStorage (the desk's per-visit
  // arrival/tier/warm flags), and — the heavy one — the browser Cache API + IndexedDB, where WebLLM
  // stores the downloaded model weights (~350MB-1.1GB). So a wipe truly starts clean, model and all.
  async function wipeAll() {
    try { window.localStorage && window.localStorage.clear(); } catch { /* private mode */ }
    try { window.sessionStorage && window.sessionStorage.clear(); } catch { /* private mode */ }
    // WebLLM caches weights in the Cache API (grain webllm.ts); clearing every cache reclaims it.
    try { if (window.caches) { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); } } catch { /* no CacheStorage */ }
    // Belt-and-suspenders: some MLC builds keep config/wasm in IndexedDB too.
    try {
      if (window.indexedDB && indexedDB.databases) {
        const dbs = await indexedDB.databases();
        await Promise.all(dbs.map((d) => d && d.name ? new Promise((res) => { const r = indexedDB.deleteDatabase(d.name); r.onsuccess = r.onerror = r.onblocked = () => res(); }) : null));
      }
    } catch { /* no IndexedDB.databases (Safari < 14) — the Cache API clear already freed the model */ }
  }
  // are-you-sure → wipe → reload. `window.confirm` is the platform's own confirm primitive
  // (native-first: no library, no bespoke modal). Exposed on window so desk-commands.js's `clearcache`
  // runs the exact same flow. Returns false on cancel (nothing touched).
  const CLEAR_MSG = "Clear everything saved on this device — chat history, notes, open tabs, your welcome setting, and the downloaded AI model? You'll start clean.";
  async function clearEverything() {
    if (!window.confirm(CLEAR_MSG)) return false;
    await wipeAll();
    location.reload();
    return true;
  }
  window.tjClearCache = clearEverything;

  // ---- close every open SSE stream before a hard navigation (BEFORE ai-dispatch.js runs).
  // This site does full-document navigations (no client router), so grain/scripts/ai-dispatch.js's
  // `/stream` EventSource is still connected the instant the browser tears the page down; Chrome
  // aborts that open chunked response mid-flight and logs `net::ERR_INCOMPLETE_CHUNKED_ENCODING`
  // on every navigation — harmless, but it drowns out real console errors. ai-dispatch.js doesn't
  // expose its EventSource instance for a host to close, so wrap the constructor here (site.js runs
  // synchronously in <head>, ahead of ai-dispatch's deferred module script in the body) and close
  // every tracked stream on the way out.
  if (typeof window.EventSource === "function") {
    const NativeEventSource = window.EventSource;
    const liveStreams = new Set();
    window.EventSource = class extends NativeEventSource {
      constructor(...args) {
        super(...args);
        liveStreams.add(this);
        this.addEventListener("error", () => { if (this.readyState === this.CLOSED) liveStreams.delete(this); });
      }
    };
    const closeAllStreams = () => { for (const es of liveStreams) es.close(); liveStreams.clear(); };
    window.addEventListener("pagehide", closeAllStreams);
    window.addEventListener("beforeunload", closeAllStreams);
  }

  // ---- refresh redirect (BEFORE paint): the welcome checkbox fires on every actual REFRESH
  // (F5 / reload), on ANY page — not just "/", and not just the first one this session.
  // CHECKED: refreshing anywhere always re-opens Welcome ("show welcome page on refresh").
  // UNCHECKED (the default): refreshing "/" specifically reopens wherever you last were
  // (a stale/forgotten Welcome tab is more useful jumping forward than sitting blank);
  // refreshing anywhere ELSE is untouched — you're already exactly where you meant to be.
  // A plain NAVIGATE (the pinned Welcome tab, a tab-close fallback, the logo, any link) is
  // NEVER affected by the checkbox — that's an intentional visit, not a refresh, and must not
  // bounce the visitor straight back out. Navigation Timing tells reload from navigate; falls
  // open (treat as navigate) if the API is unavailable.
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const last = get(KEY.lastPage);
  const isReload = (() => {
    try { return performance.getEntriesByType("navigation")[0]?.type === "reload"; } catch { return false; }
  })();
  if (isReload) {
    if (get(KEY.startup) === "on" && path !== "/") { location.replace("/"); return; }
    if (path === "/" && get(KEY.startup) !== "on" && last && last !== "/") { location.replace(last); return; }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // ---- remember the open page (the "reopen where you left off" cache)
    if (path !== "/") put(KEY.lastPage, path);

    // ---- mobile: the open-tabs strip (grain/scripts/tabs.js) scrolls horizontally with no
    // memory of position; with enough open tabs the active one can render off-screen on load,
    // clipped with no visible cue it's just a scroll away. rAF, not immediate: tabs.js's own
    // render() (also deferred) must land first so `aria-current="page"` actually exists yet.
    requestAnimationFrame(() => {
      document.querySelector('.tab-bar[data-open-tabs] [aria-current="page"]')
        ?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });

    // ---- the window nav: back / refresh / forward (VS Code-style, our hover color)
    document.querySelector("[data-window-back]")?.addEventListener("click", () => history.back());
    // The window Refresh is the "start clean" control: it wipes ALL local state (incl. the cached AI
    // model) after an are-you-sure, not a plain reload. (A plain reload is still one F5 / Cmd-R away.)
    document.querySelector("[data-window-refresh]")?.addEventListener("click", () => { void clearEverything(); });
    document.querySelector("[data-window-forward]")?.addEventListener("click", () => history.forward());

    // ---- the breadcrumb (status bar, next to presence) = the open page's path, AS LINKS:
    // every segment navigates to its level (the site name goes home); only the last — the page
    // you're on — stays plain text. Same paths as the explorer tree: one vocabulary.
    const crumb = document.querySelector("[data-breadcrumb]");
    if (crumb) {
      crumb.replaceChildren();
      const seg = (text, href) => {
        if (crumb.childNodes.length) crumb.appendChild(document.createTextNode(" / "));
        if (!href) return void crumb.appendChild(document.createTextNode(text));
        const a = document.createElement("a"); a.href = href; a.textContent = text;
        crumb.appendChild(a);
      };
      const parts = path === "/" ? ["welcome"] : path.split("/").filter(Boolean);
      seg("tjakoen.github.io", path === "/" ? null : "/");
      parts.forEach((p, i) => seg(p, i < parts.length - 1 ? "/" + parts.slice(0, i + 1).join("/") : null));
    }

    // ---- the EXPLORER (the file-tree rail) + the APP DOCK below it: mark the open file (and
    // unfold its ancestors — folders ship collapsed) in the tree, and the active app in the dock.
    // The dock uses a PREFIX match for Notes (so /notes/anything keeps it lit — Notes claims a
    // real page + its subpages) and an EXACT match for the rest (Calendar/Mail/About are single
    // pages, no subtree to claim). [data-tree-fill] boxes (if a future folder adds one) still fill
    // from the ⌘K corpus — each added entry is a plain <a>, the tree stays hypermedia.
    const tree = document.querySelector(".file-tree");
    const dock = document.querySelector(".app-dock");
    if (tree || dock) {
      const normed = (h) => (h || "").replace(/\/+$/, "") || "/";
      const markCurrent = () => {
        if (tree) {
          for (const a of tree.querySelectorAll("a.file-tree__file")) {
            if (normed(a.getAttribute("href")) !== path) continue;
            a.setAttribute("aria-current", "page");
            for (let d = a.closest("details"); d; d = d.parentElement && d.parentElement.closest("details"))
              d.setAttribute("open", "");
          }
        }
        if (dock) {
          for (const a of dock.querySelectorAll(".app-dock__item")) {
            const raw = a.getAttribute("href");
            if (raw === null) { a.removeAttribute("aria-current"); continue; }  // an ACTION (the Tour launcher, no href) is never a "current page" — else normed(null)→"/" falsely matches home
            const href = normed(raw);
            const isMatch = href === "/notes"
              ? (path === href || path.startsWith(href + "/"))   // Notes claims its subpages too
              : path === href;                                   // everything else is exact-only
            if (isMatch) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
          }
        }
      };
      markCurrent();
      const fills = tree ? [...tree.querySelectorAll("[data-tree-fill]")] : [];
      if (fills.length) fetch("/search.json").then((r) => r.json()).then(({ pages = [] }) => {
        for (const box of fills) {
          const prefix = normed(box.getAttribute("data-tree-fill"));
          for (const p of pages) {
            const url = normed(p.url);
            if (!url.startsWith(prefix + "/") || box.querySelector(`a[href="${url}"]`)) continue;
            const a = document.createElement("a");
            a.className = "file-tree__file";
            a.href = url;
            a.textContent = url.slice(prefix.length + 1) + ".md";   // the REAL source file's name
            box.appendChild(a);
          }
        }
        markCurrent();
        window.grain && window.grain.tabs && window.grain.tabs.refresh();   // labels may resolve now
      }).catch(() => { /* corpus unreachable → the static tree still navigates */ });
    }

    // ---- the welcome checkbox (functional): checked = "/" always opens Welcome;
    // unchecked (default, unset reads as unchecked) = reopen where you left off.
    const startup = document.querySelector("[data-startup-checkbox]");
    if (startup) {
      startup.checked = get(KEY.startup) === "on";
      startup.addEventListener("change", () => put(KEY.startup, startup.checked ? "on" : "off"));
    }

    // ---- "Dark mode defaults to system": checked = follow the OS. grain/theme.js treats an UNSET
    // grain-color-scheme as `auto` (the OS wins, no forced-override flash), so "defaults to system"
    // IS the auto/unset state. Checked ⇒ setScheme("auto") clears the key; unchecked ⇒ pin the
    // scheme that's showing right now so the OS stops driving it. Drive it through grain's own
    // setScheme (falls back to raw storage if theme.js hasn't attached yet).
    const schemeAuto = document.querySelector("[data-scheme-auto-checkbox]");
    if (schemeAuto) {
      const SCHEME_KEY = "grain-color-scheme";
      const theme = window.grain && window.grain.theme;
      const prefersDark = () => { try { return matchMedia("(prefers-color-scheme: dark)").matches; } catch { return false; } };
      const isAuto = () => theme ? theme.scheme() === "auto" : get(SCHEME_KEY) == null;
      // reflect the LIVE scheme, not just the initial one: the ◐ light/dark toggle (and setScheme from
      // anywhere) forces an explicit scheme, which must un-tick "defaults to system". Without this the
      // box went stale — it stayed ticked while the ◐ button had already pinned a scheme, so it read as
      // broken. grain/theme.js writes data-color-scheme on <html>, so observe THAT as the source of truth.
      const syncBox = () => { schemeAuto.checked = isAuto(); };
      syncBox();
      new MutationObserver(syncBox).observe(document.documentElement, { attributes: true, attributeFilter: ["data-color-scheme"] });
      addEventListener("storage", (e) => { if (e.key === SCHEME_KEY) syncBox(); });   // another tab changed it
      schemeAuto.addEventListener("change", () => {
        if (schemeAuto.checked) {
          theme ? theme.setScheme("auto") : del(SCHEME_KEY);
        } else {
          const cur = theme ? theme.scheme() : (get(SCHEME_KEY) || "auto");
          const eff = cur === "auto" ? (prefersDark() ? "dark" : "light") : cur;   // pin what's on screen now
          theme ? theme.setScheme(eff) : put(SCHEME_KEY, eff);
        }
      });
    }

    // ---- offline degradation: if the door never came up (body[data-ai-online="false"], set
    // by ai-dispatch by OUTCOME), the chat composer disables honestly instead of pretending.
    const composer = document.querySelectorAll(".assistant__composer input, .assistant__composer button");
    const applyPresence = () => {
      const off = document.body.dataset.aiOnline === "false";
      for (const el of composer) {
        el.disabled = off;
        if (off && el.matches("input")) el.placeholder = "The desk is offline";
      }
    };
    new MutationObserver(applyPresence).observe(document.body, { attributes: true, attributeFilter: ["data-ai-online"] });
    applyPresence();

    // ---- persistent chat + terminal across navigation (this is an MPA: each page is a fresh
    // document, so the desk's conversation and its narration would reset on every nav. Restore
    // both from localStorage on load, and save on change — capped so they can't grow unbounded).
    // A `replace` RenderOp swaps a surface NODE (outerHTML), so bind the observer to a STABLE
    // ancestor and re-query the surface each time — otherwise persistence orphans after the first run.
    const flushers = [];                           // synchronous "save NOW" for each persisted surface
    const persist = (ancestorSel, surface, key, cap) => {
      const root = document.querySelector(ancestorSel);
      if (!root) return null;
      const cur = () => root.querySelector(`[data-surface="${surface}"]`);
      const el0 = cur();
      if (!el0) return null;
      const saved = get(key);
      if (saved != null) el0.innerHTML = saved;
      // the actual write — shared by the debounced saver AND the flush-on-exit below.
      const flush = () => {
        const el = cur();
        if (!el) return;
        while (el.children.length > cap) el.removeChild(el.firstElementChild);
        put(key, el.innerHTML);
      };
      flushers.push(flush);
      let t = null;
      const save = () => { clearTimeout(t); t = setTimeout(flush, 400); };   // debounce: stream ops mutate rapidly
      new MutationObserver(save).observe(root, { childList: true, subtree: true, characterData: true });
      return el0;
    };
    const chatLog = persist(".app-shell__aside", "chat-log", KEY.chat, 40);
    persist(".app-shell__console", "console", KEY.term, 60);
    // FLUSH before the page tears down: the debounced save is often mid-wait when the desk (or the
    // user) navigates — and typing/streaming keeps resetting it — so without this the chat + terminal
    // vanish on every navigation. pagehide fires on real nav; visibilitychange covers bfcache/mobile.
    const flushAll = () => { for (const f of flushers) f(); };
    window.addEventListener("pagehide", flushAll);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flushAll(); });

    // ---- chat: keep the log pinned to the NEWEST message (stick-to-bottom, but yield the moment the
    // visitor scrolls up to read history). Without this a streamed reply lands below the fold and the
    // chat reads as "not scrolling". Runs on load (restored conversation) and on every new bubble/token.
    if (chatLog) {
      const nearBottom = () => chatLog.scrollHeight - chatLog.scrollTop - chatLog.clientHeight < 64;
      let stick = true;
      chatLog.addEventListener("scroll", () => { stick = nearBottom(); });
      new MutationObserver(() => { if (stick) chatLog.scrollTop = chatLog.scrollHeight; })
        .observe(chatLog, { childList: true, subtree: true, characterData: true });
      chatLog.scrollTop = chatLog.scrollHeight;   // land on the newest message on load
    }

    // ---- terminal: once the AI ACTS (grain sets data-acting on the shell during a run), keep the
    // console OPEN so its narration STAYS visible like the chat, instead of collapsing back to the
    // "Terminal ▸" bar and hiding what just happened. grain's own console-open persistence then
    // carries that open state across navigations.
    const actShell = document.querySelector(".app-shell");
    if (actShell) {
      new MutationObserver(() => {
        if (actShell.getAttribute("data-acting") === "true") actShell.setAttribute("data-console-open", "");
      }).observe(actShell, { attributes: true, attributeFilter: ["data-acting"] });
    }

    // ---- the desk greets in the chat (typed). Shared by first load (no stored conversation) and
    // "New chat" (below), which clears the log first. Once greeted it's persisted, so return visits
    // restore it instead of re-greeting.
    const greet = () => {
      if (!chatLog) return;
      const msg = document.createElement("div");
      msg.className = "chat-message"; msg.setAttribute("data-role", "ai"); msg.setAttribute("data-grade", "grain");
      msg.innerHTML = `<span class="chat-message__who">Desk</span><span class="chat-message__body"></span>`;
      chatLog.appendChild(msg);                    // a real .chat-message → the empty-state hides
      const body = msg.querySelector(".chat-message__body");
      // Honest onboarding: only capabilities that actually work (ai/actions.ts's deterministic
      // router + the grounded chat) — no hype, matches VOICE (no dashes in prose).
      const hello = "Hi, I'm the desk. Ask me about TJ, the BREAD stack, or this site, and I'll answer here and think out loud in the terminal. I can also take you somewhere or open the latest note, just ask.";
      let i = 0;
      const tick = () => {                         // lightweight typewriter (the "type" flourish)
        body.textContent = hello.slice(0, ++i);
        if (i < hello.length) setTimeout(tick, 18);
      };
      tick();
    };
    if (chatLog && get(KEY.chat) == null) greet();

    // ---- suggestion chips: seed a per-page starter set; the desk then REPLACES them with contextual
    // follow-ups after each answer (desk-reasoner). A click routes through the SAME one door as the
    // composer (set the input's value, fire the existing Send). The row stays visible all conversation.
    const SUGGEST = {
      "/":         ["What is BREAD?", "Who is TJ?", "Watch the AI act"],
      "/bread":    ["Why four layers?", "What is PANTRY?", "Is this stack live?"],
      "/grain":    ["What does 'grain' mean?", "How does the one door work?", "Watch the AI act"],
      "/batch":    ["What is the substrate?", "Why no build step?", "What runs this site?"],
      "/mill":     ["What does MILL do?", "How are the notes rendered?", "Show me a note"],
      "/proof":    ["What is a plan board?", "How does PROOF track work?", "Why plans as files?"],
      "/pantry":   ["What does PANTRY compose?", "How does the app boot?", "What is the composition root?"],
      "/notes":    ["What's the flagship post?", "How does TJ use AI?", "Why teach with AI?"],
      "/about":    ["How do I reach TJ?", "What's TJ's background?", "Is there a résumé?"],
      "/loop":     ["What is the workspace?", "Watch the AI act", "How does the desk work?"],
      "/calendar": ["What's on the calendar?", "How is this site built?", "Who is TJ?"],
      "/mail":     ["How do I reach TJ?", "What is this inbox?", "Who is TJ?"],
    };
    const mkChip = (q) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "suggest-chip"; b.setAttribute("data-suggest-ask", "");
      b.textContent = q;                                // textContent: never inject markup
      return b;
    };
    const pickSuggest = () => {
      if (SUGGEST[path]) return SUGGEST[path];          // exact, else longest matching prefix
      let best = null;
      for (const key in SUGGEST) {
        if (key !== "/" && path.startsWith(key) && (!best || key.length > best.length)) best = key;
      }
      return best ? SUGGEST[best] : null;
    };
    // The starter chip set: the always-pinned "What can I do here?", the two headline ACTIONS
    // (summarize / open the latest note — both routed deterministically by the desk), then a topical
    // page suggestion. The desk swaps these for contextual follow-ups after each answer (but keeps the
    // pin first). These strings must match the desk's action router (ai/actions.ts).
    const PINNED_CHIP = "What can I do here?";
    const setDefaultChips = () => {
      const chips = document.querySelector("[data-suggest-chips]");
      if (!chips) return;
      const topical = (pickSuggest() || []).slice(0, 1);
      const full = [PINNED_CHIP, "Summarize this page", "Show me the latest note", ...topical];
      chips.replaceChildren(...full.map(mkChip));
    };
    setDefaultChips();

    // Delegate the chip click on the STABLE suggest ROW, not the chips container: the desk replaces
    // that container after each answer (contextual follow-ups), so a listener bound to it would die
    // with the first swap. The row itself is never replaced.
    const suggestRow = document.querySelector(".assistant__suggest");
    if (suggestRow) {
      suggestRow.addEventListener("click", (ev) => {
        const chip = ev.target.closest("[data-suggest-ask]");
        if (!chip) return;
        const input = document.querySelector('[data-surface="chat-input"]');
        const send = document.querySelector('.assistant__composer [data-action="chat.send"][data-from]');
        if (!input || !send) return;
        input.value = chip.textContent;                 // reuse the one door: same path as typing + Send
        send.click();
      });
    }

    // ---- mark the desk "warm" the first time the visitor engages it (any chat.send: a typed message
    // or a chip). The desk door reads this session flag on load to decide whether to run page-arrival
    // awareness (a greeting + contextual chips read from the new page) on later navigations — so a
    // visitor who never opened the desk is never forced to load the browser model just by navigating.
    const markWarm = () => { try { sessionStorage.setItem("desk-warm", "1"); } catch { /* private mode */ } };
    document.addEventListener("click", (ev) => {
      const t = ev.target;
      if (t && t.closest && t.closest('[data-action="chat.send"]')) markWarm();
    });
    document.addEventListener("keydown", (ev) => {
      const t = ev.target;
      if (ev.key === "Enter" && t && t.matches && t.matches('[data-surface="chat-input"]')) markWarm();
    });

    // ---- New chat: clear the conversation + the desk's in-memory turns, re-greet, and restore this
    // page's starter chips. The model itself stays loaded (deskReset only forgets the turns).
    const newChatBtn = document.querySelector("[data-desk-newchat]");
    if (newChatBtn) {
      newChatBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();                           // don't also toggle the mobile sheet (head = grab bar)
        if (chatLog) chatLog.innerHTML = '<p class="assistant__empty">Ask the desk about TJ — or anything on this site. It answers here, and narrates its work in the terminal below.</p>';
        del(KEY.chat);
        if (typeof window.deskReset === "function") window.deskReset();
        greet();                                        // fresh greeting (also re-persists a clean log)
        setDefaultChips();                              // swap the follow-ups back to page starters
      });
    }

    // ---- mobile bottom sheet: grain's scrim handler only closes the RAIL drawer, so a scrim tap
    // (or Escape) wouldn't lower the assistant sheet. Wire those here. The grab bar (.assistant__head)
    // and the FAB (focus-chat) already open/close it through grain's shell.js.
    const shell = document.querySelector(".app-shell");
    if (shell) {
      const closeSheet = () => shell.removeAttribute("data-aside-open");
      shell.querySelector(".app-shell__scrim")?.addEventListener("click", closeSheet);
      document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape" && shell.hasAttribute("data-aside-open")) closeSheet();
      });
    }
  });
})();
