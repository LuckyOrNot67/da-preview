from content import *

CSS = BASE + r'''
:root{--ci:#D6EA12;--ci-w:#D2EB0A;--ci-m:#DCEF10;--ci-r:#DAEE18;--ink:#0B0C06;--paper:#F7F8EE;--g:clamp(16px,2.2vw,32px);--f:"Archivo",system-ui,sans-serif;--acc:#0B0C06}
body{background:var(--paper);color:var(--ink);font:400 17px/1.42 var(--f)}
.h{font-weight:800;font-variation-settings:"wdth" 118;letter-spacing:-.05em;line-height:.98}
.tag{display:inline-block;padding:5px 9px;background:var(--ink);color:var(--ci);font-weight:600;font-size:14px;line-height:1.2}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 24px;border-radius:999px;background:var(--ink);color:var(--ci);font-weight:600;font-size:16px;text-decoration:none}
.btn.i{background:var(--ci);color:var(--ink)}
.logo{font:900 30px/1 var(--f);font-variation-settings:"wdth" 125;letter-spacing:-.06em;text-decoration:none}
.bar{position:fixed;z-index:80;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:10px var(--g);background:rgba(247,248,238,0);transition:background .25s}
.bar.s{background:var(--paper);box-shadow:0 1px 0 rgba(11,12,6,.14)}
.navl{display:flex;gap:clamp(14px,2vw,28px);font-weight:600;font-size:15px}
.navl a{text-decoration:none}.navl a:hover{text-decoration:underline;text-underline-offset:4px}
.menu{min-height:44px;padding:0 16px;border-radius:999px;background:var(--ink);color:var(--ci);font-weight:600;font-size:15px}
.sheet{background:var(--paper)}
.sheet a{font-size:clamp(30px,9vw,54px);font-weight:800;font-variation-settings:"wdth" 118;letter-spacing:-.05em;text-decoration:none}

/* héros : les feux s'allument, la voiture est prête à partir */
.hero{position:relative;height:100svh;min-height:620px;overflow:hidden;background:var(--ci-w)}
.pic{position:absolute;right:-3vw;bottom:0;width:max(103vw,180svh);aspect-ratio:2800/1568;-webkit-mask-image:linear-gradient(transparent,#000 12%);mask-image:linear-gradient(transparent,#000 12%)}
.pic img{position:absolute;inset:0;width:100%;height:100%}
.pic .on{inset:auto;left:25.75%;top:26.15%;width:68.14%;height:auto;animation:lamp 1.1s ease .6s both}
.pic.m{display:none}
@keyframes lamp{0%{opacity:0}18%{opacity:.75}30%{opacity:.25}100%{opacity:1}}
.lead{position:absolute;z-index:2;left:var(--g);top:clamp(84px,12svh,120px);width:min(58vw,880px)}
.lead h1{margin-top:16px;font-size:min(6.2vw,14svh)}
.lead .s{margin-top:16px;max-width:29ch;font-size:clamp(17px,1.4vw,21px);line-height:1.32;font-weight:500}
.lead .btn{margin-top:20px}

/* concept */
.con{background:var(--ci-r);padding:clamp(70px,11vh,120px) var(--g) clamp(40px,7vh,70px)}
.ch{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:20px clamp(24px,4vw,70px);align-items:end}
.ch h2{font-size:min(5.2vw,11svh);margin-top:14px}
.ch p{font-size:clamp(17px,1.35vw,20px);line-height:1.35;font-weight:500}
.net{display:block;width:min(100%,128svh);margin:-1vh auto -5vh;-webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent),linear-gradient(transparent,#000 16%,#000 84%,transparent);mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent),linear-gradient(transparent,#000 16%,#000 84%,transparent);-webkit-mask-composite:source-in;mask-composite:intersect}
.pts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(12px,1.6vw,24px)}
.pts div{padding-top:10px;border-top:2px solid var(--ink)}
.pts b{display:block;font-weight:800;font-variation-settings:"wdth" 112;letter-spacing:-.03em;font-size:clamp(18px,1.6vw,23px);line-height:1.15}
.pts span{display:block;margin-top:5px;font-size:16px;line-height:1.3}

/* expertise : la photo suit le métier choisi */
.exp{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(24px,4vw,60px);padding:clamp(70px,11vh,120px) var(--g);align-items:start}
.exp h2{font-size:min(5.2vw,11svh);margin-top:14px}
.acc{margin-top:22px;border-top:1.5px solid var(--ink)}
.acc li{border-bottom:1.5px solid var(--ink)}
.acc button{display:flex;justify-content:space-between;align-items:center;gap:12px;width:100%;min-height:60px;padding:12px 0;text-align:left;font-weight:800;font-variation-settings:"wdth" 112;letter-spacing:-.03em;font-size:clamp(19px,1.8vw,26px);line-height:1.15}
.acc button:after{content:"+";font-weight:500;font-variation-settings:"wdth" 100;transition:transform .2s}
.acc button[aria-expanded=true]:after{transform:rotate(45deg)}
.acc .d{display:none;padding:0 0 14px;max-width:44ch}
.acc .open .d{display:block}
.acc .mi{display:none}
.stagei{position:sticky;top:88px;aspect-ratio:3/2}
.stagei>*{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .4s ease}
.stagei>.on{opacity:1}
.rep{display:flex;flex-direction:column;padding:clamp(16px,2vw,28px);background:var(--ink);color:var(--ci)}
.rep .hd{display:flex;justify-content:space-between;gap:12px;padding-bottom:12px;border-bottom:1.5px solid var(--ci);font-size:14px;font-weight:600}
.rep dl{flex:1;margin:0;display:grid;grid-template-columns:1fr 1fr;gap:0 24px}
.rep dl div{display:flex;flex-direction:column;justify-content:space-between;padding:14px 0;border-bottom:1px solid rgba(214,234,18,.3)}
.rep dt{font-size:14px}
.rep dd{margin:0;font-weight:800;font-variation-settings:"wdth" 112;font-size:clamp(28px,3vw,46px);letter-spacing:-.03em}

/* formats */
.fmt{padding:clamp(70px,11vh,120px) var(--g) clamp(44px,7vh,80px);background:#fff}
.fmt .top{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap}
.fmt .h{font-size:min(5.2vw,11svh);margin-top:14px}
.fmt .top p{max-width:34ch}
.tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:22px;padding:4px;border:1.5px solid var(--ink);border-radius:999px}
.tabs button{min-height:46px;border-radius:999px;font-weight:600;transition:background .2s,color .2s}
.tabs button[aria-selected=true]{background:var(--ink);color:var(--ci)}
.fmt .fcar{width:min(100%,112svh);margin:24px auto 0}
.fmt .fcar:before{content:"";position:absolute;left:6%;right:6%;bottom:-1%;height:5%;border-radius:50%;background:#000;filter:blur(10px);opacity:.26}
.fd{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr) auto;gap:14px 40px;align-items:end;margin-top:24px}
.fd h3{font-weight:700;font-size:clamp(20px,1.7vw,25px)}
.incl{margin-top:8px;font-size:15px}
.note{font-size:14px;line-height:1.4}

/* zones */
.zon{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(24px,5vw,80px);padding:clamp(70px,11vh,120px) var(--g);background:var(--ink);color:var(--paper);align-items:center}
.zon .h{font-size:min(5.2vw,11svh);color:var(--ci);margin-top:14px}
.zon .tag{background:var(--ci);color:var(--ink)}
.zon .in{margin-top:10px;max-width:44ch}
.opt legend{font-size:14px;font-weight:600}
.chips span{border:1.5px solid rgba(247,248,238,.42);border-radius:999px;font-size:15px;font-weight:500}
.chips input:checked+span{background:var(--ci);border-color:var(--ci);color:var(--ink)}
@media (hover:hover){.chips label:hover span{border-color:var(--paper)}}
.legend{margin-top:10px;font-size:14px}
.legend .a:before{border:1.5px solid var(--paper)}.legend .b:before{background:var(--ci)}.legend .c:before{border:1.5px dashed var(--paper)}
.sum{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1.5px solid rgba(247,248,238,.4)}
.sum p{max-width:46ch;font-weight:500}
.zon .note{margin-top:10px}

/* créations */
.cre{padding:clamp(70px,11vh,120px) var(--g)}
.cre header{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap}
.cre .h{font-size:min(5.2vw,11svh);margin-top:14px}
.cre header p{max-width:42ch}
.gal{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(14px,2vw,28px);margin-top:clamp(26px,5vh,46px)}
.pj .r{aspect-ratio:16/10;width:100%;object-fit:cover}
.pj .sm{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.pj .sm img{width:100%;aspect-ratio:1/.72;object-fit:cover}
.pj p{display:flex;justify-content:space-between;gap:14px;margin-top:10px}
.pj b{font-weight:800;font-variation-settings:"wdth" 112;letter-spacing:-.03em;font-size:20px}
.pj span{font-size:14px}

/* parcours */
.flo{padding:clamp(70px,11vh,120px) var(--g);background:var(--ci-r)}
.flo .h{font-size:min(5.2vw,11svh)}
.six{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(26px,4.4vh,44px) clamp(14px,2vw,28px);margin-top:clamp(30px,6vh,56px);counter-reset:s}
.six li{padding-top:10px;border-top:2px solid var(--ink);counter-increment:s}
.six li:before{content:counter(s);display:block;font-weight:800;font-size:15px;margin-bottom:clamp(14px,3vh,30px)}
.six b{display:block;font-weight:800;font-variation-settings:"wdth" 112;letter-spacing:-.03em;font-size:clamp(21px,2.1vw,32px);line-height:1.08}
.six span{display:block;margin-top:6px;max-width:32ch}

/* devis */
.ask{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);background:var(--ink);color:var(--paper)}
.ask .im{position:relative;min-height:100%}
.ask .im img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ask .bx{padding:clamp(60px,10vh,110px) var(--g)}
.ask h2{font-size:min(4.6vw,10svh);color:var(--ci)}
.ask .bx>p{margin-top:12px;max-width:44ch}
.ask .bx>p.sm{font-size:14px}
.ask form{margin-top:22px}
form label{font-size:14px;font-weight:600}
form input,form select,form textarea{background:#17190F;border:1.5px solid #3D4024;color:var(--paper)}
form input:focus,form select:focus,form textarea:focus{outline:0;border-color:var(--ci)}
.err,.send p{color:var(--ci)}
footer{background:var(--ink);color:#C8CAB4;border-top:1px solid #2C2E1A}

@media (max-width:980px),(max-aspect-ratio:1/1){
  .exp{display:block}
  .stagei{display:none}
  .acc .mi{display:block;width:100%;aspect-ratio:3/2;object-fit:cover;margin-bottom:10px}
  .acc .rep.mi{height:auto;aspect-ratio:auto}
  .fd{grid-template-columns:1fr}
}
@media (max-aspect-ratio:1/1){
  .hero{background:var(--ci-m);min-height:640px}
  .pic.w{display:none}
  .pic.m{display:block;left:0;right:0;width:100%;aspect-ratio:1200/2142;-webkit-mask-image:linear-gradient(transparent,#000 10%);mask-image:linear-gradient(transparent,#000 10%)}
  .pic.m .on{left:20.33%;top:69.56%;width:78.17%}
  .logo{font-size:27px}
  .lead{left:var(--g);right:var(--g);top:70px;width:auto}
  .tag{font-size:13.5px}
  .lead h1{margin-top:14px;font-size:11.5vw}
  .lead .s{margin-top:12px;max-width:none;font-size:18px}
  .lead .btn{margin-top:14px;width:100%;min-height:54px;font-size:17px}
  .ch{grid-template-columns:1fr}
  .ch h2,.exp h2,.fmt .h,.zon .h,.cre .h,.flo .h{font-size:9.6vw}
  .ask h2{font-size:10vw}
  .net{width:calc(100% + var(--g)*2);max-width:none;margin:-14px calc(var(--g)*-1) -14px}
  .pts{grid-template-columns:1fr;gap:12px}
  .zon{display:block}.zon .mp{margin-top:26px}
  .gal{grid-template-columns:1fr}
  .six{grid-template-columns:1fr;gap:0}
  .six li{display:grid;grid-template-columns:30px 1fr;padding:12px 0 16px;border-top:1.5px solid var(--ink)}
  .six li:before{margin:0;padding-top:3px}
  .six span{grid-column:2}
  .ask{display:block}.ask .im{height:44svh}
}
'''

