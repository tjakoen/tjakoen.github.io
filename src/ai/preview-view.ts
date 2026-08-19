// portfolio/src/ai/preview-view.ts — the browser half of /builder/preview. Two jobs: the
// rendered-versus-markup switch, and picking up a composition the workbench handed over.
//
// P5 of plans/site-builder.md. Served at /modules/portfolio/ai/preview-view.js, and it must be in
// tools/export.ts's MODULE_ENTRIES: the export crawler seeds its module graph from that list and
// never from a page's own script tag, so a module missing from it 404s on the frozen page. That
// finding cost P3 an afternoon and it is written here rather than remembered.
//
// ---- Why the handover is MARKUP and not a composition ------------------------------------------
// The workbench could hand over the composition document, and the preview would then have to render
// it, which means carrying the hidden template library and a second copy of the paint loop. The
// canvas already holds the rendered cells, and builder-canvas.ts already reads them for the Tags
// export, so the cheapest correct handover is the markup itself. The preview shows what was on the
// canvas because it IS what was on the canvas.
//
// Storage rather than the address, for the reason the workbench already states on its own page: a
// prompt fits in a query string and a whole edited composition does not. Which storage is a measured
// answer rather than a preference, and builder-export.ts carries it beside the key.

import { PREVIEW_HANDOVER_KEY, PREVIEW_HANDOVER_TTL, type PreviewHandover } from "./builder-export.ts";

const STAGE = '[data-surface="builder-preview-canvas"]';
const MARKUP = '[data-surface="builder-preview-markup"]';

function boot(): void {
  const stage = document.querySelector(STAGE);
  const markup = document.querySelector<HTMLPreElement>(MARKUP);
  const empty = document.querySelector<HTMLElement>(".preview-empty");
  if (!stage || !markup) return;

  // The handover, read once and then deleted, before anything is rendered from it. Deleted because
  // it is a message rather than a store: leaving it would mean a later visit to this address showed
  // a page the visitor had moved on from, which is the stale-preview failure the whole route exists
  // to avoid. The timestamp covers the other direction, a tab that wrote one and was closed before
  // the preview opened.
  try {
    const handed = localStorage.getItem(PREVIEW_HANDOVER_KEY);
    if (handed) {
      localStorage.removeItem(PREVIEW_HANDOVER_KEY);
      const parsed = JSON.parse(handed) as Partial<PreviewHandover>;
      const fresh = typeof parsed?.at === "number" && Date.now() - parsed.at < PREVIEW_HANDOVER_TTL;
      const cells = parsed?.cells;
      if (fresh && Array.isArray(cells) && cells.every((c) => typeof c === "string")) {
        // Rebuilt with innerHTML from markup this site rendered a moment ago in this same browser,
        // which is the same trust boundary the export already sits on. Nothing here came off the
        // network or out of a model.
        stage.innerHTML = cells.join("\n");
        markup.textContent = cells.join("\n");
        if (empty) empty.hidden = cells.length > 0;
      }
    }
  } catch {
    // Storage denied, or a value this build did not write. The server already rendered the page from
    // the address, so falling through leaves a correct preview rather than a broken one.
  }

  // The switch. Both views are in the document, so this hides one and shows the other and never
  // fetches anything. aria-pressed carries the state for a screen reader; the CSS reads the same
  // attribute, so there is one source of truth rather than a class shadowing it.
  const buttons = document.querySelectorAll<HTMLButtonElement>(".preview-switch [data-view]");
  const show = (view: string): void => {
    stage.toggleAttribute("hidden", view !== "rendered");
    markup.toggleAttribute("hidden", view !== "markup");
    for (const b of buttons) b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === view));
  };
  for (const b of buttons) b.addEventListener("click", () => show(b.getAttribute("data-view") ?? "rendered"));
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
