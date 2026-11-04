// tools/badge-art.ts: writes one standalone medallion SVG per badge design (course x term) to
// content/media/badges/art/, so the /badges hub can show the real badge without a recipient name.
// The sections of a course share one design, so the file is keyed by course and term, not section.
// Run: bun tools/badge-art.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { badgeMedallionSvg, BADGE_COURSE_NAMES } from "../src/content.ts";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "content", "media", "badges", "art");
// The same literal hues as tools/badge-images.ts, because a standalone SVG has no site CSS to resolve them.
const HUE: Record<string, string> = { apsi: "#d07f4a", adet: "#3fa89e", introweb: "#8877d6" };
const FONT = "Georgia, 'Times New Roman', serif";

export const BADGE_DESIGNS: { course: string; term: string; subtitle: string }[] = [
  { course: "apsi", term: "prelim", subtitle: "Frontend Design with Cloud" },
  { course: "apsi", term: "midterm", subtitle: "Full Stack Web Development" },
  { course: "apsi", term: "finals", subtitle: "Builds Full-Stack JavaScript and AI" },
  { course: "adet", term: "prelim", subtitle: "Dart and Flutter Foundations" },
  { course: "adet", term: "midterm", subtitle: "Flutter App Development" },
  { course: "adet", term: "finals", subtitle: "Builds with Flutter and AI" },
  { course: "introweb", term: "prelim", subtitle: "Web Foundations" },
  { course: "introweb", term: "midterm", subtitle: "Interactive Web Pages" },
  { course: "introweb", term: "finals", subtitle: "Builds for the Web and AI" },
];

if (import.meta.main) {
  mkdirSync(OUT, { recursive: true });
  for (const d of BADGE_DESIGNS) {
    const svg = badgeMedallionSvg({
      courseName: BADGE_COURSE_NAMES[d.course] || d.course, subtitle: d.subtitle, year: "2026",
      course: d.course, hue: HUE[d.course]!, ink: "#1C1B17", muted: "#6E6C64", paper: "#FFFFFF", font: FONT, size: 300,
    });
    writeFileSync(join(OUT, `${d.course}-${d.term}.svg`), `${svg.trim()}\n`);
  }
  console.log(`wrote ${BADGE_DESIGNS.length} badge designs to ${OUT}`);
}
