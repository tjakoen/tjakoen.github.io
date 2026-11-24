// portfolio/src/share.ts — the ready-to-post share block a note or event carries.
//
// It renders the `social:`, `socialImage:` and `socialImageAlt:` frontmatter as a folded <details>,
// so the page and the post it becomes cannot drift. Split out of content.ts; it reads no collection.
import { escapeHtml } from "@tjakoen/mill/core/engine.ts";

// The event page's share block (molecules/share-block): the ready-to-post copy for LinkedIn and the
// canonical link back, straight off the entry's own `social:` frontmatter — one source of truth, so
// the page and the post it becomes cannot drift. Opt-in per event: no `social:` key, no block. A
// <details> so it stays folded away from the reader (it is a tool, not part of the post), and so it
// still works with no JS: open it, the text is selectable and the link is a real anchor.
export function renderShareBlock(social: unknown, url: string, image?: unknown, imageAlt?: unknown): string {
  if (typeof social !== "string" || !social.trim()) return "";
  // Unwrap the authoring line breaks: the source file is hard-wrapped at 110 columns like every
  // other file here, but a paste into LinkedIn must break only where a paragraph does. Blank lines
  // stay, single newlines inside a paragraph become spaces.
  const unwrapped = social.trim().split(/\n{2,}/)
    .map((para) => para.split("\n").map((l) => l.trim()).join(" ").trim())
    .filter(Boolean).join("\n\n");
  const text = escapeHtml(unwrapped);
  const href = escapeHtml(url);
  // One image, or a dash list of them for a multi-image post. Alts pair with images by position; a
  // missing alt falls back to a numbered label rather than an empty one.
  const list = (v: unknown) => (Array.isArray(v) ? v : [v]).filter((x): x is string => typeof x === "string" && !!x.trim()).map((x) => x.trim());
  const images = list(image);
  const alts = list(imageAlt);
  const many = images.length > 1;
  const imageBlock = images.map((src, i) => {
    const imageHref = escapeHtml(src);
    const alt = escapeHtml(alts[i] ?? (many ? `Social card ${i + 1} of ${images.length}` : "Social card"));
    const label = many ? `Download image ${i + 1} of ${images.length}` : "Download image";
    return `<figure class="share-block__figure">
    <img class="share-block__image" src="${imageHref}" alt="${alt}" width="1200" height="1200" loading="lazy">
    <figcaption class="share-block__caption"><a class="share-block__download" href="${imageHref}" download>${label}</a></figcaption>
  </figure>`;
  }).join("\n  ");
  const gallery = many ? `<div class="share-block__gallery">${imageBlock}</div>` : imageBlock;
  return `<details class="share-block" data-share>
  <summary class="share-block__head">Social post copy</summary>
  <pre class="share-block__text" data-share-text>${text}</pre>
  ${gallery}
  <p class="share-block__row">
    <button class="share-block__copy" type="button" data-share-copy aria-live="polite">Copy</button>
    <a class="share-block__link" href="${href}">${href}</a>
  </p>
</details>`;
}

export const CONTENT_COPY_SCRIPT = `<script>
  (function () {
    function legacyCopy(value) {
      var field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      var copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
      field.remove();
      return copied;
    }
    function wire(block) {
      var button = block.querySelector('[data-share-copy], [data-copy-template-button]');
      var text = block.querySelector('[data-share-text], pre code');
      if (!button || !text) return;
      var label = button.textContent;
      var reset;
      button.hidden = false;
      button.addEventListener('click', async function () {
        clearTimeout(reset);
        button.removeAttribute('data-copied');
        var value = text.textContent || '';
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            try { await navigator.clipboard.writeText(value); }
            catch (_) { if (!legacyCopy(value)) throw new Error('Clipboard write failed'); }
          } else if (!legacyCopy(value)) {
            throw new Error('Clipboard is unavailable');
          }
          button.textContent = 'Copied';
          button.setAttribute('data-copied', '');
          reset = setTimeout(function () {
            button.textContent = label;
            button.removeAttribute('data-copied');
          }, 1600);
        } catch (_) {
          button.textContent = 'Copy failed, select it instead';
        }
      });
    }
    document.querySelectorAll('[data-share], [data-copy-template]').forEach(wire);
    window.addEventListener('note-share:open', function (e) { wire(e.detail); });
  })();
</script>`;
