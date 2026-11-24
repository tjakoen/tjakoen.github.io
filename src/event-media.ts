// portfolio/src/event-media.ts — the event page's photo grid, gallery and video card.
//
// Split out of content.ts when that file passed two thousand lines. These read a photo list or a
// frontmatter value and return markup; nothing here touches a collection or a route.
import { escapeHtml } from "@tjakoen/mill/core/engine.ts";
import type { EventPhoto } from "./photos.ts";

// The event-page photo grid (composed in shellChrome for /calendar entries). Hand-rendered rather
// than via the feed-photo molecule because the chrome has no per-request binding context to pass the
// photos array through; it emits the SAME .feed-photos / .feed-photo markup the molecule does, so one
// stylesheet dresses both. data-lightbox + the group wrapper wire it to GRAIN's image viewer
// (scripts/lightbox.js), same as the molecule; each photo's href stays the full image (the
// no-JS-safe fallback).

export function renderPhotoGrid(photos: EventPhoto[]): string {
  if (!photos.length) return "";
  const items = photos.map((p) => {
    const src = escapeHtml(p.src);
    const dims = p.width && p.height ? ` width="${escapeHtml(p.width)}" height="${escapeHtml(p.height)}"` : "";
    return `<a class="feed-photo" data-lightbox href="${src}"><img src="${src}"${dims} alt="${escapeHtml(p.alt)}" loading="lazy" decoding="async"></a>`;
  }).join("");
  return `<div class="feed-photos" data-event-photos data-lightbox-group>${items}</div>`;
}

// The event page's SECONDARY photo grid (`gallery:`), rendered below the body. The hero strip on top
// is the four photos that carry the post; everything else from the day lands here, evenly tiled and
// captioned by its own alt text, in a SEPARATE data-lightbox-group so walking the gallery does not
// walk back into the hero. Same flat "src | WxH | alt" frontmatter encoding as `photos:`, same
// parser, same no-JS fallback (each tile is a real link to the full image).
// The grid itself is GRAIN's `gallery` molecule (design work belongs up in grain, not here): this
// emits grain's class names and owns only the section around them, the heading and the frontmatter.

export function renderGallery(photos: EventPhoto[]): string {
  if (!photos.length) return "";
  const items = photos.map((p) => {
    const src = escapeHtml(p.src);
    const dims = p.width && p.height ? ` width="${escapeHtml(p.width)}" height="${escapeHtml(p.height)}"` : "";
    const alt = escapeHtml(p.alt);
    return `<figure class="gallery__item">
      <a class="gallery__link" data-lightbox href="${src}"><img src="${src}"${dims} alt="${alt}" loading="lazy" decoding="async"></a>
      <figcaption class="gallery__caption">${alt}</figcaption>
    </figure>`;
  }).join("");
  return `<section class="event-gallery" aria-labelledby="event-gallery-heading">
  <h2 class="event-gallery__heading" id="event-gallery-heading">The rest of the roll</h2>
  <div class="gallery" data-lightbox-group>${items}</div>
</section>`;
}

// The event page's featured video (`video:`), a flat "href | poster | WxH | label | alt" string in
// the same spirit as a photo. The site embeds nothing: an embed would mean a third-party iframe and
// its scripts on a page that has never carried one, and the video lives on someone else's platform
// anyway. So this is a poster still with a play badge over it, and the whole tile is one link out.
// The component is GRAIN's `media-card`, in its `data-layout="overlay"` shape: this file composes
// it from the frontmatter string rather than owning the markup.
export function renderVideoCard(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const [href = "", poster = "", dim = "", label = "", alt = ""] = raw.split("|").map((x) => x.trim());
  if (!href || !poster) return "";
  const [width = "", height = ""] = dim.split(/x/i).map((x) => x.trim());
  const dims = width && height ? ` width="${escapeHtml(width)}" height="${escapeHtml(height)}"` : "";
  // The video lives on someone else's platform, so the click leaves the site: new tab, same policy
  // the prose links follow (MILL's externalLinkAttrs). Hand-rendered, so the attributes are written
  // here rather than inherited.
  return `<section class="event-video" aria-labelledby="event-video-heading">
  <h2 class="event-video__heading" id="event-video-heading">On video</h2>
  <a class="media-card" data-layout="overlay" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">
  <span class="media-card__media">
    <img class="media-card__image" src="${escapeHtml(poster)}"${dims} alt="${escapeHtml(alt)}" loading="lazy" decoding="async">
    <span class="media-card__play" aria-hidden="true">▶</span>
  </span>
  <span class="media-card__body">
    <span class="media-card__title">${escapeHtml(label)}</span>
  </span>
</a>
</section>`;
}

// The deck an event or a note hangs off itself (`deck:`), rendered as GRAIN's `attachment` row just
// under the hero and above the prose — near the top, because for a talk the deck is often what a
// reader came for, and buried in the last paragraph is where it used to be.
// Flat frontmatter, one string, the same encoding idiom as a photo:
//   "Title | KIND | href | meta line"
// `href` is an IN-SITE route by design: a PDF points at /decks/<file>, which renders the document
// inside the shell (renderDeckPage) instead of handing the tab to the browser's viewer. A talk that
// already lives here points straight at its own route.
// ---- the contents block for a long note --------------------------------------
// A note with a dozen sections is a document, not a page, and a reader arriving on a link has no
// way to see its shape without scrolling the whole thing first. So an entry past the threshold gets
// two things above the opening line: its frontmatter `summary` rendered ON the page (it exists on
// every note and until now was only ever seen on the /notes index card, which is a waste of the
// best-written paragraph most notes have) and a collapsed list of its own sections.
//
// EVERY note gets one. This shipped on 2026-08-21 behind an eight-section threshold, on the
// argument that a short note's contents would list most of what was already on screen. The owner
// overrode that the same day and the override is right for a reason the threshold missed: the
// summary is the valuable half and it has nothing to do with length. It exists on all twelve notes,
// it is usually the best-written paragraph in the file, and until this block it was visible only on
// the /notes index card. Withholding it from the short notes was withholding the good part.
//
