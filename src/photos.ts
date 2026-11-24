// portfolio/src/photos.ts — the flat "src | WxH | alt" encoding that event frontmatter uses.
//
// One parser, because the hero, the gallery and the feed's photo strip must read the same string the
// same way. Split out of content.ts when that file passed two thousand lines.
export interface EventPhoto { src: string; width: string; height: string; alt: string; }

// MILL's yamlish frontmatter parser is flat (scalars + string lists only), so a photo is encoded as
// one "src | 1200x675 | alt text" string; split it back into {src,width,height,alt}. desk-feed.json
// (JSON, so it COULD nest) uses the same flat-string shape for symmetry — one parser for both.
// A grain proposal (Pass E) tracks first-class nested-object frontmatter to retire this encoding.
export function parsePhotos(raw: unknown): EventPhoto[] {
  if (!Array.isArray(raw)) return [];
  const out: EventPhoto[] = [];
  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const [src = "", dim = "", alt = ""] = entry.split("|").map((x) => x.trim());
    if (!src) continue;
    const [width = "", height = ""] = dim.split(/x/i).map((x) => x.trim());
    out.push({ src, width, height, alt });
  }
  return out;
}
