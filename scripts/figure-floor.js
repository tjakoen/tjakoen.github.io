/* site/figure-floor.js — the two live figures for "Everybody Wants the Agent".
 *
 * Same split as figure-multiplier.js and figure-widgets.js: the BEHAVIOUR lives here, once, and
 * both surfaces import it. The deck drives them off slide steps (site/talk-floor.js) and the post
 * drives them off their own controls (site/figures.js), so a slide and a paragraph cannot end up
 * arguing two different things from the same picture.
 *
 * Both mounts return false when the host is not what they expected, so the caller can put the
 * static SVG back rather than leave a hole. That is the FIGURES upgrade rule: the static figure is
 * what gets served, and it has to stand alone.
 */

const h = (host, html) => { host.innerHTML = html; return host.firstElementChild; };
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/* ============================================================================
   1 · THE WHIPLASH DIAL
   Replaces a bar chart of the Faros deltas with the mechanism underneath them.
   Generation scales with adoption. Review capacity does not move at all. Drag
   the dial and the queue is the gap, which is the whole argument in one motion.
   ========================================================================= */

// Weekly changes produced at a given adoption level, against a review capacity that is a property
// of the team rather than of the tools. The curve is illustrative and says so on the figure: the
// SHAPE is the claim (one line bends, one is flat), not any single number on it.
const CAPACITY = 24;
const produced = (adoption) => Math.round(12 + (adoption / 100) * 32);

export const WHIPLASH = `<div class="whip" data-whip>
  <p class="whip__title">One team, one week, review capacity held still</p>
  <div class="whip__grid" data-whip-grid></div>
  <p class="whip__keys">
    <span><b data-whip-made>12</b> changes produced</span>
    <span><b data-whip-ok>12</b> reviewed</span>
    <span class="whip__wait"><b data-whip-wait>0</b> waiting</span>
  </p>
  <p class="live-fig__ctl whip__ctl">
    <label class="whip__lab" for="whip-dial">AI adoption</label>
    <input class="whip__dial" id="whip-dial" type="range" min="0" max="100" value="0" step="1" data-whip-dial>
    <output class="whip__out" data-whip-pct>0%</output>
  </p>
  <p class="whip__punch" data-grade="grain" data-whip-punch><b>Generation is elastic. Review is not.</b> Everything past the line is the queue, and the queue is where the Faros numbers come from.</p>
</div>`;

export function mountWhiplash(host) {
  h(host, WHIPLASH);
  const grid = host.querySelector('[data-whip-grid]');
  const dial = host.querySelector('[data-whip-dial]');
  if (!grid || !dial) return false;

  // 44 slots is the ceiling of produced(100), so the grid never reflows as the dial moves. A figure
  // that changes size while you drag it reads as a bug even when the numbers are right.
  // The capacity marker is a real element in the flow, dropped in after the last reviewable slot,
  // rather than a floating label. Absolute positioning put it on top of the second row the moment
  // the grid wrapped, which is exactly the sort of thing that only shows up on a projector.
  const cells = [];
  for (let i = 0; i < produced(100); i += 1) {
    if (i === CAPACITY) cells.push('<span class="whip__mark"><b>review capacity</b></span>');
    cells.push(`<span class="whip__dot" data-i="${i}"></span>`);
  }
  grid.innerHTML = cells.join('');
  const dots = [...grid.querySelectorAll('.whip__dot')];

  const render = (adoption) => {
    const made = produced(adoption);
    const ok = Math.min(made, CAPACITY);
    const wait = made - ok;
    dots.forEach((d, i) => {
      d.toggleAttribute('data-on', i < made);
      d.toggleAttribute('data-wait', i >= CAPACITY && i < made);
    });
    host.querySelector('[data-whip-made]').textContent = made;
    host.querySelector('[data-whip-ok]').textContent = ok;
    host.querySelector('[data-whip-wait]').textContent = wait;
    host.querySelector('[data-whip-pct]').textContent = adoption + '%';
    host.querySelector('[data-whip]').toggleAttribute('data-over', wait > 0);
  };

  dial.addEventListener('input', () => render(Number(dial.value)));
  render(0);

  // The deck drives the dial from slide steps instead of a hand on a mouse.
  host.__setAdoption = (n) => { dial.value = String(clamp(n, 0, 100)); render(Number(dial.value)); };
  return true;
}

/* ============================================================================
   2 · BUILD ORDER
   The note's central claim, made playable: the same coder, with and without the
   four skills that supervise it. Twelve changes go in either way. What differs
   is how many a human has to catch by reading.
   ========================================================================= */

