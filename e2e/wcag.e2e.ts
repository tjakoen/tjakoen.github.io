// e2e/wcag.e2e.ts — the automated half of the WCAG 2.2 AA audit.
// Every canonical route in the sitemap is scanned by axe-core with the WCAG 2.0, 2.1 and 2.2
// A and AA rule tags, once per colour scheme, so a regression in GRAIN or in this site's own
// markup fails here rather than in a reader's screen reader. Automated rules catch roughly a
// third of WCAG; the manual half (keyboard walk, focus order, reflow, motion) lives in
// audit/wcag-2.2.md and is not claimed by this file.
//
// The page waits for load rather than network idle: the desk keeps a connection open, so
// network idle never arrives on most routes and the scan used to hang until the test timed out.
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { appendFileSync, writeFileSync, mkdirSync } from "node:fs";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// One reviewed exception. A tab in the open-tabs strip that has scrolled partly underneath the pinned
// Welcome tab reads to axe as a target clipped below 24px. It is not undersized: it is 24px when in
// view, scrolling the strip brings it fully into view, and the same page can be closed from "Close
// all" and from its explorer row. Only that "partly obscured" case is excused, and only in the strip;
// a tab or close control that is genuinely small still fails. See audit/wcag-2.2.md.
const scrolledUnder = (n: { html: string; any: { data?: unknown }[] }) =>
  /^<(a|span) class="tab(__close)?"/.test(n.html) &&
  n.any.some((c) => (c.data as { messageKey?: string } | undefined)?.messageKey === "partiallyObscured");

// The sitemap holds a few hundred routes, so each scheme is split into CHUNKS tests that fit the
// timeout and run in parallel; chunk i takes every CHUNKS-th route starting at i.
const CHUNKS = 8;
for (const scheme of ["light", "dark"] as const) for (let chunk = 0; chunk < CHUNKS; chunk++) {
  test(`canonical routes pass axe WCAG 2.2 AA (${scheme}, part ${chunk + 1} of ${CHUNKS})`, async ({ page }) => {
    test.setTimeout(600_000);
    const xml = await (await page.request.get("/sitemap.xml")).text();
    const routes = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc!).pathname)
      .filter((_, i) => i % CHUNKS === chunk);
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    const failures: string[] = [];
    mkdirSync("test-results", { recursive: true });
    const log = `test-results/wcag-${scheme}-${chunk}.log`;
    writeFileSync(log, "");
    for (const route of routes) {
      await test.step(route, async () => {
        // One retry: a page script that navigates late can abort the next goto mid-flight.
        await page.goto(route, { waitUntil: "load" }).catch(() => page.goto(route, { waitUntil: "load" }));
        const { violations: raw } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        const violations = raw.map((v) => v.id !== "target-size" ? v : { ...v, nodes: v.nodes.filter((n) => !scrolledUnder(n)) }).filter((v) => v.nodes.length);
        for (const v of violations) {
          const where = v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ");
          failures.push(`${route} [${v.impact}] ${v.id}: ${v.nodes.length}x ${where}`);
        }
        appendFileSync(log, `${route} ok ${violations.length}\n` + failures.filter((f) => f.startsWith(`${route} [`)).map((f) => f + "\n").join(""));
      });
    }
    mkdirSync("test-results", { recursive: true });
    writeFileSync(`test-results/wcag-${scheme}-${chunk}.txt`, failures.join("\n") + "\n");
    expect(failures, failures.join("\n")).toEqual([]);
  });
}
