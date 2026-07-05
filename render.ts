// portfolio/render.ts — the app's renderer, framework factory + app config
import { createRenderer } from "../batch/render/render.ts";
import { config } from "./config.ts";
export const { render, renderPage, refresh } = createRenderer({
  componentsDir: config.componentRoots,      // GRAIN's b-* atoms + the portfolio's components
  missing: config.missingBindings,           // "warn" in dev, "ignore" in prod
});
