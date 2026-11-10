// scripts/desk-consent.js — the desk asks before it stores a session cookie.
//
// A consent question is a chat message, not a browser banner: the same bubble the desk already
// speaks in, with two real buttons (molecules/chat-message, "Consent notice"). It is asked once, at
// the first exchange rather than on page load, because the question is about remembering a
// conversation that has actually started. Allow stores the tab's session id in a first-party cookie
// for 30 days; Not now stores nothing and the same tab is not asked again.
(() => {
  const LOG = document.querySelector('[data-surface="chat-log"]');
  const session = window.__DESK_SESSION__;
  if (!LOG || !session) return;
  const stored = document.cookie.split("; ").some((cookie) => cookie.startsWith("desk_session="));
  const remembered = () => stored && sessionStorage.getItem("desk-history-scope") === "device";
  let answered = false;
  try { answered = remembered() || Boolean(sessionStorage.getItem("desk-consent")); } catch { /* private mode */ }
  LOG.querySelectorAll("[data-consent-notice]").forEach((notice) => notice.remove());
  if (answered) return;

  const ask = () => {
    if (LOG.querySelector("[data-consent-notice]")) return;
    const message = document.createElement("div");
    message.className = "chat-message";
    message.dataset.role = "ai";
    message.dataset.grade = "grain";
    message.dataset.consentNotice = "";
    message.dataset.surface = "desk-consent";
    message.innerHTML =
      '<span class="chat-message__who">GRAIN</span>' +
      '<span class="chat-message__body">May the Desk remember this conversation on this device? If you allow it, the Desk saves your chat and its terminal history in this browser and uses a cookie for 30 days. Otherwise, this conversation stays in this tab.</span>' +
      '<div class="chat-message__actions">' +
      '<button class="btn" data-variant="soft" type="button" data-consent="allow">Remember this chat</button>' +
      '<button class="btn" data-variant="outline" type="button" data-consent="deny">Not now</button>' +
      "</div>";
    LOG.append(message);
    message.addEventListener("click", (event) => {
      const button = event.target.closest("[data-consent]");
      if (!button) return;
      const allow = button.dataset.consent === "allow";
      try { sessionStorage.setItem("desk-consent", allow ? "allow" : "deny"); } catch { /* private mode */ }
      message.remove();
      if (allow) {
        const secure = location.protocol === "https:" ? "; Secure" : "";
        document.cookie = `desk_session=${encodeURIComponent(session)}; Path=/; SameSite=Lax; Max-Age=2592000${secure}`;
        window.dispatchEvent(new Event("desk:remember"));
      }
    });
  };

  if (LOG.querySelector('[data-role="you"]')) ask();
  else {
    const observer = new MutationObserver(() => {
      if (!LOG.querySelector('[data-role="you"]')) return;
      observer.disconnect();
      setTimeout(ask, 700); // let the reply land before the desk changes the subject
    });
    observer.observe(LOG, { childList: true, subtree: true });
  }
})();
