# Génère la maquette blanche : page d'accueil et une page par campagne.
import pathlib
ROOT=pathlib.Path(__file__).resolve().parent.parent
SITE=ROOT/'site'
C=[('arcs','Arcs','Grandes formes','Familiale','SUV compact','Complet','De grands arcs suivent les lignes du véhicule, du capot au hayon.',['c1','c1b','c1c']),
   ('vague','Vague','Formes organiques','Citadine','Citadine','Complet','Une vague continue traverse toute la carrosserie.',['c2','c2b','c2c']),
   ('cadence','Cadence','Rythme graphique','Utilitaire','Petit utilitaire','Complet','Des bandes qui s\'épaississent de l\'avant vers l\'arrière.',['c3','c3b','c3c']),
   ('degrade','Dégradé','Couleur','Citadine','Citadine','Complet','Un dégradé doux, de l\'arrière vers l\'avant.',['c4','c4b','c4c']),
   ('mosaique','Mosaïque','Géométrie','Familiale','SUV compact','Complet','Des tuiles alignées sur les lignes de la carrosserie.',['c5','c5b','c5c']),
   ('diagonales','Diagonales','Lignes','Utilitaire','Petit utilitaire','Complet','Des diagonales franches sur un fond blanc.',['c6','c6b','c6c'])]
tiles=''.join(f'<a class="tile" data-g="{c[3]}" href="campagnes/{c[0]}/"><img loading="lazy" src="img/{c[7][0]}.webp" alt="Campagne {c[1]}" width="1600" height="896"><span><b>{c[1]}</b>{c[2]}</span></a>' for c in C)
t=(ROOT/'src/site_index.html').read_text().replace('{{TILES}}',tiles)
(SITE/'index.html').write_text(t)
HEAD=t[:t.index('</head>')].replace('href="site.css"','href="../../site.css"').replace('../shared/','../../../shared/').replace('<title>roam · Publicité sur véhicules</title>','<title>{title} · roam</title>')
PAL=t[t.index('<div class="pal"'):t.index('<script>window.SITE_T')]
for i,c in enumerate(C):
    n=C[(i+1)%len(C)]
    a,b,d=c[7]
    (SITE/f'campagnes/{c[0]}').mkdir(parents=True,exist_ok=True)
    (SITE/f'campagnes/{c[0]}/index.html').write_text(HEAD.replace('{title}',c[1])+f'''</head>
<body>
<header class="bar"><a class="logo" href="../../" aria-label="roam, retour à l'accueil"><i></i>roam</a><div class="acts"><a class="btn sm" href="../../#contact">Créer ma campagne</a></div></header>
<main class="cp">
  <a class="back" href="../../#campagnes">← Toutes les campagnes</a>
  <p class="eye">{c[2]}</p>
  <h1>{c[1]}</h1>
  <p class="lead">{c[6]}</p>
  <img class="big" src="../../img/{a}.webp" alt="Campagne {c[1]} sur le véhicule" width="2400" height="1344">
  <div class="duo"><img loading="lazy" src="../../img/{b}.webp" alt="Campagne {c[1]}, autre vue" width="1344" height="1008"><img loading="lazy" src="../../img/{d}.webp" alt="Campagne {c[1]}, détail" width="1344" height="1008"></div>
  <dl class="meta"><div><dt>Véhicule</dt><dd>{c[4]}</dd></div><div><dt>Format</dt><dd>{c[5]}</dd></div><div><dt>Statut</dt><dd>Démonstration, sans marque ni client</dd></div></dl>
  <a class="next" href="../{n[0]}/"><span>Campagne suivante</span>{n[1]} →</a>
</main>
{PAL}<script src="../../app.js"></script>
</body>
</html>
''')
