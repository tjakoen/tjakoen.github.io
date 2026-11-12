// scripts/theme-default.js — the portfolio's first-visit defaults. Loaded render-BLOCKING in <head>
// just before GRAIN's theme-boot.js, so the defaults it writes are what theme-boot paints with.
//
// A first-time visitor gets brioche in light mode. That is written into GRAIN's own storage keys
// once, behind a marker, rather than applied whenever nothing is saved: GRAIN treats the first
// flavor in data-themes as the bare default and clears its key when someone picks it, so a check
// for "nothing saved" would push brioche back onto a visitor who deliberately chose sourdough.
//
// Before that walk starts, the first visit asks one question: light, dark, or match the device.
// The answer goes through GRAIN's own setScheme. Closing the card without answering keeps light.
//
// The same first visit queues a short CRUMB walk that points at the light and dark toggle. It
// runs once, only where that toggle is on screen, never over a tour that is already running, and
// never under automation, so the end-to-end suite keeps its cold pages.
//
// The welcome tour declares no route on purpose. A visitor who arrives on a shared link to a note
// has to stay on that note after answering, and a tour with a route sends CRUMB to that route
// before its first card. Every surface the walk points at lives in the shell, so it runs anywhere.
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
        askScheme(function () { window.crumb.start("welcome", { mode: "demo" }); });
      } catch { /* a missing tour must never break the page */ }
    });
  } catch { /* no storage (privacy mode): GRAIN's own defaults render, and no tour runs */ }

  // The question wears the CRUMB card markup (.crumb-pop) and GRAIN's buttons, like the clear
  // dialog in site.js, so it reads as the first card of the same welcome.
  function askScheme(then) {
    if (typeof HTMLDialogElement !== "function" || !(window.grain && window.grain.theme)) return then();
    var dlg = document.createElement("dialog");
    dlg.className = "crumb-pop clear-dialog";
    dlg.setAttribute("aria-labelledby", "scheme-ask-title");
    dlg.innerHTML =
      '<form method="dialog" class="clear-dialog__form">' +
      '<div class="crumb-pop__head"><span id="scheme-ask-title" class="crumb-pop__title">Welcome! Light or dark?</span>' +
      '<button class="crumb-pop__x" value="" aria-label="Keep light">&times;</button></div>' +
      '<div class="crumb-pop__body"><p class="crumb-pop__say">Pick how you would like to read the site. ' +
      'You can change it any time with the button in the top bar.</p></div>' +
      '<div class="crumb-pop__foot">' +
      '<button class="btn" data-variant="soft" value="light" autofocus>Light</button>' +
      '<button class="btn" data-variant="soft" value="dark">Dark</button>' +
      '<button class="btn" value="auto">Match my device</button></div></form>';
    dlg.addEventListener("close", function () {
      if (dlg.returnValue) window.grain.theme.setScheme(dlg.returnValue);
      dlg.remove();
      then();
    });
    document.body.appendChild(dlg);
    dlg.showModal();
  }
})();