// What each supervising skill catches, out of twelve changes. These are illustrative proportions
// and the figure says so: the claim is that four filters in front of a human beats none, not that
// your plan skill catches exactly two.
const GATES = [
  { key: 'plan',   name: 'Plan',        catches: 2, why: 'sent back for a testable spec' },
  { key: 'review', name: 'Code review',  catches: 3, why: 'caught against house standards' },
  { key: 'docs',   name: 'Docs',         catches: 1, why: 'drift caught on merge' },
  { key: 'qa',     name: 'QA',           catches: 2, why: 'failed a test it should pass' },
];
const TOTAL = 12;

export const BUILDORDER = `<div class="border" data-border>
  <p class="border__title">Twelve changes, one week, the same coder</p>
  <div class="border__lanes" data-border-lanes></div>
  <p class="border__keys">
    <span>a human reads <b data-border-human>12</b> of 12</span>
    <span class="border__caught"><b data-border-caught>0</b> caught by machine first</span>
  </p>
  <p class="live-fig__ctl border__ctl">
    <button class="btn" type="button" data-border-mode="coder" aria-pressed="true">Coder first</button>
    <button class="btn" type="button" data-border-mode="floor" aria-pressed="false">Supervision first</button>
  </p>
  <p class="border__punch" data-grade="grain" data-border-punch><b>Same coder. Different floor underneath it.</b> The four that supervise work are what make the fifth one defensible.</p>
</div>`;

export function mountBuildOrder(host) {
  h(host, BUILDORDER);
  const lanes = host.querySelector('[data-border-lanes]');
  if (!lanes) return false;

  lanes.innerHTML = GATES.map((g) => `
    <div class="border__lane" data-lane="${g.key}">
      <span class="border__name">${g.name}</span>
      <span class="border__dots" data-lane-dots></span>
      <span class="border__why">${g.why}</span>
    </div>`).join('') + `
    <div class="border__lane border__lane--human" data-lane="human">
      <span class="border__name">A human reads it</span>
      <span class="border__dots" data-lane-dots></span>
      <span class="border__why">always, either way</span>
    </div>`;

  const laneEls = [...lanes.querySelectorAll('.border__lane')];
  const dotsFor = (n, kind) =>
    Array.from({ length: n }, () => `<span class="border__dot" data-kind="${kind}"></span>`).join('');

  const render = (mode) => {
    const on = mode === 'floor';
    let caught = 0;
    GATES.forEach((g, i) => {
      const n = on ? g.catches : 0;
      caught += n;
      laneEls[i].querySelector('[data-lane-dots]').innerHTML = dotsFor(n, 'caught');
      laneEls[i].toggleAttribute('data-idle', !on);
    });
    const human = TOTAL - caught;
    laneEls[GATES.length].querySelector('[data-lane-dots]').innerHTML = dotsFor(human, 'human');
    host.querySelector('[data-border-human]').textContent = human;
    host.querySelector('[data-border-caught]').textContent = caught;
    host.querySelector('[data-border]').toggleAttribute('data-floor', on);
    host.querySelectorAll('[data-border-mode]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.borderMode === mode)));
  };

  host.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-border-mode]');
    if (btn) render(btn.dataset.borderMode);
  });
  render('coder');

  host.__setMode = (m) => render(m);
  return true;
}

/* ============================================================================
   3 · INSTRUCTION versus HOOK
   The distinction the talk says it would teach first, made watchable. Ten
   sessions run against one rule. An instruction is a request, so most sessions
   honour it and some do not, and the ones that do not look identical to the
   ones that do until something measures them. A hook is enforcement: the same
   ten sessions, zero violations, because the action never lands.
   ========================================================================= */

// Which of ten sessions quietly ignore a written rule. Fixed rather than random so the figure tells
// the same story in every room, and so the deck and the post cannot disagree about it.
const IGNORED = [2, 5, 6, 9];

export const RULEGATE = `<div class="rule" data-rule>
  <p class="rule__title">Ten sessions, one rule: never edit the shared tree directly</p>
  <div class="rule__runs" data-rule-runs></div>
  <p class="rule__keys">
    <span><b data-rule-kept>6</b> honoured it</span>
    <span class="rule__broke"><b data-rule-broke>4</b> did not</span>
    <span class="rule__silent" data-rule-silent>and nothing said so</span>
  </p>
  <p class="live-fig__ctl rule__ctl">
    <button class="btn" type="button" data-rule-mode="instruction" aria-pressed="true">An instruction</button>
    <button class="btn" type="button" data-rule-mode="hook" aria-pressed="false">A hook</button>
  </p>
  <p class="rule__punch" data-grade="grain" data-rule-punch><b>An instruction is a request. A hook is enforcement.</b> Anything whose violation would be an incident belongs in the second one.</p>
</div>`;

