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
if (document.querySelector("[data-note-progress]")) tasks.push(import("/site/note-progress.js"));

await Promise.all(tasks);
