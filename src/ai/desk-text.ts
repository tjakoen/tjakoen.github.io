// portfolio/src/ai/desk-text.ts — the small text helpers the desk's reasoner and its stages share.
//
// Split out with the reasoner's decomposition: the engine, the deterministic turn, the model turn and
// the arrival generator all escape text, and a per-file copy of `esc` is how two escape rules drift.

/** Escape a string for GRAIN's chat markup (text content and quoted attributes both). */
export const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function navLinkFor(route: string): string {
  const segs = route.split("/").filter(Boolean);
  return segs.length < 2 ? route : "/" + segs.slice(0, -1).join("/");
}
export function humanizeSeg(route: string): string {
  const seg = route.split("/").filter(Boolean).pop();
  return seg ? seg.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "Home";
}
