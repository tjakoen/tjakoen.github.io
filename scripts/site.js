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

  // ---- startup redirect (BEFORE paint): "/" honors the welcome checkbox — unchecked means
  // the desk opens straight to where you last were (falling back to the workspace). STARTUP
  // only: once this browsing session has booted, "/" opens normally — otherwise the pinned
  // Welcome tab (and any in-site link home) would bounce right back.
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const booted = (() => { try { return sessionStorage.getItem("tj.booted") === "1"; } catch { return true; } })();
  try { sessionStorage.setItem("tj.booted", "1"); } catch { /* private mode */ }
  if (path === "/" && !booted && get(KEY.startup) === "off") {
    const last = get(KEY.lastPage);
    location.replace(last && last !== "/" ? last : "/loop");
    return;                                          // stop — this page is being left
  }

  document.addEventListener("DOMContentLoaded", () => {
    // ---- remember the open page (the "reopen where you left off" cache)
    if (path !== "/") put(KEY.lastPage, path);

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

    // ---- the welcome checkbox (functional): checked = land on the welcome page
    const startup = document.querySelector("[data-startup-checkbox]");
    if (startup) {
      startup.checked = get(KEY.startup) !== "off";
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
  });
})();
