# Génère la maquette : une page, plusieurs variantes par section, choisies dans le panneau de réglages.
import pathlib,json
ROOT=pathlib.Path(__file__).resolve().parent.parent
TXT='Nous créons vos campagnes, habillons des véhicules et les faisons circuler dans vos zones.'
CAR='<img src="img/hero.webp" alt="Berline habillée d\'une composition noire et blanche" width="2600" height="1188">'
BTN='<a class="btn" href="#contact"><span class="rl" data-t="Créer ma campagne">Créer ma campagne</span></a>'
HERO=[f'''<section class="h1g" aria-label="Présentation"><h1><span class="ln"><span>Votre marque,</span></span><span class="ln"><span>en circulation.</span></span></h1><div class="art">{CAR}</div><div class="foot"><p>{TXT}</p>{BTN}</div></section>''']
C_T='Des voitures roulent déjà. Autant qu\'elles parlent de vous.'
C_P=[('Votre message','Nous imaginons une campagne pensée pour la route.','p_msg'),('Nos véhicules','Nous l\'installons sur des voitures de particuliers et de flottes d\'entreprise, sous contrat avec nous.','p_car'),('Vos zones','Votre marque circule dans les villes que vous visez.','p_city')]
CONCEPT=['<section class="c2s" aria-label="Notre concept">'+f'<article class="pg p0" style="--i:0"><p class="eye">Notre concept</p><h2 class="huge">{C_T}</h2></article>'+''.join(f'<article class="pg p{i+1}" style="--i:{i+1}"><div class="tx"><span class="n">{i+1}/3</span><h3 class="huge">{t}</h3><p>{d}</p></div><figure><img loading="lazy" src="img/{m}.webp" alt="" width="1600" height="900"></figure></article>' for i,(t,d,m) in enumerate(C_P))+'</section>']
Z=['Arrière','Rétroviseurs','Portes','Capot','Tout le véhicule']
S=[dict(n='Classique',p='La zone arrière et les rétroviseurs.',k=2,col='var(--bg)',ct='var(--ink)',g=['s_a1','s_a2','d_a2_0','d_a1_0','d_a2_1']),
   dict(n='Medium',p='Les portes, l\'arrière, les rétroviseurs et le capot.',k=4,col='#F2600C',ct='#140A02',g=['s_b1','s_b2','d_b1_0','d_b2_0','d_b1_1']),
   dict(n='Complet',p='Toute la voiture, hors vitres.',k=5,col='#1530C8',ct='#fff',g=['s_c1','s_c2','d_c1_0','d_c2_0','d_c1_1'])]
