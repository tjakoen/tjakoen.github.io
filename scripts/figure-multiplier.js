// site/figure-multiplier.js — the multiplier figure's behaviour, in one place.
//
// The talk and the post make the same argument, so they get the same widget rather than two
// pictures that can drift apart. The deck mounts it on a slide; scripts/figures.js mounts it in
// the middle of a paragraph. Neither owns the logic.
//
// One shared scale across all three rows, so the bars are honestly comparable: the input rows top
// out at 30% of the track (a 10), the output row at 100% (a 100). That is what makes multiplication
// visible instead of two identical-looking bars.

export const MULTIPLIER_MARKUP = `
  <div class="mult" data-mult>
    <div class="mult__row">
      <span class="mult__label">what you bring</span>
      <span class="mult__track"><span class="mult__fill" data-mult-you style="width:18%"></span></span>
      <span class="mult__val" data-mult-you-val>6</span>
    </div>
    <div class="mult__row">
      <span class="mult__label">× the same AI</span>
      <span class="mult__track"><span class="mult__fill" style="width:30%"></span></span>
      <span class="mult__val">10</span>
    </div>
    <div class="mult__row">
      <span class="mult__label">= what ships</span>
      <span class="mult__track">
        <span class="mult__fill mult__fill--out" data-mult-out style="width:60%"></span>
        <span class="mult__gap" data-mult-gap hidden><i></i><b>the gap AI opened</b></span>
      </span>
      <span class="mult__val" data-mult-out-val>60</span>
    </div>
    <p class="mult__control">
      <label for="mult-range-prose" class="mult__label">drag me</label>
      <input id="mult-range-prose" type="range" min="0" max="10" step="1" value="6" data-mult-input>
    </p>
    <p class="mult__verdict" data-mult-verdict>A decent developer with an AI is a frighteningly fast developer.</p>
  </div>`;

const line = (n) => {
  if (n === 0) return 'Ten times zero is still zero.';
  if (n <= 2) return 'A beginner who ships bugs faster and cannot tell which ones they are.';
  if (n <= 5) return 'Faster, and now the mistakes are harder to spot.';
  if (n <= 8) return 'A decent developer with an AI is a frighteningly fast developer.';
  return 'This is the part everyone wants. It is also the part you cannot skip to.';
};

/** Wire an already-rendered `.mult` block. Returns false if there is nothing to wire. */
export function mountMultiplier(mult) {
  if (!mult) return false;
  const $ = (sel) => mult.querySelector(sel);
  const input = $('[data-mult-input]');
  const gap = $('[data-mult-gap]');
  if (!input) return false;

  const draw = () => {
    const n = Number(input.value);
    $('[data-mult-you]').style.width = `${n * 3}%`;
    $('[data-mult-you-val]').textContent = String(n);
    $('[data-mult-out]').style.width = `${n * 10}%`;
    $('[data-mult-out-val]').textContent = String(n * 10);
    const verdict = $('[data-mult-verdict]');
    verdict.textContent = line(n);
    verdict.setAttribute('data-grade', n === 0 ? 'smooth' : 'grain');
    // the bracket spans from where the input bar ended to where the output bar reaches
    gap.hidden = n < 2;
    gap.style.left = `${n * 3}%`;
    gap.style.width = `${n * 7}%`;
  };
  input.addEventListener('input', draw);
  draw();
  return true;
}