export function mountRuleGate(host) {
  h(host, RULEGATE);
  const runs = host.querySelector('[data-rule-runs]');
  if (!runs) return false;

  runs.innerHTML = Array.from({ length: 10 }, (_, i) =>
    `<span class="rule__run" data-i="${i}"><span class="rule__mark"></span></span>`).join('');
  const cells = [...runs.querySelectorAll('.rule__run')];

  const render = (mode) => {
    const hooked = mode === 'hook';
    cells.forEach((c, i) => {
      const broke = !hooked && IGNORED.includes(i);
      c.toggleAttribute('data-broke', broke);
      c.toggleAttribute('data-blocked', hooked && IGNORED.includes(i));
    });
    host.querySelector('[data-rule-kept]').textContent = hooked ? 10 : 10 - IGNORED.length;
    host.querySelector('[data-rule-broke]').textContent = hooked ? 0 : IGNORED.length;
    host.querySelector('[data-rule-silent]').textContent =
      hooked ? 'because the write never landed' : 'and nothing said so';
    host.querySelector('[data-rule]').toggleAttribute('data-hooked', hooked);
    host.querySelectorAll('[data-rule-mode]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.ruleMode === mode)));
  };

  host.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-rule-mode]');
    if (btn) render(btn.dataset.ruleMode);
  });
  render('instruction');
  host.__setMode = (m) => render(m);
  return true;
}

/* ============================================================================
   4 · THE ROADMAP
   HTML rather than SVG, so it scales with the stage instead of with a viewBox,
   and so the cursor can be dragged. Five stages over eighteen months, and a
   month cursor that tells you what should already be true and what you may
   start next. A gantt you can only look at answers "how long"; this one answers
   "where am I", which is the question a room actually has.

   The month numbers are an ESTIMATE and the punch line has to keep saying so.
   It once read "what it took me", which is an eighteen-month claim from somebody
   who has been at this a few months, and the note itself says "the last few
   months" twice. The stage ORDER is the defensible part. The durations are not
   measured and nothing here should imply they are.
   ========================================================================= */

const MONTHS = 18;
const STAGES = [
  { name: 'Instrument',  sub: 'one repo made legible',      from: 0,  to: 2,
    holds: 'a baseline nobody disputes, and every agent change marked' },
  { name: 'Skills',      sub: 'extracted, run by hand',     from: 1,  to: 5,
    holds: 'two skills in real use, extracted from people who do the work' },
  { name: 'Daily use',   sub: 'outcomes logged and scored', from: 3,  to: 9,
    holds: 'enough scored runs to say which skills work' },
  { name: 'Workflows',   sub: 'the same skills, triggered', from: 6,  to: 12,
    holds: 'review assist firing without anybody starting it' },
  { name: 'The loop',    sub: 'chained, unattended',        from: 10, to: 18,
    holds: 'two loops unattended for a month, quality holding' },
];
const pct = (m) => (m / MONTHS) * 100;

export const ROADMAP = `<div class="road" data-road>
  <p class="road__title">Subscriptions to automation, and what it actually takes</p>
  <div class="road__scale" aria-hidden="true">
    <span style="left:0%">now</span><span style="left:${pct(6)}%">6 months</span>
    <span style="left:${pct(12)}%">1 year</span><span style="left:100%">18</span>
  </div>
  <div class="road__rows" data-road-rows></div>
  <p class="live-fig__ctl road__ctl">
    <label class="road__lab" for="road-month">Where are you</label>
    <input class="road__dial" id="road-month" type="range" min="0" max="${MONTHS}" value="0" step="1" data-road-dial>
    <output class="road__out" data-road-out>month 0</output>
  </p>
  <p class="road__now" data-road-now></p>
  <p class="road__punch" data-grade="grain"><b>A stage opens on scored runs behind it, never on the date.</b> The months are an estimate, not a measurement, and not a schedule to hold anyone to.</p>
</div>`;

