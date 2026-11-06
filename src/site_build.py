# Génère le site : homepage annonceur, page conducteur et page de demande.
import pathlib,json,re
ROOT=pathlib.Path(__file__).resolve().parent.parent
TXT='Agence de publicité sur véhicules : nous concevons votre campagne, habillons des voitures et les faisons circuler dans vos zones.'
CAR='<img src="img/hero.webp" alt="Berline habillée d\'une composition noire et blanche" width="2600" height="1188">'
BTN='<a class="btn" href="demande/"><span class="rl" data-t="Créer ma campagne">Créer ma campagne</span></a><a class="lnk" href="#formats">Voir les formats</a>'
HERO=[f'''<section class="h1g" aria-label="Présentation"><h1><span class="ln"><span>Votre marque,</span></span><span class="ln"><span>en circulation.</span></span></h1><div class="art">{CAR}</div><div class="foot"><p>{TXT}</p>{BTN}</div></section>''']
C_T='Des voitures roulent déjà. Autant qu\'elles parlent de vous.'
WHY=[('Mobile','Votre message traverse plusieurs quartiers au lieu de rester à un seul endroit.'),('Ciblé','Vous choisissez les villes et les zones où vos clients vivent et passent.'),('Complet','Création, pose, diffusion et suivi : un seul interlocuteur.')]
C_P=[('Votre message','Une campagne pensée pour être lue sur la route.','p_msg',['Création complète, ou adaptation de vos visuels','Un message court, lisible de loin','Maquette sur la voiture, validée avant impression']),
     ('Nos véhicules','Des voitures de particuliers et de flottes d\'entreprise, sous contrat avec nous.','p_car',['Des conducteurs qui roulent déjà au quotidien','Pose et retrait organisés par ROAM','Les vitres restent libres']),
     ('Vos zones','Votre marque circule là où vous en avez besoin.','p_city',['Villes et secteurs définis avec vous','Zones confirmées avant le lancement','Suivi dans votre espace annonceur'])]
LI=lambda x:'<ul class="pts">'+''.join(f'<li>{t}</li>' for t in x)+'</ul>'
CONCEPT=['<section class="c2s" aria-label="Notre concept">'+f'<article class="pg p0" style="--i:0"><p class="eye">Notre concept</p><h2 class="huge">{C_T}</h2><p class="lead2">Une affiche attend qu\'on passe devant. Une voiture habillée va à la rencontre des gens, dans les rues que vous visez.</p><ul class="why">'+''.join(f'<li><b>{a}</b><span>{b}</span></li>' for a,b in WHY)+'</ul></article>'+''.join(f'<article class="pg p{i+1}" style="--i:{i+1}"><div class="tx"><span class="n">{i+1}/3</span><h3 class="huge">{t}</h3><p>{d}</p>{LI(l)}</div><figure><img loading="lazy" src="img/{m}.webp" alt="" width="1600" height="900"></figure></article>' for i,(t,d,m,l) in enumerate(C_P))+'</section>']
Z=['Arrière','Rétroviseurs','Portes','Capot','Tout le véhicule']
S=[dict(n='Classique',p='La zone arrière et les rétroviseurs.',k=2,col='var(--bg)',ct='var(--ink)',g=['s_a1','s_a2','d_a2_0','d_a1_0','d_a2_1'],v=1,vt='Ciblée : surtout pour ceux qui suivent la voiture',it='Le format le plus simple pour démarrer',gr='Logo, message court, contact',ct2='Peu de surface : un seul message'),
   dict(n='Medium',p='Les portes, l\'arrière, les rétroviseurs et le capot.',k=4,col='var(--sig)',ct='var(--sigt)',g=['s_b1','s_b2','d_b1_0','d_b2_0','d_b1_1'],v=2,vt='Forte : de face, de côté et de dos',it='Le bon équilibre entre présence et surface',gr='Formes fortes, grand logo, couleurs de marque',ct2='Visuel adapté à chaque modèle de voiture'),
   dict(n='Complet',p='Toute la voiture, hors vitres.',k=5,col='var(--bg2)',ct='var(--ink)',g=['s_c1','s_c2','d_c1_0','d_c2_0','d_c1_1'],v=3,vt='Maximale : la voiture devient le média',it='Pour marquer les esprits sur toute une zone',gr='Composition libre sur toute la carrosserie',ct2='Pose plus longue, vitres et feux toujours libres')]