zs=lambda s:'<ul class="zs">'+''.join(f'<li class="{"on" if i<s["k"] else ""}">{z}</li>' for i,z in enumerate(Z))+'</ul>'
G=lambda s:''.join(f'<figure class="g{i}"><img loading="lazy" src="img/{m}.webp" alt="{s["n"]} : {s["p"]}" width="1600" height="900"></figure>' for i,m in enumerate(s["g"]))
F2='<section class="f2"><div class="fst">'+''.join(f'''<article class="fy" style="--c:{s["col"]};--ct:{s["ct"]}"><h3 class="mega">{s["n"]}</h3><div class="fb"><div class="inf"><p class="say">{s["p"]}</p>{zs(s)}</div><div class="gal">{G(s)}</div></div></article>''' for s in S)+'</div></section>'
E=[('Conception graphique','Nous créons vos visuels ou adaptons les vôtres aux surfaces du véhicule.','d_b1_0','Concevoir','<path pathLength="1" d="M4 20l4-1L19 8l-3-3L5 16zM14 7l3 3"/>'),('Covering et pose','Nous préparons, imprimons et posons le film. Les vitres restent libres.','d_c1_1','Poser','<path d="M4 8h16v9H4zM4 12h16"/>'),('Diffusion sur véhicules','Votre campagne circule au quotidien dans les zones définies avec vous.','d_a2_2','Diffuser','<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/>'),('Suivi des campagnes','Vous recevez des rapports sur les données réellement disponibles.','d_b2_1','Suivre','<path d="M4 18l6-6 4 4 6-8"/>')]
HE='<header class="sh"><p class="eye">De l\'idée à la route</p><h2 class="big">Notre expertise</h2></header>'
ICO=lambda ic:f'<svg viewBox="0 0 24 24" aria-hidden="true">{ic}</svg>'
tk=lambda c:''.join(f'<article class="tk {c}"><div class="tki">{ICO(ic)}<h3>{t}</h3><p>{d}</p></div></article>' for t,d,m,w,ic in E)
E1=f'<section class="e1" data-v="1">{HE}<div class="deck">{tk("cl")}</div></section>'
E2=f'<section class="e1" data-v="2">{HE}<div class="deck">{tk("dk")}</div></section>'
MAP=(ROOT/'src/be_path.txt').read_text().strip()
BAR='<div class="stb"><span>9:41</span><i></i></div>'
CH=lambda *x:''.join(f'<b>{c}</b>' for c in x)
SC=[('zones','Vos zones',f'<div class="pscr map">{BAR}<svg class="bemap" viewBox="0 0 256 210"><path d="{MAP}"/><circle cx="121.8" cy="70" r="26"/><circle cx="81.8" cy="50" r="20"/><circle cx="125" cy="33" r="16"/><circle class="d" cx="121.8" cy="70" r="3.4"/><circle class="d" cx="81.8" cy="50" r="3.4"/><circle class="d" cx="125" cy="33" r="3.4"/></svg><div class="shtp"><small>Ma campagne</small><strong>Active</strong><div class="tags">{CH("Bruxelles","Gand","Anvers")}</div></div></div>','Vos zones sur la carte, dès que la campagne démarre.'),
    ('km','Vos kilomètres',f'<div class="pscr">{BAR}<small>Cette semaine</small><strong class="h">Kilomètres</strong><svg class="line" viewBox="0 0 200 110" preserveAspectRatio="none"><path class="ar" d="M0 92C24 88 30 60 54 62s34 16 56-4 30-36 52-34 26 2 38-6V110H0z"/><path class="ln2" d="M0 92C24 88 30 60 54 62s34 16 56-4 30-36 52-34 26 2 38-6"/></svg><div class="days"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div><ul class="lst"><li>Bruxelles<u style="--w:70%"></u></li><li>Gand<u style="--w:48%"></u></li><li>Anvers<u style="--w:34%"></u></li></ul></div>','Le chemin parcouru par votre campagne, zone par zone.'),
    ('public','Votre public',f'<div class="pscr">{BAR}<small>Estimation</small><strong class="h">Public touché</strong><div class="ring"><i></i></div><div class="pbtn">Voir le rapport</div></div>','Une estimation du public touché, et un rapport à garder.'),
    ('mois','Mon mois',f'<div class="pscr">{BAR}<small>Conducteur</small><strong class="h">Mon mois</strong><ul class="chk"><li class="ok">Kilomètres du mois</li><li class="ok">Grandes zones</li><li>Validation</li></ul><div class="pbtn">Valider mon mois</div></div>','Pour les conducteurs : valider ses kilomètres et ses grandes zones.')]
PH=lambda inner:f'<div class="ph" aria-hidden="true"><div class="sc">{inner}</div></div>'
screens=''.join(f'<div class="ps">{h}</div>' for _,_,h,_ in SC)
rows=''.join(f'<li><b>{t}</b><span>{d}</span></li>' for _,t,_,d in SC)
AX=lambda n,c:f'''<section class="ax {c}" data-v="{n}"><div class="stg"><div class="at"><p class="eye">Application mobile</p><h2 class="big">Votre campagne, vos zones, dans votre poche</h2><ol class="ro">{rows}</ol></div>{PH(screens+'<i class="tap"></i>')}</div></section>'''
A1=AX(1,'lt');A2=AX(2,'dk')
t=(ROOT/'src/site_index.html').read_text()
for k,v in (('HERO',HERO),('CONCEPT',CONCEPT),('FORMATS',[F2]),('EXPERTISE',[E1,E2]),('APP',[A1,A2])):
    t=t.replace('{{'+k+'}}','\n'.join(v))
(ROOT/'site/index.html').write_text(t)