export function mountRoadmap(host) {
  h(host, ROADMAP);
  const rows = host.querySelector('[data-road-rows]');
  const dial = host.querySelector('[data-road-dial]');
  if (!rows || !dial) return false;

  rows.innerHTML = STAGES.map((st) => `
    <div class="road__row" data-stage>
      <span class="road__name">${st.name}<em>${st.sub}</em></span>
      <span class="road__track">
        <span class="road__bar" style="left:${pct(st.from)}%;width:${pct(st.to - st.from)}%"></span>
      </span>
      <span class="road__state" data-road-state></span>
    </div>`).join('') + `
    <div class="road__lane" aria-hidden="true"><span></span><span class="road__lanetrack">
      <span class="road__cursor" data-road-cursor style="left:0%"></span></span><span></span></div>`;

  const rowEls = [...rows.querySelectorAll('.road__row')];
  const cursor = rows.querySelector('[data-road-cursor]');

  const render = (m) => {
    STAGES.forEach((st, i) => {
      const state = m >= st.to ? 'done' : m > st.from ? 'running' : 'not started';
      rowEls[i].dataset.state = state;
      rowEls[i].querySelector('[data-road-state]').textContent = state;
    });
    cursor.style.left = pct(m) + '%';
    host.querySelector('[data-road-out]').textContent = 'month ' + m;
    // What should already hold, and what you are allowed to start. The second half is the useful
    // one: a stage you have not earned yet is the commonest thing to start early.
    const done = STAGES.filter((st) => m >= st.to);
    const next = STAGES.find((st) => m < st.to);
    host.querySelector('[data-road-now]').innerHTML = m === 0
      ? 'Nothing yet. Start by marking every agent-authored change, because it cannot be backfilled.'
      : `<b>Should already hold:</b> ${done.length ? done[done.length - 1].holds : 'nothing has closed yet'}.`
        + (next ? ` <b>In flight:</b> ${next.name.toLowerCase()}.` : ' Everything has closed.');
    host.querySelector('[data-road]').toggleAttribute('data-moved', m > 0);
  };

  dial.addEventListener('input', () => render(Number(dial.value)));
  render(0);
  host.__setMonth = (m) => { dial.value = String(clamp(m, 0, MONTHS)); render(Number(dial.value)); };
  return true;
}

/* ============================================================================
   5 · THE AGENT LOOP
   The tall vertical SVG this replaces was 13% of a slide and wrong for a 16:9
   stage. More to the point, a drawing of a loop cannot show the two things that
   matter about it: that the retry actually fires, and that only two of seven
   nodes cost anything. So this one RUNS. Press it and a change walks the loop,
   fails its tests once, gets fixed, and lands on a human, with the model-call
   counter ticking only on the nodes that call a model.
   ========================================================================= */

const NODES = [
  { name: 'Trigger',        sub: 'webhook, schedule, CI',    kind: 'code'  },
  { name: 'Sandbox',        sub: 'scoped keys, no prod',     kind: 'code'  },
  { name: 'Implement',      sub: 'a model does this bit',    kind: 'model' },
  { name: 'Lint, test',     sub: 'plain code, every time',   kind: 'code'  },
  { name: 'Fix',            sub: 'capped at two attempts',   kind: 'model' },
  { name: 'Pull request',   sub: 'marked, linked, small',    kind: 'code'  },
  { name: 'Human review',   sub: 'never skipped',            kind: 'human' },
];
// One honest run: implement, tests fail, fix, tests pass, PR, human. The failure is scripted rather
// than random so the figure tells the same story in every room.
const RUN = [0, 1, 2, 3, 4, 3, 5, 6];

export const AGENTLOOP = `<div class="loopfig" data-loopfig>
  <p class="loopfig__title">One change through the loop, start to human</p>
  <ol class="loopfig__nodes" data-loop-nodes></ol>
  <p class="loopfig__keys">
    <span><b data-loop-model>0</b> model calls</span>
    <span><b data-loop-code>0</b> deterministic steps</span>
    <span class="loopfig__state" data-loop-state>idle</span>
  </p>
  <p class="live-fig__ctl loopfig__ctl">
    <button class="btn" type="button" data-loop-run>Run a change</button>
  </p>
  <p class="loopfig__punch" data-grade="grain"><b>Two of seven nodes cost tokens.</b> Everything else is plain code that executes identically every time, which is what makes the loop cheap and predictable at once.</p>
</div>`;