zs=lambda s:'<ul class="zs">'+''.join(f'<li class="{"on" if i<s["k"] else ""}">{z}</li>' for i,z in enumerate(Z))+'</ul>'
G=lambda s:''.join(f'<figure class="g{i}"><img loading="lazy" src="img/{m}.webp" alt="{s["n"]} : {s["p"]}" width="1600" height="900"></figure>' for i,m in enumerate(s["g"]))
DOT=lambda n:'<i class="dots" aria-hidden="true">'+''.join(f'<u class="{"on" if k<n else ""}"></u>' for k in range(3))+'</i>'
F2='<section class="f2"><div class="fst">'+''.join(f'''<article class="fy" style="--c:{s["col"]};--ct:{s["ct"]}"><h3 class="mega">{s["n"]}</h3><div class="fb"><div class="inf"><p class="say">{s["p"]}</p><dl><dt>Intérêt</dt><dd>{s["it"]}</dd><dt>Visibilité</dt><dd>{DOT(s["v"])}{s["vt"]}</dd><dt>Graphisme</dt><dd>{s["gr"]}</dd><dt>Contraintes</dt><dd>{s["ct2"]}</dd></dl>{zs(s)}<p class="sur">Tarif sur devis, selon le nombre de voitures, la durée et les zones.</p></div><div class="gal">{G(s)}</div></div></article>''' for s in S)+'</div></section>'
E=[('Conception graphique','Nous créons vos visuels ou adaptons les vôtres aux surfaces du véhicule.','d_b1_0','Concevoir','<path pathLength="1" d="M4 20l4-1L19 8l-3-3L5 16zM14 7l3 3"/>'),('Covering et pose','Nous préparons, imprimons et posons le film. Les vitres restent libres.','d_c1_1','Poser','<path d="M4 8h16v9H4zM4 12h16"/>'),('Diffusion sur véhicules','Votre campagne circule au quotidien dans les zones définies avec vous.','d_a2_2','Diffuser','<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/>'),('Suivi des campagnes','Vous recevez des rapports sur les données réellement disponibles.','d_b2_1','Suivre','<path d="M4 18l6-6 4 4 6-8"/>')]
MORE=[['Votre brief et votre objectif','Visuels créés ou adaptés','Maquette sur le modèle de voiture','Validation avant impression'],['Préparation de la voiture','Impression du film','Pose par des professionnels','Retrait en fin de campagne'],['Choix des voitures selon vos zones','Conducteurs sous contrat','Durée définie avec vous','Contrôle de l\'état du covering'],['Zones parcourues','Kilomètres validés','Photos de preuve','Bilan de campagne']]
HE='<header class="sh"><p class="eye">De l\'idée à la route</p><h2 class="big">Notre expertise</h2></header>'
ICO=lambda ic:f'<svg viewBox="0 0 24 24" aria-hidden="true">{ic}</svg>'
tk=lambda c:''.join(f'<article class="tk {c}"><div class="tki">{ICO(ic)}<h3>{t}</h3><p>{d}</p><ul class="more" id="{c}m{i}" hidden>'+''.join(f'<li>{x}</li>' for x in MORE[i])+f'</ul><button class="tkb" aria-expanded="false" aria-controls="{c}m{i}"><span>Voir le détail</span><b aria-hidden="true">+</b></button></div></article>' for i,(t,d,m,w,ic) in enumerate(E))
E1=f'<section class="e1" data-v="1">{HE}<div class="deck">{tk("cl")}</div></section>'
E2=f'<section class="e1" data-v="2">{HE}<div class="deck">{tk("dk")}</div></section>'
MAP=(ROOT/'src/be_path.txt').read_text().strip()
BAR='<div class="stb"><span>9:41</span><i></i></div>'
CH=lambda *x:''.join(f'<b>{c}</b>' for c in x)
ROW=lambda a:f'<li>{a}<i>›</i></li>'
SC=[('Votre espace annonceur','Un seul endroit pour suivre votre campagne, du lancement au bilan.',f'<div class="pscr">{BAR}<small>Espace annonceur</small><strong class="h">Ma campagne</strong><figure class="thumb"><img src="img/s_a1.webp" alt="" width="2200" height="1238"></figure><ul class="nav2">{ROW("Zones")}{ROW("Kilomètres")}{ROW("Rapports")}</ul></div>'),
    ('Vos zones','Voyez où circule votre campagne : villes et grands secteurs, jamais le trajet individuel d\'un conducteur.',f'<div class="pscr map">{BAR}<svg class="bemap" viewBox="0 0 256 210"><path d="{MAP}"/><circle cx="121.8" cy="70" r="26"/><circle cx="81.8" cy="50" r="20"/><circle cx="125" cy="33" r="16"/><circle class="d" cx="121.8" cy="70" r="3.4"/><circle class="d" cx="81.8" cy="50" r="3.4"/><circle class="d" cx="125" cy="33" r="3.4"/></svg><div class="shtp"><small>Zones de la campagne</small><strong>Exemple</strong><div class="tags">{CH("Bruxelles","Gand","Anvers")}</div></div></div>'),
    ('Vos kilomètres','Les kilomètres validés, par zone et par période, pour comparer une ville à une autre.',f'<div class="pscr">{BAR}<small>Cette semaine</small><strong class="h">Kilomètres</strong><svg class="line" viewBox="0 0 200 110" preserveAspectRatio="none"><path class="ar" d="M0 92C24 88 30 60 54 62s34 16 56-4 30-36 52-34 26 2 38-6V110H0z"/><path class="ln2" d="M0 92C24 88 30 60 54 62s34 16 56-4 30-36 52-34 26 2 38-6"/></svg><div class="days"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div><ul class="lst"><li>Bruxelles<u style="--w:70%"></u></li><li>Gand<u style="--w:48%"></u></li><li>Anvers<u style="--w:34%"></u></li></ul></div>'),
    ('Vos indicateurs','Une portée présentée comme une estimation, avec un rapport à garder et à partager.',f'<div class="pscr">{BAR}<small>Indicatif</small><strong class="h">Portée estimée</strong><div class="ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44"/><circle class="v" cx="50" cy="50" r="44" pathLength="100"/></svg></div><div class="pbtn">Voir le rapport</div></div>'),
    ('Ce que vous consultez','Zones, kilomètres, photos de preuve et bilan. Uniquement ce qui est réellement mesuré.',f'<div class="pscr">{BAR}<small>Disponible</small><strong class="h">Mon suivi</strong><ul class="chk"><li class="ok">Zones parcourues</li><li class="ok">Kilomètres validés</li><li class="ok">Photos de preuve</li><li class="ok">Bilan de campagne</li></ul></div>')]
