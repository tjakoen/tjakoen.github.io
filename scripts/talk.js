/* site/talk.js — the live figures for MY talk, and nothing else.
 *
 * The deck itself is GRAIN's `presentation` organism (grain/scripts/presentation.js): it owns
 * slides, fragments, the dot matrix, present mode, the presenter window and print. This file is a
 * CONSUMER of that component's one public seam:
 *
 *   deck.addEventListener("presentation:slide", (e) => { const { title, step, entered } = e.detail })
 *
 * so every figure below is driven by "which slide is up and how far into it are we", and nothing
 * here reaches back into the deck's internals. Same split as the rest of the stack: the design
 * system owns the surface, the app owns what is on it.
 */
import { mountMultiplier } from '/site/figure-multiplier.js';

const deck = document.querySelector('.presentation[data-deck]');
if (deck) {
  const $ = (sel, root = deck) => root.querySelector(sel);

  /* --- 1 · the title types itself, in grain, and stays grain ------------------- */
  function typeTitle(slide) {
    const target = $('[data-type]', slide);
    const caret = $('[data-caret]', slide);
    if (!target || target.dataset.typed) return;
    const text = target.dataset.type;
    target.dataset.typed = '1';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    target.textContent = '';
    if (caret) caret.hidden = false;
    let i = 0;
    const t = setInterval(() => {
      target.textContent = text.slice(0, (i += 1));
      if (i < text.length) return;
      clearInterval(t);
      if (caret) caret.hidden = true;
      target.classList.add('settled');
    }, 42);
  }

  /* --- 4 · the multiplier ------------------------------------------------------
     Shared with the post: site/figure-multiplier.js owns the behaviour so the slide and the
     paragraph cannot drift into two different arguments. */
  mountMultiplier($('[data-mult]'));

  /* --- 7 · the life grid ------------------------------------------------------
     Ten years, one dot per month, built here rather than in the markup because 120 hand-written
     spans is the kind of thing that rots the first time the story changes. */
  const years = $('[data-years]');
  if (years) {
    const grid = $('[data-years-grid]', years);
    grid.innerHTML = Array.from({ length: 132 }, (_, i) =>
      `<span class="years__dot" data-i="${i}"></span>`).join('');
    const dots = [...grid.children];
    const rows = [...years.querySelectorAll('.years__row')];
    // lit up to and including the last landed row; the newest span is the accent one
    const lightYears = (step) => {
      const done = rows.slice(0, Math.min(step, rows.length));
      const upTo = done.length ? Number(done[done.length - 1].dataset.span.split(',')[1]) : 0;
      const from = done.length ? Number(done[done.length - 1].dataset.span.split(',')[0]) : 0;
      dots.forEach((d, i) => {
        d.toggleAttribute('data-on', i < upTo);
        d.toggleAttribute('data-now', i >= from && i < upTo);
      });
    };
    years.__light = lightYears;
  }

  /* --- 13 · four titles, one skill set: click a column, light the column ------- */
  const matrix = $('[data-matrix]');
  matrix?.addEventListener('click', (e) => {
    const pick = e.target.closest('[data-pick]');
    if (!pick) return;
    const on = pick.getAttribute('aria-pressed') === 'true';
    matrix.querySelectorAll('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    matrix.querySelectorAll('col[data-col]').forEach((c) => c.classList.remove('is-lit'));
    if (on) return;
    pick.setAttribute('aria-pressed', 'true');
    matrix.querySelector(`col[data-col="${pick.dataset.pick}"]`)?.classList.add('is-lit');
  });

  /* --- 16 · the ratio: the room guesses with ↑ ↓, then → reveals --------------- */
  const ratio = $('[data-ratio]');
  let guess = 20;
  if (ratio) {
    const marker = $('[data-ratio-guess]', ratio);
    const nudge = (d) => {
      guess = Math.max(0, Math.min(100, guess + d));
      marker.style.left = `${guess}%`;
      marker.dataset.label = `the room says: ${guess}%`;
    };
    // the slide cedes these keys to us (data-cede on the section); the deck stays out of the way
    addEventListener('keydown', (e) => {
      if (!ratio.closest('.presentation__slide')?.hasAttribute('data-current')) return;
      if (e.key === 'ArrowUp') { e.preventDefault(); nudge(+5); }
      if (e.key === 'ArrowDown') { e.preventDefault(); nudge(-5); }
    });
  }
  function revealRatio(on) {
    if (!ratio) return;
    // 18,876 lines of code against 17,610 lines of Markdown: git-TRACKED files only, counted
    // 7 August 2026 with the same commands the published post documents. Counting the working
    // tree (plans and agent notes that are gitignored) runs past half, which is a friendlier
    // number and not one anybody in the room could check.
    $('[data-ratio-code]', ratio).style.width = on ? '51.7%' : '100%';
    $('[data-ratio-prose]', ratio).style.width = on ? '48.3%' : '0%';
    $('[data-ratio-prose-val]', ratio).textContent = on ? '17,610' : '0';
  }

  /* --- 17 · the overnight sprint ---------------------------------------------- */
  const sprintLine = $('[data-sprint-line]');
  if (sprintLine) {
    sprintLine.insertAdjacentHTML('beforeend', Array.from({ length: 50 }, (_, i) =>
      `<span class="sprint__tick" style="left:${(i / 49) * 100}%"></span>`).join(''));
  }
  let sprintTimer = null;
  function playSprint(on) {
    const sprint = $('[data-sprint]');
    if (!sprint) return;
    const ticks = [...sprint.querySelectorAll('.sprint__tick')];
    const count = $('[data-sprint-count]', sprint);
    clearInterval(sprintTimer);
    if (!on) { ticks.forEach((t) => t.classList.remove('is-on')); count.textContent = '0'; return; }
    let i = 0;
    sprintTimer = setInterval(() => {
      if (i >= ticks.length) { clearInterval(sprintTimer); return; }
      ticks[i].classList.add('is-on');
      count.textContent = String((i += 1));
    }, 110);
  }

  /* --- 20 · the playbook loop: one node open at a time ------------------------- */
  const loop = $('[data-loop]');
  loop?.addEventListener('click', (e) => {
    const node = e.target.closest('[data-node]');
    if (!node) return;
    const on = node.getAttribute('aria-expanded') === 'true';
    loop.querySelectorAll('[data-node]').forEach((n) => n.setAttribute('aria-expanded', 'false'));
    loop.querySelectorAll('[data-card]').forEach((c) => { c.hidden = true; });
    const all = $('.loop__all', loop);
    if (all) all.hidden = !on;
    if (on) return;
    node.setAttribute('aria-expanded', 'true');
    const card = loop.querySelector(`[data-card="${node.dataset.node}"]`);
    if (card) card.hidden = false;
  });

  /* --- 21 · the silent-failure demo -------------------------------------------
     The left button is the trap: it "works", on an element the contract quietly refuses to
     cover. No error, no warning, and that is the entire point. */
  const trap = $('[data-trap]');
  if (trap) {
    let clicks = 0;
    $('[data-trap-bad]', trap).addEventListener('click', () => {
      clicks += 1;
      $('[data-trap-out-bad]', trap).innerHTML = clicks < 3
        ? '&nbsp;' : `<b>Nothing. ${clicks} clicks, no error, no warning.</b>`;
    });
    $('[data-trap-good]', trap).addEventListener('click', () => {
      $('[data-trap-out-good]', trap).innerHTML =
        '<b data-grade="grain">The texture lands. Same click, same intent.</b>';
    });
  }

  /* --- 6a · what the first number is made of -----------------------------------
     Four claims, and the same bar the napkin used on slide 4. Ticking them drives the number
     up, so the callback lands as a picture before anybody says the word "callback". */
  const bring = $('[data-bring]');
  function landBring(all) {
    if (!bring) return;
    const items = [...bring.querySelectorAll('[data-bring-item]')];
    if (all) items.forEach((b) => b.setAttribute('aria-pressed', 'true'));
    const NUM = [0, 3, 5, 8, 10];
    const LINES = [
      'Nothing ticked, and the machine is still a ten. Ten times zero.',
      'One of four, and the tool is already faster than you can check it.',
      'Two. You can catch the obvious wrong answers now, which is most of them.',
      'Three. Now it is worth pointing a fast machine at something real.',
      'Four. This is the number that makes AI look like magic. It was never the AI.',
    ];
    const n = items.filter((b) => b.getAttribute('aria-pressed') === 'true').length;
    $('[data-bring-val]', bring).textContent = String(NUM[n]);
    $('[data-bring-fill]', bring).style.width = `${NUM[n] * 10}%`;
    const v = $('[data-bring-verdict]', bring);
    v.textContent = LINES[n];
    v.setAttribute('data-grade', n === 4 ? 'smooth' : 'grain');
  }
  bring?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bring-item]');
    if (!b) return;
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
    landBring(false);
  });
  landBring(false);

  /* --- 20a · context engineering -----------------------------------------------
     Eight rooms, one unchanged prompt. Every combination gets an honest answer, including the
     ones that are worse than useless, because "add all three" is not the lesson. */
  const ctx = $('[data-ctx]');
  const CTX_ORDER = ['brief', 'conv', 'sync'];
  const CTX_OUT = {
    '': ['Guesses the stack. Invents a folder. Writes React into a repo that has never had any.', '0'],
    'brief': ['Right stack, right folder. Then invents a naming convention that exists nowhere else in the project.', '0'],
    'conv': ['Beautifully formatted, perfectly consistent, and built on a framework this project does not use.', '0'],
    'sync': ['Knows which files move together. No idea what any of them are for.', '0'],
    'brief conv': ['Right stack, right shape, reads like the rest of the codebase. Changes one file and misses the three that had to change with it.', '0'],
    'brief sync': ['Right stack, and everything downstream updates. The new code still reads like a stranger wrote it.', '0'],
    'conv sync': ['Consistent, and propagated, in a project it still fundamentally misunderstands.', '0'],
    'brief conv sync': ['Right stack, right shape, and it updates the other three files without being asked. Cold session, no history, first try.', '1'],
  };
  function landCtx(all) {
    if (!ctx) return;
    if (all) ctx.querySelectorAll('[data-ctx-file]').forEach((f) => f.setAttribute('aria-pressed', 'true'));
    const on = CTX_ORDER.filter((k) =>
      ctx.querySelector(`[data-ctx-file="${k}"]`)?.getAttribute('aria-pressed') === 'true');
    const [text, good] = CTX_OUT[on.join(' ')];
    const out = $('[data-ctx-out]', ctx);
    out.textContent = text;
    out.dataset.good = good;
  }
  ctx?.addEventListener('click', (e) => {
    const f = e.target.closest('[data-ctx-file]');
    if (!f) return;
    f.setAttribute('aria-pressed', String(f.getAttribute('aria-pressed') !== 'true'));
    landCtx(false);
  });
  landCtx(false);

  /* --- 20b · loop engineering ---------------------------------------------------
     Same six sessions run two ways. Neither column is slower: one just keeps closing what it
     opens, and the dots make that arithmetic impossible to argue with. */
  const cycle = $('[data-cycle]');
  const CYCLE_MAX = 6, CYCLE_PER = 2;
  if (cycle) {
    const fillDots = (el) => {
      el.innerHTML = Array.from({ length: CYCLE_MAX * CYCLE_PER },
        () => '<span class="cycle__dot"></span>').join('');
    };
    fillDots($('[data-cycle-bad]', cycle));
    fillDots($('[data-cycle-good]', cycle));
  }
  let cycleAt = 0;
  function drawCycle() {
    if (!cycle) return;
    const lit = cycleAt * CYCLE_PER;
    [...$('[data-cycle-bad]', cycle).children].forEach((d, i) => {
      if (i < lit) d.setAttribute('data-on', 'open'); else d.removeAttribute('data-on');
    });
    [...$('[data-cycle-good]', cycle).children].forEach((d, i) => {
      if (i < lit) d.setAttribute('data-on', 'closed'); else d.removeAttribute('data-on');
    });
    const done = cycleAt === CYCLE_MAX;
    $('[data-cycle-bad-out]', cycle).innerHTML = cycleAt === 0
      ? 'Six of these and you are a stranger in your own codebase.'
      : done
        ? `<b>Session 6.</b> You cannot say what half of this does, and neither can it: nothing you agreed five sessions ago survived.`
        : `<b>Session ${cycleAt}.</b> ${lit} changes nobody checked. Session ${cycleAt + 1} opens cold.`;
    $('[data-cycle-good-out]', cycle).innerHTML = cycleAt === 0
      ? 'Same six. Same speed. You can still explain all of it.'
      : done
        ? `<b>Session 6.</b> Every change checked and written down. You can walk anyone through it, and so can the next session.`
        : `<b>Session ${cycleAt}.</b> ${lit} changes closed and recorded. Session ${cycleAt + 1} opens oriented.`;
    // the bill lands on the last session and not before
    const cost = $('[data-cycle-cost]', cycle);
    cost.innerHTML = done
      ? 'That is the bill, and it is not bad code. It is a project neither of you can explain, and no way left to find out.'
      : '&nbsp;';
    cost.toggleAttribute('data-on', done);
  }
  cycle?.addEventListener('click', (e) => {
    if (e.target.closest('[data-cycle-run]')) cycleAt = Math.min(CYCLE_MAX, cycleAt + 1);
    else if (e.target.closest('[data-cycle-reset]')) cycleAt = 0;
    else return;
    drawCycle();
  });
  drawCycle();

  /* --- 20c · the correction that never sticks -----------------------------------
     Say the same sentence into four cold sessions, then move it one file to the left. The
     demo is the argument; the tool gets two lines in the notes and none on the slide. */
  const repeat = $('[data-repeat]');
  if (repeat) {
    const log = $('[data-repeat-log]', repeat);
    const fixBtn = $('[data-repeat-fix]', repeat);
    const checkBtn = $('[data-repeat-check]', repeat);
    const SAID = 'no, plan files carry the frontmatter block. We settled this.';
    // three states, and the third is the point: saying it decays, writing it down rots,
    // only a thing that can fail a build actually holds.
    let said = 0, sessions = 0, stage = 0;
    const push = (html, isFixed) => {
      const li = document.createElement('li');
      li.innerHTML = html;
      if (isFixed) li.setAttribute('data-fixed', '');
      log.append(li);
      while (log.children.length > 5) log.firstElementChild.remove();
    };
    repeat.addEventListener('click', (e) => {
      if (e.target.closest('[data-repeat-run]')) {
        sessions += 1;
        if (stage === 0) {
          said += 1;
          $('[data-repeat-count]', repeat).textContent = String(said);
          push(`<b>session ${sessions}</b> you: ${SAID}`);
        } else if (stage === 1) {
          push(`<b>session ${sessions}</b> reads the file. Gets it right. Does not ask.`, true);
        } else {
          push(`<b>session ${sessions}</b> gets it right, and the build would have caught it if it hadn't.`, true);
        }
        return;
      }
      if (e.target.closest('[data-repeat-fix]') && stage === 0) {
        stage = 1;
        fixBtn.disabled = true;
        checkBtn.disabled = false;
        push('one line, moved into the file the agent reads before anything else.', true);
        $('[data-repeat-note]', repeat).innerHTML =
          '<b>Better. But a file is still only a promise.</b> Nobody reads it on a bad week, and it drifts away from the code without making a sound.';
        return;
      }
      if (e.target.closest('[data-repeat-check]') && stage === 1) {
        stage = 2;
        checkBtn.disabled = true;
        push('<b>$ pantry doctor</b>', true);
        push('FAIL plan files missing frontmatter: 2', true);
        $('[data-repeat-note]', repeat).innerHTML =
          '<b>Now it holds.</b> A rule you have to remember decays. A rule written down rots quietly. A rule that fails the build is the only one still true in six months.';
      }
    });
  }

  /* --- 24a · Monday -------------------------------------------------------------
     The same hour, spent two ways. Nothing on this slide is about my repo. */
  const monday = $('[data-monday]');
  const MONDAY = {
    produce: {
      prompt: '&gt; write me the login form',
      hour: 'A working login form, and a tab you closed.',
      term: 'A folder of code you cannot defend, and the same first number you started the term with.',
      rule: 'Faster output, same you. The multiplier never moved.',
    },
    learn: {
      prompt: '&gt; why is storing the token here the wrong call? Show me two alternatives and what each one costs',
      hour: 'The same login form, one hour later, and you can now say why it is shaped that way.',
      term: 'A bigger first number, which multiplies everything you touch after it.',
      rule: 'Ship nothing you could not have written yourself, slower.',
    },
  };
  function landMonday(mode) {
    if (!monday) return;
    const m = MONDAY[mode];
    monday.querySelectorAll('[data-monday-pick]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.mondayPick === mode)));
    $('[data-monday-prompt]', monday).innerHTML = m.prompt;
    $('[data-monday-hour]', monday).textContent = m.hour;
    $('[data-monday-term]', monday).textContent = m.term;
    const rule = $('[data-monday-rule]', monday);
    rule.textContent = m.rule;
    rule.setAttribute('data-grade', mode === 'learn' ? 'smooth' : 'grain');
  }
  monday?.addEventListener('click', (e) => {
    const pick = e.target.closest('[data-monday-pick]');
    if (pick) landMonday(pick.dataset.mondayPick);
  });
  landMonday('produce');

  /* --- 11 · one artefact per beat ----------------------------------------------
     The fourth beat is the joke, so it gets no card: the third one stays up while it lands. */
  const did = $('[data-did]');
  function showDid(step) {
    if (!did) return;
    const n = Math.min(3, step);
    did.querySelectorAll('[data-did-card]').forEach((c) =>
      c.classList.toggle('is-on', Number(c.dataset.didCard) === n));
  }

  /* --- light and dark, on a button as well as on D -----------------------------
     The deck already read the OS preference and already listened for D. What it never had was
     something to click, which is the only version that helps when you are standing at a lectern
     on somebody else's projector. The glyph shows what the click will DO, not where you are. */
  // The BUTTON is grain's: it carries data-toggle-scheme, so grain/scripts/theme.js owns the
  // switch and persists it, exactly like the ◐ in the site's window bar. An earlier version of
  // this file flipped the attribute itself, which worked on screen and forgot the choice the
  // moment you left the deck, and disagreed with the preference the rest of the site had stored.
  // All that is left here is keeping the glyph honest, since it shows what the click will DO.
  const themeBtn = deck.querySelector('[data-toggle-scheme]');
  if (themeBtn) {
    const root = document.documentElement;
    const isDark = () => (root.dataset.colorScheme
      ? root.dataset.colorScheme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches);
    const paintTheme = () => {
      themeBtn.textContent = isDark() ? '☀' : '☾';
      themeBtn.title = isDark() ? 'Switch to light (D)' : 'Switch to dark (D)';
    };
    // repaint after anything that could have changed the scheme: the button, the deck's D key,
    // or the OS flipping under us
    themeBtn.addEventListener('click', () => requestAnimationFrame(paintTheme));
    addEventListener('keydown', (e) => {
      if (e.key === 'd' || e.key === 'D') requestAnimationFrame(paintTheme);
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintTheme);
    paintTheme();
  }

  /* --- the seam: one listener, every figure ------------------------------------ */
  deck.addEventListener('presentation:slide', (e) => {
    const { title, step, slide, entered } = e.detail;
    switch (title) {
      case 'Title': if (entered) typeTitle(slide); break;
      case 'I was the zero, for years': years?.__light(step); break;
      case 'So I did the unglamorous thing': showDid(step); break;
      case 'The one number that matters (guess, then reveal)': revealRatio(step > 0); break;
      case 'And I do go fast': playSprint(step > 0); break;
      default: break;
    }
  });

  // printing lands everything, so the figures need their final state too
  deck.addEventListener('presentation:print', () => {
    revealRatio(true);
    years?.__light(99);
    const sprint = $('[data-sprint]');
    if (sprint) {
      sprint.querySelectorAll('.sprint__tick').forEach((t) => t.classList.add('is-on'));
      $('[data-sprint-count]', sprint).textContent = '50';
    }
    const t = $('[data-type]');
    if (t) { t.textContent = t.dataset.type; t.dataset.typed = '1'; }
    // the newer figures print in the state the slide argues for, not the state it opens in
    showDid(3);
    landBring(true);
    landCtx(true);
    cycleAt = CYCLE_MAX;
    drawCycle();
    landMonday('learn');
  });
}
