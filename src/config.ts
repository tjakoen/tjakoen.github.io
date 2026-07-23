// portfolio/config.ts — env-driven switches + where each concern lives on disk.
// Paths are resolved two cwd-INDEPENDENT ways so this works in the monorepo AND after the split:
//   - GRAIN's assets come from the @tjakoen/grain PACKAGE (import.meta.resolve) — its dir is the
//     workspace symlink in the monorepo and the installed git-dep after the split, same code.
//     grain's package.json isn't in its exports map, so we resolve an exported entry it always
//     ships (PLAN.md, at the package root) and take its dirname.
//   - the portfolio's OWN dirs are relative to THIS file (import.meta.dir), never the process cwd.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const isDev = (Bun.env.NODE_ENV ?? "development") !== "production";

// this file sits at the portfolio root (tjakoen.github.io/ in the monorepo; the repo root post-split)
const HERE = dirname(fileURLToPath(import.meta.url));
// GRAIN's package root (workspace ↔ git-dep), resolved via an entry grain exports from its root
const GRAIN = dirname(fileURLToPath(import.meta.resolve("@tjakoen/grain/PLAN.md")));

export const config = {
  isDev,
  port: Number(Bun.env.PORT ?? 3000),

  // GRAIN's package dir, exposed so server.ts can read GRAIN's own stylesheets without a cwd path.
  grainDir: GRAIN,

  // components come from the GRAIN design system (b-*) and the portfolio (its own
  // frame + bespoke surfaces + the /loop demo's task-card/loop-card/task-list).
  componentRoots: [join(GRAIN, "components"), join(HERE, "..", "components")],
  // the /components.css bundle = per-component CSS + (since this app uses the AI
  // interface) GRAIN's optional AI module CSS (grain/ai/ai.css). GRAIN's page-level
  // stylesheets (tokens / base / grade mechanism) are LINKED, not bundled — see /styles.
  // A no-AI app would simply drop the grain/ai root here.
  styleRoots: [join(GRAIN, "components"), join(HERE, "..", "components"), join(GRAIN, "ai")],
  // ONE pages tree now: the portfolio IS the app (the composition root folded in here).
  // It owns "/" (home), "/grain"·"/batch" (showcases), and the /loop + /about demo pages.
  pagesDir: join(HERE, "..", "pages"),

  // static asset prefixes → their dir. GRAIN ships the design system's styles, fonts,
  // and islands; the portfolio keeps only its vendored libs and its own island(s).
  assetDirs: {
    "/styles": join(GRAIN, "styles"),      // GRAIN's default theme: variables (tokens) + global (base) + grain (grade mechanism)
    "/vendor": join(HERE, "..", "vendor"),
    "/scripts": join(GRAIN, "scripts"),
    "/assets": join(GRAIN, "assets"),      // GRAIN's shared static assets (the icon sprite → b-icon)
    "/site": join(HERE, "..", "scripts"),  // the portfolio's own island(s): site.js (THE EDITOR chrome behaviors)
    "/media": join(HERE, "..", "content", "media"),   // the portfolio's own binary media: the og-card.png social image (tools/og-card.ts)
  } as Record<string, string>,
  fontsDir: join(GRAIN, "fonts"),          // the Redaction grades — GRAIN's signature (grain = AI)

  missingBindings: (isDev ? "warn" : "ignore") as "ignore" | "warn" | "throw",
  hotReload: isDev,
};
