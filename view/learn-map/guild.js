/* The adventurer's guild card (plans/quest-map.md, docs/mockups/quest-map/index.html, sections 3 and 8).
   A small HUD at the top right shows the adventurer, the level and the XP bar. It opens the guild card: the character, the XP, the region badges,
   and the save and load controls. A level-up banner announces a new level. A badge page shows one finished region, with the runes collected there
   as its skills and a pointer to the reader's own roadmap page as the evidence.

   Everything is the reader's own and stays in this browser. A save is a small file or a short code, and a badge link carries the same code after the
   # so it never reaches a server. It is self-reported: it shows what the holder says they finished and is not a signed credential.

   This is a classic script that loads after the map's own and the book's, so it reads their globals (QUESTS, REG, PROG, persist, refreshProgress,
   placeYou, renderPanel, draw). The book writes the progress and rune keys that XP is counted from. */
(function () {
  const GUILD_KEY = 'learn.guild.v1', PROG_KEY = 'learn.progress.v1', RUNE_KEY = 'learn.runes.v1';
  const XP_TRIAL = 100, XP_RUNE = 25;
  const LEVELS = [{ n: 1, name: 'Newcomer', at: 0 }, { n: 2, name: 'Apprentice', at: 200 }, { n: 3, name: 'Journeyman', at: 600 }, { n: 4, name: 'Adept', at: 1200 }, { n: 5, name: 'Master', at: 2400 }];
  const HUES = ['#4e9a52', '#2f7d33', '#8a8a8a', '#b8442f', '#6b5ca5', '#d79a2b'];
  const OUT = '#2b1d12', GLOW = '#fff2b0';

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage may be blocked */ } };
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  /* ---------- the guild's own state: a name, a seed for the face, a pointer to the evidence ---------- */
  const randSeed = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  let G = read(GUILD_KEY);
  if (!G.seed) { G.seed = randSeed(); G.since = new Date().toISOString().slice(0, 7); write(GUILD_KEY, G); }
  const cleanName = (s) => String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24);
  const cleanUrl = (s) => { s = String(s || '').trim().slice(0, 300); try { const u = new URL(s); return /^https?:$/.test(u.protocol) ? u.href : ''; } catch (e) { return ''; } };

  /* ---------- counting: XP is the trials ticked and the runes collected, nothing else ---------- */
  function stateNow() {
    const progress = {}; QUESTS.forEach((q) => { if (PROG[q.id] && PROG[q.id].size) progress[q.id] = [...PROG[q.id]].sort((a, b) => a - b); });
    return { progress, runes: read(RUNE_KEY) };
  }
  const xpOf = (st) => Object.values(st.progress).reduce((n, a) => n + a.length, 0) * XP_TRIAL + Object.keys(st.runes).length * XP_RUNE;
  const levelOf = (xp) => LEVELS.reduce((cur, l) => (xp >= l.at ? l : cur), LEVELS[0]);
  const nextOf = (lv) => LEVELS.find((l) => l.n === lv.n + 1) || null;
  const regionQuests = (n) => QUESTS.filter((q) => q.region === n);
  const regionDone = (n, st) => { const qs = regionQuests(n); return qs.length > 0 && qs.every((q) => (st.progress[q.id] || []).length >= q.stops.length); };
  const badgeRegions = () => REG.filter((r) => regionQuests(r.n).length);

  /* ---------- the pixels: a character drawn from a seed, and a medallion drawn from a hue ---------- */
  function rng(str) { let a = 0; for (let i = 0; i < str.length; i++) a = (Math.imul(a, 31) + str.charCodeAt(i)) | 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function drawHero(cv, seed) {
    const R = rng(String(seed)), pick = (a) => a[Math.floor(R() * a.length)], ctx = cv.getContext('2d'), s = cv.width / 24;
    const skin = pick(['#f1c8a0', '#d9a273', '#a87048', '#6f4a2f']), hair = pick(['#2b1d12', '#7a4a1e', '#d79a2b', '#b8442f', '#3a5aa5']), cloak = pick(['#6b5ca5', '#b8442f', '#2f7d33', '#2f6fa5']), hat = R() < 0.5;
    const r = (x, y, w, hh, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round((x + 12) * s), Math.round((y + 10) * s), Math.ceil(w * s), Math.ceil(hh * s)); };
    ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, cv.width, cv.height);
    r(-4, 2, 8, 9, cloak); r(-3, -3, 6, 5, skin); r(-3, -4, 6, 2, hair);
    if (hat) { r(-5, -5, 10, 1, cloak); r(-3, -8, 6, 3, cloak); r(0, -9, 1, 1, '#d79a2b'); } else { r(-4, -3, 1, 4, hair); r(3, -3, 1, 4, hair); }
    r(-2, -1, 1, 1, OUT); r(1, -1, 1, 1, OUT); r(-1, 1, 2, 1, '#a34a3a'); r(-6, 3, 2, 6, cloak); r(4, 3, 2, 6, cloak); r(-3, 11, 2, 2, OUT); r(1, 11, 2, 2, OUT);
    r(7, 0, 1, 11, '#d79a2b'); r(7, -1, 1, 1, GLOW);
  }
  function drawMedal(cv, hue, on) {
    const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; const s = cv.width / 16; ctx.clearRect(0, 0, cv.width, cv.height);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x - 7.5, y - 7.5); let c = null;
      if (d < 7.6) c = d >= 6 ? OUT : (on ? hue : '#9a948a');
      if (on && d < 6 && (Math.abs(x - 7.5) + Math.abs(y - 7.5) < 3.2)) c = GLOW;
      if (c) { ctx.fillStyle = c; ctx.fillRect(Math.floor(x * s), Math.floor(y * s), Math.ceil(s), Math.ceil(s)); }
    }
  }

  /* ---------- a save is a file or a code, and loading one is checked field by field ---------- */
  const b64 = (str) => btoa(String.fromCharCode(...new TextEncoder().encode(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const unb64 = (c) => new TextDecoder().decode(Uint8Array.from(atob(c.replace(/-/g, '+').replace(/_/g, '/')), (ch) => ch.charCodeAt(0)));
  function bundle() { const st = stateNow(); return { v: 1, name: G.name || '', seed: G.seed, since: G.since || '', evidence: G.evidence || '', progress: st.progress, runes: st.runes }; }
  function parseBundle(text) {
    let o; try { o = JSON.parse(text); } catch (e) { return null; }
    if (!o || o.v !== 1 || typeof o.progress !== 'object' || typeof o.runes !== 'object') return null;
    const progress = {}; QUESTS.forEach((q) => { const a = o.progress[q.id]; if (Array.isArray(a)) { const ok = [...new Set(a.filter((i) => Number.isInteger(i) && i >= 0 && i < q.stops.length))]; if (ok.length) progress[q.id] = ok.sort((x, y) => x - y); } });
    const runes = {}; Object.keys(o.runes).slice(0, 200).forEach((k) => { if (/^[a-z0-9-]{1,80}:[a-z0-9-]{1,80}$/.test(k)) runes[k] = 1; });
    const seed = /^[A-Z0-9]{3,12}$/.test(String(o.seed || '')) ? o.seed : randSeed(), since = /^\d{4}-\d{2}$/.test(String(o.since || '')) ? o.since : '';
    return { v: 1, name: cleanName(o.name), seed, since, evidence: cleanUrl(o.evidence), progress, runes };
  }
  const codeOf = (bd) => b64(JSON.stringify(bd));
  const bundleFromCode = (code) => { try { return parseBundle(unb64(String(code).trim())); } catch (e) { return null; } };
  function applyBundle(bd) {
    QUESTS.forEach((q) => { PROG[q.id] = new Set(bd.progress[q.id] || []); });
    persist(); write(RUNE_KEY, bd.runes); G = { name: bd.name, seed: bd.seed, since: bd.since, evidence: bd.evidence, lv: levelOf(xpOf(bd)).n }; write(GUILD_KEY, G);
    refreshProgress(); placeYou(); renderPanel(); draw(); refreshHud();
  }
  const download = (name, text) => { const a = h('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };

  /* ---------- the HUD ---------- */
  const css = h('style'); css.textContent = `
.gh { position:absolute; right:52px; top:0; display:flex; align-items:center; gap:.5rem; height:42px; padding:0 .6rem 0 .35rem; background:var(--q-panel); color:var(--q-ink); border:3px solid var(--q-ink); box-shadow:3px 3px 0 var(--q-ink); cursor:pointer; font:700 .7rem ui-monospace,monospace; }
.gh canvas { width:30px; height:30px; image-rendering:pixelated; background:var(--q-ground2); border:2px solid var(--q-ink); }
.gh .gh__t { display:grid; gap:3px; min-width:84px; text-align:left; } .gh .xpbar { height:8px; }
.xpbar { height:12px; border:2px solid var(--q-ink); background:var(--q-paper); } .xpbar i { display:block; height:100%; width:0; background:repeating-linear-gradient(90deg,var(--q-accent) 0 6px,color-mix(in srgb,var(--q-accent) 65%,var(--q-panel)) 6px 8px); }
.gc { position:fixed; inset:0; z-index:60; display:grid; place-items:center; padding:12px; } .gc[hidden] { display:none; }
.gc__shade { position:absolute; inset:0; background:rgba(20,12,6,.62); }
.gc__box { position:relative; width:min(560px,100%); max-height:92vh; overflow:auto; background:var(--q-paper); color:var(--q-ink); border:3px solid var(--q-ink); box-shadow:6px 6px 0 rgba(0,0,0,.4); padding:1rem; display:grid; gap:.8rem; font:.82rem/1.5 Georgia,serif; }
.gc__box h3 { margin:0; font-size:1.15rem; } .gc__box small { color:var(--q-muted); font:.68rem ui-monospace,monospace; }
.gc__head { display:flex; gap:.9rem; align-items:center; } .gc__head canvas { width:84px; height:84px; image-rendering:pixelated; border:3px solid var(--q-ink); background:var(--q-ground2); flex:0 0 auto; }
.gc__x { position:absolute; right:.6rem; top:.5rem; font:700 1rem ui-monospace,monospace; border:2px solid var(--q-ink); background:var(--q-panel); color:var(--q-ink); cursor:pointer; padding:0 .45rem; }
.gc__row { display:flex; gap:.4rem; flex-wrap:wrap; align-items:center; }
.gc button, .gc input, .gc textarea { font:.72rem ui-monospace,monospace; color:var(--q-ink); border:2px solid var(--q-ink); background:var(--q-panel); padding:.25rem .5rem; } .gc button { cursor:pointer; } .gc button.primary { background:var(--q-accent); color:var(--q-accent-ink); }
.gc input[type=text], .gc input[type=url], .gc textarea { width:100%; box-sizing:border-box; } .gc__row input[type=text], .gc__row input[type=url] { flex:1 1 0; width:auto; min-width:0; }
.gc label { display:grid; gap:.2rem; font:700 .66rem ui-monospace,monospace; letter-spacing:.06em; text-transform:uppercase; color:var(--q-roof); }
.gc__badges { display:grid; grid-template-columns:repeat(auto-fill,minmax(64px,1fr)); gap:.5rem; } .gc__badges button { display:grid; gap:.2rem; justify-items:center; padding:.3rem; font-size:.62rem; text-align:center; }
.gc__badges canvas { width:44px; height:44px; image-rendering:pixelated; } .gc__badges .off { opacity:.55; }
.gc__note { border:2px dashed var(--q-muted); padding:.4rem .6rem; font-size:.78rem; }
.gc__skills { display:flex; gap:.35rem; flex-wrap:wrap; } .gc__skills span { border:2px solid var(--q-line); padding:.1rem .5rem; font:.7rem ui-monospace,monospace; }
.gc__badge { display:flex; gap:1rem; align-items:flex-start; } .gc__badge canvas { width:112px; height:112px; image-rendering:pixelated; border:3px solid var(--q-ink); background:var(--q-paper); flex:0 0 auto; }
.lvl { position:fixed; left:50%; top:14px; transform:translateX(-50%); z-index:80; display:flex; gap:.7rem; align-items:center; padding:.55rem 1.1rem; background:var(--q-accent); color:var(--q-accent-ink); border:3px solid var(--q-ink); box-shadow:4px 4px 0 var(--q-ink); font:700 .85rem ui-monospace,monospace; letter-spacing:.06em; text-transform:uppercase; animation:lvlpop .5s steps(5) 1; }
.lvl[hidden] { display:none; } @keyframes lvlpop { from { transform:translate(-50%,-40px); } to { transform:translate(-50%,0); } }
@media (prefers-reduced-motion: reduce) { .lvl { animation:none; } }
@media (max-width:860px) { .gh { right:auto; left:50px; } }
`;
  document.head.append(css);

  const hud = h('button', 'gh', '<canvas width="24" height="24" aria-hidden="true"></canvas><span class="gh__t"><span class="gh__lv"></span><span class="xpbar"><i></i></span></span>');
  hud.type = 'button'; hud.setAttribute('aria-haspopup', 'dialog'); hud.title = 'Your guild card';
  const banner = h('div', 'lvl'); banner.hidden = true; banner.setAttribute('role', 'status'); banner.setAttribute('aria-live', 'polite');
  (document.querySelector('.topright') || document.body).prepend(hud); document.body.append(banner);

  function refreshHud() {
    const xp = xpOf(stateNow()), lv = levelOf(xp), nx = nextOf(lv), pct = nx ? Math.round((xp - lv.at) / (nx.at - lv.at) * 100) : 100;
    hud.querySelector('.gh__lv').textContent = 'Lv ' + lv.n + ' · ' + lv.name; hud.querySelector('.xpbar i').style.width = pct + '%';
    hud.setAttribute('aria-label', 'Lv ' + lv.n + ' \u00b7 ' + lv.name + ', ' + xp + ' XP. Open the guild card of ' + (G.name || 'your adventurer'));
    drawHero(hud.querySelector('canvas'), G.name || G.seed);
    return { xp, lv };
  }

  /* ---------- the level-up banner ---------- */
  let bannerT = 0;
  function levelUp(from, to) {
    banner.innerHTML = '<span aria-hidden="true">★</span>Level up · ' + esc(from.name) + ' → ' + esc(to.name) + '<span aria-hidden="true">★</span>';
    banner.hidden = false; clearTimeout(bannerT); bannerT = setTimeout(() => { banner.hidden = true; }, reduced() ? 6000 : 4200);
  }
  function tick() {
    if (document.hidden) return;
    const { xp, lv } = refreshHud(); const had = G.lv || lv.n;
    if (lv.n > had) levelUp(LEVELS[had - 1] || LEVELS[0], lv);
    if (lv.n !== G.lv && (lv.n > (G.lv || 0))) { G.lv = lv.n; write(GUILD_KEY, G); }
    return xp;
  }

  /* ---------- dialogs ---------- */
  let dlg = null, opener = null;
  function openDialog(inner, label) {
    closeDialog(); opener = document.activeElement; dlg = h('div', 'gc'); dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', label);
    dlg.innerHTML = '<div class="gc__shade"></div><div class="gc__box"><button class="gc__x" aria-label="Close">×</button>' + inner + '</div>';
    dlg.querySelector('.gc__shade').addEventListener('click', closeDialog); dlg.querySelector('.gc__x').addEventListener('click', closeDialog);
    document.body.append(dlg); dlg.querySelector('.gc__x').focus(); return dlg;
  }
  function closeDialog() { if (!dlg) return; dlg.remove(); dlg = null; if (opener && opener.focus) opener.focus(); opener = null; }
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && dlg) { e.stopPropagation(); closeDialog(); } }, true);

  const medalCanvas = (n, on) => { const c = h('canvas'); c.width = c.height = 64; drawMedal(c, HUES[(n - 1) % HUES.length], on); return c; };

  function badgeBody(bd, r, foreign) {
    const st = { progress: bd.progress, runes: bd.runes }, qs = regionQuests(r.n), stops = qs.reduce((n, q) => n + q.stops.length, 0);
    const done = qs.reduce((n, q) => n + (st.progress[q.id] || []).length, 0), earned = regionDone(r.n, st), lessons = new Set(qs.map((q) => q.lesson).filter(Boolean));
    const skills = Object.keys(st.runes).filter((k) => lessons.has(k.split(':')[0])).map((k) => esc(k.split(':')[1].replace(/-/g, ' ')));
    const who = bd.name ? esc(bd.name) : 'This adventurer';
    return `<div class="gc__badge"><canvas width="64" height="64" aria-hidden="true"></canvas><div style="display:grid;gap:.5rem">
      <h3>Walks the ${esc(r.name)}</h3><small>${earned ? 'Earned' : 'Not earned yet'} · ${who}</small>
      <p style="margin:0"><strong>Criteria.</strong> Finish every stop and its trial in the ${qs.length} ${esc(r.name)} quest${qs.length === 1 ? '' : 's'}: ${stops} stops. ${done} of ${stops} done.</p>
      <div><strong>Skills shown.</strong> The runes collected on the way.</div>
      <div class="gc__skills">${skills.length ? skills.map((s) => '<span>' + s + '</span>').join('') : '<span>none collected yet</span>'}</div>
      <div><strong>Evidence.</strong> ${bd.evidence ? '<a href="' + esc(bd.evidence) + '" target="_blank" rel="noopener noreferrer">' + esc(bd.evidence) + '</a>' : (foreign ? 'The holder has not linked a roadmap page.' : 'Add the link to your roadmap page on your guild card. Claude Academy badges belong on that page too.')}</div>
      <div class="gc__note">Self-reported. This page rebuilds from the holder's save link and is not a signed credential. The evidence is the roadmap page, so judge the work there.</div>
      ${foreign ? '' : '<div class="gc__row"><button class="primary" data-do="copylink">Copy badge link</button></div>'}</div></div>`;
  }
  function openBadge(r, bd, foreign) {
    const d = openDialog(badgeBody(bd, r, foreign), 'Badge: Walks the ' + r.name);
    drawMedal(d.querySelector('.gc__badge canvas'), HUES[(r.n - 1) % HUES.length], regionDone(r.n, { progress: bd.progress, runes: bd.runes }));
    d.querySelector('[data-do=copylink]')?.addEventListener('click', (e) => { copy(location.origin + '/learn#badge=' + r.n + '.' + codeOf(bundle()), e.target, 'Link copied'); });
  }
  function copy(text, btn, msg) {
    const done = () => { const old = btn.textContent; btn.textContent = msg; setTimeout(() => { btn.textContent = old; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => window.prompt('Copy this', text)); else window.prompt('Copy this', text);
  }

  function openCard() {
    const { xp, lv } = refreshHud(), nx = nextOf(lv), st = stateNow(), pct = nx ? Math.round((xp - lv.at) / (nx.at - lv.at) * 100) : 100;
    const d = openDialog(`<div class="gc__head"><canvas width="24" height="24" aria-hidden="true"></canvas><div style="display:grid;gap:.15rem"><h3>${esc(G.name || 'Unnamed adventurer')}</h3><div>${esc(lv.name)} · Lv ${lv.n}</div><small>${G.since ? 'Member since ' + esc(G.since) + ' · ' : ''}seed ${esc(G.seed)}</small></div></div>
      <div><small>Experience</small><div class="xpbar" role="img" aria-label="${pct} percent of the way to the next level"><i style="width:${pct}%"></i></div><strong>${xp} XP${nx ? ' · ' + (nx.at - xp) + ' to ' + esc(nx.name) : ' · top level'}</strong></div>
      <div><small>Region badges</small><div class="gc__badges"></div></div>
      <label>Adventurer name<span class="gc__row"><input type="text" data-f="name" maxlength="24" value="${esc(G.name || '')}" placeholder="Name my adventurer" aria-label="Adventurer name"><button data-do="name">Name</button></span></label>
      <label>Link to your roadmap page (the evidence)<span class="gc__row"><input type="url" data-f="evidence" value="${esc(G.evidence || '')}" placeholder="https://you.github.io/roadmap" aria-label="Roadmap page link"><button data-do="evidence">Save link</button></span></label>
      <div class="gc__row"><button class="primary" data-do="savefile">Save file</button><button data-do="savecode">Copy save code</button><button data-do="loadfile">Load file</button><input type="file" accept="application/json,.json" hidden data-f="file"></div>
      <label>Load a save code<span class="gc__row"><input type="text" data-f="code" placeholder="Paste a save code" aria-label="Save code"><button data-do="loadcode">Load</button></span></label>
      <div class="gc__note" data-msg role="status" aria-live="polite">Progress is saved in this browser. The file or code moves it to another device. It is self-reported and not a signed credential.</div>`, 'Guild card');
    drawHero(d.querySelector('.gc__head canvas'), G.name || G.seed);
    const row = d.querySelector('.gc__badges'), msg = d.querySelector('[data-msg]'), say = (t) => { msg.textContent = t; };
    badgeRegions().forEach((r) => { const on = regionDone(r.n, st), b = h('button', on ? '' : 'off'); b.type = 'button'; b.append(medalCanvas(r.n, on)); b.append(h('span', '', esc(r.name))); b.setAttribute('aria-label', r.name + ' badge, ' + (on ? 'earned' : 'not earned yet')); b.addEventListener('click', () => openBadge(r, bundle(), false)); row.append(b); });
    const slug = () => (G.name || G.seed).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'adventurer';
    d.addEventListener('click', (e) => {
      const a = e.target.closest('[data-do]')?.dataset.do; if (!a) return;
      if (a === 'name') { G.name = cleanName(d.querySelector('[data-f=name]').value); write(GUILD_KEY, G); refreshHud(); closeDialog(); openCard(); }
      else if (a === 'evidence') { const raw = d.querySelector('[data-f=evidence]').value.trim(), u = cleanUrl(raw); if (raw && !u) { say('That is not a web address. Use one that starts with https://.'); return; } G.evidence = u; write(GUILD_KEY, G); say(u ? 'Evidence link saved.' : 'Evidence link cleared.'); }
      else if (a === 'savefile') { download('grain-quest-' + slug() + '.json', JSON.stringify(bundle(), null, 2)); say('Save file downloaded.'); }
      else if (a === 'savecode') copy(codeOf(bundle()), e.target, 'Code copied');
      else if (a === 'loadfile') d.querySelector('[data-f=file]').click();
      else if (a === 'loadcode') { const bd = bundleFromCode(d.querySelector('[data-f=code]').value); if (!bd) { say('That code did not load. Check that you pasted all of it.'); return; } applyBundle(bd); closeDialog(); openCard(); }
    });
    d.querySelector('[data-f=file]').addEventListener('change', (e) => {
      const f = e.target.files[0]; if (!f) return; if (f.size > 200000) { say('That file is too large to be a save.'); return; }
      f.text().then((t) => { const bd = parseBundle(t); if (!bd) { say('That file did not load. It is not a save from this path.'); return; } applyBundle(bd); closeDialog(); openCard(); });
    });
  }
  hud.addEventListener('click', openCard);

  /* a badge link: #badge=<region>.<code> shows that holder's badge page from the code alone, and never touches this browser's own progress */
  function applyHash() {
    const m = /^#badge=(\d{1,2})\.([A-Za-z0-9_-]+)$/.exec(location.hash); if (!m) return;
    const r = REG.find((x) => x.n === +m[1]), bd = bundleFromCode(m[2]); if (r && bd) openBadge(r, bd, true);
  }
  addEventListener('hashchange', applyHash);

  window.Guild = { xp: () => xpOf(stateNow()), level: () => levelOf(xpOf(stateNow())), bundle, codeOf, bundleFromCode, parseBundle, applyBundle, open: openCard, LEVELS };
  if (!G.lv) { G.lv = levelOf(xpOf(stateNow())).n; write(GUILD_KEY, G); }
  refreshHud(); setInterval(tick, 700);
  (window.qmReady || Promise.resolve()).then(applyHash);
})();
