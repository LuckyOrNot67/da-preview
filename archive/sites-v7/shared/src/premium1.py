from content import *

CSS = BASE + r'''
:root{--ci:#D6EA12;--ink:#0B0C06;--g:clamp(16px,2.2vw,32px);--f:"Archivo",system-ui,sans-serif;--acc:#0B0C06}
body{background:var(--ci);color:var(--ink);font:500 17px/1.4 var(--f)}
.h{font-weight:800;font-variation-settings:"wdth" 118;letter-spacing:-.055em;line-height:.98}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:0 24px;border-radius:999px;background:var(--ink);color:var(--ci);font-weight:600;font-size:16px;text-decoration:none}
.btn.i{background:var(--ci);color:var(--ink)}
.logo{font:900 30px/1 var(--f);font-variation-settings:"wdth" 125;letter-spacing:-.06em;text-decoration:none}
.bar{position:absolute;z-index:5;left:var(--g);right:var(--g);top:clamp(14px,2vw,26px);display:flex;justify-content:space-between;align-items:center;gap:20px}
.navl{display:flex;gap:clamp(14px,2vw,28px);font-weight:600;font-size:15px}
.navl a{text-decoration:none}.navl a:hover{text-decoration:underline;text-underline-offset:4px}
.menu{min-height:46px;padding:0 18px;border-radius:999px;background:var(--ink);color:var(--ci);font-weight:600;font-size:15px}
.sheet{background:var(--ci)}
.sheet a{font-size:clamp(30px,9vw,54px);font-weight:800;font-variation-settings:"wdth" 118;letter-spacing:-.05em;text-decoration:none}

/* héros : la composition de Premium V1 */
.hero{position:relative;height:100svh;min-height:620px;overflow:hidden}
.ph{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:100% 100%}
.ph.m{display:none}
.hero h1{position:absolute;z-index:2;left:var(--g);top:20svh;white-space:nowrap;font-size:min(6.1vw,14svh)}
.hero h1 span{display:block}
.dot{display:inline-block;width:.2em;height:.2em;margin-left:.04em;border-radius:50%;background:currentColor;animation:roll 1.5s cubic-bezier(.16,.84,.3,1) .35s both}
@keyframes roll{from{transform:translateX(var(--from,70vw))}to{transform:none}}
.lede{position:absolute;z-index:2;left:var(--g);top:calc(20svh + min(6.1vw,14svh)*2.1);width:min(36vw,520px);font-size:clamp(17px,1.35vw,20px);line-height:1.35}
.lede .btn{margin-top:18px}
.four{position:absolute;z-index:2;left:var(--g);bottom:clamp(18px,3vh,32px);width:min(46vw,640px);display:grid;grid-template-columns:repeat(4,auto);justify-content:space-between;gap:12px;padding-top:12px;border-top:1.5px solid var(--ink);font-weight:600;font-size:clamp(14px,1.15vw,17px)}

/* concept : noir, une phrase, un détail */
.con{position:relative;display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);background:var(--ink);color:var(--ci)}
.con .tx{padding:clamp(80px,14vh,150px) var(--g);align-self:center}
.con h2{font-size:min(5.6vw,12svh)}
.con p{margin-top:20px;max-width:46ch;color:#EEF2C8;font-size:clamp(18px,1.4vw,21px);line-height:1.35}
.con img{width:100%;height:100%;object-fit:cover;min-height:70svh}
.pts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:clamp(30px,6vh,56px)}
.pts b{display:block;font-weight:700;font-size:16px;line-height:1.2}
.pts span{display:block;margin-top:3px;font-size:15px;line-height:1.3;font-weight:400;color:#EEF2C8}

/* expertise : une liste, rien d'autre */
.exp{padding:clamp(80px,14vh,150px) var(--g)}
.exp .h{font-size:min(5.6vw,12svh)}
.rows{margin-top:clamp(30px,6vh,56px);border-top:1.5px solid var(--ink)}
.rows li{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:12px 32px;align-items:baseline;padding:clamp(16px,2.8vh,26px) 0;border-bottom:1.5px solid var(--ink)}
.rows b{font-weight:800;font-variation-settings:"wdth" 112;letter-spacing:-.04em;font-size:clamp(25px,3vw,50px);line-height:1.05}
.rows span{font-size:clamp(17px,1.3vw,19px);line-height:1.35}

/* formats */
.fmt{padding:clamp(80px,14vh,140px) var(--g);background:var(--ink);color:var(--ci);--acc:#D6EA12}
.fmt .h{font-size:min(5.6vw,12svh)}
.fmt>p{margin-top:12px;max-width:46ch;color:#EEF2C8}
.tabs{display:flex;gap:clamp(18px,3vw,44px);margin-top:26px}
.tabs button{padding:6px 0 8px;font-weight:700;font-size:clamp(18px,1.7vw,24px);opacity:.6;border-bottom:3px solid transparent;transition:opacity .2s,border-color .2s}
.tabs button[aria-selected=true]{opacity:1;border-color:var(--ci)}
.fmt .fcar{width:min(100%,120svh);margin:26px auto 0}
.fd{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px 30px;align-items:end;margin-top:22px}
.fd h3{font-weight:700;font-size:clamp(20px,1.7vw,25px)}
.incl{margin-top:8px;font-size:15px}
.note{font-size:14px;line-height:1.4;color:#EEF2C8;font-weight:400;margin-top:10px;max-width:60ch}

/* zones */
.zon{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(24px,5vw,80px);padding:clamp(80px,14vh,140px) var(--g);align-items:center}
.zon .h{font-size:min(5.6vw,12svh)}
.zon .in{margin-top:12px;max-width:44ch}
.opt legend{font-size:14px;font-weight:600}
.chips span{border-bottom:2px solid rgba(11,12,6,.3);padding:0 2px;margin-right:8px;font-weight:600;font-size:16px}
.chips input:checked+span{border-color:var(--ink);box-shadow:inset 0 -6px 0 -4px var(--ink)}
.chips span{opacity:.68}.chips input:checked+span{opacity:1}
.legend{margin-top:10px;font-size:14px}
.legend .a:before{border:1.5px solid var(--ink)}.legend .b:before{background:var(--ink)}.legend .c:before{border:1.5px dashed var(--ink)}
.sum{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1.5px solid var(--ink)}
.sum p{max-width:46ch;font-weight:600}
.zon .note{color:var(--ink)}

/* créations */
.cre{padding:clamp(80px,14vh,140px) var(--g);background:var(--ink);color:var(--ci)}
.cre header{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap}
.cre .h{font-size:min(5.6vw,12svh)}
.cre header p{max-width:44ch;color:#EEF2C8}
.pj{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,1fr);gap:12px;margin-top:clamp(28px,5vh,46px)}
.pj figure{overflow:hidden}
.pj .a{grid-row:1/3}
.pj .a img{width:100%;height:100%;object-fit:cover}
.pj .b img{width:100%;aspect-ratio:1/.8;object-fit:cover}
.pi{display:flex;justify-content:space-between;gap:16px;margin-top:10px}
.pi b{font-weight:700}.pi span{font-size:14px;color:#EEF2C8;font-weight:400}

/* parcours */
.flo{padding:clamp(80px,14vh,140px) var(--g)}
.flo .h{font-size:min(5.6vw,12svh)}
.six{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(24px,5vw,80px);margin-top:clamp(30px,6vh,56px);counter-reset:s}
.six li{display:grid;grid-template-columns:44px 1fr;padding:14px 0 18px;border-top:1.5px solid var(--ink);counter-increment:s}
.six li:before{content:counter(s);font-weight:800;font-size:20px}
.six b{display:block;font-weight:800;font-size:clamp(19px,1.6vw,23px);line-height:1.2}
.six span{display:block;grid-column:2;margin-top:3px;font-size:16px;line-height:1.35;font-weight:400}

/* devis */
.ask{padding:clamp(80px,14vh,140px) var(--g);background:var(--ink);color:var(--ci);display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(24px,5vw,80px)}
.ask h2{font-size:min(4.8vw,11svh)}
.ask .sd p{margin-top:14px;max-width:40ch;color:#EEF2C8}
.ask .sd .sm{font-size:14px;font-weight:400}
form label{font-size:14px;font-weight:600}
form input,form select,form textarea{background:transparent;border:0;border-bottom:2px solid var(--ci);color:var(--ci);padding:10px 0}
form select option{color:var(--ink)}
form input:focus,form select:focus,form textarea:focus{outline:0;box-shadow:0 2px 0 0 var(--ci)}
footer{background:var(--ink);color:#EEF2C8;border-top:1px solid #33350F;font-weight:400}

@media (max-aspect-ratio:1/1){
  .ph.w{display:none}
  .ph.m{display:block;height:auto;top:auto;bottom:0}
  .logo{font-size:27px}
  .hero{min-height:640px}
  .hero h1{top:80px;font-size:11.8vw}
  .dot{--from:62vw}
  .lede{top:calc(80px + 11.8vw*2.05);left:var(--g);right:var(--g);width:auto;font-size:18px}
  .lede .btn{width:100%;min-height:54px;margin-top:14px}
  .four{display:none}
  .con{display:block}
  .con img{height:auto;min-height:0;aspect-ratio:1/1;object-position:50% 30%}
  .con h2,.exp .h,.fmt .h,.zon .h,.cre .h,.flo .h{font-size:9.6vw}
  .ask h2{font-size:11vw}
  .pts{grid-template-columns:1fr}
  .rows li{grid-template-columns:1fr}
  .fd{grid-template-columns:1fr}
  .zon{display:block}.zon .mp{margin-top:26px}
  .pj{grid-template-columns:1fr 1fr}
  .pj .a{grid-row:auto;grid-column:1/3}
  .pj .a img{aspect-ratio:4/3;height:auto}
  .six{grid-template-columns:1fr}
  .ask{display:block}.ask form{margin-top:26px}
  .tabs{justify-content:space-between}
}
'''


