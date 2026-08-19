// portfolio/src/ai/builder-preview.test.ts — the preview route's two string jobs.
//
// Both are string surgery over the shell's markup, which is exactly the kind of code that keeps
// working until the markup moves and then fails silently. So each one is pinned twice: once that it
// does the thing, and once that it leaves markup it does not recognize alone rather than mangling
// it. The second half is the one that matters, because the failure it prevents is a panel that
// opens on nothing.
import { test, expect } from "bun:test";
import { openCatalogPane, markupPane } from "./builder-preview.ts";

const SHELL = `<aside class="app-shell__aside">
  <div class="assistant" data-mode="chat">
    <nav class="assistant__modes" aria-label="Panel mode">
      <button type="button" data-shell-mode="chat" aria-selected="true">Chat</button>
      <button type="button" data-shell-mode="catalog" aria-selected="false">Catalog</button>
    </nav>
    <div class="assistant__pane" data-pane="chat">chat</div>
    <div class="assistant__pane catalog-pane" data-pane="catalog" hidden>catalog</div>
  </div>
</aside>`;

test("the panel opens on the catalog, in all three places the state is written", () => {
  const out = openCatalogPane(SHELL);

  expect(out).toContain('<div class="assistant" data-mode="catalog">');
  // The pane the shell shipped visible is now hidden, and the one it shipped hidden is not.
  expect(out).toContain('data-pane="chat" hidden>');
  expect(out).toContain('<div class="assistant__pane catalog-pane" data-pane="catalog">');
  // aria-selected moves with it, or a screen reader is told chat is the active tab while the
  // catalog is the visible pane.
  expect(out).toContain('data-shell-mode="chat" aria-selected="false"');
  expect(out).toContain('data-shell-mode="catalog" aria-selected="true"');
});

test("a shell it does not recognize comes back untouched rather than half-rewritten", () => {
  const moved = '<div class="assistant" data-mode="chat" data-new-thing>';
  expect(openCatalogPane(moved)).toBe(moved);
});

test("it changes nothing outside the assistant", () => {
  const page = `<main>chat</main>${SHELL}<footer data-pane="chat">chat</footer>`;
  const out = openCatalogPane(page);
  expect(out).toContain("<main>chat</main>");
  expect(out).toContain('<footer data-pane="chat">chat</footer>');
});

test("the markup pane is escaped, because showing markup as text is its whole job", () => {
  const out = markupPane('<div class="canvas__cell"><b-card data-x="1">hi</b-card></div>');
  expect(out).not.toContain("<b-card");
  expect(out).toContain("&lt;b-card");
  expect(out).toContain("hi");
});

// The pane shows what the Tags export would hand you. A prettifier here would be a second opinion
// about that file, so only the surrounding blank lines go.
test("it trims the edges and leaves the indentation alone", () => {
  expect(markupPane("\n  <div>\n    <b-card></b-card>\n  </div>\n")).toBe(
    "&lt;div&gt;\n    &lt;b-card&gt;&lt;/b-card&gt;\n  &lt;/div&gt;",
  );
});
