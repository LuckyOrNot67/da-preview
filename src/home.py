import json

CSS = r'''
@font-face{font-family:Archivo;src:url(../shared/fonts/archivo-latin.woff2) format("woff2");font-weight:100 900;font-stretch:62% 125%;font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212,U+2215}
@font-face{font-family:Archivo;src:url(../shared/fonts/archivo-latin-ext.woff2) format("woff2");font-weight:100 900;font-stretch:62% 125%;font-display:swap;unicode-range:U+0100-02BA,U+02BD-02C5,U+1E00-1E9F,U+2C60-2C7F}
:root{--ci:#D6EA12;--ci-w:#D2EB0A;--ci-m:#DCEF10;--ci-r:#DAEE18;--ink:#0B0C06;--paper:#F7F8EE;--g:clamp(16px,2.2vw,32px);--sec:clamp(72px,11vh,124px);--f:Archivo,system-ui,sans-serif;--acc:#0B0C06}
*{box-sizing:border-box}
[hidden]{display:none!important}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:72px}
.still{scroll-behavior:auto}
body{margin:0;overflow-x:clip;background:var(--paper);color:var(--ink);font:400 17px/1.42 var(--f);-webkit-font-smoothing:antialiased}
h1,h2,h3,p,ol,ul,figure,fieldset,dl,dd{margin:0;padding:0;border:0}ol,ul{list-style:none}
a{color:inherit}img,canvas{display:block;max-width:100%;height:auto}
button,input,select,textarea{font:inherit;color:inherit}
button{appearance:none;background:none;border:0;cursor:pointer}
:focus-visible{outline:2.5px solid currentColor;outline-offset:3px}
.skip{position:fixed;z-index:100;left:12px;top:-60px;padding:10px 14px;background:var(--ink);color:var(--ci)}
.skip:focus{top:12px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.h{font-weight:800;font-stretch:118%;letter-spacing:-.05em;line-height:.98}
.tag{display:inline-block;padding:5px 9px;background:var(--ink);color:var(--ci);font-weight:600;font-size:14px;line-height:1.2}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 24px;border-radius:999px;background:var(--ink);color:var(--ci);font-weight:600;font-size:16px;text-decoration:none;transition:opacity .2s}
.btn.i{background:var(--ci);color:var(--ink)}
.btn[disabled]{opacity:.6;cursor:progress}
.bar .btn{min-height:44px;padding:0 20px;font-size:15px}
.logo{font-weight:900;font-size:30px;line-height:1;font-stretch:125%;letter-spacing:-.06em;text-decoration:none}
.bar{position:fixed;z-index:80;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:10px var(--g);transition:background .2s,box-shadow .2s}
.bar.s{background:var(--paper);box-shadow:0 1px 0 rgba(11,12,6,.14)}
.navl{display:flex;gap:clamp(14px,2vw,28px);font-weight:600;font-size:15px}
.navl a{text-decoration:none}.navl a:hover{text-decoration:underline;text-underline-offset:4px}
.acts{display:flex;align-items:center;gap:8px}
.sh{display:none}
.menu{display:none;min-height:44px;padding:0 14px;border-radius:999px;border:1.5px solid var(--ink);font-weight:600;font-size:15px}
.sheet{position:fixed;z-index:79;inset:0;display:none;flex-direction:column;justify-content:center;gap:8px;padding:80px var(--g) 30px;background:var(--paper)}
.sheet.on{display:flex}
.sheet a{font-size:clamp(30px,9vw,54px);font-weight:800;font-stretch:118%;letter-spacing:-.05em;line-height:1.1;text-decoration:none}
.sheet .sm{margin-top:18px;font-size:16px;font-weight:500;font-stretch:100%;letter-spacing:0}

/* héros */
.hero{position:relative;height:100svh;min-height:600px;overflow:hidden;background:var(--ci-w)}
.pic{position:absolute;right:-3vw;bottom:0;width:min(max(103vw,180svh),190svh);aspect-ratio:2800/1568;-webkit-mask-image:linear-gradient(transparent,#000 12%),linear-gradient(90deg,transparent,#000 10%);mask-image:linear-gradient(transparent,#000 12%),linear-gradient(90deg,transparent,#000 10%);-webkit-mask-composite:source-in;mask-composite:intersect}
.pic picture,.pic img{position:absolute;inset:0;width:100%;height:100%}
.pic .on{inset:auto;left:25.75%;top:26.15%;width:68.14%;height:auto}
.pic .lamps{position:absolute;inset:0;animation:lamp .9s ease .5s both}
@keyframes lamp{from{opacity:0}to{opacity:1}}
.lead{position:absolute;z-index:2;left:var(--g);top:clamp(80px,12svh,120px);width:min(58vw,880px)}
.lead h1{margin-top:14px;font-size:min(6.2vw,14svh);white-space:nowrap}
.lead .s{margin-top:16px;max-width:27ch;font-size:clamp(18px,1.5vw,22px);line-height:1.3;font-weight:500}
.lead .cta{display:flex;flex-direction:column;align-items:flex-start;gap:10px;margin-top:20px}
.lead .more{font-weight:600;text-underline-offset:4px}

/* concept */
.con{background:var(--ci-r);padding:var(--sec) var(--g) clamp(44px,7vh,76px)}
.ch{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:20px clamp(24px,4vw,70px);align-items:end}
.ch h2{font-size:min(5.2vw,11svh);margin-top:14px}
.ch>p{font-size:clamp(17px,1.35vw,20px);line-height:1.35;font-weight:500}
.net{display:block;width:min(100%,128svh);margin:-1vh auto -3vh;-webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent),linear-gradient(transparent,#000 16%,#000 84%,transparent);mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent),linear-gradient(transparent,#000 16%,#000 84%,transparent);-webkit-mask-composite:source-in;mask-composite:intersect}
.stp{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(8px,1vw,14px);counter-reset:s}
.stp li{counter-increment:s;background:var(--paper);padding:clamp(12px,1.2vw,18px)}
.stp .im{aspect-ratio:3/2;display:flex;align-items:center;justify-content:center;overflow:hidden}
.stp .im img{width:100%}
.stp li:nth-child(4) .im img{height:100%;object-fit:cover}
.stp b{display:block;margin-top:12px;font-weight:800;font-stretch:112%;letter-spacing:-.03em;font-size:clamp(17px,1.4vw,21px);line-height:1.15}
.stp b:before{content:counter(s) " ";font-stretch:100%}
.stp span{display:block;margin-top:4px;font-size:16px;line-height:1.3}

/* expertise */
.exp{padding:var(--sec) var(--g)}
.exp>h2{font-size:min(5.2vw,11svh);margin-top:14px}
.row{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(16px,2vw,28px);align-items:center;margin-top:clamp(30px,6vh,60px)}
.row .im{grid-column:1/8;aspect-ratio:3/2;overflow:hidden;background:#e6e7da}
.row .im img{width:100%;height:100%;object-fit:cover}
.row .tx{grid-column:8/13;padding-left:clamp(0px,2vw,32px)}
.row:nth-of-type(even) .im{grid-column:6/13;grid-row:1}
.row:nth-of-type(even) .tx{grid-column:1/6;grid-row:1;padding:0 clamp(0px,2vw,32px) 0 0}
.row h3{font-weight:800;font-stretch:118%;letter-spacing:-.04em;line-height:1.02;font-size:clamp(28px,3vw,50px)}
.row p{margin-top:12px;font-size:clamp(17px,1.3vw,19px);max-width:42ch}
.row ul{margin-top:14px;border-top:1.5px solid var(--ink)}
.row li{padding:8px 0;border-bottom:1px solid rgba(11,12,6,.2);font-weight:500;font-size:16px}
.row .im.rep,.rep{display:flex;flex-direction:column;padding:clamp(16px,2.2vw,32px);background:var(--ink);color:var(--ci)}
.rep .hd{display:flex;justify-content:space-between;gap:12px;padding-bottom:12px;border-bottom:1.5px solid var(--ci);font-size:14px;font-weight:600}
.rep dl{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:0 24px}
.rep dl div{display:flex;flex-direction:column;justify-content:space-between;gap:8px;padding:14px 0;border-bottom:1px solid rgba(214,234,18,.3)}
.rep dt{font-size:14px}
.rep dd{font-weight:800;font-stretch:112%;font-size:clamp(28px,3vw,46px);letter-spacing:-.03em;line-height:1}
.rep p{margin:12px 0 0;font-size:14px;max-width:none}

/* formats */
.fmt{padding:var(--sec) var(--g) clamp(48px,7vh,84px);background:#fff}
.fmt .top{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap}
.fmt .h{font-size:min(5.2vw,11svh);margin-top:14px}
.fmt .top>p{max-width:34ch}
.tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:22px;padding:4px;border:1.5px solid var(--ink);border-radius:999px}
.tabs button{min-height:46px;border-radius:999px;font-weight:600;transition:background .2s,color .2s}
.tabs button[aria-selected=true]{background:var(--ink);color:var(--ci)}
.fcar{position:relative;aspect-ratio:1800/616;width:min(100%,112svh);margin:24px auto 0}
.fcar img{position:absolute;inset:0;width:100%;height:100%}
.fcar:before{content:"";position:absolute;left:6%;right:6%;bottom:-1%;height:5%;border-radius:50%;background:#000;filter:blur(10px);opacity:.26}
.fcar .fi{opacity:0;transition:opacity .3s ease}
.fcar .fi.on{opacity:1}
.fd{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto;gap:14px 40px;align-items:end;margin-top:24px}
.fd h3{font-weight:700;font-size:clamp(20px,1.7vw,25px);line-height:1.2}
.incl{display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:8px;font-size:15px}
.incl li{display:flex;align-items:center;gap:7px;color:#5C5D52}
.incl li:before{content:"";flex:none;width:10px;height:10px;border-radius:50%;border:1.5px solid currentColor}
.incl li.on{color:var(--ink);font-weight:500}
.incl li.on:before{background:var(--ink);border-color:var(--ink)}
.incl li.on .no{display:none}
.note{font-size:14px;line-height:1.4}

/* zones */
.zon{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(24px,5vw,80px);padding:var(--sec) var(--g);background:var(--ink);color:var(--paper);align-items:center}
.zon .h{font-size:min(5.2vw,11svh);color:var(--ci);margin-top:14px}
.zon .tag{background:var(--ci);color:var(--ink)}
.zon .in{margin-top:10px;max-width:44ch}
.opt{margin-top:16px}
.opt legend{padding:0;margin-bottom:7px;font-size:14px;font-weight:600}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chips label{position:relative;cursor:pointer}
.chips input{position:absolute;opacity:0;inset:0;width:100%;height:100%;margin:0;cursor:pointer}
.chips span{display:flex;align-items:center;min-height:42px;padding:0 15px;border:1.5px solid rgba(247,248,238,.5);border-radius:999px;font-size:15px;font-weight:500;transition:background .2s,color .2s,border-color .2s}
.chips input:checked+span{background:var(--ci);border-color:var(--ci);color:var(--ink)}
.chips input:focus-visible+span{outline:2.5px solid var(--paper);outline-offset:2px}
@media (hover:hover){.chips label:hover span{border-color:var(--paper)}}
canvas{width:100%;aspect-ratio:256/210}
.legend{display:flex;flex-wrap:wrap;gap:6px 20px;margin-top:10px;font-size:14px}
.legend li{display:flex;align-items:center;gap:8px}
.legend li:before{content:"";width:11px;height:11px;border-radius:50%;flex:none}
.legend .a:before{border:1.5px solid var(--paper)}.legend .b:before{background:var(--ci)}.legend .c:before{border:1.5px dashed var(--paper)}
.sum{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1.5px solid rgba(247,248,238,.4)}
.sum p{max-width:46ch;font-weight:500}
.zon .note{margin-top:10px}

/* créations */
.cre{padding:var(--sec) var(--g)}
.cre header{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap}
.cre .h{font-size:min(5.2vw,11svh);margin-top:14px}
.cre header p{max-width:42ch}
.gal{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,2vw,28px);margin-top:clamp(26px,5vh,46px)}
.pj .r{aspect-ratio:16/10;width:100%;object-fit:cover}
.pj .sm{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.pj .sm img{width:100%;aspect-ratio:1/.72;object-fit:cover}
.pj p{display:flex;justify-content:space-between;align-items:baseline;gap:14px;margin-top:10px}
.pj b{font-weight:800;font-stretch:112%;letter-spacing:-.03em;font-size:20px}
.pj span{font-size:14px;text-align:right}

/* parcours */
.flo{padding:var(--sec) var(--g);background:var(--ci-r)}
.flo .h{font-size:min(5.2vw,11svh)}
.six{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(26px,4.4vh,44px) clamp(14px,2vw,28px);margin-top:clamp(30px,6vh,56px);counter-reset:s}
.six li{padding-top:10px;border-top:2px solid var(--ink);counter-increment:s}
.six li:before{content:counter(s);display:block;font-weight:800;font-size:15px;margin-bottom:clamp(14px,3vh,30px)}
.six b{display:block;font-weight:800;font-stretch:112%;letter-spacing:-.03em;font-size:clamp(21px,2.1vw,32px);line-height:1.08}
.six span{display:block;margin-top:6px;max-width:32ch}

/* devis */
.ask{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);background:var(--ink);color:var(--paper)}
.ask .im{position:relative;min-height:100%}
.ask .im img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 50%}
.ask .bx{padding:clamp(56px,9vh,100px) var(--g)}
.ask h2{font-size:min(4.6vw,10svh);color:var(--ci)}
.ask .bx>p{margin-top:12px;max-width:50ch}
.ask .bx>p.sm{font-size:14px}
form{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px;margin-top:22px}
form .w{grid-column:1/-1}
form label{display:block;margin-bottom:6px;font-size:14px;font-weight:600}
form input:not([type=checkbox]),form select,form textarea{display:block;width:100%;min-height:48px;padding:12px;border-radius:0;font-size:16px;background:#17190F;border:1.5px solid #4A4D2C;color:var(--paper)}
form input:focus,form select:focus,form textarea:focus{outline:0;border-color:var(--ci)}
form [aria-invalid=true]{border-color:var(--ci)!important}
form textarea{resize:vertical}
.err{display:block;font-size:14px;margin-top:4px;color:var(--ci)}
.err:empty{display:none}
.chk{display:flex;gap:10px;align-items:flex-start}
.chk input{flex:none;width:22px;height:22px;margin:0;accent-color:var(--ci)}
.chk label{margin:0;font-weight:400;font-size:15px}
.hp{position:absolute;left:-9999px}
.send{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.send p{margin:0;font-size:15px;color:var(--ci)}
.done{margin-top:22px;padding:18px;background:var(--ci);color:var(--ink);font-weight:600;font-size:18px}
footer{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr);gap:18px 50px;padding:26px var(--g) 30px;font-size:14px;background:var(--ink);color:#C8CAB4;border-top:1px solid #2C2E1A}
footer summary{cursor:pointer;font-weight:600;min-height:28px}
footer details p{margin-top:6px}
footer .fine{max-width:70ch}
footer a{display:inline-block;margin-top:10px;font-weight:600}
.doc{max-width:720px;margin:0 auto;padding:110px var(--g) 80px}
.doc h1{font-size:clamp(38px,6vw,64px)}
.doc h2{margin-top:26px;font-size:20px;font-weight:700}
.doc p{margin-top:8px}
.doc .tag{margin-top:16px}

@media (max-width:1040px){.navl{display:none!important}.menu{display:inline-flex;align-items:center}}
@media (max-width:640px){.lg{display:none}.sh{display:inline}}
@media (max-width:1040px),(max-aspect-ratio:1/1){
  .fd{grid-template-columns:1fr}
}
@media (min-aspect-ratio:1/1) and (max-aspect-ratio:3/2){.pic{width:140svh;right:-12vw}}
@media (max-aspect-ratio:1/1){
  :root{--sec:64px}
  .hero{background:var(--ci-m);min-height:620px}
  .pic{left:0;right:0;width:100%;aspect-ratio:1200/2142;-webkit-mask-image:linear-gradient(transparent,#000 10%);mask-image:linear-gradient(transparent,#000 10%);-webkit-mask-composite:source-over;mask-composite:add}
  .pic .on{left:20.33%;top:69.56%;width:78.17%}
  .logo{font-size:27px}
  .lead{right:var(--g);top:68px;width:auto}
  .tag{font-size:13.5px}
  .lead h1{margin-top:12px;font-size:11.5vw}
  .lead .s{margin-top:12px;max-width:none;font-size:18px}
  .lead .cta{margin-top:14px}
  .lead .btn{width:100%;min-height:54px;font-size:17px}
  .ch{grid-template-columns:1fr}
  .ch h2,.exp>h2,.fmt .h,.zon .h,.cre .h,.flo .h{font-size:9.6vw}
  .ask h2{font-size:10vw}
  .net{width:calc(100% + var(--g)*2);max-width:none;margin:-10px calc(var(--g)*-1)}
  .stp{grid-template-columns:1fr 1fr}
  .row{display:block;margin-top:30px}
  .row .tx,.row:nth-of-type(even) .tx{padding:0;margin-top:14px}
  .zon{display:block}
  .zon .mp{margin:18px 0 6px}
  .zon .ctl{display:contents}
  .gal{grid-template-columns:1fr}
  .six{grid-template-columns:1fr;gap:0}
  .six li{display:grid;grid-template-columns:30px 1fr;padding:12px 0 16px;border-top:1.5px solid var(--ink)}
  .six li:before{margin:0;padding-top:3px}
  .six span{grid-column:2}
  .ask{display:block}
  .ask .im{height:30svh;min-height:180px}
}
@media (max-width:640px){form{grid-template-columns:1fr}footer{grid-template-columns:1fr}}
@media (max-width:380px){.bar{gap:8px}.bar .btn{padding:0 14px}}
.still *{animation:none!important;transition:none!important}
'''


