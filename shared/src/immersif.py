from content import *

CSS = BASE + r'''
:root{--ink:#05060C;--rose:#FF2E8B;--w:#EDEEF7;--mut:#B3B6C8;--g:clamp(16px,2.6vw,38px);--acc:#FF2E8B;--f:"Geist",system-ui,sans-serif;--m:"Geist Mono",ui-monospace,monospace}
body{background:var(--ink);color:var(--w);font:400 17px/1.45 var(--f)}
.lab{font:400 13px/1.3 var(--m)}
.tag{display:inline-block;padding:4px 8px;background:var(--rose);color:var(--ink);font:400 13px/1.2 var(--m)}
.h{font-weight:500;letter-spacing:-.045em;line-height:1.02}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;background:var(--w);color:var(--ink);font:400 14px/1 var(--m);text-decoration:none;transition:background .2s}
@media (hover:hover){.btn:hover{background:var(--rose)}}
.btn.r{background:var(--rose)}
header.bar{position:fixed;z-index:80;left:0;right:0;top:0;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px var(--g);background:linear-gradient(rgba(5,6,12,.72),rgba(5,6,12,0))}
.logo img{height:24px;width:auto}
.navl{display:flex;gap:clamp(14px,2vw,28px);font:400 13px/1 var(--m)}
.navl a{text-decoration:none}.navl a:hover{color:var(--rose)}
.menu{min-height:42px;padding:0 12px;border:1px solid rgba(237,238,247,.5);font:400 13px/1 var(--m)}
.sheet{background:var(--ink)}
.sheet a{font-size:clamp(30px,9vw,54px);font-weight:500;letter-spacing:-.04em;text-decoration:none}

/* film : la voiture arrive et passe, le scroll fait avancer la scène */
#film{position:relative;height:300vh}
.fs{position:sticky;top:0;height:100svh;overflow:hidden;background:#000}
.fs img.po,.fs canvas{position:absolute;inset:0;width:100%;height:100%;aspect-ratio:auto;object-fit:cover;max-width:none}
.fs .po.m{display:none}
.fs:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,6,12,.86) 0,rgba(5,6,12,.5) 34%,rgba(5,6,12,0) 58%);pointer-events:none}
.st{position:absolute;z-index:2;left:var(--g);bottom:clamp(30px,8vh,74px);width:min(52vw,780px);transition:opacity .45s ease,visibility .45s}
.st.off{opacity:0;visibility:hidden}
.st h1,.st h2{font-size:min(5.4vw,11.2svh);margin-top:14px}
.st .s{margin-top:12px;max-width:44ch;color:#D3D5E2;font-size:clamp(16px,1.2vw,18px)}
.st .acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
.pts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:18px}
.pts b{display:block;font-weight:500;font-size:16px;line-height:1.25}
.pts span{display:block;font-size:14.5px;color:var(--mut);line-height:1.3;margin-top:2px}
.bar-p{position:absolute;z-index:3;left:0;bottom:0;height:3px;width:100%;background:var(--rose);transform-origin:0 50%;transform:scaleX(var(--p,0))}
#concept{position:absolute;top:calc((100% - 100vh)*.78);left:0}

/* expertise : des plans qui se recouvrent */
#expertise{position:relative}
.pn{position:sticky;top:0;height:100svh;overflow:hidden;background:var(--ink)}
.pn>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pn:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,6,12,.9) 0,rgba(5,6,12,.55) 38%,rgba(5,6,12,0) 66%)}
.pc{position:absolute;z-index:2;left:var(--g);bottom:clamp(34px,10vh,90px);width:min(44vw,620px)}
.pc h2{font:400 13px/1.3 var(--m);color:var(--rose);margin-bottom:12px}
.pc h3{font-size:min(4.6vw,9.6svh);font-weight:500;letter-spacing:-.04em;line-height:1.04}
.pc p{margin-top:10px;max-width:40ch;color:#D3D5E2;font-size:clamp(17px,1.3vw,20px)}
.rep{position:absolute;z-index:2;right:var(--g);top:50%;transform:translateY(-50%);width:min(40vw,480px);background:rgba(5,6,12,.86);border:1px solid rgba(237,238,247,.28);padding:18px 20px}
.rep .hd{display:flex;justify-content:space-between;gap:10px;padding-bottom:10px;border-bottom:1px solid rgba(237,238,247,.28)}
.rep dl{margin:0;display:grid;grid-template-columns:1fr 1fr;gap:0 20px}
.rep dl div{padding:12px 0;border-bottom:1px solid rgba(237,238,247,.16)}
.rep dd{margin:6px 0 0;font-size:32px;letter-spacing:-.03em}

/* formats */
.fmt{padding:clamp(70px,12vh,130px) var(--g);background:radial-gradient(60% 50% at 50% 72%,#2A0A1E 0,var(--ink) 74%);text-align:center}
.fmt .h{font-size:min(4.6vw,9.6svh)}
.fmt>p{margin:10px auto 0;max-width:46ch;color:var(--mut)}
.tabs{display:inline-grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:22px;border:1px solid rgba(237,238,247,.4)}
.tabs button{min-height:46px;padding:0 clamp(16px,3vw,34px);font:400 14px/1 var(--m);transition:background .2s,color .2s}
.tabs button[aria-selected=true]{background:var(--rose);color:var(--ink)}
.fmt .fcar{width:min(100%,118svh);margin:26px auto 0}
.fmt .fcar:after{content:"";position:absolute;left:6%;right:6%;bottom:-3%;height:7%;border-radius:50%;background:#FF2E8B;opacity:.22;filter:blur(24px);z-index:-1}
.fd{margin-top:22px}
.fd h3{font-weight:500;font-size:clamp(20px,1.7vw,25px)}
.incl{justify-content:center;margin-top:10px;font:400 13px/1.3 var(--m)}
.note{font:400 13px/1.45 var(--m);color:var(--mut);margin-top:12px}

/* zones */
.zon{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(24px,5vw,80px);align-items:center;padding:clamp(70px,12vh,130px) var(--g);background:var(--ink)}
.zon .h{font-size:min(4.6vw,9.6svh)}
.zon .in{margin-top:10px;color:var(--mut);max-width:44ch}
.opt legend{font:400 13px/1.3 var(--m);color:var(--mut)}
.chips span{border:1px solid rgba(237,238,247,.4);font-size:15px}
.chips input:checked+span{background:var(--rose);border-color:var(--rose);color:var(--ink)}
@media (hover:hover){.chips label:hover span{border-color:var(--w)}}
.legend{margin-top:10px;font:400 13px/1.3 var(--m)}
.legend .a:before{border:1.5px solid var(--w)}.legend .b:before{background:var(--rose)}.legend .c:before{border:1.5px dashed var(--mut)}
.sum{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid rgba(237,238,247,.28)}
.sum p{max-width:46ch}

/* créations : un rail qui défile sous le doigt */
.cre{padding:clamp(70px,12vh,120px) 0;background:#0B0C14}
.cre header{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;padding:0 var(--g)}
.cre .h{font-size:min(4.6vw,9.6svh)}
.cre header p{max-width:44ch;color:var(--mut)}
.railx{display:flex;gap:12px;margin-top:26px;padding:0 var(--g) 10px;overflow-x:auto;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scroll-padding-left:var(--g)}
.railx figure{flex:none;height:min(66svh,620px);scroll-snap-align:start}
.railx img{height:calc(100% - 28px);width:auto;max-width:none}
.railx figcaption{height:28px;display:flex;align-items:flex-end;font:400 13px/1.2 var(--m);color:var(--mut)}

/* parcours : une ligne qui suit la lecture */
.flo{position:relative;padding:clamp(70px,12vh,130px) var(--g);background:var(--ink)}
.flo .h{font-size:min(4.6vw,9.6svh)}
.fl{position:relative;margin-top:30px;padding-left:34px;max-width:760px}
.fl:before,.fl i.l{content:"";position:absolute;left:5px;top:8px;bottom:8px;width:2px;background:rgba(237,238,247,.2)}
.fl i.l{background:var(--rose);transform-origin:0 0;transform:scaleY(var(--fp,0))}
.fl li{position:relative;padding:0 0 clamp(20px,3.6vh,34px);color:var(--mut);transition:color .3s}
.fl li:before{content:"";position:absolute;left:-34px;top:6px;width:12px;height:12px;border-radius:50%;background:var(--ink);border:2px solid rgba(237,238,247,.4);transition:background .3s,border-color .3s}
.fl li.on{color:var(--w)}
.fl li.on:before{background:var(--rose);border-color:var(--rose)}
.fl b{display:block;font-weight:500;font-size:clamp(21px,2vw,30px);letter-spacing:-.03em;line-height:1.15}
.still .fl li{color:var(--w)}

/* devis */
.ask{position:relative;padding:clamp(80px,14vh,140px) var(--g);overflow:hidden;background:var(--ink)}
.ask>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.75}
.ask .box{position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,5vw,70px)}
.ask h2{font-size:min(5.4vw,11.2svh)}
.ask .sd p{margin-top:12px;max-width:40ch;color:#D3D5E2}
.ask .sd .lab{color:var(--mut)}
form{background:rgba(5,6,12,.88);padding:clamp(16px,2vw,26px);border:1px solid rgba(237,238,247,.24)}
form label{font:400 13px/1.3 var(--m);color:#D3D5E2}
form input,form select,form textarea{background:#10121C;border:1px solid #3A3D50;color:var(--w)}
form input:focus,form select:focus,form textarea:focus{outline:2px solid var(--rose);outline-offset:0;border-color:var(--rose)}
.err,.send p{color:#FF8DBE}
footer{background:#000;color:var(--mut)}

@media (max-aspect-ratio:1/1){
  #film{height:260vh}
  .fs img.po.w{display:none}.fs .po.m{display:block}
  .fs:after{background:linear-gradient(180deg,rgba(5,6,12,.9) 0,rgba(5,6,12,.74) 40%,rgba(5,6,12,0) 62%)}
  .st{left:var(--g);right:var(--g);top:72px;bottom:auto;width:auto}
  .st h1,.st h2{font-size:11vw}
  .st .acts .btn{flex:1 1 auto}
  .pts{grid-template-columns:1fr;gap:8px}
  .pts div{display:flex;gap:8px;flex-wrap:wrap}
  .pts b{font-size:15.5px}.pts span{margin:0}
  .pn:after{background:linear-gradient(0deg,rgba(5,6,12,.94) 0,rgba(5,6,12,.7) 36%,rgba(5,6,12,0) 62%)}
  .pc{left:var(--g);right:var(--g);bottom:30px;width:auto}
  .pc h3{font-size:9.4vw}
  .pn:first-of-type>img{object-position:72% 50%}
  .rep{left:var(--g);right:var(--g);top:84px;width:auto;transform:none}
  .fmt .h,.zon .h,.cre .h,.flo .h{font-size:9.4vw}
  .ask h2{font-size:10.4vw}
  .zon{display:block}
  .zon .mp{margin-top:26px}
  .ask .box{grid-template-columns:1fr}
  .railx figure{height:58svh;max-height:430px}
}
.still #film{height:auto}
.still .fs{position:relative;height:auto;overflow:visible;padding-top:100svh;background:var(--ink)}
.still .fs img.po{height:100svh;bottom:auto}
.still .fs:after{height:100svh;bottom:auto}
.still .fs canvas,.still .bar-p{display:none}
.still .st#st-a{top:calc(100svh - 390px);bottom:auto}
.still .st.c{position:relative;left:auto;right:auto;top:auto;bottom:auto;width:auto;max-width:980px;padding:70px var(--g);opacity:1;visibility:visible}
.still #concept{position:static}
.still .pn{position:relative}
@media (max-aspect-ratio:1/1){.still .st#st-a{top:72px}}
'''

