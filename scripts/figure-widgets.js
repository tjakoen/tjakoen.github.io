// site/figure-widgets.js — the talk's figures, mounted in prose.
//
// The markup below is lifted from the deck verbatim, so a widget cannot say one thing on a slide
// and another in a paragraph. What differs is the TRIGGER, and only where it has to: the deck
// drives the ratio's reveal and the sprint's playback off slide steps, which prose does not have,
// so those two get a button instead. Everything else is click-driven already and ports as-is.
//
// Every mount returns false when its markup is not what it expected, so figures.js can put the
// static figure back rather than leave a hole.

const h = (host, html) => { host.innerHTML = html; return host.firstElementChild; };

/* --- the ratio: guess, then reveal ------------------------------------------- */
export const RATIO = `<div class="ratio" data-ratio>
        <div class="ratio__bar">
          <span class="ratio__code" data-ratio-code style="width:100%"></span>
          <span class="ratio__prose" data-ratio-prose style="width:0%"></span>
          <span class="ratio__guess" data-ratio-guess data-label="the room says: 20%" style="left:20%"></span>
        </div>
        <p class="ratio__keys">
          <span><b>code</b> <span data-ratio-code-val>34,595</span> lines</span>
          <span class="ratio__nudge">drag the marker, then reveal</span>
          <span><b>writing</b> <span data-ratio-prose-val>0</span> lines</span>
        </p>
        <p class="ratio__punch frag" data-grade="grain"><b>52% of that repo is writing, not code.</b> Plans, conventions, decisions, and notes to whoever opens it next.</p>
      </div>`;
export function mountRatio(host) {
  h(host, RATIO);
  const ratio = host.querySelector('[data-ratio]');
  // the control goes INSIDE, above the payoff line. That line is kept in the layout while hidden
  // so revealing it shifts nothing, and parking the button after it left a hole in the middle of
  // the figure; this way the reserved space reads as trailing padding instead.
  ratio?.querySelector('.ratio__punch')?.insertAdjacentHTML('beforebegin',
    '<p class="live-fig__ctl"><button class="btn" type="button" data-ratio-reveal>Show me</button></p>');
  const btn = host.querySelector('[data-ratio-reveal]');
  const marker = host.querySelector('[data-ratio-guess]');
  if (!ratio || !btn || !marker) return false;

  let guess = 20, shown = false;
  const setGuess = (n) => {
    guess = Math.max(0, Math.min(100, n));
    marker.style.left = guess + '%';
    marker.dataset.label = 'your guess: ' + guess + '%';
  };
  // dragging the bar is the prose equivalent of the room shouting a number
  const fromEvent = (e) => {
    const bar = host.querySelector('.ratio__bar').getBoundingClientRect();
    setGuess(Math.round(((e.clientX - bar.left) / bar.width) * 100));
  };
  host.querySelector('.ratio__bar').addEventListener('pointerdown', (e) => { if (!shown) fromEvent(e); });
  host.querySelector('.ratio__bar').addEventListener('pointermove', (e) => { if (!shown && e.buttons) fromEvent(e); });

  btn.addEventListener('click', () => {
    shown = !shown;
    // 34,595 lines of code against 36,837 of writing, git-tracked, counted 22 August 2026.
    // Keep in step with the static SVG and the prose in content/notes/ten-times-zero.md, whose
    // REFRESH comment carries the recompute commands.
    host.querySelector('[data-ratio-code]').style.width = shown ? '48.4%' : '100%';
    host.querySelector('[data-ratio-prose]').style.width = shown ? '51.6%' : '0%';
    host.querySelector('[data-ratio-prose-val]').textContent = shown ? '36,837' : '0';
    host.querySelector('.ratio__punch').classList.toggle('is-on', shown);
    btn.textContent = shown ? 'Hide it again' : 'Show me';
  });
  setGuess(20);
  return true;
}

/* --- four titles, one skill set: click a column ------------------------------ */
export const MATRIX = `<table class="matrix" data-matrix>
      <colgroup><col><col data-col="0"><col data-col="1"><col data-col="2"><col data-col="3"></colgroup>
      <thead>
        <tr>
          <th></th>
          <th><button class="matrix__pick" type="button" data-pick="0" aria-pressed="false">Dev manager</button></th>
          <th><button class="matrix__pick" type="button" data-pick="1" aria-pressed="false">Tech lead</button></th>
          <th><button class="matrix__pick" type="button" data-pick="2" aria-pressed="false">Teacher</button></th>
          <th><button class="matrix__pick" type="button" data-pick="3" aria-pressed="false">AI</button></th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Give direction</td><td>a clear brief</td><td>the conventions</td><td>the lesson</td><td>a prompt plus docs</td></tr>
        <tr><td>Verify anyway</td><td>review the PR</td><td>design review</td><td>grade the work</td><td>read the output</td></tr>
      </tbody>
    </table>`;
