# Regenerates in-site-map.html and in-site-note.html. See README.md in this folder for the inputs it expects.
# It reads a fetched copy of a real note page, the site stylesheets and the font files from its own folder.
import re, os, shutil, sys
S = os.path.dirname(os.path.abspath(__file__))
OUT = f"{S}/wt/docs/mockups/quest-map"
os.makedirs(f"{OUT}/fonts", exist_ok=True)
for f in ["redaction-70-400", "redaction-50-400", "redaction-400", "redaction-35-400"]:
    shutil.copy(f"{S}/fonts_{f}.woff2", f"{OUT}/fonts/{f}.woff2")

html = open(f"{S}/note.html").read()

# 1. scripts out, stylesheets inlined, so the file opens with no site running
html = re.sub(r"<script\b[^>]*>.*?</script>", "", html, flags=re.S)
html = re.sub(r"<script\b[^>]*/>", "", html)
def inline(m):
    href = m.group(1)
    path = href.lstrip("/").replace("/", "_")
    p = f"{S}/css/{path}"
    if not os.path.exists(p):
        return ""
    css = open(p).read().replace('url("/fonts/', 'url("fonts/')
    return f"<style>/* {href} */\n{css}</style>"
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline, html)
html = re.sub(r'<link rel="(canonical|alternate)"[^>]*>', "", html)

# 2. the quest layer, written against GRAIN tokens only
QCSS = """<style>
/* Quest additions. Chrome reads GRAIN tokens only (paper, ink, ink-muted, color-accent), as the plan requires. */
:root { --q-pin:#e8503f; --q-done:#4e9a52; }
.qc { display:grid; grid-template-columns:168px 1fr; border:2px solid var(--ink); background:var(--panel); margin:var(--space-5, 1.25rem) 0; box-shadow:4px 4px 0 var(--line-soft); }
.qc__scene { width:168px; height:100%; min-height:200px; display:block; image-rendering:pixelated; border-right:2px solid var(--ink); }
.qc__body { padding:.8rem 1rem .9rem; display:grid; gap:.55rem; align-content:start; min-width:0; }
.qc__ribbon { font:700 .68rem/1 var(--font-mono, ui-monospace, monospace); letter-spacing:.08em; text-transform:uppercase; color:var(--ink-muted); }
.qc__title { font-weight:700; font-size:1.05rem; margin:0; }
.qc__sum { margin:0; font-size:.95rem; line-height:1.55; }
.qc__meta, .qc__runes { display:flex; flex-wrap:wrap; gap:.4rem; align-items:center; font-size:.74rem; color:var(--ink-muted); }
.qc__chip { border:1px solid var(--ink); padding:0 .4rem; color:var(--ink); background:var(--paper); }
.qc__rune { display:inline-flex; gap:.35rem; align-items:center; border:1px solid var(--ink); padding:0 .45rem 0 0; background:var(--paper); color:var(--ink); }
.qc__rune i { display:block; width:14px; height:14px; background:var(--color-accent); border-right:1px solid var(--ink); }
.qc__bar { height:9px; border:2px solid var(--ink); background:var(--paper); }
.qc__bar i { display:block; height:100%; width:50%; background:var(--color-accent); }
.qc__row { display:flex; gap:.5rem; flex-wrap:wrap; }
.qc__btn { font:inherit; font-size:.82rem; padding:.3rem .7rem; border:2px solid var(--ink); background:var(--paper); color:var(--ink); cursor:pointer; }
.qc__btn[data-primary] { background:var(--color-accent); color:var(--color-accent-contrast); }
.qc small { color:var(--ink-muted); font-size:.74rem; }
.qpip { font:700 .62rem/1.6 var(--font-mono, ui-monospace, monospace); letter-spacing:.06em; text-transform:uppercase; white-space:nowrap; vertical-align:middle; margin-left:.7rem; padding:0 .45rem; border:2px solid var(--ink); background:var(--color-accent); color:var(--color-accent-contrast); }
.qpip[data-done] { background:var(--q-done); color:#fff; }
.qpip[data-off] { background:var(--paper); color:var(--ink-muted); }
@media (max-width: 720px) { .qc { grid-template-columns:1fr; } .qc__scene { width:100%; height:64px; min-height:0; border-right:0; border-bottom:2px solid var(--ink); } }
.qm-main { padding:0 !important; overflow:hidden !important; position:relative; }
.qm-frame { position:absolute; inset:0; width:100%; height:100%; border:0; display:block; background:var(--paper); }
.qm-note { position:fixed; right:.8rem; bottom:.8rem; z-index:20; font:.7rem/1.4 ui-monospace,monospace; background:var(--paper); color:var(--ink-muted); border:1px solid var(--line-soft); padding:.3rem .5rem; max-width:22rem; }
</style>"""