JS = r'''
(()=>{
const R=SITE.reduced,fs=document.querySelector('.fs'),film=document.getElementById('film'),A=document.getElementById('st-a'),B=document.getElementById('st-b');
/* ligne du parcours : suit la lecture */
const fl=document.querySelector('.fl'),li=[...fl.querySelectorAll('li')];
function flow(){const r=fl.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.72-r.top)/r.height));fl.style.setProperty('--fp',p);li.forEach((n,k)=>n.classList.toggle('on',p*li.length>k))}
if(!R){addEventListener('scroll',flow,{passive:true});flow()}
if(R)return;
/* film : le scroll fait passer la voiture, image par image */
const port=innerWidth<=innerHeight,N=71,dir=port?'m':'w',cv=document.getElementById('fc'),cx=cv.getContext('2d'),F=new Array(N);
let cur=0,tgt=0,last=-1,top=0,max=1,raf=0,ok=0;
const src=i=>`film/${dir}/${String(i+1).padStart(3,'0')}.webp`;
function size(){const d=Math.min(devicePixelRatio||1,1.5);cv.width=fs.clientWidth*d;cv.height=fs.clientHeight*d;top=film.getBoundingClientRect().top+scrollY;max=film.offsetHeight-fs.clientHeight;last=-1;tick()}
function near(i){for(let d=0;d<N;d++){if(F[i-d])return F[i-d];if(F[i+d])return F[i+d]}return null}
function paint(i){const m=near(i);if(!m)return;const cw=cv.width,ch=cv.height,s=Math.max(cw/m.width,ch/m.height),w=m.width*s,h=m.height*s,fx=port?.5:.62;cx.drawImage(m,(cw-w)*fx,(ch-h)*(port?1:.5),w,h)}
function frame(p){const i=Math.round(p*(N-1));if(i!==last){paint(i);last=i}fs.style.setProperty('--p',p);const b=p>.72;A.classList.toggle('off',b);B.classList.toggle('off',!b)}
function tick(){cancelAnimationFrame(raf);raf=requestAnimationFrame(function f(){tgt=Math.min(1,Math.max(0,(scrollY-top)/max));cur+=(tgt-cur)*.16;if(Math.abs(tgt-cur)<.0008)cur=tgt;frame(cur);if(cur!==tgt)raf=requestAnimationFrame(f)})}
function load(i,step){return new Promise(ok=>{const m=new Image();m.onload=()=>{F[i]=m;ok()};m.onerror=ok;m.src=src(i)})}
addEventListener('scroll',tick,{passive:true});addEventListener('resize',size);
load(0).then(async()=>{size();cv.style.opacity=1;
  for(const st of [8,4,2,1]){const b=[];for(let i=0;i<N;i+=st)if(!F[i])b.push(load(i));await Promise.all(b);last=-1;frame(cur)}
});
})();
'''


