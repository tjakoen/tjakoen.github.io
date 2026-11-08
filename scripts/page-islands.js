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
// The ant in the status bar is the door. The game script loads with the page and stays closed
// until the ant is clicked or `nest` is typed in the terminal. There is no query-string shortcut.
tasks.push(import("/site/nest-mockup.js"));
if (document.querySelector("[data-surface=\"chat-log\"]")) tasks.push(import("/site/desk-consent.js"));
if (document.querySelector("[data-note-progress]")) tasks.push(import("/site/note-progress.js"));

await Promise.all(tasks);