export function mountAgentLoop(host) {
  h(host, AGENTLOOP);
  const list = host.querySelector('[data-loop-nodes]');
  const btn = host.querySelector('[data-loop-run]');
  if (!list || !btn) return false;

  list.innerHTML = NODES.map((n, i) => `
    <li class="loopfig__node" data-kind="${n.kind}" data-i="${i}">
      <span class="loopfig__name">${n.name}</span>
      <span class="loopfig__sub">${n.sub}</span>
      <span class="loopfig__tag">${n.kind === 'model' ? 'model' : n.kind === 'human' ? 'human' : 'code'}</span>
    </li>`).join('');
  const nodeEls = [...list.querySelectorAll('.loopfig__node')];

  let timer = null;
  const paint = (upto) => {
    let model = 0, code = 0;
    const seen = RUN.slice(0, upto + 1);
    seen.forEach((n) => { if (NODES[n].kind === 'model') model += 1; else if (NODES[n].kind === 'code') code += 1; });
    nodeEls.forEach((el, i) => {
      el.toggleAttribute('data-active', seen.length > 0 && RUN[upto] === i);
      el.toggleAttribute('data-visited', seen.includes(i));
      // the second pass through the tests is what makes the retry visible at all
      el.toggleAttribute('data-again', i === 3 && seen.filter((x) => x === 3).length > 1);
    });
    host.querySelector('[data-loop-model]').textContent = model;
    host.querySelector('[data-loop-code]').textContent = code;
    const step = RUN[upto];
    host.querySelector('[data-loop-state]').textContent =
      upto < 0 ? 'idle'
      : step === 4 ? 'tests failed, one attempt to fix'
      : step === 6 ? 'landed on a human, as always'
      : NODES[step].name.toLowerCase();
    host.querySelector('[data-loopfig]').toggleAttribute('data-done', upto >= RUN.length - 1);
  };

  const play = () => {
    clearInterval(timer);
    let i = -1;
    paint(-1);
    btn.disabled = true;
    timer = setInterval(() => {
      i += 1;
      paint(i);
      if (i >= RUN.length - 1) { clearInterval(timer); btn.disabled = false; btn.textContent = 'Run it again'; }
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 620);
  };

  btn.addEventListener('click', play);
  paint(-1);
  // The deck steps straight to the end rather than animating, so a second arrow press never leaves
  // the room watching a timer.
  host.__runLoop = (full) => { if (full) { clearInterval(timer); paint(RUN.length - 1); btn.textContent = 'Run it again'; } else paint(-1); };
  return true;
}

/* ============================================================================
   6 · THE FOUR GATES
   The last static SVG in the note, and the one with the most obvious reason to
   move: a ladder you can only look at tells you the four gates exist, while one
   you can tick tells you which of them YOU fail. Same shape, turned into a
   two-minute self-assessment.
   ========================================================================= */

const GATE_LIST = [
  { key: 'vis',  name: 'Visibility',    ask: 'Can you say what is happening today, with numbers?' },
  { key: 'ver',  name: 'Verifiability', ask: 'Can a machine decide whether a change is correct?' },
  { key: 'leg',  name: 'Legibility',    ask: 'Can an agent read the codebase without a human explaining it?' },
  { key: 'con',  name: 'Containment',   ask: 'If it is wrong, do you know what breaks, and have you tested that?' },
];

export const GATES_FIG = `<div class="gates" data-gates>
  <p class="gates__title">Four gates. Tick the ones you would pass today.</p>
  <ul class="gates__list" data-gates-list></ul>
  <p class="gates__verdict" data-gates-verdict></p>
  <p class="gates__punch" data-grade="grain">Assisted development needs visibility and legibility. Anything unattended needs all four, and skipping one means finding out which in production.</p>
</div>`;

export function mountGates(host) {
  h(host, GATES_FIG);
  const list = host.querySelector('[data-gates-list]');
  if (!list) return false;

  list.innerHTML = GATE_LIST.map((g) => `
    <li class="gates__gate" data-gate="${g.key}">
      <button class="gates__btn" type="button" aria-pressed="false" data-gate-toggle>
        <span class="gates__box" aria-hidden="true"></span>
        <span class="gates__text"><b>${g.name}</b><em>${g.ask}</em></span>
      </button>
    </li>`).join('');

  const state = { vis: false, ver: false, leg: false, con: false };
  const render = () => {
    const on = Object.values(state).filter(Boolean).length;
    host.querySelectorAll('.gates__gate').forEach((el) => {
      const yes = state[el.dataset.gate];
      el.toggleAttribute('data-on', yes);
      el.querySelector('[data-gate-toggle]').setAttribute('aria-pressed', String(yes));
    });
    // Two named destinations rather than a score, because a score invites arguing with the number
    // instead of with the gap.
    const assisted = state.vis && state.leg;
    const v = host.querySelector('[data-gates-verdict]');
    v.innerHTML = on === 4
      ? '<b>All four.</b> Unattended loops are defensible on work a machine can verify.'
      : assisted
        ? `<b>Assisted development, yes. Unattended, not yet.</b> Missing: ${GATE_LIST.filter((g) => !state[g.key]).map((g) => g.name.toLowerCase()).join(' and ')}.`
        : on === 0
          ? 'Nothing ticked yet. Start with visibility, because it is the cheapest and everything else is judged against it.'
          : `<b>Not ready for either yet.</b> Missing: ${GATE_LIST.filter((g) => !state[g.key]).map((g) => g.name.toLowerCase()).join(', ')}.`;
    host.querySelector('[data-gates]').toggleAttribute('data-all', on === 4);
  };

  host.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-gate-toggle]');
    if (!btn) return;
    const key = btn.closest('[data-gate]').dataset.gate;
    state[key] = !state[key];
    render();
  });
  render();
  host.__setGates = (n) => { GATE_LIST.forEach((g, i) => { state[g.key] = i < n; }); render(); };
  return true;
}

