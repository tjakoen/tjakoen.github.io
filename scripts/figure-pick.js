// site/figure-pick.js — the one decision the Model Intelligence Layer exists for, as a figure.
//
// Not the whole stack: just the moment a model is chosen. Light work goes down a short chain, the router
// gives each model a verdict, and the paid API sits apart behind my typed yes. Three requests, one per
// outcome the notes promise: when the free model is out, nothing stalls; in a private repository, nothing
// leaks; and a paid call never spends without me. The server sends a small table with the same three rows
// (tools: none, it is plain HTML in the note), and this file swaps in the version that plays.

const CHAIN = [
  { key: 'free', name: 'Free model', role: 'no cost · keeps prompts' },
  { key: 'go', name: 'OpenCode Go', role: 'flat plan · keeps prompts' },
  { key: 'luna', name: 'Luna', role: 'Codex plan · private' },
  { key: 'sol', name: 'Sol', role: 'Codex plan · private' },
];

const PICKS = {
  stall: {
    label: 'The free model is out',
    ask: 'Light work: read a few files and sum them up.',
    verdicts: [['free', 'out', 'out for today'], ['go', 'pick', 'takes it']],
    gate: null,
    outcome: 'Never stalls. When a model runs out, the next one takes the work.',
    log: 'opencode-go · plan · not private',
  },
  leak: {
    label: 'A private repository',
    ask: 'The same light work, in a repository that is not mine.',
    verdicts: [['free', 'skip', 'skipped'], ['go', 'skip', 'skipped'], ['luna', 'pick', 'takes it']],
    gate: null,
    outcome: 'Never leaks. Where the code is not mine, only private models are candidates.',
    log: 'openai/gpt-6-luna · plan · private',
  },
  spend: {
    label: 'It needs the paid model',
    ask: 'Something only the bigger paid model can do.',
    verdicts: [],
    gate: 'waits for my typed yes',
    outcome: 'Never overspends. No agent holds the key, and nothing is spent until I type approve.',
    log: 'escalation request · waiting · nothing spent',
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const PICK_MARKUP = `<div class="pick" data-pick>
  <div class="pick__modes" role="group" aria-label="Pick a request">
    ${Object.entries(PICKS).map(([k, p]) => `<button type="button" class="pick__mode" data-pick-mode="${k}" aria-pressed="false">${esc(p.label)}</button>`).join('')}
  </div>
  <p class="pick__ask"><span class="pick__tag">Request</span> <span data-pick-ask></span></p>
  <p class="pick__lead">Planning and review never enter this chain; they stay on Opus and Sol. Light work goes down it in order:</p>
  <ol class="pick__chain">
    ${CHAIN.map((m) => `<li class="pick__model" data-model="${m.key}">
      <b class="pick__name">${esc(m.name)}</b><span class="pick__role">${esc(m.role)}</span><span class="pick__verdict" data-verdict></span>
    </li>`).join('')}
  </ol>
  <div class="pick__gate" data-gate>
    <b class="pick__name">DeepSeek API</b><span class="pick__role">paid · never in the chain · only on my typed yes</span><span class="pick__verdict" data-verdict></span>
  </div>
  <p class="pick__outcome" data-pick-outcome aria-live="polite"></p>
  <p class="pick__log"><span class="pick__tag">PANTRY</span> <code data-pick-log></code></p>
</div>`;

export function mountPick(host) {
  host.innerHTML = PICK_MARKUP;
  const root = host.querySelector('[data-pick]');
  if (!root) return false;
  const q = (s) => root.querySelector(s);
  const models = new Map([...root.querySelectorAll('[data-model]')].map((el) => [el.dataset.model, el]));
  const gate = q('[data-gate]');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let timers = [];

  const clear = () => {
    timers.forEach(clearTimeout); timers = [];
    for (const el of [...models.values(), gate]) {
      el.className = el === gate ? 'pick__gate' : 'pick__model';
      el.querySelector('[data-verdict]').textContent = '';
    }
    q('[data-pick-outcome]').textContent = '';
    q('[data-pick-log]').textContent = '';
  };
  const mark = (el, kind, text) => {
    el.classList.remove('is-trying');
    el.classList.add(`is-${kind}`);
    el.querySelector('[data-verdict]').textContent = text;
  };

  const play = (mode, animate) => {
    clear();
    const p = PICKS[mode];
    for (const b of root.querySelectorAll('[data-pick-mode]')) b.setAttribute('aria-pressed', String(b.dataset.pickMode === mode));
    q('[data-pick-ask]').textContent = p.ask;
    const steps = p.verdicts.map(([key, kind, text]) => () => {
      const el = models.get(key);
      el.classList.add('is-trying');
      timers.push(setTimeout(() => mark(el, kind, text), animate ? 450 : 0));
    });
    if (p.gate) steps.push(() => { gate.classList.add('is-trying'); timers.push(setTimeout(() => mark(gate, 'wait', p.gate), animate ? 450 : 0)); });
    steps.push(() => {
      q('[data-pick-outcome]').textContent = p.outcome;
      q('[data-pick-log]').textContent = `+ ${p.log}`;
    });
    if (!animate) { steps.forEach((f) => f()); return; }
    steps.forEach((f, i) => timers.push(setTimeout(f, 250 + i * 900)));
  };

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pick-mode]');
    if (b) play(b.dataset.pickMode, !still);
  });
  play('stall', false);
  return true;
}