def build():
    F = fmt_block('v1')
    pts = ''.join(f'<div><b>{a}</b><span>{b}</span></div>' for a, b in CONCEPT['pts'])
    rows = ''.join(f'<li class="rv"><b>{a}</b><span>{b}</span></li>' for a, b in EXP['items'])
    pj = ''
    for t, s, a, b, c, al in CRE['items']:
        pj += f'<div class="pj rv"><figure class="a">{pic(a, al, "", 2000, 1120)}</figure><figure class="b">{pic(b, "Épreuve imprimée du projet " + t, "", 1000, 1244)}</figure><figure class="b">{pic(c, "Détail du film, projet " + t, "", 1000, 1244)}</figure></div><div class="pi"><b>{t}</b><span>Démonstration · {s}</span></div>'
    six = ''.join(f'<li><b>{a}</b><span>{b}</span></li>' for a, b in FLOW['steps'])
    return head('roam · Premium V1', 'family=Archivo:wdth,wght@62..125,400..900', CSS) + f'''
<main id="top">
<section class="hero" aria-label="Présentation">
  <img class="ph w" loading="lazy" src="../shared/img/v1_hero.webp" alt="Berline habillée de citron mat dans un studio de la même couleur" width="2800" height="1568">
  <img class="ph m" loading="lazy" src="../shared/img/v1_hero_m.webp" alt="Berline habillée de citron mat, vue de l'arrière" width="1200" height="2142">
  <header class="bar"><a class="logo" href="#top" aria-label="roam, nom provisoire">roam.</a><nav class="navl" aria-label="Navigation">{nav_links()}</nav><a class="btn navl" href="#devis" style="min-height:46px;padding:0 20px;font-size:15px">Demander un devis</a><button class="menu" data-menu aria-expanded="false" aria-controls="sheet">Menu</button></header>
  <h1 class="h"><span>Votre marque,</span><span>en circulation<i class="dot" aria-hidden="true"></i></span></h1>
  <div class="lede"><p>{SUB}</p><a class="btn" href="#devis">Demander un devis</a></div>
  <ul class="four" aria-label="Nos métiers"><li>Création</li><li>Covering</li><li>Diffusion</li><li>Suivi</li></ul>
</section>
{sheet()}
<section class="con" id="concept" aria-labelledby="c-t"><div class="tx"><h2 class="h rv" id="c-t">{CONCEPT["t"]}</h2><p class="rv">{CONCEPT["p"]}</p><div class="pts rv">{pts}</div></div>{pic("v1_detail", "Détail d'une portière habillée de citron mat", "", 896, 1120)}</section>
<section class="exp" id="expertise" aria-labelledby="e-t"><h2 class="h rv" id="e-t">{EXP["t"]}.</h2><ol class="rows">{rows}</ol></section>
<section class="fmt" id="formats" data-formats aria-labelledby="ft-h"><h2 class="h" id="ft-h">{FMT["t"]}</h2><p>{FMT["p"]}</p>{F["tabs"]}<div id="fpanel" role="tabpanel" aria-labelledby="ft1" tabindex="0">{F["car"]}<div class="fd"><div>{F["desc"]}{F["incl"]}{F["note"]}</div><a class="btn i" href="#devis">Demander un devis</a></div></div></section>
<section class="zon" id="zones" data-zones data-dot="rgba(11,12,6,.2)" data-on="#0B0C06" data-pill="#0B0C06" data-pilltx="#D6EA12" data-mark="#0B0C06" data-halo="#D6EA12" data-font="Archivo,sans-serif" aria-labelledby="zt"><div><h2 class="h" id="zt">{ZON["t"]}</h2><p class="in">{ZON["p"]}</p>{zones_controls()}</div><div class="mp">{zones_map()}{zones_sum()}</div></section>
<section class="cre" id="creations" aria-labelledby="ct"><header><h2 class="h" id="ct">{CRE["t"]}</h2><p>{CRE["p"]}</p></header>{pj}</section>
<section class="flo" id="parcours" aria-labelledby="pt"><h2 class="h rv" id="pt">{FLOW["t"]}</h2><ol class="six">{six}</ol></section>
<section class="ask" id="devis" aria-labelledby="at"><div class="sd"><h2 class="h" id="at">{ASK["t"]}</h2><p>{ASK["p"]}</p><p class="sm">{ASK["small"]}</p></div>{quote_form("btn i")}</section>
</main>
{footer()}
<script src="../shared/be.js"></script><script src="../shared/site.js"></script>
</body></html>'''