JS = r'''
(()=>{
const bar=document.querySelector('.bar'),on=()=>bar.classList.toggle('s',scrollY>innerHeight*.85);
addEventListener('scroll',on,{passive:true});on();
const bs=[...document.querySelectorAll('.acc button')],im=[...document.querySelectorAll('.stagei>*')];
const set=n=>{bs.forEach((b,k)=>{b.setAttribute('aria-expanded',k===n);b.closest('li').classList.toggle('open',k===n)});im.forEach((m,k)=>m.classList.toggle('on',k===n))};
bs.forEach((b,k)=>b.addEventListener('click',()=>set(k)));set(0);
})();
'''


def build():
    F = fmt_block('v2')
    pts = ''.join(f'<div><b>{a}</b><span>{b}</span></div>' for a, b in CONCEPT['pts'])
    REP = lambda c: f'<div class="rep {c}" role="img" aria-label="Modèle de rapport sans données"><div class="hd"><span>Rapport de campagne</span><span>Modèle sans données</span></div><dl><div><dt>Kilomètres éligibles</dt><dd>— km</dd></div><div><dt>Zones couvertes</dt><dd>—</dd></div></dl></div>'
    ims = [('v2_proof', "Mur d'épreuves citron et noires dans un studio"), ('p1_detail', "Détail d'un visuel adapté aux lignes de la carrosserie"), ('v2_pose', 'Mains posant un film citron sur une portière'), ('v2_top', "Voiture citron vue du dessus sur une route")]
    acc = ''
    for i, (a, b) in enumerate(EXP['items']):
        mi = pic(ims[i][0], ims[i][1], 'mi', 1024, 688) if i < 4 else REP('mi')
        acc += f'<li><h3><button type="button" aria-expanded="false" aria-controls="d{i}">{a}</button></h3><div class="d" id="d{i}">{mi}<p>{b}</p></div></li>'
    st = ''.join(pic(n, a, '', 1024, 688) for n, a in ims) + REP('')
    gal = ''
    for t, s, a, b, c, al in CRE['items']:
        gal += f'<article class="pj rv">{pic(a, al, "r", 2000, 1120)}<div class="sm">{pic(b, "Épreuve imprimée du projet " + t, "", 1000, 1244)}{pic(c, "Détail du film, projet " + t, "", 1000, 1244)}</div><p><b>{t}</b><span>Démonstration · {s}</span></p></article>'
    six = ''.join(f'<li><b>{a}</b><span>{b}</span></li>' for a, b in FLOW['steps'])
    return head('roam · Premium V2', 'family=Archivo:wdth,wght@62..125,400..900', CSS) + f'''
<header class="bar"><a class="logo" href="#top" aria-label="roam, nom provisoire">roam.</a><nav class="navl" aria-label="Navigation">{nav_links()}</nav><a class="btn navl" href="#devis" style="min-height:44px;padding:0 20px;font-size:15px">Demander un devis</a><button class="menu" data-menu aria-expanded="false" aria-controls="sheet">Menu</button></header>
{sheet()}
<main id="top">
<section class="hero" aria-label="Présentation">
  <div class="pic w"><img loading="lazy" src="../shared/img/v2_hero_off.webp" alt="Berline habillée de citron dans un studio de la même couleur" width="2800" height="1568"><img class="on" loading="lazy" src="../shared/img/v2_hero_on.webp" alt="" aria-hidden="true"></div>
  <div class="pic m"><img loading="lazy" src="../shared/img/v2_hero_m_off.webp" alt="Berline habillée de citron, vue de face" width="1200" height="2142"><img class="on" loading="lazy" src="../shared/img/v2_hero_m_on.webp" alt="" aria-hidden="true"></div>
  <div class="lead"><p class="tag">{TAG}</p><h1 class="h">Votre marque,<br>en circulation.</h1><p class="s">{SUB}</p><a class="btn" href="#devis">Imaginer ma campagne</a></div>
</section>
<section class="con" id="concept" aria-labelledby="c-t"><div class="ch"><div><p class="tag">Notre concept</p><h2 class="h" id="c-t">{CONCEPT["t"]}</h2></div><p>{CONCEPT["p"]}</p></div>{pic("v2_reseau", "Une citadine, une compacte et une fourgonnette habillées de citron", "net", 1344, 752)}<div class="pts">{pts}</div></section>
<section class="exp" id="expertise" aria-labelledby="e-t"><div><p class="tag">Ce que nous faisons</p><h2 class="h" id="e-t">{EXP["t"]}.</h2><ul class="acc">{acc}</ul></div><div class="stagei" aria-hidden="true">{st}</div></section>
<section class="fmt" id="formats" data-formats aria-labelledby="ft-h"><div class="top"><div><p class="tag">Formats</p><h2 class="h" id="ft-h">{FMT["t"]}</h2></div><p>{FMT["p"]}</p></div>{F["tabs"]}<div id="fpanel" role="tabpanel" aria-labelledby="ft1" tabindex="0">{F["car"]}<div class="fd"><div>{F["desc"]}{F["incl"]}</div>{F["note"]}<a class="btn" href="#devis">Demander un devis</a></div></div></section>
<section class="zon" id="zones" data-zones data-dot="rgba(247,248,238,.24)" data-on="#D6EA12" data-pill="#F7F8EE" data-pilltx="#0B0C06" data-mark="#F7F8EE" data-halo="#0B0C06" data-font="Archivo,sans-serif" aria-labelledby="zt"><div><p class="tag">Ciblage</p><h2 class="h" id="zt">{ZON["t"]}</h2><p class="in">{ZON["p"]}</p>{zones_controls()}</div><div class="mp">{zones_map()}{zones_sum("btn i")}</div></section>
<section class="cre" id="creations" aria-labelledby="ct"><header><div><p class="tag">Démonstrations</p><h2 class="h" id="ct">{CRE["t"]}</h2></div><p>{CRE["p"]}</p></header><div class="gal">{gal}</div></section>
<section class="flo" id="parcours" aria-labelledby="pt"><h2 class="h" id="pt">{FLOW["t"]}</h2><ol class="six">{six}</ol></section>
<section class="ask" id="devis" aria-labelledby="at"><div class="im">{pic("v2_ville", "Berline citron sur un boulevard de Bruxelles", "", 1344, 752)}</div><div class="bx"><h2 class="h" id="at">{ASK["t"]}</h2><p>{ASK["p"]}</p><p class="sm">{ASK["small"]}</p>{quote_form("btn i")}</div></section>
</main>
{footer()}
<script src="../shared/be.js"></script><script src="../shared/site.js"></script><script>{JS}</script>
</body></html>'''