/* ============================================================================
   7 · THE TWO PATHS
   One epic, two systems, the same model doing the typing. The claim is not that
   the layered path is faster at any single stop. It is that the work moves from
   repair, which happens after the code exists and lands on a person, to
   specification, which happens before it and lands on a file. Same argument as
   "push work left" further down the note, made walkable.
   ========================================================================= */

// Five stops from an epic to a shipped change. `hand` is what a person has to do at that stop on
// each path: "spec" is work done before code exists, "repair" is work done after it. The split is
// illustrative and the figure says so; the claim is the direction it moves, not the count.
const STOPS = [
  { name: 'Slice the epic',   bare: { kind: 'spec',   note: 'cut by hand, inconsistently' },
                              layer:{ kind: 'skill',  note: 'a skill cuts them to one shape' } },
  { name: 'Write the ticket', bare: { kind: 'spec',   note: 'title and a paragraph of hope' },
                              layer:{ kind: 'skill',  note: 'acceptance criteria, edge cases' } },
  { name: 'Build it',         bare: { kind: 'pass',   note: 'pasted into an agent with no rules' },
                              layer:{ kind: 'pass',   note: 'reads the real ticket, plans first' } },
  { name: 'Check it',         bare: { kind: 'repair', note: 'a person finds it in review' },
                              layer:{ kind: 'skill',  note: 'the gate runs before the pull request' } },
  { name: 'Ship it',          bare: { kind: 'repair', note: 'cleaned up after merge' },
                              layer:{ kind: 'human',  note: 'one spot-check by a person' } },
];

const PATH_LABEL = { spec: 'by hand, up front', skill: 'a skill did it', pass: 'the model typed it', repair: 'repaired after the fact', human: 'a person approved it' };

export const TWOPATH = `<div class="path" data-path>
  <p class="path__title">One epic, five stops, the same model doing the typing</p>
  <ol class="path__stops" data-path-stops></ol>
  <p class="path__keys">
    <span class="path__spec"><b data-path-spec>0</b> stops a skill handled up front</span>
    <span class="path__repair"><b data-path-repair>2</b> repaired after the code existed</span>
  </p>
  <p class="live-fig__ctl path__ctl">
    <button class="btn" type="button" data-path-mode="bare" aria-pressed="true">No layer</button>
    <button class="btn" type="button" data-path-mode="layer" aria-pressed="false">With the layer</button>
  </p>
  <p class="path__punch" data-grade="grain" data-path-punch><b>Same epic. Same model.</b> The work moved from repair, which lands on a person, to specification, which lands on a file.</p>
</div>`;

export function mountTwoPath(host) {
  h(host, TWOPATH);
  const list = host.querySelector('[data-path-stops]');
  if (!list) return false;

  list.innerHTML = STOPS.map((s, i) => `<li class="path__stop" data-stop="${i}">
      <span class="path__mark" aria-hidden="true"></span>
      <span class="path__body"><b class="path__name">${s.name}</b><em class="path__note" data-stop-note></em></span>
      <span class="path__tag" data-stop-tag></span>
    </li>`).join('');

  const render = (mode) => {
    const root = host.querySelector('[data-path]');
    STOPS.forEach((s, i) => {
      const cell = s[mode];
      const li = list.querySelector(`[data-stop="${i}"]`);
      li.dataset.kind = cell.kind;
      li.querySelector('[data-stop-note]').textContent = cell.note;
      li.querySelector('[data-stop-tag]').textContent = PATH_LABEL[cell.kind];
    });
    const count = (k) => STOPS.filter((s) => s[mode].kind === k).length;
    host.querySelector('[data-path-spec]').textContent = count('skill');
    host.querySelector('[data-path-repair]').textContent = count('repair');
    root.toggleAttribute('data-layered', mode === 'layer');
    for (const btn of host.querySelectorAll('[data-path-mode]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.pathMode === mode));
    }
  };

  host.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-path-mode]');
    if (btn) render(btn.dataset.pathMode);
  });
  render('bare');

  // The deck walks it with the arrow key rather than a mouse, same seam as every other figure here.
  host.__setPath = (layered) => render(layered ? 'layer' : 'bare');
  return true;
}

/* ============================================================================
   8 · SIX FAILURES, ONE REPORT
   The failure-modes section's argument is not that six things can go wrong. It
   is that all six produce the same artifact: a report that reads as a pass. The
   figure is that claim as a motion — flip it and the marks stay identical while
   the sentences underneath turn out to have been describing six different
   disasters the whole time.
   ========================================================================= */

const FAILURES = [
  { name: 'The check',        said: 'passed, nothing found',        real: 'never ran, and exited zero saying so' },
  { name: 'The architecture', said: 'every layer verified',         real: 'the one leaf underneath was never probed' },
  { name: 'The query',        said: 'zero results found',           real: 'nobody asked whether it had looked' },
  { name: 'The rule',         said: 'verified as instructed',       real: 'the environment cannot verify that at all' },
  { name: 'The flag',         said: 'documented in the usage text', real: 'nothing implements it, nothing errors' },
  { name: 'The doc',          said: 'read this one first',          real: 'accurate when written, months ago' },
];

