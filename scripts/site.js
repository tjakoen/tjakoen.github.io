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
    document.querySelector("[data-window-refresh]")?.addEventListener("click", () => location.reload());
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

    // ---- the EXPLORER (the file-tree rail): mark the open file, unfold its ancestors (folders
    // ship collapsed), and fill the collection folders (notes/) with their real .md entries from
    // the ⌘K corpus — each added entry is a plain <a>, the tree stays hypermedia.
    const tree = document.querySelector(".file-tree");
    if (tree) {
      const normed = (h) => (h || "").replace(/\/+$/, "") || "/";
      const markCurrent = () => {
        for (const a of tree.querySelectorAll("a.file-tree__file")) {
          if (normed(a.getAttribute("href")) !== path) continue;
          a.setAttribute("aria-current", "page");
          for (let d = a.closest("details"); d; d = d.parentElement && d.parentElement.closest("details"))
            d.setAttribute("open", "");
        }
      };
      markCurrent();
      const fills = [...tree.querySelectorAll("[data-tree-fill]")];
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
    const persist = (ancestorSel, surface, key, cap) => {
      const root = document.querySelector(ancestorSel);
      if (!root) return null;
      const cur = () => root.querySelector(`[data-surface="${surface}"]`);
      const el0 = cur();
      if (!el0) return null;
      const saved = get(key);
      if (saved != null) el0.innerHTML = saved;
      let t = null;
      const save = () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const el = cur();
          if (!el) return;
          while (el.children.length > cap) el.removeChild(el.firstElementChild);
          put(key, el.innerHTML);
        }, 400);                                   // debounce: type/stream ops mutate rapidly
      };
      new MutationObserver(save).observe(root, { childList: true, subtree: true, characterData: true });
      return el0;
    };
    const chatLog = persist(".app-shell__aside", "chat-log", KEY.chat, 40);
    persist(".app-shell__console", "console", KEY.term, 60);

    // ---- fresh cache: the desk greets in the chat (typed). Only when there's no stored
    // conversation yet; once greeted it's persisted, so return visits restore it instead.
    if (chatLog && get(KEY.chat) == null) {
      const msg = document.createElement("div");
      msg.className = "chat-message"; msg.setAttribute("data-role", "ai"); msg.setAttribute("data-grade", "grain");
      msg.innerHTML = `<span class="chat-message__who">Desk</span><span class="chat-message__body"></span>`;
      chatLog.appendChild(msg);                    // a real .chat-message → the empty-state hides
      const body = msg.querySelector(".chat-message__body");
      const hello = "Hi — I'm the desk. Ask me about TJ, or anything on this site. I'll answer here and think out loud in the terminal.";
      let i = 0;
      const tick = () => {                         // lightweight typewriter (the "type" flourish)
        body.textContent = hello.slice(0, ++i);
        if (i < hello.length) setTimeout(tick, 18);
      };
      tick();
    }

    // ---- rest-state suggestion chips: swap in a per-page set, then route a click through the
    // SAME one door as the composer (set the input's value, fire the existing Send). The CSS hides
    // the whole row once your first `you` turn lands; these are just a fast way in for a cold visit.
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
      "/calendar": ["What is this feed?", "How is this site built?", "Who is TJ?"],
      "/mail":     ["How do I reach TJ?", "What is this inbox?", "Who is TJ?"],
    };
    const chips = document.querySelector("[data-suggest-chips]");
    if (chips) {
      const pick = () => {
        if (SUGGEST[path]) return SUGGEST[path];        // exact, else longest matching prefix
        let best = null;
        for (const key in SUGGEST) {
          if (key !== "/" && path.startsWith(key) && (!best || key.length > best.length)) best = key;
        }
        return best ? SUGGEST[best] : null;
      };
      const set = pick();
      if (set) {
        chips.replaceChildren(...set.map((q) => {
          const b = document.createElement("button");
          b.type = "button"; b.className = "suggest-chip"; b.setAttribute("data-suggest-ask", "");
          b.textContent = q;                            // textContent: never inject markup
          return b;
        }));
      }
      chips.addEventListener("click", (ev) => {
        const chip = ev.target.closest("[data-suggest-ask]");
        if (!chip) return;
        const input = document.querySelector('[data-surface="chat-input"]');
        const send = document.querySelector('.assistant__composer [data-action="chat.send"][data-from]');
        if (!input || !send) return;
        input.value = chip.textContent;                 // reuse the one door: same path as typing + Send
        send.click();
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