CARD = """<section class="qc" aria-label="Lesson for this note" data-surface="lesson:card">
  <canvas class="qc__scene" id="qc-scene" width="42" height="64" aria-hidden="true"></canvas>
  <div class="qc__body">
    <span class="qc__ribbon">Lesson &middot; Model Mines &middot; Quest 1 of 3</span>
    <p class="qc__title">Learn this note as a quest</p>
    <p class="qc__sum">In four short stops I talk you through the night I ran out of Codex with hours to go: why a home model or a free one was not the way out, and the one rule I built the whole setup to enforce, which is that my own public code goes to free models and work code never does. You read the note while I explain it, then try one small task at the end of each stop.</p>
    <div class="qc__meta"><span class="qc__chip">4 stops</span><span class="qc__chip">about 16 min of audio</span><span class="qc__chip">Lv 1 intro</span><span class="qc__chip">+650 XP</span></div>
    <div class="qc__runes"><span>You will collect</span><span class="qc__rune"><i></i>A worse model is a hobby</span><span class="qc__rune"><i></i>Free may keep it</span><span class="qc__rune"><i></i>Work code stays home</span></div>
    <div class="qc__bar" title="2 of 4 stops done"><i></i></div>
    <div class="qc__row"><a class="qc__btn" data-primary href="#the-old-setup-and-the-new-one">Continue at stop 3</a><a class="qc__btn" href="in-site-map.html">See it on the map</a></div>
    <small>2 of 4 stops done. Progress is saved in this browser, and the guild card can export it.</small>
  </div>
</section>
"""

PIPS = {
    "the-night-i-went-looking-for-a-way-out": ('Stop 1 &middot; done', "data-done"),
    "the-old-setup-and-the-new-one": ('Stop 2 &middot; next', ""),
    "what-a-model-intelligence-layer-does": ('Stop 3 &middot; reference', "data-off"),
    "what-is-built-and-what-is-still-ahead": ('Stop 4', "data-off"),
}
def pip(slug):
    global html
    m = re.search(rf'(<h2[^>]*id="{slug}"[^>]*>.*?)(</h2>)', html, flags=re.S)
    assert m, slug
    label, attr = PIPS[slug]
    html = html[:m.end(1)] + f'<a class="qpip" {attr} href="#lesson" title="Open the lesson at this stop">&#9654; {label}</a>' + html[m.end(1):]