export const FAILREPORT = `<div class="fail" data-fail>
  <p class="fail__title">Six systems, six reports, one week</p>
  <ul class="fail__rows" data-fail-rows></ul>
  <p class="fail__keys">
    <span class="fail__pass"><b data-fail-pass>6</b> of 6 reported a pass</span>
    <span class="fail__real"><b data-fail-real>0</b> of 6 were actually fine</span>
  </p>
  <p class="live-fig__ctl fail__ctl">
    <button class="btn" type="button" data-fail-mode="said" aria-pressed="true">What the report said</button>
    <button class="btn" type="button" data-fail-mode="real" aria-pressed="false">What was true</button>
  </p>
  <p class="fail__punch" data-grade="grain" data-fail-punch><b>Six different failures. Six identical reports.</b> Not one of them could be caught by reading the thing it produced, which is why the list is failure modes rather than bugs.</p>
</div>`;

export function mountFailReport(host) {
  h(host, FAILREPORT);
  const rows = host.querySelector('[data-fail-rows]');
  if (!rows) return false;

  rows.innerHTML = FAILURES.map((f, i) => `<li class="fail__row" data-row="${i}">
      <span class="fail__mark" aria-hidden="true"></span>
      <span class="fail__name">${f.name}</span>
      <span class="fail__line" data-row-line></span>
    </li>`).join('');

  const render = (mode) => {
    const root = host.querySelector('[data-fail]');
    FAILURES.forEach((f, i) => {
      const row = rows.querySelector(`[data-row="${i}"]`);
      row.querySelector('[data-row-line]').textContent = mode === 'said' ? f.said : f.real;
    });
    root.toggleAttribute('data-real', mode === 'real');
    for (const btn of host.querySelectorAll('[data-fail-mode]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.failMode === mode));
    }
  };

  host.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fail-mode]');
    if (btn) render(btn.dataset.failMode);
  });
  render('said');
  host.__setFail = (real) => render(real ? 'real' : 'said');
  return true;
}

/* ============================================================================
   9 · THE COST OF WAITING
   "Where to start" ends on a claim worth testing rather than asserting: four of
   the five moves cost the same whenever you make them, and one is a door
   closing. The dial is honest arithmetic rather than an invented curve — delay
   the marker by N months and you have N months of changes nobody can ever
   attribute, because a marker cannot be backfilled onto work already merged.
   ========================================================================= */

const MOVES = [
  { name: 'Mark every agent-authored change', decays: true,
    same: 'an afternoon, whenever you do it',
    lost: (m) => `${m} month${m === 1 ? '' : 's'} of changes nobody can ever attribute` },
  { name: 'Publish ninety days of delivery history', decays: false,
    same: 'the same query, and the same afternoon' },
  { name: 'Make one repository legible', decays: false,
    same: 'the same day with a senior in the room' },
  { name: 'Extract two skills from the people who do the work', decays: false,
    same: 'the same shoulder-surfing, no harder later' },
  { name: 'Start the outcome log', decays: 'mild',
    same: 'free from the first run',
    lost: (m) => `the first ${m} month${m === 1 ? '' : 's'} of runs cannot be reconstructed` },
];

export const COSTWAIT = `<div class="wait" data-wait>
  <p class="wait__title">Five ways to start, and what waiting costs each one</p>
  <ul class="wait__rows" data-wait-rows></ul>
  <p class="live-fig__ctl wait__ctl">
    <label class="wait__lab" for="wait-dial">You start in</label>
    <input class="wait__dial" id="wait-dial" type="range" min="0" max="12" value="0" step="1" data-wait-dial>
    <output class="wait__out" data-wait-out>month 0</output>
  </p>
  <p class="wait__punch" data-grade="grain" data-wait-punch><b>Four of these wait perfectly well.</b> The marker is the one that cannot be backfilled, which is why it is the item to do this week even though it is the least interesting one on the list.</p>
</div>`;

