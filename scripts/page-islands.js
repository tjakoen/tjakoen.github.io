// Page-specific enhancements stay off routes that have no matching content.
const tasks = [];

if (document.querySelector("[data-lightbox]")) {
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/styles/lightbox.css";
  const loaded = new Promise((resolve) => {
    stylesheet.addEventListener("load", resolve, { once: true });
    stylesheet.addEventListener("error", resolve, { once: true });
  });
  document.head.append(stylesheet);
  tasks.push(loaded.then(() => import("/scripts/lightbox.js")));
}

if (document.querySelector("[data-live-figure]")) tasks.push(import("/site/figures.js"));
// The Nest: a game hidden in the site. Nothing of it loads until it is unlocked, by visiting with
// ?nest or by typing the word nest anywhere outside a text field; the unlock is remembered. See
// plans/ant-nest-game.md.
const nestUnlocked = () => { try { return localStorage.getItem("nest-unlocked") === "1"; } catch { return false; } };
if (new URLSearchParams(location.search).has("nest") || nestUnlocked()) tasks.push(import("/site/nest-mockup.js"));
else {
  let typed = "";
  const listen = (e) => {
    if (e.target.closest?.("input, textarea, select, [contenteditable]") || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed !== "nest") return;
    removeEventListener("keydown", listen);
    try { localStorage.setItem("nest-unlocked", "1"); } catch { /* private mode */ }
    import("/site/nest-mockup.js");
  };
  addEventListener("keydown", listen);
}
if (document.querySelector("[data-note-progress]")) tasks.push(import("/site/note-progress.js"));

await Promise.all(tasks);