PH=lambda inner:f'<div class="ph" aria-hidden="true"><div class="sc">{inner}</div></div>'
screens=''.join(f'<div class="ps">{h}</div>' for _,_,h in SC)
rows=''.join(f'<li><b>{t}</b><span>{d}</span></li>' for t,d,_ in SC)
AX=lambda n,c:f'''<section class="ax {c}" data-v="{n}"><div class="stg"><div class="at"><p class="eye">Espace annonceur</p><h2 class="big">Votre campagne, vos zones, dans votre poche</h2><ol class="ro">{rows}</ol><p class="fine dem">Aperçu de démonstration, sans données réelles. L'espace annonceur est en préparation.</p></div>{PH(screens+'<i class="tap"></i>')}</div></section>'''
A1=AX(1,'lt');A2=AX(2,'dk')
t=(ROOT/'src/site_index.html').read_text()
for k,v in (('HERO',HERO),('CONCEPT',CONCEPT),('FORMATS',[F2]),('EXPERTISE',[E1,E2]),('APP',[A1,A2])):
    t=t.replace('{{'+k+'}}','\n'.join(v))
(ROOT/'site/index.html').write_text(t)
# Pages secondaires : mêmes en-tête et pied de page que la homepage
head=t[:t.index('<main id="top">')]
endw=t[t.index('<footer id="conducteur">'):t.index('</footer>')+9]
def fix(h):
    for a,b in (('../shared/','../../shared/'),('href="site.css"','href="../site.css"'),('../premium-v2/','../../premium-v2/'),('href="#','href="../#'),('href="demande/','href="../demande/'),('href="conducteur/','href="../conducteur/')):
        h=h.replace(a,b)
    return h
def page(slug,title,desc,body,js):
    h=fix(head).replace('<title>roam · Publicité sur véhicules</title>',f'<title>{title} · roam</title>')
    h=re.sub(r'<meta name="description" content="[^"]*">',f'<meta name="description" content="{desc}">',h)
    h=h.replace('<a href="#top" class','<a href="../" class').replace('class="logo" href="../#top"','class="logo" href="../"')
    d=ROOT/'site'/slug;d.mkdir(exist_ok=True)
    (d/'index.html').write_text(h+f'<main id="top">{body}</main>\n'+fix(endw).replace('href="../#top"','href="../"')+f'\n<script src="../vendor/gsap.min.js"></script><script src="../vendor/ScrollTrigger.min.js"></script><script src="../../shared/site.js"></script><script src="../../shared/config.js"></script><script src="../forms.js"></script>{js}\n</body>\n</html>\n')
exec((ROOT/'src/pages.py').read_text())
