# Builds in-site-note-map-card.html from in-site-note.html: adds the "Where this sits" map card above the lesson card and a
# "Related on the map" row above Where to next. A mockup, checked by eye. Run with Python 3 from this folder.
s = open("in-site-note.html").read()

CSS = """<style>
/* Where this sits: a crop of the baked map, tokens only for chrome. The crop is background-image, so it works without JavaScript. */
.wm { display:flex; flex-wrap:wrap; border:2px solid var(--ink); background:var(--panel); margin:var(--space-5,1.25rem) 0 0; box-shadow:4px 4px 0 var(--line-soft); }
.wm__map { position:relative; flex:0 0 360px; max-width:100%; height:300px; border-right:2px solid var(--ink); background:url(art/sourdough-light/base.png) -1596px -1800px / 3600px 3360px no-repeat; image-rendering:pixelated; overflow:hidden; }
@media (prefers-color-scheme: dark) { :root:not([data-color-scheme="light"]) .wm__map { background-image:url(art/sourdough-dark/base.png); } }
:root[data-color-scheme="dark"] .wm__map { background-image:url(art/sourdough-dark/base.png); }
.wm__map svg { position:absolute; inset:0; width:100%; height:100%; }
.wm__pin { position:absolute; width:26px; height:26px; margin:-13px 0 0 -13px; border-radius:50%; display:grid; place-items:center; font:700 .8rem/1 ui-monospace,monospace; color:#fff; background:#e8503f; border:2px solid #3b2d1c; }
.wm__pin[data-here] { width:34px; height:34px; margin:-17px 0 0 -17px; box-shadow:0 0 0 4px #fff, 0 0 0 6px #3b2d1c; font-size:1rem; }
.wm__pin[data-done] { background:#2f7d33; }
.wm__you { position:absolute; left:6px; bottom:6px; font:.66rem/1.4 ui-monospace,monospace; background:var(--paper); color:var(--ink); border:1px solid var(--ink); padding:0 .4rem; }
.wm__body { flex:1 1 240px; padding:.8rem 1rem .9rem; display:grid; gap:.55rem; align-content:start; min-width:0; }
.wm__ribbon { font:700 .68rem/1 ui-monospace,monospace; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-muted); }
.wm__title { font-weight:700; font-size:1.05rem; margin:0; }
.wm__list { list-style:none; margin:0; padding:0; display:grid; gap:.3rem; font-size:.88rem; }
.wm__list li { display:flex; gap:.5rem; align-items:center; }
.wm__list b { display:inline-grid; place-items:center; width:20px; height:20px; border-radius:50%; background:#e8503f; color:#fff; border:2px solid #3b2d1c; font:700 .66rem/1 ui-monospace,monospace; }
.wm__list li[data-here] { font-weight:700; }
.wm__list li[data-done] b { background:#2f7d33; }
.wm__list a { color:var(--ink); }
.wm__btn { justify-self:start; font:inherit; font-size:.82rem; padding:.3rem .7rem; border:2px solid var(--ink); background:var(--color-accent); color:var(--color-accent-contrast); text-decoration:none; }
.wm small { color:var(--ink-muted); font-size:.74rem; }
.rel-map { margin:2.2rem 0 0; }
.rel-map__grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:.8rem; }
.rel-map a { display:grid; gap:.3rem; text-decoration:none; color:var(--ink); border:2px solid var(--ink); background:var(--panel); padding:.7rem .8rem; box-shadow:3px 3px 0 var(--line-soft); }
.rel-map__tag { display:flex; align-items:center; gap:.45rem; font:700 .64rem/1 ui-monospace,monospace; letter-spacing:.07em; text-transform:uppercase; color:var(--ink-muted); }
.rel-map__tag i { width:16px; height:16px; border-radius:50%; border:2px solid #3b2d1c; background:var(--c); display:block; }
.rel-map__tag u { flex:1; border-top:2px dotted var(--ink-muted); text-decoration:none; }
.rel-map strong { font-size:.98rem; line-height:1.3; }
.rel-map small { color:var(--ink-muted); font-size:.76rem; }
@media (max-width:720px) { .wm__map { border-right:0; border-bottom:2px solid var(--ink); } }
</style>"""

CARD = """<section class="wm" aria-label="Where this note sits on the map" data-surface="map:card">
  <div class="wm__map" role="img" aria-label="Part of the Model Mines on the map, with three numbered quest pins joined by a dotted route. Pin 1 is this note.">
    <svg viewBox="0 0 360 300" aria-hidden="true"><polyline points="186,240 69,126 288,69" fill="none" stroke="#fff3b0" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/></svg>
    <span class="wm__pin" data-here style="left:186px;top:240px">1</span>
    <span class="wm__pin" style="left:69px;top:126px">2</span>
    <span class="wm__pin" style="left:288px;top:69px">3</span>
    <span class="wm__you">Model Mines</span>
  </div>
  <div class="wm__body">
    <span class="wm__ribbon">Where this sits &middot; Model Mines &middot; Quest 1 of 3</span>
    <p class="wm__title">This note is the first stop in the Mines</p>
    <ol class="wm__list">
      <li data-here><b>1</b> I Ran Out With Hours Left <small>(you are here)</small></li>
      <li><b>2</b> <a href="/notes/plan-big-type-small">Plan on the Big Model, Type on the Small One</a></li>
      <li><b>3</b> <a href="/notes/how-the-model-layer-works">How the Model Intelligence Layer Works</a></li>
    </ol>
    <a class="wm__btn" href="in-site-map.html#quest=necessity-and-the-model-layer">Find it on the map &rarr;</a>
    <small>The map opens already flown to this pin. Without JavaScript this card is a plain list with the same links.</small>
  </div>
</section>
"""

REL = """<section class="rel-map" aria-labelledby="rel-map-h"><h2 class="section-head" id="rel-map-h"><span>Related, on the map</span></h2>
<div class="rel-map__grid">
<a href="/notes/plan-big-type-small"><span class="rel-map__tag" style="--c:#3b82f6"><i></i>Model Mines &middot; quest 2<u></u>Next stop</span><strong>Plan on the Big Model, Type on the Small One</strong><small>The next note on this route. 10 min, 4 stops.</small></a>
<a href="/notes/how-the-model-layer-works"><span class="rel-map__tag" style="--c:#3b82f6"><i></i>Model Mines &middot; quest 3<u></u>Same region</span><strong>How the Model Intelligence Layer Works</strong><small>The long version, with the build. 25 min, 9 stops.</small></a>
<a href="/notes/one-loop-three-harnesses"><span class="rel-map__tag" style="--c:#2f7d5b"><i></i>Loop Forest &middot; quest 2<u></u>Other region</span><strong>The Loop Outlives the Model.</strong><small>Why the model is a routing decision. Across the trail, 11 min.</small></a>
</div></section>
"""

assert s.count("</head>") == 1
s = s.replace("</head>", CSS + "</head>", 1)
a = '<section class="qc" aria-label="Lesson for this note"'
assert s.count(a) == 1
s = s.replace(a, CARD + a, 1)
b = '<nav class="where-next"'
assert s.count(b) == 1
s = s.replace(b, REL + b, 1)
s = s.replace("<title>", "<title>Map card · ", 1)
open("in-site-note-map-card.html", "w").write(s)
print("wrote in-site-note-map-card.html", len(s))
