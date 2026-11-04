// portfolio/ai/xray-panel.ts — x-ray v2: the panel that says, in words, what the desk can do here.
//
// Grain's xray.js owns the switch (html[data-xray]) and draws outlines on every operable surface.
// This module adds the half that outlines cannot carry: a legend grouped See / Navigate / Operate,
// built from the SAME capability catalog the desk reasons with (capabilities.ts), so the panel can
// never promise a verb the desk does not have. It also lists the surfaces on this page by the label
// grain stamps on them, and keeps every [data-xray-toggle] control's aria-pressed in step.
//
// It holds no state of its own. It watches html[data-xray] and renders when the attribute appears,
// which means every way in (the status-bar button, ?xray, Ctrl+Shift+X, window.grain.xray) opens it.
import type { Manifest } from "@tjakoen/grain/ai/manifest.ts";
import type { DomDoc } from "@tjakoen/grain/ai/manifest-dom.ts";
import { buildCapabilityCatalog, type Capability, type CapabilityGroup } from "./capabilities.ts";

const grainManifest = await import(new URL("../../grain/ai/manifest-dom.js", import.meta.url).href) as
  { domManifest: (d: DomDoc) => Manifest };

const HTML = document.documentElement;
const PANEL_ID = "xray-panel";

const GROUPS: { group: CapabilityGroup; title: string; lede: string }[] = [
  { group: "see", title: "See", lede: "What the desk can read on this page." },
  { group: "navigate", title: "Navigate", lede: "Where the desk can take you." },
  { group: "operate", title: "Operate", lede: "What the desk can change here. You still press Send." },
];

const esc = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// The sitemap gates the one "take you to any page" capability, the same rule the desk applies.
let pagesP: Promise<number> | null = null;
const sitemapPages = (): Promise<number> =>
  (pagesP ??= fetch(new URL("../../../sitemap.xml", import.meta.url).href)
    .then((r) => (r.ok ? r.text() : ""))
    .then((xml) => (xml.match(/<loc>/g) ?? []).length)
    .catch(() => 0));

function capList(caps: Capability[]): string {
  if (!caps.length) return `<p class="xray-panel__empty">Nothing on this page.</p>`;
  return `<ul class="xray-panel__list">${caps
    .map((c) => `<li><span class="xray-panel__phrase">${esc(c.phrase)}</span><code class="xray-panel__verb">${esc(c.verb)}</code></li>`)
    .join("")}</ul>`;
}

function surfaceList(): string {
  const labelled = [...document.querySelectorAll<HTMLElement>("[data-xray-label]")];
  if (!labelled.length) return "";
  return `<details class="xray-panel__surfaces"><summary>${labelled.length} outlined surface${labelled.length === 1 ? "" : "s"}</summary><ul class="xray-panel__list">${labelled
    .map((el) => `<li><code class="xray-panel__verb">${esc(el.getAttribute("data-xray-label") ?? "")}</code></li>`)
    .join("")}</ul></details>`;
}

// The desk's chat sits in the right-hand aside, and a panel pinned to the window's corner covered its
// input. When the aside is showing, the panel docks to the aside's left edge instead, so the visitor
// can read what the desk can do and ask it in the same glance. With no aside (phone widths), the
// stylesheet's corner position stands.
function placeBesideAside(panel: HTMLElement): void {
  const aside = document.querySelector<HTMLElement>(".app-shell__aside");
  const r = aside?.getBoundingClientRect();
  const showing = !!r && r.width > 0 && getComputedStyle(aside!).display !== "none";
  panel.style.right = showing ? `${Math.round(window.innerWidth - r!.left + 12)}px` : "";
}
addEventListener("resize", () => {
  const panel = document.getElementById(PANEL_ID);
  if (panel) placeBesideAside(panel);
});

async function render(): Promise<void> {
  const pages = await sitemapPages();
  if (!HTML.hasAttribute("data-xray")) return;   // switched off while the sitemap loaded
  const manifest = grainManifest.domManifest(document as unknown as DomDoc);
  const catalog = buildCapabilityCatalog({ manifest, hasDestinations: pages > 0 });
  let panel = document.getElementById(PANEL_ID);
  if (!panel) {
    panel = document.createElement("aside");
    panel.id = PANEL_ID;
    panel.className = "xray-panel";
    panel.setAttribute("aria-label", "What the AI can see and do on this page");
    document.body.append(panel);
  }
  placeBesideAside(panel);
  panel.innerHTML = `<header class="xray-panel__head"><strong>AI view</strong><button type="button" class="xray-panel__close" aria-label="Turn the AI view off">×</button></header>${GROUPS
    .map((g) => `<section class="xray-panel__group" data-group="${g.group}"><h2>${g.title}</h2><p class="xray-panel__lede">${g.lede}${g.group === "navigate" && pages ? ` ${pages} pages in the sitemap.` : ""}</p>${capList(catalog[g.group])}</section>`)
    .join("")}${surfaceList()}<p class="xray-panel__foot">Share this view with <code>?xray</code>, or toggle it with Ctrl+Shift+X.</p>`;
}

function sync(): void {
  const on = HTML.hasAttribute("data-xray");
  for (const b of document.querySelectorAll("[data-xray-toggle]")) b.setAttribute("aria-pressed", String(on));
  if (on) {
    // grain stamps the outline labels asynchronously after setting the attribute; one frame later
    // they are usually there, and a second render picks up any that land after that.
    void render();
    setTimeout(() => { if (HTML.hasAttribute("data-xray")) void render(); }, 300);
  } else {
    document.getElementById(PANEL_ID)?.remove();
  }
}

// The close button calls grain's switch directly rather than carrying [data-xray-toggle], so that
// selector keeps meaning "the page's own switches" and tests can address one without ambiguity.
document.addEventListener("click", (e) => {
  const t = e.target as Element | null;
  if (t?.closest?.(".xray-panel__close")) (window as unknown as { grain?: { xray?: { off(): void } } }).grain?.xray?.off();
});

new MutationObserver(sync).observe(HTML, { attributes: true, attributeFilter: ["data-xray"] });
sync();