SCENE_JS = """<script>
// A pixel scene for the card, drawn from rects: sky, two peaks with snow, a cave mouth, a pine, ground.
(function(){var c=document.getElementById('qc-scene'),x=c.getContext('2d');
function r(col,a,b,w,h){x.fillStyle=col;x.fillRect(a,b,w,h)}
r('#8cc4e0',0,0,42,64);r('#a6d6ea',0,0,42,14);
function peak(cx,top,base,col,dk){for(var y=top;y<base;y++){var w=(y-top)*0.9+1;r(col,Math.round(cx-w),y,Math.round(w*2),1);r(dk,Math.round(cx),y,Math.round(w),1)}}
peak(16,14,50,'#a39a8c','#948a7c');peak(30,24,50,'#948a7c','#7e7566');
for(var y=14;y<20;y++){var w=(y-14)*.9+1;r('#f4f8ff',Math.round(16-w),y,Math.round(w*2),1)}
r('#3b2d1c',13,42,8,8);r('#14100a',14,43,6,7);
r('#9ccc5f',0,50,42,14);r('#8bbb4f',0,56,42,8);
r('#7a4a26',33,50,2,5);r('#4e9a52',29,42,10,4);r('#4e9a52',30,38,8,4);r('#3f8646',32,35,4,3);
x.strokeStyle='#3b2d1c';})();
</script>"""

THEME_JS = """<script>
// Static stand-in for the site's own theme buttons, so the mockup can be checked in every flavor and scheme.
(function(){var h=document.documentElement,fl=['sourdough','baguette','brioche'],i=0,dark=false;
function sync(){h.setAttribute('data-theme',fl[i]);h.setAttribute('data-color-scheme',dark?'dark':'light');
 var n=document.querySelector('[data-theme-name]');if(n)n.textContent=fl[i];
 var f=document.querySelector('.qm-frame');try{var d=f.contentDocument.documentElement;d.setAttribute('data-theme',fl[i]);d.setAttribute('data-color-scheme',dark?'dark':'light');if(f.contentWindow.qmSync)f.contentWindow.qmSync()}catch(e){}}
var a=document.querySelector('[data-cycle-theme]'),b=document.querySelector('[data-toggle-scheme]');
if(a)a.addEventListener('click',function(){i=(i+1)%3;sync()});
if(b)b.addEventListener('click',function(){dark=!dark;sync()});
var f=document.querySelector('.qm-frame');if(f)f.addEventListener('load',sync);sync();})();
</script>"""

THEMES = "".join(f"<style>/* {n} */\n{open(f'{S}/css/styles_themes_{n}.css').read()}</style>" for n in ("baguette","brioche"))
def finish(doc, title):
    doc = doc.replace("/assets/sprite.svg", "assets/sprite.svg").replace("</head>", THEMES + "</head>", 1)
    doc = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", doc, flags=re.S)
    doc = doc.replace("</head>", QCSS + "</head>", 1)
    return doc

# ---- note page
note = html
i = note.index('<aside class="note-contents"')
note = note[:i] + CARD + note[i:]
html = note
for s in PIPS: pip(s)
note = html
note = finish(note, "Mockup: the lesson card inside the real note page")
note = note.replace("</body>", SCENE_JS + THEME_JS + "</body>", 1)
open(f"{OUT}/in-site-note.html", "w").write(note)

# ---- map page: same shell, the map fills main
html = open(f"{S}/note.html").read()
html = re.sub(r"<script\b[^>]*>.*?</script>", "", html, flags=re.S)
html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', inline, html)
html = re.sub(r'<link rel="(canonical|alternate)"[^>]*>', "", html)
m = re.search(r'<main class="app-shell__main" id="main-content">', html)
e = html.index("</main>", m.end())
html = html[:m.start()] + '<main class="app-shell__main qm-main" id="main-content"><iframe class="qm-frame" src="fullscreen.html" title="Quest map, the full-screen prototype"></iframe>' + html[e:]
# Map mode: a screen of its own, like the builder. Left rail collapsed, assistant aside hidden, terminal hidden.
html = html.replace('data-rail-collapsed="false"', 'data-rail-collapsed="true" data-aside-hidden="true" data-console-hidden="true" data-mode="map"', 1)
html = finish(html, "Mockup: the quest map inside the portfolio shell")
html = html.replace("</body>", THEME_JS + "</body>", 1)
open(f"{OUT}/in-site-map.html", "w").write(html)
print("ok", len(note), len(html))
