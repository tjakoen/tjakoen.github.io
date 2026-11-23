// site/figure-rules.js — the six rules of the Model Intelligence Layer, each with the small animation it
// comes down to.
//
// The note serves six plain link cards (nav.rule-cards), each pointing at the section that explains a
// rule. This file reads those cards, so their words and links have one home, and lays them out as a
// stage and a list: pick a rule on the right, its diagram plays on the left, and a button scrolls to the
// section. Without JavaScript, in print and in the static export, the cards stay as they are.

const NS = 'http://www.w3.org/2000/svg';
const clamp = (v) => Math.max(0, Math.min(1, v));
const t = (x, y, s, size = 13, extra = '') =>
  `<text x="${x}" y="${y}" text-anchor="middle" style="fill:currentColor;font-size:${size}px${extra}">${s}</text>`;
const box = (x, y, w, h, filled, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" style="fill:${filled ? 'var(--ink)' : 'none'};stroke:${filled ? 'var(--ink)' : 'var(--line-soft)'};stroke-width:1.5${extra}"/>`;
const arrow = (x1, x2, y) =>
  `<g style="stroke:var(--ink-muted);stroke-width:1.5;fill:none"><line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><path d="M${x2 - 5},${y - 4} L${x2},${y} L${x2 - 5},${y + 4}"/></g>`;
const ink = (s, on) => (on ? `<g style="color:var(--paper)">${s}</g>` : s);

// One drawing per rule, in the order of the cards. Each takes p from 0 to 1 and returns SVG for a 300 by
// 150 stage. Words stay on screen throughout; only fills, positions and marks move.
const DRAW = [
  // 1. Tiers, not models: the three tiers fill in, strongest first.
  (p) => ['strong', 'execution', 'light'].map((name, i) => {
    const w = [220, 170, 120][i] * clamp(p * 3 - i);
    return `<rect x="40" y="${28 + i * 36}" width="${w}" height="24" rx="5" style="fill:var(--ink);opacity:${i === 0 ? 1 : 0.45}"/>` +
      `<text x="48" y="${45 + i * 36}" style="fill:${i === 0 && w > 40 ? 'var(--paper)' : 'currentColor'};font-size:13px">${name}</text>`;
  }).join('') + t(150, 140, 'work asks for a tier, not a model', 12, ';font-style:italic;fill:var(--ink-muted)'),

  // 2. One free model, then Go: free is tried, runs out, and Go takes the work.
  (p) => {
    const out = p > 0.45, at = out ? 1 : 0;
    return ['free', 'Go', 'Luna', 'Sol'].map((n, i) => {
      const x = 12 + i * 72;
      return box(x, 50, 56, 36, i === at) +
        ink(t(x + 28, 73, n, 13, i === 0 && out ? ';text-decoration:line-through;fill:var(--ink-muted)' : ''), i === at) +
        (i < 3 ? arrow(x + 58, x + 70, 68) : '');
    }).join('') + t(150, 118, out ? 'free is out for today, so Go takes it' : 'the first model not out wins', 12, ';font-style:italic;fill:var(--ink-muted)');
  },

  // 3. Paid only on a typed yes: the approval types itself into a terminal.
  (p) => {
    const cmd = 'approve 3f9a1c07e2b4d816', shown = cmd.slice(0, Math.round(cmd.length * clamp(p * 1.4)));
    return `<rect x="24" y="36" width="252" height="70" rx="8" style="fill:var(--ink)"/>` +
      `<text x="40" y="62" style="fill:var(--paper);opacity:.6;font-size:13px">owner $</text>` +
      `<text x="40" y="88" style="fill:var(--paper);font-size:14px;font-family:var(--font-mono)">${shown}${p < 0.75 ? '_' : ''}</text>` +
      t(150, 132, 'no agent holds the key', 12, ';font-style:italic;fill:var(--ink-muted)');
  },

  // 4. Four at a time: one session, four agents branch off, two levels deep at most.
  (p) => `<circle cx="150" cy="30" r="10" style="fill:var(--ink)"/>` + [0, 1, 2, 3].map((i) => {
    const on = clamp(p * 5 - i), cx = 60 + i * 60;
    return `<g style="opacity:${on}"><line x1="150" y1="40" x2="${cx}" y2="78" style="stroke:var(--line-soft);stroke-width:1.5"/>` +
      `<circle cx="${cx}" cy="88" r="9" style="fill:none;stroke:var(--ink);stroke-width:2"/></g>`;
  }).join('') + `<g style="opacity:${clamp(p * 5 - 4)}">${t(150, 132, '4 live per session · 2 deep · 2 retries', 12, ';font-style:italic;fill:var(--ink-muted)')}</g>`,

  // 5. Work stays in its lane: a request from the work computer reaches for a free model and is refused.
  (p) => {
    const x = 70 + 70 * clamp(p * 1.6), refused = p > 0.6;
    return box(14, 34, 112, 70, false, ';stroke:var(--ink);stroke-width:2') + t(70, 58, 'Work computer', 12) + t(70, 78, 'Claude · Codex', 11, ';fill:var(--ink-muted)') +
      `<line x1="150" y1="24" x2="150" y2="114" style="stroke:var(--ink);stroke-width:2;stroke-dasharray:5 4"/>` +
      box(174, 34, 112, 70) + t(230, 58, 'Free model', 12) + t(230, 78, 'keeps prompts', 11, ';fill:var(--ink-muted)') +
      `<circle cx="${Math.min(x, 140)}" cy="94" r="6" style="fill:var(--ink)"/>` +
      `<g style="opacity:${refused ? 1 : 0}">${t(150, 136, 'refused: work never reaches it', 12, ';font-style:italic;fill:var(--ink-muted)')}</g>`;
  },

  // 6. Checked every session: the checklist rows tick in, ending on the verdict.
  (p) => {
    const rows = ['ok   Hooks', 'ok   Model Intelligence Layer', 'ok   PANTRY contract'];
    return `<rect x="20" y="16" width="260" height="118" rx="8" style="fill:none;stroke:var(--line-soft);stroke-width:1.5"/>` +
      rows.map((r, i) => `<text x="36" y="${44 + i * 24}" style="fill:currentColor;opacity:${clamp(p * 4 - i)};font-size:12.5px;font-family:var(--font-mono)">${r}</text>`).join('') +
      `<text x="36" y="122" style="fill:currentColor;opacity:${clamp(p * 4 - 3)};font-size:13px;font-weight:700;font-family:var(--font-mono)">Agentic Loop Loaded</text>`;
  },
];

export function mountRules(host) {
  const cards = [...host.querySelectorAll('.rule-card')];
  if (cards.length !== DRAW.length) return false;
  const rules = cards.map((a) => ({
    n: a.querySelector('.rule-card__n')?.textContent ?? '',
    title: a.querySelector('.rule-card__t')?.textContent ?? '',
    desc: a.querySelector('.rule-card__d')?.textContent ?? '',
    href: a.getAttribute('href') ?? '#',
  }));
  host.innerHTML = `<div class="rules" data-rules>
    <div class="rules__stage">
      <svg class="rules__svg" viewBox="0 0 300 150" role="img" aria-live="polite" data-rules-svg xmlns="${NS}"></svg>
      <p class="rules__desc" data-rules-desc></p>
      <a class="rules__go" data-rules-go href="#">Read the section</a>
    </div>
    <div class="rules__list" role="tablist" aria-label="The six rules">
      ${rules.map((r, i) => `<button type="button" role="tab" class="rules__item" data-rule="${i}" aria-selected="false">
        <span class="rules__n">${r.n}</span><span class="rules__t">${r.title}</span></button>`).join('')}
    </div>
  </div>`;
  const svg = host.querySelector('[data-rules-svg]');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0, start = 0, raf = 0;

  const frame = (now) => {
    const PLAY = 2200, HOLD = 1400;
    const phase = ((now - start) % (PLAY + HOLD)) / PLAY;
    svg.innerHTML = DRAW[current](clamp(phase));
    raf = requestAnimationFrame(frame);
  };
  const select = (i) => {
    current = i;
    host.querySelectorAll('[data-rule]').forEach((b) => b.setAttribute('aria-selected', String(Number(b.dataset.rule) === i)));
    host.querySelector('[data-rules-desc]').textContent = rules[i].desc;
    svg.setAttribute('aria-label', `${rules[i].title}. ${rules[i].desc}`);
    host.querySelector('[data-rules-go]').setAttribute('href', rules[i].href);
    cancelAnimationFrame(raf);
    if (still) { svg.innerHTML = DRAW[i](1); return; }
    start = performance.now();
    raf = requestAnimationFrame(frame);
  };
  host.addEventListener('click', (e) => {
    const b = e.target.closest('[data-rule]');
    if (b) select(Number(b.dataset.rule));
  });
  host.addEventListener('keydown', (e) => {
    const b = e.target.closest('[data-rule]');
    if (!b || !['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const next = (Number(b.dataset.rule) + (e.key === 'ArrowDown' ? 1 : DRAW.length - 1)) % DRAW.length;
    host.querySelector(`[data-rule="${next}"]`).focus();
    select(next);
  });
  select(0);
  return true;
}