def build():
    F = fmt_block('im', 'car_base_n')
    pts = ''.join(f'<div><b>{a}</b><span>{b}</span></div>' for a, b in CONCEPT['pts'])
    imgs = ['im_proof', 'im_wrap', 'im_pose', 'im_top', 'im_end']
    alts = ["Épreuves roses et noires posées sur une table, de nuit", "Détail du film rose et noir sur la carrosserie", "Mains gantées posant un film rose sur une portière noire", "Vue du dessus d'une voiture rose sur une route de nuit", "Rue pavée de nuit"]
    pn = ''
    for i, ((t, d), m, al) in enumerate(zip(EXP['items'], imgs, alts)):
        rep = '''<div class="rep" role="img" aria-label="Modèle de rapport sans données"><div class="hd lab"><span>Rapport de campagne</span><span>Modèle sans données</span></div><dl><div><dt class="lab">Kilomètres éligibles</dt><dd>— km</dd></div><div><dt class="lab">Zones couvertes</dt><dd>—</dd></div></dl></div>''' if i == 4 else ''
        pn += f'<article class="pn">{pic(m, al, "", 1344, 752)}<div class="pc">{"<h2>" + EXP["t"] + "</h2>" if i == 0 else ""}<h3>{t}</h3><p>{d}</p></div>{rep}</article>'
    cre = ''
    for t, s, a, b, c, al in CRE['items']:
        cre += f'<figure tabindex="-1">{pic(b, "Épreuve imprimée du projet " + t, "", 1000, 1244)}<figcaption>{t} · 1, la création</figcaption></figure>'
        cre += f'<figure>{pic(c, "Détail du film sur la carrosserie, projet " + t, "", 1000, 1244)}<figcaption>{t} · 2, l\'intégration</figcaption></figure>'
        cre += f'<figure>{pic(a, al, "", 2000, 1120)}<figcaption>{t} · 3, le résultat · démonstration</figcaption></figure>'
    fl = ''.join(f'<li><b>{a}</b>{b}</li>' for a, b in FLOW['steps'])
    html = head('roam · Immersif', 'family=Geist:wght@400;500&family=Geist+Mono', CSS) + f'''
<header class="bar"><a class="logo" href="#top" aria-label="roam, nom provisoire"><img src="../directions/assets/logo_b.svg" alt="" width="136" height="26"></a><nav class="navl" aria-label="Navigation">{nav_links()}</nav><a class="btn navl" href="#devis">Demander un devis</a><button class="menu" data-menu aria-expanded="false" aria-controls="sheet">Menu</button></header>
{sheet()}
<main id="top">
<section id="film" aria-label="Présentation">
  <span id="concept"></span>
  <div class="fs">
    <img class="po w" loading="lazy" src="film/w/001.webp" alt="Rue pavée d'Anvers la nuit, une voiture rose arrive au loin" width="1280" height="720">
    <img class="po m" loading="lazy" src="film/m/001.webp" alt="Rue pavée d'Anvers la nuit, une voiture rose arrive" width="600" height="1066">
    <canvas id="fc" aria-hidden="true" style="opacity:0"></canvas>
    <div class="st" id="st-a"><p class="tag">{TAG}</p><h1 class="h">La ville bouge.<br>Votre marque aussi.</h1><p class="s">{SUB}</p><div class="acts"><a class="btn r" href="#devis">Demander un devis</a><a class="btn" href="#expertise">Notre expertise</a></div></div>
    <div class="st c off" id="st-b"><p class="tag">Notre concept</p><h2 class="h">{CONCEPT["t"]}</h2><p class="s">{CONCEPT["p"]}</p><div class="pts">{pts}</div></div>
    <i class="bar-p" aria-hidden="true"></i>
  </div>
</section>
<section id="expertise" aria-label="{EXP["t"]}">{pn}</section>
<section class="fmt" id="formats" data-formats aria-labelledby="ft-h"><h2 class="h" id="ft-h">{FMT["t"]}</h2><p>{FMT["p"]}</p>{F["tabs"]}<div id="fpanel" role="tabpanel" aria-labelledby="ft1" tabindex="0">{F["car"]}<div class="fd">{F["desc"]}{F["incl"]}{F["note"]}</div></div></section>
<section class="zon" id="zones" data-zones data-dot="rgba(237,238,247,.2)" data-on="#FF2E8B" data-pill="#EDEEF7" data-pilltx="#05060C" data-mark="#EDEEF7" data-halo="#05060C" data-font="Geist,sans-serif" aria-labelledby="zt"><div><h2 class="h" id="zt">{ZON["t"]}</h2><p class="in">{ZON["p"]}</p>{zones_controls()}</div><div class="mp">{zones_map()}{zones_sum("btn r")}</div></section>
<section class="cre" id="creations" aria-labelledby="ct"><header><h2 class="h" id="ct">{CRE["t"]}</h2><p>{CRE["p"]}</p></header><div class="railx" tabindex="0" role="region" aria-label="Démonstrations, défilement horizontal">{cre}</div></section>
<section class="flo" id="parcours" aria-labelledby="pt"><h2 class="h" id="pt">{FLOW["t"]}</h2><ol class="fl"><i class="l" aria-hidden="true"></i>{fl}</ol></section>
<section class="ask" id="devis" aria-labelledby="at"><img loading="lazy" src="../shared/img/im_end.webp" alt="" aria-hidden="true" width="1280" height="720"><div class="box"><div class="sd"><h2 class="h" id="at">{ASK["t"]}</h2><p>{ASK["p"]}</p><p class="lab">{ASK["small"]}</p></div>{quote_form("btn r")}</div></section>
</main>
{footer()}
<script src="../shared/be.js"></script><script src="../shared/site.js"></script><script>{JS}</script>
</body></html>'''
    return html