def img(n, alt, cls='', w=1344, h=752, lazy=True):
    a = ' aria-hidden="true"' if not alt else ''
    return f'<img{f" class={cls!r}" if cls else ""}{" loading=lazy" if lazy else ""} decoding="async" src="../shared/img/{n}.webp" alt="{alt}" width="{w}" height="{h}"{a}>'


def head(T, title, desc, pre='', base='..'):
    return f'''<!doctype html>
<html lang="{T["lang"]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#D2EB0A">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:locale" content="fr_BE">
<link rel="icon" href="{base}/shared/favicon.svg" type="image/svg+xml">
<link rel="preload" href="{base}/shared/fonts/archivo-latin.woff2" as="font" type="font/woff2" crossorigin>
{pre}<script>if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('still')</script>
<link rel="stylesheet" href="{'' if base == '..' else '../'}site.css">
</head>
<body>
'''


def form(T):
    F = T['ask']['f']
    fld = lambda n, lab, t='text', req=False, ac='': f'<div><label for="q-{n}">{lab}{"" if not req else " *"}</label><input id="q-{n}" name="{n}" type="{t}"{" required" if req else ""}{f" autocomplete={ac}" if ac else ""} aria-describedby="{n}-err"><span class="err" id="{n}-err"></span></div>'
    sel = lambda n, lab, opts: f'<div><label for="q-{n}">{lab}</label><select id="q-{n}" name="{n}"><option value="">{F["unknown"]}</option>' + ''.join(f'<option>{o}</option>' for o in opts) + '</select></div>'
    return f'''<form data-quote novalidate>
{fld("name", F["name"], req=True, ac="name")}{fld("company", F["company"], req=True, ac="organization")}
{fld("email", F["email"], "email", True, "email")}{fld("phone", F["phone"], "tel", ac="tel")}
<div class="w"><label for="q-zones">{F["zones"]}</label><input id="q-zones" name="zones"></div>
{sel("vehicles", F["vehicles"], F["v"])}{sel("duration", F["duration"], F["d"])}
{sel("format", F["format"], F["fm"])}<div class="hp" aria-hidden="true"><label for="q-web">Site web</label><input id="q-web" name="website" tabindex="-1" autocomplete="off"></div>
<div class="w"><label for="q-message">{F["message"]}</label><textarea id="q-message" name="message" rows="3"></textarea></div>
<div class="w"><div class="chk"><input id="q-consent" name="consent" type="checkbox" required aria-describedby="consent-err"><label for="q-consent">{F["consent"]} <a href="confidentialite/">{F["policy"]}</a></label></div><span class="err" id="consent-err"></span></div>
<div class="w send"><button class="btn i" type="submit">{F["send"]}</button><p data-sent role="status"></p></div>
</form><div class="done" data-done tabindex="-1" hidden>{F["ok"]}</div>'''


