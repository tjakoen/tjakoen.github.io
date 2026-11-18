/* site/talk-review.js — the before-and-after switches on the review fundamentals talk.
 *
 * Each example holds a real review comment and its rewrite. The two-button switch above it picks
 * which one shows. Nothing here touches the deck: the presentation organism keeps the arrow keys,
 * so a click on a switch never moves the slide.
 */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-rv-show]');
  if (!btn) return;
  e.stopPropagation();
  const card = btn.closest('.rv');
  const show = btn.dataset.rvShow;
  for (const b of card.querySelectorAll('[data-rv-show]')) {
    b.setAttribute('aria-current', String(b === btn));
  }
  card.querySelector('.rv__seen').hidden = show !== 'seen';
  card.querySelector('.rv__better').hidden = show !== 'better';
});
