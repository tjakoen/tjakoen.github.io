// site/figure-walk.js — the Model Intelligence Layer as a walkthrough the reader drives.
//
// The static stack in the note (tools/note-diagrams.ts, stack "walk") is what the server sends. This file,
// loaded by figures.js only on a page that carries data-live-figure="walk", swaps it for the same stack
// built from buttons, and lets the reader send one of three requests through it, a step at a time. Each
// request proves one of the three things the layer is for: it never stalls, it never leaks private code,
// and it never spends money without my typed yes. Every label stays on screen at every step; only the
// highlight, the marks on the model tiles and the caption change.

const BANDS = [
  { key: 'me', title: null, tiles: [{ key: 'me', t: 'Me', s: 'requests, approvals' }] },
  { key: 'loop', title: 'The loop', tiles: [
    { key: 'standards', t: 'Standards' }, { key: 'plans', t: 'Plans' },
    { key: 'review', t: 'Independent review' }, { key: 'gates', t: 'Human gates' }] },
  { key: 'mil', title: 'The Model Intelligence Layer', heavy: true, tiles: [
    { key: 'registry', t: 'Registry', s: 'work becomes a tier' }, { key: 'router', t: 'Router', s: 'first model not out' },
    { key: 'supervisor', t: 'Supervisor', s: 'four at a time' }, { key: 'recovery', t: 'Recovery', s: 'checkpoint, hand-off' }] },
  { key: 'harness', title: 'Harnesses', tiles: [
    { key: 'claude', t: 'Claude Code' }, { key: 'opencode', t: 'OpenCode' }, { key: 'codex', t: 'Codex app' }] },
  { key: 'models', title: 'Models, by role', tiles: [
    { key: 'strong', t: 'Opus · Sol', s: 'planning, review · private', strong: true },
    { key: 'luna', t: 'Luna', s: 'light · private' },
    { key: 'free', t: 'Free model', s: 'light · keeps prompts' },
    { key: 'go', t: 'OpenCode Go', s: 'light · keeps prompts' },
    { key: 'paid', t: 'DeepSeek API', s: 'on my yes · keeps prompts' }] },
  { key: 'pantry', title: null, tiles: [{ key: 'pantry', t: 'PANTRY', s: 'records every call' }] },
];

const WHAT = {
  me: 'I make the requests and give the approvals. Nothing paid moves without me.',
  standards: 'The public standards every session follows, the same in every harness.',
  plans: 'Work runs under a plan, so what it did and what it cost land somewhere.',
  review: 'A fresh reader checks a big plan before it starts and the work after it ends.',
  gates: 'Anything risky, and anything paid, is a decision that waits for me.',
  registry: 'Turns the kind of work into a tier, so no prompt ever names a model.',
  router: 'Takes the first model in the tier that is not out, cooling down, or barred from this repository.',
  supervisor: 'Allows four agents at a time, two levels deep, with two retries.',
  recovery: 'Writes a checkpoint so a session can carry on after a model runs out.',
  claude: 'Where I work when I want Claude.',
  opencode: 'Runs all coding outside Claude, and launches the light subagents.',
  codex: 'For work that is not coding.',
  strong: 'Planning and review. Private, on the plans I already pay for.',
  luna: 'Light work on the Codex plan. Private.',
  free: 'Light work at no cost. The free models share one daily cap, and may keep what they are sent.',
  go: 'The same model on a flat monthly plan. Its allowance is checked before every pick.',
  paid: 'The paid DeepSeek API. Never picked by itself: every call waits for my typed yes.',
  pantry: 'Records every call: which model did it, what it cost, and whether it was private.',
};

