/* The quest book (plans/quest-map.md, "The lesson book is a quest book"; docs/mockups/quest-map/index.html, section 4).
   A modal over the map, drawn as an open book. The LEFT page is the note itself, fetched from its own page and left untouched. The RIGHT page is
   the Guide, a pixel wizard standing for the author, with the spoken transcript as dialogue. While a line plays, the phrase it is about lights up
   on the left page, and a rune glows in the margin when a concept is taught.

   There is no audio. The transcript is the voice: each line is timed from its words, the phrase it is about lights up on the left page, and
   the next line follows (plans/harbor-curriculum.md, "The voice").

   This is a classic script that loads after the map's own, so it reads the map's globals (QUESTS, PROG, REG, P, spr, persist, noteHref). Progress is the
   reader's own, kept in this browser, and the lesson book writes the same save the map reads. */
(function () {
  const RUNE_KEY = 'learn.runes.v1';
  const RUNES = ['0110110|1001001|1000001|0100010|0010100|0001000|0001000', '0001000|0011100|0101010|1001001|0001000|0001000|0001000', '1111111|1000001|1011101|1010101|1011101|1000001|1111111', '0100010|0100010|0111110|0000100|0001000|0010000|0100000', '1001001|0101010|0011100|1111111|0011100|0101010|1001001', '0011100|0100010|1000001|1000001|1000001|0100010|0011100', '1110000|0010000|0011100|0000100|0000111|0000001|0000001', '0001000|0001000|1111111|0001000|0001000|1111111|0001000'];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch (e) { return {}; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: progress is simply not kept */ } };
  /* One shape for both sides of a comparison: straight quotes, single spaces, no non-breaking spaces. */
  const squash = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/ /g, ' ').replace(/\s+/g, ' ');
  const h = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------- pixel art: the Guide and the runes, whole pixels like the rest of the map ---------- */
  function drawGuide(cv) {
    const c = (k, f) => (typeof P !== 'undefined' && P[k]) || f;
    const s = spr(); const robe = c('castle', '#6a5aa8'), robe2 = c('castle2', '#51438a'), out = c('outline', '#2b1d12');
    s.rect(-4, 3, 8, 8, robe); s.rect(-4, 3, 2, 8, robe2); s.rect(-3, -3, 6, 6, '#e8bf94'); s.rect(-3, 2, 6, 3, '#d9d3c4'); s.rect(-3, -4, 6, 2, robe); s.rect(-2, -8, 4, 4, robe);
    s.set(0, -9, c('amber', '#f5b83d')); s.set(-1, -6, c('glow', '#ffe08a')); s.set(-2, -1, '#2b1d12'); s.set(1, -1, '#2b1d12'); s.rect(-4, -2, 1, 4, out); s.rect(3, -2, 1, 4, out); s.rect(-4, -3, 8, 1, out);
    s.rect(-3, 11, 2, 1, out); s.rect(1, 11, 2, 1, out); s.rect(6, -2, 1, 13, c('trunk', '#7a4d2b')); s.set(6, -3, c('glow', '#ffe08a')); s.outline(out);
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, cv.width, cv.height); const sc = cv.width / 24;
    s.blit((x, y, col) => { ctx.fillStyle = col; ctx.fillRect(Math.round((x + 11) * sc), Math.round((y + 10) * sc), Math.ceil(sc), Math.ceil(sc)); }, 0, 0);
  }
  function drawRune(cv, i, col) {
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, cv.width, cv.height); const w = cv.width / 7, hh = cv.height / 7;
    RUNES[Math.abs(i) % 8].split('|').forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '1') { ctx.fillStyle = col; ctx.fillRect(Math.round(x * w), Math.round(y * hh), Math.ceil(w), Math.ceil(hh)); } }));
  }
  const runeIndex = (id) => [...id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 8;
  const inkColor = () => getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#2b2b2b';

  /* ---------- the note on the left page: found, kept as it is, and lit one quote at a time ---------- */
  const noteCache = {};
  async function loadNote(slug) {
    if (noteCache[slug]) return noteCache[slug];
    const q = QUESTS.find((x) => x.id === slug), base = q && !q.draft ? '/notes/' : '/drafts/';
    const html = await (await fetch(base + slug)).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const art = doc.querySelector('article.note');
    if (!art) throw new Error('no article');
    const box = h('div', 'bk__text');
    const title = art.querySelector('h1');
    if (title) box.append(h('h3', '', esc(title.textContent.trim())));
    let past = false;
    for (const el of art.children) {
      if (!past) { if (el.matches('aside.note-contents')) past = true; continue; }
      if (el.matches('.draft-flag, script, style, .note-progress, nav, footer')) continue;
      box.append(document.importNode(el, true));
    }
    box.querySelectorAll('a').forEach((a) => { a.target = '_blank'; a.rel = 'noopener'; });
    box.querySelectorAll('[id]').forEach((n) => { if (!/^H[23]$/.test(n.tagName)) n.removeAttribute('id'); });
    return (noteCache[slug] = box);
  }

  let marks = [], headingHl = null, figHl = null, root = null;
  function sectionNodes(id) {
    const box = ui.noteBody; if (!box) return [];
    const first = box.querySelector('h2[id]');
    if (id === 'intro') { const out = []; for (const c of box.children) { if (c === first) break; if (/^(P|UL|OL|BLOCKQUOTE)$/.test(c.tagName)) out.push(c); } return out; }
    const hd = box.querySelector('[id="' + CSS.escape(id) + '"]'); if (!hd) return [];
    const out = []; for (let s = hd.nextElementSibling; s && !/^H[12]$/.test(s.tagName); s = s.nextElementSibling) out.push(s); return out;
  }
  function clearMarks() {
    for (const m of marks) { const p = m.parentNode; if (!p) continue; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize(); }
    marks = []; if (headingHl) { headingHl.classList.remove('hl'); headingHl = null; }
    if (figHl) { figHl.classList.remove('hl-fig'); figHl.removeAttribute('aria-current'); figHl = null; }
    ui.noteBody?.querySelectorAll('canvas.margin-rune').forEach((c) => c.remove());
  }
  /* A figure is found by its accessible name: the aria-label of an inline SVG or of a figure element, the same name tools/lesson-data.ts checks. */
  function figureIn(sectionId, name) {
    const want = squash(name).toLowerCase(); if (!want) return null;
    for (const n of sectionNodes(sectionId)) for (const el of [n, ...n.querySelectorAll('svg[aria-label], figure[aria-label], [role="img"][aria-label]')]) {
      const label = el.getAttribute && el.getAttribute('aria-label'); if (label && squash(label).toLowerCase().includes(want)) return el.closest('figure') || el;
    }
    return null;
  }
  /* Lights a figure: an outline, scrolled into view, and aria-current for a screen reader. The motion is skipped under reduced motion. */
  function lightFigure(sectionId, name) {
    clearMarks(); const fig = figureIn(sectionId, name);
    if (!fig) { const hd = sectionId === 'intro' ? null : ui.noteBody.querySelector('[id="' + CSS.escape(sectionId) + '"]'); if (hd) { headingHl = hd; hd.classList.add('hl'); scrollNote(hd); } return false; }
    fig.classList.add('hl-fig'); fig.setAttribute('aria-current', 'true'); figHl = fig; scrollNote(fig); return true;
  }
  function scrollNote(target) { const sc = ui.note, top = target.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - sc.clientHeight * 0.3; sc.scrollTo({ top: Math.max(0, top), behavior: reduced() ? 'auto' : 'smooth' }); }
  /* Lights the quote inside its section. If the quote is gone the heading is lit instead, which is still addressable (plans/quest-lessons.md, rule 7). */
  function light(sectionId, quote, figure) {
    if (figure) return lightFigure(sectionId, figure);
    clearMarks();
    const nodes = sectionNodes(sectionId), want = squash(quote); let norm = ''; const map = [];
    for (const rootEl of nodes) {
      const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
      for (let t = w.nextNode(); t; t = w.nextNode()) {
        const text = t.nodeValue;
        for (let i = 0; i < text.length; i++) { let ch = text[i];
          if (/\s| /.test(ch)) { if (norm.endsWith(' ') || norm === '') continue; ch = ' '; } else if (/[‘’]/.test(ch)) ch = "'"; else if (/[“”]/.test(ch)) ch = '"';
          norm += ch; map.push([t, i]); }
      }
      if (!norm.endsWith(' ')) { norm += ' '; map.push(null); }
    }
    const at = norm.indexOf(want); let target = null;
    if (at >= 0) {
      const spans = new Map();
      for (let k = at; k < at + want.length; k++) { const m = map[k]; if (!m) continue; const [node, off] = m, r = spans.get(node); if (r) r[1] = off + 1; else spans.set(node, [off, off + 1]); }
      for (const [node, [a, b]] of [...spans].reverse()) { const range = document.createRange(); range.setStart(node, a); range.setEnd(node, b); const mk = document.createElement('mark'); mk.className = 'hl'; range.surroundContents(mk); marks.push(mk); }
      target = marks.at(-1);
    } else { const hd = sectionId === 'intro' ? null : ui.noteBody.querySelector('[id="' + CSS.escape(sectionId) + '"]'); if (hd) { headingHl = hd; hd.classList.add('hl'); target = hd; } }
    if (target) { const sc = ui.note, top = target.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - sc.clientHeight * 0.3; sc.scrollTo({ top: Math.max(0, top), behavior: reduced() ? 'auto' : 'smooth' }); }
    return at >= 0;
  }
  function marginRune(runeId) {
    const m = marks[0]; if (!m || !runeId) return; const p = m.closest('p,li,blockquote'); if (!p) return;
    p.style.position = 'relative'; const cv = h('canvas', 'margin-rune'); cv.width = 7; cv.height = 7; drawRune(cv, runeIndex(runeId), inkColor()); p.prepend(cv);
  }

  /* ---------- the pace: the transcript is the voice, so each line is timed from its words ---------- */
  let token = 0, timer = 0, typer = 0;
  const beatMs = (text) => Math.max(2200, text.split(/\s+/).length * 380 / S.speed);
  function speak(text, done) { const mine = ++token; clearTimeout(timer); timer = setTimeout(() => { if (mine === token) done(); }, beatMs(text)); }
  function stopVoice() { token++; clearTimeout(timer); clearInterval(typer); }

  /* ---------- the book ---------- */
  const S = { ended: false, lesson: null, stop: 0, beat: 0, playing: false, speed: 1, tab: 'book', solo: false, quest: null };
  const ui = {};
  const stopOf = () => S.lesson.stops[S.stop], beatOf = () => stopOf().beats[S.beat];
  /* A quest's stop j is its j-th stop. A lesson cut in two parts lists each stop's lesson and place on the quest (ls), so the second part counts on from the first. */
  const questOf = (i) => { const s = S.lesson.stops[i], qq = QUESTS.find((x) => x.id === s.note), k = qq && qq.ls ? qq.ls.findIndex((x) => x[0] === S.lesson.id && x[1] === i) : -1;
    return { id: s.note, local: k >= 0 ? k : S.lesson.stops.slice(0, i).filter((x) => x.note === s.note).length }; };
  const doneStop = (i) => { const q = questOf(i); return !!PROG[q.id]?.has(q.local); };

  function build() {
    root = h('div', 'bk'); root.hidden = true; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Quest book');
    root.innerHTML = `<div class="bk__shade"></div><div class="bk__sheet tome">
      <div class="bk__bar"><div class="bk__crumb"></div><div class="bk__right"><div class="tb bk__tabs" role="tablist"><span data-tab="book" data-on role="tab" tabindex="0">Book</span><span data-tab="log" role="tab" tabindex="0">Log</span><span data-tab="runes" role="tab" tabindex="0">Runes</span><span data-tab="pack" role="tab" tabindex="0">Pack</span></div><button class="bk__x" aria-label="Close the book">\u00d7</button></div><div class="bk__pg"><button data-page="note">Note</button><button data-page="guide">Guide</button></div></div>
      <div class="leaf bk__leafnote"><div class="bk__note"></div></div>
      <div class="leaf bk__leafguide"><div class="bk__guide"></div><div class="bk__alt" hidden></div>
        <div class="controls bk__ctl"><div class="bk__prog"><div class="ribbonbar" aria-hidden="true"><i></i><u></u></div><div class="stops"><span class="bk__dots"></span><span class="bk__time"></span></div></div>
          <div class="row"><div><button data-do="prevstop" aria-label="Previous chapter" title="Previous chapter">\u23ee</button> <button data-do="prev" aria-label="Previous line" title="Previous line">\u25c0</button> <button data-do="play" class="primary" aria-label="Play">\u25b6 Play</button> <button data-do="replay" aria-label="Replay this chapter" hidden>\u21bb Replay</button> <button data-do="next" aria-label="Next line" title="Next line">\u25b6\u25b6</button> <button data-do="nextstop" aria-label="Next chapter" title="Next chapter">\u23ed</button></div>
            <div><button data-do="speed">1x</button> <button data-do="rest">Save and close</button></div></div>
          </div></div>
      <div class="toast bk__toast" hidden></div></div>`;
    document.body.append(root);
    ['note', 'guide'].forEach((k) => (ui[k] = root.querySelector('.bk__' + k)));
    ui.crumb = root.querySelector('.bk__crumb'); ui.alt = root.querySelector('.bk__alt'); ui.sheet = root.querySelector('.bk__sheet'); ui.ctl = root.querySelector('.bk__ctl'); ui.toast = root.querySelector('.bk__toast');
    ui.fill = root.querySelector('.ribbonbar i'); ui.flag = root.querySelector('.ribbonbar u'); ui.dots = root.querySelector('.bk__dots'); ui.time = root.querySelector('.bk__time'); ui.playBtn = root.querySelector('[data-do="play"]'); ui.replayBtn = root.querySelector('[data-do="replay"]');
    root.querySelector('.bk__x').addEventListener('click', close); root.querySelector('.bk__shade').addEventListener('click', close);
    root.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    root.querySelector('.bk__tabs').addEventListener('click', (e) => { const t = e.target.closest('[data-tab]'); if (t) setTab(t.dataset.tab); });
    root.querySelector('.bk__tabs').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { const t = e.target.closest('[data-tab]'); if (t) { e.preventDefault(); setTab(t.dataset.tab); } } });
    root.querySelector('.bk__pg').addEventListener('click', (e) => { const b = e.target.closest('[data-page]'); if (b) root.dataset.page = b.dataset.page; });
    root.querySelector('.bk__ctl').addEventListener('click', (e) => { const b = e.target.closest('[data-do]'); if (!b) return; const a = b.dataset.do;
      if (a === 'replay') { resetEnd(); S.beat = 0; showBeat(); toggle(); } else if (a === 'play') toggle(); else if (a === 'next') step(1); else if (a === 'prev') step(-1); else if (a === 'nextstop') gotoStop(S.stop + 1); else if (a === 'prevstop') gotoStop(S.stop - 1);
      else if (a === 'speed') { const sp = [1, 1.15, 1.3, 0.9]; S.speed = sp[(sp.indexOf(S.speed) + 1) % sp.length]; b.textContent = S.speed + 'x'; if (S.playing) { stopVoice(); say(); } }
      else if (a === 'rest') close(true); });
    root.dataset.page = 'note';
  }

  function setTab(t) {
    S.tab = t; root.querySelectorAll('[data-tab]').forEach((x) => x.toggleAttribute('data-on', x.dataset.tab === t));
    const book = t === 'book'; root.classList.toggle('bk--alt', !book); ui.alt.hidden = book; ui.ctl.hidden = S.solo; if (!book) renderAlt(t);
  }
  function renderAlt(t) {
    const L = S.lesson; if (!L) { ui.alt.innerHTML = ''; return; }
    const have = read(RUNE_KEY);
    if (t === 'log') ui.alt.innerHTML = '<div class="mini"><h3>Log · your place in this quest</h3>' + L.stops.map((s, i) => `<div class="obj" data-go="${i}" style="cursor:pointer"><i ${doneStop(i) ? 'data-d' : ''}></i><div>Stop ${i + 1} · ${esc(s.title)}<small>${doneStop(i) ? 'done' : (i === S.stop ? 'in progress' : 'open')} · ${esc(s.note)}</small></div></div>`).join('') + '</div>';
    else if (t === 'runes') { ui.alt.innerHTML = '<div class="mini"><h3>Runes · ideas you have learned</h3><div class="runes"></div><small>A rune is one idea taught in one stop. It is cosmetic and self-reported.</small></div>';
      const grid = ui.alt.querySelector('.runes'); L.stops.forEach((s) => s.runes.forEach((r) => { const got = have[L.id + ':' + r.id]; const d = h('div', 'rn' + (got ? '' : ' off'), `<canvas width="7" height="7"></canvas><div>${esc(r.id.replace(/-/g, ' '))}<small>${got ? esc(r.quote) : 'not learned yet'}</small></div>`); drawRune(d.querySelector('canvas'), runeIndex(r.id), inkColor()); grid.append(d); })); }
    else if (t === 'pack') ui.alt.innerHTML = '<div class="mini"><h3>Pack · where to read more</h3>' + (L.external ? `<div class="pack"><div></div><div><a href="${esc(L.external)}" target="_blank" rel="noopener">Claude Academy</a><small>external · opens in a new tab · do these first</small></div></div>` : '') + [...new Set(L.stops.map((s) => s.note))].map((n) => { const q = QUESTS.find((x) => x.id === n); return `<div class="pack"><div></div><div><a href="${noteHref(q || { id: n })}" target="_blank" rel="noopener">${esc(q ? q.title : n)}</a><small>note · ${q && q.draft ? 'draft' : 'published'}</small></div></div>`; }).join('') + '</div>';
    ui.alt.querySelectorAll('[data-go]').forEach((el) => el.addEventListener('click', () => { setTab('book'); gotoStop(+el.dataset.go); }));
  }

  function toast(msg) { ui.toast.textContent = msg; ui.toast.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (ui.toast.hidden = true), 2600); }

  function say() {
    const b = beatOf(); typeOut(b.text, beatMs(b.text));
    speak(b.text, () => { if (!S.playing) return; if (S.beat >= stopOf().beats.length - 1) { endStop(); return; } S.beat++; showBeat(false); say(); });
  }
  function typeOut(text, ms) {
    clearInterval(typer); const el = ui.guide.querySelector('.say'); if (!el) return;
    if (reduced() || !S.playing) { el.innerHTML = esc(text) + '<span class="caret">▌</span>'; return; }
    let n = 0; const total = text.length, tick = Math.max(16, ms / total * 0.8);
    typer = setInterval(() => { n = Math.min(total, n + Math.ceil(16 / tick)); el.innerHTML = esc(text.slice(0, n)) + '<span class="caret">▌</span>'; if (n >= total) clearInterval(typer); }, 16);
  }
  function markRunes(b) {
    const have = read(RUNE_KEY); const s = stopOf();
    for (const r of s.runes) if (r.section === b.section && b.quote && squash(b.quote).includes(squash(r.quote).slice(0, 24))) {
      marginRune(r.id); const key = S.lesson.id + ':' + r.id;
      ui.guide.querySelector('.rune-card')?.remove(); const card = h('div', 'rune-card', `<canvas width="7" height="7"></canvas><div><strong>Rune learned</strong><br>${esc(r.id.replace(/-/g, ' '))}<small>${have[key] ? 'already in your runes' : '+25 XP · added to your runes'}</small></div>`);
      drawRune(card.querySelector('canvas'), runeIndex(r.id), inkColor()); ui.guide.querySelector('.bk__after').before(card);
      if (!have[key]) { have[key] = 1; write(RUNE_KEY, have); toast('+25 XP · Rune learned: ' + r.id.replace(/-/g, ' ')); }
    }
  }

  function showBeat() {
    const s = stopOf(), b = beatOf(); light(b.section, b.quote, b.figure); ui.guide.querySelector('.rune-card')?.remove(); markRunes(b);
    const el = ui.guide.querySelector('.say'); if (el && !S.playing) el.innerHTML = esc(b.text) + '<span class="caret">▌</span>';
    const hist = ui.guide.querySelector('.hist'); hist.innerHTML = s.beats.slice(Math.max(0, S.beat - 2), S.beat).map((x) => `<p class="fade">${esc(x.text)}</p>`).join('');
    const total = s.beats.length, pct = Math.round((S.beat + 1) / total * 100); ui.fill.style.width = pct + '%'; ui.flag.style.left = 'calc(' + pct + '% - ' + Math.round(pct / 10) + 'px)';
    ui.time.textContent = '· line ' + (S.beat + 1) + ' of ' + total; ui.playBtn.textContent = S.playing ? '❚❚ Pause' : '▶ Play';
  }

  function renderStop() {
    const s = stopOf(), q = questOf(S.stop), qq = QUESTS.find((x) => x.id === q.id), r = qq ? REG[qq.region - 1] : null;
    ui.crumb.textContent = (r ? r.name + ' · ' : '') + (qq ? 'Quest ' + qq.order + ' · ' : '') + 'Stop ' + (S.stop + 1) + ' of ' + S.lesson.stops.length + ' · ' + s.title;
    ui.guide.innerHTML = `<h4>Chapter ${S.stop + 1} · The Guide speaks</h4><div class="dlg"><canvas width="24" height="24"></canvas><div><div class="plate">Tjakoen, the Guide</div><div class="say"></div></div><span class="adv">▼</span></div><div class="hist"></div>
      <div class="bk__after"><h4>In plain words</h4><ul>${s.digest.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      <div class="trial"><h4>Trial</h4><span>${esc(s.trial)}</span><label><input type="checkbox" ${doneStop(S.stop) ? 'checked' : ''}> Mark trial done · +100 XP</label></div></div>`;
    drawGuide(ui.guide.querySelector('canvas'));
    ui.guide.querySelector('.trial input').addEventListener('change', (e) => { const set = PROG[q.id]; if (!set) return; if (e.target.checked) { set.add(q.local); toast('+100 XP · Trial done'); } else set.delete(q.local); persist(); renderDots(); });
    renderDots(); showBeat(); if (S.tab !== 'book') renderAlt(S.tab);
  }
  function renderDots() { ui.dots.innerHTML = S.lesson.stops.map((_, i) => `<i ${doneStop(i) ? 'data-d' : ''} ${i === S.stop ? 'data-now' : ''}></i>`).join(''); }

  async function mountNote(slug) {
    ui.note.innerHTML = '<p class="sub">Opening the note…</p>';
    try { const box = (await loadNote(slug)).cloneNode(true); ui.note.replaceChildren(box); ui.noteBody = box; ui.note.scrollTop = 0; }
    catch (e) { ui.noteBody = null; ui.note.innerHTML = `<p>The note could not be opened here. <a href="${noteHref(QUESTS.find((x) => x.id === slug) || { id: slug })}" target="_blank" rel="noopener">Open it on its own.</a></p>`; }
  }
  async function gotoStop(i) {
    if (!S.lesson || i < 0 || i >= S.lesson.stops.length) return;
    stopVoice(); S.playing = false; resetEnd(); const prev = S.lesson.stops[S.stop]?.note, next = S.lesson.stops[i].note; S.stop = i; S.beat = 0;
    if (prev !== next || !ui.noteBody) await mountNote(next);
    renderStop(); if (S.playing) say();
  }
  function step(d) {
    stopVoice(); const s = stopOf(); if (S.ended && d < 0) resetEnd();
    if (d > 0 && S.beat >= s.beats.length - 1) { endStop(); return; }
    if (d < 0 && S.beat === 0) { if (S.stop > 0) gotoStop(S.stop - 1); return; }
    S.beat += d; showBeat(); if (S.playing) say();
  }
  /* The end of a chapter: the bar is full, so the main button becomes the way on. */
  const lastStop = () => S.stop === S.lesson.stops.length - 1;
  function endStop() {
    stopVoice(); S.playing = false; S.ended = true; clearMarks();
    ui.playBtn.textContent = lastStop() ? '\u26fa Finish and rest' : 'Next chapter \u25b6'; ui.playBtn.classList.add('is-next'); ui.replayBtn.hidden = false;
    const el = ui.guide.querySelector('.say'); if (el) el.innerHTML = esc(lastStop() ? "That's the last chapter. Tick your trial when you have done it, then press Save and close." : "That's the chapter. Tick your trial when you have done it, then go on to the next chapter.") + '<span class="caret">▌</span>';
    ui.fill.style.width = '100%'; ui.flag.style.left = 'calc(100% - 10px)';
  }
  function resetEnd() { S.ended = false; ui.playBtn.classList.remove('is-next'); ui.replayBtn.hidden = true; }
  function toggle() {
    if (S.ended) { if (lastStop()) { close(true); return; } resetEnd(); gotoStop(S.stop + 1).then(() => { S.playing = true; ui.playBtn.textContent = '\u275a\u275a Pause'; say(); }); return; }
    if (S.playing) { S.playing = false; stopVoice(); ui.playBtn.textContent = '▶ Play'; typeOut(beatOf().text, 0); return; }
    S.playing = true; ui.playBtn.textContent = '❚❚ Pause'; say();
  }

  /* ---------- open and close ---------- */
  let opener = null;
  async function open(opts) {
    if (!root) build(); opener = document.activeElement; root.hidden = false; document.body.style.overflow = 'hidden';
    S.solo = !!opts.solo; S.ended = false; S.tab = 'book'; root.classList.toggle('bk--solo', S.solo); setTab('book'); S.playing = false; S.speed = 1; root.querySelector('[data-do="speed"]').textContent = '1x';
    if (S.solo) {
      S.lesson = null; ui.noteBody = null; ui.guide.innerHTML = ''; ui.crumb.textContent = (QUESTS.find((x) => x.id === opts.quest) || {}).title || ''; await mountNote(opts.quest); root.querySelector('.bk__x').focus(); return;
    }
    try { S.lesson = await (await fetch('lessons/' + encodeURIComponent(opts.lesson) + '.json')).json(); } catch (e) { toast('This lesson could not be loaded.'); return; }
    S.stop = Math.min(opts.stop || 0, S.lesson.stops.length - 1); S.beat = 0; ui.noteBody = null;
    await mountNote(S.lesson.stops[S.stop].note); renderStop(); ui.playBtn.focus();
  }
  function close(rest) {
    if (!root || root.hidden) return; stopVoice(); S.playing = false; clearMarks(); root.hidden = true; document.body.style.overflow = ''; persist();
    if (typeof onBookClosed === 'function') onBookClosed(rest === true); opener?.focus?.();
  }
  window.Book = { open, close, drawRune, runeIndex };
})();
