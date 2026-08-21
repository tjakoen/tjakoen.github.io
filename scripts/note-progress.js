/* site/note-progress.js — how far down a long note you are, and which section you are in.
 *
 * Mounts only where src/content.ts emitted a contents block ([data-note-progress]), so it is a
 * no-op on every other page in the site and one entry in PAGE_ASSETS serves all of them.
 *
 * The one thing worth knowing before editing this: THE DOCUMENT DOES NOT SCROLL. The reading pane
 * (.app-shell__main) does. A window.scrollY implementation runs without error, reports zero
 * forever, and looks exactly like a working progress bar that happens to be at the start. That is
 * the silent-pass failure this site has a note about, so the container is discovered by walking up
 * from the bar and asking each ancestor whether it actually scrolls, with the document as the
 * fallback for the static export and for print.
 */

const bar = document.querySelector('.note-progress__fill');
const where = document.querySelector('[data-note-where]');

if (bar) {
  const scroller = (() => {
    for (let el = bar.parentElement; el; el = el.parentElement) {
      const oy = getComputedStyle(el).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) return el;
    }
    return document.scrollingElement || document.documentElement;
  })();

  const heads = [...document.querySelectorAll('.board h2[id]')];

  let queued = false;
  const render = () => {
    queued = false;
    const travel = scroller.scrollHeight - scroller.clientHeight;
    bar.style.setProperty('--read', travel > 0 ? String(Math.min(1, Math.max(0, scroller.scrollTop / travel))) : '0');

    // The current section is the last heading whose top has passed the reading line, which sits a
    // little below the pane's top edge so a heading counts as "reached" when you can read it rather
    // than when its first pixel appears.
    if (!where || !heads.length) return;
    const line = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.25;
    let current = heads[0];
    for (const h of heads) if (h.getBoundingClientRect().top <= line) current = h;
    // Silent at the top, where the masthead is still on screen and already says where you are.
    const atTop = scroller.scrollTop < scroller.clientHeight * 0.5;
    where.hidden = atTop;
    const label = current ? current.textContent.trim() : '';
    if (!atTop && where.textContent !== label) where.textContent = label;
  };

  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(render); } };
  scroller.addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  render();
}
