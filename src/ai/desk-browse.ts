const MODE_KEY = "desk-mode";

export function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    matchMedia("(max-width: 768px) and (pointer: coarse)").matches;
}

export function mountDeskBrowse({
  canRun, downloadNote, mobile,
}: {
  canRun: boolean;
  downloadNote: string;
  mobile: MediaQueryList;
}) {
  const phone = isMobileDevice();
  let preferred: "browse" | "local" = "local";
  try { if (sessionStorage.getItem(MODE_KEY) === "browse") preferred = "browse"; } catch { /* storage may be blocked */ }
  let failed = false;
  const allowsModel = () => !phone && canRun && !failed && preferred === "local";
  const panel = document.querySelector<HTMLElement>("#desk-browse");
  const intro = document.querySelector<HTMLElement>("[data-browse-intro]");
  const assistant = document.querySelector<HTMLElement>(".assistant");
  const chatTab = assistant?.querySelector<HTMLButtonElement>('[data-shell-mode="chat"]');
  const browseTab = assistant?.querySelector<HTMLButtonElement>('[data-shell-mode="browse"]');
  const log = assistant?.querySelector<HTMLElement>(".assistant__log");
  // The download cost is said in the chat itself: a second desk bubble under the greeting, shown
  // only while the conversation has not started, because the first message starts the download.
  const showModelNotice = (local: boolean) => {
    if (!log) return;
    log.querySelectorAll("[data-model-notice]").forEach((notice) => notice.remove());
    if (!local || log.querySelector('.chat-message[data-role="you"]')) return;
    const message = document.createElement("div");
    message.className = "chat-message";
    message.dataset.role = "ai";
    message.dataset.modelNotice = "";
    message.dataset.surface = "desk-model-notice";
    const who = document.createElement("span");
    who.className = "chat-message__who";
    who.textContent = "Desk";
    const body = document.createElement("span");
    body.className = "chat-message__body";
    body.textContent = `I run on your device. ${downloadNote}`;
    message.append(who, body);
    log.append(message);
  };
  const selectDeskPane = () => {
    if (!assistant || !panel) return;
    const browse = !allowsModel();
    assistant.dataset.mode = browse ? "browse" : "chat";
    for (const pane of assistant.querySelectorAll<HTMLElement>(".assistant__pane"))
      pane.hidden = pane.dataset.pane !== assistant.dataset.mode;
    for (const tab of assistant.querySelectorAll<HTMLElement>("[data-shell-mode]"))
      tab.setAttribute("aria-selected", String(tab.dataset.shellMode === assistant.dataset.mode));
  };
  const entryLabels = [...document.querySelectorAll<HTMLElement>("[data-desk-browse-label]")]
    .map((element) => ({ element, local: element.textContent, browse: element.dataset.deskBrowseLabel }));
  const render = () => {
    const local = allowsModel();
    document.body.dataset.deskMode = local ? "local" : "browse";
    if (chatTab) chatTab.hidden = phone || !canRun || failed;
    if (browseTab) browseTab.hidden = false;
    for (const label of entryLabels) label.element.textContent = local ? label.local : label.browse ?? "";
    showModelNotice(local);
    if (assistant?.dataset.mode === "chat" || assistant?.dataset.mode === "browse") selectDeskPane();
    if (intro) {
      intro.textContent = phone
        ? "On mobile, Browse shows recent updates and shortcuts. No AI model is downloaded."
        : failed || !canRun
          ? "Local AI is unavailable here. You can still open recent updates and shortcuts."
          : "Open a recent update or jump to a section.";
    }
  };

  function choose(mode: "browse" | "local") {
    preferred = mode;
    try { sessionStorage.setItem(MODE_KEY, mode); } catch { /* current page still works */ }
    render();
  }
  chatTab?.addEventListener("click", () => choose("local"));
  browseTab?.addEventListener("click", () => choose("browse"));
  render();

  // The shared shell's focus links target the chat composer. In Browse, open the same panel
  // and move focus to a visible control instead.
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-shell="focus-chat"]')) return;
    const shell = document.querySelector(".app-shell");
    if (!shell || !panel) return;
    event.preventDefault();
    event.stopPropagation();
    selectDeskPane();
    shell.removeAttribute("data-aside-hidden");
    if (mobile.matches) shell.setAttribute("data-aside-open", "true");
    if (allowsModel()) assistant?.querySelector<HTMLElement>('[data-surface="chat-input"]')?.focus();
    else browseTab?.focus();
  }, true);

  const recent = panel?.querySelector<HTMLElement>("[data-desk-recent]");
  const shell = assistant?.closest(".app-shell");
  if (recent && panel && shell) {
    const endpoint = new URL("../../../recent.json", import.meta.url);
    const base = new URL(".", endpoint);
    let pending = false;
    const visible = () => !document.hidden && !panel.hidden &&
      !shell.hasAttribute("data-aside-hidden") && (!mobile.matches || shell.hasAttribute("data-aside-open"));
    const refreshRecent = async () => {
      if (!visible() || pending) return;
      pending = true;
      try {
        const response = await fetch(endpoint, { cache: "no-cache" });
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !visible()) return;
        const rows: HTMLAnchorElement[] = [];
        for (const item of data.slice(0, 4)) {
          if (typeof item?.href !== "string" || !/^\/(?:notes|calendar)\//.test(item.href) ||
              typeof item.title !== "string" || typeof item.kindLabel !== "string") continue;
          const url = new URL("." + item.href, base);
          if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) continue;
          const link = document.createElement("a");
          link.className = "recent__item";
          link.href = url.href;
          const kind = document.createElement("span");
          kind.className = "recent__type";
          kind.textContent = item.kindLabel;
          const title = document.createElement("span");
          title.className = "recent__name";
          title.textContent = item.title;
          link.append(kind, title);
          rows.push(link);
        }
        const current = [...recent.querySelectorAll<HTMLAnchorElement>("a")];
        if (current.length === rows.length && rows.every((row, i) =>
          row.href === current[i]?.href &&
          row.firstElementChild?.textContent === current[i]?.querySelector(".recent__type")?.textContent &&
          row.lastElementChild?.textContent === current[i]?.querySelector(".recent__name")?.textContent)) return;
        if (!recent.contains(document.activeElement)) recent.replaceChildren(...rows);
      } catch { /* Keep the updates already on screen if the connection drops. */ }
      finally { pending = false; }
    };
    const observer = new MutationObserver(() => void refreshRecent());
    observer.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
    observer.observe(shell, { attributes: true, attributeFilter: ["data-aside-open", "data-aside-hidden"] });
    document.addEventListener("visibilitychange", refreshRecent);
    setInterval(refreshRecent, 60_000);
    void refreshRecent();
  }

  return {
    allowsModel,
    markFailed() { failed = true; render(); },
  };
}
