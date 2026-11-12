export const nestDesktop = matchMedia("(min-width: 769px) and (hover: hover) and (pointer: fine)");

// How rare the stray ant is. The first one is due after two to four minutes of reading, and each
// later one after ten to twenty. Both are counted in time the tab was visible, and the count is
// kept for the tab, so moving from one page to the next does not start it over.
export const firstStrayDelay = () => 120000 + Math.random() * 120000;
export const nextStrayDelay = () => 600000 + Math.random() * 600000;
export const STRAY_KEY = "nest-stray-clicked";
export const STRAY_WAIT_KEY = "nest-stray-wait";
export const strayConsumed = () => {
  try { return sessionStorage.getItem(STRAY_KEY) === "1"; } catch { return false; }
};

// The reading time still owed before the next stray. A tab with no count yet draws its first one.
// In private mode the storage throws, and the wait falls back to one page's worth.
export const strayWait = () => {
  try {
    const kept = Number(sessionStorage.getItem(STRAY_WAIT_KEY));
    if (Number.isFinite(kept) && kept > 0) return kept;
    const drawn = firstStrayDelay();
    sessionStorage.setItem(STRAY_WAIT_KEY, String(Math.round(drawn)));
    return drawn;
  } catch { return firstStrayDelay(); }
};
export const setStrayWait = (ms) => {
  try { sessionStorage.setItem(STRAY_WAIT_KEY, String(Math.max(1, Math.round(ms)))); } catch { /* private mode */ }
};

// One countdown toward the next stray. Stopping it, or leaving the page, banks the time already
// read. When it runs out the long wait is written before the ant is sent, so a page opened a
// moment later does not send a second one.
export const strayClock = (onDue) => {
  let timer = null, startedAt = 0, owed = 0;
  const bank = () => {
    if (timer === null) return;
    clearTimeout(timer); timer = null;
    setStrayWait(owed - (Date.now() - startedAt));
  };
  addEventListener("pagehide", bank);
  return {
    start(delay) {
      bank();
      if (delay !== undefined) setStrayWait(delay);
      owed = strayWait(); startedAt = Date.now();
      timer = setTimeout(() => { timer = null; setStrayWait(nextStrayDelay()); onDue(); }, owed);
    },
    stop: bank,
  };
};
