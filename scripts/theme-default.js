// scripts/theme-default.js — the portfolio's first-visit defaults. Loaded render-BLOCKING in <head>
// just before GRAIN's theme-boot.js, so the defaults it writes are what theme-boot paints with.
//
// A first-time visitor gets brioche in light mode. That is written into GRAIN's own storage keys
// once, behind a marker, rather than applied whenever nothing is saved: GRAIN treats the first
// flavor in data-themes as the bare default and clears its key when someone picks it, so a check
// for "nothing saved" would push brioche back onto a visitor who deliberately chose sourdough.
//
// The same first visit queues a two-step CRUMB walk that points at the light and dark toggle. It
// runs once, only where that toggle is on screen, never over a tour that is already running, and
// never under automation, so the end-to-end suite keeps its cold pages.
(() => {
  "use strict";
  var MARK = "site-defaults-applied";
  var TOUR = "site-welcome-tour";
  try {
    var store = window.localStorage;
    if (!store.getItem(MARK)) {
      if (!store.getItem("grain-theme")) store.setItem("grain-theme", "brioche");
      if (!store.getItem("grain-color-scheme")) store.setItem("grain-color-scheme", "light");
      store.setItem(MARK, "1");
    }
    if (store.getItem(TOUR) || navigator.webdriver) return;
    addEventListener("load", function () {
      try {
        if (!window.crumb || sessionStorage.getItem("crumb:active")) return;
        if (new URLSearchParams(location.search).has("crumb")) return;
        var toggle = document.querySelector('[data-surface="dark-mode"]');
        if (!toggle || !toggle.getClientRects().length) return;
        store.setItem(TOUR, "shown");
        window.crumb.start("welcome", { mode: "demo" });
      } catch { /* a missing tour must never break the page */ }
    });
  } catch { /* no storage (privacy mode): GRAIN's own defaults render, and no tour runs */ }
})();