export function mountCostWait(host) {
  h(host, COSTWAIT);
  const rows = host.querySelector('[data-wait-rows]');
  const dial = host.querySelector('[data-wait-dial]');
  if (!rows || !dial) return false;

  rows.innerHTML = MOVES.map((mv, i) => `<li class="wait__row" data-move="${i}"${mv.decays ? '' : ' data-flat'}>
      <span class="wait__bar" aria-hidden="true"><span></span></span>
      <span class="wait__body"><b class="wait__name">${mv.name}</b><em class="wait__cost" data-move-cost></em></span>
    </li>`).join('');

  const render = (month) => {
    MOVES.forEach((mv, i) => {
      const row = rows.querySelector(`[data-move="${i}"]`);
      const decaying = mv.decays && month > 0;
      row.toggleAttribute('data-losing', Boolean(decaying));
      // A flat move's bar never moves; the marker's fills with the months it can no longer see.
      const share = !mv.decays ? 0 : mv.decays === 'mild' ? (month / 12) * 0.45 : month / 12;
      row.querySelector('.wait__bar > span').style.width = `${share * 100}%`;
      row.querySelector('[data-move-cost]').textContent = decaying ? mv.lost(month) : mv.same;
    });
    host.querySelector('[data-wait-out]').textContent = month === 0 ? 'this week' : `month ${month}`;
    host.querySelector('[data-wait]').toggleAttribute('data-late', month > 0);
  };

  dial.addEventListener('input', () => render(Number(dial.value)));
  render(0);
  // __setStart, not __setMonth: the roadmap figure already owns that name and a reader skimming
  // talk-floor.js should not have to check which host it is looking at.
  host.__setStart = (n) => { dial.value = String(clamp(n, 0, 12)); render(Number(dial.value)); };
  return true;
}

/* ============================================================================
   10 · THE PROMOTION GATE
   Stage two is the shortest section in the note and the one it says programmes
   die at, because it is the stage with no artifact to show. Its actual claim is
   that promotion runs off a COUNT, agreed in advance and sized to blast radius,
   and that "it seems to be working well" is not a threshold. Drag the count and
   the three skills cross their bars at three different places.
   ========================================================================= */

// Illustrative bars, and the figure says so. The claim is that the number is agreed BEFORE the runs
// start and scales with what a wrong answer costs, not that a docs skill graduates at exactly ten.
const PROMOTABLE = [
  { name: 'Release notes', blast: 'a wrong one is embarrassing', need: 10 },
  { name: 'Review comments', blast: 'a wrong one wastes an engineer an hour', need: 40 },
  { name: 'Pull requests against production', blast: 'a wrong one is an incident', need: 120 },
];

export const PROMOTION = `<div class="promo" data-promo>
  <p class="promo__title">Scored runs behind a skill, and the bar each one has to clear</p>
  <ul class="promo__rows" data-promo-rows></ul>
  <p class="promo__keys"><span><b data-promo-ready>0</b> of 3 promotable</span></p>
  <p class="live-fig__ctl promo__ctl">
    <label class="promo__lab" for="promo-dial">Scored runs logged</label>
    <input class="promo__dial" id="promo-dial" type="range" min="0" max="140" value="0" step="1" data-promo-dial>
    <output class="promo__out" data-promo-out>0</output>
  </p>
  <p class="promo__punch" data-grade="grain" data-promo-punch><b>Same evidence. Three different bars.</b> The bar is set by what it costs when the skill is wrong, and it is agreed before the runs start, because a threshold picked afterwards is just the number you already have.</p>
</div>`;

export function mountPromotion(host) {
  h(host, PROMOTION);
  const rows = host.querySelector('[data-promo-rows]');
  const dial = host.querySelector('[data-promo-dial]');
  if (!rows || !dial) return false;

  const CEIL = 140;
  rows.innerHTML = PROMOTABLE.map((p, i) => `<li class="promo__row" data-promo-row="${i}">
      <span class="promo__body"><b class="promo__name">${p.name}</b><em class="promo__blast">${p.blast}</em></span>
      <span class="promo__track" aria-hidden="true">
        <span class="promo__fill"></span>
        <span class="promo__bar" style="left:${(p.need / CEIL) * 100}%"></span>
      </span>
      <span class="promo__state" data-promo-state></span>
    </li>`).join('');

  const render = (runs) => {
    let ready = 0;
    PROMOTABLE.forEach((p, i) => {
      const row = rows.querySelector(`[data-promo-row="${i}"]`);
      const ok = runs >= p.need;
      if (ok) ready += 1;
      row.toggleAttribute('data-ready', ok);
      row.querySelector('.promo__fill').style.width = `${Math.min(1, runs / CEIL) * 100}%`;
      row.querySelector('[data-promo-state]').textContent = ok ? 'promotable' : `${p.need - runs} to go`;
    });
    host.querySelector('[data-promo-ready]').textContent = String(ready);
    host.querySelector('[data-promo-out]').textContent = String(runs);
    host.querySelector('[data-promo]').toggleAttribute('data-any', ready > 0);
  };

  dial.addEventListener('input', () => render(Number(dial.value)));
  render(0);
  host.__setRuns = (n) => { dial.value = String(clamp(n, 0, CEIL)); render(Number(dial.value)); };
  return true;
}
