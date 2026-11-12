/* site/bionic-reading.js — an optional reading aid on notes: the first part of each word is set
 * bold, so the eye has an anchor to jump between.
 *
 * Mounts only where src/content.ts emitted the toggle ([data-bionic-toggle]), which is note pages.
 * The choice is remembered across notes in localStorage.
 *
 * What it touches: running prose inside the note (paragraphs, list items, quotes, table cells).
 * What it leaves alone: headings, code, figures, the contents block and anything inside a live
 * figure. Each changed text node is kept, so switching off puts the original node back rather
 * than rebuilding text from the bold pieces.
 *
 * The Nest colony steals real glyphs from real text nodes, so the two cannot both run. When the
 * colony opens, bionic reading switches itself off for the page and the toggle is disabled.
 *
 * Honest limit: studies so far have not shown that this makes reading faster. It is here for
 * readers who find it comfortable, not as a claim.
 */

const KEY = "portfolio:bionic";
const toggle = document.querySelector("[data-bionic-toggle]");
const note = document.querySelector("article.note");

if (toggle && note) {
  const SKIP = "h1, h2, h3, h4, h5, h6, pre, code, kbd, figure, svg, .note-contents, .live-fig, .nest-start, .note-progress, [data-live-figure], [aria-hidden='true']";
  const PROSE = "p, li, blockquote, td, th, dd";
  const swapped = []; // [wrapper span, original text node]

  // About the first half of a word, rounded up, with short words getting one letter.
  const emphasis = (word) => (word.length <= 3 ? 1 : Math.ceil(word.length / 2));

  const wrap = (node) => {
    const parts = node.nodeValue.split(/(\p{L}[\p{L}\p{M}'’-]*)/u);
    if (parts.length < 2) return;
    const span = document.createElement("span");
    span.className = "bionic";
    parts.forEach((part, i) => {
      if (i % 2 === 0) { if (part) span.append(part); return; }
      const n = emphasis(part);
      const b = document.createElement("b");
      b.textContent = part.slice(0, n);
      span.append(b, part.slice(n));
    });
    node.replaceWith(span);
    swapped.push([span, node]);
  };

  const on = () => {
    if (swapped.length) return;
    const walker = document.createTreeWalker(note, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        const el = n.parentElement;
        if (!el || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (el.closest(SKIP) || !el.closest(PROSE)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(wrap);
    note.classList.add("is-bionic");
  };

  const off = () => {
    while (swapped.length) { const [span, node] = swapped.pop(); span.replaceWith(node); }
    note.classList.remove("is-bionic");
  };

  const stored = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };
  const store = (v) => { try { if (v) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch { /* private mode */ } };

  const apply = (v) => {
    toggle.setAttribute("aria-pressed", v ? "true" : "false");
    if (v) on(); else off();
  };

  toggle.hidden = false;
  apply(stored());
  toggle.addEventListener("click", () => { const v = toggle.getAttribute("aria-pressed") !== "true"; store(v); apply(v); });

  // Stand down when the colony arrives. Its panel is #nest-mock.
  const colony = new MutationObserver(() => {
    if (!document.getElementById("nest-mock")) return;
    off();
    toggle.setAttribute("aria-pressed", "false");
    toggle.disabled = true;
    toggle.title = "Off while the colony is open";
    colony.disconnect();
  });
  colony.observe(document.body, { childList: true, subtree: true });
}