def page(T):
    H, C, E, M, Z, R, FL, A = T['hero'], T['concept'], T['exp'], T['fmt'], T['zon'], T['cre'], T['flow'], T['ask']
    nav = ''.join(f'<a href="#{i}">{t}</a>' for i, t in T['nav'])
    stp = ''.join(f'<li><div class="im">{img(n, alt, "", 900, 308)}</div><b>{a}</b><span>{b}</span></li>' for a, b, n, alt in C['steps'])
    rep = E['report']
    rows = ''
    for i, (t, d, l, n, al) in enumerate(E['items']):
        media = f'<div class="im">{img(n, al, "", 1024, 688)}</div>' if n else f'<div class="im rep" role="img" aria-label="{rep["model"]}"><div class="hd"><span>{rep["title"]}</span><span>{rep["model"]}</span></div><dl>' + ''.join(f'<div><dt>{a}</dt><dd>{b}</dd></div>' for a, b in rep['rows']) + f'</dl><p>{rep["note"]}</p></div>'
        rows += f'<article class="row">{media}<div class="tx"><h3>{t}</h3><p>{d}</p><ul>' + ''.join(f'<li>{x}</li>' for x in l) + '</ul></div></article>'
    tabs = ''.join(f'<button role="tab" id="ft{i}" aria-selected="{"true" if i == 1 else "false"}" aria-controls="fpanel"{"" if i == 1 else " tabindex=-1"}>{n}</button>' for i, n in enumerate(M['names']))
    src = lambda n: f'srcset="../shared/img/{n}_m.webp 900w,../shared/img/{n}.webp 1800w" sizes="(max-aspect-ratio:1/1) 100vw,70vw" src="../shared/img/{n}.webp"'
    fi = ''.join(f'<img class="fi{" on" if i == 1 else ""}" data-fi {src("v2_" + k)} alt="Format {M["names"][i]} : {M["desc"][i].lower()}" width="1800" height="616" decoding="async" loading="lazy">' for i, k in enumerate(['classique', 'medium', 'complet']))
    incl = ''.join(f'<li data-z="{z}"{" class=on" if "1" in z else ""}>{t}<span class="sr no"> ({M["no"]})</span></li>' for t, z in M['incl'])
    fd = ' '.join(f'data-d{i}="{x}"' for i, x in enumerate(M['desc']))
    def group(i, lab, ty, items, on):
        return f'<fieldset class="opt"><legend>{lab}</legend><div class="chips" id="{i}">' + ''.join(f'<label><input type="{ty}" name="{i}" value="{t}"{" checked" if k in on else ""}><span>{t}</span></label>' for k, t in enumerate(items)) + '</div></fieldset>'
    grp = ''.join(group(*g) for g in Z['groups'])
    leg = ''.join(f'<li class="{c}">{t}</li>' for c, t in Z['legend'])
    gal = ''.join(f'<article class="pj">{img(a, al, "r", 2000, 1120)}<div class="sm">{img(b, R["proof"] + " " + t, "", 1000, 1244)}{img(c, R["detail"] + " " + t, "", 1000, 1244)}</div><p><b>{t}</b><span>{R["demo"]} · {s}</span></p></article>' for t, s, a, b, c, al in R['items'])
    six = ''.join(f'<li><b>{a}</b><span>{b}</span></li>' for a, b in FL['steps'])
    pic = lambda n, cls='', alt='', w=2800, h=1568, attr='': f'<picture><source media="(max-aspect-ratio:1/1)" srcset="../shared/img/{n}_m.webp"><source srcset="../shared/img/{n}_1600.webp 1600w,../shared/img/{n}.webp 2800w" sizes="104vw"><img {attr}src="../shared/img/{n}.webp" alt="{alt}" width="{w}" height="{h}"></picture>'
    lamps = f'<picture><source media="(max-aspect-ratio:1/1)" srcset="../shared/img/v2_hero_m_on.webp"><img class="on" src="../shared/img/v2_hero_on.webp" alt="" aria-hidden="true"></picture>'
    pre = '<link rel="preload" as="image" href="../shared/img/v2_hero_off_m.webp" media="(max-aspect-ratio:1/1)">\n<link rel="preload" as="image" href="../shared/img/v2_hero_off_1600.webp" media="(min-aspect-ratio:1/1)">\n'
    conf = {'lang': T['lang'], 'm': T['msg']}
    return head(T, T['title'], T['desc'], pre) + f'''<a class="skip" href="#top">{T["skip"]}</a>
<header class="bar"><a class="logo" href="#top" aria-label="roam, nom provisoire, retour en haut">roam.</a><nav class="navl" aria-label="Navigation principale">{nav}</nav><div class="acts"><a class="btn" href="#devis" aria-label="{T["cta"]}"><span class="lg">{T["cta"]}</span><span class="sh">{T["cta_short"]}</span></a><button class="menu" data-menu aria-expanded="false" aria-controls="sheet">{T["menu"]}</button></div></header>
<div class="sheet" data-sheet id="sheet">{nav}<a href="#devis">{T["cta"]}</a><a class="sm" href="#conducteur">{T["driver"]}</a></div>
<main id="top">
<section class="hero" aria-label="{H["tag"]}">
  <div class="pic">{pic("v2_hero_off", alt=H["alt"], attr='fetchpriority="high" ')}<div class="lamps">{lamps}</div></div>
  <div class="lead"><p class="tag">{H["tag"]}</p><h1 class="h">{H["h1"]}</h1><p class="s">{H["sub"]}</p><div class="cta"><a class="btn" href="#devis">{T["cta"]}</a><a class="more" href="#concept">{H["more"]}</a></div></div>
</section>
<section class="con" id="concept" aria-labelledby="c-t"><div class="ch"><div><p class="tag">{C["tag"]}</p><h2 class="h" id="c-t">{C["t"]}</h2></div><p>{C["p"]}</p></div>{img("v2_reseau", C["net"], "net")}<ol class="stp">{stp}</ol></section>
<section class="exp" id="expertise" aria-labelledby="e-t"><p class="tag">{E["tag"]}</p><h2 class="h" id="e-t">{E["t"]}</h2>{rows}</section>
<section class="fmt" id="formats" data-formats aria-labelledby="ft-h"><div class="top"><div><p class="tag">{M["tag"]}</p><h2 class="h" id="ft-h">{M["t"]}</h2></div><p>{M["p"]}</p></div><div class="tabs" role="tablist" aria-label="{M["group"]}">{tabs}</div><div id="fpanel" role="tabpanel" aria-labelledby="ft1" tabindex="0"><div class="fcar"><img {src("car_base")} alt="" aria-hidden="true" width="1800" height="616" decoding="async" loading="lazy">{fi}</div><div class="fd"><div><h3 data-fdesc {fd}>{M["desc"][1]}</h3><ul class="incl">{incl}</ul></div><p class="note">{M["note"]}</p><a class="btn" data-fuse href="#devis">{M["use"]}</a></div></div></section>
<section class="zon" id="zones" data-zones data-dot="rgba(247,248,238,.24)" data-on="#D6EA12" data-pill="#F7F8EE" data-pilltx="#0B0C06" data-mark="#F7F8EE" data-halo="#0B0C06" data-font="Archivo,sans-serif" aria-labelledby="zt"><div class="ctl"><div><p class="tag">{Z["tag"]}</p><h2 class="h" id="zt">{Z["t"]}</h2><p class="in">{Z["p"]}</p></div><div class="mp only-m"></div>{grp}</div><div class="mp"><canvas role="img" aria-label="{Z["map"]}"></canvas><noscript><p>{Z["nojs"]}</p></noscript><ul class="legend">{leg}</ul><div class="sum"><p data-zsum aria-live="polite"></p><a class="btn i" data-zuse href="#devis">{Z["use"]}</a></div><p class="note">{Z["note"]}</p></div></section>
<section class="cre" id="creations" aria-labelledby="ct"><header><div><p class="tag">{R["tag"]}</p><h2 class="h" id="ct">{R["t"]}</h2></div><p>{R["p"]}</p></header><div class="gal">{gal}</div></section>
<section class="flo" id="parcours" aria-labelledby="pt"><h2 class="h" id="pt">{FL["t"]}</h2><ol class="six">{six}</ol></section>
<section class="ask" id="devis" aria-labelledby="at"><div class="im">{img("v2_ville", A["alt"])}</div><div class="bx"><h2 class="h" id="at">{A["t"]}</h2><p>{A["p"]}</p><p class="sm">{A["small"]}</p>{form(T)}</div></section>
</main>
<footer id="conducteur"><div><details><summary>{T["driver"]}</summary><p>{T["foot"]["driver"]}</p></details><a href="confidentialite/">{T["foot"]["policy"]}</a></div><p class="fine">{T["foot"]["fine"]}</p></footer>
<script>window.SITE_T={json.dumps(conf, ensure_ascii=False)}</script>
<script src="../shared/be.js" defer></script><script src="../shared/config.js" defer></script><script src="../shared/site.js" defer></script>
</body></html>'''


def privacy(T):
    P = T['privacy']
    body = ''.join(f'<h2>{a}</h2><p>{b}</p>' for a, b in P['body'])
    return head(T, f'{P["title"]} · roam', P['draft'], base='../..') + f'''<main class="doc" id="top"><a class="logo" href="../">roam.</a><h1 class="h" style="margin-top:28px">{P["title"]}</h1><p class="tag">{P["draft"]}</p>{body}<p style="margin-top:28px"><a href="../">{P["back"]}</a></p></main></body></html>'''
