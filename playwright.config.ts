// portfolio/playwright.config.ts — the e2e runner config.
// The specs are `e2e/*.e2e.ts` (not the default `*.spec/*.test` glob — that default would also
// snag `content.test.ts`, a `bun test` unit file that imports `bun:`), and they drive the LOCAL
// app via relative `page.goto("/…")`, so a webServer + baseURL is required. The server is the
// BATCH·GRAIN·MILL·PROOF composition root `server.ts`, booted on a dedicated test port.
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3131);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // A single unnamed project (no `projects:` array) — so visual snapshots stay
  // `<arg>-<platform>.png`, matching the committed baseline scheme (a named project would insert
  // a `-<project>` segment and fork the baselines). Desktop Chrome = the default 1280x720@1.
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  // Boot the real app for the suite; reuse an already-running dev server if one's on the port.
  webServer: {
    command: `PORT=${PORT} bun src/server.ts`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