export function mountMatrix(host) {
  h(host, MATRIX);
  const matrix = host.querySelector('[data-matrix]');
  if (!matrix) return false;
  matrix.addEventListener('click', (e) => {
    const pick = e.target.closest('[data-pick]');
    if (!pick) return;
    const on = pick.getAttribute('aria-pressed') === 'true';
    matrix.querySelectorAll('[data-pick]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
    matrix.querySelectorAll('col[data-col]').forEach((c) => c.classList.remove('is-lit'));
    if (on) return;
    pick.setAttribute('aria-pressed', 'true');
    matrix.querySelector('col[data-col="' + pick.dataset.pick + '"]')?.classList.add('is-lit');
  });
  return true;
}

/* --- the overnight sprint: a button, since prose has no slide steps ---------- */
export const SPRINT = `<div class="sprint" data-sprint>
      <div class="sprint__line" data-sprint-line><span class="sprint__night"></span></div>
      <p class="sprint__ends"><span>9:08pm</span><span>the small hours</span><span>3:31am</span></p>
      <p class="sprint__count"><span data-sprint-count>0</span> / 50 commits</p>
      <p class="sprint__note">The night of 4 July. One commit every eight minutes, 4,269 lines added before it got light, every one of them co-authored with a machine.</p>
    </div>`;
export function mountSprint(host) {
  h(host, SPRINT + '<p class="live-fig__ctl"><button class="btn" type="button" data-sprint-play>Play the night</button></p>');
  const line = host.querySelector('[data-sprint-line]');
  const count = host.querySelector('[data-sprint-count]');
  const btn = host.querySelector('[data-sprint-play]');
  if (!line || !count || !btn) return false;
  line.insertAdjacentHTML('beforeend', Array.from({ length: 50 }, (_, i) =>
    '<span class="sprint__tick" style="left:' + (i / 49) * 100 + '%"></span>').join(''));
  const ticks = [...host.querySelectorAll('.sprint__tick')];
  let timer = null;
  btn.addEventListener('click', () => {
    clearInterval(timer);
    ticks.forEach((t) => t.classList.remove('is-on'));
    count.textContent = '0';
    let i = 0;
    timer = setInterval(() => {
      if (i >= ticks.length) { clearInterval(timer); btn.textContent = 'Play it again'; return; }
      ticks[i].classList.add('is-on');
      count.textContent = String((i += 1));
    }, 70);
  });
  return true;
}

/* --- the playbook ring: one node open at a time ------------------------------ */
export const LOOP = `<div class="loop" data-loop>
      <div class="loop__ring">
        <svg class="fig" viewBox="0 0 320 320" aria-hidden="true">
          <circle cx="160" cy="160" r="118" style="fill:none;stroke:var(--color-line);stroke-width:1.5"/>
          <!-- the ring draws itself clockwise, so the loop reads as a direction and not a decoration -->
          <circle cx="160" cy="160" r="118" data-draw
                  style="--draw-len:742;fill:none;stroke:var(--color-fg);stroke-width:2;transition-duration:1.5s"/>
          <!-- three arrowheads riding the ring, so the loop reads as a direction, not a decoration -->
          <g data-lit style="fill:var(--color-fg)">
            <polygon points="152,34 168,42 152,50"/>
            <polygon points="152,34 168,42 152,50" transform="rotate(120 160 160)"/>
            <polygon points="152,34 168,42 152,50" transform="rotate(240 160 160)"/>
          </g>
        </svg>
        <button class="loop__node" type="button" data-node="0" aria-expanded="false"><span>01</span>Rails</button>
        <button class="loop__node" type="button" data-node="1" aria-expanded="false"><span>02</span>Memory</button>
        <button class="loop__node" type="button" data-node="2" aria-expanded="false"><span>03</span>Sync map</button>
        <button class="loop__node" type="button" data-node="3" aria-expanded="false"><span>04</span>Audit</button>
        <button class="loop__node" type="button" data-node="4" aria-expanded="false"><span>05</span>Tests</button>
        <button class="loop__node" type="button" data-node="5" aria-expanded="false"><span>06</span>Docs</button>
        <p class="loop__hub">keeps fast<br>from turning<br>into fragile</p>
      </div>
      <div class="loop__detail" data-loop-detail>
        <ol class="loop__all">
          <li>Write the rails before the features</li>
          <li>Give the AI a memory</li>
          <li>Make change propagate: keep a sync map</li>
          <li>Audit relentlessly</li>
          <li>Tests are part of the work</li>
          <li>Document for the machine, on purpose</li>
        </ol>
        <div class="loop__card" data-card="0" hidden><h3>Write the rails before the features</h3><p>A conventions doc and an onboarding doc written <em>for</em> the AI, before a line of features. Any model or human joining reads the same "here is how this works, here is what not to touch."</p></div>
        <div class="loop__card" data-card="1" hidden><h3>Give the AI a memory</h3><p>Twenty-odd small decision records of <em>why</em> things are the way they are. Next session it inherits the reasoning instead of relitigating it, or worse, quietly undoing it.</p></div>
        <div class="loop__card" data-card="2" hidden><h3>Make change propagate: keep a sync map</h3><p>The failure mode of fast AI work isn't bad code, it's drift. An explicit "when you change this, also update that" table turns "don't forget" into a checklist a machine can follow.</p></div>
        <div class="loop__card" data-card="3" hidden><h3>Audit relentlessly</h3><p>A model earns <em>more</em> scrutiny than a junior, not less, because it's fluent enough to sound right exactly when it's wrong. Most of my prompting isn't "build this." It's "check this."</p></div>
        <div class="loop__card" data-card="4" hidden><h3>Tests are part of the work</h3><p>Three tiers, written <em>as</em> features, not bolted on after. Type-checker and suite green before anything is done. The least glamorous rule, and the seatbelt that lets me drive fast.</p></div>
        <div class="loop__card" data-card="5" hidden><h3>Document for the machine, on purpose</h3><p>The AI is a first-class reader, so write <em>for</em> it, not around it. You onboard this collaborator every time you open a session, so build the onboarding and polish it as you go.</p></div>
      </div>
    </div>`;
export function mountLoop(host) {
  h(host, LOOP);
  const loop = host.querySelector('[data-loop]');
  if (!loop) return false;
  loop.addEventListener('click', (e) => {
    const node = e.target.closest('[data-node]');
    if (!node) return;
    const on = node.getAttribute('aria-expanded') === 'true';
    loop.querySelectorAll('[data-node]').forEach((n) => n.setAttribute('aria-expanded', 'false'));
    loop.querySelectorAll('[data-card]').forEach((c) => { c.hidden = true; });
    const all = loop.querySelector('.loop__all');
    if (all) all.hidden = !on;
    if (on) return;
    node.setAttribute('aria-expanded', 'true');
    const card = loop.querySelector('[data-card="' + node.dataset.node + '"]');
    if (card) card.hidden = false;
  });
  // the ring and its arrowheads only draw once the deck marks them; in prose, draw immediately
  loop.querySelectorAll('[data-draw], [data-lit]').forEach((el) => el.classList.add('is-drawn'));
  return true;
}

/* --- the silent-failure demo: click the left one twice ----------------------- */
export const TRAP = `<div class="trap" data-trap>
      <div class="trap__card">
        <p class="trap__t"><span>the trap</span>Used slightly wrong</p>
        <p><button class="btn" type="button" data-trap-bad>Apply the texture</button></p>
        <p class="trap__out" data-trap-out-bad>&nbsp;</p>
      </div>
      <div class="trap__card">
        <p class="trap__t"><span>designed out</span>Cannot be used wrong</p>
        <p><button class="btn" type="button" data-trap-good>Apply the texture</button></p>
        <p class="trap__out" data-trap-out-good>&nbsp;</p>
      </div>
    </div>`;
export function mountTrap(host) {
  h(host, TRAP);
  const trap = host.querySelector('[data-trap]');
  if (!trap) return false;
  let clicks = 0;
  trap.querySelector('[data-trap-bad]').addEventListener('click', () => {
    clicks += 1;
    trap.querySelector('[data-trap-out-bad]').innerHTML = clicks < 2
      ? '&nbsp;' : '<b>Nothing. ' + clicks + ' clicks, no error, no warning.</b>';
  });
  trap.querySelector('[data-trap-good]').addEventListener('click', () => {
    trap.querySelector('[data-trap-out-good]').innerHTML =
      '<b data-grade="grain">The texture lands. Same click, same intent.</b>';
  });
  return true;
}