// Each walk is a list of steps. `at` is the tile the request is on, `say` the caption, and `marks` the
// words that stay on a model tile from that step on.
const WALKS = {
  stall: {
    label: 'The free model is out',
    outcome: 'Never stalls: when a model runs out, the next one in the chain takes the work.',
    steps: [
      { at: 'me', say: 'I ask for light work: read a few files and sum them up.' },
      { at: 'plans', say: 'It becomes a plan, so the work and its cost are tracked.' },
      { at: 'registry', say: 'The registry turns light work into the light tier.' },
      { at: 'router', say: 'The router walks the light chain: the free model, then Go, then Luna.' },
      { at: 'opencode', say: 'It runs as a subagent in OpenCode.' },
      { at: 'free', say: 'The free model has hit its shared daily cap. It is out for today.', marks: { free: 'out for today' } },
      { at: 'go', say: 'Go takes the work on the flat plan. Its allowance had room.', marks: { go: 'took the work' } },
      { at: 'pantry', say: 'The answer comes back, and PANTRY records that Go did it.' },
    ],
  },
  leak: {
    label: 'A private repository',
    outcome: 'Never leaks: in a repository that is not mine, only private models are candidates.',
    steps: [
      { at: 'me', say: 'I ask for the same light work, in a repository that is not mine.' },
      { at: 'plans', say: 'It becomes a plan, like any other work.' },
      { at: 'registry', say: 'The registry gives it the light tier, and knows this repository is not cleared.' },
      { at: 'router', say: 'The router skips every model that may keep prompts.', marks: { free: 'skipped', go: 'skipped', paid: 'skipped' } },
      { at: 'opencode', say: 'It runs as a subagent in OpenCode.' },
      { at: 'luna', say: 'Luna takes it: private, on the Codex plan.', marks: { luna: 'took the work' } },
      { at: 'pantry', say: 'PANTRY records the call as private.' },
    ],
  },
  spend: {
    label: 'It needs the paid model',
    outcome: 'Never overspends: no agent holds the key, and every paid call needs my typed yes.',
    steps: [
      { at: 'me', say: 'I ask for something only the bigger paid model can do.' },
      { at: 'plans', say: 'It becomes a plan, like any other work.' },
      { at: 'gates', say: 'Paid work is gated: it is a decision for me, not for an agent.' },
      { at: 'registry', say: 'The registry knows the paid API is an escalation, never part of a chain.' },
      { at: 'router', say: 'So the router will not pick it. It files an escalation request and stops.' },
      { at: 'paid', say: 'The request waits at the paid API. No agent holds its key.', marks: { paid: 'waits for my yes' } },
      { at: 'me', say: 'I type approve in my terminal, or I do not. Until then, nothing is spent.' },
    ],
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const WALK_MARKUP = `<div class="walk" data-walk>
  <div class="walk__modes" role="group" aria-label="Pick a request to follow">
    ${Object.entries(WALKS).map(([k, w]) => `<button type="button" class="walk__mode" data-walk-mode="${k}" aria-pressed="false">${esc(w.label)}</button>`).join('')}
  </div>
  <p class="walk__say" aria-live="polite"><span class="walk__num" data-walk-num>1</span><span data-walk-say></span></p>
  <div class="walk__stack">
    ${BANDS.map((b) => `<div class="walk__band${b.heavy ? ' walk__band--heavy' : ''}${b.title ? '' : ' walk__band--bare'}">
      ${b.title ? `<p class="walk__band-title">${esc(b.title)}</p>` : ''}
      <div class="walk__tiles">${b.tiles.map((t) => `<button type="button" class="walk__tile${t.strong ? ' walk__tile--strong' : ''}" data-node="${t.key}" aria-describedby="walk-detail">
        <b class="walk__name">${esc(t.t)}</b>${t.s ? `<em class="walk__sub">${esc(t.s)}</em>` : ''}<span class="walk__mark" data-mark></span>
      </button>`).join('')}</div>
    </div>`).join('')}
  </div>
  <p class="walk__detail" id="walk-detail" data-walk-detail>Tap any box to see what it does.</p>
  <div class="walk__nav">
    <button type="button" class="walk__btn" data-walk-back>Back</button>
    <button type="button" class="walk__btn" data-walk-play aria-pressed="false">Play</button>
    <button type="button" class="walk__btn" data-walk-next>Next</button>
    <span class="walk__count" data-walk-count></span>
  </div>
  <p class="walk__outcome" data-walk-outcome hidden></p>
</div>`;

export function mountWalk(host) {
  host.innerHTML = WALK_MARKUP;
  const root = host.querySelector('[data-walk]');
  if (!root) return false;
  const tiles = new Map([...root.querySelectorAll('[data-node]')].map((el) => [el.dataset.node, el]));
  const q = (sel) => root.querySelector(sel);
  let mode = 'stall', step = 0, timer = null;

  const render = () => {
    const walk = WALKS[mode], steps = walk.steps, cur = steps[step];
    const seen = new Set(steps.slice(0, step + 1).map((s) => s.at));
    const marks = Object.assign({}, ...steps.slice(0, step + 1).map((s) => s.marks || {}));
    for (const [key, el] of tiles) {
      el.classList.toggle('is-here', key === cur.at);
      el.classList.toggle('is-seen', seen.has(key) && key !== cur.at);
      el.classList.toggle('is-marked', key in marks);
      el.querySelector('[data-mark]').textContent = marks[key] || '';
    }
    q('[data-walk-num]').textContent = String(step + 1);
    q('[data-walk-say]').textContent = cur.say;
    q('[data-walk-count]').textContent = `Step ${step + 1} of ${steps.length}`;
    q('[data-walk-back]').disabled = step === 0;
    q('[data-walk-next]').disabled = step === steps.length - 1;
    const out = q('[data-walk-outcome]');
    out.hidden = step !== steps.length - 1;
    out.textContent = walk.outcome;
    for (const b of root.querySelectorAll('[data-walk-mode]')) b.setAttribute('aria-pressed', String(b.dataset.walkMode === mode));
  };

  const stop = () => {
    clearInterval(timer); timer = null;
    q('[data-walk-play]').setAttribute('aria-pressed', 'false');
    q('[data-walk-play]').textContent = 'Play';
  };
  const go = (n) => { step = Math.max(0, Math.min(WALKS[mode].steps.length - 1, n)); render(); };

  root.addEventListener('click', (e) => {
    const m = e.target.closest('[data-walk-mode]');
    if (m) { stop(); mode = m.dataset.walkMode; go(0); return; }
    if (e.target.closest('[data-walk-back]')) { stop(); go(step - 1); return; }
    if (e.target.closest('[data-walk-next]')) { stop(); go(step + 1); return; }
    if (e.target.closest('[data-walk-play]')) {
      if (timer) { stop(); return; }
      if (step === WALKS[mode].steps.length - 1) go(0);
      q('[data-walk-play]').setAttribute('aria-pressed', 'true');
      q('[data-walk-play]').textContent = 'Pause';
      timer = setInterval(() => {
        if (step >= WALKS[mode].steps.length - 1) { stop(); return; }
        go(step + 1);
      }, 1800);
      return;
    }
    const t = e.target.closest('[data-node]');
    if (t) q('[data-walk-detail]').textContent = `${t.querySelector('.walk__name').textContent}: ${WHAT[t.dataset.node]}`;
  });
  root.addEventListener('focusin', (e) => {
    const t = e.target.closest('[data-node]');
    if (t) q('[data-walk-detail]').textContent = `${t.querySelector('.walk__name').textContent}: ${WHAT[t.dataset.node]}`;
  });
  root.addEventListener('mouseover', (e) => {
    const t = e.target.closest('[data-node]');
    if (t) q('[data-walk-detail]').textContent = `${t.querySelector('.walk__name').textContent}: ${WHAT[t.dataset.node]}`;
  });

  render();
  return true;
}
