/* site/talk-review.js — the before-and-after toggles on the review fundamentals talk.
 *
 * Each example card holds a real review comment and its rewrite. The button swaps which one shows,
 * and pressing it again swaps back. Nothing here touches the deck: the presentation organism keeps
 * the arrow keys, so a click on a toggle never moves the slide.
 */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-rv-flip]');
  if (!btn) return;
  e.stopPropagation();
  const card = btn.closest('.rv');
  const on = btn.getAttribute('aria-pressed') !== 'true';
  btn.setAttribute('aria-pressed', String(on));
  btn.textContent = on ? btn.dataset.back : btn.dataset.label;
  card.querySelector('.rv__seen').hidden = on;
  card.querySelector('.rv__better').hidden = !on;
});
